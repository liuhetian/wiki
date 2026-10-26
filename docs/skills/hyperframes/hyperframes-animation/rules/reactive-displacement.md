---
name: reactive-displacement
description: >
  物理碰撞：入场元素的弹簧驱动退场元素的位移 —— 单一事实来源让两段运动形成因果关联。
metadata:
  tags: transition, physics, collision, displacement, spring, causal
---

# Reactive Displacement

元素 A 的退场动画是从元素 B 的入场弹簧在数学上**推导**出来的 —— 一种因果关联：「A 动，*是因为* B 撞了它。」区别于 [scale-swap-transition.md](scale-swap-transition.md)（有重叠但没有因果）和 [card-morph-anchor.md](card-morph-anchor.md)（一个容器的 morph）。

一个 0→1 的驱动 tween（「入场弹簧」）在同一个 `onUpdate` 里驱动三个同时进行的派生运动：

- **闯入者**（B，入场）：在整个驱动过程中，位置从舞台外插值到落定位置，外加倾斜落定到 0°，以及一次早而陡的不透明度显现。
- **受害者**（A，退场）：位置从落定位置插值到**相反**方向的舞台外，在驱动的 `VICTIM_FRACTION`（约 0.4–0.5）处完成 —— **不是** 1.0。

受害者在闯入者入场完成**之前**就已离开，形成「先撞、再落定」的节奏；共用同一个带缓动的驱动器，让撞击的那一刻在数学上是同步的。

## 配方

```js
// Both cards absolutely centered; overflow: hidden on the scene (off-stage travel);
// will-change: transform, opacity on both; intruder z-index ABOVE victim.
const INTRUDER_START_X = STAGE_W; // off-stage right
const VICTIM_END_X = -STAGE_W; // off-stage left — SAME axis, opposite direction

gsap.set("#victim", { x: 0, opacity: 1, rotation: 0 });
gsap.set("#intruder", { x: INTRUDER_START_X, opacity: 0, rotation: -INTRUDER_TILT });

const driver = { p: 0 };
tl.to(
  driver,
  {
    p: 1,
    duration: DRIVER_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`, // the intruder spring
    onUpdate: () => {
      // Intruder: full 0→1 progress maps enter (off-stage → center)
      const intruderX = INTRUDER_START_X * (1 - driver.p);
      const intruderOpacity = Math.min(1, driver.p * FADE_IN_SHARPNESS);
      const intruderRot = -INTRUDER_TILT * (1 - driver.p); // settles to 0°
      const intruder = document.getElementById("intruder");
      intruder.style.transform = `translate(-50%, -50%) translateX(${intruderX}px) rotate(${intruderRot}deg)`;
      intruder.style.opacity = String(intruderOpacity);

      // Victim: completes its exit at VICTIM_FRACTION of the driver — by the
      // time the intruder centers, the victim is already off-stage.
      const victimP = Math.min(1, driver.p / VICTIM_FRACTION);
      const victimX = VICTIM_END_X * victimP;
      const victim = document.getElementById("victim");
      victim.style.transform = `translate(-50%, -50%) translateX(${victimX}px)`;
      victim.style.opacity = String(1 - victimP);
    },
  },
  DRIVER_AT,
);
// Climax dwell — intruder holds centered for ≥ DWELL_MIN before the scene ends.
```

## 变体

- **受害者的撞击旋转** —— 受害者在滑走时也旋转：把 `const victimRot = victimP * -VICTIM_KICK_DEG;` 追加到它的 transform 里。`VICTIM_KICK_DEG` 取 15–25°，幅度与闯入者给人的重量感相匹配。
- **垂直碰撞** —— 闯入者从上方进入，受害者被向下推开；同样的数学用在 Y 上。看起来像「有个重物砸在了上面」。
- **落定后的晃动** —— 闯入者居中后，先做一段阻尼正弦晃动（`±WOBBLE_AMP_DEG` 的旋转，通过 `DRIVER_AT + DRIVER_DUR` 处的第二个 `ease: "none"` 驱动器在 `WOBBLE_DUR` 内线性衰减），再归于静止 —— 「撞击的余波」。
- **多受害者涟漪** —— 闯入者推开多张排成一列的卡片，每个受害者的 `victimP` 落在略有偏移的驱动相位上（级联涟漪）。

## 取值

| token             | 范围                   | 说明                                                                                                       |
| ----------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| DRIVER_AT         | 取决于阶段             | 在前一个阅读节拍完成之后；场景结束前必须留出 ≥ DWELL_MIN 的高潮停留                                        |
| DRIVER_DUR        | 0.6–1.4 s              | 短 = 轻快的一击，长 = 沉重落地的撞击；时长长时弹性过高会显得飘                                             |
| BOUNCE_FACTOR     | 1.2–2.0（常用 1.4–1.6）| 保持在 `back.out` 家族内（或用 `elastic.out` 做振荡）—— 换家族就重写了观感                                 |
| VICTIM_FRACTION   | 0.4–0.5                | <0.4 受害者在撞击被看清之前就消失了；>0.5 感觉是并行的，而不是因果的；硬上限约 0.6                         |
| STAGE_W           | ≥ composition 宽度     | 更小的话，起始时舞台外的元素会部分可见                                                                     |
| INTRUDER_TILT     | 5–15°（常用约 10°）    | 低 = 干净的滑入，高 =「旋转着扎下」；正负号与入场方向一致（动量传递）                                      |
| FADE_IN_SHARPNESS | 3–8                    | 闯入者在进度的 `1/FADE_IN_SHARPNESS` 处达到不透明度 1；必须 > 1，否则到中心时它还是透明的                  |
| DWELL_MIN         | ≥ 1.0 s（常用 1.0–1.5）| 撞击后的停留是新内容被阅读的时间 —— 不要省掉                                                               |

## 关键约束

- **单一驱动器 = 单一事实来源** —— 两段运动都在**同一个**驱动器的 `onUpdate` 里计算，绝不为每个元素分别调用 `tl.to()`；各自独立的 tween 会摧毁因果关联（它们只是在时间上挨得近而已）。
- **受害者在驱动的某个比例处完成** —— 「撞击」就是重叠的那一刻；在那之后，受害者只是在腾出闯入者将要填补的空间。
- **有方向的动量传递** —— 同一轴线，相反方向；不同轴线看起来是擦身而过，而不是碰撞。
- **闯入者的 z-index 高于受害者** —— 要显式设置，不要依赖 DOM 顺序；否则受害者看起来像是穿隧过去的。
- **闯入者倾斜着进入，平平地落定** —— 小幅的初始倾斜 → 0°，看起来是「旋转着进来，然后扎稳」。
- **撞击后的高潮停留** —— 撞击是大标题那一拍；让落定的闯入者保持 ≥ DWELL_MIN。
- **场景上设 `overflow: hidden`** —— 舞台外的运动会超出画框。

## 另见

`control-target-sync`（实时编辑的镜像版 —— 反复耦合的编辑，没有东西退场）· `hacker-flip-3d`（入场期间闯入者的文字揭示）· `sine-wave-loop`（停留期间的空闲呼吸）· `vertical-spring-ticker`（一个把之前内容「挤」出去的滚动条）。
