---
description: "dsh 怎么压上下文：先裁大工具结果再摘要；摘要指令作最后一条 user 消息接在原样回放的前缀后，实跑 95% 命中缓存；检查点 replace 被压的那段；被压掉的注入下一步补发；附几段补丁文本"
---

# 压缩与补丁文本：压的时候也要命中缓存

pi 上下文满了就另起一次摘要调用：换一段专用的 system prompt，把要压的对话转成一段 `<conversation>` 文本塞进 user 消息[^pi]——和刚发出去的那次请求开头对不上，前缀缓存一个 token 也用不上。dsh 把摘要也当成对话的延续来发。下面按一次压缩的顺序讲：什么时候压、先裁再摘、怎么摘、怎么拼回、拼回后补什么，最后是几段特殊时刻的补丁文本。

效果都来自同一次实跑：dsh 自己的 agent 循环、压缩插件、read 工具和 DeepSeek 适配器，模型 `deepseek-flash`，任务是读 dsh 压缩包的源码讲给用户听，工作区里放了一份三行的 AGENTS.md。为了几轮就能触发，压缩阈值从默认的 678,464 token 调到 15,000，其余照 base 组合包的配置。

## 扣掉输出预留和余量，678,464 token 才压 { #when }

**问题**：DeepSeek 的窗口是 100 万 token，但一次请求要给回复预留 256,000——按窗口的 80% 算阈值，看着没满，请求已经塞不下回复。

阈值取两者里小的：窗口 × 0.8，和窗口减输出预留、再减 65,536 的余量。保留不压的最近一段按（窗口 − 输出预留）× 16% 算。每一步开头（`agent/pre-step`）量一次：

```ts title="模版 · packages/compaction/compaction-basic/src/config.ts:191-197"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/config.ts:191:197"
```

用 dsh 的 `resolveConfig` → `resolveTargetPolicy` → `resolveCompactSpec` 算产品默认和实跑配置：

```text title="效果 · 两套配置算出的阈值"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/thresholds.txt"
```

DeepSeek 默认值下 80% 那条不起作用，卡住的是扣完预留和余量的 678,464。另有两个入口不看阈值：provider 报上下文超长时，裁剪后把保留长度设成 0 压一次再重试；用户打 `/compact` 手动压。超长重试这一支没跑，只贴模版：

```ts title="模版 · packages/compaction/compaction-basic/src/index.ts:294-302"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/index.ts:294:302"
```

## 先裁大工具结果，裁完够了就不摘要 { #prune }

**问题**：上下文常常是被几个大工具结果撑满的——一次 read 读进来一万多字符。为这个调一次模型写摘要，又贵又丢细节。

压力一到，先跑不调模型的裁剪：超过 8192 字符的工具结果留头 4096、尾 1024，中间换成一行标记。每次裁剪是一个单节点 replace，原结果留在日志里。裁完再量，低于阈值就不摘要：

```ts title="模版 · packages/compaction/compaction-tool-result-pruner/src/config.ts:6-14"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-tool-result-pruner/src/config.ts:6:14"
```

```ts title="模版 · packages/compaction/compaction-basic/src/index.ts:319-327"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/index.ts:319:327"
```

实跑第二轮读完 `config.ts`，压力第一次过线。三个大结果各裁到 5159 字符，没有摘要：

```text title="效果 · 第一次过线：只裁剪"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/first-pressure.txt"
```

```text title="效果 · seq 30 裁剪后的工具结果，标记前后"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/pruned.txt"
```

刚读进来的文件也会被裁：`config.ts`（seq 27）还没给模型看过就成了头尾。模型看到标记，自己带 offset 重读了一遍：

```text title="效果 · 模型对裁剪标记的反应"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/pruned-reaction.txt"
```

## 摘要指令放在最后一条 user 消息，前缀原样回放 { #summarize }

**问题**：dsh 的决策记录[^summary-cache]写过这个案例：摘要器自带一段 system prompt，后接拍平成字符串的历史，「每次压缩都要为整段回放的历史付出两次完整的提示词处理成本」——恰好发生在对话最大的时候。

摘要请求原样回放上一个请求的 system、tools 和被压的那段消息，只在末尾追加一条 user：压缩指令。tools 也带上——摘要用不到工具，可去掉它们，后面每个 token 都会错位：

