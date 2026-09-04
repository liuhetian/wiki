---
description: "一次真实调研的完整执行规格：环境锚点、分几批派子代理、每批产出什么"
---

# SillyTavern Chat Completion Prompt 工程能力普查 —— 执行规格

> 本文是 `goal_raw.md`（想要什么）与 `goal-参考.md`（怎么做不跑偏）的合并定稿。
> 相对 `goal-参考.md` 的实质变更：**基准分支改为 staging**，随之重测了全部行号。
> 定稿时间：2026-08-25

!!! info "这是一次真实调研的规格存档，不是本仓库的操作指南"

    2026-08-25 在另一台机器上跑的那次 SillyTavern 调研，用的就是下面这份规格，**原样照录**。
    因此里面的 `/home/boniu/SillyTavern`、`/home/boniu/zensical`、`zensical.toml` 的 nav、
    `docs/exploration/sillytavern/` 全都是当时那台机器的位置，在本 wiki 里一个都不存在
    （本仓库的配置叫 `mkdocs.yml`）。要复用请只抄结构，路径按自己的环境换。

    留着它是因为它示范了一份派给 AI 的调研规格该写到什么颗粒度：**基准 commit 钉死**、
    范围门禁写成硬规则、派工单一条条列清、验收标准要能真跑。这几件事换个仓库照样成立。

**这份规格里有什么**

