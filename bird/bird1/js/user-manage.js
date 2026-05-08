let users = [];
let deleteUserId = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    renderUsers();
});

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('bird1_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// 保存用户数据到localStorage
function saveUsers() {
    localStorage.setItem('bird1_users', JSON.stringify(users));
}

// 渲染用户列表
function renderUsers() {
    const userList = document.getElementById('userList');
    
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>暂无用户数据</p>
                <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.7;">点击右下角的 + 按钮添加用户</p>
            </div>
        `;
        return;
    }

    userList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-name">${escapeHtml(user.name)}</div>
                <div class="user-sso">
                    <strong>SSO:</strong> <span>${escapeHtml(user.sso)}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="openDeleteModal('${user.id}', '${escapeHtml(user.name)}')">删除</button>
        </div>
    `).join('');
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 打开新增弹窗
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
    document.getElementById('addUserForm').reset();
}

// 关闭新增弹窗
function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

// 打开删除确认弹窗
function openDeleteModal(userId, userName) {
    deleteUserId = userId;
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('deleteModal').style.display = 'block';
}

// 关闭删除确认弹窗
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteUserId = null;
}

// 确认删除用户
function confirmDelete() {
    if (deleteUserId) {
        users = users.filter(user => user.id !== deleteUserId);
        saveUsers();
        renderUsers();
        closeDeleteModal();
    }
}

// 处理新增用户表单提交
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('userName').trim();
    const sso = formData.get('ssoInput').trim();

    if (!name || !sso) {
        alert('请填写完整信息');
        return;
    }

    // 检查用户名是否重复
    if (users.some(user => user.name === name)) {
        alert('用户名已存在，请使用其他用户名');
        return;
    }

    // 检查sso是否重复
    if (users.some(user => user.sso === sso)) {
        alert('该SSO值已存在，请检查是否重复添加用户');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name: name,
        sso: sso,
        createTime: new Date().toLocaleString()
    };

    users.push(newUser);
    saveUsers();
    renderUsers();
    closeAddModal();
});

// 导出用户配置
function exportUserConfig() {
    if (users.length === 0) {
        alert('暂无用户数据可导出');
        return;
    }

    const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        users: users
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `用户配置_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
}

// 导入用户配置
function importUserConfig() {
    document.getElementById('importFileInput').click();
}

// 处理文件导入
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        alert('请选择JSON格式的配置文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.users || !Array.isArray(importData.users)) {
                alert('配置文件格式不正确，缺少用户数据');
                return;
            }

            // 验证用户数据结构，只需要 name 和 sso
            const validUsers = importData.users.filter(user => {
                return user.id && user.name && user.sso &&
                       typeof user.id === 'string' &&
                       typeof user.name === 'string' &&
                       typeof user.sso === 'string';
            });

            if (validUsers.length === 0) {
                alert('配置文件中没有有效的用户数据');
                return;
            }

            let shouldProceed = true;
            if (users.length > 0) {
                shouldProceed = confirm(`当前已有 ${users.length} 个用户，导入将会覆盖现有数据。\n配置文件包含 ${validUsers.length} 个用户。\n\n确定要继续导入吗？`);
            } else {
                shouldProceed = confirm(`即将导入 ${validUsers.length} 个用户配置，确定要继续吗？`);
            }

            if (shouldProceed) {
                const importedUsers = validUsers.map(user => ({
                    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
                    name: user.name,
                    sso: user.sso,
                    createTime: user.createTime || new Date().toLocaleString(),
                    importTime: new Date().toLocaleString()
                }));

                users = importedUsers;
                saveUsers();
                renderUsers();
                alert(`成功导入 ${importedUsers.length} 个用户配置`);
            }

        } catch (error) {
            console.error('导入失败:', error);
            alert('配置文件格式错误，请检查文件内容');
        }
    };

    reader.readAsText(file);
    event.target.value = '';
}

// 点击弹窗外部关闭弹窗
window.addEventListener('click', function(e) {
    const addModal = document.getElementById('addModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (e.target === addModal) closeAddModal();
    if (e.target === deleteModal) closeDeleteModal();
});
