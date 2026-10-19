<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/dna/README.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# DNA registry —— 挑一种视觉语言，而不是挑一个 preset

一套 **DNA** 是一种完整的、经过艺术指导的视觉语言：字体、色板逻辑、动效语法和 hero 编排。它**按场景参数化**，而不是交付一个固定的外观：强调色从这个场景里采样，接触阴影沿着这个场景的光线方向投下，嵌入文字的模糊匹配这个场景的景深，hero 的入场幅度跟随这个词实际说出时的力度（RMS）。

它取代了那一堆零散模板。六种有深度的语言 × 场景自适应，胜过 54 个浅层 preset —— 每一次渲染都已经贴合它的素材画面。

## 类别锁定（deliveries 字段，由编译器强制执行）

每一套经典 DNA 的**归属都是 Cinematic（column）** —— 十套全都是在那里构建和验证的。（Standard/rail 模式已于 2026-06-12 退役；逐字 rail 的需求由 `anchor` 主题承担。旧的 rail 组合已归档在本仓库之外，不随 skill 分发。）

## 十套 DNA

| DNA | 语域 | 适配场景 | 气质 |
| --- | --- | --- | --- |
| **cream** | premium-warm | 暗 / 中间调的暖色场景（横带亮度 < 150） | Inter、暖奶油色、screen 混合、发光浮现的 hero。诗意的默认选项。 |
| **ink** | premium | **明亮场景（横带亮度 > 150）** | Inter、近黑色、multiply 混合 —— 文字读起来像*印在*墙上。补上明亮场景这个缺口。 |
| **editorial** | editorial-luxe | 内省 / 时尚 / 诗意，中暗调 | Bodoni Moda、骨白色、*小写斜体 hero* —— 杂志式的优雅，而不是喊叫。 |
| **keynote** | tech-premium | 产品 / 发布 / 创始人近况更新 | Inter 800、不透明白色、逐行擦除揭示，hero 向上擦出。静止 = 自信。 |
| **documentary** | formal | 访谈、严肃题材 | Inter、骨白色、**烙印式揭示（burn-in）**、没有 hero。庄重本身就是风格。 |
| **loud** | loud | 燃向 / 运动 / 音乐 / 社交 | Anton、从场景采样强调色的 hero、整体一次砸入 + 字幕层涟漪；**正文在前景里高声宣告**（`bodyLayer: "fg"` —— K-pop 式的纵深，刻意为之）。 |
| **neon** | loud-neon | 霓虹黑色电影 / 夜生活 / 科技黑色（暗场景） | Orbitron + 电光青；词像灯管一样闪烁点亮；hero 伴着频闪**通电亮起**，然后嗡嗡作响（glow 0.5）。 |
| **glitch** | loud-neon | 数字 / 黑客 / AI / 反乌托邦 | Space Grotesk；每一拍落地时 **RGB 分离的回声层汇聚到一起**；0.10–0.12s 的机械打击感；落地时把同屏可见的字幕顶开 2px。 |
| **chrome** | loud-luxe | Y2K / 时尚科技 / 音乐 | Audiowide 铸成**液态金属渐变**（在词的 span 上用 background-clip:text）；hero 停留期间有一道光泽扫过。 |
| **velocity** | loud-sport | 运动 / 汽车 / 健身 | Teko 斜体；每个词都**沿着自己的运动矢量**抵达（拖影 + 斜切，再回正）；hero 带着模糊的速度拖尾回声穿过，停留时缓缓逼近。 |

### 引擎能理解的 fx 字段（hero 块）

`entrance: emergence | settle | slam | rise | wipe-up | flicker-on | streak` · `glow`（0–0.5）· `echoes: [{dx,dy,color,opacity,blur}]`（落地时汇聚的副本）· `sheen: true`（渐变扫光 —— 和 `wordCss` 的 background-clip 搭配使用）· `wordCss`（逐词处理；background-clip:text 必须用它，因为它没法透过合成后的子元素裁剪）· `ripple`（px —— 落地时的顶开，只作用于字幕）· `loom` / `breathe`（停留期的生命感）· `letterBlur` · `bodyLayer`（顶层字段：旁白行的默认图层）。

