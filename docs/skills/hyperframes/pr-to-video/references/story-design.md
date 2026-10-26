# 故事设计 —— PR → 叙事

在 Step 3 用这份参考来为一支 **PR-to-video** 写 `STORYBOARD.md` 和 `SCRIPT.md` —— 把一次代码变更（diff、commit、文件、+/− 统计，以及背后的人）变成一支讲解视频。这里**没有网站，也没有抓取到的素材**；PR 已在 Step 1 读入到 `capture/extracted/`。

本文件定义的是故事：视频讲解什么、按什么顺序、每一帧为什么存在。它不定义布局、效果、动画或文件语法。确切的分镜语法遵循 `../../hyperframes/references/storyboard-format.md` 和 `../../hyperframes/references/script-format.md`。

## 先读

1. `hyperframes.json` —— 锁定的 brief：角度（原型）、受众、时长、画幅比例、语言。
2. `frame.md` —— 调性、字体、设计系统（随附的 preset 是 **code-editorial**：温暖的编辑风、一款会思考的衬线体、稀缺的珊瑚色、一个海军蓝代码面）。
3. `capture/extracted/visible-text.txt` —— 组装好的 PR brief：标题、元信息（`base ← head · +N/−M across F files`）、相关人员、正文、commit、改动的文件，以及一组受预算约束的**代表性 diff hunk**。这是你的**信息**来源。
4. `capture/diff.patch` —— 完整的统一 diff，用于比 brief 摘录更深入地挑选 hunk。
5. `capture/extracted/people.json` —— 贡献者（作者 / commit 提交者 / reviewer / 评论者），已过滤掉 bot，每人在 `assets/<login>.png` 有一张头像（用于片尾致谢）。

## 产出

- `STORYBOARD.md` —— 讲解计划，每个段落节拍一帧。
- `SCRIPT.md` —— 锁定的旁白，只针对有口播的帧。

每一帧都包含分镜格式要求的字段，外加下面的叙事元数据。

## 核心规则

diff 是一串编辑。视频是一次有引导的理解过程。

**不要**逐文件念 diff，也不要把 PR 描述念出来 —— 这是最常见的单一失败。**讲解这次变更** —— 并且在变更有运行时行为的地方，**把这个行为用动效展示出来**（一个 `mechanism` 段落节拍 —— 见下文「展示行为」），而不只是把改动的行摆出来。重新排序、合并、省略、压缩：把那一个要紧的变更提到台前，丢掉附带的杂项改动（lockfile 版本提升、格式化、生成的文件），除非它*就是*故事本身。场景顺序来自叙事设计，而不是 diff 的文件顺序或 commit 列表。

**先价值后证据**（`../../hyperframes-creative/references/story-spine.md`）：面向观众的回报 —— 这次变更解锁了什么、修好了什么、提速了什么 —— 在第二个段落节拍之前落地；diff 和机制是这一主张的**证据**，绝不是开场。实现细节是故事的脚注，不是脊梁。

默认用一种**朴素、技术化、不慌不忙的开发者口吻** —— 准确、具体，不吹嘘，没有营销腔。你在向工程师讲解一次真实的变更；尊重他们的时间和智力。`frame.md`（code-editorial）会把口吻调向深思熟虑和文学性；它不改变结构。

## PR 原型

选**一个**原型（或指定一个复合原型）。每一个都是理解一次变更的完整路径 —— 不要把不同原型的阶段拼接在一起。

