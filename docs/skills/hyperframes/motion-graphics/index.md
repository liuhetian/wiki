---
name: motion-graphics
description: >
  一段短小、以设计为主导、运动即信息的动态图形 —— 动态文字、数字 count-up、图表 / 数据可视化的冲击镜头、logo sting / 品牌 lockup、lower-third / 标注 / 社交 overlay、动画地图（高亮区域、连接地点、缩放到某个位置）、动画推文 / 新闻文章 / 标题、网页 / UI 动画（滚动、光标、标注），或者把一张真实图片的几何形状融合进图表。通常不超过 10 秒（最长约 30 秒），没有旁白，也没有真人拍摄的主体；渲染为 MP4 或透明 overlay。更长 / 有旁白 / 多场景 → /general-video。不明确 → /hyperframes。
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在运行安装或更新命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，让本 skill 保持最新 —— 运行前先征得用户确认：** `npx hyperframes skills update motion-graphics`。如果一切都已是最新，它会很快结束、什么也不改；否则它会刷新本 skill 以及它所依赖的核心领域 skill，之后你再依赖它们。

> **figma 来源**：如果要据以构建的 logo / 素材 / 动画来自 figma.com URL，先运行 `/figma` —— 导出素材、品牌 token，以及当这个图形是 Figma Motion 导入时做 Motion→GSAP 转换 —— 然后基于它的输出来构建。不要直接用原始 MCP 工具驱动 Figma：那样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌 token 的 `var()` 绑定，以后品牌一改，不完整重新导入就无法传导过来。

# motion-graphics —— 派发入口

> **正门是 `/hyperframes`。** 本 skill 制作**短小、以设计为主导、无旁白的动态图形**（运动即信息；大约 10 秒以内，没有旁白）。任何更长、有旁白或多场景的需求 —— 或者任何不确定 → 先读 `/hyperframes`：每一个路由决策都归意图层管。

本工作流**按设计就是自主的** —— 最多问一个澄清问题（`agents/director.md`），然后一路构建到验证，中间不做评审。意图层（`/hyperframes` → `references/intent-interview.md`）直接路由到这里，不问运行形态问题；对这么短的作品来说，分镜和 companion 会话增益很小。渲染仍然由用户把关：检查和佐证快照（proof snapshot）都通过后，打开 Studio 预览，并提出 `../hyperframes/references/brief-contract.md` 里那个标准问题 “render now, or what changes?”（现在渲染，还是要改哪里？）。如果存在 `BRIEF.md`，在 director 提问之前先读它。

一段短小、以设计为主导的动态图形。**素材优先**：_在设计镜头之前_ 先决定素材策略并找到真实素材，然后围绕手头已有的东西设计镜头，再通过复用 catalog 能力来组装。所有产物都放进 `PROJECT_DIR = videos/<project-name>/`（在 Step 0 中创建）；下文所有路径都相对于它。

| 阶段     | 执行方式                                                              | 主要产物                                                         | 详细流程                      |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| init     | Bash                                                                  | `hyperframes.json`                                               | Step 0                        |
| plan     | 子 agent —— **决定要不要搜索？** + 分类 + 素材策略                     | `shot-plan.json`（草稿：category、`asset_needs` 查询、brief）    | `agents/director.md`（Part 1） |
| source ◇ | Bash —— media-use resolve（**`asset_needs` 为空时跳过**）             | `assets/` + `assets/index.md`                                    | `phases/source/guide.md`      |
| design   | 子 agent —— 围绕已解析的素材设计镜头                                   | `shot-plan.json`（终稿：block + 布局 + 运动 + 位置）             | `agents/director.md`（Part 2） |
| build    | 子 agent —— 复用优先的 composition 组装                                | `compositions/index.html`                                        | `agents/builder.md`           |
| verify   | Bash —— `lint`、`check`、佐证快照；失败时修复                          | `snapshots/contact-sheet.jpg`                                    | Step 5                        |
| approve  | 打开预览；问是渲染还是修改；等待回答                                   | 明确的渲染批准                                                   | Step 6                        |
| render   | Bash —— `hyperframes render`（MP4，overlay 用 `--format webm/mov`）   | `renders/video.mp4` 或透明 overlay                               | Step 6                        |

`◇ source` 只在所选 category 声明了素材时才运行。纯代码 / 纯文字的 category（例如 `kinetic-type`，以及大多数 `charts`/`stat`）都是 `asset_needs: []`，直接从 plan 跳到 design。

