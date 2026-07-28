# 贴纸统计卡与数字滚动

<iframe src="/skills/frontend-styles/open-design/assets/stat-cards-demo.html"
        style="width:100%;height:680px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="贴纸统计卡与数字滚动 demo：歪贴纸数据卡 + CountUp"></iframe>

open-design.ai 首页 Selected Work 模块的数据墙：六张微微歪斜的"贴纸"卡，
滚进视口时荧光绿大数字从 0 甩尾滚到位。贴纸感是纯 CSS，数字滚动是官网
自己写的零依赖 CountUp（整页不带 React runtime，全靠这类小 enhancer）。

## 要点

- 贴纸感 = 每卡一个独立 `--tilt` 微旋转 + 一坨"离得远、几乎全黑"的大阴影：官网倾角序列 `[-1.2, 1.4, -0.6, 0.9, -1, 1.1]deg`，正负交替、都压在 ±1.5° 内 —— 歪得出随手贴的味道又不乱
- 阴影浓度给到 `rgba(0,0,0,.72)` 但用 `-42px` 负扩散收窄成卡底一条深影（`0 28px 60px -42px`），纸片悬空感的关键就在"浓 + 窄"
- hover 写成 `rotate(var(--tilt)) translateY(-4px)`：rotate 必须在 hover 里重写一遍，否则整个 transform 被覆盖、卡片瞬间回正
- hover 只推深阴影（`.72→.86`、`60px→76px`）+ 上浮 4px，260ms ease 一步到位，不加任何弹簧
- 大数字荧光绿 `clamp(34px, 4vw, 58px)` / 800 / 行高 .96 / 字距 -.028em，标签黑墨块级分行；最后一张卡反转成荧光绿底当 CTA，一格颜色收束整个网格
- CountUp 的健壮性契约（官网注释原话 robustness contract）：静态 HTML 里**直接渲染终值**，归零只发生在元素进视口那一刻 —— reduced-motion、没有 IntersectionObserver、一屏滚过头，任何情况下数字都不会卡在 0 或空白
- IO 参数 `threshold: 0, rootMargin: '0px 0px -8% 0px'`：底边收 8%，元素真露头才开滚，避免贴边启动看不见前半程；触发即 `unobserve`，一次性动画
- 缓动 `1-(1-t)^4`（前快后慢的甩尾），默认 2s；结束帧强制写一次精确终值，杜绝浮点尾巴
- 小数位从 `data-countup-to` 的字符串推断（`'7.4'` → 1 位），`Intl.NumberFormat` 负责格式化，`data-countup-separator` 存在才开千分组；`K+`、`+` 后缀纯文本拼接
- 官网的活数据卡（Stars / 贡献者）另走 GitHub API 覆写，硬编码值只是 SSR 兜底 —— 数据墙永远不说谎

## 源码（折叠）

??? abstract "stat-cards-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/stat-cards-demo.html"
    ```
