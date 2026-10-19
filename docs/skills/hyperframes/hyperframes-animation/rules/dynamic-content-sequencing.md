---
name: dynamic-content-sequencing
description: >
  根据内容长度 + 每项的时长配置，自动计算 timeline 上的开始 / 结束时间 —— 内容越长，获得的屏幕时间越多，无需硬编码数字。
metadata:
  tags: timeline, sequencing, dynamic, duration, content-aware, utility
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/dynamic-content-sequencing.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 动态内容排程

一个工具性的模式（本身不是运动规则），用于展示一「串」条目（卡片、短语、数据）的场景：每个条目的时长由它的内容长度 + 每项配置计算得出，排程器自动分配绝对的开始 / 结束时间 —— 不需要为每个条目硬编码偏移。区别于 [discrete-text-sequence](discrete-text-sequence.md)（一个文字元素改变状态）—— 本规则是在彼此独立的内容块之间切换。

## 原理

一个由 `{ eyebrow, title, body, speedFactor, hold }` 条目组成的内容数组，在构建时一次性归约成一个扁平的 `TIMELINE`，元素为 `{ …entry, start, end }` —— 每个条目的时长是 `BASE_DURATION + body.length × SEC_PER_CHAR + hold`，所以文字越长，获得的阅读时间越多。一个线性驱动的 `onUpdate` 反向查找当前激活的条目，并且**只在切换时**才替换 DOM（一个 `lastTitle` 守卫 —— 逐帧写 `textContent` 在渲染中会闪烁）；可选的进度条在整个过程中从 0 填充到 100%。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="display">
  <div class="eyebrow" id="eyebrow"></div>
  <div class="title" id="title"></div>
  <div class="body" id="body"></div>
  <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
</div>
```

```css
.body {
  min-height: 160px; /* reserve space — content height varies; without this, layout jumps */
}
.progress-fill {
  height: 100%;
  width: 0%;
}
```

```js
// N entries, each with its own pacing (optionally a speedFactor multiplier);
// the final entry uses a larger hold (closing beat).
const CONTENT = [
  { eyebrow: "{eyebrow1}", title: "{title1}", body: "{body1}", hold: HOLD_MID },
  // …
  { eyebrow: "{eyebrowN}", title: "{titleN}", body: "{bodyN}", hold: HOLD_FINAL },
];

// Pre-compute absolute start/end ONCE — never in onUpdate.
let cumulative = 0;
const TIMELINE = CONTENT.map((entry) => {
  const dur = BASE_DURATION + entry.body.length * SEC_PER_CHAR + entry.hold;
  const start = cumulative;
  cumulative += dur;
  return { ...entry, start, end: cumulative };
});

function entryAt(time) {
  for (let i = TIMELINE.length - 1; i >= 0; i--) {
    if (time >= TIMELINE[i].start) return TIMELINE[i];
  }
  return TIMELINE[0];
}

const eyebrowEl = document.getElementById("eyebrow");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const progressEl = document.getElementById("progress-fill");

const TOTAL_DURATION = cumulative + TAIL_PAD;
const driver = { t: 0 };
let lastTitle = "";

tl.to(
  driver,
  {
    t: TOTAL_DURATION,
    duration: TOTAL_DURATION,
    ease: "none",
    onUpdate: () => {
      const entry = entryAt(driver.t);
      // Swap content only on transitions — no per-frame DOM thrash
      if (entry.title !== lastTitle) {
        eyebrowEl.textContent = entry.eyebrow;
        titleEl.textContent = entry.title;
        bodyEl.textContent = entry.body;
        lastTitle = entry.title;
      }
      progressEl.style.width = `${(driver.t / TOTAL_DURATION) * 100}%`;
    },
  },
  0,
);
```

## 变体

- **条目之间交叉淡化** —— 在一个重叠时间窗内（`time ≥ e.start − overlap && time ≤ e.end + overlap`，overlap ≈ 0.3s）同时返回「两个」相邻条目，并按到边界的距离计算各自的 opacity 来渲染。
- **按条目变化运动方式** —— 把 `entry.style` 键映射到每一章所用的某条现有规则上（例如 `3d-text-depth-layers` → `hacker-flip-3d` → `counting-dynamic-scale`）；排程器只负责编排时间。
- **自动延长 composition 时长** —— 你可以在脚本中根据算出的 `TOTAL_DURATION` 设置 `data-duration`，但 HF 在加载 composition 时读取 `data-duration`，初始化之后再设置可能不会生效 —— 请根据大致的总时长手动编写时长。

### 加速节奏（停留时间的几何衰减）

用于修辞上的层层加码 ——「大家都说……」、点名式罗列、一连串赞誉 —— 段落节拍网格本身会加速：开头的条目停留约 1s（阅读速度），然后时间窗按几何级数缩小，进入约 0.15–0.3s 一个的连发，在归位之前于一个强调状态上刹住。加速被预先计算进同一个扁平的 `TIMELINE` —— 仍然由内容驱动，仍然是确定性的，任何地方都没有加速 tween：

```js
// Geometric decay on the hold, clamped at a flurry floor; the brake state holds longest.
const HOLDS = CONTENT.map((entry, i) => Math.max(FLURRY_FLOOR, HOLD_START * Math.pow(DECAY, i)));
HOLDS[CONTENT.length - 1] = HOLD_FINAL;

