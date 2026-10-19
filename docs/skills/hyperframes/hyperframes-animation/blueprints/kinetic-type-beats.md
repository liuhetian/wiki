<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/kinetic-type-beats.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# kinetic-type-beats — 动态文字段落节拍

**intent**（意图）：一个扁平、居中、粗体文字的镜头，运动本身就是词 / 短语的变化 —— 这行字要么以硬切原地替换 token，要么在一个个全屏段落节拍上搭建一个陈述（每一拍有它自己的动作），最后落在一个弹簧弹出的收束上。

**roles served**（适用角色）

- Hook（来自 `hook-kinetic-type-flash`）：当一行静止不动的文字抛出一个有冲击力的反问，或者一句「你总是在做 X」式的点名，而原地的 token 替换本身就是笑点时。
- Hook（来自 `hook-kinetic-type-escalation`）：当一（ONE）个陈述应当在几个各不相同的全屏段落节拍上逐步升级（每一拍是不同的动作），并以一个弹簧弹出的收束元素作为标点时 —— 一种强度不断攀升 / 「把 X 变成 Y」式的开场。
- Hook（来自 `kinetic-type-to-logo-reveal`）：当快速的居中文字段落节拍是一段「排版到品牌」弧线的热身时 —— 替换最终收成一个 logo 揭示（整体弹入，或 3D 部件组装后压平成平面标志），再交给一张滑入的价值卡片 / 浏览器 mockup。
- Hook（来自 `centered-beat-triptych`）：当开场是在恒定底色上的三个舞台中央段落节拍，每个元素都独自占据屏幕时 —— 某一拍的内容可以不是文字（一个 logo lockup 的旋转瞬切、一个带一次性辉光环脉冲的 CTA 按钮弹簧弹出、一张搭建起来并保持的基准测试图表）；最后一拍保持到结尾。
- Problem（来自 `problem-kinetic-type-beats`）：当脚本是 3–5 句简短的痛点陈述（或一个「如果……会怎样？」的设问框架），每一句都应该在一张空白画布上独自落下，然后才被下一句替换时 —— 此时还看不到产品。
- Problem（来自 `centered-phrase-relay-question-hook`）：当痛点是一串有序的问题 / 钩子短语，以接力的方式缩放弹出穿过中心（每一句在下一句到来时退出），并落在一个特殊样式的高潮词上时 —— 或者在一个以元素运动进入的 `[product surface]` 上解答这个问题，绝不用镜头缩放。
- Product_Intro（来自 `product-intro-kinetic-type-namedrop`）：当钩子就是这些文字时 —— 硬切过「Introducing……」/ 标语 / 价值段落节拍，最后收在品牌名或 logo 上。
- Product_Intro（来自 `fixed-line-word-swap`）：当一句固定标题保持不动、只有（ONLY）一个词位变化时 —— 被光标删掉再重打一次（可选由一个带标签的协作光标执行），或者快速轮换过一个 `[role]` 列表 —— 然后交给产品 / 品牌收束；最纯粹的子形态 A。
- Product_Intro（来自 `flat-field-kinetic-word-run`）：当一句话在扁平的品牌色场上逐词搭建，每个 `[hero word]` 在重拳收尾词的终章之前，各自赢得一个定制的一次性特效收束（字母乱码、色差故障、彩纸爆发、emoji 变形）时。
- Product_Intro（来自 `anchored-wordmark-transform`）：当锚定的文字本身发生变异时 —— 一个「Introducing」/ 前代产品段落节拍原地搭建或替换成 `[wordmark]`，随后它发生变形（一片 UI 拼贴从它背后向外涌出、一个词变形成一个脉动的图标、标题缩放模糊消失），进入一个简短的收束段落节拍。
- Benefits（来自 `benefits-kinetic-type`）：当「你能得到什么」是一段快节奏的断奏蒙太奇时 —— 8–12 个简短的价值短语，每一个以高节奏闪现并清空，然后下一个出现。
- Benefits（来自 `flat-void-statement-relay`）：当价值读起来是一段缓慢的（SLOW）陈述接力时 —— 扁平空场上的 2–4 句完整陈述，每一句由它自己的引擎搭建（打字机、超大元素滚动、轮廓回声堆叠、波形映射图案），在硬切之前保持约 1.5s 以上；是断奏蒙太奇的慢节奏兄弟。
- CTA（来自 `cta-kinetic-type`）：当收尾是一句有力的结束语（或一小摞价值句），逐拍瞬切 / 淡入，最后落在品牌 lockup 或 URL 上时 —— 没有空间场景，没有被点击的按钮。
- CTA（来自 `kinetic-beat-chain-to-logo`）：当收尾串起 3–5 个信息段落节拍，每一拍带一个不同的（DIFFERENT）动态小噱头（marquee 滚动穿过、闪切词列表、短暂的 3D 字母挤出、弹簧弹跳道具、穿插一个模拟 UI 段落节拍），然后 logo / URL 成形 —— 可选从前面的一次辉光脉冲中成形 —— 并保持时。
- Brand_Outro（来自 `brand-outro-kinetic-type-resolve`）：当收尾是中央通道里一阵快速的单词动词连击，宣示广度，最后收在品牌那个定义性的词上时（运动即信息，没有 logo lockup）。
- Brand_Outro（来自 `centered-beat-relay-to-url`）：当收尾是一小段全画幅段落节拍的接力时 —— 淡入淡出 / 缩放替换、弹簧缩小到 0、一个 `[icon]` 弹跳、一张渐变扫过的标题卡 —— 终止于一张居中的 `[URL / domain]` 结尾卡，它保持的时间是整个镜头中最长的一段（约占时长的 40–75%）；可选先有一段 `[product UI]` 序幕缩小并淡出到画布。

