---
name: chromatic-glitch
description: >
  瞬间恢复清晰的 RGB 分离 / 切片故障效果 —— 错位的彩色副本按量化后 timeline 时间的确定性哈希抖动（绝不用 Math.random），或者水平切片先错位再汇合；短暂的震颤之后干净地归位。用作入场或强调的标点；有限时长、seek 安全。
metadata:
  tags: glitch, rgb-split, chromatic, slice, jitter, stutter, text, snap, distortion
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/chromatic-glitch.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 色差故障

把数字干扰当作标点：在零点几秒内，元素**碎裂** —— 错位的彩色副本在它身后颤动，或者水平切片向侧面错位 —— 然后它**瞬间恢复清晰**并干净地停住。回报在于归位；故障的存在是为了让干净的状态落得更有力。两种形式：**RGB 分离抖动**（暖色 + 冷色的残影副本在基础层身后震颤）和**切片错位**（水平条带以错位状态到场，然后汇合）。

边界：[motion-blur-streak.md](motion-blur-streak.md) 是与**移动**绑定的速度模糊 —— 它的元素正快速去往某处。发生故障的元素是**原地不动**的；扰动是时间上的，不是方向上的。[hacker-flip-3d.md](hacker-flip-3d.md) 替换的是**字形**（一种解码效果）；这里字形是固定的，只有它们错位的副本在动。

## 原理

主体是层叠的：**基础副本在最上层**（每一帧都完全可读），残影副本在后面。所有运动都来自一个有限时长的**幅度包络** tween，由一个 `onUpdate` 读取：

1. **量化时间** —— `const step = Math.floor(tl.time() / JITTER_STEP)`。卡顿感来自那些保持 `JITTER_STEP` 再跳变的偏移。平滑插值的偏移读起来像晃动，而不是故障 —— **量化本身「就是」数字质感**。
2. **确定性哈希** —— 偏移是 `(step, layerIndex)` 的纯函数：

   ```js
   const glitchHash = (n) => {
     const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
     return x - Math.floor(x); // 0..1, pure — a scrub to any t recomputes the same frame
   };
   ```

3. **幅度包络** —— 一个代理 tween 在 `GLITCH_DUR` 内承载 `amp: 1 → 0`。每帧的偏移 = `amp × (glitchHash(step * 13 + layer * 7) * 2 − 1) × MAX_SPLIT`。包络降到零时，副本恰好位于 0 —— 瞬间清晰已经内建在数学里，而最后的一个 `tl.set` 再把静止状态钳死，让停留状态逐位精确。

**切片形式**把彩色副本换成 `SLICE_COUNT` 个完整副本，每个通过 `clip-path: inset()` 裁成一条水平条带；每条带的 `x`（以及可选的 `scaleX` 拉伸）从哈希推导出的偏移开始，在阶梯式 ease 下汇合到 0。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<!-- Form A: RGB-split — ghosts behind, base on top. Copies metric-identical (one grid cell, same font stack); aria-hidden on every non-base copy. -->
<div class="glitch-stack" id="glitch-stack">
  <span class="glitch-copy warm" aria-hidden="true">{glitchText}</span>
  <span class="glitch-copy cool" aria-hidden="true">{glitchText}</span>
  <span class="glitch-base">{glitchText}</span>
</div>
```

```css
.glitch-stack {
  display: grid; /* all copies share one cell — pixel-identical boxes */
}
.glitch-base,
.glitch-copy {
  grid-area: 1 / 1;
}
.glitch-base {
  z-index: 2; /* grid items take z-index without position */
  color: {textColor};
}
.glitch-copy {
  z-index: 1;
  opacity: 0; /* raised only while the envelope is live */
  will-change: transform; /* updates every frame while live */
  mix-blend-mode: screen; /* additive on dark bg; drop to normal (and lower opacity) on light */
}
.glitch-copy.warm {
  color: {warmSplit}; /* classic: red/orange */
}
.glitch-copy.cool {
  color: {coolSplit}; /* classic: cyan/blue */
}
```

```js
// Form A: RGB-split jitter — envelope snaps to full amplitude, decays to zero.
// All per-frame state derives from tl.time() + the envelope: pure, replays on seek.
const copies = gsap.utils.toArray("#glitch-stack .glitch-copy");
const amp = { a: 0 };
tl.set(amp, { a: 1 }, GLITCH_START);
tl.set(copies, { opacity: SPLIT_OPACITY }, GLITCH_START);
tl.to(
  amp,
  {
    a: 0,
    duration: GLITCH_DUR,
    ease: "power3.in", // most of the violence up front, dying fast
    onUpdate: () => {
      const step = Math.floor(tl.time() / JITTER_STEP); // quantized — the stutter
      copies.forEach((el, layer) => {
        const jx = (glitchHash(step * 13 + layer * 7) * 2 - 1) * MAX_SPLIT * amp.a;
        const jy = (glitchHash(step * 29 + layer * 11) * 2 - 1) * MAX_SPLIT * 0.35 * amp.a;
        gsap.set(el, { x: jx, y: jy });
      });
    },
  },
  GLITCH_START,
);
// The clean resolve: clamp ghosts to exact rest — never rely on the decay
// landing on zero. A ghost left 1px off reads as a bug every frame after.
tl.set(copies, { x: 0, y: 0, opacity: 0 }, GLITCH_START + GLITCH_DUR);

