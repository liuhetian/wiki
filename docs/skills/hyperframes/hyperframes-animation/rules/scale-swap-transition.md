---
name: scale-swap-transition
description: >
  两个元素之间协调的「缩小退出 + 弹簧弹入」，形成类似 morph 的转场 —— 不需要 SVG 路径插值。
metadata:
  tags: transition, morph, scale, swap, spring, pop
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/scale-swap-transition.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Scale-Swap Transition

通过让退场和入场的缩放动画相互重叠，模拟两个 DOM 元素之间的「morph」。比 [card-morph-anchor.md](card-morph-anchor.md) 更轻量（那条规则会 morph 容器尺寸 —— **形状**变化时用它；这条规则用于**同形状**的状态替换），也比 SVG 路径插值简单。

在同一个触发点，两个协调的 tween 同时触发：

1. **退出者**：缩放 `1.0 → EXIT_SCALE` + 不透明度 `1 → 0`，快速的 `power2.in`（匆匆离去）。
2. **进入者**：缩放 `EXIT_SCALE → 1.0` + 不透明度 `0 → 1`，`back.out(BOUNCE_FACTOR)`（带着分量抵达）。

一个小小的 `OVERLAP` 时间窗内两者都处在 tween 中途，由此营造出 morph 的错觉；进入者通过 z-index 位于上层，这样退出者淡出的尾巴就不会透出来。

## 配方

```html
<!-- Both cards position: absolute; inset: 0 in one fixed-size wrapper — same
     footprint, same transform-origin: 50% 50%. Incoming starts opacity: 0,
     transform: scale(EXIT_SCALE), z-index above the outgoing. -->
<div class="swap-wrap">
  <div class="card outgoing" id="outgoing">{outgoingIcon} {outgoingLabel}</div>
  <div class="card incoming" id="incoming">
    {incomingIcon} {incomingLabel}
    <div class="sub" id="sub">{incomingSubline}</div>
  </div>
</div>
```

```js
// Outgoing: shrink + fade fast
tl.to(
  "#outgoing",
  { scale: EXIT_SCALE, opacity: 0, duration: EXIT_DUR, ease: "power2.in" },
  TRIGGER,
);

// Incoming: pops in with overshoot, starting OVERLAP before the exit finishes
tl.to(
  "#incoming",
  { scale: 1.0, opacity: 1, duration: ENTER_DUR, ease: `back.out(${BOUNCE_FACTOR})` },
  TRIGGER + EXIT_DUR - OVERLAP,
);

// Inner content reveals AFTER the incoming settles
tl.fromTo(
  "#sub",
  { opacity: 0, y: SUB_REVEAL_Y_PX },
  { opacity: 1, y: 0, duration: SUB_REVEAL_DUR, ease: "power3.out" },
  TRIGGER + EXIT_DUR + SUB_REVEAL_DELAY,
);
```

## 变体

- **延迟揭示内部内容** —— 上面的经典模式：先 morph 容器，等它落定后再揭示内部文字；0.2–0.4 s 的间隔让眼睛先落到新形状上，再开始阅读。
- **三连替换（3 状态循环）** —— 用触发点 `TRIGGER_AB` / `TRIGGER_BC` 串联 A→B→C；每次转场都是自己的一对 tween，上一次的进入者成为下一次的退出者。用于状态演进的叙事（早期 → 中期 → 最终的标签）。
- **变色转场（不缩放）** —— 在同形状状态之间做平面式 morph 时，去掉缩放，保留不透明度 + 一次短暂的背景色相 tween；不那么戏剧化，更偏产品 UI 的调性。

## 取值

| token            | 范围                                  | 说明                                                                                                   |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| TRIGGER          | ≥ 退出者落定 + 一段存在感停留         | 退出者必须先「落地」，再变形                                                                           |
| EXIT_DUR         | 0.3–0.5 s                             |                                                                                                        |
| ENTER_DUR        | 0.45–0.7 s                            | 比 `EXIT_DUR` 长，让过冲能落定                                                                         |
| OVERLAP          | 0.1–0.2 s                             | >0.3 s 两者会明显同时可见（没有 morph 感）；<0.05 s 会留下可见的空白间隙                               |
| EXIT_SCALE       | 0.6–0.8                               | 缩得更小的退场显得戏剧化，但有被看成「消失」而不是「morph」的风险                                      |
| BOUNCE_FACTOR    | 1.4 柔和 · 1.8 紧实 · 2.2 卡通        |                                                                                                        |
| SUB_REVEAL_DELAY | 0.2–0.4 s                             | 在 morph 期间揭示会和替换争夺注意力                                                                    |
| BRAND_REVEAL_AT  | < TRIGGER                             | 语境（品牌、眉标）提前铺垫；如果在替换的**同时**揭示，就会和大标题那一拍抢戏                           |

## 关键约束

- **进入者的 z-index 高于退出者** —— 否则退出者淡出的尾巴（不透明度 0.3–0.5）会透出来，让画面出现双重曝光。
- **两个元素共用 `transform-origin: 50% 50%`** —— 原点不同，morph 看起来就像一个东西瞬移到了别处。
- **弹性缓动只用在进入者上** —— 退出者 `power2.in`，进入者 `back.out`；反过来的话，替换会显得机械。
- **两张卡片都设 `position: absolute; inset: 0`**，放在同一个固定尺寸的包裹层里（尺寸要能装下两种状态；包裹层永不改变尺寸）。
- **淡出后不要把退出者设为 `display: none`** —— 让它停在 `opacity: 0`，避免布局重排。
- **内部内容在容器落定后再揭示**；最终状态 + 副标题落定后，**高潮停留 ≥ 1 s**。

## 另见

`press-release-spring`（按钮按压**触发**替换 —— 因与果）· `card-morph-anchor`（改变形状的替代方案）· `reactive-displacement`（当替换应该看起来像一次有因果的碰撞时）· `sine-wave-loop`（最终状态上的空闲呼吸）。
