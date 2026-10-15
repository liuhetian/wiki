<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/faceless-explainer/references/motion-language.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 运动语言 —— 运动词汇 + 运动准则 + seek 安全核心

> 这是 **Step 4（视觉设计）** 的运动层。在你写一帧的**带时间码的镜头序列**时，你要**直接引用下面的词汇**来为每个场景的运动命名 —— 这是一套具名的运动色板，收录的是黄金语料实际用到的运动。每个运动都附带它在本 skill 本地 `../../hyperframes-animation/rules/` 里的**支撑规则 id**；引用这个 id，这样 **frame worker** 在 Step 5 实现它时，这个运动能落到一份真实的配方上（worker 会读 `../../hyperframes-animation/rules/<id>.md` 里的规则正文 —— 它复现这个运动，而不是根据名字去猜）。你按**角色 / 运动名**来命名运动，绝不写原始的 GSAP 曲线、毫秒数或错开公式 —— 曲线由 worker 来映射。帧与帧之间的**转场不归你管**：story 指定 `transition_in`，harness 注入它；这个被注入的转场**就是**这一帧的出场。至于 worker 在一帧**内部**构建的切（场景内替换、场景到场景的接缝），见 `cut-catalog.md` 里的目录。

一支好的讲解视频感觉像一部连续的影片 —— 一台摄影机、一种运动手感、**流畅且卡准旁白** —— 而不是一堆动一下就冻住的幻灯片。在讲解视频里，展开的过程*本身就是*教学：公式一步步拼起来、图示多出一层、计数跳到终值。Part 2 的准则是承重的：拿不准的时候，就照它说的做。

---

# Part 1 —— 运动词汇

为一个场景的运动命名时，从这套色板里取。挑选与这个段落节拍匹配的运动，在镜头序列里写出它的名字，并在 `→` 后面引用规则 id。蓝图（`../../hyperframes-animation/blueprints/`）在它们的 `rule mapping` 里用的也是同样这些运动名；你们取自同一套共享色板。在一个镜头的几个场景里组合 2–4 个运动（入场 → 依次揭示 → 收住），不要一次全上。

## 动态文字

- **hard-cut / flash word-swap**（硬切 / 闪换词）—— 一个词或一行字在瞬间切换中替换掉上一个（不淡入淡出、不滚动）；替换本身就是这一拍。→ `discrete-text-sequence`
- **in-place token cycle**（原地词元轮换）—— 一行固定文字停住，只有其中的可变槽位在变，词元 → 词元 → 词元。→ `discrete-text-sequence`
- **per-word staggered reveal**（逐词错开揭示）—— 一个短语逐词（或逐块）拼装起来，每个词落在自己的那一拍上。→ `dynamic-content-sequencing`
- **kinetic beat-slam**（动态节拍重击）—— 几个短语在一组共享的打击乐节拍数组上重重砸入，每个都有不同的入场方式，最后收在一个锁定的终章上；这是"有冲击力 / 有节奏感"的标语的配方。→ `kinetic-beat-slam`

## 打字机

- **type-on with caret**（带光标的逐字打出）—— 文字在一个闪烁的光标后面逐字符打出来。→ `discrete-text-sequence`（光标闪烁 / 颜色另加 `context-sensitive-cursor`）
- **backspace-and-retype**（退格重打）—— 这一行打出来，删掉最后的一个（或几个）词，再重新打一个新的（纠正笔误、换个说法）。→ `discrete-text-sequence`（另加 `context-sensitive-cursor`）

## 计数 / 数据

- **value-scaled counter**（随数值缩放的计数器）—— 一个数字往上数，字号随数值变大，于是攀升过程本身就在升级。→ `counting-dynamic-scale`
- **bars / progress / star wipe**（柱 / 进度 / 星级擦除）—— 一个数字配一个会填充的图形：柱高错开、进度条 / 进度环填满、按小数比例擦出的星级评分。→ `stat-bars-and-fills`

## 揭示 / 解码

- **3D char flip-decode**（3D 字符翻转解码）—— 字符在 3D 中翻转，从乱码字形解析成真实文字（解密的感觉）。→ `hacker-flip-3d`
- **SVG self-draw**（SVG 自绘）—— 一个轮廓 / 图标 / 圆环一笔一笔地把自己画出来。→ `svg-path-draw`

## 摄影机

