---
name: product-launch-video
description: >
  把一个产品或营销 URL、粘贴来的脚本或一份 brief 变成产品发布 / 宣传视频 —— SaaS 宣传片、功能揭晓、产品演示、应用和公司发布。当用户想要营销、发布、推广或揭晓一个产品时使用；对任何商业 URL 都默认走这里。网站的导览 / 展示也路由到这里 —— brief 里承载「原样展示」的意图。不清楚 → /hyperframes。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/product-launch-video/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于某个 HyperFrames 插件内部时，在执行准备或更新命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先与用户确认：**`npx hyperframes skills update product-launch-video`。如果一切都已是最新，它会很快地什么也不做；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再去依赖它们。

> **media-use**：在获取音频 / 图片 / logo 之前，调用 `/media-use`，从 HeyGen 素材库解析 BGM / 音效（SFX）/ 图片，并从官方来源获取品牌 logo。先运行 `--adopt` 登记已有素材。见 `/media-use` skill。当宿主应用提供了自己的音乐或音效工具时，音乐和音效就用那些工具。

> **figma 来源**：如果来源是一个 figma.com URL，先运行 `/figma` —— 素材导出、品牌 token，以及必要时的组件 / 分镜重建 —— 然后基于它的输出来跑这个工作流。不要直接用原始 MCP 工具去驱动 Figma：那会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录以及品牌 token 的 `var()` 绑定，这样以后品牌一改，不完整重新导入就无法传播下去。

# 用 HyperFrames 做产品发布视频

用本 skill 抓取一个产品、理解它的品牌、规划一支发布视频，并在 HyperFrames 里逐帧构建它。

> **正门是 `/hyperframes`。**你是编排者。运行每一步，验证它的闸门，然后才继续下一步。本 skill 用于**正在被营销、发布、推广或揭晓的产品**，包括"给我们网站做个宣传片"这类目的在于推广的请求。网站导览 / 展示类的请求也留在这里：`BRIEF.md` 承载"原样展示"的意图，抓取到的页面截图就成为视频主打的素材。任何其他意图、一句光秃秃的"做个视频"，或任何不确定 → 先读 `/hyperframes` —— 意图层掌管每一个路由决策，而且一个没有 `BRIEF.md` 就直接来到这里的全新创作请求，无论如何都会经过它（准备阶段的开场规则）。

你是编排者。在 `videos/<project>/` 里工作。按顺序运行各步，每一步都要通过闸门才能继续。需要用户把关的步骤是 Step 0、Step 3 和 Step 6。在 Step 0 之前先读 `../hyperframes/references/brief-contract.md` —— 它定义了闸门的类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出掌管 Step 3/4/6 闸门的模式。除了 Step 5 以外，每一步都由你亲自完成；在 Step 5 你为每一帧派发一个子 agent。不要把设计或运动规则写在这里；它们放在 frame-worker 子 agent、本 skill 本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 里。

工作流：Step 0 准备 -> `hyperframes.json`；Step 1 抓取 -> `capture/`；Step 2 设计系统 -> `frame.md`；Step 3 分镜 / 脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 -> `audio_meta.json`；Step 4 视觉设计 -> 充实后的 `STORYBOARD.md`；Step 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 -> `renders/video.mp4`。

---

## Step 0：准备

目标：带着一份已确认的 brief 进场，创建 HyperFrames 项目，并把 brief 持久化。

**brief 由意图层确认，而不是靠在这里提问。**开场规则，按顺序：**（1）**`BRIEF.md` 存在 → 读它，什么都不问 —— brief 已经定了，它的 `flow`/`storyboard` 推导出模式（brief 契约 § 1）。**（2）**没有 `BRIEF.md` 但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从分镜的 frontmatter 和已记录的偏好恢复；绝不对一个做了一半的项目重新盘问。**（3）**两者都没有 —— 一个直接来到这里的全新创作请求 → 读 `/hyperframes` 并运行它的意图层（`references/intent-interview.md`）：它会检查配方和记住的默认值，进行这条路由的提问（`../hyperframes/references/routes/product-launch-video.md`），然后交回锁定的 brief。编辑类请求跳过以上全部 —— 直接去做编辑。

