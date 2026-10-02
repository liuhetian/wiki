---
description: "搭建 AI 助手的维护目录：Agent 基础能力背后的选型实测、上游来源和没做的事，一个能力一篇；AI 正常使用不用看，能力出问题或要改做法时再看"
---

# 维护目录

[Agent 基础能力](../../../skills/agent-io/index.md)的每个能力页只写怎么用。为什么这样选、做法从哪来、实测过什么、还有什么没做，都放在这里，一个能力一篇。AI 正常使用时不用看，能力出问题或者要改做法时再看。

- [读 PDF 脚本](pdf-reading.md) —— pdfium 和 pdf-inspector 的实测对比，吸收的两个 DSH 社区插件
- [网络搜索](web-search.md) —— 默认的 Sonar Pro Search 经海外中转实测耗时、价格和引用格式；备选 DeepSeek 原生搜索的做法取自 DSH 的搜索插件
- [语音合成](tts.md) —— AutoDL 上 IndexTTS2 的接口是怎么找到的，冷启动和 data URI 参考音频的实测
- [图片生成](image.md) —— CodeProxy 的 gpt-image-2.5 经海外中转实测生成和编辑，返回格式和模型列表
- [音频转录](transcribe.md) —— OpenRouter 的 MAI-Transcribe-2 经海外中转实测两种传法、时间戳和说话人分离，段落起止要开 diarization 才准
- [视频生成](video.md) —— AutoDL 工作流列表怎么找到、价格怎么换算，16 个视频工作流只收 8 个的理由，实测一次文字加图生成视频
- [音乐生成](music.md) —— 为什么选 OpenRouter 上的 Lyria 3、不选 Suno，请求格式从哪两份文档推出来，没实测
- [结构化判断](jev.md) —— OpenRouter 的 Jev 1.13 的请求格式从哪查来，经海外中转实测两个端点、三种题，含糊材料概率落在中间
