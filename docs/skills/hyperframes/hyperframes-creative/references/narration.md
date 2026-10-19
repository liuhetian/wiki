<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/narration.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 旁白与脚本

如何为视频 composition 写旁白脚本。composition 包含旁白或 TTS 时阅读。

## 语速

- **每秒 2.5 个词**是自然的说话语速
- 15 秒 = 约 37 个词。30 秒 = 约 75 个词。60 秒 = 约 150 个词
- 给停顿留出空间。句与句之间的静默是一种特性，不是冷场
- 脚本应该感觉比视频**更短**（SHORTER）—— 视觉上的喘息空间很重要

## 语气

像一个人那样写，而不是像一本宣传册：

- 使用缩约形式："it's"、"you'll"、"that's"、"we've"
- 变换句子长度 —— 短促有力的短语和较长、流畅的句子混用
- 大声读出来。如果听起来像机器人，就重写
- 除非受众期待，否则避免行话

## 数字读法

写下你希望声音说出来的内容。TTS 是照字面读的。

| 产品里写的 | 脚本里写成                |
| -------------- | --------------------------------- |
| 135+           | more than one hundred thirty five |
| $1.9T          | nearly two trillion dollars       |
| 99.999%        | ninety nine point nine percent    |
| 200M+          | over two hundred million          |
| 10x            | ten times                         |
| API            | A P I                             |
| stripe.com     | stripe dot com                    |

画面可以显示精确的数字，而声音读的是取整后的数。

## 结构

产品视频：

1. **钩子** —— 这个产品有什么出人意料或令人印象深刻的地方？一个大胆的论断、一个挑衅的问题、一个反差，或者一个惊人的数字。这就是开场白。**变换钩子的类型** —— 不要每次都默认用一个数据。
2. **故事** —— 这个产品做什么？谁在用它？保持具体。
3. **证据** —— 数据、客户名称、社会认同。来自产品本身的真实数字。
4. **CTA** —— 观众应该做什么？「去 stripe dot com 开始构建。」

不是每个视频都需要全部四项。一支 15 秒的社交广告可能是 钩子 + 证据 + CTA。一支 60 秒的产品导览四项都用，故事部分更多。

## 开场白

视频里最重要的一句话。它必须在前 3 秒内制造张力、好奇或惊讶。

有效的模式：

- **一个大胆的论断**：「驱动互联网经济的金融基础设施。」
- **一个挑衅的问题**：「如果你的数据库会思考呢？」
- **一个反差**：「你的 AI agent 已经知道怎么做视频了。它只是需要对的格式。」
- **一个让人震惊的数字**：「将近两万亿美元。」（少用 —— 不是每个视频都该以一个数据开场。）

如果开场很泛（「欢迎来到 Stripe」/「隆重介绍我们的产品」），推倒重来。

## 示例

出自一支 62 秒的产品发布视频（团队参考）：

```
Your AI agent already knows how to make videos.
It just needs the right format.

This is Hyperframes. An open source framework. HTML in, video out.

A div is a keyframe. Data attributes are your timeline.
CSS is your look. G-Sap is your animation engine.

Anything a browser can render can be a frame in your video.

CSS animations. G-Sap. Lottie. Shaders. Three.js.

Drop in music, sound effects, footage — it all composes together.

No new framework for the agent to learn.
Just HTML.

The agent writes it. The renderer captures every frame as MP4.
It's deterministic. Identical outputs, every time.

Give your agent the CLI. Tell it what to make.
Watch it build.

Hyperframes. Go make something.
```

注意：62 秒约 140 个词 —— 即每秒 2.3 个词，给停顿和视觉喘息留出了空间。
