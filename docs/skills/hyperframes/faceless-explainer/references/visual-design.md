<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/faceless-explainer/references/visual-design.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 视觉设计 —— faceless-explainer 的逐帧镜头方法

> 这是 **Step 4（帧视觉设计）** 背后的方法。你（编排者）读它，是为了**就地充实 `STORYBOARD.md` 的各帧** —— story-design 已经写好了骨架（每一帧的 `scene`、`voiceover`、`transition_in`、叙事字段，以及可选的一个候选蓝图 id）；你补上每一帧**看起来什么样、怎么动**。你为每一帧写的单元是一个**带时间码的镜头序列** —— 一个贯穿整段时长被调度的镜头，而不是一张静态幻灯片。你**不写 HTML**（那是 frame worker 的事）。因为这是**无人出镜**讲解视频，**每一个视觉元素都是自创的** —— 字体排版、抽象图形、图示、数据可视化 —— 所以你是在**设计**视觉元素，而不是挑选抓取来的素材（没有 `capture/` 可读）。`frame.md` 是你按角色取用的色板 / 字体真相。布局是本文件里的一套精简词汇（下面的**布局**一节），在每个 Scene 里就地写明；运动词汇 + 运动准则 + seek 安全核心 → `motion-language.md`；经过验证的形状 → `../../hyperframes-animation/blueprints-index.md` + `blueprints/<id>.md`；具体规则在 Step 5 从本 skill 本地的 `../../hyperframes-animation/rules/` 解析。想在这里加色彩理论或一条通用字体规则？放错地方了 —— 应该放进 `frame.md` + `hyperframes-creative`。

## 单元是一个带时间码的镜头序列

一帧的视觉层是**一串按旁白节奏排布的时间窗口**，而不是一袋效果标签。读起来像 PowerPoint 的那种失败是**前置堆砌**：agent 在前 ~25% 就把整张画布急匆匆地堆上屏幕，然后它就那么待着。一个**对着 VO** 写的带时间码的镜头序列让这种事不可能发生：每个窗口写明屏幕上有什么、什么在动，并且**旁白说到之前什么都不出现。** 在讲解视频里，展开的过程*本身就是*教学 —— 公式一项一项拼起来、图示多出一层、计数跳到那个统计数字上。让搭建过程*本身就是*信息。

把每一帧写成几个由口播台词提示的窗口：

```
Scene 1 (0.0–Xs):  only what the VO is saying at t=0 enters — never the whole canvas
Scene 2 (Xs–Ys):   the next piece reveals as the VO names it (a line / layer / node / stat)
  …                one window per spoken cue — as many or as few as the line calls for
Scene N (…–end):   content has resolved; hold the read (stillness; subtle jitter at most)
```

- 每一行 `Scene` 写明**屏幕上有什么**、**这个窗口里什么在动**，以及**它放在哪里**（布局，就地写）。时间是贯穿这一帧 `duration` 的真实秒数。
- **让揭示跟随旁白的节奏；绝不前置堆砌。** 这是核心的反 PowerPoint 机制（→ `motion-language.md` Part 2 Rule 2）。t=0 时只展示 VO 当时正在说的内容；之后的每一块 —— 一行字、一层、哪怕是一个 h1 —— 都**在 VO 说到它时**再揭示，把揭示铺开在整个镜头里，尤其是**后 ~50%**。**窗口数 = 这句台词需要的口播提示点个数** —— 两拍的台词就是两个窗口，五项的列举就是五六个。**没有固定数量，也没有必须的"中段"**；唯一的罪过是一上来就把所有东西倒出来。（**无声**帧 —— 一张图示自己拼装起来、一个演算例子动起来 —— 按节拍而不是 VO 来安排揭示的节奏；同样的纪律，只是没有口播提示。）
- **以一个停住的阅读时刻收尾。** 内容一旦落定，就停住让人读 —— **宁可静止，也不要糟糕的运动**：不要强行的摄影机漂移，不要偷懒的呼吸，不要后半段的平移 / 推近；最多用一个细微抖动维持活力（→ `motion-language.md`）。在短镜头里，最后一次揭示和停留是**同一个窗口** —— 停留不是一个单独的必备段落。只有最后一帧有真正的出场；其他每一帧的出场都是 harness 的转场（story 的 `transition_in`）。
- 一个**有意停住**的帧 —— 内容已经揭示完，现在静止地供人阅读 —— 是正当的，而且往往是对的（一个高潮、一个喘息、转折前一拍停住的张力）。失败从来不是"太静"；而是**前置堆砌然后冻住**（所有东西在 ~25% 前就倒出来，没有任何东西卡着 VO 提示）。为了节奏，刻意地安排停住的段落节拍，让视频不至于从头忙到尾（在 `## Video direction` 里分配它们）。揭示节奏 + 停留 + 闲置预算 → `motion-language.md`。

