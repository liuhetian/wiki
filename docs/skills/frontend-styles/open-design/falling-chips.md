# 图标物理掉落（FallingText）

<iframe src="/skills/frontend-styles/open-design/assets/falling-chips-demo.html"
        style="width:100%;height:680px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="图标物理掉落 demo：滚动触发的物理沙箱"></iframe>

open-design.ai 首页 Method 模块的镇场效果：一排 coding-agent 图标 chip 静静排好，
滚到视口上半区时集体掉进物理沙箱，弹跳、翻滚、堆在底部，还能被鼠标拖起来扔。
官网是 React Bits 的 FallingText 移植成 vanilla + matter-js；本 demo 为自包含手写了迷你物理引擎。

## 要点

- chip 先按正常 flex 流排好（真实 DOM、SEO 可见），物理启动那一刻才逐个读 `getBoundingClientRect` 建刚体、原地转 `position:absolute` —— 掉落起点就是排版终点，无缝
- 物理体全部透明，DOM 元素按 `left/top + rotate(角度rad)` 每帧贴到刚体上 —— 物理管运动、DOM 管长相，图标/文字始终可选中可无障碍
- 官网参数：`gravity 0.9`、`restitution 0.8`（落地保留 80% 反弹）、`frictionAir 0.01`、`friction 0.2`、初速 `vx=(rand-.5)*5`、角速度 `(rand-.5)*0.05`
- 触发不是"露头就掉"：IO 用 `rootMargin '0px 0px -45% 0px'`，等这排 chip 滚进视口**上半区**才掉，观众一定看得到全程
- matter-js 不随首屏加载：另一个 IO 提前 1.5 屏（`rootMargin '0px 0px 150% 0px'`）才注入 vendored 的 `matter.min.js`，滚不到的人一字节不下
- 鼠标拖拽用 `MouseConstraint stiffness 0.9`（几乎硬拖，释放保留速度所以能甩）；官网专门 `removeEventListener` 拆掉 matter Mouse 的 wheel 监听，否则页面滚动会被物理画布吞掉 —— 这是最容易踩的坑
- 掉落开始的同一帧中央 banner 加 `.is-visible` 渐显（不等落定）；banner 自己可拖，拖移量走 `--drag-x/--drag-y` 变量叠在居中 `translate(-50%,-50%)` 上，居中与拖拽互不打架
- banner 的 `pointerdown` 要 `stopPropagation`，不然下面的物理层会同时抓走一个 chip
- 四面墙是透明静态矩形（地面/左右/天花板），chip 永远丢不出容器
- `prefers-reduced-motion`：不跑物理也不下载 matter-js，直接亮 banner —— 官网把"省动画"和"省流量"做成了同一个分支
- chip 样式：60×60、圆角 15px、白底、双层阴影 `0 8px 22px rgba(21,20,15,.12) + inset 0 0 0 1px rgba(21,20,15,.06)`
- demo 与官网差异：无依赖 → 手写 ~100 行圆形碰撞引擎（官网矩形刚体），emoji 代替 agent SVG logo，数值全部沿用

## 源码（折叠）

??? abstract "falling-chips-demo.html（自包含单页，含内联迷你物理引擎）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/falling-chips-demo.html"
    ```
