---
name: hyperframes-gsap-adapter
description: >
  HyperFrames 的 GSAP 动画 API 参考。在 HyperFrames composition 中编写可 seek 的 GSAP timeline 时使用，涵盖 gsap.to()、from()、fromTo()、set()、timeline 位置参数、label、easing、stagger、有限次重复，以及 transform 性能。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/gsap.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# HyperFrames GSAP

限定在 HyperFrames 的 seek 驱动渲染模型之内的 GSAP 用法。本 skill 是*受 HyperFrames 约束的* GSAP 参考 —— 框架更广泛的 composition 契约见 `hyperframes-core`。

## HyperFrames 契约

HyperFrames 通过它的 `gsap` runtime adapter 控制 GSAP。同步创建一个暂停的 timeline，用与 `data-composition-id` 完全一致的键把它注册到 `window.__timelines` 上，让 HyperFrames 去 seek 它。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });

  tl.from(".title", { y: 48, opacity: 0, duration: 0.6, ease: "power3.out" }, 0);
  tl.to(".accent", { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.25);

  window.__timelines["main"] = tl; // key must equal data-composition-id on the composition root
</script>
```

- 注册键必须与 composition 根节点的 `data-composition-id` 一致。
- 方括号和点号两种语法都能注册：`window.__timelines["main"] = tl` 和 `window.__timelines.main = tl` 是等价的（linter 两种都认）。当 id 不是合法标识符时（例如含有 `-`），必须用方括号形式。
- 对于影响渲染结果的运动，不要调用 `tl.play()`。
- 在 `document.fonts.ready` 这类异步回调里构建是支持的，也很常见。会出问题的是**在构建完成之前就注册键**：提前注册的空 timeline 会被当作已就绪，并以空的状态被嵌套，于是渲染出空白（`lint`：`gsap_timeline_registered_before_async_build`，error）。在回调的末尾再赋值 `window.__timelines[id] = tl`。不要用定时器或事件处理函数驱动影响渲染结果的运动。
- 让循环保持有限。HyperFrames 渲染的是有限时长的视频。
- **渲染时长来自 composition 根节点上的 `data-duration`，而不是 GSAP timeline 的长度。** 不要用 `tl.set({}, {}, 283)` 这类空 tween 去填充 timeline 来"延长"它。（一些外部文档展示过这个技巧；在 HyperFrames 里它与 seek 驱动的时长模型冲突 —— 请改为设置 `data-duration`。）

## 核心 Tween 方法

- **gsap.to(targets, vars)** —— 从当前状态动画到 `vars`。最常用。
- **gsap.from(targets, vars)** —— 从 `vars` 动画到当前状态（入场）。
- **gsap.fromTo(targets, fromVars, toVars)** —— 显式指定起点和终点。
- **gsap.set(targets, vars)** —— 立即应用（duration 为 0）。

属性名一律用 **camelCase**（例如 `backgroundColor`、`rotationX`）。

## 常用 vars（速查）

- **duration** —— 秒（默认 0.5）。
- **delay** —— 开始前等待的秒数。
- **ease** —— `"power1.out"`（默认）、`"power3.inOut"`、`"back.out(1.7)"`、`"elastic.out(1, 0.3)"`、`"none"`。见 `./gsap-easing-and-stagger.md`。
- **stagger** —— 数字或对象。见 `./gsap-easing-and-stagger.md`。
- **repeat** —— 有限的数字；在 HyperFrames 里绝不用 `-1`。根据可见时长计算重复次数。
- **yoyo** —— 配合 repeat 交替方向。
- **overwrite** —— `false`（默认）、`true` 或 `"auto"`。
- **immediateRender** —— 对 from()/fromTo() 默认为 `true`。对同一属性+元素的后续 tween 设为 `false`。
- **onComplete**、**onStart**、**onUpdate** —— 回调。

transform、autoAlpha、clearProps 和 SVG 相关内容见 `./gsap-transforms-and-perf.md`。

## 可动画属性白名单

HyperFrames 比原生 GSAP 更严格。只给以下属性做动画：

- **合成器开销低**：`opacity`、`x`、`y`、`scale`、`scaleX`、`scaleY`、`rotation`、`rotationX`、`rotationY`、`skewX`、`skewY`、`transformOrigin`
- **视觉填充**：`color`、`backgroundColor`、`borderColor`、`borderRadius`
- **CSS 变量**：`"--hue": 180` 等。
- **媒体 `volume`**（在 `<audio>` / `<video>` 上）：不要为了淡入淡出或闪避（duck）去 tween 它；请用 `data-automation` 音量 lane（见 `hyperframes-core` 中的 `creator-editing-recipes.md`）。同一元素上 lane 优先于 tween。
- **DOM 文本 `innerText`**（用于数字计数器）：直接 tween 它，例如 `tl.to(el, { innerText: 100, snap: { innerText: 1 } })` —— `snap` 让它保持整数；GSAP inspector 会把它识别为计数器。等价于 `../rules/counting-dynamic-scale.md` 中的 `onUpdate` 代理写法；需要本地化格式（`toLocaleString`）或后缀逻辑时优先用那种代理写法，并在数字需要变大时搭配一个独立的 transform-scale tween。

**避免**（改用 transform 别名）：

- `width` / `height` / `top` / `left` / `right` / `bottom` / `margin*` / `padding*` —— 会触发布局重排。改用 `scaleX/Y`（配合 `transformOrigin`）或 `x` / `y`。

**禁止**（会破坏渲染器或 clip 生命周期）：

- `display`、**clip 元素上的**原始 `visibility`：绝不对它们做带时长的 tween。clip 的可见性归 HyperFrames 管，`lint` 会拒绝这种写法。改用 `autoAlpha`（opacity 加端点处的 visibility），或在明确的边界处做一次零时长的 timeline set。给 clip 元素的其他视觉属性做动画没问题，自带的 catalog 里处处都这么做；被禁止的是接管它的可见性。
- 任何由 `Math.random()`、`Date.now()`、`performance.now()` 或事件处理函数驱动的东西 —— 动画状态必须仅凭时间就能确定性地得出。

> **注意**：上面的列表是**黑名单**，不是白名单。列表之外的属性，包括 `width`、`height`、`filter`、`clipPath` 和 `strokeDashoffset`，都是合法的目标；在可以选择时优先用 transform 和 opacity，这是出于性能考虑而不是正确性。完整的确定性渲染契约见 `hyperframes-core/references/determinism-rules.md`。

## 参考

- `./gsap-timeline-and-labels.md` —— timeline 创建、位置参数（`+=`、`<`、`>`）、label、嵌套、sub-comp 优先用 `fromTo`、播放控制。
- `./gsap-easing-and-stagger.md` —— easing 家族、stagger 对象、基于函数的值、`gsap.matchMedia()`、`gsap.defaults()`。
- `./gsap-transforms-and-perf.md` —— transform 别名、autoAlpha、`quickTo`、`will-change`、性能规则。
- `../rules/gsap-effects.md` —— 即插即用的配方：打字机（带光标 / 退格 / 单词轮换）+ 音频可视化（使用 `skills/hyperframes-creative/scripts/extract-audio-data.py`）。

## 最佳实践

- 属性名用 camelCase；优先用 transform 别名和 autoAlpha。
- 优先用 timeline，而不是靠 delay 串起来的 tween；使用位置参数。
- 用 `addLabel()` 添加 label，让编排易读。
- 把 defaults 传进 timeline 构造函数。
- 需要控制播放时，保存 tween/timeline 的返回值。

## 不要

- 在 transform 够用的情况下给布局属性（`width`/`height`/`top`/`left`）做动画。
- 在同一个 SVG 元素上同时使用 `svgOrigin` 和 `transformOrigin`。
- 在 timeline 可以编排的情况下用 `delay` 串联动画。
- 在 DOM 存在之前就创建 tween。
- 在根节点没有有限 `data-duration` 的情况下使用无限的 `repeat: -1`（有的话，导出会截取到那个时间窗口）；当循环必须在 composition 结束之前停止时，使用根据可见时长计算出的有限重复次数。

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/gsap.ts`。
- GSAP 文档：https://gsap.com/docs/v3/
- GSAP timeline 的 pause 与 seek 行为：https://gsap.com/docs/v3/GSAP/Timeline/pause%28%29/
