# Blueprint（经过验证的形状）

> blueprint 层的入口。读这个文件来为某一帧找到形状；读 `blueprints/<id>.md` 来实例化它。Step 4 的方法（复现 / 改编 / 组合，以及每帧要写什么）在 `visual-design.md` 里 —— 本文件是菜单 + 选择器。

**blueprint** 是一个与产品无关的、**带时间码的镜头模板** —— `Scene N (a–b s): …`，带有 `[slots]` 和一个有名字的**招牌动作（signature move）** —— 它是通过两轮挖掘，从 178 个优秀的产品发布片段中逆向提炼出来的（另有 13 个旧版 blueprint 被反向转写成同样的 brief 格式）。它编码了一个镜头的完整时长 —— 揭示节奏跟着念出的台词走，而不是在 t=0 一股脑倒出来 —— 所以从结构上实例化一个 blueprint，就能让内容持续到来而不是僵住。完整模板在 `blueprints/<id>.md` 里。**Step 4（视觉设计）为每一帧实例化一个 blueprint**（没有合适的就从运动词汇里组合）。

## 22 个 blueprint

<blueprints>
<blueprint id="kinetic-type-beats" roles="Hook, Problem, Product_Intro, Benefits, CTA, Brand_Outro" duration="3.0–12.9s">
平面、居中、粗体文字的镜头，**运动本身就是文字的变化** —— 一行固定的句子通过硬切原地替换其中的词，或者一句陈述跨越多个全屏段落节拍逐步构建（每一拍都有自己的动作），最后落到一个 spring-pop 收尾。这是主力（6 个角色）。只要是文字撑起整个镜头、没有布景、没有表面、没有点击，就用它。
</blueprint>

<blueprint id="typewriter-reveal" roles="Hook, Brand_Outro" duration="3.6–7s">
一个活动的文字光标**像真人一样打出（并修改）一行字**，然后把它收起并弹出品牌收尾；或者把它保持在一个常驻的标志之下，同时一行副标题逐字打成最终的 CTA。当"有人正在打这行字"应该成为驱动力时用它 —— 一个让人感同身受的、被打出来的痛点 → 品牌，或者一个常驻 logo + 一条逐字打出的 CTA 横栏。
</blueprint>

<blueprint id="spatial-pan-stations" roles="Hook, Problem, Product_Intro" duration="7–10s">
预先摆放在**一张超大画布上的带标签"站点"，由单一一台虚拟摄像机依次走过** —— 反复的横向/斜向平移，把每个站点置于中心并揭示一个标注，最后停在最后一站上。适用于：平移到"我们"的里程碑时间线；一张由痛点站点连成的网，最终缠成一团乱结；或者一条两镜头的概念解读带，由一次横向平移衔接进一段实时演示。
</blueprint>

<blueprint id="camera-journey" roles="Benefits, Key_Feature" duration="5.6–11.1s">
真正的 viewport 摄像机就是讲故事的人 —— 在一个连续的世界里进行**多段有动机的旅程**（钻入 → 某个段落节拍触发 → 移动到结果处 / 重新取景 → 落地推近）。两种子形状：**(A) 动作往返** —— 钻进一个面板，一次点击/发送触发，摄像机俯冲到结果以元素运动形式呈现的地方；**(B) 无光标飞行** —— 纯电影化的 3D 飞行（运动模糊、景深、倾斜到展平），全程没有光标。当摄像机的移动本身就在讲述因→果（或奇观）的故事时用它 —— 而不是在它追着光标跑（cursor-ui-demo）或展示一台 hero 设备（device-surface-showcase）的时候。
</blueprint>

<blueprint id="zoom-out-workspace-reveal" roles="Hook, Benefits" duration="6.8–11s">
以**紧贴**一个满版细节的画面开场 —— 一个图形特写或一小块 UI 区域 —— 让微小的动作在特写中上演，然后**一次连续减速的拉远揭示出包含它的整体**（设计工具工作区 / 多窗格 agent 工作区）；画面锁定，元素层面的收尾接着进行。拉远就是驱动力 —— 它是推近类形状在结构上的反面；全程没有任何推近。适用于：以一个神秘的细节开场，再重新取景为"这就是它所在的地方"；或者落下一个关于规模/广度的收尾（"刚才那只是它所做一切中的一个角落"）。
</blueprint>

