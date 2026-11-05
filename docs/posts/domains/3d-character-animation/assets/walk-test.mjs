// 行走长测：20 只羊全设 Walk，固定步长 1/60 秒跑 36000 步（模拟 10 分钟），每 0.5 秒采样。
// 用 Playwright 打开原项目的牧场页（本站 demo 页同样可用），页面路径换成了占位。
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
await p.goto('<牧场页地址>');
await p.waitForTimeout(1000);
const res = await p.evaluate(() => {
  const r = ranch; r.renderer.setAnimationLoop(null);          // 停掉实时循环，改用固定步长
  const W = r.World, flock = r.flock, ctx = { world: W, flock };
  for (let i = 0; i < 9; i++) { r.select(0); r.duplicateSelected(); }
  r.select(null);
  flock.forEach(s => s.setAction('Walk'));
  const dt = 1 / 60, steps = 60 * 600;
  let invalid = 0, nan = 0, overlaps = 0;
  const lastPos = flock.map(s => ({ x: s.position.x, z: s.position.z }));
  const travelled = flock.map(() => 0), window30 = flock.map(() => []);
  for (let i = 0; i < steps; i++) {
    for (const s of flock) s.update(dt, ctx);
    if (i % 30 === 0) {
      flock.forEach((s, k) => {
        const { x, z } = s.position;
        if (!isFinite(x) || !isFinite(z) || !isFinite(s.position.y)) nan++;
        if (!W.isWalkable(x, z, -0.31)) invalid++;
        travelled[k] += Math.hypot(x - lastPos[k].x, z - lastPos[k].z); lastPos[k] = { x, z };
        window30[k].push({ x, z }); if (window30[k].length > 60) window30[k].shift();
      });
      for (let a = 0; a < flock.length; a++) for (let c = a + 1; c < flock.length; c++) {
        const d = Math.hypot(flock[a].position.x - flock[c].position.x, flock[a].position.z - flock[c].position.z);
        if (d < 0.55) overlaps++;
      }
    }
  }
  const stuck = window30.map(w => Math.hypot(w[0].x - w[w.length - 1].x, w[0].z - w[w.length - 1].z)).filter(d => d < 1.0).length;
  const badPose = flock.filter(s => s.legs.some(l => !isFinite(l.hip.rotation.x) || !isFinite(l.knee.rotation.x))).length;
  return { n: flock.length, invalid, nan, overlaps, stuck, badPose, avgTravel: (travelled.reduce((a, b) => a + b, 0) / flock.length).toFixed(1) };
});
console.log(res);
await b.close();
