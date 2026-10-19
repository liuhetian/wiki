<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/typewriter-reveal.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# typewriter-reveal —— 打字机揭示

**intent / 意图**：一个活的文本插入符像真人一样打出（并编辑）一行字，然后要么把它收拢成一个点并弹出品牌收尾，要么让它停在一个常驻的品牌标志下方，同时一行副句打字 / 替换成最终的 CTA —— 让「有人正在打这行字」成为这个镜头的引擎。

**roles served / 服务的角色**

- Hook（来自 hook-typed-line-to-reveal）：实时打出一个引起共鸣的问题 / 陈述，然后把它**收拢**，并弹簧弹出品牌 —— 一个 logo lockup，**或者**一个产品 UI 瞬间（「这是日常的痛点，接下来是我们」）。
- Brand_Outro（来自 brand-outro-persistent-mark-cta-rail）：在整个镜头里把 hero 标志固定在正中 / 顶部，同时它下面的一行副句通过替换或打字变成最终的 CTA —— 在 logo 已经立住之后再落下诉求。

**duration / 时长**：3.6–7 秒（Brand_Outro 3.6–6.0 秒 · Hook 5.5–7 秒）

**shot structure / 镜头结构**（一个合并后的模板；`[slots]` 与具体产品无关）

- Scene 1（0.0–约 2.0 秒）：在纯色的 `[bg color]` 底上，一个闪烁的文本输入插入符 `|` 停在行首，然后 `[primary line]` 逐字符**打出来**，插入符跟在后面。
  - _变体 —— Hook_：屏幕上没有别的东西；打出来的 `[hook line]` 独占画面。（子变体：这行字在 UI chrome 里打出来 —— 一个圆角的 `[input/pill]` —— 整个组合持续向左**平移** + 轻微缩放，让活动的插入符始终钉在画面中心附近，而前面的词滚出画面、在左边缘被裁掉 —— 一种滚动条式的推进。）
  - _变体 —— Brand_Outro_：一个 `[logo mark]`（+ 可选的 `[wordmark]`）已经位于中央 / 偏上，并在整个镜头里**保持**完全可见；标志本身播放一个入场点缀（例如 `[checkmark/icon]` 以描边方式画进标志，或者细细的同心圆环从它向外扩散），打出来的 `[tagline / product label]` 是标志下方的**副句**。

- Scene 2（约 2.0–4.5 秒）：打出来的这行字被就地**修改** —— 编辑的是活动文本，而不是重拍一次。
  - _变体 —— Hook_：最后的词被**退格**删掉，一个新词**重新打出来**（`[word A]` → `[word B]`），或者在最后一个词上填充色 / 插入符突变成 `[accent color]`。短暂停留。
  - _变体 —— Brand_Outro_：副句被就地**移除** —— 直接硬**切** / 替换（**不**退格），或者用一道移动的遮罩**擦除**把它抹掉 —— 同时标志做一个小的闲置动作（轻轻旋转 / 闪光重新定位）；标志绝不离开画面。

- Scene 3 —— 收束：
  - _变体 —— Hook（收拢，约 0.3–0.7 秒）_：插入符消失；整段文字 / 组合**收拢**到中心的一个点（水平 X 轴收拢，或缩放到 0 的拉远）并消失，留下干净的 `[bg]`。然后（剩余时间）一个居中的 `[brand element]` **弹簧弹入**：
    - _logo-lockup 子变体_：一个 `[mark/icon]` 弹出，然后滑到一边，同时一个 `[wordmark]` 从它后面**揭开遮罩** / 滑出；两者落定成一个居中的 lockup。
    - _产品 UI 子变体_：一个 `[UI control]`（例如按钮）弹出；一个 `[cursor]` 从角落扫进来并归位到它上面；接触时发生一次约 150ms 的状态**翻转** —— 底色交叉淡变成 `[accent color]`，图标反色，一圈柔和的径向**光晕**向外绽放并持续存在。
  - _变体 —— Brand_Outro（约 4.5 秒–结束）_：最终的 `[CTA]` 在副句槽位中定型 —— 带着插入符**打出来**，和 / 或在纯文本旁显示为一个 `[CTA in accent-color button]`；一个可选的 `[accent color]` **光晕**圆环 / 光环在常驻标志周围落定。停留到结束。最后一帧：`[logo mark]` +（光晕圆环）+ `[CTA]`。

