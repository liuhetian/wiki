---
name: pr-to-video
description: "把一个 GitHub pull request（PR URL、owner/repo#N，或已 checkout 仓库里的「this PR」）做成代码变更讲解视频 —— 由 diff、commit 和文件构建出的 changelog、功能揭晓、修复讲解或重构走查：输入是一次代码变更，不是网站。不是产品宣传片（/product-launch-video），也不是没有 PR 的主题讲解视频（/faceless-explainer）。拿不准 → /hyperframes。"
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/pr-to-video/SKILL.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：**`npx hyperframes skills update pr-to-video`。一切都是最新时它会快速空跑；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再依赖它们。

> **media-use**：在获取音频 / 图片 / logo 之前，调用 `/media-use`，从 HeyGen 素材库解析 BGM / 音效（SFX）/ 图片，并从官方来源获取品牌 logo。先运行 `--adopt` 登记已有素材。参见 `/media-use` skill。当宿主应用自带音乐或音效工具时，音乐和音效就用宿主的工具。

# PR to HyperFrames

用本 skill 读入一个 GitHub pull request、理解这次变更、规划一支代码变更讲解视频，并在 HyperFrames 里逐帧构建它。输入是一次**代码变更**（通过 `gh` 读取），不是网站 —— **没有抓取步骤，除了贡献者头像之外也没有真实素材**。

> **入口是 `/hyperframes`。** 你是编排者。执行每一步，核验它的闸门，然后才继续。本 skill 针对的是 **GitHub pull request**（一次代码变更）。任何其他意图、一句光秃秃的"做个视频"，或任何不确定 → 先读 `/hyperframes` —— 每个路由决策都归意图层管，而且一个没有 `BRIEF.md` 就直接来到这里的全新创作请求，无论如何都要先过意图层（Setup 的开场规则）。

你是编排者。默认在解析出的外部 `PROJECT_DIR` 里工作，绝不在调用方仓库里工作。按顺序执行各步，通过每个闸门后再继续。需要用户把关的步骤是 Step 0、Step 3 和 Step 6。在 Step 0 之前先读 `../hyperframes/references/brief-contract.md` —— 它定义了闸门类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出支配 Step 3/4/6 闸门的模式。除 Step 5 之外的每一步都由你亲自完成；在 Step 5 你派发一个有上限的 frame worker 池。不要把设计或动效规则写在这里；它们放在 frame-worker 子 agent、本 skill 本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 里。

工作流：Step 0 setup → `hyperframes.json`；Step 1 读入 → `capture/extracted/` + `assets/<login>.png`；Step 2 设计系统 → `frame.md`；Step 3 分镜 / 脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 → `audio_meta.json`；Step 4 视觉设计 → 充实后的 `STORYBOARD.md`；Step 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 → `renders/video.mp4`。

---

## Step 0：Setup（准备）

目标：带着一份已确认的 brief 进入 —— 其中包括 **PR 引用**（完整 URL、`<owner>/<repo>#<N>` 引用，或在已 checkout 的仓库里说「this PR」（这个 PR））—— 创建 HyperFrames 项目，并把 brief 持久化。风格始终是 **code-editorial**（在 Step 2 固定，从不询问）。

**brief 由意图层确认，而不是靠在这里提问。** 开场规则，按顺序：**(1)** `BRIEF.md` 存在 → 读它，什么都不问 —— brief 已经定下，它的 `flow`/`storyboard` 推导出模式（brief contract § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从分镜的 frontmatter 和已记录的偏好恢复；绝不重新盘问一个建到一半的项目。**(3)** 两者都没有 —— 一个直接来到这里的全新创作请求 → 读 `/hyperframes` 并运行它的意图层（`references/intent-interview.md`）：它会检查配方和记住的默认值，并主持本路由的提问 —— 包括 PR 规模 → 时长的准则，这条准则完整地写在 `../hyperframes/references/routes/pr-to-video.md` 里 —— 然后交回锁定的 brief。编辑请求跳过以上全部 —— 直接去做编辑。

在做任何其他工作之前先解析项目目录。保留用户提供的项目目录；否则使用解析器打印出的持久外部缓存位置。绝不在调用方仓库里创建 `videos/`：

