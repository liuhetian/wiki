---
description: "语音合成的维护记录：AutoDL.Art 上 IndexTTS2 工作流的接口、参数与计费字段从哪查到，2026-10-02 经中转实测冷启动、data URI 参考音频和结果链接有效期；用接口不用看，出问题再看"
---

# 语音合成的维护记录：AutoDL 上的 IndexTTS2

这是[生成特定音色语音](../../../skills/agent-io/reference/tts.md)背后的维护记录。用接口时不用看，接口出问题或者要换工作流时再看。

## 接口从哪来 { #upstream }

- 工作流页面：[autodl.art/large-model/comfyui/indextts2-v1](https://www.autodl.art/large-model/comfyui/indextts2-v1)。页面是单页应用，curl 拿不到正文，接口是从前端 JS 和下面这个元数据接口里找到的。
- 元数据接口：`GET /api/v1/comfyui/workflows/indextts2-v1`，不用鉴权。里面有参数定义 `input_rules`、两个端点 `endpoint_info`、计费 `billing_config`、示例输入输出，以及官方文档地址 [`/docs/comfyui_api/`](https://autodl.art/docs/comfyui_api/)。
- 鉴权：令牌要在「令牌管理」里建，分组选 ComfyUI。官方的 `Authorization` 头里直接放令牌本身，不带 `Bearer`。中转把它包了一层：Agent 发 `Bearer <网关 token>`，中转换成真实令牌再转发。

`input_rules` 里值得记的几点（2026-10-01 抓取）：

- 必填三项：`prompt_text`（1–2048 字）、`prompt_simple`（音色参考，`audio/mpeg` 或 `audio/wav`）、`emo_control_method`。
- `emo_control_method` 有三个选项：「与音色参考音频相同」「使用情感参考音频」（配合 `emo_ref_audio`）、「使用情感向量控制」（配合 `emo_happy`、`emo_calm` 等，取值 0–1.4）。
- `emo_surprised` 被定义成只有 `"0"` 这一个选项的枚举，所以「惊讶」这个情绪没法调。
- 计费：`price_type` 是 `audio_sec_cost`，按生成音频的秒数计费；`billing_config` 里写的是 `price 1`、`minimum_price 10`。数字除以 1000 是元，也就是每秒 0.001 元、最低 0.01 元，换算是后来查[视频生成](video.md#pricing)时从前端代码里看到的。
- 页面上的示例输出写的是 `"status": "completed"`，那是 2026-04 的旧样例。实际返回的是 `SUCCESS`，和官方文档一致。

## 实测 { #tests }

2026-10-02 经中转实测四次：

| 参考音频 | 排队 | 运行 | 结果 |
|---|---|---|---|
| 页面示例里的 soundhelix MP3 URL（6 分钟纯音乐） | 12 分 24 秒 | 1 秒 | `FAILED`，`msg` 列了显存不足、模型加载失败、资源链接失效三种可能 |
| 8 秒人声 wav，用 data URI 传（从 Wikimedia Commons 上孙中山演讲录音里截的） | 1 秒 | 7 秒 | `SUCCESS`，得到 4.5 秒 22050 Hz 的 wav |
| 大米 14 秒 wav（48 kHz 立体声，2.7 MB），用 data URI 传，请求体 3.5 MB | 5 秒 | 18 秒 | `SUCCESS`，得到 10 秒的 wav |
| 同一个文件部署到 COS 后，填 URL（中文文件名按百分号编码） | 1 秒 | 15 秒 | `SUCCESS`，得到 11 秒的 wav |

- 第一次失败的原因没分开：可能是冷启动，也可能是纯音乐或者那个 URL 本身有问题。用 URL 传参考音频本身没问题，COS 上的大米音频就能用。抓取那天这个工作流 `usage_count_7d` 是 0，没什么人用，冷启动的可能性大。
- 大米音频放在 `skills/agent-io/assets/` 下，跟着部署上 COS，返回的 `Content-Type` 是 `audio/x-wav`。用 URL 就不用每次传 3.5 MB 的请求体。
- 结果链接在火山引擎 TOS 上（`cg-comfyui-prod.tos-cn-beijing.volces.com`），是带签名的 URL，`X-Tos-Expires=86400`，也就是 24 小时有效。
- 中转：带 `Bearer` 返回 200；不带 `Bearer`、直接放令牌返回 401，被中转拦下。元数据接口走中转也能用。

## 没做的 { #not-done }

- 情绪控制的两种方式（情感参考音频、情感向量）都没测。
- 没对过账单。
- 没和别的 TTS 比过。AutoDL 的 ComfyUI 工作流里只有这一个是语音的（2026-10-02 查）。
