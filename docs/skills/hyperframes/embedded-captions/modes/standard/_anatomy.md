---
name: caption-template-anatomy
description: >
  每个字幕模板都建立在这套共享、可复现的场景引擎之上 —— 一个抠好 matte 的口播画面，配一条流动的逐字前景字幕和一个高潮词，由一条暂停的 GSAP timeline 驱动。每个会话只读它一次（54 个模板全都一样）；templates/ 里的每个单模板文件只覆盖风格 token + 指定名字的高潮入场 / 退场。
metadata:
  tags: caption, talking-head, matte, occlusion, verbatim, climax, gsap, hyperframes
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/modes/standard/_anatomy.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 字幕模板 —— 解剖（共享引擎）

一个**字幕模板** = 一个完整、可复现的 HyperFrames 场景：

> **人物（始终在画面里）** + 一条**流动的前景字幕**（逐字照录、逐词出现，有出现**也**有消失）+ 一个**高潮词**（大号、在说话人身后，有设计好的入场**和**退场）+ 一套协调一致的**字体 / 颜色 / 动效**设计。

`templates/` 里的每个文件都是这里描述的同一个引擎，只换了三样东西：(1) **风格 token**（字体、填充色、强调色、可选的渐变 / 描边），(2) 指定名字的**高潮入场** + **退场**（见 `_motion.md`），(3) **文案**（流动字幕行 + 高潮词）以及**场景 / 人物**。所以这份读一次就够；每个模板文件都很短。

HyperFrames 原生实现，所以任何人都能复现：

- **每个 composition 一条暂停的 GSAP timeline**，注册到 `window.__timelines[data-composition-id]`。
- 所有时间都以**秒**为单位；`data-start` / `data-duration` 承载场景时间窗口。
- 只允许**确定性 + 可安全 seek** 的写法 —— 不要 `Math.random()`，不要 `Date.now()`，没有有限的根 `data-duration` 时不要 `repeat: -1`，不要不可 seek 的 CSS 动画。每一个状态都能通过把 timeline seek 到某个时间 `t` 来到达。
- GSAP 的 transform 别名（`x`、`y`、`scale`、`rotation`）；可以动画 `opacity`、`filter`、`clipPath`、`textShadow`、`backgroundPosition`、`letterSpacing` —— 绝不动画布局属性（width/top/left/margin）。

composition 契约见 `hyperframes-core`；缓动 + 允许动画的属性白名单见 `hyperframes-gsap`；字幕的分组 / 定位 / 退场保证见 `hyperframes-captions`。

## 1 · 素材准备（两次 CLI 调用）

```bash
# 1) The person — transparent talking-head cutout over the scene (VP9 + alpha)
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
#    (a still works too:  remove-background portrait.jpg -o person.png)

# 2) The verbatim word timings that drive the flowing caption
npx hyperframes transcribe subject.mp4 --model small            # → transcript.json
#    shape: [{ "id":"w0","text":"Hello","start":0.0,"end":0.5 }, …]
```

流动字幕直接消费那个 `transcript.json`（词的 `start`/`end` → 揭示 + 当前词强调）。高潮词是手写的（它是标题那一拍，不属于口述转录的一部分）。在生产环境里，数字人 / matte 管线能免费产出像素级精确的 alpha —— `remove-background` 是给任意素材画面用的兜底。

## 2 · matte 三明治（HTML）

六层，从后到前。人物叠在高潮词的上方，从物理上**遮挡**它 —— 正是这一点让「在说话人身后」成立（单靠模糊 / 透明度读起来只是一层扁平的 overlay）。

```html
<div
  class="stage {STYLE} {PERSON}"
  id="cap-{id}"
  data-composition-id="cap-{id}"
  data-start="0"
  data-duration="{SCENE_DUR}"
  data-track-index="0"
>
  <!-- z0  background plate (the original frame, full) -->
  <!--     supplied by .{PERSON} as background-image, or a <video> at z-index:0 -->

  <!-- z1  CLIMAX — big, BEHIND the person, occluded -->
  <div class="climax"><span>{CLIMAX_WORD}</span></div>

  <!-- z4  the person cutout (transparent webm/png), aligned to the plate -->
  <video class="cut" src="person.webm" muted playsinline></video>
  <!-- or:  <img class="cut" src="person.png"> -->

  <!-- z5  grade / vignette for depth + legibility -->
  <div class="grade"></div>

  <!-- z6  FLOW — the verbatim caption, IN FRONT, lower third -->
  <div class="flow"></div>
  <!-- words injected from transcript.json -->
</div>
```

