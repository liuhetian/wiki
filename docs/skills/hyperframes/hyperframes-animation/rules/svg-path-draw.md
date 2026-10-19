---
name: svg-path-draw
description: >
  用 stroke-dasharray 和 stroke-dashoffset 让 SVG 路径逐步绘制出来的动画。
metadata:
  tags: svg, stroke, draw, path, reveal, icon, vector
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/svg-path-draw.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# SVG Path Draw

通过对描边做动画来揭示一个 SVG 形状，就像有一支笔在描画它。两个描边属性配合使用：**`stroke-dasharray = <pathLength>`** 让整条路径成为一段虚线；**`stroke-dashoffset`** 从路径长度开始（虚线段被完全移出视野 → 不可见），tween 到 `0`（完全画出）。长度来自 DOM API `path.getTotalLength()` —— 实测得到，绝不靠猜。

任何带描边的元素都适用：`<path>`、`<circle>`、`<rect>`、`<line>`、`<polyline>`、`<polygon>`、`<ellipse>`。

## 配方

```html
<!-- inside a standard scene clip -->
<svg class="logo-mark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path id="bar-left" d="M 60 40 L 60 160" />
  <path id="bar-right" d="M 140 40 L 140 160" />
  <path id="bar-mid" d="M 60 100 L 140 100" />
</svg>
```

```css
.logo-mark path {
  fill: none; /* outline-only draw — a fill would appear immediately and ruin the reveal */
  stroke: {accentColor};
  stroke-width: 12;
  stroke-linecap: round; /* softer endpoints */
  stroke-linejoin: round;
}
```

```js
// Setup: measure each path and set its dash pattern. Real measured geometry, not a magic number.
document.querySelectorAll(".logo-mark path").forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len}`;
  p.style.strokeDashoffset = `${len}`;
});

// Stagger draws so the eye reads continuous motion — each segment starts at
// ~70-80% of the previous segment's duration, before it finishes.
tl.to(
  "#bar-left",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#bar-right",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_2_START,
);
tl.to(
  "#bar-mid",
  { strokeDashoffset: 0, duration: FINAL_SEGMENT_DUR, ease: "power2.out" },
  SEG_3_START,
);

// Companion wordmark fades in only after the last stroke settles.
tl.to(
  ".brand-line",
  { opacity: 1, duration: BRAND_FADE_DUR, ease: "power1.out" },
  BRAND_FADE_START,
);
```

## 变体

- **从 12 点钟方向开始的圆环** —— `<circle>` / `<rect>` 的描边默认从 3 点钟方向开始；把元素旋转 `-90deg`，让进度环从顶部开始绘制：

```html
<circle
  cx="100"
  cy="100"
  r="60"
  id="ring"
  style="transform-origin: 100px 100px; transform: rotate(-90deg)"
/>
```

- **线性（匀速）绘制** —— 用 `ease: "none"` 做出匀速的「真实笔迹」描画。
- **先画后填** —— 对于有填充的形状，在描边完成**之后**再 tween `fillOpacity: 0 → 1`（初始需要设 `fill-opacity: 0`，并在 CSS 里设一个真正的 `fill`）：

```js
tl.to(
  "#path",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#path",
  { fillOpacity: 1, duration: FILL_FADE_DUR, ease: "power1.out" },
  SEG_1_START + SEGMENT_DRAW_DUR,
);
```

## 取值

| token             | 范围                                    | 说明                                                                                               |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| SEGMENT_DRAW_DUR  | 0.3–0.8s                                | 快速利落 vs 从容的笔迹描画；对 logo 揭示来说超过约 1s 就显得拖沓                                    |
| FINAL_SEGMENT_DUR | SEGMENT_DRAW_DUR 的 60–80%              | 与线段长度成比例 —— 一段短的连接线用完整时长，看起来会比它的兄弟线段慢                             |
| SEG_N_START       | 上一段的起点 + 其时长的 70–80%          | 看起来是连续的运动，而不是 N 个孤立的动画                                                          |
| SEG_1_START       | 0–0.4s                                  | 约 0.2s 的小小前导，让观众在运动开始前先安顿下来                                                   |
| BRAND_FADE_START  | ≥ 最后一笔结束（+ 约 0.2s 的一拍）      | 更早的话，文字标识会和绘制抢戏                                                                     |
| BRAND_FADE_DUR    | 0.3–0.8s                                | 利落（急迫）vs 滑入（高端）                                                                        |

ease 家族是离散的选择：**描边绘制**用 `power2.out`（笔画结束时手抬起来）或 `none` 做匀速 —— 绝不用 `back.out` / `elastic.out`（笔不会弹跳）。**淡入淡出**用 `power1.out`。

## 关键约束

- 只画轮廓时设 **`fill: none`** —— 否则填充会立刻出现。
- **Dasharray/dashoffset = 实测的 `getTotalLength()`**，在 setup 时设置；要求 SVG 在 DOM 里（内联 SVG 可以；通过 `<image>` 加载的 SVG 不行）。
- **复杂路径**：如果 `getTotalLength()` 看起来不对，就稍微高估一点（`len * 1.05`）—— 偏大的话在动画开始时是不可见的；偏小则会把结尾截掉。
- **多路径绘制按上一段时长的约 70–80% 错开**。
- **画出来的线必须落在某个东西上。** 当路径是一条连接线（轨道、光束、下划线、标注线）而不是一个形状时，两个端点都必须落在真实的元素上，并且这次绘制必须承担一项任务 —— 揭示、引导路线、确认，或强调。只是装饰空白处的描边看起来就是凑数；要么把它接上，要么删掉。

## 另见

`svg-icon-enrichment`（轮廓画完后内部零件开始动）· `counting-dynamic-scale`（数字递增的同时描边画出一个图标）· `hacker-flip-3d`（logo 画出，下方的文字标识解码）。
