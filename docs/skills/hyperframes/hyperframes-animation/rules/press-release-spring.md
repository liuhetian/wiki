---
name: press-release-spring
description: >
  带触感的按钮按压：线性压缩、基于弹簧的弹性恢复，以及分层的视觉反馈（阴影收缩 + 释放爆发 + 背景辉光）。
metadata:
  tags: spring, press, interaction, button, physics, glow, burst, ui
---

# Press-Release Spring Chain

把输入（线性压缩）和输出（弹簧恢复）分开，以营造触感：过冲是弹簧配置自然产生的副产品，而不是手动编码出来的，次级运动（阴影收缩、释放爆发、背景辉光）叠加在同一个触发帧上。这是**对一个已经停在屏幕上的元素做的反应** —— 从无到有弹入的抵达是 [spring-pop-entrance.md](spring-pop-entrance.md)；加上一个可见的光标角色，它就变成了 [physics-press-reaction.md](physics-press-reaction.md)。

两个阶段以**释放**为分界：

1. **按压**：线性缓动 → 压缩（`scale: 1 → PRESS_SCALE`，阴影收缩）。用线性，不用弹簧 —— 这一下沉必须看起来是瞬时的/有触感的，而不是软塌塌的。
2. **释放**：`back.out(BOUNCE_FACTOR)` 弹回 1.0。可选：按钮后方扩散出一圈爆发辉光环；可选：环境辉光淡入。

状态连续性至关重要：释放 tween 的起始值**必须**等于按压 tween 的结束值，否则弹簧会跳到另一个位置。当两个 tween 作用于同一个属性、并且处于**相邻位置**时，GSAP 会自动把它们衔接起来 —— `RELEASE_START = PRESS_START + PRESS_DUR`；有间隙或重叠都会破坏它。

## 配方

```html
<div class="press-stage">
  <div class="bg-glow" id="bg-glow"></div>
  <!-- Burst sits BEHIND the button (z-index 1 vs 2), same footprint, blurred
       radial gradient, opacity 0. bg-glow is a full-stage radial at negative
       inset so it extends past the stage edges. -->
  <div class="burst" id="burst"></div>
  <button class="btn" id="btn">{buttonLabel}</button>
</div>
```

```js
// Phase 1 — press (linear compression)
tl.to(
  "#btn",
  { scale: PRESS_SCALE, boxShadow: "{btnPressedShadow}", duration: PRESS_DUR, ease: "power1.in" },
  PRESS_START,
);

// Phase 2 — release (spring back; start scale == PRESS_SCALE by adjacency)
tl.to(
  "#btn",
  {
    scale: 1,
    boxShadow: "{btnRestShadow}",
    duration: RELEASE_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
  },
  RELEASE_START,
);

// Phase 3 — burst glow pops behind the button, then fades
tl.fromTo(
  "#burst",
  { scale: 1, opacity: 0 },
  {
    scale: BURST_PEAK_SCALE,
    opacity: BURST_PEAK_OPACITY,
    duration: BURST_GROW_DUR,
    ease: "power2.out",
  },
  RELEASE_START,
);
tl.to("#burst", { opacity: 0, duration: BURST_FADE_DUR, ease: "power2.in" }, BURST_FADE_START);

// Phase 4 — environmental glow fades in after release
tl.to(
  "#bg-glow",
  { opacity: BG_GLOW_PEAK_OPACITY, duration: BG_GLOW_FADE_DUR, ease: "power2.out" },
  RELEASE_START,
);
```

## 变体

