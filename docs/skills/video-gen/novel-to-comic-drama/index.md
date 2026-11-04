---
name: 小说转漫剧
description: "要把网文小说做成竖屏 AI 漫剧或推文视频时用：爆款开头、二创改写、角色提取、分镜、画面提示词、视频提示词，一步一段 prompt，按题材挑版本；分句、按时长切镜、拼下一步的输入和格式校验交给脚本，不调模型"
---

# 小说转漫剧

把一篇网文小说做成竖屏短视频：先写一个抓人的开头，提出角色，把文案切成镜头，给每个镜头写生图提示词，再让画面动起来。每一步是一段独立的 prompt，同一步按题材备了几个版本，挑一个读那一页照做；人用的话，在那一页填好空、点复制，整页粘进对话框。几步之间的机械活 —— 分句、按配音时长切镜、把句号范围展开成镜头文案、拼下一步的输入、核对序号和 `@名` —— 交给两个脚本，不调模型。如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](novel-to-comic-drama.tar.gz)下载到本地。

## 按环节挑 { #steps }

| 我想…… | 用 | 要准备什么 |
|---|---|---|
| 给小说写一个推文开头 | [爆款开头](hook/index.md) | 小说原文 |
| 改写别人的文案或小说：降重、仿写、换性别、换名字 | [二创改写](rewrite/index.md) | 原文 |
| 提出全部角色，定每人的形象；或者标出主角各时期 | [角色与时期](characters/index.md) | 小说全文 |
| 把文案切成镜头 | [分镜](storyboard/index.md) | 编号短句 |
| 在小说和竖屏漫剧分镜脚本之间互相改写 | [小说与剧本互转](script/index.md) | 小说或剧本，转剧本还要人物时期表 |
| 给每个镜头写生图提示词 | [画面提示词](image-prompt/index.md) | 镜头文案、角色信息 |
| 把画好的镜头做成视频 | [视频提示词](video-prompt/index.md) | 镜头文案、画面提示词、时长 |
| 不先出图，一步出图片和视频提示词 | [图文提示词](image-video-prompt/index.md) | 镜头文案、角色信息 |

题材版本挑和小说对得上的；对不上就用通用或默认版。

## 几步共守的约定 { #conventions }

- **`**@名**` 引用预设**：角色、场景、物品各是一个预设，提示词里只写 `**@标准名**`，不写外观 —— 外观由出图时传的参考图定，同一个人每个镜头才长得一样。标准名是预设信息里「角色：」后、分号前的名字，别名一律换成它
- **预设信息一行一个**：`角色：名；别名：A、B 描述：……`，场景、物品照这个格式写；没有场景、物品信息就留空，prompt 会按文案推理
- **输出一镜一行**：以 `[开始输出]` 开头、`[输出完成]` 结尾，每个镜头一行，以 `[N]` 开头；图文提示词一行里用 `===` 隔开图片和视频两部分。脚本按这个格式读

## 一条流水线怎么接 { #pipeline }

命令在本 skill 目录下跑，脚本是 [`shots.py`](scripts/shots.py) 和 [`check.py`](scripts/check.py)，子命令看 `-h`。`check.py` 发现问题退出码是 1，只把出错的镜头挑出来单独重跑。

1. **文案**：要改写的先过[二创改写](rewrite/index.md)；洗稿完用 `python3 scripts/check.py lines 原文.txt 改写.txt` 核对行数。[爆款开头](hook/index.md)写好的开头接在正文前面，就是推文文案
2. **角色**：[角色形象设计](characters/design.md)出每人一行形象，整理成上面那种预设信息，存成 `角色.txt`，后面每一步都要
3. **分句**：`python3 scripts/shots.py split 文案.txt > 短句.txt`。已经配好音的，用配音字幕：`python3 scripts/shots.py srt 配音.srt > 短句.txt`，每句带上时长
4. **分镜**：短句粘进[分镜](storyboard/index.md)，得到 `[N] X-Y` 的句号范围，存成 `分镜.txt`；核对 `python3 scripts/check.py shots 分镜.txt --lines 短句.txt`。只按 5 秒硬切的，不调模型：`python3 scripts/shots.py cut 短句.txt > 分镜.txt`
5. **镜头文案**：`python3 scripts/shots.py expand 分镜.txt 短句.txt > 镜头.txt`；短句不带时长、后面又要时长的，加 `--seconds 5`
6. **画面和视频**，两条路挑一条：
    - 先出图再动起来：`镜头.txt` 粘进[画面提示词](image-prompt/index.md)，输出存成 `图片.txt`，`python3 scripts/check.py names 图片.txt --names 角色.txt --write` 统一 `@名`；再 `python3 scripts/shots.py expand 分镜.txt 短句.txt --images 图片.txt > 视频输入.txt`，粘进[视频提示词](video-prompt/index.md)，输出用 `python3 scripts/check.py segments 视频.txt --shots 视频输入.txt` 核对时间段
    - 一步出：`镜头.txt` 粘进[图文提示词](image-video-prompt/index.md)，同样用 `check.py names` 统一 `@名`
7. **出图、出视频**：走 Agent 基础能力的[生成编辑图片](../../agent-io/reference/image.md)和[生成视频](../../agent-io/reference/video/index.md)，提示词里每个 `**@名**` 对应的参考图一并传上

改成竖屏漫剧剧本是另一条路：先出[人物时期表](characters/periods.md)；`python3 scripts/shots.py chunk 小说.txt --out 段落` 切成约 1000 字一段，一段一次喂[小说转剧本](script/novel-to-script.md)；下一段的起始分镜序号用 `python3 scripts/shots.py next 上一段输出.txt` 算。

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../../maintenance/skills/novel-to-comic-drama.md)。正常使用不用看，出问题再看。

</div>
