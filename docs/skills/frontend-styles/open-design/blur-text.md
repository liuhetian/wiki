# 标题逐词模糊入场（BlurText）

<iframe src="/skills/frontend-styles/open-design/assets/blur-text-demo.html"
        style="width:100%;height:540px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="BlurText 标题逐词模糊入场 demo：蓝图选择框 + 逐词坠落成形"></iframe>

open-design.ai 首页 hero 标题的入场：每个词从上方 50px 带着 10px 高斯模糊坠下来，
按序号一个接一个成形；标题外面套一圈荧光绿细框、四角骑着实心小方块 —— 设计画布上
"被选中图层"的隐喻。上游是 React Bits 的 BlurText 组件，官网做成了零运行时的静态 SSR 移植。

## 要点

- 构建期就把标题拆成 `<span class="blur-word" style="--i:N">`，浏览器端零 React、零 motion runtime，动画全靠一段 CSS keyframes
- 初始态 `opacity:0; filter:blur(10px); translateY(-50px)`，触发后播 `blurTextIn 0.38s cubic-bezier(0.23,1,0.32,1) both`，每词 delay `calc(var(--i)*0.035s)`
- 关键帧 50% 处停在 `opacity:.5 / blur(5px) / translateY(5px)` —— 先过冲 5px 再回正，落点带一点坠感（React Bits 原组件的三步插值照抄）
- 英文按词拆、中文按字拆（CJK 没有词间空格，官网 zh/ja/ko locale 用 by='letters'）；第二行的 `--i` 从第一行末尾接着数，整个标题是一条连续队列
- 触发用页面级 IntersectionObserver：`threshold 0.12` + `rootMargin '0px 0px -8% 0px'`，翻 `data-revealed='true'` 后 unobserve，一生只入场一次
- 标题容器自己取消通用 data-reveal 的块级位移（`opacity:1; transition:none`），让逐词模糊做全部动作，框子不跟着滑
- 蓝图选择框：`width:fit-content` 收缩包裹 + 1px 强调色边框 + 四角 9px 方块 `translate(±50%,±50%)` 骑在角点上，内边距用 clamp 流式收缩
- 品牌行走系统衬线栈（Georgia/Songti），零 webfont 请求；副行无衬线 800 配负字距
- `prefers-reduced-motion` 下全部直接可见（`animation:none`），入场是增强不是门槛
- 重播 = 摘掉 `data-revealed` → `void el.offsetWidth` 强制 reflow → 挂回，animation both 填充模式保证状态干净归零

## 源码（折叠）

??? abstract "blur-text-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/blur-text-demo.html"
    ```
