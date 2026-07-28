# Verdant Glass 苔光用量台

<iframe src="/skills/frontend-styles/assets/verdant-glass-demo.html"
        style="width:100%;height:1450px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Verdant Glass 苔光用量台 demo：LLM 网关用量看板首页"></iframe>

一个「LLM 网关用量看板」首页：悬浮胶囊侧栏 + 四张请求/Token/输入/输出统计卡 + 60×7 活跃度热力图 +
请求趋势面积图 + 供应商消费榜。浅灰绿底 + 白玻璃卡 + 翡翠绿点缀，轻盈干净的 SaaS 后台气质。

## 要点

- 浅灰绿 `#f3f5ef` 打底，右上 / 左下各垫一坨 500px `blur(120px)` 光晕（emerald / teal），卡片用 `white/90` + 轻度 `backdrop-blur` 让光晕从边缘渗出
- 侧栏做成悬浮胶囊：`sticky` 吸顶 + `border-radius: 999px` 拉满，当前项用暖米色块 highlight，其余图标浅灰、hover 才转深灰 —— 只留一个焦点
- 统计卡左窄右宽：左侧竖排小图标 + `writing-mode: vertical-rl` 竖排标题当分隔线，右侧堆两行「图标胶囊 + 标签 + 数值 + 单位」
- 活跃度热力图用 60 列 × 7 行、5 档绿色阶（GitHub 贡献图那一路），两端几列刻意压低取值模拟起量 / 收尾的边缘效应
- 面积图用单色 emerald 线 + 渐变面积水洗，hover 出十字线 + 跟指针的 tooltip（做法与 [dashboard 形状库](../../dashboard/index.md)的折线图同源）

## 源码（折叠）

??? abstract "verdant-glass-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/verdant-glass-demo.html"
    ```
