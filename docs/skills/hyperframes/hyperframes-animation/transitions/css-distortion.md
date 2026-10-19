<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/css-distortion.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

## 失真（Distortion）

### 故障（Glitch）

带 RGB 色调的 overlay（**不是** multiply 混合——用普通混合、35% 不透明度）以大幅偏移抖动。场景本身也在抖动。

```js
tl.set("#glitch-r", { opacity: 1, x: 40, y: -8 }, T);
tl.set("#glitch-g", { opacity: 1, x: -30, y: 12 }, T);
tl.set("#glitch-b", { opacity: 1, x: 15, y: -20 }, T);
tl.set(old, { x: -15 }, T);
// 6 jitter frames at 0.03s intervals with big offsets (±30-60px)
// ... swap and clear at T + 0.2
```

### 色差（Chromatic Aberration）

RGB overlay 先对齐，然后向两边分开（±80px），场景淡出，再在新场景上重新汇合。

```js
tl.set("#glitch-r", { opacity: 0.6, x: 0 }, T);
tl.set("#glitch-g", { opacity: 0.6, x: 0 }, T);
tl.set("#glitch-b", { opacity: 0.6, x: 0 }, T);
tl.to("#glitch-r", { x: -80, opacity: 0.8, duration: 0.3, ease: "power2.in" }, T);
tl.to("#glitch-b", { x: 80, opacity: 0.8, duration: 0.3, ease: "power2.in" }, T);
tl.to("#glitch-g", { y: 30, duration: 0.3, ease: "power2.in" }, T);
// Swap at T + 0.3, converge back at T + 0.3
```

### 波纹（Ripple）

快速振荡（±30px）+ 缩放变形（0.97-1.03）+ 逐渐加重的模糊。在变形峰值处交换。

```js
tl.to(old, { x: 30, scale: 1.02, duration: 0.04, ease: "none" }, T);
tl.to(old, { x: -25, scale: 0.98, filter: "blur(4px)", duration: 0.04, ease: "none" }, T + 0.04);
// ... more oscillations with increasing blur
// Swap at peak, incoming stabilizes with decreasing wobble
```

### VHS 磁带（VHS Tape）

把场景克隆成 20 条水平条带（每条 54px，用 clip-path 裁切）。每一条以带种子的伪随机偏移、按各自随机的间隔独立地在 x 方向上移动。在每一条上加红+蓝的色差偏移副本（z-index 在主条之上，35% 不透明度）。让条带比画面更宽（2020px，left:-50px），这样边缘永远不会露出来。

基于克隆的实现模式见 SKILL.md。
