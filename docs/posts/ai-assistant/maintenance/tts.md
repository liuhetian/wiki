---
description: "语音合成的维护记录：方案一 AutoDL 上 IndexTTS2 的接口、参数与计费字段从哪查到，2026-10-02 实测冷启动、data URI 参考音频和结果链接有效期；方案二为什么是微软 MAI-Voice-2.1-Flash 的 Mei，2026-10-08 九家直接出 mp3 的模型同文对比，speed 生效、instructions 不生效；试过又换掉的 Gemini 3.8 Flash Lite TTS 只出 pcm；OpenRouter 上能克隆的 Fish Audio、Seed Audio 实测；用接口不用看，出问题再看"
---

# 语音合成的维护记录：IndexTTS2 和 MAI-Voice

这是[生成语音](../../../skills/agent-io/reference/tts.md)背后的维护记录。用接口时不用看，接口出问题或者要换方案时再看。前三节是方案一 IndexTTS2，后面依次是[方案二 MAI-Voice](#mai-voice)、[试过又换掉的 Gemini](#gemini) 和[克隆的备选](#clone-alternatives)。

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

2026-10-02 经中转实测四次，2026-10-08 又跑了一次：

| 参考音频 | 排队 | 运行 | 结果 |
|---|---|---|---|
| 页面示例里的 soundhelix MP3 URL（6 分钟纯音乐） | 12 分 24 秒 | 1 秒 | `FAILED`，`msg` 列了显存不足、模型加载失败、资源链接失效三种可能 |
| 8 秒人声 wav，用 data URI 传（从 Wikimedia Commons 上孙中山演讲录音里截的） | 1 秒 | 7 秒 | `SUCCESS`，得到 4.5 秒 22050 Hz 的 wav |
| 大米 14 秒 wav（48 kHz 立体声，2.7 MB），用 data URI 传，请求体 3.5 MB | 5 秒 | 18 秒 | `SUCCESS`，得到 10 秒的 wav |
| 同一个文件部署到 COS 后，填 URL（中文文件名按百分号编码） | 1 秒 | 15 秒 | `SUCCESS`，得到 11 秒的 wav |
| 2026-10-08，大米 COS URL，54 字 | 7 秒 | 41 秒 | `SUCCESS`，得到 15 秒的 wav；用 MAI-Transcribe-2 转回文字，字都对，句末问号转成了句号 |

- 第一次失败的原因没分开：可能是冷启动，也可能是纯音乐或者那个 URL 本身有问题。用 URL 传参考音频本身没问题，COS 上的大米音频就能用。抓取那天这个工作流 `usage_count_7d` 是 0，没什么人用，冷启动的可能性大。
- 大米音频放在 `skills/agent-io/assets/` 下，跟着部署上 COS，返回的 `Content-Type` 是 `audio/x-wav`。用 URL 就不用每次传 3.5 MB 的请求体。
- 结果链接在火山引擎 TOS 上（`cg-comfyui-prod.tos-cn-beijing.volces.com`），是带签名的 URL，`X-Tos-Expires=86400`，也就是 24 小时有效。
- 中转：带 `Bearer` 返回 200；不带 `Bearer`、直接放令牌返回 401，被中转拦下。元数据接口走中转也能用。

## 没做的 { #not-done }

- 情绪控制的两种方式（情感参考音频、情感向量）都没测。
- 没对过账单。
- AutoDL 的 ComfyUI 工作流里只有这一个是语音的（2026-10-02 查）。2026-10-08 拿同一段参考音频跑过 OpenRouter 上的两个克隆模型，见[克隆的备选](#clone-alternatives)，像不像原声还没比。

## 方案二：微软 MAI-Voice-2.1-Flash { #mai-voice }

用户说不用自己的音色时的方案，2026-10-08 接入，音色 `zh-CN-Mei:MAI-Voice-2.1-Flash`。

### 为什么选它

- 同一天先接的是 [Gemini 的 Kore](#gemini)，但 Gemini 经 OpenRouter 只出 pcm，Agent 得自己补文件头才能播——用户不想让 Agent 做任何转换，要直接拿到 mp3 或 wav。
- 于是把 OpenRouter 上能直接出 mp3、有中文的 9 个模型，用同一段 168 字的晚间播报各生成一份，用户听完选了 MAI-Voice-2.1-Flash 的 Mei。
- 走现成的 OpenRouter 海外中转，中转配置不用动。

9 个模型的对比（`response_format: "mp3"`，都没带风格指令；每分钟花费按字数单价 × 168 字 ÷ 音频时长算）：

| 模型 / 音色 | 出结果 | 音频 | 每分钟 | 备注 |
|---|---|---|---|---|
| **`microsoft/mai-voice-2.1-flash` / zh-CN-Mei（选中）** | 6 秒 | 42.9 秒 | 0.0035 美元 | 最便宜，语速偏慢 |
| `microsoft/mai-voice-2.1` / zh-CN-Mei | 9 秒 | 37.4 秒 | 0.0059 美元 | 账单 0.003696 美元 = 168 字 × 每百万字 22 美元，按字计费对得上 |
| `qwen/qwen-audio-3.0-tts-flash` / longanhuan_v3.6 | 6 秒 | 33.3 秒 | 0.0045 美元 | 每个模型只开放 2 个音色 |
| `qwen/qwen-audio-3.0-tts-plus` / longanlingxin | 8 秒 | 32.8 秒 | 0.0061 美元 | 同上 |
| `minimax/speech-2.8-turbo` / `Chinese (Mandarin)_Radio_Host` | 5 秒 | 30.9 秒 | 0.0196 美元 | 列表里只有英文音色，但收任意 MiniMax 音色 ID |
| `minimax/speech-2.8-hd` / 同上 | 5 秒 | 31.4 秒 | 0.0321 美元 | 最贵 |
| `elevenlabs/eleven-v3` / alice | 15 秒 | 36.5 秒 | 0.011 美元 | 最慢 |
| `x-ai/grok-voice-tts-1.0` / eve | 8 秒 | 35.7 秒 | 0.0042 美元 | 只有 5 个音色 |
| `fish-audio/s2.1-pro` / 默认音色 | 10 秒 | 29.7 秒 | 0.0051 美元 | 同一个模型也能克隆 |

- 9 段用 MAI-Transcribe-2 转回文字都和原文一致，差别只在标点和同音的「小结 / 小节」——准确度分不出高下，选型全凭听感。
- OpenRouter 上 TTS 的 `instructions` 只有 OpenAI 和 Gemini 认，所以这 9 段都是照原文读，没调语气。

### 接口从哪来

- 用法和 Gemini 一样是 [OpenRouter TTS 文档](https://openrouter.ai/docs/guides/overview/multimodal/tts)的 `POST /api/v1/audio/speech`；模型页 [openrouter.ai/microsoft/mai-voice-2.1-flash](https://openrouter.ai/microsoft/mai-voice-2.1-flash) 只写了 `model`、`input`、`voice`、`response_format` 四个字段。
- 模型元数据：`supported_voices` 有 97 个，按 `<语言>-<名字>:MAI-Voice-2.1-Flash` 命名，中文 6 个（Bo、Grant、Harper、Lan、Mei、Wei）；描述写的是 23 种语言。`/endpoints` 显示上游是 Azure，`context_length` 是 0，也就是没标长度上限，`supports_voice_cloning` 是 false。
- 价格：每百万字 15 美元，只按输入字数收。

### 实测 { #mai-tests }

2026-10-08 经海外中转：

- 168 字播报：200，`audio/mpeg`，160 kbps、24 kHz 单声道的 mp3，42.9 秒音频，耗时 6 秒，转录逐字一致。
- 同一句 33 字（「今天的天气有点反复……出门记得带伞。」），Mei，mp3，看参数对时长有没有影响：

| 参数 | 音频时长 |
|---|---|
| 不加 | 9.1 秒、7.3 秒、7.1 秒 |
| `"speed": 1.3` | 5.7 秒、6.2 秒 |
| `instructions`「非常兴奋、语速很快」 | 8.3 秒、8.0 秒 |
| `instructions`「非常难过、语速很慢」 | 8.9 秒 |

- 同一个请求时长能差 2 秒。`speed` 1.3 两次都最短，生效；`instructions` 落在不加参数的波动范围里，「很快」也没变快，和文档说的只有 OpenAI、Gemini 认一致。

### 没做的

- 另外 5 个中文音色没听。
- 一次能读多长没测。
- 几段 mp3 直接 `cat` 拼起来能不能正常播，没测。

## 试过又换掉的：Gemini 3.8 Flash Lite TTS { #gemini }

2026-10-08 先当方案二接入，音色 Kore，同一天换成了 [MAI-Voice](#mai-voice)——经 OpenRouter 只能拿到 pcm，Agent 得自己补文件头。下面的记录留着，以后要 Kore、语气控制或者多人对话时再看。

### 当初为什么选它

- 走现成的 OpenRouter 海外中转，中转配置不用动——`/api/v1/audio/speech` 原样转发就能用。
- Google 2026-09-23 发布，101 种语言，列了简体中文、繁体中文和粤语，见 [Google 模型文档](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-lite-tts)。Google 公布的盲测语言里没有中文，中文好不好只能靠自己听。
- 价格：输入每百万 token 0.5 美元，输出（音频）每百万 token 6 美元；音频每秒 25 token，折合**每分钟约 0.009 美元**。[Google 价格页](https://ai.google.dev/gemini-api/docs/pricing)写明这是 2026-12-31 前的价格，2027-01-01 起输入输出都翻倍。OpenRouter 标价和 Google 一样。
- 同系列的 `google/gemini-3.8-flash-tts` 输出贵 50%，130 种语言，表演更细，请求格式完全一样，只换模型名。没拿来比。
- 音色和指令是用户听出来的：2026-10-08 生成了一段 40 秒的 Kore，`instructions` 写「像电台主播一样，亲切自然，语速适中」；又生成了 6 个音色、6 种情绪各一段短句对比。用户听完觉得 Kore 那段最好，定为默认。

### 接口从哪来

- 用法：[OpenRouter TTS 文档](https://openrouter.ai/docs/guides/overview/multimodal/tts)。OpenAI 兼容的 `POST /api/v1/audio/speech`，返回体是音频字节，不是 JSON。
- 模型元数据：`GET https://openrouter.ai/api/v1/models?output_modalities=speech`，不用鉴权，里面有 `supported_voices`（30 个）和价格；`GET /api/v1/models/google/gemini-3.8-flash-lite-tts/endpoints` 能看到上游是 Google AI Studio 和 Vertex 两家，上下文 32768，`max_prompt_tokens` 8192，`max_completion_tokens` 16384，`supports_voice_cloning` 是 false。
- 文档里写的 Gemini 专属规矩：风格写进顶层 `instructions`，OpenRouter 把它转成上游的 style 字段，写进 `input` 的指令会被念出来；`input` 可以是分段列表，做多人对话。

### 实测 { #gemini-tests }

2026-10-08 经海外中转：

| 请求 | 结果 |
|---|---|
| `response_format: "mp3"` | 400：`Gemini TTS only supports response_format="pcm". Got "mp3".`——OpenRouter 文档说支持 mp3，Gemini 实际不支持 |
| `response_format` 填 `wav`、`opus`、`aac`、`flac` | 都是 400，`ZodError`，OpenRouter 的参数校验只认 `mp3` 和 `pcm`，到不了 Gemini |
| pcm，Kore，54 字中文，带 `instructions` | 200，`Content-Type: audio/pcm;rate=24000;channels=1`，9.7 秒音频，总耗时 8 秒；MAI-Transcribe-2 转回文字逐字一致 |
| `input` 写成两段，Kore 和 Puck | 200，9 秒音频；MAI-Transcribe-2 开说话人分离，分出两个说话人，文字也对 |
| 正文插 `<laugh>`、`<sigh>` | 转录里没有出现这两个单词 |
| 40 秒左右的整段，Kore，电台主播指令，跑了两次 | 每次总耗时约 21 秒 |
| 6 个音色、6 种情绪各一句，5–8 秒 | 每段耗时 5–11 秒；同一句话指令写「生气」读成 5.1 秒，写「难过」读成 7.9 秒，指令至少改了语速 |

- 计费：用 `GET /api/v1/generation?id=<X-Generation-Id>` 查到 9.7 秒那次是 0.0014765 美元，输入 25 token、输出 244 token，和每秒 25 token 对得上；用户在 OpenRouter 后台看到的逐条费用也对得上。
- 上游：这几次都路由到 Google AI Studio。
- 转格式：起初写的是 ffmpeg 转 mp3，用户嫌要装 ffmpeg；改成 Python 的 `wave` 模块，用户又担心 Agent 只有命令行、没有 Python——最后改成 shell 自带的 `printf` 写 44 字节文件头再接上 pcm。拿 39 秒那段验证过：bash、dash、zsh、busybox sh 都能跑，`file` 认出是 24 kHz 单声道 16 位 wav，Python `wave` 严格解析通过，文件头和 `wave` 模块写的逐字节相同，后面的数据和原 pcm 一致；macOS 的 `wc -c` 输出带前导空格，算术展开照样算对。没在 Windows 上试过。
- 13 段对比加两段 40 秒的 demo，Gemini 合成一共花了约 0.03 美元。

### 没做的

- 30 个音色只听了 7 个（Kore、Puck、Charon、Fenrir、Leda、Sulafat、Gacrux）。
- 那段 40 秒的比短句好听，是因为文字长还是因为指令写得具体，没拆开测。
- `speed` 参数、超长文本切段都没测。
- 没和 `gemini-3.8-flash-tts` 比。

## 克隆的备选 { #clone-alternatives }

方案二的 MAI-Voice 和试过的 Gemini 都不能克隆，所以要特定人声仍然用方案一。2026-10-08 查了 OpenRouter 全部 39 个 TTS 端点，`supports_voice_cloning` 为 true 的只有三个：`fish-audio/s2.1-pro`、它的免费版 `fish-audio/s2.1-pro-free:free`、`bytedance-seed/seed-audio-1-0`。

参考音频放在请求的 `input_references` 里：`{"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64,…"}}`，也可以把 `data` 换成 `url`；Fish 还收一段 `{"type": "text", "text": "参考音频的文字稿"}`，Seed 会忽略文字稿。Seed 不能同时传 `voice` 和 `input_references`。这两家都能直接出 mp3。

同一段大米参考音频、同一段 54 字文字，和方案一一起实测：

| 方案 | 出结果 | 花费 | 转录核对 |
|---|---|---|---|
| Fish Audio s2.1-pro | 27 秒，同步 | 0.0024 美元（13.8 秒音频，约每分钟 0.01 美元） | 逐字一致 |
| Fish Audio s2.1-pro 免费版 | 31 秒，同步 | 0 | 逐字一致 |
| Seed Audio 1.0 | 46 秒，同步 | 0.039 美元（15.7 秒音频，每秒 0.0025 美元） | 「一段语音」转成了「一段1」 |
| IndexTTS2（方案一） | 48 秒，要轮询 | 没对账单 | 字都对，句末问号转成句号 |

- 哪个最像原声还没比，默认仍是 IndexTTS2。
- Fish 免费版的次数上限和数据政策没查。
