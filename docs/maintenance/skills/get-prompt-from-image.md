---
description: "从图反推 prompt（get-prompt-from-image）的维护记录：吸纳自 wuyoscar/GPT-Image2-Skill，原作者 LunarXuan，钉在 05cb113，全文中译"
---

# 从图反推 prompt（get-prompt-from-image）

[从图反推 prompt](../../skills/image-prompt-reverse/get-prompt-from-image/index.md)的维护记录，它是[图片提示词反推](../../skills/image-prompt-reverse/index.md)的完整版。

- **上游**：wuyoscar/GPT-Image2-Skill 的 `skills/get-prompt-from-image/`[^upstream]，作者 Wuyoscar，MIT，许可证原文不随附。原作者是 LunarXuan：最早是 LunarXuan/image-prompt-reverse[^origin]，2026-09-02 首发，原名 `image-prompt-reverse`，正文是中文；2026-09-04 贡献给 wuyoscar，改名 `get-prompt-from-image`，reference 译成英文，wuyoscar 的 README 写了致谢。原仓库后来加了 GPL-3.0，本地只用 wuyoscar 转收的 MIT 版，没拷原仓库的文件
- **commit**：钉在 `05cb113`，2026-09-28 抓取；原仓库核对到 `4dead0a`（2026-09-06），两边结构、流程、输出格式和三份 reference 的章节一一对应
- **跳过**：`agents/openai.yaml`（Codex 那一侧的清单，不是行为定义）；上游 README 里这个 skill 的演示图，同仓库的图库收在 [Gallery](../../gallery/images/index.md)
- **翻译之外的改动**：
    - 全文是从英文回译的中文，原作者本来用中文写，措辞和原文有出入，但规则一条不少；指令的强度词（must / never / do not）译成同等强度
    - `SKILL.md` 改名 `index.md`，三份 reference 按原相对路径放在 `references/`
    - `name` 改成中文名，`description` 改成写什么时候用、做什么
    - 和整理自 linux.do 的七维拆解一起收进「图片提示词反推」，当完整版；两版内容不互相改
    - 页尾加维护记录的链接

[^upstream]: [get-prompt-from-image @ 05cb113](https://github.com/wuyoscar/GPT-Image2-Skill/tree/05cb1130bba29e0fc028220376280a2e934a8041/skills/get-prompt-from-image)，2026-09-28 读。
[^origin]: [LunarXuan/image-prompt-reverse @ 4dead0a](https://github.com/LunarXuan/image-prompt-reverse/tree/4dead0a32e2312e56a14ebf3658ee75c9b865055)，读取日期没记，晚于 2026-09-06。
