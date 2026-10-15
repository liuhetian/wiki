---
name: hyperframes-keyframes
description: >
  当 HyperFrames composition 需要推近（punch-in）、拉远（punch-out）、变焦、重新取景、Ken Burns 处理、镜头运动、视觉匹配切 / 甩镜交接，或其他 seek 安全的 2D/3D 关键帧时使用；也用于 GSAP、CSS keyframes、Anime.js、WAAPI、FLIP、路径、遮罩、SVG 变形 / 描画、文字拖尾、3D 纵深，或 `hyperframes keyframes` 诊断。
  不要用于宏观的场景策略、品牌设计、媒体获取、字幕或一般性的视频规划。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-keyframes/SKILL.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新类命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

# HyperFrames 关键帧（Keyframes）

关键帧是一份姿态契约：可见的状态、连续的主体身份、seek 安全的 runtime、经过验证的像素。

宏观的场景配方用 `hyperframes-animation`。完整的命令文档用 `hyperframes-cli`。只有在选择实现机制（而不是视觉风格）时，才用 `references/keyframe-patterns.md`。

## 创作者剪辑的边界

关键帧掌管的是视觉运动，不是 clip 的拼装。按源区间做的硬切、修剪、拼接和重排归 `/hyperframes-core`：每个保留的区间写一个媒体元素，用 `data-start` 和 `data-duration` 放置它，再用 `data-media-start` 选定它的源偏移。相邻的区间就构成一个硬切。交叉淡化用放在不同 track 上相互重叠的 clip，加上视觉层面的不透明度关键帧；声音的淡入淡出用 `/hyperframes-audio`。

| 创作者的请求                         | 如实的实现机制                                                                                                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 推近 / 拉远（Punch-in / punch-out）                    | 在 clip 内部一个不带计时属性的视觉 / 裁切包裹层上，对 `scale` 配合 `x`/`y` 或百分比位移做关键帧。生硬的推近用 set / 很短的 tween，平滑的运动用 tween。                                           |
| 平滑的多状态变焦或重新取景      | 让同一个主体包裹层始终存活，把多个变焦 / 重新取景的状态写成一个姿态阶梯，每一段各有 easing。                                                                                                            |
| 平移、重新取景或 Ken Burns 镜头运动  | 对包裹层的位移加缩放做动画。几何是人工编写的；这不是人脸追踪，也不是自动的语义化重新取景。                                                                                                    |
| 连续的多段镜头运动                    | 在一条已注册的、seek 安全的 timeline 上，把带 label 的 transform 拍子串起来。                                                                                                                                                         |
| 匹配切或甩镜                   | 视觉交接归 `/hyperframes-animation`；基元由 `/hyperframes-registry` 提供；关键帧负责保持人工编写的几何、方向和速度。没有自动寻找匹配帧的功能。               |
| 裁切和遮罩式重新取景                   | 在内层视觉包裹层上对 `clip-path` 或遮罩做插值，在不改变源时间的情况下裁切 / 重新取景。多边形关键帧可以构成多边形 / 遮罩转场。                                                            |
| 方向性擦除切或光圈 / 揭示切 | 让遮罩 / 裁切边界在相互重叠的视觉 clip 上移动；交接编排归 `/hyperframes-animation`。                                                                                                       |
| 分屏交接                    | 两个视觉 clip 都保持由 core 放置，然后对它们的内层裁切 / 遮罩包裹层以及分隔线几何做关键帧。                                                                                                                   |
| 恒定的源变速                  | `/hyperframes-core` 掌管归一化的 `data-playback-rate`（`0.1..10`），用于渲染安全的画面和保持音高的声音。它对整个媒体元素是恒定的。                                                         |
| 源速度渐变（speed ramp）                      | 在 `<video>`/`<audio>` 上的 `data-automation` 里加一条 `rate` 轨道（`t` 以 clip 秒为单位，`v` 取 0.1..10，对数插值）；它优先于恒定速率。                                                                        |
| 定格 / 停住                           | 一个视觉姿态、源的最后一帧，或者一个已经播完的 sub-composition 可以停住。不支持在源中间任意定格；要预先处理出一张静帧 / 派生片段，把它作为单独的 clip 放置，然后用另一个源区间接着播放。 |

