"""线 3 · 出题：模型每写完一题，程序先归一化、再按题型查格式，查出问题才花一次模型调用去修。

agents/question/pipeline.py 一导入就拉起模型客户端、提示词管理、沙箱。按细讲的规矩
「把用到的几个函数原样抠出来跑」：用 ast 从原文里取出 QuestionType、几个常量、
QuizTemplate，和 QuestionPipeline 的 _parse_quiz_payload / _normalize_quiz_payload /
_collect_quiz_issues 三个方法的原文，拼进一个小类里执行。喂的是构造的模型输出。
"""
import ast
import json
import pathlib
import re
import sys
import textwrap
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, txt

clone = open_clone()
path = clone / "deeptutor/agents/question/pipeline.py"
source = path.read_text(encoding="utf-8")
tree = ast.parse(source)
src_lines = source.splitlines()

TOP_NAMES = {"QuestionType", "QuizTemplate", "_VALID_QUESTION_TYPES", "_TYPES_WITH_OPTIONS", "_VALID_DIFFICULTIES", "_CHOICE_KEYS", "_FILL_IN_BLANK_TOKEN", "_CONCEPT_ANSWERS"}
METHODS = {"_parse_quiz_payload", "_normalize_quiz_payload", "_collect_quiz_issues"}


def segment(node) -> str:
    start = min([node.lineno] + [d.lineno for d in getattr(node, "decorator_list", [])])
    return "\n".join(src_lines[start - 1 : node.end_lineno])


chunks, methods, taken = [], [], []
for node in tree.body:
    name = getattr(node, "name", None)
    if name is None and isinstance(node, (ast.Assign, ast.AnnAssign)):
        target = node.targets[0] if isinstance(node, ast.Assign) else node.target
        name = getattr(target, "id", None)
    if name in TOP_NAMES:
        chunks.append(segment(node))
        taken.append(f"{name} {node.lineno}-{node.end_lineno}")
    if isinstance(node, ast.ClassDef) and node.name == "QuestionPipeline":
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name in METHODS:
                methods.append(textwrap.indent(textwrap.dedent(segment(item)), "    "))
                taken.append(f"QuestionPipeline.{item.name} {item.lineno}-{item.end_lineno}")

code = "\n\n".join(chunks) + "\n\n\nclass P:\n" + "\n\n".join(methods) + "\n"
ns: dict[str, Any] = {"json": json, "re": re, "Any": Any, "dataclass": dataclass, "field": field, "StrEnum": StrEnum}
exec(compile(code, f"{path}（抠出的片段）", "exec"), ns)
P, QuizTemplate = ns["P"], ns["QuizTemplate"]

CASES = [
    (
        "选择题，模型套了 ```json 围栏，正确答案写成了选项原文",
        QuizTemplate("q1", "显著性水平的含义", "choice", "medium"),
        '好的，题目如下：\n```json\n{"question": "在 α = 0.05 下拒绝了 H0。下面哪一种说法是对的？", '
        '"options": {"a": "H0 为假的概率是 95%", "B": "若 H0 为真，照这个规则检验，长期约有 5% 的时候会错误地拒绝它", '
        '"C": "备择假设 H1 一定成立", "D": "这次检验的 p 值恰好等于 0.05"}, '
        '"correct_answer": "若 H0 为真，照这个规则检验，长期约有 5% 的时候会错误地拒绝它", '
        '"explanation": "α 是事先给定的第一类错误概率上限。"}\n```',
    ),
    (
        "选择题，只给了三个选项",
        QuizTemplate("q2", "α 改成 0.01", "choice", "hard"),
        '{"question": "例 8.3 若改取 α = 0.01，结论是？", "options": {"A": "拒绝 H0", "B": "不拒绝 H0", "C": "无法判断"}, '
        '"correct_answer": "A", "explanation": "0.0098 < 0.01。"}',
    ),
    (
        "判断题，答案写成「对」",
        QuizTemplate("q3", "p 值的含义", "concept", "easy"),
        '{"question": "p 值是在 H0 为真的前提下算出来的。", "correct_answer": "对", "explanation": "p 值是条件概率。"}',
    ),
    (
        "填空题，题干里没有 ____，也没写解析",
        QuizTemplate("q4", "两类错误的名字", "fill_in_blank", "easy"),
        '{"question": "第一类错误又称什么错误？", "correct_answer": "弃真"}',
    ),
]

rows, lines = [], []
for title, tpl, raw in CASES:
    payload = P._parse_quiz_payload(raw)
    norm = P._normalize_quiz_payload(tpl, payload)
    issues = P._collect_quiz_issues(tpl, norm)
    rows.append({"case": title, "template": tpl.__dict__, "raw": raw, "normalized": norm, "issues": issues})
    lines.append(f"【{title}】")
    if norm.get("options"):
        lines.append("  选项键：" + "、".join(norm["options"].keys()))
    lines.append(f"  correct_answer → {norm['correct_answer']!r}")
    lines.append("  " + ("格式通过，直接发给前端" if not issues else "查出问题，进修复：" + "、".join(issues)))
    lines.append("")

out("modes-quiz-check", {"extracted": taken, "cases": rows})
txt("modes-quiz-check", "\n".join(lines))
print("抠出的片段：" + "；".join(taken))
print("\n".join(lines))
