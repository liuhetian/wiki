<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/talking-head-recut/references/DESIGN_INDEX.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# V—Take 视觉设计库

本目录是 talking-head-recut skill 的一个**参考库**。样式（style）、布局（layout）和视频画框（video frame）是三个**相互正交**的维度，设计一支要点视频时可以自由组合。

```
Style  ×  Layout  ×  VideoFrame
 (10)      (4)         (3)        = 120 possible combinations
```

决定用上某个维度时，再去读对应的参考文件。每个文件都是一个自包含的 HTML 片段，遵循 talking-head-recut 的卡片 HTML 约定（带作用域的 `<style>`、不含 `<script>`、不引用外部 URL、动画只通过 `data-anim-*` 实现）。

## 布局（Layouts）—— 视频和卡片如何分享画布

| key | 文件 | 作用 | 最适合 |
| --- | --- | --- | --- |
| `split` | [layouts/split.html](layouts/split.html) | 50/50 左右并排（横屏）或上下排列（竖屏） | 说话人与数据同等分量 |
| `stack` | [layouts/stack.html](layouts/stack.html) | 视频在上（约 52%），卡片在下 | 口播配摘要卡片 |
| `pip` | [layouts/pip.html](layouts/pip.html) | 卡片铺满画布，视频作为圆角画中画放在角落 | 内容密集的时刻，说话人退居次要 |
| `overlay` | [layouts/overlay.html](layouts/overlay.html) | 视频满幅出血，毛玻璃卡片浮在底部 | 电影感 / 戏剧性时刻 |

布局是一个**两部分的配方**：选一个 `card.zone` 值写进 `storyboard.json`，**并且**在 composition 的 `<script>` 里写一个 GSAP tween，把 `#video-wrap` 移到它的目标矩形。打开布局文件的头部，可以看到推荐的 `zone` 以及可直接粘贴的 GSAP 语句。（早先的文档提到过一个 `card.layout` 字段 —— 真实的 schema 里**并不存在**这个字段；严格的 v3 schema 只有 `card.zone`。）

## 样式（Styles）—— 卡片的视觉语言

| key | 文件 | 气质 | 强调色 | 建议字体 |
| --- | --- | --- | --- | --- |
| `academic` | [styles/academic.html](styles/academic.html) | 暖色纸张 · 网格 · 衬线体 · 蓝色高亮 | `#2557a7` | 衬线体 |
| `editorial` | [styles/editorial.html](styles/editorial.html) | 奶油色 · 珊瑚色色块 · 大号斜体引文 | `#ff3a2d` | 类 Playfair 的衬线体 |
| `minimal` | [styles/minimal.html](styles/minimal.html) | 纯黑 / 纯白 · 超大字号 · 大量留白 | `#000` | Inter |
| `spotlight` | [styles/spotlight.html](styles/spotlight.html) | 深紫渐变 · 辉光 · 戏剧性 | `#a78bfa` | 无衬线体 |
| `geom` | [styles/geom.html](styles/geom.html) | 黄绿 + 亮粉 + 黑色的撞色 | `#d4ff00` | Inter 粗体 |
| `whiteboard` | [styles/whiteboard.html](styles/whiteboard.html) | 纸张 · Caveat 手写体 · 手绘边框 | `#ff6b35` | Caveat |
| `audit` | [styles/audit.html](styles/audit.html) | 马尼拉牛皮纸 · 两端对齐的衬线体 · APPROVED 印章 | `#8b1d1d` | 衬线体 |
| `terminal` | [styles/terminal.html](styles/terminal.html) | 深色 · 等宽字体 · ASCII 边框 · 提示符光标 | `#4ade80` | 等宽字体 |
| `swiss` | [styles/swiss.html](styles/swiss.html) | 白底 · Helvetica · 严格的双线分隔 · 红色强调 | `#e8190f` | Helvetica/Inter |
| `xhs` | [styles/xhs.html](styles/xhs.html) | 奶油色 + 亮粉 · 标签胶囊 · #话题标签 · ❤️💬 互动行 | `#ff2e63` | 无衬线体 |

按内容的基调选，而不是按内容的类型选 —— 如果基调偏沉思，`academic` 同样适用于财经内容；如果基调是「工程上的严谨」，`terminal` 同样适用于非技术内容。

## 视频画框（Video Frames）—— 视频元素周围的装饰

| key | 文件 | 气质 | 何时不用 |
| --- | --- | --- | --- |
| `clean` | [frames/clean.html](frames/clean.html) | 无装饰；原始视频 | 默认；最稳妥 |
| `hairline` | [frames/hairline.html](frames/hairline.html) | 双描边 + 四角取景框刻度 | 用在 `overlay` 布局上时（与满幅出血冲突） |
| `polaroid` | [frames/polaroid.html](frames/polaroid.html) | 白色相纸边框 + Caveat 标签 + 蓝色和纸胶带（不倾斜） | 用在 `overlay` 布局上时；竖屏画中画会显得局促 |

