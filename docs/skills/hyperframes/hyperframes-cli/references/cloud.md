# cloud —— HeyGen 托管渲染（零基础设施）

`hyperframes cloud render` 在 HeyGen 的托管云上渲染 composition。CLI 会把项目打成 zip、上传、在 HeyGen 的基础设施（Chromium + FFmpeg）上运行渲染，然后下载成品视频。无需部署任何东西，也不用管理 Chrome/FFmpeg/AWS；按 credit 付费。

```bash
npx hyperframes auth login            # one-time sign-in
npx hyperframes cloud render          # zip, upload, render, download
```

## 何时用托管云、Lambda、Cloud Run 或本地

- **`hyperframes render`**（本地）：迭代循环最快，编写过程中使用。
- **`hyperframes cloud render`**：零基础设施。由 HeyGen 运行渲染，你按 credit 付费。当你不想管理 Chrome/FFmpeg/AWS 时，这是「在云端渲染」的默认答案。
- **`hyperframes lambda render`**：自带 AWS 的分布式渲染，按分块并行。只有当你已经在 AWS 上有投入时才值得用（见 `lambda.md`）。
- **`hyperframes cloudrun render`**：自带 GCP、通过 Cloud Run 和 Workflows 进行的分布式渲染。只有在明确要求由自己掌控 GCP 时才使用（见 `cloudrun.md`）。

## 认证

云渲染需要一个 HeyGen 凭据，存放在 `~/.heygen/credentials`（`0600`），并与 `heygen` CLI[^heygen-cli] 共用：用其中一个登录，另一个就会沿用这个会话。

```bash
npx hyperframes auth login              # OAuth 2.0 + PKCE, opens the browser
npx hyperframes auth login --api-key    # CI/headless: hidden prompt, or pipe: echo "$HEYGEN_API_KEY" | ... --api-key
npx hyperframes auth status             # active credential source, identity, billing snapshot
                                        #   exit 0 = signed in and verified; exit 1 = not signed in,
                                        #   or the credential was rejected — signed-out exit 1 is the
                                        #   normal offline state (scripts: `auth status || echo offline`),
                                        #   not a command failure
npx hyperframes auth refresh            # force-refresh an OAuth token before a long job
npx hyperframes auth logout             # clear the stored credential
```

凭据的解析顺序（先匹配者生效）：`HEYGEN_API_KEY`，然后是 `HYPERFRAMES_API_KEY`，然后是 `HEYGEN_ACCESS_TOKEN`（由宿主应用注入的 OAuth token；绝不会被刷新或保存），最后是 `~/.heygen/credentials`。用 `HEYGEN_API_URL` 指向另一个后端（默认 `https://api.heygen.com`）。

## 渲染流水线

`cloud render` 端到端地执行以下步骤：

1. **解析项目**：一个本地目录（默认 `.`），或者用 `--asset-id` / `--url` 跳过上传。
2. **自动检测宽高比**：取自入口 HTML 的 `data-width`/`data-height`。
3. **打 zip**：打包项目（与 `hyperframes publish` 使用同一套忽略规则，包括 `.hyperframesignore`）。
4. **上传**：通过直传 S3 的素材流程上传 zip，得到一个 `asset_id`。
5. **提交**：把渲染提交到 `POST /v3/hyperframes/renders`，得到一个 `render_id`。
6. **轮询**：轮询 `GET /v3/hyperframes/renders/{id}`，直到完成或失败（用 `--no-wait` 跳过）。
7. **下载**：把签名的视频 URL 下载到磁盘。

## 归档大小与 `.hyperframesignore`

直传上限是 200 MB。HyperFrames 会自动排除根目录下的 `renders/` 和 `snapshots/`，以及它已有的开发类排除项，如 `.git`、`node_modules`、`dist`、`.next`、`coverage` 和点文件。当还有其他生成的或中间产物素材在渲染时用不到时，把项目专属的、gitignore 风格的规则加到 `<project>/.hyperframesignore`。同样的规则也会影响 `hyperframes publish`。

不认证、不上传、不花 credit、也不启动渲染，就能检查确切的归档内容：

```bash
npx hyperframes cloud render <project> --dry-run --json
```

结果会报告压缩后的 `size_bytes`、`file_count`、200 MB 上限，以及被包含的最大的十个文件。

当云上传报告大小超限错误时，agent 必须按以下流程处理：

1. 运行 dry-run 命令，检查被包含的最大文件和目录。
2. 先把明显是生成产物的东西归类：旧的渲染结果、额外的 snapshot/contact-sheet 目录、缓存、导出的预览，以及只用于制作最终素材的源媒体。
3. 在排除其他任何东西之前，先在每个 HTML、CSS 和 JavaScript 入口中搜索 `src`、`href`、`url()`、`data-composition-src`、JavaScript 字符串、manifest 和变量驱动的路径。
4. 保留 `.hyperframesignore` 中已有的注释和规则。只添加经过核实确实不需要的、范围最窄的根相对路径；优先用精确的目录或文件，而不是宽泛的通配符。
5. 绝不要仅仅因为 `index.html`、选中的 composition、挂载的 sub-composition、字体、图片、音频、视频、脚本或 manifest 很大就忽略它们。绝不要忽略整个 `assets/`。
6. 重新运行 dry-run，直到归档低于上限，然后运行 `npx hyperframes check`。记住 `check` 看到的是源目录，所以它无法证明一个动态计算出来的素材路径仍留在过滤后的归档里；上面的引用审查仍然是必需的。

