<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/music-to-video/references/template-catalog.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 模板 catalog —— 选择菜单（Step 3）

经逆向工程得到的、无素材的 **group 模板**。规划者挑模板时**只**读这个文件 —— 你**不需要**打开模板的 `index.html` 来做选择。一个模板实现一个 frame 中的**一个 group**（一个 frame 可以堆叠好几个 group；品牌主干把它们统一起来）。

**怎么挑。** 对每个 group，读出它所在 frame 的 `pacing` + `mood` + 骨架里那一行音乐状况描述，然后浏览下面的 **Reach for it when（何时选用）** + **Best span（最佳时长）**，选最接近的那个。如果都不合适，就基于 [`motion-primitive-catalog.md`](motion-primitive-catalog.md) **自由组合** —— 那是一种一等选择，不是失败。

**品牌来自 `frame.md`，而不是模板。** 模板自带演示用的色板（`theme` / `palette` / 颜色参数）。用项目的 `frame.md`（所选 preset 的颜色 + 字体）来填写这些参数，让每个 group 读起来都像同一件作品 —— 模板提供**运动 + 布局**，preset 提供**外观**。

列出 **Params** 是为了让你能在分镜里填写内容槽位。确切的语义 + 默认值在每个模板的 `index.html`（`data-composition-variables`）里 —— frame-worker 在构建时读取它们；你只需点名取值。

Pacing 标签：下面每个模板都是 **beat_cut**，只有 `held-message-living-field` 例外（**phrase_flow**）。绝不要把 beat_cut 模板放到 phrase_flow frame 上。

## Group 时长纪律

模板是按 **group** 选的，而不是按 frame。一个比模板的 **Best span** 更长的 frame，通常应该在真实的 audiomap 锚点处（`SURGE`、`DROP`、roll 边缘、hard_stop、乐句边缘）拆成多个 group，而不是把一个模板拉满整个 frame。

- 下面的 **Best span** 是活跃的处理时长：也就是模板的系统在做有意义的运动的那一段。结尾留一小段可读的定格没问题；拖着一条长长的空尾巴，就意味着该另选一个 group 了。
- **超过约 6 秒的 frame** 通常需要 2 个以上的 group。beat-cut 类的例外是带有真实子阶段的丰富程序（`poster-tile-mosaic`，有时是 `card-flyby`）；phrase-flow 类的例外用 `held-message-living-field`。
- **roll 模板是一次一个 roll 的工具。** 如果一个 frame 有两段 roll，或者两段 roll 之间有一个 drop，就把它拆成两个 group。
- 不要靠放慢每一个 tween 来延长。保持模板的运动手感，然后用定格 / 色板变化 / 新的 group 来填补多出来的时间。

---

### card-flyby

- **What（是什么）** —— 一列有纵深的卡片沿透视向前滚动；每个落点节拍都让下一张卡片翻滚进前排位置，伴随一次纯色擦除，旧的前排卡片朝镜头倒下，卡片之间的停留时间逐张缩短，于是整叠卡片加速推进，最终落在一张定格的卡片上。
- **Reach for it when（何时选用）** —— 一串**不断加速**的离散 onset（间隔越来越短 / 一路铺垫进一个重拍），而你想闪现**一系列条目** —— 标题、项目、海报、瓦片 —— 每次打点一个，在一张定格的卡片上达到高潮。
- **Best span（最佳时长）** —— **4-6.5s**，容纳 4-7 次落点外加一小段最终定格；如果它想跑 **>7s**，就在下一个重拍处拆开。
- **Params（参数）** —— `theme`、`bgColor`、`cards`、`landings`、`yaw`

### held-message-living-field · phrase_flow

- **What（是什么）** —— 一个可读的标记（logo / 单词 / 标题）纹丝不动地定格在一片柔和、颜色流转的模糊场之上；只有这片场在呼吸。
- **Reach for it when（何时选用）** —— 一段带有 onset 荒漠的**舒缓 / 稀疏**区间 —— 有能量，但 onset 很少或没有（一段持续的铺底音色或上扬音效）；你有一个单词或标记要定住，让它呼吸。
- **Best span（最佳时长）** —— **6-16s**；这是长 group 的例外。短于 4 秒会显得没展开；超过约 20 秒就需要一次状态变化或另一个 group。
- **Params（参数）** —— `markText`、`titleText`、`tagText`、`palette`、`flowSpeed`、`duration`

### held-text-strobe-burst

- **What（是什么）** —— 一个纹丝不动的单词，它的字母每隔约 3 帧就在不同的纹理填充画面之间翻转（纹理裁切填充 + 逐帧色调 + 背景色），以短促的爆发形式钉在一段 roll 上。
- **Reach for it when（何时选用）** —— 一段**密集、打击感很强的 roll / 加花**，外加一个你想让它在几个小节里用纹理频闪的单词。（在 `assets/` 下自带纹理遮罩 PNG。）
- **Best span（最佳时长）** —— **1.2-3.5s**；频闪疲劳来得很快，所以上限约 4 秒，然后切到一个更干净的系统。
- **Params（参数）** —— `markText`、`fontStyle`、`markScale`、`idleColor`、`idleInk`、`frames`、`strobePlan`、`decor`、`duration`

### intro-kinetic-cascade

