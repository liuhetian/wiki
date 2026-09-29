---
description: "CLAUDE.md 模板 + 盘问式协作 + 两个图片提示词反推 skill"
---

# 和 AI 协作

跟 AI 协作时沉淀的通用做法，每个是一个独立 skill：

- [CLAUDE.md 初始化模板](claude-md-template/index.md) —— 新项目直接抄进 `CLAUDE.md` 的协作约束，吸收自 Karpathy 四条原则 + 自己踩的三个坑
- [盘问我（grilling）](grilling/index.md) —— 动手前让 AI 一次一个问题地拷问方案：事实自己查代码库、决策一条条抛给我、达成共识前不许执行（吸收自 [mattpocock/skills](https://github.com/mattpocock/skills)；页面即英文真身，来源钉链见 [MIRROR](grilling/MIRROR.md)）
- [带文档盘问（grill-with-docs）](grill-with-docs/index.md) —— 盘问我的变体，边问边落盘：术语进 `CONTEXT.md`、难以回退的决策记 ADR；真身只有一行触发器，行为定义在依赖的 [domain-modeling](grill-with-docs/domain-modeling/SKILL.md)（已一并归档，来源见 [MIRROR](grill-with-docs/MIRROR.md)）
- [提示词卡牌（对话类）](prompt-cards/index.md) —— 17 张直接粘贴就能用的对话 prompt：角色、流程、约束三类，按场景挑卡；附流程卡共同骨架「先拆、再问、最后才答」，以及和盘问我、CLAUDE.md 模板的对照（照录自 [prompt-cards.cyanfish.site](https://prompt-cards.cyanfish.site/)，来源见 [MIRROR](prompt-cards/MIRROR.md)）
- [图片提示词反推](analysis_image/index.md) —— 把参考图按主体、风格、配色、光线、构图、质感、氛围七维拆开再重组成 prompt，按图类换观察重点，生成后一次只改一个变量（整理自 linux.do 帖子，原文与配图存档见 [MIRROR](analysis_image/assets/linux-do-2729491/MIRROR.md)）
- [从图反推 prompt（get-prompt-from-image）](get-prompt-from-image/index.md) —— 另一个反推 skill（中译，原作者 LunarXuan）：按通用框架、题材与媒介、插画风格三份 reference 逐项分析参考图，输出高保真的生图 prompt；页面是上游 SKILL.md 的中译（吸收自 [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill)，MIT；来源钉链见 [MIRROR](get-prompt-from-image/MIRROR.md)，内容已全部迁入本站，AI 不要去读上游仓库）
