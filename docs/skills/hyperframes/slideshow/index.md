---
name: slideshow
description: >
  编写一个 HyperFrames slideshow —— 演示文稿、融资路演 deck 或交互式 deck，包含离散的幻灯片、fragment 分步揭示、分支、热点导航，以及内置的带演讲者备注的演讲者模式；也能把现有页面转换成 deck。输出是一个可导航的 deck，而不是渲染出来的 MP4。如果用户没有明确要求 slideshow，先确认再动手编写。不明确 → /hyperframes。
---

**插件安装：** 当本 skill 位于某个 HyperFrames 插件内时，在执行安装或保鲜命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装的情况保留下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update slideshow`。一切都是最新时它会快速空跑；否则它会在你依赖这些 skill 之前，刷新本 skill 以及它所依赖的核心领域 skill。

> **figma 来源**：如果 deck 的内容或分镜来自一个 figma.com URL，先运行 `/figma` —— 导出素材、品牌 token，若来源是一排场景画框，还会重建分镜 —— 然后基于它的输出来构建。不要直接通过原始 MCP 工具驱动 Figma：那样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌 token 的 `var()` 绑定，之后品牌一旦变更，就无法在不完整重新导入的情况下传播下去。

# Slideshow 编写约定

HyperFrames slideshow 就是一个普通的 HyperFrames composition —— 场景、clip、GSAP timeline —— 只多了一样东西：一个 **JSON island**，声明哪些场景是幻灯片、它们之间如何连接。播放器的 `SlideshowController` 读取这个 island，把连续的 GSAP timeline 变成一个离散的、可导航的 deck。

**先读 `/hyperframes-core`**，了解基础的 composition 约定（clip、track、`data-*` 属性、确定性规则）。本 skill 只讲新增的部分：island schema、幻灯片编写规则、fragment、分支、校验，以及包装组件。

## 输出 —— 可导航的 deck，而不是线性 MP4

slideshow 的输出是**运行中的 deck**：用 `hyperframes present <project-dir>`（或 Studio 的 present 模式）来提供服务 —— 播放器的 `SlideshowController` 读取 island，驱动导航、fragment、分支和演讲者模式。见下文 **Presenting and handoff**（演示与交付）。

**不要用 `hyperframes render` 把 slideshow 渲染成单个 MP4。** deck 是由若干个顶层场景 composition 编写而成的（每张幻灯片一个 `data-composition-id`），**没有一个主根 composition** 把它们包起来，所以 `render` 只会解析到**第一个** composition，产出一个**被静默截断**的 MP4（例如一个 40 秒的 deck 只剩 6 秒）。线性的主线导出（只含主线幻灯片，排除分支序列）**暂缓实现** —— 在它上线之前，受支持的输出是实时的 `present` deck 和逐张幻灯片的 `snapshot` 静帧。如果用户眼下就需要一个线性 MP4，要把这个限制告诉用户，而不是拿 `render` 去渲染这个 deck。

## 意图确认

如果用户明确要求 slideshow、slide show 或 HyperFrames slideshow，就直接使用本 skill。当请求是经由 `/hyperframes` 过来的，这一确认由意图层的分诊负责 —— 被路由到这里就意味着已经确认过，不要再问；意图层的运行形态问题也不适用（交付物是 deck，不是渲染出来的视频）。如果存在 `BRIEF.md`，它承载着已确认的意图 —— 读它。

如果本 skill 是由相邻的请求触发的，比如「演示文稿」「融资路演 deck」「deck」「交互式 deck」或「把这个页面转换一下」，先暂停编写，在请求确认之前把这个选择讲清楚。简要说明：HyperFrames slideshow 指的是一个可运行的 deck，包含离散的幻灯片、内置导航和演讲者模式、可编辑的演讲者备注、共享的媒体处理，以及交付前的校验。对于源页面转换，还要说明目标是保留原页面的视觉设计、交互、动效和媒体行为，同时把页面的移动转译成幻灯片之间的转场。

然后问一个简短的确认问题：

> 要把它做成 HyperFrames slideshow 吗？

如果环境提供是 / 否选择的 UI，就用它；否则用纯文本提问。

在用户说「是」之前，不要实现 slideshow。如果用户说「否」，就停止使用本 skill —— 去读 `/hyperframes`，让意图层重新路由。这个确认是一个**路由决策**，不是偏好闸门 —— 按 `../hyperframes/references/brief-contract.md` § 1，它在自主模式下依然有效（「surprise me」也不会跳过它）：做错交付物类型是质量失败，不是创作上的取舍。

---

## 两个组成部分

### 1. 场景 —— 照常声明

每张幻灯片背后都是一个场景。用 `data-composition-id`、`data-start`、`data-duration` 和 `data-label` 声明场景：

```html
<div
  data-composition-id="problem"
  data-start="0"
  data-duration="8"
  data-label="The problem"
  data-width="1920"
  data-height="1080"
