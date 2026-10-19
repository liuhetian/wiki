---
name: hacker-flip-3d
description: >
  字符级 3D 翻转，配合随机字形替换，做出「解密」式的揭示效果。
metadata:
  tags: text, 3d, reveal, decode, hacker, randomization, perspective
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/hacker-flip-3d.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Hacker Flip 3D 揭示

字符在 3D 空间里从 90° 向下翻转，同时轮换显示伪随机字形，最后落定到目标字符上 —— 一种「解密」/ 机场翻牌显示屏式的揭示。最终揭示的是一个简短的目标词（通常是品牌名或标签）。

## 工作原理

每个字符都有自己的逐字符 tween，从 `rotateX: 90deg`（隐藏，铰接在底边）转到 `0deg`（直立），在整个词上错开（stagger）。进度低于 `REVEAL_THRESHOLD` 时，字符显示一个带种子的伪随机字形，每隔几帧重新洗一次；越过阈值后，真正的目标字符咔嗒一声就位 —— 于是眼睛恰好在翻转落定时看清正确的字母。一份隐藏的整词幽灵副本预先占住布局宽度，这样窄的闪烁字形绝不会让这一行发生位移。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="hacker-text-wrap" id="hacker-text" data-target="{phrase}">
  <!-- ghost row + per-char spans injected by the setup script -->
</div>
```

```css
/* the scene root (or nearest 3D ancestor) MUST set perspective: 1500px */
.hacker-text-wrap {
  font-family: {monoFont}; /* monospace so flicker glyphs hold width */
  font-weight: 900;
  font-size: HACKER_FONT_SIZE;
  position: relative; /* ghost stacks absolutely behind the live row */
}
.hacker-char {
  display: inline-block;
  transform-origin: bottom; /* flap-display hinge */
  transform-style: preserve-3d;
}
.hacker-ghost {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  inset: 0 auto auto 0;
}
```

```js
const wrap = document.getElementById("hacker-text");
const targetWord = wrap.dataset.target;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

// Ghost row (reserves width) + live per-char spans
const ghost = document.createElement("div");
ghost.className = "hacker-ghost";
ghost.textContent = targetWord;
wrap.appendChild(ghost);
const charEls = [...targetWord].map((ch) => {
  const span = document.createElement("span");
  span.className = "hacker-char";
  span.textContent = ch === " " ? " " : ch;
  span.dataset.target = ch;
  wrap.appendChild(span);
  return span;
});

// Index-seeded hash — same frame always yields the same glyph
function pseudoGlyph(seed) {
  const h = ((seed * 9301 + 49297) % 233280) / 233280;
  return GLYPHS[Math.floor(h * GLYPHS.length)];
}

charEls.forEach((el, i) => {
  const state = { p: 0 };
  tl.to(
    state,
    {
      p: 1,
      duration: FLIP_DURATION,
      ease: "power3.out",
      onUpdate: () => {
        if (state.p < REVEAL_THRESHOLD) {
          el.textContent = pseudoGlyph(i * 1000 + Math.floor(state.p * 100));
        } else {
          el.textContent = el.dataset.target === " " ? " " : el.dataset.target;
        }
        el.style.transform = `rotateX(${90 - state.p * 90}deg)`;
        el.style.opacity = Math.min(1, state.p * 2);
      },
    },
    i * CHAR_STAGGER,
  );
});
```

## 变体

- **自上而下的铰链** —— 用 `transform-origin: top` 做出翻牌下落的样子。
- **中心旋转** —— `transform-origin: center` 看起来像桶形翻滚，而不是翻牌。
- **纯数字字形池** —— 把 `GLYPHS` 限制为数字，用于价格 / 倒计时的解码效果。
- **两轮解码** —— 串联两个 `FLIP_DURATION` tween，使用不同的字形池（符号 → 字母 → 真实字符），做出更长的揭示。

## 取值

| token            | 范围                            | 说明                                                                               |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| HACKER_FONT_SIZE | viewport 短边的 6–10%           | 翻转本身就是焦点那一拍；幽灵副本必须使用完全相同的字号                             |
| FLIP_DURATION    | 0.4–1.0s                        | 低于 0.4s 闪烁阶段没有时间展开；超过 1.0s 就拖沓                                   |
| CHAR_STAGGER     | 0.03–0.08s                      | 解码总时长 = `CHAR_STAGGER × (chars − 1) + FLIP_DURATION` —— 要放进该阶段的时间预算 |
| REVEAL_THRESHOLD | 0.5–0.7                         | 偏低会揭示得太早（没有张力）；偏高看起来像生硬的最后一刻揭示                       |
| FLICKER_RATE     | 每 3–6 帧换一次字形             | <3 看起来像噪点；>6 看起来像一个个敲出来的字                                       |

参考：`../examples/proof-logo-chain.html`（163px、0.55s、0.033s、0.6）。

## 关键约束

- **场景根节点上必须设置 `perspective`** —— 父级没有 perspective 时，`rotateX` 渲染出来是 2D 压扁，而不是 3D 翻转；每个字符上都要设 `transform-style: preserve-3d`。
- **幽灵占位副本**必须以完全相同的内容和字体垫在实时字符后面 —— 没有它，窄字形会在闪烁中途让布局发生位移（首选等宽字体；有了幽灵副本，比例字体也能挽救回来）。
- **闪烁种子 = 字符索引 + 量化后的进度** —— 同一帧必须显示同一个字形。
- **闪烁频率 ≥ 约每 3 帧换一次**；`onUpdate` 的工作量保持在每字符每帧 O(1)。
- **翻转放在正中央，并且不加任何装饰性元素**（时间戳线条、「// AUTH」标签、状态圆点）—— 翻转就是这一拍。确有必要的次级标签要用大字号排版（56–72px 大写 + 字距），放在同一个堆叠里，绝不要做成角落里的小注释。

## 另见

`card-morph-anchor`（翻转揭示一个短语，卡片 morph 进入下一个镜头）· `counting-dynamic-scale`（对应的数字版本）。