只有在缺少 `hyperframes.json` 时才初始化。用品牌名或域名的 kebab-case 形式命名 `<project>`，比如 `acme-promo`；绝不用工作区名或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` —— `init` 会把已安装的 skill 与 GitHub 上的最新版本比对，如果有过期的就更新全局那一套。

init 之后，令 `<PROJECT_ROOT>` 为 `videos/<project>`，之后每一条使用相对路径的命令都以这个目录作为工作目录运行。在下面的命令里，`.` 指 `<PROJECT_ROOT>`；绝不把 `.media`、`capture` 或输出文件写到调用方的目录里。

**init 之后立即写 `BRIEF.md`**（绝不能在之前 —— `init` 拒绝非空目录）：内容是意图层锁定的 brief，形状遵循 `../hyperframes/references/brief-format.md`。把 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每一个有偏好支撑的回答（`brief-format.md` 列出了是哪一部分）。如果意图层采用了一个配方，运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会把配方的 `frame.md` 复制进项目（于是跳过 Step 2），并返回 Step 3 据以起草的骨架。配方填的是回答，不是批准；审阅闸门照样运行。

**在越过准备阶段之前先展示登录状态** —— 运行 `npx hyperframes auth status`，原样转述它的输出。它会报告旁白 / BGM 将使用 HeyGen 还是本地引擎，以及未登录时如何登录。注意它的退出码约定：`auth status` **在未登录时退出码为 1**（存储的凭据被拒绝时也是）—— 这个非零退出码是正常的未登录状态，不是命令失败，所以不要把它当错误、不要重试它，也不要用 `&&`/`set -e` 以会中断工作流的方式把它串起来。走下面其中一个分支：

- **协作：**等用户登录，或明确选择 `offline` / `go`。
- **自主：**说明状态，然后用可用的本地引擎继续。

当某项必需能力没有离线提供方时，不要悄悄省略它；把阻塞点摆出来。不要把这个决定塞进别的问题里，也不要把密钥写进某个仓库自己的 `.env`。认证归属和离线兜底：`/media-use` `references/setup-providers.md` § Providers。

**闸门：**`hyperframes.json` 和 `BRIEF.md` 存在；有偏好支撑的回答已记录（brief 契约 § 2）；已展示登录状态（已登录，或继续离线）。

---

## Step 1：抓取素材

目标：为视频收集原始材料、品牌信号和可用的素材。

对输入分类并选择路径。明确的 URL -> 抓取它，用这个网站来做旁白和素材。粘贴来的脚本 / brief -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字照念还是重组）来自 `BRIEF.md` —— 脚本到来时由意图层询问（只有在 brief 不知为何缺了它时，才在这里问一次）。然后确定抓取目标：文本里有 URL -> 用它；只有品牌名 -> `WebSearch`，用一句话确认 URL，然后爬取；没有 URL / 网站（或者 brief 说了不要抓取）-> 不抓取路径。

用这条命令运行抓取：`npx hyperframes capture "<URL>" -o ./capture --json`。保持默认的导航后预算，除非调用方自己有更短的截止时间；那种情况下传一个正数的 `--capture-budget <milliseconds>`，给下游工作留出时间。`--timeout` 只控制页面导航。只有在有意关闭可选的图片描述生成时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON 里的 `ok: false`，或者 `capture/BLOCKED.md`，都是抓取路径的**硬性停止**：报告记录下来的原因，不要使用残缺的截图、DOM、token 或素材。URL 抓取失败后，不要捏造一个合成的不抓取兜底。只有当最初的 brief 本身就提供了原始材料，或者用户在失败后明确改用自己提供的截图或 brief 时，才走不抓取路径继续。

像 `very little text content` 这样的警告再加上一个空的素材目录，并不能证明页面可用。对于网站导览或"原样展示"的 brief，必须有可信的抓取结构或用户提供的截图；两者都没有就停下。不要仅仅因为抓取结果不可用就去编造或重建页面。

对于网站导览或"原样展示"的 brief，抓取到的页面就是视觉上的唯一依据。用真实的截图，而不是用 HTML 重建整个网站。如果这个镜头需要内部运动，就以截图为底，把真实的抓取素材叠加在测量好的位置上，或者只重建那个会动的组件。对于滚动镜头，在 `capture/screenshots/full-page.png` 上移动 viewport —— 这是整个文档的 1x 底图，对一个 1920 宽、沿着它往下走的 viewport 来说像素精确。当页面太高、无法一次抓成一整张时，它不存在；这时回退到同一目录下互相重叠的各滚动位置截图。推近超过 1:1 时，应该对那个区域单独做一次 2x 抓取，因为底图在 1x 以上没有余量。只有当用户明确要求风格化的诠释时，才重建整个页面；仅仅是抓取结果不可用，并不构成授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 的 key，抓取会自动为素材生成描述，写进 `capture/extracted/asset-descriptions.md`。这不是审阅闸门。没有视觉模型的 key 时，就用 DOM 上下文，继续往下走。

不抓取路径：手工创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；尽可能从 brief 里填写 title/description。`visible-text.txt` 包含完整的 brief 或脚本。`asset-descriptions.md` 应写明没有抓取到任何素材，除非用户给了素材说明。

**闸门：**抓取的 JSON 报告了 `ok: true`；`capture/BLOCKED.md` 不存在；`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 都存在；并且你能用一句清楚的话说出这个品牌。把 `asset-descriptions.md` 当作主要的素材清单。如果真实抓取之后它缺失了，就停下并报告抓取不完整。关于某个可选阶段降级的警告，只有在这个结构性闸门仍然通过时才可以接受。