- **Changelog** ——"这是上线的内容。"点出头条的钩子 → **2–4 个大致同等重要的变更条目** → 上线 / 收尾。最适合发布 PR、包含多项变更的 PR、"vN 有什么新东西"。条目是并列的 → 它们之间用 `cut` / `push-slide`。当变更能被压缩时，三的法则最有力。一个有可见行为的条目，可以用一个 `mechanism` 小演示来代替光秃秃的 `diff`。
- **Feature-reveal** ——"这是你现在能做的事。"钩子（这个功能解锁的结果，用用户的语言说）→ 把回报具体化（`impact` —— 现在什么能用了）→ 给它命名（`change`）→ 新代码逐字打出（`diff`）→ **把它做的事动画化（`mechanism`）** → 收尾（呼应开头的承诺）。最适合新增了**一个值得注意的功能**的 PR。承诺领头，代码来证明：`diff` 和 `mechanism` 是开场主张的证据 —— 在第一行代码出现之前，观众就应该已经在意了。
- **Fix-explainer** ——"这里坏了；这是修复。"症状 / bug（`problem`）→ **把出错的行为动画化（`mechanism`）** → 以 before→after 呈现修复（`diff`）→ **行为现在正常工作（`mechanism`）** 或结果（`impact`）。最适合 bugfix PR。看到 bug *发生*，然后*不再*发生，就是转折 —— 这是一个比单靠 diff 更强的形状（紧张 → 转折 → 释然）。
- **Refactor-walkthrough** ——"行为不变，形状更好。"钩子（代码异味 / 为什么要改）→ 旧形状 vs 新形状（`before_after`）→ **结构被理顺，相同输入 → 相同输出（`mechanism`）** → 回报（`evidence` —— 删掉的行数、性能差值、涉及的文件）。最适合重构、性能优化、清理、迁移。一段 `mechanism` 动画对"行为不变，形状更好"的*证明*，远胜于口头断言。

**怎么选：**一个值得注意的新能力 → feature-reveal；一次 bug 修复 → fix-explainer；一次保持行为不变的清理 / 性能优化 / 迁移 → refactor-walkthrough；多项同等重要的变更 / 一次发布 → changelog。打破平局的规则：一个顺带修了 bug 的功能 → feature-reveal，把修复作为一个主体段落节拍；一个需要小规模重构的修复 → fix-explainer（修复是头条）。**复合：**把 `arc` 写成 `"<outer> with <inner>"`，例如 `"feature-reveal with changelog"`。outer = 观众所经历的宏观弧线；inner = 主体的节奏。

## PR 原生的帧类型

把每一帧的 `type` 设为下列 PR 原生取值之一。（分镜解析器会原样保留 `type`；它是一个叙事 + 节奏标签，不是一个硬性枚举。）每个类型都对应一种 code-editorial 帧处理方式和一种典型视觉 —— 这样类型、设计和视觉从头到尾保持一致。注意 `mechanism` 是**展示行为**的段落节拍（一个自创的动画示意图），区别于 `diff`（展示代码）。

| `type` | 这一帧的任务 | code-editorial 处理方式（frame.md） | 典型视觉（见 code-vocabulary.md） |
| --- | --- | --- | --- |
| `hook` | 高杠杆的开场 3–5 秒 | Cover | ——（或者用 `code-3d-extrude` 做一个 hero 代码时刻） |
| `problem` | 这个 PR 解决的 bug / 代码异味 / 痛点 / 为什么要在意 | Statement 或 Pull-quote | `code-highlight`（聚光照亮出问题的那一行） |
| `change` | 给这次变更 / 这个功能 / 这个 PR 本身命名 | Statement 或 Cover | —— |
| `diff` | 变更的主体 —— 一次 before→after、一个 hunk、逐字打出的新代码 | **Code Surface**（海军蓝） | `code-diff` / `code-morph` / `code-typing` |
| `before_after` | 明确的旧形状 vs 新形状对比（重构 / 修复） | Code Surface（分屏 / 变形） | `code-morph` / `code-diff` |
| `mechanism` | **展示这次变更在运行时做了什么** —— 请求在重试、缓存在填充、串行→并行、竞态被解决 | 奶油色底上的自创示意图（细线墨色 + 一个珊瑚色的活动标记） | **自创 SVG/GSAP**；合适时用 `flowchart` / `flowchart-vertical` / `data-chart` |
| `impact` | 回报 —— 现在什么能用了、什么成为可能；作为承诺开启视频（feature-reveal），或作为结果落地 | Number / Impact | `number-lockup`（不需要代码 block） |
| `evidence` | 具体的依据 —— `+N/−M`、一个通过的测试、一个基准测试 | Number / Impact | `code-diff` 红→绿 / `number-lockup` |
| `credits` | 交付者收尾 —— 这次变更背后的人 | Closing | ——（来自 `assets/<login>.png` 的头像行） |
| `cta` | 收尾的号召 —— 拉取它、升级、读这个 PR | Closing | ——（coral-callout） |

