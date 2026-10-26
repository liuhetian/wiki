# 渲染适配器

适配器是唯一知道影片如何变成像素的东西。美术核心永远看不见任何一个适配器。

每个适配器都导出同样的四样东西，所以 `tools/gate.mjs` 能用同一条及格线衡量其中任何一个，而不必知道手上拿到的是哪一个：

```js
export const name = "html-player";              // what to call it in a report
export const describe = () => "one sentence";   // what this adapter DELIVERS
export const probe = () => ({ ok, why });       // can it run here, and if not, why not
export const open = async (env, film, opts) => session;
```

`opts` 携带 `{ scale, workers }`。`workers` 是会话运行的独立绘图上下文数量；闸门用它换一种方式把同样的帧重画一遍，并检查两次结果是否一致。会话是这样的：

```js
{ workers,                       // how many it actually opened
  info(),                        // -> film.meta
  frame(n, w),                   // -> { png: Buffer, shot, drawMs }
  hash(n, w),                    // -> stable hex digest of the drawn pixels
  audio(sampleRate),             // -> { sampleRate, frames, float32 } | null (interleaved stereo)
  artifact(),                    // -> { path, kind, bytes, checks: [{ok,label,detail}] } | null
  close() }
```

## 四个适配器

| 适配器 | 交付什么 | 在这里能否运行 |
| --- | --- | --- |
| `playwright` | 帧，作为得到 MP4 的手段 | 能 |
| `html-player` | **页面本身**：一个自包含、可离线打开的 HTML 文件 | 能 |
| `remotion` | 经由 Remotion `<Composition>` 产出的帧，每帧一张静帧 | 能（`remotion@4.0.522`） |
| `hyperframes` | 由 Hyperframes 引擎在无头 Chrome 里定位（seek）取得的帧 | 不能：先 `npm i -D @hyperframes/engine`（需要 Node >= 22、Chrome、ffmpeg），再 `node tools/gate.mjs <film> --adapter hyperframes` |

每个适配器都通过同一个纯函数 `renderFrame(film, ctx, frame, env)` 和同一个 `film.audio(sampleRate)` 接触美术部分。从 `src/canvas-core` 里看不见其中任何一个。

有两点值得记住：

- **`remotion` 每一帧都是冷渲染**（一张静帧就是一个独立页面），所以它能证明第 N 帧不欠前面任何一帧的东西，但它**抓不到**过期缓存。`html-player` 让所有帧共享一份热缓存，能抓到。它们检查的东西不同；两个都要跑。
- **`hyperframes` 没有安装**，所以它在 node 一侧的捕获调用从来没有运行过。它在页面一侧的 FrameAdapter 已经单独证明过：由 `node tools/verify-frame-adapter.mjs` 按 Hyperframes 公开发布的契约检验，包括有限的时长、向前 / 向后 / 随机定位、同一帧状态相同，以及定位后得到的像素与普通播放器的完全一致。

`artifact()` 是适配器自己的交付物，如果它有的话。playwright 适配器没有：它只是得到 MP4 的手段。html-player 适配器的交付物**就是**页面，所以它返回这个页面，并声明让这个页面值得交付的那些检查项。

## 闸门

`node tools/gate.mjs <film> [--adapter html-player] [--mp4 out/x.mp4] [--samples 12]`

三项检查，结果为 PASS/FAIL，任何一项失败都以非零状态退出：

1. **确定性**：同样的采样帧画两遍，用两种不同的 worker 数、按两种不同的顺序。要么逐字节一致，要么 PSNR 高于 45 dB。
2. **契约**：对影片作画时经过的每个模块做静态扫描：不许有 `Math.random`、`Date`、`performance.now`、`ctx.filter`、网络访问或图片 / 字体素材；所有随机性都经由 `rng(seed)`。
3. **冷场**：没有完全相同的连续帧，也没有哪个 15 帧窗口的变化面积低于 0.5 %，测量对象是一个已经渲染好的 MP4，闸门对它永远**只读**。
