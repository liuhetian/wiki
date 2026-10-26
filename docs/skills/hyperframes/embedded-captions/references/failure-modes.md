# 失败模式 —— 吃过苦头才学到的

skill 开发过程中出过问题的地方。交付之前对照这份清单检查。

## 抠像

### CoreML 执行提供者会破坏脸部 alpha

让抠像 ONNX 走 CoreML EP 时，计算图会被拆分到多个执行提供者上；由此产生的混合精度边界让主体脸部内部的 alpha ≈ 30（满值 255），而背景正确地读为 0（在之前的 RVM 引擎上观察到 —— 不要再试）。结果：字幕文字明显地**透过**脸显示出来。

**修正**：抠像 ONNX 永远只用 `providers=["CPUExecutionProvider"]`。我们的脚本就是这么做的；不要通过加上 CoreML 来"优化"它。

### 宽高比畸变 / sharp 的通道步长让 alpha 变成垃圾

（历史记录 —— PP-MattingV2 引擎已于 2026-06-12 被 hyperframes `remove-background` 取代；保留是因为这些教训具有普遍性）ONNX 时代留下的两道伤疤：(1) 固定尺寸的模型导出 —— 把竖屏片段压扁塞进横屏画布会让人变形；应改用 contain-pad（保持宽高比、居中、再把 alpha 裁回来）。(2) 对 1 通道的 raw 输入做 resize 之后，sharp 的 `.raw()` 返回的是 **3 通道**缓冲区 —— 用 1 通道步长去读它，会悄无声息地得到一张涂抹、条纹、错位的 matte，而它*看起来*可能还挺像回事。永远使用 `toBuffer({resolveWithObject:true})` 并按 `info.channels` 计算步长（这个 skill 里的其他脚本仍在用 sharp）。

**修正**：两者都已在 `matte.cjs` 内部处理；如果你改动它，要保留这些处理。

### isnet-general-use / u2net_human_seg 会漏掉道具

rembg 的通用 / 人像模型能抠出人，但会丢掉手持道具（麦克风、笔记本）。如果字幕横穿麦克风，它**不会**被麦克风遮挡 —— 文字会不自然地浮在麦克风前面。

**修正**：对于道具很重要的场景，要么 (a) 接受人像抠像模型抠出什么就是什么，要么 (b) 给道具区域加一个手动遮罩 ROI。我们还没有把 (b) 产品化。

## 布局

### flex 堆叠的字幕把隐藏的字幕推进手势区

champion 的第一版迭代把所有字幕元素都放在一个 `display: block` 的 flex 列里。隐藏的字幕（visibility: hidden）**仍然**占着 flex 空间。结果：cg-4 "dreaming" 被推到 y=700，正好落在手势区，被裁掉了。

**修正**：在字幕 plane 内，每个 `.cap` 都用 `position: absolute` 放在同一坐标上。隐藏的字幕不占布局。这个 skill 里的两个模板都是这么做的。

### 近景特写镜头上的顶部横幅叠加

champion 的第一版迭代在画面**顶部**用了一条全宽的横幅（`top: 30, left: 40, right: 40, height: 360, rotateX: -3deg, justify-content: flex-start, align-items: center`）。主体的头横穿中央，吃掉了每条字幕的中间部分。"know, for me" 变成了淡淡的 "now, for"，字母被切得七零八落。

**修正**：在近景特写的播客镜头上，不要用对称的全宽横幅。用 `corner-column-crown`，把字幕栏放在与头部相对的那个角落。

### 文字右对齐 + align-items: flex-end + 没有 max-width → 流出画面

如果你在 plane 上设了 `align-items: flex-end` 却没有约束宽度，每个 `.cap` 都会收缩到内容宽度。长词就会不换行地向左延伸出 plane 的"可见"框，裁进主体里。

**修正**：在每个 `.cap` 上设 `max-width: calc(100% - padding*2)`。模板都这么做了。

## 动画

### letterSpacing 动画导致 inline-block 重排跳动

曾经在 `tl.fromTo(word, {opacity:0, letterSpacing: ".04em"}, {letterSpacing:"0"}, w.start)` 里把 `letterSpacing: "0.04em"` 作为 "from" 值。GSAP 在 w.start 时刻定格 "from" 状态。随后词的宽度在 tween 过程中变化 → inline-block 重排 → `.cap` 行框重新计算 → "memories" 入场时 "Some" 明显地在行与行之间跳动。

