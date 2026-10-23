---
description: "OpenAI Evals 拆解：领域是大模型评测框架，以 for 循环评测脚本为 baseline，按登记、判分、被测对象、多轮、跑和记五条线讲问题和功能，配源码模版；重心是一个 eval 等于数据加 YAML 里选一个模板类"
---

# OpenAI Evals：评测脚本拆成三块，加一个题库只交数据和一段 YAML

## 摘要 { #abstract }

OpenAI Evals 是 OpenAI 开源的大模型评测框架，附带一个公开题库[^repo]。baseline 是读者多半写过的 for 循环脚本：读 JSONL 题库，逐条调 API，回复和标准答案相等就算对，最后打印正确率。它在五处出毛病：每个题库重抄一遍；`"B."` 不等于 `"B"`，开放题没有标准答案；问法写死给一种模型，加个 CoT 就得改脚本；多轮题塞不进一问一答；跑完只剩一个数字。Evals 按登记、判分、被测对象、多轮、跑和记五条线回答。设计重心是一条注册规矩：YAML 里写一行 `class: evals.elsuite.basic.match:Match`，再给一个 `samples_jsonl`，就是一个能跑的 eval。仓库里 841 个注册 eval，502 个只用了三个字符串比较模板，贡献者只交数据和这段 YAML。

## 关键词 { #keywords }

大模型评测（LLM evaluation）· 评测框架（eval harness）· 基准测试（benchmark）· 模型打分（LLM-as-a-judge）· 裁判校准（meta-evaluation）· 脚手架（scaffolding）· 思维链（chain-of-thought）· 自洽投票（self-consistency）· few-shot · 可复现（reproducibility）

## 术语 { #terms }

项目自造的词，各页换成了右边的说法，只在第一次出现时括注原词。

| 词 | 出处 | 意思 |
|---|---|---|
| eval | 领域通用 | 一个题库加一种判法，跑一次得一组分数 |
| 标准答案 | 项目叫 `ideal` | 样本里的参考答案，可以是几个说法组成的列表 |
| 评测模板 | 项目叫 eval template | 带参数的 eval 类，换题库不换代码 |
| 注册表 | 领域通用（registry） | YAML 里从名字到类和参数的映射 |
| split、版本 | 项目约定 | eval 全名 `<名>.<split>.<版本>` 的后两段 |
| 评测集 | 项目叫 eval set | 一串 eval 名字，可以带通配，一条命令跑完 |
| 被测接口 | 项目叫 Completion Function | 收一段 prompt、回若干段文本的可调用对象 |
| 答题方 | 项目叫 Solver | 收题面、回一个字符串的被测系统，里面可以套脚手架 |
| 题面 | 项目叫 TaskState | 每轮交给答题方的任务说明、对话历史和状态 |
| 组合答题方 | 项目叫 NestedSolver | 里面套着别的答题方，比如 CoT 先推理、再抽答案 |
| 后处理 | 领域通用（postprocessor） | 答案交出去之前的字符串清理 |
| 模型打分 | 领域通用（LLM-as-a-judge），项目叫 model-graded eval | 让一个模型按打分 prompt 给回答归类、记分 |
| 打分规格 | 项目叫 modelgraded spec | 打分 prompt、选项、分值，以及哪个输入对哪个回答 |
| 裁判校准 | 项目叫 meta-eval | 拿人工标签算裁判和人的一致率 |
| 环境模型 | 我起的 | eval 自己建、扮演环境的模型，比如二十问里的出题人 |
| 记录器、事件 | 领域通用（recorder、event） | 跑的时候按样本记下每次采样、判分和指标 |

## 引言 { #intro }

**领域是大模型评测框架**：给定题库和判法，对一个模型，或者包着模型的一套系统，批量出题、收答案、打分、汇总。两个前辈各有侧重：EleutherAI 的 lm-evaluation-harness 选择题多数比各选项的对数似然，要求模型交出 logprob[^lm-eval]；Google 的 BIG-bench 由社区提交 200 多个 JSON 任务和程序化任务[^bigbench]。Evals 只走 API、只看模型吐出的文本，所以判分全落在字符串和另一个模型身上，接口也照对话格式来设计。现状交代两句：README 开头写着现在可以直接在 OpenAI Dashboard 里配置和跑 Evals；贡献规则写明暂不收带自写代码的 eval，只收数据和模型打分 YAML[^readme]。仓库现在主要当公开题库和框架参考。

**baseline 是一个 for 循环脚本**：

```python title="baseline · 读者多半写过的评测脚本（示意，不是项目代码）"
import json
from openai import OpenAI

client = OpenAI()
rows = [json.loads(line) for line in open("samples.jsonl")]
correct = 0
for row in rows:
    reply = client.chat.completions.create(model="gpt-4o", messages=row["input"])
    correct += reply.choices[0].message.content == row["ideal"]
print(correct / len(rows))
```

