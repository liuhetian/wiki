<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/tracks-and-clips.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Track 与 Clip

clip 是 composition 中有计时的元素。track 是 Studio 的显示概念：渲染从不读取它。

## 什么是 Clip

clip 是任何带有 `data-start`、并在需要时带有 `data-duration` 的 DOM 元素。`data-track-index` 是可选的。常见种类：

- **视觉 `<div>` clip** —— 场景、卡片、overlay。始终需要 `data-duration`。
- **Sub-composition 宿主** —— 带有 `data-composition-src` 的 `<div>`。始终需要 `data-duration`。
- **视频 clip** —— `<video playsinline>`。有声：`data-has-audio="true"`（声音留在 clip 上）。无声：`muted`。时长可以默认取媒体长度。
- **音频 clip** —— `<audio>`。时长可以默认取媒体长度。
- **图片 clip** —— `<img>`。`data-duration` 可选，默认 3 秒；只有要别的长度时才写它。

给编写的视觉 clip 加上 `class="clip"`。runtime 不读取它，但脚手架共享的 `.clip { position: absolute; inset: 0 }` 规则正是给场景提供全画幅盒子的东西，Studio 把它当作编辑提示，没有它 `lint` 还会警告。

## Track 是显示泳道

`data-track-index` 是 clip 在 Studio timeline 中占据的那一行。渲染**不**读取它，它也不约束任何东西：

- **同一 track 上的两个 clip 可以在时间上重叠。** 没有任何东西会拒绝它，渲染结果也是明确定义的：两者都可见，按 CSS 顺序绘制。
- **视觉层叠（前 / 后）** 由 CSS 的 `z-index` 控制，而不是 track index。
- **省略它没问题。** 解析器会给它默认值，然后 Studio 为每个 clip 排一条泳道。

track `5` 上的 clip 并不在 track `1` 上的 clip 「之上」。层叠用 CSS，排序用 `data-start`/`data-duration`。

这个值唯一有意义的地方：两个共享同一 track index **并且**在时间上重叠的 `<audio>` 元素会引发 `lint` 警告（`duplicate_audio_track`），这是一个有用的提醒，说明你正要把一条铺底音轨叠成两份。

## 挑选 Track Index

纯粹是为了让在 Studio 里打开文件的人读得更清楚。常见模式由 `/hyperframes-studio` 负责（一条字幕 track，每个 track 一种元素）。

向已有的 composition 添加 clip 时，参照它周围的 clip 设置它的 `data-start`/`data-duration`。你不需要去找一条空闲的泳道，重新计时之后也永远不需要给 track 重新编号。

## Composition 内的 Clip 时间

`data-start` 以秒计，从 _composition_ 的起点开始量。对于 sub-composition，sub-composition 内部的 timeline（它自己的 `data-duration` 和子 clip）从宿主的 `data-start` 运行到 `data-start + data-duration`。

`data-media-start`（用在 `<video>`/`<audio>` 上）是*在源媒体内部*的偏移。用它跳过媒体文件开头的几秒，而不必修剪文件本身。

## 把一个源素材切成多个区间

要做硬切、修剪、拼接或重排，就把同一个视频源复制成多个 clip 元素。每个副本用 `data-media-start` 加 `data-duration` 选出它的源素材区间，再用 `data-start` 把这个区间放到编写的 timeline 上。改变的是源偏移和放置顺序；不要试图用关键帧来做源素材剪切。

每个视频片段都保留它的声音：声音留在 clip 上（`data-has-audio="true"`），所以切视频就会同时切掉它的声音。单独的 `<audio>` 用于其他声音（音乐、旁白、替换音频、J/L 切）。

## 关联的 Clip { #linked-clips }

`data-link="<id>"` 标记那些被当作一个整体编辑的 clip：在 Studio 里，移动、修剪、拆分或删除其中一个成员，会对其他成员做同样的操作。在 Studio 里分离音频（Detach）会产生一对：一个静音的 `<video>` 和一个指向同一文件的 `<audio>`：

```html
<video
  id="talk"
  src="talk.mp4"
  muted
  data-link="lk-1"
  data-sync-origin="lk-1"
  data-start="2"
  data-duration="6"
  data-media-start="1"
  data-track-index="0"
></video>
<audio
  id="talk-audio"
  src="talk.mp4"
  data-link="lk-1"
  data-sync-origin="lk-1"
  data-start="2"
  data-duration="6"
  data-media-start="1"
  data-track-index="2"
></audio>
```