<blueprint id="constellation-hub" roles="Hook, Social_Proof, CTA" duration="5–8s (scatter-drift end card ~2.5s)">
带图标的**节点以弹簧方式弹出，围成一圈环绕中心**，然后收束到核心上 —— 摄像机推近（景深向它坍缩）；或者一个保持住的中枢标志，卫星绕着它运行；或者一次光标点击让轨道**坍缩**，并从中弹出产品演示（CTA）。适用于"它连接一切 / 一个中枢"或"位于你技术栈的中心"。第三种收尾（散点漂移片尾卡）：没有环，没有摄像机 —— 约 20 个图标散落着弹出、铺满画面、围绕一个衬线标题，并在完全静止的画面下缓缓向外漂移。
</blueprint>

<blueprint id="grid-card-assemble" roles="Key_Feature, Benefits, Social_Proof" duration="3.0–10.5s">
N 个条目（tile / 卡片 / logo / 列表行）**以错落的级联自行组装**成网格或竖向列表并保持住；可选的摄像机拉远会揭示出这个阵列处在一个更广阔的整体之中。适用于一次性列举广度 —— 功能网格、逐条累积的好处列表、logo 墙、自动填充的实时数据看板，或者一片不断涌动的内容区，清空后露出一句收尾语。
</blueprint>

<blueprint id="logo-assemble-lockup" roles="Product_Intro, CTA, Brand_Outro" duration="4.4–11s">
一个品牌标志 / wordmark **在屏幕上诞生** —— 由部件构建而成（元素组装/环绕、字母级联、轮廓线描绘出来、摄像机穿过负空间推进），或在清空的舞台上从零以弹簧方式整体绽开，或从前一句话中以一条不间断的链变形而来，或从一道像素拖影中吸收成形，或已经组装好、随着周围卫星元素清场而落定 —— 最终收束为一个居中的 lockup，可选地延伸为 URL/CTA/片尾卡。适用于无台词的高级品牌 sting、引向最终号召的 logo 构建，或任何品牌收尾的 lockup 段落节拍。
</blueprint>

<blueprint id="cursor-ui-demo" roles="Product_Intro, Key_Feature, Hook, Benefits" duration="4.0–12.9s">
一个可见的自定义**光标通过点击/悬停/拖拽驱动一个重建的应用 UI**，让屏幕在镜头与镜头之间改变状态，同时摄像机追随每一次交互（或者保持一个锁定的静态舞台，由元素替换来完成"摄像机的工作"）。适用于：由光标引领、初次亮相界面（Product_Intro）；把一个工作流从头到尾演示到动作按钮上（Key_Feature）；一个环境式的多光标画布开场；或者一个"演示|文字|演示"的 Benefits 三明治。
</blueprint>

<blueprint id="device-surface-showcase" roles="Key_Feature, Product_Intro" duration="5–11.3s">
一个**设备样机或浮动窗口作为 hero 保持在画面中**，它的屏幕依次走过一个真实的流程，由摄像机呈现，运镜从静态保持到连续的 3D 推进不等。机制丰富（静态导览 · 浮动窗口推进滚动 · 3D 手持演示 · 无光标分步流程 · 展示轮播）；其中分步流程变体把适用范围扩展到了 Product_Intro。适用于展示一个*在其真实界面内*被体验的功能，或者通过*完成核心循环*来介绍一个产品。
</blueprint>

<blueprint id="prompt-type-submit-generate" roles="Hook, Product_Intro, Key_Feature, CTA" duration="5.2–12s">
AI 时代的演示镜头：**一条 prompt/查询/命令被打进真实的产品输入框，机器作出回答** —— 状态表演过渡到流式回答 / 动作日志 / diff 卡片 / 图表 / 生成的产物（完整循环），或者一个即时结果界面又被重新查询（搜索 / 生成的页面 / 预览翻转），或者片段在提交那一刻切走、提问本身就是看点（包括安装命令 CTA 片尾卡）。只要这一拍是"看我提问，看它回答"就用它 —— 由键盘驱动，而不是点击走过的 UI（那是 cursor-ui-demo），也不是纯粹打出来的文字排版（那是 typewriter-reveal）。
</blueprint>

