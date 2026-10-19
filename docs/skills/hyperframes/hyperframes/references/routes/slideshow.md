<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/routes/slideshow.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 路由：slideshow

- **输入：** 一份 brief、大纲或已有页面，要制作成演示文稿、路演 deck 或交互式 deck。如果"幻灯片"、"deck"或"转换这个页面"有歧义，先确认用户要的是 HyperFrames slideshow，再开始制作。
- **输出：** 一个可运行的 HyperFrames composition，外加 `SlideshowController` 使用的 JSON island：分立的幻灯片、分段揭示（fragment reveal）、分支、热点、演讲者模式和演讲者备注。交付物是一个可导航的 deck，不是 MP4。
- **触发：** "做一份路演 deck"、"交互式演示文稿"、"把这个页面转成幻灯片"、"带演讲者模式的幻灯片"。

## 访谈

- 唯一的问题就是路由确认本身 —— "你想把它做成 HyperFrames slideshow 吗？" —— 在分诊时问（它在所有模式下都保留：路由错误是质量问题）。之后的一切都由 deck 契约负责。
- **运行形态：** 两个问题都不问 —— 交付物是一个可导航的 deck，不是渲染出来的视频。
- **入口处的能力提议：** 跳过。确认路由之后，剩下的所有选择都由 deck 工作流负责。
