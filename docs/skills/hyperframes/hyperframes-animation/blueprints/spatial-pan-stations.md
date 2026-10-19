<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/spatial-pan-stations.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# spatial-pan-stations —— 空间平移 / 站点

**intent / 意图**：在一张超大画布上预先摆好一串带标签的站点，然后用单个虚拟镜头穿行其间 —— 反复的横向 / 斜向平移，依次把每个站点移到画面中央，并在每一站揭示一个标注，最后落在终点站上停住。

**roles served / 服务的角色**

- Hook（来自 hook-pan-timeline）：一条水平时间线，上面是等间距的里程碑，一拍一拍地向左平移，每个标记点都得到一个弹簧弹出的标注，最后落在当下这一刻（「一路演进 / 一个个里程碑走到我们今天」）。
- Problem（来自 problem-camera-pan-stations）：一张由手绘引导线串起来的痛点「站点」网络，站点与站点之间斜向平移，结束在一团纠缠的涂鸦乱结上（「太多互不相连的步骤 —— 一团糟」）。
- Product_Intro（来自 concept-demo-decode-pan）：一条由两个镜头组成的长条，用**一次**横向平移连接起来 —— 镜头 1 停在一个静态短语上，其中的强调词做 3D 翻牌**解码**（概念落地），然后镜头横穿长条（带背景视差）进入镜头 2，在那里由光标驱动一段实时打字演示。把这次平移和 `cursor-ui-demo` 那种焦点锁定、跟踪式的打字搭配使用。

**duration / 时长**：7–10 秒（Hook 8–10 秒、Problem 约 7 秒、concept-demo 约 7 秒三者的并集）

**shot structure / 镜头结构**：一张超大的平面画布，铺在纯色的 `[bg color]` 上；所有站点 / 标记点都预先摆放在世界空间里；`[accent color]` 文字 + 简单的线条图标；一个虚拟的 `.world` 镜头在各停靠点之间做 ease-in-out 平移。每个站点停留约 1.0 秒。

- Scene 1（0.0–约 1.0 秒）：镜头在站点 1 上开场 —— `[label 1 / first step]` 居中。一次揭示落在它上面（见各变体）。然后镜头开始朝站点 2 **平移**，把站点 1 滑出画面。
- Scene 2 → Scene N-1（各约 1.0 秒）：镜头**平移**（ease-in-out），把下一个站点移到中央；到达时用该角色对应的揭示方式**揭示**它的 `[label k]`（+ 可选的 `[secondary label]`）。每个站点重复一遍。
- Scene N（最后，约最后一拍）：最后一次平移落在终点站上；最后的 `[callout / landing element]` 揭示出来并**停留**到结束。镜头在点睛之处静止。

- 变体 —— Hook：站点是细长水平 `[timeline]`（画面下三分之一处）上等间距排布的 `[markers]`；平移只沿这一条轴**向左**进行（时间线向左滚动）。每个标注是一个带边框的 `[callout box]` + 一个向下的三角（带偏移投影），向上**弹簧弹出**（缩放 0→100%，带弹性过冲，transform-origin 位于三角尖端），内容是 `[label k]`；一个 `[secondary label, e.g. year]` 淡入并在它上方**升起**。部分中间的标记点以普通的静态文字出现，仅靠平移揭示（没有框）。最后一个场景落在 `[present-day label]` 上，弹出，停留。
- 变体 —— Problem：站点散布在一张二维网络上；平移是**斜向**的，由 `[accent color]` 手绘线条**引导** —— 每个站点都有一条粗糙的书写式线条 / 箭头朝下一站画过去，镜头跟着它走（Scene 1 还会在标题的关键词周围画一个圈）。每个站点 = 一个白色的 `[line-icon]` 位于它的 `[label]` 上方，仅靠平移朴素地揭示（没有弹簧框）。最后一个场景：强调色线条盘旋成一团密集混乱的**涂鸦乱结**，位于画面中央；镜头静止停在这团乱麻上（视觉上的点睛）。

**motion vocabulary / 动作词汇**：在一张大的静态画布上反复做 ease-in-out 镜头平移（Hook 是水平向左，Problem 是斜向引导）；预先摆好的站点随平移滑过画面；以三角尖端为原点的弹簧过冲标注弹出（Hook）；升起并淡入的次级标签（Hook）；仅靠平移出现的普通标签 / 图标；粗糙的手绘「书写式」引导线 / 箭头 + 关键词圈注（Problem）；终点处混乱涂鸦乱结的绘制（Problem）；在最后一站 / 点睛处静止停留。

**rule mapping / 规则映射**

- 在画布上平移 / 穿行（主要）→ `viewport-change`（单个 `.world` 包裹层的 transform；PAN 模式）
- 把反复的平移节拍排成一个个停靠点 → `multi-phase-camera`
- 把每个站点作为平移目标居中 → `coordinate-target-zoom`（用作平移到目标，不缩放）
- 以三角尖端为原点的弹簧过冲标注弹出（Hook）→ `spring-pop-entrance`
- 升起并淡入的次级标签 + 靠平移完成的每站普通标签 / 图标揭示 → `discrete-text-sequence`
- 手绘引导线 / 箭头 / 关键词圈注 / 终点涂鸦乱结（Problem）→ `svg-path-draw`
- 站点的线条图标（Problem）→ `svg-icon-enrichment`
- 在最后一站 / 点睛处静止停留 →（没有运动；持续停住的画面，不需要规则）

**camera modifier / 镜头修饰**：平移**就是**镜头。一个 PAN 模式下的 `.world` 虚拟镜头 transform —— `viewport-change` —— 由 `multi-phase-camera` 在各停靠点之间编排，每个停靠点通过 `coordinate-target-zoom`（平移到目标）来定位。没有纵深推近（这一点把它和 cluster-push-in / dataviz-pushthrough 这些 blueprint 区分开来）。