**motion vocabulary / 动作词汇**：闪烁的文本插入符；逐字符打字出现；退格后重新输入，**或者**就地硬切 / 遮罩擦除的文本替换；可选的向左滚动条式推进（组合平移以保持插入符居中）；常驻居中的 hero 标志（绝不消失），带入场点缀（图标描边绘制、同心涟漪圆环）和小的闲置动作（旋转 / 闪光）；打出来那行字的 X 轴收拢 / 缩放到 0 的拉远；弹簧弹出的品牌揭示；文字标识揭开遮罩滑出成 lockup；光标扫入 + UI 状态翻转 + 径向光晕绽放；强调色光晕 / 光环落定；胶囊 / 按钮式的 CTA 揭示；停留。

**rule mapping / 规则映射**（每个运动动词 → `rules/<id>.md`）

- 闪烁的文本插入符 → `context-sensitive-cursor`（插入符变色 + 闪烁）
- 逐字符打字出现 → `discrete-text-sequence`（打字 / 打错字 / 停留 / 退格）；配方 `gsap-effects`（typewriter）
- 退格后重新输入 → `discrete-text-sequence`
- 就地硬切 / 替换式的文本替换 → `discrete-text-sequence`（整段文本的状态替换）
- 用遮罩擦除抹掉副句 → `techniques.md` 的 clip-path 揭示（反向运行）
- 向左滚动条式推进（组合平移以保持插入符居中）→ `camera-cursor-tracking`（viewport 跟随移动的插入符）
- 常驻 hero 标志的停留 → 不需要运动规则（静态锚点；有意为之 —— 它就是运动的缺席）
- 入场点缀：图标以描边绘制的方式画进标志 → `svg-path-draw`
- 入场点缀：从标志发出的同心涟漪圆环 → `cursor-click-ripple`（涟漪绽放）
- 标志的小闲置动作（旋转 / 闪光重新定位）→ `sine-wave-loop`（闲置）
- 打出来那行字的 X 轴收拢 / 缩放到 0 的拉远 → `scale-swap-transition`（最接近的匹配 —— 它在共享中心上变形 / 收拢元素；只是近似，因为没有配对的同中心品牌弹出、单独的收拢并消失并不是它的确切用例）
- 弹簧弹出的品牌揭示 → `spring-pop-entrance`（备选 `physics-press-reaction`）
- 收拢文字 → 弹出品牌，作为一对同中心变形 → `scale-swap-transition`（在同一中心变形两个元素）
- 文字标识揭开遮罩滑出成 lockup → `techniques.md` 的 clip-path 揭示（揭开遮罩）；滑动用 `spring-pop-entrance`
- 光标扫到 UI 控件上 + 按下 → `cursor-click-ripple`（光标→目标按下 + 涟漪）
- UI 状态翻转（接触时底色 / 图标反色）→ `hacker-flip-3d`
- 径向光晕绽放 / 强调色光晕光环落定 → `asr-keyword-glow`（强调色光晕）；圆环扩张用 `center-outward-expansion`
- 胶囊 / 按钮式的 CTA 揭示 → `spring-pop-entrance`（备选 `scale-swap-transition`）

**camera modifier / 镜头修饰**：不需要 —— 两种角色的镜头都是静止的。Hook 的滚动条式推进是**元素**平移（打出来的组合向左滑动以保持插入符居中），不是镜头移动 → 用 `camera-cursor-tracking` 来建模，而不是真正的镜头规则。
