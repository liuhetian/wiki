<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/pr-to-video/references/motion-language.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 动效语言 —— 运动词汇 + 动效准则 + seek 安全的核心

> **Step 4（视觉设计）** 的动效层。当你写一帧的**带时间码的镜头序列**时，每个场景的运动都**从下面的词汇里内联选名** —— 这是一套具名的色板，收录了黄金语料实际用到的运动。每个运动都附有它在本 skill 本地 `../../hyperframes-animation/rules/` 里的**支撑 rule id**；引用这个 id，这样当 **frame worker** 在 Step 5 实现它时，这个运动就能解析到一份真实的配方（worker 会读 `../../hyperframes-animation/rules/<id>.md` 里的 rule 正文 —— 它复现这个运动，而不是凭名字去猜）。你按**角色 / 运动名**来命名动效，绝不写原始的 GSAP 曲线、毫秒数或错开公式 —— 曲线由 worker 来对应。帧与帧之间的**转场不归你管**：故事指定 `transition_in`，harness 注入它；被注入的那个转场**就是**这一帧的退场。至于 worker 在一帧**内部**构建的切换（场景内替换、场景到场景的接缝），见 `cut-catalog.md` 里的目录。

一支好的代码变更讲解视频，感觉像一部连续的影片 —— 一台摄像机、一种动效手感，**流畅且与旁白同步** —— 而不是一堆动一下就冻住的幻灯片。在 PR 讲解视频里，展开过程往往*就是*揭示本身：diff hunk 逐字打出、before→after 的变形、影响数据落定。第 2 部分的准则是承重的：拿不准时，照它说的做。

---

# 第 1 部分 —— 运动词汇

给一个场景的动效命名时，就从这套色板里取。挑一个与段落节拍相符的运动，在镜头序列里写出它的名字，并在 `→` 之后引用 rule id。blueprint（`../../hyperframes-animation/blueprints/`）在它们的 `rule mapping` 里用的也是这些运动的名字；你们取自同一套共享色板。在一个镜头的各场景中组合 2–4 个（入场 → 依次揭示 → 落定），不要一次全用上。

## 动态文字

- **hard-cut / flash word-swap** —— 一个词或一行字以瞬间切换的方式替换上一个（没有渐变 / 滚动）；替换本身就是这一拍。→ `discrete-text-sequence`
- **in-place token cycle** —— 固定的一行保持不动，只有其中的可变槽位在变，token → token → token。→ `discrete-text-sequence`
- **per-word staggered reveal** —— 一个短语逐词（或逐块）拼出来，每个词落在自己的那一拍上。→ `dynamic-content-sequencing`
- **kinetic beat-slam** —— 一串短语按一组共享的打击乐节拍依次砸进来，每个都有不同的入场方式，最终收在一个锁定的结尾上；这是"有冲劲 / 有节奏感"的标语的配方。→ `kinetic-beat-slam`

## 打字机

- **type-on with caret** —— 文字在一个闪烁的光标后面逐字符打出来。→ `discrete-text-sequence`（光标闪烁 / 颜色另加 `context-sensitive-cursor`）
- **backspace-and-retype** —— 一行字打出来，删掉最后一个（或几个）词，再重新打一个新词（纠正笔误、换个说法）。→ `discrete-text-sequence`（+ `context-sensitive-cursor`）

## 计数 / 数据

- **value-scaled counter** —— 一个数字向上计数，字号随数值增大，让攀升本身逐步升级。→ `counting-dynamic-scale`
- **bars / progress / star wipe** —— 数字配上一个会被填满的图形：柱高错开、进度条 / 进度环填充、按小数比例擦出的星级评分。→ `stat-bars-and-fills`

## 揭示 / 解码

- **3D char flip-decode** —— 字符以 3D 方式翻转，从乱码字形解析成真实文字（解密的感觉）。→ `hacker-flip-3d`
- **SVG self-draw** —— 一个轮廓 / 图标 / 圆环一笔一笔地把自己画出来。→ `svg-path-draw`

## 镜头

- **push / focus / drift** —— 作用在帧根节点上的一组依次进行的镜头运动（拉远 → 聚焦 → 推近），外加持续的微漂移；电影感的基线。→ `multi-phase-camera`
- **zoom-to-target** —— 推近到一个不在中心的元素（缩放 + 反向平移，让它保持在画面中）。→ `coordinate-target-zoom`
- **pan / focus-lock** —— 一台虚拟摄像机变换一个 `.world` 包裹层，来平移 / 缩放 / 锁定到某个区域。→ `viewport-change`
- **camera-cursor-tracking** —— viewport 锁定一个移动的焦点（一个打字光标），先是静态取景，然后锁焦跟踪。→ `camera-cursor-tracking`

