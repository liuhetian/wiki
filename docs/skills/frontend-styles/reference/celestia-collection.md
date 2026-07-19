# Celestia 主题收藏卡

<iframe src="/skills/frontend-styles/assets/celestia-collection-demo.html"
        style="width:100%;height:820px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Celestia 主题收藏卡 demo：星座与生肖收藏画廊"></iframe>

一个「AI 生成收藏集」的展示画廊：每条数据自带整套主题（全屏背景渐变 + 卡底 + 文字/强调色），
点顶部导航切换条目，氛围随之整体变奏 —— 深绿田园、宣纸米白、鎏金玄青、星空蓝、烈日红。
玻璃拟态大卡 + 衬线大字 + 宽字距全大写小标签，杂志内页气质。

## 要点

- 把整套主题当数据：每条数据自带 `theme` 对象（`bgMain` / `cardBg` / `textMain` / `textSecondary` / `accent`），组件只负责注入 CSS 变量，换条目 = 换全套配色
- 三层字阶拉开主次：衬线 8rem 缩写大字是唯一主角，标题衬线 2.6rem，其余一律 9–12px 全大写 + `.2em` 以上宽字距压低存在感
- 玻璃拟态卡用半透明卡底 + `backdrop-filter: blur(24px)` + 1px 微弱边框，同一个边框色复用为 tag 描边 / 分隔线 / 角落装饰
- 切换做成「调色」而非翻页：`body` 背景 / 文字给 `.8s` 过渡、卡内各处 `.7s`，渐变本身不可过渡也不碍事
- 大字背后垫一张细线 SVG 星图（星点 + 连线），配 10s 缓浮动画

## 源码（折叠）

??? abstract "celestia-collection-demo.html（自包含单页）"

    ```html
    --8<-- "skills/frontend-styles/assets/celestia-collection-demo.html"
    ```
