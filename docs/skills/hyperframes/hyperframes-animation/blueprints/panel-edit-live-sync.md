# panel-edit-live-sync —— 面板编辑，实时同步

**intent**（意图）：一个二分式舞台 —— 一个检查器/编辑器**面板与一个目标界面绑定** —— 光标（或文字插入符）持续操作一个控件（数值拖动、单位/代码生成下拉菜单的选择、旋钮或 easing 手柄拖拽、行内重新输入），与之耦合的界面**实时、在同一拍里**更新：数值被拖动时页面按钮跟着旋转，预览图标随每一次按键改变尺寸，十六进制读数映出每一次悬停，代码块在选中的那一刻完成转换。运动本身就是因果 —— 一个手势，两个界面在同一帧里变化。摄像机的职责是让这一对同框可见，而不是追逐。

**provenance**（来源）（从 4 个产品中挖掘出的 7 个 Key_Feature golden 样本，两种方言都有 —— 三种同步模式）：

- *write-sync（写同步：控件 → 目标）* —— 锚点模式：一个可视化编辑器面板拖动 rotation/margin/padding 的数值，与此同时实时页面上的按钮在同一拍里旋转、移位（外加单位和字重下拉菜单的选择）；在一个发光的代码标注框里行内重新输入 `className`，预览图标随每一次按键改变尺寸（插入符充当演员，推近/拉回的往返必须让两个界面都留在画面里）；一个动效编辑器沿一条点状运动路径拖动一个旋钮，并把 easing 手柄弯成一条 S 曲线，最后以一次大幅拉远作为回报，画面里做好的开关表演出被编辑过的 ease（延后的回报）。
- *read-sync（读同步：目标 → 面板镜像）*：点击页面按钮弹出一个工具栏 → 「Copy code」→ 代码编辑器在一次连续的缓慢拉远中被该元素的 CSS 填满；悬停在色板色块上时，页脚的十六进制读数实时更新，同时网格在滚动。
- *self-conversion（自转换：面板既是控件也是目标）*：在一个 3D 倾斜的间距面板里，单位下拉菜单的转换把数值原地瞬间换算（rem→px→%，`0,375 rem` → `6 px` → `4,871 %`）；一个代码生成下拉菜单选中 SwiftUI，CSS 代码块在一次快速推近中交叉淡化成 SwiftUI。

> **集中度提醒**：7 个成员中有 4 个来自同一支视频（CSS Scan Pro 2.0）。这个耦合引擎另外被 3 个产品独立印证，横跨另外 3 支视频和两种方言（Figma Dev Mode、Figma 动效编辑器、bolt.new），每个用的都是不同的界面组合 —— 页面 + 检查器、画布 + 时间线 + easing 面板、IDE 代码 + 应用预览 —— 所以这个形状是真实存在的，而不是某一部片子的自家风格。真正属于 CSS-Scan-Pro 自家风格的部分（下文标为可选）：深石板灰的能力标题卡前奏、带白色描边的超大黑色光标、绿色成功对勾翻转、闪现的 tooltip。触发条件取决于产品：当功能本身就是实时编辑/检查时，才选用这个形状。

**roles served**（服务的角色）

- Key_Feature（来自 `panel-edit-live-sync`，全部 7 个案例）：一项能力，通过对单个被绑定元素的 2–4 个编辑拍来演示 —— 每一拍都是一次连续操作，耦合的界面实时作出回应；收束于停住的最后一次编辑、一次拉远到成品正在表演这次编辑，或者一个标注落在结果上。这里并入了三种子形状：
  - **(A) write-sync** —— 光标/插入符编辑一个控件；目标实时变换（旋转/移位/拉伸/改变尺寸/重新播放动画）。
  - **(B) read-sync** —— 光标选中/悬停目标；面板读数实时映出（CSS 流式进入，十六进制页脚更新）。
  - **(C) self-conversion** —— 编辑变换的是面板自己的读数（单位瞬间换算，CSS 交叉淡化成 SwiftUI）。

**duration**（时长）：5.3–11.9s（read-sync 悬停演示最短，约 5.3s；多拍的拖动/编辑段为 8.7–11.9s）

**shot structure**（镜头结构）（一个 `[target surface — webpage / design canvas / IDE + live preview]` 与一个 `[bound panel — floating inspector / docked code panel / timeline + easing editor]` 共享画面；一个 `[cursor or caret]` 是演员；每一拍都把一个操作手势与耦合界面上一个同时发生的响应配成一对；选区框（selection chrome）声明哪个元素被绑定；摄像机从锁定到主动都有，但始终保住这一对）

- **Scene 0（可选，0.0–2.0s）—— 能力标题卡。** 纯深色的 `[slate/charcoal]` 卡片；一行白字点出这项能力（`"Edit CSS visually"`、`"Auto measurement units conversion"`、`"Check color palettes"`）—— 淡入/漂移进场，停留，然后硬切，或者一次快速的带运动模糊的拉远，让舞台落定。（偏 CSS-Scan-Pro 自家风格；071/017/080 直接冷开在舞台上，071 则改为在预览上方弹簧式弹出一个巨大的小写 `[verb word]`。）