## 布局运动

- **cluster→outward expansion** —— 元素开始时聚在中心，然后同步向外扩展到各自的最终位置。→ `center-outward-expansion`
- **orbit** —— 元素从 3D 空间翻入，落定成一个持续的椭圆轨道（入场时在轨道位置上原地翻转）。→ `orbit-3d-entry`
- **split-tilt cards** —— 两张并排的卡片，带有相反的 rotationY 倾斜，各自从自己那一侧入场（对比 / 前后对照）。→ `split-tilt-cards`
- **logo/avatar ring + connectors** —— 头像或 logo 排在一个椭圆环上，用 SVG 连线连到一个中心点，错开入场。→ `avatar-cloud-network`

## 表面 / 界面

- **3D page-scroll reveal** —— 一整个网页作为一张倾斜的 3D 卡片，内部内容滚动，揭示特定区块。→ `3d-page-scroll`
- **cursor click + ripple** —— 一个光标移到目标上，点击时与目标一起按下，并发出一圈扩散的涟漪。→ `cursor-click-ripple`
- **button press** —— 有触感的按压：先压缩，再弹簧回弹，可选释放时的爆发 / 辉光。→ `press-release-spring`（或者用 `physics-press-reaction`，适用于光标和目标一起被压缩的点击）
- **keyword glow** —— 关键词按 起音-衰减-静息 的包络亮起辉光 + 缩放 + 变色，与一条词 rail 同步。→ `asr-keyword-glow`

## 变形 / 交接

- **scale-swap** —— 处在同一屏幕中心的两个元素完成交接：退场的那一组缩小 + 淡出，同时入场的那一组到来。→ `scale-swap-transition`
- **card morph-anchor** —— 一个容器在两个镜头之间变形其视觉尺寸 + 圆角 + 表面，然后淡出，露出下面真正的目标（HyperFrames 用统一的 `scale`，不用 `width`/`height`）。→ `card-morph-anchor`

## 接缝切换（由 worker 构建，在一帧之内）

worker 在一帧自己的各个 Scene 之间编写的速度匹配切换。在镜头序列里写出接缝的名字；配方在目录里，而不是某一个 `../../hyperframes-animation/rules/` id。

- **zoom-through / inverse zoom-through** —— 在 Z 轴上的场景内替换；向前的读起来是"向前穿过"，反向的读起来是"抵达"（揭晓）。→ `cut-catalog.md`
- **cut-the-curve** —— 场景到场景的切换，两侧以匹配的速度朝同一方向运动。→ `cut-catalog.md`
- **waterfall cut** —— 词粒度的 cut-the-curve，一道越过文字到文字接缝的波浪。→ `cut-catalog.md`

## 强调 / 标记

- **highlight / circle / burst / scribble** —— 在一个词或元素上用马克笔式的强调：黄色高亮扫过、手绘圆圈、放射状爆发、涂鸦，或粗糙的草图轮廓。→ `css-marker-patterns`

## 停留期间的生气（慎用 —— 见第 2 部分）

- **subtle jitter** —— 让一个已落定的帧保持生气的认可方式：在停留的元素上加一点小幅度、低振幅的位置 / 缩放抖动。这是动态图形的技巧，读起来"有生气"而不显得"虚弱"。→ `sine-wave-loop`（低振幅档）
- **live SVG internals** —— SVG 内部的部件在动，让图标显得有生气（旋转的指针、摆动的叶片、脉动的点、虚线流动）；这没问题，因为这是主体自己在做事，而不是一张卡片在呼吸。→ `svg-icon-enrichment`
- **finite bounded ambient** —— 在**一个**停留的 hero 上做一次有界的呼吸 / 漂移，只在真正需要时使用；降低优先级 —— 先考虑依次揭示或抖动。→ `sine-wave-loop`

## 新增的运动 —— 现已有本地 rule 支撑

黄金语料需要的五个运动已加入本 skill 的 `../../hyperframes-animation/rules/`，补全了上面的词汇：

