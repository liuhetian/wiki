---
name: control-target-sync
description: >
  实时同步的一对 —— 一个被拖动 / 输入 / 选择的控件，在「同一拍」里驱动第二个元素的属性。读数 tween 和目标的 transform tween 共用一个 timeline label（连续拖动），或者由一个阈值状态数组同时承载两边（离散步进）。让「改这里，看它变」读起来是因果关系。
metadata:
  tags: control, scrub, live-sync, mirror, panel, editor, couple, readout, ui
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/control-target-sync.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 控件-目标同步

这就是实时编辑的招牌动作：检查器 / 编辑器里的一个控件被操作 —— 拖动一个数值、重新输入一个字段、在下拉菜单中选一项 —— 一个**被绑定的第二个元素在同一帧做出响应**。按钮在旋转数值被拖动的「同时」旋转；图标「随每一次按键」改变大小。说服力来自因果 —— 一个手势，两个表面一起变化 —— 本规则就是产生这种效果的耦合约定。

最接近的先例是 [reactive-displacement.md](reactive-displacement.md)：那条规则也从同一个来源推导出两个元素的运动，但它是**碰撞物理** —— 一个入场的闯入者挤开一个退场的受害者，只发生一次，是一个转场，而且受害者会离开。本规则是一面**实时编辑的镜子**：控件在几拍里被反复操作，目标每次都做出响应，两边自始至终都留在舞台上。数值读数沿用 [counting-dynamic-scale.md](counting-dynamic-scale.md) 的代理模式；离散步进沿用 [discrete-text-sequence.md](discrete-text-sequence.md) 的阈值模式 —— 本规则补上的是把两者中任意一个绑定到目标上的法则。

## 原理

一个**编辑拍**是同一个 timeline label 上的一组并发 tween：`tl.addLabel("edit1", …)`，然后是**读数 tween**（数值代理 + 只写 `textContent` 的 `onUpdate`）和**目标 transform tween**（把 `rotation` / `x` / `y` / `scale` tween 到同一个终点），两者都放在这个 label 上，**时长**和 **ease** 都相同。这两个运动是同一个手势的两个投影 —— 数值走到 40% ⇒ 目标走到 40%，每一帧都如此，任何 seek 下都如此。这种数学上的步调一致读起来就是「面板正在编辑页面」，而不是「两段动画碰巧重叠」。

对于**离散编辑**（逐键重新输入、下拉选择、单位跳变），这对元素是步进而不是滑动：一个阈值状态数组同时承载「两边」—— 每个状态既包含读数文字，「也」包含目标的属性值 —— 由一个驱动应用当前处于激活的那个状态。两边读取的是同一个状态对象，所以不可能失去同步。

串联 2–4 个编辑拍，中间短暂停留，并以一次**落定的**编辑结尾 —— 最后一个值已应用并停住，绝不是停在一个提示框上、而下拉菜单还没打开。

## 配方

```html
<!-- Bipartite by construction: target surface + inspector panel share the frame.
     Every scrubbed readout gets `font-variant-numeric: tabular-nums` and a fixed
     min-width (≥ the longest value) or the panel edge jitters as digits change. -->
<div class="target-surface">
  <div class="target-button" id="target-button">{buttonLabel}</div>
  <div class="preview-row">
    <div class="preview-icon">{iconA}</div>
    …
  </div>
</div>
<div class="panel">
  <div class="field-row">
    <span>Rotation</span><span class="field-value" id="rotation-readout">0°</span>
  </div>
  <div class="field-row">
    <span>Class</span><span class="field-value mono" id="class-readout">text-1xl</span>
  </div>
</div>
```

```js
// ---- Continuous couple: ONE label; both tweens share duration AND ease ----
tl.addLabel("edit1", EDIT1_AT);
const rotState = { v: 0 };
const rotReadout = document.getElementById("rotation-readout");
tl.to(
  rotState,
  {
    v: ROT_TARGET,
    duration: SCRUB_DUR,
    ease: SCRUB_EASE,
    onUpdate: () => {
      rotReadout.textContent = `${Math.round(rotState.v)}°`;
    },
  },
  "edit1",
);
tl.to(
  "#target-button",
  { rotation: ROT_TARGET, duration: SCRUB_DUR, ease: SCRUB_EASE },
  "edit1", // same label — the mirror answers in the same frame
);

// ---- Discrete couple: ONE state array carries BOTH sides ----
const STEPS = [
  { t: 0.0, text: "text-1xl", scale: 1.0 }, // must equal the initial state
  { t: 0.4, text: "text-4xl", scale: 1.9 },
  { t: 1.0, text: "text-xl", scale: 0.85 }, // backspace
  { t: 1.35, text: "text-2xl", scale: 1.3 }, // lands
];
const stepAt = (time) => [...STEPS].reverse().find((s) => time >= s.t) ?? STEPS[0];

tl.addLabel("edit3", EDIT3_AT);
const classReadout = document.getElementById("class-readout");
const stepDriver = { t: 0 };
let lastStep = null;
tl.to(
  stepDriver,
  {
    t: STEPS_TOTAL,
    duration: STEPS_TOTAL,
    ease: "none",
    onUpdate: () => {
      const s = stepAt(stepDriver.t);
      if (s !== lastStep) {
        classReadout.textContent = s.text; // control steps
        gsap.set(".preview-icon", { scale: s.scale }); // target steps — same state object
        lastStep = s;
      }
    },
  },
  "edit3",
);
```

