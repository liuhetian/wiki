<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/sfx.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 音效（SFX）

具名的音效，由共享的音频引擎（`scripts/audio.mjs` → `scripts/lib/sfx.mjs`）产出。由引擎唯一的开关进行**服务商分流**——是否存在 HeyGen 凭据，只判定一次（不是每个 cue 判定一次）：

- **存在 HeyGen 凭据 → 每个 cue 都去检索**，来源是 HeyGen 的音频库（`/v3/audio/sounds`、`type=sound_effects`、`min_score=0.4`）。是搜索并下载，**不是**生成。此时不会查询自带的库。
- **没有凭据 → 使用自带的 21 个文件的库**（`assets/sfx/` + `manifest.json`）：匹配每个 cue 名称，把匹配到的文件复制进项目。离线、确定性、免费。

没有 `npx hyperframes sfx` 命令。音效绝不生成——要么检索（在线），要么取自自带的库（离线）。

## Cue —— 请求 → meta

每一行写明它想要的效果：`lines[].sfx: ["whoosh", "ui click"]`。引擎把这些展平成 cue，按开关解析，对完全相同的 `(id, name)` 对去重（同一个效果被点名两次只下载 / 复制一次），然后写入 `audio_meta.sfx[]`：

```jsonc
{
  "id": "3",                       // joins the cue to the caller's model (frame / scene / segment)
  "name": "whoosh",
  "file": "assets/sfx/whoosh.mp3", // downloaded or copied, relative to project root
  "source": "heygen" | "local",    // which route resolved it
  "offset_s": 0,                   // delay from the line's start
  "duration_s": 0.57,
  "volume": 0.35                   // SFX sit UNDER voice + BGM
}
```

什么都匹配不上的 cue 会被**跳过**（记录为异常）；音效绝不会阻塞渲染。两条路径都不会替换输出名下你已有的文件：cue 会用下一个空闲的名称（`whoosh-2.mp3`），并作为异常报告出来，`file` 中记录的是真实路径。

## HeyGen 检索（有凭据）

`searchSounds(name, "sound_effects", { limit: 3, minScore: 0.4 })` → 排名第一的结果 → `assets/sfx/<slug>.mp3`。结果按 `score` 排序（每个结果都带一个预签名的 `audio_url`、`duration`、`description`）。下限设为 **0.4**，是因为好的音效结果得分在 ~0.5–0.67——低于 API 默认的 `0.7`，用默认值会悄悄丢掉大多数具名 cue（只有 whoosh/swoosh 一类能过 0.7）。`duration_s` 取自结果（否则为 1.0）。给效果起具体的名字（`glass shatter`，而不是 `dramatic sound`）；含糊的查询只会返回差强人意的匹配。

## 自带的库（无凭据）

`assets/sfx/` 中精选的 21 个文件，由 `manifest.json` 建立索引——每个 key 对应 `{ file, duration, description }`（例如 `whoosh`、`pop`、`click`、`chime`、`riser`、`impact-bass-1`、`glitch-1`、`typing`、…）。cue 名称按 **manifest key、文件 basename 或 slug** 解析，所以 `whoosh`、`whoosh.mp3` 或 `"ui click"`（→ slug）都能匹配。匹配到的文件会被复制到项目的 `assets/sfx/`；`duration_s` 来自 manifest，所以时长在**离线**时就已知——例如 `riser` 是 10.03 秒，就在 `climax − 10.03s` 触发它。manifest 的 `description` 字段带有每个效果的摆放提示；完整的集合和用法请读 `assets/sfx/manifest.json`。

## 规则

- **音量约 0.35。** 音效必须垫在旁白和 BGM 下面，而不是和它们抢。
- **没有匹配 → 跳过，不要失败。** 缺失的效果会记一条异常然后继续；绝不阻塞渲染。
- **检索（有凭据）或自带库（离线）——绝不生成。** 你要么按文字搜索 HeyGen，要么拿名称去匹配那 21 个文件的 manifest。
- **每个不同的名称一个素材。** 跨行复用会去重为一次下载 / 复制，对应多个 cue。
- **开关是全局的，不是按 cue 的。** 有凭据时，检索连长尾（不在那 21 个里的效果）也能处理；没有凭据时，只有那 21 个自带的名称能解析。