## 3 · 基础 CSS（布局 · z 顺序 · 尺寸）

字幕尺寸通过一个尺寸容器用 **`cqh`**（画面高度的百分比）表示，所以在任何分辨率下都符合广播规范（16:9 下一个词的大写字母高度约 8%）。单模板文件只设置 `--ff` / `--cfill` / `--cacc` 这几个 token，以及 `.climax span` 的填充（渐变 / 描边）。

```css
.stage {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  container-type: size;
  background-size: cover;
  background-position: center 12%;
  background-color: #0a0a0e;
  font-family: var(--ff);
}
.stage > * {
  position: absolute;
}
.cut {
  z-index: 4;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 12%;
  pointer-events: none;
}
.grade {
  z-index: 5;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(130% 100% at 50% 26%, transparent 40%, rgba(0, 0, 0, 0.6));
}

/* CLIMAX — big, behind person (z1), occluded. line-height ≥1.15 so clip-reveal
   entrances (inset(0)) never slice glyph tops; pad clips negative for script faces. */
.climax {
  z-index: 1;
  left: 50%;
  top: 37%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  text-align: center;
  line-height: 1.18;
  font-family: var(--ff);
  color: var(--cfill);
  font-weight: 900;
  font-size: 44cqh;
  text-transform: uppercase;
  text-shadow:
    0 2px 13px rgba(0, 0, 0, 0.6),
    0 0 48px rgba(0, 0, 0, 0.42);
}
.climax span {
  display: inline-block;
  opacity: 0;
} /* GSAP reveals it */

/* FLOW — verbatim caption, in front (z6), lower third */
.flow {
  z-index: 6;
  left: 50%;
  bottom: 9%;
  transform: translateX(-50%);
  width: 90%;
  text-align: center;
  line-height: 1.15;
  font-family: var(--ff);
  font-weight: 700;
  font-size: 7.5cqh;
  color: var(--cfill);
}
.flow .w {
  display: inline-block;
  opacity: 0;
  margin: 0 0.1em;
  color: var(--cfill);
}
.flow .w.act {
  color: var(--cacc);
} /* the currently-spoken word */

/* tokens every template overrides: */
.stage {
  --ff: "Inter";
  --cfill: #fff;
  --cacc: #10a37f;
}
```

**繁杂 / 明亮场景下的可读性：** 位于人物身后的高潮词需要和素材画面拉开区分，而不仅是一个填充色。在有光照的场景里，深色或渐变填充要给高潮词加一圈描边 —— `-webkit-text-stroke:1px rgba(0,0,0,.5);paint-order:stroke fill` —— 单靠深色投影在高光处（比如一盏灯）会失效。渐变 / clip 填充必须放在 `.climax span`（文字节点）上，绝不要放在做了 transform 的 `.climax` 容器上，否则 clip 会脱离，只剩阴影可见。

## 4 · 一条暂停的 GSAP timeline（循环，改成可安全 seek）

