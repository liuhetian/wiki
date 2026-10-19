<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/device-surface-showcase.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# device-surface-showcase — 设备 / 界面展示

**intent**（意图）：一个产品界面 —— 一个设备 mockup 或一个浮动的浏览器 / 应用窗口 —— 作为 hero 留在画面里，它的屏幕走过一个真实的流程，由一次镜头运动来展示，镜头运动的范围从静止保持到连续的 3D 推进。

**roles served**（适用角色）

- Key_Feature（来自 key-feature-device-screen-tour、key-feature-floating-window-scroll、key-feature-3d-device-hand-demo）：展示一个功能\_在它真实的界面里被体验\* —— 界面容纳着动作，它的屏幕沿着一个流程推进，而不是罗列一堆方块，也不是追着光标走完一个工作流。（注：三份奠基草稿都是 Key_Feature，各变体按机制（MECHANIC）区分，而不是按角色；挖掘出的 stepwise-flow 变体把本 blueprint 拓宽到了 Product_Intro。）
- Key_Feature（来自 demo-page-scroll-spotlight）：把浮动窗口推进滚动变体推到一个聚光高潮 —— 一个真实网页渲染成倾斜的 3D 卡片滑行进场（power2，像举起一部手机 —— 没有弹簧），旁白念到页头关键词时它们以卡拉 OK 式辉光亮起，页面滚动到被演示的区块，一个元素在径向聚光下从表面抬起（translateZ + scale），聚光同时压暗其余部分。
- Product_Intro（来自 stepwise-flow-completion）：一个紧凑的端到端产品流程 —— 设置 / 认证 → 操作 → 成功 / 确认 —— 在保持住的界面里以一个个连续的屏幕状态无光标地演完，最后以一次确认按钮按下收尾；首尾各有标题卡段落节拍。界面通过\_完成它的核心循环\*来介绍产品，而不是靠巡览屏幕。
- Key_Feature（来自 `showcase-carousel`）：showcase-carousel —— 两个界面依次出现（一张轮换品牌皮肤的 widget 卡片，一个有应用屏幕滑过的手机框），中间用插段的主张词隔开；屏幕轮换是一个展示广度的轮播（「N 个品牌 / N 个应用」），而不是一个流程。

**duration**（时长）：5–11.3s（page-scroll-spotlight 5–9s · floating-window 7.8s · 3d-hand 7.9s · 设备内审批 7.9s · stepwise-flow 8.5–9.4s · device-tour 9.6s · showcase-carousel 11.3s）

**shot structure**（镜头结构）一个产品界面 —— 一个 `[device mockup]` 或一个 `[floating browser/app window]` —— 是 `[styled backdrop: gradient / radial / stylized 3D void]` 上始终在场的 hero；它的 `[screens/sections]` 走过一个真实的 `[product flow]`，同时一个展示镜头（静止保持、推进→拉远，或一次连续推进）把它呈现出来。每个屏幕状态停留约 1.0–1.5s。

- Scene 1 (0.0–~1.5s)：界面立住 —— 它 `[slides in from an edge / drifts in from a tilt / dissolves from a full-frame title card]` 并落定，一个 `[accent shape or backdrop]` 在它背后成形；第一个 `[screen]` 可见。展示镜头开始运动（见各变体）。
- Scene 2 (~1.5–~Xs)：界面在它自己的表面上被操作 —— 一次 `[tap/select/scroll]` 触发第一次屏幕推进：旧内容 `[pushes out / scrolls up]`，新的 `[screen/section]` `[pulls up / pushes in from the side]`；与此同时一个 `[label / header word / side headline]` 更新。镜头继续它的运动。
- Scene 3+ (~Xs–end，重复 `[2–4 screen beats]`)：界面推进过一个个连续的 `[screens/sections]`，每一次都是与界面流程同步的离散替换或滚动，同时辅助文案 `[swaps out-up / in-up]`，或保持标记以守住阅读位置。在最后一个 `[screen]` 上定住（或者，有一个变体会绽光而出 —— 见该变体）。

