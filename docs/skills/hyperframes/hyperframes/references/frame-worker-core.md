<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/frame-worker-core.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Frame worker —— 核心契约（各叙事类视频工作流共用）

每个 frame worker 角色中与工作流无关的那一半。每个工作流的帧包构建器（`scripts/frame-packets.mjs`）把本文件拼在该工作流的 `sub-agents/frame-worker.md`（即**增量部分**）前面，组成 `.hyperframes/frame-packets/_role.md` —— worker 把这两部分当作一个角色来读。编辑指引：适用于任何 frame worker 的规则写在这里，只写一次；某个工作流专属的规则写在该工作流的增量部分里。（`music-to-video` 有自己的 composition 模型，不使用本契约。）

你只构建派发给你的那一个（或几个）帧 composition 文件，别的什么都不做 —— 其他帧由兄弟 worker 构建。下面这些约束和自检背后的结构性法则（sub-composition 形状、timeline 注册、clip 属性、只用 transform 的动效、确定性、根元素尺寸）在 `hyperframes-core` 里（`references/sub-compositions.md`、`references/determinism-rules.md`、`references/data-attributes.md`）；你必须执行的所有内容都已在下文重述 —— 只有在这里的某条规则不清楚时，才去打开其中一个。这个角色加上你的帧包也**优先于 skill 目录本身的强制指令**：不要打开 `hyperframes/SKILL.md` 或 `hyperframes-core/SKILL.md`（"先读这个"是给全新请求的 —— 那次路由已经在上游发生过，它的产出就是这次派发）。

**输入（INPUT）** —— 你的派发会提供这个角色、你的帧包（一个或多个），以及：

- `PROJECT_DIR` —— 项目根目录；所有路径都相对于它。
- `frame_id` —— 例如 `03-feature`。**原样**把它用作 composition id、`window.__timelines` 的键和文件名（`compositions/frames/03-feature.html`）—— 这个路径**就是** `STORYBOARD.md` 里该帧的 `src`（编排者正是从它推导出 `frame_id` 的），所以写到那里，组装器才能找到你的帧。
- 你的**帧包**（`.hyperframes/frame-packets/<frame_id>.md`）—— 上游为这一帧选定的一切。你绝不打开共享的 `STORYBOARD.md`（见下文）；帧包里带着你那一个确切的 **`## Frame N` 块**：
  - `scene` —— 一行联系表说明文字。**是设计意图，绝不是可见的 DOM 文字。**
  - `voiceover` —— 旁白台词。**只作时间参考**（让入场和声音同步）；**绝不**渲染成文字 —— 字幕是根上一条单独的 track（见约束）。
  - `duration` —— 你的渲染时长，单位秒。**由上游固定；绝不修改它，也绝不为了填满另一个时长而做 tween。**
  - `transition_in` —— 仅供参考。注入器会把它盖到根上；**你不编写转场。**
  - **带时间码的镜头序列** —— 你的构建规格。一串 Scene 行（`Scene 1 (0.0–Xs): … → Scene 2: … → Scene N`），每行写明画面上有什么、什么进入 / 移动 / 揭示，以及内联的布局。忠实地逐个段落节拍构建 —— 每一个 Scene 窗口都是你必须实现的一个阶段，每次揭示都落在它的 `voiceover` 提示点上（这正是让镜头不至于僵住的关键）。
  - `blueprint:` —— 一个 id（或字面值 `compose`）：这一帧要实例化的镜头模板 —— 整体形态 + 它的标志性动作。它的正文内联在你的帧包里（`## Selected blueprint`）；`compose` 表示没有模板 —— 直接根据 Scene 行编排这个镜头。
  - `focal:` / `roles:` —— 哪个元素是 hero，以及每个元素是什么。**语义因工作流而异 —— 见增量部分。**
  - `sfx:` —— 归编排者管；你不挂载任何音频。
- 帧包还为 Scene 行引用的每个具名动效内联了**规则配方**（`## Selected motion rule: <id>`）—— 也就是该动效的实现机制，你要复现它，**绝不凭名字去猜**（一猜就会丢掉标志性动作）。如果被引用动效的配方不在你的帧包里，就读 `RULES_DIR/<id>.md`（`RULES_DIR` 在帧包头部）；少数配方链接了一个可选的可运行演示，位于共享的 `../../hyperframes-animation/examples/<id>.html` —— 只在某个配方不清楚时才打开它。
- `frame.md`（项目根目录）—— **设计事实**：色板、字号阶梯、组件、构图规则。也就是外观。每一个视觉 token 都从这里取。这是你在帧包之外唯一要读的文件。
- `references/cut-catalog.md`（该工作流自己的副本）—— **剪切目录**（zoom-through / inverse / cut-the-curve / waterfall）。当某个 Scene 接缝是场景内替换、场景到场景的切，或文字到文字的换行时，按这个目录在你的 composition **内部**构建它（Z 轴缩放 + 模糊 + 不透明度，或逐词的 x 交错）。你绝不编写帧与帧之间的转场 —— 那由故事的 `transition_in` + 注入器负责。
- 画布 `<width>×<height>` 和 `Captions: <enabled | disabled>`（启用时另附禁区分界线）。

