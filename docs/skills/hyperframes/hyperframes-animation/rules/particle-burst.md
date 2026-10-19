---
name: particle-burst
description: >
  确定性的粒子 / 彩纸事件 —— 向上炸开再飘落的彩纸爆发（可选在最后瞬间缩小消失）、从文字后方迸出的圆点爆发，或者字形溶解成粒子。每个粒子的状态都是 timeline 时间的纯弹道函数，取值由索引作种子，所以拖动到任意 t 都会显示正确的飞行中途帧。
metadata:
  tags: particles, confetti, burst, dissolve, celebration, ballistic, deterministic, punctuation
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/particle-burst.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Particle Burst

把离散的飞行粒子作为一次性事件：一次向上迸发、再在重力下飘落的**彩纸爆发**，一次从落定的词后方向外辐射的**圆点爆发**，或者一次文字碎成粒子、四散并消亡的**字形溶解**。粒子是转瞬即逝的点缀 —— 因一拍而生，飞出，消失；它们绝不会成为布局的一部分。

边界：[css-marker-patterns.md](css-marker-patterns.md) 的 burst 模式是向外辐射的**绘制线条** —— 一个静态的强调，没有飞行。[press-release-spring.md](press-release-spring.md) 的释放爆发是**一层带模糊的径向图层**，用来伪造爆炸 —— 当一次辉光弹出就足够时用它。[center-outward-expansion.md](center-outward-expansion.md) 把**真实的布局元素**移到最终的停靠槽位；粒子没有目的地，只有物理和消亡。

## 工作原理

整个事件就是**一个驱动 tween 加一个公式**：

1. **带种子的 setup** —— 在 composition setup 时一次性创建一个固定的池子，包含 `PARTICLE_COUNT` 个小 div（一个确定性的循环 —— setup 时生成没问题；逐帧创建 DOM 则不行）。每个粒子 `i` 的一切都从一个纯哈希推导出来：

   ```js
   // angle, speed, size, spin, color (palette[i % palette.length]) — all from prand(i * k)
   const prand = (n) => {
     const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
     return x - Math.floor(x); // 0..1, pure function of n
   };
   ```

2. **弹道公式** —— 一个代理 tween 在 `FLIGHT_DUR` 内把 `T: 0 → 1` 推进，使用 `ease: "none"`；`onUpdate` 把每个粒子的位置算成 **T 的纯函数**：

   ```
   x(T) = vx · T·FLIGHT_DUR
   y(T) = vy · T·FLIGHT_DUR + ½ · G · (T·FLIGHT_DUR)²
   rot(T) = spin · T·FLIGHT_DUR
   ```

   重力 `G` 免费提供了上升-减速-下落的弧线。因为位置是从 `T` 计算出来的（绝不是逐帧累加），seek 到任意时刻都会渲染出精确的飞行中途状态 —— 这正是 DOM 粒子能安全 seek 的原因。驱动器的 `ease: "none"` 是承重的：物理在公式里；给驱动器加缓动会扭曲重力，弧线就不再像被抛出的物体了。

3. **消亡** —— 在同一个公式里加一段不透明度尾巴（在飞行的最后 `FADE_FRAC` 内淡出），或者用彩纸的招牌做法：一个单独的**瞬间缩小** tween，在飞行结束时一眨眼把整个池子缩放到 0。无论哪种，粒子最终都不可见，并且保持不可见。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="burst-stage">
  <div class="particle-field" id="particle-field"></div>
  <div class="burst-hero" id="burst-hero">{heroWord}</div>
</div>
```

```css
/* .burst-stage: position: relative; display: grid; place-items: center.
   .burst-hero: z-index: 2 — particles fly BEHIND the word. */
.particle-field {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%; /* the launch origin — offset to taste (e.g. the word's baseline) */
  width: 0;
  height: 0;
}
.particle {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px; /* confetti chip; 50% for dots */
  opacity: 0; /* invisible until the event fires */
  will-change: transform, opacity;
}
```

```js
// Setup: deterministic pool, generated ONCE.
const field = document.getElementById("particle-field");
const palette = ["{accentA}", "{accentB}", "{accentC}"]; // 3-5 brand tokens
const parts = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const el = document.createElement("div");
  el.className = "particle";
  const size = SIZE_MIN + prand(i * 3 + 1) * (SIZE_MAX - SIZE_MIN);
  el.style.width = `${size}px`;
  el.style.height = `${size * 0.7}px`; // slightly oblong = confetti chip
  el.style.background = palette[i % palette.length];
  field.appendChild(el);
  // Index-seeded launch parameters — the particle's whole life, fixed here.
  const angle = -Math.PI / 2 + (prand(i * 5 + 2) * 2 - 1) * CONE; // upward cone
  const speed = SPEED_MIN + prand(i * 7 + 3) * (SPEED_MAX - SPEED_MIN);
  parts.push({
    el,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed, // negative = up
    spin: (prand(i * 11 + 4) * 2 - 1) * SPIN_MAX,
  });
}

