<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/product-launch-video/references/visual-design.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 视觉设计 —— 产品发布的逐帧镜头方法

> 这是 **Step 4（帧视觉设计）**背后的方法。你（编排者）读它，是为了**原地充实 `STORYBOARD.md` 里的各帧** —— story-design 已经写好了骨架（每帧的 `scene`、`voiceover`、`transition_in`、叙事字段、它的 `asset_candidates`，以及可选的一个候选蓝图 id）；你要补上每一帧**长什么样、怎么动**。你为每帧写的单位是一个**带时间码的镜头序列** —— 一个在整个时长内被导演的镜头，而不是一张静态幻灯片。你**不写 HTML**（那是 frame worker 的事），你**绝不读 `capture/`**（story 已经选好了素材），你也**不**挑选素材或指定转场（这两样都归 story）。`frame.md` 是你按角色取用的色板 / 字体的唯一依据。布局是本文件里的一套精简词表（下面的**布局**一节），在每个 Scene 里直接写明；运动词表 + 运动准则 + seek 安全核心 → `motion-language.md`；经过验证的形状 → `../../hyperframes-animation/blueprints-index.md` + `blueprints/<id>.md`；具体规则在 Step 5 从本 skill 本地的 `../../hyperframes-animation/rules/` 中解析。想在这里加色板理论或通用的字体规则？放错地方了 —— 应该放 `frame.md` + `hyperframes-creative`。

## 单位是带时间码的镜头序列

一帧的视觉层是**一串按旁白节奏排布的时间窗口**，而不是一袋效果标签。读起来像 PowerPoint 的失败在于**前置堆砌**：agent 在前 ~25% 就把整块画布匆匆塞上屏幕，然后它就那么搁着（旧的表示方法 —— 一组扁平的效果名 + 一段散文说明 —— 在入场时就把所有东西都放出来，剩下的时间空空如也）。一个**对照 VO** 写出来的带时间码镜头序列让这种情况不可能发生：每个窗口都写明屏幕上有什么、什么在动，并且**旁白没讲到的东西就不出现。**

把每一帧写成几个由口播台词提示的窗口：

```
Scene 1 (0.0–Xs):  only what the VO is saying at t=0 enters — never the whole canvas
Scene 2 (Xs–Ys):   the next piece reveals as the VO names it (a line / card / stat / icon)
  …                one window per spoken cue — as many or as few as the line calls for
Scene N (…–end):   content has resolved; hold the read (stillness; subtle jitter at most)
```

- 每一条 `Scene` 行都写明**屏幕上有什么**、**这个窗口里什么在动**，以及**它摆在哪里**（布局，直接写在行内）。时间是该帧 `duration` 范围内的真实秒数。
- **让揭示跟着旁白的节奏走；绝不前置堆砌。**这是反 PowerPoint 的核心机制（→ `motion-language.md` Part 2 规则 2）。在 t=0 只展示 VO 那一刻正在说的内容；后续每一块 —— 一行字、一张卡片，甚至一个 h1 —— 都**在 VO 说到它时**才揭示，把揭示分布在整个镜头里，尤其是**后 ~50%**。**窗口数 = 这句台词需要的口播提示数** —— 两拍的台词就是两个窗口，五个功能的清单就是五六个。**没有固定数量，也没有必须存在的"中段"**；唯一的罪过是把所有东西都堆在前面。
- **以停住的阅读收尾。**内容一旦落定，就停住让人读 —— **宁可静止，也不要糟糕的运动**：不要强行的摄像机漂移，不要偷懒的呼吸，不要后半段的平移 / 推；最多用细微抖动维持生命感（→ `motion-language.md`）。在短镜头里，最后一次揭示和停留是**同一个窗口** —— 停留不是一个必须单独存在的段落。只有最后一帧有真正的退出；其他每一帧的退出都是 harness 的转场（story 的 `transition_in`）。
- 一个**刻意停住**的帧 —— 内容已经揭示完，现在静静地供人阅读 —— 是合理的，而且常常是对的（一个高潮、一个喘息）。失败从来不是"太静"；而是**前置堆砌后冻住**（到 ~25% 时所有东西都倒出来了，没有一样是跟着 VO 提示出现的）。为了节奏刻意安排停住的段落节拍，让视频不至于从头到尾都一样忙（在 `## Video direction` 里分配它们）。揭示节奏 + 停留 + 空闲预算 → `motion-language.md`。

