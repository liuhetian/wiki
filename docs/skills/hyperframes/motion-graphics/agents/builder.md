# Motion-Graphics Builder

把 `shot-plan.json` 变成一个可渲染的 HyperFrames composition（`compositions/index.html`）。一切都留在 HF 生态内 —— HTML 是唯一事实来源；由一条 **paused** GSAP timeline 承载全部运动；引擎负责 seek 它。各 category 专属的构建规则放在 `categories/<id>/module.md`；本文件是共享契约。

## 复用优先（默认做法）

默认 = **组装现有的 catalog 能力，而不是手写**：

- **每一个被点名的效果，都先搜索** —— `npx hyperframes catalog --query "<the move, in plain English>" --json`，包括用户在计划写好之后才点名的效果。它不需要安装任何东西，也不需要项目。只有在搜索结果里确实没有能完成这件事的东西时才手写，并用 `npx hyperframes feedback --search-miss` 报告这次未命中。
- `npx hyperframes add <block>`（registry）→ 就地定制。大多数 block 把内容 / 数据直接写死在自己的脚本里（只有少数暴露了 CSS 变量参数），所以复用 = **add + 编辑**。
- 运动用 `hyperframes-animation` 的 rules / blueprints / transitions；runtime adapter（默认 GSAP）。

只手写 (a) 没有任何 block / rule 覆盖到的缺口，(b) `asset-fusion` 的 affordance 绑定。Director 已经在 `shot-plan.json` 里点名了 block 和定制项（`content.block` + `content.customize`）；见 `catalog-map.md`。

## HF 契约（不可商量）

- 根节点 `#stage` 带有 `data-composition-id`、`data-start="0"`、`data-duration=<s>`、`data-fps`、`data-width`、`data-height`。
- 恰好一个 `gsap.timeline({ paused:true })`；登记 `window.__timelines["<id>"] = tl;`；以 `tl.seek(0)` 结尾。对渲染关键的运动**绝不用 `tl.play()`**。不要用定时器 / 异步 / 事件驱动来构建 timeline。只允许有限次重复。
- **有时间定位的 clip** 需要 `class="clip"` + 一个稳定的 `id`。一个全时长 clip 内部由 timeline 驱动的分组，不需要各自带时间属性。
- **字体**：为了确定性 / 离线渲染，优先用本地 `@font-face`（.woff2）；CDN 上的 Google Fonts 也能渲染（编译器会缓存并注入 `@font-face`），但会给出警告，并且需要联网。
- **只允许确定性的写法** —— 不用 `Date.now()` / `Math.random()` / 网络。

## 先布局，后动画

先用 CSS 搭出 **hero 帧的最终状态**（flex + padding；内容容器上绝不用绝对定位偏移；根节点必须有尺寸）。`.clip` 内的元素以及任何延迟入场都用 `fromTo()`；`from()` 只对从 `t=0` 起就处于激活状态的非 clip 元素才安全。退场归转场或最后一个场景管。完整规则：`references/builder-contract.md`。

## IR → composition

- `content.block` → `hyperframes add` 它（或内联）+ 应用 `content.customize`。
- 各 category 自己的 `content`（文字场景 / 图表数据 / 融合位置 / 新闻和推文内容）→ 按 `categories/<id>/module.md` 实现。
- 已解析的 `asset_needs` → 引用**冻结的项目本地路径**（绝不用远程 URL 或 prompt）。
- 从外层信封取 `palette[-1]` / 背景 + `font`。
- `export: alpha-overlay` → 透明背景；用 `--format webm`（或 `mov`）渲染。

## 关键正确性（GSAP / seek）

对延迟出现的元素做透明度闸门（入场之前一直设为隐藏）。在 tween 边界处钳住数值（不要冲过一个需要保持的值）。允许的 ease：`power1–4`、`back`、`bounce`、`circ`、`elastic`、`expo`、`sine`（`.in/.out/.inOut`）。每个场景一个母题。运行 `hyperframes check` 检查溢出 / 碰撞。

## 运动质量

写 timeline 之前，先阅读并遵循共享的[运动原则](../../hyperframes-creative/references/motion-principles.md)。对 `charts` 和 `stat`，在布局或给数据做动画之前，还要读[数据的运动表达](../../hyperframes-creative/references/data-in-motion.md)。

## 交给验证

自查写好的文件，然后把它交回编排者。Step 5 会在组装好的项目上运行 `hyperframes lint`、`hyperframes check` 和佐证快照。不要渲染。带着某个发现被再次派发时，修好出问题的元素，修复过程中绝不改动固定的 `data-duration`。从 Remotion 源码迁移的，改用 `/remotion-to-hyperframes` 及其 SSIM 测试工具。
