---
description: "docs/courses/ 下的页面是带空白的题，不是教程。一课由三样东西组成：一个把事故现场造出来的 init.sh、一份验收清单、一组写成 git 冲突标记形状的提问。答案不写在课程页里 —— 它写进 docs/notes/ 的同名文件，答完才归档"
---

# 课程页怎么写

- [课程页是什么](#what)
- [页面骨架](#skeleton)
- [提问块的精确语法](#conflict-syntax)
- [题该怎么出](#how-to-ask)
- [环境脚本的硬规矩](#init-rules)
- [三处解析规则必须同步](#three-parsers)
- [新增一课的完整流程](#new-lesson)

## 课程页是什么 { #what }

`docs/courses/` 下的页面是**带空白的题**，不是教程。一课由三样东西组成：一个把事故现场造出来的 `init.sh`、一份验收清单、一组写成 git 冲突标记形状的提问。答案不写在课程页里 —— 它写进 `docs/notes/` 的同名文件，答完才归档。

板块本身的设计说明在 [`docs/courses/index.md`](../../../../courses/index.md)，那一页同时就是 AI 抓到站点后的上课说明。这里只讲**写一课时的规矩**。

## 页面骨架 { #skeleton }

六个部分，顺序固定，缺一不可：

```markdown
# <结论式标题，说清这一课教的是什么，不讲剧情>

> 目标：<一句话>。原关卡 `<id>`。

## 场景        ← 现场已经发生过什么。用「你」和「同事」，不出现具体人名
## 搭环境      ← 一条 bash 命令 + `??? abstract` 折叠 --8<-- 引 init.sh 真身
## 任务        ← 要达成什么，不说怎么做
## 验收        ← 可执行的检查项，每条都能用一条命令核对
## 提问        ← 若干 ```conflict 块
```

「任务」和「验收」必须分开：任务说目标，验收说**怎么证明达到了**。验收每一条都要是能跑的（`git status` 干净、某文件含某行、`git log --graph` 里能看到合并提交），不能写成「正确地解决了冲突」这种没法核对的话。

`## 搭环境` 那段的措辞全站统一（环境位置、`COURSE_ROOT`、重跑即重置、不碰 `~/.gitconfig`），由 `courses-src/build-pages.py` 统一生成，不要逐页手写。

## 提问块的精确语法 { #conflict-syntax }

````markdown
```conflict
<<<<<<< courses/git/<slug>
Q3 两边各加了什么
上下两半分别新增了哪些调用？哪一个调用是两边都加了的？
=======
>>>>>>> notes
```
````

硬规矩：

- **三种标记各占一整行**：`<<<<<<< <标签>`、`=======`、`>>>>>>> notes`。这是三处解析器共同的判据，多一个空格无所谓，写成半行就解析不到。
- **上半区第一行是题头**，格式 `Q<n> <短标题>`；其余行是题干。
- **下半区留空**。课程页的答案区永远是空的 —— 一课可以被反复做，也可以直接交给别人或别的 agent。
- **题干里不写 `**` 强调**：fence 里 markdown 不生效，写了只会以字面量出现在页面上。行内反引号保留 —— 归档后题干进 `!!! question`，那里反引号会正常渲染成行内码。
- **每课末尾固定三题**，短标题精确为 `一句话`、`心智模型`、`坑`。归档时这三题成为笔记的三个小节，其余题归入 `## 操作` —— 结果正好是 `notes/` 的骨架 **场景 → 一句话 → 心智模型 → 操作 → 坑**。改这三个词等于改承诺，要同时改 `scripts/course.py` 的 `SECTIONS` 和 `courses/index.md`。

## 题该怎么出 { #how-to-ask }

**判据只有一条：不跑代码答不出来。** 靠读文档能编出来的题一道都不要出 —— 那道题就没有在验证任何东西。

可靠的出题形状：

- 贴原文：冲突 hunk 的完整内容、`git status` 的原始输出、`git log --oneline --graph --all --decorate` 的图
- 指认具体对象：那条 merge commit 的两个 parent 分别是谁、某个 blob 的 hash、`.git/HEAD` 里写着什么
- 做一次对照实验：「另外克隆一份、什么参数都不带，对比两份的 X」「故意用错的顺序试一次，把 git 的报错贴出来，然后 abort 掉重来」
- 说出差别：「与『起点』那题相比变了哪些地方」

不要出的题：「什么是三方合并」「rebase 和 merge 有什么区别」—— 这类概念题只有落到本课的具体现场上才有价值，比如「这次冲突里 base 是哪条提交」。

## 环境脚本的硬规矩 { #init-rules }

真身放 `docs/courses/<分类>/assets/<slug>/init.sh`，公共动作在同级 `assets/lib.sh`。四条不能破：

1. **可重复运行**。`course_setup` 会把该课目录整个删掉重建，重跑即重置。
2. **不需要 root，不污染环境**。不建系统用户、不写 `/srv`；远程是同目录下的裸仓库，走 `file://`（写成裸路径的话本地克隆会走 hardlink 捷径，`--depth` 会被忽略）。脚本执行期间 `GIT_CONFIG_GLOBAL` 指向沙箱文件，不碰 `~/.gitconfig`。
3. **预置历史的 hash 确定**。`lib.sh` 包装了 `git`，凡是产生 commit 对象的子命令都先把时间推一格，所以可以放心出「那条提交的 hash 是多少」这种题。造二进制文件也要用确定内容，别用 `/dev/urandom`。
4. **改完必跑** `bash scripts/course-smoke.sh <slug>` —— 它把脚本跑两遍，第二遍验证的就是第 1 条。

`.sh` 按 `.gitattributes` 不走 LFS（脚本要能被 AI 直接读），`deploy.sh` 上传时给它钉了 `text/plain`。

## 三处解析规则必须同步 { #three-parsers }

冲突块的语法有三个消费者，改语法要三处一起改，否则会静默不一致：

| 位置 | 干什么 |
|---|---|
| `scripts/course.py` | 状态机解析，`add` 时逐题检查是否作答 |
| `docs/vendor/conflict-init.js` | 浏览器里把块染成上问下答两半；三个标记不齐就原样留着，不吞内容 |
| `scripts/check-links.py` | 拦住 `docs/notes/` 下任何带 `<<<<<<<` 的文件进入部署 |

## 新增一课的完整流程 { #new-lesson }

课程页正文写在 `courses-src/build-pages.py` 的 `LESSONS` 表里、由脚本生成，**不要直接编辑 `docs/courses/git/*.md`**（下次生成会被覆盖）。加一课：

1. 在 `courses-src/build-pages.py` 里 `lesson(...)` 加一条：slug、章、标题、目标、索引钩子、场景、任务、验收、本课特有提问。
2. 写 `docs/courses/git/assets/<slug>/init.sh`，`source ../lib.sh` 起手。
3. `bash scripts/course-smoke.sh <slug>` —— 必须两遍都 0 退出。
4. `python3 courses-src/build-pages.py` 重新生成页面与索引。
5. 把新课加进 `mkdocs.yml` 的 nav。
6. `python3 scripts/check-links.py`。

自己做完一课、要把答卷发出去时，走 `scripts/course.py checkout → add`，再在 `docs/notes/<分类>/index.md` 挂一行钩子、在 nav 注册。归档产物里会自动附上折叠的「参考解法」（真身在 `courses-src/`，不发布）。
