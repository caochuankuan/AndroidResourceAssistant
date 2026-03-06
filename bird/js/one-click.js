// 切换按钮显示/隐藏
function toggleButtons() {
    const actionButtons = document.getElementById('actionButtons');
    const header = document.querySelector('.button-area h3');
    
    if (actionButtons.classList.contains('show')) {
        actionButtons.classList.remove('show');
        header.classList.add('collapsed');
    } else {
        actionButtons.classList.add('show');
        header.classList.remove('collapsed');
    }
}

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

// 一键执行所有操作
async function executeAllOperations() {
    const user = getSelectedUser();
    if (!user) return;

    const executeBtn = document.getElementById('oneClickExecuteBtn');
    executeBtn.disabled = true;
    executeBtn.classList.add('loading');
    executeBtn.textContent = '执行中...';

    try {
        addOutput(`\n🚀 开始为用户 "${user.name}" 执行一键操作...`, 'info');
        addOutput(`\n=== 开始执行 ===\n`, 'info');

        const operations = [
            { name: '获取用户信息', func: getUserInfo },
            { name: '签到', func: performSignIn },
            { name: '取钱10w', func: withdrawMoney },
            { name: '一键祝福', func: blessAllFriends },
            { name: '一键天梯', func: performLadder },
            { name: '工会捐赠4w金币', func: guildDonate },
            { name: '公会签到', func: guildSignIn },
            { name: '一键切磋', func: performFamilyFight },
            { name: '一键下饵（麻雀）', func: performBirdBait },
            { name: '检查任务进度', func: checkTaskProgress },
            { name: '工会捐赠100元宝', func: guildDonateYuanbao, conditional: true },
            { name: '领取任务奖励', func: claimAllRewards }
        ];

        let successCount = 0;
        let failCount = 0;
        let currentPoints = null; // 存储当前积分

        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            
            try {
                // 检查是否是条件操作且需要跳过
                if (operation.conditional && operation.name === '工会捐赠100元宝' && currentPoints !== null && currentPoints >= 100) {
                    addOutput(`⏭️ [${i + 1}/${operations.length}] 跳过 ${operation.name} (积分已达标: ${currentPoints})`, 'warning');
                    continue;
                }
                
                addOutput(`\n📋 [${i + 1}/${operations.length}] 开始执行: ${operation.name}`, 'info');
                addOutput(`⏳ 正在执行 ${operation.name}...`, 'info');
                
                // 如果是检查任务进度，获取返回的积分数据
                if (operation.name === '检查任务进度') {
                    const progressResult = await operation.func();
                    if (progressResult && progressResult.success) {
                        currentPoints = progressResult.points;
                        addOutput(`📊 当前积分: ${currentPoints}`, currentPoints >= 100 ? 'success' : 'warning');
                    }
                } else {
                    await operation.func();
                }
                
                addOutput(`✅ ${operation.name} 执行完成`, 'success');
                successCount++;
                
                // 操作间隔，避免请求过快
                if (i < operations.length - 1) {
                    addOutput(`⏱️ 等待 2 秒后执行下一个操作...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
            } catch (error) {
                addOutput(`❌ ${operation.name} 执行失败: ${error.message}`, 'error');
                failCount++;
                
                // 即使某个操作失败，也继续执行下一个
                if (i < operations.length - 1) {
                    addOutput(`⏱️ 等待 2 秒后继续执行下一个操作...`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        // 输出最终统计
        addOutput(`\n🎉 === 一键执行操作完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总计操作: ${operations.length} 个`, 'info');
        addOutput(`   • 执行成功: ${successCount} 个`, 'success');
        addOutput(`   • 执行失败: ${failCount} 个`, failCount > 0 ? 'error' : 'info');
        addOutput(`   • 成功率: ${((successCount / operations.length) * 100).toFixed(1)}%`, successCount === operations.length ? 'success' : 'warning');
        
        if (successCount === operations.length) {
            addOutput(`🎊 恭喜！所有操作都执行成功！`, 'success');
        } else if (successCount > 0) {
            addOutput(`⚠️ 部分操作执行成功，请检查失败的操作`, 'warning');
        } else {
            addOutput(`😞 所有操作都执行失败，请检查网络连接和用户权限`, 'error');
        }

    } catch (error) {
        addOutput(`💥 一键执行过程中发生严重错误: ${error.message}`, 'error');
        console.error('一键执行错误:', error);
    } finally {
        executeBtn.disabled = false;
        executeBtn.classList.remove('loading');
        executeBtn.textContent = '🚀 一键执行所有操作';
    }
}

let users = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    populateUserSelect();
});

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// 填充用户选择下拉框
function populateUserSelect() {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">请选择用户</option>';
    
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
    
    if (!selectedUserId) {
        addOutput('请先选择用户', 'warning');
        return null;
    }
    
    return users.find(user => user.id === selectedUserId);
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

// 一键下饵（麻雀）
async function performBirdBait() {
    const user = getSelectedUser();
    if (!user) return;

    const birdBaitBtn = document.getElementById('birdBaitBtn');
    birdBaitBtn.disabled = true;
    birdBaitBtn.classList.add('loading');
    birdBaitBtn.textContent = '下饵中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行一键下饵（麻雀）操作...`, 'info');
        
        // 步骤1: 先收网
        addOutput(`步骤1: 收网中...`, 'info');
        const finishResponse = await fetch(`${getApiBaseUrl(user)}/api/fowling/all/finish`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const finishText = await finishResponse.text();
        let birdIds = [];
        
        if (finishResponse.ok) {
            try {
                const finishData = JSON.parse(finishText);
                if (finishData.code === 200) {
                    addOutput(`✅ 收网成功！`, 'success');
                    
                    // 统计收获
                    const rewards = finishData.data || [];
                    let expGained = 0;
                    let birdsCount = 0;
                    
                    rewards.forEach(reward => {
                        if (reward.type === 'EXP') {
                            expGained += reward.amount;
                        } else if (reward.type === 'BIRD') {
                            birdsCount++;
                            if (reward.detail && reward.detail.id) {
                                birdIds.push(reward.detail.id);
                                addOutput(`  获得鸟类: ${reward.name} (ID: ${reward.detail.id})`, 'info');
                            }
                        }
                    });
                    
                    addOutput(`收获统计: 经验 +${expGained}, 鸟类 ${birdsCount} 只`, 'success');
                    
                } else {
                    addOutput(`❌ 收网失败: ${finishData.msg || '未知错误'}`, 'error');
                    if (finishData.msg && finishData.msg.includes('没有可收取的网')) {
                        addOutput(`提示: 可能没有下网或网还未到收取时间`, 'warning');
                    }
                }
            } catch (parseError) {
                addOutput(`❌ 收网响应解析失败`, 'error');
                addOutput(`原始响应: ${finishText}`, 'error');
            }
        } else {
            addOutput(`❌ 收网请求失败: HTTP ${finishResponse.status}`, 'error');
            addOutput(`错误信息: ${finishText}`, 'error');
        }

        // 步骤2: 卖掉收获的鸟类
        if (birdIds.length > 0) {
            addOutput(`步骤2: 卖掉收获的 ${birdIds.length} 只鸟...`, 'info');
            
            const sellResponse = await fetch(`${getApiBaseUrl(user)}/api/storage/bird/sell?id=${birdIds.join(',')}&confirm=true`, {
                method: 'POST',
                headers: {
                    'authorization': user.sso,
                    'Content-Type': 'application/json'
                }
            });

            const sellText = await sellResponse.text();
            
            if (sellResponse.ok) {
                try {
                    const sellData = JSON.parse(sellText);
                    if (sellData.code === 200) {
                        addOutput(`✅ 成功卖掉 ${birdIds.length} 只鸟`, 'success');
                        if (sellData.data) {
                            const resultStr = JSON.stringify(sellData.data);
                            addOutput(`卖鸟收益: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                        }
                    } else {
                        addOutput(`❌ 卖鸟失败: ${sellData.msg || '未知错误'}`, 'error');
                    }
                } catch (parseError) {
                    addOutput(`❌ 卖鸟响应解析失败`, 'error');
                    addOutput(`原始响应: ${sellText}`, 'error');
                }
            } else {
                addOutput(`❌ 卖鸟请求失败: HTTP ${sellResponse.status}`, 'error');
                addOutput(`错误信息: ${sellText}`, 'error');
            }
        } else {
            addOutput(`步骤2: 没有鸟类需要出售`, 'info');
        }

        // 步骤3: 一键下饵
        addOutput(`步骤3: 下饵中...`, 'info');
        
        const placeBaitResponse = await fetch(`${getApiBaseUrl(user)}/api/fowling/place/all?bid=1`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const placeBaitText = await placeBaitResponse.text();
        
        if (placeBaitResponse.ok) {
            try {
                const placeBaitData = JSON.parse(placeBaitText);
                if (placeBaitData.code === 200) {
                    addOutput(`✅ 下饵成功！`, 'success');
                    if (placeBaitData.data) {
                        const resultStr = JSON.stringify(placeBaitData.data);
                        addOutput(`下饵结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                    }
                } else if (placeBaitData.code === 500 && placeBaitData.msg && placeBaitData.msg.includes('没有该饵')) {
                    // 步骤4: 如果没有饵，先购买饵料
                    addOutput(`⚠️ 没有饵料，正在购买饵料...`, 'warning');
                    
                    const buyBaitResponse = await fetch(`${getApiBaseUrl(user)}/api/shop/buy/goods?func=BAIT&id=1&num=5`, {
                        method: 'POST',
                        headers: {
                            'authorization': user.sso,
                            'Content-Type': 'application/json'
                        }
                    });

                    const buyBaitText = await buyBaitResponse.text();
                    
                    if (buyBaitResponse.ok) {
                        try {
                            const buyBaitData = JSON.parse(buyBaitText);
                            if (buyBaitData.code === 200) {
                                addOutput(`✅ 购买饵料成功！`, 'success');
                                if (buyBaitData.data) {
                                    const resultStr = JSON.stringify(buyBaitData.data);
                                    addOutput(`购买结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                                }
                                
                                // 再次尝试下饵
                                addOutput(`重新尝试下饵...`, 'info');
                                
                                const retryPlaceBaitResponse = await fetch(`${getApiBaseUrl(user)}/api/fowling/place/all?bid=1`, {
                                    method: 'POST',
                                    headers: {
                                        'authorization': user.sso,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                const retryPlaceBaitText = await retryPlaceBaitResponse.text();
                                
                                if (retryPlaceBaitResponse.ok) {
                                    try {
                                        const retryPlaceBaitData = JSON.parse(retryPlaceBaitText);
                                        if (retryPlaceBaitData.code === 200) {
                                            addOutput(`✅ 重新下饵成功！`, 'success');
                                            if (retryPlaceBaitData.data) {
                                                const resultStr = JSON.stringify(retryPlaceBaitData.data);
                                                addOutput(`下饵结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                                            }
                                        } else {
                                            addOutput(`❌ 重新下饵失败: ${retryPlaceBaitData.msg || '未知错误'}`, 'error');
                                        }
                                    } catch (parseError) {
                                        addOutput(`❌ 重新下饵响应解析失败`, 'error');
                                        addOutput(`原始响应: ${retryPlaceBaitText}`, 'error');
                                    }
                                } else {
                                    addOutput(`❌ 重新下饵请求失败: HTTP ${retryPlaceBaitResponse.status}`, 'error');
                                    addOutput(`错误信息: ${retryPlaceBaitText}`, 'error');
                                }
                                
                            } else {
                                addOutput(`❌ 购买饵料失败: ${buyBaitData.msg || '未知错误'}`, 'error');
                            }
                        } catch (parseError) {
                            addOutput(`❌ 购买饵料响应解析失败`, 'error');
                            addOutput(`原始响应: ${buyBaitText}`, 'error');
                        }
                    } else {
                        addOutput(`❌ 购买饵料请求失败: HTTP ${buyBaitResponse.status}`, 'error');
                        addOutput(`错误信息: ${buyBaitText}`, 'error');
                    }
                    
                } else {
                    addOutput(`❌ 下饵失败: ${placeBaitData.msg || '未知错误'}`, 'error');
                }
            } catch (parseError) {
                addOutput(`❌ 下饵响应解析失败`, 'error');
                addOutput(`原始响应: ${placeBaitText}`, 'error');
            }
        } else {
            addOutput(`❌ 下饵请求失败: HTTP ${placeBaitResponse.status}`, 'error');
            addOutput(`错误信息: ${placeBaitText}`, 'error');
        }

        addOutput(`\n=== 一键下饵（麻雀）操作完成 ===`, 'info');
        
    } catch (error) {
        addOutput(`一键下饵操作失败: ${error.message}`, 'error');
        console.error('一键下饵错误:', error);
    } finally {
        birdBaitBtn.disabled = false;
        birdBaitBtn.classList.remove('loading');
        birdBaitBtn.textContent = '一键下饵（麻雀）';
    }
}

// 一键切磋
async function performFamilyFight() {
    const user = getSelectedUser();
    if (!user) return;

    const familyFightBtn = document.getElementById('familyFightBtn');
    familyFightBtn.disabled = true;
    familyFightBtn.classList.add('loading');
    familyFightBtn.textContent = '切磋中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行一键切磋操作...`, 'info');
        
        // 获取家族列表
        addOutput(`正在获取家族列表...`, 'info');
        const listResponse = await fetch(`${getApiBaseUrl(user)}/api/task/family/list?page=0`, {
            method: 'GET',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        if (!listResponse.ok) {
            throw new Error(`获取家族列表失败: HTTP ${listResponse.status}`);
        }

        const listText = await listResponse.text();
        const listData = JSON.parse(listText);

        if (listData.code !== 200) {
            throw new Error(`获取家族列表失败: ${listData.msg || '未知错误'}`);
        }

        const familyList = listData.data.content || [];
        if (familyList.length === 0) {
            addOutput('家族列表为空，无法进行切磋', 'warning');
            return;
        }

        // 获取第一个家族的id
        const firstFamily = familyList[0];
        const familyId = firstFamily.id;
        
        addOutput(`获取到家族列表，共 ${familyList.length} 个家族`, 'info');
        addOutput(`目标家族: ${firstFamily.name} (ID: ${familyId}, 等级: ${firstFamily.level})`, 'info');
        addOutput(`开始进行5次切磋...`, 'info');

        let successCount = 0;
        let failCount = 0;

        // 进行5次切磋
        for (let i = 1; i <= 5; i++) {
            try {
                addOutput(`正在进行第 ${i}/5 次切磋...`, 'info');
                
                const fightResponse = await fetch(`${getApiBaseUrl(user)}/api/task/family?id=${familyId}`, {
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
                            addOutput(`✅ 第 ${i} 次切磋成功`, 'success');
                            if (fightData.data) {
                                const resultStr = JSON.stringify(fightData.data);
                                addOutput(`切磋结果: ${resultStr.length > 100 ? resultStr.substring(0, 100) + '...' : resultStr}`, 'info');
                            }
                            successCount++;
                        } else {
                            addOutput(`❌ 第 ${i} 次切磋失败: ${fightData.msg || '未知错误'}`, 'error');
                            if (fightData.data) {
                                addOutput(`错误数据: ${JSON.stringify(fightData.data)}`, 'error');
                            }
                            failCount++;
                        }
                    } catch (parseError) {
                        addOutput(`❌ 第 ${i} 次切磋失败: 响应解析错误`, 'error');
                        addOutput(`原始响应: ${fightText}`, 'error');
                        failCount++;
                    }
                } else {
                    addOutput(`❌ 第 ${i} 次切磋失败: HTTP ${fightResponse.status}`, 'error');
                    failCount++;
                }

                // 添加延迟避免请求过快
                if (i < 5) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

            } catch (error) {
                addOutput(`❌ 第 ${i} 次切磋失败: ${error.message}`, 'error');
                failCount++;
            }
        }

        // 输出切磋总结
        addOutput(`\n=== 一键切磋操作完成 ===`, 'info');
        addOutput(`目标家族: ${firstFamily.name} (ID: ${familyId})`, 'info');
        addOutput(`总计切磋: 5次`, 'info');
        addOutput(`切磋成功: ${successCount}`, 'success');
        addOutput(`切磋失败: ${failCount}`, failCount > 0 ? 'error' : 'info');
        
    } catch (error) {
        addOutput(`一键切磋操作失败: ${error.message}`, 'error');
        console.error('一键切磋错误:', error);
    } finally {
        familyFightBtn.disabled = false;
        familyFightBtn.classList.remove('loading');
        familyFightBtn.textContent = '一键切磋';
    }
}

// 领取任务奖励
async function claimAllRewards() {
    const user = getSelectedUser();
    if (!user) return;

    const claimRewardsBtn = document.getElementById('claimRewardsBtn');
    claimRewardsBtn.disabled = true;
    claimRewardsBtn.classList.add('loading');
    claimRewardsBtn.textContent = '领取中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行领取任务奖励操作...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/activity/claim/all`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200) {
                    addOutput(`✅ 领取任务奖励成功！`, 'success');
                    addOutput(`响应消息: ${data.msg || '操作成功'}`, 'info');
                    if (data.data) {
                        addOutput(`奖励详情: ${JSON.stringify(data.data)}`, 'success');
                    }
                } else {
                    addOutput(`❌ 领取任务奖励失败: ${data.msg || '未知错误'}`, 'error');
                    addOutput(`错误代码: ${data.code}`, 'error');
                    if (data.data) {
                        addOutput(`错误数据: ${JSON.stringify(data.data)}`, 'error');
                    }
                }
            } catch (parseError) {
                addOutput(`❌ 解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
            }
        } else {
            addOutput(`❌ 领取任务奖励失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`领取任务奖励请求失败: ${error.message}`, 'error');
        console.error('领取任务奖励错误:', error);
    } finally {
        claimRewardsBtn.disabled = false;
        claimRewardsBtn.classList.remove('loading');
        claimRewardsBtn.textContent = '领取任务奖励';
    }
}

// 公会签到
async function guildSignIn() {
    const user = getSelectedUser();
    if (!user) return;

    const guildSignInBtn = document.getElementById('guildSignInBtn');
    guildSignInBtn.disabled = true;
    guildSignInBtn.classList.add('loading');
    guildSignInBtn.textContent = '签到中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行公会签到操作...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/guild/salary`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200) {
                    addOutput(`✅ 公会签到成功！`, 'success');
                    addOutput(`响应消息: ${data.msg || '操作成功'}`, 'info');
                    if (data.data) {
                        addOutput(`签到奖励: ${JSON.stringify(data.data)}`, 'success');
                    }
                } else {
                    addOutput(`❌ 公会签到失败: ${data.msg || '未知错误'}`, 'error');
                    addOutput(`错误代码: ${data.code}`, 'error');
                    if (data.data) {
                        addOutput(`错误数据: ${JSON.stringify(data.data)}`, 'error');
                    }
                }
            } catch (parseError) {
                addOutput(`❌ 解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
            }
        } else {
            addOutput(`❌ 公会签到失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`公会签到请求失败: ${error.message}`, 'error');
        console.error('公会签到错误:', error);
    } finally {
        guildSignInBtn.disabled = false;
        guildSignInBtn.classList.remove('loading');
        guildSignInBtn.textContent = '公会签到';
    }
}

