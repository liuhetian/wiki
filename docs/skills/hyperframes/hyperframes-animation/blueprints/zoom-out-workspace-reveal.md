<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/zoom-out-workspace-reveal.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# zoom-out-workspace-reveal —— 拉远揭示工作区

**intent / 意图**：一开场就**紧紧**框在一个满版的细节上 —— 一个图形微距画面或一小块 UI 区域 —— 让微动作在特写里上演，然后**一次**连续减速的拉远揭示出：到目前为止看到的一切都位于一个包含它的整体之中（一个设计工具的工作区 / 一个多窗格的 agent 工作区）；画面在全景处锁定，元素级的兑现继续进行。拉远**就是**叙事引擎，揭示出嵌套关系就是兑现 —— 这区别于 `grid-card-assemble`，那里的**拉远**是一个可选的镜头修饰，给元素错开组装锦上添花；这里没有任何东西在组装，世界从一开始就是完整的，而这唯一一次向外的移动重新界定了它的意义。它在结构上是所有现有推近形态的反向（`constellation-hub` 的推近、`device-surface-showcase` 的连续推近、`dataviz-countup` 的穿透推进）。

**roles served / 服务的角色**

- Hook（来自 `continuous-zoomout-nesting-reveal`）：当开场应该是一个满版的图形谜题时 —— 一团 blob 在变形、一朵微距花在绽放 —— 由一次不间断、指数减速的拉远来解开，拉远会**穿过**一个中间层构图（超大标题 / 卡片插画 / 网页），最后揭示出整个东西是设计工具里的一个画板（面板、图层、检查器、timeline）；画面锁定，画布继续动画，结束在动作进行中。
- Benefits（来自 `close-up-open-single-zoom-out-reveal`）：当兑现点是规模 / 广度时 —— 微动作在一小块 UI 区域的极端特写里上演（文件行弹入、高亮逐步移动、沿列表的引导滑行），然后**一次**快速、平滑减速的拉远（约 0.5–1 秒）揭示出这块区域只是一个巨大的多窗格 agent 工作区的一角（聊天 + 产物预览 + 侧栏）；全景静止停留到结束，同时元素级的兑现把故事讲完（「看 agent 做了多少 —— 这是交付物」）。

**duration / 时长**：6.8–11 秒（Hook 连续拉回，两例都是 6.8 秒；Benefits 先停留后猛拉，10.7–11 秒 —— 拉长的是停留和锁定后的兑现，揭示本身不变长）

**硬规则 —— 任何地方都不许推近；除了那一次揭示，镜头保持静止。** 原样沿用自两个 Benefits golden 样本，在结构上对两个 Hook golden 样本也成立：镜头唯一的缩放运动是**向外**的。每个镜头一次拉远。揭示之前，镜头要么停住，要么沿特写表面滑行 / 平移，要么已经在进行那（唯一一）次拉回；揭示减速到完全停止之后，画面**锁定** —— 之后的每一次变化（窗格替换、窗格展开、光标移动、播放头拖动、画布动画）都是元素 / 布局运动，绝不是镜头运动。不推近，不做冲击式推进，不重新缩放，不做第二次揭示。违反这一点，这个形态就会塌回成一次普通的镜头导览。

**shot structure / 镜头结构**（一个超大的静态世界 —— 完整的 `[whole: workspace]` 从第 0 帧起就按最终布局搭好 —— 镜头一开始在 `[detail]` 上放大到很深；揭示是对这个世界的一次缩放动画；两个合并进来的子形态 —— **(A) 连续嵌套拉回**（Hook）和 **(B) 特写停留 → 猛然揭示**（Benefits））

- **Scene 1（0.0–约 2.5 秒）—— 满版细节 + 微动作。** 极端特写：`[detail: graphic macro — blob / blossom stem / small UI region — file list / browser corner]` 从边到边填满画面，看**不到**任何包含它的 chrome、画布或相邻窗格。细节在特写中**表演** —— 这一拍绝不是静态停留：
  - _变体 —— Hook (A)_：图形本身在移动 / 变形 / 绽放 —— 一团有机的 `[accent]` blob 流过画面并变形成一条起伏的波浪线，或者模糊的微距形状逐渐清晰，圆形花瓣弹出并向外扩展成一个扁平的矢量 `[motif]` —— 同时拉回**已经**在底下进行（镜头从不等待）。
  - _变体 —— Benefits (B)_：镜头停住（或滑行），同时 UI 微动作上演 —— `[rows: filenames / list items]` 从上到下弹入，一个柔和的 `[highlight]` 逐行往下移动，或者镜头一边沿列表往下走一边轻轻拉回。开场帧上可选一次由模糊到清晰的定焦。

