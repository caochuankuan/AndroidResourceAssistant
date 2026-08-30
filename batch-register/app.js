'use strict';

const API_BASE = '/api';
const REDEEM_CODES = ['再见小鸟', 'VIP8888', 'VIP2345'];
const VISIBLE_ASCII_PATTERN = /^[\x21-\x7E]+$/;

const form = document.getElementById('registerForm');
const prefixInput = document.getElementById('prefix');
const countInput = document.getElementById('count');
const passwordInput = document.getElementById('password');
const concurrencyInput = document.getElementById('concurrency');
const namePreview = document.getElementById('namePreview');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const retryButton = document.getElementById('retryButton');
const exportButton = document.getElementById('exportButton');
const togglePassword = document.getElementById('togglePassword');
const resultBody = document.getElementById('resultBody');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const successCount = document.getElementById('successCount');
const failureCount = document.getElementById('failureCount');
const progressBar = document.getElementById('progressBar');
const runStatus = document.getElementById('runStatus');
const elapsedTime = document.getElementById('elapsedTime');
const toast = document.getElementById('toast');

let accounts = [];
let isRunning = false;
let runController = null;
let startedAt = 0;
let timerId = null;
let toastId = null;

function updatePreview() {
  const prefix = prefixInput.value.trim() || 'account';
  namePreview.textContent = `将生成 ${prefix}1、${prefix}2、${prefix}3…`;
}

function showToast(message) {
  clearTimeout(toastId);
  toast.textContent = message;
  toast.classList.add('show');
  toastId = setTimeout(() => toast.classList.remove('show'), 2600);
}

function makeStage() {
  return { state: 'pending', text: '等待', detail: '' };
}

function createAccount(username, index) {
  return {
    index,
    username,
    uid: '',
    token: '',
    saveVersion: '',
    flow: makeStage(),
    register: makeStage(),
    login: makeStage(),
    save: makeStage(),
    redeems: Object.fromEntries(REDEEM_CODES.map(code => [code, makeStage()])),
    result: 'pending',
    finished: false,
  };
}

function stageMarkup(stage) {
  const title = stage.detail ? ` title="${escapeHtml(stage.detail)}"` : '';
  return `<span class="status status-${stage.state}"${title}>${escapeHtml(stage.text)}</span>`;
}

function resultMarkup(account) {
  const labels = {
    pending: ['等待', 'pending'],
    running: ['处理中', 'running'],
    success: ['全部成功', 'success'],
    error: ['有失败项', 'error'],
    stopped: ['已停止', 'pending'],
  };
  const [text, state] = labels[account.result] || labels.pending;
  return `<span class="result-pill result-${state}">${text}</span>`;
}

function renderRows() {
  if (!accounts.length) return;
  resultBody.innerHTML = accounts.map(account => `
    <tr id="account-${account.index}">
      <td>${String(account.index).padStart(2, '0')}</td>
      <td><span class="account-name">${escapeHtml(account.username)}</span></td>
      <td data-cell="flow">${stageMarkup(account.flow)}</td>
      ${REDEEM_CODES.map(code => `<td data-cell="${escapeHtml(code)}">${stageMarkup(account.redeems[code])}</td>`).join('')}
      <td data-cell="result">${resultMarkup(account)}</td>
    </tr>`).join('');
}

function renderAccount(account) {
  const row = document.getElementById(`account-${account.index}`);
  if (!row) return;
  row.querySelector('[data-cell="flow"]').innerHTML = stageMarkup(account.flow);
  REDEEM_CODES.forEach(code => {
    row.querySelector(`[data-cell="${code}"]`).innerHTML = stageMarkup(account.redeems[code]);
  });
  row.querySelector('[data-cell="result"]').innerHTML = resultMarkup(account);
  updateStats();
}

function updateStats() {
  const completed = accounts.filter(item => item.finished).length;
  const success = accounts.filter(item => item.result === 'success').length;
  const failed = accounts.filter(item => item.finished && item.result !== 'success').length;
  completedCount.textContent = completed;
  totalCount.textContent = accounts.length;
  successCount.textContent = success;
  failureCount.textContent = failed;
  progressBar.style.width = accounts.length ? `${(completed / accounts.length) * 100}%` : '0%';
}

function setStage(stage, state, text, detail = '') {
  Object.assign(stage, { state, text, detail });
}

