---
description: "视频区零散收集的维护记录：彩色手绘三维穿梭视频收录自 makerjackie/parallax-ink-video-skill，整页中译并改写，渲染工程原样收录，配乐配音换成 agent-io"
---

# 视频区零散收集

`gallery/video/collected/` 放不成套、单条收进来的视频成品和做法，一条一页。来源记在本页。

| 页面 | 条目 | 来源 | 收录日期 | 视频 |
|---|---|---|---|---|
| [彩色手绘三维穿梭视频](../../gallery/video/collected/gallery-parallax-ink.md) | 照片画成彩色手绘、拆层放进三维空间穿梭的视频做法 | GitHub 仓库 makerjackie/parallax-ink-video-skill[^pi-repo] 的 `SKILL.md`、`references/` 和渲染工程，钉在 `6077224`（2026-09-27），自标 v1.0.0；仓库没放许可证 | 2026-10-17 | 作者 Maker Jackie 在抖音发的成品[^pi-video]转码收录；另有一支我们实测的 |

## 存档时做了哪些改动

- 「彩色手绘三维穿梭视频」是一个 Codex skill 的整套做法，整页中译并改写：
    - **怎么找到的**：视频正文写「做了个 Parallax Ink Skill」，按这个名字在 GitHub 搜到了仓库。视频用 agent-io 的 `douyin.py` 经中转取下、`video_read.py` 取帧和转写，没直接访问抖音。正文说灵感来自博主「老辈子手搓还有人看吗？」；上游的示例说明也提到，效果是照着一支参考视频的视觉规律自己实现的，不是逆向那支视频的工程
    - **许可证**：仓库没放许可证文件。本站自己看、不商用，照写作规范收原件
    - **没收**：`README.md`（Codex 的安装方法，基本流程和使用边界在 SKILL 里都有）；`agents/openai.yaml`（客户端显示名，「彩色手绘三维穿梭视频」拿来当了页面标题）；`.gitignore`；`references/verified-example.md` 里作者的迭代过程（V2 的慢轮播和程序配乐被否、V3 改成每人 3.5 秒的快速折返并得到认可、猫版加 1.2 秒停留、四种转场实验、配音在冰糖、茉莉、白桦三种音色里选了白桦），能做到和没证明的部分收进了「能做到哪一步」
    - **结构**：`SKILL.md` 和 `scene-options.md`、`motion-variants.md`、`music-selection.md` 合成一页，按流程排：底稿、配乐、拆层构建渲染、场景 JSON、四种转场、运镜与声音、验收
    - **渲染工程**：上游的 `assets/starter/` 原样收在 [`collected/assets/parallax-ink-starter/`](../../gallery/video/collected/assets/parallax-ink-starter/requirements.txt)，一个字没改；`references/cats-scene.json` 改名 `assets/parallax-ink-cats-scene.json`。页面首段用标准那一行声明只打这个目录的整包，同时列出 9 个文件，也能逐个取
    - **底稿**：上游只描述要什么样的手绘、没给 prompt，也没提分层脚本对底稿的假设。我们照 `layers_v2.py` 写死的纸色、冷暖色判定和脸的位置写了 prompt，接 agent-io 的 gpt-image-2.5 改图，主体挖成填空，placeholder 是实测那次的值
    - **配乐**：上游默认从曲库 music.shapeof.world 选曲，改成默认用 agent-io 的生成音乐现做一段；曲库的选曲、授权核对压成一条备选
    - **配音**：上游可选的 `mj-tts` 是作者自己的工具，换成 agent-io 的生成语音；作者那次选的音色不收
    - **新加的坑**：实测时撞到的四条（不写场景 JSON 片尾印作者署名、人物默认路线没有对齐停留、渲染速度和文件大小、Chromium 从哪找）；读脚本发现的两条（`--art` 必须给、`--out-dir` 必须在 starter 里）
    - **作者原片**：抖音原片是 1080×1920、24 Mbps 的 H.264，125 MB；转成 720×1280、crf 28，16 MB，画面和声音没动
    - **实测**：新增一节，2026-10-17 用 Gallery 里两张 AI 人像跑了两版，配方、耗时、花费都在那一节；原图、底稿、成片和封面是 `assets/` 下其余的 `parallax-ink-*` 文件

[^pi-repo]: [makerjackie/parallax-ink-video-skill](https://github.com/makerjackie/parallax-ink-video-skill)，钉 commit 的永链 [tree @ 6077224](https://github.com/makerjackie/parallax-ink-video-skill/tree/6077224d6f8b55317374826f063fb04ba161e77a)，2026-10-17 读。
[^pi-video]: [Skill：任意图片转 3D 手绘动画](https://www.douyin.com/video/7689879315177147699)，抖音作品 ID 7689879315177147699，2026-09-27 发布，经 TikHub 中转读取，2026-10-17。
