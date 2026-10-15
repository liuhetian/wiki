<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/sub-compositions.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Sub-Composition

sub-composition 是嵌入到宿主 composition 中的一个单独的 HTML 文件。HyperFrames 加载它、独立地 seek 它，并在 `data-start` 处把结果合成进宿主。

## 宿主接线

在宿主 composition 里，sub-composition 表现为一个带有 `data-composition-src` 的 clip：

```html
<div
  id="chart"
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

- 宿主上的 `data-composition-id` 必须与 `data-composition-src` 所指文件内部的 `data-composition-id` 一致。
- 宿主 clip 需要它自己的 `data-start`、`data-duration`、`data-track-index`、`data-width`、`data-height`。

## Sub-Composition 文件结构

### 心智模型 —— runtime 实际做了什么

当宿主通过 `data-composition-src` 加载一个 sub-composition 时，runtime 会：

1. `fetch` 这个 HTML 文件。
2. 用 `DOMParser` 解析它。
3. **找到 `<template>` 元素，并且只把它的内容克隆进宿主槽位。**
4. `<template>` **之外**的一切（包括整个 `<head>`）都会被**丢弃**。

所以 `<template>` 不只是一个包裹层 —— 它是**传输容器**。如果某个节点需要在实时渲染中存在，它就必须在 `<template>` 内部。就这么简单。

### 文件形态

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- head is metadata for the source file only; the runtime ignores it -->
  </head>
  <body>
    <template>
      <!-- EVERYTHING the runtime needs goes here: styles, markup, scripts -->
      <style>
        /* Root: style by #root, never a class. lint: subcomposition_root_styled_by_class. See Pitfall 3. */
        #root {
          position: absolute;
          inset: 0;
          color: #fff;
        }
        /* .label, #bar, … — descendants, plain selectors */
      </style>

      <div id="root" data-composition-id="data-chart" data-width="1920" data-height="1080">
        <!-- sub-composition markup -->
      </div>

      <script>
        const tl = gsap.timeline({ paused: true });
        // ... build timeline ...
        window.__timelines["data-chart"] = tl;
      </script>
    </template>
  </body>
</html>
```

与之对照的是**独立式** composition，它把根元素直接放在 `<body>` 里，没有 `<template>` 包裹。

## 能通过静态检查、却会在渲染时出错的常见陷阱

静态的文件检查无法证明**跨文件的挂载契约**。这些故障只有在 runtime 挂载 sub-composition 时才会出现。

### Pitfall 1 —— `<style>` 写在 `<head>` 里，而不是 `<template>` 内部

```html
<!-- ❌ WRONG — looks normal, ships catastrophically broken -->
<head>
  <style>
    #root { font-size: 88px; ... }
  </style>
</head>
<body>
  <template>
    <div id="root" data-composition-id="data-chart" ...>...</div>
  </template>
</body>

<!-- ✅ RIGHT — styles are inside the template, root styled by #root (see Pitfall 3) -->
<head></head>
<body>
  <template>
    <style>
      #root { font-size: 88px; ... }
    </style>
    <div id="root" data-composition-id="data-chart" ...>...</div>
  </template>
</body>
```

**为什么会这样：** 标准的 HTML 惯例告诉你把 `<style>` 放在 `<head>` 里。在独立的 HTML 文件中这是对的。在 HyperFrames 的 sub-composition 中则**不对** —— runtime 只克隆 `<template>` 的内容，所以 `<head><style>` 会被直接扔掉。

**症状：** 单独的检查都能通过，渲染也能完成，但每个文本元素都以细小的、无样式的默认文字出现在左上角，SVG 也膨胀到画布大小，因为没有任何 CSS 到达实时 DOM。同样的陷阱也适用于 `<script>` 块、`<link rel="stylesheet">` 以及自定义元素注册：任何必须在渲染中执行或生效的东西都应该放在 `<template>` 内部。

### Pitfall 2 —— 宿主的 `data-composition-id` ≠ 内部 template 的 `data-composition-id`

