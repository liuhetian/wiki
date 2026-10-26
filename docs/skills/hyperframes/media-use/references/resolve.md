# Resolve —— 命令、参数、复用、收编（adopt）、清单

```bash
npx hyperframes media-use resolve --type <type> --intent "<description>" --project <dir>
```

返回一行：`resolved <id> → <path> (<type>, <metadata>)`

## 类型

| 类型 | 找什么 | 提供方 / 级联顺序 |
| --- | --- | --- |
| `bgm` | 背景音乐 | HeyGen 音频目录（1 万+ 曲目） |
| `sfx` | 音效 | 随附的 19 个文件的音效库 + HeyGen 目录 |
| `image` | 照片、背景 | HeyGen 素材搜索（7.5 万+ 向量） |
| `icon` | 图标、符号 | HeyGen 素材搜索（type=icon） |
| `logo` | 官方品牌标志 | theSVG → GitHub org 头像 → 域名 favicon |
| `voice` | TTS 旁白 | HeyGen TTS 免费使用路径；可选本地 Kokoro |
| `grade` | HyperFrames 调色块 | 核心 preset → 风格索引 params/CDN LUT → 确定性 cube |
| `lut` | 可复用的 `.cube` LUT 文件 | 风格索引 params/CDN LUT → 确定性 cube |

## 示例

```bash
# Background music
npx hyperframes media-use resolve --type bgm --intent "upbeat tech launch" --project .
# → resolved bgm_001 → .media/audio/bgm/bgm_001.mp3 (bgm, 25s)

# Sound effect
npx hyperframes media-use resolve --type sfx --intent "whoosh" --project .
# → resolved sfx_001 → .media/audio/sfx/sfx_001.mp3 (sfx, 0.57s)

# Image
npx hyperframes media-use resolve --type image --intent "gradient tech background" --project .
# → resolved image_001 → .media/images/image_001.jpg (image)

# Icon
npx hyperframes media-use resolve --type icon --intent "rocket" --project .
# → resolved icon_001 → .media/images/icon_001.png (icon, transparent)

# Brand logo (official mark — never redrawn by hand)
npx hyperframes media-use resolve --type logo --entity linkedin --intent "LinkedIn logo" --project .
# → resolved logo_001 → .media/images/logo_001.svg (logo, official mark)

# Color grade block
npx hyperframes media-use resolve --type grade --intent "warm daylight" --project . --json
# → {"ok":true,"preset":"warm-daylight","grading":{"preset":"warm-daylight","intensity":1},...}

# LUT file
npx hyperframes media-use resolve --type lut --intent "teal orange blockbuster" --project .
# → resolved lut_001 → .media/luts/lut_001.cube (lut)
```

## 参数

| 参数 | 说明 |
| --- | --- |
| `--type, -t` | 媒体类型：bgm、sfx、image、icon、logo、voice、grade、lut |
| `--intent, -i` | 你需要什么（自然语言） |
| `--entity, -e` | 用于缓存匹配的实体名（可选） |
| `--project, -p` | 项目目录（默认：.） |
| `--candidates` | 列出 `--type` 对应的可复用素材（项目 + 全局缓存）；不下载，不做修改 |
| `--reuse <sha>` | 导入某个指定的全局缓存素材（按内容 sha/前缀，取自 `--candidates`） |
| `--from` | 冻结一个本地文件或一个直接的公共 URL（导入） |
| `--for` | 分析一个本地图片/视频，并加入实测得到的 adjust 建议（仅限 `grade`） |
| `--local-only` | 离线：跳过所有网络提供方（只用缓存 + 本地） |
| `--provider` | 强制使用某一个生成器（例如 `codex`、`mflux`、`kokoro`、`heygen`） |
| `--adopt` | 把已有的 assets/ 批量导入 manifest |
| `--doctor` | 检查本地 CLI 依赖；不修改 manifest |
| `--stats` | 打印来自 `.media/` 和 `~/.media` 的本地使用统计；不修改 manifest |
| `--days N` | 把 `--stats` 限制为最近 N 天内带时间戳的记录/未命中 |
| `--json` | 输出 JSON，而不是一行结果 |

## 先复用再解析 { #reuse-before-you-resolve }

在解析 bgm/sfx/image/icon/logo/grade/lut 之前，**先检查已有什么，合适就复用。** media-use 不会替你做语义匹配 —— 你才是裁判。它负责把候选摆出来；由你决定。

```bash
npx hyperframes media-use resolve --type bgm --intent "upbeat tech launch" --candidates --project .
#   [project] upbeat tech launch (25s, heygen.audio.sounds)
#           .media/audio/bgm/bgm_001.wav
#   [global]  energetic tech intro (22s, heygen.audio.sounds)
#           --reuse 06e052c075fd2b80
```

