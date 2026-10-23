---
description: "OpenAI Evals 怎么定义被测对象：出题和答题之间只交换题面和字符串；chat 和纯文本 prompt 互转，被测接口协议，答题方只收题面，CoT、投票、few-shot 在 YAML 里嵌套，后处理链，各家角色差异和人类答题都关在答题方里。每步配源码模版"
---

# 被测对象：从一个模型到模型加脚手架

baseline 里被测的就是脚本里那一行 API 调用：消息格式、调用参数、要不要 CoT、要不要 few-shot，全写死在 eval 里，换个模型或换种问法就得改 eval。Evals 在出题和答题之间只留一个窄口：出题的一侧交出 prompt 或题面，答题的一侧还回字符串。窄口两边谁都能换：裁判是一个被测接口，人也能当一个答题方。本篇只读了源码，没有实跑，每节只贴源码模版。

## prompt 互转：一份题库喂两种模型 { #prompt }

**问题**：题库按 chat 格式写，few-shot 示例是 `name` 为 `example_user` 的 system 消息；davinci 这类补全模型只吃一段字符串。

**功能**：prompt 互转。chat 转纯文本：每条消息加角色前缀，`example_user` 变成 `User:`，system 不加前缀，末尾补一个 `Assistant:` 让模型接着写；纯文本转 chat：整段包成一条 system：

```python title="模版 · evals/prompt/base.py:22-63"
--8<-- "projects/openai-evals/assets/evals-src/evals/prompt/base.py:22:63"
```

题库作者只写 chat 格式，换哪种模型由被测接口自己转。项目文档建议哪怕测的是补全模型也用 chat 格式写题。

## 被测接口：模型名和系统名走同一个入口 { #completion-fn }

**问题**：要测的是一条 LangChain 链，或者一个先检索再回答的问答系统，不是裸模型。

**功能**：被测接口（项目叫 Completion Function）。协议[^protocol]只有一条：可调用，收一个 prompt，回一个对象，对象的 `get_completions()` 给出若干段文本：

```python title="模版 · evals/api.py:16-40"
--8<-- "projects/openai-evals/assets/evals-src/evals/api.py:16:40"
```

命令行上的名字按顺序解析：`dummy`、chat 模型名、API 里列得出的模型名，都不是就去注册表查被测接口和答题方：

```python title="模版 · evals/registry.py:120-151"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:120:151"
```

OpenAI 的实现把 prompt 包成对应格式，带重试调 API，再自己记一条 sampling 事件：

```python title="模版 · evals/completion_fns/openai.py:149-181"
--8<-- "projects/openai-evals/assets/evals-src/evals/completion_fns/openai.py:149:181"
```

记采样是被测接口自己的事，eval 不用管。接 LangChain 只要写一个类、注册一行 YAML。被测接口还能套被测接口：注册表里的 `cot/gpt-3.5-turbo` 先让模型推理，再让同一个模型抽出答案。

## 答题方：eval 只交题面 { #solver }

**问题**：「GPT-4 在这题上多少分」本身没说清。项目原话[^solvers]：

> “How good is GPT-4 on this eval?” is an underspecified question. Interacting with a model requires scaffolding (prompting, tooling, etc.), and scaffolding can drastically change the model’s behavior

旧接口下，问法握在 eval 手里。Match 模板的 few-shot 是 eval 的参数，示例插在哪由 eval 定：

```python title="模版 · evals/elsuite/basic/match.py:38-44"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/basic/match.py:38:44"
```

项目的自写 eval 教程把示例写成带 `name` 的 system 消息，而 `name` 字段只有 OpenAI 的 chat 接口认。项目自己的总结[^solvers]：

> we've found that passing a prompt to the CompletionFn encourages eval designers to write prompts that often privileges a particular kind of Solver over others.

**功能**：答题方（项目叫 Solver）。eval 每轮交给它一份题面（项目叫 TaskState），三个字段：任务说明，同一个 eval 里固定不变；到目前为止的对话消息；可选的显式状态，比如比分、剩几轮：

```python title="模版 · evals/task_state.py:23-46"
--8<-- "projects/openai-evals/assets/evals-src/evals/task_state.py:23:46"
```

答题方还回一个字符串，外加任意元数据。调用时先把题面深拷贝一份，答题方怎么改都碰不到 eval 手里那份；再按顺序跑后处理：

```python title="模版 · evals/solvers/solver.py:59-97"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/solver.py:59:97"
```

OpenAI 答题方把任务说明当 system，后面接对话消息。碰上补全模型，它自己渲染成文本，用角色前缀当 stop，把模型自己续写出来的下一轮切掉：

```python title="模版 · evals/solvers/providers/openai/openai_solver.py:115-157"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/providers/openai/openai_solver.py:115:157"
```

同一个 eval 换答题方，只改命令行第一个参数。`oaieval gpt-4 <eval>` 这种裸模型名，也会被自动包成 OpenAI 答题方：

```python title="模版 · evals/solvers/utils.py:28-55"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/utils.py:28:55"
```

## 组合答题方：CoT、投票、few-shot 在 YAML 里套 { #nested }

**问题**：同一个选择题 eval，想比四种做法：直接答；先推理再答；推理五次投票；先看三个示例再答。

**功能**：组合答题方（项目叫 NestedSolver）。构造参数里写子答题方的 spec，按名字取用；拷贝时连同子答题方一起拷：

