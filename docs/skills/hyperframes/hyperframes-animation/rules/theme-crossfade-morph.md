---
name: theme-crossfade-morph
description: >
  在固定锚点之下原地变换整套主题 —— 背景、字体排印、圆角、图标、界面装饰和 logo 全部同时融合（约 0.3s），依次穿过 N 套预先做好样式的皮肤，而一个锚点元素始终不动。配方 = 堆叠的完整图层 + 不透明度交叉淡化，锚点只在最上层渲染一次。从结构上就是可安全 seek 的。
metadata:
  tags: theme, skin, crossfade, morph, anchor, reskin, cycle, ui, stacked-layers
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/rules/theme-crossfade-morph.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Theme Crossfade Morph

整个世界在换皮，只有一样东西纹丝不动。一个输入框依次切换四套 IDE 主题；一个结账组件翻过一套套品牌皮肤 —— 背景、字体排印、圆角、工具栏图标、页脚 logo **同时**原地改变，约 0.3s 完成，重复 N 次 —— 而在每一次翻转中，有一个锚点元素（提示词字符串、组件布局、文字标识）**从不移动**。锚点的静止就是这里的修辞主张：*一切都在变，这个不变。*

边界：[card-morph-anchor.md](card-morph-anchor.md) 是在两个镜头之间 morph **一个容器** —— 它的尺寸、圆角和表面连续地 tween。这条规则是让**整个场景**换皮，穿过 **N 个离散状态**：没有任何东西逐属性地 tween（字体、图标和 logo 无法插值）；所谓「morph」是对完整的、预先做好样式的图层做一次快速的同时交叉淡化。（[scale-swap-transition.md](scale-swap-transition.md) 是在中心替换一个元素；这里是周围环境在替换，而元素保持不动。）

## 工作原理

1. **一套皮肤 = 一个完整的图层。** 每个主题状态都是一个完全预先做好样式的满版图层（`position: absolute; inset: 0`），包含所有会变化的东西：背景、外壳/界面装饰、工具栏图标、页脚 logo、字体排印。所有 `N_SKINS` 个图层从 `t=0` 起就都在 DOM 里，层层堆叠；皮肤 0 一开始可见，其余都是 `opacity: 0`。
2. **morph 就是一次交叉淡化。** 在每个边界处，两个方向相反的不透明度 tween 在同一个 timeline 位置上、在 `MORPH_DUR`（约 0.3s）内运行：退出的 `1 → 0`，进入的 `0 → 1`。因为两个图层都是完整的，每个属性都免费地同时「融合」—— 包括那些无法 tween 的属性（字体家族、图标字形、logo），它们之所以看起来在 morph，恰恰是因为周围的一切都正处在融合中途。
3. **锚点只在最上层渲染一次。** 那个不能动的元素住在所有皮肤之上的独立图层里，并且**被排除在每个皮肤图层之外**。没有 transform，不重新挂载父级，不按皮肤重设样式。
4. **时间窗是预先算好的。** `T_k = CYCLE_START + k × (SKIN_HOLD + MORPH_DUR)`。默认是稳定的节奏；当最后一套皮肤是收束时，让它停留最久。

唯一被动画的属性是 `opacity` —— 这就是这条规则无需任何特殊机制就能安全 seek 的原因。

## 配方

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="theme-stage">
  <!-- One complete pre-styled layer per skin; skin-0 visible at t=0 -->
  <div class="skin skin-0"><div class="shell">…terminal chrome, mono type, footer badge…</div></div>
  <div class="skin skin-1">
    <div class="shell">…rounded composer, sans type, toolbar pills, logo…</div>
  </div>
  <div class="skin skin-2"><div class="shell">…dark shell, its own chrome and footer…</div></div>

  <!-- The anchor: rendered ONCE, above every skin. It never moves. -->
  <div class="anchor" id="anchor">{anchorText}</div>
</div>
```

```css
.theme-stage {
  position: absolute;
  inset: 0;
}
.skin {
  position: absolute;
  inset: 0;
  opacity: 0;
  /* Each skin fully self-styled: its own background, fonts, radii,
     icons, chrome, logos. Nothing inherited across skins. */
}
.skin-0 {
  opacity: 1; /* the opening state — matches the timeline's fromTo */
}
.shell {
  /* CRITICAL: shared geometry. The shell box (and any element that
     "persists" across skins — toolbar row, footer row) sits at the SAME
     coordinates in every skin, so mid-blend frames read as one UI
     changing clothes, not two UIs ghosting. */
  position: absolute;
  left: SHELL_LEFT;
  top: SHELL_TOP;
  width: SHELL_WIDTH;
  height: SHELL_HEIGHT;
}
.anchor {
  position: absolute;
  z-index: 10; /* above every skin */
  left: ANCHOR_LEFT;
  top: ANCHOR_TOP;
  /* No transforms, no transitions — the stillness is load-bearing. */
}
```

```js
const skins = gsap.utils.toArray(".skin");

