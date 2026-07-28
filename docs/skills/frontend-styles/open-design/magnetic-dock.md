# 磁性 Dock 预览切换

<iframe src="/skills/frontend-styles/open-design/assets/magnetic-dock-demo.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="磁性 Dock 预览切换 demo：macOS 风格 dock 驱动作品轮播"></iframe>

open-design.ai 首页 Labs 模块：一条 macOS 风格的磁性 Dock 站在作品预览下方，
光标掠过时 tile 靠近放大，点击或每 2.4s 自动前进，上方预览整片横滑切换。
上游是 React Bits 的 "Dock" 组件，官网因为不带 React runtime 做了 vanilla 移植
（`enhanceLabDock` + `enhanceLabAutoCycle`）。

## 要点

- 磁性放大参数：`MAX=1.08`（峰值缩放，克制不压邻居）、`DIST=104px` 影响半径，三角衰减 `t = max(0, 1 - |光标x - tile中心| / DIST)`，scale `1 + (MAX-1)*t`
- tile 中心必须用 `offsetLeft + offsetWidth/2` 读 —— offset 几何不受 transform 影响；改用 getBoundingClientRect 会把上一帧的缩放读进来，形成读写反馈回路，鼠标不动 dock 也抖
- offsetLeft 有个隐含前提：`.dock` 必须 `position: relative` 当 offsetParent —— 漏掉它 offsetLeft 会相对 body，与 `cursorX - dock左边` 坐标系错位远超 DIST，t 恒为 0，磁性放大悄无声息全灭；截图验收看不出 hover 行为，本 demo 首版就这样溜过去了
- `transform-origin: bottom center` 让 tile 从底边长高，才有 Dock"隆起"观感；JS 每帧写 inline transform，一段 `.14s ease-out` 短过渡顶替 spring
- mousemove 包 rAF 节流（trackpad 事件 >60Hz 折叠成每帧一次）；mouseleave 清空 inline transform 交回 CSS
- 选中 tile 的 CSS 抬升 `translateY(-20px)` 会被 inline transform 覆盖 —— 放大时把 lift 折进同一个 transform 串一起写，抬升才能在 hover 中存活
- tooltip 黑底白字从 tile 顶探出（`bottom: calc(100% + 4px)`），hover/active 显示；`.dock:hover .active:not(:hover) .tip` 把 active 的常显气泡在 hover 别项时藏起，两只气泡不打架
- 预览滑动用**持久 track**：一个 flex 容器 translateX 平移（`560ms cubic-bezier(0.23,1,0.32,1)`），transitionend 后在同一个同步块里移除旧卡 + `transition:none` 复位归零 —— 中间无重绘无闪烁；官网此前用 replaceWith 重建容器，销毁了 will-change 合成层，合成器闪现一帧旧纹理
- 快速连点用 `activeCleanup` 先把上一场滑动立刻收尾再开新场；`setTimeout(cleanup, 700)` 兜底 transitionend 丢失
- 自动轮播 `INTERVAL=2400ms` 永远向前；hover dock 暂停（表继续走、tick 空转）；IntersectionObserver（threshold 0.2）离屏停表回屏开表；手点后重启计时保证驻留满一个间隔
- 方向语义：点右侧 tile 新卡从右滑入，点左侧从左滑入 —— `dir = i > index ? 1 : -1`
- `prefers-reduced-motion` 下磁性放大与自动轮播整体停用，点击原地换卡不滑动

## 源码（折叠）

??? abstract "magnetic-dock-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/magnetic-dock-demo.html"
    ```
