---
name: 收纳 skill
description: "把外面的 skill、插件仓库、提示词合集收进 skills/，或把教程照做一遍提炼成 skill 时用（先读写作规范和收纳的共用规矩）：所有来源共用的八步收纳步骤；插件仓库各组件怎么收，大型 skill 仓库只收入口、能单独用的子 skill 和目录列给用户挑，提示词合集丢掉包装按场景重组，教程先照做一遍再收"
---

# 收纳 skill

把外面的 skill 收进 `skills/`：先按[收纳步骤](#principles)走，来源特有的那一步见[不同的源头类型](#sources)。收成什么形态、带脚本的怎么发、nav 怎么挂，照[写 skill](../wiki-guide/skill.md)。

## 收纳步骤 { #principles }

不管什么来源都按这个顺序走。

1. **先拆架构、定形态，和用户确认**：看来源里有几个 skill、带不带 reference 和 assets，按[判形态](../wiki-guide/skill.md#layout)对上三种形态
2. **定能力名称，和用户确认**：也就是解决什么问题。目录名用英文，用规范的变量命名或者直接对齐上游 slug
3. **上游入口 `SKILL.md` 改名**：只有这一个文件的，改名成 `<名字>.md`（迷你 skill）；带 references、scripts、assets 的，改名成 `<名字>/index.md`（标准 skill），从而符合 wiki 的渲染规范
4. **frontmatter 忠实保留**：`allowed-tools`、`model` 等字段原样不动；`name` 用和用户确认的能力名称，`description` 按能力名称改写成什么时候用、用了做什么，不照译原文。复制按钮会自动去掉 frontmatter。原文没有一级标题的补一个
5. **深度收纳，不是简单翻译或原文照录**：内容全部译为中文，人称转换成对 AI 讲述。允许大幅改动，让它贴合本站 —— 换掉本站已有能力能替代的依赖，删掉用不上的路线，脚本一起改，改了什么写进维护记录。活例：[整理视频为笔记](../video-note/index.md)把下载视频和本地转写换成了 [Agent 基础能力](../agent-io/index.md)的接口，网页 AI 字幕整条删掉。它引用的 references 也要收齐并翻译为中文；README、安装器、CI、测试、运行方式（比如用 xxx 命令运行）跳过。处理好文件之间的路径引用，保证能通过相对路径访问到 skill 内部资源和依赖的其他 skill
6. **prompt 里的占位改成填空**：上游的 `{{idea}}`、`[产品名]`、【…】这类，一律改成[填空](../wiki-guide/reference/components.md#fill)输入框，读者在网页上填好再复制；为占位写给 AI 的说明（「【】里的内容用户还没给，先问用户要，齐了再开始」这类）随之删掉，输入框本身就说明了哪里要填。活例：[人话翻译](../chat-prompts/plain-talk.md)
7. **入口页说清拿到它之后要做什么**，可以补一两句原因给人看。顶层入口（收进来的抽象 skill 的 `index.md`，或者单个 skill 本身）开头写领域建模：本 skill 解决什么问题，可以参考原本 frontmatter 里的 description，也可以参考 README.md 里的描述。原文里的出处、作者、外链不留在入口页，挪进维护记录的「上游」，外链写成脚注 —— 同[写作规范的硬规矩](../wiki-guide/index.md#rules)
8. **收尾**：上级入口加一行钩子（照抄 description，见[三种形态](../wiki-guide/skill.md#layout)最后一条），`mkdocs.yml` 注册 [nav](../wiki-guide/skill.md#nav)，顶层入口[页尾链到维护记录](../wiki-guide/skill.md#maintenance-record)、记录照收纳的[共用规矩](index.md#maintenance-record)写，跑 `python3 scripts/check-links.py`

## 不同的源头类型 { #sources }

上游本来就是一个 skill 的，走完收纳步骤就够；下面几种来源另有讲究。

### 插件仓库 { #plugin-repo }

插件的物理形态就是一个 git 仓库，里面可能不光有 skill，还有别的组件：hooks、agents、commands、mod、MCP 服务器[^overview]。收纳时先分清哪些有用、哪些丢掉。

本站不提供、也不希望提供侵入客户端 agent 的能力，所以 hooks、agents、commands 提炼出文本 prompt 转换成 skill，作为软引导；mod（Claude Code 的侵入式插件）和 MCP 暂时没法转成 skill，吸纳时丢弃，并明确告知发起收纳的人丢了哪些。

| 组件 | 怎么收 |
|---|---|
| skills | 按[收纳步骤](#principles) |
| hooks | 转成文字：xxx 之后，执行 xxx 脚本；脚本忠实保留 |
| agents | 常见形态就是一句话，直接收成 skill |
| commands | 常见形态就是一句话，直接收成 skill；里面的变量（`$ARGUMENTS` 这类）改成[填空](../wiki-guide/reference/components.md#fill)，同收纳步骤里的占位 |
| mod、MCP | 丢弃，丢了什么写进维护记录的「跳过了什么」，并告诉用户 |

### 大型 skill 仓库：脚本重、更新快 { #heavy }

上游是 skill，但主体是一套脚本流水线、几天一个版本的，不照收纳步骤第 5 步收齐。入口必写前两样，第三样问过用户才收；用户说全收才全收：

1. **领域建模**：一两句，它解决什么问题、靠什么机制做到，让 AI 认得出什么时候该用 —— 同收纳步骤第 7 步
2. **接上游**：客户端照上游自己的 `SKILL.md` 跑，这一节只写照它跑会踩的和本站要改的 —— 哪些文件不能动、动了会怎样；本站替换掉的环节（出图走 agent-io 这类）；上游的确认关口怎么过、花钱的调用先问谁；什么活读上游哪一篇，两边的 id 怎么对应。装法只写和常规不一样的地方
3. **离开引擎也完整的部分，列出来问用户**：不默认收。能单独拿出去用的守则适合收成子 skill（判法用[判形态那把尺](../wiki-guide/skill.md#layout)：有自己的 name 和 description），风格、画风、版型这类按编号查的目录适合进 Gallery。一条一行写清是什么、适合收成哪种、为什么，用户确认的才收，收就收完整；离开这条工作流就不知道拿来干什么的是工作流的层，不列

讲原因的 —— 它为什么这么设计、上游观察到什么失败 —— 不进 skill，走正面：配套项目页先按[分诊](index.md#ask)问用户：只收概要用[概要项目](../project-research/gist.md)，有关注点推荐[粗讲项目](../project-research/explain.md)，要学设计用细讲；都在同一个目录里长，正面链到 skill。活例：[PPT Master](../ppt-master/index.md)，入口一段领域建模、一节「生成 PPTX：装上游」；规划 deck、沟通模式、生成配图收成三个子 skill，视觉风格、画风、版型进了 Gallery。

### 提示词合集、卡牌站 { #prompt-cards }

来源自带的形式和框架不跟着进来：卡牌、稀有度、站点自己的分类、几套并存的占位写法这类包装一律丢掉，按本站的 skill 形态重新组织，分组按使用场景来。只收能直接拿来用的内容，分析来源本身的话（比如从写法推断出处）不进 skill，确实有用的写进维护记录的「上游」。活例：[对话提示词](../chat-prompts/index.md)，原来是一套提示词卡牌。

### 教程、视频这类教人怎么做的内容 { #tutorial }

先照做一遍再收。原文多半只露关键词和成品，照着说的做不一定行，坑要自己跑出来：跑通的 prompt、参数和坑写进 skill，和原文不一样的地方写进维护记录的「翻译之外的改动」。视频先用[整理视频为笔记](../video-note/index.md)记成文章，文章链到 skill，skill 不链回文章。活例：Gallery 的[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)，原视频只给了风格关键词，首帧怎么做、比例怎么补、怎么接成循环都是照做时发现的。

[^overview]: [Plugins overview](https://code.claude.com/docs/en/plugins/overview) —— Claude Code 官方文档，2026-10-14 读。
