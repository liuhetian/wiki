# 创作者剪辑配方

读完 `tracks-and-clips.md` 之后，使用这些可直接复制的契约。通用算式：**消耗的源素材 = timeline 时长 × 速率**；**自然 timeline 时长 = 剩余源素材 / 速率**。

做任何编辑之前，先运行 `npx hyperframes timeline`（加 `--json` 得到机器可读的列表）来查看项目的 track 和 clip，而不是去读 HTML。

这些配方把视频的声音保留在 `<video>` 上（`data-has-audio="true"`，不加 `muted`），所以切视频就会同时切掉它的声音。只有当画面和声音必须各自独立剪切时（J/L 切、替换音频），或者用于其他声音（音乐、旁白）时，才使用单独的 `<audio>` —— 需要这样做的配方会明确说明。无声素材画面或 b-roll：在这些代码块里把 `data-has-audio="true"` 换成 `muted`。

**下面每个 `<video>` 和 `<audio>` 都带有 `id`，这不是装饰**：对于没有 id 的计时媒体，`lint` 会报 `media_missing_id` error，而且没有 id 的 `<audio>` 永远不会被混音器接收，于是渲染出来是无声的。复制配方时保留这些 id。

## 硬切

```html
<video
  id="a"
  src="take.mp4"
  data-start="0"
  data-duration="2"
  data-media-start="4"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
<video
  id="b"
  src="take.mp4"
  data-start="2"
  data-duration="3"
  data-media-start="10"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：B 的起点 = A 的起点 + 时长。源素材算式：每个区间从 `data-media-start` 开始；消耗的源素材 = timeline 时长 × 速率。音频随动：声音跟着每个视频 clip 走。归属：`/hyperframes-core`。局限：只适用于相邻的窗口；把两个窗口首尾相接地编写。同一 track 上的重叠是合法的；两个 clip 按 CSS 顺序绘制。

## 修剪入点 / 出点

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="1"
  data-duration="3"
  data-media-start="6"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：可见窗口是 `[1,4]`。源素材算式：1x 速率下入点 = 6，出点 = 6+3；绝不要自创表示源素材终点的语法。音频随动：声音跟着视频 clip 走，使用同样的三个属性。归属：`/hyperframes-core`。局限：要取另一个区间就用另一个 clip。

## 拆分 / 拼接

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="0"
  data-duration="2"
  data-media-start="0"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
<video
  id="shot-2"
  src="take.mp4"
  data-start="2"
  data-duration="2"
  data-media-start="8"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：在 t=2 处拼接。源素材算式：各自独立的源偏移选出要保留的片段。音频随动：声音跟着每个视频 clip 走，所以它会以完全相同的方式被拆分。归属：`/hyperframes-core`。局限：源素材剪切属于 core，绝不用关键帧来做。

## 复制 / 复用同一源素材

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="0"
  data-duration="1"
  data-media-start="2"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
<video
  id="shot-2"
  src="take.mp4"
  data-start="4"
  data-duration="1"
  data-media-start="2"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：副本可以占据不同的起点。源素材算式：相同的偏移复用相同的源素材。音频随动：声音跟着每个视频 clip 走，所以每个副本都带着自己的声音。归属：`/hyperframes-core`。局限：存在 id 时，每个元素都需要唯一的 id。

## 重排

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="0"
  data-duration="2"
  data-media-start="10"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
<video
  id="shot-2"
  src="take.mp4"
  data-start="2"
  data-duration="2"
  data-media-start="2"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：`data-start` 决定编写出的顺序。源素材算式：源偏移不必按时间先后排列。音频随动：声音跟着视频 clip 走，所以重排 clip 也就重排了它们的声音。归属：`/hyperframes-core`。局限：重排只改变放置位置，不改变源素材区间。

## 定格 / 停留

```html
<img src="held-frame.png" data-start="2" data-duration="1" data-track-index="0" class="clip" />
```

Timeline 算式：静帧自己决定停留时长。源素材算式：支持源素材最后一帧、subcomp 最终状态以及视觉姿态的停留。音频随动：有意识地让音频继续、修剪或静音。归属：`/hyperframes-core` + `/media-use`。局限：在源素材中间任意位置定格，需要预先处理出一张静帧 / 一个片段。

## 恒定速度 / 慢动作

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="0"
  data-duration="2"
  data-media-start="4"
  data-playback-rate="0.5"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：时长是编写出的 timeline 时间。源素材算式：消耗的源素材 = timeline 时长 × 速率；自然 timeline 时长 = 剩余源素材 / 速率。音频随动：声音跟着视频 clip 走，并以同样的恒定速率播放。归属：`/hyperframes-core`。局限：规范化到 0.1..10。要做变速坡道，就在 `data-automation` 里放一条 `rate` 通道，例如 `{"version":1,"lanes":[{"target":"rate","points":[{"t":0,"v":1},{"t":2,"v":4}]}]}`；它优先于恒定速率。

## 推近 / 冲击变焦

```js
tl.to("#clip .inner", { scale: 1.35, xPercent: -8, duration: 0.18 }, 1);
```

Timeline 算式：tween 的位置以 composition 的秒数计。源素材算式：不变；core clip 仍然负责选取源素材时间。音频随动：除非另行编辑，否则不变。归属：`/hyperframes-keyframes`。局限：作用于内部包裹层，而不是有计时的 clip 元素。

## 平移 / Ken Burns

```js
tl.fromTo(
  "#clip .inner",
  { scale: 1.05, xPercent: 0 },
  { scale: 1.2, xPercent: -12, duration: 4, ease: "none" },
  0,
);
```

Timeline 算式：运动跨越编写出的四秒。源素材算式：不变。音频随动：声音留在视频 clip 上；tween 不碰它。归属：`/hyperframes-keyframes`。局限：几何是编写出来的，不是自动人脸跟踪。

## 裁切 / 重新构图

```js
tl.to("#clip .inner", { clipPath: "inset(8% 12% 6% 10%)", xPercent: -4, duration: 1 }, 2);
```

Timeline 算式：裁切在 `[2,3]` 区间内插值。源素材算式：不变。音频随动：不会自动改变。归属：`/hyperframes-keyframes`。局限：只作用于内部包裹层，不是时间上的修剪。

## Clip-path 擦除 / 揭示 / 遮罩 / 分屏

```js
tl.fromTo(
  "#next .inner",
  { clipPath: "polygon(0 0,0 0,0 100%,0 100%)" },
  { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)", duration: 0.5 },
  2,
);
```

Timeline 算式：让已放置的 clip 重叠，用于 0.5 秒的交接。源素材算式：每个 clip 保留各自的区间。音频随动：声音留在各自的视频 clip 上。归属：`/hyperframes-keyframes` + `/hyperframes-animation`。局限：只做视觉上的遮罩 / 多边形 / 分屏；源素材剪切仍归 `/hyperframes-core`。

## 交叉淡化

```html
<div id="a-visual" class="inner">
  <video
    id="a"
    data-start="0"
    data-duration="3"
    data-track-index="0"
    src="a.mp4"
    data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1},{"t":2.5,"v":1},{"t":3,"v":0}]}]}'
    playsinline
    data-has-audio="true"
  ></video>
