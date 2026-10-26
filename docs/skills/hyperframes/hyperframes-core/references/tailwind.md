# HyperFrames Tailwind

HyperFrames 的 `init --tailwind` 使用脚手架锁定版本的 Tailwind 浏览器 runtime。把它当作 Tailwind v4 对待，而不是 Studio 那套 Tailwind v3 配置。

## 版本契约

- **锁定版本：`@tailwindcss/browser@4.2.4`**（事实来源：`packages/cli/src/commands/init.ts` 里的 `TAILWIND_BROWSER_VERSION`）。
- 不要把脚手架生成的 runtime 换成 `cdn.tailwindcss.com`（没有锁定版本，会破坏可复现性）。
- 让就绪垫片（readiness shim）保持确定性；HyperFrames 会在抓取第 0 帧之前等待 `window.__tailwindReady`。
- 对于离线 / 受限环境 / 要求生产级稳定的渲染，把 Tailwind 编译成 CSS，随项目附带样式表，而不是用浏览器 runtime。

## v4 浏览器 Runtime 规则

Tailwind v4 以 CSS 为先：

```html
<style type="text/tailwindcss">
  @theme {
    --color-brand: oklch(0.68 0.2 252);
    --font-display: "Inter", sans-serif;
  }

  @utility headline-balance {
    text-wrap: balance;
    letter-spacing: 0;
  }
</style>
```

在使用浏览器 runtime 的 composition 里，避免只有 v3 才有的写法：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

不要只为了 composition 的颜色、字体、间距或工具类就添加 `tailwind.config.js`。使用 `@theme` 和 `@utility`。

**`@config` / `@plugin` 会中止浏览器编译。** 锁定版本的 `@tailwindcss/browser` 构建不支持 JS 配置或插件。主题和工具类都留在一个 `text/tailwindcss` 块里。

## Composition 模式

用 Tailwind 做静态布局和样式。渲染关键的计时留在 GSAP 或其他可 seek 的 HyperFrames adapter 里。

```html
<section
  id="hero"
  class="clip absolute inset-0 grid place-items-center bg-zinc-950 text-white"
  data-start="0"
  data-duration="5"
  data-track-index="1"
>
  <div class="w-[1280px] max-w-[82vw] text-center">
    <h1 class="text-7xl font-black leading-none text-balance">Render-ready Tailwind</h1>
  </div>
</section>
```

对于重复的条目，**通过 CSS 变量参数化** —— 让 class 列表保持静态，这样 runtime 才能看到每一个工具类：

```html
<span class="translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 0"></span>
<span class="translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 1"></span>
<span class="translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 2"></span>
```

## 动态 Class 的安全性

浏览器 runtime 会扫描它能看到的 class。不要只在 seek 时才拼出渲染关键的 class 名：

```js
// Risky: the runtime may never see every generated class.
element.className = `bg-${color}-500`;
```

优先在 HTML 里写完整的 class token，或者用 data 变体，或者显式的 CSS：

```html
<div data-tone="blue" class="bg-blue-500 data-[tone=rose]:bg-rose-500"></div>
```

如果实在无法避免生成 class，确保完整的 class token 在校验之前就出现在某个 `text/tailwindcss` 块里。

## 视频专属的护栏

v4 + 渲染模式下的坑。每一条都是硬性规则：

- **只用稳定的尺寸** —— 使用 `w-[…]` / `h-[…]` / `aspect-video` / grid / flex。**不要用 `md:` / `lg:` 断点**（渲染器的 viewport 是固定的）。
- **通过 transform / opacity 做动画** —— `translate-*`、`scale-*`、`opacity-*` 是 seek 安全的；对 Tailwind 的尺寸工具类做动画则不是。
- **渲染关键的运动不要用 `transition-*`** —— 状态必须由可 seek 的 runtime（GSAP）掌管。
- **不要用交互变体** —— `hover:` / `focus:` / `active:` / `group-*:` / `peer-*:` / 滚动 / 指针变体在渲染期间永远不会触发。
- **单独写 `border` 在 v4 中是坏的** —— v4 的默认颜色是 `currentColor`（v3 是 `gray-200`）。始终写上颜色：`border border-white/20`。
- **v4 的工具类改名** —— `shadow-sm` → `shadow-xs`、`rounded-sm` → `rounded-xs`、`outline-none` → `outline-hidden`、`flex-shrink-*` → `shrink-*`、`flex-grow-*` → `grow-*`。
- **现代 CSS 没问题** —— `color-mix()`、容器查询、逻辑属性都能用；渲染器是当前版本的 Chrome。

## 校验

```bash
npx hyperframes check

# Render proof — frame 0 must NOT flash unstyled content. Preview alone can hide this.
npx hyperframes render . --workers 1 --quality draft --output tailwind-proof.mp4
```
