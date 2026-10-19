---
description: "对话提示词（chat-prompts）的维护记录：17 段取自 prompt-cards.cyanfish.site，去掉卡牌包装按场景重组，钉在 JS 包 index-IivKxZ0S.js；说人话取自小红书 Krypto说AI 的《让AI说人话》，原文和图存档在 skill 目录的 assets/；粗讲项目由 2026-10-19 介绍 bili-note 的对话提炼"
---

# 对话提示词（chat-prompts）

[对话提示词](../../skills/collab/chat-prompts/index.md)的维护记录。19 段 prompt 来自三处。

## prompt-cards.cyanfish.site { #prompt-cards }

17 段取自这里。

- **上游**：prompt-cards.cyanfish.site「神级 AI 提示词卡牌图鉴」[^site]，未署名作者，站内没声明许可证。站点内置 27 张卡，对话类 17 张收在这里，生图类 10 张进了 Gallery，来源见 [Gallery 那边的维护记录](../gallery/prompt-cards.md)。这 17 段写法不统一（三种占位写法，两段是 LangGPT 式人设），像是从多处收集来的，别当成站长原创
- **commit**：站点没有公开仓库，钉构建产物：`assets/index-IivKxZ0S.js`，sha256 `84f6f63f7b027ac9eda3e72701d775ce499d9605ea2504a18287978b7dc72727`，last-modified 2026-08-22；2026-09-28 首次抓取，2026-10-16 复核哈希没变
- **跳过**：生图类 10 张（进 Gallery）；卡面插画；JS 包本身；站点的「添加」「卡包」功能，只读写访问者本机的 IndexedDB，别人加的卡服务器上没有
- **翻译之外的改动**：
    - 去掉卡牌这层包装：卡牌、稀有度（N / R / SR / UR）、卡名前缀「角色·」「流程·」「约束·」、站点的角色 / 流程 / 约束三分类都不要；按使用场景重分五组，一段 prompt 一个迷你 skill，`name` 取卡名去掉前缀，文件名自己起
    - prompt 从代码块挪成页面正文，列表前补空行；两段人设去掉开头的「# Role：…」，其余分节照留；人生设计师「三个五年版本」那三行改成缩进列表
    - 占位一律改成[填空](../../skills/wiki-guide/reference/components.md#fill)输入框，`{{idea}}`、`{{draft}}`、`{{symptom}}`、`{{concept}}` 和【…】都算：只填一样东西的用单行框，要粘贴或要写好几样的用多行框，多行框后面的「。」去掉；提示炼金原文用【】标两个输出段，改成「」，免得和空着复制出去的【…】混
    - 事实核查、纵横分析法开头加一句：要能联网，搜不了先说
    - 架构先知第 3 条补「只有一种合理解法时，说明为什么，只给一个」—— 原文硬性要求 2 个方案，只有一种解法时模型会硬凑
    - 深度天赋挖掘机补第 6 条对话规则：问缺点、嫉妒之前先征求同意，情绪脆弱时跳过 —— 人生设计师有这条防护，它追问的话题更敏感却没有
    - `description` 由站点的一句话摘要改写成什么时候用、做什么；入口页页尾加维护记录的链接

站点 id 和文件的对应，同步上游时按这张表比对：

| 站点 id | 文件 | 站点 id | 文件 |
|---|---|---|---|
| `flow-socratic` | `socratic.md` | `flow-dual-explain` | `dual-explain.md` |
| `flow-first-principles` | `first-principles.md` | `trap-plain` | `plain-talk.md` |
| `flow-cross-domain` | `cross-domain.md` | `flow-refine` | `prompt-refine.md` |
| `flow-steelman` | `steelman.md` | `role-critic` | `critic.md` |
| `flow-expert-panel` | `expert-panel.md` | `role-architect` | `architect.md` |
| `flow-fact-check` | `fact-check.md` | `trap-scope` | `scope-lock.md` |
| `flow-cross-axis` | `cross-axis.md` | `role-talent-miner` | `talent-miner.md` |
| `flow-debug` | `root-cause.md` | `role-life-designer` | `life-designer.md` |
| `trap-facts` | `seek-truth.md` | | |

## 小红书《让AI说人话》 { #xhs-ste }

[说人话（80% STE）](../../skills/collab/chat-prompts/ste-plain.md)取自这里。

- **上游**：小红书笔记《让AI说人话，1.3万人收藏了这招》[^xhs]，作者 Krypto说AI｜AI Builder，2026-10-02 发布，没写许可证。笔记转述 Karpathy 的一条长推：照飞机维修手册的写作规范 ASD-STE100 让 AI 写。笔记里三段中文 prompt 是作者把规范译成中文要求写的，不是 Karpathy 的原话
- **存档**：标题、正文存在 [`assets/xhs-6abf6887/post.md`](../../skills/collab/chat-prompts/assets/xhs-6abf6887/post.md)，末尾按顺序贴 9 张图；同目录 `01`–`09` 是九张原图，1080×1440。2026-10-17 用 agent-io 的 [`xiaohongshu.py`](../../skills/agent-io/scripts/xiaohongshu.py)（当时还叫 `share_link.py`）抓的，背后是 TikHub 的 `xiaohongshu/app_v2/get_image_note_detail`
    - 作者小红书号 11311079803；发布时间 2026-10-02 16:17 是接口给的，第 1 张图上印的是 21:00；抓取时赞 351、收藏 645、评论 28、分享 92
    - 正文一字没改，原文里只有制表符的空行也照留；图片是 CDN 给的原尺寸，链接里的 `format/webp` 换成了 `format/jpg`，文件名按原顺序编号
    - 评论区没有抓
- **跳过**：只收第一段写作 prompt；画图、单文件网页两段 prompt 和「你想要的 → 用什么」那张表不收。作者自己的看法也不进 skill：视频治不了啰嗦、配 agent team 的经历、「AI 不会取代人」。Karpathy 的原推没有追
- **翻译之外的改动**：
    - prompt 一字没改；开头加一句「这一场对话都按下面这条规矩来」，照实事求是、范围铁闸的写法：作者说的用法是「存进常用提示词」，就是整场生效
- **没做的**：没有实测；作者自己也说中文句子该卡多少字还没想好，原 prompt 没写句长上限

## 本站对话 { #own }

[粗讲项目](../../skills/collab/chat-prompts/project-gist.md)是从本站一次对话里提炼的，没有外部上游。

- **来源**：2026-10-19 让 AI 介绍 Rimagination/bili-note。第一版分目录、四层、演进讲，太细，用户说「就很粗地讲就好，不需要整理目录，就直接几句话讲」；第二版四段话，用户认可：「很好，就是想要这种总结」
- **怎么提炼的**：第二版成立靠读了源码 —— 用户以为它就是下载视频加转文本，代码里视频只在开关键帧时才下、转写是第三级兜底；取材那层代码最多，重心却在写前定篇幅。所以 prompt 要求先读源码，重心不按代码量判断。四段的骨架照第二版抽：先纠正原来的理解、说清程序和人的分工、点出重心配一个机制
- **探索选项**：用户随即要求加的：「对于大型项目，需要AI先探索项目，然后寻找里面的亮点或者更多读者都不知道有的部分，这需要一步一步讨论，需要参考 盘问我 这个skill」。加了一个默认「否」的选择，选「是」就先摸遍项目、列亮点，照[盘问我](../../skills/collab/grilling.md)一轮轮挑方向，确认后再讲，挑中的方向各多给一段；同时按用户要求删掉「我和它的关系」那一栏
- **改成分支写法**：同一天复制按钮加了[分支](../../skills/wiki-guide/reference/branch.md)，这页当活例，用户说「可以在这个skill上试试效果吗，几种场景都试一试」。试的时候加过「在哪用」两支（能读文件的 agent / 网页对话框，网页那支末尾带一个 `required` 的多行框），用户看过源文件说「把这一个写作方案沉淀到本wiki的对应位置，然后还原成正式版本」，正式版去掉了它。留下的：「先探索」的开关包 `zx-no-copy` 只给人看，「否」也写一支「读完直接讲，不用先问我」，原来靠复制出去的「：否」传话；「我原来以为它是」填了才复制
- **没做的**：只在 bili-note 上用过这一次，别的项目还没试

[^site]: [prompt-cards.cyanfish.site](https://prompt-cards.cyanfish.site/)，2026-10-16 读。
[^xhs]: [让AI说人话，1.3万人收藏了这招](https://www.xiaohongshu.com/discovery/item/6abf6887000000000d02979c)，2026-10-17 读。
