<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/music-to-video/references/frame-skeleton.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Frame 骨架（Step 2）—— 读懂音乐，排出各个 frame

在 Step 2，**你（编排者）**阅读 `audiomap.json`，并直接写出 `STORYBOARD.md` 的**骨架**：把曲目切分成若干 **frame**（一个 frame = 一个 composition 文件 = 一个场景），并为每个 frame 设置它的 **span**、它的 **pacing**（这一段想要按节拍硬切，还是舒缓的乐句 / 能量流动？）、它的 **mood**，以及一行 **feel** 备注。

你**只做分类、只排出主干。**你**不**挑模板、不写文案、不选颜色 / 字体，也不决定一个 frame 的 group —— 那些是 Step 3 的事（计划阶段会就地把每个 frame 填满）。把每个 frame 的 `### Groups` 留为 `TBD (Step 3)`，frontmatter 的 `style` 留空。

**没有任何中间 JSON** —— 骨架 _就是_ `STORYBOARD.md` 的开头。Step 3 编辑的是同一个文件。

## 信任边界（先读这一节）

`audiomap.json` 是一个分析器的输出。有些字段对**任何**音乐都稳健；有些只有在音乐**确实有节奏感**时才可靠。这决定了每个 frame 的 `pacing`：

| 字段                                                                                                                                                                                                | 可信度                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `energy_phases[]`（level / energy / density / feel）、`events[]` + `onset_rate`、`rolls[]`（以及它们的**缺席**）、`silences[]`、`hard_stops[]`、`key_moments[]`、`phrases[]`、`audio.duration_sec` | **永远可信** —— 稳健的测量值                                                                                                                                                                                                 |
| `tempo.bpm`、`grid.beats_sec` / `downbeats_sec` 的**精度**                                                                                                                                          | **只有在音乐有节奏感时才可信。** 在舒缓 / 稀疏的素材上，节拍网格是追踪器 _强加_ 上去的节拍器（经常是倍频翻倍的）—— 通常**网格节拍比真实的 onset 还多**。在那种情况下**不要**把剪辑锚定到它上面。                          |

- **网格可靠**的情况：存在 roll，和 / 或有密集阶段，和 / 或 `onset_rate` 高且网格稳定。
- **网格是虚构的**的情况：`rolls`≈0，大多是 `sparse` 阶段，`onset_rate` 低 → 按 `phrases[]` + `energy_phases[]` 安排节奏，而不是按节拍。

## 如何排出 frame（按顺序执行）

1. **整体印象。** 根据 `summary` / `tempo` / `audio.duration_sec` + roll 的数量，写出 frontmatter 的 `compositionId`、`duration_s`（== `audio.duration_sec`）、`canvas`，以及一行对曲目密度走向的解读。
2. **切分成 frame。** 沿着 `energy_phases[]` 走一遍，在音乐真正改变状态的地方切开 —— 在 `hard_stops[]`、`SURGE` / `DROP` 类的 `key_moments`、一段 `rolls[]` 的起点 / 终点、一片 **onset 荒漠**（`events[]` 中的一段长间隔），或者一次大的能量级别跳变处。把属于同一个动作姿态的相邻阶段合并起来。预计**约 1–6 个 frame**；一段短片可能只有一个。**每一条边界都要吸附到一个 audiomap 锚点上**，然后**只有当网格可靠时**，才再吸附到最近的 `beats_sec`（容差 ≤ ½ 拍）；在舒缓的素材上，改为吸附到 `phrases[]` / `energy_phases[]` 的边缘。各个 frame **铺满整条曲目**（第一个从 0 开始，最后一个到 `duration_s` 结束，没有间隙 / 重叠）。
3. **为每个 frame 设置 `pacing`** —— 也就是信任边界的判断：
   - **`beat_cut`** —— 确实有节奏感：存在 roll，**或者**密集，**或者**（`onset_rate` 明显很高**并且**网格稳定）。硬切 / 逐 onset 显现可以锚定到节拍上。
   - **`phrase_flow`** —— 舒缓 / 稀疏：`rolls`≈0，大多稀疏，`onset_rate` 低。**不要**把硬切锚定到网格上；按 `phrases[]` + 能量包络来安排节奏（缓慢的交叉淡化、长时间的定格）。
4. **为每个 frame 标注 `mood`**（从 `warm` · `dark` · `hype` · `elegant` · `glitch` · `cinematic` · `playful` · `tense` · `dreamy` · `aggressive` 中选 1–3 个），依据是 `energy_phases[].feel` + 能量 + brief / 标题里的任何风格类型线索。
5. **为每个 frame 写一行 `feel`** —— 用朴素语言描述的音乐状况，Step 3 会拿它去匹配模板（例如"加速的 onset 流，汇入一个持续的重拍"、"舒缓持续的铺底音色，有一片 onset 荒漠"、"快速、持续填充的 roll，没有可读的信息"）。规划者会拿它去对照 catalog 里的 **Reach for it when**（何时选用）—— 要具体，取自那些稳健的字段，绝不编造。

## 骨架长什么样

一份有效的 `STORYBOARD.md`，主干已设好，每个 frame 的处理方式都留给 Step 3（完整语法见 [`storyboard-format.md`](storyboard-format.md)）：

```markdown
---
compositionId: bgm
duration_s: 30.0 # == audiomap.audio.duration_sec
canvas: { w: 1920, h: 1080, fps: 30 }
style: # blank — Step 3 fills it from the chosen frame.md preset
build_notes: ["one paused timeline per frame", "no remote assets"]
---

## Frame 1 — f1

- src: compositions/frames/01-f1.html
- duration: 7.198s # = span length; assembler sums these for cumulative data-start
- span_sec: [0.0, 7.198] # track seconds; frames tile the track
- pacing: beat_cut
- mood: [hype]
- feel: accelerating onset stream building into a held downbeat

### Groups

- TBD (Step 3)

## Frame 2 — f2

- src: compositions/frames/02-f2.html
- duration: 10.4s
- span_sec: [7.198, 17.598]
- pacing: phrase_flow
- mood: [warm, cinematic]
- feel: calm held pad, one long onset desert

### Groups

- TBD (Step 3)
```

## 自查

- `duration_s == audiomap.audio.duration_sec`；各个 frame 无间隙地铺满整条曲目（第一个从 0 开始，最后一个到 `duration_s` 结束）。
- 每个 frame 都有 `src` + `span_sec` + `duration` + `pacing` + `mood` + 一行 `feel`。
- `pacing` 是根据**稳健**的字段（energy / density / rolls / onset_rate）设置的，绝不只根据 `bpm` / `beats_sec`。
- 没有任何 frame 边界落在一段 `rolls[]` 内部，或者留下一个不足 1 小节的碎片。
- 每个 frame 的 `### Groups` 都是 `TBD (Step 3)`；`style` 为空。**任何地方都没有模板、文案、颜色或字体。**
