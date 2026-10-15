<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-cli/references/lint-validate-inspect.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# lint、check、snapshot

迭代时用 `lint` 获取快速的静态反馈。把 `check` 当作必需的最终闸门：它会重新运行同一个 linter，然后在一个浏览器会话中审查运行时、布局、动效和对比度。不要在 `check` 前面紧接着再串一次多余的独立 `lint`。`snapshot` 是用于抓取静帧和放大裁切图的独立工具。`validate`、`inspect` 和 `layout` 仍能运行，但已弃用：`check` 一次调用就涵盖了它们全部。

## 纪律（动效密集的工作）

当 composition 由动画驱动时，在动用 `preview` 或 `render` 之前先跑检查：

- 第一遍写完 HTML 后运行 `lint`，尽早获得反馈。它是迭代辅助手段，不是一个单独的最终闸门。
- 第一次完整过一遍时运行 `check --snapshots`：概览帧和每个问题的裁切图会让你看到审查器看到了什么。
- 在调整自动化警告之前先看这些 PNG：你的眼睛能抓住审查器漏掉的东西，审查器也能抓住你的眼睛漏掉的东西。
- 把布局错误视为缺陷，除非 snapshot 证明这种分层是有意为之；这种情况下用 `data-layout-allow-overflow` / `data-layout-allow-overlap` / `data-layout-allow-occlusion` / `data-layout-allow-caption-zone`（仅限字幕带）标记它。
- 在 `*.motion.json` sidecar 中声明动效意图，让 `check` 自动验证它（入场在 seek 下是否触发、错开顺序、是否在画面内、是否保持活动）。这是最接近「看一遍 MP4」的自动化替代手段，能抓住肉眼会漏掉的渲染与预览不一致的 bug（见下文的**动效验证**）。

## lint

```bash
npx hyperframes lint                  # current directory
npx hyperframes lint ./my-project     # specific project
npx hyperframes lint --verbose        # info-level findings
npx hyperframes lint --json           # machine-readable
```

对 `index.html` 和 `compositions/` 中的所有文件做 lint。报告错误（必须修）、警告（应该修）和信息（加 `--verbose` 时）。能捕获缺失的 `data-composition-id`、同一 `data-track-index` 上重叠的 track、未注册的 timeline，以及 GSAP/CSS transform 冲突。

`<video>`/`<audio>` 在任何嵌套深度都能工作，包括在 `compositions/*.html` sub-composition 内部或某个包裹用的 `<div>` 内部：runtime 用扁平的 DOM 查询发现媒体，无论它在哪里都会对它做 seek/解码（`packages/core/src/runtime/{media,startResolver}.ts`）。渲染之后，对每个含视频的场景做 `snapshot`，确认对应面板确实显示了画面（本该播放 clip 的地方出现空白/黑色面板是真正的 bug，不是占位符）。

## check

```bash
npx hyperframes check                    # current directory: the full browser gate
npx hyperframes check ./my-project       # specific project
npx hyperframes check --json             # agent-readable envelope {ok, browserSkipped, lint, runtime, layout, motion, contrast, hdr, snapshots}
npx hyperframes check --snapshots        # also write overview frames (annotated) + per-finding crops
npx hyperframes check --samples 15       # denser timeline sweep (default 9)
npx hyperframes check --at 1.5,4,7.25    # explicit hero-frame timestamps
npx hyperframes check --at-transitions   # also sample every tween start/end boundary
npx hyperframes check --tolerance 4      # allowed overflow px before reporting (default 2)
npx hyperframes check --timeout 30000    # initial render-ready + navigation minimum in ms (defaults: 3000 / 10000)
npx hyperframes check --no-contrast      # skip the WCAG audit while iterating
npx hyperframes check --strict           # exit non-zero on warnings too (default: only errors)
```

一条命令，启动一次 Chrome。`check` 先运行 linter，lint 报告错误时就完全跳过浏览器。当浏览器根本没有运行（lint 错误、linter 崩溃或浏览器启动失败）时，`browserSkipped` 为 `true`，`layout`、`motion` 和 `contrast` 部分是空的，而不是干净的。否则，它会加载打包好的 composition 一次，在导航之前挂好运行时监听器，然后扫过一个 seek 网格，在每个采样点运行所有审查：

