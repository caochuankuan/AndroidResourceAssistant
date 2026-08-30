const UPSTREAM_ORIGIN = 'http://116.62.238.93';

const ALLOWED_PATHS = new Set([
  '/api/register',
  '/api/login',
  '/api/save',
  '/api/redeem/claim',
]);

function jsonResponse(body, status) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function proxyApi(request, requestUrl) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, msg: '请求方法不支持' }, 405);
  }

  if (!ALLOWED_PATHS.has(requestUrl.pathname)) {
    return jsonResponse({ ok: false, msg: '接口不存在' }, 404);
  }

  const origin = request.headers.get('Origin');
  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ ok: false, msg: '不允许跨站请求' }, 403);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return jsonResponse({ ok: false, msg: '请求内容必须是 JSON' }, 415);
  }

  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, UPSTREAM_ORIGIN);
  const upstreamRequest = new Request(upstreamUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: request.body,
    redirect: 'manual',
  });

  try {
    const upstreamResponse = await fetch(upstreamRequest);
    const headers = new Headers({
      'Cache-Control': 'no-store',
      'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error(JSON.stringify({
      message: 'upstream request failed',
      path: requestUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    }));
    return jsonResponse({ ok: false, msg: '上游接口暂时无法连接' }, 502);
  }
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname.startsWith('/api/')) {
      return proxyApi(request, requestUrl);
    }

    return env.ASSETS.fetch(request);
  },
};