</div>
<div id="b-visual" class="inner">
  <video
    id="b"
    data-start="2.5"
    data-duration="3"
    data-track-index="1"
    src="b.mp4"
    data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":0.5,"v":1},{"t":3,"v":1}]}]}'
    playsinline
    data-has-audio="true"
  ></video>
</div>
<script>
  const tl = gsap.timeline({ paused: true });
  tl.set("#b-visual", { opacity: 0 }, 0)
    .to("#a-visual", { opacity: 0, duration: 0.5 }, 2.5)
    .to("#b-visual", { opacity: 1, duration: 0.5 }, 2.5);
  window.__timelines["main"] = tl;
</script>
```

Timeline 算式：不同的 track 重叠 0.5 秒，带有相反方向的透明度包络。源素材算式：每个源素材区间保持独立。音频随动：在每个视频自己的 `data-automation` 上使用相反方向的音量包络，因为声音留在视频上。归属：`/hyperframes-core` + `/hyperframes-keyframes` + `/hyperframes-audio`。局限：交叉淡化就是透明度 / 音量包络，不是源素材级别的叠化。

## 音量淡入淡出 / 闪避（duck）

```html
<audio
  id="music-bed"
  src="music.wav"
  data-start="0"
  data-duration="5"
  data-track-index="10"
  data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":1,"v":1},{"t":2,"v":1},{"t":2.2,"v":0.3},{"t":3,"v":0.3},{"t":3.2,"v":1},{"t":4,"v":1},{"t":5,"v":0}]}]}'