- **Scene 2（约 2.5 秒–揭示开始）—— 中间一拍。** 按子形态分化：
  - _变体 —— Hook (A) —— 中间嵌套层级_：持续的拉远让一个中间层级的构图定型，仍然满版，仍然没有 chrome —— 超大的 `[headline]` 字形以不完整的字母形态降入画面并落定在中央（这种「下降」纯粹是世界缩放造成的：字母在世界空间里是静止的，是镜头拉回产生了运动），或者揭示出 `[motif]` 位于一个 `[web page]` 上一排卡片中的某张 `[card]` 里。观众重新界定一次范围 —— 但仍然不知道真正的容器是什么。
  - _变体 —— Benefits (B) —— 特写段落推进_：特写的故事在同样的紧度下展开 —— 视图移到相邻的 `[panel]`，一个新的 `[row]` 淡入 / 滑入并撑大它的面板，一个 `[cursor]` 进入并悬停在上面，带一个柔和的高亮。这是揭示前的停留；张力在于「我们正深陷在某个东西里面」。

- **Scene 3（揭示）—— 一次减速拉远完成；画面锁定。** 招牌动作。镜头拉回到缩放 1 并缓动到完全停止，揭示出包含一切的 `[whole]`：
  - _变体 —— Hook (A)_：这次拉回是从第 0 帧就开始的**同一次**连续缩放的尾段（在 6.8 秒的镜头中总共移动约 4.3–4.5 秒），带强烈的指数减速 —— `[intermediate composition]` 原来是 `[design-tool canvas]` 上的 `[an artboard / a phone-screen mock]`：浅色 chrome、左侧页面 / 图层面板、右侧属性检查器、蓝色选框、底部带关键帧条的动画 timeline。
  - _变体 —— Benefits (B)_：拉回是从停住的特写开始的一次独立的快速爆发（约 0.5–1 秒）—— 平滑、强减速 —— 落到完整的 `[multi-pane agent workspace]`：左侧是 `[chat pane]`，带提示词 + 状态 + 回应；中间 / 右侧是 `[artifact pane: spreadsheet / deck preview]`；可选的 `[sidebar: progress checklist + artifacts + context]`。
  - 两者通用：拉远要在镜头结束**之前**完成 —— 一定要留出锁定后的一幕。正是减速到停止让锁定变得清晰可读。

- **Scene 4（锁定–结束）—— 锁定全景上的元素级兑现。** 揭示不是结尾；特写里的世界在全景中继续活着。所有运动都是元素 / 布局运动：
  - _变体 —— Hook (A)_：一个 `[cursor]` 从画外进入，滑过去悬停 / 点击被选中的元素，或者一个 `[playhead]` 在底部 timeline 上从左往右拖动，同时画布上的作品同步动画（花瓣绕中心旋转、星芒原地旋转、一个图案扫过 / 移动）。结束在**动作进行中** —— 这个工具是活的。
  - _变体 —— Benefits (B)_：一个 `[file-attachment card]` 淡入 → 光标点击 `[Open]` → 产物窗格通过一次快速白闪替换内容 → 查看窗格在相邻窗格上方展开成全宽（**布局**运动，不是镜头）落到 `[deliverable: full slide / dashboard]` 上；或者画面只是长时间静止停留，同时光标漂移到 `[payoff stat]` 附近停下。侧栏里打了删除线的清单项读作已完成的工作。长时间停留到结束。