- **push / focus / drift**（推 / 对焦 / 漂移）—— 帧根节点上的一组顺序摄影机运动（拉远 → 对焦 → 推近），外加持续的微漂移；这是电影感的基线。→ `multi-phase-camera`
- **zoom-to-target**（缩放到目标）—— 放大到一个不在中心的元素（缩放 + 反向平移，让它保持在构图里）。→ `coordinate-target-zoom`
- **pan / focus-lock**（平移 / 锁定焦点）—— 一台虚拟摄影机变换一个 `.world` 包裹层，来平移 / 缩放 / 锁定到某个区域。→ `viewport-change`
- **camera-cursor-tracking**（摄影机跟随光标）—— viewport 锁定一个移动的焦点（一个正在打字的光标），先是静态构图，然后锁定焦点跟随。→ `camera-cursor-tracking`

## 布局运动

- **cluster→outward expansion**（聚簇→向外展开）—— 元素一开始聚在中心，然后同步向外展开到各自的最终位置。→ `center-outward-expansion`
- **orbit**（环绕）—— 元素从 3D 空间翻转进来，然后落入一个持续的椭圆轨道（入场时在轨道位置上原地翻转）。→ `orbit-3d-entry`
- **split-tilt cards**（分列倾斜卡片）—— 两张卡片并排，rotationY 倾斜方向相反，各自从自己那一侧入场（对比 / 前后对照）。→ `split-tilt-cards`
- **logo/avatar ring + connectors**（logo / 头像环 + 连接线）—— 头像或 logo 排成一个椭圆环，用 SVG 连接线连到一个中心点，错开入场。→ `avatar-cloud-network`

## 表面 / UI

- **3D page-scroll reveal**（3D 页面滚动揭示）—— 把一整个网页做成一张倾斜的 3D 卡片，卡片内部的内容滚动，揭示特定的区块。→ `3d-page-scroll`
- **cursor click + ripple**（光标点击 + 涟漪）—— 一个光标移到目标上，点击时和目标一起按下去，并发出一圈扩散的涟漪。→ `cursor-click-ripple`
- **button press**（按钮按压）—— 有触感的按压：先压缩，再弹簧式回弹，可选附带释放时的迸发 / 辉光。→ `press-release-spring`（如果是光标和目标一起被压缩的点击，用 `physics-press-reaction`）
- **keyword glow**（关键词辉光）—— 关键词按"起音-衰减-静止"包络亮起，带辉光 + 缩放 + 变色，与逐词 rail 同步。→ `asr-keyword-glow`

## 变形 / 交接

- **scale-swap**（缩放交换）—— 位于屏幕同一中心的两个元素完成交接：出场的那组缩小 + 淡出，入场的那组同时到达。→ `scale-swap-transition`
- **card morph-anchor**（卡片变形锚）—— 一个容器在两个镜头之间变形其视觉尺寸 + 圆角 + 表面，然后淡出，露出下面真正的目标（HyperFrames 用统一的 `scale`，而不是 `width`/`height`）。→ `card-morph-anchor`

## 接缝切（由 worker 在一帧内部构建）

worker 在一帧自己的几个 Scene 之间写出的速度匹配切。在镜头序列里写出接缝的名字；配方在目录里，而不是某一个 `../../hyperframes-animation/rules/` id。

- **zoom-through / inverse zoom-through**（穿越推进 / 反向穿越）—— 场景内在 Z 轴上的替换；正向读起来是"在内容中前进"，反向读起来是"抵达"（揭晓）。→ `cut-catalog.md`
- **cut-the-curve**（切在曲线上）—— 场景到场景的切，两侧沿同一方向、以匹配的速度运动。→ `cut-catalog.md`
- **waterfall cut**（瀑布切）—— 单词粒度的 cut-the-curve，一道越过文字到文字接缝的波。→ `cut-catalog.md`

## 强调 / 标记

- **highlight / circle / burst / scribble**（高亮 / 圈画 / 迸射 / 涂写）—— 在一个词或元素上用马克笔式的强调：黄色高亮扫过、手绘圆圈、放射状迸发、涂写，或粗糙的草图描边。→ `css-marker-patterns`

## 停留期间保持活力（谨慎使用 —— 见 Part 2）

- **subtle jitter**（细微抖动）—— 让一个已经收住的画面保持活力的认可做法：对停住的元素施加一个小幅度、低振幅的位置 / 缩放抖动。这是动态图形的一个技巧，读起来"有生命"，又不会显得"无力"。→ `sine-wave-loop`（低振幅档）
- **live SVG internals**（SVG 内部活动）—— SVG 内部的部件在动，让一个图标显得有生命（转动的指针、摆动的叶片、脉动的圆点、虚线流动）；这没问题，因为是主体在做事，而不是一张卡片在呼吸。→ `svg-icon-enrichment`
- **finite bounded ambient**（有限、有界的氛围运动）—— 对**一个**停住的 hero 施加单次有界的呼吸 / 漂移，只在真正需要时使用；优先级低 —— 先考虑依次揭示或抖动。→ `sine-wave-loop`

