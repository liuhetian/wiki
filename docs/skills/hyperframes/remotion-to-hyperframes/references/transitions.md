<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/transitions.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 转场翻译：@remotion/transitions → HF 交叉淡化 / shader-transitions

`@remotion/transitions` 包是 Remotion 预置的场景间转场库。HF 有两条路径来翻译它们：

1. **手动 GSAP 交叉淡化** —— 用于简单的 opacity/transform 转场。免费，不需要额外的包。
2. **HF shader-transitions 包** —— 用于与 @remotion/transitions 各 preset 相对应的、视觉效果丰富的转场。

## 模式：`<TransitionSeries>` 就是带重叠的 `<Series>`

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

翻译为按转场时长相互重叠的场景：

- SceneA：[0, 60] = `data-start="0" data-duration="2"`
- SceneB：[60-15, 60-15+60] = `data-start="1.5" data-duration="2"`（转场窗口与 A 的结尾和 B 的开头重叠）

然后用 GSAP 驱动转场：

```js
// Manual fade (presentation={fade()})
tl.to(sceneA, { opacity: 0, duration: 0.5, ease: "none" }, 1.5);
tl.fromTo(sceneB, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 1.5);
```

## Presentation 对照表

| Remotion `presentation` | HF 翻译 |
| --- | --- |
| `fade()` | 手动 `gsap.to(opacity)` 交叉淡化 |
| `slide({direction: "from-right"})` | 对进入的场景做 `gsap.fromTo(translateX: "100%" → 0)` + 对退出的场景做 `to(translateX: "-100%")` |
| `wipe({direction: "from-left"})` | 对进入的场景做 `gsap.fromTo(clip-path: inset(0 100% 0 0) → inset(0 0 0 0))` |
| `clockWipe()` | 使用 HF 的 `sdf-iris` shader-transition（`npx hyperframes add sdf-iris`） |
| `flip()` | `gsap.to(rotateY)`，180° 在两个场景之间对半分 |
| `cube()` | 使用 HF 的 `cinematic-zoom`，或者用 `rotateY` + `transform-origin` 手动搭建 |
| `iris()` | 使用 HF 的 `sdf-iris` shader-transition |
| `none()` | 没有转场；在边界处硬切 |

## 时间参数的翻译

```tsx
linearTiming({durationInFrames: 15})              → ease: "none"
linearTiming({durationInFrames: 15, easing: ...}) → ease per the easing table in timing.md
springTiming({config: {damping: 12}})             → ease: "back.out(1.4)" (~0.7 s)
```

把 `durationInFrames` 换算成秒（`/fps`）。

## 何时使用 HF shader-transitions

对于 Remotion preset 中那些有着视觉效果丰富的 GLSL 等价物的转场（iris、ripple、zoom、glitch），使用 HF 的 [shader-transitions](https://hyperframes.heygen.com/catalog/blocks) 包。它们产出的效果比手动 GSAP transform 更丰富。

```bash
npx hyperframes add sdf-iris
```

然后在 composition 中：

```html
<div id="iris-transition" class="hf-shader-transition" data-start="1.5" data-duration="0.5">
  <!-- bound scenes via the shader-transition's data-from / data-to -->
</div>
```

每个 shader-transition 都有自己的 data 属性；具体 block 见目录页面。

## 源码使用自定义 Presentation 时

Remotion 支持自定义的 `presentation` 实现：

```tsx
const customPresentation: PresentationComponent = ({
  children,
  presentationProgress,
  presentationDirection,
}) => {
  return (
    <div
      style={
        {
          /* compute transform from progress */
        }
      }
    >
      {children}
    </div>
  );
};
```

翻译方式：从 `style={...}` 块中提取出数学计算，输出等价的 GSAP tween。具体来说，transform 公式直接映射为一个以 `progress` 为参数的 `gsap.to(target, { transform: ... })`。

如果自定义 presentation 在内部使用 `useCurrentFrame()` 来给简单进度曲线*之外*的东西做动画，就把这份源码视为不可翻译，退出并改用 runtime 互操作模式（见 [escape-hatch.md](escape-hatch.md)）。
