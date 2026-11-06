---
description: "二维角色素材 · 给一段描述或一张参考图，出一套能动的二维角色素材；拆件绑定、矢量代码、逐帧画三条路线并排比，AI 做的 Spine 橘猫、照教程核对的大肥鱼 Live2D、一句话写出的 SVG 鹈鹕各看一条；拆层补画、绑定、变体各是一个方向"
---

# 二维角色生成（2D character generation）：给一段描述或一张参考图，出一套能动的二维角色素材

**二维角色生成的通用功能只有一件事：给一段描述或一张参考图，出一套运行库能直接驱动的二维角色素材。** 和图像生成的差别在「能动」：出的不是一张图，是部件、部件之间的关联和能调的参数。细分方向都是被新需求逼出来的：只有一张整图，要切成部件、补全被挡住的地方；部件要能动，要绑定；要一群各不相同，要参数化。术语按 Spine、Live2D 和 PSD2Live 文档的叫法 —— 拆层、补画、网格、权重、变形器。在[领域地图](../index.md#generation)上它在「内容生成」一组，处理对象是二维角色素材；素材做好以后怎么动，归[二维角色动画](../2d-character-animation/index.md)。

## 通用功能：一句描述，出一套部件和关联 { #basic }

- **输入**：一段描述、一张参考图，或者一张已经画好的整张立绘
- **输出**：运行库认得的素材 —— Spine 是图集加骨骼数据，Live2D 是分层 PSD 加 `.moc3` 和参数，矢量是一个 SVG 或 HTML 文件，逐帧是精灵图集
- **顺手处理的**：部件命名、绘制顺序、整体尺寸和原点
- **典型用途**：给游戏、聊天立绘、桌面伙伴、网页吉祥物做角色
- **管不了的**：让它动起来、切换动作、对嘴型，见[二维角色动画](../2d-character-animation/index.md)；整张立绘本身画得好不好，归图像生成

## 三条路线：拆件绑定、矢量代码、逐帧画 { #routes }

**三条路线的差别在「从哪一步开始」：先有一张画再切开，直接用代码写出形状，还是每一帧都画全。**

| 路线 | 思想 | 产出 | 成本落在哪 |
|---|---|---|---|
| 拆件绑定（Spine、Live2D） | 先有整图，再切成部件、补全遮挡，再在部件上打控制点 | 图集加骨骼数据；分层 PSD 加模型文件 | 拆图补画和绑定；画质就是原画的画质 |
| 矢量代码（SVG） | 形状本身就是代码，部件是路径，关节是分组 | 一个 SVG 或 HTML 文件 | 每个形状都写成坐标，靠看图迭代；只有平涂 |
| 逐帧画（sprite sheet） | 不拆结构，每个动作、每个方向的每一帧都画出来 | 精灵图集 | 帧数乘方向乘动作；生图逐帧出很难前后一致 |

=== "拆件绑定"

    **先切开，再打控制点。** Spine 打的是骨骼和网格顶点：一根骨骼管一片部件，网格顶点按权重跟着几根骨骼走。Live2D 打的是变形器和关键形：一个参数在几个取值上各存一个网格形态。两者都保住了原画的画质，代价是拆和绑都要做。

    下面的橘猫是 AI 先把参考图拆成部件、补画，再用代码生成 8 根骨骼、2 个加权网格和三段动画，交给 Spine 运行库播放：

    <video src="/posts/domains/2d-character-generation/assets/cat-spine.mp4"
           poster="/posts/domains/2d-character-generation/assets/cat-spine-poster.png"
           autoplay loop muted playsinline controls preload="metadata"
           style="display:block;width:100%;max-width:600px;margin:auto;border-radius:12px"></video>

    [切换动作、暂停或查看骨骼](assets/cat.html){ target="_blank" rel="noopener" }

    大肥鱼 Live2D 的制作流程见下面的[绑定](#rigging)，能拖参数的运行演示在[二维角色动画](../2d-character-animation/index.md#routes)。

=== "矢量代码"

    **形状本身就是代码。** 部件是路径和基本图形，关节是 `<g>` 分组，颜色是属性。整个角色是一段文本，AI 能从形状到动画一口气写出来，改数就是改形。鹈鹕是一句话 prompt 写出来的，没有一张图片：

    <iframe src="/gallery/animation/assets/pelican-bicycle.html"
            style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
            loading="lazy" title="鹈鹕骑自行车：纯 SVG 绘制、脚本驱动的二维动画"></iframe>

    演示、prompt 和完整源码收在 Gallery 的[鹈鹕骑自行车](../../../gallery/animation/pelican-bicycle.md)。场景里的树只画一次，用 `<use>` 摆满，整层再平铺两份做视差：

    ```html title="pelican-bicycle.html:195-206"
    --8<-- "gallery/animation/assets/pelican-bicycle.html:195:206"
    ```

    腿就是几条线段，端点留空，交给脚本每帧算：

    ```html title="pelican-bicycle.html:354-364"
    --8<-- "gallery/animation/assets/pelican-bicycle.html:354:364"
    ```

    边界也清楚：只有平涂和渐变，没有手绘质感；节点一多或用上滤镜，浏览器就卡。

=== "逐帧画"

    **不拆结构，直接画结果。** 每个动作、每个方向的每一帧都是一张完整的图，运行时只按时间选帧。省掉了拆和绑，代价是数量 —— 帧数乘方向乘动作，而且生图模型逐帧出图，角色很难前后一致。本站的例子在 Gallery 的 [3D 像素幸存者](../../../gallery/games/terrace-survivors.md#faq-sprites)：8 个方向乘 5 个动作的像素图集，用代码画出来，绕开了一致性问题。

## 细分方向：一个新需求，一个方向 { #needs }

### 只有一张整图：拆层与补画（layer separation、inpainting） { #layers }

**整图里被挡住的地方没画过，切开之前先补全。** See-through 分离部件、补全遮挡、推断绘制顺序，输出分层 PSD；它明说绑定不在范围内：

> "this rigging process is arguably the most critical and it is not covered in this project."[^see-through]

橘猫走的是另一条：用生图模型逐个拆出透明部件，检查时发现身体里重复画了一条前腿，重画成只有一只落地的前爪，抬起的那只单独成层。

!!! warning "拆图要给变形留余量"

    眼白、瞳孔、睫毛分别成层；嘴巴画出张开时的口腔；被头发或手臂遮住的部分补完整。少画一层，绑定时就没有东西可动。[^psd2live]

### 部件要能动：绑定（rigging） { #rigging }

**绑定就是决定「拖一个控制点，哪些像素跟着走、走多少」。** 三种做法：

| 做法 | 控制点是什么 | 能做到 | 例子 |
|---|---|---|---|
| 关节 | 分组或骨骼，部件整块跟着转 | 刚性的转和移；关节处靠部件互相盖住 | 鹈鹕的 `<g>`，Spine 不带网格的部件 |
| 网格权重 | 骨骼，部件切成三角网格，每个顶点按权重跟几根骨骼 | 拉伸、弯折，小幅转脸 | Spine 的加权网格，橘猫的 2 个网格 |
| 变形器加关键形 | 参数，每个取值存一个网格形态 | 连续的脸部角度、眼睛开合、嘴型 | Live2D，大肥鱼的 32 个参数 |

**Spine：代码直接写骨骼数据。** 骨骼、权重、关键帧都是 JSON 里的数，AI 能照着部件图写出来；橘猫就是这么做的，素材来源和转换见[来源记录](../2d-character-animation/assets/sources.json)。

**Live2D：See-through 拆层，PSD2Live 生成网格与绑定。** 大肥鱼的制作教程给的流程：

> 立绘 → 分层 PSD → 网格 → 绑定 → 动作物理 → 导出测试[^dafeiyu-tutorial]

| 阶段 | 工具与处理 | 得到什么 |
|---|---|---|
| 准备立绘 | 画或生成角色图，眼、嘴、耳朵、四肢结构要明确 | 完整参考图 |
| 拆层与补画 | See-through 分离部件、补全遮挡、推断绘制顺序；检查遗漏和破损 | 分层 PSD，还没绑定[^see-through] |
| 建立网格 | PSD2Live 识别图层语义，沿透明轮廓生成三角网格 | 能局部变形的 ArtMesh[^psd2live] |
| 绑定参数 | 建变形器层级，把眼睛开合、嘴巴张合、头部朝向关联到网格形态 | 参数及对应关键形[^psd2live] |
| 动作与物理 | 编排参数随时间的变化，给头发等部件加滞后摆动 | 动作曲线和物理配置[^psd2live] |
| 导出与检查 | 核对贴图、遮罩、形变和资源引用 | `.cmo3` 编辑工程，`.moc3`、`.model3.json`、贴图及动作文件[^psd2live] |

!!! warning "导出成功不等于形变正确"

    绑定后逐项检查：闭眼有没有残留瞳孔，张嘴有没有露底，转头时五官和头发有没有错位，再组合多个参数检查。命名识别成功、导出成功，都不能代替形变检查。[^psd2live]

大肥鱼案例公开了分层 `dafeiyu.psd`、可编辑的 `dafeiyu.cmo3` 和完整运行模型。本站核对了作者的 SHA-256 清单和模型包，用官方 Cubism Core 读出 32 个参数、35 个绘制部件，逐帧求值 11 个动作和 4 个表情；[文件核对记录](assets/dafeiyu-evidence.json)和[运行库验证结果](../2d-character-animation/assets/live2d-validation.json)留了范围和校验值。没有从原图重做生成流程。[^dafeiyu]

??? abstract "作者提供的制作阶段姿态对照"

    <figure markdown>

    ![大肥鱼参数姿态对照：手臂、耳朵与尾巴的变化](assets/dafeiyu-motion-poses.png){ loading=lazy }

    <figcaption>作者提供的制作阶段姿态对照：手臂关节、耳朵和尾巴的参数变化；不是本站运行截图。</figcaption>
    </figure>

### 要一群各不相同：参数与变体（parametric） { #variants }

**变体的成本取决于形状存在哪。** 矢量代码的形状就是数，改轮径、腿长、配色就是另一个角色。拆件绑定的形状存在图里，变体要换部件图，骨骼和绑定能沿用。逐帧画没有共用结构，每个变体都是一套新图。

## 怎么选 { #choose }

| 需求 | 优先考虑 |
|---|---|
| 已有一张好立绘，要保住画质 | 拆件绑定 |
| 身体动作多，要换附件 | 拆件绑定，走 Spine |
| 以正面立绘为中心，连续调脸部参数 | 拆件绑定，走 Live2D |
| 没有美术，要 AI 一句话做出能动的角色 | 矢量代码 |
| 像素风、动作固定，或者要放进 3D 场景 | 逐帧画 |
| 要大角度自由视角 | [三维生成](../3d-generation.md) |

## 相邻任务：常一起出现，但不属于这个领域 { #neighbors }

- **二维角色动画**：素材做好以后怎么动、怎么切换、怎么对嘴型，见[二维角色动画](../2d-character-animation/index.md)
- **图像生成**：整张立绘从哪来，属内容生成，见[图像生成](../image-generation.md)
- **三维生成**：要自由视角就生成三维模型，见[三维生成](../3d-generation.md)；那张的代码拼和这里的矢量代码是同一个思路

## 演示源码与来源 { #sources }

- **橘猫**：[播放页](assets/cat.html)是自包含单页，素材已嵌进页里；来源、骨骼数和 SHA-256 记在二维角色动画的[来源记录](../2d-character-animation/assets/sources.json)
- **大肥鱼**：模型和播放器跟着运行演示放在二维角色动画那边，本页只留制作流程和核对记录
- **鹈鹕**：完整源码折叠在 Gallery 的[鹈鹕骑自行车](../../../gallery/animation/pelican-bicycle.md#source)

??? abstract "大肥鱼成品文件与资源引用核对记录"

    ```json
    --8<-- "posts/domains/2d-character-generation/assets/dafeiyu-evidence.json"
    ```

??? abstract "一手文档短句摘录、出处与读取日期"

    ```text
    --8<-- "posts/domains/2d-character-generation/assets/sources-excerpts.txt"
    ```

[^dafeiyu-tutorial]: JackCui 小R，[我把大肥鱼做成了Live2D皮套人？可以在线聊天，还能摸耳朵！【附教程】](https://mp.weixin.qq.com/s/1Vf2KdxoBBGvLe_i7mBpsw)，发布并读取于 2026-11-05；读取正文与 29 张原图，未获取文章中的视频。
[^see-through]: shitagaki-lab，[See-through](https://github.com/shitagaki-lab/see-through)，读取于 2026-11-05；Usage 与 Discussion 说明其输出分层 PSD，绑定不在该项目范围，短句摘录见文末来源存档。
[^psd2live]: tsunehimatoi/psd2live，固定于 commit `b496b1b13736ae49e7f806a2a39e89755c3eea21`：[实现概览](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/docs/zh/spec/IMPLEMENTATION_COMPARISON.md)、[PSD 素材与命名](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/docs/zh/spec/PSD_LAYER_SPEC.md)、[模型生成及导出实现](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/src/main/kotlin/io/github/psd2live/core/PSD2LivePipeline.kt)，读取于 2026-11-05；本次读文档与代码，未运行该工具。
[^dafeiyu]: Jack-Cherish/dsi，固定于 commit `84f518088c2fc727af628d65ffe85ec01a91254e`：[模型包](https://github.com/Jack-Cherish/dsi/blob/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/assets/character.airi.zip)、[PSD 与 Cubism 工程](https://github.com/Jack-Cherish/dsi/tree/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/assets/source)、[作者校验清单](https://github.com/Jack-Cherish/dsi/blob/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/SHA256SUMS)，读取于 2026-11-05；只提取模型制作产物，姿态图来自该版本的 `dafeiyu/docs/images/motion-poses.png`。
