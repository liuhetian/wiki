# 对比与批量渲染

这些命令用于有意为之的视觉对比，或变量驱动的模板输出。它们不能替代 `lint`、`check`、最终预览批准或输出验证。

## 目录

- [对比项目或变体](#compare-projects-or-variants)
- [对比调色](#compare-color-grades)
- [批量模板渲染](#batch-template-renders)

## 对比项目或变体 { #compare-projects-or-variants }

把两个或更多项目目录或 HTML 文件在同一时间点的画面，渲染到一张带标签的对照图（contact sheet）里：

```bash
npx hyperframes compare <path-a> <path-b> [<path-c> ...] \
  --at <seconds> \
  --labels baseline,candidate \
  --out compare.png \
  --cols 2
```

常用选项：

- `--at <seconds>` 选择共同的对比时间点。
- `--labels <a,b,...>` 按输入顺序给各个格子加标签。
- `--out <file>` 指定对照图的路径。
- `--cols <n>` 控制它的网格列数。
- `--json` 返回机器可读的结果。
- `--timeout <ms>` 修改每个变体的渲染就绪超时。

一张对照图最多接受 16 个变体。多出的输入会被截断并给出警告；更大规模的对比请拆成几次运行。

`compare` 是一个视觉审阅界面，不是质量闸门。在拿基线和候选版本对照、比较不同的实现变体，或者验证某次修复保留了预期外观时运行它。要亲自检查生成的图片；不要把命令成功当作视觉上的批准。

## 对比调色 { #compare-color-grades }

从一帧源画面生成调色候选：

```bash
npx hyperframes grade-compare \
  --for frame.png \
  --grades grades.json \
  --project . \
  --out grade-compare.png
```

`grades.json` 是一个由带标签的 HyperFrames 调色块组成的数组：

```json
[{ "label": "warm", "grading": { "adjust": { "temperature": 0.2, "contrast": 0.1 } } }]
```

或者对比明确指定的 LUT 文件：

```bash
npx hyperframes grade-compare \
  --for source.mp4 \
  --luts warm.cube,cool.cube \
  --out grade-compare.png
```

- `--for` 接受图片或视频。输入为视频时，命令会提取第一帧。
- 必须且只能提供一种候选来源：`--grades <json>` 或 `--luts <a.cube,b.cube>`。
- 默认会包含一个中性基线；只有当基线不是有用的参照时，才传 `--no-baseline`。
- 命令最多接受 16 个候选调色。加上默认的中性基线，对照图可能有 17 个格子。多出的候选会被截断并给出警告；更大的集合请拆成几次运行。
- `--timeout <ms>` 修改所生成的对比 composition 的渲染就绪超时。
- 需要机器可读的输出时用 `--json`。

这个命令帮助你挑选调色。它不会把选中的调色应用到 composition 上，也不能替代 `/media-use` 的来源记录和 LUT 校验。

## 批量模板渲染 { #batch-template-renders }

`render --batch` 接受一个由变量对象组成的 JSON 数组，或者一个带 `rows` 数组的对象：

```json
{
  "rows": [
    { "name": "alpha", "headline": "Hello" },
    { "name": "beta", "headline": "Welcome" }
  ]
}
```

在 composition 中声明变量，然后运行：

```bash
npx hyperframes render \
  --batch rows.json \
  --output "renders/{name}.mp4" \
  --batch-concurrency 1 \
  --strict-variables
```

批量规则：

- 不要把 `--batch` 和 `--variables` 或 `--variables-file` 组合使用；每一行就是一次渲染的变量集。
- 如果省略 `--output`，生成的文件名会包含 `{index}`，以保证各行输出不重名。
- 输出模板支持 `{index}`，以及由字母、数字、`_`、`.` 或 `-` 组成的行键。占位符的值必须是字符串、数字或布尔值；`null`、对象和数组都无效。缺失的占位符和输出冲突都算错误。
- `--batch-concurrency` 默认为 `1`。提高它时要保守，因为每次渲染本身就已经在使用多个 worker。
- `--batch-fail-fast` 会在第一次失败后停止调度。不加它时，相互独立的行会继续运行，失败情况在 manifest 中保持可见。
- `--strict-variables` 会在渲染前校验每一行，一旦违反声明的变量契约，就在产生输出之前中止。
- `--json` 会发出适合 agent 和 CI 使用的进度事件。

该命令会在公共输出目录中写入 `manifest.json`，并在整个运行过程中持续更新它。它记录每一行的变量、状态、输出、错误和耗时。所谓完成，是指 manifest 中没有失败的行，并且每个已完成的输出都存在、非空，且时长合理。
