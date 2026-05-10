let users = [];
let guildWarRunning = false;

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    populateUserCheckboxList();
    updateStartButtonState();
});

function goBack() {
    guildWarRunning = false;
    window.location.href = '../index.html';
}

function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

function populateUserCheckboxList() {
    const list = document.getElementById('userCheckboxList');
    list.innerHTML = '';

    if (users.length === 0) {
        list.innerHTML = '<span class="checkbox-empty">暂无用户，请先去用户管理添加</span>';
        return;
    }

    users.forEach(user => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = user.id;
        checkbox.addEventListener('change', function() {
            label.classList.toggle('checked', checkbox.checked);
            updateStartButtonState();
        });

        const text = document.createElement('span');
        text.textContent = user.name;

        label.appendChild(checkbox);
        label.appendChild(text);
        list.appendChild(label);
    });
}

function getSelectedUsers() {
    const checked = document.querySelectorAll('#userCheckboxList input[type="checkbox"]:checked');
    const ids = Array.from(checked).map(item => item.value);
    return users.filter(user => ids.includes(user.id));
}

function selectAllUsers() {
    document.querySelectorAll('#userCheckboxList input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.parentElement.classList.add('checked');
    });
    updateStartButtonState();
}

function clearSelectedUsers() {
    document.querySelectorAll('#userCheckboxList input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove('checked');
    });
    updateStartButtonState();
}

function getApiBaseUrl(user) {
    if (user && user.originalUrl) {
        try {
            return new URL(user.originalUrl).origin;
        } catch (error) {
            console.warn('Invalid originalUrl:', user.originalUrl);
        }
    }
    return 'http://82.157.255.108';
}

function updateStartButtonState() {
    const startBtn = document.getElementById('startBtn');
    const selectedUsers = getSelectedUsers();

    if (guildWarRunning) {
        startBtn.disabled = false;
        startBtn.textContent = `停止公会战 (${selectedUsers.length || users.length}个账号运行中)`;
        return;
    }

    if (selectedUsers.length === 0) {
        startBtn.disabled = true;
        startBtn.textContent = '请选择用户后开始';
        return;
    }

    startBtn.disabled = false;
    startBtn.textContent = `开始公会战 (${selectedUsers.length}个账号同时执行)`;
}

function addOutput(message, type = 'info') {
    const outputContent = document.getElementById('outputContent');
    const timestamp = new Date().toLocaleString();

    if (outputContent.classList.contains('empty')) {
        outputContent.classList.remove('empty');
        outputContent.textContent = '';
    }

    const span = document.createElement('span');
    span.className = type;
    span.textContent = `[${timestamp}] ${message}\n`;
    outputContent.appendChild(span);
    outputContent.scrollTop = outputContent.scrollHeight;
}

function clearOutput() {
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    outputContent.classList.add('empty');
    outputContent.textContent = '等待操作...';
}

function getHeaders(user) {
    return {
        'authorization': user.sso,
        'Content-Type': 'application/json'
    };
}

function getRandomizedDelay(baseInterval) {
    const factor = 0.7 + Math.random() * 0.6;
    return Math.max(100, Math.round(baseInterval * factor));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch (error) {
        throw new Error(`响应解析失败: ${text || '空响应'}`);
    }

    return { response, data };
}

