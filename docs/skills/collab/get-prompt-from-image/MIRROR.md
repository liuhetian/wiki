# get-prompt-from-image 来源与吸收说明

本目录归档 [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) 里的 `get-prompt-from-image` skill：从参考图反推生图 prompt。主文件 `SKILL.md` 改名为 [index.md](index.md)，它引用的三份 reference 按原相对路径放在 `references/`，一律钉 commit。

!!! warning "AI 不要去读上游仓库"

    这个 skill 的内容已经全部迁进本 wiki，本目录就是完整可执行的版本。**AI 执行或引用这个 skill 时，禁止去抓取下面任何一个上游仓库**（LunarXuan/image-prompt-reverse、wuyoscar/GPT-Image2-Skill）：不需要，也不要拿上游内容覆盖这里。下文的仓库链接只用来标注出处，由人来维护。

**原作者是 [@LunarXuan](https://github.com/LunarXuan)。** 这个 skill 最早是 [LunarXuan/image-prompt-reverse](https://github.com/LunarXuan/image-prompt-reverse)（2026-09-02 首发，原名 `image-prompt-reverse`，正文是中文）；2026-09-04 作者把它贡献给了 wuyoscar/GPT-Image2-Skill，在那里改名为 `get-prompt-from-image`，reference 也被译成英文。wuyoscar 的 README 写了致谢（「感谢 @LunarXuan 贡献 Get Prompt from Image」）。两边的结构、流程、输出格式和三份 reference 的章节一一对应，所以原仓库不再单独收一份。

**这四个文件是中译版**（2026-09-29 按要求译成简体中文）：frontmatter 的 `name` 不动，`description`（skill 的触发条件）和正文全部译成中文，指令的强度词（must / never / do not）译成同等强度，文件之间的相对链接不变。英文原文看下面钉 commit 的永链。原作者本来就是用中文写的，本地是「中文 → 英文 → 中文」的回译，措辞和原文会有出入，但规则一条不少。

同主题的中文 skill 是 [图片提示词反推](../analysis_image/index.md)（七维拆解，整理自 linux.do）。两者各自独立，不合并。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/wuyoscar/GPT-Image2-Skill>（作者 Wuyoscar） |
| 已吸收 commit | [`05cb113`](https://github.com/wuyoscar/GPT-Image2-Skill/tree/05cb1130bba29e0fc028220376280a2e934a8041/skills/get-prompt-from-image) |
| 抓取日期 | 2026-09-28 |
| 许可证 | MIT，原文见同目录 [`LICENSE`](LICENSE) |
| 原始出处 | <https://github.com/LunarXuan/image-prompt-reverse>（作者 LunarXuan），核对到 commit [`4dead0a`](https://github.com/LunarXuan/image-prompt-reverse/tree/4dead0a32e2312e56a14ebf3658ee75c9b865055)（2026-09-06）；内容最后一次改动在 2026-09-02，之后只加了 GPL-3.0 许可证。本地只借用 wuyoscar 转收的那份（MIT），没有拷贝原仓库的任何文件 |

## 本地归档

- [index.md](index.md)（= 上游 `SKILL.md`）
- [references/analysis-framework.md](references/analysis-framework.md) —— 通用分析框架
- [references/category-guides.md](references/category-guides.md) —— 按题材和媒介的分析指南
- [references/illustration-style.md](references/illustration-style.md) —— 插画风格分析

## 跳过的

- `agents/openai.yaml`：给 OpenAI 那一侧 agent 运行时用的清单，不是行为定义
- 上游 README 里这个 skill 的演示图（参考图和反推结果）：README 不归档，演示图随之不收。同仓库的图库收在 [Gallery](../../../gallery/images/index.md)

## 未来漂移处置

只由人来做，AI 不要执行（见页首警示）。

1. `curl` 或 `git clone --depth 1` 拿新 commit，对比 `skills/get-prompt-from-image/`
2. 有变化就覆盖 `index.md` 和 `references/`，更新本页 commit、日期和永链