>
  <!-- clips go here -->
</div>
```

分支幻灯片（只能通过热点进入，不在主线上）的声明方式完全一样 —— 只是它们只出现在 island 的某个 `slideSequences` 条目里，不出现在主线的 `slides` 数组里。

### 2. JSON island —— 每个 composition 一个 script 块

在 composition HTML 里加入恰好一个 `<script type="application/hyperframes-slideshow+json">` 块。它承载所有 slideshow 元数据：

```html
<script type="application/hyperframes-slideshow+json">
  {
    "slides": [...],
    "slideSequences": [...]
  }
</script>
```

island 是幻灯片顺序、备注、fragment 停留点、热点和分支序列的唯一事实来源。把它放在 `<body>` 靠前的位置、场景 div 之前，方便查找。

不要把 slideshow manifest 藏在另一个 `<script type="application/json">` 块后面、再用运行时代码去生成 island。`present` 命令是静态读取 composition HTML 的，它期望真正的 `application/hyperframes-slideshow+json` island 本来就在那里。

---

## Schema

### `SlideshowManifest`（island 的顶层对象）

```json
{
  "slides": [
    /* SlideRef[] — the main line, in order */
  ],
  "slideSequences": [
    /* SlideSequence[] — off-line branch sequences */
  ]
}
```

### `SlideRef`

```json
{
  "sceneId": "problem",
  "notes": "Lead with the pain, not the company.",
  "fragments": [3.5, 5.2, 7.0],
  "hotspots": [
    /* SlideHotspot[] */
  ],

  "ttsScript": null,
  "ttsAudioUrl": null,
  "ttsDurationMs": null
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `sceneId` | 是 | 必须与某个场景的 `data-composition-id` 完全一致（或者显式提供 `startTime`/`endTime`）。lint 规则按 `data-composition-id` 解析场景。 |
| `notes` | 否 | 仅演讲者可见的文字。绝不展示给观众。 |
| `fragments` | 否 | 幻灯片 `[start, end]` 范围内的时间点数组（秒）—— 见下文 Fragment。 |
| `hotspots` | 否 | 触发分支的交互式 overlay —— 见下文分支。 |
| `startTime` | 否 | 可选。覆盖所匹配场景的时间边界；默认取场景的起止时间。 |
| `endTime` | 否 | 可选。覆盖所匹配场景的时间边界；默认取场景的起止时间。 |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs` | 否 | **保留字段。** schema 里有这些字段，但 TTS 播放尚未接通。除非你是在为将来的版本预先填充，否则省略。 |

### `SlideHotspot`

```json
{
  "id": "h1",
  "label": "How did we calculate this?",
  "target": "market-deep-dive",
  "region": { "x": 60, "y": 10, "w": 35, "h": 20 }
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 在该幻灯片内唯一。 |
| `label` | 是 | 展示给观众的提示框 / 按钮文字。 |
| `target` | 是 | 必须与 `slideSequences` 中某个 `SlideSequence.id` 一致。 |
| `region` | 否 | 以幻灯片百分比表示的边界框：`{x, y, w, h}`，取值 `0–100`。省略时，热点会改为渲染成一个覆盖整张幻灯片的带标签按钮。 |

### `SlideSequence`

```json
{
  "id": "market-deep-dive",
  "label": "Market sizing methodology",
  "slides": [{ "sceneId": "mkt-1" }, { "sceneId": "mkt-2" }]
}
```

序列内的 `slides` 使用与主线相同的 `SlideRef` 结构。允许包含 fragment 和嵌套热点。

---

## 幻灯片编写规则

这些是硬性约束，不是建议。违反它们的幻灯片，评审一看到就会被整张替换掉。

- **标题是一个完整句子的论断，而不是一个标签。** 写「SMB 每周在手动排班上花 14 小时」，而不是「排班问题」。即使忽略视觉，这句话也应该能独立成立。
- **每张幻灯片一个观点 + 一个视觉。** 如果你想再加第二组要点或第二张图表，就把幻灯片拆开。
- **先抛出结论。** 最有力的观点放在最前面 —— 在单张幻灯片上如此，在 deck 的顺序上也如此。投资人从左到右、从上到下地读，然后就不看了。
- **市场规模只用自下而上的估算。** 绝不在不展示计算过程的情况下写「$50B TAM」。从单位经济模型往上搭：客户数 × ACV，或交易笔数 × 抽成比例。
- **字号最低相当于 30pt。** 在 1920×1080 下，标题是 72–96px；正文是 48px。观众必须阅读的任何文字绝不低于 40px。
- **手工搭建任何有名目的视觉之前，先搜索线上 catalog。** 对幻灯片需要的每一种外观、效果、图表、处理手法或转场 ——「CRT 扫描线」「故障效果」「条形图竞赛」「微光扫过」「终端窗口」—— 在编写该幻灯片的 clip 之前，先运行 `npx hyperframes catalog --query "<the visual, in plain English>" --json` 并阅读排名靠前的结果。这个搜索**什么都不需要安装**：不需要项目、不需要事先 `add`、不需要账号。它在任何目录下都会对整个托管 registry（约 400 个 block 和 component）进行排序。`npx hyperframes add <name>` 会把 block 的源码放进 deck，你在原处对它进行定制。移植源页面时这一条尤其要紧：一个真正的 block，胜过下面移植规则所禁止的那种简化近似。

## 移植源页面

把现有页面转换成 slideshow 时，忠于源页面是约定的一部分。除非用户明确要求重新设计，否则不要用简化的近似物替换源页面特有的组件。

- 尽可能贴近地保留原页面的视觉设计、动效语言、交互行为、媒体行为和演示用的交互功能。当 slideshow 系统支持演讲者模式时，使用共享的可编辑备注行为来提供演讲者备注，而不是为某个 deck 单独实现。
- 尽可能精确地从源页面的 DOM/CSS/JS 移植机械性的视觉：自定义播放器、canvas 可视化器、时间线、播放头、音轨分轨、扩散圆环、hover 状态，以及其他交互细节，都应该在转换后保留下来。
- 把原生 `<video>` / `<audio>` 元素当作任何自定义媒体控件外壳、canvas 可视化器、波形、节拍网格或播放头的事实来源。接上源页面的媒体事件（`play`、`pause`、`timeupdate`、`seeking`、`seeked`、`ended`、`ratechange`、`volumechange`），并从 `media.currentTime` 推导视觉状态；不要另跑一个可能与实际播放产生漂移的计时器。
- 每个复制过来的、带 `src` 的 `<video>` 或 `<audio>`，在 lint 之前都必须带上 HyperFrames 时间属性：`data-start` 和 `data-duration`；如果需要保留可听见的原生音频，还要加 `data-has-audio="true"`。幻灯片专属的媒体使用该场景的时间范围；对于可能在多张聚焦幻灯片中由用户控制播放的佐证视频，使用覆盖整个 deck 的时间范围。不要在媒体上保留 `preload="none"`；使用 `metadata` 或 `auto`。
- 在校验之前解析好源页面的字体 token。如果要保留源页面的自定义字体，为本地 / 抓取到的字体文件添加 `@font-face` 规则。如果改用系统回退字体，把 `font-family: var(--f-body)` 这类 token 化的声明替换成具体的、渲染安全的字体栈，例如 `system-ui, sans-serif` 或 `ui-monospace, monospace`；不要让 `var(...)` 留作 font-family 的值。
- 审查源页面中非典型的页面移动，尤其是由滚动、滚轮、触摸、hash 状态、resize 或 requestAnimationFrame 循环驱动的行为。把这些都视为源页面行为：带有平移 / 缩放「世界」图层的固定 viewport、视差、固定面板、横向滚动区、随滚动推进的时间线、分区吸附，以及缩放到元素的镜头。滚动往往是源页面的转场触发器，所以要保留转场：提取它的进度节点、easing 和镜头 / 焦点状态，然后通过 timeline 位置、fragment 或一个可复用的播放器 / harness 钩子，把这段动效重新挂到 slideshow 导航上。跳到幻灯片停留点的独立包装器仍然需要一个显式的导航镜头转场钩子；只计算每张幻灯片的镜头变换是不够的。不要在幻灯片内部模拟字面意义上的页面向下滚动转场；观众应该感受到镜头从一个焦点移动 / 缩放到另一个焦点，而不是看到一个网页在滚动。让每次幻灯片之间的镜头移动保持连续：避免中途停顿点让 x/y 方向或缩放发生反转，除非源页面在同一个边界上明显就是这么做的。一个先四处乱窜再落定的转场，比一个更简单、直接移向焦点的转场更糟。
- 保留源页面的媒体裁切语义。把截图、推文 / 社交帖子、产品 UI 截图、图表、文档、代码、排行榜，以及任何带可读文字的图片都当作内容证据，而不是装饰性媒体：使用源宽高比（`height: auto`），或在一个稳定的框内使用 `object-fit: contain`。只有当源页面就是这么做的，或者用于有意为之的装饰性 / 背景 / 电影感缩略图时，才使用 `object-fit: cover`。把这些截图放进幻灯片后，检查四条边上有没有被截断的文字、logo、控件或说明文字；有意义的内容出现可见裁切就是 bug，除非源页面本身就裁掉了。
- 如果某个行为是 slideshow 通用的，就把它放进播放器 / 控制器，或者放进一个可复用的 skill 代码片段。不要用一次性的 deck 脚本去解决。
- 叠放的场景画框绝不能挡住当前幻灯片上的交互。被隐藏的画框既需要视觉上的隐藏，也需要事件上的屏蔽：

```css
.scene-frame {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.scene-frame.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

如果可见性是以命令式方式驱动的，在可见性控制器里把三个属性（`opacity`、`visibility` 和 `pointerEvents`）都设置上。只设 `opacity: 0` 仍然会留下一个能吞掉点击的隐形图层。

---

## Fragment：幻灯片内的揭示停留点

fragment 是幻灯片 `[start, end]` 范围内的一个 composition timeline 绝对时间（秒），控制器应在这个时间点停住，保持某个揭示状态。

**工作方式：**

1. 播放器进入一张带 fragment 的幻灯片 —— 直接 seek 到 `fragments[0]` 并停在那里。
2. 用户按 Next（或 →）—— 控制器 seek 到 `fragments[1]` 并停住。
3. 最后一个 fragment 之后，Next 会前进到下一张幻灯片。
4. 没有 fragment 的幻灯片，进入时停在幻灯片内部的一个静止帧上，通常是它的中点，而不是恰好在 `slide.end`。

fragment 时间必须落在 `[start, end]` 之内（两端都包含）。lint 规则只拒绝落在范围之外的 fragment（`time < start` 或 `time > end`）。

fragment 时间是 **composition timeline 上的绝对位置** —— 与 `data-start` 处于同一坐标空间 —— 而不是相对于场景起点的偏移量。

导航由 seek 驱动，而不是由播放驱动。控制器绝不会为了在 fragment 之间移动而开始播放；每个导航命令都是一次确定性的 seek，跳到目标停留时间。设计 fragment 状态时，要确保它们在目标 timeline 时间上是正确的。

---

## 分支：热点与幻灯片序列

分支幻灯片是同一条 composition timeline 上的真实场景。它们只列在 `slideSequences` 下，不参与主线导航 —— 除非某个热点被触发，否则播放器永远不会访问它们。

**导航模型：**

- 点击热点会把 `{sequenceId, slideIndex: 0}` 压入导航栈，并进入该分支的第一张幻灯片。
- **back()** 弹出栈顶，返回到确切的父幻灯片（即放置该热点的那张）。
- **backToMain()** 清空整个栈，返回到根幻灯片。
- 面包屑导航根据栈来渲染：`Main deck › Market sizing methodology › Slide 2`。
- 分支内的幻灯片计数器以该序列为范围（`1 of 2`，而不是主 deck 的总数）。

**要避免的：**

- 不要把分支场景 ID 加进主线的 `slides` 数组。它们只能出现在某个 `slideSequences` 条目里。lint 规则会标记这种重叠。
- 分支场景包含在连续的 timeline 里，所以一个朴素的线性视频导出会把它们也包含进去。导出只读取主线幻灯片（暂缓实现；已在规格中标注）。

---

## 完整示例：带 fragment 和一个分支的 3 张幻灯片 deck

### 场景 HTML（骨架）

```html
<body style="margin: 0">
  <script type="application/hyperframes-slideshow+json">
    {
      "slides": [
        {
          "sceneId": "hook",
          "notes": "Open with the stat. Pause on the $40B number."
        },
        {
          "sceneId": "problem",
          "notes": "Walk through each pain point one at a time.",
          "fragments": [11.0, 15.0],
          "hotspots": [
            {
              "id": "h1",
              "label": "Where does the $40B figure come from?",
              "target": "market-detail",
              "region": { "x": 55, "y": 60, "w": 40, "h": 20 }
            }
          ]
        },
        {
          "sceneId": "solution",
          "notes": "One sentence: what we do and who it is for."
        }
      ],
      "slideSequences": [
        {
          "id": "market-detail",
          "label": "Market sizing methodology",
          "slides": [{ "sceneId": "mkt-math", "notes": "Bottom-up: 2.3M SMBs × $17k ACV." }]
        }
      ]
    }
  </script>

  <!-- Slide 1 — hook -->
  <div
    data-composition-id="hook"
    data-start="0"
    data-duration="6"
    data-label="The hook"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="0"
      data-duration="6"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <h1 id="hook-headline" style="font-size: 80px; color: #fff; font-family: sans-serif">
        SMBs lose $40B/year to manual scheduling
      </h1>
    </section>
  </div>

  <!-- Slide 2 — problem (3 fragments) -->
  <div
    data-composition-id="problem"
    data-start="6"
    data-duration="15"
    data-label="The problem"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="6"
      data-duration="15"
      data-track-index="1"
      style="position: absolute; inset: 0; padding: 120px 160px; box-sizing: border-box"
    >
      <h2 id="pain-headline" style="font-size: 64px; color: #fff; font-family: sans-serif">
        Three gaps operators can not close
      </h2>
      <p id="pain-1" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        No-shows cost 23% of booked revenue
      </p>
      <p id="pain-2" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        Manual reminders take 4h/week per staff
      </p>
      <p id="pain-3" style="font-size: 48px; color: #ccc; opacity: 0; font-family: sans-serif">
        Rescheduling friction drives 40% churn
      </p>
    </section>
  </div>

  <!-- Slide 3 — solution -->
  <div
    data-composition-id="solution"
    data-start="21"
    data-duration="8"
    data-label="The solution"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0a"
  >
    <section
      class="clip"
      data-start="21"
      data-duration="8"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <h2 id="solution-headline" style="font-size: 72px; color: #fff; font-family: sans-serif">
        Acme automates scheduling for service SMBs — no-shows down 80% in 90 days
      </h2>
    </section>
  </div>

  <!-- Branch slide — excluded from main line -->
  <div
    data-composition-id="mkt-math"
    data-start="29"
    data-duration="7"
    data-label="Market math"
    data-width="1920"
    data-height="1080"
    style="position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #111"
  >
    <section
      class="clip"
      data-start="29"
      data-duration="7"
      data-track-index="1"
      style="position: absolute; inset: 0; display: grid; place-items: center"
    >
      <p id="mkt-formula" style="font-size: 56px; color: #fff; font-family: sans-serif">
        2.3M SMBs × $17k ACV = $39B serviceable market
      </p>
    </section>
  </div>

  <script>
    window.__timelines = window.__timelines || {};

    // Slide 2 fragment entrance animations
    gsap.registerPlugin(); // load any plugins before use

    const tl = gsap.timeline({ paused: true });
    window.__timelines["problem"] = tl;

    // Insert positions are absolute composition-timeline times (same as data-start / fragment values).
    tl.from("#pain-1", { opacity: 0, y: 20, duration: 0.4 }, 11.0);
    tl.from("#pain-2", { opacity: 0, y: 20, duration: 0.4 }, 15.0);
    // pain-3 lands at end of slide
    tl.from("#pain-3", { opacity: 0, y: 20, duration: 0.4 }, 13.0);
  </script>
</body>
```

### 示例要点

- island 中的 `sceneId` 值（`"hook"`、`"problem"`、`"solution"`、`"mkt-math"`）与场景 div 上的 `data-composition-id` 值完全一致。
- `mkt-math` 只出现在 `slideSequences` 里 —— 它从不出现在顶层的 `slides` 数组中。
- fragment 时间（`11.0`、`15.0`）落在 `problem` 场景的 `[6, 21]` 范围内（时间是 composition timeline 上的绝对位置）。
- 热点的 `region`（`x: 55, y: 60, w: 40, h: 20`）把可点击区域定位在 problem 幻灯片的右下象限。
- GSAP timeline 注册在 `window.__timelines` 上并且是暂停的 —— 由 HyperFrames 引擎驱动播放；不要在构造时调用 `.play()`。

---

## 包装组件

在任何嵌入场景中，都用 `<hyperframes-slideshow>` 包住 `<hyperframes-player>` 来承载 composition：

```html
<hyperframes-slideshow>
  <hyperframes-player src="deck.html"></hyperframes-player>
</hyperframes-slideshow>
```

`<hyperframes-slideshow>` 提供导航界面（Present、Prev / Next、计数器、存在 `sound` 时的全局静音、全屏）、键盘处理（← / →、Space / Backspace，以及用 P 进入 Present）、触摸滑动和热点 overlay。

slideshow 在挂载时会自动给内部的每个 `<hyperframes-player>` 设置 `interactive` 属性，这样 composition iframe 里的可点击控件、链接、原生媒体控件和自定义播放器都能按预期接收指针事件。（在 slideshow 包装器之外，你必须手动给 `<hyperframes-player>` 加上 `interactive` —— 播放器默认对 iframe 设置 `pointer-events: none`，以免对播放器宿主的点击被劫持成切换 timeline 播放。）

**演讲者模式：** 使用 slideshow 导航胶囊条里内置的 Present 图标按钮，或者按 P。它会调用 `window.open('?mode=audience')` 打开一个全屏的观众标签页；发起的那个标签页变成演讲者视图（缩小的当前幻灯片、下一张幻灯片预览、备注、已用时计时器）。两个标签页通过 `BroadcastChannel('hf-slideshow:' + location.pathname)` 同步。不要在包装器层面另加自定义的 Present 按钮；这个按钮的位置、图标、样式以及在观众模式下的隐藏，都由共享组件负责。

**通过 Google Meet / Zoom 演示（屏幕共享）：** 共享*观众*界面，把演讲者视图留在你自己的屏幕上。

- **Google Meet（或任何在 Chrome 内的共享）：** Present → 在 Meet 里选择 **Share screen → A tab** → 选中观众标签页 → 切回演讲者标签页。Chrome 会让被捕获的标签页在后台时继续渲染，所以动画和幻灯片导航都保持实时。**不要**共享「A window」或「Entire screen」—— 一个被完全遮住的窗口会停止渲染（观众看到的是冻结的幻灯片），而共享整个屏幕会暴露你的备注。
- **Zoom（桌面应用）：** 把观众标签页拖出来成为独立窗口，然后共享这个窗口。Zoom 通过操作系统捕获画面，所以如果观众窗口被*完全*遮住，它就会冻结 —— 用第二块显示器，或者让观众窗口在演讲者视图后面露出一条边。

由演讲者驱动的媒体播放受自动播放策略约束：`BroadcastChannel` 可以同步意图、时间和状态，但无法把演讲者的用户激活（user activation）传递给观众标签页。共享的 slideshow 播放器会镜像原生媒体事件，并先以静音方式启动远端观众的播放；只有当静音的 `media.play()` 被拒绝，或者 deck 明确要求观众端播放有声音时，才回退到独立 harness 的观众解锁行为。play 被拒绝后不要继续应用远端的 `timeupdate` 消息，否则观众端会在不播放的情况下静默地 seek 穿过整段视频。

演讲者备注在演讲者视图里可以编辑。编辑内容按 deck 和幻灯片存储在 `localStorage` 里，叠加在 manifest 的备注之上，不会改写 composition 文件。不要给 deck 添加一次性的备注编辑脚本；依靠共享的 slideshow 播放器行为。如果某个独立 / 自定义包装器确实需要在共享播放器之外实现这一功能，使用 `references/standalone-harness.md` 里那段确定性的存储代码片段。

### 离开幻灯片时的媒体清理

离开幻灯片时的媒体清理由 slideshow 控制器负责。当导航切换幻灯片或序列时，它会在进入下一张幻灯片之前调用 `hyperframes-player.stopMedia()`。这个命令会：

- 向 iframe 运行时发送 `stop-media`，由运行时停止 WebAudio 并暂停原生 `<video>` / `<audio>` 元素；
- 作为兜底，直接暂停同源 iframe 中的媒体；以及
- 暂停从 iframe 媒体接管过来的父框架代理。

同一张幻灯片内的 fragment 导航**不会**停止媒体。全局 / deck 级别的父页面音频，比如通过 `audio-src` 接入的背景音轨，不被视为幻灯片媒体。

不要为普通的媒体播放器添加逐张幻灯片的清理脚本。把幻灯片里的视频 / 音频作为普通媒体保留在 composition 中；只有当播放器应当保留可听见的原生视频音频、而不是把它当作无声的视觉媒体时，才使用 `data-has-audio="true"`。

如果源页面有挂在媒体上的自定义控件或可视化，这些控件必须监听 slideshow 播放器所停止和静音的同一个原生元素。无论是离开幻灯片、演讲者同步、原生控件、自定义控件还是全局静音按钮导致的暂停，都应该通过媒体事件来更新可见的自定义 UI，而不是通过一套并行的状态。

实现直接的 iframe 兜底清理时，要把 iframe 媒体当作跨 realm 的 DOM。不要用父页面的 `el instanceof HTMLMediaElement` 去检测 iframe 节点；在真实浏览器里这会返回 false。在设置 `muted` 或调用 `pause()` 之前，使用 `el.ownerDocument.defaultView.HTMLMediaElement`（或等效的标签名 / 鸭子类型守卫）。

### 导航栏全局静音

当 `<hyperframes-slideshow sound>` 渲染出导航栏静音按钮时，这个按钮就是整个页面的全局静音控件。它必须静音：

- 子 `<hyperframes-player>` 实例，包括同源 iframe 中的媒体；
- 顶层页面的 `<audio>` / `<video>` 元素；以及
- 包装器自有的音效（SFX）/ 全局 `Audio` 对象，通过 `hf-sound` 事件。

不要在 composition 内部再加第二个静音按钮。如果某个包装器脚本创建了没有挂到 DOM 上的 `new Audio(...)` 对象，它必须监听 `hf-sound`，并在每个对象上设置 `clip.muted = detail.muted`，而不只是跳过之后的播放。

同样的跨 realm 规则在这里也适用：全局静音必须通过子框架的 DOM realm 触达 iframe 里的 `<video>` / `<audio>` 元素。在单一 DOM realm 里通过的单元测试是不够的；要在浏览器里验证：点击导航栏静音按钮之后，实际的 iframe 媒体元素报告 `muted: true`。

`hyperframes present` 从 `packages/player/dist` 提供构建好的产物。修改了播放器或 slideshow 界面行为之后，要在 `packages/player` 里运行 `bun run build`，并重启 present 服务器，再到浏览器里测试。

---

## 独立运行 slideshow（过渡方案）

**长期的方案**是由引擎托管：`hyperframes preview --slideshow` / Studio 的 present 模式会在真正的 HyperFrames 引擎之上托管 composition，由引擎驱动可 seek 的 timeline、掌管手势帧，并从 composition 中读取 island。这条路径即将到来；它上线后优先使用它。

在那之前，独立演示（在浏览器里通过裸播放器 bundle 打开的 composition，没有引擎）需要绕过三个缺口：composition 必须暴露一个可 seek 的根 timeline，island 必须在包装器里复制一份，包装器自有的音效（SFX）/ 全局音频应当放在父框架里。这些模式记录在：

```
references/standalone-harness.md
```

不要把那里的模式当作正式认可的模型 —— 它们只是为了在引擎托管路径落地之前填补空缺。

## 交付（Handoff）

对于公开的或面向用户的 slideshow 项目，根目录的 `index.html` 应该是一个可运行的 slideshow 入口。在浏览器里打开它，应该能看到 slideshow 导航，并且能响应 Next/Prev；它不应该只暴露原始的 composition，还要求用户知道 Studio 或某个内部包装器文件。如果出于 CLI 兼容性必须把原始的 HyperFrames composition 单独放，就把它放进一个子目录，比如 `composition/index.html`，并让脚本 / 命令指向那个目录。

直接打开的包装器必须依赖 `<hyperframes-slideshow>` 渲染出来的内置 Present 图标按钮。不要添加定制的 `#present-btn`、固定定位的按钮，或包装器专属的 Present 样式。控制栏由共享组件负责，它会在 `?mode=audience` 下隐藏 Present，并支持用 P 作为键盘快捷键。

交付之前要验证直接打开的路径。如果 `file://` 的浏览器限制导致 iframe 媒体、本地脚本或同源播放器访问失效，就使用一个自包含的包装器，或者让交付命令启动一个本地服务器并打开可用的 URL；不要让 `index.html` 处于损坏或含糊不清的状态。

对于一个完成的 slideshow deck，面向用户的首要下一步是演讲者模式，而不是 Studio。运行或提供：

```bash
npx hyperframes present <project-dir>
```

Studio/`preview` 适合用来编辑 composition，但对 slideshow 用户来说，它不是一个清晰的最终去处。如果你为一个原始 composition 放在 `composition/` 里的 slideshow 项目创建 `package.json`，就让默认的可运行脚本启动演讲者模式：

```json
{
  "scripts": {
    "dev": "npx hyperframes present ./composition",
    "studio": "npx hyperframes preview ./composition --background"
  }
}
```

交付时，附上命令打印出的本地演讲者 URL，以及最简的说明：「点击 Present，或按 P，打开观众标签页。」如果用户要通过 Google Meet 或 Zoom 演示，还要转达上文演示部分的屏幕共享指引（在 Meet 里共享观众标签页；在 Zoom 里共享拖出来的观众窗口）。如果用户让你启动了服务器，就保持它运行。

---

## 校验

编写或编辑完 slideshow composition 之后，运行校验（它会在打开浏览器之前重新跑一遍 lint）：

```bash
npx hyperframes check
```

即使命令以成功状态退出，也要把 lint 错误和校验中的 `StaticGuard` 约定消息当作阻断项。修改文件并重新运行，直到 `check` 不再报告任何 lint 或运行时错误。

slideshow lint 规则检查：

- 每个 `slide.sceneId` 都能解析到一个存在的场景（按 `data-composition-id`）。
- 每个 `hotspot.target` 都引用了一个已定义的 `slideSequence` id。
- fragment 时间落在各自幻灯片的 `[start, end]` 范围内。
- 没有两张主线幻灯片在时间上重叠。

预览之前修复所有违规项。lint 不通过的 composition 在播放器里无法正确解析。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/standalone-harness.md](references/standalone-harness.md) —— 独立运行的 HyperFrames Slideshow Harness
