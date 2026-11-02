---
description: "视频合成（compositing）的通用功能是按遮罩把几层画面叠成一帧；判谁挡谁、光影颜色、边缘各是一个方向；抠像、平面追踪、点追踪、摄像机反求、稳像、擦除是前处理，透明通道交付、质检是后处理；生成式补画是相邻任务；两个 demo 用本站接口从零做"
---

# 视频合成（compositing）：给几层画面和遮罩，叠成一帧

**视频合成（compositing）的通用功能只有一件事：给几层画面和每层的遮罩，按前后顺序叠成一帧。** 细分方向都是被新需求逼出来的：遮罩从哪来，谁挡谁，贴上去的东西要跟着画面里的面动，合上去的要像本来就在那儿，透明视频怎么交付。分类参考了 Blender 的运动跟踪手册[^blender]。在[领域地图](../index.md)上它在「内容变换」一组，处理对象是视频；方向里大半是前处理 —— 抠像、追踪本身是检测与分割，为了喂那一步 over 才在这张里。

和[文字识别](../ocr.md)、[语音识别](../asr.md)不一样，这里不少方向不靠 AI，是影视后期做了几十年的老手艺 —— **知道它叫什么，比知道用哪个模型要紧**。本页两个 demo 用本站的[生图](../../../skills/agent-io/reference/image.md)和[首尾帧生成视频](../../../skills/agent-io/reference/video/first-last-frame.md)接口从零做，做法见[文末](#demo)。

## 通用功能：有遮罩，就能叠 { #basic }

- **输入**：几层画面，每层带一张遮罩（alpha）：1 是这一层，0 是透出下一层
- **输出**：一帧。最常用的是 over：上层 × 遮罩 + 下层 × (1 − 遮罩)
- **顺手处理的**：每层的缩放、位移、旋转，遮罩边缘羽化
- **典型用途**：绿幕换背景，字幕和 UI 叠到画面上，把生成的角色放进别的画面
- **管不了的**：遮罩从哪来，层和层怎么对齐，光影对不对得上 —— 下面的方向都是从这三处长出来的

## 细分方向：一个新需求，一个方向 { #needs }

### 要把前景抠出来：抠像与遮罩（keying、matting、rotoscoping）· 前处理 { #matte }

- **颜色抠像**（chroma key）：背景是纯色，不是这个颜色的就是前景，绿幕就是这么用的。背景一有花纹就失灵
- **差分抠像**（difference matte）：背景是已知的一张图，逐像素比，不一样的就是前景。前提是背景的每个像素都知道
- **逐帧手描**（rotoscoping）：人一帧帧画遮罩，最准，也最费工
- **AI 抠像**：人像抠图（RVM、MODNet）、按提示分割（SAM）。不挑背景，但边缘偏粗、会漏检
- 踩过的：做游戏 UI 遮挡视频时，颜色抠像、深度估计、SAM、和模板做差四种都试过。挡板是自己画的，最后用差分；SAM 要等角色整个露头才认得出，手指已经扒在挡板上十几帧了
- 生成的片子不是原图贴上去的：模型每帧会把挡板重画一遍，边缘挪 1–2 px；本页那段手压挡板，压着的时候整块板往下挪了 8 px，挡板上沿露出一条机器人的身子，差分如实判成了遮挡 —— 所以差分要在 ±2 px 内找最像的位置再比，挪得更多就得先追踪再比

<div class="grid" markdown>

<figure markdown>
![按黄色抠：挡板上的橙色条纹也被判成遮挡](assets/matte-chroma.png)
<figcaption>按黄色抠：条纹也算成遮挡，挡板 57.6% 被判成「被压住」</figcaption>
</figure>

<figure markdown>
![和挡板模板做差：只剩两只手](assets/matte-diff.png)
<figcaption>和挡板模板做差：只剩两只手，33.9%</figcaption>
</figure>

</div>

### 要知道谁挡谁：遮挡与分层（occlusion、holdout matte、depth） { #occlusion }

- 上层盖住下层是默认的。要让后面的东西反过来压住前面的字，就要一张遮挡遮罩：哪里被压住，字就不画在哪
- 深度估计也能判前后，但贴在板上的手指和板一样深，判不出来

<figure>
  <video src="/posts/domains/video-compositing/assets/demo-matte.mp4" autoplay loop muted playsinline width="720"></video>
  <figcaption>原片 ｜ 差分遮罩（紫）｜ 贴字：手压住的地方不画字。手碰到挡板之前，遮罩误判是 0</figcaption>
</figure>

### 贴上去的东西要跟着面动：平面追踪（planar tracking、corner pin、homography）· 前处理 { #planar }

- 画面里一块平面（屏幕、招牌、一张纸）在动，逐帧求出它的位姿，再把要贴的东西按位姿变换上去。按四个角贴，叫 corner pin
- 运动模型从简到繁：平移 → 欧氏（旋转 + 平移）→ 相似（再加缩放）→ 仿射 → 单应（透视）。自由度越多越贴合，被挡住时也越容易飘
- 两类求法：找特征点（ORB、SIFT）配对、RANSAC 求变换；或者像 ECC 这样直接比像素
- 踩过的：
    - 分割（SAM）只给像素、不给位姿：知道板在哪，不知道它转了多少
    - ECC 直接比亮度，会沿着平涂的大色块滑；改在梯度图上比，盯边缘
    - 手压在板上会拉低相关系数、把位姿带偏：先把上一帧判出来的手从模板蒙版里去掉
    - 单应在板出画、被挡住时透视乱飘，硬板用欧氏就够

<figure>
  <video src="/posts/domains/video-compositing/assets/demo-track.mp4" autoplay loop muted playsinline width="560"></video>
  <figcaption>左：不追踪，字钉在原地；右：平面追踪，绿框是追到的挡板，字跟着转，手压住的地方照样不画。124 帧全部追住，最多转了 22°</figcaption>
</figure>

### 跟一个点或一个物体：点追踪、目标追踪（point tracking、optical flow、object tracking）· 前处理 { #point }

- 点追踪：跟住画面上一个特征点，得到它的位置；跟两个点能算出旋转和缩放
- 光流：每个像素往哪动
- 目标追踪：框住一个物体，逐帧给出框
- 和平面追踪的区别：点和框只有位置，一块平面才有姿态

### 把 3D 东西放进实拍：摄像机反求（match moving、camera tracking、SfM）· 前处理 { #matchmove }

- 从画面里很多点的运动，反推出摄像机怎么动，再让 3D 场景里的虚拟摄像机照着动
- 用在：实拍镜头里加 3D 模型、建筑、特效

### 画面在抖：稳像（stabilization）· 前处理 { #stabilize }

- 追住画面里的参考点，反向补偿抖动
- 反过来要加震屏效果，也得按层来。踩过的：整个画面一起震不像 —— 原片里前面的 UI 只抖 1–3 px，后面的卡片晃几十 px，要拆层各震各的

### 合上去的要像在那儿：光影与颜色匹配（color matching、shadow、relighting、grain） { #light }

- 颜色匹配：前景的亮度、色温调成背景的样子
- 影子：前景投到背景上的影子要补上，或者把原片里的留住
- 颗粒和模糊：生成的画面、实拍的画面颗粒和运动模糊不一样，要统一
- 踩过的：判遮挡时影子不能算 —— 比颜色方向、不比亮度，同色变暗就放过；比模板还亮的高光、特效线也放过。本页 demo 的差分就是这么判的

### 边缘发毛、有绿边：边缘处理（despill、edge blending、light wrap） { #edge }

- 去溢色（despill）：绿幕反到头发、衣服边上的绿色要压掉
- 边缘融合：遮罩边缘羽化，再把背景的光往前景边上晕一点（light wrap），看着才不像贴上去的

### 要擦掉东西：擦除与修补（clean plate、inpainting、wire removal）· 前处理 { #remove }

- 拍一条没有人的空镜（clean plate），擦掉的地方拿它补
- 没有空镜，就按周围的内容补：经典的纹理合成，或者生成模型的 inpainting
- 用在：擦威亚、擦路人、擦水印

### 透明视频怎么交付：透明通道（alpha channel、stacked matte）· 后处理 { #alpha }

- 带透明通道的格式有 ProRes 4444、WebM（VP9）、HEVC with alpha，但浏览器各认各的：Chrome、Firefox 认 WebM，Safari 只认 HEVC，一条视频通吃不了
- 通用做法：把画面和遮罩上下拼进一条普通 MP4，网页里按遮罩实时合成（stacked matte）
- 踩过的：交付「画面 / 透明 / 遮挡」上下拼的三通道 MP4，字不进视频，由网页按遮罩实时画 —— 改文案、换语言都不用重出视频

<figure markdown>
![上：画面；下：遮挡遮罩](assets/stacked-matte.png){ width="160" }
<figcaption>上：画面；下：遮挡遮罩</figcaption>
</figure>

### 镜头有没有坏：质检（QC、flash detection、scene change detection）· 后处理 { #qc }

- 生成的片子常见的毛病：整屏闪白、背景被换掉、整体变暗、镜头自己推拉
- 自动查：盯一块本该不变的区域（比如纯色底）的亮度。踩过的：掉到原来的 30–70% 是压暗，连续半秒低于 30% 是背景被换，零星几帧是闪白
- 最可靠的还是抽帧拼图给人看，本站[读视频](../../../skills/agent-io/reference/read-video.md)就出联系图

## 相邻任务：常一起出现，但不属于这个领域 { #neighbors }

- 生成式合成（inpainting、outpainting、video extension）：让生成模型在遮罩里画新东西、把画面往外扩、把视频往后续，是内容生成，归[视频生成](../video-generation.md)；本站接了[生图和改图](../../../skills/agent-io/reference/image.md)、[生成视频](../../../skills/agent-io/reference/video/index.md)，本页两段原片就是首尾帧给同一张图、让模型补中间的动作做出来的

## 本页的 demo 怎么做的 { #demo }

<div class="grid" markdown>

<figure markdown>
![生成的机器人角色图](assets/character.webp){ width="200" }
<figcaption>生图：一个蓝色卡通机器人，纯色底</figcaption>
</figure>

<figure markdown>
![首帧：机器人前面加了一块黄底斜条纹的挡板](assets/first-frame.png){ width="200" }
<figcaption>首帧：裁成 480×864，代码画上挡板</figcaption>
</figure>

</div>

- **生图**：gpt-image-2.5，9:16，23 秒出图
- **首帧**：`make_first_frame.py` 把图裁成 480×864，在下方画一块黄底斜条纹的挡板 —— 每个像素都是自己画的，后面判遮挡、追位姿都拿它当模板。斜条纹是故意的，好让按颜色抠失灵。同时输出挡板模板和文字层
- **生视频**：首帧、尾帧都给这张图，480p 竖屏 5 秒，模型补中间的动作，最后回到原样。每条 93–116 秒，扣 0.2 元。同一段 prompt 跑两次，出来几乎一模一样 —— 想要不同的片，得改 prompt。原片：[手压挡板](assets/clip-occlusion.mp4)、[推歪挡板](assets/clip-tilt.mp4)
- **差分**：`difference_matte.py`，124 帧 43 秒
- **追踪**：`planar_track.py`，124 帧 54 秒，跟丢 0 帧，相关系数最低 0.853。第一版只拿上一帧当初值、没去掉手：手一压上来相关系数就掉到 0.72，之后 63 帧全丢
- 依赖写在各脚本开头，`uv run` 直接跑：

```bash
uv run make_first_frame.py character.webp work/
uv run difference_matte.py clip-occlusion.mp4 work/ out/
uv run planar_track.py clip-tilt.mp4 work/ out/
```

??? note "三段 prompt"

    ```text
    生图：
    A cheerful cartoon robot character, front view, upper body only, centered horizontally. Rounded teal-blue metal body, big round head with two glowing cyan eyes and a small smile, short antenna, two arms with chunky blue mitten hands held loosely at chest height. Flat 2D vector illustration, bold dark navy outlines, flat colors, no gradients. Plain solid light lavender background filling the whole frame, no floor, no shadow, no text, no props. The head and shoulders occupy the top half of the image; the body continues down to the bottom edge.

    手压挡板：
    Fixed camera, flat 2D cartoon. The blue robot leans forward and places both blue mitten hands flat on the top half of the yellow striped sign in front of it, pressing down and covering part of the sign, holds still for a moment, then lifts its hands back up to its chest and returns to the exact starting pose. The yellow striped sign never moves: same position, same size, same stripes, same colors. Plain lavender background stays the same. No camera movement, no zoom, no new objects, no text.

    推歪挡板：
    Fixed camera, flat 2D cartoon. The blue robot pushes down on the right end of the yellow striped sign with one blue hand, so the whole sign tilts like a rigid flat board around its center, right end down about 30 degrees, holds for a moment, then swings back to level and the robot returns its hand to its chest, ending in the exact starting pose. The sign keeps its exact shape, stripes and colors while tilting; it never bends or deforms. Plain lavender background stays the same. No camera movement, no zoom, no new objects, no text.
    ```

??? abstract "`make_first_frame.py`：画首帧和挡板"

    ```python
    --8<-- "posts/domains/video-compositing/assets/make_first_frame.py"
    ```

??? abstract "`vfx_common.py`：读写视频、和模板做差判遮挡"

    ```python
    --8<-- "posts/domains/video-compositing/assets/vfx_common.py"
    ```

??? abstract "`difference_matte.py`：差分抠像 demo"

    ```python
    --8<-- "posts/domains/video-compositing/assets/difference_matte.py"
    ```

??? abstract "`planar_track.py`：平面追踪 demo"

    ```python
    --8<-- "posts/domains/video-compositing/assets/planar_track.py"
    ```

[^blender]: Blender 手册《Motion Tracking》https://docs.blender.org/manual/en/latest/movie_clip/tracking/index.html ，2026-10-29 读取。
