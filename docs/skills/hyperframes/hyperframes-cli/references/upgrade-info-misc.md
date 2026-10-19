<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/upgrade-info-misc.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# info、upgrade、compositions、timeline、docs、benchmark、telemetry、素材预处理

不属于主开发循环的那些命令的综合参考文档。

## info

```bash
npx hyperframes info                   # project metadata
npx hyperframes info ./my-video        # specific project
npx hyperframes info --json
```

打印**项目**元数据：名称、分辨率、时长、按类型统计的元素数量、track 数量以及项目总大小。它是项目层面的——不是环境层面的。要检查环境健康状况，用 `doctor`。

## upgrade

```bash
npx hyperframes upgrade                # check + interactive prompt
npx hyperframes upgrade --check        # check and exit, no prompt (agent-friendly)
npx hyperframes upgrade --check --json # machine-readable: current / latest / updateAvailable
npx hyperframes upgrade --yes          # print upgrade commands without prompting
```

把已安装的 CLI 版本与 npm 上的最新版本进行比较。

`--project [dir]` 升级的是**某个项目**中固定了版本的脚本，而不是全局安装：它会把 `<dir>/package.json`（默认是当前工作目录）中的每一处 `npx …hyperframes@<version>…` 改写为 npm 最新版本。始终以不固定版本的方式调用它（`npx hyperframes@latest upgrade --project`）——否则，用旧版 CLI 搭建的项目会一直停在旧版本上。`--project . --check` 只报告差异而不写入；加 `--json` 可得到 `{ changed, from, to, path }`。只要 `--project` 后面还跟着别的参数，就显式传入目录——在较旧的版本中，裸的 `--project` 会把下一个参数当作它的目录值吃掉。

## timeline

```bash
npx hyperframes timeline [project-dir]          # tracks and clips as a table with bars
npx hyperframes timeline [project-dir] --json
```

当你需要知道 timeline 上有什么时——有哪些 clip、它们何时开始和结束、播放什么、音量多大——用 `timeline`，而不是去打开 `index.html` 和每一个 `data-composition-src` 文件。它以静态方式读取项目文件（不用浏览器）。

文本输出先是 `timeline <N>s`，然后每种 track 类型（`video`、`graphics`、`captions`、`audio`）各一块，每块中该类型的每个 clip 占一行，按绝对起点排序：

```
graphics (2: 1 top-level, 1 nested)
  |██████                                  | sec-connector 0-6.7s src=compositions/connector-morph.html
  |██████████████                          | box 15.67-17.99s (local 0-2.32s) nested in sec-connector compositions/connector-morph.html
audio (1)
  | █                                      | vo 1.6-3.6s src=vo.mp3 vol=0.5 group=vo volume[0:0.2 2:1]
```

- 时间条用 40 列表示整条 timeline。时间单位是秒。
- `src=`、`vol=`、`rate=`（播放速率，仅在不为 1 时显示）、`group=`（音频组）和 `<target>[t:v ...]`（自动化通道上的点，`t` 是从 clip 起点算起的秒数）只在 clip 带有它们时才出现。
- 标题行统计该类型的所有 clip，包括嵌套的：`video (6: 2 top-level, 4 nested)`。列表按绝对时间排序，所以第 N 行就是主 timeline 上该类型的第 N 个 clip。sub-composition 内部的 clip 会先打印它的绝对起止时间，然后是 `(local <start>-<end>s)`（在那个 sub-composition 内部的时间），再然后是 `nested in <host row id> <file that declares it>`。只读取一层嵌套：sub-composition 内部的 sub-composition 会列为一行，标注 `children=unread`，其内部的 clip 不计入。
- 没有 `data-duration`/`data-end` 时，媒体行仍会得到一个解析出的时长，并注明来源：`duration=media` 表示由 ffprobe 测量了源文件（已应用播放起点和速率）；`duration=default` 表示某个 `img` 用了 3 秒默认值；`duration=inferred` 表示某个 composition 宿主对其子项求和得出；`pending: <reason>`（点状时间条，`duration` 为 0）表示无法探测源文件（文件缺失、远程 `src`、ffprobe 错误）。没有什么可解析的非媒体叶节点不打印来源。
- `lanes unreadable: ...` 表示该 clip 的 `data-automation` 或 `data-fx-chain` 无法解析；修正这个属性。

