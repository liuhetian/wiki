---
name: depth-of-field-blur
description: >
  选择性对焦 / 移焦 —— 通过 GSAP tween 失焦图层上的 filter 模糊（再加一点 opacity 变暗），同时让焦点元素保持清晰，把视线拉向焦点元素。用一个 `--dof` CSS 变量驱动模糊；有限时长的 tween，不用 CSS transition，确定性。涵盖单一焦点拉拽、在两个景深平面之间移焦，以及推进镜头的同时模糊周围群组。
metadata:
  tags: blur, focus, depth-of-field, dof, rack-focus, filter, dim, spotlight, cinematic, push-in
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/depth-of-field-blur.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 景深模糊（选择性对焦 / 移焦）

通过**模糊**（并略微**变暗**）焦点元素周围的一切，同时让焦点图层保持清晰，把视线拉到这一个焦点元素上 —— 就像摄像机的景深让背景虚化，或者移焦时切换哪个平面处于焦内。`filter` 和 `opacity` 都只影响绘制，所以两者的 tween 都是 seek 安全的。这是 blueprint 们常用的「焦外衰减」那一拍背后的规则：推进镜头时外围节点变模糊（`constellation-hub`）、在视差卡片堆叠上移焦（`cursor-ui-demo`）、非高亮卡片变暗以聚光一个 hero 指标（`dataviz-countup`）。

## 原理

每个图层都带一个 `--dof` 自定义属性（模糊的 px 值），由 `filter: blur(var(--dof))` 读取，再加上它自己的 `opacity`。一个 GSAP tween 在焦点切换的时间窗内，把每个图层的 `--dof` 从 `0` 推进到它的目标模糊值，把 opacity 从 `1` 推进到一个变暗的水平。焦点图层的 `--dof` 保持为 `0`。每个图层的目标值由 `data-depth` / 索引推导，所以每次 seek 时的衰减都完全相同。

三种机制，同一个基本原语：

1. **焦点拉拽** —— 一个时间窗：失焦图层从清晰（0）→ 模糊，而焦点图层保持在 0。视线被拉到唯一仍然清晰的东西上。
2. **移焦** —— 同一属性上两个相邻的时间窗：平面 A 的模糊从 0 → 最大值，同一位置上平面 B 的模糊从最大值 → 0。状态连续性的重要程度与 `press-release-spring` 中完全一样：移焦之后 A 的静止模糊值，必须等于 B 在移焦之前保持的值 —— 把两者都写成同一个 `--dof` 上、同一位置的 tween，让交接无缝。
3. **推进镜头的同时模糊周围群组** —— DoF tween 与一个摄像机推进（`multi-phase-camera` / `coordinate-target-zoom`）放在「相同」的 timeline 位置上：「世界退远」和「我们推近」读起来是同一个运动。

## 配方

```html
<div class="world" id="world">
  <!-- Focal layer — stays sharp -->
  <div class="layer focal" id="focal">{FocalLabel}</div>
  <!-- Off-focus layers — blur + dim; data-depth orders near→far -->
  <div class="layer ctx" data-depth="1">{Context A}</div>
  <div class="layer ctx" data-depth="2">{Context B}</div>
  <div class="layer ctx" data-depth="3">{Context C}</div>
</div>
```

```css
.world {
  /* single wrapper so a concurrent camera push-in transforms everything
     together; DoF is independent of the camera */
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
}
.layer {
  --dof: 0px; /* px of blur; filter reads it — starts sharp */
  filter: blur(var(--dof));
  will-change: filter; /* promotes the layer so per-frame re-rasterization is cheap */
}
.focal {
  z-index: 2; /* sharp layer must sit ABOVE the blurred ones, or its crisp
     edges read as bleeding into the haze */
}
.ctx {
  z-index: 1;
}
```

```js
// Mechanic 1 — FOCAL PULL. Blur scales with data-depth so far planes blur
// more than near ones; the focal layer (--dof: 0, opacity: 1) is untouched.
gsap.utils.toArray(".ctx").forEach((el) => {
  const depth = Number(el.dataset.depth) || 1;
  tl.to(
    el,
    {
      "--dof": `${BLUR_PER_DEPTH * depth}px`,
      opacity: DIM_LEVEL, // dim, not gone
      duration: FOCUS_DUR,
      ease: "power2.inOut",
    },
    FOCUS_START,
  );
});
```

## 变体

