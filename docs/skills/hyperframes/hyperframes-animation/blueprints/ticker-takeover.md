<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/ticker-takeover.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# ticker-takeover —— 滚字被挤开 / 接管

**intent / 意图**：一个语境短语打字出现，一个强调词像老虎机一样在几个选项间轮转，暗示「这可能是很多东西」，然后一个 hero 从画外**撞**进来，在物理上把文字推到一边 ——「其实，它是这个。」这是一次碰撞，不是一次淡变。

**roles served / 服务的角色**

- Hook（来自 `takeover-ticker-displace`）：当一个静态的引入短语 + 一个轮转的强调词需要被一个带着动量到来的 hero **在物理上替换掉**（而不是交叉溶解），并且最后一帧只剩下 hero 时使用。当这次接管应该读起来像一次撞击时选它。
- Brand_Outro：同样的碰撞用作收尾落款 —— 选项轮转，品牌标志撞进来并占据整个画面。

**duration / 时长**：5–7 秒

**shot structure / 镜头结构**（一张 `[bg]` 画布；左侧 / 中央有一组文字，会被闯入的 hero 撞出去）

- **Scene 1（0.0–约 1.4 秒）—— 建立语境。** 打字机效果逐字符写出一个 `[lead-in phrase]`（流畅，不打错字 —— 卖的是自信，不是人手忙脚乱的混乱）。镜头静止。
- **Scene 2（约 1.4–3.0 秒）—— 轮转段落节拍。** 句中的一个 `[accent word]` 槽位以垂直弹簧滚动的方式跳过 2–3 个 `[options]`（每跳一下换一个新词），暗示广度 ——「它可以是很多东西」。（超过约 3 个就显得像凑数。）
- **Scene 3（约 3.0–4.2 秒）—— 碰撞（招牌动作）。** 一个 `[hero]` 带着动量从画外撞进来，在物理上把整组文字**推开** —— 文字对撞击做出反应（被挤走），而不是淡出。hero 的落地要**沉** —— 更长的落定，而不是一闪而过 —— 这样读起来是质量感，而不是速度感。
- **Scene 4（约 4.2 秒–结束）—— 只剩 hero。** hero 落定在正中央，读起来是静止的。停留。

**motion vocabulary / 动作词汇**：流畅的逐字符打字机；垂直弹簧滚字（2–3 步）；hero 带着动量从画外撞入；被撞文字组的反应式位移；沉重的长尾落地（不弹）；静止 hero 上细微的双轴抖动。

**rule mapping / 规则映射**

- 流畅的单短语打字机引入 → `discrete-text-sequence`（平滑切片 / 连续的 `floor(progress)` 形式 —— 不用打错字那套机制）
- 强调词像老虎机一样在选项间轮转 → `vertical-spring-ticker`（`STEPS` = hero 将要替换掉的选项个数；规则里的 footer 揭示不用 —— 由 Scene 3 取代它）
- hero 在撞击时把文字组推开 → `reactive-displacement`（文字就是被挤开的质量；把 hero 的「沉重落地」表达为更长的 `power2` 落定，而不是规则默认的 `back.out`）
- hero 从画外快速撞入 → `motion-blur-streak`（方向性的速度模糊，在落地时恢复清晰）
- 静止 hero 的生气 → `sine-wave-loop`（低振幅、双频率的那一档 —— 缩放 + 旋转抖动叠加在 hero 最终落地的缩放值上；绝不围绕 1 做 yoyo）

**camera modifier / 镜头修饰**：镜头静止 —— 位移发生在元素空间里（hero 推动文字），所以没有真正的镜头移动；撞击是唯一的运动。