- **含蓄的按压**（状态保存 / 低调的 CTA）：`PRESS_SCALE` 约 0.96，`BOUNCE_FACTOR` 约 1.4，爆发的缩放/不透明度调低。
- **戏剧性的按压**（hero CTA /「发布它」）：`PRESS_SCALE` 约 0.88，`BOUNCE_FACTOR` 约 2.5，爆发拉满。
- **按压期间变色** —— 按压中途变暗，释放时恢复；在与缩放 tween 相同的 timeline 位置上插值 `backgroundColor`。同样遵守状态连续性规则。
- **释放时切换状态**（批准 / 确认）—— 不回到静止色，而是在 `RELEASE_START` 时切换到 `{successColor}`，并在同一位置用一个单独的 `back.out(CHECK_BOUNCE)` tween 弹出一个对勾（1.4–2.0，比按钮的弹性更紧实 —— 一个画上句号的「盖章」；弹出 0.3–0.6 s）。此后按钮处于终态 —— 不再预期有后续按压。

## 取值

| token                | 范围                                       | 说明                                                                                       |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 按钮占地面积         | ≥ 画布面积的 3–5%                          | 1080p 下 320×68 的按钮约占 1%，按压在视觉上显得无足轻重                                    |
| PRESS_SCALE          | 0.88 戏剧 · 0.92 默认 · 0.96 含蓄          | 绝不 <0.85（看起来坏了），也绝不 >0.98（感知不到下沉）                                     |
| PRESS_DUR            | 0.10–0.30 s                                | 越短越利落；必须短于 `RELEASE_DUR`（输入比弹簧恢复快）                                     |
| RELEASE_DUR          | 0.40–0.90 s                                | 越短越是紧凑的弹出；越长越是松散、晃动的落定                                               |
| BOUNCE_FACTOR        | 1.4 柔和 · 2.0 紧实 · 2.8 卡通             | 或者用 `elastic.out(amplitude, period)` 做橡胶般的振荡，代替单次过冲                       |
| RELEASE_START        | `= PRESS_START + PRESS_DUR`                | 相邻 = 自动的状态连续性                                                                    |
| BURST_PEAK_SCALE     | 3 含蓄 · 6 默认 · 8 最大                   | 超过约 8，径向渐变会明显出现像素化                                                         |
| BURST_PEAK_OPACITY   | 0.4–1.0                                    | 扩散 ≈ 淡出，各 0.4–0.7 s；模糊 40–100 px（硬边光环 → 环境薄雾）                           |
| BG_GLOW_PEAK_OPACITY | 0.1 含蓄 · 0.25 默认 · 0.45 最大           | 更高会把整个 composition 洗白；淡入 0.6–1.0 s；1080p 下 inset 为 −300…−500 px             |

颜色 token：按下时的表面比静止时更暗；静止阴影大而弥散，按下时小而紧（按钮「往表面沉下去」）；爆发渐变比 `{btnBg}` 更暗、更饱和 —— 同色辉光看起来发白；背景辉光是按钮色相家族的一层低不透明度色调。

## 关键约束

- **状态连续性** —— 释放的起始值严格等于按压的结束值；通过在 `RELEASE_START = PRESS_START + PRESS_DUR` 处同属性相邻来保证。
- **线性按压，弹簧释放** —— 两者都用弹簧 → 软塌塌；两者都用线性 → 机械，没有过冲的力道。
- **压缩以中心为锚点**（`transform-origin: 50% 50%`），否则按钮会不对称地塌缩。
- **爆发在后面，不在前面** —— 爆发 `z-index: 1`，按钮 `z-index: 2`；放在前面的话，不透明度峰值时它会遮住按钮。
- **不要在同一个元素上同时 tween `boxShadow` 和 `filter`** —— 它们在布局流水线里互相竞争；阴影放在按钮上，模糊放在单独的爆发图层上。
- **高潮停留** —— 在爆发峰值 + 揭示之后，composition 必须再运行 ≥ 1 s（戏剧性变体 ≥ 2 s）；在 `t = DURATION − 0.2 s` 时揭示，看起来是「闪了一下就没了」。

## 另见

`spring-pop-entrance`（对应的**入场**版本 —— 抵达，而不是反应）· `physics-press-reaction`（这个按压加上一个可见的光标角色）· `cursor-click-ripple`（触发按压的那次光标点击）· `sine-wave-loop`（按压**之前**的空闲微漂浮）· `center-outward-expansion`（与释放同步的徽章爆发）。
