---
description: "抖音作品：脚本 douyin.py 一条一个文件夹；底层是 TikHub get_aweme_id 把分享链接换成作品 ID，fetch_one_video_v3 拿正文、作者、点赞收藏和播放地址，经中转 https://tikhub-proxy.liuhetian.work；视频走下载狗拿原画，失败时从 TikHub 的播放地址里挑最大的一档"
---

# 抖音

元数据走 TikHub 两步，视频走[下载狗](index.md#xiazaitool)。

## 脚本 { #script }

```bash
python3 scripts/douyin.py <链接或整段分享文案>... --out <目录>
```

- [`douyin.py`](../../scripts/douyin.py) 就是下面这套；链接里已经有作品 ID 就省掉换 ID 那一步
- 一条 0.002 美元加 0.005 元
- 下载狗解析不了时，视频退回 TikHub 播放地址里最大的一档，`warnings` 里会写分辨率
- 文件夹格式、共用参数和续跑见[解析分享链接](index.md#script)

## 底层：TikHub 拿正文、作者、点赞收藏 { #tikhub }

照 TikHub 官方文档的路径调，只把 `https://api.tikhub.io` 换成 `https://tikhub-proxy.liuhetian.work`：

```bash
# 1. 分享链接换作品 ID；链接里已经有 /video/<数字> 就直接截出来，跳过这步
curl -sS -m 60 -G https://tikhub-proxy.liuhetian.work/api/v1/douyin/web/get_aweme_id \
  -H "Authorization: Bearer $MY_API_KEY" --data-urlencode "url=<分享链接>"

# 2. 取作品数据
curl -sS -m 60 -G https://tikhub-proxy.liuhetian.work/api/v1/douyin/app/v3/fetch_one_video_v3 \
  -H "Authorization: Bearer $MY_API_KEY" --data-urlencode "aweme_id=<作品 ID>"
```

- **第 1 步**：返回的 `data` 就是作品 ID
- **第 2 步**：看 `data.aweme_detail`。`desc` 是正文，话题也在里面，单独的话题在 `text_extra[].hashtag_name`；`author.nickname` 是作者；`statistics` 里的 `digg_count`、`comment_count`、`collect_count`、`share_count` 是赞、评、藏、转，播放数抖音不公开，是 0；`create_time` 是秒级时间戳；`duration` 是毫秒；`video.origin_cover.url_list[0]` 是封面
- **两步各 0.001 美元**

## 底层：视频 { #video }

- **默认走下载狗**：给的是原画，同一条 45 秒的视频是 2160×2880 的 HEVC，4.7 MB；直链一小时左右过期，解析完马上下
- **下载狗解析不了时**：从 TikHub 已经返回的播放地址里挑。地址在 `video` 的 `play_addr`、`play_addr_h264`、`play_addr_265` 和 `bit_rate[].play_addr` 里，各档每次调用都不一样：同一条视频，早上最高 1080×1440，下午最高 720×960，按宽高挑最大的
- **要 TikHub 的原画**：另调 `/api/v1/douyin/app/v3/fetch_video_high_quality_play_url?aweme_id=<作品 ID>&region=CN`，0.005 美元一次，给的是一百多 MB 的 H.264，比下载狗的大二十多倍
- **图文作品**：`aweme_detail.images[].url_list[0]` 按理是原图，没测