function setFlowFromSteps(account) {
  const steps = [account.register, account.login, account.save];
  const failed = steps.find(step => step.state === 'error');
  const running = steps.find(step => step.state === 'running');
  if (failed) setStage(account.flow, 'error', failed.text, failed.detail);
  else if (running) setStage(account.flow, 'running', running.text, running.detail);
  else if (steps.every(step => step.state === 'success')) setStage(account.flow, 'success', '注册并初始化成功');
  else setStage(account.flow, 'pending', '等待');
}

function setRunningUi(running) {
  isRunning = running;
  startButton.disabled = running;
  stopButton.hidden = !running;
  stopButton.disabled = false;
  retryButton.disabled = running || !accounts.some(item => item.result !== 'success');
  exportButton.disabled = running || !accounts.length;
  prefixInput.disabled = running;
  countInput.disabled = running;
  passwordInput.disabled = running;
  concurrencyInput.disabled = running;
  runStatus.textContent = running ? '正在执行' : accounts.length ? '任务结束' : '等待开始';
}

function updateElapsed() {
  if (!startedAt) return;
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  elapsedTime.textContent = `耗时 ${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

async function apiRequest(path, payload, outerSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException('请求超时', 'TimeoutError')), 20000);
  const abortFromOuter = () => controller.abort(outerSignal.reason);
  outerSignal.addEventListener('abort', abortFromOuter, { once: true });
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: controller.signal,
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; }
    catch { throw new Error(`服务器返回了非 JSON 内容（HTTP ${response.status}）`); }
    if (!response.ok || !data.ok) throw new Error(data.msg || `请求失败（HTTP ${response.status}）`);
    return data;
  } catch (error) {
    if (outerSignal.aborted) throw new DOMException('任务已停止', 'AbortError');
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw new Error('请求超时，请稍后重试');
    if (error instanceof TypeError) throw new Error('无法连接接口，请检查网络、CORS 或 HTTPS 混合内容限制');
    throw error;
  } finally {
    clearTimeout(timeout);
    outerSignal.removeEventListener('abort', abortFromOuter);
  }
}

function makeInitialSave(username, uid) {
  return {
    用户名: username, 创建时间: new Date().toISOString(), 称号: '', 称号列表: [], 鸟种称号记录: {},
    等级: 1, 进度: 0, 金币: 10000, 存款: 0, 存款额度: 10000, 元宝: 0, 爱心: 0, 鲜花: 0,
    爱人: '无', 师父: null, 徒弟列表: [], 师徒请求列表: [], 师徒评价记录: [], 当前场景名称: '彩虹树林', UID: String(uid),
    VIP积分: 0, VIP等级: 0, VIP礼包领取记录: {}, VIP每日福利记录: {}, 银行升级次数: 0, 总胜场: 0, 总负场: 0,
    心情短语: '', 性别: '男', 头像: '', 头像框: '', 头像框列表: [], 公会ID: null, 公会名: '暂无公会', 公会职位: '',
    公会福利加成: {}, 公会势力加成: { 捕捉速度: 0 }, 生效效果列表: [],
    场景列表: [
      { id: 'rainbow', 名称: '彩虹树林', 图标: '/assets/img/allin/场景1.gif' },
      { id: 'fly', 名称: '飞翔岛屿', 图标: '/assets/img/allin/场景2.gif' },
      { id: 'grass', 名称: '惊厥草原', 图标: '/assets/img/allin/场景3.gif' },
      { id: 'cave', 名称: '时光洞穴', 图标: '/assets/img/allin/场景4.gif' },
      { id: 'garden', 名称: '梦想花园', 图标: '/assets/img/allin/场景5.gif' },
      { id: 'cloud', 名称: '云巅仙境', 图标: '/assets/img/allin/场景6.png' },
    ],
    背包物品列表: [], 总容量: 3000, 最近下饵饵料名称: '',
    当前笼位: [
      { 笼子ID: 'bamboo_1', 饵料: null, 鸟种: null, 剩余倒计时: 0, 捕获结束时间: null, 状态: '空闲' },
      { 笼子ID: 'bamboo_2', 饵料: null, 鸟种: null, 剩余倒计时: 0, 捕获结束时间: null, 状态: '空闲' },
    ],
    笼子列表: [
      { id: 'bamboo_1', 名称: '竹笼', 图标: '/assets/img/shop/竹笼.gif', 描述: '用青竹编成的基础鸟笼，适合捕捉林间小鸟。', 作用: '基础鸟笼，无耐久限制。', 效果: null, 总次数: null, 剩余次数: null },
      { id: 'bamboo_2', 名称: '竹笼', 图标: '/assets/img/shop/竹笼.gif', 描述: '用青竹编成的基础鸟笼，适合捕捉林间小鸟。', 作用: '基础鸟笼，无耐久限制。', 效果: null, 总次数: null, 剩余次数: null },
    ],
    陷阱: [], 祝福记录: [], 笼位强化等级: [0, 0],
    场景捕鸟数据: { activeScene: '彩虹树林', unlockedScenes: ['彩虹树林'], sceneSlots: {}, guildTower: { enabled: false, slots: [], cages: [], blessings: [], slotEnhanceLevels: [] }, migrationVersion: 1 },
    图鉴记录: {}, 已捕获鸟列表: [], 仓库数据: { 鸟: [], 百鸟林: [], 封神榜: [], 礼物: [], 图鉴: {}, 云羽居: [], 收集品: [] },
    仓库容量配置: { 鸟: { 当前: 0, 最大: 100 }, 百鸟林: { 当前: 0, 最大: 100 } },
    好友留学: [], 任务重置版本: 2, 任务重置前已领取任务奖励: { version: 2, questNos: [], questIds: [] },
    当前任务序号: 1, 已完成任务: [], 是否完成序章: false,
    任务进度记录: { 商店购买次数: 0, 下饵次数: 0, 按场景下饵: {}, 香水使用次数: 0, 香水加速收获次数: 0, NPC战斗完成: false, 配对完成次数: 0 },
    场景任务状态: { activeScene: '彩虹树林', byScene: { 彩虹树林: { currentQuestId: 'forest-001', completedQuestIds: [], claimedQuestIds: [] } }, migrationVersion: 1 },
    每日任务数据: {}, 签到数据: { 累计签到次数: 0, months: {}, 补签卡: null }, 球球: { 已获得: false },
  };
}

async function processAccount(account, password, signal) {
  account.finished = false;
  account.result = 'running';
  try {
    if (account.register.state !== 'success') {
      setStage(account.register, 'running', '正在注册');
      setFlowFromSteps(account); renderAccount(account);
      const registered = await apiRequest('/register', { username: account.username, password }, signal);
      account.uid = registered.uid;
      account.saveVersion = registered.save_version;
      setStage(account.register, 'success', '注册成功', registered.msg || '注册成功');
    }

    if (account.login.state !== 'success') {
      setStage(account.login, 'running', '正在登录');
      setFlowFromSteps(account); renderAccount(account);
      const loggedIn = await apiRequest('/login', { username: account.username, password }, signal);
      account.token = loggedIn.token;
      setStage(account.login, 'success', '登录成功', loggedIn.msg || '登录成功');
    }

    if (account.save.state !== 'success') {
      setStage(account.save, 'running', '正在初始化');
      setFlowFromSteps(account); renderAccount(account);
      const saved = await apiRequest('/save', {
        token: account.token,
        data: makeInitialSave(account.username, account.uid),
        base_version: account.saveVersion,
      }, signal);
      account.saveVersion = saved.save_version || account.saveVersion;
      setStage(account.save, 'success', '初始化成功', saved.msg || '保存成功');
    }
    setFlowFromSteps(account); renderAccount(account);
  } catch (error) {
    const active = [account.register, account.login, account.save].find(step => step.state === 'running');
    if (active) setStage(active, 'error', '流程失败', error.message);
    setFlowFromSteps(account);
    account.result = signal.aborted ? 'stopped' : 'error';
    account.finished = true;
    renderAccount(account);
    return;
  }

  for (const code of REDEEM_CODES) {
    if (signal.aborted) break;
    const stage = account.redeems[code];
    if (stage.state === 'success') continue;
    setStage(stage, 'running', '兑换中');
    renderAccount(account);
    try {
      const redeemed = await apiRequest('/redeem/claim', { token: account.token, code }, signal);
      setStage(stage, 'success', '兑换成功', redeemed.summary || redeemed.msg || '兑换成功');
    } catch (error) {
      setStage(stage, signal.aborted ? 'pending' : 'error', signal.aborted ? '已停止' : '兑换失败', error.message);
    }
    renderAccount(account);
  }

  account.finished = true;
  account.result = REDEEM_CODES.every(code => account.redeems[code].state === 'success') ? 'success' : signal.aborted ? 'stopped' : 'error';
  renderAccount(account);
}

async function runAccounts(targets, password) {
  if (!targets.length) return;
  runController = new AbortController();
  startedAt = Date.now();
  clearInterval(timerId);
  timerId = setInterval(updateElapsed, 1000);
  setRunningUi(true);

  const queue = [...targets];
  const workerCount = Math.min(Number(concurrencyInput.value), queue.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (queue.length && !runController.signal.aborted) {
      const account = queue.shift();
      await processAccount(account, password, runController.signal);
    }
  });

  await Promise.all(workers);
  if (runController.signal.aborted) {
    queue.forEach(account => {
      account.result = 'stopped';
      account.finished = true;
      renderAccount(account);
    });
  }
  clearInterval(timerId);
  updateElapsed();
  const wasStopped = runController.signal.aborted;
  setRunningUi(false);
  runStatus.textContent = wasStopped ? '已停止' : '执行完成';
  showToast(wasStopped ? '任务已停止，可重试未完成账号' : '批量任务执行完成');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (isRunning || !form.reportValidity()) return;
  const prefix = prefixInput.value.trim();
  const count = Number(countInput.value);
  if (!prefix) return showToast('请输入用户名开头');
  if (!Number.isInteger(count) || count < 1 || count > 500) return showToast('注册数量需要在 1 到 500 之间');
  if (!VISIBLE_ASCII_PATTERN.test(prefix)) return showToast('用户名开头只能包含数字、英文字母和符号，不能包含中文或空格');
  if (!VISIBLE_ASCII_PATTERN.test(passwordInput.value) || passwordInput.value.length < 6 || passwordInput.value.length > 32) {
    return showToast('密码必须是 6–32 位数字、英文字母或符号，不能包含中文或空格');
  }
  const usernames = Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
  const invalidUsername = usernames.find(username => username.length < 6 || username.length > 20);
  if (invalidUsername) return showToast(`生成的用户名 ${invalidUsername} 不符合 6–20 位要求`);
  accounts = usernames.map((username, index) => createAccount(username, index + 1));
  renderRows();
  updateStats();
  document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  runAccounts(accounts, passwordInput.value);
});

stopButton.addEventListener('click', () => {
  if (runController && isRunning) {
    stopButton.disabled = true;
    runStatus.textContent = '正在停止';
    runController.abort(new DOMException('用户停止任务', 'AbortError'));
  }
});

retryButton.addEventListener('click', () => {
  const targets = accounts.filter(account => account.result !== 'success');
  targets.forEach(account => {
    account.finished = false;
    account.result = 'pending';
    [account.register, account.login, account.save].forEach(stage => {
      if (stage.state === 'error') setStage(stage, 'pending', '等待重试');
    });
    REDEEM_CODES.forEach(code => {
      if (account.redeems[code].state !== 'success') setStage(account.redeems[code], 'pending', '等待重试');
    });
    setFlowFromSteps(account);
    renderAccount(account);
  });
  runAccounts(targets, passwordInput.value);
});

togglePassword.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePassword.setAttribute('aria-label', showing ? '显示密码' : '隐藏密码');
  togglePassword.title = showing ? '显示密码' : '隐藏密码';
});

exportButton.addEventListener('click', () => {
  const header = ['序号', '账号', '基础流程', ...REDEEM_CODES, '最终结果'];
  const rows = accounts.map(account => [
    account.index, account.username, account.flow.text,
    ...REDEEM_CODES.map(code => `${account.redeems[code].text}${account.redeems[code].detail ? `：${account.redeems[code].detail}` : ''}`),
    account.result === 'success' ? '全部成功' : account.result === 'stopped' ? '已停止' : '有失败项',
  ]);
  const csv = '\uFEFF' + [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `批量注册结果-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

prefixInput.addEventListener('input', updatePreview);
countInput.addEventListener('input', updatePreview);
window.addEventListener('beforeunload', event => {
  if (!isRunning) return;
  event.preventDefault();
  event.returnValue = '';
});
updatePreview();