- 变体 —— static-tour（key-feature-device-screen-tour，9.6s）：一个 `[device mockup]` 从画外滑入并落定（ease-out）；一个 `[accent-color shape]` 在它背后放大（弹簧过冲）。镜头在整个 clip 里保持静止 —— 所有运动都在元素 / UI 层面：一次点按让按钮压缩（95%→100%），UI 滚动 / 过渡到下一个视图（旧的推出，新的拉上来），每个屏幕对应设备旁的一个 `[side headline]` 替换（旧的上滑 + 淡出，新的上滑 + 进入）。在最后一个屏幕上定住。无镜头运动，无光标。
- 变体 —— floating-window（key-feature-floating-window-scroll，7.8s）：以一张全画幅 `[title card]` 开场（一个小 `[icon]` 在中央描画出来，下方是 `[feature name]`；保持约 2s），然后溶解成一个浮在 `[vivid gradient]` 上的 `[macOS-style browser/app window]`（红绿灯按钮 + `[URL pill]` + 标签页；左侧导航、中央内容、右侧 `[sidebar]`）。镜头推进到一个 `[target region/sidebar]` 上（激活项以 `[accent]` 高亮，一个光标顺着列表往下漂），然后拉远重新框住整个窗口，同时内容滚动过各个 `[sections]`；`[highlighted item]` 保持标记。一条推进→拉远的弧线，前面由标题卡开场把关。
- 变体 —— 3d-hand（key-feature-3d-device-hand-demo，7.9s）：完全 3D —— 一台 `[3D device]` 在 `[stylized 3D void / bloom + particles]` 里漂移，开场时是倾斜的，随着一（ONE）次连续的（CONTINUOUS）向前镜头推进开始（没有切），它自转到几乎正对镜头。一只光泽的 `[3D hand]` 从底部前景升起，用手势驱动界面：它滑动以滚动一个由 `[option cards]` 组成的 `[picker/sidebar panel]`，并点按 `[option]`（同时一个 `[header word]` 原地逐字母翻转）；选择生效 —— 一个 `[new layout]` 从中心长出、填满设备屏幕，导航翻转，一条 `[marquee]` 水平滚动；手再次滑动，让页面向上滚过各个 `[sections]`，然后漂出画面。镜头从不停止推进；明亮的设备屏幕不断朝镜头放大，直到它绽放成一片 `[light]` 光幕 —— 一个填满画面的穿越式缩放「传送门」退场。
- 变体 —— stepwise-flow（Product_Intro，8.5–9.4s；设备内的 Key_Feature 子模式 7.9s）：无光标的端到端流程 —— 界面以叙事弧线的方式完成 `[setup/auth → action → success]`。以一张在氛围渐变上淡入 / 淡出的 `[title card]` 开场（或者在终端区域里逐字符运行一条键入的 `[command]`）。`[flow surface]` 到场（手机 mockup 以超大尺寸上滑并落定 / 带边框的日志面板替换掉命令），第 1 步通过快速的连续弹出完成 —— `[OTP digits]` 从左到右填进各个格子，最后以一个绿色对勾收尾，或者 `[log steps]` 自上而下弹出、带高亮 token，最后停在一个末尾带省略点的等待状态。状态横向推进（旧内容向左滑出，新内容从右滑入，外框保持不动），或者通过一次由暗到亮的场景替换进入一张白色的 `[detail/confirm card]`，卡片上的元素错落进入。提交（COMMIT）：按下 `[CTA button]`（按压下沉 / 转圈的「Processing」），一个带对勾列表的 `[success state]` 渲染出来 —— 在设备内子模式里，提交会走一套生物识别仪式：暗色遮罩，`[squircle]` 弹簧弹出，一个圆环围绕图标描画，图标变形成对勾并保持；只在（ONLY）状态切换时触发一次轻微的镜头推进（镜头为提交打个标点，然后重新锁定）。退场（EXIT）：界面离开，收尾的 `[title cards]` 弹入并缓和地缩小 —— 界面在尾声之前退场，而不是一直保持。除此之外镜头静止。对这个变体来说，始终在场的 hero 是流程（FLOW），而不是某一个界面：一个终端面板可以整体交接给一张确认卡片。
- 变体 —— showcase-carousel（Key_Feature，11.3s）：两（TWO）个界面依次出现在一片缓慢漂移的 `[pastel mesh gradient]` 上，镜头静止，中间用居中的插段 `[claim words]` 隔开（带轻微放大淡入，再淡出）。第一幕：一张白色 `[widget card]` 缩放进入，翻转 / 变形成一个倾斜的竖版 widget，并轮换（CYCLES）`[N brand skins]`（每个约 0.8s）—— 共用一个布局，每个皮肤替换内容和强调色 —— 同时下方一个大的 `[brand logo]` 随每次翻转交叉淡化；widget 缩小离开。第二幕：一个 `[phone frame]` 以超大尺寸、倾斜着进入，在中央立正落定；完整的 `[app screens]` 从它里面向左滑过（每个约 1s），停在最后一个上。屏幕轮换是一个展示广度的轮播，而不是一个流程 —— 没有点按，没有光标，没有镜头运动。

