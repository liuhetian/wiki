---
name: 收纳
description: "把外面的仓库、网站、帖子、视频或一批图收进本 wiki 时用：先用收纳导诊分诊、交出交接 prompt，再照交接读每一面的执行页 —— 收纳 skill、收进 Gallery、调研项目、整理视频为笔记；外部材料怎么存、维护记录写什么是两面共守的规矩"
copy_source: true
---

# 收纳

外面的东西收进本 wiki 分两步：先[分诊](triage.md)，再照每一面的执行页收。正面是从通用到具体那根轴上的笔记、Gallery、文章、项目，人和 AI 都读，收它讲清了什么；背面是 skill，给 AI 照着做，收 agent 能照着做的执行方式；一个来源可以两面都收。只存一个链接的进轴外的[收藏夹](../../bookmarks/index.md)，没有单独的执行页。照哪一页收，动手前都先读[写作规范](../wiki-guide/index.md)和本页的[共用规矩](#shared)。

## 每一步读哪页 { #route }

| 页 | 干什么 | 什么时候用 |
|---|---|---|
| [收纳导诊](triage.md) | 看来源，正面、背面分开判，只问几件用户能定的事，交出交接 prompt；只分诊，不动手 | 拿到一个来源、还没想好怎么收 |
| [收纳 skill](skill.md) | 八步收纳步骤；插件仓库、大型 skill 仓库、提示词合集、教程各怎么收 | 来源本身是 skill、插件或提示词合集，或要把教程照做一遍提炼成守则 |
| [收进 Gallery](gallery.md) | 能直接用的效果极简收，图、版式、配色、视频原样收 | 收别人的成品当参考 |
| [调研项目](../project-research/index.md) | 粗讲、细讲、写书，每个都带「收纳进本 wiki」的开关；粗讲、细讲和写书的从零复刻、做实验落项目，写书的领域对比落文章 | 拆一个仓库或项目 |
| [整理视频为笔记](../video-note/index.md) | 把视频、图文帖记成学习笔记 | 来源是视频或图文帖 |
| [Agent 基础能力](../agent-io/index.md) | 一个能力一篇接入说明 | 经中转接一家 API |

一篇帖子、一篇论文 —— 一个通用问题加几种方案 —— 照写作规范直接写成文章，没有单独的执行页。

## 共用规矩 { #shared }

### 外部材料 { #material }

- **别人的图和视频直接收原件**：本 wiki 自己看、不商用，忠实记录比避嫌要紧，不为避嫌改成自己重新生成；作者和出处写进维护记录或脚注 —— 活例：[二次元平面设计风格](../../gallery/images/linux-do-style/gallery-anime-graphic-design.md)的 23 张配图原样存档
- **外部仓库只取用得上的文件**：进 `assets/` 的只有页面用得上的 —— demo 跑起来要的、正文 `--8<--` 引到的，其余不收、链上游；上游的设计文档、README 不整篇嵌，摘句加脚注；没人引的源码存档 check-links 会拦 —— 活例：[梨园](../../projects/liyuan/index.md)的 `liyuan-src/`。吸纳的 skill 例外，要收齐才能跑，见[收纳 skill](skill.md)
- **读的哪个版本只记一次**：写进维护记录，正文不逐处标版本；不建维护记录的写进脚注

### 维护记录 { #maintenance-record }

页面只写怎么用；从哪来、改了什么写进[维护](../../maintenance/index.md)。一个来源两面都收的，记录只写一篇 —— 活例：[手绘风格出图](../../maintenance/skills/handdraw.md)，skill 和 Gallery 三区的收录写在同一篇。

| 收的是 | 记录写在 | 一篇管 |
|---|---|---|
| skill | `maintenance/skills/<名字>.md`，挂进维护的「Skill 吸纳」 | 一个 skill |
| Gallery | `maintenance/gallery/<名字>.md`，挂进「Gallery 收录」；单条收的并进该类零散收集那篇 | 一个来源；极简收的不建 |
| 细讲、写书的项目 | `maintenance/projects/<名字>.md`，挂进「项目」 | 一个项目；粗讲不建 |

记录写四样：

- **上游**：仓库、作者、许可证，原文里提到的出处也写在这
- **commit**：一句话，钉在哪个 commit、哪天
- **跳过了什么**
- **翻译之外的改动**

项目的记录另加两样：源码存档和行号怎么对上，实验怎么跑、脚本附后。skill 页尾怎么链过来，见[写 skill](../wiki-guide/skill.md#maintenance-record)。
