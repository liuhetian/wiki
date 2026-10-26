---
name: 3d-camera-flight
description: >
  穿越一个按 3D 布局的世界的透视镜头飞行 —— 一个静态的透视舞台 + 一个 preserve-3d 世界，世界的位姿（translate3d + rotateX/rotateY）由单一的镜头状态对象逐段 tween。俯冲进一个倾斜的网格、倾斜到展平的拉回、持续飞越竖立的卡片、减速进入对焦。用 power4.out 做硬落地，用 power2.inOut 做重新定位；在非焦点平面上用 depth-of-field-blur 做景深（DoF）。
metadata:
  tags: camera, 3d, flight, perspective, preserve-3d, rotateX, rotateY, translateZ, dive, tilt, world, cinematic
---

# 3D Camera Flight（3D 镜头飞行）

这里其他所有镜头规则都是 **2D 镜头**：[viewport-change.md](viewport-change.md)、[multi-phase-camera.md](multi-phase-camera.md) 和 [coordinate-target-zoom.md](coordinate-target-zoom.md) 都是在一个扁平的包裹层上用 `scale` + `translate` 模拟镜头 —— 镜头从不倾斜，也没有可供行进的纵深轴。[3d-page-scroll.md](3d-page-scroll.md) 是一种**静态倾斜**：整个场景保持同一个角度，内容在里面滚动。这条规则补上的是那台缺失的、会*飞*的镜头 —— 俯冲进一个倾斜的网格，在世界旋转展平的同时拉回，拖着残影掠过竖立的卡片，从模糊中减速进入对焦：一台**用 `rotateX` / `rotateY` / `translateZ` 穿越 3D 布局世界的透视镜头**，遵守与 `viewport-change` 相同的单镜头纪律：**一个透视包裹层、一个镜头状态对象、一个 transform 写入者**，每一段都是对这个状态按顺序排列的一个 tween。

## 工作原理

五层，严格分开：

1. **透镜（lens）** —— 在一个静态的 `.stage` 包裹层上设 `perspective: PERSPECTIVE_PX`。只设一次，绝不 tween，绝不移动。在镜头进行到一半时改变 perspective，看起来像是透镜本身在扭曲，而不是镜头在移动。
2. **世界（world）** —— 一个带 `transform-style: preserve-3d` 的 `.world` div，按最终的 1× 尺寸布局：地面（网格、表单卡片、画布）是扁平的 DOM；可选的**道具**（props：一个巨大的日期数字、一个浮动标签）放在静态的 `translateZ(PROP_Z)` 偏移上，让行进产生视差；还有**竖立的卡片**，做反向倾斜，在各自的落地位姿上正对镜头。
3. **镜头状态** —— 单个对象 `cam = { x, y, z, rx, ry }`（世界的位姿），只由 `applyCamera()` 这一个函数写入 `world.style.transform`，并且按**固定顺序**：`translate3d(x, y, z) rotateX(rx) rotateY(ry)`。平移组合在旋转*之外*时，无论世界当前怎样倾斜，`x`/`y`/`z` 始终沿**屏幕轴**移动世界 —— 平移永远是横向的，`z` 永远是朝向/远离透镜。把旋转放在前面，每一段的数字含义都会随着倾斜的变化而改变。
4. **段（legs）** —— 对 `cam` 的一系列顺序 tween，每个都是一次镜头运动：俯冲进入（`power4.out` —— 猛烈抵达，利落落定）、倾斜到展平的拉回（`power2.inOut` —— 一次重新定位，不是猛撞）、横向飞行、最后的俯冲。镜头意图会反转到世界位姿上，与 `viewport-change` 完全一样：镜头飞**进** → 世界 `z` **增大**（朝透镜靠近）；镜头向**右**摇 → 世界 `x` 为**负**；镜头在表面上方**向下**倾 → 世界 `rx` 为**正**（远端向后倒去）。
5. **纵深线索** —— 景深（DoF）通过 [depth-of-field-blur.md](depth-of-field-blur.md) 的 `--dof` tween 作用在**非焦点平面**上（卡片、道具 —— 叶子元素，绝不是世界本身）；行进段的速度模糊通过 [motion-blur-streak.md](motion-blur-streak.md) 的 Camera-Travel Carve-Out 实现 —— 施加在**舞台**上，绝不施加在世界上（`preserve-3d` 元素上的 `filter` 会把它压平）。

落地位姿是**设计出来的，不是推导出来的**：在设计阶段把 `cam` 设为候选值，调用 `applyCamera()`，截图，调整，再把数字烘焙成常量。在 3D 里不存在可能算错的反向平移公式 —— 位姿本身就是设计决策。绝不要逐帧测量（`onUpdate` 里的 `getBoundingClientRect` 在并行抽帧下会失去同步），也不要手工推导 3D 投影 —— 设计阶段你的眼睛胜过数学。