// Confetti pop — one driver, pure ballistic formula.
const drive = { T: 0 };
tl.fromTo(
  drive,
  { T: 0 },
  {
    T: 1,
    duration: FLIGHT_DUR,
    ease: "none", // physics lives in the formula, not the ease
    onUpdate: () => {
      const t = drive.T * FLIGHT_DUR; // seconds of flight — pure function of T
      const fade = Math.min(1, (1 - drive.T) / FADE_FRAC); // opacity tail
      parts.forEach((p) => {
        const x = p.vx * t;
        const y = p.vy * t + 0.5 * G * t * t; // rise, stall, drift down
        p.el.style.transform = `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`;
        p.el.style.opacity = String(drive.T === 0 ? 0 : fade); // T===0 guard covers seeks before the event
      });
    },
  },
  BURST_AT,
);
```

## 变体

- **彩纸爆发，然后瞬间缩小** —— 俏皮的招牌效果：完整爆发、重力飘落，然后每片彩纸一眨眼缩放到 0：`FADE_FRAC` 接近 0，再加上 `tl.to(".particle", { scale: 0, duration: SHRINK_DUR, ease: "power2.in" }, BURST_AT + FLIGHT_DUR - SHRINK_DUR)`，`SHRINK_DUR` 取 0.15–0.25s。整个事件相对主体要保持很小 —— 一个以几十像素计的点缀，而不是一门铺满屏幕的礼炮。
- **落定词后方的圆点爆发** —— 用径向代替锥形：`angle = prand(i) * Math.PI * 2`，`G` 接近 0，短飞行（0.4–0.7s），圆点（`border-radius: 50%`），池子的 z-index 放在词的后面。在词落定的那一帧触发。
- **字形溶解** —— 把每个粒子的**原点**用种子散布在字形块的盒子范围内（`ox = (prand(i*13) - 0.5) * BLOCK_W`，`oy` 同理，加到 transform 里），配合低 `G` 的温和向外漂移；文字在飞行的前约 30% 内淡出，同时粒子从它的轮廓里淡入。每个粒子都用 `{textColor}` 着色，让粒子群看起来就是文字自身的材料。（真正的逐像素溶解属于 Canvas-2D 的领域 —— `techniques.md`；这个 DOM 版本在约 40 个粒子以内都能以假乱真。）
- **两段式爆发（迸发 + 掉队者）** —— 把池子拆开：70% 用主驱动器，30% 用约 0.12s 之后的第二个驱动器，速度更低；拆分由索引推导（`i % 10 < 3`）。同一个公式，两个时间窗。

## 取值

| token                 | 范围                                         | 说明                                                                            |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- | --- | ----------------------- |
| PARTICLE_COUNT        | 迸发/圆点 10–18；溶解 24–40                  | **上限约 40** —— 逐帧写 style；超过这个数，seek 性能和观感都会下降              |
| G                     | 彩纸 900–1600 px/s²；圆点/溶解 0–200         | 自然下落 vs 飘移                                                                |
| SPEED_MIN / SPEED_MAX | 250–700 px/s                                 | 每个粒子各自经 `prand` 取值，绝不统一                                           |
| CONE                  | 0.35–0.8 rad（约 20–45°）                    | 越宽越像飞溅，越窄越像喷泉                                                      |
| FLIGHT_DUR            | 0.7–1.4s                                     | 弧线应在飞行的约 35–45% 处达到顶点：检查 `                                      | vy  | / G ≈ 0.4 × FLIGHT_DUR` |
| SIZE_MIN / SIZE_MAX   | 彩纸片 5–14px；圆点 4–8px                    | 以 1080p 画面为准                                                               |
| SPIN_MAX              | 彩纸 180–720 deg/s；圆点 0                   | 翻滚                                                                            |
| FADE_FRAC             | 0.2–0.35                                     | 使用瞬间缩小时接近 0                                                            |
| BURST_AT              | 落在一个起因上                               | 词的落定、一次点击、一个组合标识完成 —— 没有起因的爆发就是噪点                  |

## 关键约束

- **位置是时间的纯函数，驱动器 ease 为 `"none"`** —— `x(T)`、`y(T)`、`rot(T)` 每帧从驱动值计算出来，绝不逐 tick 累加（`+=`）（渲染器一 seek，累加就坏了）；重力就是 ease —— 加了缓动的驱动器会把抛物线掰弯。
- **固定的池子，不逐帧操作 DOM** —— setup 之后所有粒子都已存在，并设 `opacity: 0`；事件只写 `transform` / `opacity`。**`PARTICLE_COUNT ≤ ~40`** —— 逐帧写 style 的开销线性增长；让这个事件保持轻量。
- **粒子开始和结束时都是 `opacity: 0`** —— `drive.T === 0` 守卫覆盖了 seek 到事件之前的情况；尾巴/缩小覆盖了之后的情况。驱动结束时还冻在半空中的彩纸片，在之后的每一帧都是一个 bug。
- **粒子是标点** —— 每拍一个事件，因一个起因而触发，相对主体很小，在下一拍之前就已消亡；z 顺序放在它所庆祝的词的后面或周围，绝不盖在词上面。持续存在的粒子系统是背景，那不是这条规则的范畴。

## 另见

`spring-pop-entrance`（彩纸在 hero 落定的那一帧触发）· `kinetic-beat-slam`（某一拍赢得彩纸的回报）· `press-release-spring`（单层辉光的替代方案，或两者组合）· `css-marker-patterns`（当强调应该有手绘批注感时用的线条爆发）· `scale-swap-transition`（字形溶解掩护退场）。