`--json` 打印 `{ timeline: { duration, tracks: [{ kind, rows: [...] }] } }`。一个 track 的 `rows` 是该类型的所有 clip，包括嵌套的，按 `absStart` 排序；要读全部的行，绝不要只读顶层。每一行有 `id`、`kind`（标签名）、`trackKind`、`start`、`duration`、`end`（相对于该行自身所在文件的局部时间）、**`absStart`、`absEnd`、`file`**（主 timeline 上的时间，以及声明该 clip 的、相对于项目的文件路径——跨嵌套层级比较 clip 时用这些，而不是 `start`/`end`）、`trackIndex`、`src`、`sourceFile`、`volume`、`lanes`、`playbackRate`、`audioGroup`、`durationAuthored`、**`durationSource`**（`"authored" | "media" | "default" | "inner" | "pending"`，没有什么可解析的非媒体叶节点为 `null`）、**`pendingReason`**（为什么没能解析出来；除非 `durationSource` 为 `"pending"`，否则为 `null`）、`laneError`、**`index`**（该行在其类型的 `rows` 中的位置；是位置，不是 id）、**`nested`**（声明在某个 sub-composition 内部）、**`host`**（承载这个嵌套 clip 的那一行的纯 id，否则为 `null`）、**`hostRow`**（该宿主行的 `{kind, index}`），以及 `children`（指向该 sub-composition 内 clip 的 `{kind, index}` 指针，只有一层；每个 clip 本身都已是其类型 `rows` 中完整的一行，所以不需要顺着指针去找）。

### 查询用单行命令（jq；没有 jq 时用 node 兜底）

```bash
TL=$(npx hyperframes timeline --json)
# 1. what plays at absolute time T=12.5
jq --argjson t 12.5 '[.timeline.tracks[].rows[] | select(.absStart<=$t and .absEnd>$t)]' <<<"$TL"
node -e 'const t=12.5,j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.forEach(tr=>tr.rows.forEach(x=>{if(x.absStart<=t&&x.absEnd>t)console.log(x.id,x.file)}))' <<<"$TL"
# 2. find a clip by id or src -> file, track, absStart, absEnd
jq --arg q tsfx-pet2 '[.timeline.tracks[].rows[] | select(.id==$q or .src==$q)] | .[] | {file,trackKind,absStart,absEnd}' <<<"$TL"
node -e 'const q="tsfx-pet2",j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.forEach(tr=>tr.rows.forEach(x=>{if(x.id===q||x.src===q)console.log(x.file,x.trackKind,x.absStart,x.absEnd)}))' <<<"$TL"
# 3. every clip of one kind, nested included, in absolute order
jq --arg k video '.timeline.tracks[] | select(.kind==$k).rows[] | {id,absStart,absEnd}' <<<"$TL"
node -e 'const k="video",j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.find(t=>t.kind===k).rows.forEach(r=>console.log(r.id,r.absStart,r.absEnd))' <<<"$TL"
# 4. gaps and overlaps within a kind (positive = gap, negative = overlap)
jq --arg k video '(.timeline.tracks[] | select(.kind==$k).rows) as $r|[range(0;($r|length)-1)|{a:$r[.].id,b:$r[.+1].id,delta:($r[.+1].absStart-$r[.].absEnd)}]' <<<"$TL"
node -e 'const k="video",j=JSON.parse(require("fs").readFileSync(0,"utf8"));const r=j.timeline.tracks.find(t=>t.kind===k).rows;for(let i=0;i<r.length-1;i++)console.log(r[i].id,r[i+1].id,r[i+1].absStart-r[i].absEnd)' <<<"$TL"
# 5. the Nth clip of a kind by absolute start (N=2)
jq --arg k video --argjson n 2 '.timeline.tracks[] | select(.kind==$k).rows[$n-1] | {index,id,absStart,file,nested}' <<<"$TL"
node -e 'const k="video",n=2,j=JSON.parse(require("fs").readFileSync(0,"utf8"));const r=j.timeline.tracks.find(t=>t.kind===k).rows[n-1];console.log(r.index,r.id,r.absStart,r.file)' <<<"$TL"
```

## compositions、docs

