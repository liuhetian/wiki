---
name: multi-cursor-choreography
description: >
  N 个带标签的独立光标角色同时在一张画布上工作（协作画布的氛围感）—— 每个光标有各自确定性的路径点日程，名字标签胶囊颜色各不相同，抓取/放下动作落在交错的节拍网格上，路径和动作因此绝不冲突；镜头保持锁定，这份生动本身就是要传达的信息。
metadata:
  tags: cursor, multi-cursor, collaboration, ensemble, canvas, name-tag, choreography, ambient, teamwork
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/multi-cursor-choreography.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Multi-Cursor Choreography

> **镜头绝不追着任何人跑。** 没有真正的镜头 —— 任何「摇镜」都是画布组在静止的画框内平移。并且按照运动原则里对空闲运动的禁令，每个光标都必须**表演**：移动到目标、执行动作，然后静止休息。按日程安排的休息是静止；漫无目的的游走循环就是晃动（wobble）。

这是群像的基本元件：**两到四个带标签的光标角色** —— 每个都是一个箭头加一个自己颜色的名字标签胶囊 —— 同时在同一张共享画布上工作。没有哪一个交互是主角；**同时存在的生动感才是**（「有一个团队正在这里干活」），通常作为氛围，垫在一个逐步搭建起来的大标题下面。它和 [cursor-click-ripple.md](cursor-click-ripple.md)、[cursor-drag.md](cursor-drag.md) 不同：那两个是观众逐次点击跟随的**唯一主角**；这里的角色是合唱，不是领唱 —— 每个动作都比单个光标的动作更小、更安静，价值在于交错。它也不同于 [camera-cursor-tracking.md](camera-cursor-tracking.md)：那条规则把 *viewport* 锁定在一个焦点光标上；这条规则恰恰禁止这样做 —— 画框是静止的，眼睛自由游走。

## 工作原理

一切都挂在一张数据表上：

1. **角色表** —— 一个字面量 `ACTORS` 数组：每个角色一个名字、一个颜色、一份**路径点日程**（`{ x, y, at, dur }` 形式的行进段，外加动作节拍）。所有坐标和时间都是手写的常量 —— 编排就是数据：确定性的、可 seek 的，并且在渲染任何一帧之前就能审查有没有冲突。
2. **每段行进都是显式的 `fromTo`** —— 每一段把角色包裹层从上一个路径点 tween 到下一个，放在绝对时间位置上。段与段之间的空隙就是**休息**：光标原地停在它落下的位置。
3. **动作** —— 一段行进可以以抓取结束（按下时下沉一下；负载物在下一段里同步跟随 —— 即合唱强度下的 [cursor-drag.md](cursor-drag.md) 机制）、以放下结束（`tl.set` 切换身份 + 轻微的落定弹跳），或以悬停结束（光标尖端下方淡入一个高亮，只一次，然后保持）。
4. **交错的节拍网格** —— 动作落在**交替的节拍**上（约 1.2 / 2.6 / 4.0 s）：任意时刻至多一个动作落下，其他角色在滑行或休息。每个角色拥有画布上的一块主**区域**；同一时间只有一个角色离开自己的区域，所以路径绝不会在几乎同时的时刻交叉。（约 5s 以内的短样例可以把节拍间距压缩到约 0.3–0.9s —— 区域划分仍然能防止冲突；≥1s 的间距是给氛围长度的镜头用的。）
5. **氛围式的布置** —— 光标在 t=0 时可以已经在画布中间（团队在我们到来之前就已经在工作了 —— 协作画布的惯用手法），也可以错开起点从画外进入。画布组可以在群像下面缓慢平移（元素平移，不是镜头）。

## 配方

```html
<!-- Canvas group (mockups + payload chips) may translate for an ambient pan.
     One wrapper per actor: arrow + name tag move as ONE object. -->
<div class="canvas-group" id="canvas-group">
  <div class="mockup" id="mockup-a">{mockupA}</div>
  <div class="canvas-chip" id="chip-1">{chipLabel}</div>
</div>
<div class="actor" id="actor-1">
  <svg class="actor-arrow"><!-- arrow path, fill: ACTOR_1_COLOR --></svg>
  <span class="actor-tag" style="background: ACTOR_1_COLOR">{actorName1}</span>
</div>
```

```js
// The choreography IS this table — all literals; read the `at` columns to
// verify beats interleave. Each actor owns a zone.
const ACTORS = [
  {
    id: "#actor-1", // zone: left mockup
    legs: [
      { from: { x: 180, y: 420 }, to: { x: 320, y: 300 }, at: 0.2, dur: 0.9 },
      { to: { x: 340, y: 480 }, at: 2.0, dur: 0.8 }, // rest 0.9s between legs
    ],
  },
  {
    id: "#actor-2", // zone: center mockup
    legs: [
      { from: { x: 900, y: 200 }, to: { x: 820, y: 360 }, at: 0.6, dur: 1.0 },
      { to: { x: 980, y: 380 }, at: 3.4, dur: 0.7 },
    ],
  },
  {
    id: "#actor-3", // zone: right panel — enters from off-frame
    legs: [{ from: { x: 1980, y: 520 }, to: { x: 1560, y: 460 }, at: 1.4, dur: 1.1 }],
  },
];

ACTORS.forEach((actor) => {
  let prev = actor.legs[0].from;
  tl.set(actor.id, { x: prev.x, y: prev.y }, 0); // on stage (or off) from t=0
  actor.legs.forEach((leg) => {
    tl.fromTo(
      actor.id,
      { x: prev.x, y: prev.y },
      { x: leg.to.x, y: leg.to.y, duration: leg.dur, ease: "power2.inOut", immediateRender: false },
      leg.at,
    );
    prev = leg.to;
  });
});

// Actions at chorus intensity — actor 1 grabs the chip: press dip, then the
// chip rides leg 2 in lockstep (matched tween: same position, duration, ease).
tl.to("#actor-1", { scale: 0.88, duration: 0.07, ease: "power2.in", yoyo: true, repeat: 1 }, 1.1);
tl.fromTo(
  "#chip-1",
  { x: 0, y: 0 },
  { x: CHIP_DX, y: CHIP_DY, duration: 0.8, ease: "power2.inOut", immediateRender: false },
  2.0, // = actor-1 leg 2 `at` and `dur`, exactly
);
// Drop: identity swap + tiny settle — quieter than a solo cursor's snap
tl.set("#chip-1", { backgroundColor: "{chipSwapColor}" }, 2.8);
tl.fromTo(
  "#chip-1",
  { scale: 1.06 },
  { scale: 1, duration: 0.2, ease: "power3.out", immediateRender: false },
  2.8,
);

// Optional ambient canvas pan (element translate, NOT a camera)
tl.fromTo("#canvas-group", { x: 0 }, { x: PAN_DX, duration: 6.0, ease: "none" }, 0.3);
```

