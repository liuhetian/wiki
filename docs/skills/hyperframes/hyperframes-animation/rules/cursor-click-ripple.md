---
name: cursor-click-ripple
description: >
  动画鼠标光标移动到目标上，点击时带有缩放下压效果，并扩散出涟漪圆环。
metadata:
  tags: cursor, click, ripple, interaction, mouse, button
---

# 光标点击涟漪

一个动画光标移动到目标元素上，执行一次带视觉下压的点击，并从点击位置发出向外扩散的涟漪圆环。一条 timeline 上依次三个阶段：**移动**（带 easing 地平移到目标中心）→ **点击**（光标和目标一起缩放下压，再 yoyo 回来）→ **涟漪**（1–3 个错开的圆环从点击位置扩散并淡出）。这是一个*发生在某一位置的点事件* —— 跨越空间的持续按住见 [cursor-drag.md](cursor-drag.md)。

## 配方

```html
<button class="target-button">{ctaLabel}</button>
<div class="cursor"><!-- arrow SVG, positioned at the entry corner --></div>
<!-- Rings live in DOM from t=0 at the click-target CENTER, scale 0 + opacity 0 -->
<div class="ripple ripple-1"></div>
<div class="ripple ripple-2"></div>
<div class="ripple ripple-3"></div>
```

```css
.ripple {
  position: absolute;
  left: 50%;
  top: 50%; /* click-target center */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid {rippleColor};
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
}
```

```js
// Phase 1 — Move: eased, not linear
tl.to(".cursor", { x: TARGET_X, y: TARGET_Y, duration: MOVE_DUR, ease: MOVE_EASE }, 0);

// Phase 2 — Click: cursor + target depress together, then return
tl.to(
  ".cursor",
  { scale: CURSOR_PRESS_SCALE, duration: PRESS_DUR, ease: "power2.in", yoyo: true, repeat: 1 },
  CLICK_AT,
);
tl.to(
  ".target-button",
  { scale: TARGET_PRESS_SCALE, duration: PRESS_DUR, ease: "power2.in", yoyo: true, repeat: 1 },
  CLICK_AT,
);

// Phase 3 — Ripple burst, N rings staggered from the click point
tl.set([".ripple-1", ".ripple-2", ".ripple-3"], { opacity: 1 }, RIPPLE_AT);
tl.to(
  [".ripple-1", ".ripple-2", ".ripple-3"],
  {
    scale: RIPPLE_SCALE,
    opacity: 0,
    duration: RIPPLE_DUR,
    ease: RIPPLE_EASE,
    stagger: RIPPLE_STAGGER,
    immediateRender: false, // holds scale 0 / opacity 0 until the click moment
  },
  RIPPLE_AT,
);
```

## 变体

- **单个圆环** —— 只有一个 `.ripple`，不错开；场景其余部分很忙时更显优雅。
- **关键帧式起音-衰减** —— 用一个 `keyframes` 块让 opacity 在整个时长内从 0 → 峰值 → 0；「能量辐射后消散」的包络更清晰。
- **多环扩散脉冲** —— 当点击是场景的高潮时刻时，用 3 个圆环、0.08 s 的错开。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| MOVE_DUR | 0.4–1.0 s | 短 = 快速一冲；长读作「深思熟虑的点击」。必须在 CLICK_AT 之前结束，否则读起来像误点 |
| MOVE_EASE | 离散选择 | `power2.inOut` 平静 · `power3.out` 果断 · `back.out(1.2–1.4)` 落到按钮上时带一点回弹（再高就显得卡通） |
| CLICK_AT | `MOVE_DUR + 0–0.3 s` | 零停顿读起来像自动驾驶；>0.3 s 读起来像犹豫 |
| PRESS_DUR | 0.06–0.12 s（半程；yoyo ×2） | 短则干脆，长则发软；必须在下一阶段需要正常缩放之前结束 |
| CURSOR / TARGET_PRESS_SCALE | 0.80–0.90 / 0.92–0.97 | 光标压缩得比目标「更多」—— 光标是执行者，目标是接受者 |
| RIPPLE_AT | `CLICK_AT + 0–0.08 s` | 同时发生感觉是因果；稍有延迟感觉像声音 |
| RIPPLE_DUR | 0.5–1.0 s | 尖锐的一声「叮」vs 柔和的声呐；必须在任何需要圆环消失的事情之前完成 |
| RIPPLE_SCALE | 3–6 | 3 会停留在点击位置附近；如果圆环会在淡出之前跑出画面，就调低它 |
| RIPPLE_STAGGER | 0.06–0.12 s（或 0） | 低于约 0.06 s 读起来像一个粗环；高于约 0.12 s 读起来像几个独立事件 |
| RIPPLE_EASE | 离散选择 | `power2.out` 标准的「叮」· `power3.out` 起音更尖锐 · `expo.out` 强烈而遥远的脉冲 |
| TARGET_X / TARGET_Y | 由布局推导 | 必须与目标的视觉中心一致 —— 偏 4 px 读起来就是没点中按钮 |

参考取值：`../examples/cta-orbit-collapse.html` —— 用 `back.out(1.3)` 移动 0.5 s，+0.2 s 后点击，按压 0.08 s、缩放 0.85/0.95，单个圆环在 0.7 s 内用 `power2.out` 扩散到 5×。

## 关键约束

- **先移动，再点击** —— 只在移动 tween 落定之后才触发点击；在运动中途点击读起来像无意的。
- **圆环从 t=0 起就在 DOM 中**，位于点击目标的中心，`scale: 0` + `opacity: 0` —— 绝不按条件渲染；扩散动画上加 `immediateRender: false`，让它们在触发前保持不可见。
- **涟漪从点击位置发出** —— 即按钮的视觉中心，而不是某个元素包围盒的原点。
- **同步下压** —— 光标和目标在同一位置、以相同时长下压，并且都 yoyo 回来。
- **整个序列中光标都在所有内容之上**（高 z-index）；光标和涟漪上都设 `pointer-events: none`。

## 另见

`orbit-3d-entry`（点击作为让环绕物收拢的支点）· `center-outward-expansion`（点击触发向外爆发）· `press-release-spring`（让目标有更强的物理感）· `scale-swap-transition`（按钮点击后的状态变化）。
