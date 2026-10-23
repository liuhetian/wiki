---
description: "OpenAI Evals 怎么登记一个 eval：判法写成带参数的模板类，YAML 里一个名字对应一个类和一组参数；三段命名加别名，改题就升版本；注册目录叠加放私有题库；评测集通配展开。每步配源码模版"
---

# 登记：一个 eval 就是数据加一段 YAML

baseline 每加一个题库就新写一个脚本：读文件、拼 prompt、调 API、判对错、算正确率，五件事里有四件跟上一个脚本一模一样。Evals 把判法和汇总写成模板类，题库变成模板的一个参数，名字、类、参数登记在 YAML 里。本篇只读了源码，没有实跑，每节只贴源码模版。

## 判法写成带参数的类：题库只是一个参数 { #template }

**问题**：一个常识问答题库，一个算术题库，判法都是「回答的开头是不是标准答案」。baseline 两份脚本只差一个文件名；第三份题库来了，再抄一遍。

**功能**：评测模板（项目叫 eval template）。Eval 基类只要求子类实现两个方法：`eval_sample` 判一条，`run` 读数据、跑全部样本、汇总。

```python title="模版 · evals/eval.py:46-54"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:46:54"
```

最常用的模板是 Match。题库路径 `samples_jsonl` 是构造参数；判一条就是调一次被测接口、比一次开头；汇总是正确率加 bootstrap 标准差：

```python title="模版 · evals/elsuite/basic/match.py:30-65"
--8<-- "projects/openai-evals/assets/evals-src/evals/elsuite/basic/match.py:30:65"
```

题库里的一行长这样：`input` 是 chat 格式的 messages，few-shot 示例用 `name` 标成 `example_user` / `example_assistant`；标准答案（项目叫 `ideal`）可以给几个说法：

```json title="模版 · evals/registry/data/test_fuzzy_match/samples.jsonl:2"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/data/test_fuzzy_match/samples.jsonl:2:2"
```

841 个注册 eval 里，290 个用 Match，174 个用 Includes，38 个用 FuzzyMatch，加起来 502 个没写一行判分代码。

## YAML 里一个名字对应一个类和一组参数 { #yaml }

**问题**：模板有了，还得有个地方写明「`test-fuzzy-match` 用 FuzzyMatch、读这份数据」；不然每个题库还得配一个入口脚本。

**功能**：YAML 注册。每个条目写 `class`（`模块:类名`）和 `args`，`args` 原样传给构造函数：

```yaml title="模版 · evals/registry/evals/test-basic.yaml:9-16"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/evals/test-basic.yaml:9:16"
```

加载时，每个条目记下自己的名字、所在文件名（当分组用）和所在的注册目录；`class` 改名叫 `cls`。`key`、`group`、`cls` 三个是保留字，用户不许自己写：

```python title="模版 · evals/registry.py:287-310"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:287:310"
```

跑 `oaieval gpt-3.5-turbo test-fuzzy-match` 时，命令行查到条目，按 `cls` 导入类，把被测接口、种子、全名、注册目录和 `args` 一起传进构造函数：

```python title="模版 · evals/cli/oaieval.py:217-226"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaieval.py:217:226"
```

数据路径先当本地文件找，找不到就拼到这个条目所在注册目录的 `data/` 下面：

```python title="模版 · evals/eval.py:158-165"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:158:165"
```

数据路径跟着「条目从哪个注册目录读出来」走，所以私有注册目录的数据放进它自己的 `data/` 就行。读文件走 blobfile，云存储的路径式 URL 也能直接填，但公开仓库不收。

## 三段命名加别名：改了题就升版本 { #naming }

**问题**：题库里改了几道题的答案，还用原名字跑。新分数和半年前的旧分数放在一起比，其实已经不是同一套题。

**功能**：全名分三段，`<名>.<split>.<版本>`。短名是一个只写 `id` 的条目，指向当前版本，`description` 和 `metrics` 也写在短名上，`metrics` 的第一项是主指标。项目文档[^build-eval]的规矩：

> In general, running the same eval name against the same model should always give similar results so that others can reproduce it. Therefore, when you change your eval, you should bump the version.