- [0. 环境锚点](#0)：基准 commit、worktree 怎么开、每次会话的开工校验
- [1. 目标与非目标](#1) · [2. 范围门禁（三条硬规则）](#2)：怎么把范围收窄到不跑偏
- [3. 与既有产出的关系](#3) · [4. 产出结构](#4)：新写的东西往哪放、和已有文档怎么衔接
- [5. 派工单](#5)：分批派给子代理的具体任务，全文最长的一节
- [6. 验收标准](#6) · [7. 源码覆盖率账本](#7-coveragemd)：怎么判断「查完了」而不是「查累了」
- [8. 写作规范](#8) · [9. 并行纪律](#9)：多个子代理同时写，哪些文件只许主控动
- [10. 收尾校验](#10) · [11. 执行阶段](#11) · [12. 已定事项](#12)

---

## 0. 环境锚点

| 项 | 值 |
|---|---|
| 源码仓库 | `/home/boniu/SillyTavern` |
| **基准分支** | **`staging`**（测试分支） |
| 基准 commit | `98af17a8a` — `1.17.0-179-g98af17a8a`（2026-08-21） |
| 当前工作区 | 在 `release`（`8172dcd0e`），**落后 staging 73 个 commit** |
| 文档仓库 | `/home/boniu/zensical` |
| 文档目录 | `/home/boniu/zensical/docs/exploration/sillytavern/`（复用既有目录） |
| 站点生成器 | zensical（非 mkdocs 本体，用 Material for MkDocs 的扩展集） |
| 导航配置 | `zensical.toml` 的 `nav` 数组（手工维护） |
| 代码根 | `public/scripts/` 与 `public/script.js`（`src/` 是服务端，本次基本不涉及） |

### 前置动作（必做）

当前工作区在 `release`，**不能直接在上面调研**。建议开独立 worktree，避免动现有工作区：

```bash
cd /home/boniu/SillyTavern
git worktree add --detach ../ST-staging 98af17a8a   # 全部调研在 ../ST-staging 里进行
```

用 `--detach` 钉死在 commit 而非跟踪 `staging` 分支：**版本已冻结**，即使误 fetch/pull
也不会漂移。

### 开工校验（每次会话第一件事）

```bash
cd <调研目录> && git rev-parse --short HEAD             # 必须是 98af17a8a
ls public/scripts/openai.js public/scripts/world-info.js
grep -c 'prompt-features' /home/boniu/zensical/zensical.toml   # nav 是否已登记
```

> 为什么要有这段：本项目行号引用极多，**没有 commit 锚点的行号引用等于没有引用**。
> 基准已冻结在 `98af17a8a`，全程不 pull。若某次校验发现 HEAD 不是它，说明有人动过，
> 先查清再继续——不要在漂移的基准上接着写。

---

## 1. 目标与非目标

### 目标

产出**按功能分类的 Prompt 工程参考手册**，覆盖 CC 模式下所有可影响最终 prompt 的能力。
每个能力必须回答四个问题：

1. **是什么** —— 这个字段 / 开关 / 机制做什么
2. **在哪实现** —— `file:line` 锚定真实代码
3. **怎么进 prompt** —— 在组装管线的哪一步、以什么形式出现在 `messages[]` 里
4. **怎么用才有效** —— 什么场景调什么值、为什么、有什么副作用
5. **长什么样** —— 一个最小案例，**给出拼接前后的实际对照**

**第 4、5 点是本项目的核心价值**，也是最容易退化成"字段罗列"而丢掉的部分。
**缺 4 或缺 5 的章节视为未完成。** 案例规范见第 8 节。

### 非目标（明确排除）

- **Text Completion / Instruct 模式**：不写。`instruct-mode.js`、context templates、
  `instruct-macros.js` 只在"与 CC 的差异"处一句话带过
- 后端 provider 适配细节（Bedrock/Vertex/各家 max_context 表）：只写"存在按 provider
  差异化的上限机制"，不逐家列举
- 纯 UI 交互实现（拖拽排序、弹窗、i18n）。字段的**语义与取值范围**要写，DOM 绑定不写
- 不注入 prompt 的扩展（TTS、图片生成、翻译等）

---

## 2. 范围门禁（三条硬规则）

### 规则一：`main_api` 门控检查

staging 上 `public/script.js` 有 **21 处** `main_api === 'openai'` / `!== 'openai'` 分支。
大量 TC 专属能力（instruct 分隔符拼接、context template 的 `story_string`、
`sysprompt.enabled`）**在 UI 上可见可配，但被门控掉，对 CC 无效**。

**任何功能点写入前，必须 grep 它是否被 `main_api` 门控。** 是 → 标注"CC 下不生效"或排除。
不得因为 UI 上可见就当作有效能力。

> 已知实例：`llm/12-back-to-sillytavern.md` 已记录过这个坑（选了 ChatML 模板却没效果）。

### 规则二：证据等级

必须读代码。现有文档（官方文档、README、代码注释）仅作线索，不作结论。

| 等级 | 来源 |
|---|---|
| 一手 | 源码实现 |
| 一手 | `tests/` 单元测试 / e2e |
| 二手 | JSDoc / 类型注解 |
| 线索 | 代码注释、CLAUDE.md、官方文档 |

只有线索层支撑而 grep 不到实现 → 标 `unverified`，附待查 grep 命令，**不删条目**。

### 规则三：三态判定

区分"确认无此功能" / "确认有" / **"没查成"**。
agent 挂掉、grep 超时、文件读不完 = 基础设施失败，**不得记为研究结论**，必须重派。

---

## 3. 与既有产出的关系（已定）

现状：`docs/exploration/sillytavern/prompt-pipeline.md` 已存在 619 行，覆盖了世界书条目结构、
深度注入、上下文丢弃顺序、群聊、正则、reasoning，且有整节讲 TC。
`prompt-features/` 目录已建但为空，nav 未登记。

**方案：复用既有目录，新系列独立重新写作。**

- `prompt-pipeline.md` **仅作参考资料**，不迁移、不改造、不剥离其 TC 章节、不做双向交叉引用。
  按第 2 节规则二，它属于**线索层**——可以查它拿线索，**不能拿它当结论**
- `prompt-features/` 是重新写的**按功能分类参考手册**，自成体系，不必迁就它的结构

若新系列与它出现矛盾：**以新系列的源码验证结论为准**（新系列每条都有 `file:line` 锚定且
基准明确）。但矛盾点仍要看一眼——有可能是新系列错了，值得回源码复核一次。

---

## 4. 产出结构

```
docs/exploration/sillytavern/
  index.md                      # 已存在，补入口链接
  prompt-pipeline.md            # 已存在，仅作参考资料，本次不改动
  prompt-features/
    index.md                    # 分类地图 + 各类在一次请求里的出场顺序 + 阅读建议
    01-pipeline.md              # A 组装总管线
    02-prompt-manager.md        # B 提示词条目编排
    03-character-persona.md     # C 角色卡与用户人设
    04-world-info.md            # D 世界书
    05-injection.md             # E 注入系统
    06-macros.md                # F 宏系统
    07-context-budget.md        # G 上下文预算与截断
    08-group-chat.md            # H 群聊
    09-request-shaping.md       # I 生成参数与请求成形
    10-post-processing.md       # J 输出后处理
    99-observability.md         # 附录：怎么看到最终 prompt（兼写作期验证工具）
```

`zensical.toml` nav 登记在 `"Prompt 管线拆解"` 之后：

```toml
{ "Prompt 能力手册" = [
  "exploration/sillytavern/prompt-features/index.md",
  { "组装总管线" = "exploration/sillytavern/prompt-features/01-pipeline.md" },
  ...
] },
```

### 工作文档

放在 `/home/boniu/zensical/_work/prompt-features/`（**`docs/` 之外**，避开
"下划线目录是否被 zensical 编译进站点"这个不确定性）：

| 文件 | 作用 |
|---|---|
| `MAP.md` | 事实层：源码区段清单（文件 → 函数 → 行号范围 → 承载哪个功能）、常量枚举、待核实事实 |
| `ROUTE.md` | 计划层：第 5 节派工单的落地版，含各类验收标准 |
| `STATE.md` | 状态层：环境锚点 + 各篇进度 + 子 agent 结构化摘要 + 未解问题 |
| `COVERAGE.md` | 覆盖率账本（第 7 节） |
| `GLOSSARY.md` | 术语表，**先定后写** |

跨会话续接的唯一入口是 `STATE.md`，新会话第一个动作是读它。

---

## 5. 派工单

**行号已全部按 staging `98af17a8a` 重测。**

> ⚠ 基准从 release 换到 staging 的直接后果：`goal-参考.md` 第 5 节的行号中，
> `openai.js` / `script.js` / `world-info.js` **全部失效**（这三个文件分别 +114 / +62 / +119 行）。
> 下表已重定位。另有 3 个文件有改动但尚未逐符号重测，标 ⚠。
> **12 个文件在两分支上零差异，其行号原样可用**：`PromptManager.js`、`personas.js`、
> `macros.js`、`authors-note.js`、`custom-request.js`、`itemized-prompts.js`、
> `chat-templates.js`、`logit-bias.js`、`regex/{index,engine}.js`、`memory/index.js`、
> `vectors/index.js`。

### A. 组装总管线 → `01-pipeline.md`

`public/scripts/openai.js`（7363）：
`setOpenAIMessages:570`、`setOpenAIMessageExamples:656`、`formatWorldInfo:789`、
`populationInjectionPrompts:810`、`populateChatHistory:885`、`populateDialogueExamples:1101`、
`getPromptPosition:1140`、`getPromptRole:1157`、`populateChatCompletion:1185`、
`preparePromptsForChatCompletion:1367`、`prepareOpenAIMessages:1542`、
`Message:3484`、`MessageCollection:3781`、`ChatCompletion:3890`

`public/script.js`（12599）：`Generate:4290` 的 CC 分支（唯一总入口，必须完整走一遍）

**交付重点**：一张从 `Generate` 到 `messages[]` 的调用序列图，每步标注"此时加入了什么"。

### B. 提示词条目编排 → `02-prompt-manager.md`

`PromptManager.js`（2144，全覆盖，**行号沿用参考文档**）：`Prompt:80`、构造函数字段清单 `:182`
（`position` / `injection_depth` / `injection_position` / `injection_order` /
`injection_trigger` / `forbid_overrides` / `system_prompt`）、`PromptCollection:201`、
`PromptManager:300`、`isPromptDisabledForActiveCharacter:949`、`appendPrompt:961`、
`detachPrompt:975`、`sanitizeServiceSettings:1006`、`getPromptsForCharacter:1196`

`openai.js`：`setupChatCompletionPromptManager:675`

**交付重点**：`injection_position` × `injection_depth` × `injection_order` × `injection_trigger`
的**组合语义矩阵**——酒馆最容易配错的地方。

### C. 角色卡与用户人设 → `03-character-persona.md`

`public/script.js`：`baseChatReplace:3341`、角色深度提示注入 `:4479` `:4485`
`personas.js`（3006，只覆盖注入相关，**行号沿用**）：`persona_description_positions` 枚举、
depth / role / lorebook 关联
`public/script.js`：persona 描述注入 `:3205`
⚠ `power-user.js`（4484，+24）：`prefer_character_prompt`、`prefer_character_jailbreak`、
`persona_description*` —— **行号需重测**

**交付重点**：角色卡各字段（description / personality / scenario / first_mes / mes_example /
depth_prompt / character 级 system & jailbreak override）各自进入哪个 prompt 条目、
override 优先级链。

### D. 世界书 → `04-world-info.md`

`world-info.js`（6408）：
枚举 `world_info_insertion_strategy:27`、`world_info_position:855`、`wi_anchor_position:866`；
全局参数区 `:69-81`（depth / min_activations / budget / include_names / overflow_alert /
character_strategy / budget_cap）；
`WorldInfoBuffer:199`、`WorldInfoTimedEffects:479`、`getWorldInfoPrompt:892`、
`parseDecorators:4652`、`checkWorldInfo:4709`、`filterByInclusionGroups:5388`
`openai.js`：`formatWorldInfo:789`
`public/script.js`：自定义深度/角色注入 `:4671`、outlet 注入 `:4676`

**交付重点**：扫描 → 递归 → 打分 → 分组去重 → 时效(sticky/cooldown/delay) → 预算裁剪 →
按 position 落位 这条完整链路；条目级字段逐个说明（keys / secondary / logic / order /
probability / depth / role / group / scan_depth / recursion 开关 / decorators）。

> 已纠正的误解：**世界书不是按百分比控制插入位置**。`world_info_position:855` 是枚举：
> `before`(↑Char) / `after`(↓Char) / `EMTop` / `EMBottom` / `ANTop` / `ANBottom` /
> `atDepth`(@D，按消息深度倒数第 N 条，可指定 role) / `outlet`（命名出口，`entry.outletName`）。
> 无百分比机制。`outlet` 是原始需求清单里缺失的位置类型。

### E. 注入系统 → `05-injection.md`

`public/script.js`：`extension_prompt_types:484`、`extension_prompt_roles:494`、
`MAX_INJECTION_DEPTH:500`、`getExtensionPromptByName:3257`、`getExtensionPromptMaxDepth:3281`、
`getExtensionPrompt:3301`、`setExtensionPrompt:8926`、`getExtensionPromptRoleByName:8942`
`authors-note.js`（619，全覆盖，**行号沿用**）：position / depth / role / interval / 是否参与 WI 扫描
`openai.js`：`populationInjectionPrompts:810`（深度注入如何折叠进 messages）
注入型扩展（只写注入契约，不写各自算法）：`extensions/memory/index.js`（1131）、
`extensions/vectors/index.js`（2358）

**交付重点**：`setExtensionPrompt` 是全站统一注入总线，要列一张"谁在往里塞东西"的清单。
staging 实测调用方共 8 处：

```
public/script.js                          persona:3205 / AN:3219 / 角色depth:4479,4485
                                          quiet:4623,4636 / WI深度:4671 / WI outlet:4676
public/scripts/authors-note.js            作者注释
public/scripts/world-info.js              世界书 @Depth 条目
public/scripts/slash-commands.js          /inject
public/scripts/st-context.js              扩展公共 API 面
public/scripts/extensions/memory/index.js 摘要
public/scripts/extensions/vectors/index.js 向量检索
public/scripts/extensions/vectors/settings.html
```

同时说明**两个注入落在同一深度时的排序规则**。

### F. 宏系统 → `06-macros.md`

`public/scripts/macros.js`（747，**行号沿用**）+ `macros/`（**6301 行**，18 个文件，全覆盖）：
`engine/`（Lexer 398 / Parser 227 / CstWalker 1376 / Registry 829 / EnvBuilder 211 /
Diagnostics 242 / Flags 228 / Engine 416 / Browser 686 / EnvTypes 68）+
`definitions/`（core 481 / variable 417 / env 205 / time 151 / chat 148 /
instruct 76 / state 57）+ `macro-system.js` 85

`public/script.js`：`substituteParamsExtended:2815`、`substituteParams:2981`、`removeMacros:5860`

**交付重点**：宏的**求值时机**（在管线哪几步各展开一次、为什么 `{{user}}` 会被展开两次）、
完整宏清单按 definitions 分组、变量宏与状态宏的作用域与持久化。

### G. 上下文预算与截断 → `07-context-budget.md`

`openai.js`：`TokenHandler:3393`、`TokenBudgetExceededError:3466`、`getMaxContextOpenAI:5061`、
`ChatCompletion:3890` 的预算与 reserve 机制、`populateChatHistory:885` 的历史截断
`world-info.js`：`world_info_budget` / `world_info_budget_cap` 与 WI 的预算竞争
⚠ `power-user.js`：`max_context_unlocked`、`context_size_derived` —— **行号需重测**

**交付重点**：塞不下时的丢弃优先级；"预留"与"实际占用"的差异如何导致溢出。

### H. 群聊 → `08-group-chat.md`

⚠ `group-chats.js`（2491，+1，**行号需抽验**）：`getGroupDepthPrompts:427`(已验证 OK)、
`generateGroupWrapper`、`activateImpersonate`、`activateSwipe`、`activateListOrder`、
`activatePooledOrder`、`activateNaturalOrder`、`onGroupActivationStrategyInput`、
`onGroupGenerationModeInput`、`onGroupGenerationModeTemplateInput`
`openai.js`：`parseExampleIntoIndividual` 的 `appendNamesForGroup`

**交付重点**：三种激活策略的选人逻辑、group nudge 模板、多角色卡字段如何合并/隔离。

### I. 生成参数与请求成形 → `09-request-shaping.md`

`openai.js`：`getReasoningEffort`、`getVerbosity`、`createGenerationParameters`、
`sendOpenAIRequest`、`calculateLogitBias`、`getChatCompletionModel`、
`setNamesBehaviorControls`、`setContinuePostfixControls`、`setToolReasoningControls`
—— **均需在 staging 上重测行号**
`logit-bias.js`(142)、`custom-request.js`(607)、`chat-templates.js`(198) —— **行号沿用**
⚠ `power-user.js`：`names_behavior`、`continue_on_send`、`single_line` —— **需重测**
`public/script.js`：`getStoppingStrings:3025`、`getBiasStrings:5794`

**交付重点**：`names_behavior` 三种取值如何改变 messages 结构（CC 下最影响效果又最少被理解的
开关）、system 消息合并、continue 的 postfix 处理。

### J. 输出后处理 → `10-post-processing.md`

`openai.js`：`getStreamingReply` —— **需重测**
⚠ `reasoning.js`（1702，+40，全覆盖，**行号需重测**）：思维链的解析、隐藏、是否回灌进下一轮
`extensions/regex/index.js`(2157) + `engine.js`(465) —— 全覆盖，**行号沿用**：
正则脚本的作用阶段（用户输入 / AI 输出 / 进 prompt 前 / 仅显示）
⚠ `power-user.js`：`trim_sentences`、`collapse_newlines`、`single_line` —— **需重测**

**交付重点**：**哪些后处理会影响下一轮的 prompt，哪些只影响显示**——正则脚本最大的坑。

### 附录. 观测 → `99-observability.md`

`itemized-prompts.js`（399，**行号沿用**）：提示词检查面板能看到什么、字段含义

**交付重点**：教读者自己验证本手册每一条结论；同时是写作期的验证工具。

---

## 6. 验收标准（按类）

不是"写完了"，而是能回答具体问题。答不上的回去补。

| 类 | 验收标准 |
|---|---|
| A | 能画出 `Generate` → `messages[]` 的完整序列，并说出任意一条 message 的来源 |
| B | 能解释 `injection_position` × `injection_depth` × `injection_order` 的组合效果，说出条目被禁用的三种途径 |
| C | 能说出角色卡 8 个字段各进入哪个 prompt 条目，以及 character override 何时生效何时被忽略 |
| D | 能完整讲出一个 WI 条目从被扫中到进 prompt 的 7 个环节，并解释递归扫描的终止条件 |
| E | 能列出所有往注入总线塞内容的调用方，说出两个注入落到同一深度时的排序规则 |
| F | 能说出 `{{user}}` 在一次请求里被展开几次、分别在哪一步，以及为什么需要 `removeMacros` |
| G | 能说出上下文超限时的丢弃顺序，以及 WI 预算与历史预算如何互相挤占 |
| H | 能说出三种激活策略各自的选人规则，以及群聊里角色卡字段的合并规则 |
| I | 能说出 `names_behavior` 三种取值下 messages 的结构差异 |
| J | 能判断任意一个正则脚本会不会影响下一轮 prompt |

**外加案例门槛（每类都适用）**：每类至少 1 个综合案例（多功能叠加），
每个影响 `messages[]` 结构或内容的关键功能点至少 1 个最小案例。
纯数值参数（temperature 之类）不要求案例。**没有案例的章节视为未完成。**

---

## 7. 源码覆盖率账本（`COVERAGE.md`）

"严格看完所有代码"只有配上账本才可验证。**需覆盖总量约 55,300 行**（staging）。

| 文件 | 行数 | 覆盖要求 |
|---|---|---|
| `public/script.js` | 12599 | 部分——只覆盖 prompt 相关区段，区段清单必须在 `MAP.md` 显式列出 |
| `public/scripts/openai.js` | 7363 | 全覆盖（CC 核心） |
| `public/scripts/world-info.js` | 6408 | 全覆盖（UI 区段只提取字段语义与取值范围） |
| `public/scripts/macros/**` | 6301 | 全覆盖 |
| `power-user.js` | 4484 | 部分——prompt 相关设置键 |
| `personas.js` | 3006 | 部分——注入相关 |
| `group-chats.js` | 2491 | 全覆盖 |
| `extensions/regex/{index,engine}.js` | 2622 | 全覆盖 |
| `extensions/vectors/index.js` | 2358 | 部分——只看注入契约 |
| `PromptManager.js` | 2144 | 全覆盖 |
| `reasoning.js` | 1702 | 全覆盖 |
| `extensions/memory/index.js` | 1131 | 部分——只看注入契约 |
| `macros.js` | 747 | 全覆盖 |
| `authors-note.js` | 619 | 全覆盖 |
| `custom-request.js` | 607 | 全覆盖 |
| `itemized-prompts.js` | 399 | 全覆盖 |
| `chat-templates.js` | 198 | 全覆盖 |
| `logit-bias.js` | 142 | 全覆盖 |

补充面：`slash-commands.js`（`/inject` 等 prompt 相关命令）、`public/locales/en.json`
（UI 文案反查功能名）。

账本格式：每个"全覆盖"文件按函数/类切行段，标记 `已覆盖(哪篇) / 已读但判定无关 / 未读`。
**收尾时不允许残留"未读"；"判定无关"必须写一句理由。**

> 注意区分：`goal_raw.md` 的"严格看完所有代码"是**阅读要求**，不等于**写作要求**。
> 写作深度以第 6 节验收标准为止，不追求逐行讲解。

---

## 8. 写作规范

既有文档事实标准（实测）：`!!!` ×49（admonition）、`===` ×22（content tabs）、`???` ×14（details）。

`zensical.toml` 已启用：`admonition`、`pymdownx.details`、`pymdownx.tabbed`、
`pymdownx.superfences`（mermaid 走 custom fence）、`pymdownx.highlight`（`anchor_linenums`）、
`pymdownx.snippets`（base_path=`includes`）、`attr_list`、`def_list`、`abbr`、`footnotes`、
`md_in_html`、`pymdownx.keys`、`toc.permalink`。

约定：

1. 每篇开头 `!!! abstract "本篇覆盖"` 列功能清单；结尾 `!!! tip "调参建议"`
2. 代码引用统一 `title="public/scripts/openai.js:1542"` 形式，**行号必须真实**
3. **抗漂移写法（强制）**：引用不能只写行号，必须连该行代码一起贴。本次基准虽已冻结，
   但读者手上的版本未必是 `98af17a8a`；贴了代码，行号对不上时读者仍可 grep 定位
4. 每篇文首标注调研基准 commit
5. 关键流程用 mermaid（superfences custom fence）
6. 需要对比"配置界面 ↔ 实际效果 ↔ 源码位置"时用 content tabs（`===`）
7. 冗长字段表用 `??? note` 折叠，避免正文被表格淹没
8. **只做中文，不出英文版。** 代码与标识符保持原文，术语首次出现给英文原名
9. **术语表先定后写**：`GLOSSARY.md` 固定"条目/entry""深度注入""注入总线"等译法
10. 不用 emoji

### 案例规范（本项目的核心交付形式）

光讲解不够。每个关键功能点都要有一个**最小案例**，展示**拼接前后的实际对照**。

推荐用 content tabs 三段式：

```markdown
=== "配置"

    角色卡 `description` 填入：

    ``` text
    {{char}} 是一名侦探，正在调查 {{user}} 的委托。
    ```

=== "拼接前"

    prompt 条目里的原始形态（宏未展开、尚未落位）

=== "拼接后"

    ``` json
    { "role": "system", "content": "Alice 是一名侦探，正在调查 Bob 的委托。" }
    ```
```

四条要求：

1. **最小化**——一个案例只演示一个开关的影响，不要把五个功能揉在一个案例里
2. **前后对照**——必须能看出这个功能开/关、或取不同值时 `messages[]` 的差异。
   只给"开启后的样子"不算对照
3. **来源分级（强制标注）**：
   - **实测** —— 从提示词检查面板（`itemized-prompts.js`，见附录篇）抓取，
     或用 `tests/util/mock-server.js` 起 OpenAI 兼容假后端截真实请求体
   - **推导** —— 无法实测时，从源码逐步推出，**必须标注"推导"**，不得伪装成实测
4. 每类至少 1 个**综合案例**，展示该类多个功能叠加后的最终形态

> 附录 `99-observability.md` 因此有双重作用：既是教读者自己验证的工具，
> 也是本手册全部"实测"案例的取材途径。**建议先写附录，再写各篇案例。**

---

## 9. 并行纪律

0. **并发上限：单批同时最多 3 个 subagent，全程子 agent 总数控制在 10 个以内。**
   瓶颈不在子 agent 而在主控——共享文件只能主控串行更新（见下条），子 agent 的结构化摘要
   也要主控逐份核验并回写 `MAP.md`/`COVERAGE.md`。并发开大只会在主控处排队，
   还会放大"多个 agent 同时改共享文件"的翻车风险。
1. **子 agent 只写自己那一篇 `.md`，不碰任何共享文件。**
   `zensical.toml`、`STATE.md`、`COVERAGE.md`、`GLOSSARY.md` 全部由主控串行更新
2. 子 agent 返回必须是**结构化摘要**（覆盖了哪些文件行段、发现的字段清单、
   与 `MAP.md` 不符之处、遗留疑问），不是"已完成"
3. **派工必须带绝对路径 + 行号区段**，不让子 agent 自己猜文件在哪
4. 主控不重复读子 agent 已负责的区段。谁读什么在派工时定死
5. 并行分组按依赖，每批 ≤3（批次表见第 11 节）
6. `MAP.md` 的数字标"待核实"，子 agent 发现不符要**回写修正**，不允许各篇写不同数字

---

## 10. 收尾校验（必须真跑，不是清单）

```bash
# 1. 行号引用校验：提取所有 file:line 引用，回源码核对该行存在且内容相符；
#    同时校验 commit 仍为 98af17a8a。输出不匹配清单
# 2. nav 完整性：docs/**/*.md 与 zensical.toml 的 nav 双向 diff，两边都不能有孤儿
# 3. 内链有效性：所有相对链接与锚点（#heading）可解析
# 4. 语法一致性：统计各篇 !!! / ??? / === / mermaid 使用量，
#    找出完全没用 admonition 或没有 mermaid 的篇（可能偷懒）
# 5. 术语一致性：按 GLOSSARY.md 逐条 grep，找混用
# 6. 覆盖率：COVERAGE.md 中不允许残留"未读"
# 7. 内部一致性：同一机制在各篇之间不能有两种矛盾说法（篇间为主；
#    与 prompt-pipeline.md 的差异只作提示，以新系列的源码结论为准）
# 8. 验收自测：第 6 节 10 条逐条在文中找答案，找不到即为未完成
# 9. 案例校验：每篇是否都有综合案例；所有案例是否标了"实测/推导"
# 10. main_api 门禁复查：全文搜 TC 专属能力名，确认都带了"CC 下不生效"标注
```

第 7、8 条可派独立审阅 agent（≤2 个），但**它必须只读、只报告、不直接改**——改动由主控统一执行。
审阅阶段同样适用第 2 节规则三：区分"确认有冲突"和"没查成"。

---

## 11. 执行阶段

| 阶段 | 产出 | 并发 | 说明 |
|---|---|---|---|
| P0 准备 | 冻结 worktree | 0 | `git worktree add --detach ../ST-staging 98af17a8a` |
| P1 侦察 | `MAP.md` / `ROUTE.md` / `STATE.md` / `COVERAGE.md` / `GLOSSARY.md` | 0 | 主控串行，**不派子 agent**。含补测第 5 节标 ⚠ 的行号 |
| P2 先导 | `01-pipeline.md`(A) + `99-observability.md`(附录) | 0 | 主控自己写。A 是其他篇的引用基准；附录是案例取材工具，必须先有 |
| P3 批一 | E 注入 / F 宏 / I 请求成形 | 3 | 都不依赖 B/C/D |
| P4 批二 | B 条目编排 / D 世界书 / J 后处理 | 3 | B、D 依赖 E |
| P5 批三 | C 角色卡 / G 预算 | 2 | C 依赖 B+E；G 依赖 A+D |
| P6 批四 | H 群聊 | 1 | 依赖 A+C |
| P7 收口 | `index.md`、nav 登记 | 0 | 主控串行 |
| P8 校验 | 第 10 节 10 条 | ≤2 | 不通过回到对应阶段 |

子 agent 合计 9 个 + 审阅 ≤2 个。

---

## 12. 已定事项（原未决问题）

| 项 | 结论 |
|---|---|
| 基准分支 | `staging` @ `98af17a8a`，**冻结**，全程不 pull；worktree 用 `--detach` 钉死 |
| 文档目录 | 复用 `docs/exploration/sillytavern/`，新建 `prompt-features/` 子目录 |
| `prompt-pipeline.md` | 仅作参考资料，**不改动**；重新独立写作，矛盾时以新系列源码结论为准 |
| 语言 | **只做中文**，不出英文版 |
| 并发 | 单批 ≤3 个 subagent，全程子 agent ≤10 |
| 案例 | 每个关键功能点必须有拼接前后对照的最小案例，标注实测/推导 |