---
name: faceless-explainer
description: "把任意文本 —— 一篇文章、笔记、一个话题、一份 brief —— 做成无人出镜讲解视频：没有网站或素材画面可抓取，所以视觉按场景自创（字体排版、抽象图形、图示、数据可视化）。用于话题讲解、概念拆解、操作教程、清单类视频。不用于基于网站做的视频（/product-launch-video —— 宣传片或导览）。拿不准 → /hyperframes。"
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/faceless-explainer/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update faceless-explainer`。一切都是最新时它会快速空跑；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再依赖它们。

> **media-use**：在获取音频 / 图片 / logo 之前，调用 `/media-use`，从 HeyGen 素材库解析 BGM / 音效（SFX）/ 图片，并从官方来源获取品牌 logo。先运行 `--adopt` 登记已有素材。参见 `/media-use` skill。当宿主应用自带音乐或音效工具时，音乐和音效就用宿主的工具。

# Faceless Explainer to HyperFrames

用本 skill 把一段文本做成一支讲解视频：挑一套设计系统，规划一个教学故事，然后在 HyperFrames 里逐帧构建它。**无人出镜**意味着每一个视觉元素都在下游自创 —— 没有抓取步骤，也没有真实的素材清单。

> **入口是 `/hyperframes`。** 你是编排者。执行每一步，核验它的闸门，然后才继续。本 skill 针对的是**从文本出发讲解一个话题，没有产品、也没有网站可抓取**。任何其他意图、一句光秃秃的"做个视频"，或任何不确定 → 先读 `/hyperframes` —— 每个路由决策都归意图层管，而且一个没有 `BRIEF.md` 就直接来到这里的全新创作请求，无论如何都要先过意图层（Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 里工作。按顺序执行各步，通过每个闸门后再继续。需要用户把关的步骤是 Step 0、Step 3 和 Step 6。在 Step 0 之前先读 `../hyperframes/references/brief-contract.md` —— 它定义了闸门类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出支配 Step 3/4/6 闸门的模式。除 Step 5 之外的每一步都由你亲自完成；在 Step 5 你为每一帧派发一个子 agent。不要把设计或运动规则写在这里；它们放在 frame-worker 子 agent、本 skill 本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 里。

工作流：Step 0 setup → `hyperframes.json`；Step 1 brief → `capture/extracted/`；Step 2 设计系统 → `frame.md`；Step 3 分镜 / 脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 → `audio_meta.json`；Step 4 视觉设计 → 充实后的 `STORYBOARD.md`；Step 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 → `renders/video.mp4`。

---

## Step 0：Setup（准备）

目标：带着一份已确认的 brief 进入，创建 HyperFrames 项目，并把 brief 持久化。

**brief 由意图层确认，而不是靠在这里提问。** 开场规则，按顺序：**(1)** `BRIEF.md` 存在 → 读它，什么都不问 —— brief 已经定下，它的 `flow`/`storyboard` 推导出模式（brief contract § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从分镜的 frontmatter 和已记录的偏好恢复；绝不重新盘问一个建到一半的项目。**(3)** 两者都没有 —— 一个直接来到这里的全新创作请求 → 读 `/hyperframes` 并运行它的意图层（`references/intent-interview.md`）：它会检查配方和记住的默认值，主持本路由的提问（`../hyperframes/references/routes/faceless-explainer.md`），然后交回锁定的 brief。编辑请求跳过以上全部 —— 直接去做编辑。

只有在 `hyperframes.json` 缺失时才初始化。用话题的 kebab-case 形式给 `<project>` 命名，比如 `compound-interest-explained`；绝不使用工作区名或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=faceless-explainer` —— `init` 会把已安装的 skill 与 GitHub 上的最新版本比对，有任何过期就更新全局的那一套。

init 之后，令 `<PROJECT_ROOT>` 为 `videos/<project>`，之后每条使用相对路径的命令都以这个目录作为工作目录运行。在下面的命令里，`.` 表示 `<PROJECT_ROOT>`；绝不在调用方目录里写 `.media`、`capture` 或输出文件。

**init 之后立即写 `BRIEF.md`**（绝不在之前 —— `init` 会拒绝非空目录）：内容是意图层锁定的 brief，格式按 `../hyperframes/references/brief-format.md`。把 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好支撑的回答（`brief-format.md` 列出了是哪些）。如果意图层采用了某个配方，运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会把配方的 `frame.md` 复制进项目（于是跳过 Step 2），并返回 Step 3 起草所依据的骨架。配方填的是回答，不是批准；评审闸门照常执行。

