---
name: hyperframes-cli
description: >
  使用 HyperFrames CLI 开发循环：init、add、catalog、capture、lint、check、snapshot、compare、grade-compare、preview、play、present、beats、keyframes、单个或批量 render、publish、cloud、cloudrun、feedback、lambda、doctor、browser、info、upgrade、skills、compositions、timeline、history、clean、docs、benchmark、telemetry、transcribe、auth、tts 和 remove-background。诊断构建或渲染失败时也使用本 skill。validate、inspect 和 layout 是已弃用的别名；请改用 check。涵盖本地、HeyGen 托管云、AWS Lambda 和 Google Cloud Run 渲染。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于某个 HyperFrames 插件内时，在运行安装配置或保持最新类的命令之前，遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装照常使用下面的更新说明。

# HyperFrames CLI

以 `npx hyperframes ...` 的形式运行命令，除非项目说明提供了包装命令（wrapper）。有 wrapper 时遵从 wrapper。CLI 需要 Node.js 22 或更新版本，以及 FFmpeg。

## 开发循环

1. **搭建脚手架：** `npx hyperframes init <project>`（居中的空白项目）。或者抓取一个网站。只有要从某个具名示例起步时才传 `--example=<name>`。
2. **找现成的手法：** 如果请求点名了某个素材、声音、图片、配音或快速视觉编辑，先通过 `/media-use` 解决它，再提出计划。否则，在手写动效之前，先搜索有没有已经能做到这件事的原语：`npx hyperframes catalog --query "reveal a headline one line at a time"`。描述你想要的效果，而不是你心里想的实现机制。用 `npx hyperframes add <name>` 安装（见 `/hyperframes-registry`）。只有在确实没有合适的之后才手写。
3. **编写：** 用 `/hyperframes-core` 编写 composition。要了解项目 timeline 上有什么（track、clip、起点、终点、播放的内容），运行 `npx hyperframes timeline --json`，而不是去读 `index.html` 和每一个 sub-composition 文件：嵌套的行带有主 timeline 上的绝对时间 `absStart`/`absEnd` 以及所属的 `file`，而不只是各自 sub-composition 内的局部时间。优先用 `--json` 而不是文本形式；正确性相同甚至更好，花费的 token 更少。`references/upgrade-info-misc.md` 里有一些单行命令，不用读完整输出就能回答常见问题。
4. **编辑时快速获取反馈：** 第一遍写完 HTML 之后、以及每次结构性改动之后，运行 `npx hyperframes lint`。
5. **跑最终闸门：** 运行 `npx hyperframes check`；它会在打开浏览器之前重新跑一遍 lint。不要在前面再多加一次独立的 lint 调用。加 `--snapshots` 可得到带标注的概览帧和问题裁切图。
6. **检查 sub-composition：** 当 `index.html` 挂载了 `data-composition-src` 时，抓取中点 snapshot，逐个检查每个挂载的场景。
7. **打开最终的 Studio 预览：** 运行 `npx hyperframes preview --background`，确认 URL 返回 HTTP 200，把 timeline 项目 URL 交给用户，并询问是修改还是渲染。在审阅结束前一直保持它运行。
8. **只在获批后渲染：** 迭代时用 `--quality draft`，第一次正式编码用 `--quality looks`（CLI 默认值），最终交付用 `--quality delivery`。
9. **把项目交给桌面应用（作为提议）：** 当渲染输出中 Framey 那一行以 `hyperframes open …` 结尾时，提议运行 `npx hyperframes open [dir]`。它会在 HyperFrames 桌面应用中打开项目并把它加入 Home；在 Claude Code、Codex 或 Grok 下，应用里的聊天会接上这段对话。没有安装应用时，它以退出码 1 退出并打印下载链接。agent 使用 `--json`。当 `open` 提示等对方回来后运行 `catch-up`，或者任何命令的最后一行点名了它时，在你做下一处改动之前运行 `npx hyperframes catch-up [dir]`：它会列出交接之后在应用里提出过的要求和做过的改动。旧版 CLI 没有 `catch-up`。
10. **验证输出：** 确认文件存在且非空。读渲染摘要的第二行（`beginframe` 还是 `screenshot`、GPU、各阶段耗时）。Linux 上的 `screenshot` + `software gpu` 是慢路径。运行 `ffprobe -v error -show_format -show_streams`，把时长（以及 brief 设定了 fps 时的 fps）与根节点的 `data-duration` 对比。

