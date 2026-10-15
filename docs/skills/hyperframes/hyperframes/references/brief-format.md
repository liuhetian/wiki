<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/brief-format.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Brief 格式 —— `BRIEF.md`

定义**意图文档** —— 一份确认后的 brief 最终落成的那个文件。填写它的问题在意图层里（`/hyperframes` → `references/intent-interview.md` 及其 `references/routes/<workflow>.md`）；字段语义在 `brief-contract.md` § 2 里。本文件只定义这个产物本身：它的形状、它的位置，以及它的生命周期。

`BRIEF.md` 位于项目根目录，项目的文件按四层来读：**`BRIEF.md`**（为什么做、给谁看，以及用户要求的一切）→ **`STORYBOARD.md`**（做什么，逐帧）→ **`frame.md`**（看起来什么样）→ **`compositions/`**（成品本身）。

## Frontmatter —— 已确认的字段

位于顶部的 YAML 块：每个确定性字段一个键 —— 先写运行形态，再写该路由用到的 registry 字段（`brief-contract.md` § 2）。存储规范化后的标准值。有些值直接来自用户；另一些，比如 `workflow`、`aspect` 和 `language`，是路由、推导或规范化得到的，必须使用契约定义的词汇。用户自己的措辞在重要时保留在正文里。

| 键 | 含义 | 示例 |
| --- | --- | --- |
| `workflow` | 执行的工作流（companion 运行记录为 `general-video`） | `faceless-explainer` |
| `flow` | `automation` —— 匹配到的工作流的流水线 · `companion` —— 在 `/general-video` 里共同创作 | `automation` |
| `storyboard` | `yes` —— 构建之前评审计划和草图（`review-loop.md`）· `no` —— 根据确认后的 brief 一次成片 | `yes` |
| `message` | 视频必须传达的那**一件**事 | `"Ship it in an afternoon"` |
| `destination` / `aspect` / `language` / `audience` / `length` / `angle` … | 这条路由确认过的 registry 字段 | —— |

**哪些键属于记忆。** 只有有偏好支撑的那一部分 —— `destination`、`aspect`、`language`、`flow`、`storyboard`、`voice`、`style_preset` —— 会用 `media-use` → `scripts/prefs.mjs record` 记录（存储会拒绝任何其他键）。`style_preset` 按工作流分别存储：记录时要带 `--workflow <w>`（不带的话存储会拒绝 —— 为某一类型片子确认的外观，不是其他类型的默认值）。`message`、`audience`、`length`、`angle` 只存在于 frontmatter 里：它们描述的是这支视频，不是用户。

## 正文 —— 用文字写下的意图

四个小节，每个都是可选的 —— 写意图层真正了解到的内容，没了解到的就省略：

- `## Intent` —— 一小段话：这支视频是什么、给谁看、为什么是现在；语气和感觉用用户自己的话。
- `## Assets` —— 用户自己的素材，每项一行：`path — what it is, where it belongs`。这里列出的文件由工作流负责放置，绝不重新去找。
- `## Customizations` —— 用户从菜单（`/hyperframes` → `references/capability-menu.md`）里选择的能力，以及任何定制要求（"营收数字做 count-up"、"把定价页也抓下来"），每项都要写得足够详细，可以直接照做。
- `## Notes` —— 一切属实但放不进任何字段的内容：约束、参考、要避免的东西。

正文文字是**项目本地的** —— 其中任何内容都不会进入跨项目的记忆。（冻结的配方会带上它的一份清空后的骨架；将来的文字记忆层会从这里提取，并遵循它自己的审批规则。）

## 生命周期

- **只创建一次，由工作流的 Setup 在 `hyperframes init` 之后作为第一个动作创建** —— 绝不提前（`init` 会拒绝非空目录）。意图层在项目存在之前确认这些答案；Setup 把它们持久化，然后记录有偏好支撑的字段。之后确认的改动更新的也是这同一个文件。
- **它是"不再重复提问"的凭证。** 发现 `BRIEF.md` 的工作流会读它，并且不问任何 brief 问题。它的 `workflow:` 写明了执行者 —— 一个工作流如果在那里发现的是另一个工作流的名字，就是走错了房间：加载那个 skill 并交出去，不要再经过意图层重新路由。没有 `BRIEF.md` 但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 这是一个 BRIEF 之前的项目：从分镜的 frontmatter 和已记录的偏好恢复，可以选择根据它们已有的内容回填 `BRIEF.md` —— 绝不重新盘问一个做了一半的项目。
- **它始终是本次运行的事实来源。** 运行中途的决定发生时就更新它：对 frontmatter 字段的明确改动（"还是做成 9:16 吧"）会改写该字段并重新记录偏好 —— 改主意也是确认过的回答；接受的能力、采用的素材或定制要求，作为一行落进对应的正文小节。恢复运行时读的是这个文件，所以写回才让中断的会话可以恢复 —— 只存在于聊天里的决定，恢复时永远看不到。
- **执行模式是推导出来的；恢复时以分镜里的那份为准。** `flow` × `storyboard` 推导出协作 / 自主的检查点行为（`brief-contract.md` § 1）。`STORYBOARD.md` 存在时，把推导出的模式持久化到它的 frontmatter 里。运行中途只切换模式时，更新的是 `STORYBOARD.md`，而不是已经确认的 `flow` 或 `storyboard`；对这两个运行形态字段中任一个的明确改动，仍然要更新 `BRIEF.md`。
- **`message` / `audience` 首先存在这里。** `STORYBOARD.md` 的 frontmatter 保留它们的副本 —— 解析器和脚本会读这些副本 —— 但两者不一致时，以 `BRIEF.md` 里用户确认过的为准。
- **配方带着它的骨架。** 冻结一个配方（`review-loop.md` § 4）时会捕获 `brief-skeleton.md` —— 保留 frontmatter 结构，清空运行形态和内容值 —— 这样下一次运行开始时就是预填好的，但仍要确认它自己的两个运行形态答案。

## 示例

```markdown
---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "Compound interest is a snowball, not a ladder"
destination: x-feed
aspect: 1080x1080
language: en
length: 60s
angle: concept
---

## Intent

Teach retail investors why starting early beats contributing more. Confident,
a little playful — closer to a bar-napkin sketch than a lecture.

## Assets

- public/growth-curve.png — the real 30-year S&P chart; the proof beat builds on it.

## Customizations

- Count-up on the final dollar figure.

## Notes

- No stock-photo aesthetics; keep it typographic.
```
