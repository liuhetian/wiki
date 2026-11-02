---
description: "DeepTutor 拆解的维护记录：读的是 a31d826（v1.6.15，2026-10-29 读），Apache-2.0 许可；源码存档和行号怎么对；纯函数怎么实跑、父包怎么登记成空壳绕开重依赖，脚本附后；15 个仿真 demo 照哪些上游文件抄的、偏离了哪里、怎么不开浏览器验"
---

# DeepTutor 拆解的维护记录

这是 [DeepTutor](../../projects/deeptutor/index.md) 背后的事。正常阅读不用看，要对照上游更新、核对出处、重跑实验、改界面 demo 时再看。

## 版本和素材 { #sources }

- **上游**：[HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor)，港大数据智能实验室，Apache-2.0 许可，许可证原文不随附；论文 arXiv 2604.26962 只当线索读
- **读的版本**：`main` 分支 `a31d826`（v1.6.15，2026-10-19 发布），2026-10-29 读。各页不逐处标版本，上游更新了再对照这一个点。读的时候它三四天发一版，最近三个月每月五百到七百多个提交
- **源码存档**：`assets/deeptutor-src/` 是细讲页引到的 77 个文件，逐字未改，目录结构和原仓库一致，行号按存档算。没存 `.md` 文件：存进 `docs/` 的 markdown 会被建成孤儿页
- **跳过了什么**：
    - 背面不收：根目录的 `SKILL.md` 是操作一个已装好的 DeepTutor 的命令行手册，本站不部署它；`deeptutor/skills/builtin/` 下的 docx、pdf、pptx、xlsx、skill-creator 是 Anthropic 公开 skill 的拷贝
    - 上游 README 里 1.4 到 1.6 版的 60 多张界面截图不收，界面看 demo；README 的十二种语言副本不收
    - EduHub 技能站是另一个来源，没收，也没进收藏夹
    - 伙伴、子智能体、智能写作、设置、多用户、沙箱、技能中心只在入口页各讲一段，不开功能线
    - 要调模型的流水线（出题的生成、深研、归并记忆、Book 编译）只贴模版，没跑
- **AGENTS.md 和代码对不上的地方**，正文都以代码为准：
    - 用户能开关的工具是 8 个，多一个 `zotero_search`，不是 7 个
    - 出题实际跑 exploring → planning → quizzing，ideation → generation 只剩在能力清单里
    - 聊天只有一个 `responding` 阶段，不是 exploring → responding
    - 可视化的生成在聊天循环里，三段式的 `VisualizePipeline` 只剩书的插图块在用
    - `emit_capability_result` 在 `agents/_shared/capability_result.py`，不在 `capabilities/_shared.py`
- **代码自己的注释和代码对不上的地方**：
    - `reader_goto` 的工具说明和类注释写「引文对不上就拒绝跳转」，代码已经改成照跳不高亮
    - `services/memory/consolidator/references.py` 有一处注释说 L3 的事实没有来源，代码其实按 `### surface:` 标题给 L3 记了场景名
    - `TaskBoardStore.context_text` 这一版没有调用方，模型看不到看板

## 实验设置 { #sim }

细讲页里标着「效果」的块，来自 2026-10-29 的实跑，材料在 `assets/sim/`：

