<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/prompt-type-submit-generate.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# prompt-type-submit-generate —— 输入提示词、提交、生成

**intent / 意图**：AI 时代的演示镜头 —— 一段 `[prompt / query / command]` 逐字符地打进一个**真实的**产品输入框（聊天输入框、搜索栏、终端提示符、URL 栏、侧栏助手），然后机器作答：先是状态表演，再进入流式回答 / agent 动作日志 / diff 卡片 / 图表 / 生成的产物 —— 或者片段在提交那一刻就切走，提问本身就是看点。键盘是演员，产品是回应者。区别于 `typewriter-reveal`（一行字作为纯排版打在空白区域上 —— 没有产品界面，也没有任何东西作答），也区别于 `cursor-ui-demo`（光标点击一个重建的 UI，经过一个个状态 —— 那里每一次变化都由指针驱动；这里任何光标动作都只负责为输入框做准备或完成提交，之后的每一次状态变化都是机器自己做的）。

**roles served / 服务的角色**

- Hook（来自 `app-window-push-in-prompt-typing`）：当开场是「看我提问」时 —— 打字出现的标题段落节拍，**一次**缓动推近紧紧落在产品的输入框上，提示词打出来，片段在提交时 / 刚提交后结束（子形态 A）。
- Hook（来自 `typed-command-output-scroll`）：当演示循环**本身**就是钩子时 —— 输入命令，输出逐步构建并滚动，切走之前第二条命令 / 重新输入已经开始，结束在动作进行中（子形态 B/C，配重启式结尾）。
- Product_Intro（来自 `prompt-typing-composer`）：当观众对产品的第一眼**就是**它的输入框时 —— 一个品牌段落节拍打开到输入界面，一段长提示词带着悬停 / 附件 / 下拉选择打出来，镜头温和地朝输入框或确认控件靠近（子形态 A，偶尔会一直跑到 agent 日志的兑现）。
- Product_Intro（来自 `search-query-walkthrough`）：当产品通过它的搜索入口来介绍时 —— 一段简短的 `[query]` 在闪烁的插入符后打出来，自动补全 / 结果**实时**填充，一次确认点击让结果状态落定（子形态 C，搜索外观）。
- Key_Feature（来自 `prompt-type-submit-generate`）：当这项能力以**一次**提示词→回应的往返来演示时 —— 提交后进入思考 / 状态阶段，然后是流式回答、带品牌图标的动作日志行、绿色 diff 卡片、自己绘制出来的图表，或者瞬间揭示一个生成的应用（子形态 A/B/C —— 这一族里覆盖面最宽的角色）。
- CTA（来自 `install-command-end-card`）：安装命令结尾卡 —— 收尾的 `[headline]` **降级**（缩小、变灰、上移），给一个弹簧弹入并横向拉宽的 `[terminal pill]` 腾出位置，`[install command]` 在闪烁的光标后打出来，两侧的元数据和一排 `[tool-icon row]` 弹出，完成的卡片长时间停留。没有提交，没有回应 —— 打出来的命令**本身**就是诉求（子形态 A，终端外观）。

**duration / 时长**：5.2–12 秒（A 提示词作钩子 5.2–12 秒，含约 7.4 秒的 CTA 结尾卡；B 完整生成循环 5.45–11.9 秒；C 即时结果界面 5.7–11.9 秒 —— 这是一个长篇幅的家族：大多数成员跑 7–12 秒，因为回应需要空间才能到来）

**shot structure / 镜头结构**（一个 `[product input]` 位于 `[product surface — app window, web page, terminal, browser chrome, sidebar]` 之上 / 之中，背景是 `[bg color]`；输入框是引力中心 —— 镜头最多朝它或远离它做一到两次有目的的移动，其余时间**锁定**；打字是在可见的插入符后逐字符进行的，回应内容逐步到来，绝不一股脑倒出；三个合并进来的子形态 —— **(A) 提示词作钩子**：片段在提交时 / 刚提交后（或一个词打到一半时）结束，提问本身就是看点；**(B) 完整生成循环**：提交 → 状态表演 → 输出一块一块构建；**(C) 即时结果界面**：机器用一个完成的界面作答，常在切走前再次查询）

