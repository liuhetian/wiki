<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/anti-patterns.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 反模式

你会默认掉进这些坑。停下。

每一条：坏习惯、它会造成什么、该怎么做。口吻来自一个已经看着 agent 这样干了 10 遍的人 —— 因为我们确实看过。

---

## 布局

### 你默认用居中对齐的 crown。

`.crown-plane { left: 0; right: 0; text-align: center }` 是模板默认值，而你会因为它成功过一次就在每个视频上都沿用它。当主体位于中心偏右时（16:9 画面里的 Jobs），身体会吃掉这个词中间 60% 的部分，"THE BEATLES" 就变成了 "THE \_\_\_ S"。

**在使用默认 crown 之前**，先过一遍 [layout-heuristics.md § Crown placement](layout-heuristics.md) 里的三个条件：

1. 主体位于画面中心 10% 范围内
2. 两侧干净区域都 ≥ 15%
3. Crown 宽度 > 主体宽度 + 400px

只要有一条不满足，就**把 crown 挪到较大的那块干净区域**，换用更窄的容器和更小的字号。不要继续把一个即将被遮挡 60% 的词居中摆放。

### 你把文字最左边算成 `plane_left + padding`。

这对左对齐是对的。但对你正在用的模板是错的 —— 它们的主栏是**右对齐**，crown 是**居中对齐**。真正的最左边取决于词的宽度。

| 对齐方式 | leftmost_x                                         |
| --------- | -------------------------------------------------- |
| 左对齐      | `plane_left + padding_left`                        |
| 右对齐     | `plane_right − padding_right − longest_line_width` |
| 居中    | `plane_center − longest_line_width / 2`            |

要按**换行后最长的那一行**来算，而不是整个短语。"four very talented guys" 会折成 3 行 —— 最宽的是 "talented"（约 8 个字符），而不是 23 个字符。

### 你把 `plane_left` 当成文字的最左边缘。

它不是。在 `left: 180px` 加一个 468px 宽的右对齐词时，相对 plane 而言文字从 `plane_left` **之前** 104px 处开始，但实际上落在 plane 框内部的某个位置。plane 框只是设定坐标空间 —— 文字在框内的位置取决于对齐方式。要检查编译后的输出，而不是 plane 的属性。

### 主体偏离中心时，你却把文字按画面居中。

要看主体身体的中心，而不是画面中心。Jobs 在 1920 宽的画面里位于 x=1100。**场景**的重心是 1100，不是 960。把文字对齐到 960 居中，等于对齐到空荡荡的左边三分之一，而不是对齐到任何有意义的东西。

### 你把 memory-wall 的位置数值复制粘贴到新视频里。

`top: 40, right: 30, width: 720, rotateY: -13` 在一个右侧有吸音棉墙的 1280×720 画面里管用。换到一个背景是书架的 1920×1080 画面就不管用了。在复用任何数值之前，先针对新视频跑一遍 [scene-types.md](scene-types.md) 里的 6 项检查清单。

---

## 字体排印

### 不管栏宽多少，你都用模板默认字号。

模板默认值（66/78/92/140）是按约 560px 的栏调好的。当你把 plane 加宽到 700px 以上却不动字号时，字幕会显得分量不足 —— 小字漂在大片留白里。

使用 [字号 × 栏宽矩阵](typography-presets.md)。对 700px 的栏来说，是 78/108/128/220 —— 全面放大 30–40%。放大之后要重新检查 pillarbox 安全性（更大的右对齐文字会向左延伸得更远）。

### 每个第一条字幕你都选 `intro` 样式。

Intro = 斜体、更小、沉思感。用于填充性的话语标记（"You know,"、"So,"、"Well,"）没问题。但当第一行其实就是论点时（"I've had this kind of upbringing"），**不要**用它。要按语义读这些词，而不是按位置。

### 你因为"每条字幕看起来都很干净"就完全省掉强调。

一个没有 emph 或 crown 的故事在字体排印上是平的 —— 观众感受不到渐强。每个视频至少为那句落地的话留一个 emph。只有真正单调的内容（政策声明、警告）才可以省略。

### 你给每个分组都配一个自己的样式。

样式本应传达*层级*。在一个 15 秒的视频里把 `intro`/`phrase`/`emph`/`dream`/`crown` 全用上，就意味着它们什么都传达不了。短片段最多挑 2–3 种样式。

