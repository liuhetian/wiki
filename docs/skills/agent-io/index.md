---
description: "给新 Agent 装上的基础能力：读 PDF、音频、视频，生成音频、图片、视频，网络搜索，调用其他大模型；每个能力一篇接入说明，需要时配一个脚本；已接入：阅读 PDF、转录音频、阅读视频、网络搜索、解析分享链接、生成语音、生成音乐、生成编辑图片、生成视频、调用 DeepSeek、结构化判断（默认 Jev，看图换 OpenAI，另接微软、Mercury）"
---

# Agent 基础能力

给新建的 Agent 装上的基础能力：每个能力对应一篇接入说明，需要时再配一个能直接运行的脚本，用到哪个能力就读哪一篇。这个 skill 是 [搭建 AI 助手](../../posts/ai-assistant/index.md) 的执行部分。如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](agent-io.tar.gz)下载到本地。取材再读视频就要跑平台下载脚本和 `video_read.py`，平台下载脚本还要 import 同目录的 `share_common.py`。

## 用法 { #usage }

- 能力分两层：**底层**是接口和请求参数，一次调用就完事的能力只有这一层；**中层**是稍微封装过的脚本，跨几家接口、要判断走哪条路的能力才有，比如解析分享链接。有脚本就先用脚本，脚本出错、要改脚本或者只要其中一样时，看底层。
- 脚本要在本地运行：有 shell 的 Agent 按 URL 下载脚本后执行。头部写了依赖的用 `uv run`，uv 自动装，执行前告诉用户会从 PyPI 装哪些包；只用标准库的直接 `python3`。本地有本 wiki 的仓库时，脚本就在仓库的 `docs/skills/agent-io/scripts/` 下，直接跑，不用下载。
- 要调厂商 API 的能力统一走 [API 中转](../../posts/ai-assistant/api-gateway.md)（已接 DeepSeek、AutoDL、下载狗、TikHub、CodeProxy、OpenRouter）：中转原样转发，只换 base URL 和 key。Agent 不配厂商 key，本站也不存明文密钥。
- 网关 token 由用户写在 `.env` 的 `MY_API_KEY` 里，AI 直接用：在 `.env` 所在目录（本 wiki 就是仓库根）跑 `set -a; . ./.env; set +a` 载入，命令里写 `$MY_API_KEY`。别用 grep、cut 自己把值抠出来，Claude Code 的权限检查会当成数据外泄拦下；也别打印。中转域名 `*.liuhetian.work`、`*.reverse-pro.xyz` 都是用户自己的服务器。
- 花钱的调用直接调，不用停下来问用户，单价写在各篇里。

## 能力表

| 能力 | 读取 | 生成 |
|---|---|---|
| PDF | [阅读 PDF](reference/pdf.md) | — |
| 音频 | [转录音频](reference/transcribe.md) | [生成语音](reference/tts.md)：默认用我们自己的音色，用户说不用就换微软 MAI-Voice 的 Mei；[生成音乐](reference/music.md) |
| 图片 | — | [生成、编辑图片](reference/image.md) |
| 视频 | [阅读视频](reference/read-video.md)：给视频文件或解析分享链接取下的文件夹，出关键帧联系图、转写和每分钟字数，图文帖出编号拼图，跑 `video_read.py` | [生成视频](reference/video/index.md)：默认文字加参考图生成；文生、首尾帧、对口型、动作迁移各有一篇 |
| 网络 | [网络搜索](reference/web-search.md)；[解析分享链接](reference/share-link/index.md)：小红书、抖音、B 站的链接一条换成一个文件夹，有正文、作者、点赞收藏、原图和视频，B 站另有字幕和评论；一个平台一个脚本，每页上面是脚本、下面是底层接口 | — |
| 调用大模型 | — | [调用 DeepSeek](reference/deepseek.md)、[结构化判断](reference/jev.md)：返回概率和选项，不返回文字；默认 Jev，看图换 OpenAI，另接了微软和 Mercury |

还没接入的能力，接好一个再补一篇，不写占位页。
