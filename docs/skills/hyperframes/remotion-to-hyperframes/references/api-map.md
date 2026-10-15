<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/api-map.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Remotion → HyperFrames API 映射

权威的翻译对照表。开始一次翻译时加载本参考文档，了解高层映射；涉及容易出错的细节（timing、转场等）时，再加载对应的分主题参考文档。

## 如何阅读本表

- **`drop`** = 从输出中整个去掉。由 HF runtime 处理。
- **`see references/X.md`** = 映射并不简单；阅读链接到的文件。
- **`refuse + interop`** = 本 skill 退出不做，转而推荐 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 中的 runtime adapter 模式。

## Composition 根

| Remotion | HyperFrames |
| --- | --- |
| `<Composition id durationInFrames fps width height>` | 根 `<div id="stage" data-composition-id data-start="0" data-duration="<dur/fps>" data-fps data-width data-height>` |
| `defaultProps={...}` | `#stage` 上的 `data-*` 属性（每个标量 prop 一个）。嵌套的对象 / 数组 —— 见 [parameters.md](parameters.md) |
| `schema={z.object(...)}` | 不在 HTML 中体现；schema 只存在于 agent 的翻译步骤里 |
| `calculateMetadata`（同步） | 在翻译时求值，把具体的值写进 `data-*` |
| `calculateMetadata`（异步） | **refuse + interop** —— 见 [escape-hatch.md](escape-hatch.md) |
| `registerRoot(RemotionRoot)` | drop |
| `<AbsoluteFill style>` | `<div style="position:absolute;inset:0;{style}">` |

## 序列编排（Sequencing）

嵌套和错开的细节见 [sequencing.md](sequencing.md)。

| Remotion | HyperFrames |
| --- | --- |
| `<Sequence from={F} durationInFrames={D}>` | 在根里放一个宿主 `<div data-composition-src="compositions/<name>.html" data-start="<F/fps>" data-duration="<D/fps>" data-track-index="N">`，其内容放在那个 sub-composition 文件里（见 [sequencing.md](sequencing.md)） |
| `<Series>` + `<Series.Sequence>` | 同级的场景宿主，`data-start` 值依次递增 |
| `<Loop durationInFrames={D}>` | 不是原语 —— 根据可用时长输出一个有界的 GSAP repeat |
| `<Freeze frame={F}>` | 去掉这层包装；HF 在 seek 驱动的 timeline 之外没有正在运行的动画，所以冻结是空操作 |

## 时间控制（Timing）

见 [timing.md](timing.md) —— 这是收益最高的一节。

| Remotion | HyperFrames |
| --- | --- |
| `useCurrentFrame()` | drop —— HF 会 seek 这条 timeline。由 `frame` 推导出的计算，变成一个暂停的 GSAP tween 上可动画的属性。 |
| 用 `useVideoConfig()` 取 `fps` / `durationInFrames` | drop —— 从 `#stage` 上的 `data-fps` / `data-duration` 读取 |
| `interpolate(frame, [a,b], [x,y])`（线性） | 在偏移 `a/fps` 处的 `gsap.fromTo(t, {p:x}, {p:y, duration:(b-a)/fps, ease:"none"})` |
| `interpolate(frame, [a,b,c,d], [x,y,y,z])`（多段） | 在偏移 `a/fps`、`b/fps`、`c/fps` 处的三次 `gsap.to` 调用 |
| `interpolate(..., {easing: Easing.bezier})` | GSAP `CustomEase.create("c", "M0,0 C${a},${b} ${c},${d} 1,1")` |
| `spring({frame, fps, config: {damping, stiffness, mass}})` | GSAP `back.out(N)` —— damping → 过冲的对照表见 [timing.md](timing.md) |
| `interpolateColors(frame, range, colors)` | `gsap.to({...}, { backgroundColor, color, duration, ease })` —— GSAP 原生支持颜色 tween |
| `Easing.in / .out / .inOut(power)` | GSAP `power<N>.in` / `power<N>.out` / `power<N>.inOut` |

## 媒体

裁剪、音量渐变和解码器相关说明见 [media.md](media.md)。

| Remotion | HyperFrames |
| --- | --- |
| `<Audio src volume>` | `<audio data-start data-duration data-track-index data-volume src>` |
| `<Audio playbackRate startFrom endAt>` | `data-playback-rate`、`data-trim-start`、`data-trim-end` |
| `<Video src>` | 只有当文件带音频流（用 `ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 <file>` 检查：输出非空即表示有音频）且源码没有设 `muted` 或 `volume={0}` 时，才用 `<video playsinline data-has-audio="true" data-start data-duration data-track-index src>`；否则改用 `muted` |
| `<OffthreadVideo>` | `<video>` —— HF 不需要 off-thread 变体（它用的是 headless Chrome） |
| `<Img src>` | `<img>` |
| `<IFrame src>` | `<iframe>` —— 对嵌套的 iframe，HF 会自动回退到截图模式 |
| `staticFile("x.png")` | 根里写 `"assets/x.png"`，`compositions/` 场景文件里写 `"../assets/x.png"` —— 把文件复制到 `hf-src/assets/`，与 `index.html` 相邻 |
| `delayRender()` / `continueRender()` | drop —— HF 通过 Frame Adapter 模式等待素材就绪 |