```bash
PR="<url | owner/repo#N>"
if [ -n "${EXPLICIT_PROJECT_DIR:-}" ]; then
  PROJECT_DIR="$(node <SKILL_DIR>/scripts/project-dir.mjs --pr "$PR" --project-dir "$EXPLICIT_PROJECT_DIR")"
else
  PROJECT_DIR="$(node <SKILL_DIR>/scripts/project-dir.mjs --pr "$PR")"
fi
echo "PR-to-video project: $PROJECT_DIR"
node <SKILL_DIR>/scripts/preflight.mjs
```

能力预检在拉取、故事工作、音频或帧派发之前运行。如果已安装的 CLI 无法运行本 skill 要求的校验命令，就按它给出的升级指示停下，而不是先把这次运行的上下文耗掉。

只有在 `$PROJECT_DIR/hyperframes.json` 缺失时才初始化。它的目录名（basename）取自 PR，比如 `acme-sdk-pr-1842`；绝不使用工作区名或时间戳。

`npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=pr-to-video` —— `init` 会把已安装的 skill 与 GitHub 上的最新版本比对，有任何过期就更新全局的那一套。

下面每条使用相对路径的命令，都以 `$PROJECT_DIR` 作为工作目录运行。没有显式子 shell 的示例都表示 `(cd "$PROJECT_DIR" && …)`；绝不改动调用方仓库的工作树。

**init 之后立即写 `BRIEF.md`**（绝不在之前 —— `init` 会拒绝非空目录）：内容是意图层锁定的 brief，格式按 `../hyperframes/references/brief-format.md`。把 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好支撑的回答（`brief-format.md` 列出了是哪些）。如果意图层采用了某个配方，运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会把配方的 `frame.md` 复制进项目（于是跳过 Step 2），并返回 Step 3 起草所依据的骨架。配方填的是回答，不是批准；评审闸门照常执行。

**在越过 Setup 之前先展示登录状态** —— 运行 `npx hyperframes auth status` 并逐字转述它的输出。它会报告配音 / BGM 将使用 HeyGen 还是本地引擎，未登录时还会说明如何登录。只走一个分支：

- **协作：** 等用户登录，或明确选择 `offline` / `go`。
- **自主：** 说明状态，然后用可用的本地引擎继续。

当没有离线提供方时，不要悄悄略过一项必需的能力；要把阻塞点摆出来。不要把这个决定折进另一个问题里，也不要把密钥写进某个仓库自己的 `.env`。认证归属和离线兜底：`/media-use` 的 `references/setup-providers.md` § Providers。

**闸门：** `hyperframes.json` 和 `BRIEF.md` 存在；PR 引用已记进 brief；有偏好支撑的回答已经记录（brief contract § 2）；已展示登录状态（已登录，或以离线方式继续）。

---

## Step 1：读入 PR（不抓取）

目标：拉取 PR 的事实，把它们并入项目，作为信息来源。这里**没有网站抓取**。`fetch-pr.mjs` 以确定性的方式运行 `gh` —— 通过分页的 `gh api` 补全文件列表，这样大 PR 不会在约 100 个文件处被截断，并且只写 `capture/pr.json` + `capture/diff.patch`（没有临时目录）。对于 MERGED 状态的 PR，它还会尽力解析出一个 `shipped_version`（+ `version_source`）写进 `pr.json`，让片尾卡能引用一个真实版本号，而不是编造一个。然后 `ingest.mjs` 离线把这些并入合成的抓取包。

```bash
PR="<url | owner/repo#N | N>"

# Fetch the PR deterministically: runs gh, completes the files list via paginated
# gh api (so a big PR doesn't truncate at ~100 files), writes only capture/pr.json +
# capture/diff.patch — no scratch dir. gh auth / not-found / private errors exit 1 here.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-pr.mjs --pr "$PR" --out-dir ./capture)

# Offline transform → capture/extracted/{tokens.json (colors:[] → code-editorial palette),
# visible-text.txt (the brief), people.json (contributors, bot-filtered, name+login,
# avatarFile=assets/<login>.png)}.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/ingest.mjs \
  --pr-json ./capture/pr.json --diff ./capture/diff.patch --out-dir ./capture/extracted)

# The people front's one network step — download each contributor's GitHub avatar to
# assets/<login>.png for the credits close. Best-effort; always exits 0.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-people-avatars.mjs \
  --people ./capture/extracted/people.json)
```