## 配方

```html
<!-- The lens: static perspective, nothing else. -->
<div class="stage">
  <!-- The world: preserve-3d, laid out at final 1× size; the camera flies by
       tweening THIS element's pose. Travel legs push content past the frame
       edges by design — hence data-layout-allow-overflow. -->
  <div class="world" id="world" data-layout-allow-overflow>
    <div class="surface">
      <div class="grid">{gridCells}</div>
      <div class="card layer" id="card-a" data-depth="0">{cardA}</div>
      <div class="card layer" id="card-b" data-depth="0">{cardB}</div>
    </div>
    <!-- Foreground props float at PROP_Z for parallax; they blur and fly past,
         never carry a read. -->
    <div class="prop layer" data-depth="2" style="--px: PROP_X; --py: PROP_Y">{propGlyph}</div>
  </div>
</div>
```

```css
.scene {
  overflow: hidden; /* travel legs push world content past the frame on purpose */
  background: {sceneBg}; /* the void the flight exposes at frame edges — must be a
     designed surface (deep brand color / soft gradient), never default white */
}
.stage {
  position: absolute;
  inset: 0;
  perspective: PERSPECTIVE_PX; /* THE LENS — static, never tweened */
  /* travel blur (motion-blur-streak carve-out) attaches HERE, never on .world */
}
.world {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  will-change: transform;
  /* keep CLEAN: no filter, opacity < 1, overflow, clip-path, or mask — each
     flattens preserve-3d. Background on .scene, blur on .stage or leaf cards. */
}
.surface {
  position: absolute;
  inset: WORLD_INSET; /* world runs larger than the frame so travel has runway */
  transform-style: preserve-3d;
}
.prop {
  position: absolute;
  left: var(--px);
  top: var(--py);
  /* static world-space pose; counter-tilt faces the camera at the dive pose */
  transform: translateZ(PROP_Z) rotateX(PROP_COUNTER_TILT);
}
.layer {
  --dof: 0px; /* DoF channel per depth-of-field-blur — leaf elements only */
  filter: blur(var(--dof));
  will-change: filter;
}
```