- **Scene 1（约 1–3s）—— 这一对立住。** `[target surface]` 到场，`[bound panel]` 或停靠在旁、或以细微的 3D 倾斜浮着、或从一侧边缘滑入。选区框弹出，声明绑定关系：`[bounding box + corner handles / red dashed inspection guides / redline measurement chips popping sequentially / green class-name header]`。光标进场，滑向第一个控件。

- **Scene 2..N（每个约 2s）—— 编辑拍，手势 + 镜像在同一帧里（引擎）。** 每一拍都是一次连续操作和它的实时回答：
  - *变体 —— write-sync (A)*：光标点按并拖动一个数值字段（数值向上/向下计数：`0°→-10°`、`0→38 px`），同时目标 `[button/element]` 实时旋转/移位/拉伸；或者拖动一个 `[knob along a dotted motion path / easing handle bending the curve, coords readout updating]`；或者一个插入符在 `[glowing magnifier callout]` 里行内重新输入一个值（`1xl→4xl→2xl`），同时 `[preview elements]` 随每次按键改变尺寸。可以用一个闪现的 `[tooltip]` 点出这个手势的名字。
  - *变体 —— read-sync (B)*：光标点击/悬停目标元素 —— 一个 `[floating toolbar]` 在它上方弹簧式弹出，一次菜单选择触发（`Copy code` → 图标翻转成绿色对勾），`[code editor]` 被流式进入的 CSS 填满；或者被悬停的 `[swatches]` 出现描边，`[footer hex]` 随每次悬停即时更新，同时网格在滚动。
  - *变体 —— self-conversion (C)*：光标点击一个单位/代码生成 `[dropdown]` —— 它打开，各行带悬停高亮 + 对勾 —— 选中时读数原地瞬间换算（`rem→px`，数值重新计算），或者整个 `[code block]` 交叉淡化成新的语言，标题随之翻转（`Layout`→`HStack`）。
  - 每一拍的摄像机：锁定的全景，同时容纳两个界面；或者一次推近到正在动作的界面（面板滚动揭示出下一节）—— 但在 write-sync 编辑期间，手势和镜像始终同框可见（071 的法则：推近绝不能把预览裁出画面）。

- **Scene N（最后一拍 → 结尾）—— 编辑得到证明，停留。** 收束方式在这里分化：
  - *变体 —— 停住最后一次编辑*：最后一次选择落定（选中 `100 - Thin`，应用 `4,871 %`），状态就此停住 —— 绝不要结束在 tooltip 上、下拉菜单却还没打开。
  - *变体 —— 回报式拉远*：一次大幅拉远揭示出成品正在表演被编辑的参数 —— 开关在完整的手机样机里以新的 ease 滑动，彩纸飘落；或者拉回到与开场完全相同的全景取景，同时一个 `[terminal]` 追加一行 hmr 输出。
  - *变体 —— 标注落地*：一个大的 `[arrow callout]` 滑入，指向结果 / 导出菜单在光标下保持打开；画面细微地向外漂移。

**signature move**（招牌动作）：**实时同步的一对** —— 一个被拖动数值/被键入/被拖拽的控件，和与它绑定的界面同时变化、一起出现在画面里，每一个编辑拍都如此。

**motion vocabulary**（运动词汇）：点按拖动式的数值拖动，实时同步目标（旋转 / 移位 / 拉伸）；预览随每次按键实时改变尺寸；带退格 + 闪烁插入符的行内重新输入；数值瞬间换算；悬停时十六进制/读数实时镜像；带悬停高亮行 + 对勾的单位/代码生成下拉菜单，即时打开/关闭；字重/下拉菜单行的选择；沿带途经点的点状运动路径拖动旋钮；拖动 easing 手柄弯曲曲线（坐标读数随之更新）；播放头拖动；红线测量标签依次弹出；包围框 + 角点手柄；红色虚线检查参考线；浮动工具栏在选中元素上方弹簧式弹出；代码面板从一侧边缘滑入；面板内滚动到新的一节；色块网格滚动；语法高亮的代码流式进入/粘贴进入；代码交叉淡化（CSS→SwiftUI）并伴随标题翻转；代码 token 上方的发光放大镜标注；图标翻转成绿色成功对勾；点出手势名称的闪现 tooltip；带白色描边的超大黑色光标；抓手光标拖拽；深色标题卡前奏 + 硬切；快速带运动模糊的拉远落定；跨越整个演示镜头的一次连续缓慢拉远；缓动推近 → 停留 → 缓动拉回的往返；快速推近到面板/时间线/代码；浮动面板上细微的 3D 倾斜漂移/视差；大幅拉远到产品回报画面；结果元素以编辑后的 ease 重新播放动画；彩纸飘落；终端日志追加；大箭头标注滑入；静止停留。

**rule mapping**（规则映射）