如果 `fetch-pr.mjs` 以 1 退出（gh 认证 / 找不到 / 私有），报告它的 stderr 并停下 —— **不要编造 PR 内容**。如果 `ingest.mjs` 以 1 退出，读它的 stderr（通常是 `pr.json` 格式有误），修好后重跑（它是确定性的）。`fetch-people-avatars.mjs` 总是以 0 退出；缺头像只意味着没有片尾致谢可写。

`people.json` 为 `gh` 已经给出名字的那些贡献者（PR 作者、commit 作者、`mergedBy`）带有 `name` —— 其余的人（reviewer / 评论者 / assignee，`gh pr view` 对他们永远只给一个光秃秃的 `login`）则为 `null`。在 Step 3 写片尾致谢之前，对那一帧上真正会出现的 1–6 个人，自己把 `null` 的名字解析出来：`gh api users/<login> --jq .name`（你已经有 `gh` 了 —— 不需要为此写脚本）。如果 GitHub 上这个用户也没有公开的名字，屏幕上就回退为显示 login，并把这个人从口播那句里拿掉（见 story-design.md 的致谢一节 —— 旁白仍然必须念名字，绝不念原始 handle）。

**闸门：** `capture/pr.json`、`capture/diff.patch`、`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt` 和 `capture/extracted/people.json` 存在；你能用一句清楚的话说出这个 PR 的变更。`assets/<login>.png` 是尽力而为的 —— 缺了不算失败。

---

## Step 2：设计系统

目标：采用 code-editorial frame preset；由一个脚本把它变成本视频的 `frame.md` + 字幕皮肤。

风格是固定的 —— **code-editorial**（温暖的编辑风；一个为 diff 打造的海军蓝代码面）。运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset code-editorial --hyperframes .
```

该脚本把 code-editorial preset 的 `FRAME.md` 复制为 `frame.md`，再按 `capture/extracted/tokens.json` 里的品牌 token（如果有的话）重新混配（PR 没有品牌 token → `colors:[]`/`fonts:[]` 会保留 code-editorial 自己的色板，这本身就是一套完整的设计），把 preset 的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并自我校验（映射损坏时以 1 退出）。只要它以 0 退出就继续 —— 不要手改。

**闸门：** `build-frame.mjs` 以 0 退出 —— `frame.md` 已由 code-editorial preset 生成，`.hyperframes/caption-skin.html` 作为字幕皮肤源已存在。

---

## Step 3：分镜与脚本

目标：把 PR 变成一份已批准的逐帧讲解计划。

读 `../hyperframes-creative/references/story-spine.md`（钩子用语、先价值后证据、分镜即提案、可溯源的视觉）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes/references/storyboard-format.md` 和 `../hyperframes/references/script-format.md`。用它们来写 `STORYBOARD.md`，需要旁白时再写 `SCRIPT.md`。根据 brief 的 `length` 设置 frontmatter 的 `duration:` —— 这是一个粗略的预期；组装时会报告成片相对它落在哪里。

用 `story-design.md` 来确定 PR 原型（changelog / feature-reveal / fix-explainer / refactor-walkthrough）、PR 原生的帧类型、钩子、说服手法、段落节拍、每帧的字数预算，以及片尾致谢。顺序来自**叙事设计，而不是 diff 的文件顺序** —— 讲解这次变更，不要把 diff 念出来。作为**软性指引**，参考 `../hyperframes-animation/blueprints-index.md` 里的 角色→blueprint 菜单：对每个段落节拍，按其候选 blueprint 所暗示的形状来写旁白，有合适的就打上那个候选的 `blueprint:` id（哪些段落节拍存在仍由故事的真实情况决定 —— 绝不为了套一个形状而硬造一个段落节拍）。挑出 2–4 个真实的 diff hunk（来自 `capture/diff.patch`）作为主角，每个都是一小段清晰可读的代码片段；在帧的 `scene` 里写明每个想用哪个 `code-*` block。除了片尾的 `credits` 帧（1–6 个 `assets/<login>.png` 头像），各帧都不带 `asset_candidates`。使用分镜和脚本参考文档里规定的确切必填字段。

