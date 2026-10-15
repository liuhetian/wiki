---
name: camera-cursor-tracking
description: >
  两阶段的虚拟摄像机，把 viewport 锁定在一个移动的焦点上，初始定位可配置。
metadata:
  tags: camera, tracking, viewport, two-phase, spring
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/camera-cursor-tracking.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 两阶段摄像机光标跟踪

通过在两种摄像机模式之间切换，让一个横向增长的元素（正在输入文字的搜索栏、动画逐渐显示的长 URL）始终保持可见。

## 原理

把 **World Space**（世界空间：包含全部内容的完整目标元素）和 **Screen Space**（屏幕空间：viewport）分开。分两个阶段：

- **Phase 1（静态）** —— 世界容器停在一个固定的初始偏移处；摄像机不动。在跟踪开始之前先把观众的视线锚定住。
- **Phase 2（跟踪）** —— 当焦点（光标、高亮、最后输入的字形）越过目标屏幕位置（从左边起 `CURSOR_TARGET_FRACTION × viewportWidth`）时激活。世界向左平移（`x: -delta`），让焦点钉在这个屏幕位置上。

偏移的计算在阶段边界上是**数学连续的** —— 跟踪开始的那一刻，世界的位置恰好等于静态阶段时的位置，所以过渡是无缝的。分段形式：

```
finalWorldX = Math.min(INITIAL_OFFSET, trackingOffset)
```

`INITIAL_OFFSET` 是静态阶段的值；`trackingOffset` 是让焦点保持在目标屏幕 X 上所需的位移。焦点还没增长到越过目标时，`trackingOffset` 是一个负得更少的数，`Math.min` 返回静态值；一旦焦点即将越过目标，`trackingOffset` 就会反超，由跟踪接管。不要把它换成硬性的 `if (typingProgress > threshold)` 分支 —— 摄像机会明显跳一下。

## 配方

```html
<div class="viewport">
  <div class="world">
    <div class="search-bar">
      <span class="text" id="reveal-text">{phrase}</span><span class="cursor">|</span>
    </div>
  </div>
</div>
```

```css
.viewport {
  position: absolute;
  inset: 0;
  overflow: hidden; /* clip the world's left edge as it pans off-screen */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: VIEWPORT_PAD_LEFT; /* Phase-1 anchor X — must match the JS constant */
}
.world {
  display: flex;
  align-items: center;
  white-space: nowrap; /* text must stay on one line for the camera math */
}
.search-bar .text {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}
.search-bar .cursor {
  display: inline-block; /* inline sibling of the text, NOT absolutely positioned —
     absolute positioning misaligns with the camera math */
  width: CURSOR_WIDTH;
  margin-left: CURSOR_GAP;
  background: {accentColor};
  height: CURSOR_HEIGHT_EM;
  vertical-align: bottom;
  /* no CSS blink animation — CSS clocks don't sync to seek; blink is a GSAP tween below */
}
```

```js
// Pre-measure the target text width to compute tracking distance.
// Measure SYNCHRONOUSLY — no fonts.ready gate (see Critical Constraints).
const textEl = document.getElementById("reveal-text");
const targetCursorScreenX = CURSOR_TARGET_FRACTION * VIEWPORT_WIDTH;
const fullWidth = textEl.scrollWidth; // total text width after full reveal
const trackingDelta = Math.max(0, VIEWPORT_PAD_LEFT + fullWidth - targetCursorScreenX);

// Phase 1 — text reveals progressively; camera holds. maxWidth tween
// (width/left/top tweens are forbidden); ease "none" = linear typing rate.
tl.fromTo(
  ".search-bar .text",
  { maxWidth: 0 },
  { maxWidth: fullWidth, duration: REVEAL_DUR, ease: "none" },
  REVEAL_START,
);

// Phase 2 — camera tracks. Start BEFORE full reveal so the handoff feels
// continuous (Math.min form above makes it mathematically continuous).
tl.to(".world", { x: -trackingDelta, duration: TRACK_DUR, ease: "power2.inOut" }, TRACK_START);

// Cursor blink — finite GSAP yoyo (never CSS @keyframes; CSS animation clocks
// aren't synced to HF's seek and flicker non-deterministically).
const blinkRepeats = Math.ceil(SCENE_DURATION / BLINK_HALF_PERIOD) - 1;
tl.to(
  ".search-bar .cursor",
  { opacity: 0, duration: BLINK_HALF_PERIOD, ease: "steps(1)", yoyo: true, repeat: blinkRepeats },
  0,
);
```

