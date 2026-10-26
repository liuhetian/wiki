---
name: coordinate-target-zoom
description: >
  通过把缩放与反向位移结合起来，放大到某个不居中的特定元素上 —— 缩放完成后，目标停在 viewport 中心。
metadata:
  tags: camera, zoom, scale, translate, target, off-center, focus
---

# 坐标目标缩放

在包裹层上简单地设 `scale > 1`，会把不居中的内容推「出」可见画布。要放大*进入*某个不居中的特定元素，必须同步应用缩放「和」反向位移，让目标落到 viewport 中心。

## 原理

两个嵌套的包裹层，职责分离 —— 绝不在「同一个」元素上同时做缩放和位移（在 CSS transform 的组合中，`translate * scale` ≠ `scale * translate`）：

1. **外层包裹层**围绕 `transform-origin: 50% 50%` 应用 `scale`（缩放）
2. **内层包裹层**应用 `translate(x, y)`（反向位移）

反向位移是目标相对 viewport 中心的偏移的**相反数**：

```
T = -offset
```

推导：内层位移把目标移到缩放前单位下的 `offset + T`；外层缩放 S（以中心为原点）把它映射到 `S × (offset + T)`；要落在中心，就是 `S × (offset + T) = 0` → **`T = -offset`**。这个公式「不」依赖 S —— 无论 1.5×、2× 还是 3×，位移都一样。一种常见的错误直觉是 `T = -offset × (S - 1)`：它在 S = 2 时碰巧对得上，在其他任何缩放倍数下都是错的。

⚠️ **这是「嵌套」包裹层的公式。** [viewport-change.md](viewport-change.md) 中的单包裹层摄像机把 `translate(x,y) scale(S)` 放在「一个」元素上，CSS 会先应用缩放 —— 那里的反向位移是 **`T = -offset × S`**。两个公式不能互换；要让公式与包裹层结构相匹配。

## 获取偏移

`T = -offset` 的准确程度完全取决于 `offset`。这个模式上线后出问题的头号原因，就是根据布局公式手算 `offset`，把**符号**或大小算错，然后让缩放把一个小误差放大到画面之外。**默认测量目标实际布局后的中心；公式只留给对称排列的行用。**

**默认做法 —— 测量实际中心（适用于「任何」布局）。** 因为读取的是渲染后的 DOM，而不是脑中的模型，所以不会出符号错误：

```js
await document.fonts.ready; // metrics final; fallback fonts are 10–30px off → tens of px after a 3×+ zoom
const W = 1920,
  H = 1080;
const r = document.getElementById("target-card").getBoundingClientRect();
const TARGET_OFFSET_X = r.left + r.width / 2 - W / 2;
const TARGET_OFFSET_Y = r.top + r.height / 2 - H / 2;
```

**在 setup 时测量一次**并固化 —— 绝不在 `onUpdate` 中逐帧测量。因为测量是异步的（`fonts.ready`），所以要在同一个 `async` setup 中构建并注册 timeline，确保在发布 `window.__timelines[id]` 之前固化的偏移已经就绪。

**捷径 —— 仅限对称的等宽行：**

```js
const index_offset = targetIndex - (N - 1) / 2;
const TARGET_OFFSET_X = index_offset * (CARD_WIDTH + CARD_GAP);
```

⚠️ 这假定每个兄弟元素都是**相同宽度**。一旦这一行不对称，它就会给出错误答案 —— 往往连**符号**都是错的：较重的一侧会把居中的目标推向与你猜测*相反*的方向（例如 `companion(220) + gap + wordmark + gap + chip(110)` 会让 wordmark 位于中心**右侧**约 55px，但「chip − companion」的直觉却说是左侧）。除了等宽卡片之外，一律**测量**。

**余量预算 —— 根据测量出的尺寸给缩放设上限。** 缩放会放大任何居中误差；峰值时让目标不超过画布的约 88%：

```js
const maxScale = Math.min((0.88 * W) / r.width, (0.88 * H) / r.height);
const ZOOM_SCALE = Math.min(DESIRED_SCALE, maxScale);
```