## 挑形状 —— 实例化一个蓝图

不要每个镜头都从零自创。这一帧的**角色**（它的 `type` / `beat`）指向一个经过验证的形状：

1. **把角色匹配到一个蓝图。** 打开 `../../hyperframes-animation/blueprints-index.md`，在**角色→蓝图菜单**里找到这一帧的角色，挑出意图契合这一拍的蓝图（story 可能已经点了一个候选 id —— 确认或推翻它）。读那个 `blueprints/<id>.md`：它是一份简短的、与领域无关的、**带 `[slots]` 的带时间码镜头模板**，并且有一个有名字的**标志性动作**（让这个形状之所以成为它自己的那个东西 —— SVG 圆环、往里推穿、原地词元替换）。

2. **用这一帧自创的内容实例化它的 `[slots]`** —— 三种姿态：
   - **Reproduce（复现）** —— 蓝图契合这一拍，你的内容能干净地映射到它的槽位上。用这一帧的词 / 形状 / 统计数字填满每一个 `[slot]`，并遵循它的 Scene 时间安排。写出由此得到的 Scene 行。
   - **Adapt（改编）** —— *结构*契合，但内容 / 元素数量 / 表面不契合（或者你想要一个更新鲜的表面，避免模板化）。用一行写明**保留什么 / 改什么**，然后写出改编后的 Scene 行。你可以扩展或变化；但**绝不能**丢掉**标志性动作**（丢了它就说明你挑错了蓝图），并且要让揭示保持**跟随 VO 的节奏** —— 绝不能把这个形状压扁成一次性的前置倾倒。
   - **Compose（自行编排）** —— 没有蓝图契合这一拍。用 `motion-language.md` 里的**运动词汇**搭建这个镜头：仍然要让揭示在整个镜头里跟随 VO 的节奏，绝不在 t=0 一下子全放出来。标记为 `blueprint: compose`。

3. **保留标志性动作。** 无论哪种姿态，蓝图的标志性动作（在它的文件里写明了名字）都是这个镜头的脊梁 —— 它通常落在镜头的关键揭示上。把它贯彻下去。

蓝图自己的 Scene 行、运动词汇和 `rule mapping` 是你的原材料；你是在挑一个形状，并把这一帧自创的内容浇铸进去，而不是照抄一份工程规格。

## 你为每一帧添加什么

story-design 的 `## Frame N` 块已经承载了叙事。你在后面追加镜头。story 的 `scene` / `voiceover` / `transition_in` / 角色字段保持原样不动。

```
## Frame 3 — How interest compounds
- scene: a snowball rolls downhill, gaining a labeled ring each turn   ← refine only if it could read sharper
- voiceover: "…"            ← story's; leave it
- transition_in: crossfade  ← story's; leave it
- type: feature_showcase    ← story's
- persuasion: Concretization + progressive disclosure
- beat: comprehension
- blueprint: dataviz-countup (Adapt)   ← you add: the id you instantiated (or "compose")
- focal: the snowball                  ← you add: the INVENTED hero element of this beat
- roles: snowball = foreground subject · hill = background gradient (dim ~40%) · ring labels = supporting   ← you add: role per invented element
- sfx: whoosh-soft, tick               ← you add: the sound the beat wants (fetched + mounted at root; never yours to embed)

Adapt: keep the count-up-ring signature; the trend chart becomes the snowball's labeled rings climbing.
Scene 1 (0.0–1.2s): solid hill gradient (dim ~40%); the snowball seats upper-left, a circular progress ring + bold center number anchor it — Centered template, ~50% of frame. Slow push-in runs underneath.
Scene 2 (1.2–3.4s): as the VO names each turn, the snowball rolls down and gains one labeled ring per turn (layer-reveal); a small total ticks up beside it (the count-up reveals on its spoken cue, not at t=0). Asymmetric 60/40, 3 depth layers.
Scene 3 (3.4–5.0s): land the final ring emphasis dead-center, accent glow blooms behind it and holds; the total reads clean and STILL — no continuing push, no breathing (a held beat beats bad motion). The stillness reads against the prior motion.
```

