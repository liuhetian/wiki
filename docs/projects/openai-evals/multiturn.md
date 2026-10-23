---
description: "OpenAI Evals 怎么跑多轮题：SolverEval 只收一个答题方，出题人这类环境模型由 eval 自己建；每轮按角色改写对话、重出题面；每个样本拷一份答题方；CoT 的私下推理自己记着、逐条核对；工具调用循环加提醒和轮数上限。每步配源码模版"
---

# 多轮：一道题要来回好几轮

baseline 一道题就是一次 API 调用。二十问、工具调用这类题要来回十几轮，题面每轮都在变，还牵扯第二个模型，塞不进一问一答。Evals 让 eval 自己握着对话和环境，每轮给答题方现出一份题面；答题方的状态按样本隔开。本篇只读了源码，没有实跑，每节只贴源码模版。

## 环境模型由 eval 自己建 { #environment }

**问题**：二十问要两个模型：被测方提问、猜词，出题人知道答案、答 yes / no / skip。要是照模型打分的办法，让「命令行上的最后一个当出题人」，就分不清哪个才是被测的，出题人用什么模型也变成每次跑都得记着的命令行约定。

**功能**：多轮题写成 SolverEval，它只收一个答题方：

```python title="模版 · evals/eval.py:186-194"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:186:194"
```

项目对环境里其他模型的规定[^solvers]：

> evals may still use additional models e.g. for model-model interactions, but additional models belong to the environment and should be created by the eval itself rather than passed in as input.

二十问把出题人写成 eval 的一个参数，由 eval 自己按名字建出来：

```python title="模版 · evals/elsuite/twenty_questions/eval.py:23-42"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/twenty_questions/eval.py:23:42"
```

出题人换模型，改的是 eval 条目，被测方不用动。分数只记在被测方头上；出题人拒答的次数单独成一个指标，出题人掉链子时看得出来。

## 每轮重出题面：按角色改写对话 { #roles }

**问题**：同一段对话，被测方看来，自己的提问是 assistant，出题人的回答是 user；出题人看来正好反过来。中间还夹着 eval 自己插的「猜错了」「没按规则来」，也得在两边的对话里各有一个位置。

**功能**：对话由 eval 握着，消息角色记成 `guesser`、`gamemaster`、`system`。每轮轮到谁，就按谁的视角改写一遍：自己说的变成 assistant，其余的，包括对方的话和 eval 插的提示，都变成 user：

```python title="模版 · evals/elsuite/twenty_questions/utils.py:12-26"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/twenty_questions/utils.py:12:26"
```

```python title="模版 · evals/elsuite/twenty_questions/utils.py:42-62"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/twenty_questions/utils.py:42:62"
```

一轮的流程：被测方说一句，eval 解析它是 `[GUESS 词]`、是问句，还是两样都不是。猜错和违规都由 eval 插一条提示，不去问出题人；只有提问才轮到出题人回答。循环有两个上限：问题数，和被测方的总回复数。后一个防的是答题方一直不提问、卡在死循环里：

```python title="模版 · evals/elsuite/twenty_questions/eval.py:134-189"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/twenty_questions/eval.py:134:189"
```

题面每轮都从对话现生成，答题方不用自己记状态也能玩；猜中时的分数是还剩几个问题。

## 每个样本一份答题方 { #copy }

**问题**：答题方要是带记忆，十个线程共用同一个对象，第 3 题的记忆就会串进第 7 题。

**功能**：SolverEval 在每条样本开头把答题方拷一份，这一条样本里所有轮次都用这一份：

```python title="模版 · evals/eval.py:214-226"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:214:226"
```

默认的拷贝是深拷贝；组合答题方连里面的子答题方一起拷，子答题方自己有特殊的拷贝办法也照样生效：

```python title="模版 · evals/solvers/solver.py:122-125"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/solver.py:122:125"
```

```python title="模版 · evals/solvers/solver.py:191-197"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/solver.py:191:197"
```

