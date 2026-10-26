---
name: talking-head-recut
description: >
  给一段现有的口播 / 访谈 / 播客视频加上按时间编排、经过设计的图形 overlay 卡片 —— 动态标题、lower-third、数据标注、引语、侧边面板、画中画 —— 与转写稿同步，画布可选 16:9 / 9:16 / 4:5；原片在下面原样播放。触发词：「图形 overlay」（graphic overlays）、「屏幕图形」（on-screen graphics）、「包装 / 装点我的视频」（package / dress up my video）。不是纯字幕（/embedded-captions）。不明确 → /hyperframes。
---

**插件安装：** 当本 skill 位于某个 HyperFrames 插件内时，在执行安装或保鲜命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装的情况保留下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update talking-head-recut`。一切都是最新时它会快速空跑；否则它会在你依赖这些 skill 之前，刷新本 skill 以及它所依赖的核心领域 skill。

# Talking Head Recut

Talking Head Recut 接收一段会**完整播放**的本地视频，在其上叠加一系列按时间编排、经过设计的**图形卡片** —— 标题、lower-third、数据标注、引语、侧边面板、画中画 —— 与正在说的内容同步。agent 设计卡片（时间 + 内容），并**直接在对话中写出每张卡片的 HTML**，然后组装成单个 composition HTML，再通过 `hyperframes` 渲染成 MP4。没有固定的原型（archetype）清单，也没有规定的卡片结构 —— overlay 是从转写稿实际说了什么中生长出来的。

> **入口是 `/hyperframes`。** 本 skill 用**设计过的图形卡片**（标题、lower-third、数据标注、引语、侧边面板、画中画）来包装一段**现有的口播片段** —— 而不是纯字幕（把说出来的话变成文字）。**片段原样播放。** 任何其他意图 —— 纯字幕、独立的图形、从零开始的视频 —— 或任何不确定 → 先读 `/hyperframes`：每一个路由决策都由意图层负责。

> **`embedded-captions` 的图形包装姊妹 skill。** 字幕是把*说出来的话*作为可读的字幕加上去；本 skill 是在播放中的视频之上加*设计过的图形*。纯字幕 → `embedded-captions`。从零构建视频 → 各创作工作流（`product-launch-video` / `faceless-explainer` / …）。

经由 `/hyperframes` 路由过来时，意图层只确认输入（哪段片段），并把渲染策略问题作为延后提问**预告**出来 —— 画幅、布局、风格组和卡片数量都留到 Step 7 再问，那时已经探测过的素材画面和转写稿能为推荐提供依据；意图层的运行形态问题不适用。如果存在 `BRIEF.md`，它承载着已确认的输入和用户的备注 —— 先读它。

工作目录中可供检查的中间文件：

- `metadata.json` —— 时长 / 宽 / 高 / fps
- `audio.mp3` —— 提取出的音频
- `transcript.json` —— 一个扁平的**单词数组** `[{ text, start, end }, …]`（Whisper；没有 `segments`，也没有 `words` 包装层）
- `storyboard.json` —— 轻量的卡片大纲（agent 的计划）
- `public/cards/card-XX.html` —— 每张卡片一个 HTML 片段
- `public/index.html` —— 最终组装好的 composition
- `output.mp4` —— 渲染出的视频

## CLI 解析

```bash
# hyperframes — transcription (local Whisper) + rendering the assembled HTML to MP4
npx hyperframes --help
```

本 skill 完全运行在 **hyperframes** CLI 加上系统的 `ffmpeg` / `ffprobe` 之上。转写通过 `hyperframes transcribe` 在本地运行 **Whisper** —— 没有第三方服务、API key 或限速代理。

## 工作流

### 1. 检查环境

```bash
npx hyperframes doctor          # ffmpeg, headless browser, render deps
# confirm bundled assets:
ls "<SKILL_DIR>/assets/fonts" "<SKILL_DIR>/assets/vendor/gsap.min.js"
```

必需：

- `ffmpeg` / `ffprobe`（系统）
- `<SKILL_DIR>/assets/fonts/*.woff2`、`<SKILL_DIR>/assets/vendor/gsap.min.js`（随本 skill 打包，在 Step 9 中复制到工作目录）

转写不需要 key —— `hyperframes transcribe` 在本地运行 Whisper（Step 4）。

在 macOS 上运行 `hyperframes render` 时强烈建议：

```bash
export PRODUCER_BROWSER_GPU_MODE=hardware
```

### 2. 创建工作目录

所有产出物都放在 `videos/<project-name>/` 下 —— 与其他视频工作流（`product-launch-video` / `faceless-explainer` / `pr-to-video`）的约定相同。让 cwd 保持在工作区根目录；下面的所有内容都写进这一个子目录。

```bash
VIDEO_PATH="/absolute/path/input.mp4"
WORK_DIR="videos/$(basename "$VIDEO_PATH" | sed 's/\.[^.]*$//')"
mkdir -p "$WORK_DIR"
```

### 3. 提取音频和元数据

```bash
# metadata — duration / width / height / fps
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -show_entries format=duration -of json "$VIDEO_PATH" > "$WORK_DIR/metadata.json"
# audio
ffmpeg -y -i "$VIDEO_PATH" -vn -acodec libmp3lame -q:a 2 "$WORK_DIR/audio.mp3"
```

输出：`metadata.json`（读取 `width`/`height`/`duration`；fps = 把 `r_frame_rate` 这个分数算出来，例如 `30000/1001 → 29.97`）+ `audio.mp3`。

### 4. 转写

```bash
npx hyperframes transcribe "$WORK_DIR/audio.mp3" -d "$WORK_DIR" --json --model small.en
```

本地 **Whisper** —— 没有 API key、没有代理、没有限速。它会在工作目录里写出一份单词级的 `transcript.json`（单词 `text` + `start` / `end` 时间戳）。读取它，获取在 Step 6 中驱动卡片时间的单词 / 句子时间；如果你需要段落级的分块，就自己在标点 / 停顿处把单词组合成句子。

**截断到媒体时长。** Whisper 可能会让最后一个单词的 `end` 比实际片段长度多出一丁点 —— 把每张卡片的 `endSec` 和 `composition.durationSeconds` 都截断到 `metadata.json` 中的时长，否则渲染结果会在视频之后出现一段黑色尾巴。

### 5. 校正转写稿

`transcript.json` 是一个**由单词对象组成的扁平数组** —— `[{ "text": "...", "start": s, "end": s }, …]`（没有 `segments` 数组，没有 `words` 包装层；每个单词的键是 **`text`**）。读取它并修正明显的 ASR 错误：

- 同音词、产品名、技术术语、标点
- 就地编辑单词的 `text`；**保留它的 `start` / `end`** 时间戳
- 没有预先分组的 `segments` 数组 —— 当你需要段落级的分块来定卡片时间时，**自己把单词组合成句子**（在句末标点 / 停顿处切分）

### 6. 起草一份轻量分镜（在对话中）

**不涉及 CLI。** 读取 `transcript.json` + `metadata.json`，直接设计卡片。`storyboard.json` 是 agent 内部的规划产出物 —— 没有任何 CLI 命令会消费它；它的存在是为了让你在写每张卡片的 HTML 之前，把时间和内容想清楚。让它的结构与下面的示例保持一致，这样同一份大纲就能驱动你在 Step 9 中编写的 composition：

```json
{
  "schemaVersion": 3,
  "composition": {
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "durationSeconds": 121.2,
    "layout": "portrait",
    "themeId": "noir",
    "seed": 42
  },
  "videoTrack": {
    "sourcePath": "input-video.mp4",
    "startSec": 0,
    "endSec": 121.2,
    "bounds": { "x": 0, "y": 0, "width": 1080, "height": 1920 }
  },
  "subtitles": { "enabled": false },
  "cards": [
    {
      "id": "card-01",
      "intent": "Hook with the speaker's anxious midnight question",
      "startSec": 0.5,
      "endSec": 13.0,
      "accentIndex": 0,
      "zone": "fullscreen",
      "contentHints": {
        "kicker": "AN HONEST QUESTION",
        "title": "The soul-searching question at 11 PM",
        "detail": "Client's 60-second voice message: 'If the RMB appreciates, does that mean my USD policy is a terrible loss?'"
      }
    }
  ]
}
```

**Card 必需字段：**

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `id` | string | 稳定的 id，用于卡片 HTML 和 GSAP 选择器 |
| `intent` | string | 自然语言描述；输入给卡片合成 |
| `startSec` / `endSec` | number | 以秒为单位的时间（endSec > startSec） |
| `accentIndex` | 0 \| 1 \| 2 \| 3 \| 4 | 这张卡片取用 5 个主题强调色中的哪一个 |
| `zone` | 枚举（见下） | 卡片位于画布上的哪个区域 |
| `contentHints` | object | 自由格式的容器；agent 把 kicker/title/detail/data/quote 放在这里 |
| `archetype`（可选） | string | 自由格式的标签，你可以附上它来记住一张卡片的模式；不写 = 自由格式，这是默认情况 |
| `transition`（可选） | 枚举：`cut` \| `fade` \| `slide` \| `wipe` | 声明式的卡片间转场 |

**五个 `zone` 值：**

| zone | 解析后的边界 | 何时使用 |
| --- | --- | --- |
| `fullscreen` | 覆盖整个画布 | 主视觉时刻、大数字、金句 |
| `whiteboard-area` | 内缩 40px 边距（或竖屏高度的 45%） | 密集数据 / 带注释的内容 |
| `lower-third` | 底部 30% 的带状区域 | 在可见视频之上做注释 |
| `side-panel` | 右侧 42%（横屏）或底部 40%（竖屏） | 一侧数据，另一侧视频 |
| `video-overlay` | 整个画布，卡片应基本透明 | 在满幅出血视频上叠加注释 |

在 Step 9 组装 composition 时，按上表把每张卡片的 `zone` 解析为 card-host 包装层上的像素边界。视频边界在 composition 层面**只设置一次**（`videoTrack.bounds`）；要让视频看起来「在卡片之间移动」，就在 composition 的 `<script>` 里针对 `#video-wrap` 编写 GSAP tween（见 Step 9）。

**没有规定的卡片角色，也没有规定的叙事弧线。** 卡片从视频实际说了什么中生长出来 —— 可能全是引语，也可能全是数据；可能以一个数字开场，也可能以一个故事开场。让转写稿来驱动节奏。

**要多少个要点？—— 根据时长 + 密度自动推断。** 没有固定的上限。根据视频时长选一个**基础节奏**，再按**信息密度**调整。只有**下限是固定的：至少 5 张卡片**，这样即使是短视频也有节奏感。

**第 1 步 —— 按时长定基础节奏**（中等密度下自然的每张卡片秒数）：

| 视频时长 | 基础节奏（每张卡片秒数） | 理由 |
| --- | --- | --- |
| < 60s（短视频） | **6–8s** | 短视频观众期待快速切换 |
| 60s – 3 min | **8–12s** | 正常的社交媒体节奏 |
| 3 – 10 min | **12–20s** | 留出喘息空间；每张卡片承载更多内容 |
| 10 – 30 min | **20–35s** | 长篇讲座 / 访谈的节奏 |
| > 30 min | **30–60s** | 分集式，接近章节的感觉 |

**第 2 步 —— 密度乘数**（乘以基础节奏）：

| 转写稿中的信号 | 乘数 | 效果 |
| --- | --- | --- |
| **高密度** —— 大量数字、各自独立的论断、断奏式的节奏、列表式的罗列，每 1–2 句就是一个新观点 | **× 0.7** | 切得更快，卡片更多 |
| **中密度** —— 数据和叙事兼有的混合流 | **× 1.0** | 基础节奏 |
| **低密度** —— 一个展开的长故事、反复换角度重述、缓慢沉思的节奏、单一论点的逐步展开 | **× 1.5** | 切得更慢，卡片更少 |

**第 3 步 —— 计算：**

```
secPerCard = basePace × densityMultiplier
cardCount  = max(5, round(videoDurationSec / secPerCard))
```

示例（注意 —— **没有上限截断**；长视频自然会产生更多卡片）：

- **30 秒短视频，单一笑点（低密度）** → 7 × 1.5 = 10.5s/张 → round(30/10.5)=3 → 取下限 **5** 张
- **60 秒沉思式独白（低密度）** → 10 × 1.5 = 15s/张 → **4** → 取下限 **5** 张
- **121 秒数据丰富的口播（高密度）** → 10 × 0.7 = 7s/张 → **17** 张
- **5 分钟访谈，混合密度** → 16 × 1.0 = 16s/张 → **19** 张
- **10 分钟深度解析，高密度** → 16 × 0.7 = 11s/张 → **55** 张
- **30 分钟讲座，中密度** → 28 × 1.0 = 28s/张 → **64** 张
- **1 小时播客，低密度** → 45 × 1.5 = 67.5s/张 → **53** 张

当一张卡片停留超过约 15 秒时，要规划一张更丰富的卡片（数据块、多步揭示、几个子要点以错开的动画依次展开）—— 一句静态的话放过 8 秒就会变得无聊。对于很多卡片都超过 30 秒的长内容，考虑**把 timeline 分块成 sub-composition**（每章一个 .html，用 `data-composition-src` 挂载），让每个文件的 GSAP timeline 保持在可控范围内 —— 见 HyperFrames lint 警告 `timeline_track_too_dense`。

`contentHints` 是一个自由格式的对象；它的键和嵌套可以采用任何能表达数据的结构。由 agent 按卡片决定结构。

**可选片尾。** 本 skill **不附带固定的品牌片尾**。如果用户想要一张收尾卡片，就自己设计一张中性的（文字标识 + 一行口号，约 1.5-2 秒，淡入 -> 短暂停留 -> 淡出），把它追加到 `cards[]` 里，并把 `composition.durationSeconds` 延长到它的 `endSec`。否则就以最后一张内容卡片结束。

### 7. 决定渲染策略

#### 与用户确认视觉方向（最先做这一步）

在开始设计卡片或决定边界之前，**请用户选择输出比例、布局、风格和卡片密度预设**。画框会根据所选的布局 × 风格组合自动选出（见下文「Auto-pick frame」（自动选择画框）表）。在发出问题之前，**先预计算两样东西**：

1. 根据源视频的宽高比（`metadata.json` 的 width / height）算出 **`recommendedRatio`**：
   - `sourceAspect = width / height`
   - `sourceAspect ≥ 1.5`（≥ 约 3:2 的宽屏）→ 推荐 **`16:9`**
   - `sourceAspect ≤ 0.7`（≤ 约 9:13 的竖屏）→ 推荐 **`9:16`**
   - `0.7 < sourceAspect < 1.5`（接近方形）→ 推荐 **`4:5`**

   在推荐选项的 label 后面加上「 (recommended · matches source video X:Y)」，让用户看到为什么推荐它。

2. 根据 Step 6 算出 **`autoCount`**（`max(5, round(videoSec / (basePace × densityMultiplier)))`），这样「auto」选项的 label 就能显示具体的数字。

**环境兼容性 —— 选用可用的最佳提问渠道。** 不是每个运行时都提供同样的结构化提问工具。按以下顺序选择：

1. **原生澄清工具** —— 使用下面这个结构化的 4 问题调用。
2. **其他原生澄清工具**（例如 `ask_question`、`request_user_input`、IDE 专属的提示）—— 用那个工具，问题文本和选项列表与这 4 个问题相同。保留推荐标记和预计算出的值。
3. **没有原生工具**（Codex CLI、只支持纯文本的运行时）—— **直接在普通对话里问**。使用本节末尾的纯文本模板。控制在**一条消息、4 个编号问题**之内（全局上限是每轮 2–5 个问题；我们在上限之内）。

适用于所有渠道的规则：

- **每轮最多问 2–5 个问题**。我们这里的 4 个符合要求。
- 即使缺失的信息不会阻碍渲染，也要**问一次，确认那些对最终输出有实质影响的参数**（比例、布局、风格、cardCount）。
- 如果用户已经预先认可了默认值（「直接用默认值」「不用问了」「全部自动选」），要求你不要问，或者这次运行带有持续的自主信号（「surprise me」/「decide for me」—— `../hyperframes/references/brief-contract.md` § 1）—— **完全跳过提问**，直接使用：`recommendedRatio`、`layout="stack"`（跨比例最稳妥的默认值）、在最中性的组（editorial/data）里根据转写稿基调选出的 `style`、`autoCount`。用一句话告诉用户你选了什么，然后继续。

**Channel A —— 原生 `AskUserQuestion`：**

```
// Precompute before the call:
//   recommendedRatio = "16:9" | "9:16" | "4:5"
//   autoCount        = integer (from Step 6)

AskUserQuestion({
  questions: [
    {
      question: "Output video aspect ratio (canvas):",
      header: "Aspect ratio",
      multiSelect: false,
      // Reorder so the recommended option appears FIRST (per AskUserQuestion convention).
      // Append " (recommended · matches source video W×H)" to the recommended option's label.
      options: [
        { label: "16:9 (1920×1080) landscape", description: "TV / YouTube / desktop playback. Most natural when the source video is already landscape; widest canvas." },
        { label: "9:16 (1080×1920) portrait", description: "TikTok / Reels / short-form mobile. Most natural for portrait source; native mobile experience." },
        { label: "4:5 (1080×1350) near-portrait", description: "Instagram feed / WeChat Moments. Best when source is near-square or you want to cover both platforms." }
      ]
    },
    {
      question: "Choose the overall layout: how should the video and cards coexist on the canvas?",
      header: "Layout",
      multiSelect: false,
      options: [
        { label: "side-by-side (split)",  description: "Video and card each take half the canvas. Most stable for interview / data side-by-side; clear visual separation." },
        { label: "top-bottom (stack)",    description: "Video on top (~52%), card below. Classic combo of speaker face + summary card; works well in portrait too." },
        { label: "picture-in-picture (pip)", description: "Card fills the canvas, video shrinks to a rounded corner window. Use when content is primary and speaker is secondary." },
        { label: "full-screen overlay (overlay)", description: "Video plays full-bleed, card floats as a glass layer on top. Strong cinematic / emotional feel." }
      ]
    },
    {
      question: "Choose the card visual style (style):",
      header: "Style group",
      multiSelect: false,
      // NOTE: these 3 groups intentionally match the frame auto-pick matrix
      // rows below, so picking a group resolves both `style` group AND the
      // frame matrix column in one step. Memberships are mutually exclusive.
      options: [
        { label: "warm paper (warm-paper)", description: "academic notebook · editorial big-type · whiteboard hand-drawn · xhs social. Best for interview reflections, product launches, lifestyle, emotional stories." },
        { label: "clinical / cold (clinical)",   description: "audit magazine · swiss grid · terminal CLI · minimal modern. Best for financial analysis, investigative reports, technical tutorials, serious presentations." },
        { label: "experimental / avant-garde (experimental)", description: "geom color-clash geometry · spotlight dark-background. Best for short-form highlights, product launches, strong emotion, cinematic feel." }
      ]
    },
    {
      question: "Card count (takeaway pacing): how many cards to cut?",
      header: "Card count",
      multiSelect: false,
      options: [
        { label: "Auto (recommended) · approx N cards", description: "Inferred automatically from video duration and information density (see Step 6 rules). This run estimates approx N cards. Substitute the real N (your autoCount) into the label." },
        { label: "Fewer · approx round(N × 0.6) cards", description: "Sparser cuts, each card holds longer — suits reflective / slow-paced content." },
        { label: "More · approx round(N × 1.5) cards", description: "Tighter cuts, faster rhythm — suits staccato / data-dense / short-form highlight content." }
      ]
    }
  ]
})
```

**关于「Other」** —— `AskUserQuestion` 会自动给卡片数量问题加上一个「Other」选项。用户可以直接输入一个数字（例如「8」「20」）作为 cardCount 目标。把输入解析成整数：解析成功 → 使用该值（以 5 为下限）；解析失败 → 回退到「auto」。

**Channel B —— 纯文本兜底**（Codex CLI、没有原生提问工具的运行时）。把下面的内容作为一条普通消息发出，然后等待回复。1/2/3/4 的编号格式能让回复便于解析：

```
I need to confirm four visual decisions with you before I start cutting cards:

1) Output aspect ratio (canvas):
   A. 16:9 landscape (1920×1080) — TV / YouTube / desktop playback
   B. 9:16 portrait (1080×1920) — TikTok / Reels / short-form mobile
   C. 4:5 near-portrait (1080×1350) — Instagram feed / works for both platforms
   ▸ My recommendation:  <recommendedRatio>  (matches source video W×H = <sourceW>×<sourceH>)

2) Overall layout (how video & card coexist):
   A. split   side-by-side (50/50)
   B. stack   top-bottom (video top, card bottom)
   C. pip     picture-in-picture (card full canvas, video rounded corner window)
   D. overlay full-screen glass overlay (video full-bleed, card glass layer)

3) Card style group (maps to frame auto-pick matrix, pick 1 of 3):
   A. warm paper (warm-paper)      (academic / editorial / whiteboard / xhs)
   B. clinical / cold (clinical)   (audit / swiss / terminal / minimal)
   C. experimental (experimental)  (geom / spotlight)

4) Card count (takeaway pacing):
   A. Auto (recommended) — approx <autoCount> cards
   B. Fewer — approx round(<autoCount> × 0.6) cards
   C. More — approx round(<autoCount> × 1.5) cards
   D. Give me a specific number (e.g. "8", "20")

Reply format: "1A 2C 3B 4A" or natural language is fine.
If you want all recommended defaults, reply "default" / "auto" / "use all recommendations".
```

解析纯文本回复：

- 接受宽松的格式：`"1A 2C 3B 4A"`、`"A C B A"`、`"16:9 / pip / data / auto"`、完整的句子，或 `default`。
- 如果有任何回答含糊不清 → 只重新问那些含糊的问题（仍在 2–5 个的上限之内）。
- 如果用户说「default / auto / use all recommendations」→ 直接跳过，不再追问。

用户回答之后（任何渠道）：

1. 根据比例回答**确定输出画布** —— 这些就是要写进 `storyboard.composition.width / height` 的确切值：

   | 用户选择 | composition.width × height | storyboard.layout 字段 |
   | --- | --- | --- |
   | `16:9` | **1920 × 1080** | `"landscape"` |
   | `9:16` | **1080 × 1920** | `"portrait"` |
   | `4:5` | **1080 × 1350** | `"portrait"`（schema 把 4:5 视为竖屏 —— 高度 > 宽度） |

   关于 **`references/layouts/*.html` 中 4:5 的边界** —— 那些文件只记录了横屏（1920×1080）和竖屏（1080×1920）。对于 4:5（1080×1350），**从竖屏按比例缩放**推出边界：水平方向的值保持不变，垂直方向的值乘以 `1350/1920 ≈ 0.703`。示例：`overlay` 竖屏卡片 = `{ x: 24, y: 1280, w: 1032, h: 564 }` → 4:5 卡片 = `{ x: 24, y: round(1280 × 0.703), w: 1032, h: round(564 × 0.703) }` = `{ x: 24, y: 900, w: 1032, h: 397 }`。

2. **把风格组映射到具体风格**：看转写稿的基调 —— 选最贴合的那个，但要留在用户所选的组内。如果你在组内的两个具体风格之间拿不定主意，就再发一次 `AskUserQuestion`，给出那 2–4 个具体风格选项。

3. 根据密度回答**确定最终的 cardCount**：

   | 用户选择 | 最终 cardCount |
   | --- | --- |
   | Auto (recommended) | 你已经算好的 `autoCount` |
   | Fewer | `max(5, round(autoCount × 0.6))` |
   | More | `round(autoCount × 1.5)`（没有上限截断） |
   | Other = "<n>"（整数） | `max(5, parseInt(n))` |
   | Other = 其他任何内容 | 回退到 `autoCount` |

4. 根据下表**自动选择视频画框**（画框不问用户 —— 它由布局 × 风格推出）：

   | layout | warm-paper 风格（academic / whiteboard / editorial / xhs） | clinical 风格（audit / swiss / terminal / minimal） | experimental 风格（geom / spotlight） |
   | --- | --- | --- | --- |
   | `split` | `polaroid` | `hairline` | `clean` |
   | `stack` | `polaroid` | `hairline` | `clean` |
   | `pip` | `clean`（pip 药丸框本身已经有装饰） | `clean` | `clean` |
   | `overlay` | `clean`（满幅出血不允许装饰性画框） | `clean` | `clean` |

5. 用一句话**告诉用户你选了什么** —— 比例（+ 画布尺寸）、布局、具体风格、画框和最终的 cardCount —— 然后继续 Step 7 的其余部分（逐卡片的布局、动效模式）。
6. 把这五个值（ratio / layout / style / frame / cardCount）记在工作记忆里（不需要 schema 字段）；在 Step 8 写每张卡片的 HTML 时，以及读取对应的 `references/<dim>/<key>.html` 获取 token 和结构时，都会用到它们。

如果用户通过「Other」给出了一个不在 10 种风格库里的自由文本风格名，就把它当作提示，自己设计一套全新的卡片视觉，但仍然以所选布局的边界为基准。

#### 渲染策略输入

在 Step 7.0 中锁定了 ratio / layout / style / cardCount / frame 之后，剩下的逐卡片决策是：

- **源视频在 GSAP 目标内的适配方式**：视频元素带有 `object-fit: cover`，并被裁切到 `#video-wrap` 的 tween 边界内。如果你**不想要任何裁切**（例如竖屏源视频放在横屏画布上时，不应被切掉上下部分），就把 tween 的目标设成一个与源宽高比一致的矩形，让周围的画布透出来（或者用卡片 / 背景板填充）。
- **每张卡片的 `card.zone`**：从你所选的 composition 布局推出（split → side-panel、stack → lower-third、pip → fullscreen、overlay → video-overlay），**或者**为一次性的变体选一个不同的 zone（主视觉 / 引语用 fullscreen，密集数据用 whiteboard-area）。
- **每张卡片的 `accentIndex`**：每张卡片取用 5 个主题强调色中的一个。在卡片之间变化以形成节奏；当两张卡片属于同一个叙事段落节拍时，复用同一个索引。
- **动效词汇**：从 `data-anim` 种类中挑 2–3 个可重复的模式（见后面的表格）并坚持使用，让 composition 感觉连贯。

从这些 `themeId` 色板中选择（在 composition 的 `<style>` 块里把它们用作 `--accent-N` / `--bg` / `--text` CSS 变量）：

| themeId | 强调色色板（5 色） | 底板背景 | 文字 |
| --- | --- | --- | --- |
| classic | `#1971c2 #e03131 #2f9e44 #e8590c #9c36b5` | `#FFF9E3`（纸张） | `#1e1e1e` |
| noir | `#4cc9f0 #f72585 #4ade80 #fb923c #a78bfa` | `#1a1a1a` | `#f1f1f1` |
| mint | `#0077b6 #d62828 #2d6a4f #e76f51 #7209b7` | `#e8faf0` | `#1b4332` |
| craft | `#bf5700 #d62728 #6c757d #e9b54a #3d5a80` | `#f6efe1` | `#2d2d2d` |
| slate | `#0ea5e9 #ef4444 #22c55e #f97316 #a855f7` | `#1e293b` | `#f1f5f9` |
| mono | `#000 #555 #888 #aaa #ccc` | `#fff` | `#000` |

可用字体（woff2 位于 `<SKILL_DIR>/assets/fonts/`，在 Step 9 中复制到工作目录）：`Caveat`（手写体）、`LXGW WenKai TC`（中文手写体）、`Inter`（现代无衬线体）、`Virgil`（几何手绘体）。通过 `@font-face` 或直接用 `font-family` 引用。

想找视觉模式的灵感，`<SKILL_DIR>/references/styles/` 附带了 10 张自包含的参考卡片（academic / editorial / minimal / spotlight / geom / whiteboard / audit / terminal / swiss / xhs），你可以复制它们作为起点 —— 但**不必觉得非得和其中任何一张保持一致**。每张卡片都是你自己的设计。

#### 视觉设计库（<SKILL_DIR>/references/）

除了 composition 级别的 `themeId`，本 skill 还在 `<SKILL_DIR>/references/` 附带了一个更丰富的**参考库**，涵盖三个**相互正交**、可以自由组合的视觉维度：

```
Style  ×  Layout  ×  VideoFrame
 (10)      (4)         (3)
```

| 维度 | 取值 | 它决定什么 |
| --- | --- | --- |
| **style** | `academic` `editorial` `minimal` `spotlight` `geom` `whiteboard` `audit` `terminal` `swiss` `xhs` | 卡片的视觉语言 —— 字体、颜色、装饰、卡片内部布局 |
| **layout** | `split` `stack` `pip` `overlay` | 源视频和卡片如何分享画布 |
| **frame** | `clean` `hairline` `polaroid` | 视频元素周围的装饰外框 |

读 `<SKILL_DIR>/references/DESIGN_INDEX.md`，获取完整的组合矩阵和一份宽松的选择指南（访谈 / 产品发布 / 数据分析 / 社交短片 / 技术教程 / 情感故事 …）。当你决定使用某个具体的 style / layout / frame 时，Read 对应的文件：

- `references/styles/<key>.html` —— 自包含的卡片片段，带有该风格的 CSS token（颜色、字体、内边距、装饰）和一条占位的要点。复制 `.card[data-card-id="ref-<key>"]` 样式块，把 data-card-id 改成你的卡片 id，把占位内容换成真正的要点，就完成了。
- `references/layouts/<key>.html` —— 横屏和竖屏下确切的 `videoBounds` + `cardBounds`。分镜只记录 `card.zone`。
- `references/frames/<key>.html` —— 作为 `#video-wrap` 同级元素添加的装饰性 HTML，以及在 composition CSS 中的摆放说明。

在用户所选的风格组内，你可以逐卡片变换风格，也可以逐卡片选择 `layout × frame`，只要转场看起来流畅就行。

这 10 种风格是 skill 这一侧的设计 token，**不是 composition 级别的主题** —— 它们不需要在 `storyboard.composition` 中声明；它们存在于每张卡片的 HTML 里。`themeId` 字段仍然可以选一个 composition 级别的色板（见上表），用来控制页面 body 的背景和视频边框装饰。

#### 布局组合（卡片 + 视频）

每张卡片有两个相互配合的决策，决定它如何与源视频分享画布：

- **`card.zone`**（在 `storyboard.json` 中声明）—— 5 个 schema 值之一；在 Step 9 编写 card-host 包装层的内联 `style` 时，（按 Step 6 中的表）把它解析为像素边界。
- **该卡片时间窗口内 `#video-wrap` 的边界**（在 composition 的 GSAP timeline 中以命令式声明）—— 每次布局转场时，agent 都把 `#video-wrap` tween 到一个目标矩形。

schema **不**存储逐卡片的视频边界。`videoTrack.bounds` 是 composition 级别的**一次性**设置（默认为整个画布）。视频在卡片之间的「移动」纯粹是写在 `index.html` 里的 GSAP 动画。不存在 `card.layout` 字段；schema 只有 `card.zone`。

**4 种 composition 布局**（来自 `references/layouts/`）—— 每种都是一个配方，把一个 `zone` 和一个 `#video-wrap` 的 tween 目标配成一对：

| composition 布局 | 推荐的 `card.zone` | `#video-wrap` 的 GSAP 目标（横屏 1920×1080） | `#video-wrap` 的 GSAP 目标（竖屏 1080×1920） | 何时使用 |
| --- | --- | --- | --- | --- |
| `split` | `side-panel` | `{ left: 960, top: 0, width: 960, height: 1080 }` | `{ left: 0, top: 960, width: 1080, height: 960 }`（下半部分） | 说话人 + 数据并排 / 50:50 分量 |
| `stack` | `lower-third` | `{ left: 14, top: 14, width: 1892, height: 548 }`（上部 52%） | `{ left: 0, top: 0, width: 1080, height: 844 }`（上部 44%） | 说话人在上 + 摘要卡片在下 |
| `pip` | `fullscreen` | `{ left: 1480, top: 760, width: 400, height: 300 }` + 加上 `.framed` class | `{ left: 690, top: 28, width: 360, height: 203 }` + 加上 `.framed` | 内容密集的卡片 + 角落画中画 |
| `overlay` | `video-overlay` | `{ left: 0, top: 0, width: 1920, height: 1080 }`（满幅出血） | `{ left: 0, top: 0, width: 1080, height: 1920 }` | 电影感 / 戏剧性 / 全幅视频上的毛玻璃卡片 |

对于 4:5（1080×1350），把竖屏的 y/h 值乘以 `1350/1920 ≈ 0.703`（见 Step 7.0 Channel A / Channel B 中 `recommendedRatio` 的解析表）。

**用于一次性变体的其他 zone 值**（仍然使用 `card.zone`；不要伪造「layout」字段）：

| `zone` | 解析后的边界 | 常见用途 |
| --- | --- | --- |
| `fullscreen` | 覆盖整个画布 | 主视觉卡片，视频 tween 到隐藏 / 画中画 |
| `whiteboard-area` | 内缩 40px 边距（横屏）或底部 45%（竖屏） | 密集数据卡片，留出四周边距 |
| `lower-third` | 底部 30% 的带状区域 | 口播注释 |
| `side-panel` | 右侧 42%（横屏）或底部 40%（竖屏） | 侧边栏 /「split」配方 |
| `video-overlay` | 整个画布；卡片根元素应为透明 | 满幅出血视频上的毛玻璃 overlay |

你可以逐卡片混用配方 —— 根据当下最合适的情况选择 `card.zone`，然后在卡片之间为 `#video-wrap` 编写 GSAP tween。

#### 分镜渲染约定（Storyboard Render Contract）

`storyboard.json` 是 agent 内部的规划产出物 —— 没有任何 CLI 命令会解析它。它的存在是为了在你写每张卡片的 HTML 之前，把时间和内容上的决策明确下来。坚持使用下面这种 v3 风格的结构，这样同一份大纲就能驱动你在 Step 9 中组装的 composition。

必需的结构（完整示例见 Step 6）：

- `schemaVersion: 3`
- `composition: { fps, width, height, durationSeconds, layout, themeId, seed }` —— 注意 `durationSeconds`/`fps`/`themeId`/`layout` 位于 `composition` **内部**，**不在**顶层
- `videoTrack: { sourcePath, startSec, endSec, bounds? }` —— 视频边界默认为整个画布
- `subtitles: { enabled, ... }`
- `cards[]` —— 每张卡片都有 6 个必需字段：`id`、`intent`、`startSec`、`endSec`、`accentIndex`、`zone`、`contentHints`

规则：

- 卡片时间保持在 `composition.durationSeconds` 之内，并且除非有意为之，不应重叠（重叠时用 `data-track-index` 控制层叠顺序）。
- 视觉细节放在卡片 HTML 片段里（Step 8），**不要**放在 `contentHints` 里。`contentHints` 是你自己用来设计卡片的结构化提示；渲染出来的样子由 HTML 决定。
- 保持分镜结构稳定 —— 尽管没有东西会解析它，但你在编写 Step 8/9 时会回头读它，一致性能让卡片 ID 和时间保持同步。
- 「我选了 overlay × geom × clean」这类 agent 这一侧的决策**不属于** `storyboard.json` —— 把它们留在工作记忆里，在编写卡片 HTML + GSAP tween 时使用。

**与视频分享画布的卡片要用透明背景。** 当 GSAP tween 让视频在卡片后面 / 旁边保持可见时（overlay 配方、pip 配方，或任何 `card.zone = 'lower-third' | 'video-overlay'` 的时刻），卡片的 `.root` **绝不能**绘制一整块不透明的背景 —— 否则它会遮住视频。两种模式：

```css
/* Pattern A: transparent root, page body provides the cream backdrop */
html,
body {
  background: var(--bg);
}
.card[data-card-id="card-X"] .root {
  background: transparent;
}

