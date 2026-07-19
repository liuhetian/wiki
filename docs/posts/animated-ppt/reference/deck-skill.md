---
name: deck-skill
description: 滚动叙事 PPT 的完整工程手册。覆盖三块：视频处理（scroll-driven MP4 的坑）、背景图位置与 layout 选择、视觉风格规范。新人看完就能改内容、加页、换图、排查视频问题。
---

# Deck SKILL — 滚动叙事 PPT 完整手册

> 本文件合并自 v0.2 的 `SKILL.md`（视频处理）、`SKILL-scene-anatomy.md`（背景图位置）、`SKILL-style.md`（视觉风格）。

!!! info "出处"
    源自 deck 项目 v0.3（2026-05-20），随本 wiki 作为活手册维护；制作背景见[《会动的网页 PPT 是怎么做出来的》](../index.md)，可运行的 deck 真身在其 `assets/deck/`。

**目录**

- 一、Scroll-Driven Video — MP4 处理（faststart / all-intra 诊断与修复、批量脚本、前端要点、循环背景）
- 二、Scene Anatomy — 背景图位置速查（九宫格速查表、情绪关键词、高频陷阱）
- 三、Deck Style Guide — 视觉风格规范（色彩 / 字体 / 8 种 layout / 数据驱动架构 / 反例）

---

## 一、Scroll-Driven Video — MP4 处理

### 适用场景

任意"滚动进度 → `video.currentTime`"的网页。**视频不是用 `play()` 播放，而是赋值 `currentTime` 让画面跟随滚动逐帧切换**。

普通导出的 MP4 在这种用法下几乎一定有问题，必须做两步处理：**faststart** + **all-intra**。

### 1.1 moov atom 位置（faststart）

**症状：**
- 视频要等几乎全部下载完才能 seek 到后面的帧
- 滚得太快时后半段直接跳到末尾
- 网络慢时整段画面卡在开头

**原理：** MP4 由 `ftyp`（文件类型）、`moov`（索引）、`mdat`（视频数据）组成。大多数编码器默认把 `moov` 放在 `mdat` **之后**（文件末尾）。浏览器拿到 `moov` 之前不知道任意 `currentTime` 对应哪段字节，只能等下完整个文件才能精确 seek。

**诊断：**
```bash
python3 -c "
import sys
def find_atoms(path):
    with open(path, 'rb') as f: data = f.read()
    i = 0
    while i + 8 < len(data):
        size = int.from_bytes(data[i:i+4], 'big')
        atype = data[i+4:i+8].decode('ascii', errors='replace')
        print(atype, 'offset=', i, 'size=', size)
        if size < 8: break
        i += size
find_atoms(sys.argv[1])
" your.mp4
```
如果 `moov` 出现在 `mdat` 之后，就是问题。

**修复（不重编码，秒级完成）：**
```bash
ffmpeg -y -i input.mp4 -c copy -movflags +faststart output.mp4
```

### 1.2 Keyframe 密度（all-intra 重编码）

**症状：**
- 视频只播开头一小段然后画面冻结或直接跳到末尾
- 即使做了 faststart 也没改善
- 快速滚动时画面"跳帧"，看不到中间帧

**原理：** 只有 **keyframe (I-frame)** 能被独立解码。中间帧 (P/B-frame) 必须依赖最近的 keyframe 顺序解码。常规编码 GOP 通常 1–10 秒一个 keyframe，5 秒短视频可能只有 1–2 个。Scroll-driven 场景下浏览器每帧都要 seek 到任意时间点，非 keyframe 位置根本来不及解码，直接放弃。

**诊断：**
```bash
# 关键帧数（应该 ≈ 总帧数）
ffprobe -v error -select_streams v:0 \
  -show_entries packet=pts_time,flags \
  -of csv=p=0 your.mp4 | grep -c K

# 总帧数
ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames -of csv=p=0 your.mp4
```

**修复（必须重编码）：**
```bash
ffmpeg -y -i input.mp4 \
  -c:v libx264 -preset fast -crf 20 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -an \
  -movflags +faststart \
  output.mp4
```