```bash
npx hyperframes compositions           # list compositions in project
npx hyperframes compositions --json
npx hyperframes docs                   # list available topics
npx hyperframes docs rendering         # print one topic inline in the terminal
```

`compositions` 列出项目中的每一个 `data-composition-id`（包括 sub-composition），附带时长、分辨率和元素数量。

`docs` **在终端中**直接打印文档——它不会打开浏览器。主题有：`data-attributes`、`examples`、`rendering`、`gsap`、`troubleshooting`、`compositions`。不带主题运行可以查看列表。

## benchmark

```bash
npx hyperframes benchmark              # run the preset matrix in current project
npx hyperframes benchmark ./my-video   # specific project
npx hyperframes benchmark --runs 5     # repeat each config N times (default 3)
npx hyperframes benchmark --json
```

用 5 种预设配置渲染项目——`30fps draft 2w`、`30fps standard 2w`、`30fps high 2w`、`30fps standard 4w`、`60fps standard 4w`——并打印渲染速度和输出文件大小的对比。用它找出在你的机器上最快且可接受的 preset。它不是带分阶段耗时明细的单次渲染。

## telemetry

```bash
npx hyperframes telemetry status      # show telemetry state
npx hyperframes telemetry disable     # disable anonymous usage telemetry
npx hyperframes telemetry enable      # re-enable telemetry
```

遥测只包含匿名的使用计数器。如果比起子命令更喜欢用环境变量控制，可以用 `HYPERFRAMES_NO_TELEMETRY=1` 全局禁用。

事件中包含两个指纹属性，用于区分托管沙箱中的运行和真实的笔记本电脑——不含 PII，不含环境变量的**值**，只做是否存在的检查：

- **`sandbox_runtime`**：`gvisor` / `firecracker` / `docker` / `kvm` / `wsl` / `null`。gVisor 通过内核字符串 + `/proc/version` 判断。Firecracker 通过 `/dev/vsock` + DMI sys_vendor 判断。Docker 通过 `/.dockerenv` + cgroup 判断。
- **`agent_runtime`**：`claude_code` / `codex` / `cursor` / `copilot_agent` / `jules` / `replit` / `devin` / `aider` / `gemini_cli` / `hermes` / `openclaw` / `null`。通过各厂商众所周知的环境变量是否存在来检测；从不读取这些变量的值本身。
- **`client`**：只有当某个应用用 `HYPERFRAMES_CLIENT` 标签（`<app>/<version>/<channel>`）启动 CLI 时才会设置，当它是一个简短的 slug 时按原样发送。

## 素材预处理

```bash
npx hyperframes tts
npx hyperframes transcribe
npx hyperframes remove-background
```

这些命令产出素材（旁白音频、逐词转写稿、透明视频），然后放进 composition 中使用。每个命令在首次运行时都可能下载自己的模型。

关于语音选择、Whisper 模型规则、输出格式的选择，以及 TTS → 转写稿 → 字幕这条链路，调用 `media-use` skill。本 skill 只专注于开发循环。

## 剩余的 harness 用量

在视频工作流开始时运行 `npx hyperframes usage --json`，并在各个里程碑处（如完成草稿后、渲染前）再运行一次。交接时新读的一次可以当作开始时的读数。用 `--harness claude-code`、`--harness codex` 或 `--harness grok` 显式选择。

已知结果包含 `status: "known"`、`harness`、`planTier`、`session` 和 `weekly`。每个可用的窗口包含 `usedPercent`、`remainingPercent` 和 `resetsAt`；不可用的窗口为 `null`。`planTier` 在可用时是可读的订阅档位，否则为 `null`。Claude Code 报告其共享的五小时窗口和每周窗口。Codex 在可用时报告其共享的会话窗口和每周窗口。Grok 报告其包含的每周额度，并且 `session: null`。

未知结果包含 `status: "unknown"` 和一个不含 token 的 `reason`。登录信息缺失、过期、不受支持、有歧义或无法读取，以及提供方响应不可用时，都返回 unknown。如实报告 unknown 状态，不要猜测额度。该命令读取现有凭据，不会刷新或改写它们，也不发出任何 token 或遥测。用量只是一个快照；它不会预留额度，也不估算下一个视频的成本。范围和工作流的选择交给用户决定。
