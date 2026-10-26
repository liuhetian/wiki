---
name: multi-phase-camera
description: >
  按顺序推进的镜头缩放，包含 2-3 个截然不同的阶段（拉远 / 对焦 / 推近），外加持续的微漂移，带来自然的电影感。
metadata:
  tags: camera, zoom, phase, drift, scale, cinematic
---

# Multi-Phase Camera

一个包住**整个**场景的镜头包裹层，在脚本设定的触发时刻依次推进到不同的离散缩放阶段，同时叠加持续的、由正弦驱动的微漂移，让镜头在阶段之间也绝不显得静止。它不同于单次线性缩放 —— 多阶段能营造电影式的节奏（预期 → 揭示 → 落定）。

## 工作原理

镜头就是一个包裹用的 `<div>`，它的 `transform: scale() translate(x, y)` 在唯一一个 `onUpdate` 写入函数里由两个通道合成：

1. **阶段缩放** —— 一个代理对象 `{ scale }`，在触发时刻逐个阶段推进（t=0 时为 `PHASE_1_SCALE` → `PHASE_2_AT` 时到 `PHASE_2_SCALE` → `PHASE_3_AT` 时到 `PHASE_3_SCALE`）。
2. **漂移偏移** —— 持续的、基于正弦的 `translateX` / `translateY`（幅度小、频率慢），**叠加**到阶段变换上。X 和 Y 以略有不同的频率运行（`DRIFT_FREQ_RATIO ≈ 1.3`）—— 频率相同会产生一条完美的对角线，看起来很机械；约 1.3 会得到自然的李萨如曲线。

## 配方

```html
<div class="camera" id="camera">
  <div class="content">
    <div class="hero">{Brand}</div>
    <div class="tagline">{tagline}</div>
    <div class="cta">{ctaText}</div>
  </div>
</div>
```

```css
.scene {
  overflow: hidden; /* REQUIRED — any phase scale < 1 exposes the content's edges */
  background: {sceneBgColor}; /* background on .scene, NOT .camera — a camera-borne
     background warps/translates with the transform and reveals the outer void */
}
.camera {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transform-origin: 50% 50%; /* off-center origin creates phase-to-phase drift */
  will-change: transform;
}
```

```js
const camera = document.getElementById("camera");

// Three-phase scale plan: pullback → focus → push.
const phase = { scale: PHASE_1_SCALE }; // Phase 1 is the initial value — no tween

// Phase 2 — settle to neutral focus
tl.to(phase, { scale: PHASE_2_SCALE, duration: PHASE_2_DUR, ease: PHASE_2_EASE }, PHASE_2_AT);

// Phase 3 — slow push-in for the climax
tl.to(phase, { scale: PHASE_3_SCALE, duration: PHASE_3_DUR, ease: PHASE_3_EASE }, PHASE_3_AT);

// Drift driver — continuous sine motion overlaid on the phase scale.
// The ONE writer of camera.style.transform.
const drift = { p: 0 };
tl.to(
  drift,
  {
    p: Math.PI * 2 * DRIFT_CYCLES,
    duration: TOTAL_DURATION, // spans the whole composition
    ease: "none",
    onUpdate: () => {
      const dx = Math.sin(drift.p) * DRIFT_AMP_X;
      const dy = Math.sin(drift.p * DRIFT_FREQ_RATIO) * DRIFT_AMP_Y;
      camera.style.transform = `scale(${phase.scale}) translate(${dx}px, ${dy}px)`;
    },
  },
  0,
);

// Content reveals happen INSIDE the camera frame (hero/tagline/cta beats).
```

## 阶段模式

| 模式                | 缩放序列（1 → 2 → 3）             | 观感                            | 何时使用                      |
| ------------------- | --------------------------------- | ------------------------------- | ----------------------------- |
| **Focus-in（推近对焦）**        | 拉远 → 中性 → 轻微推近      | 靠近 → 落定 → 轻微推近          | 默认的产品揭示                |
| **Dramatic reveal（戏剧性揭示）** | 推近 → 中性 → 拉远        | 广角 → 对焦 → 回退落定          | 留有呼吸空间的 hero 镜头      |
| **Steady push（稳定推进）**     | 中性 → 轻微推近 → 更多推近  | 渐进的向前动势                  | 持续推进的叙事                |
| **Bookend pull（首尾回拉）**    | 中性 → 强力推近 → 中性      | 落定 → 推近 → 释放              | 先强调 CTA，然后释放          |

