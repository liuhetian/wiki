<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/music-to-video/references/montage.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 素材处理方式 —— 把用户媒体编织到节拍主干上

当用户提供了图片 / 视频时，一个 group 可以是一种**素材处理方式**，而不是字体排印类的模板 / 自由组合。素材是**同一条节拍主干上的附加配料** —— 绝不是一条单独的流水线。字体排印 / 模板始终是底线：如果没有素材适合某个 group，就回退为模板 / 自由组合 group（一支完整的视频不需要任何素材）。

规划者（Step 3）挑选处理方式以及 clip + 锚点（做什么）；frame-worker 在 frame 文件里把它实现出来（怎么做）。**遵守该 frame 的 `pacing`。**

## 三种处理方式

### `beat_cut` —— 每个锚点一个 clip（只用于 `beat_cut` frame）

这是逐 onset 字体排印 group 的素材驱动版：在每个锚点（来自 audiomap 的、该 frame 的节拍 / onset）上切到一个新 clip。每个 clip 都是一个 `class="clip"` 元素（照片用 `<img>`，动态片段用**静音的** `<video>`），按照核心的 clip 契约，用 `data-start`/`data-duration`/`data-track-index` 放在它的锚点上。（静音是有意为之：声音由音乐曲目驱动。）在 clip 之间，把即将离场的内容交叉淡化到 `opacity:0`，**恰好**在下一个锚点处结束。在**强**锚点上切；让一个 hero clip 落在一个 `key_moment` / 重拍上。

### `ken_burns` —— 在一个 clip 上缓慢推进（适合 `phrase_flow` frame）

用于舒缓的 frame：一个 clip 在整个 span 上保持，同时做缓慢的缩放 / 平移推进（例如缩放 1.0→1.08 + 一点轻微漂移），缓动覆盖整个 `span_sec` —— 节奏跟随 frame，而不是节拍。没有硬切。在 frame 的边缘交叉淡入 / 淡出。当节拍网格不可靠时（舒缓的音乐），这就是正确的素材处理方式。

### `bg_under_text` —— 压暗的 clip 垫在模板 / 自由组合 group 后面

一个满出血的 clip 压暗约 30–50%，作为某个 group 的背景，而这个 group 的前景是模板或自由组合的字体排印处理。文字骑在同样的锚点上；clip 是底层。当用户希望自己的素材画面出现，但信息又必须保持可读时使用。

## 规则

- **`pacing` 决定处理方式**：`beat_cut` 只用于 `beat_cut` frame；在 `phrase_flow` frame 上用 `ken_burns` 或缓慢的交叉淡化 —— **绝不**在（不可靠的）舒缓网格上做逐 onset 硬切。
- **clip 是静音的；音频归根节点管。** 每个 `<video class="clip">` 都以**静音**方式挂载，作为 frame 根节点的直接子元素（绝不能嵌套在另一个有时间定位的元素里，否则渲染器会把它冻住）。在 v1 中，BGM 是唯一的音频。
- **交叉淡化对 `opacity`/`autoAlpha` 做动画**，绝不对 `.clip` 的 `visibility`/`display` 做动画（clip 的可见性归框架管 —— 那样会触发 `gsap_animates_clip_element`）。
- **背景压暗约 30–50%**，让任何前景文字都保持可读。
- 锚点是**来自 `audiomap.json` 的曲目秒数**；worker 会减去 frame 的起点，得到 frame 内的局部时间。
- 只用暂存到本地的素材（通过 `stage-assets.mjs` 放进 `assets/`）；绝不用远程 URL。

## 延后的钩子（不在 v1）

一个应该播放**它自己的声音**的 clip（采访片段、歌词片段）需要由组装器在**根节点**上挂一个兄弟 `<audio>`，并让 BGM 在它下面闪避（duck）（在 BGM 上加一条 `data-automation` 音量通道，见 `hyperframes-core` 里的 `creator-editing-recipes.md`）。frame-worker 不挂载任何音频。在 v1 中保持 clip 静音；只有当用户要求时，才接上 clip 音频 + 闪避。
