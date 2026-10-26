# 代码词汇 —— `code-*` 动画 block

<!-- registry-items: allow=data-duration,number-lockup,dark-plus,light-plus,dark-modern,light-modern,dark-2026,light-2026,solarized-light,visual-studio-dark,visual-studio-light,high-contrast,high-contrast-light,clear-dark,clear-light,man-page,red-sands,silver-aerogel,solid-colors -->

**registry 里有什么，以在线搜索为准。** 下面的表格是人工维护的样本，按设计就覆盖不全：在断定 registry 缺少某样东西之前，先运行 `npx hyperframes catalog --query "<what you want>" --json` —— 它什么都不需要安装。这里的条目名由 `bun run lint:skills` 对照 `registry/registry.json` 检查。

PR 视频靠两类动态画面撑起来：**代码**（改动的那些行）和**行为**（这次变更在运行时*做了*什么）。本文件是这两者的词汇 —— 代码段落节拍用 `code-*` block，行为段落节拍用**机制段落节拍（mechanism beat）**（一个自创的动画示意图，或者 `flowchart` / `data-chart`）。一支*全是*代码的视频看起来很平；**让两者交替出现**（节奏由 story-design 规划；见下文「展示行为」）。

对于代码段落节拍，registry 提供了专门打造的**代码动画 block**，用来渲染 diff、逐字打出的代码片段、变形（morph）、高亮、滚动，或者 3D / 粒子 / 溶解式的揭示 —— 远好于手搓的动效。任何代码段落节拍都**先找这些 block**；只有在没有一个合适时，才回退到手写 composition。

- **Step 4（视觉设计）：** 对每个 `diff` / `before_after` / 代码段落节拍，在帧的 `scene` 里写明 block（例如"`request()` 重试代码块，约 6 行，`code-diff`"）。只需做一个判断：用哪个 block。
- **Step 5（frame worker）：** 安装点名的 block，并用真实的 diff / 代码片段填充它（见下文）。这个 block 是这一帧的核心，合成在 code-editorial 的海军蓝 **Code Surface** 上。

## 安装 + 使用

每个 block 的安装方式都一样（已在 `packages/cli/src/commands/add.ts` 中确认）：

```bash
npx hyperframes add <block-name>     # writes compositions/<block-name>.html
```

它是一个自包含的 sub-composition（内联引擎；一条暂停的 GSAP timeline，由引擎逐帧 seek）。把它作为一个 sub-composition clip 挂载到帧里：

```html
<div
  data-composition-id="code-diff"
  data-composition-src="compositions/code-diff.html"
  data-start="0"
  data-duration="6"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
></div>
```

**通过编辑两个全局变量来定制**，它们在已安装 HTML 的内联 `<script>` 里：

- `window.__TOKENS` —— 代码内容，预先烘焙成 Shiki token：`{ <seq>: { lang, theme, bg, fg, states: [ { code, tokens:[ {key, content, color, fontStyle} ] } ] } }`。把 `code`/`tokens` 替换成 PR 的真实代码片段。`fontStyle` 是一个位掩码（`&1` 斜体，`&2` 粗体）。这些 block 烘焙的是 `theme: "github-dark"`，与下文的 `code-snippet-*` 主题无关。
- `window.__BLOCK` —— 选择效果 + 时间：2D 为 `{ id, effect, seq, line?, duration }`；WebGL 为 `{ id, effect, seq, duration, seed }`。

timeline 会同步注册到 `window.__timelines[id]`。所有 block 都是 **1920×1080**，且是**确定性的 / seek 安全的**（没有 CSS transition，没有 rAF，随机数都带种子 —— 绝不用 `Math.random` / `Date.now`）。

## 动画 block

