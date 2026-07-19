# 会动的网页 PPT 是怎么做出来的

2026 年 5 月我做了一次组内分享，没用 PPT 软件——演示稿是一个滚动驱动的叙事网页：向下滚动，背景里的柴犬在 12 个场景之间连续动画过渡，文案随场景切换。先看效果：

!!! tip "操作方式"
    **先点一下画面，然后按下鼠标右键，尽量别用滚轮**

<iframe src="/posts/animated-ppt/assets/deck/index.html"
        style="width:100%;aspect-ratio:16/10;border:1px solid #8884;border-radius:10px"
        loading="lazy" allowfullscreen allow="fullscreen"
        title="滚动叙事演示稿"></iframe>


## 原理：静帧 + 过场视频的三明治 { #原理 }

拆开看只有三种东西：

```
scene0.png ──trans0to1.mp4──▶ scene1.png ──trans1to2.mp4──▶ scene2.png ──▶ …
  静帧            过场视频         静帧           过场视频        静帧
```

页面本体是一个很高的空滚动区（数百 vh），真正的画面固定在视口里。滚动进度落在**静帧段**就显示对应 PNG；落在**过渡段**就把滚动进度映射成视频的 `currentTime`——不是 `play()` 播放，而是滚多少、视频走多少帧，倒着滚就倒放。因为过场视频的首帧和尾帧就是前后两张静帧图，衔接处像素级无缝，看起来就是「一镜到底」。

## 素材管线：关键帧图 + 首尾帧视频 { #素材 }

**第一步，出关键帧。** 12 个场景 = 12 张柴犬图，用 GPT 网页批量生成 image2 再人工筛选。出图不是随便出，有三条规矩（来自工程手册 [deck-skill.md](reference/deck-skill.md) 的 Scene Anatomy 章）：

- 统一 16:9 灰底，柴犬主体只占 1/3 ~ 1/2 画面，**剩余大量留白是给文字的**——文字盖到柴犬脸上就是设计失败；
- 每张图先想清楚「柴犬落在九宫格哪个位置」，再决定这一页文字走哪种版式；
- 每个场景对应叙事弧线上的一个情绪：待出发 → 起跑 → 犹豫 → 探索 → 好奇 → 慵懒 → 满足 → 专注 → 振奋 → 温柔反思 → 安睡戴冠。

当时的调研笔记里有一句现在看依然成立的话：

> 我发现里面最难的还是美术风格，即便你知道使用什么技术，里面也会有很多坑……特别是这种非常主观表达的场景，可以说是有一部分创作的成分在里面，我们需要的并不是一个 AI 非常无偏的表达。

所以「批量出图 + 人工筛选」不是偷懒，它就是这类主观创作场景下和图像模型的正确协作方式——模型负责量，人负责挑出符合叙事情绪的那张。

**第二步，首尾帧生成过场视频。** 把相邻两张关键帧作为**首帧和尾帧**喂给支持首尾帧的图生视频模型，让它脑补中间的运动（成片约 4 秒、720p、24fps）。这一招还有个彩蛋用法：**首尾给同一张图**，就得到一段可以无限循环的动画背景——标题页（trans1to2，奔跑循环）和结尾「感谢聆听」页（trans11to11，安睡循环）都是这么来的，静帧页里柴犬是活的。

素材目录里至今留着管线化石：`_orig.mp4` 是模型原片，`_抠图.png` 是一轮没用上的抠图实验——创作过程比成品目录乱得多，这很正常。

## 最大的坑：模型给的 mp4 根本没法 scroll-seek { #视频坑 }

这是整个项目踩得最深的坑，也是这篇文章最值钱的一节。视频模型（以及几乎一切常规导出）给你的 mp4，直接拿来做 scroll-driven 必然出现：**滚到中间画面冻住、只播开头然后直接跳末尾、必须滚很久才开始动**。两个原因：

1. **`moov` 索引在文件末尾。** mp4 的 `moov` atom 记录「每个时间点对应文件哪个字节」，多数编码器默认把它放在文件尾部——浏览器没拿到索引之前，任何 `currentTime` 都无法精确 seek，只能等整个文件几乎下完。
2. **关键帧密度不够，这个更致命。** 视频里只有 keyframe（I-frame）能独立解码，常规编码几秒才一个。scroll-driven 是每一帧 `requestAnimationFrame` 都要 seek 到任意时间点——目标不是 keyframe 时，浏览器要找到上一个 keyframe 顺序解码过来，根本来不及，于是放弃、渲染手头最近的帧（往往是开头或末尾）。实测 v0.2 新入库的 6 段过场，**无一例外都是 1 个 keyframe / 97~121 帧**。

修复一条 ffmpeg 命令同时解决两个问题——重编码成**每帧都是关键帧**（all-intra）并把索引挪到文件头：

```bash
ffmpeg -y -i in.mp4 \
  -c:v libx264 -preset fast -crf 20 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -an \
  -movflags +faststart \
  out.mp4
```

`-g 1` 就是「GOP = 1，每帧皆 keyframe」。代价是体积变为 1.5~3 倍，但几秒的过场绝对体积仍然很小，换来帧级精确 seek。经验教训是把它做成**素材入库仪式**：每段新视频进目录先跑诊断（keyframe 数应 ≈ 总帧数），不达标立即重编码，不要等浏览器里「卡住了」再回头查——诊断命令和批量脚本都在[工程手册](reference/deck-skill.md)里。

前端配套三件套也别漏：`<video muted playsinline preload="auto">`（iOS Safari 没有 `playsinline` 直接不渲染）；本地预览必须走 HTTP server（`file://` 下浏览器不给视频 byte-range）；改完视频记得硬刷新清缓存——最后这条最蠢也最常踩。