**在越过 Setup 之前先展示登录状态** —— 运行 `npx hyperframes auth status` 并逐字转述它的输出。它会报告配音 / BGM 将使用 HeyGen 还是本地引擎，未登录时还会说明如何登录。只走一个分支：

- **协作：** 等用户登录，或明确选择 `offline` / `go`。
- **自主：** 说明状态，然后用可用的本地引擎继续。

当没有离线提供方时，不要悄悄略过一项必需的能力；要把阻塞点摆出来。不要把这个决定折进另一个问题里，也不要把密钥写进某个仓库自己的 `.env`。认证归属和离线兜底：`/media-use` 的 `references/setup-providers.md` § Providers。

**闸门：** `hyperframes.json` 和 `BRIEF.md` 存在；有偏好支撑的回答已经记录（brief contract § 2）；已展示登录状态（已登录，或以离线方式继续）。

---

## Step 1：Brief（不抓取）

目标：把用户的文本并入项目，作为信息来源。这里**没有网站抓取，也没有真实素材** —— 这是一支无人出镜讲解视频。

逐字保存用户的完整输入，然后手工创建合成的抓取包：

- `capture/extracted/visible-text.txt` —— 完整的文章 / 笔记 / 话题 / brief，逐字照录。这是**信息**的来源，不是故事模板（Step 3 会重塑它）。
- `capture/extracted/tokens.json` —— `{ "title": "", "description": "", "colors": [], "fonts": [] }`。根据 brief 填 `title`/`description`。`colors`/`fonts` 留空，除非用户明确给出了品牌颜色或字体 —— 那时再加进去（无论如何，设计 preset 都会提供一套完整的色板）。

如果用户粘贴了脚本或者希望保留自己的措辞，把它逐字保存为 `user_script.txt`；`VO_MODE`（逐字照念还是重组）来自 `BRIEF.md` —— 脚本一到，意图层就会问这个问题。只有在 brief 不知为何缺了它时，才在这里问一次，并把答案存下来供 Step 3 使用。

**不要**运行 `npx hyperframes capture`（没有 URL）。不要创建 `asset-descriptions.md`，也不要往 `capture/assets/` 里放东西 —— 无人出镜的视觉在 Steps 4-5 自创，不是抓取来的。唯一的例外：如果用户提供了一张真实图片，把它放在 `public/<basename>` 下，并记下来供 Step 3 使用。

**闸门：** `capture/extracted/visible-text.txt` 和 `capture/extracted/tokens.json` 存在；你能用一句清楚的话说出这支讲解视频的话题和受众。

---

## Step 2：设计系统

目标：选一个随附的 frame preset；由一个脚本把它变成本视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 点名了一个 `style_preset` 时 —— 那是用户在意图层从展示样例里凭眼睛挑中的 —— 就用它；只有 brief 没说时，才由你来判断。然后你只做一个决定 —— **用哪个 preset**：读 `../hyperframes-creative/references/design-spec.md`，浏览 `../hyperframes-creative/frame-presets/`；挑出外观最契合话题、调性和受众的那个 preset。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

剩下的事脚本会以确定性的方式完成：把 preset 的 `FRAME.md` 复制为 `frame.md`，并按 `capture/extracted/tokens.json` 里的品牌 token（如果有的话）**重新混配**（品牌颜色按角色映射到 preset 的颜色键上；preset 的 display + body 字体换成品牌的），把 preset 的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并自我校验（映射损坏时以 1 退出）。只要它以 0 退出就继续 —— 不要手改规范。

无人出镜讲解视频通常**没有品牌颜色 / 字体**（`tokens.json` 的 colors/fonts 为空）→ 脚本保留 preset 自己的色板，这本身就是一套完整、可交付的设计。只有当用户点名了品牌颜色 / 字体时，才在运行前把它们加进 `tokens.json`；之后也只有在某个映射确实需要时，才手工调整 `frame.md`。

**闸门：** `build-frame.mjs` 以 0 退出 —— `frame.md` 已由一个有名字的 preset 生成，并且（当 preset 附带字幕皮肤时）`.hyperframes/caption-skin.html` 作为字幕皮肤源已存在；所选的 preset 已作为偏好记录下来（`--key style_preset --workflow <this workflow>`，brief contract § 2）。

---

## Step 3：分镜与脚本

目标：把文本变成一份已批准的逐帧教学计划。

