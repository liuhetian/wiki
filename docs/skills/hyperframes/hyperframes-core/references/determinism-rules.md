<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/determinism-rules.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 确定性、动画 Runtime 与布局

HyperFrames 逐帧 seek composition。每一帧都必须仅凭其时间值就能复现 —— 相同的输入时间 → 相同的像素。有三份契约来保证这一点：**动画 runtime 契约**、**确定性规则**和**布局契约**。

## 动画 Runtime 契约

GSAP 是主要的 runtime。核心要求是通用的：动画状态必须能根据 HyperFrames 时间进行 seek。

对于 GSAP：

- 使用 `gsap.timeline({ paused: true })`。
- 把它注册到 `window.__timelines["<composition-id>"]` 上，键为 composition 根元素的 `data-composition-id`。你**不**需要先写 `window.__timelines = window.__timelines || {}`：runtime 会在你的内联脚本求值之前创建好注册表。
- **在异步回调里构建是受支持的。** `document.fonts.ready(...)` 之类就是文档里写明的初始化路径。你绝不能做的是**在构建完成之前注册这个键**。提前注册的空 timeline 会被视为已就绪并以空的状态被嵌套，于是动画渲染出来一片空白（`lint`：`gsap_timeline_registered_before_async_build`，error）。在回调的**末尾**、所有 tween 都添加完之后，再赋值 `window.__timelines[id] = tl`，并且可以选择紧接着调用 `window.__hfForceTimelineRebind()`。
- 如果键与根元素的 `data-composition-id` 不一致，**当它是唯一一条已注册的 timeline 时**，runtime 仍然会绑定它。如果注册了两条或更多，不一致的键会让渲染冻结在 t=0。
- 对于渲染关键的运动，**不要**调用 `tl.play()`。
- **不要**只为了设定时长而创建空 tween；改为在 clip 上使用 `data-duration`。

tween 语法、position 参数、easing 和性能规则，请使用 `hyperframes-animation` skill。非 GSAP 的时长推断见 `hyperframes-animation/adapters/`。

## 确定性规则

渲染出的帧必须能根据所请求的时间复现。**不要**把下面任何一项用于视觉状态：

- `Date.now()`、`performance.now()` 或任何渲染时的时钟。
- 未设种子的 `Math.random()`。如果需要看起来随机的摆放，使用设了种子的 PRNG。
- 渲染时通过网络获取必需的素材。把它们内联或预先打包。
- 悬停、滚动、指针或焦点状态。渲染器没有输入事件。
- 无边界的无限循环。只有当根元素声明了有限的 `data-duration` 时才允许 `repeat: -1` —— 确定性的 seek 和导出会截断到这个明确的窗口（`gsap_infinite_repeat` 降级为警告）。如果没有有限的 composition 时长，它仍然是硬性 error：timeline 可能报告一个无边界的长度，导致渲染规划失败。当循环本身必须在 composition 结束**之前**结束时，计算一个有限的次数：`repeat: Math.max(0, Math.floor(duration / cycleDuration) - 1)` —— **用 `floor`，不要用 `ceil`**（`ceil` 会超出 `data-duration` 并触发 `gsap_repeat_ceil_overshoot` lint；`max(0, …)` 用来避免负的 repeat = 无限）。

另外还要避免：

- **在 clip 元素上**对 `display`、原始 `visibility` 或 `autoAlpha` 做 tween：clip 的可见性由 HyperFrames 的计时掌管，`lint` 会拒绝它（`gsap_animates_clip_element`）。用 `opacity` 做淡入淡出，或者对一个子包裹层做 tween。不要对 `class="clip"` 做 tween。
- 可动画属性没有固定的允许清单。`lint` 执行的是一份**禁止清单**，所以 `filter`、`clipPath`、`strokeDashoffset`、`width`、`height` 等都是合法的目标。在可以选择时，优先用 transform 和 opacity，这是出于性能考虑，而不是正确性。各 runtime 的细节见 `hyperframes-animation/adapters/`。
- 同一时间从多条 timeline 对同一元素的同一属性做动画 —— GSAP 的覆盖行为取决于顺序，在不同次渲染之间可能会翻转。