### 你只用那 5 个预设类名。

`intro / phrase / emph / dream / crown` 是脚手架，不是封闭集合。标准范例 `memory-wall.html` 用的是 `cap-1 / cap-2 / cap-3 / cap-4` —— **按位置编号**，每个位置都有定制的字体排印。它就是靠这个在高潮处做出 3 行右对齐的瀑布式排列。你没法用 `"style": "dream"` 表达"这条字幕在第 2 个位置有悬挂缩进"。

plan.json 里的 `"style"` 字段接受**任意字符串** —— 它会变成 `class="cap-<string>"`。在 `custom_css` 里定义这个类：

```json
"custom_css": ".cap-1 { font-size: 78px; ... } .cap-2 { padding-right: 44px; }",
"groups": [{"id": "cg-0", "style": "1", ...}]
```

当场景需要按位置定制字体排印时，就这么做。不要硬塞进 `intro / phrase / emph`。

### 标准范例里已经有答案了，你还从 plan.json 重新生成。

当场景构图和 `references/example-renders/memory-wall.html` 或 `champion.html` 吻合时，把那个 HTML 克隆到 `<project>/index.html`，只替换 GROUPS 数组。不要从 preset 重新推导设计 —— 你会丢掉那些经过多轮迭代才验证下来的按位置定制的字体排印。见 [bespoke-vs-presets.md § The clone-and-tweak workflow](bespoke-vs-presets.md)。

---

## 混合

### 你默认用 `mix-blend-mode: overlay`。

Overlay 在**中间调**背景上才有效。在暗色书架上（亮度 <60），overlay 会让白字渲染成黑色。在阳光充足的背景上（亮度 >180），overlay 会过曝。要在一帧采样画面里检查字幕区域的实际亮度。这样选：

- 中间调表面（60–180）→ `overlay`
- 暗色表面（<60）→ `screen`
- 明亮表面（>180）→ `normal`，配不透明文字

### 你在词的入场上做 `letter-spacing` 动画。

你在哪儿见过一个"打字机呼吸"效果，于是在 `fromTo` 的 "from" 状态里加了 `letterSpacing: "0.04em"`。结果：每帧都触发 inline-block 重排 → 整个 `.cap` 行框重新计算 → 字幕在行与行之间明显跳动。见 memory-wall 的 "Some → line 2" bug。

**只对 opacity + transform 做动画。** 想要呼吸效果，就用 `scale` 或 `y`，不要用 letter-spacing。

---

## 动画

### 你既淡入分组容器，又淡入每个词。

默认做法感觉更稳妥：先淡入容器，再逐个淡入词。但 container.opacity × word.opacity 会产生一条非线性曲线 —— 进度 40% 时合成不透明度是 16%，而不是 40%。肉眼看到的结果是：字幕好像在一半左右时"啪"地出现。

入场时用 `tl.set` 把容器不透明度设为 1，然后只淡入词。单层不透明度 = 线性的感知淡入。

### 你把字幕堆在一个 flex 列里。

Flex-direction: column 里放多个 `.cap` 子元素，在源码里看着很整齐。但运行时，隐藏的字幕（`visibility: hidden`）仍然占着 flex 空间。新入场的字幕会出现在列的*底部*，而不是设计好的位置 —— 落进手势区，被裁掉。

plane 里的每个 `.cap` 都用 `position: absolute`，这样隐藏的字幕就不占布局。两个随附的模板都是这么做的。

### 你让 timeline 从 t=0 开始。

恰好在 t=0 出现的字幕，感觉像是视频开始前就已经在那儿了。偏移 0.1–0.3 秒（hyperframes 的 motion-principles.md 也这么认为）。最后一条字幕同理 —— 让它在视频淡出之前退场。

---

## 场景准入

### 你相信"看起来是一个说话人" = "从头到尾都是一个说话人"。

电视资料片段会在一句话说到一半时切到 B-roll。访谈片段会插入切到采访者的镜头。你没检查第一帧之外的画面，于是字幕横跨了一个镜头转场渲染。结果：为主体 A 设计的字幕，在一半的渲染时长里是相对主体 B 的位置（或空画面）摆放的。

规划之前，先在 20%、50%、80% 处采样帧。如果场景有变化，裁剪到最长的单一主体片段。

