// 腾讯云 API 3.0（TC3-HMAC-SHA256）最小调用；主账号密钥从 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY 读，不打印
import { createHash, createHmac } from 'node:crypto';

export function credentials() {
  const secretId = process.env.TENCENTCLOUD_SECRET_ID;
  const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;
  if (!secretId || !secretKey) throw new Error('缺 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY（主账号密钥，只在本机用）');
  return { secretId, secretKey };
}

export async function tc3(service, version, action, body = {}) {
  const { secretId, secretKey } = credentials();
  const host = `${service}.tencentcloudapi.com`;
  const payload = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000);
  const date = new Date(ts * 1000).toISOString().slice(0, 10);
  const sha = (s) => createHash('sha256').update(s).digest('hex');
  const hmac = (k, s) => createHmac('sha256', k).update(s).digest();
  const canonical = ['POST', '/', '', `content-type:application/json\nhost:${host}\n`, 'content-type;host', sha(payload)].join('\n');
  const scope = `${date}/${service}/tc3_request`;
  const toSign = ['TC3-HMAC-SHA256', ts, scope, sha(canonical)].join('\n');
  const signature = createHmac('sha256', hmac(hmac(hmac('TC3' + secretKey, date), service), 'tc3_request')).update(toSign).digest('hex');
  const res = await fetch(`https://${host}`, {
    method: 'POST',
    headers: {
      Authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${scope}, SignedHeaders=content-type;host, Signature=${signature}`,
      'Content-Type': 'application/json',
      Host: host,
      'X-TC-Action': action,
      'X-TC-Version': version,
      'X-TC-Timestamp': String(ts),
    },
    body: payload,
  });
  return (await res.json()).Response;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
