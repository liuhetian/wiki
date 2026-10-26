# camera-journey —— 摄像机旅程

**intent**（意图）：真正的 viewport 摄像机就是**讲故事的人** —— 在**一个**连续的世界里进行多段旅程（钻入 → 旅程中途某个段落节拍触发 → 移动到结果处 / 重新取景 → 落地推近，静止），移动本身承载叙事。折叠了两种子形状：**(A) 动作往返** —— 摄像机钻进一个 UI 面板，一个光标/打字动作触发，摄像机俯冲/平移到另一个区域，结果在那里以元素运动的形式呈现；**(B) 无光标飞行** —— 在静态或自带动画的内容上空进行纯电影化的 3D 飞行（运动模糊、景深、倾斜到展平的旋转），全程没有光标。

**boundary**（边界）：这**不是** `cursor-ui-demo` —— 那里的摄像机*追着*光标跑（一个跟随演员的伺服机构）；这里的摄像机**就是**演员，按自己的叙事动机移动，在子形状 A 中光标只在两段之间的铰接点上出手（在 B 中它从不出现）。这**不是** `device-surface-showcase` —— 那里一台**设备**/一个界面是 hero，摄像机只是在呈现它；这里没有单一的 hero 界面 —— 旅程穿越多个区域/面板/景深层，穿越本身就是故事。这**不是** `spatial-pan-stations` —— 那里是在平面画布上预先摆好的站点，由同一类型的反复平移依次访问；这里的各段是异质的（推近、俯冲、拉回旋转、甩镜、钻入），而且每一段都是*有动机的*（由触发的动作，或由它落定时揭示的内容驱动）。

**roles served**（服务的角色）

- Benefits（from `camera-swoop-panel-action-roundtrip`）：当好处**就是**一次因→果往返时 —— "在这里做一件小事，在那里得到一个大结果"（评论 → 图表变形；agent 的发现 → 已验证的提交；聊天消息 → 收据 + 账本）。摄像机在物理上把动作与它的回报连接起来，于是观众是*亲身走过*这条价值链，而不是被告知它。
- Key_Feature（from `cursorless-camera-flight`）：当功能应该显得电影化、水到渠成时 —— 一张付款表单或一份生成的内容规划日历，由一台飞行的摄像机探索（钻入、甩镜横扫、倾斜到展平、最后猛烈推近到 CTA/hero 卡片上），内容自己在表演（下拉菜单自行选择；关键词卡片就那样立在景深里），没有人握着方向盘。

**duration**（时长）：5.6–11.1s（子形状 A 5.6–9.0s：001 5.6s · 066 8.6s · 004 9.0s；子形状 B 6.3–11.1s：Outrank 6.3s · 094 11.1s）

**shot structure**（镜头结构）（一个超大的 `[world]` —— 一个 `[UI canvas: design tool / GitHub + agent panels / phone + desktop ledger]`（A）或一个 `[3D-laid-out space: floating form card / calendar grid with standing keyword cards]`（B）—— 由单一一台虚拟摄像机包裹；摄像机移动时，内容作为世界*内部*的元素进行动画；每一段都是作用于同一个摄像机状态的顺序 tween）

- **Scene 0（可选，0.0–~1.8s）—— 静态序幕。** 摄像机锁定在一个 `[prologue beat: static promo card with a floating 3D product card / typed headline with an accent word / wide establishing shot of the app]` 上。一行打字机文字可以在此打完（`[headline]` 逐字打出，强调词用 `[accent color]`）。序幕以硬切**打破**，或者在第一次钻入开始时让标题缩小并滑走 —— 这份静止的存在是为了让旅程的启程有冲击力。

