<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/constellation-hub.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# constellation-hub —— 星座 / 中枢 + 卫星

**intent**（意图）：带标签/图标的节点以弹簧方式弹出，围绕一个中心形成环/簇，然后镜头收束到核心上 —— 要么把摄像机推**进**中心（景深向它坍缩），要么保持一个中枢标志，让卫星**环绕**它运行；这是"一切都连接到 / 围绕着一个中心"的段落节拍。

**roles served**（服务的角色）

- Hook（from `hook-cluster-push-in`）：一个由工具/应用节点组成的星座以弹簧方式弹出成一个宽环，然后一次持续的、带景深的摄像机推近收束到内部核心上 —— "它连接一切 / 一个中枢管理你所有的工具。"
- Social_Proof（from `social-proof-orbit-ecosystem`）：产品的品牌标志作为中心中枢落定，合作伙伴 logo 以弹簧方式跳上一个环并绕着它旋转 —— "接入 / 位于你技术栈的中心。"
- CTA（from `cta-orbit-collapse`）：环以**坍缩**而不是推近来收束 —— 类别图标围绕一个空着的中央 CTA 漂移，一次光标点击让轨道朝点击点内爆，产品演示作为答案从坍缩中弹**出**（范围 → 选择 → 结果 → 产品）。
- Social_Proof（from `proof-logo-chain`）：一个常驻的中心 logo 不断积累证据 —— 它的 wordmark 解码出来，一条主张滚动条轮换，logo 滑到中心，然后头像带着画出来的连接线级联进入轨道，同时合作伙伴 logo 在底部条带滚动；四条主张读起来像一句话。
- Social_Proof（from `scatter-drift-finisher`）：把生态段落节拍做成一张静态的**片尾卡** —— 一个两行的衬线 `[headline]` 是中心（没有中枢标志，没有环），`[~20 app icons]` 以快速错落的方式散落着弹出、铺满画面，然后一直非常缓慢地向**外**漂移到结尾。"连接数千个应用"是靠数量和分布说出来的，而不是靠几何形状。

**duration**（时长）：5–8s（Hook 5–6s · Social_Proof 5–8s · CTA 轨道坍缩约 6s · Social_Proof 散点漂移片尾卡约 2.5s，作为结束段落节拍）

**shot structure**（镜头结构）

合并后的模板 —— 节点环绕一个中心，然后由两种收尾之一收束到核心上。

- Scene 1 (0.0–~1.5s)：`[bg]`（深色/太空背景，可选缓慢漂移的弥散渐变色块）。`[primary nodes]`（承载 `[icon]` + 标签的圆）以**弹簧弹出**方式进场（缩放 0→1，约 1.15 的弹性过冲，错落进行），排成一个宽环/簇，围绕一个空着的或带标志的中心 `[hub]`。
- Scene 2 (~0.7–2.5s，重叠)：更小的 `[secondary nodes]`（平台 / 合作伙伴 logo chip）以同样的弹性弹簧错落弹出，填满空隙；可选从中枢→节点画出细细的 `[accent]` 连接线 / 轨道环。摄像机保持。
- Scene 3 (~2.5–Xs，收束)：见下面的收尾变体；落定在被放大 / 被环绕的中心上并**保持**到结尾。

- 变体 —— Hook（推近收尾）：从 Scene 3 开始，摄像机朝中心内部簇进行一次连续顺滑的**推近** —— 内部节点放大并保持清晰，外部节点被推向边缘并逐渐**模糊**（景深），背景平滑放大；在核心上保持放大状态。
- 变体 —— Social_Proof（环绕收尾）：中心的 `[brand mark]` 通过一次快速的 3D 旋转急停进场，减速并落定；一道细细的 `[accent]` 轨道环在它周围画出来；`[N partner badges]` 以弹簧方式跳上这个环（错落的过冲），并保持直立地**顺时针**旋转，同时摄像机持续缓慢地**拉远**（生态揭示）。
- 变体 —— Social_Proof（可选的文字穿越开场，加在 Scene 1 之前）：居中的 `[headline]` 逐字打出/滑入，背后有同样文字的一个巨大的透明填充**描边**副本；描边文字朝摄像机指数级放大（高速推轨 / 穿越），冲破画面，然后**硬切**到 Scene 1 的中枢背景。
- 变体 —— Social_Proof（散点漂移收尾，没有环）：中心是一个原地构建的两行衬线 `[headline]`（不是标志）；`[~20 app icons]` 以快速错落的方式**散落**弹出，铺满整个画面 —— 没有环形几何，没有连接线 —— 然后保持非常缓慢的向外漂移直到结尾。摄像机完全静止：没有推近，没有拉远；"一切都围绕着一个中心"是从背离标题的漂移方向中读出来的。常作为前一个 UI 段落节拍的片尾卡串联（前一张卡片溶解成它）。

