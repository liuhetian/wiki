"""学习空间 · 学习日志每轮只注入「任务」和「上一次」，记录留在工具后面。

跑 deeptutor/services/learning_journal/store.py 的 LearningJournalStore.injection_markdown，
它的结果由 services/session/turns/executor.py 每轮拼进系统 prompt。日志是构造的：
一个学习任务、上一次学到哪、三条已确认的学习记录。再看空日志注入什么。
journal 直接传进去，不读文件。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.learning_journal")

from deeptutor.services.learning_journal.models import (  # noqa: E402
    LearningJournal,
    LearningMission,
    LearningRecord,
    LearningSessionNote,
)
from deeptutor.services.learning_journal.store import LearningJournalStore  # noqa: E402

journal = LearningJournal(
    mission=LearningMission(topic="《应用统计学》第 8 章 假设检验", why="下周课上要讲例 8.3", level="研一"),
    last_session=LearningSessionNote(
        summary="讲清了 p 值是条件概率；α 改成 0.01 时的边界题还会判错",
        next_focus="拒绝域与临界值，然后做习题 8.4",
    ),
    records=[
        LearningRecord(id="r1", title="p 值不是 H0 为真的概率", insight="自己能用灌装线的例子讲出来"),
        LearningRecord(id="r2", title="两类错误的命名", insight="弃真是第一类，取伪是第二类"),
        LearningRecord(id="r3", title="t 统计量", insight="标准误用 s/√n，自由度 n−1"),
    ],
)
store = LearningJournalStore()
injected = store.injection_markdown(journal=journal)
empty = store.injection_markdown(journal=LearningJournal())

lines = ["有内容的日志，这一轮拼进系统 prompt 的是：", "", injected.rstrip(), "", f"三条学习记录：没有注入（{len(journal.records)} 条都留在 learning_status 工具后面）", f"空日志注入的内容：{empty!r}"]
out("space-journal", {"journal": journal.to_dict(), "injected": injected, "empty": empty})
txt("space-journal", "\n".join(lines))
print("\n".join(lines))
