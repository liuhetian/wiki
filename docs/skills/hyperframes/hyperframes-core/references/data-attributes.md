<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/data-attributes.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Data 属性参考

每个 HyperFrames composition 都使用 `data-*` 属性向框架声明计时和结构。这里是完整的属性表 —— `data-track-index` 背后的规则请搭配 `tracks-and-clips.md` 阅读。

## Composition 根元素

每个可渲染的 composition 都需要一个根元素：

| 属性 | 必填 | 含义 |
| --- | --- | --- |
| `data-composition-id` | 是 | 唯一 ID。必须与 `window.__timelines` 上的动画注册表键一致。 |
| `data-width` / `data-height` | 是 | 以像素计的画面尺寸。常见值：`1920x1080`、`1080x1920`、`1080x1080`。 |
| `data-duration` | 视情况\* | 以秒计的渲染时长（总长度 / 帧数），不是 GSAP timeline 的长度。**和 `data-width` / `data-height` 一样，只在编译时读取一次**：静态的根 `data-duration` 在脚本运行前就被锁定，所以脚本（`root.setAttribute("data-duration", ...)`）或由 `--variables` 驱动的值都无法改变渲染时长。要让每次渲染的时长不同，就直接编写根元素的 `data-duration`。（clip 的 `data-duration` 则不同：它会从实时 DOM 重新读取，所以脚本 / 变量可以驱动它。）只有当根元素省略 `data-duration` 时，渲染器才会在脚本运行后从实时 DOM / timeline 推算总时长。 |
| `data-fps` | 否 | 可选的帧率提示。CLI 渲染参数可以覆盖输出的 fps。 |
| `data-composition-variables` | 否 | 变量声明组成的 JSON 数组（写在 `<html>` 上）。见 `variables-and-media.md`。 |

\*只要 runtime 能自动推断时长，`data-duration` 就是可选的：已注册的 GSAP timeline、有限的 CSS 动画、有限的 WAAPI `element.animate()`、已注册的 Lottie 动画，或者有计时的 clip（此时根元素在其最晚的 clip 结束时结束，lint 只会警告 `root_composition_duration_derived`）。对于 Three.js（无法自动推断）、无限 / 无边界的 CSS 或 WAAPI 动画，以及任何既没有 GSAP timeline、也没有动画信号、也没有带长度的计时 clip 的 composition，它是**必填的**。`npx hyperframes lint` 会强制检查这一点（`root_composition_missing_duration_source`）。各 runtime 的推断方式见 `hyperframes-animation/adapters/`。

根元素应当是 `position: relative`，有明确的像素尺寸，并隐藏溢出，除非是有意在画面之外进行合成。

## Clip 属性

**让一个元素成为 clip 的是 `data-start`。** runtime 会收集 `[data-start]`，并依据这个属性驱动可见性，所以任何带有它的元素都是有计时的。

`class="clip"` 是**惯例，不是必需**：runtime 从不读取它。还是要坚持写它：去掉它，全画幅的盒子就会塌陷，除非你自己提供那套布局；Studio 把它当作编辑提示；有计时的元素缺少它时，`lint` 会警告（`timed_element_missing_clip_class`）。在 `<video>` 和 `<audio>` 上省略它。

**允许嵌套。** 包裹层内有计时的元素仍然是有计时的，而有计时的祖先元素会限制它的后代：当有计时的祖先被隐藏时，子元素不可能可见。根元素的直接子元素会获得自动布局（见下文「根级 clip 会获得自动布局」）；嵌套的则不会，所以要给它们自己的定位。

