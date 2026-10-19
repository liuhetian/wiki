<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/preview-render.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# preview、play、render、publish

提供服务、渲染与分享的命令。

## preview

```bash
npx hyperframes preview                   # foreground on a TTY; persistent in agent shells
npx hyperframes preview --background      # explicit persistent session
npx hyperframes preview --foreground --json # ready JSON, then remain attached
npx hyperframes preview --background --port 4567 # agent-safe custom port (default 3002)
npx hyperframes preview --selection --json # print the current Studio selection and exit
npx hyperframes preview --context --json  # print compact agent context from Studio
```

文件变化时热重载。会自动在浏览器中打开 Studio——完整的 timeline 编辑器，用户可以在渲染前在里面播放视频、手动编辑任何东西。这是审阅界面，不只是一个查看器。

把项目交还给用户时，使用 Studio 项目 URL，而不是源文件 `index.html` 的路径：

```text
http://localhost:<port>/#project/<project-name>
```

使用实际的端口和项目目录名；把 `index.html` 当作源代码上下文，而不是预览界面。例如，在 `codex-openai-video` 中运行 `npx hyperframes preview --background --port 3017` 之后，报告 `http://localhost:3017/#project/codex-openai-video`。

交出去的 URL 打不开有两种原因——交回之前两者都要检查：URL 缺少 `#project/<project-name>` 这个 hash（Studio 能加载，但没有项目可打开），或者服务器其实没有在运行。在非 TTY 的 agent shell 中，裸的 `preview` 会自动创建一个受管理的持久会话；`--background` 仍然是最清晰的显式写法。确认打印出的 URL 返回 HTTP 200，在整个审阅期间保持它运行，结束后用 `npx hyperframes preview --stop` 显式停止它。按原样使用打印出的 URL：对于包含路由元字符的项目名，HyperFrames 会做 URL 编码。

### 从 Studio 选中项获取 agent 上下文

`preview --context` 和 `preview --selection` 是 agent 通向正在运行的 Studio 会话的桥梁。它们**不会**启动新的服务器；它们会找到当前项目的活动预览服务器，从 Studio 读取对 agent 有用的状态，打印出来，然后退出。

当用户给出指示性的编辑指令时使用它，比如「改一下这个」「移动选中的元素」「把我点的那张卡片放大」或「修一下当前选中的」：

```bash
npx hyperframes preview --context --json --context-fields selection
```

精简的上下文载荷包括选中元素的源文件、composition 路径、当前 timeline 时间、`data-hf-id` / 选择器目标、包围盒、文本内容，以及选中元素的缩略图 URL。有 `selection.target.hfId` 时优先用它；只有在不存在稳定的 `data-hf-id` 时，才退而使用 `selection.target.selector`。如果 `selection` 为 `null`，检查 `errors.selection.code`（例如 `no-selection`）。

只请求你需要的切片，让 agent 上下文保持精简：

```bash
npx hyperframes preview --context --json --context-fields selection
npx hyperframes preview --context --json --context-fields lint
npx hyperframes preview --context --json --context-fields selection,lint
```

只有当编辑确实需要重量级的选中项字段时，例如 `computedStyles`、`inlineStyles`、`dataAttributes` 或可编辑文本字段的元数据，才使用 `--context-detail full`：

```bash
npx hyperframes preview --context --json --context-fields selection --context-detail full
```

当你明确需要完整的选中元素载荷、且不需要 lint/服务器上下文时，仍然可以使用 `preview --selection --json`。

失败模式：

| 代码 | 含义 |
| --- | --- |
| `preview-not-running` | 先用 `npx hyperframes preview --background` 启动 Studio。 |
| `ambiguous-preview-server` | 打开了多个匹配的 Studio 服务器；用列出的某一个 `--port` 重新运行。 |
| `preview-port-mismatch` | 请求的 `--port` 不是匹配的 Studio 服务器之一。 |
| `no-selection` | Studio 已打开，但用户还没有选中任何元素。 |
| `selection-unavailable` | 正在运行的预览服务器无法正常提供选中项上下文。 |

