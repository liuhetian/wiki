---
name: music-to-video
description: "把一条音乐曲目（一个音频文件、一个要从中提取音频的视频，或者根据情绪 brief 生成的曲目）做成一支卡节拍的视频 —— 歌词视频、幻灯片或动态宣传片。音乐驱动全部节奏；用户提供的任何图片 / 视频都会被剪到同一张节拍网格上，而一支完整的视频不需要任何素材。有旁白的作品 → 与输入相匹配的工作流（见 /hyperframes）。不明确 → /hyperframes。"
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在运行安装或更新命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，让本 skill 保持最新 —— 运行前先征得用户确认：** `npx hyperframes skills update music-to-video`。如果一切都已是最新，它会很快结束、什么也不改；否则它会刷新本 skill 以及它所依赖的核心领域 skill，之后你再依赖它们。

# music-to-video —— 一条以音乐为基础、卡节拍的视频工作流

用本 skill 把一条**音乐曲目**做成一支卡节拍的 HyperFrames 视频。你只分析一次曲目，排出各个 frame，填好逐 frame 的计划，再把每个 frame 构建成一个 composition。输入是一条音乐曲目，外加可选的用户图片或视频 —— **没有旁白，也没有网站抓取**。字体排印和模板是底线（一支完整的视频不需要任何素材）；用户提供的任何媒体都按同一张节拍网格剪进去。

你是**编排者**。在 `videos/<project>/` 里工作。按顺序执行各个步骤，每一步都要通过 **闸门** 才能往下走。有两个步骤需要用户参与：**Step 3**（批准计划）和 **Step 6**（批准渲染）—— 两者都是 `../hyperframes/references/brief-contract.md` 中所说的检查点闸门（在 Step 0 之前读它）：在自主模式下，把 Step 3 的摘要作为预告发出去，然后继续；Step 6 的渲染批准仍然要问，作为唯一保留的那个问题。除了 **Step 4** 之外，每一步都由你亲自完成；在 Step 4 中你要**每个 frame 派发一个子 agent**。不要把设计和运动规则写进本文件 —— 它们放在 `references/` 和 `frame-worker` 子 agent 里。

`SKILL_DIR` = 本 skill 的目录。`PROJECT_DIR` = `videos/<project-name>/`。

工作流：Step 0 准备 → `hyperframes.json` + `assets/bgm.mp3`；Step 1 分析 → `audiomap.json`；Step 2 骨架 → `STORYBOARD.md`（各个 frame，group 为 `TBD`）；Step 3 计划 → 完整的 `STORYBOARD.md` + `frame.md`；Step 4 构建 → `compositions/frames/NN-*.html`；Step 5 组装 → `index.html`；Step 6 渲染 → `renders/video.mp4`。

## 决定一切的两个思路

- **只有一个分析器，并且你信任它。** `analyze-beatgrid.py` 是唯一的节拍分析器 —— 绝不用别的工具或凭耳朵重新测量节拍。它给出的 energy / density / rolls / onsets / silences 永远可靠。它的 `bpm` 和 `beats_sec` **只有在音乐确实有节奏感时**才可靠；对于舒缓的音乐，这张网格只是追踪器强加上去的节拍器，所以要改按乐句和能量来安排节奏，绝不要按它硬切。判断你处在哪种情况，就是每个 frame 的 `pacing`（Step 2）。
- **一个 frame = 一个文件；group 都在文件内部。** Step 2 把曲目切分成若干 **frame**，每个 frame 变成一个 composition 文件 `compositions/frames/NN-<frame_id>.html`，由一个 frame-worker 构建。一个 frame 可以再细分成若干 **group**（每个 group 是一个模板或一套 motion-primitives 组合）。额外的密度放进 group _内部_，所以 **frame 的数量跟随不同处理方式的数量，而不是节拍数** —— 节奏快的曲目不会让子 agent 的数量暴涨。

---

## Step 0：准备、BGM 和输入

目标：确定音乐来源，创建 HyperFrames 项目，并记下用户提供的任何媒体。

