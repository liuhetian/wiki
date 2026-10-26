# 内部风格（House Style）

没有提供设计规范（`frame.md` 或 `design.md`）时，composition 的创意方向。这些只是起点 —— 任何不服务于内容的东西都可以推翻。存在设计规范时，以它的品牌取值为准；house-style 只填补空缺。

## 写 HTML 之前

1. **解读 prompt。** 生成真实的内容。一份菜谱就列出真实的食材。一个 HUD 就要有真实的读数。
2. **选一个色板。** 浅色还是深色？写代码之前先声明 bg、fg、强调色。
3. **选字体。** 运行 [typography.md](typography.md) 里的字体发现脚本 —— 或者挑一个你本来就知道、又契合主题的字体。脚本是拓宽你的选择，不是唯一来源。

## 值得质疑的偷懒默认值（Lazy Defaults to Question）

这些图式是 AI 设计的破绽 —— 每个 LLM 第一个伸手去拿的东西。如果你正要用其中一个，停一下问问自己：这是针对**这份**（THIS）内容的刻意选择，还是我在套默认值？

- 渐变文字（`background-clip: text` + 渐变）
- 卡片 / 提示框左边缘的强调色竖条
- 深色底上的青色 / 紫到蓝的渐变 / 霓虹强调色
- 纯 `#000` 或 `#fff`（改为朝你的强调色色相带一点色调）
- 一模一样的卡片网格（同尺寸卡片重复排列）
- 所有东西都居中、分量相同（要把视线引向某处）
- 禁用字体（完整清单见 [typography.md](typography.md)）

如果内容确实需要其中某一项 —— 用居中版式做一个庄重的收尾，用卡片做一个真实的产品 UI 模型，用一个禁用字体是因为它和主题完美契合 —— 那就用。目标是有意为之，而不是一味回避。

## 颜色

- 按内容匹配浅色 / 深色：食物、健康养生、儿童 → 浅色。科技、电影、金融 → 深色。
- 一个强调色色相。所有场景用同一个背景。
- 中性色朝强调色带一点色调（哪怕一丝微弱的暖意 / 冷意，也胜过死气沉沉的灰）。
- **对比度：** 由 `hyperframes check` 强制检查（WCAG AA）。去掉装饰元素之后，文字也必须可读。
- 预先声明色板。不要每个元素各自发明颜色。

## 背景层

每个场景都需要视觉纵深 —— 在内容动画进场期间始终可见的常驻装饰元素。没有这些，场景在错开进场的过程中会显得空荡荡的。

思路（混合搭配，每个场景 2-5 个）：

- 径向辉光（带强调色色调，低不透明度，呼吸式缩放）
- 幽灵文字（主题词，3-8% 不透明度，非常大，缓慢游移）
- 强调线（细线，微弱的脉动）
- 颗粒 / 噪点 overlay、几何形状、网格图案
- 主题装饰（太空用轨道环，音乐用黑胶纹路，数据用网格线）

所有装饰元素都应该有缓慢的氛围式 GSAP 动画 —— 呼吸、游移、脉动。静止的装饰元素显得死板。

**装饰元素数量 vs 运动数量。** 「每个场景 2-5 个」指的是装饰*元素*的数量。如果项目的设计规范写着「每个场景只有一个氛围运动」，意思是对这些装饰元素施加一种循环运动（共用的呼吸 / 游移 / 脉动）—— 而不是总共只有一个元素。一个场景里 4 个装饰元素共用一种呼吸运动是对的；一个场景只有 1 个装饰元素就是装扮不足。

## 运动

完整规则见 [motion-principles.md](motion-principles.md)。速记：0.3–0.6s，变换 ease，进场时组合多种 transform，进场相互重叠。

## 字体排印

完整规则见 [typography.md](typography.md)。速记：标题 700-900 / 正文 300-400，衬线 + 无衬线（不要两种无衬线），标题 60px 以上 / 正文 20px 以上。

## 色板

写 HTML 之前，先声明一个背景色、一个前景色、一个强调色。

| 类别              | 适用于                                        | 文件                                                          |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------- |
| 大胆 / 活力（Bold / Energetic）  | 产品发布、社交媒体、公告 | [palettes/bold-energetic.md](../palettes/bold-energetic.md)   |
| 暖调 / 编辑感（Warm / Editorial）  | 讲故事、纪录片、案例研究     | [palettes/warm-editorial.md](../palettes/warm-editorial.md)   |
| 暗色 / 高级（Dark / Premium）    | 科技、金融、奢侈品、电影感              | [palettes/dark-premium.md](../palettes/dark-premium.md)       |
| 简洁 / 企业（Clean / Corporate） | 讲解视频、教程、演示          | [palettes/clean-corporate.md](../palettes/clean-corporate.md) |
| 自然 / 大地（Nature / Earth）    | 可持续发展、户外、有机              | [palettes/nature-earth.md](../palettes/nature-earth.md)       |
| 霓虹 / 电光（Neon / Electric）   | 游戏、科技、夜生活                       | [palettes/neon-electric.md](../palettes/neon-electric.md)     |
| 粉彩 / 柔和（Pastel / Soft）     | 时尚、美妆、生活方式、健康养生          | [palettes/pastel-soft.md](../palettes/pastel-soft.md)         |
| 宝石 / 浓郁（Jewel / Rich）      | 奢侈品、活动、精致                 | [palettes/jewel-rich.md](../palettes/jewel-rich.md)           |
| 单色（Monochrome）        | 戏剧性、以字体排印为主                  | [palettes/monochrome.md](../palettes/monochrome.md)           |

或者从 OKLCH 推导 —— 选一个色相，在不同明度上构建 bg/fg/强调色，所有颜色都朝这个色相带一点色调。