基类构造时检查名字至少有两段：

```python title="模版 · evals/eval.py:65-67"
--8<-- "projects/openai-evals/assets/evals-src/evals/eval.py:65:67"
```

查名字时，别名一路跟下去，直到碰上一个不再指向别处的条目：

```python title="模版 · evals/registry.py:168-191"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:168:191"
```

升版本就是新加一个全名条目，再把短名的 `id` 改过去；旧版本的条目留着，照样能按全名跑。名字拼错时，注册表用 difflib 给出五个最接近的名字。

## 注册目录叠加：私有题库不进公开仓库 { #paths }

**问题**：拿公司内部数据做 eval，既不能提交进公开仓库，也不想 fork 一份改。

**功能**：注册表按一串目录依次读：包内的 `registry/`、家目录的 `~/.evals`，再加上命令行的 `--registry_path`（可以写多次）。每个目录下按资源类型分子目录：`evals/`、`eval_sets/`、`completion_fns/`、`solvers/`、`modelgraded/`。

```python title="模版 · evals/registry.py:30-33"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:30:33"
```

```python title="模版 · evals/registry.py:104-108"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:104:108"
```

跨目录重名直接报错，就是上一节 `_load_registry` 里那行 `assert name not in registry`。私有目录不能悄悄盖掉内置条目，只能起新名字。被测接口、答题方、打分规格也走同一套注册，私有目录里可以放全套。项目文档[^completion-fns]举的例子是把自写的被测接口放在仓库外：`~/my_project/completion_fns/my_completion_fn.yaml` 里写 `class: my_project.my_completion_fn:MyCompletionFn` 指向自己的模块，跑的时候用 `--registry_path` 把这个目录叠上去：`oaieval my_completion_fn test-match --registry_path ~/my_project`。

## 评测集与命令行覆盖 { #sets }

**问题**：发一个新模型，要跑几十个 eval；又想临时把某个 eval 的参数改小试一下，不想动 YAML。

**功能**：评测集（项目叫 eval set）是一串名字。展开时每个名字都当成模式：`.` 转义，`*` 换成 `.*`，跟所有注册名逐个匹配。

```yaml title="模版 · evals/registry/eval_sets/test-basic.yaml:1-6"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry/eval_sets/test-basic.yaml:1:6"
```

```python title="模版 · evals/registry.py:216-227"
--8<-- "projects/openai-evals/assets/evals-src/evals/registry.py:216:227"
```

匹配到的名字都会解到全名，评测集运行器按全名拼命令，再去重；同一个 eval 被短名和通配各命中一次，也只跑一遍。

临时改参数用 `--extra_eval_params key=value,...`：解析成字典，能转数字的转成 int 或 float，盖在 `args` 上，再传给构造函数：

```python title="模版 · evals/cli/oaieval.py:136-162"
--8<-- "projects/openai-evals/assets/evals-src/evals/cli/oaieval.py:136:162"
```

## 谁管什么 { #split }

- **程序**：读 YAML，记下每个条目的来源目录和分组；别名一路跟到底；跨目录重名就报错；按来源目录解析数据路径；评测集通配展开再去重；命令行参数转成数字后覆盖 `args`
- **模型**：不参与这一层
- **用户**：写 JSONL 和 YAML，挑模板，定 split 和版本号。改了题要自己升版本——程序不比对数据，同一个名字换了一套题，它查不出来

## 附录：源码与文档 { #appendix }

??? abstract "evals/registry.py 全文"

    ```python
    --8<-- "projects/openai-evals/assets/evals-src/evals/registry.py"
    ```

??? abstract "evals/registry/evals/test-basic.yaml 全文"

    ```yaml
    --8<-- "projects/openai-evals/assets/evals-src/evals/registry/evals/test-basic.yaml"
    ```

[^build-eval]: openai/evals 的 [`docs/build-eval.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/build-eval.md)，项目写的建 eval 流程，2026-10-20 读。
[^completion-fns]: openai/evals 的 [`docs/completion-fns.md`](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/docs/completion-fns.md)「Developing Completion Functions outside of Evals」一节，2026-10-20 读。
