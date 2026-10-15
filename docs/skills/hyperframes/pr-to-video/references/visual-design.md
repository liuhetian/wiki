<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/pr-to-video/references/visual-design.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 视觉设计 —— PR-to-video 的逐帧镜头方法

> **Step 4（帧的视觉设计）** 背后的方法。你（编排者）读它，是为了**就地充实 `STORYBOARD.md` 的各帧** —— story-design 已经写好了骨架（每一帧的 `scene`、`voiceover`、`transition_in`、叙事字段，以及可选的候选 blueprint id）；你补上每一帧**长什么样、怎么动**。你为每一帧写的单元是一段**带时间码的镜头序列** —— 一个贯穿整个时长去导演的镜头，而不是一张静态幻灯片。你**不写 HTML**（那是 frame worker 的事）。PR 视频**大部分是自创的** —— 文字排版、number-lockup、机制示意图 —— 所以这些元素由你来**设计**；两个例外是**代码段落节拍**（一个现成的 `code-*` registry block）和**片尾致谢**（真实的贡献者头像），下文都会讲到。`frame.md` 是你按角色取用色板 / 字体的唯一依据。布局是本文件里的一套精简词汇（下面的**布局**一节），在每个 Scene 内联说明；动效词汇 + 动效准则 + seek 安全的核心 → `motion-language.md`；现成的形状 → `../../hyperframes-animation/blueprints-index.md` + `blueprints/<id>.md`；`code-*` block → `code-vocabulary.md`；具体的 rule 在 Step 5 从本 skill 本地的 `../../hyperframes-animation/rules/` 解析。想在这里加色彩理论或一条通用字体规则？放错地方了 —— 应该放进 `frame.md` + `hyperframes-creative`。

## 单元是一段带时间码的镜头序列

一帧的视觉层是**一串与旁白节奏对齐的时间窗口**，不是一袋效果标签。读起来像 PowerPoint 的那种失败是**前置堆砌**：agent 在前约 25% 就把整块画布赶上屏幕，然后它就那么待着。一段**对照 VO** 写出来的带时间码镜头序列让这种情况不可能发生：每个窗口都写明屏幕上有什么、什么在动，并且**在旁白念到之前，什么都不出现。**在 PR 讲解视频里，展开过程往往*就是*揭示本身 —— diff hunk 逐字打出、before→after 的变形、请求重试示意图在运行、影响数据落定。让构建过程*本身*成为信息。

把每一帧写成几个由口播那句话提示的窗口：

```
Scene 1 (0.0–Xs):  only what the VO is saying at t=0 enters — never the whole canvas
Scene 2 (Xs–Ys):   the next piece reveals as the VO names it (a file chip / the hunk / a node / a stat)
  …                one window per spoken cue — as many or as few as the line calls for
Scene N (…–end):   content has resolved; hold the read (stillness; subtle jitter at most)
```

- 每一行 `Scene` 写明**屏幕上有什么**、**这个窗口里什么在动**，以及**它在哪儿**（布局，内联写）。时间是这一帧 `duration` 范围内的真实秒数。
- **让揭示节奏对齐旁白；绝不前置堆砌。**这是反 PowerPoint 的核心机制（→ `motion-language.md` 第 2 部分规则 2）。在 t=0 只展示旁白此刻正在说的内容；每多一样东西 —— 一行字、一个文件标签、hunk、一个数据 —— 都**在 VO 念到它时**才揭示，把揭示分散到整个镜头中，尤其是**后约 50%**。**窗口数 = 这句话所需的口播提示点数。**这里**没有固定的数目，也没有必须的"中段"**；唯一的错误是一开头就全倒出来。
- **以一个停留的阅读时刻收尾。**内容一旦落定，就停住让人读 —— **宁可静止，也不要糟糕的动效**：不要硬加镜头漂移，不要偷懒的呼吸，后半段不要平移 / 推近；至多用轻微抖动保持生气（→ `motion-language.md`）。只有最后一帧有真正的退场；其他每一帧的退场都是 harness 的转场（故事的 `transition_in`）。
- 一个**有意停留**的帧 —— 内容已经揭示完毕，现在静静地供人阅读 —— 是合理的，而且往往是对的（一个高潮、一次喘息）。失败从来不是"太静了"；而是**先前置堆砌再冻住**。为了节奏，有意识地安排停留的段落节拍（在 `## Video direction` 里分配它们）。

