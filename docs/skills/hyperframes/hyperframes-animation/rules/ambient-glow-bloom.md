---
name: ambient-glow-bloom
description: >
  无触发的柔和径向辉光，在 hero 元素背后绽放，并以有界的空闲呼吸保持；或者一次单程掠过表面的移动扫光。没有点击，没有逐词同步 —— 它就是绽放。有限、确定性、seek 安全。
metadata:
  tags: glow, bloom, ambient, radial, sweep, hero, presence, finite, un-triggered
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/ambient-glow-bloom.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Ambient Glow Bloom（环境辉光绽放）

一道柔和的径向辉光，**在 hero 元素（卡片、logo、指标）背后绽放**并保持，赋予它存在感。不同于 `press-release-spring` 由点击触发的爆发，也不同于 `asr-keyword-glow` 按词定时的包络，这道辉光是**无触发的** —— 它在 hero 落定时绽放，并一直亮着。两种形式：**hero 绽放**，在一个正在落定的元素背后膨胀开来然后呼吸；以及**移动扫光**，把一道柔和的高光恰好一次地平移过一个表面。

## 工作原理

一个径向渐变图层位于 hero **背后**（辉光 `z-index: 1`，hero `z-index: 2` —— 放在前面的辉光会遮住它），从 `opacity: 0` 开始。在绽放入场的时间窗内，它按 `opacity: 0 → peak` 爬升，伴随轻柔的 `scale` 膨胀，时间安排让 `BLOOM_START + BLOOM_DUR` 正好落在 hero 落定的那一刻 —— 辉光和 hero 作为同一拍一起落定（「通电亮起」），绝不是先辉光后卡片。绽放入场之后：

1. **hero 绽放** —— 停留期间做**有界的空闲呼吸**：一个有限的 `ease: "none"` tween 推进 `phase` 代理，`onUpdate` 让不透明度 + 缩放围绕峰值做极细微的偏移（绝不用 `yoyo` 循环）。`sin(0) = 0` → 呼吸恰好从绽放的静止状态开始。
2. **移动扫光** —— 一条窄的高光带从一侧边缘**一次**平移到另一侧（`x` 从表面外到表面外），裁切在表面之内（`overflow: hidden`）。单程，不返回 —— 重复的扫光看起来像加载中的微光，而不是揭示时的点缀（下文的 shimmer-sweep 变体是被认可的例外）。

峰值不透明度保持克制（**硬上限 ≤ 0.45**），让辉光提供存在感而不至于冲淡画面；辉光颜色比它衬托的元素**更暗 + 更饱和**（同色相、同亮度的辉光会消失在表面里）。

## 配方

```html
<!-- inside a standard scene clip -->
<div class="bloom-stage">
  <div class="bloom-glow" id="bloom-glow"></div>
  <!-- z-index: 1; inset: GLOW_INSET (negative); background: {glowGradient} -->
  <div class="hero-card" id="hero-card">{HeroLabel}</div>
  <!-- z-index: 2 -->
</div>
<!-- sweep form: <div class="sweep" id="sweep"> inside the overflow:hidden surface -->
```

```js
// ── Form A: HERO BLOOM ── bloom in soft, landing on the hero's settle.
tl.fromTo(
  "#bloom-glow",
  { opacity: 0, scale: GLOW_START_SCALE },
  { opacity: GLOW_PEAK_OPACITY, scale: 1, duration: BLOOM_DUR, ease: "power2.out" },
  BLOOM_START,
);
// Bounded breathe during the hold — finite phase tween, NOT a yoyo loop.
const glow = document.getElementById("bloom-glow");
const phase = { p: 0 };
tl.to(
  phase,
  {
    p: Math.PI * 2 * BREATHE_CYCLES,
    duration: BREATHE_DUR,
    ease: "none",
    onUpdate: () => {
      const s = Math.sin(phase.p);
      glow.style.opacity = String(GLOW_PEAK_OPACITY + s * OPACITY_AMP);
      glow.style.transform = `scale(${1 + s * SCALE_AMP})`;
    },
  },
  BLOOM_START + BLOOM_DUR,
);

// ── Form B: TRAVELING SWEEP ── one finite pass, constant glide.
tl.fromTo(
  "#sweep",
  { x: SWEEP_START_X, opacity: 0 },
  { x: SWEEP_END_X, opacity: SWEEP_PEAK_OPACITY, duration: SWEEP_DUR, ease: "none" },
  SWEEP_START,
);
tl.to("#sweep", { opacity: 0, duration: SWEEP_FADE_DUR, ease: "power1.in" }, SWEEP_FADE_START);
```

## 变体

- **绽放并停住** —— 对于短于 3s 的场景，或自带空闲动画的 hero，跳过呼吸：那一个 `fromTo` 就是全部配方。
- **抵达时脉动** —— 绽放到略微超过峰值（`GLOW_OVERSHOOT_OPACITY`，`scale: 1.06`），然后紧接着的第二个 tween 缓降到一个稳定的停留 —— 用一次呼吸为落地加个标点，不留持续的循环。
- **多 hero 接力** —— 在一排元素上把每道辉光的 `BLOOM_START` 错开约 0.15–0.3s；按下文的 `/√N` 规则缩小 `OPACITY_AMP` / `SCALE_AMP`。
- **斜向掠光** —— 让 `{sweepGradient}` 带一个角度（约 105°）掠过文字标识：经典的单程 logo 光泽。`SWEEP_WIDTH` 更窄，`SWEEP_PEAK_OPACITY` 更高。

