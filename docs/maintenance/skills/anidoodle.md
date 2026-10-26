---
description: "anidoodle 代码手绘的维护记录：吸纳自 alexgreensh/anidoodle，钉在 25aae33，73 篇文档全文中译；6 个撞网址或当不了索引的文件改名，正文路径改成相对链接，风格索引加配方列；registry.mjs 不再覆盖中文索引，docs-check.mjs 和 README 演示素材跳过"
---

# anidoodle 代码手绘（anidoodle）

[anidoodle 代码手绘](../../skills/anidoodle/index.md)的维护记录。

- **上游**：alexgreensh/anidoodle 的 `skills/anidoodle/`[^repo]，作者 Alex Greenshpun（10x Company），Apache-2.0，许可证原文和 NOTICE 不随附。第三方内容：
    - `engine/assets/refs/vangogh-almond-blossom.jpg` 是梵高《杏花》（1890），公有领域，取自 Wikimedia Commons，来历见同目录 `PROVENANCE.json`
    - 音源包不在仓库里，由 `soundfetch.mjs` 从上游 release `sounds-v1` 下载：乐器录音取自 VCSL（CC0），三个房间的脉冲响应取自约克大学 OpenAIR（CC BY 4.0，转发要带署名），署名全文见[音源许可证](../../skills/anidoodle/references/music/sounds-licenses.md)
- **commit**：钉在 `25aae33`（2026-10-17，版本 0.9.2），当天读时是最新
- **跳过**：
    - 插件只带这一个 skill，没有 hooks、agents、commands、mod、MCP，没有组件要转写或丢弃
    - 仓库根的 6 种语言 README、`PRIVACY.md`、插件清单（`.claude-plugin/`、`.codex-plugin/`、`.grok-plugin/`、`.agents/plugins/`）、`plugins/anidoodle/`（给 Codex 插件市场的同步副本，比 `skills/` 旧）和同步脚本 `scripts/`
    - 仓库根 `assets/` 下 README 用的演示成品：一张横幅动图、四段演示动图、两段 mp4、8 段试听 mp3、图标和社交预览图，约 33MB[^demos]。用户定的：不收进 Gallery，skill 入口只放自带的风格总览图 `assets/styles.jpg`
    - `engine/tools/docs-check.mjs`：上游的文档 CI，检查 `SKILL.md` 不超过 150 行、description 不超过 50 token、6 份 README 里写的画风数和代码一致。这里没有 `SKILL.md` 和 README，跑起来必然失败
- **翻译之外的改动**：
    - `SKILL.md` 改名 `index.md`；`name` 照旧，`description` 改写成什么时候用、做什么；开头一段末尾加整包声明，补一句为什么要整包；正文前插入风格总览图；七条铁律前加一步：开作品项目时写进该项目的 `CLAUDE.md` / `AGENTS.md`；工具表删掉 `docs-check.mjs` 一行；命令代码块里的注释译成中文
    - 6 个文件改名：`references/styles.md` 改 `references/style-guide.md`，因为它和目录 `references/styles/` 抢同一个网址；`references/styles/INDEX.md`、`references/music/README.md`、`references/music/theory/README.md`、`example/README.md`、`engine/tools/adapters/README.md` 都改 `index.md`。README 在 zensical 里本来就渲染成目录首页，但 check-links 只认 `index.md` 承担挂链
    - 上游正文用行内 code 写文档路径，改成相对当前文件的链接，链接文字保留上游写法（相对 skill 根），整包解压后照着读也对得上；指向 `.ts`、`.mjs`、`.json` 的路径仍是行内 code
    - 提到 `SKILL.md` 的地方改成链到入口页；GitHub 上风格总览图的地址改成本地 `assets/styles.jpg`；音源许可证里的外部网址挪进脚注
    - 风格索引加「配方」列，链到同目录 30 篇配方，`balloon`、`mellan` 两种没有配方页
    - `references/backends-and-adapters.md` 讲 HyperFrames 后端的地方补了一个站内链接，指向本站收的 [HyperFrames 视频](../../skills/hyperframes/index.md)
    - 引擎脚本：`registry.mjs` 不再生成 `references/styles/INDEX.md`，只写 `engine/styles.gen.json` —— 重新生成会用英文表盖掉中译和配方列，新增画风时手工在索引页加一行；`launchExample.ts`、`launch.mjs`、`scaffold.mjs`、`verify-export.mjs`、`adapters/hyperframes.mjs` 里指向改名文档的注释和提示跟着改；`registry.mjs` 开头的说明改成和现在的行为一致
    - `engine/test/` 保留：`gate.mjs --self-test` 读 `test/fixtures/`，工具表里的 `npm test` 也指着它

## 译法 { #translation }

- **译了什么**：73 篇 markdown 的正文、标题、表格和链接文字。指令强度对等译：must → 必须，never → 绝不。英文用全大写表强调的词译成中文加粗
- **没译什么**：围栏代码块（连同英文注释）、行内 code、文件名、命令和参数、画风 id、产品名。入口页命令代码块的注释是例外，译了
- **格式**：英文硬换行的段落合并成一行；被锚点链接指向的 3 个标题补了 `{ #上游 slug }`；嵌套列表缩进统一成 4 格
- **两份生成文件照样译了**：风格索引原由 `registry.mjs` 生成，音乐风格词汇表原由 `music.mjs vocab --md` 生成，重新跑生成器会得到英文原版
- **统一译名**：style → 画风，hand → 手笔，mark → 笔触，plate → 样张，still → 静帧，score → 配乐，craft bar → 手艺及格线，dead air → 冷场，seam → 接缝，token → 信物，gate → 闸门，sound pack → 音源包
- **校验**：每篇对照上游原文跑脚本：代码块逐字一致，标题数、表格行数一致，上游的行内 code 都还在（转成链接的路径算在链接文字里），链接目标存在，中文字数 ÷ 英文词数不低于 1.2

[^repo]: [alexgreensh/anidoodle @ 25aae33 的 skills/anidoodle](https://github.com/alexgreensh/anidoodle/tree/25aae33bc7cb4f15fcf3e4bdfe971bf88dcb9672/skills/anidoodle)，2026-10-17 读。
[^demos]: [README 演示素材 @ 25aae33](https://github.com/alexgreensh/anidoodle/tree/25aae33bc7cb4f15fcf3e4bdfe971bf88dcb9672/assets)，2026-10-17 读。