- **运行时**：JavaScript 控制台错误、未处理的异常、失败的网络请求（媒体文件的 `ERR_ABORTED` 会被过滤掉）、HTTP 4xx/5xx。
- **布局**：文字超出其容器或画布、文字被自身的盒子裁切、持续存在的文字重叠和遮挡（带有近似的被覆盖比例）、子元素逃出裁切容器。
- **动效**：针对同一条经过 seek 的 timeline 检查 `*.motion.json` sidecar 断言（见下文）。
- **对比度**：对可见文字检查 WCAG AA，在 5 个网格点上采样。不达标是**错误**，每个问题都带有采样到的前景/背景颜色、实测与要求的对比度，以及一个沿同一色板方向调整后达标的建议颜色，所以大多数对比度修复根本不需要截图。

每个问题都带有选择器、元素的 `data-*` 身份、composition 源文件、一个 bbox 以及采样时间：从 JSON 直接跳到你必须修改的 HTML，改完重新运行。

**严重程度会考虑持续性。** 只在单个网格采样点上观察到的动态问题（入场/退场的瞬时状态）会降级为信息，绝不起闸门作用。跨多个采样点持续存在的问题会决定退出码，持续存在的 `content_overlap` 是错误，而持续存在、部分可见且超出画布 ≥5% 的 `canvas_overflow` 会升级为警告。坐标系类问题（`escaped_container`、`panel_out_of_canvas`、`connector_detached`）标记的是在一个坐标系中计算、却在另一个坐标系中渲染的几何——远在其 offset parent 之外的元素、卡在画布边缘上的已绘制面板、与所有节点都脱开的连接线。画进 `<canvas>` 的文字没有 DOM 盒子，所以 `canvas_overflow` 看不到它；当某个 canvas 的像素沿画面边缘显示出清晰的内容（绘制的文字、硬边形状）时，`canvas_content_at_edge` 会发出警告——对有意出血铺满的画面（粒子、照片），用 `data-layout-allow-overflow` 标记。如果一个 3 秒以上的 composition 在所有采样点上都没有可见变化，`check` 会以 `sweep_static` 失败：冻结的 timeline 会让每一个绿色结论都不可靠，所以它拒绝通过。如果只有音频在推进，它改为发出警告；本来就要静止的 composition 在根节点上加 `data-no-timeline`。指纹包含每个元素的不透明度，所以只靠不透明度的显现（代码打字、错开淡入）也算动效——但前提是它们在采样时刻仍在进行中。典型的陷阱是：某个显现很早就完成了，然后在剩余时长里保持一帧静态画面：每个采样点都落在已稳定的状态上，于是运行失败。要把显现分散到整条 timeline 上，或者保留一个持续动画的元素（代码打字时，闪烁的光标是惯用做法）——不要只为了糊弄检查就硬加一个缓慢的位置漂移。

**逃生舱口**（在 HTML 中标记意图，然后重新运行）：

- `data-layout-allow-overflow` —— 溢出是有意的（入场/退场的移动路径）。
- `data-layout-allow-overlap` —— 有意的文字分层（例如标题上方的演示光标标签）。只作用于被标记的文字块；不会被继承。标记具体参与分层的那个元素，绝不要标记场景/根包裹层，这样无关的后代碰撞仍然可以被审查到。
- `data-layout-allow-occlusion` —— 某个元素本就是要盖住文字的。
- `data-layout-allow-caption-zone` —— 在 `--caption-zone` 下有意放在 lower-third / 字幕带区域的文案。作用于被标记的元素及其所有后代（`closest`）；只消除 `caption_zone_collision`（不影响 overflow/overlap/occlusion）。优先选择恰好包住这段有意字幕带文案的最窄包裹层。
- `data-layout-ignore` —— 绝不应被审查的装饰性元素。

**可选启用的流水线闸门**（由编排者使用；默认关闭）：

```bash
npx hyperframes check --caption-zone "x0=0;y0=.82;x1=1;y1=1;severity=error;seek=.25,1"
npx hyperframes check --frame-check     # media (img/svg/video/canvas) out-of-frame detection
```

`--caption-zone` 接受用比例表示的条带几何（必须提供 `x0/y0/x1/y1`，是 composition 自身画布的 0-1 比例，竖屏也适用），可选 `severity` 和逗号分隔的 `seek` 比例；它会标记 DOM 盒子（`getBoundingClientRect`）与该条带重叠的文字元素。对有意放置的 lower-third 文案，在该元素或其最近的包裹层上加 `data-layout-allow-caption-zone` 来豁免（见「逃生舱口」）。`--frame-check` 报告超出画布、且超出量大于 `max(120px, 6% of the min canvas dimension)` 的媒体元素。

**修复对比度错误** —— 阈值是普通文字 4.5:1，大号文字 3:1（24px 以上，或 19px 以上的粗体）。问题中的 `suggestedColor` 已经沿正确方向挑好了最近的达标颜色（深色背景上提亮，浅色背景上压暗）；应用它，或者在同一色系内调整，然后重新运行 `check`。

