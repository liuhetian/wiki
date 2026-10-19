<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/fonts.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 字体翻译

字体是占主导地位的非翻译噪声底。在没有安装真实字体时，同样的 `font-weight: 800` 在 HF 的 `chrome-headless-shell` 上渲染出来，会比在 Remotion 自带的 Chromium 上明显更粗。验证表明，这在噪声底层面会造成约 0.025 的平均 SSIM 损失。

## 模式：`@remotion/google-fonts/<Family>`

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";
loadFont("normal", { weights: ["400", "800"] });
```

翻译成 `<head>` 中的一个 `<link>` 标签：

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap"
    rel="stylesheet"
  />
  <style>
    body {
      font-family: Inter, sans-serif;
    }
  </style>
</head>
```

从 import 路径和 `loadFont` 的参数里取出字体族名和字重。HF 的编译器会在渲染时把 Google Fonts 的 CSS 内联进来，所以你不必每次渲染都付出一次网络往返的代价。

## 模式：通过 `@font-face` 使用本地字体

```tsx
import { Font } from "remotion";

Font.loadFont("/MyFont.woff2", "MyFont");
```

翻译成一条 `@font-face` 规则：

```html
<style>
  @font-face {
    font-family: "MyFont";
    src: url("assets/MyFont.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
  }
</style>
```

把字体文件复制到 `hf-src/assets/`，与 HTML 相邻。

## 模式：系统字体回退（不加载字体）

```tsx
<div style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>...</div>
```

在 HF 中用同样的字符串 —— 但要注意：在没有安装真实 Helvetica 的 Linux 上（典型的 CI 环境），Remotion 和 HF 会回退到*不同的*无衬线系统字体，因为它们自带的 Chromium 版本不同。这就是噪声底：约 0.025 的平均 SSIM 损失，表现为大字重（800+）下笔画宽度不同。

如果某个 fixture 必须与 Remotion 的渲染结果精确吻合，就显式加载同一种字体 —— 不要依赖系统回退。

## 拿不准时：用 Inter

Inter 在不同 Chromium 版本之间渲染结果完全一致，而且免费。当你需要在校验工具中把字体漂移降到最低时，把任何"系统无衬线"的 Remotion comp 翻译成 Inter。

## 字体加载与 `delayRender`

Remotion 用 `delayRender()` 把第一帧推迟到字体加载完成之后。HF 的编译器在编译时内联 Google Fonts，并通过 Frame Adapter 模式等待 `@font-face` 就绪 —— 翻译时去掉 `delayRender` 调用。见 [media.md](media.md)。

## 多字重加载

当 Remotion 加载多个字重时：

```tsx
loadFont("normal", { weights: ["400", "500", "700", "800"] });
```

把所有字重都内联进 Google Fonts 的 URL：

```
?family=Inter:wght@400;500;700;800&display=swap
```

翻译规则：列举出 composition 的 CSS 中出现的每一个不同的 `font-weight` 值（出现 `font-weight: 800` → 就必须加载 800 字重）。如果 Remotion 源码加载了实际并没有用到的字重，就去掉它们。

## 字体子集化

Remotion 的 `loadFont` 不做子集化；HF 的编译器（目前）也不做。不要在翻译中尝试优化这一点 —— 保留与 Remotion 源码相同的字重集合是无损的。
