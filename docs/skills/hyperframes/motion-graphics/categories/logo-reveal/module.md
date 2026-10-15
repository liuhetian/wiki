<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/logo-reveal/module.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# logo-reveal —— category 模块

一段 **logo sting / 品牌 lockup**。logo 由用户提供，或者对已知品牌通过解析获取（`resolve --type logo --entity <brand>`）；`asset_needs` = 一个 logo `source`。约 3–5 秒。常用 `export: alpha-overlay`（做成 sting，叠到其他素材画面上）。

## 规划（Director）

`content`：`{ logo: <asset path>, tagline, url }`。外层信封：品牌色板（或从 logo 上用取色器取色），优雅的节奏。

## 词汇 / 依托

- Block：**`logo-outro`**（逐块组装 + 发光晕染 + 标语淡入 + URL 胶囊）。
- Rules：`rules/svg-path-draw`（矢量 logo 的描绘动画）· `rules/scale-swap-transition` · `rules/3d-text-depth-layers`。
- 基本元素：描绘 / 遮罩显现 / 粒子组装 · `glow` 晕染 · `underline_sweep` · 定格。

## 构建（复用优先）

复用 `logo-outro` + 替换 logo / 标语 / url / 色板；**或者**手写：把 logo 放到它的 hero 帧位置（CSS），通过描绘（SVG `stroke-dashoffset`）或遮罩 / 缩放来显现，加上发光晕染 + 强调色下划线扫过，然后定格。SVG logo 优先用描绘；位图 logo 用遮罩 / 缩放 + 发光。作为 overlay 导出时用透明背景。
