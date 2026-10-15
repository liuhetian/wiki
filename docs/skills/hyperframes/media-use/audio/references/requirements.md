<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/requirements.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 依赖与缓存

## 凭据与 key 的优先级

运行 `npx hyperframes auth status` 查看已配置了什么，以及一个工作流会用到哪些引擎（见本 skill 的 **Preflight** 一节）。key 按以下顺序解析——**先匹配到的生效**：

| 服务商 | 解析顺序（第一个非空的生效） | 使用时需要的本地依赖 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **HeyGen**（TTS + BGM/音效检索） | `$HEYGEN_API_KEY` → `$HYPERFRAMES_API_KEY` → `~/.heygen/credentials`（与 heygen-cli 共用；`$HEYGEN_CONFIG_DIR` 可覆盖该目录；由 `hyperframes auth login` 写入） | 无（REST） |
| **ElevenLabs**（TTS 兜底） | `$ELEVENLABS_API_KEY`                                                                                                                                                      | `pip install elevenlabs`                         |
| **Lyria**（BGM 兜底） | `$GEMINI_API_KEY` → `$GOOGLE_API_KEY`                                                                                                                                      | `pip install google-genai`                       |
| **Kokoro**（TTS，无需 key） | 始终可用——最终的配音兜底 | `pip install kokoro-onnx soundfile`              |
| **MusicGen**（BGM，无需 key） | 始终可用——最终的音乐兜底 | `pip install transformers torch soundfile numpy` |

推荐的配置方式是 `hyperframes auth login`（浏览器 OAuth）：登录一次，所有项目通用，不需要每个仓库各配一个 `.env`。OAuth 登录以 `Authorization: Bearer` 发送；API key 以 `X-Api-Key` 发送；两者都带有 `X-HeyGen-Source: cli` 标记。OAuth 方式的 CLI 用户可以使用网页套餐中 HeyGen TTS 的免费额度（每月 10 分钟）；API key 走正常的 API 计费路径。没有 HeyGen 凭据时，配音 / BGM 完全在本地运行（Kokoro / MusicGen）——`hyperframes auth status` 和 `hyperframes doctor` 都会报告这些本地依赖是否已安装。

## 模型缓存与系统依赖

每个命令在首次运行时下载自己的模型，并缓存在 `~/.cache/hyperframes/` 下：

- **TTS（HeyGen）** —— 无本地依赖；需要一个 HeyGen 凭据 + PATH 上的 `ffmpeg`（用于把返回的 mp3 转码成 `.wav`）。凭据的解析方式和 CLI 一样：`$HEYGEN_API_KEY` → `$HYPERFRAMES_API_KEY` → `~/.heygen/credentials`（与 heygen-cli 共用；运行 `npx hyperframes auth login`）。OAuth 登录以 `Authorization: Bearer` 发送；API key 以 `X-Api-Key` 发送；两者都包含 `X-HeyGen-Source: cli`，以便后端应用 CLI OAuth 的免费额度。
- **TTS（ElevenLabs）** —— 与 HeyGen 相同：API key + `ffmpeg`。
- **TTS（Kokoro）** —— Kokoro-82M（约 311 MB）+ 声音文件（约 27 MB），放在 `tts/` 中。需要 Python 3.8+，并装有 `kokoro-onnx` 和 `soundfile`（`pip install kokoro-onnx soundfile`）。非英语文本还需要在系统层面安装 `espeak-ng`。
- **BGM（Lyria）** —— 需要 `$GEMINI_API_KEY` 或 `$GOOGLE_API_KEY` + `pip install google-genai`。没有本地模型缓存。
- **BGM（MusicGen）** —— `pip install transformers torch soundfile`。`facebook/musicgen-small`（约 300 MB）在首次运行时缓存到 `~/.cache/huggingface/` 下。
- **转写** —— Whisper 模型，大小取决于所选（75 MB – 3.1 GB），放在 `whisper/` 中，首次使用时从 HuggingFace 下载。`whisper.cpp` 本身不随附：CLI 会从 PATH 中查找它，或通过 Homebrew 安装（macOS），或者在首次使用时用 git+cmake 从源码构建（`$HYPERFRAMES_WHISPER_PATH` 可覆盖）。
- **背景移除** —— `u2net_human_seg`（约 168 MB 的 ONNX），放在 `background-removal/models/` 中。推理时内存峰值约 1.5 GB。

如果某个命令因为缺少依赖而失败，运行 `npx hyperframes doctor`。
