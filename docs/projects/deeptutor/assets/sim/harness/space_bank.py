"""学习空间 · 题库是一张表，答错的题自己进复习队列。

所有出题的地方（出题模式、精通路径、书里的测验、沉浸阅读）都经 record_assessment
写进同一张 notebook_entries。每日练习不另存一份题，而是在这张表上挂触发器：
答错、并且判过分的题，自动在 practice_review_state 里排一条、明天到期。

这里建一个内存 SQLite：notebook_entries 的建表语句原样取自
deeptutor/services/session/sqlite_store.py（从源码里截出来执行），触发器和复习表
由 deeptutor/services/practice/storage.py 的 initialize_practice 建。题目和作答是构造的。
"""
import pathlib
import re
import sqlite3
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.practice")

from deeptutor.services.practice.storage import initialize_practice  # noqa: E402

source = (clone / "deeptutor/services/session/sqlite_store.py").read_text(encoding="utf-8")
ddl = re.search(r"CREATE TABLE IF NOT EXISTS notebook_entries \(.*?\n\s*\);", source, re.S).group(0)

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("PRAGMA foreign_keys = ON")
conn.execute("CREATE TABLE sessions (id TEXT PRIMARY KEY)")  # notebook_entries 的外键指向它
conn.executescript(ddl)
initialize_practice(conn)

T0 = 1_761_700_000.0  # 构造的「现在」
rows = [
    # (来源, 题目, 用户答案, is_correct, result, 精通路径的知识点)
    ("deep_question", "改取 α = 0.01，例 8.3 的结论是？", "不拒绝 H0", 0, "incorrect", ""),
    ("mastery_path", "用一句话说 p 值是什么", "H0 为真时得到这么极端数据的概率", 1, "correct", "m2-p2"),
    ("book", "第一类错误又称____错误", "弃真", 1, "correct", ""),
    ("immersive_reading", "这一页说 α 在什么时候给定？", "（还没判）", 0, "ungraded", ""),
]
for i, (src, q, ans, ok, result, kp) in enumerate(rows):
    conn.execute(
        """INSERT INTO notebook_entries (origin_type, origin_ref, question_id, question, user_answer,
               source, is_correct, result, knowledge_point_id, created_at, updated_at)
           VALUES ('conversation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (f"sess_{i}", f"q{i}", q, ans, src, ok, result, kp, T0 + i, T0 + i),
    )


def snapshot(title: str) -> list[str]:
    out_lines = [title]
    for r in conn.execute(
        """SELECT n.id, n.source, n.is_correct, n.result, r.due_at, r.interval_days
           FROM notebook_entries n LEFT JOIN practice_review_state r ON r.entry_id = n.id ORDER BY n.id"""
    ):
        due = f"排进复习，{(r['due_at'] - T0) / 86400:.1f} 天后到期" if r["due_at"] else "不进复习"
        out_lines.append(f"  #{r['id']} {r['source']:<18} {r['result']:<10} {due}")
    return out_lines


lines = snapshot("四道题写进题库之后：")
# 书里那道题后来被判错（比如 AI 判分改了结论）
conn.execute("UPDATE notebook_entries SET is_correct = 0, result = 'incorrect', updated_at = ? WHERE id = 3", (T0 + 3600,))
lines.append("")
lines += snapshot("#3 后来改判为错之后：")

state = [dict(r) for r in conn.execute("SELECT * FROM practice_review_state ORDER BY entry_id")]
triggers = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name")]
lines.append("")
lines.append(f"挂在 notebook_entries 上的触发器：{', '.join(triggers)}")

out("space-bank", {"notebook_entries_ddl": ddl, "practice_review_state": state, "triggers": triggers})
txt("space-bank", "\n".join(lines))
print("\n".join(lines))