function getTargetIndex() {
    const rawValue = document.getElementById('targetIndex').value.trim();
    if (!rawValue) {
        return 1;
    }

    const parsed = parseInt(rawValue, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getFightInterval() {
    const parsed = parseInt(document.getElementById('fightInterval').value, 10);
    return Number.isFinite(parsed) && parsed >= 100 ? parsed : 3000;
}

function getPointsThreshold() {
    const rawValue = document.getElementById('pointsThreshold').value.trim();
    if (!rawValue) {
        return null;
    }

    const parsed = parseInt(rawValue, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getWithdrawAmount() {
    const parsed = parseInt(document.getElementById('withdrawAmount').value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 100000;
}

function getCardCount() {
    const parsed = parseInt(document.getElementById('cardCount').value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function extractAwardPoints(fightData) {
    const awards = fightData?.data?.awards;
    if (!Array.isArray(awards)) {
        return 0;
    }

    return awards.reduce((total, award) => {
        if (award?.type === 'POINTS') {
            return total + (parseInt(award.amount, 10) || 0);
        }
        return total;
    }, 0);
}

async function waitNextRound(userName, baseInterval, reason) {
    const delay = getRandomizedDelay(baseInterval);
    addOutput(`[${userName}] ⏱️ ${reason}，等待 ${delay}ms`, 'info');
    await sleep(delay);
}

async function buyAndUseDenyCard(user, baseInterval) {
    const userName = user.name;
    const baseUrl = getApiBaseUrl(user);
    const headers = getHeaders(user);

    addOutput(`[${userName}] 🎴 达到积分阈值，开始购买免战卡`, 'warning');
    const buyResult = await apiRequest(`${baseUrl}/api/shop/buy/goods?func=PROP&id=39&num=1`, {
        method: 'POST',
        headers
    });

    if (!buyResult.response.ok || buyResult.data?.code !== 200) {
        throw new Error(`购买免战卡失败: ${buyResult.data?.msg || `HTTP ${buyResult.response.status}`}`);
    }
    addOutput(`[${userName}] ✅ 免战卡购买成功`, 'success');

    const useResult = await apiRequest(`${baseUrl}/api/prop/use?id=39`, {
        method: 'POST',
        headers
    });

    if (!useResult.response.ok || useResult.data?.code !== 200) {
        throw new Error(`使用免战卡失败: ${useResult.data?.msg || `HTTP ${useResult.response.status}`}`);
    }
    addOutput(`[${userName}] ✅ 免战卡使用成功`, 'success');

    await waitNextRound(userName, baseInterval * 2, '免战中');

    const undenyResult = await apiRequest(`${baseUrl}/api/fight/undeny`, {
        method: 'GET',
        headers
    });

    if (!undenyResult.response.ok || undenyResult.data?.code !== 200) {
        throw new Error(`取消免战失败: ${undenyResult.data?.msg || `HTTP ${undenyResult.response.status}`}`);
    }
    addOutput(`[${userName}] ✅ 已取消免战，继续下一轮`, 'success');
}

async function cancelDenyIfNeeded(user) {
    const userName = user.name;
    const baseUrl = getApiBaseUrl(user);
    const headers = getHeaders(user);

    addOutput(`[${userName}] 🛡️ 检测到免战，尝试取消免战`, 'warning');
    const undenyResult = await apiRequest(`${baseUrl}/api/fight/undeny`, {
        method: 'GET',
        headers
    });

    if (!undenyResult.response.ok || undenyResult.data?.code !== 200) {
        throw new Error(`取消免战失败: ${undenyResult.data?.msg || `HTTP ${undenyResult.response.status}`}`);
    }

    addOutput(`[${userName}] ✅ 取消免战成功`, 'success');
}

async function withdrawMoneyForFight(user, withdrawAmount) {
    const userName = user.name;
    const baseUrl = getApiBaseUrl(user);
    const headers = getHeaders(user);

    if (withdrawAmount <= 0) {
        addOutput(`[${userName}] ⚠️ 未设置取钱金额，跳过取钱`, 'warning');
        return false;
    }

    addOutput(`[${userName}] 💰 金币不足，尝试取钱 ${withdrawAmount}`, 'warning');
    const withdrawResult = await apiRequest(`${baseUrl}/api/qianzhuang/qk?num=${withdrawAmount}`, {
        method: 'PUT',
        headers
    });

    if (!withdrawResult.response.ok || withdrawResult.data?.code !== 200) {
        throw new Error(`取钱失败: ${withdrawResult.data?.msg || `HTTP ${withdrawResult.response.status}`}`);
    }

    addOutput(`[${userName}] ✅ 取钱成功`, 'success');
    return true;
}

async function useOrBuyRecoveryCard(user, cardCount) {
    const userName = user.name;
    const baseUrl = getApiBaseUrl(user);
    const headers = getHeaders(user);

    addOutput(`[${userName}] 🎴 战斗次数不足，尝试使用恢复卡`, 'warning');
    const useResult = await apiRequest(`${baseUrl}/api/prop/use?id=32`, {
        method: 'POST',
        headers
    });

    if (useResult.response.ok && useResult.data?.code === 200) {
        addOutput(`[${userName}] ✅ 恢复卡使用成功`, 'success');
        return true;
    }

    const useMessage = useResult.data?.msg || '';
    if (useMessage.includes('你没有战斗恢复卡可用')) {
        addOutput(`[${userName}] 🛒 没有恢复卡，尝试购买 ${cardCount} 张`, 'warning');
        const buyResult = await apiRequest(`${baseUrl}/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, {
            method: 'POST',
            headers
        });

        if (!buyResult.response.ok || buyResult.data?.code !== 200) {
            throw new Error(`购买恢复卡失败: ${buyResult.data?.msg || `HTTP ${buyResult.response.status}`}`);
        }

        addOutput(`[${userName}] ✅ 购买恢复卡成功`, 'success');
        const retryUseResult = await apiRequest(`${baseUrl}/api/prop/use?id=32`, {
            method: 'POST',
            headers
        });

        if (!retryUseResult.response.ok || retryUseResult.data?.code !== 200) {
            throw new Error(`使用恢复卡失败: ${retryUseResult.data?.msg || `HTTP ${retryUseResult.response.status}`}`);
        }

        addOutput(`[${userName}] ✅ 恢复卡使用成功`, 'success');
        return true;
    }

    throw new Error(`使用恢复卡失败: ${useMessage || `HTTP ${useResult.response.status}`}`);
}

function logPointsProgress(userName, totalPoints, pointsThreshold) {
    if (pointsThreshold !== null) {
        addOutput(`[${userName}] 📊 当前总积分: ${totalPoints} / 目标积分: ${pointsThreshold}`, totalPoints >= pointsThreshold ? 'success' : 'info');
        return;
    }

    addOutput(`[${userName}] 📊 当前总积分: ${totalPoints} / 目标积分: 未设置`, 'info');
}

async function runGuildWarForUser(user, settings) {
    const userName = user.name;
    const baseUrl = getApiBaseUrl(user);
    const headers = getHeaders(user);

    let round = 0;
    let successCount = 0;
    let failCount = 0;
    let totalPoints = 0;

    addOutput(`\n👤 [${userName}] 开始公会战`, 'info');

    try {
        while (guildWarRunning) {
            round++;

            try {
                addOutput(`[${userName}] 第 ${round} 轮 - 获取对手列表`, 'info');
                const surroundResult = await apiRequest(`${baseUrl}/api/fight/surround`, {
                    method: 'GET',
                    headers
                });

                if (!surroundResult.response.ok || surroundResult.data?.code !== 200) {
                    throw new Error(`获取对手列表失败: ${surroundResult.data?.msg || `HTTP ${surroundResult.response.status}`}`);
                }

                const opponents = Array.isArray(surroundResult.data?.data) ? surroundResult.data.data : [];
                if (opponents.length === 0) {
                    throw new Error('对手列表为空');
                }

                const resolvedIndex = Math.min(settings.targetIndex, opponents.length);
                if (resolvedIndex !== settings.targetIndex) {
                    addOutput(`[${userName}] ⚠️ 第 ${settings.targetIndex} 个对手不存在，改为挑战最后一个(第 ${resolvedIndex} 个)`, 'warning');
                }

                const target = opponents[resolvedIndex - 1];
                addOutput(`[${userName}] 👊 目标 UID ${target.uid}，排名 ${target.rank}，积分 ${target.points}`, 'info');

                let fightResult = await apiRequest(`${baseUrl}/api/fight/fight?uid=${target.uid}`, {
                    method: 'POST',
                    headers
                });

                if (!fightResult.response.ok) {
                    throw new Error(`挑战失败: HTTP ${fightResult.response.status}`);
                }

                if (fightResult.data?.code !== 200) {
                    const fightMessage = fightResult.data?.msg || '未知错误';

                    if (fightMessage.includes('免战')) {
                        addOutput(`[${userName}] ❌ 第 ${round} 轮挑战失败: ${fightMessage}`, 'warning');
                        await cancelDenyIfNeeded(user);
                        fightResult = await apiRequest(`${baseUrl}/api/fight/fight?uid=${target.uid}`, {
                            method: 'POST',
                            headers
                        });
                    } else if (fightMessage.includes('战斗次数不足')) {
                        addOutput(`[${userName}] ❌ 第 ${round} 轮挑战失败: ${fightMessage}`, 'warning');
                        await useOrBuyRecoveryCard(user, settings.cardCount);
                        fightResult = await apiRequest(`${baseUrl}/api/fight/fight?uid=${target.uid}`, {
                            method: 'POST',
                            headers
                        });
                    } else if (fightMessage.includes('金币不足')) {
                        addOutput(`[${userName}] ❌ 第 ${round} 轮挑战失败: ${fightMessage}`, 'warning');
                        await withdrawMoneyForFight(user, settings.withdrawAmount);
                        fightResult = await apiRequest(`${baseUrl}/api/fight/fight?uid=${target.uid}`, {
                            method: 'POST',
                            headers
                        });
                    }
                }

                if (!fightResult.response.ok) {
                    throw new Error(`挑战失败: HTTP ${fightResult.response.status}`);
                }

                if (fightResult.data?.code !== 200) {
                    const fightMessage = fightResult.data?.msg || '未知错误';
                    addOutput(`[${userName}] ❌ 第 ${round} 轮挑战失败: ${fightMessage}`, 'error');

                    if (fightMessage.includes('过期') || fightMessage.includes('登录')) {
                        addOutput(`[${userName}] 🔚 登录已失效，停止该账号`, 'warning');
                        logPointsProgress(userName, totalPoints, settings.pointsThreshold);
                        break;
                    }

                    failCount++;
                    logPointsProgress(userName, totalPoints, settings.pointsThreshold);
                    if (guildWarRunning) {
                        await waitNextRound(userName, settings.baseInterval, '挑战失败后');
                    }
                    continue;
                }

                successCount++;
                const gainedPoints = extractAwardPoints(fightResult.data);
                totalPoints += gainedPoints;
                const isWin = fightResult.data?.data?.win;
                addOutput(`[${userName}] ✅ 第 ${round} 轮挑战成功${isWin === false ? '，但结果为失败' : ''}`, 'success');
                addOutput(`[${userName}] 🏅 本轮获得积分: ${gainedPoints}`, gainedPoints > 0 ? 'success' : 'info');
                logPointsProgress(userName, totalPoints, settings.pointsThreshold);

                if (settings.pointsThreshold !== null && totalPoints >= settings.pointsThreshold) {
                    addOutput(`[${userName}] 🎯 当前总积分已达到目标，开始执行免战流程`, 'warning');
                    await buyAndUseDenyCard(user, settings.baseInterval);
                    totalPoints = 0;
                    addOutput(`[${userName}] 🔄 免战流程完成，当前总积分已清空`, 'info');
                    logPointsProgress(userName, totalPoints, settings.pointsThreshold);
                } else if (guildWarRunning) {
                    await waitNextRound(userName, settings.baseInterval, '下一轮挑战前');
                }
            } catch (error) {
                failCount++;
                addOutput(`[${userName}] ❌ 第 ${round} 轮异常: ${error.message}`, 'error');
                logPointsProgress(userName, totalPoints, settings.pointsThreshold);
                if (guildWarRunning) {
                    await waitNextRound(userName, settings.baseInterval, '异常后重试');
                }
            }
        }
    } finally {
        logPointsProgress(userName, totalPoints, settings.pointsThreshold);
        addOutput(`[${userName}] 📊 停止: 成功 ${successCount} 轮，失败 ${failCount} 轮`, 'info');
    }
}

async function toggleGuildWar() {
    const startBtn = document.getElementById('startBtn');

    if (guildWarRunning) {
        guildWarRunning = false;
        startBtn.disabled = true;
        startBtn.textContent = '停止中...';
        addOutput('🛑 已请求停止公会战，等待所有账号完成当前轮', 'warning');
        return;
    }

    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        alert('请至少选择一个用户');
        return;
    }

    const settings = {
        targetIndex: getTargetIndex(),
        baseInterval: getFightInterval(),
        pointsThreshold: getPointsThreshold(),
        withdrawAmount: getWithdrawAmount(),
        cardCount: getCardCount()
    };

    guildWarRunning = true;
    updateStartButtonState();

    addOutput(`⚔️ 开始公会战，并发账号数: ${selectedUsers.length}`, 'info');
    addOutput(`🎯 挑战目标: 第 ${settings.targetIndex} 个对手`, 'info');
    addOutput(`⏲️ 基础间隔: ${settings.baseInterval}ms，实际每次按 ±30% 随机`, 'info');
    addOutput(`💰 金币不足时取钱: ${settings.withdrawAmount}`, 'info');
    addOutput(`🎴 购买恢复卡数量: ${settings.cardCount}`, 'info');
    addOutput(settings.pointsThreshold ? `🏅 积分阈值: ${settings.pointsThreshold}` : '🏅 未设置积分阈值，不触发免战卡流程', 'info');
    addOutput(`👥 账号列表: ${selectedUsers.map(user => user.name).join('、')}`, 'info');

    try {
        await Promise.all(selectedUsers.map(user => runGuildWarForUser(user, settings)));
    } finally {
        guildWarRunning = false;
        updateStartButtonState();
        addOutput('\n🎉 所有公会战任务已停止', 'info');
    }
}