同时剪辑画面和声音时，加载 `/hyperframes-core`，视觉运动用本 skill，淡入淡出、交叉淡化、音量自动化、闪避 / 挖空或已放置 track 上的效果则用 `/hyperframes-audio`。

视觉转场或裁切处理不是对源的时间修剪或拼接。timeline、clip 计时和源区间归 `/hyperframes-core` 掌管；关键帧只对这些 clip 内部包裹层上可见的交接或裁切做动画。可直接复制的画面 / 声音组合配方，见 `/hyperframes-core` → `references/creator-editing-recipes.md`。

## 流程

1. 确定要做动画的主体、可见的状态、最终状态以及 runtime。
2. 选择能证明 prompt 的最小机制。只有在机制不明确时才读 `references/keyframe-patterns.md`。
3. 在声明的 runtime 里编写 seek 安全的关键帧。只在构建完成之后才注册 runtime 实例；在 `document.fonts.ready` 里构建是可以的。
4. 用 `hyperframes check`（它会运行 lint）、`hyperframes keyframes`、一次聚焦的 `--shot`，以及在证明时间点的 snapshot 来验证。
5. 如果证明失败，修改源关键帧，并在渲染之前重新运行最小的那个失败诊断。

## 契约

- 说出运动的主体。
- 说出证明预期运动所需的各个姿态，包括最终状态。
- 对可见的通道做关键帧，而不是隐藏的辅助状态。
- 连续性重要时，保持对象身份不变。
- 只有当预期的运动是替换或溶解时，才用交叉淡化。
- 可读的或有语义的状态要停留足够长，让人看得见。
- 最后一帧是动画的一部分，不是收尾清理。
- 除非被要求，否则不要复位到静止状态。
- 除非被要求，否则不要以黑屏结束。
- 如果是在编辑一个起步场景，保留它的版式、文案、素材、颜色和最终状态，除非被要求重新设计。

## Runtime 规则

GSAP：

- 在页面加载时或在 `document.fonts.ready` 里构建，并且只在构建完成之后注册
- 使用 `gsap.timeline({ paused: true })`
- 注册为 `window.__timelines[compositionId]`
- 注册表的键必须与 `data-composition-id` 一致
- 渲染关键的运动不要调用 `tl.play()`
- 重复次数保持有限

CSS keyframes：

- 有限的时长和迭代次数
- 确定性的延迟
- `animation-fill-mode: both`
- 计时归属于某个 clip 时，使用 `data-start`

Anime.js：

- 同步创建
- `autoplay: false`
- 有限的时长和循环次数
- 把每个实例都 push 到 `window.__hfAnime`

WAAPI：

- 有限的 `duration`
- `fill: "both"`
- 确定性的构建
- 文字层面的输出不会列出 WAAPI；用 `--shot`（它会 seek WAAPI）和 snapshot 来验证

渲染关键的运动绝不要使用：

- `Date.now()`
- `performance.now()`
- 未设种子的 `Math.random()`
- 悬停 / 滚动触发
- 计时器
- 在异步构建完成之前就注册的 timeline
- 未注册的 `requestAnimationFrame`
- 无限循环

## GSAP 骨架

```js
const root = document.querySelector("[data-composition-id]");
const compositionId = root.dataset.compositionId;
const tl = gsap.timeline({ paused: true });

tl.addLabel("state-a", 0);
tl.to(".subject", {
  keyframes: [
    { x: 0, opacity: 1, duration: 0.2 },
    { x: 120, opacity: 1, duration: 0.4, ease: "power2.out" },
    { x: 100, opacity: 1, duration: 0.2, ease: "power2.inOut" },
  ],
  ease: "none",
});

window.__timelines = window.__timelines || {};
window.__timelines[compositionId] = tl;
```

