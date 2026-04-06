// 一键天梯相关变量
let users = [];

// 获取API基础URL
function getApiBaseUrl(user) {
    if (user && user.originalUrl) {
        try {
            return new URL(user.originalUrl).origin;
        } catch (e) {
            console.warn('Invalid originalUrl:', user.originalUrl);
            return 'http://82.157.255.108';
        }
    }
    return 'http://82.157.255.108';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    populateUserSelect();
    populateVipUserSelect();

    // 监听普通版输入框变化
    const battleCountInput = document.getElementById('battleCount');
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    const cardCountInput = document.getElementById('cardCount');
    if (battleCountInput) battleCountInput.addEventListener('input', updateStartButtonState);
    if (withdrawAmountInput) withdrawAmountInput.addEventListener('input', updateStartButtonState);
    if (cardCountInput) cardCountInput.addEventListener('input', updateStartButtonState);

    // 监听VIP版输入框变化
    const vipBattleCountInput = document.getElementById('vipBattleCount');
    const vipWithdrawAmountInput = document.getElementById('vipWithdrawAmount');
    const vipCardCountInput = document.getElementById('vipCardCount');
    if (vipBattleCountInput) vipBattleCountInput.addEventListener('input', updateVipStartButtonState);
    if (vipWithdrawAmountInput) vipWithdrawAmountInput.addEventListener('input', updateVipStartButtonState);
    if (vipCardCountInput) vipCardCountInput.addEventListener('input', updateVipStartButtonState);

    updateStartButtonState();
    updateVipStartButtonState();
});

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// 填充用户勾选列表
function populateUserSelect() {
    const list = document.getElementById('userCheckboxList');
    list.innerHTML = '';

    if (users.length === 0) {
        list.innerHTML = '<span class="checkbox-empty">暂无用户，请先添加用户</span>';
        return;
    }

    users.forEach(user => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = user.id;
        cb.addEventListener('change', function() {
            label.classList.toggle('checked', cb.checked);
            updateStartButtonState();
        });
        const span = document.createElement('span');
        span.textContent = user.name;
        label.appendChild(cb);
        label.appendChild(span);
        list.appendChild(label);
    });
}

// 获取选中的用户（checkbox 多选）
function getSelectedUsers() {
    const checked = document.querySelectorAll('#userCheckboxList input[type=checkbox]:checked');
    const ids = Array.from(checked).map(c => c.value);
    return users.filter(u => ids.includes(u.id));
}

// 兼容旧调用
function getSelectedUser() {
    const selected = getSelectedUsers();
    return selected.length > 0 ? selected[0] : null;
}

// 更新开始按钮状态
function updateStartButtonState() {
    const startBtn = document.getElementById('startBtn');
    const selectedUsers = getSelectedUsers();
    const isMulti = selectedUsers.length > 1;
    const battleCountInput = document.getElementById('battleCount');
    const cardCountInput = document.getElementById('cardCount');
    const multiHint = document.getElementById('multiHint');

    // 多账号时隐藏战斗次数和购买恢复卡
    document.getElementById('battleCountItem').style.display = isMulti ? 'none' : '';
    document.getElementById('cardCountItem').style.display = isMulti ? 'none' : '';
    battleCountInput.disabled = false;
    cardCountInput.disabled = false;
    multiHint.style.display = isMulti ? 'flex' : 'none';

    const battleCount = battleCountInput.value;

    if (selectedUsers.length === 0) {
        startBtn.disabled = true;
        startBtn.textContent = '⚔️ 请先选择用户';
    } else if (!isMulti && (!battleCount || battleCount < 1)) {
        startBtn.disabled = true;
        startBtn.textContent = '⚔️ 请输入战斗次数';
    } else {
        startBtn.disabled = false;
        if (isMulti) {
            startBtn.textContent = `⚔️ 开始天梯战斗 (${selectedUsers.length}个账号，各打到耗尽)`;
        } else {
            startBtn.textContent = `⚔️ 开始天梯战斗 (${selectedUsers[0]?.name} - ${battleCount}次)`;
        }
    }
}

