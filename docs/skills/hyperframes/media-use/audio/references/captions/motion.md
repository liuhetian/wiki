<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/captions/motion.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 动态字幕技法

你来到这里，是因为 SKILL.md 要求你在写动画代码之前先读这个文件。根据你从转写稿里判断出的能量级别，从下表中挑选技法组合，然后用标准的 GSAP 模式实现。

## 按能量选择技法

| 能量级别 | 高亮 | 退场 | 循环模式 |
| ------------ | ------------------------------------- | ------------------- | ----------------------------------------- |
| 高 | 卡拉 OK + 强调色辉光 + scale pop | 散开或下坠 | 每 2 组交替一次高亮样式 |
| 中高 | 卡拉 OK + 颜色跳出 | 散开或收拢 | 每 3 组交替一次 |
| 中 | 卡拉 OK（克制，仅白色） | 淡出 + 滑动 | 每 3 组交替一次 |
| 中低 | 卡拉 OK（缩放变化极小） | 淡出 | 单一样式，每组变换 ease |
| 低 | 卡拉 OK（暖色调，慢速过渡） | 收拢 | 每 4 组交替一次 |

**所有能量级别都以卡拉 OK 高亮为基线。** 区别在于强度——高能量时，当前词获得强调色 + 辉光 + 15% 的 scale pop；低能量时，只是柔和地转为白色并缩放 3%。

**强调词总是打破模式。** 当一个词被标记为强调（情绪关键词、全大写、品牌名）时，给它比周围词更强的动画（更大的缩放、强调色、过冲 ease）。这样就形成了对比。

**马克笔高亮模式在卡拉 OK 之上再加一层视觉。** 对于需要的不止是颜色 / 缩放的强调词，加一个马克笔风格的效果：高亮扫过、圈出、迸发、潦草涂画或划掉。实现细节见 `hyperframes-animation/rules/css-marker-patterns.md`。按能量匹配模式：造势用迸发，关键术语用圈出，常规用高亮，克制的用潦草涂画。

## 音频响应式字幕（音乐场景必做）

**如果源音频是音乐（器乐伴奏上的人声、节拍、任何音乐内容），你必须提取音频数据并加上音频响应式动画。** 这不是可选项——没有音频响应的音乐看起来是脱节的。即使是低能量的抒情歌，也要有细微的低音脉动和高音辉光。

不需要特别的接线。分组循环本来就会遍历每个字幕组，去构建入场、卡拉 OK 和退场的 tween。在这个时候，读取每个组时间范围内的音频数据，用普通的 GSAP tween 来调制该组动画的强度。

```js
// Load audio data inline (same pattern as TRANSCRIPT)
var AUDIO = JSON.parse(audioDataJson); // { fps, totalFrames, frames: [{ bands: [...] }] }

GROUPS.forEach(function (group, gi) {
  var groupEl = document.getElementById("cg-" + gi);
  if (!groupEl) return;

  // Read peak energy for this group's time range
  var startFrame = Math.floor(group.start * AUDIO.fps);
  var endFrame = Math.min(Math.floor(group.end * AUDIO.fps), AUDIO.totalFrames - 1);
  var peakBass = 0;
  var peakTreble = 0;
  for (var f = startFrame; f <= endFrame; f++) {
    var frame = AUDIO.frames[f];
    if (!frame) continue;
    peakBass = Math.max(peakBass, frame.bands[0] || 0, frame.bands[1] || 0);
    peakTreble = Math.max(peakTreble, frame.bands[6] || 0, frame.bands[7] || 0);
  }

  // Modulate entrance — louder groups enter bigger and glowier
  tl.to(
    groupEl,
    {
      scale: 1 + peakBass * 0.06,
      textShadow:
        "0 0 " + Math.round(peakTreble * 12) + "px rgba(255,255,255," + peakTreble * 0.4 + ")",
      duration: 0.3,
      ease: "power2.out",
    },
    group.start,
  );

  // Reset at exit so audio-driven values don't persist
  tl.set(groupEl, { scale: 1, textShadow: "none" }, group.end - 0.15);
});
```

这是在构建时塑造动画，而不是在播放时——没有逐帧回调，没有 `tl.call()` 循环，也没有异步 fetch 的时序问题。响的组入场时更有分量、更亮；轻的组入场时更柔和。音频数据调制的是*多少*，内容决定的是*什么*。

音频响应要保持克制——3-6% 的缩放变化加柔和的辉光。剧烈的脉动会让文字没法读。

生成音频数据文件：

```bash
python3 skills/hyperframes-creative/scripts/extract-audio-data.py audio.mp3 --fps 30 --bands 8 -o audio-data.json
```

## 组合技法

不要在每个组上都用同一种高亮动画——用组的索引在多种样式之间循环。不要在同一时间点对同一个词叠加多个相互竞争的动画。在不同组之间变换技法，以匹配内容节奏的变化。

**马克笔高亮效果**和卡拉 OK 叠加效果很好——用卡拉 OK 做逐词揭示，然后只在强调词上加马克笔效果。例如：卡拉 OK 把每个词高亮为白色，但品牌名得到一道黄色的高亮扫过，统计数字得到一个红圈。在不同组之间循环马克笔模式，以获得视觉上的变化。

## Runtime 工具

字幕动效使用标准的 HyperFrames runtime API。请使用以下权威来源：

- **GSAP timeline + tween 语法** —— `hyperframes-animation/adapters/gsap.md`（ease、position 参数、性能）
- **`window.__hyperframes.fitTextFontSize` / `pretext`** —— `hyperframes-core/references/determinism-rules.md` → Layout Contract（布局契约）（防止溢出、逐帧测量文字）
- **音频数据提取** —— 用 `python3 skills/hyperframes-creative/scripts/extract-audio-data.py audio.mp3 --fps 30 --bands 8 -o audio-data.json` 生成，然后像上面"音频响应式字幕"一节所示那样内联加载
