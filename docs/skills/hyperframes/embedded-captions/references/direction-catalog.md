<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/direction-catalog.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 方向目录

这个 skill 能表达的 10 种不同审美方向。每一种都是一套完整的外观：字体、动效、颜色、摆放、修辞默认值。agent 按**内容语气 × 镜头类型 × 平台**来挑，而不是按 preset 名字。

当前随附的模板（`modes/cinematic/*`）大约覆盖这份目录的 30%。其余的是未来可交付的美学方向。

分类矩阵（Classification matrix）—— 按交叉点挑选方向：

| 语气 ↓ / 平台 → | 9:16 竖屏                            | 16:9 横屏           | 1:1 方形               |
| ------------------- | ---------------------------------------- | ------------------------ | ------------------------ |
| **纪录片**     | documentary-dignified（竖屏变体） | documentary-dignified    | broadcast-dignified      |
| **对话式**  | portrait-header + 默认                | memory-wall 或 champion  | broadcast-dignified      |
| **高能量**       | high-energy-vlog                         | high-energy-vlog-wide    | high-energy-vlog-sq      |
| **诗意**          | lyrical-poem-on-wall（竖屏）          | lyrical-poem-on-wall     | chapter-card             |
| **主题演讲 / 科技**    | —（9:16 不理想）                       | tech-keynote-confident   | tech-keynote-confident   |
| **调查式**   | —                                        | investigative-typewriter | investigative-typewriter |
| **音乐视频**     | k-pop-lyric                              | k-pop-lyric              | k-pop-lyric              |

---

## 方向规格

### 1. documentary-dignified _（Errol Morris / PBS Frontline）_ —— Standard 模式方向（没有预制的 Cinematic 模板）

- **字体家族**：名字卡用 Söhne Mono 或 GT Sectra；正文用 Inter
- **字重**：正文 500，名字卡 700
- **颜色**：炭灰底上的骨白 `#F5EFE6`，或骨白底上的炭灰 `#1A1A1A`。不用强调色。
- **动效**：直接烧录（无动画）。在最后一个词之后多停留 0.5 秒。
- **摆放**：左下方的文字块，10% 边距，整段访谈位置锁定。
- **规则**：最多 2 行。说话人名字卡在第一次开口时出现一次 + 每次切镜头之后出现一次。不做强调样式 —— 庄重感**就是**样式。
- **修辞**：激进地压制填充词。每个词都是挑选过的。

### 2. cinematic-noir _（Kyle Cooper / Se7en）_

- **字体家族**：做旧衬线体（Hoefler Text）+ 紧凑的等宽字体做细节
- **字重**：大多用 700；细斜体**只**用于耳语
- **颜色**：米白 `#E8E0D0`，用深红 `#8B0000` 给单个词做强调以营造威胁感
- **动效**：打字机效果，入场时有 10% 概率出现 1px 抖动；章节段落节拍用划痕蚀刻效果
- **摆放**：偏离中轴 —— 避开正中，略偏左上或右下
- **规则**：不用 emoji，不用圆角，一切都要有手工感

### 3. tech-keynote-confident _（Apple / Jony Ive 广告）_

- **字体家族**：SF Pro Display 或 Inter，别的都不用
- **字重**：标题关键词 800，上下文 400
- **颜色**：任何背景上都用纯白；明亮场景用 `mix-blend-mode: difference` 兜底
- **动效**：通过 clip-path 从底部擦出显现（400ms）；退场淡出 400ms
- **摆放**：正中，大字。**不是** lower-third。
- **规则**：屏幕上一次只有一条字幕。每条字幕 2–5 个词。字幕之间有长时间的静默停留。感觉像幻灯片。

### 4. lyrical-poem-on-wall _（扩展自当前的 memory-wall 模板）_

- **字体家族**：有个性的衬线体 —— EB Garamond / GT Sectra / Caslon Italic
- **字重**：只用 400–500。**这个方向拒绝粗体。**
- **颜色**：通过 `mix-blend-mode: overlay` 吸收墙面的质感，不透明度 0.85，不描边
- **动效**：600ms 蚀刻入场，停留 1.5–3 秒，蚀刻退场
- **摆放**：永远放在场景里的某个表面上（后墙、吸音棉、白板）。使用 matte 流水线。
- **规则**：字幕比说出的文字**少** —— 40–60%。刻意留白。别的工具都不这么做；差异化很强。

### 5. high-energy-vlog _（克制版 Hormozi）_

