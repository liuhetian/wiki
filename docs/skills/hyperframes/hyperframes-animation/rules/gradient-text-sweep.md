---
name: gradient-text-sweep
description: >
  一个在字形「内部」被 tween 的渐变 —— background-clip:text + 一个 backgroundPosition tween。三种形式：在停住的标题内连续的水平扫光、逐词移动的高亮，以及最终落定为纯色的色相扫动。字形本身从不移动；有限时长、确定性、seek 安全。
metadata:
  tags: gradient, text, sweep, background-clip, highlight, hue, typography, headline
---

# 渐变文字扫光

颜色**活在字形内部**：标题的填充是一个裁剪进字形里的超大渐变（`background-clip: text`），运动是渐变**穿过**文字滑动 —— 字母本身从不移动。三种形式：横扫停住的标题卡片的**连续扫光**、从左到右点亮一行文字的**逐词高亮**，以及最终落定为纯色的**色相扫动**。

边界：[asr-keyword-glow.md](asr-keyword-glow.md) 是按 ASR 时间戳逐词定时的强调 —— 本规则是一个没有音频轨的设计节拍。[ambient-glow-bloom.md](ambient-glow-bloom.md) 中移动的扫光是一层**掠过表面**的光泽；这里的渐变是被遮罩**进文字内部**的（它的「Shimmer sweep」变体就是把这里的机制改用作工作状态的循环）。[css-marker-patterns.md](css-marker-patterns.md) 是在文字*周围*画装饰，从不做填充。

## 原理

文字带着一个**比它自己的盒子更宽**的渐变背景（`background-size: SWEEP_SPAN 100%`，例如 `300% 100%`），裁剪进字形里，所以 tween `backgroundPosition` 就会让渐变滑过可见的字形。本规则的核心是两个坑：

- **只有当 `background-size` 超过 100% 时，`background-position` 的百分比才会产生位移** —— 在 100% 时图像是钉死的，tween 会悄无声息地什么也不做。
- **百分比轴的方向与感知到的移动方向相反** —— 把 `"100% 50%"` tween 到 `"0% 50%"`，高光会在文字中从左向右移动。

1. **连续扫光（停住的标题卡片）** —— 一个覆盖整个停留时间的长**线性** `backgroundPosition` tween。第一个和最后一个色标相同，所以移动没有可见的接缝，读起来是无尽的，但仍然只是一个有限时长的 tween。
2. **逐词高亮** —— 每个词都是两个像素级一致的层叠副本：一个静息颜色的基础副本，和一个 `opacity: 0` 的渐变裁剪副本。每个词有一个 opacity 包络（上升，然后在下一个词上升时下降），按索引推导的错开把高亮一路传递下去 —— 这是**包络，而不是移动的遮罩**：不需要逐词测量位置。
3. **色相扫动 → 纯色** —— 渐变保持位置不动，由一个 `filter: hue-rotate()` tween 扫动它的色相；落定是一个到纯色孪生副本的层叠交叉淡化 —— 绝不 tween 色标（色标不同的渐变无法可靠地插值）。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<!-- Forms A/C: gradient headline; solid twin behind for the Form C settle -->
<div class="headline-stack">
  <h1 class="headline solid-twin">{headlineText}</h1>
  <h1 class="headline gradient-fill" id="headline">{headlineText}</h1>
</div>

<!-- Form B: per-word stacked copies -->
<p class="line">
  <span class="word"><span class="w-base">{word1}</span><span class="w-hot">{word1}</span></span>
  <span class="word"><span class="w-base">{word2}</span><span class="w-hot">{word2}</span></span>
</p>
```

```css
.headline-stack,
.word {
  display: grid; /* twins share one cell — pixel-identical boxes */
}
.headline,
.w-base,
.w-hot {
  grid-area: 1 / 1;
}
.gradient-fill,
.w-hot {
  background-image: {gradient}; /* {sweepGradient} A/C, {highlightGradient} B */
  background-size: SWEEP_SPAN 100%; /* MUST exceed 100% or the position tween is dead */
  background-position: 100% 50%; /* start; tween toward 0% for left→right travel */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.solid-twin {
  color: {settleColor};
}
.w-base {
  color: {restColor};
}
.w-hot {
  opacity: 0; /* the envelope raises it as the highlight passes */
}
```

```js
// Form A: continuous sweep. 100% → 0% reads left→right (percent axis inverted);
// ease "none" — an eased sweep reads as an object, not light.
tl.fromTo(
  "#headline",
  { backgroundPosition: "100% 50%" },
  { backgroundPosition: "0% 50%", duration: SWEEP_DUR, ease: "none" },
  SWEEP_START,
);

// Form B: traveling highlight — per-word rise/fall envelopes, index stagger.
gsap.utils.toArray(".w-hot").forEach((el, i) => {
  const at = HIGHLIGHT_START + i * WORD_LAG;
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: HOT_RISE, ease: "power2.out" }, at);
  tl.to(el, { opacity: 0, duration: HOT_FALL, ease: "power2.in" }, at + WORD_LAG);
});