// 开始一键天梯
async function startLadder() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        alert('请先选择用户');
        return;
    }

    const isMulti = selectedUsers.length > 1;
    const battleCount = isMulti ? 0 : parseInt(document.getElementById('battleCount').value);
    if (!isMulti && (!battleCount || battleCount < 1)) {
        alert('请输入有效的战斗次数（至少1次）');
        return;
    }

    const targetIndexInput = document.getElementById('targetIndex');
    const targetIndex = targetIndexInput && targetIndexInput.value ? parseInt(targetIndexInput.value) : null;
    const withdrawAmount = parseInt(document.getElementById('withdrawAmount').value) || 0;
    const cardCount = isMulti ? 10 : (parseInt(document.getElementById('cardCount').value) || 10);

    document.getElementById('userSelectionArea').style.display = 'none';
    document.getElementById('outputArea').style.display = 'flex';

    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.classList.add('loading');
    startBtn.textContent = '执行中...';

    try {
        if (isMulti) {
            addOutput(`⚔️ 多账号天梯模式，共 ${selectedUsers.length} 个账号，每账号打到次数耗尽为止`, 'info');
        } else {
            addOutput(`⚔️ 开始一键天梯操作...`, 'info');
        }

        // 遍历每个账号
        for (const user of selectedUsers) {
            addOutput(`\n👤 账号: ${user.name}${isMulti ? '，打到次数耗尽为止' : `，战斗 ${battleCount} 次`}`, 'info');
            if (targetIndex) addOutput(`指定攻击对手位置: 第 ${targetIndex} 个`, 'info');
            addOutput(`金币不足时取钱: ${withdrawAmount}，购买恢复卡: ${cardCount} 张`, 'info');
            addOutput(`=== 开始战斗 ===`, 'info');

            let successCount = 0, failCount = 0, withdrawCount = 0, winCount = 0, loseCount = 0;
            let round = 0;

            while (true) {
                round++;
                // 单账号模式：达到指定次数就停
                if (!isMulti && round > battleCount) break;

                try {
                    addOutput(`第 ${round} 次 - 正在获取天梯列表...`, 'info');
                    const surroundResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/surround`, {
                        method: 'GET',
                        headers: { 'authorization': user.sso, 'Content-Type': 'application/json' }
                    });

                    if (!surroundResponse.ok) throw new Error(`获取天梯列表失败: HTTP ${surroundResponse.status}`);

                    const surroundData = JSON.parse(await surroundResponse.text());
                    if (surroundData.code !== 200) {
                        if (surroundData.msg?.includes('过期') || surroundData.msg?.includes('未登录') || surroundData.msg?.includes('登录')) {
                            addOutput(`🔚 [${user.name}] 登录已过期，切换下一个账号`, 'warning');
                            break;
                        }
                        throw new Error(`获取天梯列表失败: ${surroundData.msg || '未知错误'}`);
                    }

                    const ladderList = surroundData.data || [];
                    if (ladderList.length === 0) {
                        addOutput(`第 ${round} 次 - 天梯列表为空，跳过`, 'warning');
                        failCount++;
                        await new Promise(r => setTimeout(r, 200));
                        continue;
                    }

                    let targetPlayer;
                    if (targetIndex && targetIndex > 0) {
                        targetPlayer = targetIndex <= ladderList.length ? ladderList[targetIndex - 1] : ladderList[ladderList.length - 1];
                        if (targetIndex > ladderList.length) addOutput(`⚠️ 指定位置超出列表，攻击最后一个`, 'warning');
                    } else {
                        targetPlayer = ladderList[ladderList.length - 1];
                    }

                    const targetUid = targetPlayer.uid;
                    addOutput(`第 ${round} 次 - 目标: UID ${targetUid}, 积分: ${targetPlayer.points}, 排名: ${targetPlayer.rank}`, 'info');

                    // 执行战斗（含恢复卡/取钱重试逻辑）
                    const result = await doFight(user, targetUid, withdrawAmount, cardCount, round, isMulti);
                    if (result.success) {
                        successCount++;
                        if (result.win) winCount++; else loseCount++;
                    } else {
                        failCount++;
                        if (result.withdrew) withdrawCount++;
                    }

                    // 银行余额不足，停止当前账号
                    if (result.bankEmpty) {
                        addOutput(`🔚 [${user.name}] 银行余额不足无法取钱，停止当前账号`, 'warning');
                        break;
                    }
                    // 多账号模式：次数耗尽则停止当前账号
                    if (isMulti && result.exhausted) {
                        addOutput(`🔚 [${user.name}] 战斗次数已耗尽，切换下一个账号`, 'warning');
                        break;
                    }
                    if (result.expired) {
                        addOutput(`🔚 [${user.name}] 登录已过期，切换下一个账号`, 'warning');
                        break;
                    }

                    await new Promise(r => setTimeout(r, 200));
                } catch (error) {
                    addOutput(`❌ 第 ${round} 次操作失败: ${error.message}`, 'error');
                    failCount++;
                    if (error.message.includes('登录已过期') || error.message.includes('登陆已过期')) {
                        addOutput(`🔚 [${user.name}] 登录已过期，切换下一个账号`, 'warning');
                        break;
                    }
                    // 遇到异常也继续，除非是多账号且已耗尽
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            addOutput(`\n📊 [${user.name}] 统计: 共${round - (isMulti ? 1 : 0)}次 成功${successCount} 失败${failCount} 胜${winCount} 负${loseCount} 取钱${withdrawCount}次`, 'info');
        }

        addOutput(`\n🎉 === 全部账号天梯完成 ===`, 'info');
        showNotification('天梯战斗完成！', 'success');

    } catch (error) {
        addOutput(`💥 发生严重错误: ${error.message}`, 'error');
        showNotification(`天梯发生错误: ${error.message}`, 'error');
    } finally {
        startBtn.disabled = false;
        startBtn.classList.remove('loading');
        startBtn.textContent = '⚔️ 开始天梯战斗';
    }
}

// 执行单次战斗（含恢复卡/取钱重试），返回 {success, win, withdrew, exhausted}
async function doFight(user, targetUid, withdrawAmount, cardCount, round, isMultiMode = false) {
    const fightUrl = `${getApiBaseUrl(user)}/api/fight/fight?uid=${targetUid}`;
    const headers = { 'authorization': user.sso, 'Content-Type': 'application/json' };

    const fightResp = await fetch(fightUrl, { method: 'POST', headers });
    const fightData = JSON.parse(await fightResp.text());

    if (fightData.code === 200) {
        const isWin = fightData.data?.win === true;
        addOutput(`✅ 第 ${round} 次战斗成功 - ${isWin ? '赢了 🎉' : '输了 😢'}`, 'success');
        return { success: true, win: isWin };
    }

    if (fightData.code === 500 && fightData.msg?.includes('战斗次数不足')) {
        if (!isMultiMode) {
            addOutput(`⚠️ 战斗次数不足，尝试使用恢复卡...`, 'warning');
            const cardUsed = await useOrBuyCard(user, cardCount, round);
            if (cardUsed) {
                const retry = await fetch(fightUrl, { method: 'POST', headers });
                const retryData = JSON.parse(await retry.text());
                if (retryData.code === 200) {
                    const isWin = retryData.data?.win === true;
                    addOutput(`✅ 第 ${round} 次战斗成功（使用恢复卡后）- ${isWin ? '赢了 🎉' : '输了 😢'}`, 'success');
                    return { success: true, win: isWin };
                }
                addOutput(`❌ 第 ${round} 次战斗失败（使用恢复卡后）: ${retryData.msg}`, 'error');
            }
        } else {
            addOutput(`⚠️ 战斗次数不足，多账号模式不使用恢复卡，停止当前账号`, 'warning');
        }
        // 次数耗尽
        return { success: false, exhausted: true };
    }

    if (fightData.code === 500 && fightData.msg?.includes('金币不足')) {
        addOutput(`⚠️ 金币不足，尝试取钱 ${withdrawAmount}...`, 'warning');
        if (withdrawAmount > 0) {
            const wResp = await fetch(`${getApiBaseUrl(user)}/api/qianzhuang/qk?num=${withdrawAmount}`, {
                method: 'PUT', headers
            });
            const wData = JSON.parse(await wResp.text());
            if (wData.code === 200) {
                addOutput(`✅ 取钱成功`, 'success');
                const retry = await fetch(fightUrl, { method: 'POST', headers });
                const retryData = JSON.parse(await retry.text());
                if (retryData.code === 200) {
                    const isWin = retryData.data?.win === true;
                    addOutput(`✅ 第 ${round} 次战斗成功（取钱后）- ${isWin ? '赢了 🎉' : '输了 😢'}`, 'success');
                    return { success: true, win: isWin, withdrew: true };
                }
                addOutput(`❌ 第 ${round} 次战斗失败（取钱后）: ${retryData.msg}`, 'error');
                return { success: false, withdrew: true };
            }
            addOutput(`❌ 取钱失败: ${wData.msg}，银行余额不足，停止当前账号`, 'error');
            return { success: false, bankEmpty: true };
        } else {
            addOutput(`⚠️ 未设置取钱金额，跳过`, 'warning');
        }
        return { success: false };
    }

    addOutput(`❌ 第 ${round} 次战斗失败: ${fightData.msg || '未知错误'}`, 'error');
    if (fightData.msg?.includes('过期') || fightData.msg?.includes('未登录') || fightData.msg?.includes('登录')) {
        return { success: false, expired: true };
    }
    return { success: false };
}

// 使用或购买恢复卡，返回是否成功使用
async function useOrBuyCard(user, cardCount, round, allowBuy = true) {
    const headers = { 'authorization': user.sso, 'Content-Type': 'application/json' };
    const useResp = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, { method: 'POST', headers });
    const useData = JSON.parse(await useResp.text());

    if (useData.code === 200) {
        addOutput(`✅ 恢复卡使用成功`, 'success');
        return true;
    }

    if (useData.msg?.includes('你没有战斗恢复卡可用')) {
        if (!allowBuy) {
            addOutput(`⚠️ 没有恢复卡，多账号模式不购买`, 'warning');
            return false;
        }
        addOutput(`🛒 没有恢复卡，尝试购买 ${cardCount} 张...`, 'info');
        const buyResp = await fetch(`${getApiBaseUrl(user)}/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, {
            method: 'POST', headers
        });
        const buyData = JSON.parse(await buyResp.text());
        if (buyData.code === 200) {
            addOutput(`✅ 购买恢复卡成功`, 'success');
            const retryUse = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, { method: 'POST', headers });
            const retryData = JSON.parse(await retryUse.text());
            if (retryData.code === 200) {
                addOutput(`✅ 恢复卡使用成功`, 'success');
                return true;
            }
            addOutput(`❌ 使用恢复卡失败: ${retryData.msg}`, 'error');
        } else {
            addOutput(`❌ 购买恢复卡失败: ${buyData.msg}`, 'error');
        }
    } else {
        addOutput(`❌ 使用恢复卡失败: ${useData.msg}`, 'error');
    }
    return false;
}

