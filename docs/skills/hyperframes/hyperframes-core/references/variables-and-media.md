<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/variables-and-media.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 变量与媒体

这是两个独立的关注点，放在一起是因为两者都控制着「从 HTML 外部流入的东西」：runtime 参数（变量）和外部媒体文件（视频 / 音频）。

## 变量 { #variables }

用 `data-composition-variables` 在 `<html>` 元素上声明变量。每条声明都需要 `id`、`type`、`label` 和 `default`：

```html
<html
  data-composition-variables='[
    {"id":"title","type":"string","label":"Title","default":"Hello"},
    {"id":"accent","type":"color","label":"Accent","default":"#66d9ef"}
  ]'
></html>
```

**优先使用声明式绑定 —— 不需要脚本**，就能做直接替换：

```html
<img class="clip" data-start="0" data-duration="5" data-var-src="heroImage" src="fallback.jpg" />
<h1 class="clip" data-start="0" data-duration="5" data-var-text="title">Fallback</h1>
<style>
  .card {
    color: var(--accent);
  }
</style>
```

- `data-var-src="id"` 替换元素的 `src`（URL 字符串或图片 `{url}`）；编写的 `src` 作为兜底值。
- `data-var-text="id"` 替换元素自身的文本；元素的子元素（嵌套的 clip、有动画的 span）会被保留。
- 每个标量变量都会自动作为 `--{id}` CSS 自定义属性应用到 composition 根元素上，所以 `var(--id)` 的 CSS 会响应覆盖值 —— 不需要 `setProperty` 样板代码。
- 绑定在预览和渲染中解析结果完全相同，对于 sub-composition 则按实例解析。
- 注意：带音频的媒体应当保留一个真实的兜底 `src` —— 渲染时的音频提取读取的是编写的那个属性（lint：`media_variable_src_no_fallback`）。

对于直接替换之外的逻辑（循环、条件、派生值），在初始化时读取一次值：

```js
const { title, accent } = window.__hyperframes.getVariables();
document.getElementById("title").textContent = title;
```

### 变量规则

- 支持的类型及其额外选项（供 Studio 的编辑 UI 使用）：
  - `string` —— 可选的 `placeholder`、`maxLength`
  - `number` —— 可选的 `min`、`max`、`step`、`unit`
  - `color` —— 无
  - `boolean` —— 无
  - `enum` —— **必填**的 `options: [{ "value": "...", "label": "..." }, ...]`
- 始终提供有用的 `default` 值，这样预览不需要 CLI 覆盖值也能工作。
- 在 sub-composition 宿主上用 `data-variable-values='{"title":"Pro"}'` 做按实例的覆盖。
- 用 `npx hyperframes render --variables '{"title":"Q4 Report"}'` 或 `--variables-file` 做渲染时的覆盖。
- 在 CI 中加上 `--strict-variables`：它会把未声明的键、类型不匹配以及不在 `options` 里的 enum 值从警告变为 error。
- 在初始化时读取一次值，不要在每个动画 tick 里读 —— 变量在渲染中途不会改变。
- 媒体调色可以在 `data-color-grading` JSON 里使用精确的变量引用。用 `$gradingPreset` 或 `${gradingIntensity}` 作为整个字段的值；runtime 会在应用 shader 调整、收尾细节、模糊 / 像素化效果和自定义 LUT 之前，从当前 composition 的变量中解析它。

### 两种 JSON 形态（容易混淆）

- `data-composition-variables` 是一个**声明组成的数组**（schema）：`[{id, type, label, default}, ...]`
- `--variables` 和 `data-variable-values` 是**以 id 为键的对象**（值）：`{"title":"Q4","accent":"#fff"}`

## 媒体

**`<video>`/`<audio>` 在任意嵌套深度都能工作，包括 sub-composition 的 `<template>` 或包裹用的 `<div>` 内部。** runtime 用扁平的 `document.querySelectorAll("video, audio")` 发现媒体，通过 `element.closest("[data-composition-id]")` 解析每个元素的宿主 composition，并用每一层祖先 composition 累积的绝对起点来重新换算它局部的 `data-start`。因此，一个位于 `2` 的宿主中、带有 `2` 的子媒体，会在根时间 `4` 处开始播放该媒体，并且在预览、snapshot、提取和渲染中都一致。有意用根时间编写媒体起点的旧版项目，必须给该元素标上 `data-hf-media-start-basis="global"`；绝不要从重叠的数字去推断基准。新的 composition 应当始终使用场景局部的 `data-start`。如果某个面板在渲染后是空白的，就抓取逐帧的 `snapshot`，并把它当作阻塞渲染的问题。

