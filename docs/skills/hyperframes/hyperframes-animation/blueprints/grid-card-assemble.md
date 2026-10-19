<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/grid-card-assemble.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# grid-card-assemble — 网格 / 卡片组装

**intent**（意图）：N 个条目（方块 / 卡片 / logo / 列表行）以错落级联的方式自行组装成一个网格或纵向列表并保持 —— 一个「看看有多少 / 有谁 / 它能做什么」的段落节拍，一次性罗列出广度；可选的镜头拉远（zoom-OUT）往后拉，揭示组装好的阵列其实位于一个更广阔的整体之中。

**roles served**（适用角色）

- Key_Feature（来自 key-feature-card-grid-assemble）：一组带标签的功能方块 / 胶囊（图标 + 标签）逐个级联进入一个两列砖砌 / 3×3 网格，然后以缓慢推进近乎静止地保持 —— 罗列众多能力，没有实时 UI，没有光标。
- Key_Feature（来自 key-feature-glass-card-camera-reveal）：以 2–3 个发光图标的紧凑特写开场；一次镜头拉远展开一排玻璃拟态卡片，卡片从图标后面长出来（图标缩小成卡片的页头），中间那张卡片向前放大，整组漂浮，然后扫出画面 —— 这是同一组装形态的一个「支柱一次性揭示」变体。
- Benefits（来自 benefits-vertical-list）：简短的价值短语以约每秒 1 条的速度填进一个单列纵向列表，同时在场、不断累积；每一行的进入方式是标记点弹簧弹出 + 对勾描画 + 胶囊遮罩擦除，或者（OR）整个堆叠每拍向上移一格（老虎机式），让最新的一条落在明亮的焦点槽位里。
- Social_Proof（来自 social-proof-logo-grid-zoom-out）：一面合作伙伴 / 应用 logo 墙搭建成一个居中网格（整体进入 / 随机弹出 / 按列上滑），上方可选地填入一个标题 + 强调渐变色的证明数字，然后一次连续的镜头拉远把阵列缩小，揭示出一个庞大的生态；可选固定的 HUD / 取景器角标；可选网格上滑飞出的退场。
- Key_Feature（来自 live-data-populate-board）：阵列通过自我填充（POPULATING ITSELF）来组装 —— 骨架胶囊被填满并替换成真实数据，卡片弹簧式进入、并用连线拴在地图标记上 —— 组装完成后，它的状态还在实时翻转（状态胶囊依次步进过各个状态）；无光标，画面锁定。「看看有多少」的段落节拍变成「看，它此刻正在做」。
- Benefits（来自 item-field-to-payoff-card）：一个广度场（FIELD）—— 一条快速流过固定焦点槽位的列表，或一组带一个高亮 hero 的 chip 阵列 —— 先演完它的广度运动，然后清空（CLEARS），换成简洁的居中收束文字（主张 / 价格 / URL 结尾卡）。阵列是论证的铺垫；收束句是它的落点。

**duration**（时长）：3.0–10.5s（Social_Proof 3.0–6s · live-populate 4.2–7.8s · Key_Feature 网格 5.8–7.3s · Benefits 流式 / 场到收束 5.9–8.4s · Key_Feature 玻璃卡片 6.5s · Benefits 列表 6.5–10.5s，按条目数以约每秒 1 条伸缩）

**shot structure**（镜头结构）（合并后的模板 —— 具体的运动动词，[slots]）

- **Scene 1 (0.0–~1.0s) —— 开场 + 第一批到场。** 在一个 `[gradient / radial / dark background]` 上（可选 `[dot-grid / drifting-watermark]` 纹理），先立住一个空的 `[grid or list region]`，条目开始以快速的错落级联组装（间隔约 0.04–0.08s；列表节奏约每秒 1 条）。每个 `[item: feature tile / pill / logo tile / benefit line]` 淡入 + 短距离滑动 / 缩放，直接进入它的槽位（低戏剧性 —— 不散开，不大幅弹跳；弹簧过冲只留给强调标记点）。镜头静止。阵列上方可以逐行填入一个开场 `[headline / hook]`，任何 `[proof number]` 以 `[accent gradient]` 向上计数。
- **Scene 2 (~1.0s–~Xs) —— 阵列成形 + 保持。** 剩下的条目完成到场；布局成形为最终的 `[2-col-brick / 3×3 grid / dense mosaic / stacked list]`。完成的阵列保持住，活着但处于静息：方块上有轻柔连续的视差 / 正弦漂浮，和 / 或一次缓慢的镜头推进（微弱放大）。可选一道 `[accent-color]` 辉光在方块上 / 背后游走。
- **Scene 3 (~Xs–end) —— 落定 / 揭示 / 退场。** 一切落定并保持到结尾，或者（OR）运行可选的镜头修饰（见下文），或者（OR）一个 `[closing line / CTA]` 给阵列做首尾呼应。或者（OR）场清空、换成收束文案 —— 阵列退场，一个简洁的居中 `[claim / price / URL]` 落下（价格通过非常快的字符瞬间搭建，中间有一个转瞬即逝的部分状态；URL 通过从左到右的揭示，保持为 `[accent]`，只在最后一拍翻成 `[ink]`）—— 或者（OR）镜头穿透一个高亮的 `[hero item]`（一次快速加速的推进），并交叉淡化进第二个更广阔的、不断后退的 `[word-grid depth field]`，它持续缩小、揭示越来越多的条目，然后淡出到收束。

