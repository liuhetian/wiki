<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/references/motion-vocabulary.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 文字模块 · 运动词汇（基本元素 → GSAP）

<!-- registry-items: allow= -->

**registry 里有什么，以在线搜索为准。** 下面的表是手工维护的样本，按设计就覆盖不全：在断定 registry 缺少某样东西之前，先运行 `npx hyperframes catalog --query "<what you want>" --json` —— 它不需要安装任何东西。这里的条目名由 `bun run lint:skills` 对照 `registry/registry.json` 检查。

Director 在 `motion` 字符串里引用、Builder 负责实现的具名基本元素。`code_hint` 是与框架无关的物理描述；GSAP 配方是 HF 的实现方式。有合适的 HF **registry component**（见文末）时优先用它 —— 不要重新发明。

## 入场

| 基本元素                      | GSAP 配方（进入 CSS 最终状态）                                 | 适用                      |
| ----------------------------- | -------------------------------------------------------------- | ------------------------- |
| `slide_bottom/top/left/right` | `from({ y:±150 / x:±200, opacity:0, ease:"power4.out" })`      | 平静、Build、专业         |
| `scale_grow`                  | `from({ scale:0, opacity:0, duration:.6, ease:"power2.out" })` | 平静、温和                |
| `scale_punch`                 | `from({ scale:.6, opacity:0, ease:"back.out(2.2)" })`          | 冲击、有活力              |
| `fade_in`                     | `from({ opacity:0, duration:.4 })`                             | 含蓄                      |
| `fade_blur`                   | `from({ opacity:0, filter:"blur(14px)" })`                     | 电影感、梦幻              |
| `typewriter`                  | 通过 clip/`SplitText` 的宽度步进来显现                         | 技术感、叙事              |
| `word_reveal`                 | 逐词 `from({opacity:0,y:..}, stagger:.1)`                      | 讲故事                    |
| `wave`                        | 逐字母 `from({y:..}, stagger:{each:.04})`                      | 流动、音乐感              |
| `bounce_in`                   | `from({y:-120}, ease:"bounce.out")`                            | 俏皮                      |
| `slam`                        | `from({ y:-300, ease:"power4.out" })` + 落地时抖动             | 冲击、厚重                |

## 强调（原地进行，常卡在节拍点上）

| 基本元素      | GSAP 配方                                                            | 适用               |
| ------------- | -------------------------------------------------------------------- | ------------------ |
| `scale_pulse` | 在节拍点上 `to({ scale:1.12, yoyo:true, repeat:1, ease:"sine.inOut" })` | 节奏感、高潮点     |
| `shake`       | `to({ keyframes:[{x:-9},{x:9},{x:0}], ease:"none" })`                | 紧迫、强烈         |
| `glow`        | `to({ textShadow:"0 0 46px <ink/accent>", yoyo:true, repeat:1 })`    | 重要、魔幻         |
| `color_shift` | `to({ color:"<accent>" })`（或者在 CSS 里给这个词上强调色）          | 动感               |

## 退场

| 基本元素    | GSAP 配方                                          | 适用       |
| ----------- | -------------------------------------------------- | ---------- |
| `fade_out`  | `to({ opacity:0, duration:.4, ease:"power2.in" })` | 结尾       |
| `slide_out` | `to({ y/x: off, opacity:0, ease:"power2.in" })`    | 转场       |
| `scale_out` | `to({ scale:1.06, opacity:0, ease:"power2.in" })`  | 转场       |

## 强调图形（非文字）

`underline_sweep` `fromTo({scaleX:0},{scaleX:1}, transformOrigin:"left center")` · `bar_wipe` · `hold_breath` `to({scale:1.015, ease:"sine.inOut"})`。

## 合适时优先使用 HF registry component

`caption-kinetic-slam` · `caption-editorial-emphasis` · `caption-neon-glow` · `caption-glitch-rgb` · `caption-particle-burst` · `caption-weight-shift` · `caption-matrix-decode` · `caption-pill-karaoke` · `shimmer-sweep`。这些都是预先做好的、生态内的，并且已经过渲染测试 —— Builder 应该先用它们，而不是自己手搓一个等价物。