<blueprint id="agent-progress-theater" roles="Key_Feature" duration="4.2–11.6s">
把 agent 的工作演成**工作状态剧场** —— 一个单一的触发段落节拍（菜单选择、弹窗点击、一次已在进行的扫描）把画面交给机器：加载动画旋转、状态短语轮换，让人看见它在干活，然后成果清单级联而入 —— 一张清单/发现卡片，其中的行依次到来并**打勾**（徽章翻转、删除线、严重程度胶囊标签），或者一段对话逐条消息地构建起来，最后摄像机推近到确认信息上。适用于戏剧化地呈现 agent 执行多步工作、而状态变化本身就是演示内容的情况 —— 没有打出来的 prompt，没有光标驱动的工作流，也没有静态的罗列。
</blueprint>

<blueprint id="panel-edit-live-sync" roles="Key_Feature" duration="5.3–11.9s">
一个二分式舞台 —— 一个检查器/编辑器**面板与一个目标界面绑定** —— 光标（或文字光标）持续操作一个控件（数值拖动、单位/代码生成下拉菜单、easing 手柄拖拽、行内重新输入），与之耦合的界面**在同一拍里实时更新**；摄像机保持不动或推近再拉回，但绝不会丢掉这对耦合。当功能本身就是实时编辑/检查 —— "改这个，看它变" —— 时用它，而不是点击走过的工作流（那是 `cursor-ui-demo`）。
</blueprint>

<blueprint id="transcript-scroll-artifact-reveal" roles="Key_Feature" duration="5–11.8s">
画面沿着一个**很长的**满版内容界面纵向移动 —— 一份 agent 记录、任务流或分析文档（没有设备边框）—— 通过摄像机平移或元素滚动，**把生成的工作当作证据来阅读**；然后**一次**聚焦交互（文件 chip 点击、引文高亮、行展开）转入产物揭示（工作区拉远、表格放大到高亮单元格、行内面板）。当这一拍是"AI 做了大量工作 → 这就是交付物"时用它 —— 走过的过程是证明，产物是收尾。
</blueprint>

<blueprint id="dataviz-countup" roles="Hook, Problem, Product_Intro, Key_Feature, Social_Proof" duration="4–12s">
数字和图表是 hero —— **计数上涨的圆环/数字、趋势图、倾斜的数据网格** —— 由摄像机**穿过**（或横扫过）它们，最后落在一个 hero 指标上。当数据撑起论点时用它：量化一个不断恶化的问题；以"看看结果"自信开场；以一个爆炸性的统计数字冷开场；用一段暗色的、由光标拖动的数据蒙太奇来证明某个功能；或者在一段文字接力中客串一个仪表计数上涨，作为其中一拍。
</blueprint>

<blueprint id="titlecard-reveal" roles="Benefits, Social_Proof, CTA, Product_Intro" duration="3–5s">
平静的**喘息/落地段落节拍** —— 一个干净的标题或单张品牌/证明卡片，用恰好**一个**克制的动作揭示出来（上滑交叉淡化，或擦除式揭示），然后静止保持。低运动量就是它要传达的内容，而不是缺陷。适用于两行的价值标题，或者一个繁忙的开场被擦除成一个干净的 lockup + 一句"深受 N+ 个团队喜爱"的数据。也可以作为卡片**链**运行 —— 2–3 张近乎静止的单色卡片，用瞬间硬切（CTA 片尾卡堆叠）或模糊急停式交接（Product_Intro 标题前奏）缝合起来，最终停在保持住的 logo 上；链中每张卡 2–3s，总计约 5.5–9.5s。
</blueprint>

<blueprint id="comparison-split" roles="Key_Feature" duration="4–6s">
两个分量相等的成对条目，从相对的两翼带着**镜像的 3D "翻书"式倾斜**进场，并排保持，然后在各自内侧边缘以弹簧方式弹出一个胶囊徽章来点题。适用于 A/B 对比或"X + Y 搭配"—— 同时权衡两个互补的能力（不适用于超过 2 个条目，也不适用于先后的步骤）。
</blueprint>

