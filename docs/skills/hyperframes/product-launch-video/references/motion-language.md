<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/product-launch-video/references/motion-language.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 运动语言 —— 动作词表 + 运动准则 + seek 安全核心

> 这是 **Step 4（视觉设计）**的运动层。当你写一帧的**带时间码的镜头序列**时，你要**直接从下面的词表里**为每个场景的动作命名 —— 这是一份有名有姓的动作色板，收录的是黄金语料实际用到的动作。每个动作都附带它在本 skill 本地 `../../hyperframes-animation/rules/` 里的**支撑规则 id**；引用这个 id，这样当 **frame worker** 在 Step 5 实现它时，这个动作能落到一份真实的配方上（worker 会读 `../../hyperframes-animation/rules/<id>.md` 里的规则正文 —— 它复现这个动作，而不是凭名字去猜）。你用**角色 / 动作名**来命名运动，绝不用原始的 GSAP 曲线、毫秒数或交错公式 —— 曲线由 worker 来映射。帧与帧之间的**转场不归你管**：story 指定 `transition_in`，由 harness 注入；这个注入的转场**就是**该帧的退出。至于 worker 在一帧**内部**构建的切换（场景内替换、场景到场景的接缝），见 `cut-catalog.md` 里的目录。

一支好的宣传片感觉像一部连续的影片 —— 一台摄像机，一种运动手感，**流畅并与旁白卡准时间** —— 而不是一堆动一下就定住的幻灯片。Part 2 的准则是承重的：拿不准时，照它说的做。

---

# Part 1 —— 动作词表

为场景的运动命名时，就从这份色板里取。挑一个与这一拍匹配的动作，在镜头序列里写出它的名字，并在 `→` 后面引用规则 id。蓝图（`../../hyperframes-animation/blueprints/`）在它们的 `rule mapping` 里用的也是同样这些动作名；你们取自同一份共享色板。在一个镜头的各个场景里组合 2–4 个动作（入场 → 依次揭示 → 落定），不要一次全上。

## 动态文字

- **hard-cut / flash word-swap**（硬切 / 闪切换词）—— 一个词或一行字以瞬时切换替掉前一个（不淡入淡出、不滚动）；替换本身就是这一拍。→ `discrete-text-sequence`
- **in-place token cycle**（原位词元轮换）—— 一行固定的文字保持不动，只有其中的可变槽位在变，词 → 词 → 词。→ `discrete-text-sequence`
- **per-word staggered reveal**（逐词交错揭示）—— 一个短语逐词（或逐块）拼出来，每个都落在自己的一拍上。→ `dynamic-content-sequencing`
- **kinetic beat-slam**（动态节拍重击）—— 短语在一组共享的打击乐节拍上重重砸入，每个都有不同的入场方式，最后收在一个锁定的结尾上；这是"有冲击力 / 有节奏感"的标语的配方。→ `kinetic-beat-slam`

## 打字机

- **type-on with caret**（带光标的打字）—— 文字在一个闪烁的光标后面逐字打出来。→ `discrete-text-sequence`（光标闪烁 / 颜色再加 `context-sensitive-cursor`）
- **backspace-and-retype**（退格重打）—— 一行字打出来，删掉最后一个（或几个）词，再重新打一个新的（纠正错字、换个说法）。→ `discrete-text-sequence`（+ `context-sensitive-cursor`）

## 计数 / 数据

- **value-scaled counter**（随数值缩放的计数器）—— 一个数字往上计数，字号随数值变大，让攀升本身逐步升级。→ `counting-dynamic-scale`
- **bars / progress / star wipe**（柱条 / 进度 / 星级擦除）—— 一个数字配一个会填充的图形：柱高交错、进度条 / 进度环填充、按小数比例擦出的星级评分。→ `stat-bars-and-fills`

## 揭示 / 解码

- **3D char flip-decode**（3D 字符翻转解码）—— 字符在 3D 中翻转，从乱码字形解析成真实文字（解密的感觉）。→ `hacker-flip-3d`
- **SVG self-draw**（SVG 自绘）—— 一个轮廓 / 图标 / 圆环一笔一笔地把自己画出来。→ `svg-path-draw`

## 摄像机

- **push / focus / drift**（推 / 聚焦 / 漂移）—— 在帧根节点上做的一组顺序摄像机运动（拉远 → 聚焦 → 推近）外加持续的微漂移；电影感的基线。→ `multi-phase-camera`
- **zoom-to-target**（缩放到目标）—— 放大到一个不在中心的元素上（缩放 + 反向平移，让它保持在画框里）。→ `coordinate-target-zoom`
- **pan / focus-lock**（平移 / 聚焦锁定）—— 一台虚拟摄像机变换一个 `.world` 包裹层，平移 / 缩放 / 锁定到某个区域。→ `viewport-change`
- **camera-cursor-tracking**（摄像机跟随光标）—— viewport 锁定在一个移动的焦点上（一个正在打字的光标），先是静态构图，然后是锁定焦点的跟随。→ `camera-cursor-tracking`