- **Scene 1 (~0.5–2.0s) —— 第 1 段：钻入。** 摄像机**快速、紧贴地**推近到 `[the focal element]` 上：
  - _子形状 A_：一次平面的整个 viewport 推近，落到 `[an actionable element: comment box / agent panel / chat bubble]` 上，那里 `[typed text]` 刚好打完，或者 `[response text]` 正在流式输出。标题/上下文离开画面 —— 这是全情投入，不是礼貌性的放大。
  - _子形状 B_：推近带着**角度**落地 —— 一个 `[the form region / the calendar grid]` 的倾斜 3D 特写，移动过程中前景元素带有运动模糊，相邻元素在景深下变得柔和。一个巨大的 `[foreground prop: date number / field label]` 可能占据画面，因速度而模糊。

- **Scene 2 (~1.5–6.0s) —— 第 2 段：旅程中途的段落节拍（铰接点）。** 摄像机保持、漂移或缓慢拉回，同时内容**在表演**：
  - _子形状 A —— 动作触发_：一个 `[cursor]` 点击 `[Send / Create PR]`（或者一条 `[message]` 隐式发送），被操作的元素**清除**/消失。点击之前可选的表演：一个 `[status spinner]` 轮换 `[status words]`，`[to-do items]` 被划掉，`[response text]` 流式输出。这次点击就是*驱动*下一段的铰接点。
  - _子形状 B —— 内容自己表演_：一个 `[dropdown]` 自行展开（把 `[the field below]` 往下推），在没有光标的情况下显示一个 `[row hover highlight]`，然后选中新值并收起；**或者**飞行减速并**对焦**到 `[one card]` 上 —— 它的 `[metrics]` 清晰锐利，相邻卡片模糊。

- **Scene 3 (~4.0–8.0s) —— 第 3 段：移动到结果处 / 重新取景。**
  - _子形状 A_：摄像机拉回 / 俯冲 / 平移到 `[region B]`，同时**结果**以元素运动的形式构建起来 —— `[bars shrink into the baseline while a node-dotted line draws left→right / a verified commit row slides into the timeline + a reaction pill pops / a receipt card expands row-by-row from a skeleton]`。可选的**第二**段延长这趟旅程：`[pan up-right to a toolbar → a dropdown cascades open / match cut into an extreme close-up → a fast decelerating zoom-out reveals a ledger table]`。
  - _子形状 B_：一次重新取景的运动 —— 一次缓慢的拉回，把世界**旋转**到平展并居中（3D → 正面 2D），或者一次带重度运动模糊的**甩镜横扫**，收束为一次横跨 `[a month calendar / the full card]` 的平面横向平移。在平面保持期间，可以上演安静的元素段落节拍：一道细细的 `[focus outline]` 围绕某个 `[field]` 淡入，再向下扫到下一个；卡片保持一阵几乎察觉不到的倾斜/缩放漂移，让保持永不死寂。

- **Scene 4（最后 ~1–2s）—— 第 4 段：落地。** 旅程收束在回报上：
  - _子形状 A_：摄像机归于**静止**；`[cursor]` 悬停在或漂向 `[the payoff: an open Export menu item / the commit link / the View-transaction button]`；以静止结束，停在已改变的状态上 —— 世界与旅程开始时肉眼可见地不同了。
  - _子形状 B_：一次突然、**猛烈**的推近/钻入（带运动模糊），落到 `[the CTA button scaled huge in frame / the hero keyword card]` 上，以紧贴的保持结束 —— 或者停在**钻入中途**（最后几帧仍在移动；平面的全景概览明确不是最终画面）。

