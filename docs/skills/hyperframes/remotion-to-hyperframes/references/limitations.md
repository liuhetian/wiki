# 翻译的局限

本 skill 明确无法翻译的内容，与阻断项清单（由 `lint_source.py` 强制执行）分开列出。这些是*已知的*缺口 —— 在翻译它们所在的 composition 时，把它们作为翻译说明呈现给用户。

## 本 skill 拒绝的 React 模式

见 [escape-hatch.md](escape-hatch.md)。以下任何一项都会触发退出：

- 用 `useState`、`useReducer` 驱动动画
- 依赖数组非空的 `useEffect` / `useLayoutEffect`（副作用）
- 异步的 `calculateMetadata`
- 第三方 React UI 库（MUI、Chakra、Mantine、antd、shadcn、Radix、NextUI）

`@remotion/lambda` 已经不在这份清单里了 —— 它是警告，不是阻断项，因为 Lambda 配置与 composition 的渲染无关。本 skill 会去掉相关 import 和 `renderMediaOnLambda(...)` 调用，并在 `TRANSLATION_NOTES.md` 中写一条记录。见 [escape-hatch.md](escape-hatch.md)。

## 能用但有注意事项的模式

### `<Audio>` 上的音量渐变

Remotion 的 `volume` 可以接受一个函数：

```tsx
<Audio src={...} volume={(f) => interpolate(f, [0, 30], [0, 1])} />
```

HF 通过 `<audio>` 上的一条 `data-automation` 音量自动化通道（lane）来做音量渐变（写法见 `hyperframes-core/references/creator-editing-recipes.md`）。翻译方式：根据 `interpolate` 的各个点写出这条通道，或者用 `ffmpeg afade` 把渐变直接烧进音频文件。如果走去掉渐变的路径，输出听起来会不同，但视频画面完全一样，所以 SSIM 能通过 —— 只需标注出来。

### 带有状态子元素的 `<Loop>`

```tsx
<Loop durationInFrames={30}>
  <CounterThatIncrementsViaUseRef />
</Loop>
```

一个有界的 GSAP repeat，只要其有限次数是由可见时长推导出来的，就能复现*视觉上*的重复。如果被循环的子元素带有跨迭代的状态（一个计数器、一个随机种子），HF 无法在每次迭代中一模一样地复现它。除非子元素在每次迭代中都是完全确定性的，否则就退出；只有当根元素声明了有限的 `data-duration` 时，才使用 `repeat: -1`。

### 带 crossOrigin 的 Remotion `<Img>`

```tsx
<Img src="https://other-domain.com/x.png" crossOrigin="anonymous" />
```

HF 的渲染器执行 CORS 的方式与 Remotion 不同。大多数公开图片都能用；需要带认证 header 才能访问的私有图片则不行。如果源码使用了 `crossOrigin="use-credentials"`，就需要在翻译时把这个素材下载下来并内联。

### `<TransitionSeries>` 中的自定义 `presentation`

```tsx
const customPresentation: PresentationComponent = ({ children, presentationProgress }) => {
  return <div style={{ filter: `blur(${(1 - presentationProgress) * 20}px)` }}>{children}</div>;
};
```

纯的 presentation（由进度计算出 transform/filter/opacity）可以干净地翻译成 GSAP tween。在内部读取 `useCurrentFrame()` 或带有状态子元素的 presentation 则不行 —— 退出。

### 代码分割的组件（`React.lazy`）

```tsx
const HeavyChart = React.lazy(() => import("./HeavyChart"));
```

`React.lazy` 是异步的，不符合确定性渲染模型。翻译成普通的 import；得到的 HF composition 只是会在一开始就包含全部代码而已。

## 始终能用的模式

- `<AbsoluteFill>` 和 `<Sequence>`（任意嵌套）
- 由 `useCurrentFrame()` 推导出的值：`interpolate`、`spring`、`Easing`、`interpolateColors`、手写的数学计算
- 只带简单 props 的 `<Audio>`、`<Video>`、`<Img>`、`<IFrame>`
- `staticFile()` 引用
- 作为 props 纯函数的自定义 React 子组件
- 作为 `useCurrentFrame` 纯推导的自定义 hook
- `@remotion/lottie`（翻译为 HF 的 Lottie adapter）
- `@remotion/google-fonts/<Family>`（翻译为 `<link>` 或 `@font-face`）
- 同步的 `calculateMetadata`（在翻译时求值）
- 使用内置 presentation（`fade`、`slide`、`wipe`、`clockWipe`、`flip`、`iris`）的 `<TransitionSeries>`

## 本 skill 从不尝试翻译的内容

这些按设计就不在范围内：

- **HDR 渲染** —— HF 支持 HDR，但 Remotion 不支持，所以没有可供翻译的来源。
- **可变帧率** —— 两个工具都假定 fps 恒定。
- **包含多个 composition 的 `<Composition>` 列表** —— 一次翻译一个。本 skill 会提示用户选择要翻译哪个 composition。
- **Remotion Studio 的 props 面板** —— 在 HF Studio 中可视化地编辑 prop 需要不同的基础设施；不在范围内。

## 向用户报告缺口

当翻译产出了*某些东西*、但这些东西存在缺口时，在输出旁边写一份 `TRANSLATION_NOTES.md`：

```markdown
# Translation notes

The following Remotion patterns were translated with caveats:

- `<Audio volume={(f) => ...}>` (line 15): volume ramp written as a
  `data-automation` volume lane (see `creator-editing-recipes.md`); the
  ffmpeg `afade` bake-in is the alternative.
- `<HeavyChart>` (line 30): translated as inline HTML. The original
  React.lazy boundary was dropped — bundle size unchanged because HF
  serves a single HTML file.

If any of these caveats matter, consider the runtime interop pattern
instead.
```

这个文件同样由本 skill 与 HF 输出一起生成，不保存在语料库中。
