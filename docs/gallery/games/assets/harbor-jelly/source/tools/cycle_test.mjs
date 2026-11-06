// Fast-forward the harbour routine (free mode, timeScale 4) and log every state change of ship and cranes.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 480, height: 480 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto('http://localhost:5190/?shot=1&free=1', { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__harbor);
await page.evaluate(() => { window.__harbor.timeScale = 4; });
let last = '';
let wmax = 0;
const t0 = Date.now();
while (Date.now() - t0 < 50000) {
  const [s, w] = await page.evaluate(() => { const h = window.__harbor; return [`${h.ship.state} | ${h.harbor.cranes.map((c) => c.state + (c.contOnShip ? '(box:ship)' : '(box:land)')).join(' ')}`, h.water.waves.stats().max]; });
  wmax = Math.max(wmax, w);
  if (s !== last) { console.log(((Date.now() - t0) / 1000 * 4).toFixed(0).padStart(4) + 's', s); last = s; }
  await page.waitForTimeout(200);
}
await page.screenshot({ path: 'shots/cycle_end.png' });
console.log('highest simulated wave during the run:', wmax.toFixed(3));
console.log(errs.length ? errs : 'no page errors');
await browser.close();