## 引擎：三层 js，数据驱动 { #引擎 }

整个引擎没有框架，三个文件各管一层：

| 文件 | 职责 |
|---|---|
| [`content.js`](assets/deck/content.js) | **全部文案和媒体声明**，一个大对象，改内容只碰这里 |
| [`layouts.js`](assets/deck/layouts.js) | 8 种版式的渲染函数（hero / left / right / anchor / accordion / steps / dual / blank） |
| [`deck.js`](assets/deck/deck.js) | 滚动映射、视频 seek、手风琴与画廊交互 |

这个分层的直接收益是**加一页只要在 `content.js` 追加一个对象**：声明背景（新视频先过 all-intra 仪式）、挑版式、标题里选一个词包 `<span class="accent">`，段落区间和章节归属全部自动计算。文案单源也意味着 AI 改稿只需要读写一个文件——这份稿子后期的内容调整基本都是这么让 AI 干的。

版式层面有几条铁律，来自工程手册的 Style Guide 章，违反任何一条页面气质就塌：

- 每页**只允许一个**橙色强调词（`#ff6a1a` 是全局唯一强调色，多用即失效）；
- 主标题行高 0.9~0.94、letter-spacing 必须为负——视觉重量全靠这两个参数；
- 16:9 letterbox 内一律用容器查询单位 `cqw/cqh`，写成 `vw` 响应式直接爆；
- 留白宁大勿小，stats 是纯文字大数字，加圆角卡片底就变 dashboard 了。

## 把坑沉淀成 SKILL，让 AI 下次不再踩 { #skill }

这个项目从 v0.1 迭代到 v0.3，目录里最有价值的演变不是代码，是文档：v0.1 时视频处理、场景排布、视觉风格是三份散的笔记，v0.3 合并成一份带 frontmatter 的 [`SKILL.md`](reference/deck-skill.md)——「新人看完就能改内容、加页、换图、排查视频问题」，而这个「新人」主要是 AI。下次再做同类 deck，把手册喂进上下文，all-intra、九宫格、单点橙这些坑一个都不用重踩。

另外存档了一份更早的化石：[prompt-v0.md](assets/prompt-v0.md)，第一版滚动开场的一次成型 prompt——从资产清单、滚动区间映射表到「scroll 事件只更新目标值、rAF 里缓动 seek」的实现要点全部写死在 prompt 里，AI 一发直出完整 HTML。对比它和后来的三层引擎能看出这类项目的自然演化：**一次性 prompt 长出可维护的架构，踩坑记录长出 SKILL**。

## 附：怎么原样搬进这个 wiki { #部署 }

这个 deck 不是单文件——入口 html + 3 js + 1 css + 40 多个媒体文件，内部全是相对路径。能整体进 wiki 靠的是本站部署链路对静态文件的原样透传：zensical 构建时 `docs/` 里所有非 `.md` 文件（含 `.html`）原样拷进 `site/`，`deploy.sh` 再把 `site/` 整体镜像到 COS——对象存储不关心你放的是一篇页面还是一整个网页应用。搬运时动了四处：

- **只搬运行时子集**：历史版本、`_orig` 原片、讲稿 `.md` 都不带——`.md` 混进 `docs/` 会被当 wiki 页面渲染；
- **字体本地化**：原版走 Google Fonts，国内不可达会卡渲染。把 Archivo Black + Inter 的 woff2 真身下进 [`fonts.css`](assets/deck/fonts.css)（共约 160KB），中文走系统字体兜底；
- **摘除内网 iframe**：「在线试玩」原来嵌的是公司内网地址，公网必挂且泄漏 IP，换成说明文字；
- **摘除失效外链**：一处封面图是 star-history 在线图表，该 API 已因 GitHub 限制 star 数据而失效（原版现在也是裂的），移除后手风琴直接展开案例。

本地预览的坑：`zensical serve` 是简易开发服务器，会被 deck 一次性预加载的 12 段视频并发连接压挂（之后所有请求永远 pending）——预览这页请用 `npx serve site`；线上 COS 原生支持 Range 和并发，无此问题。

## 附：源码与手稿原文 { #原文 }

引擎真身在本文 `assets/deck/` 下，线上有独立 URL 可直接 GET；此处按规矩折叠展示，方便就地查看。工程手册已升为独立参考页——[滚动 deck 工程手册](reference/deck-skill.md)（导航可达），不在此重复。

引擎五件套（wiki 发布版：字体已本地化、内网 iframe 与失效外链已摘除，均留有注释）：

??? abstract "`index.html` —— 入口骨架（21 行，画面全由三层 js 生成）"

    ```html
    --8<-- "posts/animated-ppt/assets/deck/index.html"
    ```

??? abstract "`content.js` —— 全部文案与媒体声明，改内容只碰这里（单源）"

    ```js
    --8<-- "posts/animated-ppt/assets/deck/content.js"
    ```

??? abstract "`layouts.js` —— 8 种版式的渲染函数"

    ```js
    --8<-- "posts/animated-ppt/assets/deck/layouts.js"
    ```

??? abstract "`deck.js` —— 滚动映射、视频 seek、手风琴与画廊交互"

    ```js
    --8<-- "posts/animated-ppt/assets/deck/deck.js"
    ```

??? abstract "`style.css` —— 视觉规范的落地（色彩 token / 字体 / 8 layout / letterbox）"

    ```css
    --8<-- "posts/animated-ppt/assets/deck/style.css"
    ```

制作化石一份，存档自原项目目录（获取日期 2026-07-07）：

??? abstract "`assets/prompt-v0.md` —— 初版滚动开场的一次成型 prompt（原文写于 2026-05-16）"

    ````markdown
    --8<-- "posts/animated-ppt/assets/prompt-v0.md"
    ````
