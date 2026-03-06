let users = [];
let selectedAccountA = null;
let selectedAccountB = null;
let userInfoA = null;
let userInfoB = null;
let selectedBlesser = null; // 随机选择的配鸟方
let selectedReceiver = null; // 被配鸟方
let allBirds = []; // 所有小鸟数据
let selectedBird = null; // 选择的小鸟

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    populateAccountSelects();
});

// 从localStorage加载用户数据
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// 填充账号选择下拉框
function populateAccountSelects() {
    const accountASelect = document.getElementById('accountA');
    const accountBSelect = document.getElementById('accountB');
    
    // 清空现有选项
    accountASelect.innerHTML = '<option value="">请选择第一个账号</option>';
    accountBSelect.innerHTML = '<option value="">请选择第二个账号</option>';
    
    if (users.length === 0) {
        const noUsersOption = '<option value="" disabled>没有可用账号，请先添加用户</option>';
        accountASelect.innerHTML = noUsersOption;
        accountBSelect.innerHTML = noUsersOption;
        return;
    }
    
    // 添加用户选项
    users.forEach(user => {
        const optionA = document.createElement('option');
        optionA.value = user.id;
        optionA.textContent = user.name;
        accountASelect.appendChild(optionA);

        const optionB = document.createElement('option');
        optionB.value = user.id;
        optionB.textContent = user.name;
        accountBSelect.appendChild(optionB);
    });
}

// 更新账号选择
function updateAccountSelection() {
    const accountASelect = document.getElementById('accountA');
    const accountBSelect = document.getElementById('accountB');
    const selectedAccounts = document.getElementById('selectedAccounts');
    const warningMessage = document.getElementById('warningMessage');
    const nextBtn = document.getElementById('nextBtn');

    const accountAId = accountASelect.value;
    const accountBId = accountBSelect.value;

    selectedAccountA = users.find(user => user.id === accountAId);
    selectedAccountB = users.find(user => user.id === accountBId);

    // 更新账号卡片显示
    if (selectedAccountA || selectedAccountB) {
        selectedAccounts.style.display = 'flex';
        
        // 更新账号A卡片
        const cardA = document.getElementById('cardA');
        const nameA = document.getElementById('nameA');
        const idA = document.getElementById('idA');
        
        if (selectedAccountA) {
            cardA.classList.add('selected');
            nameA.textContent = selectedAccountA.name;
            idA.textContent = `ID: ${selectedAccountA.id}`;
        } else {
            cardA.classList.remove('selected');
            nameA.textContent = '账号A';
            idA.textContent = 'ID: -';
        }

        // 更新账号B卡片
        const cardB = document.getElementById('cardB');
        const nameB = document.getElementById('nameB');
        const idB = document.getElementById('idB');
        
        if (selectedAccountB) {
            cardB.classList.add('selected');
            nameB.textContent = selectedAccountB.name;
            idB.textContent = `ID: ${selectedAccountB.id}`;
        } else {
            cardB.classList.remove('selected');
            nameB.textContent = '账号B';
            idB.textContent = 'ID: -';
        }
    } else {
        selectedAccounts.style.display = 'none';
    }

    // 检查是否选择了两个不同的账号
    const bothSelected = selectedAccountA && selectedAccountB;
    const sameAccount = bothSelected && selectedAccountA.id === selectedAccountB.id;

    if (sameAccount) {
        warningMessage.classList.add('show');
        nextBtn.disabled = true;
    } else {
        warningMessage.classList.remove('show');
        nextBtn.disabled = !bothSelected;
    }
}

// 进入下一步
async function goToNextStep() {
    if (!selectedAccountA || !selectedAccountB || selectedAccountA.id === selectedAccountB.id) {
        alert('请选择两个不同的账号');
        return;
    }

    // 切换到第二步
    showStep(2);
    
    // 更新步骤指示器
    updateStepIndicator(2);
    
    // 获取用户信息
    await Promise.all([
        fetchUserInfo(selectedAccountA, 'A'),
        fetchUserInfo(selectedAccountB, 'B')
    ]);
}

// 显示指定步骤
function showStep(stepNumber) {
    // 隐藏所有步骤
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    
    // 显示指定步骤
    if (stepNumber === 1) {
        document.getElementById('step1').classList.add('active');
    } else if (stepNumber === 2) {
        document.getElementById('step2').classList.add('active');
    } else if (stepNumber === 3) {
        document.getElementById('step3').classList.add('active');
    }
}

