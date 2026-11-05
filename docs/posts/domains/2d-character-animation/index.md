---
description: "二维角色图像 · 给角色素材、动作和时间，输出连续画面；比较序列帧、Spine、Live2D，用 Alice 与真乃两个交互演示看素材复用、动作衔接、嘴型驱动和小幅扭头"
---

# 二维角色动画（2D Character Animation）：让角色素材按动作指令动起来

**二维角色动画的通用功能是：给一套角色素材、动作指令和时间，算出此刻该显示的画面。** 在[领域地图](../index.md#transformation)上归「内容变换」，处理对象是已有的二维角色图像。这里关注游戏角色、聊天立绘和桌面伙伴在运行时怎么动；素材怎么画、绑定怎么做，是它的前处理。

现成画面可以逐帧播放，也可以把角色拆成部件、用骨骼或参数驱动。下面先比较三条路线，再用本次实际跑通的 Alice 和樱木真乃说明 Spine。方向名采用 Spine 与 Live2D 官方文档中的骨骼、网格、权重、变形器和动画混合术语；口型另接语音工具的 viseme / lip sync 术语。[^mesh][^live2d][^mix]

## 通用功能：素材加时间，得到一帧 { #basic }

- **输入**：角色图像、可用动作或参数、当前时间；互动角色再加情绪、是否说话、是否点头等控制状态。
- **输出**：连续的二维画面，可以直接画在网页 Canvas，也可以离线导出成视频或图像序列。
- **顺手处理的**：播放速度、循环、整体缩放、镜像、取景，以及素材支持的局部动画组合。
- **典型用途**：游戏角色、对话立绘、虚拟宠物、直播形象和网页吉祥物。
- **管不了的**：从正面图自动恢复背面、凭空增加没有画过的部件、决定角色该说什么。运行库也不会自动把声音转换成正确嘴型。

### 要先准备可动素材：拆图、绑定与参数制作（rigging）· 前处理

序列帧需要准备完整动作画面；骨骼和参数动画需要拆图、补画被遮住的部分、建立网格，并设定部件之间的关联。制作成本从「每个动作画多少帧」转成了「先把这套角色做成可驱动的结构」。

拿到导出的 JSON、骨骼二进制、atlas 和贴图，已经可以播放；要大改动作或造型，原始编辑工程和分层绘画文件会更有帮助。本页只收演示必需的导出资源。

### AI 制作 Spine：从拆件图到骨骼动作 { #ai-spine }

AI 可以先把角色参考图拆分、补画成独立部件，再通过代码生成 Spine 的骨骼、网格权重和动画关键帧，交给运行库实时播放。下面的橘猫用 8 根骨骼和 2 个加权网格完成待机、挥爪、歪头，身体里重复画出的前腿在检查后重新补画修正。

<video src="/posts/domains/2d-character-animation/assets/cat-spine.mp4"
       poster="/posts/domains/2d-character-animation/assets/cat-spine-poster.png"
       autoplay loop muted playsinline controls preload="metadata"
       style="display:block;width:100%;max-width:600px;margin:auto;border-radius:12px"></video>

[切换动作、暂停或查看骨骼](assets/cat.html){ target="_blank" rel="noopener" }

### AI 制作 Live2D：从立绘到可编辑模型 { #ai-live2d }

**See-through 拆层，PSD2Live 生成网格与绑定，可把单张立绘加工成 Live2D 模型。** 大肥鱼制作教程给出的流程是：

> 立绘 → 分层 PSD → 网格 → 绑定 → 动作物理 → 导出测试[^dafeiyu-tutorial]

| 阶段 | 工具与处理 | 得到什么 |
|---|---|---|
| 准备立绘 | 绘制或生成角色图，明确眼、嘴、耳朵和四肢结构 | 完整参考图 |
| 拆层与补画 | See-through 分离部件、补全遮挡并推断绘制顺序；检查遗漏和破损 | 分层 PSD，尚未绑定[^see-through] |
| 建立网格 | PSD2Live 识别图层语义，沿透明轮廓生成三角网格 | 可以局部变形的 ArtMesh[^psd2live] |
| 绑定参数 | 建立变形器层级，把眼睛开合、嘴巴张合、头部朝向关联到网格形态 | 参数及对应关键形[^psd2live] |
| 动作与物理 | 编排参数随时间的变化，为头发等部件添加滞后摆动 | 动作曲线和物理配置[^psd2live] |
| 导出与检查 | 导出后核对贴图、遮罩、形变和资源引用 | `.cmo3` 编辑工程，`.moc3`、`.model3.json`、贴图及动作文件[^psd2live] |

拆图时要为变形留余量：眼白、瞳孔、睫毛分别成层，嘴巴画出张开时的口腔，被头发或手臂遮住的部分补完整。绑定后检查闭眼是否残留瞳孔、张嘴是否露底、转头时五官与头发是否错位，再组合多个参数检查；命名识别成功和导出成功，都不能代替形变检查。[^psd2live]

大肥鱼案例公开了分层 `dafeiyu.psd`、可编辑的 `dafeiyu.cmo3` 和完整运行模型。本站核对了作者的 SHA-256 清单及模型包，并用官方 Cubism Core 成功读取 32 个参数、35 个绘制部件，逐帧求值 11 个动作和 4 个表情；[文件核对记录](assets/dafeiyu-evidence.json)与[运行库验证结果](assets/live2d-validation.json)保留了范围和校验值，未从原图重做生成流程。[^dafeiyu]

<iframe src="/posts/domains/2d-character-animation/assets/dafeiyu.html"
        style="width:100%;height:920px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="大肥鱼 Live2D：动作、表情、参数与网格演示"></iframe>

[单独打开 Live2D 演示](assets/dafeiyu.html){ target="_blank" rel="noopener" }

先选「挥手」「动耳朵」或「摆尾巴」，暂停后拖动进度；再调眼睛、嘴巴和转头滑杆，打开「显示三角网格」观察局部形变。参数调试会暂停动作，「复位」恢复待机；这是本站实时播放作者模型，页面只演示模型与绑定。

??? abstract "作者提供的制作阶段姿态对照"

    <figure markdown>

    ![大肥鱼参数姿态对照：手臂、耳朵与尾巴的变化](assets/dafeiyu-motion-poses.png){ loading=lazy }

    <figcaption>作者提供的制作阶段姿态对照：手臂关节、耳朵和尾巴的参数变化；不是本站运行截图。</figcaption>
    </figure>

## 三条路线：逐帧、骨骼与参数变形 { #routes }

| 路线 | 保存什么、运行时做什么 | 制作与资源特点 | 适合的控制方式 |
|---|---|---|---|
| 序列帧（frame-by-frame / sprite animation） | 保存各帧图像，按时间选帧；可打包成精灵图或动画文件 | 每帧可以自由绘制；动作增加时通常要增加画面，具体体积取决于编码和优化 | 固定动作、特效、强调手绘形变的短动画 |
| Spine 骨骼动画（skeletal animation） | 保存部件图集、骨骼、网格权重和关键帧，实时计算姿势 | 动作共用贴图；需要拆图、绑定和调整形变，运行时付出骨骼与网格计算 | 多个身体动作、局部叠加、换附件和角色交互 |
| Live2D 参数变形（parameter-driven deformation） | 将分层图像做成 ArtMesh，用变形器和参数控制形态 | 适合围绕一张立绘制作连续变化；质量取决于参数、关键形态和部件制作 | 面部角度、眼睛开合、嘴型、视线等连续参数 |

两种绑定路线的能力有重叠，不应按「Spine 只会动身体、Live2D 才会转脸」分界。Live2D 文档写的是：

> “Use deformers to edit vertices together”[^live2d]

它说明的是用变形器成组编辑顶点。Spine 同样有网格和权重；[真乃的扭头](#turn)就是具体例子。选型还要看已有素材、团队熟悉的制作工具和目标平台，不能只看播放器截图。

### GIF 为什么远小于 N 张 PNG 的总和 { #gif }

**GIF 的文件大小不等于独立 PNG 文件大小相加。** PNG 本身有压缩；GIF 还使用调色板索引、LZW 编码，并允许每幅图像指定位置和尺寸。优化器可结合透明索引、帧处置方式，只更新变化矩形。每个图像块的颜色表最多 256 色，也不能保留 RGBA 那样的连续透明度。[^gif]

例如只眨眼的角色，后续图像块可以很小；全屏都在变化时，局部更新的收益就有限。这是编码器利用帧间冗余，不是 GIF 理解了眼睛或骨骼，也不是视频编码那种运动预测。

| 指标 | 衡量什么 | 不能由什么直接推出 |
|---|---|---|
| 文件大小 | 保存和传输的字节数 | 不能直接推出解码后的纹理内存 |
| 内存占用 | 解码画面、图集、缓存和骨骼数据 | 不能只看 PNG 或 GIF 压缩后的体积 |
| 运行开销 | 解码、合成、骨骼、网格和实际绘制 | 不能一概认定 Spine 比序列帧省计算 |

Spine 的资源优势主要来自多个动作复用部件。大量复杂网格角色同时运行时，计算可能更重；简单序列帧的播放逻辑则可以很轻。这里没有做同画质、同动作时长的性能基准，下面两个文件的大小也不构成路线性能排名。

## Alice：共用一张图集，播放十个完整动作 { #alice }

Alice 来自本地提供的 `663日韩二.zip`，实际文件格式是 RAR；原始作者未核实。演示只收其中一套角色，没有搬入整份压缩包。骨骼版本是 3.6.52，**93 根骨骼、10 个完整动作、一张 512 × 512 图集**。

<iframe src="/posts/domains/2d-character-animation/assets/alice.html"
        style="width:100%;height:820px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Alice：Spine 动作播放演示"></iframe>

[单独打开 Alice 演示](assets/alice.html){ target="_blank" rel="noopener" }

先选 `idle`、`run`、`atk1`，看身体部件和海豚在不同动作中如何运动；暂停后拖进度，或打开「显示骨骼」查看绑定。`atk3_weapon` 是武器特效动画，不能把列表中的每一项都理解成完整身体动作。

旧版网页运行库读取 JSON，本次用[转换脚本](assets/convert-spine36.py)把[原始二进制](assets/alice/original.skel)转为[预览 JSON](assets/alice/data.json)。原文件头部声明 11 个动画，但读取完 10 个完整动画后恰好到达文件末尾。脚本只对这个「在动作边界已结束」的情况停止，不补造第 11 个，也不能判断缺失动作叫什么；其他读取错误仍报错。

[atlas](assets/alice/data.atlas)负责描述图集中每个部件的位置，[贴图](assets/alice/Alice_130008_Q.png)存图像。JSON 存骨骼和动作数据。待机、奔跑和攻击共享这些资源，而不是为每个动作保存完整角色的所有画面。

## 真乃：身体、表情、嘴巴各占一条轨道 { #mano }

真乃来自[已收录的 Eidolon-SC 项目](../../../projects/eidolon-sc/index.md)。**立绘和动画是原作游戏素材，Eidolon-SC 提供同步与控制逻辑**；本次按照其衣装配置和下载路径，取得默认私服「ナチュラルモード」，编号 `stand/1030010010`。素材获取日期为 2026-11-04，版本为 Spine 3.6.53，72 根骨骼、62 个动画资源。[^eidolon]

<iframe src="/posts/domains/2d-character-animation/assets/mano.html"
        style="width:100%;height:1000px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="樱木真乃：身体、表情、嘴型和摇头的分层演示"></iframe>

[单独打开真乃演示](assets/mano.html){ target="_blank" rel="noopener" }

选一个身体动作，再选「叠加表情」、勾「模拟说话」，最后点「点头」或「摇头」。这些变化可以同时存在。62 是动画资源总数，包含表情、嘴型、视线和辅助动作，并非 62 段完整身体动作；下拉菜单把身体、表情和动态嘴型分开了。

| 轨道 | 原项目用途 | 本页演示 |
|---|---|---|
| 0 | 身体动作 | 动作下拉菜单 |
| 1 | 表情 | 叠加表情 |
| 2 | 点头、摇头 | 播一次后退出 |
| 3 | 视线 | 未提供独立视线控件 |
| 5 | 嘴型 | 循环张合，或冻结在闭嘴姿势 |

动画按轨道叠加，但「放在高轨道」不等于自动隔离部件。某条动画记录了哪些骨骼、附件或网格，它就会影响那些对象；能否自然组合，依赖素材制作时的分工。原项目通过情绪选择身体、脸和嘴型，动画名不齐全的衣装使用候选回退。[^eidolon]

演示只使用静态 [JSON](assets/mano/data.json)、[atlas](assets/mano/data.atlas) 和[贴图](assets/mano/data.png)，没有启动 Eidolon-SC 的聊天、登录、语音或情绪判断服务。

## 要自然切换动作：动画混合与衔接（mixing、transition animation） { #transition }

**过渡既可以由运行库插值，也可以由动画师单独制作。** Spine 的 AnimationState 把两件事分别称作 “mixing (crossfading)” 和 “layering”。[^mix]

| 做法 | 发生什么 | 适用情况 |
|---|---|---|
| 直接切换 | 结束旧动作，立即应用新动作 | 需要立即反馈，或两段姿势本就接近 |
| 动画混合 | 短时间内降低旧动画的影响、提高新动画的影响 | 待机、说话、情绪等普通切换 |
| 专门衔接动作 | 先播放一个收手、转身或复位动作，再进入目标动作 | 单纯插值会让手穿过身体，或动作有必须完成的阶段 |

Eidolon-SC 普通混合时间是 0.3 秒，嘴型是 0.1 秒；身体动作里的 `relay` 事件指定离开前的收手动作，`loop_start` 指定首次播放后应循环的尾段。比如「举手说话 → 收手 → 待机」，既有姿势混合，也有动作顺序。[^eidolon]

本页播放器为观察单个动作，切换身体动作时先 `clearTracks()`、`setToSetupPose()`，再开始目标动作，**不演示原项目的完整衔接状态机**。表情和嘴型在各自轨道内仍有混合；默认混合时间并不能给已经清空的旧身体动作生成过渡。

动画退出、分层覆盖、被打断后停止，以及过期情绪到达，都归在「动作如何切换与组合」这个问题下，不必拆成一串彼此独立的 Spine 难题。

## 要跟着声音动嘴：嘴型驱动（lip sync、viseme） { #mouth }

**说话时动嘴和按发音对嘴型，是不同精度的目标。** 当前演示的「模拟说话」没有音频输入，只循环素材已有的 `lip_*` 动画，取消勾选就把同一嘴型冻结在第 0 帧。

Eidolon-SC 也是状态驱动：角色开始说话时循环当前情绪的嘴型，停止说话或被打断时闭嘴；没有用音量，也没有逐音素识别。程序中的发音词典用于让 TTS 念对名字，不代表它输出了嘴型时间轴。[^eidolon]

| 方案 | 输入和控制方式 | 适合什么、限制在哪 |
|---|---|---|
| 说话状态驱动 | 开始播放就循环，结束就闭嘴 | 接入简单；张合节奏与实际发音不一致 |
| 音量驱动 | 从实际播放的音频提取短时能量，映射开合程度并平滑 | 跟随停顿和力度；不能区分「啊」和「呜」 |
| TTS 带嘴型时间轴 | 合成语音同时返回视素编号与时间戳，映射到角色嘴型 | 更贴发音；依赖声音、语言与服务的支持 |
| 分析已有音频 | 对录音生成嘴型时间轴，再同步播放 | 适合预录对白；用于流式对话要另处理分段和延迟 |

Azure Speech 返回的 “Audio offset” 是嘴型相对音频的时间位置；Viseme 是一组外观接近的发音对应的可见口型，和音素不是一一对应。具体支持情况要按语言、声音和输出类型确认。[^viseme]

Rhubarb Lip Sync 的输出描述的是 “which mouth shape to display at what time”。[^rhubarb] 它能对录音生成嘴型时间轴，并有 Spine 集成；默认识别器面向英语，其他语言有 `phonetic` 模式，官方说明其精度通常较低。它不是直接插入当前网页就能工作的实时音频流组件。

通用工具解决的是「何时用哪种嘴型」，接入者还要定义「这个编号对应本角色的哪个附件或参数」。真乃素材里已有多种情绪嘴型，却没有明确标注的标准 Viseme 映射；要做精细发音，需检查现有形态是否够用，再决定映射或补画。所有时间轴都应对齐实际音频播放进度，而非文本或网络数据到达时间。

## 要让正面角色略微转脸：控制骨骼与加权网格（constraints、weighted mesh） { #turn }

**小幅扭头已经由当前素材实现，不需要真的把一张平面图沿三维轴旋转。** 看真乃的 `no`（摇头）动画，骨骼时间轴只给 `face_control` 写了六个平移关键帧，没有给它写旋转轨道。

它能产生转脸效果，是绑定在起作用：

1. 脸部是 34 个顶点的加权网格，不同顶点受 `face_`、`head`、`face_control`、`Face_re` 等骨骼共同影响，移动控制器会改变脸部轮廓。
2. 眼睛、嘴巴、部分前发通过 transform constraint 跟随 `face_control`，平移混合系数分别有 0.20、0.19、0.10。它们不是整张脸等量平移，因而产生相对运动。
3. `Face_re` 的平移混合系数为 -1，参与反向运动；它同时影响脸部、眼睛和头发网格，为转脸效果提供不同方向的形变。

这些数字是此模型的绑定参数，不是通用转头公式，也不等于整套素材的最终顶点位移比例。控制器坐标是骨骼局部坐标，不能把 JSON 的 x/y 直接当成屏幕左右和上下。

```text
face_control 的平移关键帧
          ↓
约束驱动五官、头发；不同骨骼按权重影响网格
          ↓
轮廓、五官和头发产生相对位移
          ↓
小幅转脸、点头或摇头的视觉效果
```

Spine 网格文档写到 “Meshes can be deformed automatically”。[^mesh] 此例正好说明：动画时间轴不一定要逐帧记录所有顶点，网格也能随着带权重的骨骼变化。

??? abstract "当前素材的扭头证据：六个关键帧、四条约束与脸部顶点统计"

    以下是从原始 JSON 提取的数据，并非手写示意；`bone_vertex_counts` 统计一个骨骼影响了多少顶点，不是权重百分比，同一顶点可重复计入不同骨骼。

    ```json
    --8<-- "posts/domains/2d-character-animation/assets/turn-evidence.json"
    ```

    提取器真身：

    ```python
    --8<-- "posts/domains/2d-character-animation/assets/inspect-rig.py"
    ```

对照[原始数据](assets/mano/data.json)，可用[提取器](assets/inspect-rig.py)重新生成[证据文件](assets/turn-evidence.json)。演示里点「摇头」即可看 `no`，无需切换身体动作。

## 要扩大表现范围：先看素材，再选控制方法 { #limits }

从现有正面角色做小幅转脸，Spine 可以胜任；转到明显侧面、背面，或者露出未画过的手臂内侧，才更容易需要补画、切换附件或重新绑定。问题在素材是否包含目标形态，不能概括成「二维角色不能扭头」。

待机显得机械，通常可以准备多套眨眼、视线和微动作，按当前状态随机挑选，设置间隔、避免连续重复。这是常规动画调度，不应被当作 Spine 特有的技术障碍。

| 需求 | 优先考虑 |
|---|---|
| 几个固定短动作，手绘形变很多 | 序列帧，制作和接入直接 |
| 身体动作多，要组合表情、换附件 | Spine，前提是可用素材与绑定支持 |
| 以正面立绘为中心，连续调脸部参数 | 评估 Live2D 的制作与 SDK 流程，同时检查现有 Spine 素材是否已足够 |
| 大角度自由视角、姿态和光照 | 评估三维制作，或为二维方案增加视角素材 |
| 用一张肖像和语音直接生成说话画面 | 看生成式说话视频或实时头像引擎 |

运行时版本匹配、透明边缘、图层顺序、设备性能和资源释放是接入成本。两个例子用同一份官方 3.6 WebGL 运行库，分别读取 3.6.52 与 3.6.53 数据；这一组合已验证，不能由此推出其他导出版本都可互换。

## 相邻任务：各自另有一套术语与工具 { #neighbors }

- **实时生成式说话头像**：从语音生成嘴部或头部画面，见 [Mynah](../../../projects/mynah/index.md)。这里的 Spine 演示只驱动预制素材，没有逐帧生成新图。
- **AI 伙伴与角色对话**：决定角色说什么、记得什么、何时回应，见 [Eidolon-SC](../../../projects/eidolon-sc/index.md)。它把情绪和说话状态交给动画控制层。
- **三维角色动画**：有空间几何、相机、材质和绑定，能处理自由视角，见[三维角色动画](../3d-character-animation/index.md)；那张把 Spine 的骨骼、网格权重、IK 约束和三维的对应概念列成了表。
- **视频合成**：把已生成或已渲染的角色放进其他画面，见[视频合成](../video-compositing/index.md)。

## 演示源码与来源 { #sources }

两个入口共用[播放器逻辑](assets/player.js)和[样式](assets/player.css)，通过各自配置加载本站静态资源；运行库也在本站，播放时不访问上游 CDN。iframe 离开视口或标签页隐藏时停绘，回来不覆盖用户的手动暂停选择；暂停时改进度、表情和取景只重绘一帧。

[素材来源与 SHA-256](assets/sources.json)记录两套数据的来源和转换情况，[运行库来源记录](../../../vendor/spine-3.6/SOURCE.txt)与[许可证](../../../vendor/spine-3.6/LICENSE)随文件保留。角色素材与运行库各有自己的权利来源，不能把项目代码开源理解为角色素材也开放了使用许可。

Live2D 演示使用本站静态托管的模型、贴图和[运行库](../../../vendor/live2d/SOURCE.json)，播放时不请求外部 CDN；参数直接送入 Cubism Core，动作读取作者的 `motion3.json`。暂停、离开视口或切换标签页后停止连续绘制，手动改参数时只重绘一帧；[验证脚本](assets/check-live2d.cjs)用实际 Core 检查了 671 个动作姿势、64 个参数端点及 4 个表情，未做浏览器图像验收。

??? abstract "Alice 演示入口源码"

    ```html
    --8<-- "posts/domains/2d-character-animation/assets/alice.html"
    ```

??? abstract "真乃演示入口源码"

    ```html
    --8<-- "posts/domains/2d-character-animation/assets/mano.html"
    ```

??? abstract "一手文档短句摘录、出处与读取日期"

    ```text
    --8<-- "posts/domains/2d-character-animation/assets/sources-excerpts.txt"
    ```

??? abstract "大肥鱼成品文件与资源引用核对记录"

    ```json
    --8<-- "posts/domains/2d-character-animation/assets/dafeiyu-evidence.json"
    ```

??? abstract "Live2D 演示入口与播放逻辑"

    ```html
    --8<-- "posts/domains/2d-character-animation/assets/dafeiyu.html"
    ```

    ```javascript
    --8<-- "posts/domains/2d-character-animation/assets/live2d-player.js"
    ```

    ```javascript
    --8<-- "posts/domains/2d-character-animation/assets/live2d-motion.js"
    ```

[^mesh]: Esoteric Software，[Mesh attachments](https://esotericsoftware.com/spine-meshes)，读取于 2026-11-05；网格、权重与形变的官方说明，短句摘录见文末。
[^live2d]: Live2D，[About Deformers](https://docs.live2d.com/en/cubism-editor-manual/deformer/)，读取于 2026-11-05；演示已接入官方 Cubism Core，运行库版本和来源见本页记录。
[^gif]: CompuServe，[GIF89a 规范](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)，读取于 2026-11-05；参见 Image Descriptor、Graphic Control Extension 与 Appendix F。PNG 的压缩机制见 [PNG compression](https://www.w3.org/TR/png-3/#10Compression)，读取于同日。
[^mix]: Esoteric Software，[Applying Animations](https://esotericsoftware.com/spine-applying-animations)，读取于 2026-11-05；术语参考该文，当前旧版 API 以随站保留的 3.6 runtime 为准。
[^eidolon]: Sallyn0225/eidolon-sc，2026-11-04 获取，固定于 commit `596368d7f7253d58840eb4f0e6f02f57c4418552`：[衣装配置](https://github.com/Sallyn0225/eidolon-sc/blob/596368d7f7253d58840eb4f0e6f02f57c4418552/characters/characters.toml)、[素材下载](https://github.com/Sallyn0225/eidolon-sc/blob/596368d7f7253d58840eb4f0e6f02f57c4418552/backend/src/eidolon/stand_fetch.py)、[动作与嘴型控制](https://github.com/Sallyn0225/eidolon-sc/blob/596368d7f7253d58840eb4f0e6f02f57c4418552/frontend/src/components/conversations/stand/StandEngine.ts)、[说话状态选择](https://github.com/Sallyn0225/eidolon-sc/blob/596368d7f7253d58840eb4f0e6f02f57c4418552/frontend/src/lib/standAnimations.ts)。原始素材取自 ShinyColorsDB CDN 的 `spine/idols/stand/1030010010/`，URL 与校验值见本站来源文件；原作游戏素材不随项目代码许可证开放。
[^viseme]: Microsoft，[Get facial position with viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)，读取于 2026-11-05。
[^rhubarb]: DanielSWolf，[Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)，读取于 2026-11-05；参见 Output formats、Recognizers 和 Spine 集成说明。
[^dafeiyu-tutorial]: JackCui 小R，[我把大肥鱼做成了Live2D皮套人？可以在线聊天，还能摸耳朵！【附教程】](https://mp.weixin.qq.com/s/1Vf2KdxoBBGvLe_i7mBpsw)，发布并读取于 2026-11-05；读取正文与 29 张原图，未获取文章中的视频。
[^see-through]: shitagaki-lab，[See-through](https://github.com/shitagaki-lab/see-through)，读取于 2026-11-05；Usage 与 Discussion 说明其输出分层 PSD，绑定不在该项目范围，短句摘录见文末来源存档。
[^psd2live]: tsunehimatoi/psd2live，固定于 commit `b496b1b13736ae49e7f806a2a39e89755c3eea21`：[实现概览](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/docs/zh/spec/IMPLEMENTATION_COMPARISON.md)、[PSD 素材与命名](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/docs/zh/spec/PSD_LAYER_SPEC.md)、[模型生成及导出实现](https://github.com/tsunehimatoi/psd2live/blob/b496b1b13736ae49e7f806a2a39e89755c3eea21/src/main/kotlin/io/github/psd2live/core/PSD2LivePipeline.kt)，读取于 2026-11-05；本次读文档与代码，未运行该工具。
[^dafeiyu]: Jack-Cherish/dsi，固定于 commit `84f518088c2fc727af628d65ffe85ec01a91254e`：[模型包](https://github.com/Jack-Cherish/dsi/blob/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/assets/character.airi.zip)、[PSD 与 Cubism 工程](https://github.com/Jack-Cherish/dsi/tree/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/assets/source)、[作者校验清单](https://github.com/Jack-Cherish/dsi/blob/84f518088c2fc727af628d65ffe85ec01a91254e/dafeiyu/SHA256SUMS)，读取于 2026-11-05；只提取模型制作产物，姿态图来自该版本的 `dafeiyu/docs/images/motion-poses.png`。
