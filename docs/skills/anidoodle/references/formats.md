# 格式：你在做的是什么，以及每一种怎么交付

一切都是一个 `Film`：meta、铺满 `[0, duration)` 的镜头，以及可选的配乐。静帧是一部只有一帧长的影片，所以每个工具都适用于每一种格式。按你需要的种类生成脚手架：

```bash
node <skill>/engine/tools/scaffold.mjs ~/art --still hero      # a picture
node <skill>/engine/tools/scaffold.mjs ~/art --film intro      # something that moves
```

## 静帧：主视觉、点缀插图、封面、卡片、图解

放在网站上标题旁边、配合页面底色和品牌的插画：[workflows/site-art.md](workflows/site-art.md)。

- **尺寸是 `meta.W` x `meta.H`**，以逻辑单位计；`--scale` 在渲染时把它乘上倍数，所以一份源文件就能给出缩略图（`--scale 0.5`）、页面图（`1`）和印刷图（`--scale 3`）。常见尺寸：1600x900 网页主视觉、1200x630 社交卡片、1080x1080 方形帖子、1080x1350 竖版帖子、300 dpi 下的 2550x3300 信纸。
- **`node tools/still.mjs hero --out out/hero.png`** 把它画两遍，两次的哈希一致时打印 `reproducible`。这一行就是收据，证明明天还会拿回同一个文件。在一个浏览器里画一件运动作品的多帧：`--frames 0,450,900`（或 `0-900:150`），配上 `--sheet out/sheet.jpg` 就得到一张 0.4 倍的联系表（[working-method.md](working-method.md)）。
- **透明背景**：跳过纸张填充，页面就保持透明，这样一幅点缀插图或一个图标就能放到任何网站底色上。`g.paper()` 也不要用：在透明像素上，它会把颗粒铺成一层灰纱。把纸纹改放到笔触里去（`ink` 和 `paint` 组会自己加纹理）。
- **一个系列**是一个绘制函数加许多种子或参数：一组博客头图、每位团队成员一张卡片、一家子空状态图。把变化放在模块顶部的一张表里，逐行渲染；`styleGallery.ts` 展示了怎样把多个样张组合到一页上。
- **讲解图或信息图**静帧：先画出那样东西，再用 `drafting.ts` 的 `letter()` 和用 `g.pen` 画的引线给它加标注。数字是内容，所以样张上的每一个数字都来自旁边注释里写明的一个出处。

静帧的审批闸门就是静帧本身：渲染一次，对照手艺及格线的对照表写一份自我批评，然后拿给人看。

## 没有故事的运动：循环动画、贴纸、标志、氛围画

- **无缝循环动画**：所有东西都由 `t = local / DURATION` 驱动，经过在 `[0, 1)` 上恰好重复整数次的函数（`sin(2 * PI * k * t)`，`k` 为整数）。这样第 `DURATION` 帧就等于第 0 帧，接缝随之消失。检查它：渲染最后一帧和第 0 帧，拿它们去和循环中段的一对相邻帧比较；或者对渲染出的文件运行 `node tools/verify-export.mjs <name> --loop`，它会拿最后一帧到第一帧的变化量，去和这段循环自身中段的帧间变化量比较。
- **动态标志 / 贴纸**：2 到 4 秒，标志是被**画**出来的（`g.pen` 上的 `progress`、`letter`），一次落定，一个小小的待机动作。背景不涂，保留透明。
- **氛围 / 待机画**（一个会呼吸的网站页头、一条横幅）：题材从不停下；动作很小，但无处不在。`banner.ts` 是完整示例。
- **冷场规则照样适用**：任何长于一帧的作品，闸门都会测它。

## 影片：讲故事的那种

30 到 90 秒，一场变形，一份配乐，完整流程见[入口页](../index.md)，准则见 [storytelling.md](storytelling.md)、[music/index.md](music/index.md) 和 [working-method.md](working-method.md)。[example/](../example/index.md) 是完整做过一遍的那个示例。

## 交付

