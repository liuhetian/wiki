<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/lottie.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Lottie 翻译：@remotion/lottie → HF lottie adapter

Lottie 动画是一个可以干净翻译的情形 —— HF 内置了一个 [Lottie adapter](https://github.com/heygen-com/hyperframes/blob/main/packages/core/src/runtime/adapters/lottie.ts)，同时支持 `lottie-web` 和 `@lottiefiles/dotlottie-web`。这个 adapter 会自动发现注册在 `window.__hfLottie` 上的动画，并通过 `goToAndStop` 逐帧 seek 它们。

## 模式

```tsx
import { Lottie } from "@remotion/lottie";
import animationData from "./hello.json";

export const MyComp = () => (
  <AbsoluteFill>
    <Lottie animationData={animationData} loop={false} />
  </AbsoluteFill>
);
```

翻译为：

```html
<div id="stage" ...>
  <div id="lottie-anim" style="width:100%;height:100%"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
  <script>
    const anim = lottie.loadAnimation({
      container: document.getElementById("lottie-anim"),
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "assets/hello.json",
    });
    window.__hfLottie = window.__hfLottie || [];
    window.__hfLottie.push(anim);
  </script>
</div>
```

与典型的 Lottie 嵌入相比，关键区别在于：

- `autoplay: false` —— HF 通过 seek 来驱动播放
- 通常是 `loop: false`（除非 Remotion 中是 `loop={true}`）
- `window.__hfLottie.push(anim)` 正是把动画挂接到 HF 逐帧 seek 上的那一步

## 素材处理

Remotion 通过 webpack import 打包动画 JSON。HF 需要这个 JSON 以文件形式放在磁盘上的 `assets/` 下，并通过路径引用它：

1. 把 `hello.json` 从 Remotion 项目复制到 `hf-src/assets/`。
2. 在 `loadAnimation` 中以 `path: "assets/hello.json"` 引用。

对于 dotlottie（二进制）格式，换用 `@lottiefiles/dotlottie-web`：

```html
<script src="https://unpkg.com/@lottiefiles/dotlottie-web"></script>
<canvas id="anim" style="width:100%;height:100%"></canvas>
<script>
  const player = new DotLottie({
    canvas: document.getElementById("anim"),
    src: "assets/hello.lottie",
    autoplay: false,
  });
  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(player);
</script>
```

HF adapter 能处理这两种播放器 API（它通过鸭子类型区分 `goToAndStop` 与 `setCurrentRawFrameValue` / `seek`）。

## 多个 Lottie 动画

一个 composition 中放多个 `<Lottie>` 实例是可行的 —— 把每一个都 push 到 `window.__hfLottie` 上，adapter 就会同步地 seek 它们全部：

```js
window.__hfLottie.push(anim1);
window.__hfLottie.push(anim2);
window.__hfLottie.push(anim3);
```

## Lottie 源实际上并不会阻断翻译

Lottie 动画自己编码了确定性的 timeline。它们是 Remotion composition 中*最容易*翻译的部分，因为动画逻辑本身已经是自包含的 —— Remotion 和 HF 都不负责给它们"做动画"，两者都只是 seek 它们。翻译成本几乎为零。

## After Effects → Lottie 的局限

Lottie 只支持 After Effects 功能的一个子集。表达式、大多数效果（投影、颜色叠加）、除 Normal/Add/Multiply 之外的所有混合模式、亮度遮罩（luma matte），以及大多数 3D 参数都不受支持。如果 Remotion composition 用到的 Lottie 文件依赖这些功能，那么动画在 Remotion 和 HF 中*都*会坏掉 —— 这不是翻译问题，而是 Lottie 的局限。完整的受支持功能列表见 [airbnb/lottie/after-effects.md](https://github.com/airbnb/lottie/blob/master/after-effects.md)。

## 循环行为

Remotion 的 `loop={true}` 会连续播放动画。把它翻译成播放器上的 `loop: true`：HF adapter 会把 composition 时间折回到动画自身的长度内，于是这个循环会在整个场景中反复播放。它不会附加播放速率缩放；如果需要非默认的速率，就把它烧进 Lottie 素材本身，并检查渲染输出。

## 性能说明

根据 [Lottie adapter](https://github.com/heygen-com/hyperframes/blob/main/packages/core/src/runtime/adapters/lottie.ts) 的文档：lottie-web 的 `goToAndStop(time, isFrame=false)` 接受以毫秒为单位的时间；为了精度，adapter 传入的是 `time * 1000`。这比传入帧号更准确（尤其是对于内部 fps 与 HF 渲染 fps 不一致的动画）。
