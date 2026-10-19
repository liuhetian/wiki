<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/transcript-scroll-artifact-reveal.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# transcript-scroll-artifact-reveal —— 对话记录滚动 + 产物揭示

**intent / 意图**：画面沿着**一个**很长的内容表面纵向移动 —— 一段 agent 对话记录、一个持续运行的任务流、一份分析文档、一篇故事草稿 —— 它满版铺在平面画布上（没有设备边框，没有停留展示的样机），靠镜头平移或元素滚动来推进；穿行本身就是故事（「看看做了多少工作 / 这里有多少东西」），直到**一个**焦点交互 —— 点击文件 chip、高亮一段引文、展开一个可折叠行 —— 把镜头转向产物 / 细节揭示：工作背后的交付物。

**roles served / 服务的角色**

- Key_Feature（模式：`pan-to-workspace` · `feed-rush` · `document-to-artifact` · `selection-pivot`）：X 上爆款 AI 产品视频的语法，用来讲「agent 做了大量工作 → 这是交付物」。长表面是**证据**（工具胶囊、勾选的进度项、任务行、标题、可比公司数据表、故事段落），以穿行的速度阅读；产物是**兑现**（带实时样机的完整工作区、单元格高亮的表格、行内提问面板、子任务堆栈）。当这项功能的证明在于生成工作的量 / 深度，而这一拍要在一次交互上把它兑现时，就选它 —— 而不是停留展示设备的导览（`device-surface-showcase`），也不是光标追着走的工作流（`cursor-ui-demo`）。

**duration / 时长**：5–11.8 秒（feed-rush 5.4 秒 · pan-to-workspace 5.0 秒 · selection-pivot 9.3 秒 · document-to-artifact 11.75 秒）

**shot structure / 镜头结构**：一个 `[long content surface: agent chat transcript / task feed / analysis document / story doc]` 满版铺在 `[flat light canvas]` 上（golden 样本：暖米白 / 奶油色 / 米色 / 纯白 —— 表面自己的背景**就是**场景背景）；深色文字配小面积的 `[accent]` 标记（绿色动词高亮、模型标签胶囊、勾选圆圈、黄色单元格）。三幕：穿行（TRAVERSE）→ 转折（HINGE）→ 产物（ARTIFACT）。镜头纪律是招牌：整个镜头最多**两次**真正的镜头移动，夹在转折点两侧；其余全部是静止画面上的元素运动。

- **Scene 1（0.0–约运行时长的 40–60%）—— 建立 + 纵向穿行（证据）。** 表面以一个小开场建立起来 —— 一个 `[title]` 打字出现 / 一个居中的 `[title]` 缩小约 50% 并滑到左上角停靠成固定标题栏 / 画面一开场就紧紧框在 `[chat panel]` 上 —— 然后穿行开始：画面沿内容**向下**移动（或内容向上流过画面），按阅读顺序揭示逐步推进的工作：`[prompt → tool pills → checked progress items → typed summary]`、`[tagged task rows → muted tasks → checklist block]`、`[heading → paragraph → comps table → bullets]`、`[title → story paragraphs → dialogue]`。新行可能先级联进来（错开到达），然后滚动再接手；一行正在打字的内容可能在移动的画面下打完。穿行的质感因成员而异：一次连续的缓慢平移、一次快速连续的信息流冲刷、在每个停靠点减速的分段滚动（停靠点之间有速度模糊，内容在画面边缘淡出），或者一次平滑滚动缓动到停止。
- **Scene 2（约 1–2 秒）—— 转折点：一个焦点交互。** 穿行落定，单次交互让镜头转向：一个 `[file-attachment chip]` 在一行打出来的交接句下方弹簧弹入，光标滑进来并**点击**它；一个 `[sentence/quote]` 得到一次选中高亮扫过，一个 `[tooltip pill]` 在它上方弹簧弹出等待点击；一个 `[collapsible row]` 到达画面中心并**展开**；或者打出来的 `[verifier summary]` 完成，作为隐式触发。这是整个镜头里唯一的交互 —— 光标（如果有）在这里第一次出现。
- **Scene 3（其余时间）—— 产物揭示 + 停留。** 转折兑现，选择**一种**揭示机制：一次快速、平滑**减速**的**拉远**重新框出整个 `[workspace]`（刚刚穿行过的面板变成一个侧栏，旁边是 `[live mockup]` 和 `[tool panel]`）；一个 `[artifact window: spreadsheet]` 从小尺寸放大到接近满画面，然后一次缓慢推近 + 横向平移落在它的 `[highlighted cells]` 上；一个 `[inline panel]` 在高亮的那行下方展开，一个 `[follow-up question]` 打进去；或者那一行展开成一个 `[sub-task stack]`，滚动落定在 `[narration text]` 上。可选尾声：一次光标点击瞬间替换揭示出的产物里的某个 `[screen]`（例如点击手机上的标签页）。画面锁定；直到结束都只有元素运动。