## Category —— 按是否搜索来划分

`plan` 的**第一个决策是：这个需要搜索吗？** 这个分叉把 category 分成两组；然后再挑具体的 category —— 对搜索驱动类来说，**依据搜索返回的内容类型**来挑。每个 category 对应一个 `categories/<id>/module.md`（它的规划 + 构建规则）；共享的运动词汇放在 `references/motion-vocabulary.md`（→ `hyperframes-animation` 的 rules/blueprints + registry block）。

**形式类 category —— 不搜索；内容由用户提供：**

| Category       | 意图                                                                                                           | 依托                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `kinetic-type` | 有冲击力的一句话 / 引语 / 标题，运动优先的文字                                                                 | `caption-*` block + 动画 rules                                              |
| `stat`         | 单个 hero 数字 / count-up + 圆环                                                                               | `apple-money-count` / `rules/{counting-dynamic-scale, stat-bars-and-fills}` |
| `charts`       | 由数据生成的柱状 / 折线 / 饼图 / 排名竞赛 / 百分比                                                             | `data-chart` block                                                          |
| `logo-reveal`  | logo sting / 品牌 lockup（用户的 logo）                                                                        | `logo-outro` / `rules/svg-path-draw`                                        |
| `lower-thirds` | 姓名 / 头衔条、标注、社交 overlay                                                                              | `caption-*` + registry 中的 overlay block                                   |
| `maps`         | 地理运动 —— 高亮区域、连接地点、缩放到某个位置（矢量通道，或烘焙底图通道）                                     | `us-map` / `world-map` 系列 + `bake-basemap.mjs`                            |

**搜索驱动类 category —— 先搜索，再按内容类型做动画**（RWA 路径）：

| 返回的内容       | Category       | 动画                                                           |
| ---------------- | -------------- | -------------------------------------------------------------- |
| 网页 / 链接      | `webpage`      | 网页 / UI 动画（滚动、显现、光标、标注）                       |
| 新闻文章         | `news`         | 标题显现 + 来源卡片 + 关键事实标注                             |
| 推文             | `tweet`        | 动画推文卡片                                                   |
| 图片 / 实体      | `asset-fusion` | 素材的几何形状 _变成_ 图表本身（RWA 叙事内融合）               |

构建顺序：一次一个，覆盖优先（粗糙也没关系）。`kinetic-type` 从原型移植而来；其余的随后跟上。

## 前置条件

macOS Apple Silicon 或 Linux x64。系统工具：`brew install node ffmpeg`。运行一次 `npx hyperframes doctor`。macOS 上用 GPU 渲染：`export PRODUCER_BROWSER_GPU_MODE=hardware`。

可选的 key（未设置时有本地兜底）—— 只有通过 media-use 获取 / 生成素材的 category 才需要：

| Key                                 | 用途                                                        | 兜底                            |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | 图片生成（media-use resolve）                               | 跳过生成 / 只搜索               |
| （asset_scout / 搜索 provider）     | `webpage`/`news`/`tweet` + `asset-fusion` 的真实素材搜索    | category 降级为无素材           |

## 流程

### Step 0 —— 初始化

cwd 是 agent 工作区根目录；所有产物都写到 `PROJECT_DIR = videos/<project-name>/` 下。`<project-name>`：用户给了目录就用那个，否则根据意图取一个简短的 kebab-case 名字（`<subject>-motion`）。不要用工作区的目录名，也不要用时间戳。

只有当 `$PROJECT_DIR/hyperframes.json` 不存在时才执行：

```bash
PROJECT_DIR="${MOTION_GRAPHICS_DIR:-videos/<project-name>}"
mkdir -p "$(dirname "$PROJECT_DIR")"
npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=motion-graphics
```

`init` 会把已安装的 skill 与 GitHub 上的最新版对照，如果有过期的就更新全局那一套。

**约束：** 绝不在工作区根目录执行 `hyperframes init`；绝不在 `PROJECT_DIR` 里面再嵌套一个 `hyperframes/`；每一条 Bash 命令（主 agent + 子 agent）都是一个 `(cd "$PROJECT_DIR" && ...)` 子 shell —— 绝不用裸 `cd`。

### Step 1 —— 规划（子 agent：Director Part 1）

