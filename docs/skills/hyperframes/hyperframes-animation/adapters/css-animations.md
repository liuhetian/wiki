---
name: hyperframes-css-animations
description: >
  HyperFrames 的 CSS 动画 adapter 用法模式。在编写 CSS keyframes、基于 animation-delay 的时间控制、animation-fill-mode、animation-play-state，或者编写 HyperFrames 必须在预览和渲染期间确定性地 seek 的纯 CSS 动效时使用。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/css-animations.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 用于 HyperFrames 的 CSS 动画

HyperFrames 可以通过它的 `css` runtime adapter 来 seek CSS keyframe 动画。把它用于简单的重复图案、背景运动、微光、辉光、遮罩，以及不需要编排顺序的装饰。

对于场景编排，GSAP 通常更清晰。CSS 动画最适合的情况是：动效只属于一个元素，而且时长固定。

## 契约

- 在 runtime 初始化完成之前，把要做动画的元素放进 DOM。
- 给带时间的元素一个 `data-start` 值，让局部动画时间与 clip 对齐。
- 使用有限的 `animation-duration` 和 `animation-iteration-count`，因为在没有基于 WAAPI 的 CSS 动画的环境里，负 delay 的回退方案无法表示无界的时长。
- 优先使用 `animation-fill-mode: both`，这样被 seek 到的状态在动效活跃期之前和之后都能保持。
- 避免依赖挂钟时间的 JavaScript、由悬停触发的状态，以及依赖用户事件的 class 切换。

adapter 会找出计算样式中带有 `animation-name` 的元素，在可用时 seek 它们的浏览器 `Animation` 句柄，否则回退为暂停动画并使用负的 `animation-delay`。

## 基本模式

```html
<div
  id="pulse-ring"
  class="clip pulse-ring"
  data-start="0"
  data-duration="4"
  data-track-index="2"
></div>

<style>
  .pulse-ring {
    width: 280px;
    height: 280px;
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation-name: pulse-ring;
    animation-duration: 1200ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
    animation-iteration-count: 3;
    animation-fill-mode: both;
  }

  @keyframes pulse-ring {
    from {
      opacity: 0;
      transform: scale(0.82);
    }
    35% {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: scale(1.18);
    }
  }
</style>
```

## Stagger 模式

用 CSS 自定义属性来避免重复编写 keyframes：

```html
<div class="clip dots" data-start="1" data-duration="3" data-track-index="3">
  <span style="--i: 0"></span>
  <span style="--i: 1"></span>
  <span style="--i: 2"></span>
</div>

<style>
  .dots span {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-right: 10px;
    border-radius: 50%;
    background: currentColor;
    animation: dot-pop 900ms ease-out both;
    animation-delay: calc(var(--i) * 120ms);
  }

  @keyframes dot-pop {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.75);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
```

## 适合的用途

- 重复次数已知的装饰性循环。
- 遮罩、辉光、微光、颗粒，以及细微的视差图层。
- 简单的单元素入场，用一整条 JS timeline 会显得过度的情况。

## 避免

- 无限循环的 CSS 动画，除非你已经核实浏览器暴露了可 seek 的、基于 WAAPI 的 CSS 动画句柄。优先使用覆盖可见时长的有限迭代次数。如果你确实用了 `infinite`，就给根元素加上 `data-duration` —— 见下文的 Composition 时长。
- 在 transform 能胜任时，却去动画 `top`、`left`、`width` 或 `height` 这类布局属性。
- 依赖悬停、聚焦、滚动或媒体查询来触发对渲染至关重要的动效。
- 在启动之后修改动画 class，除非有另一条确定性的 timeline 控制这个变化。

## Composition 时长

渲染引擎需要知道 composition 的总时长。GSAP timeline 会自动报告这个值；纯 CSS 的 composition 没有 timeline 对象，所以 runtime 会根据运行时间最长的动画的计算结束时间来推断时长（`animation-delay` + `animation-duration` × 有限的 `animation-iteration-count`，每个元素再加上 `data-start` 作为偏移）。只要页面上的每个 CSS 动画都是有限的，根元素上的 `data-duration` 就是可选的 —— 你不需要仅仅因为 composition 是 CSS 驱动的就加上它。

`animation-iteration-count: infinite`（或任何无法确定 / 无界的动画）没有有限的结束时间，所以无法自动推断。如果 composition 唯一的动画是无限的，你就**必须**在根 `[data-composition-id]` 元素上加上 `data-duration="<seconds>"`，写明你预期的总时长 —— `npx hyperframes lint` 会对这种情况报错（`root_composition_missing_duration_source`），正是因为 runtime 没有任何可推断的依据。

```html
<div
  data-composition-id="root"
  data-start="0"
  data-duration="6"
  data-width="1920"
  data-height="1080"
>
  <div class="clip spinner" data-start="0" style="animation: spin 1s linear infinite"></div>
</div>
```

## 验证

编辑 CSS 动画 composition 之后：

```bash
npx hyperframes lint
npx hyperframes check
```

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/css.ts`。
- 时长自动推断：`packages/core/src/runtime/init.ts`（`resolveAdapterDurationFloorSeconds`），以及上面那个 adapter 里的 `getInferredDurationSeconds`。
- MDN CSS 动画文档：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation
- MDN `animation-fill-mode`：https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
