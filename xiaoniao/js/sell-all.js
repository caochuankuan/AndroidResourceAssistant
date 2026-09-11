let users = [];

document.addEventListener('DOMContentLoaded', function() {
    users = JSON.parse(localStorage.getItem('users') || '[]');
    const userList = document.getElementById('userList');
    users.forEach(user => {
        const label = document.createElement('label');
        label.className = 'user-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'user-checkbox';
        checkbox.value = user.id;
        const name = document.createElement('span');
        name.className = 'user-name';
        name.textContent = user.name;
        label.append(checkbox, name);
        userList.appendChild(label);
    });
    if (users.length === 0) {
        userList.textContent = '暂无用户，请先在用户管理中添加';
    }
});

function setAllUsersSelected(selected) {
    document.querySelectorAll('#userList input').forEach(checkbox => {
        if (!checkbox.disabled) checkbox.checked = selected;
    });
}

function showResult(message, type) {
    const output = document.getElementById('outputContent');
    if (output.classList.contains('empty')) {
        output.classList.remove('empty');
        output.textContent = '';
    }
    const entry = document.createElement('div');
    entry.className = type;
    entry.textContent = message;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
}

async function sellAllBirds() {
    const button = document.getElementById('sellAllBtn');
    if (button.disabled) return;
    const selectedIds = new Set(Array.from(
        document.querySelectorAll('#userList input:checked'), checkbox => checkbox.value
    ));
    const selectedUsers = users.filter(user => selectedIds.has(user.id));
    if (selectedUsers.length === 0) {
        showResult('请先选择用户', 'warning');
        return;
    }

    button.disabled = true;
    button.classList.add('loading');
    button.textContent = '出售中...';
    const selectionControls = document.querySelectorAll('#userList input, .selection-controls button');
    selectionControls.forEach(control => { control.disabled = true; });
    document.getElementById('outputContent').textContent = '';
    showResult(`开始为 ${selectedUsers.length} 个用户执行一键出售...`, 'info');
    let successCount = 0;

    try {
        for (const [index, user] of selectedUsers.entries()) {
            button.textContent = `出售中 ${index + 1}/${selectedUsers.length}`;
            showResult(`正在为用户 "${user.name}" 执行一键出售...`, 'info');
            try {
                const response = await fetch('http://49.232.48.114/api/storage/bird/sellall?confirm=true', {
                    method: 'POST',
                    headers: {
                        'authorization': user.sso,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const result = await response.json();
                if (result.code !== 200) {
                    throw new Error(result.msg || '未知错误');
                }
                successCount++;
                showResult(`用户 "${user.name}" 一键出售成功！返回结果: ${result.data}`, 'success');
            } catch (error) {
                showResult(`用户 "${user.name}" 一键出售失败: ${error.message}`, 'error');
            }
        }
        showResult(`执行完成：成功 ${successCount} 个，失败 ${selectedUsers.length - successCount} 个`,
            successCount === selectedUsers.length ? 'success' : 'warning');
    } finally {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = '一键出售';
        selectionControls.forEach(control => { control.disabled = false; });
    }
}
