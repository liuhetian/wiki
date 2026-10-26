---
name: discrete-text-sequence
description: >
  在时间阈值处整体替换文字状态，做出非线性的打字效果 —— 打错字、批量添加、停顿、退格、模拟思考。
metadata:
  tags: text, typing, discrete, threshold, non-linear, sequence
---

# 离散文字序列

不做逐字符的打字机效果，而是在时间阈值处整体替换字符串状态 —— 从而实现平滑逐字打字做不到的非线性效果（打错字、退格、批量粘贴、「思考」的空档）。如果你的效果只是「逐个字符输入，不做修改」，用本规则就是小题大做 —— 改用下面的平滑切片变体。

## 原理

打字过程被编写成一个由 `{ t, text }` 状态组成的稀疏数组；每次 `onUpdate` 都通过**反向查找**找到 `t` 已经过去的最新条目，并渲染它的文字。显示在状态之间跳变，中间没有动画 —— 真实感来自时间表的形状：快速的按键簇（间隔 0.06–0.20s）、在词语间断处停顿（0.3–0.6s）、一次打错、退格一路删回到分岔点，然后一次批量粘贴，在一个条目中替换掉许多字符。一个块状光标通过同一条 timeline 上确定性的 sin 方波闪烁。

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
  font-family: {monoFont}; /* monospace required — proportional jitters even in a fixed box */
  display: flex;
  align-items: baseline;
  font-size: TERMINAL_FONT_SIZE;
}
.text-wrap {
  display: inline-flex;
  align-items: baseline;
  min-width: TEXT_WRAP_MIN_WIDTH; /* ≥ widest state — stops right-edge jitter */
  white-space: nowrap;
}
.cursor {
  display: inline-block; /* inline ignores width */
  width: CURSOR_WIDTH;
}
```

```js
// Each entry shows from its t until the NEXT entry's t.
// Shape: keystrokes → typo → backspace to the fork → bulk paste → completion mark.
const SEQUENCE = [
  { t: 0.0, text: "" },
  { t: T_K1, text: "{p1}" }, // first keystrokes (~3-5 chars, 0.1-0.2s apart)
  { t: T_K2, text: "{p1 + ' ' + p2_typo}" }, // continuation containing a typo
  { t: T_BS, text: "{p1 + ' ' + p2_partial}" }, // backspace(s) — peel back to the fork
  { t: T_BULK, text: "{fullCorrectedText}" }, // bulk paste — many chars in one jump
  { t: T_DONE, text: "{fullCorrectedText + ' ✓'}" }, // completion marker
];

// Reverse-search for the latest entry whose t has passed
function textAt(time) {
  for (let i = SEQUENCE.length - 1; i >= 0; i--) {
    if (time >= SEQUENCE[i].t) return SEQUENCE[i].text;
  }
  return "";
}

const textEl = document.getElementById("text");
const cursorEl = document.getElementById("cursor");

const driver = { t: 0 };
tl.to(
  driver,
  {
    t: TOTAL_DURATION,
    duration: TOTAL_DURATION,
    ease: "none",
    onUpdate: () => {
      textEl.textContent = textAt(driver.t);
    },
  },
  0,
);

// Cursor blink — deterministic sin square wave, never a CSS animation
const blink = { p: 0 };
tl.to(
  blink,
  {
    p: Math.PI * 2 * BLINK_CYCLES,
    duration: TOTAL_DURATION,
    ease: "none",
    onUpdate: () => {
      cursorEl.style.opacity = Math.sin(blink.p) > 0 ? "1" : "0";
    },
  },
  0,
);
```

## 变体

- **平滑字符切片**（连续的打字机效果 —— 没有停顿，没有修改）：编写起来更快，但整齐划一地像「机器打出来的」，缺少人的真实感：

```js
const fullText = "{fullPhrase}";
const len = { v: 0 };
tl.to(
  len,
  {
    v: fullText.length,
    duration: TYPE_DUR,
    ease: "power1.inOut",
    onUpdate: () => {
      textEl.textContent = fullText.substring(0, Math.floor(len.v));
    },
  },
  0,
);
```

- **思考停顿** —— 只需在下一个条目的 `t` 之前留出空档，就能让一个状态保持 `THINK_HOLD_DUR`（0.8–2.0s；低于 0.5s 读起来像卡顿，而不是思考）。
- **完成时的状态脉冲** —— 最终状态落定时，执行 `tl.to(".text", { scale: 1.03–1.08, duration: 0.15–0.3, yoyo: true, repeat: 1 }, T_DONE)`。
- **按状态变色** —— 在 `onUpdate` 中按 `driver.t` 与各个里程碑的关系分支：`T_DONE` 之后用成功色，修改中途变暗，输入时用正常色。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| TERMINAL_FONT_SIZE | 48–96px | 用于满版的 composition；终端风格的细节展示用更小的字号 |
| TEXT_WRAP_MIN_WIDTH | ≥ 最宽的状态 | 拿不准时，在 `document.fonts.ready` 之后用一个隐藏的探测节点测量 |
| 各里程碑的 `t` | 按键间隔 0.06–0.20s；停顿 0.3–0.6s | 单调递增；`T_DONE ≤ TOTAL_DURATION − ~1s`，留出高潮停留 |
| TYPE_DUR（平滑） | `chars × 0.06–0.12s` | 从快速 → 从容 |
| BLINK_CYCLES | 每 0.5–0.8s 一个周期 | `TOTAL_DURATION / 0.8 ≤ BLINK_CYCLES ≤ TOTAL_DURATION / 0.5` |
| CURSOR_WIDTH | 约 0.3× 字号 | 与文字的间距控制在个位数 px，让光标感觉是贴着文字的 |

## 关键约束

- **每帧反向查找数组** —— n 很小（通常 ≤30）时是 O(n)；不要按帧建索引，序列是稀疏的。
- **文字包裹层上的 `min-width` 是必需的** —— 没有它，状态长度变化时右边缘会抖动。
- **离散跳变必须是「瞬间」的** —— 文字上的任何过渡都会把跳变变成一片模糊，毁掉「打字」的感觉。
- **光标闪烁由 timeline 上的 sin / 序列驱动**，`display: inline-block`、等宽字体、`white-space: nowrap`（状态中途折行会打破错觉；结尾空格必须保留）。
- **离散 vs 平滑** —— 只在非线性状态（打错字、停顿、批量粘贴）时用离散；普通打字用平滑切片变体。

## 另见

`context-sensitive-cursor`（同样的 SEQUENCE 模式 + 按片段着色的光标）· `3d-text-depth-layers`（带分层纵深的离散文字）· `counting-dynamic-scale`（平滑计数器旁边的离散标签）· `press-release-spring`（完成之后按压的那一拍）。
