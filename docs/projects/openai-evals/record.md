---
description: "OpenAI Evals 怎么跑、怎么留痕：每次采样和判分都按样本记成事件，靠 ContextVar 找记录器；日志首行写运行规格、末行写报告；随机数由样本 id 加种子派生，跟线程无关；线程池加退避重试；评测集进度文件续跑；记录可去本地、HTTP、数据库。每步配源码模版"
---

# 跑和记：每条样本都能回放、能复现

baseline 跑完只打印一个正确率：想知道错在哪、两次结果为什么不一样、崩了该从哪接着跑，都没有依据。Evals 把一次运行记成一串按样本归档的事件，最终分数也是从这些事件算出来的；随机数跟着样本走，所以并发跑也能复现。本篇只读了源码，没有实跑，每节只贴源码模版。

## 按样本记事件 { #events }

**问题**：1000 条跑完只拿到 0.62，不知道是哪几条错了，模型的原话是什么，判的时候比的是哪个标准答案。

**功能**：记录器（recorder）把一次运行记成一串事件（event）。每个事件都带运行 id、序号、样本 id、类型和数据：

```python title="模版 · evals/record.py:43-51"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:43:51"
```

常用的事件类型有一份清单：采样、判对错、选项、指标、报错，其余的随便起名：

```python title="模版 · evals/record.py:54-73"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:54:73"
```

eval 代码不用一层层把记录器传下去。跑每条样本前，外层把「当前记录器」和「当前样本 id」放进 ContextVar；模型封装深处直接调模块级的 `record_sampling`，就记到了对的样本名下：

```python title="模版 · evals/record.py:34-40"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:34:40"
```

```python title="模版 · evals/record.py:90-96"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:90:96"
```

```python title="模版 · evals/record.py:593-602"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:593:602"
```

事件先攒在内存里，攒够 100 条、并且离上次写盘过了 10 秒，才批量写一次；进程退出时再写一次：

```python title="模版 · evals/record.py:157-185"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:157:185"
```

