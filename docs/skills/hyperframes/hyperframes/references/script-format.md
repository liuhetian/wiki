<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/script-format.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# `SCRIPT.md` —— 锁定的旁白（可选）

一个项目的**锁定旁白**：最终的口播台词 + 声音 + 演绎方式。它是一个*可选的*计划层文件 —— 没有旁白的视频（只有 BGM、无声 overlay）就没有它。分镜里每帧的 `voiceover` 是更轻量、可编辑的*参考*；`SCRIPT.md` 是*定稿*。（分镜格式 → `references/storyboard-format.md`。）

本文件只定义 SCRIPT.md 的**形状**。把口播台词合成为音频是 `media-use` 负责的能力 → `../../media-use/audio/references/tts.md`。

自由格式的 markdown —— 没有严格的解析器；TTS 步骤会提取缩进的口播台词。

## 形状

一个头部块，然后每句口播台词一个小节。

| 部分 | 内容 |
| --- | --- |
| 头部 | `**Voice:**`（提供方 + 声音）、`**Voice settings:**`（例如 stability / similarity / style）、`**Voice direction:**`（整体演绎方式） |
| `## Line N — <label> (Frame N)` | 一句口播台词，与它对应的分镜帧绑定 |
| `**Time:**` | 该帧的大致时间窗口 —— 只是*参考*，不具权威性（真实时间来自 TTS 的逐词时间戳） |
| `**Delivery:**` | 逐句的演绎说明 |
| 缩进块 | **口播文本** —— 唯一会送进 TTS 的部分 |

## 示例

```markdown
# SCRIPT — acme-launch

**Voice:** Rachel (ElevenLabs)
**Voice settings:** stability 0.35 · similarity 0.75 · style 0.20
**Voice direction:** Confident, warm, a little playful.

---

## Line 1 — Hook (Frame 1)

**Time:** 0.0 – 3.0s
**Delivery:** Land the promise on the beat.

    Ship a launch video in an afternoon.

## Line 2 — The problem (Frame 2)

**Time:** 3.0 – 7.0s
**Delivery:** Wry, a touch tired.

    The old way? Prompt, wait twenty minutes, get something that misses.
```

## 送进 TTS

把每句的口播文本送给 `media-use/audio/references/tts.md` 里记载的提供方。`hyperframes tts` 命令只支持 Kokoro；使用它的 `--voice` 参数，或者在需要逐词时间戳时使用捆绑的 HeyGen 辅助脚本。真实的逐词时间会替换掉 `**Time:**` 里的参考值。
