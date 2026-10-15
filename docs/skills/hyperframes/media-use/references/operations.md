<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/operations.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 媒体操作：agent 指南

media-use 负责解析和记住素材。至于对素材进行**操作** —— 剪切、重新构图、拼接、变换 —— 它不会把每个动作都包装成定制命令，而是把你指向合适的本地工具（决策 OP1）。运行该工具，然后用 `resolve --from <output> --type <type>` 登记输出，让结果像其他任何素材一样进入台账（ledger）和全局缓存。

下面所有工具都是本地的、免费的。默认已有 ffmpeg（引擎本来就依赖它）。

## 剪切 / 修剪：保留一段

```bash
ffmpeg -i in.mp4 -ss 00:00:12 -to 00:00:20 -c copy out.mp4   # 0:12–0:20, no re-encode
```

在 composition 内修剪通常**不需要新文件**：clip 可以通过 `data-media-start` + `data-duration` 只播放一个子区间（见 hyperframes-core）。只有在 composition 之外导出/拼装时，才去剪切物理文件。

## 重新构图 / 裁剪：改变画幅比例

```bash
# 16:9 -> 9:16, crop centered
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" out.mp4
```

要做非破坏性裁剪，直接在 composition 里给元素设置 `clip-path`（渲染时生效，源文件不动），而不是用 ffmpeg 重新编码。

## 蒙太奇 / 拼接：把 clip 连起来

```bash
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```

## 静音剪除 / 高光：剪掉空白段，抓取最佳时刻

```bash
auto-editor in.mp4 --edit audio:threshold=4% -o tight.mp4   # pip install auto-editor
scenedetect -i in.mp4 detect-adaptive list-scenes           # pip install scenedetect
```

## 有质量选择的变换（process）

这些操作既有本地选项，也有更高质量的 HeyGen-CLI 选项。要免费/离线就跑本地的；看重质量时用 HeyGen CLI。给用户展示一个**并排对比**（本地 vs HeyGen），是让他们自己选择的诚实做法。

| 操作 | 本地（免费） | HeyGen CLI（质量） |
| --- | --- | --- |
| 背景移除 | `hyperframes remove-background in.png`（u2net） | `heygen background-removal` |
| 放大 | `realesrgan-ncnn-vulkan -i in.png -o out.png -s 4` | 无 |
| 口型同步（配音） | 无 | `heygen lipsync` |
| 翻译 | 无 | `heygen video-translate` |

任何操作之后：运行 `resolve --from out.ext --type <type>` 登记派生出的素材（它会记录来源出处，并自动晋升到全局缓存）。

> ponytail：media-use 在这里不重新包装 ffmpeg/heygen，这是有意为之（OP1）。它增加的价值在于通过 `--from` 为*输出*提供台账 + 全局复用。只有当 agent 反复搞砸这些配方时，才加一个薄薄的 `process` 动词。

## 精确的误差扩散抖动（dither）

当所要的风格明确指定 Floyd-Steinberg、Atkinson/Macintosh、Jarvis-Judice-Ninke、Stucki、Burkes 或某个 Sierra 变体时，使用本地处理器。这些是顺序误差扩散算法，不是实时的 Bayer `effects.dither` shader。

```bash
node <SKILL_DIR>/scripts/dither.mjs \
  --input source.mp4 \
  --out source.atkinson.mp4 \
  --algorithm atkinson \
  --palette '#0f380f,#306230,#8bac0f,#9bbc0f' \
  --point-size 3

npx hyperframes media-use resolve \
  --from source.atkinson.mp4 --type video --project .
```

可用算法：`floyd-steinberg`、`atkinson`、`jarvis-judice-ninke`、`stucki`、`burkes`、`sierra`、`sierra-lite` 和 `two-row-sierra`。默认是均衡的 Floyd-Steinberg，配黑/白色板。色板包含 2-6 个 `#rrggbb` 颜色，按编写的从暗到亮顺序排列；反转顺序就是有意反转映射。`--point-size` 控制 1-20px 的块；`--brightness` 和 `--contrast` 接受 0.5-2；`--detail` 接受 0.1-1。