- 变体 —— _pan-to-workspace_（001_claudeai，5.0 秒）：穿行是**真正的**镜头平移 —— 一开场紧紧框在聊天面板上，一次不间断的向下滑行（绝不切走）经过胶囊 → 勾选列表 → 正在打字的 verifier 摘要；转折点是摘要打完；揭示是**一次**快速减速的拉远，到三分区的工作区（聊天面板变侧栏 / 手机样机 / 调整面板）；尾声的光标点击瞬间替换手机屏幕。总共恰好两次镜头移动。
- 变体 —— _feed-rush_（010_perplexity A，5.4 秒）：完全**没有**镜头运动 —— 标题停靠成标题栏，五个带标签的行级联进来，然后一次快速连续的向上**元素**滚动冲过灰掉的任务和一个清单，到达一个可折叠行；转折点就是这一行本身；揭示是这一行展开成一个六项的子任务堆栈，落定在旁白文字上。没有光标。
- 变体 —— _document-to-artifact_（010_perplexity B，11.75 秒）：穿行是分段的**元素**滚动（画面静止）—— 文档快速一段一段向上爬，在每个停靠点减速，停靠点之间模糊 / 淡出，最后清空成空白画布；转折点是一行打出来的交接句 + 文件 chip 弹出 + 光标点击；揭示是表格窗口放大，然后一次缓慢连续的推近 + 向右平移，落到黄色高亮的预测列上。
- 变体 —— _selection-pivot_（014_OpenAI，9.3 秒）：打字出现的标题 → 文档构建（气泡提示 + 打出来的标题 + 逐步填充的段落）→ 一次平滑的向上元素滚动缓动到停止；转折点是选中高亮扫过 + 整个镜头**唯一**一次推近框住这句话 + 点击 tooltip 胶囊；揭示是行内面板在这行下方展开，带着被引用的句子和一个快速打出来的追问。镜头锁定在推近后的缩放比例上，直到结束。

**motion vocabulary / 动作词汇**：连续缓慢的向下镜头平移；快速连续的向上信息流滚动；在每个停靠点减速的分段文档滚动；平滑滚动缓动到停止；滚动停靠点之间的速度模糊；内容在画面边缘淡出；居中标题缩小约 50% 并滑到左上角停靠成标题栏；任务行错开级联进入；打字出现的行 / 标题 / 追问（带插入符）；绿色的句首动词高亮和模型标签胶囊随之滑过；勾选项的删除线随之滑过；文件附件 chip 弹簧弹入；tooltip 胶囊弹簧弹出；聊天气泡到达；光标滑入 + 点击；选中高亮扫过一句话；**一次**镜头推近到选区上；快速减速的拉远，到完整工作区；产物窗口从小尺寸放大；缓慢推近 + 横向平移落在高亮单元格上；可折叠行展开成子任务堆栈；行内面板在这行下方展开；尾声点击标签页时手机屏幕瞬间替换；画面锁定停留。

**rule mapping / 规则映射**

