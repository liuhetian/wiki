---
name: nudge-curve
description: >
  慢-快-慢的三阶段整组滑动 —— 重新定位一个已组合好的组（文字行、卡片堆、列表），用来揭示内容或腾出空间。没有任何单个内置 ease 能做出这种效果；串联 power3.in 加速 → 线性爆发 → power4.out 尾段（距离按 10/65/25 分配，尾段在时长上 ≥ 加速段的 3 倍）。
metadata:
  tags: slide, reposition, group-motion, easing, nudge, slow-fast-slow, reveal, layout
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/nudge-curve.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Nudge Curve

对一个已组合好的组（文字行、卡片堆、列表）做慢-快-慢的重新定位，用来揭示内容或腾出空间。**场景内的整组滑动 —— 不是接缝。** 没有任何单个内置 ease 能做出这种效果 —— `power4.inOut` 会猛地一下停住。在同一个属性上串联三个 tween：

| 阶段       | Ease            | 距离     | 时间 | 观感                                     |
| ---------- | --------------- | -------- | ---- | ---------------------------------------- |
| 1 加速段   | `power3.in`     | ~10%     | ~20% | 几乎不动 —— 能感知到运动，但没有顿挫     |
| 2 爆发段   | `none`（线性）  | ~65%     | ~18% | 约 2 倍平均 px/帧 —— 果断有力            |
| 3 尾段     | `power4.out`    | ~25%     | ~62% | 衰减着慢慢蠕行到静止 —— 消除猛停感       |

## 规则

- 尾段在**时间**上 ≥ 加速段的 3 倍。如果仍然有猛停感：延长尾段的时间（不是距离），或者改用 `power5.out`。
- 阶段 2 保持线性 —— 给它加缓动会丢掉爆发的反差。
- 在阶段 2 **期间**揭示新内容 —— 爆发会掩盖它的出现。
- 垂直方向比例相同；距离按比例缩放，保持时间比例不变。
- 这种滑动之前通常有一次级联抵达 —— 见 [waterfall-entry.md](waterfall-entry.md)。

## JS

以下是向左滑动 270px（总长 0.57s）的参考值。其他行进距离按比例缩放距离；保持**时间**比例不变；尾段 ≥ 加速段的 3 倍。

```js
var t = /* start after content settles */;
tl.to(".text-row", { x: -30,  duration: 0.12, ease: "power3.in"  }, t);          // ramp-in: 11% dist / 21% time
tl.to(".text-row", { x: -210, duration: 0.10, ease: "none"       }, t + 0.12);   // burst:   67% dist / 18% time
tl.to(".text-row", { x: -270, duration: 0.35, ease: "power4.out" }, t + 0.22);   // tail:    22% dist / 61% time
// vertical: same ratios on y. 150px variant: -15 / -115 / -150 at the same times.
```

## 反模式

| 不要                                                     | 改为                                     |
| -------------------------------------------------------- | ---------------------------------------- |
| 用单个 ease 做整组滑动（`power4.inOut`、`slow()`）       | 上面的三阶段链                           |
| nudge 尾段短于加速段的 3 倍                              | 延长尾段的**时间**，而不是它的距离       |
