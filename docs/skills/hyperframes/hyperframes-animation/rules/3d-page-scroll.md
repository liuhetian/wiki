---
name: 3d-page-scroll
description: >
  把整张网页渲染成一张倾斜的 3D 卡片，通过滚动来揭示特定的区块。
metadata:
  tags: 3d, page, scroll, webpage, tilt, product-demo, perspective
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/3d-page-scroll.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 3D Page Scroll（3D 页面滚动）

一张网页（或一段长内容）以一张倾斜的 3D 卡片呈现。带弹簧般缓动的滚动揭示特定的区块，同时静态的 3D 透视增添了物理上的纵深。（要找真正行进/倾斜的镜头，见 [3d-camera-flight.md](3d-camera-flight.md) —— 这条规则里的倾斜从不移动。）

## 工作原理

两个相互独立的 transform 组合在一起：

1. **3D 倾斜** —— 卡片上静态的 `rotateY` + `rotateX`，配合 `perspective`。角度在整个场景中**不会**改变。
2. **滚动** —— 卡片里的内容在一个裁切容器内纵向平移（GSAP 里的 `y`）；通过 `power3.out` / `power4.out` 实现弹簧般的减速。

可选：**聚光遮罩（spotlight overlay）** —— 滚动落定后，一个径向渐变遮罩把焦点区域以外的一切调暗。它位于滚动内容之上，相对卡片固定，绝不放在 `.page-content` 里面。

## 配方

```html
<div class="tilt-card">
  <div class="page-content">
    <!-- Full {Brand} webpage recreation, taller than the card so scrolling
         matters. Each section is REAL DOM, not a screenshot — screenshots
         can't be individually highlighted or scrolled-to with precision. -->
    <section class="page-hero">{heroContents}</section>
    <section class="page-features">{featuresContents}</section>
    <section class="page-target" id="target-section">{targetContents}</section>
    <section class="page-cta">{ctaContents}</section>
  </div>
  <div class="spotlight"></div>
</div>
```

```css
.tilt-card {
  position: absolute;
  left: 50%;
  top: 50%;
  /* tilt + perspective in CSS only if no other transform tween touches this
     element — if GSAP also tweens scale on .tilt-card, set the tilt via
     gsap.set() instead to avoid matrix overwrites */
  transform: translate(-50%, -50%) perspective({perspectivePx}) rotateY({tiltYDeg}) rotateX({tiltXDeg});
  transform-style: preserve-3d;
  width: {cardWidth};
  height: {cardHeight};
  border-radius: 24px;
  background: {cardBackgroundColor};
  overflow: hidden; /* clip the scrolling content at the rounded corners */
  /* shadow X-offset sign must match tiltY sign (negative tiltY ⇒ positive X) */
  box-shadow: 40px 30px 80px rgba(0, 0, 0, 0.45);
}
.page-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* height intrinsic from sections — taller than the card */
}
.spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(ellipse 60% 35% at 50% 50%, transparent 50%, {spotlightDimColor} 100%);
}
```

```js
// SCROLL_DISTANCE is measured at design time from the real page layout
// (top of .page-content origin to vertical center of #target-section,
// accounting for card height) — NOT a free tunable.
tl.to(
  ".page-content",
  { y: -SCROLL_DISTANCE, duration: SCROLL_DUR, ease: "power3.out" },
  SCROLL_AT,
);

// Spotlight fades in on the target after the scroll settles.
tl.to(
  ".spotlight",
  { opacity: 1, duration: SPOTLIGHT_FADE_DUR, ease: "power1.inOut" },
  SPOTLIGHT_AT,
);
```

## 变体

**多步滚动（滚动 → 暂停 → 滚动）** —— 在不同位置放多个 `y:` tween。两段距离都从 `.page-content` 的原点量起（而不是相对上一步的增量）；GSAP 会在同一个属性上组合先后的 `y:` tween，每一个都从上一个留下的值开始：

```js
tl.to(
  ".page-content",
  { y: -SCROLL_DISTANCE_A, duration: SCROLL_DUR, ease: "power3.out" },
  SCROLL_AT_A,
);
tl.to(
  ".page-content",
  { y: -SCROLL_DISTANCE_B, duration: SCROLL_DUR, ease: "power3.out" },
  SCROLL_AT_B,
);
// SCROLL_AT_A + SCROLL_DUR ≤ SCROLL_AT_B — the two scrolls must not fight for y
```

## 取值

| token | 范围 / 规则 | 说明 |
| --- | --- | --- |
| tiltYDeg | −12 到 −4（向左倾）或 4 到 12 | 越大 = 3D 越有戏剧性；接近 0 会塌成一块扁平面板 |
| tiltXDeg | 0–6 | 正值让顶边向后倒去 |
| perspectivePx | 800–2000 px | 越小 = 透视缩短越强；越大 = 几乎是正交投影 |
| cardWidth / Height | 卡片高度 < 内容总高度 | 否则滚动没有东西可揭示 |
| sectionHeight | Σ 高度 ≥ cardHeight + SCROLL_DISTANCE | 这样目标区块才能落在画面内 |
| SCROLL_AT | ≥ `.page-content` 上之前那些 tween 的结束时间 | |
| SCROLL_DUR | 0.8–1.8 s | 更短感觉像硬切；更长感觉像程序在跑 |
| SCROLL_DISTANCE | 从布局中测量 | 取自各区块实际的累计高度 —— 绝不估算；不要超出内容末端 |
| SPOTLIGHT_AT | ≥ SCROLL_AT + SCROLL_DUR（或稍早一点） | 聚光揭示刚刚到位的区块 |
| SPOTLIGHT_FADE_DUR | 0.4–0.8 s | |
| Ease | 默认 `power3.out`；要动量用 `power4.out`；电影感摇镜用 `power2.inOut` | 场景里所有滚动只选一种 —— 混用 easing 看起来一顿一顿的 |

## 关键约束

- **倾斜是静态的** —— 卡片在整个场景中保持它的角度。
- **阴影方向与倾斜一致** —— 向左倾的卡片把阴影投向右边（正的 X 偏移）；不一致会打破 3D 错觉。
- **页面内容是真实的 HTML，不是截图**；滚动距离来自真实的布局几何。
- **`.tilt-card` 上设 `overflow: hidden` + `transform-style: preserve-3d`** —— 在圆角处裁切；preserve-3d 用于任何 3D 子元素 / 干净的透视合成。
- **聚光是滚动内容之上的一层 overlay**，绝不放在 `.page-content` 里面。
- **多阶段滚动全程用同一种 easing**，并且各次滚动的时间窗互不重叠。

## 另见

[asr-keyword-glow.md](asr-keyword-glow.md)（与旁白同步的页面关键词高亮）· [multi-phase-camera.md](multi-phase-camera.md)（页面滚动时的镜头缩放）· [cursor-click-ripple.md](cursor-click-ripple.md)（光标落在滚动进入视野的区块里）· [3d-camera-flight.md](3d-camera-flight.md)（当镜头本身应该行进时）。
