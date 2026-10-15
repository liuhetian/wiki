<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/cursor-ui-demo.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# cursor-ui-demo — 光标驱动的 UI 演示

**intent**（意图）：一个可见的自定义光标通过点击 / 悬停 / 拖拽驱动一个真实（重建的）应用 UI，让屏幕一个镜头接一个镜头地切换状态，同时镜头追着每一次交互走 —— 产品界面是主体，光标是演员。

**roles served**（适用角色）

- Product_Intro（来自 `product-intro-cursor-ui-demo`）：第一次亮出产品界面 —— 光标扫过 / 悬停，用来\_介绍\*这个应用、揭示它是什么，最后落在一个被悬停的 hero 元素或刚弹出的结果上。轻快、探索式；背景随之逐级换色。
- Key_Feature（来自 `key-feature-cursor-ui-demo`）：把一个具体的多步工作流\_从头到尾\*演示一遍（在 2–4 个离散的段落节拍里编辑 / 配置 / 选择），每一拍都是一次 UI 实时响应的真实编辑，最后锁定在主操作按钮或产出的结果上。
- Key_Feature（来自 `workflow-approve-press`）：一个代理执行 / 确认类工作流，四周是由 3D 倾斜侧翼组成的驾驶舱 —— 步骤列表逐项从 pending → active → complete 打勾（一个硬切换的状态机，由 CSS 响应 `[data-state]`），侧翼上的一个按钮承接那一下按压作为收束（颜色翻成成功色，盖上一个对勾）。这次点击就是高潮，不是一个路过的手势。
- Key_Feature（来自 `cursor-app-state-tour`）：静态舞台的状态巡览（STATE TOUR）—— 在一个锁定的画面里，光标驱动一个重建的应用走过 2–4 个离散的功能状态；每次场景变化都是点击触发的元素替换 / 缩放（模态框从中心弹出、侧边面板从右边缘滑入、设置面板硬切换、表格填充、节点图搭建），绝不是真正的镜头运动；前面可以加一个 `[title card]` 的 Scene 0，后面可以加一个 `[brand end beat]`。
- Key_Feature（来自 `drag-field-onto-document`）：拖放（DRAG-DROP）之旅 —— 文档工作区的一个连续的呼吸式缩放镜头：光标从输入项侧栏把一个半透明虚影的 `[field chip]` 拖到页面上，松手后吸附成一个已放置的字段，一个模态框 / 打字的段落节拍把它填完，已放置的元素在特写里被调整，然后光标移向 `[Finish/CTA]`。
- Product_Intro：低事件量的浏览（BROWSE）—— 光标在唯一一个干净的页面状态里游走，筛选控件以轻微的悬停更新回应；没有键入输入，没有标题段落节拍，镜头可以在游走途中结束。
- Product_Intro（来自 `hover-inspect-run`）：悬停检查（HOVER-INSPECT）流程 —— 一次点击生成一个带标签的 `[toolbar]`，镜头从紧凑裁切拉远到整页，然后光标扫过 `[page elements]`，同时一个浮动的 `[inspector panel]` 跟踪光标，对每个被悬停的元素描边高亮并切换内容。（该样本片段开头那段三拍的深色标题前奏，即场景 1–3，属于 `titlecard-reveal`，不属于这里。）
- Hook：氛围式多光标（MULTI-CURSOR）画布 —— 几个带标签的 `[teammate cursors]` 同时在一张设计画布上干活（在几个 mockup 之间抓取-拖动-放下组件，放下时换色 / 换身份），同时画布组在静止画面内平移，一个 `[headline]` 在演示上方按词组逐组搭建；这个现场工作坊本身就是钩子。一个连续的段落节拍，没有切，没有镜头运动。
- Benefits（来自 `ui-demo-text-interlude-ui-demo`）：demo|text|demo 三明治（SANDWICH）—— 本 blueprint 的两个静态舞台演示段落节拍，中间经过一段全屏的动态文字 / 标题插段再回来（光标动作，UI 回应，所有「缩放」都是元素缩放）；插段那一拍属于 `kinetic-type-beats` 的素材，而三明治本身是单镜头单元之上的编排。

**duration**（时长）：4.0–12.9s（Key_Feature 4.0–12.9s —— 挖掘出的状态巡览偏长，10.4–12.9s，拖放之旅 9.8–10.6s，对比最初那组的 4.0–7.3s；Product_Intro 4.5–9.3s —— 低事件量的浏览定下了 4.5s 的下限；Hook 约 6.5s；Benefits 的 demo|text|demo 三明治总长 11.6–12.8s，每个演示半段约 4–5s）