## 布局运动

- **cluster→outward expansion**（聚拢→向外展开）—— 元素一开始聚在中心，然后同步向外展开到各自的最终位置。→ `center-outward-expansion`
- **orbit**（环绕）—— 元素从 3D 空间翻转进入，落定成一条持续的椭圆轨道（入场时在轨道位置上原地翻转）。→ `orbit-3d-entry`
- **split-tilt cards**（分列倾斜卡片）—— 两张卡片并排，rotationY 方向相反地倾斜，各自从自己那一侧进入（对比 / 前后对照）。→ `split-tilt-cards`
- **logo/avatar ring + connectors**（logo / 头像环 + 连线）—— 头像或 logo 排在一个椭圆环上，用 SVG 连线连到中心点，交错入场。→ `avatar-cloud-network`

## 表面 / UI

- **3D page-scroll reveal**（3D 页面滚动揭示）—— 一整个网页作为一张倾斜的 3D 卡片，内部内容滚动以揭示特定区块。→ `3d-page-scroll`
- **cursor click + ripple**（光标点击 + 波纹）—— 光标移到目标上，点击时与目标一起按下，并发出一圈扩散的波纹。→ `cursor-click-ripple`
- **button press**（按钮按压）—— 一次有触感的按压：先压缩，再弹簧回弹，可选释放时的迸发 / 辉光。→ `press-release-spring`（如果是光标和目标一起被压缩的点击，用 `physics-press-reaction`）
- **keyword glow**（关键词辉光）—— 关键词按"起音-衰减-静止"的包络亮起辉光 + 缩放 + 变色，与词 rail 同步。→ `asr-keyword-glow`

## 变形 / 交接

- **scale-swap**（缩放交换）—— 位于同一屏幕中心的两个元素完成交接：退出的元素组缩小 + 淡出，同时进入的元素到达。→ `scale-swap-transition`
- **card morph-anchor**（卡片变形锚点）—— 一个容器在两个镜头之间变换视觉尺寸 + 圆角 + 表面，然后淡出，露出下面真正的目标（HyperFrames 用统一的 `scale`，而不是 `width`/`height`）。→ `card-morph-anchor`

## 接缝切换（由 worker 在帧内构建）

worker 在一帧自己的各个 Scene 之间编写的速度匹配切换。在镜头序列里写出接缝的名字；配方在目录里，而不是某一个 `../../hyperframes-animation/rules/` id。

- **zoom-through / inverse zoom-through** —— Z 轴上的场景内替换；前向读起来是"向前推进穿过"，反向读起来是"抵达"（收获型）。→ `cut-catalog.md`
- **cut-the-curve** —— 场景到场景的切，两侧以匹配的速度朝同一方向运动。→ `cut-catalog.md`
- **waterfall cut** —— 词粒度的 cut-the-curve，一道越过文字到文字接缝的波浪。→ `cut-catalog.md`

## 强调 / 记号笔

- **highlight / circle / burst / scribble**（高亮 / 圈画 / 迸发 / 涂鸦）—— 用记号笔画在一个词或元素上的强调：黄色高亮扫过、手绘圆圈、放射状迸发、涂鸦，或粗糙的草图轮廓。→ `css-marker-patterns`

## 停留期间的生命感（谨慎使用 —— 见 Part 2）

- **subtle jitter**（细微抖动）—— 让一个已落定的画面保持生命感的认可做法：在停住的元素上施加一点小幅度、低振幅的位置 / 缩放抖动。这是动态图形里的一个窍门，读起来"活着"，却不会显得"虚弱"。→ `sine-wave-loop`（低振幅档位）
- **live SVG internals**（SVG 内部活动）—— SVG 内部部件运动，让图标显得活着（旋转的指针、摆动的叶片、跳动的点、虚线流动）；这样没问题，因为是主体本身在做事，而不是一张卡片在呼吸。→ `svg-icon-enrichment`
- **finite bounded ambient**（有限有界的环境运动）—— 在**一个**停住的 hero 上做一次有界的呼吸 / 漂移，仅在确实需要时使用；已降级 —— 优先考虑依次揭示或抖动。→ `sine-wave-loop`

## 新增的动作 —— 现已有本地规则支撑