读 `../hyperframes-creative/references/story-spine.md`（hook 用语、先价值后证据、分镜即提案、可溯源的视觉）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes/references/storyboard-format.md` 和 `../hyperframes/references/script-format.md`。用它们来写 `STORYBOARD.md`，需要旁白时再写 `SCRIPT.md`。根据 brief 的 `length` 设置 frontmatter 的 `duration:` —— 这是一个粗略的预期；组装时会报告成片相对它落在哪里。

用 `story-design.md` 来确定讲解结构（concept / how-to / listicle / story）、hook 策略、清晰化技法、情绪节拍、type 枚举的映射，以及 `VO_MODE`。视频的顺序来自**叙事设计，而不是输入文本的段落顺序** —— 重排、合并、删减、压缩。作为**软性指引**，参考 `../hyperframes-animation/blueprints-index.md` 里的"角色→蓝图"菜单：对每个段落节拍，按其候选蓝图所暗示的形状来写旁白，有合适的就打上那个候选的 `blueprint:` id。哪些段落节拍存在仍由教学真相决定 —— 绝不为了套一个蓝图而硬扭一个段落节拍，也绝不仅仅因为有一个现成的形状就凭空造一个段落节拍。无人出镜的视觉在下游自创，所以各帧**不**带素材清单：`asset_candidates` 留空，除非用户提供了一张真实的 `public/<basename>` 图片。使用分镜和脚本参考文档里规定的确切必填字段。

起草完后，运行评审循环的计划环节 —— `../hyperframes/references/review-loop.md` § 1：把计划作为提案呈现，并问两个问题 —— 批准还是修改，以及**先出草图**（推荐）还是跳过。反馈以聊天回复的形式到来；循环直到批准。这是一个**检查点闸门**（brief contract § 1）：在自主模式下没什么要问的 —— 把同样的摘要作为预告发出去然后继续；草图并入构建环节，带着那唯一一个问题的最终预览在 Step 6 出现。

**闸门：** `STORYBOARD.md` 存在，每一帧都有必需的叙事字段，需要旁白时 `SCRIPT.md` 存在，且用户已批准逐帧计划（自主模式：摘要已作为预告发出）。

---

## Step 3.1：音频

目标：根据已批准的脚本生成旁白、词级时间戳、音乐和音频元数据。

在 Step 3 批准之后开始音频。让它在后台运行，然后继续 Step 4。（登录状态已经在 Step 0 展示过；引擎会自动回退。）

**调用之前，先按用户的要求选好旁白声音。** 如果请求里点名了某个声音、性别或语气，就挑一个匹配的 voice id，用 `--voice <id>` 传入。否则流水线默认是 HeyGen 上的 **Marcia（女声）** / Kokoro 上的 `am_michael` —— 所以像"用男声"这样的要求，除非你传了这个参数，否则会被悄悄忽略。voice id 因提供方而异；按 Step 0 登录状态选中的那个提供方来解析：**HeyGen**（已登录）用 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）用 `<MEDIA_DIR>/audio/references/tts.md` 里的声音表（前缀 `am_`/`bm_` 是男声，`af_`/`bf_` 是女声）。用户没有表达偏好时，先回退到记住的声音（brief contract § 2），再回退到流水线默认，并说明你用了哪个；只有两者都没有指定声音时才省略 `--voice`。用户这次运行中明确选了某个声音时，把它记录下来（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

这个音频脚本负责旁白、词级时间戳、从 HeyGen 音乐库查找 BGM，以及时间元数据。BGM 的情绪来自分镜的 `music:` 字段。这里用的是 HeyGen Audio API 的检索功能，不是生成，凭据和 TTS 一样是 `~/.heygen`。提供方的细节读 `../media-use/audio/references/tts.md`。当音乐或某个音效由宿主应用自己的工具制作时，把文件放到 assets/ 下，并在 audio_meta.json 文件里列出它，标记为 `"source": "host"`：音乐作为 `bgm` `{ "path": "assets/…", "source": "host" }`，同时分镜里写 `music: none`；音效作为一条 `sfx` 条目 `{ "frame": <n>, "file": "assets/…", "offset_s": 0, "duration_s": <its length>, "source": "host" }`。每一次音频处理都会保留这些条目，带有宿主音效的帧不会再去查找音效提示。

如果没有旁白也没有 `SCRIPT.md`，跳过配音生成。如果分镜有音乐情绪，BGM 仍然可以运行。

**标准的完全静音标记**（复用这套音频模型的各工作流共用）：STORYBOARD.md 顶部 YAML 块里写 `music: none`、没有 `SCRIPT.md`，**并且**没有 `sfx:` 音效提示或宿主音频。这个组合把项目标记为静音 —— 没有旁白、没有 BGM、没有音效。`audio.mjs` 能识别它，什么都不生成（它会删除任何过时的 `audio_meta.json`；没有 `audio_meta.json` 正是组装环节判定静音的依据），因此这一步会干净地跳过。没有旁白但有 `sfx:` 音效提示或宿主音频时，影片就不是静音的：`audio.mjs` 会写出 audio_meta.json 文件，供 `fetch-sfx` 填充。有旁白时写 `music: none` 会保留 TTS，只关掉 BGM。严格使用这个写法 —— 不要自创其他标记。

**闸门：** 音频任务已启动，或项目已标记为静音（`music: none`、没有 `SCRIPT.md`、没有 `sfx:` 音效提示或宿主音频）。

---

## Step 4：帧的视觉设计

目标：给每个分镜帧补上视觉方向、布局意图和运动选择。

**先画分镜草图表（仅协作模式）。** 计划一获批准，就运行草图环节 —— `../hyperframes/references/review-loop.md` § 2（不用等 Step 3.1；草图用不到时间戳）：你亲自把每一帧画成 `storyboard.html` 里的一个单元格线框图（`../hyperframes-creative/references/storyboard-recipe.md` § 3），把每帧标记为 `built`，当每一帧都 `built` 后停下来问那一个布局问题，并且只修改被点名的草图，直到草图表被确认。只有到这时，才把下面的视觉设计写到已确认的布局上。在自主模式下，或者用户在 Step 3 选择跳过草图时，跳过这一环节 —— 各帧在 Step 5 直接从 `outline` 变为 `animated`。

就地编辑 `STORYBOARD.md`。不要另建一份分镜。以 `frame.md` 作为颜色、字体、布局感觉和风格的唯一依据。

读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。用 `visual-design.md` 获取方法（带时间码的镜头序列、内联的 Layout 词汇，以及自创视觉的处理方式），以及必需的 `## Video direction` 块。用 `../hyperframes-animation/blueprints-index.md` 为每一帧挑选镜头形状。运动方面用 `motion-language.md`（运动词汇 + 运动准则）和 `../hyperframes-animation/rules-index.md`（有效的规则名）—— 不要自创运动名。

