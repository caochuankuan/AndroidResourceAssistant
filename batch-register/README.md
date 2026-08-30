# 批量注册工具

用于批量创建账号、初始化存档，并实时查看三个兑换码的领取结果。网页和 API 代理均部署在 Cloudflare，运行时不需要本地 Node.js、端口或 PM2。

## 功能

- 根据用户名开头生成连续账号，例如 `account1`、`account2`、`account3`
- 最终用户名必须是 `6–20` 位数字、英文字母或符号
- 所有账号使用同一个 `6–32` 位密码
- 用户名和密码不允许包含中文或空格
- 可同时处理 `1`、`2`、`3` 或 `5` 个账号
- 自动完成注册、登录和初始存档保存
- 自动兑换 `再见小鸟`、`VIP8888` 和 `VIP2345`
- 实时显示每个账号的处理结果
- 支持停止、重试未完成账号和导出 CSV

## 工作方式

页面只请求当前 Cloudflare 站点的同源 `/api/*` 地址。仓库根目录下的 `_worker.js` 会在 Cloudflare Workers Runtime 中将请求转发到：

```text
http://116.62.238.93
```

请求链路：

```text
浏览器 → Cloudflare /api/* → 116.62.238.93/api/*
```

浏览器不会直接访问目标 IP，因此不会遇到目标服务器的 CORS 或 HTTPS 混合内容限制。

代理只允许以下 POST 路径：

- `/api/register`
- `/api/login`
- `/api/save`
- `/api/redeem/claim`

其他路径和请求方法会被拒绝。

## Cloudflare 部署

该项目按 Cloudflare Pages Advanced Mode 配置。根目录 `_worker.js` 使用 Cloudflare Workers Runtime，同时通过 `env.ASSETS` 继续提供原有静态网站，不需要单独创建 Node 服务。

需要部署的关键文件：

```text
_worker.js
```

将代码推送到 Cloudflare Pages 绑定的 Git 分支后，Cloudflare 会同时部署静态网页和 Function。

部署完成后，通过 Cloudflare 网站地址访问：

```text
https://你的域名/batch-register/
```

### Cloudflare Pages 设置

如果项目没有构建步骤，保持当前静态站点设置即可：

- Framework preset：`None`
- Build command：留空
- Build output directory：项目当前使用的静态输出目录
- Worker entry：输出目录根部的 `_worker.js`，Cloudflare 会自动识别

如果当前部署设置使用了其他输出目录，确保 `batch-register` 页面仍会被复制到该输出目录。

## 本地开发

本地预览 Cloudflare Function 需要 Node.js 和 Wrangler，但不需要 PM2。

在项目根目录执行：

```bash
npx wrangler@latest pages dev .
```

Wrangler 输出本地地址后，通过该地址访问：

```text
/batch-register/
```

不要直接双击 `index.html`。直接打开文件时不存在同源 `/api` Function。

## 页面使用方法

1. 填写用户名开头，确保生成后的账号长度为 `6–20` 位。
2. 填写注册数量，范围为 `1–500`。
3. 填写所有账号共用的 `6–32` 位密码。
4. 选择同时处理数量。接口不稳定时建议选择 `1` 或 `2`。
5. 点击“开始批量注册”。
6. 在结果表格中实时查看基础流程和三个兑换结果。
7. 任务结束后，可重试未完成账号或导出 CSV。

运行过程中可以停止任务。已经成功的步骤会保留，重试时会从未完成步骤继续。

## 账号处理流程

每个账号依次执行：

1. 注册账号；
2. 登录并获取令牌；
3. 保存初始存档；
4. 兑换 `再见小鸟`；
5. 兑换 `VIP8888`；
6. 兑换 `VIP2345`。

单个兑换码失败不会阻止后续兑换码继续执行。

## 目录结构

```text
_worker.js                   # Cloudflare Worker API 代理和静态资源入口

batch-register/
├── index.html               # 页面结构
├── style.css                # 页面样式
├── app.js                   # 注册、初始化、兑换及结果汇总逻辑
└── README.md                # 使用说明
```

## 故障排查

### 部署后 `/api` 返回 404

检查：

1. `_worker.js` 是否位于 Cloudflare 的构建输出目录根部；
2. Cloudflare 是否完成了最新提交的部署；
3. Pages 项目的构建根目录是否仍为仓库根目录；
4. 项目是否存在 `_routes.json` 并排除了 `/api/*`。

### 页面打开正常，但请求返回 502

这表示 Cloudflare Function 已运行，但无法连接上游接口。检查 `http://116.62.238.93` 是否可访问，并在 Cloudflare 控制台查看 Functions 日志。

### 请求返回 403

代理会拒绝跨站调用。请通过部署后的 Cloudflare 网站打开批量注册页面，不要从其他域名调用 `/api/*`。

### 注册成功但兑换失败

可能原因包括兑换码已领取、兑换码失效、初始化失败或目标接口暂时异常。将鼠标停留在失败状态上可查看错误信息，之后可以使用“重试未完成”。

## 安全说明

- 密码只用于当前任务，不会写入浏览器本地存储。
- Worker 不会记录请求体、账号、密码或登录令牌。
- 代理使用固定上游地址和接口白名单，不支持任意 URL 转发。
- 上游响应以流式方式返回，不在 Worker 中缓存。
- CSV 文件包含账号信息，请妥善保管。
