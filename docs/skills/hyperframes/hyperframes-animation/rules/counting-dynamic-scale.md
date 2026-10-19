---
name: counting-dynamic-scale
description: >
  计数动画：数值向上计数，同时 transform 的 scale 增长到最终尺寸，营造不断加码的视觉分量，而不用每帧重排文字。
metadata:
  tags: counter, counting, scale, transform, number, dynamic, emphasis
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/counting-dynamic-scale.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 动态缩放计数

一个数字从 A 计数到 B，同时它的 transform scale 增长到最终尺寸 —— 不断加码的视觉分量（「这很厉害」），而无需 tween `font-size`，也不会每帧都强制文字布局。最终字号是静态 CSS；只有 transform 在变。

## 原理

两个同步的 tween，放在「相同」的 timeline 位置、使用「相同」的 ease：（1）一个代理值通过 `onUpdate` 渲染成文字（`Math.round(...).toLocaleString()`），（2）计数器的 transform `scale: START_SCALE → 1`，其中 `START_SCALE = START_SIZE / END_SIZE`。后缀（`%`、`×`、`+`）在计数落定「之后」才滑入 —— 让数字拥有自己的那一拍 —— 而标签则较早淡入。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="counter-wrap">
  <span class="counter" id="counter">0</span><span class="counter-suffix">{suffix}</span>
</div>
<div class="counter-label">{label}</div>
```

```css
.counter-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  width: {counterContainerWidth}; /* fixed width — no layout shift as digit count changes */
}
.counter {
  font-variant-numeric: tabular-nums; /* MANDATORY — digits keep equal width */
  display: inline-block;
  font-size: {endSize}; /* final size is static; GSAP animates scale, not font-size */
  transform-origin: center center;
}
.counter-suffix {
  opacity: 0;
  transform: translateY(20px);
}
```

```js
const counter = document.getElementById("counter");
const state = { value: 0 };
const START_SCALE = START_SIZE / END_SIZE;

// Count value — onUpdate changes text only
tl.to(
  state,
  {
    value: TARGET_VALUE,
    duration: COUNT_DUR,
    ease: COUNT_EASE,
    onUpdate: () => {
      counter.textContent = Math.round(state.value).toLocaleString();
    },
  },
  0,
);

// Visual growth — compositor transform sharing the count's timing + ease
tl.fromTo(counter, { scale: START_SCALE }, { scale: 1, duration: COUNT_DUR, ease: COUNT_EASE }, 0);

// Suffix slides in AFTER the count completes
tl.to(
  ".counter-suffix",
  { opacity: 1, y: 0, duration: SUFFIX_DUR, ease: `back.out(${SUFFIX_BOUNCE_FACTOR})` },
  COUNT_DUR,
);

// Label fades in early
tl.from(".counter-label", { opacity: 0, y: 12, duration: LABEL_DUR, ease: "power2.out" }, LABEL_AT);
```

## 变体

- **直接 tween `innerText`（不用代理）** —— 对于只有数字的计数器，GSAP 可以直接 tween `innerText`；需要本地化格式或后缀逻辑时，保留代理形式。无论哪种，缩放 tween 都保持独立：

```js
tl.to(
  counter,
  { innerText: TARGET_VALUE, duration: COUNT_DUR, ease: COUNT_EASE, snap: { innerText: 1 } },
  0,
);
```

- **3D 纵深入场** —— 加一个 `tl.from(".counter", { z: -300, ... }, 0)` 推入；需要在 `.counter-wrap` 上设 `perspective`，并在计数器上设 `transform-style: preserve-3d`。
- **多项数据协同揭示** —— 3 个并行计数的数据共用「相同」的 ease、时长和起始位置，让它们一起结束（是和弦，不是琶音）。每项数据通常还需要一个配套图形（条形 / 圆环 / 星级）—— 不要只停在数字上；见 [stat-bars-and-fills.md](stat-bars-and-fills.md)。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| TARGET_VALUE | 理想是 2–3 位数 | 4 位以上需要更宽的容器；必须能以 END_SIZE 完整显示而不被裁剪 |
| START_SIZE / END_SIZE | START ≈ END 的 40–60% | 是设计输入，只用来算一次 START_SCALE；两者都绝不 tween |
| COUNT_DUR | 1.2–2.5s | 低于约 0.8s 读起来像一闪而过 —— 眼睛必须能看清滚过的数字 |
| COUNT_EASE | `power2.out` / `power3.out` ⭐ / `expo.out` | 数值和缩放共用；`.out` 越强 = 峰值处的减速越有戏剧性 |
| SUFFIX_DUR | 0.3–0.6s | 在 `COUNT_DUR` 处触发，绝不在计数过程中 |
| SUFFIX_BOUNCE_FACTOR | 1.4–2.0 | 后缀可以过冲（它是标点，不是数据） |
| LABEL_AT / LABEL_DUR | AT < COUNT_DUR/2；0.4–0.7s | 标签在计数到达峰值之前出现 |

## 关键约束

- **必须用 `tabular-nums`**，再加固定宽度的容器作为双保险 —— 没有它们，位数变化（9 → 10 → 100）时字形宽度改变会导致抖动。
- **绝不在 `onUpdate` 中设置 `fontSize`** —— 最终字号是静态 CSS；每帧只有 transform 在变。保持 `onUpdate` 为 O(1)：只设置文字，不写样式，不创建 DOM。
- **用 `Math.round`，不用 `Math.floor`** —— 走到最后一个整数的一半时，就应该已经显示最终值。
- **计数器本身避免用 `back.out` / `elastic.out`** —— 过冲会让数字看起来不稳定（它是数据，不是装饰）。原地增长，不要弹跳。
- **标签是「大字」，不是页面式的说明文字** —— 在 hero 尺寸的数字下面放一小段文字，在视频里读起来就是视觉噪声。用展示级字号、大写、加字距：标签是标题的一部分。

## 另见

`stat-bars-and-fills`（配套图形 —— 给它相同的 ease / 时长，让数字和填充作为同一拍落定）· `svg-path-draw`（在数字周围画入的图标）· `center-outward-expansion`（在计数峰值时向外爆发的图标）。