**motion vocabulary / 动作词汇**：一次由缩放驱动、带指数 / 缓动减速的连续拉远（不切）· 单次快速减速的拉远爆发（约 0.5–1 秒）· 缩放结束时锁定工作区 · 满版、无 chrome 的开场 · 由模糊到清晰的微距定焦 · 有机 blob 流动 + 变形成起伏的波浪线 · 波浪下划线落定后残留起伏 · 圆形花瓣弹出 / 向外扩展（绽放）· 超大字母以不完整字形降入画面（世界缩放，不是元素运动）· 文字穿过画面缩小并在中央落定 · 行从上到下弹入 · 选中高亮逐行往下移动 · 镜头沿列表往下走 / 平移，同时拉回 · 新行淡入 / 滑入并撑大它的面板 · 光标悬停带柔和的行高亮 · 光标从画外进入并滑过去悬停 / 点击 · timeline 播放头从左往右拖动 · 画布内绕中心旋转 / 原地旋转 · 图案移动 / 扫入 · 文件附件卡片淡入 · 光标点击 · 通过快速白闪替换窗格内容 · 窗格在相邻窗格上方展开成全宽（布局运动）· 清单项显示为删除线 · 长时间静态停留 · 光标漂移到停下 · 结束在动作进行中（Hook）。

**rule mapping / 规则映射**（运动动词 → `rule-id`）

- 对整个世界的单次减速拉远 → `viewport-change`（一个 `.world` 包裹层；`cam` 对象通过 `onUpdate` 作为唯一事实来源；`cam.scale` 起始于揭示比例，用 `T = -offset × S` 让细节居中，用**同一个**共享 ease 把 scale tween 到 1、translate tween 到 0 —— 全景接管时，细节从画面中心漂移到它原本的位置，正是 golden 样本的观感）
- 开场时框住偏离中心的细节，拉远到全景 → `coordinate-target-zoom`（「Zoom out (target → wide view)」变体 —— 嵌套包裹层，阶段反向：开场时放大在测量出的目标上，用共享的时长 / ease 把外层 scale tween 到 1 + 内层 translate tween 到 0；在 `fonts.ready` 之后测量细节的中心，绝不手算）
- 揭示前沿列表往下滑行 / 走，同时轻轻拉回（Benefits B）→ `viewport-change`（在同一个 `cam` 对象上组合平移 + 缩放）—— 编排「慢滑 → 停住 → 快拉」的速度曲线 → `multi-phase-camera`（阶段机制；这个形态以 4–12 倍向外运行同一套与缩放比例无关的数学 —— 见 `viewport-change` 里关于缩放指南范围的说明）
- 指数减速到停止 → ease 的选择（揭示 tween 上用 `expo.out` / `power4.out`）—— 参数层面的指导，不需要规则；停止之后，timeline 上**不存在**任何镜头 tween（见上面的硬规则）
- 与早段拉回同步发生的由模糊到清晰的微距定焦 → `depth-of-field-blur`（重新对焦 / 落定变体：`--dof` 随缩放退去而降到 0，和拉回放在同一个 timeline 位置）
- 超大的不完整字形下降 / 文字穿过画面缩小 → 不做元素 tween —— 在世界空间里静态搭好；由 `viewport-change` 的拉回产生运动（作者陷阱：单独给字母做动画会让它们被移动两次）
- 有机 blob 流动 + 变形成波浪线 → SVG 路径变形 —— 见 `hyperframes-keyframes`（morph）；标记为特殊项，就像 `device-surface-showcase` 的 WebGL 特殊项一样 —— 没有加载这项能力时，换成一个不需要变形的强调元素
- 波浪下划线的残留起伏 → `sine-wave-loop`（有限、有界的起伏）
- 圆形花瓣弹出 / 向外扩展（绽放）→ `spring-pop-entrance`（错开的弹出）+ `center-outward-expansion`（花瓣从中心扩展到最终位置）
- 行从上到下弹入 → `spring-pop-entrance`（错开的一组，错开上限 ≤500ms）或 `gsap-effects`（低戏剧性的淡入 + 短距离滑动错开）
- 选中高亮逐行往下移动 → `gsap-effects`（在时间阈值处用阶梯式的 `tl.set` 重新定位 —— 瞬间跳步，不滑行；很简单，不需要专门的规则）
- 新行淡入 / 滑入 → `spring-pop-entrance`（柔和变体）；它的面板随之长大以容纳它 → `anchored-layout-expand`（单轴布局扩展）
- 光标从画外进入 → 滑行 → 悬停 → 点击 → `cursor-click-ripple`（移到目标、一起压下、涟漪）；柔和的悬停行高亮 → `gsap-effects`（background-color/opacity tween）
- timeline 播放头从左往右拖动 → `gsap-effects`（线性 `ease:"none"` 的 translateX）；画布同步动画 = 把作品的 tween 放在和拖动相同的 timeline 位置上（在同一条暂停的 timeline 上，同步是天然的）
- 画布内绕中心旋转 / 原地旋转（花瓣花朵、星芒）→ `svg-icon-enrichment`（用 SVG `setAttribute('transform','rotate(deg cx cy)')` 指定明确的中心）
- 卡片上的图案移动 / 扫入 → `gsap-effects`（带遮罩的平移）或 `techniques.md` 的 clip-path 揭示
- 文件附件卡片淡入 → `spring-pop-entrance`（柔和）/ `gsap-effects` 淡入
- 通过快速白闪替换窗格内容 → `discrete-text-sequence`（在阈值处做整体状态替换）+ `gsap-effects`（白色闪光 overlay，不透明度呈 attack-decay 包络）
- 窗格在相邻窗格上方展开成全宽（布局运动）→ `anchored-layout-expand`（单轴布局交接；仍然禁止对 width/height 做 tween）
- 打了删除线的清单项 / 状态 → 静态内容，或者如果它们在画面上被逐个勾掉，用 `discrete-text-sequence`
- 长时间静态停留 + 光标漂移到停下 → 停留不需要规则；漂移是一次缓慢的 `gsap-effects` 平移，要**到达**某个有意义的地方（停在兑现数据附近）—— 它在表演，不是闲置晃动
- 结束在动作进行中（Hook）→ 播放头 / 画布的 tween 直接跑到 composition 的边界 —— 没有退场动作，不需要规则