></audio>
```

Timeline 算式：通道里的 `t` 是 clip 局部的编写时间：0–1 淡入，2–2.2 闪避压低，2.2–3 保持，3–3.2 闪避恢复，4–5 淡出。源素材算式：源素材的选取仍然使用 core 属性。音频随动：这条显式的「压低—保持—恢复」包络作用于这个 `<audio>`（音乐是单独的声音）。同样的通道也适用于 `<video data-has-audio="true">`。归属：`/hyperframes-audio`。局限：automation 不是源素材重新计时。

**随时间变化的音量只有一条规则：用通道。** `lint` 也接受对 `volume` 做 timeline tween，但当一个 track 同时有两者时，通道胜出，tween 被忽略（`audio_volume_double_automation`）。绝不要给已经有 `volume` tween 的 track 加通道，也绝不要给已经有通道的 track 加 tween；编辑已经存在的那一个。要在十秒内从 0.1 渐变到 0.5，就写 `{"t":0,"v":0.1},{"t":10,"v":0.5}`。`t` 是从 clip 自身起点算起的秒数，所以超出 `data-duration` 的渐变永远走不完：选择时间点之前先检查 clip 的长度。`data-volume` 仍作为 clip 的静态电平，不与你在这里编写的任何其他东西相组合。

## 音频对齐

```html
<video
  id="shot-1"
  src="take.mp4"
  data-start="3"
  data-duration="2"
  data-media-start="8"
  data-playback-rate="2"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：画面和声音共享起点 / 时长，因为声音留在 clip 上（`data-has-audio="true"`）。源素材算式：两者都消耗四秒源素材。音频随动：计时、区间和速率完全相同，没有任何需要保持同步的东西。归属：`/hyperframes-core` + `/hyperframes-audio`。局限：没有基于波形的自动同步或漂移校正。

J 切或 L 切正是需要单独 `<audio>` 的情况：画面和声音各自独立剪切，所以声音要有自己的元素（替换音频、旁白或音乐也是如此）。把你要替换其声音的那个视频静音。

```html
<!-- Outgoing shot: picture runs 0-5, its own sound is a separate clip that ends at the audio cut (4). -->
<video
  id="shot-1"
  src="intro.mp4"
  data-start="0"
  data-duration="5"
  data-track-index="0"
  muted
  playsinline
></video>
<audio
  id="shot-1-audio"
  src="intro.mp4"
  data-start="0"
  data-duration="4"
  data-track-index="10"
></audio>
<!-- Incoming shot: picture starts at 5, its sound leads it by one second. -->
<video
  id="shot-2"
  src="take.mp4"
  data-start="5"
  data-duration="3"
  data-media-start="12"
  data-track-index="0"
  muted
  playsinline
></video>
<audio
  id="shot-2-audio"
  src="take.mp4"
  data-start="4"
  data-duration="4"
  data-media-start="11"
  data-track-index="10"
></audio>
```

