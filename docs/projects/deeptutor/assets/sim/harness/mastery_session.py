"""线 4 · 下一步是算出来的：一条构造的「假设检验」路径，从头走到尾。

每一步都调上游代码改同一份 LearningProgress，然后问 policy.next_objective 下一步做什么：
- 计分题：LearningService._apply_grade（记作答 → 重算掌握分 → 排复习），不经模型
- 概念题的过门：LearningService.record_qualitative_in_memory（导师判学习者的解释）
- 学习者自报已掌握：照 set_learner_mastery_override 往 learner_mastery_overrides 里写一条
- 最后把时钟拨到五天后，重建复习队列，看 next_objective 先派复习
LearningService 不经构造函数实例化，避开 SQLite 存储；这几个方法本身不做 I/O。
作答内容是构造的，判分走 grading.grade_answer（没有模型判定时的路径）。
"""
import pathlib
import sys
import time
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.llm")
sys.modules["deeptutor.services.llm"].complete = None

from deeptutor.learning.models import (  # noqa: E402
    KnowledgePoint,
    KnowledgeType,
    LearnerMasteryOverride,
    LearningModule,
    LearningProgress,
)
from deeptutor.learning.policy import (  # noqa: E402
    find_knowledge_point,
    is_mastered,
    map_summary,
    next_objective,
)
from deeptutor.learning.scheduler import SpacedRepetitionScheduler  # noqa: E402
from deeptutor.learning.service import LearningService  # noqa: E402


def pad(text: str, width: int) -> str:
    w = sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in text)
    return text + " " * max(0, width - w)


def kp(mid, i, name, t):
    return KnowledgePoint(id=f"{mid}_kp{i}", name=name, type=KnowledgeType(t), module_id=mid)


MODULES = [
    LearningModule(
        id="hyp_m0", name="假设与两类错误", order=0,
        knowledge_points=[
            kp("hyp_m0", 0, "原假设与备择假设", "concept"),
            kp("hyp_m0", 1, "第一类与第二类错误", "concept"),
            kp("hyp_m0", 2, "显著性水平 α 的含义", "memory"),
        ],
    ),
    LearningModule(
        id="hyp_m1", name="检验统计量与 p 值", order=1,
        knowledge_points=[
            kp("hyp_m1", 0, "单样本 t 统计量", "procedure"),
            kp("hyp_m1", 1, "p 值不是 H0 为真的概率", "concept"),
            kp("hyp_m1", 2, "拒绝域与临界值", "procedure"),
        ],
    ),
]

service = LearningService.__new__(LearningService)
scheduler = SpacedRepetitionScheduler()
progress = LearningProgress(book_id="hyp", name="假设检验")
service.init_modules(progress, MODULES)

log: list[dict] = []
lines: list[str] = []
q_counter = 0


def nxt(now=None):
    return next_objective(progress, now=now)


def show(event: str, kp_id: str | None, now=None):
    step = nxt(now)
    if kp_id:
        k, _, _ = find_knowledge_point(progress, kp_id)
        level = progress.mastery_levels.get(kp_id, 0.0)
        gate = f"掌握分 {level:.3f}{'，已过门' if is_mastered(progress, k) else ''}"
    else:
        gate = ""
    nxt_text = f"{step.action} · {step.knowledge_point_name}" if step.knowledge_point_name else step.action
    lines.append(f"{pad(event, 48)}{pad(gate, 24)}→ {nxt_text}")
    log.append({"event": event, "kp": kp_id, "mastery": progress.mastery_levels.get(kp_id) if kp_id else None,
                "next": step.to_dict()})


def grade(kp_id: str, answer: str, expected: str, qtype="short"):
    global q_counter
    q_counter += 1
    module_id = kp_id.rsplit("_kp", 1)[0]
    ok = service._apply_grade(
        progress,
        question_id=f"q{q_counter}",
        knowledge_point_id=kp_id,
        module_id=module_id,
        user_answer=answer,
        expected_answer=expected,
        question_type=qtype,
        scheduler=scheduler,
    )
    return ok