**camera law / 镜头法则 —— 编排那一次移动**（在这里镜头是引擎，而不是修饰）

- 把**整个** `[whole]` 工作区按最终布局搭在一个 `.world` 包裹层里；没有第二套布景。开场是 `cam.scale = S0`（通常 4–12 倍 —— 取能让 `[detail]` 满版的值），用反向平移让细节居中；揭示 tween 到 `scale 1, translate 0`。场景上设 `overflow: hidden`；背景放在场景上，绝不放在 world 上。
- 清晰度约束：开场时可见的一切都必须经得起 S0 倍放大 —— 用 DOM / 矢量（文字、SVG、CSS 形状）来搭细节；特写里的任何位图都需要 `sourceResolution ≥ rendered × S0`。
- 子形态 A：揭示 tween 跨越约 0–4.5 秒，带 `expo.out` 级别的减速 —— 一个 tween，不分阶段，不切；元素节拍（变形、绽放、字形落定）沿着它排布。
- 子形态 B：在停留期间可选一次温和的揭示前平移 / 拉回（`viewport-change` 平移，或一次缓慢的缩放 ease-out，移动量 ≤ 约 15%），然后揭示爆发（约 0.5–1 秒，强减速）作为它自己的 tween；之后镜头完全静止。
- 绝不：推近、第二次拉远、锁定后的镜头运动，或者用一次切来代替揭示。一次向外的移动就是全部语法。

**boundary vs `grid-card-assemble` / 与 `grid-card-assemble` 的边界**：它本来就带有一个可选的**拉远**揭示修饰（glass-card / logo-wall 变体），所以这两个形态彼此相邻。判断方法：如果元素在**组装**，而拉回只是把组装好的阵列放到上下文里展示，那就是 `grid-card-assemble`；如果世界从第 0 帧起就是完整的，而这一次减速拉回本身就是故事 —— 特写谜题 → 嵌套揭示 → 锁定画面的兑现 —— 那就是这个 blueprint。相关佐证：一个挖掘出来的个人主页 golden 样本在一个动态文字镜头里以小尺度运行了同样的单次 UI 拉远 / 上滚揭示，佐证了这个动作的通用性，但并不共享这个形态。
