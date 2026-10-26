# 规则索引

原子级的运动配方。每一条都放在 `rules/<name>.md`。每个场景用一条暂停的 timeline 组合 2–4 条。

## 约定 —— 每条规则都默认这一点

在这里统一说一次，各条规则就不再重复。`rules/` 里的每个配方：

- 运行在**唯一一条** **暂停的** GSAP timeline 上，该 timeline 注册在 `window.__timelines` 上（绝不自动播放，绝不建第二条 timeline）；
- **双向 seek 安全**：用带显式起始状态的 `fromTo`（seek 时 t=0 也正确；重新接管一个目标时用 `immediateRender: false`），用绝对值 —— 绝不用相对的 `+=` tween；状态可以作为 timeline 时间的纯函数读出，不用可变的跟踪变量；
- 是**确定性的**：不用 `Math.random()`，不用 `Date.now()` —— 只用由索引推导的伪随机和预先烘焙好的时间表；有限次重复（只有在根节点 `data-duration` 有限时才允许 `repeat: -1`）；
- 只动画 **transform 和只影响绘制的属性** —— 禁止对 `width`/`height`/`top`/`left` 做 tween（用 scale/translate 代理、遮罩，或 `anchored-layout-expand`）；
- 给组内错开设上限，让一次到达读起来是一拍（`items × stagger ≤ ~0.5s`）；
- 在被动画的元素上**不加 CSS `transition`**（它们会独立于 seek 插值，导致闪烁），并在许多 tween 同时运行的地方用 `will-change: transform` 提示合成器；
- 只有在**单场景** composition 中才在构建时测量 DOM（`offsetHeight`、`getBoundingClientRect`）—— 在多场景蒙太奇里，后面的 clip 可能还没完成布局：改用按 CSS 写好、与之匹配的常量；
- 按 `hyperframes-core` 的规定放在标准的场景 clip 里（`class="clip"` + `data-*` 计时）—— 规则里的代码片段只展示机制相关的 DOM，不包含场景脚手架。

一条规则自己的 **Critical Constraints**（关键约束）小节只列出在这份约定之外、该规则**特有**的内容。

## 文字与排版