- **depth-of-field / selective-blur** —— 模糊失焦的那部分，聚光照亮焦点元素 → `depth-of-field-blur`
- **motion-blur streak** —— 快速飞入 / 镜头推穿时的方向性速度模糊 → `motion-blur-streak`
- **3D depth scatter-assemble** —— 字形 / 元素散开成一团翻滚的 3D 云，然后重新拼合 → `depth-scatter-assemble`
- **spring-pop entrance** —— 标准的弹出式入场；默认用平滑的长尾落定，只有在明确要俏皮时才过冲 → `spring-pop-entrance`
- **ambient glow / bloom** —— 在静态 hero 后面绽开的、无触发的柔和辉光 → `ambient-glow-bloom`

---

# 第 2 部分 —— 动效准则（承重）

这四条规则，决定了一个片段读起来是一支严肃的代码变更讲解视频，还是一份 agent 做出来的 PowerPoint。照写的去做。

## 1. 流畅胜过弹跳 —— `power3` 是默认

元素应当使用**长尾的减速曲线，让它们平滑地落定。大多数情况下 `power3` 就够了。**不要弹跳，不要过冲，不要把 `back.out` / `bounce.out` / `elastic.out` 当默认。

在用户做的 Remotion / HyperFrames 视频里，弹跳是**头号让人瞬间出戏的东西**，而 agent 几乎从来做不对 —— 它以为弹跳能增加强调，但这份强调是以牺牲干净为代价换来的。严肃的动效设计工作室也是这么看的。**流畅永远胜出。**过冲被降级为**罕见的、明确要俏皮的例外**（一个面向消费者的 / 好玩的 logo 砸入、一次刻意的敲钟式落点）—— 绝不是默认风格。把意图写成长尾落定；由 worker 对应到 `power3`（快速到达时用 `expo.out`）。见 `../../hyperframes-animation/rules/spring-pop-entrance.md` —— 它现在开头讲的就是平滑落定。（这种落定的精确形式是一个临界阻尼弹簧；当落定本身就是主角时，worker 可以用 `../../hyperframes-animation/adapters/gsap-easing-and-stagger.md` → Spring Eases 里烘焙好的、seek 安全的 `springEase` —— ζ=1。真实的物理，同样的准则 —— 不是允许弹跳的许可证。）

## 2. 在后约 50% 依次揭示，与旁白同步

这是反 PowerPoint 的机制 —— 比"把展开放在中间"更精准。

- **不要在场景的前约 25% 就把所有东西倒上屏幕。**一开头就把全部内容赶上来，正是造成幻灯片感的原因。
- **每一样东西 —— 一行字、一张卡片，哪怕是一个 h1 —— 都在旁白提到它时才揭示**，把揭示排布在场景的**后约 50%**。agent 的工作量一样，但剪辑会变得连贯，也有了节奏。
- **少即是多。**屏幕上东西少一些，每一样都在它的 VO 节拍上到来，胜过一块动一下就冻住的满屏画布。

具体来说：一帧的镜头序列几乎什么都不预先堆上来 —— 入场只承载旁白在 t=0 时正在说的内容，其余元素在 timeline 里等着各自的口播提示。一次揭示对应第 1 部分里一个展开类的运动（`per-word staggered reveal`、`cluster→outward expansion`、一个 `count-up`、一个与词 rail 同步的 `asr-keyword-glow`）。

## 3. 不要偷懒的呼吸，不要糟糕的平移 / 推近 —— "宁可没有动效，也不要糟糕的动效"

agent 用来伪造"生气"的两种条件反射式做法，看起来都很廉价：

- **不要偷懒的呼吸。**让卡片 / 文字循环往复地放大缩小来显得"有生气"，是廉价感的明显标志。不要用它。
- **不要在后半段做糟糕的慢速平移 / 推近。**在场景的后约 50% 对元素做慢速平移或推近，会**打乱观众的视线，造成眼睛不适** —— 它实际上是让画面变得更糟，而不是更好。

两者的解法相同：**按脚本的时间错开元素的揭示**（规则 2）。而统领的原则是：**"我宁可没有动效，也不要糟糕的动效。"**一个停住不动的帧，好过一个靠呼吸或漂移镜头维持"生气"的帧。停留期间**唯一被认可的生气**是**轻微抖动（subtle jitter）** —— 一点小幅度的低振幅抖动，让画面不显得死气沉沉，又不显得虚弱（现在 Code editorial 视频里就有）。其余一切都静止不动。

## 4. 内部接缝是速度匹配的切换

