<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/lower-thirds/module.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# lower-thirds —— category 模块

<!-- registry-items: allow= -->

**registry 里有什么，以在线搜索为准。** 下面的表是手工维护的样本，按设计就覆盖不全：在断定 registry 缺少某样东西之前，先运行 `npx hyperframes catalog --query "<what you want>" --json` —— 它不需要安装任何东西。这里的条目名由 `bun run lint:skills` 对照 `registry/registry.json` 检查。

**姓名 / 头衔条、标注、社交 overlay** —— 用来叠在其他素材画面上的图形。无素材（+ 可选的 logo）。通常 `export: alpha-overlay`（透明）。约 3–6 秒（或循环 / 定格）。

## 规划（Director）

`content`：`{ name, role, position (lower-left / lower-third / corner), brand_colors[] }`。默认 `export: alpha-overlay`。

## 词汇 / 依托

- Block：`caption-*`（pill-karaoke、neon-accent、editorial-emphasis）+ registry 里的 **overlay** block（`instagram-follow`、`tiktok-follow`、`yt-lower-third`、`x-post`、`spotify-card`、`macos-notification`）。
- 基本元素：滑入 / 擦入 · 条形显现 · `glow` · 淡出 / 滑出。

## 构建（复用优先）

复用最接近的 overlay / caption block + 设置姓名 / 职位 / 账号名 / 品牌色 / 位置；**或者**手写一个擦入的条（`scaleX` 从 0 开始，`transform-origin:left`），文字在它后面向上滑入，定格，再滑出。**透明背景**（`export: alpha-overlay` → `render --format webm/mov`），这样它才能叠加在素材画面之上。让它待在标题安全区内的下方区域。
