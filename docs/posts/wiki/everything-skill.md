---
description: "用wiki作为远程skill和插件的探索"
---

# 用wiki作为远程skill和插件的探索



## 问题1: 能够作为远程skill吗

利用wiki来实现远程skill，天然有两个好处：

1. 保持更新最新版本
2. 人可读

本wiki非常重视人可读这个问题。AI很喜欢写很冗杂的内容，虽然非常正确，但是skill的价值是独特的业务知识和技巧，也就是一些个性化（符合个人口味，个人操作顺手，掌握熟练）和符合业务场景（可能普遍场景是错误的，只有在特定场景才正确）的内容。并且随着经验增长，人的想法也会变化，只有人可读，人才能编辑。AI把自己的知识复述一遍是没有价值的，随着以后模型能力增长，老模型的内部知识甚至可能起到反作用。

所以skill一定要人可读，借助本wiki，人读起来会很舒服很舒服。从这个角度，AI吸纳别人的skill，一定要文本翻译，而不是简单复制。

在这个想法下，用wiki来作为skill会面临哪些什么问题，以及如何解决呢，整理如下：

1. 需要手动触发：frontmatter里的skill描述不起作用了
2. 对于assets里的资源或者脚本，可能要多一步下载
3. 权限摩擦：即便用 `curl xxx | bash` 也很容易被权限审核
4. 出错排查：远程执行看不到源码，有时候还需要临时编辑这个脚本

对于问题1，frontmatter是SKILL.md的压缩，因为人是确认这个skill要用于是复制的是完整 SKILL.md 所以frontmatter其实就不重要了。不过吸纳skill的时候也不用丢掉它，忠实保留、把 name 和 description 译成中文就行，反正复制的时候会被去掉。那么人如何复制呢，最新zensical的官方插件有一键复制功能，直接把skill的首页内容复制进去，这样直接省略了一步让AI主动去xxx URL拉取这个步骤，而且直接变成人的prompt了，而不是让AI自己去curl。

对于问题2，可以用管道符号让AI一行命令进行下载并运行，但是如果要反复调用，那就要多次下载，而且很容易权限摩擦（也就是后面的问题3）和不好排查问题（问题4），curl 脚本并直接运行看起来就太吓人了，所以我想好的办法还是部署之前进行一个skill的打包。那这样岂不是回到了本地安装skill吗？有点这个感觉，挺像的，但还是有一些微妙的差异，感觉像是一次性的skill。

skills里还有一些 allowed-tools 的内容，远程用的时候不生效。我觉得服务提供商不应该去介入客户端内部，所以不生效也不可惜，吸纳时原样留着就行。

## 问题2: 能替代插件吗

根据官方 Plugins overview [^overview]，现在一个插件有以下几个部分组成：

- skills
- hooks 钩子
- agents 
- commands
- mod
- MCP 服务器


### commands：几乎无损

官方已经把斜杠命令并进 skills，即便真的要用，借助之前的一键复制功能就好了。如果要传入参数，那么一键复制的时候来输入吧。

### agents：提示词照搬，约束由硬变软

子 agent 定义的主体是一段系统提示，这部分是文字，skill 里写「派一个子 agent，提示词如下」就能复现。丢的是 Claude Code 层的硬约束：工具白名单（只读 agent 真的写不了文件）、指定模型、按 description 自动委派。白名单退化成提示词里一句「不要改文件」。总之还是那句话，服务提供商不应该去介入客户端内部，所以丢掉也不可惜。

### hooks和mod：必然变成大概率，拦截能力全失

hook 是 Claude Code 在生命周期节点自己跑的命令，不经过模型 —— PreToolUse 拦危险命令，PostToolUse 改完自动格式化，SessionStart 开局注入上下文。写成 skill 就成了「每次改完记得跑 X」，上下文一长、一压缩就会忘。拦截类 hook（exit 2 拒绝执行）**完全无法替代** —— 劝阻不等于阻止。

hooks 是到点在外面另起进程跑一条命令，mod 是装进 Claude Code 进程里的 JS 函数[^mods] —— 能在对话旁边画面板、重画工具调用那一行、扣住一次工具调用先问用户、加一个不经过 Claude 回合就立即执行的 `/命令`。这些全是对界面和事件流的操作，没有一样是给模型看的文字，skill 连降级的余地都没有。

总之就是基本全部丢掉。从而失去自动编辑，添加，压缩prompt的能力。所以问题变成能不能接受失去精细化操控能力。

### MCP：能力够得到，接口、状态、密钥隔离都丢

MCP 给模型新增工具，背后是一个随会话常驻的进程。skill 只能教模型用现成工具（curl、某个 CLI）去够同样的能力，前提是有 Bash 权限。丢三样：

- 结构化接口 —— 工具参数有 schema 校验，换成手拼 curl 容易错
- 状态 —— 长连接、登录会话、缓存都没了，每次 Bash 调用都是一次性的
- 密钥隔离 —— MCP 进程自己拿 token，模型看不见；skill 方式下 key 要过模型的命令行，进上下文也进日志

但是现在的流行趋势就是用skill代替mcp。MCP有本地的和远程的，本地MCP改成用终端命令，现在模型调用终端命令行的能力太强太强了，传个参数根本是小case，所以mcp中结构化接口优势根本不存在。至于密钥的话，测试起来写一个 .env ，大模型自己source，或者预先source都可以。

## 小结

| 部分 | 谁执行 | 换成 skill 后 | 丢什么 |
| --- | --- | --- | --- |
| skills | 模型读 | 原样 | 开局在场、frontmatter 约束（换来零常驻） |
| commands | 模型读，用户点名 | 点名触发 | 短入口、预执行 |
| agents | 模型读 + Claude Code 约束 | 提示词照搬 | 工具白名单、指定模型 |
| hooks | Claude Code 跑脚本 | 叮嘱模型 | 必然性；拦截能力 |
| mod | Claude Code 进程内跑 JS | 无 | 全部 |
| MCP | 常驻进程 | 教模型用 CLI / curl | schema、状态、密钥隔离 |

**skill 能替换插件里「告诉模型怎么做」的那一半，替换不了「Claude Code 自己执行」的那一半。** 可行的形态是薄本地壳 + 厚远程内容：本地只留一行 CLAUDE.md 入口（或一个 SessionStart hook 把 `llms.txt` 拉进上下文）解决触发，非拦不可的少数 hook 留在本地，其余全走网络。

根据本文的理论，衍生出了本站的 skill 收纳方案：[收纳 skill](../../skills/wiki-guide/skill.md)。

[^overview]: [Plugins overview](https://code.claude.com/docs/en/plugins/overview) —— Claude Code 官方文档，2026-10-14 读。
[^mods]: [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview) —— Claude Code 官方文档，2026-10-14 读。原文专门澄清两种都叫 hook：mods 页里的 hook 指 mod 的函数，配置文件里那种改叫 settings hook。
