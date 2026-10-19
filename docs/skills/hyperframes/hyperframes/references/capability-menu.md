<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/capability-menu.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 能力菜单 —— HyperFrames 能给视频带来什么

一份清单，三类读者。**提案轮**（`pitch-round.md`）在任何人把它当菜单读之前就先把它说出来了：每个提案都会点出它的概念所依托的一两项能力，措辞取自中间那一列 —— 这些行被融进概念里来体验，大多数用户正是这样第一次知道自己可以要什么。**意图层**（`/hyperframes` → `references/intent-interview.md` 第 7 步）从中推荐 —— 推荐确认后的概念明确需要、而选中的提案尚未点出的一两行，用户问还能做什么时再展示按路由筛选后的部分。**companion 模式下的 `/general-video`** 把同一份清单当作执行地图 —— 当作它的**触发清单**：每一行的大白话描述也正是提出它的时机，即对话触及这一行所做的事情时 —— 同时也当作每一轮的**升级渠道**：计划、草图或构建检查点都可以附带一两条有据可循的提议，指向用户正在看的素材。

**借用规则。** 标注了归属工作流的能力位于那个工作流的 skill 目录里，而工作流 skill 是按需安装的。跨过去借用之前，先用裸名运行 `npx hyperframes skills update <that-workflow>`。解析出已安装的 skill 目录，按绝对路径调用它的脚本，脚本接受项目根目录参数时就显式传入。工作目录保持在项目根目录。绝不假定 `../media-use` 或 `../music-to-video` 这类兄弟相对路径；项目可能位于任何地方。

每一行的最后一列按 **归属 → 入口 → 得到什么** 来读：负责的 skill、开始时要看的确切文档或命令，以及返回的产物。

| 能力 | 对用户这样说…… | 归属 → 入口 → 得到什么 |
| --- | --- | --- |
| **设计规范（`frame.md`）** —— 一个锁定色板、字体和布局感觉的文件；每一帧都遵守它（相当于网页 `design.md` 的视频优先版本） | "为这支视频定一套设计系统 —— 颜色和字体排印保持一致" | `/hyperframes-creative` → `references/design-spec.md`（规范是什么 + 解析顺序）；preset：`frame-presets/<name>/`（始终已安装 —— 浏览时无需借用）；应用机制 `build-frame.mjs`（归属：`/faceless-explainer`、`/product-launch-video`）→ 项目根目录下的 `frame.md`。怎么问：见下文 **§ 设计提问** |
| **网站抓取** —— 用无头 Chrome 爬取真实网站：截图、品牌 token、素材 | "我可以抓取你的网站，照它真实的样子来做" | CLI → `npx hyperframes capture <URL> -o ./capture` → `capture/`（截图、提取出的 token / 文字 / 素材）；方法论：`/product-launch-video` |
| **节拍分析与音频响应动效** —— 一条音轨的确定性节拍 / 能量图；剪切落在网格上，元素随音乐律动 | "如果有音乐，我可以按它的节拍剪视频 —— 还能让元素随音乐动起来" | 网格：`/music-to-video` → `scripts/analyze-beatgrid.py` → `audiomap.json`（节拍、能量、段落）；元素响应：`/hyperframes-creative` → `references/audio-reactive.md` + `scripts/extract-audio-data.py` |
| **动效蓝图** —— 经过验证的场景形态（揭示、计数器、图表、立体场景），按段落节拍挑选 | "每个场景都用经过验证的动效处理，而不是即兴乱动" | `/hyperframes-animation` → `blueprints-index.md` + `rules-index.md` → 构建时读取的逐段落节拍 `blueprint:` id |
| **声音、音乐、音效、图片、logo、媒体处理** —— 获取好的媒体，外加感知来源的调色、效果、隐私处理、出场和有理由的 overlay | "旁白、音乐、音效、真实素材 —— 还有为贴合故事而打磨或风格化的素材画面" | `/media-use`（宿主应用自带的音乐和音效工具优先用于这两类）→ 确定性的获取 / 操作工具外加 `references/media-treatments.md`；shader 像素通过 `hyperframes media-treatment` 持久化，可选的 overlay 来自 Registry，有限时长的动效使用宿主的 GSAP timeline |
| **生成式视频** —— AI 主持人念出脚本；一张静态照片变成会说话的片段；成片被配音成另一种语言 | "AI 主持人可以出镜念你的脚本；我可以把一张照片做成会说话的片段，或者给视频配音" | `/media-use` → `references/operations.md` § Generate: video（`heygen video create` / `video-translate`；符合条件时用 OAuth 免费额度）→ 一个被纳入 `assets/` 的 mp4 片段 + manifest 记录 |
| **转录与字幕** —— 带逐词时间的转录稿；成片上加风格化的字幕皮肤 | "准确的字幕，样式和片子相配" | `/media-use` → `scripts/transcribe.mjs` → 带逐词时间的转录稿；字幕机制 `captions.mjs`（归属：`/faceless-explainer`）→ 字幕 track |
| **按转录稿剪素材画面** —— 通过选句子而不是时间码来修剪片段 | "我可以通过挑出要保留的句子来修剪你的片段" | `/media-use` → `scripts/transcript-cut.mjs` → 修剪后的片段 + 更新后的转录稿 |
| **用户素材画面上的设计 overlay** —— 与讲话内容同步的动态标题、lower-third、数据标注 | "你自己的片段可以带上设计过的标题和信息条，与讲话同步" | **整个需求** = `/talking-head-recut` 路由 —— 路由过去，不要重做一遍；**大作品中的一个场景** = `/hyperframes-animation` 的 lower-third / 标注蓝图 + `/talking-head-recut` 的安全区思路 → 叠在素材画面 track 上的 overlay composition |
| **真实地图场景** —— 真正的底图，带定位的图钉、路线或飞行轨迹 | "涉及地点和行程时 —— 用真实的地图，而不是画一张地图" | `/motion-graphics` → `grounding/locate.mjs`（地理编码）+ `categories/maps/`（含 `bake-basemap.mjs`）→ 确定性烘焙的底图 + 定位好的图钉 |
| **Figma 导入** —— 素材、品牌 token、component，以及被读作动效状态的分镜帧 | "如果设计在 Figma 里，我可以直接照它来做" | `/figma` → REST/CLI 导入（Motion / shader 另用 MCP）→ 经过净化的 SVG、绑定到 `var()` 的品牌 token、作为状态的帧 |
| **Registry block** —— 50 多个可安装的场景 composition（数据图表、设备样机、引言卡片……） | "现成的场景，可以直接放进来再改样式" | `/hyperframes-registry` → `npx hyperframes add <block>` → 一个安装好的 sub-composition（接线：`references/wiring-blocks.md`） |
| **场景转场** —— 场景之间的切、交叉淡化、擦除、WebGL shader 转场 | "一个场景如何交接给下一个 —— 最高可以做到完整的 shader 擦除" | `/hyperframes-animation` → 先看 `transitions/overview.md`，再看 `transitions/catalog.md`；组装 `transitions.mjs`（归属：`/faceless-explainer`）→ 注入到 index 里的交接 |
| **timeline 上的用户媒体** —— 用户自己的图片 / 片段，放置并编织进各帧 | "把你自己的素材画面、截图或照片放进视频" | 放置 `stage-assets.mjs`（归属：`/music-to-video`、`/product-launch-video`）；纳入：`/media-use` `--adopt` → `assets/` 里的文件 + manifest 记录 |
| **发布到稳定链接** —— 成片放到一个默认私有的托管 URL 上；重新发布会更新同一个链接 | "做完后我可以把它发布到一个稳定的链接 —— 默认私有，你要求时也可以公开" | `/hyperframes-cli` → `references/preview-render.md`（`npx hyperframes publish`）→ 一个可见性明确的稳定托管 URL |