**shot structure**（镜头结构）（一个 `[product UI surface]` —— 固定的应用窗口、仪表盘 / 编辑器、视差 `[content card]` 堆叠，或一个 `[container object/icon]` —— 居中于 `[bg color/gradient]` 之上，以 `[flat]` 或 `[3D-isometric]` 呈现；一个自定义的 `[brand-colored cursor with icon]` 是主角，镜头伺服跟随它碰到的任何东西；UI 对每个光标动作做出*实时*、同步的响应。这里并入了两种按角色调校的节奏 —— Product_Intro **扫过以介绍**，Key_Feature **执行一个工作流** —— 镜头覆盖一条光谱：完整的追逐（CHASE）、一个连续的呼吸式缩放，或完全锁定的静态舞台，由 UI 自己完成所有运动。）

- **Scene 1 (0.0–~Xs) —— 界面立住 + 第一次触碰。** `[product UI surface]` 居中出现在 `[bg color/gradient]` 之上 —— 要么就是直接在那儿（固定窗口 / 仪表盘 / 编辑器），要么是一个 3D 视差的 `[content cards]` 堆叠，要么是一个带 3D 翻滚飞入并落定的 `[container object/icon]`。自定义 `[cursor]` 进场。光标对 `[cursor target 1]` 做出第一个动作，UI 在同一拍内实时响应。镜头保持不动，或开始朝被操作的区域缓慢推进。
  - _变体 — Product_Intro_：低投入的第一次触碰 —— 光标悬停 / 扫过一个控件，或把一个字段扫亮成 `[accent color]`，或者 `[container]` 扇形展开。可以有一个标签 / 标题淡入 / 变形到界面上。重点是*展示这个界面存在*，而且可以触碰。
  - _变体 — Key_Feature_：一次具体的编辑 —— 光标拖动滚动条 / 在字段里键入 / 拖动一个手柄，UI 做出实质性响应（`[scroll]` / 数值攀升 / 区域改变尺寸）。如果界面以 `[3D-isometric]` 开场，可以在这里把透视一下压平，方便看清工作流。
  - _变体 — Key_Feature（静态舞台巡览）_：可选的 Scene 0 —— 纯色底上的 `[title card / kinetic brand word]` —— 硬切或以窗口放大的方式进入界面；`[app UI]` 从第一帧起就完整在场，光标进场并滑向第一个控件。镜头从一开始就锁定，并一直锁定。
  - _变体 — Hook（氛围式多光标）_：没有单一主角 —— 几个带标签的 `[teammate cursors]` 已经在设计画布上的 `[N mockups]` 之间忙碌；画布组在静止画面内平移，同时一个 `[headline]` 在上方按词组逐组搭建。一个连续的段落节拍，没有切。

- **Scene 2 (~Xs–~Ys) —— 镜头追到下一次交互（引擎）。** 镜头移向下一个目标 —— 推进 + 摇移 / 甩镜 / 下摇到 `[cursor target k]` —— 光标执行动作 k，UI 实时更新。每一拍是一次离散的交互，由一次快速的镜头运动衔接；界面的内部内容随每次交互替换。
  - _变体 — Product_Intro_：导航是探索式的 —— 镜头缓慢摇移 + 景深拉焦，扫过一个视差 `[content card]` 堆叠，或者 `[container]` 扇形展开成 `[N option/content cards]`，各自弹簧式就位。内容替换时，衬底背景逐级换色（`[bg step 1]` → step 2 → …）。通常有一到两次这样的运动。
  - _变体 — Key_Feature_：重复 `[2–4 beats total]`，每一拍是一个 UI 会回应的不同操作 —— 计数器向上计数、`[pill/swatch]` 被选中、一个模态框上滑并开始打字 —— 由甩镜 / 渐进缩放衔接。工作流看得见地朝一个结果推进。
  - _变体 — Key_Feature（静态舞台巡览）_：镜头从不移动 —— 每一拍都是点击触发的元素响应：一个模态框从中心弹簧式放大弹出，一个 `[side detail panel]` 从右边缘滑入（第二个面板可以盖在第一个上面滑入），汉堡菜单→侧栏滑开，一个设置面板硬切换其内容，一个下拉菜单填满，一个 `[table]` 逐行填充，一个公式键入单元格、回车后整片区域填充，一个输入即筛选的列表实时收拢，一个 `[block]` 弹入画布，一个节点图搭建起来（卡片 + 连线从中心向外辐射），一次悬停在标签下方落下一个 `[popover]`。任何「缩放」都只是 UI 的元素缩放。
  - _变体 — Key_Feature（拖放）_：光标从 `[inputs sidebar]` 抓起一个 `[field chip]`，拖着一个半透明的虚影穿过页面，然后放下 —— 它吸附成一个带包围框 + 角手柄的已放置字段；接着是一个完成段落节拍（一个 `[modal]` 在变暗的文档上弹簧式升起，一个名字逐字母键入，同时实时的 `[cursive preview]` 随每次按键生长，点击确认）。整个 clip 走的是一条连续的呼吸式缩放弧线（慢慢拉远 / 轻轻推近 / 最后拉远），而不是离散的镜头段落节拍。
  - _变体 — Product_Intro（悬停检查）_：光标的第一次点击生成一个带标签的 `[toolbar]`，镜头从紧凑裁切拉远到整页，然后光标扫过 `[page elements]` —— 每个被悬停的元素都获得描边，一个浮动的 `[inspector panel]` 跟踪光标，其内容随元素切换。

