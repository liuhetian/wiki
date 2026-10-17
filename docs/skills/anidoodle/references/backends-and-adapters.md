<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/backends-and-adapters.md -->
# 后端与适配器

一个美术核心，四个后端，而核心看不见其中任何一个。适配器是唯一知道影片如何变成像素的东西。

## 接口

每个适配器都导出同样的四样东西，所以 `tools/gate.mjs` 能用同一条及格线衡量其中任何一个，而不必知道手上拿的是哪一个：

```js
export const name = "html-player";
export const describe = () => "one sentence: what this adapter DELIVERS";
export const probe = () => ({ ok, why });        // can it run here, and if not, why not
export const open = async (film, { scale, workers }) => session;
```

会话（session）是这样的：

```js
{ workers,                  // how many independent draw contexts it actually opened
  info(),                   // -> film.meta
  frame(n, w),              // -> { png: Buffer, shot, drawMs }
  hash(n, w),               // -> stable digest of the drawn pixels
  audio(sampleRate),        // -> { sampleRate, frames, pcm16 } | null
  artifact(),               // -> the adapter's own deliverable, or null
  close() }
```

`workers` 是独立上下文的数量，闸门用它换一种方式把同样的帧重画一遍。这个测试比听上去更强：每个实例都有自己的纹理瓦片、自己的图层池和自己的缓存，所以两个实例结果一致，就说明缓存确实是按像素所依赖的东西建键的，而不是按某人碰巧请求帧的顺序。

## 四个适配器

| 适配器 | 交付什么 | 需要什么 |
|---|---|---|
| `playwright` | 帧，作为得到 MP4 的手段 | playwright + 一个 chromium 构建 |
| `html-player` | **页面本身**：一个自包含、可离线打开的 HTML 文件 | playwright + 一个 chromium 构建 |
| `remotion` | 经由 Remotion `<Composition>` 产出的帧 | `remotion`、`@remotion/bundler`、`@remotion/renderer` |
| `hyperframes` | 由 Hyperframes 引擎在无头 Chrome 里定位（seek）取得的帧（本站收录了 [HyperFrames 的 skill](../../hyperframes/index.md)） | `@hyperframes/engine`、Node >= 22、ffmpeg |

## 热和冷抓到的是不同的 bug

这是唯一需要带走的一点。

- **`html-player` 让所有帧共享一份热缓存。** 它能抓到没把像素所依赖的东西写全的缓存键，因为它在同一个会话里先画第 512 帧、再画第 128 帧，然后做比较。
- **`remotion` 每一帧都是冷渲染**：每张静帧都有自己的页面、自己的模块状态、自己的缓存。它能证明第 N 帧不欠前面任何一帧的东西，但它**抓不到**过期缓存，因为根本就不存在可以过期的缓存。

在这部影片里，图版合成器中确实藏着一处顺序依赖：五个缓存的绘图表面把线条的「抖动」（boil）烘进了像素，却没把它写进键里。热适配器发现了它，还指出了投毒的那一帧。冷适配器则高高兴兴地通过了。**两个都要跑。哪一个都不是完整的及格线。**

## 写一个新的适配器

适配器九成是管道活；影片本来就是帧号的纯函数，而这正是每一个后端真正想要的。有两个陷阱，都付过代价：

- **Remotion 在 React 提交（commit）时截图**，而刚提交的 `<canvas>` 在 effect 运行之前是空白的。用 `delayRender` / `continueRender` 把绘制包起来、按住这一帧，否则你会交出一张张空白画面，而且它们能通过每一项哈希检查，因为它们始终如一地空白。
- **不要通过 props 传递影片。** 一个 `Film` 里带着函数（每个镜头的 `draw`、配乐），而大多数框架会序列化 props。改用闭包把它包进去。

对于驱动一个**可定位（seekable）的页面**而不是组件的后端，页面一侧的契约很小，这个引擎已经满足了：有限的帧数，向前、向后和随机定位，以及同一帧再次被请求时状态相同。`window.FILM.seek(n)` 就是全部实现。`tools/verify-frame-adapter.mjs` 用 playwright 按这份契约检验这类适配器，这意味着你可以在后端安装**之前**就证明页面那一半没问题。

## 如果某个后端没有安装

就照实说。把对它的每一处引用都放在 `open()` 里的动态 import 后面，让这个文件能干净地被导入；让 `probe()` 说出缺了什么、怎么装上；让闸门报告 `CANNOT RUN`（退出码 2），而不是报失败。然后检查那个模块确实导出了你要调用的东西，如果没有，就说出它实际导出了什么。没有安装的后端应该报告自己没有安装，永远不应该悄悄给出一个错误的答案。