**duration**（时长）：3.0–12.9s（Benefits 断奏最快，8–12 个不到 0.5s 的段落节拍时约 3.5–4s，陈述接力式的 Benefits 最长约 8.3s；Product_Intro 固定句式最短约 3.0s；Problem 4.1–12s；CTA 随段落节拍数跨越 3.6–12.9s；Brand_Outro 作为动词连击约 3.6s，当结尾 URL 保持占时长的 40–75% 时最长约 12.6s）

**shot structure**（镜头结构）（扁平、固定的中心锚点；纯色 `[bg color]` 上的粗体无衬线文字；文字 / token 是默认的主体，不过某一拍的内容也可以是一（ONE）个非文字的舞台中央元素 —— 一个 logo lockup、一个 CTA 按钮、一张图表 —— 同样遵守「到场-保持-清空」法则；除非注明了修饰，否则镜头锁定；并入了两个子形态 —— **(A) 固定句式 token 替换** 和 **(B) 多拍陈述搭建**）

- **Scene 1 (0.0–~1.0s) —— 第一拍落下。** 纯色 `[bg color]` 场。粗体 `[type color]` 文字以一（ONE）种入场方式到达正中央：逐字符打出，末尾带闪烁插入符；或者硬切闪现（无淡入 / 滑动）；或者逐词错落淡入 / 去模糊；或者一个超大的词平滑缩小成一个居中的小词。关键词上可以有一个可选的 `[accent color]` 动作：一条从左到右描画的下划线 / 删除线，从文字背后迸发的一小簇粒子 / 圆点，或者一个框住这个词的 `[accent color]` 选区框。
  - _变体 — Hook（闪切）_：只有固定的 `[hook line]`（或它的第一个词）停在中央；没有升级动作。
  - _变体 — Hook（升级）_：`[beat 1 text]` 以大尺寸到场并缩小到居中，或者坐在一个发光的 `[motif]` 之上，伴随缓慢的镜头推进（见镜头修饰）；以一次硬切结束。
  - _变体 — Hook（logo 揭示）_：在扁平 / 渐变场上，居中的粗体词以快速的弹簧缩放弹出替换进来，同时扁平的 `[accent]` 圆 / 圆点闲散漂移；某一拍可以硬切到一个对比色背景，并以一次 RGB 分离故障拉伸进入，然后瞬间变清晰。
  - _变体 — Hook（三联）_：第 1 拍可以不是文字 —— 一个 `[logo mark]` 在 3D 中旋转进入，瞬间压平并停在一个 `[version tag]` 旁边；或者一句陈述在一张不显眼的 `[grid card]` 上通过一次水平拉伸 / 切片故障显形 —— 保持，然后清空（缩小 + 淡出，或硬切）。
  - _变体 — Problem_：居中的 `[pain line 1]` 在一到两行里分块揭示，带着它的 `[accent]` 下划线 / 粒子迸发。
  - _变体 — Problem（接力）_：`[hook phrase 1]` 在扁平纯色或漂移渐变场上以快速弹簧缩放弹入中央 —— 可选先让背景本身变形展开（一个圆角 `[accent shape]` 扩展成满版渐变）；短语保持期间，它的词间距略微张开。
  - _变体 — Product_Intro_：醒目的 `[hook word, e.g. "Introducing"]` 带着一个排版强调进场（拆开并向两边滑开、描画的下划线，或 `[accent]` 选区框）。
  - _变体 — Product_Intro（固定句式）_：完整的固定标题 `[fixed phrase] [swap-slot]` 居中停住（背后可以漂移着一层淡淡的 `[plexus / ambient pattern]`）；没有升级动作 —— 那个槽位就是看点。
  - _变体 — Product_Intro（词串）_：一个占领画面的开场 —— 水平的 `[brand color]` 色条擦除揭示出 `[logo lockup]` 然后清空，或者一个巨大的色块从中心扩展、把画面重新刷成品牌色 —— 然后句子才开始搭建。
  - _变体 — Product_Intro（wordmark 变形）_：「Introducing」在先起伏、后猛然绷直的氛围正弦波线上淡入；或者 `[old version wordmark]` 保持然后被替换掉；或者分散的超大 `[gradient]` 字母弹跳着组装成 `[name]`，同时整个词缩小到中央。
  - _变体 — Brand_Outro_：在动词通道之前，可选单帧闪现一下 `[product UI / hero asset]`，然后 `[verb 1]` 居中硬切进来。
  - _变体 — Brand_Outro（接力到 URL）_：可选的序幕 —— `[product UI window]` 滚动它的内容，然后缩小并淡出到扁平画布；第一个文字段落节拍在中央淡入 / 缩放进入。