<rules>
<hacker-flip-3d path="rules/hacker-flip-3d.md">字符级 3D 旋转，配合确定性的字形替换（解密效果）。GSAP `back.out` ease + 逐字形的 `onUpdate` 生成闪烁哈希。Tags: text, 3d, reveal, decode</hacker-flip-3d>
<vertical-spring-ticker path="rules/vertical-spring-ticker.md">老虎机式的纵向滚动，在一个带遮罩的列里使用阶梯式的 GSAP tween。Tags: text, ticker, scroll, vertical</vertical-spring-ticker>
<counting-dynamic-scale path="rules/counting-dynamic-scale.md">计数器，其 transform 缩放随数值增长，用于逐级加强的强调。一个数值代理和缩放 tween 共享同一个 timeline 位置。Tags: counter, scale, transform, number, dynamic</counting-dynamic-scale>
<discrete-text-sequence path="rules/discrete-text-sequence.md">在时间阈值处替换整段文本状态，实现非线性打字（打错字、停顿、整块添加、退格）。由 GSAP onUpdate 驱动的反向查找。Tags: text, typing, discrete, threshold, non-linear</discrete-text-sequence>
<asr-keyword-glow path="rules/asr-keyword-glow.md">用发光 + 缩放 + 颜色高亮关键词，与 ASR 逐词时间戳同步。每个词两个 GSAP tween，驱动 CSS 自定义属性 `--glow` 走一个 attack-decay-rest 包络。Tags: asr, audio-sync, highlight, glow, keyword, text</asr-keyword-glow>
<3d-text-depth-layers path="rules/3d-text-depth-layers.md">多个偏移的文字图层（N 个 div 位于 `(i*dx, i*dy)`，alpha 递减）在大号字体上营造出堆叠的 3D 挤出错觉。Tags: text, 3d, depth, layers, shadow, typography, stacked</3d-text-depth-layers>
<context-sensitive-cursor path="rules/context-sensitive-cursor.md">打字光标，其 `background-color` 在分段边界处切换，并通过 `(tl.time() % cycle) < cycle/2` 实现方波闪烁。Tags: cursor, color, context, typewriter, styling, segment</context-sensitive-cursor>
<dynamic-content-sequencing path="rules/dynamic-content-sequencing.md">从一份由 `{textMain, textAccent, charSpeed, hold}` 条目组成的脚本预先算出一个扁平的 `[{startTime, endTime, ...}]` 数组。每个短语的时间窗口 = `chars × charSpeed + hold`。由内容驱动时长，没有手调的偏移量。Tags: timeline, sequencing, dynamic, duration, script-driven</dynamic-content-sequencing>
<kinetic-beat-slam path="rules/kinetic-beat-slam.md">打击乐式的动态文字 —— 短句在**同一个**共享节拍数组上猛砸进来，每个短语有**各不相同**的入场方式（scale-slam / side-snap / rise-rotate），可选的节奏装饰（节拍器刻度、节拍条），最后是一个锁定的收尾。「有冲劲 / 有节奏感」标语的配方。Tags: text, kinetic, typography, beat, rhythm, slam, percussive, punchy</kinetic-beat-slam>
<gradient-text-sweep path="rules/gradient-text-sweep.md">一个**穿过**字形做 tween 的渐变 —— `background-clip: text` + 对超大背景做 `backgroundPosition` tween。可以是在停留的标题上连续扫过、逐词移动的高亮（堆叠副本的不透明度包络），或者一次色相扫过，再通过像素级一致的孪生副本交叉淡变落定为纯色。字形从不移动；有限、seek 安全。Tags: gradient, text, sweep, background-clip, highlight, hue, headline</gradient-text-sweep>
<chromatic-glitch path="rules/chromatic-glitch.md">会猛然恢复清晰的 RGB 分离 / 切片故障效果 —— 偏移的颜色副本按**量化后的** timeline 时间的确定性哈希抖动（绝不用 Math.random），或者水平切片带在阶梯式 ease 下错位再汇合；短暂震动，干净收束，钳定的静止状态。有入场拉伸、强调爆发和切片揭示三种形式。Tags: glitch, rgb-split, chromatic, slice, jitter, stutter, snap</chromatic-glitch>
</rules>

## 数据与统计

<rules>
<counting-dynamic-scale path="rules/counting-dynamic-scale.md">计数器，其 transform 缩放随数值增长；seek 安全的 `onUpdate`、`Math.round`、`tabular-nums`、多个数据同步齐发。（也列在「文字与排版」下。）Tags: counter, number, stat, count-up</counting-dynamic-scale>
<stat-bars-and-fills path="rules/stat-bars-and-fills.md">把数字和图形配对的数据可视化基础元件 —— 增长柱（CSS `scaleY` 错开）、进度填充（条形 `scaleX` 或测量过的 SVG 圆环），以及分数星级擦除（`clip-path`）。只用 transform，seek 安全。在单焦点和分屏之间选一个并坚持到底。Tags: data, stats, chart, bars, progress, ring, stars, rating, infographic</stat-bars-and-fills>
<chart-scrub-readout path="rules/chart-scrub-readout.md">光标 / 播放头在一张已经画好的图表上拖动 —— **一个**驱动器沿一条烘焙好的数据折线移动一条垂直跟踪线 + 标记点，同时一个日期 / 数值 tooltip 逐步走过数据数组（只在索引变化时写入文本）；第二条序列可以在交叉时激活。图表的出现归 `stat-bars-and-fills` / `svg-path-draw` 管；这一条是读取头。Tags: chart, scrub, tooltip, readout, tracking-line, data, playhead</chart-scrub-readout>
</rules>

## 镜头与 viewport