## 新增的运动 —— 现已有本地规则支撑

黄金语料需要的五个运动已经加进本 skill 的 `../../hyperframes-animation/rules/`，补全了上面的词汇：

- **depth-of-field / selective-blur**（景深 / 选择性模糊）—— 把焦点之外的那部分元素模糊掉，让焦点元素成为聚光对象 → `depth-of-field-blur`
- **motion-blur streak**（运动模糊拖影）—— 在快速飞入 / 摄影机推穿时加方向性的速度模糊 → `motion-blur-streak`
- **3D depth scatter-assemble**（3D 纵深散开-重组）—— 字形 / 元素散开成一团翻滚的 3D 云，然后重新组装 → `depth-scatter-assemble`
- **spring-pop entrance**（弹簧弹出入场）—— 标准的弹出入场；默认用流畅的长尾收敛，只有在明确要求俏皮时才过冲 → `spring-pop-entrance`
- **ambient glow / bloom**（氛围辉光 / 泛光）—— 在一个静态 hero 背后不经触发地柔和泛开的辉光 → `ambient-glow-bloom`

---

# Part 2 —— 运动准则（承重）

这四条规则决定了一支 clip 读起来是严肃的讲解视频，还是 agent 做出来的 PowerPoint。照写的去做。

## 1. 流畅胜过弹跳 —— 默认用 `power3`

元素应该使用**长尾减速曲线，让它们流畅地收住。大多数情况下 `power3` 就够了。** 不要弹跳，不要过冲，不要把 `back.out` / `bounce.out` / `elastic.out` 当默认值。

在用户做的 Remotion / HyperFrames 视频里，弹跳是**头号让人瞬间出戏的东西**，而 agent 几乎从来做不对 —— 它以为弹跳能增加强调，但这份强调是以牺牲干净利落为代价换来的。严肃的动效设计工作室也是同样的感受。**流畅永远赢。** 过冲被降级为**罕见的、明确要求俏皮时才用的例外**（一个面向消费者 / 好玩的 logo 重击、一次刻意的敲钟式落点）—— 绝不是本家风格。把意图写成长尾收敛；worker 会映射为 `power3`（快速到达时用 `expo.out`）。见 `../../hyperframes-animation/rules/spring-pop-entrance.md` —— 它现在开篇就讲流畅收敛。（这种收敛的精确形式是一个临界阻尼弹簧；worker 有一个预先烘焙好、seek 安全的 `springEase` —— ζ=1 —— 在 `../../hyperframes-animation/adapters/gsap-easing-and-stagger.md` → Spring Eases 里，用于收敛本身就是主角的时候。真实的物理，同样的准则 —— 不是允许弹跳的通行证。）

## 2. 在后 ~50% 依次揭示，卡准旁白

这是反 PowerPoint 的机制 —— 比"把展开放在中间"更锋利。

- **不要在场景的前 ~25% 就把所有东西都堆到屏幕上。** 一上来就急着把所有内容塞进来，恰恰是造成幻灯片感的原因。
- **在旁白提到某个元素时再揭示它 —— 一行字、一张卡片，哪怕是一个 h1**，把揭示依次排布在场景的**后 ~50%** 里。agent 的工作量一样，但这一段剪辑变得连贯，也有了节奏。
- **少即是多。** 屏幕上东西更少、每个都卡在自己的 VO 节拍上到达，胜过一张动一下就冻住的满画布。

实际操作：一帧的镜头序列几乎什么都不前置 —— 入场只承载 t=0 时旁白正在说的内容，其余元素在 timeline 里等待它们的口播提示。一次揭示对应 Part 1 里一个展开类的运动（`per-word staggered reveal`、`cluster→outward expansion`、一个 `count-up`、一个与逐词 rail 同步的 `asr-keyword-glow`）。

## 3. 不要偷懒的呼吸，不要糟糕的平移 / 推近 —— "宁可没有运动，也不要糟糕的运动"

agent 用来伪造"活力"的两种条件反射式做法，看起来都很廉价：

- **不要偷懒的呼吸。** 让卡片 / 文字在循环里放大缩小来显得"有生命"，是一眼就能看穿的廉价做法。不要去用它。
- **不要在后半段做糟糕的慢速平移 / 推近。** 在场景后 ~50% 对元素做慢速平移或推近，**会打乱观众的视线，造成眼睛不适** —— 它会主动让画面变得更糟，而不是更好。

两者的修法是同一个：**让元素的揭示与脚本同步错开**（规则 2）。总原则是：**"我宁可没有运动，也不要糟糕的运动。"** 一个停住的静止画面，好过一个靠呼吸或漂移的摄影机维持"活力"的画面。停留期间**唯一认可的活力**是**细微抖动** —— 一个小幅度的低振幅抖动，既不让画面显得死板，也不显得无力（这是当下视频作品里在用的做法）。其他一切都保持不动。

