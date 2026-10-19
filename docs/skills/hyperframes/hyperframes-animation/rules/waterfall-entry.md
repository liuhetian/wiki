---
name: waterfall-entry
description: "错落的入场（ARRIVAL）级联——单词/元素从下方甩入（方向始终一致），每个都在前一个落定之前就开始，形成一道不断加速、最终收束成完整版式的波浪。用于标题卡、段落开场、列表/功能介绍。不透明度是二值的，通过 tl.set 从 0→1——入场绝不淡入。"
metadata:
  tags: entrance, cascade, stagger, kinetic-text, title-card, segment-opener, arrival, waterfall, whip
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/waterfall-entry.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 瀑布入场（Waterfall Entry）

错落的入场（ARRIVAL）级联：单词/元素从下方甩入（方向始终一致），每个都在前一个落定之前就开始——形成一道不断加速、最终收束成完整版式的波浪。用于标题卡、段落开场、列表/功能介绍。

**这是场景内的入场，不是接缝。** 它对应的接缝版本是瀑布切（waterfall CUT）（`cut-the-curve` 准则 skill，`seams/waterfall-cut.md`）；不要混用两者的规则：

|               | 入场（本规则——入场）                   | 瀑布切（接缝）                                      |
| ------------- | --------------------------------------------- | --------------------------------------------------------- |
| 不透明度       | 二值，入场时通过 `tl.set` 从 0→1——绝不淡入 | 在路径中段 0.35 处点亮——淡入本身就是速度上的障眼法 |
| 默认轴向  | Y，从下方                                 | X，顺着运动流向                                     |
| 离场一侧 | 无                                          | 单词以镜像的 power4.in 加速离场                      |

## 编排

- **重叠，不要排队**——下一个元素在前一个落定前后 ±2 帧内开始；间隔沿着级联逐渐**缩短**；最后一个元素干脆利落地落位。
- **速度随分量变化**——重的/锚点元素位移更远、时长更长；轻的单词/标点紧凑地快速落位：

| 参数 | 锚点/重 | 普通单词 | 轻/标点 |
| --------- | ------------ | ----------- | ----------------- |
| Y 偏移  | 60–80px      | 40–50px     | 30–48px           |
| 时长  | 0.16–0.20s   | 0.13–0.16s  | 0.10–0.13s        |
| 重叠   | 0–2f 间隔     | 1f 重叠  | 1–2f 重叠      |

- 缓动用 `power4.out`（想要更脆就用 `expo.out`）；入场绝不用 `.inOut`。
- 一个级联只用一个方向。
- 把**最后**一个单词拆成若干碎片来拉长高潮；碎片位移更远。
- 落定之后，这组元素通常会滑开，为下一拍腾出位置——那是 [nudge-curve.md](nudge-curve.md)。

## JS

每个元素：先 `tl.set`（瞬间显现 + 偏移），再 `tl.to`（甩到静止位置）。`nextStart = prevStart + prevDuration − (overlapFrames × F)`；重叠为正 = 级联，重叠为负 = 刻意留出间隔。CSS：元素初始为 `opacity: 0; display: inline-block`。

```js
var F = 1 / 60;
var t0 = 0.1;
// anchor (heaviest): biggest travel, longest settle
tl.set("#el-1", { opacity: 1, y: 80 }, t0);
tl.to("#el-1", { y: 0, duration: 0.18, ease: "power4.out" }, t0);
// normal word: 2 frames after the anchor finishes
var t1 = t0 + 0.18 + 2 * F;
tl.set("#el-2", { opacity: 1, y: 45 }, t1);
tl.to("#el-2", { y: 0, duration: 0.15, ease: "power4.out" }, t1);
// light word: 1 frame BEFORE the previous finishes (overlap)
var t2 = t1 + 0.15 - F;
tl.set("#el-3", { opacity: 1, y: 40 }, t2);
tl.to("#el-3", { y: 0, duration: 0.14, ease: "power4.out" }, t2);
// split final-word fragments: tightest overlap, extra travel (lighter)
var t3 = t2 + 0.14 - F;
tl.set("#frag-a", { opacity: 1, y: 70 }, t3);
tl.to("#frag-a", { y: 0, duration: 0.16, ease: "power4.out" }, t3);
var t4 = t3 + 0.14 - F;
tl.set("#frag-b", { opacity: 1, y: 70 }, t4);
tl.to("#frag-b", { y: 0, duration: 0.15, ease: "power4.out" }, t4);
// punctuation: lightest, fastest
var t5 = t4 + 0.13 - 2 * F;
tl.set("#dot", { opacity: 1, y: 48 }, t5);
tl.to("#dot", { y: 0, duration: 0.12, ease: "power4.out" }, t5);
```

## 反模式

| 不要                                                  | 改为                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 排队式入场（每个都等前一个落定）  | 重叠 ±1–2 帧——级联是一道波浪，不是一条队列                          |
| 级联里每个元素用同样的偏移/时长         | 按分量区分：锚点位移更远，标点快速落位                         |
| 入场时逐渐淡入不透明度                     | 通过 `tl.set` 二值地从 0→1——淡入会抵消那股脆劲（接缝的切会淡入；入场不会） |
