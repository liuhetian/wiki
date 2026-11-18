---
description: "使用 wiki 管理项目开发的维护记录：规范来自 2026-11-17 的一次三站实验和一份内部手册里的项目文档写作规范；记录从实验改了什么、哪些自动化实测后没用"
---

# 使用 wiki 管理项目开发（subwiki）

[使用 wiki 管理项目开发](../../skills/subwiki/index.md)的维护记录。没有外部上游，两个来源都是自己的：

- **站点和动态数据**：2026-11-17 的实验工程 `26.11/test-wiki`，一个纯静态主 wiki 加 FastAPI、Hono 两个子服务，三条需求（人和 AI 双读、文档里嵌实时数据、主 wiki 收纳子 wiki）都跑通。[wiki 部署约定](../../skills/subwiki/index.md#site)、[动态数据](../../skills/subwiki/live.md)和 `scripts/` 下的六个文件取自它
- **项目文档**：自己写的一份内部手册里的「项目文档写作规范」，[给项目写文档](../../skills/subwiki/index.md#docs)照它收，流程一字未改，拆在[从已有项目整理文档](../../skills/subwiki/from-existing.md)

## 从来源改了什么 { #changes }

- **源目录从 `.wiki/` 改成 `docs/`**：六个文件平铺在 `docs/` 根下。实验里它们在 `docs/project/` 子目录，内部手册里在 `.wiki/`
- **「挂到新人手册」一节换成吸纳**：那边用逐文件软链接挂载，本 wiki 入库、上对象存储，改成整目录拷贝
- **主 wiki 不再生成配置**：实验的 `build_main.py` 每次重新生成主 wiki 的 `zensical.toml`；本 wiki 的 nav 是手写的，改成 agent 照[吸纳子 wiki](../../skills/subwiki/absorb.md)手动注册
- **`live.js` 去掉按路径前缀选后端**：实验里主 wiki 页头列出所有子服务的地址、按当前路径挑；现在子 wiki 在 `.meta.yml` 写 `api_base`，主 wiki 只给这些页面输出一个地址
- **脚本只改了注释和路径**：`placeholders.py`、`md-render.ts`、`postbuild.py`、`placeholder_cases.json` 的逻辑没动；`deploy.sh` 的共享件位置从 `../shared/` 改成 `wiki-tools/`，rsync 加了跳过点开头目录

- **入口从四选一改成两节必做加两页可选**：第一版按做到哪一档拆成项目文档、自己建站、动态数据、吸纳四页，名字叫「子 wiki」，挂在「建站与部署」。同一天用户说「我想移动到 写代码里， 名字也要改，改成 使用wiki管理项目开发， 然后给项目写文档，让项目自己有wiki 这两个部分都是必选的，所以直接放在index.md，嵌入实时数据和吸纳子wiki可以作为可选」。两页并进入口，旧网址由 `redirects` 指到对应的节；目录名没改
- **固定文件加了 `requirements.md`**：来源里只有六个。吸纳牛牛便利贴时用户说「REQUIREMENTS.md 这个文件非常重要，我就是通过这个来管控整体项目的」，于是加成第七个，排在入口之后；「改功能先改它、以它为准、已有的整份挪进来」是我照这句话写的，没有逐条确认过
- **板块精简**：同一天用户逐条改的 —— 引言压成一句；流程只在整理已有项目时用，拆成子页；`status` 并进 `index.md` 的现状一节（「都是快照」）；`todo` 改成长期有效，人只维护 `requirements`；时间线写法只留四列加一行例子；「更新已有的文档」一节删掉；建站一节改叫「wiki 部署约定」

## 实测 { #tests }

- **2026-11-17**：Python 版占位符渲染过共享用例 10 条全过。把实验的计算服务临时拷进 `projects/` 并在 `.meta.yml` 写了 `api_base`，构建后它的 17 页都输出了接口地址、引入了 `live.js`，别的页面一页没有；check-links 报出它没注册 nav、入口缺 `copy_source`，闸门照常管用。验完撤掉，没有留在站里。浏览器里取数没有在本站验，只在实验工程里验过
- **`awesome-nav` 能用但没用**：把 `mkdocs.yml` 的 nav 原样挪进 `docs/.nav.yml`，全站 1388 页的产物逐字节相同，子目录自带的 `.nav.yml` 能接管自己那段。但它一开就整体替换手写 nav，check-links 的注册检查、写作流程都要跟着改，没采用
