// ==UserScript==
// @name         小小鸟 · 云巅纪 UI
// @namespace    https://43.139.92.32/
// @version      1.0.2
// @description  为小小鸟文字游戏提供现代 RPG 界面、深浅主题和紧凑布局；不修改接口或游戏逻辑。
// @author       ChuanKuan
// @match        http://43.139.92.32/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

(function viaRpgUi() {
  "use strict";

  if (window.top !== window.self) return;
  const isPreview = document.documentElement.hasAttribute("data-via-rpg-preview");
  if (location.hostname !== "43.139.92.32" && !isPreview) return;
  if (document.documentElement.dataset.viaRpgUi === "1") return;

  const ROOT = document.documentElement;
  const STYLE_ID = "via-rpg-ui-style";
  const BAR_ID = "via-rpg-ui-toolbar";
  const STORAGE_THEME = "via-rpg-ui-theme";
  const STORAGE_DENSITY = "via-rpg-ui-density";

  ROOT.dataset.viaRpgUi = "1";
  ROOT.classList.add("via-rpg-ui");

  const css = String.raw`
    :root {
      color-scheme: light;
      --vr-bg: #f3efe6;
      --vr-bg-2: #e8e1d4;
      --vr-surface: rgba(255, 252, 245, .88);
      --vr-surface-solid: #fffdf8;
      --vr-surface-soft: #f8f1e6;
      --vr-text: #252b38;
      --vr-muted: #73798a;
      --vr-line: rgba(49, 57, 76, .13);
      --vr-primary: #4d5fd4;
      --vr-primary-2: #7282ef;
      --vr-primary-soft: rgba(77, 95, 212, .10);
      --vr-cyan: #2f91a5;
      --vr-success: #2e886c;
      --vr-warning: #b87822;
      --vr-danger: #c04b56;
      --vr-gold: #b98a3d;
      --vr-shadow: 0 12px 34px rgba(38, 43, 60, .10);
      --vr-shadow-sm: 0 4px 14px rgba(38, 43, 60, .08);
      --vr-radius: 18px;
      --vr-radius-sm: 12px;
      --vr-font: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      --vr-display: "STKaiti", "KaiTi", "Songti SC", serif;
      --vr-speed: 180ms;
      --vr-pad: 14px;
    }

    html.via-rpg-dark {
      color-scheme: dark;
      --vr-bg: #111522;
      --vr-bg-2: #191f31;
      --vr-surface: rgba(29, 35, 53, .88);
      --vr-surface-solid: #1c2233;
      --vr-surface-soft: #242c41;
      --vr-text: #edf0f7;
      --vr-muted: #a9b1c5;
      --vr-line: rgba(222, 229, 248, .12);
      --vr-primary: #8998ff;
      --vr-primary-2: #aab4ff;
      --vr-primary-soft: rgba(137, 152, 255, .14);
      --vr-cyan: #71c9d7;
      --vr-success: #73c9a8;
      --vr-warning: #e1ae64;
      --vr-danger: #ed7e88;
      --vr-gold: #e1bd72;
      --vr-shadow: 0 16px 42px rgba(0, 0, 0, .32);
      --vr-shadow-sm: 0 5px 18px rgba(0, 0, 0, .24);
    }

    html.via-rpg-ui,
    html.via-rpg-ui body {
      min-height: 100%;
      background:
        radial-gradient(circle at 15% -10%, rgba(113, 130, 239, .20), transparent 30rem),
        radial-gradient(circle at 90% 5%, rgba(47, 145, 165, .14), transparent 24rem),
        linear-gradient(160deg, var(--vr-bg), var(--vr-bg-2)) fixed !important;
    }

    html.via-rpg-ui body {
      box-sizing: border-box;
      margin: 0 !important;
      padding: 74px 10px 34px !important;
      color: var(--vr-text) !important;
      font-family: var(--vr-font) !important;
      font-size: 15px;
      line-height: 1.72;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      overflow-wrap: anywhere;
    }

    html.via-rpg-ui *,
    html.via-rpg-ui *::before,
    html.via-rpg-ui *::after {
      box-sizing: border-box;
    }

    html.via-rpg-ui body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      opacity: .36;
      background-image:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 32px 32px;
      -webkit-mask-image: linear-gradient(to bottom, #000, transparent 65%);
      mask-image: linear-gradient(to bottom, #000, transparent 65%);
    }

    html.via-rpg-ui #app {
      width: min(100%, 760px);
      margin: 0 auto;
    }

    /* 原站主容器 */
    html.via-rpg-ui .app {
      position: relative;
      color: var(--vr-text) !important;
      background: var(--vr-surface) !important;
      border: 1px solid var(--vr-line) !important;
      border-radius: var(--vr-radius) !important;
      padding: var(--vr-pad) !important;
      box-shadow: var(--vr-shadow) !important;
      -webkit-backdrop-filter: blur(18px) saturate(1.12);
      backdrop-filter: blur(18px) saturate(1.12);
      overflow: clip;
    }

    html.via-rpg-ui .app::before {
      content: "";
      display: block;
      height: 3px;
      margin: calc(var(--vr-pad) * -1) calc(var(--vr-pad) * -1) var(--vr-pad);
      background: linear-gradient(90deg, var(--vr-primary), var(--vr-cyan), var(--vr-gold));
    }

    /* 顶部工具条 */
    #${BAR_ID} {
      position: fixed;
      top: max(10px, env(safe-area-inset-top));
      left: 50%;
      z-index: 2147483000;
      width: min(calc(100% - 20px), 760px);
      min-height: 50px;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px 8px 14px;
      color: var(--vr-text);
      background: color-mix(in srgb, var(--vr-surface-solid) 88%, transparent);
      border: 1px solid var(--vr-line);
      border-radius: 17px;
      box-shadow: var(--vr-shadow-sm);
      -webkit-backdrop-filter: blur(18px) saturate(1.2);
      backdrop-filter: blur(18px) saturate(1.2);
    }

    #${BAR_ID} .vr-brand {
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #${BAR_ID} .vr-mark {
      width: 32px;
      height: 32px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      color: #fff;
      border-radius: 11px;
      background: linear-gradient(145deg, var(--vr-primary-2), var(--vr-primary));
      box-shadow: 0 5px 13px rgba(77, 95, 212, .25);
      font-size: 18px;
    }

    #${BAR_ID} .vr-brand-text {
      min-width: 0;
      line-height: 1.15;
    }

    #${BAR_ID} strong {
      display: block;
      overflow: hidden;
      color: var(--vr-text);
      font-family: var(--vr-display);
      font-size: 16px;
      letter-spacing: .08em;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${BAR_ID} small {
      display: block;
      margin-top: 3px;
      color: var(--vr-muted);
      font-size: 10px;
      letter-spacing: .08em;
    }

    #${BAR_ID} button {
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-soft) !important;
      border: 1px solid var(--vr-line) !important;
      border-radius: 11px !important;
      box-shadow: none !important;
      font-size: 16px !important;
    }

    #${BAR_ID} button:active {
      transform: scale(.94);
    }

    /* 导航与链接 */
    html.via-rpg-ui a {
      color: var(--vr-primary) !important;
      text-decoration: none !important;
      text-underline-offset: 3px;
      transition:
        color var(--vr-speed) ease,
        background var(--vr-speed) ease,
        border-color var(--vr-speed) ease,
        transform var(--vr-speed) ease;
    }

    html.via-rpg-ui a:hover {
      color: var(--vr-primary-2) !important;
    }

    html.via-rpg-ui a:active {
      opacity: .78;
    }

    html.via-rpg-ui .nav-list {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      margin: 6px 0 8px !important;
      padding: 6px !important;
      background: var(--vr-surface-soft) !important;
      border: 1px solid var(--vr-line);
      border-radius: 10px;
    }

    html.via-rpg-ui a[data-via-nav="1"] {
      min-width: 0;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin: 0 !important;
      padding: 5px 6px !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-solid);
      border: 1px solid var(--vr-line);
      border-radius: 9px;
      box-shadow: 0 2px 7px rgba(30, 36, 52, .04);
      font-size: 13px;
      line-height: 1.25;
      text-align: center;
    }

    html.via-rpg-ui .nav-list:empty {
      display: none !important;
    }

    html.via-rpg-ui a[data-via-nav="1"]::before {
      content: attr(data-via-icon);
      font-size: 14px;
    }

    html.via-rpg-ui a[data-via-nav="1"]:active {
      transform: translateY(1px) scale(.98);
    }

    html.via-rpg-ui a.active,
    html.via-rpg-ui a.disabled {
      color: var(--vr-muted) !important;
      background: var(--vr-primary-soft) !important;
      border-color: transparent !important;
    }

    /* 语义卡片 */
    html.via-rpg-ui :is(
      .bgblue, .deepblue, .qianlan, .qianlv, .yellowbg,
      .info-section, .user-info, .event, .notice-list
    ) {
      margin: 8px 0 !important;
      padding: 10px 12px !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-soft) !important;
      border: 1px solid var(--vr-line) !important;
      border-radius: var(--vr-radius-sm) !important;
    }

    html.via-rpg-ui :is(.bgblue, .deepblue, .qianlan, .info-section) {
      border-left: 3px solid var(--vr-cyan) !important;
    }

    html.via-rpg-ui .qianlv {
      border-left: 3px solid var(--vr-success) !important;
      background: color-mix(in srgb, var(--vr-success) 9%, var(--vr-surface-solid)) !important;
    }

    html.via-rpg-ui .yellowbg {
      border-left: 3px solid var(--vr-warning) !important;
      background: color-mix(in srgb, var(--vr-warning) 9%, var(--vr-surface-solid)) !important;
    }

    html.via-rpg-ui .data-item {
      position: relative;
      margin: 8px 0 !important;
      padding: 11px 12px !important;
      background: color-mix(in srgb, var(--vr-surface-solid) 90%, transparent);
      border: 1px solid var(--vr-line) !important;
      border-radius: var(--vr-radius-sm);
      box-shadow: 0 2px 10px rgba(30, 36, 52, .035);
    }

    /* 原站在每条动态前放置空 data-item 作为分隔符，不能渲染成卡片。 */
    html.via-rpg-ui .event > .data-item:empty {
      display: none !important;
    }

    html.via-rpg-ui .data-item::after {
      content: "";
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: -1px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--vr-primary-soft), transparent);
    }

    html.via-rpg-ui .header-line {
      margin: 14px 0 8px !important;
      border: 0 !important;
      border-top: 1px solid var(--vr-line) !important;
    }

    /* 用户、鸟类、陷阱、巢穴 */
    html.via-rpg-ui :is(.flex, .img-text, .trap) {
      display: flex !important;
      align-items: flex-start;
      gap: 10px;
    }

    html.via-rpg-ui :is(.trap-info, .nest-info) {
      min-width: 0;
      flex: 1;
      margin-left: 0 !important;
    }

    html.via-rpg-ui :is(.trap-name, .nest-name) {
      color: var(--vr-text);
      font-weight: 700;
    }

    html.via-rpg-ui :is(.trap-desc, .flown-away, .image-tip) {
      color: var(--vr-muted) !important;
      font-size: 12px;
    }

    html.via-rpg-ui :is(.head-container, .head-wrapper, .user-avatar) {
      flex: 0 0 auto;
    }

    html.via-rpg-ui .user-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
    }

    html.via-rpg-ui :is(.head-image, .game-item-image, .trap-image, .nest-image) {
      background: var(--vr-surface-soft);
      border-color: var(--vr-line) !important;
      border-radius: 12px !important;
    }

    html.via-rpg-ui .head-image {
      border-radius: 50% !important;
      box-shadow: 0 0 0 3px var(--vr-surface-solid), 0 0 0 4px var(--vr-line) !important;
    }

    html.via-rpg-ui .online-dot {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 8px !important;
      height: 8px !important;
      background: #35c98a !important;
      border: 2px solid var(--vr-surface-solid) !important;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(53, 201, 138, .18) !important;
    }

    /* 表单和操作 */
    html.via-rpg-ui :is(input, select, textarea) {
      min-height: 38px;
      max-width: 100%;
      margin: 3px !important;
      padding: 8px 10px !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-solid) !important;
      border: 1px solid var(--vr-line) !important;
      border-radius: 10px !important;
      font: inherit;
      font-size: 14px;
      outline: none;
    }

    html.via-rpg-ui :is(input, select, textarea):focus {
      border-color: var(--vr-primary) !important;
      box-shadow: 0 0 0 3px var(--vr-primary-soft) !important;
    }

    html.via-rpg-ui button:not(#${BAR_ID} button),
    html.via-rpg-ui input[type="button"],
    html.via-rpg-ui input[type="submit"] {
      min-height: 38px;
      margin: 3px !important;
      padding: 7px 13px !important;
      color: #fff !important;
      background: linear-gradient(145deg, var(--vr-primary-2), var(--vr-primary)) !important;
      border: 0 !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 11px rgba(77, 95, 212, .22) !important;
      font: inherit;
      font-size: 13px !important;
      font-weight: 650;
      cursor: pointer;
      transition: transform var(--vr-speed) ease, filter var(--vr-speed) ease;
    }

    html.via-rpg-ui button:not(#${BAR_ID} button):active,
    html.via-rpg-ui input[type="button"]:active,
    html.via-rpg-ui input[type="submit"]:active {
      transform: translateY(1px) scale(.98);
    }

    html.via-rpg-ui :is(button, input[type="button"], input[type="submit"]):disabled {
      color: var(--vr-muted) !important;
      background: var(--vr-surface-soft) !important;
      border: 1px solid var(--vr-line) !important;
      box-shadow: none !important;
      opacity: .68;
    }

    /* 活动、红包、通知 */
    html.via-rpg-ui :is(.update-notice-bar, .redpack-pinned-bar) {
      position: relative !important;
      top: auto !important;
      margin: 8px auto !important;
      padding: 10px 12px !important;
      border: 1px solid var(--vr-line);
      border-radius: var(--vr-radius-sm);
      box-shadow: var(--vr-shadow-sm) !important;
      overflow: hidden;
    }

    html.via-rpg-ui .update-notice-bar {
      background: linear-gradient(115deg, #5264d9, #7f67cf) !important;
    }

    html.via-rpg-ui .redpack-pinned-bar {
      background: linear-gradient(115deg, #b9414d, #d66053) !important;
    }

    html.via-rpg-ui .redpack-card {
      gap: 8px !important;
      padding: 9px 11px !important;
      background: color-mix(in srgb, var(--vr-danger) 9%, var(--vr-surface-solid)) !important;
      border: 1px solid color-mix(in srgb, var(--vr-danger) 35%, transparent) !important;
      border-radius: var(--vr-radius-sm) !important;
      box-shadow: none !important;
    }

    html.via-rpg-ui .redpack-card-btn {
      border-radius: 999px !important;
      background: var(--vr-danger) !important;
    }

    /* 消息与弹层 */
    html.via-rpg-ui .message {
      top: calc(max(10px, env(safe-area-inset-top)) + 60px) !important;
      width: min(calc(100% - 28px), 520px) !important;
      padding: 11px 14px !important;
      border: 1px solid rgba(255,255,255,.20);
      border-radius: 12px !important;
      box-shadow: var(--vr-shadow-sm) !important;
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
    }

    html.via-rpg-ui .game-info-overlay {
      padding: 16px !important;
      background: rgba(11, 14, 24, .60) !important;
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
    }

    html.via-rpg-ui .game-info-panel {
      max-width: 430px !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-solid) !important;
      border: 1px solid var(--vr-line) !important;
      border-radius: var(--vr-radius) !important;
      box-shadow: var(--vr-shadow) !important;
    }

    html.via-rpg-ui .game-info-header {
      padding: 11px 13px !important;
      color: var(--vr-text) !important;
      background: var(--vr-surface-soft) !important;
      border-bottom: 1px solid var(--vr-line) !important;
    }

    html.via-rpg-ui .game-info-title,
    html.via-rpg-ui .game-info-body,
    html.via-rpg-ui .game-info-message {
      color: var(--vr-text) !important;
    }

    html.via-rpg-ui .game-info-footer {
      border-top: 1px solid var(--vr-line) !important;
    }

    html.via-rpg-ui .game-info-close {
      color: var(--vr-muted) !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    /* 品质颜色在深浅主题中都保持可读 */
    html.via-rpg-ui :is(.rare, .title-rare) { color: #4b8ee7 !important; }
    html.via-rpg-ui :is(.epic, .title-epic) { color: #a56ade !important; }
    html.via-rpg-ui :is(.legendary, .title-legendary) { color: #db9234 !important; }
    html.via-rpg-ui :is(.mythic, .title-mythic) { color: #e15b79 !important; }
    html.via-rpg-ui :is(.uncommon, .title-uncommon) { color: #3f9d72 !important; }
    html.via-rpg-ui :is(.red, .xitong, .title-xitong) { color: var(--vr-danger) !important; }

    html.via-rpg-ui .countdown-timer {
      min-width: 4.3em !important;
      padding: 1px 7px;
      color: var(--vr-warning);
      background: color-mix(in srgb, var(--vr-warning) 10%, transparent);
      border-radius: 999px;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
    }

    html.via-rpg-compact {
      --vr-pad: 10px;
    }

    html.via-rpg-compact body {
      font-size: 14px;
      line-height: 1.58;
    }

    html.via-rpg-compact .data-item {
      margin: 5px 0 !important;
      padding: 8px 10px !important;
    }

    @media (max-width: 520px) {
      html.via-rpg-ui body {
        padding-right: 7px !important;
        padding-left: 7px !important;
        font-size: 14px;
      }

      html.via-rpg-ui .app {
        border-radius: 16px !important;
      }

      html.via-rpg-ui .nav-list {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      html.via-rpg-ui a[data-via-nav="1"] {
        min-height: 36px;
        padding: 5px 4px !important;
        font-size: 13px;
      }

      #${BAR_ID} small {
        display: none;
      }
    }

    @media (max-width: 360px) {
      #${BAR_ID} .vr-mark {
        display: none;
      }
      html.via-rpg-ui .nav-list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html.via-rpg-ui *,
      html.via-rpg-ui *::before,
      html.via-rpg-ui *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  `;

  function getStored(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // 隐私模式/禁用存储时仅在当前页面生效
    }
  }

  function preferredDark() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    const dark = theme === "dark" || (theme === "auto" && preferredDark());
    ROOT.classList.toggle("via-rpg-dark", dark);
    ROOT.dataset.viaTheme = theme;
    const button = document.querySelector(`#${BAR_ID} [data-action="theme"]`);
    if (button) {
      button.textContent = dark ? "☀" : "☾";
      button.title = dark ? "切换为浅色" : "切换为深色";
      button.setAttribute("aria-label", button.title);
    }
  }

  function applyDensity(density) {
    const compact = density === "compact";
    ROOT.classList.toggle("via-rpg-compact", compact);
    ROOT.dataset.viaDensity = density;
    const button = document.querySelector(`#${BAR_ID} [data-action="density"]`);
    if (button) {
      button.textContent = compact ? "舒" : "紧";
      button.title = compact ? "切换舒适布局" : "切换紧凑布局";
      button.setAttribute("aria-label", button.title);
    }
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || ROOT).appendChild(style);
  }

  function installToolbar() {
    if (!document.body || document.getElementById(BAR_ID)) return;
    const bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "云巅纪界面设置");
    bar.innerHTML = `
      <div class="vr-brand">
        <span class="vr-mark" aria-hidden="true">羽</span>
        <span class="vr-brand-text">
          <strong>小小鸟 · 云巅纪</strong>
          <small>文字冒险界面增强</small>
        </span>
      </div>
      <button type="button" data-action="density" aria-label="切换布局密度">紧</button>
      <button type="button" data-action="theme" aria-label="切换明暗主题">☾</button>
    `;
    document.body.appendChild(bar);

    bar.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      if (button.dataset.action === "theme") {
        const next = ROOT.classList.contains("via-rpg-dark") ? "light" : "dark";
        setStored(STORAGE_THEME, next);
        applyTheme(next);
      }

      if (button.dataset.action === "density") {
        const next = ROOT.classList.contains("via-rpg-compact") ? "comfortable" : "compact";
        setStored(STORAGE_DENSITY, next);
        applyDensity(next);
      }
    });
  }

  const navRules = [
    { test: (href) => href === "/task", icon: "🗺" },
    { test: (href) => href.startsWith("/message"), icon: "✦" },
    { test: (href) => href.startsWith("/activity"), icon: "☄" },
    { test: (href) => href.startsWith("/rewards"), icon: "🎁" },
    { test: (href) => href === "/user", icon: "👤" },
    { test: (href) => href.startsWith("/bank"), icon: "◆" },
    { test: (href) => href.startsWith("/help"), icon: "?" },
    { test: (href) => href.startsWith("/home"), icon: "⌂" },
    { test: (href) => href.startsWith("/field"), icon: "🪽" },
    { test: (href) => href.startsWith("/pack"), icon: "🎒" },
    { test: (href) => href.startsWith("/bird"), icon: "🐦" }
  ];

  const navLabels = new Set([
    "首页", "战斗", "配对", "训练",
    "商店", "包裹", "背包", "仓库", "银行",
    "公会", "任务", "教堂", "师徒",
    "好友", "排行", "通知", "帮助",
    "兑换码", "提建议", "谁在玩",
    "公告", "活动", "奖励", "角色", "场景"
  ]);

  function normalizedLinkLabel(link) {
    return (link.textContent || "")
      .replace(/\s+/g, "")
      .replace(/^[^\u4e00-\u9fff]+/, "")
      .trim();
  }

  function decorateLink(link) {
    if (!(link instanceof HTMLAnchorElement) || link.dataset.viaDecorated === "1") return;
    link.dataset.viaDecorated = "1";

    const raw = link.getAttribute("href") || "";
    if (!raw || raw === "#") return;

    let path = raw;
    try {
      path = new URL(raw, location.href).pathname;
    } catch (_) {
      // 保留原字符串匹配
    }

    const label = normalizedLinkLabel(link);
    if (link.closest(".nav-list") && navLabels.has(label)) {
      link.dataset.viaNav = "1";
    }

    const rule = navRules.find((item) => item.test(path));
    if (rule) link.dataset.viaIcon = rule.icon;
  }

  function decorate(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root.matches && root.matches("a[href]")) decorateLink(root);
    root.querySelectorAll("a[href]").forEach(decorateLink);
  }

  function startObserver() {
    if (!document.body || window.__viaRpgObserver) return;
    let scheduled = false;
    const queue = new Set();

    window.__viaRpgObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) queue.add(node);
        }
      }
      if (scheduled || queue.size === 0) return;
      scheduled = true;
      requestAnimationFrame(() => {
        queue.forEach(decorate);
        queue.clear();
        scheduled = false;
      });
    });

    window.__viaRpgObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function boot() {
    installStyle();
    installToolbar();
    applyTheme(getStored(STORAGE_THEME, "auto"));
    applyDensity(getStored(STORAGE_DENSITY, "comfortable"));
    decorate(document);
    startObserver();
  }

  installStyle();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  if (window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncAutoTheme = () => {
      if (getStored(STORAGE_THEME, "auto") === "auto") applyTheme("auto");
    };
    if (media.addEventListener) media.addEventListener("change", syncAutoTheme);
  }
})();
