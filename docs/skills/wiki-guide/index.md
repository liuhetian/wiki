---
description: "本 wiki 自己的写作规范：MkDocs 语法与站点规矩、怎么写课程伴读、怎么把外部 skill 收成远程 skill"
---

# 本 wiki 写作规范

往这个 wiki 里写东西之前先读这里。三篇各管一件事，外加一个测试探针：

- [格式怎么写](mkdocs-wiki/index.md) —— 总规矩：Zensical / Material 语法、目录与 nav、AI 链路（父级索引挂载）、引用外部资料三步、iframe demo、吸收外部 skill 的归档规矩；另外两篇都是它的细化
- [课程页怎么写](course-page.md) —— 讲解在前、题在后的伴读：页面骨架、题目写成 git 冲突标记、答完才用 `scripts/course.py add` 归档进 `notes/`
- [skill 怎么收纳](remote-skill.md) —— 调用方分有 shell 和只能抓网页两种；上游脚本按「预算 / 查表 / 本地执行」三类处理，`MIRROR.md` 必写清单
- [远程 skill 探针](remote-skill-probe/index.md) —— 测试用：一个脚本 + 一张 CSV，验证客户端 AI 会不会自己下载到本地、保持目录结构后运行
