// Screenshot the running app with headless Chromium.
// node tools/shot.mjs <out.png> [--w 540 --h 720 --url http://localhost:5189/ --wait 2500 --eval "js"]...
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const out = args[0];
const opt = { w: 540, h: 720, url: 'http://localhost:5190/?shot=1', wait: 2500, gpu: 'auto' };
const evals = [];
for (let i = 1; i < args.length; i += 2) {
  const k = args[i].replace(/^--/, '');
  if (k === 'eval') evals.push(args[i + 1]);
  else opt[k] = args[i + 1];
}
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell');
const gpuArgs = opt.gpu === 'swiftshader'
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ executablePath: exe, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: +opt.w, height: +opt.h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
const t0 = Date.now();
await page.goto(opt.url, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__harbor, null, { timeout: 60000 });
const info = await page.evaluate(() => {
  const gl = document.querySelector('canvas').getContext('webgl2');
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
for (const e of evals) {
  if (e.startsWith('wait:')) { await page.waitForTimeout(+e.slice(5)); continue; }
  if (e.startsWith('shot:')) {
    await page.screenshot({ path: e.slice(5) });
    console.log(e.slice(5), await page.evaluate(() => JSON.stringify(window.__harbor.state())));
    continue;
  }
  await page.evaluate(e);
}
await page.waitForTimeout(+opt.wait);
const fps = await page.evaluate(() => new Promise((res) => {
  let n = 0; const t = performance.now();
  const f = () => { n++; if (performance.now() - t < 1000) requestAnimationFrame(f); else res(n); };
  requestAnimationFrame(f);
}));
await page.screenshot({ path: out });
const state = await page.evaluate(() => JSON.stringify(window.__harbor.state()));
console.log(JSON.stringify({ out, renderer: info, fps, state: JSON.parse(state), ms: Date.now() - t0 }));
for (const l of logs.slice(0, 20)) console.log(l);
await browser.close();
