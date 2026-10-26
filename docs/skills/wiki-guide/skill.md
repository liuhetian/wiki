---
description: "在 skills/ 下收纳或改 skill 时读（先读写作规范）：迷你、标准、抽象三种形态怎么判，所有来源共用的收纳步骤，插件仓库、提示词合集、教程、自己跑通的 prompt 各多做什么，带脚本的 skill 怎么发，nav 怎么挂，页尾链到维护记录"
---

# 收纳 skill

skill 本质是渐进式披露的文档。markdown 里写的相对链接，渲染成网页后照样能访问到对应的文档 —— 静态网页就能替代本地目录当远程 skill 源，AI 依旧顺相对链接按需往下读。

目录沿用 Anthropic 的 skill 形态和 authoring best practices[^bp]，文字守[写作规范](index.md)。本页先讲成品的[三种形态](#layout)和所有来源共用的[收纳步骤](#principles)，再管实践中多出来的两件事：

1. 来源不同，收法不同 —— 见[不同的源头类型](#sources)
2. skill 还带可执行脚本 —— 见[带脚本的 skill](#scripts)

## 三种最终形态 { #layout }

收纳到本 wiki 的 skill 最终是下面三种形态之一。`skills/` 是一棵树：中间的节点都是抽象 skill，叶子是迷你 skill 或标准 skill。

| 形态 | 结构 | 什么时候用 | 活例 |
|---|---|---|---|
| 迷你 skill | `<skill>.md` 一个文件 | 一页说得完，没有 reference 和 assets；常常就是一段 prompt，要读者填的空写成[填空模版](reference/components.md#fill) | [盘问我](../grilling.md) |
| 标准 skill | `<skill>/index.md` + `reference/` + `assets/` | 子页服务同一个主题，按需加载；就是 Anthropic 标准的 skill 目录，`SKILL.md` 改名 `index.md` | [FastAPI](../fastapi/index.md) |
| 抽象 skill | `<skill>/index.md` + 几个子 skill（迷你的写成 `<skill>/a.md`，标准的写成 `<skill>/b/index.md`），可以顺带 `reference/`、`assets/` | 一套能力由几个独立 skill 组成；互不相干的 skill 归一类也是它，只是不解决一个具体问题 | [图片提示词反推](../image-prompt-reverse/index.md)、[写作规范](index.md)（带 reference）、[写作口味](../writing/index.md)（归类） |

- **判形态问两句**：下面有没有子 skill？有就是抽象 skill。没有的话，有没有 reference 或 assets？有就是标准 skill，没有就是迷你 skill
- **子页能单独拿出去用的是子 skill，不能的是 reference**：子 skill 有自己的 `name` 和 `description`，能单独被触发、单独复制进对话；reference 离开所属 skill 就不知道拿来干什么。把独立 skill 塞成别人的 reference 是层级错位
- **迷你 skill 长出第一份 reference 或第一张图才升成目录**：`foo.md` 挪成 `foo/index.md`，按[挪文件](index.md#rules)办 —— 网页地址不变，`.md` 地址会变，站内链接全改。同一级不能同时有 `foo.md` 和 `foo/`，两者抢同一个网页地址
- **抽象 skill 的 `index.md` 讲清各子 skill 什么时候用**：只列名字不够，每行写干什么 + 什么时候用，AI 靠它挑路；归类用的也一样，不照搬上游 README。几个子 skill 都要遵守的规矩写进这里，子 skill 只写自己多出来的 —— 活例：写作规范的页面规矩写在入口，课程页、skill 两个子 skill 只写各自的部分
- **标准 skill 的 `index.md` 只做入口**：几行说明加链接指向 `reference/`，不要用 `--8<--` 把 reference 塞进来；迷你 skill 本身就是全文
- **`reference/` 只一层深**，`index.md` 直接链到每一篇；超过 100 行的 reference 顶部加目录
- **`assets/` 只放真身**（css / js / svg / demo / 脚本），跟 `reference/` 平级、归它所属的 skill；子 skill 的资产各归各的，不混进上级的 `assets/`
- **代码自己说明自己**：设计令牌、组件类写进 CSS 注释，markdown 只做引导；要展示就在讲它的 reference 里 `??? abstract` 折叠 `--8<--` 引真身
- **项目运行文件不进 `assets/`**：`deploy.sh`、`mkdocs.yml` 这类真身留仓库根才能跑，文章里 `--8<--` 引用，不复制
- **入口的 description 写干什么 + 什么时候用**，上级入口那行钩子照抄它；吸纳来的在钩子末尾括号注明吸纳自谁

## 收纳步骤 { #principles }

不管什么来源都按这个顺序走，来源特有的那一步见[不同的源头类型](#sources)。

1. **先拆架构、定形态，和用户确认**：看来源里有几个 skill、带不带 reference 和 assets，按[判形态](#layout)对上三种形态。超级简单、没有附带目的的几句话，先看站内有没有相似的 skill，和用户确认能否收进已有 skill
2. **定能力名称，和用户确认**：也就是解决什么问题。目录名用英文，用规范的变量命名或者直接对齐上游 slug
3. **上游入口 `SKILL.md` 改名**：只有这一个文件的，改名成 `<名字>.md`（迷你 skill）；带 references、scripts、assets 的，改名成 `<名字>/index.md`（标准 skill），从而符合 wiki 的渲染规范
4. **frontmatter 忠实保留**：`allowed-tools`、`model` 等字段原样不动；`name` 用和用户确认的能力名称，`description` 按能力名称改写成什么时候用、用了做什么，不照译原文。复制按钮会自动去掉 frontmatter。原文没有一级标题的补一个
5. **深度收纳，不是简单翻译或原文照录**：内容全部译为中文，人称转换成对 AI 讲述。允许大幅改动，让它贴合本站 —— 换掉本站已有能力能替代的依赖，删掉用不上的路线，脚本一起改，改了什么写进维护记录。活例：[整理视频为笔记](../video-note/index.md)把下载视频和本地转写换成了 [Agent 基础能力](../agent-io/index.md)的接口，网页 AI 字幕整条删掉。它引用的 references 也要收齐并翻译为中文；README、安装器、CI、测试、运行方式（比如用 xxx 命令运行）跳过。处理好文件之间的路径引用，保证能通过相对路径访问到 skill 内部资源和依赖的其他 skill
6. **prompt 里的占位改成填空**：上游的 `{{idea}}`、`[产品名]`、【…】这类，一律改成[填空](reference/components.md#fill)输入框，读者在网页上填好再复制；为占位写给 AI 的说明（「【】里的内容用户还没给，先问用户要，齐了再开始」这类）随之删掉，输入框本身就说明了哪里要填。活例：[人话翻译](../chat-prompts/plain-talk.md)
7. **入口页说清拿到它之后要做什么**，可以补一两句原因给人看。顶层入口（收进来的抽象 skill 的 `index.md`，或者单个 skill 本身）开头写领域建模：本 skill 解决什么问题，可以参考原本 frontmatter 里的 description，也可以参考 README.md 里的描述。原文里的出处、作者、外链不留在入口页，挪进维护记录的「上游」，外链写成脚注 —— 同[写作规范的硬规矩](index.md#rules)
8. **收尾**：上级入口加一行钩子（照抄 description，见[三种形态](#layout)最后一条），`mkdocs.yml` 注册 [nav](#nav)，顶层入口页尾链到[维护记录](#maintenance-record)，跑 `python3 scripts/check-links.py`

## 不同的源头类型 { #sources }

上游本来就是一个 skill 的，走完收纳步骤就够；下面几种来源各多一步。

### 插件仓库 { #plugin-repo }

插件的物理形态就是一个 git 仓库，里面可能不光有 skill，还有别的组件：hooks、agents、commands、mod、MCP 服务器[^overview]。收纳时先分清哪些有用、哪些丢掉。

本站不提供、也不希望提供侵入客户端 agent 的能力，所以 hooks、agents、commands 提炼出文本 prompt 转换成 skill，作为软引导；mod（Claude Code 的侵入式插件）和 MCP 暂时没法转成 skill，吸纳时丢弃，并明确告知发起收纳的人丢了哪些。

| 组件 | 怎么收 |
|---|---|
| skills | 按[收纳步骤](#principles) |
| hooks | 转成文字：xxx 之后，执行 xxx 脚本；脚本忠实保留 |
| agents | 常见形态就是一句话，直接收成 skill |
| commands | 常见形态就是一句话，直接收成 skill；里面的变量（`$ARGUMENTS` 这类）改成[填空](reference/components.md#fill)，同收纳步骤里的占位 |
| mod、MCP | 丢弃，丢了什么写进[维护记录](#maintenance-record)的「跳过了什么」，并告诉用户 |

### 提示词合集、卡牌站

来源自带的形式和框架不跟着进来：卡牌、稀有度、站点自己的分类、几套并存的占位写法这类包装一律丢掉，按本站的 skill 形态重新组织，分组按使用场景来。只收能直接拿来用的内容，分析来源本身的话（比如从写法推断出处）不进 skill，确实有用的写进维护记录的「上游」。活例：[对话提示词](../chat-prompts/index.md)，原来是一套提示词卡牌。

### 教程、视频这类教人怎么做的内容

先照做一遍再收。原文多半只露关键词和成品，照着说的做不一定行，坑要自己跑出来：跑通的 prompt、参数和坑写进 skill，和原文不一样的地方写进维护记录的「翻译之外的改动」。视频先用[整理视频为笔记](../video-note/index.md)记成文章，文章链到 skill，skill 不链回文章。活例：Gallery 的[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)，原视频只给了风格关键词，首帧怎么做、比例怎么补、怎么接成循环都是照做时发现的。

### 自己跑通的 prompt

和占位改填空反过来：换题材要改的值挖成填空，placeholder 写成「比如」加实测那次的值，照着填回去就是跑通过的那条。活例：Gallery 的[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)，花名、颜色、海报文字挖空，placeholder 是洋桔梗那次的值。

## 带脚本的 skill：远程为主，整包兜底 { #scripts }

默认走网络请求：文档在网页上读，脚本用到哪个取哪个。skill 页面开头介绍那一段的末尾写这一句，一字不差，只换链接：

```markdown
如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录名>.tar.gz)下载到本地。
```

- **放在开头介绍段，不单独成节、不放进「用法」**：它是例外的指引，放进用法读起来像在引导人下载。要补一句为什么非整包不可（比如跑一次总入口就算调用多次），另起一句接在后面，别用分号连 —— 句号是标准句的一部分
- **这一行同时是指引和声明**：客户端照它决定要不要整包；部署时 `scripts/build-skill-bundles.py` 认这一行，把链接指向的目录原样打成包。代码块和行内代码里写的不算；链了一个全站没人用这一行声明过的包，部署直接停住，免得线上挂一个 404 的包
- **链接指向要打的那个目录**：包放在被打包的目录里、以目录名命名。入口是 `index.md` 的打它自己的目录，链接就是 `<目录名>.tar.gz`；Gallery 里不占 `index.md` 的单页打它的工程目录，比如[彩色手绘三维穿梭视频](../../gallery/video/collected/gallery-parallax-ink.md)写的是 `assets/parallax-ink-starter/parallax-ink-starter.tar.gz`，包里只有工程，页面照旧在网页上读
- **整个 skill 都调用不到 2 次的不写**：脚本单文件、自包含，远程取一个就够，比如 agent-io 的 `pdf_read.py`
- **调用一次也要整包的，在子 skill 里说一句**，链到上级的包，比如[数字数](../../maintenance/mock-bundle/count/index.md)页的 `所以调用一次也要整包：直接将[测试skill](../mock-bundle.tar.gz)下载到本地`
- **文档里只写相对路径**：链接相对当前文件，命令相对 skill 自己的目录，直接写 `python3 scripts/xxx.py`
- **不用 `$SKILL` 这类 shell 变量**：Agent 每次执行命令都是新环境，上一条导出的变量下一条就没了。上游的 `<SKILL_DIR>` 占位照留，意思一样
- 跨 skill 的链接在包外，整包用法下回网页读

**别画蛇添足**：客户端 AI 自己会的，文档别再写一遍。

- **不附下载命令**：下载、解压、放哪、要不要先清旧目录，客户端 AI 看到这一句自己会写
- **不讲根目录**：相对路径的基准就是文档自己的位置，这是 URL 和文件系统的默认语义；复制按钮还会把链接转成绝对地址。入口页再写一句「根目录是 `…/skills/x/`，相对路径拼上它」，等于另立一个基准，在抽象 skill 里和子 skill 的目录对不上。实测过：subagent 照这句把子 skill 的 `scripts/foo.py` 拼到父目录下，拿到 404

活例：[测试skill](../../maintenance/mock-bundle/index.md)，专为这一节做的 mock，两个子 skill 互相引用，一个脚本跨目录 import 另一个。

## nav { #nav }

reference 不在 nav 里单独成层，展平到所属 skill 的入口后面；子 skill 带 reference 的自成一组，不跟兄弟子 skill 混在一层；`assets/` 不进 nav。所以不需要 `reference/index.md`、`assets/index.md` 占位页。

```yaml
- 写作口味:                                              # 抽象 skill（归类）：入口在前
    - skills/writing/index.md
    - 滚动 deck 工程手册: skills/writing/deck.md          # 迷你 skill：一个平条目
- 盘问我: skills/grilling.md                             # 顶层的迷你 skill 也是一个平条目
- 带文档盘问:                                            # 抽象 skill
    - skills/grill-with-docs/index.md
    - 领域建模:                                          # 带 reference 的子 skill 自成一组
        - skills/grill-with-docs/domain-modeling/index.md
        - GLOSSARY.md 格式: skills/grill-with-docs/domain-modeling/reference/glossary-format.md
- FastAPI 后端:                                          # 标准 skill：reference 展平
    - skills/fastapi/index.md
    - 项目布局: skills/fastapi/reference/项目布局.md
    - 数据库: skills/fastapi/reference/数据库.md
```

## 维护记录 { #maintenance-record }

在顶层入口页末尾用分割线加一行链接，包进 `zx-no-copy` 块：网页上和源文件里都看得到，但是复制按钮复制出来的结果不会带上这个块的内容。

```markdown
<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../../maintenance/skills/<名字>.md)。正常使用不用看，出问题再看。

</div>
```

记录本身写在 `maintenance/skills/<名字>.md`，挂进[维护板块](../../maintenance/index.md#skills)，只写四样：

- 上游：仓库、作者、许可证，原文里提到的出处也写在这
- commit：一句话，钉在哪个 commit、哪天
- 跳过了什么
- 翻译之外的改动

[^overview]: [Plugins overview](https://code.claude.com/docs/en/plugins/overview) —— Claude Code 官方文档，2026-10-14 读。
[^bp]: Anthropic [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)，2026-10-16 读。
