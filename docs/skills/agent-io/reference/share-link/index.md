---
description: "Agent 把小红书、抖音、B 站链接换成一条一个文件夹：正文、作者、点赞收藏、原图、视频，B 站另有字幕和评论；一个平台一个脚本（xiaohongshu.py、douyin.py、bilibili.py，其他平台 xiazaitool.py），文件夹格式各平台一样；每个平台一页，上面是脚本、下面是底层接口和请求参数"
---

# 解析分享链接

把小红书、抖音、B 站的链接换成一条一个文件夹：正文、作者、点赞收藏、原图、视频，B 站另有字幕和评论。一个平台一个脚本，各平台一页：页面上面写脚本怎么跑，下面写底层接口和请求参数，脚本出错、要改脚本或者只要其中一样时看底层。

| 平台 | 脚本 | 正文、作者、点赞收藏 | 图 | 视频 | 字幕、评论 | 背后调谁 |
|---|---|---|---|---|---|---|
| [小红书](xiaohongshu.md) | `xiaohongshu.py` | ✅ | 原图；轮播视频也给原图 | 真视频才有 | — | TikHub，真视频另调下载狗 |
| [抖音](douyin.md) | `douyin.py` | ✅ | 图文没测 | ✅ | — | TikHub 取元数据，下载狗取视频 |
| [B 站](bilibili.md)视频 | `bilibili.py` | ✅，另有播放、投币、弹幕数 | 封面 | 每P一个 | 字幕多半要登录才给；评论加 `--comments` | B 站公开接口，下载狗取视频 |
| [B 站](bilibili.md)图文动态 | `bilibili.py` | ✅ | 文中全部图 | — | 评论加 `--comments` | 公开页面 |
| 其他平台 | `xiazaitool.py` | 只有标题 | 有就给 | 有就给 | — | [下载狗](#xiazaitool) |

## 跑脚本 { #script }

```bash
python3 scripts/<平台>.py <链接或整段分享文案>... --out <目录>
```

- **先载入 `MY_API_KEY`**，见 [Agent 基础能力 · 用法](../../index.md#usage)。只用 Python 标准库，不用装包，也不用 ffmpeg
- **平台脚本都 import 同目录的 [`share_common.py`](../../scripts/share_common.py)**，所以调用一次也要整包：直接将[Agent 基础能力](../../agent-io.tar.gz)下载到本地。本地有本 wiki 的仓库就直接跑 `docs/skills/agent-io/scripts/` 下的
- **每个脚本只认自己平台的链接**：传错了那一条报错、提示换哪个脚本，其余照常取完。几个平台混在一起，就按平台分几次跑，`--out` 用同一个目录
- **输出**：每条一个子文件夹 `<平台>_<键>/`，键是链接里直接认得出的 ID，短链就是短链码，真正的 ID 在 `meta.json` 的 `id`。里面是 `meta.json`、`images/01.jpg`…、`cover.jpg`、`video/p01.mp4`…（图片扩展名按文件实际格式，B 站图文多是 `.png`，抖音封面是 `.webp`），B 站图文另有 `article.md`，B 站视频另有 `subtitles/p01_<语言>.srt`，加 `--comments` 有 `comments.json`；`raw/` 存各家的原样返回
- **`meta.json`**：`kind` 是 `image`（图文）、`carousel`（小红书拿一组图拼的轮播视频，原图都在 `images/`）、`video` 或 `article`（B 站图文）；另有 `title`、`desc`、`author`、`stats`、`published`、`duration`、`topics`、`files`、`cost`、`warnings`、`error`。`parts` 每P一条：`page`、`cid`、`title`、`duration`、`video`、`subtitles`，不分P的也是一条
- **stdout**：每条一行 JSON 摘要，最后一行是总花费；有一条失败，退出码就是 1
- **共用参数**：`--no-video` 不下视频，也省下下载狗；`--force` 重新取，重新扣钱。B 站另有 `--parts` 和 `--comments`，见 [B 站](bilibili.md#script)
- **重跑不扣钱**：文件夹里已有不带 `error` 的 `meta.json` 就跳过
- **下载中断了就原样重跑**：断网、磁盘满这类下载失败只记进 `warnings`，`meta.json` 照样写；重跑时先用 `raw/` 里的直链免费补下，直链过期了才重新解析那一P
- **`--out` 放在空间够的盘上**：一篇 B 站长图文的原图就上百 MB
- **出错时**：`error` 写着哪一步失败，`raw/` 里是那家的原样返回，对照那个平台页的底层接口接着调

## 底层：下载狗 { #xiazaitool }

视频直链靠它，三个平台都用；其他平台只能靠它，脚本是 [`xiazaitool.py`](../../scripts/xiazaitool.py)，只给标题和媒体。经[中转](../../../../posts/ai-assistant/api-gateway.md)的国内机：

```bash
curl -sS -m 90 -G https://xiazaitool-proxy.liuhetian.work/ \
  -H "Authorization: Bearer $MY_API_KEY" \
  --data-urlencode "url=<分享链接>"
```

- **只传链接**：先从分享文案里抽出 URL 再传，整段文案里的引号、换行会把中转拼的 JSON 弄坏
- **结果**：`status` 为 200 才算成功。`data.isVideo` 为真下 `data.videoUrls`，为假下 `data.pics`。`videoUrls` 一般是一个字符串，B 站有时是数组，两种都要处理；`coverUrls` 是字符串；`pics` 是数组，视频笔记里是 `[""]`
- **只信媒体**：小红书的正文、作者是空的，点赞收藏是 0，发布时间是空串；抖音给统计数，没有作者
- **失败重试**：偶尔返回 500「解析失败」，同一链接重试一两次；同一条抖音也碰到过半天都解析不了。失败不扣次数，成功一次扣 0.005 元
- **耗时**：B 站 0.5 秒左右，抖音、小红书几秒到十几秒，超时设一分钟以上
- **下载直链**：直接下，不经过中转。B 站带上 `Referer: https://www.bilibili.com/`；抖音直链一小时左右过期，解析完马上下

维护记录：[为什么两家一起用、为什么按平台拆、各字段稳不稳、实测结果、没做的事](../../../../maintenance/share-link.md)。正常使用不用看，想换接口或者排查怪现象时再看。