**motion vocabulary**（运动词汇）：整个 viewport 的摄像机推近（快速/紧贴的和缓慢/细微的）；摄像机拉回重新取景；摄像机向上/向右/向下平移；在堆叠的面板之间钻入/俯冲；快速减速拉远直至静止；突然猛烈地推近到一个被放大到巨大的按钮上；穿过卡片网格的连续 3D 飞行；钻入一个倾斜的 3D 特写；缓慢拉回，把世界旋转/展平为正面；带重度运动模糊的甩镜横扫；摄像机移动时的运动模糊；相邻元素模糊的景深；减速并对焦；硬切 / 匹配剪辑切入极近特写；保持时几乎察觉不到的倾斜/缩放漂移；输入框里打完的文字；打字机标题；摄像机钻入时标题缩小并滑走；流式输出的 AI 回复文字；状态词加载动画轮换标签；待办事项划线描绘；光标点击；被点击的元素清除/消失；下拉菜单级联展开 / 自行展开并带着行悬停高亮收起（挤开下方的字段）；柱状图到折线图的变形（柱子缩进基线，同时一条带节点圆点的折线从左到右画出，标签保留）；提交行滑入时间线；反应胶囊出现；骨架屏→内容的卡片构建；收据/标签行逐行展开；细焦点描边淡入并在字段之间扫动；摄像机漂向一个按钮；3D 卡片细微漂浮；光标静止悬停。

**rule mapping**（规则映射）

- 多段摄像机本身 —— 在一个包裹层上顺序执行的推近 / 拉回 / 平移 / 钻入阶段，外加让保持保持生气的微漂移 → `multi-phase-camera`（阶段编排 + 漂移），构建在 `viewport-change` 之上（基础的虚拟摄像机原语：单一的 `.world` 包裹层，一个 `cam {scale,x,y}` 状态 —— 每一段都只有一个事实来源）
- **紧贴地**钻入一个偏离中心的元素（评论框、聊天气泡、Send 按钮、一张关键词卡片）→ `coordinate-target-zoom`（缩放 + 反向平移；测量目标，不要手算 —— 旅程会在每一段放大居中误差）
- 从极近特写快速减速拉远直至静止（066 的账本揭示）→ `coordinate-target-zoom` 的拉远变体 / `multi-phase-camera`（拉回阶段，强硬的 `power4.out`）
- 摄像机移动时的运动模糊（钻入、甩镜横扫、最后的猛烈推近）→ `motion-blur-streak`（摄像机移动的例外条款 —— 在一段运动期间，模糊包络作用在 `.world` 包裹层上：世界从不离开画面，模糊在速度峰值时达到峰值，并在每次落地时恢复清晰）
- 一张卡片对焦时相邻元素的景深；减速并对焦 → `depth-of-field-blur`（焦点拉动 + 推近时模糊整簇元素都明确在其范围之内；把 DoF tween 放在与摄像机这一段相同的位置上运行）
- 3D 飞行本身（子形状 B 的核心）—— 一台透视摄像机带着 `rotateX/rotateY/translateZ` 在一个 3D 布局的世界中移动：钻入一个倾斜的日历网格、倾斜到展平的拉回（倾斜的 3D → 正面 2D）、在立着的卡片之间连续飞行 → `3d-camera-flight`（透视包裹层 + preserve-3d；任何平面的段依然由 2D 摄像机规则负责）
- 甩镜横扫 → 组合：`nudge-curve`（对慢-快-慢滑动做以爆发为主的调校，作用于整个世界）+ `motion-blur-streak`（摄像机移动的例外条款），放在同一个时间窗内
- 输入框里打完的文字；打字机标题；流式输出的 AI 回复文字；状态加载动画轮换 `[status words]`；骨架屏→内容的状态替换 → `discrete-text-sequence`（+ `gsap-effects` 打字机；输入框的文字光标用 `context-sensitive-cursor`）
- 每一段出现什么内容 / 收据行和发现按脚本时间窗到来 → `dynamic-content-sequencing`
- 光标点击 `[Send / Create PR]`（子形状 A 的铰接点）→ `cursor-click-ripple` + `press-release-spring`（或者用 `physics-press-reaction` 做更有分量的按压）
- 被点击的元素清除/消失；返程那一段上面板从状态 A → B → `scale-swap-transition` / `card-morph-anchor`
- 待办事项划线描绘；行悬停高亮 → `css-marker-patterns`（划线）· `asr-keyword-glow`（悬停/选中行上的强调辉光）
- 柱状图到折线图的变形 → 组合，能干净地拆解：`stat-bars-and-fills`（柱子 `scaleY` → 基线）+ `svg-path-draw`（带节点圆点的折线从左到右画出），放在同一个 timeline 位置 —— 没有单独一条规则对应这种协调的图表类型变形，但也不需要新规则
- 提交行滑入；反应胶囊出现；收据行逐行展开 → `spring-pop-entrance`（单个到达）/ `waterfall-entry`（逐行级联）
- 下拉菜单自行展开，挤开下方的字段（094）→ `anchored-layout-expand`（下拉菜单主体的遮罩式、边缘锚定展开 —— 绝不 tween `height`）+ `reactive-displacement`（由展开的 tween 驱动兄弟元素的位移）
- 焦点环在字段之间移动（094：一道细描边先在 `From` 上淡入，再向下扫到 `Amount` 上）→ 把 `ai-tracking-box` 重新设计成一道普通描边（偏移在 setup 时烘焙好；尺寸通过 scale 变形，绝不改 width/height）
- 3D 卡片细微漂浮；保持时几乎察觉不到的倾斜/缩放漂移 → `sine-wave-loop`（摄像机一侧的微运动用 + `multi-phase-camera` 的漂移；漂移中的*倾斜*部分归 `3d-camera-flight`）
- 摄像机漂向一个按钮；保持期间缓慢细微的推近 → `multi-phase-camera`（匀速推进模式，极小的幅度）

