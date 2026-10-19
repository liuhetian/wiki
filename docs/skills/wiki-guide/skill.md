---
description: "在 skills/ 下收纳或改 skill 时读（先读写作规范）：来源是别人的 skill 或插件、文章、自己的项目；迷你、标准、抽象三种形态怎么判，hooks 等组件怎么转，nav 怎么挂，页尾链到维护记录"
---

# 收纳 skill

本站的 skill 都是收纳来的：别人的 skill 或插件、一篇文章、自己的项目，不从零写。沿用 Anthropic 的 skill 目录形态和 authoring best practices[^bp]：`index.md`（迷你 skill 是 `<skill>.md`）就是 `SKILL.md`，AI 顺相对链接按需往下读。下面只写本站自己的约定，页面通用的规矩见[写作规范](index.md)。

## 三种形态 { #layout }

整个 `skills/` 是一棵树：中间的节点都是抽象 skill，叶子是迷你 skill 或标准 skill。

| 形态 | 结构 | 什么时候用 | 活例 |
|---|---|---|---|
| 迷你 skill | `<skill>.md` 一个文件 | 一页说得完，没有 reference 和 assets；常常就是一段 prompt，要读者填的空写成[填空](reference/components.md#fill) | [盘问我](../collab/grilling.md)、[对话提示词](../collab/chat-prompts/index.md)下的 19 个 |
| 标准 skill | `<skill>/index.md` + `reference/` + `assets/` | 子页服务同一个主题，按需加载；就是 Anthropic 标准的 skill 目录，`SKILL.md` 改名 `index.md` | [FastAPI](../fastapi/index.md)、[Dashboard](../dashboard/index.md) |
| 抽象 skill | `<skill>/index.md` + 几个子 skill，可以顺带 `reference/`、`assets/` | 一套能力由几个独立 skill 组成；互不相干的 skill 归一类也是它，只是不解决一个具体问题 | [图片提示词反推](../collab/image-prompt-reverse/index.md)、[写作规范](index.md)（带 reference）、[和 AI 协作](../collab/index.md)（归类） |

- **判形态问两句**：下面有没有子 skill？有就是抽象 skill。没有的话，有没有 reference 或 assets？有就是标准 skill，没有就是迷你 skill
- **子页能单独拿出去用的是子 skill，不能的是 reference**：子 skill 有自己的 `name` 和 `description`，能单独被触发、单独复制进对话；reference 离开所属 skill 就不知道拿来干什么。把独立 skill 塞成别人的 reference 是层级错位
- **迷你 skill 长出第一份 reference 或第一张图才升成目录**：`foo.md` 挪成 `foo/index.md`，按[挪文件](index.md#rules)办 —— 网页地址不变，`.md` 地址会变，站内链接全改。同一级不能同时有 `foo.md` 和 `foo/`，两者抢同一个网页地址
- **抽象 skill 的 `index.md` 讲清各子 skill 什么时候用**：只列名字不够，每行写干什么 + 什么时候用，AI 靠它挑路；归类用的也一样。几个子 skill 都要遵守的规矩写进这里，子 skill 只写自己多出来的 —— 活例：写作规范的页面规矩写在入口，课程页、skill 两个子 skill 只写各自的部分
- **标准 skill 的 `index.md` 只做入口**：几行说明加链接指向 `reference/`，不要用 `--8<--` 把 reference 塞进来；迷你 skill 本身就是全文
- **`reference/` 只一层深**，`index.md` 直接链到每一篇；超过 100 行的 reference 顶部加目录
- **`assets/` 只放真身**（css / js / svg / demo / 脚本），跟 `reference/` 平级、归它所属的 skill；子 skill 的资产各归各的，不混进上级的 `assets/`
- **代码自己说明自己**：设计令牌、组件类写进 CSS 注释，markdown 只做引导；要展示就在讲它的 reference 里 `??? abstract` 折叠 `--8<--` 引真身
- **项目运行文件不进 `assets/`**：`deploy.sh`、`mkdocs.yml` 这类真身留仓库根才能跑，文章里 `--8<--` 引用，不复制
- **入口的 description 写干什么 + 什么时候用**，上级入口那行钩子照抄它

## 收纳原则 { #principles }

为了实现一个能力需要的能力，官方提供了`插件`这个概念，根据官方 Plugins overview[^overview]，现在一个插件有以下几个部分组成：

- skills
- hooks 钩子
- agents 
- commands
- mod
- MCP 服务器

其物理形态就是一个git仓库。

里面可能有一个或者多个 skill ，还可能附带一些hooks，agents等元素。我们需要收纳到本地仓库为自己所用。收纳最重要的原则是**人可读**，所以注意事项1：需要全部翻译成中文。

本wiki核心原理是通过wiki静态网页替代传统的本地目录，wiki中markdown写的相对路径，到了网页中会自动转换成网页路径，从而作为AI追溯跳转的凭借，实现渐进式披露的AI友好的文档。

由于我们服务提供方并不提供，也不希望提供侵入客户端agent的能力，所以对于hooks，agents，commands这几个板块，需要提炼出文本prompt转换成skill，作为软引导。

对于mod(claude code的侵入式插件)和mcp，暂时没法直接转成skill，吸纳时丢弃，并明确告知吸纳发起人丢弃了哪些内容。所以注意事项2：hooks、agents、commands 转成skill，mod 和 MCP 丢弃并告知。

来源自带的形式和框架不跟着进来：卡牌、稀有度、站点自己的分类、几套并存的占位写法这类包装一律丢掉，按本站的 skill 形态重新组织，分组按使用场景来。所以注意事项3：只收能直接拿来用的内容，分析来源本身的话（比如从写法推断出处）不进 skill，确实有用的写进维护记录的「上游」。活例：[对话提示词](../collab/chat-prompts/index.md)，原来是一套提示词卡牌。

来源是教程、视频这类教人怎么做的内容，先照做一遍再收。原文多半只露关键词和成品，照着说的做不一定行，坑要自己跑出来：跑通的 prompt、参数和坑写进 skill，和原文不一样的地方写进维护记录的「翻译之外的改动」。视频先用[整理视频为笔记](../video-note/index.md)记成文章，文章和 skill 互链。所以注意事项4：教程类来源跑通再收。活例：Gallery 的[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)，原视频只给了风格关键词，首帧怎么做、比例怎么补、怎么接成循环都是照做时发现的。

吸纳这个能力首先分析它的架构，可以收纳成几个skill：

- 如果超级简单，或者压根没有附带目的的几句话，先看看是不是已经有相似的skill，可以和用户确认能否收纳到已有skill之中，
- 如果只是一个skill，并且没有其他组件，那么吸纳之后的结果就是一个迷你 skill（上游只有一个 `SKILL.md`）或标准 skill（带 references、scripts、assets），也需要先确认
- 如果是多个skill或者包含其他组件，那么这个目录就是一个抽象skill，结构是 `foo/index.md` 加几个子 skill（迷你的写成 `foo/skill1.md`，标准的写成 `foo/skill2/index.md`），这个foo就是一个抽象的skill，index.md中讲解本能力是做什么的，然后各个部分什么时候用，但是注意不是照搬readme。几种目录形态见上文[三种形态](#layout)。

下面具体介绍吸纳每个部分的吸纳规范。

## skills

首先需要确定能力名称，也就是解决什么问题，这一步要和用户确认。然后用英文名作为目录名，用规范的变量命名或者直接对齐上游 slug。

上游 skill 的入口是`SKILL.md`：只有这一个文件的，改名成 `<名字>.md`（迷你 skill）；带 references、scripts、assets 的，改名成 `<名字>/index.md`（标准 skill），从而符合wiki的渲染规范。

frontmatter 忠实保留，`allowed-tools`、`model` 等字段原样不动；`name` 用和用户确认的能力名称，`description` 按能力名称改写成什么时候用、用了做什么，不照译原文。复制按钮会自动去掉 frontmatter。原文没有一级标题的补一个。

内容全部译为中文，但不能只是翻译过来：入口页要说清楚拿到它之后要做什么，可以补一两句原因给人看。要长期生效的内容（守则、约定这类），写明让 AI 写进项目的 `CLAUDE.md` 或 `AGENTS.md`、怎么写进去 —— 只读不写，换个会话就丢了。

吸纳来的内容同样守[写作规范的硬规矩](index.md#rules)：原文里的出处、作者、外链不留在入口页，挪进维护记录的「上游」，外链写成脚注。

要深度收纳，而不是简单翻译或原文照录：允许大幅改动，让它贴合本站 —— 换掉本站已有能力能替代的依赖，删掉用不上的路线，脚本一起改，改了什么写进维护记录。活例：[整理视频为笔记](../video-note/index.md)把下载视频和本地转写换成了 [Agent 基础能力](../agent-io/index.md)的接口，网页 AI 字幕整条删掉。它引用的 references 也要收齐并翻译为中文；README、安装器、CI、测试、运行方式（比如用xxx命令运行）跳过。并且处理好文件之间路径引用关系，保证能通过相对路径访问到skill内部资源和依赖的其他 skill 。

prompt 里的占位也要深度收纳：上游的 `{{idea}}`、`[产品名]`、【…】这类，一律改成[填空](reference/components.md#fill)输入框，读者在网页上填好再复制；为占位写给 AI 的说明（「【】里的内容用户还没给，先问用户要，齐了再开始」这类）随之删掉，输入框本身就说明了哪里要填。活例：[人话翻译](../collab/chat-prompts/plain-talk.md)。

反过来也一样：自己跑通的具体 prompt 收成 skill 时，换题材要改的值挖成填空，placeholder 写成「比如」加实测那次的值，照着填回去就是跑通过的那条。活例：Gallery 的[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)，花名、颜色、海报文字挖空，placeholder 是洋桔梗那次的值。

上级入口加一行（干什么、吸纳自谁），`mkdocs.yml` 注册 nav，页尾链到维护记录（见最后一节），跑 `python3 scripts/check-links.py`

如果是顶层的skill（不管是能力作为抽象skill，还是是普通的单个skill），需要：

1. 在开头需要写上本skill的领域建模，解决什么问题。可以参考原本frontmatter里的description，也可能参考README.md里的描述。
2. 在最后需要写入`维护记录`，具体写法见后。

### 带脚本的 skill：远程为主，整包兜底 { #scripts }

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

活例：[测试skill](../../maintenance/mock-bundle/index.md)（两个子 skill 互相引用，一个脚本跨目录 import 另一个）、[整理视频为笔记](../video-note/index.md)、[HyperFrames](../hyperframes/index.md)、Gallery 单页[彩色手绘三维穿梭视频](../../gallery/video/collected/gallery-parallax-ink.md)。

## 其他

- **hooks**：转成文字，xxx之后，执行xxx脚本。其中脚本忠实保留。

- **agents**：常见形态就是一句话，可以直接收纳。

- **commands**：常见形态就是一句话，可以直接收纳。里面的变量（`$ARGUMENTS` 这类）改成[填空](reference/components.md#fill)，同上文 prompt 占位的写法。

- **mod**：丢弃，丢了什么写进[维护记录](#maintenance-record)的「跳过了什么」

- **MCP**：丢弃，丢了什么写进[维护记录](#maintenance-record)的「跳过了什么」


## nav { #nav }

reference 不在 nav 里单独成层，展平到所属 skill 的入口后面；子 skill 带 reference 的自成一组，不跟兄弟子 skill 混在一层；`assets/` 不进 nav。所以不需要 `reference/index.md`、`assets/index.md` 占位页。

```yaml
- 和 AI 协作:                                            # 抽象 skill（归类）：入口在前
    - skills/collab/index.md
    - 盘问我: skills/collab/grilling.md                 # 迷你 skill：一个平条目
    - 带文档盘问:                                        # 抽象 skill
        - skills/collab/grill-with-docs/index.md
        - 领域建模:                                      # 带 reference 的子 skill 自成一组
            - skills/collab/grill-with-docs/domain-modeling/index.md
            - GLOSSARY.md 格式: skills/collab/grill-with-docs/domain-modeling/reference/glossary-format.md
- FastAPI 后端:                                          # 标准 skill：reference 展平
    - skills/fastapi/index.md
    - 项目布局: skills/fastapi/reference/项目布局.md
    - 数据库: skills/fastapi/reference/数据库.md
```

## 维护记录 { #maintenance-record }

在这个入口页末尾用分割线加一行链接，包进`zx-no-copy`块：网页上和源文件里都看得到，但是复制按钮复制出来的结果不会带上这个块的内容。

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
