---
description: "B 站：脚本 bilibili.py 一条一个文件夹，分P、字幕、评论、图文都管；底层是公开的 view、player 接口拿元数据、分P和字幕（多半要登录才给），视频每P经下载狗拿直链，评论走 WBI 签名接口；图文动态读公开页面的 __INITIAL_STATE__；b23.tv 短链先跟一次跳转；都直连 B 站，不用 key"
---

# B 站

B 站的公开接口直连就能用，不经中转、不用 key，只有视频直链靠[下载狗](index.md#xiazaitool)。请求都带仿浏览器的 `User-Agent` 和 `Referer: https://www.bilibili.com/`。

## 脚本 { #script }

```bash
python3 scripts/bilibili.py <链接或整段分享文案>... --out <目录> [--parts 1,3-5] [--comments]
```

- [`bilibili.py`](../../scripts/bilibili.py) 就是下面这套：视频、图文动态、`b23.tv` 短链都认
- `--parts`：只取这几P，默认全取。多P的长课先 `--no-video` 跑一次看分P，再挑
- `--comments`：取评论和楼中楼，对这次传入的所有链接都生效，只要其中几条的评论就分两次跑
- 每P视频 0.005 元，元数据、字幕、评论、图文不花钱
- 字幕要登录才给时 `warnings` 会提示，改走[阅读视频](../read-video.md)转写
- 文件夹格式、共用参数和续跑见[解析分享链接](index.md#script)

## 底层：链接 { #links }

- **`b23.tv` 短链**：App 分享出来的短链不带 BV 号，也不带图文 ID；先跟一次跳转，读 `Location` 头拿到完整链接
- **BV 号**：链接里 `BV` 开头的 12 位；图文、动态的 ID 在 `/opus/<数字>`、`/dynamic/<数字>` 或 `t.bilibili.com/<数字>`

## 底层：视频 { #video }

### 元数据和分P

`https://api.bilibili.com/x/web-interface/view?bvid=<BV号>`

- `code` 为 0 才算成功，内容在 `data`
- `title`、`desc` 是标题和简介；`owner.name` 是 UP 主；`pubdate` 是秒级时间戳；`duration` 是总秒数；`pic` 是封面
- `stat` 里 `like`、`favorite`、`reply`、`share`、`view`、`coin`、`danmaku` 是赞、藏、评、转、播放、投币、弹幕
- `aid` 是评论接口要的 `oid`
- `pages[]` 每P一条：`page`、`cid`、`part`（分P标题）、`duration`

### 字幕

`https://api.bilibili.com/x/player/v2?bvid=<BV号>&cid=<这一P的 cid>`

- 字幕轨在 `data.subtitle.subtitles[]`，`subtitle_url` 指向一个 JSON，`body[]` 每条有 `from`、`to`（秒）和 `content`
- **多半要登录才给**：`need_login_subtitle` 为真、字幕轨为空，就是只给登录用户；只列出 `ai-zh`、`subtitle_url` 为空，是 AI 字幕要登录才给地址。2026-10-17 试了 7 个视频，匿名一条字幕都没拿到。本站不走登录态，拿不到就改走[转录音频](../transcribe.md)

### 视频

- 每P单独交给[下载狗](index.md#xiazaitool)：第 1 P 传 `https://www.bilibili.com/video/<BV号>/`，其余加 `?p=<N>`。每P扣一次额度
- `videoUrls` 多半是一个字符串，有时是数组（取第一个），是音视频合一的 mp4；直链路径里带这一P的 `cid`，可以核对没拿错P
- 下载时带 `Referer: https://www.bilibili.com/`

### 评论

用 WBI 签名的主评论接口，不签名的 `/x/v2/reply?type=1&oid=…` 报出完整评论数，却只返回几条置顶、热门的：

```text
https://api.bilibili.com/x/v2/reply/wbi/main
  ?type=1&oid=<aid>&mode=3&next=<游标>&ps=20&web_location=1315875&wts=<秒级时间戳>&w_rid=<签名>
```

- **签名**：先请求 `https://api.bilibili.com/x/web-interface/nav`，没登录会回 `code -101`，但 `data.wbi_img` 里的 `img_url`、`sub_url` 照样给。两个文件名（不含扩展名）拼起来，按下面的置换表取字符、截前 32 位，得到 mixin key。参数加上 `wts`，按键名排序，值里去掉 `!'()*`，URL 编码后接上 mixin key，取 MD5 就是 `w_rid`
- **置换表**：`[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52]`
- **翻页**：`data.cursor.is_end` 为真就停，否则把 `cursor.next` 当下一次的 `next`。主评论在 `data.replies`，置顶在 `data.top_replies` 和 `data.top`
- **楼中楼**：`https://api.bilibili.com/x/v2/reply/reply?type=1&oid=<aid>&root=<主评论 rpid>&pn=<页码>&ps=20`，不用签名；主评论的 `rcount` 是楼中楼条数

## 底层：图文动态 { #opus }

读公开页面 `https://www.bilibili.com/opus/<ID>` 里的 `window.__INITIAL_STATE__=` 后面那个 JSON 对象，不走 polymer 动态接口：`/x/polymer/web-dynamic/v1/detail?id=<ID>` 匿名调常回 `-352` 风控，页面里却有完整正文。

- 内容在 `detail.modules[]`，按 `module_type` 取：`MODULE_TYPE_TITLE` 标题、`MODULE_TYPE_AUTHOR` 作者（`name`、`mid`、`pub_ts`）、`MODULE_TYPE_CONTENT` 正文、`MODULE_TYPE_STAT` 统计（`like`、`favorite`、`comment`、`forward`、`coin` 下面各有 `count`）
- 正文在 `module_content.paragraphs[]`，按 `para_type` 分：1 文字、2 图片（`pic.pics[].url`）、5 列表（`list.children[]`，`list.style` 为 1 是有序）、6 链接卡片、7 代码块（`code.lang`、`code.content`）、8 标题（`heading.level`）。文字都在 `nodes[].word.words` 或 `nodes[].rich.text` 里
- **评论**：不能拿图文 ID 当 `oid`、`type=1`。用 `detail.basic.comment_type` 当 `type`，`detail.basic.comment_id_str` 当 `oid`，接口同上；见过的一条是 `type=12`
- 图片下载带 B 站 `Referer`