```js
const world = document.getElementById("world");

// Camera state — the ONLY source of truth for the world's pose. Every leg
// tweens this object; nothing else touches world.style.transform.
const cam = { x: 0, y: 0, z: WIDE_Z, rx: 0, ry: 0 };

function applyCamera() {
  // Fixed order: translate OUTSIDE the rotations → x/y/z stay screen-aligned
  // at any tilt. Changing this order changes what every baked pose means.
  world.style.transform = `translate3d(${cam.x}px, ${cam.y}px, ${cam.z}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`;
}
applyCamera(); // seed frame 0 so a seek to t=0 renders the opening pose

// ── LEG 1 — DIVE IN: wide establishing pose → angled close-up on card A.
// fromTo states the opening pose explicitly; power4.out = violent arrival,
// razor-sharp settle. Travel blur: motion-blur-streak carve-out on .stage.
const DIVE_POSE = { x: DIVE_X, y: DIVE_Y, z: DIVE_Z, rx: DIVE_RX, ry: DIVE_RY };
tl.fromTo(
  cam,
  { x: 0, y: 0, z: WIDE_Z, rx: 0, ry: 0 },
  { ...DIVE_POSE, duration: DIVE_DUR, ease: "power4.out", onUpdate: applyCamera },
  DIVE_AT,
);
// Decelerate-INTO-FOCUS: non-focal planes' --dof ramps to BLUR_PER_DEPTH × data-depth
// on the SAME window/ease (depth-of-field-blur focal pull); card A stays at --dof: 0.

// ── LEG 2 — TILT-TO-FLATTEN PULL-BACK: every channel returns to neutral on ONE
// power2.inOut tween — a reposition, not a slam. DoF releases on the same window
// so the flat overview arrives fully crisp.
const FLAT_POSE = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
tl.to(
  cam,
  { ...FLAT_POSE, duration: FLATTEN_DUR, ease: "power2.inOut", onUpdate: applyCamera },
  FLATTEN_AT,
);
tl.to(".layer", { "--dof": "0px", duration: FLATTEN_DUR, ease: "power2.inOut" }, FLATTEN_AT);

// ── LEG 3 — LATERAL FLIGHT: screen-aligned pan (translate is outside the
// rotations, so x is a pure sideways move even mid-tilt).
tl.to(cam, { x: PAN_X, duration: PAN_DUR, ease: "power2.inOut", onUpdate: applyCamera }, PAN_AT);

// ── LEG 4 — FINAL DIVE onto card B: same grammar as leg 1; card A racks OUT of
// focus as card B racks in (depth-of-field-blur rack, shared window).
const LAND_POSE = { x: LAND_X, y: LAND_Y, z: LAND_Z, rx: LAND_RX, ry: LAND_RY };
tl.to(
  cam,
  { ...LAND_POSE, duration: LAND_DUR, ease: "power4.out", onUpdate: applyCamera },
  LAND_AT,
);
tl.to("#card-a", { "--dof": `${MAX_BLUR}px`, duration: LAND_DUR, ease: "power4.out" }, LAND_AT);
tl.to("#card-b", { "--dof": "0px", duration: LAND_DUR, ease: "power4.out" }, LAND_AT);
// Landing dwell: ≥1 s of stillness on card B — unless ending held mid-dive.
```

## 变体

- **持续飞越竖立的卡片** —— 用一个长段取代「俯冲-落地-俯冲」：持续的 `z` + `x` 行进（2–4 s，`power2.inOut` / `power1.inOut` 近乎匀速的巡航），穿过一条由错开在不同 `PROP_Z` 上的卡片和道具组成的走廊。视差承担了主要工作 —— 近处的道具拖着残影掠过，远处的缓缓爬行。通过错开的 `--dof` tween，每次只让一个平面保持清晰。穿过镜头平面的道具（`cam.z + PROP_Z` 逼近 `PERSPECTIVE_PX`）会膨胀到填满画面然后消失 —— 这就是飞越本身；绝不要让焦点卡片穿过它。
- **停在俯冲中途结束** —— 给最后一段一个超出 composition 的时间窗（`LAND_AT + LAND_DUR > data-duration`）；最后一帧停在 tween 中途 —— 仍在行进，模糊尚未完全消散。这在构造上就是 seek 安全的（seek 到最后一帧会落在一个确定的位姿上）；不要用一个更短的段加手动偏移来假装。当 brief 希望在切点处保有动量而不是静止时使用。
- **甩镜扫过** —— 重度运动模糊的横向甩镜，落定到下一个区域：第 3 段在 `cam.x` 上由 [nudge-curve.md](nudge-curve.md) 的三阶段链驱动（以爆发段为主），并在同一时间窗上使用 [motion-blur-streak.md](motion-blur-streak.md) 的 Camera-Travel Carve-Out —— 模糊在加速段逐渐升高，在爆发段保持峰值，在 `power4.out` 尾段消散为 0。完整配方见那条例外许可。
- **停留漂移（停留永不死寂）** —— 在段与段之间，**通过同一个写入者**并入 `multi-phase-camera` 式的微漂移：一个驱动 tween 把微小的 `dx`/`dy`/`drx` 写入一个 `drift` 对象，由 `applyCamera()` 组合 `cam.x + drift.dx`、`cam.rx + drift.drx` 等。绝不要让漂移自己写 `world.style.transform` —— 一个 transform 上有两个写入者，是经典的镜头 bug。幅度按 `multi-phase-camera`（2–8 px），旋转漂移 ≤ 0.5°。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| PERSPECTIVE_PX | 700–1400 px（移动镜头最好用 800–1200） | 越小 = 透视缩短越夸张，俯冲越猛烈；越大 = 接近正交投影，飞行变得扁平 |
| WORLD_INSET | 每边 −50% 到 −150% | 世界是画面的 2–4 倍，让横向段有助跑空间 |
| PROP_Z | 80–300 px | 越高 = 视差越强，飞越来得越早 |
| PROP_COUNTER_TILT | ≈ 读取它的那一段的 `-LAND_RX` | 凭眼睛设计，再烘焙 |
| DIVE_RX / LAND_RX | 30–55° | 「倾斜网格」从约 30° 开始；\|rx\| ≤ 约 65°，\|ry\| ≤ 约 30° —— 超过之后扁平平面会变成侧对镜头，文字无法阅读 |
| DIVE_Z / LAND_Z | PERSPECTIVE_PX ≈ 1000 时为 300–700 px | **Z 预算**：要让内容可读，需满足 `cam.z + PROP_Z ≤ ~0.6 × PERSPECTIVE_PX` —— 接近透视距离时，缩放趋向无穷大，元素越过镜头平面后会翻转/消失 |
| WIDE_Z | −100 到 −400 px | 负 z = 世界被推远 = 镜头处于广角 |
| DIVE_X/Y, LAND_X/Y | 在烘焙好的倾斜下从截图上读出 | 与屏幕对齐（平移在旋转之外） |
| DIVE_DUR / LAND_DUR | 0.6–1.0 s | 是一次全情投入，不是礼貌的缩放；短于 0.5 s 看起来像切 |
| FLATTEN_DUR | 1.2–2.0 s | 这次重新定位是两次俯冲之间的喘息 |
| PAN_DUR | 普通 0.8–1.5 s；甩镜 0.5–0.8 s | |
| Ease 法则 | 俯冲/落地用 `power4.out`；重新定位/巡航用 `power2.inOut` | 镜头上用 spring/back 看起来像世界挂在绳子上晃；四次一模一样的推近看起来像幻灯片 —— 让各段的动作有变化 |
| 停留 | 段与段之间 ≥ 0.8 s；最后的驻留 ≥ 1 s | 除非停在俯冲中途结束 |
| BLUR_PER_DEPTH / MAX_BLUR | 按 [depth-of-field-blur.md](depth-of-field-blur.md) | 每级 3–6 px，终值 8–24 px，只用于叶子元素；行进模糊的峰值按 [motion-blur-streak.md](motion-blur-streak.md)（全画面约 18–20 px，放在 `.stage` 上） |

## 关键约束

- **一个透镜、一个状态、一个写入者** —— `perspective` 只放在静态的 `.stage` 上（绝不放在 `.world` 上，绝不 tween，绝不在内部再套第二个透视包裹层）；每一段都 tween 唯一的 `cam` 对象；只有 `applyCamera()` 写入 transform —— 漂移通过叠加状态并入同一个写入者。两个写入者（或者一个通过 CSS 偷偷溜进来的第二个 transform）是经典的镜头损坏 bug，而这里有五个通道都可能犯这个错。
- **固定的 transform 顺序：平移在旋转之外** —— `translate3d(x,y,z) rotateX() rotateY()`。调换顺序，你设计的每一个位姿都会悄无声息地变成别的意思。
- **保持世界干净** —— `.world`（或任何中间包裹层）上的 `filter`、`opacity < 1`、非 `visible` 的 `overflow`、`clip-path` 或 `mask`，都会强制实际使用 `transform-style: flat`，让场景里每一个 `translateZ` 都塌缩。行进模糊放在 `.stage` 上；景深放在叶子卡片上；淡入淡出放在子元素上；背景放在 `.scene` 上。`.world` 以及它和 3D 定位子元素之间的每一个中间包裹层都要设 `transform-style: preserve-3d`。
- **镜头意图反转到世界上** —— 飞进 = 世界 z 增大，向右摇 = 世界 x 为负，向下倾 = 世界 rx 为正。与 `viewport-change` 相同的正负号法则，只是多了两个要弄对的轴。
- **位姿是设计并烘焙出来的** —— 绝不逐帧测量，绝不手工推导投影。
- **第一段是一个 `fromTo`**，同时 `applyCamera()` 在 setup 时运行一次 —— seek 到 t=0 必须渲染出精确的开场位姿。
- **Z 预算** —— 只有可牺牲的道具才可以穿过镜头平面。
- **阅读发生在落地时** —— 倾斜的、模糊的、飞行中的文字只是质感；观众必须读的任何内容，都要给一个接近扁平的位姿，或者一个清晰、停留 ≥ 1 s 的特写（倾斜到展平这一段之所以存在，就是为了把表面交出来供人阅读）。
- **`.scene` 上的 `overflow: hidden` + `.world` 上的 `data-layout-allow-overflow`** —— 行进段会刻意把面板推出画面之外；没有这一对配置，`check` 会对飞行留在身后的每个区域报告 `container_overflow`。

## 另见

[viewport-change.md](viewport-change.md)（2D 对应版本，同样的单写入者法则 —— 当镜头从不倾斜时用它）· [multi-phase-camera.md](multi-phase-camera.md)（段的编排语法 + 停留时的微漂移）· [coordinate-target-zoom.md](coordinate-target-zoom.md)（`rx`/`ry` 为 0 时扁平停留缩放的瞄准数学）· [depth-of-field-blur.md](depth-of-field-blur.md)（非焦点失焦 / 移焦）· [motion-blur-streak.md](motion-blur-streak.md)（舞台上的行进模糊）· [nudge-curve.md](nudge-curve.md)（甩镜扫过的爆发段调校）· [3d-page-scroll.md](3d-page-scroll.md)（静态倾斜的近亲 —— 镜头不应行进）· [orbit-3d-entry.md](orbit-3d-entry.md) / [depth-scatter-assemble.md](depth-scatter-assemble.md)（静止镜头下的元素运动 —— 正好相反；不要在同一拍里同时运行两者）。能力背景：`../techniques.md` § CSS 3D Transforms。