处理器支持普通的 SDR 图片和 MP4 视频，保留视频里的音频，输出 BT.709 MP4。它会拒绝带 PQ/HLG 标记的输入，而不是默默地做色调映射。要动画这个变换，就把原始文件和处理后的文件作为两个真实媒体层，用 seek 安全的 GSAP timeline 在两者之间做揭示或交叉淡化。当抖动量本身必须连续动画时，改用实时 Bayer shader。

## 转写（默认：Parakeet，优于 whisper.cpp）

`transcribe.mjs` 是默认的本地转写路径。它**通过 parakeet-mlx 运行 NVIDIA Parakeet-TDT**，在 Open ASR Leaderboard 上胜过 whisper.cpp（平均 WER 约 6.05% 对 7.44%；在嘈杂（NOISY）音频上 4.73% 对 5.96%，而 whisper-large-v3 在会议录音上幻觉到了 308% 的 WER），并且快 5-10 倍。它输出带逐词时间戳的 `{ text, words:[{text,start,end}] }`（由 Parakeet 的子词 token 合并而来），可直接喂给 transcript-cut、字幕和音频引擎。

```bash
# install once: uv venv ~/.venvs/parakeet && VIRTUAL_ENV=~/.venvs/parakeet uv pip install parakeet-mlx
node <SKILL_DIR>/scripts/transcribe.mjs --input talk.mp4 --out talk.transcribe.json

# the hyperframes CLI runs Parakeet on macOS, Linux and Windows once it is installed:
npx hyperframes models install parakeet                 # once, ~640 MB, ask the user first
npx hyperframes transcribe talk.mp4 --engine parakeet   # or --engine auto (default)
```

在 24GB 上已验证（VERIFIED）：准确，8 秒音频约 3 秒（已缓存时）。Parakeet 覆盖 25 种欧洲语言，包括英语。对于其他语言，或未安装 parakeet-mlx 时，transcribe.mjs 会回退到 `hyperframes transcribe`，后者在运行过 `models install parakeet` 时使用 CLI 自带的 Parakeet，否则使用 whisper.cpp（99 种语言）。`--engine parakeet|whisper` 可强制指定其一。（Cohere Transcribe 在纸面上位居排行榜榜首，但测试中它的 mlx-audio 量化版本输出的是乱码，并且在 Mac 上慢 40-70 倍，所以没有接入。）

## 基于文本的剪辑（transcript cut）

`transcript-cut.mjs` 是一个编译器，而不是包装器：它把逐词时间戳和 agent 的剪辑决定变成精确的保留片段。尽管本文件其余部分都只是指导，这个工具还是随附提供了。

```bash
node <SKILL_DIR>/scripts/transcript-cut.mjs \
  --input talk.mp4 \
  --transcript talk.transcribe.json \
  --remove "12.41-15.02,88.3-91.7" \
  --remove-fillers "um,uh,like" \
  --cut-silence 0.8 \
  --out talk.cut.mp4

resolve --from talk.cut.mp4 --type video
```

想在编码前检查保留片段的 JSON 时，先用 `--plan`。

## 闪避（ducking）（在 composition 内声明 / 导出时烘焙）

B1，在 composition 里声明闪避。`audio-duck.mjs` 会以 `data-automation` 属性的形式输出一条音量 lane（自动化曲线）。把它加到背景 `<audio>` 元素上；源文件保持不动。lane 的时间是相对 clip 的，所以要传 `--composition`，让脚本减去元素的 `data-start`。

```bash
node <SKILL_DIR>/scripts/audio-duck.mjs \
  --meta audio_meta.json \
  --target "#bgm" \
  --composition index.html
```

```html
<!-- auto-duck: #bgm under narration; add to its <audio> element -->
data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0.6},{"t":3.42,"v":0.6},{"t":3.57,"v":0.15},{"t":9.87,"v":0.15},{"t":10.27,"v":0.6}]}]}'
```

B2，只对导出的或独立的文件烘焙闪避。

