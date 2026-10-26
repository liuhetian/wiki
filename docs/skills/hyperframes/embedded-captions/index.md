---
name: embedded-captions
description: >
  给现有的单人口播视频加字幕，不剪辑原片。用于普通的逐字字幕、嵌在主体身后的电影感字幕、VFX 字幕、「炸/特效/酷炫字幕」，或者 35 种风格目录里点名的某个风格（identity）。按视觉风格路由，而不是按后端引擎路由。默认是安静的 `anchor` rail；只有用户明确想要全程电影感处理时，才把每个词都嵌入。整个工作流从头到尾在本地运行，包括转录和主体抠像；多镜头素材要先拆分再使用。
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update embedded-captions`。一切都是最新时它会快速空跑；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再依赖它们。

# Embedded Captions（嵌入式字幕）

**一份目录，开头就选定**（[CATALOG.md](CATALOG.md) —— 35 种风格（identity）；它背后的引擎属于后端细节）。**Standard**（默认）构建一条干净的逐字 **rail**（字幕轨：承载大部分文字的 lower-third 字幕）+ 一个**嵌入**高潮，在峰值处合成*进*主体身后的场景里。**Cinematic** 是纯嵌入 —— 没有 rail，每条字幕都合成在主体身后（hero 排版、累积、以遮挡本身作为效果）。**Theme** 是一套完整的主题化视觉宪章 —— body 范式 × hero setpiece × 前景特效（front fx）× plate 反应，从各个 registry 组合而成（[themes/README.md](themes/README.md)）：`ordnance` `terminal` `neonsign` `stardust` `stomp`。大多数讲解 / 旁白用 **Standard**；**嵌入是稀缺的、要挣来的峰值** —— 把每个词都嵌入是常见错误；Theme 用于 VFX 级别的需求（"炸"、"特效"、"像 AE 做的"）。

---

## 运行前提

插件安装使用随附的、由 manifest 固定版本的 CLI 来做抠像、转录和渲染；不需要源码 checkout。本地预览和字幕测量辅助脚本还需要 Sharp、Puppeteer（连同它的 Chromium 浏览器）和 GSAP。把它们装在**字幕项目**里，不要装进只读的插件内部：

```bash
npm install --prefix <project> --save-dev --save-exact sharp@0.35.3 puppeteer@25.8.0 gsap@3.15.0
```

保留项目的 lockfile。如果这些依赖已经存在，就使用它锁定的版本，不要覆盖。Bash 和 FFmpeg/ffprobe 必须在 PATH 上。抠像和转录在首次使用时可能会下载各自的模型。

渲染会等 CLI 成功退出后才开始合成。旧的 `HF_TIMEOUT_S` shell 看门狗已不再使用：一个很大的半成品文件并不能证明渲染已经完成。显式传入已构建 checkout 的参数，或设置 `HYPERFRAMES_ROOT`，会选用贡献者 CLI 而不是插件固定的版本。渲染卡住时，正常地通过 CLI / 终端取消；字幕辅助脚本不会强杀渲染进程，也不会从进程快照中恢复渲染。

## 操作流程（TL;DR）

经由 `/hyperframes` 路由过来时，意图层只确认输入（哪一段素材），并把风格选择作为延后提问**预告**出来 —— 候选短名单需要先探测素材，所以它留在下面的第 1 步；意图层关于运行形态的问题在这里不适用（原片不做改动，也没有分镜需要审阅）。如果有 `BRIEF.md`，它承载已确认的输入和用户的备注 —— 先读它。

下面的工艺说明很长；**管线本身很短** —— 而且所有确定性的部分都是计算或编译出来的，绝不手写：

1. **决策闸门**（拒绝不合格的素材）→ **从 [CATALOG.md](CATALOG.md) 里选定一个风格**（35 种风格；引擎 / 编译器通过查表得出 —— 绝不要抛出模式 / 类别的问题）
2. `hyperframes init`（如果项目目录已经存在且视频就在里面，就跳过 —— `matte.cjs`/`transcribe.cjs` 会把目录里的任意视频认作 source.mp4）→ **`bash scripts/prepare.sh <project>`**（matte ∥ 转录 ∥ 音频包络并行，然后跑带场景色板 / 光学 / 光照的 safe-zones v2 —— 一条命令，什么都不会漏）
3. **编写一个记录创意选择的小 JSON**（先读 `safe-zones.json`）：Cinematic → `cinematic.json` → `make-cinematic.cjs`（推导出 `plan.json` 并编译它）；Theme → `theme.json` → `make-theme.cjs`（rail/panel/poem/takeover 范式；`anchor` 是安静的 rail 默认选项）
4. **视觉 QA**：`node scripts/preview-frames.cjs <project>` → 每帧约 2s 出一张忠实的合成预览（不用渲染）。在花钱渲染之前先对照 § Visual QA 检查。
5. `render-and-composite.sh` → 闸门（时间 / 遮挡 + hero / 溢出 / 交接）→ `final.mp4`

大家容易漏掉的关键规则：

- **rail（默认）+ 嵌入（提升）。** `drop`（填充词，不显示）/ `rail`（逐字的 lower-third 字幕，在前景，承载大部分文字）/ `embed`（一个峰值词，合成在主体身后）。**Standard 模式两者都做**，只嵌入峰值。见 **§ Caption model**。
- **视频原样交付，不做改动（Standard/Cinematic；**Theme 模式的 PLATE 预算是唯一获准的例外** —— 受语域闸门控制的反应拍（charge-dim、punch、shake、grain），按每个主题的 DNA 定义，并在 matte 合成之后施加，使主体 + 文字 + plate 作为一帧整体运动）** —— 字幕是唯一添加的东西；matte 只是让主体能遮挡嵌入轨。绝不对原片做调色 / 重新上色 / 加扫描线。
- 两本规则手册：**rail → [references/rail.md](references/rail.md)**（薄），**嵌入工艺 → [references/composition-craft.md](references/composition-craft.md)**（厚，只管嵌入）。按需略读。

---

## Caption model —— rail + 嵌入

每一句说出来的话都是以下三者之一：

| | 是什么 | 如何显示 |
| --- | --- | --- |
| **drop** | 填充词 —— um/uh、口吃、自我纠正 | 不显示 |
| **rail** | 默认 —— 普通的口述内容（逐字照录） | 干净的 lower-third 字幕，**在前景**，清晰可读。一个有力的词可以获得行内的 `emphasis` 高亮（强调色 / 当前词弹出）—— 它仍然留在 rail 上。 |
| **embed** | 被提升的峰值 —— 标题那一拍 | 一个大号的词，合成在**主体身后**（matte 遮挡），有设计过的入场 + 退场 |

**rail 承载大部分文字；嵌入是稀缺的、要挣来的峰值。** 稀缺性是**按段落节拍 / 文字块算的，不是按整段素材算的**：每个块（一个意群）≤1 个 hero，绝不两个同屏可见，hero 窗口之间至少隔开一拍的留白（低于 0.6s 编译器会警告）。短素材 → 通常 1–2 个；长讲解 → 大约每节一个。多个 hero 当中，**作者写得最大的那个是 APEX**（只有它获得完整的 lockup 嵌入 + 按宽度放大）；较小的是 **MINOR 峰值**，以超大的强调行留在它们的栏里（fg，抑制过的动效）—— 不是每一拍都需要 matte 展示，正是这一点让 apex 始终是一个事件。把每个词都嵌入仍然是常见错误。

rail-surface 类风格恰好就是这样构建的（rail = `rail.html`，嵌入 = `index.html` 里的高潮）。column-flow 类风格去掉 rail，把一切都做成嵌入式 —— 只在要氛围胜过逐字的需求时推荐它们，绝不用于词必须读得清的讲解 / 旁白（CATALOG.md 对每个风格都写明了这一点）。

---

## Step 0 —— 从 CATALOG 里选定一个风格

**一个前端，背后三个引擎。** 用户从 [CATALOG.md](CATALOG.md) 里选一个风格（IDENTITY）（35 条：10 个经典 + 25 个主题化）；引擎、编译器和编写文件都由目录那一行查表得出。**绝不要把「Standard vs Cinematic vs Theme」作为问题抛出来** —— 那些是后端名称（一个产品即使有好几个引擎，也只有一种 UX）。目录编码了路由所需的一切：阅读载体（reading surface）、气质（voice）、推荐用途、场景需求，以及真正相近的几对之间的辨析说明（loud↔ordnance、neon↔neonsign、cream↔stardust）。

风格选择是一道**偏好闸门**（`../hyperframes/references/brief-contract.md` § 1）：在自主模式下（"surprise me" / "decide for me"），自己从短名单里选，并用一行说明理由，而不是去问。

流程：探测素材 → 从目录里列出 2–3 个候选风格 → 推荐其中一个并附一行理由 → **用户来选**（自主模式：你来选，并说明理由）→ 编写该风格的文件。风格与引擎锁定（不能交叉组合；开启一个新组合是一次验证事件 —— 见 dna/README.md）。

**编写之前，始终先给出你的推荐，让用户来选。** 不要悄悄套用默认值。

（完整的风格表在 [CATALOG.md](CATALOG.md) 里 —— 它是路由的唯一事实来源。下面的引擎文档描述每个后端的编写契约。）

**在这里，CATALOG.md 就是全部的选择空间：这个工作流不搜索 HyperFrames 的 component registry。** 各个 composition 工作流在编写某个有名字的外观之前会运行 `npx hyperframes catalog`；这个工作流绝不能这么做。它的引擎是锁定的编译器，消费 `cinematic.json` / `theme.json` 并自行产出 composition，所以 registry 里的条目 —— 包括那些 `caption-*` block —— 没有地方可以挂载。registry block 是在一块设计好的画布上给文字定样式；这个 skill 是透过 matte 把字幕烧进别人的素材画面里。当没有任何风格符合需求时，就直说，并挑最接近的那个，而不是跑到目录之外去找。

**推荐启发法**：用 [CATALOG.md](CATALOG.md) 里的「Shortlisting heuristics」—— 它们是风格层面的（例如 "炸" 会列出 ordnance/stomp/terminal/loud，再按什么应该爆开来选），绝不是类别层面的。拿不准 → `anchor`。

- **Cinematic** → 为锁定模板编写 `cinematic.json`，由 `make-cinematic.cjs` 编译。
- **Theme** → 读 [themes/README.md](themes/README.md)，编写 `theme.json`，运行 `scripts/render-theme.sh`（编译 + 渲染 + plate 反应 → **final_fx.mp4**）。

---

## 决策闸门 —— 最先运行

在进入任何一种模式之前，先探测视频并给场景分类。

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

看这些采样帧。出现以下情况就拒绝：

- 多人说话 / 硬切（拆开后逐镜头渲染，或者拒绝）
- 没有人类主体（本 skill 是给口播用的）
- 不足 3 秒、**没有说话**，或者脸始终看不清 —— 音频接近静音时 `transcribe.cjs` 会发出警告（Whisper 会在静音上幻听出 "Thank you." 之类的词）；**重视这个警告并拒绝**，而不是给捏造出来的词上字幕
- **源视频已经带有烧录的字幕 / 大量文字图形** —— 再加一套字幕系统会冲突，而原片必须原样交付（不做遮盖 / 修补）。烧录文字常常只在素材中段出现：采一张 **1fps 的联系表**（`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`），不要只信 3 个抽样帧。
- **转录稿是乱码** —— 非母语 / 口音很重的语音可能被转录成看似自信的胡言乱语。编写前先通读检查 `transcript.json`；如果它读起来不成语言，就用 `WHISPER_MODEL=medium` 重试一次，否则拒绝（一条全是捏造词的逐字 rail 比没有字幕更糟）。
- 手持晃动严重、运动很快（matte 会闪烁）

### 预检探测（零成本，能防住最糟的失败）

1. **切镜探测。** 在 20%、50%、80% 处采样帧。如果出现了不同的主体 / 场景，就在切点之前**裁剪素材**。
2. **Letterbox / pillarbox 探测。** 第一帧有黑边吗？计算出安全的内容矩形，把字幕位置限制在它里面。
3. **亮度探测。** 采样字幕区域的平均亮度 —— `under 60` → 浅色文字原样可读，`60-180` → 加字形衬底（scrim），`180+` → 不透明文字 + 衬底（绝不用裸的浅色文字）。**Cinematic 模板是奶油色 + `screen`，且是锁定的（LOCKED）** —— 用这个探测来*挑一个合适的风格*（明亮场景 → `ink`，或不透明 rail 的 `anchor` 主题），绝不用它来给某个风格重新上色。
4. **按语气推荐风格（你来推荐；用户来选 —— 见 Step 0 + CATALOG.md）。** 讲解 / 访谈 / 词必须读到 → rail/panel-surface 类风格；诗意 / 社交 / "电影感" → 按语域选 column-flow 类风格；"炸 / 特效 / VFX" / 点名的世界观 → 主题化风格。拿不准时 → `anchor`（词能读到，场景安全）—— 但要给出短名单，让用户来选。

---

## 管线 —— 5 步

```
1. hyperframes init <project> --non-interactive --video <video.mp4> --skill=embedded-captions
2. bash scripts/prepare.sh <project>       # matte ∥ transcribe (parallel) → safe-zones. One command.
                                           #   → frames_fg/ transcript.json safe-zones.json
