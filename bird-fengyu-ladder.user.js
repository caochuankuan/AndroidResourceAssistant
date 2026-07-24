// ==UserScript==
// @name         小鸟风雨互娱天梯开关
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      1.0.8
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
  const ENABLED_STORAGE_KEY = 'yifeng-fengyu-ladder-enabled-v1';
  const DELAY_STORAGE_KEY = 'yifeng-fengyu-ladder-delay-v1';
  const DEFAULT_DELAY_MS = 3000;
  const CHALLENGE_MESSAGE = { type: 'ladder_quick_challenge', data: {} };
  const WITHDRAW_MESSAGE = { type: 'bank_withdraw', data: { currency_type: 1, amount: 50000 } };
  const STAMINA_MESSAGE = { type: 'ladder_use_stamina_item', data: { item_id: 1 } };
  const GOLD_ERROR_MESSAGE = '发起挑战需要金币余额达到 5000';
  const STAMINA_ERROR_MESSAGE = '天梯体力不足';
  const STAMINA_ITEM_FAIL_MESSAGE = '操作失败，请稍后重试';
  const sockets = new Set();

  let enabled = false;
  let loopTimer = 0;
  let renderTimer = 0;
  let challengeCount = 0;
  let withdrawCount = 0;
  let staminaItemCount = 0;
  let nextMessageId = 19;
  let expanded = false;
  let delayMs = DEFAULT_DELAY_MS;
  let mainClickTimer = 0;
  let stopReason = '';
  let shadow;

  const clampDelay = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(10, Math.min(10000, Math.round(number))) : DEFAULT_DELAY_MS;
  };

  const randomDelay = () => {
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.max(10, Math.round(delayMs * jitter));
  };

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
      message.type === 'ladder_use_stamina_item' &&
      message.code === 1 &&
      message.msg === STAMINA_ITEM_FAIL_MESSAGE
    ) {
      stopReason = STAMINA_ITEM_FAIL_MESSAGE;
      setEnabled(false);
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
    if (enabled) {
      stopReason = '';
    }
    try {
      localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? '1' : '0');
    } catch (_) {}
    if (enabled) {
      scheduleLoop();
    } else {
      window.clearTimeout(loopTimer);
      loopTimer = 0;
    }
    updateStatus();
  };

  const setDelayMs = (value) => {
    delayMs = clampDelay(value);
    try {
      localStorage.setItem(DELAY_STORAGE_KEY, String(delayMs));
    } catch (_) {}
    updateStatus();
  };

  const setExpanded = (value) => {
    expanded = Boolean(value);
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
          width: 42px;
          color: #fff;
          font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .wrap.open {
          width: 168px;
          padding: 8px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 14px;
          color: #243047;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 10px 28px rgba(19, 30, 58, 0.22);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .main {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(145deg, #6471ff, #17a1a6);
          box-shadow: 0 8px 22px rgba(35, 62, 155, 0.32);
          font: 800 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 0;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }

        .main svg {
          width: 19px;
          height: 19px;
          pointer-events: none;
        }

        .main-label {
          display: none;
          font-size: 13px;
          pointer-events: none;
        }

        .wrap.open .main {
          width: 72px;
          height: 34px;
          margin: 0 auto;
          border-radius: 999px;
          font-size: 13px;
        }

        .wrap.open .main svg {
          display: none;
        }

        .wrap.open .main-label {
          display: inline;
        }

        .main.running {
          background: linear-gradient(145deg, #1f9b64, #1976d2);
        }

        .main:active {
          transform: scale(0.97);
        }

        .detail {
          display: none;
        }

        .wrap.open .detail {
          display: block;
        }

        .field {
          display: grid;
          gap: 4px;
          margin-top: 8px;
          color: #59657a;
          font-weight: 700;
        }

        .delay {
          width: 100%;
          height: 32px;
          border: 1px solid #d4dae7;
          border-radius: 8px;
          padding: 4px 7px;
          color: #243047;
          background: #fff;
          font: 700 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .meta {
          display: grid;
          gap: 3px;
          margin-top: 8px;
          color: #59657a;
        }

        .hint {
          margin-top: 6px;
          color: #8a5260;
          font-size: 11px;
        }
      </style>
      <div class="wrap">
        <button class="main" type="button" aria-label="天梯挑战开关">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2 5 14h6l-1 8 9-13h-6l1-7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span class="main-label"></span>
        </button>
        <div class="detail">
          <label class="field">随机间隔 ms
            <input class="delay" type="number" min="10" max="10000" step="10" value="3000">
          </label>
          <div class="meta">
          <div>Socket：<span class="socket-count">0/0</span></div>
          <div>下个ID：<span class="next-id">19</span></div>
          <div>挑战：<span class="challenge-count">0</span></div>
          <div>取钱：<span class="withdraw-count">0</span></div>
          <div>体力卡：<span class="stamina-count">0</span></div>
          </div>
          <div class="reason"></div>
          <div class="hint">双击按钮收起</div>
        </div>
      </div>
    `;

    const main = shadow.querySelector('.main');
    main.addEventListener('click', () => {
      window.clearTimeout(mainClickTimer);
      mainClickTimer = window.setTimeout(() => {
        mainClickTimer = 0;
        if (!expanded) {
          setExpanded(true);
          return;
        }
        setEnabled(!enabled);
      }, 180);
    });
    main.addEventListener('dblclick', () => {
      window.clearTimeout(mainClickTimer);
      mainClickTimer = 0;
      setExpanded(!expanded);
    });
    shadow.querySelector('.delay').addEventListener('change', (event) => {
      setDelayMs(event.target.value);
    });
    shadow.querySelector('.delay').addEventListener('blur', (event) => {
      setDelayMs(event.target.value);
    });

    (document.body || document.documentElement).appendChild(root);
    updateStatus();
  };

  function updateStatus() {
    if (!shadow) {
      return;
    }

    const wrap = shadow.querySelector('.wrap');
    const main = shadow.querySelector('.main');
    const mainLabel = shadow.querySelector('.main-label');
    const delay = shadow.querySelector('.delay');
    const socketCount = shadow.querySelector('.socket-count');
    const nextId = shadow.querySelector('.next-id');
    const challenge = shadow.querySelector('.challenge-count');
    const withdraw = shadow.querySelector('.withdraw-count');
    const staminaCount = shadow.querySelector('.stamina-count');
    const reason = shadow.querySelector('.reason');
    const openCount = getOpenSockets().length;

    wrap.classList.toggle('open', expanded);
    main.classList.toggle('running', enabled);
    mainLabel.textContent = enabled ? '停止' : '开始';
    main.setAttribute('aria-label', '天梯挑战开关');
    main.removeAttribute('title');
    if (shadow.activeElement !== delay) {
      delay.value = String(delayMs);
    }
    socketCount.textContent = `${openCount}/${sockets.size}`;
    nextId.textContent = String(nextMessageId);
    challenge.textContent = String(challengeCount);
    withdraw.textContent = String(withdrawCount);
    staminaCount.textContent = String(staminaItemCount);
    reason.textContent = stopReason ? `已停止：${stopReason}` : '';
  }

  try {
    enabled = localStorage.getItem(ENABLED_STORAGE_KEY) === '1';
    delayMs = clampDelay(localStorage.getItem(DELAY_STORAGE_KEY) || DEFAULT_DELAY_MS);
  } catch (_) {
    enabled = false;
    delayMs = DEFAULT_DELAY_MS;
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