## 转场

见 [transitions.md](transitions.md)。

| Remotion | HyperFrames |
| --- | --- |
| `<TransitionSeries>` + `<TransitionSeries.Transition presentation={fade()} />` | 在边界处手动用 `gsap.to(scene, {opacity: 0/1, duration})` 做交叉淡化 |
| `slide()`、`wipe()`、`clockWipe()`、`fade()` | HF [shader-transitions](https://hyperframes.heygen.com/catalog/blocks) 包的 preset —— 选最接近的那个 |
| `linearTiming({durationInFrames})` | 以秒为单位的时长（`/fps`） |
| `springTiming({config})` | 以秒为单位的时长，ease 用 `back.out` —— 见 [timing.md](timing.md) |

## Lottie

见 [lottie.md](lottie.md)。

| Remotion | HyperFrames |
| --- | --- |
| `<Lottie animationData={data}>` | `<div id="lottie-N">` + `<script>const anim = lottie.loadAnimation({...}); window.__hfLottie.push(anim)</script>` |
| `loop` / `playbackRate` props | 先检查播放器的 seek 行为再翻译；HF adapter 通过 `goToAndStop` seek 到绝对时间 |
| `@remotion/lottie` runtime | 从 CDN 加载 `lottie-web` —— 去掉 React 包装 |

## 字体

见 [fonts.md](fonts.md)。

| Remotion | HyperFrames |
| --- | --- |
| 来自 `@remotion/google-fonts/<Family>` 的 `loadFont()` | 引用 Google Fonts CSS 的 `@font-face` 规则，或者在 `<head>` 中用 `<link>` 引入 Google Fonts |
| 通过 `@font-face` 引入的本地字体 | 一样 —— 把规则粘贴进 `<style>` |
| 系统字体回退 | 记录字体回退造成的偏差代价（见 [eval.md](eval.md)） |

## 参数

见 [parameters.md](parameters.md)。

| Remotion | HyperFrames |
| --- | --- |
| `z.object({foo: z.string()})` | `#stage` 上的 `data-foo`（schema 隐含在 HTML 结构中） |
| 嵌套数组 prop（`stats[]`） | 带逐实例 `data-*` 属性的重复 HTML 标记 |
| Zod 默认值 | 把默认值直接写死进 HTML |
| Zod 运行时校验 | 不体现；如果校验很重要，就在输出 HTML 之前的翻译步骤里做校验 |

## React 模式

| Remotion | HyperFrames |
| --- | --- |
| 自定义 React 子组件（纯的、由 prop 驱动） | 内联为重复的 HTML，以 prop 接口作为模板 |
| 用 `useState` 驱动动画 | **refuse + interop** |
| 用 `useReducer` 驱动动画 | **refuse + interop** |
| `useEffect(fn, [deps])`（依赖数组非空） | **refuse + interop** |
| `useEffect(fn, [])`（只在挂载时执行一次的副作用） | 去掉这个 effect；如果需要启动时的工作，用 `queueMicrotask` |
| `useCallback`、`useMemo` | 去掉这些包装 —— 只是装饰性的 |
| 自定义 hook（`useCurrentFrame` 的纯推导） | 把函数体内联 |
| 带 state/effect 的自定义 hook | refuse + interop |

## 分布式渲染

`@remotion/lambda` 和 `@remotion/cloudrun` 属于部署配置 —— 与被渲染的 composition 本身无关。本 skill 把它们作为**警告**（而不是阻断项）报出，并在 step 3（生成）中去掉它们，同时在 `TRANSLATION_NOTES.md` 中附上说明。HF 目前只支持单机；把这个缺口记录下来。

| Remotion | HyperFrames |
| --- | --- |
| `@remotion/lambda` import | 去掉这个 import（警告 `r2hf/lambda-import`） |
| `renderMediaOnLambda(...)` | 去掉这个调用；在 `TRANSLATION_NOTES.md` 中记一笔 |
| `@remotion/cloudrun` | 去掉 import + 调用；在 `TRANSLATION_NOTES.md` 中记一笔 |

## 何时彻底退出

只要存在任何阻断模式，就推荐 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 中的 runtime 互操作模式，而不是尝试翻译。见 [escape-hatch.md](escape-hatch.md)。

阻断项记录在 [`scripts/lint_source.py`](../scripts/lint_source.py) 中，并由 [tier-4-escape-hatch](../assets/test-corpus/tier-4-escape-hatch/) 测试。