---

## Step 2：设计系统

目标：选定一个随附的 frame preset；由脚本把它变成这支视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 指定了一个 `style_preset` 时 —— 那是用户在意图层从展示样例里凭眼睛挑出来的 —— 就用它；只有在 brief 没说时，才轮到你来判断。然后你只做一个决定 —— **用哪个 preset**：读 `../hyperframes-creative/references/design-spec.md`，挑一个外观最契合品牌和 brief 的 preset。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

剩下的由脚本以确定性的方式完成：把 preset 的 `FRAME.md` 复制为 `frame.md`，并把它**重混**到 `capture/extracted/tokens.json` 里的品牌 token 上（按角色把品牌色映射到 preset 的颜色键上 —— 墨色、画布、强调色 —— 保留键 / 结构 / 组件；把 preset 的 display + body 字体换成品牌的字体），把 preset 的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并自我校验（映射出错时退出码为 1）。它一以退出码 0 结束就进入下一步 —— 不要手工编辑这份规范。

`tokens.json` 里没有品牌颜色 / 字体（例如没有抓取）→ 脚本保留 preset 自己的色板，那就是一套完整、可交付的设计。如果 brief 指定了抓取遗漏的品牌颜色 / 字体，就在运行前把它们加进 `capture/extracted/tokens.json`（或者用用户的 `design.md` 来填充它）；只有当某个映射确实需要时，才在之后手工调整 `frame.md`。

**闸门：**`build-frame.mjs` 以 0 退出 —— `frame.md` 存在且来自一个指名的 preset，并且（当该 preset 随附了字幕皮肤时）`.hyperframes/caption-skin.html` 作为字幕皮肤来源存在；所选的 preset 已作为偏好记录（`--key style_preset --workflow <this workflow>`，brief 契约 § 2）。

---

## Step 3：分镜与脚本

目标：把 brief 和抓取到的材料变成一份经批准的逐帧故事规划。