**brief 从意图层开始。** 开场规则，按顺序：**(1)** 存在 `BRIEF.md` → 读它，凡是它已经回答的都不要再问 —— 由它的 `flow`/`storyboard` 推导出模式（brief 契约 § 1）。**(2)** 没有 `BRIEF.md` 但项目已存在 → 从磁盘上已有的东西续跑；绝不重新盘问。**(3)** 一个直接来到这里的全新创作请求 → 读 `/hyperframes` 并运行它的意图层（`references/intent-interview.md`）：它会确认本路由的必答项（音乐来源、投放渠道 → 画幅比例 —— `../hyperframes/references/routes/music-to-video.md`），并预告哪些问题保持延后 —— 品牌和风格类型按设计在 Step 3 才选。在 init 之后立即写 `BRIEF.md`（绝不能在之前 —— `init` 会拒绝非空目录），并记录有偏好支撑的答案（`brief-format.md`）。编辑类请求跳过以上全部。

**音乐是主心骨** —— 在做任何事之前先确定一条曲目。本 skill 针对**快速、高能量的 BGM** 做了调校：强烈的节拍网格驱动剪辑（舒缓的曲目也能用，但要按乐句而不是节拍来安排节奏）。如果用户提供了音频 —— 一个音乐文件，或者一个要从中提取音频的视频 —— 就用它。否则根据请求选定情绪，通过 `/media-use`（`audio/references/bgm.md`）生成一条曲目；如果宿主应用提供了自己的音乐工具，就用那个。在第一次执行需要认证的 provider 操作之前，运行 `npx hyperframes auth status`，并把它的输出原样转述。如果处于未登录状态，走以下其中一个分支：

- **协作：** 等待用户登录，或者等用户明确选择用本地 provider 离线继续。
- **自主：** 说明状态，然后用可用的本地 provider 继续。

如果没有任何离线 provider 能满足所需的音乐能力，就把这个阻塞问题报告出来。绝不要把 key 写进某个仓库自己的 `.env`。认证归属和离线兜底见 `/media-use` 的 `references/setup-providers.md` § Providers。最终得到的曲目放在 `assets/bgm.mp3`。把用户提供的图片或视频暂存好，让各个 frame 能在节拍网格上使用它们；否则就由字体排印撑起整支视频。

**歌词视频：** 要让歌词与人声同步，可以通过 `/media-use` 转写曲目来获取逐词 / 逐行时间，或者向用户要歌词文本，再把各行放到节拍网格上。

只有当 `hyperframes.json` 不存在时才初始化。根据 brief 用 kebab-case 给 `<project>` 命名，例如 `midnight-drive-loop` —— 绝不用时间戳。`init` 会把已安装的 skill 与 GitHub 上的最新版对照，如果有过期的就更新全局那一套。

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=music-to-video
mkdir -p "$PROJECT_DIR/assets" "$PROJECT_DIR/renders"
cp "<user-music>" "$PROJECT_DIR/assets/bgm.mp3"   # extract from a video first if needed
# only if the user gave you images/videos:
node <SKILL_DIR>/scripts/stage-assets.mjs --from <dir> --hyperframes "$PROJECT_DIR" --into public
```

**品牌**（字体 + 色板）在 Step 3 选，不在这里。不要一开始就挑定风格类型或曲目类型 —— 素材只是一种可选的配料，风格类型是从逐 frame 的选择中自然浮现的。

**闸门：** `hyperframes.json` + `assets/bgm.mp3` 已存在；画幅比例 / 时长 / fps 以及（如果有）素材清单都已记下。

---

## Step 1：分析音乐

目标：产出整支视频赖以构建的那一份标准时间分析。

`analyze-beatgrid.py` 是**唯一的**节拍分析器 —— 绝不用别的工具或凭耳朵重新测量节拍。它读一次曲目，写出 `audiomap.json`：能量阶段（level / density / feel）、onsets + `onset_rate`、rolls、silences、`hard_stops`、`key_moments`、乐句、速度 / 网格，以及 `audio.duration_sec`。它是确定性的 —— 同一个文件永远得到同一张 map。大多数字段对任何音乐都可靠；`bpm` 和 `beats_sec` 只有在音乐确实有节奏感时才可靠，而判断这一点，正是你在 Step 2 要做的决定。

前置条件：Python 3，并且可以使用 `librosa`、`numpy` 和 `soundfile`。如果导入失败，在运行分析器之前把它们安装到当前激活的 Python 环境里：

```bash
python3 -m pip install librosa numpy soundfile
```

```bash
python3 <SKILL_DIR>/scripts/analyze-beatgrid.py "$PROJECT_DIR/assets/bgm.mp3" \
  -o "$PROJECT_DIR/audiomap.json" --print