// Form B: slice displacement — N band copies of the same content converge.
const slices = gsap.utils.toArray("#slice-stack .slice");
const bandH = 100 / slices.length;
slices.forEach((el, i) => {
  gsap.set(el, { clipPath: `inset(${i * bandH}% 0 ${100 - (i + 1) * bandH}% 0)` });
  const dir = glitchHash(i * 3 + 1) > 0.5 ? 1 : -1;
  tl.fromTo(
    el,
    {
      x: dir * (SLICE_OFFSET_MIN + glitchHash(i * 5 + 2) * (SLICE_OFFSET_MAX - SLICE_OFFSET_MIN)),
      scaleX: 1 + glitchHash(i * 7 + 3) * SLICE_STRETCH,
      opacity: 1,
    },
    { x: 0, scaleX: 1, duration: SLICE_RESOLVE_DUR, ease: "steps(SLICE_STEPS)" },
    SLICE_START + glitchHash(i * 11 + 4) * SLICE_JITTER_LAG,
  );
});
```

## 变体

- **故障拉伸入场** —— 元素一边故障一边「入场」：在包络运行期间，对整个堆叠叠加一个 `fromTo(stack, { scaleX: STRETCH_FROM, opacity: 0 }, { scaleX: 1, opacity: 1, duration: GLITCH_DUR, ease: "power4.out" })`（`STRETCH_FROM` 取 1.3–1.8）。拉伸、分离和包络在同一帧全部消失 —— 这个词就这样清晰地*出现*在那里。
- **在停住的词上做强调爆发** —— 是一阵痉挛，而不是一次到场：2–3 个短包络（每个 `GLITCH_DUR` 约 0.12–0.2s），中间隔着约 0.2–0.4s 的干净间隙，每个都是独立的 `set(amp)/to(amp)/set(rest)` 三件套。爆发之间的干净帧让它读起来是能量，而不是渲染故障。
- **切片揭示** —— 把形式 B 本身当作到场方式：条带一开始不透明但处于错位状态，在阶梯式 ease 下汇合。去掉彩色副本就是单色版本 —— 本规则克制的企业风格读法。
- **卡片 / 非文字故障** —— 层叠副本这套机制与内容无关（logo lockup、小卡片都行）。让 `MAX_SPLIT` 按比例取值（约为元素宽度的 1%）—— 过大的分离读起来像布局坏了，而不是信号干扰。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| MAX_SPLIT | 标题字号下 4–14px（约 0.06–0.1em） | 竖直方向约为水平方向的 35%；峰值时基础层必须仍然可读 |
| JITTER_STEP | 1/30–1/12 s | 越短 = 狂乱的嗡鸣，越长 = VHS 式卡顿；**≥ 一个渲染帧**，否则量化会消失 |
| GLITCH_DUR | 入场 0.25–0.6s；爆发 0.12–0.2s | ≥ 约 1s 时就不再读作一个事件，而开始读作渲染出错 |
| SPLIT_OPACITY | 0.5–0.9（深色背景上用 screen） | 浅色背景上不混合时用 0.35–0.6 —— 白底上的 screen 是看不见的 |
| SLICE_COUNT | 4–10 | 越多 = 撕裂越细，超过约 10 后收益递减 |
| SLICE_OFFSET_MIN / MAX | 12–60px | 每条带的值从 `glitchHash(i)` 推导，绝不统一 —— 偏移都相同读起来很机械 |
| SLICE_STRETCH | 0–0.5 | 0 是纯错位；约 0.3 读起来像被拉伸的扫描线 |
| SLICE_RESOLVE_DUR / SLICE_STEPS / JITTER_LAG | 0.2–0.4s / 3–6 / 每条带 ≤0.08s | 阶梯式 ease 让落定过程保持数字感 |
| {warmSplit} / {coolSplit} | — | 经典的红 / 青；任何一对相对的暖色 + 冷色品牌色都成立 |

## 关键约束

- **量化时间 —— 卡顿本身「就是」效果。** 偏移保持 `JITTER_STEP` 再跳变；如果故障看起来像果冻，说明你做了插值。`JITTER_STEP` 必须 ≥ 一个渲染帧，否则量化会悄无声息地消失。
- **（量化时间，索引）的纯函数** —— 每帧的每个值都来自 `glitchHash`；哈希的输入只用 `tl.time()`，别无其他。
- **钳死静止状态** —— 在包络结束时对残影执行 `tl.set({ x: 0, y: 0, opacity: 0 })`；绝不依赖衰减恰好落到零。
- **基础层在最上面，始终可读** —— 残影在基础层*身后*震颤；破坏可读性超过约 2 帧的故障就是拆台，而不是点缀。
- **短暂，然后干净** —— 瞬间清晰之后那段干净的停留才是真正的那一拍；`GLITCH_DUR` 要远小于元素在屏幕上时间的一半。强调爆发是各自独立、有限时长的三件套。
- **不要用 CSS `@keyframes` 故障循环** —— 经典的 CSS 故障代码片段按挂钟时间运行，会与 seek 失去同步；每一次错位都必须经过 timeline 的 `onUpdate`。
- **匹配调性** —— RGB 分离是一个响亮的消费级 / 科技感手势；单色切片变体是唯一适合放进克制的企业风格 composition 的形式。

## 另见

`kinetic-beat-slam`（用故障拉伸入场落下一拍）· `spring-pop-entrance`（干净地弹出，在重音拍上爆发）· `gradient-text-sweep`（归位之后由渐变撑起停留）· `discrete-text-sequence`（在最大幅度时遮掩状态切换）· `motion-blur-streak`（移动中的兄弟规则 —— 如果它在快速移动，就在那里给它加模糊）。
