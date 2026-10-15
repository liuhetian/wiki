<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/agent-progress-theater.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# agent-progress-theater —— Agent 进度剧场

**intent**（意图）：把 agent 的工作演成**工作状态**剧场 —— 一个简短的触发段落节拍把画面交给机器，然后机器肉眼可见地*干活*：加载动画旋转、状态短语轮换、圆点脉动、计数器跳动 —— 之后成果以一张卡片的形式到来，卡片里的行级联而入并**改变状态**（徽章翻转成对勾、标签被划掉、严重程度胶囊标签逐一显示），或者以一段对话的形式逐条消息构建起来，最后以摄像机推近收尾。主体是机器随时间推移进行劳动。它**不是**一条打出来等待输出的 prompt（从头到尾都不会打出任何 prompt/输入 —— 触发是一次点击、一次菜单选择，或一次已经在进行中的扫描）；**不是** `cursor-ui-demo`（这里至多**一次**点燃式点击，然后光标退场，UI 自己表演）；**不是** `grid-card-assemble`（那里的行组装成静态罗列并保持住 —— 这里的行是活的：它们作为 agent 的输出到来，然后**发生变化**，在观众眼前一行接一行地打勾）。

**roles served**（服务的角色）

- Key_Feature（from `agent-progress-theater`）：当功能是 agent 执行多步工作（制定计划 / 扫描仓库 / 修复漏洞 / 替你处理基础设施），而证明方式是状态表演时 —— 一个带有打出标签的加载组合，在 `[accent]` 加载动画下轮换的状态对句，然后一张清单/发现卡片在观众眼前填充并逐项打勾。
- Key_Feature（from `message-thread-payoff`）：当 agent 的工作发生在一段对话或自动化线程之中时 —— 用户/agent 气泡和工具调用/回复卡片依次弹出，工作状态由脉动的加载圆点或快速跳动的 diff 计数器承载，最后由**一次**摄像机推近、紧贴到确认行上来收束（`[reaction pill]`、"Sent using `[@Bot]`"、一个感谢气泡）。

**duration**（时长）：4.2–11.6s（短的成员是单独一拍卡片加打勾或线程，约 4–5s；长的成员串起触发 → 插入画面 → 状态轮换 → 成果卡片，约 9–12s；线程收尾跨度 4.2–9.1s）

**shot structure**（镜头结构）（一张暖色的平面画布 —— `[off-white / warm beige / near-white bg]`，可选 `[faint grid / dot-grid / wavy-line]` 纹理；白色圆角卡片带柔和投影；**一种** `[working accent]` 颜色专留给机器（加载动画、状态词、当前步骤），一种 `[done color]` 用于完成（对勾、"Completed"）；摄像机静止或只做**一次**缓慢运动 —— 运动绝大部分是元素层面的弹簧、错落和状态翻转。折叠了两种子形状 —— **(A) 清单/发现剧场** 和 **(B) 消息线程收尾**。）

- **Scene 1 (0.0–~1.5s) —— 触发。** 有东西在**一拍**之内要求机器开工：
  - _变体 —— 选项菜单（A）_：一张居中的白色胶囊卡片提出 `[the question]`；它向下**弹簧式展开**成一个圆角菜单 —— `[3–4 option rows]` 错落着淡入/滑入，每行带一个数字徽章。光标进场，在各行之间悬停游走（一个浅色的 `[hover fill]` 高亮跟着它），然后**点击**选中的那一行（约为按下的弹簧）；整个菜单朝自己的中心缩小并淡出。这是整个镜头中光标唯一一次出场。
  - _变体 —— 弹窗点击（A）_：一个带 `[Dismiss]` / `[action button]` 的白色弹窗特写；一个手形光标点击动作按钮（快速的按下弹簧）；弹窗淡出消失。之后可选地在空白画布上出现一句衬线字体的 `[interstitial line]` —— 词语错落着落下，保持，随着背景切换按词错落淡出。
  - _变体 —— 已经在工作（A）_：一个 `[Scan in progress]` 式的状态 —— 一个细细的 `[accent]` 弧形加载动画在标题 + 正文 + 一个 `[Starting…]` 胶囊上方旋转（光标停在它上面，一动不动）；只有加载动画在动。然后整个场景快速放大并淡出 —— 一个穿越式退场。
  - _变体 —— 穿越工作区（A）_：摄像机快速推近，**穿过**一个多面板的 `[workspace: builder / editor / terminal]` —— 面板放大越过 viewport 边缘，清场露出空白画布。
  - _变体 —— 线程开场（B）_：一个 `[user bubble]` 以 spring-pop 弹入（"`[the ask]`"），**或者**一张数据卡片弹入，上面绿色/红色的 `[diff counters]` 快速跳动并落定 —— 自动化的开场回执。

