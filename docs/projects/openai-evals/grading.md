---
description: "OpenAI Evals 怎么判分：三种字符串判法各宽到哪；开放题交给裁判模型，打分规格写 prompt、选项、分值和输入对应；先推理再倒着找选项，找不到记 invalid 按最低分；一题多答比高下；裁判校准拿人工标签算一致率。每步配源码模版"
---

# 判分：从字符串比较到模型当裁判

baseline 用 `==` 判对错：模型多说一个字就算错，开放题根本没有能拿来比的答案。Evals 的判法分两层：答案短而确定的，用三种宽窄不同的字符串比较；答案开放的，把被测回答填进一段打分 prompt，交给另一个模型选一个选项，再折成分数。本篇只读了源码，没有实跑，每节只贴源码模版。

## 三种字符串判法：看开头、看包含、归一化后互相包含 { #string }

**问题**：标准答案是 `Millie Bobby Brown`。模型答 `Millie Bobby Brown plays Eleven.`，`==` 判错；答 `The actress is Millie Bobby Brown`，只看开头也判错。

**功能**：三个字符串模板，从严到宽。项目文档[^eval-templates]用一行式子写各自的判法，`a` 是回答，`B` 是标准答案列表：

> - `basic/match.py:Match`: `any([a.startswith(b) for b in B])`
> - `basic/includes.py:Includes`: `any([(b in a) for b in B])`
> - `basic/fuzzy_match.py:FuzzyMatch`: `any([(a in b or b in a) for b in B])`

**Match** 逐个标准答案看回答是不是以它开头，命中就记一条 match 事件：

```python title="模版 · evals/api.py:82-105"
--8<-- "projects/openai-evals/assets/evals-src/evals/api.py:82:105"
```

**Includes** 在回答里从后往前找标准答案，可选忽略大小写：

```python title="模版 · evals/elsuite/utils.py:17-25"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/utils.py:17:25"
```

**FuzzyMatch** 先归一化：转小写、删标点、删冠词 a / an / the、合并空白；再看两边谁包含谁。另外按词算 F1，取各标准答案里的最高值，作为第二个指标：

```python title="模版 · evals/elsuite/utils.py:36-53"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/utils.py:36:53"
```

```python title="模版 · evals/elsuite/utils.py:75-88"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/utils.py:75:88"
```

三种判法都只问「标准答案在不在」，不管回答多说了什么。Match 留了 `separator` 参数，可以要求标准答案后面紧跟分隔符，但三个模板都没传，所以标准答案 `4` 碰上回答 `42` 也算对。回答要求是 JSON 的，另有 JsonMatch：两边都解析成 JSON，键集合相同、值逐个相同才算对，解析不了就算错。

## 打分规格：开放题交给裁判模型 { #spec }

**问题**：题目是「write a 1-2 funny lines about apple」，没有标准答案；好不好笑，只能找个人或者找个模型来判。

**功能**：模型打分（领域里叫 LLM-as-a-judge，项目叫 model-graded eval）。一份打分规格（项目叫 modelgraded spec）写四样东西：打分 prompt、选项、各选项的分值、哪个输入对应哪个回答：

```python title="模版 · evals/elsuite/modelgraded/base.py:11-25"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/base.py:11:25"
```

判笑话的规格。`input_outputs: {input: completion}` 的意思是：拿样本的 `input` 字段去问被测模型，回答填进打分 prompt 的 `{completion}` 空；`Unsure` 记半分：

```yaml title="模版 · evals/registry/modelgraded/humor.yaml:1-15"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/modelgraded/humor.yaml:1:15"
```

判一条样本分三步：按 `input_outputs` 采被测回答，样本里已经有回答字段就跳过；把回答、样本字段、eval 条目给的额外参数一起填进打分 prompt，交给裁判；记下选项和分数：

```python title="模版 · evals/elsuite/modelgraded/classify.py:53-102"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify.py:53:102"
```

打分 prompt 里的空可以由 eval 条目来填。closedqa 是一份「按某条标准判 Y / N」的规格，CoQA 题库拿它配了三条标准，只改 `modelgraded_spec_args`：

```yaml title="模版 · evals/registry/evals/coqa-ex.yaml:32-49"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/evals/coqa-ex.yaml:32:49"
```

打分规格只管「怎么问裁判」；用哪份数据、按什么标准判，写在 eval 条目里，所以一份规格能复用到很多 eval 上。

## 裁判先推理，再倒着找选项 { #cot-classify }

**问题**：裁判可能一上来先给结论，再替结论找理由；也可能写一大段，中间提到好几个选项字母，从头找就会撞上错的那个。

**功能**：答题格式（`eval_type`）有三种：只写选项（`classify`），先选再解释（`classify_cot`），先推理再选（`cot_classify`）。在 eval 条目里写上 `eval_type`，程序就往打分 prompt 末尾追加对应的说明，选项列表自动填进去：

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:13-28"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:13:28"
```

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:131-149"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:131:149"
```

解析时逐行去空白、删标点。`cot_classify` 把行倒过来，从最后一行往上找；默认的匹配规则是这一行以选项开头或结尾：

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:110-128"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:110:128"
```

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:29-34"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:29:34"
```

