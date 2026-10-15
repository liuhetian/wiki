<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/media.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 媒体翻译：Audio、Video、Img、IFrame、staticFile

## 素材路径

Remotion 的 `staticFile("x.png")` 解析到项目的 `public/` 目录。HF 使用相对于 composition 的 `index.html` 的路径，按惯例放在 `assets/` 下：

```tsx
<Img src={staticFile("logo.png")} />
```

```html
<img src="assets/logo.png" />
```

翻译时，把素材从 `remotion-src/public/x` 复制到 `hf-src/assets/x`。多个文件可以用一个 setup 脚本批量处理；示例模式见 T2 的 `setup.sh`。

## `<Audio>`

```tsx
<Audio src={staticFile("music.wav")} volume={0.5} />
```

```html
<audio
  data-start="0"
  data-duration="6"
  data-track-index="2"
  data-volume="0.5"
  src="assets/music.wav"
></audio>
```

`data-start` 和 `data-duration` 是必需的 —— runtime 需要用它们来调度音频。如果 Remotion 没有指定裁剪，默认使用 composition 的完整时长。

### 音量渐变

```tsx
<Audio src={staticFile("music.wav")} volume={(f) => interpolate(f, [0, 30], [0, 1])} />
```

音量渐变变成 `<audio>` 上的一条 `data-automation` 音量自动化通道（lane）（写法见 `hyperframes-core/references/creator-editing-recipes.md`）；`data-volume` 是静态的基线。

### 裁剪 / playbackRate

```tsx
<Audio src={staticFile("music.wav")} startFrom={60} endAt={180} playbackRate={1.5} />
```

```html
<audio
  data-start="0"
  data-duration="<resolved from trim>"
  data-trim-start="2"
  data-trim-end="6"
  data-playback-rate="1.5"
  src="assets/music.wav"
></audio>
```

`startFrom` / `endAt` 是帧索引；要换算成秒。

## `<Video>` 和 `<OffthreadVideo>`

```tsx
<Video src={staticFile("intro.mp4")} playsInline />
<OffthreadVideo src={staticFile("intro.mp4")} />
```

```html
<!-- intro.mp4 has an audio stream -->
<video
  playsinline
  data-has-audio="true"
  data-start="0"
  data-duration="5"
  data-track-index="0"
  src="assets/intro.mp4"
></video>

<!-- intro.mp4 is silent (or the Remotion element is muted) -->
<video
  playsinline
  muted
  data-start="0"
  data-duration="5"
  data-track-index="0"
  src="assets/intro.mp4"
></video>
```

`<OffthreadVideo>` 是 Remotion 专门为无头渲染做的优化。HF 本来就运行在 headless Chrome 中，所以 off-thread 变体就退化成一个普通的 `<video>`。

runtime 要自动播放，就必须有 `playsinline`（浏览器策略）；始终输出它。先检查源文件有没有音频流：`ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 <file>`（输出非空即表示有音频）。只有当文件带音频流、且 Remotion 源码没有设置 `muted` 或 `volume={0}` 时，Remotion 的 `<Video>` 才映射为 `<video playsinline>` + `data-has-audio="true"`；否则输出 `muted`。给无声的 b-roll 加上 `data-has-audio="true"` 会让渲染中止（`ASSET_MEDIA_TYPE_MISMATCH`）。

## `<Img>`

```tsx
<Img src={staticFile("logo.png")} style={{ width: 200, height: 200 }} />
```

```html
<img src="assets/logo.png" style="width: 200px; height: 200px;" />
```

宽 / 高会被取整为整数 px。如果原始样式中尺寸是带动画的，就由 GSAP tween 来给它们做动画 —— 见 [timing.md](timing.md)。

## `<IFrame>`

```tsx
<IFrame src="https://example.com" />
```

```html
<iframe src="https://example.com"></iframe>
```

当 HF 在 composition 中检测到嵌套的 iframe 时，会自动回退到**截图模式**，而不是确定性的 BeginFrame 模式。这会牺牲渲染性能，但能产出视觉上正确的输出。详情见 [hyperframes-vs-remotion.mdx](https://github.com/heygen-com/hyperframes/blob/main/docs/guides/hyperframes-vs-remotion.mdx)。

## `delayRender()` / `continueRender()`

```tsx
const handle = delayRender();
useEffect(() => {
  loadAsset().then(() => continueRender(handle));
}, []);
```

去掉。HF 通过 [Frame Adapter 模式](https://hyperframes.heygen.com/concepts/frame-adapters) 等待素材就绪 —— 图片、视频、字体和 Lottie 动画都会原生地发出加载完成的信号。在应用层面无需做任何事。

## 素材不是文件时

如果 Remotion 的媒体来源是 Buffer、dataURL 或 URL.createObjectURL，那么这个素材在磁盘上并不存在，无法通过 setup.sh 复制。有两种选择：

1. 在翻译时把素材落地 —— 把 buffer 写成 `hf-src/assets/` 中的一个文件。
2. 对于小素材（< 100 KB），以 data URL 的形式直接嵌入 HTML（`src="data:image/png;base64,..."`）。

对于音频 / 视频的 Buffer，优先选择第 1 种 —— base64 编码的媒体会让 HTML 膨胀，并拖慢渲染器。
