# stat —— category 模块

单个 **hero 数字**的显现。无素材（"输入"就是这个数字）。约 4–6 秒。

在规划或构建数字显现之前，先读[数据的运动表达](../../../hyperframes-creative/references/data-in-motion.md)。

## 规划（Director）

`content`：`{ value, prefix ($), suffix (% / x / K-M-B), label, ring: bool }`。外层信封：粗重的展示字体，克制的色板 + 一个强调色。

## 词汇 / 依托

- Block：合适时用 **`apple-money-count`**（金融风格：$ 计数器 + 绿色闪光 + 金钱爆发 + 音效）；否则手写。
- Rules：`hyperframes-animation/rules/{counting-dynamic-scale, stat-bars-and-fills}`。
- 基本元素：`count_up`（里程表式）· `scale_pop` · `ring_fill`（弧形）· `label_stagger`（在数值之后）· `hold`。

## 构建（复用优先）

复用 `apple-money-count` + 设置目标值 / 前缀 / 后缀 / 标签 / 色板；**或者**按已验证的原型 `v0-stat-motion-demo` 手写：

- **count-up 由 timeline 驱动** —— tween 一个代理对象 `{v:0}→target`，在 `onUpdate` 里写入格式化后的数字（seek 安全；绝不用 setInterval / 挂钟时间）。
- `font-variant-numeric: tabular-nums`；减速型 ease；约 1.2–1.6 秒，然后**定格**在最终数值上。
- 圆环 / 弧形用 `stroke-dashoffset` 实现，与 count-up 同步结束；标签在数字落定**之后**淡入（数值 → 意义）。