// 工会捐赠100元宝
async function guildDonateYuanbao() {
    const user = getSelectedUser();
    if (!user) return;

    const guildDonateYuanbaoBtn = document.getElementById('guildDonateYuanbaoBtn');
    guildDonateYuanbaoBtn.disabled = true;
    guildDonateYuanbaoBtn.classList.add('loading');
    guildDonateYuanbaoBtn.textContent = '捐赠中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行工会元宝捐赠操作...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/guild/donateOk?ft=3&fp=100`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200) {
                    addOutput(`✅ 工会元宝捐赠成功！`, 'success');
                    addOutput(`捐赠金额: 100 元宝`, 'success');
                    addOutput(`响应消息: ${data.msg || '操作成功'}`, 'info');
                    if (data.data) {
                        addOutput(`响应数据: ${JSON.stringify(data.data)}`, 'info');
                    }
                } else {
                    addOutput(`❌ 工会元宝捐赠失败: ${data.msg || '未知错误'}`, 'error');
                    addOutput(`错误代码: ${data.code}`, 'error');
                    if (data.data) {
                        addOutput(`错误数据: ${JSON.stringify(data.data)}`, 'error');
                    }
                }
            } catch (parseError) {
                addOutput(`❌ 解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
            }
        } else {
            addOutput(`❌ 工会元宝捐赠失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`工会元宝捐赠请求失败: ${error.message}`, 'error');
        console.error('工会元宝捐赠错误:', error);
    } finally {
        guildDonateYuanbaoBtn.disabled = false;
        guildDonateYuanbaoBtn.classList.remove('loading');
        guildDonateYuanbaoBtn.textContent = '工会捐赠100元宝';
    }
}