原来的展示页用的是 `setInterval` 循环；HyperFrames 需要把同样的节拍写成**一条暂停 timeline 上的绝对时间 tween**。循环是 **FLOW 行 →（FLOW 行）→ CLIMAX 入场 → 停留 → 退场**。克制是规矩：流动字幕保持干净；唯一那次大的情绪动作只在高潮处发生。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  const stage = document.getElementById("cap-{id}");
  const flow = stage.querySelector(".flow");
  const climax = stage.querySelector(".climax span");
  const tl = gsap.timeline({ paused: true });

  // --- FLOW: render words from transcript.json, reveal each at its start time ---
  // WORDS = grouped transcript lines: [{ words:[{text,start,end}], end }] in scene-local seconds.
  function renderLine(line) {
    flow.innerHTML = line.words
      .map((w, i) => `<span class="w" data-i="${i}">${w.text}</span>`)
      .join(" ");
    return [...flow.querySelectorAll(".w")];
  }
  WORDS.forEach((line) => {
    const spans = renderLine(line); // (one renderLine per active line; see captions skill for multi-line groups)
    spans.forEach((el, i) => {
      const w = line.words[i];
      tl.add(FLOW_IN(el), w.start); // FLOW_IN  = the template's flow entrance (see _motion.md)
      tl.set(spans, { className: "w" }, w.start); // active-word sweep: only the spoken word gets .act
      tl.set(el, { className: "w act" }, w.start);
    });
    tl.add(FLOW_OUT(spans), line.end); // FLOW_OUT = flow exit
    tl.set(flow, { autoAlpha: 0 }, line.end + FOUT); // hard-hide the group so old text can't linger
    tl.set(flow, { autoAlpha: 1 }, line.end + FOUT + 0.001);
  });

  // --- CLIMAX: entrance at the beat → hold ≥1s → exit (named recipes from _motion.md) ---
  const T = CLIMAX_AT; // beat time (after the flow lines)
  tl.add(CLIMAX_IN(climax), T); // e.g. SLAM / DEBLUR / INK-LOOM / CHROME-SWEEP …
  tl.add(CLIMAX_OUT(climax), T + CLIMAX_HOLD); // hold ≥1s, then exit. CLIMAX_OUT ends opacity:0 (hard exit)

  window.__timelines["cap-{id}"] = tl;
</script>
```

`FLOW_IN` / `FLOW_OUT` / `CLIMAX_IN` / `CLIMAX_OUT` 是 **`_motion.md`** 里有名字的配方 —— 每个都返回一个 GSAP tween/timeline，所以单模板文件只需要挑四个名字。如果流动字幕的当前词要的是*发光*（而不是离散揭示），更简单的等价做法是 `hyperframes-animation/rules/asr-keyword-glow.md` 里的单驱动包络。

## 5 · 怎么取值

- **SCENE_DUR** —— 必须等于 `data-duration`。循环演示卡片通常 6–10 s。
- **WORDS 分组** —— 每行 2–4 个词，每个词约 380–520 ms（高级感的节奏比 Hormozi 慢）。从 `transcript.json` 分组；保持 `end < next.start`（单调递增）。
- **CLIMAX_AT** —— 把高潮放在流动字幕行清场*之后*，落在旁白的强调拍上。
- **CLIMAX_HOLD** —— 入场结束*之后*要有 **≥1 s** 的稳定停留（高潮是标题那一拍）。入场持续 0.6–1.6 s，所以比如 hold = entranceDur + 1.0–1.6。
- **FOUT** —— 流动字幕退场 ≈ 0.5 s。每个元素都是**退场 ≈ 入场的 75 %**（到达从容，离开利落；见 `_motion.md`）。
- **高潮尺寸** —— 基础 44 cqh；长词会溢出画面（这是有意的电影感）；3 个字母的词放在居中的主体身后时，需要加大尺寸 + 描边，才能探出头来。

## 关键约束（HyperFrames）

- timeline **暂停**；registry 的键 = `data-composition-id`。
- 字幕元素上**不要用 CSS keyframe 动画** —— 所有运动都是绝对时间上的 GSAP tween（可安全 seek）。
- 没有有限的根 `data-duration` 时，不要 `Math.random` / `Date.now` / `repeat: -1`。
- 每个 `.w` 和高潮的 `span` 都要 `display:inline-block`。
- 每个流动字幕组在它的结束时间**硬隐藏**；**CLIMAX_OUT 以 `opacity:0` 结束**（或完全裁掉），什么都不残留。
- 渐变 / `background-clip:text` / 描边填充放在 `.climax span` 上，而不是做了 transform 的 `.climax` 上。
- `.climax` 的 `line-height ≥ 1.15`；手写 / 装饰字体的 clip 揭示入场要用负的 inset 留出余量。

## 搭配的 HF skill

- `media-use` —— `remove-background`（matte）+ `transcribe`（词时间）。
- `hyperframes-captions` —— 转录稿消费、分组、定位、退场保证、`fitTextFontSize`。
- `hyperframes-animation/rules/asr-keyword-glow.md` —— 逐字照录的当前词包络。
- `hyperframes-gsap` —— 单条暂停 timeline、transform 别名、缓动色板。
- `_motion.md`（本目录）—— 有名字的流动字幕 / 高潮入场 + 退场配方。
