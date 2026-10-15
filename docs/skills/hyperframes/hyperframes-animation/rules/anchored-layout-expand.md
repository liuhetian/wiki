---
name: anchored-layout-expand
description: >
  边缘固定的容器只沿一个轴伸展（或收起），文档流中的内容随之重排 —— 胶囊按钮向下弹开成下拉菜单、面板长出一摞子任务、输入卡片随输入文字换行而拉高、窗格展开盖住相邻元素。只用 transform（mask + 滑动，或代理驱动的 scaleY + 反向缩放），因为禁止 tween width/height；对后续内容的推挤是同一个 tween 上相匹配的位移。
metadata:
  tags: expand, collapse, anchored, dropdown, menu, accordion, panel, reflow, push, mask, counter-scale, layout
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/anchored-layout-expand.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 锚定布局展开

> 法则：**先在 CSS 中按最终（展开后）状态编写布局，再用 transform 伪造收起状态。** 容器的尺寸从不改变 —— 改变的是*可见*区域 —— 下游的一切都跟随一个相匹配的位移。浏览器只计算一次布局；每个中间帧都纯粹是 transform。

这就是单轴生长的基本原语：一个在某一边固定的容器看起来沿单一轴伸展，排在它后面的文档流内容与移动中的边缘完美贴合着一起移动 —— 下拉菜单、子任务堆叠、不断长高的输入卡片、窗格加宽盖住相邻元素。生长和推挤是同一个运动：只要面板底边与被推的内容出现分离或重叠，错觉就破了。

区别于 [card-morph-anchor.md](card-morph-anchor.md)（自由浮动的容器在两个镜头之间形变，没有需要推挤的邻居 —— 本规则的容器是一个活跃的布局参与者）、[spring-pop-entrance.md](spring-pop-entrance.md)（在一个点上出现，没有边缘移动或重排）以及 [reactive-displacement.md](reactive-displacement.md)（被撞进来的闯入者挤开；这里内容移动是因为容器的边缘到达了它 —— 是布局上的因果，不是碰撞）。

## 原理

1. **Mask（遮罩）** —— 一个按最终主体高度（`BODY_H`）设定的包裹层，`overflow: hidden`。从不 tween。
2. **Sheet（内容片）** —— 遮罩内的面板表面 + 内容，起始于 `y: -BODY_H`（收在遮罩窗口上方，藏在固定的 header 后面）。
3. **Below（下方区）** —— 唯一一个包裹层，装着容器之后的所有内容，同样起始于 `y: -BODY_H`。
4. **Grow（生长）** —— 唯一一个 `fromTo` 同时驱动 sheet 和 below 从 `y: -BODY_H → 0`。共享 tween ⇒ 下降中的底边与被推的内容在结构上就保持精确贴合。收起 = 把同一对元素 tween 回去。

当表面必须看得出是在**原地拉伸**（行从顶部开始依次显露，或窗格横向生长）时，改用下面的代理反向缩放变体。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="stack">
  <div class="expander">
    <div class="expander-head">{headerLabel}</div>
    <div class="expand-mask" id="expand-mask" data-layout-allow-overflow>
      <div class="expand-sheet" id="expand-sheet">
        <div class="expand-row">{rowA}</div>
        <div class="expand-row">{rowB}</div>
      </div>
    </div>
  </div>
  <!-- EVERYTHING that must be pushed lives in this one wrapper -->
  <div class="below" id="below">{followingContent}</div>
</div>
```

```css
/* Layout is the EXPANDED end state — no collapsed geometry exists in CSS. */
.expander-head {
  position: relative;
  z-index: 2; /* the sheet slides out from UNDER the header */
}
.expand-mask {
  height: BODY_H; /* authored final height — NEVER tweened */
  overflow: hidden;
}
.expand-sheet {
  height: BODY_H;
  border-radius: 0 0 SHEET_RADIUS SHEET_RADIUS; /* bottom-only — header + sheet read as one grown card */
  will-change: transform; /* + on .below */
}
```

```js
// BODY_H must equal the mask's CSS height exactly — measure once at build.
// (Montage caveat: per the contract, in a multi-scene master use an authored
// CSS-matched constant instead — later clips may not be laid out yet.)
const BODY_H = document.querySelector("#expand-mask").offsetHeight;

// The grow: ONE tween, BOTH sides of the seam.
tl.fromTo(
  ["#expand-sheet", "#below"],
  { y: -BODY_H },
  { y: 0, duration: GROW_DUR, ease: GROW_EASE },
  GROW_AT,
);

// Garnish: rows already ride the sheet; the fade stagger makes them read as "options arriving".
tl.fromTo(
  ".expand-row",
  { opacity: 0 },
  { opacity: 1, duration: ROW_FADE_DUR, stagger: ROW_STAGGER, ease: "power2.out" },
  GROW_AT + GROW_DUR * 0.25,
);

