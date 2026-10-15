<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/media-treatments.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 媒体处理方案

媒体处理方案（media treatment）是一份感知源素材的计划，它组合 HyperFrames 现有的色彩、效果、timeline 和 Registry 基础构件。它不是第二套运行时 schema。用这个文件来选定一个主方向。匹配上的配方是一个可选的、经过测试的起点（seed）；定制化的请求可以从规范的能力目录里拼装出一个经过校验的处理方案。

## 授权与范围

- 像"把这个润色一下"、"让它看起来更好"或"让它贴合主题"这样的明确请求，等于委托你做一个保守的处理方案。应用它、验证它，并汇报改了什么。
- 在用户未主动要求的机会扫描中，先展示或建议处理方案。
- 目标是有意义的摄影类媒体。跳过文字、SVG、logo、图标、UI 外框（chrome），以及有意风格化的素材画面，除非用户要求。
- 实时调色和效果作用于整个选中的真实 `<img>` 或 `<video>`。它们不会隔离或追踪人脸、车牌、地址或其他区域。只针对某个区域的工作，要先创建一个单独的裁剪/遮罩媒体层，或使用外部的分割/追踪工具；绝不要暗示一次全媒体的 Blur 或 Pixelate 做到了区域隔离。
- 实时处理方案路径是 Rec.709/SDR。不要默默地让 HDR、HLG、PQ 或相机 LOG 源走这条路径。

## 对请求分类

在选配方或拼装自定义处理方案之前，先选出能满足请求的最小路线（lane）：

| 用户意图 | 路线 |
| --- | --- |
| 太暗、发灰、太暖、阴影太多 | 校正 |
| 塑造阴影/高光或选定颜色 | 色轮、曲线或 HSL 二级调色 |
| 精致、高级、温暖、电影感、贴合主题 | preset 或自定义处理方案 |
| 复古、印刷、ASCII、故障、摄像机 | shader 效果或带效果的 preset |
| 遮蔽整个选中的媒体 | 隐私 Blur 或 Pixelate |
| 隐藏一张脸、一块车牌、一个地址或一块屏幕区域 | 单独的裁剪/遮罩/素材，或外部工具 |
| 把注意力引到媒体上而不改变其像素 | 构图取景、运动，或可选的 overlay |
| 揭示、聚焦、去像素化、淡出处理方案 | 有限的、seek 安全的处理方案关键帧 |
| REC HUD、漏光、闪白、定格 cutout | Registry overlay 加上任何有理由的像素处理 |

路线标明的是这次改动的主要原因；它不是"只能用一个功能"的限制。当检查过的媒体和用户意图足以支撑整套组合时，最终的处理方案可以组合校正、一个 preset、收尾处理、多个兼容的 shader 效果、有限的关键帧取值和可选的 overlay。保留一个主意图作为创作锚点，让结果保持连贯且确定性。

校正能解决用户的不满时，不要再加风格化的效果（Effect）。请求只涉及时间维度时不要改颜色；单靠选中的媒体就能传达结果时，不要安装 overlay。

力度要与意图匹配。当用户明确点名一种大胆的风格，比如 VHS、故障、ASCII、半调网点（halftone）、摄像机、印刷或版画雕刻（engraving），就把它的标志性效果施加得足够强，让人一眼认出。防止添加用户没要求的东西，并不意味着把用户要求的效果做得不到位。校正和润色保持克制；点名的风格化必须在处理后的画面里一目了然。

### 保守地转译含糊的反馈