PR 视频的主体**在 `diff`（展示改动的代码）和 `mechanism`（展示它在运行时做什么）之间交替**，最后落在 `impact` / `evidence`（结果）上。一个全是 `diff` 的主体读起来像代码展示会 —— `mechanism` 段落节拍才是让变更*看得懂*的东西，也是治疗视频平淡的常规良方。每个 PR 都有一次变更，所以至少总有一个 `diff`（或 `change`）帧；大多数 PR 也有值得动画化的行为。

## 钩子策略

钩子是杠杆最高的 3–5 秒。选一种：

| 策略 | 何时用 | 示例 |
| --- | --- | --- |
| 震撼数据 | 这次变更把利害关系量化了 | "这个 PR 删掉了 1,200 行。" / "冷启动快了 40%。" |
| 反直觉的主张 | 这次变更与直觉相悖 | "我们把客户端变慢了 —— 结果问题就修好了。" |
| 痛点确认 | 受众已经在被这个 bug 折磨 | "每次部署，都是同一个时好时坏的超时。" |
| 概念发布 | 这次变更有一个值得立住的名字 | "认识一下 retry-with-backoff —— 不稳定的网络不再搞挂你的请求。" |
| 前后对照预告 | diff 就是整个故事 | "原来这一行会抛异常。现在它能恢复了。" |
| 利害 / 后果 | "为什么现在要在意"是一个真实的代价 | "这个崩溃打到了每一个网络不稳定的用户。" |
| 直接喊话 | 受众定义得很清楚 | "如果你曾经干等过一次 5 分钟的 CI……" |

不要以泛泛的仓库 / 公司介绍开场。无论用哪种策略，钩子说的都是**观众的结果语言**（story-spine 规则 1）—— 绝不说文件 / 函数 / 标识符的名字；只有当数字承载着利害时才用数字（"快了 40%"），而不是清点库存（"改了 23 个文件"）。

## 清晰度 / 修辞技法目录

每一帧的 `persuasion` 是一个**有名字的**技法，而不是"讲解这次变更"。多个技法同时起作用时就组合起来：

- **具体化** —— 实例演示（一个真实的请求 / 输入）· 类比（把退避说成"敲门，再多等一会儿，再敲门"）· 具象化（抽象的变更 → 一行看得见摸得着的代码）
- **按序揭示** —— 渐进式披露（diff 一次一行）· 层层铺垫（先是简单的调用，然后是边界情况）· 路标提示（"之前……之后……"）
- **对比** —— before/after diff · 旧形状 vs 新形状 · bug vs 修复 · 两种做法对比
- **结构** —— 三的法则（三项变更）· 编号列举 · 问题→答案 · 先搭框架再填充（先说清形状，再上代码）
- **证据** —— `+N/−M` 统计 · 通过的测试 / 绿色对勾 · 基准测试 / 性能差值 · 因果链（请求 → 5xx → 重试 → 成功）
- **记忆与落点** —— 呼应（回到钩子里的那个 bug）· 提炼（用一行话说清这次变更）· 推广（这次修复 → 背后的原则）

## 情绪节拍

`beat` 是一个词或一个简短的复合词（例如"认出与释然"）。避免泛泛的"正面"。PR 视频沿着一条理解弧线走：

- **负面低谷** —— *打开缺口*（`hook`/`problem`）：好奇 · 沮丧 · 认出 · 担忧 ·"唉，又是那个 bug"
- **转向** —— *定向*（`change`）：清晰 · 定位 · 期待 · 专注
- **积累** —— *建立理解*（`diff`/`before_after`/`impact`/`evidence`）：理解 ·"啊哈" · 信心 · 势头 · 确信 · 释然（针对修复）
- **收束** —— *落地*（`credits`/`cta`）：满足 · 坚定 ·"上线吧" · 理所当然

复合节拍往往最有力："认出*与*释然"（修复）、"好奇*与*信心"（功能）。

## 主体是一个序列