**在自创任何有名字的视觉效果之前，先搜索在线目录。** 无人出镜讲解视频的每一个视觉都是自创的，而这恰恰是最容易手工重造一个已有 block 的时候。对于 brief 点名的每一种外观、效果、处理或转场 ——"CRT 扫描线"、"故障效果"、"胶片颗粒"、"闪光扫过"、"彩纸爆开"—— 在把这个效果写进 `STORYBOARD.md` 之前，先运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读排名靠前的结果。这个搜索**什么都不需要安装**：不需要项目、不需要事先 `add`、不需要账号。它在任何目录下都会对整个托管 registry（约 400 个 block 和 component）做排序。已经能完成这项工作的 block 就成为这一帧的 `focal` —— 在这里写明它；Step 5 会在派发前把它预装一次，由对应的 worker 定制它。只有在为某个视觉搜过之后确实没有合适的结果，才自创它。

对每一帧，按 `visual-design.md` 的方法把一段**带时间码的镜头序列**写进 `STORYBOARD.md`：挑选这一帧的蓝图（或自行编排），用**这一帧**的**自创**内容实例化它，并让每个 Scene 的揭示跟随旁白的节奏，让这一帧在整个时长内逐步展开，而不是前置堆砌然后冻住。因为这是无人出镜讲解视频，`focal`/`roles` 点名的是**自创的视觉元素**（一个 hero 词、一个图示节点、一个数据可视化系列）—— 你是在设计它们，而不是挑选抓取来的素材。每个 Scene **就地**写明布局和运动（词汇见 `visual-design.md` 和 `motion-language.md`）。加一个全片通用的 `## Video direction` 块。

不要改动故事、脚本、`transition_in` 或源文本。这一步不要写 HTML。**没有素材暂存步骤** —— 无人出镜的视觉由 worker 在 Step 5 构建。如果用户提供了一张真实的 `public/<basename>` 图片，在相关帧的 `focal`/`roles` 里按路径引用它；否则没有什么需要暂存。

**闸门：** 每一帧都有一段带时间码的镜头序列，其揭示跟随旁白的节奏（没有前置堆砌）；每一帧都写明了它自创的 `focal` 和 / 或 `roles`；`## Video direction` 存在。协作模式：草图表已确认。

