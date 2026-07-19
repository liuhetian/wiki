# 和 AI 协作

跟 AI 协作时沉淀的通用做法，每个是一个独立 skill：

- [CLAUDE.md 初始化模板](claude-md-template/index.md) —— 新项目直接抄进 `CLAUDE.md` 的协作约束，吸收自 Karpathy 四条原则 + 自己踩的三个坑
- [盘问我（grilling）](grilling/index.md) —— 动手前让 AI 一次一个问题地拷问方案：事实自己查代码库、决策一条条抛给我、达成共识前不许执行（吸收自 [mattpocock/skills](https://github.com/mattpocock/skills)；页面即英文真身，来源钉链见 [MIRROR](grilling/MIRROR.md)）
- [带文档盘问（grill-with-docs）](grill-with-docs/index.md) —— 盘问我的变体，边问边落盘：术语进 `CONTEXT.md`、难以回退的决策记 ADR；真身只有一行触发器，行为定义在依赖的 [domain-modeling](grill-with-docs/domain-modeling/SKILL.md)（已一并归档，来源见 [MIRROR](grill-with-docs/MIRROR.md)）