### 你无视烧录字幕 / pillarbox / 水印。

你看到了两侧的黑边，却没去计算安全区。你的字幕越过了 pillarbox。或者：原片里已经有烧录字幕，你又加了一层 —— 两套字幕系统争抢注意力。

先跑 **letterbox 探测**。如果原片已有字幕，就拒绝并说明："source already captioned, adding more would conflict."

### 你没对照节拍检查时间点，就直接交付 Whisper 的转写稿。

转写用的是 Whisper（通过 `transcribe.cjs`，不需要 API key）—— 词级时间点不错，但并非万无一失：某个词可能落成接近零的时长，或者时间戳差了一拍。这个 skill 要求逐字 + 卡在节拍上，所以 `check-timing.cjs --strict`（80ms 容差）是闸门，不是建议 —— 渲染前要在 `plan.json` 里修正漂移，并且绝不要把两个转写词塞进同一个带时间的条目（第二个词会继承第一个的时间戳，提前触发）。

---

## 抠像

### 你给抠像的 ONNX 开启 CoreML。

这是 Apple 的路子，显然更快。不对。CoreML 会把 ONNX 计算图拆分到多个执行提供者上。由此产生的混合精度边界（在之前的 RVM 引擎上观察到）会让主体脸部内部的 alpha=30，而背景正确地读为 0。字幕透过脸显示出来。只固定使用 CPU 执行提供者（`onnxruntime-node`）。我们的 `matte.cjs` 已经这么做了；不要通过重新加回 CoreML 来"优化"它。

### 你按"通用 vs 人像"来挑 matte 模型。

决策已于 2026-06-12 翻转，依据是一次 5 个模型 × 6 个场景、带字幕渲染的 A/B 测试：这里 matte（抠像遮罩）的任务是字幕分层，而不是道具保真。`u2net_human_seg`（通过 hyperframes `remove-background`）通常会把细长的偏置家具（麦克风悬臂）排除在 matte 之外 —— 词不再被悬臂切开，这在真实字幕视频上胜过了 PP-MattingV2 保留道具的行为。它并不精确：主体附近的大型显著物体（望远镜支架）仍然可能漏进来 —— 一定要采样检查 frames_fg/。已知代价：**手持**的产品可能间歇性地掉出 matte（字幕从它前面穿过）—— 把产品演示的高潮安排在避开手持物体的位置。`isnet-general-use` 直接落败（逆光头发崩坏）。birefnet-portrait（MIT 许可）在语义上胜过所有模型（既保留手持物品又排除家具），但它有 928 MB、CPU 上每帧约 7 秒 —— 是未来的高质量档位，不是默认值。

---

## 分组

### 你给每个词都上字幕。

转写稿很啰嗦 —— "you know, um, I, I mean, you know" 是同一个段落节拍里的 5 个词。全部上字幕会让画面杂乱，并打断阅读节奏。

在编辑上删掉填充词。使用 [caption-grouping.md](caption-grouping.md) 里的规则：合并短碎片，删掉重复的话语标记，保留意思，修掉噪音。你是在写辅助语音的字体排印，不是在写法庭笔录。

### 你按固定词数分组。

"每条字幕永远 3 个词"会让每条字幕看起来都一样，并且和说话的自然节奏对着干。应该在句子边界、250ms 以上的停顿和语义单元处断开。字幕长短自然会在 2 到 5 个词之间变化 —— 这才是对的。

---

## 元反模式

### 你读了一份参考文档就跳过了其余的。

你会只读这一份文件就觉得心里有底了。这些反模式引用了 `layout-heuristics.md`、`typography-presets.md`、`scene-types.md` 里定义的概念。如果你没读过那些，这里的修正建议就讲不通。

**新视频的阅读顺序**：

1. SKILL.md（决策闸门 + 流水线 + 预检探测）
2. bespoke-vs-presets.md（**先检查有没有合适的标准范例 —— 有就克隆**）
3. scene-types.md（模板选择 —— 全部 4 个墙面条件）
4. layout-heuristics.md（位置、侧边、crown、字号比例、pillarbox 公式）
5. typography-presets.md（字号 × 栏宽表、起始值）
6. caption-grouping.md（词 → 分组）
7. **最后读本文件**（在你落定 plan.json 之前把自己拦下来）

如果时间紧，也还是要读这一份 —— 它会标出你即将犯的错误。