// Boundary k→k+1 at T_k: outgoing fades down as incoming fades up —
// ONE simultaneous crossfade, everything blends at once.
skins.forEach((skin, k) => {
  if (k === 0) return; // skin-0 is the opening state
  const at = CYCLE_START + k * (SKIN_HOLD + MORPH_DUR);
  tl.fromTo(skin, { opacity: 0 }, { opacity: 1, duration: MORPH_DUR, ease: "power2.inOut" }, at);
  tl.to(
    skins[k - 1],
    { opacity: 0, duration: MORPH_DUR, ease: "power2.inOut" },
    at, // same position — the blend is simultaneous, never sequential
  );
});

// The anchor gets NO tweens. Its absence from the timeline is the point.
```

## 变体

- **锚点字体随主题换皮（每层一份副本）** —— 当锚点自己的字体处理必须随主题改变时（终端皮肤里用等宽字体，编辑器皮肤里用无衬线字体），每套皮肤都带一份自己的锚点副本，**几何位置逐像素一致**，不再有单独的顶层；不变量从「一个元素」变成「一套几何」。验证这些副本严丝合缝地重叠（把两套皮肤以 50% 不透明度截图对比）—— 2px 的基线漂移看起来就是锚点抖了一下，整个主张就破了。
- **带 logo 接力的皮肤巡游** —— 锚定外壳之外的一个大品牌 logo **在与皮肤相同的时间窗内**交叉淡化（logo k 配皮肤 k，相同的 `MORPH_DUR`）。成对的替换传达出「同一个产品，适配每个品牌」。
- **褪色终场** —— 最后一套皮肤之后，一个最终的低调图层（淡淡的点阵网格、蓝图式的冲淡）淡入，同时最后的外壳降到约 0.25 的不透明度 —— 整个循环收束成一张停住的、关于它自身的示意图。多一个时间窗；锚点可以随外壳一起变淡，也可以保持全强度。
- **强调式刹车** —— 前 `N−1` 套皮肤保持稳定节奏，然后让最后一套皮肤停留 2–3 倍的 `SKIN_HOLD`；循环展示广度，刹车让收束落地。预先算好停留时长数组；没有理由时不要让节奏漂移。

## 取值

| token           | 范围                                        | 说明                                                                                                 |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| N_SKINS         | 3–5                                         | 两套就是前后对比（考虑用 `card-morph-anchor`）；超过五套，循环就显得在凑数                          |
| SKIN_HOLD       | 0.8–1.5s                                    | 要长到足以认出 logo/页脚的身份，又要短到让这种翻转保持修辞性                                         |
| MORPH_DUR       | 0.25–0.4s，约 0.3s 为标准值                 | 更快看起来像硬切；更慢看起来像糊成一团的溶解，双重曝光迟迟不散                                       |
| CYCLE_START     | ≥ 锚点落定 + 一拍                           | 在锚点和皮肤 0 都已被完全看清之后                                                                    |
| SHELL 几何      | —                                           | 外壳 / 工具栏 / 页脚的坐标在各皮肤间完全一致；槽位内的内容可以自由不同                               |
| ANCHOR 位置     | —                                           | 在整个场景中逐像素一致（每层副本形式：在每套皮肤里都一致）                                           |
| 褪色 / 刹车     | 外壳约 0.2–0.3 不透明度；停留 2–3× SKIN_HOLD | —                                                                                                   |

## 关键约束

- **锚点从不移动。** 没有 transform，没有不透明度下探，不重新挂载父级，不重设样式 —— 全面翻转与绝对静止之间的反差就是这整个手法；只要抖一下，这个镜头就变成了幻灯片。
- **除了 `opacity` 什么都不 tween** —— 不要 tween `borderRadius` / `background`；圆角和颜色的变化靠下一个图层里它们本来就不同。可见性只靠 `opacity`，绝不切换 `display` / `visibility`（它们无法在淡化中途融合）。
- **共享的几何要逐像素对齐** —— 融合中途两套皮肤都部分可见；对齐的外壳看起来是一个 UI 在换衣服，没对齐的外壳会重影成两个 UI。
- **一切都预先做好样式** —— 每套皮肤都是完整且静态的；不切换 class，不在 tween 中途于运行时重设样式。
- **退出和进入的 tween 共用同一个 timeline 位置** —— 错开的融合会让舞台背景在两套皮肤之间闪现。
- **只在相邻时间窗之间** —— 皮肤 k 与 k+1 交叉淡化，绝不与 k+2；任何一帧都不能有三套皮肤同时部分可见。
- **镜头静止 —— 始终如此。** 在主题循环上再叠一个推近，会摧毁让锚点得以成立的那份静止。
- **硬切是更廉价的兄弟方案** —— 如果状态应该*瞬间切换*，那属于 `discrete-text-sequence` 的范畴；约 0.3s 的融合专门是为了「morph」的观感。

## 另见

`context-sensitive-cursor`（插入符颜色在每个 `T_k` 处切换）· `discrete-text-sequence`（先打出锚点文字；或者作为硬切的替代方案）· `card-morph-anchor`（单容器的兄弟规则）· `spring-pop-entrance`（在收束时与锚点会合的组合标识）· `sine-wave-loop`（循环下方漂移的背景场 —— 绝不用在锚点上）。