- **Scene 2..N —— 各拍原地相互替换（引擎）。** 中心锚点一次推进一拍；上一拍的东西一点也不留下。按子形态选择替换机制：
  - **子形态 A（固定句式 token 替换）**：这一行保持固定，只有可变槽位通过瞬间硬切变化（不滚动 / 不卷动 / 不模糊）—— `[token A]` → `[token B]` → `[token C]` —— 或者最后的词被退格删掉，再重新打一个新词（`[word A]` → `[word B]`）。这一行的其余部分保持不动。轮换可以在固定槽位上快速过一个 `[role word]` 列表，删除-重打可以由一个带标签的协作光标执行；固定句子后面可以一直漂移着一层淡淡的 `[plexus / ambient pattern]`。
  - **子形态 B（多拍陈述搭建）**：每个全屏段落节拍硬切到一个新的背景 / 句子，每一拍都有它自己独特的入场 / 退场动作 —— 弹性的放大进入 / 缩小退出过冲、3D 字母翻滚（字形散入一个旋转的纵深云团，再重组成下一个短语）、在中央变清晰的运动模糊飞入、前一段文字一边淡出一边加速 / 缩放冲过镜头、字间距收拢，或者自下而上的遮罩滑入。背景可以在选定的段落节拍上硬翻 `[bg A]`↔`[bg B]`，`[type color]` 随之反色以保持可读。
  - _变体 — Hook（升级）_：第 2 拍 `[beat 2 text]`（更强调）瞬间切入；第 3 拍 `[beat 3 text]`（高潮）保持，然后在文字本身上做一个转场退出动作 —— 沿 Z 轴向前穿过一个超大字形的推轨，或者逐词的卡拉 OK 高亮扫动，从左到右依次点亮各个词。
  - _变体 — Hook（三联）_：中间某一拍可以不是文字 —— 一个 `[CTA button]` 带过冲弹簧弹出，向外发出一次性的模糊辉光环脉冲，然后缩小落定 —— 这个元素独自占据屏幕，然后像其他段落节拍一样被清空。
  - _变体 — Problem_：每个 `[pain line k]` 以分块揭示或运动模糊飞入进场，同时前一句模糊 / 缩放离场；一个可选的 `[accent color]` 插段词（「[what-if hook]」）从中心放大，保持，然后缩放冲过镜头并淡出。
  - _变体 — Problem（接力）_：每个 `[phrase]` 缩放弹入中央，同时前一句缩小，并分裂成两半向左右两边滑开（滑出屏幕被裁掉），伴随淡出；一个可选的强调段落节拍落在一个硬切的对比色背景上 —— 一个单独的 `[word]` 从宽字距逐渐收紧字距，同时放大，四根细的 `[accent]` 箭头从四角沿对角线射入，汇聚到它身上；中间可以穿插一段左对齐、逐行搭建的价值文字。
  - _变体 — Product_Intro_：每个 `[tagline phrase]` 是一个硬切 / 穿透式的反色文字段落节拍，带着它自己的一次性强调（删除线、滑入的滑块 / 开关形状，或者一个白→`[accent]`→黑的背景反色循环，前景 / 背景互换）。
  - _变体 — Product_Intro（词串）_：`[sentence]` 以利落的弹出逐词搭建（每加一个词各行重新居中；关键词下方可以描出一条下划线），然后每个 `[hero word]` 占一拍 —— 每一个都以大尺寸落下，并执行它自己的一次性特效：带细分隔刻度的字母乱码还原、色差故障抖动（错位的彩色副本瞬间归位、恢复干净）、弹簧弹跳 + 向上喷发再飘落的彩纸爆发，或者某个字母槽位被替换成一个弹簧弹出并变形的 `[emoji / mark]`；终章可以运行一串大小交替的词缩放链。
  - _变体 — Product_Intro（wordmark 变形）_：`[wordmark]` 原地补全 —— 逐部件错落弹出（先 `[part 1]` 后 `[part 2]`）、原地替换掉「Introducing」，或者追加一个 `[second phrase]` —— 同时文字上扫过一道渐变色相，最后瞬间落定成纯色。
  - _变体 — Benefits_：高节奏（约 0.4s/拍）—— 每个 `[benefit phrase]` 通过弹性放大进入 / 缩小退出或 3D 字母翻滚弹出；整段里背景多次亮↔暗翻转，文字颜色随之反色。
  - _变体 — Benefits（陈述接力）_：低节奏 —— 每个 `[statement]` 由它自己的引擎搭建，在硬切之前保持约 1.5s 以上：第 2 行在静止的第 1 行下方逐字符打出；一个超大的 `[phrase]` 元素从右到左滚动穿过画面（一扇移动的窗口，透过它看一行更宽的文字，一道渐变扫过字母）；一个实心的 `[word]` 保持不动，它背后堆叠的纯轮廓回声副本纵向轮换；一个多行文字块快速搭建，同时小的 `[accent shapes]` 从边缘飞入，再向外漂移并变细（文字可以先以遮罩下的灰色填充成形，然后瞬间变实）。
  - _变体 — CTA_：每个 `[value line]` → `[value line]` → `[CTA verb line]` 通过硬切 / 经过近黑的缩放模糊切 / 淡出来清空，然后下一个弹出 / 淡入 / 滑入。可选在背后描画一个 `[accent motif]`（上升折线图的 trim-path、细线框参考线、边栏几何方块）。
  - _变体 — CTA（段落节拍链）_：各个段落节拍带着各自的噱头 —— 一行字从右边进入，以 marquee 方式持续向左滚动穿过画面（直到退出）；一个 `[use-case word]` 列表原地闪切替换；某一拍的字母短暂地挤出成简单的 3D 再压平回去；一组 `[glyph + prop]` 弹簧弹跳进入然后滑走；可以穿插一（ONE）个模拟的 `[compose-window / product UI]` 段落节拍而不打断这条链。
  - _变体 — Brand_Outro_：一个居中的单独 `[verb / keyword]` 以稳定的约 0.2s 节奏硬切到下一个（无淡入淡出 / 缩放），底下是一个持续运动的场（见镜头修饰）。
  - _变体 — Brand_Outro（接力到 URL）_：2–3 个全画幅段落节拍以从容的节奏整体替换 —— 每一个淡入 / 缩放进入再退出，或者先略微放大然后弹簧缩小到 0%，或者一个 `[icon]` 从 0% 弹跳弹入再缩小退出，或者一张 `[title card]` 保持，文字内部有持续的水平渐变扫动，然后硬切到空白画布。

