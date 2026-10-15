<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/beats.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 生成项目的节拍网格

当一个已有的 HyperFrames 项目需要为它的音乐 track 生成与 Studio 兼容的节拍文件时，使用 `hyperframes beats`。这是一个 CLI 工具，不是完整的视频工作流。

```bash
npx hyperframes beats
npx hyperframes beats ./my-video
npx hyperframes beats ./my-video --json
```

项目中必须包含一个本地音乐 `<audio>` 源。用 `data-timeline-role="music"` 标记它；id 中含有 `music`、`bgm` 或 `soundtrack` 的也能被识别。该命令会在无头 Chrome 中分析那个文件，并写出 `beats/<audio-relative-path>.json`。

如果没有检测到任何节拍，命令会失败，且什么都不写。如果 Chrome 不可用，运行：

```bash
npx hyperframes browser ensure
```

要做一支完整的节拍同步视频，请路由到 `/music-to-video`。那个工作流有自己的一套音频驱动流水线和它的 `audiomap.json`；不要用这个 Studio 工具替换它的分析器。