唯一真正的约束关乎 **timeline，而不是媒体放置位置**：sub-composition 的 timeline **无法够到或驱动宿主元素的动画** —— 无论是 `document.querySelector("#host-id")` 还是 gsap 的选择器字符串（`tl.to("#host-id", …)`）都无法跨越边界解析；sub-comp 的 timeline 只驱动它自己的子树。所以如果一个媒体元素位于宿主根元素下，**它在每个场景中的运动（缩放 / 透明度 / 变形 / 倾斜 / 呼吸）必须在 `index.html` 的主（MAIN）timeline 上、以全局（GLOBAL）时间编写**（场景局部时间 + 场景槽位的 `data-start`）。反过来，把媒体放在场景的 sub-comp 里，就能让该 sub-comp 自己的 timeline 用场景局部时间为它做动画。要在没有 perspective 父元素的情况下做 3D 倾斜，在该元素上使用 gsap 的 `transformPerspective`。见 `composition-patterns.md` 的原型 B。

有声视频把声音保留在 `<video>` 上（`data-has-audio="true"`，不加 `muted`）。音乐、旁白、替换音频、J/L 切，或者在 Studio 里分离出来的音频，使用单独的 `<audio>`。无声素材画面和 b-roll：`muted`。

```html
<video
  id="a-roll"
  class="clip"
  src="assets/demo.mp4"
  playsinline
  data-has-audio="true"
  data-start="0"
  data-duration="12"
  data-track-index="0"
  data-volume="1"
></video>

<!-- Separate <audio> only for other sound: music, voiceover, replacement audio. -->
<audio
  id="music"
  src="assets/bed.mp3"
  data-start="0"
  data-duration="12"
  data-track-index="2"
  data-volume="0.4"
></audio>
```

### 媒体规则

- 在 composition 代码里**不要**调用 `video.play()`、`audio.play()`，也不要暂停或 seek。播放由 HyperFrames 掌管。
- **不要**从 sub-comp 的 timeline 驱动宿主根元素下的媒体：sub-comp 的 timeline 够不到其子树之外的元素，所以这样做不会有任何效果。从主 timeline 以全局时间驱动宿主根元素下的媒体（或者把媒体放在由其 timeline 为它做动画的那个 sub-comp 里）。
- **不要**对有计时的媒体元素的尺寸做动画；改为对一个无计时的包裹层做动画。
- **不要**把视频嵌套在有计时的包裹层里。如果 `<video data-start>` 的祖先元素也带有 `data-start`，`lint` 会拒绝它（`video_nested_in_timed_element`，error），而且这个故障是真实存在的：帧提取器根据视频自己的 `data-start` 解析其起点，不计入包裹层的偏移，而可见性用的却是包裹层的窗口。于是 clip 会显示错误的源帧，并在其时间槽中途消失。把计时放在包裹层上**或**媒体元素上，绝不要两者都放。
- **Sub-composition 不受此限，可以正常工作。** sub-composition 内的 `<video>`/`<audio>` 与宿主根元素下的渲染结果完全相同，因为 composition 宿主会传递它的偏移。只有普通的有计时包裹层（包在 `<video data-start>` 外面的 `<section data-start>`）才会出问题。
- **绝不要**给 `<video>`/`<audio>` 加 `crossorigin`。`lint` 会无条件拒绝它（`media_crossorigin_breaks_preview`，error），因为对于没有 `Access-Control-Allow-Origin` 的媒体主机，预览会静默失败，而渲染仍然正常，从而掩盖了这个 bug。没有办法抑制，所以即使是 canvas/WebGL/WebAudio 回读的情况也同样适用。
- **每个 `<audio>` 都需要一个 `id`。** 混音器选取的是 `audio[id][src]`，所以没有 id 的 `<audio>` 永远不会被混音，渲染结果是**无声的**。`lint` 会以 `media_missing_id` 抓到它。
- 视频自己的声音留在 `<video>` 上（`data-has-audio="true"`，不加 `muted`）。只为其他声音（音乐、旁白、替换音频、J/L 切）添加单独的 `<audio>`，并把它所替换的那个视频静音。
- 音量的淡入淡出和闪避（duck）使用 `data-automation` 的音量通道；确切写法见 `creator-editing-recipes.md`。`data-volume` 是静态基线。存在通道时，timeline 上的 `volume` tween 会被忽略。

关于媒体时长：如果媒体的固有长度已知，而且你要整个 clip，`<video>` 和 `<audio>` 可以省略 `data-duration`。否则就显式提供 `data-duration`。

输入编解码器：渲染通过 FFmpeg 解码视频（帧会被预先提取并注入），所以 HEVC/H.265 素材（8/10 位）在任何地方都能正确渲染；实时预览会自动为任何浏览器不友好的素材做代理（首次使用时转码并缓存一份 H.264 副本，可用 `--no-proxy` 或 `media.autoProxy: false` 关闭），`lint` 会发出一条 info 级别的 `hevc_preview_codec` 提示，点名受影响的素材。
