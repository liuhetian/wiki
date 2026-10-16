---
description: "如何收纳别人的能力"
---

# 怎么收纳能力

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

对于mod(claude code的侵入式插件)和mcp，吸纳的时候需要明确告知吸纳发起人，会丢弃掉哪些内容。所以注意事项2：需要全部转换成skill。

吸纳这个能力首先分析它的架构，可以收纳成几个skill：

- 如果超级简单，就几句话，先看看是不是已经有相似的skill，可以收纳到已有skill之中，如果没有相似才新建目录
- 如果只是一个skill，并且没有其他组件，那么吸纳之后的结果就是一个skill目录
- 如果是多个skill或者包含其他组件，那么这个目录就是一个抽象skill，结构是 `foo/index.md`, `foo/skill1/`, `foo/skill2`，这个foo就是一个抽象的skill，index.md中讲解本能力是做什么的，然后各个部分什么时候用，但是注意不是照搬readme。

下面具体介绍吸纳每个部分的吸纳规范。

## skills

标准的`SKILL.md` 是入口，需要改名成 `index.md`，从而符合wiki的渲染规。内容全部译为中文。这样一来之后入口页就是，prompt直接复制丢给AI

对于它引用的 references、依赖的其他 skill 一起译，按上游相对路径放，内部链接原样有效。目录名对齐上游 slug

frontmatter 忠实保留，`allowed-tools`、`model` 等字段原样不动，只把 `name` 和 `description` 译成中文，复制按钮会自动去掉它。原文没有一级标题的补一个。

`scripts/`、`assets/` 原样收；README、安装器、CI、测试跳过

分类索引加一行（干什么、吸纳自谁），`mkdocs.yml` 注册 nav，页尾链到维护记录（见最后一节），跑 `python3 scripts/check-links.py`

如果是顶层的skill（可能是能力作为抽象skill，也可能是普通的单个skill），在最后需要写入`维护记录`，具体见后面。


## 其他

- **hooks**：转成文字，xxx之后，执行xxx脚本。其中脚本忠实保留。

- **agents**：常见形态就是一句话，可以直接收纳。

- **commands**：常见形态就是一句话，可以直接收纳。对于变量，使用特殊标记（现在这个功能还没做）。

- **mod**：丢弃，但是在开发文档中写明丢弃了什么

- **MCP**：丢弃，但是在开发文档中写明丢弃了什么


## 维护记录 { #maintenance-record }

在这个入口页末尾用分割线加一行链接，包进`zx-no-copy`块：网页上和源文件里都看得到，但是复制按钮复制出来的结果不会带上这个块的内容。

```markdown
<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../../posts/ai-assistant/maintenance/skills/<名字>.md)。正常使用不用看，出问题再看。

</div>
```

记录本身写在 `posts/ai-assistant/maintenance/skills/<名字>.md`，挂进[维护目录](../../posts/ai-assistant/maintenance/index.md#skills)，只写四样：

- 上游：仓库、作者、许可证
- commit：一句话，钉在哪个 commit、哪天
- 跳过了什么
- 翻译之外的改动

活例：[盘问我](../collab/grilling/index.md)。
