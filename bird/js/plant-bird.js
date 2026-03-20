let users = [];
let isRunning = false;       // 是否正在运行
let countdownTimer = null;   // 倒计时定时器

// 诱饵列表（从接口获取后本地维护，i=诱饵ID，n=名称，func=可捕鸟类，fp=价格）
const BAIT_LIST = [
    { i: 1,   n: "谷子",      func: "麻雀",                fp: 2   },
    { i: 2,   n: "燕麦",      func: "燕子,乌鸦,麻雀",      fp: 4   },
    { i: 3,   n: "大豆",      func: "喜鹊,燕子,鹌鹑",      fp: 6   },
    { i: 4,   n: "大米",      func: "鸽子,野鸭,山鸡",      fp: 15  },
    { i: 5,   n: "玉米",      func: "喜鹊,鸽子,鹦鹉",      fp: 18  },
    { i: 6,   n: "小鱼",      func: "鹦鹉,猫头鹰,野鸭",    fp: 24  },
    { i: 8,   n: "松子",      func: "黄鹂,松鸡,猫头鹰,金丝雀", fp: 28 },
    { i: 9,   n: "白蚁",      func: "松鸡,啄木鸟,斑鸠,鹧鸪", fp: 22 },
    { i: 10,  n: "草鱼",      func: "乌鸦,猫头鹰,大雁",    fp: 45  },
    { i: 12,  n: "水草籽",    func: "秧鸡,翠鸟",           fp: 7   },
    { i: 13,  n: "小鱼苗",    func: "鹈鹕,鸬鹚,鹭鸶",      fp: 100 },
    { i: 14,  n: "小贝壳",    func: "鹭鸶,海鸥,鹈鹕",      fp: 60  },
    { i: 15,  n: "小螃蟹",    func: "海鸥,军舰鸟",         fp: 16  },
    { i: 17,  n: "水仙茎",    func: "海鸥,海雀,翠鸟,水雉", fp: 8   },
    { i: 18,  n: "小乌贼",    func: "信天翁,大贼鸥,军舰鸟,企鹅", fp: 50 },
    { i: 19,  n: "螺丝",      func: "潜鸟,鹳,火烈鸟",      fp: 35  },
    { i: 20,  n: "水蜘蛛",    func: "雨燕,海雀,翠鸟",      fp: 5   },
    { i: 21,  n: "鳕鱼",      func: "企鹅,天鹅,大贼鸥",    fp: 60  },
    { i: 23,  n: "锦鲤",      func: "仙鹤,火烈鸟,企鹅,信天翁", fp: 160 },
    { i: 24,  n: "蚯蚓",      func: "沙鸡,火鸡",           fp: 16  },
    { i: 25,  n: "蚜虫",      func: "蜂鸟,百灵,沙鸡",      fp: 18  },
    { i: 27,  n: "毛毛虫",    func: "杜鹃,布谷鸟,夜莺",    fp: 180 },
    { i: 28,  n: "青蛙",      func: "鹗,红隼",             fp: 310 },
    { i: 29,  n: "独角仙",    func: "伯劳,大鸨,杜鹃",      fp: 200 },
    { i: 30,  n: "田鼠",      func: "伯劳,犀鸟,鹗",        fp: 220 },
    { i: 31,  n: "兔子",      func: "金雕,苍鹰,鹞,红隼",   fp: 150 },
    { i: 32,  n: "仙人掌",    func: "鸵鸟,鸸鹋,犀鸟",      fp: 340 },
    { i: 34,  n: "蛇",        func: "金雕,苍鹰,秃鹫,鹞",   fp: 100 },
    { i: 35,  n: "鼻涕虫",    func: "旅鸽,红鸭",           fp: 28  },
    { i: 36,  n: "核桃",      func: "秃鹃,黄嘴沙鸭",       fp: 260 },
    { i: 38,  n: "蜗牛",      func: "荆棘鸟,果鸠,太平鸟",  fp: 8   },
    { i: 39,  n: "樱桃",      func: "渡渡鸟,几维鸟,黄嘴沙鸭", fp: 200 },
    { i: 40,  n: "小蜥蜴",    func: "太平鸟,极乐鸟",       fp: 47  },
    { i: 41,  n: "毒蜘蛛",    func: "极乐鸟,几维鸟,太阳鸟", fp: 270 },
    { i: 43,  n: "恐龙蛋",    func: "恐鸟,象鸟,始祖鸟",    fp: 680 },
    { i: 44,  n: "鼠龙",      func: "始祖鸟,翼龙,极乐鸟,恐鸟", fp: 580 },
    { i: 45,  n: "蓝宝石",    func: "金鹅,精卫",           fp: 25  },
    { i: 46,  n: "曼陀罗花",  func: "青鸟,七彩孔雀,精卫",  fp: 43  },
    { i: 47,  n: "狼肉",      func: "狮鹫,雷鸟,青鸟",      fp: 380 },
    { i: 49,  n: "巨蟒",      func: "雷鸟,青鸟",           fp: 210 },
    { i: 51,  n: "虎肉",      func: "九头鸟,毕方,雷鸟",    fp: 234 },
    { i: 53,  n: "受伤的白兔", func: "青鸟,赤鷩,天使",     fp: 310 },
    { i: 54,  n: "梧桐籽",    func: "草鸡,凤凰",           fp: 30  },
    { i: 55,  n: "小神龙",    func: "神鹏,凤凰,天使",      fp: 650 },
    { i: 144, n: "玉露琼浆",  func: "酒仙鸟,雷雀",         fp: 446 },
    { i: 148, n: "云之结晶",  func: "微火兽,锁链鸟",       fp: 565 },
    { i: 209, n: "福果",      func: "白鹇",                fp: 6   },
];