| 参数 | 作用 |
|---|---|
| `-g 1 -keyint_min 1` | 每帧都是 keyframe（GOP = 1） |
| `-sc_threshold 0` | 关闭场景切换检测 |
| `-crf 20` | 视觉无损偏上质量，可调 18–23 |
| `-pix_fmt yuv420p` | 确保所有浏览器兼容（Safari 不吃 yuv444p） |
| `-an` | 删除音轨 |
| `-movflags +faststart` | 顺手把 moov 放开头 |

**代价：** 文件大小 1.5–3 倍，但 scroll-driven 视频一般只有几秒，绝对体积仍很小（3–8 MB）。

### 1.3 一键修复脚本

同时解决 faststart + all-intra：
```bash
ffmpeg -y -i in.mp4 \
  -c:v libx264 -preset fast -crf 20 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -an \
  -movflags +faststart \
  out.mp4
```

### 1.4 批量修复（v0.2 实战经验）

**每次加入新的过渡视频都必须跑一遍。** v0.2 开发中 trans6to7 ~ trans11to11 共 6 个视频全部需要重编码，原始素材无一例外都是 1 个 keyframe / 97~121 帧。养成习惯：素材入库时立即诊断 + 修复，不要等到浏览器里发现"卡住了"再回头查。

批量脚本：
```bash
cd ./素材
for f in trans*.mp4; do
  kf=$(ffprobe -v error -select_streams v:0 \
    -show_entries packet=pts_time,flags -of csv=p=0 "$f" | grep -c K)
  total=$(ffprobe -v error -select_streams v:0 -count_frames \
    -show_entries stream=nb_read_frames -of csv=p=0 "$f")
  if [ "$kf" -lt "$total" ]; then
    echo "$f: $kf/$total keyframes — fixing..."
    mv "$f" "${f%.mp4}_orig.mp4"
    ffmpeg -y -i "${f%.mp4}_orig.mp4" \
      -c:v libx264 -preset fast -crf 20 \
      -g 1 -keyint_min 1 -sc_threshold 0 \
      -pix_fmt yuv420p -an \
      -movflags +faststart "$f" 2>/dev/null
  else
    echo "$f: $kf/$total — OK"
  fi
done
```

### 1.5 前端配套要点

**video 元素属性：**
```html
<video src="./clip.mp4" muted playsinline preload="auto"></video>
```
- **必须**：`muted` `playsinline` `preload="auto"`
- **不要**：`autoplay` `controls` `loop`（loop 仅用于循环背景视频）
- iOS Safari 必须 `playsinline`

**滚动驱动逻辑：** 本项目用 all-intra 编码后 `currentTime` 直接赋值（不缓动），因为每帧都是 keyframe，不存在 seek 延迟。如果没用 all-intra，需要 rAF 缓动逼近（系数 0.4）。

**必须用 HTTP server：** 浏览器对 `file://` 协议下的视频 seek 限制很严。本地预览用 `python3 -m http.server 8000`。

### 1.6 排查清单

1. 通过 HTTP server 访问（不是 `file://`）
2. 浏览器硬刷新清缓存（Ctrl + Shift + R）—— 改完视频不刷新最容易踩
3. `moov` 在文件开头 → 否则 `ffmpeg -c copy -movflags +faststart`
4. keyframe 数 ≈ 总帧数 → 否则 `-g 1 -keyint_min 1 -sc_threshold 0` 重编码
5. 前端：`muted playsinline preload="auto"`，`loadedmetadata` 后才读 `duration`

### 1.7 循环动画背景

当过渡视频的**首帧 == 尾帧**时，可作为无限循环背景：

1. 在 `content.js` 的 media 数组中，将该项声明为 `{ type: 'video', id: 'sN', src: '...', loop: true }`
2. `deck.js` 会自动识别 `loop: true` 的 media 并调用 `.play()`
3. 支持多个循环视频（v0.2 有 2 个：标题页 trans1to2 + 结尾页 trans11to11）

**本项目实例：**
- `trans1to2.mp4`（首尾帧 = scene1/scene2 同一张图）→ 标题页无限循环背景
- `trans11to11.mp4`（首尾帧 = scene11 同一张图）→ 结尾「感谢聆听」无限循环背景

