---
name: B站视频笔记
description: "要把 B站视频或图文动态整理成学习笔记时用：脚本抓元数据、公开字幕、评论和图文，没字幕就经 agent-io 下载视频、转写音频，按需抽关键帧，全部归档成证据索引；Agent 按预算写学习型笔记，写完打分验收；脚本要下载到本地执行"
---

# B站视频笔记

把 B站视频和图文动态变成可检索、可复用的 Markdown 学习笔记。难点有三个：字幕不等于理解，PPT、板书、代码演示里的信息字幕里没有；长课和短视频容易写成差不多长；笔记里的判断回查不到原话。所以分两半做：脚本把取材、归档、证据索引、笔记预算这些确定性的活干完，不写笔记；Agent 读归档，按预算写学习型笔记，写完用脚本打分。如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](bili-note.tar.gz)下载到本地。跑一次总入口就算调用多次，它会调其他脚本。

视频优先拿公开字幕，拿不到再转写音频；图文优先抓正文、图片和代码块；用户要评论区时抓取评论，过滤掉无关讨论。下载视频走 [解析分享链接](../agent-io/reference/share-link.md)，转写走 [转录音频](../agent-io/reference/transcribe.md)，都是 [Agent 基础能力](../agent-io/index.md) 里的接口。

## 准备 { #setup }

- 这是在执行第三方代码，下载前告诉用户
- **默认路线只用 Python 3.10+ 标准库**：元数据、公开字幕、图文正文、图片清单、评论、归档、证据索引和笔记预算都不装第三方包。
- **转写和关键帧要 ffmpeg 和 `MY_API_KEY`**：脚本从环境变量读 `MY_API_KEY`，没导出就先在 `.env` 所在目录跑 `set -a; . ./.env; set +a`。别打印它。
- **花钱的两步先问用户**：每个分P解析视频直链扣一次下载狗额度（失败不扣）；转写按时长计费，约 0.1 美元每小时。

第一次使用、换机器、或怀疑依赖不全时，先检查：

```bash
python3 scripts/check_environment.py          # 加 --json 给其他脚本读
```

- `public_subtitles_comments_archive=OK`：默认的字幕、图文、评论和归档流程能走。
- `audio_transcription=OK`：没有公开字幕时可以转写。
- `keyframe_visual_review=OK`：可以抽关键帧。
- 某项缺失时，只说明那条路线暂不可用，不要说整个 skill 不可用。

## 字幕密度与视觉理解 { #visual }

B站视频优先拿字幕，但字幕、转写不等于完整理解。长视频字幕字数明显偏少，说明核心信息可能在画面、PPT、板书、代码演示、屏幕操作或无解说片段里。

- **每次视频运行都先做轻量预检，再问用户要不要开「关键帧视觉理解」**。预检只读元数据、分P信息和已有字幕文件，不下载视频；它会显示时长、字幕字数、字幕密度和画面依赖建议。收到明确的 `on` 或 `off` 才往下走。问的时候说明：`on` 会抽最多 12 帧，先拼成一张 4×3 联系图，再按需打开单帧，视觉输入会增加 tokens；`off` 只走字幕、转写、评论和元数据，省下视觉输入的 tokens。
- **预检显示没有公开字幕时，同一轮问要不要转写**，说明花费。
- 用户选 `on` 时给 `run_bili_note.py` 传 `--visual-review on`，选 `off` 传 `--visual-review off`。每次视频运行都重新问，不能沿用上一次的选择。
- 关键帧的选择只对视频生效。图文、动态本来就有图片材料，按图文的视觉理解流程处理。
- 归档后必须读 `metadata/note_budget.json`。`visual_dependency.needs_visual_review=true` 时，不要把稀疏字幕写成完整的学习笔记，先补关键帧或截图，再做 OCR 或多模态视觉理解；必要时再补转写。
- 当前接入的模型或工具看不了图，就告诉用户：关键帧理解是高级视觉能力，需要多模态模型、OCR 工具或人工查看；现在只能基于字幕和元数据写有限的笔记，并标注覆盖范围。
- 最终笔记和给用户的回复要转述 `visual_dependency.warnings`，并说明补没补视觉证据。