题库、问法、判法、汇总全搅在这十行里。Evals 把它拆成三块：题库是数据，判法和汇总是模板类，问法交给被测那一侧；三块靠注册表里的名字接起来。下面五条线各从一个具体毛病讲起，每条线另有一篇细讲，每一步贴源码模版。

### 一、登记：一个 eval 就是数据加一段 YAML { #registry }

1. 想加一个「48+2=」算术题库，baseline 得新写一个脚本，跟上一个只差文件名 → **评测模板**：Match、Includes、FuzzyMatch、ModelBasedClassify 都是带参数的类，题库只是一个参数
2. 选好模板还得有地方说「这个名字用这个类、这份数据」→ **YAML 注册**：`class` 加 `args`，数据路径相对 `registry/data/`
3. 题库改过，新旧分数混在一个名字下 → **三段命名加别名**：全名 `<名>.<split>.<版本>`，短名用 `id` 指向当前版本；改了题就升版本
4. 私有题库不想提交进公开仓库 → **注册目录叠加**：内置目录、`~/.evals`、`--registry_path` 依次读，重名直接报错
5. 一次要跑几十个 eval → **评测集**：一串名字，支持 `hello.dev.*` 这样的通配；`--extra_eval_params` 在命令行临时改参数

细讲：[登记](registry.md) —— 模板类、YAML 变实例、别名链、目录叠加、评测集

### 二、判分：从字符串比较到模型当裁判 { #grading }

1. 标准答案 `"B"`，模型答 `"B. Because…"`，`==` 判错 → **三种字符串判法**：Match 看开头，Includes 看包含，FuzzyMatch 归一化后互相包含，再算 token F1
2. 「写两行关于苹果的笑话」没有标准答案 → **打分规格**：打分 prompt 里留 `{completion}` 空，配选项和分值表，被测回答填进去交给裁判模型
3. 裁判一上来就给结论，或者一段话里提到好几个选项 → **自动追加答题格式**：`cot_classify` 在打分 prompt 末尾追加「先逐步推理，最后单独一行写选项」，解析时从最后一行倒着找
4. 裁判的回复里找不到选项 → **记 `__invalid__`，按最低分算**，另外单独计数
5. 三个模型谁的笑话最好笑 → **一题多答**：best 让几个模型各答一次，拼成编号列表让裁判挑；battle 把同一个模型对两道题的回答放进同一个打分 prompt 比高下。命令行里逗号分隔，最后一个模型当裁判
6. 裁判本身准不准 → **裁判校准**：数据里带上人工标的 `choice`，打开 `metaeval`，报告里多出裁判和人的一致率

细讲：[判分](grading.md) —— 字符串判法、打分规格、倒序解析、invalid、best 与 battle、裁判校准

### 三、被测对象：从一个模型到模型加脚手架 { #solver }

1. 题库是 chat 格式的 messages，davinci 这种补全模型吃不下 → **prompt 互转**：chat 转成带 `User:` / `Assistant:` 前缀的纯文本，纯文本包成一条 system
2. 要测的是一条 LangChain 链、一个带检索的问答系统，不是裸模型 → **被测接口**（Completion Function）：收 prompt、回若干段文本；命令行上的名字可以是模型名，也可以是注册过的被测接口
3. 「GPT-4 在这题上多少分」本身没说清：加不加 CoT，分数差很多，而 CoT 写进 eval 就把问法绑死了 → **答题方**（Solver）：eval 只交题面，怎么问模型由答题方决定
4. 同一个 eval 想比直接答、先推理再答、投票五次 → **组合答题方**：CoT 是推理答题方加抽答案答题方，还有自洽投票、few-shot，都在 YAML 里嵌套
5. 模型答 `"B."` → **后处理链**：去空白、去引号、去句号按顺序跑，每一步记一个事件
6. Claude 的 messages 里没有 system 角色，还要求 user / assistant 交替 → **各家差异关在各家的答题方里**；人也走同一个接口答题

细讲：[被测对象](solver.md) —— prompt 互转、被测接口、题面、组合答题方、后处理、provider 与人类答题

### 四、多轮：一道题要来回好几轮 { #multiturn }

1. 二十问：被测方一轮轮提问，另一个模型扮出题人答 yes / no → **SolverEval 只收一个答题方**，出题人这种环境模型由 eval 自己建；每轮按角色把对话改写成 user / assistant，重新出题面
2. 带记忆的答题方被十个线程共用，第 3 题的记忆串进第 7 题 → **每个样本拷一份答题方**，题面交出去也是深拷贝
3. CoT 答题方的私下推理不该交给 eval，下一轮它自己又得记得 → **私有记忆**：记下哪几条是私下推理，下一轮先核对 eval 给的历史，再插回去
4. 题目要查表、要计算，模型得调工具 → **工具循环**：解析 `(@工具名: 输入)`，跑工具，结果当 user 消息喂回；既没调工具也没给答案就发提醒，轮数到顶就收
5. 旧的 Eval 也想用答题方 → **包成一个被测接口**，但拒收带持久记忆的 CoT