- **What（是什么）** —— 一句话被排成一连串大号编辑风格的**短语**（每个短语都是一张堆叠式海报，其中一个 hero 词被放大），在各自的锚点上逐词显现，短语之间硬切，最后在一个滑入的短语上达到高潮，同时带着一个可替换的、会响铃晃动的**图标**（铃铛 / 光标 / 闪光 / emoji / SVG）。
- **Reach for it when（何时选用）** —— 一段**开场 / 开篇陈述**：一句要以大字逐词落地的短句，在一个关键词 + 一个图标上达到高潮。中等或更高的能量，网格稳定。
- **Best span（最佳时长）** —— **3.5-7s**，容纳 2-4 个短语节拍；如果这段陈述需要更多时间，就把下一个分句做成一个新的 group。
- **Params（参数）** —— `theme`、`icon`、`phrases`、`climax`

### logo-split-lockup-pulse

- **What（是什么）** —— 一个在中心拼合的两段式标志向左右分开，打开一道缝隙，每个 onset 长出一个词，在中间形成文字 lockup（关键词落在重拍的 surge 上），在一下打点上啪地合拢，然后随节拍脉动。
- **Reach for it when（何时选用）** —— 一段短的 **logo / 品牌 sting**（不是打出来的一句话）：快速密集的 onset + 一段可以跟着脉动的持续 roll 底子，再加一个左右包夹的标志。
- **Best span（最佳时长）** —— **2-4s**；**>4.5s** 时读起来就像一个被拉得太长的 sting。之后接一个单独的定格 lockup / 下一个创意 group。
- **Params（参数）** —— `bgColor`、`markColor`、`textColor`、`leftMark`、`rightMark`、`word1`、`word2`、`word3`、`word4`

### poster-tile-mosaic

- **What（是什么）** —— 一幅由大小不一的彩色瓦片紧密拼成、铺满画面（互不重叠）的**马赛克**，由一组可互换的、卡节拍的操作驱动：错开的入场 / 退场、锁定的全局重新着色、蛇形填充 + overlay。
- **Reach for it when（何时选用）** —— 有许多离散的、可以逐个安放的 onset（每次瓦片移动都对应一下打点），并且有几个你想用不同方式表现的子阶段（累积 → 在 roll 上重新着色 → 先填满再 drop）。这种密集段落最好作为**一个**丰富的瓦片程序来撑住，而不是拆开。
- **Best span（最佳时长）** —— **4-7s**，只有当程序有清晰的子阶段时才能到 **8s**。如果音乐切换了体系，即使瓦片系统还能继续，也要拆开。
- **Params（参数）** —— `bgColor`、`tiles`、`bands`、`gap`、`showText`、`labels`、`program`

### roll-flipbook-word-cycle

- **What（是什么）** —— 一段踩镲 roll 驱动一个居中的单词，每个十六分音符就在一个单词列表里翻一次；可选地让这种闪动最终收束，锁定到一个最终短语上。
- **Reach for it when（何时选用）** —— 一段**快速、持续填充的 roll**（每分钟数百下打点，约为十六分音符），并且没有单一可读的信息 —— 用一本飞速循环的单词翻页书把这段 roll 填满。
- **Best span（最佳时长）** —— **1.2-3.8s**，一段 roll 进入一次收束。两段 roll，或者两段 roll 之间有一个 drop，就意味着两个 group。
- **Params（参数）** —— `bgColor`、`textColor`、`accentColor`、`flipWords`、`resolveText`、`periodChar`

### split-anchor-word-slot

- **What（是什么）** —— 左侧是一列定格的锚点栏，由固定单词的行组成，右侧是一个撕纸效果的单词槽盒子，由一组卡节拍的操作驱动：锚点锁入、槽内单词组循环（进 / 出 + 逐行颜色）、整个场景的背景翻转、逐拍抖动、盒子放大的退场擦除。行数 + 翻转次数都是数据。
- **Reach for it when（何时选用）** —— 一段短小的段落，有一个**定格的核心概念**（一个要锚定在左侧的品牌 / 名字）**并且**有一串 onset 在右侧弹出一个个单独的词，外加一段可以骑着做抖动的密集段落，以及一个可以擦除退场的强重拍。
- **Best span（最佳时长）** —— **3-6s**；超过约 6.5 秒，固定的锚点就会变得陈旧，除非右侧的槽位进入一个新的 group / 程序。
- **Params（参数）** —— `bgColor`、`anchors`、`theme`、`showText`、`program`

### typewriter-phrase-keyword-shuffle

- **What（是什么）** —— 单词按每个 onset 一个的节奏打出来，拼成一个短语，然后其中一个关键词随节拍轮换字体，而其余一切都纹丝不动。
- **Reach for it when（何时选用）** —— 网格稳定，并且有**连续的 onset 流**（没有荒漠）：先打出一个短语，再让一个关键词轮换字体。它是 `held-message-living-field`（那个需要 onset 荒漠）的反面。
- **Best span（最佳时长）** —— **2.5-5s**；如果这个短语没法在约 5 秒内完成打字和轮换，就减少单词，或者把这句话拆到几个 group 里。
- **Params（参数）** —— `bgColor`、`textColor`、`accentColor`、`lead1`、`lead2`、`lead3`、`keyword`、`periodChar`