- **在两个景深平面之间移焦** —— 在移焦「之前」用 `gsap.set` 把平面 B 预先设成模糊（避免跳变），然后用两个共享 `RACK_START` + `RACK_DUR` 的 tween：A → `MAX_BLUR` + `DIM_LEVEL`，B → `0px` + `1`。共享的时间窗让它们在中点处交叉。
- **推进镜头的同时模糊周围群组** —— 让焦点拉拽的 tween 与 `#world` 上的摄像机 tween（`scale/x/y`，`power2.inOut`）使用相同的位置 + 时长。摄像机 transform 整个世界；DoF tween 各个图层 —— 属性通道彼此独立，不会冲突。
- **在卡片网格中聚光一个 hero 指标** —— `gsap.utils.toArray(".card:not(.hero)")` 在一个共享时间窗内全部失焦（`GRID_BLUR` + `DIM_LEVEL`）；hero 被跳过。
- **重新对焦 / 落定** —— 如果这一拍要回到「一切可见」（或者要交接给一个需要干净出场帧的交叉淡化），就在末尾把所有 `--dof` 拉回 `0px` / opacity 1（`REFOCUS_START + REFOCUS_DUR ≤ DURATION`）。
- **焦点图层上有界的焦距呼吸（可选）** —— 停留期间，一个有限时长、`ease:"none"` 的驱动把 `Math.max(0, Math.sin(p)) * FOCAL_BREATH_PX` 写入焦点图层的 `--dof`。保持 ≤ 约 0.6px，否则读起来像「还在对焦」；默认不加。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| BLUR_PER_DEPTH | 每个景深级 3–6 px | 3 个平面的堆叠最多约 9–18 px；低 = 柔和的景深，高 = 移轴式的衰减 |
| MAX_BLUR | 8 柔和 → 16 默认 → 24 强烈（px） | 完全失焦平面的最终模糊值；在大面积表面上超过约 24 px 时，改为缩小 / 合并该图层 |
| GRID_BLUR | 6–12 px | 把卡片推远，同时不丢掉网格的形状 |
| DIM_LEVEL | 0.4 强 → 0.55 默认 → 0.7 含蓄 | 很少低于 0.35 —— 完全变暗读起来是「被移除」，而不是「失焦」 |
| FOCUS_DUR | 0.5–1.2 s | 移焦 / 拉拽是一个有意为之的动作，不是瞬切；更短 = 快速对焦，更长 = 慵懒 |
| RACK_START / RACK_DUR | 两个平面共用 | 在 `RACK_START` 「之前」用 `gsap.set` 设好预先模糊的平面 |
| FOCAL_BREATH_PX | ≤ 0.6 px，周期 2–3 s | 若有若无的小细节 |
| 焦点层 vs 上下文层的尺寸 | 上下文层更小 / 合并成组 | 小的上下文图层用适中的半径也能读作「焦外」—— 而且模糊开销低 |

Token：深色的 `{bgGradient}`，让清晰的焦点图层读起来是被照亮的、靠前的；展示用 `{font}` 用粗字重 —— 模糊后的文字需要它才能保持形状可辨。

## 关键约束

- **在 timeline 上 tween `--dof` 变量** —— 通过 `filter: blur(var(--dof))` 读取，让模糊跟随 HF 的 seek 时钟。
- **模糊「小的 / 合并成组的」图层，而不是巨大的那个。** filter 的开销与半径 × 像素面积成正比；在全画幅背景上做 20 px 的模糊是最坏的情况。在大面积表面上让每个图层的半径保持 ≤ 约 24 px，并依靠 `opacity` 的**变暗**来完成推远的工作 —— 变暗 + 适度模糊，比把模糊拉到最大更像真实的景深。
- 每个模糊有动画的图层上都设 **`will-change: filter`**（如果该图层还承担繁重的 transform 工作，落定后去掉它）。
- **焦点图层保持真正的清晰** —— `--dof: 0`，不去动它（或者呼吸 ≤ 0.6 px）。焦点元素上任何可见的模糊，都会毁掉「就是它」的读感。
- **移焦时的状态连续性** —— 出场平面的起始模糊值，等于入场平面原先保持的模糊值，反之亦然；在同一个 `--dof` 上、同一位置放相邻的 tween。
- **景深独立于摄像机** —— 模糊各个图层，推进时 transform `.world`；不要用摄像机 transform 伪造景深，反之亦然。
- **交接之前先恢复清晰** —— 如果下一拍是交叉淡化 / 推入，就在末尾重新对焦到 `--dof: 0`；在失焦中途交接，读起来像「渲染出故障了」。
- **清晰的焦点图层在模糊图层之上**（`z-index`）。

## 另见

[multi-phase-camera.md](multi-phase-camera.md)（本规则的衰减所伴随的推进镜头）· [coordinate-target-zoom.md](coordinate-target-zoom.md)（放大到焦点核心 —— `constellation-hub` 的钩子）· [viewport-change.md](viewport-change.md)（在倾斜的卡片平面上平移 + 移焦）· [counting-dynamic-scale.md](counting-dynamic-scale.md)（hero 指标清晰地计数上涨 —— `dataviz-countup` 的聚光）· [3d-page-scroll.md](3d-page-scroll.md)（在其间移焦的视差堆叠）· [sine-wave-loop.md](sine-wave-loop.md)（移焦后的待机；两者的幅度都要保持很小）。
