<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/bgm.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 背景音乐（BGM）

每个 composition 一条音乐垫底，由共享的音频引擎（`scripts/audio.mjs` → `scripts/lib/bgm.mjs`）产出。有两条路径，由引擎唯一的开关来选择——是否存在 HeyGen 凭据：

- **HeyGen 检索——有凭据时的默认路径。** 按情绪搜索 HeyGen 的音乐 catalog，下载排名第一的曲目。不做生成；使用与 TTS 相同的 `~/.heygen` / `$HEYGEN_API_KEY` 凭据。
- **本地生成（Lyria → MusicGen）——没有凭据时的兜底路径**（或被明确要求时）。根据一段情绪 prompt 生成一个 WAV。**没有 `npx hyperframes bgm` 命令**；引擎会直接拉起 `scripts/lyria-recipe.py` 或一段内联的 MusicGen 脚本。

> **先跑 Preflight——没有凭据不代表可以悄悄地在本地生成。** 生成之前，先完成登录 **Preflight**（见 `../../SKILL.md` → Preflight）：运行 `npx hyperframes auth status`，推荐用户登录，然后**停下来等用户选择**（登录以使用 HeyGen 的音乐库，或者离线继续、使用本地生成）。这一点对一次性的"生成一段 BGM"请求同样适用，和在完整工作流里一样。

## 由请求驱动

`audio_request.json` → `bgm: { mode?, query?, prompt? }`：

- **`mode`** —— `retrieve | generate | none`。省略即为 **auto**（有凭据时检索，否则生成）。**显式**指定的 `retrieve` 是严格的：没有凭据 ⇒ 跳过，绝不转为脱离进程的生成（这样一个没有 `wait-bgm` 步骤的调用方，比如 product-launch，就不会拿到一个它不会去等待的挂起任务）。
- **`query`** —— 情绪描述，用于检索，也作为兜底的 prompt 种子（例如分镜的 `music:` 字段，依次回退到 `message` → `arc` → `"calm cinematic underscore"`）。
- **`prompt`** —— 用于生成的显式完整 prompt；省略时由引擎推断一个（见"情绪推断"）。可选的 `blob` / `archetype` / `arc` 会参与这个推断。

两条路径都会保留输出名下你已有的文件：引擎会写到下一个空闲的名称（`track-2.mp3`），将其作为异常报告出来，`bgm.path` 中记录的是真实路径。

## HeyGen 检索（默认）

`searchSounds(query, "music", { limit: 5 })` → `GET /audio/sounds?query=<mood>&type=music&limit=5`。取排名第一的结果（按 `score` 排序），下载它的预签名 `audio_url` → `assets/bgm/track.mp3`。同步执行。没有匹配 → 跳过（BGM 是可选的；绝不因为它让渲染失败）。写入 `audio_meta.json` 的 cue：

```jsonc
{
  "path": "assets/bgm/track.mp3",
  "volume": 0.12,
  "mode": "retrieve",
  "query": "calm cinematic underscore",
  "duration_s": 42.0,
}
```

`volume` 来自引擎的 `bgmDefaultVolume()`：有旁白时用 `BGM_BED_VOLUME`（目前为 `0.12` ≈ -18 dB——垫在人声下面的音量），无声片（没有人声）用 `BGM_SILENT_VOLUME`（目前为 `0.9`）。要调整就改 `scripts/lib/bgm.mjs` 里的这些常量，而不是改调用处。`audio_meta.json` 里显式写的 `volume` 总是会覆盖这个默认值。`bgm_pending` 为 `false`——引擎返回时文件已经在磁盘上了。

对于短的发布视频，不要默认检索到的文件开头就是最佳剪辑点。把开头和后面每五秒一段的内容比较一下。如果曲目以一段安静的铺垫开始，而后面某一段有更强、更干净的音乐进入点，就从那一段开始裁剪，并加一个短的淡入和较长的淡出。每当 composition 时长变化时都要重复这项检查；最终的音乐文件必须覆盖整个剪辑，结尾不能有静音。

## 本地生成（兜底）——Lyria → MusicGen

