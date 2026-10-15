---
name: kinetic-beat-slam
description: >
  打击乐式的动态文字 —— 短语按稳定的节拍重重砸入，每个短语的入场各不相同，可选的节奏装饰（节拍器刻度、节拍条），最后落定为锁住的终场。
metadata:
  tags: text, kinetic, typography, beat, rhythm, slam, percussive, punchy
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/kinetic-beat-slam.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Kinetic Beat Slam

短语按**稳定的节拍**一个接一个砸入，每个短语的入场都*不同*，然后堆叠成锁住的终场 —— 这是「有冲击力 / 有节奏感」的文字主导作品（标语、宣言、造势开场）的配方。平庸和有节奏感的区别在于：(1) 一个共享的**起拍时间数组**驱动所有元素，(2) 每个短语用**各不相同**的入场，而不是复用同一个 helper，(3) 可选的**节奏装饰**，肉眼可见地打着拍子。

## 工作原理

一个统一的速度网格 —— 每个细分拍 `PULSE` 秒，`BEATS = [t0, t1, t2, …]` 落在这个网格上 —— 是节奏的脊柱；每个短语入场、每个强调、每个装饰刻度都从它读取时间，所以整部作品锁定在同一个脉搏上，而不是靠手调的偏移量逐渐漂移。每个短语使用不同的变换轴（缩放+模糊砸入 / 侧向弹入 / 上升+旋转），起音很短（击打时 0.35–0.6s），之后整个堆叠保持住，带一段有限次数的低幅度呼吸。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="kbs-stage">
  <div class="kbs-line" id="p1"><span class="verb">Notice</span> more.</div>
  <div class="kbs-line" id="p2"><span class="verb">Decide</span> faster.</div>
  <div class="kbs-line" id="p3"><span class="verb">Act</span> now.</div>
</div>
<!-- optional rhythm chrome -->
<div class="kbs-metronome" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
```

```css
.kbs-stage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 120px 160px; /* title-safe margin */
}
.kbs-line {
  font-family: "Archivo Black", "League Gothic", sans-serif; /* embedded display face */
  font-size: 150px;
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: #f5f5f5;
}
.kbs-line .verb {
  color: #ff5b2e; /* exactly one accent hue */
}
.kbs-metronome {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
}
.kbs-metronome i {
  width: 6px;
  height: 28px;
  background: #ff5b2e;
  opacity: 0.25;
}
```

```js
// ONE tempo grid drives everything — phrases AND the metronome read it.
const PULSE = 0.4; // seconds per sub-beat
const BEATS = [PULSE * 1, PULSE * 5, PULSE * 9]; // phrase onsets, on the grid

// Distinct entrances per phrase (NOT one reused helper).
tl.fromTo(
  "#p1",
  { scale: 1.5, filter: "blur(16px)", opacity: 0 },
  { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.5, ease: "power4.out" },
  BEATS[0],
);
tl.fromTo(
  "#p2",
  { x: -320, opacity: 0 },
  { x: 0, opacity: 1, duration: 0.45, ease: "expo.out" },
  BEATS[1],
);
tl.fromTo(
  "#p3",
  { y: 90, rotation: 6, opacity: 0 },
  { y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: "circ.out" },
  BEATS[2],
);

// Rhythm chrome: each tick flashes on the SAME grid, not a magic offset.
gsap.utils.toArray(".kbs-metronome i").forEach((tick, i) => {
  tl.to(tick, { opacity: 1, duration: 0.08, yoyo: true, repeat: 1, ease: "none" }, PULSE * (i + 1));
});

// Finale hold: floor (not ceil) so the repeat never overshoots data-duration;
// max(0,…) so a short hold never yields a negative repeat (GSAP reads negative as -1 = infinite).
const holdStart = BEATS[2] + 0.7,
  cycle = 1.6,
  holdDur = SCENE_DURATION - holdStart;
tl.to(
  ".kbs-stage",
  {
    scale: 1.01,
    duration: cycle / 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: Math.max(0, Math.floor(holdDur / cycle) - 1),
  },
  holdStart,
);
```

## 变体

- **按起音性格选入场 easing** —— `power4.out` 硬砸 ⭐ 默认击打 · `expo.out` 最硬的弹入（侧向弹入、甩入）· `back.out(2)` 过冲弹出（只用于强调词，不用于正文词）· `circ.out` 带惯性的沉重上升。整部作品至少使用 **3 种不同的 easing**。
- **节奏装饰的替代方案** —— 用一条居中的节拍条，或一个随拍脉动的 `// label` 等宽标签，代替 5 格刻度的节拍器；任何必须在 shader 转场中保留下来的装饰元素，按 `../transitions/overview.md` 做标记。
- **终场修饰** —— 堆叠 + 强调色下划线扫过（[css-marker-patterns](css-marker-patterns.md)）；不要让最后一个短语就那么干杵着。

## 取值

| token             | 范围                 | 说明                                                                                         |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| BEATS 间距        | 1.2–1.8s             | <0.8s 显得慌乱，>2.5s 就丢了脉搏；间距保持均匀 —— 这是节拍                                    |
| 入场时长          | 0.35–0.6s            | 击打必须在下一拍之前完成；退场 ≤0.25s                                                        |
| 强调色            | 恰好 1 个            | 用在动词上；其余用单色白 / 近黑                                                              |
| 展示字体          | 150px+，粗字重       | Archivo Black / League Gothic / Oswald —— 见 `hyperframes-creative/references/typography.md` |

## 关键约束

- **一个节拍数组，而不是四处散落的偏移量** —— 每个元素都以 `BEATS[]` / `PULSE` 定时；这是做出「节奏感」最大的一个杠杆。
- **每个短语的入场都不同** —— 所有行都复用同一个 `punchIn()`，就是「平淡但合格」的典型破绽。变换运动轴，复用 ease 的*家族*。
- **终场 repeat 的算法**：`repeat: Math.max(0, Math.floor(dur / cycle) - 1)` —— `Math.ceil` 会超出 `data-duration`，并触发 lint 规则 `gsap_repeat_ceil_overshoot`；负数的 repeat 会被 GSAP 读成 `-1`（无限循环）。
- **场景之间不要用被禁止的退场动画** —— 在蒙太奇里，*转场*就是退场（`../transitions/overview.md`）；只有最后一个场景可以淡出。
- **展示字体必须内嵌**，否则渲染时会悄无声息地回退 —— Anton / 按字面写的 Bebas 并未内嵌（`Bebas Neue` 会被映射为 League Gothic；到 `typography.md` 里核实）。

## 另见

`3d-text-depth-layers`（给砸入的词加挤出纵深）· `css-marker-patterns`（终场的下划线/圈注）· `sine-wave-loop`（终场的呼吸）· `../adapters/gsap-easing-and-stagger.md`（easing 词汇表）。
