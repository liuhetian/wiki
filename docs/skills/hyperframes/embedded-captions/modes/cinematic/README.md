<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/modes/cinematic/README.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Cinematic 模式（纯嵌入）—— 一个引擎，六套 DNA

> Cinematic 模式通过 **[engine.html](engine.html)**（`make-composition.cjs`）编译 **[../../dna/](../../dna/README.md)**。旧的逐模板 HTML 外壳已经退役 —— `cinematic-cream` 会自动映射到 `dna: "cream"`；其余归档模板（memory-wall / champion / portrait-header，在 [\_archive/](_archive/) 里）只作为设计参考保留。

这个模式用于纯嵌入的需求（没有 rail）：品牌片、热血燃向内容、社交短视频、作品展示。**DNA** 锁定视觉语言（字体、色板方案、混合模式、动效语法、hero 三幕）；**safe-zones v2** 把它参数化到具体场景（采样得到的强调色、沿光照方向的接触阴影、匹配景深的模糊）；**agent 只决定布局**（plane、文字块、在 DNA 范围内的逐行排版）。

## 工作流

1. `bash scripts/prepare.sh <project>` → matte ∥ transcript ∥ envelope → safe-zones v2
2. 选一套 DNA（[../../dna/README.md](../../dna/README.md)）：hero 横带偏亮 → `ink`，否则按语域选（cream / editorial / keynote / documentary / loud）。给出推荐，让用户来挑。
3. 编写 `<project>/cinematic.json` —— `"dna": "<name>"` + 意群块（thought-block）（schema 见 `scripts/make-cinematic.cjs` 文件头）
4. `node scripts/make-cinematic.cjs <project>` → plan.json → 引擎编译出的 index.html
5. `node scripts/preview-frames.cjs <project>` → § Visual QA（失败项检查 + [../../references/reference-bar.md](../../references/reference-bar.md) 里的 5 项正向检查）
6. `bash scripts/render-and-composite.sh <project>` → 闸门 → final.mp4

## 引擎会生成什么（这些绝不要手写）

- 从转录稿得出的逐词时间；块内累积 / 块间翻页
- hero 交接 + **三幕编排**（压暗 → 与 RMS 联动的逐字母入场 → 呼吸 + 发光），按 DNA 的 `hero` 块执行
- 场景 token：`--accent`（采样得到）、接触阴影、景深模糊
- 阅读顺序、按实测高度重新排位、hero 尺寸 / 碰撞的后处理

## 你不要做什么

- 覆盖 `.cap` 的颜色 / 混合模式 / 阴影 / filter / 动效曲线 —— 那是 DNA 的事。场景和这套外观打架 → 换一套 DNA（偏亮 → `ink`），绝不重新上色。
- 手动把 hero 摆进干净的边距里（它属于主体身上，遮挡约 30–55% —— safe-zones 的 `heroBands.best`）。
- 在素材画面上叠加全画幅的调色 / 纹理（硬规则：视频原样交付，不做任何改动）。

## 新增一套 DNA

`dna/<name>.json` —— 复制一份，改掉它的气质（voice）（见 [../../dna/README.md](../../dna/README.md) § Adding）。引擎不改代码就能直接消费它。一套 DNA 必须是有存在理由的独特气质，而不是换个颜色。
