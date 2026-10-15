<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/motion-principles.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 运动原则

## 目录

- 护栏
- 没人提醒时你不会做的事
- 视觉构图
- 图片的运动处理
- 承重的 GSAP 规则

## 护栏

这些规则你都知道，但你照样违反。停下来。

- **不要每个 tween 都用同一个 ease。** 你习惯对所有东西都用 `power2.out`。像变换字重那样变换 ease —— 一个场景里用同一个 ease 的独立 tween 不超过 2 个。
- **不要所有东西都用同一个速度。** 你习惯所有东西都用 0.4-0.5s。最慢的场景应该比最快的慢 3 倍。有意识地变换时长。
- **不要让所有东西都从同一个方向进场。** 你习惯给每个元素都写 `y: 30, opacity: 0`。要变化：从左边、从右边、从缩放、只变不透明度、字间距。
- **不要每个场景都用同一个 stagger。** 每个场景都需要自己的节奏。
- **不要每个场景都用氛围式缩放。** 每个场景挑一种不同的氛围运动：缓慢平移、细微旋转、缩放推进、色彩偏移，或者什么都不做。运动之后的静止很有力量。
- **不要从 t=0 开始。** 第一个动画偏移 0.1-0.3s。零延迟感觉像跳切。

## 没人提醒时你不会做的事

### easing 是情绪，不是技术

转场是动词。easing 是副词。一个用 `expo.out` 的滑入 = 自信。用 `sine.inOut` = 梦幻。用 `elastic.out` = 俏皮。同样的运动，不同的含义。有意识地选择副词。

**方向规则 —— 这些不是可选项：**

- `.out` 用于进场的元素。起步快，然后减速。感觉灵敏。这是你的默认。
- `.in` 用于离场的元素。起步慢，加速离开。把它们甩出去。
- `.inOut` 用于在两个位置之间移动的元素。

你老是把这个弄反。进场用 ease-in 显得迟钝。退场用 ease-out 显得磨磨蹭蹭。

### 速度传达分量

- 快（0.15-0.3s）—— 能量、紧迫、自信
- 中（0.3-0.5s）—— 专业，大多数内容
- 慢（0.5-0.8s）—— 庄重、奢华、沉思
- 很慢（0.8-2.0s）—— 电影感、情绪化、氛围感

### 场景结构：构建 / 呼吸 / 收束

每个场景都有三个阶段。你把所有东西都倒在构建阶段，给呼吸和收束什么都没留。

- **构建（0-30%）** —— 元素错开进场。不要一次全倒出来。
- **呼吸（30-70%）** —— 内容可见，靠**一个**（ONE）氛围运动保持鲜活。
- **收束（70-100%）** —— 退场或果断结束。退场比进场快。

### 转场就是含义

- **交叉淡化** = 「这还在继续」
- **硬切** = 「醒醒」/ 打断
- **缓慢溶解** = 「跟着我漂流」

你什么都用交叉淡化。打断和语域转换要用硬切。

### 编排就是层级

最先动的元素被认为最重要。按重要性顺序 stagger，而不是按 DOM 顺序。不要等上一个完成 —— 让进场相互重叠。无论有多少项，整个 stagger 序列控制在 500ms 以内。

### 不对称

进场需要的时间比退场长。一张卡片出现用 0.4s，消失只用 0.25s。

## 视觉构图

你是按网页来搭的。视频帧不是网页。

- **每个场景至少两个焦点。** 视线需要有地方可去。绝不要让单独一个文字块飘在空白里。
- **填满画面。** hero 文字：占宽度的 60-80%。你会试图用网页尺寸的元素。不要。
- **每个场景至少三层。** 背景处理（辉光、超大的淡化文字、色块面板）。前景内容。强调元素（分隔线、标签、数据条）。
- **背景不是空的。** 径向辉光、出血到画外的超大淡化文字、微弱的描边面板、细线。纯色 #000 读起来就是「什么都没加载出来」。
- **锚定到边缘。** 把内容钉在左 / 上或右 / 下。居中漂浮是网页图式。
- **分割画面。** 数据面板在左，内容在右。顶栏放元数据，下面通栏。基于分区的版式，而不是居中堆叠。
- **使用结构性元素。** 线条、分隔线、描边面板。它们为视线开辟路径，而且做动画效果很好（scaleX 从 0 开始）。
- **连接线要挣到自己的位置。** 任何光束、轨道、扫描线或描画出来的下划线，都必须能说出它的起点锚点、终点锚点（真实的元素，而不是空白）以及它的职责 —— 揭示、引导、验证或强调某样东西。一条从画面里去掉也不损失含义的线就是装饰：删掉它。一个边缘发光的组件（卡片顶部的高光、一个状态点）通常比一条自由漂浮的弧线显得更有设计感。

## 图片的运动处理

绝不要嵌入一张原始的平面图片。每张图片都必须有运动处理：

