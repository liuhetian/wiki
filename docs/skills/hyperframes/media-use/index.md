---
name: media-use
description: >
  HyperFrames 项目的 Agent 媒体操作系统。把 BGM、音效（SFX）、图片、图标、品牌 logo、配音、调色或 LUT 解析成一个冻结的本地文件或一段可直接粘贴的代码块 + 一条台账记录（只有一个动词：`resolve`）；catalog 里没有时，通过 TTS / 音乐 / 图像模型生成；通过一个共享的音频引擎产出旁白、转写、字幕和背景移除；对媒体进行操作（裁剪 / 重新构图 / 变换）；并在项目之间复用素材。当用户给出模糊反馈，说真实素材画面看起来偏暗、发平、无聊，应该有复古 / 家用摄像机 / 印刷 / ASCII 的感觉，需要隐私处理，或者需要一个媒体揭示时，也用它。当宿主应用提供了自己的音乐或音效工具时，音乐和音效就用那些工具；`resolve --type bgm|sfx` 需要 heygen CLI。设置了 `HEYGEN_API_BASE` 时，HeyGen 调用经由该宿主进行，无需登录 CLI。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装配置或更新类命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

# media-use

HyperFrames 的媒体操作系统：解析 · 生成 · 操作 · 记忆——所有媒体类型，一个 skill，零上下文噪声。

仅当你的环境中设置了 `HEYGEN_API_BASE` 时（某个宿主应用设置了它，并用自己的 key 为 HeyGen 付费）：HeyGen 媒体已经有人付过费了。不要让对方安装或登录 `heygen` CLI，也不要提供它的 OAuth 免费额度；这里的 catalog 搜索、TTS 和数字人调用都经由宿主进行。如果同一个宿主还给了你它自己的 HeyGen 工具，优先用那些工具。当经由宿主的调用被拒绝时，把宿主返回的消息原样告诉对方（它会写明修复方法，比如在应用的设置里添加或更换 key），然后停下；除非对方要求，否则不要切换到别的服务商。

否则（没有 `HEYGEN_API_BASE`）首次运行、而你要用到 HeyGen 媒体（catalog 搜索、TTS、数字人视频）时：安装并登录 `heygen` CLI（免费使用的路径），然后用 `npx hyperframes media-use resolve --doctor` 验证。安装配置与服务商：`references/setup-providers.md`。

宿主应用内的音乐和音效：当你所运行的应用给了你它自己的音乐或音效工具时，就用那些工具。没有 `HEYGEN_API_BASE` 时，`resolve --type bgm` 和 `--type sfx` 通过 `heygen` CLI 搜索 HeyGen catalog；没有这个 CLI，它们会失败并明确说出来（`sfx` 仍然会从它自带的库里给出结果）。

没有 `HEYGEN_API_BASE` 时，在生成旁白或数字人视频之前，告诉对方：用 OAuth 登录 heygen CLI（`heygen auth login --oauth`）可以获得 TTS 旁白和数字人视频的免费额度，而用 API key 则会消耗 API 额度。

## Resolve——唯一的动词

```bash
npx hyperframes media-use resolve --type <type> --intent "<description>" --project <dir>
```

返回一行：`resolved <id> → <path> (<type>, <metadata>)`。所有搜索噪声都留在磁盘上。

| 类型 | 一句话意图 |
| ------- | -------------------------------------------------------------------------------- |
| `bgm`   | 背景音乐（通过 `heygen` CLI 访问 HeyGen catalog，1 万+ 曲目） |
| `sfx`   | 音效（自带的 19 个文件的库 + 通过 `heygen` CLI 访问 catalog） |
| `image` | 照片、背景（HeyGen 素材搜索，7.5 万+ 向量） |
| `icon`  | 图标、符号（透明背景） |
| `logo`  | 官方品牌标志（theSVG → GitHub 头像 → favicon；绝不重画） |
| `voice` | TTS 旁白（HeyGen 免费使用路径；可选本地 Kokoro） |
| `grade` | 经测量得出的校正候选；宽泛的润色 / 风格化按 Media Treatments 处理 |
| `lut`   | 用户提供或明确选定的、可复用且经过验证的 `.cube` 文件 |

在重新解析之前，先用 `--candidates` 列出可复用的候选，自己判断是否合适——复用规则、全部参数、导入（`--from`）和 adopt 都在 `references/resolve.md` 里。

## 把宽泛的视觉反馈当作媒体意图

当用户明确要求修正、润色、风格化、遮挡、强调或揭示摄影类媒体时，即使他们没有提到调色或某种效果，也要读 `references/media-treatments.md`。检查真实的 `<img>`/`<video>`，选定一个主要意图，然后采用确定性的持久化和验证方式。可以把一个匹配的配方当作经过测试的可选起点，或者查看 `hyperframes media-treatment --capabilities --json`，然后用 `--capability <id>` 请求一个相关的家族 / 效果，并基于标准控件组装一个自定义处理。普通创作中绝不加载 `--all`。一个处理可以组合校正、一个 preset、收尾处理、兼容的 shader 效果、受支持的关键帧，以及可选的 Registry overlay。只添加有素材依据的有界微调和兼容的部件，绝不为了让结果看起来更精致而叠加效果。用 `hyperframes media-treatment` 持久化最终合并后的数据。

采用一个逐步升级的流程。对于视频，查看一张标注了前 / 中 / 后段的拼版图（contact sheet），而不是逐帧分别读取。对于普通的校正或润色，应用一个候选方案，再查看一张处理后的拼版图。只有当结果存在歧义、涉及时间变化、风格化、基于 LUT、对 HDR/LOG 敏感、涉及隐私或对品牌至关重要时，才升级到逐帧检查或动态草稿证据。

