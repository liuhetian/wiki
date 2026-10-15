---
name: card-morph-anchor
description: >
  容器在镜头之间形变尺寸和圆角，充当视觉上的转场锚点。
metadata:
  tags: morph, anchor, transition, border-radius, container, shape
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/card-morph-anchor.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 卡片形变锚点

一个自由浮动的容器在两个镜头之间形变它的视觉尺寸、圆角和表面处理 —— 形变本身「就是」转场；观众的视线追随这个始终存在的容器。区别于 [anchored-layout-expand.md](anchored-layout-expand.md)（一个边缘固定、活跃参与布局的元素，沿一个轴生长并让邻居重排 —— 这里没有任何东西被推挤）和 [theme-crossfade-morph.md](theme-crossfade-morph.md)（在固定锚点下给整个主题换皮 —— 这里是单个容器改变形状）。

## 原理

由于禁止 tween `width`/`height`，**用统一的 `scale` 代替视觉尺寸**；其余的形变通道都**只影响绘制**：`borderRadius`、`background`、`boxShadow`。所有通道都挂在「同一个」tween 上（同一个 ease、同一个时长），让形状步调一致地形变。内容编排：旧内容在形变的前约 40% 内淡出，新内容在最后约 40% 内淡入 —— 中间只有形状的那段间隙就是自然的「眨眼」。也可以在最末尾让形变卡片本身淡出，露出渲染在它后面的、下一个镜头里的真实元素。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<!-- DOM order = stacking: the anchor renders BEFORE the card, so the card is on top -->
<div class="next-shot-anchor"><img src="{nextShotAnchor}" alt="anchor" /></div>
<div class="morph-card">
  <div class="content-old">{shotOneContent}</div>
  <div class="content-new">{shotTwoContent}</div>
</div>
```

```css
.morph-card {
  width: SHOT_ONE_W;
  height: SHOT_ONE_H; /* shot-1 geometry; the morph is scale, never width/height */
  border-radius: SHOT_ONE_RADIUS;
  background: {surfaceShotOne};
  overflow: hidden; /* content must clip during the shape change */
  display: grid;
  place-items: center;
  will-change: transform;
}
.content-old,
.content-new {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
.content-new {
  opacity: 0; /* author its inner sizes at apparent-size ÷ END_SCALE — it scales with the card */
}
.next-shot-anchor {
  position: absolute;
  opacity: 0; /* fades in as the morph card fades out */
}
```

```js
const END_SCALE = SHOT_TWO_W / SHOT_ONE_W; // uniform — keep the two shots aspect-matched

// Hold shot 1 for HOLD_BEAT first — an instant morph reads as glitchy.

// One tween, all channels: uniform scale + paint-only properties.
tl.to(
  ".morph-card",
  {
    scale: END_SCALE,
    borderRadius: SHOT_TWO_RADIUS / END_SCALE, // borderRadius is pre-scale — divide to land the APPARENT radius
    background: "{surfaceShotTwo}",
    boxShadow: "{shadowShotTwo}",
    duration: MORPH_DUR,
    ease: "power2.inOut",
  },
  MORPH_START,
);

tl.to(
  ".content-old",
  { opacity: 0, duration: MORPH_DUR * OLD_FADE_FRAC, ease: "power1.in" },
  MORPH_START,
);
tl.to(
  ".content-new",
  { opacity: 1, duration: MORPH_DUR * NEW_FADE_FRAC, ease: "power1.out" },
  MORPH_START + MORPH_DUR * (1 - NEW_FADE_FRAC),
);

// Optional handoff — card fades out over the pixel-identical real anchor.
tl.to(
  ".morph-card",
  { opacity: 0, duration: MORPH_DUR * FINAL_FADE_FRAC, ease: "power1.in", immediateRender: false },
  MORPH_START + MORPH_DUR * (1 - FINAL_FADE_FRAC),
);
tl.to(
  ".next-shot-anchor",
  { opacity: 1, duration: MORPH_DUR * FINAL_FADE_FRAC, ease: "power1.out" },
  MORPH_START + MORPH_DUR * (1 - FINAL_FADE_FRAC),
);
```

## 形变通道

| 通道 | 做法 |
| --- | --- |
| 视觉尺寸 | 统一的 `scale` —— 替代被禁止的 `width`/`height` tween；保持宽高比 |
| `borderRadius` | 只影响绘制；单位是缩放前的 —— tween 到 `APPARENT_RADIUS / END_SCALE`，不超过较短边的一半 |
| `background` | 只影响绘制；渐变只有在色标数量相同时才能插值（纯色→纯色：用 `backgroundColor`） |
| `boxShadow` | 只影响绘制；从基础阴影 → 强调色发光，转移视觉重心 |

## 变体

- **落到一个不居中的目标上**（dock 图标、侧边栏槽位）：在同一个 tween 里加上 `x`/`y`，按 FLIP 的方式算出卡片矩形与目标矩形之间的差值 —— 在构建时对两者都调用 `getBoundingClientRect()`（按约定，仅限单场景），然后 tween 这个差值。不要根据 CSS 值手算：padding、border 和父级 transform 会层层叠加，而中心与边缘的换算正是经典的差一半 bug。
- **镜头之间宽高比不同**：统一缩放会保持宽高比 —— 形变到最接近的统一缩放适配，让交叉淡化 / 交接吸收那一点小差值；或者去掉交接，停在卡片的最终状态上。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| HOLD_BEAT | 0.6–1.5s | ≥ 镜头 1 入场落定的时间；观众必须先看清镜头 1 |
| MORPH_DUR | 0.6–1.2s | < 0.5s 时放不下两段内容淡化 |
| END_SCALE | SHOT_TWO_W / SHOT_ONE_W | 交接到图标大小时，视觉宽度通常落在 80–400px |
| SHOT_TWO_RADIUS | 视觉上 ≤ min(W, H)/2 | 较短边的一半 = 正圆；超过的部分会被钳制 |
| OLD/NEW_FADE_FRAC | 各 0.3–0.5，总和 ≤ 1 | 两者之间的空隙就是只有形状的「眨眼」 |
| FINAL_FADE_FRAC | 0（不交接）或 0.1–0.2 | 仅当存在像素级一致的锚点时使用 |
| ease | 标准用 `power2.inOut` | `power3`/`expo.inOut` 也可以；绝不用 `back`/`elastic` —— 过冲会和形状变化打架 |

## 关键约束

- **❗ 统一缩放替代** —— 绝不 tween `width`/`height`；`scale` + 只影响绘制的通道（`borderRadius`、`background`、`boxShadow`）是「仅有的」形变属性。
- **❗ 交接锚点必须与卡片的最终状态像素级一致** —— 相同的视觉尺寸、圆角、背景、阴影、内部图标尺寸。任何差异 = 交叉淡化过程中出现可见的跳变。没法完全一致？那就去掉交接，停在形变卡片上。
- **❗ 靠 DOM 顺序决定层叠，绝不在淡化中途突变 z-index** —— 让锚点渲染在卡片之前；在 opacity tween 进行中执行 `tl.set({ zIndex })`，会在淡化结束前翻转层叠顺序并导致闪烁。
- 卡片上设 **`overflow: hidden`** —— 圆角变化时内容必须被裁剪。
- **形变之前先停顿一拍**；形状和交叉淡化使用同一族 ease（混用 ease 看起来不同步）。

## 另见

`anchored-layout-expand`（边缘固定、带重排的单轴生长）· `theme-crossfade-morph`（在固定锚点下给整个主题换皮）· `scale-swap-transition`（不改变形状的内容替换）· `sine-wave-loop`（在最终状态上的呼吸）。