声音比画面提前一秒（J 切）：`shot-2-audio` 从 4 开始、从源素材的 11 处读取，而画面从 5 开始、从 12 处读取。两者保持在同一个源素材时钟上。J 切或 L 切里的每个视频都是 `muted`，它的声音是它自己的 `<audio>`：出场镜头的 `<audio>` 在音频切点（4）结束，而它的画面继续到 5，这样同一个源素材上的两个声音永远不会重叠。同一文件上有声的 `<video>` 和 `<audio>`，只有当它们的时间窗口重叠时才会被标记。

## 让声音对齐屏幕上的事件

```html
<audio
  id="sfx-click-3"
  src="click.mp3"
  data-start="7.48"
  data-duration="0.07"
  data-track-index="103"
  data-volume="0.85"
></audio>
```

Timeline 算式：根 composition 里的音频元素，其 `data-start` 使用根的绝对时间；场景文件里的音频使用场景局部时间，宿主的 `data-start` 会自动替你加上。sub-composition 内部的事件发生在宿主的 `data-start` 加上该事件在这个 sub-composition 自己 timeline 中的局部时间，所以 `data-start = host start + local time`。只移动音频的 `data-start`；画面不要动。源素材算式：如果声音的瞬态不在文件的第一个采样点上，就从 `data-start` 里减去这段前导（或者用 `data-media-start` 把它修剪掉）。音频随动：没有任何东西把音频和画面关联起来，所以宿主每次重新计时之后都要重新推算。归属：`/hyperframes-core`。局限：没有基于波形的自动同步；要用节拍网格，就用 `hyperframes beats`，把每个起点放在一个节拍时间上。

## 把一组 clip 复制到另一个时间

```html
<audio
  id="sfx-click-0"
  src="click.mp3"
  data-start="1.6"
  data-duration="0.07"
  data-track-index="100"
></audio>
<audio
  id="sfx-type-0"
  src="typenew.mp3"
  data-start="7.8"
  data-duration="0.57"
  data-track-index="109"
></audio>
<audio
  id="sfx-click-0-copy"
  src="click.mp3"
  data-start="41.6"
  data-duration="0.07"
  data-track-index="186"
></audio>
<audio
  id="sfx-type-0-copy"
  src="typenew.mp3"
  data-start="47.8"
  data-duration="0.57"
  data-track-index="187"
></audio>
```

Timeline 算式：先选出 clip，如果请求和文件对不上，就说明你选了哪些（按 id）；然后给每个成员的 `data-start` 加上同一个 `delta`，这样相对间距得以保留（这里 `delta = 40`）。给每个副本一个新的唯一 `id` 和下一个未使用的 `data-track-index`；`src`、`data-duration`、`data-media-start`、`data-volume` 以及任何 `data-automation` 保持原样。原件不要动。检查副本是否仍在 composition 的时长内结束。归属：`/hyperframes-core`。局限：`<video>` 或 sub-composition 宿主的副本遵循同样的规则，被复制的 sub-composition 需要它自己的宿主 `id`。

## 添加媒体（图片、视频、音频）

写出和人在 timeline 上拖放文件时 Studio 所写的一样的内容，这样 agent 添加的 clip 就和拖放进来的表现一致；唯一的区别是视频和音频不需要 `data-duration`。Studio 的事实来源是 `packages/studio/src/utils/studioHelpers.ts` 里的 `DEFAULT_TIMELINE_ASSET_DURATION` 和 `packages/studio/src/utils/timelineAssetDrop.ts` 里的 `buildTimelineAssetInsertHtml`；有一个测试保证本节与它们保持一致。