语义化的状态用 label。用位置参数，而不是链式延迟。之后作用于同一属性的 `from()`/`fromTo()` tween 要用 `immediateRender: false`。

## 关键帧的写法

- 数组关键帧：姿态阶梯，每一步各有时长 / ease。
- 百分比关键帧：一个 tween 内部的精确计时。
- 属性数组：紧凑的多停靠点变化。
- 每个停靠点各自带 easing 时，父级用 `ease: "none"`。
- 每一段都应该是同一种手感时，用 `easeEach`。

不要从示例里照抄数值距离或计时。要从实际 composition 的几何和时长推导出来。

对于在两个框之间移动的一个主体，优先用一个连续的 transform tween 或 FLIP。只有当观众应该感受到明显分开的拍子时，才把 `x/y/scale` 拆成多个带 easing 的关键帧；每一段都会改变速度，可能读起来像一下卡顿。

## 通道

优先用合成器 / 视觉通道：`x/y/z`、`xPercent/yPercent`、`scale`、`rotationX/Y/Z`、`skew`、`transformOrigin`、`svgOrigin`、`opacity`、`autoAlpha`、`clip-path`、遮罩、CSS 变量、SVG 路径 / dash 值、镜头 transform、shader uniform。

避免版式 / 生命周期通道：`top/left/right/bottom`、`width/height`、`margin/padding`、`display`、`visibility`、延迟创建 DOM、由辅助 overlay 来做主体运动。

要改变可见性，在已注册的可 seek GSAP timeline 上用 `autoAlpha`，或者在一个明确的边界上用零时长的 `tl.set()`。只作用于非 clip 元素或 clip 内部的包裹层；绝不作用于 `.clip` 本身。绝不对裸的 `visibility` 做有时长的 tween，也绝不对 `display` 做 tween。

## 机制选择

选择能证明 prompt 的最小机制：

| 需求                                  | 机制                                          |
| ------------------------------------- | -------------------------------------------------- |
| 同一个主体改变框或层级 | 共享元素 / FLIP                              |
| 主体沿一条可见的路线移动       | 路径移动                                        |
| 描边生长或描画                | 描边描画                                        |
| 一个形状变成另一个形状           | 形状插值                                |
| 揭示的边界是可见的            | 裁切、遮罩或 shader uniform                      |
| 许多项按顺序移动          | stagger / 按索引延迟                            |
| 文字本身在动                     | 按行、词、字符或条带细分         |
| 表面弯曲、拉伸或裁切    | 父 / 子反向 transform                     |
| UI 有多个状态                         | 显式的状态机                             |
| 场景有纵深                       | DOM 3D、Three.js 或 WebGL 的镜头 / 对象关键帧 |

机制可以组合，但每一种都必须让想法更清楚。装饰不是证明。

## 计时

- 只有当预备动作能讲清原因或方向时才用它。
- 加速离开静止。
- 峰值证明要毫不含糊地展示机制。
- 跟随动作（follow-through）传达能量和方向。
- 只有当主体应该显得有弹性或有触感时才过冲。
- 匀速的路径移动通常需要 `ease: "none"`。
- 离散的 UI 状态通常需要利落的 ease-out。
- 重复的元素需要有序的偏移，而不是完全相同的计时。
- 最终定版需要比转场姿态更长的停留。
- 流畅意味着同一主体上的速度连续。
- 不要让写同一个 transform 属性的 tween 相互重叠，除非这种重叠是有意的并且经过验证。
- 当同一个 hero 表面也在缩放或移动时，避免对大面积的 `clip-path`/遮罩变化做动画；在主运动稳定之后再用嵌套的揭示。

## 文字

保持行框、词间距、可读性和最终的适配。如果文字内部在动，要移动字形或被遮罩的条带，而不只是文字周围的装饰。对可读的帧做 snapshot。

## SVG

