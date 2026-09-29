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

## 音频

- `https://api.bilibili.com/x/player/playurl?bvid=<BVID>&cid=<CID>&qn=16&fnval=16&fourk=1`
- 取 `data.dash.audio`，选 `bandwidth` 最高的一条，下载它的 `baseUrl`。
- 用 `ffmpeg -i audio.m4s -ar 16000 -ac 1 audio.wav` 转换。

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

## 本地转写

示例命令：

```powershell
python "<skill>\scripts\extract_bilibili.py" "<BVID>" --out "<tmp>" --parts "2,20,22,23" --download-audio --transcribe --whisper-site-packages "<python-site-packages>"
```

图快用 `base` 规格的 Whisper 模型。只有第一遍转写噪声太大、而且任务值得多花时间时，才换更大的模型。

## 字幕 / 转写稀疏时的处理

有字幕不等于完整理解了视频。归档后，把视频时长和字幕或 ASR 的字数对比一下：

- 长视频的 `subtitle_chars_per_minute` 很低时，内容可能依赖 PPT、板书、代码编辑器、界面演示、产品画面或无解说的画面片段。
- 只凭稀疏字幕，不要写「完整提取」，也不要写成完整的学习笔记。
- 做详细整理之前，先用代表性的关键帧或截图，配合 OCR 或多模态视觉理解。
- 如果当前的模型或工具链不能看图，告诉用户这一高级步骤需要能看图的模型或人工查看，并把当前笔记标注为仅基于字幕、元数据和评论。

`metadata/note_budget.json.visual_dependency` 是把这条警告传给下游写作和评分步骤的标准位置。
