# 可拖拽贴纸

<iframe src="/skills/frontend-styles/open-design/assets/drag-sticker-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="可拖拽贴纸 demo：pointer capture 拖拽 + CSS 变量偏移"></iframe>

open-design.ai 的 Capabilities 标题旁贴着一枚手绘"DONE 👌"贴纸，不提示、
不发光，纯靠好奇心发现能抓起来扔到任何地方 —— 30 行 enhancer 给整页添一件
玩具。官网还有第二处变体（Method 模块的 reveal 横幅），两种写法一起收。

## 要点

- 全程 Pointer Events（`pointerdown/move/up/cancel`），鼠标、触屏、触控笔一套代码通吃，不用 mouse/touch 写两遍
- 关键一步是 `setPointerCapture`：捕获后哪怕指针滑出元素、滑出 iframe 边界，move/up 仍派发给这个元素 —— 快速甩动永不脱手；capture/release 都包 try/catch 兜底
- 位移记账：`pointerdown` 记起点，`pointermove` 写 `translate(tx+dx, ty+dy)`，`pointerup` 把本次增量并进累积量 tx/ty —— 下次拖拽从上次落点继续
- 抓取反馈只切一个 `.is-dragging` 类，`cursor: grabbing`、微缩放、阴影加深全交给 CSS
- 贴纸元素要 `touch-action: none`，否则触屏上第一下拖动会被浏览器抢去做页面滚动；`preventDefault` 顺手禁掉文字选取
- 坑：JS 直接写 `el.style.transform` 会**整个覆盖** CSS 的 transform —— 倾斜、居中若写在同一层，第一次拖动瞬间就被抹掉；纯 CSS 贴纸要拆两层（外层收拖拽位移，内层管 rotate 外观）
- 官网变体写法更稳：JS 不碰 transform，只写 `--drag-x/--drag-y` 两个 CSS 变量，CSS 里 `translate(calc(-50% + var(--drag-x, 0px)), …)` 把居中基准和拖拽偏移叠加 —— 布局与交互互不踩脚，改断点也不怕
- 贴纸感三件套：2px 黑描边圆角卡 + `box-shadow: 0 0 0 6px #fff` 假一圈贴纸白边 + 远距离深阴影；再给个 -7° 倾斜，拎起时回正到 -2° 并放大 1.05
- 拖拽是用户主动的直接操纵，不属于 `prefers-reduced-motion` 要禁用的自动运动，保留交互只去过渡

## 源码（折叠）

??? abstract "drag-sticker-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/drag-sticker-demo.html"
    ```