## 挑选形状 —— 实例化一个蓝图

不要每个镜头都从零发明。帧的**角色**（它的 `type` / `beat`）会指向一个经过验证的形状：

1. **把角色匹配到一个蓝图。**打开 `../../hyperframes-animation/blueprints-index.md`，在**角色→蓝图菜单**里找到这一帧的角色，挑一个意图契合这一拍的蓝图（story 可能已经写了一个候选 id —— 确认或推翻它）。读那份 `blueprints/<id>.md`：它是一份简短的、与具体产品无关的**带 `[slots]` 的时间码镜头模板**，并有一个指名的**招牌动作**（让这个形状之所以成为它的那个东西 —— SVG 圆环、穿推（push-THROUGH）、原位词元替换）。

2. **用这个产品的内容实例化它的 `[slots]`** —— 三种姿态：
   - **Reproduce（照搬）** —— 蓝图契合这一拍，你的内容能干净地映射到它的槽位上。用这个产品的词 / 素材 / 数据填满每个 `[slot]`，并遵循它的 Scene 时间安排。写出由此得到的 Scene 行。
   - **Adapt（改编）** —— *结构*合适，但内容 / 素材数量 / 表面不合适（或者你想要一个更新鲜的表面，避免模板感）。用一行写明**保留什么 / 改变什么**，然后写出改编后的 Scene 行。你可以扩展或变化；但你**绝不能**丢掉**招牌动作**（丢了它就说明你选错了蓝图），并且揭示要保持**跟着 VO 的节奏** —— 绝不把形状压缩成一次前置堆砌的倾倒。
   - **Compose（自行组合）** —— 没有蓝图契合这一拍。用 `motion-language.md` 里的**运动词表**搭建这个镜头：揭示依然要在整个镜头里跟着 VO 的节奏，绝不在 t=0 把所有东西都放出来。标记为 `blueprint: compose`。

3. **保留招牌动作。**无论哪种姿态，蓝图的招牌动作（在它的文件里写明）都是镜头的脊梁 —— 它通常落在镜头的关键揭示上。把它贯彻到底。

蓝图自己的 Scene 行、运动词表和 `rule mapping` 都是你的原材料；你是在选一个形状并把这个产品铸进去，而不是照抄一份工程规格。

## 你给每一帧加什么

story-design 的 `## Frame N` 块已经带有叙事 + `asset_candidates`。你在后面追加镜头。story 的 `scene` / `voiceover` / `transition_in` / 角色字段保持不动。

```
## Frame 3 — The problem
- scene: a 20-minute timer over a stack of rejected takes   ← refine only if it could read sharper
- voiceover: "…"            ← story's; leave it
- transition_in: crossfade  ← story's; leave it
- type: pain_point          ← story's
- persuasion: Pain agitation
- beat: frustration
- blueprint: dataviz-countup (Adapt)   ← you add: the id you instantiated (or "compose")
- focal: assets/reject-stat.png         ← you add: the hero asset for this beat
- roles: reject-stat = cutout · timer = supporting · backdrop = background (dim ~40%)  ← you add: role per candidate
- sfx: impact-soft, riser               ← you add: the sound the beat wants (fetched + mounted at root; never yours to embed)

Adapt: keep the count-up-ring signature; one stat not three, and the trend chart becomes the rejected-takes count climbing.
Scene 1 (0.0–1.2s): solid backdrop (dim ~40%); a circular progress ring + bold center number seat dead-center, ring sweeps and number counts 0→20 on one heavy ease — Centered template, ~50% of frame. Slow push-in runs underneath.
Scene 2 (1.2–3.4s): as the VO names the count, the camera pushes THROUGH the ring into the rejected-takes stack lower-left; the stack grows beat-by-beat as a reject counter ticks up beside it (the count-up reveals on its spoken cue, not at t=0). Asymmetric 60/40, 3 depth layers.
Scene 3 (3.4–5.0s): land the hero stat card dead-center, accent glow blooms behind it and holds; the stat reads clean and STILL — no continuing push, no breathing (a held beat beats bad motion). The stillness reads against the prior motion.
```

这些轻量标签：

