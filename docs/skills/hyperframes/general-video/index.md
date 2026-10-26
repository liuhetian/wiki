---
name: general-video
description: >
  在没有合适的专门工作流时，或者 BRIEF.md 设置了 flow: companion 时，编写或编辑一个自定义的 HyperFrames composition。用于较长或多场景的作品、品牌片和混剪集锦、蒙太奇、静态循环、静态标题卡、素材画面重混，以及自由形式的构建。时长短、无旁白、以运动为先的单元（包括动画标题）改用 motion-graphics。全新创作要先经 hyperframes 路由，再使用本 skill。
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

# General video

开始时运行 `npx hyperframes usage --json`，除非工作流刚刚读过它；然后在一些里程碑节点再检查一次，比如起草之后和渲染之前。读出可用的时间窗口和重置时间。如果用量未知，就如实说明，不要猜测额度；范围和工作流的选择交给用户决定。

在依赖本工作流之前，运行：

```bash
npx hyperframes skills update general-video
```

成功的空跑意味着 skill 已是最新。更新失败时要把失败摆出来，而不是凭记忆继续。

## 1. 应用横切的来源适配器

- **媒体：** 任何音频、图片、图标、logo、配音、调色、LUT、处理 / 效果、字幕或媒体操作的需求，都加载 `/media-use`，并遵循 `../media-use/references/resolve.md`（解析、采用、复用）和 `../media-use/references/setup-providers.md`（提供方、认证）。含糊的素材画面反馈和有名字的风格，在编辑之前先用 `../media-use/references/media-treatments.md`；不要用 CSS/SVG/opacity 即兴模拟已支持的媒体效果。在第一次需要认证的提供方操作之前，运行 `npx hyperframes auth status` 并逐字转述它的输出。如果未登录，应用 `../hyperframes/references/brief-contract.md` 里的闸门：协作模式等待登录或明确的离线选择；自主模式说明状态，然后通过一个可用的离线提供方继续。当没有任何离线提供方能满足某项必需能力时，把阻塞点摆出来。仅仅是本地采用素材，不需要认证闸门。
- **Figma：** 如果任何输入是 `figma.com` URL，先运行 `/figma`。基于它导出的素材、token、组件或分镜 frame 来构建。不要直接调用原始的 Figma 连接器，因为那样会跳过 SVG 清理、媒体来源记录和品牌 token 绑定。

这些适配器不会改变 `/hyperframes` 选定的工作流。

## 2. 从项目状态出发

应用第一个匹配的行；不要再评估下面的状态行：

| 状态 | 动作 |
| --- | --- |
| 具体的编辑 | 做这个编辑，保留项目已有的决定，然后重跑受影响的检查。不要重新开启需求探索。 |
| `BRIEF.md` 存在 | 读它。如果 `workflow` 点名了另一个工作流，并且 `flow` 不是 `companion`，就移交出去。不问任何 brief 问题。 |
| 没有 brief，但 `hyperframes.json` 或 `STORYBOARD.md` 存在 | 从文件和已记录的偏好恢复。只根据已知事实回填 `BRIEF.md`。 |
| 全新创作 | 运行 `/hyperframes` 及其意图层。只有在 `workflow: general-video` 或 `flow: companion` 时才回到这里。 |