<blueprint id="overwhelm-surround" roles="Problem" duration="6–9s (clutter-shove variant ~10s)">
靠堆积制造压迫感 —— 可辨认的界面组装起来，表示密度的图标散落进来，中间那个**变形成观众自己的头像**，然后元素从四面八方合围（被包围，而不是被放大推近）。当痛点是"你被工具淹没了"时用它，结束在一片令人窒息的拥挤上。第二种收束（杂物推开引出问题）：堆积在一次缓慢的拉远下进行，然后一次推近把杂物推到画面边缘，一个两段式的衬线问句在腾开的中心构建起来 —— 由摄像机驱动，没有头像。
</blueprint>

<blueprint id="ticker-takeover" roles="Hook, Brand_Outro" duration="5–7s">
一段打出来的引导语 + 一个在多个选项间轮换的强调词，然后一个 hero **从屏幕外撞进来，把文字硬生生推开** —— 是碰撞，不是淡化 —— 最后独自落定。当一段"可能是很多东西"的铺垫应该被"就是它"粗暴取代时用它。
</blueprint>

<blueprint id="fixed-anchor-cycle" roles="Hook, Benefits, Brand_Outro" duration="6.6–11.1s">
一个元素保持**钉住** —— 一个 wordmark、输入框或锚定句，只进场一次并且**从不移动** —— 而相邻区域（或整个周围的主题）则在许多离散状态间轮换：硬切替换标签、竖向轮播、逐词高亮步进，或原地的主题变形，节奏常被刻意操控（匀速步进，或由慢到快不断加速的连珠炮），最后在一个强调段落节拍上收束为完整的 lockup。适用于围绕一个固定身份来宣示广度 —— "大家都说 / 在哪儿都能用 / 召集所有 X" —— 锚点的静止本身就是主张。
</blueprint>

<blueprint id="video-text-pivot" roles="Product_Intro, Key_Feature" duration="6–8s">
一段产品视频居中保持并轻轻呼吸，然后**滑到一侧，把分量交给一个 hero 数据**，接着两者都清场，动态文字在腾空的中心打出来，由一个渐变胶囊封底。适用于"看功能 → 看效果"、且视频必须始终可见（滑动，绝不切走）的情况。
</blueprint>

<blueprint id="cta-morph-press" roles="CTA, Hook" duration="4–6s (Hook opener 5–7.5s)">
一个静止的品牌标志**在同一个中心凝缩成一个更亮的 CTA**，然后光标到来，落下一次像人瞄准过的点击并带有反馈。适用于一个聚焦的"点这里"收尾，引导视线从身份走向行动 —— 没有空间布景，没有多步 UI。角色扩展到 Hook：同一套机制作为**开场** —— 平坦背景上的一个孤立小部件（胶囊/chip）原地变形（胶囊→菜单，chip→prompt 卡片），完成它承载的内容，然后消失，换成一个打出来的结束标题。
</blueprint>
</blueprints>

## 角色 → blueprint 菜单

这是一份**软性**菜单：故事的真实性优先。故事设计**在产品自身的段落节拍需要那种形状时**才来取用 —— 它推荐一个经过验证的形状，绝不规定有哪些段落节拍。每个角色有 4–11 个选项；如果没有一个适合这一拍，就自由组合（菜单不是清单）。每一行都是应当让你去取用那个 blueprint 的**触发条件**。

这里的角色与分镜帧的 `type` 枚举一一对应：**Hook**=`hook` · **Problem**=`pain_point` · **Product_Intro**=`product_intro` · **Key_Feature**=`feature_showcase` · **Benefits**=`benefit_highlight` · **Social_Proof**=`social_proof` · **CTA**=`cta` · **Brand_Outro**=`branding`。

**Hook**

