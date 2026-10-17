---
description: "整理视频为笔记的维护记录：吸纳自 Rimagination/bili-note，钉在 08fe812；2026-10-17 改名并拆成下载、分析、输出三段，下载和分析并进 agent-io，本 skill 只留证据索引、篇幅预算和打分；之前那版的改动也记在这里"
---

# 整理视频为笔记（video-note）

[整理视频为笔记](../../skills/video-note/index.md)的维护记录。下面「翻译之外的改动」记的是 2026-10-17 拆分之前那版，拆分本身见[最后一节](#three-stages)。

- **上游**：Rimagination/bili-note[^upstream]，作者署名 Bili Note contributors，MIT，许可证原文随目录留在 `LICENSE`。上游是给 Codex 写的，命令都是 Windows PowerShell，和作者的另一个 skill DyNote（抖音笔记）共用 Qwen3-ASR 环境
- **commit**：钉在 `08fe812`（2026-09-22），2026-10-16 读时仍是最新
- **跳过**：
    - `agents/openai.yaml`：Codex 的界面元数据（显示名、一句话简介、默认 prompt），不是 Claude Code 插件里的 agent
    - `README.md`、`.gitignore`、`assets/bili-note-logo.png`（README 用的 logo）、`tests/` 下 9 个测试
    - 网页 AI 字幕整条路线：`fetch_browser_ai_subtitles.py`、`edge_cdp.py`。它让已登录 B站的浏览器页面自己请求 `/x/player/wbi/v2` 拿 AI 字幕地址，要带图形界面的浏览器开远程调试端口，Chrome 版还依赖外部的 web-access skill；Agent 跑在无图形界面的服务器上用不上，没字幕直接转写
    - 本地 ASR：`setup_qwen_asr_env.py`、`run_qwen_asr.py` 和 `extract_bilibili.py` 里 Qwen3-ASR、faster-whisper、openai-whisper、FunASR 四个后端；yt-dlp 和 B站 `playurl` 接口两条下载路线
- **翻译之外的改动**：
    - `SKILL.md` 改名 `index.md`；`name` 改成「视频笔记」，`description` 由英文改写成什么时候用、做什么；开头补一段这个 skill 解决什么问题，页尾加维护记录的链接
    - 正文原本就是中文，按新路线重排：PowerShell 命令改成 bash，`$env:USERPROFILE\.codex\skills\bili-note` 改成入口页一句话指向整包 `video-note.tar.gz`，调用不到 2 次就远程逐个取；命令一律写相对 skill 根的 `scripts/xxx.py`；「B站字幕注意事项」「B站图文注意事项」两节合成「各平台的坑」的 B站一节；Chrome / Edge 两条网页字幕的命令和 `--browser-target` 等参数删掉
    - 加一条：预检显示没有公开字幕时直接转写，下载狗额度和转写费用事后报，不停下来问（2026-10-17 改；原先是和关键帧一起问用户）
    - 下载视频改走 [解析分享链接](../../skills/agent-io/reference/share-link/index.md)：`extract_bilibili.py` 按 `?p=N` 解析分P，核对直链里的 `cid`，解析失败重试 3 次；视频缓存在工作目录的 `video/`，转写和 `extract_video_keyframes.py` 共用，同一个分P只扣一次额度。关键帧脚本删掉 `--video-source`、`--cookies-from-browser`
    - 抽关键帧的 ffmpeg 把 `-ss` 挪到 `-i` 前面：上游从播放接口拿 480p，从片头解码到每个时间点还不算慢；下载狗给的是 1080p，50 分钟的课抽 12 帧要 21 分钟，改完 1.6 秒，画面逐像素一样
    - 转写改走 [转录音频](../../skills/agent-io/reference/transcribe.md)：ffmpeg 抽 16 kHz 单声道 32 kbps mp3，默认 10 分钟一块，请求带 `verbose_json`、词级时间戳和 `diarization`；单人讲话一块只回一个 segment，所以按词级时间戳和标点重新切成字幕行。参数换成 `--transcribe`、`--asr-language`、`--asr-chunk-seconds`，原来的 `--download-audio` 和 `--asr-*`、`--qwen-*`、`--whisper-*` 都删掉
    - 转写结果另写 `transcript_manifest.json`，`archive_materials.py` 优先读它：上游只记在 `run_summary.json` 里，总入口重跑提取那一步会把它覆盖成空，转写就归档不进去
    - `run_video_note.py` 加转写阶段：`--transcribe` 只在没有公开字幕时转，排在轻量预检之前，预检的字幕密度把转写字数算进去；`--subtitle-mode` 去掉 `browser`
    - `check_environment.py` 重写能力判断：只查 Python、脚本齐不齐、B站公开接口、ffmpeg 和 ffprobe、`MY_API_KEY` 有没有设置（不打印值）
    - `references/bilibili-api-notes.md` 由英文译成中文；「音频」「本地转写」两节换成「音视频」「转写」，写新路线的接口要点；「字幕」一节补上 `ai-zh` 地址为空不等于没有字幕
    - 2026-10-17 从 B站专用改成通用的视频笔记：目录 `bili-note` 改 `video-note`，`run_bili_note.py`、`archive_bili_materials.py`、`score_bili_note.py` 改成 `run_video_note.py`、`archive_materials.py`、`score_note.py`。取材分两条，B站链接照旧，其余分享链接走新增的 `extract_share_link.py`：下载狗给标题、简介和点赞、评论、收藏数，解析完马上下载（抖音直链一小时左右过期），ffprobe 读时长，按一个分P写成和 B站相同的工作目录，后面的流程不分平台
    - 分享链接解析、下载、抽音频、转写从 `extract_bilibili.py` 挪进 `agent_io.py`，两条取材共用；解析成功一次扣一次额度，所以只在失败时重试
    - 关键帧脚本不再调 B站接口，改读工作目录的 `metadata.json`；`--force` 只重抽帧、不重下视频，分享链接重下要再扣额度；竖屏视频抽 540×960 的帧，联系图格子也竖排，横屏照旧 960×540
    - 预算：没有播放量时互动倍率取 1.0，点赞等计数照记；不到 3 分钟的视频记为 `clip`，下限从 1200 字降到 400 字、按关键帧数加字，入口页配一套短视频的精简结构；既没字幕也没转写的视频画面依赖至少记 medium
    - 归档修两处：B站公开字幕清单是列表，路径直接写在每一项上、不在 `files` 里，原来一条都归档不进去，最后在 `manifest.get` 上报错退出；公开字幕清单和无字幕的视频都不带时长，预算按 0 分钟算，改从 `metadata.json` 的分P时长补
    - `b23.tv` 短链不带 BV 号，原来报找不到 BVID 退出，现在交给通用取材

## 2026-10-17 拆成三段 { #three-stages }

用户觉得 agent-io 对各家链接怎么取讲不清，全被包在视频笔记里，定下「视频笔记拆成下载、分析、输出几个环节，agent-io 提供底层接口和稍微封装的中级脚本，视频笔记改名整理视频为笔记」。

- **下载并进 agent-io 的[解析分享链接](../../skills/agent-io/reference/share-link/index.md)**：`extract_bilibili.py`、`extract_bilibili_opus.py`、`extract_share_link.py` 和 `agent_io.py` 里解析、下载的部分并进那边的脚本；`references/bilibili-api-notes.md` 改写成那边的 [B 站](../../skills/agent-io/reference/share-link/bilibili.md)页，旧地址加了跳转
- **分析并进 agent-io 的[阅读视频](../../skills/agent-io/reference/read-video.md)**：`extract_video_keyframes.py` 和 `agent_io.py` 里转写的部分变成 `video_read.py`，见[它的维护记录](../read-video.md)
- **输出段留在这里**：1347 行的 `archive_materials.py` 换成约 300 行的 `prepare_note.py`。原来大半代码在适配旧工作目录的各种清单；新文件夹各平台一个形状，读起来简单得多
    - 照搬：篇幅预算公式、互动质量倍率（0.85–1.4，没有播放量取 1.0）、画面依赖判断、字幕证据 550 字或 14 行一块、`P01@时:分:秒-时:分:秒` 和 `KF-P01-03`、`C<rpid>` 的编号、学习型 13 节结构和短视频精简结构
    - 改了：图文证据 `O<id>-E001` 改成 `A-001`，新加图片 `IMG-01`；不足 1500 字的短图文另有一条公式，原来按长文章算，456 字的小红书帖子要写 900 字
    - 删了：`update_note_budget_section.py`（把预算写回笔记正文，已发布的笔记没用上）；`check_environment.py`（agent-io 的脚本缺 ffmpeg 或 key 会直接报）；`run_video_note.py` 的「先预检、问要不要开关键帧、再重跑」（用户定下花钱不打断，分析段默认就抽帧）；把材料复制进另一个归档目录（下载段的文件夹本身就是归档）
- **证据脚注**：原来正文写 `[1][2]`、单列一节「证据脚注」链到归档目录；和写作规范的 `[^名]` 脚注、已发布笔记的写法打架，统一成 `[^名]`，脚注写证据 ID 加原视频时间点，全文在材料文件夹的 `note/evidence.md`
- **端到端验收后改的**：新 agent 只拿「把这个视频整理成学习笔记，按本wiki的方法来」和那条抖音教程，三段走通，笔记打分 `ok`，证据 14 条全用上。它报的问题对应改了：打分不再把 frontmatter、HTML 标签、图片属性算进字数，用了写作规范推荐的并排图就超预算的问题没了；证据写成区间也算区间里的每一条；口播里有「指令」「提示词」「描述词」「这段」这类指向画面的词，画面依赖至少判「中」，原来这条 46 秒教程判成「低」；画面上的提示词、命令允许照原文抄；写明笔记放哪、`visual_review.md` 怎么用、抖音没有按秒跳转的链接；转写的坑补上平台名听错（「即梦」转成「小梦」）。它看补抽的帧发现已发布那篇笔记的两处事实写错（标题不是等花开完才浮现、16 积分不是一张图的价），核对关键帧后改了

[^upstream]: [Rimagination/bili-note @ 08fe812](https://github.com/Rimagination/bili-note/tree/08fe81297ef876a668a7e187409fa2c3366b9faa)，2026-10-16 读。