- **Scene N（最后一拍 → 结尾）—— 收住并定住。** 最后一拍落下并保持到结尾（只做落定，不再缩小退出）。收尾方式按角色分化：
  - _变体 — Hook（闪切）_：最后一次 token 替换落下并保持；可选一个很小的标点 / 强调瞬变（`?` → `?!`，或者填充色瞬间变成 `[accent color]`）。
  - _变体 — Hook（升级）_：收在 `[payoff bg]` 上 —— 一个 `[payoff element]`（彩色方块 / 心形眼反应 emoji）在中央弹簧弹出；小的 `[accent motes]` 向外漂散；轻微落定。
  - _变体 — Hook（logo 揭示）_：文字段落节拍收在品牌上 —— `[logo]` 整体弹入，或者漂浮的 3D `[shapes]` 组装后压平成平面 2D 标志，同时 `[wordmark]` 滑入到它旁边；然后一个 `[browser mockup / value card]` 在一个新背景上滑入 / 缩放进入并保持（底部可以搭建一行说明文字）。
  - _变体 — Hook（三联）_：最后一拍可以不是文字 —— 一张 `[benchmark chart]` 淡入它的框架，各根条从零宽度开始自上而下错落增长（`[hero row]` 加粗 / 高亮），然后在镜头的后半段静止保持；或者一句收尾陈述以故障效果显形并保持。
  - _变体 — Problem_：最后的 `[pain line]` 揭示出来（从左到右擦入，前沿带模糊；或者字母径向炸开，然后收尾的句子淡入上升）；把痛点留在屏幕上。
  - _变体 — Problem（接力）_：高潮 `[word]` 带特殊处理缩放进入（渐变填充、略微旋转约 -8°）并保持 —— 或者问题在一个 `[product surface]` 上以元素运动得到解答：一个 `[pill / search bar]` 从右边滑入，并一直向左移动，同时它的文字逐步揭示（可以在滑动途中结束，短语在画面边缘被裁掉），或者 `[page canvas]` 缩小，同时 `[app chrome + side panels]` 滑入、把它框起来。
  - _变体 — Product_Intro_：收在品牌上 —— `[logo mark]` / `[wordmark]` 居中弹入（可选的 sting：液体 / 墨水飞溅、色块衬底），或者最后的价值词保持在一个不断扩张的光圈式 `[accent]` 圆形里，这个圆放大填满画面，并透过它硬切出收尾词。
  - _变体 — Product_Intro（wordmark 变形）_：完成的 `[wordmark]` 锚定在正中央，一片密集的 `[UI-screenshot collage]` 从文字背后涌入并向画面边缘扩散，带视差（快速后拉的感觉），然后迅速清空，换成一张干净的 `[wordmark]` 结尾卡；或者一个 `[word]` 变形成一个脉动的 `[icon]`，补全一个图标 + 文字的 lockup，然后场溶解成它的反色；或者标题快速放大并缩放模糊消失，同时下一个语境淡入。
  - _变体 — Benefits_：最后一个 `[benefit phrase]` 到场（可选落在反色背景上）并落定 —— 不再缩放 / 翻滚退出。
  - _变体 — CTA_：落在 lockup 上 —— `[logo mark]` 从小放大到完整尺寸并保持，或者一个 `[logo]`/`[url]` 在它的图标旁边逐段搭建。结尾卡完全静止地保持。
  - _变体 — CTA（辉光引出的成形）_：前面的字母散开 / 清空，一团柔和的 `[accent]` 辉光在空场上脉动，`[logo mark]` 从辉光中成形，下方是 `[url]` wordmark；保持到最后一帧。
  - _变体 — Brand_Outro_：硬切到 `[resolve word / brand keyword]`（最长的一个，仍然居中）；保持约 0.5s，背景场继续运动。
  - _变体 — Brand_Outro（接力到 URL）_：居中的 `[URL / domain]`（+ 上方可选的一行 CTA）淡入 / 缩放进入并保持 —— 这是整个镜头中最长的（LONGEST）一拍，约占时长的 40–75% —— 可选在最末尾淡出。

