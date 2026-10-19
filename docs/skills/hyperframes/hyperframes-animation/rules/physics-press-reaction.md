---
name: physics-press-reaction
description: >
  光标 + 元素通过减法式弹簧力同步按压 —— 光标落到元素上，两者一起压缩，然后释放。区别于 press-release-spring（那个没有光标）。
metadata:
  tags: spring, click, physics, cursor, subtractive, interaction, synchronized
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/physics-press-reaction.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Physics Press Reaction（光标 + 元素同步）

模拟一次真实的点击：光标靠近一个按钮、落下，两者**同步**压缩，然后一起释放。区别于 [press-release-spring.md](press-release-spring.md)（没有光标 —— 只是发生了一次按压）；这条规则是光标 + 元素**组合起来**的行为。一个 `PRESS_INTENSITY` 同时驱动两者：按下时通过**同一个 targets 数组**把两者都压缩到 `1 - PRESS_INTENSITY`，释放时两者带过冲弹回 1.0。光标在按压开始**之前**平移到按钮中心；释放之后它可以继续移动，也可以停住。

## 配方

```html
<button class="btn" id="btn">{ctaCopy}</button>
<!-- Cursor at scene-root level so it translates freely; arrow TIP is the click
     point, so transform-origin: 0 0 — scaling around the tip keeps it stable. -->
<svg class="cursor" id="cursor" style="pointer-events: none; transform-origin: 0 0">…</svg>
```

```js
gsap.set("#cursor", { x: CURSOR_START_X, y: CURSOR_START_Y }); // off-screen / far corner

// Phase 1 — approach
tl.to(
  "#cursor",
  { x: BUTTON_CENTER_X, y: BUTTON_CENTER_Y, duration: APPROACH_DUR, ease: "power2.inOut" },
  APPROACH_START,
);

// Phase 2 — coordinated press down: ONE targets array, same scale
tl.to(
  ["#btn", "#cursor"],
  { scale: 1 - PRESS_INTENSITY, duration: PRESS_DOWN_DUR, ease: "power1.in" },
  PRESS_DOWN_AT,
);

// Phase 3 — release: both spring back together
tl.to(
  ["#btn", "#cursor"],
  { scale: 1, duration: RELEASE_DUR, ease: `back.out(${BOUNCE_FACTOR})` },
  RELEASE_AT,
);

// Phase 4 — inner glow during press, resting shadow on release (contact confirmation)
tl.to(
  "#btn",
  { boxShadow: "{btnPressedShadow}", duration: PRESS_DOWN_DUR, ease: "power1.in" },
  PRESS_DOWN_AT,
);
tl.to(
  "#btn",
  { boxShadow: "{btnRestingShadow}", duration: RELEASE_DUR, ease: "power2.out" },
  RELEASE_AT,
);

// Cursor optionally exits after the press settles
tl.to(
  "#cursor",
  { x: CURSOR_EXIT_X, y: CURSOR_EXIT_Y, duration: CURSOR_EXIT_DUR, ease: "power2.out" },
  CURSOR_EXIT_AT,
);
```

## 变体

- **多元素连环按压** —— 按下按钮 A → A 触发一次替换 → 光标移到按钮 B → 再次按下；每次按压都是一套完整的按下-释放子流程。
- **按住不放（持续施压）** —— 在按下和释放之间插入一个 `HOLD_DUR` 时间窗：两者的缩放都保持在 `1 - PRESS_INTENSITY`，内发光保持亮着。暗示「思考中」或「加载中」。
- **同步的内发光脉动** —— 在按住期间，用一个正弦驱动器让内阴影辉光脉动：一个 `{ p: 0 }` 代理对象以 `ease: "none"` tween 到 `Math.PI * GLOW_PULSE_CYCLES * 2`，`onUpdate` 写入 `boxShadow`，其中 `alpha = GLOW_BASE_ALPHA + sin(p) * GLOW_PULSE_AMP`。暗示「处理中」。

## 取值

| token               | 范围 / 规则                              | 说明                                                                                   |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| APPROACH_START      | 0–0.3 s                                  | 长时间的延迟看起来像一帧死画面                                                         |
| APPROACH_DUR        | 0.7–1.3 s                                | 越快越急迫，越慢越从容                                                                 |
| PRESS_DOWN_AT       | `= APPROACH_START + APPROACH_DUR`        | 光标恰好在按压开始时到达 —— 避免「对着空气点」                                         |
| PRESS_DOWN_DUR      | 0.1–0.25 s                               |                                                                                        |
| RELEASE_AT          | > `PRESS_DOWN_AT + PRESS_DOWN_DUR`       | 对「思考中」类的交互，可选 0.05–0.4 s 的停顿（或 0.3–0.8 s 的 `HOLD_DUR`）             |
| RELEASE_DUR         | 0.4–0.7 s                                | 要足够长，让过冲能落定                                                                 |
| PRESS_INTENSITY     | 0.05 含蓄 · 0.10 标准 · 0.15 厚重        | 通过同一个 targets 数组同时作用于光标和按钮                                            |
| BOUNCE_FACTOR       | 1.6 柔和 · 2.0 紧实 · 2.4 卡通           |                                                                                        |
| CURSOR_START / EXIT | 画外或远处的角落                         | 靠近过程必须看起来是运动进入，而不是瞬移；退场 ≥ `RELEASE_AT + RELEASE_DUR`            |
| BUTTON_CENTER       | 实测                                     | 1920×1080 下使用 `place-items: center` 时：`(960, 540)`                                |
| BRAND_REVEAL_AT     | < `PRESS_DOWN_AT`                        | 先有语境，再有交互                                                                     |
| 辉光脉动            | 1–4 个周期；基础 α 0.15–0.3；幅度 0.1–0.2 | `GLOW_BASE_ALPHA − GLOW_PULSE_AMP ≥ 0`                                                 |
| CURSOR_SIZE         | 1080p 下 48–96 px                        |                                                                                        |

## 关键约束

- **光标和按钮使用相同的按压缩放**（同一个 targets 数组）—— 只有按钮缩放，光标就成了「对着空气点」；只有光标缩放，按钮就显得脱节。
- **光标在按压开始之前到达** —— 要有一个清晰的「光标停在目标上」的时刻，否则这次按压无从归属。
- **释放时用 `back.out(BOUNCE_FACTOR)`，两者一起** —— 线性释放会丢掉触感；释放**必须**在按压之后。
- **内发光在按压期间出现，释放时淡出** —— 外阴影缩小（被按进去），内发光出现（能量聚拢）。
- **光标 `transform-origin: 0 0`** —— 箭头的尖端就是点击点；围绕尖端缩放能让它保持稳定。光标上设 `pointer-events: none`。
- **高潮停留 ≥ 1 s** —— 释放之后 composition 必须再持续 ≥ 1 s；按压是一拍，观众需要时间看到结果。
- **不使用真正的 `mouseenter` / `click` 事件** —— HF 是渲染上下文；一切都通过 timeline 运行。

## 另见

`press-release-spring`（只有**按钮**的按压；这条规则在它上面叠加了光标）· `cursor-click-ripple`（在点击点加一圈涟漪）· `scale-swap-transition`（按压**触发**替换）。
