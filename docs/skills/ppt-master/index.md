---
name: PPT Master
description: "做 PPT、幻灯片、课件时用：要生成可编辑的原生 PPTX，装上游 ppt-master 跑；先规划、定讲法、写配图 prompt，用规划 deck、沟通模式、生成配图三个子 skill，视觉风格、画风、版型在 Gallery 挑"
copy_source: true
---

# PPT Master

PPT Master 把文档、网址、表格或者一个题目做成 PPT，而且是能在 PowerPoint 里逐个修改的原生 PPTX：文本框、形状、图表、动画都是原生对象，不是一整页贴图。做法是 AI 先把每一页写成 SVG，再由脚本编译成 PowerPoint 的原生形状。同一套流水线还能把已有的 PPTX 保留原文重新设计、把页面截图还原成分层可编辑的 PPTX（上游只支持 Codex）、做成可复用的品牌和版式模板、在保留原设计的前提下往 PPTX 里填新内容或加旁白，以及导出带旁白、自动播放的视频。

这里只收了离开那套脚本也能用的部分：怎么规划、怎么讲、长什么样、配图怎么写。真正生成 PPTX 要装上游。

## 生成 PPTX：装上游 { #install }

- 装 GitHub 仓库 `https://github.com/hugohe3/ppt-master` 里的 `skills/ppt-master/` 整个目录，之后照它自己的 `SKILL.md` 走；clone 下来的这个目录直接当 skill 目录用，不必复制进全局的 skill 目录。Python 依赖在那个目录的 `requirements.txt`；其中转 PDF 用的 PyMuPDF 是 AGPL 许可，不转 PDF 可以不装
- **别删改** `LICENSE`、`SPONSORS.md`、`SPONSORS_CN.md` 和 `SKILL.md` 的 frontmatter：上游带完整性校验，主要脚本启动时先查这几样，对不上就以退出码 78 直接退出
- 脚本要在本地执行，这是在跑第三方代码，执行前让用户知情
- **配图走 agent-io**：上游确认图片来源时，AI 生成图的出图方式选「宿主原生工具（路径 B）」，不用给它配厂商 key。路径 B 本意是宿主自带的生图工具，没有的话就按[生成、编辑图片](../agent-io/reference/image.md)自己调接口，图存到上游要的 `<项目>/images/<文件名>`
- **用户说直接做、不用问**：上游的确认关口按推荐自己定，不开确认页；用户明说「快速」「跳过规划」才走它的 Quick 路线
- 上游跑的时候读它自己目录里的英文目录，不读这里的中文版。这里挑好的沟通模式、视觉风格、画风，把 id（`ppt169`、`pyramid`、`swiss-minimal`、`vector-illustration` 这类）告诉它，它按自己的规矩写进规划，两边的 id 一一对应

## 子 skill 什么时候用 { #route }

| 子 skill | 干什么 | 什么时候用 |
|---|---|---|
| [规划 deck](strategist.md) | 九项清单：沟通契约、画幅、阅读方式和页数、模式和风格、配色、字体、图标、图片来源、逐页清单 | 动手做任何一套 deck 之前；用不用 PPT Master 都适用 |
| [沟通模式](modes/index.md) | 金字塔、叙事、教学、展演、简报五种论证骨架，定标题口吻、页面结构倾向和演讲备注语气 | 定「怎么讲」时 |
| [生成配图](image-generator.md) | 一套 deck 锁一种画风和配色，每张图按六段拼 prompt；文字分图里、页面上两层 | 给 deck 写 AI 配图 prompt 或出图时 |

## 数据在 Gallery { #data }

- [PPT 视觉风格](../../gallery/images/ppt-master/index.md#visual-styles) —— 18 种，deck 长什么样：形状语言、装饰密度、留白、字体性格、质感，不带色值；规划 deck 第四项从这里挑
- [PPT 配图画风](../../gallery/images/ppt-master/index.md#renderings) —— 20 种，配图怎么画，每种一张对比图和一段能直接贴进 prompt 的画风段落
- [PPT 配图版型](../../gallery/layouts/deck-image-types/index.md) —— 11 种局部信息图的构图骨架：对比、循环、流程图、漏斗、矩阵、时间线……每种一张对比图

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../maintenance/skills/ppt-master.md)。正常使用不用看，出问题再看。

</div>
