---
name: motion-blur-streak
description: >
  在快速入场或镜头推进穿越上伪造方向性的速度模糊 —— 模糊在速度最大时达到峰值，在落定时归 0，于是元素拖着残影冲进来，然后啪地变清晰。两条路径 —— 沿运动轴的 SVG feGaussianBlur，或一条最终收拢进主体的回声/幽灵拖尾。另有一种逐帧驱动的形式，用于沿烘焙轨迹运动的元素（跟踪嵌入、匹配抖动的标题）：按速度门控的无文字剪影幽灵（当画面需要真正的模糊时，改用旋转/模糊/反向旋转的滤镜夹层），拖影轴取自轨迹的位移增量。
metadata:
  tags: motion-blur, velocity, streak, entrance, fly-in, ghost, echo, svg-filter, kinetic, camera, snap, driven, tracked, baked-track
---

# Motion-Blur Streak

真正的运动模糊对按 seek 渲染的渲染器来说不可用（它需要在快门时间内积分），所以这条规则为快速飞入或猛烈的镜头推进穿越**伪造**它。整件事的关键在于*耦合*：模糊包络与位置 tween 共用**同一个 ease 和时间窗**，于是模糊峰值正好落在速度峰值上，元素停下的那一刻就锐利如刀。两条路径：

- **(A) 方向性 SVG 模糊** —— 内联 `<feGaussianBlur stdDeviation="X 0">`（X 在运动轴上，垂直方向为 0），通过代理对象做 tween。最干净；真正的方向性拖影。
- **(B) 回声 / 幽灵拖尾** —— 2–4 个不透明度递减的副本，沿运动向量往后偏移，元素落定时收拢进主体。没有滤镜开销；一种风格化的「速度线」拖尾。

两条路径都假定存在一个 **tween 时间窗** —— 按烘焙轨迹逐帧驱动的元素没有时间窗；那种形式见下文的 Per-Frame-Driven Carve-In。

**只用于入场和镜头中段的移动 —— 绝不用于 composition 中途的退场。** 一个带模糊的元素在 composition 中途逃出画面，看起来像故障；场景之间的硬性退场是转场的职责（`../transitions/overview.md`）。有两种被认可的范围扩展：包络可以在一段行进中挂在**镜头包裹层**上（Camera-Travel Carve-Out），或者对**被驱动的元素**变成烘焙轨迹的逐帧函数（Per-Frame-Driven Carve-In）。

## 工作原理

快速的 `out` 缓动移动会把速度集中在前段 —— 起步最快，到落定时衰减为零。把模糊/回声包络映射到同一条曲线上：位置在 `MOVE_DUR` 内从画外 / 推远的起点移到静止位置；在同一时间窗、同一 ease 上同步进行的是，拖影从 `PEAK_BLUR → 0`（A），或者幽灵收拢到主体上（B）。到落定时元素已完全清晰，并停留 ≥1 s —— 剧烈拖影与静止、锐利的落定之间的反差，就是这个效果本身。GSAP 不能直接 tween SVG 属性：tween 一个普通的 `{ v }` 代理对象，在 `onUpdate` 里写 `setAttribute("stdDeviation", …)`，并在 setup 时先写入一次初值，这样 seek 到 t=0 时显示的是拖影状态的起点。

## 配方

```html
<!-- inside a standard scene clip; overflow: hidden on the scene (the smear extends past rest) -->
<svg width="0" height="0" aria-hidden="true" style="position: absolute">
  <filter id="streak" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur id="streak-blur" in="SourceGraphic" stdDeviation="0 0" />
  </filter>
</svg>
<div class="streak-el" id="streak-el" style="filter: url(#streak)">{phrase}</div>
<!-- Path B instead: N-1 aria-hidden .streak-ghost duplicates BEHIND the lead, no filter -->
```

```js
// Path A — proxy-tweened directional blur.
const blurNode = document.getElementById("streak-blur");
const blurProxy = { v: PEAK_BLUR };
const writeBlur = () => blurNode.setAttribute("stdDeviation", `${blurProxy.v} 0`); // X axis only
writeBlur(); // seed frame 0 — a seek to t=0 must show the streaked start, not a sharp pre-frame

tl.fromTo(
  "#streak-el",
  { x: ENTER_FROM_X, opacity: 0 },
  { x: 0, opacity: 1, duration: MOVE_DUR, ease: MOVE_EASE },
  MOVE_START,
);
tl.to(blurProxy, { v: 0, duration: MOVE_DUR, ease: MOVE_EASE, onUpdate: writeBlur }, MOVE_START);

// Path B — ghosts on the SAME window/ease; per-ghost variation by index.
gsap.utils.toArray(".streak-ghost").forEach((g) => {
  const i = Number(g.dataset.i); // 1..N-1, set in HTML
  tl.fromTo(
    g,
    { x: ENTER_FROM_X - i * ECHO_STEP_PX, opacity: GHOST_BASE_OPACITY / i },
    { x: 0, opacity: 0, duration: MOVE_DUR, ease: MOVE_EASE },
    MOVE_START,
  );
});
```

