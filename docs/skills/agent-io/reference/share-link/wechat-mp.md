---
description: "微信公众号：脚本 wechat_mp.py 一篇一个文件夹，正文转成 article.md、原图下到本地；文章页直接取，免费，页面没正文才退回 TikHub fetch_article_detail_h5；--account 传号名、gh_ 号或这个号的一篇文章链接，取最新 N 篇，底层是 TikHub fetch_account_articles 翻页，约 25 篇一页 0.01 美元；阅读、点赞、在看加 --stats，每篇 0.01 美元；TikHub 的公众号接口都是 POST JSON"
---

# 微信公众号

一篇文章直接取文章页：正文、号名、署名、发布时间、原图都在页面里，不花钱。一个号的最新几篇，先用 TikHub 翻出文章列表，再一篇篇取文章页。阅读量只有 TikHub 给。

## 脚本 { #script }

```bash
python3 scripts/wechat_mp.py <文章链接或整段分享文案>... --out <目录>
python3 scripts/wechat_mp.py --account <号名、gh_ 号或这个号的一篇文章链接> --limit 5 --out <目录>
```

- [`wechat_mp.py`](../../scripts/wechat_mp.py) 就是下面这套。文章链接认 `mp.weixin.qq.com/s/<短码>` 和带 `__biz` 的长链；长链要整条传，截掉 `chksm` 这些参数，页面只回「未知错误」
- **一篇文章免费**：页面没有正文时退回 TikHub，0.01 美元，`warnings` 里写着页面标题
- **文件夹**：`meta.json` 的 `kind` 是 `article`，视频、音频、贴图类的是 `video`、`audio`、`image`，正文照样取；`author` 里 `name` 是号名，`id` 是 `gh_` 号，`writer` 是文章署名。另有 `article.md`、`images/NN.<ext>`、`cover.jpg`，没有视频；`raw/page.json` 是从页面取到的字段和正文的原始 HTML
- **`article.md`**：标题、来源一行，下面是正文。图片换成本地路径；文中的视频、视频号卡片写成 `[视频]`、`[视频号视频]`；代码块保留换行，不带语言标记 —— 页面上的标记是编辑器猜的，shell 命令标成 `apache`
- **`--account`**：取这个号最新的 N 篇，`--limit` 默认 20。列表约 25 篇一页，每页 0.01 美元；重跑会重新翻列表，取过的文章跳过
- **按名字找号先搜一次**，0.01 美元：只认名字一字不差的，记进 `wechat_mp_accounts/accounts.json`，下次不再搜；对不上时 `error` 里列出搜到的前 5 个号和 `gh_` 号，挑一个重传
- **`--limit 0` 翻完整个号**：大号上百页，要加 `--yes`
- **`--stats`**：每篇另调一次 TikHub，0.01 美元，`stats` 里是 `read`、`like`、`wow`（在看）、`share`、`collect`、`comment`
- `--no-images` 不下图，`article.md` 里留原链接
- 一个号的文章隔一秒取一篇；文件夹格式和续跑见[解析分享链接](index.md#script)，`list.json` 见[作者主页](index.md#profile)

## 底层：文章页 { #page }

```bash
curl -sS -m 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" "<文章链接>"
```

- **不经中转，不用 key**，带浏览器的 User-Agent。页面 3 MB 左右，大半是脚本
- **字段在页面变量里**：`og:title` 是标题，`og:description` 是摘要；`var nickname = htmlDecode("…")` 是号名，`var user_name` 是 `gh_` 号，`var author` 是署名；`var create_time` 是秒级时间戳；`var msg_cdn_url` 是封面；`ip_wording` 里的 `province_name` 是 IP 属地；`var item_show_type` 是 0 的是文章
- **`biz`、`mid`、`idx` 拼起来是文章的唯一 ID**：页面写成 `var biz = "" || "MzA3…==";`，取第一个非空值
- **正文在 `id="js_content"` 的 div 里**，图片地址在 `data-src`，不在 `src`
- **原图把末段 `/640` 换成 `/0`**：`mmbiz.qpic.cn` 的 `/640` 最大给 1080 宽，`/0` 是原图，实测一张从 1080 宽变成 1610 宽。下图不用带 Referer

## 底层：TikHub { #tikhub }

照 TikHub 官方文档的路径调，只把 `https://api.tikhub.io` 换成 `https://tikhub-proxy.liuhetian.work`。公众号这组接口都是 POST JSON，不像小红书、抖音那样 GET：

```bash
curl -sS -m 60 https://tikhub-proxy.liuhetian.work/api/v1/wechat_mp/v2/fetch_account_articles \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"username": "<gh_ 号>", "offset": "", "raw": false}'
```

| 接口 | 传 | 看 |
|---|---|---|
| `wechat_search/v2/fetch_search` | `keyword`，`business_type` 传 `account` | 找号：`items[].title` 是号名，带 `<em>` 高亮；`items[].jumpInfo.userName` 是 `gh_` 号，`@finder` 结尾的是视频号 |
| `wechat_search/v2/fetch_search` | `keyword`，`business_type` 传 `article` | 搜文章：`items[].doc_url` 是链接，`source.title` 是号名，`source.tag` 里有「阅读 3万+」这类标签；`sort`、`publish_time` 可以按最新、最近一周筛 |
| `wechat_mp/v2/fetch_account_articles` | `username`、`offset` | 文章列表 `articles[]`：`title`、`digest`、`url`、`cover`、`create_time`、`idx`、`item_show_type`，没有阅读量 |
| `wechat_mp/v2/fetch_article_stats` | `url` | `read_num`、`like_count`、`old_like_count`（在看）、`share_count`、`collect_count`、`comment_count` |
| `wechat_mp/v2/fetch_article_detail_h5` | `url`、`raw: true` | `content.content_noencode` 是正文 HTML，`content` 下其余字段和文章页的变量同名 |

- **每次 0.01 美元**，返回什么都一样收
- **列表翻页**：第一页 `offset` 传空串，以后传上一页的 `next_offset`，直到 `is_end` 为 1。`page_size` 微信不认，一页几篇由号决定，实测 25、28 篇
- **超时设 30 秒以上**：文档说微信那边慢，超时短了会扣了钱收不到结果；实测 3～9 秒
- **64 位 ID 当字符串传**：`comment_id` 这类过 JavaScript 的 `Number` 会丢精度

视频号没接：视频文件是加密的，见[维护记录](../../../../maintenance/share-link.md#not-done)。