这些轻量标签：

- **`blueprint:`** —— 你实例化的那个 id（带 `(Reproduce)` / `(Adapt)`），或者 `compose`。每帧一个 id。
- **`focal:`** —— 哪个**自创**元素是这一拍的 hero（一个 hero 词、一个图示节点、一个图表数据系列、一张新造术语卡片）。
- **`roles:`** —— 每个自创元素的角色：`foreground subject`（视线落点，文字排在它周围）· `background`（满版出血的底 / 渐变 / 网格，压暗 30–50%）· `supporting`（标签、次要形状、氛围层）。既然没有抓取来的素材，你是在**设计**这些元素，而不是挑选它们 —— 让它们**少而承重**。如果有用户提供的 `public/<basename>` 图片（在 story 的 `asset_candidates` 里点了名），把它当作 `focal` cutout 或一个 `background` 来处理。
- **`sfx:`** —— 写出这一拍想要的声音（重击用一个撞击声，推近用一个呼啸声，计数用一个滴答声）。音频脚本的 `fetch-sfx` 环节会去取回它，组装器把它挂在根节点上 —— 你只负责**命名**它，绝不嵌入 `<audio>` 元素。

**布局在每一行 Scene 里就地写明** —— 把模板、密度、纵深和层级作为"它放在哪里"的一部分写出来（`Centered, ~50% of frame`、`asymmetric 60/40, 3 depth layers`），取用下面的**布局**词汇；绝不写 px / scale / 阴影配方（那些由 worker 写）。

**运动在每一行 Scene 里就地命名** —— 从 `motion-language.md` 的词汇里写出运动名（`per-word reveal`、`layer-reveal`、`count-up`、`glow blooms`），并让它在一条长尾曲线上收住（默认 `power3` —— 流畅胜过弹跳；见 `motion-language.md`）。绝不写 ease 曲线 / 毫秒 / 错开（这些在 Step 5 从本 skill 本地的 `../../hyperframes-animation/rules/` 解析）。

## 自创视觉 —— 图示、字体排版、数据可视化

这是一支**无人出镜**讲解视频：这一帧的 hero 是你**设计**出来的东西，不是一张截图。有三种一等公民的处理方式，每一种都根据这一帧的 `narrativeRole` / `keyMessage` / `scene` 自创：

- **字体排版 / 动态文字** —— hero 词、新造术语、一个数字、一段简短的列举。把文字当作主体：满版尺度、字重对比、一个被强调的术语。最适合 hook、概念名、收获。在无人出镜讲解视频里，**文字往往就是主要视觉** —— 要狠狠用好字号阶梯。
- **抽象图形** —— *体现*这个想法的形状、场域、路径、几何（雪球、聚光灯、是台阶而不是悬崖）。把脚本点出的那个隐喻搭建出来；不要用泛泛的散景来装饰。
- **图示 / 数据可视化** —— 节点 + 连线、一张图表、一条数轴、一个公式、一张流程图。搭建过程（每个部分卡着节拍出现）就是教学 —— 把它设计成在几个 Scene 之间逐步拼装，而不是整个一下子出现。

让自创的 hero **占满画面的 40–60%** —— 图示要大到能读清它的标签，hero 词接近满版出血。不要把这唯一一个被设计出来的元素缩成空白周围的装饰。

## 布局 —— 在每个 Scene 里就地命名

把每个 Scene 的布局作为"它放在哪里"的一部分写出来。**如果蓝图已经暗示了一种构图**（一个围绕中心的圆环、宽画布上的几个站点、从相对两翼进来的两张卡片），以它为准 —— 直接描述它；下面的词汇是给**自由编排**或泛泛的段落节拍用的，不是一份你必须从中挑选的菜单。绝不写 px / scale / 阴影（那是 worker 的事）。一帧的布局可以在它的几个 Scene 之间**演变**（Scene 1 居中的 hero → Scene 2 重新排成网格）。**每支视频至少用 3 种不同的构图**，免得读起来像一个反复套用的模板；绝不连续两次用同一种构图。

