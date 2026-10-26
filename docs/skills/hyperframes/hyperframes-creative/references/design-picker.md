# 设计选择器

两阶段的可视化选择器：先看情绪板（选定一个完整的方向），再逐个类别微调。

## 目录

- 前置准备
- 搭建选择器
- 启动服务与用户选择

## 前置准备

生成选项之前先读这些 —— 它们定义了你的选项必须遵守的规则：

- `references/typography.md`
- `house-style.md`
- `references/video-composition.md`
- `visual-styles.md`
- `references/beat-direction.md`

## 搭建选择器

1. 生成**深度贴合用户 prompt 语境**的选项。每个类别 —— 不只是版式架构 —— 都必须反映具体的产品、品牌、受众和情绪。那种放到任何选择器里都成立的通用选项就是失败。

   **情绪板** —— 创意空间需要多少就给多少（4-8 个）。每个情绪板都必须讲一个关于这个品牌的不同**故事**（STORY），而不只是把同样的元素重新洗一遍牌。问自己：「给这个产品定位，真正不同的方式有哪些？」一个猫粮品牌可以是：欢乐的混乱、高端定位、舒适 / 温馨、社交原生、口味展示、幽默主导、感官 / 诱人食欲。每一个都是不同的叙事，而不是在同一个版式上换一种字体。

   **版式架构** —— 每个情绪板至少一个，彼此在视觉上明显不同。使用 `{{prompt_headline}}` 和 `{{prompt_sub}}` token。如果用户提供了媒体素材，就把它们用作背景图（用不带引号的 `url(path)` —— `style='...'` 里面的单引号会破坏这个属性）。

   **色板**（5-6 个）—— 以品牌所处的世界命名，而不是用通用的情绪词。色板名和颜色都应该让人觉得属于**这个**（THIS）具体的产品。始终混合深色 + 浅色 + 带色调的背景。**每个色板在色块尺寸下都必须在视觉上明显不同。** 如果两个色板背景明度相同，**并且**（AND）强调色色相相近，就删掉一个。测试：用户在一个 14px 的色块小片上能看出区别吗？看不出，它们就是重复的。

   **字体搭配**（5-6 组）—— **生成搭配之前，先运行 typography.md 里的字体发现脚本。** 这一步不是可选的。下载 Google Fonts 元数据，运行脚本，从它的输出里挑。否则你每次都会伸手去拿同样那 8 种字体（Bricolage Grotesque、Instrument Serif、Fraunces、Archivo Black、DM Serif Display、Space Grotesk、Fredoka）—— 那是你训练数据的默认值，不是贴合语境的选择。匹配品牌的能量和受众。按 typography.md 的要求跨类别搭配（绝不用两种无衬线体）。

2. 先 `mkdir -p .hyperframes`，再把 [../templates/design-picker.html](../templates/design-picker.html) 复制到 `.hyperframes/pick-design.html`。
3. 用 Python 替换下面这些占位符（不要在 sed 里手工转义引号）：
   - `__ARCHITECTURES_JSON__` —— 版式架构对象的数组
   - `__PALETTES_JSON__` —— 色板对象的数组
   - `__TYPEPAIRS_JSON__` —— 字体搭配对象的数组
   - `__MOODBOARDS_JSON__` —— 情绪板对象的数组（格式见下文）
   - `__PROMPT_JSON__` —— 包含 prompt 上下文的对象（格式见下文）

### 版式架构数据格式

每个版式架构对象都必须包含一个 `preview_html` 字段 —— 在预览面板里渲染的 HTML。使用由模板在运行时替换的 token 占位符：`{{bg}}`、`{{fg}}`、`{{ac}}`、`{{mt}}`、`{{hf}}`、`{{hw}}`、`{{bf}}`、`{{bw}}`、`{{cr}}`（圆角半径）、`{{pad}}`、`{{gap}}`、`{{shadow}}`、`{{g}}`（网格线颜色）、`{{fg3}}`/`{{fg6}}`/`{{fg8}}`/`{{fg15}}`（带不透明度的 fg）、`{{ac3}}`/`{{ac5}}`/`{{ac25}}`（带不透明度的强调色）。

**每个 token 都必须用上。** 所有卡片、按钮和容器都要应用 `{{cr}}`。抬起的元素（卡片、按钮、代码块）要应用 `{{shadow}}`。用 `{{pad}}` 和 `{{gap}}` 控制间距。如果某个 token 没在 preview_html 里用到，对应的选项就不会有任何可见效果。