- **`blueprint:`** —— 你实例化的 id（带上 `(Reproduce)` / `(Adapt)`），或者 `compose`。每帧一个 id。
- **`focal:`** —— 哪个现有候选素材是这一拍的 hero。
- **`roles:`** —— 每个候选素材的角色：`cutout`（前景主体，文字排在它周围）· `background`（满版出血，压暗 30–50%）· `supporting`（次要）。你**消费**的是 story 选好的候选素材 —— 绝不增加、替换或删掉其中任何一个（覆盖面由 story 决定；如果某一帧的候选素材真的不对，就把问题反馈回去，不要伸手去 `capture/` 里找）。
- **`sfx:`** —— 写出这一拍想要的声音（重击配一个撞击声，推配一个呼啸声，进入揭示前配一个上升音）。音频脚本的 `fetch-sfx` 步骤会去取回它，组装器会把它挂在根节点 —— 你只负责**命名**，绝不嵌入 `<audio>` 元素。

**布局直接写在每条 Scene 行里** —— 把模板、密度、纵深和层级作为"它摆在哪里"的一部分写出来（`Centered, ~50% of frame`、`asymmetric 60/40, 3 depth layers`），取材于下面的**布局**词表；绝不写 px / 缩放 / 阴影配方（那些由 worker 来写）。

**运动直接写在每条 Scene 行里** —— 从 `motion-language.md` 的词表里取动作名（`ring sweeps`、`pushes THROUGH`、`count-up`、`glow blooms`），让它在一条长尾曲线上落定（默认 `power3` —— 流畅胜过弹跳；见 `motion-language.md`）。绝不写 ease 曲线 / 毫秒数 / 交错（这些在 Step 5 从本 skill 本地的 `../../hyperframes-animation/rules/` 中解析）。

## 布局 —— 在每个 Scene 里直接写明

把每个 Scene 的布局作为"它摆在哪里"的一部分写出来。**如果蓝图已经隐含了一种构图**（环绕中心的圆环、宽画布上的一个个站点、从两翼对向进入的两张卡片），以它为准 —— 直接描述它；下面的词表是用于**自由组合**或通用一拍的，而不是一份你必须从中挑选的菜单。绝不写 px / 缩放 / 阴影（由 worker 来做）。一帧的布局可以在它的各个 Scene 之间**演变**（Scene 1 居中的 hero → Scene 2 重新排成网格）。

- **构图词表** —— 居中（hero / 高潮）· 三分法 · 分屏（对比）· 分层纵深（沉浸）· 非对称 60/40 或 70/30（编辑感）· 三联画（三个面板）· 通栏条带。在整支视频里变换构图，免得读起来像一个反复使用的模板 —— 由这一拍来决定，而不是按配额。
- **密度** —— 主视觉 ≥ 画布的 40%；≥ 3 个纵深层（背景 + 中景 + 前景）；绝不让一小簇孤零零的东西漂在空白里。眯眼测试：模糊之后你仍能挑出排第一的元素。
- **层级** —— 组合以下至少 2 项：尺寸（3:1）/ 字重（800 对 400）/ 对比度 / 位置（上三分之一是黄金位置）/ 运动，让一个元素明显占主导。
- **纵深** —— 叠加以下 2–3 项：尺寸、模糊、不透明度渐变、重叠、阴影叠层。
- **不要展示**：导航栏、页脚、滚动条、真实的光标 / 浏览器外框、充当真实素材替身的通用装饰形状、漂浮的散景 / 紫蓝色"AI"渐变 —— 除非是有意为之的 UI 演示重建。

## `## Video direction` —— 不变量只写一次

整支视频共用一种外观和一套运动语法。在 `STORYBOARD.md` 顶部写**一次** **`## Video direction`** 块，让每一帧都继承它，每帧的 Scene 行只承载**增量**。这个块是承重的 —— 正是它把许多独立的镜头绑成一部影片。**保留它。**

- **色板系统** —— 来自 `frame.md`：哪些角色对应哪些色相。绝不编造。
- **运动语法 + 揭示模型** —— 长尾 ease（默认 `power3`，流畅胜过弹跳）+ 每一帧都遵循的**按 VO 节奏揭示**的模型（每一块都在它的口播提示处揭示；绝不前置堆砌）+ 停留期间什么可以保持活动（最多细微抖动；不要偷懒的呼吸）（→ `motion-language.md`）。
- **节奏 / 停住帧的分配** —— 写明哪些是**停住 / 喘息帧**（常在高潮之前），让视频的能量有起伏：大多数帧跟着 VO 揭示，少数帧保持静止（停住的阅读胜过糟糕的运动；这是反单调的纪律；→ `motion-language.md`）。
- **负面清单** —— 永远不出现的东西：素材包禁止的不合品牌的纹理 / 效果，**再加上两种运动失败模式** —— 幻灯片（前置堆砌后冻住）和屏保（所有东西各自漂浮）（→ `motion-language.md`）。

