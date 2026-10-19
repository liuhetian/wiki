<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/escape-hatch.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 何时退出：runtime 互操作模式

有些 Remotion composition 无法被干净地翻译。本 skill 应当提前识别出它们，并推荐 PR #214[^pull-214] 中的 **runtime 互操作模式**，而不是产出坏掉的 HTML。

## 何时推荐互操作

先运行 `scripts/lint_source.py`。只要它返回任何一个阻断项，就推荐互操作。阻断项有：

| 规则 | 它捕获什么 |
| --- | --- |
| `r2hf/use-state` | 用 useState 驱动动画 |
| `r2hf/use-reducer` | 用 useReducer 驱动动画 |
| `r2hf/use-effect-deps` | 依赖数组非空的 useEffect/useLayoutEffect（副作用） |
| `r2hf/async-metadata` | calculateMetadata 返回一个 Promise |
| `r2hf/third-party-react-ui` | 从 MUI、Chakra、Mantine、antd、shadcn、Radix、NextUI 导入 |

其中每一项都会破坏 HF 所依赖的 seek 驱动、确定性逐帧模型。翻译它们会产出悄无声息出错的输出。

## 互操作模式实际做了什么

根据 PR #214[^pull-214]，这个 runtime adapter 会：

1. 通过 esbuild 把用户的 Remotion 代码与 React + `@remotion/player` 打包在一起。
2. 在一个 HF composition 的 HTML 里挂载一个 Remotion `<Player>`。
3. 在挂载时暂停播放器。
4. 把播放器注册到 `window.__hfRemotion` 上，带 `seekTo(frame)`、`pause()`、`durationInFrames`、`fps`。
5. HF 的渲染循环通过 `seekTo(frame)` 逐帧 seek 这个播放器。

结果：Remotion 的 React 树按 HF 确定性的帧节拍进行渲染。自定义 hook、useState、useEffect、MUI 组件 —— 全都能用，因为渲染是由 Remotion 的 React reconciler 完成的。

## 推荐消息

当本 skill 检测到阻断项时，输出类似下面的内容：

> 这份 Remotion 源码用到了 `useState`（以及其他一些写法），它们无法翻译成 HF 的 seek 驱动 HTML 模型。推荐的路径是 **runtime 互操作模式**：用 `@remotion/player` 打包你的 Remotion 代码，让 HF 逐帧驱动它。
>
> 完整实现见 https://github.com/heygen-com/hyperframes/pull/214。简要说明：
>
> 1. 用 esbuild 打包 `entry.tsx`：`npx esbuild entry.tsx --bundle --outfile=dist/bundle.js --format=iife --jsx=automatic`
> 2. 挂载 Player 并注册到 `window.__hfRemotion` 上：
>
>    ```tsx
>    const playerRef = useRef<PlayerRef>(null);
>    useEffect(() => {
>      playerRef.current?.pause();
>      window.__hfRemotion = window.__hfRemotion || [];
>      window.__hfRemotion.push({
>        seekTo: (f) => playerRef.current?.seekTo(f),
>        pause: () => playerRef.current?.pause(),
>        durationInFrames,
>        fps,
>      });
>    }, []);
>    ```
>
> 3. 在你的 HF `index.html` 中引用这个 bundle，然后照常渲染：`<script src="dist/bundle.js"></script>`

## lint 输出里已经包含了推荐

`lint_source.py` 为每一条发现输出一个 `recommendation` 字段。把它们原样呈现出来 —— 它们是针对每条阻断规则专门调过的：

```json
{
  "rule": "r2hf/use-state",
  "message": "useState detected — Remotion compositions that drive animation via React state are not deterministic frame-capture targets in HyperFrames",
  "recommendation": "Use the runtime interop pattern from PR #214 instead of attempting a translation"
}
```

## 何时不要退出：只有警告

有些模式产生的是警告，而不是阻断项 —— 去掉这些包装后再翻译：

| 规则 | 操作 |
| --- | --- |
| `r2hf/lambda-import` | 去掉 `@remotion/lambda` 配置；HF 单机运行，记录这个缺口 |
| `r2hf/delay-render` | 去掉这个调用；由 HF 处理素材就绪 |
| `r2hf/use-callback` | 去掉包装，把函数内联 |
| `r2hf/use-memo` | 去掉包装，内联计算 |
| `r2hf/custom-hook`（纯的） | 如果 hook 的函数体是 `useCurrentFrame` 的推导，就把它内联 |
| `r2hf/static-file` | 把 `staticFile("x")` 替换成 `"assets/x"` |
| `r2hf/interpolate-colors` | 翻译成 GSAP 颜色 tween（见 [timing.md](timing.md)） |

这些都记录在 T4 的案例 05–07 中。

`r2hf/lambda-import` 是警告 —— 不是阻断项 —— 因为 Lambda 配置与被渲染的 composition 无关。一个原本干净的 Remotion comp，不应该仅仅因为作者还为分布式渲染配置了 AWS Lambda 就翻译失败。本 skill 会在 step 3（生成）中去掉 `@remotion/lambda` 的 import 和 `renderMediaOnLambda(...)` 调用，并在 `TRANSLATION_NOTES.md` 中写一条记录，让用户知道需要另行设置 HF 渲染。

## 源码同时有阻断项和警告时

退出。只要存在一个阻断项，就意味着本 skill 不应尝试翻译 —— 即使 composition 的其余部分是干净的。用户应当对整个东西使用互操作，或者先把阻断模式从他们的 Remotion 源码中重构掉。

[^pull-214]: [PR #214](https://github.com/heygen-com/hyperframes/pull/214)，2026-10-15 读。
