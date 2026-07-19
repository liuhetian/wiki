# 宣言逐字点亮（Text Scroll Reveal）

<iframe src="/skills/frontend-styles/open-design/assets/statement-reveal-demo.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="宣言逐字点亮 demo：滚动进度映射每个字的亮度"></iframe>

open-design.ai 首页 About 模块的大字宣言：整段话初始只有一层 18% 的墨影，随滚动
一个字一个字点亮，回滚就逐个熄灭 —— 亮度映射的是滚动位置而不是时间，完全跟手。
上游是 Magic UI / Inspira 的 Text Reveal，官网改成了不占高轨道的"非 pin"版。

## 要点

- 不钉住段落：块随页面自然上行，行程映射为 `progress = (0.82·vh − rect.top) / (0.82·vh − 0.22·vh)` —— 块顶从视口 82% 走到 22% 期间点亮完毕
- 第 i 个词的点亮窗口是 `[i/n, (i+1)/n]`，窗口内线性过渡，整段就是一条被 n 等分的进度条
- 暗底是 `0.18` 不是 0：`opacity = 0.18 + 0.82·o`，未点亮的字保持"墨影"，段落轮廓始终可读（也顺带保住 SEO 文本）
- token 化分两种粒度：CJK 字符（含全角标点）一字一个 token，拉丁字母/数字连跑攒成整词，ASCII 空格保留成独立分隔 span 防止换行粘连 —— 中英混排各按各的节奏亮
- scroll/resize 都过 rAF 节流（ticking 标志位一帧最多算一次），监听挂 `{ passive:true }`
- JS 未接管时段落保持全墨可读：官网先加 `is-reveal-active` 类才把控制权交给内联 opacity，`prefers-reduced-motion` 下直接不接管
- 品牌词铺一条荧光绿底（`background: var(--coral)`），是整段唯一的颜色，点亮到它时有"到站"感
- 官网另有 pin 版变体（`.about-scrolly` 的 sticky 轨道），同一套亮度映射换成钉住段落滚进度，取舍是：非 pin 版不吃版面高度

## 源码（折叠）

??? abstract "statement-reveal-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/statement-reveal-demo.html"
    ```
