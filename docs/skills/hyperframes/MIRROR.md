# HyperFrames skill 来源与吸收说明

本目录归档 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) 仓库 `skills/` 下发布的全部 21 个 skill。HyperFrames 是 HeyGen 开源的「写 HTML、渲染视频」框架，这套 skill 教 AI 走完它的制作流程，Claude Code 插件 `hyperframes@hyperframes` 装的就是这一套。目录结构镜像上游 `skills/`：每个 skill 的 `SKILL.md` 改名为 `index.md`，其余文件按原相对路径放在同级，所以 skill 之间、文件之间的相对引用原样有效。人读的介绍和远程使用须知在 [index.md](index.md)。

**全部 330 篇 markdown 是中译版**（2026-10-09 按要求译成简体中文），脚本、模板、数据和二进制素材原样照录。这偏离了本 wiki「吸收型 skill 原文照录」的默认规矩，是按要求做的，先例见 [GPT Image 2 图库](../../gallery/images/gpt-image2/MIRROR.md)和 [bili-note](../bili-note/MIRROR.md)。英文原文看下面钉 commit 的永链。

!!! warning "AI 不要去读上游仓库，也不要装上游 skill"

    这套 skill 已经全部迁进本 wiki，本目录就是完整可执行的版本。**AI 执行或引用它时，禁止去抓取上游仓库，也禁止运行 `npx hyperframes skills update`、`npx skills add` 这类会装上英文原版的命令**：不需要，装了还会和这里的译本两套并存。`npx hyperframes init` 要带 `HYPERFRAMES_SKIP_SKILLS=1`。下文的仓库链接只用来标注出处，由人来维护。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/heygen-com/hyperframes>（HeyGen） |
