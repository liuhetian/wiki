---
name: chart-scrub-readout
description: >
  一个光标 / 播放头在已经画好的图表上拖动 —— 一个驱动让竖直的跟踪线和标记点沿着预先算好的数据折线移动，同时日期 / 数值提示框逐个走过数据数组；第二条序列可以在交叉时被激活。数据是确定性的，读数只在索引变化时才写入。
metadata:
  tags: chart, scrub, readout, tooltip, tracking-line, data, cursor, playhead
---

# 图表拖动读数

图表已经「在」屏幕上了 —— 本规则是去**查验**它。一条竖直的跟踪线跟随拖动位置，一个标记点沿序列移动，一个实时提示框按位置读出 `date: value`，数值像里程表一样闪过。这就是「这些数据是真的 —— 凑近看看」的那一拍：拖动证明了这张图表是一个仪器，而不是一张图片。

与相邻规则的边界：[stat-bars-and-fills.md](stat-bars-and-fills.md) 负责图表的「到场」；[counting-dynamic-scale.md](counting-dynamic-scale.md) 负责单个数字在原地膨胀。本规则假定图形已经存在，在上面加一个移动的**读取头**。三者可以自然地串起来：线条先画进来（svg-path-draw / stat-bars），本规则在上面拖动，落定的数值再交接给一个计数上涨的 lockup。

## 原理

1. **数据在 setup 时固化** —— 一个由 `{ d, v }` 点组成的字面量 `DATA` 数组（或一个纯粹的索引公式）。折线的 `points` 属性由纯映射函数从 `DATA` 一次性算出：图表和读数共享同一个事实来源。这个镜头要论证的是「这些数据是真的」—— 每次渲染都重新生成的随机游走，既破坏确定性，也破坏这个修辞主张。
2. **一个驱动 tween** `p: 0 → 1`，在它的 `onUpdate` 里推导出一切：跟踪线的 x、标记点的 x/y、提示框的位置。每个输出都是 `p` 的纯函数 —— 任何 seek 都落到完全相同的帧上。仅仅共享时间的平行 tween 会因为舍入误差而逐渐错开，看起来像图表的装饰，而不是读取头。
3. **标记点沿折线走** —— 它的 y 在两个相邻的固化点之间插值，所用数组正是构建图表的那些；单独打关键帧的标记点不可避免地会飘离线条。
4. **读数按阈值步进** —— 最近的数据索引由 `p` 推导，`textContent` 只在该索引变化时才写入（上一次索引守卫）。transform 逐帧平滑滑动（合成器开销低）；文字按数据点步进 —— 不会逐帧折腾 DOM 文本。这个守卫是一种优化，而不是状态：任何 seek 都会重新算出相同的索引和相同的文字。

## 配方

```html
<!-- inside a standard scene clip. Size the SVG so viewBox units === CSS pixels:
     one coordinate space serves the polyline, tracking line, marker, AND the HTML tooltip. -->
<div class="chart-wrap">
  <!-- position: relative — the tooltip transforms against this box -->
  <svg class="chart" viewBox="0 0 CHART_W CHART_H" width="CHART_W" height="CHART_H">
    <polyline id="series-a" class="series" fill="none" />
    <line id="track-line" y1="0" y2="CHART_H" stroke-dasharray="6 6" />
    <circle id="marker" r="MARKER_R" />
  </svg>
  <div class="tooltip" id="tooltip">
    <span id="tip-date">{firstDate}</span>
    <span id="tip-value">{firstValue}</span>
  </div>
</div>
```

```css
.tooltip {
  position: absolute;
  top: 0;
  left: 0;
  min-width: TIP_MIN_WIDTH; /* fixed — the box must not resize as values change length */
}
#tip-value {
  font-variant-numeric: tabular-nums; /* MANDATORY — digits flicker past; widths must not */
}
```

```js
// Data baked at setup — literal values.
const DATA = [
  { d: "{date1}", v: V1 },
  // ... N points, chronological ...
];

// Pure mapping functions — geometry derives from DATA once.
const PAD = CHART_PAD;
const PLOT_W = CHART_W - PAD * 2;
const PLOT_H = CHART_H - PAD * 2;
const vals = DATA.map((p) => p.v);
const V_MIN = Math.min(...vals);
const V_MAX = Math.max(...vals);
const X = (i) => PAD + (i / (DATA.length - 1)) * PLOT_W;
const Y = (v) => PAD + PLOT_H * (1 - (v - V_MIN) / (V_MAX - V_MIN));

document
  .getElementById("series-a")
  .setAttribute("points", DATA.map((p, i) => `${X(i)},${Y(p.v)}`).join(" "));

const line = document.getElementById("track-line");
const marker = document.getElementById("marker");
const tooltip = document.getElementById("tooltip");
const tipDate = document.getElementById("tip-date");
const tipValue = document.getElementById("tip-value");

// Tooltip pops in as the scrub begins — a small fromTo scale/opacity spring at SCRUB_AT.

// ONE driver — line, marker, and tooltip are all projections of p.
const scrub = { p: 0 };
let lastIdx = -1;
tl.to(
  scrub,
  {
    p: 1,
    duration: SCRUB_DUR,
    ease: SCRUB_EASE,
    onUpdate: () => {
      const f = scrub.p * (DATA.length - 1); // fractional index
      const i = Math.min(DATA.length - 2, Math.floor(f));
      const t = f - i;
      const x = X(i) + (X(i + 1) - X(i)) * t;
      const y = Y(DATA[i].v) + (Y(DATA[i + 1].v) - Y(DATA[i].v)) * t;

      // Transforms glide every frame (cheap, deterministic)
      line.setAttribute("x1", x);
      line.setAttribute("x2", x);
      marker.setAttribute("cx", x);
      marker.setAttribute("cy", y);
      tooltip.style.transform = `translate(${x + TIP_DX}px, ${y - TIP_DY}px)`;

      // Text steps only when the nearest data point changes
      const idx = Math.round(f);
      if (idx !== lastIdx) {
        tipDate.textContent = DATA[idx].d;
        tipValue.textContent = `${DATA[idx].v.toLocaleString()} {unitLabel}`;
        lastIdx = idx;
      }
    },
  },
  SCRUB_AT,
);
// End hold: the driver finishes before the scene does — the landed value reads.
```