- **Scene 2 (~1–4s) —— 工作状态（机器在表演）。** 画面属于机器；没有任何东西可以点击。选 1–3 个工作母题并把它们**串起来**：
  - 一个加载组合：一个旋转的 `[accent asterisk / arc]`，旁边是快速打出的 `[working label]`（"`Buildi` → `Building plan…`"），一道从左到右的微光扫过这些字母；加载动画可能会短暂地在星号↔圆点之间变形再变回来。
  - 状态对句：2–3 组居中的成对文字 —— 一行深色的 `[action line]` 在一个 `[accent status word]`（"Thinking…"、"Noodling…"）和它的加载动画之上 —— 以稳定的节奏通过快速淡入淡出/滑动轮换。
  - 一个 `[scan/tool label]` 逐字打出/向右展开成完整字符串，然后**缩小**并**停靠**到左上角，成为固定的角落标题（画布现在属于它产出的东西）。
  - 一个状态标题随着下方各行落定而改变时态（"Using `[Tool]`" → "Used `[Tool]`"），一个轻柔脉动的 "Thinking"，以及下方淡入的灰色元信息行（"Exploring `[N]` files…"）。
  - _变体 —— 线程机制（B）_：`[agent reply]` 淡入/上滑，然后在它下方出现一行等宽字体的 `[tool_call]` —— 小图标 + `[tool name]` + 三个脉动的加载圆点；**或者**一个指令气泡滚动进入视野（窗口内部滚动，画面静止），随后一个 `[brand logo]` 在一行 "Sending message…" 旁边弹出。**结果落地的那一刻脉动立即停止** —— 载荷到来时圆点随之消失。

- **Scene 3 (~2–4s) —— 成果级联而入（收尾引擎）。** 工作成果以一张**逐步构建**的卡片的形式具现：
  - _变体 —— 清单（A）_：一个白色的 `[Progress / summary]` 胶囊或卡片带着回弹以 spring-pop 弹入，然后向下弹簧式展开（或者摘要卡片向**上**滑行，同时下方展开一个更高的 `[findings]` 面板）。各行一条接一条地级联而入 —— 上滑 + 淡入，错落进行 —— 每行有 `[number badge / severity pill]` + `[label]` + 可选的灰色 `[meta line]`。然后执行**状态变化**：徽章逐个从带数字的描边翻转成实心的 `[done color]` 圆 + 白色对勾（带轻微的缩放回弹），被勾掉的标签同时被划掉并变暗；待处理的条目保持部分绘制的弧形描边持续动画。在列表中途结束这一轮 —— 有些条目已勾选，有些仍是数字 —— 让工作肉眼可见地*仍在进行*。
  - _变体 —— 线程载荷（B）_：摄像机推近 / 向下平移，把 `[tool_call]` 行置于中心，同时一张白色载荷卡片从这一行向下展开 —— 2–4 行浅色的等宽 `[key: value]` 依次淡入。然后 `[resolution message]` 在下方展开就位（行内 `[code chips]` 和 `[link]` 着色），**或者**一张深色的 `[thread card]` 从一行状态行放大到**占据**整个画面，同时背景变暗，它的 `[reply]` 在一条 "1 reply" 分隔线下方展开就位。

- **Scene 4（最后 ~1–2.5s）—— 收束。** 两种结尾：
  - _变体 —— 保持 / 滚动（A）_：完成的（或正处于变化中的）卡片堆叠静止保持到结尾，**或者** viewport 沿着最后一张卡片向下滚动（在最后一拍加快），揭示出 `[a second heading + numbered list]`，在列表中途结束。下方可以同时运行一次缓慢连续的向卡片推进（标题漂出画面顶部）。
  - _变体 —— 收尾推近（B）_：**一次**摄像机推近 + 向下平移，紧贴落在收尾行上 —— "`Sent using [@Bot]`" / 确认信息 + `[thank-you bubble]` 弹簧式弹入 —— 然后一个 `[reaction button]` 以有弹性的过冲弹成激活状态的胶囊并带上计数。推近缓缓过渡为一阵几乎察觉不到的轻柔漂移，片段结束在特写上。没有片尾卡。