/* Pattern B: explicit per-card background ONLY for fullscreen cards */
.card[data-card-id="card-hero"] .root {
  background: var(--bg);
}
.card[data-card-id="card-overlay"] .root {
  background: transparent;
}
```

对于 `side-panel` zone 的卡片（split 配方），card-host 本身就只占画布的一半，所以不透明的卡片背景没问题 —— 它只覆盖自己那一半。

### 8. 编写每张卡片的 HTML

为每张卡片创建 `$WORK_DIR/public/cards/{card-id}.html`。每个文件包含单个带根元素的 HTML 片段，遵循以下约定：

#### 卡片 HTML 约定

```html
<div class="card" data-card-id="{cardId}">
  <style>
    /* MUST: every rule starts with .card[data-card-id="{cardId}"] */
    .card[data-card-id="card-01"] .root {
      width: 100%; height: 100%;
      display: flex; ...;
      font-family: 'Caveat', 'LXGW WenKai TC', serif;
      color: var(--text);
      background: var(--bg);
    }
    .card[data-card-id="card-01"] .title { font-size: 84px; ... }
  </style>

  <div class="root">
    <h1
      id="card-01-title"
      data-anim="kinetic-chars"
      data-anim-at="0.3"
      data-anim-duration="0.5"
      data-anim-stagger="0.04"
      data-anim-pattern="pop"
    >
      <span class="char">S</span>
      <span class="char">u</span>
    </h1>
    <div
      id="card-01-line"
      data-anim="grow-x"
      data-anim-at="0.65"
      data-anim-duration="0.5"
      data-anim-target-w="420"
      style="width:0;height:8px;background:var(--accent-0);border-radius:4px;"
    ></div>
  </div>
