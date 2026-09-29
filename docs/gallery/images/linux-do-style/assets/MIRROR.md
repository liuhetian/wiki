# 《通用焚决千篇一律，特殊风格万里挑一》来源与存档说明

本目录存档 linux.do 帖子 [通用焚决千篇一律，特殊风格万里挑一 | 一些非大流二次元向自用Prompt合集 | 一些自制焚决的思路](https://linux.do/t/topic/2044964) 的 23 张配图和主楼附件，上游帖子改了或删了也能对照。主楼正文按原帖结构排在 [gallery 页](../gallery-anime-graphic-design.md)，那一页本身就是正文的存档，所以本目录不再另存一份原文。

## 来源

| 项 | 值 |
|---|---|
| 帖子 | <https://linux.do/t/topic/2044964>（「搞七捻三」分类，标签：纯水、人工智能、ChatGPT、动漫、原创、chatgpt-image2、文生图） |
| 作者 | @sallyn |
| 发帖时间 | 2026-04-24（之后作者编辑过，把第 13 楼的新版反推提示词并进了主楼） |
| 抓取日期 | 2026-09-28 |
| 抓取方式 | Discourse 的 `https://linux.do/t/topic/2044964.json`，取主楼 `cooked` HTML，用 pandoc 转成 gfm |
| 本地存档 | 原帖全文 → [original-post.md](original-post.md)（按原帖结构排版）；[gallery 页](../gallery-anime-graphic-design.md) 只取其中 12 组「图 + prompt」；本目录另放 23 张原图（lightbox 原尺寸）+ [SKILL.md](SKILL.md)（主楼附件） |
| 附件获取 | 游客下载返回 404，2026-09-28 由仓库作者登录后手动下载；原附件名 `SKILL.txt`，存档时扩展名改成 `.md`，让它按 markdown 渲染，也方便 AI 按 skill 读取 |

## 存档时做了哪些改动

2026-09-29 起 gallery 页改成纯净形态：页名改为「二次元平面设计风格」，文件名按图库统一命名为 `gallery-anime-graphic-design.md`（原 `index.md`，旧地址已加跳转），只留 12 组的标题、两张测试图和 prompt；原帖旁白、提示框、小红书数据截图、「写在前面」「怎样写出自己想要的没有的风格」「题外话」三节，都移进 [original-post.md](original-post.md)。以下是原帖正文存档时的改动，文字和 prompt 一个字没改：

- prompt 从缩进代码块改成 `{.text .wrap}` 围栏：带复制按钮，长行自动换行
- 「测试用例1 | 测试用例2」的图片表格改成两图并排的 `gallery-pair`，原图的 alt（多为 `image`）换成「风格名 · 测试用例 N」
- 原帖 Obsidian 风格的 `> [!attention]` / `> [!success]` / `> [!fail]-` 提示框（linux.do 本身没渲染）换成本站的 `!!!` / `???` 提示框，标题文字不变
- 图片链接从 `cdn3.ldstatic.com` 改成本地文件；原图文件名是哈希，按「序号-风格名-第几张」重新命名，序号跟风格出现的顺序一致
- 附件链接从站内相对地址 `/uploads/short-url/blBNJ7DvTIoXdDMOCHH4Xm1laPD.txt` 改成指向本地的 [SKILL.md](SKILL.md)，链接文字 `SKILL.txt` 保持原样
- 「题外话」一节引用框上方的作者头像图删掉了；Discourse 给标题自动加的锚点 `<a name="p-…">` 也去掉了
- 删除线 `~~…~~` 改成 `<del>`（本站没开 tilde 扩展，否则波浪号会原样露出来）

## 没存档的内容

- **第 21–116 楼**：分页接口 `posts.json` 被 Cloudflare 质询拦住（403），没有抓到
- **前 20 楼里的回复**：没有存档原文。第 6 楼作者还贴了一组电影海报的风格迁移对比（原作是《猫鼠游戏》海报），原作海报有版权，没有下载。第 18 楼讲怎么把 prompt 包装成能过审核的样子，涉及绕过平台审核，不收

## 上游改了怎么办

1. 重新抓 `.json`，把主楼 `cooked` 转成 markdown，跟 [gallery 页](../gallery-anime-graphic-design.md) 的正文做 diff（排版差异按上一节的规则忽略）
2. 如果内容有改动，按上一节的规则同步进 [gallery 页](../gallery-anime-graphic-design.md)，替换有变化的配图，更新本页的抓取日期
