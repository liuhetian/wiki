<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/kinetic-type/module.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# kinetic-type —— category 模块

文字就是 hero；字体排印 + 运动承载信息。通常无素材（`asset_needs: []`）。

## 规划（Director）

- **风格优先。** 如果项目里有 **`design.md` / `frame.md`**（优先级：`frame.md` → `design.md` → `DESIGN.md`），**阅读**它，并使用它的**确切色板 / 字体 / 约束** —— 不要自己发明。没有规范 → 挑一个有名字的风格，或者问：情绪 + 亮色 / 暗色 + 任何品牌色 / 字体。（风格是这个用例必须体现的一项输入；同一个镜头放在两份不同的 `design.md` 下，看起来应该不一样。）
- 按意思 / 换气把文案切分成场景（英文约 3–7 个词；中文约 4–12 个字）。给每个场景打上 **Hook → Build → Punch → Resolve**（钩子 → 铺垫 → 重击 → 收束）标签。
- 每个场景 1–2 个 `emphasis_words`。每个场景：`emotion` + `motion`（自由描述）+ `beats`。

## 词汇

运动基本元素 + registry block：**`references/motion-vocabulary.md`**（slide / scale / fade / blur / typewriter / word_reveal / wave / bounce / slam / scale_pulse / shake / glow / color_shift，外加 18 个 `caption-*` block）。

## 构建（复用优先）

- 有合适的 **`caption-*` block** 时优先用它（`caption-kinetic-slam` / `caption-editorial-emphasis` / …）：`npx hyperframes add` + 设置文字 / `emphasis_words` / 色板 / 字体。
- 否则手写：一个全时长 `.clip`；每个场景一个 `.group`（flex 居中）；每个词一个 span；按每个场景的 `motion` 写显式的 `gsap.fromTo()` 入场；强调词 → 在节拍点上做 `glow` / `scale_pulse`；只在内部的非 clip 元素上使用 seek 安全的 `autoAlpha`。遵守 `references/builder-contract.md`。
- 参考实现：原型 `v0-text-motion-demo` + `pipeline-demo`。
