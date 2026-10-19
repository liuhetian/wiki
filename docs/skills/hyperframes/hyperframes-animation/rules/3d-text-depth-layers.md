---
name: 3d-text-depth-layers
description: >
  多个错位的文字图层在大号字体上形成一种层叠的 3D 阴影 / 挤出效果 —— 比 CSS text-shadow 更有冲击力，因为每一层都是一个完整的 DOM 元素。
metadata:
  tags: text, 3d, depth, layers, shadow, typography, stacked, extrusion
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/3d-text-depth-layers.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 3D Text Depth Layers（3D 文字纵深图层）

同一段文字按递增的偏移量渲染 N 次 —— 后层半透明，最前一层完全不透明并使用品牌色 —— 在大号字体上制造出一种实体的「层叠挤出」纵深错觉。它不同于 `text-shadow`（后者无法做到逐层的色相 / 不透明度 / 动画）：每一层都是一个真实的 DOM 元素。

## 工作原理

一个构建脚本按从后到前的顺序追加 `LAYER_COUNT` 个副本；每个后层位于 `translate(i × OFFSET_X, i × OFFSET_Y)`，alpha 逐层递减，而最前面的副本（`i = 0`）是 `position: relative`，由它决定容器尺寸（后层以绝对定位叠在它后面）。默认的入场按从后到前的顺序级联各层的淡入，同时一个代理 tween 把偏移量从 0 → 完整值逐渐拉开，于是纵深「向前搭建」，并在最后一层淡入时落定。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="depth-stack">
  <!-- layers injected by script — LAYER_COUNT copies of {label} -->
</div>
```

```css
.depth-stack {
  position: relative; /* front layer defines size; back layers stack behind */
}
.depth-text {
  font-weight: 900; /* black weight — thin text loses the illusion */
  font-size: HERO_FONT_SIZE;
  letter-spacing: HERO_LETTER_SPACING;
  line-height: 1;
  color: {frontColor};
}
.depth-text.is-back {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; /* decorative */
}
.depth-text.is-front {
  position: relative;
  z-index: 10;
}
```

```js
const stack = document.querySelector(".depth-stack");

// Build back-to-front so the FRONT (i=0) is appended LAST
for (let i = LAYER_COUNT - 1; i >= 0; i--) {
  const el = document.createElement("div");
  el.className = "depth-text " + (i === 0 ? "is-front" : "is-back");
  el.textContent = "{label}";
  if (i > 0) {
    const alpha = Math.max(BACK_ALPHA_MAX - i * BACK_ALPHA_STEP, BACK_ALPHA_MIN);
    el.style.color = `rgba({backHueRGB}, ${alpha})`; // rgba in color, NOT element opacity
    el.style.transform = `translate(${i * OFFSET_X}px, ${i * OFFSET_Y}px)`;
  }
  el.dataset.layer = String(i);
  stack.appendChild(el);
}

// Cascade entry — back layers fade in first, building forward
stack.querySelectorAll(".depth-text").forEach((el) => {
  const i = Number(el.dataset.layer);
  const finalAlpha = i === 0 ? 1 : Math.max(BACK_ALPHA_MAX - i * BACK_ALPHA_STEP, BACK_ALPHA_MIN);
  tl.fromTo(
    el,
    { opacity: 0 },
    { opacity: finalAlpha, duration: LAYER_FADE_DUR, ease: "power2.out" },
    LAYER_CASCADE_START + (LAYER_COUNT - 1 - i) * LAYER_CASCADE_STEP,
  );
});

// Depth grows on entry — offsets interpolate 0 → full
const depthState = { p: 0 };
tl.to(
  depthState,
  {
    p: 1,
    duration: DEPTH_GROW_DUR,
    ease: "power2.out",
    onUpdate: () => {
      stack.querySelectorAll(".depth-text.is-back").forEach((el) => {
        const i = Number(el.dataset.layer);
        el.style.transform = `translate(${i * OFFSET_X * depthState.p}px, ${i * OFFSET_Y * depthState.p}px)`;
      });
    },
  },
  LAYER_CASCADE_START, // align with the cascade so depth lands as the last layer fades in
);
```

## 变体

- **静态纵深**（单个 hero 镜头）—— 从 t=0 起就把所有图层渲染在最终位置上；可以选择让整个堆叠带着细微的缩放一起淡入（0.94–0.98 → 1，0.5–0.8s）。
- **动态纵深脉动** —— 增长完成之后，用一个正弦乘数 `1 + sin(p) × BEAT_AMP` 调制偏移量（BEAT_AMP 0.2–0.6；每 0.7–1.5s 一拍，看起来像心跳）。
- **后层变色** —— 不是淡成半透明，而是逐层步进色相/亮度：`hsla(HUE_BASE − i × HUE_STEP, SAT_PCT%, LIGHT_BASE − i × LIGHT_STEP%, 1)`（HUE_STEP 4–12°；更大会看起来像故障效果）。纵深看起来像一道有颜色的投影。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| LAYER_COUNT | 4–6 | <4 看不出 3D；>6 在紧凑字距下显得杂乱 |
| OFFSET_X / OFFSET_Y | 各 1–3px | >4px 看起来像故障 / 色差，而不是纵深 |
| BACK_ALPHA_MAX | 0.6–0.85 | 最近的后层；>0.9 会和前层争夺主导 |
| BACK_ALPHA_STEP | 0.08–0.15 | 小 = 柔和的渐变；大 = 一片片分立的板层 |
| BACK_ALPHA_MIN | 0.1–0.2 | 下限 —— 低于 0.1 时，最深的一层在深色背景上会消失 |
| HERO_FONT_SIZE | 最小 60px；hero 用 200–340px | 细字/小字会丢掉层叠错觉 |
| HERO_LETTER_SPACING | −0.03em–0 | 更紧的字距让偏移读作纵深，而不是重复 |
| LAYER_CASCADE_STEP | 0.04–0.10s | 越小 ≈ 同时出现；越大感觉一级一级的 |
| LAYER_FADE_DUR | 0.3–0.6s | 每层的淡入 |
| DEPTH_GROW_DUR | 0.4–0.8s | ≈ `LAYER_FADE_DUR × LAYER_COUNT / 2`，让纵深随最后一次淡入一起落定 |

## 关键约束

- **偏移方向暗示光照方向** —— `(+x, +y)` = 光来自左上，`(-x, +y)` = 来自右上；整个 composition 使用同一种正负号约定。
- **后层要半透明或者更暗 —— 绝不能比前层更饱和**（否则看起来是光晕，不是纵深）。
- **后层颜色通过 `color` 里的 `rgba()` 设置，不要用元素的 `opacity`** —— opacity 会把整个渲染出的字形连同任何阴影一起淡化。
- **前层用 `position: relative` 决定容器尺寸**；后层绝对定位并设 `pointer-events: none`；偏移用 `transform: translate()`，绝不用 `top`/`left`。
- **层叠纵深不要再叠加 CSS `text-shadow`** —— 两者会叠加，造成过度挤出。
- **堆叠之上不要做逐字母动画** —— 在 6 层纵深上做 hacker-flip / 打字机效果是一团乱；降到 2–3 层，或者只对揭示之后的静态状态施加纵深。

## 另见

`counting-dynamic-scale`（用纵深图层渲染的计数器）· `sine-wave-loop`（揭示后前层上的空闲呼吸）· `center-outward-expansion`（爆发落定后的纵深堆叠文字标识）。