**motion vocabulary**（运动词汇）：胶囊向下弹簧式展开成菜单/清单 · 选项行错落着淡入/滑入 · 光标悬停游走（浅色高亮填充在各行之间跟随光标）· 带按下弹簧的单次点燃式点击 · 菜单缩小淡出退场 · 弹窗淡出消失 · 细 `[accent]` 弧形加载动画旋转 · 旋转的星号加载动画 · 星号↔圆点变形 · 带文字光标逐字打出的加载标签 · 从左到右的文字微光扫过 · 按词错落淡入/淡出的衬线插入画面 · 在 `[accent]` 加载动画下通过快速淡入淡出/滑动轮换的状态对句 · 脉动的 "Thinking" 标签 · 状态标题时态翻转（Using→Used）· 标签打出/向右展开然后缩小并停靠为角落标题 · 场景放大/淡出的穿越式退场 · 摄像机快速推近穿过多面板工作区 · 缓慢连续地推进到一张卡片（标题漂出画面）· 摘要卡片带回弹的弹簧弹出 · 卡片向上滑行同时下方展开面板 · 锚定的向下面板/载荷展开 · 行错落进场（上滑 + 淡入）· 徽章从带数字描边翻转为实心圆 + 白色对勾并带缩放回弹 · 完成时划线 + 变暗 · 待处理条目上部分绘制的弧形描边动画 · 严重程度胶囊标签读出（Critical / High）· viewport 沿最后一张卡片向下滚动 · 聊天气泡弹簧式放大弹入 · 回复淡入/上滑 · 带三个脉动加载圆点的等宽工具调用行（结果落地的那一刻圆点消失）· 载荷卡片从该行向下展开 · 绿色/红色 diff 计数器快速跳动并落定 · 窗口内部滚动（画面静止）· 品牌 logo 在状态行旁弹出 · 卡片从一行放大到占据画面同时背景变暗 · 回复消息展开就位 · 行内代码 chip / 链接着色 · 反应按钮以有弹性的过冲 + 计数弹成激活胶囊 · 摄像机推近 + 向下平移把收尾置于中心 · 轻微拉回 · 结尾轻柔漂移 · 静止保持。

**rule mapping**（规则映射）

