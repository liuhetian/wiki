---
name: center-outward-expansion
description: >
  元素一开始聚集在屏幕中心，再向外扩散到各自的最终位置，由一个共享的进度值驱动。
metadata:
  tags: expansion, scatter, center, reveal, layout, sync, burst
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/center-outward-expansion.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 中心向外扩散

元素从同一个共享的中心点出发，向外辐射到各自的最终位置 —— 它本身可以就是入场的那一拍，也可以是由另一个动画的进度（一个正在计数的数字、一拍节奏）驱动的运动。它是 [depth-scatter-assemble.md](depth-scatter-assemble.md)（逐元素的 3D 点云）的扁平 2D 近亲：这里每个元素共享「同一个」原点。

## 原理

每个元素把自己的最终偏移存在 `data-target-x/y` 上。它的位置在中心和目标之间插值：`x = targetX × progress`。自我居中通过 `xPercent/yPercent: -50` 固化下来，这样被 tween 的 `x`/`y` 就纯粹是相对舞台中心的偏移。独立的爆发 = 逐项错开的 `fromTo`；被驱动的爆发 = 一个共享的代理（见「变体」）。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="burst-wrap">
  <div class="burst-item" data-target-x="-360" data-target-y="-180">{itemA}</div>
  <div class="burst-item" data-target-x="360" data-target-y="-180">{itemB}</div>
  <div class="burst-item" data-target-x="0" data-target-y="360">{itemC}</div>
</div>
```

```css
.burst-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.burst-item {
  position: absolute;
  top: 50%;
  left: 50%; /* GSAP xPercent/yPercent -50 bakes the centering; x/y tween the offset */
  will-change: transform;
}
```

```js
document.querySelectorAll(".burst-item").forEach((el, i) => {
  tl.fromTo(
    el,
    { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.6, opacity: 0 },
    {
      x: Number(el.dataset.targetX),
      y: Number(el.dataset.targetY),
      scale: 1,
      opacity: 1,
      duration: EXPAND_DUR,
      ease: EXPAND_EASE,
    },
    ENTRY_AT + i * STAGGER,
  );
});
```

## 变体

- **与驱动同步（和弦）**：当爆发要跟随一个计数器 / 一拍节奏时，去掉错开，用「一个」0→1 的代理 tween 驱动所有项，它的时长「和」ease 都要与驱动完全相同；`onUpdate` 给每一项写入 `translate(-50%,-50%) translate(targetX*p, targetY*p)` —— 两者读起来就是同一拍。
- **部分展开的起点**：有 6 个以上的项时，完全聚拢会堆成一团 —— 改为从 `{ x: targetX * START_PROGRESS, ... }` 开始。
- **待机微浮动**：落定后交接给 [sine-wave-loop.md](sine-wave-loop.md)，而不是冻结不动。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| ITEM_COUNT | 3–8 | > 8 = 扩散中途视觉混乱；项数少时要铺得更开 |
| EXPAND_DUR | 1.0–1.8s | 在同步变体中必须等于驱动的时长 |
| EXPAND_EASE | 默认 `power3.out` | `power2.out` 更柔和，`expo.out` 停得更有戏剧性；绝不用 `in` 类 ease |
| STAGGER | 0.04–0.08s | 越紧 = 和弦；越松 = 慵懒的琶音 |
| ENTRY_AT | 0–0.5s | 爆发之前留一拍构图上的安静 |
| START_PROGRESS | 0–0.5 | 0 = 戏剧化的完全聚拢；约 0.3 可避免堆成一团 |

## 关键约束

- **在固化的 `xPercent/yPercent: -50` 之上 tween `x`/`y`** —— 修改 `left`/`top` 会和居中打架，造成像素抖动。
- **只用 out 类 easing** —— `in` 类 easing 读起来像元素在半空中被吸回去。
- **`.burst-wrap` 内不要有其他绝对定位的兄弟元素** —— 它们会抢走居中的基准。
- **❗ 爆发「就是」那一拍** —— 不要在它下方停一个「真正的标题」标签（视线会跳到标签上而忽略爆发）。如果需要标签，在爆发之后再在同一个堆叠中显示它。
- 同步变体：时长 + ease 必须与驱动完全相同，否则和弦就散了。

## 另见

`counting-dynamic-scale`（经典的和弦驱动）· `depth-scatter-assemble`（逐元素的 3D 点云）· `card-morph-anchor`（从形变后的卡片中爆发出来）· `sine-wave-loop`（落定之后的生命感）。