| 用户反馈 | 第一步动作 | 仅当画面证据支持时才添加 | 绝不推断 |
| --- | --- | --- | --- |
| 阴影太多，还有点无聊 | 提亮阴影/保护高光，然后对比一个克制、契合源素材的 preset | 轻微的对比度或自然饱和度 | 复古质感、HUD 或色板效果 |
| 让产品素材显得高级 | 保护产品颜色和标签，对比 Product Polish | 在生活方式素材上加克制的暗角 | 电影感 LUT 或压死的黑位 |
| 让这个揭示更酷 | 保留颜色，对一个受支持的效果或处理方案取值做动画 | 一个简短的自有 overlay block | 与之无关的整段风格化 |
| 让它有老式家庭录像的感觉 | 对照源素材比较 8mm 和 VHS 的视觉语言 | 有限的画面抖动/闪烁，或有理由的 HUD | 认定每个老录像请求都意味着 VHS |
| 把这张脸遮掉 | 解释实时效果作用于整个媒体；先隔离区域或使用外部工具 | 仅当用户接受这个范围时才用全媒体 Blur/Pixelate | 并未实际执行的人脸追踪或遮罩 |
| 品牌色要分毫不差 | 不改 UI/logo 像素；用构图取景和运动 | 经证实只调曝光的校正 | 风格化 preset、色板或 LUT |

当不止一条路线可能合适时，最多生成两个候选，并根据检查过的前后对比证据做选择。普通的校正或润色从一个候选开始；第二个候选是升级手段，不是默认做法。不要仅仅为了让答案看起来更高级而堆叠效果。

## 用现成起点还是自行拼装

当某个经过测试的配方直接适用时，用这张表。只读那一节配方。配方是可选的宏，不是允许结果的封闭清单。

| 意图或源素材 | 要读的配方标题 |
| --- | --- |
| 口播、访谈、主持人、以人物为主的照片 | `Natural Portrait` |
| 产品素材、生活方式素材、干净的社交媒体润色 | `Product Polish` |
| 屏幕录制、仪表盘、网站、应用 UI | `UI Fidelity` |
| 温暖的回忆、克制的怀旧 | `Film Memory` |
| 创作者/UGC 的手持摄像机质感 | `Creator Camcorder` |
| 模拟磁带回放 | `VHS Playback` |
| 小画幅家庭电影质感 | `8mm Home Movie` |
| 编辑风格的网点或油墨印刷 | `Editorial Halftone` 或 `Two-Ink Editorial Print` |
| 单色网点/线条丝网印刷 | `Monochrome Screen Print` |
| 版画雕刻或手绘排线插画 | `Engraved Illustration` 或 `Crosshatched Sketch` |
| 带扫描线的曲面显示器 | `CRT Display` |
| 基于字形的艺术 | `Procedural ASCII` |
| 实时色板量化 | `Ordered Palette Dither` |
| 精确复现经典的误差扩散 | `Cached Error Diffusion` |
| 有限时长的暖色漏光层 | `Organic Light Leak` |
| 定格画面的图形化打断 | `Freeze-Frame Cutout` |
| 短促的曝光闪白转场 | `Social Flash / Editorial Reveal` |

用 `rg -n '^## <heading>$' <SKILL_DIR>/references/media-treatment-recipes.md`，然后只读从该标题到下一个 `##` 之间的内容。不要为一个请求加载整本配方手册。

当源素材的意图不明确时，查看简洁的能力概览：

```bash
hyperframes media-treatment --capabilities --json
```

它按功能族列出完整的能力面，每项附一行描述。然后只加载与所检查源素材相关的那个功能族、效果、preset 或色板：

```bash
hyperframes media-treatment --capability <id> --json
```

聚焦的结果会给出合法控件、推荐的应用取值、渲染开销、色板支持，以及（在支持时）确切的动画约定。`--all` 只用于工具/测试，或真正需要穷尽的审计。用这些现有部件组合出一个嵌套 payload。配方和从目录构建的 payload 使用同一个渲染器和持久化约定。

把 `renderLane: "multipass"` 当作开销信号。Blur、Bloom 和 Kuwahara 是有界的，但比单 pass 效果更昂贵；除非 composition 确实需要，否则避免在许多同时出现的媒体元素上叠加其中几个，确实需要时，就验证播放和一次草稿渲染。开销既取决于元素数量，也取决于被处理的像素面积。同时可见的全画幅 multipass 媒体层超过两个时，需要在目标机器上做一次连续播放检查；如果掉帧，就简化这一叠效果或预渲染它。不要凭一台机器的结果去强加或宣称一个通用的硬上限。