## 布局契约

先用静态 HTML 和 CSS 搭出可见的最终状态，然后再从该状态出发 / 向该状态做动画。

- composition 根元素有固定的像素画面尺寸。
- **根 composition 的总时长（渲染时长 / 帧数）在编译时就固定了**，它和 `data-width` / `data-height` 一样，在脚本运行之前从静态的根 `data-duration` 读取一次。之后由脚本或 `--variables` 值改写的根 `data-duration` 会被忽略。要让每次输出的渲染时长不同，就直接编写根元素的 `data-duration`。（_clip_ 自己的 `data-duration` 会从实时 DOM 重新读取，所以脚本 / 变量仍然可以驱动 clip 的长度。只有当根元素省略 `data-duration` 时，渲染器才会探测实时 DOM / timeline 来获得总时长。）
- 场景容器应当用 `width: 100%; height: 100%; box-sizing: border-box` 填满场景。
- 布局使用 padding、flex、grid 和 `max-width`。当布局容器能做到时，避免用硬编码的 `top`/`left` 偏移来定位主要内容。
- `position: absolute` 用于图层和装饰元素，不要把它当作默认的内容布局策略。
- 动画优先使用 transform 和 opacity。
- 让文字留在它预定的容器内。对于动态文字，使用 `max-width`、自动换行，或者 `window.__hyperframes.fitTextFontSize(text, { maxWidth, fontFamily, fontWeight })`。
- 要在不触发 DOM 重排的情况下测量文字，使用 `window.__hyperframes.pretext`。在 canvas 上测量，而不是写进页面再读回来，这样就不会有任何重排：先 `pretext.prepare(text, font)`，再 `pretext.layout(prepared, maxWidth, lineHeight)` → `{ lineCount, height }`。`prepare` 负责字体测量；对已 prepare 的字符串，后续的一切都只是算术运算，便宜到可以每帧都跑。`fitTextFontSize` 就构建在它之上。
  - `layout` 给你的是高度，不是宽度。要让容器按其文字确定尺寸（收缩包裹），使用 `pretext.prepareWithSegments(text, font)`，然后用 `pretext.measureNaturalWidth(prepared)` 获取单行宽度，或用 `pretext.measureLineStats(prepared, maxWidth)` 获取 `{ lineCount, maxLineWidth }`。
  - `font` 是一个 CSS font 简写字符串，例如 `"700 90px Inter"`。
  - `clearCache` 和 `setLocale` 被有意地没有暴露出来：它们会修改在 composition 之间共享的状态，这会让一次渲染依赖于在它之前运行过什么。
- 正文文字里**不要**使用 `<br>`。强制换行无视实际渲染出的字体宽度，当这一行本来就会自然换行时，它会多产生一次换行，导致重叠。用 `max-width` 让文字自动换行。例外：每个词被有意单独放在一行的短展示标题。
- **被变换的元素必须是块级元素并且有尺寸。** `transform`/`scaleX`/`scaleY` 对行内 `<span>` 不起作用，而缩放一个自动宽度（0px）的元素什么也显示不出来 → 条形 / 填充不可见。给它们 `display: block`/`inline-block`/flex 子项，**并且**给一个真实的 `width`/`height`（例如在有尺寸的父元素内用 `width: 100%`）。_（静默 —— 自动闸门可能漏掉它。）_
- **会脉冲或过冲的绝对定位装饰元素**（`yoyo` 缩放、`back.out`）需要按其**峰值**尺寸留出余量，并且不能跨在 `overflow: hidden` 的边缘上 —— 否则它们会与相邻元素重叠或被裁掉。按最大的那一帧来定位，而不是按静止时的那一帧。_（静默。）_