// 工会捐赠4w金币
async function guildDonate() {
    const user = getSelectedUser();
    if (!user) return;

    const guildDonateBtn = document.getElementById('guildDonateBtn');
    guildDonateBtn.disabled = true;
    guildDonateBtn.classList.add('loading');
    guildDonateBtn.textContent = '捐赠中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行工会捐赠操作...`, 'info');
        addOutput(`将进行2次捐赠，每次2万金币，总计4万金币`, 'info');
        
        let successCount = 0;
        let failCount = 0;

        // 执行两次捐赠
        for (let i = 1; i <= 2; i++) {
            try {
                addOutput(`正在进行第 ${i}/2 次捐赠...`, 'info');
                
                const response = await fetch(`${getApiBaseUrl(user)}/api/guild/donateOk?ft=1&fp=20000`, {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });

                const responseText = await response.text();
                
                if (response.ok) {
                    try {
                        const data = JSON.parse(responseText);
                        if (data.code === 200) {
                            addOutput(`✅ 第 ${i} 次捐赠成功！`, 'success');
                            addOutput(`捐赠金额: 20,000 金币`, 'success');
                            addOutput(`响应消息: ${data.msg || '操作成功'}`, 'info');
                            if (data.data) {
                                addOutput(`响应数据: ${JSON.stringify(data.data)}`, 'info');
                            }
                            successCount++;
                        } else {
                            addOutput(`❌ 第 ${i} 次捐赠失败: ${data.msg || '未知错误'}`, 'error');
                            addOutput(`错误代码: ${data.code}`, 'error');
                            if (data.data) {
                                addOutput(`错误数据: ${JSON.stringify(data.data)}`, 'error');
                            }
                            failCount++;
                        }
                    } catch (parseError) {
                        addOutput(`❌ 第 ${i} 次捐赠失败: 解析响应数据失败`, 'error');
                        addOutput(`原始响应: ${responseText}`, 'error');
                        failCount++;
                    }
                } else {
                    addOutput(`❌ 第 ${i} 次捐赠失败: HTTP ${response.status}`, 'error');
                    addOutput(`错误信息: ${responseText}`, 'error');
                    failCount++;
                }

                // 添加延迟避免请求过快
                if (i < 2) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (error) {
                addOutput(`❌ 第 ${i} 次捐赠请求失败: ${error.message}`, 'error');
                failCount++;
            }
        }

        // 输出捐赠总结
        addOutput(`\n=== 工会捐赠操作完成 ===`, 'info');
        addOutput(`总计捐赠次数: 2次`, 'info');
        addOutput(`成功捐赠: ${successCount} 次`, 'success');
        addOutput(`失败捐赠: ${failCount} 次`, failCount > 0 ? 'error' : 'info');
        addOutput(`总计捐赠金额: ${successCount * 20000} 金币`, 'success');
        
    } catch (error) {
        addOutput(`工会捐赠操作失败: ${error.message}`, 'error');
        console.error('工会捐赠错误:', error);
    } finally {
        guildDonateBtn.disabled = false;
        guildDonateBtn.classList.remove('loading');
        guildDonateBtn.textContent = '工会捐赠4w金币';
    }
}