示例：

```gitignore
# Additional generated verification passes
/snapshots2/
/snapshots3/

# Master used only to produce the final background clips
/assets/bg-pattern.mp4
```

规则支持注释、glob 和取反。后面的规则可以覆盖默认值，例如当该目录确实有意存放渲染输入时，用 `!/snapshots/`。

## 渲染选项

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `--fps` | `30` | 每秒帧数，1–240。 |
| `--quality` | `standard` | `draft`、`standard` 或 `high`。 |
| `--format` | `mp4` | `mp4`、`webm` 或 `mov`（webm/mov 带 alpha 通道）。 |
| `--resolution` | `1080p` | `1080p` 或 `4k`（4k 按 1.5× 计费）。 |
| `--aspect-ratio` | 自动 | `16:9`、`9:16` 或 `1:1`。本地项目自动取自 `data-width`/`data-height`；`--asset-id`/`--url` 默认为 `16:9`。 |
| `--composition` / `-c` | `index.html` | zip 内的入口 HTML 文件。 |
| `--output` / `-o` | `renders/<render_id>.<ext>` | 本地下载目标位置。 |
| `--dry-run` | 关闭 | 构建并检查本地项目的 zip，不认证、不上传、不渲染。 |

```bash
npx hyperframes cloud render . \
  --composition compositions/intro.html \
  --output ./renders/intro.mp4

npx hyperframes cloud render --quality high --fps 60
```

`--resolution 4k` 不能与 `--format webm`/`mov` 组合使用：4k 超采样路径没有 alpha 通道。要么以 mp4 渲染 4k，要么以原生分辨率渲染 alpha。

## 模板与变量

云渲染支持 [composition 变量](../../hyperframes-core/references/variables-and-media.md#variables)：在 composition 上声明 `data-composition-variables`，然后在渲染时填入。

```bash
npx hyperframes cloud render --variables '{"title":"Q4 Recap","theme":"dark"}'
npx hyperframes cloud render --variables-file ./vars.json
npx hyperframes cloud render --variables '{"title":"Q4 Recap"}' --strict-variables
```

对于**本地项目**，CLI 会在上传*之前*按声明的 schema 校验 `--variables`。对于 `--asset-id`/`--url`，schema 存在服务器端，所以不匹配会以 `hyperframes_project_invalid` API 错误的形式暴露出来。

**上传一次，多次重新渲染**是惯用的模板循环：先渲染一个本地项目拿到它的 `asset_id`，然后针对这个素材用新的值重新提交（不重新打 zip，也不重新上传）。

```bash
npx hyperframes cloud render ./card-template                              # note the asset_id printed on upload
npx hyperframes cloud render --asset-id asst_abc123 --variables '{"name":"Ada"}'
npx hyperframes cloud render --asset-id asst_abc123 --variables '{"name":"Linus"}'
```

对于大批量的个性化渲染，两种自行管理的路径都提供 JSONL 扇出：AWS Lambda（`lambda.md`）和 Google Cloud Run（`cloudrun.md`）。完整的变量 schema（类型、声明式绑定、sub-composition 覆盖、优先级）在 `hyperframes-core` skill 中。

## 发出即不管与 webhook

默认情况下，CLI 会阻塞、轮询并下载。把 `--no-wait`（提交后只带着 `render_id` 退出）与 `--callback-url`（在终止状态时触发的 HTTPS webhook）组合起来，就能实现真正的发出即不管（fire-and-forget）：

```bash
npx hyperframes cloud render --callback-url https://example.com/hf-hook --no-wait
#    Poll later with: hyperframes cloud get hfr_def456
```

| 参数 | 含义 |
| --- | --- |
| `--no-wait` | 提交后立即退出；打印 `render_id`。 |
| `--callback-url` | 渲染终止时触发的 HTTPS webhook。 |
| `--callback-id` | 不透明的追踪 ID，会原样回显在 webhook 载荷中。 |
| `--poll-interval` | 轮询间隔，单位为秒（默认 `10`）。 |
| `--max-wait` | 最长轮询时长，单位为分钟（默认 `60`）。 |

## 管理渲染

```bash
npx hyperframes cloud list                 # recent renders (--limit, --token, --all)
npx hyperframes cloud get hfr_def456       # full detail + short-lived signed video_url
npx hyperframes cloud delete hfr_def456    # soft-delete (--no-confirm to skip the prompt)
```

`video_url` 和 `thumbnail_url` 是短时效的预签名 URL，所以要用 `cloud get` 重新获取，而不是缓存它们。

## 安全重试

CLI 遇到 `401` 时会透明地重试：强制刷新 OAuth token 后重放请求。这对读取操作无害，但 zip 上传（`POST /v3/assets`）**不是**幂等的：盲目重试会创建一个重复的素材，并计费两次。传入 `--idempotency-key`，让重试变得安全：

```bash
npx hyperframes cloud render . --idempotency-key "$(uuidgen)"
```

这个 key 会同时转发给上传和提交（服务器按端点划分幂等范围，所以复用同一个值是安全的）。可以用 `[A-Za-z0-9_:.-]` 范围内的任意不透明字符串，长度 1–255 个字符。

完整的参数参考：文档 `/deploy/cloud` 和 `/packages/cli#hyperframes-cloud`。

[^heygen-cli]: [`heygen` CLI](https://github.com/heygen-com/heygen-cli)，2026-10-15 读。
