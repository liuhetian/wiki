# STORYBOARD.md 格式 —— frame → group

`STORYBOARD.md` 是用户在 Step 3 批准的那一份可供审阅的计划，也是每个 frame-worker 在 Step 4 遵循的**说明书**。它是**分层的**：每个 **frame** 一个块，写成一个 `## Frame N — <frame_id>` 标题（解析器识别的是 `Frame`）。**一个 frame = 一个场景 = 一个 composition 文件。** 每个 frame 块内部是它的 **group**（处理方式的单位）。组装器读取 frame 这一层（`duration` → `data-start`、`src`）；worker 读取它自己的那个 frame 块。一个 frame 的 **composition id = 它的 `src` 文件主名**（`compositions/frames/01-f1.html` → `01-f1`），worker 把它用作 `data-composition-id` 和 `window.__timelines` 的键。

Step 2 写出骨架（frame 字段，group 为 `TBD`）；Step 3 填写 group + 品牌。它是一份构建规格，而不是代码 —— 规划者写做什么，worker 决定怎么做。**绝不要在这里写毫秒级的 tween。**

## 文件结构

YAML frontmatter（全片共用的主干）+ 每个 frame 一个 `## Frame N — <frame_id>` 块。

```markdown
---
compositionId: bgm
duration_s: 30.0 # == audiomap.audio.duration_sec, exactly
canvas: { w: 1920, h: 1080, fps: 30 }
style: # brand spine — from the chosen frame.md preset (Step 3)
  font: "EB Garamond / Inter / JetBrains Mono" # the preset's typography, verbatim
  palette: ["#FAF9F5", "#141413", "#CC785C", "#181715"] # ≤4–6 swatches from the preset's colors
assets: false # false, or a note like "assets/ has 6 user photos"
build_notes: ["one paused timeline per frame", "no remote assets"]
avoid: ["generic slideshow", "tiny unreadable hero text"]
---

## Frame 1 — f1

- src: compositions/frames/01-f1.html # worker writes here; assembler refs it; stem (01-f1) = composition id
- duration: 7.198s # = span length; the assembler reads this for cumulative data-start
- span_sec: [0.0, 7.198] # track seconds; frames tile the track
- pacing: beat_cut # beat_cut | phrase_flow (from the skeleton; obey it)
- mood: [hype]
- feel: accelerating onset stream into a held downbeat

### Groups

- **g1** — template: `intro-kinetic-cascade`
  - span_sec: [0.0, 4.017] # frame-LOCAL build is 0-based; these are TRACK seconds (worker subtracts frame start)
  - params: { theme: "light", icon: "bolt", phrases: "[…]", climax: "{…}" }
  - role_bindings: { phrase: { times: [0.14, 0.55, 0.87] }, climax: { in: 3.79, iconAt: 4.9 } }
  - copy: "GROWTH THROUGH CREATIVITY"
- **g2** — free_design
  - span_sec: [4.017, 7.198]
  - free_design: { dominant_system: "per-onset typography", primitives: ["content-swap", "braam-punch"], density_topology: "accumulate" }
  - anchors: [4.10, 4.80, 5.50, 6.20] # onset seconds the reveals ride (from audiomap)
  - copy: ["BUILD", "SHIP", "REPEAT"]

## Frame 2 — f2

…
```

## Frame 块 —— 必填字段

| 字段                              | 含义                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 标题 `## Frame N — <frame_id>`    | `frame_id` 与 `src` 的文件主名一致；`N` = 从 1 开始的序号。                                                                    |
| `src`                             | `compositions/frames/NN-<frame_id>.html` —— worker 写入的位置；组装器引用它。文件主名 = `data-composition-id`。               |
| `duration`                        | frame 的 span 长度，单位秒（例如 `7.198s`）—— **必填**；组装器把它们累加，得到累计的 `data-start`。                           |
| `span_sec`                        | `[start, end]`，曲目秒数。`duration = end − start`。                                                                           |
| `pacing`                          | `beat_cut` \| `phrase_flow` —— 来自骨架；worker 必须遵守（`phrase_flow` 上不做硬切）。                                         |
| `mood`、`feel`                    | 来自骨架；基调 + 规划者拿去匹配的那一行音乐状况描述。                                                                          |
| `### Groups` 列表                 | ≥1 个 group；各个 group 按顺序铺满 frame 的 span。                                                                             |

## Group 条目 —— 三种类型恰好选一种

每个 group 是 **template**、**free_design** 或 **asset** 之一 —— 绝不同时是两种，也绝不一种都不是。三种都带有 `span_sec`（曲目秒数，铺满整个 frame），并且可以带 `copy`。

- **template** —— `template: <catalog id>` + `params`（键名取自 catalog 条目）+ `role_bindings`（真实的 audiomap 锚点秒数）+ `copy`。
- **free_design** —— `free_design: { dominant_system, primitives: [catalog ids], density_topology }` + `anchors`（真实的节拍 / onset 秒数）+ `copy`。
- **asset** —— `asset: { treatment, clips: [public/…], anchors?, overlay_copy? }`。`treatment` ∈ `beat_cut`（每个锚点一个 clip —— 只用于 `beat_cut` frame）| `ken_burns`（缓慢推进 —— 适合 `phrase_flow`）| `bg_under_text`（压暗的 clip 垫在模板 / 自由组合 group 后面）。见 [`montage.md`](montage.md)。

## 规则

- 各个 frame 铺满整条曲目（无间隙，第一个从 0 开始，最后一个到 `duration_s` 结束）；一个 frame 的各个 group 铺满它的 span；没有 group 短于约 1 小节；没有 group 边界落在一段 `rolls[]` 内部。
- `params` 的键名来自该模板在 [`template-catalog.md`](template-catalog.md) 中的条目。
- 所有锚点秒数都是**来自 `audiomap.json` 的曲目秒数** —— worker 通过减去 frame 起点，把它们换算成 frame 内的局部时间。
- `phrase_flow` frame **绝不能**使用 `beat_cut` 素材处理方式或逐 onset 硬切。
- 品牌 `style` 只设置一次；每个 group 的色板都取自它。
- 可供审阅的文字加数据；保持一目了然。不要 GSAP，不要毫秒级时间。

## 自查（规划者运行 `validate-plan.mjs`）

- frontmatter 包含 `compositionId`、`duration_s`（== audiomap）、`canvas`、`style`。
- 每个 frame 都有 `span_sec` + `src` + 正数的 `duration` + `pacing` + ≥1 个 group；各个 frame 铺满整条曲目。
- 每个 group 恰好是 template / free_design / asset 之一；模板 id 在 catalog 中存在；锚点是真实的 audiomap 秒数；`phrase_flow` frame 没有 `beat_cut`。