当一帧有内部接缝时 —— 场景内替换、Scene 到 Scene 的切换、文字到文字的换行 —— 把它做成一次**速度匹配的切换**，而不是生硬的幻灯片式切换：在速度峰值处切，两侧的方向和速度保持一致。目录（四种技法、模糊逻辑，以及什么时候用哪种）在 `cut-catalog.md`；这些运动列在第 1 部分的**接缝切换**下。

## 一句话总结

流畅的长尾（`power3`）胜过弹跳；在后约 50% 依次揭示，与 VO 同步（不要在前 25% 全部倒出来）；不要偷懒的呼吸，也不要糟糕的慢速平移 / 推近 —— 宁可静止，轻微抖动是唯一的生气；在速度峰值处切，方向 / 速度匹配（→ `cut-catalog.md`）。

---

# 第 3 部分 —— seek 安全的核心（硬性规则）

帧是一条**被逐帧 seek 的暂停 GSAP timeline**，所以实时引擎里的某些"持续性"意图是渲染不出来的 —— 不要去写它们。无论准则怎么说，这些都没有商量余地。

- **不要无限 / 永久的运动** —— "粒子无尽循环"、"logo 永远旋转"、"跑马灯一直重复"。任何生气（轻微抖动、SVG 内部的活动、确有需要的有界氛围运动）都是**覆盖停留时长的有限 tween**，绝不用 `repeat` / `yoyo`。
- **不要随机数或挂钟时间** —— 不要 `Math.random` 粒子场，不要 `Date.now` 漂移。每次渲染都必须完全一致；只写确定性的动效（错开和任何变化都由元素索引推导）。
- **入场用 `fromTo`** —— 显式写出起始状态，这样 seek 到 `t=0` 时元素能正确就位；绝不依赖 CSS 隐藏的起始状态（它会在 tween 接管之前就渲染为可见，并且在 seek 时闪烁）。
- **不要用 CSS `transition` / `@keyframes` 做动效** —— CSS 动画跑在浏览器时钟上，与 HF 的 seek 时钟无关；它会失去同步并闪烁。所有动效都在暂停的 GSAP timeline 内驱动。
- **只有入场 + 依次揭示 —— 视频中途不要退场。**帧通过 harness 的转场卸载；被注入的那个 `transition_in` **就是**退场。退场动效只属于最后一帧。（`cut-catalog.md` 里由 worker 构建的接缝切换是帧内的，不是这一帧的退场。）

## 禁止 —— 失败模式

**幻灯片（首要的失败）：**前约 25% 就把所有东西倒上屏幕；内容入场后就冻住；没有任何东西在它的 VO 提示上揭示。用规则 2 修复（与 VO 同步的依次揭示）。

**廉价的生气：**用循环呼吸充当"生命"；后半段的慢速平移 / 推近干扰视线；许多元素各自独立地漂浮充当"动效"。用规则 3 修复（静止 + 仅限轻微抖动）。

**弹跳：**把 `back.out` / `bounce.out` / `elastic.out` 当默认入场；手工 K 帧的过冲。用规则 1 修复（`power3` 长尾；只有在明确要俏皮时才过冲）。

**始终：**不要 `repeat` / `yoyo`；不要 `Math.random` / `Date.now`；不要所有元素同时入场（依次或错开）。

## 在镜头里命名动效 —— 示例

> Scene 1（0.0–1.0 秒）：纯色底；hero 标题通过 **per-word staggered reveal**（`dynamic-content-sequencing`）入场，平滑的长尾落定（`power3`）；根节点上的慢速 **push**（`multi-phase-camera`）保持平稳 —— 后半段不再推近。
> Scene 2（1.0–3.0 秒）：随着 VO 念出每个改动的文件，五个文件标签通过 **cluster→outward expansion**（`center-outward-expansion`）**依次**揭示，然后一个 **value-scaled counter**（`counting-dynamic-scale`）在它们下方把 +/− 总行数计上来 —— 后半段的揭示，与脚本同步，而不是在 t=0 时全倒出来。
> Scene 3（3.0–4.2 秒）：停留在结果上；**keyword glow**（`asr-keyword-glow`）在 VO 说出揭晓词时落在这个词上；落定后保持静止 —— 至多用**轻微抖动**（`sine-wave-loop`，低振幅）保持生气；不呼吸，不漂移。

每个场景写出运动名 + 它的 rule id（接缝切换则写 `cut-catalog.md`）；曲线、毫秒数和错开交给 worker 去挑 —— 默认用 `power3`。