如果没有选中项，请用户在 Studio 中点击目标元素，然后重新运行命令。如果服务器错误中列出了候选端口，用 `--port <candidate>` 重新运行同一条命令。当 CLI 能给出稳定的元素目标时，不要从截图去推断目标。

## play（轻量播放器）

```bash
npx hyperframes play                  # current project, port 3003
npx hyperframes play ./my-video       # specific project
npx hyperframes play --port 8080      # custom port
```

`play` 通过可嵌入的 `<hyperframes-player>` Web 组件提供 composition，而不是完整的 Studio UI。在分享预览链接时，或者 Studio 比所需的更重时（不需要编辑器、不需要面板），使用它。`play` 报告的是普通的 `http://localhost:<port>` URL——没有 `#project/<name>` 片段（那是只有 `preview` 使用的 Studio 路由约定）。

播放器的 `playback-rate` 属性（预览速度控制，驱动 timeline 的 `timeScale`）会被限制在 `[0.1, 5]` 范围内；`≤ 0` 或非有限的值会回退为 `1`。这是一个预览/播放的调节旋钮，不是 composition 的 `data-*` 属性——编写的动效仍然以 `1×` 渲染。

### 用外部浏览器启动（preview + play）

`preview` 和 `play` 都可以在一个明确指定的、兼容 Chromium 的浏览器中打开，而不是操作系统默认浏览器。两种用途：隔离的 Chromium profile，或外部 CDP 连接（DevTools / Playwright / Puppeteer / browser-MCP）。**HyperFrames 本身不负责 CDP 自动化**——这只是把端点暴露出来；连上它的东西出了什么问题由你自己负责。不要和 `--browser-gpu` 混淆（那是一个 `render` 参数，控制抓帧时 Chrome 对 GPU 的访问）。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `--browser-path` | 路径 | 兼容 Chromium 的可执行文件的绝对路径（`/usr/bin/chromium`、`/Applications/Brave Browser.app/...`）。 |
| `--user-data-dir` | 路径 | 兼容 Chromium 的 profile 目录。需要配合 `--browser-path`。用一个一次性的目录，让状态不进入你的主 profile。 |
| `--remote-debugging-port` | 整数 1-65535 | 在给定端口上开启 Chromium CDP 端点。**同时需要** `--browser-path` 和 `--user-data-dir`——否则会被拒绝，这样 CDP 端点就不会意外泄漏到你的主 profile 中。 |

```bash
# Open preview in an isolated Chromium profile
npx hyperframes preview --background --browser-path /usr/bin/chromium --user-data-dir /tmp/hf-profile

# Same plus a CDP endpoint on :9222 (attach DevTools / Playwright / etc.)
npx hyperframes play --browser-path /usr/bin/chromium --user-data-dir /tmp/hf-profile --remote-debugging-port 9222
```

校验在任何服务器启动之前进行，所以无效的值会干净地退出，不会留下正在监听的 socket。

## render

> 只有在用户已经在 `preview` 中审阅并批准之后才渲染。不要因为检查通过就自动渲染。