| 属性 | 必填 | 含义 |
| --- | --- | --- |
| `id` | 在 `<video>`/`<audio>` 上必填，其他元素建议填写 | 对于没有 id 的媒体，`lint` 会报 `media_missing_id` error，而且没有 id 的 `<audio>` 永远不会被混音，于是渲染结果是**无声的**。在其他元素上则是警告（`studio_missing_editable_id`）：Studio 需要一个稳定的编辑目标，timeline 目标也会引用它。 |
| `data-start` | 是 | 以秒计的起始时间，或者一个受支持的 clip 时间引用。正是这个属性把元素标记为有计时的。 |
| `data-duration` | `div` 和 sub-composition 必填 | 以秒计的时长。带有 `data-start` 的 `img` 默认 3 秒；视频 / 音频一旦得知源素材长度，就默认取源素材长度（减去播放偏移，再除以速率）；编写的值会进行修剪。如果没有任何可解析的时长，该元素就没有终点，会在 composition 剩余的全部时间里保持可见。 |
| `data-track-index` | 否 | Studio timeline 的泳道，仅用于显示。渲染从不读取它，同一 track 上的 clip 可以在时间上重叠。缺省时，解析器会给它一个默认值，Studio 为每个 clip 排一条泳道。同一 index 上两个在时间上重叠的 `<audio>` 元素会引发 `lint` 警告。 |
| `data-media-start` | 否 | 媒体源内的偏移，以秒计。 |
| `data-volume` | 否 | 静态音频增益，默认 `1`（0 dB）。`0` 是静音，大于 `1` 的值会提升音量，最高到 `3.98`（+12 dB）—— Studio 的推子写的就是这个值。淡入淡出和闪避（duck）请使用 `data-automation` 的音量通道（见 `creator-editing-recipes.md`）。 |
| `data-has-audio` | 有计时的 `<video>` 必填，除非它是 `muted` | `"true"` 会把文件的声音保留在这个 clip 上（有声素材画面的默认做法）。无声素材画面改用 `muted`；两者都没有的视频会让 lint 失败（`video_missing_muted`）。 |
| `data-link` | 否 | 仅为编辑契约（渲染会忽略它）：共享同一 id 的 clip，例如一个视频和在 Studio 中从它分离出来的 `<audio>`，会被当作一个整体编辑。让每个成员的 `data-start`、`data-duration`、`data-media-start` 和 `data-playback-rate` 保持相等；要取消关联，就从所有成员上移除这个属性。见 [tracks-and-clips.md](tracks-and-clips.md#linked-clips)。 |
| `data-sync-origin` | 否 | 仅为编辑契约：来自同一源文件的视频和音频共享它（由 Detach 写入，对同一文件的配对也由 Link 写入；Unlink 会保留它）。当这一对的源素材零点不同时，Studio 会把它们标记为不同步。见 [tracks-and-clips.md](tracks-and-clips.md#linked-clips)。 |

**可见窗口是半开区间：`[start, start + duration)`。** clip 在 `start ≤ t < start + duration` 期间显示，恰好在 `t = start + duration` 时隐藏。让动画解析后的终止状态稍微落在 `data-duration` **之前**，而不是正好落在它上面，否则它的最后一帧永远不会被渲染。因此两个 clip 可以首尾相接地编写（`b.start === a.start + a.duration`），而不会有重叠的帧。

**根级 clip 会获得自动布局。** 对于 composition 根元素下带有 `data-start` 的直接子元素，runtime 会强制设置 `position: absolute`，并把它们锚定在 `top: 0; left: 0`，当它们没有计算出的尺寸时把尺寸设为 100%，这样各个场景就会叠在同一个 viewport 图层里。**没有** `data-start` 的元素会被完全跳过：一个无计时的铺满出血背景需要它自己的 `position: absolute; inset: 0`，否则它会塌陷为零高度。

## Sub-Composition 宿主属性

当一个 clip 是 sub-composition 宿主（加载另一个 composition 文件）时：

| 属性 | 必填 | 含义 |
| --- | --- | --- |
| `data-composition-id` | 建议 | 被加载文件的 composition ID。让它保持一致是惯例；宿主写了不同的 id，或者根本不写，也受支持，但会被静默解析。 |
| `data-composition-src` | 是 | sub-composition HTML 文件的路径。 |
| `data-width` / `data-height` | 否 | 该实例的渲染尺寸。缺省时，编译器会从被加载文件的根元素上回填它们。 |
| `data-variable-values` | 否 | 以 JSON 表示的每实例变量覆盖值。见 `variables-and-media.md`。 |
| `data-var-src` | 否 | 把元素的 `src` 绑定到一个已声明的变量 id（媒体 / 图片替换，编写的 src = 兜底值）。 |
| `data-var-text` | 否 | 把元素自身的文本绑定到一个标量变量 id；子元素会被保留。 |

完整的接线模式见 `sub-compositions.md`。

## 编写提示

- `id="root"` —— 脚手架和转场目录使用的模板惯例，这样 CSS 就能用 `#root` 而不是 `[data-composition-id="main"]` 来定位 composition 根元素。runtime 不要求它，但与生态中的其他部分保持一致。
- `class="clip"`：用于可见的有计时元素（`<div>`、`<img>`……）的布局和工具链惯例，不是 runtime 的要求。见上文的 Clip 属性。
- `data-root="true"`：显式指定 composition 根元素。没有它时，runtime 会选最外层的 `[data-composition-id]` 元素，这对几乎所有文件都是对的；当 composition 互相嵌套、你需要消除歧义时再设置它。
- `data-layout-allow-overflow` —— 告诉 `hyperframes check`：这个元素（或其后代）上的溢出是有意为之。说明：
  - `check` 的布局审查是在采样时间点上测量 `getBoundingClientRect`，而不是测量渲染出的像素。`overflow: hidden` 会裁掉视觉内容，但**不会**抑制布局发现项。这个属性才是逃生口；CSS 的 overflow 不是。
  - 既可以设在 composition **根元素**上，也可以设在任何子元素上。当被点名的违规者是 `div.<comp>-root inside div.<comp>-root`（根元素把它自己子元素的并集报告为溢出）时，修复要加在根元素上，而不是加在单个文本后代上 —— 缩小字号是收敛不了的。
  - 在多场景的 `group_wN.html`（continue 运行）里，每个场景局部的元素在其他场景的时间窗口内也都留在 DOM 中；在变形接缝期间，布局盒的并集几乎总会溢出画布。**在构建时**就给根元素以及每个场景局部的主要 / 辅助元素加上这个属性，而不是等 `check` 标记出来之后再加。
  - **波及范围 —— 它压制的不只是溢出审查。** 这个属性会沿子树向下继承（感知探针会遍历祖先元素），所以它也会为每个后代压制渲染感知检查 `text-clipping`、`content-cramped-container` 和 `foreground-over-panel`。把它放在一个同时承载真实前景内容的常驻面板上，就会在面板的整个生命周期内关闭对那些内容的碰撞检查。优先选用范围最窄的豁免：把它限定在最小的装饰性包裹层上，或者对某一处有意的主文字裁切使用逐元素的 `data-layout-bleed="true"`。两项画布 / 边缘检查 `primary-offscreen` 和 `foreground-over-panel` 被有意设计为**即使在** allow-overflow 下也会运行，所以它无法掩盖被画面边缘切断的字标，或渗到面板边缘上的文字。
- `data-layout-ignore` —— 把这个元素完全排除在布局审查之外。
- `data-layout-allow-caption-zone` —— 对有意放置的 lower-third 文案豁免 `--caption-zone` / `caption_zone_collision`（通过 `closest` 作用于该元素及其每一个后代；**不会**抑制溢出、重叠、遮挡或其他布局审查 —— 需要时请搭配那些属性一起用）。

## 旧版 / 已移除的属性

这些名字出现在较早的项目和示例里。编写或编辑时请使用当前的名字：

| 旧名字 | 改用 |
| --- | --- |
| `data-layer` | `data-track-index` |
| `data-end` | `data-duration` |