- **构图词汇** —— 居中（hero / 高潮）· 三分法 · 分屏（对比）· 分层纵深（沉浸式开场 / 氛围）· 不对称 60/40 或 70/30（编辑排版感 —— 一张密集的图示 + 一条说明栏）· 三联（三个条目 / 三段式落点）· 通栏条带（一条数轴 / 时间线 / 列举）。在整支视频里变换构图，免得读起来像一个反复套用的模板 —— 让段落节拍来决定，而不是凑配额。
- **密度** —— 主要视觉 ≥ 画布的 40%；≥ 3 个纵深层次（背景 + 中景 + 前景）；绝不让一小簇东西孤零零地漂在空白里。开场和收尾容易显得空 —— 加上环境层（双径向光晕、低不透明度扫描线、发丝细网格、品牌色氛围光）。眯眼测试：模糊之后你仍然能一眼挑出头号元素。
- **层级** —— 组合以下至少 2 项：尺寸（3:1）/ 字重（800 对 400）/ 对比度 / 位置（上三分之一是黄金位置）/ 运动，让一个元素明确占主导。一个标题如果只是*更大*（与正文共用字重 / 颜色 / 间距），读起来就很弱。
- **纵深** —— 叠用以下 2–3 项：尺寸、模糊、不透明度渐变、重叠、阴影叠层、推近时的反向缩放。
- **不要出现**：导航栏、页脚、滚动条、真实的光标 / 浏览器外框、用来顶替被设计出来的隐喻的泛泛装饰形状、漂浮的散景 / 紫蓝色"AI"渐变（默认 AI 审美的陈词滥调，禁用）。无人出镜讲解视频没有真实界面 —— **只有**当话题本身就是关于某个界面、并且这一帧有意重建它时，界面 mock 才是对的。

## 竖屏与方屏（非 16:9 画布）

区域、密度、层级和纵深这些原则全都仍然适用；变的是**画面比例**，宽画面的布局不能直接移植到高画面里 —— 从一开始就按分镜的 `format` 来设计，绝不先按横屏规划再"裁切"。

- **纵向堆叠，而不是并排** —— 分屏 / 三联 / 60-40 变成上下堆叠、纵向的步骤列表、堆叠的条带。方屏只在两个紧凑条目时才能容忍并排。
- **垂直中心随画布移动** —— 把居中的 hero 锚定在 **y ≈ 0.42 × 高度** 附近（竖屏 ≈806，方屏 ≈454），而不是固定的 540。
- **字号更大，每行字更少** —— 窄画面里长标题折行会很难看；优先用短的动态文字行、更大的字号、更多的纵向节奏。
- **适合搬到竖屏的：** 居中、分层纵深、通栏条带（堆叠的条带）、纵向三分法。**避免**宽的分屏和三联 —— 改用堆叠的等价形式。

## `## Video direction` —— 不变量只写一次

整支视频共用一种外观和一套运动语法。在 `STORYBOARD.md` 顶部写**一次** **`## Video direction`** 块，让每一帧都继承它，每帧的 Scene 行只承载**增量**。这个块是承重的 —— 正是它把许多独立的镜头绑成一部影片。**保留它。**

- **色板系统** —— 来自 `frame.md`：哪些角色对应哪些色相。绝不自创。
- **运动语法 + 揭示模型** —— 长尾 ease（默认 `power3`，流畅胜过弹跳）+ 每一帧都遵循的**跟随 VO 节奏的揭示**模型（每一块都在它的口播提示点揭示；绝不前置堆砌）+ 停留期间什么可以保持活动（最多细微抖动；不要偷懒的呼吸）（→ `motion-language.md`）。
- **节奏 / 停住帧的分配** —— 点名**停住 / 喘息的帧**（通常在高潮或故事的转折之前），让视频的能量有起伏：大多数帧跟随 VO 揭示，少数几帧静止停住（停住供人阅读胜过糟糕的运动；这是反单调的纪律；→ `motion-language.md`）。
- **负面清单** —— 永远不出现的东西：素材包禁用的不合品牌的质感 / 效果，**再加上两种运动失败模式** —— 幻灯片（前置堆砌然后冻住）和屏保（所有东西各自独立地漂浮）（→ `motion-language.md`）。

**不要**每一帧都重复这些 —— 在每一帧里重述视频级的规则，正是这一层要防止的那种臃肿。

## 色板与字体 —— 来自 `frame.md`，绝不自创