- **Scene 3 (~Ys–end) —— 收束状态，镜头落定，定住。** 光标落在最终目标上，屏幕达到收束状态；镜头停下来（静止）并保持。
  - _变体 — Product_Intro_：光标悬停在 hero 元素上 —— 一个 `[content card]` 悬停时放大，一个节点获得一个 `[Available]` 式的标签胶囊，或者一个 `[result card]` 弹出 / 弹簧式进入 —— 即「产品就在这儿」的收束。静止落定，保持。
  - _变体 — Key_Feature_：锁定在结果上的特写 —— 光标落在 `[primary action button: Export / Save / Reimburse]` 上，一个 `[hover backdrop / highlight]` 弹簧式弹入（高潮就是这个操作按钮 / 产出的结果）。保持。
  - _变体 — Key_Feature（静态舞台巡览）_：可选的、可拆卸的结尾段落节拍 —— `[brand text beat / icon-ring lockup / end stat card]` —— 或者光标只是停在下一个目标上并保持（006_claudeai 结尾时光标停在一个面板的关闭 X 上，面板始终没有关闭）。
  - _变体 — Key_Feature（拖放）_：已放置元素被调整的特写 —— 拖动角手柄把它等比缩放 —— 然后光标在 clip 结束时扫向 `[Finish / CTA]`。
  - _变体 — 浏览 / 悬停检查_：完全没有收束锁定 —— 镜头在演示途中结束，光标还在游走（浏览和悬停检查模式）。

**motion vocabulary**（运动词汇）：光标驱动的点击 / 悬停 / 扫亮 / 拖拽 / 键入；每次交互的 UI 实时响应（滚动、数值攀升、区域改变尺寸、内容替换）；镜头推进 + 摇移 / 甩镜 / 下摇，伺服跟随到每个目标；对准被操作区域的坐标缩放；被点击控件上的按压 + 涟漪；按钮按下压缩；镜头之间的屏幕状态替换；卡片向四角扇形展开（弹簧）；3D 容器飞入并翻滚落定；透视压平（3D→2D 硬切）；分页 / 逐级的背景色推进；跨视差卡片堆叠的景深拉焦；计数器向上计数；标签胶囊 / 色块选中；模态框上滑 + 打字；标签 / 标题在状态之间变形；UI 关键词高亮辉光；结尾的悬停放大或结果卡片弹入；最终操作按钮上的弹簧式悬停底衬；硬切换面板（无 easing）；侧边详情面板从右边缘滑入（第二个面板盖在第一个之上）；汉堡菜单→侧栏滑开；悬停时在标签下方落下 popover；元素缩放式假缩放（点击时 UI 窗口放大 / 缩小，镜头锁定）；表格逐行填充；公式键入单元格 + 回车后单元格区域瞬间填充；拖动填充柄向下逐行自动填充；输入即筛选的列表实时收拢；点击时下拉菜单填满；block / 元素弹入画布；节点图搭建（卡片 + 连线从中心向外辐射）；带闪烁插入符的逐字符自动键入；窗口放大并落定；虚影 chip 拖动（抓手点 + 图标）穿过页面；松手吸附成带包围框 + 角手柄 + 垃圾桶图标的已放置字段；模态框在变暗的文档上弹簧式升起；逐字母键入，同时实时手写体预览随每次按键生长；拖动角手柄等比缩放；连续呼吸式缩放的单镜头（拉远 / 推近 / 拉远弧线）；clip 结尾时光标扫向 CTA；多个带标签的协作光标各自独立移动；光标在 mockup 之间抓取-拖动-放下组件；放下时元素换色 / 换身份；画布组在静止画面内平移；标题在演示上方按词组逐组搭建；悬停触发的内容 / 侧栏微更新；点击生成带标签的工具栏；跟踪光标的浮动检查面板，内容按元素切换；每个元素的悬停描边高亮；带运动模糊的窗口飞入；紧凑裁切开场，再拉远到整页；品牌图标环结尾段落节拍；定住时 3D 结尾卡片的漂浮。

