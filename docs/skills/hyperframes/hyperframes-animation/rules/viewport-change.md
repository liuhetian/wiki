---
name: viewport-change
description: >
  虚拟镜头 —— 通过变换一个包住所有场景内容的包裹层，模拟缩放 / 摇镜 / 焦点锁定。镜头向右移 → 世界向左平移。
metadata:
  tags: viewport, camera, zoom, pan, focus-lock, virtual-camera
---

# Viewport Change（虚拟镜头）

通过变换一个包住**所有**场景内容的包裹层，来模拟镜头效果（缩放 / 摇镜 / 对一个移动元素的焦点锁定）。「世界」朝着与感知到的镜头运动相反的方向移动。区别于 [multi-phase-camera](multi-phase-camera.md)（2-3 个离散阶段 + 漂移）—— viewport-change 是单次连续的缩放/摇镜，常用于跟随一个移动元素的焦点锁定。

## 工作原理

镜头意图 → 世界变换。镜头**向右摇** → 世界 `translateX(-distance)`；镜头**推近** → 世界 `scale(>1)`；镜头**跟随元素 X** → 世界逐帧 `translateX(viewportCenter - elementWorldX)`。正负号要弄对，否则一切都会朝错误的方向移动。唯一的 `.world` 包裹层承载镜头变换；里面的元素按世界空间定位，保持不变。

**单元素复合变换（这条规则的形式）。** 缩放和平移都放在**一个**包裹层上，写成 `translate(x, y) scale(S)`。CSS **先**应用缩放，再应用平移（从右到左的矩阵合成），所以位于世界偏移 `(ox, oy)` 处的点会落在屏幕上的 `(S × ox + x, S × oy + y)`。要把目标映射到 viewport 中心，求解 `S × offset + T = 0`：

```
T = -offset × S
```

这**不同于 [coordinate-target-zoom](coordinate-target-zoom.md)**，那条规则使用两个嵌套的包裹层（外层缩放，内层平移），推导出的是 `T = -offset`（与 S 无关）。把这两种形式弄混，缩放改变时目标就会逐渐偏离中心。当你想让镜头状态（`cam.scale`、`cam.x`、`cam.y`）有单一事实来源、通过 `onUpdate` 写入时，用这种单包裹层形式；当缩放和平移可以以共享的 ease 各自独立 tween 时，用嵌套包裹层。

## 配方

```html
<div class="world" id="world">
  <div class="content">
    <div class="hero">{Brand}</div>
    <div class="tagline">{tagline}</div>
    <div class="cta" id="cta">{ctaUrl}</div>
  </div>
</div>
```

```css
.scene {
  overflow: hidden; /* REQUIRED — any non-1.0 scale reveals edges or pushes content off-frame */
  background: {bgGradient}; /* on .scene, NOT .world — a world-borne background warps with the camera */
}
.world {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transform-origin: 50% 50%; /* centered scaling is what the math assumes */
  will-change: transform;
}
```

```js
const world = document.getElementById("world");

// Camera state — single source of truth. The world transform is composed from
// this object in ONE place so the transform string order is stable.
const cam = { scale: 1, x: 0, y: 0 };
function applyCamera() {
  world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`;
}
applyCamera(); // seed frame 0

// Zoom in on the CTA: single-element composite transform → T = -offset × S.
// TARGET_OFFSET_Y is the target's measured offset from viewport center at
// neutral camera (sign matters — positive = below center).
const counterY = -TARGET_OFFSET_Y * TARGET_SCALE;