// 一键天梯
async function performLadder() {
    const user = getSelectedUser();
    if (!user) return;

    const ladderBtn = document.getElementById('ladderBtn');
    ladderBtn.disabled = true;
    ladderBtn.classList.add('loading');
    ladderBtn.textContent = '天梯中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行一键天梯操作...`, 'info');
        addOutput(`将进行15次战斗，每次都会重新获取最后一个对手`, 'info');

        let successCount = 0;
        let failCount = 0;

        // 连续15次战斗，每次都重新获取目标
        for (let i = 1; i <= 15; i++) {
            try {
                // 获取天梯列表
                addOutput(`第 ${i}/15 次 - 正在获取天梯列表...`, 'info');
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

                // 获取最后一个uid
                const lastPlayer = ladderList[ladderList.length - 1];
                const targetUid = lastPlayer.uid;
                
                addOutput(`第 ${i}/15 次 - 目标对手: UID ${targetUid}, 积分: ${lastPlayer.points}, 排名: ${lastPlayer.rank}`, 'info');

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
                            addOutput(`✅ 第 ${i} 次战斗成功`, 'success');
                            if (fightData.data) {
                                const resultStr = JSON.stringify(fightData.data);
                                addOutput(`战斗结果: ${resultStr.length > 50 ? resultStr.substring(0, 50) + '...' : resultStr}`, 'info');
                            }
                            successCount++;
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
                if (i < 15) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

            } catch (error) {
                addOutput(`❌ 第 ${i} 次操作失败: ${error.message}`, 'error');
                failCount++;
            }
        }

        // 输出战斗总结
        addOutput(`\n=== 一键天梯操作完成 ===`, 'info');
        addOutput(`总计战斗: 15次`, 'info');
        addOutput(`战斗成功: ${successCount}`, 'success');
        addOutput(`战斗失败: ${failCount}`, failCount > 0 ? 'error' : 'info');
        
    } catch (error) {
        addOutput(`一键天梯操作失败: ${error.message}`, 'error');
        console.error('一键天梯错误:', error);
    } finally {
        ladderBtn.disabled = false;
        ladderBtn.classList.remove('loading');
        ladderBtn.textContent = '一键天梯';
    }
}

