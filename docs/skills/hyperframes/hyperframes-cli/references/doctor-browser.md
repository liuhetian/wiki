<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/doctor-browser.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# doctor、browser

环境诊断与随附 Chrome 的管理。渲染或预览失败时，先运行这些命令。

## doctor

```bash
npx hyperframes doctor
npx hyperframes doctor --json     # CI / agent output (always exit 0; gate on payload `ok`)
```

运行一组相互独立的检查，并把每一项报告为 ok/warn/fail：

- **Version** —— 已安装的 CLI 与 npm 上最新版本的对比（过时时会提示升级）
- **Node.js** —— 要求 ≥ 22
- **CPU**、**Memory**、**Disk** —— 主机资源
- **Environment** —— 会影响渲染器的环境变量
- **FFmpeg** / **FFprobe** —— 是否找到、版本、编解码器
- **Chrome** —— 随附的还是系统的、版本、路径
- **Docker** / **Docker running** —— 只有 `render --docker` 才需要
- **/dev/shm** —— 仅在容器内检查

在以下情况先运行 `doctor`：

- `render` 因 Chrome 或 FFmpeg 错误而失败。
- `preview` 能打开，但 composition 加载失败。
- 一台新机器从未运行过 HyperFrames。

常见问题：

- **缺少 FFmpeg** —— 通过 `brew install ffmpeg`（macOS）或你的包管理器安装，或者[配置已有的二进制文件](#configure-ffmpeg-without-a-package-manager)。
- **缺少随附的 Chrome** —— 运行 `npx hyperframes browser ensure`。
- **内存不足** —— 关闭其他 Chrome，减少 `--workers`，或者使用 `--quality draft`。
- **Chrome 在 agent 沙箱内一启动就退出（macOS）** —— seatbelt 类沙箱（例如 codex 的 `workspace-write`）会阻止 Chromium 的 Mach 端口引导（`MachPortRendezvous`；openai/codex#21292），所以每一种 Chrome —— 随附的、系统的或 headless shell —— 都会在启动时死掉。这是主机层面的阻断，不是 HyperFrames 或 Chrome 的安装问题：编译检查和音频仍然能通过，只是无法渲染。说明这个阻断原因，并交付已通过检查的 composition；在沙箱外渲染，或者在可用时通过 `render --docker` / 云渲染进行。**不要自己搭一个替代的光栅化器**（magick/PIL/SVG 逐帧流水线）—— 在浏览器被阻断的主机上，交付物**就是**已通过检查的 composition 加上这条阻断说明，渲染交给 `--docker`、云端或用户。一旦确认了阻断原因，立刻写出你的最终总结，要在做任何可选的兜底工作**之前**：之后的会话失败不能抹掉已完成工作的报告。

### 不用包管理器配置 FFmpeg { #configure-ffmpeg-without-a-package-manager }

从 FFmpeg 下载页[^download]获取适合你操作系统和架构的 FFmpeg 与 FFprobe 二进制文件。两者都必须可执行。不需要 Homebrew 或系统级安装就能使用它们：

```bash
export HYPERFRAMES_FFMPEG_PATH="/absolute/path/to/ffmpeg"
export HYPERFRAMES_FFPROBE_PATH="/absolute/path/to/ffprobe"
npx hyperframes doctor --json
```

在启动 HyperFrames 的那个环境中设置这两个变量。在 Windows 上，用你所用 shell 的环境变量语法把它们指向 `ffmpeg.exe` 和 `ffprobe.exe`。配置的路径优先于自动发现；配置的文件不存在时会报告为缺失。

或者，把二进制文件放到 `.hyperframes/bin/ffmpeg` 和 `.hyperframes/bin/ffprobe`（Windows 上带 `.exe`），然后在那个项目的目录中运行 HyperFrames。自动发现会先查 `PATH`，再查这个项目本地目录，所以当你需要某个特定构建时，请使用环境变量。

确认 `doctor --json` 中的 **FFmpeg** 和 **FFprobe** 条目报告 `ok: true` 以及预期的路径。如果只想用 `jq` 对这两个编码依赖起闸门作用：

```bash
npx hyperframes doctor --json | jq -e \
  '[.checks[] | select(.name == "FFmpeg" or .name == "FFprobe")] | length == 2 and all(.ok)'
```

报告顶层的 `ok` 还包括 Docker 和本地语音提供方等可选工具；这些项失败并不意味着本地渲染视频需要安装它们。Chrome 请用下面的 browser 命令单独检查。

## browser

```bash
npx hyperframes browser ensure    # find or download the pinned Chrome
npx hyperframes browser path      # print the browser executable path (for scripting)
npx hyperframes browser clear     # remove the cached Chrome download
```

管理 HyperFrames 渲染所用的 Chrome 构建。之所以固定版本，是因为不同 Chrome 版本之间的像素输出会漂移——使用随附的构建能让渲染输出在不同机器之间保持可复现。

用 `path` 把二进制路径嵌入脚本：`$(npx hyperframes browser path)`。

[^download]: [FFmpeg 下载页](https://ffmpeg.org/download.html)，2026-10-15 读。