```bash
ffmpeg -i bgm.mp3 -i voice.wav \
  -filter_complex "[0][1]sidechaincompress=threshold=0.03:ratio=8:attack=200:release=400[ducked]" \
  -map "[ducked]" bgm.ducked.wav
```

在 composition 内用声明的方式。只对要离开 hyperframes 流水线的素材进行烘焙。

## 发布响度

两遍式 `loudnorm` 先测量，再把测得的值连同目标 LUFS 一起烘焙应用。

社交平台目标，-14 LUFS：

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.social.wav
```

播客目标，-16 LUFS：

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.podcast.wav
```

## 生成：图片（本地优先，云端升级推荐）

`resolve --type image` 先从 HeyGen 目录检索；未命中时就转为生成。有两条路径，自动挑选最适合这台机器的那条：

1. **本地（默认、免费、私密）：mflux**（基于 MLX 的 FLUX）。`resolve` 会检查可用（AVAILABLE）RAM 规格，并通过 `scripts/lib/local-models.mjs`（`imagegen` 阶梯）+ `mflux-provider.mjs` 运行装得下的最佳 FLUX 级模型。RAM 阶梯（agent 通过 `describeModelLadder("imagegen", specs)` 看到它）：

   | 档位 | 模型 | 需要（可用 RAM） | 备注 |
   | --- | --- | --- | --- |
   | medium | FLUX.1 schnell int4 | ~8GB（`--low-ram`） | 24GB 上约 20 秒/512px。已验证（VERIFIED）。快。 |
   | large | FLUX.2 Klein 4B int4 | ~32GB | 质量更高，完整驻留内存 |
   | xlarge | Qwen-Image | ~64GB | 顶级质量，仅限 64GB+ 的 Mac |

   这张表里已经考虑进去的坑：官方 FLUX 仓库在 HF 上是受限访问的（gated），所以它指向不受限的社区 4-bit 重新上传版本；并且在 medium 档位 `--low-ram` 是必须加的（不加时，一次 768x512 的运行在 24GB 上因频繁换页拖到了 90 分钟；加上它只要 20 秒）。

2. **云端升级推荐（质量更好）：`codex` CLI** 的 `image_gen` 工具，走用户的 ChatGPT 订阅（认证由 codex 负责，这里不需要 key，也不按次收费）。当没有本地模型装得下时，它是自动兜底；在任何机器上，它也是"做得更好"的显式选择。只想用 codex 的用户可以直接要求用它。已验证：prompt -> 栅格图 -> 冻结 + 记入台账。

`--local-only` 保留 mflux（缓存后可用）并跳过 codex（需联网）。

## 生成：视频（`resolve --type video`，HeyGen 数字人优先）

`resolve --type video "<intent>"` 是默认路径。它首先生成一个由脚本驱动的 HeyGen 数字人视频（免费使用额度 —— OAuth 会话在符合条件时使用网页套餐的免费数字人视频配额，API key 按常规 API 计费），只有当 HeyGen 不可用、没有凭据或传了 `--local-only` 时，才回退到本地生成式 LTX。这两者的输出不可互相替代（真实的主持人 vs 通用的生成式片段），所以要把这个回退理解为"HeyGen 连不上"，而不是"提升质量"：

- **HeyGen 数字人视频（默认，对新 API 用户免费）：** `heygenVideoGenerate`（`scripts/lib/heygen-video-provider.mjs`）调用 `heygen` CLI —— 绝不直接调原始 API —— 自动挑选一个公共数字人和一个 starfish 声音（可用 `--avatar-id`/`--voice-id` 覆盖，以 `ctx.avatarId`/`ctx.voiceId` 传递下去）。如果 CLI 报告 `not_authenticated`，provider 会向 stderr 打印一条引导建议（数字人视频对新 API 用户免费 —— 请登录），并转而走 LTX，而不是直接失败。
- **本地兜底：MLX 上的 LTX 2.3**，通过 `dgrauet/ltx-2-mlx`，即 `local-models.mjs` 里的 `videogen` 阶梯（`ltx-video-provider.mjs`）。生成式片段（t2v），按 RAM 规格把关。在 24GB 上已验证：512x320 x 33 帧，带音频。

