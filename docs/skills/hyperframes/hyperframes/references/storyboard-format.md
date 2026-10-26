# 分镜格式 —— `STORYBOARD.md` + 解析后的 manifest

只定义分镜的**基础数据格式**：`STORYBOARD.md` 的文件形状，以及它被解析成的 `StoryboardManifest`。工作流如何*生成*分镜，写在各个工作流里；可选的旁白 / TTS 文件（`SCRIPT.md`）是另一回事，由 TTS 步骤负责，不在这里讲。

分镜是视频的**计划层** —— 一个 markdown 文件里一组有序的**帧**（关键时刻）。解析器：`@hyperframes/core/storyboard` → `StoryboardManifest`。

## Frontmatter（全局方向）

位于顶部的 YAML 块。未知的键保留在 `globals.extra` 下。

| 键 | 含义 | 示例 |
| --- | --- | --- |
| `format` | 画布尺寸 | `1920x1080` |
| `duration` | brief 对时长的大致预期（仅供参考，不是硬性限制） | `22s` |
| `message` | 一句话的核心论点 | `Ship a launch video in an afternoon` |
| `arc` | 叙事弧线 | `Hook → Problem → Solution → Proof → CTA` |
| `audience` | 给谁看 | `indie devs on X` |
| `mode` | 交互模式（见 `brief-contract.md`；默认 collaborative） | `autonomous` |

首次写分镜时，根据 brief 的 `length` 设置 `duration`。它是一个预期，不是闸门：组装时会报告实际剪出来的时长与它相比落在哪里，并标出较大的差距 —— 判断这个偏差是否对作品有益，当预期时长确实改变时再更新这个值。

## 每帧的小节

每帧一个 `## Frame N — Title` 标题（H2/H3 级别接受 `Frame` / `Beat` / `Scene`）。元数据写成 `- key: value` 列表项；它们下面直到下一个标题之前的所有内容都是自由格式的**叙事**。

| 键 | 含义 |
| --- | --- |
| `status` | `outline` → `built` → `animated`（默认 `outline`） |
| `src` | 该帧 HTML sub-composition 相对项目的路径（缩略图海报就是从它渲染的） |
| `duration` | 例如 `4s` |
| `transition_in` | `crossfade` / `cut` / `wipe` …（别名 `transition`） |
| `scene` | 一行联系表说明文字（别名 `description` / `summary` / `caption`） |
| `voiceover` | 该帧的旁白*参考*（别名 `vo` / `voice_over` / `narration`） |
| `poster` | 为缩略图海报 seek 到的秒数（越过开场动画） |
| *任何其他键* | 原样保留在该帧的 `extra` 下 —— 工作流在这里携带它自己的逐帧数据（效果、素材……） |

## 解析后的 manifest

解析器是**宽容的**：它从不抛出异常，遇到任何意外情况都记为一条 `warning`。

```
StoryboardManifest {
  globals: { format?, message?, arc?, audience?, extra: {…} }
  frames: Array<{
    index, number?, title?,
    status,                       // "outline" | "built" | "animated"
    src?, duration? / durationSeconds?, transitionIn?,
    scene?, voiceover?, poster?,
    narrative,                    // markdown below the metadata
    extra: {…}                    // unknown keys, preserved
  }>
  warnings: Array<{ message, line?, frameIndex? }>
}
```

## `SCRIPT.md`（不在本文范围内）

可选、自由格式、**不会被解析进 manifest** —— 它是驱动 TTS 的锁定旁白文件。它的格式定义在 `references/script-format.md` 里，没有旁白 / TTS 的视频就没有它。上面每帧的 `voiceover` 是分镜自己的旁白参考。

## 示例

```markdown
---
format: 1920x1080
message: "Ship a launch video in an afternoon"
arc: Hook → Problem → Solution → Proof → CTA
audience: indie devs on X
---

## Frame 1 — Hook

- scene: Big type punches in on the beat
- duration: 3s
- poster: 2s
- transition_in: cut
- status: animated
- voiceover: "Ship a launch video in an afternoon."
- src: compositions/frames/01-hook.html

Open cold on the promise. This is the thesis — everything after pays it off.

## Frame 2 — The problem

- scene: A 20-minute timer spins on a stack of rejected takes
- duration: 4s
- transition_in: crossfade
- status: built
- voiceover: "The old way? Prompt, wait twenty minutes, get something that misses."
- src: compositions/frames/02-problem.html

The old way: prompt, wait, get something that misses. Establish the pain we remove.
```

## 备注

- `status: outline` 且没有已构建 `src` 的帧，会渲染成一个大纲占位图。
- `built` 是中间那一级：该帧的 HTML 已经存在，且它的**布局已确认**（线框草图或更完整的程度）—— 还没加动效。除了批准的布局之外，还什么都没画。
- 走过这些状态的流程 —— 计划、草图、构建，每一轮都在聊天中和 `storyboard.html` 里评审 —— 见 `review-loop.md`。
- 多行的 `voiceover` 值在保存时会合并成一行。