读 `../hyperframes-creative/references/story-spine.md`（hook 语言、先讲价值再给证据、分镜即提案、可追溯到来源的画面）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes/references/storyboard-format.md` 和 `../hyperframes/references/script-format.md`。用它们来写 `STORYBOARD.md`，以及需要旁白时的 `SCRIPT.md`。根据 brief 的 `length` 设置 frontmatter 里的 `duration:` —— 这是一个大致的预期；组装时会报告剪辑最终相对它落在哪里。

故事蓝图、hook、说服逻辑、段落节拍、`VO_MODE` 和素材选择，都用 `story-design.md`。作为一份**软性指南**，参考 `../hyperframes-animation/blueprints-index.md` 里的角色→蓝图菜单：对每一拍，如果有契合的蓝图，就记下一个候选蓝图 id。存在哪些段落节拍仍然由故事的真实内容决定 —— 绝不强迫某一拍去套一个蓝图，也绝不仅仅因为有现成的验证形状就编造一拍。每个有画面的帧的 `asset_candidates` 从 `capture/extracted/asset-descriptions.md`（权威清单）里选 —— 不要去翻原始的 `capture/assets/`。除非那份清单缺失或不可用，否则不要让用户挑素材。使用分镜和脚本参考文档里要求的确切字段。

起草之后，运行审阅循环的规划轮 —— `../hyperframes/references/review-loop.md` § 1：把规划作为提案呈现，并问两个问题 —— 批准还是修改，以及**先出草图**（推荐）还是跳过。反馈以聊天回复的形式到来；循环直到获得批准。这是一个**检查点闸门**（brief 契约 § 1）：在自主模式下没有什么要问的 —— 把同样的摘要作为预告发出去然后继续；草图并入构建，最终预览及其唯一的一个问题在 Step 6 出现。

**闸门：**`STORYBOARD.md` 存在，每个有画面的帧都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 存在，并且用户批准了逐帧规划（自主：摘要已作为预告发出）。

---

## Step 3.1：音频

目标：根据经批准的脚本生成旁白、逐词时间、音乐和音频元数据。

在 Step 3 获得批准后开始音频。让它在后台运行，然后继续 Step 4。

**调用之前，根据用户的要求选择旁白提供方和声音。**用 `--provider <provider>` 传入 Step 0 选定的提供方（或者设置 `HF_TTS_PROVIDER`）。如果请求里指定了某个声音、性别或语气，就挑一个匹配的 voice id，用 `--voice <id>` 传入。否则管线的默认值在 HeyGen 上是 **Marcia（女声）**，在 Kokoro 上是 `am_michael` —— 所以像"要一个男声"这样的请求，除非你传了这个参数，否则会被悄悄忽略。voice id 因提供方而异；按 Step 0 登录状态选定的那个提供方来解析：**HeyGen**（已登录）用 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）用 `<MEDIA_DIR>/audio/references/tts.md` 里的声音表（前缀 `am_`/`bm_` 为男声，`af_`/`bf_` 为女声）。当用户没有表达偏好时，先回退到记住的声音（brief 契约 § 2），再回退到管线默认值，并说明你用的是哪一个；只有两者都没有指定声音时才省略 `--voice`。当用户在这一轮明确挑了某个声音时，记录下来（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责旁白、逐词时间、从 HeyGen 音乐库检索 BGM，以及时间元数据。BGM 的情绪来自分镜的 `music:` 字段；**`music: none` 关闭 BGM**。它用 HeyGen Audio API 做检索，而不是生成，并使用与 TTS 相同的 `~/.heygen` 凭据。提供方的详细信息读 `../media-use/audio/references/tts.md`。当宿主应用自己的工具生成了音乐或某个音效时，把文件放到 assets/ 下，并在 audio_meta.json 文件里列出它，标记为 `"source": "host"`：音乐作为 `bgm` `{ "path": "assets/…", "source": "host" }`，同时在分镜里写 `music: none`；音效作为一条 `sfx` 条目 `{ "frame": <n>, "file": "assets/…", "offset_s": 0, "duration_s": <its length>, "source": "host" }`。每一轮音频处理都会保留这些，带有宿主音效的帧不会再去检索提示音。

如果没有旁白，也没有 `SCRIPT.md`，就跳过声音生成。如果分镜写了音乐情绪，BGM 仍然可以运行。

**标准的完全静音标记：**STORYBOARD.md 顶部 YAML 块里的 `music: none`、没有 `SCRIPT.md`，**并且**没有 `sfx:` 提示或宿主音频。这个组合把项目标记为静音 —— 没有旁白、没有 BGM、没有音效。`audio.mjs` 能识别它并且什么都不生成（它会删掉任何过期的 `audio_meta.json`；组装时把 `audio_meta.json` 不存在视为静音），所以 Step 3.1 被干净地跳过。没有旁白但有 `sfx:` 提示或宿主音频时，影片不是静音的：`audio.mjs` 会写出 audio_meta.json 文件，供 `fetch-sfx` 填充。当用户要求静音 / 无音乐的视频时就用它 —— 不要即兴发明别的写法。

**闸门：**音频任务已经启动，或者项目被标记为静音（`music: none`、没有 `SCRIPT.md`、没有 `sfx:` 提示或宿主音频）。

---

## Step 4：帧视觉设计

目标：为分镜的每一帧加上视觉方向、布局意图和运动选择。

**先画分镜草图表（仅限协作模式）。**规划一获批准，就运行草图轮 —— `../hyperframes/references/review-loop.md` § 2（不要等 Step 3.1；草图不用时间信息）：你亲自把每一帧画成 `storyboard.html` 里的一个格子的线框图（`../hyperframes-creative/references/storyboard-recipe.md` § 3），把每一帧标为 `built`，在每一帧都是 `built` 时停下来问那一个布局问题，然后只修改被点名的草图，直到整张表得到确认。占位：用带标签的普通方块代替抓取到的素材 —— 真实文件随 Step 5 的 worker 一起到来。只有这时，才把下面的视觉设计写到已确认的布局上。在自主模式下，或者用户在 Step 3 选择跳过草图时，跳过这一轮 —— 各帧在 Step 5 直接从 `outline` 变成 `animated`。

原地编辑 `STORYBOARD.md`。不要另建一份分镜。把 `frame.md` 当作颜色、字体、布局感觉和风格的唯一依据。

读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。方法用 `visual-design.md`（带时间码的镜头序列、行内的布局词表，以及必需的 `## Video direction` 块）。用 `../hyperframes-animation/blueprints-index.md` 挑选每一帧的镜头形状。运动用 `motion-language.md`（运动词表 + 运动准则）和 `../hyperframes-animation/rules-index.md`（合法的规则名）—— 不要编造运动名称。

