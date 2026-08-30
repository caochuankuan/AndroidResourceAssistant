'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 8765;
const HOST = '0.0.0.0';
const API_HOST = '116.62.238.93';
const projectRoot = path.resolve(__dirname, '..');
let batchRegistrationEnabled = true;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function send(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

function proxyApi(request, response) {
  const upstream = http.request({
    hostname: API_HOST,
    port: 80,
    path: request.url,
    method: request.method,
    headers: {
      accept: 'application/json',
      'content-type': request.headers['content-type'] || 'application/json',
    },
  }, upstreamResponse => {
    response.writeHead(upstreamResponse.statusCode || 502, {
      'Content-Type': upstreamResponse.headers['content-type'] || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    upstreamResponse.pipe(response);
  });

  upstream.setTimeout(25000, () => upstream.destroy(new Error('上游接口请求超时')));
  upstream.on('error', error => {
    if (!response.headersSent) {
      send(response, 502, JSON.stringify({ ok: false, msg: error.message }), 'application/json; charset=utf-8');
    } else {
      response.end();
    }
  });
  request.pipe(upstream);
}

function handleBatchSwitch(request, response, requestUrl) {
  if (request.method === 'GET') {
    return send(response, 200, JSON.stringify({ enabled: batchRegistrationEnabled }), 'application/json; charset=utf-8');
  }

  if (request.method !== 'POST') return send(response, 405, '请求方法不支持');

  const enabled = requestUrl.searchParams.get('enabled');
  if (!['0', '1'].includes(enabled)) {
    return send(response, 400, JSON.stringify({ ok: false, msg: '开关参数无效' }), 'application/json; charset=utf-8');
  }

  batchRegistrationEnabled = enabled === '1';
  return send(response, 200, JSON.stringify({ ok: true, enabled: batchRegistrationEnabled }), 'application/json; charset=utf-8');
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || HOST}`);
  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    return send(response, 400, '无效路径');
  }

  if (!batchRegistrationEnabled && ['/', '/batch-register', '/batch-register/', '/batch-register/index.html'].includes(pathname)) {
    return send(response, 403, '批量注册功能已关闭');
  }

  if (pathname === '/') pathname = '/batch-register/';
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.resolve(projectRoot, `.${pathname}`);
  if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${path.sep}`)) {
    return send(response, 403, '禁止访问');
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return send(response, 404, '页面不存在');
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') return response.end();
    return fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || HOST}`);

  if (requestUrl.pathname === '/internal/batch-register-switch') {
    return handleBatchSwitch(request, response, requestUrl);
  }

  if (request.url === '/api' || request.url.startsWith('/api/')) {
    if (!batchRegistrationEnabled) {
      return send(response, 403, JSON.stringify({ ok: false, msg: '批量注册功能已关闭' }), 'application/json; charset=utf-8');
    }
    if (request.method !== 'POST') return send(response, 405, 'API 仅支持 POST');
    return proxyApi(request, response);
  }
  if (!['GET', 'HEAD'].includes(request.method)) return send(response, 405, '请求方法不支持');
  return serveStatic(request, response);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请先关闭占用该端口的程序。`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`批量注册页面：http://${HOST}:${PORT}/batch-register/`);
  console.log('按 Ctrl+C 停止服务');
});
