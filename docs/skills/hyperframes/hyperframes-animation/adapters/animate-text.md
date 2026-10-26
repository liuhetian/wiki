# 文字效果 —— 参考

对于确定性的文字动画规格（例如精确到 `240ms / 46ms stagger / steps(1, end) easing` 的 `typewriter`），本 skill 交给另一个独立的 **`animate-text`** skill 处理，它由 Pixel Point 维护，地址是 github.com/pixel-point/animate-text[^animate-text]。它提供一个包含 24 种具名文字效果的目录，带有可移植的契约，以及针对各个库的实现配方（GSAP、Anime.js、WAAPI）。

**我们不在本仓库内附带这个目录。** Pixel Point 的 `animate-text` 是事实来源；把它的文件搬进来会违反上游的授权（截至撰写时，上游没有声明明确的许可证）。单独加载那个 skill，既能保持法律层面的清晰，又能给你同样的目录。

## 如何使用

当某个段落节拍需要确定性的文字动画时，把上游 skill 和本 skill 一起加载：

```bash
# In your project root, install the upstream skill into .agents/skills/
npx skills add pixel-point/animate-text
```

或者在支持 skill 的 agent runtime 里，按名字调用这个 skill：

```
/animate-text
```

安装之后，规格文件位于：

```
.agents/skills/animate-text/assets/effects/<id>.json   # per-library implementation recipe
.agents/skills/animate-text/assets/specs/<id>.json     # portable motion contract
```

读取这些文件的子 agent 会得到精确的 GSAP 时间、easing 字符串、DOM 拆分规则和 stagger 算法 —— 无需任何创意发挥。

## 什么时候不需要上游 skill

如果某个段落节拍的文字动画简单到可以用文字描述（"标题逐词淡入上移，stagger 80ms"），就利用这些 skill 里已有的 GSAP 知识直接内联实现（`hyperframes-creative` → `references/motion-principles.md` 和 `references/beat-direction.md`；`hyperframes-animation` → `techniques.md` 的第 4 条 "Per-Word Kinetic Typography"）。上游目录在以下情况下最有价值：

- 你想在多个段落节拍里使用某个特定的**具名**效果（让它们感觉像同一套设计系统，而不是一次性的零散效果）
- 你在几个相似的效果之间做选择（typewriter、per-character-rise 还是 bottom-up-letters），想在一个地方看到全部 24 种
- 你需要感知布局的效果（`kinetic-center-build`、`short-slide-right`、`short-slide-down`），光靠参数不够 —— 这些效果附带自定义的布局算法

## 效果名称 —— 词汇表（**不要**把它当作实现来源）

为方便写分镜：上游 skill 提供 24 种效果。这里列出它们的 ID，这样即使在加载上游 skill 之前，你也能在 `STORYBOARD.md` 里点名它们。**实现规格在上游 skill 里，不在这里。**

- **逐字符（7）：** soft-blur-in, per-character-rise, typewriter, bottom-up-letters, top-down-letters, stagger-from-center, stagger-from-edges
- **逐词（8）：** per-word-crossfade, spring-scale-in, shared-axis-y, blur-out-up, kinetic-center-build, short-slide-right, short-slide-down, depth-parallax-words
- **逐行（2）：** mask-reveal-up, line-by-line-slide
- **整个元素（7）：** micro-scale-fade, shimmer-sweep, fade-through, shared-axis-z, scale-down-fade, focus-blur-resolve, shared-axis-x

描述、时长、easing 曲线和针对各个库的配方：加载 `/animate-text` 并阅读它自己的目录页。

对于 `mask-reveal-up` 和其他行遮罩效果，要为字体在静止状态下实际绘制出的字形留出空间。过紧的行高加上 `overflow: hidden`，可能会在揭示结束后切掉下伸部分和重音符号。遵循[文字遮罩指引](../techniques.md#12-clip-path-reveal-masks)：先按文字字号给出 `0.2em` 的块方向 padding，并配一个抵消用的负 margin；或者在入场落定后，在 timeline 上解除裁切。使用实际的字体和文字，检查一张落定后的快照；`data-layout-allow-overflow` 也会免除静止状态下的检查。

## 在分镜里

每个段落节拍里的每个文字元素都可以按 ID 点名一种效果，例如：

```markdown
**Text Animations:**

- Main headline: `kinetic-center-build`
- Eyebrow label: `soft-blur-in`
- Body copy 3 lines: `mask-reveal-up`
```

实现该段落节拍的子 agent 如果还没加载 `/animate-text`，就会加载它，然后从上游 skill 的文件里读取每个具名效果的规格。

如果上游 skill 不可用（离线构建、网络限制、不支持加载 skill 的 agent runtime），子 agent 就回退到仅凭描述来实现效果 —— 利用 GSAP 知识，再把效果 ID 当作意图描述（例如 "typewriter" = 逐字符、阶跃式、无插值的揭示）。

[^animate-text]: [github.com/pixel-point/animate-text](https://github.com/pixel-point/animate-text)，2026-10-15 读。
