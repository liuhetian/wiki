// Headless screenshot helper: node scripts/shot.mjs <url> <out.png> [waitMs] [keys...]
// Uses the locally installed Playwright Chromium with GPU-less SwiftShader WebGL.
import { chromium } from 'playwright-core';
import { homedir } from 'node:os';

const [url, out, wait = '6000', ...actions] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: `${homedir()}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); else if (m.text().startsWith('[t]')) console.log(m.text()); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(Number(wait));
for (const a of actions) {
  const kind = a.slice(0, a.indexOf(':') < 0 ? a.length : a.indexOf(':'));
  let arg = a.indexOf(':') < 0 ? '' : a.slice(a.indexOf(':') + 1);
  let ms = '';
  const m = /:(\d+)$/.exec(arg);
  if (m) { ms = m[1]; arg = arg.slice(0, m.index); }
  if (kind === 'down') await page.keyboard.down(arg);
  else if (kind === 'up') await page.keyboard.up(arg);
  else if (kind === 'press') await page.keyboard.press(arg);
  else if (kind === 'click') { const [x, y] = arg.split(','); await page.mouse.click(Number(x), Number(y)); }
  else if (kind === 'clicktext') await page.getByText(arg, { exact: true }).first().click();
  else if (kind === 'eval') console.log('eval:', JSON.stringify(await page.evaluate(arg)));
  else if (kind === 'shot') await page.screenshot({ path: arg });
  if (ms) await page.waitForTimeout(Number(ms));
}
await page.screenshot({ path: out, fullPage: !!process.env.FULL });
console.log(errors.length ? errors.slice(0, 30).join('\n') : 'no console errors');
await browser.close();