提出来，而不是一股脑倒出来：意图层推荐确认后的概念本身需要的一两行，每行用一句有 brief 依据的大白话说明，只问一次 —— 用户要求时给出按路由筛选的部分，companion 模式给出整张表。

## 设计提问 —— 已有、挑一个，或者交给工作流

设计规范这一行是一个三态问题，而不是一段讲解（规范**是**什么留在 `design-spec.md` 里讲）：

- **用户已经有了。** 品牌规范、一份 `frame.md`、一份 `design.md` —— 把路径记在 `BRIEF.md` § Assets 里；工作流把它当作品牌事实来读（解析顺序：`/hyperframes-creative` → `references/design-spec.md`）。
- **用户没有，但在意外观 —— 给他看，而不是报名字。** 挑 2–3 个外观契合内容、语气和受众的内置 preset（浏览 `/hyperframes-creative` → `frame-presets/`），在浏览器里打开每个 preset 的 `frame-presets/<name>/frame-showcase.html`，让用户**凭眼睛**挑，绝不从一串名字里挑。选择结果以 `style_preset` 记进 `BRIEF.md` —— 这是一个会被记住的偏好键，所以下一次运行时它就是附带依据的推荐答案。在会抓取真实网站的路由上，打开这些展示页时要老实说一句：展示页用的是 preset **自己的**色板，网站的品牌色和字体会被重新混搭到最终选中的那个 preset 上 —— **挑的是布局骨架，不是颜色** —— 并提供另一个选择：把挑选推迟到抓取之后，那时可以拿着真实品牌来判断外观（这是一个声明过的延后提问；无论哪种方式，草图轮都会在投入任何昂贵的构建之前展示混搭后的真实效果）。
- **用户不在乎 —— 或者内置的都不合适。** 不在乎：不再追问；由工作流的设计步骤决定并说明理由。都不合适：把**设计选择器（design picker）**作为一个延后提问预告出来 —— 工作流的设计步骤会根据用户的内容生成情绪板供其挑选（`/hyperframes-creative` → `references/design-picker.md`）；它需要一个项目和一轮生成，所以绝不在意图对话里运行。

## 类型视角 —— 内置工作流的品味，可以借用

各个叙事类工作流都带有针对其类型调校过的设计参考 —— `story-design.md`（叙事原型和段落节拍）、`visual-design.md`（该类型的外观）、`motion-language.md` + `cut-catalog.md`（动效和剪切的方法论）。当一个 companion 或自由形式的作品与某个类型相似时，在为它做计划或构建之前，先读那个工作流的视角（遵循上面的借用规则）：

| 作品类似于…… | 从这里借用 |
| --- | --- |
| 产品宣传片 / 发布视频 / 网站展示 | `/product-launch-video` → `references/` |
| 话题 / 机制 / 概念讲解 | `/faceless-explainer` → `references/` |
| 代码改动讲解 | `/pr-to-video` → `references/`（代码画面另加 `code-vocabulary.md`） |

`motion-language.md` 和 `cut-catalog.md` 在这三者之间几乎一模一样 —— 从你已经接近的那个类型里拿，或者把 `/faceless-explainer` 的那份作为中性默认。**借用形态和品味，绝不借用机制**：它们的脚本和目录规则属于它们各自的流水线；任何构建的通用后半段都在 `hyperframes/references/production-loop.md` 里。