**密度很重要。** 每个版式架构的预览都必须包含 15 个以上不同的元素，让用户真切感受到这个版式。包括：标题、副标题、正文段落、标签 / 上标题（overline）、带数字的数据、次要数据、引语 / 用户评价、署名、带标题 + 正文的卡片、第二张卡片（不同的处理方式）、代码 / 命令块、主按钮、次按钮、列表或标签、强调色分隔线、以及一个数据元素（表格行、进度条或图表）。

可以选择性地加入 `components`（组件样式规则）和 `dos`（该做与不该做）两个字符串字段 —— 它们会出现在生成的 design.md 里。

**版式约束：** 所有预览 HTML 都必须使用百分比宽度或 `max-width: 100%`。所有 flex 行都加 `flex-wrap: wrap`。绝对定位的装饰元素必须待在一个带 `overflow: hidden` 的父元素之内。

**安全：** 版式架构的 `preview_html` 不得包含 `<script>` 标签、事件处理器（`onclick`、`onerror` 等）或 `javascript:` URL。它是通过 `innerHTML` 注入的。

**图片 URL：** 在 `preview_html` 里使用背景图时，用 `url(path/to/image.jpg)`，路径两边**不要**加引号。像 `url('path.jpg')` 这样的单引号会出问题，因为 `preview_html` 位于一个 `style='...'` 属性里 —— 里面的单引号会提前结束外层属性。

**色板多样性：** 6 个色板里始终要混合浅色、深色和带色调的背景 —— 即使是平静 / 健康养生类的 prompt 也一样。

### 版式架构对象示例

```json
{
  "name": "Editorial Stack",
  "description": "Vertical rhythm with large type, pull quotes, and data callouts",
  "tag": "editorial / longform / narrative",
  "mood": "Confident, unhurried, typographically driven",
  "preview_html": "<div style='background:{{bg}};color:{{fg}};padding:{{pad}};min-height:100vh;font-family:\"{{bf}}\",sans-serif;font-weight:{{bw}};'><div style='max-width:100%;display:flex;flex-direction:column;gap:{{gap}};'><div style='font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:{{mt}};'>Overline Label</div><div style='font-family:\"{{hf}}\",serif;font-weight:{{hw}};font-size:48px;line-height:1.1;letter-spacing:-0.02em;'>The Headline Goes Here</div><div style='font-size:20px;color:{{mt}};max-width:70%;line-height:1.5;'>Subheading text that introduces the narrative arc of this composition with enough words to fill two lines.</div><div style='font-size:15px;line-height:1.7;color:{{fg}};max-width:65%;'>Body paragraph with real sentences. The quick brown fox jumps over the lazy dog. This gives a sense of text density and reading rhythm at the chosen type size.</div><div style='display:flex;gap:{{gap}};flex-wrap:wrap;'><div style='background:{{fg6}};border-radius:{{cr}};padding:{{pad}};flex:1;min-width:200px;box-shadow:{{shadow}};'><div style='font-size:36px;font-family:\"{{hf}}\",serif;font-weight:{{hw}};color:{{ac}};'>2.4M</div><div style='font-size:12px;color:{{mt}};margin-top:4px;'>Primary Stat</div></div><div style='background:{{fg6}};border-radius:{{cr}};padding:{{pad}};flex:1;min-width:200px;box-shadow:{{shadow}};'><div style='font-size:36px;font-family:\"{{hf}}\",serif;font-weight:{{hw}};color:{{fg}};'>87%</div><div style='font-size:12px;color:{{mt}};margin-top:4px;'>Secondary Stat</div></div></div><div style='border-left:3px solid {{ac}};padding:12px {{pad}};background:{{ac3}};border-radius:0 {{cr}} {{cr}} 0;'><div style='font-size:18px;font-style:italic;color:{{fg}};line-height:1.5;'>\"A pull quote that captures the key insight of the piece.\"</div><div style='font-size:12px;color:{{mt}};margin-top:8px;'>— Attribution Name</div></div><div style='background:{{fg3}};border-radius:{{cr}};padding:{{pad}};box-shadow:{{shadow}};'><div style='font-size:14px;font-weight:{{hw}};margin-bottom:8px;'>Card Title</div><div style='font-size:13px;color:{{mt}};line-height:1.5;'>Card body text with a different treatment than the main content area.</div></div><div style='background:{{ac5}};border:1px solid {{ac25}};border-radius:{{cr}};padding:{{pad}};box-shadow:{{shadow}};'><div style='font-size:14px;font-weight:{{hw}};color:{{ac}};margin-bottom:8px;'>Accent Card</div><div style='font-size:13px;color:{{fg}};line-height:1.5;'>Second card with a tinted accent treatment for variety.</div></div><div style='font-family:monospace;font-size:13px;background:{{fg8}};border-radius:{{cr}};padding:{{pad}};color:{{fg15}};box-shadow:{{shadow}};'>$ hyperframes render --output video.mp4</div><div style='display:flex;gap:12px;flex-wrap:wrap;'><button style='background:{{ac}};color:{{bg}};border:none;padding:10px 24px;border-radius:{{cr}};font-size:14px;font-weight:600;box-shadow:{{shadow}};cursor:pointer;'>Primary Action</button><button style='background:transparent;color:{{fg}};border:1px solid {{fg15}};padding:10px 24px;border-radius:{{cr}};font-size:14px;cursor:pointer;'>Secondary</button></div><div style='display:flex;gap:8px;flex-wrap:wrap;'><span style='background:{{fg6}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{mt}};'>Tag One</span><span style='background:{{fg6}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{mt}};'>Tag Two</span><span style='background:{{ac5}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{ac}};'>Accent Tag</span></div><div style='height:1px;background:linear-gradient(to right,{{ac25}},{{fg6}},{{ac25}});'></div><div style='display:flex;justify-content:space-between;font-size:12px;color:{{mt}};border-bottom:1px solid {{g}};padding:8px 0;'><span>Data row label</span><span style='color:{{fg}};font-weight:600;'>1,234</span></div></div></div>"
}
```

