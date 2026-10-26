# 动效词汇 —— 有名字的词入场手法

这个 skill 使用的 10 个动效基本单元。每一个都有特定的时长 + easing + 适用情境。agent 按**内容语气**来挑，而不是默认只用一个。

**Easing 理念：** `cubic-bezier(.2,.7,.2,1)` 是"深思熟虑的自信"默认值。`linear` 几乎总是错的。回弹类 easing（elastic）只用于轻松俏皮的内容 —— 绝不用于纪录片。

**退场规则：** 默认的退场是把同一个 tween 以 60% 时长反向播放。除非是在做修辞上的转折，否则绝不用与入场不同的动效退场。绝不在说话期间淡出 —— 只在短语之间的间隙淡出。

---

## 10 个手法

### 1. typewriter

逐字符显现，每字符 25–35ms，linear easing。纪录片 / 数据密集 / 紧张 / 质询式。

```js
// GSAP
words.forEach((w, i) => {
  const chars = w.textContent.split("");
  w.textContent = "";
  chars.forEach((c, j) => {
    const span = document.createElement("span");
    span.textContent = c;
    span.style.opacity = 0;
    w.appendChild(span);
    tl.to(span, { opacity: 1, duration: 0 }, wordStart + j * 0.028);
  });
});
```

### 2. word-fade-up（默认）

逐词，80ms stagger，`opacity 0→1 + translateY 8→0`，`cubic-bezier(.2,.7,.2,1)`（ease-out）。对话类内容的默认值。

```js
tl.fromTo(
  word,
  { opacity: 0, y: 8 },
  { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
  wordStart,
);
```

### 3. word-pop

逐词，60ms stagger，`scale 0.85→1 + opacity 0→1`，轻度弹性 `cubic-bezier(.34,1.56,.64,1)`。高能量 / YouTube vlog / 快节奏。**绝不用于纪录片。**

### 4. swipe-reveal

整个短语一次性出现，400ms，`clip-path inset 0 100% 0 0 → 0 0 0 0`，expo `cubic-bezier(.77,0,.175,1)`。主题演讲 / 科技产品 / 发布公告。

```css
.cap {
  clip-path: inset(0 100% 0 0);
}
/* animate to inset(0 0 0 0) */
```

### 5. drop-and-settle

逐词，120ms stagger，`y: -30→0`，带回弹 `cubic-bezier(.68,-.55,.27,1.55)`。俏皮但有控制。**不用于纪录片。**

### 6. etch

整个词一次性出现，600ms，不透明度 `0→1` 渐变，伴随轻微的模糊→清晰过渡。Ease-in-out。诗意 / 抒情 /"墙上的引言"方向。

### 7. crosshair

逐词，总共 200ms：两条 1px 的线向词的中心汇聚（linear 150ms），然后词猛地出现（expo-out 50ms）。惊悚 / 调查类纪录片。

### 8. breathing-hold

**静止但有生命。** 没有入场动画。一旦可见，就在 2 秒内循环做 `1.00↔1.008` 的微缩放，sine ease。用于停留 1.5 秒以上的高潮行。

### 9. cascade

每个词从交替的方向进入：左、右、左、右。`translateX: ±40→0`，ease-out 300ms。**打破节奏的手法** —— 节制使用，最多每 30 秒一次。

### 10. burn-in

**零动画。** 1 帧内突然变为 opacity 1。没有淡入，没有变换。访谈纪录片风格。在纪录片方向中每隔 6–8 个短语用一次，增加变化（Standard 模式；见 direction-catalog §1）。

---

## 语气 → 时长速查表

| 语气           | Stagger                   | 停留        | 入场手法                         |
| -------------- | ------------------------- | ----------- | ---------------------------------- |
| documentary    | 150ms                     | 600ms       | burn-in（70%）+ word-fade-up（30%） |
| conversational | 80ms                      | 400ms       | word-fade-up                       |
| energetic      | 50ms                      | 300ms       | word-pop                           |
| poetic         | 250ms                     | 1200ms      | etch                               |
| broadcast      | 0（burn-in）               | BBC 时长标准 | burn-in                            |
| investigative  | 每字符 25ms                 | 500ms       | typewriter                         |
| keynote        | 逐词为 0（整个短语擦出） | 600ms       | swipe-reveal                       |

agent 挑定语气 → 查这张表 → 得到 GSAP 参数。靠数据，不靠瞎猜。

---

## 逐词 vs 逐短语的动画维度

与上面的 10 个手法正交。

- **逐词动画**（默认）：每个词在它的 `w.start` 时间戳入场。与语音紧密同步。
- **逐短语动画**：整个分组在 `g.in`/`g.out` 入场 / 退场。词一起出现。用于：
  - swipe-reveal 类手法
  - burn-in（没有动画，但"显现"是一个分组级事件）
  - 标题卡 / 章节分隔

规则：跟随语音的内容用逐词；跳出语音流的时刻用逐短语。

---

## 按情境细分 stagger

在同一种语气内微调 stagger：

- **纪录片对白**：150ms（克制）
- **纪录片点睛之句**：250ms（有分量）
- **Vlog 开场**：50ms（快速抓人）
- **Vlog 旁白**：70ms（口语化但利落）
- **诗 / 歌词**：每词 250–400ms，短语之间间隔 500–1000ms
- **主题演讲 hero**：只用逐短语（stagger = 不适用）
- **访谈名字卡**：0 stagger（静态）

---

## 反模式（禁用，出自 anti-patterns.md）

- 对 `letter-spacing` 做动画 → 重排
- 对 `filter:blur` 做动画 → 重排 + 可能把文字冲淡
- 在 timeline 里用 `Math.random()` / `Date.now()` → 非确定性渲染
- 入场总时长不到 100ms → 慌乱，读不了
- 30 秒以上每个分组都用同一种动效 → 眼睛适应了，不再注意到

---

## 什么时候打破这套词汇

这 10 个手法是一套够用的覆盖，不是天花板。在 Standard 模式下，当场景需要时就发明新的手法：

- Kyle Cooper 为黑色电影做的划痕打字机
- K-pop 歌词那种从侧边定向飞入的词
- 带色差的电影片名式闪切 burn-in

发明时：保持确定性，只用 transform + opacity，并用 4 个维度（入场、停留、退场、stagger）来描述这个动效。
