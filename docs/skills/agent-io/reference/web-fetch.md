---
description: "Agent 读取网页：DeepSeek 官方 Fetch 接口，走国内中转 https://deepseek-proxy.liuhetian.work/v1/tools/fetch，给 URL 返回标题和 Markdown 正文，一次 0.005 元、6 到 11 秒；标点全带反斜杠转义，链接和大部分代码块会丢，读新闻文章好用，技术文档换别的路；知乎、PDF 取不到"
---

# 读取网页

给一个 URL，返回网页标题和 Markdown 正文。用 DeepSeek 官方的 Fetch 接口，走中转的国内机，照 DeepSeek 官方 API 文档[^fetch]调，只改两处：

- **base URL**：`https://api.deepseek.com` 换成 `https://deepseek-proxy.liuhetian.work`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
curl -sS https://deepseek-proxy.liuhetian.work/v1/tools/fetch \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"url": "<网页地址>"}'
```

- **结果**：只有 `title` 和 `content` 两个字段。`content` 里的标点全带反斜杠转义（`\#`、`\-`、`\.`），读之前先用 `re.sub(r"\\([^\w\s])", r"\1", content)` 去掉
- **会丢的**：链接全部去掉；行内代码前后的空格被吃掉，`with uv run` 变成 `withuv run`；代码块大多整块丢掉。新闻、文章的正文是全的，开头可能混进「Skip to content」、导航菜单，末尾混进统计代码
- **技术文档别用它**：要看代码就直接 curl 原始文件，GitHub 上的文件用 raw 地址
- **取不到**：知乎、PDF、打不开的页面都返回 404 `not_found_error`，不收钱。PDF 下载下来走[阅读 PDF](pdf.md)
- **耗时**：第一次 6 到 11 秒，同一个 URL 再取 0.25 秒。超时设 30 秒以上
- **价钱**：取到正文的一次 0.005 元。账号限速每秒 5 次，同一个网站另有限速，超了返回 429，等一会儿再重试

维护记录：[接口从哪来、实测结果](../../../maintenance/web-search.md#deepseek)。正常使用不用看，抓取出问题再看。

[^fetch]: [DeepSeek 官方 API 文档](https://api-docs.deepseek.com/zh-cn/api/fetch)，2026-10-18 读。
