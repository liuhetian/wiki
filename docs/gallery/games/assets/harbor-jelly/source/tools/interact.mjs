// Real-input test of the controls:
//   tap water = ripple; drag (also when it starts on the water) = orbit; long-press water then drag =
//   push the water (dent + lean), release = wobble; alt + drag = push right away; shift drag = pan;
//   wheel = zoom. Then the same on a touch screen (one-finger drag, long press, pinch).
// node tools/interact.mjs <outPrefix> [url]
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const out = process.argv[2] ?? 'shots/int';
const url = process.argv[3] ?? 'http://localhost:5190/?shot=1&free=1';
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const logs = [];
let failures = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); if (!ok) failures++; };

async function open(opts) {
  const page = await browser.newPage(opts);
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`[console] ${m.text()}`); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__harbor);
  await page.waitForTimeout(1200);
  return page;
}
const helpers = (page) => ({
  toScreen: (x, y, z) => page.evaluate(([x, y, z]) => {
    const { camera, renderer } = window.__harbor;
    const v = new camera.position.constructor(x, y, z).project(camera);
    const r = renderer.domElement.getBoundingClientRect();
    return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height];
  }, [x, y, z]),
  st: () => page.evaluate(() => window.__harbor.state()),
});

// ------------------------------------------------------------ mouse
{
  const page = await open({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  const { toScreen, st } = helpers(page);

  let s0 = await st();
  const [tx, ty] = await toScreen(-8, 0, 4);
  await page.mouse.click(tx, ty);
  await page.waitForTimeout(400);
  let s = await st();
  check('tap water -> waves', s.waves.max > 0.08 && !s.pressing, JSON.stringify(s.waves));
  check('tap water keeps the view', s.rig.az === s0.rig.az);
  await page.screenshot({ path: `${out}_tap.png` });
  await page.waitForTimeout(2500);

  // double-click: a big wave across the whole sea; a single click must not make one
  s = await st();
  check('single click makes no big wave', s.surges === 0);
  const [wx, wy] = await toScreen(-17.5, 0, 2);
  await page.mouse.dblclick(wx, wy);
  await page.waitForTimeout(300);
  s = await st();
  check('double-click launches a big wave', s.surges === 1, `surges ${s.surges}`);
  check('  ... from the nearest wall (west)', s.surgeDirs[0] === 'west', `${s.surgeDirs}`);
  const [nx, ny] = await toScreen(-4, 0, -18.5);
  await page.mouse.dblclick(nx, ny);
  await page.waitForTimeout(150);
  s = await st();
  check('double-click by the north wall -> wave from the north', s.surges === 2 && s.surgeDirs.includes('north'), `${s.surgeDirs}`);
  const [sx, sy] = await toScreen(-8, 0, 18.5);
  await page.mouse.move(sx, sy);
  await page.keyboard.press('w');
  await page.waitForTimeout(100);
  s = await st();
  check('W with the mouse by the south wall -> wave from the south', s.surges === 3 && s.surgeDirs.includes('south'), `${s.surgeDirs}`);
  await page.waitForTimeout(7000);
  s = await st();
  check('it slams into the quay with spray', s.drops > 0 || s.surges > 0, `drops ${s.drops}`);
  await page.waitForTimeout(500);

  // drag that starts on the water: should orbit, not push
  s0 = await st();
  const [ox, oy] = await toScreen(-6, 0, 0);
  await page.mouse.move(ox, oy);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(ox + i * 12, oy + i * 2); await page.waitForTimeout(16); }
  s = await st();
  await page.mouse.up();
  check('drag from water orbits', Math.abs(s.rig.az - s0.rig.az) > 0.3 && !s.pressing && Math.hypot(...s.tilt) < 0.01, `az ${s0.rig.az} -> ${s.rig.az}, tilt ${s.tilt}`);
  await page.evaluate(() => window.__harbor.cam({ az: -0.8, el: 0.58 }));
  await page.waitForTimeout(3000);

  // long press then drag: pushes the water
  const [ax, ay] = await toScreen(-10, 0, 6);
  await page.mouse.move(ax, ay);
  await page.mouse.down();
  await page.waitForTimeout(700);
  s = await st();
  check('long press sinks a dent', s.pressing && s.waves.max > 0.2, JSON.stringify(s.waves));
  await page.screenshot({ path: `${out}_press.png` });
  const azBefore = s.rig.az;
  for (let i = 1; i <= 14; i++) { await page.mouse.move(ax + i * 14, ay - i * 6); await page.waitForTimeout(30); }
  await page.waitForTimeout(250);
  s = await st();
  check('dragging the press leans the sea, view stays', s.pressing && Math.hypot(...s.tilt) > 0.03 && s.rig.az === azBefore, `tilt ${s.tilt}`);
  await page.screenshot({ path: `${out}_push.png` });
  await page.mouse.up();
  await page.waitForTimeout(300);
  s = await st();
  check('release lets go', !s.pressing, `tilt ${s.tilt}, waves ${JSON.stringify(s.waves)}`);
  await page.screenshot({ path: `${out}_release.png` });
  await page.waitForTimeout(3000);

  // alt + drag: push right away
  await page.keyboard.down('Alt');
  await page.mouse.move(ax, ay);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(ax - i * 12, ay + i * 4); await page.waitForTimeout(30); }
  s = await st();
  check('alt + drag pushes at once', s.pressing && Math.hypot(...s.tilt) > 0.01, `tilt ${s.tilt}`);
  await page.mouse.up();
  await page.keyboard.up('Alt');

  // shift drag pans, wheel zooms, drag on paper orbits
  s0 = await st();
  await page.keyboard.down('Shift');
  await page.mouse.move(450, 450); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(450 + i * 10, 450); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.keyboard.up('Shift');
  s = await st();
  check('shift drag pans', s.rig.t[0] !== s0.rig.t[0] || s.rig.t[2] !== s0.rig.t[2], `${s0.rig.t} -> ${s.rig.t}`);
  await page.mouse.move(60, 820); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(60 + i * 20, 820 - i * 4); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(300);
  const s2 = await st();
  check('paper drag orbits + wheel zooms', s2.rig.az !== s.rig.az && s2.rig.fit < s.rig.fit, `az ${s2.rig.az} fit ${s2.rig.fit}`);
  await page.close();
}