派发一个子 agent。prompt = 完整的 `agents/director.md` + `## Dispatch context`（`SKILL_DIR` / `PROJECT_DIR` / 用户的请求 / `Schema: <SKILL_DIR>/references/shot-plan-ir.md`）。它必须：

1. **决定：这个需要搜索吗？**（第一个分叉）
   - **不需要** → 挑一个**形式类 category**（kinetic-type / stat / charts / logo-reveal / lower-thirds / maps）；内容由用户提供；`asset_needs: []`。
   - **需要** → 把一份**搜索计划**写进 `asset_needs[]`（news / web / tweet / image；两极查询）。具体的**搜索驱动类 category**（webpage / news / tweet / asset-fusion）由 Step 2 返回的内容类型来确认，并在 Step 3 定稿。
2. 写一份 `shot-plan.json` 草稿（外层信封 + 所选的形式类 category _或_ 搜索意图 + `asset_needs` + 一段话的镜头 brief）。Schema：`references/shot-plan-ir.md`。

校验：`[ -s "$PROJECT_DIR/shot-plan.json" ] && echo ok || echo missing`。

### Step 2 —— 获取素材 ◇（Bash：media-use，有条件）

如果 `shot-plan.json.asset_needs` 非空，就解析素材（搜索 / 生成 / 抓取 → 冻结成项目本地路径 + 台账）。见 `phases/source/guide.md`（它封装了 `media-use resolve`；搜索驱动类 category 使用 news/web/tweet/image 搜索）。如果 `asset_needs` 为空，**直接跳到 Step 3**。

优雅降级：如果某个搜索 / provider 不可用，该 category 回退为无素材（在 `context.log` 里记一笔）。

### Step 3 —— 设计（子 agent：Director Part 2）

派发一个子 agent（prompt = `agents/director.md` Part 2 + dispatch context，如果 Step 2 跑过则包含已解析的 `assets/index.md`，再加 `catalog-map.md`）。它**围绕可用的素材**设计镜头：挑选 catalog block + `hyperframes-animation` 的 rules/blueprints、布局、运动、段落节拍，以及（对 `asset-fusion` 而言）`element_positions` + 取色器色板。最终定稿 `shot-plan.json`（`content.block` + `content.customize` + 各 category 自己的 content）。

### Step 4 —— 构建（子 agent：Builder，复用优先）

把共享的[运动原则](../hyperframes-creative/references/motion-principles.md)放进 Builder 的 dispatch context。对 `charts` 和 `stat`，还要加上[数据的运动表达](../hyperframes-creative/references/data-in-motion.md)。Builder 在写 timeline 之前先读这些指南。

派发一个子 agent。prompt = 完整的 `agents/builder.md` + dispatch context（`shot-plan.json`、`catalog-map.md`、该 category 的 `module.md`、`references/motion-vocabulary.md`、`references/builder-contract.md`）。**复用优先**：`npx hyperframes add <block>` + 就地定制；只手写缺口部分 + asset-fusion 的那个 affordance。输出遵守 HF 契约的 `compositions/index.html`（`window.__timelines` 上的 paused GSAP timeline、`class="clip"` + 稳定的 id、`tl.seek(0)`、确定性的）。

### Step 5 —— 验证（Bash → 失败时派发修复子 agent）

```bash
(cd "$PROJECT_DIR" && npx hyperframes check .)
(cd "$PROJECT_DIR" && npx hyperframes snapshot --at <proof-times>)
```

选择的佐证时间点要能展示开场状态、标志性动作和最终定格。继续之前先查看生成的缩略图拼版（contact sheet）或快照总览。`lint`、`check` 或快照失败时，派发修复子 agent（`agents/finalize.md`）做一轮就地修复，然后重跑失败的那道闸门。绝不为了掩盖缺陷而改动一个固定的时长。

### Step 6 —— 批准并渲染（Bash）

打开 Studio，然后只问一个问题：“render now, or what changes?”（现在渲染，还是要改哪里？）修改之后，回到同一道闸门：

```bash
(cd "$PROJECT_DIR" && npx hyperframes preview --background)
```

只有在得到明确的渲染答复之后才渲染：

```bash
(cd "$PROJECT_DIR" && npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4)
# transparent overlay variant: --format webm  (or mov)
```

确认输出文件存在、非空，并且时长符合预期。最终交接要写明产物、实际时长、composition 或 frame id、佐证时间点，以及查看过的缩略图拼版或快照总览。参数说明在 `/hyperframes-cli` → `references/preview-render.md`。

