---
description: "自己开发的项目各带一份 wiki，本 wiki 当主 wiki 把它们收进项目板块：文档跟代码走、人读 HTML 而 AI 读 .md、文档里的实时数据浏览器和服务端各替换一次；主 wiki 没有后端所以 .md 不替换，nav 不自动生成而由 agent 手动吸纳"
---

# 子 wiki：项目自带文档，主 wiki 来收

自己开发的项目，文档写在项目自己的仓库里才跟得上代码；可是散在各个仓库里，人和 AI 都没有一个统一的入口。做法是每个项目带一份子 wiki，本 wiki 当主 wiki，把它们整个目录收进[项目](../index.md)板块。照着做的步骤在 skill [使用 wiki 管理项目开发](../../skills/subwiki/index.md)，这一页讲为什么这样定。

## 三个要求，各自怎么解

**人和 AI 都能读。** 和本 wiki 同一个办法：构建出 HTML 后，把 `docs/` 下的 `.md` 原样复制进产物，页面占 `/x/index.html`，`/x.md` 正好空着。子 wiki 由项目的服务进程自己挂在 `/wiki/` 下，不另起 nginx。

**文档里能嵌实时数据。** 文档里写 `{{ api("/api/stats").total_calls }}` 这样的占位符，读的时候换成接口当前的返回值。人读 HTML，浏览器里的脚本替换；AI 不执行 JavaScript，所以 `.md` 必须挂在服务后端上，返回前在进程内调用自己的接口替换一遍。两处规则要一致 —— 同一份用例文件，浏览器、Python、TypeScript 三个实现都要过。

**主 wiki 能收。** 主 wiki 把子 wiki 的 `docs/` 整个拷进 `projects/<目录名>/`。拷进来的页面里，占位符由浏览器跨域向子服务取数：子 wiki 在 `.meta.yml` 写一行接口地址，主 wiki 的模板只给这些页面引入脚本，别的页面不付代价。

## 接受的限制

- **主 wiki 上的 `.md` 不替换占位符**：主 wiki 是对象存储上的纯静态站，没有后端。AI 要实时值，去读子服务自己的 `/wiki/x.md`
- **拷进来的是快照**：子 wiki 改了，主 wiki 要重新吸纳一次才跟上

## 为什么手动吸纳

试过让主 wiki 自动接上子 wiki 的导航：Zensical 0.0.58 起支持 `awesome-nav`，子目录放一个 `.nav.yml` 就能管自己那段。实测可行 —— 把全站 nav 挪进 `docs/.nav.yml`，1388 页的产物逐字节相同。没用它，因为它一开就整体替换 `mkdocs.yml` 里的手写 nav，不能只让子 wiki 那一段用；全站的 nav 注册、check-links 都得跟着换地方。

本 wiki 收任何东西本来就是 agent 照 skill 手动做，子 wiki 只是多一种来源：拷目录、照子 wiki 自己的 nav 注册、在项目索引挂一行「自有：」钩子。漏了哪页，check-links 会报出来。