画框是一个装饰性的 div，放在 composition 的 `#stage` 里、紧挨着 `#video-wrap`。它是一次性的 HTML（不做动画），但你可以在不同卡片之间让它淡入 / 淡出。各画框文件里有摆放用的代码片段以及它需要的内联 `<style>`。

## 选择指南（宽松参考，不是硬性规定）

| 视频内容 | 建议组合 |
| --- | --- |
| 访谈 / 对话 | `academic` × `stack`、`audit` × `split` |
| 产品发布 / 公告 | `editorial` × `overlay`、`geom` × `pip` |
| 数据分析 / 财报 | `audit` × `split`、`swiss` × `stack`、`terminal` × `pip` |
| 社交短片（9:16） | `xhs` × `overlay`、`editorial` × `stack` |
| 技术教程 | `terminal` × `split`、`whiteboard` × `pip` |
| 情感故事 / 旁白叙述 | `spotlight` × `overlay`、`whiteboard` × `overlay` |
| 极简风演示 | `minimal` × `split`、`swiss` × `overlay` |

这些只是起点。先看转写稿，定下基调，再选视觉。

## 竖屏尺寸 —— 为手机放大字号

每个 `references/styles/*.html` 都是按 **1920×1080 横屏**预览来定尺寸的。当最终 composition 是**竖屏（1080×1920）** 时 —— 这是社交 / 移动端的默认形态 —— 要把所有视觉尺寸都放大，才能在拿近的手机上看清。

| token | 横屏 | **竖屏** | 缩放 |
| --- | --- | --- | --- |
| 主标题（h1/h2） | 64–96px | **88–132px** | ×1.35 |
| 细节 / 正文 | 24–30px | **30–40px** | ×1.30 |
| 引题 / 标签胶囊 / 元信息 | 14–18px | **18–22px** | ×1.25 |
| 主数字 / 统计值 | 48–60px | **64–88px** | ×1.40 |
| 水平内边距 | 40–64px | **24–36px** | ÷1.5 |

`portraitPx ≈ round(landscapePx × 1.3)`。主标题可以放到 ×1.4；小号元信息保持在 ×1.2。竖屏下内边距要**缩小**，因为卡片更窄。

如果一张卡片必须同时适配两种画幅，就在卡片根元素上用容器查询：`container-type: inline-size` + `font-size: clamp(64px, 8.5cqi, 132px)`。

## 与源视频宽高比无关

输出画布与源视频的宽高比无关。支持三种输出比例（由用户在 SKILL.md 的 Step 7.0 中选择）：

| 比例 | 画布 | `storyboard.layout` | 最适合 |
| --- | --- | --- | --- |
| `16:9` | 1920×1080 | `"landscape"` | YouTube / 电视 / 桌面端播放 |
| `9:16` | 1080×1920 | `"portrait"` | TikTok / Reels / 移动端短视频 |
| `4:5` | 1080×1350 | `"portrait"`（因为 h>w，schema 把 4:5 视为竖屏） | Instagram 信息流 / 微信朋友圈 / 两个平台通用 |

`layouts/` 里的布局参考文件只记录了**横屏**和**竖屏**的边界。**4:5** 的边界从竖屏按纵向等比缩放推出：`4:5 y/h = round(portrait y/h × 0.703)`，`x/w` 保持不变。合成器（composer）并不关心具名的 layout 值；它只用 `composition.width × height`。

- 横屏视频放在横屏画布上 → `videoBounds` 与视频宽高比一致，没有黑边
- 竖屏视频放在横屏画布上 → `videoBounds` 是一个更窄的框（例如 `pip` 变成 248×440）；空出的一侧由卡片或背景填充
- 横屏视频放在竖屏画布上 → `videoBounds` 变成一条宽而矮的带状区域；`stack` 和 `overlay` 效果最好
- 竖屏视频放在竖屏画布上 → 最自然；任何布局都行

布局参考文件里给的是横屏数值；做竖屏时通常要把长轴翻转过来：`split` 变成上下排列，`pip` 的视频气泡缩小约 20%，`overlay` 的卡片槽位加宽到整个宽度。

## 从这些参考文件复制时必须遵守的约束

1. **不要用 `<script>`** —— 动画只通过 `data-anim-*` 属性实现
2. **不要引用外部 URL** —— 不用 Google Fonts CDN，不用远程图片；skill 在本地提供了 Caveat / LXGW WenKai TC / Inter / Virgil
3. **所有 `<style>` 规则都必须以 `.card[data-card-id="..."]` 为前缀** —— hyperframes 的清理器（sanitizer）会自动给它们加作用域，但为了可读性，写的时候就直接写成带作用域的形式
4. **不要用 `on*=` 内联事件处理器**
5. 想让卡片能干净地切换主题时，**颜色用 CSS 变量**；想要这个样式特有的标志性外观时，用内联十六进制色值

如果某个参考文件用了你没有的字体，按以下方式回退：

- Playfair Display / Noto Serif SC → `ui-serif, "Songti SC", "Times New Roman", serif`
- Noto Sans SC → `ui-sans-serif, system-ui, sans-serif`
- JetBrains Mono → `ui-monospace, "SF Mono", Menlo, monospace`
- Kalam → `'Caveat', cursive`