**不要**在每一帧里重复这些 —— 在每帧里重述视频级规则，恰恰是这一层要防止的冗余。

## 色板与字体 —— 来自 `frame.md`，绝不编造

- **色板** —— `frame.md`（采用的素材包）是颜色的唯一依据；在每一帧里按它的角色应用。通用基础（一个强调色、带色调的中性色、避免纯 `#000`/`#fff`）→ `hyperframes-creative/references/house-style.md`。
- **字体** —— 字体通过 `frame.md` 的字体 token 解析；**按角色**引用它们（display / body / mono / 素材包的字号阶梯），绝不写原始字体族名或 px。通用的排版手艺（嵌入字体、深色背景下的视觉补偿、`tabular-nums`）→ `hyperframes-creative/references/typography.md`。

## 字幕带避让区（规划侧）

画布底部 ~17% 预留给字幕胶囊。把每一帧的内容都规划在**顶部 ~83%** 里，让重要的东西都不落进字幕带（像素级的截断由 worker 执行；你负责规划布局）。即使关闭了字幕也照样适用 —— 保持底边的一致性。

## 细节在哪里

| 想了解…… | 读 |
| --- | --- |
| 经过验证的形状 + 角色→蓝图菜单 + 怎么挑 | `../../hyperframes-animation/blueprints-index.md` → `blueprints/<id>.md`（本地） |
| 运动 —— 镜头模型、词表、停留、空闲预算、静止、seek 安全 | `motion-language.md`（本地） |
| 布局 —— 模板、密度、纵深、层级、字幕带 | 本文件里的**布局**词表 |
| 具体的 ease / 毫秒数 / 交错 + 规则配方正文（Step 5） | 本地 `../../hyperframes-animation/rules/`（frame worker 读它；你不读） |
| 色板 + 字体 token | 项目的 `frame.md`；基础 → `hyperframes-creative` `house-style.md` / `typography.md` |
| "制作出来的，而不是生成出来的"前景密度 | `hyperframes-creative/references/video-composition.md` |
| 帧内切换 / 接缝（zoom-through · cut-the-curve · waterfall） | `cut-catalog.md`（worker 在 composition 内部构建它们） |
| 转场 | `transition_in` 归 story-design 所有；你不碰它 |

## 收尾前 —— 检查清单

- **`## Video direction`** 在顶部写了一次（色板 · 运动语法 + 镜头模型 + 空闲预算 · 静止分配 · 包含两种失败模式的负面清单）；每帧条目是增量，不是重述。
- 每一帧都是一个**带时间码的镜头序列**，用真实的秒数窗口覆盖它的 `duration` —— 不是一袋标签。
- **没有任何一帧前置堆砌** —— t=0 时只有 VO 正在说的内容入场；后续每一块都在它的口播提示处揭示，分布在后 ~50%。窗口数跟着 VO 走，不是一个固定数字。
- 每一帧都写了一个 **`blueprint:`** id（Reproduce / Adapt）或 `compose`；Adapt 写明了保留 / 改变，并且**保留了招牌动作**；没有任何一帧压缩成一次前置堆砌的倾倒 —— 揭示始终跟着 VO 的节奏。
- **停住帧是刻意安排的** —— 为了节奏在 Video direction 里分配；停住的阅读没问题（宁可静止，也不要糟糕的运动），但任何一帧都不能前置堆砌后冻住。
- 每一帧的 `asset_candidates` 都有一个 `focal` + 每个候选素材的 `roles`；没有增加、替换或删掉任何一个。
- 每个 Scene 里**直接写明**布局（模板 / 密度 / 纵深 / 层级 —— 本文件的**布局**词表）；每个 Scene 里**直接写明**取自词表的运动（`motion-language.md`）。不写 px / ease 曲线 / 毫秒数 / JS。
- 内容规划在顶部 ~83%（字幕带保持干净）。
- 色板 / 字体按角色从 `frame.md` 取用 —— 没有任何编造。
- 你没有写 HTML，也从未读过 `capture/`。