- 用**元素**滚动做纵向穿行 —— 快速信息流冲刷 / 分段文档滚动 / 平滑滚动到停止 → `3d-page-scroll`（平面变体：倾斜 ≈ 0 —— 表面的内容用 `translateY` 滚动到各个区块；多阶段滚动变体覆盖分段停靠；所有分段保持**同一个** ease 家族 —— 用 `power3.out`/`power4.out` 获得 UI 滚动的手感）
- 用**镜头**平移做纵向穿行（对话记录滑行）→ `viewport-change`（平移模式 —— 世界在静止画面下向上平移；一个连续的 tween，不切）
- 分段滚动停靠点之间的速度模糊 → `motion-blur-streak`（模糊在最大滚动速度时达到峰值，每次落定时归 0）
- 每个穿行节拍揭示哪些内容（逐站编排）→ `dynamic-content-sequencing`
- 居中标题缩小并滑到停靠位，成为固定标题栏 → `gsap-effects`（一个同时做缩放 + 平移的 tween；普通的双属性移动，不需要具名规则）
- 滚动接手之前任务行错开级联进入 → `waterfall-entry`（到达级联；golden 样本用的是淡入 + 上滑 —— 而本库规则规定的是二值不透明度的甩入，采用本库的形式），或者对卡片状的行用 `spring-pop-entrance`（错开的一组）
- 打字出现的行 —— verifier 摘要、交接句、文档标题、追问、开场标题 → `discrete-text-sequence`（+ 用 `context-sensitive-cursor` 做尾随的插入符）
- 文件附件 chip 弹入 / tooltip 胶囊弹出 / 聊天气泡到达 → `spring-pop-entrance`
- 光标滑入、落下、点击（转折点和尾声）→ `cursor-click-ripple`（+ 用 `physics-press-reaction` 让光标和目标在按下时一起压缩）
- 选中高亮扫过整句话 → `css-marker-patterns`（高亮扫过）
- **一次**推近到高亮选区 / 缓慢推近 + 横向平移落在高亮单元格上 → `coordinate-target-zoom`（测量出的偏离中心的目标 —— 横向平移**就是**其中的反向平移分量），当它跟在窗口放大之后时，放在 `multi-phase-camera` 之下编排
- 快速减速**拉远**到完整工作区 → `coordinate-target-zoom`（拉远变体：从放大的构图开场，用 `power3.out`/`power4.out` 拉回到缩放 1）或 `viewport-change`（对 `cam` 对象做一次连续的拉回）
- 点击后产物窗口从小尺寸放大到接近满画面 → `spring-pop-entrance`（hero 到达式放大；把过冲调到约 0 / 用 `power3.out`，让窗口读起来有分量，而不是弹跳）
- 可折叠行展开成子任务堆栈 / 行内面板在高亮行下方展开 → `anchored-layout-expand`（文档流内的手风琴式生长，把后续内容往**下**推 —— 绝不对 width/height 做 tween）+ 对到达的子元素用 `waterfall-entry`（或 `spring-pop-entrance` 错开）
- 尾声点击标签页时手机屏幕瞬间替换 → `discrete-text-sequence`（离散的整体状态替换；瞬间完成，产物内部没有镜头移动）
- 绿色动词高亮、模型标签胶囊、勾选圆圈删除线、黄色预测单元格、边缘淡出遮罩 → 表面内容的静态样式 —— 不需要运动规则

**camera modifier / 镜头修饰**：这个 blueprint 的镜头法则：**最多两次真正的镜头移动，夹在转折点两侧** —— golden 样本在这一点上态度鲜明（它们的 brief 里带着 CRITICAL 级别的镜头注释）。先选穿行机制：镜头平移（`viewport-change` 平移 —— 仅 pan-to-workspace）**或者**元素滚动（`3d-page-scroll` 平面 —— 其余全部）；绝不同时用两者。然后由揭示用掉第二次（或唯一一次）移动：一次**拉远**到工作区，或一次**推近**到细节（`coordinate-target-zoom`，各阶段由 `multi-phase-camera` 编排），之后画面**锁定** —— 剩下的所有运动都是元素级的（打字、展开、屏幕替换）。feed-rush 变体一次镜头移动都不用：整个镜头就是元素滚动 + 展开。正是这种克制把这个形态和 `cursor-ui-demo`（镜头随每次交互伺服跟随）以及 `device-surface-showcase`（展示型镜头呈现一个停留展示的 hero）区分开。

**Overflow（滚动 / 平移的表面 —— 想让 `check` 干净通过就必须做）：** 穿行会刻意把内容移出画面边缘。在场景上做裁切（`overflow: hidden`），**并且**给移动的内层（承载对话记录 / 信息流 / 文档的 `.page-content` / `.world` 包裹层）加上 `data-layout-allow-overflow` —— 否则 `check` 会对每一个滚出画面的行报 `text_box_overflow` / `container_overflow`。裁切负责视觉上的处理；这个属性告诉布局审计这是有意为之。