## 变体

- **垂直拖影** —— 交换坐标轴：`y`、`stdDeviation="0 Y"`、垂直方向的回声偏移。
- **镜头推进穿越** —— `scale: SCALE_FROM → 1`，配对称的 `"B B"` 包络（沿纵深的拖影，而非方向性的）：文字标识从柔焦中冲出来，在锁定时啪地变清晰。
- **网格错开拖影入场** —— 每张卡片在 `MOVE_START + i * CARD_STAGGER` 时拖着残影冲进自己的槽位，各自有自己的模糊代理 / 幽灵；落位的那一刻即变清晰。
- **拖影稍作停留** —— 模糊用比位置稍慢一点的曲线（位置 `expo.out`，模糊 `power3.out`），让最后一缕残影在到位后稍晚才消散。慎用；默认是锁定的包络。

## Camera-Travel Carve-Out（镜头行进的例外许可）

这个包络在**包裹层级别**也是被认可的：在虚拟镜头场景（[viewport-change.md](viewport-change.md)、[multi-phase-camera.md](multi-phase-camera.md)、[3d-camera-flight.md](3d-camera-flight.md)）的 `.world` / 镜头包裹层上，在一段**行进**期间使用 —— 俯冲、甩镜扫过、一次猛烈的最终推进。这**并不**违反「绝不用于 composition 中途的退场」：世界从未离开画面 —— 是镜头*穿过*它行进，而且每一段行进结束时，世界都静止、清晰地处在画面内。每一段都是对下一个机位的一次**抵达**，所以入场的原则逐段适用。与元素级配方相比有三处差别：

- **包络跟随这一段的 ease。** `out` 类的段（俯冲、最终推进）原样使用基础配方。`inOut` 类的重新定位段在段中间达到峰值：在速度峰值处把包络拆开 —— 前半段用 in 半边的 ease 走 `0 → PEAK`，后半段用 out 半边走 `PEAK → 0`。这些段的代理初值设为 **0**（拖影状态出现在段中间，而不是 t=0；把初值设为 `PEAK_BLUR` 属于入场形态，那里第一帧就是最快的）。
- **滤镜放在哪里。** 2D 镜头：`filter: url(#streak)` 放在 `.world` 包裹层上。3D 飞行：放在 3D 上下文之上的**透视舞台**上 —— 在 `preserve-3d` 元素上加 `filter` 会把它压平，所有 `translateZ` 都会塌缩。绝不要放在世界内部的单个元素上：一个覆盖全画面的包络，而不是 N 个不同步的包络。
- **全画面模糊很重** —— 包裹层级别把 `PEAK_BLUR` 封顶在约 18–20（单个元素是 30）；短暂的甩镜可以碰到约 24。坐标轴规则照旧：横向甩镜/摇镜用 `"X 0"`，俯冲/推进用 `"B B"`。

### 甩镜扫过（命名组合）

一次重度模糊的横向甩镜，落定到下一个区域 —— 同一时间窗上的两条规则：

1. **位置** —— 在镜头状态上使用 [nudge-curve.md](nudge-curve.md) 的三阶段链，调成以爆发段为主（尾段在时长上仍 ≥ 加速段的 3 倍）。
2. **模糊** —— 加速段从 `0 → PEAK`，在线性爆发段一直保持 `PEAK`（恒定速度 = 恒定拖影），尾段从 `PEAK → 0`。

在爆发段期间替换或揭示下一个区域的内容 —— 拖影会掩盖这个变化；`power4.out` 尾段让它清晰落地。爆发段内揭示，尾段之后阅读。

```js
tl.to(cam, { x: WHIP_X * 0.1, duration: 0.12, ease: "power3.in", onUpdate: applyCamera }, WHIP_AT);
tl.to(
  cam,
  { x: WHIP_X * 0.75, duration: 0.1, ease: "none", onUpdate: applyCamera },
  WHIP_AT + 0.12,
);
tl.to(
  cam,
  { x: WHIP_X, duration: 0.35, ease: "power4.out", onUpdate: applyCamera },
  WHIP_AT + 0.22,
);

tl.to(blurProxy, { v: PEAK_BLUR, duration: 0.12, ease: "power3.in", onUpdate: writeBlur }, WHIP_AT);
// blur holds at PEAK through the linear burst (no tween needed — value rests at PEAK)
tl.to(blurProxy, { v: 0, duration: 0.35, ease: "power4.out", onUpdate: writeBlur }, WHIP_AT + 0.22);
```