- `kinetic-type-beats` —— 一句有冲击力的反问 / "你总是在做 X"式的点名，原地换词本身就是笑点；一段逐步升级的多拍陈述，落到 spring-pop 收尾；文字段落节拍收束为 logo 揭示；或者一个居中的三拍组合（某一拍可以是非文字元素）。
- `typewriter-reveal` —— 打出一句让人感同身受的话，收起它，弹出品牌（logo 或产品 UI）—— "这是日常的痛点，现在轮到我们了。"
- `spatial-pan-stations` —— 一条里程碑时间线，平移到当下（"一路演进，直到我们"）。
- `constellation-hub` —— 由工具/节点组成的星座 + 摄像机推近（"它连接一切"）。
- `cta-morph-press` —— 平坦背景上的一个孤立小部件原地变形（胶囊→菜单，chip→prompt 卡片），完成表演，然后消失，换成一个打出来的标题（"一个小部件做一件事"式开场）。
- `ticker-takeover` —— 一个轮换的强调词（"可能是 X，或者 Y……"）被一个从屏幕外撞进来的 hero 粗暴取代。
- `fixed-anchor-cycle` —— 一句静止的引导语保持不动，下方的强调行轮播点名一串受众/选项，然后清场，进入陈述段落节拍，落到品牌标语上。
- `prompt-type-submit-generate` —— "看我提问"：一个打出来的标题 → 一次推近到产品的输入框 → prompt 逐字打出，片段在提交那一刻结束；或者整个演示循环跑完，在切走之前又开始了第二条命令。
- `cursor-ui-demo` —— 一个环境式的多光标工作坊：带标签的队友光标在设计画布上实时干活（抓取-拖拽-放下，放下时重新着色），同时一个标题在演示上方构建起来 —— 实时工作坊本身就是钩子。
- `dataviz-countup` —— 冷开场的计数爆发：图标在中心聚集着戳进来，一个戏剧性的统计数字在尺寸上向上爆开，同时图标被甩向外侧各自的位置，最后以一次缓慢的前倾推近收尾。
- `zoom-out-workspace-reveal` —— 一个满版的图形谜团（色块 / 花朵 / 微距特写），由一次不间断的减速拉回穿过层层嵌套，揭示出制作它的设计工具工作区；锁定之后画布继续动画。

**Problem**

- `kinetic-type-beats` —— 3–5 句简短的痛点陈述，每一句都单独落在空白画布上；或者一段问句/钩子短语接力，以缩放弹出的方式穿过中心（可选地以元素运动的形式收束到产品界面上）。
- `spatial-pan-stations` —— 平移走过一张由痛点"站点"连成的网，最终缠成一团乱结。
- `dataviz-countup` —— 摄像机穿过一个计数上涨的圆环 / 图表 / 数据网格，把一个不断恶化或规模巨大的问题戏剧化。
- `overwhelm-surround` —— 可辨认的工具变形成观众本人，然后任务气泡从四面八方合围（"你被淹没了"）。

**Product_Intro**

- `kinetic-type-beats` —— "隆重推出……"式的硬切报名，收束到品牌名/logo 上；也可以是一个固定的标题带一个替换的词槽、一段逐词推进并对每个 hero 词给出效果收尾，或者一个锚定的 wordmark 变形退场。
- `logo-assemble-lockup` —— 一个无台词的高级品牌 sting（元素脉动/环绕，并围绕标志组装起来）。
- `cursor-ui-demo` —— 初次亮相产品界面；一个光标扫进来介绍这个应用。
- `dataviz-countup` —— 硬切进一个数据可视化卡片网格，摄像机滚动到一个发光的 hero 指标 + 一句动态标语。
- `video-text-pivot` —— 一段产品视频滑到一侧，把分量交给一个 hero 数据，然后把中心让给动态的效果文字。
- `spatial-pan-stations` —— 一条由**一次**横向平移衔接的两镜头带：一句静态短语中的强调词以 3D 翻牌方式解码（概念落地），然后摄像机带着视差平移进一段实时的光标打字演示。
- `prompt-type-submit-generate` —— 产品的初次亮相就是它的输入框或搜索栏 —— 一条长 prompt（或短查询）带着附件 / 下拉选择 / 实时自动补全逐字打出，一路引向确认控件。
- `device-surface-showcase` —— 一段无光标的端到端流程（设置/认证 → 动作 → 成功），在保持住的界面内完成，前后由标题卡包夹。
- `titlecard-reveal` —— 一段三拍的暗色标题前奏（logo 弹出 → 追加名称+版本 → 标语卡片），在任何产品 UI 出现之前，用模糊急停式交接串联起来。

**Key_Feature**

