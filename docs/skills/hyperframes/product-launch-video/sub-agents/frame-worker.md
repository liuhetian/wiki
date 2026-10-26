# Frame worker —— 产品发布增量

> 共享的规则是上面的核心契约（帧包构建器会把 `../../hyperframes/references/frame-worker-core.md` 作为 `_role.md` 拼接到本文件前面）—— 把两者当成同一个角色来读。本文件只承载产品发布帧特有的内容；你们是 N 个并行运行，**每人一帧** —— 你收到的派发里恰好只有一个帧包（packet）。想在这里加一条通用的 GSAP / timeline 规则？放错地方了 —— 它属于核心契约或 `hyperframes-core`。

## 你的 `focal:` / `roles:` —— 真实抓取的媒体

- `focal:` —— 哪个候选素材是 hero。
- `roles:` —— 每个候选素材的角色：`cutout` 前景 / `background` 满版出血 / 辅助 —— 外加可用的真实媒体（每条为 `public/<basename> — description`；**`[video]`** 标签表示一个 `.mp4` 动态来源，这个 sub-composition worker 无法挂载它）。
- **素材路径在任何地方都相对于项目根目录。** 这包括 HTML 属性和 CSS 的 `url(...)` 值，比如 `@font-face src`：使用 `assets/...`（或提供给你的 `capture/assets/...` 路径），绝不使用 `../` 或 `../../`。共享字体在派发前就已暂存好，所以每个并行的帧解析到的都是同一批本地文件；绝不回退到网络 `@import`。

## 摆放候选素材（产品发布约束）

**按每个候选素材的 `roles` 来摆放它**（`focal` 是 hero）：`cutout` 是前景主体 —— 遵守 83% 避让区，文字排在它周围，不要压在它的脸上；`background` 满版出血并压暗约 30–50%，让前景内容保持可读。帧文件是 sub-composition。音频仍归编排者所有：绝不在帧里写 `<audio>`。已批准的 `[video]` 候选素材可以声明为帧内局部的 `<video data-frame-video="approved" data-start="..." data-duration="..." data-track-index="...">`；`assemble-index.mjs` 会把它提升到宿主根节点并换算它的时间。给每个已批准的视频都写上明确的宿主几何参数，用数值型的 `data-frame-video-x`、`data-frame-video-y`、`data-frame-video-width` 和 `data-frame-video-height`；可选设置 `data-frame-video-fit="cover|contain|fill|none|scale-down"`（默认 `cover`）。组装器只会把这些值转换成宿主 CSS：帧内局部的 class 和内联样式不会越过提升边界。不要把这种声明用于音频、未经批准的 URL，或没有明确时间和几何参数的视频。如果没有提供已批准的视频，就用明确提供的静态画面 / 主视觉图（`[video-still]` 或其他图片候选素材）作为 `<img>`；不要自己抽帧、编造 URL，或悄悄嵌入未经批准的片段。

当一帧要展示抓取到的网站时，用提供的截图充当页面。不要用 HTML 重建整个网站：即使是很接近的复刻，也可能改变真实的布局、间距或品牌呈现。如果这个镜头需要页面内部有动态，就把提供的真实素材叠加在测量好的位置上，或者只重建那个会动的组件。

品牌文案来自你这一帧的 `scene` / 叙事 —— 绝不来自 `frame.md`（它是风格规范，不是产品的内容）。摆放指定的素材，绝不编造新素材。

## 跨帧交接

如果帧包里有 `handoff_in:` 或 `handoff_out:`，把这些值当作硬性的边界契约。让指定元素恰好以给定的 x/y 位置、缩放、不透明度和运动方向 / 速度开始或结束；帧包里写明"不变"的字段同样具有约束力，不是可选的。不要重新设计样式或重新诠释这个边界状态。相邻的帧正由另一个 worker 构建，它会使用与之匹配的值。
