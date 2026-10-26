---
description: "初始化项目（init-project）的维护记录：吸纳自 multica-ai/andrej-karpathy-skills，钉在 2c60614，中译后改成让 AI 写进 CLAUDE.md / AGENTS.md 的形态"
---

# 初始化项目（init-project）

[初始化项目](../../skills/init-project.md)的维护记录。

- **上游**：multica-ai/andrej-karpathy-skills 的 `skills/karpathy-guidelines/SKILL.md`[^upstream]，作者 Jiayuan Zhang（forrestchang，原仓库 `forrestchang/andrej-karpathy-skills` 已转到 multica-ai），MIT —— 仓库里没有 LICENSE 文件，许可证只写在 SKILL.md 的 frontmatter、`plugin.json` 和 README 里。四条原则是作者据 Karpathy 对 LLM 编码陷阱的观察[^karpathy]归纳的
- **commit**：钉在 `2c60614`（2026-04-20），2026-10-16 读时仍是最新
- **跳过**：插件只有这一个 skill，没有 hooks、agents、commands、mod、MCP。仓库里其余文件都跳过：
    - `CLAUDE.md`、`.cursor/rules/karpathy-guidelines.mdc` —— 同一份四条原则换个装法。`CLAUDE.md` 和 SKILL.md 的差别只有开头一句把出处换成「按需与项目指令合并」，文末多一段「起作用的标志」（diff 里不必要的改动更少、因过度复杂的重写更少、澄清问题出现在动手之前）
    - `EXAMPLES.md` —— 每条原则配两三个正反例，522 行，SKILL.md 没链它
    - `README.md`、`README.zh.md`、`CURSOR.md`、`.claude-plugin/` —— 安装说明和插件市场清单
- **翻译之外的改动**：
    - 目录名、`name` 和一级标题改成 `init-project`、「初始化项目」，上游是 `karpathy-guidelines`、Karpathy Guidelines
    - 入口页改成命令 AI 的口吻：开头三步指令，让客户端把守则写进 `CLAUDE.md` 或 `AGENTS.md`；守则整段包进一个 markdown 代码块当写入内容（外层围栏用四个反引号，里面还套着一个代码块），外面加「## 编码守则」，原来的二级标题降成三级
    - 删掉开头「减少 LLM 常见编码错误的行为守则，出自……」一句，出处挪到本页「上游」一条
    - `description` 不再照译上游，改成写什么时候用、做什么
    - 列表和代码块前补了空行；页尾加维护记录的链接

[^upstream]: [SKILL.md @ 2c60614](https://github.com/multica-ai/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/skills/karpathy-guidelines/SKILL.md)，2026-10-16 读。
[^karpathy]: [Karpathy 的推文](https://x.com/karpathy/status/2015883857489522876)，转引自上游 SKILL.md 开头，没有直接读过。