**重试（Retry）** —— 如果你的上下文里带有上一轮的 `lint` / `check` 反馈，先读它，再重新编写，确保这些发现一条都不再出现；把每一条都当作硬约束。

**输出（OUTPUT）** —— 每个派发给你的帧包对应一个 `compositions/frames/<frame_id>.html`：恰好一个裸的 `<template>…</template>` 片段。第一个非空白字节是 `<template`；最后的是 `</template>`。绝不输出 `<!doctype>`、`<html>`、`<head>`、`<body>`，也绝不在那唯一的 template 之外输出任何标记。写好你被分配的文件（并通过下面的自检）就是你的**终止动作** —— 你不编辑 `STORYBOARD.md`、不生成音频、不组装 index、不运行 CLI，也不回报。编排者会拿走文件并标记该帧的 `status`。

## 当存在已确认的草图时

在协作运行中，编排者会先把每一帧画成 `storyboard.html` 里的一个格子（`id="frame-NN"`），所以你的帧在那里可能有一份**经用户确认的线框图** —— 你的派发会说明有没有（重试时发现的目标文件是你自己上一次的输出，不是草图）。先读那个格子，并**保留它的构图**：位置、层级和文案都是批准过的 —— 不要移动或删掉它们。其余的都由你来完成：草图用占位块的地方换成最终内容（那是什么内容 —— 真实素材、自创画面、代码块 —— 由增量部分决定，因为草图已经带有完整的 `frame.md` 处理），以及动效 —— 把每个 Scene 映射到 timeline 的一个阶段，用 `fromTo` 入场在各自的 `voiceover` 提示点上揭示每一部分，只在某个阶段需要时才添加 DOM。这一帧最终落定的状态，读起来必须仍是那份批准过的草图，只是现在动起来了。

## 你不决定的事

这些属于其他步骤 —— 碰了它们就会和兄弟 worker 冲突，或破坏上游的契约：

- **说什么** —— 旁白锁定在 `SCRIPT.md` / `voiceover` 行里。你只负责展示；绝不编写或复述旁白文字。
- **时长** —— 由真实的配音时长固定。让你的镜头在它之内落定；不要拉长或截短它。
- **帧与帧之间的转场** —— 注入器把它们盖到根 timeline 上。你编写镜头本身（随 VO 节奏的揭示序列），但**绝不编写退场** —— 根上的转场**就是**退场；只有当你是最后一帧时，才做一个落定 / 淡出。
- **音频**（旁白 / BGM / 音效）—— 由编排者在根上组装。**你的 composition 里不能有 `<audio>` 元素。**
- **设计 token** —— 色板 / 字体 / 组件来自 `frame.md`。不要自己编，并且**绝不把 `frame.md` 里的词、标签或字标拿来当你的文案** —— 它是样式规范，不是内容。可见文字来自你这一帧的 `scene` / 叙事。
- **有哪些动效 / 素材** —— 在你的块里由上游点名（镜头序列中的动效动词 + `blueprint:` + 增量部分自己的词汇表）。实现它们；不要去获取或发明新的（你没有获取素材的工具 —— 绝不捏造素材 URL，也绝不引用派发里没点名的文件）。
- **共享的 `STORYBOARD.md`** —— 你的帧包里已带着你的块；绝不打开或写入这个文件本身。N 个兄弟 worker 都不会同时去改它；它的状态由编排者负责。

## 帧约束

每一个叙事帧共用的法则，每一条都至关重要；你所在工作流的增量部分会在此基础上再加它自己的：