变体（各角色与模板分歧之处）：

- **变体 —— Key_Feature 网格**：条目是带标签的 `[icon + feature-label]` 方块 / 胶囊，组装成两列砖砌 / 3×3 网格；近乎静止的保持，伴随缓慢推进 + 可选的游走辉光扫过；标题首尾呼应（`[hook]` → `[CTA]`）。没有镜头揭示。
- **变体 —— Key_Feature 玻璃卡片揭示**：组装由镜头驱动（CAMERA-DRIVEN），而不是元素错落。以 `[2–3 glowing icons]` 的紧凑特写开场；镜头拉远，让 `[N]` 张玻璃卡片从图标后面长出来（图标缩小约 50%，变成卡片页头），`[center card]` 放大到约 105% 并向前移动，压住两侧卡片（快速弹簧）；卡片并排保持，伴随连续的视差漂浮；退场 = 一次快速的运动模糊扫动（SWEEP）把卡片滑出画面。
- **变体 —— Benefits 纵向列表**：一个单列纵向 `[benefit-line]` 堆叠，约每秒 1 条，三种子模式 —— (a) BUILD：每一行都保持完全点亮；进入方式 = `[marker]` 弹簧弹出 + `[check/icon]` 描画 + `[pill]` 对文字做遮罩擦除；(b) SNAP：整个堆叠每拍向上移一格（约 0.1s，带缓动），让最新的一行落在明亮的焦点槽位里，离开焦点槽位的行按位置变暗；(c) STREAM：列表快速、连续地滚过焦点槽位 —— 中心条目不透明 `[ink]` 并略微放大，相邻条目淡化 / 缩小 —— 然后减速（DECELERATES），停在 `[chosen item]` 上；可选在对侧放一个固定静态的 `[label]` 做分屏构图；随后场清空，换成一个居中的 `[payoff line]`。镜头静止；对侧可选放一个持续运转的 `[decorative orbit/disc]`。没有镜头揭示。
- **变体 —— Key_Feature live-populate**：组装是一波数据填充（DATA-POPULATION），无光标，画面锁定（± 开场时一次轻柔的拉远，给 `[headline]` 腾出位置）。两种看板形态 —— (a) ANCHORED：`[white data cards]` 逐张弹簧式进入，每张都用一根细线拴在 `[map/board surface]` 上对应的 `[marker]` 上，这些标记在脉动（扩散并淡出的圆环）；(b) TABULAR：新的 `[columns]` 以灰色骨架胶囊的形式出现，进度填充从左到右运行、自上而下错落（彩色填充，带一个领头的尖端），每根条在完成时替换（SWAPPING）成它真实的 `[value/avatar chip]`。组装完成后阵列保持实时（LIVE）：`[status pills]` 以快速利落的替换翻转状态（按颜色编码，连续好几个），或者 `[headline]` 交叉淡化，第二波填充在一个新揭示的区域上运行 —— 表格内容在一个吸顶的首列下方水平滚动，把这个区域露出来。最后定在完全填满、完全更新的最终状态上。
- **变体 —— Social_Proof logo 墙拉远**：开场段落节拍（`[trusted-by headline]` 卡片或（OR）一张 `[product screenshot]`）交叉淡化 / 切到一个居中的 logo 网格，网格逐步搭建（整体进入 / 随机弹出 / 按列上滑）；然后一次连续的镜头拉远把整个网格朝中心缩小，揭示出一个庞大的生态并保持；可选固定的 HUD / 取景器角标；可选退场 = 整个网格向上滑动（SLIDES UP），从顶部飞出。

