---
description: "在本 wiki 新建或修改任何页面前读：写作流程、内容放哪个板块、硬规矩、什么场景用什么语法、文风；写课程页、写或收纳 skill、做精简检查时再读对应的子 skill"
copy_source: true
---

# 本 wiki 写作规范

本 wiki 用 Zensical（MkDocs Material 兼容）渲染，同一份 markdown 同时发布成给人看的 HTML 和给 AI 读的 `.md` 源。往这里写任何东西都先读完这一页。本页和子 skill 里的「活例」默认不点开：规矩本身写到能照做，拿不准哪一条时才点开那一条的活例。

## 写作流程 { #workflow }

1. 按[七问](#where)定板块和位置
2. 写正文，顶部写一行 [`description`](#description)
3. 在 `mkdocs.yml` 的 `nav:` 注册
4. 在某个祖先目录的索引页（`index.md` / `SKILL.md`）挂一行带钩子的链接 —— nav 只给人看，AI 只顺相对链接走，没挂上的页面对 AI 等于不存在
5. 跑 `python3 scripts/check-links.py`，不过就改完再跑；`deploy.sh` 构建前也跑，不过不许部署
6. 到这里为止：commit、push、部署都等用户说。渲染效果（含 mermaid）由用户自己在浏览器里看，AI 不截图 —— 有 mermaid 的页面提醒一句，原因见 [mermaid 的坑](reference/components.md#mermaid)

## 内容放哪个板块 { #where }

顶层七个板块按用途分，主题只做板块内的二级目录。按顺序问：

1. 收录一件成品当参考 —— 一张图配 prompt、一种前端风格配 demo？→ [Gallery](../../gallery/index.md)，按媒介进 images / layouts / colors / video / audio / web 六区之一；角色设定进 personas（人设），一人一页，定妆照加基本资料，活例 [SEOA｜徐星澄](../../gallery/personas/seoa.md)。原样收录，只调排版和图片路径，来源和改动写进[维护 · Gallery 收录](../../maintenance/index.md#gallery)，一个来源一篇；本站自己做的，成品和做法写在同一页（[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)）；layouts 区的五个分类页和 colors 区的经典主题色页由 `scripts/build-handdraw-gallery.py` 从 `images/handdraw-style/assets/` 生成，别手改；两区的 `index.md` 手写。活例：[GPT Image 2 的动漫与漫画](../../gallery/images/gpt-image2/gallery-anime-and-manga.md)、[前端风格收集](../../gallery/web/frontend-styles/index.md)
2. 给 agent 直接挂载的成套资产？→ [Skills](../index.md)
3. 一个 skill 或 Agent 能力背后的事 —— 从哪来、为什么这么选、改过什么、实测过什么？→ [维护](../../maintenance/index.md)。skill 页只写怎么用，页尾链过来，写法见[收纳 skill · 维护记录](skill.md#maintenance-record)
4. 跟着一本书或一套实操走、自己做完才算数？→ [课程](../../courses/index.md)
5. 算法、机器学习、编程语言等专业科目的学习、推导、题解？→ [笔记](../../notes/index.md)
6. 拆解别人的一个项目——它属于什么领域、为了解决什么问题引入了哪些功能？→ [项目拆解](../../projects/index.md)，一个项目一个目录：`index.md` 先说领域，再从这个领域最简单的做法出发按功能线写「具体问题 → 功能」，只写现状、不记小 bug；每条功能线一页细讲，能跑就实跑，每一步贴源码模版和跑出来的效果。怎么读、怎么写照[细讲项目](../project-research/dissect.md)：入口页按论文骨架排（摘要、关键词、术语、引言、局限、结论），功能线是引言的小节；读的哪个 commit、实验设置和脚本写进[维护](../../maintenance/index.md#projects)。活例：[梨园 Liyuan](../../projects/liyuan/index.md)。只照[粗讲项目](../project-research/gist.md)讲了几段的，目录里只放一页 `index.md`，不套论文骨架，commit 写进脚注 —— 活例：[Teable](../../projects/teable/index.md)
7. 其余能独立阅读的复盘、观点和方法整理 → [文章](../../posts/index.md)

- 能用在任意成品上的方法归 skill，只做一种成品的做法写在 Gallery 那页 —— [花卉动态生长海报](../../gallery/video/flower-growth-poster.md)的五步只做这一种海报，写在成品页；[图片提示词反推 · 七维拆解](../collab/image-prompt-reverse/seven-dimensions/index.md)是 skill，它整理的合集进了 [Gallery](../../gallery/images/linux-do-style/gallery-anime-graphic-design.md)，两边互链
- 课程是题、笔记是答卷：同名文件，答完才从 `courses/` 归档进 `notes/`
- 文章和 skill 共生、单向链：复盘归文章，复盘里沉淀出的可复用手册归 skill；文章链到 skill，skill 不链回文章讲原理、背景和实现 —— skill 是给 AI 照着做的，为什么这样做它用不上。拿文章当写法活例、指向文章板块的不算。活例：[动画 PPT 复盘](../../posts/animated-ppt/index.md)链到它的[工程手册](../writing/deck.md)，手册不链回来
- 归属变了就把文件真的搬过去，按下一节「挪文件」办

## 硬规矩 { #rules }

- **挪文件不留存根页**：要保住旧 URL 就别挪；挪了就删原文件、站内引用一并改，`mkdocs.yml` 的 `redirects` 加一行兜站外书签（只管 HTML，旧 `.md` 地址照样 404）。存根页没人链、不进 nav，留着只会逼 check-links 开豁免口子
- **引外部一手资料三步**：① 真身存档进 `assets/`，注明出处和获取日期，正文用 `??? abstract` 折叠 + `--8<--` 展示；② 正文用 `>` 摘关键原句；③ 每处引用跟自己的分析。活跃开源仓库、关键契约已经消化成自己的话的，可以用钉 commit 的 GitHub 永链代替存档 —— 活例：[Dashboard](../dashboard/index.md) 的蓝本吸收
- **正文链接只指站内，外部来源进脚注**：正文留 `[^名]`，URL 和读取日期写进文末脚注 —— 活例：[对象存储部署](../../posts/wiki/cos-deploy/index.md)
- **别人的图和视频直接收原件**：本 wiki 自己看、不商用，忠实记录比避嫌要紧，不为避嫌改成自己重新生成；作者和出处写进维护记录或脚注 —— 活例：[二次元平面设计风格](../../gallery/images/linux-do-style/gallery-anime-graphic-design.md)的 23 张配图原样存档
- **收录外部仓库只取核心文件**：挑对理解主题真正关键的几个进 `assets/`，其余钉 commit 永链。项目拆解的源码存档 `assets/<名>-src/` 只存页面 `--8<--` 引到的文件，上游的设计文档、README 不整篇嵌，摘句加永链脚注；没人引的文件 check-links 会拦 —— 活例：[梨园](../../projects/liyuan/index.md)的 `liyuan-src/`。吸纳来的 skill 例外，要收齐才能跑，见 [收纳 skill](skill.md)
- **代码即引用**：展示仓库里的文件用 `--8<--` 引真身，不复制粘贴；路径先相对 `docs/`、再相对仓库根（`skills/.../x.css`、`mkdocs.yml`）。完整文件不单独成页，在讲它的页面文末 `??? abstract` 折叠引用
- **缩进 4 空格**：折叠块、选项卡、提示框的子内容不缩 4 格就不被识别；代码块内部的缩进照原样
- 代码块语言标识写 `python`，不写 `py`
- **保留名**：`reference`、`assets`、`scripts` 不能当 `.md` 文件名 —— 跟同级目录撞 URL，内容被静默丢弃
- **check-links 豁免**写在文件前 5 行：`<!-- link-check-ok: 为什么这篇不该上链路 -->`。「已迁移存根」不算理由

## 每页一行 `description` { #description }

frontmatter 写一句话，进 HTML 的 `<meta name="description">`：

```markdown
---
description: "一句话说清这页回答什么问题，120 字以内，不写「本文介绍……」"
---
```

- 直接抄父级索引给它的那行钩子，两处说法一致
- 值用双引号包起来；不写 markdown 标记，`**` 和反引号在 meta 里会原样露出来

### 改不了的文件：目录级 `.meta.yml` { #meta-yml }

两类文件不塞 frontmatter：上游原文照录的存档（改了就不是原文），和被 `--8<--` 引用的真身（frontmatter 会漏进引用它的正文）。在目录里放 `.meta.yml`，给该目录及子目录的页面当默认，页面自己写的优先：

```yaml title="docs/gallery/images/gpt-image2/.meta.yml"
description: "GPT Image 2 图库（收录自 wuyoscar/GPT-Image2-Skill，MIT），整页中译，只改图片路径；来源与译法见维护记录 maintenance/gallery/gpt-image2.md"
```

一个目录一句话，写这批文件是什么、从哪来。

## 什么场景用什么语法 { #syntax }

Material / pymdownx 的语法照常写，这张表只提醒什么时候该用上：

| 场景 | 用 |
|---|---|
| 同一件事有 Python / R 等几种写法 | 选项卡 `=== "Python"` |
| 内容长、不是必读 | 折叠 `??? note "标题"`，要默认展开写 `???+` |
| 易犯的错 / 操作建议 / 补充说明 | 提示框 `!!! warning` / `!!! tip` / `!!! note` |
| 代码里某几处要单独解释 | 代码注解：行尾写 `# (1)`，代码块后接编号列表 |
| 代码里要突出几行 | `hl_lines="2-4"` |
| 架构、流程、时序 | ```` ```mermaid ````，有坑，见 [mermaid 的坑](reference/components.md#mermaid) |
| 数据图表 | ```` ```echarts ````，fence 里写 ECharts option |
| 公式 | `$...$` / `$$...$$` |
| 外部来源 | 脚注 `[^名]` |
| 读者要看到 JS 跑出来的结果 | ```` ```{.js .run} ```` → [可运行 JS 代码块](reference/components.md#js-run) |
| 交互演示 | iframe 嵌自包含单页 → [嵌入交互单页](reference/components.md#iframe-demo) |
| 放图片、视频 | 按怎么看来排：单张用 `<figure markdown>` 居中；要对照着看的几张（首尾帧、改前改后）放进 `<div class="grid" markdown>` 并排，一张一个 figure 配 `<figcaption>`。别把几张塞进同一个 figure，主题把 figure 里的图设成块级，会上下摞成一长条。一组同类照片当图库翻的（姿势参考这类），放进 `<div class="gallery-grid" markdown>` 排三栏，每张写成 `![说明](x.jpg){ loading=lazy }` → 活例 [ins风拍照姿势](../../gallery/images/xhs-poses/gallery-ins-poses.md)。正文里的图点了都弹灯箱放大，别再给图套指向它自己的链接，套了链接的图点了会直接跳走。动图效果放静音循环的 mp4，`<video autoplay loop muted playsinline>`，`src` 写站点根绝对路径，不放 GIF（体积是 mp4 的好几倍）→ 活例 [花卉动态生长海报](../../gallery/video/flower-growth-poster.md) |
| 不想公开的小字：服务器地址、域名、用户名 | `` `age:…` `` 打码 → [打码](reference/components.md#age-mosaic) |
| 一串按时间排的事件 | `zx-timeline` 块 → [时间线](reference/components.md#timeline) |
| 读者要看、粘进对话框会被误读的内容 | `zx-no-copy` 块 → [复制时跳过](reference/components.md#no-copy) |
| prompt 按读者的选择走不同分支；可选的空没填就整行不要 | `data-when` 块 → [分支](reference/branch.md) |
| prompt 里要读者先填的空 | 单行 `<input>`、多行 `<textarea>`、选项 `<select>` 写进句子，带 `placeholder`，复制时换成填的值 → [填空](reference/components.md#fill) |
| AI 新生成的配图 | 手绘信息图 → [配图](reference/infographic.md) |

critic 扩展（`{==高亮==}`）没开，别用。

## 文风 { #style }

AI 代笔时照此写：

- **先结论后展开**：段落第一句就是论点；标题直接说结论（「nav 随便重排，链接图纹丝不动」，不是「关于 nav 的说明」）
- **短句，破折号接推理**：一句话说一件事；因果和转折用「——」接在句内，不起「因此 / 然而 / 值得注意的是」的套话头
- **要点一行一条**：每条是可直接执行的指令或可检验的判断，不写「**小标题**：多行解释」的两段式
- **加粗只给结论和硬规矩**，不给气氛词；形容词能删则删
- **技术词允许保留英文原形**（commit、nav、snippet、iframe），叙述用中文，不音译不生造
- **规矩必须带活例**：立一条规范就指一个站内真实例子，只指一个，挑最小、最贴的；规矩本身写到不点开活例也能照做。没有活例的规矩先别写

## 针对具体场景：

以下场景只有用户明确要求写作某个部分，或者进行精简检查才读：

- [课程页怎么写](course.md) —— 如何写作一个`课程`，只有用户明确要求写一个课程时才查看。
- [收纳 skill](skill.md) —— 在 `skills/` 下收纳或改 skill 时读：迷你、标准、抽象三种形态怎么判，所有来源共用的收纳步骤，插件仓库、提示词合集、教程、自己跑通的 prompt 各多做什么，带脚本的 skill 怎么发，nav 怎么挂，维护记录怎么写
- [精简检查](trim.md) —— 默认不用，用户手动复制粘贴才使用：逐段问「这是我们自己的，还是 AI 本来就会的」