一个占满画面 97% 以上的目标，只要中心稍有偏差，就会立刻显得被截断 —— 而手工固化的偏移总是有偏差的。（感知闸门会把这种情况标记为 `primary-offscreen`；`data-layout-allow-overflow`「不」能豁免它。）

## 配方

```html
<div class="zoom-outer" id="zoom-outer">
  <div class="zoom-inner" id="zoom-inner">
    <div class="content">
      <div class="card">{other}</div>
      <div class="card target" id="target-card">{target}</div>
      <div class="card">{other}</div>
    </div>
  </div>
</div>
```

```css
.scene {
  overflow: hidden; /* REQUIRED — at zoom > 1 the scaled content leaks past the frame */
}
.zoom-outer {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  transform-origin: 50% 50%; /* center scaling is what the counter-translate math assumes */
  will-change: transform;
}
.zoom-inner {
  display: grid;
  place-items: center;
  will-change: transform;
}
```

```js
// TARGET_OFFSET_X/Y and ZOOM_SCALE come from "Getting the offset" — measured
// at setup (after fonts.ready), baked. Counter-translation = -offset.
const counterX = -TARGET_OFFSET_X;
const counterY = -TARGET_OFFSET_Y;

// Scale and counter-translate MUST share position, duration, AND ease —
// otherwise the target visibly wanders mid-zoom.
tl.to("#zoom-outer", { scale: ZOOM_SCALE, duration: ZOOM_DUR, ease: "power3.inOut" }, ZOOM_AT);
tl.to(
  "#zoom-inner",
  { x: counterX, y: counterY, duration: ZOOM_DUR, ease: "power3.inOut" },
  ZOOM_AT,
);
```

## 变体

- **拉远（目标 → 全景）**：把阶段倒过来 —— 从放大状态开始，然后 tween 到 `scale: 1` + `x: 0, y: 0`；「揭示」的那一拍就是全景。
- **多目标缩放序列**：把缩放串起来（目标 A → 停顿 → 目标 B → 拉回）；每一段都需要自己的一对反向位移。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| ZOOM_SCALE | 1.5× 适中 → 3× 主导 → 5×+ 极端 | 用余量预算设上限；栅格媒体需要 `sourceResolution ≥ rendered × ZOOM_SCALE` |
| ZOOM_DUR | 1.0–2.0s | 低于 0.8s 感觉像瞬移，超过 2.5s 就拖沓；两个 tween 共用它 |
| ZOOM_AT | 布局落定之后 + 0.5–1.5s | 在摄像机动起来之前，给观众时间扫视整个布局 |
| DWELL | 缩放落定后 ≥ 1.0s | 理想是 1.5–2s —— 观众必须能看清目标（高潮停留） |

## 关键约束

- **外层缩放，内层位移** —— 绝不在一个元素上同时做两种 transform；嵌套包裹层让计算保持干净。
- **外层包裹层上设 `transform-origin: 50% 50%`** —— 原点不在中心会破坏反向位移的推导。
- **场景根元素上设 `overflow: hidden`** —— 否则放大后的内容会溢出画面。
- **缩放和反向位移在同一个 timeline 位置上共用时长 + ease**，否则目标会在缩放中途漂移。
- **偏移在 setup 时测量一次**（在 `fonts.ready` 之后）并固化 —— 绝不逐帧重算，对不对称的布局也绝不手工推导（符号错了 → 目标被推出画面）。
- **缩放不超出余量预算** —— 根据测量出的尺寸推算，峰值时目标不超过画布的约 88%。

## 另见

[viewport-change.md](viewport-change.md)（单包裹层形式，`T = -offset × S`）· [multi-phase-camera.md](multi-phase-camera.md)（分阶段摄像机中的一个缩放阶段）· [sine-wave-loop.md](sine-wave-loop.md)（缩放落定后的待机呼吸）· [discrete-text-sequence.md](discrete-text-sequence.md)（缩放前在目标中拼装文字）。