```bash
npx hyperframes render                                # standard MP4 from cwd
npx hyperframes render ./my-video --output ./out.mp4  # render from outside the project dir
npx hyperframes render --output final.mp4             # named output (no timestamp)
npx hyperframes render -c compositions/intro.html -o intro.mp4  # render a specific sub-composition file
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --quality looks                # first real encode (default)
npx hyperframes render --fps 60 --quality delivery    # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

> 默认的 `--output` 是 `renders/<project-name>_<YYYY-MM-DD>_<HH-MM-SS>.<ext>`——每次渲染都带时间戳，这样连续几次运行不会互相覆盖。传 `--output` 可以得到稳定的文件名。

| 参数 | 选项 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dir`（位置参数） | 路径 | cwd | 项目目录。省略时使用当前工作目录。 |
| `--composition`、`-c` | composition 文件的路径 | `index.html` | 渲染某个指定的 composition 文件（例如 `compositions/intro.html`），而不是项目的 `index.html`。 |
| `--output`、`-o` | 路径 | `renders/<project>_<ts>.<ext>` | 输出路径。默认带时间戳（`<project-name>_YYYY-MM-DD_HH-MM-SS.<ext>`）。 |
| `--fps` | 24、30、60 | 30 | 60fps 会让渲染时间翻倍 |
| `--quality` | draft、looks、delivery、standard、high | looks | `looks` 是在 standard 预设上用 CRF 16。`delivery` 就是 `high`。draft 用于迭代 |
| `--format` | mp4、webm、mov、gif、png-sequence、hls | mp4 | WebM/MOV 渲染时带透明度；gif 用于在 GitHub PR/README/文档中内联自动播放（两遍调色板编码，fps 上限 30——更推荐 `--fps 15`——无音频，只支持 1 位透明度，HDR 会回退为 SDR）；png-sequence 把 RGBA 帧写到一个目录中（供 AE/Nuke/Fusion 导入）；hls 写出一个 HLS VOD 目录（master.m3u8 + 视频/音频播放列表 + MPEG-TS 分片），只支持 SDR，拒绝 `--gpu`，在 lambda/cloudrun 上不可用 |
| `--gif-loop` | 0-65535 | 0 | GIF 循环次数；`0` 表示无限循环。仅与 `--format gif` 一起使用。 |
| `--hls-segment-seconds` | 1-60 | 4 | HLS 目标分片长度，以整秒计；同时会锁定编码器的 GOP，让每个分片都从关键帧开始。仅与 `--format hls` 一起使用。 |
| `--resolution` | landscape、portrait、landscape-4k、portrait-4k、square、square-4k（以及别名 `1080p`、`4k`、`uhd`） | — | 通过 Chrome 的 `deviceScaleFactor` 超采样。宽高比必须与 composition 一致；缩放倍数必须是整数。不能与 `--hdr` 同用。 |
| `--crf` | 0-51 | — | 编码器 CRF（越低 = 质量越高）。与 `--video-bitrate` 互斥。 |
| `--video-bitrate` | 例如 `10M`、`5000k` | — | 目标码率。与 `--crf` 互斥。 |
| `--hdr` | 开关 | 关闭 | 即使源是 SDR 也强制输出 HDR。仅限 MP4。 |
| `--sdr` | 开关 | 关闭 | 即使源是 HDR 也强制输出 SDR。 |
| `--workers` | 数字或 `auto` | auto | 每个 worker 会启动一个 Chrome（约 256 MB） |
| `--docker` | 开关 | 关闭 | 跨主机得到可复现的输出 |
| `--gpu` | 开关 | 关闭 | GPU 加速的 FFmpeg 编码（NVENC / VideoToolbox / VAAPI / QSV） |
| `--browser-gpu` / `--no-browser-gpu` | 开关 | auto（本地）、关闭（docker） | 让 Chrome/WebGL 抓帧使用主机 GPU |
| `--browser-timeout` | 秒（0.001–86400） | 60 | Puppeteer 加载入口 HTML 的页面导航超时。当重量级的 composition（大量视频 / 字体 / 远程素材）无法在默认的 60 秒内到达 `domcontentloaded` 时调大它。 |
| `--quiet` | 开关 | 关闭 | 抑制详细输出 |
| `--strict` | 开关 | 关闭 | 有 lint 错误时失败 |
| `--strict-all` | 开关 | 关闭 | 有 lint 错误**以及**警告时都失败 |
| `--variables` | JSON 对象 | — | 覆盖 `data-composition-variables` 中声明的值 |
| `--variables-file` | 路径 | — | 包含变量值的 JSON 文件（`--variables` 的替代方式） |
| `--strict-variables` | 开关 | 关闭 | 当 `--variables` 中有未声明的 key 或类型不匹配时，让渲染失败 |

