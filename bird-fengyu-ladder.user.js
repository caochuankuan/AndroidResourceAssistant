// ==UserScript==
// @name         小鸟风雨互娱天梯开关
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      1.0.2
// @description  在 bird.fengyuhuyu.com 页面添加悬浮开关，通过当前 WebSocket 自动发起天梯快速挑战。
// @author       YiFeng Tools
// @match        https://bird.fengyuhuyu.com/web/index.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self || window.__YIFENG_FENGYU_LADDER__) {
    return;
  }
  window.__YIFENG_FENGYU_LADDER__ = true;

  const ROOT_ID = 'yifeng-fengyu-ladder';
  const STORAGE_KEY = 'yifeng-fengyu-ladder-enabled-v1';
  const CHALLENGE_MESSAGE = { type: 'ladder_quick_challenge', data: {} };
  const WITHDRAW_MESSAGE = { type: 'bank_withdraw', data: { currency_type: 1, amount: 50000 } };
  const STAMINA_MESSAGE = { type: 'ladder_use_stamina_item', data: { item_id: 1 } };
  const GOLD_ERROR_MESSAGE = '发起挑战需要金币余额达到 5000';
  const STAMINA_ERROR_MESSAGE = '天梯体力不足';
  const sockets = new Set();

  let enabled = false;
  let loopTimer = 0;
  let renderTimer = 0;
  let challengeCount = 0;
  let withdrawCount = 0;
  let staminaItemCount = 0;
  let nextMessageId = 19;
  let shadow;

  const randomDelay = () => Math.floor(10 + Math.random() * 91);

  const stringify = (value) => {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return String(value);
    }
  };

  const getOpenSockets = () => Array.from(sockets).filter((socket) => socket.readyState === WebSocket.OPEN);

  const updateStatusSoon = () => {
    if (renderTimer) return;
    renderTimer = window.setTimeout(() => {
      renderTimer = 0;
      updateStatus();
    }, 80);
  };

  const sendJson = (socket, payload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.send(stringify({ id: nextMessageId++, ...payload }));
    return true;
  };

  const sendToOpenSockets = (payload) => {
    let sent = 0;
    getOpenSockets().forEach((socket) => {
      if (sendJson(socket, payload)) sent += 1;
    });
    return sent;
  };

  const handleServerMessage = (data) => {
    if (typeof data !== 'string' || !data.trim().startsWith('{')) {
      return;
    }

    let message;
    try {
      message = JSON.parse(data);
    } catch (_) {
      return;
    }

    if (
      message &&
      message.type === 'ladder_quick_challenge' &&
      message.code === 1 &&
      (message.msg === GOLD_ERROR_MESSAGE || message.msg === STAMINA_ERROR_MESSAGE)
    ) {
      const isStaminaError = message.msg === STAMINA_ERROR_MESSAGE;
      const sent = isStaminaError ? sendToOpenSockets(STAMINA_MESSAGE) : sendToOpenSockets(WITHDRAW_MESSAGE);
      if (sent > 0 && isStaminaError) {
        staminaItemCount += sent;
        updateStatusSoon();
      } else if (sent > 0) {
        withdrawCount += sent;
        updateStatusSoon();
      }
    }
  };

  const scheduleLoop = () => {
    window.clearTimeout(loopTimer);
    if (!enabled) {
      return;
    }
    loopTimer = window.setTimeout(runLoop, randomDelay());
  };

  const runLoop = () => {
    if (!enabled) {
      return;
    }

    const openSockets = getOpenSockets();
    if (openSockets.length === 0) {
      scheduleLoop();
      updateStatusSoon();
      return;
    }

    openSockets.forEach((socket) => {
      if (sendJson(socket, CHALLENGE_MESSAGE)) {
        challengeCount += 1;
      }
    });
    updateStatusSoon();
    scheduleLoop();
  };

  const setEnabled = (value) => {
    enabled = Boolean(value);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (_) {}
    if (enabled) {
      scheduleLoop();
    } else {
      window.clearTimeout(loopTimer);
      loopTimer = 0;
    }
    updateStatus();
  };

  if (typeof window.WebSocket === 'function') {
    const OriginalWebSocket = window.WebSocket;
    const LadderWebSocket = function (url, protocols) {
      if (!new.target) {
        throw new TypeError("Failed to construct 'WebSocket': Please use the 'new' operator.");
      }

      const socket = protocols === undefined
        ? new OriginalWebSocket(url)
        : new OriginalWebSocket(url, protocols);

      sockets.add(socket);
      socket.addEventListener('open', updateStatusSoon);
      socket.addEventListener('message', (event) => handleServerMessage(event.data));
      socket.addEventListener('close', () => {
        sockets.delete(socket);
        updateStatusSoon();
      });
      socket.addEventListener('error', updateStatusSoon);
      updateStatusSoon();

      return socket;
    };
    LadderWebSocket.prototype = OriginalWebSocket.prototype;
    Object.setPrototypeOf(LadderWebSocket, OriginalWebSocket);
    window.WebSocket = LadderWebSocket;
  }

  const createUi = () => {
    if (document.getElementById(ROOT_ID)) {
      return;
    }

    const root = document.createElement('div');
    root.id = ROOT_ID;
    shadow = root.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

        .wrap {
          position: fixed;
          right: 14px;
          bottom: 104px;
          z-index: 2147483647;
          width: 150px;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 12px;
          color: #243047;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 10px 28px rgba(19, 30, 58, 0.22);
          font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .title {
          min-width: 0;
          overflow: hidden;
          font-weight: 800;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .switch {
          position: relative;
          width: 44px;
          height: 24px;
          flex: 0 0 auto;
        }

        .switch input {
          position: absolute;
          inset: 0;
          opacity: 0;
        }

        .track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #c8cedb;
          transition: background 150ms ease;
        }

        .track::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.26);
          transition: transform 150ms ease;
        }

        .switch input:checked + .track {
          background: #2563eb;
        }

        .switch input:checked + .track::after {
          transform: translateX(20px);
        }

        .meta {
          display: grid;
          gap: 3px;
          margin-top: 8px;
          color: #59657a;
        }

        .state {
          font-weight: 700;
          color: #1f8f5f;
        }

        .state.off {
          color: #9b4450;
        }
      </style>
      <div class="wrap">
        <div class="top">
          <div class="title">天梯挑战</div>
          <label class="switch" title="开启/停止自动天梯挑战">
            <input class="toggle" type="checkbox">
            <span class="track"></span>
          </label>
        </div>
        <div class="meta">
          <div>状态：<span class="state">停止</span></div>
          <div>Socket：<span class="socket-count">0/0</span></div>
          <div>下个ID：<span class="next-id">19</span></div>
          <div>挑战：<span class="challenge-count">0</span></div>
          <div>取钱：<span class="withdraw-count">0</span></div>
          <div>体力卡：<span class="stamina-count">0</span></div>
        </div>
      </div>
    `;

    shadow.querySelector('.toggle').addEventListener('change', (event) => {
      setEnabled(event.target.checked);
    });

    (document.body || document.documentElement).appendChild(root);
    updateStatus();
  };

  function updateStatus() {
    if (!shadow) {
      return;
    }

    const toggle = shadow.querySelector('.toggle');
    const state = shadow.querySelector('.state');
    const socketCount = shadow.querySelector('.socket-count');
    const nextId = shadow.querySelector('.next-id');
    const challenge = shadow.querySelector('.challenge-count');
    const withdraw = shadow.querySelector('.withdraw-count');
    const staminaCount = shadow.querySelector('.stamina-count');
    const openCount = getOpenSockets().length;

    toggle.checked = enabled;
    state.textContent = enabled ? '运行中' : '停止';
    state.classList.toggle('off', !enabled);
    socketCount.textContent = `${openCount}/${sockets.size}`;
    nextId.textContent = String(nextMessageId);
    challenge.textContent = String(challengeCount);
    withdraw.textContent = String(withdrawCount);
    staminaCount.textContent = String(staminaItemCount);
  }

  try {
    enabled = localStorage.getItem(STORAGE_KEY) === '1';
  } catch (_) {
    enabled = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUi, { once: true });
  } else {
    createUi();
  }

  if (enabled) {
    scheduleLoop();
  }
})();
