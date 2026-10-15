<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/init-and-scaffold.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# init、capture、skills

<!-- registry-items: allow=blank,landscape-4k,portrait-4k,square-4k,product-launch-video,hyperframes-core,media-use -->

脚手架命令。用它们来代替手动创建文件——它们会搭好正确的文件结构、复制媒体、运行转写，并安装 AI 编程 skill。

## init

```bash
npx hyperframes init my-video                                    # centered blank (TTY: wizard)
npx hyperframes init my-video --example warm-grain               # pick an example
npx hyperframes init my-video --resolution portrait
npx hyperframes init my-video --video clip.mp4                   # with video file
npx hyperframes init my-video --audio track.mp3                  # with audio file
npx hyperframes init my-video --tailwind                         # Tailwind v4 browser runtime
npx hyperframes init my-video --non-interactive                  # CI — flag-only, same blank
```

**默认行为取决于是否为 TTY**：在终端中，CLI 会提示选择示例/选项（默认：居中的空白项目）。在 TTY 之外（CI、agent、管道输出），它会自动切换到非交互模式，并搭建那个空白项目。只有要从某个具名示例起步时才传 `--example`。在 TTY 上传 `--non-interactive` 强制进入只认参数的模式。

模板：`blank`、`warm-grain`、`play-mode`、`swiss-grid`、`vignelli`、`decision-tree`、`kinetic-type`、`product-promo`、`nyt-graph`。（即 `registry/registry.json` 中 `hyperframes:example` 条目的封闭集合，加上随附的 `blank` 模板。`hyperframes catalog` 不列出示例——它的 `--type` 只接受 `block` 或 `component`——所以这份清单没有可实时查询的等价来源，由 `bun run lint:skills` 负责校验。）

其他常用参数：

- `--resolution` —— preset：`landscape`（1920×1080）、`portrait`（1080×1920）、`landscape-4k`、`portrait-4k`、`square`（1080×1080）、`square-4k`。别名：`1080p`、`4k`、`uhd`、`1080p-square`、`4k-square`。
- `--skill=<slug>` —— 在 `hyperframes.json` 中记录所属的创作工作流（例如 `product-launch-video`），这样这个项目之后的每一次渲染——重新渲染、`npm run render`、`--batch`——都会在匿名遥测中归属到它，无需再次传这个参数。创作工作流会自动设置它；你很少需要手动传。
- `--skip-skills` —— **暂时被忽略**：在 skills.sh registry 追上进度之前，`init` 总是会对照 GitHub 检查 AI 编程 skill。要跳过（CI/测试），请改为设置环境变量 `HYPERFRAMES_SKIP_SKILLS=1`。
- `--skip-transcribe` —— 不要用 Whisper 自动转写 `--audio` / `--video`。
- `--model`、`--language` —— 自动转写所用的 Whisper 模型 / 语言。

使用 `--tailwind` 时，在编辑 class 或主题 token 之前，先调用 `hyperframes-core` skill（Tailwind 参考文档）。这个脚手架使用的是 Tailwind v4 浏览器运行时的写法，而不是 Studio 的 Tailwind v3 配置。

提供了 `--audio` 或 `--video` 时，`init` 会用 Whisper 转写该文件。语音/模型的选择见 `media-use` skill。

## capture

```bash
npx hyperframes capture https://stripe.com                  # scaffold from a website
npx hyperframes capture https://linear.app -o linear-video  # custom output directory
npx hyperframes capture https://example.com --json          # JSON output for agents
npx hyperframes capture https://example.com --skip-assets   # skip image/SVG download
npx hyperframes capture https://example.com --skip-vision   # skip optional AI captions
npx hyperframes capture https://example.com --max-screenshots 12
npx hyperframes capture https://example.com --timeout 60000 # page-load timeout in ms
npx hyperframes capture https://example.com --capture-budget 90000 # post-navigation budget
```

把一个在线 URL 抓取为可编辑的 HyperFrames 项目：截图变成分层的场景，素材下载到本地，结果是一个普通项目，你可以对它执行 `lint` / `preview` / `render`。当用户提供一个 URL 作为视频的起点时使用它。

`--timeout` 限定页面导航的时长；`--capture-budget` 是另一项独立的协作式预算，用于导航之后的工作（字体、素材、视觉识别和对照图）。后者不是一个硬性的挂钟看门狗，无法中断已经在进行中的原生工作。因此，外层调用方的截止时间是第三种、彼此不同的超时。外层调用方超时会让抓取结果处于未知状态；它既不能证明 HyperFrames 卡死了，也不能证明应该调大导航超时。保留最后一个阶段，并判断触发的是哪一个边界。`--skip-vision` 只禁用可选的 AI 图片说明生成。

对于 agent，使用 `--json`。结果包含 `ok`、警告和 `lastPhase`。该命令还会发出稳定的 `HYPERFRAMES_CAPTURE_PHASE` 记录，让看门狗能够报告最后一个开始、完成或降级的阶段，而无需保留敏感的载荷。

把非零退出、JSON 中的 `ok: false` 或输出了 `BLOCKED.md` 视为**硬性停止**。不要渲染、构建，也不要从被阻断的抓取留下的部分文件中推断品牌/设计数据。成功的抓取可以在预算之内对某个可选阶段降级，但它的结构性输出仍然必须满足所属工作流的闸门。仅凭退出码为零和文件存在，并不代表语义上的成功：要求本次调用的 JSON 为 `ok: true`、没有 `BLOCKED.md`，并且产物对那个工作流可用。每次重试都输出到一个新的目录；绝不合并或复用被阻断那次尝试的部分输出。

## skills

```bash
npx hyperframes skills    # install HyperFrames skills for AI coding tools
```

一次性的配置，把 HyperFrames skill 包（`hyperframes-core`、`-creative`、`-animation`、`-cli`、`-registry`、`-media`，以及 `product-launch-video` 和 `hyperframes` 这两个编排者）加到本地的 AI 编程环境中，让 agent 遵循框架约定。HyperFrames 大版本升级后重新运行一次。