**质量建议：** 迭代时用 `draft`，第一次正式编码用 `looks`（默认值），最终交付用 `delivery`。`standard` 和 `high` 仍然可用。

**读摘要的第二行。** 在输出路径和大小之后，`render` 会打印抓帧路径、GPU 模式和各阶段耗时，例如 `beginframe capture · software gpu · compile 0.7s · setup 1.1s · capture 8.1s · encode 5.8s`。`capture` 是逐帧循环，`setup` 是校准加会话初始化；当并行的 worker 走了不同路径时，抓帧路径显示为 `a|b`；`encode (during capture)` 表示流式编码器与逐帧循环是重叠进行的，所以不要把它加到总耗时里。本地 GPU 为 `auto`（默认值）时会请求 BeginFrame。如果在 Linux 上这一行仍然显示 `screenshot capture` 和 `software gpu`，它下面会有一条提示，说明 BeginFrame 没有运行（需要 chrome-headless-shell，且不能用 `--resolution` 放大）。这条提示只在 GPU 是自动探测时出现，在 `--docker` 或 `--no-browser-gpu` 下绝不会出现，因为那时用软件 GL 本来就是目的。重量级的 composition 在软件 GL 上可能会卡住。不要仅仅为了知道走的是哪条路径就去用 `--debug`。

**参数化渲染：** composition 在 `<html>` 根节点上用 **`data-composition-variables`** 声明它的变量——这是一个 JSON **声明数组**（每个条目为 `{id, type, label, default}`），定义了 schema。内部的脚本通过 `window.__hyperframes.getVariables()` 读取解析后的值。CLI 的 `--variables '{"title":"Q4 Report"}'` 是一个 JSON **以 id 为键的对象**，为某一次渲染覆盖那些声明的默认值；缺失的键会沿用默认值，所以同一个 composition 在开发预览和生产环境中都能原样运行。sub-composition 的宿主也可以用 `data-variable-values` 按实例覆盖。完整的写法见 `hyperframes-core` skill。

### feedback（渲染后报告）

渲染经过验证之后，每个任务发送一行反馈。这是维护者的主要信号——一次悄无声息完成的渲染不会告诉他们任何东西。

```bash
npx hyperframes feedback --rating 10                              # clean run, no notes
npx hyperframes feedback --rating 6 --comment "bg <video> renders grey in multi-scene; worked around with --format png-sequence"
```

`--rating` 是 0-10 的整数；`--comment` 是自由文本。只带 `--comment`、不带 `--rating` 的是无评分报告（即 `SKILL.md` 中的 `MISSING FEATURE:` 和 `HOST APP:`），绝不会计入评分指标。反馈是匿名的，并会自动附上一份 `doctorSummary`（OS/Node/CPU/内存/ffmpeg），所以不要重复这些字段。顺利的运行只需要一句简短的结果。在发送任何 bug、变通办法或令人困惑的行为之前，先收集这份精简的复现包：

```text
REPRO COMMAND: <HF_*/PRODUCER_* env> npx hyperframes <exact command>   # run from the project directory; do NOT paste absolute paths
EXPECTED / ACTUAL: <expected behavior> / <observed behavior and isolated trigger>
EXACT ERROR: <verbatim error or warning; include frame/timestamp for visual defects>
OUTCOME: <output correct | output corrupt | fallback succeeded | hard exit | command hung>
WORKAROUND: <exact workaround, or none>
COMPOSITION_STRUCTURE:
  elements: video=<n> audio=<n> img=<n> svg=<n> canvas=<n> subComps=<n>
  attributes: <comma-joined subset of clip-path, filter, mix-blend-mode, transform, mask, position:fixed, overflow:hidden, z-index, data-has-audio, data-duration, data-start, data-composition-src, background-image:url, mask-image:url — or "(none present)">
  timeline: <flat | nested (<n> sub-comps)>; driver=<gsap | data-timeline | gsap+data-timeline | none>
  delta: <what differs between the working workaround-render and the broken default render>
  defect: <spatial location + frame index range, e.g. top-left / frames 0-30 — omit for non-visual defects>
```

