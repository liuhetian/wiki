<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/sequencing.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Sequencing 翻译：Sequence、Series、Composition 根

Remotion 嵌套的 `Sequence` 树如何映射为根里每个场景一个 sub-composition 宿主，每个宿主都有自己按本地时间计时的暂停 GSAP timeline。

## 核心思路

Remotion 的 `<Sequence from={F} durationInFrames={D}>` 是一个坐标变换：它把 `useCurrentFrame()` 平移 `F`，并把子组件裁剪到窗口 `[F, F+D]` 内。HF 没有每个元素各自的"当前帧" —— 只有一个 composition 级的 seek 时间，runtime 根据元素的 `data-start` / `data-duration` 来隐藏或显示它们。

结果：嵌套的树被拍平成同一个父元素下的一串场景宿主，每个都有自己的时间窗口；每个场景的内容放在它自己的 sub-composition 文件里。

## `<Composition>` → 根 `#stage`

```tsx
<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={300}
  fps={30}
  width={1280}
  height={720}
/>
```

```html
<div
  id="stage"
  data-composition-id="MyVideo"
  data-start="0"
  data-duration="10"      <!-- 300/30 -->
  data-fps="30"
  data-width="1280"
  data-height="720"
>
  <!-- composition content -->
</div>
```

`#stage` 上必须有 `data-start="0"`（runtime 需要用它来锚定播放；缺了会触发一条 lint 警告）。

## `<AbsoluteFill>` → 定位好的 div

```tsx
<AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>...children...</AbsoluteFill>
```

```html
<div style="position:absolute;inset:0;background-color:#0a0a0a;">...children...</div>
```

`AbsoluteFill` 在 Remotion 里只是一个带样式的 div。翻译成一个带 `position:absolute; inset:0` 的 div，并把其他样式 props 原样带过来。

## `<Sequence>` → sub-composition 宿主

```tsx
<Sequence from={0} durationInFrames={90}>
  <TitleCard />
</Sequence>
```

根 `#stage` 里只放每个场景的宿主；场景的标记、样式和 timeline 都放在它自己的 sub-composition 文件里，这样 Studio 的 timeline 上每个场景占一行、清晰可读，lint 也没有嵌套结构可报。

```html
<!-- index.html -->
<div
  id="scene-1"
  class="clip"
  data-composition-id="scene-1"
  data-composition-src="compositions/scene-1.html"
  data-start="0"
  data-duration="3"
  data-track-index="0"
></div>
```

```html
<!-- compositions/scene-1.html: TitleCard children inlined, timeline keyed "scene-1", local time starts at 0 -->
<template id="scene-1-template">
  <div data-composition-id="scene-1" data-width="1280" data-height="720" data-duration="3">
    <!-- TitleCard children -->
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["scene-1"] = tl;
    </script>
  </div>
</template>
```

把帧换算成秒：`from/fps`、`durationInFrames/fps`。为每个并行的渲染层选一个 `data-track-index`（背景 = 0，overlay = 1，音频 = 2，等等）。前后相继的场景可以共用同一个 index。在 sub-composition 内部，时间是本地的：一个在根里从 `F/fps` 开始的 tween，在这里从 `0` 开始。素材路径相对于 sub-composition 文件（`../assets/x.png`）。

## 嵌套的 `<Sequence>` 会被拍平

Remotion 在 sequence 嵌套时会把偏移累加起来：

```tsx
<Sequence from={60} durationInFrames={120}>
  <Sequence from={30} durationInFrames={60}>
    <ImageScene />
  </Sequence>
</Sequence>
```

内层 sequence 的实际窗口是 `[60+30, 60+30+60] = [90, 150]`。

翻译时先算出总和，输出一个带有求得窗口的宿主；场景的子元素放进它的 sub-composition 文件：

```html
<div
  data-composition-id="image-scene"
  data-composition-src="compositions/image-scene.html"
  data-start="3"
  data-duration="2"
  data-track-index="0"
></div>
```

## `<Series>` → 偏移依次递增的同级元素

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <A />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120}>
    <B />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <C />
  </Series.Sequence>
</Series>
```

每个 `Sequence.Sequence` 占据下一个时间槽。输出一组同级元素，`data-start` 逐个累加（每个宿主挂载自己的场景文件）：

```html
<div
  data-composition-id="a"
  data-composition-src="compositions/a.html"
  data-start="0"
  data-duration="2"
  data-track-index="0"
></div>
<div
  data-composition-id="b"
  data-composition-src="compositions/b.html"
  data-start="2"
  data-duration="4"
  data-track-index="0"
></div>
<div
  data-composition-id="c"
  data-composition-src="compositions/c.html"
  data-start="6"
  data-duration="3"
  data-track-index="0"
></div>
```

## 场景边界的交叉淡化

Remotion 的 `<Sequence>` 默认在硬边界处显示 / 隐藏。HF 也一样 —— 但如果你的 composition 需要在场景之间平滑淡化，就必须在边界处用 GSAP 显式驱动 opacity。一个场景可以在自己的本地结束时间点用 `gsap.set` 把自己硬切掉（语料库的 fixture 就是这么做的）。两个场景之间的淡化则要从根 timeline 作用在场景宿主上，因为一个场景自己的 timeline 只能看到它自己的文件：

```js
const tl = gsap.timeline({ paused: true });
tl.set(scene1, { opacity: 1 }, 0);
tl.set(scene1, { opacity: 0 }, 2); // hard cut at 2s
tl.set(scene2, { opacity: 1 }, 2);
```

做 0.5 秒的交叉淡化：

```js
tl.to(scene1, { opacity: 0, duration: 0.5 }, 1.5);
tl.to(scene2, { opacity: 1, duration: 0.5 }, 1.5);
```

Remotion `<TransitionSeries>` 的翻译见 [transitions.md](transitions.md)。

## `<Loop>`

```tsx
<Loop durationInFrames={30}>
  <Spinner />
</Loop>
```

HF 没有 `<Loop>` 原语。用它插入点处可用的时间，把它翻译成一条有界的 GSAP timeline：

```js
const cycleDuration = 1;
const availableDuration = compositionDuration - 3;
const repeat = Math.max(0, Math.floor(availableDuration / cycleDuration) - 1);
const spinTl = gsap.timeline({ paused: true, repeat, repeatRefresh: false });
spinTl.to(spinner, { rotate: 360, duration: 1.0, ease: "none" });
// Embed in the main composition timeline at the right offset:
mainTl.add(spinTl, 3);
```

这种做法很脆弱 —— Remotion 的 `<Loop>` 每次迭代都会重置内部状态，GSAP 的 repeat 也会这样做，但如果被循环的子元素有自己的动画，你就得小心地按需打开或关闭 GSAP 的 `repeatRefresh`。必须使用有限的次数，因为 HyperFrames 是逐帧 seek 一个有界的 composition。

## `<Freeze>`

```tsx
<Freeze frame={30}>
  <Animated />
</Freeze>
```

去掉这层包装。`<Freeze>` 会为子元素把 `useCurrentFrame()` 钉在一个常数上 —— 但在 HF 中，子元素的动画本来就由显式的 GSAP tween 驱动，所以 freeze 翻译过来就是"不给这个元素做 tween"。

## 多条并行的 track

当背景视频 + overlay 文字 + 音频同时播放时，使用各不相同的 `data-track-index` 值：

```html
<div data-track-index="0">background video</div>
<div data-track-index="1">overlay text</div>
<audio data-track-index="2" ...></audio>
```

runtime 根据 index 确定 track 的顺序。媒体相关的 track 约定见 [media.md](media.md)。
