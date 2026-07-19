# Open Design 官网效果拆解

[open-design.ai](https://open-design.ai/) 首页是一套很完整的"纸白 + 黑墨 + 荧光绿 `#63fe13`"编辑部气质（他们自己管这套令牌叫 **Atelier Zero**），动效密度很高却全程轻快 —— 秘密在架构上：Astro 静态输出、浏览器端**零 React runtime**，每个动效都是"服务端渲染好的静态 HTML + 一小段内联增强脚本"的渐进增强，观察器不触发、reduced-motion、脚本挂掉，页面照样完整可读。

这里把首页的 11 个效果逐个拆开，每个复刻成一个自包含单页 demo（无外链依赖，参数照抄官网源码），按首页从上往下的顺序排列：

- [滚动感知吸顶导航](headroom-nav.md) —— 下滑藏、上滑现的 Headroom 顶栏，rAF 折叠滚动事件
- [标题逐词模糊入场](blur-text.md) —— hero 大标题的蓝图选择框 + 逐词 blur(10→0) 级联落定
- [滚动入场编排](scroll-reveal.md) —— 全页通用的 `data-reveal` 观察器体系，永不空白的兜底契约
- [宣言逐字点亮](statement-reveal.md) —— About 大字宣言随滚动逐 token 从墨影点亮，CJK 单字切分
- [滚动锁定步骤联动](scrolly-steps.md) —— 高轨道 + sticky 把整屏钉住，滚动 1:1 跟手推进步骤和配图
- [可拖拽贴纸](drag-sticker.md) —— 标题旁那枚随手拖着玩的 "DONE 👌"，pointer capture 三行核心
- [磁性 Dock 预览切换](magnetic-dock.md) —— macOS 风格近距放大 + tooltip + 持久 track 无闪切换轮播
- [图标物理掉落](falling-chips.md) —— 一排 agent 图标滚到视口上半区集体砸落成堆，可以抓着扔
- [点阵地球与贡献者轨道](globe-orbit.md) —— 自转点阵球 + 纯 CSS 头像环，mask 假装的背面纵深
- [贴纸统计卡与数字滚动](stat-cards.md) —— 每卡独立微旋转的歪贴纸网格，进视口才归零起滚的计数
- [页底渐进高斯模糊](gradual-blur.md) —— 10 层 backdrop-filter + 四段 mask 叠出的连续模糊梯度

## 蓝本

- 仓库：[nexu-io/open-design](https://github.com/nexu-io/open-design)，本次拆解钉在 [`4567a0d5`](https://github.com/nexu-io/open-design/tree/4567a0d57557b29eb79ef1f7a40826f2b801d982/apps/landing-page)
- 结构在 [`app/page.tsx`](https://github.com/nexu-io/open-design/blob/4567a0d57557b29eb79ef1f7a40826f2b801d982/apps/landing-page/app/page.tsx)（构建期 `renderToStaticMarkup`），样式在 [`app/globals.css`](https://github.com/nexu-io/open-design/blob/4567a0d57557b29eb79ef1f7a40826f2b801d982/apps/landing-page/app/globals.css)，全部增强脚本内联在 [`app/pages/index.astro`](https://github.com/nexu-io/open-design/blob/4567a0d57557b29eb79ef1f7a40826f2b801d982/apps/landing-page/app/pages/index.astro)
- 设计令牌规范：[`design-systems/atelier-zero/DESIGN.md`](https://github.com/nexu-io/open-design/blob/4567a0d57557b29eb79ef1f7a40826f2b801d982/design-systems/atelier-zero/DESIGN.md)；官网首页还有一份自包含的 known-good 渲染 [`design-templates/open-design-landing/example.html`](https://github.com/nexu-io/open-design/blob/4567a0d57557b29eb79ef1f7a40826f2b801d982/design-templates/open-design-landing/example.html)，想整页仿照从它起步最快
- 动效上游多为 [React Bits](https://reactbits.dev/)（BlurText / Dock / FallingText / Gradual Blur）和 Magic UI（Text Reveal），官网做的是去 React 化的 vanilla 移植 —— 重库（matter-js、cobe）vendored 后由 IntersectionObserver 提前 1.5 屏按需注入