**motion vocabulary**（运动词汇）：硬切 / 闪切的词替换；原地 token 轮换（瞬间切换，不滚动 / 不卷动 / 不模糊）；逐字打出，末尾带闪烁插入符；退格并重打；逐词错落淡入 / 去模糊揭示；由大到小的缩小；弹性的放大进入 / 缩小退出过冲；3D 字母翻滚，散开再重组；运动模糊飞入 / 模糊离场；前一段文字缩放冲过镜头；字间距收拢；自下而上的遮罩滑入；描画出的 `[accent]` 下划线 / 删除线；从文字迸发的粒子 / 圆点；`[accent]` 选区框；背景反色硬翻，文字颜色随之反色；逐词卡拉 OK 高亮扫动；字母径向炸开；扩张的光圈式圆形擦除到下一个；最后弹簧弹出的收束元素（方块 / emoji / logo 标志）；漂移的 `[accent]` 微粒 / 氛围形状；URL / wordmark 逐段搭建；最后一个 token 的标点瞬变；落定并保持；缩放弹出的短语接力（前一句缩小 + 分裂向两边滑开，伴随裁切淡出）；放大的同时字距从宽收紧；四角箭头汇聚到一个词上；文字上的渐变填充 / 色相扫动，最后瞬间落定为纯色；文字内部游走的渐变扫动；背景形状变形展开成满版场；RGB 分离 / 色差故障抖动；水平拉伸 / 切片故障显形；带分隔刻度的字母乱码还原；向上喷发再飘落的彩纸爆发；字母槽位替换成 emoji / 标志并变形；大小交替的词缩放链；色条擦除 / 色块扩展重刷画面；超大短语的元素滚动（移动窗口）；从右到左的 marquee 滚动穿过；实心词背后轮换的轮廓回声副本堆叠；滚动的 3D 波面上的全画幅重复文字图案；强调形状飞入后向外漂移并变细；遮罩下的灰色填充瞬间变实；短暂的 3D 字母挤出再压平；字形 + 道具的弹簧弹跳落入；辉光脉冲引出的 logo 成形；3D 形状组装后压平成标志；logo lockup 的 3D 旋转瞬切；一次性辉光环脉冲；图表条自上而下错落增长；带标签的协作光标删除并重打；原地的角色词轮换；氛围 plexus / 图案漂移；弹簧缩小到 0 的退场 / 从 0% 弹跳进入；分散字母弹跳组装并落定到基线；wordmark 部件错落弹出；短语追加；词→图标变形并持续脉动；UI 拼贴从锚定文字背后带视差涌出；标题缩放模糊退场；长时间保持的 URL 结尾卡。

