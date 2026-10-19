---
name: avatar-cloud-network
description: >
  头像分布在一个椭圆环上，用 SVG 虚线连到中心枢纽 —— 带错开入场的社会认同「社区」揭示。
metadata:
  tags: avatar, cloud, network, social-proof, ellipse, connection, stagger
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/avatar-cloud-network.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 头像云网络

头像排布在中心枢纽（logo / 计数器）周围的椭圆环上，SVG 虚线从枢纽向外画到每个头像 —— 表达「社区」/ 社会认同。区别于 [orbit-3d-entry.md](orbit-3d-entry.md)（持续环绕）：本规则最终定格成一个静态的构图阵型。

## 原理

三层：SVG 连线（z-index 1，在最后面）、头像（z-index 2）、枢纽（z-index 5 —— 连线终止「在」它的边缘，绝不穿过它）。头像位置和连线在 setup 时一次性构建，全部基于「同一个」共享中心；随后 timeline 依次执行：枢纽淡入 → 头像级联入场 → 连线向外绘制 → 呼吸停留。从中心「向外」画就是叙事本身：「枢纽连接起它的社区」。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<svg class="lines" viewBox="0 0 1920 1080"><!-- lines injected --></svg>
<div class="hub-wrap">
  <div class="hub">{counterValue} {counterLabel}</div>
  <!-- avatars injected -->
</div>
```

```css
.lines {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.hub-wrap {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
.hub {
  position: relative;
  z-index: 5;
}
.avatar {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, -50%); /* centers on the (left, top) the script sets */
  will-change: transform, opacity;
}
```

```js
// CENTER_X/Y must equal the hub's RENDERED center exactly — every avatar
// position and line endpoint derives from it. For a place-items:center hub on
// a 1920×1080 canvas: (W/2, H × CENTER_Y_FACTOR).
const C = { x: CENTER_X, y: CENTER_Y };
const wrap = document.querySelector(".hub-wrap");
const svg = document.querySelector(".lines");

for (let i = 0; i < AVATAR_COUNT; i++) {
  const a = (i / AVATAR_COUNT) * Math.PI * 2 - Math.PI / 2; // start at top
  const x = C.x + Math.cos(a) * RADIUS_X;
  const y = C.y + Math.sin(a) * RADIUS_Y;

  const av = document.createElement("div");
  av.className = "avatar"; // assign image / glyph from authoring data
  av.style.left = `${x}px`;
  av.style.top = `${y}px`;
  wrap.appendChild(av);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const attrs = {
    x1: C.x,
    y1: C.y,
    x2: x,
    y2: y,
    stroke: "{lineColor}",
    "stroke-dasharray": "6 8",
  };
  Object.entries(attrs).forEach(([k, v]) => line.setAttribute(k, String(v)));
  const len = Math.hypot(x - C.x, y - C.y); // straight line — Math.hypot, not getTotalLength()
  line.style.strokeDashoffset = String(len);
  svg.appendChild(line);
}

tl.from(".hub", { opacity: 0, scale: 0.8, duration: HUB_DUR, ease: `back.out(${HUB_BOUNCE})` }, 0);

const avatars = document.querySelectorAll(".avatar");
avatars.forEach((av, i) => {
  tl.from(
    av,
    { opacity: 0, scale: 0, duration: AVATAR_DUR, ease: `back.out(${AVATAR_BOUNCE})` },
    AVATAR_AT + i * AVATAR_STAGGER,
  );
});
svg.querySelectorAll("line").forEach((line, i) => {
  tl.to(
    line,
    { strokeDashoffset: 0, duration: LINE_DUR, ease: "power2.out" },
    LINES_AT + i * LINE_STAGGER,
  );
});

// Climax dwell — out-of-phase breathing holds the eye on the formed network:
// one phase proxy (0 → 2π·BREATH_CYCLES, ease "none"); onUpdate scales avatar i by
// 1 + sin(p + (i/n)·2π) · BREATH_AMP — sine-wave-loop's multiplicative onUpdate form.
// Keep the -50% centering in the same transform write.
```

## 变体

- **尺寸变化**：用一个按索引取值的小数组让头像尺寸各不相同，免得整个环看起来死板重复。
- **实线**：去掉虚线 + 绘制动画；连线用 opacity 淡入 —— 更有企业感，少一点网络感。
- **多层轨道**：内环（头像更少、更大）连接到枢纽；外环是不连线的「光晕」。
- **符号头像**：用旗帜 / emoji / 图标代替人脸 —— 表达「全球社区」或角色分布。

## 取值

| token | 范围 | 说明 |
| --- | --- | --- |
| AVATAR_COUNT | 8–12 | 少了显得稀疏；多了会把椭圆塞得杂乱 |
| RADIUS_X / \_Y | 约 20–30% W / 约 18–25% H | X/Y 比为 1.5–3.0 时有透视感；为 1（正圆）时显得扁平 |
| 头像尺寸 | 80–120px @1920 | 环上必须能放下 10 个以上且互不重叠 |
| HUB_DUR | 0.4–0.6s | HUB_BOUNCE 1.4–1.8 |
| AVATAR_AT | ≥ 0.6 × HUB_DUR | 枢纽先立住，卫星再到场 |
| AVATAR_DUR | 0.4–0.7s | AVATAR_BOUNCE 1.4–1.8，比枢纽略收敛一些 |
| AVATAR_STAGGER | 0.06–0.10s | 级联入场读作「陆续加入」；同时出现读作「本来就在」 |
| LINES_AT | 与最后一个头像的落定重叠 | 在它之前约 0.1–0.2s 开始 —— 绘制读起来像是落地的结果 |
| LINE_DUR | 0.4–0.7s | LINE_STAGGER 0.02–0.05s = 一道向外扩散的波 |
| BREATH_CYCLES | 剩余时长内 1.0–2.0 次 | 少于 1 = 一声叹息；多于 2 = 显得焦躁。BREATH_AMP 0.02–0.06 |

Token：深色的 `{bgColor}`，让头像云读起来像星座；半透明的强调色 `{lineColor}`；柔和的描边 + 发光让头像在深色背景上保持清晰。

## 关键约束

- **CENTER_X/Y 必须与枢纽实际渲染出的中心一致** —— 与另一个场景组合时（例如重新居中的 logo），要从与枢纽最终位置相同的来源推算出它们，否则连线会明显对不上枢纽。
- **枢纽的 z-index 高于连线** —— 连线终止在枢纽边缘，绝不穿过它。
- **连线向外绘制**（dashoffset 从 len → 0），在头像大多已落定之后开始。
- **`RADIUS_X > RADIUS_Y`** —— 横向椭圆有透视感；正圆显得扁平。
- 连线画完后**高潮停留 ≥ 1s**，让成形的网络能被看清。
- 直线：用 `Math.hypot` 求长度 —— 不需要 `getTotalLength()`。

## 另见

`counting-dynamic-scale`（枢纽「就是」一个不断增长的计数器）· `sine-wave-loop`（呼吸的形式）· `orbit-3d-entry`（持续环绕的近亲）。