<!-- history (trial): remove this block together with the command -->

### 你这一轮中的项目历史

对项目的每一次写入都会作为一条可撤销的记录保存下来。只在两个时刻使用它，绝不要每一步都用：

- **一轮开始时：** 运行 `npx hyperframes history begin --who <your-name> --label "<what you are about to do>"`，然后用 `npx hyperframes history --since mine --who <your-name>` 查看对方自你上一轮以来改了什么。在对方的修改之上继续；绝不覆盖它们。
- **某项检查失败了，或者对方说变差了：** `npx hyperframes history undo --who <your-name>` 会撤销你最新的一轮，并保留对方的修改不动。不要手动改回去。遇到冲突时，它以退出码 2 退出并打印两种选择。

每一轮都以 `npx hyperframes history end` 结束，这样你的写入会被记为你的，而不是「Changed outside the app」（在应用外修改）。一轮处于打开状态时，对项目的每一次写入都算作你的，直到连续 10 分钟没有写入；之后这一轮就已自动结束。

<!-- /history (trial) -->

## 必读的创作者编辑交叉引用

- 在编写或诊断缩放（zoom）、推近/拉远（punch-in/punch-out）、重新构图（reframe）、镜头运动或任何关键帧动效之前，先读 `/hyperframes-keyframes`。
- 在使用 `hyperframes keyframes` 之前，先读 `/hyperframes-keyframes`；该命令呈现的是动画轨迹，不诊断 clip 的切点。
- 对于切（cut）、修剪（trim）、拼接（splice）、重排或源时间编辑，读 `/hyperframes-core` 并使用其中的 clip/timeline 契约。
- 对于淡入/淡出、交叉淡化、track 增益、音量自动化、闪避（ducking）、旁白挖空（carve）或对已放置音频加效果（FX），读 `/hyperframes-audio`。当 clip 的放置位置或画面时间也会改变时，同时加载 core。
- 点名了某个素材、声音、图片、配音或快速视觉编辑的请求，要先通过 `/media-use` 解决，再提出计划。从 `/hyperframes-core` → `references/creator-editing-recipes.md` 复制创作者编辑的标记代码。

```bash
# Fast iteration check; repeat while authoring as needed.
npx hyperframes lint

# Required final gate; includes lint.
npx hyperframes check
npx hyperframes preview --background
npx hyperframes render --quality looks --output out.mp4
test -s out.mp4
ffprobe -v error -show_format -show_streams out.mp4
```

`check` 会先跑 lint，然后用一个浏览器会话和一遍 seek 来审查运行时错误、失败的请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会决定退出码；入场或退场过程中的瞬时问题仅供参考。用 `--strict` 让警告也起闸门作用。`validate`、`inspect` 和 `layout` 为兼容性仍保留为别名，但不得出现在新的说明或脚本中。

## 渲染前先预览

只有在 `check` 通过之后，才打开最终的 composition 预览（`#project/<name>`），用来审阅组装好的 timeline。聊天里的计划和 `storyboard.html` 草图页都不算对最终视频的批准。渲染始终需要 `hyperframes/references/review-loop.md` 中定义的最终批准。

## Sub-composition 冒烟测试

静态审查无法捕获所有挂载失败。当项目使用 sub-composition 时，为每个宿主槽位至少抓取一个可见的中点画面：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