// Form C: hue-sweep, then crossfade to the solid twin (never tween color stops).
tl.fromTo(
  "#headline",
  { filter: "hue-rotate(0deg)" },
  { filter: `hue-rotate(${HUE_RANGE}deg)`, duration: HUE_DUR, ease: "power1.inOut" },
  HUE_START,
);
tl.to(
  "#headline",
  { opacity: 0, duration: SETTLE_SNAP_DUR, ease: "power2.in" },
  HUE_START + HUE_DUR,
);
```

## 变体

- **标题卡片缓移** —— 把形式 A 拉长到覆盖一段很长的结尾停留（3–8s 的结束卡片）：两端无缝衔接的渐变，`ease: "none"`，`SWEEP_DUR` = 整个停留时长。一个 tween，不循环。
- **文字内的单次光泽** —— 渐变在除一条窄高光带（≤ 约整个跨度的 25%）之外的所有地方都是静息填充色；一次 `backgroundPosition` 扫过把这条带子带过去，文字随后回到静息状态，无需交叉淡化。
- **卡拉 OK 式落定** —— 形式 B 去掉下降的 tween：这一行从左到右累积点亮，并保持全部点亮；落定颜色 = 高亮状态，基础副本一开始更暗一些。
- **渐变高潮词** —— 一个被强调的词（常常旋转约 -8°）带着渐变，而这一行的其余部分保持纯色；静态渐变 + 落地时一个短暂的形式 C 色相变化，最终落定为品牌强调色。与 `kinetic-beat-slam` 式的到场搭配使用。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| SWEEP_SPAN | 200–400% | 必须超过 100%；越宽 = 感觉越柔和 / 越慢，越窄 = 每个字形里的颜色越繁杂 |
| SWEEP_DUR | 1.2–3s | 与卡片的停留时间严格一致；慢于约 4s 就不再被感知为运动 |
| WORD_LAG | 0.25–0.5s | HOT_FALL 恰好在上升之后 WORD_LAG 处开始，让包络相互交叉 —— 有空隙 = 一次眨眼 |
| HOT_RISE / HOT_FALL | 0.15–0.3s / 0.25–0.45s | 下降稍长一些 —— 高光会「拖尾」 |
| HUE_RANGE / HUE_DUR | 40–180° / 0.8–1.6s | 超过约 180° 时，色板会在扫动中途与自身脱节 |
| SETTLE_SNAP_DUR | 0.1–0.35s | 范例中的吸附约 0.15s |
| {settleColor} | — | 取渐变自身的某个色标（或品牌主色），让落定读起来是一种归结 |

## 关键约束

- 任何 `backgroundPosition` 被 tween 的元素上都要 **`background-size` > 100%** —— 否则 tween 会悄无声息地什么也不做。
- **百分比轴是反的** —— 感知上从左到右的移动是 `100% → 0%`。
- **`-webkit-background-clip: text` 和 `background-clip: text` 都要写，并配合 `color: transparent`** —— 缺了前缀，在抓取用的浏览器里会在文字上方渲染出一整块纯渐变。
- **位置扫动用 `ease: "none"`** —— 它应该读起来像光，而不是一个在加速的物体。
- **缓移要两端无缝** —— 第一个和最后一个色标相同，否则在停留中途，循环衔接点会闪出一条硬边。
- **层叠副本必须像素级一致** —— 相同的盒子、字体、字重、字距，同一个网格单元；任何度量上的偏差都会让交叉淡化变成双重曝光。
- **孪生副本上加 `data-layout-allow-occlusion`** —— 像素级一致的层叠副本在结构上就会触发 `hyperframes check` 的 `text_occluded` 闸门；这个标记是针对该机制的被认可的豁免。
- **用交叉淡化来落定，绝不 tween 色标**；而且字形从不移动 —— 如果文字必须移动，那是包裹层上另一条规则的事。
- **不要用 CSS `@keyframes` 做微光** —— 挂钟时间驱动的动画会与 seek 失去同步；每一次扫动都是一个 timeline tween。

## 另见

`kinetic-beat-slam`（重击落下高潮词，色相落定为它收尾）· `spring-pop-entrance`（先以纯色弹入，之后再扫光）· `discrete-text-sequence`（在持续缓移下面替换文字槽）· `ambient-glow-bloom`（作用于表面层的兄弟规则）· `css-marker-patterns`（在文字周围描画；这里是填充）。