- `grid-card-assemble` —— 一个带标签的功能 tile/胶囊网格自行组装（或者由摄像机拉远揭示的玻璃卡片；或者一个实时填充的数据看板 —— 骨架屏填满、相互连线的卡片、组装后的状态翻转）。
- `cursor-ui-demo` —— 把一个具体的多步工作流从头到尾演示一遍，落在动作按钮/结果上。
- `device-surface-showcase` —— 一个设备/窗口作为 hero，其屏幕依次轮换（静态导览 · 浮动窗口推进滚动 · 3D 手持演示）。
- `comparison-split` —— 两个成对的能力并排，带镜像的翻书式倾斜（A/B / "X + Y 搭配"）。
- `video-text-pivot` —— 一段功能片段滑到一侧，让位给一个占满画面的指标，然后是一句排版化的效果语。
- `dataviz-countup` —— 暗色拖动蒙太奇：动态标题段落节拍与自绘图表、由光标拖动的仪表盘（`chart-scrub-readout`）剪接缝合在一起。
- `prompt-type-submit-generate` —— 把能力呈现为一次 prompt→回应的往返：提交后进入思考状态，然后是流式回答、动作日志、diff 卡片、图表，或即时生成的产物。
- `agent-progress-theater` —— 功能就是 agent 在**干活**（规划 / 扫描 / 修复 / 自动化）：加载动画 + 状态表演，收束为一张逐项打勾的清单，或者一段对话构建到确认收尾。
- `panel-edit-live-sync` —— 一个检查器/编辑器面板编辑并实时同步一个绑定的目标（拖动 → 它旋转，重新输入 → 它调整尺寸，选择 → 它转换）；用于价值主张就在于这种实时耦合本身的功能。
- `camera-journey` —— 一段在产品界面上空的无光标电影化 3D 飞行 —— 运动模糊、景深、倾斜到展平 —— 猛然落在 CTA / hero 卡片上（子形状 B）。
- `transcript-scroll-artifact-reveal` —— 一份很长的记录/信息流/文档被纵向走过，作为生成工作的证据，然后一次交互转入产物（"它做了这么多 → 这就是交付物"）。

**Benefits**

- `kinetic-type-beats` —— 一段由 8–12 句简短价值短语组成的连珠炮式断奏蒙太奇，或者一段缓慢的 2–4 句陈述接力，每句保持约 1.5s 以上。
- `grid-card-assemble` —— 一个竖向的好处列表，逐条累积、步进，或流经一个焦点位置，可选地清场后露出一句收尾语。
- `titlecard-reveal` —— 一张平静的两行价值标题卡（一个喘息/静止段落节拍）。
- `camera-journey` —— 一个面板里的小动作在另一个区域产生结果，一次真实的摄像机俯冲在物理上把因与果连接起来（子形状 A）。
- `zoom-out-workspace-reveal` —— 在一小块 UI 区域上以极近特写呈现微小动作，然后一次快速减速的拉远揭示出巨大的多窗格 agent 工作区；全景保持，直到交付物收尾完成。
- `fixed-anchor-cycle` —— 一个产品界面钉在正中央，而它的整个主题每一拍都换一次皮（"同一个 prompt，在每一个工具里"）。
- `cursor-ui-demo` —— "演示|文字|演示"三明治：两个静态舞台的演示段落节拍，中间穿插一段全屏的动态文字/标题间奏，然后再回到演示。

**Social_Proof**

- `constellation-hub` —— 产品标志作为中枢，合作伙伴 logo 环绕它运行（"适配你的技术栈"）。
- `grid-card-assemble` —— 一面 logo 墙构建起来，然后拉远，揭示出一个庞大的生态。
- `titlecard-reveal` —— 把繁忙的开场擦除，换成干净的品牌 lockup + 一句"深受 N+ 个团队喜爱"的数据。
- `constellation-hub` —— 散点漂移片尾卡：约 20 个应用图标铺满画面地弹出，围绕一个衬线标题，并在静止画面下向外漂移（"连接数千个应用"）。
- `dataviz-countup` —— 一个径向仪表计数上涨的仪器，作为单独一拍嵌入一段动态文字接力之中。

**CTA**