### 微光扫过（Shimmer sweep）—— 裁切进文字、表示工作状态的状态短语

把扫光改为瞄准**文字内部**：一道柔和的高光渐变通过 `background-clip: text` 裁切进一个状态短语（「Thinking…」、「Analyzing dataset…」），从左到右穿过字形 —— 这种灰上加灰的微光传达的是*仍在工作*。不同于这里的其他所有形式，它**在状态持续期间重复**是正当的：这种重复是画面内的工作状态，而不是空闲晃动（与闪烁插入符的辩护理由相同 —— 运动在表演状态）。有两点让它保持正当：它是**有界的**（一个有限的 tween，遍数由状态时间窗算出，绝不用 `repeat: -1`），并且它**在状态落定时被终止** —— 状态完成的那一刻，微光戛然而止；延续到回答那一拍的微光，会把一个工作指示器变成装饰。

```js
// Status shimmer — N passes as ONE bounded tween. Killed at resolve.
const status = document.getElementById("status-phrase");
// CSS on #status-phrase: background: {shimmerGradient}; background-size: 300% 100%;
// -webkit-background-clip: text; background-clip: text; color: transparent;
const shimmer = { p: 0 };
const PASSES = Math.round(STATUS_DUR / PASS_PERIOD); // whole passes, computed up front
tl.to(
  shimmer,
  {
    p: PASSES,
    duration: STATUS_DUR,
    ease: "none",
    onUpdate: () => {
      const t = shimmer.p % 1; // 0→1 within each pass; percent axis inverted → left→right travel
      status.style.backgroundPosition = `${(1 - t) * 100}% 50%`;
    },
  },
  STATUS_START,
);
tl.set(status, { backgroundPosition: "100% 50%" }, STATUS_START + STATUS_DUR); // resolve: dead.
```

让它像耳语一样轻：`{shimmerGradient}` 就是状态文字本身的灰色，加上一条稍亮一点的带（高光色标只比底色高一级，绝不接近白色）；`background-size` 约 300% 让光带在字形里保持窄；`PASS_PERIOD` 1.2–1.8s —— 更慢看起来像光泽点缀，更快像加载转圈。整数的 `PASSES` 让光带在终止帧恰好回到起始位置，所以那个 `tl.set` 在视觉上不产生任何变化。这是 `gradient-text-sweep` 在工作状态上的近亲：当扫光*意味着*「进行中」时，用**这里**；当渐变本身就是字体处理时，用**那里**。

## 取值

| token | 范围 / 默认值 | 说明 |
| --- | --- | --- |
| GLOW_PEAK_OPACITY | 0.15（细微）→ 0.30（默认）→ **0.45 硬上限** | 更高会冲淡画面；一道你有意识注意到的辉光就已经太强了 |
| GLOW_INSET | −200 到 −450px（1920×1080） | 取负值，让光晕延伸到 hero 之外；太小看起来像一圈紧贴的边 |
| GLOW_START_SCALE | 0.80–1.0 | ≤1.0 —— 长大到位，绝不缩小 |
| BLOOM_DUR / BLOOM_START | 0.6–1.4s | `BLOOM_START + BLOOM_DUR` ≈ hero 落定的那一帧 |
| OPACITY_AMP / SCALE_AMP | 默认 0.02–0.05 / 0.01–0.03 | `PEAK + OPACITY_AMP ≤ 0.45`；只有当辉光是唯一的运动时才往上推 |
| BREATHE_CYCLES | 每次呼吸的周期 2.5–4s | 辉光呼吸得比元素的呼吸更慢 |
| SWEEP_WIDTH | 表面的 15–35%（网格）/ 8–15%（文字标识） | |
| SWEEP_DUR | 0.8–1.6s | 一次从容的单程 —— 慢到足以被看作光 |
| SWEEP_PEAK_OPACITY | 0.10 → 0.25（默认）→ 0.40 | 同样的 ≤ 约 0.45 冲淡上限；窄的扫光能承受高端取值 |
| SWEEP_START_X / END_X | 两端都完全在表面之外 | 不要在表面中途看得见地出现/消失；光带离开时淡出到 0 |
| PASS_PERIOD（shimmer） | 1.2–1.8s | 配合整数的 PASSES |

## 关键约束

- **辉光峰值不透明度 ≤ 0.45** —— 包括呼吸的幅度在内；默认取低端（0.15–0.30）。
- **辉光在后，hero 在前**；辉光颜色比 hero 表面更暗 + 更饱和。
- **让辉光和 hero 作为同一拍落定** —— 一前一后会被看作两个分开的事件。
- **呼吸是有界的，扫光是单程的** —— 唯一被认可的重复是 shimmer sweep，有界，并在状态落定时终止。
- **同时出现的光晕会叠加** —— 每道辉光的幅度 ≤ 默认值 `/√N`，并错开呼吸周期（2.6s / 2.9s / 3.3s），让它们不会步调一致地脉动。
- **不要把 hero 上的 `boxShadow` 辉光和这个光晕图层同时使用** —— 两者会相互竞争，看起来浑浊；辉光应放在专门的图层上。

## 另见

`sine-wave-loop`（hero 在 scale/y 上呼吸，辉光在 opacity 上呼吸，两者错相）· `press-release-spring`（由点击触发的兄弟规则 —— 绝不在同一个元素背后同时使用两者）· `counting-dynamic-scale` / `stat-bars-and-fills`（在落定的数据背后绽放）· `center-outward-expansion`（扫光掠过组装完成的网格）· `gradient-text-sweep`（设计节拍式的渐变对应版本）。