- **Scene 0（可选，0.0–约 2 秒）—— 引入段落节拍。** 在输入框占据镜头之前，先做**一个**建立性动作：一个 `[headline]` 在居中位置打字出现然后清除；一张 `[title card]` 硬切走；一个品牌段落节拍（`[logo/mascot]` 居中，`[serif title]` 按词组逐步构建，logo 缩小并上升，停靠到顶部居中）；一个 `[orb / mark]` 带着发光边缘成形；`[app window]` 带运动模糊飞入并落定；或者一个全画面的 `[thumbnail grid]` 从垂直中线向两侧分开，清出舞台。控制在 ≤2 秒 —— 输入框才是主角。
  - _变体 —— Hook_：打字出现的标题段落节拍承担开场 —— 「[Introducing X]」打出来，停留，再被以完全相同风格打进来的 `[tagline]` 替换；打字的调性在产品出现之前就已确立。
  - _变体 —— Key_Feature_：能力宣言作为一个纯标题打出来（「[Run a task across multiple models.]」），然后硬切到界面 —— 或者完全跳过 Scene 0，直接在工作流进行到一半的实时界面上开场。
  - _变体 —— CTA_：`[closing line]` 分两步打出来（「[Designed.] [Not generated.]」）并停留 —— 它将在 Scene 2 降级。

- **Scene 1（约 1–3 秒）—— 输入框获得焦点。** `[product input]` 到来或做好准备：一个 `[pill bar]` 从标志 / chip 横向**展开**；一个 `[prompt palette / card]` 带着柔和阴影在中央**弹簧弹入**；**一次**平滑的缓动 / 加速推近，紧紧裁到 `[app window]` 里的输入框上（标题区的 chrome 滑出画面）；一个 `[⌘K search modal]` 弹簧弹到中央，同时后面的页面变模糊；光标点击一个 `[menu row / Assistant button]`，提示框随之出现；或者一个 `[✕ clear button]` 把之前的查询清空，回到 `[placeholder]`。可选的输入框仪式（选 1–2 个，放在打字前或打字中）：一个 `[attachment]` 拖进来，落定在输入框下方的托盘里；一个 `[model / option dropdown]` 在选择器下方打开，各行悬停高亮，一个对勾落下，工具栏标签随之更新。
  - _变体 —— Product_Intro_：仪式本身就是介绍 —— 一个 `[chip grid]` 淡入，光标划出弧线经过 2–3 个悬停高亮，最后点击打开输入框的那一个；这些可交互入口本身就是导览。
  - _变体 —— Key_Feature_：界面上已经带着一个旧的 `[query]` 和它之前的 `[result panel]` —— 把它清掉就是在说「这是一个能干活的工具，不是样机」。

- **Scene 2（约 2–6 秒）—— 提示词打出来（引擎）。** `[prompt text]` 在闪烁的插入符后快速逐字符打出来；输入卡片随着文字填满而**向下生长** / 换行，把底部控件和附件往下推；一个打出来的 `[token]` 可能在打字途中转换成一个行内 `[brand pill]`（`[@browser]` → 一个彩色的 `[Browser]` chip，打字在它周围继续进行）；镜头可以朝输入框做**一次**缓慢连续的推近，减速到几乎停在打出来的提问上。子形态 (A) 可以在这里**结束** —— 在一个词打到一半、插入符还在闪烁时切走，或者停在打完的提示词上。
  - _变体 —— Hook (A)_：打出来的提问就是悬念 —— 结束在完成的提示词上，或者结束在提交点击上，同时界面在切点处**变暗**。
  - _变体 —— Product_Intro (A)_：镜头朝底部输入框俯冲，同时 `[option pills]` 在它上方级联出现；切走时提示词还打到一半 —— 产品被介绍成一个你可以和它对话的东西。
  - _变体 —— CTA（A，安装结尾卡）_：Scene 0 的标题**降级** —— 缩放到约 50%、去饱和变灰、向上移 —— 同时一个小的 `[$ chip]` 在下方弹簧弹出，并**横向拉伸**成一个宽的 `[terminal pill]`；`[install command]` 在里面打出来；一个淡淡的 `[repo link]` 和一个「[Works with]」标签安静地淡入；一排 `[tool icons]` 带着柔和的弹簧缩放一个接一个弹出；完成的画面长时间停留，只有插入符在闪烁。