<rules>
<coordinate-target-zoom path="rules/coordinate-target-zoom.md">通过缩放（外层包裹）+ 反向平移（内层包裹）放大到不在中心的元素上。Tags: camera, zoom, scale, translate</coordinate-target-zoom>
<camera-cursor-tracking path="rules/camera-cursor-tracking.md">两阶段的虚拟镜头，把 viewport 锁定到一个移动的焦点（打字光标）上 —— 先是静态的初始构图，然后是锁定焦点的跟踪。在 `document.fonts.ready` 之后使用浏览器原生的 `getBoundingClientRect()` / `ctx.measureText()`。Tags: camera, tracking, viewport, two-phase, typing</camera-cursor-tracking>
<multi-phase-camera path="rules/multi-phase-camera.md">顺序执行的镜头缩放系统（拉回 / 聚焦 / 推近）加上连续的微漂移。Tags: camera, zoom, phase, drift, scale, cinematic</multi-phase-camera>
<viewport-change path="rules/viewport-change.md">虚拟镜头 —— 通过对一个包含全部场景内容的 `.world` 包裹层做 transform 来模拟缩放 / 平移 / 焦点锁定。单元素的组合 transform `translate(x,y) scale(S)`；反向平移的算法是 `T = -offset × S`（与 coordinate-target-zoom 的 `T = -offset` **不同**）。Tags: viewport, camera, zoom, pan, focus-lock</viewport-change>
<3d-camera-flight path="rules/3d-camera-flight.md">在一个按 3D 布局的世界中做透视镜头**飞行** —— 一个静态的 `perspective` 舞台 + `preserve-3d` 的 `.world`，其姿态（`translate3d` + `rotateX`/`rotateY`）从单个镜头状态对象出发一段一段地做 tween：俯冲进一个倾斜的网格、倾斜转平的拉回、飞过竖立的卡片、减速进入焦点。落地用 `power4.out`，重新定位用 `power2.inOut`；景深通过对非焦点平面使用 depth-of-field-blur 实现。唯一一条在 Z 轴上旋转 / 移动的镜头规则（另外三条都是 2D 缩放 + 平移）。Tags: camera, 3d, flight, perspective, rotateX, translateZ, dive, tilt</3d-camera-flight>
<depth-of-field-blur path="rules/depth-of-field-blur.md">选择性的焦点转移 —— 通过 `--dof` 变量对失焦图层做 GSAP tween 的 `filter: blur()`（+ 轻微的不透明度压暗），同时焦点元素保持清晰；单次拉焦、双平面转焦，或者在推近时模糊整个集群。有限、确定性、seek 安全。Tags: blur, depth-of-field, focus, rack-focus, dim, spotlight</depth-of-field-blur>
</rules>

## 布局与网络

<rules>
<avatar-cloud-network path="rules/avatar-cloud-network.md">头像排在一个椭圆环上，用 SVG 连线连到中心点，错开入场。云的中心坐标必须与中心元素完全一致。Tags: avatar, cloud, network, social-proof, stagger</avatar-cloud-network>
<3d-page-scroll path="rules/3d-page-scroll.md">整个网页渲染成一张倾斜的 3D 卡片，其内部内容滚动以揭示特定区块。可以搭配 asr-keyword-glow 做页面上的关键词高亮。Tags: 3d, page, scroll, webpage, tilt, perspective, product-demo</3d-page-scroll>
<center-outward-expansion path="rules/center-outward-expansion.md">元素一开始聚集在屏幕中心，然后向外扩展到最终位置。每个元素通过 CSS 一次性拿到目标位置；GSAP 用一个共享驱动器把 transform 的 `x` / `y` 偏移同步 tween 到 0。Tags: expansion, scatter, center, reveal, layout, sync</center-outward-expansion>
<split-tilt-cards path="rules/split-tilt-cards.md">两张卡片并排，带相反的 rotationY 倾斜（+/- baseTilt），各自从自己那一侧滑入。持续的漂浮以反相运行（`Math.PI` 偏移）。Tags: 3d, cards, split, tilt, comparison, symmetric</split-tilt-cards>
<orbit-3d-entry path="rules/orbit-3d-entry.md">元素从 3D 空间翻转进入（`rotateX` + `rotateY` + `translateZ`），然后落定进一个连续的椭圆轨道。**关键**：入场**必须**在轨道起始位置原地翻转（在阶段 1 **之前** `gsap.set`），而不是在场景中心。Tags: orbit, 3d, flip, ellipse, circular, icon, entry, continuous</orbit-3d-entry>
<ai-tracking-box path="rules/ai-tracking-box.md">AI 检测 overlay —— 黄色 `#facc15` 的 L 形角括号 + 置信度标签（在 95-99% 之间波动），沿一条正弦弧线路径跟随目标。框的位置每帧根据目标位置重新计算（绝不单独 tween）。Tags: ai, tracking, bounding-box, detection, corner, ml</ai-tracking-box>
<depth-scatter-assemble path="rules/depth-scatter-assemble.md">N 个元素散开进入 / 重新组装自一团旋转的 3D 纵深云 —— 每个元素从一个由索引确定性推导的 3D 偏移（translateZ + rotateX/Y + 散布）出发，落定为干净的平面布局；有翻滚替换和径向爆开两种变体。preserve-3d + perspective，只用 transform，seek 安全。Tags: 3d, scatter, assemble, tumble, depth, perspective, glyphs</depth-scatter-assemble>
<anchored-layout-expand path="rules/anchored-layout-expand.md">边缘钉住的容器沿**一个**轴生长 / 收起，文档流中的内容随之重排 —— 胶囊弹开成下拉框、面板长出子任务堆栈、输入卡片随打字换行逐级变高、窗格在相邻窗格上方展开。只用 transform（布局按展开状态编写；遮罩 + 底板滑动，或由代理驱动的 scaleY + 反向抵消缩放），因为禁止对 width/height 做 tween；对后续内容的推动共享**同一个** tween，这样接缝永远不会分开。Tags: expand, collapse, anchored, dropdown, accordion, panel, reflow, push, mask, counter-scale</anchored-layout-expand>
</rules>

