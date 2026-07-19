# 滚动感知吸顶导航

<iframe src="/skills/frontend-styles/open-design/assets/headroom-nav-demo.html"
        style="width:100%;height:520px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="滚动感知吸顶导航 demo：向下滚隐藏、向上滚返场"></iframe>

open-design.ai 顶部 site-chrome 的 Headroom 模式（`enhanceHeader`）：向下滚导航
整条上移让路，向上滚立刻返场，顶部 100px 内永远在场。判定看的是滚动**方向**
而不是滚动位置 —— 读内容时不占屏，想导航时一抬手就在。

## 要点

- 三条规则按优先级：`y <= 100`（showTopThreshold）永远显示 → 本帧位移 `delta > +6` 隐藏 → `delta < -6` 显示；`|delta| <= 6` 的微动落进死区不改状态
- 死区 `scrollDelta = 6` 吃掉 trackpad 惯性、手指微颤、滚动回弹 —— 导航不神经质地闪
- 顶部安全区 100px：刚开始滚就藏导航显得慌张，顶部也遮不住什么内容
- scroll 监听必须包 rAF：trackpad 事件 >60Hz，每个事件读 scrollY 写 class 会强制同步布局；折叠成每帧一次读写后，官网 PageSpeed 实测省下约 700ms forced reflow
- `ticking` 标志保证一帧只排一个 rAF 回调，事件风暴期间直接 return
- JS 只切 `.is-hidden` 一个类，位移交给 CSS `transform .28s ease` 过渡 —— translateY 走合成器，不触发布局
- 监听挂 `{ passive: true }`：明确不 preventDefault，浏览器滚动不等 JS 执行完
- 导航条本体 `position: fixed` + 半透明纸白底 `rgba(250,250,250,.88)` + `backdrop-filter: blur(10px)`，盖在内容上也不糊脸
- `lastY` 在每帧末尾更新，delta 永远是"本帧相对上一帧"，与事件频率解耦
- `prefers-reduced-motion` 下关掉过渡，显隐瞬切不滑动

## 源码（折叠）

??? abstract "headroom-nav-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/headroom-nav-demo.html"
    ```