对于新项目，根据 brief 选一个 kebab-case 的目录名，并在写 brief 之前先搭好脚手架：

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=general-video
```

然后用 `../hyperframes/references/brief-format.md` 在项目根目录写 `BRIEF.md`。在已有项目里，根目录就是包含 `hyperframes.json` 的目录。只记录 brief 格式点名的、已确认的、有偏好支撑的字段，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes <PROJECT_ROOT>`；绝不记录推断出来的默认值。这里 `<MEDIA_DIR>` 是已安装的 `/media-use` skill 目录，`<PROJECT_ROOT>` 是包含 `hyperframes.json` 的目录。如果意图层采用了某个配方，现在就用 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes <PROJECT_ROOT> --name <name>` 应用它，不要再问一遍。

## 3. 解读运行形态

只使用 `../hyperframes/references/brief-contract.md` 里的标准术语：

| 字段 | 含义 | 效果 |
| --- | --- | --- |
| `flow` | 谁来主导 | `automation`：选定路由并执行。`companion`：在对话中共同创作。 |
| `storyboard` | 构建前是否规划、画草图并评审 | `yes`：运行计划和草图评审（`storyboard.html`）。`no`：不经过它直接构建。 |
| 推导出的 `mode` | 检查点闸门如何表现 | 遵循 brief contract。绝不让用户说出一个模式名。 |

不要为这些状态自创同义词。持续的"直接做吧"信号由意图层处理，到这里时已经是 `flow: automation`、`storyboard: no`。

- 对于 `flow: automation`，选定路由，并在第一次进度更新里用一句话说明。
- 对于具体的编辑，直接做这个编辑，不要自创新的路由。

对于现有素材画面的硬切、修剪、拼接或重排，把同一个视频源复制成多个 clip 元素。在每个副本上，用 `data-media-start` 加 `data-duration` 设定源区间，然后用 `data-start` 设定编排后的位置 / 顺序。每个视频片段都保留自己的声音：声音留在 clip 上（`data-has-audio="true"`），所以切视频就会切掉它的声音。这种时间上的编辑归 `/hyperframes-core` 管；`/hyperframes-keyframes` 只用于视觉属性动画，比如内层包裹元素上的缩放、冲击推近、平移、裁切、遮罩或 `clip-path`。完整的契约从 `../hyperframes-core/references/creator-editing-recipes.md` 照抄。

### Companion 流程

当 `flow: companion` 时：

- 读 `BRIEF.md`，把已接受的 `## Assets` 和 `## Customizations` 与项目产物对账。把已接受但仍未完成的工作做完；已完成的工作不要动；不要把一项已接受的能力当作新的再提供一次。
- **以导演的身份到场，而不是承包商。** 选择 companion 的用户选择的是参与感和质量；诚实的回应是你能设计出的最好版本，而不是你能辩护的最小版本。第一份计划就是顶配方案：故事弧线（借用最接近的类型视角 —— 菜单 § Genre lenses）、设计规范、每个场景按名字引用的运动处理（§ 5 的计划纪律）、转场、音频识别度 —— 音乐和声音标识，或者刻意的静音 —— 用户素材的摆放，以及经过设计的开场和收尾。每一层增加了什么，用一句话说清；点到那些昂贵的层（渲染时间、登录、计费）时就标出来。由用户把方案往下削减；绝不应该让用户一项批准一项批准地把方案拼起来。
- **顶配属于概念，而不属于工具箱。** 每一层都必须服务于 brief 的核心信息 —— 一个用在任何视频上都一样的处理只是装饰。工艺向顶配看齐；内容绝不超出所要求的范围（§ 6）。
- 在检查点之间，`../hyperframes/references/capability-menu.md` 有两种用法。作为触发清单：当用户提到某项能力的输入，或构建进行到需要它的时候，提供这项相关能力。作为每一轮的升级通道：计划、草图或构建检查点可以附带一两个有迹可循的提议，指向用户正在看的素材（"第 3 场景的统计数字适合用计数跳动的处理"）。提议之前先读它；绝不把整个目录倒出来。
- 用户接受一项能力后，产出它的产物，并立即把这个决定记录到 `BRIEF.md` 正文里对应的小节。只有当用户明确改变某个 frontmatter 字段时，才改写这个字段并记录已确认的偏好。
- 保留同样的分镜、校验、最终预览和渲染批准闸门。companion 改变的是谁来掌舵，而不是质量的要求。

## 4. 每个阶段之前加载必需的知识

条件匹配时，以下阅读是强制的：

| 条件 | 行动之前要读 |
| --- | --- |
| 任何 composition HTML 或场景布局 | `/hyperframes-core`；它的布局契约用 `references/determinism-rules.md` |
| 任何非平凡的创作或视觉处理 | `/hyperframes-creative` → `references/house-style.md` 和 `references/video-composition.md` |
| 任何运动、动画或场景转场 | `/hyperframes-animation`；按它的路由找到对应的规则、适配器、蓝图或转场参考 |
| `storyboard: yes` | `../hyperframes/references/storyboard-format.md` 和 `../hyperframes/references/review-loop.md` |
| 任何媒体素材或操作，包括旁白、BGM、音效、字幕、调色或变换 | `/media-use`（对音乐和音效，宿主应用自己的工具优先）；涉及框架的播放和摆放时，还要读 `/hyperframes-core` → `references/variables-and-media.md` |
| 多场景组装 | `../hyperframes/references/production-loop.md` |
| `flow: companion`，在第一份计划之前 | `/hyperframes-creative` → `references/story-spine.md` 和 `references/house-style.md`；最接近的类型视角，以及完整的 `../hyperframes/references/capability-menu.md` —— 顶配方案是根据这些设计出来的，而不是凭记忆 |
| companion 的能力提议、抓取、节拍网格、生成式视频、地图、发布，或跨工作流的能力 | `../hyperframes/references/capability-menu.md` |
| 存在设计规范，在最终批准之前 | `/hyperframes-creative` → `references/design-adherence.md` |

