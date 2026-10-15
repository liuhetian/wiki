<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/dataviz-countup.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# dataviz-countup — 数据可视化 / 数字滚动计数

**intent**（意图）：让数字和图表当 hero —— 一个计数的圆环 / 数字、一张趋势图、一组倾斜的统计 / 卡片网格 —— 并用一个镜头穿行于这些数据仪表之间，镜头穿透它们（或滚动扫过它们），最后落在一个 hero 指标上，让数据本身承载论点。

**roles served**（适用角色）

- Problem（来自 `problem-dataviz-pushthrough`）：用看起来真实的仪表把痛点量化 —— 计数圆环 → 趋势图 → 统计网格 —— 镜头穿透每个物体进入下一个，戏剧化地呈现一个不断恶化 / 规模庞大的问题（「X% 的人在……上吃力」）。
- Product_Intro（来自 `product-intro-dataviz-scroll-reveal`）：一个自信的「看看结果 / 看看数据」式开场 —— 从一个钩子词硬切进一个带透视倾斜的数据可视化卡片网格，然后一次不碰光标的镜头滚动落在一个发光的 hero 指标上，同时一句动态标语逐词组装。
- Hook（来自 `hook-counter-burst`）：围绕一个戏剧性统计数字的冷开场钩子 —— 画面一开始是黑的、空的，3–5 个主题图标在中央成簇刺入，然后标题数字在尺寸上向上爆开，图标同时向外甩到各自的位置（计数和散开是同一拍），最后以一次缓慢的镜头前倾收尾。从第 1 帧起就在动。
- Key_Feature（来自 dark-stat-scrub-montage）：用功能自己的分析数据来证明它 —— 在黑色画布上，动态标题段落节拍与自绘图表、一个 3D 倾斜的深色仪表盘交替出现，光标在仪表盘上拖动刮擦（scrub）（跟踪线 + 实时 tooltip），由硬切和一次缩放猛推缝合起来。这是唯一一个光标会触碰数据的变体。
- Social_Proof（来自 `gauge-beat`）：单个计数仪表 —— 径向仪表盘弧线描画 + 快速跳动的指标 + 说明文字 —— 作为一（ONE）拍嵌在一段动态排版接力里；在静止画面上通过元素级的缩放 / 模糊穿透进入和退出。仪表只是客串；接力本身属于 kinetic-type-beats。

**duration**（时长）：约 4–12s（Hook 约 4s · Product_Intro 约 6s · dark-scrub-montage 约 7.3–7.75s · Problem 约 11–12s · gauge-beat 约 2.5s，嵌在约 10.8s 的接力里）

**shot structure**（镜头结构）`[bg color]` 上的数据可视化场域（深色或浅色，四角有柔和辉光）；图表 / 圆环上用 `[gradient A→B]` 品牌描边；干净的白色 / 深色无衬线文字；底下运行着一个连续的镜头运动，穿行 2–3 个数据仪表，最终落在一个 hero 指标上。每一拍一个仪表；镜头承担切换。

- Scene 1 (0.0–Xs)：第一个数据仪表居中立住 —— 一个 `[stat]` 读作 hero。一个醒目的居中数字从 `[start]` 计数到 `[end]`，同时它的 transform scale 增长到静态的最终字号，下方是 `[stat label]`；与它配对的图形（一个以 `[gradient]` 描边、扫到 `[pct]` 的圆形进度环，或一根条 / 一段填充）用同一个（SAME）ease 动画进入，让数字 + 图形作为同一拍落定。辅助的 `[avatar/object]` 元素带弹簧过冲弹入，形成一圈分散的发光环绕；一个 `[headline]` 淡入上升。全程运行一个非常缓慢的连续镜头推近。
- Scene 2 (Xs–Ys)：镜头穿行到下一个仪表，该仪表开始动画 —— 一条 `[gradient]` 趋势线 / 面积图在网格线上从左到右描画（Problem），或者随布局滑动，偏离中心的卡片滚动离开（Product_Intro）。到场的 `[stat-2]` 数字向上计数 / 图表成形。
- Scene 3 / Scene N (…–end)：镜头把 `[hero metric card]`（大数字 + 标签 + 变化量 + 上升的图表）落在正中央；一团柔和的 `[accent]` 辉光在它背后绽开；运动达到峰值，然后缓和到一个落定的、稍宽的构图，hero 居中，辅助卡片分列两侧。在最后一帧定住（HOLD）。

