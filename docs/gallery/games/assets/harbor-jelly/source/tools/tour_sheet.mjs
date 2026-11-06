// Let the tour play and grab a frame every N seconds: node tools/tour_sheet.mjs <dir> [seconds=66] [every=2.5] [w=360] [h=640]
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const [dir = 'shots/tour', secs = '66', every = '2.5', w = '360', h = '640'] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto('http://localhost:5190/?shot=1', { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__harbor);
const n = Math.floor(+secs / +every);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const due = t0 + i * +every * 1000;
  await page.waitForTimeout(Math.max(0, due - Date.now()));
  await page.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.png` });
  const s = await page.evaluate(() => window.__harbor.state());
  console.log(i, ((Date.now() - t0) / 1000).toFixed(1), s.section, s.ship, s.cranes.join(','));
}
for (const l of logs) console.log(l);
await browser.close();
