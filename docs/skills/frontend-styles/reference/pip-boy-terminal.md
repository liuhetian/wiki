# PIP-BOY 琥珀终端

<iframe src="/skills/frontend-styles/assets/pip-boy-terminal-demo.html"
        style="width:100%;height:720px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="PIP-BOY 琥珀终端 demo：视频字幕烧录工具"></iframe>

一个「视频字幕烧录工具」终端界面：左列任务 / 状态 / 操作 / 输出四面板，右侧全屏系统日志 + blink 光标。
单色琥珀 + 深黑底 + 等宽微发光 + 2px 硬边框的复古 CRT 风，Fallout Pip-Boy 灵感 ——
**靠单色、硬边框、字体、字符前缀建立层级，绝不用渐变、圆角、阴影**。

## 要点

- 全套只用 5 个色彩令牌：主色琥珀 `#ffb000` 只有一个，绿 / 红仅做状态和危险强调，深黑 `#050500` 打底
- 给所有文字加 `text-shadow: 0 0 2px` 琥珀微发光模拟 CRT 荧光渗透，「运行中」白字主动清掉 shadow 保持锐利
- 面板只用 `2px solid` 琥珀硬边框：无背景色、无圆角、无阴影
- 状态语义用字符前缀不用图标：`[X]` 已完成 / `[>]` 运行中 / `[ ]` 等待中，面板标题用 `>>` 引出
- 按钮悬停做硬实心反色（透明底琥珀字 ↔ 琥珀底黑字），危险按钮换红边红字、同样反色成红底黑字
- 用 `::-webkit-scrollbar` 把滚动条也做成琥珀色（thumb 琥珀、hover 变白）—— 浏览器默认灰条会立刻破功
- 布局外层 grid `350px 1fr`（左定宽右自适应），左列 flex 纵向堆面板
- 等宽字体链用 `@font-face` + `src: local()` 优先本地 Courier New / Consolas，兜底 `monospace`，不走 CDN
- 一个 `blink` keyframes 两处复用：ONLINE 绿点 `1.5s` 柔和脉动，日志光标 `1s step-end` 硬闪 —— 靠 timing function 输出不同观感

## 源码（折叠）

??? abstract "pip-boy-terminal-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/pip-boy-terminal-demo.html"
    ```
