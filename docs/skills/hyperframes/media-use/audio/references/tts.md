# 文字转语音

`npx hyperframes tts` 用 Kokoro 在本地合成。它不接受 `--provider` 或 `--words` 参数。如果要 HeyGen 音频外加逐词时间戳，用下面随附的 `heygen-tts.mjs` 脚本。

> **先跑 Preflight —— 没有凭据不等于可以默默改用本地声音。** 生成旁白之前，先完成登录 **Preflight**（见 `../../SKILL.md` → Preflight）：运行 `npx hyperframes auth status`，建议用户登录，然后**停下来等用户选择**（登录以使用 HeyGen 声音，或离线继续使用本地 Kokoro）。这一条对一次性的"生成一段旁白"请求同样适用，和在完整工作流里一样。

## 为 HyperFrames 文档视频配旁白

凡是要放到 hyperframes.heygen.com 上的内容都只用一个旁白声音，这样整个网站听起来不会像两个产品。

| | |
| --- | --- |
| 声音 | **River** —— "Relaxed, Neutral, Informative"（放松、中性、信息型） |
| 提供方 | ElevenLabs |
| `voice_id` | `SAz9YHcvj6GT2YYXdXww` |
| 模型 | `eleven_multilingual_v2` |
| 语速 | 每分钟 145–155 词，留出换气的余地 |
| 底下垫的音乐 | 约 −31 LUFS，绝不盖住人声 |

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/SAz9YHcvj6GT2YYXdXww" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"...","model_id":"eleven_multilingual_v2"}' -o take.mp3
```

文档站上每一部用户旅程影片用的都已经是这个声音。因为手头没有 key 就退回本地 Kokoro，做出来的片子放在其他片子旁边听起来就不对 —— 有三部文档视频就是这样做出来的，后来不得不重新配音。如果连不上 ElevenLabs，就说明情况并停下，而不是换一个别的声音顶替。

只有出于有据可查的理由才换用别的声音，并把理由写下来。

## 可用路由

Gemini 是下面自动提供方顺序之外的一个显式备选。用户要求用 Gemini，就已经选定了提供方；不要把这位用户引去登录 HeyGen。它对凭据的要求见 Gemini 一节。

| 顺序 | 提供方 | 环境变量触发 | Voice ID | 逐词时间戳 | 音频格式 |
| --- | --- | --- | --- | --- | --- |
| 1 | HeyGen (Starfish) | `$HEYGEN_ACCESS_TOKEN` / `$HEYGEN_API_KEY` / `~/.heygen/credentials` | 来自 `GET /v3/voices?engine=starfish` 的 UUID，或你克隆出的声音 id（`heygen-voice.mjs`） | **有**（响应里的 `word_timestamps[]`） | mp3 → 经 ffmpeg 转 wav |
| 2 | ElevenLabs | `$ELEVENLABS_API_KEY` | elevenlabs.io 控制台里的 UUID | 无 | mp3 → 经 ffmpeg 转 wav |
| 3 | Kokoro-82M | 始终可用（本地兜底） | `am_michael`、`af_heart`……（54 个声音） | 无 | 直接输出 wav |

```bash
# Local Kokoro CLI
npx hyperframes tts "Welcome to HyperFrames" -o narration.wav
```

## 自包含的 HeyGen（不走 CLI）—— `scripts/heygen-tts.mjs`

已发布的 `hyperframes tts` CLI 只用 Kokoro 在本地合成。当你明确想要 HeyGen —— 最佳音质**加上**一次调用就拿到逐词时间戳 —— 就用这个 skill 随附的脚本，它直接调用 HeyGen v3 REST API，不需要任何 CLI 提供方的接线：

该脚本解析 HeyGen 凭据的方式和 CLI 相同 —— 先找到的来源生效：宿主注入的 OAuth `$HEYGEN_ACCESS_TOKEN` → `$HEYGEN_API_KEY` → `$HYPERFRAMES_API_KEY` → 项目 `.env`（自动加载，向上最多查找 5 层目录）→ `~/.heygen/credentials`（与 heygen-cli 共用；`$HEYGEN_CONFIG_DIR` 可覆盖该目录）。OAuth 登录以 `Authorization: Bearer` 发送；API key 以 `X-Api-Key` 发送；两者都带 `X-HeyGen-Source: cli`。OAuth CLI 用户可以先用掉网页套餐的免费额度（每月 10 分钟），再进入付费用量；API key 按常规 API 计费。如果唯一的凭据是一个已过期的 OAuth token，脚本会停下，并提示运行 `npx hyperframes auth refresh`。

```bash
# Only needed if you haven't run `npx hyperframes auth login`:
export HEYGEN_API_KEY=...   # or put it in a project .env

# Synthesize + capture word timestamps in one call (skips a Whisper pass)
node skills/media-use/audio/scripts/heygen-tts.mjs \
  "Welcome to HyperFrames." -o narration.wav --words narration.words.json

