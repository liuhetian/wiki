# 点阵地球与贡献者轨道

<iframe src="/skills/frontend-styles/open-design/assets/globe-orbit-demo.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="点阵地球与贡献者轨道 demo：canvas 球体 + 纯 CSS 头像环"></iframe>

open-design.ai 首页 Testimonial 模块：左边"343 位贡献者"大字，右边一颗自转的白底点阵地球，
外圈一环 GitHub 头像匀速巡游、转到右侧渐渐"消失在地球背后"。官网地球用 cobe 库（WebGL，~5KB），
头像轨道是纯 CSS；本 demo 用 canvas 2D 手写复刻，大陆点阵按内嵌的 Natural Earth 陆地掩码采样，头像用官网的字母兜底样式。

## 要点

- 地球与轨道是两层独立元素叠在同一个正方形舞台里（绝对居中同一机制），天然同心、尺寸各调各的
- 官网 cobe 参数：`mapSamples 12000`、白底 `baseColor [1,1,1]`、marker 荧光绿 `[0.31,0.98,0.08]`、`markerElevation 0.015`、俯仰 `theta 0.28`、每帧 `phi += 0.0042`、`dpr` 封顶 2
- cobe 本体滚近 1.5 屏（IO `rootMargin '0px 0px 150% 0px'`）才动态注入；另一个 IO `threshold 0.05` 管进视口 start / 出视口 stop —— WebGL 不给看不见的人烧电
- 手写复刻的关键是 fibonacci 球面采样：`y=1-2(i+0.5)/N`、`r=√(1-y²)`、`θ=i·π(3-√5)`（黄金角），9000 个候选点均匀不结队，再按陆地掩码筛出 ~3300 个陆地点 —— cobe mapSamples 的手写等价，点只落在大陆上才读得出"地球"
- 陆地掩码：Natural Earth 110m land（公有领域）光栅成 360×180 位图、base64 内嵌 ~10.8KB（生成脚本 `assets/make-land-mask.py`），查位用 `lat=asin(y)`、`lon=atan2(-z,x)`
- 渲染管线三步：绕 y 轴自转 phi → 绕 x 轴俯仰 theta → 正交投影（直接丢 z 画 x,y）；z 留作深度，背面剔除、正面按 z 调点径和透明度
- 城市标记按经纬度转球面坐标（`x=cosLat·cosLon, y=sinLat, z=-cosLat·sinLon`）走同一管线，荧光绿点 + `sin(t)` 脉动光晕
- 手性陷阱：正交投影的屏幕 x 直接取体坐标 x，经度若按 `atan2(z,x)` 映射，东经会画到屏幕左边 —— 整颗地球镜像。均匀点阵看不出来，有大陆轮廓立刻穿帮；掩码查询按 `atan2(-z,x)`、城市 z 取负，两处同一套手性
- 头像轨道三层 transform 各司其职：ring 整环 38s 正转（唯一动力源）→ slot `inset:0 + rotate(--angle)` 静态定角（360/count 均分）→ 头像钉 slot 顶边中点、静态反转 `rotate(-angle)`，内层再加 38s **反向**动画抵消 ring —— 头像全程直立
- "半个环转到地球背后"的纵深是假的：环是平面圆，全靠一条右向渐隐 mask `linear-gradient(to right, #000 0→22%, .55@52%, .18@78%, transparent 92%)`；mask 只罩头像层，地球 canvas 是兄弟节点不受影响
- ring 要 `inset: clamp(28px, 6%, 38px)` 内缩一圈，头像才不会探出 mask 盒被硬切
- 官网头像来自 GitHub API（本地 vendored manifest 优先、API 兜底），加载失败换字母 chip `--fallback` —— demo 直接用这个兜底样式，零外链
- `prefers-reduced-motion`：地球静止画一帧不自转，轨道两个 animation 全停
- demo 与官网差异：无 cobe/WebGL → canvas 2D 正交投影手写，陆地采样思路与官网相同（贴图换成内嵌位掩码）；头像字母化

## 源码（折叠）

??? abstract "globe-orbit-demo.html（自包含单页，含 canvas 地球与纯 CSS 轨道）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/globe-orbit-demo.html"
    ```