## 通用工作流

1. 确认目标是一个真实的 `<img>` 或 `<video>`，并检查源素材的色彩元数据。
2. 图片就读一次。视频则把开头/中间/结尾的输出抓成一张带标注的拼版图（contact sheet），然后只读这一张图：

   ```bash
   hyperframes snapshot <project> --frames 3 --no-end --describe false \
     --output snapshots/treatment-before
   ```

   读 `snapshots/treatment-before/contact-sheet.jpg`；除非拼版图暴露出某个具体问题，否则不要花单独的模型轮次去逐帧读取。不要仅凭信号统计推断语义。

3. 选一条主路线。用一个匹配的配方作为经过测试的起点；请求是定制化的时候，则读概览和一个聚焦的能力详情。当拼版图有理由支持时，可以修改起点，或把它与兼容的目录控件组合。不要编造键、超出报告的范围，或在没有视觉理由时堆叠效果。不要先跑通用的 grade/LUT 解析器；它会引入不相关的候选，还可能下载一个用不上的 LUT。只有当校正需要实测的信号证据时，才用 `media-treatment --selector "#hero" --analyze --json`。
4. 用 `hyperframes media-treatment` 持久化像素设置；它会校验一个补丁，并把它合并进现有的嵌套 `data-color-grading` 约定。注册的 GSAP 只用于受支持的动画取值，Registry overlay block 只用于人为编排的装饰。
   ```bash
   hyperframes media-treatment --selector "<unique selector>" \
     --grading '<nested JSON patch>' --apply --json
   ```
   对于时间性的揭示，使用聚焦能力结果里的 `animation` 约定。如果它是 `null`，说明该能力是静态的。在真实媒体元素上内联写入起始 CSS 属性，并把临时的处理方案取值回归到中性，让最终镜头保留原有像素。优先采用这种有界的媒体动画；如果确有理由使用 overlay，就安装自有的 Registry block，而不是用定制的 overlay 标记重新做一个。对于校正和普通润色，把这些取值保留为可编辑的 preset/adjustment JSON；不要为实时 shader 已经拥有的控件生成 LUT。暗角、颗粒、模糊、像素化及相关基础构件，使用规范的 `details`/`effects` 字段。不要用 CSS 滤镜、SVG turbulence、透明度或装饰性的 DOM overlay 重复实现它们。
5. 当处理方案需要 overlay 时，用 `hyperframes add <name> --dir <project> --no-clipboard --json` 安装那个点名的 block，检查它返回的 `data-composition-src` 宿主，并按照该 block 的时间约定放置一次。插入前检查已安装的文件和宿主元素 ID；绝不要重复放置已有的 overlay block。这是一个完整的处理方案工作流：不要让用户自己去发现 Catalog，或单独再请求配方里有理由的 overlay。
6. 对于普通的校正/润色，用同样的三个时间点在 `snapshots/treatment-after` 下抓一张处理后的拼版图，和处理前的拼版图对比，结果明显更好时就停。运行常规的项目检查；不要仅仅为了证明一次静态校正而编码一份草稿。
7. 只有证据需要时才升级。要诊断某个具体的视觉问题时，读取单帧。评判处理方案关键帧、故障/磁带运动、overlay、播放流畅度、LUT 时序或任何其他时间性行为时，要预览并渲染出动态的证据。HDR/LOG、隐私和品牌敏感的工作还需要现有的明确提示和更强的验证。如果处理方案没有明显更好，就保持源素材不变。
8. 汇报所选媒体、主意图、使用的配方起点（如有）、最终组合的控件、可选的 overlay，以及实际检查过的帧/渲染。不要只凭命令执行成功就汇报视觉质量。

`media-treatment --analyze` 为本地 composition 媒体提供确定性的削波（clipping）和信号证据，而不是主体识别或自动审美。它会报告 HDR/元数据方面的提示和一个有界的一级校正补丁；它不会根据统计数据凭空生成色轮、曲线或 HSL 选区。
