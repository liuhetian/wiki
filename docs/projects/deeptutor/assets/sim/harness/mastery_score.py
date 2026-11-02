"""线 4 · 掌握分：最近五次加权，答得少有封顶。

跑 deeptutor/learning/mastery.py 的 compute_mastery，作答序列是构造的；
再跑 LearningService.calculate_mastery，看哪些作答不算数（借了提示的、作废的）。
LearningService 不经构造函数实例化，避开它的 SQLite 存储，calculate_mastery 本身不做 I/O。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.llm")
sys.modules["deeptutor.services.llm"].complete = None

from deeptutor.learning.mastery import compute_mastery  # noqa: E402
from deeptutor.learning.models import LearningProgress, QuizAttempt  # noqa: E402
from deeptutor.learning.policy import QUANTITATIVE_GATE  # noqa: E402
from deeptutor.learning.models import KnowledgeType  # noqa: E402
from deeptutor.learning.service import LearningService  # noqa: E402

import unicodedata  # noqa: E402


def pad(text: str, width: int) -> str:
    """按显示宽度补空格：中文字占两格。"""
    w = sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in text)
    return text + " " * max(0, width - w)


GATE = QUANTITATIVE_GATE[KnowledgeType.PROCEDURE]
SEQS = [
    ("答对 1 次", [True]),
    ("答对 2 次", [True, True]),
    ("答对 3 次", [True, True, True]),
    ("对、错", [True, False]),
    ("对、错、对、对、对", [True, False, True, True, True]),
    ("对、错、对、对、对、对", [True, False, True, True, True, True]),
    ("对、错、对、对、对、对、对", [True, False, True, True, True, True, True]),
    ("连对 4 次后错 1 次", [True, True, True, True, False]),
    ("对、半对、对", [True, 0.5, True]),
]
rows = []
lines = [f"{pad('作答（从早到晚）', 30)}掌握分  过 {GATE} 的门？"]
for label, seq in SEQS:
    score = compute_mastery(seq)
    rows.append({"label": label, "seq": seq, "score": score, "passes": score >= GATE})
    lines.append(f"{pad(label, 30)}{score:6.3f}  {'过' if score >= GATE else '—'}")

# calculate_mastery：借了提示的、作废的作答都不进计分
progress = LearningProgress(book_id="hyp")
kp = "hyp_m1_kp0"
attempts = [
    QuizAttempt(question_id="q1", knowledge_point_id=kp, is_correct=True),
    QuizAttempt(question_id="q2", knowledge_point_id=kp, is_correct=True, independent=False),
    QuizAttempt(question_id="q3", knowledge_point_id=kp, is_correct=False, voided=True, void_reason="答案键写错"),
    QuizAttempt(question_id="q4", knowledge_point_id=kp, is_correct=True),
]
progress.quiz_attempts.extend(attempts)
service = LearningService.__new__(LearningService)
level = service.calculate_mastery(progress, kp)
lines.append("")
lines.append("同一个知识点的四次作答：对 / 对（借了提示）/ 错（题目作废）/ 对")
lines.append(f"calculate_mastery 只数独立且没作废的两次「对、对」→ {level:.3f}")

txt("mastery-score", "\n".join(l.rstrip() for l in lines))
out("mastery-score", {"gate": GATE, "sequences": rows, "filtered": {"attempts": [a.model_dump(mode="json") for a in attempts], "mastery": level}})
print("\n".join(lines))
