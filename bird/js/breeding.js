let users = [];
let selectedAccountA = null;
let selectedAccountB = null;
let userInfoA = null;
let userInfoB = null;
let selectedBlesser = null;
let selectedReceiver = null;
let allBirds = [];
let selectedBird = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示开发中提示
    alert('⚠️ 提示：一键配鸟功能为半成品，正在开发中...');
    
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
    
    accountASelect.innerHTML = '<option value="">请选择第一个账号</option>';
    accountBSelect.innerHTML = '<option value="">请选择第二个账号</option>';
    
    if (users.length === 0) {
        const noUsersOption = '<option value="" disabled>没有可用账号，请先添加用户</option>';
        accountASelect.innerHTML = noUsersOption;
        accountBSelect.innerHTML = noUsersOption;
        return;
    }
    
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
    const warningMessage = document.getElementById('warningMessage');
    const nextBtn = document.getElementById('nextBtn');

    const accountAId = accountASelect.value;
    const accountBId = accountBSelect.value;

    selectedAccountA = users.find(user => user.id === accountAId);
    selectedAccountB = users.find(user => user.id === accountBId);

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

// 开始流程
async function startProcess() {
    if (!selectedAccountA || !selectedAccountB || selectedAccountA.id === selectedAccountB.id) {
        alert('请选择两个不同的账号');
        return;
    }

    document.getElementById('accountSelection').style.display = 'none';
    document.getElementById('mainProcess').style.display = 'block';
    
    addLog('开始配鸟流程...', 'info');
    await fetchUserInfos();
}

// 获取用户信息
async function fetchUserInfos() {
    try {
        addLog('正在获取用户信息...', 'info');
        
        const responseA = await fetch('http://82.157.255.108/api/player/info', {
            method: 'GET',
            headers: {
                'authorization': selectedAccountA.sso,
                'Content-Type': 'application/json'
            }
        });

        const dataA = await responseA.json();
        if (dataA.code === 200 && dataA.data) {
            userInfoA = {
                uid: dataA.data.uid,
                nickname: dataA.data.nickname,
                level: dataA.data.levelInfo?.currentLevel?.level || 'N/A',
                vipLevel: dataA.data.vipLevel || 0
            };
            addLog(`获取账号A信息成功: ${userInfoA.nickname} (${userInfoA.uid})`, 'success');
        } else {
            throw new Error(`获取账号A信息失败: ${dataA.msg}`);
        }
        const responseB = await fetch('http://82.157.255.108/api/player/info', {
            method: 'GET',
            headers: {
                'authorization': selectedAccountB.sso,
                'Content-Type': 'application/json'
            }
        });

        const dataB = await responseB.json();
        if (dataB.code === 200 && dataB.data) {
            userInfoB = {
                uid: dataB.data.uid,
                nickname: dataB.data.nickname,
                level: dataB.data.levelInfo?.currentLevel?.level || 'N/A',
                vipLevel: dataB.data.vipLevel || 0
            };
            addLog(`获取账号B信息成功: ${userInfoB.nickname} (${userInfoB.uid})`, 'success');
        } else {
            throw new Error(`获取账号B信息失败: ${dataB.msg}`);
        }

        selectedBlesser = { user: selectedAccountA, info: userInfoA };
        selectedReceiver = { user: selectedAccountB, info: userInfoB };
        
        document.getElementById('blesserName').textContent = userInfoA.nickname;
        document.getElementById('receiverName').textContent = userInfoB.nickname;
        
        addLog(`配鸟方向: ${userInfoA.nickname} → ${userInfoB.nickname}`, 'info');
        await fetchBirds();
        
    } catch (error) {
        addLog(`获取用户信息失败: ${error.message}`, 'error');
    }
}

