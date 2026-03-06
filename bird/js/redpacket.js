let users = [];
let isExecuting = false;

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
});

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
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

// 显示批量执行模态窗口
function showBatchExecuteModal() {
    if (users.length === 0) {
        addOutput('没有可用的用户，请先在用户管理页面添加用户', 'warning');
        return;
    }
    
    const modal = document.getElementById('batchExecuteModal');
    const userList = document.getElementById('batchUserList');
    
    // 清空并重新生成用户列表
    userList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.onclick = function() {
            const checkbox = this.querySelector('.user-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        };
        
        userItem.innerHTML = `
            <input type="checkbox" class="user-checkbox" value="${user.id}" onclick="event.stopPropagation(); this.parentElement.classList.toggle('selected', this.checked);">
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
}

// 全选用户
function selectAllUsers() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const userItems = document.querySelectorAll('.user-item');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = true;
        userItems[index].classList.add('selected');
    });
}

// 全不选用户
function deselectAllUsers() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const userItems = document.querySelectorAll('.user-item');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = false;
        userItems[index].classList.remove('selected');
    });
}

// 反选用户
function invertSelection() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const userItems = document.querySelectorAll('.user-item');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = !checkbox.checked;
        userItems[index].classList.toggle('selected', checkbox.checked);
    });
}

// 为单个用户抢红包
async function grabRedpacketForUser(user) {
    addOutput(`\n🧧 开始为用户 "${user.name}" 抢红包...`, 'info');
    
    let count = 0;
    let shouldStop = false;
    
    while (!shouldStop) {
        try {
            const response = await fetch(`${getApiBaseUrl(user)}/api/award/redpacket`, {
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
                        count++;
                        
                        // 检查是否达到限制
                        if (data.data && typeof data.data === 'string' && data.data.includes('已达到最大抢红包次数限制')) {
                            addOutput(`✅ 用户 "${user.name}" 抢红包完成，共抢了 ${count} 次`, 'success');
                            addOutput(`⏹️ ${data.data}`, 'warning');
                            shouldStop = true;
                        } else {
                            addOutput(`✅ 第 ${count} 次抢红包成功`, 'success');
                            if (data.data) {
                                const dataStr = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
                                addOutput(`   奖励: ${dataStr}`, 'info');
                            }
                            
                            // 添加短暂延迟，避免请求过快
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } else {
                        addOutput(`❌ 抢红包失败: ${data.msg || '未知错误'}`, 'error');
                        shouldStop = true;
                    }
                } catch (parseError) {
                    addOutput(`❌ 解析响应数据失败`, 'error');
                    addOutput(`原始响应: ${responseText}`, 'error');
                    shouldStop = true;
                }
            } else {
                addOutput(`❌ 抢红包请求失败: HTTP ${response.status}`, 'error');
                addOutput(`错误信息: ${responseText}`, 'error');
                shouldStop = true;
            }
            
        } catch (error) {
            addOutput(`❌ 抢红包请求异常: ${error.message}`, 'error');
            shouldStop = true;
        }
    }
    
    return count;
}

// 批量执行抢红包
async function executeBatchRedpacket() {
    if (isExecuting) {
        addOutput('正在执行中，请等待完成', 'warning');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.user-checkbox:checked');
    
    if (checkboxes.length === 0) {
        addOutput('请至少选择一个用户', 'warning');
        return;
    }
    
    const selectedUsers = Array.from(checkboxes).map(checkbox => {
        return users.find(user => user.id === checkbox.value);
    }).filter(user => user !== undefined);
    
    if (selectedUsers.length === 0) {
        addOutput('未找到选中的用户', 'error');
        return;
    }
    
    // 关闭模态窗口
    closeBatchExecuteModal();
    
    // 禁用按钮
    const executeBtn = document.getElementById('batchExecuteBtn');
    executeBtn.disabled = true;
    executeBtn.classList.add('loading');
    executeBtn.textContent = '抢红包中...';
    
    isExecuting = true;
    
    try {
        addOutput(`\n🚀 === 开始批量抢红包 ===`, 'info');
        addOutput(`📊 选中用户数: ${selectedUsers.length}`, 'info');
        addOutput(`👥 用户列表: ${selectedUsers.map(u => u.name).join(', ')}`, 'info');
        
        let totalCount = 0;
        let successUsers = 0;
        let failUsers = 0;
        
        for (let i = 0; i < selectedUsers.length; i++) {
            const user = selectedUsers[i];
            
            addOutput(`\n📋 [${i + 1}/${selectedUsers.length}] 处理用户: ${user.name}`, 'info');
            
            try {
                const count = await grabRedpacketForUser(user);
                totalCount += count;
                
                if (count > 0) {
                    successUsers++;
                    addOutput(`✅ 用户 "${user.name}" 处理完成，共抢 ${count} 次`, 'success');
                } else {
                    failUsers++;
                    addOutput(`⚠️ 用户 "${user.name}" 未能抢到红包`, 'warning');
                }
                
                // 用户间隔，避免请求过快
                if (i < selectedUsers.length - 1) {
                    addOutput(`⏱️ 等待 2 秒后处理下一个用户...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
            } catch (error) {
                failUsers++;
                addOutput(`❌ 用户 "${user.name}" 处理失败: ${error.message}`, 'error');
            }
        }
        
        // 输出最终统计
        addOutput(`\n🎉 === 批量抢红包完成 ===`, 'info');
        addOutput(`📊 执行统计:`, 'info');
        addOutput(`   • 总用户数: ${selectedUsers.length}`, 'info');
        addOutput(`   • 成功用户: ${successUsers}`, 'success');
        addOutput(`   • 失败用户: ${failUsers}`, failUsers > 0 ? 'error' : 'info');
        addOutput(`   • 总抢红包次数: ${totalCount}`, 'success');
        addOutput(`   • 平均每人: ${(totalCount / selectedUsers.length).toFixed(1)} 次`, 'info');
        
        if (successUsers === selectedUsers.length) {
            addOutput(`🎊 恭喜！所有用户都成功抢到红包！`, 'success');
        } else if (successUsers > 0) {
            addOutput(`⚠️ 部分用户抢红包成功`, 'warning');
        } else {
            addOutput(`😞 所有用户都未能抢到红包`, 'error');
        }
        
    } catch (error) {
        addOutput(`💥 批量抢红包过程中发生严重错误: ${error.message}`, 'error');
        console.error('批量抢红包错误:', error);
    } finally {
        isExecuting = false;
        executeBtn.disabled = false;
        executeBtn.classList.remove('loading');
        executeBtn.textContent = '🧧 批量抢红包';
    }
}
