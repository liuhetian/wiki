---
description: "带文档盘问（grill-with-docs）的维护记录：吸纳自 mattpocock/skills，连同依赖的 domain-modeling 一起中译，钉在 49dd158"
---

# 带文档盘问（grill-with-docs）

[带文档盘问](../../skills/collab/grill-with-docs/index.md)和它依赖的[领域建模](../../skills/collab/grill-with-docs/domain-modeling/index.md)的维护记录。另一个依赖 grilling 单独收成了盘问我，见[它的维护记录](grilling.md)。

- **上游**：mattpocock/skills 的 `skills/engineering/grill-with-docs/`[^gwd] 和 `skills/engineering/domain-modeling/`[^dm]，作者 Matt Pocock，MIT
- **commit**：钉在 `49dd158`（2026-10-09），2026-10-16 读时仍是最新
- **跳过**：两个目录各一份 `agents/openai.yaml` —— Codex 的界面元数据（显示名、一句话简介、禁止隐式调用），不是 Claude Code 插件里的 agent；禁止隐式调用这一条，frontmatter 里的 `disable-model-invocation: true` 已经表达了
- **翻译之外的改动**：
    - domain-modeling 放进 grill-with-docs 目录当子 skill；`ADR-FORMAT.md`、`GLOSSARY-FORMAT.md` 挪进 `reference/`，改名 `adr-format.md`、`glossary-format.md`
    - 入口页上游只有「调用 Skill 工具两次：grilling 和 domain-modeling」一句，改成链到两份 skill 的两步指令，各写一句管什么；上游 `description` 译成开头一句
    - 领域建模「文件结构」一节末尾加一段：第一次建 `GLOSSARY.md` 或 `docs/adr/` 时，往 `CLAUDE.md` / `AGENTS.md` 追加一行指针 —— 上游认为读术语表是顺手的事，不交代的话下次会话没人去读
    - 两份格式模板里的示例译成中文，术语后括号留英文原词；ADR 可选节的名字和 `Status` 取值保留英文
    - 两个 skill 的 `name` 改成中文名，`description` 改成写什么时候用、做什么；补一级标题；入口页页尾加维护记录的链接

[^gwd]: [grill-with-docs @ 49dd158](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336/skills/engineering/grill-with-docs)，2026-10-16 读。
[^dm]: [domain-modeling @ 49dd158](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336/skills/engineering/domain-modeling)，2026-10-16 读。
