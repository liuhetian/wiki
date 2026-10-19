---
description: "写真拍摄企划的维护记录：吸纳自 yang0/handraw-style 的 couple-photo-orchestrator（MIT 带署名），钉在 2a25a07；入口和总控合并，生图换成 agent-io，脚本只改三行"
---

# 写真拍摄企划（photo-shoot）

[写真拍摄企划](../../skills/photo-shoot/index.md)的维护记录。

- **上游**：yang0/handraw-style 仓库[^repo]的 `skills/couple-photo-orchestrator/`，作者 yang0，MIT 加一条署名要求：基于它的二次开发要在文档、仓库、产品说明或界面里保留原作者 yang0 和原仓库链接[^license]，本页就是署名处。上游是一个「完整工程包」：入口 `SKILL.md`、总控 `skills/zongkong/`、6 个子 skill（kefu、hairstyle、makeup、meihua、huanzhuang、paishe），规则真身在 `CORE_REQUIREMENTS.md`，包内版本号 2.24.24，仓库 `version.json` 是 1.9.1。正文本来以中文为主，kefu、zongkong 的 references 和几处模板有大段英文
- **入口和 zongkong 的关系**：两份 `SKILL.md` 的 name、description 一字不差。zongkong 是完整工程包里的总控，比入口多「内部路由」「聊天优先 / 工程持久化两种入口」「旧工程兼容」和一大段真人参考图规则，脚本也放在它下面；入口是仓库对外的安装入口。2026-10-04 的三个提交（首轮方向卡改成可复制的代码块、末尾加「出8宫格图片。」、回 A/B/C 直接出图）只改了入口、`CORE_REQUIREMENTS.md`、kefu 的方向卡模板和 zongkong 的 `interaction-modes.md`，没碰 zongkong 的 `SKILL.md`。这里两份合成 `index.md`，冲突处按 10-04 的版本
- **commit**：钉在 `2a25a07`（2026-10-19），当天读
- **跳过**：
    - 25 个测试：各子 skill 和 `scripts/` 下的 `tests/`
    - `scripts/build_release.py`：正式 ZIP 的构建器，查目录完整、文件数、三处版本号同步、YAML 可解析、Python 可编译、缓存清理
    - `README.md`、`README.en.md`、`skills/kefu/README.md`、`CHANGELOG_COUPLE_PHOTO_ORCHESTRATOR.md`、`TEST-REPORT.md`、`UPGRADE-NOTES.md`、`PACKAGE-MANIFEST.md`、`CURRENT_VERSION.md`，以及 `docs/assets/readme/` 下 7 张 README 演示图
    - `CORE_REQUIREMENTS.md` 不单独成页：它是规则真身，规则并进入口和各 reference；「维护规则」一节（先改需求再改 Skill、三处版本号同步、示例图统一 WebP）和 Release Builder 一条是上游自己的维护流程，没收
    - paishe 的 `generation-brief.yaml`、`main-visual-review.yaml`：旧版「先出一张主视觉图、确认后再出 Shot List」路线的产物，现行脚本不再写，只有 `validate_project.py` 的旧工程校验还认
    - 版本号叙事：各页按版本追加的「2.24.20 妆发 Hard Gate」「2.24.21 执行链路 Hard Gates」这类小节和模板尾部的「2.24.21: …」注释，规矩并进对应位置；frontmatter 的 `version`、`language`
    - zongkong 的「旧工程兼容」一节和 `shot_board.py compose`（旧的 8 张单图拼板）：脚本照旧兼容，文档只在交接文件页提一句旧双人字段