- 光标滑向控件、按下、点击反馈 → `cursor-click-ripple`
- 光标在可拖动数值的字段 / 可拖拽手柄上方切换状态，指针↔抓手 → `context-sensitive-cursor`
- 拖动下的数值读数向上/向下计数 → `counting-dynamic-scale`
- **实时同步的一对本身**（控件手势在同一拍里驱动第二个元素的属性）→ `control-target-sync`（位于同一个 timeline 位置的并发 tween —— 读数 tween + 目标 transform tween 共用一个 label）
- 带退格、错字、停顿 / 按键阈值的行内重新输入 → `discrete-text-sequence`（+ `context-sensitive-cursor` 负责插入符闪烁）
- 预览随每次按键改变尺寸 → `discrete-text-sequence`（按键状态阈值）+ `control-target-sync`（耦合的缩放步进）
- 数值瞬间换算 / 十六进制读数替换 / 标题翻转（`Layout`→`HStack`）/ 状态文字 → `discrete-text-sequence`
- 语法高亮的代码流式进入/粘贴进入、终端日志追加 → `discrete-text-sequence`（批量追加明确在其范围之内）
- 下拉菜单/菜单弹开；浮动工具栏弹簧式弹出；tooltip 闪现；红线标签依次弹出（错开，≤500ms）→ `spring-pop-entrance`
- 下拉菜单行的悬停高亮逐行移动和选择的先后顺序 / 哪个编辑拍展示什么 → `dynamic-content-sequencing`
- 虚线检查参考线 / 选区描边绘制出来 → `svg-path-draw`；带途经点的点状运动路径 → `svg-path-draw`（路径的显示）
- 旋钮沿运动路径行进 → 路径跟随 —— 见 `hyperframes-keyframes`（paths）
- 拖动 easing 手柄弯曲曲线（SVG `d` 插值）→ SVG 路径 morph —— 见 `hyperframes-keyframes`（morph；`svg-path-draw` 只绘制描边，不能 morph 路径）；旁边的坐标读数 → `discrete-text-sequence`
- 代码 token 上方的发光放大镜标注（包括 UI token 的实时放大副本）→ 组合使用：`ambient-glow-bloom`（辉光）+ `spring-pop-entrance`（标注弹出）
- 代码面板从一侧边缘滑入 / 面板停靠 → `card-morph-anchor` / `scale-swap-transition`（沿用 cursor-ui-demo 中面板滑入的先例）
- 代码块 CSS→SwiftUI 交叉淡化；成功图标翻转成绿色对勾 → `scale-swap-transition`（同一锚点上的状态替换）
- 面板内滚动 / 色块网格滚动（带遮罩的内部平移）→ `gsap-effects`；在 3D 倾斜面板上 → `3d-page-scroll`（带内部滚动的倾斜平面）
- 浮动面板上细微的 3D 倾斜漂移/视差；停留期间持续的微漂移 → `multi-phase-camera`（微漂移阶段）
- 推近到面板/时间线/代码并落定 → `coordinate-target-zoom` + `multi-phase-camera`
- 缓动推近 → 停留 → 缓动拉回的往返（保持同框可见）→ `multi-phase-camera`（拉回 / 聚焦 / 推近的编排）
- 跨越整个演示镜头的一次连续缓慢拉远；大幅拉远到产品回报画面 → `viewport-change`（单一的 `.world` 复合 transform）
- 快速带运动模糊的拉远落定转场 → `motion-blur-streak` + `viewport-change`
- 结果元素以编辑后的 ease 重新播放动画（开关以新的 S 曲线滑动）→ `gsap-effects`（回报元素上的自定义 ease tween）
- 回报画面上的彩纸飘落 → `particle-burst`（确定性的彩纸）+ `sine-wave-loop`（有界漂移）
- 大箭头标注滑入 + 停留 → `gsap-effects`（单个滑动 tween）
- 深色标题卡前奏（能力那行字淡入/漂移进场，硬切出）→ 跨 blueprint：属于 `titlecard-reveal` 的地盘；漂移/淡入本身 → `gsap-effects` —— 作为这里的映射规则则是 EXIT-N/A
- 标题与演示之间的硬切；最后的静止停留 → EXIT-N/A（转场 registry / 不需要规则）

**camera modifier**（摄像机修饰）：这里的摄像机法则是 cursor-ui-demo 那种追逐的反面：它服务于**这一对的同框可见**。有三种得到印证的姿态 —— (1) 锁定（LOCKED）：整个演示固定取景，面板 + 目标都在画面里，所有运动都在元素层面（CSS_39.0、落定之后的 CSS_102.8）；(2) 一次连续运动（ONE CONTINUOUS MOVE）：一次跨越整个演示镜头的缓慢拉远（或漂移），编辑在其中陆续发生（CSS_10.9、CSS_63.5 的倾斜漂移）→ `viewport-change`；(3) 推近再返回（PUNCH-AND-RETURN）：缓动推近到正在动作的界面，在编辑期间紧凑地停留，再缓动拉回到与开场完全相同的取景（071_bolt、080_figma、017_figma）→ `multi-phase-camera` + `coordinate-target-zoom` —— 硬性约束是：在 write-sync 编辑期间，镜像界面绝不能被裁出画面。如果摄像机在逐个目标地追逐光标、每一拍都替换状态，那你处在的是 `cursor-ui-demo`，而不是这里。