答题方状态的寿命就是一条样本。题面交给答题方时也是深拷贝（见[被测对象](solver.md#solver)），两个方向都碰不到对方手里那份。

## 私下推理自己记着 { #private-memory }

**问题**：CoT 答题方玩到第 2 轮，eval 给的历史里只有它第 1 轮交出去的那个问题，看不到当时的推理。重新推一遍，前后可能对不上。

**功能**：私有记忆（`PersistentMemoryCache`）。每轮结束时，记下整段消息，以及其中哪几条是私下的：推理提示、推理本身、抽答案的提示。下一轮先拿 eval 给的历史，跟上一轮的公开部分逐条核对，对不上就报错；对上了，就用带私下推理的完整历史，接上这一轮的新消息：

```python title="模版 · evals/solvers/memory.py:16-64"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/memory.py:16:64"
```

CoT 答题方每轮开头取记忆，结尾存记忆：

```python title="模版 · evals/solvers/nested/cot_solver.py:55-57"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/nested/cot_solver.py:55:57"
```

```python title="模版 · evals/solvers/nested/cot_solver.py:74-76"
--8<-- "projects/openai-evals/assets/evals-src/evals/solvers/nested/cot_solver.py:74:76"
```

旧的 Eval 想用答题方，得先把答题方包成一个被测接口。包装每次调用都拷一份新的答题方，记忆留不住，所以碰上带持久记忆的 CoT 直接报错，要么关掉记忆，要么把 eval 改写成 SolverEval：

```python title="模版 · evals/completion_fns/solver_completion_fn.py:42-48"
--8<-- "projects/openai-evals/assets/evals-src/evals/completion_fns/solver_completion_fn.py:42:48"
```

```python title="模版 · evals/completion_fns/solver_completion_fn.py:69-72"
--8<-- "projects/openai-evals/assets/evals-src/evals/completion_fns/solver_completion_fn.py:69:72"
```

eval 拿到的始终只有抽出来的答案。私下推理和它的位置只存在答题方自己那份拷贝里，核对失败就报错，不会悄悄拼出一段错位的历史。

## 工具循环：解析、执行、喂回、提醒 { #tools }

**问题**：bugged_tools 这道题要调工具来算，工具还可能有 bug，看模型能不能发现。模型的输出得解析成调用、执行，结果再喂回去，来回十几轮。

**功能**：一个通用的工具循环。工具说明填进任务说明；每轮让答题方说一句，解析其中的 `(@名字: 输入)` 和 `(@Answer: …)`。既没调工具也没给答案，或者调用失败，就追加一条提醒；工具结果拼成一条 user 消息喂回去；轮数到顶就收：

```python title="模版 · evals/elsuite/solver_tools_convo.py:51-100"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/solver_tools_convo.py:51:100"
```

调用格式是纯文本标记，正则解析；`Answer` 和 `Bugged` 两个名字留给「交答案」和「报告工具有 bug」：

```python title="模版 · evals/elsuite/solver_tools_convo.py:136-151"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/solver_tools_convo.py:136:151"
```

工具收的也是题面的形状：一段「你叫什么、干什么用」的说明，加一条输入消息。工具可以是一段代码，也可以由模型扮演：

```python title="模版 · evals/elsuite/solver_tools_convo.py:153-180"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/solver_tools_convo.py:153:180"
```

调用协议不依赖任何一家的 function calling，任何答题方都能玩，人类答题方也能；代价是解析全靠正则，格式写歪了只能靠提醒拉回来。

## 谁管什么 { #split }

- **程序**：问题数、回复数、轮数上限；解析猜词、提问、工具调用和最终答案；按角色改写对话；插猜错、违规和提醒的提示；每条样本拷一份答题方；核对私有记忆，对不上就报错
- **模型**：被测方提问、猜词、调工具、判断工具有没有 bug；环境模型答 yes / no / skip，或者扮演工具
- **用户**：选被测的答题方；在 eval 条目里选出题人模型，设问题数和轮数上限

## 附录：源码 { #appendix }

??? abstract "evals/elsuite/twenty_questions/eval.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/twenty_questions/eval.py"
    ```

??? abstract "evals/solvers/memory.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/solvers/memory.py"
    ```

??? abstract "evals/elsuite/solver_tools_convo.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/solver_tools_convo.py"
    ```

[^solvers]: openai/evals 的 [`evals/solvers/README.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/evals/solvers/README.md)，项目对答题方框架的说明，2026-10-20 读。