## 挑形状 —— 实例化一个 blueprint

不要每个镜头都从零自创。这一帧的**角色**（它的 `type` / `beat`）指向一个现成的形状：

1. **把角色对应到一个 blueprint。**打开 `../../hyperframes-animation/blueprints-index.md`，在**角色→blueprint 菜单**里找到这一帧的角色，挑选意图与这个段落节拍相符的 blueprint（故事可能已经点名了一个候选 id —— 确认或推翻它）。读那份 `blueprints/<id>.md`：它是一份简短的、与领域无关的、**带 `[slots]` 的时间码镜头模板**，并有一个具名的**招牌动作**。

2. **用这一帧的内容实例化它的 `[slots]`** —— 三种姿态：
   - **Reproduce（复现）** —— blueprint 契合这个段落节拍，你的内容能干净地映射到它的槽位上。填满每一个 `[slot]`，并遵循它的 Scene 时间。
   - **Adapt（改编）** —— *结构*契合，但内容 / 表面不契合。用一行写明**保留什么 / 改动什么**，然后写出改编后的 Scene 行。你永远不能丢掉**招牌动作**，并且揭示要保持**与 VO 节奏对齐**。
   - **Compose（组合）** —— 没有 blueprint 契合这个段落节拍。用 `motion-language.md` 里的**动效词汇**构建这个镜头：揭示仍然要与 VO 节奏对齐。标记为 `blueprint: compose`。

3. **保留招牌动作。**无论哪种姿态，blueprint 的招牌动作都是这个镜头的脊梁 —— 把它贯穿到底。

> **代码段落节拍**是唯一不为核心元素挑选 blueprint 的地方 —— `code-*` block *本身就是*形状（见下文 **PR 代码段落节拍**）。你仍然要为周围的表面写 Scene 序列。

## 你给每一帧补什么

story-design 的 `## Frame N` 块已经带有叙事。你在后面追加镜头。故事的 `scene` / `voiceover` / `transition_in` / 角色字段保持不动。

```
## Frame 4 — The retry fix
- scene: the request() retry hunk lands on the navy code surface   ← refine only if it could read sharper
- voiceover: "…"            ← story's; leave it
- transition_in: crossfade  ← story's; leave it
- type: diff                ← story's (PR-native)
- persuasion: Show-the-change
- beat: clarity
- blueprint: compose        ← code beats compose the surround; the block owns the code motion
- focal: code-diff — the request() retry block, ~6 lines   ← you add: the code-* block IS the focal
- roles: code surface = foreground subject · file header = supporting · dim grid = background
- sfx: keyclack-soft, soft-confirm

Scene 1 (0.0–1.0s): the navy Code Surface window seats in (scale-in + soft shadow), file header "client/request.ts" types on — Centered, ~60% of frame. Slow push-in underneath.
Scene 2 (1.0–3.2s): the camera settles onto the hunk; the `code-diff` block runs its own before→after on its cadence (the worker fits it to the duration) — you do not re-specify the code motion.
Scene 3 (3.2–4.5s): a coral underline draws on the changed line as the VO names it; a `+6/−2` count-up ticks beside the header; settles and holds STILL.
```

这几个轻量标签：

- **`blueprint:`** —— 你实例化的 id（带上 `(Reproduce)` / `(Adapt)`），或者 `compose`。每帧一个 id。
- **`focal:`** —— 对于概念 / 机制段落节拍，是**自创的** hero（一个 hero 词、一张示意图、一个 number-lockup）；对于**代码段落节拍**，是那个 **`code-*` block**（写明 block + hunk）；对于**片尾致谢**，是那一排头像。
- **`roles:`** —— 每个元素的角色：`foreground subject` · `background`（满版出血，压暗 30–50%）· `supporting`。自创的元素由你**设计**；唯一的真实素材是致谢用的 `assets/<login>.png` 头像（在故事的 `asset_candidates` 里点名）。
- **`sfx:`** —— 写明这个段落节拍想要的声音；音频脚本的 `fetch-sfx` 去检索它，组装器把它挂载在根节点上 —— 你只负责**命名**，绝不嵌入 `<audio>`。