// Collapse — same machinery back; faster (closing is a snap decision).
tl.fromTo(
  ["#expand-sheet", "#below"],
  { y: 0 },
  { y: -BODY_H, duration: COLLAPSE_DUR, ease: "power3.in", immediateRender: false },
  COLLAPSE_AT,
);
```

## 变体

- **代理反向缩放 —— 表面原地拉伸**（行从顶部开始显露，并保持各自的屏幕位置；即「载荷卡片从工具调用那一行展开」）。用一个代理同时驱动遮罩的 `scaleY` 和 sheet 上与之精确互为倒数的缩放 —— 用两个独立的 tween 是错的：`s` 和 `1/s` 经过 easing 的中间值并不互为倒数，内容会在生长中途被压扁。内容的净缩放每一帧都是 `s × 1/s = 1`；因为一切都派生自同一个被插值的代理，所以是 seek 安全的。

  ```js
  const grow = { h: COLLAPSED_H }; // 0 for fully collapsed
  tl.fromTo(
    grow,
    { h: COLLAPSED_H },
    {
      h: BODY_H,
      duration: GROW_DUR,
      ease: GROW_EASE,
      onUpdate: () => {
        const s = Math.max(grow.h / BODY_H, 0.0001); // clamp: no divide-by-zero
        gsap.set("#expand-mask", { scaleY: s, transformOrigin: "50% 0%" });
        gsap.set("#expand-sheet", { scaleY: 1 / s, transformOrigin: "50% 0%" });
        gsap.set("#below", { y: grow.h - BODY_H });
      },
    },
    GROW_AT,
  );
  ```

- **单轴窗格展开（X）**：同一套机制旋转 90° —— 固定左边缘，sheet 从 `x: -PANE_W` 开始（或者用代理 `scaleX` + 反向缩放，原点 `0% 50%`）。明确决定邻居的命运：**覆盖**（窗格画在它上面，邻居不做 tween）或**推挤**（邻居跟随同一个 tween）。绝不两者兼有。
- **随输入换行生长** —— 输入卡片随输入文字换行而变高。做量化：每个换行边界走一小步，每步把这对元素移动一个 `LINE_H`；换行时刻来自确定性的打字时间表（[discrete-text-sequence.md](discrete-text-sequence.md)），绝不在渲染时测量。两个实战中踩过的坑：
  - **输入卡片没有固定的 header** —— 输入卡片从它的顶边开始生长（带发送按钮的底栏保持不动），所以单纯的 y 步进会把卡片顶部裁到遮罩外面。把代理反向缩放和换行量化结合起来（在每个换行时刻把代理步进一个 `LINE_H`），并把表面拆成 **sheet**（承载顶部圆角）+ **footer**（承载底部圆角），让生长的接缝保持不可见。
  - **换行的时刻与换行的位置由两个不同的权威决定** —— 打字时间表决定换行*何时*触发，浏览器的断行决定文字*实际在哪里*换行，而用比例字体时两者会悄无声息地不一致。在打字字符串中选定的拆分点上显式写一个 `\n`（配合 `white-space: pre-wrap`），让两者都派生自同一个编写好的事实。
- **弹性展开**（少用，仅限明确的俏皮风格）：`back.out(1.2)` —— 边缘会过冲几 px；被推的内容随面板一起弹（这是对的 —— 它们是贴合的）。默认仍是 `power3.out`。
- **行长出子任务堆叠**：该行是固定的 header，堆叠是 sheet，之后的每一行都放在 `#below` 里；把几个作用域串联起来，实现渐进式展开。
- **FLIP 交接**：如果容器在改变大小的同时还要移动到新的布局位置（prompt 升级为标题、卡片停靠进侧边栏），那就是 FLIP 问题 —— 见 `/hyperframes-keyframes`（FLIP 配方）。本规则仍然只专注于原地的单轴伸展。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| BODY_H | 测量 / 编写 | 与 CSS 高度有偏差 = 完全展开时出现可见的缝隙或重叠 |
| GROW_AT | 触发的那一拍 + 0–0.1s | 生长需要一个起因（点击 / 换行 / 状态变化那一拍），否则看起来像闹鬼 |
| GROW_DUR | 0.35–0.6s | 低于约 0.3s 时，被推的内容看起来像是瞬移 |
| GROW_EASE | 默认 `power3.out` | `back.out(1.1–1.3)` 仅用于俏皮风格 |
| ROW_STAGGER / \_FADE_DUR | 0.04–0.08s / 0.2–0.3s | 在生长进行到约 25% 时才开始显示各行，免得有行在关闭的面板里闪现 |
| COLLAPSE_DUR | 0.2–0.35s，`power3.in` | 比展开快 |
| STEP_DUR / LINE_H | 0.12–0.2s / CSS line-height | 随输入换行生长的变体；WRAP_TIMES 来自打字脚本 |

## 关键约束

- **绝不 tween `width` / `height` / `top` / `left` / `margin` / `padding`** —— 遮罩的高度是 CSS 常量；只有它的子元素做 transform。tween 遮罩本身恰恰就是本规则所取代的那个禁用做法。
- **遮罩上加 `data-layout-allow-overflow`** —— 收起阶段在结构上就会把 sheet 停放在遮罩盒子之外，这会触发 `hyperframes check` 的布局闸门（`container_overflow`）。这个标记是被认可的豁免：这里的溢出是该技术在按设计工作，不是 bug。
- **Sheet + below 共用一个 tween（或一个代理）** —— 在贴合边两侧使用「相匹配但彼此分开」的 tween，是经典的接缝 bug。
- **下游的一切都跟随 `#below`** —— 包裹层之外的内容在 t=0 时会被重叠，并在生长过程中被丢在原地。
- **遮罩上加 `overflow: hidden`** —— 没有它，收起的 sheet 在 t=0 时会在 header 上方露出来。
- **反向缩放需要代理**，并钳制 `s ≥ 0.0001`（完全收起的主体会导致除以零）。
- **尺寸必须是确定性的** —— `BODY_H`、`LINE_H`、`WRAP_TIMES` 是构建时常量或一次性测量值，绝不是逐帧读取的布局值。

## 另见

`cursor-click-ripple`（引发展开的那次点击）· `spring-pop-entrance`（更丰富的逐行入场）· `discrete-text-sequence`（驱动步进生长的打字）· `scale-swap-transition`（展开后菜单的退场）· `/hyperframes-keyframes` FLIP（生长 + 移动）。