// 添加输出内容
function addOutput(message, type = 'info') {
    const outputContent = document.getElementById('outputContent');
    const timestamp = new Date().toLocaleString();
    
    // 如果是第一次输出，清除占位文本
    if (outputContent.classList.contains('empty')) {
        outputContent.classList.remove('empty');
        outputContent.textContent = '';
    }
    
    const logEntry = `[${timestamp}] ${message}\n`;
    const span = document.createElement('span');
    span.className = type;
    span.textContent = logEntry;
    
    outputContent.appendChild(span);
    outputContent.scrollTop = outputContent.scrollHeight;
}

// 清空输出
function clearOutput() {
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    outputContent.classList.add('empty');
    outputContent.textContent = '等待操作...';
}

// 显示用户选择区域
function showUserSelection() {
    document.getElementById('userSelectionArea').style.display = 'flex';
    document.getElementById('vipUserSelectionArea').style.display = 'flex';
    document.getElementById('outputArea').style.display = 'none';
    
    // 重置选择状态
    document.querySelectorAll('#userCheckboxList input[type=checkbox]').forEach(c => c.checked = false);
    document.querySelectorAll('#vipUserCheckboxList input[type=checkbox]').forEach(c => c.checked = false);

    document.getElementById('battleCount').value = 15;
    document.getElementById('cardCount').value = 10;
    document.getElementById('multiHint').style.display = 'none';

    document.getElementById('vipBattleCount').value = 15;
    document.getElementById('vipCardCount').value = 10;
    document.getElementById('vipMultiHint').style.display = 'none';

    if (document.getElementById('targetIndex')) {
        document.getElementById('targetIndex').value = '';
    }
    document.getElementById('withdrawAmount').value = 100000;
    document.getElementById('vipWithdrawAmount').value = 100000;
    updateStartButtonState();
    updateVipStartButtonState();
    clearOutput();
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============ VIP版天梯功能 ============

// 填充VIP用户勾选列表
function populateVipUserSelect() {
    const list = document.getElementById('vipUserCheckboxList');
    list.innerHTML = '';

    if (users.length === 0) {
        list.innerHTML = '<span class="checkbox-empty">暂无用户，请先添加用户</span>';
        return;
    }

    users.forEach(user => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = user.id;
        cb.addEventListener('change', function() {
            label.classList.toggle('checked', cb.checked);
            updateVipStartButtonState();
        });
        const span = document.createElement('span');
        span.textContent = user.name;
        label.appendChild(cb);
        label.appendChild(span);
        list.appendChild(label);
    });
}