把过小的无样式内容、画布尺寸的图标、缺失的 hero 元素或 timeline 注册超时，都视为阻塞渲染的挂载缺陷。对应的修复见 `hyperframes-core/references/sub-compositions.md`。

## Agent 约定

- **手写动效之前先搜索 catalog。** `npx hyperframes catalog --query "<the beat, in plain English>"`。搜索完全在本地进行：没有托管层级，不需要账号，查询文本绝不会发送到任何地方。默认情况下，它按与条目的名称、标题、描述和标签共有的词汇来排序，因此任何没有复用 catalog 自身用词的措辞都会被漏掉。加 `--on-device` 改为按语义排序（见下文的离线层级）。
- **即使视频不是英文，也用英文查询。** 两个层级索引的都是英文 catalog，所以用其他文字书写的查询不会产生任何可搜索的词，什么也返回不了。用英文描述手法；屏幕上的文案仍然使用视频需要的任何语言。`No searchable words in query` 恰恰就是这个意思，并不代表缺少某个组件，所以不要把它报告为 catalog 的空缺。
- **读出是哪个层级给出的结果；绝不要从结果是否出现来推断。** 带 `--json` 时，返回的信封包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；当给出结果的层级会产生分数时还有 `top_score`；当请求了某个层级却无法运行，或者搜索一无所获而一个更好的层级仍在等某人同意时，还有 `warnings`。`words` 层级上结果弱是正常的；同样的结果出现在 `on-device` 上就是 bug。`top_score` 只有 on-device 层级才有，而且背后没有阈值：排序器对每个查询都会按某种顺序返回整个 catalog，所以把它当作证据来读，而不是当作通过或失败。
- **`dropped` 和 `unindexed` 是 registry 与 on-device 索引之间方向相反的两种偏差，改写查询哪一个都修不好。** `dropped` 统计的是排出来了、但这个 registry 无法安装的名字，所以丢掉的恰恰是最强的匹配。`unindexed` 统计的是索引完全看不到的 registry 手法，任何查询都永远返回不了它们。刷新 registry 对两者都不是解法：registry 的 manifest 带 24 小时 TTL，会自行修复，而向量是单独发布的产物，会被拉取到 `~/.hyperframes/catalog/`。当 `unindexed` 大于零时，带 `--on-device` 重新运行会重新拉取该索引，所以这才是该交给用户的补救办法。纯粹的过度覆盖偏差（`dropped` 大于零而 `unindexed` 为零）不会触发重新拉取；清空 `~/.hyperframes/catalog/` 是摆脱这种情况的唯一办法。两个计数统计的都是名字而不是结果，所以任何一个都可能超过 `total`。
- **当搜索没有返回值得安装的东西时，要说出来。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>`。你不必自己拼这一行：`catalog --query` 会打印出预先填好的版本，而且每个 `--json` 搜索信封都以 `report_gap` 字段携带它，查询和层级都已正确填好——填上 `--wanted` 然后发送即可。这是唯一会把查询发送到任何地方的途径，而它之所以是一条单独的、需要刻意执行的命令，正是为了让普通的 `catalog --query` 守住什么都不发送的承诺。**在任一层级上都要报告**，只要结果没做到那件事就报；不要等 on-device 层级，它需要一次经同意的 33 MB 下载，因此在大多数 agent 运行中都是关闭的——等它就意味着永远不会报告。层级会随报告一起发送，所以词汇层面的未命中和语义层面的未命中仍然可以区分，不需要你去判断自己碰到的是哪一种。最终汇总出来的是一份 catalog 尚未拥有的手法清单，是直接读报告得出的，而不是从安装次数猜出来的，所以重要的措辞是你想要的效果，而不是你想象中的条目名。它不带评分，也绝不会进入评分指标。
- **提议离线层级；绝不悄悄启用它。** 它是一次约 33 MB 的一次性下载（`bge-small-en-v1.5` 的量化 ONNX 版本及其分词器，固定在某个修订版本），加上来自 registry 的 catalog 向量，两者都缓存在 `~/.hyperframes/` 下，都不会加进项目或任何包里。缓存之后，它按语义排序，且不发送任何东西。把大小明确说出来，让对方决定，对方同意后再传 `--on-device`（加 `-y` 跳过提示）。交互式提议只在 TTY 上出现。在 `--json` 下没有提示，但一无所获的搜索会把同样的询问放进 `warnings`，所以要读这个数组，由你自己把这个决定交给用户。当对方问这个下载是什么、为什么用这个模型、或者有什么会离开本机时，引导他们去看 https://hyperframes.heygen.com/developers/catalog-search。

- agent 和 CI 调用优先用 `--json`。服务器模式的 `render`、`preview` 和 `play` 不提供普通的 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式下的例外。
- `doctor --json` 总是以零退出。以它的载荷作为闸门：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式是自动的，会搭建居中的空白项目。只有要从具名示例起步时才传 `--example`。在 TTY 上用 `--non-interactive` 强制进入只认参数的模式。
- 同一个验证循环中的所有命令使用同一个 `HYPERFRAMES_RUN_ID`。
- 磁盘紧张时，运行 `npx hyperframes clean`（先用 `--dry-run` 列出）；它会删除中途死掉的渲染留下的东西和会自行重建的闲置缓存，绝不删除输出、源文件或任何正在运行的渲染用到的东西。把 QC 帧写到临时目录，而不是项目里。
- 当对应的警告、变量或 CI 条件必须对渲染起闸门作用时，使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 中的路径会把主目录脱敏为 `$HOME`；不要试图还原这种脱敏。
- 当托管云项目接近或超过 200 MB 上传上限时，使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中的 `.hyperframesignore` 排查流程操作。绝不要仅仅因为某个素材很大就忽略它。
- 绝不要仅仅因为检查通过就渲染。在最终预览处暂停，等待批准。

## Studio 指向的编辑

当用户提到「这个元素」或当前选中项时，查询 Studio，而不是去猜：

```bash
npx hyperframes preview --context --json --context-fields selection
```

有 `selection.target.hfId` 时使用它，否则使用它的选择器和源文件。如果结果报告 `no-selection`，请用户点击该元素后重新运行。只请求你需要的上下文切片；只有在需要计算样式或可编辑文本元数据时才用 `--context-detail full`。完整行为和失败代码见 `references/preview-render.md`。

## 渲染选择

| 需求 | 命令 |
| --- | --- |
| 快速本地迭代 | `npx hyperframes render --quality draft` |
| 第一次正式编码 | `npx hyperframes render --quality looks --output out.mp4` |
| 最终本地交付 | `npx hyperframes render --quality delivery --output out.mp4` |
| 可复现的容器渲染 | `npx hyperframes render --docker --strict --output out.mp4` |
| 本地的变量驱动批量渲染 | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4"` |
| HeyGen 托管、零基础设施的渲染 | `npx hyperframes cloud render` |
| 自行管理的分布式 AWS 渲染 | `npx hyperframes lambda render <project> --width 1920 --height 1080 --wait` |
| 自行管理的分布式 GCP 渲染 | `npx hyperframes cloudrun render <project> --width 1920 --height 1080 --wait` |