- **Scene 3（约 4–7 秒）—— 提交 + 机器表演。** `[submit control]` 被点击（光标滑过去 + 按下凹陷；按钮可能在第一次按键时就已经**变形**了状态 —— 波形 → 上箭头 —— 并可能在流式输出时翻转成 `[stop]` 控件），或者由重新输入暗示按下了回车。界面立即以工作状态作答：之前的内容**消失**（chip 网格消失，面板收起成细长的标题栏，整个布局被替换）；然后是表演 —— `[status phrases]` 交叉溶解，带一道从左到右的微光扫过（「[Thinking]」→「[Modeling…]」→「[Planning…]」），一个 `[spinner]` 在加载条上方旋转，一排 `[loading cards]` 排好队，或者一个 `[checklist]` 填充出来，其中的条目一个接一个翻成绿色对勾并加上删除线，同时一个 `[status heading]` 切换时态（「[Using X]」→「[Used X]」）。
  - _变体 —— (A) 状态闪现收尾_：片段**就**结束在表演上 ——「[Generating…]」/ 旋转的 spinner —— 这一闪就是收尾的包袱；答案留给观众想象。

- **Scene 4（其余时间）—— 答案到来。** 按子形态选择：
  - **子形态 B（完整生成循环）**：输出逐步**构建**，每一块都把内容往下推 —— `[answer text]` 一段一段流式输出；`[action-log rows]` 依次弹入，每行带一个 `[brand icon]`；`[diff cards]` 展开，新增的行用绿色高亮；`[chart lines]` 从共同原点出发、从左到右错开绘制；一个 `[ASCII / summary table]` 绘制出来；实时计数器跳动；界面垂直自动滚动，跟随最新的一行（页面、终端或卡片内滚动）—— 常常叠加在对结果窗口的**一次**缓慢连续推近之下。
  - **子形态 C（即时结果界面）**：机器用一个完成的界面作答 —— 匹配的 `[result / article]` 就地渲染出来；`[autocomplete chips]` 在查询打字的**同时**在搜索栏下方错开弹出（机器回应每一次按键），然后一次悬停把 `[Search button]` 填成实色，一次点击完成确认；`[generated page]` 作为圆角卡片升起，并在固定住的提示词下方**持续滚动**；一次模糊甩切落到 `[artifact window]` 上，点击标签页把代码**翻转**成预览；或者一次拉远揭示出那个提示词胶囊原来位于一个完整的 `[workspace]` 里，`[content]` 正在里面实时改写自己。

- **Scene 5（最后一拍）—— 收束。** 按角色和子形态分化：
  - _变体 —— Key_Feature（停留）_：停留在完成的输出上 —— 图表画完，diff 卡片 + `[action buttons]` 完全渲染出来；没有淡出，没有空白的结尾帧。
  - _变体 —— Product_Intro（确认）_：光标在片段结束时完成确认点击（`[Create PR]` / `[Generate]` / `[Search]`），或者多余元素淡出，最后一次推近留下干净的结束状态；有一个成员硬切到一张极简的 `[end card]` —— 提交按钮单独位于正中央，带一下落定弹跳。
  - _变体 —— Hook（重启 —— 招牌动作）_：在一个新的提示行上开始打**第二条** `[prompt / command]`，或者查询**退格后重新输入**，输出整体换成 `[result 2]` —— 片段结束在**动作进行中**，滚动到一半或一个词打到一半：循环永不停止，这正是重点。
  - _变体 —— CTA_：Scene 2 的结尾卡直接停留到最后一帧；闪烁的光标是唯一的运动。