```python title="模版 · evals/solvers/solver.py:137-186"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/solver.py:137:186"
```

**CoT** 是推理答题方加抽答案答题方。先追加一条「逐步推理，这次回复不计分」，拿到推理后，再追加「按要求的格式给出答案」，只把抽出来的答案交给 eval，推理放在元数据里：

```python title="模版 · evals/solvers/prompts/cot.py:1-4"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/prompts/cot.py:1:4"
```

```python title="模版 · evals/solvers/nested/cot_solver.py:50-81"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/nested/cot_solver.py:50:81"
```

在 YAML 里嵌套成一个名字：

```yaml title="模版 · evals/registry/solvers/defaults.yaml:25-43"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/solvers/defaults.yaml:25:43"
```

**自洽投票**：同一份题面独立采 N 次，几次推理互相看不见；各自抽出「The answer is」后面的答案计票。`judge` 模式改成让模型读全部推理，给出共识：

```python title="模版 · evals/solvers/nested/self_consistency_solver.py:77-88"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/nested/self_consistency_solver.py:77:88"
```

```yaml title="模版 · evals/registry/solvers/theory_of_mind.yaml:279-290"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/solvers/theory_of_mind.yaml:279:290"
```

**few-shot**：从训练集抽 n 条示例插到对话前面。插之前先查一遍，当前这道测试题要是混进了训练集，直接报错：

```python title="模版 · evals/solvers/nested/fewshot_solver.py:83-87"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/nested/fewshot_solver.py:83:87"
```

```yaml title="模版 · evals/registry/solvers/skill_acquisition.yaml:135-147"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/solvers/skill_acquisition.yaml:135:147"
```

few-shot 在旧接口里是 eval 的参数，到这里成了答题方的选择：被测方看到几个示例，不再由 eval 决定。

## 后处理：答案交出去前清一遍 { #postprocess }

**问题**：项目自己举的例子：选择题要求答 `B`，模型答 `"B."`，精确匹配判错，其实答对了。

**功能**：后处理链。在答题方的 YAML 里按顺序列类路径；每跑一步记一条 postprocessor 事件，前后两版都留着（见上一节 `__call__` 里的循环）：

```yaml title="模版 · evals/solvers/postprocessors/README.md:13-24"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/postprocessors/README.md:13:24"
```

```python title="模版 · evals/solvers/postprocessors/postprocessors.py:5-43"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/postprocessors/postprocessors.py:5:43"
```

顺序有讲究：先去空白，再去引号，最后去句号，`\n"B."\n` 才能清成 `B`。后处理放在答题方这一侧，因为格式毛病出在被测系统身上，判法不用跟着放宽。

## 各家差异关在答题方里，人也走同一个接口 { #providers }

**问题**：Claude 的 messages 里没有 system 角色，还要求 user / assistant 交替；可 eval 往题面里插的提示，常常是连着几条 system。

**功能**：各家 API 的规矩由各家的答题方吸收。Anthropic 答题方让任务说明走顶层的 `system` 参数，消息里的 system 改成 user，连续同角色的消息合并成一条：

```python title="模版 · evals/solvers/providers/anthropic/anthropic_solver.py:88-116"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/providers/anthropic/anthropic_solver.py:88:116"
```

分类题想让模型只吐一个合法选项：OpenAI 答题方接受 `valid_answers`，每个选项必须是单个 token，给它们加 100 的 logit bias，再配上 `max_tokens: 1`：

```python title="模版 · evals/solvers/providers/openai/openai_solver.py:287-297"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/providers/openai/openai_solver.py:287:297"
```

```yaml title="模版 · evals/registry/solvers/defaults.yaml:47-55"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/solvers/defaults.yaml:47:55"
```

人类基线也是一个答题方：把题面打到终端，读一行输入当答案，照样记 sampling，模型名记成 `human`。多线程下各题的输出会混在一起，要配 `EVALS_SEQUENTIAL=1` 一题一题来：

```python title="模版 · evals/solvers/human_cli_solver.py:29-44"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/human_cli_solver.py:29:44"
```

人和模型做的是同一份题面，人类基线不用另写一套。

## 谁管什么 { #split }

- **程序**：chat 和纯文本互转；按名字解析被测接口和答题方，裸模型名自动包成答题方；题面深拷贝；后处理按顺序跑、每步记事件；各家角色规则的转换；`valid_answers` 换算成 logit bias；组合答题方按名字取子答题方，拷贝时连带
- **模型**：推理；按「要求的格式」给出答案；投票时各答各的；`judge` 模式下读几份推理定共识
- **用户**：选答题方和组合方式（CoT、投票、few-shot、后处理）；改模板文字、温度、`valid_answers`；当人类基线时自己坐在终端前答题

## 附录：源码与文档 { #appendix }

??? abstract "evals/solvers/solver.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/solvers/solver.py"
    ```

??? abstract "evals/registry/solvers/defaults.yaml 全文"

    ```yaml
    --8<-- "projects/openai-evals/assets/evals-src/evals/registry/solvers/defaults.yaml"
    ```

[^protocol]: openai/evals 的 [`docs/completion-fn-protocol.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/completion-fn-protocol.md)，项目定义的被测接口协议，2026-10-20 读。
[^solvers]: openai/evals 的 [`evals/solvers/README.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/evals/solvers/README.md)，项目对答题方框架的说明，2026-10-20 读。