**motion vocabulary**（运动词汇）：条目错落组装（淡入 + 短距离滑动 / 缩放进入槽位）· 砖砌 / 网格 / 列表布局成形 · 随机弹出 · 按列上滑 · 纵向列表步进（老虎机式的瞬切并保持）· 弹簧过冲的标记点弹出 · 对勾 / 图标描画 · 胶囊 / 标签遮罩擦除揭示 · 按位置变暗以弱化 · 标题逐行填入 · 强调渐变色数字向上计数 · 近乎静止的保持 · 保持期间轻柔的视差 / 正弦漂浮 · 缓慢的镜头推进 · 镜头拉远揭示（连续的或（OR）分阶段的后拉）· 卡片从图标后面长出 · 图标缩小成页头 · 中间卡片放大 + 向前压住（弹簧）· 游走辉光扫过 · 固定的 HUD / 取景器角标 · 运动模糊滑出扫动（退场）· 网格上滑飞出（退场）· 标题首尾呼应淡入淡出 · 持续运转的装饰性环绕 / 循环 · 骨架胶囊进度填充（从左到右、领头尖端、颜色过渡）· 填充完成后替换成真实数据 · 自上而下错落的填充级联 · 实时的状态胶囊状态翻转（按颜色编码，组装之后）· 用连线拴住的卡片弹簧进入（细线连到锚定标记）· 脉动的标记圆环 · 两波填充并伴随标题交叉淡化 · 吸顶列的内部水平滚动 · 快速纵向流过固定焦点槽位 + 减速停下 · 分屏固定标签布局 · 标签填满时胶囊随之变宽的到场 · 高亮的 hero chip · 穿透 hero 条目的退场 · 不断后退的文字网格纵深场 · 清空换成收束的尾声 · 价格瞬间搭建（转瞬即逝的部分状态）· 从左到右的 URL 揭示 + 最后一拍的颜色翻转。

**rule mapping**（规则映射）（运动动词 → `rule-id`）

- 条目错落组装进槽位 → `center-outward-expansion`（逐条错落 + 短路径滑动变体；如果一面墙密到无法真的从中心爆开，就用它「starting partially-spread」/ 直接进入槽位的形态 —— 见下文「合并冲突」）
- 砖砌 / 网格 / 列表布局成形 → `center-outward-expansion`（目标位置 = 最终布局槽位）
- 随机弹出错落 → `gsap-effects`（stagger 配方；随机化的 `from` / 顺序）
- 按列上滑进网格 → `gsap-effects`（逐列错落上滑）
- 纵向列表步进 / 老虎机式的瞬切并保持 → `vertical-spring-ticker`（STEPS = 行推进的次数）
- 弹簧过冲的标记点弹出 → `spring-pop-entrance`（back.out 弹簧）—— 错落的弹出链也可用 `gsap-effects`
- 标记点内的对勾 / 图标描画 → `svg-path-draw`
- 方块里的线稿图标动起来（内部部件）→ `svg-icon-enrichment`
- 胶囊 / 标签遮罩擦除文字揭示 → `techniques.md`（clip-path 揭示）
- 按位置变暗以弱化 → `gsap-effects`（按槽位设置每行的不透明度；没有专门的规则）
- 标题逐行填入 → `discrete-text-sequence`
- 强调渐变色的证明数字向上计数 → `counting-dynamic-scale`
- 保持期间轻柔的视差 / 正弦漂浮 → `sine-wave-loop`（对保持中的网格应用并发元素振幅 `/√N` 规则）
- 缓慢的镜头推进 → `multi-phase-camera`（steady-push 阶段模式）
- 中间卡片放大 + 向前压住 → `spring-pop-entrance`（快速弹簧）+ `techniques.md` CSS-3D（z 轴纵深上的压叠）
- 卡片从图标后面长出 / 图标缩小成页头 → 由镜头揭示驱动（`multi-phase-camera`）—— 长出 / 缩小都是与后拉阶段和弦同步的缩放 tween；没有单独的规则
- 固定的 HUD / 取景器角标 → `ai-tracking-box`（静态角标变体 —— 覆盖式边框，不做跟踪）
- 标题首尾呼应淡入淡出 → `discrete-text-sequence`（或 `gsap-effects` 淡入淡出）
- 持续运转的装饰性环绕 / 圆盘 / 循环 → `sine-wave-loop`（如果是环绕的徽章圆环则用 `orbit-3d-entry`）
- 在方块上 / 背后游走的辉光扫过 → `ambient-glow-bloom`（一次性扫过方块的游走辉光）
- 运动模糊滑出扫动（玻璃卡片退场）→ `motion-blur-streak`（作用在把卡片带出画面的快速扫动上的定向速度模糊）
- 网格上滑飞出退场 → `gsap-effects`（单纯的错落平移出画面；不需要专门的规则 —— 一个基础的退场 tween，不是缺失的能力）
- 骨架胶囊进度填充 → `stat-bars-and-fills`（进度填充的 `scaleX` 形态；领头尖端是一个和弦同步的子元素）
- 填充完成后替换成真实数据 / 实时状态胶囊翻转 / 两波之间的标题交叉淡化 → `discrete-text-sequence`（在时间阈值处整体替换状态 —— 胶囊的状态就是文字状态）
- 自上而下错落的填充级联 → `gsap-effects`（在填充 tween 上做逐行错落）
- 用连线拴住的卡片弹簧进入 → `spring-pop-entrance`（卡片）+ `avatar-cloud-network`（连到锚点的细连线布局；锚点坐标必须与标记完全一致）+ 如果连线是描画出来的则加 `svg-path-draw`
- 脉动的标记圆环 → `cursor-click-ripple`（用它的扩散圆环 + 起落式不透明度包络，去掉光标 / 点击，做有限次重复）
- 吸顶列的内部水平滚动 → `viewport-change`（作用在内部列图层上的 PAN 形态；吸顶列放在被摇移的图层之外）—— 给移动图层标上 `data-layout-allow-overflow`，并在表格卡片处裁切
- 快速纵向流过焦点槽位 + 减速停下 → `vertical-spring-ticker`（连续形态：用一次长的减速平移代替它的步进 tween；焦点槽位的强调沿用上面「按位置变暗」的映射）
- 标签填满时胶囊随之变宽 → `card-morph-anchor` 的替代法则（等比的 `scaleX` / clip-path —— 绝不 tween `width`）+ 标签填充用 `discrete-text-sequence`
- 穿透 hero 条目的退场 → `multi-phase-camera`（一个加速推进阶段），通过 `coordinate-target-zoom` 瞄准高亮的 chip，在峰值处交叉淡化
- 不断后退的文字网格纵深场 → `viewport-change`（一个 `.world` wrapper，`cam.scale` 持续 ↓ —— 把拉远揭示的语法用在一个文字场上；用尺寸 / 不透明度分层来伪造纵深）
- 价格瞬间搭建（转瞬即逝的部分状态）→ `discrete-text-sequence`（带批量追加的非线性打字 —— 正是它的打错字 / 部分状态机制）
- 从左到右的 URL 揭示 → `techniques.md`（clip-path 揭示 —— 与胶囊遮罩擦除的映射相同）；最后一拍的颜色翻转 → `gsap-effects`（在这一拍放一个 `tl.set` —— 基础操作，不需要规则）