3. [AGENT STEP — the only creative step] author a small JSON; see below by mode
   Cinematic: author cinematic.json → node scripts/make-cinematic.cjs <project>
   Theme:     author theme.json → bash scripts/render-theme.sh <project>   (compiles + renders + plate fx)
4. node scripts/preview-frames.cjs <project>   # ~2s/frame composite previews → § Visual QA (BEFORE the render)
5. bash scripts/render-and-composite.sh <project>  # gates → final.mp4 + history/ snapshot
   (Theme mode: SKIP steps 3b/5 — render-theme.sh already runs compile + render-and-composite
    + _postfx.sh; the deliverable is final_fx.mp4, final.mp4 is pre-plate-reaction)
```

第 1 步的 `init` 会把已安装的 skill 和 GitHub 上的最新版本对比，如果有过期的，就更新全局的那一套。

第 3 步因模式而异：

### Step 3 —— Cinematic 模式（纯嵌入）

1. **先读 `safe-zones.json`。** 旁白 plane 放在 **`zones.hugLeft`/`hugRight`** —— 紧贴人物轮廓的干净条带（离身体很远的文字读起来是漂浮的，而不是嵌入的；远角是兜底，不是默认）。hero 默认用 `heroAnchor`/`heroBands.best`（居中压在主体上，遮挡约 30–55%）。`recommendation:"fg"` 会为了可读性把旁白移到前景；**只要 `heroBands.feasible`，hero 就保持嵌入** —— hero 放 fg 是最后手段。
2. **DNA 就是你在 Step 0 选的那个风格**（CATALOG.md）—— 不要在这里重新打开这个选择。拿它和场景做一次合理性检查（hero 横带亮度 > 150 就该用 `ink`；完整的选择指引在目录里，覆盖全部十个，包括 neon / glitch / chrome / velocity）。说明你的选择 + 理由；由用户决定。DNA 锁定字体 / 色板 / 混合模式 / 动效 + hero 三幕；safe-zones v2（`palette`/`optics`/`lighting`）会自动把它参数化到这个场景。
3. **编写 `<project>/cinematic.json`** —— `"dna": "<name>"` + 意群块（thought-BLOCK），而不是原始的 group：每个块 = 若干行词（在分句边界处按 2–5 个一组）+ 它所堆叠进的 plane + 每行的 `css`（只管 size/weight/style —— 不管位置）+ 至多一行标记为 `"hero": true`（被提升的词；`"text"` 用于显示形式）。Schema：`scripts/make-cinematic.cjs` 文件头。
4. **编译**：`node scripts/make-cinematic.cjs <project>` —— 把块降级为 → plan.json → index.html。自动为你生成：按转录稿排序的时间、块内累积、块间翻页、**hero LOCKUP**（hero 块的前置上下文、HERO 和后置上下文作为一个紧密结合的构图叠放，居中在主体上 —— 从上到下的阅读顺序天然等于说话顺序；上下文浮在前景，hero 嵌在身后 = 纵深三明治；一条体量规则保证 hero 压得住它的上下文）、apex/minor hero 拆分、**天然正确的阅读顺序**、按 safe-zones 的 fg 兜底。然后照常跑各道闸门。*（对于块表达不了的设计，仍然可以直接手写 plan.json —— 那就自己运行 `fill-timings.cjs` + `fit-fonts.cjs` + `make-composition.cjs`。）*

### Step 3 —— Theme 模式（主题化视觉宪章）

**先读 [themes/README.md](themes/README.md)** —— 范式 / setpiece 的 registry、联动、硬规则，以及确切的 `theme.json` schema。

1. **按内容语域挑一个主题 DNA**（每个 `themes/<name>.json` 都有 `voice` + `when`）。说明你的选择 + 理由；由用户决定。
2. **编写 `<project>/theme.json`** —— `dna`、`lines`（逐字照录，按转录稿顺序；每行 1–5 个词 —— 对于 `takeover`，每行是一张 CARD（卡片））、`minors`（强调词）、`hero:{match}`（高潮词 / 短语；对于嵌入类 setpiece，不要把它放进 `lines`；对于行内 setpiece 和 panel+redact，要留在里面）。
3. **渲染**：`bash scripts/render-theme.sh <project>` —— 编译（编译时有逐字完整性闸门）、渲染两个图层、合成、施加 plate 反应 → `final_fx.mp4`。在编译和渲染之间用 `preview-frames.cjs` 做视觉 QA。

---

## Visual QA —— 渲染之前先预览

`node scripts/preview-frames.cjs <project> [t…]` 合成出**忠实的预览帧，每张约 2s**（字幕图层在 seek 时刻截图 + 真实视频帧 + matte 遮挡 + rail overlay = 最终合成在那一刻的样子）。默认采样 = 每个 group / 高潮窗口。完整渲染要花好几分钟 —— 绝不要用它来*发现*布局问题。

对照下面这份清单检查预览（`<project>/preview/sheet.png`）—— 这些是几何闸门**抓不到**的失败：

1. **被冲淡** —— 浅色文字压在明亮区域上（窗户 / 招牌 / 天空）：读不清 → 挪动 plane，或换 DNA / 模式（明亮场景 → `ink`）。
2. **文字叠文字** —— 字幕压在场景自带的文字 / 图形上，或者两个字幕组相撞。
3. **阅读顺序** —— 屏幕上的竖直顺序必须和说话顺序一致；hero 不能位于更晚说出的词下方。
4. **Hero 存在感** —— 高潮应该很大，并且明显在主体身后（遮挡约 30–55%），而不是边距里一个漂浮的标签。
5. **平衡** —— 一个连贯的栏 / 横带，而不是零散的碎片；边距留有呼吸空间；没有任何东西被裁切。

然后是 [references/reference-bar.md](references/reference-bar.md) 里的 **5 项正向检查**（海报测试 · 怯场测试 · 一眼层级 · 场景握手 · 死寂时段审查）—— 失败清单保证渲染不坏；正向清单才让它显得*经过设计*。两者都通过再交付。

**新鲜视角审阅（凡是面向用户的都推荐做）：** 你对自己的布局有确认偏误。如果你能派生子 agent，只给它预览图 + 这份清单，让它逐帧给出 PASS/FIX 判定（"review these caption previews against the 5-point checklist; answer PASS or the specific fix per frame"）。在 cinematic.json / theme.json 里修正，重新编译，重新预览 —— 每一轮只花几秒。等预览都通过了，再渲染一次。

---

## DNA registry —— 十种视觉语言（取代原来的模板目录）

两种模式都取自 **[dna/](dna/README.md)** —— 十种经过艺术指导的视觉语言，**按场景参数化**（强调色从素材画面里采样，接触阴影沿实测的光线方向投下，景深匹配的模糊，hero 幅度与 RMS 联动）：

| DNA | 语域 | 适配场景 | 气质 |
| --- | --- | --- | --- |
| **cream** | premium-warm | 暗 / 中间调的暖色场景 | Inter + 暖奶油色 + screen；发光浮现的 hero（cinematic-cream 的继任者） |
| **ink** | premium | **明亮场景（亮度 > 150）** | 近黑色 multiply —— 文字像印在墙上；明亮场景的答案 |
| **editorial** | editorial-luxe | 内省 / 时尚 / 诗意 | Bodoni Moda，小写斜体 hero —— 杂志式的优雅 |
| **keynote** | tech-premium | 产品 / 发布 | 不透明白色 Inter 800，正中央的静止 |
| **documentary** | formal | 访谈 / 严肃 | 烙印式揭示，没有 hero —— 庄重本身就是风格 |
| **loud** | loud | 燃向 / 运动 / 社交 | Anton + 从场景采样的强调色，整体一次砸入 + 涟漪；正文在前景里高声宣告（`bodyLayer: fg`） |
| **neon** | loud-neon | 霓虹黑色电影 / 夜生活 / 科技黑色（暗场景） | 电光青的招牌字，点火式闪烁，hero 像招牌一样通电亮起 |
| **glitch** | loud-neon | 数字 / 黑客 / AI | RGB 分离的回声在落地时咔地合拢；机器打击乐式的节奏 |
| **chrome** | loud-luxe | Y2K / 时尚科技 / 音乐 | 液态金属渐变的 hero + 停留期间一道光泽扫过 |
| **velocity** | loud-sport | 运动 / 汽车 / 健身 | 每个词都沿着自己的运动矢量抵达（拖影 + 斜切），hero 带着速度拖尾穿过 |

按 `safe-zones.json`（`heroAnchor.bandLuma`、`palette.temperature`）× 内容语域来选 —— [dna/README.md](dna/README.md) 里有决策规则。编写：`cinematic.json` 接受 `"dna": "<name>"`。

引擎会根据 DNA 生成 **hero 三幕**（无需编写）：同屏可见的字幕压暗（铺垫）→ 逐字母入场，幅度 ∝ 说话响度（冲击）→ 呼吸 + 发光直到退场（余晖）。

（遗留说明：`plan.template:"cinematic-cream"` 会自动映射为 `dna:"cream"`。已退役的 54 个模板库归档在本仓库之外，不随 skill 分发；`_motion.md` 仍保留在 skill 内，作为动效动词的参考目录。）

---

## 审美决策 —— 语气 × 镜头 × 平台（作为目录短名单的输入，不是第二个路由）

在 3 个维度上给素材分类，把结果输入 CATALOG.md 的短名单筛选 —— 本节自身绝不选择模式 / 引擎：

**语气**（内容是什么感觉？）

- 纪录片 | 对话式 | 高能 | 诗意 | 主题演讲 | 调查式 | 音乐录影带

**镜头**（取景是什么？）

- 特写（头 + 肩）| 中景（躯干及以上）| 远景（全身及以上）| 剪辑蒙太奇（混合镜头）

**平台**（在哪里播放？）

- 9:16 竖屏（TikTok/IG/Shorts）| 16:9 横屏（YouTube/web）| 1:1 方形 | 广播导出

到 [references/direction-catalog.md § Classification matrix](references/direction-catalog.md) 里交叉参照方向语言 —— 然后回到 [CATALOG.md](CATALOG.md) 列出候选风格（这个矩阵为短名单提供信息；目录是唯一的路由界面）。

## 构图工艺（嵌入轨）—— 嵌入之前先读

完整的**嵌入轨**手册在 **[references/composition-craft.md](references/composition-craft.md)**：转录稿角色标注、短语分组、plane 与干净区域锚定、区域一致性、高潮的冲击力与可读性、边缘留白、遮挡的三步判断，以及累积 / 持续。它管的是一个*被提升*的短语如何坐进场景里 —— 编写任何嵌入之前都要先读它（Cinematic 的 `cinematic.json` 或 Standard 的 `index.html`）。默认的 **rail** 轨有它自己的、简单得多的规范 → **[references/rail.md](references/rail.md)**。

---

## 共享知识

| 文档 | 内容 |
| --- | --- |
| [references/rail.md](references/rail.md) | **rail 轨** —— 标准的 lower-third 字幕规范（默认；承载大部分文字）。 |
| [references/composition-craft.md](references/composition-craft.md) | **嵌入轨手册** —— 分组、plane、高潮冲击力、遮挡判断、累积 / 持续。嵌入之前先读。 |
| [dna/README.md](dna/README.md) | **DNA registry** —— 十种按场景参数化的视觉语言；怎么选。 |
| [references/reference-bar.md](references/reference-bar.md) | **品味标杆** —— 按语域列出的世界级参照 + 5 项正向检查。 |
| [references/aesthetic-principles.md](references/aesthetic-principles.md) | **18 条规则。** 在品味上赢过 Veed AI。先读。 |
| [references/motion-vocabulary.md](references/motion-vocabulary.md) | 10 个有名字的动效原语 + 语气→时间的对照表 |
| [references/direction-catalog.md](references/direction-catalog.md) | 10 种可直接交付的美学风格 + 语气×镜头×平台矩阵 |
| [references/anti-patterns.md](references/anti-patterns.md) | 已经封堵掉的 bug（CoreML、letter-spacing 重排等） |
| [references/scene-types.md](references/scene-types.md) | 墙面什么时候可用（4 个条件） |
| [references/layout-heuristics.md](references/layout-heuristics.md) | plane 定位、干净区域选择、crown 的 3 个条件、pillarbox 的计算 |
| [references/typography-presets.md](references/typography-presets.md) | 字号 × 栏宽矩阵（起点值） |
| [references/caption-grouping.md](references/caption-grouping.md) | 词 → 组的规则（停顿、句子边界） |
| [references/failure-modes.md](references/failure-modes.md) | 开发中各种坑的长尾 |
| [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md) | 为什么 preset 有时会失败；克隆再微调的模式 |

**先读审美原则和方向目录。** 其余都是实现细节。

---

## 不可妥协项

- **脸绝不能被连续 100% 遮住** —— 每个 0.3s 窗口内，脸部 bbox 至少 30% 未被遮挡。
- **WCAG 对比度** —— 最终渲染会做 lint；不通过就修色板。
- **确定性** —— 不要 `Math.random()`，不要 `Date.now()`，不要 `repeat:-1`。
- **绝不对视频调色 / 重新上色。** 原片原样交付 —— 字幕是唯一的添加物。不要在 a-roll 上加全画幅扫描线 / 双色调 / 压暗 / 暗角。霓虹黑色 / CRT 质感属于某个字幕元素*内部*，而不是覆盖整个画面。
- **口播 / 讲解以 rail 为先。** 不要把整份转录稿都嵌入 —— 大部分文字走 rail；只嵌入峰值。全部嵌入是默认会犯的错误。
- **嵌入要稀缺 + 有间隔。** 每句话 / 每一拍 ≤1 个嵌入，绝不相邻或同屏可见，至少隔开一拍，至多一个 `apex`。高潮 = 每一拍的峰值，**不是**「整段素材唯一的那个点题」。
- **Matte = 那个人（hyperframes `remove-background`，u2net_human_seg，Apache-2.0）。** 按意图是人像分割，但并不精准：细而偏离的器材（话筒悬臂）通常会被排除 —— 字幕渲染在它上面、人的身后 —— 而主体附近的大型显眼物体（一台望远镜、一套桌面设备）仍可能漏进 matte 并遮挡字幕。被主体拿在手里的物体（产品、手机）可能时有时无地掉出 matte，让字幕从它们前面穿过。绝不要想当然：放 hero 之前，在 2-3 个时间点采样 `frames_fg/`，并且优先选不碰任何漏入器材的 hero 位置（`heroAnchor` 可能被漏入物带偏 —— 拿 frames_bg 交叉核对）。
- **safe-zones 看不见道具 —— 你用到的每条横带都要亲眼看一遍。** Zones/heroBands 只给*主体*遮挡 + 亮度打分：坐落在「干净」区域里的话筒、望远镜或屏幕，对它们来说是不可见的（而漏进 matte 的道具会把 `heroAnchor.centerXPct` 从人身上带偏）。编写之前，为你打算用的每条横带各抽一帧；如果有道具在那里，量出它的 bbox，挪开或缩小 plane。有两个真实案例之所以能干净交付，正是因为 agent 这样做了。（自动的道具显著性检测是已知缺口；zones 的 `peakLuma` 只能抓到*移动的*明亮物体。）
- **字幕留在画面内。** Cinematic 模式对画面溢出设硬闸门；Standard 模式运行 `check-overflow.cjs` 只作为警告（有意的出血是唯一例外 —— 读一下警告）。
- **每条字幕在屏幕上 ≥ 0.5s** —— 更短就读不过来。
- **词的时间必须与 transcript.json 相差在 80ms 以内** —— 一条字幕偏离节拍 500ms 出现，就会毁掉场景的错觉。Cinematic 在渲染前运行 `check-timing.cjs --strict`（通过 render-and-composite.sh）；THEME 模式改为在编译时强制同样的时间（make-theme 的顺序转录匹配器 + 逐字完整性闸门 —— 时间漂移就是编译错误）。绝不要把多个转录词塞进一个条目（例如 `"FUTURE OF"`，或者一个 `IT` + 换行 + `ALL` 的堆叠只用一个 start/end）—— 第二个词会继承第一个词的时间戳，提前出现。把它们拆成各自带时间的独立词条目，即使你想让它们在同一视觉行上（用 CSS `white-space` / 自然换行，而不是 `<br>`）。支持字幕文字 ≠ 转录稿的创意替换（例如用 `"15%"` 替换 `"fifteen percent"`）—— 把它们登记到 `check-timing.cjs` 里的 `CREATIVE_SUBS`。
- **group 窗口必须包住它的词** —— 对每个 group，`group.in ≤ min(word.start)` 且 `group.out ≥ max(word.end)`。如果 `group.in` 晚于某个词的 start，这个词会被悄悄延迟到容器挂载时才出现（我们曾因此交付过 800ms 延迟的 bug）。校验器会强制检查这一点。
- **任意两个字幕组不能在时间和屏幕区域上同时重叠** —— 时间上重叠的字幕会造成文字叠文字的堆积。可选做法：(a) **空间分离** —— 把每个组放在互不重叠的竖向横带里，让它们可以共存（memory-wall 瀑布风格）；(b) **交接** —— 把前一组的 `out` 设为 ≤ 下一组的 `in`，屏幕上只留一组；(c) **刻意的分层排版** —— 在其中一组上加 `"allow_overlap": true`，让校验器闭嘴。校验器会根据每组的 CSS 估算它的竖向 bbox 并标出碰撞。默认选 (a) —— 正是它让 cinematic-cream 感觉像一首诗在累积，而不是一条不断替换自己的字幕轨。
- **Screen 混合在明亮背景（亮度 >180）上会失效。** **Cinematic** 模板是奶油色 + `screen`，而且这套 DNA 是**锁定的**（plan 没法给它们重新上色）→ 在明亮背景上它们会被冲淡，所以要选 `ink`（专为明亮表面打造的凸版印刷风格）或 `anchor` 主题（不透明的 rail 载体），而不是去覆盖一种外观。
- **不要在词入场时动画 `letter-spacing` 或 `filter:blur`** —— inline-block 重排会导致换行跳动。
- **抠像禁用 CoreML** —— onnxruntime CoreML EP 的混合精度分区会破坏脸部 alpha（在之前的 RVM 引擎上观察到；不要再试）。抠像只用 CPU（1080p 下约 2 fps ≈ 每 10s 素材 2-3 分钟；长素材要为此留出时间预算）。

---

## 依赖

- **HyperFrames CLI：** 插件安装使用随附的、由 manifest 固定版本的启动器。源码贡献者可以通过 `HYPERFRAMES_ROOT`、本 skill 的源码树或 `~/Downloads/hyperframes` 使用已构建的 checkout（`packages/cli/dist/cli.js`）。
- **Node 优先；两处通过 `uvx` 调用 Python（无需手动安装）：** 转录通过 `uvx` 运行 WhisperX（词级时间；回退到已有的词级 `transcript.json`），Theme 的 `drawon` setpiece 在编译时调用 `python3 scripts/gen-stroke-path.py`。其他一切都跑在 hyperframes 本来就附带的工具链上：抠像用 hyperframes CLI 的 **`remove-background`**（u2net_human_seg；权重自动下载一次，约 168 MB，存到 `~/.cache/hyperframes/`），图像 / alpha 运算用 **`sharp`**，布局 / 遮挡 / 溢出用 **`puppeteer`**，再加上 **`ffmpeg`**。按上文**运行前提**所述，把 Sharp、Puppeteer 和 GSAP 装在字幕项目里。辅助脚本会先检查那个项目，并为源码贡献者保留在 checkout 中查找依赖的逻辑。
- **转录 = 通过 `uvx` 运行的 WhisperX**（词级时间 + 对齐；无需手动安装 —— `transcribe.cjs` 驱动 `uvx whisperx`）。如果已有词级 `transcript.json`，就回退使用它。
- **源视频** —— `matte.cjs` / `transcribe.cjs` 会自动解析 `source.mp4`（或者 glob 匹配素材 / 读取 `hyperframes.json`），所以 `hyperframes init --video X.mp4` 不需要手动改名。
- **fps** —— `matte.cjs` 按源视频的原生帧率提取，并记录 `matte.fps`；`render-and-composite.sh` 使用这个值，让 matte 保持逐帧对齐。
- 抠像权重不随附：`matte.cjs` 调用 hyperframes CLI 的 `remove-background`，后者会把 u2net_human_seg（约 168 MB，Apache-2.0）一次性下载到 `~/.cache/hyperframes/background-removal/models/`。在一台全新的机器上第一次 prepare 时，需要联网完成这一次下载。

如果缺少某个硬依赖，就停下来问用户 —— 不要悄悄跳过步骤。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [CATALOG.md](CATALOG.md) —— 目录（THE CATALOG）—— 一个前端，背后三个引擎
- [dna/README.md](dna/README.md) —— DNA registry —— 挑一种视觉语言，而不是挑一个 preset
- [modes/cinematic/README.md](modes/cinematic/README.md) —— Cinematic 模式（纯嵌入）—— 一个引擎，六套 DNA
- [modes/cinematic/_archive/champion/spec.md](modes/cinematic/_archive/champion/spec.md) —— 模板：champion
- [modes/cinematic/_archive/memory-wall/spec.md](modes/cinematic/_archive/memory-wall/spec.md) —— 模板：memory-wall
- [modes/cinematic/_archive/portrait-header/spec.md](modes/cinematic/_archive/portrait-header/spec.md) —— 模板：portrait-header
- [modes/cinematic/cinematic-cream/spec.md](modes/cinematic/cinematic-cream/spec.md) —— cinematic-cream —— 规范
- [modes/standard/_anatomy.md](modes/standard/_anatomy.md) —— 字幕模板 —— 解剖（共享引擎）
- [modes/standard/_motion.md](modes/standard/_motion.md) —— 字幕模板 —— 动效语言
- [references/aesthetic-principles.md](references/aesthetic-principles.md) —— 电影感字幕的美学原则
- [references/anti-patterns.md](references/anti-patterns.md) —— 反模式
- [references/bespoke-vs-presets.md](references/bespoke-vs-presets.md) —— 定制设计 vs. preset —— 何时覆盖，何时克隆
- [references/caption-grouping.md](references/caption-grouping.md) —— 字幕分组
- [references/composition-craft.md](references/composition-craft.md) —— 构图工艺 —— 仅适用于嵌入轨
- [references/direction-catalog.md](references/direction-catalog.md) —— 方向目录
- [references/failure-modes.md](references/failure-modes.md) —— 失败模式 —— 吃过苦头才学到的
- [references/layout-heuristics.md](references/layout-heuristics.md) —— 布局启发式
- [references/motion-vocabulary.md](references/motion-vocabulary.md) —— 动效词汇 —— 有名字的词入场手法
- [references/rail.md](references/rail.md) —— Rail 轨 —— 标准的 lower-third 字幕
- [references/reference-bar.md](references/reference-bar.md) —— 参照标杆 —— 世界级是什么样子
- [references/scene-types.md](references/scene-types.md) —— 场景类型 —— 选对模板
- [references/typographic-moves.md](references/typographic-moves.md) —— 字体排印手法 —— 是色板，不是牢笼
- [references/typography-presets.md](references/typography-presets.md) —— 字体排印 preset
- [themes/README.md](themes/README.md) —— THEME 模式 —— 组合而成的视觉宪章
