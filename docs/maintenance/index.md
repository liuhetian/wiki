---
description: "维护板块：skill 和 Agent 能力背后的事，分两部分：Agent 基础能力背后的选型实测、上游来源和没做的事，一个能力一篇；外部 skill 的吸纳记录，一个 skill 一篇；Gallery 收录的来源和改动，一个来源一篇；细讲的项目读的版本和素材来源，一个项目一篇；实测流水线用的示例 skill。AI 正常使用不用看，出问题或要改做法时再看"
---

# 维护

能力页和 skill 页只写怎么用。为什么这样选、从哪来、改过什么、实测过什么、还有什么没做，都放在这里。AI 正常使用时不用看，出问题或者要改做法时再看。

## Agent 能力 { #agent-io }

[Agent 基础能力](../skills/agent-io/index.md)的维护记录，一个能力一篇。

- [读 PDF 脚本](pdf-reading.md) —— pdfium 和 pdf-inspector 的实测对比，吸收的两个 DSH 社区插件
- [网络搜索和读取网页](web-search.md) —— 默认的 Sonar Pro Search 经海外中转实测耗时、价格和引用格式；2026-10-18 换上 DeepSeek 官方 Search、Fetch 接口，官方指南存档，实测摘要长度、搜索语法和抓取会丢什么
- [语音合成](tts.md) —— AutoDL 上 IndexTTS2 的接口是怎么找到的，冷启动和 data URI 参考音频的实测；方案二为什么从 Gemini 换成微软 MAI-Voice：9 个直接出 mp3 的模型同文对比，Gemini 只出 pcm 的坑；OpenRouter 上能克隆的 Fish Audio、Seed Audio 实测
- [图片生成](image.md) —— CodeProxy 的 gpt-image-2.5 经海外中转实测生成和编辑，返回格式和模型列表
- [音频转录](transcribe.md) —— OpenRouter 的 MAI-Transcribe-2 经海外中转实测两种传法、时间戳和说话人分离，段落起止要开 diarization 才准
- [视频生成](video.md) —— AutoDL 工作流列表怎么找到、价格怎么换算，16 个视频工作流只收 8 个的理由，文字加图生成和首尾帧各实测一次
- [音乐生成](music.md) —— 为什么选 OpenRouter 上的 Lyria 3、不选 Suno，请求格式从哪两份文档推出来，没实测
- [阅读视频](read-video.md) —— 从视频笔记的关键帧和转写脚本里拆出来；静音检测、拼图按格子缩放、短拼图少几行是这次补的；2026-10-17 实测 B 站、小红书、抖音和单个视频文件
- [解析分享链接](share-link.md) —— 为什么媒体走下载狗、正文作者走 TikHub，为什么写成脚本、B 站为什么并进来；下载狗对小红书各字段稳不稳，正文、作者、点赞收藏都拿不到，轮播视频没有原图；TikHub 补齐这些的实测和单价；作者主页翻页为什么收进来、实测；公众号为什么直接取文章页，视频号为什么没接
- [结构化判断](jev.md) —— OpenRouter 的 Jev 1.13 的请求格式从哪查来，经海外中转实测两个端点、三种题，含糊材料概率落在中间；2026-10-10 照调研接入微软、OpenAI、Mercury 三家，调研原文存档，四家同题实测：单价一样计费 token 差 3.5 倍，图片只有 OpenAI 和 Mercury 看得了

## Skill 吸纳 { #skills }

