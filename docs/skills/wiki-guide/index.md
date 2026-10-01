---
description: "本 wiki 自己的写作规范：MkDocs 语法与站点规矩、怎么写课程伴读、怎么把外部 skill 收成远程 skill、怎么给不想公开的东西打码"
---

# 本 wiki 写作规范

往这个 wiki 里写东西之前先读这里。三篇各管一件事：

- [格式怎么写](mkdocs-wiki/index.md) —— 总规矩：Zensical / Material 语法、目录与 nav、AI 链路（父级索引挂载）、引用外部资料三步、iframe demo、吸收外部 skill 的归档规矩；另外两篇都是它的细化
- [课程页怎么写](course-page.md) —— 讲解在前、题在后的伴读：页面骨架、题目写成 git 冲突标记、答完才用 `scripts/course.py add` 归档进 `notes/`
- [skill 怎么收纳](remote-skill.md) —— 调用方分有 shell 和只能抓网页两种；上游脚本按「预算 / 查表 / 本地执行」三类处理，`MIRROR.md` 必写清单

## 如何加密 { #encrypt }

API key、服务器地址这类不想公开的东西，写进来时就得是密文。在仓库根目录跑：

```bash
bash scripts/age-seal.sh      # 输一行（不回显）→ 打印 age:…，贴进反引号里，行内代码和代码块里都认
bash scripts/age-seal.sh -a   # 粘贴多行、Ctrl-D 结束 → 打印 armor，放进 age 代码块
```

浏览器里它们显示成马赛克，点开输口令就地还原。加密只用公钥，不用输口令。规矩见[格式怎么写 · 打码](mkdocs-wiki/index.md#age-mosaic)，为什么这样做见[打码：key 和小字都以密文写进 wiki](../../posts/wiki-tech/age-mosaic.md)。