| 已吸收 commit | [`46f6cb3`](https://github.com/heygen-com/hyperframes/tree/46f6cb356785bed79e1ce7b79d7e7accc697786a/skills)（2026-10-09，插件清单版本 0.8.143） |
| 抓取日期 | 2026-10-09 |
| 许可证 | Apache-2.0，原文见同目录 [`LICENSE`](LICENSE)；上游仓库没有 NOTICE 文件 |

上游非常活跃（一天十几个 commit），这里是上面那个 commit 的快照。

## 原作者与第三方内容

- skill 本体由 HeyGen 的 HyperFrames 团队编写
- **talking-head-recut 改编自 [notedit/vtake-skills](https://github.com/notedit/vtake-skills)**（`vtake-cut`，作者 leeoxiang，MIT）：卡片式设计系统、版式、字体和 GSAP 合成流程都来自那里。HeyGen 的改动与 MIT 许可原文见该 skill 的 [NOTICE.md](talking-head-recut/NOTICE.md)，许可原文在代码块里，原样保留
- `media-use/audio/assets/sfx/` 下 19 个音效来自 Pixabay，按 Pixabay Content License 使用，见 [CREDITS.md](media-use/audio/assets/sfx/CREDITS.md)
- 随附的 57 个 woff2 字体都是开源字体（Inter、JetBrains Mono、EB Garamond、LXGW WenKai、Virgil 和一批 Google Fonts），`hyperframes-creative/frame-presets/code-editorial/fonts/` 带了两份 OFL 原文

## 翻译做了哪些改动

**译了什么。** 330 篇 markdown 的正文，以及 frontmatter 里的 `description`（skill 的触发条件）。指令的强度词译成同等强度：must → 必须，never → 绝不，do not → 不要。

**没译什么。** 代码块（连同里面的英文注释、模板、示例对话和示例 prompt）、行内代码、链接目标、HTML 标签、frontmatter 的 `name` / `metadata` / `tags`。正文里的技术词、产品名、skill 名、CLI 命令和参数、文件名保留英文；会被程序原样读写的字面值也保留英文，比如 `BRIEF.md` / `STORYBOARD.md` 的字段名和取值、状态值、CLI 打印的原文行、按钮名；跨文件引用的 `Step N`、`§ N` 编号不动。跨文件用词按一张统一译名表（gate → 闸门、intent layer → 意图层、caption → 字幕、talking-head → 口播……）。

**被脚本读的 markdown 逐个核对过，翻译不影响脚本：**

- `hyperframes-creative/frame-presets/*/FRAME.md`（13 个 frame preset）：`build-frame.mjs` 按行解析它的 frontmatter（`colors:`、`typography:`），所以 **frontmatter 原样、连 description 也没译**，只把上游 84 处 `key:{` 补成 `key: {`（冒号后缺空格，严格 YAML 不认，zensical 读页面元数据会直接报错；脚本都按 `:\s*\{` 匹配，不受影响）；正文已译，字体名保持英文（脚本按单词边界替换字体名，并在第一个一级标题后插一段说明）
- `hyperframes/references/frame-worker-core.md` 与各工作流的 `sub-agents/frame-worker.md`：`frame-packets.mjs` 把它们整篇拼成子 agent 的 `_role.md`，子 agent 读到的就是中文
- `pr-to-video/references/code-vocabulary.md`：`frame-packets.mjs` 按「含某个行内代码的行」抽取表格行，译文表格逐行对应、行内代码一个不少

**格式上的改动。**

- 每篇译文的 frontmatter 之后（没有 frontmatter 的在文件开头）加了一行 HTML 注释，写明中译自上游哪个文件。Apache-2.0 第 4(b) 条要求改动过的文件带显著说明
- 被链接锚点引用的标题有 28 处（如 `#reuse-before-you-resolve`），译文标题后补了 `{ #原锚点 }`，跨文件锚点链接照旧有效
- 英文的硬换行段落合并成一行：中文硬折行在 HTML 里会多出空格

**怎么校验的。** 逐文件比对译文与原文：代码块逐字一致，各级标题数、表格行数、列表项数一致，链接目标集合一致，原文的每个行内代码都还在；再用「译文中文字数 ÷ 原文英文词数」拦截漏译和概括（完整译文在 1.6–2.2 之间，低于 1.0 判为漏译）。

## 文件对应

| 本地 | 上游（`skills/` 下） |
|---|---|
| `<skill>/index.md`（21 个） | `<skill>/SKILL.md` |
| 其余 `.md`（309 个，中译） | 同相对路径 |
| 脚本、模板、JSON、字体、音效、图片（539 个，照录） | 同相对路径 |
| [LICENSE](LICENSE) | 仓库根 `LICENSE` |

自己写的只有 [index.md](index.md)、本页、`.meta.yml`（给没有 frontmatter 的译文补默认 description）和 `MANIFEST.txt`（见下文整包下载）。

## 没收的

- **单元测试**：`*.test.mjs`、`*_test.py`、`skills/python-encoding.test.mjs`，运行 skill 用不到。`remotion-to-hyperframes/assets/test-corpus/` 留着，它的 `SKILL.md` 把它当验收语料用
- **`.gitignore`、`.gitkeep`**
- **6 个 repo 内部 skill**：`.claude/skills/` 与 `.agents/skills/` 下的 changelog-video、motion-doctrine、cut-the-curve、captions-overlay、seam-craft、oversized-cursor。它们标了 `metadata.internal: true`，不随插件发布，服务 HeyGen 自己的每周更新视频；changelog-video 还带了商业字体 TT Norms Pro
- **插件清单**：`.claude-plugin/`、`.codex-plugin/`、`.cursor-plugin/`、`gemini-extension.json`、`plugin.json`、`skills-manifest.json`。本 wiki 不是插件安装源，这里的 skill 按 standalone 模式运行（[plugin-installation.md](hyperframes/references/plugin-installation.md) 的判据：`SKILL.md` 往上两级找不到插件清单就是 standalone）
- **README、CLAUDE.md、AGENTS.md、`docs/` 文档站**：写给 GitHub 读者的介绍，不是行为定义。要看原貌走[钉 commit 的 README](https://github.com/heygen-com/hyperframes/blob/46f6cb356785bed79e1ce7b79d7e7accc697786a/README.md)
- **仓库其余部分**：`packages/` 源码、`registry/` 的 block 与 component。skill 通过 `npx hyperframes` CLI 和 `hyperframes add` 用到它们，运行时从 npm 和 registry 获取

## 脚本归类 { #scripts }

按 [skill 怎么收纳](../wiki-guide/remote-skill.md) 的三类，142 个运行时脚本**全部属于第 3 类「下载后本地执行」**：输入是用户的项目、素材或网站，要调 HyperFrames CLI、FFmpeg、无头浏览器、TTS 和转录模型，既没法预算，也不是查表。分布如下：

| skill | 脚本数 | 主要用途 |
|---|---|---|
| media-use | 41 | 媒体解析与生成引擎：TTS、BGM、音效、转录、配方、偏好、调色抖动 |
| embedded-captions | 23 | 转录、字幕主题、字体适配、遮挡与溢出检查、渲染合成 |
| pr-to-video | 22 | 拉取 PR、分镜、音频、帧包、字幕、组装 index.html |
| product-launch-video | 17 | 设计规范生成、音频、素材暂存、帧包、字幕、组装 |
| faceless-explainer | 16 | 同上，无抓取版 |
| music-to-video | 5 | 节拍网格分析、素材暂存、计划校验、组装 |
| remotion-to-hyperframes | 4 | 源码 lint、逐帧比对 |
| hyperframes-animation、hyperframes-creative | 各 3 | 动画地图、对比度报告、音频数据提取、依赖加载器 |
| hyperframes、general-video、motion-graphics | 各 2 | 插件启动器、帧包、底图烘焙与定位 |
| figma、hyperframes-audio | 各 1 | 动效校验、旁白挖空分析 |

几处要注意的依赖：

- **跨 skill 读文件**：`build-frame.mjs` 读 `../../hyperframes-creative/frame-presets/`，各工作流的 `frame-packets.mjs` 读 `../hyperframes/references/frame-worker-core.md`。所以要下载就整套下载，不要只拉一个 skill
- **回退到 npx**：`media-use/scripts/resolve.mjs`、`embedded-captions/scripts/hf-cli.cjs` 在上游 monorepo 里直接调 `packages/cli`，本地没有这个目录时回退到 `npx hyperframes`
- **按需装依赖**：`package-loader.mjs` 缺包时会提示安装钉了版本的 npm 包，用 `--ignore-scripts` 装进临时目录，需要交互确认或设 `HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1`
- 部署时 `.cjs` 和 `.mjs`、`.py`、`.sh` 一样钉成 `text/plain`，AI 抓取工具才收

这是在执行第三方代码，执行前应让用户知情。

## 整包下载 { #download }

文件太多（872 个），不适合一个个抓。`MANIFEST.txt` 是本目录全部文件的 sha256 清单（`sha256sum` 格式，相对路径），有 shell 的调用方照它整包拉下来再校验：

```bash
BASE=https://wiki.liuhetian.work/skills/hyperframes
mkdir -p hyperframes-skills && cd hyperframes-skills
curl -fsSL "$BASE/MANIFEST.txt" -o MANIFEST.txt
awk '{print $2}' MANIFEST.txt | xargs -P 8 -I{} curl -fsSL --create-dirs -o {} "$BASE/{}"
sha256sum -c --quiet MANIFEST.txt && echo OK
```

拉下来的目录就是 21 个 skill 的完整本地副本，`<SKILL_DIR>` 指向其中某个 skill 目录即可。没打 `bundle.tar.gz`：内容里有 8MB 字体和音效走 LFS，再打一份压缩包会把它们重复存进 git，而且译文一改压缩包就过期；清单是纯文本，改了译文重新生成一次即可。

## 未来漂移处置

只由人来做，AI 不要执行（见页首警示）。

1. `git clone --depth 1` 拿上游新 commit，和 `46f6cb3` 比对 `skills/`
2. 非 `.md` 文件有变化直接覆盖；`.md` 有变化的按上面「翻译做了哪些改动」的规则重译那几篇，FRAME.md 的 frontmatter 照旧原样
3. 上游增删了文件：同步 `mkdocs.yml` 的 nav 和本页「本地归档」一栏
4. 更新本页的 commit、日期和永链，最后在本目录重新生成清单：

```bash
cd docs/skills/hyperframes
find . -type f ! -name '.*' ! -name MANIFEST.txt | sed 's|^\./||' | LC_ALL=C sort | xargs sha256sum > MANIFEST.txt
```

## 本地归档 { #archive }

21 个 skill 的全部 330 篇，按 skill 分组，链接文字是文件路径，后面是译文标题。脚本、模板和素材不逐个列出，见 `MANIFEST.txt`。

### hyperframes

- [hyperframes/index.md](hyperframes/index.md)（= 上游 `SKILL.md`） —— HyperFrames 入口
- [hyperframes/references/brief-contract.md](hyperframes/references/brief-contract.md) —— Brief 契约
- [hyperframes/references/brief-format.md](hyperframes/references/brief-format.md) —— Brief 格式 —— BRIEF.md
- [hyperframes/references/capability-menu.md](hyperframes/references/capability-menu.md) —— 能力菜单 —— HyperFrames 能给视频带来什么
- [hyperframes/references/frame-worker-core.md](hyperframes/references/frame-worker-core.md) —— Frame worker —— 核心契约（各叙事类视频工作流共用）
- [hyperframes/references/intent-interview.md](hyperframes/references/intent-interview.md) —— 意图层 —— 在任何工作流运行之前的一次对话
- [hyperframes/references/pitch-round.md](hyperframes/references/pitch-round.md) —— 提案轮 —— 意图层中发散的一步
- [hyperframes/references/plugin-installation.md](hyperframes/references/plugin-installation.md) —— 从已安装的插件中运行
- [hyperframes/references/production-loop.md](hyperframes/references/production-loop.md) —— 制作循环 —— 从批准的计划到交付的视频
- [hyperframes/references/review-loop.md](hyperframes/references/review-loop.md) —— 评审循环 —— 计划、草图、构建
- [hyperframes/references/route-briefs.md](hyperframes/references/route-briefs.md) —— 路由 brief（已迁移）
- [hyperframes/references/routes/embedded-captions.md](hyperframes/references/routes/embedded-captions.md) —— 路由：embedded-captions
- [hyperframes/references/routes/faceless-explainer.md](hyperframes/references/routes/faceless-explainer.md) —— 路由：faceless-explainer
- [hyperframes/references/routes/general-video.md](hyperframes/references/routes/general-video.md) —— 路由：general-video
- [hyperframes/references/routes/motion-graphics.md](hyperframes/references/routes/motion-graphics.md) —— 路由：motion-graphics
- [hyperframes/references/routes/music-to-video.md](hyperframes/references/routes/music-to-video.md) —— 路由：music-to-video
- [hyperframes/references/routes/pr-to-video.md](hyperframes/references/routes/pr-to-video.md) —— 路由：pr-to-video
- [hyperframes/references/routes/product-launch-video.md](hyperframes/references/routes/product-launch-video.md) —— 路由：product-launch-video
- [hyperframes/references/routes/remotion-to-hyperframes.md](hyperframes/references/routes/remotion-to-hyperframes.md) —— 路由：remotion-to-hyperframes
- [hyperframes/references/routes/slideshow.md](hyperframes/references/routes/slideshow.md) —— 路由：slideshow
- [hyperframes/references/routes/talking-head-recut.md](hyperframes/references/routes/talking-head-recut.md) —— 路由：talking-head-recut
- [hyperframes/references/script-format.md](hyperframes/references/script-format.md) —— SCRIPT.md —— 锁定的旁白（可选）
- [hyperframes/references/skill-lifecycle.md](hyperframes/references/skill-lifecycle.md) —— Skill 的安装与保鲜
- [hyperframes/references/storyboard-format.md](hyperframes/references/storyboard-format.md) —— 分镜格式 —— STORYBOARD.md + 解析后的 manifest
- [hyperframes/references/subagent-dispatch.md](hyperframes/references/subagent-dispatch.md) —— 子 agent 派发 —— harness 适配层
- [hyperframes/references/workflow-catalog.md](hyperframes/references/workflow-catalog.md) —— 工作流目录（已迁移）

### product-launch-video

- [product-launch-video/index.md](product-launch-video/index.md)（= 上游 `SKILL.md`） —— 用 HyperFrames 做产品发布视频
- [product-launch-video/references/cut-catalog.md](product-launch-video/references/cut-catalog.md) —— 切法目录 —— 帧内接缝（由 worker 构建）
- [product-launch-video/references/motion-language.md](product-launch-video/references/motion-language.md) —— 运动语言 —— 动作词表 + 运动准则 + seek 安全核心
- [product-launch-video/references/story-design.md](product-launch-video/references/story-design.md) —— 故事设计 —— 产品发布视频
- [product-launch-video/references/visual-design.md](product-launch-video/references/visual-design.md) —— 视觉设计 —— 产品发布的逐帧镜头方法
- [product-launch-video/sub-agents/frame-worker.md](product-launch-video/sub-agents/frame-worker.md) —— Frame worker —— 产品发布增量

### faceless-explainer

- [faceless-explainer/index.md](faceless-explainer/index.md)（= 上游 `SKILL.md`） —— Faceless Explainer to HyperFrames
- [faceless-explainer/references/cut-catalog.md](faceless-explainer/references/cut-catalog.md) —— 切法目录 —— 帧内接缝（由 worker 构建）
- [faceless-explainer/references/motion-language.md](faceless-explainer/references/motion-language.md) —— 运动语言 —— 运动词汇 + 运动准则 + seek 安全核心
- [faceless-explainer/references/story-design.md](faceless-explainer/references/story-design.md) —— 故事设计 —— 无人出镜讲解视频
- [faceless-explainer/references/visual-design.md](faceless-explainer/references/visual-design.md) —— 视觉设计 —— faceless-explainer 的逐帧镜头方法
- [faceless-explainer/sub-agents/frame-worker.md](faceless-explainer/sub-agents/frame-worker.md) —— Frame worker —— faceless-explainer 增量部分

### pr-to-video

- [pr-to-video/index.md](pr-to-video/index.md)（= 上游 `SKILL.md`） —— PR to HyperFrames
- [pr-to-video/references/code-vocabulary.md](pr-to-video/references/code-vocabulary.md) —— 代码词汇 —— code-* 动画 block
- [pr-to-video/references/cut-catalog.md](pr-to-video/references/cut-catalog.md) —— 切法目录 —— 帧内接缝（由 worker 构建）
- [pr-to-video/references/motion-language.md](pr-to-video/references/motion-language.md) —— 动效语言 —— 运动词汇 + 动效准则 + seek 安全的核心
- [pr-to-video/references/story-design.md](pr-to-video/references/story-design.md) —— 故事设计 —— PR → 叙事
- [pr-to-video/references/visual-design.md](pr-to-video/references/visual-design.md) —— 视觉设计 —— PR-to-video 的逐帧镜头方法
- [pr-to-video/sub-agents/frame-worker.md](pr-to-video/sub-agents/frame-worker.md) —— Frame worker —— PR-to-video 增量

### embedded-captions

- [embedded-captions/index.md](embedded-captions/index.md)（= 上游 `SKILL.md`） —— Embedded Captions（嵌入式字幕）
- [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) —— 目录（THE CATALOG）—— 一个前端，背后三个引擎
- [embedded-captions/dna/README.md](embedded-captions/dna/README.md) —— DNA registry —— 挑一种视觉语言，而不是挑一个 preset
- [embedded-captions/modes/cinematic/README.md](embedded-captions/modes/cinematic/README.md) —— Cinematic 模式（纯嵌入）—— 一个引擎，六套 DNA
- [embedded-captions/modes/cinematic/_archive/champion/spec.md](embedded-captions/modes/cinematic/_archive/champion/spec.md) —— 模板：champion
- [embedded-captions/modes/cinematic/_archive/memory-wall/spec.md](embedded-captions/modes/cinematic/_archive/memory-wall/spec.md) —— 模板：memory-wall
- [embedded-captions/modes/cinematic/_archive/portrait-header/spec.md](embedded-captions/modes/cinematic/_archive/portrait-header/spec.md) —— 模板：portrait-header
- [embedded-captions/modes/cinematic/cinematic-cream/spec.md](embedded-captions/modes/cinematic/cinematic-cream/spec.md) —— cinematic-cream —— 规范
- [embedded-captions/modes/standard/_anatomy.md](embedded-captions/modes/standard/_anatomy.md) —— 字幕模板 —— 解剖（共享引擎）
- [embedded-captions/modes/standard/_motion.md](embedded-captions/modes/standard/_motion.md) —— 字幕模板 —— 动效语言
- [embedded-captions/references/aesthetic-principles.md](embedded-captions/references/aesthetic-principles.md) —— 电影感字幕的美学原则
- [embedded-captions/references/anti-patterns.md](embedded-captions/references/anti-patterns.md) —— 反模式
- [embedded-captions/references/bespoke-vs-presets.md](embedded-captions/references/bespoke-vs-presets.md) —— 定制设计 vs. preset —— 何时覆盖，何时克隆
- [embedded-captions/references/caption-grouping.md](embedded-captions/references/caption-grouping.md) —— 字幕分组
- [embedded-captions/references/composition-craft.md](embedded-captions/references/composition-craft.md) —— 构图工艺 —— 仅适用于嵌入轨
- [embedded-captions/references/direction-catalog.md](embedded-captions/references/direction-catalog.md) —— 方向目录
- [embedded-captions/references/failure-modes.md](embedded-captions/references/failure-modes.md) —— 失败模式 —— 吃过苦头才学到的
- [embedded-captions/references/layout-heuristics.md](embedded-captions/references/layout-heuristics.md) —— 布局启发式
- [embedded-captions/references/motion-vocabulary.md](embedded-captions/references/motion-vocabulary.md) —— 动效词汇 —— 有名字的词入场手法
- [embedded-captions/references/rail.md](embedded-captions/references/rail.md) —— Rail 轨 —— 标准的 lower-third 字幕
- [embedded-captions/references/reference-bar.md](embedded-captions/references/reference-bar.md) —— 参照标杆 —— 世界级是什么样子
- [embedded-captions/references/scene-types.md](embedded-captions/references/scene-types.md) —— 场景类型 —— 选对模板
- [embedded-captions/references/typographic-moves.md](embedded-captions/references/typographic-moves.md) —— 字体排印手法 —— 是色板，不是牢笼
- [embedded-captions/references/typography-presets.md](embedded-captions/references/typography-presets.md) —— 字体排印 preset
- [embedded-captions/themes/README.md](embedded-captions/themes/README.md) —— THEME 模式 —— 组合而成的视觉宪章

### talking-head-recut

- [talking-head-recut/index.md](talking-head-recut/index.md)（= 上游 `SKILL.md`） —— Talking Head Recut
- [talking-head-recut/NOTICE.md](talking-head-recut/NOTICE.md) —— 署名声明
- [talking-head-recut/references/DESIGN_INDEX.md](talking-head-recut/references/DESIGN_INDEX.md) —— V—Take 视觉设计库

### motion-graphics

- [motion-graphics/index.md](motion-graphics/index.md)（= 上游 `SKILL.md`） —— motion-graphics —— 派发入口
- [motion-graphics/agents/builder.md](motion-graphics/agents/builder.md) —— Motion-Graphics Builder
- [motion-graphics/agents/director.md](motion-graphics/agents/director.md) —— Motion-Graphics Director
- [motion-graphics/agents/finalize.md](motion-graphics/agents/finalize.md) —— 定稿 / 修复子 agent
- [motion-graphics/catalog-map.md](motion-graphics/catalog-map.md) —— Director → catalog block 对照表（复用优先）
- [motion-graphics/categories/asset-fusion/module.md](motion-graphics/categories/asset-fusion/module.md) —— asset-fusion —— category 模块（搜索驱动 · 全新的 IP）
- [motion-graphics/categories/charts/module.md](motion-graphics/categories/charts/module.md) —— charts —— category 模块
- [motion-graphics/categories/kinetic-type/module.md](motion-graphics/categories/kinetic-type/module.md) —— kinetic-type —— category 模块
- [motion-graphics/categories/logo-reveal/module.md](motion-graphics/categories/logo-reveal/module.md) —— logo-reveal —— category 模块
- [motion-graphics/categories/lower-thirds/module.md](motion-graphics/categories/lower-thirds/module.md) —— lower-thirds —— category 模块
- [motion-graphics/categories/maps/module.md](motion-graphics/categories/maps/module.md) —— maps —— category 模块
- [motion-graphics/categories/news/module.md](motion-graphics/categories/news/module.md) —— news —— category 模块（搜索驱动）
- [motion-graphics/categories/stat/module.md](motion-graphics/categories/stat/module.md) —— stat —— category 模块
- [motion-graphics/categories/tweet/module.md](motion-graphics/categories/tweet/module.md) —— tweet —— category 模块（搜索驱动）
- [motion-graphics/categories/webpage/module.md](motion-graphics/categories/webpage/module.md) —— webpage —— category 模块（搜索驱动）
- [motion-graphics/grounding/PROTOCOL.md](motion-graphics/grounding/PROTOCOL.md) —— locate —— 在图片里找到 "X"（不假设有检测器 API）
- [motion-graphics/phases/source/guide.md](motion-graphics/phases/source/guide.md) —— source 阶段 —— 获取素材（素材优先）
- [motion-graphics/references/builder-contract.md](motion-graphics/references/builder-contract.md) —— Builder 契约 —— composition 规则（agents/builder.md 背后的细节）
- [motion-graphics/references/motion-vocabulary.md](motion-graphics/references/motion-vocabulary.md) —— 文字模块 · 运动词汇（基本元素 → GSAP）
- [motion-graphics/references/shot-plan-ir.md](motion-graphics/references/shot-plan-ir.md) —— shot-plan IR

### music-to-video

- [music-to-video/index.md](music-to-video/index.md)（= 上游 `SKILL.md`） —— music-to-video —— 一条以音乐为基础、卡节拍的视频工作流
- [music-to-video/references/frame-skeleton.md](music-to-video/references/frame-skeleton.md) —— Frame 骨架（Step 2）—— 读懂音乐，排出各个 frame
- [music-to-video/references/montage.md](music-to-video/references/montage.md) —— 素材处理方式 —— 把用户媒体编织到节拍主干上
- [music-to-video/references/motion-primitive-catalog.md](music-to-video/references/motion-primitive-catalog.md) —— 运动基本元素 catalog —— 自由组合菜单
- [music-to-video/references/motion-primitives/text-spectral-rays/USAGE.md](music-to-video/references/motion-primitives/text-spectral-rays/USAGE.md) —— 使用 text-spectral-rays —— 它独占自己的文字标志
- [music-to-video/references/planning.md](music-to-video/references/planning.md) —— 规划（Step 3）—— 挑选品牌，填满每一个 frame
- [music-to-video/references/storyboard-format.md](music-to-video/references/storyboard-format.md) —— STORYBOARD.md 格式 —— frame → group
- [music-to-video/references/template-catalog.md](music-to-video/references/template-catalog.md) —— 模板 catalog —— 选择菜单（Step 3）
- [music-to-video/sub-agents/frame-worker.md](music-to-video/sub-agents/frame-worker.md) —— Frame worker —— 逐 frame 的 composition 作者（music-to-video）

### slideshow

- [slideshow/index.md](slideshow/index.md)（= 上游 `SKILL.md`） —— Slideshow 编写约定
- [slideshow/references/standalone-harness.md](slideshow/references/standalone-harness.md) —— 独立运行的 HyperFrames Slideshow Harness

### general-video

- [general-video/index.md](general-video/index.md)（= 上游 `SKILL.md`） —— General video
- [general-video/sub-agents/frame-worker.md](general-video/sub-agents/frame-worker.md) —— Frame worker —— general-video 增量部分

### remotion-to-hyperframes

- [remotion-to-hyperframes/index.md](remotion-to-hyperframes/index.md)（= 上游 `SKILL.md`） —— Remotion to HyperFrames
- [remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/README.md](remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/README.md) —— Tier 1 — title-card-fade
- [remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/README.md](remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/README.md) —— Tier 2 — title-image-outro
- [remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/README.md](remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/README.md) —— Tier 3 — stargazed-data-driven
- [remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/README.md](remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/README.md) —— Tier 4 — escape-hatch
- [remotion-to-hyperframes/references/api-map.md](remotion-to-hyperframes/references/api-map.md) —— Remotion → HyperFrames API 映射
- [remotion-to-hyperframes/references/escape-hatch.md](remotion-to-hyperframes/references/escape-hatch.md) —— 何时退出：runtime 互操作模式
- [remotion-to-hyperframes/references/eval.md](remotion-to-hyperframes/references/eval.md) —— Eval：如何端到端地校验一次翻译
- [remotion-to-hyperframes/references/fonts.md](remotion-to-hyperframes/references/fonts.md) —— 字体翻译
- [remotion-to-hyperframes/references/limitations.md](remotion-to-hyperframes/references/limitations.md) —— 翻译的局限
- [remotion-to-hyperframes/references/lottie.md](remotion-to-hyperframes/references/lottie.md) —— Lottie 翻译：@remotion/lottie → HF lottie adapter
- [remotion-to-hyperframes/references/media.md](remotion-to-hyperframes/references/media.md) —— 媒体翻译：Audio、Video、Img、IFrame、staticFile
- [remotion-to-hyperframes/references/parameters.md](remotion-to-hyperframes/references/parameters.md) —— 参数翻译：Zod schema、defaultProps、calculateMetadata
- [remotion-to-hyperframes/references/sequencing.md](remotion-to-hyperframes/references/sequencing.md) —— Sequencing 翻译：Sequence、Series、Composition 根
- [remotion-to-hyperframes/references/timing.md](remotion-to-hyperframes/references/timing.md) —— Timing 翻译：interpolate、spring、easing
- [remotion-to-hyperframes/references/transitions.md](remotion-to-hyperframes/references/transitions.md) —— 转场翻译：@remotion/transitions → HF 交叉淡化 / shader-transitions

### hyperframes-core

- [hyperframes-core/index.md](hyperframes-core/index.md)（= 上游 `SKILL.md`） —— HyperFrames Core
- [hyperframes-core/references/composition-patterns.md](hyperframes-core/references/composition-patterns.md) —— Composition 模式
- [hyperframes-core/references/creator-editing-recipes.md](hyperframes-core/references/creator-editing-recipes.md) —— 创作者剪辑配方
- [hyperframes-core/references/data-attributes.md](hyperframes-core/references/data-attributes.md) —— Data 属性参考
- [hyperframes-core/references/determinism-rules.md](hyperframes-core/references/determinism-rules.md) —— 确定性、动画 Runtime 与布局
- [hyperframes-core/references/full-screen-motion.md](hyperframes-core/references/full-screen-motion.md) —— 全屏运动模式
- [hyperframes-core/references/minimal-composition.md](hyperframes-core/references/minimal-composition.md) —— 最小 Composition
- [hyperframes-core/references/sub-compositions.md](hyperframes-core/references/sub-compositions.md) —— Sub-Composition
- [hyperframes-core/references/tailwind.md](hyperframes-core/references/tailwind.md) —— HyperFrames Tailwind
- [hyperframes-core/references/tracks-and-clips.md](hyperframes-core/references/tracks-and-clips.md) —— Track 与 Clip
- [hyperframes-core/references/variables-and-media.md](hyperframes-core/references/variables-and-media.md) —— 变量与媒体

### hyperframes-animation

- [hyperframes-animation/index.md](hyperframes-animation/index.md)（= 上游 `SKILL.md`） —— HyperFrames Animation
- [hyperframes-animation/adapters/animate-text.md](hyperframes-animation/adapters/animate-text.md) —— 文字效果 —— 参考
- [hyperframes-animation/adapters/animejs.md](hyperframes-animation/adapters/animejs.md) —— 用于 HyperFrames 的 Anime.js
- [hyperframes-animation/adapters/css-animations.md](hyperframes-animation/adapters/css-animations.md) —— 用于 HyperFrames 的 CSS 动画
- [hyperframes-animation/adapters/gsap-easing-and-stagger.md](hyperframes-animation/adapters/gsap-easing-and-stagger.md) —— Easing、Stagger 与基于函数的值
- [hyperframes-animation/adapters/gsap-timeline-and-labels.md](hyperframes-animation/adapters/gsap-timeline-and-labels.md) —— Timeline 与 Label
- [hyperframes-animation/adapters/gsap-transforms-and-perf.md](hyperframes-animation/adapters/gsap-transforms-and-perf.md) —— Transform 与性能
- [hyperframes-animation/adapters/gsap.md](hyperframes-animation/adapters/gsap.md) —— HyperFrames GSAP
- [hyperframes-animation/adapters/html-in-canvas-patterns.md](hyperframes-animation/adapters/html-in-canvas-patterns.md) —— HTML-in-Canvas 模式
- [hyperframes-animation/adapters/lottie.md](hyperframes-animation/adapters/lottie.md) —— HyperFrames 中的 Lottie
- [hyperframes-animation/adapters/three.md](hyperframes-animation/adapters/three.md) —— HyperFrames 中的 Three.js
- [hyperframes-animation/adapters/typegpu.md](hyperframes-animation/adapters/typegpu.md) —— HyperFrames 中的 TypeGPU / WebGPU
- [hyperframes-animation/adapters/waapi.md](hyperframes-animation/adapters/waapi.md) —— HyperFrames 中的 Web Animations API
- [hyperframes-animation/blueprints-index.md](hyperframes-animation/blueprints-index.md) —— Blueprint（经过验证的形状）
- [hyperframes-animation/blueprints/agent-progress-theater.md](hyperframes-animation/blueprints/agent-progress-theater.md) —— agent-progress-theater —— Agent 进度剧场
- [hyperframes-animation/blueprints/camera-journey.md](hyperframes-animation/blueprints/camera-journey.md) —— camera-journey —— 摄像机旅程
- [hyperframes-animation/blueprints/comparison-split.md](hyperframes-animation/blueprints/comparison-split.md) —— comparison-split —— 对比分屏卡片
- [hyperframes-animation/blueprints/constellation-hub.md](hyperframes-animation/blueprints/constellation-hub.md) —— constellation-hub —— 星座 / 中枢 + 卫星
- [hyperframes-animation/blueprints/cta-morph-press.md](hyperframes-animation/blueprints/cta-morph-press.md) —— cta-morph-press —— CTA 变形与按压
- [hyperframes-animation/blueprints/cursor-ui-demo.md](hyperframes-animation/blueprints/cursor-ui-demo.md) —— cursor-ui-demo — 光标驱动的 UI 演示
- [hyperframes-animation/blueprints/dataviz-countup.md](hyperframes-animation/blueprints/dataviz-countup.md) —— dataviz-countup — 数据可视化 / 数字滚动计数
- [hyperframes-animation/blueprints/device-surface-showcase.md](hyperframes-animation/blueprints/device-surface-showcase.md) —— device-surface-showcase — 设备 / 界面展示
- [hyperframes-animation/blueprints/fixed-anchor-cycle.md](hyperframes-animation/blueprints/fixed-anchor-cycle.md) —— fixed-anchor-cycle — 固定锚点，轮换世界
- [hyperframes-animation/blueprints/grid-card-assemble.md](hyperframes-animation/blueprints/grid-card-assemble.md) —— grid-card-assemble — 网格 / 卡片组装
- [hyperframes-animation/blueprints/kinetic-type-beats.md](hyperframes-animation/blueprints/kinetic-type-beats.md) —— kinetic-type-beats — 动态文字段落节拍
- [hyperframes-animation/blueprints/logo-assemble-lockup.md](hyperframes-animation/blueprints/logo-assemble-lockup.md) —— logo-assemble-lockup — Logo 组装 → Lockup
- [hyperframes-animation/blueprints/overwhelm-surround.md](hyperframes-animation/blueprints/overwhelm-surround.md) —— overwhelm-surround — 压迫 / 围拢
- [hyperframes-animation/blueprints/panel-edit-live-sync.md](hyperframes-animation/blueprints/panel-edit-live-sync.md) —— panel-edit-live-sync —— 面板编辑，实时同步
- [hyperframes-animation/blueprints/prompt-type-submit-generate.md](hyperframes-animation/blueprints/prompt-type-submit-generate.md) —— prompt-type-submit-generate —— 输入提示词、提交、生成
- [hyperframes-animation/blueprints/spatial-pan-stations.md](hyperframes-animation/blueprints/spatial-pan-stations.md) —— spatial-pan-stations —— 空间平移 / 站点
- [hyperframes-animation/blueprints/ticker-takeover.md](hyperframes-animation/blueprints/ticker-takeover.md) —— ticker-takeover —— 滚字被挤开 / 接管
- [hyperframes-animation/blueprints/titlecard-reveal.md](hyperframes-animation/blueprints/titlecard-reveal.md) —— titlecard-reveal —— 标题卡 / 单卡揭示
- [hyperframes-animation/blueprints/transcript-scroll-artifact-reveal.md](hyperframes-animation/blueprints/transcript-scroll-artifact-reveal.md) —— transcript-scroll-artifact-reveal —— 对话记录滚动 + 产物揭示
- [hyperframes-animation/blueprints/typewriter-reveal.md](hyperframes-animation/blueprints/typewriter-reveal.md) —— typewriter-reveal —— 打字机揭示
- [hyperframes-animation/blueprints/video-text-pivot.md](hyperframes-animation/blueprints/video-text-pivot.md) —— video-text-pivot —— 视频 → 文字转向
- [hyperframes-animation/blueprints/zoom-out-workspace-reveal.md](hyperframes-animation/blueprints/zoom-out-workspace-reveal.md) —— zoom-out-workspace-reveal —— 拉远揭示工作区
- [hyperframes-animation/references/motion-blur.md](hyperframes-animation/references/motion-blur.md) —— 运动模糊 —— 任何动画元素上的快门拖影
- [hyperframes-animation/rules-index.md](hyperframes-animation/rules-index.md) —— 规则索引
- [hyperframes-animation/rules/3d-camera-flight.md](hyperframes-animation/rules/3d-camera-flight.md) —— 3D Camera Flight（3D 镜头飞行）
- [hyperframes-animation/rules/3d-page-scroll.md](hyperframes-animation/rules/3d-page-scroll.md) —— 3D Page Scroll（3D 页面滚动）
- [hyperframes-animation/rules/3d-text-depth-layers.md](hyperframes-animation/rules/3d-text-depth-layers.md) —— 3D Text Depth Layers（3D 文字纵深图层）
- [hyperframes-animation/rules/ai-tracking-box.md](hyperframes-animation/rules/ai-tracking-box.md) —— AI Tracking Box（AI 跟踪框）
- [hyperframes-animation/rules/ambient-glow-bloom.md](hyperframes-animation/rules/ambient-glow-bloom.md) —— Ambient Glow Bloom（环境辉光绽放）
- [hyperframes-animation/rules/anchored-layout-expand.md](hyperframes-animation/rules/anchored-layout-expand.md) —— 锚定布局展开
- [hyperframes-animation/rules/asr-keyword-glow.md](hyperframes-animation/rules/asr-keyword-glow.md) —— ASR 关键词发光
- [hyperframes-animation/rules/avatar-cloud-network.md](hyperframes-animation/rules/avatar-cloud-network.md) —— 头像云网络
- [hyperframes-animation/rules/camera-cursor-tracking.md](hyperframes-animation/rules/camera-cursor-tracking.md) —— 两阶段摄像机光标跟踪
- [hyperframes-animation/rules/card-morph-anchor.md](hyperframes-animation/rules/card-morph-anchor.md) —— 卡片形变锚点
- [hyperframes-animation/rules/center-outward-expansion.md](hyperframes-animation/rules/center-outward-expansion.md) —— 中心向外扩散
- [hyperframes-animation/rules/chart-scrub-readout.md](hyperframes-animation/rules/chart-scrub-readout.md) —— 图表拖动读数
- [hyperframes-animation/rules/chromatic-glitch.md](hyperframes-animation/rules/chromatic-glitch.md) —— 色差故障
- [hyperframes-animation/rules/context-sensitive-cursor.md](hyperframes-animation/rules/context-sensitive-cursor.md) —— 上下文感知光标
- [hyperframes-animation/rules/control-target-sync.md](hyperframes-animation/rules/control-target-sync.md) —— 控件-目标同步
- [hyperframes-animation/rules/coordinate-target-zoom.md](hyperframes-animation/rules/coordinate-target-zoom.md) —— 坐标目标缩放
- [hyperframes-animation/rules/counting-dynamic-scale.md](hyperframes-animation/rules/counting-dynamic-scale.md) —— 动态缩放计数
- [hyperframes-animation/rules/css-marker-patterns.md](hyperframes-animation/rules/css-marker-patterns.md) —— 记号笔高亮的 CSS 模式
- [hyperframes-animation/rules/cursor-click-ripple.md](hyperframes-animation/rules/cursor-click-ripple.md) —— 光标点击涟漪
- [hyperframes-animation/rules/cursor-drag.md](hyperframes-animation/rules/cursor-drag.md) —— 光标拖动
- [hyperframes-animation/rules/depth-of-field-blur.md](hyperframes-animation/rules/depth-of-field-blur.md) —— 景深模糊（选择性对焦 / 移焦）
- [hyperframes-animation/rules/depth-scatter-assemble.md](hyperframes-animation/rules/depth-scatter-assemble.md) —— 纵深散开 ↔ 组装
- [hyperframes-animation/rules/discrete-text-sequence.md](hyperframes-animation/rules/discrete-text-sequence.md) —— 离散文字序列
- [hyperframes-animation/rules/dynamic-content-sequencing.md](hyperframes-animation/rules/dynamic-content-sequencing.md) —— 动态内容排程
- [hyperframes-animation/rules/gradient-text-sweep.md](hyperframes-animation/rules/gradient-text-sweep.md) —— 渐变文字扫光
- [hyperframes-animation/rules/gsap-effects.md](hyperframes-animation/rules/gsap-effects.md) —— HyperFrames 的 GSAP 效果
- [hyperframes-animation/rules/hacker-flip-3d.md](hyperframes-animation/rules/hacker-flip-3d.md) —— Hacker Flip 3D 揭示
- [hyperframes-animation/rules/kinetic-beat-slam.md](hyperframes-animation/rules/kinetic-beat-slam.md) —— Kinetic Beat Slam
- [hyperframes-animation/rules/motion-blur-streak.md](hyperframes-animation/rules/motion-blur-streak.md) —— Motion-Blur Streak
- [hyperframes-animation/rules/multi-cursor-choreography.md](hyperframes-animation/rules/multi-cursor-choreography.md) —— Multi-Cursor Choreography
- [hyperframes-animation/rules/multi-phase-camera.md](hyperframes-animation/rules/multi-phase-camera.md) —— Multi-Phase Camera
- [hyperframes-animation/rules/nudge-curve.md](hyperframes-animation/rules/nudge-curve.md) —— Nudge Curve
- [hyperframes-animation/rules/orbit-3d-entry.md](hyperframes-animation/rules/orbit-3d-entry.md) —— 带 3D 入场的轨道运动（Orbit with 3D Entry）
- [hyperframes-animation/rules/particle-burst.md](hyperframes-animation/rules/particle-burst.md) —— Particle Burst
- [hyperframes-animation/rules/physics-press-reaction.md](hyperframes-animation/rules/physics-press-reaction.md) —— Physics Press Reaction（光标 + 元素同步）
- [hyperframes-animation/rules/press-release-spring.md](hyperframes-animation/rules/press-release-spring.md) —— Press-Release Spring Chain
- [hyperframes-animation/rules/reactive-displacement.md](hyperframes-animation/rules/reactive-displacement.md) —— Reactive Displacement
- [hyperframes-animation/rules/scale-swap-transition.md](hyperframes-animation/rules/scale-swap-transition.md) —— Scale-Swap Transition
- [hyperframes-animation/rules/sine-wave-loop.md](hyperframes-animation/rules/sine-wave-loop.md) —— Sine Wave Loop（含蓄抖动 / 有界环境运动）
- [hyperframes-animation/rules/split-tilt-cards.md](hyperframes-animation/rules/split-tilt-cards.md) —— Split Tilt Cards
- [hyperframes-animation/rules/spring-pop-entrance.md](hyperframes-animation/rules/spring-pop-entrance.md) —— Spring-Pop Entrance
- [hyperframes-animation/rules/stat-bars-and-fills.md](hyperframes-animation/rules/stat-bars-and-fills.md) —— Stat Bars & Fills
- [hyperframes-animation/rules/svg-icon-enrichment.md](hyperframes-animation/rules/svg-icon-enrichment.md) —— SVG Icon Enrichment
- [hyperframes-animation/rules/svg-path-draw.md](hyperframes-animation/rules/svg-path-draw.md) —— SVG Path Draw
- [hyperframes-animation/rules/theme-crossfade-morph.md](hyperframes-animation/rules/theme-crossfade-morph.md) —— Theme Crossfade Morph
- [hyperframes-animation/rules/vertical-spring-ticker.md](hyperframes-animation/rules/vertical-spring-ticker.md) —— Vertical Spring Ticker（老虎机）
- [hyperframes-animation/rules/viewport-change.md](hyperframes-animation/rules/viewport-change.md) —— Viewport Change（虚拟镜头）
- [hyperframes-animation/rules/waterfall-entry.md](hyperframes-animation/rules/waterfall-entry.md) —— 瀑布入场（Waterfall Entry）
- [hyperframes-animation/techniques.md](hyperframes-animation/techniques.md) —— 视觉技法参考
- [hyperframes-animation/transitions/TRANSITION-REGISTRY.md](hyperframes-animation/transitions/TRANSITION-REGISTRY.md) —— 转场 registry——机器用的唯一事实来源
- [hyperframes-animation/transitions/catalog.md](hyperframes-animation/transitions/catalog.md) —— 转场目录
- [hyperframes-animation/transitions/css-3d.md](hyperframes-animation/transitions/css-3d.md) —— css-3d
- [hyperframes-animation/transitions/css-blur.md](hyperframes-animation/transitions/css-blur.md) —— css-blur
- [hyperframes-animation/transitions/css-cover.md](hyperframes-animation/transitions/css-cover.md) —— css-cover
- [hyperframes-animation/transitions/css-destruction.md](hyperframes-animation/transitions/css-destruction.md) —— css-destruction
- [hyperframes-animation/transitions/css-dissolve.md](hyperframes-animation/transitions/css-dissolve.md) —— css-dissolve
- [hyperframes-animation/transitions/css-distortion.md](hyperframes-animation/transitions/css-distortion.md) —— css-distortion
- [hyperframes-animation/transitions/css-grid.md](hyperframes-animation/transitions/css-grid.md) —— css-grid
- [hyperframes-animation/transitions/css-light.md](hyperframes-animation/transitions/css-light.md) —— css-light
- [hyperframes-animation/transitions/css-mechanical.md](hyperframes-animation/transitions/css-mechanical.md) —— css-mechanical
- [hyperframes-animation/transitions/css-other.md](hyperframes-animation/transitions/css-other.md) —— css-other
- [hyperframes-animation/transitions/css-push.md](hyperframes-animation/transitions/css-push.md) —— css-push
- [hyperframes-animation/transitions/css-radial.md](hyperframes-animation/transitions/css-radial.md) —— css-radial
- [hyperframes-animation/transitions/css-scale.md](hyperframes-animation/transitions/css-scale.md) —— css-scale
- [hyperframes-animation/transitions/overview.md](hyperframes-animation/transitions/overview.md) —— 场景转场

### hyperframes-keyframes

- [hyperframes-keyframes/index.md](hyperframes-keyframes/index.md)（= 上游 `SKILL.md`） —— HyperFrames 关键帧（Keyframes）
- [hyperframes-keyframes/references/keyframe-patterns.md](hyperframes-keyframes/references/keyframe-patterns.md) —— 关键帧机制参考

### hyperframes-creative

- [hyperframes-creative/index.md](hyperframes-creative/index.md)（= 上游 `SKILL.md`） —— HyperFrames Creative
- [hyperframes-creative/frame-presets/biennale-yellow/FRAME.md](hyperframes-creative/frame-presets/biennale-yellow/FRAME.md) —— Biennale Yellow — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/blockframe/FRAME.md](hyperframes-creative/frame-presets/blockframe/FRAME.md) —— BlockFrame — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/blue-professional/FRAME.md](hyperframes-creative/frame-presets/blue-professional/FRAME.md) —— Blue Professional — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/bold-poster/FRAME.md](hyperframes-creative/frame-presets/bold-poster/FRAME.md) —— Bold Poster — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/broadside/FRAME.md](hyperframes-creative/frame-presets/broadside/FRAME.md) —— Broadside — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/capsule/FRAME.md](hyperframes-creative/frame-presets/capsule/FRAME.md) —— Capsule — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/cartesian/FRAME.md](hyperframes-creative/frame-presets/cartesian/FRAME.md) —— Cartesian — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/cobalt-grid/FRAME.md](hyperframes-creative/frame-presets/cobalt-grid/FRAME.md) —— Cobalt Grid — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/code-editorial/FRAME.md](hyperframes-creative/frame-presets/code-editorial/FRAME.md) —— Code editorial — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/coral/FRAME.md](hyperframes-creative/frame-presets/coral/FRAME.md) —— Coral — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/creative-mode/FRAME.md](hyperframes-creative/frame-presets/creative-mode/FRAME.md) —— Creative Mode — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/daisy-days/FRAME.md](hyperframes-creative/frame-presets/daisy-days/FRAME.md) —— Daisy Days — Frame (video / frame layer)
- [hyperframes-creative/frame-presets/editorial-forest/FRAME.md](hyperframes-creative/frame-presets/editorial-forest/FRAME.md) —— Editorial Forest — Frame (video / frame layer)
- [hyperframes-creative/palettes/bold-energetic.md](hyperframes-creative/palettes/bold-energetic.md) —— 大胆 / 活力（Bold / Energetic）
- [hyperframes-creative/palettes/clean-corporate.md](hyperframes-creative/palettes/clean-corporate.md) —— 简洁 / 企业（Clean / Corporate）
- [hyperframes-creative/palettes/dark-premium.md](hyperframes-creative/palettes/dark-premium.md) —— 暗色 / 高级（Dark / Premium）
- [hyperframes-creative/palettes/jewel-rich.md](hyperframes-creative/palettes/jewel-rich.md) —— 宝石 / 浓郁（Jewel / Rich）
- [hyperframes-creative/palettes/monochrome.md](hyperframes-creative/palettes/monochrome.md) —— 单色（Monochrome）
- [hyperframes-creative/palettes/nature-earth.md](hyperframes-creative/palettes/nature-earth.md) —— 自然 / 大地（Nature / Earth）
- [hyperframes-creative/palettes/neon-electric.md](hyperframes-creative/palettes/neon-electric.md) —— 霓虹 / 电光（Neon / Electric）
- [hyperframes-creative/palettes/pastel-soft.md](hyperframes-creative/palettes/pastel-soft.md) —— 粉彩 / 柔和（Pastel / Soft）
- [hyperframes-creative/palettes/warm-editorial.md](hyperframes-creative/palettes/warm-editorial.md) —— 暖调 / 编辑感（Warm / Editorial）
- [hyperframes-creative/references/audio-reactive.md](hyperframes-creative/references/audio-reactive.md) —— 音频响应动画
- [hyperframes-creative/references/beat-direction.md](hyperframes-creative/references/beat-direction.md) —— 段落节拍导演
- [hyperframes-creative/references/composition-patterns.md](hyperframes-creative/references/composition-patterns.md) —— Composition 图式
- [hyperframes-creative/references/data-in-motion.md](hyperframes-creative/references/data-in-motion.md) —— 运动中的数据
- [hyperframes-creative/references/design-adherence.md](hyperframes-creative/references/design-adherence.md) —— 设计遵循度
- [hyperframes-creative/references/design-picker.md](hyperframes-creative/references/design-picker.md) —— 设计选择器
- [hyperframes-creative/references/design-spec.md](hyperframes-creative/references/design-spec.md) —— 设计规范 —— frame.md / design.md
- [hyperframes-creative/references/house-style.md](hyperframes-creative/references/house-style.md) —— 内部风格（House Style）
- [hyperframes-creative/references/motion-principles.md](hyperframes-creative/references/motion-principles.md) —— 运动原则
- [hyperframes-creative/references/narration.md](hyperframes-creative/references/narration.md) —— 旁白与脚本
- [hyperframes-creative/references/prompt-expansion.md](hyperframes-creative/references/prompt-expansion.md) —— Prompt 扩写
- [hyperframes-creative/references/story-spine.md](hyperframes-creative/references/story-spine.md) —— 故事主干 —— 价值优先的叙事准则
- [hyperframes-creative/references/storyboard-recipe.md](hyperframes-creative/references/storyboard-recipe.md) —— 分镜配方 —— 像发布影片那样规划一支视频
- [hyperframes-creative/references/typography.md](hyperframes-creative/references/typography.md) —— 字体排印
- [hyperframes-creative/references/video-composition.md](hyperframes-creative/references/video-composition.md) —— 视频构图
- [hyperframes-creative/references/visual-styles.md](hyperframes-creative/references/visual-styles.md) —— 视觉风格库