## 续跑表

| 状态                                                     | 从哪里继续                 |
| -------------------------------------------------------- | -------------------------- |
| 没有 `shot-plan.json`                                    | Step 1（plan）             |
| `shot-plan.json` 有 `asset_needs`，没有 `assets/`        | Step 2（source）           |
| `shot-plan.json` 已定稿，没有 `compositions/index.html`  | Step 3/4（design+build）   |
| `compositions/index.html` 已存在，缺佐证快照             | Step 5（verify）           |
| 检查和佐证快照都通过，没有已批准的渲染                   | Step 6（approval）         |
| 已批准的渲染已存在                                       | 验证输出，然后汇报         |

## 设计说明（写给维护者 —— 执行时不读这部分）

- **素材优先的理由：** 获取素材被前置，并为镜头设计提供依据（RWA 流程：分析 → 搜索 → 审阅 → 组装）。搜索驱动类 category（`webpage`/`news`/`tweet`）和 `asset-fusion` 都依托 media-use 的搜索（news/web/tweet/image），这正是 media-use 文档里写明的 RWA 渊源。
- **复用优先：** 在本生态里，与「LLM 生成模板」相对应的做法是「组装 catalog block + `hyperframes-animation` rules」。HF 的 paused GSAP timeline ≙ Remotion 的 `useCurrentFrame`。
- **Category 模块契约：** 一个 `categories/<id>/module.md`（规划 + 构建），共享 `references/motion-vocabulary.md`（+ 可选的 eval）。新增一个 category = 放进这个文件夹 + 在 `agents/director.md` 里登记它的分类器行 + 在 `catalog-map.md` 里加它的那一行；阶段流水线不用动。
- **目录结构：**
  ```
  videos/<project-name>/
    hyperframes.json  context.log
    shot-plan.json            # the IR (Director output)
    assets/  assets/index.md  # media-use output (if sourced)
    compositions/index.html   # Builder output
    renders/video.mp4
  ```
- **登记：** 在 `hyperframes` 路由里 —— 加上「以设计为主导的短动态图形」这个意图 + 工作流描述；把 motion-graphics 的触发词从 `/general-video` 中划出来；加上反向的 Do-NOT-use 边。见 `motion-graphics-genre.md` §5-7。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [agents/builder.md](agents/builder.md) —— Motion-Graphics Builder
- [agents/director.md](agents/director.md) —— Motion-Graphics Director
- [agents/finalize.md](agents/finalize.md) —— 定稿 / 修复子 agent
- [catalog-map.md](catalog-map.md) —— Director → catalog block 对照表（复用优先）
- [categories/asset-fusion/module.md](categories/asset-fusion/module.md) —— asset-fusion —— category 模块（搜索驱动 · 全新的 IP）
- [categories/charts/module.md](categories/charts/module.md) —— charts —— category 模块
- [categories/kinetic-type/module.md](categories/kinetic-type/module.md) —— kinetic-type —— category 模块
- [categories/logo-reveal/module.md](categories/logo-reveal/module.md) —— logo-reveal —— category 模块
- [categories/lower-thirds/module.md](categories/lower-thirds/module.md) —— lower-thirds —— category 模块
- [categories/maps/module.md](categories/maps/module.md) —— maps —— category 模块
- [categories/news/module.md](categories/news/module.md) —— news —— category 模块（搜索驱动）
- [categories/stat/module.md](categories/stat/module.md) —— stat —— category 模块
- [categories/tweet/module.md](categories/tweet/module.md) —— tweet —— category 模块（搜索驱动）
- [categories/webpage/module.md](categories/webpage/module.md) —— webpage —— category 模块（搜索驱动）
- [grounding/PROTOCOL.md](grounding/PROTOCOL.md) —— locate —— 在图片里找到 "X"（不假设有检测器 API）
- [phases/source/guide.md](phases/source/guide.md) —— source 阶段 —— 获取素材（素材优先）
- [references/builder-contract.md](references/builder-contract.md) —— Builder 契约 —— composition 规则（agents/builder.md 背后的细节）
- [references/motion-vocabulary.md](references/motion-vocabulary.md) —— 文字模块 · 运动词汇（基本元素 → GSAP）
- [references/shot-plan-ir.md](references/shot-plan-ir.md) —— shot-plan IR