| Block | 作用 | 值得注意的输入 | 对应的 PR 段落节拍 |
| --- | --- | --- | --- |
| **`code-diff`** | 编辑器窗口里的统一 diff：删除的行以红色折叠，新增的行以绿色展开，错开进行。（6 秒） | `__TOKENS.diff.states` 需要**恰好 2 个 state**（before、after）—— 引擎对两者做 LCS diff。 | diff hunk（before→after）；字面意义上的增 / 删语义。**默认的 PR block。** |
| **`code-morph`** | 一段代码片段变形为另一段 —— 共享的 token 平滑滑动（FLIP），离开的淡出，进入的淡入。（7 秒） | `__TOKENS.morph.states`（2 个及以上）；某个 token 要滑动，就在各 state 间复用同一个 token `key`。 | 一次重构 / 重命名 / 签名变更，重在连续性（而不是增 / 删的框架）。 |
| **`code-typing`** | 逐字符的打字机式揭示，带一个滑动的光标。（5 秒） | 单个 state，放在 `__TOKENS.feature.states[0]`。 | 一个新函数 / 新文件**在屏幕上写出来**（"这是我们新增的"）。 |
| **`code-highlight`** | 一条蓝色光带扫过某一行；其余变暗。（5 秒） | `__BLOCK.line` = 目标行，**这里从 0 开始计**。单个 state。 | "改动就是这一行" —— 聚光照亮一行改动过的 / 重要的代码。快速点出。 |
| **`code-scroll`** | "镜头"滚动一个长文件，让目标行居中，其余变暗。（6 秒） | `__BLOCK.line` = 目标行，**这里从 1 开始计**。一个长 state。 | 在一个大文件里定位改动。唯一为长文件打造的 block。 |
| **`code-3d-extrude`** | 代码置于一块有光照、带倒角的 3D 厚板上，旋转后落定。（8 秒，WebGL） | 单个 state；`__BLOCK.seed`。`<canvas id="gl">`。 | 一个 hero / 标题式的代码时刻（"就是这个功能"）。重风格轻信息密度 —— 不适合用来读 diff。 |
| **`code-particle-assemble`** | GPU 粒子散开，然后飞向精确的字形像素，最终呈现语法高亮颜色。（8 秒，WebGL） | 单个 state；`__BLOCK.seed`。 | 关键代码片段的戏剧性高潮揭示。最炫；不适合逐行阅读。 |
| **`code-shader-dissolve`** | 代码从带种子的噪声中"编译成形"，伴随一道移动的溶解前沿 + 边缘辉光。（7 秒，WebGL） | 单个 state；`__BLOCK.seed`。 | "编译通过 / 构建成功 / 现在能用了"这类段落节拍，或一次精致的代码片段揭示。 |

**容易踩的坑（写明，免得 worker 绊倒）：**

- **让节奏适配这一帧的 `data-duration`。** 每个 block 都自带内部时间 —— `code-typing` 以固定的每字符速度打字，所以相对于一个短帧来说偏长的代码片段会**超时**：代码在 `data-duration` 内永远打不完，它周围的界面段落节拍（一条下划线、一个 `+N/−M` 计数）也永远不会播放。用**字符数 × 每字符节奏**（再加上 block 的落定时间）去对照 `data-duration`，调整时间，让**整个 block 在这一帧之内完成**。这是你**必须**按帧设置的唯一一个代码动效旋钮 —— 你调的是*时间*，不是重新设计效果（打字机 / diff / morph 仍然是 block 自己的）。
- `code-diff` 和 `code-morph` 需要**至少 2 个烘焙好的 state**；其他动画 block 都只用单个 state。
- **行号计数方式不同：** `code-highlight` **从 0 开始**（`line: 1` = 第 2 行）；`code-scroll` **从 1 开始**。不要差一。
- **没有字幕安全带。** 这些都是满版的 1920×1080 代码面，没有预留字幕区域。启用字幕时，这一帧必须让代码面板避开底部的字幕避让带（把 block 合成在上方约 83% 的区域内，或者缩放 / 内缩它）—— 这由 worker 负责，不归 block 管。

## `code-snippet-*` 主题家族（独立使用，不是色板）

这些**不是**挂到动画 block 上的**色板** —— 每一个都是独立的、现成的约 11–12 秒 composition，渲染一整套开发者界面，自带烘焙好的打字效果和自己的 timeline。当你想要**带环境感的真实上下文**（屏幕上出现一个真实的 IDE 或终端），而不是一个聚焦的 diff 时，就用其中一个。安装具体的那一个：`npx hyperframes add code-snippet-<name>`。

- **VS Code 工作台（12 个）：** 每种主题下完整的 VS Code 窗口（活动栏、文件树、标签页、带逐字符打字的编辑器、运行着 `pytest` 的集成终端、状态栏）。`dark-plus`、`light-plus`、`dark-modern`、`light-modern`、`dark-2026`、`light-2026`、`monokai`、`solarized-light`、`visual-studio-dark`、`visual-studio-light`、`high-contrast`、`high-contrast-light`。（每个都会往 `assets/` 里拉一张 `background.jpeg`。）
- **Apple Terminal（12 个）：** macOS Terminal.app 窗口，按每种描述文件（profile）打一条 shell 命令。`apple-terminal-` + `basic`、`clear-dark`、`clear-light`、`grass`、`homebrew`、`man-page`、`novel`、`ocean`、`pro`、`red-sands`、`silver-aerogel`、`solid-colors`。