```

**闸门：** `audiomap.json` 已存在；`audio.duration_sec` 已知。

---

## Step 2：Frame 骨架（只搭结构）

目标：读懂音乐并排出各个 frame —— 也就是 `STORYBOARD.md` 的骨架。

阅读 [`references/frame-skeleton.md`](references/frame-skeleton.md)。由你亲自把 `audiomap.json` 变成 `STORYBOARD.md` 的**骨架** —— 中间没有任何 JSON。在真正的音乐变化处把曲目切分成若干 **frame**（`hard_stops`、SURGE / DROP 类的 `key_moments`、一段 roll 的边缘、一段没有 onset 的区间、一次大的能量跳变），每一条边界都要吸附到一个 audiomap 锚点上。为每个 frame 设置 `span_sec`、`pacing`（即 Step 1 那个信任判断的结论 —— 网格是真实的就用 `beat_cut`，网格只是强加在舒缓音乐上的节拍器就用 `phrase_flow`）、`mood`，以及一行 `feel`（对音乐状况的朴素描述，Step 3 会拿它去匹配模板）。这一步只做分类和排布：把每个 frame 的 `### Groups` 留为 `TBD (Step 3)`，frontmatter 的 `style` 留空 —— 不要模板、文案、颜色或字体。预计约 1–6 个 frame。

**闸门：** 各个 frame 铺满整条曲目（第一个从 0 开始，最后一个到 `duration_s` 结束）；每个 frame 都带有 `span_sec` + `pacing` + `mood` + `feel`；每个 `### Groups` 都是 `TBD`；任何地方都没有内容。

---

## Step 3：填写计划（由用户把关）

目标：把骨架变成一份获得批准的完整 `STORYBOARD.md`。

阅读 [`references/planning.md`](references/planning.md)、[`storyboard-format.md`](references/storyboard-format.md)、[`template-catalog.md`](references/template-catalog.md)、[`motion-primitive-catalog.md`](references/motion-primitive-catalog.md)，以及 [`montage.md`](references/montage.md)（仅当用户提供了素材时）。就地编辑同一个文件，做两件事：

1. **挑选品牌。** 用 `../hyperframes-creative/references/design-spec.md` 里的表，从 `../hyperframes-creative/frame-presets/` 中选一个 preset（匹配曲目的情绪；**只有它的字体和颜色有意义** —— 构图归模板管）。把它**原封不动**地复制成 `frame.md`，并据此填写 frontmatter 的 `style`（字体 + 一个 ≤4–6 个色块的色板）。
2. **填满每一个 frame。** 决定它有哪些 group，并给每个 group 一种处理方式：从 catalog 里匹配到的模板（绑定好参数和真实的 audiomap 锚点）、基于基本元素 catalog 的自由组合，或者一种**遵守 `pacing`** 的素材处理方式。**在自由组合一种有名字的外观之前，先在在线 catalog 里搜索它**：对用户要求的每一种外观、效果、处理方式或转场 —— "CRT 扫描线"、"故障效果"、"胶片颗粒"、"微光扫过" —— 运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读排在前面的结果。`template-catalog.md` 和 `motion-primitive-catalog.md` 只列出本 skill 自己的本地材料；搜索会对整个托管 registry（约 400 个 block 和 component）排序，并且**不需要安装任何东西** —— 不需要项目、不需要事先 `add`、也不需要账号。只有当针对某种外观的搜索确实没有返回合适的东西时，才去自由组合它。写好文案。你负责**做什么**（模板 / 基本元素 + 内容 + 锚点）；frame-worker 负责**怎么做** —— **绝不要把毫秒级的 tween 写进分镜**。

```bash
node <SKILL_DIR>/scripts/validate-plan.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --audiomap "$PROJECT_DIR/audiomap.json" --templates <SKILL_DIR>/references/templates
```

修好每一个 `✗`（硬错误：时长不匹配、frame 没有铺满曲目、缺少 `src`）；警告则尽力而为。然后在聊天里把逐 frame 的摘要作为提案呈现出来（`../hyperframes/references/review-loop.md` § 1），根据用户的回复反复修改，直到用户批准；如果是 `storyboard: yes`，还要把它写成 `storyboard.html`（`../hyperframes-creative/references/storyboard-recipe.md` § 3）供用户打开查看。在自主模式下这是一道检查点闸门：把摘要作为预告发出去，然后继续（`validate-plan.mjs` 的通过是一道质量闸门，仍然会阻塞）。

