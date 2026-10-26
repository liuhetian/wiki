---
name: svg-icon-enrichment
description: >
  对 SVG 内部元素做动画（旋转的指针、张合的刀片、脉动的圆点、流动的虚线），在不替换图标的前提下让图标显得活起来。
metadata:
  tags: svg, icon, animation, internal, micro-animation, pulse, rotation
---

# SVG Icon Enrichment

把 SVG 图标当作由会动的**零件**组合而成的整体，而不是一张不透明的图片。每个有意义的内部元素（时钟指针、剪刀刀片、录制圆点、数据线）都有自己的微动画，通过 id 定位。区别于 [svg-path-draw](svg-path-draw.md)（那个是对**轮廓**的绘制做动画）—— enrichment 是对**内部零件**做动画，最好在轮廓绘制完之后进行。

四种招牌模式：

| 模式        | 用于                               | 数学                                  | 提示                               |
| ----------- | ---------------------------------- | ------------------------------------- | ---------------------------------- |
| 旋转        | 时钟、齿轮、加载器、表盘           | `rotate(deg cx cy)` 属性，线性        | 见 transform 中心的陷阱            |
| 摆动        | 剪刀、翅膀、开关                   | 在相对的两组上用 `rotate(±sin·amp)`   | 两个零件用相反的正负号             |
| 脉动        | 录制圆点、心形、通知               | `scale(1 + sin·amp)` + 不透明度       | 圆环比圆点滞后 π/2，形成涟漪       |
| 虚线流动    | 切割线、数据流                     | 随时间线性变化的 `strokeDashoffset`   | 负值为 L→R，正值为 R→L             |

## ❗ transform 中心的陷阱

**要围绕 SVG 内部某个明确的点旋转，用 SVG 的 `transform` 属性，不要用 CSS transform**：`el.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`)`。CSS 的组合 `transform: rotate(...)` + `transform-origin: 60px 60px` + `transform-box: fill-box` 会把原点解释为元素**自身的 bbox 局部**坐标，而**不是** viewBox 坐标。对于一条细的 `<line>`（它的 bbox 是这条线窄窄的外包框），bbox 局部坐标里的 `60 60` 是线**之外**的一个点 —— 指针会沿着一段偏离中心的弧线飞出去，而不是原地旋转。小的内部形状也有同样的陷阱（一个圆点 circle 的 bbox 是这个小圆，而不是整个 viewBox）。

**围绕中心点缩放**：走同样的属性路线 —— `el.setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(-${cx} -${cy})`)`。

## 配方

```html
<!-- inside a standard scene clip — named children are the animation targets -->
<svg class="icon-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" fill="none" stroke="{accentColor}" stroke-width="6" />
  <line
    id="hand-min"
    x1="60"
    y1="60"
    x2="60"
    y2="22"
    stroke="{textColor}"
    stroke-width="6"
    stroke-linecap="round"
  />
  <line
    id="hand-sec"
    x1="60"
    y1="60"
    x2="60"
    y2="30"
    stroke="{recordColor}"
    stroke-width="3"
    stroke-linecap="round"
  />
  <circle cx="60" cy="60" r="6" fill="{textColor}" />
</svg>
<!-- pulse icon: #rec-ring + #rec-dot circles; dash-flow: a <line> with stroke-dasharray="14 12" -->
```

