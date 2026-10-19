<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/setup-providers.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 安装与提供方 —— 安装、认证、RAM 阶梯、强制指定提供方

## 安装 —— 先装 heygen（免费使用路径）

按照 HeyGen CLI 经过验证的发布安装说明[^cli]安装它，然后运行：

```bash
heygen update             # free usage needs the OAuth-capable CLI (v0.3.0+)
heygen auth login --oauth # OAuth = free subscription credits; --api-key bills API credits
```

这会解锁 bgm/sfx/image/icon 目录搜索、TTS（声音）和数字人视频的免费（FREE）路径。用 `--oauth` 登录 —— 免费额度依附在 OAuth 会话上（API key 则会改扣 API 额度）。**media-use 统一要求 heygen >= v0.3.0**（OAuth 免费使用路径需要它），所以即便只用 API key，`--doctor` 也会提示旧版 CLI 去更新。解析任何东西之前，先用下面的命令验证安装：

```bash
npx hyperframes media-use resolve --doctor
```

## 宿主提供的 HeyGen 访问（不需要 CLI 登录）

宿主应用可以通过设置 `HEYGEN_API_BASE`（它的网关）、`HEYGEN_API_KEY`（该网关接受的 token），以及在网关是回环地址时设置 `HEYGEN_ALLOW_HTTP=1`，给 media-use 提供宿主自己的 HeyGen 访问。网关会加上宿主的 key，所以这个 key 永远不会进入 agent 的环境，每次调用都扣该 key 的 API 额度。`heygen` CLI 遵循同样的变量，所以 `resolve`（bgm/sfx/image/icon/voice/avatar-video）和音频引擎的 TTS 都会经由宿主。有宿主访问时，跳过 CLI 安装和登录；宿主有自己的 HeyGen 工具时优先用它们；绝不自作主张回退到本地或第三方生成器；调用被拒绝时，按原文转述它的消息（例如 "add a key in Settings > Account"）。

## 提供方

media-use 不持有任何 key；每个外部工具各自负责自己的认证。生成以 HeyGen CLI 免费使用路径为中心。在解析 bgm/sfx/image/icon/voice/avatar-video 之前，先安装并认证 `heygen`；来自宿主应用自有工具的音乐和音效则完全不需要这些。本地工具在存在时是需主动启用的备选：图片用 mflux，声音用 Kokoro，转写用 Parakeet，本地视频生成用 LTX。`resolve` 会针对这些本地阶梯检查可用（AVAILABLE）RAM 规格（`describeModelLadder`）；agent 可以看到阶梯并覆盖选择。

| 类型 | 提供方 / 路径 |
| --- | --- |
| bgm/sfx | heygen 目录免费使用路径；宿主应用自有的音乐和音效工具优先 |
| image | heygen 搜索免费使用路径；可选本地 mflux；codex `image_gen` 升级推荐 |
| voice | heygen tts 免费使用路径；可选本地 **Kokoro**（免费，在设备上运行） |
| icon | heygen 素材搜索免费使用路径 |
| logo | theSVG（thesvg.org），然后是 GitHub org 头像，然后是域名 favicon（全部免费） |
| grade/lut | 本地核心 preset 映射、params/CDN 风格索引、确定性的 `buildCube` 兜底 |
| video | heygen 数字人视频免费使用路径（认证失败时提示登录）；可选本地 LTX（`videogen` 阶梯）。图生视频 / 照片数字人 / 配音仍是手动的 `heygen` 配方 |

本地的 Kokoro（声音）、mflux（图片）和 LTX（视频）在设备上运行（免费、私密，缓存后可离线）。`codex` CLI 仍是基于 ChatGPT 订阅的图片升级推荐。费用规则（X4）：agent 主动发起的付费调用要先征得确认；用户要求的调用直接运行 —— `heygen.video` 被标记为付费（计量的免费额度），所以 agent 主动发起的 `resolve --type video` 会先确认。

要强制使用某个特定生成器（例如用户说"用 codex 生成这张图"），传 `--provider codex`：它会把解析锁定到该提供方，并跳过免费使用的默认路径。RAM 阶梯和提供方配方见 `references/operations.md`。

`--local-only` 会跳过所有网络提供方，包括免费的 HeyGen 提供方，只留下项目 + 全局缓存以及已安装的本地提供方。对于只有 HeyGen 能提供的类型，这意味着不会有新的解析。

## 用到的 CLI 工具（运行什么，以及如何启用每一个）

`resolve` 会自动级联；每个提供方调用一个 CLI。HeyGen 是 bgm/sfx/image/icon 目录搜索、TTS（声音）和数字人视频的免费使用路径，所以这些能力需要安装并认证 `heygen`。本地工具在存在时是需主动启用（OPT-IN）的备选；安装其中一个，就能为该类型解锁它免费、私密、在设备上运行的路径，用来代替 HeyGen 或排在 HeyGen 之前。只有 `ffmpeg`/`ffprobe` 是工具能运行起来的硬性要求。

| 工具 | 用途 | 安装 |
| --- | --- | --- |
| `ffmpeg`/`ffprobe` | adopt 探测、smart-grade signalstats、剪切、闪避烘焙、loudnorm | 系统包（`brew install ffmpeg`） |
| `heygen` | 目录（bgm/sfx/image/icon）+ TTS（声音）+ 数字人视频 —— 免费使用路径 | 按照经过验证的 HeyGen 发布安装说明[^cli]安装，然后 `heygen auth login --oauth`（需要 >= v0.3.0） |
| `mflux-generate` | 本地图像生成（FLUX），按 RAM 选最佳 | `uv venv ~/.venvs/mflux && VIRTUAL_ENV=~/.venvs/mflux uv pip install mflux==0.9.6` |
| `codex` | 图像生成升级推荐（ChatGPT 订阅） | Codex CLI，通过 ChatGPT 登录（自行负责认证） |
| `parakeet-mlx` | Apple Silicon 上的本地转写（默认 ASR，最佳） | `uv venv ~/.venvs/parakeet && VIRTUAL_ENV=~/.venvs/parakeet uv pip install parakeet-mlx` |
| `ltx-2-mlx` | 本地视频生成 | `git clone https://github.com/dgrauet/ltx-2-mlx && cd ltx-2-mlx && uv sync --all-extras` |
| `npx hyperframes` | Kokoro TTS（声音）、Parakeet 或 whisper.cpp（转写）、remove-background | 通过 hyperframes CLI；Parakeet 支持 macOS、Windows 和 glibc 2.32+ 的 Linux：`npx hyperframes models install parakeet`；whisper.cpp 在首次使用时构建（macOS 上用 Homebrew，其他平台用 git+cmake） |

按 RAM 分级的本地模型候选清单 + 每个档位确切的安装/调用方式位于 `scripts/lib/local-models.mjs`（agent 可以读 `describeModelLadder(cap, specs)` 看哪个模型适合这台机器）。PATH 上没有某个工具时，它的提供方会向 stderr 打印一行诊断，若存在其他提供方，resolve 会落到下一个（例如没有 `mflux` -> codex 图片升级推荐；没有 `parakeet-mlx` -> whisper.cpp）。

`heygen asset search` 是一个上线前的命令，在 `heygen --help` 里是隐藏的，但它可以运行；提供方会给请求加上列入允许名单的 `X-HeyGen-Client-Source` 请求头（v0.3.0+）。

[^cli]: [经过验证的发布安装说明](https://developers.heygen.com/cli)，2026-10-15 读。
