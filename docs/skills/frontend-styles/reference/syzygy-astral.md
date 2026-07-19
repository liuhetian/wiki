# Syzygy 克莱因蓝星穹

<iframe src="/skills/frontend-styles/assets/syzygy-astral-demo.html"
        style="width:100%;height:1400px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Syzygy 克莱因蓝星穹 demo：深空星象官网首屏，右下角可切主题"></iframe>

一个「本地优先剪贴板工具」的官网首屏：纯 CSS 深空星象 hero（一 div 巨行星 + JS 星点 + 光斑），
经「大气层渐变」落进纸白正文的蓝图特性卡。整站颜色全是 `data-brand-theme` 令牌，右下角按钮
一键从克莱因蓝切到琥珀烈日。吸纳自 [en.syzygysync.com](https://en.syzygysync.com/)，纯手写零依赖复刻。

## 要点

- 把所有颜色收进 `:root[data-brand-theme="…"]` 下的设计令牌，组件只引用变量名，换肤只改 html 一个属性（原站定义了 17 套主题）
- 深浅色不手写：用 `color-mix(in oklab, var(--brand) 72%, white / black)` 从品牌色派生受光面和暗面，换主题自动跟随
- 巨行星只用一个 div：`radial-gradient` 定光源方向，inset 阴影压出球体明暗，外发光当大气辉光
- 行星半径故意大过视口、只露一段弧（`right:-600px`），才有「贴脸飞过」的天体尺度感
- 一明一暗两颗天体对角错开（一右下一左上），点题 syzygy「天体连珠」
- hero 落地用「大气层渐变」：嵌套 `color-mix` 的 `linear-gradient`，让夜空经品牌色过渡层落进纸白正文，两个世界无缝衔接
- 星点用 JS 撒 110 个 `<i>`（位置 / 大小 / 闪烁相位随机，两成是 2px 亮星），CSS 只管圆点形状和 twinkle 动画
- 暗角用中心透、四角黑的径向罩压出景深，左侧再垫一团极淡品牌色薄雾防死黑
- 夜空上的控件一律玻璃拟态：半透白底 + 半透白边 + `backdrop-filter: blur() saturate()`
- 眉标做「乱码落定」解码动画：从左到右逐字符落定、未落定位随机跳字符，等宽字体 + `min-width` 定宽防抖，每 8s 重播一次
- 巨字标题用特细字重（`font-weight:250`）+ `clamp()` 响应式字号，巨而不压人
- 特性卡右侧「蓝图舞台」：1px 点阵网格平铺 + 品牌色径向晕聚光，上面浮一枚等距立方体 SVG（品牌色填充 + 白描边 + 品牌色 drop-shadow 辉光 + 缓浮动画）
- 换主题时渐变硬切、纯色给 `.6s` 过渡 —— 渐变不可过渡只能接受硬切，原站同样取舍

## 源码（折叠）

??? abstract "syzygy-astral-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/syzygy-astral-demo.html"
    ```
