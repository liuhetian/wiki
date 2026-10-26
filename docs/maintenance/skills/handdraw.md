---
description: "手绘风格出图的维护记录：吸纳自 yang0/handraw-style（MIT），钉在 2a25a07（1.9.1）；6 个 skill 中译重组进 skills/handdraw/，写真企划另成 photo-shoot；Gallery 只留数据和样图，画风、排版、色彩三区页面由脚本生成，标题带编号供 skill 查"
---

# 手绘风格出图（handraw-style）

[手绘风格出图](../../skills/handdraw/index.md)和它的数据 —— Gallery 的[手绘风格库](../../gallery/images/handdraw-style/index.md)、[排版](../../gallery/layouts/index.md)、[经典主题色](../../gallery/colors/classic.md) —— 的维护记录。同一个上游里的写真拍摄企划另成一个 skill，记录在 [photo-shoot](photo-shoot.md)。

- **上游**：yang0/handraw-style[^repo]，作者 yang0，MIT，许可证原文不随附；上游 README 请求二次开发时保留作者和仓库地址，写在这里
- **commit**：钉在 `2a25a07`[^commit]（2026-10-19，`version.json` 1.9.1），2026-10-19 吸纳；2026-09-29 首次以整仓镜像收进 Gallery，当时是 `b5c302e`（1.2.29）
- **收成了什么**：
    - `skills/handdraw/`：抽象 skill，入口 + 6 个子 skill。入口收了上游根 `SKILL.md` 的路由表，和几个子 skill 共用的规矩（画风激活、垫样片、隔离声明、正面特征、智能推荐、编号不进 prompt）；出图提示词 ← `handdraw-style-prompter`，海报 ← `poster-prompt-generator`，文章与视频封面 ← `article-cover-designer`，长文配图 ← `article-illustration-planner`（带 `insert_illustrations.py`，原样随附），风格融合 ← `style-fusion-prompter`，IP 形象设计 ← `ip-designer`
    - `gallery/images/handdraw-style/assets/`：只留数据和样图 —— `references/` 下 5 个 JSON（styles、layouts、colors、model_capabilities、style_alias_map）和 167 份版式 md，加上页面引用到的 568 张图，共 740 个文件、35MB
- **跳过**：
    - `custom-asset-manager` 和入口里的「自建图库工作流」：它把用户的角色、道具、场景存进用户本机的目录，聊天中由 AI 当场写入；网页上的 wiki 对 AI 只读，存不进去。上游库里只有 1 个预置角色。保持同一个角色的办法改成 IP 设计里「三视图定稿后垫图」
    - `community-share`：往上游作者的论坛 handraw-style.com 发帖、管帖，要那边的账号
    - `style-library-importer`、`tweet-style-importer`、`layout-library-importer`：给上游的编号库加画风、抓推文画风、加版式，分配编号后重建画廊。本站的库是上游数据的镜像，远程 skill 改不了它；要加条目就等上游加
    - 首次调用时自动打开画廊：靠 Codex 专用的 MCP `mcp__codex_app__open_in_codex`；同一节里「首次回复带一句纯图模式提示」并进了纯图模式本来就有的那句
    - 「Utilities」和全部脚本：`build_*`、`validate_library`、`split_contact_sheets` 是上游维护编号库用的；`prompt_style.py`、`resolve_reference.py` 上游自己说只是方便核对，正常对话直接写 prompt，判定逻辑已经写进入口的激活表
    - 根 `SKILL.md` 除路由表外的部分：是 `handdraw-style-prompter` 的旧副本，图片路径还是改版前的分桶写法
    - 浏览用的 `README*`、`STYLES*`、`LAYOUTS*`、`COLORS*`、`TUTORIALS*`、`styles_200_reorganized.md` 和 6 个交互画廊 html：由 Gallery 页面取代；`DEPENDENCIES.md`、`MANIFEST.md`、`RELEASE_AUDIT.md`、`plan-gallery-feishu.md`、`AGENTS.md`（上游自己开发用：每次回复末尾附画廊链接）、`output/`、`requirements.txt`、`agents/openai.yaml`
    - 数据里没生成页面的：`tones.json` 的 16 种色调（没有 prompt 字段，只给上游桌面客户端同步数据用）、`characters.json` 的 1 个预置角色；图片里没人引用的 94 张：有拼图版就用不上的单图、根目录的拼图大表和微信二维码、色调图、色卡总表、版式预览图
