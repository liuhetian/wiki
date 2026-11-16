// 全站上锁：校验 X-Password 或 30 天签名 cookie → 用只读子账号签名读私有 COS → 原样返回
// 环境变量：SITE_PASSWORD、COOKIE_SECRET、READER_SECRET_ID、READER_SECRET_KEY、COS_HOST
// 部署时拷成 edge-functions/[[default]].js，再加一个转发它的 index.js 管根路径 /

const COOKIE = 'eo_lock';
const MAX_AGE = 30 * 24 * 3600;
const enc = new TextEncoder();

const AI_HINT = `此站点需要访问密码。
请从运行环境读取 WIKI_PASSWORD，并将其值放入 X-Password 请求头后重试。
如果环境变量尚未设置，请向使用者获取访问密码。
`;

// 受保护内容不进任何共享缓存
const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
};

const TYPES = {
  html: 'text/html; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  json: 'application/json; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  svg: 'image/svg+xml',
};

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

async function hmac(hash, key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}

async function sha1hex(s) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-1', enc.encode(s))));
}

function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// 两边先过同一个 HMAC 再比，长度不泄露
async function passwordOk(env, given) {
  if (!given) return false;
  const a = await hmac('SHA-256', env.COOKIE_SECRET, 'pw:' + given);
  const b = await hmac('SHA-256', env.COOKIE_SECRET, 'pw:' + env.SITE_PASSWORD);
  return sameBytes(a, b);
}

// cookie = v1.<过期时间>.<HMAC>；密钥里混进站点密码，改密码即全部失效
async function cookieFor(env, exp) {
  const mac = await hmac('SHA-256', env.COOKIE_SECRET + '\n' + env.SITE_PASSWORD, 'v1.' + exp);
  return `v1.${exp}.${hex(mac)}`;
}

async function cookieOk(env, request) {
  const m = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)eo_lock=([^;]+)/);
  if (!m) return false;
  const [v, exp] = m[1].split('.');
  if (v !== 'v1' || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return sameBytes(enc.encode(await cookieFor(env, exp)), enc.encode(m[1]));
}

async function setCookie(env) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${COOKIE}=${await cookieFor(env, exp)}; Max-Age=${MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

// COS v5 签名：只签 host 头，十分钟有效
async function cosAuthorization(env, method, path) {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now - 60};${now + 600}`;
  const signKey = hex(await hmac('SHA-1', env.READER_SECRET_KEY, keyTime));
  const httpString = `${method.toLowerCase()}\n${path}\n\nhost=${encodeURIComponent(env.COS_HOST.toLowerCase())}\n`;
  const stringToSign = `sha1\n${keyTime}\n${await sha1hex(httpString)}\n`;
  const signature = hex(await hmac('SHA-1', signKey, stringToSign));
  return `q-sign-algorithm=sha1&q-ak=${env.READER_SECRET_ID}&q-sign-time=${keyTime}&q-key-time=${keyTime}` +
    `&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const safeNext = (s) => (typeof s === 'string' && s.startsWith('/') && !s.startsWith('//') ? s : '/');

function loginPage(next, error) {
  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>需要密码</title>
<style>
body{font:16px/1.6 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f5f5f4;color:#1c1917}
form{background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 12px #0001;width:min(90vw,320px)}
h1{font-size:1.2rem;margin:0 0 .25rem}p{margin:0 0 1rem;color:#78716c;font-size:.9rem}
input{width:100%;box-sizing:border-box;padding:.6rem;font-size:1rem;border:1px solid #d6d3d1;border-radius:8px}
button{margin-top:1rem;width:100%;padding:.6rem;font-size:1rem;border:0;border-radius:8px;background:#1c1917;color:#fff;cursor:pointer}
.err{color:#b91c1c;margin:.5rem 0 0}
</style></head>
<body><form method="post" action="/__login">
<h1>这个站需要密码</h1><p>输对一次，30 天内不用再输。</p>
<input type="password" name="password" autocomplete="current-password" autofocus required>
<input type="hidden" name="next" value="${escapeHtml(next)}">
${error ? `<p class="err">${escapeHtml(error)}</p>` : ''}
<button>进入</button>
</form></body></html>`;
  return new Response(html, { status: 401, headers: { 'Content-Type': TYPES.html, ...NO_STORE } });
}

const text = (body, status, extra = {}) =>
  new Response(body, { status, headers: { 'Content-Type': TYPES.txt, ...NO_STORE, ...extra } });

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // 密码和 cookie 都在请求里，明文 HTTP 一律先跳 HTTPS
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return new Response(null, { status: 308, headers: { Location: url.href, ...NO_STORE } });
  }
  if (!env.SITE_PASSWORD || !env.COOKIE_SECRET) return text('站点配置缺失\n', 500); // 缺配置一律关门
  const wantsHtml = (request.headers.get('Accept') || '').includes('text/html');

  if (url.pathname === '/__login') {
    if (request.method !== 'POST') return Response.redirect(new URL('/', url), 303);
    const form = new URLSearchParams(await request.text());
    const next = safeNext(form.get('next'));
    if (!(await passwordOk(env, form.get('password')))) return loginPage(next, '密码不对');
    return new Response(null, { status: 303, headers: { Location: next, 'Set-Cookie': await setCookie(env), ...NO_STORE } });
  }
  if (url.pathname === '/__logout') {
    return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`, ...NO_STORE } });
  }

  // 鉴权：请求头里的密码优先，其次 cookie
  let issueCookie = false;
  const headerPw = request.headers.get('X-Password');
  if (headerPw !== null) {
    if (!(await passwordOk(env, headerPw))) return text('X-Password 不对。\n', 401);
    issueCookie = true; // 顺手发 cookie，curl -c / HTTP session 可以复用
  } else if (!(await cookieOk(env, request))) {
    // 看请求要什么，不猜它是谁：要 HTML 的给登录页，其余给 AI 的文字提示
    return wantsHtml ? loginPage(url.pathname + url.search) : text(AI_HINT, 401);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') return text('只支持 GET / HEAD\n', 405);
  if (!env.READER_SECRET_ID || !env.READER_SECRET_KEY || !env.COS_HOST) return text('源站读取配置缺失\n', 500);

  let path = decodeURIComponent(url.pathname);
  // 目录式网址：/foo 没有扩展名就补斜杠，交给下一次请求读 /foo/index.html
  if (!path.endsWith('/') && !path.split('/').pop().includes('.')) {
    url.pathname += '/';
    return new Response(null, { status: 301, headers: { Location: url.pathname + url.search, ...NO_STORE } });
  }
  if (path.endsWith('/')) path += 'index.html';
  const res = await fetch(`https://${env.COS_HOST}${encodeURI(path)}`, {
    method: request.method,
    headers: { Authorization: await cosAuthorization(env, request.method, path) },
  });
  if (!res.ok) return text(res.status === 404 || res.status === 403 ? '没有这个文件\n' : `源站返回 ${res.status}\n`, res.status === 403 ? 404 : res.status);

  const ext = path.split('.').pop().toLowerCase();
  const headers = new Headers({ 'Content-Type': TYPES[ext] || res.headers.get('Content-Type') || 'application/octet-stream', ...NO_STORE });
  if (issueCookie) headers.set('Set-Cookie', await setCookie(env));
  return new Response(request.method === 'HEAD' ? null : res.body, { status: 200, headers });
}
