# 最小 Composition

最小的可渲染 HyperFrames composition —— 一个独立式（顶层）根元素，带一个 clip 和一个 tween：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Minimal HyperFrames Composition</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {
        margin: 0;
        background: #0b0f14;
        color: white;
        font-family: Inter, system-ui, sans-serif;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .clip {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
      }
      h1 {
        margin: 0;
        font-size: 96px;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-width="1920"
      data-height="1080"
      data-duration="5"
    >
      <section id="title-card" class="clip" data-start="0" data-duration="5">
        <h1 id="title">Hello HyperFrames</h1>
      </section>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.from("#title", { y: 48, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.2);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

runtime 真正要求的东西：

- 带有 `data-composition-id`、`data-width`、`data-height` 的根 `<div>`。上面按惯例写了根元素的 `data-start="0"`，每个随附的 block 也都有它，但缺省时 runtime 会自动补上，所以它不是必需的。
- 一个时长来源：根元素的 `data-duration`（如上），或者 GSAP timeline，或者媒体，或者能推断出时长的 adapter。
- 有计时的元素带有 `data-start` 外加一个时长。仅凭这个属性就能让元素成为 clip：`class="clip"` 是布局和工具链惯例，`data-track-index` 是 Studio 的显示泳道。两者都不是必需的，一个完全没有 clip 的 composition 也能正常渲染。
- 一条以暂停状态创建、并注册在 `window.__timelines["<composition-id>"]` 上的 GSAP timeline。

骨架里的其他一切都是普通的 HTML 和 CSS：`#root` 盒子、`.clip` 的定位以及字体都由你自己选择。

这个模式是**独立式**的（顶层 `index.html`）—— 根元素外面没有 `<template>` 包裹。关于 sub-composition（通过 `data-composition-src` 加载的文件），见 `sub-compositions.md`。