## Per-Frame-Driven Carve-In（逐帧驱动的例外许可，用于烘焙轨迹）

当元素不是被 tween 而是被**驱动**时 —— 一个沿烘焙逐帧轨迹运动的跟踪嵌入或标注、一个匹配镜头抖动的标题 —— 就没有可以共用的移动时间窗。包络变成轨迹自身位移增量的逐帧函数，在负责应用位置的同一个 `onUpdate` 里计算。

每种变换各占一个元素，这样任何一次写入都不会覆盖另一个：

```html
<!-- .track: position + any fade, the only element either touches -->
<div class="track">
  <!-- ×2, the lead's box -->
  <div class="streak-ghost" aria-hidden="true" data-layout-allow-overlap></div>
  <!-- Path A only: rotate onto the travel axis; same box as .lead so both rotate about one center -->
  <div class="blur-wrap" style="filter: url(#streak)">
    <!-- counter-rotate only; no GSAP transform tweens on it -->
    <div class="lead">…</div>
  </div>
</div>
```

```js
// inside the frame-lookup driver (an ease:"none" proxy → frames[i]); TRACK.x / TRACK.y are baked arrays
const j = Math.max(1, i); // frame 0 borrows the frame-1 delta so a seek to t=0 has a defined state
const dx = TRACK.x[j] - TRACK.x[j - 1];
const dy = TRACK.y[j] - TRACK.y[j - 1];
const speed = Math.hypot(dx, dy); // px per frame
const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // the streak axis IS the travel direction
track.style.transform = `translate(${TRACK.x[i]}px, ${TRACK.y[i]}px)`;

// Path B, driven form (the default here): text-free silhouette clones trail the lead along −delta.
const base = speed > TRAIL_GATE ? Math.min(TRAIL_MAX, TRAIL_K * speed) : 0;
ghost1.style.transform = `translate(${-dx * 0.25}px, ${-dy * 0.25}px)`;
ghost2.style.transform = `translate(${-dx * 0.5}px, ${-dy * 0.5}px)`;
ghost1.style.opacity = String(base); // a fade on .track multiplies in; never read another tween's value
ghost2.style.opacity = String(base * 0.5);

// Path A, driven form: rotate a filter wrapper onto the travel axis, blur along X only, counter-rotate the content.
const sigma = speed > TRAIL_GATE ? Math.min(SIGMA_MAX, 0.5 * speed) : 0;
blurWrap.style.transform = `rotate(${angle}deg)`;
lead.style.transform = `rotate(${-angle}deg)`;
blurNode.setAttribute("stdDeviation", `${sigma} 0`);
```

与 tween 版配方相比有三处差别：

- **幽灵是无文字的剪影** —— 与主体相同的盒子、边框、圆角和填充，但**没有内容**（`aria-hidden="true"`、`data-layout-allow-overlap`）。25–50% 不透明度的副本被看作形状；带着文字的副本会被看作重复的元素，而无内容的副本也让布局和对比度检查器无可标记。
- **按速度门控，而不是按时间窗塑形** —— 拖尾只在速度高于 `TRAIL_GATE` px/帧时出现，并随速度缩放（`min(TRAIL_MAX, TRAIL_K × speed)`）：缓慢漂移时什么都不显示，甩镜时显示 180° 快门的拖影。淡入淡出作用在 `.track` 上，绝不要作用在 `.lead` 上：整组的不透明度会把拖尾一起带上，而幽灵的不透明度始终是帧索引的纯函数，不管帧以什么顺序被 seek。
- **坐标轴取自烘焙的位移增量** —— 每帧算 `atan2(dy, dx)`；拖影跟着轨迹绕过拐角，setup 时无需写入任何初值。