PR 视频的核心是 **2–5 个主体帧**，每一帧推进一项变更 / 一组 before→after / 一个条目，层层累积。**在 `diff`（代码）和 `mechanism`（行为）之间交替** —— 不要把代码面堆叠在一起：

- **changelog：**每个变更条目一个 `diff`（或一个 `mechanism` 小演示）；并列 → 默认用 `cut` / `push-slide`。
- **feature-reveal：**`impact`（承诺，具体化）→ `change`（给它命名）→ `diff`（代码，通常是逐字打出 / 变形出来）→ `mechanism`（动画展示它在工作）→ 收尾时呼应承诺。
- **fix-explainer：**`problem`（症状）→ `mechanism`（bug 正在发生）→ `diff`（原因 + 修复，before→after）→ `impact`（结果，或一个展示它正常工作的 `mechanism`）。
- **refactor-walkthrough：**`before_after` 结构 → `mechanism`（结构被理顺，行为保持不变）→ 一个 `evidence` 数字段落节拍。

## 跨帧的连续性

这个框架是**每个 worker 构建一帧** —— 没有多帧的"接续运行"。一个序列要读起来像一个连续镜头，靠的是两个分镜层面的抓手，都归你管：

1. **一致的舞台** —— 相邻的主体帧共享同一个构图思路（同一个海军蓝代码窗口不断填充、同一个 before|after 分屏、同一个计数器不断推进），在每一帧的 `scene` 里写明，让 Step 4 和各 worker 保持舞台稳定。
2. **一致的转场** —— 为一段连续的帧选一种接缝类型（柔和的代码揭示用 `crossfade`，下一个变更条目用 `push-slide`），并重复使用它。

当某个元素确实在两个想法之间*变形*时（失败的测试翻绿、旧函数变成新函数），把它保留在**一帧之内**，作为一个展开段落节拍（入场 → 变形 → 落定）—— 那个动效归 worker 所有（一个 `code-diff` 或 `code-morph` block）。在 `scene` / 叙事里写明意图；Step 4 会围绕这个 block（一个 `code-diff` / `code-morph`）包上一段带时间码的镜头序列。

## 转场

`transition_in` 里只用 registry 的转场名：

`cut | crossfade | blur-crossfade | push-slide LEFT | push-slide RIGHT | push-slide UP | push-slide DOWN | zoom-through | squeeze`

全片挑 2–3 种并重复使用。第 1 帧是 `cut`（没有前一帧）。让接缝与叙事相配：有序的变更条目 → 一致的 `push-slide`；柔和的揭示 / 深入原因 → `crossfade` / `blur-crossfade`；推近到一行代码或拉远到文件树 → `zoom-through`；一个干净利落的新变更条目 → `cut`。

## diff 是核心

代码段落节拍放在**海军蓝代码面**上（code-editorial 的 Code Surface 处理方式）—— 但主体**不是**全是代码（把它们和 `mechanism` 段落节拍配对，见下一节）。有意识地规划代码段落节拍：

- **挑出 2–4 个真实的 diff hunk 作为主角**，在每一帧的 `scene` 里写明 —— 每个都是一小段清晰可读的代码片段（约 4–12 行），**绝不是整个文件**。从 `capture/diff.patch` / brief 的"Representative diff"里取。
- 在 `scene` 里写明这一帧想用**哪个代码动画 block**（Step 4 的视觉阶段和 worker 都会读它）。完整的对应关系见 `code-vocabulary.md`；简版：before→after = `code-diff`；重构 / 重命名的连续性 = `code-morph`；新代码写出来 = `code-typing`；聚光照亮一行 = `code-highlight`；走查一个长文件 = `code-scroll`；hero 式揭示 = `code-3d-extrude` / `code-particle-assemble`。
- 数字（`+1,204 / −318`、涉及的文件数、性能差值）放在 `impact` / `evidence` 帧上，作为一个 `number-lockup`，**不要**在旁白里念出来。

## 展示行为 —— 机制段落节拍（不只是 diff）