**布局 + 动效在每一行 Scene 里内联说明** —— 把模板 / 密度 / 纵深作为"它在哪儿"的一部分写出来，并用 `motion-language.md` 词汇里的名字写出运动；让它在一条长尾曲线上落定（默认 `power3`）。绝不写 px / 缩放值 / ease 曲线 / 毫秒数（那些由 worker 来写）。

## PR 代码段落节拍 —— 点名一个 `code-*` block

对于 `diff` / `before_after` / 代码段落节拍，这一帧的核心是一个**现成的 `code-*` registry block**，而不是一个自创的 HTML 视觉 —— 这是"每个视觉都自创"的唯一例外。

- **在 `scene` + `focal` 里写明 block。**挑一个契合这个段落节拍的（before→after = `code-diff`；重构 / 重命名 = `code-morph`；新代码写出来 = `code-typing`；聚光照亮一行 = `code-highlight`；走查一个长文件 = `code-scroll`；hero 式揭示 = `code-3d-extrude` / `code-particle-assemble`）。完整对应关系 → `code-vocabulary.md`。也要写明 hunk（"`request()` 重试代码块，约 6 行"）。这个 block 就是 `focal`；Step 5 的 worker 安装它，并用真实的 diff 填充它。
- **block 掌控代码动画；你的各个 Scene 编排周围的 Code Surface。**block *本身就是*展开段落节拍（diff / 打字机 / 变形按它自己的节奏播放 —— worker 只是让它适配这一帧的 `data-duration`，免得长代码片段超时）。你的 Scene 窗口移动的是它周围的 code-editorial **Code Surface**：海军蓝窗口落位、文件标题栏逐字打出、镜头落到 hunk 上、一个 `+N/−M` 的 `count-up`、一条珊瑚色下划线在落定的那一行上画出来。把这些运动内联写出来；**不要重新描述代码动画本身。**代码段落节拍通常是 `blueprint: compose`（block 就是形状）。

## PR 机制段落节拍 —— 自创一个行为的动画示意图

**`mechanism`** 帧是**展示行为**的段落节拍 —— 是对一支只展示代码 + 文字的视频的解药。它的 `focal` 是一个**自创的动画示意图**，演出这次变更在运行时*做了*什么（请求在重试、缓存在填充、串行→并行、竞态被解决）—— **不是** `code-*` block，**也不是**标题。

- **在 `scene` + `focal` 里写明行为 + 示意图。**例如 `scene: "animate the request lifecycle — fire → 500 → backoff → retry → 200, invented SVG flow"`；`focal: the request-lifecycle flow`。合适时就用 `flowchart` / `flowchart-vertical` / `data-chart` registry block（在 `scene` 里点名它们，让 Step 5 预装）；否则就由 worker 用 code-editorial 的基本元素，以 SVG / HTML / GSAP 构建。
- **构建过程就是镜头序列。**和代码 block（自己掌控动画）不同，示意图由你在各个 Scene 窗口中编排 —— 泳道 / 节点画出来（Scene 1），随着 VO 念出每一步，流程跑起来 / 泳道分叉 / 前沿推进（中间的各个 Scene），最终状态 + 一处珊瑚色强调落定（最后一个 Scene）。绝不让它入场后就冻住。
- **保持在 code-editorial 的奶油色底上，细线墨色。**节点 / 连线 / 泳道用细线墨色画在奶油色上；活动或改动的元素上**一个珊瑚色标记**；等宽字体的标签。不要用海军蓝代码面（那是给代码用的），不要粗重的形状 / 散景。把它规划在上方约 83% 的区域内（字幕避让）。

`mechanism` 帧**不带** `asset_candidates`（它是自创的，和每一个非致谢帧一样）。

## 影响与致谢

- **影响 / 证据** —— 数字（`+1,204 / −318`、涉及的文件数、性能差值）放在 `impact` 帧上，作为一个 **`number-lockup`**（code-editorial 的 Number/Impact 处理方式）：把它写为 `focal`，用一个与 VO 节奏对齐的 `count-up` 揭示它。
- **片尾致谢** —— 可选的 `credits` 帧以真实的 `assets/<login>.png` 头像（在故事的 `asset_candidates` 里点名）作为 `focal`：一排错开入场的头像。这是唯一一个 `asset_candidates` 非空、带有真实素材的帧。