```ts title="模版 · packages/compaction/compaction-basic/src/region.ts:544-563"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/region.ts:544:563"
```

```ts title="模版 · packages/compaction/compaction-basic/src/summarizer.ts:144-162"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/summarizer.ts:144:162"
```

指令要 8 节固定的 Markdown，写英文工程短句，路径、命令、报错原样保留，不许提压缩这件事，碰到旧检查点要合并、不要照抄：

```ts title="模版 · packages/compaction/compaction-basic/src/summarizer.ts:32-67"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/summarizer.ts:32:67"
```

强制英文有决策记录[^english]的理由：检查点是之后每次请求都带着的前缀，多语言对话里压缩器若沿用对话语言，这种语言会跟着一次次压缩留下来，带偏模型的推理文体。

实跑第 9 次调用是第一次摘要。和第 8 次（上一个对话请求）逐字节比：

```text title="效果 · 压缩请求和上一个对话请求的比对"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/request-shape.txt"
```

整次实跑每次调用的用量；末行是对照组：同一段对话按 pi 的格式另起一次摘要请求：

```text title="效果 · 每次模型调用的用量（token）"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/calls.txt"
```

第 9 次调用 11,666 token 里有 11,136 命中缓存，新算的 530 主要是末尾那段指令；对照组 5,791 token 全部重算。代价落在压完之后：第 10 次请求只剩开头 256 token 命中——被压的那段换成了检查点，后面全是新内容，缓存要从这里重新攒。

## 检查点换下被压的那段，旧事件留在日志里 { #land }

**问题**：摘要是模型写的，不一定靠得住：可能被 token 上限截断，可能比原文还长，也可能根本没写摘要。拼回去的那段话，模型还得分得清是背景还是新指令。

摘要只收文本块：被截断、或包上框之后不比被压的那段短，整次拒收。收下的包上固定引言和 `<compacted-summary>` 标签：

```ts title="模版 · packages/compaction/compaction-basic/src/summarizer.ts:69-71（引言）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/summarizer.ts:69:71"
```

```ts title="模版 · packages/compaction/compaction-basic/src/region.ts:417-422（不比原文短就拒收）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/region.ts:417:422"
```

落地是两条事件：一条只留档的 `compaction/summary`，记摘要、模型原始输出、用量和被遮住的 seq；一条 user 消息 replace 掉被压的那段，引用全部来源。被压的范围从第 0 个 system 节点之后开始，system 永远不压：

```ts title="模版 · packages/compaction/compaction-basic/src/region.ts:491-509"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/compaction/compaction-basic/src/region.ts:491:509"
```

用 dsh 的 `foldSurface` 折叠实跑日志，看压缩前后和下一次请求前的模型视图：22 个节点压成 6 个，日志一条没少：

```text title="效果 · 压缩前后的模型视图"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/surface-views.txt"
```

检查点开头（全文见文末）：

```text title="效果 · seq 78 检查点的前 12 行"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/checkpoint1.txt:1:12"
```

第 5 轮又压了一次，被压的范围从上一份检查点开始。新检查点把四个问题并成一份，没有嵌套旧的 `<compacted-summary>`。

拒收也真碰到过：第一次实跑阈值设得更低（8,000），模型在摘要请求里没写摘要，又调了两次 read——摘要请求带着 tools，模型就可能去调。程序只认文本，这次压缩记一条带错误的结束事件，本轮照常往下走，下一步再压才成：

```text title="效果 · 第一次实跑里被拒收的那次摘要"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/rejected.txt"
```

## 被压掉的 AGENTS.md 和运行时上下文，下一步补发 { #reinject }

**问题**：AGENTS.md、工作目录、权限这些，是作为 user 消息排在对话开头的（拼法见[拼 prompt](prompt.md)），压缩会把它们一起压进检查点。检查点里只剩模型的转述，「工作区只读」这条规矩写不写进去全看模型。

这几样各自按当前的模型视图对账。运行时上下文记着自己最后一条的 seq，一被 replace 遮住就清空记录，下一步重发：

```ts title="模版 · packages/core/agent-loop/src/runtime-context.ts:134-163"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/runtime-context.ts:134:163"
```