起草完后，运行评审循环的计划环节 —— `../hyperframes/references/review-loop.md` § 1：把计划作为提案呈现，并问两个问题 —— 批准还是修改，以及**先出草图**（推荐）还是跳过。反馈以聊天回复的形式到来；循环直到批准。这是一个**检查点闸门**（brief contract § 1）：在自主模式下没什么要问的 —— 把同样的摘要作为预告发出去然后继续；草图并入构建环节，带着那唯一一个问题的最终预览在 Step 6 出现。

**闸门：** `STORYBOARD.md` 存在，每一帧都有必需的叙事字段，需要旁白时 `SCRIPT.md` 存在，且用户已批准计划（自主模式：摘要已作为预告发出）。

---

## Step 3.1：音频

目标：根据已批准的脚本生成旁白、词级时间戳、音乐和音频元数据。

在 Step 3 批准之后开始音频。让它在后台运行，然后继续 Step 4。

**调用之前，先按用户的要求选好旁白声音。** 如果请求里点名了某个声音、性别或语气，就挑一个匹配的 voice id，用 `--voice <id>` 传入。否则流水线默认是 HeyGen 上的 **Marcia（女声）** / Kokoro 上的 `am_michael` —— 所以像"用男声"这样的要求，除非你传了这个参数，否则会被悄悄忽略。voice id 因提供方而异；按 Step 0 登录状态选中的那个提供方来解析：**HeyGen**（已登录）用 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）用 `<MEDIA_DIR>/audio/references/tts.md` 里的声音表（前缀 `am_`/`bm_` 是男声，`af_`/`bf_` 是女声）。用户没有表达偏好时，先回退到记住的声音（brief contract § 2），再回退到流水线默认，并说明你用了哪个；只有两者都没有指定声音时才省略 `--voice`。用户这次运行中明确选了某个声音时，把它记录下来（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

这个音频脚本负责旁白、词级时间戳、从 HeyGen 音乐库查找 BGM，以及时间元数据。BGM 的情绪来自分镜的 `music:` 字段。这里用的是 HeyGen Audio API 的检索功能，不是生成，凭据和 TTS 一样是 `~/.heygen`。提供方的细节读 `../media-use/audio/references/tts.md`。当音乐或某个音效由宿主应用自己的工具制作时，把文件放到 assets/ 下，并在 audio_meta.json 文件里列出它，标记为 `"source": "host"`：音乐作为 `bgm` `{ "path": "assets/…", "source": "host" }`，同时分镜里写 `music: none`；音效作为一条 `sfx` 条目 `{ "frame": <n>, "file": "assets/…", "offset_s": 0, "duration_s": <its length>, "source": "host" }`。每一次音频处理都会保留这些条目，带有宿主音效的帧不会再去查找音效提示。

如果没有旁白也没有 `SCRIPT.md`，跳过配音生成。如果分镜有音乐情绪，BGM 仍然可以运行。

**标准的完全静音标记**（复用这套音频模型的各工作流共用）：STORYBOARD.md 顶部 YAML 块里写 `music: none`、没有 `SCRIPT.md`，**并且**没有 `sfx:` 音效提示或宿主音频。这个组合把项目标记为静音 —— 没有旁白、没有 BGM、没有音效。`audio.mjs` 能识别它，什么都不生成（它会删除任何过时的 `audio_meta.json`；没有 `audio_meta.json` 正是组装环节判定静音的依据），因此这一步会干净地跳过。没有旁白但有 `sfx:` 音效提示或宿主音频时，影片就不是静音的：`audio.mjs` 会写出 audio_meta.json 文件，供 `fetch-sfx` 填充。有旁白时写 `music: none` 会保留 TTS，只关掉 BGM。严格使用这个写法 —— 不要自创其他标记。

**闸门：** 音频任务已启动，或项目已标记为静音（`music: none`、没有 `SCRIPT.md`、没有 `sfx:` 音效提示或宿主音频）。

---

## Step 4：帧的视觉设计

目标：给每个分镜帧补上视觉方向、布局意图和动效选择。

