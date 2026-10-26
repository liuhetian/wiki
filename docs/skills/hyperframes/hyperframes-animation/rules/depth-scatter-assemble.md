---
name: depth-scatter-assemble
description: >
  N 个元素散入 / 从一个旋转的 3D 纵深点云中重新组装，每个元素从由索引确定性推导出的 3D 偏移出发，最终落定成干净的平面布局。
metadata:
  tags: 3d, scatter, assemble, depth, cloud, tumble, kinetic, letter, fragment, logo, reassemble
---

# 纵深散开 ↔ 组装

N 个元素（字形、卡片、logo 碎片）从一个旋转的 3D 纵深点云中飞入，锁定成一个平面布局 —— 或者反过来。每个元素在点云中都有「自己的」由索引推导的位置（translateZ 纵深 + rotateX/Y 翻滚 + x/y 散布）。区别于 `orbit-3d-entry`（翻转入场后持续环绕）和 `center-outward-expansion`（从一个共享中心做扁平爆发）：这里最终归于一个平面的组装布局。

## 原理

每个元素的平面目标位置存放在 `data-target-x/y` 中；它的散开状态是基于索引的纯三角函数 —— 黄金角分布、阶梯式纵深 —— 所以每次渲染的点云都逐字节相同，不需要 `Math.random`：

```js
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // ~2.39943 rad — even spread, no clumping
const a = i * GOLDEN;
const scatterX = Math.cos(a) * RADIUS;
const scatterY = Math.sin(a) * RADIUS;
const scatterZ = Z_NEAR - (i / (n - 1)) * (Z_NEAR - Z_FAR); // stepped depth
const rotX = Math.sin(a) * TUMBLE;
const rotY = Math.cos(a) * TUMBLE;
```

在任何 tween 之前，先把元素「停放」在各自的散开位置上（`gsap.set`，opacity 0），然后每个元素 tween 到自己的平面目标，同时整个舞台缓慢旋转，让散开状态在锁定之前有生命感。需要在场景根元素上设 `perspective`，并在舞台「和」每个元素上设 `preserve-3d`，否则纵深 + 翻滚会被压平成 2D 缩放。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="cloud-stage">
  <div class="frag" data-target-x="-260" data-target-y="0">{glyph1}</div>
  <div class="frag" data-target-x="-130" data-target-y="0">{glyph2}</div>
  <!-- … one .frag per glyph / fragment … -->
</div>
```

```css
.scene-root {
  display: grid;
  place-items: center;
  perspective: 1400px; /* REQUIRED */
}
.cloud-stage {
  position: relative;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
  will-change: transform;
}
.frag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  backface-visibility: hidden; /* hides the mirrored face mid-tumble */
  will-change: transform, opacity;
}
```

```js
const frags = Array.from(document.querySelectorAll(".frag"));
const n = frags.length;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// 1) Park every fragment in the cloud BEFORE any tween fires
const scatter = frags.map((el, i) => {
  const a = i * GOLDEN;
  const depthT = n > 1 ? i / (n - 1) : 0;
  return {
    x: Math.cos(a) * RADIUS,
    y: Math.sin(a) * RADIUS,
    z: Z_NEAR - depthT * (Z_NEAR - Z_FAR),
    rotationX: Math.sin(a) * TUMBLE,
    rotationY: Math.cos(a) * TUMBLE,
  };
});
frags.forEach((el, i) => gsap.set(el, { xPercent: -50, yPercent: -50, ...scatter[i], opacity: 0 }));

// 2) The cloud rotates so the scatter has life during assembly
tl.to(
  ".cloud-stage",
  { rotationY: CLOUD_SPIN_DEG, duration: CLOUD_SPIN_DUR, ease: "power1.out" },
  0,
);