关键帧分两步低成本地读：先看一张 4×3 联系图 `keyframes/contact_sheet.png`，建立全片的画面地图；联系图里出现文字、代码、图表或界面细节时，再按工作目录的 `keyframes_manifest.json`（归档后是 `metadata/keyframes_manifest.json`）打开对应的单帧。不要默认把 12 张完整图片全部送进模型。

视觉观察写进材料包的 `metadata/visual_review.md`，每条关联 `KF-Pxx-xx`、分P、时间和观察结论，不确定的画面标为待核实。关键帧证据可以通过 `indexes/关键帧索引.jsonl` 和总证据索引回查。

## 默认流程 { #workflow }

1. 读清用户要什么：视频还是图文链接、要不要评论区、保存到哪、要全文材料还是只要提炼。
2. 首次使用、依赖状态不明或要转写时，先跑 `check_environment.py`，判断哪些路线能走。
3. 视频先让总入口做轻量预检：第一次不带 `--visual-review`、末尾加 `< /dev/null` 跑，抓完元数据和字幕、打出预检结果后，报「没有收到关键帧理解选择」退出，这是预期的。把预检结果和建议告诉用户，问关键帧（没有公开字幕时连同转写一起问），再带上选择重跑。
4. 能自动化的部分都交给 `run_bili_note.py`，它自动识别 `/video/BV...`、`/opus/...`、`/dynamic/...` 和纯 opus id，已有的输出自动跳过，可以断点续跑。
5. 图文、动态走 `extract_bilibili_opus.py`：抓正文、标题、作者、发布时间、图片、代码块和图文证据索引；加 `--comments` 时抓图文评论。
6. 视频优先下载公开字幕。只列出 `ai-zh` 而 `subtitle_url` 为空，是 AI 字幕要登录才给地址，按拿不到公开字幕处理。拿不到公开字幕、用户又同意转写时加 `--transcribe`：经下载狗拿视频，抽音频交给 MAI-Transcribe-2。长视频不要默认全量转写，用户明确要求才转全部分P。
7. 用户要评论区时加 `--comments`，抓主评论和子评论；写进笔记时过滤打卡、求资料、广告、闲聊这类和技术无关的内容。
8. 归档原始材料：完整字幕或转写、图文正文、图片、完整评论、元数据和 JSONL 索引，存进知识库旁边的长期目录。
9. 用户选了 `on`，就在写前定标之前看联系图，必要时看对应单帧，写好 `metadata/visual_review.md`。
10. **写前定标**：先读 `metadata/note_budget.json`，把推荐字数区间、压缩比目标、写作粒度、互动质量倍率、证据块数量和 `visual_dependency` 定为这次笔记的写作目标。视频按时长、字幕字数、证据块、评论量和互动质量定标；图文按正文长度、图片、代码、证据块、评论量和互动质量定标。`visual_dependency.risk` 是 `medium` 或 `high` 时，先补关键帧、OCR 或多模态视觉理解，或者明确告诉用户缺视觉理解能力，不能写成完整解析。
11. 按预算写 Markdown，默认写成[学习型笔记](#note)：让人或 Agent 像学完一节课、读完一篇教程一样，拿到概念、方法、判断标准、实践步骤和自测题。按预算决定详略，长课和短视频不要写成差不多的字数。来源、覆盖范围和归档路径放在后半部分。正文证据默认用论文式编号 `[1][2]`，不直接堆长证据 ID。
12. **写后验收**：用 `score_bili_note.py` 检查字数、压缩比、每分钟或每篇的笔记密度和证据引用比例。评分只做验收和微调，不代替写前定标；太短时优先补学习收获、知识地图、概念卡、实战流程、坑点和自测题，不要只堆分P摘要或段落摘要。

## 常用命令 { #commands }

### 一键提取和归档

```bash
python3 scripts/run_bili_note.py "https://www.bilibili.com/video/BVxxxx/" \
  --work-dir ./tmp_bili_extract \
  --archive-dir "<知识库>/原始材料/BVxxxx_视频短标题" \
  --visual-review on \
  --comments
```

- 用户选择关闭时，把 `--visual-review on` 改成 `off`。
- 没有公开字幕、用户同意转写时加 `--transcribe`；有公开字幕时这一步自动跳过。字幕明显不可用、要硬转写时，再加 `--subtitle-mode none`。
- `--parts` 默认 `all`，也可以写 `key`（按标题挑重点分P）或 `1,10,38`。

图文、动态用同一个入口；只要正文和图片 URL、不下载图片文件时加 `--no-download-images`：

```bash
python3 scripts/run_bili_note.py "https://www.bilibili.com/opus/1194341967364882439" \
  --work-dir ./tmp_bili_opus \
  --archive-dir "<知识库>/原始材料/O1194341967364882439_图文短标题" \
  --comments
```

跑完先看：

- `bili_note_run_report.md`：这次跑了什么、跳过了什么、下一步读哪里。
- `visual_preflight.json`：询问前的时长、字幕密度、风险和建议，方便复核这次选择的依据。
- `keyframes/contact_sheet.png`、`keyframes_manifest.json`：开了关键帧时生成的联系图和清单（编号、分P、时间、单帧路径）。
- `transcripts/`、`transcript_manifest.json`：转写结果，每个分P一份 json、txt、srt。
- 归档目录的 `indexes/证据索引.jsonl`（写总结时可引用的图文、字幕、评论证据块）、`indexes/图文全集.md`、`indexes/字幕全集.md`（转写也归在字幕里）、`metadata/note_budget.json`、`metadata/visual_preflight.json`、`metadata/keyframes_manifest.json`，以及由 Agent 写入的 `metadata/visual_review.md`。

### 单步命令

总入口跑不通、或只要其中一步时用：

```bash
python3 scripts/extract_bilibili.py BVxxxx --out ./tmp_bili_extract                        # 元数据和分P目录
python3 scripts/extract_bilibili.py BVxxxx --out ./tmp_bili_extract --parts all --download-subtitles
python3 scripts/extract_bilibili.py BVxxxx --out ./tmp_bili_extract --parts 1,10,38 --transcribe
python3 scripts/extract_bilibili.py BVxxxx --out ./tmp_bili_extract --comments
python3 scripts/extract_bilibili_opus.py "https://www.bilibili.com/opus/1194341967364882439" --out ./tmp_bili_opus --comments
python3 scripts/extract_video_keyframes.py BVxxxx --out ./tmp_bili_extract --count 12
python3 scripts/archive_bili_materials.py --extract-dir ./tmp_bili_extract --archive-dir "<知识库>/原始材料/BVxxxx_视频短标题"
```

- 转写默认每 10 分钟切一块，自动识别语言；确定语言时加 `--asr-language zh`。
- 评论抓完看 `comments.md` 和 `comments_raw.json`，写进笔记只留和主题相关的纠错、技术补充、实践经验和有价值的问题。
- 字幕或转写明显乱码、内容和标题或课程主题不相干时，不要当可靠全文，标注「字幕质量不可用」；转写也不可用时，只能基于分P标题、简介、评论和元数据写有限的学习指南，并写明局限。

归档默认要做，方便之后照着总结继续提问、回查证据。长期材料包里有：

- `articles/图文全文.md`、`articles/图文全文.txt`：完整图文。
- `images/`：图文图片和图片清单。
- `indexes/图文全集.md`、`indexes/图文全集.jsonl`：合并后的完整图文正文，jsonl 按内容块切分，适合检索和问答。
- `indexes/图文证据索引.md`、`indexes/图文证据索引.jsonl`：图文证据块，给总结加引用、给程序检索。
- `subtitles/txt/`、`subtitles/srt/`、`subtitles/json/`：每个分P的完整纯文本字幕、带时间轴的 SRT 和原始 JSON；转写结果也放在这里。
- `comments/comments_raw.json`：完整评论原始结构。
- `indexes/评论证据索引.jsonl`：按评论和回复生成的证据块。
- `indexes/证据索引.jsonl`：图文、字幕证据和评论证据合在一起的索引。
- `metadata/`：内容元数据、字幕清单、图文清单、评论清单。
- `metadata/note_budget.json`：按内容信息量和互动质量算出的笔记预算，控制长短视频、长短图文的提炼粒度，字幕稀疏时提示补视觉证据。

### 写前读预算，写后验收信噪比

预算是这次笔记的目标，不是写完才补救的报告。写之前先读 `metadata/note_budget.json`，重点确定：

- 推荐字数区间：`recommended_note_chars_min` 到 `recommended_note_chars_max`。
- 写作粒度：`granularity` 和 `writing_guidance`。
- 信息量基准：视频看 `duration_minutes`、`subtitle_chars`，图文看 `content_chars`、`reading_minutes_estimate`。
- 字幕密度：视频看 `subtitle_chars_per_minute` 和 `visual_dependency`；长视频字幕太少时先补关键帧、OCR 或多模态视觉理解。
- 质量倍率：`quality_multiplier` 和 `quality_metrics`，判断值不值得保留更多细节。
- 证据规模：`all_evidence_blocks`，决定关键判断要覆盖多少证据。

写完最终笔记后打分，也可以把评分直接写回笔记正文：

```bash
ARCHIVE="<知识库>/原始材料/BVxxxx_视频短标题"
NOTE="<知识库>/观点X：视频短标题.md"
python3 scripts/score_bili_note.py --archive-dir "$ARCHIVE" --note-path "$NOTE" --out "$ARCHIVE/metadata/note_score.json"
python3 scripts/update_note_budget_section.py --archive-dir "$ARCHIVE" --note-path "$NOTE"
```

重点看：

- `status`：`too_short` 表示遗漏风险高，`too_long` 表示可能在重复堆料，`ok` 表示落在写前的推荐区间。
- `quality_multiplier`：点赞、收藏、投币、评论、弹幕、分享、播放量和发布距今天数合成的互动质量倍率。
- `actual_compression_ratio`：笔记字数 / 字幕字数。长视频允许更高的总字数，但仍要保持压缩。
- `note_chars_per_minute`：每分钟视频对应多少笔记字。长课程不该和短视频的总字数差不多。
- `evidence_reference_ratio`：笔记引用的证据块占比。关键判断要能回查图文证据 `O...`、字幕证据 `Pxx@...` 或评论证据 `C...`；正文用统一的数字编号，文末的编号脚注和 reference-style 链接定义必须指向含完整证据 ID 的归档文件。

## 笔记写法 { #note }

默认输出必须是学习型笔记，不是目录搬运、分P流水账或证据清单。读完要有「我真的学会了一些东西」的获得感。

### 推荐结构

1. `# 标题`
2. `## 学完你应该获得什么`：用 5–8 条写清楚读者学完后能理解、判断或完成什么。
3. `## 一句话总论`：说明视频最核心的判断，不要只复述标题。
4. `## 适用场景与前置知识`：这套内容适合谁、不适合谁，读者要先知道什么。
5. `## 知识地图`：把核心概念、模块、流程和它们之间的关系讲清楚。课程型视频要有模块表；短观点视频要有论证链。
6. `## 核心概念卡`：每个重要概念都写成「是什么、为什么重要、怎么用、常见误区、相关证据」。
7. `## 方法或流程`：把原内容里的操作、架构、决策流程、参数选择、评估方法抽成可复用的步骤。
8. `## 关键洞察`：写作者真正想表达的判断，区分事实描述、经验判断、推荐做法和限制条件。
9. `## 实践清单`：给出能照着做的步骤、检查项、失败信号和排错方向。
10. `## 坑点与反例`：整理视频和评论区提到的踩坑、争议、误区和边界条件。
11. `## 自测题`：写 5–10 个问题和简短答案，帮人或 Agent 检查学没学会。
12. `## 证据与原文位置`：只放关键证据引用，不要让证据淹没学习内容。
13. `## 来源、覆盖与局限`：URL、BVID、UP、发布时间、字幕或转写和评论的覆盖、原始材料路径和局限放在后面。

### 写作标准

- 先解释「为什么」和「怎么迁移使用」，再列「他说了什么」。
- 课程型长视频按学习模块组织，不要按分P机械压缩。每个模块至少有学习目标、核心概念、关键步骤、常见坑和可操作的结论。
- 观点型短视频按「问题背景 → 作者判断 → 论据 → 适用边界 → 对用户的启发」组织。
- 技术教程和图文长文保留架构、数据流、代码思路、配置项、图片结论、评估方式和排错路径。
- 长视频字幕或转写密度太低时，先补视觉证据；没有多模态视觉能力，就把这篇明确标成「基于字幕和元数据的有限整理」。
- 评论区只写有学习价值的内容：纠错、补充案例、实践经验、替代方案、争议点。
- 证据引用服务于学习，不要把笔记写成引用列表。正文统一用论文式数字编号，比如 `[1][2]`；图文、字幕、评论证据共用一套编号，按正文首次出现的顺序递增。不要在正文段落里直接塞 `O<opus_id>-E001`、`Pxx@hh:mm:ss-hh:mm:ss` 或 `C<rpid>` 这样的长 ID。
- `## 来源、覆盖与局限` 之前放 `## 证据脚注`：用有序列表写编号和证据链接，例如 `1. [图文证据 E006](原始材料/O.../indexes/图文证据索引.md#O...-E006)`；列表后再放 reference-style 链接定义，例如 `[1]: 原始材料/O.../indexes/图文证据索引.md#O...-E006 "图文证据 E006"`，让正文里的 `[1]` 也能点击跳转。
- 保留 `## 证据与原文位置` 作为证据总览，但总览里也只写 `[1]`、`[2]` 这样的编号，不直接显示长证据 ID。
- 先按 `note_budget.json` 定标再动笔；写后评分只做验收和微调，不要把主要的长度决策推到评分阶段。
- 预算偏短或评分过短时，优先补概念解释、流程图式的文字、实践清单、自测题、反例和边界，不要只加摘要段落。
- 热度是「值得多写」的辅助信号，不是证据。点赞、收藏、评论、弹幕、投币、分享和发布距今天数会调高或调低推荐字数，但扩写的内容必须来自图文正文、字幕、评论证据和内容结构。

### 不合格信号

- 开头大段来源信息，读者看半天还不知道学到了什么。
- 只有「核心观点 / 分P提炼 / 代表性证据」，没有概念解释、方法步骤和自测。
- 每个分P压成一句话，长课程读完仍不知道怎么做。
- 长视频字幕极少，却没提示画面依赖，也没补关键帧、OCR 或视觉理解。
- 只总结作者立场，不写适用条件、反例和失败场景。
- 评论区只是罗列热评，没有转化成纠错、补充或实践提醒。

只看了标题、目录的内容，不要写成「完整提取」。只抓到部分字幕、只转写了部分分P时，明确列出覆盖范围。

## B站内容的坑 { #pitfalls }

- B站 AI 字幕和转写都常把技术词识别错：RAG 可能识别成 RG、ROG、rap；LangChain 可能识别成 non chain、long chain；reranker 可能识别成「瑞 rank」。总结时结合分P标题和技术语境校正术语。
- 图文、动态正文优先从页面里的 `window.__INITIAL_STATE__` 读，公开的 polymer 动态接口可能返回风控错误。图文正文会保留标题、段落、标题层级、列表、代码块、链接卡片、图片 URL 和图片清单。
- 图文的评论对象通常不是 opus id 本身，而是页面数据里的 `basic.comment_type` 和 `basic.comment_id_str`；抓评论时不要硬套视频的 `type=1`、`oid=aid`。
- 要总结图文里的图片含义，先检查 `images/` 或 `images_manifest.json`；只凭图片 URL 判断不了内容时，说明图片的视觉内容没有被完整理解。

接口细节和更多已知坑见 [B站接口笔记](references/bilibili-api-notes.md)。

## 脚本 { #scripts }

- [`check_environment.py`](scripts/check_environment.py)：检查核心流程、转写和关键帧能不能走。
- [`run_bili_note.py`](scripts/run_bili_note.py)：总入口，一次跑完视频或图文的提取、转写、关键帧、评论、归档和证据索引。
- [`extract_bilibili.py`](scripts/extract_bilibili.py)：元数据、字幕探测、公开字幕、经下载狗下载视频和转写、评论。
- [`extract_bilibili_opus.py`](scripts/extract_bilibili_opus.py)：图文、动态的正文、图片、代码块和图文评论。
- [`extract_video_keyframes.py`](scripts/extract_video_keyframes.py)：按分P时长抽最多 12 张代表帧，生成 4×3 联系图和关键帧清单。
- [`archive_bili_materials.py`](scripts/archive_bili_materials.py)：归档完整材料，生成全文索引、证据索引和带字幕密度、视觉依赖提示的笔记预算。
- [`score_bili_note.py`](scripts/score_bili_note.py)：按 `metadata/note_budget.json` 验收最终笔记的长度、压缩比、证据引用和视觉依赖提示。
- [`update_note_budget_section.py`](scripts/update_note_budget_section.py)：把预算、互动质量和信噪比评分写回笔记。

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../maintenance/skills/bili-note.md)。正常使用不用看，出问题再看。

</div>