| 输出 | 命令 | 用途 |
|---|---|---|
| PNG | `node tools/still.mjs <name> --out out/x.png [--scale 2]` | 静帧、印刷、任何静态的东西 |
| MP4 | `node tools/render.mjs <name>` | 带配乐的影片、社交视频 |
| GIF | `node tools/render.mjs <name> --out out/x.gif [--width 640] [--gif-fps 15]` | 循环动画、README 头图、邮件 |
| WebM | `node tools/render.mjs <name> --out out/x.webm [--width 512]` | 贴纸和叠加层，保留 alpha（VP9） |
| APNG | `node tools/render.mjs <name> --out out/x.apng [--width 512]` | 在所有浏览器里都能播放的带 alpha 循环动画 |
| HTML | `node tools/emit.mjs <name> --out out/x.html` | 作品本身：一个离线文件，双击就能带着声音把它重新画出来 |

对每一种运动格式都适用的渲染选项：

- `--poster-frame N [--poster-fade 6]`：各平台会把第 0 帧当作缩略图。文件以第 N 帧开场（画风墙、标志、写得很大的提示词），并在第 6 帧之前叠化进真正的开场。帧数和配乐都不变。交付文件的第 0 帧如果几乎空白，编码之后会收到一条警告。
- `--blur auto`（或 `--blur N`）：运动模糊，每个输出帧是快门期间各子帧的平均，在线性光里计算并按 alpha 加权（所以透明的 WebM 或 APNG 不会出现暗边）。`auto` 测量每一帧在屏幕上的运动（在快门两端各渲染一张清晰帧，做块匹配；正在画的笔画、正在打出的字母和半调图案不会被误认成运动），并以最多相隔 `--blur-px`（默认 3 px）的间距取子帧：静止的一帧取 1 个，原样输出，一次甩镜最多取到 `--blur-max`（32）个。结果是确定性的。`--shutter DEG` 是快门角度，默认 180（360 是旧的整帧快门）。步进式的画（`meta.step` > 1、`onTwos`）绝不加模糊。
- `--shapes 16x9,1x1,4x5,9x16`：把一部发布模板影片按同一条时间线渲染成每一种画幅（每种都按它自己的布局重新构图，绝不裁切），输出到 `out/<name>-<shape>.mp4`。任何工具都接受 `<name>-<shape>` 作为某一种画幅下的影片名。
- `--from F --to T`：只渲染 `[F, T)` 这些帧，无声，写入 `out/<name>.<F>-<T>.<ext>`，绝不覆盖完成的影片。用于检查一段，不用于交付。
- `--hashes out/x.md5`：交给编码器的每一帧的 md5，用来在任何编解码器把差异糊掉之前，逐帧精确地比较两次渲染。

任何编码之后，`node tools/verify-export.mjs <name> [--first-frame #hex] [--fidelity-psnr 40]` 证明磁盘上的文件就是这部影片：大小、精确帧数、时长、配乐（当且仅当影片有配乐时才有一条音频流，长度与画面一致，不是静音）、它的**同步**（把解码出来的声音与母版混音在 `meta.sync` 的每一个标记处做互相关，误差在 1 ms 以内，并且每个 cue 的起音都落在母版安排的位置上）、编码之后的真峰值（`--delivery` 下为 -1 dBTP），以及可选的第一帧平均颜色和它对源帧的保真度（`--frame N` 指定 `--fidelity-psnr` 比较哪一帧；默认 0）。除了容器层面的事实，其余全部按需开启，所以透明的和非均匀的作品都能干净地通过。对要交付的文件，加上 `--delivery`：这时几乎空白的第 0 帧会**判为失败**，而不是警告；修法是 `render --poster-frame N`。

静帧只需要一个浏览器（`npx playwright-core install chromium`）。任何会动的东西还需要 `ffmpeg`。`gate.mjs` 对所有这些都能跑，并把不适用于该作品的检查——无声循环动画的音频、静帧的冷场——标为 `----`，而不是让它们通过。