**先画分镜草图表（仅协作模式）。** 计划一获批准，就运行草图环节 —— `../hyperframes/references/review-loop.md` § 2（不用等 Step 3.1；草图用不到时间戳）：你亲自把每一帧画成 `storyboard.html` 里的一个单元格线框图（`../hyperframes-creative/references/storyboard-recipe.md` § 3），把每帧标记为 `built`，当每一帧都 `built` 后停下来问那一个布局问题，并且只修改被点名的草图，直到草图表被确认。替身：对于一个**代码段落节拍**，用一个朴素的代码面板，带上文件名和几行真实的 diff 文本 —— `code-*` block 的接线归 worker 负责。只有到这时，才把下面的视觉设计写到已确认的布局上。在自主模式下，或者用户在 Step 3 选择跳过草图时，跳过这一环节 —— 各帧在 Step 5 直接从 `outline` 变为 `animated`。

就地编辑 `STORYBOARD.md`。不要另建一份分镜。以 `frame.md` 作为颜色、字体、布局感觉和风格的唯一依据。

读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md`、`references/code-vocabulary.md` 和 `../hyperframes-animation/rules-index.md`。用 `visual-design.md` 获取方法（带时间码的镜头序列、内联的布局词汇，以及代码段落节拍的处理方式），以及必需的 `## Video direction` 块。用 `../hyperframes-animation/blueprints-index.md` 为每一帧挑选镜头形状。用 `code-vocabulary.md` 为每个代码段落节拍挑选合适的 `code-*` block（diff = `code-diff`，重构 = `code-morph`，新代码 = `code-typing`，……）。动效方面用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效的 rule 名）—— 不要自创动效名或 block / blueprint 名。

**在设计任何有名字的视觉效果之前，先搜索在线目录。** `code-vocabulary.md` 覆盖的是代码段落节拍；其余的它不管。对于 brief 点名的其他每一种外观、效果、处理或转场 ——"CRT 扫描线"、"故障效果"、"胶片颗粒"、"闪光扫过"、"彩纸爆开"—— 在把这个效果写进 `STORYBOARD.md` 之前，先运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读排名靠前的结果。这个搜索**什么都不需要安装**：不需要项目、不需要事先 `add`、不需要账号。它在任何目录下都会对整个托管 registry（约 400 个 block 和 component）做排序。在这里写明你找到的 block；Step 5 会预装分镜里点名的每一个 block。只有在搜过之后确实没有合适的结果，才手写这个效果。

对每一帧，按 `visual-design.md` 的方法把一段**带时间码的镜头序列**写进 `STORYBOARD.md`：挑选这一帧的 blueprint（或自行组合），用**这一帧**的内容实例化它，并把每个 Scene 的揭示节奏对齐旁白，让这一帧在整个时长内逐步展开，而不是一开始全堆上来然后冻住。**对于代码段落节拍，`code-*` block 就是这一帧的 `focal`**，各个 Scene 编排的是周围的 code-editorial Code Surface（文件 / 标题栏的入场、镜头移到 hunk 上、落定的那一行）—— **不是**代码动画本身，那归 block 所有。紧跟在每个代码帧的字段之后，加一个 `### Source excerpt`，里面是一个 `diff` 围栏代码块，只包含 worker 必须渲染的那个确切的真实 hunk（最多 12 行）。在这一步从 `capture/diff.patch` 里选出它；worker 被禁止重新打开那份完整的 diff。每个 Scene **内联**说明布局和动效（词汇见 `visual-design.md` 和 `motion-language.md`）。加一个全片通用的 `## Video direction` 块。

不要改动故事、脚本、`transition_in`、`asset_candidates` 或 PR 源。这一步不要写 HTML。**没有素材暂存步骤** —— 唯一的真实素材是致谢头像，已经在 `assets/` 里了。

**闸门：** 每一帧都有一段带时间码的镜头序列，其揭示节奏对齐旁白（没有一开始全堆上来）；代码帧把某个 `code-*` block 写为 `focal`；`## Video direction` 存在。协作模式：草图表已确认。

---

## Step 5：构建帧

目标：把每个分镜帧构建成一个 HTML composition，并组装出可播放的视频。

如果启动了音频，等 Step 3.1 的音频完成。然后同步时长并拉取音效；静音时两者都跳过。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械性的：真实的配音时长优先；静音帧保留估计值；绝不手改同步后的时长。

