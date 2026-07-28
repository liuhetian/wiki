# 滚动锁定步骤联动

<iframe src="/skills/frontend-styles/open-design/assets/scrolly-steps-demo.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="滚动锁定步骤联动 demo：scrollytelling 四步流程"></iframe>

open-design.ai 首页 Capabilities 模块的 scrollytelling 骨架（`enhanceCapScrolly`）：
整个模块被钉在视口里"冻结"，滚动量变成步骤进度 —— 左侧步骤逐个点亮，右侧画面
1:1 跟手上滑切换，四步走完页面才放行。

## 要点

- 骨架是"高轨道 + sticky"：外层轨道高 ≈ 步数 × 100vh，内层 `position:sticky; top:0; height:100vh` 钉住整个模块，页面滚动穿过轨道时模块看似静止
- 进度三行算完：`range = 轨道高 - sticky 高`，`scrolled = clamp(-轨道.top, 0, range)`，`p = scrolled/range * (n-1)` —— n 步只需 n-1 次切换，均分滚动量
- 第 k 帧位移 `translateY(clamp(k-p, 0, 1) * 100%)`：p 越过 k 的瞬间该帧刚好从画面下方（100%）滑到 0 盖住前帧；位移由滚动量线性决定、无缓动补间，所以跟手 —— 手指停画面停
- 帧容器 `overflow:hidden` 裁掉停在下方待命的帧；zIndex 按 k+1 递增，后帧永远盖前帧
- 左侧高亮就是 `active = round(p)`，与帧位移共享同一个 p，永不失步
- 点击步骤滚到 `i/(n-1) × range` 对应的轨道切片 —— 点击与滚动共用一套进度坐标系
- scroll 监听包 rAF 节流，滚动事件折叠成每帧一次 DOM 写入
- 窄屏撤 pin：sticky 改 static 后 range 塌成 ~1px，JS 检测窄屏清掉 inline transform，交回 click + CSS `.is-active` 切换 —— 官网断点 880px 是页面级视口的值，demo 活在 iframe 里视口只有内容栏宽，降到 520 才进得了滚动锁定分支；套用时按宿主视口重定
- 无 JS 兜底：CSS 默认全帧藏在 `translateY(100%)`、`:first-child` 归零，首帧永远可见
- 官网同页 About 模块是同款变体：radio tab 记录状态 + `STACK_END 0.85` 让堆叠在 85% 滚动处提前收尾，末帧驻留一段再解锁

## 源码（折叠）

??? abstract "scrolly-steps-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/scrolly-steps-demo.html"
    ```
