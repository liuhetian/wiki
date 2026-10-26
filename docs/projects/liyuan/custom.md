---
description: "梨园里谁来定制、能改到哪：system 由 SYSTEM.md、全局和卡级 APPEND_SYSTEM.md、卡的 AGENTS.md 几层文件拼成，文件是正本、界面是可开关的条目；酒馆预设由旁路模型贴标签分流；模型自己切进工作模式改卡；沙箱在每次工具调用前判定。每一步给出拼接模版和实跑效果"
---

<figure markdown>
  ![system prompt 由 SYSTEM.md、全局 APPEND_SYSTEM.md、卡级 APPEND_SYSTEM.md、卡的 AGENTS.md 四层拼成；酒馆预设被拆开分流，思考、草稿、输出格式、记账几类停用](assets/prompt-layers-infographic.webp)
</figure>

# 谁来定制，能改到哪

网页版 ChatGPT 能定制的只有一段 system prompt，大家改的是同一段文字。梨园要回答两件事：提示词谁写哪一层、酒馆的预设放到哪；以及模型帮忙改卡时，手能伸到哪。下面每一步都给出梨园源码里的拼接模版，和同一段代码真跑出来的效果。

## 提示词分几层，各有主人 { #layers }

**问题**：引擎规则、角色设定、用户自己的规矩混在一段 prompt 里，改一处坏一片。

system 分两半拼。前一半是 pi 自己的：有 `SYSTEM.md` 就整份当底座，后面接一行工作目录：

```ts title="模版 · packages/coding-agent/src/core/system-prompt.ts:46-71"
--8<-- "projects/liyuan/assets/liyuan-src/packages/coding-agent/src/core/system-prompt.ts:46:71"
```