diff 展示的是**代码里改了什么**。它**不**展示**这次变更做了什么** —— 而"它做了什么"通常才是更令人难忘、更有讲解力的段落节拍。PR 视频显得平淡的最大单一原因，就是每个主体帧都是一个代码面或一个数字：它在*讲述*（这是那几行，这是那个统计），却从不*展示*（这是请求真的恢复过来了）。

一个 **`mechanism` 帧把这个 PR 改变的运行时行为动画化** —— 构建为一个**自创的动画示意图**（在 code-editorial 奶油色底上用 SVG / HTML / GSAP：细线墨色的节点 / 连线 / 泳道，活动或改动的元素上有一个珊瑚色标记），其中**构建过程*就是*教学** —— 每个部件在节拍上出现，流程在整个镜头中展开。它**不是**代码 block，**也不是**标题。合适时就用 `flowchart` / `flowchart-vertical` / `data-chart` registry block；否则就自创（visual-design.md 的示意图 / 抽象图形路数）。

任何有可见运行时行为的 PR，都要规划**至少一个 `mechanism` 段落节拍**（大多数功能和修复 PR 都有一个）。按变更涉及的内容决定动画化什么：

| 变更涉及…… | 动画化（行为，不是代码） |
| --- | --- |
| 重试 / 退避 / 容错 | 一个请求的生命周期：发出 → 500 → 等待（延迟递增）→ 重试 → 200 |
| 缓存 / 记忆化 | 两条泳道赛跑：冷路径（慢，打到数据库）vs 缓存路径（快，命中缓存） |
| 并发 / 并行 | 一条串行的单泳道重新排布成多条并行泳道 |
| 竞态 / 顺序 bug | 先展示出错的行为（条目丢失、两个写入方相撞），然后是修好的流程 |
| 性能 | 两条时间线 / 两根柱子赛跑，新的那个先到终点（适合用 `data-chart`） |
| 重构 / 迁移 | 一张缠结的调用图被理顺成一张干净的图；相同输入 → 相同输出 |
| 新端点 / 流水线 / 状态 | 数据流过新路径；一个状态机逐步点亮（`flowchart-vertical`） |

在这一帧的 `scene` 里写明机制（"动画展示请求重试：发出 → 500 → 退避 → 200，自创 SVG 流程"），让 Step 4 和 worker 把它构建出来。`diff` 帧和 `mechanism` 帧是**互补的** —— diff 是代码层面的证明，机制是动态层面的证明；让它们交替出现，而不是把代码面堆叠在一起。

## 收尾：致谢 / 交付者场景

PR 是人交付的，每支 PR 视频都以一个点名这些人的 `credits` 帧收尾。`capture/extracted/people.json` 列出了真实的贡献者（已过滤掉 bot），Step 1 已经把每个人的头像下载到 `assets/<login>.png`（即 `avatarFetched: true` 的条目 —— 用 `ls assets/` 确认）。`reviewDecision`（例如 `APPROVED`）是可信的依据。

> **PR 的 `author` 只是开了这个 PR —— 不一定是写代码的人。**往往是某位队友写了大部分 commit。致谢以 `committer` 领头，按 `commitCount` 排序，而不是以开 PR 的人领头。

`credits` 帧是一排头像，带名字 + 角色 + 一个"已批准"对勾。只在这一帧上，把 `asset_candidates` 设为 1–6 条 `assets/<login>.png — <login>, <role>`（先按 `commitCount` 排 commit 作者，然后是 reviewer；只用 `avatarFetched: true` 的 login）。主体保持只有代码 —— 头像**只**出现在这个收尾帧上，绝不用来装饰 diff 帧。这一帧和其他帧一样放在 Step 3 的提案里，所以用户可以在那时把它删掉；只有在一张头像都没拉到时，你才自己跳过它。

