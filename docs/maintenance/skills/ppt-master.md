---
description: "PPT Master 的维护记录：吸纳自 hugohe3/ppt-master（MIT），钉在 523e5bd（6.7.3）；只收规划、沟通模式、配图写法和三份风格目录，流水线不收、引导客户端装上游；规划和配图是提炼改写，其余中译"
---

# PPT Master（ppt-master）

[PPT Master](../../skills/ppt-master/index.md) 和 Gallery 里 [PPT 风格库](../../gallery/images/index.md#ppt-master)、[PPT 配图版型](../../gallery/layouts/deck-image-types/index.md)的维护记录，一个来源写在一篇。

- **上游**：hugohe3/ppt-master 的 `skills/ppt-master/`[^repo]，作者 Hugo He，MIT，许可证原文不随附。仓库同时是只装这一个 skill 的 Claude Code 插件，没有 hooks、agents、commands、mod、MCP，没有组件要转写或丢弃
- **commit**：钉在 `523e5bd`[^commit]（2026-10-23，版本 6.7.3），当天抓取

## 为什么不收流水线 { #why-not-pipeline }

和用户分析后定的（2026-10-23）：只收离开脚本也能用的知识，生成 PPTX 由客户端装上游跑。

- **网页上读文档跑不通**：每条路由每一步都调本地脚本，主工作流 `workflows/generate-pptx.md` 一篇就调了 28 次；入口要求按 `${SKILL_DIR}` 绝对路径执行、不许 `cd`。客户端要跑只能整包，中文网页只对人有用
- **有完整性校验**：`scripts/attribution_guard.py` 查 `SKILL.md` 这个文件名、frontmatter 里 `copyright` / `license` / `official_repository` 三个字段的原值和 `sponsors` 字段、`LICENSE` 的哈希、9 个入口脚本开头的调用，`console_encoding.py` 里还有第二道。按本站规范把 `SKILL.md` 改名 `index.md`，主要脚本全部以退出码 78 退出
- **文档和脚本咬得死**：跨文件靠 gate、§IX、确认项字母、Step 编号互引；脚本按英文字段名解析 `design_spec.md`、`spec_lock.md`，校验器的报错里写死了 `references/xxx.md §1`
- **上游变得快**：2026-08-30 到抓取当天有 358 个 commit；近 30 天脚本改了 76 个文件、新增约 7000 行。收进来的这几部分同期没有改动
- **体积**：1.3 万个文件约 78MB，图标库 1.2 万个 SVG 49MB、音效 12MB

## 文件对应 { #files }

| 本站 | 上游 | 怎么收的 |
|---|---|---|
| `skills/ppt-master/index.md` | `SKILL.md` frontmatter 的 description、`workflows/routing.md` | 自己写：领域建模取自这两处，加装上游的须知 |
| `skills/ppt-master/strategist.md` | `references/plan-core.md` §1–6、`references/strategist.md` §1 a–h、`references/canvas-formats.md` 的画幅表和字号起点表、`references/visual-styles/_index.md` §2 | 提炼改写成九项清单，不是逐段翻译 |
| `skills/ppt-master/modes/` | `references/modes/`（`_index.md` + 5 篇） | 全文中译，`_index.md` 改名 `index.md` |
| `skills/ppt-master/image-generator.md` | `references/image-generator.md` §1、§2、§3 第 3 步、§4、§4.1、§4.2、§5，`references/image-renderings/_index.md` §1.5 和 §2 | 提炼改写，四段示例和 §5 的规矩照译 |
| `gallery/images/ppt-master/index.md`（视觉风格一节）+ `gallery-visual-styles-*.md` 5 页 | `references/visual-styles/` 的 `_index.md` 目录表 + 18 篇 | 全文中译，一种风格一条；分组照上游目录 |
| `gallery/images/ppt-master/index.md`（配图画风一节）+ `gallery-renderings-*.md` 4 页 | `references/image-renderings/` 的 `_index.md` + 20 篇 | 全文中译，一种画风一条；分组照上游目录 |
| `gallery/layouts/deck-image-types/` 入口 + 4 页 | `references/image-type-templates/` 的 `_index.md` + 11 篇 | 全文中译，一种版型一条；上游没分组，自分四组 |
| `gallery/images/ppt-master/assets/visual-style/*.svg` | `scripts/confirm_ui/static/style_previews/*.svg` | 18 张原样，上游确认界面给每种风格画的示意页 |
| `gallery/images/ppt-master/assets/rendering/*.webp`、`type/*.webp` | `references/ai-image-comparison/rendering/`、`type/` | 20 + 11 张原样，上游控制变量生成的对比图 |

## 跳过了什么 { #skipped }

- **流水线本身**：`workflows/` 23 篇；`scripts/` 200 多个 Python 脚本、24 篇脚本文档和测试；`templates/` 的品牌、风格、版式、整套 deck、图表、表格模板，图标库和音效库
- **其余 references**：执行层的 `executor-*`、`native-*`、`pptx-*`、`shared-standards*`、`svg-*`、`semantic-svg`、`topology-assembly`，以及 `animations`、`video-design`、`image-searcher`、`image-layout-*`、`image-base`、`strategist-image`、`strategist-template`、`template-designer`、`visual-review`、`confirm-surface`、`artifact-ownership`。都是给这套 SVG → PPTX 管线写的契约
- **`references/image-palettes/`** 15 篇和 `ai-image-comparison/palette/` 14 张对比图：上游自己标成旧版兼容材料，配色改由 deck 的配色体系定
- **规划和配图两篇里流水线专属的部分**：三阶段确认的界面和载荷、`design_spec.md` / `spec_lock.md` 的写法和两道闸门、事实编号 `facts.json` 的引用约定、图表和表格模板的校验命令与 `Native-ready` 标记、图标同步命令；`image-generator.md` 的 §4.3 插画拼版（绿幕拼版要靠 `slice_images.py` 切图）、§4.4 分层重建、§6 manifest、§7 三条出图路径、§8 常见问题、§9 禁止项
- **仓库其余部分**：README、`docs/` 文档站、`projects/` 示例目录、`index.html`、`AGENTS.md`、`CLAUDE.md`、`.github/`、插件清单、赞助商文件（随上游安装，本站不收）

## 翻译之外的改动 { #changes }

- **能力名**：入口叫 PPT Master，三个子 skill 叫规划 deck（`strategist.md`，对齐上游的 Strategist 角色）、沟通模式（`modes/`）、生成配图（`image-generator.md`，对齐上游的 Image_Generator 角色）；视觉风格、配图画风、配图版型三份目录按用户的意思放进 Gallery，不做子 skill
- **中文名**：沟通模式、视觉风格、画风用上游确认界面 `scripts/confirm_ui/static/catalogs.json` 和 `app.js` 里的官方中文标签（showcase 叫「展演」）；版型上游没有中文名，自己译
- **id 不变**：每条的标题和锚点都用上游 id（`swiss-minimal`、`vector-illustration`、`funnel`），跑上游流程时能原样交给它
- **去掉流水线耦合**：确认项字母、`design_spec` / `spec_lock` / `§IX` 这类字段名、Default 和 Quick 两种运行时、Strategist / Executor 角色名、确认界面、「只读选中那篇、绝不 glob 目录」这类加载规则、指向没收的上游文件的链接，一律删掉或改写成通用说法；有实际指导意义、只是挂在字段上的，改写保留。例：「Family is chosen at confirmation `g`」→「具体字体按主题挑」，briefing 里「填 `design_spec.md §IX` 时 `core_message` 写覆盖范围」→「每页的核心信息写覆盖范围，不写论断」
- **视觉风格页**：每篇的配套画风并进条目头一行，链到画风页对应锚点；每篇末尾重复的通用说明（插画由谁定、艺术字另算）挪到页首说一次；PowerPoint 预设形状名和 SVG 写法提示保留，做 PPT 和 SVG 页面时仍然有用
- **画风页**：每条加「配套的视觉风格」一行，从 `visual-styles/_index.md` 的配套画风列反推，矢量插画、3D 等距、暖调场景、幻想动画、自然有机五种没有配套就不写；画风目录的「选画风」五个维度和「自写画风段落」挪进生成配图，那是方法；对比图说明删掉 `_manifest.json` 和 `image_gen.py --manifest` 复现命令；旧版配色名（cool-corporate 这些）换成「冷静商务配色」这样的描述
- **版型页**：目录里的用途关键词、默认画幅和对比图主题并进各条开头的速览行；原文没有表头的维度表补了表头，不然不成表；ASCII 骨架图照录不译；原文明确要求画进图里的英文字面串（OLD WAY、NEW WAY、GROWTH 这些）保留英文，只是举例的关键词译成中文；scene 原文拿上游已经没有的 hero、background 两种版型作对比，改成和单一主体的主视觉、没有主体的背景作对比
- **能直接贴进 prompt 的段落**（画风段落、示例片段、版型的写法）都放进 `text` 代码块，色值去掉反引号
- **按分组拆页**：三份目录各有一个入口 `index.md`，放总说明和每条一句话的目录，正文按分组一页。版型上游没分组，按顺序与流程（流程图、循环、时间线、漏斗）、结构与层级（框架、金字塔、矩阵）、对比与汇总（对比、信息图）、空间与场景（地图、场景）自分四组。2026-10-23 试用时，整页 43–57KB 的 `.md` 让抓取工具截断，拆完每页 15KB 以内，只有现代商务画风（9 种）26KB
- **规划 deck**：配色、字体两节的参考色、安全字体、字号比例照搬上游的值；安全字体那段压成一张表，只留各文字一组常用字体
- **生成配图**：出图从上游的 16 家后端换成 [agent-io 的生成、编辑图片](../../skills/agent-io/reference/image.md)；prompt 模板、四段示例和「色值不是文字」那句追加语译成中文
- **装上游**：入口写明出图方式选「宿主原生工具（路径 B）」接 agent-io —— 上游本来就有这条路线（`references/image-generator.md` §7 Path B），不用改它的脚本

## 上游更新 { #upstream-update }

客户端装的是上游最新版，这边钉在 `523e5bd`。上游改了风格目录，id 可能对不上，以人工跟进为准：

1. `git clone --depth 1` 拿新 commit，和 `523e5bd` 比对 `references/modes/`、`visual-styles/`、`image-renderings/`、`image-type-templates/`、`plan-core.md`、`image-generator.md`、`canvas-formats.md` 和 `scripts/confirm_ui/static/style_previews/`、`references/ai-image-comparison/`
2. 有变化的按上面的规则重译或重新提炼；增删了条目，同步 Gallery 页的条目和入口里的数字
3. 完整性校验的规则（入口「装上游」那几条）对照 `scripts/attribution_guard.py` 核一遍
4. 更新本页的 commit、日期和脚注

[^repo]: [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)，2026-10-23 读。
[^commit]: [`523e5bd` 的 skills/ppt-master](https://github.com/hugohe3/ppt-master/tree/523e5bd972f94c3cac8742fec0d54d43824a17bb/skills/ppt-master)，2026-10-23 读。