**在设计任何有名字的视觉效果之前，先搜索在线目录。**对于 brief 里点名的每一种外观、效果、处理或转场 —— "CRT scanlines"（CRT 扫描线）、"glitch"（故障效果）、"film grain"（胶片颗粒）、"shimmer sweep"（微光扫过）、"confetti burst"（彩纸迸发）—— 在把这种外观写进 `STORYBOARD.md` **之前**，运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并读排在最前面的结果。搜索**不需要安装任何东西**：不需要项目，不需要事先 `add`，不需要账号。它在任何目录下都能对整个托管的 registry（约 400 个 block 和 component）做排序。一个已经能完成这件事的 block 就成为这一帧的 `focal` —— 在这里写出它的名字；Step 5 会在派发前把它预装一次，它的 worker 会定制它，而不是重建它。只有在搜索某种外观却没有找到任何合适的结果之后，才手工编写它。

对于每个有画面的帧，按 `visual-design.md` 的方法把一个**带时间码的镜头序列**写进 `STORYBOARD.md`：挑选这一帧的蓝图（或自行组合），用**这个**产品的内容实例化它，并让每个 Scene 的揭示跟着旁白的节奏走，使这一帧在整个时长里逐步展开，而不是前置堆砌后冻住。在每个 Scene 里**直接写明**布局和运动（词表在 `visual-design.md` 和 `motion-language.md` 里）。加上一个视频级的 `## Video direction` 块。

当某个元素明显地跨越帧边界延续时，在 `STORYBOARD.md` 里给两个 worker 同一份数值化的交接：在退出的帧上加 `handoff_out:`，在进入的帧上加一个匹配的 `handoff_in:`。写明这个元素，以及它在切点处确切的 x/y 位置、缩放、不透明度和运动方向 / 速度 —— 即使某个字段不变也要写出来，因为常量要写成 `opacity: 1`，而不是省略。只有在刻意的干净切换时，才整块省略。目的很简单：并行的 worker 绝不能为同一个接缝编造出两个不同的版本。

不要改动故事、脚本、素材选择、`asset_candidates`、`transition_in` 或抓取到的原始材料。这一步不要写 HTML。

视觉设计锁定之后，暂存指定的素材：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**闸门：**每个有画面的帧都有一个带时间码的镜头序列，其揭示跟着旁白的节奏走（没有前置堆砌）；`## Video direction` 存在；`assets/` 包含指定的素材。协作模式：草图表已获确认。