---

## Step 5：构建帧

目标：把每个分镜帧构建成一个 HTML composition，并组装出可播放的视频。

如果启动了音频，等 Step 3.1 的音频完成。然后同步时长并拉取音效；静音时两者都跳过。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械性的：真实的配音时长优先；静音帧保留估计值；绝不手改同步后的时长。

**预装 registry block**：在派发之前，把 `STORYBOARD.md` 里点名的所有 block 一次装好，这样并行的 worker 就不会在 registry 上竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

派发之前，先读 `../hyperframes/references/subagent-dispatch.md`。构建逐帧的帧包和 worker 角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写出一个有上限的帧包（packet）（这一帧确切的分镜块 + 蓝图正文 + 每一条被引用的规则配方，全部内联），以及 `_role.md`（`../hyperframes/references/frame-worker-core.md` + 本 skill 的 `sub-agents/frame-worker.md`，原样拼接 —— 即完整的 worker 角色）。每一帧派发一个子 agent，能并行就并行；否则分批运行 worker。每个 worker 恰好拿到一帧：它的 prompt 带上 `_role.md` 和那一帧的帧包 —— 两者完整粘贴，或者把两个文件路径交给 worker 让它先读（两者等价；无论哪种方式，worker 都恰好从这两份文档开始）—— 外加一份派发上下文，包含 `PROJECT_DIR`、`frame_id`、这一帧在磁盘上是否有一份**已确认的草图**（worker 在这个布局上做细化，而不是重画 —— frame-worker core § When a confirmed sketch exists）、画布尺寸，以及字幕状态 + 启用字幕时的避让带。

worker 只读它们的帧包和 `frame.md`；它们绝不打开 `STORYBOARD.md` 或 skill 文档（帧包内联了上游选定的内容）。每个 worker 只写 `compositions/frames/NN-*.html`。worker 绝不能编辑 `STORYBOARD.md`。

**满版背景放在一个 `class="clip"` 图层上，绝不放在 `#root` 上。** 一帧的底（色块 / 渐变 / 网格）是它自己的一个全时长背景 clip —— 设在 `#root` / `data-composition-id` 元素上的 `background` 受 clip 门控，只在这一帧的时间窗口内生效，不是可靠的底，因此深色内容可能落在黑色的宿主 `body` 上，渲染出来看不见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色画在 index 的 `#root` 上。（完整规则 + 自检：`../hyperframes/references/frame-worker-core.md`。）

每个 worker 返回时，编排者在 `STORYBOARD.md` 里把那一帧标记为 `animated`。

有了音频时间戳之后，在后台构建字幕并组装 index：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在 Step 2 复制进来）作为字幕外观，并从 `frame.md` 注入品牌 token；没有皮肤时它渲染内置的默认胶囊。`captions: skipped (<reason>)` 是有效结果。明确跳过时，不带字幕继续。

**闸门：** 每一帧都标记为 `animated`（协作模式：草图表已在 Step 4 确认），`index.html` 存在，字幕已构建或已明确跳过。

---

## Step 6：收尾

目标：核验组装好的视频，取得用户批准，并渲染最终的 MP4。

注入转场、运行检查、停下来等评审，然后渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会把抓取的各帧拼成一张联系表（`snapshots/contact-sheet.jpg`）。扫一眼；如果没有明显的问题，就继续 —— 不要在这里逗留。

如果某条命令失败，把 stderr 摆出来并停下 —— 不要堆砌一串补救命令。自己修：对 `compositions/frames/NN-*.html` 做代价最小的安全修改，然后重跑失败的那项检查。

**已知的误报 —— 不要去追。**`check` 可能会在**字幕**高亮词上（选择器 `#caption-word-*` / `.caption-line`）报出几个约 1–4px 的 `text_box_overflow` 发现。字幕胶囊特意用了偏紧的 `line-height`（在 `scripts/captions.mjs` 里统一设置），并且**没有 `overflow:hidden`**，所以粗重展示字形的墨迹会溢出几个像素到胶囊自己的内边距里 —— 实际上什么都没被裁掉。把这些当作预期内的情况，继续往下走。**不要**调大字幕的 `line-height`（那会让胶囊膨胀，更糟）。只有当 `text_box_overflow` 指向的是**帧**元素（`#el-NN-*`）而不是字幕词时，才去处理。