**rule mapping**（规则映射）

- viewport 跟随光标 / 镜头伺服跟随它碰到的任何东西（主规则）→ `camera-cursor-tracking`
- 光标移到目标、按下、发出涟漪（点击本身 —— 主要的交互原语）→ `cursor-click-ripple`
- 镜头之间的屏幕状态替换（界面内部内容在段落节拍之间变化）→ `scale-swap-transition`
- 镜头推进 + 摇移 / 甩镜 / 下摇到下一个目标 → `viewport-change`（在 UI 上摇移 / 缩放）
- 把追逐编排成离散的交互段落节拍 → `multi-phase-camera`
- 缩放到具体被操作的 UI 区域 → `coordinate-target-zoom`
- 光标图标 / 状态随上下文变化（例如在可拖动手柄上 pointer↔grab）→ `context-sensitive-cursor`
- 每一拍出现哪些内容 / 逐步推进的 UI 状态 / 每次交互的替换 → `dynamic-content-sequencing`
- 扫亮一个字段、把一个 UI 关键词高亮成 `[accent color]` → `asr-keyword-glow`（被触碰元素上的关键词辉光）
- 被点击的按钮按下时压缩、松开时弹回 → `press-release-spring`
- 较重的按压时光标 + 按钮一起压缩 → `physics-press-reaction`
- 面板 / 卡片在两个状态之间变形（例如卡片 → 展开的卡片，界面状态 A → B）→ `card-morph-anchor`
- 结尾的悬停放大、`[result card]` 弹入、最终操作按钮上的弹簧式悬停底衬 → `spring-pop-entrance`
- 卡片向四角扇形展开 / 选项卡片弹簧式就位 → `split-tilt-cards`（扇形 / 散开到倾斜位置）+ `spring-pop-entrance`（弹簧落定）
- 以 3D 视差内容卡片堆叠作为界面；UI 以 3D 等轴测呈现 → `3d-page-scroll`（UI 作为一张倾斜的滚动 / 视差卡片）
- 节点获得 `[Available]` 式的标签胶囊 / 元素上出现跟踪徽标 → `ai-tracking-box`
- UI 响应时计数器 / 数值向上计数 → `counting-dynamic-scale`
- 结果条 / 数字作为工作流的产出被填满 → `stat-bars-and-fills`
- 用一段实时的 `[video]` 录屏 clip 作为界面 → 技法：视频合成
- 透视压平（3D 等轴测 → 平面 2D 硬切）以及 3D 等轴测倾斜本身 → 技法：CSS-3D（没有专门的规则；倾斜 / 压平的 transform 是 CSS-3D 原语）
- 镜头静止落定在收束上并保持 →（收束元素上 `spring-pop-entrance` 的落定阶段；静止保持本身不需要规则）
- 3D 容器 / 物体飞入并翻滚落定 → `depth-scatter-assemble`（自由翻滚的 3D 物体 / 容器入场，飞入后翻滚落定；`orbit-3d-entry` 只是把一个平面元素沿轨道转到位）
- 跨视差卡片堆叠的景深拉焦 → `depth-of-field-blur`（远近卡片之间的移焦 / 景深模糊转场；`3d-page-scroll` 提供倾斜的视差堆叠，`viewport-change` 提供摇移）
- 与交互同步的分页 / 逐级背景色推进（`[bg step 1]`→step 2→…）→ `discrete-text-sequence`（离散的状态步进，这里用在背景色状态上，而不是文字上）
- 模态框上滑 + 模态框内打字合成一拍 → `card-morph-anchor` / `scale-swap-transition`（面板滑入）+ `discrete-text-sequence`（模态框内键入的文字）
- 元素缩放式假缩放 —— UI 窗口缩放，镜头锁定（静态舞台巡览）→ `coordinate-target-zoom`（作用在界面 wrapper 上，而不是 world 上）
- 侧边详情面板从右边缘滑入 / 汉堡菜单→侧栏滑开 / 悬停落下 popover → `card-morph-anchor` / `scale-swap-transition`（面板到场）+ `dynamic-content-sequencing`（每一拍每个面板显示什么内容）
- 硬切换面板 / 面板内内容在各状态间硬切 / 悬停触发的微更新 / 输入即筛选的实时收拢 / 放下时元素换身份 → `dynamic-content-sequencing`
- 表格逐行填充 / 填充柄自动填充逐行向下级联 / 日志行级联进入 → `waterfall-entry`
- 公式键入单元格 / 带闪烁插入符的逐字符自动键入 / 逐字母键入的名字 → `discrete-text-sequence` + `context-sensitive-cursor`（插入符）
- 节点图搭建（卡片 + 连线从中心向外辐射）→ `center-outward-expansion`（卡片）+ `svg-path-draw`（连线描画）
- 点击生成带标签的工具栏 / 点击时下拉菜单填满 / 已放置字段的松手吸附落定 / 窗口放大并落定 → `spring-pop-entrance`
- 模态框在变暗的文档上弹簧式升起 → `spring-pop-entrance`（模态框）+ `depth-of-field-blur`（下方文档变暗 / 模糊）
- 虚影 chip 拖放 / 光标在 mockup 之间抓取拖动组件 / 拖动填充柄 / 拖动角手柄改尺寸 → `cursor-drag`（`cursor-click-ripple` 只管移动 + 点击）
- 浮动检查面板跟踪光标，内容按元素切换 → `ai-tracking-box`（逐帧跟随的机制，换成检查面板的样式）+ `dynamic-content-sequencing`（每个元素对应的内容）
- 实时手写体预览随每次按键生长 → `svg-path-draw`（按打字进度逐步揭示笔画）
- 连续呼吸式缩放的单镜头（拖放变体）→ `multi-phase-camera`（后拉 / 聚焦 / 推进几个阶段 + 微漂移）
- 带运动模糊的窗口飞入 / 紧凑裁切开场再拉远到整页 → `motion-blur-streak`（飞入）+ `viewport-change`（拉远）
- 多个带标签的协作光标各自独立移动 → `multi-cursor-choreography`（N 个带标签、彼此独立的光标演员；单演员的光标规则默认只有一个）
- 画布组在静止画面内平移 → `viewport-change`（由 `.world` 的 translate 实现平移；语义上镜头保持锁定）
- 标题在演示上方按词组逐组搭建 → `waterfall-entry`
- 品牌图标环结尾段落节拍 → `svg-path-draw`（圆环）+ `spring-pop-entrance`（lockup）
- 定住时 3D 结尾卡片的漂浮 → `sine-wave-loop` —— 注意：motion-doctrine 禁止闲置晃动；优先用落定并保持