---

## Step 5：构建帧

目标：把分镜的每一帧都构建成一个 HTML composition，并组装出可播放的视频。

如果启动了音频，先等 Step 3.1 的音频完成。然后同步时长并获取音效；静音的话两者都跳过。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械性的：以真实的语音时长为准；静音帧保留估计值；绝不手工编辑同步后的时长。

组装之前，对照最终剪辑检查音乐。一首曲库里的曲子可能与要求的情绪相符，却以一段安静的铺垫开场，把一支短发布视频的头几秒耗干。把开头与后面每五秒一段的各个片段比较；当后面某一段有更强、在音乐上干净的起点时，就从那里裁剪，并保留一个短的淡入加一个更长的淡出。如果帧或旁白的时间发生了变化，就对照新的最终时长重做这项检查，让音乐绝不会提前结束，也不会在结尾留下静音。

**预装 registry block**：把 `STORYBOARD.md` 各处点名的 block 在派发之前统一预装一次，这样并行的 worker 就不会在 registry 上发生竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

派发之前，读 `../hyperframes/references/subagent-dispatch.md`。构建每帧的帧包和 worker 的角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器在 `.hyperframes/frame-packets/` 下为每一帧写一个有边界的帧包（这一帧确切的分镜块 + 蓝图正文 + 每一份被引用的规则配方，全部内联），以及 `_role.md`（`../hyperframes/references/frame-worker-core.md` + 本 skill 的 `sub-agents/frame-worker.md`，原样拼接 —— 完整的 worker 角色）。为每一帧派发一个子 agent，可能的话并行；否则分批运行 worker。每个 worker 只拿一帧：它的提示词里带着 `_role.md` 和那一帧的帧包 —— 把两者完整粘贴进去，或者把两个文件路径交给 worker 让它先读（两者等价；无论哪种方式，worker 都恰好从这两份文档开始）—— 外加一份派发上下文，包括 `PROJECT_DIR`、`frame_id`、这一帧在磁盘上是否有一张**已确认的草图**（worker 会在那个布局上做装饰，而不是重画它 —— frame-worker 核心 § When a confirmed sketch exists）、画布尺寸，以及字幕状态 + 启用字幕时的避让带。

worker 只读自己的帧包和 `frame.md`；它们从不打开 `STORYBOARD.md` 或 skill 文档（帧包里已经内联了上游选定的内容）。每个 worker 只写 `compositions/frames/NN-*.html`。worker 绝不能编辑 `STORYBOARD.md`。

**满版出血的背景放在一个 `class="clip"` 图层上，绝不放在 `#root` 上。**一帧的底（色块 / 渐变 / 网格）是它自己的一个全时长背景 clip —— 设置在 `#root` / `data-composition-id` 元素上的 `background` 受 clip 的时间窗口限制，不是可靠的底，所以深色内容可能落在黑色的宿主 `body` 上而渲染得看不见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色涂在 index 的 `#root` 上。（完整规则 + 自检：`../hyperframes/references/frame-worker-core.md`。）

每当一个 worker 返回，编排者就在 `STORYBOARD.md` 里把那一帧标为 `animated`。

有了音频时间之后，在后台构建字幕并组装 index：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在 Step 2 复制过来）作为字幕外观，并注入来自 `frame.md` 的品牌 token；没有皮肤时，它渲染内置的默认胶囊。`captions: skipped (<reason>)` 是合法的。明确跳过时，不带字幕继续。

**闸门：**每一帧都标为 `animated`（协作模式：草图表已在 Step 4 获得确认），`index.html` 存在，并且字幕已构建或被明确跳过。

---

## Step 6：收尾

目标：验证组装好的视频，取得用户批准，并渲染最终的 MP4。

注入转场，运行检查，停下来等审阅，然后渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会把截取的各帧拼成一张联系表（`snapshots/contact-sheet.jpg`）。检查各中点帧有没有布局问题，然后比较每个切点前后的两张图。延续的元素必须保持承诺好的位置、缩放、不透明度和方向；渲染之前修掉任何可见的跳变。

如果某条命令失败，把 stderr 摆出来然后停下 —— 不要堆砌补救命令。自己修：对 `compositions/frames/NN-*.html` 做代价最小的安全修改，然后重跑失败的那项检查。