### media-use

- [media-use/index.md](media-use/index.md)（= 上游 `SKILL.md`） —— media-use
- [media-use/audio/assets/sfx/CREDITS.md](media-use/audio/assets/sfx/CREDITS.md) —— 音效（SFX）来源致谢
- [media-use/audio/references/bgm.md](media-use/audio/references/bgm.md) —— 背景音乐（BGM）
- [media-use/audio/references/captions/authoring.md](media-use/audio/references/captions/authoring.md) —— 字幕
- [media-use/audio/references/captions/motion.md](media-use/audio/references/captions/motion.md) —— 动态字幕技法
- [media-use/audio/references/captions/transcript-handling.md](media-use/audio/references/captions/transcript-handling.md) —— 转写稿指南
- [media-use/audio/references/remove-background.md](media-use/audio/references/remove-background.md) —— 背景移除
- [media-use/audio/references/requirements.md](media-use/audio/references/requirements.md) —— 依赖与缓存
- [media-use/audio/references/sfx.md](media-use/audio/references/sfx.md) —— 音效（SFX）
- [media-use/audio/references/transcribe.md](media-use/audio/references/transcribe.md) —— 转写
- [media-use/audio/references/tts-to-captions.md](media-use/audio/references/tts-to-captions.md) —— TTS → 字幕
- [media-use/audio/references/tts.md](media-use/audio/references/tts.md) —— 文字转语音
- [media-use/luts/README.md](media-use/luts/README.md) —— LUT 库（编写说明）
- [media-use/references/audio.md](media-use/references/audio.md) —— 音频引擎 —— 旁白、音乐、音效、字幕、转写
- [media-use/references/grading.md](media-use/references/grading.md) —— 调色 —— grade 块与 LUT
- [media-use/references/media-treatment-recipes.md](media-use/references/media-treatment-recipes.md) —— 媒体处理方案配方
- [media-use/references/media-treatments.md](media-use/references/media-treatments.md) —— 媒体处理方案
- [media-use/references/memory.md](media-use/references/memory.md) —— 用户记忆 —— 偏好与配方
- [media-use/references/meta.md](media-use/references/meta.md) —— 职责矩阵、使用统计、遥测、隐私
- [media-use/references/operations.md](media-use/references/operations.md) —— 媒体操作：agent 指南
- [media-use/references/resolve.md](media-use/references/resolve.md) —— Resolve —— 命令、参数、复用、收编（adopt）、清单
- [media-use/references/setup-providers.md](media-use/references/setup-providers.md) —— 安装与提供方 —— 安装、认证、RAM 阶梯、强制指定提供方
- [media-use/references/telemetry-dashboard.md](media-use/references/telemetry-dashboard.md) —— media-use 使用情况仪表盘