---

## 二、Scene Anatomy — 柴犬背景图位置速查

> 所有图都是 16:9 灰底，柴犬主体占 1/3 ~ 1/2 画面，剩余大量留白。
> 文字必须落在留白里，盖到柴犬脸上 = 设计失败。
> 用 3×3 网格描述位置：TL/TM/TR · ML/MC/MR · BL/BM/BR。

### 2.1 速查表

| scene | 柴犬动作 / 配饰 | 主体位置 | 安全文字区 | 推荐 layout |
|---|---|---|---|---|
| 0 | 趴 + 绿蝴蝶结 | **BM** | 上半 / 左下角 | `hero` |
| 1 | 奔跑 | **BM** | 左半 / 右上 | `left` |
| 2 | 奔跑（同 scene1） | **BM** | 左半 / 大字压底 | `anchor` |
| 3 | 害羞坐 + 樱花 + 桃心 | **BR** | 左半 + 上半 | `left` |
| 4 | 戴黄帽倒立 + 花盆 | **BL** | 右半 | `right` |
| 5 | 玩绿色毛线球 | **MR–BR** | 左半 | `anchor` |
| 6 | 仰躺玩耍 | **TL–ML** | 右下 2/3 | `right` |
| 7 | cookies 盒 + 蓝领带 | **MR–BR** | 左半 | `anchor` |
| 8 | 趴 + 黄花 + 左侧桃心 | **BL–ML** | 右半 + 中心 | `quote` |
| 9 | 站立鼓掌 + 黄星 | **ML–MC** | 右半 + 下半 | `right` |
| 10 | 抱刺猬 + 桃心 | **MR–BR** | 左半 | `left` |
| 11 | 戴皇冠 zzz | **BM**（偏右） | 上半 + 左半 | `hero` |

### 2.2 情绪关键词

| scene | 关键词 | 情绪 |
|---|---|---|
| 0 | 静、安、待出发 | 开场 |
| 1 | 动、轻快 | 起跑 / 新章节 |
| 2 | 动、连续 | 转场 |
| 3 | 含蓄、害羞 | 犹豫选择 |
| 4 | 倒挂、不寻常 | 早期探索 |
| 5 | 好奇、捣鼓 | 养一个 Agent |
| 6 | 慵懒、放松 | 日常使用 |
| 7 | 享受、满足 | 工程化就位 |
| 8 | 安静、专注 | 深入讲解 |
| 9 | 振奋、被鼓励 | 做一个项目 |
| 10 | 拥抱、温柔反思 | 复盘 + 延伸 |
| 11 | 安睡、戴冠 | 收尾 |

### 2.3 三类高频陷阱

1. **左对齐文字 + 柴犬在左** = 盖脸 → 用 `layout-right`
2. **大字压底 + 柴犬也在底** = 互怼 → 用 `layout-left` / `layout-right` 让文字上提
3. **底部章节条 + col-stats 都在底** = 拥挤 → `layout-hero` 把 stats 横向居中

### 2.4 v0.2 实际背景分配

| 页 | scene 图 | 内容 | 备注 |
|---|---|---|---|
| s0 | scene0 | 开场等待 | |
| s1 | trans1to2 循环 | 标题页 | scene1=scene2，用视频循环 |
| s2 | scene3 | Part 1 章节页 | |
| s3–s6 | scene4 | Part 1 四个手风琴 | 共享背景 |
| s7 | scene5 | Part 2 章节页 | |
| s8–s10 | scene6 | Part 2 三个手风琴 | 共享背景 |
| s11 | scene7 | Part 3 章节页 | |
| s12 | scene8 | Harness 阶梯页 | |
| s13 | scene9 | 如何 Harness | |
| s14 | scene10 | 做一个项目 | |
| s15 | scene10 | 两条沉淀 | 与 s14 共享 |
| s16 | trans11to11 循环 | 感谢聆听 | scene11 仅用于循环动画首尾帧 |

**scene11.png 不作为静态背景使用**，它只是用于生成 trans11to11 循环视频的首尾帧。

### 2.5 如果换图