let cumulative = 0;
const TIMELINE = CONTENT.map((entry, i) => {
  // Past ~0.5s states are glanced as motion texture, not read —
  // drop the per-char term or you never reach flurry speed.
  const readable = HOLDS[i] >= READ_THRESHOLD;
  const dur = HOLDS[i] + (readable ? entry.body.length * SEC_PER_CHAR : 0);
  const start = cumulative;
  cumulative += dur;
  return { ...entry, start, end: cumulative };
});
```

完整示例 —— **赞誉标签连发**：约 16 条简短的引语，在一个固定的文字标识旁边的标签里硬切轮换。前 3 个状态 `HOLD_START = 1.0`（每条都能完整读完）；`DECAY = 0.8` 让之后的每个时间窗不断缩小，直到被 `FLURRY_FLOOR = 0.2` 兜住（约 2.5s 内约 12 个状态 —— 一阵翻涌的赞誉，每条都只是一瞥）；最长的那句用 `HOLD_FINAL ≈ 1.6` 作为收尾 lockup 之前的刹车。

取值：`HOLD_START` 0.8–1.2s；`DECAY` 0.75–0.88（越高 = 进入连发之前的助跑越长）；`FLURRY_FLOOR` 0.15–0.3s（低于约 0.15s 时切换会变成频闪）；`READ_THRESHOLD` 约 0.5s；刹车 ≥ 下限的 4 倍，否则这次停顿不会被感知为一拍。这里放宽了 3–6 个条目的建议 —— 12–18 个状态是合规的，正是因为连发中的状态不会被逐条阅读。硬切的纪律（`lastTitle` 守卫、瞬间替换）正是让 0.2s 的状态能干净渲染的原因。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| BASE_DURATION | 0.6–1.5s | 每个条目的最短时长，与长度无关 —— 即使只有一个词的条目也要有阅读时间 |
| SEC_PER_CHAR | 0.03–0.06 s/字符 | ≈ 每秒 17–33 个字符；整个序列保持一致，让节奏读起来出自同一台引擎；宽字符语言取偏高的值 |
| HOLD_MID | 0.5–1.0s | 非最后条目的停留；`< HOLD_FINAL` |
| HOLD_FINAL | 1.0–2.0s | 高潮停留 —— 必须明显长于 HOLD_MID，让收尾读起来是一拍 |
| SPEED_FACTOR | 0.5–2.0（默认 1.0） | 仅用于单个条目；如果每个条目都用同一个系数，就把它并入 SEC_PER_CHAR |
| TAIL_PAD | 0.0–1.0s | 最后一个条目之后的安静一拍；如果下一个 composition 负责这口喘息，优先取 0 |
| CONTENT N | 3–6 个条目 | <3 算不上序列；>6 会拖沓（加速节奏会放宽这一点 —— 见上文） |

参考：`../examples/messaging-multi-phrase.html`。

## 关键约束

- **在构建时一次性预先计算 TIMELINE** —— 绝不在 `onUpdate` 中重算；对扁平数组的反向查找就是每帧的全部开销。
- **只在条目切换时替换 DOM**（`lastTitle` / 键守卫）—— 逐帧赋值 `textContent` 在 HF 渲染中会闪烁。
- **正文元素上设 `min-height`** —— 不预留空间的话，内容高度变化时下游元素（进度条、品牌）会抖动。
- **只适用于顺序排列** —— 并行轨道请用另一种归约方式。
- **标题在所选字号下放得进一行；正文折行后放得进 `min-height`。**

## 另见

`discrete-text-sequence`（正文上的逐条目打字机效果）· `context-sensitive-cursor`（按章节变化的光标颜色）· `vertical-spring-ticker`（用动画替换文字，而不是硬切）· `scale-swap-transition`（条目之间的视觉形变）。