**被驱动的子树选哪条路径。** 默认是 Path B：它没有滤镜光栅化开销（在逐帧驱动下，整个滤镜区域每帧都要重新光栅化），它的副本不带文字，布局和对比度检查器看不到任何新东西，而且轨迹静止时它会退化为什么都没有。当画面需要真正的模糊时，驱动形式的 Path A 也是合理的。两种形式在参考主机上实测都是确定性的（2026-09-08：每条路径各做了单卡 120 帧和三卡 450 帧的驱动，覆盖硬件 GL 和软件两条通道，每一次双重渲染都逐位一致）—— 但逐帧驱动的滤镜是换到新主机时第一个要重新实测的东西：在流水线里保留双重渲染的帧哈希比对（`--format png-sequence` 跑两次），而不要相信一次干净的运行。更早的一个版本（2026-08）曾在逐帧负载下观察到 `feGaussianBlur` 有 1-LSB 的抖动，因此当时交付的是 Path B。

## 取值

| token               | 范围                                               | 说明                                                                                            |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| MOVE_EASE           | `expo.out` / `power4.out`（默认）/ `power3.out`    | 只能用 `out` 家族 —— `in`/`inOut` 会把速度峰值放错位置；位置和模糊共用它                        |
| MOVE_DUR            | 0.25–0.6s                                          | 超过约 0.7s 看起来像拉焦，而不是速度                                                            |
| ENTER_FROM_X/Y      | 元素自身尺寸的 40–120%                             | 给拖影足够的助跑距离，才能被看清                                                                |
| PEAK_BLUR           | 8–30（默认 18）                                    | >30 会在起点把字形抹掉；包裹层级别封顶约 18–20                                                  |
| SCALE_FROM          | 1.3–2.5                                            | 推进穿越变体                                                                                    |
| N（幽灵数）         | 2–4                                                | >4 看起来像频闪，而不是拖影                                                                     |
| ECHO_STEP_PX        | 12–40px                                            | `N × step ≲ ENTER_FROM`，让最远的幽灵也从助跑距离之内出发                                       |
| GHOST_BASE_OPACITY  | 0.3–0.6                                            | 不透明的幽灵会被看作重复的元素                                                                  |
| CARD_STAGGER        | 0.05–0.12s                                         | 一道组装成形的波，而不是各自分开的抵达                                                          |
| TRAIL_GATE          | 3–6 px/帧（默认 4）                                | 驱动形式：低于它，轨迹算作静止 —— 没有拖尾，没有模糊                                            |
| TRAIL_K · TRAIL_MAX | 0.05 · 0.32                                        | 驱动形式：幽灵不透明度 `min(TRAIL_MAX, TRAIL_K × speed)` —— 约 6 px/帧时达到上限                |
| TRAIL_OFFSETS       | 逐帧位移增量的 0.25 / 0.5                          | 两个副本 = 离散的 180° 快门；只有长距离甩镜才在 0.75 处加第三个                                 |
| SIGMA_MAX           | 8–12                                               | 驱动的 Path A：沿行进轴 `σ = min(SIGMA_MAX, 0.5 × speed)`                                       |

## 关键约束

- 模糊在速度峰值时达到峰值，在落定时归 0 —— 位置和包络共用 ease 和时间窗。停下后还残留的模糊看起来像拉焦。
- 只用于入场 / 镜头中段的抵达 —— 绝不用于 composition 中途的退场；包裹层级别的使用只能按 Camera-Travel Carve-Out，逐帧驱动的使用只能按 Per-Frame-Driven Carve-In。
- setup 时写入 `stdDeviation` 的初值：入场形态设为 `PEAK_BLUR`，甩镜 / `inOut` 段设为 0。
- 滤镜区域要给得宽裕（`x="-50%" y="-50%" width="200%" height="200%"`），否则拖影会在元素盒子的边缘被裁掉。
- 方向轴：水平用 `"X 0"`，垂直用 `"0 Y"`，`"B B"` 只用于纵深/缩放移动 —— 横向移动上用对称模糊看起来像失焦。
- 啪地变清晰之后保持清晰 ≥1 s；在最后一拍才落地的拖影看起来是「闪了一下就没了」。
- 用分量重的元素配纯色底 —— 细字（< 约 120px / 800 字重）或繁杂的背景会吞掉拖影。
- 场景上设 `overflow: hidden` —— 行进期间拖影 / 最远的幽灵会超出静止位置。
- 驱动形式：副本是无文字剪影（`aria-hidden`、`data-layout-allow-overlap`），放在做淡入淡出的 `.track` 里，坐标轴取自烘焙的位移增量；除了结构性的第 0 帧状态外，setup 时不写入任何初值。

## 另见

`kinetic-beat-slam`（拖影作为某一拍的入场）· `center-outward-expansion`（网格拖影入场）· `scale-swap-transition`（占位相同的 morph —— 不是抵达）· `nudge-curve`（甩镜扫过的位置那一半）· `3d-camera-flight` / `viewport-change`（Camera-Travel Carve-Out 所用的包裹层）。
