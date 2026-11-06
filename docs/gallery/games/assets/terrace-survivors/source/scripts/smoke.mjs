// Headless smoke test: plays a run with a simple bot (walks in circles, jumps now and then, picks the first upgrade,
// opens chests it walks past) and fails on any page error. Usage:
//   node scripts/smoke.mjs [baseUrl] [biome] [seconds]
// Needs the dev server (npm run dev) or a preview server running.
import { chromium } from 'playwright-core';
import { homedir } from 'node:os';

const base = process.argv[2] ?? 'http://localhost:5180/';
const biome = process.argv[3] ?? 'meadow';
const seconds = Number(process.argv[4] ?? 45);

const browser = await chromium.launch({
  executablePath: `${homedir()}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('favicon') && errors.push(m.text()));

await page.goto(`${base}?biome=${biome}&seed=42&time=600`);
await page.waitForFunction(() => window.game && window.game.state === 'play', null, { timeout: 60000 });
const keys = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
let k = 0;
const t0 = Date.now();
await page.keyboard.down(keys[0]);
while ((Date.now() - t0) / 1000 < seconds) {
  await page.waitForTimeout(1500);
  // Turn a quarter: the hero walks a loop and kites the horde.
  await page.keyboard.up(keys[k % 4]);
  k++;
  await page.keyboard.down(keys[k % 4]);
  if (k % 3 === 0) await page.keyboard.press('Space');
  await page.keyboard.press('KeyE');
  const state = await page.evaluate(() => window.game.state);
  if (state === 'levelup') await page.keyboard.press('Digit1');
  if (state === 'dead' || state === 'win') break;
}
await page.keyboard.up(keys[k % 4]);
const stats = await page.evaluate(() => {
  const g = window.game;
  return {
    state: g.state,
    simTime: +g.director.time.toFixed(1),
    level: g.player.level,
    kills: g.player.kills,
    hp: Math.round(g.player.hp),
    coins: g.player.coins,
    enemies: g.enemies.alive,
    weapons: [...g.player.weapons.entries()].map(([id, lv]) => `${id}:${lv}`).join(' '),
  };
});
await page.screenshot({ path: `/tmp/ts-shots/smoke-${biome}.png` });
console.log(JSON.stringify(stats));
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
process.exit(errors.length ? 1 : 0);