## 变体

- **下拉选择 → 即时转换（自我转换）** —— 选择动作就地转换面板自己的读数（`tl.set("#padding-readout", { textContent: "6 px" }, "pick")`）；控件和目标合并为同一个元素。用相邻规则拼出下拉菜单：菜单通过 [spring-pop-entrance.md](spring-pop-entrance.md) 弹出，行的悬停步进通过 [dynamic-content-sequencing.md](dynamic-content-sequencing.md) 实现。转换必须是「瞬间」跳变 —— 在单位字符串之间做 tween 看起来像坏了，而「即时」正是要展示的卖点。
- **拖动 easing 手柄 → 目标重新播放动画（延迟镜像）** —— 这次编辑编写的是一种*行为*，所以镜像是一次**重放**，而不是并发的 transform：第 1 拍拖动手柄（手柄 tween + 坐标读数），然后在之后的某个 label 上，目标用新编写的曲线执行它的运动（`tl.fromTo("#toggle-knob", { x: 0 }, { x: KNOB_TRAVEL, duration: REPLAY_DUR, ease: AUTHORED_EASE }, "replay")`），通常伴随一次拉远（[viewport-change.md](viewport-change.md)）。这是唯一一种被认可的、响应不在手势那一拍里的情况；重放仍必须让人一眼看出就是被编辑的那个参数。
- **读取同步镜像（反方向）** —— 手势发生「在」目标上（悬停色块、选中某个元素），被绑定的一边是「面板」读数。离散约定不变 —— 一个由 `{ t, hoverTarget, readout }` 组成的状态数组同时驱动高亮和文字。
- **颜色耦合** —— 读数计数（`0 → 80`），同时目标的 `backgroundColor` 在同一个 label 上于两个色板色标之间 tween。保持两个固定色标（由 GSAP 插值）；绝不手工逐帧推导 hex 字符串。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| SCRUB_DUR | 0.8–1.6 s | 观众必须看到「两边」都在动 —— 低于约 0.6 s 时，镜像充其量只能被潜意识感知 |
| SCRUB_EASE | `power1.inOut` / `power2.inOut` | 两个 tween 一字不差地共用。绝不用 `back.out` / `elastic.out` —— 过冲的数值读起来像坏掉的铰链；读数是数据 |
| 编辑的端点 | 明显但合理 | −10° 倾斜、38 px 位移、1xl → 4xl → 2xl；2° 的旋转什么也演示不了 |
| HOLD_BETWEEN | 0.3–0.8 s | 每个落定的值都要有一口喘息；低于 0.3 s 时各拍会糊成一个手势 |
| BEAT_COUNT | 2–4 | 一次编辑只是一个瞬间，不是一次演示；超过 4 次，这个镜头就读起来像设置项巡览 |
| STEP 间隔（离散） | 0.15–0.5 s | 按键节奏参照 discrete-text-sequence；第一个状态必须等于加载时的状态 |
| VALUE_MIN_WIDTH | ≥ 最长数值的宽度 | 没有它，数字位数变化时面板边缘会抖动 |

## 关键约束

- **一个 label，一个手势** —— 读数 tween 和目标 tween 共用位置、时长「和」ease；绝不先读数再目标地依次排列，也绝不让目标落后读数错开哪怕 0.1 s —— 延迟的响应读起来是「一段动画跟在编辑后面」，而不是一个被绑定的表面。即使端点一致，ease 不匹配也会让镜像在 tween 中途失去同步。
- **离散步进共用一个状态对象** —— 两边读取同一个数组条目，因此在结构上就不可能失去同步；第一个条目与初始 DOM 状态一致。
- **读数是数据** —— 落定时不过冲、不弹跳；目标可以带上手势的 ease，但必须精确落在被编辑的值上。
- **同框可见是承重的** —— 每个编辑拍里，控件和目标都在同一画面中；摄像机运动绝不能把镜像裁出画面（在各拍之间做推进再拉回，而不是在拍中间做）。
- 每个被拖动的读数上都加 **`tabular-nums` + 固定的 `min-width`**；`onUpdate` 是 O(1) 的 —— 只写文字，离散驱动用上一个状态的检查来守卫写入。
- **以一次落定的编辑结尾** —— 最后一拍以数值已应用并停住收尾（或者是延迟镜像的重放）；绝不停在手势中途或一个没打开的菜单上。
- **手势的执行者是另一条规则** —— 光标滑行、抓取光标翻转、点击反馈都来自光标相关规则；本规则只负责这对耦合。

## 另见

`cursor-click-ripple` / `context-sensitive-cursor`（执行手势的那只手）· `counting-dynamic-scale`（没有被绑定的目标时，单独的读数那一半）· `discrete-text-sequence`（控件字段内的重新输入）· `spring-pop-entrance`（这对耦合周围的下拉菜单 / 界面装饰）· `multi-phase-camera`（推进再拉回的取景）· `chart-scrub-readout`（相反的「读」方向的兄弟规则 —— 拖动是去查验一张图表，而不是编辑一个目标）。
