---
description: "初始化项目 + 盘问式协作 + 对话提示词 + 图片提示词反推"
---

# 和 AI 协作

跟 AI 协作时沉淀的通用做法，每个是一个独立 skill：

- [初始化项目（init-project）](init-project.md) —— 新项目初始化时用：让 AI 把四条编码守则写进项目根的 `CLAUDE.md` 或 `AGENTS.md`，之后每次会话都生效（吸纳自 multica-ai/andrej-karpathy-skills，MIT，中译；[维护记录](../../maintenance/skills/init-project.md)）
- [盘问我（grilling）](grilling.md) —— 给方案、决定或想法做压力测试时用，说 grill（盘问）类触发词也算：AI 按设计树一轮一轮编号提问、每题附推荐答案，事实自己查、决策等用户答，达成一致前不动手（吸纳自 mattpocock/skills，中译；[维护记录](../../maintenance/skills/grilling.md)）
- [带文档盘问（grill-with-docs）](grill-with-docs/index.md) —— 想把方案或设计盘问清楚、同时留下文档时用：按盘问我一轮轮拷问，边问边把术语写进 `GLOSSARY.md`、把难以回退的决策写成 ADR；依赖的[领域建模](grill-with-docs/domain-modeling/index.md)聊术语、写 ADR 时也能单独用（吸纳自 mattpocock/skills，中译；[维护记录](../../maintenance/skills/grill-with-docs.md)）
- [对话提示词](chat-prompts/index.md) —— 按场景挑一段对话 prompt 照做：理清问题、查证研究、学概念、写作与方案、职业与人生五类共 18 个，每个是独立的 skill，整页能直接粘进对话框（17 个取自 prompt-cards.cyanfish.site，去掉卡牌包装重组；说人话取自小红书 Krypto说AI 的《让AI说人话》；[维护记录](../../maintenance/skills/chat-prompts.md)）
- [图片提示词反推](image-prompt-reverse/index.md) —— 从参考图反推生图 prompt：简化版[七维拆解](image-prompt-reverse/seven-dimensions/index.md)，人弄懂拆法、自己跟看图模型分两轮问（整理自 linux.do 帖子；[维护记录](../../maintenance/skills/seven-dimensions.md)）；完整版[从图反推 prompt](image-prompt-reverse/get-prompt-from-image/index.md)，AI 直接产出中英正向 prompt 和负向词（吸纳自 wuyoscar/GPT-Image2-Skill，原作者 LunarXuan，MIT，中译；[维护记录](../../maintenance/skills/get-prompt-from-image.md)）