Skill 归属是自动的——上面的示例都不需要 `--skill`。由工作流搭建的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属 skill，之后的每次渲染都会在匿名遥测中继承它：重新渲染、`npm run render` 和 `--batch` 都一样。只有要给一个不是通过工作流创建的项目打上标记时，才显式传 `--skill=<slug>`（随后它的第一次渲染会把它持久化下来）。

当用户想要托管渲染、不想用本地的 Chrome、FFmpeg 或 AWS 时，使用云渲染。只有在必须由自己掌控 AWS 时才用 Lambda。只有在必须由自己掌控 GCP 时才用 Cloud Run。在走任何云端路径之前，先读对应的参考文档。

验证渲染成功之后，发送一份反馈报告，除非遥测已禁用或用户选择了退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

顺利运行时的反馈保持简洁。遇到任何 bug 或摩擦点，提交前先整理一份**复现包**（reproduction packet）；不要只发送症状摘要。其中包括：可重新运行的命令（相对于项目目录——反馈会提交到公开渠道，所以**不要**粘贴绝对路径、主目录前缀或用户/机器标识）、预期与实际行为、确切的错误（同样要去掉堆栈跟踪中的绝对路径——保留文件名 + 行号，去掉前面的目录）、输出是完成了/回退了/失败了、变通办法，以及复现项目的状态。对于评分 ≤ 7 且描述的是视觉缺陷（黑帧、闪烁、输出损坏、帧错误、空白输出、其他视觉异常）的情况，还要附上一个 `COMPOSITION_STRUCTURE:` 块——一份保护隐私的结构剖析（元素普查 + 属性是否存在 + timeline 形状），让维护者无需 composition 的 ZIP 就能与已知的 bug 家族做模式匹配。agent 通过 composition-census 辅助工具自动填写它；人类用户不用手动填。如果问题没有再次复现，要说明这一点，并且仍然附上最后一次失败的命令和日志。只有在征得同意后才用 `--file-issue`：它会把一个最小复现发布到公开 URL。要求的复现包格式和隐私警告见 `references/preview-render.md`。