**闸门：** `frame.md` 是 preset 的逐字副本；`validate-plan.mjs` 以 0 退出；用户批准了计划（自主模式：摘要已作为预告发出）。

---

## Step 4：按计划构建各个 frame

目标：把每个 frame 构建成一个自包含的 composition 文件。

创建 `compositions/frames/`。阅读 [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md) 和 `../hyperframes/references/subagent-dispatch.md`。**每个 frame 派发一个 frame-worker**，能并行就并行（否则分批进行）。每个 worker 恰好拿到一个 frame，以及下面这份上下文：

```text
PROJECT_DIR: <abs path>
frame_id: <NN-frame_id>              # = the frame file stem, e.g. 02-f2; the composition id
Your block: the `## Frame N — <frame_id>` block in PROJECT_DIR/STORYBOARD.md
audiomap: PROJECT_DIR/audiomap.json
frame.md: PROJECT_DIR/frame.md
Materials: for each group, <SKILL_DIR>/references/templates/<id>/index.html (templates) and
           <SKILL_DIR>/references/motion-primitives/<id>/ (free); staged assets/ (asset groups)
Contracts: ../hyperframes-core/references/sub-compositions.md + determinism-rules.md
Canvas: <w>×<h>   Pacing: <beat_cut|phrase_flow>
Write to: PROJECT_DIR/compositions/frames/<frame_id>.html
```

worker 会 fork 引用到的材料，把每个锚点换算成 frame 内的局部秒数（`local_t = track_t − span_sec[0]`），用 0ms 切来给它的各个 group 做闸门，然后写出一个 seek 安全的 frame 文件。**worker 绝不运行 `hyperframes` CLI** —— 这些命令作用于组装好的项目，而这时它还不存在，所以它们会针对错误的文件给出报告。worker 只按契约写文件，然后停下；验证由你在组装之后完成（Step 6）。每个 worker 返回时，你可以确认它的文件已经落盘。

**闸门：** 每个 frame 都有对应的 `compositions/frames/NN-*.html` 落在磁盘上。

---

## Step 5：组装

目标：把构建好的各个 frame + BGM 接进可以播放的 `index.html`。

`assemble-index.mjs` 是确定性的 —— 没有子 agent，不需要判断。它按累计的 `data-start` 引用每个 frame 文件，把 `assets/bgm.mp3` 挂在轨道 11 上，并在 frame 与 frame 之间硬切（各个 frame 无间隙地铺满曲目，所以**没有转场注入器**）。

```bash
node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --hyperframes "$PROJECT_DIR" --audiomap "$PROJECT_DIR/audiomap.json"
```

修好它报告的任何 `✗` —— frame 文件缺失或为空，意味着那个 worker 写了一个不完整的文件；重新派发它（Step 4），然后重新组装。

**闸门：** `index.html` 已存在；总时长 == `audiomap.audio.duration_sec`。

---

## Step 6：验证并渲染

目标：验证组装好的视频，获得用户批准，渲染最终的 MP4。

在**组装好的项目**上运行 CLI —— 这才是正确的单位（逐 frame 的 worker 没法运行它）。`check` 一次性完成结构 lint，以及无头浏览器的运行时、布局、运动和对比度闸门；`--snapshots` 还会输出用于审阅的画面。

```bash
( cd "$PROJECT_DIR" && npx hyperframes check . --snapshots )
```

检查 `t=0`、每个 frame 的起点、最强的 DROP / SURGE、每一个 `hard_stops[].t`，以及最后一帧。失败时，由你亲自做**代价最小的安全修复**：编辑出问题的 `compositions/frames/NN-*.html`。绝不为了掩盖同步问题而改动时长或音频时间。闸门都通过之后，打开最终的 Studio 预览（`( cd "$PROJECT_DIR" && npx hyperframes preview --background )`），停下来等用户审阅 —— 现在渲染，还是要改哪里？只有获得批准才渲染（自主模式：一样，作为唯一保留的那个问题），然后连同缩略图拼版（contact sheet）一起交付 MP4：

```bash
( cd "$PROJECT_DIR" && npx hyperframes render . --skill=music-to-video -q draft -o renders/video.mp4 --fps 30 )
```

**闸门：** `check` 已通过，并且快照已查看过；用户已批准（自主模式：检查已通过，并且交付内容包含缩略图拼版）；`renders/video.mp4` 已存在、带有音频，时长 == `audiomap.audio.duration_sec`。最终回复要写明 MP4 的路径和时长。

---

## 续跑表

| 你手上有                   | 从哪里继续    |
| -------------------------- | ------------- |
| 只有 `assets/bgm.mp3`      | Step 1        |
| `audiomap.json`            | Step 2        |
| `STORYBOARD.md`（骨架）    | Step 3        |
| `STORYBOARD.md`（完整）    | Step 4        |
| 全部 frame 文件            | Step 5        |
| `index.html`               | Step 6        |

## 速查

**画幅：** 默认横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`。在分镜的 frontmatter 里一次性设置画布（`canvas: { w, h, fps }`）。

