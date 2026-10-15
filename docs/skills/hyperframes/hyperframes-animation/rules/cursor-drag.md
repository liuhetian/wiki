---
name: cursor-drag
description: >
  受驱动光标的「拖动」动作 —— 抓取、抬起、移动、放下吸附。一个半透明的残影标签与光标严格同步地一起移动，并吸附进一个带选中框装饰的已放置字段；变体包括填充柄向下逐行自动填充、角柄等比缩放（只用统一缩放），以及抓起-抬起-重排，旁边的元素会弹入空出来的位置。
metadata:
  tags: cursor, drag, drop, ghost, handle, resize, reorder, snap, interaction, mouse
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/cursor-drag.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 光标拖动

> 光标的外观、尺寸、从画外入场以及尖端对准，都以 **oversized-cursor 的内部风格准则**为准 —— 本规则只负责拖动的*机制*。

这就是「按住并带着走」的动作：光标按住一个载荷，带着它移动，然后在别处松开。承重的法则是**同步锁定**：在整个移动过程中，光标尖端和载荷的抓握点作为一个刚性整体移动 —— 哪怕漂移一帧，读起来都像标签从手里滑脱了。区别于 [cursor-click-ripple.md](cursor-click-ripple.md)（移动 → 在单一位置上的点事件）：拖动是*跨越空间的持续按住*，载荷是联合主角。抓取时的按压下沉复用 [physics-press-reaction.md](physics-press-reaction.md)（光标 + 载荷一起压缩）；N 个同时行动的执行者见 [multi-cursor-choreography.md](multi-cursor-choreography.md) —— 本规则是一位主角执行一拍工作流动作。

## 原理

五拍：**接近**（光标滑向源标签，`power2.inOut`）→ **抓取**（光标 + 标签一起按压下沉；在按下的那一拍，`tl.set` 显示出**残影** —— 一个预先渲染、位于标签位置的半透明克隆 —— 再加一个小幅抬起的 `fromTo`，放大到 `GHOST_LIFT_SCALE` 并带柔和阴影，`immediateRender: false`）→ **移动**（光标和残影作为**匹配的 tween** 一起移动）→ **放下**（残影消失，已放置字段带着选中框装饰弹出）→ **调整 / 离开**（可选的手柄缩放，然后光标滑向下一个目标）。

匹配的 tween = 相同的 timeline 位置、相同的时长、相同的 ease，沿直线移动 —— 这样在每一个 easing 中间点上，这一对都保持刚性锁定。共享的 `[cursor, ghost]` 目标数组只在两者需要完全相同的位移量时才行得通；起点不同时，用两个匹配的 `fromTo`。这是约定中「绝对值法则」在本规则上的推论：任何一方使用相对的 `+=` 移动，都会在 seek 时破坏同步锁定。

在构建时测量标签和槽位的矩形 —— 放下的那一刻差 4 px，读起来就是拖动失败（montage 中：按约定，使用编写好的、与 CSS 一致的常量）。`TIP_OFFSET_X/Y` 把光标的「尖端」（而不是它的包围盒）对准抓握点。

## 配方

```html
<!-- Ghost = clone of the chip AT the chip's position, in DOM from t=0, opacity: 0.
     Same silhouette as the chip — or hand and payload read as different objects.
     Placed field sits at the slot's final position, opacity: 0, with a .select-box
     and four corner .handle elements inside. -->
<div class="tray-chip" id="source-chip"><span class="grip-dots">⋮⋮</span> {chipLabel}</div>
<div class="drag-ghost" id="drag-ghost"><span class="grip-dots">⋮⋮</span> {chipLabel}</div>
<div class="placed-field" id="placed-field">
  {placedLabel}
  <!-- + selection chrome -->
</div>
<div class="cursor" id="cursor"><!-- arrow SVG --></div>
```

```js
const chipRect = document.querySelector("#source-chip").getBoundingClientRect();
const slotRect = document.querySelector("#placed-field").getBoundingClientRect();
const TRAVEL_DX = slotRect.left - chipRect.left;
const TRAVEL_DY = slotRect.top - chipRect.top;

// Travel — MATCHED tweens: same position, duration, ease; absolute endpoints.
tl.fromTo(
  "#drag-ghost",
  { x: 0, y: 0 },
  { x: TRAVEL_DX, y: TRAVEL_DY, duration: TRAVEL_DUR, ease: TRAVEL_EASE, immediateRender: false },
  TRAVEL_AT,
);
tl.fromTo(
  "#cursor",
  { x: chipRect.left + TIP_OFFSET_X, y: chipRect.top + TIP_OFFSET_Y },
  {
    x: chipRect.left + TIP_OFFSET_X + TRAVEL_DX,
    y: chipRect.top + TIP_OFFSET_Y + TRAVEL_DY,
    duration: TRAVEL_DUR,
    ease: TRAVEL_EASE,
    immediateRender: false,
  },
  TRAVEL_AT,
);

// Drop is a state commit: ghost off + placed field on at the SAME position.
tl.set("#drag-ghost", { opacity: 0 }, DROP_AT);
tl.fromTo(
  "#placed-field",
  { opacity: 0, scale: 0.92 },
  { opacity: 1, scale: 1, duration: SNAP_DUR, ease: "power3.out" },
  DROP_AT,
);
tl.fromTo(
  [".select-box", ".handle"],
  { opacity: 0, scale: 0.6 },
  { opacity: 1, scale: 1, duration: 0.18, ease: "power3.out", stagger: 0.02 },
  DROP_AT + SNAP_DUR * 0.4,
);
```

## 变体

