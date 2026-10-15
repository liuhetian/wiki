<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/production-loop.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 制作循环 —— 从批准的计划到交付的视频

从用户同意的计划到交到他们手里的视频，中间的各个阶段，这里写成**依赖关系，而不是编号步骤**：相互独立的阶段之间顺序自由 —— 帧在构建的同时音频在后台渲染；这是标准技巧 —— 一条依赖链内部的顺序则不自由。本文件不涉及任何面向用户的内容：所有面向用户的暂停都在 `review-loop.md` 里，本文件只标出那些评审轮挂接的位置。有些路由带着自己的主干（一个节拍网格、已有的素材画面）—— 各阶段围绕它组合。不需要的阶段就直接不运行：没有旁白，就没有音频阶段；只有一个场景，就没有转场。编辑请求从它所涉及的那个产物处进入，然后重新运行 Verify。

内置的叙事类工作流用它们自己的脚本实现这些阶段；自由形式的构建直接遵循本文件，并在能力菜单（`hyperframes/references/capability-menu.md`）指明的地方借用工具。

| 阶段 | 需要 | 产出 | 能力所在位置 |
| --- | --- | --- | --- |
| **Block 与素材** | 批准的计划 | registry block **在任何并行工作之前一次性**装好（并行的 worker 会争抢 registry）；用户素材放置到位；logo / 图片 / 调色获取完毕 | 计划点名的每个 block 运行一次 `npx hyperframes add <block>`；放置、纳入和 `resolve` 走菜单中的媒体相关行 |
| **音频** | 旁白文本（有旁白时）；分镜的 `music:` 情绪 | 配音文件 + **逐词时间** + BGM + 音效 → `audio_meta.json`；**当 BGM 在人声下方播放时，要在 Verify 之前对垫乐做挖空**（`hyperframes-audio/scripts/carve.mjs`）—— 仅做闪避不算完成的混音 | 唯一的引擎 —— `media-use/audio/scripts/audio.mjs`，在后台运行；BGM 是生成的时，渲染前先跑 `wait-bgm.mjs` |
| **帧** | 设计规范 + 计划（+ 存在时，`storyboard.html` 里一个已确认的草图格子 —— 给那个布局穿上衣服，绝不重画：`review-loop.md` § 3） | 每个场景位于 `compositions/frames/NN-*.html`，落地时在分镜里标为 `animated` | `frame.md` + `hyperframes-animation` 的蓝图 / 规则（+ 类型视角，见菜单 § 类型视角）；按 `subagent-dispatch.md` 并行派发 |
| **时长同步** | 逐词时间 + 帧 | 场景时长按真实配音长度校准 —— 以真实时长为准，无声场景保留估计值，同步后的值绝不手改 | 一条机械规则；叙事类工作流的音频脚本会应用它，自由形式的构建手动应用 |
| **组装** | 帧 | index composition —— 各场景作为 sub-composition 排在 track 上 | `sub-compositions.md` + `tracks-and-clips.md`；可借用的 `assemble-index.mjs`（见菜单） |
| **转场** | 组装好的 index | 注入场景之间的交接 | `hyperframes-animation/transitions/overview.md` → `catalog.md`；可借用的 `transitions.mjs`（见菜单） |
| **字幕** | 逐词时间 + index | 字幕 track | 可借用的 `captions.mjs`（见菜单）；没有可用来对时的脚本 → 先跑 `media-use` 的 `scripts/transcribe.mjs` |
| **验证（Verify）** | index（+ 有字幕 / 转场时也包括它们） | `npx hyperframes lint` 和 `npx hyperframes check` **通过**；扫一眼联系表（`snapshot --at <frame-midpoints>`） | `hyperframes-cli` |
| **交付** | 验证通过 | 最终查看暂停 → 批准后 `render` → 可选 `publish`（一个稳定的托管链接，默认私有）→ 提出保存配方 | 最终批准和配方提议：`review-loop.md` § 4；渲染 / 发布：`hyperframes-cli` |

帧阶段遵循计划中的引用：计划时基于某个蓝图或具名规则的场景，在写它的动效之前，要先读那份配方的正文（`hyperframes-animation/blueprints/<id>.md`、`rules/<id>.md`）—— 名字来自索引，绝不自己编；计划里没有给出引用的场景，在构建时补上引用，而不是即兴编动效。

## 调度的经济学（你在会话内部看不到的事实）

- **外部生成是独立的工作。** 图片底板、TTS、BGM、视频生成：凡是提示词已经确定的生成，都**并发或在后台**一起发出，并把等待时间和阅读或构建重叠起来。三张图片底板一张接一张地生成，耗费的实际时间约是一起发出的 3 倍。
- **附上一张图片会让你的整个上下文重新计价。** 会话中途检查图片（尤其是原始细节级别）会让提示缓存失效 —— 下一个请求会以全价重新发送你的整个历史。把视觉检查合并起来（一张联系表胜过 N 次单帧查看），并安排在阶段边界上，而不是构建中途。

有两个挂接点把用户的声音带进这个循环：启动它的计划是在 `review-loop.md` § 1 批准的（协作），或者以预告的形式发出的（自主）；以及在 § 4 的最终查看之前什么都不渲染。这两者之间的一切，都由你来调度。
