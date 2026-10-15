<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/titlecard-reveal.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# titlecard-reveal —— 标题卡 / 单卡揭示

**intent / 意图**：平静的喘息 / 落地段落节拍 —— 一张干净的标题卡，或一张单独的品牌 / 证明卡，用恰好一个克制的动作揭示出来（上滑交叉淡变，或擦除式揭示），然后静止停留。低运动量本身就是要交付的内容，不是缺陷。

**roles served / 服务的角色**

- Benefits（来自 `benefits-titlecard-crossfade`，#34）：一张平静的两行价值标题卡 —— 先是标题价值句，然后一次上滑交叉淡变，换成一行限定 / 展开说明的句子，停在中央。
- Social_Proof（来自 `social-proof-reveal-card`，#35）：用一次斜向的胶囊扫过，把繁杂的应用拼贴开场擦除掉，揭示出一个干净的品牌 lockup（图标 + 文字标识），外加一行居中的「loved by [N]+ [audience] teams」社会证明句，它弹簧落定并停留。
- CTA（来自 `hard-cut-card-stack-to-logo`）：一串单色结尾卡组成的**链** —— 陈述 → CTA / 上线信息句 → 品牌文字标识 / logo —— 之间用全不透明度下的瞬间硬切隔开；每张卡都是一段被分配好的静止，整个序列结束在 logo 上，停留到最后一帧。
- Product_Intro（来自 `title-card-prelude-chain`）：在任何产品 UI 出现之前的三拍深色标题**前奏** —— `[logo]` 弹出 → `[name]`（追加一个 `[version]`，由灰变亮）→ `[tagline]` 卡 —— 之间用清屏和「模糊消失-猛然对焦」式交接串联，而不是硬切。

**duration / 时长**：3–5 秒（Benefits 3–4 秒；Social_Proof 约 5 秒 / 实测 4.7 秒）。卡片链每张卡 2–3 秒，总计约 5.5–9.5 秒。

**shot structure / 镜头结构**

```
Scene 1 (0.0–~0.4s): static camera on [neutral / dark background]. Establish the opening state.
  Variant — Benefits: empty-to-text — [benefit line 1] is about to fade in centered (no busy open).
  Variant — Social_Proof: a busy intro frame holds briefly — an [app-screenshot / use-case collage] of overlapping cards under a [setup line].

Scene 2 (~0.4–~1.5s): the ONE move executes — a single restrained reveal that brings the calm card to center.
  Variant — Benefits: [benefit line 1] fades in centered while scaling slightly (~95%→100%, smooth ease-out) and holds.
  Variant — Social_Proof: a large [accent-color] rounded pill sweeps diagonally bottom-left → top-right and exits the corner, clip-path wiping the collage away to reveal the [brand logo lockup] beneath as the [logo icon] strokes draw on.

Scene 3 (~1.5s–end): the revealed/settled card holds to the end (the allocated stillness). At most one subtle live element (a slow breathing pulse on the card, or a very slow camera drift). No second development phase.
  Variant — Benefits: [benefit line 1] translates up and fades out as [benefit line 2 — qualifier / elaboration] translates up from below center and fades in to take center; holds. (This single slide-up crossfade IS the one move — Benefits front-loads no Scene-2 wipe.)
  Variant — Social_Proof: the lockup — [logo icon] centered, [wordmark] below, centered [social-proof tagline] "Loved by [N]+ [audience] teams" (the [N]+ may count up) — spring-settles small, then holds.

Variant — card chain (CTA end-card stack / Product_Intro title prelude): the single-card contract
repeats 2–3 times in sequence. Each card is a complete Scene 1–3 in miniature — arrive (or simply
BE there), at most one restrained move, hold — and the seams between cards are INSTANT hard cuts
at full opacity (no crossfade, no fade-through-black) or, in the prelude flavor, a blur-away →
snap-into-focus handoff.
  Card moves stay on budget: a character-by-character type-on with visible partial states, a
  right-to-left backspace that resolves the [wordmark] into the small [logo icon], a grey→bright
  append ("[name]" gains "[version]"), a blur-snap into focus — or nothing beyond a
  barely-perceptible continuous slow scale-up across the hold.
  The final card is always the [brand logo / lockup], held static to the last frame.
```