**预装 registry block**：在派发之前，把 `STORYBOARD.md` 里点名的所有 block 一次装好，这样并行的 worker 就不会在 registry 上竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

派发之前，先读 `../hyperframes/references/subagent-dispatch.md`。构建有上限的帧包和 worker 角色载荷：

```bash
node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"
```

帧包构建器遇到缺少上游选定的 `### Source excerpt` 的代码帧会直接硬失败，并对帧包字节数设有硬上限。它还会写出 `_role.md`（`../hyperframes/references/frame-worker-core.md` + 本 skill 的 `sub-agents/frame-worker.md`，原样拼接 —— 即完整的 worker 角色）。**总共最多派发三个 worker**，把帧包路径均衡地分给它们；每个 worker 的 prompt 都带上 `_role.md` 和分配给它的帧包路径 —— 完整粘贴角色内容或给出它的路径都可以（两者等价；worker 都恰好从这些文档开始），每个 worker 可以按顺序构建分配给它的多个帧，角色只读一次。worker 只读它们的帧包和 `frame.md`。它们绝不打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`。每个 worker 只写分配给它的 `compositions/frames/NN-*.html`；worker 绝不编辑 `STORYBOARD.md`。当某一帧在磁盘上有一份**已确认的草图**（协作运行 —— review loop § 3）时，在那个 worker 的派发上下文里说明：草图就是现有的 `compositions/frames/NN-*.html`，worker 在这个布局上做细化，而不是重画（frame-worker core § When a confirmed sketch exists）。

某一帧失败时，**只重新派发那一帧**，带上它现有的帧包以及确切的校验器 / lint 发现。最多重试一次。不要重放整批，也不要在没有具体发现的情况下重试。

**满版背景放在一个 `class="clip"` 图层上，绝不放在 `#root` 上。** 一帧的底（色块 / 渐变 / 网格）是它自己的一个全时长背景 clip —— 设在 `#root` / `data-composition-id` 元素上的 `background` 受 clip 门控，只在这一帧的时间窗口内生效，不是可靠的底，因此深色内容可能落在黑色的宿主 `body` 上，渲染出来看不见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色画在 index 的 `#root` 上。（完整规则 + 自检：`../hyperframes/references/frame-worker-core.md`。）

每个 worker 返回时，在 `STORYBOARD.md` 里把那一帧标记为 `animated`。

有了音频时间戳之后，在后台构建字幕并组装 index：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（code-editorial 的，在 Step 2 复制进来），并从 `frame.md` 注入品牌 token；`captions: skipped (<reason>)` 是有效结果。`assemble-index.mjs` 会从 `assets/` 暂存致谢头像，作为一个幂等的兜底。

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

**已知的误报 —— 不要去追。** `check` 可能会在**字幕**高亮词上（选择器 `#caption-word-*` / `.caption-line`）报出几个约 1–4px 的 `text_box_overflow` 错误。字幕胶囊特意用了偏紧的 `line-height`（在 `scripts/captions.mjs` 里统一设置），并且**没有 `overflow:hidden`**，所以粗重展示字形的墨迹会溢出几个像素到胶囊自己的内边距里 —— 实际上什么都没被裁掉。把这些当作预期内的情况，继续往下走。**不要**调大字幕的 `line-height`（那会让胶囊膨胀，更糟）。只有当 `text_box_overflow` 指向的是**帧**元素（`#el-NN-*`）而不是字幕词时，才去处理。

检查通过后，停下来等用户评审 —— 即评审循环的最终查看（`../hyperframes/references/review-loop.md` § 4）：在最终的 Studio 预览上只问一个问题 —— 现在渲染，还是要改什么？（自主模式：一样，作为保留下来的那一个问题 —— 即使用户没要求，也用下面的命令打开预览。）然后交付 MP4，附上联系表和各帧 id，以便修改时能定位到单独一帧。

预览：`npx hyperframes preview "$PROJECT_DIR" --background`

只有在用户批准之后才渲染（自主模式：在问过渲染还是修改之后）：

`npx hyperframes render --skill=pr-to-video --quality high --output renders/video.mp4`

渲染之后不要再重跑 `lint`、`check` 或 `snapshot`，除非用户要求。

用户评审结束后（或渲染完成、预计不再有实时编辑时），只停掉本项目的后台服务器：`npx hyperframes preview "$PROJECT_DIR" --stop`。在等待评审期间绝不要关掉它。

