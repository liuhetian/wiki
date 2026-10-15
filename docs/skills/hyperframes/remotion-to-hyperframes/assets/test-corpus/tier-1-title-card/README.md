<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/README.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Tier 1 — title-card-fade

## 测试内容

最简单的、有实际意义的 Remotion → HyperFrames 翻译。一个文字元素在前 0.5 秒淡入，保持 2.0 秒，再在最后 0.5 秒淡出。没有音频，没有媒体，没有自定义组件。

如果一个翻译连 T1 都通不过，说明它在最基本的门槛上就坏了：`AbsoluteFill`、`useCurrentFrame`、带多段输入的 `interpolate`，以及 Remotion 基于帧的驱动方式与 HF 的暂停 GSAP 驱动方式之间的时间偏移。

## 翻译详解

| Remotion | HyperFrames |
| --- | --- |
| `<AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>` | `<body style="background: #0a0a0a">` + 一个定位好的根 div |
| `useCurrentFrame()` | 去掉 —— HF 会 seek 这条 timeline |
| fps=30 下的 `interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0])` | `gsap.timeline({ paused: true })`，在 0s/0.5s/2.5s 三个偏移处各调用一次 `.to()`，每次都用 `ease: "none"` |
| `<div style={{ opacity }}>HELLO</div>` | 静态标记；opacity 由 timeline 来做动画 |

Remotion→HF 的时间换算是 `time = frame / fps`。所以 30 fps 下的 `[0, 15, 75, 90]` 变成 `[0, 0.5, 2.5, 3.0]` 秒。

## 如何渲染与评估

```bash
# Render Remotion baseline
cd remotion-src && npm install && npm run render
# Renders to remotion-src/out/baseline.mp4

# Render HyperFrames translation
cd ../hf-src && npx hyperframes render --output ../hf.mp4

# Compare with the eval harness (from skill scripts/)
../../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```

`expected.json` 记录了这个 fixture 的 SSIM 阈值（0.95）；以 PNG/BT.709 输出、对照 Remotion @ 4.0 校准得到的平均值是 0.974。