**修正**：只对 **transform** 类属性（opacity、y、scale）做动画。**绝不**对 `.w` span 的 letter-spacing、font-size 或 filter:blur 做动画。模板都遵守这一点。

### 双重淡入（容器 × 词）产生非线性的突然出现

同时独立地淡入分组容器**和**每个词，会产生乘法效应：effective_opacity = container.opacity × word.opacity。即使 ease 相同，合成曲线也是非线性的，感觉像在 40% 左右时突然弹入。

**修正**：在分组存续期间让容器保持固定的 `opacity: 1`（在第一个词之前通过 `tl.set` 设置）。只对逐词的不透明度做动画。模板都这么做了。

## 混合

### mix-blend-mode: overlay 在暗部区域消失

`overlay(white_text, black_bg) ≈ black`。如果字幕的一部分落在暗色阴影 / 暗色道具上，字母就会消失。champion 的第一次渲染里 `SHARP` 变成了 `ARP`，因为 "S" 和 "H" 落在了暗色麦克风的阴影里。

**修正**：对于字幕下方有大片暗部区域的场景，用 `mix-blend-mode: screen`（它在暗色上能保留白色）。`wall-embed` 默认用 overlay（针对中间调墙面）；`corner-column-crown` 默认用 screen（针对暗色书架）。

### 明亮背景会冲淡 screen 混合

相反的问题：不管文字是什么，`screen(white, bright) ≈ white` —— 在阳光照射的窗户或白墙这类明亮背景上，字母会变得看不见。

**修正**：如果字幕区域的平均亮度超过 180/255，把 CSS 切换为 `mix-blend-mode: normal` 并使用不透明颜色。在整个片段中采样字幕包围框内的背景像素来检查。

## 渲染流水线

### bg 渲染与 matte PNG 之间的帧率不匹配

如果 hyperframes 按默认的 30fps 渲染，而 matte 是按源素材的 24fps 提取的，ffmpeg overlay 就会出现时间上的错位 —— 第 N 帧的 alpha 被叠加到某个 ≠ N 的小数帧的 bg 内容上。结果：人物当前的轮廓和 matte 的轮廓错开了几帧，遮挡会滞后或超前于身体。

**修正**：永远给 hyperframes render 传入与源素材原生 FPS 一致的 `--fps`（通常是 24）。`render-and-composite.sh` 会从 plan.json 读取 fps 并传进去。

### WebM alpha（VP8/VP9）在 Chromium 里不稳定

我们尝试过把前景做成带 alpha 通道的 WebM。Chromium 对 VP9 alpha 的支持不一致；VP8 alpha 需要特定的元数据，而默认的 ffmpeg 编码不会生成。

**修正**：不要试图把 matte 放进 hyperframes 里。在后期用 ffmpeg 对着 PNG 序列做 overlay。`render-and-composite.sh` 就是这么做的。

## Crown / 居中文字

### 居中的 crown 被身体吃掉

`corner-column-crown` 里默认的 `.crown-plane` 是 `left: 0; right: 0; text-align: center`。这会机械地把词居中在 `frame_width/2`。如果主体位于中心偏右（1920 宽画面里的 Jobs 在 x=1100），**或者**这个词不够宽、伸不到两侧的干净区域，身体就会吃掉 crown 的 50–70%，读起来就是 "THE \_\_\_ S"。

**修正**：在选择 crown 策略之前，先比较主体的 center_x 和画面中心（见 [layout-heuristics.md § Crown placement](layout-heuristics.md)）。要么把 crown 做得足够大，横跨两侧的干净区域；要么把它挪进较大的那块干净区域并缩窄宽度。`text-align: center` 要在（重新定位后的）框内居中，而不是在画面内居中。

### crown 字号相对画面太小 → 被吞掉一半

在 1920×1080 横屏上，一个 140px 的居中 crown 只有约 500px 宽。如果主体有 700–900px 宽，crown 就消失在主体身后了。症状："THE BEATLES" 只能看到 "THE" 和 "S"。

**修正**：对于全画面居中的 crown，字号必须大到满足 `crown_width > subject_width + 400`。见 [typography-presets.md](typography-presets.md) 里的字号表。横屏居中 crown 优先用 180–260px。

