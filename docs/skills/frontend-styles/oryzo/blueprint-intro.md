# 蓝图开场动画

<iframe src="/skills/frontend-styles/oryzo/assets/blueprint-intro-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="蓝图开场动画 demo：虚线圆 draw-on + 选择手柄 + 材质化"></iframe>

oryzo.ai 打开不直接放产品，先在橄榄绿"制图桌"上画图纸：虚线圆沿圆周被画出来、
设计工具味道的橙色选择手柄逐个弹出、标上尺寸 —— 然后线稿材质化成实物。
"产品正在被设计出来"这层隐喻兼任 loader（进度条读数就是资源加载进度）。
demo 是对观察到的开场的**意译复刻**（视觉元素对齐、时序为拟合值），REPLAY 可重放。

## 要点

- 虚线圆的 draw-on 有个小矛盾：`stroke-dashoffset` 动画本身就要占用 dasharray，和虚线样式打架——解法是真身保持虚线样式不动，**套一个粗描边圆当 mask**，让 mask 的 dashoffset 从 100→0，露出的部分沿圆周推进
- mask 圆加 `pathLength="100"`，dasharray/dashoffset 全按百分比写，不用算真实周长；`rotate(-90)` 让起笔点在 12 点钟
- 手柄弹出用 `transform: scale(.4)→1` + 回弹曲线 `cubic-bezier(.2,1.6,.4,1)`；SVG 元素上要配 `transform-box: fill-box; transform-origin: center`，否则缩放原点是整张画布
- 手柄错峰全靠 `transition-delay` 逐个 +0.08s，零 JS 编排
- 软木质感是 SVG 滤镜：`feTurbulence type=fractalNoise` 生成噪声 → `feColorMatrix` 压成深棕斑点 → `feComposite operator=in` 裁进环形——不用贴图，材质是算出来的
- 时序推进只做一件事：往 body 上**叠加** `phase-N` class（不替换，保住已完成过渡的终态），所有动画交给 CSS 过渡吃状态变化；改时序只动一张相位表
- 进度百分比在原站喂的是真实加载进度，demo 用假进度替；这类"叙事型 loader"的价值就是把不可避免的等待变成第一幕
- `prefers-reduced-motion` 直接落到终态（成品软木环），一帧动画都不放
- 复刻取材声明：蓝图形态来自加载阶段的无头截屏（SOURCE），相位切分与节奏是拟合（GUESS）——原站逐帧时序未捕获

## 源码（折叠）

??? abstract "blueprint-intro-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/blueprint-intro-demo.html"
    ```