```js
// Pattern 1 — Rotation. Proxy tween → SVG transform attribute (explicit center, see gotcha).
const hand = document.getElementById("hand-min");
const minState = { deg: 0 };
tl.to(
  minState,
  {
    deg: 360 * MIN_REVOLUTIONS,
    duration: TOTAL_DURATION,
    ease: "none", // linear motion is the point
    onUpdate: () => hand.setAttribute("transform", `rotate(${minState.deg} 60 60)`),
  },
  0,
);
// second hand: same shape with SEC_REVOLUTIONS (visibly faster).

// Pattern 3 — Pulse. One phase proxy drives dot + ring, ring offset by π/2.
const dot = document.getElementById("rec-dot");
const ring = document.getElementById("rec-ring");
const pulse = { p: 0 };
tl.to(
  pulse,
  {
    p: Math.PI * 2 * PULSE_CYCLES,
    duration: TOTAL_DURATION,
    ease: "none", // sine handles the curve
    onUpdate: () => {
      const sD = 1 + Math.sin(pulse.p) * PULSE_DOT_AMP;
      const sR = 1 + Math.sin(pulse.p + Math.PI / 2) * PULSE_RING_AMP;
      dot.setAttribute("transform", `translate(60 60) scale(${sD}) translate(-60 -60)`);
      ring.setAttribute("transform", `translate(60 60) scale(${sR}) translate(-60 -60)`);
      ring.style.opacity = String(
        PULSE_RING_OPACITY_BASE + Math.sin(pulse.p) * PULSE_RING_OPACITY_AMP,
      );
    },
  },
  0,
);

// Pattern 4 — Dash flow. Linear offset tween on a dashed stroke.
const flowState = { offset: 0 };
tl.to(
  flowState,
  {
    offset: DASH_FLOW_TOTAL_OFFSET, // negative = L→R
    duration: TOTAL_DURATION,
    ease: "none",
    onUpdate: () => {
      document.getElementById("data-flow").style.strokeDashoffset = String(flowState.offset);
    },
  },
  0,
);
```

## 变体

- **描边绘制 → enrichment 串联** —— 先用 [svg-path-draw](svg-path-draw.md) 绘制轮廓（阶段 1，`0 → OUTLINE_DUR`），然后在 `OUTLINE_DUR` 处开始 enrichment：图标在组装完成后「醒过来」。
- **逐个图标错开入场** —— 对于一排图标，每个图标的 enrichment 在它淡入时开始，而不是全部同步。

## 取值

| token                           | 范围                 | 说明                                                                                            |
| ------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| MIN_REVOLUTIONS                 | 0.5–2.0              | 如果结束帧可见，避免整数圈数（会回到起点位置）                                                  |
| SEC_REVOLUTIONS                 | 4–10                 | 要 > MIN × 3，否则看不出速度差异                                                                |
| PULSE_CYCLES                    | 3–5s 的 comp 内 2–4 次 | ≥5 看起来是焦躁的闪烁；≤1 看起来像被遗忘了                                                    |
| PULSE_DOT_AMP                   | 0.05–0.20            | 0.05 = 呼吸；0.20 = 搏动                                                                        |
| PULSE_RING_AMP                  | 0.04–0.12            | 必须 < PULSE_DOT_AMP，否则圆环会盖过圆点                                                        |
| PULSE_RING_OPACITY_BASE / \_AMP | 0.4–0.6 / 0.3–0.5    | BASE − AMP ≥ 0 且 BASE + AMP ≤ 1                                                                |
| DASH_FLOW_TOTAL_OFFSET          | ±100–400             | 必须是虚线周期（dash + gap）的整数倍，否则结束帧会出现相位跳变                                  |

## 关键约束

- **上面所说的 transform 中心陷阱** —— 任何围绕明确内部点的旋转/缩放都用 SVG `transform` 属性；绝不要在细线或小的内部形状上用 CSS `transform-origin` + `transform-box: fill-box`。
- **不要用 `requestAnimationFrame`** —— 和 CSS 动画一样，它与 HF 的逐帧 seek 不同步；持续的运动以线性代理 tween 的形式放在 timeline 内部。
- **幅度要含蓄** —— 图标是装饰，不是大标题；旋转速度要按 composition 的长度来校准，而不是按绝对时间。
- **零件之间错开相位** —— 分针和秒针速度不同，圆环比圆点滞后 π/2。完全同步看起来很机械。
- 流动/虚线的线条上设 **`stroke-linecap: round`**，让虚线的边缘干净。
- **高潮停留 ≥1s** —— 如果 enrichment 是大标题那一拍，composition 在最戏剧性的时刻之后还要继续 ≥1s。

## 另见

`svg-path-draw`（先画轮廓，再做 enrichment）· `orbit-3d-entry`（绕轨道运动的元素就是做了 enrichment 的图标）· `sine-wave-loop`（内部零件动的同时，整个图标漂浮）。
