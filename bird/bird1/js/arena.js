let users = [];
let arenaTimer = null;
let totalFights = 0;
let totalWins = 0;
let arenaRunning = false; // 循环运行标志

// 页面加载初始化
document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
    populateUserSelect();
});

// 从 localStorage 加载用户（与 user-manage 共用同一份数据）
function loadUsers() {
    const saved = localStorage.getItem('bird1_users');
    if (saved) {
        users = JSON.parse(saved);
    }
}

// 填充用户下拉框
function populateUserSelect() {
    const sel = document.getElementById('userSelect');
    sel.innerHTML = '<option value="">请选择用户</option>';
    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.name;
        sel.appendChild(opt);
    });
}

// 获取当前选中用户
function getSelectedUser() {
    const id = document.getElementById('userSelect').value;
    if (!id) {
        addLog('请先选择用户', 'warning');
        return null;
    }
    return users.find(u => u.id === id) || null;
}

// ===================== 竞技场 API =====================

// JSONP 请求封装
function jsonp(url, callbackName) {
    return new Promise((resolve, reject) => {
        // 清理上一次同名回调
        if (window[callbackName]) {
            delete window[callbackName];
        }
        const script = document.createElement('script');
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('JSONP 请求超时'));
        }, 10000);

        function cleanup() {
            clearTimeout(timer);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function (data) {
            cleanup();
            resolve(data);
        };

        script.onerror = function () {
            cleanup();
            reject(new Error('JSONP 请求失败，请检查网络'));
        };

        script.src = url;
        document.head.appendChild(script);
    });
}

// 获取竞技场列表
async function fetchArenaList(user, ps = 12) {
    const cb = 'jcb_33';
    const now = Date.now();
    const url = `https://m.abird.top/gs/s1/api/fight/arena.do?sso=${encodeURIComponent(user.sso)}&ps=${ps}&v_now=${now}&_=${now}&jcb=${cb}`;
    const data = await jsonp(url, cb);
    if (data.code !== 0) throw new Error('接口返回错误: code=' + data.code);
    return data;
}

// 发起竞技场战斗
async function doFight(user, targetU) {
    const cb = 'jcb_25';
    const now = Date.now();
    const url = `https://m.abird.top/gs/s1/api/fight/fight.do?sso=${encodeURIComponent(user.sso)}&vk=&f=${encodeURIComponent(targetU)}&v_now=${now}&_=${now}&jcb=${cb}`;
    return await jsonp(url, cb);
}

// 恢复竞技场战斗次数
async function renewFight(user) {
    const cb = 'jcb_49';
    const now = Date.now();
    const url = `https://m.abird.top/gs/s1/api/fight/renew.do?sso=${encodeURIComponent(user.sso)}&vk=&pid=32&v_now=${now}&_=${now}&jcb=${cb}`;
    return await jsonp(url, cb);
}

async function startArena() {
    const user = getSelectedUser();
    if (!user) return;

    const rankInput = document.getElementById('targetRank').value.trim();
    // 留空代表最后一个，用 -1 作为标记；否则转成 1-based 下标
    const targetRankValue = rankInput === '' ? -1 : parseInt(rankInput, 10);

    if (rankInput !== '' && (isNaN(targetRankValue) || targetRankValue < 1)) {
        addLog('请输入有效的序号（≥1）', 'warning');
        return;
    }

    const intervalSec = parseFloat(document.getElementById('fightInterval').value) || 5;

    // 更新 UI 状态
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    const rankLabel = targetRankValue === -1 ? '最后一个' : `第 ${targetRankValue} 个`;
    setStatus(`循环中 · 用户: ${user.name} · 目标: ${rankLabel} · 间隔: ${intervalSec}s`, 'running');

    totalFights = 0;
    totalWins = 0;
    updateFightCount();

    addLog(`▶ 开始循环竞技场 — 用户: ${user.name}，目标: ${rankLabel}，间隔: ${intervalSec}s`, 'info');

    arenaRunning = true;

    // 递归循环：执行完再等间隔，避免请求耗时叠加
    async function loop() {
        if (!arenaRunning) return;
        const start = Date.now();
        await runOnce(user, targetRankValue);
        if (!arenaRunning) return;
        // 用掉的时间已包含战斗+刷新，剩余时间补足间隔
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, intervalSec * 1000 - elapsed);
        arenaTimer = setTimeout(loop, remaining);
    }

    loop();
}

