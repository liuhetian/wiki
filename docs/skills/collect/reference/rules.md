---
description: "照收纳的哪一页收，动手写之前都先读（先读写作规范）：别人的图和视频收原件，外部仓库只取用得上的文件，读的版本只记一次；维护记录写在哪、写哪四样"
---

# 收纳的共用规矩

导诊交接之后，照哪一页收 —— 收纳 skill、收进 Gallery、调研项目、整理视频为笔记 —— 动手前都先读[写作规范](../../wiki-guide/index.md)和本页。

## 外部材料 { #material }

- **别人的图和视频直接收原件**：本 wiki 自己看、不商用，忠实记录比避嫌要紧，不为避嫌改成自己重新生成；作者和出处写进维护记录或脚注 —— 活例：[二次元平面设计风格](../../../gallery/images/linux-do-style/gallery-anime-graphic-design.md)的 23 张配图原样存档
- **外部仓库只取用得上的文件**：进 `assets/` 的只有页面用得上的 —— demo 跑起来要的、正文 `--8<--` 引到的，其余不收、链上游；上游的设计文档、README 不整篇嵌，摘句加脚注；没人引的源码存档 check-links 会拦 —— 活例：[梨园](../../../projects/liyuan/index.md)的 `liyuan-src/`。吸纳的 skill 例外，要收齐才能跑，见[收纳 skill](../skill.md)
- **读的哪个版本只记一次**：写进维护记录，正文不逐处标版本；不建维护记录的写进脚注

## 维护记录 { #maintenance-record }

页面只写怎么用；从哪来、改了什么写进[维护](../../../maintenance/index.md)。一个来源两面都收的，记录只写一篇 —— 活例：[手绘风格出图](../../../maintenance/skills/handdraw.md)，skill 和 Gallery 三区的收录写在同一篇。

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

项目的记录另加两样：源码存档和行号怎么对上，实验怎么跑、脚本附后。skill 页尾怎么链过来，见[写 skill](../../wiki-guide/skill.md#maintenance-record)。
