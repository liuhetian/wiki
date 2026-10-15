<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/composition-patterns.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Composition 图式

## 目录

- 画中画
- 文字在主体背后
- 带淡入淡出的标题卡
- 带章节标题的幻灯片放映
- 顶层 composition 示例

## 画中画（框中的视频）

对一个包裹 div 做位置 / 尺寸动画。视频填满这个包裹层。包裹层**没有**任何 data 属性。

```html
<div
  id="pip-frame"
  style="position:absolute;top:0;left:0;width:1920px;height:1080px;z-index:50;overflow:hidden;"
>
  <video
    id="el-video"
    data-start="0"
    data-duration="60"
    data-track-index="0"
    src="talking-head.mp4"
    data-has-audio="true"
    playsinline
  ></video>
</div>
```

```js
tl.to(
  "#pip-frame",
  { top: 700, left: 1360, width: 500, height: 280, borderRadius: 16, duration: 1 },
  10,
);
tl.to("#pip-frame", { left: 40, duration: 0.6 }, 30);
```

## 文字在主体背后（透明 webm overlay）

把一个标题放在出镜人*背后*，让人物剪影遮住文字。需要一个由 `npx hyperframes remove-background presenter.mp4 -o presenter.webm` 生成的透明 cutout。

三层结构，外加一条关键规则：

```html
<!-- z=1 base — full opaque mp4 (lobby + presenter), always visible -->
<video
  id="cf-base"
  data-start="0"
  data-duration="6"
  data-media-start="0"
  data-track-index="0"
  src="presenter.mp4"
  data-has-audio="true"
  playsinline
></video>

<!-- z=2 headline — visible the whole time -->
<h1
  id="cf-headline"
  style="position:absolute;top:50%;left:50%;
     transform:translate(-50%,-50%); z-index:2; font-size:220px; font-weight:900;
     color:#fff; text-shadow:0 6px 32px rgba(0,0,0,.55); clip-path:inset(0 0 100% 0);"
>
  MAKE IT IN HYPERFRAMES
</h1>

<!-- z=3 cutout — same source, alpha around presenter, hidden until the cut -->
<!-- WRAPPER has the opacity, NOT the video itself (see rule below). -->
<div class="cutout-wrap" style="position:absolute;inset:0;z-index:3;opacity:0">
  <video
    id="cf-cutout"
    data-start="0"
    data-duration="6"
    data-media-start="0"
    data-track-index="1"
    src="presenter.webm"
    muted
    playsinline
  ></video>
</div>
```

```js
const tl = gsap.timeline({ paused: true });
const CUT = 3.3;

// Reveal headline early
tl.to("#cf-headline", { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "expo.out" }, 0.25);

// At the cut, flip the cutout wrapper visible — the presenter's silhouette
// punches through the headline.
tl.set(".cutout-wrap", { opacity: 1 }, CUT);

// Sentinel: extend timeline to the composition's full duration so the
// renderer doesn't bail past the last meaningful tween.
tl.set({}, {}, 6);

window.__timelines["cover-flip"] = tl;
```

**为什么用包裹 div，而不是直接在视频上设 opacity？**

框架会在任何带 `data-start`/`data-duration` 的元素处于「活跃」状态时强制设置 `opacity: 1` —— 它就是这样管理 clip 生命周期的。视频元素上的 CSS `opacity: 0` 会被悄无声息地覆盖掉。把视频包进一个没有任何 `data-*` 属性的 div；这个包裹层归你的 CSS/GSAP 管。

**为什么两个视频都用 `data-start="0"`？**

这样两者从 t=0 开始同步解码。晚挂载 cutout（`data-start=3.3`）会让 Chrome 在挂载时做一次 seek + 解码器预热，可能跟底层 mp4 差一帧 —— 在切点处表现为一帧的抖动。

**颜色匹配：** `remove-background` 默认 `--quality balanced`（crf 18），能让 cutout 的 RGB 与源 mp4 几乎一致 —— 叠加时边缘光晕或色偏极小。hero 镜头用 `--quality best`（crf 12）；只有当 cutout 叠在一个*不同的*背景上、并且文件大小要紧时，才降到 `--quality fast`（crf 30）。

## 带淡入淡出的标题卡

```html
<div
  id="title-card"
  data-start="0"
  data-duration="5"
  data-track-index="5"
  style="display:flex;align-items:center;justify-content:center;background:#111;z-index:60;"
>
  <h1 style="font-size:64px;color:#fff;opacity:0;">My Video Title</h1>
</div>
```

```js
tl.to("#title-card h1", { opacity: 1, duration: 0.6 }, 0.3);
tl.to("#title-card", { opacity: 0, duration: 0.5 }, 4);
```

## 带章节标题的幻灯片放映

在同一条 track 上使用几个独立元素，各自有自己的时间范围。幻灯片会根据 `data-start`/`data-duration` 自动挂载 / 卸载。

```html
<div class="slide" data-start="0" data-duration="30" data-track-index="3">...</div>
<div class="slide" data-start="30" data-duration="25" data-track-index="3">...</div>
<div class="slide" data-start="55" data-duration="20" data-track-index="3">...</div>
```

## 顶层 composition 示例

```html
<div
  id="comp-1"
  data-composition-id="my-video"
  data-start="0"
  data-duration="60"
  data-width="1920"
  data-height="1080"
>
  <!-- Primitive clips -->
  <video
    id="el-1"
    data-start="0"
    data-duration="10"
    data-track-index="0"
    src="..."
    muted
    playsinline
  ></video>
  <video
    id="el-2"
    data-start="el-1"
    data-duration="8"
    data-track-index="0"
    src="..."
    muted
    playsinline
  ></video>
  <img id="el-3" data-start="5" data-duration="4" data-track-index="1" src="..." />
  <audio id="el-4" data-start="0" data-duration="30" data-track-index="2" src="..." />

  <!-- Sub-compositions loaded from files -->
  <div
    id="el-5"
    data-composition-id="intro-anim"
    data-composition-src="compositions/intro-anim.html"
    data-start="0"
    data-track-index="3"
  ></div>

  <div
    id="el-6"
    data-composition-id="captions"
    data-composition-src="compositions/caption-overlay.html"
    data-start="0"
    data-track-index="4"
  ></div>

  <script>
    // Just register the timeline — framework auto-nests sub-compositions
    const tl = gsap.timeline({ paused: true });
    window.__timelines["my-video"] = tl;
  </script>
</div>
```
