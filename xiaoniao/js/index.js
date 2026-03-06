// 页面跳转函数
function goToOneClick() {
    // 跳转到一键操作页面
    window.location.href = 'html/one-click.html';
}

function goToUserManage() {
    // 跳转到用户管理页面
    window.location.href = 'html/user-manage.html';
}

function goToBatchBless() {
    // 跳转到批量祝福页面
    window.location.href = 'html/batch-bless.html';
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('首页加载完成');
    
    // 可以在这里添加其他初始化逻辑
    // 比如检查用户登录状态等
});