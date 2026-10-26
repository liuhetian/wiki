# 音频引擎 —— 旁白、音乐、音效、字幕、转写

要做一次完整的音频处理（TTS 旁白 + 背景音乐 + 音效一次搞定），使用位于 `audio/scripts/audio.mjs` 的共享引擎。它接收一个中立的 `audio_request.json`，写出 `audio_meta.json`，并把素材放在 `.media/audio/{voice,bgm,sfx}` 下：

```bash
node <SKILL_DIR>/audio/scripts/audio.mjs --request ./audio_request.json --out ./audio_meta.json
```

- **请求** `{ provider?, voice?, lang?, speed?, tts_model?, style?, lines: [{ id, text, style?, sfx?: [names] }], bgm: { mode?, query?, prompt? } }`：`id` 用来把每一行关联回你自己的数据模型；`bgm.mode` = `retrieve | generate | none`（省略则自动）。`--only tts,bgm,sfx` 只运行其中一部分，并合并进已有的 `--out`。
- **Gemini 旁白** 需要主动启用：设置 `provider: "gemini"`，并提供 API key 或 service-account 凭据。`tts_model` 默认是 `gemini-3.8-flash-tts`；也支持 3.8 Flash-Lite、3.1 Flash Preview 以及 2.5 Pro/Flash Preview TTS。`style` 指导演绎方式；某一行的 style 会覆盖整个请求的 style。CLI 覆盖参数：`--tts-model`、`--style`。完整的请求示例见 `audio/references/tts.md`。现有的自动提供方顺序保持不变。
- **输出** `audio_meta.json`（以 id 为键）：`voices[].{path,duration_s,words[]}`（供字幕用的逐词时间戳）、`sfx[]`、`bgm`、`total_duration_s`。
- **HeyGen 免费使用路径**：HeyGen CLI 认证会解锁 TTS 以及音乐/音效检索。本地/特定提供方的生成器在已安装时是显式的备选；在假定检索或 TTS 能用之前，先运行 `npx hyperframes media-use resolve --doctor`。
- 如果 BGM 走的是生成路径（`bgm_pending: true`），在最终渲染前运行 `audio/scripts/wait-bgm.mjs`。

单次调用的 helper：`audio/scripts/heygen-tts.mjs`（生成一个声音文件）。转写 / 背景移除 / 字幕使用 `hyperframes` CLI（`transcribe`、`remove-background`），见 `audio/references/` 下按主题划分的指南（`tts.md`、`bgm.md`、`sfx.md`、`transcribe.md`、`remove-background.md`、`captions/`）。

转写默认用 Parakeet（优于 whisper.cpp：WER 6.05% 对 7.44%，快 5-10 倍），通过 `scripts/transcribe.mjs` 调用，并自动回退到 whisper.cpp（见 `references/operations.md`）。