```html
<!-- ❌ WRONG — host renames the slot; runtime can't find the timeline -->
<!-- host file (e.g. index.html) -->
<div data-composition-id="chart-mount" data-composition-src="compositions/chart.html" ...></div>

<!-- chart.html -->
<template>
  <div data-composition-id="data-chart" ...>...</div>
  <script>
    window.__timelines["data-chart"] = tl;
  </script>
</template>

<!-- ✅ RIGHT — both ids match, and the timeline key matches them too -->
<div data-composition-id="data-chart" data-composition-src="compositions/chart.html" ...></div>
<!-- chart.html template root: data-composition-id="data-chart" -->
<!-- timeline: window.__timelines["data-chart"] = tl; -->
```

**为什么会这样：** 给宿主槽位起一个不同的名字，比如 `chart-mount`（「挂载点」）对 `data-chart`（「真正的图表」），感觉很自然。HyperFrames 不是这么工作的 —— **宿主的 `data-composition-id` 是框架用来查找已注册 timeline 的查找键**。Lint 能通过，因为每个文件的 id 单独看都是合法的；跨文件的不一致只在渲染时才爆出来。

**症状：** 渲染日志会为每个不一致的槽位打印 `Sub-composition timelines not registered after 45000ms: <host-id>`，每个场景等待 45 秒，然后抓取静态的初始状态帧（于是视频长度是完整的，但没有任何动画播放）。

### Pitfall 3 —— 用 class 而不是 `#root` 给根元素设置样式

如果 sub-composition 给宿主根元素自己的 class 设置样式，`lint` 仍然会报 error（`subcomposition_root_styled_by_class`）。用 `#root` 给根元素设置样式。

## HyperFrames 如何处理 Sub-Composition

- 加载文件，并以其内部的 `data-composition-id` 注册它的 timeline。
- 独立于宿主的播放头来 seek sub-composition 的 timeline。
- 从宿主 clip 的 `data-start` 开始播放 sub-composition 的内容，持续 `data-duration` 秒。

**不要**手动用 `master.add(child)` 把 sub-composition 的 timeline 加进宿主 timeline。HyperFrames 已经在独立地驱动它们 —— 在 GSAP 里嵌套它们会导致双重 seek。

### 宿主 clip 的 `data-duration` 就是槽位的可见窗口

宿主 clip 上的 `data-duration` 定义了**槽位可见多长时间**，并且它优先于 sub-composition 内部 GSAP timeline 的长度。由此有两个推论：

- **内部 timeline 比槽位短 → 槽位停留。** 如果 sub-composition 的 GSAP timeline 在 `data-duration` 走完之前就结束了，槽位会在窗口的剩余时间里持续显示其最后一帧。你**不**需要用空 tween 去填充 timeline。
- **`data-duration` 比宿主 composition 短 → 槽位在自己的 `data-duration` 走完时结束（并变成空白）。** 这是有意为之：clip 是 timeline 上一段固定长度的窗口，而不是「一直填充到 composition 结束」。要让 sub-composition 在整个 composition 期间都可见，就把它的 `data-duration` 设为覆盖宿主窗口（或者添加另一个 clip 来覆盖剩余时间）。让单个铺满出血的 sub-composition 比 composition 短，几乎总是个错误 —— linter 会把它标记为 `subcomposition_blanks_before_host`。

## Sub-Composition 内部的动画

入场 tween 优先用 `gsap.fromTo()`，而不是 `gsap.from()`。每当 sub-composition 的 clip 变得可见时，宿主都会重新 seek 它；`gsap.from()` 在注册时记录起始状态，向回 seek 时可能失去同步，而 `gsap.fromTo()` 显式声明了两个端点，能干净地重放。

## 每实例变量

如果 sub-composition 在它的 `<html>` 元素上声明了变量（`data-composition-variables`），宿主就可以按实例覆盖这些值：

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-variable-values='{"title":"Q4 Revenue","accent":"#66d9ef"}'
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

宿主可以用不同的 `data-variable-values` 多次渲染同一个 sub-composition，以产生每个实例各自的变体。变量声明语法见 `variables-and-media.md`。
