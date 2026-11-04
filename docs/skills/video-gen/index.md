---
description: "用生图、生视频模型做 AI 视频时用：按题材和环节挑子 skill；已收东方仙侠视觉导演，给仙侠场景写生图提示词；小说转漫剧，把网文小说一步步做成竖屏漫剧或推文视频"
---

# 视频生成

用生图、生视频模型做 AI 视频的 skill 放在这里，一个题材或一个环节一个子 skill。AI 视频一般先定画面 —— 关键帧、场景设定图 —— 再让视频模型从画面动起来。子 skill 只管提示词怎么写，真的出图、出视频走 Agent 基础能力的[生成编辑图片](../agent-io/reference/image.md)和[生成视频](../agent-io/reference/video/index.md)。

- [东方仙侠视觉导演](xianxia-visual-director/index.md) —— 给东方仙侠场景写单张画面或视频关键帧的生图提示词时用：把一句构想、已有提示词或参考扩成参数锁定、导演方案、正负提示词和三个衍生方向，也做衍生、优化、诊断和变体；所有画面守同一套仙界总则，六种画幅，默认 16:9（吸纳自 liyue-aigc/xianxia-visual-director）
- [小说转漫剧](novel-to-comic-drama/index.md) —— 要把网文小说做成竖屏 AI 漫剧或推文视频时用：爆款开头、二创改写、角色提取、分镜、画面提示词、视频提示词，一步一段 prompt，按题材挑版本；分句、按时长切镜、拼下一步的输入和格式校验交给脚本，不调模型（整理自 linux.do 鸭老师分享的提示词包）

用代码渲染视频不归这里，代码手绘动画用 [anidoodle 代码手绘](../anidoodle/index.md)。
