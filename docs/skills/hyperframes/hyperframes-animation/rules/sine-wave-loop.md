---
name: sine-wave-loop
description: >
  有界的正弦驱动空闲运动 —— 在一个停住的元素上做含蓄的抖动（jitter），或者一次确实必要的、有界的环境式呼吸。已降低优先级：用循环呼吸来表现「生气」是廉价的做法；在动用这条规则之前，优先采用与旁白同步的顺序揭示，其次是含蓄的抖动。
metadata:
  tags: idle, jitter, bounded-ambient, sine, trigonometry, low-amplitude, post-entry
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/sine-wave-loop.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Sine Wave Loop（含蓄抖动 / 有界环境运动）

> **最后才动用它。** 根据运动原则（`references/motion-language.md`）：循环呼吸 —— 把文字/卡片放大缩小，让它看起来「活着」—— 是廉价的、是 agent 条件反射式的取巧，看起来很弱。「我宁可**没有**运动，也不要**糟糕的**运动。」先用**与旁白同步的顺序揭示**填满一个镜头的后半段；如果某一帧确实已经落定、仍然需要一点生气，**被认可的做法是含蓄的抖动** —— 也就是把这条规则用在其幅度范围的**低端**。完整的呼吸循环是少有的最后手段，只用在单个停住的 hero 上，绝不批量盖到每个元素上。

在 timeline 时钟上用 `Math.sin`，让一个已落定的元素不至于显得死气沉沉。两种形式：

- **Yoyo 形式** —— 一个 `sine.inOut` tween，带 `yoyo: true` 和一个**有限的** `repeat` 次数。当空闲运动单独作用在一个没有别的东西碰的属性上时，首选这种形式。
- **onUpdate 形式** —— 一个长的 `ease: "none"` tween 驱动一个 `phase` 代理对象从 `0 → 2π·CYCLES`；`onUpdate` 把 `Math.sin(phase)` 映射到 transform 上。当偏移量需要乘到/加到另一个实时值上时（复合变换、幅度包络、多倍频），必须用这种形式。

无论哪种形式，空闲运动都从入场落定的位置开始：在 `phase = 0` 时，`sin(0) = 0` —— 偏移量为零，所以从入场的静止状态过来没有跳变。

## 配方

```js
// onUpdate form — phase-driven, composable.
const phase = { p: 0 };
tl.to(
  phase,
  {
    p: Math.PI * 2 * CYCLES,
    duration: IDLE_DUR,
    ease: "none", // sine provides the easing; a non-linear phase tween distorts the wave
    onUpdate: () => {
      const s = Math.sin(phase.p);
      hero.style.transform = `translateY(${s * Y_AMP_PX}px) scale(${1 + s * SCALE_AMP})`;
      // secondary elements: offset by Math.PI / 2 — synced motion looks mechanical
      dot.style.transform = `scale(${1 + Math.sin(phase.p + Math.PI / 2) * DOT_SCALE_AMP})`;
    },
  },
  IDLE_START_TIME,
);

// Yoyo form — standalone property, finite repeats.
tl.to(
  "#badge",
  { y: -Y_AMP_PX, duration: PERIOD / 2, ease: "sine.inOut", yoyo: true, repeat: REPEATS },
  IDLE_START_TIME,
);
```

## 变体

- **多倍频**（自然感）：叠加一层更高频的波动 —— `1 + Math.sin(p) * AMP_PRIMARY + Math.sin(p * OCTAVE_RATIO) * AMP_SECONDARY`，其中 `AMP_SECONDARY < AMP_PRIMARY`，叠加后的最大值落在正常的 SCALE_AMP 范围内。
- **落定并淡出**（`IDLE_DUR > 6s` 时强烈推荐）：在空闲期的最后约 20% 内把幅度降到零，让场景在场景间转场之前明显地落定下来，而不是在漂移中途交接：

```js
const t = phase.p / (Math.PI * 2 * CYCLES); // 0 → 1 across idle
const env = t < 1 - FADE_FRAC ? 1 : (1 - t) / FADE_FRAC; // FADE_FRAC ≈ 0.2
const scale = 1 + Math.sin(phase.p) * SCALE_AMP * env;
```

当定稿快照显示「到结尾一切都还在动」时，这是最有效的单项修复；它与断点边界的转场天然搭配（交叉淡化/推移开始时，退出的画面是静止的）。

## 取值

| token           | 范围 / 默认                          | 说明                                                                       |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| SCALE_AMP       | **默认 0.008–0.015**                 | 只有在画布上孤立存在 / 场景 <6s / 动态风格的 brief 时，才提到 0.02–0.04    |
| Y_AMP_PX        | **默认 2–3px**                       | 只有在同样的前提下才用 4–6px；旋转 ±0.3–0.8° 几乎从来不需要                |
| period          | 1.5–3s（空闲期长时 2.5–4s）          | <1.5s 显得慌乱；在短时间窗里 >4s 显得没有生气                              |
| CYCLES          | `IDLE_DUR/3 ≤ CYCLES ≤ IDLE_DUR/1.5` | 从周期推导出它，而不是反过来                                               |
| IDLE_START_TIME | ≥ 入场落定 + 约 0.1s                 | 此刻 `sin(0)=0` → 从入场尾巴过来没有跳变                                   |
| IDLE_DUR        | `TOTAL_DURATION − IDLE_START_TIME`   | 一个长 tween 填满停留期 —— 绝不重新启动                                    |
| DOT_SCALE_AMP   | 0.04–0.12                            | 小的点缀元素比 hero 能承受更大的幅度                                       |
| OCTAVE_RATIO    | 2.0–4.0                              | 接近整数时听起来有音乐感；非整数时显得自然                                 |

## 关键约束

- **先揭示，再抖动，最后才呼吸** —— 即上面原则给出的顺序；每个幅度范围都默认取**低端**。如果连续 5 个以上的场景都用上端，整部片子看起来就是一片「闪烁」。
- **空闲时间窗很长时**（`IDLE_DUR > 6s` 或空闲期 > composition 的 30%）：把 `SCALE_AMP` / `Y_AMP_PX` 减半，把周期放慢到 3–4s，并加上落定并淡出的尾巴。
- **N 个元素同时空闲运动时**（多列、卡片网格、数据行）：每个元素的幅度 ≤ 默认值 `/ √N`，**并且**错开周期（2.1s / 1.9s / 2.4s）。三列各 ±6px 会叠加成 ±18px 互相竞争的运动；三列各 ±2–3px 看起来是一次集体的呼吸。
- **叠加，不要替换** —— 空闲运动是**加到**元素的静止 transform 上的；绝不要覆盖入场最终的平移量。
- **相位 tween 用 `ease: "none"`** —— 正弦本身就是曲线。
- **空闲运动不要用 CSS `@keyframes`** —— CSS 动画跑在浏览器的渲染时钟上，独立于 HF 的 seek 时钟；由 CSS 驱动的空闲运动会闪烁/失去同步。在 timeline 内部驱动空闲运动。

## 另见

`ambient-glow-bloom`（对应的辉光图层版本，遵守同样的有界呼吸纪律）· `press-release-spring` / `counting-dynamic-scale` / `card-morph-anchor` / `orbit-3d-entry`（这条规则可以接在其后的已落定元素）· `spring-pop-entrance`（任何空闲运动之前的那次抵达）。