- **透视倾斜**：用 `gsap.set(el, { transformPerspective: 1200, rotationY: -8 })` + `box-shadow` —— 营造纵深。**不要**用 CSS `transform: perspective(...)`，因为 GSAP 会覆盖它。
- **缓慢变焦（Ken Burns）**：GSAP 在这一拍的时长内 `scale: 1` → `1.04` —— 让照片有电影感
- **设备外框**：用 CSS `border-radius` 和 `box-shadow` 包成笔记本 / 手机的形状
- **漂浮 UI**：抽出一个关键元素，放在不同的 z 深度上做动画，形成视差
- **滚动揭示**：把图片裁切进一个 viewport 窗口里，对 `y` 位置做动画

## 承重的 GSAP 规则

下面这些规则出自两次彼此独立的网站抓取构建（2026-04-20）：composition 通过了 lint，交付出去却仍然是坏的 —— 元素始终不出现，氛围运动没法随拖动更新，进场 tween 悄无声息地把它的目标弄没了。linter 抓不到这些问题；只能靠作者遵守这些规则。

- **抓取的内容不要用 iframe。** iframe 不会随 timeline 确定性地 seek —— 抓取引擎没法在里面拖动，所以它们在渲染输出里会显得冻结（或者空白）。如果你要风格化的来源是一个在线 web 应用，就把 `capture/` 里的截图作为堆叠面板或分层图片使用，而不是实时嵌入。

- **绝不要在同一个元素上叠加互相冲突的 transform tween。** 先后进行、互不重叠的 transform 阶段是可以的。危险的情况是并发的 tween，或者 `immediateRender` 状态互相覆盖的 `from()` tween：例如同一个 `<img>` 上，一个 `y` 进场同时叠一个 `scale` 的 Ken Burns tween。元素可能一直不可见或停在画外，而且没有任何 lint 警告。用以下两种方式之一修复这种重叠：

  ```html
  <!-- BAD: two transforms on one element -->
  <img class="hero" src="..." />
  <script>
    tl.from(".hero", { y: 50, opacity: 0, duration: 0.6 }, 0);
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // kills the entrance
  </script>

  <!-- GOOD option A: combine into one tween -->
  <script>
    tl.fromTo(
      ".hero",
      { y: 50, opacity: 0, scale: 1.0 },
      { y: 0, opacity: 1, scale: 1.04, duration: beat, ease: "none" },
      0,
    );
  </script>

  <!-- GOOD option B: split across parent + child -->
  <div class="hero-wrap"><img class="hero" src="..." /></div>
  <script>
    tl.fromTo(".hero-wrap", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0); // entrance on parent
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // Ken Burns on child
  </script>
  ```

- **在 `.clip` 场景里，优先用 `tl.fromTo()` 而不是 `tl.from()`。** `gsap.from()` 默认设置 `immediateRender: true`，会在构建 timeline 时就写入 "from" 状态 —— 早于 `.clip` 场景的 `data-start` 生效。当场景被非线性地 seek 时（抓取引擎就是这么做的），元素可能闪现、从错误的位置开始，或者整个跳过进场。显式的 `fromTo` 让 timeline 上每个位置的状态都是确定性的：

  ```js
  // BRITTLE: immediateRender interacts badly with scene boundaries
  tl.from(el, { opacity: 0, y: 50, duration: 0.6 }, t);

  // DETERMINISTIC: state is defined at both ends, no immediateRender surprise
  tl.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6 }, t);
  ```

- **氛围脉动必须挂到可 seek 的 `tl` 上，绝不用裸的 `gsap.to()`。** 光晕、微光、轻柔的漂浮循环、logo 呼吸 —— 这些全都必须加到场景的 timeline 里，而不是单独触发。单独的 tween 按挂钟时间运行，不会随抓取引擎拖动，所以尽管在 studio 预览里看起来没问题，效果在渲染出的视频里却不存在：

  ```js
  // BAD: lives outside the timeline, never renders in capture
  gsap.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 });

  // GOOD: seekable, deterministic, renders
  tl.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 }, 0);
  ```

- **在场景边界上硬性干掉退场的内部元素，而不是 `.clip` 本身。** 一个在拍子边界上改变可见性的非 clip 元素或包裹层，可能需要在它淡出之后用一个确定性的零时长 `tl.set()` 干掉它，因为后面的某个 tween 或兄弟元素的 `immediateRender` 可能会让它复活。这是「禁止直接对 `visibility` 做 tween」这条规则的显式边界例外。`.clip` 的生命周期只由 HyperFrames 控制；绝不要对 clip 容器使用这个图式。

  ```js
  tl.to(innerEl, { opacity: 0, duration: 0.3 }, beatEnd);
  tl.set(innerEl, { opacity: 0, visibility: "hidden" }, beatEnd + 0.3); // non-clip kill
  ```

这些就是原样的规则配原样的代码示例 —— 不要概括或缩短它们。它们之所以存在，是因为没有它们，通过 lint 的 composition 交付出去照样是坏的。
