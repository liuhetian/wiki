<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/meta.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 职责矩阵、使用统计、遥测、隐私

面向维护者的参考。这里的内容都不会改变你解析或操作媒体的方式。

## 它负责什么（HyperFrames 留下的空白）

HyperFrames 负责媒体*播放*；其余一切都归 media-use 负责。每一行都由 `scripts/lib/coverage.test.mjs` 强制校验，这样这些说法就不会随时间失效。

| HyperFrames 的空白 | media-use 通过什么来负责 |
| --- | --- |
| 只有音频，没有图片/图标 | `resolve --type image\|icon`（heygen 素材搜索） |
| 没有第三方品牌 logo | `resolve --type logo`（theSVG → GitHub org 头像 → 域名 favicon） |
| 没有声音/音频生成 | `resolve --type voice`（HeyGen TTS 免费使用路径；可选本地 Kokoro）+ 音频引擎（`audio/scripts/audio.mjs`） |
| 音频引擎分散/重复 | `audio/` 下一个整合后的引擎（hyperframes-media 已退役） |
| 没有 agent 媒体操作（剪切/重新构图/变换） | `references/operations.md` + 用 `resolve --from` 登记输出 |
| 没有基于转写稿的剪辑 | `scripts/transcript-cut.mjs` 把逐词时间戳编辑编译成剪辑列表 |
| 没有自动闪避（auto-duck）/发布响度 | `scripts/audio-duck.mjs` + `references/operations.md` 里的 loudnorm/sidechain 配方 |
| 没有跨项目记忆 | 全局按内容寻址的缓存 + 自动晋升（`~/.media`） |
| grade 配方与 LUT 冻结 | `resolve --type grade` 输出一个可直接粘贴的配方，`resolve --type lut` 冻结经过校验的 `.cube` 文件；直接对元素做分析/编写则在 `hyperframes media-treatment` 里 |
| 没有图像生成 | 通过 `scripts/lib/mflux-provider.mjs` 按 RAM 分级使用本地 mflux（FLUX），以及 codex `image_gen` 升级推荐（`scripts/lib/codex-provider.mjs`） |
| 没有视频生成 | `resolve --type video` —— 优先用 HeyGen 数字人视频（免费使用路径，认证失败时提示登录），本地 LTX 兜底（`scripts/lib/local-models.mjs` 里的 `videogen`）；图生视频、照片数字人、配音/翻译仍是手动的 `heygen` CLI 配方（`references/operations.md`） |
| 本地模型默认值偏弱 | 通过 `heygen` CLI 走 HeyGen 免费使用路径；本地开源工具只作为需主动启用的备选（`scripts/lib/local-run.mjs`） |

## 使用统计

用 `resolve --stats` 生成一份本地的、可分享的报告，覆盖当前项目的 `.media/` manifest、全局 `~/.media/` 缓存和本地 resolve 未命中记录。面向人的输出很紧凑；加 `--json` 得到单个机器可读的对象，加 `--days N` 按时间窗口筛选带时间戳的记录。

```bash
npx hyperframes media-use resolve --stats --project . --days 7
# media-use stats
# total resolves: 12
# misses: 2
# hit rate: 86%
```

## 遥测

`resolve` 和编辑工具（transcribe / transcript-cut / audio-duck）会向 PostHog 发送一个匿名使用事件（`scripts/lib/telemetry.mjs`），让我们能看到哪些能力真正被用到。它只记录媒体 TYPE（类型）、解析 SOURCE（来源）和胜出的 PROVIDER（提供方）：绝不记录意图文本、文件名或路径，并且设置 `$ip:null`，不存储 IP。尽力而为且不阻塞（resolve 绝不会等待遥测，也不会因遥测而失败）。

用 `DO_NOT_TRACK=1` 或 `HYPERFRAMES_NO_TELEMETRY=1` 退出（在 CI 和开发环境中也是关闭的）。PostHog 公共项目 key 和退出方式都与 `hyperframes` CLI 相同。

HeyGen 请求标记：每个会产生生成的 `heygen` 调用（TTS、数字人视频、目录搜索）都带有列入允许名单的 `X-HeyGen-Client-Source: media-use` 请求头，其值来自一个共享常量（`scripts/lib/heygen-cli.mjs` 里的 `HEYGEN_CLIENT_SOURCE_ARGV`），这样将来新增的调用点不会悄悄地不带标记就发出去。只读的发现类调用（`voice list`、`avatar list`）有意不加标记。

## 隐私

media-use 使用与 `hyperframes` CLI/studio 相同的共享安装 id（`~/.hyperframes/config.json`）。当你登录了 HeyGen，使用记录会关联到你的账户邮箱，邮箱不可用时则关联用户名，与 CLI 的行为一致。事件保持粗粒度：只有媒体类型、来源、提供方和少量计数；意图文本和路径留在本地。用 `HYPERFRAMES_NO_TELEMETRY=1` 或 `DO_NOT_TRACK=1` 关闭遥测。