// 获取小鸟列表
async function fetchBirds() {
    try {
        addLog('正在获取小鸟列表...', 'info');
        
        document.getElementById('birdSelection').style.display = 'block';
        document.getElementById('loadingBirds').style.display = 'block';
        
        allBirds = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(`http://82.157.255.108/api/birth/birthwait?uid=${selectedReceiver.info.uid}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.code === 200 && data.data && data.data.content) {
                const birds = data.data.content;
                allBirds.push(...birds);
                hasMore = birds.length > 0 && birds.length >= 10;
                page++;
            } else {
                hasMore = false;
                if (page === 0) {
                    throw new Error(data.msg || '获取小鸟列表失败');
                }
            }
        }
        if (allBirds.length === 0) {
            throw new Error('该用户没有可用的小鸟');
        }
        
        addLog(`获取到 ${allBirds.length} 只小鸟`, 'success');
        document.getElementById('loadingBirds').style.display = 'none';
        renderBirdList();
        
    } catch (error) {
        addLog(`获取小鸟列表失败: ${error.message}`, 'error');
        document.getElementById('loadingBirds').style.display = 'none';
    }
}

// 渲染小鸟列表
function renderBirdList() {
    const birdList = document.getElementById('birdList');
    
    birdList.innerHTML = allBirds.map(bird => `
        <div class="bird-item" onclick="selectBird(${bird.id})" id="bird-${bird.id}">
            <div class="bird-name">${bird.name}</div>
            <div class="bird-info">
                <span class="bird-id">ID: ${bird.id}</span>
                <span class="bird-sex">${bird.sex === 0 ? '雌' : '雄'}</span>
                <span class="bird-weight">${(bird.totalWeight / 100).toFixed(2)}斤</span>
            </div>
        </div>
    `).join('');
}

// 选择小鸟
function selectBird(birdId) {
    document.querySelectorAll('.bird-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const birdElement = document.getElementById(`bird-${birdId}`);
    birdElement.classList.add('selected');
    
    selectedBird = allBirds.find(bird => bird.id === birdId);
    
    const confirmBtn = document.getElementById('confirmBirdBtn');
    confirmBtn.disabled = false;
    confirmBtn.style.display = 'inline-block';
    
    addLog(`选择小鸟: ${selectedBird.name} (ID: ${selectedBird.id})`, 'info');
}

// 确认小鸟选择
async function confirmBirdSelection() {
    if (!selectedBird) {
        alert('请先选择一只小鸟');
        return;
    }
    
    document.getElementById('selectedBirdName').textContent = selectedBird.name;
    document.getElementById('birdSelection').style.display = 'none';
    
    addLog(`确认选择小鸟: ${selectedBird.name}`, 'success');
    addLog('开始执行配鸟...', 'info');
    
    await performInitialBreeding();
}
// 执行初始配鸟
async function performInitialBreeding() {
    try {
        let blesserBirds = [];
        let page = 0;
        let hasMore = true;
        
        addLog('正在获取配对者的小鸟...', 'info');
        
        while (hasMore) {
            const blesserBirdResponse = await fetch(`http://82.157.255.108/api/birth/birthwait?birdId=${selectedBird.id}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            const blesserBirdData = await blesserBirdResponse.json();
            if (blesserBirdData.code === 200 && blesserBirdData.data && blesserBirdData.data.content) {
                const birds = blesserBirdData.data.content;
                blesserBirds.push(...birds);
                hasMore = birds.length > 0 && birds.length >= 10;
                page++;
            } else {
                hasMore = false;
                if (page === 0) {
                    throw new Error(blesserBirdData.msg || '对方没有对应的小鸟');
                }
            }
        }
        
        if (blesserBirds.length === 0) {
            throw new Error('对方没有对应的小鸟');
        }
        
        const blesserBird = blesserBirds[0];
        addLog(`找到配对小鸟: ${blesserBird.name} (ID: ${blesserBird.id})`, 'success');
        
        addLog('发起配鸟请求...', 'info');
        const blessingResponse = await fetch(`http://82.157.255.108/api/birth/make?birdId=${blesserBird.id}&friendBirdId=${selectedBird.id}`, {
            method: 'POST',
            headers: {
                'authorization': selectedBlesser.user.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const blessingData = await blessingResponse.json();
        if (blessingData.code !== 200) {
            throw new Error(blessingData.msg || '配鸟失败');
        }
        
        const blessingId = blessingData.data.id;
        addLog(`配鸟请求成功，ID: ${blessingId}`, 'success');
        
        addLog('接受配鸟请求...', 'info');
        const acceptResponse = await fetch(`http://82.157.255.108/api/birth/accept?id=${blessingId}`, {
            method: 'POST',
            headers: {
                'authorization': selectedReceiver.user.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const acceptData = await acceptResponse.json();
        if (acceptData.code !== 200) {
            throw new Error(`接受配鸟失败: ${acceptData.msg || '未知错误'}`);
        }
        
        addLog('配鸟成功！', 'success');
        if (acceptData.data && acceptData.data.askUid) {
            addLog(`检测到askUid: ${acceptData.data.askUid}，开始自动化流程`, 'info');
            setTimeout(() => {
                startAutomatedBreeding(acceptData.data.askUid, selectedBird.name);
            }, 2000);
        } else {
            addLog('配鸟完成，未检测到askUid', 'warning');
        }
        
    } catch (error) {
        addLog(`配鸟失败: ${error.message}`, 'error');
    }
}

// 重新开始
function restartProcess() {
    selectedAccountA = null;
    selectedAccountB = null;
    userInfoA = null;
    userInfoB = null;
    selectedBlesser = null;
    selectedReceiver = null;
    allBirds = [];
    selectedBird = null;
    
    document.getElementById('accountSelection').style.display = 'block';
    document.getElementById('mainProcess').style.display = 'none';
    
    document.getElementById('accountA').value = '';
    document.getElementById('accountB').value = '';
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('warningMessage').classList.remove('show');
    
    document.getElementById('logContent').innerHTML = '<div class="log-entry">等待开始...</div>';
    
    document.getElementById('blesserName').textContent = '-';
    document.getElementById('receiverName').textContent = '-';
    document.getElementById('selectedBirdName').textContent = '-';
}

// 添加日志
function addLog(message, type = 'info') {
    const logContent = document.getElementById('logContent');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
}
// 自动化配鸟流程
async function startAutomatedBreeding(askUid, birdName) {
    addLog(`开始自动化配鸟流程 - askUid: ${askUid}, birdName: ${birdName}`, 'info');
    
    try {
        await performAutomatedBreeding(askUid, birdName);
    } catch (error) {
        addLog(`自动化配鸟流程失败: ${error.message}`, 'error');
    }
}

// 执行自动化配鸟
async function performAutomatedBreeding(askUid, birdName) {
    const breedingCountInput = document.getElementById('breedingCount');
    const maxCycles = breedingCountInput.value ? parseInt(breedingCountInput.value) : 100;
    const hasLimit = breedingCountInput.value && breedingCountInput.value.trim() !== '';
    
    if (hasLimit) {
        addLog(`设置了配对次数限制: ${maxCycles} 次`, 'info');
    } else {
        addLog(`未设置配对次数限制，最多执行 ${maxCycles} 次`, 'info');
    }
    
    let cycleCount = 0;
    
    while (cycleCount < maxCycles) {
        cycleCount++;
        addLog(`执行第 ${cycleCount}/${hasLimit ? maxCycles : '∞'} 次自动化配鸟循环`, 'info');
        
        try {
            await useCatalyst(askUid);
            await finishBirth(askUid);
            
            const nextBirds = await findBirdsByName(birdName);
            if (!nextBirds || nextBirds.length === 0) {
                addLog(`未找到名为 "${birdName}" 的小鸟，自动化流程结束`, 'warning');
                break;
            }
            
            let blessingResult = null;
            let successfulBird = null;
            
            // 遍历所有同名小鸟，直到找到一个能成功配对的
            for (let i = 0; i < nextBirds.length; i++) {
                const bird = nextBirds[i];
                addLog(`尝试配对第 ${i + 1}/${nextBirds.length} 只小鸟: ${bird.name} (ID: ${bird.id})`, 'info');
                
                blessingResult = await performBreeding(bird);
                if (blessingResult && blessingResult.askUid) {
                    successfulBird = bird;
                    addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 配对成功！`, 'success');
                    break;
                }
            }
            
            if (!blessingResult || !blessingResult.askUid) {
                addLog(`所有名为 "${birdName}" 的小鸟都配对失败，自动化流程结束`, 'warning');
                break;
            }
            
            askUid = blessingResult.askUid;
            addLog(`获得新的askUid: ${askUid}，继续下一轮`, 'success');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            addLog(`第 ${cycleCount} 次循环失败: ${error.message}`, 'error');
            break;
        }
    }
    
    if (cycleCount >= maxCycles) {
        if (hasLimit) {
            addLog(`已达到设置的配对次数 (${maxCycles})，自动化流程结束`, 'success');
        } else {
            addLog(`已达到最大循环次数 (${maxCycles})，自动化流程结束`, 'warning');
        }
    }
    
    addLog('自动化配鸟流程完成', 'success');
}
// 使用催产剂
async function useCatalyst(askUid) {
    addLog(`使用催产剂 - askUid: ${askUid}`, 'info');
    
    try {
        const useResponse = await fetch('http://82.157.255.108/api/prop/use?id=37&targetId=-1&num=5', {
            method: 'POST',
            headers: {
                'authorization': selectedAccountA.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const useData = await useResponse.json();
        
        if (useData.code === 500 && useData.msg === "你没有催产剂可用") {
            addLog('没有催产剂，正在购买...', 'warning');
            
            const shopResponse = await fetch('http://82.157.255.108/api/shop/prop?id=37', {
                method: 'GET',
                headers: {
                    'authorization': selectedAccountA.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!shopResponse.ok) {
                throw new Error(`购买催产剂失败: HTTP ${shopResponse.status}`);
            }
            
            addLog('催产剂购买成功，重新使用...', 'success');
            
            const retryResponse = await fetch('http://82.157.255.108/api/prop/use?id=37&targetId=-1&num=5', {
                method: 'POST',
                headers: {
                    'authorization': selectedAccountA.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            const retryData = await retryResponse.json();
            if (retryData.code !== 200) {
                throw new Error(`重试使用催产剂失败: ${retryData.msg}`);
            }
        } else if (useData.code !== 200) {
            throw new Error(`使用催产剂失败: ${useData.msg}`);
        }
        
        addLog('催产剂使用成功', 'success');
    } catch (error) {
        throw error;
    }
}
// 完成生育
async function finishBirth(askUid) {
    addLog(`完成生育 - askUid: ${askUid}`, 'info');
    
    try {
        const response = await fetch(`http://82.157.255.108/api/birth/finish?uid=${askUid}`, {
            method: 'POST',
            headers: {
                'authorization': selectedAccountA.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (data.code !== 200) {
            throw new Error(`完成生育失败: ${data.msg}`);
        }
        
        addLog('生育完成成功', 'success');
    } catch (error) {
        throw error;
    }
}

// 根据名称查找所有同名小鸟
async function findBirdsByName(birdName) {
    addLog(`查找小鸟 - 名称: ${birdName}`, 'info');
    
    try {
        let birds = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(`http://82.157.255.108/api/birth/birthwait?uid=${selectedReceiver.info.uid}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.code === 200 && data.data && data.data.content) {
                const pageBirds = data.data.content;
                birds.push(...pageBirds);
                hasMore = pageBirds.length > 0 && pageBirds.length >= 10;
                page++;
            } else {
                hasMore = false;
            }
        }
        
        const targetBirds = birds.filter(bird => bird.name === birdName);
        if (targetBirds.length > 0) {
            addLog(`找到 ${targetBirds.length} 只名为 "${birdName}" 的小鸟`, 'success');
        } else {
            addLog(`未找到名为 "${birdName}" 的小鸟`, 'warning');
        }
        
        return targetBirds;
    } catch (error) {
        throw error;
    }
}
// 执行配鸟
async function performBreeding(bird) {
    addLog(`执行配鸟 - 小鸟: ${bird.name} (ID: ${bird.id})`, 'info');
    
    try {
        let blesserBirds = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const blesserBirdResponse = await fetch(`http://82.157.255.108/api/birth/birthwait?birdId=${bird.id}&page=${page}`, {
                method: 'GET',
                headers: {
                    'authorization': selectedBlesser.user.sso,
                    'Content-Type': 'application/json'
                }
            });
            
            const blesserBirdData = await blesserBirdResponse.json();
            if (blesserBirdData.code === 200 && blesserBirdData.data && blesserBirdData.data.content) {
                const birds = blesserBirdData.data.content;
                blesserBirds.push(...birds);
                hasMore = birds.length > 0 && birds.length >= 10;
                page++;
            } else {
                hasMore = false;
                if (page === 0) {
                    addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 对方没有对应的小鸟，跳过`, 'warning');
                    return null;
                }
            }
        }
        
        if (blesserBirds.length === 0) {
            addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 对方没有对应的小鸟，跳过`, 'warning');
            return null;
        }
        
        const blesserBird = blesserBirds[0];
        addLog(`使用配对小鸟: ${blesserBird.name} (ID: ${blesserBird.id})`, 'info');
        
        const blessingResponse = await fetch(`http://82.157.255.108/api/birth/make?birdId=${blesserBird.id}&friendBirdId=${bird.id}`, {
            method: 'POST',
            headers: {
                'authorization': selectedBlesser.user.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const blessingData = await blessingResponse.json();
        if (blessingData.code !== 200) {
            addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 配鸟失败: ${blessingData.msg}，跳过`, 'warning');
            return null;
        }
        
        const blessingId = blessingData.data.id;
        addLog(`配鸟请求成功，ID: ${blessingId}`, 'success');
        
        const acceptResponse = await fetch(`http://82.157.255.108/api/birth/accept?id=${blessingId}`, {
            method: 'POST',
            headers: {
                'authorization': selectedReceiver.user.sso,
                'Content-Type': 'application/json'
            }
        });
        
        const acceptData = await acceptResponse.json();
        if (acceptData.code !== 200) {
            addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 接受配鸟失败: ${acceptData.msg}，跳过`, 'warning');
            return null;
        }
        
        addLog(`配鸟成功，获得askUid: ${acceptData.data.askUid}`, 'success');
        return acceptData.data;
        
    } catch (error) {
        addLog(`小鸟 ${bird.name} (ID: ${bird.id}) 配鸟异常: ${error.message}，跳过`, 'warning');
        return null;
    }
}