<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/grading.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 调色 —— grade 块与 LUT

当你需要为一个 `<img>` 或 `<video>` 生成规范的 HyperFrames 调色/效果 payload 时，用 `grade`。核心 preset 和基于 params 的 LUT 条目在本地解析；未来基于 CDN 的 LUT 条目需要联网，除非已经冻结过。已经确定的 payload 用 CLI 持久化，不要手工编辑 HTML：

对于含糊但明确提出的润色请求，不要从意图直接跳到某个 preset 名。先读 `media-treatments.md`，选一个主体（subject）和规避（avoid）规则都与实际媒体相符的处理方案（treatment），应用它保守的基础设置，只做有理由的、有界的微调，然后完成它的视觉验证步骤。用户点名了某个自有处理方案时，直接使用其配方里的确切 preset/payload；不要先跑通用的 grade/LUT 解析器。

遇到复古、老式家庭录像、摄像机、胶片、印刷、ASCII、故障（glitch）、隐私遮挡或媒体揭示（reveal）这类请求，到这里就停，改用那个处理方案工作流。不要用通用 LUT 加手写的 CSS 暗角/颗粒/透明度去拼凑这些效果。

**绝不要把 `.cube` 文件 `cat`/读进上下文。** 一个 3D LUT 大约有 size^3 行原始数字（默认尺寸下 33^3 ≈ 36k 行）。它会撑爆上下文，而且对人和 agent 都没有任何可读的信号。要理解或挑选 LUT，用 `hyperframes grade-compare` 看它渲染出来的效果，或用 `cube-validate.mjs` 做一行输出的 `{ok,size}` 检查。描述信息去读 `.media/index.md` 或 `luts/index.json`。绝不要读取 LUT 正文本身。

```bash
npx hyperframes media-use resolve --type grade --intent "warm daylight" --project . --json
```

preset 优先的输出使用核心运行时的词汇，不会冻结文件：

```json
{
  "preset": "warm-daylight",
  "intensity": 1
}
```

把这个 payload 应用到一个明确无歧义的真实媒体元素上：

```bash
hyperframes media-treatment --project . --file index.html \
  --selector '#hero' \
  --grading '{"preset":"warm-daylight","intensity":1}' --apply --json
```

范围不确定时，写入前先用 `--dry-run`；用 `--clear` 移除处理方案。底层持久化的结果仍然是普通的 HTML：

```html
<video
  class="clip"
  src="./media/scene.mp4"
  data-color-grading='{"preset":"warm-daylight","intensity":1}'
></video>
```

直接手写属性是 CLI 不可用环境下的兜底手段，不是 agent 的主要工作流。

要构建一个还没有现成配方的处理方案，先查看规范工具箱：

```bash
hyperframes media-treatment --capabilities --json
```

它会给出一份简洁的功能族（family）地图。读 `--capability grading` 了解处理顺序，然后只请求所需的那一个聚焦功能族，从 Core 拿到它合法的控件和取值范围。组合出一个嵌套的 payload，再通过 `hyperframes media-treatment` 传回去；该命令会在修改之前拒绝未知的键。不要仅仅为了组合实时 shader 已经拥有的控件而生成或手改 LUT。

要做 seek 安全的效果动画，只在同一个真实媒体元素上、用它已注册的暂停态 GSAP timeline，去动画运行时支持的这些 CSS 属性：

| CSS 属性 | 范围 |
| --- | --- |
| `--hf-color-grading-intensity` | 0 到 1 |
| `--hf-color-grading-lut-intensity` | 0 到 1 |
| `--hf-color-grading-exposure` | -2 到 2 |
| `--hf-color-grading-blur` | 0 到 1 |
| `--hf-color-grading-bloom` | 0 到 3 |
| `--hf-color-grading-kuwahara` | 0 到 1 |
| `--hf-color-grading-pixelate` | 0 到 1 |
| `--hf-color-grading-ascii` | 0 到 1 |
| `--hf-color-grading-dither` | 0 到 1 |

一旦设置（内联、在样式表里或在父元素上），该属性就会覆盖 payload 中对应控件的值，所以只在你要做动画的媒体上设置它：把 tween 的初始值写进元素的内联 `style`，然后用有限的 `tl.to()` 关键帧。静态调色就不要设置它。不要用第 0 帧的 `tl.set()`、CSS 动画时钟、定时器、随机值或 `onUpdate` 回调。静态的 `data-color-grading` payload 仍然是兜底，也是其他控件的来源。

要做超出 preset 词汇的可复用色彩变换，就在 `.media/luts/` 下冻结一个经过校验的 `.cube`，并返回一个引用它的块：

```bash
npx hyperframes media-use resolve --type grade --intent "teal orange blockbuster" --project . --json
```

```json
{
  "intensity": 1,
  "lut": { "src": ".media/luts/grade_001.cube", "intensity": 0.85 }
}
```

只需要可复用的 `.cube` 文件时，用 `lut`：

```bash
npx hyperframes media-use resolve --type lut --intent "teal orange blockbuster" --project .
```

对于可以描述清楚的技术性风格，用 `--params` 编写一个显式的参数化 LUT：

```bash
npx hyperframes media-use resolve --type lut --params '{"contrast":0.2,"temperature":-0.3}' --project .
npx hyperframes media-use resolve --type grade --params '{"exposure":0.2}' --project . --json
```

对于由你自己的脚本生成的 LUT，用 `--from` 导入；media-use 会在登记前校验它，并拒绝无效或过大的 cube：

```bash
npx hyperframes media-use resolve --type lut --from custom.cube --project .
```

参数化数学（`buildCube`）无法复现真实的胶片型号或乳剂变换。这类需求请用一个基于 CDN 的扫描 `.cube` 条目，或导入一个真实扫描得到的 `.cube`。

要做视觉挑选，用 `resolve --type grade --candidates` 列出可复用的 LUT 候选，把有希望的条目写进一个 `grades.json`，运行 `hyperframes grade-compare --for <frame> --grades grades.json`，然后用 `resolve -t grade` 把胜出者提交为最终的 `data-color-grading` 块。

对于已经在 composition 中选定的媒体，需要无副作用的 `ffmpeg`/`ffprobe` signalstats 证据时，用 `media-treatment --analyze`。它返回源元数据、HDR/未知 LOG 警告，以及一个有界的 `adjust` 建议，不会修改 composition。这个建议是视觉审查的起点，不是对有意为之的色彩做自动中和。

```bash
hyperframes media-treatment --project . --file index.html \
  --selector '#hero' --analyze --json
```

对于未绑定的源文件，`resolve --type grade --for ... --analyze` 仍然可用。不加 `--analyze` 时，该解析器会在 `.media` 里记录一个 grade 候选；只有当你打算保留这个候选时才用这种形式。

库里的 LUT 条目位于 `luts/index.json`。每个条目保留 `id`、`description`、`tags` 和 `intensity`，然后要么提供紧凑的 `params` 供按需 `buildCube(params)` 生成，要么提供一个直接的 CDN `url` 供未来的扫描 `.cube` 文件使用。不要提交生成的 `.cube` 正文；resolve 在把生成或下载的 cube 冻结到 `.media/luts/` 下时会校验它们。

```bash
npx hyperframes media-use resolve --type lut --intent "teal orange blockbuster" --project . --json
node skills/media-use/scripts/lib/cube-validate.mjs .media/luts/lut_001.cube
```