// 获取VIP选中的用户（checkbox 多选）
function getVipSelectedUsers() {
    const checked = document.querySelectorAll('#vipUserCheckboxList input[type=checkbox]:checked');
    const ids = Array.from(checked).map(c => c.value);
    return users.filter(u => ids.includes(u.id));
}

function getVipSelectedUser() {
    const selected = getVipSelectedUsers();
    return selected.length > 0 ? selected[0] : null;
}

// 更新VIP开始按钮状态
function updateVipStartButtonState() {
    const vipStartBtn = document.getElementById('vipStartBtn');
    const selectedUsers = getVipSelectedUsers();
    const isMulti = selectedUsers.length > 1;
    const vipBattleCountInput = document.getElementById('vipBattleCount');
    const vipCardCountInput = document.getElementById('vipCardCount');
    const vipMultiHint = document.getElementById('vipMultiHint');

    // 多账号时隐藏战斗次数和购买恢复卡
    document.getElementById('vipBattleCountItem').style.display = isMulti ? 'none' : '';
    document.getElementById('vipCardCountItem').style.display = isMulti ? 'none' : '';
    vipBattleCountInput.disabled = false;
    vipCardCountInput.disabled = false;
    vipMultiHint.style.display = isMulti ? 'flex' : 'none';

    const vipBattleCount = vipBattleCountInput.value;

    if (selectedUsers.length === 0) {
        vipStartBtn.disabled = true;
        vipStartBtn.textContent = '👑 请先选择用户';
    } else if (!isMulti && (!vipBattleCount || vipBattleCount < 1)) {
        vipStartBtn.disabled = true;
        vipStartBtn.textContent = '👑 请输入战斗次数';
    } else {
        vipStartBtn.disabled = false;
        if (isMulti) {
            vipStartBtn.textContent = `👑 VIP天梯战斗 (${selectedUsers.length}个账号，各打到耗尽)`;
        } else {
            vipStartBtn.textContent = `👑 VIP天梯战斗 (${selectedUsers[0]?.name} - ${vipBattleCount}次)`;
        }
    }
}

