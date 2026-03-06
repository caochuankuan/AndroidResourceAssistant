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
    
    // 监听输入框变化
    const battleCountInput = document.getElementById('battleCount');
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    const cardCountInput = document.getElementById('cardCount');
    if (battleCountInput) {
        battleCountInput.addEventListener('input', updateStartButtonState);
    }
    if (withdrawAmountInput) {
        withdrawAmountInput.addEventListener('input', updateStartButtonState);
    }
    if (cardCountInput) {
        cardCountInput.addEventListener('input', updateStartButtonState);
    }
    
    updateStartButtonState();
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

// 填充用户下拉列表
function populateUserSelect() {
    const userSelect = document.getElementById('userSelect');
    
    // 清空现有选项（保留第一个默认选项）
    userSelect.innerHTML = '<option value="">请选择用户</option>';
    
    if (users.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '暂无用户，请先添加用户';
        option.disabled = true;
        userSelect.appendChild(option);
        return;
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

// 获取选中的用户
function getSelectedUser() {
    const userSelect = document.getElementById('userSelect');
    const selectedUserId = userSelect.value;
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
}

// 更新开始按钮状态
function updateStartButtonState() {
    const startBtn = document.getElementById('startBtn');
    const userSelect = document.getElementById('userSelect');
    const battleCount = document.getElementById('battleCount').value;
    const selectedUserId = userSelect.value;
    
    if (!selectedUserId) {
        startBtn.disabled = true;
        startBtn.textContent = '⚔️ 请先选择用户';
    } else if (!battleCount || battleCount < 1) {
        startBtn.disabled = true;
        startBtn.textContent = '⚔️ 请输入战斗次数';
    } else {
        startBtn.disabled = false;
        const user = users.find(u => u.id === selectedUserId);
        startBtn.textContent = `⚔️ 开始天梯战斗 (${user?.name} - ${battleCount}次)`;
    }
}

// 开始一键天梯
async function startLadder() {
    const user = getSelectedUser();
    if (!user) {
        alert('请先选择一个用户');
        return;
    }

    const battleCount = parseInt(document.getElementById('battleCount').value);
    if (!battleCount || battleCount < 1) {
        alert('请输入有效的战斗次数（至少1次）');
        return;
    }

    const targetIndexInput = document.getElementById('targetIndex');
    const targetIndex = targetIndexInput && targetIndexInput.value ? parseInt(targetIndexInput.value) : null;

    const withdrawAmount = parseInt(document.getElementById('withdrawAmount').value) || 0;
    const cardCount = parseInt(document.getElementById('cardCount').value) || 10;

    // 隐藏用户选择区域，显示输出区域
    document.getElementById('userSelectionArea').style.display = 'none';
    document.getElementById('outputArea').style.display = 'flex';

    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.classList.add('loading');
    startBtn.textContent = '执行中...';

    try {
        addOutput(`⚔️ 开始一键天梯操作...`, 'info');
        addOutput(`用户: ${user.name}`, 'info');
        addOutput(`战斗次数: ${battleCount}`, 'info');
        if (targetIndex) {
            addOutput(`指定攻击对手位置: 第 ${targetIndex} 个`, 'info');
        } else {
            addOutput(`攻击策略: 默认攻击最后一个`, 'info');
        }
        addOutput(`金币不足时取钱: ${withdrawAmount} 金币`, 'info');
        addOutput(`购买恢复卡数量: ${cardCount} 张`, 'info');
        addOutput(`将进行${battleCount}次战斗，每次都会重新获取最后一个对手`, 'info');
        addOutput(`\n=== 天梯战斗开始 ===\n`, 'info');

        let successCount = 0;
        let failCount = 0;
        let withdrawCount = 0;
        let winCount = 0;
        let loseCount = 0;

        // 连续N次战斗，每次都重新获取目标
        for (let i = 1; i <= battleCount; i++) {
            try {
                // 获取天梯列表
                addOutput(`第 ${i}/${battleCount} 次 - 正在获取天梯列表...`, 'info');
                const surroundResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/surround`, {
                    method: 'GET',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });

                if (!surroundResponse.ok) {
                    throw new Error(`获取天梯列表失败: HTTP ${surroundResponse.status}`);
                }

                const surroundText = await surroundResponse.text();
                const surroundData = JSON.parse(surroundText);

                if (surroundData.code !== 200) {
                    throw new Error(`获取天梯列表失败: ${surroundData.msg || '未知错误'}`);
                }

                const ladderList = surroundData.data || [];
                if (ladderList.length === 0) {
                    addOutput(`第 ${i} 次 - 天梯列表为空，跳过此次战斗`, 'warning');
                    failCount++;
                    continue;
                }

                // 获取目标对手
                let targetPlayer;
                if (targetIndex && targetIndex > 0) {
                    if (targetIndex <= ladderList.length) {
                        targetPlayer = ladderList[targetIndex - 1];
                    } else {
                        addOutput(`⚠️ 指定位置 ${targetIndex} 超出列表长度 (${ladderList.length})，将攻击最后一个`, 'warning');
                        targetPlayer = ladderList[ladderList.length - 1];
                    }
                } else {
                    targetPlayer = ladderList[ladderList.length - 1];
                }

                const targetUid = targetPlayer.uid;
                
                addOutput(`第 ${i}/${battleCount} 次 - 目标对手: UID ${targetUid}, 积分: ${targetPlayer.points}, 排名: ${targetPlayer.rank}`, 'info');

                // 进行战斗
                const fightResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight?uid=${targetUid}`, {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });

                const fightText = await fightResponse.text();
                
                if (fightResponse.ok) {
                    try {
                        const fightData = JSON.parse(fightText);
                        if (fightData.code === 200) {
                            const isWin = fightData.data?.win === true;
                            const winResult = isWin ? '赢了 🎉' : '输了 😢';
                            addOutput(`✅ 第 ${i} 次战斗成功 - ${winResult}`, 'success');
                            if (fightData.data) {
                                const resultStr = JSON.stringify(fightData.data);
                                addOutput(`战斗结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                            }
                            successCount++;
                            if (isWin) {
                                winCount++;
                            } else {
                                loseCount++;
                            }
                        } else if (fightData.code === 500 && fightData.msg && fightData.msg.includes('战斗次数不足')) {
                            // 战斗次数不足，使用战斗恢复卡
                            addOutput(`⚠️ 第 ${i} 次战斗失败: ${fightData.msg}`, 'warning');
                            addOutput(`🎴 尝试使用战斗恢复卡（道具ID: 32）...`, 'info');
                            
                            const usePropResponse = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                                method: 'POST',
                                headers: {
                                    'authorization': user.sso,
                                    'Content-Type': 'application/json'
                                }
                            });

                            const usePropText = await usePropResponse.text();
                            
                            if (usePropResponse.ok) {
                                try {
                                    const usePropData = JSON.parse(usePropText);
                                    if (usePropData.code === 200) {
                                        addOutput(`✅ 战斗恢复卡使用成功`, 'success');
                                        
                                        // 使用道具成功后重新战斗
                                        addOutput(`🔄 重新进行第 ${i} 次战斗...`, 'info');
                                        
                                        const retryFightResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight?uid=${targetUid}`, {
                                            method: 'POST',
                                            headers: {
                                                'authorization': user.sso,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        const retryFightText = await retryFightResponse.text();
                                        
                                        if (retryFightResponse.ok) {
                                            const retryFightData = JSON.parse(retryFightText);
                                            if (retryFightData.code === 200) {
                                                const isWin = retryFightData.data?.win === true;
                                                const winResult = isWin ? '赢了 🎉' : '输了 😢';
                                                addOutput(`✅ 第 ${i} 次战斗成功（使用恢复卡后）- ${winResult}`, 'success');
                                                if (retryFightData.data) {
                                                    const resultStr = JSON.stringify(retryFightData.data);
                                                    addOutput(`战斗结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                                                }
                                                successCount++;
                                                if (isWin) {
                                                    winCount++;
                                                } else {
                                                    loseCount++;
                                                }
                                            } else {
                                                addOutput(`❌ 第 ${i} 次战斗失败（使用恢复卡后）: ${retryFightData.msg || '未知错误'}`, 'error');
                                                failCount++;
                                            }
                                        } else {
                                            addOutput(`❌ 第 ${i} 次战斗失败（使用恢复卡后）: HTTP ${retryFightResponse.status}`, 'error');
                                            failCount++;
                                        }
                                    } else if (usePropData.code === 500 && usePropData.msg && usePropData.msg.includes('你没有战斗恢复卡可用')) {
                                        // 没有恢复卡，尝试购买
                                        addOutput(`⚠️ 没有战斗恢复卡可用`, 'warning');
                                        addOutput(`🛒 尝试购买 ${cardCount} 张战斗恢复卡...`, 'info');
                                        
                                        const buyResponse = await fetch(`${getApiBaseUrl(user)}/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, {
                                            method: 'POST',
                                            headers: {
                                                'authorization': user.sso,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        const buyText = await buyResponse.text();
                                        
                                        if (buyResponse.ok) {
                                            try {
                                                const buyData = JSON.parse(buyText);
                                                if (buyData.code === 200) {
                                                    addOutput(`✅ 购买战斗恢复卡成功，已购买 ${cardCount} 张`, 'success');
                                                    
                                                    // 购买成功后再次使用恢复卡
                                                    addOutput(`🎴 再次尝试使用战斗恢复卡...`, 'info');
                                                    
                                                    const retryUsePropResponse = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'authorization': user.sso,
                                                            'Content-Type': 'application/json'
                                                        }
                                                    });

                                                    const retryUsePropText = await retryUsePropResponse.text();
                                                    
                                                    if (retryUsePropResponse.ok) {
                                                        const retryUsePropData = JSON.parse(retryUsePropText);
                                                        if (retryUsePropData.code === 200) {
                                                            addOutput(`✅ 战斗恢复卡使用成功`, 'success');
                                                            
                                                            // 使用道具成功后重新战斗
                                                            addOutput(`🔄 重新进行第 ${i} 次战斗...`, 'info');
                                                            
                                                            const retryFightResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight?uid=${targetUid}`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    'authorization': user.sso,
                                                                    'Content-Type': 'application/json'
                                                                }
                                                            });

                                                            const retryFightText = await retryFightResponse.text();
                                                            
                                                            if (retryFightResponse.ok) {
                                                                const retryFightData = JSON.parse(retryFightText);
                                                                if (retryFightData.code === 200) {
                                                                    const isWin = retryFightData.data?.win === true;
                                                                    const winResult = isWin ? '赢了 🎉' : '输了 😢';
                                                                    addOutput(`✅ 第 ${i} 次战斗成功（购买并使用恢复卡后）- ${winResult}`, 'success');
                                                                    if (retryFightData.data) {
                                                                        const resultStr = JSON.stringify(retryFightData.data);
                                                                        addOutput(`战斗结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                                                                    }
                                                                    successCount++;
                                                                    if (isWin) {
                                                                        winCount++;
                                                                    } else {
                                                                        loseCount++;
                                                                    }
                                                                } else {
                                                                    addOutput(`❌ 第 ${i} 次战斗失败（购买并使用恢复卡后）: ${retryFightData.msg || '未知错误'}`, 'error');
                                                                    failCount++;
                                                                }
                                                            } else {
                                                                addOutput(`❌ 第 ${i} 次战斗失败（购买并使用恢复卡后）: HTTP ${retryFightResponse.status}`, 'error');
                                                                failCount++;
                                                            }
                                                        } else {
                                                            addOutput(`❌ 使用战斗恢复卡失败: ${retryUsePropData.msg || '未知错误'}`, 'error');
                                                            failCount++;
                                                        }
                                                    } else {
                                                        addOutput(`❌ 使用战斗恢复卡失败: HTTP ${retryUsePropResponse.status}`, 'error');
                                                        failCount++;
                                                    }
                                                } else {
                                                    addOutput(`❌ 购买战斗恢复卡失败: ${buyData.msg || '未知错误'}`, 'error');
                                                    addOutput(`第 ${i} 次战斗因战斗次数不足失败`, 'error');
                                                    failCount++;
                                                }
                                            } catch (parseError) {
                                                addOutput(`❌ 购买响应解析错误`, 'error');
                                                failCount++;
                                            }
                                        } else {
                                            addOutput(`❌ 购买战斗恢复卡失败: HTTP ${buyResponse.status}`, 'error');
                                            failCount++;
                                        }
                                    } else {
                                        addOutput(`❌ 使用战斗恢复卡失败: ${usePropData.msg || '未知错误'}`, 'error');
                                        addOutput(`第 ${i} 次战斗因战斗次数不足失败`, 'error');
                                        failCount++;
                                    }
                                } catch (parseError) {
                                    addOutput(`❌ 使用道具响应解析错误`, 'error');
                                    failCount++;
                                }
                            } else {
                                addOutput(`❌ 使用战斗恢复卡失败: HTTP ${usePropResponse.status}`, 'error');
                                failCount++;
                            }
                        } else if (fightData.code === 500 && fightData.msg && fightData.msg.includes('金币不足')) {
                            // 金币不足，尝试取钱
                            addOutput(`⚠️ 第 ${i} 次战斗失败: ${fightData.msg}`, 'warning');
                            
                            if (withdrawAmount > 0) {
                                addOutput(`💰 尝试从钱庄取钱 ${withdrawAmount} 金币...`, 'info');
                                
                                const withdrawResponse = await fetch(`${getApiBaseUrl(user)}/api/qianzhuang/qk?num=${withdrawAmount}`, {
                                    method: 'PUT',
                                    headers: {
                                        'authorization': user.sso,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                const withdrawText = await withdrawResponse.text();
                                
                                if (withdrawResponse.ok) {
                                    try {
                                        const withdrawData = JSON.parse(withdrawText);
                                        if (withdrawData.code === 200) {
                                            addOutput(`✅ 取钱成功，已取出 ${withdrawAmount} 金币`, 'success');
                                            withdrawCount++;
                                            
                                            // 取钱成功后重新战斗
                                            addOutput(`🔄 重新进行第 ${i} 次战斗...`, 'info');
                                            
                                            const retryFightResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight?uid=${targetUid}`, {
                                                method: 'POST',
                                                headers: {
                                                    'authorization': user.sso,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            const retryFightText = await retryFightResponse.text();
                                            
                                            if (retryFightResponse.ok) {
                                                const retryFightData = JSON.parse(retryFightText);
                                                if (retryFightData.code === 200) {
                                                    const isWin = retryFightData.data?.win === true;
                                                    const winResult = isWin ? '赢了 🎉' : '输了 😢';
                                                    addOutput(`✅ 第 ${i} 次战斗成功（重试后）- ${winResult}`, 'success');
                                                    if (retryFightData.data) {
                                                        const resultStr = JSON.stringify(retryFightData.data);
                                                        addOutput(`战斗结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                                                    }
                                                    successCount++;
                                                    if (isWin) {
                                                        winCount++;
                                                    } else {
                                                        loseCount++;
                                                    }
                                                } else {
                                                    addOutput(`❌ 第 ${i} 次战斗失败（重试后）: ${retryFightData.msg || '未知错误'}`, 'error');
                                                    failCount++;
                                                }
                                            } else {
                                                addOutput(`❌ 第 ${i} 次战斗失败（重试后）: HTTP ${retryFightResponse.status}`, 'error');
                                                failCount++;
                                            }
                                        } else {
                                            addOutput(`❌ 取钱失败: ${withdrawData.msg || '未知错误'}`, 'error');
                                            addOutput(`第 ${i} 次战斗因金币不足失败`, 'error');
                                            failCount++;
                                        }
                                    } catch (parseError) {
                                        addOutput(`❌ 取钱响应解析错误`, 'error');
                                        failCount++;
                                    }
                                } else {
                                    addOutput(`❌ 取钱失败: HTTP ${withdrawResponse.status}`, 'error');
                                    failCount++;
                                }
                            } else {
                                addOutput(`⚠️ 未设置取钱金额，跳过此次战斗`, 'warning');
                                failCount++;
                            }
                        } else {
                            addOutput(`❌ 第 ${i} 次战斗失败: ${fightData.msg || '未知错误'}`, 'error');
                            if (fightData.data) {
                                addOutput(`错误数据: ${JSON.stringify(fightData.data)}`, 'error');
                            }
                            failCount++;
                        }
                    } catch (parseError) {
                        addOutput(`❌ 第 ${i} 次战斗失败: 响应解析错误`, 'error');
                        addOutput(`原始响应: ${fightText}`, 'error');
                        failCount++;
                    }
                } else {
                    addOutput(`❌ 第 ${i} 次战斗失败: HTTP ${fightResponse.status}`, 'error');
                    failCount++;
                }

                // 添加延迟避免请求过快
                if (i < battleCount) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

            } catch (error) {
                addOutput(`❌ 第 ${i} 次操作失败: ${error.message}`, 'error');
                failCount++;
            }
        }

        // 输出战斗总结
        addOutput(`\n🎉 === 一键天梯操作完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总计战斗: ${battleCount} 次`, 'info');
        addOutput(`   • 战斗成功: ${successCount} 次`, 'success');
        addOutput(`   • 战斗失败: ${failCount} 次`, failCount > 0 ? 'error' : 'info');
        addOutput(`   • 胜利次数: ${winCount} 次 🎉`, winCount > 0 ? 'success' : 'info');
        addOutput(`   • 失败次数: ${loseCount} 次 😢`, loseCount > 0 ? 'warning' : 'info');
        addOutput(`   • 取钱次数: ${withdrawCount} 次`, withdrawCount > 0 ? 'info' : 'info');
        addOutput(`   • 成功率: ${((successCount / battleCount) * 100).toFixed(1)}%`, 
                    successCount === battleCount ? 'success' : 'warning');
        if (successCount > 0) {
            addOutput(`   • 胜率: ${((winCount / successCount) * 100).toFixed(1)}%`, 
                        winCount > loseCount ? 'success' : 'warning');
        }
        
        if (successCount === battleCount) {
            addOutput(`🎊 恭喜！所有战斗都成功了！`, 'success');
            showNotification('天梯战斗完成！全部成功', 'success');
        } else if (successCount > 0) {
            addOutput(`⚠️ 部分战斗成功，请检查失败的战斗`, 'warning');
            showNotification('天梯战斗完成！部分成功', 'warning');
        } else {
            addOutput(`😞 所有战斗都失败了，请检查网络连接和用户权限`, 'error');
            showNotification('天梯战斗失败！请检查网络和权限', 'error');
        }

    } catch (error) {
        addOutput(`💥 一键天梯过程中发生严重错误: ${error.message}`, 'error');
        console.error('一键天梯错误:', error);
        showNotification(`一键天梯发生错误: ${error.message}`, 'error');
    } finally {
        startBtn.disabled = false;
        startBtn.classList.remove('loading');
        startBtn.textContent = '⚔️ 开始天梯战斗';
    }
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
    document.getElementById('outputArea').style.display = 'none';
    
    // 重置选择状态
    document.getElementById('userSelect').value = '';
    document.getElementById('battleCount').value = 15;
    if (document.getElementById('targetIndex')) {
        document.getElementById('targetIndex').value = '';
    }
    document.getElementById('withdrawAmount').value = 100000;
    document.getElementById('cardCount').value = 10;
    updateStartButtonState();
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

// 填充VIP用户下拉列表
function populateVipUserSelect() {
    const vipUserSelect = document.getElementById('vipUserSelect');
    
    // 清空现有选项（保留第一个默认选项）
    vipUserSelect.innerHTML = '<option value="">请选择用户</option>';
    
    if (users.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '暂无用户，请先添加用户';
        option.disabled = true;
        vipUserSelect.appendChild(option);
        return;
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        vipUserSelect.appendChild(option);
    });
}

// 获取VIP选中的用户
function getVipSelectedUser() {
    const vipUserSelect = document.getElementById('vipUserSelect');
    const selectedUserId = vipUserSelect.value;
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
}

// 更新VIP开始按钮状态
function updateVipStartButtonState() {
    const vipStartBtn = document.getElementById('vipStartBtn');
    const vipUserSelect = document.getElementById('vipUserSelect');
    const vipBattleCount = document.getElementById('vipBattleCount').value;
    const selectedUserId = vipUserSelect.value;
    
    if (!selectedUserId) {
        vipStartBtn.disabled = true;
        vipStartBtn.textContent = '👑 请先选择用户';
    } else if (!vipBattleCount || vipBattleCount < 1) {
        vipStartBtn.disabled = true;
        vipStartBtn.textContent = '👑 请输入战斗次数';
    } else {
        vipStartBtn.disabled = false;
        const user = users.find(u => u.id === selectedUserId);
        vipStartBtn.textContent = `👑 VIP天梯战斗 (${user?.name} - ${vipBattleCount}次)`;
    }
}

// 开始VIP天梯（简化版）
async function startVipLadder() {
    const user = getVipSelectedUser();
    if (!user) {
        alert('请先选择一个用户');
        return;
    }

    const battleCount = parseInt(document.getElementById('vipBattleCount').value);
    if (!battleCount || battleCount < 1) {
        alert('请输入有效的战斗次数（至少1次）');
        return;
    }

    const withdrawAmount = parseInt(document.getElementById('vipWithdrawAmount').value) || 0;
    const cardCount = parseInt(document.getElementById('vipCardCount').value) || 10;

    // 隐藏用户选择区域，显示输出区域
    document.getElementById('vipUserSelectionArea').style.display = 'none';
    document.getElementById('outputArea').style.display = 'flex';

    const vipStartBtn = document.getElementById('vipStartBtn');
    vipStartBtn.disabled = true;
    vipStartBtn.classList.add('loading');
    vipStartBtn.textContent = '执行中...';

    try {
        addOutput(`👑 开始VIP天梯操作...`, 'info');
        addOutput(`用户: ${user.name}`, 'info');
        addOutput(`战斗次数: ${battleCount}`, 'info');
        addOutput(`金币不足时取钱: ${withdrawAmount} 金币`, 'info');
        addOutput(`购买恢复卡数量: ${cardCount} 张`, 'info');
        addOutput(`\n=== VIP天梯战斗开始 ===\n`, 'info');

        let successCount = 0;
        let failCount = 0;

        // 连续N次战斗
        for (let i = 1; i <= battleCount; i++) {
            try {
                addOutput(`第 ${i}/${battleCount} 次 - 正在进行VIP战斗...`, 'info');

                // 战斗前先使用两次恢复卡
                addOutput(`🎴 战斗前使用恢复卡（第1次）...`, 'info');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                let useCard1Response = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });
                
                let useCard1Data = JSON.parse(await useCard1Response.text());
                if (useCard1Data.code === 200) {
                    addOutput(`✅ 恢复卡使用成功（第1次）`, 'success');
                } else if (useCard1Data.msg && useCard1Data.msg.includes('你没有战斗恢复卡可用')) {
                    addOutput(`⚠️ 没有恢复卡，尝试购买 ${cardCount} 张...`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const buyResponse = await fetch(`${getApiBaseUrl(user)}/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, {
                        method: 'POST',
                        headers: {
                            'authorization': user.sso,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const buyData = JSON.parse(await buyResponse.text());
                    if (buyData.code === 200) {
                        addOutput(`✅ 购买恢复卡成功`, 'success');
                        
                        // 购买后重新使用
                        await new Promise(resolve => setTimeout(resolve, 500));
                        useCard1Response = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                            method: 'POST',
                            headers: {
                                'authorization': user.sso,
                                'Content-Type': 'application/json'
                            }
                        });
                        useCard1Data = JSON.parse(await useCard1Response.text());
                        if (useCard1Data.code === 200) {
                            addOutput(`✅ 恢复卡使用成功（第1次）`, 'success');
                        }
                    } else {
                        addOutput(`❌ 购买恢复卡失败: ${buyData.msg}`, 'error');
                    }
                } else {
                    addOutput(`⚠️ 恢复卡使用失败（第1次）: ${useCard1Data.msg}`, 'warning');
                }

                // 第二次使用恢复卡
                addOutput(`🎴 战斗前使用恢复卡（第2次）...`, 'info');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const useCard2Response = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });
                
                const useCard2Data = JSON.parse(await useCard2Response.text());
                if (useCard2Data.code === 200) {
                    addOutput(`✅ 恢复卡使用成功（第2次）`, 'success');
                } else {
                    addOutput(`⚠️ 恢复卡使用失败（第2次）: ${useCard2Data.msg}`, 'warning');
                }

                // 延迟后开始战斗
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 直接调用 /api/fight/fight/all
                const fightResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });

                const fightText = await fightResponse.text();
                
                if (fightResponse.ok) {
                    try {
                        const fightData = JSON.parse(fightText);
                        if (fightData.code === 200) {
                            addOutput(`✅ 第 ${i} 次VIP战斗成功`, 'success');
                            if (fightData.data) {
                                const resultStr = JSON.stringify(fightData.data);
                                addOutput(`战斗结果: ${resultStr.length > 100 ? resultStr.substring(0, 100) + '...' : resultStr}`, 'info');
                            }
                            successCount++;
                        } else if (fightData.code === 500 && fightData.msg && fightData.msg.includes('战斗次数已用完')) {
                            // 战斗次数不足，先尝试使用恢复卡
                            addOutput(`⚠️ 第 ${i} 次战斗失败: ${fightData.msg}`, 'warning');
                            addOutput(`🎴 尝试使用战斗恢复卡（道具ID: 32）...`, 'info');
                            
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            const usePropResponse = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                                method: 'POST',
                                headers: {
                                    'authorization': user.sso,
                                    'Content-Type': 'application/json'
                                }
                            });

                            const usePropText = await usePropResponse.text();
                            
                            if (usePropResponse.ok) {
                                const usePropData = JSON.parse(usePropText);
                                if (usePropData.code === 200) {
                                    addOutput(`✅ 战斗恢复卡使用成功，等待500毫秒后重试战斗...`, 'success');
                                    
                                    // 延迟500毫秒后重试战斗
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    
                                    const retryResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, {
                                        method: 'POST',
                                        headers: {
                                            'authorization': user.sso,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    const retryData = JSON.parse(await retryResponse.text());
                                    if (retryData.code === 200) {
                                        addOutput(`✅ 第 ${i} 次VIP战斗成功（使用恢复卡后）`, 'success');
                                        successCount++;
                                    } else {
                                        addOutput(`❌ 第 ${i} 次战斗失败（使用恢复卡后）: ${retryData.msg}`, 'error');
                                        failCount++;
                                    }
                                } else if (usePropData.code === 500 && usePropData.msg && usePropData.msg.includes('你没有战斗恢复卡可用')) {
                                    // 没有恢复卡，尝试购买
                                    addOutput(`⚠️ 没有战斗恢复卡可用`, 'warning');
                                    addOutput(`🛒 尝试购买 ${cardCount} 张战斗恢复卡...`, 'info');
                                    
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    
                                    const buyResponse = await fetch(`${getApiBaseUrl(user)}/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, {
                                        method: 'POST',
                                        headers: {
                                            'authorization': user.sso,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    const buyText = await buyResponse.text();
                                    
                                    if (buyResponse.ok) {
                                        const buyData = JSON.parse(buyText);
                                        if (buyData.code === 200) {
                                            addOutput(`✅ 购买战斗恢复卡成功，已购买 ${cardCount} 张`, 'success');
                                            
                                            // 购买成功后再次使用恢复卡
                                            addOutput(`🎴 再次尝试使用战斗恢复卡...`, 'info');
                                            
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                            
                                            const retryUsePropResponse = await fetch(`${getApiBaseUrl(user)}/api/prop/use?id=32`, {
                                                method: 'POST',
                                                headers: {
                                                    'authorization': user.sso,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            const retryUsePropData = JSON.parse(await retryUsePropResponse.text());
                                            if (retryUsePropData.code === 200) {
                                                addOutput(`✅ 战斗恢复卡使用成功，等待500毫秒后重试战斗...`, 'success');
                                                
                                                // 延迟500毫秒后重试战斗
                                                await new Promise(resolve => setTimeout(resolve, 500));
                                                
                                                const retryResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'authorization': user.sso,
                                                        'Content-Type': 'application/json'
                                                    }
                                                });

                                                const retryData = JSON.parse(await retryResponse.text());
                                                if (retryData.code === 200) {
                                                    addOutput(`✅ 第 ${i} 次VIP战斗成功（购买并使用恢复卡后）`, 'success');
                                                    successCount++;
                                                } else {
                                                    addOutput(`❌ 第 ${i} 次战斗失败（购买并使用恢复卡后）: ${retryData.msg}`, 'error');
                                                    failCount++;
                                                }
                                            } else {
                                                addOutput(`❌ 使用战斗恢复卡失败: ${retryUsePropData.msg}`, 'error');
                                                failCount++;
                                            }
                                        } else {
                                            addOutput(`❌ 购买战斗恢复卡失败: ${buyData.msg}`, 'error');
                                            failCount++;
                                        }
                                    } else {
                                        addOutput(`❌ 购买战斗恢复卡失败: HTTP ${buyResponse.status}`, 'error');
                                        failCount++;
                                    }
                                } else {
                                    addOutput(`❌ 使用战斗恢复卡失败: ${usePropData.msg}`, 'error');
                                    failCount++;
                                }
                            } else {
                                addOutput(`❌ 使用战斗恢复卡失败: HTTP ${usePropResponse.status}`, 'error');
                                failCount++;
                            }
                        } else if (fightData.code === 500 && fightData.msg && fightData.msg.includes('金币不足')) {
                            // 金币不足，取钱
                            addOutput(`⚠️ 第 ${i} 次战斗失败: ${fightData.msg}`, 'warning');
                            
                            if (withdrawAmount > 0) {
                                addOutput(`💰 尝试从钱庄取钱 ${withdrawAmount} 金币...`, 'info');
                                
                                const withdrawResponse = await fetch(`${getApiBaseUrl(user)}/api/qianzhuang/qk?num=${withdrawAmount}`, {
                                    method: 'PUT',
                                    headers: {
                                        'authorization': user.sso,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                const withdrawData = JSON.parse(await withdrawResponse.text());
                                if (withdrawData.code === 200) {
                                    addOutput(`✅ 取钱成功，等待500毫秒后重试战斗...`, 'success');
                                    
                                    // 延迟500毫秒后重试战斗
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    
                                    const retryResponse = await fetch(`${getApiBaseUrl(user)}/api/fight/fight/all`, {
                                        method: 'POST',
                                        headers: {
                                            'authorization': user.sso,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    const retryData = JSON.parse(await retryResponse.text());
                                    if (retryData.code === 200) {
                                        addOutput(`✅ 第 ${i} 次VIP战斗成功（重试后）`, 'success');
                                        successCount++;
                                    } else {
                                        addOutput(`❌ 第 ${i} 次战斗失败（重试后）: ${retryData.msg}`, 'error');
                                        failCount++;
                                    }
                                } else {
                                    addOutput(`❌ 取钱失败: ${withdrawData.msg}`, 'error');
                                    failCount++;
                                }
                            } else {
                                addOutput(`⚠️ 未设置取钱金额，跳过此次战斗`, 'warning');
                                failCount++;
                            }
                        } else {
                            addOutput(`❌ 第 ${i} 次战斗失败: ${fightData.msg || '未知错误'}`, 'error');
                            failCount++;
                        }
                    } catch (parseError) {
                        addOutput(`❌ 第 ${i} 次战斗失败: 响应解析错误`, 'error');
                        failCount++;
                    }
                } else {
                    addOutput(`❌ 第 ${i} 次战斗失败: HTTP ${fightResponse.status}`, 'error');
                    failCount++;
                }

                // 添加延迟避免请求过快
                if (i < battleCount) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

            } catch (error) {
                addOutput(`❌ 第 ${i} 次操作失败: ${error.message}`, 'error');
                failCount++;
            }
        }

        // 输出战斗总结
        addOutput(`\n🎉 === VIP天梯操作完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总计战斗: ${battleCount} 次`, 'info');
        addOutput(`   • 战斗成功: ${successCount} 次`, 'success');
        addOutput(`   • 战斗失败: ${failCount} 次`, failCount > 0 ? 'error' : 'info');
        addOutput(`   • 成功率: ${((successCount / battleCount) * 100).toFixed(1)}%`, 
                    successCount === battleCount ? 'success' : 'warning');
        
        if (successCount === battleCount) {
            addOutput(`🎊 恭喜！所有VIP战斗都成功了！`, 'success');
            showNotification('VIP天梯战斗完成！全部成功', 'success');
        } else if (successCount > 0) {
            addOutput(`⚠️ 部分战斗成功，请检查失败的战斗`, 'warning');
            showNotification('VIP天梯战斗完成！部分成功', 'warning');
        } else {
            addOutput(`😞 所有战斗都失败了，请检查网络连接和用户权限`, 'error');
            showNotification('VIP天梯战斗失败！请检查网络和权限', 'error');
        }

    } catch (error) {
        addOutput(`💥 VIP天梯过程中发生严重错误: ${error.message}`, 'error');
        console.error('VIP天梯错误:', error);
        showNotification(`VIP天梯发生错误: ${error.message}`, 'error');
    } finally {
        vipStartBtn.disabled = false;
        vipStartBtn.classList.remove('loading');
        vipStartBtn.textContent = '👑 VIP天梯战斗';
    }
}

// 页面加载时也初始化VIP部分
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码已存在
    
    // 添加VIP部分的初始化
    populateVipUserSelect();
    
    // 监听VIP输入框变化
    const vipBattleCountInput = document.getElementById('vipBattleCount');
    const vipWithdrawAmountInput = document.getElementById('vipWithdrawAmount');
    const vipCardCountInput = document.getElementById('vipCardCount');
    if (vipBattleCountInput) {
        vipBattleCountInput.addEventListener('input', updateVipStartButtonState);
    }
    if (vipWithdrawAmountInput) {
        vipWithdrawAmountInput.addEventListener('input', updateVipStartButtonState);
    }
    if (vipCardCountInput) {
        vipCardCountInput.addEventListener('input', updateVipStartButtonState);
    }
    
    updateVipStartButtonState();
});