**motion vocabulary / 动作词汇**：逐字符打字，配闪烁的插入符 / 块状光标；打字出现的标题段落节拍相互替换；输入胶囊向下生长 / 换行成多行文本框；提示词面板 / 卡片弹簧弹入；胶囊栏从标志或 chip 横向展开；带发光边缘的光球成形；打字途中打出来的 token → 行内品牌胶囊变形；清除占位符；点击 ✕ 清除查询；退格后重新输入的查询替换；附件拖入并在托盘中落定；下拉框打开 + 行悬停高亮 + 打勾选中 + 工具栏标签更新；chip 网格的悬停舞步；光标滑动 / 划弧，配悬停高亮填充；点击按下凹陷；提交按钮状态变形（波形→上箭头，提交→停止）；Search 按钮上的悬停填充状态切换；提交时内容消失 / 面板收起 / 布局替换；状态短语交叉溶解，配从左到右的微光扫过；脉动的「Thinking」；spinner 旋转；加载条；动画的尾随省略点；加载中的模型卡片行；状态标题时态切换（Using→Used）；清单方框翻成绿色对勾并加删除线；动作日志行带品牌图标依次弹入；流式文本块把内容往下推；绿色高亮的 diff 卡片展开；从左到右错开的图表线条绘制；ASCII / 汇总表绘制出现；计数跳动器；跟随最新一行的垂直输出滚动（页面 / 终端 / 卡片内）；生成的页面作为圆角卡片升起，并在固定的提示词下方滚动；自动补全 chip 快速错开弹出；点击标签页时代码↔预览瞬间翻转；模糊甩切转场；提交时提示词跳到标题位置；从提示词胶囊拉远，揭示完整的 UI 窗口；单次缓动 / 加速推近落在输入框上；对结果窗口的缓慢连续推近；窗口带运动模糊飞入；缩放 + 平移裁掉浏览器 chrome；⌘K 模态框弹簧弹入并模糊背景；全画面网格从垂直中线分开；标题降级（缩小 + 去饱和 + 上移）；chip 横向拉伸成宽的终端胶囊；安静的低对比度元数据淡入；一排图标依次弹簧弹入；切走时第二条提示词正在打字；切点处界面变暗 / 淡出；长时间的静态结尾停留，配闪烁的光标。

**rule mapping / 规则映射**