`COMPOSITION_STRUCTURE:` 是一份保护隐私的结构剖析：只有计数和是否存在的标记，没有文件路径，没有 src URL，没有用户文本。它让维护者无需拿到 composition 的 ZIP，就能把报告与已知的 bug 家族做模式匹配（例如「sub-composition 挂载 + clip-path」「GSAP timeline + z-index」）。任何评分 ≤ 7 且描述的是视觉缺陷（黑帧、闪烁、输出损坏、帧错误、空白输出、其他视觉异常）的报告都必须附上它；评分更高时可选，但附上会很有帮助。使用本 skill 的 agent 可以针对自己已经能访问到的 composition HTML，调用 `packages/cli/src/utils/compositionCensus.ts` 中的 `buildCompositionCensus(html)` 和 `renderCompositionCensusBlock(census)` 来自动填写这一块——人类用户不用手动填写。

**反馈会提交到公开渠道——发送前先匿名化。** 去掉绝对路径（它会泄露用户主目录和机器身份）、路径中嵌入的任何用户名或项目名、密钥和凭据。命令中的路径参数应保持相对于项目目录（写 `./renders/out.mp4`，而不是 `/Users/<user>/Documents/…/out.mp4`；写 `.hf-tmp/`，而不是 `/home/<user>/projects/<real-name>/.hf-tmp/`）。同样，要去掉 `EXACT ERROR:` 堆栈跟踪和日志摘录中的绝对路径——保留文件名和行号，去掉前面的目录。参数和相关的 `HF_*` / `PRODUCER_*` 变量要逐字保留。如果故障不再复现，附上最后一次失败的命令和日志摘录（同样脱敏）。只有当项目链接已经存在且可以安全分享时，才分享它。

当一条评分不是 10 的 `--comment` 缺少 `REPRO COMMAND:`，或者一条评分 ≤ 7 的视觉缺陷评论缺少 `COMPOSITION_STRUCTURE:` 时，`hyperframes feedback` 命令会发出软警告。这些警告打印在提交确认信息上方，不会阻止提交——有些正当的报告（比如一句「cloudrun 配额昨天调高了，现在没问题了」）套不进这个模板。补好复现包后重新运行即可消除警告。

碰到了可复现的 bug？加上 `--file-issue`（可选加 `--dir <project>`，在非交互式 shell 中加 `--yes`），还会把一个最小复现发布到公开 URL，并打开一份预先填好的 GitHub `bug` issue 草稿，供维护者提交。这会把项目公开发布，所以需要主动选择启用并征得同意；issue 绝不会被自动提交。

## publish

```bash
npx hyperframes publish              # upload current project privately, return stable URL
npx hyperframes publish ./my-video   # specific project
npx hyperframes publish --public     # allow anyone with the URL to view the claimed project
npx hyperframes publish --yes        # skip the confirmation prompt (scripts/CI)
```

上传项目的源文件（HTML + 素材），并返回一个稳定的托管 URL，在浏览器中即可渲染播放。新发布的项目默认是私有的，查看时需要认证并具有访问权限。用 `--public` 允许任何拿到 URL 的人查看已认领的项目。原地更新一个项目会保留它现有的可见性：不带 `--public` 重新发布，绝不会把公开项目变成私有。`--yes` 只跳过确认提示；不会改变可见性。未登录状态下的发布会返回一个需要认证的认领 URL，而不是公开的播放 URL。lint 问题会在上传前显示出来，但不会阻止上传。
