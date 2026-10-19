---
description: "七维拆解的维护记录：整理自 linux.do 帖子《图片提示词反推》（fly），主楼原文和配图存档在 skill 目录的 assets/ 里"
---

# 七维拆解

[七维拆解](../../skills/collab/image-prompt-reverse/seven-dimensions/index.md)的维护记录，它是[图片提示词反推](../../skills/collab/image-prompt-reverse/index.md)的简化版。

- **上游**：linux.do 帖子《图片提示词反推》[^post]，作者 fly（@water_ling），2026-08-10 发帖，帖子没写许可证。帖子在「开发调优」分类，标签：纯水、人工智能。「复刻和提风格是两件事」一节的提风格思路，来自同帖第 4 楼（@lookback）引用的另一个帖子《通用焚决千篇一律，特殊风格万里挑一》第 13 楼[^style]
- **commit**：帖子没有 commit，2026-09-28 抓取：用 Discourse 的 `https://linux.do/t/topic/2729491.json` 取主楼 `cooked` HTML，pandoc 转成 gfm
- **存档**：主楼原文存成 [`assets/linux-do-2729491/post.md`](../../skills/collab/image-prompt-reverse/seven-dimensions/assets/linux-do-2729491/post.md)，同目录 `01`–`08` 是八张原图（lightbox 原尺寸，不是 690px 缩略图）
    - 图片链接从 `cdn3.ldstatic.com` 改成指向同目录的本地文件，文件名用原帖的图片标题；去掉 Discourse 给标题自动加的锚点 `<a name="p-…">`
    - 正文文字、标题层级、斜体和引用块都原样保留，一个字没改
- **跳过**：第 2–6 楼是简短的寒暄和讨论，没存档；其中第 4 楼引用的提风格思路收进了正文
- **翻译之外的改动**：不是照录，是整理：
    - 出自原帖：四步流程和「一次只改一个变量」（流程图上的字）、七个维度和拆解顺序、五类图的模块、六张示例图和各自的「看图重点」、「初版指令词 → 继续追问 → 优化后 prompt」的结构
    - 自己加的：拆解顺序为什么从客观到主观、七维有重叠要去重、五类图压成「先锁定 / 容易漏掉」一张表、「优化后 prompt」其实是更好的第一轮提问、通用版两轮提问模板、复刻和提风格的区分、「还没验证的」一节
    - 和吸纳来的 get-prompt-from-image 一起收进「图片提示词反推」，当简化版，一级标题从「图片提示词反推」改成「七维拆解」；出处从页首和脚注挪进本页，页尾加维护记录的链接

## 上游更新

1. 重新抓 `.json`，把主楼 `cooked` 和本地的 `post.md` 做 diff
2. 如果有改动，覆盖 `post.md` 和配图，更新本页的抓取日期
3. 按需修改[七维拆解](../../skills/collab/image-prompt-reverse/seven-dimensions/index.md)的提炼

[^post]: fly（@water_ling），[《图片提示词反推》](https://linux.do/t/topic/2729491)，linux.do，2026-09-28 读。
[^style]: [《通用焚决千篇一律，特殊风格万里挑一》第 13 楼](https://linux.do/t/topic/2044964/13)，linux.do，读取日期没记。
