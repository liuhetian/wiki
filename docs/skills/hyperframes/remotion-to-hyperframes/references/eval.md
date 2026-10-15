<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/eval.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Eval：如何端到端地校验一次翻译

每一次翻译都应当被度量。本 skill 附带三个脚本和一套分级测试语料库，它们合在一起把守翻译质量的闸门。

## 三个脚本

| 脚本 | 输入 | 输出 |
| --- | --- | --- |
| `scripts/lint_source.py` | Remotion 源码目录或文件 | JSON 格式的发现 + 退出码（0 表示干净，1 表示有阻断项） |
| `scripts/render_diff.sh` | 两个 MP4 路径 | 逐帧 SSIM + JSON 汇总（`mean`、`min`、`p05`、`p95`、`pass`） |
| `scripts/frame_strip.sh` | 两个 MP4 路径 | 并排对比的条带 PNG，用于目视调试 |

按这个顺序运行：**lint → 渲染 → diff →（若失败）条带**。

## 每个 fixture 的流程

```bash
# 1. Lint the source — blockers mean stop
python3 ../../scripts/lint_source.py ./remotion-src/src/

# 2. Generate any binary assets (T2+T3 only)
[ -f setup.sh ] && ./setup.sh

# 3. Render Remotion baseline
cd remotion-src && npm install && npm run render
# -> remotion-src/out/baseline.mp4

# 4. Render HF translation
cd .. && node ../../../packages/cli/dist/cli.js render hf-src/ --output hf.mp4
# -> hf.mp4

# 5. SSIM diff
../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
# -> diff/summary.json

# 6. If diff fails, generate frame strip for visual inspection
../../scripts/frame_strip.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./strip 8
# -> strip/strip.png
```

## 解读 `diff/summary.json`

```json
{
  "frame_count": 90,
  "mean": 0.974,
  "min": 0.972,
  "max": 0.999,
  "p05": 0.972,
  "p95": 0.983,
  "threshold": 0.95,
  "pass": true
}
```

| 字段 | 它告诉你什么 |
| --- | --- |
| `mean` | 所有帧的平均 SSIM；最主要的那个数字 |
| `min` | 最差的一帧；低于阈值意味着至少有一帧在结构上是错的 |
| `p05` / `p95` | 第 5 / 第 95 百分位 —— 大多数帧落在这两者之间 |
| `threshold` | 来自 `R2HF_SSIM_THRESHOLD` 环境变量（默认 0.85） |
| `pass` | 是否满足 `mean >= threshold` |

## 经过验证的层级阈值

对照实际的 Remotion + HF 渲染结果校准得出：

| 层级 | Composition 形态 | 平均值 | 阈值 | 余量 |
| --- | --- | --- | --- | --- |
| T1 | 单元素淡入 | 0.974 | 0.95 | +0.022 |
| T2 | 多场景 + spring + 音频 + 图片 | 0.985 | 0.95 | +0.016 |
| T3 | 数据驱动、自定义子组件、数字递增 | 0.953 | 0.90 | +0.038 |

每个 fixture 的 `expected.json` 包含：

- `ssim_threshold` —— `pass` 的闸门
- `validation` —— 校准运行中实际测得的数值
- `translation_notes` —— 哪些地方有损，以及原因

## 关键：编码器配置

Remotion 和 HF 必须输出相同的像素格式，SSIM 才有意义。Remotion 默认的 JPEG 输出写的是 `yuvj420p`（全范围）；HF 输出的是 `yuv420p`（有限范围）。这个不匹配会造成约 0.05 的 SSIM 损失。

每个 fixture 的 `remotion.config.ts` 都设置了：

```ts
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
```

如果用户的源码里没有这些设置，就在翻译步骤中加上 —— 否则 diff 测出来的是编码器差异，而不是翻译保真度。

## 噪声底是什么样的

占主导地位的非翻译噪声是**系统字体回退的差异**。在没有安装真实字体时，Remotion 自带的 Chromium 与 HF 的 `chrome-headless-shell` 对 `font-weight: 800` 的解释不同：

- Remotion 中 160px 的 HELLO：中等粗细的笔画
- HF 中 160px 的 HELLO：粗重的笔画

这会造成约 0.025 的平均 SSIM 损失。在 T1 的帧条带里可以看到。[fonts.md](fonts.md) 介绍了如何缓解（使用 Inter，显式加载 Google Fonts）。

## 设定阈值的经验法则

把阈值设在实测 `p05` 之下约 0.02：

- 真正的翻译退化会让平均值下降 0.05 以上 —— 能被抓到。
- 不同 CI 运行之间的编码器 / 字体漂移被限制在约 0.01 以内 —— 不会被误抓。

如果某次校准运行测得的平均值远高于你最初猜测的阈值，*不要*为了贴合它而收紧阈值。留出余量 —— 在不同硬件上重新渲染的 fixture 会有漂移。

## diff 不通过时

1. **先看 `frame_strip.sh` 的输出。** 在 6–10 个均匀分布的时间点上并排对比的条带，能显示出失败是结构性的（场景时长错误、缺少元素）还是外观上的（字重不同、轻微的时间偏差）。
2. **检查 `diff/ssim.log`。** 逐帧 SSIM 告诉你是*哪些*帧失败了。坏帧集中在某个场景中段 = 动画问题；坏帧出现在场景边界 = sequencing 问题。
3. **重读相关的参考文档。** spring/easing 问题看 [timing.md](timing.md)，场景边界问题看 [sequencing.md](sequencing.md)，素材加载问题看 [media.md](media.md)。

## CI 集成

这些 fixture 目前还没有接入 CI（`packages/producer/tests/` 在 Docker 中运行；这套 skill 语料库也需要同样的环境）。这组 PR 栈中的 PR 7 会加入一个编排脚本，运行全部四个层级并输出一份汇总的通过报告。目前请逐个 fixture 手动评估。