def explain(kp_id: str, passed: bool, words: str):
    LearningService.record_qualitative_in_memory(progress, kp_id, passed=passed, evidence=words, scheduler=scheduler)


show("新路径，什么都没做", None)

explain("hyp_m0_kp0", True, "H0 是默认成立、要拿证据去推翻的说法，H1 是想证明的那一边。")
show("讲清了原假设与备择假设（导师判过）", "hyp_m0_kp0")
explain("hyp_m0_kp1", True, "H0 为真却拒绝了是弃真，H0 为假却没拒绝是取伪。")
show("讲清了两类错误（导师判过）", "hyp_m0_kp1")
for i in range(3):
    ok = grade("hyp_m0_kp2", "第一类错误的概率上限", "第一类错误的概率上限")
    show(f"α 的含义 第 {i + 1} 题 {'对' if ok else '错'}", "hyp_m0_kp2")

for i, ans in enumerate(["2.80", "2.3", "2.80", "2.80", "2.80", "2.80", "2.80"]):
    ok = grade("hyp_m1_kp0", ans, "2.80")
    show(f"t 统计量 第 {i + 1} 题 答「{ans}」{'对' if ok else '错'}", "hyp_m1_kp0")

for i in range(3):
    ok = grade("hyp_m1_kp1", "B", "B", "choice")
    show(f"p 值含义 选择题 第 {i + 1} 题 {'对' if ok else '错'}", "hyp_m1_kp1")
explain("hyp_m1_kp1", False, "p 值就是原假设成立的可能性。")
show("让学习者讲 p 值，讲错了", "hyp_m1_kp1")
explain("hyp_m1_kp1", True, "先假定 H0 为真，再看这么极端的数据有多罕见；它不是 H0 为真的概率。")
show("重讲一遍，讲对了", "hyp_m1_kp1")

ok = grade("hyp_m1_kp0", "2.3", "2.80")
show("t 统计量又考一题，答错", "hyp_m1_kp0")
for i in range(5):
    grade("hyp_m1_kp0", "2.80", "2.80")
show("再连对五题", "hyp_m1_kp0")

progress.learner_mastery_overrides["hyp_m1_kp2"] = LearnerMasteryOverride(
    knowledge_point_id="hyp_m1_kp2", note="上学期学过，查表没问题"
)
show("点「我已经掌握，直接放行」：拒绝域与临界值", "hyp_m1_kp2")

summary = map_summary(progress)
lines.append("")
lines.append(f"map_summary：counts = {summary['counts']}，complete = {summary['complete']}")
for m in summary["modules"]:
    lines.append(f"  {m['name']}  {m['mastered']}/{m['total']}")
    for k in m["knowledge_points"]:
        src = {"system": "系统判", "learner": "自报"}.get(k["mastery_source"], "—")
        lines.append(f"    {pad(k['name'], 26)}{pad(k['type'], 11)}{pad(k['status'], 10)}{k['mastery']:<7}{src}")

future = time.time() + 5 * 86400
progress.review_queue = scheduler.build_review_queue(progress, now=future)
step = next_objective(progress, now=future)
lines.append("")
lines.append("把时钟拨到五天后，重建复习队列：")
for task in progress.review_queue[:4]:
    k, _, _ = find_knowledge_point(progress, task.knowledge_point_id)
    lines.append(f"  {pad(k.name, 26)}遗忘风险 {task.forgetting_risk:.2f}  {task.reason}")
lines.append(f"next_objective → {step.action} · {step.knowledge_point_name}")

txt("mastery-session", "\n".join(l.rstrip() for l in lines))
out("mastery-session", {"steps": log, "map": summary, "review_at_plus_5d": {
    "queue": [t.model_dump(mode="json") for t in progress.review_queue],
    "next": step.to_dict(),
}})
print("\n".join(lines))