## SVG 与图标

<rules>
<svg-icon-enrichment path="rules/svg-icon-enrichment.md">给 SVG 内部元素做动画（旋转的指针、摆动的叶片、脉动的圆点、虚线流动的线条），让图标显得有生命。**关键**：用 SVG `setAttribute('transform', 'rotate(deg cx cy)')` 指定明确的中心 —— CSS `transform-origin` + `transform-box: fill-box` 会在包围盒局部坐标中解释原点（对细线条来说会偏离中心）。Tags: svg, icon, animation, micro-animation, rotation, pulse</svg-icon-enrichment>
<svg-path-draw path="rules/svg-path-draw.md">SVG 轮廓通过 `stroke-dasharray` / `stroke-dashoffset` 一笔一笔地把自己画出来。在 composition setup 时用 `getTotalLength()` 测量，把初始 dashoffset 设为长度，GSAP tween 到 0。对于圆形进度环，把描边旋转 `-90deg`，让绘制从 12 点钟方向开始。Tags: svg, stroke, draw, vector, path, dasharray</svg-path-draw>
</rules>

## 闲置与氛围

<rules>
<sine-wave-loop path="rules/sine-wave-loop.md">连续的呼吸 / 闲置氛围运动。两种形式：带有限次重复的 GSAP `sine.inOut` yoyo（单独使用时首选），或读取 `tl.time()` 的 onUpdate（需要乘到另一个实时变化的值上时首选）。Tags: idle, loop, breathing, sine, ambient</sine-wave-loop>
<ambient-glow-bloom path="rules/ambient-glow-bloom.md">无需触发的柔和径向光晕，在 hero 元素后方绽放，并以有界的闲置呼吸停留；或者一道单次移动、扫过表面的光泽。不需要点击，不需要逐词同步；峰值不透明度 ≤ 约 0.45，有限 / 确定性。Tags: glow, bloom, ambient, radial, sheen, hero</ambient-glow-bloom>
</rules>

## 转场与运动