- **色板** —— `frame.md`（采用的那个素材包）是颜色真相；按帧应用它的各个角色。通用基础（一个强调色、带色调的中性色、避免纯 `#000`/`#fff`）→ `hyperframes-creative/references/house-style.md`。
- **字体** —— 字体通过 `frame.md` 的字体 token 解析；**按角色**引用它们（display / body / mono / 素材包的字号阶梯），绝不写原始的字体族或 px。通用的字体排版功夫（内嵌字体、深色背景的视觉补偿、`tabular-nums`）→ `hyperframes-creative/references/typography.md`。在无人出镜讲解视频里，文字往往就是主要视觉 —— hero 词、新造术语、动态列举 —— 所以要狠狠用好字号阶梯。

## 字幕带避让区（规划侧）

画布底部 ~17% 留给字幕胶囊。把每一帧的内容都规划进**顶部 ~83%**，让重要的东西都不落在这条带里（像素级的截断由 worker 强制执行；你负责规划布局）。启用字幕时，主要内容和关键视觉**以字幕带顶边为上限**，居中的 hero 锚定在 **y ≈ 0.42 × 高度**（横屏 ≈454，竖屏 ≈806），而不是画布中点；背景 / 氛围 / 表面层不受此限，可以保持满版出血。即使字幕关闭也照此执行 —— 为了底边的一致性。

## 细节在哪里

| 想了解…… | 读 |
| --- | --- |
| 经过验证的形状 + 角色→蓝图菜单 + 怎么挑 | `../../hyperframes-animation/blueprints-index.md` → `blueprints/<id>.md` |
| 运动 —— 镜头模型、词汇、停留、闲置预算、静止、seek 安全 | `motion-language.md`（本地） |
| 布局 —— 构图、密度、纵深、层级、自创视觉、字幕带 | 本文件里的**布局** + **自创视觉**两节 |
| 具体的 ease / 毫秒 / 错开 + 规则配方正文（Step 5） | 本地 `../../hyperframes-animation/rules/`（frame worker 读它；你不读） |
| 色板 + 字体 token | 项目的 `frame.md`；基础 → `hyperframes-creative` 的 `house-style.md` / `typography.md` |
| "制作出来的，而不是生成出来的"前景密度 | `hyperframes-creative/references/video-composition.md` |
| 帧内的切 / 接缝（zoom-through · cut-the-curve · waterfall） | `cut-catalog.md`（worker 在 composition 内部构建它们） |
| 转场 | `transition_in` 归 story-design 管；你不碰它 |

## 收尾之前 —— 检查清单

- **`## Video direction`** 在顶部写了一次（色板 · 运动语法 + 镜头模型 + 闲置预算 · 静止的分配 · 负面清单，含两种失败模式）；每帧的条目是增量，不是重述。
- 每一帧都是一个**带时间码的镜头序列**，有贯穿其 `duration` 的真实秒数窗口 —— 不是一袋标签。
- **没有任何帧前置堆砌** —— t=0 时只入场 VO 正在说的内容；之后的每一块都在它的口播提示点揭示，铺开在后 ~50%。窗口数跟随 VO（无声帧则跟随节拍），而不是一个固定数字。
- 每一帧都写了一个 **`blueprint:`** id（Reproduce / Adapt）或 `compose`；Adapt 写明了保留 / 改动，并且**保留了标志性动作**；没有任何东西被压扁成一次性的前置倾倒 —— 揭示始终跟随 VO 的节奏。
- **停住的帧是刻意的** —— 在 Video direction 里为节奏而分配；停住供人阅读没问题（宁可静止，也不要糟糕的运动），但任何一帧都不能前置堆砌然后冻住。
- 每一帧都写明了它**自创的** `focal` + 逐元素的 `roles`（foreground / background / supporting），保持少而承重。
- 自创的 hero 占满画面的 40–60%（图示大到能读清，hero 词接近满版出血）—— 而不是缩成空白周围的装饰。
- 布局在每个 Scene 里**就地**命名（模板 / 密度 / 纵深 / 层级 —— 用这里的**布局**词汇）；运动在每个 Scene 里**就地**用词汇命名（`motion-language.md`）。没有 px / ease 曲线 / 毫秒 / JS。
- 内容规划在顶部 ~83%（字幕带留空）。
- 色板 / 字体按角色从 `frame.md` 取用 —— 没有任何自创。
- 你没写任何 HTML；每一个视觉元素都是自创的（没有抓取来的素材）。