后一半是梨园的，由扩展钩子接在后面（见[正文怎么产出](prose.md#beat)）。几层文件按固定顺序排：预设段、全局和卡级 `APPEND_SYSTEM.md`、卡的 `AGENTS.md`——没有 `AGENTS.md` 就从卡的字段现拼：

```ts title="模版 · src/stage/assemble.ts:313-335"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:313:335"
```

再往后是用户扮演谁、常驻世界书、消息流约定，模版全文见文末。实跑拼出来的 system 共 2040 字：

```markdown title="效果 · 实跑的完整 system"
--8<-- "projects/liyuan/assets/sim/txt/system.txt"
```

对着行号看各层的主人：

- **第 1–3 行，`SYSTEM.md` 加工作目录**：一句环境说明，告诉模型脚下是一张卡的工作区。缺了就退回随包的版本，每轮告警
- **第 6–46 行，全局 `APPEND_SYSTEM.md`**：扮演定义，讲一轮怎么算结束、稿纸、先查再写、岔口交给用户。它是可改的默认值，用户想换口吻改这一个文件
- **卡级 `APPEND_SYSTEM.md`**：这张卡的身份设定，预设里的身份、破限落在这。默认卡没有，所以这里空着
- **第 48–57 行，卡的人设**：默认卡没有 `AGENTS.md`，这一段是从卡的字段现拼的；有 `AGENTS.md` 就整份照用，它是这张卡的世界规则，预设里的写作规则落在这
- **第 58–71 行，数据和约定**：用户扮演谁、常驻世界书、各种【】块是什么意思

梨园不带默认预设。实测一段「用户主权」的硬边界，让同卡同输入两轮分别有 47%、39% 的思考耗在跟它谈判上；没有预设，就是真的没有预设。

## 文件是正本，界面是开关 { #entries }

**问题**：用户想临时关掉某条规矩，又不想删掉它。

界面上把文件里每个 `## 标题` 显示成一条可开关的条目。关掉的条目在文件里包进 HTML 注释，送给模型前剥掉：

```ts title="模版 · src/prompt-entries.ts:126-135"
--8<-- "projects/liyuan/assets/liyuan-src/src/prompt-entries.ts:126:135"
```

拿一份三条、关了一条的 `AGENTS.md` 过一遍：

<div class="grid" markdown>

```markdown title="输入 · AGENTS.md 原文"
--8<-- "projects/liyuan/assets/sim/sample-agents.md"
```

```markdown title="效果 · 送给模型的文本"
--8<-- "projects/liyuan/assets/sim/txt/render.txt"
```

</div>

关着的「每轮附带状态栏」整条没了，开着的两条原样送出。文件始终是正本，开关只是改一对注释符号。

## 酒馆预设：旁路模型贴标签，再分流 { #declare }

**问题**：酒馆的预设是为「一次生成」写的——规定思考至少 3500 token、末尾预填半句话、要求每轮输出变量补丁。梨园有原生思考、工具循环和场记，这些段落原样拼进来就互相打架。实测同卡同输入同模型，带整份预设的思考量是剥离后的 11.2 倍，思考里 `injection` 出现 25 次——模型把历史之后的预设段判成了恶意注入。

梨园先按酒馆的顺序编译一遍预设，关着的块跳过，末尾预填块丢弃；再让旁路模型给每段贴一个站点标签，七个站点各有去向：

```ts title="模版 · src/preset-declare.ts:26-34"
--8<-- "projects/liyuan/assets/liyuan-src/src/preset-declare.ts:26:34"
```

??? abstract "模版 · src/preset-declare.ts:87-135（贴标签的 prompt）"

    ```ts
    --8<-- "projects/liyuan/assets/liyuan-src/src/preset-declare.ts:87:135"
    ```

实跑写了一份八段的演示预设，破限、文风、包装、思考模板、状态栏、剧情备忘、预填各一段：

??? abstract "输入 · 演示预设"

    ```json
    --8<-- "projects/liyuan/assets/sim/sample-preset.json"
    ```

编译后剩六段——历史占位和末尾的预填都不在里面——拼成这样交给旁路模型：

??? abstract "效果 · 贴标签的完整 prompt"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/declare-prompt.txt"
    ```

```json title="效果 · 旁路模型的标签"
--8<-- "projects/liyuan/assets/sim/txt/declare-raw.json"
```

按标签分流：`identity` 写进卡级 `APPEND_SYSTEM.md`，`writing` 写进 `AGENTS.md`，思考、草稿、输出、记账四类也写进 `AGENTS.md`，但写成关掉的条目，`wrapper` 跳过：

```ts title="模版 · src/preset-declare.ts:349-372"
--8<-- "projects/liyuan/assets/liyuan-src/src/preset-declare.ts:349:372"
```

<div class="grid" markdown>

```markdown title="效果 · 写进卡级 APPEND_SYSTEM.md"
--8<-- "projects/liyuan/assets/sim/txt/declare-append.txt"
```

```markdown title="效果 · 写进 AGENTS.md"
--8<-- "projects/liyuan/assets/sim/txt/declare-agents.txt"
```

</div>

思考模板、状态栏、剧情备忘都在，只是关着——用户觉得分错了，在界面上打开就行。预设原 JSON 一个字不改；声明结果按每段内容的哈希存成一份全局文件，所有卡共用，换卡不用重新调模型。

## 工作模式：模型自己切进去改卡 { #work-mode }

<figure markdown>
  ![角色卡工坊：左边是剧情推演，右边是创作大纲十个板块和世界书条目编辑器](assets/card-studio.webp)
  <figcaption>角色卡工坊和剧情推演并排，工作模式下 agent 改的就是这些资源</figcaption>
</figure>

**问题**：用户想让 AI 帮忙改卡、写卡里的前端脚本，但扮演中的对话不能混进剧情。

扮演时常驻一个切换工具，模型判断用户要改卡，就自己切进工作模式，换掉工具和 system：

```ts title="模版 · src/stage/authoring.ts:7-11"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/authoring.ts:7:11"
```

这期间的对话带着「写卡维护」标签留在记录里，不进剧情、场记和记忆。改卡也有工程：卡展开到 `创作/`，人设字段、开场白、世界书条目、正则、脚本每个槽位一个文件；写回只改和原值不同的槽位，脚本先查语法、不执行（`src/card-authoring.ts`）。实跑没进工作模式。

## 沙箱：每次调用工具前判一次 { #sandbox }

<figure markdown>
  ![改卡时的权限分区：卡目录随便读写，公共库写要申请，其他位置都要申请，同卡别的子项目和会话是禁区，bash 另有黑名单和免问前缀，素材有快照兜底](assets/sandbox-zones-infographic.webp)
</figure>

**问题**：模型拿到读写文件、跑 bash 的工具后，可能改到卡以外的地方。

判定是工具调用钩子里的一个纯函数。bash 先过黑名单，再看每一段命令是否都命中免问前缀；文件按路径分区：

```ts title="模版 · src/sandbox.ts:202-230"
--8<-- "projects/liyuan/assets/liyuan-src/src/sandbox.ts:202:230"
```

拿十次调用过一遍：

```text title="效果 · sandboxVerdict 的十次判定"
--8<-- "projects/liyuan/assets/sim/txt/sandbox.txt"
```

- **卡目录随便写，公共库能读、写要申请**：前三条。申请按目录给，不按单个文件
- **同卡别的项目、梨园自己管的数据是禁区**：第四、五条，读都不许
- **bash 逐段匹配**：`cd cards && rm -rf 青梧` 开头是免问的 `cd`，但第二段不在前缀表里，照样要问——防的就是 `cd x && 任意命令` 被 `cd` 一把带走
- **黑名单拦死**：`rm -rf /` 直接拒绝。黑名单自认「防手滑，不防蓄意绕过」：`python cleanup.py` 只能问，脚本里删什么它看不见

申请时 agent 循环停在钩子里，弹选择卡等用户点：允许一次、本会话允许、永久允许（本卡）、拒绝。本会话的授权存在会话树上、随分支走，永久的写进 `卡.json`。没有 OS 级隔离，设计文档认下这个代价：「批了 bash 就是批了整台机器的 shell」。兜底的是素材快照：世界书、预设、人设、技能库按内容寻址存快照，启动时、每 10 分钟、每次写操作之后各存一次，留最近 50 个——起因是一个 `python cleanup.py` 删掉了 60 多本世界书（`src/asset-vault.ts:4`）。

## 谁管什么 { #split }

- **程序**：拼 system、剥关掉的条目、编译预设、按标签分流、沙箱判定、黑名单、快照
- **模型**：给预设每段贴标签，判断什么时候切进工作模式，改卡改成什么样
- **用户**：改各层提示词文件、拨条目开关、改分错的标签、批越界申请、编辑黑名单和免问前缀

## 实跑原件 { #sim-files }

??? abstract "模版 · src/stage/assemble.ts:294-394（梨园那一半 system 的全部拼法）"

    ```ts
    --8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:294:394"
    ```

??? abstract "预设声明：编译出的分段、prompt、标签、分流结果"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/declare.json"
    ```

??? abstract "沙箱：十次调用的输入和判定"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/lab-sandbox.json"
    ```