## 变体

- **停在峰值** —— 拖动是蓄势，落点才是那个数据：`SCRUB_EASE: "power3.out"` 减速停到最后一个点 / 峰值点上，然后在落定时弹出强调（在 `SCRUB_AT + SCRUB_DUR` 处对标记点做 `fromTo`，`scale: 1 → PEAK_POP_SCALE`）。搭配一个弹簧式弹到最终标签的胶囊提示框（[spring-pop-entrance.md](spring-pop-entrance.md)）—— 经典的「线条冲破区间上沿」高潮。
- **交叉时激活第二条序列** —— 序列 B 先处于变暗状态；在 `SCRUB_AT + SCRUB_DUR * CROSS_P` 处把它的描边 tween 到点亮的颜色（0.25s，`power2.out`），并在驱动的 `onUpdate` 中，一旦 `scrub.p ≥ CROSS_P` 就改从 B 的数组读取（仍然有索引守卫）。颜色翻转恰好落「在」交叉点上 —— 同一帧内的因果。
- **双图表滑行** —— 两拍拖动：扫过图表 A，把光标 / 提示框组合滑过两图之间的间隔（一个普通的 `x` tween，不读数 —— 这是空程，不是数据），然后图表 B 用它自己的驱动激活。每张图表一个驱动。
- **光标引导的拖动** —— 一个超大光标是可见的执行者：它是「同一个」驱动的又一个投影（在同一个 `onUpdate` 中根据 `x` 定位，光标尖端对准跟踪线的顶端）—— 绝不是另一个只是时间对得上的 tween。光标的外观和点击语法见 [cursor-click-ripple.md](cursor-click-ripple.md)。
- **播放头形式** —— 没有光标；跟踪线本身「就是」执行者（时间轴拖动条、音频波形、会话回放）。用 `ease: "none"` —— 是机械回放，不是人手。

## 取值

| token | 范围 / 默认值 | 说明 |
| --- | --- | --- |
| N（数据点数） | 10–40 | <10 读起来像幻灯片；>40 会糊成纹理。闪过本身就是重点 —— 只有第一个和最后一个值必须能看清 |
| SCRUB_DUR | 1.5–3s | 越短 = 自信的一扫；越长 = 仔细查看。驱动结束后要给场景留 ≥0.8s，让落定的数值停住 |
| SCRUB_EASE | 默认 `power1.inOut` | 播放头形式用 `"none"`；停在峰值用 `power3.out`。绝不用 `back.out` —— 读取头过冲再回读看起来像坏了 |
| CROSS_P | 0.55–0.75 | 太早则 A 来不及立住；太晚则 B 的读数没有时间展现 |
| TIP_DX / TIP_DY | 16–48px，朝右上 | 靠近图表右边缘时翻转符号，让提示框绝不出画 |
| MARKER_R / 描边宽度 | r 6–12 / 4–8px | 标记点必须比它所沿的线条更醒目 |
| TIP_MIN_WIDTH | ≥ 最长的 `date: value` 状态 | 没有它，数字变化时框会一胀一缩 |

## 关键约束

- **`DATA` 在 setup 时是字面量**；折线的点通过纯函数从它推导 —— 图表和读数共享同一个事实来源。
- **在 setup 时播种** —— 构建完之后立刻用 `p = 0` 调用一次拖动的应用函数（类似 `3d-camera-flight` 的 `applyCamera()`），否则在驱动运行之前 seek 到 t=0 时，跟踪线 / 标记点会停在它们 HTML 默认的位置上。
- **单一驱动** —— 一个 `p` tween；所有拖动输出（线、标记点、提示框、任何光标）都在它的 `onUpdate` 中计算，每一个都是 `p` 的纯函数。
- **读数写入受索引变化守卫** —— `onUpdate` 保持 O(1)：几次属性设置、一次 transform，文字只在步进时写。
- **SVG `viewBox` 单位 = CSS 像素**（`viewBox="0 0 W H"`，配上一致的 `width`/`height`）—— 同一个坐标空间必须同时服务 SVG 内部和 HTML 提示框的 transform。
- 提示框数值上加 **`tabular-nums` + 固定的 `min-width`**。
- **图表事先已存在** —— 画入动画属于 `svg-path-draw` / `stat-bars-and-fills`；把它排在拖动「之前」，不要把两者混在一起。
- **让读数落定** —— 最终数值停留 ≥0.8s（或交接给一个计数上涨的 lockup）。

## 另见

`svg-path-draw`（序列先画进来）· `stat-bars-and-fills`（周围的仪表盘装饰）· `spring-pop-entrance`（落定时峰值点 + 胶囊弹出）· `counting-dynamic-scale`（收尾的数据 lockup）· `cursor-click-ripple` / `context-sensitive-cursor`（光标引导形式中的执行者）· `control-target-sync`（相反的「写」方向的兄弟规则 —— 那里是控件编辑目标；这里是拖动读取数据集）。