media-use 发出的每个会产生生成的 `heygen` 调用 —— TTS、数字人视频和目录搜索 —— 都会通过共享的 `HEYGEN_CLIENT_SOURCE_ARGV` 常量（`scripts/lib/heygen-cli.mjs`）发送列入允许名单的 `X-HeyGen-Client-Source: media-use` 请求头（持久参数，对每个子命令都有效），这样用量会在计费/资源元数据里被正确标记，并出现在 API 仪表盘上。只读的发现类调用（`avatar list`、`voice list`）不需要它。

对于 `resolve --type video` 还没暴露的结构化请求体（超出 ctx 覆盖范围的特定 `avatar_id`/`voice_id` 组合，或用预录的 `audio_url` 代替脚本），下面这个原始的 `heygen video create` 配方仍是逃生口：

```bash
# discover an avatar + a starfish voice, then create + wait
heygen avatar list --ownership public --limit 5
heygen voice list --engine starfish --limit 5
heygen video create --headers "X-HeyGen-Client-Source: media-use" --wait -d '{
  "type": "avatar",
  "avatar_id": "<avatar-id>",
  "script": "Your narration here.",
  "voice_id": "<voice-id>"
}'
```

数字人视频是确定性的 + 由脚本驱动的（根据脚本或预录的 `audio_url` 做口型同步），与生成式的 LTX 片段不同。手动配方渲染完成后，运行 `resolve --from <downloaded.mp4> --type video` 把它记入台账（直接通过 `resolve --type video` 生成时不需要 —— 那条路径已经把结果记入台账了）。

### 图生视频（把任意静态图做成说话的片段）

没有接入 `resolve --type video`（延后处理 —— `avatar` 类型覆盖了默认的脚本驱动场景）。`heygen video create` 接收原始的 `POST /v3/videos` 请求体，所以把 `type` 从 `avatar` 换成 `image`，就能把**任意一张人物图片**做成口型同步的说话视频，无需先创建数字人/照片数字人。把 `image` 指向一个公共 URL 或一个已上传的 `asset_id`，并用 `script`+`voice_id` 或预录的 `audio_url` 驱动语音：

```bash
heygen video create --headers "X-HeyGen-Client-Source: media-use" --wait -d '{
  "type": "image",
  "image": { "type": "url", "url": "https://example.com/person.jpg" },
  "script": "Your narration here.",
  "voice_id": "<voice-id>"
}'
```

常用的可选字段：`title`、`resolution`（`4k`/`1080p`/`720p`）、`aspect_ratio`、`remove_background`、`background`、`voice_settings`、`motion_prompt` + `expressiveness`（照片数字人动画），以及用于 webhook 的 `callback_url`/`callback_id`。不要凭记忆把这些写死：CLI 会通过 `heygen video create --request-schema` 自描述完整的、当前的请求体（一个以 `type` 为判别键的联合类型），所以要读 schema，而不是相信一份过时的字段列表。对于要在很多脚本里复用的静态图，改为一次性创建一个可复用的 **Photo Avatar**（`heygen avatar create`）。用 `resolve --from <downloaded.mp4> --type video` 把结果记入台账。文档：<https://developers.heygen.com/image-to-video>。

## HEVC / H.265 源素材

HEVC/H.265 源素材无论是**渲染**（FFmpeg 会预先解码所有输入视频）还是**预览**（auto-proxy 会在首次使用时转码并缓存一份 H.264 副本，可用 `--no-proxy` 或在 hyperframes.json 里设 `media.autoProxy: false` 关闭）都不需要转换。通过 `ffmpeg -i in.mp4 -c:v libx264 -crf 18 proxy.mp4` 手动生成 H.264 代理、再用 `resolve --from` 登记，这种方式在边缘情况下（例如关闭了 auto-proxy，或预览时 ffmpeg 不可用）仍然可用。