// 3) ASSEMBLE — cloud point → flat target, index stagger = cloud collapsing inward
frags.forEach((el, i) => {
  tl.to(
    el,
    {
      x: Number(el.dataset.targetX),
      y: Number(el.dataset.targetY),
      z: 0,
      rotationX: 0,
      rotationY: 0,
      opacity: 1,
      duration: ASSEMBLE_DUR,
      ease: ASSEMBLE_EASE,
    },
    i * STAGGER,
  );
});
```

## 变体

- **翻滚替换**（段落节拍切换时的交接）：两组字形共用同一个点云；由「一个」共享的 0→1 进度 tween 在它的 `onUpdate` 中同时驱动两者 —— 出场的一组从布局插值到点云，`opacity: 1−p`；入场的一组从点云插值到布局，`opacity: p`。用两个独立的 tween 会在 seek 时相位错开，交叉就不再读作一次交接。在 setup 时按短语注入逐字形的 span（在 `document.fonts.ready` 之后测量字形步进宽度 —— 仅限单场景）。
- **径向字母炸开 → 归位**：平面上的特例 —— `Z_NEAR = Z_FAR = 0`，`TUMBLE` 取小值；把组装反过来就是炸开。纯平面内运动。
- **向外散开**：反向的组装（布局 → 点云，opacity 1→0）「只」用作 composition 的最后一拍 —— 放在镜头中途，读起来就像镜头结束了。
- **视差 lockup**：后面的图层用更深的 `|Z_FAR|` + 更长的 `ASSEMBLE_DUR`，前景则更浅 / 更短 —— 按纵深区分速度的滑入，最后锁定成 logo。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| n | 4–14（碎片 4–9） | 超过约 14 个，单个元素的运动路径就看不清了 |
| RADIUS | 250–700px | 让最远的散开点保持在画面内，否则碎片会在没有移动过程的情况下凭空出现 |
| Z_NEAR / Z_FAR | +150…+450 / −150…−500 | 较大的 `\|z\|` 需要更大的 `perspective`，否则碎片会糊开 |
| TUMBLE | 40–110° | 超过 90° 时字形会在 tween 中途显示为空白（有意为之）；单面卡片上限约 80° |
| ASSEMBLE_DUR | 0.7–1.4s | |
| ASSEMBLE_EASE | 默认 `power3.out` | `expo.out` 干脆地吸附，`back.out(1.4)` 带过冲地就位；绝不用 `in` |
| STAGGER | 0.03–0.09s | `n × STAGGER < ASSEMBLE_DUR` —— 是一个整体收拢的运动，而不是排队 |
| CLOUD_SPIN_DEG / \_DUR | ≥ 时长内转 15–60° | 温和的生命感；太快会和组装抢戏 |
| SWAP_DUR | 0.5–1.0s | 落在段落节拍的边界上；越短 = 交叉越硬 |

## 关键约束

- **每个散开值都由索引推导** —— `cos/sin(i × GOLDEN)` + 阶梯式的 `z`。黄金角让点均匀分布，既不扎堆，也不需要 `Math.random`。
- **先 `gsap.set` 点云，再添加 tween** —— 跳过这一步，第 0 帧会显示组装好的布局，然后在第一个 tween 开始时瞬移。
- **舞台「和」每个碎片上都要有 `perspective` + `preserve-3d`** —— 缺任何一个都会压平纵深。
- **归于平面** —— 落定状态是 `z: 0`、旋转为 0；仍然倾斜的落定状态读起来像没完成。
- **翻滚替换：两组字形共用一个进度。**
- 在 `preserve-3d` 内**纵深排序是自动的**（绘制顺序跟随实际的 Z）—— 不需要手动 z-index，这一点不同于环绕情形中那个有上限的区间。

## 另见

`orbit-3d-entry`（改为落定成持续环绕）· `hacker-flip-3d`（字形在到场时解码）· `3d-text-depth-layers`（给锁定后的文字标识加挤出厚度）· `center-outward-expansion`（扁平的 2D 近亲）· `sine-wave-loop`（在归位后的布局上待机呼吸）。
