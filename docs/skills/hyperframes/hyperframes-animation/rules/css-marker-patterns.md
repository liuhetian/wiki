<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/css-marker-patterns.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 记号笔高亮的 CSS 模式

用纯 CSS + GSAP 实现 MarkerHighlight.js 全部五种绘制模式 —— 不依赖外部库，完全由 timeline 控制。代码片段只展示机制相关的 DOM，放在一个标准的场景 clip 内（hyperframes-core）；假定 `tl` 已存在。

所有模式共用的骨架：包裹层是 `position: relative; display: inline`；文字副本是 `position: relative`，z-index 在强调装饰**之上**（sketchout 模式例外，它在装饰之下，因为线条要划过文字）。

## 1. Highlight 模式

在文字后面扫过的黄色记号笔 —— 最常用的模式。

```html
<span class="mh-highlight-wrap">
  <span class="mh-highlight-bar" id="hl-1"></span>
  <span class="mh-highlight-text">highlighted text</span>
</span>
```

```css
.mh-highlight-bar {
  position: absolute;
  inset: 0 -6px; /* bleed past the text edges */
  background: #fdd835;
  opacity: 0.35;
  transform: scaleX(0);
  transform-origin: left center;
  border-radius: 3px;
  z-index: 0;
}
```

```js
tl.to("#hl-1", { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.6);
// Optional hand-drawn skew: gsap.set("#hl-1", { skewX: -2 });
// Multi-line: tl.to(".mh-highlight-bar", { scaleX: 1, ..., stagger: 0.3 }, 0.6);
```

## 2. Circle 模式

围绕文字的手绘椭圆 —— `border-radius: 50%` 再加一点旋转，带来有机的手绘感。

```html
<span class="mh-circle-wrap">
  <span class="mh-circle-text">IMPORTANT</span>
  <span class="mh-circle-ring" id="circle-1"></span>
</span>
```

```css
.mh-circle-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130%; /* tight (short words): 150%; rounded-rect: 120% + border-radius: 30% */
  height: 160%;
  transform: translate(-50%, -50%) rotate(-3deg) scale(0);
  border: 3px solid #e53935;
  border-radius: 50%;
  z-index: 0;
}
```

```js
tl.to("#circle-1", { scale: 1, rotation: -3, duration: 0.6, ease: "back.out(1.7)" }, 0.7);
```

## 3. Burst 模式

从文字中心向外辐射的线条 —— 每条线是一个定位好的 span，旋转到各自的角度。用约 12 条线、每 30° 一条，并且**让 `--len` 各不相同（40–80px）**；长度全都一样看起来很机械。

```html
<span class="mh-burst-wrap">
  <span class="mh-burst-text">WOW</span>
  <span class="mh-burst-container" id="burst-1">
    <span class="mh-burst-line" style="--angle: 0deg; --len: 70px;"></span>
    <span class="mh-burst-line" style="--angle: 30deg; --len: 55px;"></span>
    <!-- …one line per 30° step through 330deg, --len varied 40-80px -->
  </span>
</span>
```

```css
.mh-burst-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  z-index: 1; /* text copy at z-index: 2 */
}
.mh-burst-line {
  position: absolute;
  display: block;
  width: 3px;
  height: var(--len);
  background: #1e88e5;
  left: -1.5px;
  top: calc(-1 * var(--len));
  transform: rotate(var(--angle));
  transform-origin: bottom center;
  opacity: 0;
}
```

```js
tl.fromTo(
  "#burst-1 .mh-burst-line",
  { scaleY: 0, opacity: 0 },
  { scaleY: 1, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.03 },
  0.7,
);
```

## 4. Scribble 模式

通过 `stroke-dashoffset` 自己画出来的波浪形 SVG 下划线。

```html
<span class="mh-scribble-wrap">
  <span class="mh-scribble-text">underlined text</span>
  <svg class="mh-scribble-svg" viewBox="0 0 500 24" preserveAspectRatio="none">
    <path
      id="scribble-1"
      d="M0,12 Q31,0 62,12 Q93,24 125,12 Q156,0 187,12 Q218,24 250,12 Q281,0 312,12 Q343,24 375,12 Q406,0 437,12 Q468,24 500,12"
      fill="none"
      stroke="#FDD835"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</span>
```

```css
.mh-scribble-svg {
  position: absolute;
  left: 0;
  bottom: -6px; /* strikethrough variant: top: 50%; transform: translateY(-50%) */
  width: 100%;
  height: 24px;
  z-index: 0;
}
```

```js
const path = document.querySelector("#scribble-1");
const len = path.getTotalLength();
gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
tl.to("#scribble-1", { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" }, 0.7);
```

路径调校：`Q` 控制点的 y 在 0 和 24 之间交替，形成自然的起伏。波更密 = x 增量更小（每半个波约 25px）；更疏 = 约 50px；幅度更含蓄 = y 范围取 0–16。

## 5. Sketchout 模式

在被弱化的文字上画交叉线 —— 两条斜线形成「划掉」的效果。

```html
<span class="mh-sketchout-wrap">
  <span class="mh-sketchout-text">old price</span>
  <span class="mh-sketchout-lines" id="sketchout-1">
    <span class="mh-sketchout-line mh-sketchout-fwd"></span>
    <span class="mh-sketchout-line mh-sketchout-bwd"></span>
  </span>
</span>
```

```css
.mh-sketchout-lines {
  position: absolute;
  inset: 0 -4px;
  overflow: hidden;
  z-index: 1; /* text at z-index: 0 — the lines cross OVER it */
}
.mh-sketchout-line {
  position: absolute;
  display: block;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: #e53935;
  transform-origin: left center;
}
.mh-sketchout-fwd {
  transform: scaleX(0) rotate(-12deg);
}
.mh-sketchout-bwd {
  transform: scaleX(0) rotate(12deg);
}
```

```js
// Forward slash first, backward follows
tl.to("#sketchout-1 .mh-sketchout-fwd", { scaleX: 1, duration: 0.3, ease: "power2.out" }, 1.0);
tl.to("#sketchout-1 .mh-sketchout-bwd", { scaleX: 1, duration: 0.3, ease: "power2.out" }, 1.15);
```

## 在字幕中组合多种模式

在各个字幕组之间轮换模式，增加视觉变化 —— 高能量时每 2-3 组换一次，中等能量每 3-4 组，低能量每 4-5 组：

```js
const MODES = ["highlight", "circle", "burst", "scribble"];
GROUPS.forEach((group, gi) => {
  const mode = MODES[gi % MODES.length];
  group.emphasisWords.forEach((word) => applyMode(word.el, mode, tl, word.start));
});
```