最终分数也从事件里算：Match 的 `run` 取全部 match 事件算正确率（见[登记](registry.md#template)）。分数和逐条记录出自同一份数据，报告里每个数都能追到具体的样本。

## 日志首行写运行规格，末行写报告 { #spec }

**问题**：几个月后翻出两份结果文件，说不清各自是拿什么命令、什么种子、哪个版本的 eval 跑的。

**功能**：每次运行先生成一份运行规格：被测接口、eval 全名、split、完整命令行、种子、eval 参数；运行 id 是 UTC 时间戳加一段随机后缀：

```python title="模版 · evals/base.py:74-89"
--8<-- "projects/openai-evals/assets/evals-src/evals/base.py:74:89"
```

```python title="模版 · evals/cli/oaieval.py:173-201"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaieval.py:173:201"
```

本地记录器把规格写成第一行，事件一行一条，最终报告写成最后一行：

```python title="模版 · evals/record.py:322-371"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:322:371"
```

token 用量不用另外统计：跑完把所有 sampling 事件里的 `usage` 加总，以 `usage_` 开头写进报告：

```python title="模版 · evals/cli/oaieval.py:269-294"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaieval.py:269:294"
```

一个 JSONL 文件自带复现它所需的全部信息，拿第一行的命令就能重跑。

## 随机数跟样本走，不跟线程走 { #seed }

**问题**：十个线程并发跑，哪条先跑完是乱的。要是 few-shot 抽样共用一个随机数生成器，每条样本抽到哪几个示例，取决于线程调度，两次结果没法比。

**功能**：样本先用固定种子洗牌，`--max_samples` 取洗牌后的前 N 条；每条样本保留它在原题库里的序号：

```python title="模版 · evals/eval.py:26-38"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:26:38"
```

样本 id 是 `<名>.<split>.<原序号>`。每条样本的随机数生成器用「样本 id 加全局种子」做种子，跑完再按原序号排回去：

```python title="模版 · evals/eval.py:112-147"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:112:147"
```

同一条样本不管被哪个线程、第几个跑到，拿到的随机数都一样；改线程数、改 `--max_samples`，eval 这一侧给每条样本的随机数都不变，剩下的差异只来自模型自己的采样。样本 id 不含版本号，同一道题在新旧两个版本里 id 相同，方便逐条对比。

## 并发、重试和中途叫停 { #threads }

**问题**：串行调 API，1000 条要跑很久；碰上限流或者超时，脚本就挂了。

**功能**：线程池并发，线程数取环境变量 `EVALS_THREADS`，默认 10；调试时 `EVALS_SEQUENTIAL=1` 改成串行（见上一节代码）。API 调用遇到限流、连接错误、超时、服务端错误就按指数退避重试，单次最长等 60 秒：

```python title="模版 · evals/completion_fns/openai.py:19-24"
--8<-- "projects/openai-evals/assets/evals-src/evals/completion_fns/openai.py:19:24"
```

```python title="模版 · evals/utils/api_utils.py:10-22"
--8<-- "projects/openai-evals/assets/evals-src/evals/utils/api_utils.py:10:22"
```

SolverEval 还接受温和中断：设了 `EVALS_GENTLE_INTERRUPT`，按 Ctrl-C 不丢结果，报告按已经跑完的样本出：

```python title="模版 · evals/eval.py:236-253"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:236:253"
```

## 评测集续跑 { #resume }

**问题**：评测集里 30 个 eval，跑到第 20 个崩了，重跑一遍前 19 个既费时间又费钱。

**功能**：评测集运行器给每个 eval 起一个子进程。每跑完一个，就把那条命令追加进进度文件；重跑时先读进度文件，跳过已经完成的：

```python title="模版 · evals/cli/oaievalset.py:17-40"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaievalset.py:17:40"
```

```python title="模版 · evals/cli/oaievalset.py:109-129"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaievalset.py:109:129"
```

续跑的粒度是整个 eval，项目自己说明了单个 eval 不行[^run-evals]：

> Unfortunately, you can't resume a single eval from the middle. You'll have to restart from the beginning, so try to keep your individual evals quick to run.

## 记录去哪：本地、HTTP、数据库、只打印 { #sinks }

**问题**：调 prompt 时只想看几条结果，不想留文件；团队要把结果汇总到一个库；评的是客户的敏感数据，有些字段不能落盘。

**功能**：记录器换实现就换去处，eval 代码一行不动。命令行按开关选：`--dry-run` 只打印，`--local-run`（默认）写本地 JSONL，`--http-run` POST 到一个地址，`--no-local-run` 写 Snowflake：

```python title="模版 · evals/cli/oaieval.py:242-266"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaieval.py:242:266"
```

只打印的记录器按主指标给 match 事件上色，对的绿、错的红，调 prompt 时扫一眼就够：

```python title="模版 · evals/record.py:274-313"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:274:313"
```

HTTP 上报失败的比例超过阈值（默认 5%），这一批改写进本地文件，再抛错提示：

```python title="模版 · evals/record.py:392-403"
--8<-- "projects/openai-evals/assets/evals-src/evals/record.py:392:403"
```

本地记录器还能指定不落盘的字段（`hidden_data_fields`），写盘时从每个事件里剔掉，见第二节的 `LocalRecorder`。源码注释说的场景是「用语言模型评客户的敏感数据」。这个参数命令行上没有开口，要在代码里构造记录器时传。

## 谁管什么 { #split }

- **程序**：事件编号，挂上样本 id；攒批写盘；生成运行 id 和运行规格，写首行和末行；从 sampling 事件加总 token 用量；固定种子洗牌，按样本派生随机数，结果按原序号排回；线程池、退避重试、温和中断；评测集进度文件；HTTP 失败回落本地
- **模型**：不参与这一层，它的每次输出都被记成 sampling 事件
- **用户**：选记录去处；定线程数、`--max_samples`、种子；决定续跑还是删掉进度文件从头来；要隐藏字段时自己在代码里构造记录器

## 附录：源码与文档 { #appendix }

??? abstract "evals/record.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/record.py"
    ```

??? abstract "evals/eval.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/eval.py"
    ```

[^run-evals]: openai/evals 的 [`docs/run-evals.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/run-evals.md)，项目对运行和日志的说明，2026-10-20 读。