换图后本表要同步更新。流程：开一张新图 → 先想"柴犬占哪个九宫格" → 再决定走哪种 layout。

---

## 三、Deck Style Guide — 视觉风格规范

灵感来源：Brandly 风格 hero 首屏。
关键词：**编辑感 · 字号说话 · 大留白 · 单点橙色强调**。

### 3.1 色彩系统

所有颜色定义在 `:root`，改全局色调只改这里：

| token | 值 | 用途 |
|---|---|---|
| `--ink` | `#0a0a0a` | 正文 / 标题 / 边框 |
| `--paper` | `#e8e6e1` | 兜底背景（被 scene 图盖住） |
| `--letterbox` | `#000` | 16:9 stage 外的黑色信封边 |
| `--accent` | `#ff6a1a` | **唯一强调色 · 橙** |
| `--muted` | `rgba(10,10,10,0.58)` | 二级文字 |
| `--hairline` | `rgba(10,10,10,0.18)` | 细分隔线 |

**橙色用在哪：** 标题里 `<span class="accent">` 包住的一两个字、当前章节胶囊 active 时。仅此而已。

### 3.2 字体系统

| 字体 | 用途 | 权重 |
|---|---|---|
| `Archivo Black` | 主标题 / logo / 大数字 | 900 |
| `Noto Sans SC` | 所有中文 | 400 / 500 / 700 / 900 |
| `Inter` | 西文正文 / 导航 / 注释 | 400 / 500 / 600 / 700 |

**铁律：**
- 行高 **0.9–0.94**，视觉重量靠这个
- 主标题 letter-spacing **必须负**（-0.02 ~ -0.03em）
- kicker / footer-meta 用 `text-transform: uppercase` + letter-spacing 0.18–0.28em

### 3.3 版式骨架

- 16:9 letterbox，`container-type: size`，子元素用 `cqw / cqh`
- `.scene` padding：`14cqh 3cqw 10cqh`（顶部留 nav，底部留章节条）

### 3.4 八种 layout

| class | 几何特征 | 何时用 |
|---|---|---|
| `.layout-blank` | 无内容 | 开场等待页 |
| `.layout-hero` | 单列居中，巨大标题 | 开场 / 结尾 / 重磅页 |
| `.layout-left` | 文字左 60% + stats 右 30% | 柴犬在右半时 |
| `.layout-right` | 文字右 60%（右对齐） | 柴犬在左半时 |
| `.layout-anchor` | 标题撑满 + 侧边 modules | 章节封面 |
| `.layout-accordion` | 左 overview + 右 case 卡片 | 多案例并列展示 |
| `.layout-steps` | 左侧 4 步阶梯 + 右侧大标题 | 有顺序的递进关系 |
| `.layout-dual` | 双栏对比 + 底部 footer | 两个概念并列对比 |

### 3.5 数据驱动架构（v0.2 起）

所有内容在 `content.js` 的 `window.CONTENT` 对象中声明，`layouts.js` 负责渲染，`deck.js` 负责滚动和交互。加一页只需：

1. `content.js` 的 `media` 数组追加背景图/视频（新视频必须先跑 all-intra 修复）
2. `content.js` 的 `scenes` 数组追加 scene 对象，指定 `layout` 和 `chapter`
3. 标题里挑一个词包 `<span class="accent">`
4. 如需新章节：更新 `nav` + `chapters` 数组
5. `segments` 和 `sceneToChapter` 自动计算，不需手动改

### 3.6 留白节奏

- nav 离顶 `2.6cqh`，章节条离底 `4cqh`
- 列间距 `3cqw`，行间距 `3cqh`
- kicker→headline `1.2cqh`，headline→subhead `2.4cqh`

**宁可大，不要小。** 呼吸感全靠 padding 够狠。

### 3.7 反例（请勿做）

- 给段落整体上橙色（强调色失效）
- 给 `.stat` 加圆角卡片底（变 dashboard）
- headline 行高 > 1.2（丢视觉重量）
- 同一 scene 用 2+ 个 `<span class="accent">`（焦点散）
- 把 `cqw` 改成 `vw`（响应式会爆）