- 逐字符打字、清除占位符、退格后重新输入、切走时的第二条提示词、打字出现的标题段落节拍 → `discrete-text-sequence`（打字 / 打错字 / 停留 / 退格），以 `gsap-effects`（typewriter 配方）为支撑
- 闪烁的插入符 / 块状光标（在停留期间持续存在）→ `context-sensitive-cursor`
- 提示词 / 状态 / 输出短语的时间窗口，由脚本驱动的段落节拍时长 → `dynamic-content-sequencing`
- 输入卡片随文字填满向下生长 / 换行 → `anchored-layout-expand`（顶部锚定、向下生长，在换行边界处阶梯式变化）
- 打字途中打出来的 token → 行内品牌胶囊变形 → 组合：`scale-swap-transition`（在转换阈值处做 token→chip 替换）+ `card-morph-anchor`（chip 周围的重排）
- 提示词面板 / 模态框 / 下拉框弹簧弹入；加载卡片、日志行、diff 卡片、自动补全 chip、图标行错开到达 → `spring-pop-entrance`（单个 hero 或错开的一组）
- 胶囊栏从标志横向展开；chip 拉伸成宽的终端胶囊 → `card-morph-anchor`（容器变形）
- 光标滑到控件、按下、涟漪 → `cursor-click-ripple`；按下凹陷 + 回弹 → `press-release-spring`（光标和按钮一起被压缩时用 `physics-press-reaction`）
- 悬停高亮填充、Search 按钮瞬间实色填充、UI 关键词强调 → `asr-keyword-glow`（静态 timeline 的发光变体）或 `press-release-spring`（颜色过渡变体）
- 光标拖入附件 → `context-sensitive-cursor`（指针↔抓手）+ `spring-pop-entrance`（托盘落定）
- 提交时内容消失 / 布局替换 / 面板收起；代码↔预览瞬间翻转 → `scale-swap-transition`（成对的同中心替换），或者按 `discrete-text-sequence` 的语义用一次硬性的 `tl.set` 状态替换
- 提交时提示词跳到标题位置 → FLIP 重定位 —— 见 `hyperframes-keyframes`（FLIP）；移动过程本身用 `nudge-curve`（慢-快-慢的整组滑动）
- 状态短语交叉溶解配微光扫过 → `discrete-text-sequence`（短语替换）+ `ambient-glow-bloom`（Shimmer sweep 变体 —— 单次移动的光泽，裁切在文字内）
- spinner 旋转、动画的尾随省略点、脉动的加载字形 → `svg-icon-enrichment`（旋转 / 脉动的 SVG 内部元素）；有限次数的「Thinking」脉动 → `sine-wave-loop`（有限次重复 —— 这个脉动是在**表演**状态，不是闲置晃动）
- 清单状态翻转、状态标题时态切换、状态胶囊替换 → `discrete-text-sequence`（离散状态步进）；对勾盖章 → `svg-path-draw` 或 `spring-pop-entrance`
- 流式文本块 / 日志行把内容往下推 → `dynamic-content-sequencing`（每块的时间窗口）+ `spring-pop-entrance`（每行的到达）
- 跟随最新一行的垂直输出滚动（页面 / 终端 / 卡片内）→ 组合：内容的 translateY 和内容时间窗口挂在同一条 timeline 上 + 画面本身移动时配一个匹配的 `viewport-change` 反向平移
- 生成的页面作为圆角卡片，其内部内容滚动 → `3d-page-scroll`（平面变体 —— 页面卡片的内部滚动）
- 错开的图表线条绘制 → `svg-path-draw`（stroke-dashoffset，错开起始时间）
- 计数跳动器 / 实时计数器 → `counting-dynamic-scale`；结果条 / 填充 → `stat-bars-and-fills`
- 单次缓动推近落在输入框上；对结果的缓慢连续推近 → `multi-phase-camera`（推近阶段），目标位置通过 `coordinate-target-zoom` 来构图
- 从提示词胶囊拉远揭示完整工作区；缩放 + 平移裁掉 chrome → `viewport-change`（在 `.world` 包裹层上做平移 + 缩放的组合）
- 窗口带运动模糊飞入；模糊甩切转场 → `motion-blur-streak`
- ⌘K 模态框配背景模糊 → `depth-of-field-blur`（模糊页面平面，保持模态框清晰）+ `spring-pop-entrance`
- 全画面网格从垂直中线分开 → `center-outward-expansion`（两半同步向外滑开）
- 带发光边缘的光球成形 → `ambient-glow-bloom` + `spring-pop-entrance`
- 标题降级（缩小 + 去饱和 + 上移）→ `gsap-effects`（普通的组合 tween；不需要专门的规则）
- 切点处界面变暗、硬切到极简结尾卡、结束在一个词 / 一次滚动的中途 → 退场惯例，不需要规则
- 长时间的静态结尾停留、只有插入符在闪烁 → `context-sensitive-cursor`（闪烁是被认可的残留运动）

**camera modifier / 镜头修饰**（镜头始终服务于提问或回答；许多成员完全是静态镜头 —— 打字、提交表演和流式输出就能撑起整个镜头）

- **一次**平滑的缓动 / 加速推近，紧紧落在输入框上并**锁定**（Hook、Product_Intro）→ `multi-phase-camera`（推近）+ `coordinate-target-zoom`（以输入框为目标）—— 这是「看我提问」式开场的标志性动作。
- **一次**缓慢连续的推近，在打字或输出构建的过程中进行，减速到几乎停住（Product_Intro、Key_Feature）→ `multi-phase-camera` —— 给回应以分量，又不抢它的戏。
- **一次**拉远揭示 —— 提示词胶囊原来位于一个完整的工作区里（Key_Feature，子形态 C）→ `viewport-change`（拉回）—— 反向动作；提问离产品比你以为的更近。
- 仅用于入场的点缀：窗口带运动模糊飞入（`motion-blur-streak`）、缩放 + 平移裁掉浏览器 chrome（`viewport-change`）—— 两者都要在打字开始前落定。
- 每个镜头真正的 viewport 移动绝不超过两次；提交表演和流式输出期间画面**锁定**（内容滚动，镜头不动）。
