---
name: orbit-3d-entry
description: >
  元素从 3D 空间翻转进入，然后落定为围绕焦点的持续椭圆轨道运动。
metadata:
  tags: orbit, 3d, flip, ellipse, circular, icon, entry, continuous
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/orbit-3d-entry.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 带 3D 入场的轨道运动（Orbit with 3D Entry）

元素从 3D 空间翻转进入（`rotateX` + `rotateY` + 负的 `z`），然后落定为围绕中心标签的持续椭圆轨道运动。它不同于一次性的揭示 —— 轨道会一直运转，由 timeline **内部**一个 0→1 的进度 tween 驱动（绝不用 rAF）。

## 工作原理

每个元素两个阶段：(1) 一次 `back.out` 翻转，从隐藏的 3D 朝向转到平放 —— **就在它的轨道起始位置原地翻转**（见关键约束）；(2) 持续的轨道运动，`onUpdate` 用 `cos/sin(initialAngle + p·2π)` 在椭圆上计算 `x/y`。舞台需要在场景根节点上设 `perspective`、在舞台和各元素上设 `preserve-3d`，否则翻转会被压平成 2D 缩放。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="orbit-stage">
  <div class="orbit-item" data-angle="0">{glyph1}</div>
  <div class="orbit-item" data-angle="60">{glyph2}</div>
  <!-- … evenly-spaced angles … -->
  <div class="orbit-center">{centerLabel}</div>
</div>
```

```css
.scene-root {
  display: grid;
  place-items: center;
  perspective: 1800px; /* REQUIRED */
}
.orbit-stage {
  position: relative;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
}
.orbit-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  will-change: transform;
}
.orbit-center {
  position: relative;
  transform: translateZ(220px); /* wins paint order inside preserve-3d */
  z-index: 9999;
}
```

```js
const items = document.querySelectorAll(".orbit-item");
const RADIUS_Y = RADIUS_X * Y_TO_X_RATIO; // perspective-flattened ellipse

items.forEach((el, i) => {
  const a0 = (Number(el.dataset.angle) / 360) * Math.PI * 2;
  const startX = Math.cos(a0) * RADIUS_X;
  const startY = Math.sin(a0) * RADIUS_Y;

  // 1) Park at the orbital position, hidden — BEFORE any tween fires
  gsap.set(el, {
    xPercent: -50,
    yPercent: -50,
    x: startX,
    y: startY,
    rotateX: ROTATE_X_FROM,
    rotateY: ROTATE_Y_FROM,
    z: Z_FROM,
    opacity: 0,
    scale: SCALE_FROM,
  });

  // 2) Flip in IN PLACE — rotation/opacity/scale only, never translate
  tl.to(
    el,
    {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      opacity: 1,
      scale: 1,
      duration: ENTRY_DUR,
      ease: `back.out(${FLIP_BACK})`,
    },
    i * STAGGER,
  );

  // 3) Continuous orbit — each item gets its OWN progress tween (own initialAngle)
  const orbit = { p: 0 };
  tl.to(
    orbit,
    {
      p: 1,
      duration: ORBIT_DURATION,
      ease: "none",
      onUpdate: () => {
        const a = a0 + orbit.p * Math.PI * 2;
        const x = Math.cos(a) * RADIUS_X;
        const y = Math.sin(a) * RADIUS_Y;
        // capped z-index band [1, 50] — see center-label clearance below
        el.style.zIndex = String(1 + Math.round(((y + RADIUS_Y) / (2 * RADIUS_Y)) * 49));
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      },
    },
    i * STAGGER + ENTRY_DUR,
  );
});

tl.from(
  ".orbit-center",
  { opacity: 0, scale: 0.6, duration: ENTRY_DUR, ease: `back.out(${CENTER_BACK})` },
  CENTER_FADE_AT,
);
```

## 变体

- **收拢到中心**：最后一个 1→0 的驱动器在 `onUpdate` 里乘到两个半径（以及元素缩放）上 —— 光环凝缩进中心元素；可以搭配一次 CTA「点击」来点燃这次收拢。
- **倾斜的轨道平面**：在 `.orbit-stage` 上加 `rotateX(25deg)` —— 元素明显地沿着这个平面划出弧线。

## 取值

| token                   | 范围                          | 说明                                                                |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------- |
| RADIUS_X                | 300–900px                     | 在水平方向上也必须避开中心标签（见下文）                            |
| Y_TO_X_RATIO            | 0.4–0.7                       | 保持 < 1 —— 一个倾斜的环，而不是正面的光环                          |
| ORBIT_DURATION          | 每圈 4–25s                    | ≥ 在屏时间，否则 tween 结束后元素会冻住                             |
| ENTRY_DUR               | 0.4–0.8s                      |                                                                     |
| STAGGER                 | 0.06–0.12s                    | 低于此值看起来像「爆米花」，高于此值显得拖沓                        |
| FLIP_BACK / CENTER_BACK | 1.2–2.0 / 1.2–1.8             | 两者触发时间很接近时，让中心的弹出平静一些                          |
| CENTER_FADE_AT          | 在 2–4 个元素落位之后         | 太早会抢戏；太晚会留下一个空洞                                      |
| ROTATE_X/Y_FROM, Z_FROM | ±60–120°、±45–120°、−200…−400 | 所有元素使用一致的旋转方向；正负号混用 = 噪点                       |
| SCALE_FROM              | 0.2–0.6                       |                                                                     |
| 元素数量                | 4–12                          | 少了显得空，多了会挤占中心                                          |

## 关键约束

- **❗ 入场必须在轨道位置上原地翻转，而不是在中心** —— 在添加 tween **之前**，先用 `gsap.set` 把每个元素放到 `(cos(a0)·RADIUS_X, sin(a0)·RADIUS_Y)`，并设 `opacity: 0`，然后阶段 1 只对旋转/不透明度/缩放做动画。如果用一个保持 `x/y: 0` 的 fromTo，元素会在舞台中心翻转、撞上中心标签，然后在阶段 2 开始时瞬移到轨道上。
- **❗ 中心标签的避让** —— 在 `preserve-3d` 内部单靠 `z-index` 不可靠（绘制顺序跟随实际的 Z）：用 `translateZ(220px)` + `z-index: 9999` 把标签往前推，把元素的 z-index 限制在 `[1, 50]`，**并且**设定环的尺寸，让元素在每个角度上都在水平方向避开标签：`RADIUS_X × min|cos(θ)| ≥ L_w + I_w + breathing_room`（标签/元素的半宽；6 个元素时最坏情况是 `cos(30°) ≈ 0.866`）。分量更重的文字标识需要更宽的环。
- **每个元素都有自己的轨道 tween** —— 共享的 `targets: ".orbit-item"` tween 无法携带每个元素各自的 `initialAngle`。
- **中心元素才是大标题** —— 轨道是装饰；如果它喧宾夺主，就把中心放大，或者把各元素调暗。

## 另见

`center-outward-expansion`（爆发式入场；反向驱动器 = 收拢式收尾）· `cursor-click-ripple`（触发收拢的那次点击）· `depth-scatter-assemble`（落定为平面而不是进入轨道的 3D 入场）。