## 变体

- **氛围式协作画布（Hook 的语气）** —— 默认形式：t=0 时角色已在画布中间，画布缓慢平移，上方逐步搭建一个大标题（[waterfall-entry.md](waterfall-entry.md)）。演示只是文字的布景；让每个动作都保持小幅，节拍网格保持松散。
- **一个带标签的编辑者（N = 1，仍是群像风格）** —— 单个带标签的队友光标完成一次可见的编辑（通过 [discrete-text-sequence.md](discrete-text-sequence.md) 删除并重新输入标题中的一个词，或放下一个组件）。名字标签才是重点：这是*一个人*做的。
- **群像中的主打一拍** —— 某个角色短暂地成为主角：完整的 [cursor-drag.md](cursor-drag.md) 抓取-携带-放下，带全套装饰，而其他角色在这个时间窗内明确地**休息**。冻结合唱；同时有两样东西带着意图在动，会分散视线。
- **错开的入场** —— 光标在 `ENTER_AT + i * ENTER_STAGGER` 时从画外进入，各自滑向自己的区域（「团队集合」）；按照本门派的光标入场法则，入场向量来自不同的边。

## 取值

| token               | 范围                      | 说明                                                                                                                         |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ACTOR_COUNT         | 2–4                       | 一个是单人规则的事；五个以上看起来像噪点 —— 没有观众能同时追踪五个指针                                                       |
| 行进段 `dur`        | 0.6–1.2 s，`power2.inOut` | 像人一样、深思熟虑的鼠标移动；长距离移动低于 0.5 s 看起来像瞬移                                                              |
| 休息空隙            | 0.5–1.5 s                 | 休息让群像看起来像人；从不休息的角色看起来像屏保                                                                             |
| 动作节拍间距        | ≥ 1.0 s                   | 一个角色在做动作时，其他角色可以滑行但不能做动作 —— 把所有 `at` 值排个序来审查                                               |
| 区域                | 每个角色一个              | 只有正在做动作的角色可以跨区域；两个光标相距约 80 px 以内看起来像故障 —— 检查时间重叠的路径点对                              |
| PAN_DX              | 约 40–80 px，线性         | 视差带来的生气，不是镜头运动；群像比较繁忙时省略                                                                             |
| 标签 / 箭头尺寸     | 比单人主角小              | 超大光标的处理方式是给主角用的；标签在渲染分辨率下必须保持可读                                                               |
| 颜色                | 每个一种饱和色相          | 取自色板的强调色范围；标签胶囊和箭头填充共用同一色相                                                                         |

## 关键约束

- **表就是编排** —— 所有路径点、时间和动作都是字面量数据。如果光读 `at` 列无法验证不冲突，说明日程设计得太花哨了。
- **每一段行进都是显式的 `fromTo`**，以上一个路径点作为 from 状态，除了每个角色的初始放置外全部加 `immediateRender: false` —— 在共享属性上串联的 `.to()` 在 seek 时会捕获到过时的起点。
- **交错，绝不齐奏** —— 任意时刻至多一个动作落下；同时行进没问题（那正是生动感），同时出现的*高潮动作*会互相抢戏。
- **合唱强度** —— 每个动作都是其单人规则的安静版：更小的下沉、更含蓄的吸附、没有涟漪爆发；完整处理留给主打的那一拍。
- **休息就是静止** —— 两段之间光标严格停在它落下的位置：任何角色都不许有空闲漂移，不许有 yoyo 式游走。
- **负载物同步** —— 被携带的 chip 的 tween 与其角色的行进段完全一致（位置、时长、ease），遵循 cursor-drag 法则。
- **移动的是包裹层，绝不是零件** —— 箭头 + 名字标签是一个元素；分开 tween 它们，在 seek 时会把角色撕裂。
- **镜头锁定** —— 不要有 viewport 缩放/摇镜的 tween；唯一的大尺度运动是画布组的线性平移。绝不要推近到某个角色（那是单光标镜头）。
- **角色是人** —— 人的速度滑行、停顿、一次只做一件事；所有角色都加 `pointer-events: none`。检查 `tl.duration()` —— 群像会因为后期的休息累积出很长的尾巴。

## 另见

`cursor-drag`（完整处理的主打一拍）· `cursor-click-ripple`（合唱式点击 —— 只做按下，省掉涟漪）· `discrete-text-sequence`（带标签角色的重新输入编辑）· `viewport-change`（画布组平移的数学）· `spring-pop-entrance`（作为放下结果弹出的组件）。
