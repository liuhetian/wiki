# Transform 与性能

## Transform 别名

优先用 GSAP 的 transform 别名，而不是原始的 `transform` 字符串：

| GSAP 属性 | 等价写法 |
| --- | --- |
| `x`、`y`、`z` | `translateX/Y/Z`（px） |
| `xPercent`、`yPercent` | 以 `%` 为单位的 `translateX/Y` |
| `scale`、`scaleX`、`scaleY` | `scale` |
| `rotation` | `rotate`（deg） |
| `rotationX`、`rotationY` | 3D 旋转 |
| `skewX`、`skewY` | `skew` |
| `transformOrigin` | `transform-origin` |

别名让 GSAP 能独立追踪并插值每一个轴，避免同一元素上的不同 tween 意外互相覆盖。

## autoAlpha

显示/隐藏时优先用 `autoAlpha` 而不是 `opacity`：

```javascript
gsap.to(".panel", { autoAlpha: 0, duration: 0.4 });
```

`autoAlpha: 0` 会同时设置 `opacity: 0` 和 `visibility: hidden`，在 alpha 为零时把元素移出命中测试和无障碍树 —— 比单纯的 `opacity: 0` 更接近"消失"。已注册的可 seek timeline 依然只插值 opacity；visibility 在隐藏端点处切换。`autoAlpha` 只用在非 clip 元素或 clip 内部的包裹元素上；`.clip` 的可见性归 HyperFrames 管。绝不要对原始的 `visibility` 或 `display` 做带时长的 tween。

## clearProps

在 tween 完成时移除 GSAP 设置的内联样式：

```javascript
gsap.to(".item", { x: 100, rotation: 45, clearProps: "all" });
gsap.to(".item", { x: 100, rotation: 45, clearProps: "rotation,x" });
```

在一段动画结束时把元素交还给 CSS 时很有用。

## CSS 变量

```javascript
gsap.to(".chart", { "--hue": 180, duration: 1 });
```

可以给任意自定义属性做动画。颜色、长度、数字都行 —— 只要是 CSS 能插值的东西。

## 相对值与方向值

- 相对值：`"+=20"`、`"-=10"`、`"*=2"`。
- 方向旋转：`"360_cw"`、`"-170_short"`、`"90_ccw"` —— 控制在两个值之间过渡时角度朝哪个方向转。

## SVG 相关

- `svgOrigin` 在 SVG 的全局坐标空间（而不是元素自身的局部盒子）里设置变换原点。**不要**在同一个元素上同时使用 `svgOrigin` 和 `transformOrigin` —— 二选一。
- 通过同样的别名（`x`、`y`、`rotation`）给 SVG 的 transform 属性做动画 —— GSAP 会处理 SVG 特有的怪癖。
- **在构建基于中心的 transform 之前，先确定好 SVG 几何。** `createElementNS` 是支持的，但一个未挂载、隐藏或尺寸为零的元素，在 GSAP 解析百分比 `transformOrigin` 时可能拿不到可用的几何信息。在构建 timeline 之前先把 SVG 挂载好并设定尺寸；如果你知道画布坐标，就用显式的 `svgOrigin`；或者在一个负责定位的 `<g>` 里围绕局部 `(0,0)` 绘制要动画的几何图形，这样中心枢轴就不依赖测量出的包围盒。

## 性能规则

### 给 transform 做动画，而不是布局属性

给 `x`、`y`、`scale`、`rotation`、`opacity` 做动画。绝不要给 `left`、`right`、`top`、`bottom`、`width`、`height`、`margin*`，以及会导致文字重排的属性 `letterSpacing` / `wordSpacing` / `fontSize` 做动画 —— 也绝不要用 `roundProps`。

在 HyperFrames 里这是一条**渲染正确性**规则，而不只是锦上添花的 GPU 性能优化。渲染器逐帧 seek 并对每一帧截图，而浏览器合成器会把布局属性吸附到整数设备像素上。在快速 tween 上，每帧的步长有好几个像素，吸附看不出来；在慢速 tween 或长长的 ease-out 尾巴上，数值每帧移动不到一个像素 —— 它会在同一个像素上停留好几帧，然后跳一整个像素。结果就是运动快时看着顺滑，慢时明显卡顿。Transform 做亚像素插值，在任何速度下都保持顺滑。`roundProps` 会把同样的整数吸附强加到 transform 上 —— 不要用它。

"布局属性"的范围比位置更广：任何会触发**重排（reflow）**的属性都会以同样的方式吸附。`letterSpacing` / `fontSize` 是常见的陷阱 —— 一个缓慢的"落定"如果让其中某个属性每帧挪动零点几个像素，就会在少数几个离散的字形布局之间停留（可见的微卡顿）。忠实而顺滑的修法取决于是哪个属性 —— **不要条件反射地改用 `scale`**：