## 变体

- **居中 → 居中跟踪**：`.viewport { justify-content: center; padding: 0; }`，`CURSOR_TARGET_FRACTION = 0.5` —— 焦点越过中线后开始跟踪。
- **左对齐 → 靠右跟踪**：即上面写的形式；最适合内容一开始就超出 viewport 宽度的情况。
- **连续打字驱动**：把 `maxWidth` tween 换成一个 `onUpdate` 打字时钟（`charsTyped = Math.floor(progress)`），再加上逐帧的 `measureNodeWidth` 来驱动光标的屏幕 X —— 当输入的文字在场景里还被别处使用时（例如被父级条带的摄像机偏移使用），必须这样做。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| VIEWPORT_PAD_LEFT | 0 → viewport 宽度的约 10% | 必须与 CSS 的 `padding-left` 一致，否则摄像机计算会漂移 |
| VIEWPORT_WIDTH | = 根元素的 `data-width` | 绝不 tween |
| CURSOR_TARGET_FRACTION | 0.5–0.75 | 越低，画面中显示的已输入文字越少；越高，跟踪开始得越晚 |
| CURSOR_WIDTH / GAP | 4–10 px / 几 px | 间距 ≤ 光标宽度，否则光标在视觉上会脱离文字 |
| CURSOR_HEIGHT_EM | 0.85–1.0 em | 与输入字形的高度一致 |
| REVEAL_DUR | 字符数 × 0.05–0.15s | ease 用 `"none"` —— 任何 easing 都会扭曲逐键敲击的节奏 |
| TRACK_START | < REVEAL_START + REVEAL_DUR | 与文字显示重叠，让交接感觉连续 |
| TRACK_DUR | 0.8–2.0s | `power2.inOut`/`power3.inOut`；`back.out` 读起来像 UI 弹跳，而不是摄像机 |
| BLINK_HALF_PERIOD | 0.2–0.4s | `steps(1)` 硬开 / 硬关；repeat 次数由 SCENE_DURATION（= `data-duration`）推算 |

## 关键约束

- **同步构建 timeline —— 不要用 `fonts.ready` 闸门。** HF 在并行的 worker 中渲染帧，每个 worker 都是一个全新的浏览器。用 `document.fonts.ready.then(...)` 包一层，意味着有些 worker 会在 Promise resolve「之前」seek 帧，结果找不到 timeline → 这些帧按 CSS 初始状态渲染（`max-width: 0` ⇒ 文字为空），而其他帧渲染正确 → 出现可见的闪烁。在脚本解析时就注册 timeline：摄像机计算能容忍用回退字体测量带来的百分之几的宽度误差；worker 竞争造成的闪烁则不可接受。如果确实需要在字体加载后精确测量，就在 tween 的 `onUpdate` 里重新测量（仍然是逐帧确定性的），或者在 @font-face 上设置 `font-display: block`。
- **用 `getBoundingClientRect()` / `scrollWidth` / 探测节点来测量**，绝不用字符数 × 字号 —— 比例字体的字形宽度各不相同。
- **阶段边界上的计算必须连续** —— 用 `Math.min(INITIAL_OFFSET, trackingOffset)` 的形式，绝不用硬阈值分支。
- **world 上设 `white-space: nowrap`**，并预先分配宽度（把 `maxWidth` tween 到完整的目标宽度）—— 防止 tween 中途发生布局偏移。
- **光标是文字的内联兄弟元素**，通过有限次的 GSAP yoyo 闪烁 —— 绝不用 CSS `@keyframes … infinite`。
- **`.viewport` 上设 `overflow: hidden`** —— 在世界平移时把它裁掉。

## 另见

[context-sensitive-cursor.md](context-sensitive-cursor.md)（按文字片段切换光标颜色）· [discrete-text-sequence.md](discrete-text-sequence.md)（在这个摄像机下做非线性的文字显示）。
