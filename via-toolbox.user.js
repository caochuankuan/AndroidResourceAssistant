// ==UserScript==
// @name         Via 全站开发工具箱
// @namespace    https://yifeng.tools/
// @version      1.0.0
// @description  全站悬浮开发工具箱：查看 Cookie、Storage、网络请求、页面信息和常用网页工具
// @author       YiFeng Tools
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self || window.__YIFENG_VIA_TOOLBOX__) {
    return;
  }
  window.__YIFENG_VIA_TOOLBOX__ = true;

  const ROOT_ID = 'yifeng-via-toolbox';
  const BALL_SETTINGS_KEY = 'yifeng-via-toolbox-ball-v1';
  const DEFAULT_BALL_SETTINGS = {
    size: 42,
    right: 12,
    bottom: 126
  };
  const MAX_NETWORK_RECORDS = 200;
  const MAX_BODY_LENGTH = 100000;
  const networkRecords = [];
  let networkPaused = false;
  let activeTab = 'overview';
  let activeStorage = 'local';
  let shadow;
  let panel;
  let networkList;
  let toastTimer;
  let waitTimer;

  const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
  };

  const getBallSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(BALL_SETTINGS_KEY) || '{}');
      return {
        size: clampNumber(saved.size, 32, 72, DEFAULT_BALL_SETTINGS.size),
        right: clampNumber(saved.right, 0, Math.max(0, innerWidth - 32), DEFAULT_BALL_SETTINGS.right),
        bottom: clampNumber(saved.bottom, 0, Math.max(0, innerHeight - 32), DEFAULT_BALL_SETTINGS.bottom)
      };
    } catch (_) {
      return { ...DEFAULT_BALL_SETTINGS };
    }
  };

  const saveBallSettings = (settings) => {
    try {
      localStorage.setItem(BALL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
  };

  const applyBallSettings = (settings, persist = false) => {
    if (!shadow) return;
    const ball = shadow.querySelector('.ball');
    if (!ball) return;
    const normalized = {
      size: clampNumber(settings.size, 32, 72, DEFAULT_BALL_SETTINGS.size),
      right: clampNumber(settings.right, 0, Math.max(0, innerWidth - 32), DEFAULT_BALL_SETTINGS.right),
      bottom: clampNumber(settings.bottom, 0, Math.max(0, innerHeight - 32), DEFAULT_BALL_SETTINGS.bottom)
    };
    ball.style.width = `${normalized.size}px`;
    ball.style.height = `${normalized.size}px`;
    ball.style.right = `${Math.min(normalized.right, Math.max(0, innerWidth - normalized.size))}px`;
    ball.style.bottom = `${Math.min(normalized.bottom, Math.max(0, innerHeight - normalized.size))}px`;
    ball.style.left = 'auto';
    ball.style.top = 'auto';
    if (persist) saveBallSettings(normalized);
  };

  const syncBallSettingsForm = () => {
    if (!shadow) return;
    const settings = getBallSettings();
    const size = shadow.querySelector('.ball-size');
    const right = shadow.querySelector('.ball-right');
    const bottom = shadow.querySelector('.ball-bottom');
    if (size) size.value = settings.size;
    if (right) right.value = settings.right;
    if (bottom) bottom.value = settings.bottom;
  };

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const decode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return value;
    }
  };

  const stringify = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (value instanceof URLSearchParams) return value.toString();
    if (typeof FormData !== 'undefined' && value instanceof FormData) {
      const result = {};
      value.forEach((item, key) => {
        result[key] = typeof item === 'string' ? item : `[File: ${item.name}]`;
      });
      return JSON.stringify(result, null, 2);
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch (_) {
      return String(value);
    }
  };

  const truncate = (text, max = MAX_BODY_LENGTH) => {
    const value = String(text == null ? '' : text);
    return value.length > max
      ? `${value.slice(0, max)}\n\n……内容过长，已截断（共 ${value.length} 字符）`
      : value;
  };

  const headersToObject = (headers) => {
    const result = {};
    try {
      if (headers && typeof headers.forEach === 'function') {
        headers.forEach((value, key) => {
          result[key] = value;
        });
      } else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => {
          result[key] = value;
        });
      } else if (headers && typeof headers === 'object') {
        Object.assign(result, headers);
      }
    } catch (_) {}
    return result;
  };

  const parseXhrHeaders = (raw) => {
    const result = {};
    String(raw || '').trim().split(/[\r\n]+/).forEach((line) => {
      const index = line.indexOf(':');
      if (index > 0) {
        result[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
      }
    });
    return result;
  };

  const addNetworkRecord = (record) => {
    if (networkPaused) return null;
    record.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    record.startedAt = Date.now();
    record.time = new Date().toLocaleTimeString();
    record.pending = true;
    networkRecords.unshift(record);
    if (networkRecords.length > MAX_NETWORK_RECORDS) {
      networkRecords.length = MAX_NETWORK_RECORDS;
    }
    renderNetwork();
    return record;
  };

  const completeNetworkRecord = (record, patch) => {
    if (!record) return;
    Object.assign(record, patch, {
      pending: false,
      duration: Math.round(performance.now() - record.performanceStart)
    });
    renderNetwork();
  };

  const canReadResponseBody = (headers) => {
    const type = String(headers['content-type'] || '').toLowerCase();
    const length = Number(headers['content-length'] || 0);
    return (!length || length <= MAX_BODY_LENGTH * 10) &&
      (!type || /json|text|xml|javascript|html|form|svg/.test(type));
  };

  // 尽早监听页面 fetch。受浏览器安全策略影响，跨域响应正文可能不可读。
  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const input = args[0];
      const init = args[1] || {};
      const request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
      const record = addNetworkRecord({
        type: 'fetch',
        method: String(init.method || (request && request.method) || 'GET').toUpperCase(),
        url: String((request && request.url) || input),
        requestHeaders: headersToObject(init.headers || (request && request.headers)),
        requestBody: stringify(init.body),
        performanceStart: performance.now()
      });

      if (record && request && !init.body) {
        try {
          request.clone().text().then((text) => {
            record.requestBody = truncate(text);
          }).catch(() => {});
        } catch (_) {}
      }

      return originalFetch.apply(this, args).then((response) => {
        const responseHeaders = headersToObject(response.headers);
        completeNetworkRecord(record, {
          status: response.status,
          statusText: response.statusText,
          responseHeaders,
          responseBody: canReadResponseBody(responseHeaders) ? '正在读取响应内容…' : '二进制响应，未读取正文'
        });

        if (record && canReadResponseBody(responseHeaders)) {
          try {
            response.clone().text().then((text) => {
              record.responseBody = truncate(text);
              renderNetwork();
            }).catch((error) => {
              record.responseBody = `无法读取响应正文：${error.message}`;
              renderNetwork();
            });
          } catch (error) {
            record.responseBody = `无法读取响应正文：${error.message}`;
          }
        }
        return response;
      }).catch((error) => {
        completeNetworkRecord(record, {
          status: 0,
          statusText: '请求失败',
          error: error && error.message ? error.message : String(error)
        });
        throw error;
      });
    };
  }

  // 监听 XMLHttpRequest。
  if (typeof XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__yifengToolboxMeta = {
        method: String(method || 'GET').toUpperCase(),
        url: String(url),
        requestHeaders: {}
      };
      return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
      if (this.__yifengToolboxMeta) {
        this.__yifengToolboxMeta.requestHeaders[name] = value;
      }
      return originalSetRequestHeader.call(this, name, value);
    };

    XMLHttpRequest.prototype.send = function (body) {
      const meta = this.__yifengToolboxMeta || {
        method: 'GET',
        url: '未知地址',
        requestHeaders: {}
      };
      const record = addNetworkRecord({
        type: 'xhr',
        method: meta.method,
        url: meta.url,
        requestHeaders: meta.requestHeaders,
        requestBody: truncate(stringify(body)),
        performanceStart: performance.now()
      });

      this.addEventListener('loadend', () => {
        let responseBody = '';
        try {
          if (this.responseType === '' || this.responseType === 'text') {
            responseBody = truncate(this.responseText);
          } else if (this.responseType === 'json') {
            responseBody = truncate(stringify(this.response));
          } else {
            responseBody = `[${this.responseType || 'binary'} 响应，未读取正文]`;
          }
        } catch (error) {
          responseBody = `无法读取响应正文：${error.message}`;
        }
        completeNetworkRecord(record, {
          status: this.status,
          statusText: this.statusText || (this.status ? '' : '请求失败'),
          responseHeaders: parseXhrHeaders(this.getAllResponseHeaders()),
          responseBody
        });
      }, { once: true });

      return originalSend.call(this, body);
    };
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text));
      showToast('已复制');
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = String(text);
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.documentElement.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      showToast('已复制');
    }
  };

  const showToast = (message, danger = false) => {
    if (!shadow) return;
    const toast = shadow.querySelector('.toast');
    toast.textContent = message;
    toast.classList.toggle('danger-toast', danger);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const getCookies = () => {
    if (!document.cookie) return [];
    return document.cookie.split(/;\s*/).filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      const name = index < 0 ? part : part.slice(0, index);
      const value = index < 0 ? '' : part.slice(index + 1);
      return { name: decode(name), value: decode(value), rawName: name };
    });
  };

  const getStorage = (type) => {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    const entries = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      const value = storage.getItem(key);
      entries.push({ key, value, size: new Blob([String(value)]).size });
    }
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatJson = (text) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch (_) {
      return text;
    }
  };

  const renderOverview = () => {
    if (!shadow) return;
    const target = shadow.querySelector('[data-view="overview"]');
    if (!target) return;
    let storageText = '不可用';
    try {
      const localSize = getStorage('local').reduce((total, item) => total + item.size, 0);
      const sessionSize = getStorage('session').reduce((total, item) => total + item.size, 0);
      storageText = `${formatBytes(localSize)} / ${formatBytes(sessionSize)}`;
    } catch (_) {}
    const navigation = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const loadTime = navigation ? `${Math.round(navigation.loadEventEnd || performance.now())} ms` : '未知';
    target.innerHTML = `
      <div class="summary-grid">
        <div class="summary"><span>域名</span><b>${escapeHtml(location.hostname || '本地文件')}</b></div>
        <div class="summary"><span>协议</span><b>${escapeHtml(location.protocol.replace(':', '').toUpperCase())}</b></div>
        <div class="summary"><span>视口</span><b>${innerWidth} × ${innerHeight}</b></div>
        <div class="summary"><span>DPR</span><b>${window.devicePixelRatio || 1}</b></div>
        <div class="summary"><span>DOM 节点</span><b>${document.getElementsByTagName('*').length}</b></div>
        <div class="summary"><span>页面加载</span><b>${loadTime}</b></div>
        <div class="summary wide"><span>Storage（本地 / 会话）</span><b>${storageText}</b></div>
      </div>
      <label class="label">页面标题</label>
      <div class="value-box">${escapeHtml(document.title || '无标题')}</div>
      <label class="label">当前地址</label>
      <div class="value-box break">${escapeHtml(location.href)}</div>
      <label class="label">User Agent</label>
      <div class="value-box break">${escapeHtml(navigator.userAgent)}</div>
      <div class="button-row">
        <button class="primary" data-action="copy-page-info">复制页面信息</button>
        <button class="secondary" data-action="refresh-overview">刷新</button>
      </div>
    `;
  };

  const renderCookies = () => {
    if (!shadow) return;
    const target = shadow.querySelector('[data-view="cookies"] .content-slot');
    if (!target) return;
    let cookies;
    try {
      cookies = getCookies();
    } catch (error) {
      target.innerHTML = `<div class="empty">Cookie 读取失败：${escapeHtml(error.message)}</div>`;
      return;
    }
    target.innerHTML = cookies.length
      ? cookies.map((item, index) => `
          <div class="data-item">
            <div class="data-main" data-action="show-cookie" data-index="${index}">
              <b>${escapeHtml(item.name)}</b>
              <span>${escapeHtml(item.value)}</span>
            </div>
            <button class="icon-button danger-text" data-action="delete-cookie" data-name="${escapeHtml(item.rawName)}" title="删除">删</button>
          </div>
        `).join('')
      : '<div class="empty">当前脚本可访问的 Cookie 为空</div>';
    const count = shadow.querySelector('.cookie-count');
    if (count) count.textContent = `${cookies.length} 项`;
  };

  const renderStorage = () => {
    if (!shadow) return;
    const target = shadow.querySelector('[data-view="storage"] .content-slot');
    if (!target) return;
    let entries;
    try {
      entries = getStorage(activeStorage);
    } catch (error) {
      target.innerHTML = `<div class="empty">Storage 读取失败：${escapeHtml(error.message)}</div>`;
      return;
    }
    target.innerHTML = entries.length
      ? entries.map((item, index) => `
          <div class="data-item">
            <div class="data-main" data-action="edit-storage" data-index="${index}">
              <b>${escapeHtml(item.key)}</b>
              <span>${escapeHtml(item.value)}</span>
            </div>
            <small>${formatBytes(item.size)}</small>
            <button class="icon-button danger-text" data-action="delete-storage" data-key="${escapeHtml(item.key)}">删</button>
          </div>
        `).join('')
      : `<div class="empty">${activeStorage === 'local' ? 'localStorage' : 'sessionStorage'} 为空</div>`;
    shadow.querySelectorAll('[data-storage]').forEach((button) => {
      button.classList.toggle('active', button.dataset.storage === activeStorage);
    });
    const count = shadow.querySelector('.storage-count');
    if (count) count.textContent = `${entries.length} 项`;
  };

  const networkStatusClass = (record) => {
    if (record.pending) return 'pending';
    if (!record.status || record.status >= 400) return 'failed';
    if (record.status >= 300) return 'redirect';
    return 'success';
  };

  const renderNetwork = () => {
    if (!shadow || !networkList) return;
    const query = String(shadow.querySelector('.network-filter')?.value || '').trim().toLowerCase();
    const records = networkRecords.filter((record) => {
      return !query ||
        record.url.toLowerCase().includes(query) ||
        record.method.toLowerCase().includes(query) ||
        String(record.status || '').includes(query);
    });
    networkList.innerHTML = records.length
      ? records.map((record) => `
          <button class="network-item" data-action="show-network" data-id="${record.id}">
            <span class="status ${networkStatusClass(record)}">${record.pending ? '…' : (record.status || 'ERR')}</span>
            <span class="network-main">
              <b><em>${escapeHtml(record.method)}</em> ${escapeHtml(record.url)}</b>
              <small>${escapeHtml(record.type.toUpperCase())} · ${escapeHtml(record.time)}${record.duration == null ? '' : ` · ${record.duration} ms`}</small>
            </span>
          </button>
        `).join('')
      : `<div class="empty">${query ? '没有匹配的请求' : '暂无网络请求，刷新页面可捕获更早的请求'}</div>`;
    const count = shadow.querySelector('.network-count');
    if (count) count.textContent = `${networkRecords.length} / ${MAX_NETWORK_RECORDS}`;
    const pauseButton = shadow.querySelector('[data-action="toggle-network"]');
    if (pauseButton) pauseButton.textContent = networkPaused ? '继续记录' : '暂停记录';
  };

  const openModal = ({ title, subtitle = '', body = '', actions = '', wide = false }) => {
    const modal = shadow.querySelector('.modal');
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-subtitle').textContent = subtitle;
    modal.querySelector('.modal-body').innerHTML = body;
    modal.querySelector('.modal-actions').innerHTML = actions;
    modal.classList.toggle('wide', wide);
    modal.classList.add('open');
  };

  const closeModal = () => {
    shadow.querySelector('.modal').classList.remove('open');
  };

  const showCookieDetail = (index) => {
    const item = getCookies()[index];
    if (!item) return;
    openModal({
      title: item.name,
      subtitle: 'Cookie 值（HttpOnly Cookie 不可见）',
      body: `<textarea class="modal-textarea" readonly>${escapeHtml(item.value)}</textarea>`,
      actions: `<button class="secondary" data-action="copy-modal-text">复制值</button><button class="primary" data-action="close-modal">关闭</button>`
    });
  };

  const showStorageEditor = (index) => {
    const item = getStorage(activeStorage)[index];
    if (!item) return;
    openModal({
      title: `编辑 ${activeStorage === 'local' ? 'localStorage' : 'sessionStorage'}`,
      subtitle: item.key,
      body: `
        <input class="modal-key" type="text" value="${escapeHtml(item.key)}" aria-label="键名">
        <textarea class="modal-textarea">${escapeHtml(formatJson(item.value))}</textarea>
      `,
      actions: `
        <button class="secondary" data-action="format-modal-json">格式化 JSON</button>
        <button class="primary" data-action="save-storage" data-old-key="${escapeHtml(item.key)}">保存</button>
      `
    });
  };

  const showNetworkDetail = (id) => {
    const record = networkRecords.find((item) => item.id === id);
    if (!record) return;
    const details = {
      请求类型: record.type,
      请求方法: record.method,
      请求地址: record.url,
      状态码: record.pending ? '等待响应' : `${record.status || 0} ${record.statusText || ''}`.trim(),
      耗时: record.duration == null ? '等待响应' : `${record.duration} ms`,
      发起时间: record.time,
      请求头: record.requestHeaders || {},
      请求正文: record.requestBody || '',
      响应头: record.responseHeaders || {},
      响应正文: record.responseBody || record.error || ''
    };
    openModal({
      title: `${record.method} · ${record.status || (record.pending ? '…' : 'ERR')}`,
      subtitle: record.url,
      wide: true,
      body: Object.entries(details).map(([key, value]) => `
        <section class="detail-section">
          <b>${escapeHtml(key)}</b>
          <pre>${escapeHtml(typeof value === 'string' ? formatJson(value) : JSON.stringify(value, null, 2))}</pre>
        </section>
      `).join(''),
      actions: `
        <button class="secondary" data-action="copy-network" data-id="${record.id}">复制详情</button>
        <button class="primary" data-action="close-modal">关闭</button>
      `
    });
  };

  const switchTab = (tab) => {
    activeTab = tab;
    shadow.querySelectorAll('.tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });
    shadow.querySelectorAll('.view').forEach((view) => {
      view.classList.toggle('active', view.dataset.view === tab);
    });
    if (tab === 'overview') renderOverview();
    if (tab === 'cookies') renderCookies();
    if (tab === 'storage') renderStorage();
    if (tab === 'network') renderNetwork();
    if (tab === 'tools') syncBallSettingsForm();
  };

  const createSelector = (element) => {
    const escapeSelector = (value) => {
      if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(value);
      }
      return String(value).replace(/([^\w-])/g, '\\$1');
    };
    if (!element || element === document.body) return 'body';
    if (element.id) return `#${escapeSelector(element.id)}`;
    const parts = [];
    let current = element;
    while (current && current.nodeType === 1 && current !== document.body) {
      let part = current.tagName.toLowerCase();
      const classes = Array.from(current.classList || []).slice(0, 2);
      if (classes.length) part += `.${classes.map(escapeSelector).join('.')}`;
      const siblings = current.parentElement
        ? Array.from(current.parentElement.children).filter((child) => child.tagName === current.tagName)
        : [];
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      parts.unshift(part);
      current = current.parentElement;
      if (parts.length >= 5) break;
    }
    return parts.join(' > ');
  };

  const startElementPicker = () => {
    panel.classList.remove('open');
    showToast('请点击页面上的元素');
    const onClick = (event) => {
      const path = event.composedPath ? event.composedPath() : [];
      if (path.includes(shadow.host)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      document.removeEventListener('click', onClick, true);
      const selector = createSelector(event.target);
      copyText(selector);
      panel.classList.add('open');
      openModal({
        title: '元素选择器',
        subtitle: event.target.tagName.toLowerCase(),
        body: `<textarea class="modal-textarea" readonly>${escapeHtml(selector)}</textarea>`,
        actions: `<button class="secondary" data-action="copy-modal-text">复制</button><button class="primary" data-action="close-modal">关闭</button>`
      });
    };
    setTimeout(() => document.addEventListener('click', onClick, true), 100);
  };

  const startWaitTimer = () => {
    const input = shadow.querySelector('.wait-seconds');
    const output = shadow.querySelector('.wait-output');
    let seconds = Math.max(1, Math.min(86400, Number(input.value) || 1));
    clearInterval(waitTimer);
    output.textContent = `剩余 ${seconds} 秒`;
    waitTimer = setInterval(() => {
      seconds -= 1;
      output.textContent = seconds > 0 ? `剩余 ${seconds} 秒` : '计时完成';
      if (seconds <= 0) {
        clearInterval(waitTimer);
        showToast('等待计时完成');
        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      }
    }, 1000);
  };

  const handleAction = (button) => {
    const action = button.dataset.action;
    if (action === 'close-panel') panel.classList.remove('open');
    if (action === 'refresh-overview') renderOverview();
    if (action === 'copy-page-info') {
      copyText([
        `标题：${document.title}`,
        `地址：${location.href}`,
        `视口：${innerWidth} × ${innerHeight}`,
        `User Agent：${navigator.userAgent}`
      ].join('\n'));
    }
    if (action === 'refresh-cookies') renderCookies();
    if (action === 'copy-cookies') copyText(document.cookie || '');
    if (action === 'add-cookie') {
      openModal({
        title: '新增 Cookie',
        subtitle: '默认 Path=/，有效期为当前会话',
        body: `
          <input class="modal-key" type="text" placeholder="Cookie 名称">
          <textarea class="modal-textarea" placeholder="Cookie 值"></textarea>
        `,
        actions: `<button class="secondary" data-action="close-modal">取消</button><button class="primary" data-action="save-cookie">保存</button>`
      });
    }
    if (action === 'show-cookie') showCookieDetail(Number(button.dataset.index));
    if (action === 'delete-cookie') {
      document.cookie = `${button.dataset.name}=; Max-Age=0; Path=/`;
      renderCookies();
      showToast('已尝试删除 Cookie');
    }
    if (action === 'clear-cookies') {
      openModal({
        title: '清理 Cookie？',
        subtitle: '只会处理当前脚本可访问的 Cookie',
        body: '<div class="notice">此操作可能会退出当前网站的登录状态，且无法撤销。</div>',
        actions: '<button class="secondary" data-action="close-modal">取消</button><button class="danger" data-action="confirm-clear-cookies">确认清理</button>'
      });
    }
    if (action === 'confirm-clear-cookies') {
      getCookies().forEach((item) => {
        document.cookie = `${item.rawName}=; Max-Age=0; Path=/`;
        document.cookie = `${item.rawName}=; Max-Age=0`;
      });
      closeModal();
      renderCookies();
      showToast('已清理脚本可访问的 Cookie');
    }
    if (action === 'edit-storage') showStorageEditor(Number(button.dataset.index));
    if (action === 'delete-storage') {
      const storage = activeStorage === 'session' ? sessionStorage : localStorage;
      storage.removeItem(button.dataset.key);
      renderStorage();
      showToast('已删除');
    }
    if (action === 'add-storage') {
      openModal({
        title: `新增 ${activeStorage === 'local' ? 'localStorage' : 'sessionStorage'}`,
        body: `
          <input class="modal-key" type="text" placeholder="键名">
          <textarea class="modal-textarea" placeholder="值"></textarea>
        `,
        actions: `<button class="secondary" data-action="close-modal">取消</button><button class="primary" data-action="save-storage">保存</button>`
      });
    }
    if (action === 'clear-storage') {
      openModal({
        title: `清空 ${activeStorage === 'local' ? 'localStorage' : 'sessionStorage'}？`,
        subtitle: '此操作无法撤销',
        body: '<div class="notice">网站保存的设置、草稿或登录信息可能会丢失。</div>',
        actions: '<button class="secondary" data-action="close-modal">取消</button><button class="danger" data-action="confirm-clear-storage">确认清空</button>'
      });
    }
    if (action === 'confirm-clear-storage') {
      const storage = activeStorage === 'session' ? sessionStorage : localStorage;
      storage.clear();
      closeModal();
      renderStorage();
      showToast('已清空');
    }
    if (action === 'export-storage') {
      const data = Object.fromEntries(getStorage(activeStorage).map((item) => [item.key, item.value]));
      copyText(JSON.stringify(data, null, 2));
    }
    if (action === 'show-network') showNetworkDetail(button.dataset.id);
    if (action === 'toggle-network') {
      networkPaused = !networkPaused;
      renderNetwork();
      showToast(networkPaused ? '已暂停记录' : '已继续记录');
    }
    if (action === 'clear-network') {
      networkRecords.length = 0;
      renderNetwork();
    }
    if (action === 'export-network') copyText(JSON.stringify(networkRecords, null, 2));
    if (action === 'close-modal') closeModal();
    if (action === 'copy-modal-text') {
      const textarea = shadow.querySelector('.modal-textarea');
      if (textarea) copyText(textarea.value);
    }
    if (action === 'format-modal-json') {
      const textarea = shadow.querySelector('.modal-textarea');
      if (textarea) textarea.value = formatJson(textarea.value);
    }
    if (action === 'save-cookie') {
      const name = shadow.querySelector('.modal-key').value.trim();
      const value = shadow.querySelector('.modal-textarea').value;
      if (!name) return showToast('请输入 Cookie 名称', true);
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/`;
      closeModal();
      renderCookies();
      showToast('Cookie 已保存');
    }
    if (action === 'save-storage') {
      const storage = activeStorage === 'session' ? sessionStorage : localStorage;
      const key = shadow.querySelector('.modal-key').value.trim();
      const value = shadow.querySelector('.modal-textarea').value;
      if (!key) return showToast('请输入键名', true);
      const oldKey = button.dataset.oldKey;
      if (oldKey && oldKey !== key) storage.removeItem(oldKey);
      storage.setItem(key, value);
      closeModal();
      renderStorage();
      showToast('已保存');
    }
    if (action === 'copy-network') {
      const record = networkRecords.find((item) => item.id === button.dataset.id);
      if (record) copyText(JSON.stringify(record, null, 2));
    }
    if (action === 'copy-url') copyText(location.href);
    if (action === 'copy-title') copyText(document.title);
    if (action === 'scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
    if (action === 'scroll-bottom') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    if (action === 'reload-page') location.reload();
    if (action === 'element-picker') startElementPicker();
    if (action === 'start-wait') startWaitTimer();
    if (action === 'stop-wait') {
      clearInterval(waitTimer);
      shadow.querySelector('.wait-output').textContent = '计时已停止';
    }
    if (action === 'save-ball-settings') {
      const settings = {
        size: shadow.querySelector('.ball-size').value,
        right: shadow.querySelector('.ball-right').value,
        bottom: shadow.querySelector('.ball-bottom').value
      };
      applyBallSettings(settings, true);
      syncBallSettingsForm();
      showToast('悬浮球设置已保存');
    }
    if (action === 'reset-ball-settings') {
      applyBallSettings(DEFAULT_BALL_SETTINGS, true);
      syncBallSettingsForm();
      showToast('已恢复默认位置和尺寸');
    }
    if (action === 'clear-site-data') {
      openModal({
        title: '清理当前站点数据？',
        subtitle: location.hostname,
        body: '<div class="notice">将清空可访问的 Cookie、localStorage 和 sessionStorage，可能导致退出登录。此操作无法撤销。</div>',
        actions: '<button class="secondary" data-action="close-modal">取消</button><button class="danger" data-action="confirm-clear-site-data">确认清理</button>'
      });
    }
    if (action === 'confirm-clear-site-data') {
      localStorage.clear();
      sessionStorage.clear();
      getCookies().forEach((item) => {
        document.cookie = `${item.rawName}=; Max-Age=0; Path=/`;
        document.cookie = `${item.rawName}=; Max-Age=0`;
      });
      closeModal();
      renderCookies();
      renderStorage();
      showToast('已清理可访问的站点数据');
    }
  };

  const bindDrag = (ball) => {
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    ball.addEventListener('pointerdown', (event) => {
      const rect = ball.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      moved = false;
      ball.setPointerCapture(event.pointerId);
    });

    ball.addEventListener('pointermove', (event) => {
      if (!ball.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) moved = true;
      const left = Math.max(4, Math.min(innerWidth - ball.offsetWidth - 4, startLeft + deltaX));
      const top = Math.max(4, Math.min(innerHeight - ball.offsetHeight - 4, startTop + deltaY));
      ball.style.left = `${left}px`;
      ball.style.top = `${top}px`;
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    });

    ball.addEventListener('pointerup', (event) => {
      if (ball.hasPointerCapture(event.pointerId)) ball.releasePointerCapture(event.pointerId);
      if (moved) {
        const rect = ball.getBoundingClientRect();
        const settings = getBallSettings();
        saveBallSettings({
          ...settings,
          right: Math.round(Math.max(0, innerWidth - rect.right)),
          bottom: Math.round(Math.max(0, innerHeight - rect.bottom))
        });
        syncBallSettingsForm();
      } else {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) switchTab(activeTab);
      }
    });
  };

  const mount = () => {
    if (document.getElementById(ROOT_ID) || !document.documentElement) return;
    const root = document.createElement('div');
    root.id = ROOT_ID;
    shadow = root.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `
      <style>
        *{box-sizing:border-box}button,input,textarea{font:inherit}button{cursor:pointer}
        .ball{position:fixed;right:12px;bottom:126px;z-index:2147483647;width:42px;height:42px;border:1px solid rgba(255,255,255,.58);border-radius:50%;padding:0;color:#fff;background:linear-gradient(145deg,#26384d 0%,#087f79 100%);box-shadow:0 6px 18px rgba(15,42,62,.34),inset 0 1px 1px rgba(255,255,255,.22);touch-action:none;user-select:none;-webkit-user-select:none;transition:box-shadow .15s,transform .15s}
        .ball:active{opacity:.92;box-shadow:0 3px 10px rgba(15,42,62,.3)}.ball svg{position:relative;z-index:1;display:block;width:48%;height:48%;margin:auto;pointer-events:none}.ball::after{content:"";position:absolute;inset:3px;border:1px solid rgba(255,255,255,.17);border-radius:50%;pointer-events:none}
        .panel{position:fixed;right:12px;bottom:174px;z-index:2147483646;display:none;width:min(420px,calc(100vw - 20px));height:min(650px,calc(100vh - 195px));overflow:hidden;border:1px solid rgba(255,255,255,.55);border-radius:18px;background:#f6f8fb;color:#19212d;box-shadow:0 20px 60px rgba(17,35,58,.32);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .panel.open{display:flex;flex-direction:column;animation:pop .16s ease-out}@keyframes pop{from{opacity:0;transform:translateY(8px) scale(.98)}}
        .header{display:flex;align-items:center;justify-content:space-between;padding:13px 15px;color:#fff;background:linear-gradient(125deg,#0876d1,#0f9f8f)}
        .header b{font-size:16px}.header span{display:block;font-size:11px;opacity:.8;font-weight:400}.close{width:32px;height:32px;border:0;border-radius:50%;color:#fff;background:rgba(255,255,255,.18);font-size:21px;line-height:30px}
        .tabs{display:flex;flex:0 0 auto;padding:7px 8px 0;background:#fff;border-bottom:1px solid #e5e9f0;overflow-x:auto}.tab{flex:1;min-width:62px;padding:9px 5px 10px;border:0;border-bottom:2px solid transparent;color:#6b7483;background:transparent;font-size:12px;white-space:nowrap}.tab.active{color:#0876d1;border-bottom-color:#0876d1;font-weight:700}
        .views{flex:1;min-height:0;overflow:hidden}.view{display:none;height:100%;padding:13px;overflow-y:auto}.view.active{display:block}
        .toolbar{display:flex;align-items:center;gap:7px;margin-bottom:10px}.toolbar .spacer{flex:1}.count{font-size:11px;color:#778193;white-space:nowrap}
        .primary,.secondary,.danger{min-height:34px;padding:6px 11px;border:0;border-radius:9px;font-weight:700;font-size:12px}.primary{color:#fff;background:#0876d1}.secondary{color:#3d4b5e;background:#e7ecf3}.danger{color:#fff;background:#d74455}
        .button-row{display:flex;gap:8px;margin-top:12px}.button-row>*{flex:1}
        .summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px}.summary{min-width:0;padding:10px;border:1px solid #e2e7ee;border-radius:11px;background:#fff}.summary.wide{grid-column:1/-1}.summary span{display:block;color:#828b99;font-size:11px}.summary b{display:block;overflow:hidden;margin-top:3px;text-overflow:ellipsis;white-space:nowrap;color:#263142;font-size:13px}
        .label{display:block;margin:10px 0 5px;color:#788292;font-size:11px;font-weight:700}.value-box{padding:9px 10px;border:1px solid #e2e7ee;border-radius:9px;background:#fff;max-height:82px;overflow:auto;font-size:12px}.break{overflow-wrap:anywhere}
        .notice{margin-bottom:10px;padding:9px 10px;border-radius:9px;color:#705c19;background:#fff6d6;font-size:11px}.content-slot{display:flex;flex-direction:column;gap:7px}
        .data-item{display:flex;align-items:center;gap:8px;padding:9px;border:1px solid #e2e7ee;border-radius:10px;background:#fff}.data-main{flex:1;min-width:0;cursor:pointer}.data-main b,.data-main span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-main b{font-size:12px}.data-main span{margin-top:2px;color:#7a8493;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.data-item small{color:#8992a0;font-size:10px;white-space:nowrap}.icon-button{flex:0 0 auto;width:29px;height:29px;padding:0;border:0;border-radius:7px;background:#f0f3f7;font-size:11px}.danger-text{color:#c83e50}
        .segmented{display:flex;padding:3px;border-radius:9px;background:#e7ecf3}.segmented button{padding:5px 9px;border:0;border-radius:7px;color:#687384;background:transparent;font-size:11px}.segmented button.active{color:#0876d1;background:#fff;font-weight:700;box-shadow:0 1px 4px rgba(30,50,70,.12)}
        .network-filter{width:100%;height:36px;margin-bottom:9px;padding:0 11px;border:1px solid #dce2ea;border-radius:9px;outline:none;background:#fff;color:#202938}.network-filter:focus{border-color:#0876d1}
        .network-list{display:flex;flex-direction:column;gap:6px}.network-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px;border:1px solid #e1e6ed;border-radius:10px;background:#fff;text-align:left}.status{flex:0 0 43px;padding:4px 3px;border-radius:6px;text-align:center;font-size:10px;font-weight:800}.status.success{color:#087c62;background:#ddf6ee}.status.redirect{color:#9a6a00;background:#fff0c2}.status.failed{color:#c33145;background:#ffe3e7}.status.pending{color:#2d69b3;background:#e1efff}.network-main{min-width:0}.network-main b,.network-main small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.network-main b{font-size:11px;color:#303b49}.network-main em{color:#0876d1;font-style:normal}.network-main small{margin-top:3px;color:#88919e;font-size:10px}
        .empty{padding:30px 12px;text-align:center;color:#8993a1;font-size:12px}
        .tool-card{margin-bottom:10px;padding:11px;border:1px solid #e1e6ed;border-radius:11px;background:#fff}.tool-card h3{margin:0 0 3px;font-size:13px}.tool-card p{margin:0 0 9px;color:#808a98;font-size:11px}.tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.tool-grid button{min-height:38px}
        .wait-row{display:flex;gap:7px}.wait-seconds{min-width:0;flex:1;height:36px;padding:0 10px;border:1px solid #dce2ea;border-radius:8px}.wait-output{margin-top:7px;color:#0876d1;font-size:12px;font-weight:700}
        .setting-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}.setting-grid label{min-width:0;color:#788292;font-size:10px}.setting-grid input{display:block;width:100%;height:36px;margin-top:4px;padding:0 8px;border:1px solid #dce2ea;border-radius:8px;color:#263142;background:#f8fafc}
        .modal{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:15px;background:rgba(11,20,31,.5)}.modal.open{display:flex}.modal-card{display:flex;flex-direction:column;width:min(380px,100%);max-height:min(560px,90vh);overflow:hidden;border-radius:15px;background:#fff;box-shadow:0 18px 60px rgba(0,0,0,.3)}.modal.wide .modal-card{width:min(700px,100%)}.modal-head{padding:13px 14px;border-bottom:1px solid #e8ebf0}.modal-title{font-weight:800}.modal-subtitle{margin-top:2px;overflow:hidden;color:#7e8794;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.modal-body{padding:12px;overflow:auto}.modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid #e8ebf0}.modal-textarea{display:block;width:100%;min-height:180px;padding:10px;border:1px solid #dce2ea;border-radius:9px;outline:none;resize:vertical;color:#243041;background:#f8fafc;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.modal-key{display:block;width:100%;height:38px;margin-bottom:8px;padding:0 10px;border:1px solid #dce2ea;border-radius:9px;outline:none}.detail-section{margin-bottom:10px}.detail-section>b{display:block;margin-bottom:4px;color:#5f6b7c;font-size:11px}.detail-section pre{margin:0;padding:8px;border-radius:8px;background:#f4f6f9;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
        .toast{position:fixed;left:50%;bottom:28px;z-index:2147483647;max-width:80vw;padding:9px 14px;border-radius:20px;color:#fff;background:#24303d;box-shadow:0 6px 22px rgba(0,0,0,.25);font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:0;transform:translate(-50%,12px);pointer-events:none;transition:.18s}.toast.show{opacity:1;transform:translate(-50%,0)}.toast.danger-toast{background:#c83e50}
        @media(max-height:520px){.panel{bottom:8px;height:calc(100vh - 16px)}}
      </style>
      <button class="ball" type="button" aria-label="打开 Via 工具箱">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3.75A1.25 1.25 0 0 1 6.25 2.5h3.5A1.25 1.25 0 0 1 11 3.75v3.5A1.25 1.25 0 0 1 9.75 8.5h-3.5A1.25 1.25 0 0 1 5 7.25v-3.5Zm8 0a1.25 1.25 0 0 1 1.25-1.25h3.5A1.25 1.25 0 0 1 19 3.75v3.5a1.25 1.25 0 0 1-1.25 1.25h-3.5A1.25 1.25 0 0 1 13 7.25v-3.5Zm-8 13a1.25 1.25 0 0 1 1.25-1.25h3.5A1.25 1.25 0 0 1 11 16.75v3.5a1.25 1.25 0 0 1-1.25 1.25h-3.5A1.25 1.25 0 0 1 5 20.25v-3.5Zm8-4.5A1.25 1.25 0 0 1 14.25 11h3.5A1.25 1.25 0 0 1 19 12.25v3.5A1.25 1.25 0 0 1 17.75 17h-3.5A1.25 1.25 0 0 1 13 15.75v-3.5Z"/></svg>
      </button>
      <section class="panel" aria-label="Via 全站开发工具箱">
        <header class="header"><div><b>Via 开发工具箱</b><span>${escapeHtml(location.hostname)}</span></div><button class="close" data-action="close-panel" aria-label="关闭">×</button></header>
        <nav class="tabs">
          <button class="tab active" data-tab="overview">概览</button>
          <button class="tab" data-tab="cookies">Cookie</button>
          <button class="tab" data-tab="storage">存储</button>
          <button class="tab" data-tab="network">网络</button>
          <button class="tab" data-tab="tools">工具</button>
        </nav>
        <main class="views">
          <section class="view active" data-view="overview"></section>
          <section class="view" data-view="cookies">
            <div class="notice">只能查看和删除 JavaScript 可访问的 Cookie；HttpOnly Cookie 受浏览器保护，不会显示。</div>
            <div class="toolbar"><span class="count cookie-count">0 项</span><span class="spacer"></span><button class="secondary" data-action="refresh-cookies">刷新</button><button class="secondary" data-action="copy-cookies">复制</button><button class="primary" data-action="add-cookie">新增</button></div>
            <div class="content-slot"></div>
            <div class="button-row"><button class="danger" data-action="clear-cookies">清理可访问 Cookie</button></div>
          </section>
          <section class="view" data-view="storage">
            <div class="toolbar">
              <div class="segmented"><button class="active" data-storage="local">localStorage</button><button data-storage="session">sessionStorage</button></div>
              <span class="spacer"></span><span class="count storage-count">0 项</span>
            </div>
            <div class="toolbar"><button class="secondary" data-action="export-storage">复制 JSON</button><button class="primary" data-action="add-storage">新增</button><button class="danger" data-action="clear-storage">清空</button></div>
            <div class="content-slot"></div>
          </section>
          <section class="view" data-view="network">
            <div class="notice">记录脚本启动后的 Fetch / XHR。受同源策略、响应类型和脚本执行环境影响，部分响应正文可能不可读。</div>
            <div class="toolbar"><span class="count network-count">0 / ${MAX_NETWORK_RECORDS}</span><span class="spacer"></span><button class="secondary" data-action="toggle-network">暂停记录</button><button class="secondary" data-action="export-network">复制 JSON</button><button class="danger" data-action="clear-network">清空</button></div>
            <input class="network-filter" type="search" placeholder="筛选 URL、方法或状态码">
            <div class="network-list"></div>
          </section>
          <section class="view" data-view="tools">
            <div class="tool-card"><h3>悬浮球</h3><p>设置初始尺寸和距屏幕右侧、底部的距离；直接拖动悬浮球也会自动保存位置。</p><div class="setting-grid"><label>尺寸（px）<input class="ball-size" type="number" min="32" max="72" value="42"></label><label>距右（px）<input class="ball-right" type="number" min="0" value="12"></label><label>距底（px）<input class="ball-bottom" type="number" min="0" value="126"></label></div><div class="button-row"><button class="primary" data-action="save-ball-settings">保存并应用</button><button class="secondary" data-action="reset-ball-settings">恢复默认</button></div></div>
            <div class="tool-card"><h3>页面操作</h3><p>复制信息、快速滚动和刷新当前页面。</p><div class="tool-grid"><button class="secondary" data-action="copy-url">复制网址</button><button class="secondary" data-action="copy-title">复制标题</button><button class="secondary" data-action="scroll-top">回到顶部</button><button class="secondary" data-action="scroll-bottom">滚到底部</button><button class="primary" data-action="reload-page">刷新页面</button><button class="primary" data-action="element-picker">选择元素</button></div></div>
            <div class="tool-card"><h3>等待计时器</h3><p>设置等待秒数，完成后会在页面内提醒。</p><div class="wait-row"><input class="wait-seconds" type="number" min="1" max="86400" value="5"><button class="primary" data-action="start-wait">开始</button><button class="secondary" data-action="stop-wait">停止</button></div><div class="wait-output">尚未开始</div></div>
            <div class="tool-card"><h3>站点数据</h3><p>清理当前域名下脚本有权访问的 Cookie、localStorage 和 sessionStorage。</p><button class="danger" data-action="clear-site-data">清理可访问的站点数据</button></div>
          </section>
        </main>
      </section>
      <div class="modal"><div class="modal-card"><div class="modal-head"><div class="modal-title"></div><div class="modal-subtitle"></div></div><div class="modal-body"></div><div class="modal-actions"></div></div></div>
      <div class="toast"></div>
    `;
    document.documentElement.appendChild(root);
    panel = shadow.querySelector('.panel');
    networkList = shadow.querySelector('.network-list');
    applyBallSettings(getBallSettings());
    bindDrag(shadow.querySelector('.ball'));

    shadow.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-tab]');
      if (tab) return switchTab(tab.dataset.tab);
      const storageButton = event.target.closest('[data-storage]');
      if (storageButton) {
        activeStorage = storageButton.dataset.storage;
        return renderStorage();
      }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) {
        try {
          handleAction(actionButton);
        } catch (error) {
          showToast(error.message || String(error), true);
        }
      }
    });
    shadow.querySelector('.network-filter').addEventListener('input', renderNetwork);
    renderOverview();
    renderNetwork();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