- **`fontSize`** → 改为给 `scale` 做动画。把文字放大/缩小在视觉上是一样的，而且保持亚像素顺滑（不重排）。
- **`letterSpacing` / `wordSpacing`** → 统一的 `scale` **不是**同一种效果（它改变的是字形大小，而不改变字形之间的间距）。要顺滑地动画间距，就把文字拆成逐字符（或逐词）的元素，给每一个的 `x` 做动画 —— 字形的散开是一个 transform，亚像素顺滑，视觉上与 letter-spacing tween 完全一致。GSAP 的 `SplitText` 可以完成拆分。如果间距变化只是个小点缀，那就改为静态保持最终值。

与位置类属性不同，重排类属性的吸附发生在浏览器**布局**阶段 —— 位于画布光栅化的上游 —— 所以即使在 html-in-canvas 里它们也会卡顿，下面的例外**不**适用于它们。

#### 修复被标记的动画 —— 保留意图

Lint 规则告诉你某个属性会卡顿；它**不会**告诉你怎么修，而一个仅仅能通过 lint 的修法可能会悄悄改变观感。把 `letterSpacing` 的收紧换成统一的 `scale`，lint 是干净的，但动画的是*另一样东西*（它改变字形大小，而不是收拢间距）。两条规则：

1. **复现同样的视觉** —— 同样的起止状态、同样的轨迹，只是变得亚像素顺滑。使用忠实的等价写法（间距用逐字形 `x`，`fontSize` 用 `scale`，位置用 `x`/`y`），而不是哪个 transform 代码最少就用哪个。
2. **对照原版验证，而不是对照 linter 验证。** 把原版和修复版都渲染出来，在关键时刻比较运动 —— 修复版与原版的区别应该只在于去掉了卡顿，而不在于*东西最后落在哪里*。及格线不是"lint 干净且顺滑"，而是"忠实且顺滑"。

如果忠实的修法并不简单（逐字形拆分、测量出的偏移），就把它做出来，或者把权衡摆出来 —— 绝不要为了让 linter 满意就降级成一个更省事的、不同的效果。

**把位置动画转换成 transform** 的方法：让元素停在 CSS 中的静止 `left`/`top` 位置，用 `x`/`y` 去动画*偏移量*：

```javascript
// CSS: #card { left: 1340px; top: 540px }   ← resting position stays in CSS
tl.to("#card", { left: 1340, top: 540, duration: 1 }); // ✗ stutters
tl.fromTo("#card", { x: 640, y: 0 }, { x: 0, y: 0, duration: 1 }); // ✓ x/y = delta from CSS rest (640 = startLeft − 1340)
```

对于相对父元素的 `left: "100%"` 横扫，只有当元素宽度等于其容器的整个宽度时才用 `xPercent: 100`；否则转换成像素（`x: containerWidth`）。

**唯一的例外：** 通过 html-in-canvas API 绘制的元素 —— 也就是位于某个 `<canvas layoutsubtree>` 祖先之下的元素，例如 `liquid-glass-*` block。画布是根据亚像素的 `getComputedStyle` 来光栅化的，所以布局属性在那里不会吸附，这些元素可以继续用 `left`/`top`。凡是由浏览器布局的东西（普通 DOM）都遵循这条规则。

`gsap_non_transform_motion` lint 规则是最后一道防线，不是老师 —— 从一开始就用 transform，而不是先给布局属性做动画、再等 lint 来拒绝。

### will-change（节制使用）

```css
.title {
  will-change: transform;
}
```

只加在*真正*会动的元素上。到处都加就失去了作用，还会浪费内存。

### 用 gsap.quickTo 处理高频更新（仅限 preview）

对于由**事件**驱动的高频更新 —— 指针移动、滚动、音频拖动 —— `quickTo` 复用同一个 tween，而不是每帧新建一个：

```javascript
const xTo = gsap.quickTo("#cursor", "x", { duration: 0.4, ease: "power3" });
const yTo = gsap.quickTo("#cursor", "y", { duration: 0.4, ease: "power3" });

container.addEventListener("mousemove", (e) => {
  xTo(e.pageX);
  yTo(e.pageY);
});
```

> **渲染模式下没有输入事件。** 渲染器逐帧 seek；`mousemove`、`scroll` 等永远不会触发。`quickTo` 的主要用途只适用于浏览器里的**实时 preview**。要在渲染中做音频响应式运动，请预先提取音频数据，并以声明式方式驱动 timeline（见 `../rules/gsap-effects.md`）。

### Stagger 胜过 N 个 tween

一个带 `stagger` 的 tween，在可读性和运行时开销上都胜过 N 个手动设 delay 的 tween。

### 清理

在实时 preview 中，暂停或 `kill()` 掉屏幕外的动画。渲染模式不受影响（渲染器直接驱动时间）。