**camera grammar**（摄像机语法）（这是决定性的一层 —— 这个 blueprint **就是**它的摄像机）：每一段都是作用于**一个**摄像机状态（`viewport-change` 的单一 `.world` 包裹层 / `cam` 对象）的 tween，由 `multi-phase-camera` 编排顺序，由 `coordinate-target-zoom` 瞄准。各段必须是*有动机的*：子形状 A 之所以移动，是因为有动作触发了（点击 → 俯冲到结果处）；子形状 B 之所以移动，是因为下一次揭示需要它（钻入 → 对焦 → 重新取景 → 最后钻入）。变换各段的动词 —— 由四次一模一样的推近组成的旅程读起来就是幻灯片。Ease 法则：钻入和落地用强硬的 `out` 家族（`power4.out` —— 猛烈到达、利落落定），重新取景的段用 `power2.inOut`；在摄像机上用弹簧/back easing 会感觉不对（见 `multi-phase-camera`）。子形状 B 在同样的单一状态纪律下，叠加 `3d-camera-flight` 的透视包裹层。

**Seek 安全（摄像机运动这么多，这一点没得商量）：** 整段旅程 —— 每一段、每个模糊包络、每次 DoF 拉动 —— 都放在**一个**暂停的 GSAP timeline 上，所以 seek 到任何一帧都能复现精确的段中途摄像机姿态。一个摄像机状态对象，transform 由单一写入者（`applyCamera()`）合成，包裹层附近任何地方都不用 CSS `transition`，模糊通过代理 tween 的属性 / `--dof` 变量实现（两者都 seek 安全），而在钻入中途结束也没问题 —— seek 到最后一帧只是落在 tween 中途而已。每一段的目标在 setup 时（`fonts.ready` 之后）测量**一次**并烘焙好；绝不在 `onUpdate` 里调用 `getBoundingClientRect`。

**溢出（要让 `check` 干净通过就必须处理）：** 一台移动的摄像机在每一段都会刻意把世界内容移出画面边缘。在场景根节点上保持 `overflow: hidden`，**并且**给移动的 `.world` 包裹层标上 `data-layout-allow-overflow` —— 否则 `check` 会对旅程抛在身后的每一个面板报告 `text_box_overflow` / `container_overflow`（见 `device-surface-showcase` 上的同一条说明）。