- **只跑纯函数**：不起应用、不调模型、不放密钥。能脱离模型的机制 —— 掌握分、门、下一步、间隔复习、模式门禁、判分、路线规范化；记忆文档的解析和写回、操作批的校验、切块；索引版本、检索模式、评测指标；事件总线的重放、ask_user 的参数清洗、工具表；出题的格式检查、解题进度、研究队列、可视化校验器；书的估算、过期页、导出、进度；阅读的检索和引文核对、字幕分段；题库触发器、每日练习的间隔、学习日志注入 —— 都 import 上游的函数原样跑，不重写它的逻辑
- **绕开重依赖**：DeepTutor 的不少包一 import 就把整个应用拉起来（`services/memory/__init__` 一路导到 openai 客户端，`reading/__init__` 导 PyMuPDF）。`harness/_load.py` 先把父包登记成带 `__path__` 的空壳，再 import 目标模块，Python 只执行目标文件和它真正 import 的东西。登记成空壳的有 `services.memory` 及其下的 consolidator、snapshot，`capabilities.mastery`、`book`、`reading`、`runtime`；`deeptutor.services.llm` 也是空壳，只补一个空的 `complete`
- **替身**：`LearningService` 用 `__new__` 建，绕开 SQLite；`MemoryStore` 用上游自带的 `memory_path_service_override` 指到临时目录；知识库管理器用临时目录；`BookStorage` 只交书脊和页面，`ReadingStore` 只交单元文字，页面规划器的写作器和提示词模块是空模块；`tool_composition` 依赖的工具名单从 `builtin_specs` 和源码字面量里读出来补上，不手抄；出题流水线的三个方法用 ast 从原文抠出来执行；索引的存储文件用占位 json 代替；题库的建表语句从 `sqlite_store.py` 原文截取，在内存 SQLite 里执行
- **调过的参数**：记忆切块的最小块从 1000 调成 200，好在短文本上看到切分；其余都是上游默认值，页面上注明了
- **构造的输入**：全部构造，围绕一本《应用统计学》第 8 章「假设检验」：例 8.3 的数（n 25、均值 52.3、标准差 4.1、t 2.80、双侧 p 0.0098）用 scipy 核过；路线草稿、作答序列、检索命中、题集、记忆文档、字幕、书脊、讲义改动都写在脚本里，页面上注明是构造的
- **每次跑都会变的**：记忆的事件 id、条目 id 和时间戳，书和精通路径输出里的绝对时间戳；`mastery_session` 用真实时钟，页面上只引相对时间。其余输出重跑逐字节一致
- **跑法**：把上游克隆到本地并 checkout `a31d826`，然后

    ```bash
    bash docs/projects/deeptutor/assets/sim/harness/run_all.sh <DeepTutor 克隆路径>
    ```

    它对每个脚本跑 `uv run --with pydantic --with pyyaml --with json-repair --with jsonschema --with defusedxml --with httpx python3 -I -B <脚本> <克隆路径>`；`-B` 不写 `__pycache__`，这个目录会随站点发布。脚本开头核对克隆的 HEAD，对不上就退出

## 实跑脚本 { #scripts }

??? abstract "_load.py：父包登记成空壳、输出写到 out 和 txt"

    ```python
    --8<-- "projects/deeptutor/assets/sim/harness/_load.py"
    ```

??? abstract "run_all.sh：重跑全部"

    ```bash
    --8<-- "projects/deeptutor/assets/sim/harness/run_all.sh"
    ```

??? abstract "线 1 知识库：knowledge_eval.py、knowledge_mode.py、knowledge_versions.py"

    ```python title="knowledge_eval.py"
    --8<-- "projects/deeptutor/assets/sim/harness/knowledge_eval.py"
    ```

    ```python title="knowledge_mode.py"
    --8<-- "projects/deeptutor/assets/sim/harness/knowledge_mode.py"
    ```

    ```python title="knowledge_versions.py"
    --8<-- "projects/deeptutor/assets/sim/harness/knowledge_versions.py"
    ```

??? abstract "线 2 一轮对话：runtime_ask_user.py、runtime_replay.py、runtime_tools.py"

    ```python title="runtime_ask_user.py"
    --8<-- "projects/deeptutor/assets/sim/harness/runtime_ask_user.py"
    ```

    ```python title="runtime_replay.py"
    --8<-- "projects/deeptutor/assets/sim/harness/runtime_replay.py"
    ```

    ```python title="runtime_tools.py"
    --8<-- "projects/deeptutor/assets/sim/harness/runtime_tools.py"
    ```

??? abstract "线 3 学习模式流水线：modes_quiz_check.py、modes_research_queue.py、modes_solve.py、modes_visualize_validate.py"

    ```python title="modes_quiz_check.py"
    --8<-- "projects/deeptutor/assets/sim/harness/modes_quiz_check.py"
    ```

    ```python title="modes_research_queue.py"
    --8<-- "projects/deeptutor/assets/sim/harness/modes_research_queue.py"
    ```

    ```python title="modes_solve.py"
    --8<-- "projects/deeptutor/assets/sim/harness/modes_solve.py"
    ```

    ```python title="modes_visualize_validate.py"
    --8<-- "projects/deeptutor/assets/sim/harness/modes_visualize_validate.py"
    ```

