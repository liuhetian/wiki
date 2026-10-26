# 背景移除

制作一个透明的 overlay（典型场景：把一个口播人物叠在任意画面上）。使用 `u2net_human_seg`（Apache-2.0）。

```bash
npx hyperframes remove-background subject.mp4 -o transparent.webm          # default: VP9 + alpha
npx hyperframes remove-background subject.mp4 -o transparent.mov           # ProRes 4444 (editing)
npx hyperframes remove-background portrait.jpg -o cutout.png               # single-image cutout
npx hyperframes remove-background subject.mp4 -o subject.webm \
  --background-output plate.webm                                           # both layers, one pass
npx hyperframes remove-background subject.mp4 -o transparent.webm --device cpu
npx hyperframes remove-background --info                                   # detected providers
```

## 输出格式

- **`.webm`（VP9 alpha）** —— 默认。直接放进 `<video>`，即可在 Chrome 中原生透明播放（1080p 下约 1 MB / 4 秒）。
- **`.mov`（ProRes 4444）** —— 用于在剪辑软件（Premiere / Resolve / DaVinci）中往返编辑。约 50 MB / 4 秒。
- **`.png`** —— 单张图片的 cutout。

## 质量（`--quality`）

只控制 VP9 编码器的 CRF——分割质量是固定的。质量越高，cutout 的 RGB 就越接近源 MP4（当把 cutout 叠在它自己的源上时，这一点很重要）。

| Preset     | CRF | 何时用 |
| ---------- | --- | --------------------------------------------- |
| `fast`     | 30  | 迭代阶段，文件更小，颜色匹配较松 |
| `balanced` | 18  | **默认**；对大多数用途而言视觉上无差别 |
| `best`     | 12  | 母版 / 最终交付，颜色匹配最紧 |

## 设备（`--device`）

`auto`（默认）在 Apple Silicon 上选 CoreML，有 CUDA 时选 CUDA，否则用 CPU。用 `--device cpu | coreml | cuda` 强制指定。CUDA 需要 `HYPERFRAMES_CUDA=1`，外加一个启用了 GPU 的 `onnxruntime-node` 构建。用 `--info` 可以在不渲染的情况下查看检测到的 provider。

## 合成模式——选对那一种

cutout 的 WebM 是对源 MP4 的 RGB 的一份**重新编码的副本**。它后面放的是什么很关键。

| 模式 | cutout 后面是什么 | 结果 |
| -------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **cutout 叠在另一个场景上**（最常见） | 静态图片、渐变、无关的视频 | 效果很好。主体只有一个 RGB 来源。 |
| **cutout 叠在它自己的源 mp4 上**（文字在主体后面） | 产出这个 cutout 的同一个 mp4 | 用 `balanced` 时重影几乎看不出来；用 `fast` 时会看到偏色 / 边缘光晕。母版用 `best`。 |
| **cutout 叠在同一个人的另一条素材上** | 同一个主体的素材画面 | **会出现两个重叠的人。不要这么做。** |

## 文字在主体后面的模式（两条不显而易见的规则）

把一个大标题放在主讲人 cutout 的后面：

```html
<video
  src="presenter.mp4"
  id="bg"
  data-start="0"
  data-duration="6"
  data-track-index="0"
  muted
  playsinline
></video>

<h1 id="headline" style="z-index:2; ...">MAKE IT IN HYPERFRAMES</h1>

<div class="cutout-wrap" style="position:absolute; inset:0; z-index:3; opacity:0">
  <video
    src="presenter.webm"
    data-start="0"
    data-duration="6"
    data-track-index="1"
    muted
    playsinline
  ></video>
</div>
```

```js
// Flip the wrapper's opacity at the cut, NOT the video's
tl.set(".cutout-wrap", { opacity: 1 }, 3.3);
```

两条容易漏掉的规则：