黄金语料需要的五个动作已经加进本 skill 的 `../../hyperframes-animation/rules/`，补全了上面的词表：

- **depth-of-field / selective-blur**（景深 / 选择性模糊）—— 模糊不在焦点上的那部分元素，以聚光焦点元素 → `depth-of-field-blur`
- **motion-blur streak**（运动模糊拖尾）—— 在快速飞入 / 摄像机穿推上加方向性的速度模糊 → `motion-blur-streak`
- **3D depth scatter-assemble**（3D 纵深散开-组装）—— 字形 / 元素散成一团翻滚的 3D 云，然后重新组装 → `depth-scatter-assemble`
- **spring-pop entrance**（弹簧弹出入场）—— 标准的弹出入场；默认用平滑的长尾落定，只有明确要俏皮时才用过冲 → `spring-pop-entrance`
- **ambient glow / bloom**（环境辉光 / 泛光）—— 在一个静态 hero 背后、无需触发的柔和辉光泛开 → `ambient-glow-bloom`

---

# Part 2 —— 运动准则（承重）

这四条规则决定了一个片段读起来是一支严肃的发布视频，还是一份 agent 做出来的 PowerPoint。照写的去做。

## 1. 流畅胜过弹跳 —— `power3` 是默认值

元素应当用**长尾减速曲线，让它们平滑地落定。大多数情况下 `power3` 就够了。**不要弹跳，不要过冲，不要把 `back.out` / `bounce.out` / `elastic.out` 当默认。

弹跳是用户自制的 Remotion / HyperFrames 视频里**头号让人瞬间出戏的东西**，而 agent 几乎从来做不对 —— 它以为弹跳能增加强调，但它是用干净利落为代价买来的强调。严肃的发布视频工作室也是同样的感受。**流畅永远赢。**过冲被降级为**罕见的、明确要俏皮的例外**（面向消费者的 / 好玩的 logo 重击、刻意的敲钟一击）—— 绝不是默认风格。把意图写成长尾落定；worker 会映射成 `power3`（快速到达时用 `expo.out`）。见 `../../hyperframes-animation/rules/spring-pop-entrance.md` —— 它现在开头讲的就是平滑落定。（这种落定的精确形式是一个临界阻尼弹簧；当落定本身就是主角时，worker 可以用 `../../hyperframes-animation/adapters/gsap-easing-and-stagger.md` → Spring Eases 里一个预先烘焙好的、seek 安全的 `springEase` —— ζ=1。真实的物理，同样的准则 —— 不是弹跳的许可证。）

## 2. 在后 ~50% 依次揭示，与旁白卡准时间

这是反 PowerPoint 的机制 —— 比"把展开部分放在中间"更精确。

- **不要在场景的前 ~25% 就把所有东西倒上屏幕。**一开始就把内容一股脑塞进来，恰恰是造成幻灯片感的原因。
- **每一块内容 —— 一行字、一张卡片，甚至一个 h1 —— 都在旁白提到它时才揭示**，把揭示依次排布在场景的**后 ~50%**。agent 的工作量一样，但这一剪变得连贯，也有了节奏。
- **少即是多。**屏幕上的东西少一些、每个都踩着自己的 VO 节点到达，胜过一整块动一下就定住的画布。

实际做法：一帧的镜头序列在开头几乎什么都不放 —— 入场只承载 t=0 时 VO 正在说的内容，其余元素在 timeline 里等待各自的口播提示。一次揭示对应 Part 1 里一个展开类的动作（`per-word staggered reveal`、`cluster→outward expansion`、一个 `count-up`、一个与词 rail 同步的 `asr-keyword-glow`）。

## 3. 不要偷懒的呼吸，不要糟糕的平移 / 推 —— "宁可没有运动，也不要糟糕的运动"

agent 用来假装"有生命感"的两种条件反射做法，看起来都很廉价：

- **不要偷懒的呼吸。**让卡片 / 文字在循环里放大缩小来显得"活着"，是廉价感的标志。不要用它。
- **不要在后半段做糟糕的慢平移 / 推。**在场景后 ~50% 对元素做慢平移或推，**会打乱观众的视线，造成眼部不适** —— 它会让画面变得更糟，而不是更好。

两者的解法相同：**让元素的揭示与脚本同步交错**（规则 2）。统领性的原则是：**"我宁可没有运动，也不要糟糕的运动。"**一个停住、静止的画面，好过一个靠呼吸或漂移的摄像机维持"生命感"的画面。停留期间**唯一认可的生命感**是**细微抖动**（subtle jitter）—— 一点小幅度、低振幅的抖动，让画面不显得死气沉沉，又不显得虚弱（当前的视频作品里就在用）。其他一切都保持静止。