`scripts/` 下的**脚本**：`analyze-beatgrid.py`（唯一的分析器）、`validate-plan.mjs`（计划检查）、`assemble-index.mjs`（组装 index）、`stage-assets.mjs`（暂存用户媒体）、`lib/storyboard.mjs`（内置的解析器）。其余一切都是 `hyperframes` CLI。

| 阅读                                                                                                           | 时机                                                    |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`references/frame-skeleton.md`](references/frame-skeleton.md)                                                 | Step 2：读懂音乐，排出各个 frame，设定 pacing           |
| [`references/planning.md`](references/planning.md) · [`storyboard-format.md`](references/storyboard-format.md) | Step 3：挑选品牌，填满每个 frame，写出计划              |
| [`references/template-catalog.md`](references/template-catalog.md)                                             | Step 3：为每个 group 挑一个模板                         |
| [`references/motion-primitive-catalog.md`](references/motion-primitive-catalog.md)                             | Step 3/4：用于自由组合的 L0 配方                        |
| [`references/montage.md`](references/montage.md)                                                               | Step 3/4：素材处理方式（beat-cut / ken-burns）          |
| [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md)                                                     | Step 4：派发 + 构建一个 frame                           |
| `../hyperframes/references/subagent-dispatch.md`                                                               | Step 4：安全地派发子 agent                              |
| `../hyperframes-creative/references/design-spec.md`                                                            | Step 3：挑选 preset（即品牌）                           |

## 目录结构

```
music-to-video/
  SKILL.md
  references/   frame-skeleton.md · planning.md · storyboard-format.md
                template-catalog.md · motion-primitive-catalog.md · montage.md
                templates/<id>/          { index.html (+ assets/ · program.json) }  ← L1 catalog impls
                motion-primitives/<id>/  { index.html (mounts the scene), scene.html (the sub-composition) } (+ ../assets/gsap.min.js shared by recipes) ← L0 catalog impls
  scripts/      analyze-beatgrid.py · assemble-index.mjs · validate-plan.mjs · stage-assets.mjs · lib/storyboard.mjs
  sub-agents/   frame-worker.md   ← the one subagent (one per frame)
```

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/frame-skeleton.md](references/frame-skeleton.md) —— Frame 骨架（Step 2）—— 读懂音乐，排出各个 frame
- [references/montage.md](references/montage.md) —— 素材处理方式 —— 把用户媒体编织到节拍主干上
- [references/motion-primitive-catalog.md](references/motion-primitive-catalog.md) —— 运动基本元素 catalog —— 自由组合菜单
- [references/motion-primitives/text-spectral-rays/USAGE.md](references/motion-primitives/text-spectral-rays/USAGE.md) —— 使用 text-spectral-rays —— 它独占自己的文字标志
- [references/planning.md](references/planning.md) —— 规划（Step 3）—— 挑选品牌，填满每一个 frame
- [references/storyboard-format.md](references/storyboard-format.md) —— STORYBOARD.md 格式 —— frame → group
- [references/template-catalog.md](references/template-catalog.md) —— 模板 catalog —— 选择菜单（Step 3）
- [sub-agents/frame-worker.md](sub-agents/frame-worker.md) —— Frame worker —— 逐 frame 的 composition 作者（music-to-video）