解析前要删标点，所以选项本身不许带标点，加载时就检查；`from_n`、`from_n_ABC` 这几个写法按回答份数生成 `1..n` 或 `A..`：

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:37-48"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:37:48"
```

项目文档[^eval-templates]推荐默认用 `cot_classify`，说它「typically provides the most accurate model-graded evaluations」。说明里还要求「最后单独一行再写一遍答案」，倒着找时碰上的第一行就是它。

## 解析不出：记 invalid，按最低分算 { #invalid }

**问题**：裁判写了一段话却没给选项，或者给了一个规格里没有的 `Maybe`。

**功能**：找不到选项就记成 `__invalid__`，分数取分值表里的最低值。分值表也可以写成 `from_strings`，选项本身就是分数，用来做 1 到 5 的 Likert 量表：

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:90-102"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:90:102"
```

汇总时按选项计数，invalid 也是一项；再算平均分，有校准就再算一致率：

```python title="模版 · evals/elsuite/modelgraded/classify.py:104-127"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify.py:104:127"
```

invalid 按最低分算，等于把裁判的格式失误记在被测方头上，分数只会往低偏；`counts/__invalid__` 单独列出来，裁判失灵时一眼就看得到。

## 一题多答：比高下、挑最好 { #multi }

**问题**：三个模型各写一个笑话，谁的最好笑？或者同一个模型写猫的笑话、写苹果的笑话，哪个写得更好？

**功能**：被测接口和裁判都写在命令行上，逗号分隔，最后一个当裁判，前面的都是被测方；只给一个时，它既答题又打分：

```python title="模版 · evals/elsuite/modelgraded/classify.py:28-33"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify.py:28:33"
```

**best** 比模型：几个被测方各答一次，按 `output_template` 拼成编号列表，选项是 `1..n`。`multicomp_n: from_models` 表示份数等于被测方的个数；改成一个数字，就是同一个模型采几次，diversity 用的就是这个：

```yaml title="模版 · evals/registry/modelgraded/best.yaml"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/modelgraded/best.yaml"
```

```yaml title="模版 · evals/registry/evals/test-modelgraded.yaml:85-98"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/evals/test-modelgraded.yaml:85:98"
```

```python title="模版 · evals/elsuite/modelgraded/classify_utils.py:152-187"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py:152:187"
```

**battle** 比题目：一个样本里放两道题，同一个被测模型各答一份，两份回答填进同一个打分 prompt，分值记的是「第一份更好」的比例：

```yaml title="模版 · evals/registry/modelgraded/battle.yaml"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/modelgraded/battle.yaml"
```

```json title="模版 · evals/registry/data/test_multiio/battles/joke_animals_vs_fruits.jsonl:1-2"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/data/test_multiio/battles/joke_animals_vs_fruits.jsonl:1:2"
```

谁排第一，best 由命令行的顺序决定，battle 由样本决定。裁判偏爱第一个这类位置偏差，框架不管；要控制，就把顺序对调再跑一遍。

## 裁判校准：同一份数据加人工标签 { #metaeval }

**问题**：裁判说八成笑话好笑，可它判得跟人一致吗？换一句打分 prompt、换一种答题格式，裁判是更准了还是更差了？

**功能**：裁判校准（项目叫 meta-eval）。数据里直接给出回答和人工标的选项 `choice`。有回答就不采样，所以整轮只测裁判：

```json title="模版 · evals/registry/data/test_metaeval/joke_fruits_labeled.jsonl:1-2"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/data/test_metaeval/joke_fruits_labeled.jsonl:1:2"
```

eval 条目多写一行 `metaeval: true`：

```yaml title="模版 · evals/registry/evals/test-modelgraded.yaml:34-44"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/evals/test-modelgraded.yaml:34:44"
```

每条样本比一次裁判选项和人工标签，汇总成 `metascore`：

```python title="模版 · evals/elsuite/modelgraded/classify.py:95-98"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify.py:95:98"
```

同一份标注数据，项目配了三个校准条目，只差 `eval_type`，用来比三种答题格式下裁判和人有多一致。项目文档[^build-eval]的要求：

> After running the meta-eval, e.g., `oaieval gpt-3.5-turbo joke-fruits-meta`, the report will output `metascore/` accuracies, which should be close to "1.0" for a good model-graded eval.

校准没有新代码，只是同一个模板多了一个开关，贡献者交打分 YAML 时顺手就能带上一份标注数据。

## 谁管什么 { #split }

- **程序**：字符串判法的归一化和匹配；往打分 prompt 末尾追加答题说明；填空；逐行删标点、倒着找选项；找不到记 invalid、按最低分算；按选项计数，算平均分和一致率；多份回答拼成编号列表
- **模型**：被测模型答原题；裁判模型读打分 prompt，选一个选项——推理写什么、最后选哪个，都由它定
- **用户**：选判法；写打分 prompt、选项和分值；选答题格式；定谁当裁判（命令行最后一个）；准备人工标签跑校准；要控制位置偏差，自己对调顺序再跑

## 附录：源码与文档 { #appendix }

??? abstract "evals/elsuite/modelgraded/classify.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify.py"
    ```

??? abstract "evals/elsuite/modelgraded/classify_utils.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/modelgraded/classify_utils.py"
    ```

??? abstract "modelgraded/fact.yaml 与 closedqa.yaml"

    ```yaml
    --8<-- "projects/openai-evals/assets/evals-src/evals/registry/modelgraded/fact.yaml"
    ```

    ```yaml
    --8<-- "projects/openai-evals/assets/evals-src/evals/registry/modelgraded/closedqa.yaml"
    ```

[^eval-templates]: openai/evals 的 [`docs/eval-templates.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/eval-templates.md)，项目对各模板和打分参数的说明，2026-10-20 读。
[^build-eval]: openai/evals 的 [`docs/build-eval.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/build-eval.md)，项目写的建 eval 流程，2026-10-20 读。