**motion vocabulary**（运动词汇）界面立住（从边缘滑入 + 落定 / 从倾斜状态漂入 + 自转对准镜头 / 标题卡溶解）；界面背后的强调色形状弹簧动画；元素级的屏幕轮换（滚动替换、从侧面推入、缩放替换）；按钮点按压缩；错落的侧边标题揭示 + 文案替换（上出 / 上入）；页头词原地逐字母翻转；渐变上浮动浏览器窗口的闲置漂浮；全画幅标题卡开场（图标描画 + 标签）；镜头推进到某个区域；镜头拉远重新构图；内容滚动浏览；一次连续的 3D 镜头跟随推进（无切）；3D 设备漂移 + 自转；风格化环境的绽光 / 粒子；3D 手入场 + 滑动滚动 + 点按（手势驱动）；选择器面板滑入；模板应用后从中心长出；水平 marquee 滚动；手势驱动的页面滚动；穿越式缩放的绽光 / 传送门退场；静止保持（无镜头）作为镜头范围的下限。stepwise-flow 追加：标题卡首尾呼应（淡入 / 淡出开场；收尾卡弹入后缓和缩小）；带提示符尖括号的终端命令键入；自上而下连续弹出的日志，带子行揭示；带动画的末尾省略点等待状态；数字从左到右依次弹出 + 绿色对勾确认；外框不动的横向屏幕滑动；由暗到亮的场景替换；卡片元素错落搭建进入（淡入 + 上滑）；按钮按压下沉 + 填充翻转；转圈的处理中状态；成功对勾列表揭示；通知横幅带过冲弹簧进入；卡片扩展填满设备屏幕时锁屏淡出 / 模糊消散；与提交同步的微推进；暗色遮罩；squircle 弹簧弹出；圆环描画；图标变形成对勾；界面在标题尾声之前退场。showcase-carousel 追加：插段主张词隔断；品牌皮肤轮换，每次翻转伴随 logo 交叉淡化；卡片翻转 / 变形成倾斜的 widget；超大倾斜的界面进场后立正落定；静止画面内快速向左滑动的屏幕轮播；漂移的 mesh 渐变背景。

**rule mapping**（规则映射）（逐个运动动词 → 支撑规则，或标记为特例）