// 一键祝福所有好友
async function blessAllFriends() {
    const user = getSelectedUser();
    if (!user) return;

    const blessAllBtn = document.getElementById('blessAllBtn');
    blessAllBtn.disabled = true;
    blessAllBtn.classList.add('loading');
    blessAllBtn.textContent = '祝福中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行一键祝福操作...`, 'info');
        
        let page = 0;
        let totalSuccessCount = 0;
        let totalFailCount = 0;
        let totalFriendsCount = 0;
        let hasMore = true;

        while (hasMore) {
            try {
                // 获取当前页好友列表
                addOutput(`正在获取好友列表第 ${page + 1} 页...`, 'info');
                
                const response = await fetch(`${getApiBaseUrl(user)}/api/friend/list?page=${page}&keyword=`, {
                    method: 'GET',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`获取好友列表失败: HTTP ${response.status}`);
                }

                const responseText = await response.text();
                const data = JSON.parse(responseText);

                if (data.code !== 200) {
                    throw new Error(`获取好友列表失败: ${data.msg || '未知错误'}`);
                }

                const friends = data.data.content || [];
                addOutput(`第 ${page + 1} 页获取到 ${friends.length} 个好友`, 'info');

                if (friends.length === 0) {
                    hasMore = false;
                    break;
                }

                // 祝福当前页的所有好友
                let pageSuccessCount = 0;
                let pageFailCount = 0;
                let shouldStop = false;

                for (let i = 0; i < friends.length; i++) {
                    const friendData = friends[i];
                    if (!friendData.player || !friendData.player.uid || !friendData.player.nickname) {
                        continue;
                    }

                    const friend = {
                        uid: friendData.player.uid,
                        nickname: friendData.player.nickname,
                        level: friendData.player.levelInfo?.currentLevel?.level || 0,
                        online: friendData.player.online || false
                    };

                    try {
                        addOutput(`正在祝福第 ${page + 1} 页好友 ${i + 1}/${friends.length}: ${friend.nickname} (UID: ${friend.uid})`, 'info');
                        
                        const blessResponse = await fetch(`${getApiBaseUrl(user)}/api/fowling/all/bless?uid=${friend.uid}`, {
                            method: 'POST',
                            headers: {
                                'authorization': user.sso,
                                'Content-Type': 'application/json'
                            }
                        });

                        const blessResponseText = await blessResponse.text();
                        
                        if (blessResponse.ok) {
                            try {
                                const blessData = JSON.parse(blessResponseText);
                                if (blessData.code === 200) {
                                    if (blessData.data) {
                                        addOutput(`祝福结果: ${JSON.stringify(blessData.data)}`, 'info');
                                        // 检查是否包含祝福次数限制
                                        const dataStr = JSON.stringify(blessData.data);
                                        if (dataStr.includes('只能祝福600次')) {
                                            addOutput(`⚠️ 检测到祝福次数限制，停止祝福操作`, 'warning');
                                            shouldStop = true;
                                            break;
                                        }
                                    }
                                    pageSuccessCount++;
                                } else {
                                    addOutput(`❌ 祝福失败: ${friend.nickname} - ${blessData.msg || '未知错误'}`, 'error');
                                    if (blessData.data) {
                                        addOutput(`响应数据: ${JSON.stringify(blessData.data)}`, 'error');
                                        // 检查是否包含祝福次数限制
                                        const dataStr = JSON.stringify(blessData.data);
                                        if (dataStr.includes('只能祝福600次')) {
                                            addOutput(`⚠️ 检测到祝福次数限制，停止祝福操作`, 'warning');
                                            shouldStop = true;
                                            break;
                                        }
                                    }
                                    pageFailCount++;
                                }
                            } catch (parseError) {
                                addOutput(`❌ 祝福失败: ${friend.nickname} - 响应解析错误`, 'error');
                                pageFailCount++;
                            }
                        } else {
                            addOutput(`❌ 祝福失败: ${friend.nickname} - HTTP ${blessResponse.status}`, 'error');
                            pageFailCount++;
                        }

                        // 添加延迟避免请求过快
                        if (i < friends.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }

                    } catch (error) {
                        addOutput(`❌ 祝福失败: ${friend.nickname} - ${error.message}`, 'error');
                        pageFailCount++;
                    }

                    // 如果检测到祝福次数限制，跳出循环
                    if (shouldStop) {
                        break;
                    }
                }

                // 当前页祝福完成统计
                totalFriendsCount += friends.length;
                totalSuccessCount += pageSuccessCount;
                totalFailCount += pageFailCount;
                
                addOutput(`第 ${page + 1} 页祝福完成 - 成功: ${pageSuccessCount}, 失败: ${pageFailCount}`, 'info');

                // 检查是否还有更多页面
                if (shouldStop) {
                    hasMore = false;
                    addOutput(`因祝福次数限制，停止获取更多页面`, 'warning');
                } else {
                    hasMore = friends.length > 0;
                }
                page++;

                // 如果还有下一页，添加延迟
                if (hasMore) {
                    addOutput(`准备获取第 ${page + 1} 页...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 20));
                }

            } catch (error) {
                addOutput(`处理第 ${page + 1} 页时出错: ${error.message}`, 'error');
                hasMore = false;
            }
        }

        // 输出最终统计
        addOutput(`\n=== 一键祝福操作完成 ===`, 'info');
        addOutput(`总计处理页数: ${page}`, 'info');
        addOutput(`总计好友数: ${totalFriendsCount}`, 'info');
        addOutput(`祝福成功: ${totalSuccessCount}`, 'success');
        addOutput(`祝福失败: ${totalFailCount}`, totalFailCount > 0 ? 'error' : 'info');
        
    } catch (error) {
        addOutput(`一键祝福操作失败: ${error.message}`, 'error');
        console.error('一键祝福错误:', error);
    } finally {
        blessAllBtn.disabled = false;
        blessAllBtn.classList.remove('loading');
        blessAllBtn.textContent = '一键祝福';
    }
}

// 取钱操作
async function withdrawMoney() {
    const user = getSelectedUser();
    if (!user) return;

    const withdrawBtn = document.getElementById('withdrawBtn');
    withdrawBtn.disabled = true;
    withdrawBtn.classList.add('loading');
    withdrawBtn.textContent = '取钱中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行取钱操作...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/qianzhuang/qk?num=100000`, {
            method: 'PUT',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200) {
                    addOutput(`取钱成功！`, 'success');
                    addOutput(`取钱金额: 100,000`, 'success');
                    addOutput(`响应消息: ${data.msg || '操作成功'}`, 'info');
                    if (data.data) {
                        addOutput(`响应数据: ${JSON.stringify(data.data)}`, 'info');
                    }
                } else {
                    addOutput(`取钱失败: ${data.msg || '未知错误'}`, 'error');
                    addOutput(`错误代码: ${data.code}`, 'error');
                }
            } catch (parseError) {
                addOutput(`解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
            }
        } else {
            addOutput(`取钱失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`取钱请求失败: ${error.message}`, 'error');
        console.error('取钱错误:', error);
    } finally {
        withdrawBtn.disabled = false;
        withdrawBtn.classList.remove('loading');
        withdrawBtn.textContent = '取钱10w';
    }
}

// 检查任务进度
async function checkTaskProgress() {
    const user = getSelectedUser();
    if (!user) return;

    const taskProgressBtn = document.getElementById('taskProgressBtn');
    taskProgressBtn.disabled = true;
    taskProgressBtn.classList.add('loading');
    taskProgressBtn.textContent = '检查中...';

    try {
        addOutput(`开始为用户 "${user.name}" 检查任务进度...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/activity/points?includeDetails=true`, {
            method: 'GET',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200 && data.data) {
                    const points = data.data.points || 0;
                    const claimedRewards = data.data.claimedRewards || [];
                    const activityTypeDetails = data.data.activityTypeDetails || [];
                    
                    addOutput(`任务进度检查成功！`, 'success');
                    addOutput(`当前积分: ${points}`, points >= 100 ? 'success' : 'warning');
                    addOutput(`已领取奖励: [${claimedRewards.join(', ')}]`, 'info');
                    
                    // 显示各项任务详情
                    if (activityTypeDetails.length > 0) {
                        addOutput(`任务详情:`, 'info');
                        activityTypeDetails.forEach(detail => {
                            const typeName = getActivityTypeName(detail.type);
                            addOutput(`  ${typeName}: ${detail.currentPoints} 分`, 'info');
                        });
                    }
                    
                    // 根据积分显示提示
                    if (points < 100) {
                        addOutput(`⚠️ 任务进度没达到100，请手动检查`, 'warning');
                        // 显示toast提示
                        showToast('任务进度没达到100，请手动检查', 'warning');
                    } else {
                        addOutput(`✅ 已达到100，已完成`, 'success');
                        // 显示toast提示
                        showToast('已达到100，已完成', 'success');
                    }

                    // 返回积分数据供批量执行使用
                    return { points: points, success: true };
                } else {
                    addOutput(`检查任务进度失败: ${data.msg || '未知错误'}`, 'error');
                    return { points: null, success: false };
                }
            } catch (parseError) {
                addOutput(`解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
                return { points: null, success: false };
            }
        } else {
            addOutput(`检查任务进度失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
            return { points: null, success: false };
        }
        
    } catch (error) {
        addOutput(`检查任务进度请求失败: ${error.message}`, 'error');
        console.error('检查任务进度错误:', error);
        return { points: null, success: false };
    } finally {
        taskProgressBtn.disabled = false;
        taskProgressBtn.classList.remove('loading');
        taskProgressBtn.textContent = '任务进度';
    }
}

// 获取活动类型中文名称
function getActivityTypeName(type) {
    const typeNames = {
        'DAILY_SIGN': '每日签到',
        'FAMILY_ACTIVITY': '家族活动',
        'CATCH_BIRD': '捕鸟',
        'GUILD_SALARY': '公会工资',
        'LADDER_WIN': '天梯胜利',
        'BREEDING': '繁殖',
        'GUILD_DONATE_MONEY': '公会捐赠金币',
        'GUILD_DONATE_TREASURE': '公会捐赠元宝',
        'BLESSING': '祝福'
    };
    return typeNames[type] || type;
}

// 显示Toast提示
function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        transform: translateX(100%);
    `;
    
    // 根据类型设置背景色
    switch(type) {
        case 'success':
            toast.style.backgroundColor = '#28a745';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ffc107';
            toast.style.color = '#333';
            break;
        case 'error':
            toast.style.backgroundColor = '#dc3545';
            break;
        default:
            toast.style.backgroundColor = '#17a2b8';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 获取用户信息
async function getUserInfo() {
    const user = getSelectedUser();
    if (!user) return;

    const getUserInfoBtn = document.getElementById('getUserInfoBtn');
    getUserInfoBtn.disabled = true;
    getUserInfoBtn.classList.add('loading');
    getUserInfoBtn.textContent = '获取中...';

    try {
        addOutput(`开始为用户 "${user.name}" 获取用户信息...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/player/info`, {
            method: 'GET',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.code === 200 && data.data && data.data.nickname) {
                    addOutput(`获取用户信息成功！`, 'success');
                    addOutput(`用户昵称: ${data.data.nickname}`, 'success');
                    addOutput(`用户ID: ${data.data.uid}`, 'info');
                    addOutput(`等级: ${data.data.levelInfo.currentLevel.level}`, 'info');
                    addOutput(`VIP等级: ${data.data.vipLevel}`, 'info');
                } else {
                    addOutput(`获取用户信息失败: ${data.msg || '未知错误'}`, 'error');
                }
            } catch (parseError) {
                addOutput(`解析响应数据失败`, 'error');
                addOutput(`原始响应: ${responseText}`, 'error');
            }
        } else {
            addOutput(`获取用户信息失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`获取用户信息请求失败: ${error.message}`, 'error');
        console.error('获取用户信息错误:', error);
    } finally {
        getUserInfoBtn.disabled = false;
        getUserInfoBtn.classList.remove('loading');
        getUserInfoBtn.textContent = '获取用户信息';
    }
}

// 执行签到操作
async function performSignIn() {
    const user = getSelectedUser();
    if (!user) return;

    const signInBtn = document.getElementById('signInBtn');
    signInBtn.disabled = true;
    signInBtn.classList.add('loading');
    signInBtn.textContent = '签到中...';

    try {
        addOutput(`开始为用户 "${user.name}" 执行签到操作...`, 'info');
        
        const response = await fetch(`${getApiBaseUrl(user)}/api/task/dailyfeed`, {
            method: 'POST',
            headers: {
                'authorization': user.sso,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        
        if (response.ok) {
            addOutput(`签到成功！`, 'success');
            addOutput(`响应状态: ${response.status}`, 'info');
            addOutput(`响应内容: ${responseText}`, 'success');
        } else {
            addOutput(`签到失败！`, 'error');
            addOutput(`响应状态: ${response.status}`, 'error');
            addOutput(`错误信息: ${responseText}`, 'error');
        }
        
    } catch (error) {
        addOutput(`签到请求失败: ${error.message}`, 'error');
        console.error('签到错误:', error);
    } finally {
        signInBtn.disabled = false;
        signInBtn.classList.remove('loading');
        signInBtn.textContent = '签到';
    }
}

// 监听用户选择变化
document.getElementById('userSelect').addEventListener('change', function() {
    const selectedUser = getSelectedUser();
    if (selectedUser) {
        addOutput(`已选择用户: ${selectedUser.name}`, 'info');
    }
});

// 批量执行相关函数
let selectedUserIds = new Set();

// 显示批量执行模态窗口
function showBatchExecuteModal() {
    if (users.length === 0) {
        addOutput('没有可用的用户，请先在用户管理页面添加用户', 'warning');
        showToast('没有可用的用户，请先添加用户', 'warning');
        return;
    }

    const modal = document.getElementById('batchExecuteModal');
    const userList = document.getElementById('batchUserList');
    
    // 清空之前的选择
    selectedUserIds.clear();
    
    // 生成用户列表
    userList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.onclick = () => toggleUserSelection(user.id);
        
        userItem.innerHTML = `
            <input type="checkbox" class="user-checkbox" id="checkbox-${user.id}" onchange="toggleUserSelection('${user.id}')">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-details">ID: ${user.id}</div>
            </div>
        `;
        
        userList.appendChild(userItem);
    });
    
    modal.style.display = 'block';
}

// 关闭批量执行模态窗口
function closeBatchExecuteModal() {
    const modal = document.getElementById('batchExecuteModal');
    modal.style.display = 'none';
    selectedUserIds.clear();
}

// 切换用户选择状态
function toggleUserSelection(userId) {
    const checkbox = document.getElementById(`checkbox-${userId}`);
    const userItem = checkbox.closest('.user-item');
    
    if (selectedUserIds.has(userId)) {
        selectedUserIds.delete(userId);
        checkbox.checked = false;
        userItem.classList.remove('selected');
    } else {
        selectedUserIds.add(userId);
        checkbox.checked = true;
        userItem.classList.add('selected');
    }
}

// 全选用户
function selectAllUsers() {
    users.forEach(user => {
        selectedUserIds.add(user.id);
        const checkbox = document.getElementById(`checkbox-${user.id}`);
        const userItem = checkbox.closest('.user-item');
        checkbox.checked = true;
        userItem.classList.add('selected');
    });
}

// 全不选用户
function deselectAllUsers() {
    selectedUserIds.clear();
    users.forEach(user => {
        const checkbox = document.getElementById(`checkbox-${user.id}`);
        const userItem = checkbox.closest('.user-item');
        checkbox.checked = false;
        userItem.classList.remove('selected');
    });
}

// 反选用户
function invertSelection() {
    users.forEach(user => {
        if (selectedUserIds.has(user.id)) {
            selectedUserIds.delete(user.id);
            const checkbox = document.getElementById(`checkbox-${user.id}`);
            const userItem = checkbox.closest('.user-item');
            checkbox.checked = false;
            userItem.classList.remove('selected');
        } else {
            selectedUserIds.add(user.id);
            const checkbox = document.getElementById(`checkbox-${user.id}`);
            const userItem = checkbox.closest('.user-item');
            checkbox.checked = true;
            userItem.classList.add('selected');
        }
    });
}

// 执行批量操作
async function executeBatchOperations() {
    if (selectedUserIds.size === 0) {
        showToast('请至少选择一个用户', 'warning');
        return;
    }

    const confirmBtn = document.querySelector('.confirm-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = '执行中...';

    try {
        const selectedUsers = users.filter(user => selectedUserIds.has(user.id));
        
        addOutput(`\n🚀 开始批量执行操作...`, 'info');
        addOutput(`选中用户数量: ${selectedUsers.length}`, 'info');
        addOutput(`用户列表: ${selectedUsers.map(u => u.name).join(', ')}`, 'info');
        addOutput(`\n=== 批量执行开始 ===\n`, 'info');

        // 立即关闭模态窗口，让用户看到执行进度
        closeBatchExecuteModal();

        let totalSuccessUsers = 0;
        let totalFailUsers = 0;
        let userPointsResults = []; // 存储每个用户的积分结果

        // 为每个选中的用户执行操作
        for (let i = 0; i < selectedUsers.length; i++) {
            const user = selectedUsers[i];
            let userPoints = null;
            
            try {
                addOutput(`\n👤 [${i + 1}/${selectedUsers.length}] 开始为用户 "${user.name}" 执行操作...`, 'info');
                
                // 临时设置当前用户
                const userSelect = document.getElementById('userSelect');
                const originalValue = userSelect.value;
                userSelect.value = user.id;

                // 执行所有操作
                const operations = [
                    { name: '获取用户信息', func: getUserInfo },
                    { name: '签到', func: performSignIn },
                    { name: '取钱10w', func: withdrawMoney },
                    { name: '一键祝福', func: blessAllFriends },
                    { name: '一键天梯', func: performLadder },
                    { name: '工会捐赠4w金币', func: guildDonate },
                    { name: '公会签到', func: guildSignIn },
                    { name: '一键切磋', func: performFamilyFight },
                    { name: '一键下饵（麻雀）', func: performBirdBait },
                    { name: '检查任务进度', func: checkTaskProgress },
                    { name: '工会捐赠100元宝', func: guildDonateYuanbao, conditional: true },
                    { name: '领取任务奖励', func: claimAllRewards }
                ];

                let userSuccessCount = 0;
                let userFailCount = 0;

                for (let j = 0; j < operations.length; j++) {
                    const operation = operations[j];
                    
                    try {
                        // 检查是否是条件操作且需要跳过
                        if (operation.conditional && operation.name === '工会捐赠100元宝' && userPoints !== null && userPoints >= 100) {
                            addOutput(`  ⏭️ [${j + 1}/${operations.length}] 跳过 ${operation.name} (积分已达标: ${userPoints})`, 'warning');
                            continue;
                        }
                        
                        addOutput(`  📋 [${j + 1}/${operations.length}] ${operation.name}...`, 'info');
                        
                        // 如果是检查任务进度，获取返回的积分数据
                        if (operation.name === '检查任务进度') {
                            const progressResult = await operation.func();
                            if (progressResult && progressResult.success) {
                                userPoints = progressResult.points;
                            }
                        } else {
                            await operation.func();
                        }
                        
                        userSuccessCount++;
                        
                        // 操作间隔
                        if (j < operations.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        
                    } catch (error) {
                        addOutput(`  ❌ ${operation.name} 失败: ${error.message}`, 'error');
                        userFailCount++;
                        
                        // 即使失败也继续下一个操作
                        if (j < operations.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }

                // 所有操作完成后，再次检查积分获取最终结果
                try {
                    addOutput(`  📊 获取最终积分...`, 'info');
                    const finalProgressResult = await checkTaskProgress();
                    if (finalProgressResult && finalProgressResult.success) {
                        userPoints = finalProgressResult.points;
                        addOutput(`  ✅ 最终积分: ${userPoints}`, userPoints >= 100 ? 'success' : 'warning');
                    }
                } catch (finalError) {
                    addOutput(`  ❌ 获取最终积分失败: ${finalError.message}`, 'error');
                }

                // 恢复原始用户选择
                userSelect.value = originalValue;

                // 用户操作统计
                addOutput(`✅ 用户 "${user.name}" 操作完成 - 成功: ${userSuccessCount}, 失败: ${userFailCount}`, 
                            userFailCount === 0 ? 'success' : 'warning');
                
                if (userFailCount === 0) {
                    totalSuccessUsers++;
                } else {
                    totalFailUsers++;
                }

                // 记录用户积分结果
                userPointsResults.push({
                    name: user.name,
                    points: userPoints,
                    success: userFailCount === 0
                });

                // 用户间隔
                if (i < selectedUsers.length - 1) {
                    addOutput(`⏱️ 等待 3 秒后处理下一个用户...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                addOutput(`💥 用户 "${user.name}" 处理失败: ${error.message}`, 'error');
                totalFailUsers++;
                
                // 即使失败也记录结果
                userPointsResults.push({
                    name: user.name,
                    points: null,
                    success: false,
                    error: error.message
                });
            }
        }

        // 批量执行总结
        addOutput(`\n🎉 === 批量执行操作完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总计用户: ${selectedUsers.length} 个`, 'info');
        addOutput(`   • 完全成功: ${totalSuccessUsers} 个`, 'success');
        addOutput(`   • 部分失败: ${totalFailUsers} 个`, totalFailUsers > 0 ? 'error' : 'info');
        addOutput(`   • 成功率: ${((totalSuccessUsers / selectedUsers.length) * 100).toFixed(1)}%`, 
                    totalSuccessUsers === selectedUsers.length ? 'success' : 'warning');
        
        if (totalSuccessUsers === selectedUsers.length) {
            addOutput(`🎊 恭喜！所有用户的操作都执行成功！`, 'success');
            showToast('批量执行完成！所有用户操作成功', 'success');
        } else if (totalSuccessUsers > 0) {
            addOutput(`⚠️ 部分用户操作成功，请检查失败的用户`, 'warning');
            showToast('批量执行完成！部分用户操作成功', 'warning');
        } else {
            addOutput(`😞 所有用户操作都失败，请检查网络连接和用户权限`, 'error');
            showToast('批量执行失败！请检查网络和权限', 'error');
        }

        // 显示每个账号的积分情况
        let alertMessage = '📊 批量执行完成！各账号积分情况：\n\n';
        userPointsResults.forEach((result, index) => {
            if (result.points !== null) {
                const status = result.points >= 100 ? '✅' : '⚠️';
                alertMessage += `${index + 1}. ${result.name}: ${result.points} 分 ${status}\n`;
            } else if (result.error) {
                alertMessage += `${index + 1}. ${result.name}: 执行失败 ❌\n`;
            } else {
                alertMessage += `${index + 1}. ${result.name}: 积分获取失败 ❓\n`;
            }
        });
        
        alertMessage += '\n✅ = 已达标(≥100分)  ⚠️ = 未达标(<100分)  ❌ = 执行失败';
        alert(alertMessage);

    } catch (error) {
        addOutput(`💥 批量执行过程中发生严重错误: ${error.message}`, 'error');
        console.error('批量执行错误:', error);
        showToast('批量执行发生错误', 'error');
        alert(`批量执行发生错误: ${error.message}`);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }
}

// 点击模态窗口外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('batchExecuteModal');
    if (event.target === modal) {
        closeBatchExecuteModal();
    }
}