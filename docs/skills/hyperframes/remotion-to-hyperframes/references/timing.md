# Timing 翻译：interpolate、spring、easing

收益最高的一份参考文档。easing 和时间是观众会注意到的东西；把它们弄错所损失的 SSIM，比任何其他翻译选择都多。已在 T1–T3 层级上经过实证验证。

## 换算：帧 → 秒

HF 的 timeline 以秒为单位。Remotion 是基于帧的。始终这样换算：

```
time_seconds = frame / fps
```

所以在 fps=30 时：

- 第 15 帧 → 0.5 秒
- 第 30 帧 → 1.0 秒
- 第 90 帧 → 3.0 秒

在翻译时做一次这个换算，而不是在运行时做。

## interpolate —— 线性

```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
```

翻译为：

```js
gsap.to(target, { opacity: 1, duration: 1.0, ease: "none" }, 0);
// fromTo if the property starts at 0 and CSS doesn't already set it
gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "none" }, 0);
```

`ease: "none"` 对应 Remotion 默认的线性插值。如果你的初始状态写在 CSS 里，就由 CSS 设定 `from` 值；否则用 `fromTo`。

`extrapolateLeft`/`extrapolateRight` 在 Remotion 中默认是 `"extend"`，但 agent 最常见到的是 `"clamp"`。GSAP 不做外推 —— 值会停留在 tween 的起点和终点。所以对于 `clamp`，GSAP 是吻合的；对于 `extend`，你需要在输出之前手动扩展输入范围。

## interpolate —— 多段

```tsx
const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0]);
```

在偏移 `[0]/fps`、`[1]/fps`、`[2]/fps` 处的三个关键帧 tween：

```js
const tl = gsap.timeline({ paused: true });
tl.to(target, { opacity: 1, duration: 0.5, ease: "none" }, 0);
tl.to(target, { opacity: 1, duration: 2.0, ease: "none" }, 0.5);
tl.to(target, { opacity: 0, duration: 0.5, ease: "none" }, 2.5);
```

已在 T1 中验证 —— 对照 Remotion 基线的平均 SSIM 为 0.974。

## spring → GSAP back.out

Remotion 的 `spring()` 是损失最大的翻译。这个映射是近似的，但已足够接近，真实世界的 composition 能保持 ≥ 0.92 的 SSIM（T2：0.985，T3：0.953）。

| Remotion `spring` 配置 | GSAP 等价写法 | 验证于 |
| --- | --- | --- |
| `{damping: 12, stiffness: 100, mass: 1}`（干脆利落） | `back.out(1.4)`，时长约 0.7 秒 | T2、T3（TitleScene） |
| `{damping: 14, stiffness: 90, mass: 1}`（更平缓） | `back.out(1.2)`，时长约 0.7 秒 | T3（StatCard） |
| `{damping: 8, stiffness: 200}`（非常弹） | `back.out(2.0)` 或 `elastic.out(1, 0.5)`，时长约 0.6 秒 | 未验证；预留约 0.05 的 SSIM 损失 |
| `{overshootClamping: true}` | `power3.out`，时长约 0.6 秒（无过冲） | 未验证 |

**经验法则**：`back.out(N)` 的过冲比例 ≈ `(stiffness / damping^2) * 1.4`。对于 `damping:12, stiffness:100`，算出来是 `1.4 * 100/144 = 0.97`，与经过验证的 1.4 相近（这个公式很粗略；靠目测来调）。对于典型配置，默认时长约为 0.7 秒。

当 spring 的 `delay`/`from`/`to` 不是默认值时，按比例缩放时长。

## 带自定义 easing 的 interpolate

```tsx
import { Easing } from "remotion";
interpolate(frame, [0, 30], [0, 1], { easing: Easing.out(Easing.cubic) });
```

| Remotion | GSAP |
| --- | --- |
| `Easing.in(Easing.linear)` | `ease: "none"` |
| `Easing.out(Easing.cubic)` | `ease: "power3.out"` |
| `Easing.inOut(Easing.cubic)` | `ease: "power3.inOut"` |
| `Easing.out(Easing.poly(N))` | `ease: "power<N>.out"`（N=2 为 quad，3 为 cubic，4 为 quart，5 为 quint） |
| `Easing.bezier(a,b,c,d)` | `CustomEase.create("c", "M0,0 C${a},${b} ${c},${d} 1,1")`（需要 CustomEase 插件） |
| `Easing.elastic(bounciness)` | `ease: "elastic.out(${bounciness}, 0.3)"` |
| `Easing.bounce` | `ease: "bounce.out"` |
| `Easing.back(overshoot)` | `ease: "back.out(${overshoot * 1.7})"`（Remotion 的 overshoot 刻度不同） |

## 驱动非数值属性的 interpolate

```tsx
const color = interpolateColors(frame, [0, 30], ["#ff0000", "#0000ff"]);
```

GSAP 原生支持颜色 tween：

```js
gsap.to(target, { color: "#0000ff", duration: 1.0, ease: "none" }, 0);
```

`backgroundColor`、`borderColor` 同理。`from` 值从 CSS 或内联样式中读取。

## 自定义数字递增 / 数字 tween

当 Remotion 使用由帧驱动的数字渐变（`Math.round(value * eased)`）时：

```tsx
const t = interpolate(frame, [0, 45], [0, 1]);
const eased = 1 - (1 - t) ** 3; // cubic ease-out
const value = Math.round(target * eased);
return <div>{value.toLocaleString()}</div>;
```

GSAP 的等价写法 —— 对一个计数器对象做 tween，在更新时写入 `textContent`：

```js
const counter = { v: 0 };
tl.to(
  counter,
  {
    v: target,
    duration: 1.5,
    ease: "power3.out",
    onUpdate: () => {
      el.textContent = Math.round(counter.v).toLocaleString();
    },
  },
  0,
);
```

`power3.out` 与 `1 - (1-t)^3` 完全吻合。已在 T3 中验证（平均 SSIM 0.953）。不足一帧的时间偏移会造成个别帧上的数字不一致，但最终值会收敛 —— 对 SSIM 的影响不超出噪声底。

## 通过逐实例 prop 实现错开

当自定义子组件接受一个 `delayInFrames` prop 时：

```tsx
<StatCard delayInFrames={i * 12} value={...} />
```

翻译成 GSAP timeline 偏移：

```js
cards.forEach((card, i) => {
  const start = base + i * (12 / fps); // i * 0.4s at fps=30
  tl.to(card, { ... }, start);
});
```

已在 T3 中验证 —— 三个 StatCard 在 0.0/0.4/0.8 秒处错开。
