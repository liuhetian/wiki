---
description: "HyperFrames 视频的维护记录：吸纳自 heygen-com/hyperframes，钉在 46f6cb3，21 个 skill、330 篇全文中译，脚本模板原样随附；FRAME.md 的 frontmatter 不译，各子 skill 入口末尾加文件清单；单元测试、repo 内部 skill、插件清单、README 跳过"
---

# HyperFrames 视频（hyperframes）

[HyperFrames 视频](../../skills/hyperframes/index.md)的维护记录。上游更新只由人来做：AI 不要去读上游仓库，也不要装上游 skill，入口页的[远程使用须知](../../skills/hyperframes/index.md#remote-use)写了怎么绕开那些安装命令。

- **上游**：heygen-com/hyperframes 仓库 `skills/` 下发布的全部 21 个 skill[^repo]，HeyGen 的 HyperFrames 团队编写，Apache-2.0，许可证原文随目录留在 `LICENSE`；上游没有 NOTICE 文件。Claude Code 插件 `hyperframes@hyperframes` 装的就是这一套。第三方内容：
    - talking-head-recut 改编自 notedit/vtake-skills 的 `vtake-cut`[^vtake]（作者 leeoxiang，MIT）：卡片式设计系统、版式、字体和 GSAP 合成流程都来自那里。HeyGen 的改动与 MIT 许可原文见该 skill 的 [NOTICE.md](../../skills/hyperframes/talking-head-recut/NOTICE.md)，许可原文在代码块里，原样保留
    - `media-use/audio/assets/sfx/` 下 19 个音效来自 Pixabay，按 Pixabay Content License 使用，见 [CREDITS.md](../../skills/hyperframes/media-use/audio/assets/sfx/CREDITS.md)
    - 随附的 57 个 woff2 字体都是开源字体（Inter、JetBrains Mono、EB Garamond、LXGW WenKai、Virgil 和一批 Google Fonts），`hyperframes-creative/frame-presets/code-editorial/fonts/` 带了两份 OFL 原文
- **commit**：钉在 `46f6cb3`（2026-10-09，插件清单版本 0.8.143），当天抓取。上游一天十几个 commit，这里是那天的快照
- **跳过**：
    - 单元测试：`*.test.mjs`、`*_test.py`、`skills/python-encoding.test.mjs`，运行 skill 用不到。`remotion-to-hyperframes/assets/test-corpus/` 留着，它的入口把它当验收语料用
    - `.gitignore`、`.gitkeep`
    - 6 个 repo 内部 skill：`.claude/skills/` 与 `.agents/skills/` 下的 changelog-video、motion-doctrine、cut-the-curve、captions-overlay、seam-craft、oversized-cursor。它们标了 `metadata.internal: true`，不随插件发布，服务 HeyGen 自己的每周更新视频；changelog-video 还带了商业字体 TT Norms Pro
    - 插件清单：`.claude-plugin/`、`.codex-plugin/`、`.cursor-plugin/`、`gemini-extension.json`、`plugin.json`、`skills-manifest.json`。本 wiki 不是插件安装源，这里的 skill 按 standalone 模式运行（[plugin-installation.md](../../skills/hyperframes/hyperframes/references/plugin-installation.md) 的判据：入口往上两级找不到插件清单就是 standalone）
    - README[^readme]、`CLAUDE.md`、`AGENTS.md`、`docs/` 文档站：写给 GitHub 读者的介绍，不是行为定义
    - 仓库其余部分：`packages/` 源码、`registry/` 的 block 与 component。skill 通过 `npx hyperframes` CLI 和 `hyperframes add` 用到它们，运行时从 npm 和 registry 获取
- **翻译之外的改动**：
    - 每个 skill 的 `SKILL.md` 改名 `index.md`；其余 309 篇 `.md`（中译）和 539 个脚本、模板、JSON、字体、音效、图片（照录）按上游 `skills/` 下的相对路径放，skill 之间、文件之间的相对引用原样有效
    - 自己写的只有总入口 [index.md](../../skills/hyperframes/index.md)、`.meta.yml`（给没有 frontmatter 的译文补默认 description）和本页
    - 各子 skill 入口末尾加「本 skill 的文件」一节，逐个挂链：上游正文多用行内代码写路径，不挂链 AI 顺链接走不到。`figma`、`hyperframes-studio` 目录下只有入口，没加
    - `hyperframes-creative/frame-presets/*/FRAME.md` 的 frontmatter 补了 84 处冒号后的空格，见下面[译法](#translation)
    - 2026-10-19 起正文里的外链挪进文末脚注（15 篇、18 个网址），守[正文链接只指站内](../../skills/wiki-guide/index.md#rules)；没写成链接、直接贴出来的网址照旧
    - 部署时整个目录打成 `hyperframes.tar.gz`，声明写在入口首段

## 译法 { #translation }

- **译了什么**：330 篇 markdown 的正文，以及 frontmatter 里的 `description`（skill 的触发条件）。指令的强度词译成同等强度：must → 必须，never → 绝不，do not → 不要
- **没译什么**：代码块（连同里面的英文注释、模板、示例对话和示例 prompt）、行内代码、链接目标、HTML 标签、frontmatter 的 `name` / `metadata` / `tags`。正文里的技术词、产品名、skill 名、CLI 命令和参数、文件名保留英文；会被程序原样读写的字面值也保留英文，比如 `BRIEF.md` / `STORYBOARD.md` 的字段名和取值、状态值、CLI 打印的原文行、按钮名；跨文件引用的 `Step N`、`§ N` 编号不动
- **统一译名**：gate → 闸门，intent layer → 意图层，caption → 字幕，talking-head → 口播……
- **被脚本读的 markdown 逐个核对过，翻译不影响脚本**：
    - `hyperframes-creative/frame-presets/*/FRAME.md`（13 个 frame preset）：`build-frame.mjs` 按行解析它的 frontmatter（`colors:`、`typography:`），所以 frontmatter 原样、连 description 也没译，只把上游 84 处 `key:{` 补成 `key: {` —— 冒号后缺空格，严格 YAML 不认，zensical 读页面元数据会直接报错；脚本都按 `:\s*\{` 匹配，不受影响。正文已译，字体名保持英文（脚本按单词边界替换字体名，并在第一个一级标题后插一段说明）
    - `hyperframes/references/frame-worker-core.md` 与各工作流的 `sub-agents/frame-worker.md`：`frame-packets.mjs` 把它们整篇拼成子 agent 的 `_role.md`，子 agent 读到的就是中文
    - `pr-to-video/references/code-vocabulary.md`：`frame-packets.mjs` 按「含某个行内代码的行」抽取表格行，译文表格逐行对应、行内代码一个不少
- **格式**：每篇译文的 frontmatter 之后（没有 frontmatter 的在文件开头）加一行 HTML 注释，写明中译自上游哪个文件，Apache-2.0 第 4(b) 条要求改动过的文件带显著说明；被链接锚点引用的标题有 28 处（如 `#reuse-before-you-resolve`），译文标题后补了 `{ #原锚点 }`，跨文件锚点链接照旧有效；英文的硬换行段落合并成一行，中文硬折行在 HTML 里会多出空格
- **校验**：逐文件比对译文与原文：代码块逐字一致，各级标题数、表格行数、列表项数一致，链接目标集合一致，原文的每个行内代码都还在；再用「译文中文字数 ÷ 原文英文词数」拦截漏译和概括（完整译文在 1.6–2.2 之间，低于 1.0 判为漏译）

## 脚本 { #scripts }

142 个运行时脚本，输入是用户的项目、素材或网站，要调 HyperFrames CLI、FFmpeg、无头浏览器、TTS 和转录模型，只能下载后本地执行。这是在执行第三方代码，执行前应让用户知情。

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

- **跨 skill 读文件**：`build-frame.mjs` 读 `../../hyperframes-creative/frame-presets/`，各工作流的 `frame-packets.mjs` 读 `../hyperframes/references/frame-worker-core.md`，所以整包是整套 21 个 skill，不按 skill 拆
- **回退到 npx**：`media-use/scripts/resolve.mjs`、`embedded-captions/scripts/hf-cli.cjs` 在上游 monorepo 里直接调 `packages/cli`，本地没有这个目录时回退到 `npx hyperframes`
- **按需装依赖**：`package-loader.mjs` 缺包时会提示安装钉了版本的 npm 包，用 `--ignore-scripts` 装进临时目录，需要交互确认或设 `HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1`
- 部署时 `.cjs` 和 `.mjs`、`.py`、`.sh` 一样钉成 `text/plain`，AI 抓取工具才收

## 上游更新 { #upstream-update }

只由人来做，AI 不要执行。

1. `git clone --depth 1` 拿上游新 commit，和 `46f6cb3` 比对 `skills/`
2. 非 `.md` 文件有变化直接覆盖；`.md` 有变化的按上面[译法](#translation)重译那几篇，FRAME.md 的 frontmatter 照旧原样，正文外链挪进脚注
3. 上游增删了文件：同步 `mkdocs.yml` 的 nav 和所属子 skill 入口末尾的「本 skill 的文件」
4. 更新本页的 commit、日期和脚注里的永链

[^repo]: [heygen-com/hyperframes @ 46f6cb3 的 skills/](https://github.com/heygen-com/hyperframes/tree/46f6cb356785bed79e1ce7b79d7e7accc697786a/skills)，2026-10-09 读。
[^vtake]: [notedit/vtake-skills](https://github.com/notedit/vtake-skills)，2026-10-09 读。
[^readme]: [hyperframes 的 README @ 46f6cb3](https://github.com/heygen-com/hyperframes/blob/46f6cb356785bed79e1ce7b79d7e7accc697786a/README.md)，2026-10-09 读。
