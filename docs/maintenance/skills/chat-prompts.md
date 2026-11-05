---
description: "对话提示词（chat-prompts）的维护记录：17 段取自 prompt-cards.cyanfish.site，去掉卡牌包装按场景重组，钉在 JS 包 index-IivKxZ0S.js；说人话取自小红书 Krypto说AI 的《让AI说人话》，上线体检取自公众号刘小排r 的《许愿式编程上线前，把这段话复制给你的AI》，原文存档在 skill 目录的 assets/"
---

# 对话提示词（chat-prompts）

[对话提示词](../../skills/chat-prompts/index.md)的维护记录。19 段 prompt 来自三处；概要项目（当时称粗讲）、细讲项目原来也在这里，2026-10-20 挪成了顶层的[调研项目](project-research.md)。

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

[说人话（80% STE）](../../skills/chat-prompts/ste-plain.md)取自这里。

- **上游**：小红书笔记《让AI说人话，1.3万人收藏了这招》[^xhs]，作者 Krypto说AI｜AI Builder，2026-10-02 发布，没写许可证。笔记转述 Karpathy 的一条长推：照飞机维修手册的写作规范 ASD-STE100 让 AI 写。笔记里三段中文 prompt 是作者把规范译成中文要求写的，不是 Karpathy 的原话
- **存档**：标题、正文存在 [`assets/xhs-6abf6887/post.md`](../../skills/chat-prompts/assets/xhs-6abf6887/post.md)，末尾按顺序贴 9 张图；同目录 `01`–`09` 是九张原图，1080×1440。2026-10-17 用 agent-io 的 [`xiaohongshu.py`](../../skills/agent-io/scripts/xiaohongshu.py)（当时还叫 `share_link.py`）抓的，背后是 TikHub 的 `xiaohongshu/app_v2/get_image_note_detail`
    - 作者小红书号 11311079803；发布时间 2026-10-02 16:17 是接口给的，第 1 张图上印的是 21:00；抓取时赞 351、收藏 645、评论 28、分享 92
    - 正文一字没改，原文里只有制表符的空行也照留；图片是 CDN 给的原尺寸，链接里的 `format/webp` 换成了 `format/jpg`，文件名按原顺序编号
    - 评论区没有抓
- **跳过**：只收第一段写作 prompt；画图、单文件网页两段 prompt 和「你想要的 → 用什么」那张表不收。作者自己的看法也不进 skill：视频治不了啰嗦、配 agent team 的经历、「AI 不会取代人」。Karpathy 的原推没有追
- **翻译之外的改动**：
    - prompt 一字没改；开头加一句「这一场对话都按下面这条规矩来」，照实事求是、范围铁闸的写法：作者说的用法是「存进常用提示词」，就是整场生效
- **没做的**：没有实测；作者自己也说中文句子该卡多少字还没想好，原 prompt 没写句长上限

## 公众号《许愿式编程上线前》 { #wechat-launch-review }

[上线体检](../../skills/chat-prompts/launch-review.md)取自这里。

- **上游**：微信公众号文章《许愿式编程上线前，把这段话复制给你的AI》[^wechat]，号名刘小排r（`gh_d56f73c13a02`），署名刘小排，2026-10-23 15:48 发布，没写许可证。开头那段中文审查要求是刘小排加的；后面的英文清单，他注明出自 Limestone Digital 创始人 Mark Ajzenstadt，本意是提醒觉得有了 Vibe Coding 就不需要程序员的人。Mark 的原帖没有追
- **存档**：标题、正文存在 [`assets/wechat-RURNTQi/article.md`](../../skills/chat-prompts/assets/wechat-RURNTQi/article.md)，一字没改。2026-11-05 用 agent-io 的 [`wechat_mp.py`](../../skills/agent-io/scripts/wechat_mp.py) 从文章页直接取，没花钱；正文没有图，封面没存
- **跳过**：清单结尾「Oh, and besides…」那句和 13 条「还需要什么人」—— 从代码里查不出来，AI 只能答「无法确认」；作者自己的看法：许愿式编程、「AI 懂不等于你懂」、「不是万能咒语」；文末「延伸阅读」链的另一篇没有打开
- **翻译之外的改动**：
    - 开头的审查要求一字没改，从代码块挪成页面正文，「要求：」下面五行改成列表
    - 147 条检查项译成中文，不增删、不改顺序；MFA、SSO、SAML 这类缩写保留原文
    - 原文是一整串引用行，按原顺序切成 16 组加小标题
    - 成本告警那条原文写「we learned this one for $1,382.59」，「我们」指原作者，改成「原作者为这一条付过 1,382.59 美元」，免得 AI 当成用户自己的事
- **没做的**：没有实测

[^site]: [prompt-cards.cyanfish.site](https://prompt-cards.cyanfish.site/)，2026-10-16 读。
[^xhs]: [让AI说人话，1.3万人收藏了这招](https://www.xiaohongshu.com/discovery/item/6abf6887000000000d02979c)，2026-10-17 读。
[^wechat]: [许愿式编程上线前，把这段话复制给你的AI](https://mp.weixin.qq.com/s/RURNTQi-DJ2WNcvyF-ZsDA)，2026-11-05 读。