从别人那里吸纳来的 skill，一个 skill 一篇：上游、commit、跳过了什么、翻译之外的改动。写法见 [收纳 skill](../skills/wiki-guide/skill.md#maintenance-record)。

- [盘问我（grilling）](skills/grilling.md) —— 吸纳自 mattpocock/skills，钉在 95249b0，正文逐段中译
- [带文档盘问（grill-with-docs）](skills/grill-with-docs.md) —— 吸纳自 mattpocock/skills，钉在 49dd158，连同依赖的 domain-modeling 一起中译；domain-modeling 放进目录当子 skill，加了往 `CLAUDE.md` / `AGENTS.md` 留指针的一步
- [初始化项目（init-project）](skills/init-project.md) —— 吸纳自 multica-ai/andrej-karpathy-skills，钉在 2c60614，中译后改成让 AI 写进 `CLAUDE.md` / `AGENTS.md` 的形态；EXAMPLES.md 等其余文件跳过
- [从图反推 prompt（get-prompt-from-image）](skills/get-prompt-from-image.md) —— 吸纳自 wuyoscar/GPT-Image2-Skill，原作者 LunarXuan，钉在 05cb113，全文中译；图片提示词反推的完整版
- [七维拆解](skills/seven-dimensions.md) —— 整理自 linux.do 帖子《图片提示词反推》，原文和配图存档在 skill 目录的 `assets/`；图片提示词反推的简化版
- [整理视频为笔记（video-note）](skills/video-note.md) —— 吸纳自 Rimagination/bili-note，钉在 08fe812；2026-10-17 改名，拆成下载、分析、输出三段，前两段并进 agent-io，本 skill 只留证据索引、篇幅预算和打分
- [花卉动态生长海报（flower-growth-poster）](skills/flower-growth-poster.md) —— 整理自抖音「小洁AI实战」的设计教程；即梦平台存技能的操作和 Seedream、Seedance 的型号跳过，模型换成 agent-io 的 gpt-image-2.5 和 MiniMax H3 首尾帧；prompt 照画面关键词自己写，首帧改成截海报纸纹，补了接成循环一步
- [anidoodle 代码手绘](skills/anidoodle.md) —— 吸纳自 alexgreensh/anidoodle，钉在 25aae33，73 篇文档全文中译；6 个撞网址或当不了索引的文件改名，正文路径改成相对链接，风格索引加配方列；registry.mjs 不再覆盖中文索引，docs-check.mjs 和 README 演示素材跳过
- [对话提示词（chat-prompts）](skills/chat-prompts.md) —— 取自 prompt-cards.cyanfish.site 的 17 段对话 prompt，钉在 JS 包 index-IivKxZ0S.js；去掉卡牌包装按场景重组，修补了架构先知和深度天赋挖掘机各一处；说人话取自小红书 Krypto说AI 的《让AI说人话》，原文和图存档在 skill 目录
- [调研项目（project-research）](skills/project-research.md) —— 粗讲项目由 2026-10-19 介绍 bili-note 的对话提炼，细讲项目由 2026-10-20 拆解梨园的对话提炼，写书由 2026-10-23 讨论调研分阶段的对话提炼，没有外部上游；2026-10-20 从对话提示词挪出来单独成 skill
- [HyperFrames 视频（hyperframes）](skills/hyperframes.md) —— 吸纳自 heygen-com/hyperframes，钉在 46f6cb3，21 个 skill、328 篇全文中译，脚本模板原样随附；FRAME.md 的 frontmatter 不译，各子 skill 入口末尾加文件清单
- [去 AI 味（qu-ai-wei）](skills/qu-ai-wei.md) —— 吸纳自 LifelongLazyLearner/qu-ai-wei，钉在 ed35e74；上游本来是中文，SKILL.md 和九份规则表原文照录，只把外链挪进脚注
- [檄文（xi-wen）](skills/xi-wen.md) —— 吸纳自 YuanZHAO321/XiWen，钉在 eb32d38；上游本来是中文，主文件、四份精讲、五篇底本古檄原文照录，入口的文件路径改成链接
- [Dashboard（open-dashboard）](skills/dashboard.md) —— 蓝本 ahpxex/open-dashboard，钉在 aa9815f；Invariants 提炼成各篇「规矩」，实现换成自研 demo，原文不存档，只留两份系统级契约
- [Lieflat Charts（lieflat-charts）](skills/lieflat-charts.md) —— 蓝本 larashero3-dotcom/lieflat-charts，钉在 e5b369d；48 张图拆成一图一页，每页嵌可运行 demo、文末钉模板永链
- [手绘风格出图（handraw-style）](skills/handdraw.md) —— 吸纳自 yang0/handraw-style（MIT），钉在 2a25a07（1.9.1）；skill 全文中译重组，Gallery 的手绘风格库、排版、色彩三区是它的数据，收录记录写在同一篇
- [配图：手绘信息图](skills/infographic.md) —— 写作规范的配图做法，2026-10-20 拆解梨园时定下，替换马克笔草图；拼法取自手绘风格库，梨园 11 张图各用的排版、改字和返工的经过、为什么不检查
- [写真拍摄企划（photo-shoot）](skills/photo-shoot.md) —— 吸纳自 yang0/handraw-style 的 couple-photo-orchestrator（MIT 带署名），钉在 2a25a07；入口和总控 zongkong 合并，CORE_REQUIREMENTS 的规则并进各页，7 个子 skill 重组成入口加 6 个子 skill，生图换成 agent-io，9 个脚本随附、只改三行
- [东方仙侠视觉导演（xianxia-visual-director）](skills/xianxia-visual-director.md) —— 吸纳自 liyue-aigc/xianxia-visual-director（未附许可证），钉在 bd88617；SKILL.md 和 8 篇 reference 全文中译，放进新建的抽象 skill 视频生成，直接出图接 agent-io
- [获取热点（hot-topics）](skills/hot-topics.md) —— 2026-10-21 用户提议单开成标准 skill，一个信息源一篇；AIHOT 读的是接口 2.0.0，官方 Agent 使用说明存档，没装它的 Skill、没接 MCP 和 RSS，实测条件请求、links.story 还指旧域名；linux.do 日报只取小宇宙上的音频，为什么不走 linux.do 和汇总站
- [让布局说话（ui-no-labels）](skills/ui-no-labels.md) —— 取自一张水印 @Ainward 的手机截图，原帖链接没留，截图存档；英文原句译成中文，套用初始化项目写进 `CLAUDE.md` / `AGENTS.md` 的形态
- [PPT Master（ppt-master）](skills/ppt-master.md) —— 吸纳自 hugohe3/ppt-master（MIT），钉在 523e5bd（6.7.3）；只收规划、沟通模式、配图写法和三份风格目录，流水线不收、引导客户端装上游；规划和配图是提炼改写，其余中译

## Gallery 收录 { #gallery }

Gallery 里别人的成品从哪来、收的时候改了什么、上游更新了怎么同步，一个来源一篇。本站自己做的成品不在这里，做法写在成品页上。

- [GPT Image 2 图库](gallery/gpt-image2.md) —— 收录自 wuyoscar/GPT-Image2-Skill（MIT），钉在 05cb113；只收图库部分，31 页全文中译、只留图和 prompt，混进来的 prompt-cards 条目不算上游
- [prompt-cards 生图条目](gallery/prompt-cards.md) —— 取自 prompt-cards.cyanfish.site 的内置卡组，10 条追加在 GPT Image 2 各页末尾；站点没仓库，版本钉 JS 包的文件名和哈希，6 条英文原文照录
- [二次元平面设计风格](gallery/linux-do-style.md) —— 整理自 linux.do @sallyn 的帖子，23 张配图、原帖全文和主楼附件存档在 assets/；第 21 楼以后没抓到
- [小红书拍照姿势](gallery/xhs-poses.md) —— 取自小红书「我的id是江苏美人」的 59 篇图文，经 agent-io 取原图，529 张原样收录；57 篇首图是拼图，没收
- [手绘风格库、排版、经典主题色](skills/handdraw.md) —— 收录自 yang0/handraw-style，和 skill 的吸纳记录写在同一篇
- [PPT 视觉风格、配图画风、配图版型](skills/ppt-master.md) —— 收录自 hugohe3/ppt-master，和 skill 的吸纳记录写在同一篇
- [图片区零散收集](gallery/images-collected.md) —— 人像写真模板、一杯狗海报、旧刊物海报，单条收进来的 prompt 各自的出处和改动
- [色彩区零散收集](gallery/colors-collected.md) —— 意象渐变配色，抖音图文原图原样收录，主题色 prompt 照色卡转录
- [视频区零散收集](gallery/video-collected.md) —— 彩色手绘三维穿梭视频，收录自 makerjackie/parallax-ink-video-skill，渲染工程原样收录，配乐配音换成 agent-io

## 项目 { #projects }

[项目](../projects/index.md)里细讲的别人的项目每个一篇：读的哪个版本、许可、存档和素材从哪来、实验怎么跑的。

- [梨园 Liyuan](projects/liyuan.md) —— 读的是 1e9448e（2026-10-19 读），PolyForm Noncommercial 许可；源码存档、行号、截图、配图各从哪来；细讲页的效果块怎么实跑出来的，脚本附后
- [酒馆 SillyTavern](projects/sillytavern.md) —— 读的是 06bde93（1.19.0，2026-10-20 读），AGPL-3.0 许可；源码存档和行号；效果块怎么实跑出来的：Node 加载钩子原样加载酒馆前端模块、界面依赖换成桩，模型请求另起进程发；脚本附后
- [DeepSeek Harness](projects/deepseek-harness.md) —— DeepSeek Harness 拆解的维护记录：读的是 687f282（2026-10-20 读），MIT 许可、Landlock 启动器子包 BSD-3；存档和行号怎么对；六条线怎么实跑、密钥怎么隔离、模型用量多少，脚本附后
- [OpenAI Evals](projects/openai-evals.md) —— OpenAI Evals 拆解的维护记录：读的是 8eac7a7（2026-10-20 读），MIT 许可；源码存档和行号怎么对、几份题库样本怎么从 LFS 取的；注册 eval 的计数口径；只读源码，没有实跑

## 实测用的示例 { #fixtures }

验证流水线时搭的 mock skill，不解决实际问题。

- [测试skill](mock-bundle/index.md) —— mock 抽象 skill，演示带脚本的 skill 怎么远程用、怎么整包用：两个子 skill 各带一个 foo.py、互相引用，其中一个脚本跨目录 import 另一个；改打包流水线或写带脚本的 skill 时拿来对照