tl.to(
  cam,
  {
    scale: TARGET_SCALE,
    y: counterY,
    duration: ZOOM_DUR,
    ease: "power3.inOut",
    onUpdate: applyCamera,
  },
  ZOOM_START,
);
```

## 缩放值指南

| 效果        | 缩放        | 观感                                |
| ----------- | ----------- | ----------------------------------- |
| 含蓄        | 1.02 - 1.05 | 几乎察觉不到 ——「专业」             |
| 中等        | 1.05 - 1.15 | 「当当当」式的强调                  |
| 明显        | 1.15 - 1.30 | 聚焦到某个区域                      |
| 戏剧性      | 1.5 - 2.5   | 元素填满屏幕                        |
| 全屏        | 3.0+        | 元素覆盖整个 viewport               |

感知：< 5% 的缩放变化察觉不到；10-15% 是舒适的强调；> 30% 是电影化/戏剧性的。想要自然的产品感，首选在 2-3s 内做 1.05-1.15× 的缩放；> 1.3× 的大幅推近留给戏剧性的叙事时刻。

### 极端范围 —— 4–12× 向外拉（工作区揭示）

同一套单镜头数学可以远远超出上表的范围：一次拉远式的工作区揭示，开场时以 **4–12×** 推近在某个细节上（一个单元格、一条消息或一个按钮），然后以一次连续的运动拉出到完整的工作区。机制不变 —— 一个 `cam` 对象，`T = -offset × S`，一个 `applyCamera()` 写入函数 —— 变的只是编写方向：

- **按最终（1×）布局搭建工作区，以放大状态开场**（`cam.scale = 8`，用反向平移对准开场的细节；把它写在 `fromTo` 里 / 通过 `applyCamera()` 写入初值，让 seek 到 t=0 时落在推近的状态）。这样宽景的落点帧就是一切都处在原生设计尺寸 —— 文字清晰，栅格素材是源分辨率。
- **绝不要反过来** —— 以 1× 编写特写，再把世界缩小到 0.08–0.25 得到宽景，会让每个标签都低于可读的像素尺寸，并让栅格媒体变糊；揭示最终落在一团糊上。
- **实测开场目标** —— 在 S = 8 时，烘焙偏移量里 1 px 的误差在开场机位上就是屏幕上的 8 px。偏移量要取自目标实际布局后的中心（在 `fonts.ready` 之后用 `getBoundingClientRect`，setup 时测一次 —— 即 [coordinate-target-zoom.md](coordinate-target-zoom.md) 里的测量原则），绝不要取自布局公式。
- **开场细节必须经得起 ×S** —— 最初几帧里它以设计尺寸的 `S ×` 渲染（矢量/DOM 文字是安全的；栅格需要 `sourceResolution ≥ rendered × S`）。

## 变体

- **焦点锁定（镜头跟随一个移动的光标/角色）** —— 在驱动器的 `onUpdate` 里逐帧计算世界偏移，让元素保持在固定的屏幕 X 位置：

```js
const focusEl = document.querySelector(".moving-cursor");
const targetScreenX = VIEWPORT_WIDTH * FOCUS_SCREEN_X_FRAC; // 0.4–0.7; 0.5 = dead center
const focusUpdate = { p: 0 };
tl.to(
  focusUpdate,
  {
    p: 1,
    duration: FOLLOW_DUR, // matches how long the focused element is in motion
    ease: "power2.inOut",
    onUpdate: () => {
      const rect = focusEl.getBoundingClientRect();
      cam.x = targetScreenX - (rect.left + rect.width / 2);
      applyCamera();
    },
  },
  FOLLOW_START,
);
```

- **复合缩放（多阶段）** —— 两个代理 tween 通过同一个写入函数相乘：`cam.scale = scaleUp.v * scaleDown.v; applyCamera()`。把缓慢的推近（约 1.15）和短暂的回放（约 0.9）组合起来，形成呼吸/重击的形状。
- **镜头模式切换（居中 → 跟随）** —— 通过一个 0→1 的权重 tween 在两种镜头模式之间交叉淡化；中间帧在两种模式的偏移量之间插值。

## 取值

| token           | 范围                                 | 说明                                                                                        |
| --------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| TARGET_OFFSET_Y | 实测值，不是自由参数                 | 中性镜头下目标相对 viewport 中心的偏移；用 `getBoundingClientRect` 测量                     |
| TARGET_SCALE    | 1.3× 适度 → 1.6–2.0× 常见 → 3×+      | 栅格媒体需要 `sourceResolution ≥ rendered × TARGET_SCALE`                                   |
| ZOOM_START      | 内容落定 + 约 0.5s 的扫视时间        | 让观众先看完，镜头再动                                                                      |
| ZOOM_DUR        | 1.0–2.0s                             | 低于 0.8s 像瞬移，超过 2.5s 显得拖沓                                                        |
| DWELL           | 缩放落定之后 ≥ 1.0s                  | 观众必须能看清焦点（高潮停留）                                                              |
| VIEWPORT_WIDTH  | = 根节点的 `data-width`              | 真实值，不是抽象值                                                                          |

## 关键约束

- **一个 `.world` 包裹层承载整个镜头** —— 每个场景元素都住在它里面；第二个被变换的包裹层就是第二台镜头。
- **通过 `cam` 对象 + `applyCamera()` 保持单一事实来源** —— 当缩放和平移都在变时，在**一个**地方写入它们；绝不要把它们拆到多个直接碰 `world.style.transform` 的 tween 里（transform 字符串的合成顺序会变得不可预测）。
- **单包裹层的反向平移是 `T = -offset × S`** —— 不要搬用嵌套包裹层的 `T = -offset` 公式。
- **`.scene` 上设 `overflow: hidden`**；**`.world` 上设 `transform-origin: 50% 50%`**；**背景放在 `.scene` 上，绝不放在 `.world` 上**。

## 另见

[coordinate-target-zoom.md](coordinate-target-zoom.md)（嵌套包裹层的替代方案，`T = -offset`）· [multi-phase-camera.md](multi-phase-camera.md)（在某一个阶段内使用 viewport-change）· [sine-wave-loop.md](sine-wave-loop.md)（viewport 落定后的空闲微漂移）。