- **角柄等比缩放** —— 禁止 tween width/height，所以缩放用统一的 `scale` 来呈现，`transform-origin` 设在**对角（锚点角）**：锚点角保持不动，被拖动的角移动。角的位置*与缩放成线性关系*（`corner = anchor + scale × (corner₀ − anchor)`），所以只要光标 tween 到角的终点位置时使用**相同的时长和 ease**，就会精确地粘在手柄上：

  ```js
  tl.to(
    "#placed-field",
    { scale: RESIZE_SCALE, transformOrigin: "0% 0%", duration: RESIZE_DUR, ease: "power2.inOut" },
    RESIZE_AT,
  );
  tl.to(
    "#cursor",
    { x: CORNER_END_X, y: CORNER_END_Y, duration: RESIZE_DUR, ease: "power2.inOut" },
    RESIZE_AT,
  );
  ```

  单轴缩放是在同样的原点逻辑下用 `scaleX`/`scaleY` —— 只适用于可以拉伸的盒子；内容必须保持不变形时，改用 [anchored-layout-expand.md](anchored-layout-expand.md) 的反向缩放。

- **填充柄自动填充** —— 电子表格的动作：光标用 `"none"`（线性）ease 把单元格的填充柄笔直往下拖；每一行都通过一个按手柄线性进度定时的、瞬间生效的 `tl.set` 提交（绝不用淡入），让填充边缘和光标永不分离：

  ```js
  tl.fromTo(
    "#cursor",
    { y: HANDLE_Y },
    { y: HANDLE_Y + FILL_DIST, duration: FILL_DUR, ease: "none", immediateRender: false },
    FILL_AT,
  );
  gsap.utils.toArray(".fill-cell").forEach((cell, i) => {
    tl.set(cell, { opacity: 1 }, FILL_AT + ((i + 1) / CELL_COUNT) * FILL_DUR);
  });
  ```

- **抓起-抬起-重排** —— 抬起 = `y: -LIFT_RISE` + `rotation: LIFT_TILT`（符号由索引奇偶决定）+ 显示阴影；当被带着走的项越过邻居的中点时，**邻居弹入空出来的位置**（在 `TRAVEL_AT + TRAVEL_DUR * 0.5` 处做一个位移 `fromTo`，`power3.out`）；放下 = rotation → 0、去掉阴影、落定。邻居的反向移动是让重排成立的关键 —— 没有它，列表读起来就像坏了。
- **在表面之间抓取组件** —— 一个标签从一个界面模型被拖到另一个界面模型，放下时切换身份（在 `DROP_AT` 处用 `tl.set` 换色 + 换标签，再加一个微小的落定弹出）；放下时的装饰就只是身份切换，没有手柄。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| 接近 / 按压 | 参照 cursor-click-ripple | 接近 0.4–1.0 s；按压下沉每半程 0.06–0.12 s；光标压缩得比载荷更多 |
| GHOST_OPACITY | 0.5–0.75 | 低于 0.5 在内容繁杂的文档上会消失不见；约 1.0 读起来像原件在移动 —— 那就要在抓取时隐藏 `#source-chip` |
| GHOST_LIFT_SCALE / LIFT_DUR | 1.03–1.08 / 0.12–0.2 s | 阴影才是「离开表面」的提示；缩放只是点缀 |
| TRAVEL_DUR / TRAVEL_EASE | 0.6–1.2 s / `power2.inOut` | 深思熟虑的拖动会减速进入槽位；想更平缓地搬运就用 `power1.inOut`。`TRAVEL_AT ≥ GRAB_AT + 2×PRESS_DUR + LIFT_DUR` |
| DROP_AT / SNAP_DUR | 恰好等于 `TRAVEL_AT + TRAVEL_DUR` / 0.2–0.3 s | 到达和吸附之间有空隙，读起来就像放下失败了 |
| RESIZE_SCALE / RESIZE_DUR | 按剧情定（≈0.4–0.6）/ 0.6–1.0 s | `power2.inOut` |
| LIFT_RISE / LIFT_TILT | 6–12 px / 2–4° | 重排时的拾起；倾斜的符号由索引推导 |

## 关键约束

- **同步锁定是法则** —— 匹配的 tween 沿直线移动（位移量相同时用一个共享的 tween）；要在 easing 的中间点上核对，而不仅仅是端点。两方都用绝对端点。
- **残影是预先渲染的** —— 一个从 t=0 起就位于源位置的 DOM 克隆，`opacity: 0`，由 `tl.set` 显示；已放置字段和装饰也一样。绝不在运行时克隆，绝不按条件渲染。
- **抓取要有分量** —— 任何移动之前先有按压下沉 + 抬起阴影；没有按压就离开的标签，读起来像是隔空取物。
- **放下是一次状态提交** —— 残影消失和已放置字段出现发生在同一个 timeline 位置，`DROP_AT = TRAVEL_AT + TRAVEL_DUR`。
- **缩放用统一的 `scale`，原点在锚点角** —— 绝不用 width/height；单轴拉伸只用于可以拉伸的盒子。
- **填充柄的移动用线性 ease** —— 均匀间隔的 `tl.set` 显示依赖于此；带 easing 的手柄会让它们挤在两端。
- **一拍一个动作** —— 先拖动，再缩放，再离开；把移动和缩放重叠在一起，会让编排变成一团糊。
- 光标、残影和装饰上都设 **`pointer-events: none`**。

## 另见

`physics-press-reaction`（抓取时的按压下沉）· `cursor-click-ripple`（之前 / 之后的一次普通点击）· `spring-pop-entrance`（已放置字段的吸附落定）· `waterfall-entry`（动态的填充级联）· `multi-phase-camera`（范例拖动演示所依托的、带缩放呼吸的承载镜头）· `multi-cursor-choreography`（在群像中使用这个动作）。
