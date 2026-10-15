<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/references/wiring-components.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 接入 component

component 是效果片段——由 HTML、CSS 以及可选的 JS 组成，你要把它们直接合并进一个已有的 composition。和 block 不同，component 没有独立的 timeline；它们参与宿主 composition 的 timeline。

## 通用流程

1. 运行 `hyperframes add <component-name>`
2. 打开安装好的文件（例如 `compositions/components/grain-overlay.html`）
3. 阅读头部注释里的用法说明
4. 把各部分复制进你的宿主 composition：
   - **HTML 元素** —— 放进你的 `<div data-composition-id="...">` 内部
   - **CSS 样式** —— 放进你的 composition 的 `<style>` 块
   - **JS 初始化** —— 放进你的 composition 的 `<script>`，在你的 timeline 代码之前
   - **Timeline 调用** —— 放进你的 GSAP timeline（如果 component 暴露了这些调用）

## 示例：grain-overlay（纯 CSS，无 timeline 集成）

```html
<!-- Paste the overlay div into your composition -->
<div
  id="grain-overlay"
  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"
>
  <div class="grain-texture"></div>
</div>
```

然后把 CSS keyframes 和 `.grain-texture` 规则粘进你的样式。不需要 GSAP timeline 调用——颗粒是通过 CSS `@keyframes` 动起来的。

## 示例：shimmer-sweep（需要 timeline 集成）

完整的 shimmer-sweep 演练（HTML 包裹、CSS、JS 初始化和 timeline 调用）见 `examples/add-component.md`。

## 关键原则

- component 继承宿主 composition 的尺寸和时长
- 把 component 的 HTML 放在相对你的内容合适的 z-index 上
- 阅读每个片段头部的注释，了解可自定义的值
- 接入之后运行 `hyperframes lint`，以发现结构性问题
