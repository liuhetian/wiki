---
name: spring-pop-entrance
description: >
  标准的弹出式入场 —— 一个元素（或错开的一组元素）通过从 0 → 1 缩放抵达，以平滑的长尾落定（默认 power3）；带弹性的过冲是少有的、明确用于俏皮风格的例外。使用 fromTo，保证 seek 时 t=0 也是正确的。
metadata:
  tags: spring, entrance, pop, scale, power3, settle, stagger, reveal, arrival
---

# Spring-Pop Entrance

> **平滑胜过弹跳。** 这个入场默认使用平滑的长尾落定 —— `power3.out`（想要更快的前段就用 `expo.out`）—— 干净地减速到静止尺寸，**没有过冲**。带弹性的 `back.out` 是 agent 做的视频里**头号的瞬间劝退点**，几乎从来没被用好过；它是少有的、明确用于俏皮风格的例外（面向消费者 / 好玩的品牌），绝不是默认。拿不准时，就平滑地落定。

这是入场的基本元件：一个元素（或错开的一组元素）从无到有弹出来抵达 —— `scale: 0 → 1`，可选一点小幅的 `y` 上升 —— 然后不带弹跳地落定。这是**抵达**，不是反应：区别于 [press-release-spring.md](press-release-spring.md)（对一个已经停在屏幕上的元素做的点击/按压 → 释放反馈链）。过去很多蓝图会借用那条规则来伪造入场；现在应该改用这条。

## 工作原理

一个 `fromTo` 承载整个抵达过程：从 `{ scale: 0, opacity: 0 }`（显式写出，让 seek 时 t=0 是正确的）到 `{ scale: 1, opacity: 1, ease: "power3.out" }`。对于**一组**元素，同一个 `fromTo` 在 `i * STAGGER` 处逐个运行，并加以封顶，让整组看起来是同一拍里的一次抵达。`scale` 的放大是承重的；`y` 的上升只是点缀 —— 其他东西全去掉，它也必须仍然看起来是一次干净的入场。让 ease 来产生落定：绝不要手动加一个 `scale: 1.1` 的中间状态（它会和曲线叠加出双重弹跳）。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="pop-hero" id="hero">{heroLabel}</div>

<div class="pop-grid">
  <div class="pop-item">{itemA}</div>
  <div class="pop-item">{itemB}</div>
  <div class="pop-item">{itemC}</div>
</div>
```

```css
.pop-hero,
.pop-item {
  transform-origin: 50% 50%; /* in-place pop; move to the source point for the anchored variation */
  will-change: transform;
}
.pop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: GRID_GAP;
  place-items: center;
}
```

```js
// Single hero pop — smooth long-tail settle, no overshoot.
tl.fromTo(
  "#hero",
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: POP_DUR, ease: "power3.out" },
  ENTRY_AT,
);

// Staggered group pop — one arriving beat.
gsap.utils.toArray(".pop-item").forEach((el, i) => {
  tl.fromTo(
    el,
    { scale: 0, opacity: 0, y: Y_RISE },
    { scale: 1, opacity: 1, y: 0, duration: POP_DUR, ease: "power3.out" },
    GROUP_ENTRY_AT + i * STAGGER,
  );
});
```

## 变体

- **沉稳的落定**（高端 / 企业）：`power3.out`，不旋转，`Y_RISE` 0–12px —— 用于 hero 文字标识或产品镜头的、有分量、有自信的落地。
- **利落的落定**（日常默认）：`power3.out`，或者想要更有冲击力的前段就用 `expo.out`，`Y_RISE` 约 24px —— 卡片、图标、标注。
- **精确物理的落定**：当落定本身就是这个镜头的看点时，把 ease 换成 `../adapters/gsap-easing-and-stagger.md` → Spring Eases 里的 `springEase({ response: 0.4 })`（临界阻尼）；`duration` 取自该 helper。
- **以原点为锚的弹出**：从某个特定点（标记、指针尖端）长出来的标注，把 `transform-origin` 设到那个点上（例如 `0% 100%`），让 `scale: 0 → 1` 看起来是「从源头冒出来」，而不是「原地充气」。
- **弹入一个保持住的槽位**：弹出落地后保持静止 —— 入场里不要内置空闲循环。如果保持住的画面确实需要一点生气，就交给 [sine-wave-loop.md](sine-wave-loop.md)，在之后单独的 tween 上做含蓄的抖动；更好的做法是按旁白提示揭示下一个元素。
- **弹跳式弹出（少见 —— 只用于明确的俏皮风格）**：把 ease 换成 `back.out(OVERSHOOT)`，可选再让一个小的 `rotation: ROT_FROM → 0` 落定，让元素看起来像是手摆上去的。只用于刻意俏皮的语气 —— 绝不用于产品 / 企业 / 严肃的调性：

```js
tl.fromTo(
  el,
  { scale: 0, opacity: 0, rotation: ROT_FROM },
  { scale: 1, opacity: 1, rotation: 0, duration: POP_DUR, ease: `back.out(${OVERSHOOT})` },
  GROUP_ENTRY_AT + i * STAGGER,
);
```

即便在这里也要保持 `OVERSHOOT ≤ ~2` —— 超过这个值看起来就是卡通式的乱晃。更好的做法：用同一份 adapters 文档里 `dampingFraction: 0.6–0.7` 的烘焙弹簧，它给出约 5–10% 的过冲，看起来是物理的，而 `back.out` 看起来是卡通的。

## 取值

| token      | 范围                                      | 说明                                                             |
| ---------- | ----------------------------------------- | ---------------------------------------------------------------- |
| EASE       | 默认 `power3.out`；`expo.out` 更有冲击力  | `back.out(OVERSHOOT)` 只用于俏皮变体                             |
| POP_DUR    | 0.4–0.7s                                  | 越短越是紧凑的一下；hero 必须在 **t ≤ 0.5s** 时可见              |
| STAGGER    | 0.04–0.08s                                | `min(0.06, 0.5 / ITEM_COUNT)` —— 自动封顶时间窗                  |
| ITEM_COUNT | 3–9                                       | >9 会让错开感消失 —— 改用擦除/扫过式的揭示                       |
| Y_RISE     | 0–32px                                    | 要小；绝不能大到看起来像上滑                                     |
| ROT_FROM   | −10°–+10°                                 | 只用于俏皮变体；按索引交替正负号（`i % 2 ? 6 : -6`）             |
| ENTRY_AT   | 0–0.4s                                    | 先安静一拍，但要让主体在 t ≤ 0.5s 时落地                         |

## 关键约束

- 默认 ease 为 `power3.out`（没有过冲）；`back.out` 只用于明确的俏皮变体，而且那时 `OVERSHOOT ≤ ~2`。
- `ITEM_COUNT × STAGGER ≤ ~0.5s` —— 整组必须在一拍之内落地。
- 入场要在 `fromTo` 里写明收拢的 from 状态 —— 绝不要依赖 CSS 隐藏的起始状态（seek 时，在 tween 接管之前它会被渲染成可见的）。
- 原地弹出用 `transform-origin: 50% 50%`；只有锚定变体才用源头点。
- 这是一次有限的抵达 —— 停住的元素上的空闲运动，是之后单独的一个 `sine-wave-loop` tween。

## 另见

`center-outward-expansion`（向各槽位辐射的同时弹出）· `press-release-spring`（对应的点击反馈版本）· `sine-wave-loop`（抵达之后的抖动，慎用）。
