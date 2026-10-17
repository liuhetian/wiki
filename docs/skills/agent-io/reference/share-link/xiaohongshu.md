---
description: "小红书笔记：脚本 xiaohongshu.py 一条一个文件夹；底层是 TikHub get_image_note_detail 一次拿正文、作者、点赞收藏和全部原图，经中转 https://tikhub-proxy.liuhetian.work，只传 note_id；原图把 format/webp 换成 format/jpg；真视频另调下载狗拿视频；轮播视频和真视频怎么分"
---

# 小红书

一条笔记先调 TikHub，正文、作者、点赞收藏和全部原图一次拿齐；只有真视频再调[下载狗](index.md#xiazaitool)拿视频。

## 脚本 { #script }

```bash
python3 scripts/xiaohongshu.py <链接或整段分享文案>... --out <目录>
```

- [`xiaohongshu.py`](../../scripts/xiaohongshu.py) 就是下面这套：图文、轮播视频给原图，真视频另给封面和视频
- 一条 0.01 美元，真视频另加 0.005 元
- TikHub 失败时退回下载狗，只剩标题和媒体，`warnings` 里会写
- 文件夹格式、共用参数和续跑见[解析分享链接](index.md#script)

## 底层：TikHub 拿正文、作者、原图 { #tikhub }

照 TikHub 官方文档的路径调，只把 `https://api.tikhub.io` 换成 `https://tikhub-proxy.liuhetian.work`：

```bash
curl -sS -m 60 -G https://tikhub-proxy.liuhetian.work/api/v1/xiaohongshu/app_v2/get_image_note_detail \
  -H "Authorization: Bearer $MY_API_KEY" --data-urlencode "note_id=<笔记 ID>"
```

- **笔记 ID**：链接里 `/item/` 或 `/explore/` 后面那串 24 位十六进制，只传它，不用 xsec_token。只有 `xhslink` 短链时，文档说可以改传 `share_text=<短链>`，没实测
- **字段**：笔记在 `data.data[0].note_list[0]`。`title`、`desc` 是标题和正文；`user.nickname` 是作者，`user.red_id` 是小红书号；`liked_count`、`collected_count`、`comments_count`、`shared_count` 是赞、藏、评、转；`time` 是秒级时间戳；`hash_tag[].name` 是全部话题（`topics` 只有一个）；`ip_location` 是 IP 属地
- **原图**：`images_list[].original`，原尺寸 WebP，直接下，不用带 Referer。把链接里的 `format/webp` 换成 `format/jpg` 就直接拿到 JPEG，签名不管这一段
- **一次 0.01 美元**

## 底层：图文、轮播视频、真视频怎么分 { #kinds }

`type` 是 `normal` 的是图文。`type` 是 `video` 的有两种，字段上分不出，要看 `images_list`：

| 情况 | `images_list` | 视频怎么拿 |
|---|---|---|
| 真视频 | 只有 1 张，地址在 `spectrum/` 下，那张是封面 | 调[下载狗](index.md#xiazaitool)，720p 左右 |
| 轮播视频：小红书拿一组图拼成的 | 多张，地址在 `notes_pre_post/` 下，就是原图 | 不用拿，原图已经全在这里；下载狗只给 720×960 的拼接视频 |

这是 2026-10-17 拿 6 条笔记比出来的，不是文档写的。

## 底层：别用下载狗取这些 { #xiazaitool-gaps }

- 下载狗给小红书只回标题和媒体：正文、作者是空的，点赞收藏是 0
- 个别图文给的图片直链全是 404：图实际在 `oss-sg/notes/` 下，下载狗拼成了 `sns-img-hw.xhscdn.com/notes/…`
- 传短链时封面是空的