以**脱离进程**的方式拉起，这样人声的工作不会被阻塞；在它完成之前，会设置 `audio_meta.bgm_pending: true` 以及 `bgm_pid` / `bgm_log`。**组装之前先运行 `scripts/wait-bgm.mjs`**——它会轮询输出文件 / 进程 / 日志，检测崩溃，并写出 `bgm_status.json`（`status: ready | failed | timeout | disabled`）。失败或缺失的曲目会被直接略去；它绝不会阻塞人声 / 音效。

| 顺序 | 服务商 | 环境变量 / 依赖 | 速度 | 质量 |
| ----- | ------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------- |
| 1     | Google Lyria RealTime                | `$GEMINI_API_KEY` 或 `$GOOGLE_API_KEY` + `google-genai`（按需自动安装） | 实时流式（≈ 请求的时长） | 生产级 |
| 2     | MusicGen (`facebook/musicgen-small`) | Python `transformers + torch + soundfile + numpy`（首次运行约 300 MB；自动安装） | CPU 上慢；Apple MPS / CUDA 上快 | 还不错；只能用 prompt 控制 |

输出 → `assets/bgm/track.wav`，目标时长 = 人声总时长。MusicGen 只生成**一段**种子片段（≤28–30 秒，低于解码器的位置上限），然后交叉淡化循环到目标时长（如果目标更短则裁短），从而避免分段之间的接缝。后端的选择取决于实际**能运行**的是什么：只有当 `import google.genai` 成功时才用 Lyria，否则用 MusicGen；如果两者都跑不起来，就跳过 BGM（人声 + 音效照常渲染）。

## 情绪推断（生成用的 prompt）

`scripts/lib/bgm.mjs` 里的 `inferBgmPrompt()`：显式的 `prompt` 优先；否则依次为：行业关键词定 **base** → 叙事 **archetype** 定形态 → 情绪 **arc** 作为决胜项。

| 在 `blob` / `query` 中匹配到 | 基础 prompt | BPM |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | --- |
| `crypto / nft / web3 / defi / token / blockchain`      | atmospheric electronic, deep bass, futuristic synths, restrained percussion | 100 |
| `finance / fintech / bank / payment / invest / wealth` | calm cinematic, soft strings, subtle piano, restrained percussion           | 92  |
| `creative / agency / design / studio / art / brand`    | playful electronic, warm pads, light percussion                             | 115 |
| *（默认：SaaS / 科技 / 平台）* | uplifting corporate tech, bright modern piano with synth pads               | 108 |

然后由 archetype 重塑叙事弧——PAS → "MINOR to MAJOR" 式的铺陈；BAB / future-pacing → 充满憧憬的上扬；feature-cascade → +10 BPM 的推进感；demo-loop → −8 BPM 的极简。剩下的平局由情绪 arc 来打破（紧张→释然、兴奋、信任 / 安心）。

## Lyria 调节参数（直接使用配方时）

引擎把 BPM / 调式写进 **prompt 文本**（通过上面的推断），只向配方传 `--output` / `--duration` / `--prompt`。如果你直接调用 `scripts/lyria-recipe.py`，还可以设置：`--bpm`（90–110 舒缓，110–130 有活力）、`--brightness`（0–1，≥0.7 适合宣传）、`--density`（0–1，越高越饱满）、`--scale`（`MAJOR` / `MINOR` / `PENTATONIC` / …）、`--negative-prompt`（要排除的风格）。MusicGen 会忽略所有这些参数——把情绪写进 prompt 里。

## 失败模式

| 失败情形 | 行为 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 没有匹配的音乐（检索） | `bgm: null`，记录异常。渲染继续，不带 BGM。 |
| 显式 `retrieve`，但没有凭据 | 跳过（不会悄悄回退到生成）。用 `mode: generate`，或省略 `mode` 走 auto。 |
| Lyria 和 MusicGen 都跑不起来（生成） | `bgm` 被禁用，并给出 `pip install …` 提示。人声 + 音效照常渲染。 |
| 组装时生成仍在进行 | `bgm_pending: true`；`wait-bgm.mjs` 会先等待 / 检查，并写出 `bgm_status.json`。 |
| 生成崩溃 | `wait-bgm.mjs` → `bgm_status.json { status: "failed" }`；`<audio>` 轨被略去。 |

BGM 失败绝不会阻塞渲染。