### hyperframes-audio

- [hyperframes-audio/index.md](hyperframes-audio/index.md)（= 上游 `SKILL.md`） —— HyperFrames 音频
- [hyperframes-audio/references/attributes.md](hyperframes-audio/references/attributes.md) —— 三个音频属性
- [hyperframes-audio/references/diagnosis.md](hyperframes-audio/references/diagnosis.md) —— 诊断你听不到的音频
- [hyperframes-audio/references/fx-registry.md](hyperframes-audio/references/fx-registry.md) —— 效果 registry
- [hyperframes-audio/references/presets.md](hyperframes-audio/references/presets.md) —— Preset、具名任务（job）和单旋钮 profile

### hyperframes-cli

- [hyperframes-cli/index.md](hyperframes-cli/index.md)（= 上游 `SKILL.md`） —— HyperFrames CLI
- [hyperframes-cli/references/beats.md](hyperframes-cli/references/beats.md) —— 生成项目的节拍网格
- [hyperframes-cli/references/cloud.md](hyperframes-cli/references/cloud.md) —— cloud —— HeyGen 托管渲染（零基础设施）
- [hyperframes-cli/references/cloudrun.md](hyperframes-cli/references/cloudrun.md) —— 在 Google Cloud 上用 Cloud Run 渲染
- [hyperframes-cli/references/compare-and-batch.md](hyperframes-cli/references/compare-and-batch.md) —— 对比与批量渲染
- [hyperframes-cli/references/doctor-browser.md](hyperframes-cli/references/doctor-browser.md) —— doctor、browser
- [hyperframes-cli/references/init-and-scaffold.md](hyperframes-cli/references/init-and-scaffold.md) —— init、capture、skills
- [hyperframes-cli/references/lambda.md](hyperframes-cli/references/lambda.md) —— 在 AWS 上用 Lambda 渲染
- [hyperframes-cli/references/lint-validate-inspect.md](hyperframes-cli/references/lint-validate-inspect.md) —— lint、check、snapshot
- [hyperframes-cli/references/preview-render.md](hyperframes-cli/references/preview-render.md) —— preview、play、render、publish
- [hyperframes-cli/references/upgrade-info-misc.md](hyperframes-cli/references/upgrade-info-misc.md) —— info、upgrade、compositions、timeline、docs、benchmark、telemetry、素材预处理

