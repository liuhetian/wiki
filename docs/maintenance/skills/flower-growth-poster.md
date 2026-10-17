---
description: "花卉动态生长海报的维护记录：整理自抖音「小洁AI实战」的设计教程；即梦平台存技能的操作和 Seedream、Seedance 的型号跳过，模型换成 agent-io 的 gpt-image-2.5 和 MiniMax H3 首尾帧；prompt 照画面关键词自己写，首帧改成截海报纸纹，补了接成循环一步"
---

# 花卉动态生长海报（flower-growth-poster）

[花卉动态生长海报](../../skills/video-production/flower-growth-poster/index.md)的维护记录。

- **上游**：抖音「小洁AI实战」的 46 秒设计教程[^src]，读后的笔记是[花卉动态生长海报](../../posts/video-notes/flower-growth-poster.md)
- **commit**：不是仓库。视频 2026-10-15 发布，2026-10-17 读，同一天照做了一遍
- **跳过**：
    - 在即梦的 Agent 对话里把效果存成平台技能、再从技能菜单调用：我们不用这个平台，两段固定的 prompt 就是对应的东西
    - Seedream 5.0 Pro、Seedance 2.0 的型号，720P 和积分
- **翻译之外的改动**：
    - 生图换成 gpt-image-2.5，视频换成 MiniMax H3 首尾帧，都走 agent-io
    - 原视频只露出关键词：插画风、几何感花瓣、颗粒纸或丝网印刷肌理、渐变；花居中、左上竖排大标题、两侧中英小字、大面积留白。三段 prompt 是照这些自己写的，花名、颜色和海报文字改成填空
    - 原视频的首帧是空白纸，没说怎么来的。试过让模型把海报上的花和字去掉，纸色和颗粒对不上，改成截海报自己的纸纹平铺；顺带用同一块纸纹把 3:4 补成工作流输出的 4:7
    - 加了第 ⑤ 步：接成循环，交付 mp4 不交 GIF
    - 没有照片时先生成一张随手拍

[^src]: [抖音原视频](https://v.douyin.com/OsZWytyP7J8/)，2026-10-17 读。
