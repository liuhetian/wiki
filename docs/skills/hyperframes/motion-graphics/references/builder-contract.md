# Builder 契约 —— composition 规则（agents/builder.md 背后的细节）

## 根节点必须有尺寸

根节点 `#stage`（`data-composition-id`）需要 `position: relative; width: <W>px; height: <H>px`。如果高度没有确定下来，flex 子元素会塌缩到约 0，内容全部堆到左上角。自动化闸门可能漏掉这个问题，所以要查看佐证快照。

## 先布局，后动画

1. 找出 **hero 帧**（大多数元素都可见的那一刻）→ 先用静态 CSS 把**那一帧**搭出来，不用 GSAP。
2. `.scene-content` 用 padding 而不是偏移来填满场景：
   ```css
   display: flex;
   flex-direction: column;
   justify-content: center;
   width: 100%;
   height: 100%;
   padding: 120px 160px;
   gap: 24px;
   box-sizing: border-box;
   ```
   绝不在内容容器上用 `position:absolute; top:Npx`（它会溢出）。绝对定位只留给装饰元素。保持 ≥80px 的 padding（标题安全边距）。
3. **入场**：`gsap.from()` 只用于从 `t=0` 起就处于激活状态的非 clip 元素。在 `.clip` 内、在 sub-composition 里，以及较晚的入场，都用显式的 `fromTo()`。CSS 位置是基准事实；tween 是通往它的旅程。
4. **退场**：只有最后一个场景让元素做退场动画；场景之间，转场**本身就是**退场。

## Timeline / clip 契约

- 在 `window.__timelines["<id>"]` 上**只有一个** `gsap.timeline({paused:true})`；`tl.seek(0)`；绝不用 `tl.play()`。
- 有时间定位的元素：`class="clip"` + `data-start`/`data-duration`/`data-track-index` + 一个稳定的 `id`。一个全时长 clip 内部由 timeline 驱动的分组，不需要各自带时间属性。
- 只允许确定性的写法 —— 不用 `Date.now()` / `Math.random()` / 网络。count-up 通过 `onUpdate` tween 一个代理对象（seek 安全），绝不用挂钟计数器。

## 正确性

- **延迟元素的 seek 安全显现**：对 clip 内部的非 clip 元素或包裹层，使用一个已登记 timeline 上的 `fromTo()`，显式地以 `{ autoAlpha: 0 }` 开始、以 `{ autoAlpha: 1, ... }` 结束。不要在页面加载时对一个较晚出现的 `.clip` 做 `gsap.set()`，也绝不要去控制 `.clip` 的可见性；它的生命周期归框架管。_（评测发现。）_
- **count-up** 通过 `onUpdate` tween 一个代理对象；只有当宿主**在启用事件的情况下**推进 timeline 时（`tl.time()` / 不抑制事件的 seek），它们才会渲染出来。光秃秃的 `seek(t, true)` 会把它们冻结在 0 —— HF 渲染宿主必须在启用事件的情况下 seek。_（评测发现。）_
- 在 tween 边界处钳住数值；不要让弹簧冲过一个需要保持的值。
- 允许的 ease：`power1–4`、`back`、`bounce`、`circ`、`elastic`、`expo`、`sine`（`.in/.out/.inOut`）。
- 每个场景一个母题。运行 `hyperframes check`；有意为之的溢出要标记 `data-layout-allow-overflow="true"`。
- **色板纪律**：所有颜色都定义在一个 `palette` 对象 / CSS 自定义属性里 —— 不要在标记里到处散落内联 hex（对 `asset-fusion`，用取色器从素材上取色得到色板）。