## 自创视觉（非代码段落节拍）

每一个非代码、非致谢的段落节拍（`hook` / `change` / `cta` / 概念）都是**设计出来的**，不是抓取来的。三种一等的处理方式：

- **文字排版 / 动态文字** —— 一个 hero 词、PR 的头条主张、一个数据。把文字当作主体：满版的尺寸、字重对比、一个强调的词。最适合钩子和 cta。
- **抽象图形** —— *体现*脚本所说想法的形状 / 路径 / 几何；不要用泛泛的散景来装饰。
- **示意图 / 数据可视化** —— 上面说的机制示意图、用于性能差值的 `data-chart`、一个 number-lockup。构建过程（每个部件在节拍上出现）就是教学 —— 把它设计成在各个 Scene 中逐步拼装起来。

让自创的 hero **占画面的 40–60%** —— 大到足以阅读；不要把唯一一个设计出来的元素缩小成围着一片空白的装饰。

## 布局 —— 在每个 Scene 内联命名

把每个 Scene 的布局作为"它在哪儿"的一部分说明。**如果 blueprint（或 code-\* block）已经暗示了一种构图，就以它为准** —— 直接描述它；下面的词汇用于自由组合。绝不写 px / 缩放值 / 阴影（那是 worker 的事）。一帧的布局可以在各个 Scene 中**演变**。**每支视频至少用 3 种不同的取景**；绝不连续两次用同一种取景。

- **取景词汇** —— 居中（hero / 高潮 / 单个代码面）· 三分法 · 分屏（before/after、两个表面）· 分层纵深（沉浸式）· 不对称 60/40 或 70/30（一个代码面 + 一条字幕 rail）· 三联（同时三项变更）· 全宽条带（一个文件列表 / 时间线）。让段落节拍来决定，而不是凑配额。
- **密度** —— 主视觉 ≥ 画布的 40%；≥ 3 个纵深层；绝不让一小簇孤零零的东西漂在空白里。开场 / 收尾容易显得空 —— 加上环境层（一张暗淡的网格、低不透明度的扫描线、品牌色的氛围光）。眯眼测试：模糊之后你仍然能挑出头号元素。
- **层级** —— 组合尺寸（3:1）/ 字重（800 vs 400）/ 对比度 / 位置（上三分之一是黄金位置）/ 运动中的至少 2 种，让一个元素明显占主导。
- **纵深** —— 叠加以下 2–3 种：尺寸、模糊、不透明度渐变、重叠、多层阴影、推近时的反向缩放。
- **不要展示**：导航栏、页脚、滚动条、真实的光标 / 浏览器外框、泛泛的装饰性形状、漂浮的散景 / 紫蓝色的"AI"渐变（禁用）。海军蓝代码面只用于代码段落节拍；机制示意图留在奶油色上。

## 竖版与方形（非 16:9 画布）

区域、密度、层级和纵深的原则全都仍然适用；变的是**画幅比例**，宽版布局没法直接移植到竖版里 —— 从一开始就按分镜的 `format` 来设计。

- **纵向堆叠，而不是并排** —— 分屏 / 三联 / 60-40 变成上下堆叠。竖版里代码面几乎占满宽度，可见的行数更少。
- **纵向中心随画布移动** —— 居中的 hero 锚定在 **y ≈ 0.42 × 高度**附近（竖版 ≈806，方形 ≈454），而不是固定的 540。
- **字号更大，每行字更少。** **适合移植到竖版的：**居中、分层纵深、全宽条带；**避免**宽的分屏 / 三联 —— 改用对应的堆叠版本。

## `## Video direction` —— 不变量只写**一次**

整支视频共享一种外观和一套动效语法。在 `STORYBOARD.md` 顶部写**一次** **`## Video direction`** 块，让每一帧都继承它，每帧的 Scene 行只写**差异**。这个块是承重的 —— **保留它。**

- **色板系统** —— 来自 `frame.md`（code-editorial）：哪些角色对应哪些色相。绝不自创。
- **动效语法 + 揭示模型** —— 长尾 ease（默认 `power3`，流畅胜过弹跳）+ **与 VO 节奏对齐的揭示**模型 + 停留期间允许保持什么生气（至多轻微抖动）（→ `motion-language.md`）。
- **节奏 / 停留帧的分配** —— 点名那些**停留 / 喘息的帧**，让视频的能量有变化。
- **负面清单** —— 不符合品牌的质感，**外加两种动效失败模式** —— 幻灯片（先前置堆砌再冻住）和屏保（所有东西各自独立地漂浮）（→ `motion-language.md`）。