- 屏幕轮换 —— 界面内部的 UI 滚动 / 区块滚动（device-tour、floating-window 滚动、3d-hand 页面滚动）→ `3d-page-scroll`（网页 / 应用作为一张倾斜卡片，其内容 `translateY` 滚动到各区块；界面屏幕流程的主要机制）
- 浮动窗口立住 + 界面以倾斜 / 浮动的 UI 卡片呈现 → `3d-page-scroll`（倾斜 / 透视构图）+ `css-3d-transforms`（透视 / `translateZ` 纵深）
- 屏幕 / 侧边文案的状态替换（离散的屏幕状态；侧边标题内容每拍替换）→ `discrete-text-sequence`
- 侧边标题揭示（错落淡入 + 上滑）→ `discrete-text-sequence`
- 页头词原地逐字母翻转（3d-hand）→ `hacker-flip-3d`
- 两个屏幕状态之间以协调的缩小退出 / 弹出进入完成的屏幕替换 → `scale-swap-transition`
- 模板应用「新布局从中心长出、填满屏幕」（3d-hand）→ `center-outward-expansion`（聚在中心 → 扩展填满）
- 界面在状态之间变形 / 标题卡→窗口溶解，作为视线锚点的转场 → `card-morph-anchor`
- 按钮点按压缩（95%→100% 的按压反馈）→ `press-release-spring`（较重的按压用 `physics-press-reaction`）
- floating-window 中光标点击高亮的列表项 → `cursor-click-ripple`
- 激活的侧栏 / 列表项上的强调色高亮弹出 → `asr-keyword-glow`（聚焦项上的强调色辉光）
- 光标顺着侧栏列表往下漂（floating-window）→ `camera-cursor-tracking`（平面光标漂移；与推进配对）
- 浮动浏览器窗口的闲置漂浮 / 3D 设备的漂移呼吸 → `sine-wave-loop`
- 3D 设备漂移 + 自转对准镜头 + 透视纵深（3d-hand）→ `css-3d-transforms`（CSS-3D）**或** `3d.md` 技法（真正的 Three.js/R3F 设备）；见镜头修饰
- 水平 `[marquee]` 滚动（3d-hand）→ `viewport-change`（作用在 marquee 条上的 PAN 模式）—— _匹配度很弱；一个字面意义上的 CSS marquee / translateX 循环，更接近一个 `gsap-effects` / CSS 配方，而不是一条有名字的运动规则_
- 3D 手入场 + 滑动 + 点按作为交互驱动者（负责滚动 / 选择的手势输入）→ **标记为特例 —— 需要超出规则库的更重型能力（R3F/Three.js + WebGL），而不是一条运动形态规则。** 3D 手模型 + WebGL 绽光有*技法*层面的支撑（`3d.md` —— R3F、`useGLTF` HandModel，shader / 绽光用 `--gl=swiftshader`），但没有哪条运动形态规则把 3D 手建模成「滑动即滚动 / 点按即选择」的手势协议。`context-sensitive-cursor` / `camera-cursor-tracking` 只建模平面的打字 / 指针光标，不建模做手势的 3D 手。
- 穿越式缩放的绽光 / 传送门退场（3d-hand）→ **标记为特例 —— 需要超出规则库的更重型能力（WebGL），而不是一条有名字的转场规则。** 能力在 `techniques.md` → WebGL shader（通过 `3d.md` 的无头 WebGL：`--gl=swiftshader --concurrency=1`），但没有哪条有名字的转场规则涵盖绽光 / 传送门式穿越。
- 键入的终端命令 / 非线性的日志文字（stepwise-flow）→ `discrete-text-sequence`（打字 + 阈值式状态替换），并用 `dynamic-content-sequencing` 按内容长度计算每一步的时间窗口
- 自上而下连续弹出的日志 / OTP 数字从左到右弹出 / 确认卡片错落搭建进入 → `spring-pop-entrance`（错落的分组形态；日志行用低过冲）
- 末尾省略点等待状态 → `sine-wave-loop`（有限次重复；让 3 个点的不透明度按共享相位步进）
- 外框不动的横向屏幕滑动 → 沿用已有的屏幕轮换映射（在被裁切的界面内用 `3d-page-scroll` 的 translateX 形态）；外框放在滑动层之外
- 通知横幅弹簧进入 / squircle 弹出（设备内）→ `spring-pop-entrance`
- 锁屏淡出 / 模糊消散 + 卡片扩展填满设备屏幕 → `card-morph-anchor`（等比缩放的容器变形 —— 绝不 tween width/height）+ `depth-of-field-blur`（模糊消散）
- 与提交同步的微推进（镜头为 Approve / 点按打个标点，然后重新锁定）→ `multi-phase-camera`（在状态切换处放一个短促的推进阶段）
- 按钮按压下沉 + 填充翻转 / Approve 按下后弹回 → `press-release-spring`（已映射；填充翻转是它的颜色过渡变化形式）
- 转圈的处理中状态 → `svg-icon-enrichment`（带显式 SVG 中心点的旋转内部元素）
- 成功对勾列表 / 生物识别圆环描画 → `svg-path-draw`（对勾笔画；圆环旋转 −90°，从 12 点钟方向开始），列表项的弹出用 `spring-pop-entrance`
- 图标变形成对勾（生物识别仪式）→ **标记为特例 —— SVG 路径变形，见 hyperframes-keyframes（morph）**；没有运动形态规则建模它 —— 机制在 `techniques.md` / keyframes skill 里，和本 blueprint 已有的 WebGL 特例属于同一层级
- 插段主张词隔断（淡入 + 轻微放大，然后退出）→ `gsap-effects`（单纯的淡入 / 缩放和弦；刻意比 `kinetic-beat-slam` 更安静）
- 品牌皮肤轮换，每次翻转伴随 logo 交叉淡化 → `discrete-text-sequence`（在阈值处整体替换状态内容）+ 翻转读起来像缩小退出 / 弹出进入时用 `scale-swap-transition`；卡片→倾斜 widget 的翻转 / 变形 → `card-morph-anchor` + `css-3d-transforms`
- 漂移的 mesh 渐变背景 → `sine-wave-loop`（渐变色块上振幅极低的位置 / 色相漂移）

