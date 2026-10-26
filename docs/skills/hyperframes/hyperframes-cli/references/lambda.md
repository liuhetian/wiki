# 在 AWS 上用 Lambda 渲染

当用户明确想要自行管理的 AWS 基础设施，或者需要分布式渲染时，使用 `hyperframes lambda`。它封装了 `@hyperframes/aws-lambda` 和 AWS SAM。

## 目录

- [选择 Lambda 还是本地渲染](#choose-lambda-or-local-rendering)
- [前置条件](#prerequisites)
- [部署](#deploy)
- [上传可复用的 site](#upload-a-reusable-site)
- [渲染单个 composition](#render-one-composition)
- [渲染 JSONL 批量任务](#render-a-jsonl-batch)
- [查看进度](#inspect-progress)
- [销毁 stack](#destroy-the-stack)
- [IAM 策略](#iam-policies)
- [状态、成本与清理](#state-cost-and-cleanup)

基本的生命周期是：

```bash
npx hyperframes lambda deploy
npx hyperframes lambda render ./my-project --width 1920 --height 1080 --wait
npx hyperframes lambda destroy
```

## 选择 Lambda 还是本地渲染 { #choose-lambda-or-local-rendering }

- **本地 `render`** —— 开发循环中的迭代、单台主机、1080p 下几分钟以内的任何内容。
- **`lambda render`** —— 长视频、4K、大规模并行批量任务，或任何会让本地 Chrome 超时 / 耗尽内存的情况。按调用付费，没有闲置成本。

对于一次性的短渲染，Lambda 不值得付出部署开销。

## 前置条件 { #prerequisites }

- 已配置 AWS 凭据（环境变量、`~/.aws/credentials`、SSO 或 IMDS）。
- `PATH` 中有 AWS SAM CLI。
- `PATH` 中有 `bun`（用于构建 Lambda handler 的 ZIP）。

## 部署 { #deploy }

```bash
npx hyperframes lambda deploy \
  --stack-name=hyperframes-prod \
  --region=us-east-1 \
  --concurrency=8 \
  --memory=10240
```

构建 `packages/aws-lambda/dist/handler.zip`，并用 SAM 部署 stack（Lambda + Step Functions + S3 + IAM）。它是幂等的——在同一个 `--stack-name` 上重新运行，如果没有任何变化就什么也不做。会写出 `<cwd>/.hyperframes/lambda-stack-<name>.json`，这样后续的子命令就不需要调用 `describe-stacks`。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `--stack-name` | `hyperframes-default` | CloudFormation stack 名称 |
| `--region` | `AWS_REGION` 环境变量或 `us-east-1` | AWS 区域 |
| `--profile` | `AWS_PROFILE` 环境变量 | 具名的 AWS 凭据 profile |
| `--concurrency` | `8` | Lambda 预留并发 |
| `--chrome-source` | `sparticuz` | `sparticuz` 或 `chrome-headless-shell` |
| `--memory` | `10240` | Lambda 内存，单位 MB |
| `--skip-build` | 关闭 | 复用已有的 `handler.zip` |

## 上传可复用的 site { #upload-a-reusable-site }

```bash
npx hyperframes lambda sites create ./my-project
# → siteId: abc1234deadbeef0  (stable across re-runs of the same tree)

npx hyperframes lambda render ./my-project --site-id=abc1234deadbeef0 ...
```

把 `<projectDir>` 打成 tar 包并以按内容寻址的 key 上传到 S3。返回一个稳定的、可复用的 `siteId`——对同一棵目录树重新渲染时会跳过上传。

## 渲染单个 composition { #render-one-composition }

```bash
npx hyperframes lambda render ./my-project \
  --width 1920 --height 1080 --fps 30 --format mp4 \
  --chunk-size 240 --max-parallel-chunks 16 \
  --wait
```

启动一次 Step Functions 执行。除非设置了 `--wait`，否则立即返回一个 `renderId`；设置了 `--wait` 时，CLI 会阻塞直到完成，并以流式输出逐个分块的进度行。加 `--json` 可得到机器可解析的输出。

| 参数 | 说明 |
| --- | --- |
| `--width` / `--height` | 输出尺寸，单位像素 |
| `--output-resolution` | 超采样 preset（启用 Chrome 的 `deviceScaleFactor`）—— `landscape` / `landscape-4k` / `portrait` / `portrait-4k` / `square` / `square-4k`，以及别名（`1080p`、`4k`、`uhd`、`hd`、`1080p-portrait`、`4k-portrait`、`1080p-square`、`4k-square`）。用它把按 1080p 编写的 composition 渲染成 4K，而无需重新布局——见下面的易踩坑点。 |
| `--fps` | `24` / `30` / `60` |
| `--format` | `mp4` / `mov` / `png-sequence` / `webm`（默认 `mp4`） |
| `--codec` | `h264` / `h265`（仅 mp4） |
| `--quality` | `draft` / `standard` / `high` |
| `--chunk-size` | 每个分块的帧数（默认 `240`） |
| `--max-parallel-chunks` | 最大并发分块数（默认 `16`） |
| `--target-chunk-frames` | 限定每个分块的帧数上限，让规划器在并行上限内增加分块 |
| `--site-id` | 复用已有的 site（跳过上传） |
| `--execution-name` | 明确指定的 Step Functions 执行名 |
| `--output-key` | 明确指定的最终 S3 对象 key |
| `--variables` | 内联的 JSON 对象，包含 composition 变量的值 |
| `--variables-file` | 包含一个 composition 变量对象的 JSON 文件 |
| `--strict-variables` | 当提供的变量未声明或类型错误时失败 |
| `--wait` | 阻塞直到完成，流式输出进度 |
| `--wait-interval-ms` | 等待期间的轮询间隔（默认 `5000`） |
| `--json` | 机器可解析的进度快照 |

**`--width` / `--height` 易踩坑点。** 对一个 `data-width="1920"` 的 composition 设置 `--width 3840 --height 2160`，会悄无声息地产出 1080p——runtime 按 composition 编写时的尺寸对页面布局，CLI 参数在布局上会被忽略。要真正以 4K 输出，用 `--output-resolution 4k`（通过 `deviceScaleFactor` 超采样）。现在当 CLI 尺寸与 composition 的 `data-width` / `data-height` 不一致且未设置 `--output-resolution` 时，CLI 会打印一条警告；当开启 `--json` 或者 `index.html` 不在磁盘上时（`--site-id` 流程），这条警告会被抑制。

对于变量驱动的模板，在 composition 中声明 schema，然后传 `--variables` 或 `--variables-file` 二者之一，绝不要同时传。`--strict-variables` 会在任何渲染开始之前检查本地项目的输入。另请阅读 [`variables-and-media.md`](../../hyperframes-core/references/variables-and-media.md#variables)。

## 渲染 JSONL 批量任务 { #render-a-jsonl-batch }

用 `render-batch` 把一个模板上传一次，并为每个非空的 JSONL 行启动一次 Step Functions 执行：

```bash
npx hyperframes lambda render-batch ./template \
  --batch ./users.jsonl \
  --width 1920 --height 1080 \
  --max-concurrent 10 \
  --strict-variables \
  --json
```

每一行都必须是一个带有非空 `outputKey` 的对象。选用互不相同的 key，以免输出相互覆盖。`variables` 和 `executionName` 是可选的：

```json
{
  "outputKey": "renders/alice.mp4",
  "variables": { "name": "Alice" },
  "executionName": "alice-video"
}
```

批量规则：

- 项目只上传一次，除非用 `--site-id` 复用之前的上传。
- `--max-concurrent` 默认为 `50`，限制同时进行中的渲染执行数。`--max-parallel-chunks` 则单独限制每次渲染内部的分块并发。
- `--strict-variables` 会检查每个条目，报告所有变量问题，并在调用 AWS 之前中止。
- `--dry-run` 不做任何上传或 AWS 渲染调用。manifest 的每一行都会变成 `would-invoke`。
- 输出的 manifest 保留输入顺序，并记录 `inputLine`、`outputKey`、`executionArn` 和 `status`（`started`、`would-invoke` 或 `failed-to-start`），适用时还会记录错误。
- 单个条目的启动失败不会掩盖其他行。在人类可读输出模式下，只要有一行启动失败，命令就以非零退出。在 `--json` 模式下，当前的 CLI 会打印 manifest 并以零退出，所以要根据每一行的 `status` 来做闸门判断，而不能只看进程退出码。派发成功并不等于渲染完成；用 `progress` 逐个检查每次执行。

## 查看进度 { #inspect-progress }

```bash
npx hyperframes lambda progress hf-render-abcd1234
npx hyperframes lambda progress arn:aws:states:us-east-1:...:execution:...
```

打印一份快照——总体百分比、已渲染的帧数、Lambda 调用次数、累计成本以及任何错误。接受一个裸的 `renderId`（根据 stack 的状态机 ARN 解析）或完整的 SFN 执行 ARN。

## 销毁 stack { #destroy-the-stack }

```bash
npx hyperframes lambda destroy
```

调用 `sam delete --no-prompts` 并删除本地状态文件。**渲染用的 S3 存储桶配置为 `Retain`**，所以它在 stack 销毁后依然存在——如果你想收回这部分存储，通过 AWS 控制台 / CLI 清空并删除它。

### 不可重试的错误

这是一部分会被 Step Functions 状态机直接短路、而不是走完它 4 次 × 15 分钟重试预算的失败。`progress` 会立即用错误类名把它们显示出来；看到这类错误时，不要盲目地重新发起 `lambda render`。

- **`ChromeBinaryUnavailableError`** —— `@sparticuz/chromium` 返回了空的/缺失的可执行文件路径。之前某个分块在解压到一半时遇到了 `Sandbox.Timedout`，这个热实例会一直卡死，直到执行环境被回收。补救办法：改动一个 Lambda 环境变量（强制使用新的执行环境），或者再运行一次 `lambda deploy`。这不是暂时性的渲染失败；重试只会在同一个卡死的实例上白白消耗预算。
- **`FFMPEG_VERSION_MISMATCH`** / **`PLAN_HASH_MISMATCH`** —— 规划器 / 执行器版本漂移。重新部署。

## IAM 策略 { #iam-policies }

打印或校验 CLI 所需的最小 IAM 权限。

```bash
npx hyperframes lambda policies user                                  # inline policy for an IAM user
npx hyperframes lambda policies role                                  # { TrustRelationship, InlinePolicy }
npx hyperframes lambda policies validate ./infra/iam/hf-deploy.json   # CI gate
```

`validate` 读取一份 JSON 策略文档，把其中所有 `Effect: Allow` 操作的并集（展开 `s3:*` / `s3:Get*` / `*` 通配符）与 CLI 所需的操作集合进行比对。缺失的操作会打印到 stderr；命令以非零退出。把它接入 CI，在下一次部署失败之前抓住策略漂移。

默认的操作集合刻意设得很宽（`Resource: "*"`），因为 CloudFormation 在每个使用者第一次部署时都会创建新的 ARN。如果安全要求需要，在第一次运行之后再收紧 `Resource`。

## 状态、成本与清理 { #state-cost-and-cleanup }

`hyperframes lambda` 把每个 stack 的元数据存放在 `<cwd>/.hyperframes/lambda-stack-<name>.json` 下（存储桶名称、状态机 ARN、区域）。它不是机密，但能识别出 AWS 账户。按你的工作流把它提交到仓库，或者把它加进 `.gitignore`。

- `lambda destroy` 会移除 SAM stack，但**保留 S3 存储桶**（`Retain`）。如果你想收回这部分存储，手动删除它。
- Lambda 按调用次数 + 时长计费。`progress` 会报告累计成本。
- `--concurrency` 限制并行的 Lambda 调用数——让它与你的账户配额保持一致。
- `--chunk-size` 和 `--max-parallel-chunks` 是在每个分块的开销与并行度之间做取舍；分块越大，协调开销越小；分块越小，并行越激进。