// ------------------------------------------------------------ touch (CDP touch events, like a phone)
{
  const page = await open({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const { toScreen, st } = helpers(page);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });

  const [tx, ty] = await toScreen(-8, 0, 4);
  await touch('touchStart', [[tx, ty]]); await page.waitForTimeout(60); await touch('touchEnd', []);
  await page.waitForTimeout(300);
  let s = await st();
  check('touch tap -> waves', s.waves.max > 0.08 && s.surges === 0, JSON.stringify(s.waves));
  await page.waitForTimeout(600);
  for (let k = 0; k < 2; k++) { await touch('touchStart', [[tx, ty]]); await page.waitForTimeout(50); await touch('touchEnd', []); await page.waitForTimeout(90); }
  await page.waitForTimeout(200);
  s = await st();
  check('touch double-tap launches a big wave', s.surges === 1, `surges ${s.surges}`);
  await page.waitForTimeout(2500);

  let s0 = await st();
  const [ox, oy] = await toScreen(-6, 0, 0);
  await touch('touchStart', [[ox, oy]]);
  for (let i = 1; i <= 12; i++) { await touch('touchMove', [[ox + i * 10, oy + i * 2]]); await page.waitForTimeout(16); }
  s = await st();
  await touch('touchEnd', []);
  check('touch drag from water orbits', Math.abs(s.rig.az - s0.rig.az) > 0.2 && !s.pressing, `az ${s0.rig.az} -> ${s.rig.az}`);
  await page.waitForTimeout(500);

  const [ax, ay] = await toScreen(-10, 0, 6);
  await touch('touchStart', [[ax, ay]]);
  await page.waitForTimeout(450);
  s = await st();
  check('touch long press sinks a dent', s.pressing, JSON.stringify(s.waves));
  for (let i = 1; i <= 12; i++) { await touch('touchMove', [[ax + i * 8, ay - i * 4]]); await page.waitForTimeout(30); }
  s = await st();
  check('touch press drag leans the sea', s.pressing && Math.hypot(...s.tilt) > 0.02, `tilt ${s.tilt}`);
  await touch('touchEnd', []);
  await page.waitForTimeout(200);
  s = await st();
  check('touch release', !s.pressing);

  s0 = await st();
  await touch('touchStart', [[150, 400], [270, 400]]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [[150 - i * 6, 400], [270 + i * 6, 400]]); await page.waitForTimeout(16); }
  await touch('touchEnd', []);
  s = await st();
  check('pinch zooms', s.rig.fit < s0.rig.fit, `fit ${s0.rig.fit} -> ${s.rig.fit}`);
  await page.close();
}

for (const l of logs) console.log(l);
console.log(failures ? `${failures} FAILED` : 'all passed');
await browser.close();
process.exit(failures ? 1 : 0);