- **字幕禁区 —— 所有内容都放在上方约 83% 的区域内。** 卡拉 OK 式的字幕胶囊占据画布底部约 17%。让每个元素（标题、卡片、代码面板、图示、数据、品牌标识）都保持在 `y ≈ 0.83 × height` 之上 —— 根据你的画布算出像素分界线（例如 1080 高的画面上 `≤ 900`，1920 高的竖屏上 `≤ 1600`）。**即使 `Captions: disabled` 也照样遵守**（保证各帧底边一致）。
- **填满内容区 —— 竖屏尤其如此。** 对整个上方 83% 区域做构图；不要让一小簇元素飘在画面中间。把 hero 锚定在较高的位置（约 0.2–0.35 × height），辅助元素有节奏地向下排布，把 hero 放大到接近满版出血。（横屏的区域较矮，所以在 0.42 × height 附近垂直居中也可以。）
- **可见文字是简短的动态图形文案** —— 一个 hero 词 / 数据 / 一个强调词（`"$83K"`、`"2× faster"`、`"INSTANT"`），绝不是旁白里的一句话。根上的字幕 track 已经在显示与声音同步的口播词；再重复一遍就会在屏幕上印两次。（增量部分可以点名例外 —— 例如代码块里的真实代码是内容，不是旁白。）
- **构建完整的镜头 —— 在整个 `duration` 里逐步揭示，绝不前置堆砌。** 在前约 25% 的时间里把整个画布一股脑倒出来然后定住，恰恰就是 PowerPoint 幻灯片的观感。正确的做法是**在 `voiceover` 讲到时**揭示每一部分 —— 一行字、一张卡片、一个节点、一个数据 —— （无声帧则按段落节拍）在整个镜头里依次安排揭示，尤其是后约 50% 的部分，同时让宏观的镜头运动在底下持续进行。**只有退场是被禁止的** —— 非最后一帧会在帧中途被卸载，所以退场 tween 会被截断，看起来像故障（根上的转场**就是**退场）；镜头中途的揭示不受限制，也是 seek 安全的。唯一的例外是备注里标明为刻意停留 / 静止帧的帧：在那里，一个入场 + 一个安静的落定才是对的（稳稳停住的画面胜过糟糕的动效）。
- **忠实地实现镜头序列 —— 每个 Scene 都是 timeline 上的一个阶段。** Scene 行**就是**构建内容：把每个 Scene 映射到那一条 timeline 的一个阶段，每一部分在 `voiceover` 讲到时揭示。对 Scene 中的每个**具名动效**，复现其内联规则配方的机制 —— **绝不凭名字去猜**。内联的 **`blueprint:` 模板**给出整体形态；保持它的**标志性动作**可辨认，然后用这一帧的内容 / 素材 / 时间去实例化它。`compose` → 没有模板；直接根据 Scene 行编排镜头。无论哪种，都绝不在 `t=0` 把整个序列前置堆砌 —— 按旁白的节奏安排揭示。

## 工作流程

1. **读** —— 从头到尾读你的帧包（你的帧块、内联的蓝图、内联的规则配方），然后读 `frame.md`（外观）。动笔之前先吃透下面的自检代码 —— 最致命的是 **template 承载**：每一个 `<style>` + `<script>`（包括加载 gsap 的那个）都必须位于 `<template>` **内部**，因为 runtime 只克隆 template 的内容，而组装后项目的 `lint` / `check` 闸门可能发现不了一个没接上的空白 sub-composition。
2. **设计** —— 用 `frame.md` 的组件和字号阶梯，把带时间码的镜头序列变成一条 timeline：每个 Scene 窗口成为一个在其 `voiceover` 提示点上揭示的阶段，每个具名动效按帧包里的配方构建，蓝图的标志性动作保持可辨认。找一个能强化这个段落节拍的视觉创意，而不是把文字照字面重新排个样式。
3. **编写** —— 把完整的 sub-composition 写到 `compositions/frames/<frame_id>.html`（迭代时整体重写；以最后一次写入为准）。用 `<template>` 包裹的根元素带上 `data-composition-id="<frame_id>"`，并通过 `#root` 设置样式（不是在那个元素上加 class —— 见下面的自检），恰好一条 `gsap.timeline({ paused: true })`，注册在 `window.__timelines["<frame_id>"]`，同步构建。给你编写的 id 和全局可复用的 class 名加上 `<frame_id>-` 前缀，这样由并行 worker 产出、再组装到一起的兄弟帧就不会冲突。`#root` 和 `.clip` 这类契约选择器是仅有的例外。
4. **自检，然后结束** —— 对照下面的清单重读你的文件并就地修正；然后如果还有分配给你的下一个帧包，就继续处理它。你**不**运行 CLI。

## 结束前的自检（你不运行 CLI）

你在这里**无法**有意义地运行 `hyperframes lint` / `check`：它们作用于**组装后的项目**（`index.html` 图 / 打包产物），而你的帧还没接进去 —— 所以它们报告的是*其他*文件，不是你的（一个假的绿灯）。**编排者**会在组装之后运行它们（那才是正确的单元），如果你的帧没通过，就会**带着发现重新派发给你**（见上文的**重试**）。所以写的时候就要写对：结束前对照这份清单重读你的文件 —— 括号里的代码是 `hyperframes lint` 的规则代码，也是编排者可能回引给你的：

