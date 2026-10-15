---
name: vertical-spring-ticker
description: >
  老虎机式的垂直滚动，在一个带遮罩的容器里使用可叠加的弹簧物理 —— 每个弹簧贡献一「步」滚动。
metadata:
  tags: text, ticker, spring, scroll, vertical, slot-machine, sequence
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/vertical-spring-ticker.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Vertical Spring Ticker（老虎机）

多个弹簧 tween 被**叠加在一起**，得出总的 Y 平移量 —— 每个弹簧贡献一个离散的「步」，所以你得到的不是一次线性滚动，而是老虎机那种「咔、咔、咔」的节奏，并带有自然的落定。区别于持续滚动的跑马灯：这条规则的语义是一步步落定的离散步进；无尽的线性运动见 [sine-wave-loop.md](sine-wave-loop.md)。

## 工作原理

一个固定高度 `ITEM_HEIGHT` 的遮罩窗口（`overflow: hidden`）里装着一列垂直堆叠的条目，每个条目的高度都恰好是 `ITEM_HEIGHT`。每个弹簧持有一个 0→1 的进度；一个共享的 `onUpdate` 把它们加起来，并应用 `translateY(-sum × ITEM_HEIGHT)`。弹簧依次触发并相互重叠（`STEP_SPACING ≤ STEP_DUR`），所以每一步在上一步还在落定时就弹入了 —— 正是这种重叠让它们可以叠加，而 `back.out` 的过冲让每一步看起来都是一声「咔」。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="ticker" id="ticker">
  <div class="stack-inner" id="stack-inner">
    <div class="item">{item0}</div>
    <div class="item">{item1}</div>
    <div class="item">{itemN}</div>
  </div>
</div>
```

```css
.ticker {
  width: TICKER_WIDTH;
  height: ITEM_HEIGHT; /* MUST match .item height exactly */
  overflow: hidden; /* the mask is the window */
}
.stack-inner {
  display: flex;
  flex-direction: column; /* mandatory — vertical stacking */
}
.item {
  height: ITEM_HEIGHT; /* MUST equal .ticker height */
  display: flex;
  align-items: center;
  justify-content: center;
  /* font-variant-numeric: tabular-nums; — for numeric tickers */
}
```

```js
const innerEl = document.getElementById("stack-inner");
const springs = Array.from({ length: STEPS }, () => ({ p: 0 }));

function applyTransform() {
  const sumP = springs.reduce((acc, s) => acc + s.p, 0);
  innerEl.style.transform = `translateY(${-sumP * ITEM_HEIGHT}px)`;
}
applyTransform(); // initial state

springs.forEach((spring, i) => {
  tl.to(
    spring,
    {
      p: 1,
      duration: STEP_DUR,
      ease: `back.out(${BOUNCE_FACTOR})`,
      onUpdate: applyTransform,
    },
    STEP_START + i * STEP_SPACING,
  );
});
```

## 变体

- **数字滚轮（价格 / 计数器滚动）** —— 条目是数字序列；对每个十进制位分别运行同样的弹簧步进模式。必须设 `font-variant-numeric: tabular-nums`。
- **反向（倒计时）** —— 翻转正负号（`translateY(${sumP * ITEM_HEIGHT}px)`），并把条目按相反顺序排列。
- **组间停顿** —— 几次快速的步进（`STEP_SPACING` 小），一次长停顿，然后用更大的 `BOUNCE_FACTOR` 做一次戏剧性的最后一步。停顿正是眼睛锁定的时刻。
- **持续无限的滚动条** —— **不是**这条规则（这条规则是离散步进）；循环的新闻滚动条是一个带重复条目的单个线性 tween —— 持续运动的语义见 [sine-wave-loop.md](sine-wave-loop.md)。

## 取值

| token         | 范围                  | 说明                                                                                  |
| ------------- | --------------------- | ------------------------------------------------------------------------------------- |
| ITEM_HEIGHT   | 约 `fontSize × 1.25`  | 必须装得下大写字母和下伸部分；`.ticker` 的高度**必须**与它严格相等                    |
| TICKER_WIDTH  | viewport 宽度的 30–60% | 宽到足以放下最长的条目而不出现省略号                                                 |
| STEPS         | 1–4                   | 是转换的次数，不是条目数；`STEPS ≤ itemCount − 1`                                     |
| STEP_DUR      | 0.3–0.7s              | 低于 0.3 过冲看不出来；超过 0.7 这一声「咔」看起来就成了滑动                          |
| STEP_SPACING  | 0.3–0.5s              | **≤ STEP_DUR**，让弹簧相互重叠（可叠加）；间隔更宽看起来是懒洋洋的线性滚动            |
| BOUNCE_FACTOR | 1.4–2.5               | 1.4 轻柔的咔 / 2.0 紧实 / 2.5+ 赌场式的旋转并落定，用于高潮那一步                     |

参考：`../examples/proof-logo-chain.html`（204px、1 步、0.45s）。

## 关键约束

- **容器高度 = 条目高度，逐像素精确，所有条目等高** —— 不匹配会在遮罩上方/下方露出条目的部分边缘，并在多步之间累积漂移。
- **`overflow: hidden` 设在容器上，而不是内部的堆叠上**；堆叠上设 `flex-direction: column`。
- **在 `onUpdate` 里把弹簧加起来 —— 绝不要直接 tween 最终位置。** 每个弹簧贡献**自己的**一次弹入，这才是老虎机的节奏。
- **步与步要重叠，并且每一步都保留 `back.out`** —— 不重叠的步进，或者只用普通 out 缓动，都会塌缩成线性滚动。
- **绝不要在步与步之间通过 `innerHTML` 更新条目** —— 滚动条通过平移来移动**同一批**条目；替换内容会让上一个条目**冒充**新条目出现（错觉被打破）。
- **最后一步之后高潮停留 ≥1s**（SKILL 的通用约束）。
- **数字滚轮用 `tabular-nums`** —— 数字宽度不一会破坏对齐。

## 另见

`reactive-displacement`（被一个进入的元素推动的滚动条）· `scale-swap-transition`（滚动条落定后缩小退出）· `press-release-spring`（按钮按压触发旋转）。
