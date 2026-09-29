# GPT Image 2 图库来源与收录说明

本目录收录 [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) 的**图库部分**：31 个分类页和它们引用的 169 张原图。页面整理成「一张图 + 一段 prompt」的纯净形态，按 7 个大类挂在 [图片分区索引](../index.md) 下。仓库里的其他内容不在这里：

- **反推 skill `get-prompt-from-image`**：作为独立的吸收型 skill 归档在 [skills/collab/get-prompt-from-image](../../../skills/collab/get-prompt-from-image/index.md)，有它自己的 MIRROR
- **生图 skill `gpt-image`**（操作手册、写作要点、2.5 接口文档与模板）、CLI 源码、测试、README 和仓库治理文件：不收，要看原貌走钉 commit 的永链 [tree @ 05cb113](https://github.com/wuyoscar/GPT-Image2-Skill/tree/05cb1130bba29e0fc028220376280a2e934a8041)

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/wuyoscar/GPT-Image2-Skill>（作者 Wuyoscar） |
| 已收录 commit | [`05cb113`](https://github.com/wuyoscar/GPT-Image2-Skill/tree/05cb1130bba29e0fc028220376280a2e934a8041)（上游最后更新 2026-09-10） |
| 抓取日期 | 2026-09-28 |
| 许可证 | MIT，原文见同目录 [`LICENSE`](LICENSE)，按条款随收录保留 |

## 文件对应

| 本地 | 上游 |
|---|---|
| `gallery-*.md`（31 个，文件名不变） | `skills/gpt-image/references/gallery-*.md` |
| `assets/<分类>/*.png` | `docs/<分类>/*.png`（相对路径不变，只是根目录从 `docs/` 换成 `assets/`） |
| [LICENSE](LICENSE) | `LICENSE` |

## 收录时做了哪些改动

### 全文中译（2026-09-29）

31 个分类页，连同 ```` ```text ```` 块里的 163 段 prompt，全部译成了简体中文，方便直接复制去出图。英文原文看上面钉 commit 的永链。译法规则：

- **要在画面里原样出现的文字保留原文**：引号里的标题、标语、招牌、图表标签、数字、公式，以及 prompt 明确要求 exact text 的内容。译掉它们，出来的图上的字就变了
- 专有名词（工作室、画家、品牌、作品、字体、软件）保留原文；不通行的美术和摄影术语写中文加英文括注
- 翻译时结构不变：标题、列表、表格、代码块、图片标签、链接目标跟原文逐一对应，用脚本逐文件比对过围栏数、`<img>` 行、链接目标、标题数和表格行数
- 分类名全站统一一套译名

### 纯净化：只留「图 + prompt」（2026-09-29）

- 每条的 `No. N · ` 编号去掉，标题只留名称；「图片：`assets/…`」路径行、元数据行（分类、画幅、尺寸、精选 / 作者 / 来源）、prompt 出处、视觉检查、运行记录、输出元数据、分类页头的「范围 / 条数」和「只在请求匹配时加载」说明，一律删掉
- 分类页一级标题前的 emoji（🎌、📷……）和条目标题里的「🆕」去掉，分类名只留文字
- 原来只以路径文字出现的额外图片（同一 prompt 的 Sunburst 输出、编辑接口的输入图）转成了真正的 `<img>`，同一条目里同一张图只留一次
- 上游的总索引 `gallery.md`（按编号范围路由）和 `docs/sunburst-samples.md`（Sunburst 运行记录表，里面的图都已出现在对应条目里）不再收录，由 [图片分区索引](../index.md) 按 7 大类取代
- 被删掉的出处信息（作者、来源链接）仍可在钉 commit 的上游原文里查到

### 路径


- 分类页里的图片 `<img src="../../../docs/…">` 改成 `assets/…`；每条目「Image: `docs/…`」那行元数据也同步改成 `assets/…`，让读源文件的 AI 拿到的路径是真实可访问的
- 展示层：上游的长 prompt 写在 ```` ```text ```` 块里，为了不改原文，由 `overrides/main.html` 按 URL 前缀给 `gallery/` 下的页面开启 text 块自动换行

## 混进来的其他来源

这个目录按分类组织，所以别的来源的条目也按分类放进了这里的页面，一律追加在该页原有条目之后。它们不属于上游仓库，漂移同步时不要当成上游条目去比对：

- [提示词卡牌](../../../skills/collab/prompt-cards/MIRROR.md) 的 10 条生图卡（2026-09-29 加入）：角色设计 2 条、摄影 4 条、插画 1 条、复古与赛博朋克 1 条、字体与海报 1 条、品牌系统与视觉识别 1 条。图片放在 `../prompt-cards/assets/`，不混进本目录的 `assets/`

## 没收的

- `docs/community-prompt-index.md` + `community-prompt-picks.json`：只是一份指向 Reddit、小红书原帖的链接清单，引用的 `example-community-*.png` 在上游仓库里也不存在，既没图也没 prompt
- 4 张只在 README 里出现的图：横幅 `docs/assets/gptimage2skill-banner.png`、反推演示的 `illustration/get-prompt-from-image-reference.jpg` 和 `-result.png`、`research-paper-figures/llm-agent-research-illustration.png`

## 未来漂移处置

上游图库一直在加条目。同步步骤：

1. `git clone --depth 1` 拿新 commit，对比 `skills/gpt-image/references/gallery*.md` 和 `docs/` 下的图片
2. 新条目按上面的规则中译、纯净化、改路径后放进对应分类页；新分类页要在两处各加一行：`mkdocs.yml` 的 nav 和 [图片分区索引](../index.md) 的对应大类
3. 更新本页表格里的 commit、日期和永链
