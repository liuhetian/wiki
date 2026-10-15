---
name: split-tilt-cards
description: >
  两张卡片并排，Y 轴旋转方向相反，形成对称的 3D 分屏布局，用于对比或成对的功能展示。
metadata:
  tags: 3d, cards, split, tilt, comparison, symmetric, layout
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/split-tilt-cards.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Split Tilt Cards

两张卡片并排，`rotateY` 方向相反（左边 `+TILT`，右边 `−TILT`）—— 一种对称的「书本打开」式 3D 分屏，用于对比、前后对照、成对的功能展示。每张卡片从自己那一侧滑入（强化「它们来自各自的世界，在这里相遇」），然后这一对以反相位做空闲运动。

## 工作原理

在场景根节点上设 `perspective`（**必须** —— 没有它，`rotateY` 会被压平成 2D 布局），在舞台和两张卡片上设 `transform-style: preserve-3d`。入场时每张卡片以 `TILT + TILT_OVERSHOOT` 偏离轴线开始，落定到 `TILT` —— 一种转动着就位的效果。空闲运动是一次温和的反相位 y 方向浮动（两个 yoyo tween 朝相反方向运行）；文案在卡片落定期间淡入上浮，而不是落定之后。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="split-stage">
  <div class="card card-left">
    <div class="card-eyebrow">{leftEyebrow}</div>
    <div class="card-headline">{leftHeadline}</div>
    <div class="card-body">{leftBody}</div>
  </div>
  <div class="card card-right">…</div>
</div>
```

```css
.scene-root {
  display: grid;
  place-items: center;
  perspective: SCENE_PERSPECTIVE; /* REQUIRED */
}
.split-stage {
  display: flex;
  gap: STAGE_GAP;
  transform-style: preserve-3d;
}
.card {
  width: CARD_WIDTH;
  transform-style: preserve-3d;
  will-change: transform;
}
/* Shadow falls WITH the facing direction: left card faces right → shadow right. */
.card-left {
  box-shadow: -CARD_SHADOW_OFFSET CARD_SHADOW_DROP CARD_SHADOW_BLUR {shadowColor};
}
.card-right {
  box-shadow: CARD_SHADOW_OFFSET CARD_SHADOW_DROP CARD_SHADOW_BLUR {shadowColor};
}
```

```js
// Entry — from outside, opposing tilts settle with a small pivot
tl.fromTo(
  ".card-left",
  { x: -ENTRY_SLIDE_DIST, rotateY: TILT + TILT_OVERSHOOT, opacity: 0 },
  { x: 0, rotateY: TILT, opacity: 1, duration: ENTRY_DUR, ease: "power3.out" },
  LEFT_AT,
);
tl.fromTo(
  ".card-right",
  { x: ENTRY_SLIDE_DIST, rotateY: -TILT - TILT_OVERSHOOT, opacity: 0 },
  { x: 0, rotateY: -TILT, opacity: 1, duration: ENTRY_DUR, ease: "power3.out" },
  RIGHT_AT,
);

// Counter-phase idle bob — opposite signs = alive; synchronized = conveyor belt
tl.to(
  ".card-left",
  { y: -FLOAT_AMP, duration: FLOAT_DURATION / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
  IDLE_START,
);
tl.to(
  ".card-right",
  { y: FLOAT_AMP, duration: FLOAT_DURATION / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
  IDLE_START,
);

// Copy fades up during the settle
tl.from(
  ".card-eyebrow, .card-headline, .card-body",
  { opacity: 0, y: COPY_RISE, stagger: COPY_STAGGER, duration: COPY_DUR, ease: "power2.out" },
  COPY_REVEAL_AT,
);
```

## 变体

- **徽章 / 浮动标签**：放在**父级**上，绝不要放在卡片内部 —— 放在里面会继承 `rotateY`，跟着歪到轴线之外。
- **3 张及以上的卡片**：中间那张保持平放（`rotateY: 0`），外侧两张向内倾斜 ——「老办法 / 什么都不做 / 我们的办法」。
- **穿越推进**：用一个单独的镜头 tween 缩放 `.split-stage`，看起来就像观众穿过了这对倾斜卡片之间的空隙。

## 取值

| token             | 范围                             | 说明                                                    |
| ----------------- | -------------------------------- | ------------------------------------------------------- |
| SCENE_PERSPECTIVE | 1000–2400px                      | 越低倾斜越夸张；越高越接近等轴测                        |
| TILT              | 10–18°                           | < 10 看起来几乎是平的；> 18 像合上了，文案会糊          |
| TILT_OVERSHOOT    | 4–12°                            | 转动着就位的感觉                                        |
| STAGE_GAP         | 40–120px（约 0.06–0.15×CARD_WIDTH） | 小 = 融为一对；大 = 被比较但彼此分开                 |
| CARD_WIDTH        | 1920 下 480–820px                | 在完全倾斜时满足 `2×CARD_WIDTH + STAGE_GAP ≤ 0.95×stage` |
| ENTRY_SLIDE_DIST  | 200–500px（约 0.3–0.6×CARD_WIDTH） |                                                       |
| ENTRY_DUR         | 0.6–1.2s                         |                                                         |
| RIGHT_AT          | LEFT_AT + 0–0.3s                 | 为零显得机械；太大会把这一对拆散                        |
| FLOAT_AMP         | 3–8px                            | 要的就是含蓄                                            |
| FLOAT_DURATION    | 往返 1.6–3.2s                    | 呼吸般的节奏；IDLE_START ≥ 入场结束                     |
| COPY_REVEAL_AT    | 在入场的尾段期间                 | 卡片进入空闲之后才弹出的文案，看起来是脱节的            |

## 关键约束

- **场景根节点上必须设 `perspective`**；舞台**和**每张卡片上都要设 `preserve-3d`。
- **阴影方向与倾斜一致** —— 左边卡片面朝右 → 阴影落在右边（右边卡片镜像）。正负号弄反看起来就是坏掉的 3D。
- **反相位的空闲运动** —— 两个浮动在同一位置以相反的正负号运行。
- **徽章放在卡片 div 之外**（否则会继承旋转）。
- **每张卡片的正文文案 ≤ 2 行** —— 倾斜的长段落会塌缩成透视模糊。
- **对称的分量** —— 相同的宽度、相同的垂直中心、相近的行数；不对称会破坏对比的隐喻。

## 另见

`card-morph-anchor`（之后这一对可以 morph 成一个统一的形状）· `counting-dynamic-scale`（数字作为每一侧的大标题）· `sine-wave-loop`（空闲运动的形式）。