</div>
```

**硬性规则**（`hyperframes` lint 会拒绝违规项）：

- 单一根元素 `<div class="card" data-card-id="{cardId}">`
- 内联 `<style>` 规则**必须**以上面的作用域选择器为前缀
- **不要用 `<script>` 标签**
- `src=` / `href=` 中**不要用外部 URL**（不用 CDN，不用远程字体）
- **不要用内联事件处理器**（`onclick=` 等）
- 所有素材都通过指向同一个 `public/` 目录的相对路径引用
- 颜色通过 `var(--accent-N)` 等方式引用，以便在不同主题间移植

**动画是声明出来的，不是写代码写出来的。** 只用 `data-anim-*` 属性；绝不写 `<script>` 来做动画。你会在 Step 9 中把每一条 `data-anim-*` 声明编译进唯一的主 GSAP timeline。

#### 卡片尺寸 —— 竖屏下移动端优先

10 个 `references/styles/*.html` 都是按 **1920×1080 横屏**预览来定尺寸的。当 `storyboard.layout = "portrait"`（1080×1920，社交 / 移动端的主流情况）时，**把所有视觉尺寸都放大** —— 手机屏幕离眼睛近，同样的像素数看起来比在横屏电视式画布上更小。

| token | 横屏基准 | **竖屏目标** | 缩放 |
| --- | --- | --- | --- |
| 标题（h1/h2 主视觉） | 64–96px | **88–132px** | ×1.35 |
| 细节 / 正文 | 24–30px | **30–40px** | ×1.30 |
| 引题 / 标签胶囊文字 | 14–16px | **18–22px** | ×1.30 |
| 时间码 / 元信息 | 12–14px | **16–18px** | ×1.30 |
| 数据块主数字 | 48–60px | **64–88px** | ×1.40 |
| 行高乘数 | 1.05–1.5 | 不变 | （不缩放） |

**经验法则：** `portraitPx = round(landscapePx × 1.3)`，然后向下取到附近的 4px 倍数，以保持视觉节奏。主标题最多可以放到 ×1.4；小号元信息文字保持在 ×1.2，避免拥挤。

竖屏下内边距要**稍微缩小** —— 卡片更窄，横屏那种大内边距（40–64px）会吃掉太多宽度。竖屏下使用 24–36px 的水平内边距。

如果你要做一张必须同时适配**两种**布局的卡片，与其写死尺寸，不如在卡片根元素上使用 `@container` 查询：

```css
.card[data-card-id="X"] .root {
  container-type: inline-size;
}
.card[data-card-id="X"] .title {
  font-size: clamp(64px, 8.5cqi, 132px);
}
.card[data-card-id="X"] .detail {
  font-size: clamp(24px, 3.2cqi, 40px);
}
```

不过对大多数卡片来说，只选一种布局就够了 —— 选出与分镜 `layout` 字段相匹配的那一列尺寸即可。

#### 可用的 `data-anim` 种类

这份清单是封闭的，而且是有意如此：卡片是一个 HTML 片段，本 skill 会在 Step 9 中把它的动效编译进共享的 overlay timeline（见那里的 GSAP 映射表）。这就是为什么本工作流不像各 composition 工作流那样去搜索 HyperFrames 组件 registry —— `npx hyperframes catalog` 返回的是自带 timeline 的独立 composition，而卡片没有地方挂载它们。下面这些种类表达不了的外观，就在卡片带作用域的 `<style>` 里用普通 CSS 实现。

| kind | 用于 | 关键参数 |
| --- | --- | --- |
| `fade-in` | 入场 | `at`、`duration`、`ease?` |
| `fade-out` | 退场 | `at`、`duration`、`ease?` |
| `slide-in` | 滑入入场 | `at`、`duration`、`from=left\|right\|top\|bottom`、`distance` |
| `kinetic-chars` | 逐字弹出 | `at`、`duration`、`stagger`、`pattern=pop\|fade` —— 元素需要有 `<span class="char">` 子元素 |
| `typewriter` | 逐字淡入 | 与 kinetic-chars 相同，但默认 stagger 更慢 |
| `count-up` | 数字滚动 | `at`、`duration`、`from`、`to`、`format=.0f\|.1f\|.2f\|,d` |
| `draw-path` | SVG 路径描绘 | `at`、`duration` —— 元素应为 `<path>` |
| `grow-y` | 柱高增长 | `at`、`duration`、`target-h`（px）—— 元素以 `height:0` 起始 |
| `grow-x` | 柱宽增长 | `at`、`duration`、`target-w`（px）—— 元素以 `width:0` 起始 |
| `scale-pop` | 弹出入场 | `at`、`duration` |
| `blur-in` | 失焦 → 对焦 | `at`、`duration` |
| `mask-reveal` | 裁切揭示 | `at`、`duration`、`direction=left\|right\|top\|bottom` |
| `morph-to` | tween 任意 CSS | `at`、`duration`、`props='{...JSON...}'` |

`data-anim-at` 是**相对于卡片 startSec 的秒数** —— 在 Step 9 中把每条声明编译进 GSAP timeline 时，加上卡片的 `startSec` 得到绝对时间，并量化到 1/fps。

### 9. 组装 Composition HTML

准备好素材，然后写出 `$WORK_DIR/public/index.html`：

```bash
# SKILL_DIR is injected by the host ("Base directory for this skill: …")
SKILL_DIR="<SKILL_DIR>"

mkdir -p "$WORK_DIR/public/fonts" "$WORK_DIR/public/vendor" "$WORK_DIR/public/cards"
cp -n "$SKILL_DIR/assets/fonts/"*            "$WORK_DIR/public/fonts/"
cp -n "$SKILL_DIR/assets/vendor/gsap.min.js" "$WORK_DIR/public/vendor/"
# stage the input video — RE-ENCODE with dense keyframes. Sources with a sparse GOP
# (keyframe interval > ~1s) freeze on seek in the renderer (a frozen frame under the
# overlays); -g / -keyint_min set to your composition fps make every frame seekable.
# (Set both to your fps — 30 shown; use 24/25/60 to match.)
ffmpeg -y -i "$VIDEO_PATH" -c:v libx264 -crf 18 -g 30 -keyint_min 30 \
  -pix_fmt yuv420p -movflags +faststart -c:a aac "$WORK_DIR/public/input-video.mp4"
```

#### Composition 模板

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: "Caveat";
        src: url("fonts/Caveat-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Caveat";
        src: url("fonts/Caveat-700-latin.woff2") format("woff2");
        font-weight: 700;
        font-display: block;
      }
      @font-face {
        font-family: "LXGW WenKai TC";
        src: url("fonts/LXGWWenKaiTC-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Inter";
        src: url("fonts/Inter-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Inter";
        src: url("fonts/Inter-700-latin.woff2") format("woff2");
        font-weight: 700;
        font-display: block;
      }
      @font-face {
        font-family: "Virgil";
        src: url("fonts/Virgil.woff2") format("woff2");
        font-display: block;
      }

      :root {
        /* Pick from the themeId palette table in Step 7 — example: classic */
        --bg: #fff9e3;
        --text: #1e1e1e;
        --accent-0: #1971c2;
        --accent-1: #e03131;
        --accent-2: #2f9e44;
        --accent-3: #e8590c;
        --accent-4: #9c36b5;
        --font-family: "Caveat", "LXGW WenKai TC", serif;
      }
      * {
        box-sizing: border-box;
      }
      /* Body font-family MUST list concrete font names (not just var(--font-family)) —
   the HyperFrames renderer's static analyzer doesn't expand CSS variables when
   resolving fonts, so a var-only chain triggers `font_family_without_font_face`
   lint and falls back to a generic. Use the concrete chain here; cards that
   want the theme font can still reference var(--font-family) internally. */
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
        font-family: "Inter", "Caveat", "LXGW WenKai TC", ui-sans-serif, system-ui, sans-serif;
      }
      #stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      /* video-wrapper holds the source video. Its position / size are animated
   over time by the master timeline (one tween per layout transition). */
      .video-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        border-radius: 0;
        box-shadow: none;
      }
      .video-wrapper video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .card-host {
        position: absolute;
        pointer-events: none;
        overflow: hidden;
      }
      .card-host .card {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .card-host .char {
        display: inline-block;
        visibility: visible;
      }

      /* Subtle drop shadow + rounded corners for non-fullscreen video framings */
      .video-wrapper.framed {
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
      }
    </style>
  </head>
  <body>
    <div
      id="stage"
      data-composition-id="talking-head-recut"
      data-start="0"
      data-duration="121.2"
      data-fps="30"
      data-width="1920"
      data-height="1080"
    >
      <!-- Layer 1: source video — initial position matches card-01's layout -->
      <div class="video-wrapper" id="video-wrap">
        <video
          id="bg-video"
          src="input-video.mp4"
          playsinline
          data-has-audio="true"
          data-start="0"
          data-duration="121.2"
          data-track-index="1"
        ></video>
      </div>

      <!-- Layer 2: each card-host sits at the bounds dictated by its layout. -->
      <!-- IMPORTANT: every card-host MUST carry BOTH "card-host" and "clip" classes. -->
      <!--   - "card-host"  → our positioning + pointer-events styles                 -->
      <!--   - "clip"       → the marker Studio and the linter use to recognise a     -->
      <!--                    clip. Visibility itself comes from data-start /         -->
      <!--                    data-duration, which the runtime honours with or        -->
      <!--                    without this class                                      -->
      <!--                    (lint: timed_element_missing_clip_class, a warning).    -->
      <!-- Example: card-01 with zone="fullscreen" → card-host covers (0,0,1920,1080) -->
      <div
        class="card-host clip"
        data-card-id="card-01"
        data-start="1.0000"
        data-duration="6.5000"
        data-track-index="2"
        style="left:0;top:0;width:1920px;height:1080px;visibility:hidden;opacity:0;"
      >
        <!-- paste the contents of public/cards/card-01.html here -->
      </div>

      <!-- Example: card-02 with zone="side-panel" (split composition layout) → card on left half -->
      <div
        class="card-host clip"
        data-card-id="card-02"
        data-start="8.0000"
        data-duration="12.0000"
        data-track-index="2"
        style="left:0;top:0;width:960px;height:1080px;visibility:hidden;opacity:0;"
      >
        <!-- card-02 HTML -->
      </div>

      <!-- ...one "card-host clip" per card with inline bounds matching resolveZoneBounds(card.zone)... -->

      <script src="vendor/gsap.min.js"></script>
      <script>
        (function () {
          // count-up formatter helper
          window.__fmt = function (v, fmt) {
            if (typeof fmt === "string" && /^\.[0-9]+f$/.test(fmt)) {
              return Number(v).toFixed(Number(fmt.slice(1, -1)));
            }
            if (fmt === ",d") return Math.round(v).toLocaleString();
            return String(Math.round(v));
          };

          const tl = window.gsap.timeline({ paused: true });

          // ── Card lifecycle (one block per card) ──
          // Example for card-01 [1.0, 7.5] with kinetic-chars at +0.3, grow-x at +0.65:

          // Enter (fade in over 0.4s)
          tl.set('.card-host[data-card-id="card-01"]', { visibility: "visible" }, 1.0);
          tl.fromTo(
            '.card-host[data-card-id="card-01"]',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" },
            1.0,
          );

          // Card-internal anims (compile each data-anim-* declaration here)
          tl.from(
            '.card[data-card-id="card-01"] #card-01-title .char',
            { opacity: 0, y: 8, scale: 0.8, duration: 0.5, ease: "power2.out", stagger: 0.04 },
            1.3,
          );
          tl.fromTo(
            '.card[data-card-id="card-01"] #card-01-line',
            { width: 0 },
            { width: 420, duration: 0.5, ease: "power2.out" },
            1.65,
          );

          // Exit (fade out over 0.35s, ending at endSec)
          tl.to(
            '.card-host[data-card-id="card-01"]',
            { opacity: 0, duration: 0.35, ease: "power2.in" },
            7.15,
          );
          tl.set('.card-host[data-card-id="card-01"]', { visibility: "hidden" }, 7.5);

          // ── Video framing transitions ──
          // When the next card uses a different composition layout, animate the
          // video-wrapper to its new bounds. Example: card-01 = fullscreen
          // (video hidden behind), card-02 = split composition (zone="side-panel"
          // → video on right, card on left).

          // Card-02 enters at 8.0s with the split composition. Animate video to
          // the right half during the card-01 → card-02 gap (between 7.5 and 8.0s).
          tl.set("#video-wrap", { className: "video-wrapper framed" }, 7.5);
          tl.to(
            "#video-wrap",
            { left: 960, top: 0, width: 960, height: 1080, duration: 0.6, ease: "power2.inOut" },
            7.5,
          );

          // Card-02 enter — same pattern as card-01
          tl.set('.card-host[data-card-id="card-02"]', { visibility: "visible" }, 8.0);
          tl.fromTo(
            '.card-host[data-card-id="card-02"]',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" },
            8.0,
          );
          // ...card-02 internal anims...

          // ── repeat for each card; if the NEXT card's layout differs,
          //    insert another tl.to('#video-wrap', ...) tween before its enter ──

          window.__timelines = window.__timelines || {};
          window.__timelines["talking-head-recut"] = tl;
        })();
      </script>
    </div>
  </body>
</html>
```

#### GSAP 语句速查表

把每个 `data-anim` 属性编译成一条 GSAP 语句。时间是**绝对秒数** = card.startSec + data-anim-at，量化到 1/fps。选择器是 `.card[data-card-id="X"] #elementId`。

| data-anim | GSAP 语句模板 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fade-in`                       | `tl.fromTo(SEL, { opacity: 0 }, { opacity: 1, duration: D, ease: 'power2.out' }, T);`                                                                                                                              |
| `fade-out`                      | `tl.to(SEL, { opacity: 0, duration: D, ease: 'power2.in' }, T);`                                                                                                                                                   |
| `slide-in` (from=left, dist=80) | `tl.fromTo(SEL, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: D, ease: 'power2.out' }, T);`                                                                                                                |
| `kinetic-chars` (pop)           | `tl.from(SEL + ' .char', { opacity: 0, y: 8, scale: 0.8, duration: D, ease: 'power2.out', stagger: S }, T);`                                                                                                       |
| `count-up`                      | `(function(){const o={v:FROM};tl.to(o,{v:TO,duration:D,ease:'power2.out',onUpdate:function(){const el=document.querySelector(SEL);if(el)el.textContent=__fmt(o.v,'FMT');}},T);})();`                               |
| `draw-path`                     | `(function(){const el=document.querySelector(SEL);if(el){const L=el.getTotalLength();tl.set(SEL,{strokeDasharray:L,strokeDashoffset:L},T);tl.to(SEL,{strokeDashoffset:0,duration:D,ease:'power2.inOut'},T);}})();` |
| `grow-x` (target-w=W)           | `tl.fromTo(SEL, { width: 0 }, { width: W, duration: D, ease: 'power2.out' }, T);`                                                                                                                                  |
| `grow-y` (target-h=H)           | `tl.fromTo(SEL, { height: 0 }, { height: H, duration: D, ease: 'power2.out' }, T);`                                                                                                                                |
| `scale-pop`                     | `tl.fromTo(SEL, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: 'back.out(1.6)' }, T);`                                                                                                     |
| `mask-reveal` (direction=left)  | `tl.fromTo(SEL, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', duration: D, ease: 'power2.inOut' }, T);`                                                                                         |

量化：`T = Math.round(absSec * fps) / fps`。在 30fps 下最小步长是 `1/30 ≈ 0.0333s`；在 JS 字面量里四舍五入到 4 位小数（`.toFixed(4)`）就可以了。

#### 视频取景参考（按 `layout` 值）

视频容器的选择器是 `#video-wrap`。用 `tl.to('#video-wrap', { ...bounds }, T)` 在卡片之间为它的边界做动画。初始边界应在元素上以内联方式设置，与 card-01 的布局相匹配。转场时长选 0.5–0.7 秒，配合 `ease: 'power2.inOut'`。

**装饰性画框**（`clean` / `hairline` / `polaroid`）作为 `#video-wrap` 的**同级元素**存在，并在布局转场中跟随它移动。参见 [`references/frames/`](references/frames/)，了解每种画框的摆放 HTML、建议的 CSS，以及它适合搭配哪些布局。速记规则：`overlay` 布局不使用装饰性画框（满幅出血的视频与装饰外框相冲突）；PiP 布局已经有自己的药丸框处理（圆角 + 白色描边环 + 阴影），所以只在 `split` / `stack` 之上添加装饰性画框。

各 composition 布局下 `#video-wrap` 的 **GSAP 目标查找表**（横屏 1920×1080；竖屏见 `references/layouts/*.html`，4:5 则按上文描述的比例缩放从竖屏推出）：

| composition 布局 | 典型 card.zone | `#video-wrap` GSAP 目标 | 额外的 css class |
| --- | --- | --- | --- |
| `split` | `side-panel` | `{ left: 960, top: 0, width: 960, height: 1080 }` | — |
| `stack` | `lower-third` | `{ left: 14, top: 14, width: 1892, height: 548 }`（上部 52%） | — |
| `pip`（右下角） | `fullscreen` | `{ left: 1480, top: 760, width: 400, height: 300 }` | `pip-pill`（圆角 + 描边环 + 阴影） |
| `pip`（左上角） | `fullscreen` | `{ left: 40, top: 40, width: 400, height: 300 }` | `pip-pill` |
| `overlay`（视频满幅出血） | `video-overlay` | `{ left: 0, top: 0, width: 1920, height: 1080 }`（与默认值相同，不变） | — |
| **隐藏视频**（纯图形时刻） | `fullscreen` | `{ opacity: 0 }`（或移出画布） | — |

在进入或离开画中画时刻时，切换 pip-pill 装饰（圆角 + 白色描边环 + 投影）：

```js
// Enter pip — add chrome
tl.set("#video-wrap", { className: "video-wrapper pip-pill" }, T);
tl.to(
  "#video-wrap",
  { left: 1480, top: 760, width: 400, height: 300, duration: 0.6, ease: "power2.inOut" },
  T,
);

// Leave pip — back to clean full-bleed
tl.set("#video-wrap", { className: "video-wrapper" }, T_NEXT);
tl.to(
  "#video-wrap",
  { left: 0, top: 0, width: 1920, height: 1080, duration: 0.6, ease: "power2.inOut" },
  T_NEXT,
);
```

**card-host 的边界与 zone 相匹配。** 用 Step 6 开头的表把卡片的 `zone` 解析为像素边界，然后写进 card-host 的内联 `style="left:Xpx;top:Ypx;width:Wpx; height:Hpx;..."`。对于 `video-overlay` zone（overlay 配方），card-host 铺满整个画布 —— 由你在 `.card .root` 里写的 CSS 决定实际可见的卡片位于何处。

#### HyperFrames 布局 / 动画 QA 规则

- 先为每张卡片搭好静态的主视觉帧：卡片完全可见、可读的那一刻。
- 确认视频、卡片、字幕和图示之间没有意外的重叠。
- 确认被隐藏的视频区域被画框裁切掉，不会在预期边界之外露出来。
- 注册一个暂停的主 timeline，命名为 `window.__timelines["talking-head-recut"]`。
- 在页面加载时同步构建 timeline；不要用 `async`、`setTimeout`、Promise 或媒体的 `play()` 调用。
- 不要在渲染路径中使用 `Math.random()` 或 `Date.now()`。
- 只有在有限的根 `data-duration` 之下才允许 `repeat: -1`；对于必须更早结束的循环，根据视频时长计算出有限的重复次数。
- 做动效时，优先使用 GSAP 的变换和透明度（`x`、`y`、`scale`、`rotation`、`opacity`），而不是布局属性（`top`、`left`、`width`、`height`）。
- 对 `#video-wrap` 这样的包装层做动画，而不是直接改视频元素的尺寸。
- 避免在同一时间从多个 timeline 对同一元素的同一属性做动画。
- 用 `data-track-index`，不要用 `data-layer`；用 `data-duration`，不要用 `data-end`。
- 每个带时间的元素（`card-host`、sub-composition 等）都应在自身的 class 之外再加上 `class="clip"` —— 例如 `class="card-host clip"`。可见性本身由 `data-start` / `data-duration` 驱动：无论有没有这个 class，运行时都会把每个 `[data-start]` 元素限制在它的时间窗口内。`.clip` 是 Studio 和 GSAP clip 归属规则用来识别 clip 的标记，所以漏掉它会让元素更难编辑、也更难 lint（lint：`timed_element_missing_clip_class`，一个警告）。
- 对于 body / 全局的 `font-family`，列出**具体的字体名**（`'Inter', 'Caveat', …`）—— 而不是 `var(--font-family)` 这样的 CSS 变量。HyperFrames 的字体解析器在静态分析时不会展开 CSS 变量（lint：`font_family_without_font_face`）。卡片内部仍然可以使用 `var(--font-family)`，因为它们的 `@font-face` 声明已经加载了。

### 10. 渲染为 MP4

```bash
cd "$WORK_DIR"
PRODUCER_BROWSER_GPU_MODE=hardware npx hyperframes render public \
  --skill=talking-head-recut \
  -o output.mp4 \
  --fps 30
```

`hyperframes render <dir>` 读取 `<dir>/index.html` 并生成 MP4。源节目音频保留在 `#bg-video` 上，所以渲染出的 MP4 无需手动重新封装就保留了口播音频。在 macOS 上强烈建议使用 `PRODUCER_BROWSER_GPU_MODE=hardware`（或 `--browser-gpu`）这个标志 —— 纯软件的 Chrome 渲染在大多数笔记本上都会超时。

在完整渲染之前做个健全性检查，可以在某个特定时间戳截取单帧：

```bash
npx hyperframes snapshot public --at 5    # → public/snapshots/frame-00-at-5s.png (a single --at ignores --out)
```

### 11. 汇报结果

告诉用户：

- 工作目录路径
- `storyboard.json`（你设计的卡片大纲）
- `public/cards/*.html`（每张卡片一个 HTML）
- `public/index.html`（组装好的 composition）
- `output.mp4`（最终视频）
- 使用的 ASR 提供方
- 卡片数量 + 你是如何选定它们的（1 句话）
- 任何缺失的 key 或质量上的注意事项

**可选的实时预览（仅在用户要求时）。** 片段在 `public/index.html` 里原样播放，overlay 叠在上面，所以预览是忠实的。**运行过程中不要打开它。** 当用户要求时，在渲染**之后**启动一个长期运行的服务器，并汇报 URL：

```bash
(cd "$WORK_DIR/public" && npx hyperframes preview --background)   # or `npx hyperframes play` for a shareable link
```

除非用户要求，否则不要删除工作目录。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/DESIGN_INDEX.md](references/DESIGN_INDEX.md) —— V—Take 视觉设计库