- 变体 —— Problem（穿透，计数 → 趋势 → 网格）：Scene 1 是一个居中的圆形进度环 + 居中计数数字，四周是分散发光的 `[avatar/object]` 环绕。Scene 2 是一次快速的镜头推进，笔直穿过圆环中心（圆环、数字、环绕元素放大并飞出画面），进入一张圆角 `[card]`，卡片上是 `[stat-2 header]`，下面是一张带网格线 + 半透明面积填充、从左到右描画的 `[gradient]` 折线图；镜头穿透后落定。Scene 3：镜头摇移到第二张 `[card]`，它的数字向上计数，卡片里是一组由 `[avatar/object]` 元素组成的网格 —— 其中一部分变暗 / 模糊，其余的获得弹簧弹出的 `[accent]` 圆形对勾徽标；镜头一直落定到结尾。穿行方式是仪表之间的 z 轴纵深穿透。
- 变体 —— Product_Intro（滚动到 hero + 逐词标语）：一个短暂的开场 —— Scene 0（约 0.0–0.85s）：一个全画幅的 `[hero-color orb]`，上面是醒目的白色 `[hook phrase]`；静态微光，然后硬切。Scene 1 切到一个带轻微透视倾斜的 `[data-viz / product cards]` 网格（图表、热力图、带变化量 + 来源脚注的统计卡片），`[tagline word 1]` 居中；网格开始滚动（例如朝左上方），倾斜保持不变。Scene 2：网格继续滚动，让 `[hero metric card]` 滑到正中央，偏离中心的卡片滑走；`[tagline word 1]` 平移出去，`[word 2]` 从画面某一边升起进入。Scene 3：hero 卡片居中落定，`[accent]` 辉光在它背后绽开，镜头轻微推进；`[word 2]` 停在它附近。Scene 4：`[word 2]` 滑出，最后一个 `[tagline word]` 从对侧边缘落入，位于仍在发光的 hero 上方，推进达到峰值。Scene 5：覆盖文字清空，镜头缓和地拉回，落定到一个更宽的倾斜构图 —— hero 居中带辉光，辅助卡片分列两侧。穿行方式是一次不碰光标的镜头滚动，扫过一个倾斜的卡片平面（无光标、无点击）+ 一次一个词的动态标题 + 先推进再拉出的首尾呼应。
- 变体 —— Key_Feature（dark-scrub-montage：动态段落节拍 × 仪表，以切缝合）：在黑底上，`[kinetic word]` 段落节拍与数据仪表交替出现；硬切把各拍缝合起来，每一拍内镜头锁定 —— 穿行方式是蒙太奇，而不是连续运动。Beat A：一个醒目的 `[heading]` 保持不动，同时一条粗的 `[trend line]` 在一条深色图表带里从左到右自我描画，一路上升，冲破图表带的上沿；在峰值处一个 `[accent]` 圆点弹出，一个胶囊 tooltip 弹簧式进入，它的标签逐步构建成 `[value + delta]`。Beat B：一（ONE）次快速的缩放猛推落到一个带轻微 3D 倾斜的深色 `[analytics dashboard]` 特写（带变化量的指标卡片，背后漂浮着半透明的超大数字）；一个白色光标在一张图表上拖动刮擦 —— 一条竖直跟踪线跟着它，`[date: value]` tooltip 实时读出数值，然后第二张图表以一次颜色翻转激活，并带着自己的刮擦 tooltip —— 同时倾斜的平面轻轻侧向漂移；快速后拉 / 淡出到黑。Beat C：一个 `[glowing wave / typed line / impact word]` 段落节拍落下收尾的统计 lockup —— `[title]` + 向上计数的大 `[stat]` + `[green delta arrow + context line]` —— 并静止保持到结尾。仪表之间的动态文字以元素级的穿透转场猛烈放大冲出画面（无镜头运动）。
- 变体 —— Social_Proof（接力中的 gauge-beat）：一段静止镜头的动态文字接力里容纳一（ONE）个仪表段落节拍 —— 细的同心 `[accent]` 弧线从中心向外辐射，一条粗的 `[accent]` 进度弧在其上顺时针描画，一个大的 `[metric]` 快速跳升到 `[big value]`，下方是一个 `[caption]`；整组缓慢放大（元素级漂移），然后硬切出去，进入下一个文字段落节拍。每一拍的入场 / 退场都是从模糊中放大入场 / 放大并模糊冲出画面退场 —— 一种完全没有镜头参与的假穿透。当社会认同只是一个数字、周围的段落节拍都是排版时使用。

