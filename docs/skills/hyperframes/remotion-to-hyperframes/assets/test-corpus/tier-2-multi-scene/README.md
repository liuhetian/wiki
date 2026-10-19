<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/README.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Tier 2 — title-image-outro

## 测试内容

三场景的 composition。每个场景考察一种不同的 Remotion 惯用写法：

1. **Scene 1（0–2 秒）** —— TitleScene，用 `spring({damping:12, stiffness:100, mass:1})` 驱动文字上的 `transform: scale()`。测试有损的 `spring → GSAP ease` 翻译。
2. **Scene 2（2–4 秒）** —— ImageScene，淡入一张用 `staticFile` 加载的图片，并把它从 0.8 线性缩放到 1.0。测试素材路径 + 线性 `interpolate`。
3. **Scene 3（4–6 秒）** —— OutroScene，带 1 秒的线性淡入。在前面较难的场景之后做一次健全性检查。

一段 6 秒的静音 WAV 以 `volume={0.5}` 从头播到尾。测试 `<Audio>` 的翻译。

如果一个翻译通过了 T2，就说明本 skill 正确处理了 `<Sequence>` 边界、`<Audio>` / `<Img>` / `staticFile`，以及 Remotion `spring → GSAP ease` 的启发式换算。

## 翻译详解

| Remotion | HyperFrames |
| --- | --- |
| `<Sequence from={0} durationInFrames={60}>` | 宿主 `<div data-composition-src="compositions/scene-1.html" data-start="0" data-duration="2" data-track-index="0">` |
| `spring({frame, fps, config: {damping:12, stiffness:100, mass:1}})` | `gsap.to(target, { scale: 1, duration: 0.7, ease: "back.out(1.4)" })` |
| `<Audio src={staticFile("music.wav")} volume={0.5} />` | `<audio src="assets/music.wav" data-start="0" data-duration="6" data-volume="0.5" data-track-index="1">` |
| `<Img src={staticFile("square.png")} />` | `compositions/scene-2.html` 里的 `<img src="../assets/square.png">`（由 setup.sh 复制到两棵目录树中） |
| 30 fps 下的 `interpolate(frame, [0, 15], [0, 1])` | `gsap.to(target, { opacity: 1, duration: 0.5, ease: "none" })` |

场景之间的交叉淡化是 HyperFrames 的惯用写法，而不是 Remotion 的：在场景边界处，每个场景 sub-composition 都在自己的本地结束时间点设置 `gsap.set(scene, { opacity: 0 })`，让场景在正确的时间消失。Remotion 则凭借 `<Sequence>` 的 durationInFrames 隐式地做到了这一点。

## 如何渲染与评估

```bash
# 1. Generate the binary assets (PNG + WAV) via ffmpeg
./setup.sh

# 2. Render Remotion baseline
cd remotion-src && npm install && npm run render

# 3. Render HyperFrames translation
cd ../hf-src && npx hyperframes render --output ../hf.mp4

# 4. Compare
../../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```

## 为什么阈值是 0.95？

与 T1 的阈值相同（`expected.json` 把它固化下来供编排脚本使用）。Spring → `back.out(1.4)` 在校准时的结果比预想的更干净 —— 对照 0.95 的闸门，经过验证的平均值是 0.985。如果翻译弄坏了别的东西（spring 过冲不对、错开时间偏了、素材路径漂移），平均 SSIM 会远远跌破 0.95 —— 那就是失败信号。
