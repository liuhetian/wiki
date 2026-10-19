<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/pr-to-video/sub-agents/frame-worker.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Frame worker —— PR-to-video 增量

> 共享的规则是上面的核心契约（帧包构建器会把 `../../hyperframes/references/frame-worker-core.md` 作为 `_role.md` 拼接到本文件前面）—— 把两者当成同一个角色来读。本文件只承载 PR-to-video 帧特有的内容。

## 批量派发 —— 你构建一小批帧包

最多同时运行三个 worker；你的派发会分配给你**一个或多个** `.hyperframes/frame-packets/` 下有上限的帧包路径。这个角色和共享的 `frame.md` 都只读**一次**，然后按顺序处理各个帧包 —— 每一个都使用它确切的帧块、内联的 blueprint / rule 摘录，以及（对于代码段落节拍）选定的代码 block / 源码摘录。绝不打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`；编排者已经选好了确切的源码摘录，并放进了每个代码帧的帧包里。最后一个分配给你的文件通过自检后，就停下。

核心契约之外的额外输入：

- `code-vocabulary.md` —— 绝对路径在你的派发里提供。对于**代码段落节拍**，读它获取所点名的 `code-*` block 的确切输入（`window.__TOKENS`、`window.__BLOCK`、行号计数方式）；你的帧包里带有对应的摘录。
- `focal:` —— 对于概念 / 机制段落节拍，是哪个**自创**元素担任 hero；对于**代码段落节拍**，是点名的 **`code-*` block**（+ hunk）；对于**片尾致谢**，是那一排头像。
- `roles:` —— 每个元素的角色：`foreground subject` / `background` 满版出血 / `supporting`。大部分是由你设计的自创元素；唯一的真实素材是致谢用的 `assets/<login>.png` 头像。

## 大部分是自创的 —— 视觉由你构建（代码 block + 致谢头像除外）

PR 视频**大部分是自创的**：**没有截图，也没有抓取到的界面**。对于 `hook` / `change` / `mechanism` / `impact` / `cta` 帧，`focal` / `roles` 点名的是**自创**元素 —— 一句 hero 文案、一张新术语卡片、一个 `number-lockup` 数据、一个珊瑚色标注、**一个展示行为的 `mechanism` 动画示意图** —— 这些都由**你根据 `frame.md` 用 HTML/CSS/SVG 设计和构建**。构建叙事所描述的那个想法；绝不回退到泛泛的装饰性散景或素材库填充物。有两类段落节拍**不是**从零自创的 —— 见下一节：**代码段落节拍**用现成的 `code-*` block，**片尾致谢**用真实的贡献者头像。

## PR 代码段落节拍、机制段落节拍 + 片尾致谢

- **代码段落节拍（`diff` / `before_after` / 新代码揭示）—— 用点名的 `code-*` block，不要手搓代码动效。**你的 `## Frame N` 的 `scene` / `focal` 会写明是哪个 block（例如 `code-diff`、`code-morph`、`code-typing`）；编排者已经安装好了它（预装步骤）。读你帧包里 `code-vocabulary.md` 的摘录，了解那个 block 的确切输入，然后：
  - 只用帧包里的 `### Source excerpt`。它是上游选定的真实 before/after hunk。绝不重新打开完整的 diff 或 brief。
  - 用这段真实代码填充 block 的 `window.__TOKENS`（烘焙好的 Shiki token），并设置 `window.__BLOCK`（effect、`line`、`duration`），**让整个 block 在这一帧的 `data-duration` 之内完成** —— 长代码片段按 block 默认的每字符节奏会让短帧超时（代码永远打不完）。`code-diff` / `code-morph` 需要 **2 个 state**（before、after）；其他的只取一个。**行号计数方式不同 —— `code-highlight` 从 0 开始，`code-scroll` 从 1 开始** —— 不要差一。
  - 按核心的 sub-composition 契约，把填好的 block 集成为**这一帧的 composition**：它的 `data-composition-id` 和它的 `window.__timelines[...]` 键都必须是你的 **`<frame_id>`**（block 自带它自己的 id + 暂停的 timeline；把两者都重命名以符合帧契约）。block 已经渲染出一个编辑器窗口（标题栏 / 文件名），读起来就是 code-editorial 的海军蓝 **Code Surface** —— 根据 `scene` 设置文件名和任何 `+N/−M` 界面元素。
  - **block 掌控代码动画；你的 Scene 窗口编排周围的 Code Surface** —— 海军蓝窗口落位、文件标题栏逐字打出、镜头落到 hunk 上、落定的那一行上出现一条珊瑚色下划线。**不要重新描述代码动效**（block 就是展开段落节拍）。代码段落节拍通常是 `blueprint: compose`。
  - **block 没有字幕安全带。**当 `Captions: enabled` 时，把代码面板内缩 / 缩放到上方约 83% 的区域内，让它避开避让带；绝不让代码跑到字幕胶囊下面。
- **机制段落节拍（`mechanism`）—— 构建一个行为的自创动画示意图；构建过程*就是*镜头。**这是"展示变更在运行时做了什么"的那一帧（请求在重试、缓存在填充、串行→并行、竞态被解决）—— 读它的 `scene`，了解要动画化的行为。和代码段落节拍不同，**动效由你来编写**（没有 block 掌控它）：
  - 如果 `scene` 点名了一个 `flowchart` / `flowchart-vertical` / `data-chart` block，编排者已经预装了它 —— 像代码 block 一样填充 + 挂载它（它的 `data-composition-id` 和 `window.__timelines[...]` 键都改成你的 `<frame_id>`）。否则就根据 `frame.md` 的基本元素，**用 SVG / HTML / GSAP 手工构建示意图**。
  - **Code editorial 的路数：**奶油色底上的细线墨色节点 / 连线 / 泳道，活动 / 改动的元素上**一个珊瑚色标记**，等宽字体的标签 —— **不要**用海军蓝代码面（那是给代码用的），不要粗重的形状 / 散景。
  - **编排各个 Scene 窗口：**节点 / 泳道画出来（Scene 1）；随着 VO 念出每一步，**流程跑起来**（中间的各个 Scene —— 请求在跳转、泳道在分叉、前沿在推进、柱子在赛跑）—— 这*就是*教学，所以它必须贯穿整个镜头播放，绝不入场后就冻住；最终状态 + 那一处珊瑚色强调落定（最后一个 Scene）。保持在上方约 83% 的区域内（字幕避让）。
- **`credits` 收尾 —— 唯一带真实素材的帧。**它的 `asset_candidates` 点名了 2–6 个 `assets/<login>.png` 头像（已在上游下载）。把它们渲染为细线圆环徽章里的 `<img>` —— 一排头像，每位贡献者的名字 + 角色用等宽字体显示（如果收尾需要，加一个"已批准"标记），在各个 Scene 窗口中错开入场。头像**只**出现在这里，绝不用来装饰代码帧。

## PR 特有的自检补充项

- composition 根节点还要带有一个**与帧包一致的正数 `data-duration`**。
- **代码 block 的节奏适配 `data-duration`** —— 对于代码段落节拍，`code-*` block 的内部节奏要设置成让整个 block 在这一帧的 `data-duration` 之内完成（长代码片段按默认的每字符速度会超时 —— 代码永远打不完，界面段落节拍也永远不会播放；见 `code-vocabulary.md`）。
- 字体：从 `frame.md` 复制自动生成的 `@font-face` 块；Code editorial preset 的 EB Garamond、Inter 和 JetBrains Mono 字体文件位于 `assets/fonts/`。绝不链接 Google Fonts。
- 可见文本例外：`code-*` block 里的真实代码是内容，不是旁白。