- **图片：`data-duration` 可选，默认 3 秒**，和拖放进来的图片一样，因为静图没有自己的长度。只有要别的长度时才写它。有一个测试保证这个 3 与代码里的默认值一致。
- **视频和音频：有 `data-start` 就够了。** 长度来自媒体本身。编写的 `data-duration` 若短于文件，就是一次修剪，绝不是必填项；除非请求要求更短的 clip，否则不要写它。
- **起点：用播放头或请求的时间，绝不要悄悄写成 `0`。** Studio 素材面板里的 Add 使用播放头时间，放在 track `0` 上；拖放则使用拖放点。
- 给每个 clip 写上 `id`、`class="clip"`、`data-start` 和 `data-track-index`。有声视频用 `playsinline data-has-audio="true"`；无声素材画面和 b-roll 用 `muted playsinline`。音频带上 `data-volume="1"`。
- 然后确保根 composition 的 `data-duration` 至少等于该 clip 的结束时间（`data-start` 加上它的长度：图片是 3，除非你设了别的值；视频和音频是媒体自身的长度）：Studio 会把声明的根时长调大以覆盖新 clip，所以 agent 也必须这样做，否则 clip 会落在结尾之后，永远不会播放。
- **图片和视频铺满整个画面**：绝对定位在 `left: 0; top: 0`，`width` 和 `height` 等于 composition 的 `data-width` 和 `data-height`，`object-fit: contain`。Studio 不知道拖放文件的原始尺寸，所以不会把较小的文件居中。
- `z-index` 等于该文件里已有的顶层 clip 数量加一（至少为 `1`）；后加的 clip 叠在先加的上面。
- 一起拖放的多个文件共享拖放所在的 track，首尾相接地依次播放。

```html
<img
  id="photo"
  class="clip"
  src="assets/photo.png"
  data-start="4"
  data-track-index="1"
  style="position: absolute; left: 0px; top: 0px; width: 1920px; height: 1080px; object-fit: contain; z-index: 2"
/>
```

```html
<video
  id="broll"
  class="clip"
  src="assets/broll.mp4"
  data-start="4"
  data-track-index="2"
  muted
  playsinline
  style="position: absolute; left: 0px; top: 0px; width: 1920px; height: 1080px; object-fit: contain; z-index: 3"
></video>
```

```html
<audio
  id="whoosh"
  class="clip"
  src="assets/whoosh.mp3"
  data-start="4"
  data-track-index="3"
  data-volume="1"
></audio>
```

在 sub-composition 文件内部，`data-start` 是场景局部的（见 `## Align a sound to an on-screen event`）。归属：`/hyperframes-core`。

## 替换媒体文件

```html
<video
  id="hero"
  src="assets/product-v2.mp4"
  data-start="2"
  data-duration="4"
  data-media-start="0"
  data-track-index="0"
  playsinline
  data-has-audio="true"
></video>
```

Timeline 算式：只改 `src`。源素材算式：把 `data-media-start` 重设为你想要的、在**新**文件中的偏移，并把 `data-duration` 设为不超过新文件的剩余长度（用 `ffprobe` 探测）。音频随动：声音跟着视频 clip 走；原先指向旧文件的单独 `<audio>`（音乐、旁白）需要单独替换它自己的 `src`。保留 `id`、`data-start`、`data-track-index` 以及任何 `data-automation`，这样其他东西都不会移动。运行 `lint`：`audio_src_not_found` 和 `media_src_kind_mismatch` 会抓出错误的路径或类型。归属：`/hyperframes-core`。局限：把静图换成视频（或反过来）是换标签，不是替换。

## 拆分一个段落并改变其速度

Timeline 算式：一个作为 sub-composition 或一组 clip 的段落，没有可供设置的自身 `data-playback-rate`；拆分它的办法是给每一半各自的宿主或 clip，并把切点之后的一切按长度变化量平移。某部分的新长度 = 旧长度 / 速率。之后的每个 `data-start`（clip、音频、根 timeline 上的 tween）都移动同样的 delta。源素材算式：`<video>` 和 `<audio>` 部分按上面的恒定速度配方使用 `data-playback-rate`（0.1 到 10，恒定），声音跟着视频走。变速坡道（在一个 clip 内变化的速率）是 `<video>`/`<audio>` 上 `data-automation` 里的一条 `rate` 通道；见 `docs/reference/speed-ramps`。说明你用的是哪一种。