// 页面加载初始化
document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
    populateUserSelect();
    populateBaitSelect();
});

function loadUsers() {
    const saved = localStorage.getItem('users');
    if (saved) users = JSON.parse(saved);
}

function populateUserSelect() {
    const sel = document.getElementById('userSelect');
    sel.innerHTML = '<option value="">请选择用户</option>';
    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.name;
        sel.appendChild(opt);
    });
}

// 填充诱饵下拉列表
function populateBaitSelect() {
    const sel = document.getElementById('baitSelect');
    sel.innerHTML = '';
    BAIT_LIST.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.i;
        opt.textContent = `${b.n}（${b.func}）- ${b.fp}金币`;
        sel.appendChild(opt);
    });
    // 默认选中小神龙(id=55)
    sel.value = '55';
    updateBaitDesc();
}

// 更新诱饵描述
function updateBaitDesc() {
    const sel = document.getElementById('baitSelect');
    const bait = BAIT_LIST.find(b => b.i === parseInt(sel.value));
    const desc = document.getElementById('baitDesc');
    if (bait) {
        desc.textContent = `可捕：${bait.func} | 单价：${bait.fp} 金币`;
    }
}

function getSelectedUser() {
    const sel = document.getElementById('userSelect');
    if (!sel.value) { addOutput('请先选择用户', 'warning'); return null; }
    return users.find(u => u.id === sel.value);
}

function getApiBaseUrl(user) {
    if (user && user.originalUrl) {
        try { return new URL(user.originalUrl).origin; } catch (e) {}
    }
    return 'http://82.157.255.108';
}

// 输出日志
function addOutput(msg, type = 'info') {
    const el = document.getElementById('outputContent');
    if (el.classList.contains('empty')) {
        el.classList.remove('empty');
        el.textContent = '';
    }
    const ts = new Date().toLocaleTimeString();
    const span = document.createElement('span');
    span.className = type;
    span.textContent = `[${ts}] ${msg}\n`;
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
}

function clearOutput() {
    const el = document.getElementById('outputContent');
    el.innerHTML = '';
    el.classList.add('empty');
    el.textContent = '等待操作...';
}

