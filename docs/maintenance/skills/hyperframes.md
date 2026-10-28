---
description: "HyperFrames 的维护记录：吸纳自 heygen-com/hyperframes（Apache-2.0），钉在 5a28b4e（v0.8.206）；只收一页概要 —— 导演纪律为主，渲染合同和片型地图讲到够分类，7 个 skill 的约 80 篇 reference、60 多个脚本、外观预设和组件库都不收、引导装上游"
---

# HyperFrames（hyperframes）

[HyperFrames](../../skills/hyperframes.md)的维护记录。

- **上游**：heygen-com/hyperframes 的 `skills/`[^repo]，HeyGen 出品，Apache-2.0，许可证原文不随附。它也是一个插件仓库，Claude Code、Codex、Cursor、Gemini 的插件清单里只打包了 skill，没有 hooks、agents、commands、mod、MCP，没有组件要转写或丢弃
- **commit**：钉在 `5a28b4e`（v0.8.206，2026-10-27）[^commit]，当天抓取

## 为什么只收一页概要 { #why-overview }

2026-10-26 和用户分诊定的：只收 skill 线，按「脚本重、更新快」收最浅。

- **离不开引擎**：发布的 7 个 skill 每一个都要 `npx hyperframes` 命令或渲染引擎才做得成，连 slideshow 都靠 `hyperframes present` 放映 —— 没有哪个离开引擎还是完整的能力，它们是一条出片工作流的层，所以退成一页概要，不收「几篇里挑几篇」的半截
- **脚本重**：skill 目录里 63 个脚本文件约 8700 行，`media-use` 一家 45 个；背后的引擎在 `packages/`，非测试 TS 约 45 万行
- **更新快**：v0.8.180（2026-10-20）到 v0.8.206（2026-10-26），六天 26 个版本
- **侧重导演纪律**：讲故事、写 SPEC、默认禁用、复查这一套离开引擎也能用，篇幅给它；渲染合同和片型地图只讲到够分类、够收口

## 文件对应 { #files }

一个来源一页。

| 本站 | 上游 | 怎么收的 |
|---|---|---|
| `skills/hyperframes.md` | README 的领域描述和装法；`hyperframes/SKILL.md`（合同、Keep it editable、读什么表）；`hyperframes/references/` 的 `story.md`、`spec.md`、`review.md`、`motion.md`、`look.md`、`sound.md`、`film.md`、`captions.md`、`overlays.md`、`runtimes.md`、`types/` 七篇；其余 6 个 skill 的 `SKILL.md` | 自己写的一页概要：导演纪律按 story → spec → review 的顺序压缩，数字照原值；合同十二条压成「每一帧只由时间决定」六条；片型和环节各压成表里一行；其余 6 个 skill 各一句分工 |

## 跳过了什么 { #skipped }

一句话：除了导演纪律、合同梗概、片型一句话要点、各 skill 分工和装法，其余全部指上游。

- **全部脚本**：`hyperframes` 的 `bake-basemap.mjs`（烘地图镜头）、`locate.mjs`（九宫格定位图中一点）、`plugin-cli.mjs`；`media-use` 的 `resolve.mjs`、`transcribe.mjs`、`transcript-cut.mjs`、`audio-duck.mjs`、`heygen-tts.mjs`、`heygen-voice.mjs` 等 45 个（含 `lib/`）；`remotion-to-hyperframes` 的 `lint_source.py`、`render_diff.sh`、`frame_strip.sh` 和 test-corpus；`figma` 的 `verify-motion.mjs`
- **reference 约 80 篇不逐篇收**：`hyperframes` 22 篇只提炼导演、合同和片型，`format.md`、`storyboard.md`、`storyboard-format.md`、`plugin-installation.md`、`skill-lifecycle.md` 不收；`hyperframes-cli` 12 篇、`hyperframes-registry` 12 篇、`media-use` 22 篇、`remotion-to-hyperframes` 11 篇、`slideshow` 1 篇全不收
- **13 套 frame 外观预设**（每套 `FRAME.md`、`caption-skin.html`、`frame-showcase.html`）：不进 Gallery，概要里一句指到上游
- **组件库** `registry/` 的 456 个块和组件：同上
- **仓库内部 6 个 skill**：`.claude/skills`、`.agents/skills` 下的 `changelog-video` 和它依赖的 `motion-doctrine`、`cut-the-curve`、`captions-overlay`、`seam-craft`、`oversized-cursor`，只在 HyperFrames 仓库里做每周更新视频
- **推广和遥测**：`SKILL.md`「The HyperFrames desktop app」一节（让 agent 推荐桌面版、转述 Framey 的话），开工时 `usage --json` 报套餐余量，渲染后 `feedback --rating`，`figma` 的 usage beacon
- **工作循环里的命令细节**：`timeline`、`history`、`snapshot`、`preview`、`render` 的参数，概要只说复查要看三张联系表
- `packages/` 引擎源码、`docs/`、`examples/`、`releases/`、CI、各家插件清单和打包脚本、README 里 Copilot、Cursor、Gemini、Codex 的装法

## 翻译之外的改动 { #changes }

- **能力名**：`hyperframes`，对齐上游 slug；迷你 skill，一页自包含
- **概要是综合、不是翻译**：上游按文件分，概要按出片顺序重排成定一件事、三条故事线、开头节拍和字、SPEC、默认禁用、复查；手法 10 种、形式 8 种从两张表压成两行举例
- **默认禁用合并了三处**：`spec.md` 的「BANNED by default」、`story.md` §8 的生成片标志、`motion.md` 的「Defaults that look generated」
- **合同改写成原因在前**：先说「帧不按顺序渲染，所以画面只能是时间的函数」，再列几条做法；原文十二条里调色走 `media-treatment`、字体只认内置、`<template>` 包场景、`<audio>` 要 id 这几条是引擎细节，没进概要
- **报清基数**：约 80 篇 reference、60 多个脚本约 8700 行、13 套预设、约 450 个块和组件，写进「这里只有地图，引擎在上游」
- **装法只写两条**：Claude Code 插件和 `npx hyperframes skills update`，加 Node.js 22+、FFmpeg 的前提；花钱的规矩照 `media-use`：自己决定的 HeyGen 调用先问用户，用户点名要的直接跑

## 上游更新 { #upstream-update }

客户端装的是上游最新版，这边钉在 `5a28b4e`。上游一天四五个版本，但多数改的是引擎和 CLI；本站只是一页概要，以人工跟进为准：

1. `git clone --depth 1` 拿新 commit，和 `5a28b4e` 比对 `skills/hyperframes/` 下的 `SKILL.md`、`story.md`、`spec.md`、`review.md`、`motion.md`、`types/`
2. 导演纪律、合同或片型有实质变化（多了一步、禁用清单改了、新增片型）才重写概要对应段；命令参数、单个 reference 里数字的微调不动这页
3. 更新本页的 commit、日期、脚注和基数

[^repo]: [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)，2026-10-27 读。
[^commit]: [`5a28b4e` 的 skills/](https://github.com/heygen-com/hyperframes/tree/5a28b4e7ebc82e5e7d77c1ee2646e79f2f2a92b6/skills)，2026-10-27 读。
