"""线 4 · 判分不经模型的嘴：答案键存在服务端，先精确比对，比不上才交给模型判。

跑三样，题目和作答都是构造的：
1. semantic_assessment.exact_verdict：照服务端存的答案键判（选择题认「B」「选 B」「答案是 B」和选项原文）
2. semantic_assessment.Verdict.receipt：模型判定的回执，置信度不到 0.8 不算数
3. grading.grade_answer：拿不到判定时 _apply_grade 退回的确定性比对
"""
import pathlib
import sys
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.llm")
sys.modules["deeptutor.services.llm"].complete = None

from deeptutor.learning.grading import grade_answer  # noqa: E402
from deeptutor.learning.models import PendingOption, PendingQuestion  # noqa: E402
from deeptutor.learning.semantic_assessment import Verdict, exact_verdict  # noqa: E402


def pad(text: str, width: int) -> str:
    w = sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in text)
    return text + " " * max(0, width - w)


record: dict = {}
lines: list[str] = []

# 1. 精确比对
choice = PendingQuestion(
    question_id="q-alpha",
    knowledge_point_id="hyp_m0_kp2",
    prompt="在 α = 0.05 下拒绝了 H0。下面哪一种说法是对的？",
    question_type="choice",
    expected_answer="B",
    options=[
        PendingOption(label="A", body="H0 为假的概率是 95%"),
        PendingOption(label="B", body="若 H0 为真，照这个规则检验，长期约有 5% 的时候会错误地拒绝它"),
        PendingOption(label="C", body="备择假设 H1 一定成立"),
        PendingOption(label="D", body="这次检验的 p 值恰好等于 0.05"),
    ],
    explanation="α 是事先给定的第一类错误概率上限。",
)
short = PendingQuestion(
    question_id="q-name",
    knowledge_point_id="hyp_m0_kp1",
    prompt="第一类错误又称什么错误？",
    question_type="short",
    expected_answer="弃真错误",
    accepted_answers=["弃真"],
)
lines.append("1) exact_verdict：照服务端存的答案键判")
cases = [
    (choice, "b"),
    (choice, "选 B"),
    (choice, "若 H0 为真，照这个规则检验，长期约有 5% 的时候会错误地拒绝它"),
    (choice, "A 或 B 吧"),
    (choice, "A"),
    (short, "弃真"),
    (short, "取伪错误"),
]
record["exact"] = []
for q, ans in cases:
    v = exact_verdict(q, ans)
    shown = ans if len(ans) <= 16 else ans[:15] + "…"
    if v is None:
        res = "None → 交给模型判"
    else:
        res = f"{v.result}（置信度 {v.confidence:g}）"
    record["exact"].append({"question": q.question_id, "answer": ans, "verdict": v.model_dump() if v else None})
    lines.append(f"   {pad(q.question_id, 9)}{pad('「' + shown + '」', 38)}{res}")

# 2. 模型判定的回执
lines.append("")
lines.append("2) Verdict.receipt：模型判定只有置信度 ≥ 0.8 才算数")
verdicts = [
    Verdict(result="correct", confidence=0.92, feedback="说到了「先假定 H0 为真」这一条件。"),
    Verdict(result="incorrect", confidence=0.75, feedback="像是把 p 值当成了 H0 为真的概率，但表述含糊。"),
]
record["receipts"] = []
for v in verdicts:
    r = v.receipt()
    record["receipts"].append({"verdict": v.model_dump(), "receipt": r})
    lines.append(f"   {v.result:<10} 置信度 {v.confidence:<5} → result={r['result']}, final={r['final']}, is_correct={r['is_correct']}")

# 3. 确定性比对
lines.append("")
lines.append("3) grade_answer：拿不到判定时的确定性比对")
expected_open = "H0 为真，同样极端或更极端，概率"
g_cases = [
    ("choice", " b ", "B"),
    ("short", "弃真错误。", "弃真错误"),
    ("short", "弃真", "弃真错误"),
    ("open", "在 H0 为真的前提下，得到同样极端或更极端结果的概率", expected_open),
    ("open", "p 值就是 H0 为真的概率", expected_open),
]
record["grade_answer"] = []
for qtype, user, expected in g_cases:
    ok = grade_answer(user, expected, qtype)
    record["grade_answer"].append({"type": qtype, "user": user, "expected": expected, "correct": ok})
    lines.append(f"   {pad(qtype, 7)}{pad('「' + user + '」', 52)}{'对' if ok else '错'}")
lines.append(f"   （open 题的答案键是「{expected_open}」，按逗号拆成三个关键词，命中六成算对）")

txt("mastery-grade", "\n".join(l.rstrip() for l in lines))
out("mastery-grade", record)
print("\n".join(lines))