??? abstract "线 4 精通路径：mastery_grade.py、mastery_mode.py、mastery_route.py、mastery_schedule.py、mastery_score.py、mastery_session.py"

    ```python title="mastery_grade.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_grade.py"
    ```

    ```python title="mastery_mode.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_mode.py"
    ```

    ```python title="mastery_route.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_route.py"
    ```

    ```python title="mastery_schedule.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_schedule.py"
    ```

    ```python title="mastery_score.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_score.py"
    ```

    ```python title="mastery_session.py"
    --8<-- "projects/deeptutor/assets/sim/harness/mastery_session.py"
    ```

??? abstract "线 5 Book 引擎：book_drift.py、book_estimate.py、book_export.py、book_progress.py"

    ```python title="book_drift.py"
    --8<-- "projects/deeptutor/assets/sim/harness/book_drift.py"
    ```

    ```python title="book_estimate.py"
    --8<-- "projects/deeptutor/assets/sim/harness/book_estimate.py"
    ```

    ```python title="book_export.py"
    --8<-- "projects/deeptutor/assets/sim/harness/book_export.py"
    ```

    ```python title="book_progress.py"
    --8<-- "projects/deeptutor/assets/sim/harness/book_progress.py"
    ```

??? abstract "线 6 沉浸阅读与视频：reading_search.py、reading_video.py"

    ```python title="reading_search.py"
    --8<-- "projects/deeptutor/assets/sim/harness/reading_search.py"
    ```

    ```python title="reading_video.py"
    --8<-- "projects/deeptutor/assets/sim/harness/reading_video.py"
    ```

??? abstract "线 7 记忆：memory_consolidate.py、memory_document.py、memory_ops.py、memory_recall.py"

    ```python title="memory_consolidate.py"
    --8<-- "projects/deeptutor/assets/sim/harness/memory_consolidate.py"
    ```

    ```python title="memory_document.py"
    --8<-- "projects/deeptutor/assets/sim/harness/memory_document.py"
    ```

    ```python title="memory_ops.py"
    --8<-- "projects/deeptutor/assets/sim/harness/memory_ops.py"
    ```

    ```python title="memory_recall.py"
    --8<-- "projects/deeptutor/assets/sim/harness/memory_recall.py"
    ```

??? abstract "线 8 学习空间：space_bank.py、space_journal.py、space_practice.py"

    ```python title="space_bank.py"
    --8<-- "projects/deeptutor/assets/sim/harness/space_bank.py"
    ```

    ```python title="space_journal.py"
    --8<-- "projects/deeptutor/assets/sim/harness/space_journal.py"
    ```

    ```python title="space_practice.py"
    --8<-- "projects/deeptutor/assets/sim/harness/space_practice.py"
    ```

## 界面 demo { #demos }

15 个界面 demo 照上游前端源码手抄，不看截图、不开浏览器。共用三个文件放在 `assets/demos/`，入口页的附录折叠引了一次：

- **`dt-base.css`**：`web/app/globals.css` 166-199 的默认主题 `.theme-snow` 令牌逐字搬，动画关键帧逐字搬（`globals.css` 753-1000、1175-1214，精通路径那几段来自 `components/space/learning/mastery-theme.css`）；组件样式是把 `shared/ui/`、`components/activity/`、`components/sidebar/` 里的 Tailwind 类串换算成普通 CSS，每条注释写原串。文件头有一张 Tailwind 到 CSS 的换算表
- **`dt-runtime.js`**：时间线自动播放（滚出视口、切走标签页时暂停，系统开了减少动效时文字一次到位）、重播键，以及侧栏、活动行、思考卡、按钮、状态 chip、进度环这些照上游组件抄的零件
- **`dt-data.js`**：贯穿所有 demo 的假数据，同一本《应用统计学》第 8 章、同一道例 8.3、同一个问题
- **文案**：每个 demo 的 `T` 对象只放上游中文语言包 `web/locales/zh/app.json` 里有的键，值逐字一致；语言包里没有的中文另放，不进 `T`
- **图标**：lucide（ISC 许可），SVG 内层逐字取自本站 zensical 自带的 `templates/.icons/lucide/`；运行时带了 144 个，个别 demo 在自己脚本开头补
- **字体**：上游用 Geist 和 Lora，本站没收；从上游 `tailwind.config.js` 的回退链开始，中文本来就落在这些字上，西文和数字的字宽差几个百分点

