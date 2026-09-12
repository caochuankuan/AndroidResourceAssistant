'use strict';

const API_BASE = '/api';
const CLAIM_KEYS = ['1', '2', '3', '4', '5', '6'];
const ASCII = /^[\x21-\x7E]+$/;
const $ = id => document.getElementById(id);
const form = $('claimForm');
const prefix = $('prefix');
const count = $('count');
const password = $('password');
const concurrency = $('concurrency');
const accessCode = $('accessCode');
const resultBody = $('resultBody');
const startButton = $('startButton');
const stopButton = $('stopButton');
const retryButton = $('retryButton');
const toast = $('toast');
let accounts = [];
let running = false;
let controller;
let toastTimer;

function toastMessage(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('show'); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600); }
function stage() { return { state: 'pending', text: '等待' }; }
function makeAccount(username, index) { return { username, index, login: stage(), claims: Object.fromEntries(CLAIM_KEYS.map(key => [key, stage()])), result: 'pending', finished: false, token: '' }; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function stageHtml(item) { return `<span class="status status-${item.state}" title="${escapeHtml(item.detail || '')}">${escapeHtml(item.text)}</span>`; }
function resultHtml(item) { const success = item.result === 'success'; return `<span class="result-pill result-${success ? 'success' : item.result === 'running' ? 'running' : 'error'}">${success ? '全部成功' : item.result === 'running' ? '处理中' : item.result === 'stopped' ? '已停止' : item.result === 'pending' ? '等待' : '有失败项'}</span>`; }
function render() { resultBody.innerHTML = accounts.map(item => `<tr id="account-${item.index}"><td>${String(item.index).padStart(2, '0')}</td><td><span class="account-name">${escapeHtml(item.username)}</span></td><td data-cell="login">${stageHtml(item.login)}</td>${CLAIM_KEYS.map(key => `<td data-cell="claim-${key}">${stageHtml(item.claims[key])}</td>`).join('')}<td data-cell="result">${resultHtml(item)}</td></tr>`).join(''); updateStats(); }
function renderAccount(item) { const row = $(`account-${item.index}`); if (!row) return; row.querySelector('[data-cell="login"]').innerHTML = stageHtml(item.login); CLAIM_KEYS.forEach(key => { row.querySelector(`[data-cell="claim-${key}"]`).innerHTML = stageHtml(item.claims[key]); }); row.querySelector('[data-cell="result"]').innerHTML = resultHtml(item); updateStats(); }
function updateStats() { const done = accounts.filter(item => item.finished).length; $('completedCount').textContent = done; $('totalCount').textContent = accounts.length; $('successCount').textContent = accounts.filter(item => item.result === 'success').length; $('failureCount').textContent = accounts.filter(item => item.finished && item.result !== 'success').length; $('progressBar').style.width = accounts.length ? `${done / accounts.length * 100}%` : '0%'; }
function set(item, state, text, detail = '') { Object.assign(item, { state, text, detail }); }
function operationId() { return `cloud_nest_claim_${Date.now().toString(36)}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`; }
async function request(path, payload, signal) {
  const response = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), cache: 'no-store', signal });
  const raw = await response.text(); let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error(`服务器返回了非 JSON 内容（HTTP ${response.status}）`); }
  if (!response.ok || !data.ok) throw new Error(data.msg || `请求失败（HTTP ${response.status}）`);
  return data;
}
async function processAccount(item, signal) {
  item.finished = false; item.result = 'running';
  try {
    if (item.login.state !== 'success') { set(item.login, 'running', '登录中'); renderAccount(item); const result = await request('/login', { username: item.username, password: password.value }, signal); item.token = result.token; set(item.login, 'success', '登录成功'); }
  } catch (error) { set(item.login, signal.aborted ? 'pending' : 'error', signal.aborted ? '已停止' : '登录失败', error.message); item.result = signal.aborted ? 'stopped' : 'error'; item.finished = true; renderAccount(item); return; }
  for (const key of CLAIM_KEYS) {
    if (signal.aborted) break;
    const current = item.claims[key]; if (current.state === 'success') continue;
    set(current, 'running', '领取中'); renderAccount(item);
    try { const result = await request('/cloud-nest/claim', { token: item.token, claim_type: 'server_stage', claim_key: key, operation_id: operationId() }, signal); set(current, 'success', '成功', result.msg || '领取成功'); }
    catch (error) { set(current, signal.aborted ? 'pending' : 'error', signal.aborted ? '已停止' : '失败', error.message); }
    renderAccount(item);
  }
  item.finished = true; item.result = CLAIM_KEYS.every(key => item.claims[key].state === 'success') ? 'success' : signal.aborted ? 'stopped' : 'error'; renderAccount(item);
}
async function run(targets) {
  controller = new AbortController(); running = true; startButton.disabled = true; stopButton.hidden = false; retryButton.disabled = true; $('runStatus').textContent = '正在执行';
  const queue = [...targets]; const workers = Array.from({ length: Math.min(Number(concurrency.value), queue.length) }, async () => { while (queue.length && !controller.signal.aborted) await processAccount(queue.shift(), controller.signal); });
  await Promise.all(workers); queue.forEach(item => { item.finished = true; item.result = 'stopped'; renderAccount(item); }); running = false; startButton.disabled = false; stopButton.hidden = true; retryButton.disabled = !accounts.some(item => item.result !== 'success'); $('runStatus').textContent = controller.signal.aborted ? '已停止' : '执行完成'; toastMessage(controller.signal.aborted ? '任务已停止' : '批量领取完成');
}
function validAccess() { if (accessCode.value.trim().toUpperCase() === getDailyAccessCode()) return true; toastMessage('每日访问密码错误'); accessCode.focus(); return false; }
function setInputs(disabled) { [prefix, count, password, concurrency, accessCode].forEach(input => { input.disabled = disabled; }); }
prefix.addEventListener('input', () => { const value = prefix.value.trim() || 'account'; $('namePreview').textContent = `将处理 ${value}1、${value}2、${value}3…`; });
form.addEventListener('submit', event => { event.preventDefault(); if (running || !form.reportValidity() || !validAccess()) return; const name = prefix.value.trim(); const total = Number(count.value); if (!ASCII.test(name) || !ASCII.test(password.value) || password.value.length < 6 || password.value.length > 32) return toastMessage('账号开头和密码只能使用 6–32 位可见 ASCII 字符'); const usernames = Array.from({ length: total }, (_, index) => `${name}${index + 1}`); const invalid = usernames.find(item => item.length < 6 || item.length > 20); if (invalid) return toastMessage(`生成的账号 ${invalid} 不符合 6–20 位要求`); accounts = usernames.map((item, index) => makeAccount(item, index + 1)); render(); setInputs(true); $('resultsPanel').scrollIntoView({ behavior: 'smooth' }); run(accounts).finally(() => setInputs(false)); });
stopButton.addEventListener('click', () => { if (controller && running) { stopButton.disabled = true; controller.abort(); $('runStatus').textContent = '正在停止'; } });
retryButton.addEventListener('click', () => { if (!validAccess()) return; const targets = accounts.filter(item => item.result !== 'success'); targets.forEach(item => { item.finished = false; item.result = 'pending'; if (item.login.state === 'error') set(item.login, 'pending', '等待重试'); CLAIM_KEYS.forEach(key => { if (item.claims[key].state === 'error') set(item.claims[key], 'pending', '等待重试'); }); renderAccount(item); }); setInputs(true); run(targets).finally(() => setInputs(false)); });
updateStats();