async function runOnce(user, targetRankValue) {
    try {
        // 1. 拉取排行榜
        const data = await fetchArenaList(user);

        // 留空（-1）取最后一个，否则按 1-based 下标取列表元素
        let target;
        if (targetRankValue === -1) {
            target = data.list[data.list.length - 1];
        } else {
            target = data.list[targetRankValue - 1]; // 输入1 → 下标0
        }

        renderRankList(data.list, target ? target.r : -1);

        if (!target) {
            addLog(`⚠️ 列表中没有第 ${targetRankValue} 个，当前榜单共 ${data.list.length} 条`, 'warning');
            return;
        }

        addLog(`⚔️ 准备挑战 [${target.r + 1}] ${target.n}（积分: ${target.s}）`, 'info');

        // 2. 发起战斗
        const result = await doFight(user, target.u);

        totalFights++;

        if (result.code === 0) {
            const win = result.win === true;
            if (win) {
                totalWins++;
                addLog(`✅ 胜利！对手: ${target.n}  ${result.fightJSON?.cont ?? ''}  奖励: ${result.reward ?? ''}`, 'success');
            } else {
                addLog(`❌ 失败  对手: ${target.n}  ${result.fightJSON?.cont ?? ''}`, 'error');
            }
        } else if (result.code === 2) {
            // 战斗次数不足，先尝试恢复一次
            addLog(`⚠️ 战斗次数不足，尝试恢复...`, 'warning');
            try {
                const renew = await renewFight(user);
                if (renew.code === 0) {
                    addLog(`🔋 恢复成功：${renew.msg}，重试战斗...`, 'success');
                    // 重试一次战斗
                    const retry = await doFight(user, target.u);
                    totalFights++;
                    if (retry.code === 0) {
                        const win = retry.win === true;
                        if (win) {
                            totalWins++;
                            addLog(`✅ 胜利！对手: ${target.n}  ${retry.fightJSON?.cont ?? ''}  奖励: ${retry.reward ?? ''}`, 'success');
                        } else {
                            addLog(`❌ 失败  对手: ${target.n}  ${retry.fightJSON?.cont ?? ''}`, 'error');
                        }
                    } else {
                        // 恢复后重试仍然失败，判断是否明确不足
                        addLog(`⚠️ 重试失败: code=${retry.code} msg=${retry.msg || ''}`, 'warning');
                        if (/不足|不够|次数/.test(retry.msg || '')) {
                            addLog('🛑 战斗次数耗尽，自动停止循环', 'error');
                            stopArena();
                        }
                    }
                } else {
                    addLog(`🛑 恢复失败: ${renew.msg || ''}，自动停止循环`, 'error');
                    stopArena();
                }
            } catch (e) {
                addLog(`🛑 恢复请求出错: ${e.message}，自动停止循环`, 'error');
                stopArena();
            }
        } else {
            addLog(`⚠️ 战斗接口返回异常: code=${result.code} msg=${result.msg || ''}`, 'warning');
            // msg 中含明确不足提示时停止
            if (/不足|不够|次数/.test(result.msg || '')) {
                addLog('🛑 战斗资源耗尽，自动停止循环', 'error');
                stopArena();
            }
        }

        updateFightCount();

        // 3. 战斗完成后重新获取列表刷新排行榜
        try {
            const refreshData = await fetchArenaList(user);
            let refreshTarget;
            if (targetRankValue === -1) {
                refreshTarget = refreshData.list[refreshData.list.length - 1];
            } else {
                refreshTarget = refreshData.list[targetRankValue - 1];
            }
            renderRankList(refreshData.list, refreshTarget ? refreshTarget.r : -1);
        } catch (e) {
            // 刷新失败不影响主流程
        }

    } catch (err) {
        addLog(`💥 执行出错: ${err.message}`, 'error');
    }
}

function stopArena() {
    arenaRunning = false;
    if (arenaTimer) {
        clearTimeout(arenaTimer);
        arenaTimer = null;
    }
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    setStatus('已停止', 'stopped');
    addLog('■ 循环已停止', 'warning');
}

// ===================== 排行榜渲染 =====================

function renderRankList(list, targetRank) {
    const area = document.getElementById('rankArea');
    const rankList = document.getElementById('rankList');
    const updateTime = document.getElementById('rankUpdateTime');

    area.style.display = 'block';
    updateTime.textContent = '更新于 ' + new Date().toLocaleTimeString();

    rankList.innerHTML = list.map(item => `
        <div class="rank-item ${item.r === targetRank ? 'rank-target' : ''}">
            <span class="rank-no">${item.r + 1}</span>
            <span class="rank-name">${escapeHtml(item.n)}</span>
            <span class="rank-score">${item.s} 分</span>
            ${item.r === targetRank ? '<span class="rank-tag">目标</span>' : ''}
        </div>
    `).join('');
}

// ===================== 工具函数 =====================

function setStatus(text, state) {
    const bar = document.getElementById('statusBar');
    const txt = document.getElementById('statusText');
    txt.textContent = text;
    bar.className = 'status-bar status-' + state;
}

function updateFightCount() {
    document.getElementById('fightCount').textContent =
        totalFights > 0 ? `共战斗 ${totalFights} 次 · 胜利 ${totalWins} 次` : '';
}

function addLog(message, type = 'info') {
    const output = document.getElementById('outputContent');
    if (output.classList.contains('empty')) {
        output.classList.remove('empty');
        output.textContent = '';
    }
    const time = new Date().toLocaleTimeString();
    const span = document.createElement('span');
    span.className = type;
    span.textContent = `[${time}] ${message}\n`;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    const output = document.getElementById('outputContent');
    output.innerHTML = '';
    output.classList.add('empty');
    output.textContent = '等待开始...';
    totalFights = 0;
    totalWins = 0;
    updateFightCount();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