## 怎么选（agent）

1. 读 `safe-zones.json` → `heroAnchor.bandLuma` + `palette.temperature`。
2. 横带偏亮（>150）→ **ink**（绝不要用 cream/screen 去硬扛明亮场景）。
3. 否则按内容语域选：诗意 / 温暖 → **cream** · 内省 / 奢华 → **editorial** · 产品 / 科技 → **keynote** · 严肃 / 访谈 → **documentary** · 燃向 / 社交 → **loud**。
4. 用一行说明你的选择和理由；由用户决定（SKILL.md 的 Step 0 依然适用）。

## 编写

- Cinematic 模式：`cinematic.json` → `"dna": "<name>"`（去掉 `template` 字段）。
- 每套 DNA 锁定：字族、色板方案、混合模式、动效曲线、hero 编排。
- 每个 group 开放（不变）：size / weight / style / case / spacing + planes。
- 每个 group 的 CSS 里都可以用 `var(--accent)` —— 它解析为从场景采样得到的强调色。

## 引擎从 DNA 生成的内容（不需要编写）

- **Hero 三幕**：hero 落地前 0.35s，同屏可见的字幕先压暗（铺垫）→ 逐字母错开入场，幅度 ∝ 说话响度（冲击）→ 缓慢呼吸
  - 发光，直到退场（余晖）。
- **场景光学**：嵌入字幕上的景深匹配模糊，沿光照方向的接触阴影。
- 全部是确定性的 —— 从文件里测量得出，没有随机性。

## 高潮选择 —— 什么样的词配得上被提升

选**点题的结论，而不是话题**：就是你转述这一段时会引用的那几个词。「The stars were only limited by the pixel size」—— 点题的是 **pixel size**（那个出人意料的论断），而不是「stars」（主语）。检验方法：只把这个词大大地放在屏幕上，听者会点头吗？话题词只会让人等下文。

- **短语是合法的**（`match: "pixel size"` / `"skin food"`）：一个高潮是一个语义单元，不一定只是一个 token。最多 2–4 个词 —— 再多就是一句话，不是高潮了。
- **优先选分句末尾** —— 提出来之后，后面不会剩下悬空等着摆放的东西。
- **绝不要把限定词撇下**：把「stars」从「The stars…」里提出来，会留下一个孤零零的「The」，在半空中消失。编译器会把行首的冠词自动并入被提升的短语；如果在行中间，就连同它的冠词一起匹配这个短语。
- 字号由编译器定向调整，而不只是设个下限 —— 你写的字号只是提示：
  - **apex = 画面级事件**：小于可用宽度的 88% → 往 93% 的填充率放大。Std 的高度上限 = `sizeRange[1] × 1.25`（≤46cqh；formal 语域 ×1.0）—— std 的 apex 是撑爆一条 rail，而不是撑爆一个正文构图。Cinematic 的上限 = `sizeRange[1]`。
  - **短词用字距（TRACKING）填满**：当高度上限先于宽度目标触顶时（SHINE —— 5 个字形），编译器会把字距最多拉开到 +0.32em，直到这个词占满约 88% 的宽度（电影片名的手法：HER / DUNE）。长词靠缩放填满，短词靠留白填满 —— 无论哪种，冲击力都由宽度主导。
  - **minor = apex 家族里一拍被抑制的高潮**：`max(3× rail, 0.55× apex-final)`，受宽度限制。一个读起来像标签的高潮就是 bug。
  - **lockup 的上下文按比例锁定（RATIO-LOCKED）**：kicker/tail = `0.26× hero`（钳制在 0.05–0.085·h），在任何按宽度放大之后重新计算。不要手调上下文的字号 —— 定好 hero 的大小，上下文像海报系统一样跟着走。

## 高潮摆放 —— lockup 是默认，但不是唯一的构图

hero 行接受 `"placement": "subject" | "column"`：