### 情绪板数据格式

每个情绪板从每个类别里各预选一个选项。用户在阶段 1 选一个情绪板，然后在阶段 2 以这些预填好的选择为基础微调。

```json
{
  "name": "Terminal Precision",
  "description": "Code-forward, data-dense, CLI energy. Dark canvas, monospace body, sharp corners.",
  "theme": "dark",
  "arch_index": 0,
  "palette_index": 0,
  "type_index": 0,
  "corners_index": 0,
  "density_index": 0,
  "depth_index": 1,
  "easing_index": 0,
  "corners": "0px",
  "padding": "12px",
  "gap": "8px",
  "shadow": "0 2px 16px rgba(0,230,255,0.15)"
}
```

这些索引指向 ARCHITECTURES、PALETTES 和 TYPEPAIRS 数组。模板会用每个情绪板对应版式架构的 `preview_html`，套上该情绪板的色板 / 字体，渲染出一个迷你预览。

### Prompt 上下文数据格式

```json
{
  "title": "AI Coding Assistant",
  "headline": "Your Code, Understood.",
  "subline": "An AI coding assistant that reads your entire codebase.",
  "section_desc": "Layout options for your product launch"
}
```

`title` 出现在阶段 1 的页头。`headline` 和 `subline` 会替换版式架构 preview_html 里的 `{{prompt_headline}}` 和 `{{prompt_sub}}`，让预览显示真实内容。

### preview_html 中的内容 token

除了标准的设计 token（`{{bg}}`、`{{fg}}`、`{{ac}}` 等），版式架构的 `preview_html` 还可以使用：

- `{{prompt_headline}}` —— 用户实际的标题文字
- `{{prompt_sub}}` —— 用户实际的副标题文字

这让预览贴合语境 —— 用户看到的是套上样式的自己的内容，而不是通用占位符。

## 启动服务与用户选择

4. 启动文件服务：`cd <project-dir> && python3 -m http.server 8723 &`（用 8723 端口，或 8000 以上任何未被占用的端口；如果 curl 检查失败，就换下一个端口）。验证：`curl -s -o /dev/null -w "%{http_code}" http://localhost:8723/.hyperframes/pick-design.html` —— 只有返回 200 才把链接给用户。选择器**不要**用 `npx hyperframes preview` —— 它会阻塞。只在主对话线程里启动 HTTP 服务器。如果你是作为被派发的任务或子 agent 在运行，就返回文件路径，让调用方去启动服务。
5. 用户选定之后，告诉他们：「从选择器里复制 design.md，粘贴到这里。」用户把 markdown 粘贴回对话里。把它原样保存为项目根目录下的 `design.md` —— 它已经是规范格式（YAML frontmatter + 散文段落）。用户粘贴完之后，关掉后台服务器：`kill %1` 或 `kill $(lsof -ti:8723)`。然后开始搭建。

选择器输出的是一个符合 google-labs-code/design.md[^design] 规范的文件：YAML frontmatter 里含 `colors`、`typography`、`rounded` 和 `spacing` token，后面接 `## Overview`、`## Colors`、`## Typography`、`## Layout`、`## Elevation`、`## Components` 和 `## Do's and Don'ts` 几个散文段落。

[^design]: [google-labs-code/design.md](https://github.com/google-labs-code/design.md)，2026-10-15 读。