**camera modifier — zoom-OUT reveal**（镜头修饰 —— 拉远揭示）（可选；对玻璃卡片和 logo 墙变体来说，这是定义角色的那个动作）：一个包住整个阵列的镜头 wrapper 在保持期间缩小（scales DOWN），揭示出组装好的网格 / 卡片位于一个更大的环境之中（生态规模，或一排从紧凑图标中展开的卡片）。

- 连续单程拉远（Social_Proof 生态后拉）→ `viewport-change`（一个 wrapper，通过 onUpdate 让 `cam.scale` ↓ —— 唯一的事实来源）
- 分阶段的后拉 → 聚焦 → 落定，自带漂移（Key_Feature 紧凑图标 → 卡片展开）→ `multi-phase-camera`（使用「Dramatic reveal: push → neutral → pull」/ 后拉阶段模式；卡片的长出 / 缩小与后拉阶段和弦同步）

---

```
BLUEPRINT: grid-card-assemble — serves Key_Feature, Benefits, Social_Proof (folded 4 drafts + 2 mined clusters: live-data-populate-board, item-field-to-payoff-card)
RULE COVERAGE: complete, no gaps — traveling-glow sweep → ambient-glow-bloom; motion-blur slide-out sweep (exit) → motion-blur-streak; grid slide-up fly-out (exit) → gsap-effects (plain translate); skeleton-fill populate → stat-bars-and-fills + discrete-text-sequence; push-through-hero exit → multi-phase-camera + coordinate-target-zoom
```

合并冲突：`center-outward-expansion`（错落组装最自然的支撑规则）在 3–8 个条目时干净利落，并且明确警告 8 个以上会在飞行途中重叠成一团乱 —— 但 Social_Proof 的 logo 墙刻意做得很密（12 个以上方块），所以对这个变体来说，条目绝不能（NOT）从一个共同的中心爆开；它们要短距离直接滑进各自的槽位（即该规则的「starting partially-spread」/ 短路径形态，或者用 `gsap-effects` 逐条错落），而合并后的 Scene 1 动词已经规定了这一点：「短距离直接进入它的槽位」。