- 胶囊向下弹簧式展开成菜单 / 面板在滑行的卡片下方展开 / 载荷卡片从工具调用行向下展开 → `anchored-layout-expand`（边缘锚定的容器增长：高度遮罩的包裹层 + 内部反向平移，容器按最终尺寸绘制）；弹簧的风味来自 `spring-pop-entrance`
- 选项行 / 发现行 / 任务行错落进场（上滑 + 淡入）→ `spring-pop-entrance`（错落组形式，上限 ≤500ms）或 `gsap-effects`（普通的淡入+平移错落）—— **不是** `waterfall-entry`（它那条二元的、不带淡入的到达法则与这种方言柔和的淡入/滑动级联相矛盾）
- 光标滑到一行并点击；手形光标点击弹窗按钮 → `cursor-click-ripple`（移动 + 按下）+ `press-release-spring`（按钮的按下弹簧）
- 浅色悬停高亮填充在各行之间跟随光标 → `gsap-effects`（一个逐行平移的背景填充；不需要专门的规则）
- 菜单缩小淡出退场 / 场景放大穿越式退场 / 色板换窗口 → `scale-swap-transition`
- 细弧形加载动画旋转 / 旋转的星号加载动画 → `svg-icon-enrichment`（通过 `setAttribute('transform','rotate(deg cx cy)')` 旋转 SVG 内部部件；由 timeline 驱动，有限次）
- 星号↔圆点变形再变回 → `scale-swap-transition`（两个元素在同一中心变形）
- 逐字打出的加载标签（"Building plan…"）/ 扫描标签打成完整字符串 → `discrete-text-sequence`（文字光标用 + `context-sensitive-cursor`）
- 从左到右扫过加载字母的微光 → `ambient-glow-bloom`（单次行进的光泽）或 `css-marker-patterns`（高亮扫过）—— 文字上的光感选光泽，画出来的色带选马克笔
- 衬线插入画面按词错落淡入/淡出；按节奏轮换的状态对句 → `dynamic-content-sequencing`（短语时间窗）+ `discrete-text-sequence`（整体状态替换）；逐词错落通过 `gsap-effects`
- 脉动的 "Thinking" 标签 / 三个脉动的加载圆点（相位错开）→ `sine-wave-loop`（有限次重复；在收束段落节拍处 kill 掉这个 tween —— 见准则说明）
- 状态标题时态翻转（Using→Used）/ 淡入的灰色元信息行 / 最终 token 的急停 → `discrete-text-sequence`
- 标签缩小并停靠到左上角成为固定的角落标题 → `gsap-effects`（普通的缩放 + 平移 tween；不需要专门的规则）
- 摄像机快速推近穿过多面板工作区 → `viewport-change`（推近）+ `multi-phase-camera`（分阶段）+ 可选的 `motion-blur-streak`（面板离开画面时的速度模糊）
- 缓慢连续地推进到成果卡片（标题漂出顶部）→ `multi-phase-camera`（匀速推进阶段）或 `viewport-change`
- 摘要卡片 / 进度胶囊 / 聊天气泡 / 品牌 logo / 文件 chip 的弹簧弹入 → `spring-pop-entrance`
- 摘要卡片向上滑行，同时下方展开发现面板 → `gsap-effects`（滑行）+ `anchored-layout-expand`（面板）
- 徽章翻转：带数字描边 → 实心圆 + 白色对勾并带缩放回弹 → `scale-swap-transition`（描边↔实心在同一中心替换）+ `svg-path-draw`（对勾描绘出来）+ `spring-pop-entrance`（回弹）；待处理→进行中→完成这一推进本身 → `dynamic-content-sequencing`（一个急停式状态机，参照 cursor-ui-demo 中 workflow-approve-press 的先例）
- 被勾掉的标签划线 + 变暗 → `css-marker-patterns`（划线描绘）+ `gsap-effects`（opacity 变暗）
- 待处理条目上部分绘制的弧形描边动画 → `svg-path-draw`（部分 dashoffset，停在绘制中途）
- viewport 沿最后一张卡片向下滚动 / 静止画面下的窗口内部滚动 → `gsap-effects`（在遮罩窗口内只用 transform 平移内容）—— 只有当**画面**本身在动时才用 `viewport-change`
- 绿色/红色 diff 计数器快速跳动并落定 → `counting-dynamic-scale`（数值代理计数上涨；去掉缩放增长部分 —— 它们以固定尺寸跳动）
- 深色线程卡片从一行放大到占据画面 → `card-morph-anchor`（行 → 全画面变形 + 交接），背景变暗用一个 `gsap-effects` overlay 淡入实现
- 回复消息 / 解决行展开就位 → `spring-pop-entrance`（柔和过冲），或者真正向下增长时用 `anchored-layout-expand`
- 反应按钮以过冲 + 计数弹成激活胶囊 → `spring-pop-entrance`（弹出）+ `press-release-spring`（激活的风味）+ `counting-dynamic-scale`（计数，如果它会跳动）
- 摄像机推近 + 向下平移，把工具调用 / 收尾行置于中心 → `coordinate-target-zoom`（非居中目标：缩放 + 反向平移）或 `viewport-change`
- 轻微拉回然后结尾轻柔漂移 → `multi-phase-camera`（拉回阶段 + 连续的微漂移；让漂移几乎察觉不到）
- 在最终堆叠上静止保持 → 不需要规则

**camera modifier**（摄像机修饰）（默认是**静止**画面 —— 剧场发生在元素层面；每个镜头至多**一次**真正的运动，从以下选择）：

- 触发穿越：一次快速推近穿过开场工作区，清场露出空白画布 → `viewport-change` + `multi-phase-camera`，可选 `motion-blur-streak`。
- 成果推进：在整个状态变化过程中，一次缓慢连续地推进到清单卡片，让标题漂出顶部 → `multi-phase-camera`（匀速推进）。
- 收尾推近（子形状 B 的标志性动作）：构建过程中保持静止，然后**一次**推近 + 向下平移，收紧到确认行上，缓缓过渡为微漂移结尾 → `coordinate-target-zoom` / `viewport-change` + `multi-phase-camera`（漂移）。
- 其他一切 —— 替换、级联、打勾、滚动 —— 都发生在锁定的画面上（任何"滚动"都是内容在它的窗口内平移，而不是摄像机）。

**准则说明（禁止空闲运动）**：工作状态母题（加载动画旋转、脉动圆点、脉动的 "Thinking"）擦着运动准则中"禁止空闲运动"的边 —— 但在这里它们是**叙事内的（diegetic）**：脉动*表演*的是"机器正在工作"，它是 Scene 2 的叙事内容，而不是装饰性的呼吸。让每个循环都保持有限、由 timeline 驱动、seek 安全（`sine-wave-loop` 有限次重复、`svg-icon-enrichment` 旋转），并在状态收束的那一帧精确地 kill 掉它 —— 语料中明确是这样做的（载荷卡片展开的那一刻加载圆点消失；加载动画随加载组合一起被替换掉）。