**共同的偏离**：思考球上游是 vendor 的 thinking-orbs 画布，换成 7 个点的 CSS；品牌标换成衬线字标「D」；模型商、聊天软件、检索引擎、GitHub 这些品牌图标换成中性字形或字母方块；iframe 窄于 860px 时侧栏换成上游自带的 60px 折叠图标轨。

**各 demo 的偏离**，每个 demo 文件头注里都写了：

- **任务看板**：上游容器宽 800px 起才排三栏，这里 520px 起就排；拖拽画成「原卡变淡、目标栏描边」，不画跟手的影子卡
- **伙伴和通道**：通道的品牌图换成上游给 Slack、Mochat 用的那种字母方块，颜色取上游的品牌色；二维码是确定性画出来的假码；主从两栏在 560px 起并排，上游要到 md 断点
- **知识中心**：文件页签右侧的预览只画几行字
- **今日练习**：照上游现行首页 `ReviewHome.tsx` 做；到期数、今日已复习数、题库题数写死在 demo 里；原生进度条换成同尺寸的条，练习统计的折叠区不展开
- **出题卡**：题干不走 KaTeX，写成纯文本；追问对话不展开
- **设置就绪**：状态条里内存项的数值写死
- **聊天首页**：用量面板挂在 pill 上方，上游是挂到 body 的浮层；问候语固定一句；pill 写「3862 tokens」，这是上游中文紧凑数字格式的真实输出
- **智能写作**：编辑器画成一行一个 div，不是 textarea；选区浮条画在编辑器里，不能拖；模型选择器只画按钮
- **可视化**：Chart.js 配置是自写的，t(24) 的密度数值核过，积分为 1、2.064 以外的尾巴是 0.025；全屏层在 iframe 里
- **Book**：书脊底部的估算用实跑的 `book-estimate` 数，照 `SpineEditor.tsx` 213-228 的加法：5 章约 15600 字、预计 16 分钟；章节正文、概念图、测验题自写；进度历史展开和书内对话面板没画
- **精通地图**：宽屏时上游右侧还有学习档案和会话一栏，大纲下方还有复习计划，都没画；时间用固定的相对说法
- **精通学习会话**：上游左侧大纲栏要视口 1280px 起才出现，这里 720px 起就显示；彩纸照搬上游参数，随机数换成确定性的，每圈落点一样
- **沉浸阅读**：上游三栏要视口 1280px 起，这里 980px 起就三栏，窄了收起目录；页卡里没有 PDF 光栅，正文用衬线字排进去，字号按页宽缩放，页高按 A4 比例；没正文的页画成上游「还没渲染」的样子；跳转照上游是瞬间跳；用的是上游「全屏学习」的状态，不画应用侧栏
- **视频阅读**：三栏同沉浸阅读；B 站播放器换成一块讲课幻灯片加一条通用控制条；时间按演示节奏快进
- **记忆图谱**：节点没移植上游 `placeNodesInSlice` 的六边形网格，每个扇区里按序号均匀取角、半径用 (i·7919) mod 97 散开；扇区角度、层半径、颜色、连线曲率、标签位置照上游；画布不能拖动和缩放，缩放百分比是演示值

**怎么验**：

```bash
node scripts/check-deeptutor-demos.mjs --locale <DeepTutor 克隆>/web/locales/zh/app.json
```

只在改 `assets/demos/` 时跑。它在 node 的 vm 沙箱里真加载 `/vendor` 的 React 18 和 htm，按时间线把每一步的状态算出来、每一步都用函数组件渲染一遍元素树（hooks 打桩，不进 DOM），核渲染报错、找不到的图标、没在样式里定义的 class、滚动容器和目标在不在那一刻的界面里、htm 模板的标签配平、iframe 高度和 demo 声明的高度对不对得上、`T` 和语言包是否逐字一致。Chart.js、Mermaid 换成桩，demo 只在 `useEffect` 里调它们。画出来好不好看，脚本核不了，要在浏览器里看。
