"""线 4 · 间隔复习：稳定度怎么长、怎么掉，下一次什么时候考。

跑 deeptutor/learning/scheduler.py 的 SpacedRepetitionScheduler，时间戳全部显式给出
（从一个固定的起点往后数天数），作答结果是构造的：
1. 四种知识点的第一次复习间隔
2. 「单样本 t 统计量」（procedure）每次到期就考，中间插一次当场重复和一次忘记
3. 同一串作答，目标记住率 0.9 和 0.8 排出来的间隔对比（replay）
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.llm")
sys.modules["deeptutor.services.llm"].complete = None

from deeptutor.learning.models import KnowledgeType, LearningEvidence  # noqa: E402
from deeptutor.learning.scheduler import INTERVAL_SEQUENCES, SpacedRepetitionScheduler  # noqa: E402

DAY = 86400.0
T0 = 1_790_000_000.0  # 固定起点，让输出可重跑
sched = SpacedRepetitionScheduler()
record: dict = {}
lines: list[str] = []

lines.append("1) 第一次复习排在多久以后（get_initial_state）")
record["initial"] = {}
for kt in KnowledgeType:
    st = sched.get_initial_state(kt, now=T0)
    gap = (st.next_review_at - T0) / DAY
    record["initial"][kt.value] = {"seed": INTERVAL_SEQUENCES[kt], "first_due_days": gap, "stability": st.stability}
    lines.append(f"   {kt.value:<10} 种子间隔 {str(INTERVAL_SEQUENCES[kt]):<24} 第一次 {gap:5.2f} 天后  稳定度 {st.stability:5.2f} 天")

lines.append("")
lines.append("2) procedure「单样本 t 统计量」，每次到期就考")
lines.append("   时刻（天）  结果      考前记得住   稳定度（天）  难度   下次在几天后")
kt = KnowledgeType.PROCEDURE
st = sched.get_initial_state(kt, now=T0)
plan = [
    ("第一次答", 0.0, "correct"),
    ("五分钟后再答一题", 5 / 1440, "correct"),
    ("到期再考", None, "correct"),
    ("到期再考", None, "correct"),
    ("到期再考，忘了", None, "incorrect"),
    ("隔一天补考", "+1", "correct"),
    ("到期再考", None, "correct"),
]
record["procedure"] = []
moment = T0
for label, when, result in plan:
    if when is None:
        moment = st.next_review_at
    elif when == "+1":
        moment = moment + DAY
    else:
        moment = T0 + when * DAY
    recall = sched.retrievability(st, now=moment)
    ev = LearningEvidence(knowledge_point_id="hyp_m1_kp0", timestamp=moment, assessment_type="review", result=result)
    sched.schedule_review(st, kt, ev, now=moment)
    gap = (st.next_review_at - moment) / DAY
    row = {
        "label": label, "day": (moment - T0) / DAY, "result": result, "recall_before": recall,
        "stability": st.stability, "difficulty": st.difficulty, "next_in_days": gap, "lapses": st.lapse_count,
    }
    record["procedure"].append(row)
    mark = "对" if result == "correct" else "错"
    lines.append(
        f"   {row['day']:8.2f}    {mark}  {recall:10.0%}  {st.stability:12.2f}  {st.difficulty:5.2f}  {gap:10.2f}   {label}"
    )

lines.append("")
lines.append("3) 同一串作答，目标记住率不同（replay）")
evidence = [
    LearningEvidence(knowledge_point_id="k", timestamp=T0 + d * DAY, assessment_type="review", result="correct")
    for d in (0, 3, 9, 25)
]
record["retention"] = {}
for target in (0.9, 0.8):
    s2 = sched.replay(kt, evidence, desired_retention=target)
    gap = (s2.next_review_at - evidence[-1].timestamp) / DAY
    record["retention"][str(target)] = {"stability": s2.stability, "next_in_days": gap}
    lines.append(f"   目标 {target:.0%}：第 0、3、9、25 天各答对一次后，稳定度 {s2.stability:6.2f} 天，下次在 {gap:6.2f} 天后")

txt("mastery-schedule", "\n".join(l.rstrip() for l in lines))
out("mastery-schedule", record)
print("\n".join(lines))
