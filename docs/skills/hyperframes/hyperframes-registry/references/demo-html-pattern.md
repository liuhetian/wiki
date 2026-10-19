<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/references/demo-html-pattern.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# demo.html 约定

## 为什么 component 要附带 demo.html

registry 里的每个 component 都会在片段旁边附带一个配套的 `demo.html` 文件。demo 有两个用途：

1. **预览素材（fixture）** —— CI 预览流水线会渲染这个 demo，为 catalog 文档页生成缩略图和预览视频。

2. **用法示例** —— demo 展示 component 效果应用在有代表性的内容上，可以当作一份能跑的参考。

## demo 的结构

一个 demo 是一份完整、独立的 HTML composition：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Component Name — Demo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      /* reset + canvas size */
    </style>
  </head>
  <body>
    <div data-composition-id="<name>-demo" data-width="1920" data-height="1080" data-duration="N">
      <!-- Demo content showing the effect -->
      <!-- Component snippet inlined here -->
    </div>
    <script>
      // GSAP timeline demonstrating the effect
      window.__timelines = window.__timelines || {};
      window.__timelines["<name>-demo"] = tl;
    </script>
  </body>
</html>
```

关键约定：

- `data-composition-id` 用 `<component-name>-demo`，避免冲突
- demo 是自包含的——片段的全部 CSS 和 JS 都内联进来
- GSAP timeline 注册在 `window.__timelines` 上
- 时长要足够展示效果（通常 5–8 秒）

## block 不需要 demo.html

block 本身就是可以直接渲染的独立 composition。只有 component 需要 demo 这层包装。

## demo 不会被安装

`demo.html` 不会被 `hyperframes add` 安装——它只存在于 registry 中，用于生成预览和充当参考。