// 开始VIP天梯（支持多账号）
async function startVipLadder() {
    const selectedUsers = getVipSelectedUsers();
    if (selectedUsers.length === 0) {
        alert('请先选择用户');
        return;
    }

    const isMulti = selectedUsers.length > 1;
    const battleCount = isMulti ? 0 : parseInt(document.getElementById('vipBattleCount').value);
    if (!isMulti && (!battleCount || battleCount < 1)) {
        alert('请输入有效的战斗次数（至少1次）');
        return;
    }

    const withdrawAmount = parseInt(document.getElementById('vipWithdrawAmount').value) || 0;
    const cardCount = isMulti ? 10 : (parseInt(document.getElementById('vipCardCount').value) || 10);

    document.getElementById('vipUserSelectionArea').style.display = 'none';
    document.getElementById('outputArea').style.display = 'flex';

    const vipStartBtn = document.getElementById('vipStartBtn');
    vipStartBtn.disabled = true;
    vipStartBtn.classList.add('loading');
    vipStartBtn.textContent = '执行中...';

    try {
        if (isMulti) {
            addOutput(`👑 多账号VIP天梯模式，共 ${selectedUsers.length} 个账号，每账号打到次数耗尽为止`, 'info');
        } else {
            addOutput(`👑 开始VIP天梯操作...`, 'info');
        }

        for (const user of selectedUsers) {
            addOutput(`\n👤 账号: ${user.name}${isMulti ? '，打到次数耗尽为止' : `，VIP战斗 ${battleCount} 次`}`, 'info');
            addOutput(`金币不足时取钱: ${withdrawAmount}，购买恢复卡: ${cardCount} 张`, 'info');
            addOutput(`=== VIP战斗开始 ===`, 'info');

            let successCount = 0, failCount = 0;
            let round = 0;

            while (true) {
                round++;
                if (!isMulti && round > battleCount) break;

                try {
                    addOutput(`第 ${round} 次 - 正在进行VIP战斗...`, 'info');
                    const headers = { 'authorization': user.sso, 'Content-Type': 'application/json' };

                    // 单账号模式才战斗前使用两次恢复卡
                    if (!isMulti) {
                        addOutput(`🎴 战斗前使用恢复卡（第1次）...`, 'info');
                        await new Promise(r => setTimeout(r, 500));
                        await useOrBuyCard(user, cardCount, round);

                        addOutput(`🎴 战斗前使用恢复卡（第2次）...`, 'info');
                        await new Promise(r => setTimeout(r, 500));
                        const card2Resp = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, { method: 'POST', headers });
                        const card2Data = JSON.parse(await card2Resp.text());
                        if (card2Data.code === 200) {
                            addOutput(`✅ 恢复卡使用成功（第2次）`, 'success');
                        } else {
                            addOutput(`⚠️ 恢复卡使用失败（第2次）: ${card2Data.msg}`, 'warning');
                        }

                        await new Promise(r => setTimeout(r, 2000));
                    } else {
                        // 多账号模式保持和单账号相同的间隔
                        await new Promise(r => setTimeout(r, 1000));
                    }

                    // 执行 VIP 战斗
                    const fightResp = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, { method: 'POST', headers });
                    const fightData = JSON.parse(await fightResp.text());

                    if (fightData.code === 200) {
                        addOutput(`✅ 第 ${round} 次VIP战斗成功`, 'success');
                        successCount++;
                    } else if (fightData.code === 500 && fightData.msg?.includes('战斗次数已用完')) {
                        if (isMulti) {
                            addOutput(`⚠️ 战斗次数已用完，多账号模式不使用恢复卡，停止当前账号`, 'warning');
                            failCount++;
                            addOutput(`🔚 [${user.name}] 战斗次数已耗尽，切换下一个账号`, 'warning');
                            break;
                        }
                        addOutput(`⚠️ 战斗次数已用完，尝试使用恢复卡...`, 'warning');
                        await new Promise(r => setTimeout(r, 500));
                        const cardUsed = await useOrBuyCard(user, cardCount, round);
                        if (cardUsed) {
                            await new Promise(r => setTimeout(r, 500));
                            const retry = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, { method: 'POST', headers });
                            const retryData = JSON.parse(await retry.text());
                            if (retryData.code === 200) {
                                addOutput(`✅ 第 ${round} 次VIP战斗成功（使用恢复卡后）`, 'success');
                                successCount++;
                            } else {
                                addOutput(`❌ 第 ${round} 次战斗失败（使用恢复卡后）: ${retryData.msg}`, 'error');
                                failCount++;
                                // 恢复卡用了但还是失败，次数耗尽
                                if (isMulti) {
                                    addOutput(`🔚 [${user.name}] 战斗次数已耗尽，切换下一个账号`, 'warning');
                                    break;
                                }
                            }
                        } else {
                            // 恢复卡搞不到，次数耗尽
                            failCount++;
                            if (isMulti) {
                                addOutput(`🔚 [${user.name}] 战斗次数已耗尽，切换下一个账号`, 'warning');
                                break;
                            }
                        }
                    } else if (fightData.code === 500 && fightData.msg?.includes('金币不足')) {
                        addOutput(`⚠️ 金币不足，尝试取钱 ${withdrawAmount}...`, 'warning');
                        if (withdrawAmount > 0) {
                            const wResp = await fetch(`${getApiBaseUrl(user)}/api/qianzhuang/qk?num=${withdrawAmount}`, { method: 'PUT', headers });
                            const wData = JSON.parse(await wResp.text());
                            if (wData.code === 200) {
                                addOutput(`✅ 取钱成功`, 'success');
                                await new Promise(r => setTimeout(r, 500));
                                const retry = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, { method: 'POST', headers });
                                const retryData = JSON.parse(await retry.text());
                                if (retryData.code === 200) {
                                    addOutput(`✅ 第 ${round} 次VIP战斗成功（取钱后）`, 'success');
                                    successCount++;
                                } else {
                                    addOutput(`❌ 第 ${round} 次战斗失败（取钱后）: ${retryData.msg}`, 'error');
                                    failCount++;
                                }
                            } else {
                                addOutput(`❌ 取钱失败: ${wData.msg}，银行余额不足，停止当前账号`, 'error');
                                failCount++;
                                break;
                            }
                        } else {
                            addOutput(`⚠️ 未设置取钱金额，跳过`, 'warning');
                            failCount++;
                        }
                    } else {
                        addOutput(`❌ 第 ${round} 次战斗失败: ${fightData.msg || '未知错误'}`, 'error');
                        failCount++;
                        if (fightData.msg?.includes('过期') || fightData.msg?.includes('未登录') || fightData.msg?.includes('登录')) {
                            addOutput(`🔚 [${user.name}] 登录已过期，切换下一个账号`, 'warning');
                            break;
                        }
                    }

                    await new Promise(r => setTimeout(r, 200));
                } catch (error) {
                    addOutput(`❌ 第 ${round} 次操作失败: ${error.message}`, 'error');
                    failCount++;
                    if (error.message.includes('登录已过期') || error.message.includes('登陆已过期')) {
                        addOutput(`🔚 [${user.name}] 登录已过期，切换下一个账号`, 'warning');
                        break;
                    }
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            addOutput(`\n📊 [${user.name}] VIP统计: 共${round - (isMulti ? 1 : 0)}次 成功${successCount} 失败${failCount}`, 'info');
        }

        addOutput(`\n🎉 === 全部账号VIP天梯完成 ===`, 'info');
        showNotification('VIP天梯战斗完成！', 'success');

    } catch (error) {
        addOutput(`💥 VIP天梯发生严重错误: ${error.message}`, 'error');
        showNotification(`VIP天梯发生错误: ${error.message}`, 'error');
    } finally {
        vipStartBtn.disabled = false;
        vipStartBtn.classList.remove('loading');
        vipStartBtn.textContent = '👑 VIP天梯战斗';
    }
}

// 页面加载时也初始化VIP部分（已合并到上方 DOMContentLoaded）
