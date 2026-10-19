<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/audio-reactive.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 音频响应动画

用音乐、人声或声音驱动画面。任何 GSAP 可以做动画的属性，都可以响应预先提取好的音频数据。

## 音频数据格式

```js
var AUDIO_DATA = {
  fps: 30,
  totalFrames: 900,
  frames: [{ bands: [0.82, 0.45, 0.31, ...] }, ...]
};
```

- `frames[i].bands[]` —— 各频段的振幅，0-1。索引 0 = 低音，越往后越高音。
- 每个频段都在整条音轨范围内各自独立归一化。

## 把音频映射到画面

| 音频信号               | 画面属性                          | 效果                       |
| ---------------------- | --------------------------------- | -------------------------- |
| 低音（bands[0]）       | `scale`                           | 踩着节拍脉动               |
| 高音（bands[12-14]）   | `textShadow`、`boxShadow`         | 辉光强度                   |
| 整体振幅               | `opacity`、`y`、`backgroundColor` | 呼吸、上浮、色彩偏移       |
| 中频（bands[4-8]）     | `borderRadius`、`width`           | 形状变形                   |

任何 GSAP 可以 tween 的属性都行 —— `clipPath`、`filter`、SVG 属性、CSS 自定义属性。

## 是内容，不是媒介

音频提供的是**时机和强度**。视觉语汇来自叙事。

**绝不要加：** 均衡器柱、频谱分析仪、波形显示、音符剪贴画、通用粒子系统、彩虹色循环、踩着节拍闪白、抽象的脉动光球。

**应该：** 让内容决定画面，让音频驱动它的行为。低音让暖意*膨胀*。高音让对比*锐化*。视觉上的选择来自「这件作品给人什么感觉？」

## 采样模式

音频响应需要用 `for` 循环配合 `tl.call()` 逐帧采样，而不是用单个 tween：

```js
// ✅ Correct — sample every frame
for (var f = 0; f < AUDIO_DATA.totalFrames; f++) {
  tl.call(
    (function (frame) {
      return function () {
        draw(frame);
      };
    })(AUDIO_DATA.frames[f]),
    [],
    f / AUDIO_DATA.fps,
  );
}

// ❌ Wrong — single tween, doesn't react to audio
gsap.to(".el", { scale: 1.2, duration: totalDuration });
```

没有逐帧采样，composition 实际上并不会响应音频。

## textShadow 的坑

在带有半透明子元素（例如处于非激活状态、颜色为 `rgba(255,255,255,0.3)` 的字幕词）的父容器上设 `textShadow`，会在所有子元素背后渲染出一个可见的辉光矩形。解决办法：节拍脉动的 `scale` 加在容器上，但 `textShadow` 只加在单个处于激活状态的词上。

## 指导原则

- **文字要克制** —— 缩放变化 3-6%，柔和的辉光。剧烈的脉动会让文字没法读。
- **非文字可以放开** —— 背景和形状承受得住 10-30% 的摆幅。
- **匹配能量** —— 企业类 = 克制；音乐录影带 = 夸张。
- **确定性** —— 用预先提取的数据，不用 Web Audio API，不做运行时分析。

## 约束

- 所有音频数据都必须预先提取（使用本 skill `scripts/` 里的 `extract-audio-data.py`）
- 不用 `Math.random()` 或 `Date.now()`
- 音频响应和其他所有动画跑在同一条 GSAP timeline 上