另外还有两种报告，它们是只带 `--comment`、不带 `--rating` 的反馈，所以绝不会计入评分指标。除非遥测已禁用或用户选择了退出，都要按同样的隐私规则发送：

- **缺失的功能。** 每当对方要求 HyperFrames 或宿主应用做不到、或只能靠变通办法做到的事情时，每个要求发送一份报告：`npx hyperframes feedback --comment "MISSING FEATURE: <what the person asked for, in their words, with names, clients, figures and paths left out> | WORKAROUND: <what you did instead, or none>"`。报告针对的是他们想要的能力，绝不涉及他们的内容或任何隐私信息。一无所获的 catalog 搜索改走 `--search-miss`。
- **宿主应用。** 设置了 `HYPERFRAMES_CLIENT` 时，说明 CLI 正运行在某个宿主应用内。当这个应用本身碍事时（某个面板、按钮、预览或导出行为异常），带上复现包发送 `npx hyperframes feedback --comment "HOST APP: <what happened>"`。

## 运行命令前先读对应的参考文档

下面这些参考文档和所属 skill 是强制性的命令契约，不是可选的背景读物。运行表中的某个命令之前，先读它对应的那一行。

| 需求 | 参考文档 |
| --- | --- |
| `init`、`capture`、`skills` | `references/init-and-scaffold.md` |
| `lint`、`check`、motion sidecar、`snapshot` | `references/lint-validate-inspect.md` |
| `compare`、`grade-compare`、变量驱动的 `render --batch` | `references/compare-and-batch.md` |
| 为已有项目的 Studio 节拍网格运行 `beats` | `references/beats.md` |
| `preview`、`play`、`render`、`publish`、Studio 上下文、反馈 | `references/preview-render.md` |
| `doctor`、浏览器管理 | `references/doctor-browser.md` |
| `auth`、HeyGen 托管云渲染和模板变量 | `references/cloud.md` |
| AWS Lambda 部署与渲染 | `references/lambda.md` |
| Google Cloud Run 部署与渲染 | `references/cloudrun.md` |
| `info`、`upgrade`、`compositions`、`timeline`、`docs`、`benchmark`、遥测、媒体预处理 | `references/upgrade-info-misc.md` |

关于 composition 变量，还要读 `/hyperframes-core` → `references/variables-and-media.md`。`hyperframes add` 和 `hyperframes catalog` 用 `/hyperframes-registry`。运行 `hyperframes present` 之前读 `/slideshow`；运行 `hyperframes keyframes` 之前读 `/hyperframes-keyframes`。关于 TTS、转写、字幕或背景移除的选择，用 `/media-use`。

