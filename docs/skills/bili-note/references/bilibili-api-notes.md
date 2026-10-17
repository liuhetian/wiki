---
description: "B站视频笔记的接口笔记：元数据、字幕、评论、图文接口怎么调、有哪些坑；音视频经 agent-io 下载狗拿直链，转写经 MAI-Transcribe-2；字幕稀疏时怎么补视觉证据"
---

# B站接口笔记

调用公开接口时带上仿浏览器的 `User-Agent` 和 `Referer`。

## 元数据

- `https://api.bilibili.com/x/web-interface/view?bvid=<BVID>`
- 关键字段：`aid`、`bvid`、`cid`、`title`、`desc`、`owner.name`、`pubdate`、`duration`、`pages`。

多P视频的每个 `pages[]` 条目都有 `page`、`cid`、`part` 和 `duration`。

## 字幕

- `https://api.bilibili.com/x/player/v2?bvid=<BVID>&cid=<CID>`
- 检查 `data.subtitle.subtitles`。
- 如果 `need_login_subtitle` 为 true 且 `subtitles` 为空，说明拿不到公开字幕。
- 只列出 `ai-zh`、`subtitle_url` 却为空，是 B站自动生成的 AI 字幕要登录才给地址，不是视频没有字幕。本 skill 不走登录态，这种情况按拿不到公开字幕处理，改走音频转写。

## 音视频

不调 B站的播放接口，也不用 yt-dlp，走 [Agent 基础能力 · 解析分享链接](../../agent-io/reference/share-link.md)：

- 分P链接写成 `https://www.bilibili.com/video/<BVID>/?p=<N>`，第 1 P 不带 `?p=`。
- `data.videoUrls` 是一个字符串，指向音视频合一的 mp4；直链路径里带这一 P 的 `cid`，可以拿来核对没拿错 P。
- 每个分P解析一次扣一次额度，失败不扣；同一个分P的视频缓存在工作目录的 `video/` 下，转写和抽关键帧共用，不重复解析。
- 下载直链不经过中转，请求头带 B站 `Referer`。

## 转写

走 [Agent 基础能力 · 转录音频](../../agent-io/reference/transcribe.md)：

- 视频先用 ffmpeg 抽成 16 kHz 单声道 32 kbps mp3，默认每 10 分钟切一块，一块一个请求（`--asr-chunk-seconds`，0 表示整段发）。
- 请求带 `verbose_json`、词级时间戳和 `diarization`。
- 一个人讲的视频，一整块只返回一个 segment。所以按词级时间戳重新切行：遇到句末标点就断；遇到逗号且这一行已满 40 字也断；词间停顿超过 1.5 秒或换了说话人同样断开。标点在 `words` 里自成一条，带自己的时间戳。
- 每块的时间戳加上这一块的起点偏移，合成一份 `segments`，和字幕走同一套归档、证据索引。
- 不填 `--asr-language` 就自动识别语言；确定是哪种语言再填，比如 `zh`。

## 评论

优先用 WBI 接口：

- `https://api.bilibili.com/x/v2/reply/wbi/main`
- 参数通常包括 `type=1`、`oid=<AID>`、`mode=3`、`next=<cursor>`、`ps=20`、`web_location=1315875`，再加上签名得到的 `wts` 和 `w_rid`。
- WBI 图片密钥从 `https://api.bilibili.com/x/web-interface/nav` 获取。
- 使用标准的 mixin key 置换表：
  `[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52]`。

子评论：

- `https://api.bilibili.com/x/v2/reply/reply?type=1&oid=<AID>&root=<RPID>&pn=<N>&ps=20`

坑：`/x/v2/reply?type=1&oid=...` 可能报出完整的评论数，却只返回少数几条置顶或热门的主评论。用户要全部评论时，用 WBI main 接口。

## 图文 / 专栏动态

`https://www.bilibili.com/opus/<id>` 或 `/dynamic/<id>` 这类链接，优先解析公开页面的 HTML，不走 polymer 动态接口：

- 从 opus 页面解析 `window.__INITIAL_STATE__`。
- 正文在 `detail.modules[]` 下，重点是 `MODULE_TYPE_TITLE`、`MODULE_TYPE_AUTHOR`、`MODULE_TYPE_CONTENT`、`MODULE_TYPE_STAT` 和 `MODULE_TYPE_COPYRIGHT`。
- `MODULE_TYPE_CONTENT.module_content.paragraphs[]` 中已观察到的段落类型：
    - `para_type=1`：文本节点。
    - `para_type=2`：图片，在 `pic.pics[]` 下。
    - `para_type=5`：列表，在 `list.children[]` 下。
    - `para_type=6`：链接卡片。
    - `para_type=7`：代码块，在 `code.lang` 和 `code.content` 下。
    - `para_type=8`：标题。
- `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=<opus_id>` 可能返回 `-352` 之类的反爬错误，即使公开页面的 HTML 里有完整正文。

图文评论不要把 opus id 当 `oid` 用，而是读取：

- `detail.basic.comment_type` 作为评论接口的 `type`。
- `detail.basic.comment_id_str` 作为评论接口的 `oid`。

某个公开 opus 页面的例子：`comment_type=12`、`comment_id_str=48091857`。

## 字幕 / 转写稀疏时的处理

有字幕不等于完整理解了视频。归档后，把视频时长和字幕或转写的字数对比一下：

- 长视频的 `subtitle_chars_per_minute` 很低时，内容可能依赖 PPT、板书、代码编辑器、界面演示、产品画面或无解说的画面片段。
- 只凭稀疏字幕，不要写「完整提取」，也不要写成完整的学习笔记。
- 做详细整理之前，先用代表性的关键帧或截图，配合 OCR 或多模态视觉理解。
- 如果当前的模型或工具链不能看图，告诉用户这一高级步骤需要能看图的模型或人工查看，并把当前笔记标注为仅基于字幕、元数据和评论。

`metadata/note_budget.json.visual_dependency` 是把这条警告传给下游写作和评分步骤的标准位置。