AGENTS.md 每步从模型视图末尾往前找基线，找不到就重读文件重发；skill 目录也是这个做法：

```ts title="模版 · packages/context/agent-instructions/src/index.ts:48-65"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/context/agent-instructions/src/index.ts:48:65"
```

实跑压完的下一步，两条都补回来了，正文和最初一字不差：

```text title="效果 · 补发"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/reinject.txt"
```

补发只能接在末尾——日志只追加，模型视图也只在末尾长：上一节「下一次请求前」那段视图里，seq 81、82 排在最后。

## 特殊时刻的补丁文本 { #patches }

压缩之外，harness 还在几个时刻往对话里塞固定文本。取消和崩溃后的补齐见[会话日志](log.md)，大输出落盘、bash 的退出码和沙箱标记见[工具与安全边界](tools.md)，这里讲剩下三种。

**问题**：模型卡在一个调用上，一遍遍发同样的参数。

同一个 agent 连续发出同一个调用（参数按键排序后比较），第 3 次附一句轻提醒，第 5、8 次换成点名工具和参数的详细版。提醒作为 user 消息跟在工具结果后面，不拦调用；用户一插话就清零：

```ts title="模版 · packages/guard/repeat-tool-reminder/src/index.ts:70-86"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/guard/repeat-tool-reminder/src/index.ts:70:86"
```

工具声明了 `timeoutMs`，超时的结果换成一句报错：

```ts title="模版 · packages/guard/timeout-policy/src/index.ts:41-48"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/guard/timeout-policy/src/index.ts:41:48"
```

两样用真的 agent 循环跑，模型换成仓库测试里的脚本模型（构造的）：连发 8 次同一个 `grep`，再调一个声明 50ms 超时、实际要跑 1 秒的工具：

```text title="效果 · 重复调用提醒和超时（构造的脚本模型）"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/repeat-and-timeout.txt"
```

图片也有两种占位：模型只收文本，或者图片超了请求预算、最早的几张被换下。喂一个构造的图片引用：

```text title="效果 · 两种图片占位（构造的图片引用）"
--8<-- "projects/deepseek-harness/assets/sim/compaction/txt/image-omitted.txt"
```

占位里带着附件的哈希；有本地副本时还会写上路径，模型能自己用工具去读。

## 谁管什么 { #split }

- **程序**：什么时候压（阈值、每步开头量）、先裁后摘、裁多少、摘要请求怎么拼、拒收不合格的摘要、检查点放哪、system 不压、被压掉的上下文补发、重复调用和超时的补丁文本
- **模型**：检查点写什么；看到裁剪标记后要不要重读
- **用户**：`/compact` 手动压；部署方按模型配阈值、保留长度和摘要用哪个模型——摘要换成别的模型，前缀缓存就用不上了

## 实跑原件 { #sim-files }

脚本和实验设置写在维护记录里。整份会话日志（流式原件已略去）在 `assets/sim/compaction/out/session-events.jsonl`。

??? abstract "第一份检查点全文（seq 78）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/compaction/txt/checkpoint1.txt"
    ```

??? abstract "第二份检查点全文（seq 104，合并了第一份）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/compaction/txt/checkpoint2.txt"
    ```

??? abstract "第 9 次调用：dsh 发出的压缩请求体"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/compaction/out/compaction-request.json"
    ```

??? abstract "对照组：按 pi 格式拼的摘要请求体"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/compaction/out/control-request.json"
    ```

[^pi]: `@earendil-works/pi-coding-agent` 1.3.0 的 `dist/core/compaction/compaction.js` 与 `utils.js`（`SUMMARIZATION_SYSTEM_PROMPT`、`serializeConversation`），2026-10-20 读；对照组照抄了它的两段提示词。
[^summary-cache]: dsh 的决策记录[摘要调用回放对话前缀以复用 KV Cache](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/bug-fix/2026-07-21-compaction-summary-prefix-cache-reuse.zh.md)，2026-10-20 读。
[^english]: dsh 的决策记录[压缩检查点使用英语工程文体](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/bug-fix/2026-07-31-english-compaction-checkpoints.zh.md)，2026-10-20 读。
