---
description: "YouTube 视频：脚本 youtube.py 一条一个文件夹，正文、频道、播放点赞评论、章节和一条字幕，不下视频和封面；底层是 TikHub get_video_info_v2 拿元数据，偶尔返回 LOGIN_REQUIRED 要重调，get_video_captions 由 TikHub 直接返回字幕原文，经中转 https://tikhub-proxy.liuhetian.work；视频直链绑着 TikHub 自己的出口 IP，还没接"
---

# YouTube

元数据和字幕都走 TikHub，字幕原文也由 TikHub 直接返回，不连 YouTube。视频还下不了，见[视频](#video)。

## 脚本 { #script }

```bash
python3 scripts/youtube.py <链接>... --out <目录>
```

- [`youtube.py`](../../scripts/youtube.py) 就是下面这套。认 `watch?v=`、`youtu.be/`、`/shorts/`、`/live/`、`/embed/` 几种链接，文件夹名用 11 位视频 ID，同一个视频换种写法也落进同一个文件夹
- 一条 0.009 美元：详情 0.001 美元，字幕一条 0.008 美元
- **字幕默认只取一条**：取说话那种语言的，有人工字幕取人工的，没有就取自动生成的（`kind` 是 `asr`）。`--subs ja,en` 指定语言，每条 0.008 美元；`--subs none` 不取
- **没有视频和封面**：`video_read.py` 读不了这种文件夹，直接读 `subtitles/p01_<语言>.txt`。自动字幕会听错专有名词，又没有画面可以核对，拿标题、简介和标签核对
- `parts[0].time_url` 后面接上秒数，就是从那一秒开始播的链接
- 文件夹格式、共用参数和续跑见[解析分享链接](index.md#script)

## 底层：TikHub 拿正文、频道、播放点赞 { #tikhub }

照 TikHub 官方文档的路径调，只把 `https://api.tikhub.io` 换成 `https://tikhub-proxy.liuhetian.work`：

```bash
curl -sS -m 60 -G https://tikhub-proxy.liuhetian.work/api/v1/youtube/web_v2/get_video_info_v2 \
  -H "Authorization: Bearer $MY_API_KEY" -d video_id=<11 位视频 ID>
```

- **先看 `data.playability_status`**：`OK` 才是全的。偶尔返回 `LOGIN_REQUIRED`，照样扣钱：标题、频道还在，`length_seconds`、`view_count`、`like_count`、`captions` 都是空的。重调一次一般就好，脚本最多调三次
- **字段**：`title`；`description`，里面的外链被换成「/ 账号名」；`author` 是频道名，`channel_handle` 是 `@` 开头的账号，另有 `channel_id`；`view_count`、`like_count`、`comment_count` 是字符串；`length_seconds` 是秒；`publish_date` 带时区；`keywords` 是标签；`chapters` 是章节
- **`captions[]` 是字幕轨**：每条有 `language_code`、`language_name`、`kind`，`kind` 是 `asr` 的是自动生成的
- **0.001 美元一次**

## 底层：字幕 { #captions }

```bash
curl -sS -m 180 -G https://tikhub-proxy.liuhetian.work/api/v1/youtube/web_v2/get_video_captions \
  -H "Authorization: Bearer $MY_API_KEY" \
  -d video_id=<视频 ID> -d language_code=<语言> -d format=srt
```

- **`language_code` 从详情的 `captions[]` 里挑**：不传就只返回语言列表，也扣 0.008 美元，而且不标哪条是自动生成的
- **字幕全文在 `data.content`**；`format` 还可以是 `txt`、`xml`、`json3`
- **长视频会转成异步任务**：这时返回 `status` 是 `processing`，另带一个 `job_id`；隔几秒调一次 `get_video_captions_result?job_id=<…>&format=srt`，免费，等到 `status` 变成 `completed`
- **0.008 美元一次**，没字幕的视频照样扣

## 底层：视频 { #video }

还没接。TikHub 给的直链绑着取链接时的出口 IP，换个出口下载会被拒：

- `get_video_streams_v2` 一次给全部清晰度，签的是 TikHub 自己的出口 IP，别拿它的直链下
- `get_video_streams_v3` 要在请求里带一个有固定公网出口的 HTTP 代理，取链接和下载都走它；我们还没有这样的代理

维护记录：[为什么用 TikHub、直链怎么绑的 IP、实测结果、没做的事](../../../../maintenance/share-link.md#youtube)。
