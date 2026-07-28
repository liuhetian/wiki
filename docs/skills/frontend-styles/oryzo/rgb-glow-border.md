# RGB 呼吸光边

<iframe src="/skills/frontend-styles/oryzo/assets/rgb-glow-border-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="RGB 呼吸光边：conic-gradient 彩虹环 + mask 抠边 + blur 辉光"></iframe>

oryzo.ai 手持杯垫那幕的名场面：整个视口被一圈流动的 RGB 光框住 ——
"AI 硬件"当然得有电竞灯（页面下文正好是 "Runs on RTX 3090" 的玩梗卡）。
光边随时间转色、随呼吸明暗，hover 展品还会增压。复现是纯 CSS + 十行 JS。

## 要点

- 彩虹环 = `conic-gradient` 从角度变量 `--rgbA` 起转一圈七色再回到起点色（首尾同色才无缝）
- **抠成"只剩边框"靠 mask 异或**：`mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` + `mask-composite: exclude` —— 整框减去内容盒，剩下 padding 那一圈就是边
- 辉光层和锐边层是同一套背景画两遍：厚 padding + `blur(26px)` 的在下当氛围，薄 padding + `blur(1px)` 的在上当轮廓 —— 双层是"发光体"质感的关键，单层 blur 只像贴纸
- 让渐变的起始角能被 CSS 动画插值，必须先 `@property --rgbA { syntax: '<angle>' }` 注册 —— 否则 `@keyframes` 里改自定义属性是跳变不是旋转；不支持的浏览器优雅退化成静态彩虹边
- 呼吸 = 慢速 opacity 正弦；hover 增压走 JS 调一个 `--glow` 变量，两层同时吃到 —— 变量是 CSS 和 JS 之间最顺的遥控器
- 光边 `pointer-events: none` 且不参与布局（fixed + inset 0），对页面是纯"外挂灯"，可以随场景整体淡入淡出
- `prefers-reduced-motion` 下停转停呼吸，留静态彩虹 —— 灯可以在，别闪

## 源码（折叠）

??? abstract "rgb-glow-border-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/rgb-glow-border-demo.html"
    ```