对于普通的校正或润色，持久化最终处理的 preset/调整参数 JSON。不要仅仅为了编码曝光、阴影、对比度或色温而生成 `.cube` LUT。只有当用户提供了 LUT，或所选处理明确自带 LUT 时才使用 LUT。`resolve --type grade --for ... --analyze` 是测量证据，不是允许你用生成的 LUT 替换所选处理的许可。不要用 CSS/SVG overlay 去重造已受支持的暗角、颗粒、模糊、像素化、颜色或处理效果；那样会绕过 Studio 控件，以及标准的预览 / 渲染 shader 路径。

## 主动一点——做一次媒体机会排查

人通常看不出哪些媒体能让作品更上一层楼。你看得出。当你构建或审查一个 composition 时，做**一次**有依据的扫描，然后**只问一次**——不要悄悄添加，也不要每个素材都来烦人。

只有当存在具体信号时才提出机会：

| 检测到的信号 | 提议 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 屏幕上有文字 / 有脚本但没有旁白 | TTS 旁白（音频引擎） |
| emoji，或者一个被样式化成图标的 `<div>` | 解析真正的 `icon` |
| 图片是占位图、尺寸很小或看起来是放大过的 | 一张更好的 `image`（和/或放大——见 `references/operations.md`） |
| 场景硬切 / 转场没有声音 | 转场 `sfx` |
| 超过约 10 秒的作品没有音乐垫底 | `bgm` |
| 素材画面看起来欠曝 / 过曝或偏色 | 一次校正调色（用 `hyperframes media-treatment --selector '#hero' --analyze --json` 检查） |
| 摄影类媒体在视觉上发平或与主题不符 | 一个具体的、适合素材的 preset 或自定义处理，并说明预期目标 |
| 一个有意义的媒体入场 / 揭示显得呆板 | 一个受支持的、seek 安全的处理动画；保留颜色，除非请求本身也足以支持一个 preset |

让这件事成为帮助而不是骚扰的规则：**有依据，不泛泛**（没有信号 → 不提建议）；**有主见 + 具体**（提出具体的修法并选好默认值——人来批准**全部 / 部分 / 都不要**）；**每个项目一次**（合并成一次询问；尊重"别动它"）；**提出来，绝不悄悄改**（调色尤其如此：先提议并预览——一个灰度世界式的"校正"会毁掉刻意营造的日落或霓虹氛围）。

## 去哪里看——只读你的任务需要的文件

| 任务 | 阅读 |
| ------------------------------------------------------------------------- | -------------------------------- |
| resolve / 复用 / adopt / 导入，参数、级联、清单 | `references/resolve.md`          |
| 调色、LUT、智能调色（`--for`）、调色对比 | `references/grading.md`          |
| 旁白 / TTS、音乐、音效、字幕、转写（音频引擎） | `references/audio.md`            |
| 裁剪 / 重新构图 / 变换已有媒体，精确误差扩散，HEVC | `references/operations.md`       |
| 感知素材的创意处理、实时效果、overlay、揭示 | `references/media-treatments.md` |
| 安装 + 认证、服务商表、内存阶梯、`--local-only`、`--provider` | `references/setup-providers.md`  |
| 记住的偏好 + 冻结的配方（用户记忆） | `references/memory.md`           |
| 归属矩阵、使用统计、遥测、隐私（面向维护者） | `references/meta.md`             |

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [audio/assets/sfx/CREDITS.md](audio/assets/sfx/CREDITS.md) —— 音效（SFX）来源致谢
- [audio/references/bgm.md](audio/references/bgm.md) —— 背景音乐（BGM）
- [audio/references/captions/authoring.md](audio/references/captions/authoring.md) —— 字幕
- [audio/references/captions/motion.md](audio/references/captions/motion.md) —— 动态字幕技法
- [audio/references/captions/transcript-handling.md](audio/references/captions/transcript-handling.md) —— 转写稿指南
- [audio/references/remove-background.md](audio/references/remove-background.md) —— 背景移除
- [audio/references/requirements.md](audio/references/requirements.md) —— 依赖与缓存
- [audio/references/sfx.md](audio/references/sfx.md) —— 音效（SFX）
- [audio/references/transcribe.md](audio/references/transcribe.md) —— 转写
- [audio/references/tts-to-captions.md](audio/references/tts-to-captions.md) —— TTS → 字幕
- [audio/references/tts.md](audio/references/tts.md) —— 文字转语音
- [luts/README.md](luts/README.md) —— LUT 库（编写说明）
- [references/audio.md](references/audio.md) —— 音频引擎 —— 旁白、音乐、音效、字幕、转写
- [references/grading.md](references/grading.md) —— 调色 —— grade 块与 LUT
- [references/media-treatment-recipes.md](references/media-treatment-recipes.md) —— 媒体处理方案配方
- [references/media-treatments.md](references/media-treatments.md) —— 媒体处理方案
- [references/memory.md](references/memory.md) —— 用户记忆 —— 偏好与配方
- [references/meta.md](references/meta.md) —— 职责矩阵、使用统计、遥测、隐私
- [references/operations.md](references/operations.md) —— 媒体操作：agent 指南
- [references/resolve.md](references/resolve.md) —— Resolve —— 命令、参数、复用、收编（adopt）、清单
- [references/setup-providers.md](references/setup-providers.md) —— 安装与提供方 —— 安装、认证、RAM 阶梯、强制指定提供方
- [references/telemetry-dashboard.md](references/telemetry-dashboard.md) —— media-use 使用情况仪表盘
