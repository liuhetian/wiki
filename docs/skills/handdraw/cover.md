---
description: "手绘风格出图·文章与视频封面：读文章全文或视频字幕，提炼 200 字摘要、推算受众，默认出 2.35:1 公众号封面，视频封面出 16:9 或竖屏，配好画风和主题色写成中英两段 prompt"
---

# 文章与视频封面

把一篇文章或一份字幕变成一张封面的 prompt。只给模型最要紧的几样：摘要、受众、场景和画幅、画风和主题色，再加一句固定的设计指令，隐喻和排版交给模型自己做。画风和主题色的挑法、画风片段怎么展开，照[入口页](index.md#activation)。

## 先判断是哪种封面 { #scenario }

| 输入 | 场景 | 画幅 |
|---|---|---|
| 文章正文、Markdown、文章路径 | 公众号文章封面（默认） | 2.35:1，即公众号头条封面的 900×383，也兼容 X 文章封面的 5:2 |
| 文章，用户说明是小红书 | 小红书图文封面 | 3:4 |
| 用户说「视频封面」「缩略图」「B 站封面」「YouTube 封面」，或者给的是字幕（`.srt`、`.vtt`、带时间轴的逐字稿） | 视频封面 | 横屏 16:9；竖屏短视频（抖音、快手、小红书、视频号）9:16 或 3:4 |

2.35:1 的封面在信息流里会被裁：视觉隐喻和大标题都收在中间的水平安全带里，上下各留至少 12% 的空白，不贴边。

## 步骤 { #steps }

1. **提炼摘要**：200 字左右，写核心事件或核心观点、因果逻辑和带给读者的启发；字幕就提炼视频的主题和亮点
2. **推算受众**：结合知识深度和读者诉求，一两句话说清给谁看
3. **定场景和画幅**：照上表
4. **配画风和主题色**：用户给了编号就用，没给就推荐一组，附一句理由
5. **写 prompt**：照下面的模板出中英两段。视频封面一定要有「视频封面设计，网感强，吸引人眼球」

## 文章封面模板 { #article }

```text
文章摘要：{200 字左右的核心摘要}。
受众：{推算出的受众}
业务场景：公众号文章封面（默认 2.35:1 超宽画幅，兼容 X 文章 5:2）。

画幅与构图规范：超宽画幅比例 2.35:1。所有视觉核心隐喻与主标题大字必须居中收拢在中央水平安全带内，上下两端保持充足的安全留白，严禁贴边，防止平台信息流展示时被裁切。
风格：{按入口页展开的画风片段}
主题色：{中文色名}（{英文色名}）
先设计隐喻再出图，主标题明显，小字少或者没有小字。 其他你帮我设计。

请设计文章封面
```

```text
Article Summary: {about 200 words}.
Audience: {inferred audience}.
Scenario: WeChat Official Account Article Cover (Default 2.35:1 ultra-wide aspect ratio, compatible with X Article 5:2).

Framing & Layout Specs: 2.35:1 ultra-wide aspect ratio. Keep all core visual metaphors and bold main title strictly centered within the horizontal safe zone, with ample safety margins on top and bottom to prevent cropping.
Style: {style fragment}
Theme Color: {English color name}
Design a visual metaphor first, then generate the image. Ensure the main title is bold and prominent, with few or no small text. Pick the rest of the design for me.

Please design the article cover.
```

小红书封面把业务场景和画幅那两行换成 3:4。

## 视频封面模板 { #video }

```text
视频摘要：{根据字幕或内容提炼的 200 字核心摘要}。
受众：{推算出的受众}
业务场景：视频封面 (16:9) / 竖屏短视频封面 (9:16 或 3:4)。

风格：{按入口页展开的画风片段}
主题色：{中文色名}（{英文色名}）
视频封面设计，网感强，吸引人眼球。先设计隐喻再出图，主标题明显，小字少或者没有小字。 其他你帮我设计。

请设计视频封面
```

```text
Video Summary: {about 200 words extracted from subtitles or video content}.
Audience: {inferred audience}.
Scenario: {Video Cover / Thumbnail (16:9) / Short Video Cover (9:16 or 3:4)}.

Style: {style fragment}
Theme Color: {English color name}
Video cover design, high clickability and viral internet appeal, visually captivating and eye-catching. Design a visual metaphor first, then generate the image. Ensure the main title is bold and prominent, with few or no small text. Pick the rest of the design for me.

Please design the video cover.
```

业务场景那一行只留实际用的那种画幅。

## 出图 { #generate }

给完 prompt，告诉用户两条路：复制去自己常用的生图工具，或者回一句「全自动出图」由你直接画。出图用入口页说的 agent-io 图片生成，`size` 写比例。接口出不了 2.35:1 就先出 16:9：prompt 里照样写「2.35:1 居中水平安全带构图，上下留白」，拿到图后按中心裁成 2.35:1（比如 1659×948 裁成 1659×705）再交付，免得发到公众号、X 时被平台裁掉标题。
