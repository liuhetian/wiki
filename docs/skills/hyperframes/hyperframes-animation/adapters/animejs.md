---
name: hyperframes-animejs
description: >
  HyperFrames 的 Anime.js adapter 用法模式。在 HyperFrames composition 里编写 Anime.js 动画或 timeline、把动画注册到 window.__hfAnime、让 Anime.js 由 seek 驱动且具有确定性，或者把 Anime.js 示例转换成渲染安全的 HyperFrames HTML 时使用。
---

# 用于 HyperFrames 的 Anime.js

HyperFrames 可以通过它的 `animejs` runtime adapter 来 seek Anime.js 实例。动画对象归 composition 所有；时钟归 HyperFrames 所有。

**本页针对 v4（示例锁定在 4.5.0，MIT 许可）。** v4 与 v3 是彻底断裂的 —— 没有可调用的 `anime()`，`easing:` 变成了 `ease:`，ease 名称去掉了 `ease` 前缀。凭记忆写 v3 的代码，产出的 composition 要么抛异常，要么悄无声息地什么都不动。

仓库自己的 producer 测试夹具锁定的是 `animejs@4.0.2/lib/anime.iife.min.js`，它仍然能解析 —— 但那个构建早于下文用到的 `splitText` / `scrambleText` / `createSeededRandom` / `createLayout`，而且 4.1+ 把打包文件移到了 `dist/bundles/`，所以升级版本时路径也要跟着改。

## 契约

- 在 composition 初始化期间同步创建动画或 timeline。
- 设置 `autoplay: false`，让 Anime.js 不按它自己的时钟前进。
- 把返回的每一个动画或 timeline 都注册到 `window.__hfAnime` 上 —— **要显式注册。v4 上没有可用的自动发现**（见"避免"）。
- 使用有限的时长和循环次数。
- 避免根据挂钟时间、网络状态或未设种子的随机数去修改 DOM 的回调。

adapter 用 `instance.seek(timeMs)` 来 seek 每个已注册的实例，其中 `timeMs` 是 HyperFrames 的时间，**单位是毫秒**（`ctx.time` 秒 × 1000）。它还会在每个实例上调用 `pause()` 和 `play()`；任何暴露这三个方法的对象都能用，无论它是由什么创建的。

## 加载 v4

```html
<!-- UMD: the global `anime` is a NAMESPACE OBJECT, not a function -->
<script src="https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.umd.min.js"></script>
```

`anime.animate(...)`、`anime.createTimeline(...)`、`anime.utils.*`、`anime.svg.*`、`anime.stagger(...)`。**调用 `anime(...)` 会抛 TypeError** —— 每一个 v4 构建（UMD 和 IIFE 都一样）都把一个命名空间对象赋给全局变量，所以无论你加载哪个 v4 文件，v3 的 `anime({ targets })` 写法都行不通。

## 基本模式

```html
<script>
  const anim = anime.animate(".mark", {
    x: 280, // v4 shorthand for translateX
    rotate: "1turn",
    opacity: [0, 1],
    duration: 1200,
    ease: "outExpo", // NOT easing: "easeOutExpo"
    autoplay: false,
  });

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(anim);
</script>
```

## Timeline 模式

`createTimeline` 取代了 `anime.timeline`，而且 `add()` **把 targets 作为第一个参数** —— `add(targets, parameters, position)`：

```html
<script>
  const tl = anime.createTimeline({
    autoplay: false,
    defaults: { ease: "outCubic" }, // per-timeline defaults, not a bare `easing`
  });

  tl.add(".title", { y: [40, 0], opacity: [0, 1], duration: 650 });
  tl.add(".accent", { scaleX: [0, 1], duration: 450 }, 250); // 250 = time position

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(tl);
</script>
```

position 接受数字、label、`"+=250"` / `"-=100"`、`"<"`（上一个的**结束**）和 `"<<"`（上一个的**开始**）。

## 模块化构建

adapter 不关心实例是怎么创建的 —— 只关心它是否暴露 `seek()`、`pause()` 和 `play()`：

```html
<script type="module">
  import { animate } from "https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";

  const anim = animate(".chip", { x: "18rem", duration: 900, autoplay: false });

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(anim);
</script>
```

## 确定性

v4 自带 `createSeededRandom(seed)` —— 当 composition 需要散布 / 抖动时，用它代替 `Math.random()`，这样同一帧每次渲染的结果都一样：

```js
const rnd = anime.createSeededRandom(1337);
anime.animate(".dot", { y: () => -40 * rnd(), duration: 800, autoplay: false });
```

`anime.utils.random()` / `randomPick()` / `shuffle()` **没有**设种子 —— 它们会破坏帧与帧之间的可复现性。

## 适合的用途

- 小型的 SVG 和 DOM 点缀效果，用 Anime.js 语法写起来很紧凑。
- 免费的 `splitText` / `scrambleText`（Motion 把它们放在 Motion+ 付费版里；GSAP SplitText 是另一个免费选项）。
- `svg.createDrawable` / `svg.morphTo` / `svg.createMotionPath` 的描线和路径效果。
- 推入同一个注册表的多个相互独立的微动画。

除非用户明确要求 Anime.js，否则复杂的场景编排用 GSAP。GSAP 仍然是 HyperFrames 编写的首选路径。

## 避免

- 让 `autoplay` 保持 Anime.js 的默认值。
- **依赖 adapter 的 `anime.running` 自动发现 —— 它在 v4 上不可能生效。** `running` 不在 v4.5.0 的导出里（已对照发布的打包文件核实），所以 `discover()` 会立即返回，任何你没有 `push()` 的实例都永远不会被 seek。显式注册是强制要求，不是锦上添花。
- `autoplay: onScroll(...)` —— 无头的 seek 渲染里没有滚动，所以动画永远不会前进。改由 composition 时间来驱动它。
- 对任何需要被 adapter seek 的东西使用 `waapi.animate()` —— adapter 通过 `.seek()` 来 seek，而基于 WAAPI 的实例是否遵从它**尚未验证**。渲染用的 composition 使用 JS 引擎（`animate`）；`waapi` 是给实时页面用的主线程外优化。
- `createDraggable`，以及任何由指针驱动的 `createAnimatable` 循环 —— 渲染时不存在输入。
- 无限循环。根据 composition 时长算出一个有限的重复次数（v4 的 `loop` 计的是**重复**次数：`loop: 1` 播放两遍）。
- 在定时器、promise、事件处理函数里，或在异步素材加载之后构建动画。

## 验证

编辑使用了 Anime.js 的 composition 之后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/animejs.ts`。
- Anime.js v4 文档：https://animejs.com/documentation/
- v3 → v4 迁移指南（不在 animejs.com 上）：https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4
