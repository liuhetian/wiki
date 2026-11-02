"""学习空间 · 每日练习的间隔：SM-2 式的冷启动规则。

跑 deeptutor/services/practice/scheduler.py 的 schedule。四串构造的评分序列，
每次评分后把返回的状态喂回去，看间隔、ease、连对次数怎么走：
一直答「掌握了」、中途「再练」一次、一直「简单」（看 365 天封顶和 ease 上限 3.0）、
一直「再练」（看 ease 下限 1.3）。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.practice")

from deeptutor.services.practice.scheduler import DAY, schedule  # noqa: E402

LABEL = {"again": "再练", "hard": "困难", "good": "掌握了", "easy": "简单"}
SEQUENCES = {
    "一直答「掌握了」": ["good"] * 6,
    "第三次「再练」": ["good", "good", "again", "good", "good"],
    "一直「简单」": ["easy"] * 9,
    "一直「再练」": ["again"] * 7,
}

record = {}
lines = []
for name, ratings in SEQUENCES.items():
    state: dict = {}  # 新错题：触发器只建了 due_at，间隔、ease 取默认 1 天、2.5
    now = 1_761_700_000.0
    rows = []
    lines.append(name)
    for rating in ratings:
        state = schedule(state, rating, now)
        rows.append(dict(state, rating=rating))
        interval = state["interval_days"]
        shown = f"{interval * 1440:.0f} 分钟" if interval < 1 else f"{interval:g} 天"
        lines.append(f"  {LABEL[rating]:<4} → 间隔 {shown:<10} ease {state['ease']:.2f}  连对 {state['streak']}  遗忘 {state['lapses']}")
        now = state["due_at"]  # 到期那一刻来复习
    record[name] = rows
    lines.append("")

out("space-practice", record)
txt("space-practice", "\n".join(lines))
print("\n".join(lines))