- **Link 的提供条件。** Studio 只在恰好选中一个视频和一个音频、且两者都尚未关联时提供 Link；它们的计时和源文件无关紧要。有偏移的关联对会一起移动（偏移保持不变），而修剪只有在搭档的边缘处于同一时间时才会带到搭档上。合并回去（Merge back）需要同一个文件，并且这一对是同步的。
- **让成员保持同步。** 每个成员都需要相同的 `data-start`、`data-duration`、`data-media-start`（缺省 = 0）和 `data-playback-rate`（缺省 = 1）。track index、音量、淡入淡出和效果器（FX）可以不同。当你手动给一个成员重新计时时，要给所有成员都重新计时，否则 `lint` 会警告 `linked_clips_out_of_sync`。
- **取消关联（Unlink）** 的方法是从每个成员上移除 `data-link`。只从一个成员上移除，会让另一个成员独自留着这个 id，`lint` 会把它标记为 `linked_clip_orphan`。
- 渲染会忽略 `data-link`：不同步的一对仍然会严格按照各自的计时播放。
- 对于有声素材画面，优先使用单个 `<video data-has-audio="true">`。只有当声音需要自己的 clip（自己的 track、音量或效果器）时才关联；要撤销一次分离，就把音频属性挪回视频上，并删除 `<audio>`。
- **同步原点。** `data-sync-origin="<id>"` 标记来自同一个源文件的一个视频和一个音频；Detach 会写入它，Link 只在这一对来自同一个源文件时才写入它，Unlink 会保留它。当这一对发生漂移（它们的源素材零点 `data-start − data-media-start / data-playback-rate` 不同）时，Studio 会在两半上都以帧为单位显示红色的偏移，并提供 Move into Sync / Slip into Sync，`hyperframes timeline` 会打印 `out-of-sync=±Nf`，SDK 则提供 `syncOffset`、`moveIntoSync` 和 `slipIntoSync`。手动重新计时时不要动它；只有当这些 clip 不再来自同一个源素材时才移除它。
- `@hyperframes/sdk` 的 `setTiming` 默认会作用于关联搭档；传入 `{ linked: false }` 来只编辑一个成员，这会取消它的关联。

## 相对计时

`data-start` 接受一个 clip ID 来代替数字，意思是「在那个 clip 结束时开始」。加上 `+ N` / `- N` 来偏移；负值会产生重叠（对交叉淡化很有用）。

```html
<video id="intro" data-start="0" data-duration="10" data-track-index="0" src="..."></video>
<video id="main" data-start="intro" data-duration="20" data-track-index="0" src="..."></video>
<video
  id="scene-a"
  data-start="intro + 2"
  data-duration="20"
  data-track-index="0"
  src="..."
></video>
<video
  id="scene-b"
  data-start="intro - 0.5"
  data-duration="20"
  data-track-index="1"
  src="..."
></video>
```

规则，以及三种会**静默**失败的情况。`lint` 不检查其中任何一项，所以在使用引用之前先读一遍：

- **运算符两侧必须有空格。** `data-start="intro - 0.5"` 的意思是「在 `intro` 结束前 0.5 秒」。`data-start="intro-0.5"`（没有空格）会被解析为对一个 id 字面上就是 `intro-0.5` 的元素的引用；这个元素并不存在，于是 clip 静默地从 0 开始。
- **无法解析的引用会解析为 0**，而不是报错。打错的 id，或者不在文档里的目标，会把 clip 放到 composition 的开头。
- **如果目标没有可解析的时长，引用会落在目标的起点（START），而不是终点。** 所以当 `hero` 既没有 `data-duration`、也没有已知的媒体长度时，`data-start="hero"` 会静默地变成「和 `hero` 同时」，而不是「在 `hero` 之后」。
- **循环引用会解析为 0**，而不是报错。`A → B → A` 会把其中一个放在 0。
- 查找是**全文档范围**的（先 `getElementById`，再 `[data-composition-id]`）。因此引用可能会够到组装后页面上另一个 composition 里的目标。让被引用的 id 保持唯一，并把引用和它的目标放在同一个文件里，否则结果会取决于组装顺序。
- 能被解析为数字的值始终是绝对秒数。否则解析器期望的是 `<id>`、`<id> + <number>` 或 `<id> - <number>`。
- 引用可以链式串联（`A → B → C`）。为了可读性，把链条控制在 3–4 层以内。
- 负偏移会产生重叠，这是允许的。重叠的 clip **不**需要放在不同的 track 上。

因为上面每一种失败模式都是静默的 0，所以要对使用引用计时的 composition 做 snapshot，检查 clip 是否真的从你想要的地方开始。
