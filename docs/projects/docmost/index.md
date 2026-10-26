---
description: "Docmost 粗讲：不是一个人用的在线记事本，是自托管的团队 wiki；主路径是每页一份 Yjs 文档，经 Hocuspocus 实时合并多人改动，停笔 10 秒连同 JSON 和纯文本一起落库；开源版模型不参与，AI 在闭源 ee 子模块；追问两条：不是 Office 套件，Bases 要付费、ppt 只有演示模式；和 git 仓库加 Zensical 比，差在谁来写、谁来读"
---

# Docmost：不是在线记事本，是多人同改的自托管团队 wiki

它不是一个人用的在线记事本，而是自托管的团队 wiki，对标 Confluence、Notion：space 里是页面树，按组和权限定谁能看、谁能改哪页。给想把文档留在自己服务器上、又要多人同改一页的团队用。

主路径是每页一份 Yjs 文档。浏览器里的 Tiptap 编辑器经 WebSocket 连到主服务里的 Hocuspocus，敲一个字发一段增量，几个人的改动由 CRDT 自动合并，只读的人拿到只读连接。停笔 10 秒才落库，一个事务里同时写 Yjs 二进制、Tiptap JSON 和给 Postgres 全文搜索用的纯文本。REST API 改正文也是改这份 Yjs 文档，不直接覆盖数据库。

合并、权限、历史快照、搜索归它；Postgres、Redis 和存附件的磁盘或 S3 由部署的人准备。开源版里模型不参与：AI 队列只有入队的代码，处理它的代码和 Confluence 导入等付费功能都在闭源的 ee 子模块里。

协作本身只有两千来行，改得最多的是编辑器 —— 图表、脚注、演示模式、多标签页这类节点一直在加[^repo]。

## 追问 { #qa }

### 只是一个共享wiki？那表格，doc，ppt呢 { #office }

是，核心就是 wiki，不是 Office 套件 —— 表格、文档、演示都长在「页面」上，没有单独的 Sheets、Slides 编辑器；xlsx、pptx 只能当附件存，打不开编辑。

doc 就是页面本身：Tiptap 富文本，带表格、脚注，能插 Draw.io、Excalidraw、Mermaid 图。开源版能导入 Markdown、HTML 和 Notion 导出的 zip，能导出 Markdown、HTML；Word 的导入导出、PDF 导入、Confluence 导入都是付费功能。

表格分两种。页面里插的 table 是富文本表格，没有公式，和 Markdown 表格一个级别。像样的那种叫 Bases，是 Airtable 式的数据库页：每列一个类型，数字、单选、人员、日期、formula 等十几种，一行一条记录；有表格和看板两种视图，能筛选、排序、导出 CSV，还能嵌进别的页面。它在页面树里是一个打了 `is_base` 标记的页面，行存在 Postgres 的 `base_rows` 表，改动走 WebSocket 订阅推送，不走 Yjs。Bases 的前端在 ee 目录、受 `Feature.BASES` 开关控制，后端在闭源子模块 —— 开源自建拿不到。

ppt 没有，只有演示模式：把一个页面当幻灯片放。遇到分隔线或一级标题就换页，一页放不下按高度自动挤到下一页，表格和 base 放完这页就结束。想做演示就照这个规则写一篇页面，不是拖文本框排版。

要多人同时改 Excel、PPT 文件，得另找在线 Office，比如 ONLYOFFICE、Collabora。

### 那和我直接用一个 github 仓库装markdown，配合 zensical 或者 mkdocs 方案(我现在在用的方案) 相比,有哪些差异? { #vs-git }

差在谁来写、谁来读。Docmost 是给一群不碰 git 的人同时写、登录后在站内看的；git 仓库加 Zensical 是一个人加 AI 写、人和 AI 都从公网读的 —— 源文件就是 markdown，AI 读写不经过任何中间层。

| | Docmost | git 仓库 + Zensical |
|---|---|---|
| 内容本体 | Postgres 里一行：Yjs 二进制 + Tiptap JSON + 纯文本，markdown 只是导出格式 | `.md` 文件就是本体，grep、编辑器、AI 直接读 |
| 怎么改 | 浏览器所见即所得，多人同页实时合并，不用懂 git | 编辑器或 AI 改文件再 commit、push；同时改靠 git 按行合并，冲突手解 |
| 历史 | 每页各留快照，编辑中约 5 分钟一张，能看能恢复；没有分支，跨页的一次改动不成一组 | commit 把跨文件的改动打成一组，有分支、diff、blame、revert |
| 谁能看 | 要登录，space 和组定读写，可分享单页或公开整个 space | 部署出去就全公开，不想公开的小字靠 age 密文打码 |
| 跑起来要什么 | 常驻 Node 服务 + Postgres + Redis + 附件存储，备份要备数据库 | 构建一次出静态文件放 COS，没有常驻进程，git 就是备份 |
| 能写什么 | 编辑器自带的块：图表、嵌入、评论、@提醒、关注通知；加新块要改它源码，前后端都得注册 | markdown 扩展加任意 HTML、JS：iframe demo、ECharts、React，模板用 overrides 改 |
| 给 AI 读写 | 页面在库里，AI 得走 REST API 或 MCP，API key 和 MCP 都在付费清单里；开源版能手动导出 Markdown | 每页有 `/x.md`，加上 `llms.txt`，AI 顺相对链接读，整站能当远程 skill |
| 搜索 | 服务端 Postgres 全文搜索，按英文分词；中文没有空格，一个分句算一个词，搜句子中间的词搜不中，只有标题搜索用 LIKE 不受影响 | 构建时出 `search.json`，在浏览器里搜 |

按现在的用法 —— 一个人写、AI 既写也读、页面里放自制 demo —— 现在的方案更合适。Docmost 值得换的情形只有两种：要让不会 git 的人一起改，或者要按人控制谁能看。

[^repo]: [docmost/docmost](https://github.com/docmost/docmost/tree/b007d8cb214e95fddda861eb15d24e51eb0b90b3)，读的是 commit `b007d8c`，2026-10-23 读。