## 4. 内部接缝是速度匹配的切

当一帧有内部接缝时 —— 场景内替换、Scene 到 Scene 的切、一行文字换到另一行 —— 把它做成**速度匹配的切**，而不是生硬的幻灯片式切换：在速度峰值处切，两侧的方向和速度要匹配。目录（四种技法、模糊逻辑，以及什么时候用哪种）在 `cut-catalog.md`；这些动作列在 Part 1 的**接缝切换**下。

## 一行总结

流畅的长尾（`power3`）胜过弹跳；在后 ~50% 依次揭示并与 VO 卡准时间（不要在前 25% 一股脑倒出来）；不要偷懒的呼吸，不要糟糕的慢平移 / 推 —— 宁可静止，细微抖动是唯一的生命感；在速度峰值处切，方向 / 速度要匹配（→ `cut-catalog.md`）。

---

# Part 3 —— seek 安全核心（硬性规则）

帧是一条**逐帧 seek 的暂停 GSAP timeline**，所以实时引擎里某些"持续"的意图渲染不出来 —— 不要写它们。无论准则怎么说，这些都没有商量余地。

- **不要无限 / 永远持续的运动** —— "粒子无限循环"、"logo 永远旋转"、"跑马灯重复播放"。任何生命感（细微抖动、SVG 内部活动、必要的有界环境运动）都是**覆盖停留时长的有限 tween**，绝不用 `repeat` / `yoyo`。
- **不要随机性或挂钟时间** —— 不要 `Math.random` 粒子场，不要 `Date.now` 漂移。每次渲染必须完全一致；只写确定性的运动（交错和任何变化都从元素索引推导）。
- **入场用 `fromTo`** —— 显式写出起始状态，这样 seek 到 `t=0` 时元素能正确就位；绝不依赖 CSS 隐藏的起始状态（它会在 tween 接管之前就渲染成可见的，并在 seek 时闪烁）。
- **不要用 CSS `transition` / `@keyframes` 做运动** —— CSS 动画跑在浏览器时钟上，与 HF 的 seek 时钟无关；它会失步并闪烁。所有运动都在暂停的 GSAP timeline 内驱动。
- **只做入场 + 依次揭示 —— 不在视频中途退出。**帧通过 harness 的转场卸载；那个注入的 `transition_in` **就是**退出。退出运动只属于最后一帧。（`cut-catalog.md` 里由 worker 构建的接缝切换是帧内的，不是该帧的退出。）

## 禁止 —— 失败模式

**幻灯片（首要失败）：**所有东西都在前 ~25% 倒上屏幕；内容进入后就定住；没有任何东西在它的 VO 提示处揭示。用规则 2 修正（与 VO 卡准时间的依次揭示）。

**廉价的生命感：**把循环呼吸当"生命"；后半段的慢平移 / 推打乱视线；许多元素各自漂浮充当"运动"。用规则 3 修正（静止 + 只用细微抖动）。

**弹跳：**把 `back.out` / `bounce.out` / `elastic.out` 当默认入场；手动打关键帧做过冲。用规则 1 修正（`power3` 长尾；只有明确要俏皮时才过冲）。

**始终：**不用 `repeat` / `yoyo`；不用 `Math.random` / `Date.now`；不要所有元素同时入场（按顺序或交错）。

## 在一个镜头里命名运动 —— 示例

> Scene 1（0.0–1.0s）：纯色底；hero 标题通过 **per-word staggered reveal**（`dynamic-content-sequencing`）入场，以平滑的长尾落定（`power3`）；根节点上的慢速 **push**（`multi-phase-camera`）保持稳定 —— 后半段不再二次推近。
> Scene 2（1.0–3.0s）：随着 VO 说出每项能力，五个功能图标通过 **cluster→outward expansion**（`center-outward-expansion`）**依次**揭示，然后一个 **value-scaled counter**（`counting-dynamic-scale`）在它们下方往上计数 —— 这是后半段的揭示，与脚本卡准时间，而不是在 t=0 一股脑倒出来。
> Scene 3（3.0–4.2s）：停在结果上；当 VO 说出收获型的那个词时，**keyword glow**（`asr-keyword-glow`）落在它上面；落定并保持静止 —— 最多用 **subtle jitter**（`sine-wave-loop`，低振幅）维持生命感；不呼吸，不漂移。

每个场景写出动作 + 它的规则 id（接缝切换则写 `cut-catalog.md`）；曲线、毫秒数和交错交给 worker 去挑 —— 默认 `power3`。