**motion vocabulary / 动作词汇**：单次克制的揭示（轻柔淡入 + 细微放大落定 | 斜向 clip-path 胶囊擦除），两行居中文字之间的一次上滑交叉淡变（Benefits），图标描边绘制（Social_Proof），可选的「[N]+ teams」数字递增，logo + 标语弹簧落定并停留，停留卡片上细微的呼吸，停留到结束。平静的调性 —— 没有弹簧链，没有翻滚，没有每拍一次的翻转，没有第二阶段。镜头静止（最多只有非常缓慢的漂移）。卡片链的调性：全不透明度下的瞬间硬切是唯一的接缝，每段停留期间几乎察觉不到的连续缓慢放大，逐字符打字出现且可见中间状态，从右到左退格把文字标识收拢成 logo 图标，由灰变亮的文字追加，「模糊消失 → 猛然对焦」的卡片交接，带过冲 + 光晕的 logo 弹出（前奏开场），全程是纯色底上的单色文字。

**rule mapping / 规则映射**

- 轻柔淡入 + 细微放大落定（Benefits Scene 2）→ `rules/scale-swap-transition.md`（克制的进入 / 落定；淡入用的 ease 交叉参考 `techniques.md`）
- 两行居中文字之间的单次上滑交叉淡变（Benefits Scene 3）→ `rules/discrete-text-sequence.md`（一行交接给下一行；上移 + 交叉淡变）
- 斜向胶囊擦除揭示（Social_Proof Scene 2）→ `../techniques.md`（clip-path 揭示遮罩 —— 即这次擦除）
- 图标描边绘制（Social_Proof Scene 2）→ `rules/svg-path-draw.md`
- 「[N]+ teams」数字递增（Social_Proof Scene 3，可选）→ `rules/counting-dynamic-scale.md`
- logo + 标语弹簧落定并停留（Social_Proof Scene 3）→ `rules/spring-pop-entrance.md`（单次柔和落定；刻意只有一拍，不是一串）
- 停留卡片上细微的呼吸（停留期间唯一的活元素）→ `rules/sine-wave-loop.md`
- 打字出现 / 退格 / 由灰变亮的追加（链中的卡片）→ `rules/discrete-text-sequence.md`（非线性打字，含退格；把版本号追加当作一次整体添加来驱动）
- 文字标识的剩余部分收拢成 logo 图标 → `rules/scale-swap-transition.md`（在最后一个字符被删掉时触发的同中心替换）
- 停留期间几乎察觉不到的缓慢放大 → 镜头修饰里的漂移（`rules/multi-phase-camera.md`，微漂移档），按卡片分别应用
- 「模糊消失 → 猛然对焦」的交接（前奏风格）→ `rules/depth-of-field-blur.md`（对出场 / 入场的卡片做一次拉焦）
- 带过冲 + 光晕的 logo 弹出（前奏的第 1 张卡）→ `rules/spring-pop-entrance.md` + `rules/ambient-glow-bloom.md`
- 全不透明度下的瞬间硬切 → 不是规则：一次 timeline 的 `tl.set` 替换 —— 刻意**不**设转场条目。

**camera modifier / 镜头修饰**：可选 —— 只在停留期间加一次非常缓慢的漂移 / 推近 → `rules/multi-phase-camera.md`。默认完全静止；除非停留的这一拍不加就会读起来像定格画面，否则不要加。

**stillness note / 静止说明**：这是一个正当的、被分配好的静止段落节拍。Scene 3 中的停留就是交付物，不是没做动画的空档 —— **不要**硬造一个展开阶段、额外的替换，或强行加动画。一个克制的动作 + 一段细微的停留（可选一个呼吸元素或一次缓慢漂移）就是正确且完整的形态。卡片链变体并不违反这一点：每张卡各自遵守「一个动作 + 停留」的约定，而硬切是接缝，不是动作。边界：如果卡片以不到一秒的节奏翻动，或者每一拍都带着自己的入场 / 出场能量，你就已经离开了这个 blueprint —— 那是 `kinetic-type-beats`（它的 CTA 变体负责高节奏的价值句堆叠）。