## 变体

- **按内容节拍触发阶段**：让镜头 tween 的开始对齐某个内容 tween 的结束（入场完成 → 推近开始），而不是一个固定的时钟值。
- **镜头抖动（惊慌 / 冲击）**：在一个短时间窗内做一次幅度更大、频率更高的短暂漂移 tween —— 同样的 `drift` 机制，在 `SHAKE_AT` 时使用 `SHAKE_AMP` / `SHAKE_CYCLES` / `SHAKE_DUR`。
- **定向推近一个偏离中心的元素**：把缩放与反向平移结合起来，让目标落到 viewport 中心 —— 先用当前缩放值去除测得的偏移量，再送进写入函数：

```js
const tRect = document.querySelector(".cta").getBoundingClientRect();
const offsetX = (STAGE_W / 2 - (tRect.left + tRect.width / 2)) / phase.scale;
const offsetY = (STAGE_H / 2 - (tRect.top + tRect.height / 2)) / phase.scale;
// then in onUpdate: translate(offsetX + dx, offsetY + dy)
```

（完整的反向平移原则：[coordinate-target-zoom.md](coordinate-target-zoom.md)。）

## 取值

| token                       | 范围                                     | 说明                                                                                |
| --------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| PHASE_1 / 2 / 3_SCALE       | 0.88–0.96 / 0.98–1.02 / 1.04–1.15        | 间距越窄，镜头越含蓄；scale < 1 时**必须**在 `.scene` 上设 `overflow: hidden`       |
| PHASE_2_AT / PHASE_2_DUR    | 0.3–1.0s / 1.0–1.8s                      | DUR 越长，落定越慢，越有电影感                                                      |
| PHASE_3_AT / PHASE_3_DUR    | 2.0–4.0s / 1.0–2.0s                      | PHASE_3_AT ≥ PHASE_2_AT + PHASE_2_DUR，否则对焦会被抢先打断                         |
| PHASE_2_EASE / PHASE_3_EASE | `power2.out` `power3.out` `power2.inOut` | 镜头上用 spring/back 缓动会让人不舒服；越靠后的阶段落定得越深                       |
| TOTAL_DURATION              | = `data-duration`                        | 漂移 tween 必须覆盖整个 composition                                                 |
| DRIFT_CYCLES                | 1–3                                      | 1 = 一次缓慢的呼吸；值高了看起来像机械晃动                                          |
| DRIFT_AMP_X / DRIFT_AMP_Y   | 2–8 px / 1–4 px                          | 逐帧察觉不到，随时间推移可见 —— 如果看起来像抖动，就是太多了                        |
| DRIFT_FREQ_RATIO            | 1.2–1.5                                  | 1.0 = 完美对角线（机械）；约 1.3 = 自然的李萨如曲线                                 |
| HERO_AT（等）               | 在 Phase-2 落定完成之后                  | 在拉远过程中淡入的 hero 会让人觉得它正在飞走                                        |

## 关键约束

- **镜头包住场景里的一切** —— 逐元素的镜头会产生视差 bug，并破坏「同一个视点」的观感。
- **只有一个写入者**：阶段缩放和漂移在唯一的漂移 `onUpdate` 里合成；其他任何东西都不碰 `camera.style.transform`。
- **`.scene` 上设 `overflow: hidden`** —— 只要有任何阶段的 scale < 1 就必须设。
- **`.camera` 上设 `transform-origin: 50% 50%`** —— 偏离中心的原点会在阶段之间产生不可预测的漂移。
- **场景背景放在 `.scene` 上，不要放在 `.camera` 上** —— 否则缩放/平移时会露出外面的虚空。
- **hero 揭示要等初始拉远的缓动落定之后才开始** —— 否则大标题会让人觉得它正在飞走。

## 另见

[coordinate-target-zoom.md](coordinate-target-zoom.md)（定向变体的反向平移数学）· [orbit-3d-entry.md](orbit-3d-entry.md)（在漂移镜头内的轨道运动）· [counting-dynamic-scale.md](counting-dynamic-scale.md)（与计数器峰值同步的高潮推近）· [3d-text-depth-layers.md](3d-text-depth-layers.md)（镜头运动下纵深堆叠的 hero）· [sine-wave-loop.md](sine-wave-loop.md)（镜头内元素的空闲运动）。