1. **把 cutout 的 `<video>` 包进一个不带时间属性的 `<div>`，对这个包裹层的 opacity 做动画，而不是对 video 元素的。** 框架会对活动的 clip（任何带 `data-start` / `data-duration` 的元素）强制设置 `opacity: 1`，所以直接对 video 的 opacity 做动画会被悄悄覆盖。包裹层没有 `data-*` 属性，所以它归你的 CSS / GSAP 管。
2. **两个视频都使用 `data-start="0"` 和 `data-media-start="0"`**，这样框架会从 t=0 开始同步解码它们。晚挂载 cutout（`data-start=3.3`）会引入一次 seek + 预热，结果会和底层 mp4 差一帧——在切点处表现为一帧的错位。

## 图层分离（`--background-output`）

在 cutout 之外再输出**第二个**透明视频：源 RGB 相同，alpha 是 `255 - mask` 而不是 `mask`。cutout 中主体不透明；背景板（plate）中周围环境不透明（主体原来所在的位置是一个透明的洞）。当文字 / 图形需要放在两层**之间**时使用它。

| 文件 | Alpha 是… | 用途 |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `-o subject.webm`                | mask——主体不透明，背景透明 | 前景层（顶层） |
| `--background-output plate.webm` | 反向 mask——周围环境不透明，主体透明 | 底层；把文字 / 图形放在它和主体之间 |

两者共用同一个 `--quality`，并且来自同一次推理——只有编码成本大约翻倍。只对视频输入、且输出为 `.webm` / `.mov` 时有效。

**是挖洞，不是修补填充（inpaint）。** `plate.webm` 中的主体区域是完全透明的——要在它下面合成一些不透明的东西来填上这个洞。

**判断 `--background-output` 是不是合适工具的唯一测试：** *在主体原来所在的位置，透过主体的轮廓，会不会看到任何东西？* 如果不会，你就不需要 plate——单独把 `subject.webm` 叠在另一个背景上就够了。

### 用途 → 合适的工具

| 用途 | 合适的工具 |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 文字 / 图形放在 cutout 和 plate 之间（这个命令存在的理由） | **挖洞**（`--background-output`） |
| 把主体放到一个无关的场景上 | 只用 `subject.webm`；忽略 plate |
| 展示*没有*人物的房间，单独呈现、上面不叠任何其他内容 | **干净背景板（clean plate）**——需要一个 inpaint 工具（LaMa、ProPainter、E2FGVI）。不是这个命令。 |
| 把主体替换成另一个主体 | **干净背景板（clean plate）**——同上 |

### 标准三层模板（plate + 内容 + cutout）

只交付两个透明图层，让任意内容放在它们之间——不需要原始 mp4：

```html
<!-- z=1 plate: surroundings opaque, subject silhouette transparent -->
<video
  src="plate.webm"
  data-start="0"
  data-duration="6"
  data-track-index="0"
  muted
  playsinline
></video>

<!-- z=2 your content lives between the layers -->
<h1 id="headline" style="z-index:2; ...">MAKE IT IN HYPERFRAMES</h1>

<!-- z=3 cutout floats the subject back on top -->
<div class="cutout-wrap" style="position:absolute; inset:0; z-index:3">
  <video
    src="subject.webm"
    data-start="0"
    data-duration="6"
    data-track-index="1"
    muted
    playsinline
  ></video>
</div>
```

在功能上等同于上面"文字在主体后面"的模式，但不需要交付原始 mp4——plate 取代了它。当你要把这两个透明图层作为可复用的素材交付时，就用这种方式。

## `remove-background` 不适用的场景

如果用户要的是"**没有**人物的房间，单独展示"（画面里任何地方都没有主体，上面也不叠加任何东西），那 `--background-output` 就不对——它的 plate 上有一个透明的洞，而不是一块填补好的干净背景板。他们需要的是一个 **inpaint 工具**：LaMa、ProPainter 或 E2FGVI。告诉他们这个命令做不到。
