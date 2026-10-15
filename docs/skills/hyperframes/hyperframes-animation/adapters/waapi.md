---
name: hyperframes-waapi
description: >
  HyperFrames 的 Web Animations API adapter 模式。在编写 element.animate() 运动、通过 Animation 的 currentTime 进行 seek、使用 document.getAnimations()、KeyframeEffect 时间设置、fill 模式，或任何必须在 HyperFrames 中确定性渲染的浏览器原生动画时使用。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/waapi.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# HyperFrames 中的 Web Animations API

HyperFrames 通过它的 `waapi` runtime adapter 可以 seek Web Animations API 动画。当你想要由 JavaScript 创建时间设置的浏览器原生关键帧、又不想依赖 GSAP 时，WAAPI 很有用。

## 契约

- 在 composition 初始化期间同步创建动画。
- 使用带有限 `duration` 和 `iterations` 的 `element.animate(...)`。
- 使用 `fill: "both"`，让 seek 到的状态得以保持。
- 创建后暂停动画，或者让 adapter 在首次 seek 时暂停它们。
- 对于影响渲染结果的状态，避免使用回调和 promise。

adapter 调用 `document.getAnimations()`，把每个动画的 `currentTime` 设为以毫秒计的 HyperFrames 时间，然后暂停它。

## 基本模式

```html
<div id="orb" class="clip orb" data-start="2" data-duration="3" data-track-index="2"></div>

<script>
  const orb = document.getElementById("orb");
  const animation = orb.animate(
    [
      { transform: "translate3d(-160px, 0, 0) scale(0.8)", opacity: 0 },
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, offset: 0.35 },
      { transform: "translate3d(120px, 0, 0) scale(1.08)", opacity: 1 },
    ],
    {
      duration: 3000,
      delay: 2000,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "both",
      iterations: 1,
    },
  );

  animation.pause();
</script>
```

## Stagger 模式

```js
document.querySelectorAll(".token").forEach((token, index) => {
  const animation = token.animate(
    [
      { transform: "translateY(24px)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    {
      duration: 620,
      delay: index * 80,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "both",
      iterations: 1,
    },
  );
  animation.pause();
});
```

## 适用场景

- 轻量级的 DOM 运动：CSS 关键帧太死板，GSAP 又没必要的时候。
- 由结构化数据生成的动画。
- 能用关键帧、延迟和偏移表达的简单时间线。

## Composition 时长

渲染引擎需要知道 composition 的总长度，才能确定要抓取多少帧。GSAP timeline 会自动报告时长；纯 WAAPI 的 composition 没有 timeline 对象，所以 runtime 会根据每个动画的 `effect.getComputedTiming().endTime`（再加上动画创建时刻相对于 composition 起点的偏移）来推断时长。只要每个 `element.animate()` 调用都使用有限的 `duration` 和 `iterations` —— 上面的契约本来就要求如此 —— 根元素上的 `data-duration` 就是可选的。

无限的 `iterations` 没有有限的 `endTime`，所以无法自动推断 —— 这是又一个避免使用它的理由（见下文"避免"）。如果你必须用它，就在根 `[data-composition-id]` 元素上加 `data-duration="<seconds>"`，否则 `npx hyperframes lint` 会报错（`root_composition_missing_duration_source`）。

## 避免

- 无限的 `iterations`。
- 依赖 `animation.finished` 去修改影响渲染结果的 DOM。
- 用 `requestAnimationFrame`、定时器或 `performance.now()` 运行独立的时钟。
- 在 transform 和 opacity 能表达运动时，给布局属性做动画。
- 假定 clip 局部的起始时间是自动处理的。WAAPI adapter seek 的是文档级的动画时间；请用 `delay` 来模拟 clip 偏移，或者把动画创建在一个可见性由 HyperFrames 时间控制的元素上。

## 校验

编辑 WAAPI composition 之后：

```bash
npx hyperframes lint
npx hyperframes check
```

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/waapi.ts`。
- 时长自动推断：`packages/core/src/runtime/init.ts`（`resolveAdapterDurationFloorSeconds`），以及上述 adapter 中的 `getInferredDurationSeconds`。
- MDN Web Animations API 指南：https://developer.mozilla.org/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
- MDN `Animation.currentTime`：https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime
