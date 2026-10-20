---
description: "DeepSeek 视频问答粗讲：给 agent 挂的 skill，模型不收视频，就把录像拆成带时间标签的帧逐帧做卡片、拼成 30 秒一段；提问时 TF-IDF 粗筛、模型挑段、开推理深读，答案带时刻，准不准由人回放片段核对"
---

# DeepSeek 视频问答：把录像拆成带时间标签的帧

它是给 agent 挂的 skill，让人不看录像也能问「某事发生在第几秒」[^repo]。视觉模型 deepseek-v4-flash-vision-exp 不收视频、GIF 只读首帧，它就把视频拆成按时间排的 JPEG，只看画面不听声音。

视频先 ingest 一次：ffmpeg 抽帧，一分钟内 1fps，越长越稀；25 帧一批发给模型，每帧前插一行 `[t=12.0s]` 文本标签，模型每帧回一张卡片，时刻改回标签值。卡片本地拼成 30 秒一段。提问先用 TF-IDF 在段卡片里粗筛 10 段，模型看每段中间帧挑 3 段，再开推理深读这 3 段的帧，答案带 `[MM:SS]`。

抽帧、打标签、检索、切片段归脚本，模型只写卡片、挑段、作答；问题带「瞄准」「击杀」这类词才加一次 12fps 中心放大。agent 把 HTML 预览交给人，1fps 时刻差约两秒，由人回放片段核对。

代码多在预览和放大，要紧的却是时间轴：模型爱把时刻写成区间，解析时单点、区间都认，才切得出片段。

[^repo]: [liangdabiao/deepseek-v4-flash-vision-video-rag](https://github.com/liangdabiao/deepseek-v4-flash-vision-video-rag/tree/09b42bf5fada8c109e956d404c766a2609b51c52)，读的是 commit `09b42bf`，2026-10-20 读。