node skills/media-use/audio/scripts/heygen-tts.mjs ./script.txt -o narration.wav
node skills/media-use/audio/scripts/heygen-tts.mjs --list   # public starfish voices
```

- **声音：** `--voice <id>` 必须是 **starfish** 的 voice_id（`--list`，或 `GET /v3/voices?engine=starfish`），或者你克隆出的某个声音 id（见下文）。v2 目录的 id 会被以 HTTP 400 拒绝。省略 `--voice`（英文）时默认用 **Marcia**（`05f19352e8f74b0392a8f411eba40de1`，一个固定的默认值，保证选择是确定性的）。非英文且没给 `--voice` 时，回退到目录里第一个匹配的声音。
- **输出：** `.wav` → 经 ffmpeg 转码为 44.1k 单声道；`.mp3` → 原始字节（不需要 ffmpeg）。
- **逐词：** `--words <path>` 写出下文那种扁平的 `[{id,text,start,end}]` 结构，可直接接入字幕流水线。HeyGen 的 `<start>`/`<end>` 边界哨兵会被过滤掉，id 会重新连续编号。
- **非英文：** `--lang <code>`（`en` 以外的任何值）会作为请求的 `language` 发送。

## 克隆声音 —— `scripts/heygen-voice.mjs`

用一段 mp3 或 wav 录音克隆一个声音，然后把打印出的 id 传给 `heygen-tts.mjs --voice`。凭据解析方式同上。任何 API 拒绝（达到克隆上限、需要升级套餐、找不到声音）都会把 HeyGen 自己的消息打印到 stderr，并以 1 退出。

```bash
node skills/media-use/audio/scripts/heygen-voice.mjs clone take.mp3 --name "My voice"  # → {"voice_id":"..."}
node skills/media-use/audio/scripts/heygen-voice.mjs list --prefix "My"   # → [{"voice_id","name","created_at"}]
node skills/media-use/audio/scripts/heygen-voice.mjs delete <voice_id>
```

`clone` 最多等 120 秒让克隆完成。`list` 读取的是 `GET /v3/voices?type=private`。

## 何时用哪个提供方

| 目标 | 用 |
| --- | --- |
| 一次调用拿到最佳音质 + 逐词时间戳 | **HeyGen** |
| 即插即用的云端 TTS，声音目录大 | **ElevenLabs** |
| 离线、无需 API key、迭代快 | **Kokoro** |
| 用 Gemini 预置声音或自定义声音做有导演指示的演绎 | **Gemini**（需显式选择；时间信息靠转写） |
| 非英文多语言，音素化是确定性的 | **Kokoro**（`ef_dora`、`jf_alpha`、`zf_xiaobei`……） |

## Gemini 旁白 { #gemini-narration }

用共享的音频引擎，而不是 `hyperframes tts`。以下两种方式任选其一进行认证：

- `GEMINI_API_KEY` 或 `GOOGLE_API_KEY`（按顺序第一个已设置的 key 生效）。
- 放在 `GOOGLE_APPLICATION_CREDENTIALS` 所指位置的 service-account JSON 文件，或注入在 `GCS_CREDS` 里的 JSON。在 helper 使用的 Python 3 环境里安装 `google-auth requests`。已配置的文件优先于注入的 JSON。

API key 优先于 service account：要用 OAuth，就把两个 key 变量都取消设置。绝不要把凭据放进请求文件或 composition 里。helper 每次生成都会以 `generative-language.retriever` scope 获取一个新的 OAuth token。配额项目依次从 `GOOGLE_CLOUD_PROJECT`、`GCLOUD_PROJECT_ID`、service-account JSON 中解析。不支持用户 ADC 文件和 metadata-server 认证。

两条路由调用的都是 Gemini Developer Interactions API，而不是 Cloud TTS 或 Vertex AI。那些 API 有各自独立的模型目录和访问要求。

把下面这段存成项目里的 `audio_request.json`：

```json
{
  "provider": "gemini",
  "tts_model": "gemini-3.8-flash-tts",
  "voice": "Kore",
  "lang": "en",
  "style": "Warm, clear, conversational. Leave a short pause between sentences.",
  "lines": [
    { "id": "intro", "text": "Every word has a moment. Let the picture follow the voice." }
  ],
  "bgm": { "mode": "none" }
}
```

```bash
node <SKILL_DIR>/audio/scripts/audio.mjs \
  --request ./audio_request.json --hyperframes . --out ./audio_meta.json --only tts