- **翻译之外的改动**：
    - **重组**：两份 `SKILL.md` 和 `CORE_REQUIREMENTS.md` → [入口](../../skills/photo-shoot/index.md)加 7 篇 reference；zongkong 的 `quality-contract.md` 拆成[质量下限](../../skills/photo-shoot/reference/quality-contract.md)和[地点](../../skills/photo-shoot/reference/location.md)两篇，kefu 正文里的地点规则和 `global-landmark-fallback.md` 并进地点那篇；`identity-reference-policy.md` 和 CORE 里三节真人身份规则、paishe 的 Identity Lock v2 并成[真人身份参考](../../skills/photo-shoot/reference/identity-reference.md)；`few-shot-hard-gate.md` 并进[时空方向](../../skills/photo-shoot/requirements/reference/directions.md#few-shot)；发送前检查单单独成页；[出图](../../skills/photo-shoot/reference/image-generation.md)是新写的
    - **子 skill 目录**：kefu → `requirements/`，hairstyle → `hairstyle.md`，makeup → `makeup.md`，meihua → `beauty-prep.md`，huanzhuang → `wardrobe/`，paishe → `shooting/`。发型师、化妆师的模板只是输出字段清单，并进各自页面；美化的两个模板是 prompt，并成美化页里的两段；kefu 的 `requirement-field-guide.md` 和正文重复，并进需求页，`confirmation-sheet.md`、`couple-look-plan.md`、`look-plan.md` 合成[完整 Look](../../skills/photo-shoot/requirements/reference/look-plan.md)，7 个示例合成一页；paishe 的 `qinglv.txt`、`hunsha.txt`、`qunxiang.txt` 各成一页骨架，4 个文档模板和放大 brief 合成 [Shot List](../../skills/photo-shoot/shooting/reference/shot-list.md)
    - **生图换成 agent-io**：上游默认宿主自带生图工具（ChatGPT 的 image generation），参考图靠会话里的附图引用。改成 [生成、编辑图片](../../skills/agent-io/reference/image.md) 的 gpt-image-2.5：没真人照片走生成接口，有真人照片走编辑接口，身份原图在前、构图参考在后放进 `images[]`，prompt 开头写明每张图的用途；宫格请求的 `size` 用户没指定写 `"1:1"`（上游不给整板比例，接口要写 `size`）；放大单张竖幅 `"4:5"`、横幅 `"3:2"`，照 `shot_board.py` 的 orientation。**多张参考图的顺序约定没实测过**
    - **几处冲突按 10-04 统一**：回 A/B/C 就是授权出图，不先输出完整方案，`quality-contract.md` F 节和 CORE 第 11 节「自主模式实际生图仍需用户明确提出」作废；方向卡用 `text` 代码块，不再用加粗字段；原创虚构世界只在用户要求时进抽卡池（kefu 5.5 节的旧版放在默认池里）；纯男性项目不加白皙柔焦，但化妆师照走（zongkong 写「默认不加」，CORE 写「不跳过」，两句说的是两件事）
    - **示例 01–04 改写**：原来的「推荐回复」是让用户在 A–E 几种子风格里选一题，和现行规矩冲突（字母只给方向卡用、首轮直接出 A/B/C、不做问卷），改成把分叉拉开到三张方向卡里，解析要点照留；Cosplay 例保留「没给 IP 要问」
    - **few-shot 排除集写明范围**：示例页、地点页和联想页里的示范锚点、分享卡的例句。上游的地点谱系和示例同时出现巴黎圣日耳曼、京都东山八坂塔，没说怎么办，这里按 few-shot 处理
    - **枚举值对齐脚本**：交接文件的 `confirmation_source` 用 `direction_selected` / `ai_auto_confirmed`，kefu 正文写的 `direction_selection` 不在 `validate_project.py` 的白名单里；概念化私人室内只用 `conceptual_private_interior`，`quality-contract.md` 里另外两种写法脚本不认；放大 brief 的 `aspect_ratio` 写 `4:5`，上游模板的 `3:4` 和脚本实际写的对不上
    - **按代码写的**：上游文档说 `register-grid`「只叠加准确数字编号」，代码在自由布局下只登记、不叠编号
    - **占位**：三份出图骨架的 `{…}` 改成填空输入框，选项列表放进 placeholder 当「比如」，群像的逐人描述和逐人调度用多行框；其余模板是给 AI 填的输出格式，留在代码块里，占位字段名译成中文；交接文件、Shot JSON、分享卡 JSON 的键名和枚举值保持英文（脚本按它们解析），注释和自由文本译成中文
    - **复刻提示词**：分享卡的调用句前缀 `@couple-photo-orchestrator` 改成 `@写真拍摄企划`，脚本同改
    - **frontmatter**：各页 `name` 改成中文能力名，`description` 改写成什么时候用、用了做什么；入口开头补领域建模，页尾加维护记录链接
    - **2026-10-19 在临时目录端到端跑过工程模式**：建工程 → 建主题 → 用译后的交接文件模板填一对情侣 → 校验 → `shot_board.py create` → `share_card.py` → `prepare-grid`（没编分享文案时被拦，编完放行）→ `register-grid` → `select` → `complete`，每步校验 VALID；换装的 create → prepare-grid → register-grid → select 也跑通。跑出两件上游文档没写的事，写进了页面：手动把主题 `stage` 改成 `LOOKS_CONFIRMED` 后要跑 `theme_manager.py switch` 同步主题登记，否则校验报 out of sync；`wardrobe_board.py select` 整个重写交接文件，`identity_map` 和几项策略要补回去
    - 部署时整个目录打成 `photo-shoot.tar.gz`，声明写在入口首段

## 脚本 { #scripts }

9 个脚本随附，只在用户要求保存工程时用，依赖 PyYAML 和 Pillow（文件头不改，文档写 `uv run --with pyyaml --with pillow`）：

| 位置 | 脚本 | 上游位置 | 改动 |
|---|---|---|---|
| 入口 `scripts/` | `init_project.py`、`theme_manager.py`、`theme_workspace.py`、`validate_project.py`、`identity_reference_manager.py`、`remix_dependencies.py` | `skills/zongkong/scripts/` | 原样 |
| `wardrobe/scripts/` | `wardrobe_board.py` | `skills/huanzhuang/scripts/` | 第 18 行 `THEME_SCRIPT_DIR` 从 `parents[2] / "zongkong" / "scripts"` 改成 `parents[2] / "scripts"` |
| `shooting/scripts/` | `shot_board.py` | `skills/paishe/scripts/` | 同上 |
| `shooting/scripts/` | `share_card.py` | `skills/paishe/scripts/` | 第 25–26 行复刻提示词的前缀校验改成 `@写真拍摄企划` |

- `shot_board.py`、`wardrobe_board.py` 跨目录 import 入口的 `theme_workspace.py`，所以整包是整个 `photo-shoot/`
- 脚本拼出来的出图 prompt 里还写着上游子 skill 名 meihua，对出图没影响，没改

## 上游更新 { #upstream-update }

只由人来做，AI 不要执行。

1. `git clone --depth 1` 拿上游新 commit，和 `2a25a07` 比对 `skills/couple-photo-orchestrator/`
2. 脚本有变化直接覆盖，再改回上表那三行
3. `.md`、`.txt`、`.yaml` 有变化的，按上面的重组对应关系找到这边的页面重写；新冒出来的版本号小节照旧并进对应位置
4. 上游增删了文件：同步 `mkdocs.yml` 的 nav 和所属入口的 reference 列表
5. 更新本页的 commit、日期和脚注里的永链

[^repo]: [yang0/handraw-style @ 2a25a07](https://github.com/yang0/handraw-style/tree/2a25a079a21845fa20dabc6bb2ad53a244a46584)，2026-10-19 读；本 skill 取自其中的 `skills/couple-photo-orchestrator/`。
[^license]: [handraw-style 的 LICENSE @ 2a25a07](https://github.com/yang0/handraw-style/blob/2a25a079a21845fa20dabc6bb2ad53a244a46584/LICENSE)，MIT License (with Attribution Requirement)，2026-10-19 读。