<rules>
<reactive-displacement path="rules/reactive-displacement.md">物理碰撞式转场，由入场元素的 GSAP tween 驱动退场元素的位移。三个并发的 tween 位于同一个 timeline 位置，被撞元素的时长是闯入元素的 40-50%。Tags: transition, physics, collision, displacement, push</reactive-displacement>
<press-release-spring path="rules/press-release-spring.md">有触感的按钮按压：线性压缩，然后通过同一属性上两个相邻的 GSAP tween 做弹簧恢复。变体：颜色过渡、通过 CSS 变量实现的阴影深度、释放爆发、背景光晕。Tags: spring, press, button, interaction, physics, glow, burst</press-release-spring>
<physics-press-reaction path="rules/physics-press-reaction.md">物理点击模拟 —— 两个顺序执行的 GSAP 缩放 tween（降到 0.9，回到 1.0）近似一个带过冲的弹簧。传入单个目标数组 `["#cta", "#cursor"]`，让两者一起压缩，获得有触感的接触感。Tags: spring, click, physics, press, interaction, cursor</physics-press-reaction>
<cursor-click-ripple path="rules/cursor-click-ripple.md">动画光标移动到目标，点击时光标 + 目标一起压下，发出一圈扩张的涟漪，不透明度呈 attack-decay 包络。元素从 t=0 起就在 DOM 里，带 `opacity: 0`（不做条件渲染）。Tags: cursor, click, ripple, interaction, mouse, button, keyframes</cursor-click-ripple>
<cursor-drag path="rules/cursor-drag.md">驱动式光标的拖拽动作 —— 抓起（按下凹陷 + 抬起）、移动（半透明的幽灵副本通过匹配的 tween 与光标严格同步移动）、放下并吸附到一个带选中装饰的放置区域。变体：填充柄自动填充（线性移动 + 阶梯式 `tl.set` 揭示单元格）、角柄等比缩放（统一缩放，原点在锚点角 —— 绝不用 width/height）、抓起-抬升-重排（倾斜 + 阴影，相邻元素弹簧填入腾出的位置）。Tags: cursor, drag, drop, ghost, handle, resize, reorder, snap, interaction</cursor-drag>
<multi-cursor-choreography path="rules/multi-cursor-choreography.md">N 个（2–4）带名字标签的独立光标角色同时在一块画布上工作 —— 协作画布的氛围。每个角色有确定性的路径点表（显式的 fromTo 分段 + 停歇），不同颜色的名字标签胶囊，抓起 / 放下 / 悬停动作以合唱强度排布在交错的节拍网格上（一次只有一个兑现点，按区域划分路径，没有碰撞）；镜头锁定 —— 任何平移都是画布组在平移。Tags: cursor, multi-cursor, collaboration, ensemble, canvas, name-tag, choreography, ambient</multi-cursor-choreography>
<control-target-sync path="rules/control-target-sync.md">实时同步的一对 —— 一个被拖动 / 输入 / 选择的控件和它绑定的目标在**同一**拍中变化：读数 tween + 目标 transform tween 共享同一个 timeline 标签、时长和 ease（连续拖动），或者用一个阈值状态数组同时承载两边（逐次按键 / 下拉选择的阶梯）。区别于 `reactive-displacement`（碰撞物理，一次性转场）。Tags: control, scrub, live-sync, mirror, panel, editor, readout, ui</control-target-sync>
<scale-swap-transition path="rules/scale-swap-transition.md">同一屏幕中心处两个 DOM 元素之间协调的变形。退场组缩小 + 淡出；入场元素以 `back.out(2)` 过冲弹入。Tags: transition, morph, scale, swap</scale-swap-transition>
<card-morph-anchor path="rules/card-morph-anchor.md">容器在两个镜头之间变形其视觉尺寸 + 圆角 + 表面处理，然后淡出，露出下面真正的目标。HyperFrames 用统一的 `scale` 代替被禁止的 `width`/`height` tween，外加只影响绘制的 `borderRadius`/`background`/`boxShadow`。Tags: morph, anchor, transition, border-radius, container, shape, handoff</card-morph-anchor>
<theme-crossfade-morph path="rules/theme-crossfade-morph.md">在固定锚点下就地变换整个主题 —— 背景、字体、圆角、图标、chrome 和 logo 同时（约 0.3 秒）在 N 套预先做好样式的皮肤之间混合，而一个锚点元素始终不动。堆叠的完整图层 + 只用不透明度的交叉淡变，锚点在最上层只渲染一次（或在每一层以完全相同的几何渲染）；镜头静止。如果只是单个容器 → `card-morph-anchor`。Tags: theme, skin, crossfade, morph, anchor, reskin, cycle, ui</theme-crossfade-morph>
<spring-pop-entrance path="rules/spring-pop-entrance.md">标准的**入场**弹出 —— 一个元素（或错开的一组）以弹簧方式 `scale: 0 → 1` 到达，带 `back.out` 过冲，用 `fromTo` 保证 seek 时 t=0 也正确。单个 hero、错开的一组（上限 ≤500ms），按性格调整过冲。区别于 `press-release-spring`（点击 / 按压反应）。Tags: spring, entrance, pop, scale-in, overshoot, stagger, arrival</spring-pop-entrance>
<motion-blur-streak path="rules/motion-blur-streak.md">在快速入场 / 镜头穿透推进上伪造方向性的速度模糊 —— 模糊在最大速度时达到峰值，落定时归 0。两条路径：在运动轴上用 SVG `feGaussianBlur` 的 stdDeviation（通过代理 tween），或者一条确定性的回声 / 幽灵拖尾，最后收拢进领头元素。只用于入场 / 镜头中段。针对沿烘焙轨迹移动的元素的逐帧驱动形式：按速度门控的、不含文字的轮廓幽灵（或者当需要真正的模糊观感时，用旋转 / 模糊 / 反向旋转的滤镜三明治），拖影轴向取轨迹增量的 `atan2`。Tags: motion-blur, streak, velocity, ghost, echo, fast, driven, tracked</motion-blur-streak>
<waterfall-entry path="rules/waterfall-entry.md">错开的**到达**级联 —— 词 / 元素从下方甩入，每一个都在前一个落定之前开始，形成一道加速的波，最后收束得整整齐齐。用于标题卡、段落开场、列表引入。通过 `tl.set` 做二值的 0→1 不透明度 —— 到达绝不用淡入。Tags: entrance, cascade, stagger, kinetic-text, title-card, arrival, waterfall</waterfall-entry>
<particle-burst path="rules/particle-burst.md">确定性的粒子 / 彩纸事件 —— 彩纸向上爆开再随重力飘落（可选瞬间缩小）、从文字后方爆出的圆点、字形溶解成粒子。固定的粒子池、按索引播种的发射参数、一个 `ease: "none"` 驱动器，其 onUpdate 把每个粒子作为时间的纯弹道函数来计算 —— 飞行中途拖动也安全，≤ 约 40 个粒子。Tags: particles, confetti, burst, dissolve, ballistic, deterministic, punctuation</particle-burst>
<nudge-curve path="rules/nudge-curve.md">慢-快-慢三阶段的整组滑动（power3.in 起势 → 线性爆发 → power4.out 收尾，距离分配 10/65/25，收尾 ≥ 起势的 3 倍），用来重新定位一个排好的组，并在爆发阶段揭示内容。Tags: slide, reposition, group-motion, nudge, slow-fast-slow</nudge-curve>
</rules>

## 效果配方（从 hyperframes-creative 移过来的）

<rules>
<gsap-effects path="rules/gsap-effects.md">即插即用的 GSAP timeline 模式 —— typewriter、音频可视化器，以及其他可复用的编排片段。Tags: gsap, recipe, drop-in, typewriter, audio-visualizer</gsap-effects>
<css-marker-patterns path="rules/css-marker-patterns.md">用纯 CSS + GSAP 实现的马克笔高亮绘制模式 —— highlight（黄色扫过）、circle（手绘椭圆）、burst（放射线）、scribble（混乱涂鸦）、sketchout（粗糙的矩形轮廓）。Tags: css, marker, highlight, text, emphasis</css-marker-patterns>
</rules>

## 另见

- `blueprints-index.md` —— 场景形态模板（本 skill 的「blueprints」），把这些规则组合成完整的镜头
- `techniques.md` —— 更广的动效设计技巧（SVG 路径绘制、Canvas 2D、CSS 3D、动态文字、可变字体、合成）；有几条规则引用了它
- `transitions/` —— 场景转场目录（共享 skill；由 story 决定 `transition_in`，由 harness 注入）
