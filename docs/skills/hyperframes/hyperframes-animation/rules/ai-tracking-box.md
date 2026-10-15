---
name: ai-tracking-box
description: >
  一个带 L 形角标的动态边界框，沿一条来回振荡的路径跟随 —— 模拟 AI 物体检测 / 跟踪。
metadata:
  tags: ai, tracking, bounding-box, detection, corner, yellow, ml
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/ai-tracking-box.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# AI Tracking Box（AI 跟踪框）

一个由四个 L 形角括号 + 一个置信度标签组成的边界框，跟随一个移动的目标，模拟实时的 AI 检测。在深色背景上用检测黄（`#facc15` 色系）渲染 —— 这是行业惯例（自动驾驶 HUD、安防计算机视觉、机器学习演示）；红色读作「警告」，绿色读作「成功」，蓝色读作「信息」—— 没有一种读作「检测」。

## 工作原理

一个 `ease: "none"` 的驱动 tween 推进相位 `p`；它的 `onUpdate` 先用三角函数算出目标的位置，再从目标推导出框的位置/尺寸 —— 每一帧都按这个顺序。框绝不拥有自己的位置 tween：如果它落后于目标，看起来就是一个坏掉的跟踪器，而不是聪明的 AI。尺寸以错开节奏的方式抖动几个百分点（非整数倍频率），模仿持续的重新拟合；置信度标签在 [95, 99] 内闪烁变化。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="bg-mascot" id="mascot">{targetGlyph}</div>
<div class="track-box" id="track-box">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="label" id="label">{LABEL} · {confidence}%</div>
</div>
```

```css
.track-box {
  position: absolute; /* position + size written by the driver's onUpdate */
  pointer-events: none;
  will-change: transform, width, height;
}
.corner {
  position: absolute;
  width: 48px;
  height: 48px;
}
/* Each corner draws only its two outer borders — .tr/.bl/.br mirror this: */
.corner.tl {
  top: -8px;
  left: -8px;
  border-top: 6px solid {detectionYellow};
  border-left: 6px solid {detectionYellow};
}
.label {
  position: absolute;
  top: -56px;
  left: -8px;
  background: {detectionYellow};
  color: {labelTextColor}; /* near-black on yellow */
  font-family: {monoFont}; /* mono = machine readout */
  white-space: nowrap;
}
```

```js
const box = document.getElementById("track-box");
const mascot = document.getElementById("mascot");
const label = document.getElementById("label");
const C = { x: COMP_WIDTH / 2, y: COMP_HEIGHT / 2 };

// Entry — the AI "locks on"
gsap.set(box, { opacity: 0, scale: ENTRY_SCALE });
tl.to(
  box,
  { opacity: 1, scale: 1, duration: ENTRY_DUR, ease: `back.out(${ENTRY_BOUNCE})` },
  ENTRY_START,
);

// Tracking — target first, box derived from it, every frame
const tracking = { p: 0 };
tl.to(
  tracking,
  {
    p: Math.PI * 2 * CYCLES,
    duration: TRACK_DUR,
    ease: "none",
    onUpdate: () => {
      const mx = C.x + Math.cos(tracking.p) * DRIFT_X;
      const my = C.y + Math.sin(tracking.p) * DRIFT_Y;
      mascot.style.left = `${mx - MASCOT_SIZE / 2}px`;
      mascot.style.top = `${my - MASCOT_SIZE / 2}px`;

      const w = SIZE_BASE + Math.sin(tracking.p * SIZE_FREQ_MULT) * SIZE_VAR;
      const h = SIZE_BASE + Math.sin(tracking.p * SIZE_FREQ_MULT + Math.PI / 2) * SIZE_VAR;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      box.style.left = `${mx - w / 2}px`;
      box.style.top = `${my - h / 2}px`;

      const conf = Math.round(
        CONFIDENCE_MEAN + Math.sin(tracking.p * CONFIDENCE_FREQ_MULT) * CONFIDENCE_VAR,
      );
      label.textContent = `${LABEL_TEXT} · ${conf}%`;
    },
  },
  TRACK_START,
);
```

## 变体

- **多目标**：每一对框/目标各用一个驱动，相位错开 `π / N`，让它们不会同步跳动。
- **丢失后重新捕获**：把框淡到约 0.2–0.4 的不透明度，然后用更硬的 `back.out(1.8–2.5)` 重新锁定，并通过 `tl.set` 闪现一个「REACQUIRED · 99%」标签。
- **先跟踪再缩放**：交接给 [viewport-change.md](viewport-change.md) —— 「AI 发现了什么，现在把它展示出来。」

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| ENTRY_SCALE | 0.5–0.9 | < 1 —— 框向上弹入焦点 |
| ENTRY_DUR / \_BOUNCE | 0.3–0.8s / 1.2–2.5 | 只能用 `back.out` —— elastic 看起来像卡通，power 看起来平淡 |
| TRACK_START | ≥ 入场结束 | 留一段空隙 = 停顿以示强调；没有空隙 = 无缝锁定 + 跟随 |
| TRACK_DUR | 2–8s | ≥ 一个完整周期，否则漂移永远看不出是振荡 |
| CYCLES | 0.5–3 | 有效频率保持在约 0.6 Hz 以下，否则运动会糊掉 |
| DRIFT_X / DRIFT_Y | 40–200px | 中心 ± 漂移量必须让目标完全留在屏幕内 |
| SIZE_BASE | 200–500px | 在所有抖动尺寸下都必须明显地框住目标 |
| SIZE_VAR | SIZE_BASE 的 5–10% | 更多看起来像坏了，没有则看起来像截图；保持 < 0.15× |
| SIZE_FREQ_MULT | 1.5–3，非整数 | 整数比会与漂移步调一致地脉动 = 机械感 |
| CONFIDENCE_MEAN/VAR | 95–99 / 1–3 | 均值 ± 变化量 ⊂ [95, 99]；< 95 显得「不确定」，100 显得「假精确」；97 是最佳点 |
| CONFIDENCE_FREQ_MULT | 3–6 | > SIZE_FREQ_MULT —— 标签闪烁得比框呼吸得更快 |
| MASCOT_SIZE | = 渲染尺寸 | 不一致会让目标漂出框外 |

token：`{detectionYellow}` 用 `#facc15` 色系；`{bgInner}/{bgOuter}` 用深色、低彩度的径向渐变，让黄色跳出来；`{labelTextColor}` 用近黑色；标签用 `{monoFont}`。

## 关键约束

- **❗ 框每一帧都从目标重新计算** —— 一个驱动算出目标位置，然后在同一个 `onUpdate` 里由它推导出框。绝不要单独 tween 框的位置。
- **用 L 形角括号，不用完整边框** —— 这是这个类型的标志；完整边框看起来像普通的 UI 方框。
- **深色上的黄色** —— 换成别的色相就会失去这个类型的辨识度。
- **置信度在 [95, 99] 以内的一个窄区间里闪烁变化**，使用等宽字体。
- 框上设 **`pointer-events: none`** —— 它是一层装饰性的 overlay。

## 另见

`viewport-change`（放大到检测结果上）· `multi-phase-camera`（跟踪时用全景，锁定时推近）· `sine-wave-loop`（目标在框里空闲呼吸）。
