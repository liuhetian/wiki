---
name: stat-bars-and-fills
description: >
  把一个数字和一个图形配对的数据可视化基本元件 —— 增长柱（CSS scaleY 错开）、进度填充（条形或圆环），以及部分填充的星级评分擦除。可安全 seek，确定性的。
metadata:
  tags: data, stats, chart, bars, progress, ring, stars, rating, infographic, number
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/stat-bars-and-fills.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Stat Bars & Fills

在数字旁边给一个统计数据增添**视觉分量**的图形：一个小柱状图、一个填充到某个百分比的进度条/进度环，或者一排填充到小数评分的星星。把它们和 [counting-dynamic-scale.md](counting-dynamic-scale.md)（数字）搭配，就是一个完整的统计数据场景。

**布局蓝图 —— 只选一个，并在所有统计数据上保持一致：**

- **单焦点** —— 一个居中的画框，数字是 hero，圆环或柱条放在它下面/周围。最适合顺序揭示（同一个画框里 统计 1 → 统计 2 → 统计 3）。
- **分屏** —— 左边大数字，右边配对的图形。适合几个统计数据同时展示，或每个数据都需要独特的视觉。

在同一部作品里，不要在不同的统计数据之间混用蓝图 —— 那看起来不一致。

## 配方

### 1 —— 增长柱（CSS `scaleY` 错开）

柱条从基线开始错开生长；最后一根柱条是强调色。高度在 CSS 里写好（每根柱条用内联 height）；GSAP 只负责揭示 `scaleY: 0 → 1` —— 绝不要对 `height` 做动画。

```css
.bars {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  height: 280px;
}
.bar {
  width: 48px;
  background: #3a4a64;
  transform: scaleY(0);
  transform-origin: bottom center; /* grow UP from the baseline, not from center */
}
.bar:last-child {
  background: #ffc300; /* accent the final/current bar */
}
```

```js
tl.to(".bar", { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.3);
```

### 2 —— 进度填充

**条形** —— 从左侧原点开始的 `scaleX`：

```css
.track {
  width: 520px;
  height: 16px;
  background: #1b263b;
  border-radius: 8px;
  overflow: hidden;
}
/* width:100% is REQUIRED — an absolutely-positioned fill with no width is 0px, and scaleX of 0 is
   still 0 → the bar renders invisible (automated gates may miss a zero-width scaled element). */
.fill {
  width: 100%;
  height: 100%;
  background: #ffc300;
  transform: scaleX(0);
  transform-origin: left center;
}
```

```js
const PCT = 0.92; // 92%
tl.to(".fill", { scaleX: PCT, duration: 1.0, ease: "power2.out" }, 0.3);
```

**环形** —— 实测长度的描边绘制（机制见 [svg-path-draw.md](svg-path-draw.md)）：

```js
const ring = document.querySelector("#ring");
const LEN = ring.getTotalLength(); // measure, don't hard-code the circumference
ring.style.strokeDasharray = LEN;
ring.style.strokeDashoffset = LEN; // empty
// rotate the <circle> -90deg in CSS so the fill starts at 12 o'clock
tl.to(ring, { strokeDashoffset: LEN * (1 - 0.92), duration: 1.1, ease: "power2.out" }, 0.3);
```

### 3 —— 星级评分填充（小数）

一排金色星星从左到右揭示到某个小数值（例如 4.6 / 5），做法是在灰色图层上叠一层金色图层，对金色图层做裁剪擦除。

```html
<div class="stars">
  <div class="stars-gray">★★★★★</div>
  <div class="stars-gold" id="goldStars">★★★★★</div>
</div>
```

```css
.stars {
  position: relative;
  font-size: 64px;
  letter-spacing: 8px;
}
.stars-gray {
  color: #2b3548;
}
.stars-gold {
  position: absolute;
  inset: 0;
  color: #ffc300;
  width: 100%;
  clip-path: inset(0 100% 0 0);
}
```

```js
const RATING = 4.6,
  MAX = 5;
tl.to(
  "#goldStars",
  { clipPath: `inset(0 ${100 - (RATING / MAX) * 100}% 0 0)`, duration: 1.0, ease: "power2.out" },
  0.3,
);
```

## 取值

| token         | 范围        | 说明                                                                                |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| 柱条数量      | 4–6         | 能看出「一种趋势」又不杂乱；最后一根柱条是当前值/强调值                             |
| 填充时长      | 0.8–1.2s    | 与配对的计数动画匹配，让数字和图形一起落定（共用 ease）                             |
| stagger       | 0.06–0.1s   | 更大显得拖沓，为 0 则失去逐步搭建的感觉                                             |
| 强调色        | 恰好一种    | 柱条/填充/星星都用同一个强调色，其余都压暗                                          |

## 关键约束

- **用 `scaleY` / `scaleX` / `clipPath`，绝不 tween `height`/`width`** —— 在 CSS 里写好每根柱条的最终高度，从 0 开始缩放。
- **`transform-origin`** 必须是 `bottom`（柱条向上长）/ `left`（填充向右长）—— 默认的中心原点会从中间缩放，看起来不对。
- **`.fill` 需要 `width: 100%`** —— 宽度为零的填充无论按什么系数缩放都不可见，而自动化闸门可能发现不了。
- **实测，不要写死** —— 圆环长度用 `getTotalLength()` 取得；写死的周长在半径改变时就会出错。
- **与数字的时间匹配** —— 填充和计数动画一起到达峰值（相同的起点 + ease），让这个统计数据作为一拍而不是两拍落定；配对计数器的 `onUpdate` 必须是 O(1)（见 [counting-dynamic-scale.md](counting-dynamic-scale.md)）。
- **一种强调色，一致的蓝图** —— 见 `hyperframes-creative/references/data-in-motion.md`。

## 另见

`counting-dynamic-scale`（图形旁边的数字 —— 相同的 ease/时长）· `svg-path-draw`（进度环的绘制机制）· `hyperframes-creative/references/data-in-motion.md`（统计数据的布局 + 视觉分量）。