```

引擎会保存 `assets/voice/intro.wav`（如果你已有一个同名文件，则保存为 `intro-2.wav`；`voices[].path` 会写明是哪个），测量其时长，并把它转写进 `audio_meta.json` 的 `voices[].words`。在制作带字幕的视频之前，检查每一条请求的台词都有音频，并且逐词时间信息非空。对照实际音频核查这些时间；转写得到的是估算的对齐，不是 TTS 原生的时间戳。不要把词平均分布到整个片段上。

- **模型：** `gemini-3.8-flash-tts`（默认）、`gemini-3.8-flash-lite-tts`、`gemini-3.1-flash-tts-preview`、`gemini-2.5-pro-preview-tts` 和 `gemini-2.5-flash-preview-tts`。必须使用这些确切的 Developer API ID；`gemini-2.5-flash-tts` 这类 Cloud TTS 别名不被接受。
- **声音：** 默认 `Kore`；用 3.8 时可以传入其他预置声音，或一个已有的自定义 voice ID。较旧的模型只能用预置声音。创建或复刻声音不在这个 helper 的范围内。
- **演绎：** 把指示写进 `style`，不要写进要念出来的 `text`。每一行都可以覆盖 `style`。3.8 使用结构化标注；较旧的模型会在文稿之前收到一段演绎提示。检查这些指示没有被念出来。用 style 控制节奏；数值型的 `speed` 必须省略或设为 1。
- **音频：** 3.8 返回完整的 WAV。较旧的模型返回单声道 16-bit PCM，helper 会按返回的采样率把它包装成 WAV，不做重采样。播放或渲染期间不会发生任何生成调用。
- **时间信息：** 这个 adapter 不请求原生逐词时间戳，而是使用现有的转写流程。`lang` 选择转写语言；Gemini 从文本推断语音的语言。
- **工作流 adapter：** product-launch、faceless-explainer 和 PR-video 的音频脚本都接受 `--provider gemini --voice Kore --tts-model gemini-3.8-flash-tts --style "Warm and clear"`。

API 报错会被记为一条失败的台词；显式选定的 Gemini 声音绝不会默默回退到别的提供方。要检查引擎的 anomalies 和输出元数据，而不只是看它的退出码。

API 约定：Google 的语音生成指南[^speech-generation]。

## ffmpeg 依赖

HeyGen 和 ElevenLabs 返回 mp3。当 `--output` 以 `.wav` 结尾时（这是默认值，也是下游 `ffprobe` + Whisper 所期望的），随附的 HeyGen helper 会转码为 wav。如果你宁愿跳过转码，就传 `-o file.mp3`。PATH 上没有 `ffmpeg` 时，云端提供方的 wav 输出会失败；本地 Kokoro CLI 则直接写出 wav。

## 声音选择（Kokoro）

默认 `af_heart`。精选推荐：

| 内容类型 | 声音 |
| --- | --- |
| 产品演示 | `af_heart`、`af_nova` |
| 教程 / 操作指南 | `am_adam`、`bf_emma` |
| 营销 / 宣传 | `af_sky`、`am_michael` |
| 文档 | `bf_emma`、`bm_george` |
| 随意 / 社交 | `af_heart`、`af_sky` |

运行 `npx hyperframes tts --list` 查看内置的声音集。

## 多语言（Kokoro 声音前缀 → 语言）

Kokoro voice ID 的首字母决定音素化器使用的语言；`--lang` 会覆盖自动检测。

| 前缀 | 语言 |
| --- | --- |
| `a` | 美式英语 |
| `b` | 英式英语 |
| `e` | 西班牙语 |
| `f` | 法语 |
| `h` | 印地语 |
| `i` | 意大利语 |
| `j` | 日语 |
| `p` | 巴西葡萄牙语 |
| `z` | 普通话 |

```bash
npx hyperframes tts "La reunión empieza a las nueve" --voice ef_dora
npx hyperframes tts "Today is a nice day" --voice af_heart
```

有效的 `--lang` 代码（只在需要覆盖声音自动检测出的语言时才用）：`en-us`、`en-gb`、`es`、`fr-fr`、`hi`、`it`、`pt-br`、`ja`、`zh`。

非英文的音素化需要在系统范围内安装 `espeak-ng`（`brew install espeak-ng` / `apt-get install espeak-ng`）。

## 语速

- `0.7-0.8` —— 教程、复杂内容、无障碍
- `1.0` —— 自然语速（默认）
- `1.1-1.2` —— 开场、转场、轻快的内容
- `1.5+` —— 很少合适，要仔细测试

`hyperframes tts` 命令对 Kokoro 支持 `--speed`。各提供方专用的 helper 会在各自的文档里说明自己的节奏控制方式。

## 长脚本

超过几段的文本，把它写进一个 `.txt` 文件并传入路径。超过约 5 分钟语音的输入，拆成若干段可能效果更好。

## HeyGen 逐词时间戳结构

向 HeyGen 调用传入 `--words <path>` 时，文件会以与 `transcribe` 产出相同的扁平结构写出 —— 可直接接入字幕流水线：

```json
[
  { "id": "w0", "text": "Hi", "start": 0.0, "end": 0.21 },
  { "id": "w1", "text": "there", "start": 0.22, "end": 0.55 }
]
```

对于 ElevenLabs / Kokoro，运行 `npx hyperframes transcribe narration.wav --model small.en` 得到同样的结构。

[^speech-generation]: [Google 的语音生成指南](https://ai.google.dev/gemini-api/docs/speech-generation)，2026-10-15 读。
