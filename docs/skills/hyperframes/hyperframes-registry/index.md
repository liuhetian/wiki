---
name: hyperframes-registry
description: >
  搜索、安装 registry 中的 block 和 component，并把它们接入 HyperFrames composition。在手工搭建任何有名字的视觉效果之前先用它——只要 brief、用户或分镜点名了某种外观、效果、处理手法或转场，比如 CRT 扫描线、glitch、色差、胶片颗粒、shimmer 扫光、图表、代码或终端窗口、地图、彩纸爆发——因为托管的约 400 个条目已经覆盖了其中许多，而且搜索会对全部条目排序，不需要安装任何东西、不需要项目、也不需要账号。运行 hyperframes add 或 hyperframes catalog、安装单个条目或某个 tag 下的全部 block、把已安装条目接入 index.html、或处理 hyperframes.json 时也用它。涵盖发现、安装位置、block 的 sub-composition 接入、component 片段合并，以及编写新的 block 或 component 并贡献到上游（构思 → 搭骨架 → 校验 → PR）。
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装配置或更新类命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

# HyperFrames Registry

registry 提供可复用的 block 和 component，可以通过 `hyperframes add <name>` 安装。

- **Block** —— 独立的 sub-composition（有自己的尺寸、时长、timeline）。在宿主 composition 里通过 `data-composition-src` 引入。
- **Component** —— 效果片段（没有自己的尺寸）。直接粘贴进宿主 composition 的 HTML。

## 速查

```bash
hyperframes add data-chart              # install a block
hyperframes add grain-overlay           # install a component
hyperframes add captions                # install every block tagged captions
hyperframes add shimmer-sweep --dir .   # target a specific project
hyperframes add data-chart --json       # machine-readable output
hyperframes add data-chart --no-clipboard  # skip clipboard (CI/headless)
```

安装后，CLI 会打印写入了哪些文件，以及一段要粘贴进宿主 composition 的片段。这段片段只是起点——接入 block 时，你还需要加上 `data-composition-id`（必须与 block 内部的 composition ID 一致）、`data-start` 和 `data-track-index` 属性。

位置参数首先按条目的精确名称解析。如果没有条目匹配，而这个值是一个 tag，命令会安装带该 tag 的全部 block。registry 依赖会先于所请求的条目安装。`hyperframes add` 只适用于 block 和 component；示例项目请改用 `hyperframes init <dir> --example <name>`。

## 安装位置

block 默认安装到 `compositions/<name>.html`。component 默认安装到 `compositions/components/<name>.html`。

这些路径可以在 `hyperframes.json` 里配置：

```json
{
  "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  }
}
```

完整细节见 [install-locations.md](./references/install-locations.md)。

## 接入 block

