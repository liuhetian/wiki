---
name: context-sensitive-cursor
description: >
  光标的颜色和样式随当前正在输入的文字片段而变化 —— 在高亮处用强调色，在占位符处变暗，诸如此类。
metadata:
  tags: cursor, color, context, typewriter, styling, segment
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/context-sensitive-cursor.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 上下文感知光标

在打字机序列中，光标的颜色（以及可选的高度 / 闪烁行为）与**当前活动的文字片段**相匹配 —— 输入品牌名时用品牌强调色，在占位符上变暗，在完成标记上用成功色。因为光标随关键词一起变化，视线就会落到正在输入的那个关键词上；相比之下，固定单色的光标就是视觉噪声。它叠加在 [discrete-text-sequence](discrete-text-sequence.md) 的 SEQUENCE 模式之上。

## 原理

文字被编写成一个由 `{ t, text, segment, color }` 条目组成的 SEQUENCE；一个线性驱动的 `onUpdate` 反向查找当前条目，同时写入可见文字和光标的 `background`（光标是一个色块，所以用 `background`，「不是」`color`）。第二个线性 tween 让相位 `p` 扫过 `2π × BLINK_CYCLES_PER_SCENE`，并按 `sin(p) > 0` 控制光标的 opacity —— 这就是 timeline 上一个确定性的方波闪烁。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="terminal">
  <div class="prompt">$</div>
  <div class="text-wrap">
    <span class="text" id="text"></span><span class="cursor" id="cursor">_</span>
  </div>
</div>
```

```css
.terminal {
  font-family: {monoFont}; /* proportional fonts drift the cursor mid-segment */
  display: flex;
  align-items: baseline;
  white-space: pre; /* preserve trailing spaces — cursor sits at segment end */
}
.text {
  white-space: pre;
}
.cursor {
  display: inline-block; /* inline ignores width/height */
  width: {cursorWidth}px;
  height: {cursorHeight}px;
  background: {textColor}; /* default — overridden per segment in onUpdate */
  vertical-align: {cursorBaselineFix}px; /* small negative — anchor to baseline, not line-height */
}
```

```js
// Adjacent entries usually share a text prefix but may differ in `segment` —
// that's what shifts the cursor color mid-line.
const SEQUENCE = [
  { t: 0, text: "", segment: "main", color: "{mainColor}" },
  { t: T_LEADIN_END, text: "{leadInChunk}", segment: "main", color: "{mainColor}" },
  { t: T_BRAND_IN, text: "{leadInBrandPrefix}", segment: "brand", color: "{brandColor}" },
  { t: T_BRAND_OUT, text: "{leadInBrandFull}", segment: "main", color: "{mainColor}" },
  { t: T_CMD_IN, text: "{leadInCmdPrefix}", segment: "cmd", color: "{cmdColor}" },
  { t: T_SUCCESS, text: "{leadInDone}", segment: "success", color: "{successColor}" },
];

function entryAt(time) {
  for (let i = SEQUENCE.length - 1; i >= 0; i--) {
    if (time >= SEQUENCE[i].t) return SEQUENCE[i];
  }
  return SEQUENCE[0];
}

const textEl = document.getElementById("text");
const cursorEl = document.getElementById("cursor");

const driver = { t: 0 };
tl.to(
  driver,
  {
    t: DURATION,
    duration: DURATION,
    ease: "none",
    onUpdate: () => {
      const entry = entryAt(driver.t);
      textEl.textContent = entry.text;
      cursorEl.style.background = entry.color;
    },
  },
  0,
);

// Deterministic square-wave blink
const blink = { p: 0 };
tl.to(
  blink,
  {
    p: Math.PI * 2 * BLINK_CYCLES_PER_SCENE,
    duration: DURATION,
    ease: "none",
    onUpdate: () => {
      cursorEl.style.opacity = Math.sin(blink.p) > 0 ? "1" : "0";
    },
  },
  0,
);
```

## 变体

- **正在输入时不闪烁** —— 字母不断出现时抑制闪烁（光标常亮），空闲时恢复。这「必须」是驱动时间的纯函数：在 `onUpdate` 里跟踪一个可变的 `lastChangeTime` 对反向 seek 是不安全的（往回拖动时会遗留正向播放时的旧值，光标会在错误的帧上闪烁 —— 或者常亮）。改为从 SEQUENCE 中预先算出变化时刻 —— 每一个 `text` 与前一个条目不同的条目都是一次输入事件：

```js
// Baked once at build time — no runtime state.
const CHANGE_TIMES = SEQUENCE.filter((e, i) => i > 0 && e.text !== SEQUENCE[i - 1].text).map(
  (e) => e.t,
);
// In onUpdate — identical result at any seek, either direction:
const isTyping = CHANGE_TIMES.some((t) => t <= driver.t && driver.t - t < TYPING_GRACE);
cursorEl.style.opacity = isTyping ? "1" : Math.sin(blink.p) > 0 ? "1" : "0";
```

- **按片段改变光标「高度」** —— 品牌片段上的光标更大：`cursorEl.style.height = entry.segment === "brand" ? cursorHeightEmphasis : cursorHeight`（1.1–1.25 倍；再大就读作故障了）。
- **反转对比** —— 浅底深字的片段也需要一个深色光标；让 `entry.color` 保持为唯一的事实来源，从它读取。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| DURATION | 每行输入 4–8s | `≥ SEQUENCE[last].t + closing dwell` |
| 条目 `t` 间隔 | 0.2–0.5s 的微小增量 | 递增且不均匀 —— 在高亮处放慢 |
| 片段色板 | 最多 3–4 种颜色 | 再多就显得随机；品牌色和成功色应在饱和度 / 亮度上有区别 |
| cursorWidth / Height | 8–24px / 0.85–1.0× fontSize | 太细会在渲染压缩中消失；太高会盖过文字 |
| cursorBaselineFix | 小的负 px 值 | 把色块下移到文字基线上 |
| BLINK_CYCLES_PER_SCENE | 周期 ≈ 0.6–1.2s | **必须是整数** —— 否则 sin 扫描会在周期中途结束，光标会在最后一帧突然跳出 |
| TYPING_GRACE | 0.15–0.3s | **< 相邻条目之间最短的停留时间** —— 否则光标永远不会闪烁 |

## 关键约束

- **光标颜色写在 `background` 上** —— 它是一个色块，不是字形。
- **闪烁是 timeline 驱动的 sin，不依赖任何可变的跟踪变量** —— 「正在输入时不闪烁」那个变体展示了 seek 安全的写法。
- **文字和容器上都设 `white-space: pre`** —— 结尾空格被折叠后，光标会停在错误的列上。
- **等宽字体 + `display: inline-block` 的光标** —— 比例字体会让光标在片段中途漂移；inline 会忽略色块的几何尺寸。
- 对于固定的 DURATION，**BLINK_CYCLES_PER_SCENE 必须是整数**。

## 另见

`discrete-text-sequence`（底层的 SEQUENCE 模式）· `camera-cursor-tracking`（摄像机跟随光标）· `press-release-spring`（输入完成后的确认按压）。