**闸门：** 渲染前 `lint` 和 `check` 已通过，快照已查看；用户在评审停顿处已批准（自主模式：检查已通过，交付物包含联系表）；`renders/video.mp4` 存在。最终回复写明 MP4 路径和最终时长。

---

## 速查

**画幅：** 横版 `1920x1080`；竖版 `1080x1920`；方形 `1080x1080` —— 由投放渠道推导（brief contract § 2）。在分镜 frontmatter 里设置一次画幅。

**PR 工作流相对于抓取素材型工作流的差异：** 没有 Step 1 的抓取（`gh` CLI 把 PR 读入一个合成的 `capture/extracted/` 包 —— `tokens.json` + `visible-text.txt` + `people.json`）；唯一的真实素材是贡献者的 `assets/<login>.png` 头像（片尾致谢）；没有 `asset-descriptions.md`，没有素材暂存步骤。代码段落节拍由 `code-*` registry block 渲染在 code-editorial 的海军蓝 Code Surface 上；风格始终是 **code-editorial**。

**后台脚本：** 本工作流在 `scripts/` 下附带这些：`fetch-pr`（PR → `capture/pr.json` + `diff.patch`，通过 `gh`；对大 PR 安全，无临时目录）、`ingest`（→ 合成的抓取包；离线），以及 `fetch-people-avatars`（贡献者头像 → `assets/`）；外加共享引擎 —— `build-frame`（采用一个 preset 并按品牌重新混配成 `frame.md` + 字幕皮肤）、`audio`（TTS、BGM、音效、时长同步）、`captions`、`transitions`（注入 + 核验）和 `assemble-index`。其余一切都是 `hyperframes` CLI。代码 block 通过 `npx hyperframes add <name>` 安装。

可复用的、与领域无关的镜头形状放在 `../hyperframes-animation/blueprints/`（由 `../hyperframes-animation/blueprints-index.md` 建索引）；`code-*` registry block 是代码段落节拍的词汇（`references/code-vocabulary.md`）。

| 读什么 | 何时读 |
| --- | --- |
| `[../hyperframes/references/brief-contract.md](../hyperframes/references/brief-contract.md)` | 闸门类型、由 `BRIEF.md` 推导模式、字段语义。 |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)` | Step 3：故事准则 —— 钩子用语、先价值后证据、提案形态、可溯源的视觉。 |
| `[references/story-design.md](references/story-design.md)` | Step 3：规划 PR 讲解。 |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)` | Step 3：角色→blueprint 菜单。Step 4：挑选镜头形状。 |
| `[../hyperframes/references/storyboard-format.md](../hyperframes/references/storyboard-format.md)` | Step 3：写 `STORYBOARD.md`。 |
| `[../hyperframes/references/script-format.md](../hyperframes/references/script-format.md)` | Step 3：写 `SCRIPT.md`。 |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)` | Step 3.1：选择或了解 TTS 提供方。 |
| `[references/visual-design.md](references/visual-design.md)` | Step 4：写这一帧的镜头序列（+ 布局词汇）。 |
| `[references/code-vocabulary.md](references/code-vocabulary.md)` | Step 4 + 5：为代码段落节拍挑选并填充 `code-*` block。 |
| `[references/motion-language.md](references/motion-language.md)` | Step 4：动效词汇 + 动效准则。 |
| `[references/cut-catalog.md](references/cut-catalog.md)` | Step 4–5：切法目录（worker 构建帧内接缝）。 |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | Step 5：所引用动效对应的本地 rule 配方正文。 |
| `[../hyperframes/references/frame-worker-core.md](../hyperframes/references/frame-worker-core.md)` | Step 5：共享的 worker 契约（帧包构建器把它放在增量文件前面）。 |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)` | Step 5：本工作流的 frame-worker 增量。 |
| `[../hyperframes/references/subagent-dispatch.md](../hyperframes/references/subagent-dispatch.md)` | Step 5：安全地派发子 agent。 |
| `[../hyperframes-creative/frame-presets/code-editorial/FRAME.md](../hyperframes-creative/frame-presets/code-editorial/FRAME.md)` | Step 2：code-editorial preset（固定风格）。 |