// 更新步骤指示器
function updateStepIndicator(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// 获取用户信息
async function fetchUserInfo(user, suffix) {
    const loadingElement = document.getElementById(`loading${suffix}`);
    const userInfoCard = document.getElementById(`userInfo${suffix}`);
    const errorElement = document.getElementById(`error${suffix}`);
    const usernameElement = document.getElementById(`username${suffix}`);
    const uidElement = document.getElementById(`uid${suffix}`);
    const nicknameElement = document.getElementById(`nickname${suffix}`);

    try {
        // 显示加载状态
        loadingElement.style.display = 'inline-block';
        userInfoCard.classList.add('loading');
        errorElement.style.display = 'none';
        
        // 设置初始显示
        usernameElement.textContent = user.name;
        uidElement.textContent = '获取中...';
        nicknameElement.textContent = '获取中...';

        // 调用API获取用户信息
        const response = await fetch('http://49.232.48.114/api/player/info', {
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
                    // 成功获取用户信息
                    const userInfo = {
                        uid: data.data.uid,
                        nickname: data.data.nickname,
                        level: data.data.levelInfo?.currentLevel?.level || 'N/A',
                        vipLevel: data.data.vipLevel || 0
                    };
                    
                    // 保存用户信息
                    if (suffix === 'A') {
                        userInfoA = userInfo;
                    } else {
                        userInfoB = userInfo;
                    }
                    
                    // 更新显示
                    uidElement.textContent = userInfo.uid;
                    nicknameElement.textContent = userInfo.nickname;
                    
                    // 添加额外信息
                    const detailsElement = document.getElementById(`details${suffix}`);
                    const levelLabel = document.createElement('span');
                    levelLabel.className = 'label';
                    levelLabel.textContent = '等级:';
                    const levelValue = document.createElement('span');
                    levelValue.className = 'value';
                    levelValue.textContent = userInfo.level;
                    
                    detailsElement.appendChild(levelLabel);
                    detailsElement.appendChild(levelValue);
                    
                } else {
                    throw new Error(data.msg || '获取用户信息失败');
                }
            } catch (parseError) {
                throw new Error('响应数据解析失败');
            }
        } else {
            throw new Error(`请求失败: HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error(`获取用户${suffix}信息失败:`, error);
        
        // 显示错误信息
        errorElement.textContent = `❌ 获取用户信息失败: ${error.message}`;
        errorElement.style.display = 'block';
        
        uidElement.textContent = '获取失败';
        nicknameElement.textContent = '获取失败';
        
    } finally {
        // 隐藏加载状态
        loadingElement.style.display = 'none';
        userInfoCard.classList.remove('loading');
        
        // 检查是否可以启用开始祝福按钮
        checkStartBlessingButton();
    }
}

// 检查是否可以启用开始祝福按钮
function checkStartBlessingButton() {
    const startBlessingBtn = document.getElementById('startBlessingBtn');
    const hasUserInfoA = userInfoA && userInfoA.uid && userInfoA.nickname;
    const hasUserInfoB = userInfoB && userInfoB.uid && userInfoB.nickname;
    
    startBlessingBtn.disabled = !(hasUserInfoA && hasUserInfoB);
}

// 返回第一步
function goBackToStep1() {
    showStep(1);
    updateStepIndicator(1);
    
    // 重置用户信息
    userInfoA = null;
    userInfoB = null;
}

// 返回第二步
function goBackToStep2() {
    showStep(2);
    updateStepIndicator(2);
    
    // 重置第三步数据
    selectedBlesser = null;
    selectedReceiver = null;
    allBirds = [];
    selectedBird = null;
}

// 进入第三步
async function goToStep3() {
    if (!userInfoA || !userInfoB) {
        alert('用户信息获取不完整，请重新获取');
        return;
    }
    
    // 切换到第三步
    showStep(3);
    updateStepIndicator(3);
    
    // 随机选择祝福方向
    await randomSelectBlesser();
}

// 随机选择祝福者
async function randomSelectBlesser() {
    const randomResult = document.getElementById('randomResult');
    
    // 显示随机选择过程
    randomResult.textContent = '🎲 正在随机选择...';
    
    // 模拟随机选择过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 50%概率选择A或B
    const isABlesser = Math.random() < 0.5;
    
    if (isABlesser) {
        selectedBlesser = { user: selectedAccountA, info: userInfoA };
        selectedReceiver = { user: selectedAccountB, info: userInfoB };
    } else {
        selectedBlesser = { user: selectedAccountB, info: userInfoB };
        selectedReceiver = { user: selectedAccountA, info: userInfoA };
    }
    
    randomResult.innerHTML = `
        🎯 随机结果：<br>
        <strong>${selectedBlesser.info.nickname}</strong> 将为 <strong>${selectedReceiver.info.nickname}</strong> 配鸟
    `;
    
    // 获取被祝福者的小鸟列表
    await fetchAllBirds();
}

// 获取所有小鸟数据
async function fetchAllBirds() {
    const loadingBirds = document.getElementById('loadingBirds');
    const birdSelection = document.getElementById('birdSelection');
    const birdError = document.getElementById('birdError');
    const processTitle = document.getElementById('processTitle');
    
    try {
        loadingBirds.style.display = 'block';
        birdSelection.style.display = 'none';
        birdError.style.display = 'none';
        
        processTitle.textContent = `选择 ${selectedReceiver.info.nickname} 的小鸟进行配鸟`;
        
        allBirds = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(`http://49.232.48.114/api/birth/birthwait?uid=${selectedReceiver.info.uid}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });

            console.log(response);
            
            const responseText = await response.text();
            
            if (response.ok) {
                const data = JSON.parse(responseText);
                if (data.code === 200 && data.data && data.data.content) {
                    const birds = data.data.content;
                    allBirds.push(...birds);
                    
                    // 如果这一页的数据少于预期，说明没有更多数据了
                    hasMore = birds.length > 0 && birds.length >= 10; // 每页10个小鸟
                    page++;
                } else {
                    hasMore = false;
                    if (page === 0) {
                        throw new Error(data.msg || '获取小鸟列表失败');
                    }
                }
            } else {
                throw new Error(`请求失败: HTTP ${response.status}`);
            }
        }
        
        if (allBirds.length === 0) {
            throw new Error('该用户没有可用的小鸟');
        }
        
        // 显示小鸟列表
        loadingBirds.style.display = 'none';
        birdSelection.style.display = 'block';
        
        renderBirdList();
        
    } catch (error) {
        console.error('获取小鸟列表失败:', error);
        
        loadingBirds.style.display = 'none';
        birdError.textContent = `❌ 获取小鸟列表失败: ${error.message}`;
        birdError.style.display = 'block';
    }
}

// 渲染小鸟列表
function renderBirdList() {
    const birdList = document.getElementById('birdList');
    
    // 渲染所有小鸟
    birdList.innerHTML = allBirds.map(bird => `
        <div class="bird-item" onclick="selectBird(${bird.id})" id="bird-${bird.id}">
            <div class="bird-name">${bird.name}</div>
            <div class="bird-id">ID: ${bird.id}</div>
            <div class="bird-weight">重量: ${(bird.totalWeight / 100).toFixed(2)}斤</div>
        </div>
    `).join('');
}

// 选择小鸟
function selectBird(birdId) {
    // 清除之前的选择
    document.querySelectorAll('.bird-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 选中当前小鸟
    const birdElement = document.getElementById(`bird-${birdId}`);
    birdElement.classList.add('selected');
    
    // 保存选择的小鸟
    selectedBird = allBirds.find(bird => bird.id === birdId);
    
    // 启用确认按钮
    const confirmBtn = document.getElementById('confirmBlessingBtn');
    confirmBtn.disabled = false;
    confirmBtn.style.display = 'inline-block';
}

// 确认祝福
async function confirmBlessing() {
    if (!selectedBird) {
        alert('请先选择一只小鸟');
        return;
    }
    
    const confirmBtn = document.getElementById('confirmBlessingBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = '配鸟中...';
    
    try {
        // 添加调试信息
        console.log('选择的小鸟信息:', selectedBird);
        console.log('使用的birdId:', selectedBird.id);
        
        // 获取祝福者的小鸟
        let blesserBirds = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            console.log(`正在获取祝福者小鸟，birdId: ${selectedBird.id}, page: ${page}`);
            
            const blesserBirdResponse = await fetch(`http://49.232.48.114/api/birth/birthwait?birdId=${selectedBird.id}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API响应状态:', blesserBirdResponse.status);
            
            const blesserBirdText = await blesserBirdResponse.text();
            console.log(`第${page}页响应内容:`, blesserBirdText);
            
            if (!blesserBirdResponse.ok) {
                throw new Error(`获取祝福者小鸟失败: HTTP ${blesserBirdResponse.status}`);
            }
            
            const blesserBirdData = JSON.parse(blesserBirdText);
            if (blesserBirdData.code === 200 && blesserBirdData.data && blesserBirdData.data.content) {
                const birds = blesserBirdData.data.content;
                console.log(`第${page}页获取到${birds.length}只小鸟:`, birds);
                blesserBirds.push(...birds);
                
                // 如果这一页的数据少于预期，说明没有更多数据了
                hasMore = birds.length > 0 && birds.length >= 10; // 每页10个小鸟
                page++;
            } else {
                console.log('API返回错误或无数据:', blesserBirdData);
                hasMore = false;
                if (page === 0) {
                    throw new Error(blesserBirdData.msg || '祝福者没有对应的小鸟');
                }
            }
        }
        
        if (blesserBirds.length === 0) {
            throw new Error('祝福者没有对应的小鸟');
        }
        
        console.log('所有祝福者小鸟:', blesserBirds);
        
        // 使用第一个小鸟进行祝福
        const blesserBird = blesserBirds[0];
        console.log('选择用于祝福的小鸟:', blesserBird);
        
        // 执行祝福
        console.log(`准备执行祝福API: birdId=${selectedBird.id}, friendBirdId=${blesserBird.id}`);
        const blessingResponse = await fetch(`http://49.232.48.114/api/birth/make?birdId=${blesserBird.id}&friendBirdId=${selectedBird.id}`, {
            method: 'POST',
            headers: {
                'authorization': selectedBlesser.user.sso,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('祝福API响应状态:', blessingResponse.status);
        const blessingText = await blessingResponse.text();
        console.log('祝福API响应内容:', blessingText);
        
        if (blessingResponse.ok) {
            const blessingData = JSON.parse(blessingText);
            if (blessingData.code === 200) {
                console.log('配鸟请求成功，准备接受配鸟:', blessingData.data);
                
                // 获取配鸟ID
                const blessingId = blessingData.data.id;
                
                // 调用接受配鸟API获取最终结果
                console.log(`准备接受配鸟，ID: ${blessingId}`);
                const acceptResponse = await fetch(`http://49.232.48.114/api/birth/accept?id=${blessingId}`, {
                    method: 'POST',
                    headers: {
                        'authorization': selectedReceiver.user.sso, // 使用被配鸟方的授权
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('接受配鸟API响应状态:', acceptResponse.status);
                const acceptText = await acceptResponse.text();
                console.log('接受配鸟API响应内容:', acceptText);
                
                if (acceptResponse.ok) {
                    const acceptData = JSON.parse(acceptText);
                    if (acceptData.code === 200) {
                        // 配鸟完全成功
                        showBlessingResult(true, {
                            blessing: blessingData.data,
                            result: acceptData.data
                        });
                    } else {
                        throw new Error(`接受配鸟失败: ${acceptData.msg || '未知错误'}`);
                    }
                } else {
                    throw new Error(`接受配鸟请求失败: HTTP ${acceptResponse.status}`);
                }
            } else {
                throw new Error(blessingData.msg || '配鸟失败');
            }
        } else {
            throw new Error(`配鸟请求失败: HTTP ${blessingResponse.status}`);
        }
        
    } catch (error) {
        console.error('配鸟失败:', error);
        showBlessingResult(false, null, error.message);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
        confirmBtn.style.display = 'none';
    }
}

// 显示配鸟结果
function showBlessingResult(success, data, errorMessage) {
    const blessingResult = document.getElementById('blessingResult');
    const resultDetails = document.getElementById('resultDetails');
    const restartBtn = document.getElementById('restartBtn');
    
    if (success) {
        blessingResult.className = 'blessing-result';
        blessingResult.querySelector('h3').textContent = '🎉 配鸟成功！';
        
        let resultHtml = `
            <p><strong>配鸟方:</strong> ${selectedBlesser.info.nickname}</p>
            <p><strong>被配鸟方:</strong> ${selectedReceiver.info.nickname}</p>
            <p><strong>选择的小鸟:</strong> ${selectedBird.name} (ID: ${selectedBird.id})</p>
        `;
        
        if (data) {
            if (data.blessing) {
                resultHtml += `<p><strong>配鸟ID:</strong> ${data.blessing.id}</p>`;
                resultHtml += `<p><strong>状态:</strong> ${data.blessing.status}</p>`;
            }
            
            if (data.result) {
                const resultStr = JSON.stringify(data.result);
                resultHtml += `<p><strong>最终结果:</strong> ${resultStr.length > 200 ? resultStr.substring(0, 200) + '...' : resultStr}</p>`;
            } else if (typeof data === 'object' && !data.blessing) {
                // 兼容旧的单一数据格式
                const resultStr = JSON.stringify(data);
                resultHtml += `<p><strong>配鸟结果:</strong> ${resultStr.length > 200 ? resultStr.substring(0, 200) + '...' : resultStr}</p>`;
            }
        }
        
        resultDetails.innerHTML = resultHtml;
    } else {
        blessingResult.className = 'error-message';
        blessingResult.querySelector('h3').textContent = '❌ 配鸟失败';
        resultDetails.innerHTML = `<p>错误信息: ${errorMessage}</p>`;
    }
    
    blessingResult.style.display = 'block';
    restartBtn.style.display = 'inline-block';
}

// 重新开始
function restartBlessing() {
    // 重置所有数据
    selectedAccountA = null;
    selectedAccountB = null;
    userInfoA = null;
    userInfoB = null;
    selectedBlesser = null;
    selectedReceiver = null;
    allBirds = [];
    selectedBird = null;
    
    // 重置界面
    document.getElementById('blessingResult').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';
    
    // 返回第一步
    showStep(1);
    updateStepIndicator(1);
}

// 开始祝福 (旧函数，现在改为跳转到第三步)
function startBlessing() {
    goToStep3();
}

// 初始化显示第一步
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    updateStepIndicator(1);
});