> **念名字，不念 handle。**`people.json` 为 `gh` 已经给出名字的那些贡献者（作者、commit 作者、`mergedBy`）在 `login` 旁边带有一个 `name` 字段（GitHub 显示名，例如 "Miguel Angel Simon Sierra"）；对于 reviewer / 评论者 / assignee，它是 `null`，因为 `gh pr view` 对他们永远只给一个光秃秃的 login。写这一帧之前，对要出现在收尾帧上的 1–6 个人，自己把 `null` 的名字解析出来：`gh api users/<login> --jq .name`。旁白总是念**名字**（只念名就够了 ——"由 Miguel 交付，Wenbo 评审"），**绝不**把原始的 `@login` 念出来（TTS 念出 `@miguAng18947550`，正是这条规则要避免的失败模式）。每个头像下方的屏幕文字可以两者都显示，名字在前，handle 小一号、作为次要信息：`Miguel Angel Simon Sierra` / `@miguel-heygen`。当名字仍然解析不出来时（GitHub 上这个用户也没有公开的名字），屏幕上回退为显示 login，并把这个人从口播那句里跳过，而不是念出 handle。

其他每一帧都**没有** `asset_candidates`（视觉由下游根据 `scene` + diff 自创）。

### 片尾卡上的版本号（cta / changelog）

一个 `cta`（"升级到 vN"、"npm i pkg@N"）或者一个 changelog 的"vN 有什么新东西"需要一个真实的版本号 —— 而**版本号是你绝对不能编造的那一个事实。**PR 本身不带发布版本，所以 Step 1 会为 MERGED 状态的 PR 尽力解析出一个，并把它作为一行 `Shipped in: <version> (<source>)` 元信息写进 `capture/extracted/visible-text.txt`（在 `capture/pr.json` 里以 `shipped_version` / `version_source` 镜像保存）。这样用它：

- **有 `Shipped in:`** → 在片尾卡上使用这个确切的版本号。`version_source` 为 `unreleased` 表示这次变更已在默认分支上，但还没进入打了 tag 的发布 —— 说"将在下一个版本中发布"，而不是钉死一个 tag。
- **没有 `Shipped in:` 这一行**（PR 未合并，或解析不出版本）→ **只写仓库 / PR 的 URL**（"在 github.com/… 阅读这个 PR"、"拉取它"），**不要**说出或猜测任何版本号。

## 每帧时长预算 —— ≤ 9 秒，词数才是真正的度量

PR 视频里最大的质量 bug 是**脚本说得太长**。TTS 的语速约为**每秒 2.2 个词**，所以一段 45 个词的"7 秒"脚本实际上是 20 秒，视觉阶段只好用空转的漂移去填补尾巴（视频读起来就是"在闪烁"）。按词数做预算：

| 界限 | 词数（按 2.2 词/秒） | 时长 | 何时 |
| --- | --- | --- | --- |
| **软目标 —— 默认** | **≤ 19** | **≤ 9 秒** | 每一帧都以此为目标；剪辑保持鲜活。 |
| **例外 —— 最多 2 帧** | ≤ 26 | ≤ 12 秒 | 主要的 `diff`（你必须讲清的那一项变更）或一个因果链式的 `change`。 |
| **硬上限** | > 26 | > 12 秒 | 删减或拆分。 |
| **全片目标** | ≤ 约 400 | 最多约 3 分钟 | 最佳长度约 30–90 秒（≤ 约 155 个词）；主体承担主要分量。 |

边写边估算：`duration ≈ ceil(word_count / 2.2)`。29 个词 → 13 秒（要删）；17 个词 → 8 秒；12 个词 → 6 秒。删减技巧：砍掉引导从句（"到目前为止，agent 交付的是……" → "agent 交付的是……"）；把数字从脚本里挪到计数器上；只有当拆开的两半承载不同的段落节拍（先原因后结果）时才拆分。**静音帧是允许的，而且很常见** —— diff 逐字打出、before→after 变形、计数器在跑。把 `voiceover` 留空，从 `SCRIPT.md` 里省略，让 `narrativeRole` 来承载它。复杂的变更不需要长脚本；它需要一份用心的脚本 —— 如果你没法用 19 个词给这次变更起个标题，说明这个标题还不够锐利。

**把每一行写成一个个分立的提示点，而不是一口气说到底的长句。**Step 5 会在*旁白念到*每一样屏幕元素时才揭示它（反 PowerPoint 的机制）。一行有清晰短语边界的话 ——"重试三次 —— 然后退避 —— 然后干净利落地放弃"—— 免费把揭示节奏交给了镜头；一个长长的单一从句，让这一帧没有任何可以跟着走的节奏。

