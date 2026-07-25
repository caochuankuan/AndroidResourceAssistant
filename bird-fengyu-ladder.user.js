// ==UserScript==
// @name         小鸟风雨互娱天梯开关
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      1.4.2
// @description  在 bird.fengyuhuyu.com 页面添加悬浮开关，通过当前 WebSocket 自动发起天梯快速挑战。
// @author       Moonlit Finch
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
  const WITHDRAW_AMOUNT_STORAGE_KEY = 'yifeng-fengyu-ladder-withdraw-amount-v1';
  const POSITION_STORAGE_KEY = 'yifeng-fengyu-ladder-position-v1';
  const DEFAULT_DELAY_MS = 3000;
  const DEFAULT_WITHDRAW_AMOUNT = 50000;
  const CHALLENGE_MESSAGE = { type: 'ladder_quick_challenge', data: {} };
  const STAMINA_MESSAGE = { type: 'ladder_use_stamina_item', data: { item_id: 1 } };
  const GOLD_ERROR_MESSAGE = '发起挑战需要金币余额达到 5000';
  const STAMINA_ERROR_MESSAGE = '天梯体力不足';
  const STAMINA_ITEM_FAIL_MESSAGE = '操作失败，请稍后重试';
  const WITHDRAW_UNLOCK_DELAY_MS = 3000;
  const MAX_CHALLENGES_WITHOUT_RESPONSE = 10;
  const sockets = new Map();

  let enabled = false;
  let loopTimer = 0;
  let renderTimer = 0;
  let challengeCount = 0;
  let withdrawCount = 0;
  let staminaItemCount = 0;
  let nextMessageId = 19;
  let expanded = false;
  let delayMs = DEFAULT_DELAY_MS;
  let withdrawAmount = DEFAULT_WITHDRAW_AMOUNT;
  let mainClickTimer = 0;
  let stopReason = '';
  let floatingPosition = null;
  let dragState = null;
  let suppressNextClick = false;
  let withdrawPending = false;
  let withdrawUnlockTimer = 0;
  let activeSocket = null;
  let socketSeq = 0;
  let shadow;

  const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

  const clampDelay = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(10, Math.min(10000, Math.round(number))) : DEFAULT_DELAY_MS;
  };

  const clampWithdrawAmount = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(1, Math.min(999999999, Math.round(number))) : DEFAULT_WITHDRAW_AMOUNT;
  };

  const randomDelay = () => {
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.max(10, Math.round(delayMs * jitter));
  };

  const loadFloatingPosition = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY) || 'null');
      if (
        saved &&
        Number.isFinite(Number(saved.left)) &&
        Number.isFinite(Number(saved.top))
      ) {
        return { left: Number(saved.left), top: Number(saved.top) };
      }
    } catch (_) {}
    return null;
  };

  const saveFloatingPosition = () => {
    if (!floatingPosition) return;
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(floatingPosition));
    } catch (_) {}
  };

  const applyFloatingPosition = (position, persist = false) => {
    if (!shadow || !position) return;
    const wrap = shadow.querySelector('.wrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const width = rect.width || (expanded ? 168 : 42);
    const height = rect.height || 42;
    floatingPosition = {
      left: clampNumber(Number(position.left) || 0, 0, Math.max(0, innerWidth - width)),
      top: clampNumber(Number(position.top) || 0, 0, Math.max(0, innerHeight - height))
    };
    wrap.style.left = `${floatingPosition.left}px`;
    wrap.style.top = `${floatingPosition.top}px`;
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    if (persist) {
      saveFloatingPosition();
    }
  };

  const stringify = (value) => {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return String(value);
    }
  };

  const getOpenSockets = () => Array.from(sockets.keys()).filter((socket) => socket.readyState === WebSocket.OPEN);

  const getSocketInfo = (socket) => sockets.get(socket);

  const getActiveSocket = () => {
    if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
      return activeSocket;
    }
    activeSocket = getOpenSockets()
      .sort((a, b) => {
        const left = getSocketInfo(a) || {};
        const right = getSocketInfo(b) || {};
        return (right.lastMessageAt || right.openedAt || 0) - (left.lastMessageAt || left.openedAt || 0);
      })[0] || null;
    return activeSocket;
  };

  const markActiveSocket = (socket) => {
    const info = getSocketInfo(socket);
    if (info) {
      info.lastMessageAt = Date.now();
    }
    activeSocket = socket;
  };

  const switchToNextSocket = () => {
    const openSockets = getOpenSockets();
    if (openSockets.length === 0) {
      activeSocket = null;
      return null;
    }
    const current = getActiveSocket();
    const currentInfo = getSocketInfo(current);
    if (currentInfo) {
      currentInfo.challengesWithoutResponse = 0;
    }
    if (openSockets.length === 1) {
      activeSocket = openSockets[0];
      return activeSocket;
    }
    const currentIndex = Math.max(0, openSockets.indexOf(current));
    activeSocket = openSockets[(currentIndex + 1) % openSockets.length];
    updateStatusSoon();
    return activeSocket;
  };

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

  const sendToActiveSocket = (payload) => sendJson(getActiveSocket(), payload) ? 1 : 0;

  const unlockWithdrawSoon = () => {
    window.clearTimeout(withdrawUnlockTimer);
    withdrawUnlockTimer = window.setTimeout(() => {
      withdrawPending = false;
      updateStatusSoon();
    }, WITHDRAW_UNLOCK_DELAY_MS);
  };

  const requestWithdraw = () => {
    if (withdrawPending) {
      return;
    }
    const sent = sendToActiveSocket({ type: 'bank_withdraw', data: { currency_type: 1, amount: withdrawAmount } });
    if (sent > 0) {
      withdrawPending = true;
      withdrawCount += sent;
      unlockWithdrawSoon();
      updateStatusSoon();
    }
  };

  const handleServerMessage = (socket, data) => {
    if (typeof data !== 'string' || !data.trim().startsWith('{')) {
      return;
    }

    let message;
    try {
      message = JSON.parse(data);
    } catch (_) {
      return;
    }
    if (message && message.type === 'ladder_quick_challenge') {
      markActiveSocket(socket);
      const info = getSocketInfo(socket);
      if (info) {
        info.challengesWithoutResponse = 0;
      }
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

    if (message && message.type === 'bank_withdraw') {
      withdrawPending = false;
      window.clearTimeout(withdrawUnlockTimer);
      updateStatusSoon();
      return;
    }

    if (
      message &&
      message.type === 'ladder_quick_challenge' &&
      message.code === 1 &&
      (message.msg === GOLD_ERROR_MESSAGE || message.msg === STAMINA_ERROR_MESSAGE)
    ) {
      const isStaminaError = message.msg === STAMINA_ERROR_MESSAGE;
      if (!isStaminaError) {
        requestWithdraw();
        return;
      }
      const sent = sendToActiveSocket(STAMINA_MESSAGE);
      if (sent > 0 && isStaminaError) {
        staminaItemCount += sent;
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
    if (openSockets.length === 0 || withdrawPending) {
      scheduleLoop();
      updateStatusSoon();
      return;
    }

    let socket = getActiveSocket();
    let info = getSocketInfo(socket);
    if (info && info.challengesWithoutResponse >= MAX_CHALLENGES_WITHOUT_RESPONSE) {
      socket = switchToNextSocket();
      info = getSocketInfo(socket);
    }

    if (sendJson(socket, CHALLENGE_MESSAGE)) {
      challengeCount += 1;
      if (info) {
        info.challengesWithoutResponse = (info.challengesWithoutResponse || 0) + 1;
      }
    }
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
      withdrawPending = false;
      window.clearTimeout(withdrawUnlockTimer);
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

  const setWithdrawAmount = (value) => {
    withdrawAmount = clampWithdrawAmount(value);
    try {
      localStorage.setItem(WITHDRAW_AMOUNT_STORAGE_KEY, String(withdrawAmount));
    } catch (_) {}
    updateStatus();
  };

  const setExpanded = (value) => {
    expanded = Boolean(value);
    updateStatus();
    window.requestAnimationFrame(() => applyFloatingPosition(floatingPosition));
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

      sockets.set(socket, { id: ++socketSeq, openedAt: Date.now(), lastMessageAt: 0, challengesWithoutResponse: 0 });
      activeSocket = socket;
      socket.addEventListener('open', updateStatusSoon);
      socket.addEventListener('message', (event) => handleServerMessage(socket, event.data));
      socket.addEventListener('close', () => {
        sockets.delete(socket);
        if (activeSocket === socket) activeSocket = null;
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
          touch-action: none;
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
          touch-action: auto;
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
          <label class="field">取钱金额
            <input class="withdraw-amount" type="number" min="1" max="999999999" step="1000" value="50000">
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
    const handleMainPress = () => {
      window.clearTimeout(mainClickTimer);
      mainClickTimer = window.setTimeout(() => {
        mainClickTimer = 0;
        if (!expanded) {
          setExpanded(true);
          return;
        }
        setEnabled(!enabled);
      }, 180);
    };
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
    shadow.querySelector('.withdraw-amount').addEventListener('change', (event) => {
      setWithdrawAmount(event.target.value);
    });
    shadow.querySelector('.withdraw-amount').addEventListener('blur', (event) => {
      setWithdrawAmount(event.target.value);
    });
    const wrap = shadow.querySelector('.wrap');
    wrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('.delay, .withdraw-amount')) {
        return;
      }
      const rect = wrap.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        moved: false,
        startedOnMain: Boolean(event.target.closest('.main'))
      };
      wrap.setPointerCapture(event.pointerId);
    });
    wrap.addEventListener('pointermove', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      if (!dragState.moved && Math.hypot(dx, dy) < 5) {
        return;
      }
      dragState.moved = true;
      suppressNextClick = true;
      event.preventDefault();
      applyFloatingPosition({
        left: dragState.left + dx,
        top: dragState.top + dy
      });
    });
    wrap.addEventListener('pointerup', (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }
      const wasClickOnMain = dragState.startedOnMain && !dragState.moved;
      if (dragState.moved) {
        saveFloatingPosition();
      }
      dragState = null;
      try {
        wrap.releasePointerCapture(event.pointerId);
      } catch (_) {}
      if (wasClickOnMain) {
        handleMainPress();
      }
    });
    wrap.addEventListener('pointercancel', () => {
      dragState = null;
    });
    wrap.addEventListener('click', (event) => {
      if (suppressNextClick && !event.target.closest('.main')) {
        suppressNextClick = false;
      }
      event.preventDefault();
    }, true);
    window.addEventListener('resize', () => {
      applyFloatingPosition(floatingPosition, true);
    });

    (document.body || document.documentElement).appendChild(root);
    updateStatus();
    applyFloatingPosition(floatingPosition);
  };

  function updateStatus() {
    if (!shadow) {
      return;
    }

    const wrap = shadow.querySelector('.wrap');
    const main = shadow.querySelector('.main');
    const mainLabel = shadow.querySelector('.main-label');
    const delay = shadow.querySelector('.delay');
    const withdrawAmountInput = shadow.querySelector('.withdraw-amount');
    const socketCount = shadow.querySelector('.socket-count');
    const nextId = shadow.querySelector('.next-id');
    const challenge = shadow.querySelector('.challenge-count');
    const withdraw = shadow.querySelector('.withdraw-count');
    const staminaCount = shadow.querySelector('.stamina-count');
    const reason = shadow.querySelector('.reason');
    const openCount = getOpenSockets().length;
    const activeInfo = activeSocket && activeSocket.readyState === WebSocket.OPEN ? getSocketInfo(activeSocket) : null;
    const noResponseCount = activeInfo ? activeInfo.challengesWithoutResponse || 0 : 0;

    wrap.classList.toggle('open', expanded);
    applyFloatingPosition(floatingPosition);
    main.classList.toggle('running', enabled);
    mainLabel.textContent = enabled ? '停止' : '开始';
    main.setAttribute('aria-label', '天梯挑战开关');
    main.removeAttribute('title');
    if (shadow.activeElement !== delay) {
      delay.value = String(delayMs);
    }
    if (shadow.activeElement !== withdrawAmountInput) {
      withdrawAmountInput.value = String(withdrawAmount);
    }
    socketCount.textContent = `${openCount}/${sockets.size}${activeInfo ? ` #${activeInfo.id} ${noResponseCount}/${MAX_CHALLENGES_WITHOUT_RESPONSE}` : ''}`;
    nextId.textContent = String(nextMessageId);
    challenge.textContent = String(challengeCount);
    withdraw.textContent = String(withdrawCount);
    staminaCount.textContent = String(staminaItemCount);
    reason.textContent = stopReason ? `已停止：${stopReason}` : '';
  }

  try {
    enabled = localStorage.getItem(ENABLED_STORAGE_KEY) === '1';
    delayMs = clampDelay(localStorage.getItem(DELAY_STORAGE_KEY) || DEFAULT_DELAY_MS);
    withdrawAmount = clampWithdrawAmount(localStorage.getItem(WITHDRAW_AMOUNT_STORAGE_KEY) || DEFAULT_WITHDRAW_AMOUNT);
    floatingPosition = loadFloatingPosition();
  } catch (_) {
    enabled = false;
    delayMs = DEFAULT_DELAY_MS;
    withdrawAmount = DEFAULT_WITHDRAW_AMOUNT;
    floatingPosition = null;
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
