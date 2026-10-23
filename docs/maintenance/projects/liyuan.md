---
description: "梨园拆解的维护记录：读的是 weidu12123/Liyuan 的 1e9448e（2026-10-19 读），PolyForm Noncommercial 许可；源码存档、行号、截图、配图各从哪来；细讲页的效果块怎么实跑出来的，脚本附后"
---

# 梨园拆解的维护记录

这是[梨园 Liyuan](../../projects/liyuan/index.md)背后的事。正常阅读不用看，要对照上游更新、核对出处、重跑实验时再看。

## 版本和素材 { #sources }

- **上游**：[weidu12123/Liyuan](https://github.com/weidu12123/Liyuan)，PolyForm Noncommercial 1.0.0 许可，许可全文随源码存档
- **读的版本**：`1e9448e`（2026-10-16 提交），2026-10-19 读。各页不逐处标版本，上游更新了再对照这一个点
- **源码存档**：`assets/liyuan-src/` 是这个版本里细讲页引到的那部分文件，逐字未改；`extensions/roleplay.ts` 在原仓库的路径是 `.liyuan/extensions/roleplay.ts`，存档避开了点开头的目录
- **行号**：存档里有的文件按存档算；没存档的（`server/`、`docs/`、`src/memory/`、`src/draft.ts`、`src/card-authoring.ts`、`src/asset-vault.ts` 等）是原仓库根下这个版本的行号
- **截图**：主界面、决策卡、登场名录、角色卡工坊四张取自原仓库的 `docs/images/`；决策卡那张是早期界面
- **配图**：11 张信息图是本站生成的，用了哪些排版和主题色见[配图的维护记录](../skills/infographic.md#liyuan)

## 实验设置 { #sim }

细讲页里标着「效果」的块，来自 2026-10-20 的一次实跑，材料在 `assets/sim/`：

- **拼接是真的**：system、末端注入、关键词扫描、世界书检索、场记 prompt、patch 合并、压缩和复盘的 prompt、预设声明、沙箱判定、检查点，全部直接调梨园源码里的函数，输出原样保存。唯一的例外是收尾合并 `mergeFinalText`：`engine.ts` 整个导入要拉起 MCP 等依赖，就把它和它用到的几个函数原样抠出来单独跑
- **模型是真的**：主演用 `deepseek-v4-pro`、开思考；场记、压缩、复盘、合并、预设声明用 `deepseek-flash`、关思考，经本站的 [agent-io](../../skills/agent-io/reference/deepseek.md) 调用；梨园的 33 个工具说明原样发给模型
- **简化的地方**：工具回执是简版；`ask` 弹出后模拟成用户选第一项；agent 轮的四个文件工具用的是简写的说明，不是 pi 的原文；构造的输入（越界 patch、格式块、手写的另一局复盘、演示预设）在页面上都注明了
- **素材**：随包的默认卡「青梧」，加一本自写的六条演示世界书「栖水镇」
- **跑了什么**：扮演三轮（打听人、要选项、改上一轮），第一轮重新生成一次；压缩一次；跨局记忆复盘、合并、删一局再合并；预设声明一次；agent 模式改两章。主演共调模型 16 次，旁路 8 次
- **用量**：扮演的 13 次主演调用共约 10.6 万输入 token，其中 10.2 万命中前缀缓存，输出约 6700 token；旁路和 agent 轮没记用量
- **收笔即停**：第一次跑时脚本在收笔后没停，又调了几次模型；梨园在这一步就结束本轮，记录按这条规则裁掉了多出来的调用，脚本也已改正
- **隔离**：梨园的代码只在一个没有 API key 的 Node 进程里跑，模型请求由另一个脚本发

## 实跑脚本 { #scripts }

??? abstract "lab.mjs：只调梨园源码里的函数，不发网络请求"

    ```js
    --8<-- "projects/liyuan/assets/sim/lab.mjs"
    ```

??? abstract "tail-merge.ts：从 engine.ts 原样抠出的收尾合并"

    ```ts
    --8<-- "projects/liyuan/assets/sim/tail-merge.ts"
    ```

??? abstract "run2.py：主控，模型调用走 agent-io 的 DeepSeek 中转"

    ```python
    --8<-- "projects/liyuan/assets/sim/run2.py"
    ```