这些专用命令刻意交由各自所属的工作流来记录：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
npx hyperframes media-treatment --capabilities
npx hyperframes figma asset KEY:10-20
```

`present` 提供一个可导航的演示文稿，带演讲者端与观众端的同步。`beats` 是 `references/beats.md` 中定义的独立 Studio 节拍网格工具。`keyframes` 呈现 seek 安全的动画和运动路径诊断。`media-treatment` 用于发现、应用和清除本地素材画面上的确定性外观处理——先用 `--capabilities` 看总览，再用 `--capability <name>` 看某一类；brief 要的是哪种处理由 `/media-use` 决定。`figma` 通过 REST API 导入，提供 `asset`、`tokens` 和 `component` 子命令，需要 `FIGMA_TOKEN`；动效和 shader 的导入没有 REST 端点，只能由 agent 完成，所以由 `/figma` 负责。

## 你不应运行的命令

`hyperframes --help` 中有两项不属于创作循环，去用它们只会白白浪费一轮：

- `events` 是 skill 用来上报其**自身**调用的遥测端点，最好由随 skill 打包的脚本调用。无论你传什么，它都会发出一个匿名事件并以 0 退出。它不是读回遥测数据的途径，agent 没有理由手动调用它。
- `validate`、`inspect` 和 `layout` 是为旧脚本保留的已弃用别名。`check` 才是持续维护的那个，本 skill 中的每份参考文档都以它为前提。

## 剩余的 harness 用量

在视频工作流开始时运行 `npx hyperframes usage --json`，并在各个里程碑处（如完成草稿后、渲染前）再运行一次。交接时新读的一次可以当作开始时的读数。用 `--harness claude-code`、`--harness codex` 或 `--harness grok` 显式选择。

已知结果包含 `status: "known"`、`harness`、`planTier`、`session` 和 `weekly`。每个可用的窗口包含 `usedPercent`、`remainingPercent` 和 `resetsAt`；不可用的窗口为 `null`。`planTier` 在可用时是可读的订阅档位，否则为 `null`。Claude Code 报告其共享的五小时窗口和每周窗口。Codex 在可用时报告其共享的会话窗口和每周窗口。Grok 报告其包含的每周额度，并且 `session: null`。

未知结果包含 `status: "unknown"` 和一个不含 token 的 `reason`。登录信息缺失、过期、不受支持、有歧义或无法读取，以及提供方响应不可用时，都返回 unknown。如实报告 unknown 状态，不要猜测额度。该命令读取现有凭据，不会刷新或改写它们，也不发出任何 token 或遥测。用量只是一个快照；它不会预留额度，也不估算下一个视频的成本。范围和工作流的选择交给用户决定。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/beats.md](references/beats.md) —— 生成项目的节拍网格
- [references/cloud.md](references/cloud.md) —— cloud —— HeyGen 托管渲染（零基础设施）
- [references/cloudrun.md](references/cloudrun.md) —— 在 Google Cloud 上用 Cloud Run 渲染
- [references/compare-and-batch.md](references/compare-and-batch.md) —— 对比与批量渲染
- [references/doctor-browser.md](references/doctor-browser.md) —— doctor、browser
- [references/init-and-scaffold.md](references/init-and-scaffold.md) —— init、capture、skills
- [references/lambda.md](references/lambda.md) —— 在 AWS 上用 Lambda 渲染
- [references/lint-validate-inspect.md](references/lint-validate-inspect.md) —— lint、check、snapshot
- [references/preview-render.md](references/preview-render.md) —— preview、play、render、publish
- [references/upgrade-info-misc.md](references/upgrade-info-misc.md) —— info、upgrade、compositions、timeline、docs、benchmark、telemetry、素材预处理