- **翻译之外的改动**：
    - **结构**：几个子 skill 各写一遍的激活规则、推荐规则收进入口一次；SC-021 的七种类型、改图转绘、电商例外都在出图提示词里
    - **prompt 里一律不写编号**：上游的出图提示词这么要求（模型会把编号画成字），但海报、封面、风格融合、长文配图的模板都写了「#{编号} · 风格名」，统一改成只写名称，编号留在给用户看的推荐说明里
    - **风格融合的特征**：上游说编号展开时特征「逐字完整复制、严禁删减」，和出图提示词「删掉负面子句」相反；改成只删负面子句、其余逐字照抄，不压缩。融合不按激活省略特征，这一条照上游
    - **整段照抄的特征**：上游判定脚本里免过滤的写了 5 个新编号加 5 个旧编号，展开后是 8 条：FD-042、FE-048、FE-049、FE-051、FE-056、FE-057、FE-059、FH-042；列表里的 FH-050 库里没有
    - **过期编号按名字改回来**：长文配图推荐的「#216 扁平矢量设计」→ FC-029 Clean Airy Flat Vector Illustration，「#018」→ FA-018；「#001 极简白描」「#054 包豪斯几何构成」现在的库里没有这两种，删掉；色号「C-01 经典蓝」→ C-01 克莱因蓝，「C-05 暖赭石」→ C-29 赭石，「C-22 普鲁士蓝」→ C-03；海报例子的「C-28 暖杏仁」库里没有，换成 C-28 芥末黄；风格融合例子的「279」→ FA-040；信息图、社媒卡的条数 35、21 → 36、23。README 的例子「FH-039 (193)」「FE-052 (267)」新旧号对不上，没收，按旧号改用 FE-060；海报实测图标的「#FE-053 (#268)」按旧号 268 应为 FE-061，页面上照录原文并注明
    - **模型**：没指定模型或用 agent-io 的 gpt-image-2.5 出图时，按 gpt-image-2 的标定走 —— 上游只标定了 gpt-image-2，例子里把 2 和 2.5 并列；「全自动出图」「全自动生图」接 agent-io 的图片生成，垫样片、改图、垫三视图走它的编辑接口
    - **IP 设计**：上游 18 张卡里有 4 张只写了目的；有对应版式的 9 张卡标上版式库的编号，取版式原文当 prompt 主体（IP-09 用 IP-013、IP-17 用 IP-003）；版式库多出的 4 条列成传播延展；补了「三视图先定稿、其余卡垫它」和「没说档位就出基础版」
    - **封面**：上游的后处理写的是 DALL-E 3、FPBrowser2API 这类只给固定尺寸的接口，改成 agent-io 出不了 2.35:1 时先出 16:9 再居中裁切
    - **长文配图**：上游只给了信息图那一种 prompt 模板，叙事类文章改成照出图提示词写；输出模板的英文字段名译成中文
- **Gallery 页面**：
    - 由仓库根的 `scripts/build-handdraw-gallery.py` 从 `assets/references/` 生成，别手改。`styles-a.md` … `styles-i.md` 来自 `styles.json`，按编号前缀 FA–FI 分 9 页，页名取前缀第二个字母；`gallery/layouts/` 下除 `index.md` 外的五页来自 `layouts.json` 和 `layouts/*.md`，只取 `<!-- zh -->` 段；`gallery/colors/classic.md` 来自 `colors.json` 的 `prompt_zh`
    - 条目标题是「编号 · 名称」，skill 按编号来这里查；画风样片下面一行「参考：参考作者 ｜ gpt-image-2：认得名字 / 靠画法特征 / 要垫样片」，判定照上游 `resolve_reference.py`，没登记的条目按 gpt-image-2 的默认值算靠特征
    - 画风片段只放 `traits` 原文，不过滤负面子句，过滤规则写在入口页；编号和参考作者不进片段。没写 `traits` 的 17 条都标了名字激活强，片段照上游格式写成「风格名称：…。参考作者/风格名称：…。」
    - 样片优先用 `{编号}_grid.webp`，没有才用 `{编号}.webp`，跟上游选参考图的顺序一致。部分单张样片是从拼图大表裁出来的，边缘带着相邻格子的半行标题（如 FB-001 顶部露出「— Loose Ink-and-Wash Storybook」）；上游垫图用的也是这张，照原样保留
    - 1.9.1 起上游把 001–365 的流水号改成 FA-001 这种分组编号，分组也重排了。画风页沿用 a–h 的网址再加 i，旧网址都还在，只是 f、g 两页从「通用网感」「中国当代插画补充」换成了「黏土毛毡纸雕」「动漫赛璐璐」

## 上游更新

1. clone 上游，`git diff 2a25a07..<新 commit> --stat -- skills SKILL.md` 看 skill 动了什么，逐个对照 `skills/handdraw/` 的对应页改；写真企划的变化照 [photo-shoot 的记录](photo-shoot.md)处理
2. 跑 `python3 scripts/build-handdraw-gallery.py --sync <clone 路径>`：清空 `assets/`，只拷进数据和页面引用到的图片，再生成页面。新增了风格分组或版式类别，先登记进脚本里的 `STYLE_GROUPS` / `LAYOUT_GROUPS`，没登记的脚本会直接报错
3. 上游新加了子 skill，按上面的标准判断收不收，收就在入口的路由表加一行
4. 更新本页的 commit、日期和版本号；条数变了，同步改 skill 入口、[手绘风格库](../../gallery/images/handdraw-style/index.md)入口、[图片](../../gallery/images/index.md)、[排版](../../gallery/layouts/index.md)和 [Gallery](../../gallery/index.md) 索引里的数字；没写 `traits` 的条数、整段照抄的名单变了，入口页对应的地方也要改
5. 跑 `python3 scripts/check-links.py`

[^repo]: [yang0/handraw-style](https://github.com/yang0/handraw-style)，2026-10-19 读。
[^commit]: [`2a25a07`](https://github.com/yang0/handraw-style/tree/2a25a079a21845fa20dabc6bb2ad53a244a46584)，2026-10-19 读。