## 音乐与静音

分镜顶部的 YAML 块带有一个 `music:` 字段 —— 音频步骤用来检索 BGM 的情绪（例如 `music: confident minimal tech underscore`）。省略它时会依次回退到 `message:` → `arc:` → 一个中性默认值，所以除非明确关掉，否则 BGM 会播放。

- **`music: none`** —— 关掉 BGM（如果有旁白，旁白仍会运行）。
- **`music: none` + 没有 `SCRIPT.md` + 没有 `sfx:` 音效提示或宿主音频** —— 标准的**完全静音标记**：没有旁白、没有 BGM、没有音效。`audio.mjs` 什么都不生成，音频步骤会干净地跳过。当用户要求无声 / 无音乐的视频时，严格使用这个写法。

## 帧模板

```md
## Frame N — Short name

- scene: one clear visual idea — name the hunk/file + the code-\* block ("the request() retry block, ~6 lines, code-diff")
- voiceover: "spoken guide text, or empty"
- duration: ceil(word_count / 2.2) seconds
- transition_in: crossfade
- status: outline
- src: compositions/frames/NN-short-name.html
- type: diff
- persuasion: Before/after contrast
- beat: comprehension
- blueprint: <candidate id from the role→blueprint menu, or omit — a code beat usually omits it (the code-\* block is the shape)>

narrativeRole: What this frame does in the viewer's understanding (its job, not what's on screen).
keyMessage: The one thing the viewer should understand after this frame (one sentence).
```

`credits` 帧额外带一行 `asset_candidates:`（见致谢一节）；其他帧都没有。

## 最终检查清单

- 指定了一个原型（只有明确需要时才用复合原型）；序列由叙事驱动，而不是由 diff 顺序驱动。
- 开场用了一个有名字的钩子策略；你没有把 PR 描述念出来。
- 钩子用的是观众结果语言（没有文件 / 函数 / 标识符名），视频的 `message` 在第 2 个段落节拍之前落地（story-spine）。
- 每一帧只有一个任务；主体层层累积，**在 `diff`（代码）和 `mechanism`（行为）之间交替**，再加上 `impact` / `evidence` —— 不是一个孤零零的主体帧，也不是一摞连续不断的代码面。
- 每一帧都有 `type`（PR 原生）、`persuasion`（一个有名字的技法）和 `beat`（具体的）。情绪弧线与原型相符（修复 = 沮丧 → 释然；功能 = 好奇 → 信心）。
- 每条 `voiceover` 都按短语切分成提示点（每一个都是 Step 5 可以据此揭示的一块），而不是一个一口气到底的从句；在有现成形状合适的地方，从 角色→blueprint 菜单里打上了候选 `blueprint:`（代码段落节拍通常省略它 —— `code-*` block 本身就是形状）。
- 以 **2–4 个真实的 diff hunk** 为主角，每个都是一小段清晰可读的代码片段（不是整个文件），每个都在 `scene` 里写明了它的 `code-*` block。
- **至少一个 `mechanism` 段落节拍**把变更在运行时*做了*什么动画化（一个自创的示意图，或 `flowchart` / `data-chart`），并在它的 `scene` 里写明 —— 除非这个 PR 确实没有可见的行为（纯文档 / 配置的版本提升）。主体不是一串连续不断的代码面。
- 转场只用 registry 名，并重复使用 2–3 种；第 1 帧是 `cut`。
- 视频以一个 `credits` 帧收尾（只有在一张头像都没拉到时才跳过）；其他每一帧都没有 `asset_candidates`（收尾帧上有 1–6 条 `assets/<login>.png`，只用 `avatarFetched: true` 的）。
- 每段 `script` 都符合预算 —— 默认 ≤ 19 个词 / ≤ 9 秒，最多 2 帧可以用 ≤ 26 / ≤ 12 秒的例外；`duration = ceil(word_count / 2.2)`，而不是靠猜。
- `SCRIPT.md` 只包含锁定的口播旁白；静音帧是有意为之的，不写进去。