检查通过后，停下来等用户审阅 —— 即审阅循环的最终查看（`../hyperframes/references/review-loop.md` § 4）：在最终的 Studio 预览上问一个问题 —— 现在渲染，还是要改什么？（自主模式：一样，作为唯一保留的那个问题 —— 即使用户没要求，也要打开预览。）然后交付 MP4，附上联系表和各帧的 id，以便修改时能精确到单独一帧。

预览：`npx hyperframes preview --background`

只有在用户批准后才渲染（自主模式：在问过"渲染还是修改"之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染之后不要重跑 `lint`、`check` 或 `snapshot`，除非用户要求。

**闸门：**渲染前 `lint` 和 `check` 已通过，快照也已检查；用户在审阅停顿时批准了（自主模式：检查通过，且交付内容包含联系表）；`renders/video.mp4` 存在。最终回复写明 MP4 路径和最终时长。

---

## 速查

**格式：**横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080` —— 由投放渠道推导（brief 契约 § 2）。在分镜的 frontmatter 里设置一次格式。

**后台脚本：**这个工作流在 `scripts/` 下只随附这些脚本：`build-frame`，用于采用一个 frame preset 并按品牌重混成 `frame.md`（+ 字幕皮肤）；`audio`，用于 TTS、转写、BGM、音效和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于把各帧点名的素材复制到 `assets/`；以及 `assemble-index`。其他一切都由 `hyperframes` CLI 处理。

可复用的、与具体产品无关的镜头形状放在 `../hyperframes-animation/blueprints/`（由 `../hyperframes-animation/blueprints-index.md` 编目）。

| 读 | 何时 |
| --- | --- |
| `[../hyperframes/references/brief-contract.md](../hyperframes/references/brief-contract.md)` | 闸门类型、从 `BRIEF.md` 推导模式、字段语义。 |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)` | Step 3：故事准则 —— hook 语言、先讲价值再给证据、提案形状、可追溯到来源的画面。 |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)` | Step 2：选择并采用一个 frame preset。 |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)` | Step 2：正确应用品牌 token。 |
| `[references/story-design.md](references/story-design.md)` | Step 3：规划产品发布的故事。 |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)` | Step 3：角色→蓝图菜单。Step 4：挑选镜头形状。 |
| `[../hyperframes/references/storyboard-format.md](../hyperframes/references/storyboard-format.md)` | Step 3：写 `STORYBOARD.md`。 |
| `[../hyperframes/references/script-format.md](../hyperframes/references/script-format.md)` | Step 3：写 `SCRIPT.md`。 |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)` | Step 3.1：选择或了解 TTS 提供方和声音。 |
| `[references/visual-design.md](references/visual-design.md)` | Step 4：写这一帧的镜头序列（+ 布局词表）。 |
| `[references/motion-language.md](references/motion-language.md)` | Step 4：运动词表 + 运动准则。 |
| `[references/cut-catalog.md](references/cut-catalog.md)` | Step 4-5：切法目录（worker 构建帧内接缝）。 |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | Step 5：被引用运动的本地规则配方正文。 |
| `[../hyperframes/references/frame-worker-core.md](../hyperframes/references/frame-worker-core.md)` | Step 5：共享的 worker 契约（帧包构建器把它拼接在增量文件前面）。 |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)` | Step 5：本工作流的 frame-worker 增量。 |
| `[../hyperframes/references/subagent-dispatch.md](../hyperframes/references/subagent-dispatch.md)` | Step 5：安全地派发子 agent。 |

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/cut-catalog.md](references/cut-catalog.md) —— 切法目录 —— 帧内接缝（由 worker 构建）
- [references/motion-language.md](references/motion-language.md) —— 运动语言 —— 动作词表 + 运动准则 + seek 安全核心
- [references/story-design.md](references/story-design.md) —— 故事设计 —— 产品发布视频
- [references/visual-design.md](references/visual-design.md) —— 视觉设计 —— 产品发布的逐帧镜头方法
- [sub-agents/frame-worker.md](sub-agents/frame-worker.md) —— Frame worker —— 产品发布增量