**motion vocabulary**（运动词汇）数值上带 transform-scale 增长的计数数字；圆形进度环扫动；增长条 / 进度填充；渐变趋势线 + 面积填充从左到右描画；分散的发光头像 / 物体元素带弹簧过冲弹入；透视倾斜的卡片网格；定向的网格滚动（卡片滑入 / 滑出中心）；hero 卡片居中；hero 背后柔和的强调色辉光绽开；缓慢的连续推近；快速的镜头推进 / 穿透仪表中心；卡片之间的横向 / 纵向镜头摇移；轻柔的推进，到峰值后缓和地拉回到更宽的落定；对一部分元素选择性变暗 / 模糊 + 弹簧弹出的对勾徽标；全画幅钩子光球 → 硬切；逐词组装的动态标语（每个词从画面某一边落下 / 升起，前一个词滑出）。dark-scrub-montage 追加：冲破图表带上沿的自绘图表线；峰值圆点 + 胶囊 tooltip 弹簧弹出；光标在图表上刮擦，带竖直跟踪线 + 实时日期 / 数值 tooltip 读数；图表激活时的颜色翻转；3D 倾斜的深色仪表盘平面，带缓慢的横向漂移；卡片背后漂浮的半透明超大数字；快速的缩放猛推；后拉 / 淡出到黑的段落节拍退场；硬切缝合各拍；动态文字穿透（元素放大冲出画面）；带闪烁光标的键入文字行；冲击式重砸文字 + 粒子溶解收尾；发光波形描画；绿色变化量箭头弹出；统计 lockup 保持。gauge-beat 追加：静态同心弧线 + 粗进度弧顺时针描画；快速跳动计数；从模糊中放大入场 / 放大并模糊冲出画面退场（元素级的假穿透）。

**rule mapping**（规则映射）（运动动词 → `rules/<id>.md`）