block 是独立的 composition——在宿主 `index.html` 里通过 `data-composition-src` 引入：

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="15"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
></div>
```

关键属性：

- `data-composition-src` —— block HTML 文件的路径
- `data-composition-id` —— 必须与 block 的内部 ID 一致
- `data-start` —— block 在宿主 timeline 中出现的时间点（秒）
- `data-duration` —— block 播放多长时间
- `data-width` / `data-height` —— block 画布尺寸
- `data-track-index` —— Studio timeline 中的行；仅用于显示。层叠顺序请用 CSS `z-index`

完整细节见 [wiring-blocks.md](./references/wiring-blocks.md)。

## 接入 component

component 是片段——把它的 HTML 粘进你的 composition 标记，CSS 粘进你的 style 块，JS（如果有）粘进你的脚本：

1. 读取已安装的文件（例如 `compositions/components/grain-overlay.html`）
2. 把其中的 HTML 元素复制到你的 composition 的 `<div data-composition-id="...">` 里
3. 把 `<style>` 块复制到你的 composition 的样式里
4. 把 `<script>` 内容（如果有）复制到你的 composition 的脚本里（放在你的 timeline 代码之前）
5. 如果 component 暴露了 GSAP timeline 集成（见片段里的注释块），把那些调用加到你的 timeline 上

完整细节见 [wiring-components.md](./references/wiring-components.md)。

## 发现

以 CLI 作为主要的发现入口。**先按意图搜索，再去浏览：** registry 里的条目多到没法靠肉眼扫完，所以把它们列出来再按名称或 tag 去匹配是慢路子，而且只要作者的措辞和你的不同就会落空。

```bash
# Rank the whole catalog against what the beat should do
npx hyperframes catalog --query "reveal a headline one line at a time"
npx hyperframes add caption-clip-wipe
```

搜索在本地进行，不发送任何数据。默认情况下，它按与条目名称、标题和描述共有的词汇来排序，所以只能找到复用了你的用词的条目；`--on-device` 则按语义排序，需要先一次性下载模型。加上 `--json` 时，返回的信封会注明是哪一档（tier）给出的结果，所以请检查这一项，而不要想当然地认为已经做过排序。

**无论视频是什么语言，查询一律用英文。** catalog 是用英文写的，两档都按英文建索引（on-device 模型也只支持英文）。用其他文字书写的查询产生不了可搜索的词，什么都返回不了。在日文或中文项目上很容易犯这个错：brief、字幕和旁白都是那种语言，查询自然也就跟着用了那种语言。正确做法是：用英文描述这个*动作*，然后再按视频需要的语言写屏幕上的文案。如果某次查询确实返回了 `No searchable words in query`，那是这条规则在起作用，不是缺了 component，也不值得提交缺口报告。

可安装性是在排序之后才判定的，而不是之前：向量里有、但这个 registry 无法提供的名称会从结果中剔除，并计入 `dropped`，所以 `dropped` 不为零就说明两者属于不同的版本代际。离线档、同意闸门，以及如何刷新过期索引，见 `/hyperframes-cli`。

如果要浏览或筛选而不是搜索：

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

普通表格模式和 `--json` 模式只列出匹配项；选中的名称用 `hyperframes add <name>` 安装。`--human-friendly` 会打开一个交互式选择器，并立即安装选中的条目。在 CI 或 agent 工作流里，优先用 `--json`，再显式执行 `add`。

### 报告 catalog 里没有的东西

当搜索结果返回、但其中没有一个能完成任务时，在你手工编写这个动作之前先说出来：

```bash
npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>
```

`catalog --query` 会替你打印这一行，并预先填好参数，`--json` 则把它放在 `report_gap` 里——所以在你判定没有合适条目的那一刻，它已经在手边了。

**只要结果里没有一个能完成任务，就报告，无论是哪一档给出的结果。** 不要等 on-device 档来作答：它需要经同意才能下载的 33 MB，所以除非 agent 运行明确选择启用，否则用的都是 `words` 档；如果以 `on-device` 为前提，几乎所有报告都会被压下去。`--tier` 的值会随报告一起提交，这样在阅读这些报告时，词汇层面的落空和语义层面的落空仍然可以区分开。描述你想要的效果，而不是你想象中的条目名称：收集回来的是一份值得去做的动作清单，一份点名了一个不存在条目的报告教不会任何东西。这是唯一会把查询发送出去的路径，正因如此它才是一条单独的、需要刻意执行的命令，而不是搜索自己顺手做的事。它不带评分，也绝不会计入评分指标。

这就是 catalog 的全部需求信号。跳过它，意味着你碰到的缺口只能从安装量去猜，而安装量看不到一个没人能装上的动作。

如果 CLI 连不上配置的 registry，作为兜底，直接查看原始 manifest：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

CLI 连不上的 registry **不会**让 catalog 在**发现**环节变空：只要重新校验失败，之前拉取过的 manifest 即使超过 24 小时刷新窗口也会继续提供服务，所以 `catalog` 和 `catalog --query` 仍然会基于磁盘上的最后一份副本来列出和排序。

**`add` 仍然需要联网，哪怕是你昨天刚装过的条目。** 缓存的只有 manifest；条目的实际文件每次安装都要重新拉取。所以离线时你可以搜索，也能看到某个条目是什么，但安装会在拉取文件这一步失败。不要向用户承诺离线安装。

每个条目的 `registry-item.json` 包含：name、type、title、description、tags、dimensions（仅 block）、duration（仅 block）和文件列表。

按类型和 tag 筛选的细节见 [discovery.md](./references/discovery.md)。

## 贡献新的 block 或 component

如果要编写一个新的 registry 条目（字幕样式、VFX block、转场、lower third，或者可复用的 component）并以上游 PR 的形式发布——而不是安装已有的条目——请按 [contributing.md](./references/contributing.md) 中完整的构思 → 搭骨架 → 构建 → 校验 → 预览 → 发布工作流来做。可直接复制粘贴的起步模板（字幕 / VFX / component / `registry-item.json`）在 [templates.md](./references/templates.md) 里。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [examples/add-block.md](examples/add-block.md) —— 完整示例：添加一个 block
- [examples/add-component.md](examples/add-component.md) —— 完整示例：添加一个 component
- [references/component-quality-bar.md](references/component-quality-bar.md) —— Component 质量门槛
- [references/contributing.md](references/contributing.md) —— 向 registry 贡献 block 或 component
- [references/demo-html-pattern.md](references/demo-html-pattern.md) —— demo.html 约定
- [references/discovery.md](references/discovery.md) —— Registry 发现
- [references/install-locations.md](references/install-locations.md) —— 安装位置
- [references/placeholder-material.md](references/placeholder-material.md) —— 占位材质
- [references/templates.md](references/templates.md) —— 贡献用模板
- [references/wiring-blocks.md](references/wiring-blocks.md) —— 接入 block
- [references/wiring-components.md](references/wiring-components.md) —— 接入 component