**rule mapping**（规则映射）

- 硬切 / 闪切的词替换、原地 token 轮换、在时间阈值处的整行状态替换 → `discrete-text-sequence`
- 逐字符打出 + 末尾闪烁插入符 → `discrete-text-sequence`（文字 / 打字状态推进）+ `context-sensitive-cursor`（插入符闪烁 / 换色）
- 退格删掉最后的词并重打 → `discrete-text-sequence`（打错字 / 停顿 / 退格明确在其范围内）
- 每拍一个简短而不同的短语 / 由脚本驱动的短语时间窗口 / 逐词组装标语 → `dynamic-content-sequencing`
- 在共享的段落节拍数组上，每拍打击式的短语入场（每个短语入场方式不同，节奏稳定）→ `kinetic-beat-slam`（最适合多拍陈述搭建引擎和约 0.2s 的 Brand_Outro 动词行进）
- 逐词错落淡入 / 去模糊揭示 → `kinetic-beat-slam`（每个短语 / 每个词不同的入场）；柔焦模糊的部分 → `depth-of-field-blur`（对焦外词语的选择性对焦模糊）
- 一个词由大到小的缩小；弹性的放大进入 / 缩小退出过冲 → `spring-pop-entrance`（弹簧弹出 / 落定），单纯的缩放 tween 由 `gsap-effects` 支撑
- 3D 字母翻滚，散入纵深云团再重组 → `depth-scatter-assemble`（字形散入一个 3D 纵深云团，再重组成下一个短语；要挤出的立体观感时配合 `3d-text-depth-layers`，要原地逐字符翻转的风格时用 `hacker-flip-3d`）
- 跨词同步的逐词卡拉 OK 高亮扫动 → `asr-keyword-glow`（同步轨上的关键词辉光 + 缩放）或者 `css-marker-patterns`（高亮扫动）—— 在 ASR 驱动和静态时间线扫动之间二选一
- 关键词下描画出的 `[accent]` 下划线 / 删除线 / 圈 / 涂鸦 → `css-marker-patterns`（高亮扫动 / 圈 / 迸发 / 涂鸦 / 划掉）
- 从文字背后迸发的粒子 / 圆点 → `css-marker-patterns`（迸发），由 `gsap-effects` 支撑
- 框住一个词的 `[accent]` 选区框 → `css-marker-patterns`（圈 / 框标记）+ `gsap-effects`
- 背景反色硬翻（亮↔暗 / 白→强调色→黑），文字颜色随之反色 → `discrete-text-sequence`（整段文字 / 状态替换涵盖了前景 / 背景同步的状态变化）
- 字间距收拢；自下而上的遮罩滑入 → `gsap-effects`（tween letter-spacing / 遮罩平移）+ 技法：逐词动态排版 / clip-path 揭示
- 扩张的光圈式圆形擦除，在同一中心把当前词变形成下一个 → `scale-swap-transition`（在同一中心变形两个元素）
- 最后弹簧弹出的收束元素（彩色方块 / 反应 emoji / logo 标志）→ `spring-pop-entrance`（更有分量的弹出用 `physics-press-reaction`）
- 漂移的 `[accent]` 微粒 / 氛围形状 / 文字下方柔和漂移的渐变场 → `sine-wave-loop`（闲置漂移循环）
- URL / wordmark 在图标旁逐段搭建 → `discrete-text-sequence`（逐段的状态揭示）或 `dynamic-content-sequencing`
- 最后一个 token 的标点 / 强调瞬变（`?`→`?!`，填充→强调色）→ `discrete-text-sequence`
- 落定并保持最后一帧 → `spring-pop-entrance`（落定阶段）/ 静止保持（不需要规则）
- 文字上的运动模糊飞入 / 模糊离场 / 缩放冲过镜头的拖影 → `motion-blur-streak`（作用在快速飞入 / 缩放穿越上的定向速度模糊；浓重的运动模糊拖影在中央变清晰）
- 字母径向炸开（字形向外径向炸开，然后还原）→ `depth-scatter-assemble`（逐字母径向炸开再还原，与纵深云团散开一样在其范围内）
- 3D 字母翻滚的纵深云团散开再重组 → `depth-scatter-assemble`（自由翻滚的纵深云团，飞出后瞬间收回成下一个短语）
- 缩放弹出的短语接力 → `spring-pop-entrance`（到来的短语）+ `gsap-effects`（前一句缩小 + 分裂向两边滑开清空）
- 放大的同时字距从宽收紧 → `gsap-effects`（letter-spacing tween —— 与上面映射的字间距收拢正好相反）
- 四角箭头汇聚到一个词上 → `css-marker-patterns`（运动方向反转的迸发几何 —— 线条汇聚而不是辐射）+ `gsap-effects`
- 渐变填充的高潮词 / 文字上的色相扫动 / 文字内部游走的渐变扫动 → `gradient-text-sweep`（渐变穿过字形做 tween —— 位置 / 色相扫动，最后瞬间落定为纯色，seek 安全）
- 背景形状变形展开成满版场 → `card-morph-anchor`（等比缩放 + borderRadius 绘制 tween，然后由场接管）
- RGB 分离 / 色差故障抖动；水平拉伸 / 切片故障显形 → `chromatic-glitch`（确定性的错位彩色副本图层，抖动 + 瞬间恢复干净；涵盖拉伸 / 切片故障显形）
- 带分隔刻度的字母乱码还原 → `hacker-flip-3d`（确定性的字形替换解码，去掉 3D 旋转）
- 3D 形状组装后压平成标志；分散字母弹跳组装 → `depth-scatter-assemble`（从散开到整洁布局的落定）+ `spring-pop-entrance`（弹跳落定）
- logo lockup 的 3D 旋转瞬切 → `orbit-3d-entry`（3D 翻转入场，跳过环绕阶段）
- 一次性辉光环脉冲；辉光脉冲引出的 logo 成形 → `ambient-glow-bloom`（单次绽光后淡出）+ `spring-pop-entrance`（从中成形的标志）
- 图表框架淡入 + 条从零宽度自上而下增长；径向仪表弧线描画 + 向上计数 → `stat-bars-and-fills`（跳动的数值加 `counting-dynamic-scale`）
- 带标签的协作光标删除并重打；原地的角色词轮换 → `discrete-text-sequence` + `context-sensitive-cursor`（带标签指针的外观本身属于 oversized-cursor 的准则，不是一条规则）
- 氛围 plexus / 图案漂移；强调形状向外漂移并变细 → 先以 `spring-pop-entrance` 到场，再用 `sine-wave-loop`（有限次漂移）
- 字母槽位替换成 emoji / 标志并变形；词→图标变形并持续脉动 → `scale-swap-transition`（同中心变形）+ `svg-icon-enrichment`（图标的内部脉动）
- 超大短语的元素滚动；从右到左的 marquee 滚动穿过 → `gsap-effects`（让一个超大元素线性平移穿过静止画面）
- 实心词背后轮换的轮廓回声副本堆叠 → `3d-text-depth-layers`（错位的回声堆叠）+ `vertical-spring-ticker`（纵向轮换）
- 短暂的 3D 字母挤出再压平 → `3d-text-depth-layers`（建立挤出的错位层，然后把它们收拢）
- 滚动的 3D 波面上的全画幅重复文字图案 → 标记为特例 —— 3D 波面映射的文字场超出规则范围；`sine-wave-loop` 只负责驱动起伏振荡器
- 大小交替的词缩放链 → `kinetic-beat-slam`（在共享的段落节拍数组上，每拍不同的入场）
- 色条擦除 → `gsap-effects`（遮罩平移 tween）；色块扩展重刷画面 → `card-morph-anchor`
- UI 拼贴从锚定文字背后带视差涌出 → `center-outward-expansion`（聚在中心 → 向外到最终位置；给每个方块设置不同的速率 / 缩放来营造视差）
- 弹簧缩小到 0 的退场 / 从 0% 弹跳进入 → `spring-pop-entrance`（入）/ `gsap-effects` 的 `back.in` 缩小（出）
- 在产品界面上收住（胶囊滑动，文字逐步揭示；画布缩小，外框随之框入）→ `nudge-curve`（在移动过程中完成揭示的滑动）+ `gsap-effects`（协调的缩放 + 面板滑动）
- 作为镜头内段落节拍交接的标题缩放模糊退场 → `motion-blur-streak`；如果是退出到下一个场景，则属于转场层
- wordmark 部件错落弹出 / 短语追加 → `spring-pop-entrance` + `dynamic-content-sequencing`

**camera modifier**（镜头修饰）（可选，叠加在扁平镜头之上；大多数变体镜头锁定）

- 在整个序列底下运行的缓慢连续全局推近 / 均匀推进（Problem、Brand_Outro）→ `multi-phase-camera`（推进阶段）—— 让固定的文字与运动的背景场之间产生视差。
- 作为段落节拍的转场退出，镜头沿 Z 轴向前推轨 / 缩放穿过一个超大字形（Hook 升级、Product_Intro 穿透）→ `coordinate-target-zoom`（瞄准字形中心）或 `multi-phase-camera`（推进）。
- Scene 1 在发光 `[motif]` 上的缓慢推进（Hook 升级）→ `multi-phase-camera`（推进）或 `coordinate-target-zoom`。
- 在硬切段落节拍底下运行的缓慢连续卡片 / 场景放大（Hook 三联）—— 一种推进的感觉，用场景组上的元素缩放来呈现，绝不是真的推轨 → `multi-phase-camera`（推进阶段）或单纯的 `gsap-effects` 缩放 tween。
- 注：原地 token 替换（子形态 A）以及大多数 Benefits / Hook 闪切 / CTA 变体都完全镜头静止 —— 替换是唯一的运动。
