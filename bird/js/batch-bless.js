// 批量祝福相关变量
let users = [];
let selectedUserIds = new Set();

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    populateUserList();
});

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// 填充用户列表
function populateUserList() {
    const userList = document.getElementById('userList');
    
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <h3>暂无用户数据</h3>
                <p>请先在用户管理页面添加用户</p>
                <a href="user-manage.html" class="action-btn">前往用户管理</a>
            </div>
        `;
        return;
    }
    
    userList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.onclick = () => toggleUserSelection(user.id);
        
        userItem.innerHTML = `
            <input type="checkbox" class="user-checkbox" ${selectedUserIds.has(user.id) ? 'checked' : ''} 
                   onchange="toggleUserSelection('${user.id}')" onclick="event.stopPropagation()">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-details">ID: ${user.id}</div>
            </div>
        `;
        
        if (selectedUserIds.has(user.id)) {
            userItem.classList.add('selected');
        }
        
        userList.appendChild(userItem);
    });
}

// 切换用户选择状态
function toggleUserSelection(userId) {
    if (selectedUserIds.has(userId)) {
        selectedUserIds.delete(userId);
    } else {
        selectedUserIds.add(userId);
    }
    populateUserList();
    updateStartButtonState();
}

// 全选用户
function selectAllUsers() {
    selectedUserIds.clear();
    users.forEach(user => selectedUserIds.add(user.id));
    populateUserList();
    updateStartButtonState();
}

// 全不选用户
function deselectAllUsers() {
    selectedUserIds.clear();
    populateUserList();
    updateStartButtonState();
}

// 反选用户
function invertSelection() {
    const newSelection = new Set();
    users.forEach(user => {
        if (!selectedUserIds.has(user.id)) {
            newSelection.add(user.id);
        }
    });
    selectedUserIds = newSelection;
    populateUserList();
    updateStartButtonState();
}

// 更新开始按钮状态
function updateStartButtonState() {
    const startBtn = document.getElementById('startBtn');
    if (selectedUserIds.size === 0) {
        startBtn.disabled = true;
        startBtn.textContent = '🙏 请先选择用户';
    } else {
        startBtn.disabled = false;
        startBtn.textContent = `🙏 开始批量祝福 (${selectedUserIds.size}个用户)`;
    }
}

// 开始批量祝福
async function startBatchBless() {
    if (selectedUserIds.size === 0) {
        alert('请至少选择一个用户');
        return;
    }

    // 隐藏用户选择区域，显示输出区域
    document.getElementById('userSelectionArea').style.display = 'none';
    document.getElementById('outputArea').style.display = 'flex';

    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.classList.add('loading');
    startBtn.textContent = '执行中...';

    try {
        const selectedUsers = users.filter(user => selectedUserIds.has(user.id));
        
        addOutput(`🙏 开始批量祝福操作...`, 'info');
        addOutput(`选中用户数量: ${selectedUsers.length}`, 'info');
        addOutput(`用户列表: ${selectedUsers.map(u => u.name).join(', ')}`, 'info');
        addOutput(`\n=== 批量祝福开始 ===\n`, 'info');

        let totalSuccessUsers = 0;
        let totalFailUsers = 0;

        // 为每个选中的用户执行祝福操作
        for (let i = 0; i < selectedUsers.length; i++) {
            const user = selectedUsers[i];
            
            try {
                addOutput(`\n👤 [${i + 1}/${selectedUsers.length}] 开始为用户 "${user.name}" 执行祝福操作...`, 'info');
                
                // 执行祝福操作
                const success = await performBlessForUser(user);
                
                if (success) {
                    addOutput(`✅ 用户 "${user.name}" 祝福操作完成`, 'success');
                    totalSuccessUsers++;
                } else {
                    addOutput(`❌ 用户 "${user.name}" 祝福操作失败`, 'error');
                    totalFailUsers++;
                }

                // 用户间隔
                if (i < selectedUsers.length - 1) {
                    addOutput(`⏱️ 等待 3 秒后处理下一个用户...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                addOutput(`💥 用户 "${user.name}" 处理失败: ${error.message}`, 'error');
                totalFailUsers++;
            }
        }

        // 批量祝福总结
        addOutput(`\n🎉 === 批量祝福操作完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总计用户: ${selectedUsers.length} 个`, 'info');
        addOutput(`   • 祝福成功: ${totalSuccessUsers} 个`, 'success');
        addOutput(`   • 祝福失败: ${totalFailUsers} 个`, totalFailUsers > 0 ? 'error' : 'info');
        addOutput(`   • 成功率: ${((totalSuccessUsers / selectedUsers.length) * 100).toFixed(1)}%`, 
                    totalSuccessUsers === selectedUsers.length ? 'success' : 'warning');
        
        if (totalSuccessUsers === selectedUsers.length) {
            addOutput(`🎊 恭喜！所有用户的祝福操作都执行成功！`, 'success');
            showNotification('批量祝福完成！所有用户祝福成功', 'success');
        } else if (totalSuccessUsers > 0) {
            addOutput(`⚠️ 部分用户祝福成功，请检查失败的用户`, 'warning');
            showNotification('批量祝福完成！部分用户祝福成功', 'warning');
        } else {
            addOutput(`😞 所有用户祝福都失败，请检查网络连接和用户权限`, 'error');
            showNotification('批量祝福失败！请检查网络和权限', 'error');
        }

    } catch (error) {
        addOutput(`💥 批量祝福过程中发生严重错误: ${error.message}`, 'error');
        console.error('批量祝福错误:', error);
        showNotification(`批量祝福发生错误: ${error.message}`, 'error');
    } finally {
        startBtn.disabled = false;
        startBtn.classList.remove('loading');
        startBtn.textContent = '🙏 开始批量祝福';
    }
}

// 为单个用户执行祝福操作
async function performBlessForUser(user) {
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
                
                const response = await fetch(`http://82.157.255.108/api/friend/list?page=${page}&keyword=`, {
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
                        
                        const blessResponse = await fetch(`http://82.157.255.108/api/fowling/all/bless?uid=${friend.uid}`, {
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
        addOutput(`\n=== 用户 "${user.name}" 祝福操作完成 ===`, 'info');
        addOutput(`总计处理页数: ${page}`, 'info');
        addOutput(`总计好友数: ${totalFriendsCount}`, 'info');
        addOutput(`祝福成功: ${totalSuccessCount}`, 'success');
        addOutput(`祝福失败: ${totalFailCount}`, totalFailCount > 0 ? 'error' : 'info');
        
        return totalSuccessCount > 0; // 只要有成功的就算成功
        
    } catch (error) {
        addOutput(`用户 "${user.name}" 祝福操作失败: ${error.message}`, 'error');
        console.error('祝福错误:', error);
        return false;
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
    selectedUserIds.clear();
    populateUserList();
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

// 初始化时更新按钮状态
updateStartButtonState();