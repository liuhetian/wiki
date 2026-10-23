---
description: "酒馆拆解的维护记录：读的是 SillyTavern/SillyTavern 的 06bde93（1.19.0，2026-10-20 读），AGPL-3.0 许可；源码存档和行号；细讲页的效果块怎么实跑出来的：Node 加载钩子原样加载酒馆前端模块、只把界面依赖换成桩，模型请求由另一个进程发；脚本附后"
---

# 酒馆拆解的维护记录

这是[酒馆 SillyTavern](../../projects/sillytavern/index.md)背后的事。正常阅读不用看，要对照上游更新、核对出处、重跑实验时再看。

## 版本和素材 { #sources }

- **上游**：[SillyTavern/SillyTavern](https://github.com/SillyTavern/SillyTavern)，AGPL-3.0 许可，许可全文随源码存档；文档仓库 [SillyTavern/SillyTavern-Docs](https://github.com/SillyTavern/SillyTavern-Docs) 只当线索读
- **读的版本**：`release` 分支 `06bde93`（1.19.0，2026-09-14 提交），2026-10-20 读；文档仓库 `ed5423d`。各页不逐处标版本，上游更新了再对照这一个点
- **源码存档**：`assets/st-src/` 是这个版本里细讲页引到的文件，逐字未改，目录结构和原仓库一致，行号按存档算
- **素材**：随包的角色卡 Seraphina（`default/content/` 下的 PNG）和世界书 Eldoria，本站手译成中文（塞拉菲娜、埃尔多利亚），结构、宏、字段、关键词数量一概不动；酒馆自带的英文提示词（主提示、末尾指令、群聊提示、摘要指令等）保持原文。世界书原件在 `assets/st-src/default/content/Eldoria.json`，从卡里读出的英文 JSON 和两份译本在 `assets/sim/material/`

## 实验设置 { #sim }

细讲页里标着「效果」的块，来自 2026-10-20 的一次实跑，材料在 `assets/sim/`：

- **怎么跑的**：没起酒馆，在 Node 里用加载钩子原样加载酒馆的前端模块：世界书、Prompt Manager、`openai.js`、作者注释、宏引擎、正则引擎、instruct、`bookmarks.js` 等 33 个（清单见 `harness/real.txt`），`src/prompt-converters.js` 和服务端组 DeepSeek 请求的那段也原样调用。其余模块换成桩，桩的导出名按全仓库实际 import 了哪些名字自动生成
- **`script.js` 和 `group-chats.js`**：这两个文件一加载就要整个前端，不能直接 import。`make-stubs.mjs` 按名字把用得到的五十来个函数原样切出来（`getCharacterCardFields`、`cleanUpMessage`、`saveChat`、`syncMesToSwipe`、群聊调度等），拼成替身模块，函数体一字不改，切出的范围写在生成文件的头注释里；只有渲染消息、图片附件这类纯界面函数换成空函数
- **胶水**：`lib.mjs` 照 `Generate()` 在 Chat Completion 路径上的顺序依次调这些函数，只有调用顺序是写的，拼接、筛选、预算、清洗都是酒馆的原函数。界面上的 swipe、群聊的逐个生成、摘要扩展的手动触发，各照原函数对数据做的几步改，脚本注释里写了对应的行号
- **桩被碰到的地方**：主线跑完统计过（`out/main-stub-hits.json`），只有斜杠命令注册、DOM 查询、`getPresetManager` 三类，拼 prompt 的路径没碰到桩。`getPresetManager` 返回空，等于预设没带正则脚本，和出厂一致
- **token 计数**：前端本来发给服务端数，这里在同一进程里用酒馆服务端同款的 DeepSeek 分词器数
- **设置**：新装酒馆的出厂设置，只在连接面板上改了三项：来源 DeepSeek、模型 `deepseek-flash`、关流式。出厂上下文 4095、回复 300、温度 1、世界书深度 2、预算 25%、递归开，取自 `default/content/settings.json`
- **改过出厂设置的地方**：摘要来源从已废弃的 Extras 切到主模型；第二次摘要把「覆盖回复长度」调到 1024。其余实验里调过的设置（作者注释、角色笔记、深度注入、Join、正则脚本、Text Completion 的 ChatML）都在页面上注明了
- **模型调用**：酒馆服务端会把请求发到 `https://api.deepseek.com/beta/chat/completions`，脚本只把域名换成本站的 DeepSeek 中转，路径和请求体一字不改
- **构造的输入**：第二个角色洛恩、完整字段版塞拉菲娜（原卡只有描述和开场白，示范对话拆到自己的字段，补了性格、场景、卡内 system prompt、末尾指令、备选开场白、角色笔记）、世界书各项实验的条目、状态栏消息、文件头里的好感变量、监听器插的那条 system，页面上都注明了
- **随机数**：群聊调度和开场白用固定种子；第一轮群聊的种子 `group-r1-1` 是挑过的，为了让两人都开口。`{{random}}` 用的是酒馆自带的熵源，重跑结果会变；`{{pick}}` 以聊天 ID 为种子，可复现
- **跑了什么**：扮演主线五轮，含一次 swipe、两次 continue、一次 impersonate；摘要两次（出厂、1024）；群聊两轮三次生成；其余实验不调模型
- **用量**：主线 12 次调用共 24488 输入 token，其中 20224 命中前缀缓存，输出 3294；群聊 3 次共 1938 输入、493 输出。主线用量表里第 10 条是摘要脚本改版前多跑的一次出厂摘要，输出已被后两次覆盖，只留了用量
- **隔离**：酒馆的代码只在一个没有 API key 的 Node 进程里跑（启动时环境变量里带 KEY、TOKEN、SECRET 的全部去掉），模型请求由另一个 Python 进程发

重跑：把上游克隆到本地，`ST_ROOT` 指过去，在 `harness/` 里装好 `package.json` 的依赖，跑 `run_all.sh`，再跑 `pack.py` 生成页面上的效果块。脚本里的输出目录是本机路径，换机器要改。

## 实跑脚本 { #scripts }

??? abstract "hooks.mjs：加载钩子，指定模块原样加载，其余换桩"

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/hooks.mjs"
    ```

??? abstract "make-stubs.mjs：从 script.js、group-chats.js 按名字原样切函数"

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/make-stubs.mjs"
    ```

??? abstract "extract.mjs：按名字切出函数声明的扫描器"

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/extract.mjs"
    ```

??? abstract "lib.mjs：按 Generate() 的顺序调酒馆函数"

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/lib.mjs"
    ```

??? abstract "stlab.py：主控，启动无密钥的 Node 进程，模型请求在这里发"

    ```python
    --8<-- "projects/sillytavern/assets/sim/harness/stlab.py"
    ```

??? abstract "run_main.py、run_memory.py、run_group.py：扮演主线、摘要、群聊"

    ```python
    --8<-- "projects/sillytavern/assets/sim/harness/run_main.py"
    ```

    ```python
    --8<-- "projects/sillytavern/assets/sim/harness/run_memory.py"
    ```

    ```python
    --8<-- "projects/sillytavern/assets/sim/harness/run_group.py"
    ```

??? abstract "不调模型的六组实验"

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_lorebook.mjs"
    ```

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_card_assembly.mjs"
    ```

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_adapt.mjs"
    ```

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_branch.mjs"
    ```

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_group.mjs"
    ```

    ```js
    --8<-- "projects/sillytavern/assets/sim/harness/exp_rules.mjs"
    ```

其余文件（`shims.mjs`、`server.mjs`、手写的桩、`translate.py`、`pack.py`、`run_all.sh`）在 `assets/sim/harness/` 里，不展开。
