# 滚动叙事：场景切换与翻滚转台

<iframe src="/skills/frontend-styles/oryzo/assets/scroll-turntable-demo.html"
        style="width:100%;height:600px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="滚动叙事翻滚转台：三幕场景切换复现"></iframe>

oryzo.ai 最核心的叙事魔法：滚动时**主角不换、场景在换**。hero 的照片级制图桌整体熄灯退场，
唯独杯垫留在画面里，跟着滚动端对端翻滚（"ISN'T JUST A COASTER" 钉在左侧），暖色轮廓光渐次亮起；
翻完两圈，"Powered by AI*" 逐词从模糊里显影，杯垫缩小下沉，交棒给下一幕的手。
上面的 demo 用泼溅杯垫复现了这三幕的完整交接（滚轮 / 拖拽 / 方向键推进）。

## 要点

- **主角连续性**是场景切换不晕的关键：切的是环境（垫子熄灯、灯光换向、相机降角），产品从头到尾在屏上 —— 观众的眼睛有锚点
- 环境熄灯 = 给"垫子"这组泼溅单独一个 alpha 乘子 uniform，随进度拉到 0；杯垫组不动 —— 分组画就能分组导演
- 转台本体是一个**模型矩阵 uniform**：翻滚 = 绕倾斜轴的旋转随进度走（两整圈 4π），交棒段再乘缩放和位移；泼溅的协方差要跟着模型旋转（M 左乘模型旋转矩阵），深度排序也要用变换后的中心算
- 相机同步演戏：第一幕俯视制图桌（仰角 0.95），熄灯段降到平视（0.38）—— 场景切换感一半来自相机
- 轮廓光两层叠：WebGL 里按"朝下 + 靠外"给 splat 颜色乘暖色系数，CSS 里再叠一片 radial-gradient 辉光 div，强度都吃同一个进度的正弦信封（中段最亮）
- 标题不滚动：钉死的 DOM + 透明度信封（淡入…停留…淡出），滚动只推进 3D —— "文案钉住、世界在动"是整站的版式母题
- "Powered by AI*" 的逐词显影：每个词一个 span，`filter: blur(14px→0)` + opacity，级联错峰 0.15 进度 —— 与 open-design 拆过的 BlurText 同宗，但这里由滚动进度驱动而非入场触发
- 三幕进度全部来自同一个虚拟滚动标量的分段映射 `seg(p, a, b)`，WebGL 旋转 / CSS 灯光 / DOM 文案没有各自的时间线 —— 一个数导演一切

## 滚动架构（scrollManager）

<iframe src="/skills/frontend-styles/oryzo/assets/virtual-scroll-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="虚拟滚动 scrollManager 架构"></iframe>

上面这套"一个进度导演一切"的地基：浏览器原生滚动被整个架空，wheel / 触摸 / 键盘全部喂给
自研 scrollManager，它维护 target/current 两个标量每帧 lerp 逼近。

- wheel 先按 `deltaMode` 归一化成像素（行 ×40、页 ×800），鼠标滚轮和触控板手感才一致 —— 原站 bundle 里就是带 PIXEL_STEP 常数的这套换算
- 键盘一等公民（对齐原站行为）：↑↓ ±100px、PageUp/PageDown 一屏、Home/End 直达；`scrollTo` 还接受选择器，路由切换 `scrollToPixel(0, 立即)` 复位
- 平滑就一行：`current += (target - current) * k`（k 为拟合值 0.11，原站未逐帧核对）；差值 < 0.1px 时钉死，不留无限逼近的长尾
- 代价是键盘、无障碍这些"原生白送的"全要自己还 —— oryzo 把这笔债还齐了；`prefers-reduced-motion` 下 lerp 置 1、自转停掉

## 源码（折叠）

??? abstract "scroll-turntable-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/scroll-turntable-demo.html"
    ```

??? abstract "virtual-scroll-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/virtual-scroll-demo.html"
    ```