## 4. 内部接缝要做成速度匹配切

当一帧有内部接缝时 —— 场景内替换、Scene 到 Scene 的切、一行文字换到另一行 —— 把它做成**速度匹配切**，而不是生硬的幻灯片式切换：在速度峰值处切，两侧方向和速度一致。目录（四种技法、模糊逻辑，以及什么时候用哪个）在 `cut-catalog.md`；这些运动列在 Part 1 的**接缝切**下面。

## 一句话总结

流畅长尾（`power3`）胜过弹跳；在后 ~50% 依次揭示并卡准 VO（不要在前 25% 一股脑堆上去）；不要偷懒的呼吸，也不要糟糕的慢速平移 / 推近 —— 宁可静止，细微抖动是唯一的活力；在速度峰值处切，方向 / 速度一致（→ `cut-catalog.md`）。

---

# Part 3 —— seek 安全核心（硬规则）

一帧是一条**被逐帧 seek 的暂停 GSAP timeline**，所以实时引擎里某些"持续"类的意图渲染不出来 —— 不要用它们来命名。无论准则怎么说，这些都没有商量余地。

- **不要无限 / 永久运动** —— "粒子无止境地循环"、"logo 永远在转"、"跑马灯循环播放"。任何活力（细微抖动、SVG 内部活动、必要的有界氛围运动）都是**覆盖停留时长的有限 tween**，绝不用 `repeat` / `yoyo`。
- **不要随机性或挂钟时间** —— 不要 `Math.random` 粒子场，不要 `Date.now` 漂移。每次渲染必须完全相同；只命名确定性的运动（错开以及任何变化都从元素索引推导）。
- **入场用 `fromTo`** —— 显式写出起始状态，这样 seek 到 `t=0` 时元素能落在正确的位置；绝不依赖 CSS 隐藏的起始状态（在 tween 接管之前它会以可见状态渲染出来，并在 seek 时闪烁）。
- **不要用 CSS `transition` / `@keyframes` 做运动** —— CSS 动画跑在浏览器时钟上，独立于 HF 的 seek 时钟；它会失步并闪烁。所有运动都在暂停的 GSAP timeline 里驱动。
- **只有入场 + 依次揭示 —— 视频中途不要出场。** 这一帧通过 harness 的转场卸载；那个被注入的 `transition_in` **就是**出场。出场运动只属于最后一帧。（`cut-catalog.md` 里 worker 构建的接缝切是帧内的，不是这一帧的出场。）

## 禁止 —— 失败模式

**幻灯片（首要的失败模式）：** 所有东西在前 ~25% 就堆到屏幕上；内容入场后就冻住；没有任何东西在它的 VO 提示点揭示。用规则 2 修（卡准 VO 的依次揭示）。

**廉价的活力：** 把循环呼吸当"生命"；后半段的慢速平移 / 推近打乱视线；许多元素各自独立漂浮当作"运动"。用规则 3 修（静止 + 只用细微抖动）。

**弹跳：** 把 `back.out` / `bounce.out` / `elastic.out` 当默认入场；手工打关键帧做的过冲。用规则 1 修（`power3` 长尾；只有在明确要求俏皮时才过冲）。

**始终：** 不要 `repeat` / `yoyo`；不要 `Math.random` / `Date.now`；不要所有元素同时入场（要依次或错开）。

## 在一个镜头里命名运动 —— 示例

> Scene 1（0.0–1.0s）：纯色底；hero 标题通过 **per-word staggered reveal**（`dynamic-content-sequencing`）入场，以流畅的长尾收敛收住（`power3`）；根节点上的慢速 **push**（`multi-phase-camera`）保持稳定 —— 后半段不再推一次。
> Scene 2（1.0–3.0s）：随着 VO 说到每一步，五个机制节点通过 **cluster→outward expansion**（`center-outward-expansion`）**依次**揭示，然后一个 **value-scaled counter**（`counting-dynamic-scale`）在它们下方往上跳 —— 这是后半段的揭示，卡准脚本，而不是在 t=0 一股脑堆上去。
> Scene 3（3.0–4.2s）：停在结果上；VO 说到揭晓词时，**keyword glow**（`asr-keyword-glow`）落在这个词上；收住并保持静止 —— 最多用**细微抖动**（`sine-wave-loop`，低振幅）维持活力；不要呼吸，不要漂移。

每个场景写出运动名 + 它的规则 id（接缝切则写 `cut-catalog.md`）；曲线、毫秒数和错开交给 worker 去挑 —— 默认用 `power3`。
