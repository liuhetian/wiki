---
name: asr-keyword-glow
description: >
  关键词在被「说出」时发光并放大 —— 按逐词时间戳同步的 attack/sustain/release 包络。即使没有真实音频，硬编码的时间点也能做出「旁白强调」的效果。
metadata:
  tags: asr, audio-sync, highlight, glow, keyword, text, speech, emphasis
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/asr-keyword-glow.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# ASR 关键词发光

短语中的词在被「说出」时在视觉上激活（发光模糊 + 缩放），按 attack-sustain-release 包络作用在逐词的 `{ start, end }` 时间戳上。在真实的 ASR 管线里，时间点来自词级转写（`hyperframes transcribe` —— 结构相同）；做宣传视频时，手工编写这些时间点来控制强调的节奏。包络在一个词之后绝不会降到零 —— 它衰减到一个静息水平，留下一串最近强调过的痕迹。

## 原理

一个线性的驱动 tween（`ease: "none"` —— 任何其他 ease 都会扭曲逐词包络；不要改）扫过场景时间；它的 `onUpdate` 遍历「所有」词，计算每个词的包络：`start` 之前为 0，在 `ATTACK_DUR` 内线性起音到 1，保持在 1 直到 `end`，在 `RELEASE` 内衰减到 `REST_LEVEL`，然后停在静息水平。包络驱动 `text-shadow` 的模糊和 `scale` —— 整个短语只用一个驱动，绝不每个词一个 tween（60 多个词会让 timeline 膨胀）。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="phrase">
  <span class="word" data-word="{w1Key}">{w1}</span>
  <span class="word" data-word="{w2Key}">{w2}</span>
  <!-- … the final word may be the brand, with the .brand modifier -->
  <span class="word brand" data-word="{brandKey}">{brandWord}</span>
</div>
```

```css
.phrase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  color: {restColor};
}
.word {
  display: inline-block; /* required for transform on <span> */
  transform-origin: 50% 50%;
  text-shadow: 0 0 0 {glowColorTransparent};
}
.word.brand {
  color: {brandAccentColor};
}
```

```js
// Per-word spoken windows — one entry per span; brand word 1.5-2× a normal word's window.
const TIMINGS = {
  // {w1Key}: { start: …, end: … },  — seconds, local to the scene
};

function envelope(time, start, end) {
  if (time < start) return 0;
  if (time < end) return Math.min((time - start) / ATTACK_DUR, 1);
  const releaseEnd = end + RELEASE;
  if (time < releaseEnd) return 1 - ((time - end) / RELEASE) * (1 - REST_LEVEL);
  return REST_LEVEL;
}

const words = document.querySelectorAll(".word");
const driver = { t: 0 };
tl.to(
  driver,
  {
    t: SCENE_DURATION,
    duration: SCENE_DURATION,
    ease: "none", // linear — t maps 1:1 to scene time
    onUpdate: () => {
      words.forEach((el) => {
        const timing = TIMINGS[el.dataset.word];
        if (!timing) return;
        const env = envelope(driver.t, timing.start, timing.end);
        el.style.textShadow = `0 0 ${MAX_BLUR * env}px ${glowColorRgba(env)}`;
        el.style.transform = `scale(${1 + MAX_SCALE_BOOST * env})`;
      });
    },
  },
  0,
);
```

`glowColorRgba(env)` 返回发光颜色，其 alpha 由 `env` 调制。

## 变体

- **卡拉 OK 风格（旁白视频推荐使用）** —— 默认的幅度在视频里显得太含蓄：未激活的词仍然占据主导。把未激活的词渲染得「暗」，让激活的词插值到更亮 + 更大；任何时刻都只有 1–2 个词是亮的（正在说的 + 刚说完仍停留的静息词），其余都是暗的。用于需要一次一个词「蹦出来」的短语（5–10 个词）；长而密的文本保留含蓄的默认风格。调高 MAX_BLUR、MAX_SCALE_BOOST 和 REST↔ACTIVE 的对比度；其余完全相同：

```js
function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function colorAt(env, isBrand) {
  const target = isBrand ? BRAND_RGB : ACTIVE_RGB;
  return `rgb(${lerpChannel(REST_RGB.r, target.r, env)}, ${lerpChannel(REST_RGB.g, target.g, env)}, ${lerpChannel(REST_RGB.b, target.b, env)})`;
}
// in onUpdate: el.style.color = colorAt(env, el.classList.contains("brand"));
```

- **多倍频发光** —— 把 sustain 乘以 `1 + sin(driver.t × PULSE_HZ) × PULSE_AMPLITUDE`，让高强调的词在峰值处呼吸。
- **峰值处变色** —— 随 `env` 升高，同样按通道从 `restColor` 插值到 `peakColor`（非卡拉 OK 形式）。
- **3D 弹出** —— 加上 `translateZ(env × MAX_POP_Z)`，让正在说的词向镜头倾近；需要在父元素上设 `perspective`。
- **来自真实 ASR 转写** —— 把 `{ word, start_ms, end_ms }` 条目换算成秒，然后以完全相同的方式输入。

## 取值

| token | 默认风格 | 卡拉 OK 风格 | 说明 |
| --- | --- | --- | --- |
| ATTACK_DUR | 0.1–0.25s | 同左 | 必须小于最短那个词的时间窗，否则永远到不了 1 |
| RELEASE | 0.2–0.5s | 同左 | 衰减到静息水平 |
| REST_LEVEL | 0.15–0.4 | 0.05–0.2 | > 0（留痕迹），< 1 |
| MAX_BLUR | 15–25px | 30–45px | 越大越像「喊出来」 |
| MAX_SCALE_BOOST | 0.03–0.10 | 0.15–0.25 | 峰值处的增量（0.08 ⇒ scale 1.08） |
| PULSE_HZ / AMP | 4–10 rad/s / 0.1–0.3 | — | 多倍频变体 |
| MAX_POP_Z | 20–60px | — | 3D 变体 |
| SCENE_DURATION | = `data-duration` | 同左 | 驱动必须与场景的 seek 窗口同步结束 |

## 关键约束

- **时间点单调递增、互不重叠** —— 每个条目的 `end` 都要小于下一个条目的 `start`；时间窗重叠会让包络含糊不清。
- **品牌词的时间窗是普通词的 1.5–2 倍** —— 品牌就是标题；让它多保持一会儿。
- **驱动的 ease 保持 `"none"`** —— 任何其他 ease 都会扭曲每个词的包络时间。
- **用 `text-shadow`，不用 `box-shadow`** —— 发光必须紧贴「字形」（说话时的强调），而不是 inline-block 的矩形。
- **一个驱动遍历所有词** —— 绝不每个词一个 tween。
- **选定一种风格** —— 取介于默认列和卡拉 OK 列之间的值，会得到尴尬的「半大声」强调。
- **最后一个词的强调之后，高潮停留 ≥1s** —— 最后一个词「就是」标题那一拍。

## 另见

`3d-text-depth-layers`（峰值时给激活的词加纵深）· `sine-wave-loop`（强调时刻之间的待机呼吸）· `context-sensitive-cursor`（与 ASR 节奏匹配的打字机效果）· `/media-use`，用于 `hyperframes transcribe` 和字幕渲染。