- **字体家族**：Inter ExtraBold，全大写
- **字重**：永远 900
- **颜色**：白色正文 + **一个**强调色（`#FFD600` 或 `#00E676`）+ 2px 窄深色描边
- **动效**：带弹性的逐词弹出，60ms stagger；当前词在开口时放大到 1.15 倍
- **摆放**：画面中央，距顶部约 35%
- **规则**：每帧最多 3 个词。在换气停顿处硬断。约 15% 的词用强调色。**每 10 秒有一次完全的静默**（这是 Hormozi 模仿者漏掉的）。

### 6. chapter-card _（Wes Anderson / 布达佩斯大饭店）_

- **字体家族**：Futura Bold（现代）/ Archer（温暖）/ Bodoni（正式）
- **字重**：章节标题 700，署名 400
- **颜色**：从场景中采样的粉彩色调
- **动效**：在访谈段落之间插入全画面的静态卡片
- **摆放**：章节用居中卡片；说话期间用左下方的名字卡
- **规则**：章节卡拥有自己的段落节拍（之前 0.8 秒静默，之后 0.4 秒）。感觉是精心编排过的。

### 7. investigative-typewriter _（Frontline / 60 Minutes / Morris Interrotron）_

- **字体家族**：IBM Plex Mono 或 JetBrains Mono
- **字重**：500
- **颜色**：白色，带 3px 阴影，不描边
- **动效**：打字机逐字符出现，每字符 25ms；最后一个字符之后光标闪烁 600ms
- **摆放**：底部横带，带向上的 40% 不透明度渐变 —— **不是硬边框**
- **规则**：只有一行，最多两行。每条字幕结束时光标停留 1 帧，然后下一条才入场。

### 8. k-pop-lyric _（音乐视频式的字体排印炫技）_

- **字体家族**：超大号的展示型衬线体（Playfair Display / GT Super）+ 很小的等宽细节行
- **字重**：展示字体 900，等宽字体 400
- **颜色**：每首歌 / 每个段落用一种深而饱和的单一色调
- **动效**：左右交替的瀑布式入场；词通过混合模式横穿主体
- **摆放**：故意做**大** —— 有时比脸还大
- **规则**：只用于情绪性 / 音乐性的时刻。绝不用于信息类内容。**故意打破第 1 条规则（主体优先）**—— 这正是它的全部意义。

### 9. broadcast-dignified _（BBC / NYT 纪录片标准）_

- **字体家族**：Helvetica Now / Neue Haas Grotesk
- **字重**：正文 500，名字 700
- **颜色**：白字，衬在 40% 黑色渐变的胶囊底上（不是硬边框，也不是单纯的阴影 —— 渐变就是它的标志）
- **动效**：200ms 向上淡入，150ms 向下淡出
- **摆放**：底部居中，10% 边距，锁定在字幕安全区内
- **规则**：严格的 BBC 标准 —— 每分钟 160–180 词，每行 32–34 个字符，最多 2 行，最小间隔 1.5 秒。"导出到广播"模式。故意无聊。永远不会错。

### 10. conference-lower-third-killer _（B2B 但不土）_

- **字体家族**：GT America / Aktiv Grotesk
- **字重**：双字重名字卡 —— 职位 400，名字 700，字号相同
- **颜色**：名字用从场景采样的强调色，职位用白色
- **动效**：名字卡只在首次出现时从左侧擦入 400ms；之后保持静态
- **摆放**：左下方的卡片 + 上方对话里行内的当前词高亮
- **规则**：适用于播客片段、创始人访谈、主题演讲摘录的模式。精致而不过分艺术化。

---

## 下一个该交付哪个

当前模板：`memory-wall`（大致是方向 #4）、`champion`（大致是 #5 和 #9 的混合）、`portrait-header`（默认竖屏）。

基于竞争空白的交付优先级：

1. **documentary-dignified** —— 别人都做不好；Errol Morris 美学是一个无人服务的细分市场
2. **lyrical-poem-on-wall**（作为独立模板）—— 最能发挥我们 matte 嵌入护城河的那个
3. **high-energy-vlog** —— 对标 Hormozi/Submagic 的 preset，但设计上胜出
4. **tech-keynote-confident** —— 对产品发布视频很重要
5. **investigative-typewriter** —— 小众但辨识度极高

---

## agent 如何挑选

1. 给片段分类：`tone × shot × platform`（见上面的矩阵）
2. 在矩阵里查出方向
3. 在本文件里读那个方向的规格
4. 把规格翻译成 plan.json 参数，**或者**从 `examples/` 克隆标准范例 HTML
5. 按场景调整布局（agent 的判断，见 `aesthetic-principles.md §1–18`）

如果没有哪个方向干净地吻合 → **Standard 模式**。不要硬套一个不匹配的方向。
