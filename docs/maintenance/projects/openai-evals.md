---
description: "OpenAI Evals 拆解的维护记录：读的是 8eac7a7（2026-10-20 读），MIT 许可；源码存档和行号怎么对、几份题库样本怎么从 LFS 取的；注册 eval 的计数口径；只读源码，没有实跑"
---

# OpenAI Evals 拆解的维护记录

这是 [OpenAI Evals](../../projects/openai-evals/index.md) 背后的事。正常阅读不用看，要对照上游更新、核对出处时再看。

## 版本和素材 { #sources }

- **上游**：[openai/evals](https://github.com/openai/evals)，MIT 许可，许可原文随存档放着
- **读的版本**：`8eac7a7`（2026-04-14 提交，钉 pre-commit 钩子版本），2026-10-20 读。各页不逐处标版本，上游更新了再对照这一个点
- **源码存档**：`projects/openai-evals/assets/evals-src/` 只存细讲页 `--8<--` 引到的文件，逐字未改，路径和原仓库一致：核心框架、两个字符串模板和模型打分模板、答题方框架、二十问和工具循环两个多轮样例、引到的几份注册 YAML。`docs/` 下的项目文档不存档，原话在正文摘句，脚注钉这个 commit 的永链
- **题库样本**：上游的 `registry/data/` 全在 Git LFS 里，克隆时跳过了 LFS，只用 `git lfs pull --include` 取了引到的三份 JSONL（`test_fuzzy_match/samples.jsonl`、`test_metaeval/joke_fruits_labeled.jsonl`、`test_multiio/battles/joke_animals_vs_fruits.jsonl`）和 `registry/data/README.md`，存档逐字
- **行号**：模版标题里的 `路径:起-止` 是原仓库同版本的行号，存档逐字，两边一致
- **前辈对照**：lm-evaluation-harness 和 BIG-bench 两句取自各自 README（2026-10-20 读），见入口页脚注
- **调研**：主会话读了核心框架约 3000 行，外加 `elsuite/` 下二十问、bugged_tools 两个多轮样例；两轮盘问定下领域、baseline、五条线、设计重心和译名，再写入口篇和五篇细讲

## 计数口径 { #counts }

入口页和「登记」页的几个数，是在上游克隆里数 `evals/registry/evals/*.yaml` 得来的：

- **841 个注册 eval**：带 `class` 字段的条目，也就是能直接跑的全名条目；只写 `id` 的短名（别名）不算
- **502 个只用字符串模板**：`class` 是 `Match`（290）、`Includes`（174）、`FuzzyMatch`（38）的条目
- **61 个模型打分**：`class` 是 `ModelBasedClassify` 的条目
- 另有 684 个不带点的短名，全都只写 `id`、不写 `class`；17 个带点的条目也只写 `id`，是指向别的全名的别名。这两类都不计入

```python title="计数脚本（在上游克隆根目录跑）"
import collections, glob, yaml

by_class = collections.Counter()
for f in glob.glob("evals/registry/evals/*.yaml"):
    for name, spec in (yaml.safe_load(open(f)) or {}).items():
        if "." in name and isinstance(spec, dict) and "class" in spec:
            by_class[spec["class"]] += 1
print(sum(by_class.values()))
for cls, n in by_class.most_common(12):
    print(n, cls)
```

## 实验设置 { #sim }

只读了源码，没有实跑：没装上游的包，没调任何模型，模型用量为零。各细讲页每节只贴源码模版，不放效果块。

文中几处行为判断靠读代码推出，没跑过验证，上游更新后要重新对照：

- Match 不传 `separator`，标准答案 `4` 碰上回答 `42` 判对；Includes 用 `rfind`，`4` 落在 `14` 里判对
- 只给一个被测接口时，模型打分的裁判就是被测模型自己（`classify.py` 取 `completion_fns[-1]`）
- battle 比的是同一个模型对两道题的回答：两份回答都由同一个被测接口采样，上游样本也都是 `input1`、`input2` 两道题
- 二十问按角色改写对话时，eval 插的提示在双方的视角里都成了 user（`format_msg` 里 `is_system_msg` 那一支走不到）
- `hidden_data_fields` 只有 `LocalRecorder` 的构造参数，`build_recorder` 没把它接到命令行