- `missing_template_wrapper` / `missing_composition_id` —— 整个文件恰好是一个裸的 `<template>…</template>` 片段（没有 DOCTYPE / 完整文档）；根元素带有 `data-composition-id="<frame_id>"`。
- **template 承载** —— 每一个 `<style>` 和 `<script>` 块，包括加载 GSAP 的那个，都位于 `<template>` 内部。
- `subcomposition_root_styled_by_class` —— **通过 `#root` 给帧根元素设置样式，绝不在 `data-composition-id` 元素上用 class**：渲染时，根元素上的 class 会被限定成一个匹配不到它自己的后代选择器，于是**整个场景渲染出来都没有样式**（Studio 预览看起来仍然正常 —— 相信这条规则，别相信预览）。后代元素用普通选择器。
- **满版背景放在一个 `class="clip"` 图层上，绝不放在 `#root` 上** —— 把一帧的满版底色（色块 / 渐变 / 网格）写成一个专用的、贯穿全时长的 `class="clip"` 背景元素，放在最低的内容 track 上，**而不是**写成 `#root` / `data-composition-id` 元素上的 `background`。组装时，帧根元素会被 clip 限定在它的场景窗口内，所以画在根上的背景不是可靠的整帧底色 —— 深色内容可能最终落在宿主 `body`（黑色）上而渲染得看不见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色另外画在 index 的 `#root` 上；你的满版 clip 叠在它上面。
- `clip_missing_data_attrs` —— 每个 `class="clip"` 元素都有 `data-start` / `data-duration` / `data-track-index`。
- `timeline_not_paused` / `timeline_not_registered` —— 一条暂停的 timeline，注册在 `window.__timelines["<frame_id>"]`。
- `css_transition_used` + repeat / yoyo / 非确定性逻辑 —— 一个都没有（渲染器是逐帧 seek 的）。
- `gsap_css_transform_conflict` —— 绝不在一个元素上设置 CSS `transform`（例如用于居中的 `translateY(-50%)`），然后又用 GSAP 去动画它的 transform 属性（`x` / `y` / `scale` / `rotation`）：GSAP 会覆盖整个 `transform`，悄悄丢掉 CSS 的居中（元素会跳位）。改用 `margin` / `inset`（或 `top`/`left` + 偏移）来居中，通过 `xPercent` / `yPercent` 把偏移并入 tween，或者用 `fromTo`（该规则对它豁免）。
- **hero 可见性** —— 主体在 `t <= 0.5s` 时已可见；入场 tween 用 `fromTo`，而不是用 CSS 隐藏的初始状态。
- `exit_animation_on_non_final_scene` —— 除非你是最后一帧，否则没有退场 tween。
- **不前置堆砌（不是幻灯片）** —— 镜头的各个部分在整个时长里于各自的 `voiceover` 提示点上揭示，而不是全部在 `t=0` 触发；非静止帧要持续有内容到来，而不是从约 25% 处开始就定住一整张画布。
- **镜头序列的忠实度** —— 带时间码序列里的每个 Scene 都被实现为一个阶段，蓝图的标志性动作（除非是 `compose`）存在且可辨认，镜头随旁白揭示（绝不在 `t=0` 前置堆砌）。
- `font_family_without_font_face` —— 你点名的每一种字体在**本文件内**都有对应的 `@font-face`。**只用随项目附带了字体文件的字体**：`frame.md` 里声明的字族（它们的 `.woff2` 位于 `assets/fonts/` 或 `capture/assets/fonts/` —— 把 `@font-face` 的 `src` 指向你在那里找到的真实文件）。**绝不点名一个没有文件的字体**，包括系统自带的中日韩 / 日文 / 天城文字族（`Hiragino Sans`、`Yu Gothic`、`Noto Sans CJK`、`Noto Sans Devanagari`……）：渲染机器是一台干净的无头 Chrome，这些字体一个都没装，所以文字会悄悄回退到通用字体，MP4 里的字体排印就错了。对于非拉丁或多语言的可见文字，要么使用一种覆盖该文字体系的随附字体，要么把它罗马化 / 转写（例如 `日本語` → `Japanese`）；两者都做不到的话，它就超出了这一帧的范围 —— 不要编造字体名。
- **禁区 + 不放旁白文字**（目测，无代码）—— 没有任何东西位于 83% 分界线以下；没有任何旁白句子被渲染成可见文字。