function setStatus(text) {
    document.getElementById('statusText').textContent = text;
}

function setCountdown(text) {
    document.getElementById('countdownText').textContent = text;
}

// 停止运行
function stopPlantBird() {
    isRunning = false;
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    setStatus('已停止');
    setCountdown('');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    addOutput('⏹ 已手动停止', 'warning');
}

// 倒计时等待，直到 targetTimestamp（秒级）
function waitUntil(targetTimestamp) {
    return new Promise((resolve) => {
        if (countdownTimer) clearInterval(countdownTimer);

        const tick = () => {
            if (!isRunning) { clearInterval(countdownTimer); resolve(); return; }
            const now = Math.floor(Date.now() / 1000);
            const remaining = targetTimestamp - now;
            if (remaining <= 0) {
                clearInterval(countdownTimer);
                setCountdown('');
                resolve();
            } else {
                const m = Math.floor(remaining / 60);
                const s = remaining % 60;
                setCountdown(`距收鸟还有 ${m > 0 ? m + '分' : ''}${s}秒`);
            }
        };

        tick();
        countdownTimer = setInterval(tick, 1000);
    });
}

// 主流程入口
async function startPlantBird() {
    const user = getSelectedUser();
    if (!user) return;

    isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    const bid = parseInt(document.getElementById('baitSelect').value) || 55;
    const baitNum = parseInt(document.getElementById('baitNum').value) || 100;
    const maxRounds = parseInt(document.getElementById('maxRounds').value) || 100;
    const roundInterval = (parseFloat(document.getElementById('roundInterval').value) || 2) * 1000;
    const selectedBait = BAIT_LIST.find(b => b.i === bid);
    addOutput(`🚀 开始为用户 "${user.name}" 执行一键种鸟，诱饵：${selectedBait ? selectedBait.n : bid}，共 ${maxRounds} 轮`, 'info');

    const base = getApiBaseUrl(user);
    const headers = { 'authorization': user.sso, 'Content-Type': 'application/json' };

    let round = 0;
    while (isRunning && round < maxRounds) {
        round++;
        addOutput(`\n📦 第 ${round}/${maxRounds} 轮`, 'info');
        setStatus('🌱 正在种鸟...');
        addOutput('\n=== 开始种鸟 ===', 'info');

        let finishTime = null;

        try {
            // 先尝试直接种鸟
            const placeRes = await apiPost(`${base}/api/fowling/place/all?bid=${bid}`, headers);

            if (placeRes.code === 200) {
                addOutput(`✅ 种鸟成功！`, 'success');
                // 从返回数据中取最大 finishTime
                finishTime = getMaxFinishTime(placeRes.data);
                addOutput(`📋 种鸟数量: ${Array.isArray(placeRes.data) ? placeRes.data.length : '-'} 个`, 'info');
            } else if (placeRes.code === 500 && placeRes.msg && placeRes.msg.includes('没有该饵')) {
                // 没有诱饵，先购买
                addOutput(`⚠️ 没有诱饵，正在购买 ${baitNum} 个...`, 'warning');
                const buyRes = await apiPost(`${base}/api/shop/buy/goods?func=BAIT&id=${bid}&num=${baitNum}`, headers);
                if (buyRes.code === 200) {
                    addOutput(`✅ 购买诱饵成功`, 'success');
                    // 再次种鸟
                    const retryRes = await apiPost(`${base}/api/fowling/place/all?bid=${bid}`, headers);
                    if (retryRes.code === 200) {
                        addOutput(`✅ 种鸟成功！`, 'success');
                        finishTime = getMaxFinishTime(retryRes.data);
                        addOutput(`📋 种鸟数量: ${Array.isArray(retryRes.data) ? retryRes.data.length : '-'} 个`, 'info');
                    } else {
                        addOutput(`❌ 种鸟失败: ${retryRes.msg}`, 'error');
                    }
                } else {
                    addOutput(`❌ 购买诱饵失败: ${buyRes.msg}`, 'error');
                }
            } else {
                addOutput(`❌ 种鸟失败: ${placeRes.msg}`, 'error');
            }
        } catch (e) {
            addOutput(`❌ 种鸟请求异常: ${e.message}`, 'error');
        }

        if (!isRunning) break;

        // ── 步骤2：等待 finishTime ────────────────────────────────
        if (finishTime) {
            const now = Math.floor(Date.now() / 1000);
            const waitSec = finishTime - now;
            if (waitSec > 0) {
                addOutput(`⏳ 等待收鸟，预计 ${new Date(finishTime * 1000).toLocaleTimeString()} 完成`, 'info');
                setStatus('⏳ 等待收鸟中...');
                await waitUntil(finishTime);
            }
        } else {
            // 没拿到 finishTime，等 60 秒后重试
            addOutput(`⚠️ 未获取到完成时间，60秒后重试`, 'warning');
            setStatus('⚠️ 等待重试...');
            await waitUntil(Math.floor(Date.now() / 1000) + 60);
        }

        if (!isRunning) break;

        // ── 步骤3：收鸟（延迟5秒再收）────────────────────────────
        addOutput(`⏳ 延迟5秒后收鸟...`, 'info');
        await sleep(5000);

        if (!isRunning) break;

        setStatus('🎣 正在收鸟...');
        addOutput('\n=== 开始收鸟 ===', 'info');

        try {
            const finishRes = await apiPost(`${base}/api/fowling/all/finish`, headers);

            if (finishRes.code === 200) {
                addOutput(`✅ 收鸟成功！`, 'success');
            } else if (finishRes.code === 500 && finishRes.msg && finishRes.msg.includes('仓库已满')) {
                // 仓库已满，先清理
                addOutput(`⚠️ 仓库已满，正在清理仓库...`, 'warning');
                setStatus('🧹 清理仓库中...');

                const sellRes = await apiPost(`${base}/api/storage/bird/sellall?confirm=true`, headers);
                if (sellRes.code === 200) {
                    addOutput(`✅ 仓库清理成功，获得金币: ${sellRes.data || 0}`, 'success');
                } else {
                    addOutput(`❌ 仓库清理失败: ${sellRes.msg}`, 'error');
                }

                // 清理后再次收鸟
                addOutput(`🔄 重新收鸟...`, 'info');
                const retryFinish = await apiPost(`${base}/api/fowling/all/finish`, headers);
                if (retryFinish.code === 200) {
                    addOutput(`✅ 收鸟成功！`, 'success');
                } else {
                    addOutput(`❌ 收鸟失败: ${retryFinish.msg}`, 'error');
                }
            } else {
                addOutput(`❌ 收鸟失败: ${finishRes.msg}`, 'error');
            }
        } catch (e) {
            addOutput(`❌ 收鸟请求异常: ${e.message}`, 'error');
        }

        if (!isRunning) break;

        // 本轮完成，按配置间隔后开始下一轮
        addOutput(`\n✅ 本轮完成，${roundInterval / 1000}秒后开始下一轮种鸟...`, 'success');
        setStatus(`✅ 第 ${round}/${maxRounds} 轮完成，准备下一轮...`);
        if (roundInterval > 0) await sleep(roundInterval);
    }

    // 退出循环
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    if (round >= maxRounds) {
        setStatus(`🎉 已完成全部 ${maxRounds} 轮`);
        addOutput(`\n🎉 已完成全部 ${maxRounds} 轮，自动停止`, 'success');
    } else {
        setStatus('已停止');
    }
    setCountdown('');
}

// 从种鸟返回数据中取最大 finishTime
function getMaxFinishTime(data) {
    if (!Array.isArray(data) || data.length === 0) return null;
    return Math.max(...data.map(d => d.finishTime || 0));
}

// 封装 POST 请求，统一返回解析后的 JSON
async function apiPost(url, headers) {
    const res = await fetch(url, { method: 'POST', headers });
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return { code: -1, msg: text }; }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