不要用回忆代替这些阅读。只有在对应的参考文档确实被加载时，渐进式披露才能节省上下文。

## 5. 执行 composition

按这个依赖顺序进行。只有在某个阶段的输入不存在时才跳过它。

1. **规划。** 说明观众弧线、结构、节奏，以及决定时长的因素。短的单场景用一个文件；有三个及以上硬切场景或任何复用场景时，用 sub-composition。有旁白的弧线读 `/hyperframes-creative` → `references/story-spine.md`，节奏读 `references/beat-direction.md`，结构读 `/hyperframes-core` → `references/composition-patterns.md`。对于开放式的多场景 brief，通过 `/hyperframes-creative` → `references/prompt-expansion.md` 扩写 prompt。多场景计划要引用每个场景的形状：有合适的蓝图时，引用 `/hyperframes-animation` → `blueprints-index.md` 里的一个蓝图 id；没有时，引用它所组合的、`rules-index.md` 里有名字的规则 —— 运动名来自这些索引，绝不自创。哪些场景存在由故事真相决定；引用只是给它们穿上衣服。**在计划自己构建任何有名字的视觉效果之前，先搜索在线目录**：对于 brief 点名的每一种外观、效果、处理或转场 ——"CRT 扫描线"、"故障效果"、"胶片颗粒"、"闪光扫过"、"彩纸爆开"—— 在计划写明这个效果怎么构建之前，先运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读排名靠前的结果。这个搜索**什么都不需要安装**：不需要项目、不需要事先 `add`、不需要账号。它在任何目录下都会对整个托管 registry（约 400 个 block 和 component）做排序，所以用户在构建中途要求的效果也适用。计划点名的 block 在阶段 3 安装；只有在为某个效果搜过之后确实没有合适的结果，才手写它。多场景计划还要作为派发产物记录下来：`STORYBOARD.md` 里每个场景一个 `## Frame N` 块 —— `status: outline`、一个声明的 `src:`、蓝图 / 规则引用，以及段落节拍文本 —— **即使 `storyboard: no` 也一样**。这个块是派发单元；分镜草图表只是评审界面。
2. **按要求评审计划。** 对于 `storyboard: yes`，在这些块上运行共享的评审循环。对于 `storyboard: no`，不做计划停顿、不出草图表，直接继续。如果还是发生了计划停顿，就把子 agent 委派授权（codex 在 step 4 派发时需要）并进那次停顿里，而不是之后再停一次。
3. **解析依赖。** 在并行工作之前安装 registry block。暂存用户素材，采用已有媒体，只解析 brief 需要的东西。当音频的时间戳决定时长时，尽早开始音频。
4. **构建场景。** 对于短的单场景作品，先把场景实现为它最完整可见的那一刻，再加运动（如果有已确认的线框图，它就是这个终态，不得重画），然后按它引用的蓝图或规则做动画 —— 写运动之前，先读完整的配方正文（`/hyperframes-animation` → `blueprints/<id>.md`、`rules/<id>.md`）。

   **派发只有在规模足够大时才划算。** 编写帧包和预热全新的 worker 上下文要花实打实的分钟数和 token：一部最多约 6 个短场景的片子，在当前上下文里一个场景接一个场景地内联构建反而**更快**（实测：5 个短场景，内联 ≈ 9 分钟，帧包化 ≈ 21 分钟）。只有当计划超出这个规模时 —— 场景更多，或者单个场景很重 —— 才分散出去，而且每个 worker 分 **2–3 个场景**，而不是一个，并且**在同一波里拉起所有 worker**（第二波几乎会让总时长翻倍）。派发时：

   `node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

   构建器会在 `.hyperframes/frame-packets/` 下为每个场景写出一个有上限的帧包（packet）（这个场景确切的分镜块 + 蓝图正文 + 每一条被引用的规则配方，全部内联），以及 `_role.md`（`../hyperframes/references/frame-worker-core.md` + 本 skill 的 `sub-agents/frame-worker.md`，原样拼接 —— 即完整的 worker 角色）。派发 worker —— 每个 2–3 个场景帧包，全部在一波里（`../hyperframes/references/subagent-dispatch.md`）；每个 worker 的 prompt 带上 `_role.md` 和它的帧包 —— 完整粘贴，或者把文件路径交给 worker 让它先读（两种方式等价）—— 外加一份派发上下文，包含 `PROJECT_DIR`、它的各个 `frame_id`，以及画布尺寸。**等待**每个场景的 `compositions/<frame_id>.html` + `compositions/<frame_id>.motion.json`。worker 只读它们的帧包和设计真相文件；它们绝不打开 `STORYBOARD.md` 或 skill 文档。没有委派通道时，回退为串行：在当前上下文里一次处理一个帧包，仍然只依据帧包本身工作。

5. **合并 motion 附属文件。** 收集 worker 的 `compositions/<frame_id>.motion.json` 文件，把其中的时长和出场 / 入场向量带进组装环节；在装了 doctrine 链（`/motion-doctrine`）的地方，先把它们转换进项目台账，再盖上接缝。
6. **组装。** 用 production loop 挂载场景、媒体、转场、字幕和音频。真实的配音时长覆盖估计值。当一段音乐垫底在任何人声轨下播放时，在核验之前先对音乐垫底做挖空（carve）：`/hyperframes-audio` → `scripts/carve.mjs --comp index.html`。只做音量闪避（duck）并不能算完成混音。
7. **核验。** 在第一遍 HTML 和结构性改动之后，用 `npx hyperframes lint` 获取快速反馈。最终闸门运行 `npx hyperframes check`；它内部会重跑 lint，所以不要在它之前紧接着再多余地单独跑一次 lint。对于 sub-composition，查看中点快照。对于多场景作品，评审动画地图。
8. **最终批准。** 检查通过后，打开最终的 Studio 预览 —— 自主模式也一样，在任何渲染之前：打开它不需要问任何问题。问是渲染还是修改（自主模式：保留下来的那一个问题）。只有在批准之后才渲染。

## 6. 始终适用的闸门

### 严格控制范围

用户要什么就做什么。一张标题卡不是一张标题卡外加三个场景、音乐和字幕。添加任何东西之前先提议。

### 先确立设计，再写 HTML

按这个顺序解析设计来源：`frame.md` → `design.md` → `DESIGN.md`。把找到的第一个文件当作品牌真相。

当不存在设计规范时，在编写 composition HTML 之前完成全部四项：

1. 把视觉识别建立在 `house-style.md` 和 `video-composition.md` 的基础上。
2. 每个非平凡的创作，都写一句话点明概念切入角度。
3. 从 `/hyperframes-creative` → `references/typography.md` 里选一对可嵌入的字体组合；不要假设一个没打包的展示字体在云端渲染里存在。
4. 定义焦点元素、边缘锚点、辅助细节和背景处理。

让密度与要求的格式和核心信息相匹配。密度示例是针对制作出来的画面的指引，不是凭空编造论断、场景或固定元素数量的许可。

对于有名字的风格或情绪，读 `/hyperframes-creative` → `references/visual-styles.md`。当用户需要靠眼睛来选、而没有随附的 preset 合适时，读 `/hyperframes-creative` → `references/design-picker.md`，并在那里运行交互式的设计选择。

### 守住 composition 契约

带时间的元素用 `class="clip"`；根节点和相关的祖先元素都有尺寸；每个 composition 在 `window.__timelines` 上注册一条暂停的、seek 安全的 timeline；渲染是确定性的。不要使用渲染时的网络请求、时钟或未设种子的随机数。

### 安全地借用工作流

当作品与某个随附的工作流相似时，把它的类型参考当作示例借用。先运行 `npx hyperframes skills update <workflow-name>`。借用它的故事形状和品味，而不是它私有的脚本、流水线状态或目录契约。通用的构建仍然归本 skill 管。

## 7. 完成

只有满足以下条件时，一次运行才算完成：

- 要求的范围已经实现；
- 对于 `flow: companion`，交付的是完整方案，而不只是范围：每个场景引用的蓝图或规则都已落实，音频识别度已到位（或者选择了静音并说明了），开场和收尾经过设计而不是用默认值；
- `npx hyperframes check` 通过，包括它内置的 lint 阶段；
- 存在设计规范时，已对照 `/hyperframes-creative` → `references/design-adherence.md` 审查设计一致性；
- 对比度问题已解决；
- 适用时，已查看 sub-composition 的快照；
- 自主模式的交接包含一张查看过的联系表或快照表；多场景的表使用场景中点；
- 交接点明最终预览或渲染产物（视适用情况而定），并对基于时间的交付物报告实际时长；
- 多场景作品已评审 `hyperframes-animation/scripts/animation-map.mjs`；
- 用户在渲染前批准了最终的 Studio 预览；
- 请求了渲染时，已核验渲染出的文件。

最终批准之后，按 `../hyperframes/references/review-loop.md` § 4 的做法，提议一次把这次运行固化为一个配方。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [sub-agents/frame-worker.md](sub-agents/frame-worker.md) —— Frame worker —— general-video 增量部分