- `kinetic-type-beats` —— 一句有冲击力的结束语（或一小组价值语）一拍一拍地急停到 logo/URL 上，或者一条 3–5 拍的链，每一拍在 logo 成形之前都带着自己的动态小噱头。
- `logo-assemble-lockup` —— logo 构建 → 摄像机穿过推进到最终的 URL/CTA 动词上。
- `cta-morph-press` —— 一个品牌标志在同一个中心凝缩成 CTA，然后光标落下一次像人瞄准过的点击。
- `titlecard-reveal` —— 一条单色片尾卡链（陈述 → CTA 句 → wordmark/logo），用瞬间硬切缝合，最终停在 logo 上一直保持到最后一帧。
- `constellation-hub` —— 轨道坍缩：类别图标围绕一个空着的中央 CTA 漂移，一次光标点击让轨道朝点击点内爆，产品演示从坍缩中弹**出**。
- `prompt-type-submit-generate` —— 安装命令片尾卡：标题降级退居次位，一个终端胶囊以弹簧方式弹入，命令逐字打出并保持，光标闪烁。

**Brand_Outro**

- `kinetic-type-beats` —— 一阵快速的动词连发，收束到品牌那个决定性的词上；或者一段从容的全画面段落节拍接力，终止于一张长时间保持的 URL 片尾卡。
- `typewriter-reveal` —— 一个常驻的品牌标志，下方有一条逐字打出/轮换的 CTA 横栏。
- `logo-assemble-lockup` —— 功能/UI 元素清场，lockup 自己描绘出来。
- `ticker-takeover` —— 选项轮换，然后品牌标志撞进来，独占画面。
- `fixed-anchor-cycle` —— wordmark 钉住不动，旁边的赞誉引语 / 标语高亮轮换（可选地逐渐加速），收束为完成的 lockup。

> 覆盖情况：每个角色都有 ≥2 个选项；每个 blueprint 都服务于 ≥1 个角色。`kinetic-type-beats` 是主力（6 个角色）；`dataviz-countup` 现在覆盖 5 个；`device-surface-showcase`（曾经角色范围很窄）现在也通过挖掘出的分步流程变体服务于 Product_Intro。有五个形状 —— `comparison-split`、`overwhelm-surround`、`ticker-takeover`、`video-text-pivot`、`cta-morph-press` —— 是从 hyperframes-animation 的 blueprint 中加入的；另外七个 —— `prompt-type-submit-generate`、`agent-progress-theater`、`panel-edit-live-sync`、`camera-journey`、`transcript-scroll-artifact-reveal`、`zoom-out-workspace-reveal`、`fixed-anchor-cycle` —— 是从优秀片段语料库中挖掘出来的。

## 选择指南

1. 在上面的菜单中找到这一帧的**角色**；选出**形状适合这一拍**的 blueprint（故事阶段可能已经点名了某个候选 id —— 确认或推翻它）。如果有两个都合适，优先选运动更接近你计划的那个。
2. 打开 `blueprints/<id>.md` —— 读它带时间码的模板、`[slots]` 和有名字的**招牌动作**。
3. 选择一种姿态 —— **复现（Reproduce）**（slot 能干净地对应上）、**改编（Adapt）**（结构合适，内容/界面不同；保留招牌动作），或**组合（Compose）**（没有合适的 → 从运动词汇构建）。每种写法*具体怎么写* —— 保留/改动什么、每帧的字段 —— 归 `visual-design.md` 管；以它为准。
4. 如果菜单里没有一个适合这一拍，就从 `motion-language.md` 中的运动词汇来**组合** —— 依然要让揭示的节奏在整个镜头中跟着 VO 走。不要硬套一个不对的 blueprint。

## 运动覆盖

优秀词汇中每一个反复出现的动作，都有本 skill 本地的 `rules/` 作为支撑 —— 其中包括为补全语料而新增的五条：`depth-of-field-blur`、`motion-blur-streak`、`depth-scatter-assemble`、`spring-pop-entrance`（标准的入场弹出，有别于点击/按压用的 `press-release-spring`），以及 `ambient-glow-bloom`。每个 blueprint 的 `rule mapping` 都会引用真实存在的规则。

变体出处（`from <shape-name>`）注明了某个变体是从哪个挖掘出的优秀形状逆向提炼而来的；案例级别的优秀片段映射放在 c2v-bench 的挖掘报告里（仅供维护者使用 —— 使用方 agent 只需要形状名）。

还剩一个真正超出范围的特例：`device-surface-showcase` 的 **3D 手势输入 + WebGL bloom/传送门** 需要 R3F/Three.js + WebGL —— 比规则库更重的能力。节制地使用它，或者选一个更简单的 `device-surface-showcase` 变体。