**camera modifier**（镜头修饰）：展示镜头覆盖一个按变体区分的范围，全部建立在同一个包裹内容的虚拟镜头（`viewport-change`）上：

- static-tour → 无（NO）镜头运动（`viewport-change` 保持在 scale 1，或者干脆省略）；所有运动都在元素层面。这是范围的下限，也是 device-tour 与其余变体的区别所在。
- floating-window → 两阶段的推进 → 拉远弧线 → `multi-phase-camera`（例如 dramatic-reveal 1.1→1.0→0.95 的感觉）：通过 `coordinate-target-zoom` 推进到 `[sidebar/region]` 上（偏离中心的目标 = 缩放 + 反向平移），然后 `multi-phase-camera` 拉远，在内容滚动的同时重新框住整个窗口。
- 3d-hand → 一（ONE）次连续的向前推进（无切）→ steady-push 模式的 `multi-phase-camera`（1.0→1.03→1.06……外加它的正弦微漂移），叠在 `css-3d-transforms` / `3d.md` 之上，让设备在推进过程中自转对准镜头；推进一路不断地进入绽光 / 传送门退场（退场本身就是上面那个标记为特例的 WebGL shader）。三个变体通用：`viewport-change` 是基础的虚拟镜头原语；`multi-phase-camera` 编排推进 / 缩放阶段（并提供始终开启的微漂移，让即使「静止」的巡览也不显得死板）；`coordinate-target-zoom` 把推进瞄准偏离中心的屏幕细节。

**Overflow 处理（摇移 / 滚动类界面 —— 要让 `check` 干净通过必须这样做）：** 被摇移或滚动的界面会刻意把内容移出它的框卡边缘。在卡片处裁切它（在卡片 / 窗口上设 `overflow: hidden`），并且（AND）给移动的内层（装着截图 + 任何标记 / 标签的 `.world` / 界面 wrapper）加上 `data-layout-allow-overflow` —— 否则 `check` 会对滚出去的部分报 `text_box_overflow` / `container_overflow` 错误（例如一个被摇出左边缘的标记标签）。卡片在视觉上裁掉它们；这个属性告诉布局审计这是有意为之，不是布局 bug。