### 字幕栏更宽 + 默认字号 → 分量不足

模板默认值（66/78/92/140）假设栏宽约 560px。把 plane 扩到 700px 以上却不放大字号，文字相对于栏宽就显得太小。

**修正**：栏宽 600–760 → phrase 约 108px，emph 约 128px，居中 crown 约 220px。见 [typography-presets.md](typography-presets.md) 里的表格。

## 场景准入

### 手持 / 快速运镜 → matte alpha 闪烁

matte 做了时间平滑（matte.cjs 里的 EMA），但只能应付中等程度的运动。快速的镜头摇移（vlog 自拍）仍然会产生帧与帧之间的 alpha 抖动，表现为字幕边缘闪烁。

**修正**：SKILL.md 的决策闸门把手持 vlog 列为 `⚠️` —— 降级处理或拒绝。生产版本会加上 `vidstabdetect` 补偿；v1 没有。

### 多人场景 → matte 有歧义

人像抠像模型把"前景"分割成单一的 alpha。有两个人时，它会把两人都抠出来，但当作一整块处理。字幕没法做到"在人物 A 身后但在人物 B 前面"。如果场景里两个说话人都可见，skill 应该先按镜头边界拆分。

**修正**：要么用 PySceneDetect 预先拆分 + 按镜头规划，要么对 `⚠️` 多主体场景直接拒绝。

### 片段内部有未检测到的镜头切换

有些素材（访谈、广播片段）会在片段中途切到 B-roll / 资料画面。matte + 字幕布局假设主体从头到尾是同一个人 —— 渲染中途的一个硬切会产生垃圾结果（相对旧主体摆放的字幕，被套用到一个完全不同的镜头上）。

**v1 的修正**：接受片段之前，在 3–5 个时间点上探测它。如果有任何一帧在同一位置上不包含主要主体，就把片段裁剪到切换点之前结束。`Steve Jobs 60 Minutes` 在 t≈9 秒处切到了披头士的资料画面，被手动裁剪到 8.5 秒。

**未来的修正**：把 PySceneDetect 作为准入闸门的一部分运行；自动拆分成镜头。

### 带有烧录图形的 pillarbox / letterbox 内容

电视资料片段经常带有 pillarbox（两侧黑边），外加烧录的 lower-third 台标（"60 Overtime"）和日期标签（"2003"）。这些是视频文件的一部分，无法被抠掉，并且会缩小可用的画面区域。

**修正**：在第一帧中检测黑边边距（逐行 / 逐列扫描全黑区域）。把字幕安全区约束在 `[left_margin+pad, right_margin-pad, top_margin+pad, bottom_margin-pad]` 内。对 Jobs 来说，安全的内容区域是 x=280–1640（而不是 0–1920）。布局位置必须遵守这一点。

### transcribe.cjs 看到已有的转写稿就跳过

转写现在用的是 Whisper，通过 `transcribe.cjs`（它封装了 `hyperframes transcribe` —— 不需要 API key）。`hyperframes init --video <mp4>` 本身可能会自动写出一个 hyperframes 原始 whisper 形态的 `transcript.json`（一个扁平的词数组，没有顶层的 `language_code`）。`transcribe.cjs` 只有在转写稿**已经**是我们的规范化 schema（`{ words: [...], language_code }`）时才把它当作已完成；否则它会（重新）运行 Whisper，并把扁平的词列表规范化为 `{ words:[{text,start,end,type:"word"}], language_code }`。

**修正 / 预期**：如果你先通过 hyperframes 做了 init，就要预期 `transcribe.cjs` 会把那份转写稿规范化成我们的 schema。不要手动留下一个规范化了一半的文件（例如是我们的 `words` 形态，但没有 `language_code`）—— 那正是跳过守卫可能误读的唯一一种状态。

### 转写稿中超过 3 秒、没有语音的空白

如果原始音频里有一段很长的静默，在视频中途让字幕 plane 空着会感觉不对。要么 (a) 让前一条字幕继续停留，要么 (b) 在静默期间显示一个标题卡式的 crown，要么 (c) 把这段静默从片段里剪掉。

**修正**：在字幕分组阶段检测超过 3 秒的静默。skill 应该就此询问用户，而不是悄悄继续。
