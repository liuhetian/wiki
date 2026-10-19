<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/gsap-effects.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# HyperFrames 的 GSAP 效果

即插即用的动画模式。代码片段只展示机制，写在标准的场景 clip 内（hyperframes-core）；假定 `tl` 已存在。

- [打字机（Typewriter）](#typewriter) —— 逐字符显现，可选光标 / 退格 / 词语轮换
- [音频可视化（Audio Visualizer）](#audio-visualizer) —— 预先提取音频数据，由 timeline 驱动 Canvas/DOM 渲染

## 打字机（Typewriter） { #typewriter }

除核心脚本外，还需要 GSAP 的 TextPlugin：

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/TextPlugin.min.js"></script>
<script>
  gsap.registerPlugin(TextPlugin);
</script>
```

### 基础用法

```js
const text = "Hello, world!";
const cps = 10; // chars per second — see timing table
tl.to(
  "#typed-text",
  { text: { value: text }, duration: text.length / cps, ease: "none" },
  startTime,
);
```

### 闪烁光标

三条规则：**同一时刻只显示一个光标**（显示下一个之前先隐藏上一个）；**空闲时光标必须闪烁**（打完字之后、停顿期间）；**文字和光标之间不留空隙**（HTML 里两个元素紧挨着）。

```html
<span id="typed-text"></span><span id="cursor" class="cursor-blink">|</span>
```

```css
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.cursor-blink {
  animation: blink 0.8s step-end infinite;
}
.cursor-solid {
  animation: none;
  opacity: 1;
}
.cursor-hide {
  animation: none;
  opacity: 0;
}
```

模式：闪烁 → 常亮（开始打字）→ 打字 → 闪烁（打字结束）：

```js
tl.call(() => cursor.classList.replace("cursor-blink", "cursor-solid"), [], startTime);
tl.to("#typed-text", { text: { value: text }, duration: dur, ease: "none" }, startTime);
tl.call(() => cursor.classList.replace("cursor-solid", "cursor-blink"), [], startTime + dur);
```

多行交接：隐藏上一个光标 → 新光标闪烁 → 短暂停顿（约 0.5 秒）→ 打字时常亮。绝不要走 `hidden → solid`（会跳过空闲闪烁）。

### 退格

TextPlugin 是从开头删除的 —— 用来做退格是错的。改用手动截取子串删除：

```js
function backspace(tl, selector, word, startTime, cps) {
  const el = document.querySelector(selector);
  const interval = 1 / cps;
  for (let i = word.length - 1; i >= 0; i--) {
    tl.call(
      () => (el.textContent = word.slice(0, i)),
      [],
      startTime + (word.length - i) * interval,
    );
  }
  return word.length * interval;
}
```

### 与静态文字的间距

打字机词语紧挨着静态文字时（在基线对齐的 flex 行里写 `<span>Ship something</span><span style="margin-left:14px"><span id="word"></span><span id="cursor">|</span></span>`）：在外层包裹的 span 上用 `margin-left`。不要用 flex 的 `gap`（它会把光标和文字隔开），也不要在静态文字末尾留空格（动态 span 为空时这个空格会被折叠掉）。

### 词语轮换

打字 → 停留 → 退格 → 下一个词；每个空闲时刻光标都在闪烁：

```js
let offset = 0;
words.forEach((word, i) => {
  const typeDur = word.length / 10;
  // cursor: solid while typing, blink during holds (same call pattern as above)
  tl.to("#typed-text", { text: { value: word }, duration: typeDur, ease: "none" }, offset);
  offset += typeDur + 1.5; // hold
  if (i < words.length - 1) offset += backspace(tl, "#typed-text", word, offset, 20) + 0.3;
});
```

### 追加词语

把一句话一个词一个词地拼进同一个元素：维护一个 `accumulated` 字符串，每一步 tween `text: { value: accumulated + " " + word }`，时长取 `duration: newChars / cps`，然后推进 offset。

### 节奏参考

| CPS   | 观感             | 适用于                     |
| ----- | ---------------- | -------------------------- |
| 3-5   | 缓慢、刻意       | 戏剧性揭示、悬念           |
| 8-12  | 自然打字         | 对白、旁白                 |
| 15-20 | 快速、有活力     | 技术演示、代码             |
| 30+   | 近乎瞬间         | 填充大段文字               |

## 音频可视化（Audio Visualizer） { #audio-visualizer }

预先提取音频数据，由 timeline 驱动 Canvas / DOM 渲染。**渲染时不要使用 Web Audio API** —— seek 期间根本没有播放。

### 提取音频数据

自带的提取器（需要 `ffmpeg` + Python `numpy`）：

```bash
python skills/hyperframes-creative/scripts/extract-audio-data.py audio.mp3 -o audio-data.json
python skills/hyperframes-creative/scripts/extract-audio-data.py video.mp4 --fps 30 --bands 16 -o audio-data.json
```

输出：`{ "fps": 30, "totalFrames": 5415, "frames": [{ "time": 0.0, "rms": 0.42, "bands": [0.8, 0.6, 0.3] }] }` —— `rms`（0-1）是整体响度；`bands[]`（0-1）是各频段幅度，索引 0 = 低音，每个频段各自独立归一化。

### 加载（同步）

小文件（< 约 500 KB）直接内联 JSON，大文件用同步 XHR：

```js
const xhr = new XMLHttpRequest();
xhr.open("GET", "audio-data.json", false); // synchronous — deliberate
xhr.send();
const AUDIO_DATA = JSON.parse(xhr.responseText);
```

**不要使用异步 `fetch()`** —— HyperFrames 在页面加载后同步读取 `window.__timelines`；在 `.then()` 里构建 timeline 意味着抓帧开始时它还没准备好。

### 驱动 timeline

Canvas 2D 是主力（柱条、波形、圆环、渐变）—— 每帧一个 `tl.call`：

```js
const ctx = document.getElementById("viz").getContext("2d");
for (let f = 0; f < AUDIO_DATA.totalFrames; f++) {
  tl.call(
    () => {
      const frame = AUDIO_DATA.frames[f];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw using frame.rms and frame.bands
    },
    [],
    f / AUDIO_DATA.fps,
  );
}
```

WebGL / Three.js：HyperFrames 会给 `THREE.Clock` 打补丁以获得确定性的时间 —— 每帧用音频数据更新 uniform。DOM 元素：约 20 个以内没问题，超过之后比 Canvas 慢。

### 平滑

```js
let prev = null;
const smoothing = 0.25; // 0.1-0.2 snappy, 0.3-0.5 flowing
function smooth(f) {
  const raw = AUDIO_DATA.frames[f];
  if (!prev) prev = { rms: raw.rms, bands: [...raw.bands] };
  else {
    prev = {
      rms: prev.rms * smoothing + raw.rms * (1 - smoothing),
      bands: raw.bands.map((b, i) => prev.bands[i] * smoothing + b * (1 - smoothing)),
    };
  }
  return prev;
}
```

### 设计指南

- **空间映射** —— 水平方向：低音在左、高音在右；垂直方向：低音在底部；环形：低音在 12 点钟位置，顺时针环绕（做完整圆环时镜像）。
- **低音驱动大幅运动**（缩放、辉光、位置）；**高音驱动细节**（闪烁微光、频闪、边缘）；**RMS 驱动全局**（背景亮度、整体能量）。
- 挑 2-3 个做动画的属性 —— 再多就显得嘈杂。最小值保持在零以上，让安静的段落也有生气。
- **频段数量**：4 = 背景辉光/脉动，8 = 柱状图，16 = 精细的 EQ（默认），32 = 密集的径向布局。
- **分层**：用 `z-index` 叠放多个 canvas —— 底下一层由低音/rms 驱动，上面一层由各个频段分别驱动，不用逐元素处理就能做出层次感。
