---
description: "Agent 解析 B 站、小红书分享链接拿视频和图片直链：走国内中转 https://xiazaitool-proxy.liuhetian.work 的 GET /?url=，MY_API_KEY 写成 Authorization: Bearer；isVideo 为真下 videoUrls，为假下 pics；失败不扣次数，重试一两次"
---

# 解析分享链接

用下载狗（xiazaitool）把分享链接换成视频或图片的直链，走[中转](../../../posts/ai-assistant/api-gateway.md)的国内机。实测过 B 站视频、小红书视频和图文。

```bash
curl -sS -m 90 -G https://xiazaitool-proxy.liuhetian.work/ \
  -H "Authorization: Bearer $MY_API_KEY" \
  --data-urlencode "url=<分享链接>"
```

- **API key**：用 `.env` 里的 `MY_API_KEY`，别打印出来
- **只传链接**：先从分享文案里抽出 URL 再传，整段文案里的引号、换行会把中转拼的 JSON 弄坏。小红书传 `xhslink.cn` 短链就行
- **结果**：`status` 为 200 才算成功。`data.isVideo` 为真下 `data.videoUrls`，为假下 `data.pics`（图文笔记的全部图，按顺序）。`data.title` 是标题，`data.leftTimes` 是剩余次数
- **失败重试**：偶尔返回 500「解析失败」，同一链接重试一两次。失败不扣次数，成功一次扣一次
- **耗时**：B 站 0.5 秒左右，小红书几秒到十几秒，超时设一分钟以上
- **下载直链**：直接下，不经过中转。B 站带上 `Referer: https://www.bilibili.com/`

维护记录：[实测结果、没做的事](../../../posts/ai-assistant/maintenance/share-link.md)。正常使用不用看，解析出问题再看。
