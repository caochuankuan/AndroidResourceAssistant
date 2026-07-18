// ==UserScript==
// @name         小鸟全功能助手
// @namespace    94218f24-0ac9-4b10-a428-9cee4858c3d4
// @version      3.1.1
// @description  小鸟游戏全功能工具，支持独立用户管理、多账户操作、天梯、种鸟、配鸟等
// @author       YiFeng Tools
// @match        http://43.139.92.32/*
// @match        https://43.139.92.32/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @connect      raw.githubusercontent.com
// ==/UserScript==

/* global GM_getValue, GM_setValue */

(function () {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  const ROOT_ID = 'yifeng-bird-one-click';
  const USERS_STORAGE_KEY = 'yifeng-bird-users-v1';
  const ACTIVE_USER_STORAGE_KEY = 'yifeng-bird-active-user-v1';
  const PUMPKIN_BAIT_ID = 66;
  const BIRD_BOOK_SOURCE_URL = 'https://raw.githubusercontent.com/caochuankuan/AndroidResourceAssistant/main/bird/js/bird-book.js';
  const BAIT_LIST = [
    { id: 1, name: '谷子', birds: '麻雀', price: 2 },
    { id: 2, name: '燕麦', birds: '燕子,乌鸦,麻雀', price: 4 },
    { id: 3, name: '大豆', birds: '喜鹊,燕子,鹌鹑', price: 6 },
    { id: 4, name: '大米', birds: '鸽子,野鸭,山鸡', price: 15 },
    { id: 5, name: '玉米', birds: '喜鹊,鸽子,鹦鹉', price: 18 },
    { id: 6, name: '小鱼', birds: '鹦鹉,猫头鹰,野鸭', price: 24 },
    { id: 8, name: '松子', birds: '黄鹂,松鸡,猫头鹰,金丝雀', price: 28 },
    { id: 9, name: '白蚁', birds: '松鸡,啄木鸟,斑鸠,鹧鸪', price: 22 },
    { id: 10, name: '草鱼', birds: '乌鸦,猫头鹰,大雁', price: 45 },
    { id: 12, name: '水草籽', birds: '秧鸡,翠鸟', price: 7 },
    { id: 13, name: '小鱼苗', birds: '鹈鹕,鸬鹚,鹭鸶', price: 100 },
    { id: 14, name: '小贝壳', birds: '鹭鸶,海鸥,鹈鹕', price: 60 },
    { id: 15, name: '小螃蟹', birds: '海鸥,军舰鸟', price: 16 },
    { id: 17, name: '水仙茎', birds: '海鸥,海雀,翠鸟,水雉', price: 8 },
    { id: 18, name: '小乌贼', birds: '信天翁,大贼鸥,军舰鸟,企鹅', price: 50 },
    { id: 19, name: '螺丝', birds: '潜鸟,鹳,火烈鸟', price: 35 },
    { id: 20, name: '水蜘蛛', birds: '雨燕,海雀,翠鸟', price: 5 },
    { id: 21, name: '鳕鱼', birds: '企鹅,天鹅,大贼鸥', price: 60 },
    { id: 23, name: '锦鲤', birds: '仙鹤,火烈鸟,企鹅,信天翁', price: 160 },
    { id: 24, name: '蚯蚓', birds: '沙鸡,火鸡', price: 16 },
    { id: 25, name: '蚜虫', birds: '蜂鸟,百灵,沙鸡', price: 18 },
    { id: 27, name: '毛毛虫', birds: '杜鹃,布谷鸟,夜莺', price: 180 },
    { id: 28, name: '青蛙', birds: '鹗,红隼', price: 310 },
    { id: 29, name: '独角仙', birds: '伯劳,大鸨,杜鹃', price: 200 },
    { id: 30, name: '田鼠', birds: '伯劳,犀鸟,鹗', price: 220 },
    { id: 31, name: '兔子', birds: '金雕,苍鹰,鹞,红隼', price: 150 },
    { id: 32, name: '仙人掌', birds: '鸵鸟,鸸鹋,犀鸟', price: 340 },
    { id: 34, name: '蛇', birds: '金雕,苍鹰,秃鹫,鹞', price: 100 },
    { id: 35, name: '鼻涕虫', birds: '旅鸽,红鸭', price: 28 },
    { id: 36, name: '核桃', birds: '秃鹃,黄嘴沙鸭', price: 260 },
    { id: 38, name: '蜗牛', birds: '荆棘鸟,果鸠,太平鸟', price: 8 },
    { id: 39, name: '樱桃', birds: '渡渡鸟,几维鸟,黄嘴沙鸭', price: 200 },
    { id: 40, name: '小蜥蜴', birds: '太平鸟,极乐鸟', price: 47 },
    { id: 41, name: '毒蜘蛛', birds: '极乐鸟,几维鸟,太阳鸟', price: 270 },
    { id: 43, name: '恐龙蛋', birds: '恐鸟,象鸟,始祖鸟', price: 680 },
    { id: 44, name: '鼠龙', birds: '始祖鸟,翼龙,极乐鸟,恐鸟', price: 580 },
    { id: 45, name: '蓝宝石', birds: '金鹅,精卫', price: 25 },
    { id: 46, name: '曼陀罗花', birds: '青鸟,七彩孔雀,精卫', price: 43 },
    { id: 47, name: '狼肉', birds: '狮鹫,雷鸟,青鸟', price: 380 },
    { id: 49, name: '巨蟒', birds: '雷鸟,青鸟', price: 210 },
    { id: 51, name: '虎肉', birds: '九头鸟,毕方,雷鸟', price: 234 },
    { id: 53, name: '受伤的白兔', birds: '青鸟,赤鷩,天使', price: 310 },
    { id: 54, name: '梧桐籽', birds: '草鸡,凤凰', price: 30 },
    { id: 55, name: '小神龙', birds: '神鹏,凤凰,天使', price: 650 },
    { id: 66, name: '南瓜糖', birds: '幽灵鸟', price: 199 },
    { id: 144, name: '玉露琼浆', birds: '酒仙鸟,雷雀', price: 446 },
    { id: 148, name: '云之结晶', birds: '微火兽,锁链鸟', price: 565 },
    { id: 209, name: '福果', birds: '白鹇', price: 6 }
  ];

  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const root = document.createElement('div');
  root.id = ROOT_ID;
  const shadow = root.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }

      [hidden] {
        display: none !important;
      }

      .ball {
        position: fixed;
        right: 18px;
        bottom: 110px;
        z-index: 2147483647;
        width: 42px;
        height: 42px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.65);
        border-radius: 50%;
        color: #fff;
        background: linear-gradient(145deg, #6d5dfc 0%, #3974e8 52%, #14a8a0 100%);
        box-shadow:
          0 7px 20px rgba(47, 76, 174, 0.36),
          inset 0 1px 2px rgba(255, 255, 255, 0.3);
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
        transition: box-shadow 0.15s, opacity 0.15s;
      }

      .ball::after {
        content: "";
        position: absolute;
        inset: 3px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        pointer-events: none;
      }

      .ball svg {
        position: relative;
        z-index: 1;
        display: block;
        width: 54%;
        height: 54%;
        margin: auto;
        pointer-events: none;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.12));
      }

      .ball:active {
        cursor: grabbing;
        opacity: 0.9;
        box-shadow: 0 3px 10px rgba(47, 76, 174, 0.3);
      }

      .panel {
        position: fixed;
        right: 16px;
        bottom: 180px;
        z-index: 2147483646;
        display: none;
        width: min(390px, calc(100vw - 24px));
        max-height: calc(100vh - 205px);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 14px 42px rgba(25, 31, 55, 0.28);
        color: #20243a;
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .panel.open {
        display: block;
        animation: show-panel 160ms ease-out;
      }

      @keyframes show-panel {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 13px 14px;
        color: #fff;
        background: linear-gradient(135deg, #5b8cff, #6d4aff);
      }

      .title {
        font-size: 16px;
        font-weight: 700;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .stop-all {
        min-height: 30px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.55);
        border-radius: 15px;
        color: #fff;
        background: rgba(180, 31, 55, 0.72);
        font: 700 12px/28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .close {
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        color: #fff;
        background: rgba(255, 255, 255, 0.18);
        font: 22px/28px sans-serif;
      }

      .body {
        padding: 14px;
        overflow-y: auto;
        max-height: calc(100vh - 260px);
      }

      .execute,
      .action,
      .danger,
      .secondary {
        width: 100%;
        min-height: 44px;
        border: 0;
        border-radius: 10px;
        color: #fff;
        background: #5b63e6;
        padding: 9px 10px;
        font: 700 14px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-shadow: 0 5px 14px rgba(91, 99, 230, 0.25);
      }

      .execute:disabled,
      .action:disabled,
      .danger:disabled,
      .secondary:disabled {
        cursor: wait;
        opacity: 0.62;
      }

      .danger {
        background: #d84d5f;
        box-shadow: 0 5px 14px rgba(216, 77, 95, 0.22);
      }

      .secondary {
        color: #4f5770;
        background: #edf0f7;
        box-shadow: none;
      }

      .tool-select,
      .field,
      .select {
        width: 100%;
        min-height: 40px;
        border: 1px solid #d9deeb;
        border-radius: 9px;
        outline: none;
        color: #252a3d;
        background: #fff;
        padding: 8px 10px;
        font: 14px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .tool-select:focus,
      .field:focus,
      .select:focus {
        border-color: #6d72e8;
        box-shadow: 0 0 0 3px rgba(109, 114, 232, 0.12);
      }

      .tool-select {
        margin-bottom: 12px;
        font-weight: 700;
      }

      .account-bar {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #e2e6f0;
        border-radius: 10px;
        background: #f8f9fc;
      }

      .account-head,
      .user-row,
      .user-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .account-head {
        margin-bottom: 8px;
      }

      .account-head .select {
        flex: 1;
      }

      .account-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
        max-height: 112px;
        overflow: auto;
      }

      .account-check {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        padding: 5px 7px;
        border-radius: 7px;
        background: #fff;
        color: #4c536b;
        font-size: 12px;
      }

      .account-check span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      .user-row {
        align-items: flex-start;
        justify-content: space-between;
        padding: 9px;
        border: 1px solid #e2e6f0;
        border-radius: 9px;
      }

      .user-main {
        min-width: 0;
        flex: 1;
      }

      .user-name {
        font-weight: 700;
      }

      .user-meta {
        color: #717991;
        font-size: 11px;
        word-break: break-all;
      }

      .mini {
        min-height: 30px;
        padding: 4px 8px;
        border: 0;
        border-radius: 7px;
        color: #fff;
        background: #6972df;
        font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .mini.danger {
        width: auto;
        min-height: 30px;
        box-shadow: none;
      }

      .storage-note {
        margin: 7px 0 0;
        color: #4c8b62;
        font-size: 11px;
      }

      .tool-page {
        display: none;
      }

      .tool-page.active {
        display: block;
      }

      .tool-note {
        margin: 0 0 10px;
        color: #6c7389;
        font-size: 12px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .grid .wide {
        grid-column: 1 / -1;
      }

      .fields {
        display: grid;
        gap: 9px;
      }

      .field-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 8px;
      }

      .label {
        display: grid;
        gap: 4px;
        color: #535b73;
        font-size: 12px;
        font-weight: 650;
      }

      .check {
        display: flex;
        align-items: center;
        gap: 7px;
        min-height: 36px;
        color: #535b73;
        font-size: 13px;
      }

      .status {
        min-height: 32px;
        margin-top: 9px;
        padding: 7px 9px;
        border-radius: 8px;
        background: #f1f3f8;
        color: #5d657c;
        font-size: 12px;
      }

      .bird-results {
        display: grid;
        gap: 7px;
        max-height: 230px;
        margin-top: 9px;
        overflow: auto;
      }

      .bird-card {
        padding: 8px 9px;
        border: 1px solid #e1e5ef;
        border-radius: 8px;
        background: #fafbfe;
        color: #3e455d;
        font-size: 12px;
      }

      .log-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 14px 0 7px;
        font-size: 13px;
        font-weight: 700;
        color: #596078;
      }

      .clear {
        padding: 3px 8px;
        border: 0;
        border-radius: 6px;
        color: #6d748c;
        background: #eef0f6;
        font: 12px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .logs {
        height: min(240px, 34vh);
        overflow: auto;
        padding: 9px 10px;
        border-radius: 9px;
        background: #151827;
        color: #cad0e5;
        font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        white-space: pre-wrap;
        word-break: break-word;
        -webkit-overflow-scrolling: touch;
      }

      .log {
        margin-bottom: 5px;
      }

      .log:last-child {
        margin-bottom: 0;
      }

      .log.success {
        color: #69df9a;
      }

      .log.error {
        color: #ff8585;
      }

      .log.info {
        color: #aeb9ff;
      }
    </style>

    <button class="ball" type="button" aria-label="打开小鸟一键操作">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 3.8a6 6 0 0 0-8.5 0L5 10.5V19h8.5l6.7-6.7a6 6 0 0 0 0-8.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 8 2.5 21.5M17.5 15H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <section class="panel" role="dialog" aria-label="小鸟全功能助手">
      <div class="header">
        <div class="title">小鸟全功能助手</div>
        <div class="header-actions">
          <button class="stop-all" type="button">停止</button>
          <button class="close" type="button" aria-label="关闭">&times;</button>
        </div>
      </div>
      <div class="body">
        <div class="account-bar" hidden>
          <div class="account-head">
            <select class="select active-user" aria-label="当前操作账户"></select>
            <button class="mini select-all-users" type="button">全选</button>
            <button class="mini clear-users" type="button">清空</button>
          </div>
          <div class="account-list"></div>
        </div>

        <select class="tool-select" aria-label="选择功能">
          <option value="users">用户管理</option>
          <option value="one-click">一键操作</option>
          <option value="single">单项操作</option>
          <option value="batch-bless">批量祝福</option>
          <option value="ladder">高级天梯</option>
          <option value="plant">一键种鸟</option>
          <option value="breeding">一键配鸟</option>
          <option value="seasonal">拜年与红包</option>
          <option value="guild-war">公会战</option>
          <option value="bird-book">小鸟图鉴</option>
        </select>

        <div class="tool-page active" data-tool-page="users">
          <div class="fields">
            <label class="label">用户名称
              <input class="field user-name-input" type="text" autocomplete="off" placeholder="例如：大号">
            </label>
            <label class="label">完整游戏链接
              <input class="field user-url-input" type="url" autocomplete="off" placeholder="必须包含 sso 参数">
            </label>
            <button class="action add-user" type="button">添加用户</button>
            <div class="grid">
              <button class="secondary import-users" type="button">导入配置</button>
              <button class="secondary export-users" type="button">导出配置</button>
            </div>
            <input class="import-file" type="file" accept="application/json,.json" hidden>
            <div class="field-row">
              <label class="label">旧 IP / 域名
                <input class="field old-host" type="text" placeholder="43.139.92.32">
              </label>
              <label class="label">新 IP / 域名
                <input class="field new-host" type="text" placeholder="新地址">
              </label>
            </div>
            <button class="secondary switch-region" type="button">批量换区</button>
            <p class="storage-note">账户配置保存在 Via 脚本独立存储中，不写入当前网站。</p>
          </div>
          <div class="user-list"></div>
        </div>

        <div class="tool-page" data-tool-page="one-click">
          <p class="tool-note">按原项目顺序为上方勾选的账户执行完整日常操作。</p>
          <button class="execute" type="button">开始一键操作</button>
        </div>

        <div class="tool-page" data-tool-page="single">
          <p class="tool-note">单独执行一键操作页面中的任一功能。</p>
          <div class="grid single-actions">
            <button class="action" type="button" data-single-action="info">账户信息</button>
            <button class="action" type="button" data-single-action="sign">每日签到</button>
            <button class="action" type="button" data-single-action="points">任务进度</button>
            <button class="action" type="button" data-single-action="withdraw">取钱 10 万</button>
            <button class="action" type="button" data-single-action="bless">一键祝福</button>
            <button class="action" type="button" data-single-action="ladder">基础天梯</button>
            <button class="action" type="button" data-single-action="guild-money">捐 4 万金币</button>
            <button class="action" type="button" data-single-action="guild-yuanbao">捐 100 元宝</button>
            <button class="action" type="button" data-single-action="guild-sign">公会签到</button>
            <button class="action" type="button" data-single-action="rewards">领取奖励</button>
            <button class="action" type="button" data-single-action="family">一键切磋</button>
            <button class="action" type="button" data-single-action="bait">麻雀下饵</button>
          </div>
        </div>

        <div class="tool-page" data-tool-page="batch-bless">
          <p class="tool-note">为上方勾选的账户依次执行好友祝福。</p>
          <button class="action batch-bless-start" type="button">开始批量祝福</button>
        </div>

        <div class="tool-page" data-tool-page="ladder">
          <div class="fields">
            <div class="field-row">
              <label class="label">战斗次数
                <input class="field ladder-count" type="number" min="1" max="100" value="15">
              </label>
              <label class="label">对手位置
                <input class="field ladder-target" type="number" min="1" placeholder="默认最后一个">
              </label>
            </div>
            <div class="field-row">
              <label class="label">金币不足取钱
                <input class="field ladder-withdraw" type="number" min="0" value="100000">
              </label>
              <label class="label">恢复卡购买数
                <input class="field ladder-cards" type="number" min="1" value="10">
              </label>
            </div>
            <div class="grid">
              <button class="action ladder-normal" type="button">普通天梯</button>
              <button class="action ladder-vip" type="button">VIP 天梯</button>
            </div>
          </div>
        </div>

        <div class="tool-page" data-tool-page="plant">
          <div class="fields">
            <label class="label">诱饵
              <select class="select plant-bait"></select>
            </label>
            <div class="field-row">
              <label class="label">缺饵购买数
                <input class="field plant-bait-num" type="number" min="1" value="100">
              </label>
              <label class="label">运行轮数
                <input class="field plant-rounds" type="number" min="1" value="100">
              </label>
            </div>
            <label class="label">每轮间隔（秒）
              <input class="field plant-interval" type="number" min="0" value="5">
            </label>
            <label class="check">
              <input class="plant-use-prop" type="checkbox">
              使用加速道具
            </label>
            <div class="field-row plant-prop-fields">
              <label class="label">道具 ID
                <select class="select plant-prop-id">
                  <option value="21">紫藤花（ID: 21）</option>
                </select>
              </label>
              <label class="label">缺道具购买数
                <input class="field plant-prop-num" type="number" min="1" value="50">
              </label>
            </div>
            <button class="secondary plant-load-props" type="button">刷新加速道具</button>
            <label class="check">
              <input class="plant-auto-buy-prop" type="checkbox">
              道具不足时自动购买
            </label>
            <div class="grid">
              <button class="action plant-start" type="button">开始种鸟</button>
              <button class="danger plant-stop" type="button" disabled>停止</button>
            </div>
            <div class="status plant-status">等待操作...</div>
          </div>
        </div>

        <div class="tool-page" data-tool-page="breeding">
          <p class="tool-note">上方“当前操作账户”作为账号 A；账号 B 可从用户库选择或手动输入。</p>
          <div class="fields">
            <label class="label">账号 B
              <select class="select breeding-partner-user">
                <option value="">手动输入</option>
              </select>
            </label>
            <label class="label">账号 B 链接或 SSO
              <input class="field breeding-partner" type="text" autocomplete="off" placeholder="包含 sso= 的链接或直接粘贴 SSO">
            </label>
            <button class="secondary breeding-load" type="button">加载可配小鸟</button>
            <label class="label">选择小鸟
              <select class="select breeding-bird">
                <option value="">请先加载</option>
              </select>
            </label>
            <div class="field-row">
              <label class="label">循环次数
                <input class="field breeding-count" type="number" min="1" value="100">
              </label>
              <label class="label">间隔（秒）
                <input class="field breeding-interval" type="number" min="1" value="5">
              </label>
            </div>
            <label class="label">催产剂
              <select class="select breeding-catalyst">
                <option value="37">催产剂</option>
                <option value="36">小催产剂</option>
              </select>
            </label>
            <div class="grid">
              <button class="action breeding-start" type="button" disabled>开始配鸟</button>
              <button class="danger breeding-stop" type="button" disabled>停止</button>
            </div>
          </div>
        </div>

        <div class="tool-page" data-tool-page="seasonal">
          <p class="tool-note">对当前账户的全部好友执行活动操作。</p>
          <div class="grid">
            <button class="action new-year-start" type="button">一键拜年</button>
            <button class="action redpacket-start" type="button">一键红包</button>
          </div>
        </div>

        <div class="tool-page" data-tool-page="guild-war">
          <div class="fields">
            <div class="field-row">
              <label class="label">目标位置
                <input class="field guild-target" type="number" min="1" value="1">
              </label>
              <label class="label">间隔（毫秒）
                <input class="field guild-interval" type="number" min="100" value="3000">
              </label>
            </div>
            <div class="field-row">
              <label class="label">积分阈值
                <input class="field guild-points" type="number" min="1" value="70">
              </label>
              <label class="label">金币不足取钱
                <input class="field guild-withdraw" type="number" min="0" value="100000">
              </label>
            </div>
            <label class="label">恢复卡购买数
              <input class="field guild-cards" type="number" min="1" value="10">
            </label>
            <button class="action guild-war-toggle" type="button">开始公会战</button>
          </div>
        </div>

        <div class="tool-page" data-tool-page="bird-book">
          <p class="tool-note">首次搜索会加载主项目中的完整图鉴数据。</p>
          <label class="label">搜索名称、诱饵、地图或技能
            <input class="field bird-search" type="search" placeholder="输入关键词">
          </label>
          <div class="bird-results">
            <div class="bird-card">输入关键词后搜索图鉴。</div>
          </div>
        </div>

        <div class="log-title">
          <span>执行日志</span>
          <button class="clear" type="button">清空</button>
        </div>
        <div class="logs" aria-live="polite">
          <div class="log info">等待操作...</div>
        </div>
      </div>
    </section>
  `;

  const ball = shadow.querySelector('.ball');
  const panel = shadow.querySelector('.panel');
  const closeButton = shadow.querySelector('.close');
  const stopAllButton = shadow.querySelector('.stop-all');
  const executeButton = shadow.querySelector('.execute');
  const clearButton = shadow.querySelector('.clear');
  const logs = shadow.querySelector('.logs');
  const toolSelect = shadow.querySelector('.tool-select');
  const accountBar = shadow.querySelector('.account-bar');
  const activeUserSelect = shadow.querySelector('.active-user');
  const accountList = shadow.querySelector('.account-list');
  const selectAllUsersButton = shadow.querySelector('.select-all-users');
  const clearUsersButton = shadow.querySelector('.clear-users');
  const userList = shadow.querySelector('.user-list');
  const breedingPartnerUserSelect = shadow.querySelector('.breeding-partner-user');
  const importFileInput = shadow.querySelector('.import-file');
  const singleActions = shadow.querySelector('.single-actions');
  const batchBlessButton = shadow.querySelector('.batch-bless-start');
  const ladderNormalButton = shadow.querySelector('.ladder-normal');
  const ladderVipButton = shadow.querySelector('.ladder-vip');
  const plantStartButton = shadow.querySelector('.plant-start');
  const plantStopButton = shadow.querySelector('.plant-stop');
  const plantLoadPropsButton = shadow.querySelector('.plant-load-props');
  const plantStatus = shadow.querySelector('.plant-status');
  const breedingLoadButton = shadow.querySelector('.breeding-load');
  const breedingStartButton = shadow.querySelector('.breeding-start');
  const breedingStopButton = shadow.querySelector('.breeding-stop');
  const breedingBirdSelect = shadow.querySelector('.breeding-bird');
  const newYearButton = shadow.querySelector('.new-year-start');
  const redpacketButton = shadow.querySelector('.redpacket-start');
  const guildWarButton = shadow.querySelector('.guild-war-toggle');
  const birdSearchInput = shadow.querySelector('.bird-search');
  const birdResults = shadow.querySelector('.bird-results');

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let plantRunning = false;
  let breedingRunning = false;
  let guildWarRunning = false;
  let breedingContext = null;
  let birdBookData = null;
  let birdBookLoading = null;
  let users = [];
  let selectedUserIds = new Set();
  let activeUserId = '';
  let executionUser = null;
  let globalStopRequested = false;
  const activeRequestControllers = new Set();
  const pendingWaitResolvers = new Set();

  function addLog(message, type = 'info') {
    if (logs.textContent.trim() === '等待操作...') {
      logs.textContent = '';
    }

    const entry = document.createElement('div');
    entry.className = `log ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }

  function getUrlSso() {
    const match = location.href.match(/[?&#]sso=([^&#]+)/i);

    if (match) {
      try {
        return decodeURIComponent(match[1]);
      } catch (error) {
        addLog(`SSO 参数解析失败：${error.message}`, 'error');
        return '';
      }
    }

    return '';
  }

  function getPageUser() {
    const sso = getUrlSso();

    return sso
      ? { id: '__page__', name: '当前页面账户', sso, originalUrl: location.href }
      : null;
  }

  function getActiveUser() {
    return executionUser
      || users.find((user) => user.id === activeUserId)
      || getPageUser()
      || users[0]
      || null;
  }

  function getSso() {
    return getActiveUser()?.sso || '';
  }

  function getSelectedUsers() {
    const selected = users.filter((user) => selectedUserIds.has(user.id));

    if (selected.length > 0) {
      return selected;
    }

    const active = getActiveUser();
    return active ? [active] : [];
  }

  async function withUser(user, task) {
    const previous = executionUser;
    executionUser = user;

    try {
      return await task();
    } finally {
      executionUser = previous;
    }
  }

  function readScriptValue(key, fallback) {
    if (typeof GM_getValue === 'function') {
      return GM_getValue(key, fallback);
    }

    if (typeof globalThis.GM?.getValue === 'function') {
      return globalThis.GM.getValue(key, fallback);
    }

    throw new Error('当前 Via 版本不支持 GM_getValue，无法使用脚本独立存储');
  }

  function writeScriptValue(key, value) {
    if (typeof GM_setValue === 'function') {
      return GM_setValue(key, value);
    }

    if (typeof globalThis.GM?.setValue === 'function') {
      return globalThis.GM.setValue(key, value);
    }

    throw new Error('当前 Via 版本不支持 GM_setValue，无法使用脚本独立存储');
  }

  async function loadUsers() {
    const savedUsers = await Promise.resolve(readScriptValue(USERS_STORAGE_KEY, '[]'));
    const savedActiveId = await Promise.resolve(readScriptValue(ACTIVE_USER_STORAGE_KEY, ''));
    let parsed = [];

    try {
      parsed = JSON.parse(savedUsers || '[]');
    } catch (error) {
      addLog(`账户配置解析失败：${error.message}`, 'error');
    }

    users = Array.isArray(parsed)
      ? parsed.filter((user) => user && typeof user.id === 'string' && typeof user.name === 'string' && typeof user.sso === 'string')
      : [];
    activeUserId = users.some((user) => user.id === savedActiveId) ? savedActiveId : (users[0]?.id || '');
    selectedUserIds = new Set(users.map((user) => user.id));
    renderUsers();
  }

  async function saveUsers() {
    await Promise.resolve(writeScriptValue(USERS_STORAGE_KEY, JSON.stringify(users)));
    await Promise.resolve(writeScriptValue(ACTIVE_USER_STORAGE_KEY, activeUserId));
    renderUsers();
  }

  function extractSsoFromUrl(url) {
    try {
      return new URL(url).searchParams.get('sso') || '';
    } catch (error) {
      return extractSsoValue(url);
    }
  }

  function renderUsers() {
    const pageUser = getPageUser();
    activeUserSelect.innerHTML = '';

    if (pageUser) {
      const option = document.createElement('option');
      option.value = pageUser.id;
      option.textContent = pageUser.name;
      activeUserSelect.appendChild(option);
    }

    for (const user of users) {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      activeUserSelect.appendChild(option);
    }

    if (activeUserId && users.some((user) => user.id === activeUserId)) {
      activeUserSelect.value = activeUserId;
    } else if (pageUser) {
      activeUserSelect.value = pageUser.id;
    }

    accountList.innerHTML = '';

    if (users.length === 0) {
      accountList.textContent = pageUser ? '暂无已保存用户；未勾选时使用当前页面账户。' : '请先在用户管理中添加账户。';
    } else {
      for (const user of users) {
        const label = document.createElement('label');
        label.className = 'account-check';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = user.id;
        checkbox.checked = selectedUserIds.has(user.id);
        const name = document.createElement('span');
        name.textContent = user.name;
        label.append(checkbox, name);
        accountList.appendChild(label);
      }
    }

    breedingPartnerUserSelect.innerHTML = '<option value="">手动输入</option>';

    for (const user of users) {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      breedingPartnerUserSelect.appendChild(option);
    }

    userList.innerHTML = '';

    if (users.length === 0) {
      userList.textContent = '暂无用户数据。';
      return;
    }

    for (const user of users) {
      const row = document.createElement('div');
      row.className = 'user-row';
      const main = document.createElement('div');
      main.className = 'user-main';
      const name = document.createElement('div');
      name.className = 'user-name';
      name.textContent = user.name;
      const meta = document.createElement('div');
      meta.className = 'user-meta';
      let host = '';

      try {
        host = new URL(user.originalUrl).hostname;
      } catch (error) {
        host = '';
      }

      meta.textContent = `${host ? `${host} · ` : ''}SSO: ${user.sso}`;
      main.append(name, meta);
      const actions = document.createElement('div');
      actions.className = 'user-actions';
      const open = document.createElement('button');
      open.className = 'mini';
      open.type = 'button';
      open.dataset.openUser = user.id;
      open.textContent = '打开';
      const remove = document.createElement('button');
      remove.className = 'mini danger';
      remove.type = 'button';
      remove.dataset.deleteUser = user.id;
      remove.textContent = '删除';
      actions.append(open, remove);
      row.append(main, actions);
      userList.appendChild(row);
    }
  }

  function updateAccountControls(tool) {
    const multiAccountTools = new Set(['one-click', 'batch-bless', 'ladder', 'seasonal', 'guild-war']);
    const singleAccountTools = new Set(['single', 'plant', 'breeding']);
    const showMulti = multiAccountTools.has(tool);
    const showSingle = singleAccountTools.has(tool);

    accountBar.hidden = !showMulti && !showSingle;
    activeUserSelect.hidden = !showSingle;
    accountList.hidden = !showMulti;
    selectAllUsersButton.hidden = !showMulti;
    clearUsersButton.hidden = !showMulti;
  }

  function wait(milliseconds) {
    if (globalStopRequested) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        pendingWaitResolvers.delete(finish);
        resolve();
      };
      const timer = setTimeout(finish, milliseconds);
      pendingWaitResolvers.add(finish);
    });
  }

  function stopAllTasks() {
    globalStopRequested = true;
    plantRunning = false;
    breedingRunning = false;
    guildWarRunning = false;

    for (const controller of activeRequestControllers) {
      controller.abort();
    }

    activeRequestControllers.clear();

    for (const resolve of pendingWaitResolvers) {
      resolve();
    }

    pendingWaitResolvers.clear();
    plantStatus.textContent = '已停止';
    plantStopButton.disabled = true;
    breedingStopButton.disabled = true;
    guildWarButton.textContent = '开始公会战';
    guildWarButton.classList.remove('danger');
    addLog('已停止全部正在执行的任务和等待队列。', 'error');
  }

  function summarize(value, maxLength = 120) {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  async function requestResult(path, method = 'GET', sso = getSso()) {
    if (globalStopRequested) {
      throw new Error('操作已停止');
    }

    const controller = new AbortController();
    activeRequestControllers.add(controller);
    let response;
    let text;

    try {
      response = await fetch(`${location.origin}${path}`, {
        method,
        headers: {
          authorization: sso,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: controller.signal
      });
      text = await response.text();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('操作已停止');
      }

      throw error;
    } finally {
      activeRequestControllers.delete(controller);
    }

    let data = null;

    try {
      data = JSON.parse(text);
    } catch (error) {
      data = null;
    }

    const apiOk = data && (data.code === 200 || data.code === '200');

    return {
      ok: response.ok && apiOk,
      status: response.status,
      data,
      text,
      message: data?.msg || text || `HTTP ${response.status}`
    };
  }

  async function api(path, method = 'GET', sso = getSso()) {
    const result = await requestResult(path, method, sso);

    if (!result.ok) {
      throw new Error(result.message);
    }

    return result.data?.data;
  }

  async function getUserInfo() {
    const info = await api('/api/player/info');
    const level = info?.levelInfo?.currentLevel?.level ?? '-';

    addLog(`当前账户：${info?.nickname || '未知'}（UID: ${info?.uid || '-'}）`, 'success');
    addLog(`等级：${level}，VIP：${info?.vipLevel ?? '-'}`);
    return info;
  }

  async function performSignIn() {
    const data = await api('/api/task/dailyfeed', 'POST');
    addLog(`每日签到成功${data ? `：${summarize(data)}` : ''}`, 'success');
  }

  async function withdrawMoney() {
    const data = await api('/api/qianzhuang/qk?num=100000', 'PUT');
    addLog(`取钱 100,000 成功${data ? `：${summarize(data)}` : ''}`, 'success');
  }

  async function blessAllFriends() {
    let page = 0;
    let successCount = 0;
    let failCount = 0;
    let stopForLimit = false;

    while (!stopForLimit && !globalStopRequested) {
      const pageData = await api(`/api/friend/list?page=${page}&keyword=`);
      const friends = Array.isArray(pageData?.records)
        ? pageData.records
        : (Array.isArray(pageData?.content) ? pageData.content : []);

      if (friends.length === 0) {
        break;
      }

      addLog(`好友第 ${page + 1} 页：${friends.length} 人`);

      for (const friendData of friends) {
        if (globalStopRequested) {
          break;
        }

        const player = friendData?.player;

        if (!player?.uid) {
          continue;
        }

        try {
          const result = await requestResult(`/api/fowling/all/bless?uid=${player.uid}`, 'POST');
          const resultText = `${result.message} ${summarize(result.data?.data)}`;

          if (resultText.includes('只能祝福600次')) {
            addLog('已达到祝福次数上限，停止祝福。', 'info');
            stopForLimit = true;
            break;
          }

          if (result.ok) {
            successCount++;
            addLog(`祝福 ${player.nickname || player.uid}（UID: ${player.uid}）成功`, 'success');
          } else {
            failCount++;
            addLog(`祝福 ${player.nickname || player.uid} 失败：${result.message}`, 'error');
          }
        } catch (error) {
          failCount++;
          addLog(`祝福 ${player.nickname || player.uid} 失败：${error.message}`, 'error');
        }

        await wait(100);
      }

      if (stopForLimit) {
        break;
      }

      const totalPages = Number(pageData?.pages);
      page++;

      if (Number.isFinite(totalPages) && page >= totalPages) {
        break;
      }

      await wait(20);
    }

    addLog(`好友祝福完成：成功 ${successCount}，失败 ${failCount}`, failCount ? 'info' : 'success');
  }

  async function performLadder() {
    let successCount = 0;
    let failCount = 0;

    for (let index = 1; index <= 15 && !globalStopRequested; index++) {
      try {
        const players = await api('/api/fight/surround');

        if (!Array.isArray(players) || players.length === 0) {
          failCount++;
          addLog(`天梯 ${index}/15：没有可挑战的对手`, 'error');
          continue;
        }

        const target = players[players.length - 1];
        await api(`/api/fight/fight?uid=${encodeURIComponent(target.uid)}`, 'POST');
        successCount++;
        addLog(`天梯 ${index}/15：挑战 UID ${target.uid} 成功`, 'success');
      } catch (error) {
        failCount++;
        addLog(`天梯 ${index}/15 失败：${error.message}`, 'error');
      }

      if (index < 15) {
        await wait(200);
      }
    }

    addLog(`天梯完成：成功 ${successCount}，失败 ${failCount}`, failCount ? 'info' : 'success');
  }

  async function guildDonate() {
    let successCount = 0;

    for (let index = 1; index <= 2 && !globalStopRequested; index++) {
      try {
        await api('/api/guild/donateOk?ft=1&fp=20000', 'POST');
        successCount++;
        addLog(`公会金币捐赠 ${index}/2 成功`, 'success');
      } catch (error) {
        addLog(`公会金币捐赠 ${index}/2 失败：${error.message}`, 'error');
      }

      if (index < 2) {
        await wait(500);
      }
    }

    addLog(`公会金币捐赠完成：共捐赠 ${successCount * 20000} 金币`, successCount ? 'success' : 'error');
  }

  async function guildSignIn() {
    const data = await api('/api/guild/salary', 'POST');
    addLog(`公会签到成功${data ? `：${summarize(data)}` : ''}`, 'success');
  }

  async function performFamilyFight() {
    const pageData = await api('/api/task/family/list?page=0');
    const families = Array.isArray(pageData?.records)
      ? pageData.records
      : (Array.isArray(pageData?.content) ? pageData.content : []);

    if (families.length === 0) {
      addLog('家族列表为空，跳过一键切磋。', 'info');
      return;
    }

    let familyIndex = 0;
    let wins = 0;
    let attempts = 0;
    let errors = 0;

    while (!globalStopRequested && wins < 5 && attempts < 15 && familyIndex < families.length) {
      const family = families[familyIndex];
      attempts++;

      try {
        const fightData = await api(`/api/task/family?id=${encodeURIComponent(family.id)}`, 'POST');

        if (fightData?.win === false) {
          addLog(`切磋 ${attempts}/15：负于 ${family.name || family.id}`);
          familyIndex++;
        } else {
          wins++;
          addLog(`切磋 ${attempts}/15：胜利（${wins}/5）`, 'success');
        }
      } catch (error) {
        errors++;
        familyIndex++;
        addLog(`切磋 ${attempts}/15 失败：${error.message}`, 'error');
      }

      if (wins < 5) {
        await wait(200);
      }
    }

    addLog(`一键切磋完成：胜利 ${wins}，尝试 ${attempts}，错误 ${errors}`, wins >= 5 ? 'success' : 'info');
  }

  async function performBirdBait() {
    const finishResult = await requestResult('/api/fowling/all/finish', 'POST');
    const birdIds = [];

    if (finishResult.ok) {
      const rewards = Array.isArray(finishResult.data?.data) ? finishResult.data.data : [];
      let experience = 0;
      let birdCount = 0;

      for (const reward of rewards) {
        if (reward?.type === 'EXP') {
          experience += Number(reward.amount) || 0;
        }

        if (reward?.type === 'BIRD') {
          birdCount++;

          if (reward?.detail?.id) {
            birdIds.push(reward.detail.id);
          }
        }
      }

      addLog(`收网成功：经验 +${experience}，鸟类 ${birdCount} 只`, 'success');
    } else {
      addLog(`收网未完成：${finishResult.message}`, 'info');
    }

    if (birdIds.length > 0) {
      try {
        await api(`/api/storage/bird/sell?id=${birdIds.join(',')}&confirm=true`, 'POST');
        addLog(`已出售本次收获的 ${birdIds.length} 只鸟`, 'success');
      } catch (error) {
        addLog(`出售本次收获的小鸟失败：${error.message}`, 'error');
      }
    } else {
      addLog('本次没有需要出售的鸟。');
    }

    let placeResult = await requestResult('/api/fowling/place/all?bid=1', 'POST');

    if (!placeResult.ok && placeResult.message.includes('没有该饵')) {
      addLog('麻雀饵料不足，购买 5 个后重试。');
      await api('/api/shop/buy/goods?func=BAIT&id=1&num=5', 'POST');
      placeResult = await requestResult('/api/fowling/place/all?bid=1', 'POST');
    }

    if (!placeResult.ok) {
      throw new Error(`下饵失败：${placeResult.message}`);
    }

    addLog(`麻雀下饵成功${placeResult.data?.data ? `：${summarize(placeResult.data.data)}` : ''}`, 'success');
  }

  async function checkTaskProgress() {
    const data = await api('/api/activity/points?includeDetails=true');
    const points = Number(data?.points) || 0;
    const details = Array.isArray(data?.activityTypeDetails) ? data.activityTypeDetails : [];

    addLog(`当前任务积分：${points}`, points >= 100 ? 'success' : 'info');

    if (details.length > 0) {
      const names = {
        DAILY_SIGN: '每日签到',
        FAMILY_ACTIVITY: '家族活动',
        CATCH_BIRD: '捕鸟',
        GUILD_SALARY: '公会工资',
        LADDER_WIN: '天梯胜利',
        BREEDING: '繁殖',
        GUILD_DONATE_MONEY: '公会捐赠金币',
        GUILD_DONATE_TREASURE: '公会捐赠元宝',
        BLESSING: '祝福'
      };

      for (const detail of details) {
        addLog(`${names[detail.type] || detail.type}：${detail.currentPoints} 分`);
      }
    }

    return points;
  }

  async function guildDonateYuanbao() {
    await api('/api/guild/donateOk?ft=3&fp=100', 'POST');
    addLog('公会捐赠 100 元宝成功', 'success');
  }

  async function claimAllRewards() {
    const data = await api('/api/activity/claim/all', 'POST');
    addLog(`领取任务奖励成功${data ? `：${summarize(data)}` : ''}`, 'success');
  }

  async function executeAllOperationsForCurrent() {
    if (!getSso()) {
      addLog('未找到 SSO，请先通过包含 sso 参数的游戏链接进入。', 'error');
      return;
    }

    executeButton.disabled = true;
    executeButton.textContent = '执行中...';
    addLog(`=== 开始执行 ${getActiveUser()?.name || '当前账户'} 的一键操作 ===`);

    const state = {
      points: null
    };
    const operations = [
      { name: '获取用户信息', run: getUserInfo },
      { name: '每日签到', run: performSignIn },
      { name: '取钱 10 万', run: withdrawMoney },
      { name: '一键祝福', run: blessAllFriends },
      { name: '一键天梯', run: performLadder },
      { name: '公会捐赠 4 万金币', run: guildDonate },
      { name: '公会签到', run: guildSignIn },
      { name: '一键切磋', run: performFamilyFight },
      { name: '一键下饵（麻雀）', run: performBirdBait },
      {
        name: '检查任务进度',
        run: async () => {
          state.points = await checkTaskProgress();
        }
      },
      {
        name: '公会捐赠 100 元宝',
        shouldSkip: () => state.points !== null && state.points >= 100,
        run: guildDonateYuanbao
      },
      { name: '领取任务奖励', run: claimAllRewards }
    ];

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    try {
      for (let index = 0; index < operations.length && !globalStopRequested; index++) {
        const operation = operations[index];

        if (operation.shouldSkip?.()) {
          skipCount++;
          addLog(`[${index + 1}/${operations.length}] 积分已达到 100，跳过${operation.name}。`, 'info');
          continue;
        }

        addLog(`[${index + 1}/${operations.length}] 开始：${operation.name}`);

        try {
          await operation.run();
          successCount++;
          addLog(`[${index + 1}/${operations.length}] ${operation.name}完成`, 'success');
        } catch (error) {
          failCount++;
          addLog(`[${index + 1}/${operations.length}] ${operation.name}失败：${error.message}`, 'error');
        }

        if (index < operations.length - 1) {
          await wait(2000);
        }
      }

      addLog(`=== 一键操作结束：成功 ${successCount}，失败 ${failCount}，跳过 ${skipCount} ===`, failCount ? 'info' : 'success');
    } finally {
      executeButton.disabled = false;
      executeButton.textContent = '开始一键操作';
    }
  }

  async function executeAllOperations() {
    globalStopRequested = false;
    const selectedUsers = getSelectedUsers();

    if (selectedUsers.length === 0) {
      addLog('请先添加或选择账户。', 'error');
      return;
    }

    executeButton.disabled = true;

    try {
      for (let index = 0; index < selectedUsers.length && !globalStopRequested; index++) {
        const user = selectedUsers[index];
        addLog(`👤 [${index + 1}/${selectedUsers.length}] ${user.name}`);
        await withUser(user, executeAllOperationsForCurrent);
      }
    } finally {
      executeButton.disabled = false;
      executeButton.textContent = '开始一键操作';
    }
  }

  async function runButtonTask(button, runningText, task) {
    globalStopRequested = false;

    if (!getSso()) {
      addLog('未找到 SSO，请先通过包含 sso 参数的游戏链接进入。', 'error');
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = runningText;

    try {
      await task();
    } catch (error) {
      addLog(error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  async function runForSelectedUsers(label, task) {
    const selectedUsers = getSelectedUsers();

    if (selectedUsers.length === 0) {
      throw new Error('请先添加或选择账户');
    }

    for (let index = 0; index < selectedUsers.length && !globalStopRequested; index++) {
      const user = selectedUsers[index];
      addLog(`👤 [${index + 1}/${selectedUsers.length}] ${user.name}：${label}`);
      await withUser(user, task);
    }
  }

  async function useOrBuyRecoveryCard(cardCount, sso = getSso()) {
    let result = await requestResult('/api/prop/use?id=32', 'POST', sso);

    if (result.ok) {
      addLog('恢复卡使用成功', 'success');
      return true;
    }

    if (!result.message.includes('没有战斗恢复卡')) {
      addLog(`恢复卡使用失败：${result.message}`, 'error');
      return false;
    }

    addLog(`没有恢复卡，购买 ${cardCount} 张。`);
    await api(`/api/shop/buy/goods?func=PROP&id=32&num=${cardCount}`, 'POST', sso);
    result = await requestResult('/api/prop/use?id=32', 'POST', sso);

    if (!result.ok) {
      addLog(`购买后使用恢复卡失败：${result.message}`, 'error');
      return false;
    }

    addLog('恢复卡购买并使用成功', 'success');
    return true;
  }

  async function fightOnce(targetUid, withdrawAmount, cardCount, path = null) {
    const fightPath = path || `/api/fight/fight?uid=${encodeURIComponent(targetUid)}`;
    let result = await requestResult(fightPath, 'POST');

    if (result.ok) {
      return {
        success: true,
        win: result.data?.data?.win !== false,
        data: result.data
      };
    }

    if (result.message.includes('战斗次数不足') || result.message.includes('战斗次数已用完')) {
      addLog('战斗次数不足，尝试使用恢复卡。');

      if (await useOrBuyRecoveryCard(cardCount)) {
        result = await requestResult(fightPath, 'POST');
      }
    } else if (result.message.includes('金币不足') && withdrawAmount > 0) {
      addLog(`金币不足，尝试取钱 ${withdrawAmount}。`);
      await api(`/api/qianzhuang/qk?num=${withdrawAmount}`, 'PUT');
      result = await requestResult(fightPath, 'POST');
    }

    return {
      success: result.ok,
      win: result.data?.data?.win !== false,
      data: result.data,
      message: result.message
    };
  }

  async function runAdvancedLadderForCurrent(vipMode) {
    const count = Math.max(1, Math.min(100, Number(shadow.querySelector('.ladder-count').value) || 15));
    const targetIndex = Number(shadow.querySelector('.ladder-target').value) || null;
    const withdrawAmount = Math.max(0, Number(shadow.querySelector('.ladder-withdraw').value) || 0);
    const cardCount = Math.max(1, Number(shadow.querySelector('.ladder-cards').value) || 10);
    const button = vipMode ? ladderVipButton : ladderNormalButton;

    await runButtonTask(button, '执行中...', async () => {
      let successCount = 0;
      let failCount = 0;

      addLog(`开始${vipMode ? ' VIP' : ''}天梯：${count} 次。`);

      for (let round = 1; round <= count && !globalStopRequested; round++) {
        try {
          let result;

          if (vipMode) {
            addLog(`VIP ${round}/${count}：战斗前使用两次恢复卡。`);
            await useOrBuyRecoveryCard(cardCount);
            await wait(500);
            const secondCard = await requestResult('/api/prop/use?id=32', 'POST');
            addLog(secondCard.ok ? '第二次恢复卡使用成功' : `第二次恢复卡使用失败：${secondCard.message}`, secondCard.ok ? 'success' : 'info');
            await wait(2000);
            result = await fightOnce(null, withdrawAmount, cardCount, '/api/fight/fight/all');
          } else {
            const opponents = await api('/api/fight/surround');

            if (!Array.isArray(opponents) || opponents.length === 0) {
              throw new Error('天梯对手列表为空');
            }

            const target = targetIndex
              ? opponents[Math.min(targetIndex, opponents.length) - 1]
              : opponents[opponents.length - 1];
            addLog(`普通天梯 ${round}/${count}：挑战 UID ${target.uid}。`);
            result = await fightOnce(target.uid, withdrawAmount, cardCount);
          }

          if (result.success) {
            successCount++;
            addLog(`${vipMode ? 'VIP ' : ''}天梯 ${round}/${count} 成功${vipMode ? '' : result.win ? '，胜利' : '，失败'}`, 'success');
          } else {
            failCount++;
            addLog(`${vipMode ? 'VIP ' : ''}天梯 ${round}/${count} 失败：${result.message}`, 'error');
          }
        } catch (error) {
          failCount++;
          addLog(`${vipMode ? 'VIP ' : ''}天梯 ${round}/${count} 异常：${error.message}`, 'error');
        }

        if (round < count) {
          await wait(200);
        }
      }

      addLog(`${vipMode ? 'VIP ' : ''}天梯完成：成功 ${successCount}，失败 ${failCount}`, failCount ? 'info' : 'success');
    });
  }

  async function runAdvancedLadder(vipMode) {
    const selectedUsers = getSelectedUsers();

    if (selectedUsers.length === 0) {
      addLog('请先添加或选择账户。', 'error');
      return;
    }

    for (let index = 0; index < selectedUsers.length && !globalStopRequested; index++) {
      const user = selectedUsers[index];
      addLog(`👤 [${index + 1}/${selectedUsers.length}] ${user.name} 开始${vipMode ? ' VIP' : ''}天梯`);
      await withUser(user, () => runAdvancedLadderForCurrent(vipMode));
    }
  }

  async function performNewYear() {
    let page = 0;
    let successCount = 0;
    let failCount = 0;

    while (!globalStopRequested) {
      const pageData = await api(`/api/friend/list?page=${page}&keyword=`);
      const friends = Array.isArray(pageData?.records)
        ? pageData.records
        : (Array.isArray(pageData?.content) ? pageData.content : []);

      if (friends.length === 0) {
        break;
      }

      for (const item of friends) {
        if (globalStopRequested) {
          break;
        }

        const player = item?.player;

        if (!player?.uid) {
          continue;
        }

        const result = await requestResult(`/api/fowling/bless/good?uid=${player.uid}`, 'POST');

        if (result.ok) {
          successCount++;
          addLog(`拜年 ${player.nickname || player.uid}（UID: ${player.uid}）成功`, 'success');
        } else {
          failCount++;
          addLog(`拜年 ${player.nickname || player.uid} 失败：${result.message}`, 'error');
        }

        await wait(100);
      }

      const totalPages = Number(pageData?.pages);
      page++;

      if (Number.isFinite(totalPages) && page >= totalPages) {
        break;
      }

      await wait(500);
    }

    addLog(`拜年完成：成功 ${successCount}，失败 ${failCount}`, failCount ? 'info' : 'success');
  }

  async function grabRedpackets() {
    let count = 0;

    for (let attempt = 1; attempt <= 1000 && !globalStopRequested; attempt++) {
      const result = await requestResult('/api/award/redpacket', 'POST');

      if (!result.ok) {
        addLog(`抢红包停止：${result.message}`, count ? 'info' : 'error');
        break;
      }

      count++;
      const reward = summarize(result.data?.data);
      addLog(`第 ${count} 次抢红包成功${reward ? `：${reward}` : ''}`, 'success');

      if (reward.includes('已达到最大抢红包次数限制')) {
        break;
      }

      await wait(500);
    }

    addLog(`抢红包完成：共 ${count} 次`, count ? 'success' : 'info');
  }

  function randomDelay(baseInterval) {
    return Math.max(100, Math.round(baseInterval * (0.7 + Math.random() * 0.6)));
  }

  function extractFightPoints(data) {
    const awards = data?.data?.awards;

    if (!Array.isArray(awards)) {
      return 0;
    }

    return awards.reduce((total, award) => {
      return award?.type === 'POINTS' ? total + (Number(award.amount) || 0) : total;
    }, 0);
  }

  async function runGuildWarForUser(user, settings) {
    let totalPoints = 0;
    let round = 0;
    const {
      targetIndex,
      baseInterval,
      pointsThreshold,
      withdrawAmount,
      cardCount
    } = settings;

    try {
      while (guildWarRunning) {
        round++;

        try {
          const opponents = await api('/api/fight/surround', 'GET', user.sso);

          if (!Array.isArray(opponents) || opponents.length === 0) {
            throw new Error('对手列表为空');
          }

          const target = opponents[Math.min(targetIndex, opponents.length) - 1];
          let fight = await requestResult(`/api/fight/fight?uid=${encodeURIComponent(target.uid)}`, 'POST', user.sso);

          if (!fight.ok && fight.message.includes('免战')) {
            addLog(`[${user.name}] 检测到免战，尝试取消免战。`);
            await api('/api/fight/undeny', 'GET', user.sso);
            fight = await requestResult(`/api/fight/fight?uid=${encodeURIComponent(target.uid)}`, 'POST', user.sso);
          } else if (!fight.ok && fight.message.includes('战斗次数不足')) {
            await useOrBuyRecoveryCard(cardCount, user.sso);
            fight = await requestResult(`/api/fight/fight?uid=${encodeURIComponent(target.uid)}`, 'POST', user.sso);
          } else if (!fight.ok && fight.message.includes('金币不足') && withdrawAmount > 0) {
            await api(`/api/qianzhuang/qk?num=${withdrawAmount}`, 'PUT', user.sso);
            fight = await requestResult(`/api/fight/fight?uid=${encodeURIComponent(target.uid)}`, 'POST', user.sso);
          }

          if (!fight.ok) {
            throw new Error(fight.message);
          }

          const gainedPoints = extractFightPoints(fight.data);
          totalPoints += gainedPoints;
          addLog(`[${user.name}] 公会战第 ${round} 轮成功，获得 ${gainedPoints} 分，累计 ${totalPoints}/${pointsThreshold}`, 'success');

          if (totalPoints >= pointsThreshold) {
            addLog(`[${user.name}] 达到积分阈值，执行免战卡流程。`);
            await api('/api/shop/buy/goods?func=PROP&id=39&num=1', 'POST', user.sso);
            await api('/api/prop/use?id=39', 'POST', user.sso);
            await wait(randomDelay(baseInterval * 2));
            await api('/api/fight/undeny', 'GET', user.sso);
            totalPoints = 0;
            addLog(`[${user.name}] 免战流程完成并清空累计积分。`, 'success');
          }
        } catch (error) {
          addLog(`[${user.name}] 公会战第 ${round} 轮失败：${error.message}`, 'error');
        }

        if (guildWarRunning) {
          await wait(randomDelay(baseInterval));
        }
      }
    } finally {
      addLog(`[${user.name}] 公会战已停止：共执行 ${round} 轮，当前累计 ${totalPoints} 分。`);
    }
  }

  async function startGuildWar() {
    if (guildWarRunning) {
      guildWarRunning = false;
      guildWarButton.textContent = '停止中...';
      addLog('已请求停止公会战，当前轮结束后停止。', 'info');
      return;
    }

    const selectedUsers = getSelectedUsers();

    if (selectedUsers.length === 0) {
      addLog('请先添加或选择账户。', 'error');
      return;
    }

    globalStopRequested = false;
    const settings = {
      targetIndex: Math.max(1, Number(shadow.querySelector('.guild-target').value) || 1),
      baseInterval: Math.max(100, Number(shadow.querySelector('.guild-interval').value) || 3000),
      pointsThreshold: Math.max(1, Number(shadow.querySelector('.guild-points').value) || 70),
      withdrawAmount: Math.max(0, Number(shadow.querySelector('.guild-withdraw').value) || 0),
      cardCount: Math.max(1, Number(shadow.querySelector('.guild-cards').value) || 10)
    };

    guildWarRunning = true;
    guildWarButton.classList.add('danger');
    guildWarButton.textContent = `停止公会战（${selectedUsers.length}）`;
    addLog(`公会战开始：${selectedUsers.length} 个账户并发执行。`);

    try {
      await Promise.all(selectedUsers.map((user) => runGuildWarForUser(user, settings)));
    } finally {
      guildWarRunning = false;
      guildWarButton.classList.remove('danger');
      guildWarButton.textContent = '开始公会战';
    }
  }

  async function findPumpkinTower() {
    const summary = await api('/api/home/summary');
    const uid = summary?.birth?.uid;

    if (!uid) {
      throw new Error('未能从首页摘要获取 UID');
    }

    const traps = await api(`/api/fowling/list?uid=${encodeURIComponent(uid)}`);
    const tower = Array.isArray(traps)
      ? traps.find((item) => item.name === '万圣塔') || traps.find((item) => item.type === 3)
      : null;

    if (!tower) {
      throw new Error('未找到万圣塔');
    }

    return tower;
  }

  async function loadPlantProps() {
    await runButtonTask(plantLoadPropsButton, '加载中...', async () => {
      const props = [];

      for (let page = 0; page < 100; page++) {
        const pageData = await api(`/api/pack/props?page=${page}&ft=-1&et=trap`);
        const content = Array.isArray(pageData?.content) ? pageData.content : [];
        props.push(...content);

        if (content.length === 0) {
          break;
        }
      }

      const select = shadow.querySelector('.plant-prop-id');
      select.innerHTML = '';

      if (props.length === 0) {
        select.innerHTML = '<option value="21">紫藤花（ID: 21）</option>';
        addLog('未获取到加速道具，使用默认紫藤花。');
        return;
      }

      for (const prop of props) {
        const option = document.createElement('option');
        option.value = String(prop.gid);
        option.textContent = `${prop.name}（${prop.func}）x${prop.num}`;
        select.appendChild(option);
      }

      addLog(`已加载 ${props.length} 种加速道具`, 'success');
    });
  }

  async function usePlantProps(propId, autoBuy, buyCount) {
    let usedCount = 0;

    for (let targetId = 1; targetId <= 6 && plantRunning; targetId++) {
      while (plantRunning) {
        let result = await requestResult(`/api/prop/use?id=${propId}&targetId=${targetId}`, 'POST');

        if (result.ok) {
          usedCount++;
          addLog(`加速道具 targetId=${targetId} 使用成功`, 'success');
          await wait(1000);
          continue;
        }

        const shortage = result.message.includes('道具不足') || result.message.includes('没有') || result.message.includes('可用');

        if (!shortage || !autoBuy) {
          addLog(`加速 targetId=${targetId} 结束：${result.message}`);
          break;
        }

        addLog(`加速道具不足，购买 ${buyCount} 个。`);
        await api(`/api/shop/buy/goods?func=PROP&id=${propId}&num=${buyCount}`, 'POST');
        result = await requestResult(`/api/prop/use?id=${propId}&targetId=${targetId}`, 'POST');

        if (!result.ok) {
          addLog(`补购后加速失败：${result.message}`, 'error');
          break;
        }

        usedCount++;
        addLog(`补购后 targetId=${targetId} 使用成功`, 'success');
      }
    }

    addLog(`加速道具使用结束：共 ${usedCount} 次。`);
  }

  async function waitForFinish(timestamp) {
    while (plantRunning) {
      const remaining = timestamp - Math.floor(Date.now() / 1000);

      if (remaining <= 0) {
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      plantStatus.textContent = `距收鸟还有 ${minutes ? `${minutes} 分 ` : ''}${seconds} 秒`;
      await wait(Math.min(1000, remaining * 1000));
    }
  }

  async function startPlantBird() {
    if (plantRunning) {
      return;
    }

    if (!getSso()) {
      addLog('未找到 SSO，请先通过包含 sso 参数的游戏链接进入。', 'error');
      return;
    }

    globalStopRequested = false;
    const baitId = Number(shadow.querySelector('.plant-bait').value) || 1;
    const baitBuyCount = Math.max(1, Number(shadow.querySelector('.plant-bait-num').value) || 100);
    const maxRounds = Math.max(1, Number(shadow.querySelector('.plant-rounds').value) || 100);
    const roundInterval = Math.max(0, Number(shadow.querySelector('.plant-interval').value) || 0) * 1000;
    const useProp = shadow.querySelector('.plant-use-prop').checked;
    const propId = Math.max(1, Number(shadow.querySelector('.plant-prop-id').value) || 21);
    const propBuyCount = Math.max(1, Number(shadow.querySelector('.plant-prop-num').value) || 50);
    const autoBuyProp = shadow.querySelector('.plant-auto-buy-prop').checked;
    const bait = BAIT_LIST.find((item) => item.id === baitId);

    plantRunning = true;
    plantStartButton.disabled = true;
    plantStopButton.disabled = false;
    addLog(`开始种鸟：${bait?.name || baitId}，共 ${maxRounds} 轮。`);

    try {
      for (let round = 1; round <= maxRounds && plantRunning; round++) {
        plantStatus.textContent = `第 ${round}/${maxRounds} 轮：正在种鸟`;
        addLog(`种鸟第 ${round}/${maxRounds} 轮开始。`);

        const pumpkinMode = baitId === PUMPKIN_BAIT_ID;
        const tower = pumpkinMode ? await findPumpkinTower() : null;
        const placePath = pumpkinMode
          ? `/api/fowling/place?id=${encodeURIComponent(tower.id)}&bid=${baitId}`
          : `/api/fowling/place/all?bid=${baitId}`;
        let place = await requestResult(placePath, 'POST');

        if (!place.ok && place.message.includes('没有该饵')) {
          if (pumpkinMode) {
            throw new Error('南瓜糖不足，活动诱饵不自动购买');
          }

          addLog(`诱饵不足，购买 ${baitBuyCount} 个。`);
          await api(`/api/shop/buy/goods?func=BAIT&id=${baitId}&num=${baitBuyCount}`, 'POST');
          place = await requestResult(placePath, 'POST');
        }

        let finishTime = null;

        if (place.ok) {
          const traps = Array.isArray(place.data?.data) ? place.data.data : [];
          finishTime = traps.length ? Math.max(...traps.map((item) => Number(item.finishTime) || 0)) : null;
          addLog(`种鸟成功：${traps.length || '-'} 个陷阱`, 'success');
        } else if (pumpkinMode && tower?.finishTime) {
          finishTime = tower.finishTime;
          addLog(`万圣塔已有任务，沿用完成时间：${new Date(finishTime * 1000).toLocaleString()}`);
        } else {
          throw new Error(`种鸟失败：${place.message}`);
        }

        if (!pumpkinMode && useProp && plantRunning) {
          await usePlantProps(propId, autoBuyProp, propBuyCount);
          finishTime = null;
        }

        if (finishTime && plantRunning) {
          await waitForFinish(finishTime);
        }

        if (!plantRunning) {
          break;
        }

        plantStatus.textContent = `第 ${round}/${maxRounds} 轮：准备收鸟`;
        await wait(5000);

        if (!plantRunning) {
          break;
        }

        let finish = await requestResult('/api/fowling/all/finish', 'POST');

        if (!finish.ok && finish.message.includes('仓库已满')) {
          addLog('仓库已满，开始清理仓库。');
          const sell = await api('/api/storage/bird/sellall?confirm=true', 'POST');
          addLog(`仓库清理成功${sell ? `，获得 ${summarize(sell)} 金币` : ''}`, 'success');
          finish = await requestResult('/api/fowling/all/finish', 'POST');
        }

        if (!finish.ok) {
          addLog(`收鸟失败：${finish.message}`, 'error');
        } else {
          addLog(`第 ${round}/${maxRounds} 轮收鸟成功`, 'success');
        }

        if (round < maxRounds && plantRunning && roundInterval > 0) {
          plantStatus.textContent = `第 ${round}/${maxRounds} 轮完成，等待下一轮`;
          await wait(roundInterval);
        }
      }
    } catch (error) {
      addLog(`种鸟流程停止：${error.message}`, 'error');
    } finally {
      plantRunning = false;
      plantStartButton.disabled = false;
      plantStopButton.disabled = true;
      plantStatus.textContent = '种鸟流程已停止';
    }
  }

  function extractSsoValue(input) {
    const text = input.trim();

    if (!text) {
      return '';
    }

    const match = text.match(/[?&#]sso=([^&#]+)/i);

    if (!match) {
      return text;
    }

    try {
      return decodeURIComponent(match[1]);
    } catch (error) {
      return match[1];
    }
  }

  function parseVipLevel(value) {
    if (typeof value === 'number') {
      return value;
    }

    const match = String(value || '').match(/VIP(\d+)/i);
    return match ? Number(match[1]) : 0;
  }

  async function fetchBreedingBirds(receiverUid, currentSso) {
    const birds = [];

    for (let page = 0; page < 100; page++) {
      const pageData = await api(`/api/birth/birthwait?uid=${encodeURIComponent(receiverUid)}&page=${page}`, 'GET', currentSso);
      const pageBirds = Array.isArray(pageData?.records)
        ? pageData.records
        : (Array.isArray(pageData?.content) ? pageData.content : []);
      birds.push(...pageBirds);

      if (pageBirds.length < 10) {
        break;
      }
    }

    return birds;
  }

  async function loadBreedingBirds() {
    globalStopRequested = false;
    const currentSso = getSso();
    const partnerSso = extractSsoValue(shadow.querySelector('.breeding-partner').value);

    if (!currentSso || !partnerSso) {
      addLog('配鸟需要当前账户 SSO 和账号 B 的链接或 SSO。', 'error');
      return;
    }

    breedingLoadButton.disabled = true;
    breedingLoadButton.textContent = '加载中...';

    try {
      const currentInfo = await api('/api/player/info', 'GET', currentSso);
      const partnerInfo = await api('/api/player/info', 'GET', partnerSso);

      if (String(currentInfo.uid) === String(partnerInfo.uid)) {
        throw new Error('账号 A 和账号 B 不能是同一个账户');
      }

      const birds = await fetchBreedingBirds(partnerInfo.uid, currentSso);

      breedingContext = {
        currentSso,
        partnerSso,
        currentInfo,
        partnerInfo,
        birds
      };
      breedingBirdSelect.innerHTML = '';

      if (birds.length === 0) {
        breedingBirdSelect.innerHTML = '<option value="">没有可配小鸟</option>';
        breedingStartButton.disabled = true;
        addLog('没有找到可配小鸟。', 'error');
        return;
      }

      for (const bird of birds) {
        const option = document.createElement('option');
        option.value = String(bird.id);
        option.textContent = `${bird.name}（ID: ${bird.id}，${bird.sex === 0 ? '雌' : '雄'}）`;
        breedingBirdSelect.appendChild(option);
      }

      breedingStartButton.disabled = false;
      addLog(`配鸟账户：${currentInfo.nickname} → ${partnerInfo.nickname}，加载到 ${birds.length} 只小鸟。`, 'success');
    } catch (error) {
      breedingContext = null;
      breedingStartButton.disabled = true;
      addLog(`加载配鸟信息失败：${error.message}`, 'error');
    } finally {
      breedingLoadButton.disabled = false;
      breedingLoadButton.textContent = '加载可配小鸟';
    }
  }

  async function findMatchingBreedingBirds(friendBirdId, currentSso) {
    const birds = [];

    for (let page = 0; page < 100; page++) {
      const pageData = await api(`/api/birth/birthwait?birdId=${encodeURIComponent(friendBirdId)}&page=${page}`, 'GET', currentSso);
      const pageBirds = Array.isArray(pageData?.records)
        ? pageData.records
        : (Array.isArray(pageData?.content) ? pageData.content : []);
      birds.push(...pageBirds);

      if (pageBirds.length < 10) {
        break;
      }
    }

    return birds;
  }

  async function breedBird(friendBird, context) {
    const matching = await findMatchingBreedingBirds(friendBird.id, context.currentSso);

    if (matching.length === 0) {
      addLog(`${friendBird.name}（ID: ${friendBird.id}）没有对应小鸟，跳过。`);
      return null;
    }

    const makeData = await api(
      `/api/birth/make?birdId=${encodeURIComponent(matching[0].id)}&friendBirdId=${encodeURIComponent(friendBird.id)}`,
      'POST',
      context.currentSso
    );
    const acceptData = await api(
      `/api/birth/accept?id=${encodeURIComponent(makeData.id)}`,
      'POST',
      context.partnerSso
    );
    addLog(`${friendBird.name}（ID: ${friendBird.id}）配鸟成功`, 'success');
    return acceptData;
  }

  async function buyCatalyst(catalystId, catalystName, currentSso) {
    const result = await requestResult(`/api/shop/prop?id=${catalystId}`, 'GET', currentSso);

    if (!result.ok && result.status >= 400) {
      throw new Error(`购买${catalystName}失败：${result.message}`);
    }

    addLog(`${catalystName}购买请求完成`, 'success');
  }

  async function accelerateBreeding(askUid, context, catalystId) {
    const catalystName = catalystId === 37 ? '催产剂' : '小催产剂';
    const vipLevel = parseVipLevel(context.currentInfo.vipLevel);

    if (vipLevel >= 5) {
      let result = await requestResult(`/api/prop/use?id=${catalystId}&targetId=-1&num=5`, 'POST', context.currentSso);

      if (!result.ok && result.message.includes(`没有${catalystName}`)) {
        await buyCatalyst(catalystId, catalystName, context.currentSso);
        result = await requestResult(`/api/prop/use?id=${catalystId}&targetId=-1&num=5`, 'POST', context.currentSso);
      }

      if (!result.ok) {
        throw new Error(`使用${catalystName}失败：${result.message}`);
      }

      addLog(`${catalystName}使用成功`, 'success');
      return;
    }

    for (let attempt = 1; attempt <= 500 && breedingRunning; attempt++) {
      const result = await requestResult(`/api/prop/use?id=${catalystId}`, 'POST', context.currentSso);

      if (!result.ok && result.message.includes('配对已经完成')) {
        addLog(`配对加速完成，共请求 ${attempt} 次。`, 'success');
        return;
      }

      if (!result.ok && result.message.includes(`没有${catalystName}`)) {
        await buyCatalyst(catalystId, catalystName, context.currentSso);
        continue;
      }

      if (!result.ok) {
        throw new Error(`加速失败：${result.message}`);
      }

      await wait(100);
    }

    if (breedingRunning) {
      throw new Error('配对加速达到安全上限');
    }
  }

  async function startBreeding() {
    if (!breedingContext || breedingRunning) {
      return;
    }

    const selectedId = breedingBirdSelect.value;
    const selectedBird = breedingContext.birds.find((bird) => String(bird.id) === selectedId);

    if (!selectedBird) {
      addLog('请先选择一只小鸟。', 'error');
      return;
    }

    globalStopRequested = false;
    const maxCycles = Math.max(1, Number(shadow.querySelector('.breeding-count').value) || 100);
    const intervalSeconds = Math.max(1, Number(shadow.querySelector('.breeding-interval').value) || 5);
    const catalystId = Number(shadow.querySelector('.breeding-catalyst').value) || 37;
    breedingRunning = true;
    breedingStartButton.disabled = true;
    breedingStopButton.disabled = false;

    try {
      let result = await breedBird(selectedBird, breedingContext);
      let askUid = result?.askUid;

      if (!askUid) {
        throw new Error('首次配鸟完成，但没有返回 askUid');
      }

      const birdName = selectedBird.name;

      for (let cycle = 1; cycle <= maxCycles && breedingRunning; cycle++) {
        addLog(`自动配鸟第 ${cycle}/${maxCycles} 轮。`);
        await accelerateBreeding(askUid, breedingContext, catalystId);
        await api(`/api/birth/finish?uid=${encodeURIComponent(askUid)}`, 'POST', breedingContext.currentSso);
        addLog('生育完成并收取小鸟', 'success');

        const nextBirds = await fetchBreedingBirds(breedingContext.partnerInfo.uid, breedingContext.currentSso);
        const sameNameBirds = nextBirds.filter((bird) => bird.name === birdName);
        result = null;

        for (const bird of sameNameBirds) {
          if (!breedingRunning) {
            break;
          }

          try {
            result = await breedBird(bird, breedingContext);

            if (result?.askUid) {
              break;
            }
          } catch (error) {
            addLog(`${bird.name}（ID: ${bird.id}）配鸟失败：${error.message}`, 'error');
          }
        }

        if (!result?.askUid) {
          addLog(`没有更多可配的 ${birdName}，流程结束。`);
          break;
        }

        askUid = result.askUid;

        if (cycle < maxCycles && breedingRunning) {
          await wait(intervalSeconds * 1000);
        }
      }
    } catch (error) {
      addLog(`配鸟流程停止：${error.message}`, 'error');
    } finally {
      breedingRunning = false;
      breedingStartButton.disabled = !breedingContext;
      breedingStopButton.disabled = true;
      addLog('配鸟流程已停止。');
    }
  }

  async function loadBirdBookData() {
    if (birdBookData) {
      return birdBookData;
    }

    if (birdBookLoading) {
      return birdBookLoading;
    }

    birdBookLoading = (async () => {
      const response = await fetch(BIRD_BOOK_SOURCE_URL, {
        credentials: 'omit',
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`图鉴加载失败：HTTP ${response.status}`);
      }

      const source = await response.text();
      const match = source.match(/const birdsData = (\[[\s\S]*?\]);/);

      if (!match) {
        throw new Error('图鉴数据格式无法识别');
      }

      const parsed = JSON.parse(match[1]);

      if (!Array.isArray(parsed)) {
        throw new Error('图鉴数据不是数组');
      }

      birdBookData = parsed;
      return birdBookData;
    })();

    try {
      return await birdBookLoading;
    } finally {
      birdBookLoading = null;
    }
  }

  async function searchBirdBook(searchText) {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      birdResults.innerHTML = '<div class="bird-card">输入关键词后搜索图鉴。</div>';
      return;
    }

    birdResults.innerHTML = '<div class="bird-card">正在加载图鉴...</div>';

    let data;

    try {
      data = await loadBirdBookData();
    } catch (error) {
      addLog(error.message, 'error');
      birdResults.innerHTML = '';
      const errorCard = document.createElement('div');
      errorCard.className = 'bird-card';
      errorCard.textContent = error.message;
      birdResults.appendChild(errorCard);
      return;
    }

    if (birdSearchInput.value.trim().toLowerCase() !== keyword) {
      return;
    }

    const numericSearch = /^\d+$/.test(keyword);
    const matches = data.filter((bird) => {
      const fields = [
        bird.name,
        bird.baitName,
        bird.baitField,
        bird.skill?.skillName,
        bird.skill?.skillDescription,
        bird.skill?.position
      ];

      if (numericSearch) {
        fields.push(
          bird.i,
          bird.period,
          bird.ws,
          bird.we,
          bird.exp,
          bird.skill?.skillId
        );
      }

      return fields.some((field) => String(field ?? '').toLowerCase().includes(keyword));
    }).slice(0, 100);

    if (matches.length === 0) {
      birdResults.innerHTML = '<div class="bird-card">没有找到匹配的小鸟。</div>';
      return;
    }

    birdResults.innerHTML = '';

    for (const bird of matches) {
      const card = document.createElement('div');
      card.className = 'bird-card';
      const minWeight = (Number(bird.ws) / 100).toFixed(2);
      const maxWeight = (Number(bird.we) / 100).toFixed(2);
      const maxLimit = ((Number(bird.we) * 5.8) / 100).toFixed(2);
      const skill = bird.skill
        ? `｜技能：${bird.skill.skillName}（${bird.skill.position}）${bird.skill.skillDescription}`
        : '';
      card.textContent = `#${bird.i} ${bird.name}｜周期：${bird.period}｜重量：${minWeight}-${maxWeight} 斤｜极限：${maxLimit} 斤｜经验：${bird.exp}｜诱饵：${bird.baitName || '-'}｜地图：${bird.baitField || '-'}${skill}`;
      birdResults.appendChild(card);
    }
  }

  async function addUser() {
    const nameInput = shadow.querySelector('.user-name-input');
    const urlInput = shadow.querySelector('.user-url-input');
    const name = nameInput.value.trim();
    const originalUrl = urlInput.value.trim();
    const sso = extractSsoFromUrl(originalUrl);

    if (!name || !originalUrl) {
      addLog('请填写用户名称和完整游戏链接。', 'error');
      return;
    }

    if (!sso) {
      addLog('无法从链接中提取 sso 参数。', 'error');
      return;
    }

    if (users.some((user) => user.name === name)) {
      addLog('用户名已存在。', 'error');
      return;
    }

    if (users.some((user) => user.sso === sso)) {
      addLog('该 SSO 已存在。', 'error');
      return;
    }

    const user = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      originalUrl,
      sso,
      createTime: new Date().toLocaleString()
    };
    users.push(user);
    selectedUserIds.add(user.id);
    activeUserId ||= user.id;
    await saveUsers();
    nameInput.value = '';
    urlInput.value = '';
    addLog(`用户“${name}”已保存到脚本独立存储。`, 'success');
  }

  function exportUsers() {
    if (users.length === 0) {
      addLog('暂无用户数据可导出。', 'error');
      return;
    }

    const payload = JSON.stringify({
      version: '1.0',
      exportTime: new Date().toISOString(),
      users
    }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `用户配置_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addLog(`已导出 ${users.length} 个用户配置。`, 'success');
  }

  async function importUsers(file) {
    if (!file) {
      return;
    }

    try {
      const data = JSON.parse(await file.text());
      const source = Array.isArray(data) ? data : data.users;

      if (!Array.isArray(source)) {
        throw new Error('配置文件缺少 users 数组');
      }

      const imported = source
        .filter((user) => user && typeof user.name === 'string' && typeof user.sso === 'string')
        .map((user) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          name: user.name.trim(),
          originalUrl: typeof user.originalUrl === 'string' ? user.originalUrl : '',
          sso: user.sso.trim(),
          createTime: user.createTime || new Date().toLocaleString(),
          importTime: new Date().toLocaleString()
        }))
        .filter((user) => user.name && user.sso);

      if (imported.length === 0) {
        throw new Error('配置文件中没有有效用户');
      }

      if (users.length > 0 && !confirm(`导入会覆盖当前 ${users.length} 个用户，继续吗？`)) {
        return;
      }

      users = imported;
      selectedUserIds = new Set(users.map((user) => user.id));
      activeUserId = users[0].id;
      await saveUsers();
      addLog(`成功导入 ${users.length} 个用户配置。`, 'success');
    } catch (error) {
      addLog(`导入失败：${error.message}`, 'error');
    } finally {
      importFileInput.value = '';
    }
  }

  async function switchRegion() {
    const oldHost = shadow.querySelector('.old-host').value.trim();
    const newHost = shadow.querySelector('.new-host').value.trim();

    if (!oldHost || !newHost || oldHost === newHost) {
      addLog('请填写不同的旧 IP/域名和新 IP/域名。', 'error');
      return;
    }

    let changed = 0;
    users = users.map((user) => {
      try {
        const url = new URL(user.originalUrl);

        if (url.hostname !== oldHost) {
          return user;
        }

        url.hostname = newHost;
        changed++;
        return { ...user, originalUrl: url.toString() };
      } catch (error) {
        return user;
      }
    });

    if (changed === 0) {
      addLog(`没有找到使用 ${oldHost} 的用户链接。`, 'info');
      return;
    }

    await saveUsers();
    addLog(`已为 ${changed} 个用户切换到 ${newHost}。`, 'success');
  }

  function togglePanel(forceOpen) {
    const shouldOpen = forceOpen ?? !panel.classList.contains('open');
    panel.classList.toggle('open', shouldOpen);
    ball.setAttribute('aria-expanded', String(shouldOpen));
  }

  ball.addEventListener('pointerdown', function (event) {
    const rect = ball.getBoundingClientRect();

    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
    ball.style.left = `${rect.left}px`;
    ball.style.top = `${rect.top}px`;
    ball.setPointerCapture(event.pointerId);
  });

  ball.addEventListener('pointermove', function (event) {
    if (!dragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      moved = true;
    }

    const maxLeft = Math.max(0, window.innerWidth - ball.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - ball.offsetHeight);
    const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + deltaX));
    const nextTop = Math.min(maxTop, Math.max(0, startTop + deltaY));

    ball.style.left = `${nextLeft}px`;
    ball.style.top = `${nextTop}px`;
  });

  function stopDragging(event) {
    if (!dragging) {
      return;
    }

    dragging = false;

    if (ball.hasPointerCapture(event.pointerId)) {
      ball.releasePointerCapture(event.pointerId);
    }
  }

  ball.addEventListener('pointerup', stopDragging);
  ball.addEventListener('pointercancel', stopDragging);

  ball.addEventListener('click', function () {
    if (moved) {
      moved = false;
      return;
    }

    togglePanel();
  });

  closeButton.addEventListener('click', function () {
    togglePanel(false);
  });

  stopAllButton.addEventListener('click', stopAllTasks);

  executeButton.addEventListener('click', executeAllOperations);

  activeUserSelect.addEventListener('change', async function () {
    activeUserId = activeUserSelect.value === '__page__' ? '' : activeUserSelect.value;
    breedingContext = null;
    breedingStartButton.disabled = true;

    try {
      await Promise.resolve(writeScriptValue(ACTIVE_USER_STORAGE_KEY, activeUserId));
    } catch (error) {
      addLog(error.message, 'error');
    }
  });

  accountList.addEventListener('change', function (event) {
    const checkbox = event.target.closest('input[type="checkbox"]');

    if (!checkbox) {
      return;
    }

    if (checkbox.checked) {
      selectedUserIds.add(checkbox.value);
    } else {
      selectedUserIds.delete(checkbox.value);
    }
  });

  selectAllUsersButton.addEventListener('click', function () {
    selectedUserIds = new Set(users.map((user) => user.id));
    renderUsers();
  });

  clearUsersButton.addEventListener('click', function () {
    selectedUserIds.clear();
    renderUsers();
  });

  shadow.querySelector('.add-user').addEventListener('click', function () {
    addUser().catch((error) => addLog(error.message, 'error'));
  });

  shadow.querySelector('.export-users').addEventListener('click', exportUsers);
  shadow.querySelector('.import-users').addEventListener('click', function () {
    importFileInput.click();
  });
  importFileInput.addEventListener('change', function () {
    importUsers(importFileInput.files[0]);
  });
  shadow.querySelector('.switch-region').addEventListener('click', function () {
    switchRegion().catch((error) => addLog(error.message, 'error'));
  });

  userList.addEventListener('click', async function (event) {
    const openButton = event.target.closest('[data-open-user]');
    const deleteButton = event.target.closest('[data-delete-user]');

    if (openButton) {
      const user = users.find((item) => item.id === openButton.dataset.openUser);

      if (user?.originalUrl) {
        window.open(user.originalUrl, '_blank');
      }
    }

    if (deleteButton) {
      const user = users.find((item) => item.id === deleteButton.dataset.deleteUser);

      if (!user || !confirm(`确定删除用户“${user.name}”吗？`)) {
        return;
      }

      users = users.filter((item) => item.id !== user.id);
      selectedUserIds.delete(user.id);

      if (activeUserId === user.id) {
        activeUserId = users[0]?.id || '';
      }

      try {
        await saveUsers();
        addLog(`已删除用户“${user.name}”。`, 'success');
      } catch (error) {
        addLog(error.message, 'error');
      }
    }
  });

  breedingPartnerUserSelect.addEventListener('change', function () {
    const user = users.find((item) => item.id === breedingPartnerUserSelect.value);
    shadow.querySelector('.breeding-partner').value = user?.sso || '';
    breedingContext = null;
    breedingStartButton.disabled = true;
  });

  toolSelect.addEventListener('change', function () {
    shadow.querySelectorAll('.tool-page').forEach((page) => {
      page.classList.toggle('active', page.dataset.toolPage === toolSelect.value);
    });
    updateAccountControls(toolSelect.value);
  });

  singleActions.addEventListener('click', function (event) {
    const button = event.target.closest('[data-single-action]');

    if (!button) {
      return;
    }

    const actions = {
      info: getUserInfo,
      sign: performSignIn,
      points: checkTaskProgress,
      withdraw: withdrawMoney,
      bless: blessAllFriends,
      ladder: performLadder,
      'guild-money': guildDonate,
      'guild-yuanbao': guildDonateYuanbao,
      'guild-sign': guildSignIn,
      rewards: claimAllRewards,
      family: performFamilyFight,
      bait: performBirdBait
    };
    const action = actions[button.dataset.singleAction];

    if (action) {
      runButtonTask(button, '执行中...', action);
    }
  });

  ladderNormalButton.addEventListener('click', function () {
    runAdvancedLadder(false);
  });

  batchBlessButton.addEventListener('click', function () {
    runButtonTask(batchBlessButton, '祝福中...', () => runForSelectedUsers('批量祝福', blessAllFriends));
  });

  ladderVipButton.addEventListener('click', function () {
    runAdvancedLadder(true);
  });

  plantStartButton.addEventListener('click', startPlantBird);
  plantLoadPropsButton.addEventListener('click', loadPlantProps);
  plantStopButton.addEventListener('click', function () {
    plantRunning = false;
    plantStatus.textContent = '正在停止...';
    addLog('已请求停止种鸟，等待当前步骤完成。');
  });

  breedingLoadButton.addEventListener('click', loadBreedingBirds);
  breedingStartButton.addEventListener('click', startBreeding);
  breedingStopButton.addEventListener('click', function () {
    breedingRunning = false;
    addLog('已请求停止配鸟，等待当前步骤完成。');
  });

  newYearButton.addEventListener('click', function () {
    runButtonTask(newYearButton, '拜年中...', () => runForSelectedUsers('一键拜年', performNewYear));
  });

  redpacketButton.addEventListener('click', function () {
    runButtonTask(redpacketButton, '抢红包中...', () => runForSelectedUsers('一键红包', grabRedpackets));
  });

  guildWarButton.addEventListener('click', startGuildWar);
  birdSearchInput.addEventListener('input', function () {
    searchBirdBook(birdSearchInput.value);
  });

  clearButton.addEventListener('click', function () {
    logs.innerHTML = '<div class="log info">等待操作...</div>';
  });

  const plantBaitSelect = shadow.querySelector('.plant-bait');

  for (const bait of BAIT_LIST) {
    const option = document.createElement('option');
    option.value = String(bait.id);
    option.textContent = `${bait.name}（${bait.birds}）- ${bait.price} 金币`;
    plantBaitSelect.appendChild(option);
  }

  plantBaitSelect.value = '1';
  ball.setAttribute('aria-expanded', 'false');
  updateAccountControls(toolSelect.value);
  (document.body || document.documentElement).appendChild(root);
  loadUsers().catch((error) => {
    addLog(`${error.message}；为避免把账户信息写入本站，用户管理已停用。`, 'error');
    renderUsers();
  });
})();