读这份列表，自己判断语义是否契合 —— "upbeat tech launch" ≈ "energetic tech intro" 这种判断只有你能根据描述做出。然后：

- **某个项目候选合适** → 直接在你的 composition 里引用它的路径。不需要再运行别的。
- **某个全局候选合适** → `resolve --type bgm --reuse <sha>` 会把它复制进本项目（保证渲染自包含）并记录下来。
- **都不合适** → 重新解析（`--type ... --intent ...`）。

**信任护栏 —— 拿不准时，就重新解析。** 多下载一次很便宜；交付错的素材代价可不小。根据描述 + prompt + 类型 + 时长/尺寸判断是否契合。对于**品牌/实体**素材，只有当实体完全一致时才复用*全局*候选 —— 全局缓存汇集了你做过的每一个项目，所以 `--candidates` 列表可能会冒出另一个客户的品牌标志及其 prompt 文本。绝不要凭宽松的匹配复用跨项目的品牌素材。

确定性的底线仍会自动运行：完全相同（忽略大小写/空白）的重复请求会自动复用，不需要 `--candidates` 这一步。`--candidates` 只用于这条底线之上的语义层 —— 模糊匹配**绝不**会被自动应用；复用永远是你的显式决定。当一次解析没有命中底线、即将去获取时，如果存在相似的已缓存素材，media-use 会在 stderr 打印一行提示，把你指回这里。

## 工作原理

`resolve` 先运行自动的底线检查，然后落到获取步骤：

1. 在项目的 `.media/manifest.jsonl` 里检查 prompt 是否匹配（忽略大小写和空白）—— 自动复用
2. 扫描已有的 `assets/` 目录，找与需求有共同词的未登记文件
3. 在全局缓存 `~/.media/` 里检查是否有按同一归一化 prompt 匹配的可复用素材 —— 自动复用
4. 通过提供方搜索（HeyGen 音频目录、HeyGen 素材搜索），或在本地解析色彩
5. 把文件冻结到 `.media/<type>/`，在 manifest 里登记，重新生成 `index.md`，自动晋升到 `~/.media/`

第 1 步和第 3 步是**确定性的底线**：它们只自动复用归一化后完全一致的匹配，绝不复用模糊匹配。语义复用（"足够接近"）是 agent 通过[先复用再解析](#reuse-before-you-resolve)做出的显式决定 —— 它绝不会自动发生。agent 拿回的只有**一行**结果；候选、分数和来源出处都留在磁盘上。

## 挂载已解析的视频时标记来源出处

`resolve` 自己绝不写 composition HTML —— 把 `<video>` 元素挂载进 composition 永远是 agent 自己的编辑。当被挂载视频的 manifest 记录里有 `provenance.provider === "heygen.video"` 时（查看 `.media/manifest.jsonl`，或 resolve 一行输出里的提供方名），给那个 `<video>` 标签加上 `data-media-source="heygen"`。对其他所有提供方（`ltx.local`、收编的/本地的文件等）完全不要加这个属性 —— 这不是一套通用的提供方分类，只是渲染遥测目前追踪的那一个信号。

## 收编已有项目

大多数 HyperFrames 项目在 `assets/` 里已经有素材。media-use 会收编它们：

```bash
npx hyperframes media-use resolve --adopt --project .
# → adopted 9 assets from assets/
#   bgm_001 → assets/bgm/mango-fizz.mp3 (bgm, 146.6s)
#   image_001 → assets/images/avatar.jpg (image, 400×400)
```

`ffprobe` 提取真实的时长和尺寸。解析过程中，`assets/` 里与意图匹配的未登记文件会被即时收编。

## 读取清单

resolve 或 adopt 之后，读 `.media/index.md` 获取完整清单：

```
# .media · 4 assets

id         type   dur   dims       path                          description
bgm_001    bgm    25s   -          .media/audio/bgm/bgm_001.mp3  upbeat tech launch
sfx_001    sfx    0.6s  -          .media/audio/sfx/sfx_001.mp3  whoosh
image_001  image  -     1920×1080  .media/images/image_001.jpg   gradient tech background
icon_001   icon   -     200×200    .media/images/icon_001.png    rocket
```

## 跨项目复用

素材在解析时会被自动缓存。每个解析/导入的素材都会自动晋升到 `~/.media/` 的全局缓存，所以之后在任何项目里对相同（或几乎相同）prompt 的解析都会命中缓存，无需重新下载，也不调用提供方。

对于另一个项目里*语义上*相似（但不完全相同）的需求，精确匹配的底线不会触发 —— 使用[先复用再解析](#reuse-before-you-resolve)：`--candidates` 列出全局素材，`--reuse <sha>` 导入你挑中的那个。当措辞不同时，一个项目里解析过的曲目就是这样在下一个项目里被复用的。