### hyperframes-registry

- [hyperframes-registry/index.md](hyperframes-registry/index.md)（= 上游 `SKILL.md`） —— HyperFrames Registry
- [hyperframes-registry/examples/add-block.md](hyperframes-registry/examples/add-block.md) —— 完整示例：添加一个 block
- [hyperframes-registry/examples/add-component.md](hyperframes-registry/examples/add-component.md) —— 完整示例：添加一个 component
- [hyperframes-registry/references/component-quality-bar.md](hyperframes-registry/references/component-quality-bar.md) —— Component 质量门槛
- [hyperframes-registry/references/contributing.md](hyperframes-registry/references/contributing.md) —— 向 registry 贡献 block 或 component
- [hyperframes-registry/references/demo-html-pattern.md](hyperframes-registry/references/demo-html-pattern.md) —— demo.html 约定
- [hyperframes-registry/references/discovery.md](hyperframes-registry/references/discovery.md) —— Registry 发现
- [hyperframes-registry/references/install-locations.md](hyperframes-registry/references/install-locations.md) —— 安装位置
- [hyperframes-registry/references/placeholder-material.md](hyperframes-registry/references/placeholder-material.md) —— 占位材质
- [hyperframes-registry/references/templates.md](hyperframes-registry/references/templates.md) —— 贡献用模板
- [hyperframes-registry/references/wiring-blocks.md](hyperframes-registry/references/wiring-blocks.md) —— 接入 block
- [hyperframes-registry/references/wiring-components.md](hyperframes-registry/references/wiring-components.md) —— 接入 component

### figma

- [figma/index.md](figma/index.md)（= 上游 `SKILL.md`） —— Figma → HyperFrames

### hyperframes-studio

- [hyperframes-studio/index.md](hyperframes-studio/index.md)（= 上游 `SKILL.md`） —— HyperFrames Studio 约定