## 动效验证（`*.motion.json` sidecar）

`check` 会针对渲染器所用的同一条经过 seek 的 timeline 验证**动效意图**——这是最接近「渲染出 MP4 然后看一遍」的自动化替代手段。它能抓住布局采样抓不到的渲染与预览不一致的 bug：seek 落点已经越过了的入场显现、被打乱的错开顺序、在 tween 中途漂出画面的元素、冻结的镜头。

在 composition 旁边放一个 `*.motion.json` sidecar（当多个 composition 共用一个目录时，文件名与 html 的基本名对应）。`check` 会自动发现它——不需要参数，也不需要改动创作框架。没有 sidecar 时，`check` 的行为和以前完全一样。

```json
{
  "duration": 6,
  "assertions": [
    { "kind": "appearsBy", "selector": "#headline", "bySec": 0.5 },
    { "kind": "before", "a": "#headline", "b": "#cta" },
    { "kind": "staysInFrame", "selector": ".card" },
    { "kind": "keepsMoving", "withinSelector": ".scene" }
  ]
}
```

| 断言 | 失败条件（代码） |
| --- | --- |
| `appearsBy(selector, bySec)` | 到 `bySec` 时仍不可见（不透明度 ≥ 0.5）—— `motion_appears_late` |
| `before(a, b)` | `a` 的首次出现没有严格早于 `b` —— `motion_out_of_order` |
| `staysInFrame(selector)` | 一旦可见后，它的盒子离开了画布 —— `motion_off_frame` |
| `keepsMoving(withinSelector?)` | 完全静止的时间窗口超过 `maxStaticSec`（默认 2 秒）—— `motion_frozen` |

`duration`、`withinSelector` 和 `maxStaticSec` 是可选的。这些问题**默认是错误**，与布局问题出现在同样的人类可读输出和 `--json` 输出中。匹配不到任何元素的选择器会被报告为 `motion_selector_missing`，而不是悄悄通过——选择器打错字会大声失败。在反馈循环中用它来代替肉眼看渲染结果：断言动效应该做什么，让 `check` 告诉你 seek 的结果什么时候偏离了意图。

## snapshot

```bash
npx hyperframes snapshot                       # 5 key frames as PNG
npx hyperframes snapshot ./my-project          # specific project
npx hyperframes snapshot --frames 10           # evenly-spaced N frames
```

从 composition 抓取静态 PNG，用于视觉比对、缩略图或附到 PR 上。当你只需要几张 hero 帧时，比渲染视频更快。输出落在项目的 snapshots 目录中。它没有被弃用：它仍然是独立的抓帧工具，而 `check --snapshots` 覆盖闸门所需（带有标注问题框的概览帧，以及每个带 bbox 的错误问题对应的 `finding-NN-<code>.png` 裁切图）。

### 放大查看报告的问题

`hyperframes check --snapshots` 已经会为每个带 bbox 的错误问题写出一张 `finding-NN-<code>.png` 裁切图，但一旦你知道要看什么，同样的放大功能也可以单独使用：

```bash
npx hyperframes check --snapshots               # reports a finding, e.g. content_overlap on "#cta"
npx hyperframes snapshot --zoom "#cta"           # crop the element to verify the defect, at 3x density
npx hyperframes snapshot --zoom "100,50,400,300" --zoom-scale 2   # or an exact pixel region
# fix the composition HTML, then re-check:
npx hyperframes check
```

`--zoom` 接受一个 CSS 选择器或一个精确的 `x,y,w,h` 像素区域，并且总是产出真正的高密度裁切图（提高 `deviceScaleFactor`，绝不用 CSS zoom 或调整 viewport 大小），所以 composition 的布局——以及它的渲染确定性——都不受影响。匹配不到任何元素的选择器是一个大声的错误，而不是悄悄回退到整帧；在某一帧中目标没有可见盒子（被折叠或被动画移出画布）时，会跳过这一帧并附上说明，而不是写出一条细缝图。

## 已弃用：validate、inspect、layout

这三个命令都仍然能用，会在 stderr 上打印弃用提示，并在 `--json` 中标记 `_meta.deprecated: true`。它们的功能都在 `check` 里：

- `validate`（运行时错误 + 对比度）→ `check`（对比度不达标现在是起闸门作用的错误，带有修复载荷，而不是警告）。
- `inspect` / `layout`（布局扫描 + 动效 sidecar）→ `check`（参数相同：`--samples`、`--at`、`--at-transitions`、`--tolerance`、`--strict`）。

迁移脚本时，把原来的命令序列替换成单独一次 `check` 调用；脚手架生成的项目中的 `npm run check` 已经指向它了。
