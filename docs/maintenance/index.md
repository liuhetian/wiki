---
description: "维护板块：skill 和 Agent 能力背后的事，分两部分：Agent 基础能力背后的选型实测、上游来源和没做的事，一个能力一篇；外部 skill 的吸纳记录，一个 skill 一篇；实测流水线用的示例 skill。AI 正常使用不用看，出问题或要改做法时再看"
---

# 维护

能力页和 skill 页只写怎么用。为什么这样选、从哪来、改过什么、实测过什么、还有什么没做，都放在这里。AI 正常使用时不用看，出问题或者要改做法时再看。

## Agent 能力 { #agent-io }

[Agent 基础能力](../skills/agent-io/index.md)的维护记录，一个能力一篇。

- [读 PDF 脚本](pdf-reading.md) —— pdfium 和 pdf-inspector 的实测对比，吸收的两个 DSH 社区插件
- [网络搜索](web-search.md) —— 默认的 Sonar Pro Search 经海外中转实测耗时、价格和引用格式；备选 DeepSeek 原生搜索的做法取自 DSH 的搜索插件
- [语音合成](tts.md) —— AutoDL 上 IndexTTS2 的接口是怎么找到的，冷启动和 data URI 参考音频的实测；方案二为什么从 Gemini 换成微软 MAI-Voice：9 个直接出 mp3 的模型同文对比，Gemini 只出 pcm 的坑；OpenRouter 上能克隆的 Fish Audio、Seed Audio 实测
- [图片生成](image.md) —— CodeProxy 的 gpt-image-2.5 经海外中转实测生成和编辑，返回格式和模型列表
- [音频转录](transcribe.md) —— OpenRouter 的 MAI-Transcribe-2 经海外中转实测两种传法、时间戳和说话人分离，段落起止要开 diarization 才准
- [视频生成](video.md) —— AutoDL 工作流列表怎么找到、价格怎么换算，16 个视频工作流只收 8 个的理由，实测一次文字加图生成视频
- [音乐生成](music.md) —— 为什么选 OpenRouter 上的 Lyria 3、不选 Suno，请求格式从哪两份文档推出来，没实测
- [解析分享链接](share-link.md) —— 下载狗经国内中转实测 B 站视频、小红书视频和图文，走不走中转解析和下载一样快
- [结构化判断](jev.md) —— OpenRouter 的 Jev 1.13 的请求格式从哪查来，经海外中转实测两个端点、三种题，含糊材料概率落在中间；2026-10-10 照调研接入微软、OpenAI、Mercury 三家，调研原文存档，四家同题实测：单价一样计费 token 差 3.5 倍，图片只有 OpenAI 和 Mercury 看得了

## Skill 吸纳 { #skills }

从别人那里吸纳来的 skill，一个 skill 一篇：上游、commit、跳过了什么、翻译之外的改动。写法见 [收纳 skill](../skills/wiki-guide/skill.md#maintenance-record)。

- [盘问我（grilling）](skills/grilling.md) —— 吸纳自 mattpocock/skills，钉在 95249b0，正文逐段中译
- [带文档盘问（grill-with-docs）](skills/grill-with-docs.md) —— 吸纳自 mattpocock/skills，钉在 49dd158，连同依赖的 domain-modeling 一起中译；domain-modeling 放进目录当子 skill，加了往 `CLAUDE.md` / `AGENTS.md` 留指针的一步
- [初始化项目（init-project）](skills/init-project.md) —— 吸纳自 multica-ai/andrej-karpathy-skills，钉在 2c60614，中译后改成让 AI 写进 `CLAUDE.md` / `AGENTS.md` 的形态；EXAMPLES.md 等其余文件跳过
- [从图反推 prompt（get-prompt-from-image）](skills/get-prompt-from-image.md) —— 吸纳自 wuyoscar/GPT-Image2-Skill，原作者 LunarXuan，钉在 05cb113，全文中译；图片提示词反推的完整版
- [七维拆解](skills/seven-dimensions.md) —— 整理自 linux.do 帖子《图片提示词反推》，原文和配图存档在 skill 目录的 `assets/`；图片提示词反推的简化版
- [B站视频笔记（bili-note）](skills/bili-note.md) —— 吸纳自 Rimagination/bili-note，钉在 08fe812；下载视频换成 agent-io 的下载狗，转写换成 MAI-Transcribe-2，网页 AI 字幕和本地 ASR 整条删掉
- [对话提示词（chat-prompts）](skills/chat-prompts.md) —— 取自 prompt-cards.cyanfish.site 的 17 段对话 prompt，钉在 JS 包 index-IivKxZ0S.js；去掉卡牌包装按场景重组，修补了架构先知和深度天赋挖掘机各一处

## 实测用的示例 { #fixtures }

验证流水线时搭的 mock skill，不解决实际问题。

- [测试skill](mock-bundle/index.md) —— mock 抽象 skill，演示带脚本的 skill 怎么远程用、怎么整包用：两个子 skill 各带一个 foo.py、互相引用，其中一个脚本跨目录 import 另一个；改打包流水线或写带脚本的 skill 时拿来对照