- transform scale 随数值增长的计数数字 → `counting-dynamic-scale`（主要的文字规则）
- 圆形进度环扫动（圆环填充）→ `stat-bars-and-fills`（圆环形态）—— 它的描画机制委托给 → `svg-path-draw`
- 配在数字旁边的增长条 / 进度填充 → `stat-bars-and-fills`（主要的数据规则）
- 渐变趋势线 / 面积图从左到右描画 → `svg-path-draw`（路径 / 线条自我描画）
- 头像 / 物体元素带弹簧过冲弹入 → `spring-pop-entrance`（弹性过冲）；发光头像 / 物体的分散环形布局 → `avatar-cloud-network`；如果它们持续漂移 / 环绕 → `orbit-3d-entry`
- 弹簧弹出的 `[accent]` 对勾徽标 → `spring-pop-entrance`
- 透视倾斜的卡片网格（内容移动时倾斜保持静止）→ `3d-page-scroll`
- 扫过倾斜卡片平面的定向滚动（卡片滑入 / 滑出中心）→ `3d-page-scroll`（滚动）+ `viewport-change`（横向 / 纵向摇移形态）
- hero 指标卡片居中（滚动 / 摇移把目标落在正中央）→ `coordinate-target-zoom`（目标落在 viewport 中心）/ `viewport-change`
- 从钩子光球硬切进网格 → `scale-swap-transition`
- 逐词组装的动态标语 → `kinetic-beat-slam`（同一个起始时间网格，每个词有各自不同的入场）
- 缓慢的连续推近 + 穿透各仪表 + 卡片之间的横向 / 纵向摇移 + 先推进再拉出的首尾呼应 → `multi-phase-camera`（见镜头修饰）
- hero 卡片背后柔和的强调色辉光绽开 → `ambient-glow-bloom`（静态 hero 元素背后非触发式的柔和辉光 / 绽光 —— 不同于 `press-release-spring` 由按压触发的辉光，也不同于 `asr-keyword-glow` 按词计时的包络）
- 对网格中一部分条目选择性变暗 / 模糊（未高亮卡片上的焦外衰减）→ `depth-of-field-blur`（逐元素的选择性模糊 / 变暗，用来聚光高亮卡片 —— 与 `constellation-hub` 中使用的焦外衰减规则相同）
- 光标在图表上刮擦（与光标绑定的竖直跟踪线 + tooltip 中的实时数据读数）→ `chart-scrub-readout`（由光标 x 驱动的跟踪线、tooltip 弹出，以及 seek 安全的实时数值读数）
- 图表激活时的颜色翻转（第二张图表在刮擦下亮起）→ `gsap-effects`（刮擦交接处的颜色 / 不透明度和弦 —— 基础 tween，不需要专门的规则）
- 3D 倾斜的仪表盘平面 + 缓慢的横向漂移 → `3d-page-scroll`（倾斜构图）+ `sine-wave-loop`（漂移；振幅保持极小，让刮擦读数保持清晰）
- 快速缩放猛推到仪表盘 → `multi-phase-camera`（一个短促激进的推进阶段），通过 `coordinate-target-zoom` 瞄准；在峰值速度处加 `motion-blur-streak`
- 动态文字穿透 / 放大并模糊冲出画面退场 / 从模糊中放大入场 → `kinetic-beat-slam`（段落节拍语法）+ `motion-blur-streak`（模糊在最高速度时达到峰值，在落定时消散 —— 它的入场形态执行模糊进入，退场形态执行冲出画面）
- 带闪烁光标的键入文字行 → `discrete-text-sequence` + `context-sensitive-cursor`（方波闪烁）
- 冲击式重砸文字 → `kinetic-beat-slam`；它的粒子溶解收尾 → `particle-burst`（字形→粒子溶解，确定性的）
- 发光波形描画 → `svg-path-draw`（描画）+ `ambient-glow-bloom`（辉光包络）
- 绿色变化量箭头弹出 / 峰值圆点 + 胶囊 tooltip → `spring-pop-entrance`
- 静态同心弧线 + 顺时针进度弧描画（gauge 段落节拍）→ `stat-bars-and-fills`（圆环形态）→ 描画机制 `svg-path-draw`（两者上面都已映射过 —— 仪表盘就是已有的圆环，背后多了静态的同心装饰）

**camera modifier**（镜头修饰）：镜头是贯穿各数据仪表的主线 —— 一个由 `multi-phase-camera` 编排的镜头 wrapper，每一站通过 `coordinate-target-zoom` 瞄准焦点仪表 / 卡片。

- Problem —— 穿透：缓慢的连续推近（漂移叠加层）加上一次快速推进，笔直穿过一个仪表的中心进入下一个（`multi-phase-camera`，Steady-push 模式），然后横向 / 纵向摇移到最后一张卡片。z 轴纵深穿透是它的标志性动作（借此与扁平的摇移巡览区分开）。
- Product_Intro —— 滚动到 hero + 首尾呼应推进：一次不碰光标的定向滚动扫过倾斜卡片平面（`3d-page-scroll` 滚动 / `viewport-change` 摇移），把 hero 卡片落在中央，然后一次轻柔的推进达到峰值后缓和地拉回到更宽的落定（`multi-phase-camera`，Bookend-pull 模式）。无光标、无点击 —— 由镜头负责导航。
- Key_Feature —— 蒙太奇切：镜头不是（NOT）主线 —— 硬切把各仪表段落节拍缝合起来，每一拍内画面锁定，恰好一（ONE）次快速缩放猛推（`multi-phase-camera` 单个推进阶段 + `coordinate-target-zoom`）落到仪表盘特写；退场是后拉 / 淡出到黑。仪表之间由元素来伪造推进：动态文字放大冲出画面（`kinetic-beat-slam` + `motion-blur-streak`）。gauge-beat 形态连这次猛推也去掉 —— 完全静止，所有穿透都是元素级的。当视觉语汇是深色的快节奏蒙太奇时用这个模式；对于单一连续的论证，Problem / Product_Intro 模式仍是默认。
