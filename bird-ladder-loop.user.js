// ==UserScript==
// @name         小鸟循环挑战最后一名
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      1.0.0
// @description  循环获取战斗排行榜最后一名并发起挑战
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
    <h3>循环挑战排行榜最后一名</h3>
    <input class="token" type="password" placeholder="令牌（优先读取网址 t 参数）">
    <input class="interval" type="number" min="3" step="1" value="5" placeholder="间隔秒数">
    <button class="start" type="button">开始循环</button>
    <button class="stop" type="button" hidden>停止循环</button>
    <div class="status">等待开始</div>
  `;
  document.body.appendChild(panel);

  const tokenInput = panel.querySelector('.token');
  const intervalInput = panel.querySelector('.interval');
  const startButton = panel.querySelector('.start');
  const stopButton = panel.querySelector('.stop');
  const status = panel.querySelector('.status');
  const urlParams = new URLSearchParams(location.search);
  let running = false;

  tokenInput.value = urlParams.get('t') || urlParams.get('token') || '';

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? '#c0394b' : '#626a80';
  }

  function makeOperationId() {
    const random = crypto.getRandomValues(new Uint32Array(2));
    return `lb_${random[0].toString(36)}_${random[1].toString(36)}`;
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await response.json();

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || data.msg || `HTTP ${response.status}`);
    }

    return data;
  }

  function getLastOpponent(rankingData) {
    const scenes = rankingData?.rankings?.scenes || [];
    const battle = rankingData?.rankings?.battle || {};

    for (let index = scenes.length - 1; index >= 0; index--) {
      const scene = scenes[index];
      const entries = battle[scene.id];

      if (Array.isArray(entries) && entries.length > 0) {
        return { sceneId: scene.id, opponent: entries[entries.length - 1] };
      }
    }

    for (const [sceneId, entries] of Object.entries(battle)) {
      if (Array.isArray(entries) && entries.length > 0) {
        return { sceneId, opponent: entries[entries.length - 1] };
      }
    }

    return null;
  }

  async function challengeOnce(token) {
    const ranking = await requestJson(`/api/rankings?token=${encodeURIComponent(token)}&view=battle`);
    const target = getLastOpponent(ranking);

    if (!target?.opponent?.username) {
      throw new Error('排行榜中没有可挑战的对象');
    }

    const result = await requestJson('/api/ladder/battle', {
      method: 'POST',
      body: JSON.stringify({
        token,
        operation_id: makeOperationId(),
        scene_id: target.sceneId,
        target_username: target.opponent.username,
        对手条目: target.opponent
      })
    });

    const resultText = result['胜负'] || result.message || '完成';
    return `${target.sceneId} / ${target.opponent['昵称'] || target.opponent.username}：${resultText}`;
  }

  async function delay(seconds) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  async function runLoop() {
    const token = tokenInput.value.trim();
    const interval = Math.max(3, Number(intervalInput.value) || 5);

    if (!token) {
      setStatus('请先填写令牌', true);
      return;
    }

    running = true;
    startButton.hidden = true;
    stopButton.hidden = false;

    while (running) {
      try {
        setStatus('正在读取排行榜...');
        setStatus(await challengeOnce(token));
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