**motion vocabulary**（运动词汇）：错落的弹性 spring-pop 节点入场（约 1.15 过冲）；缓慢的渐变色块漂移；连接线 / 轨道环描绘出来；中枢标志上的 3D 急停旋转落定；连续的摄像机推近（内部清晰，外部景深模糊，背景放大）；直立徽章的顺时针轨道旋转；连续缓慢的摄像机拉远（生态揭示）；可选的描边文字穿越推轨入场。散点漂移收尾：铺满画面的散落图标弹出（错落，没有环）；持续缓慢的图标向外漂移；原地构建的两行衬线标题；静止画面保持到结尾。

**rule mapping**（规则映射）（运动动词 → `rules/<id>.md`）

- 错落的 spring-pop 节点入场 → `spring-pop-entrance`（弹性过冲）+ `gsap-effects`（错落配方）；3D 翻转入场的风味 → `orbit-3d-entry`
- 节点围绕中心的环 / 簇布局 → `avatar-cloud-network`（椭圆环上的节点 + 连到中心的 SVG 线）
- 节点上的图标 → `svg-icon-enrichment`
- 中枢→节点的连接线 → `svg-path-draw`
- 轨道环描绘出来 → `svg-path-draw`
- 缓慢的渐变色块漂移 → `sine-wave-loop`（空闲循环漂移）
- 中枢标志上的 3D 急停旋转落定 → `orbit-3d-entry`（3D 翻转入场）；技术 CSS-3D
- 直立徽章的顺时针轨道旋转 → `orbit-3d-entry`（连续的椭圆轨道）；技术 MotionPath
- 摄像机朝中心推近 → `multi-phase-camera`（推近）+ `coordinate-target-zoom`（瞄准核心）
- 推近期间背景放大 → `multi-phase-camera`
- 连续缓慢的拉远（生态揭示）→ `multi-phase-camera`（拉回）/ `coordinate-target-zoom`
- 描边文字穿越推轨开场（Social_Proof）→ `3d-text-depth-layers`（背后的描边副本）+ `multi-phase-camera`（穿越）
- 推近期间外部节点的景深模糊 → `depth-of-field-blur`（对偏离中心的外部节点做渐进的 DOF/焦外衰减模糊，同时内部核心保持清晰）
- 铺满画面的散落图标弹出（没有环）→ `spring-pop-entrance`（错落组）+ `gsap-effects`（错落配方）；位置预先烘焙成散落分布 —— **不是** `avatar-cloud-network` 的椭圆环
- 持续缓慢的图标向外漂移 → `center-outward-expansion`（向外的矢量，缓慢持续的语域 —— 漂移目标位于弹出位置稍外一点）
- 原地构建的衬线标题 → `gsap-effects`（错落的逐行/逐词揭示）

**camera modifier**（摄像机修饰）：带 DOF 的推近（Hook）—— `multi-phase-camera` 推近，通过 `coordinate-target-zoom` 瞄准核心；其中焦外衰减模糊的那一半由 `depth-of-field-blur` 支撑。环绕收尾（Social_Proof）—— 卫星旋转的同时，通过 `multi-phase-camera`（拉回）缓慢连续地拉远。散点漂移收尾（Social_Proof 片尾卡）—— 无：画面从不移动；向外漂移是元素层面的。
