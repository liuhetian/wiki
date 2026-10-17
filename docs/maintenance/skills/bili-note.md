---
description: "B站视频笔记（bili-note）的维护记录：吸纳自 Rimagination/bili-note，钉在 08fe812；下载改走 agent-io 下载狗，转写改走 MAI-Transcribe-2，网页 AI 字幕和本地 ASR 删掉"
---

# B站视频笔记（bili-note）

[B站视频笔记](../../skills/bili-note/index.md)的维护记录。

- **上游**：Rimagination/bili-note[^upstream]，作者署名 Bili Note contributors，MIT，许可证原文随目录留在 `LICENSE`。上游是给 Codex 写的，命令都是 Windows PowerShell，和作者的另一个 skill DyNote（抖音笔记）共用 Qwen3-ASR 环境
- **commit**：钉在 `08fe812`（2026-09-22），2026-10-16 读时仍是最新
- **跳过**：
    - `agents/openai.yaml`：Codex 的界面元数据（显示名、一句话简介、默认 prompt），不是 Claude Code 插件里的 agent
    - `README.md`、`.gitignore`、`assets/bili-note-logo.png`（README 用的 logo）、`tests/` 下 9 个测试
    - 网页 AI 字幕整条路线：`fetch_browser_ai_subtitles.py`、`edge_cdp.py`。它让已登录 B站的浏览器页面自己请求 `/x/player/wbi/v2` 拿 AI 字幕地址，要带图形界面的浏览器开远程调试端口，Chrome 版还依赖外部的 web-access skill；Agent 跑在无图形界面的服务器上用不上，没字幕直接转写
    - 本地 ASR：`setup_qwen_asr_env.py`、`run_qwen_asr.py` 和 `extract_bilibili.py` 里 Qwen3-ASR、faster-whisper、openai-whisper、FunASR 四个后端；yt-dlp 和 B站 `playurl` 接口两条下载路线
- **翻译之外的改动**：
    - `SKILL.md` 改名 `index.md`；`name` 改成「B站视频笔记」，`description` 由英文改写成什么时候用、做什么；开头补一段这个 skill 解决什么问题，页尾加维护记录的链接
    - 正文原本就是中文，按新路线重排：PowerShell 命令改成 bash，`$env:USERPROFILE\.codex\skills\bili-note` 改成入口页一句话指向整包 `bili-note.tar.gz`，调用不到 2 次就远程逐个取；命令一律写相对 skill 根的 `scripts/xxx.py`；「B站字幕注意事项」「B站图文注意事项」两节合成「B站内容的坑」；Chrome / Edge 两条网页字幕的命令和 `--browser-target` 等参数删掉
    - 加一条：预检显示没有公开字幕时，和关键帧一起问用户要不要转写，说明下载狗额度和转写费用
    - 下载视频改走 [解析分享链接](../../skills/agent-io/reference/share-link.md)：`extract_bilibili.py` 新增 `resolve_video_url`、`download_video`，按 `?p=N` 解析分P，核对直链里的 `cid`，失败重试 3 次；视频缓存在工作目录的 `video/`，转写和 `extract_video_keyframes.py` 共用，同一个分P只扣一次额度。关键帧脚本删掉 `--video-source`、`--cookies-from-browser`
    - 抽关键帧的 ffmpeg 把 `-ss` 挪到 `-i` 前面：上游从播放接口拿 480p，从片头解码到每个时间点还不算慢；下载狗给的是 1080p，50 分钟的课抽 12 帧要 21 分钟，改完 1.6 秒，画面逐像素一样
    - 转写改走 [转录音频](../../skills/agent-io/reference/transcribe.md)：ffmpeg 抽 16 kHz 单声道 32 kbps mp3，默认 10 分钟一块，请求带 `verbose_json`、词级时间戳和 `diarization`；单人讲话一块只回一个 segment，所以按词级时间戳和标点重新切成字幕行。参数换成 `--transcribe`、`--asr-language`、`--asr-chunk-seconds`，原来的 `--download-audio` 和 `--asr-*`、`--qwen-*`、`--whisper-*` 都删掉
    - 转写结果另写 `transcript_manifest.json`，`archive_bili_materials.py` 优先读它：上游只记在 `run_summary.json` 里，总入口重跑提取那一步会把它覆盖成空，转写就归档不进去
    - `run_bili_note.py` 加转写阶段：`--transcribe` 只在没有公开字幕时转，排在轻量预检之前，预检的字幕密度把转写字数算进去；`--subtitle-mode` 去掉 `browser`
    - `check_environment.py` 重写能力判断：只查 Python、脚本齐不齐、B站公开接口、ffmpeg 和 `MY_API_KEY` 有没有设置（不打印值）
    - `references/bilibili-api-notes.md` 由英文译成中文；「音频」「本地转写」两节换成「音视频」「转写」，写新路线的接口要点；「字幕」一节补上 `ai-zh` 地址为空不等于没有字幕

[^upstream]: [Rimagination/bili-note @ 08fe812](https://github.com/Rimagination/bili-note/tree/08fe81297ef876a668a7e187409fa2c3366b9faa)，2026-10-16 读。