- **subject**（默认）—— 居中压在主体上的 **ORBIT lockup**。它不是居中的三明治：上下文像海报的 kicker/tagline 一样锚定在 hero 的边缘 —— 前置上下文从 hero 左上角左对齐伸出，后置上下文从它的右下角右对齐伸出 —— 所以这些小字落在头部 / 肩膀旁边（落在场景上），绝不压在脸上，因此也和其他内容一样是嵌入的（bg）。视线读出一条对角线：kicker ↘ HERO ↘ tail。只有 hero 横穿人物轮廓（展示 matte 遮挡的那一下）。上下文的任务是阅读连贯 —— 它占用边距；hero 的任务是电影感事件 —— 它占用主体。当这个高潮就是那个戏剧性时刻时用它：cream / loud / glitch / neon / velocity 偏向这里。
- **column** —— apex 留在它所在栏的阅读流里，并把这一栏撑爆（超大尺寸，享有完整的 hero 动效 + 压暗 / 发光特权，但在这句话的归属区域内构图；尺寸超大时会自然地溢向主体）。当内容是连续阅读、栏就是叙事的家时用它：keynote、教程、讲解、纪录片。语域：keynote / documentary / editorial 偏向这里。

给每一个高潮都套用同一种构图就是单一化 —— 正是动效评审抓到过的那种失败。按每一拍来选：一支 15 秒的讲解片可能全程都用 column 高潮，只把 subject lockup 留给唯一的那个 apex。（第三种模式 —— editorial 分割式，bg 上下文在上 + fg hero 在下三分之一 —— 在 references/composition-craft.md 里，是下一个候选的摆放方式。）

## 动效语言（五个层，每套 DNA 五个层都要给出答案）

DNA 的动画不是在一个共用淡入上调参数 —— 它是一套独立的物理：

| 层 | 管什么 | 写在哪里 |
| --- | --- | --- |
| **词入场** | 每个词如何在它的节拍上成形（{y,x,blur,scale,rot,dur,ease} 或 burn） | `motion.soft/present/impact` |
| **行退场** | 离开的方向 + 速度，可选从上到下的瀑布式错开 | `motion.exit`（{dur,y,x,scale,ease,stagger}） |
| **停留期生命感** | 文字在屏幕上时做什么 —— 静止是一种刻意的选择 | `hero.breathe` / `hero.loom`（0 = 印刷般静止） |
| **hero 编排** | 三幕入场签名（emergence / settle / slam / rise / **wipe-up**）+ glow / letterBlur / **ripple** | `hero.*` |
| **时间物理** | 所有东西都遵从的时长与缓动语域（打击式 0.15s ↔ 氛围式 0.6s） | 由上面那些值隐含 —— 每套 DNA 保持一个家族 |

已交付的签名：cream = *光凝聚成形*（模糊沉降，向上漂移退场）· ink = *凸版印刷*（缩放压印，不漂浮，纹丝不动）· editorial = *笔尖滑行*（顺着斜体的 x 向滑入，瀑布式翻页退场）· keynote = *外科手术式揭示*（词烙印 + 逐行擦除 + hero 向上擦出，退场从不移动）· documentary = *烙印然后停留*（动效的缺席就是这门语言）· loud = *打击乐*（back 缓动的重击、交替倾斜、会把每条字幕都顶一下的 hero 涟漪 —— 绝不动素材画面）。

继承自 hyperframes motion-principles 的规则：退场比入场快；在不同 DNA 之间变换缓动家族（而不是在一套之内）；`.out` 用于入场，`.in` 用于离场；绝不在同一时间窗口里对同一个元素做两个 transform tween（wipe-up 用的是 clip-path，这样余晖阶段的 scale 通道保持空闲；loom 包含了 breathe）。

## 新增一套 DNA

复制一份现有的 `dna/<name>.json`，改掉气质，保留 schema。引擎（`modes/cinematic/engine.html`）和两个编译器都能直接消费它。一套 DNA 要靠成为*一种有存在理由的独特气质*来赢得位置 —— 而不是换个颜色。
