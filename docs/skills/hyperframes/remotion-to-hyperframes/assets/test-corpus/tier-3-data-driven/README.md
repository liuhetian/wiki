<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/README.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Tier 3 — stargazed-data-driven

## 测试内容

一个专门构建的数据驱动 fixture，在不使用 PR #214 的 runtime adapter 的前提下，考察生产环境中 Remotion composition 的真实形态。如果一个翻译通过了 T3，就说明本 skill 正确处理了：

- 带 `z.object` schema 和类型化 `defaultProps` 的 `<Composition>`
- 在多个场景中以不同 props 复用的自定义 React 子组件
- 一个嵌套的数据结构（`stats[]`），落实为带有逐实例属性的重复 HTML
- 一个由帧驱动的数字递增动画（`AnimatedNumber` → GSAP `onUpdate`）
- 两种不同的 `spring` 配置，翻译成两种不同的 `back.out` 过冲
- 通过组件 props 实现的逐实例延迟（`delayInFrames` → GSAP timeline 偏移）

## Composition 形态

```
Stargazed (10 s @ 30 fps, 1280×720)
├── Sequence 0–3 s   TitleScene
│                    ├── title  ← spring scale
│                    └── subtitle ← linear fade
├── Sequence 3–7 s   StatsScene
│                    ├── StatCard "Stars" 1247 #fbbf24 (delay 0 frames)
│                    ├── StatCard "Forks" 312 #60a5fa  (delay 12 frames)
│                    └── StatCard "Issues" 48 #f87171  (delay 24 frames)
└── Sequence 7–10 s  OutroScene
                     └── UnderlinedText "thanks for watching" ← scale-in underline
```

每个 `StatCard` 都是一个自定义子组件，内部用 `AnimatedNumber` 从 0 数到目标值。`AnimatedNumber` 本身则由 `useCurrentFrame()` + 一个手写的 `1 - (1 - t)^3` ease 推导出显示的数值。

## 有损的部分（以及为什么阈值 = 0.90）

1. **`spring → back.out(N)`**：这个 composition 里有两种不同的 spring 配置。
   - `{ damping: 12, stiffness: 100, mass: 1 }`（标题）→ `back.out(1.4)`
   - `{ damping: 14, stiffness: 90, mass: 1 }`（数据卡片）→ `back.out(1.2)`

   过冲比例（1.4 对 1.2）近似地反映了 damping 的差异。GSAP 的 back ease 和 Remotion 的 spring 在曲线尾段并不完全吻合 —— 每个 spring 实例大约会损失 0.03 的平均 SSIM。

2. **数字递增的 easing**：`AnimatedNumber` 使用在组件里手动计算的 `1 - (1 - t)^3`（三次方 ease-out）。GSAP 的 `power3.out` 是相同的曲线形状 —— 应该能紧密吻合。两个渲染器都会在每一帧对显示的整数取整；当取整后的值因为一个不足一帧的时间差而在两个数之间跳变时，会出现轻微的不一致。

3. **字体渲染**：与 T1/T2 同样的注意事项。系统的 Helvetica/Arial 回退字体在两个渲染器之间会产生轻微的抗锯齿差异。受影响最大的是数据卡片上的数字（大号、字重 800）。

T3 中低于 0.90 的平均 SSIM 表明的是*结构性*不匹配（场景时长错误、错开时间错误、prop 连线缺失），而不是近似带来的漂移。那才是我们关心的失败信号。以 PNG/BT.709 输出、对照 Remotion @ 4.0 校准得到的平均值是 0.953。

## 翻译详解（skill 速查表）

| Remotion | HyperFrames |
| --- | --- |
| `<Composition schema={z.object({...})} defaultProps={...} />` | 根 `#stage` div 上的 data-\* 属性 |
| 嵌套数组 prop（`stats[]`） | 带逐实例 `data-*` 属性的重复 HTML 标记 |
| 自定义 React 子组件 | 内联的重复 HTML，以组件的 prop 接口作为模板 |
| `<AnimatedNumber from={0} to={value} dur={45} />`（三次方 ease-out 数字递增） | 对 `{ v: 0 }` 对象做 tween，用 `onUpdate` 改写 `textContent`，ease 用 `power3.out` |
| `spring({damping:12, stiffness:100})` | `back.out(1.4)`，时长约 0.7 秒 |
| `spring({damping:14, stiffness:90})` | `back.out(1.2)`，时长约 0.7 秒 |
| `delayInFrames={i * 12}`（逐实例） | GSAP timeline 偏移 `(i * 0.4)` 秒 |
| 用 `useVideoConfig()` 获取 `fps` | 去掉 —— composition 的 fps 写在 `#stage` 的 `data-fps` 上 |

## 如何渲染与评估

```bash
# Render Remotion baseline (no setup.sh — no binary assets in this fixture)
cd remotion-src && npm install && npm run render

# Render HyperFrames translation
cd ../hf-src && npx hyperframes render --output ../hf.mp4

# Compare
../../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```
