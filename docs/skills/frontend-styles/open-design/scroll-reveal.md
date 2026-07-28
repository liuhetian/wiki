# 滚动入场编排（data-reveal）

<iframe src="/skills/frontend-styles/open-design/assets/scroll-reveal-demo.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="data-reveal 滚动入场编排 demo：默认升入 / 方向变体 / 波浪错峰"></iframe>

open-design.ai 全页共用的入场体系：每个模块只挂一个 `data-reveal` 属性，一个页面级
IntersectionObserver 统一翻牌，方向、幅度、错峰节奏全部下放给 CSS。整站几十处入场
动画，JS 只有二十行 —— 编排在样式层，不在脚本层。

## 要点

- 初始态 `opacity:0; translate:0 28px`，翻成 `data-revealed='true'` 后过渡到位；一条 `900ms cubic-bezier(0.22,1,0.36,1)` 的长曲线，入场是"飘"不是"弹"
- 方向/形态即属性值：`data-reveal="left"`→`-36px 0`、`right`→`36px 0`、`scale`→`scale:.96`、`rise-lg`→`0 64px + scale:.985`（大块面用），过渡曲线共用一条
- 错峰零 JS：兄弟元素按 `nth-child` 递增 `--reveal-delay`（官网分 70/80/90/110ms 四档间隔），同一帧翻牌、靠 delay 排成波浪
- IO 参数：`threshold 0.12` + `rootMargin '0px 0px -8% 0px'` —— 元素要露出 12% 且越过视口底部 8% 缓冲带才触发，贴底边的不算
- 翻完立刻 `unobserve`，每个元素一生只入场一次；终态顺手把 `will-change` 交还 `auto`
- 鲁棒性契约：没有这段 JS 整页全是 `opacity:0` 的白板，所以 reduced-motion 或无 IO 时直接把所有元素置 revealed —— 内容可见是底线，动画是增强
- 选择器只抓 `[data-reveal]:not([data-revealed])`，重复初始化天然幂等
- scroll 监听一律 `{ passive: true }`，观察和翻牌都不碰布局读写

## 源码（折叠）

??? abstract "scroll-reveal-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/scroll-reveal-demo.html"
    ```