细讲：[多轮](multiturn.md) —— 环境模型、按角色改写、每样本拷贝、私有记忆、工具循环

### 五、跑和记：每条样本都能回放、能复现 { #record }

1. 1000 条跑完只拿到 0.62，不知道错在哪、模型原话是什么 → **按样本记事件**：每次采样记 sampling，每次判分记 match 或 metrics，都挂上 `sample_id`；模型封装深处靠 ContextVar 找到当前记录器
2. 几个月后翻出两份结果，说不清各自怎么跑的 → **日志首行写运行规格、末行写报告**：规格里有完整命令、种子、eval 参数
3. 多线程下完成顺序是乱的，few-shot 抽样每次不同，两次结果没法比 → **随机数跟样本走**：洗牌用固定种子，每条样本的随机数由 `sample_id:seed` 派生，跟线程调度无关
4. 串行调 API 太慢，碰上限流就挂 → **线程池加指数退避重试**
5. 评测集 30 个 eval 跑到第 20 个崩了 → **进度文件**：重跑时跳过已经完成的 eval
6. 评的是客户的敏感数据 → **指定字段不落盘**；HTTP 上报失败太多就回落本地；token 用量从采样事件汇总进报告

细讲：[跑和记](record.md) —— 事件、运行规格、种子派生、并发重试、续跑、记录去处

## 局限 { #limits }

只列设计上的取舍，项目自己认下的在前：

- **单个 eval 不能续跑**：进度只按 eval 粒度记在评测集上，一个 eval 中途断了只能从头来；文档的建议是把单个 eval 做小
- **公开题库只收模板能表达的**：框架能写任意 eval，但贡献规则暂不收带自写代码的 eval，只收数据和模型打分 YAML
- **两代被测接口并存**：Eval 收一串被测接口，SolverEval 收一个答题方；README 写明答题方框架还是 beta，新提交的模板类 eval 仍走旧接口；旧 Eval 套答题方时，有状态的答题方用不了
- **字符串模板偏宽**：Match 只看开头，标准答案 `4` 碰上回答 `42` 也算对；Includes 只看包含，`4` 落在 `14` 里也算对。要严就得自己写判法
- **裁判默认就是被测模型**：命令行只给一个模型时，它既答题又打分；裁判的回复解析不出来记 `__invalid__`、按最低分算，裁判的失误算在被测方头上
- **只看文本**：答题方只回字符串，选择题也得让模型写出选项再解析，没法比各选项的对数似然；分类用的答题方只好拿 `logit_bias` 把输出压到合法选项上

## 结论：可以搬走的设计 { #takeaways }

- **模板、数据、配置三分**：通用判法写成带参数的类，配置文件里选类、填参数、给数据路径。自己的项目里有十个长得差不多的评测脚本，就抽出模板类，新题库只交数据和一段配置
- **把裁判的输出约束成分类**：给定选项和分值表，在打分 prompt 末尾自动追加「先推理，最后单独一行写选项」，倒着找选项；找不到记成 invalid、按最低分算。任何 LLM-as-a-judge 都能照搬，invalid 单独计数还能看出裁判失灵
- **裁判校准只是一个开关**：同一份数据带上人工标签，判法照常跑，额外算裁判选项和人工标签的一致率。上线一个新裁判 prompt 前先跑这一项
- **答题方只收题面、只回字符串**：CoT、投票、few-shot、后处理都放在被测那一侧嵌套组合，eval 里不写死任何 prompt 技巧。比较「同一个模型、不同脚手架」时，只换配置不换 eval
- **随机数跟样本走**：每条样本的随机数种子取 `样本 id + 全局种子`，跟线程调度、并发数无关。并发跑带抽样的任务时都该这么派生
- **事件挂在样本 id 上，靠 ContextVar 找记录器**：外层按样本设一次默认记录器，模型封装深处直接记采样，不用一层层传参数。任何「并发跑、事后要按条回放」的批处理都适用

[^repo]: [openai/evals](https://github.com/openai/evals)，MIT 许可，2026-10-20 读。
[^lm-eval]: [EleutherAI/lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) README 的模型后端表，按 `loglikelihood`、`generate_until` 等请求类型列出各后端支持什么，2026-10-20 读。
[^bigbench]: [google/BIG-bench](https://github.com/google/BIG-bench) README，原话是「more than 200 programmatic and JSON tasks」，2026-10-20 读。
[^readme]: openai/evals 的 [README](https://github.com/openai/evals/blob/8eac7a7de5215c907fbddc30efdaf316913eccdd/README.md) 开头一行和「Writing evals」一节，2026-10-20 读。

<div class="zx-no-copy" markdown>

---

维护记录：[读的哪个版本、素材从哪来](../../maintenance/projects/openai-evals.md)。正常阅读不用看。

</div>
