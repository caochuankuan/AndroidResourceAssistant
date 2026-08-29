// ==UserScript==
// @name         小鸟循环挑战玩家后第五名
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      1.4.0
// @description  循环获取战斗排行榜中玩家后的第五名并发起挑战
// @match        http://116.62.238.93/*
// @match        https://116.62.238.93/*
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const panel = document.createElement('section');
  panel.id = 'bird-ladder-loop-panel';
  panel.innerHTML = `
    <style>
      #bird-ladder-loop-panel {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        width: 280px;
        padding: 14px;
        border: 1px solid #d9dce8;
        border-radius: 12px;
        background: #fff;
        color: #20243a;
        box-shadow: 0 8px 28px #0002;
        font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #bird-ladder-loop-panel h3 { margin: 0 0 10px; font-size: 15px; }
      #bird-ladder-loop-panel input,
      #bird-ladder-loop-panel button { width: 100%; min-height: 34px; margin-top: 7px; }
      #bird-ladder-loop-panel input { padding: 6px 8px; border: 1px solid #cfd3df; border-radius: 7px; }
      #bird-ladder-loop-panel button { border: 0; border-radius: 7px; color: #fff; background: #5267d9; cursor: pointer; }
      #bird-ladder-loop-panel button.stop { background: #c94b58; }
      #bird-ladder-loop-panel .status { margin-top: 9px; color: #626a80; word-break: break-all; }
    </style>
    <h3>循环挑战玩家后第五名</h3>
    <input class="token" type="password" placeholder="令牌（优先读取网址 t 参数）">
    <input class="recovery-item" type="text" readonly placeholder="自动读取战斗恢复卡 item_id">
    <input class="scene" type="text" value="rainbow" placeholder="场景 ID">
    <input class="interval" type="number" min="3" step="1" value="5" placeholder="间隔秒数">
    <button class="start" type="button">开始循环</button>
    <button class="stop" type="button" hidden>停止循环</button>
    <div class="status">等待开始</div>
  `;
  document.body.appendChild(panel);

  const tokenInput = panel.querySelector('.token');
  const recoveryItemInput = panel.querySelector('.recovery-item');
  const sceneInput = panel.querySelector('.scene');
  const intervalInput = panel.querySelector('.interval');
  const startButton = panel.querySelector('.start');
  const stopButton = panel.querySelector('.stop');
  const status = panel.querySelector('.status');
  const urlParams = new URLSearchParams(location.search);
  let running = false;
  let cachedPlayer = null;
  let cachedRecoveryItem = null;

  tokenInput.value = urlParams.get('t') || urlParams.get('token') || '';

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? '#c0394b' : '#626a80';
  }

  function makeOperationId() {
    const random = crypto.getRandomValues(new Uint32Array(2));
    return `lb_${random[0].toString(36)}_${random[1].toString(36)}`;
  }

  async function getPlayerUsername(token) {
    if (cachedPlayer?.token === token) {
      return cachedPlayer.username;
    }

    const player = await requestJson(`/api/token/verify?token=${encodeURIComponent(token)}`);
    cachedPlayer = { token, username: player.username };
    return player.username;
  }

  async function getRecoveryItemId(token) {
    if (cachedRecoveryItem?.token === token) {
      return cachedRecoveryItem.itemId;
    }

    const warehouse = await requestJson(
      `/api/load?token=${encodeURIComponent(token)}&view=warehouse`
    );
    const data = typeof warehouse.data === 'string'
      ? JSON.parse(warehouse.data)
      : warehouse.data;
    const recoveryItem = data?.['背包物品列表']?.find(
      (item) => item['名称'] === '战斗恢复卡' && Number(item['数量']) > 0
    );
    const itemId = recoveryItem?.id || '';

    cachedRecoveryItem = { token, itemId };
    recoveryItemInput.value = itemId;
    return itemId;
  }

  async function requestJson(path, options = {}) {
    const { allowError = false, ...requestOptions } = options;
    const response = await fetch(path, {
      credentials: 'include',
      ...requestOptions,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await response.json();

    if (!allowError && (!response.ok || data.ok === false)) {
      throw new Error(data.message || data.msg || `HTTP ${response.status}`);
    }

    return data;
  }

  function getFifthOpponentAfterPlayer(rankingData, playerUsername) {
    const scenes = rankingData?.rankings?.scenes || [];
    const battle = rankingData?.rankings?.battle || {};

    function makeTarget(sceneId, entries, playerIndex) {
      const opponentIndex = Math.min(playerIndex + 5, entries.length - 1);

      return {
        sceneId,
        opponent: opponentIndex > playerIndex ? entries[opponentIndex] : null
      };
    }

    for (const scene of scenes) {
      const entries = battle[scene.id];
      const playerIndex = Array.isArray(entries)
        ? entries.findIndex((entry) => String(entry.username) === String(playerUsername))
        : -1;

      if (playerIndex >= 0) {
        return makeTarget(scene.id, entries, playerIndex);
      }
    }

    for (const [sceneId, entries] of Object.entries(battle)) {
      const playerIndex = Array.isArray(entries)
        ? entries.findIndex((entry) => String(entry.username) === String(playerUsername))
        : -1;

      if (playerIndex >= 0) {
        return makeTarget(sceneId, entries, playerIndex);
      }
    }

    return null;
  }

  async function challengeOnce(token, sceneId) {
    const [playerUsername, ranking] = await Promise.all([
      getPlayerUsername(token),
      requestJson(
        `/api/rankings?token=${encodeURIComponent(token)}&view=battle&scene=${encodeURIComponent(sceneId)}`
      )
    ]);
    const target = getFifthOpponentAfterPlayer(ranking, playerUsername);

    if (!target?.opponent?.username) {
      throw new Error('排行榜中玩家后面没有可挑战的对象');
    }

    const battleRequest = {
      method: 'POST',
      body: JSON.stringify({
        token,
        operation_id: makeOperationId(),
        scene_id: target.sceneId,
        target_username: target.opponent.username,
        对手条目: target.opponent
      })
    };
    let result = await requestJson('/api/ladder/battle', {
      ...battleRequest,
      allowError: true
    });

    if (result.ok === false && /战斗次数不足/.test(result.msg || result.message || '')) {
      const itemId = recoveryItemInput.value.trim();

      if (!itemId) {
        throw new Error('战斗次数不足，背包中没有可用的战斗恢复卡');
      }

      setStatus('战斗次数不足，正在使用恢复卡...');
      const recovery = await requestJson('/api/bag/operate', {
        method: 'POST',
        body: JSON.stringify({
          token,
          operation_id: `battle_recovery_${makeOperationId()}`,
          action: 'use_battle_recovery',
          item_id: itemId
        })
      });

      setStatus(recovery.msg || '恢复成功，正在重试挑战...');
      result = await requestJson('/api/ladder/battle', {
        ...battleRequest,
        body: JSON.stringify({
          ...JSON.parse(battleRequest.body),
          operation_id: makeOperationId()
        })
      });
    }

    if (result.ok === false) {
      throw new Error(result.msg || result.message || '挑战失败');
    }

    const resultText = result['胜负'] || result.message || '完成';
    return `${target.sceneId} / ${target.opponent['昵称'] || target.opponent.username}：${resultText}`;
  }

  async function delay(seconds) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  async function runLoop() {
    const token = tokenInput.value.trim();
    const sceneId = sceneInput.value.trim() || 'rainbow';
    const interval = Math.max(3, Number(intervalInput.value) || 5);

    if (!token) {
      setStatus('请先填写令牌', true);
      return;
    }

    try {
      setStatus('正在读取玩家和背包信息...');
      await Promise.all([
        getPlayerUsername(token),
        getRecoveryItemId(token)
      ]);
    } catch (error) {
      setStatus(`初始化失败：${error.message}`, true);
      return;
    }

    running = true;
    startButton.hidden = true;
    stopButton.hidden = false;

    while (running) {
      try {
        setStatus('正在读取排行榜...');
        setStatus(await challengeOnce(token, sceneId));
      } catch (error) {
        setStatus(`失败：${error.message}`, true);
      }

      if (running) {
        await delay(interval);
      }
    }
  }

  startButton.addEventListener('click', runLoop);
  stopButton.addEventListener('click', function () {
    running = false;
    startButton.hidden = false;
    stopButton.hidden = true;
    setStatus('已停止');
  });
})();