检查通过后，停下来等用户评审 —— 即评审循环的最终查看（`../hyperframes/references/review-loop.md` § 4）：在最终的 Studio 预览上只问一个问题 —— 现在渲染，还是要改什么？（自主模式：一样，作为保留下来的那一个问题 —— 即使用户没要求，也打开预览。）然后交付 MP4，附上联系表和各帧 id，以便修改时能定位到单独一帧。

预览：`npx hyperframes preview --background`

只有在用户批准之后才渲染（自主模式：在问过渲染还是修改之后）：

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4`

渲染之后不要再重跑 `lint`、`check` 或 `snapshot`，除非用户要求。

**闸门：** 渲染前 `lint` 和 `check` 已通过，快照已查看；用户在评审停顿处已批准（自主模式：检查已通过，交付物包含联系表）；`renders/video.mp4` 存在。最终回复写明 MP4 路径和最终时长。

---

## 速查

**画幅：** 横版 `1920x1080`；竖版 `1080x1920`；方形 `1080x1080` —— 由投放渠道推导（brief contract § 2）。在分镜 frontmatter 里设置一次画幅。

**无人出镜相对于抓取素材型工作流的差异：** 没有 Step 1 的抓取（合成的 `tokens.json` + `visible-text.txt`）；没有 `asset-descriptions.md`，也没有 `capture/assets/`；Step 4 没有素材暂存；`asset_candidates` 默认为空；每一个视觉都由 Step 5 的 worker 自创（字体排版 / 抽象图形 / 图示 / 数据可视化）。用户提供的 `public/<basename>` 图片是唯一的真实素材路径。

**后台脚本：** 本工作流在 `scripts/` 下只附带这些：`build-frame`，用于采用一个 frame preset 并按品牌重新混配成 `frame.md`（+ 字幕皮肤）；`audio`，用于 TTS、转写、BGM、音效和时长同步；`captions`；`transitions`，用于注入和核验；以及 `assemble-index`。其余一切都是 `hyperframes` CLI。

可复用的、与领域无关的镜头形状放在 `../hyperframes-animation/blueprints/`（由 `../hyperframes-animation/blueprints-index.md` 建索引）。

| 读什么 | 何时读 |
| --- | --- |
| `[../hyperframes/references/brief-contract.md](../hyperframes/references/brief-contract.md)` | 闸门类型、由 `BRIEF.md` 推导模式、字段语义。 |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)` | Step 3：故事准则 —— hook 用语、先价值后证据、提案形态、可溯源的视觉。 |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)` | Step 2：选择并采用一个 frame preset。 |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)` | Step 2：正确应用品牌 token。 |
| `[references/story-design.md](references/story-design.md)` | Step 3：规划讲解视频的故事。 |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)` | Step 3："角色→蓝图"菜单。Step 4：挑选镜头形状。 |
| `[../hyperframes/references/storyboard-format.md](../hyperframes/references/storyboard-format.md)` | Step 3：写 `STORYBOARD.md`。 |
| `[../hyperframes/references/script-format.md](../hyperframes/references/script-format.md)` | Step 3：写 `SCRIPT.md`。 |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)` | Step 3.1：选择或了解 TTS 提供方和声音。 |
| `[references/visual-design.md](references/visual-design.md)` | Step 4：写这一帧的镜头序列（+ Layout 词汇）。 |
| `[references/motion-language.md](references/motion-language.md)` | Step 4：运动词汇 + 运动准则。 |
| `[references/cut-catalog.md](references/cut-catalog.md)` | Step 4-5：切法目录（worker 构建帧内接缝）。 |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | Step 5：被引用的运动所对应的本地规则配方正文。 |
| `[../hyperframes/references/frame-worker-core.md](../hyperframes/references/frame-worker-core.md)` | Step 5：共享的 worker 契约（帧包构建器把它加在增量部分前面）。 |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)` | Step 5：本工作流的 frame-worker 增量部分。 |
| `[../hyperframes/references/subagent-dispatch.md](../hyperframes/references/subagent-dispatch.md)` | Step 5：安全地派发子 agent。 |

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/cut-catalog.md](references/cut-catalog.md) —— 切法目录 —— 帧内接缝（由 worker 构建）
- [references/motion-language.md](references/motion-language.md) —— 运动语言 —— 运动词汇 + 运动准则 + seek 安全核心
- [references/story-design.md](references/story-design.md) —— 故事设计 —— 无人出镜讲解视频
- [references/visual-design.md](references/visual-design.md) —— 视觉设计 —— faceless-explainer 的逐帧镜头方法
- [sub-agents/frame-worker.md](sub-agents/frame-worker.md) —— Frame worker —— faceless-explainer 增量部分