主题烘焙在每个 block 里（不是运行时选择的）；要用某种外观，就安装那个 block 并编辑它的 `codeLines`。考虑到 code-editorial 的编辑风基调，优先用海军蓝 Code Surface 上那些聚焦的动画 block；只有当"在真实的编辑器 / 终端里展示"本身就是重点时，才去用 `code-snippet-*` 界面。

## 展示行为 —— 机制段落节拍（不是 `code-*` block）

`code-*` block 展示的是**代码**。它不展示**代码做了什么**。PR 视频显得平淡，最大的单一原因就是主体全是代码面 —— 所以对于任何有可见运行时行为的变更，都要规划一个**`mechanism` 段落节拍**，用来*把行为动画化*（节奏归 story-design；这里是词汇）。

机制段落节拍**不是** registry 里的 `code-*` block。它是以下之一：

- 一个**自创的动画示意图** —— 由 frame worker 用 code-editorial 的基本元素构建的 SVG / HTML / GSAP（奶油色底上的细线墨色节点 / 连线 / 泳道，活动元素上一个珊瑚色标记），构建过程在整个镜头中把行为演出来；**或者**
- 一个 **`flowchart` / `flowchart-vertical`** registry block —— 一个流程 / 流水线 / 状态流；**或者**
- 一个 **`data-chart`** registry block —— 一次性能 / 指标对比（两根柱子或两条时间线在赛跑）。

`flowchart`、`flowchart-vertical` 和 `data-chart` 的安装方式和代码 block 完全一样（`npx hyperframes add <name>`），并作为 sub-composition 挂载 —— 所以当某个 `mechanism` 帧在它的 `scene` 里点名其中之一时，Step 5 会把它和 `code-*` block 一起预装。自创的 SVG/GSAP 示意图不需要安装（worker 手工构建）。

**按变更涉及的内容决定动画化什么**（story-design 据此规划的菜单）：

| 变更涉及…… | 动画化（行为） | 用什么 |
| --- | --- | --- |
| 重试 / 退避 / 容错 | 请求生命周期：发出 → 500 → 等待（延迟递增）→ 重试 → 200 | 自创 SVG/GSAP |
| 缓存 / 记忆化 | 两条泳道赛跑：冷路径（打到数据库）vs 缓存路径（命中缓存） | 自创 SVG/GSAP |
| 并发 / 并行 | 一条串行泳道重新排布成多条并行泳道 | 自创 / `flowchart` |
| 竞态 / 顺序 bug | 出错的流程（丢失的条目、相撞的写入方），然后是修好的流程 | 自创 SVG/GSAP |
| 性能 | 两条时间线 / 两根柱子赛跑，新的那个先到终点 | `data-chart` |
| 重构 / 迁移 | 一张缠结的调用图被理顺；相同输入 → 相同输出 | `flowchart` / 自创 |
| 新端点 / 流水线 / 状态 | 数据沿新路径流动；一个状态机逐步点亮 | `flowchart-vertical` |

和 `code-*` block（自己掌控动画）不同，示意图的动效是**你的** —— 把至少 3 个效果串成 入场（画出节点 / 泳道）→ 展开（让流程跑起来）→ 落定（最终状态 + 一处珊瑚色强调）。绝不让它入场后就冻住。

## PR 段落节拍 → block 速查表

| PR 时刻 | Block |
| --- | --- |
| diff hunk（before → after） | `code-diff` |
| 重构 / 重命名 / 签名变更（连续性） | `code-morph` |
| 失败 → 通过的测试（红 → 绿） | `code-morph` 或 `code-diff` + 在绿色那行上用 `code-highlight`；要字面上的测试运行器界面，就用一个 `code-snippet-*` VS Code / 终端 block |
| 新函数 / 新文件逐字打出 | `code-typing` |
| 聚光照亮一行改动 | `code-highlight` |
| 走查 / 滚动一个改动过的长文件 | `code-scroll` |
| hero / 标题式的代码时刻（"就是这个功能"） | `code-3d-extrude` |
| "编译通过 / 构建成功 / 现在能用了"的揭示 | `code-shader-dissolve` |
| 戏剧性的大段代码片段揭示 / 高潮 | `code-particle-assemble` |
| 一个基准测试 / 指标 / 计数 | **不是 `code-*` block** —— 用 code-editorial 的 `number-lockup`（Number/Impact 处理方式）或 `data-chart` registry block |
| **变更在运行时做了什么**（行为，不是代码） | **不是 `code-*` block** —— 一个 `mechanism` 段落节拍：自创的 SVG/GSAP 示意图，或 `flowchart` / `flowchart-vertical` / `data-chart`。见上文「展示行为」。 |
| 在逼真的 IDE / 终端里展示变更（环境感） | 一个 `code-snippet-*` VS Code 主题（编辑器）或 Apple Terminal 描述文件（CLI 运行） |
