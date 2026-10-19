<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/cloudrun.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 在 Google Cloud 上用 Cloud Run 渲染

只有当用户明确想要自行管理的 Google Cloud 基础设施时，才使用 `hyperframes cloudrun`。它会部署 Cloud Run、Workflows 和 Cloud Storage。托管的默认方案用 `hyperframes cloud`；AWS 用 `hyperframes lambda`。

## 前置条件

- `gcloud` 已完成认证，且目标项目已启用结算。
- `PATH` 中有 Terraform 1.5 或更新版本。
- 有 Docker，或者有使用 Cloud Build 的权限。

## 生命周期

```bash
npx hyperframes cloudrun deploy --project <gcp-project> --region us-central1
npx hyperframes cloudrun sites create ./project
npx hyperframes cloudrun render ./project --width 1920 --height 1080 --wait
npx hyperframes cloudrun progress <execution-name>
npx hyperframes cloudrun destroy --project <gcp-project>
```

`deploy` 会启用所需的 Google API，构建或接收一个容器镜像，应用随附的 Terraform 模块，并把得到的资源坐标存到 `~/.hyperframes/cloudrun-state.json`。只有在基础设施需要覆盖默认值时，才使用 `--image`、`--repo`、`--cpu`、`--memory`、`--max-instances` 和 `--timeout` 等 deploy 参数。

`sites create` 会上传一个按内容寻址的项目归档，供 `render-batch` 复用；把它的 `--site-id` 传给那个命令即可跳过批量上传。单次的 `cloudrun render` 目前从项目目录解析项目，不使用 `--site-id`。两个渲染命令都要求 `--width` 和 `--height`；支持的输出格式有 `mp4`、`mov`、`png-sequence` 和 `webm`。用 `--output-resolution 4k` 可以对已编写好的 composition 做超采样，而不改变它的布局尺寸。

常用的渲染参数有 `--fps 24|30|60`、`--quality draft|standard|high`、MP4 用的 `--codec h264|h265`、`--chunk-size`、`--max-parallel-chunks`、`--target-chunk-frames`、`--render-id`、`--output-key`、`--wait` 和 `--wait-interval-ms`。需要机器可读的输出时用 `--json`。

变量驱动的单次渲染：

```bash
npx hyperframes cloudrun render ./template \
  --width 1920 --height 1080 \
  --variables-file ./alice.json \
  --strict-variables \
  --wait
```

`--variables` 和 `--variables-file` 必须且只能用其中一个。composition 一侧的契约见 [`variables-and-media.md`](../../hyperframes-core/references/variables-and-media.md#variables)。

## JSONL 批量渲染

```bash
npx hyperframes cloudrun render-batch ./template \
  --batch ./users.jsonl \
  --width 1920 --height 1080 \
  --max-concurrent 10 \
  --site-id <site-id> \
  --json
```

每个非空行都必须包含一个 `outputKey`；`variables` 是可选的：

```json
{ "outputKey": "renders/alice.mp4", "variables": { "name": "Alice" } }
```

- `--max-concurrent` 默认为 `50`，限制同时进行中的执行数。`--max-parallel-chunks` 则单独限制一次渲染内部的分块并发。
- `--dry-run` 会解析文件并打印 `would-start` 行，但不启动执行。
- 模板只上传一次，除非提供了 `--site-id`。
- 每个条目各自的启动错误会保持可见，并使命令以非零退出。
- 对 `cloudrun render-batch` 不要依赖 `--strict-variables`：当前命令接受这个参数，但不会校验批量的行。派发之前，先按 composition 的 schema 校验 JSONL 中的变量对象。对单次 `cloudrun render`，strict 闸门确实有效。

不带 `--wait` 的 `render` 会返回一个执行名。用 `cloudrun progress <execution-name>` 轮询直到成功，然后核实报告的 GCS 输出。`destroy` 会移除由 Terraform 管理的整套资源及其临时存储桶；凡是必须比这套资源存活更久的交付物，都要先保存好。
