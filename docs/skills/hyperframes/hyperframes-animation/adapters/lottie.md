---
name: hyperframes-lottie
description: >
  HyperFrames 的 Lottie 与 dotLottie adapter 模式。在嵌入 lottie-web JSON 动画、.lottie 文件、@lottiefiles/dotlottie-web 播放器，把实例注册到 window.__hfLottie 上，或让 After Effects 导出在 HyperFrames 中变得确定性时使用。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/lottie.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# HyperFrames 中的 Lottie

HyperFrames 通过它的 `lottie` runtime adapter，既能 seek `lottie-web` 播放器，也能 seek dotLottie 播放器。Lottie 非常契合，因为动画的时间线已经编码在素材里；HyperFrames 只需要一个它能 seek 的播放器对象。

## 契约

- 从本地项目文件加载素材，通常放在 `assets/` 下。
- 设置 `autoplay: false`。
- 一次性动画用 `loop: false`，循环动画（行走、待机、加载转圈）用 `loop: true`。循环动画会被 seek 到「composition 时间对它自身长度取模」的位置，所以它会在整个场景中持续循环；一次性动画则停在最后一帧。务必设置 `loop`：lottie-web 会把缺失的 `loop` 当作 `true`。数字形式的 `loop` 次数在 seek 模式下不会重复；请把重复次数烘焙进文件。
- 把每个返回的动画或播放器都注册到 `window.__hfLottie` 上。
- 用 CSS 让 Lottie 容器的尺寸保持稳定。

adapter 用 `goToAndStop(timeMs, false)` seek `lottie-web`，对 dotLottie 则根据播放器的形态使用按帧或按百分比的 API。

## lottie-web 模式

```html
<div id="logo-lottie" class="lottie-layer"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
  const anim = lottie.loadAnimation({
    container: document.getElementById("logo-lottie"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "assets/logo-reveal.json",
  });

  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(anim);
</script>
```

```css
.lottie-layer {
  width: 100%;
  height: 100%;
}
```

## dotLottie 模式

```html
<canvas id="product-lottie" class="lottie-canvas"></canvas>
<script src="https://unpkg.com/@lottiefiles/dotlottie-web"></script>
<script>
  const player = new DotLottie({
    canvas: document.getElementById("product-lottie"),
    src: "assets/product-flow.lottie",
    autoplay: false,
    loop: false,
  });

  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(player);
</script>
```

```css
.lottie-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
```

## 多个动画

把每个播放器都推进同一个注册表：

```js
window.__hfLottie = window.__hfLottie || [];
window.__hfLottie.push(backgroundAnim);
window.__hfLottie.push(iconAnim);
window.__hfLottie.push(confettiAnim);
```

HyperFrames 会把它们全部 seek 到同一个 composition 时间。

## Composition 时长

渲染引擎需要知道 composition 的总长度。GSAP timeline 会自动报告时长；纯 Lottie 的 composition 没有 timeline 对象，所以 runtime 直接读取已注册动画的原生长度 —— 对 `lottie-web` 是 `totalFrames / frameRate`，对 dotLottie 是播放器自己的 `duration`。对 Lottie composition 来说，根元素上的 `data-duration` 是可选的：只要每个动画都注册到了 `window.__hfLottie` 上（按上面的契约），runtime 就有一个有限的时长可用。用 `loop: true` 时，这个长度是一个循环周期，所以在更长的场景里，循环的 Lottie 需要 `data-duration` 或一个 GSAP timeline 来设定场景长度。

## 角色

对于会行走、做手势或做出反应的角色（吉祥物、行走循环、关节木偶），把表演放在一个 Lottie 里，把舞台交给 GSAP：

- **Lottie 负责身体。** 行走、停下、指向和待机都存在文件自己的时间线里，这样四肢保持关节相连，双脚也完全按动画师的设计稳稳踩地。
- **GSAP 负责周围的一切。** 卡片、字幕和镜头运动放在暂停的 timeline 上，按 Lottie 的段落节拍定时。从文件的 `markers` 数组读取节拍时间（`tm` 以帧为单位，除以 `fr`），或者从动画师的备注里读取。
- **每个注册的动画都按 composition 时间播放。** 没有逐动画的起始偏移，所以一个应在 4 s 开始的手势，在它的文件内部也必须从 4 s 开始。把整段表演做成一个 Lottie，或者在文件内部偏移动作，而不是叠放多个独立的动作文件。
- **短循环没问题。** 一个 1 s 的行走循环配上 `loop: true` 会在整个场景中循环。只有当循环是原地行走时，才用 GSAP 的 `x` 让角色横穿舞台，并让移动速度与步幅匹配，否则脚会打滑。
- **角色要有授权。** 使用用户或其设计师制作的文件，或者许可证允许再分发的文件，并说明它的来源。绝不要交付从某个网站扒下来的角色。

`lottie-character-walk` registry block 是一个可运行的示例：一个关节式的扁平角色踩着稳稳的步子走进来，停下，然后指向一张卡片，这张卡片由 GSAP 在指向的那一刻带入（`npx hyperframes add lottie-character-walk`）。

## 适用场景

- 已知能在 lottie-web 中正确渲染的 After Effects 导出。
- Logo 揭示、图标循环、装饰性点缀，以及产品 UI 动效。
- 角色：行走循环、吉祥物、手势（见上文"角色"）。
- 把 Remotion 中的 Lottie 用法转换为纯 HyperFrames HTML。

## 避免

- 在渲染时依赖远程的 `path` URL。
- 用 `play()` 启动播放。
- 假定不受支持的 After Effects 效果能在导出后保留下来。先在浏览器里测试 JSON 或 `.lottie` 文件。
- 异步加载播放器，并在 HyperFrames 校验已经检查过页面之后才注册它。

## 校验

编辑 Lottie composition 之后：

```bash
npx hyperframes lint
npx hyperframes check
```

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/lottie.ts`。
- 时长自动推断：`packages/core/src/runtime/init.ts`（`resolveAdapterDurationFloorSeconds`），以及上述 adapter 中的 `getInferredDurationSeconds`。
- Airbnb 出品的 lottie-web：https://github.com/airbnb/lottie-web
- lottie-web 的 `loadAnimation` 选项：https://github.com/airbnb/lottie-web/wiki/loadAnimation-options
- LottieFiles 出品的 dotLottie web 播放器方法：https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/methods