描边生长优先用 `DrawSVGPlugin`，其次用 `stroke-dasharray`/`stroke-dashoffset`。形状插值优先用 `MorphSVGPlugin`；需要时把基本图形转换成路径，并把复杂的剪影拆成更简单的部分。

## 3D

只有缩放是假纵深。在一个稳定的父元素上使用透视、`transform-style: preserve-3d`、z 方向移动、旋转、镜头 / 世界运动、遮挡，以及对象交叉时的图层顺序。

用一两个能暴露纵深关系的诊断角度。如果倾斜角度的证明没有显示出纵深上的交叉，就改进 z / 镜头 / 遮挡。

## Canvas / WebGL

通过确定性的状态，对镜头位置、镜头目标、对象 transform、材质不透明度、shader uniform 和后处理强度做关键帧。按 HyperFrames 的时间渲染。使用 `--ghost`，因为标记框看不见 canvas 内部的运动。

## CLI 证明

```bash
npx hyperframes check
npx hyperframes keyframes .
npx hyperframes keyframes . --json
npx hyperframes keyframes . --runtime all
npx hyperframes keyframes . --selector "<selector>" --shot "<file>" --samples <n>
npx hyperframes keyframes . --selector "<selector>" --shot "<file>" --layout strip --from <t0> --to <t1>
npx hyperframes keyframes . --shot "<file>" --ghost --angle <angle>
npx hyperframes snapshot . --at <times>
```

`<selector>` 选真正在做动画的主体。`<times>` 选第一帧、各个证明姿态、最终减去停留时长的时刻，以及精确的最终时刻。只有在必须证明纵深时才选 `<angle>`。

| 工具             | 证明的内容                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `keyframes`      | 目标、显式停靠点、路径、轨迹、组合的父 / 子运动、CSS 停靠点、Anime 注册 |
| `--shot`         | 残影、路线形状、时间间隔、DOM 3D 投影、聚焦的选择器证明                        |
| `--layout strip` | 原地运动、重叠、接触、细微的缩放 / 不透明度、文字波浪                                |
| `--ghost`        | canvas、WebGL、shader 运动、渲染出的 3D                                                           |
| `snapshot --at`  | 遮罩、文字可读性、完整状态、最终定版、黑屏 / 复位的尾巴                                |

如果选择器证明看起来不对：

1. 重新运行 `--json`
2. 找到真正在做动画的目标
3. 对那个目标拍摄
4. 对完整的帧做 snapshot
5. 相信画出来的像素，而不是日志

## 诊断解读

`flat` 表示没有显式的中间姿态。`keyframes` 表示存在显式的停靠点。`motionPath` 表示存在一条路线。`trace` 表示多笔描画。`composed with` 表示子元素的运动继承了父元素的运动。

残影间距均匀表示匀速。残影聚集表示缓入或落定。间隔很大表示快速移动。

对辅助选择器的拍摄不是证明。叠在一个坏掉的完整帧上的洋葱皮拍摄也不是证明。

## 错误处理

| 失败            | 修复                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- |
| 只有端点      | 加上中间姿态，停住峰值证明，重新运行 `--shot`                                  |
| 身份断裂     | 让同一个元素始终存活，使用共享的起点 / 终点框，去掉替代性的交叉淡化 |
| 假 3D            | 加上 z / 镜头移动、遮挡、倾斜角度的证明                                      |
| 最终状态错误        | 加上最终停留，对最终减去停留时长的时刻和精确的最终时刻做 snapshot                          |
| runtime 无法 seek | 暂停自动播放，移除计时器，在构建完成之后注册实例     |
| 文字不可读    | 保持行框，减小位移，加上最终停留，对文字帧做 snapshot     |

## 完成

运行 `hyperframes check`（它会运行 lint）、`hyperframes keyframes`、一次聚焦的 `--shot`，以及 snapshot。确认第一帧、各个证明姿态、最终减去停留时长的时刻、精确的最终时刻、由主体自身承担的运动，并且没有调试 overlay。