**camera modifier**（镜头修饰）：决定性的运动是镜头追逐（CHASE）—— viewport 通过 `camera-cursor-tracking`（主规则）从一个目标跟到下一个目标，具体实现为 `viewport-change` 下的推进 + 摇移 / 甩镜 / 下摇，由 `multi-phase-camera` 编排成离散的交互段落节拍，每一拍的落点通过 `coordinate-target-zoom` 瞄准（缩放到被操作区域）。Product_Intro 偏向缓慢、探索式的摇移 + 拉焦，扫过整个界面；Key_Feature 偏向更利落的甩镜 / 渐进缩放，一路走完工作流，最后静止锁定在操作按钮上。正是这种「镜头伺服跟随光标」把本 blueprint 和不跟光标的镜头滚动（dataviz-scroll-reveal）以及静态的设备 / 窗口巡览区分开来。黄金样本集把它拓宽成一条光谱。光谱的一端是**静态舞台状态巡览**（现在是成员最多的一组），整个 clip 都锁定镜头，让 UI 自己完成所有运动 —— 面板滑入、元素缩放式假缩放、内容硬切 —— 只靠光标带着视线走。**拖放**变体用 `multi-phase-camera` 下的一条连续呼吸式缩放弧线，取代离散的追逐段落节拍。**悬停检查**变体把推进反过来：先紧凑裁切开场，拉远到整页，然后光标才开始扫。按 brief 选择光谱上的位置 —— 工作流推进用追逐，密集的重建仪表盘用锁定舞台，单文档之旅用一次呼吸。把锁定这一端也纳入之后，本 blueprint 和 `device-surface-showcase` 的区别在于光标作为演员，而不在于镜头：只要每一次状态变化都由一个可见光标驱动，一个完全静止的巡览也仍然属于这里。