**不要**在每一帧里重复这些。

## 色板与字体 —— 来自 `frame.md`，绝不自创

- **色板** —— `frame.md`（code-editorial）是颜色的唯一依据；在每一帧里应用它的角色。通用基础 → `hyperframes-creative/references/house-style.md`。
- **字体** —— 字体通过 `frame.md` 的字体 token 解析；**按角色**引用它们（display / body / mono / 这套字体包的字号阶梯），绝不写原始字族名或 px。代码面和机制示意图的标签用 **mono** 角色。字体排印技艺 → `hyperframes-creative/references/typography.md`。

## 字幕带避让（规划侧）

画布底部约 17% 预留给字幕胶囊。把每一帧的内容都规划在**上方约 83%** 的区域内（像素级的截断由 worker 执行）。启用字幕时，主要内容的下限是字幕带的顶边，居中的 hero 锚定在 **y ≈ 0.42 × 高度**（横版 ≈454，竖版 ≈806）；背景 / 氛围层不受此限，可以保持满版出血。即使关闭字幕也照此执行 —— 保持底边一致。

## 细节在哪里

| 想了解…… | 读 |
| --- | --- |
| 现成的形状 + 角色→blueprint 菜单 + 怎么挑 | `../../hyperframes-animation/blueprints-index.md` → `blueprints/<id>.md` |
| `code-*` block（为代码段落节拍挑选 + 填充） | `code-vocabulary.md`（本地） |
| 动效 —— 镜头模型、词汇、停留、空转预算、静止、seek 安全 | `motion-language.md`（本地） |
| 布局 —— 取景、密度、纵深、层级、自创视觉、字幕带 | 本文件里的**布局** + **自创视觉**两节 |
| 具体的 ease / 毫秒数 / 错开 + rule 配方正文（Step 5） | 本地的 `../../hyperframes-animation/rules/`（frame worker 读它；你不读） |
| 色板 + 字体 token | 项目的 `frame.md`（code-editorial）；基础 → `hyperframes-creative` |
| 帧内切换 / 接缝（zoom-through · cut-the-curve · waterfall） | `cut-catalog.md`（worker 在 composition 内部构建它们） |
| 转场 | story-design 掌控 `transition_in`；你不碰它 |

## 收尾之前 —— 检查清单

- **`## Video direction`** 在顶部写了一次（色板 · 动效语法 + 镜头模型 + 空转预算 · 静止分配 · 负面清单，含两种失败模式）；每帧条目只写差异。
- 每一帧都是一段**带时间码的镜头序列**，在它的 `duration` 范围内有真实的秒数窗口 —— 不是一袋标签。
- **没有任何一帧前置堆砌** —— t=0 时只有旁白正在说的内容入场；后续每一样东西都在它的口播提示点上揭示，分布在后约 50%。窗口数跟着 VO 走。
- 每一帧都写了一个 **`blueprint:`** id（Reproduce / Adapt）或 `compose`；Adapt 保留了招牌动作；没有任何一帧退化成一次性前置倾倒。
- **代码段落节拍**把一个 `code-*` block 写为 `focal`，让 block 掌控代码动画，并且在各个 Scene 里只编排周围的 Code Surface。
- **机制段落节拍**写明了一个**自创的行为动画示意图**（或 `flowchart` / `data-chart`），在 code-editorial 的奶油色底上、带一个珊瑚色标记、贯穿各个 Scene 编排 —— 不是代码 block，也不是文字排版；主体不是一串连续不断的代码面。
- **影响**用 `number-lockup` 配 `count-up`；**片尾致谢**以真实头像作为 `focal`。
- 每个非代码、非致谢的帧都写明了它的**自创** `focal` + 每个元素的 `roles`，数量少且都承担作用。
- 布局 + 动效在每个 Scene 里**内联**命名（没有 px / ease 曲线 / 毫秒数 / JS）。
- 内容规划在上方约 83% 的区域内（字幕带留空）；色板 / 字体按角色从 `frame.md` 取用。
- 你没有写 HTML。
