"""Book 引擎 · 阅读进度和弱章从最近一次作答重算。

跑 deeptutor/book/progress.py 的 record_attempt / mark_visited / completion_ratio。
构造的作答序列：第 4 章同一道题先答错再答对，第 2 章一道题答对后又重复答对一次，
第 3 章一道题答错。每一步之后看 score 和 weak_chapters。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.book")

from deeptutor.book import progress as P  # noqa: E402
from deeptutor.book.models import Progress  # noqa: E402

page_to_chapter = {"pg_c2": "c2", "pg_c3": "c3", "pg_c4": "c4", "pg_c5": "c5"}
prog = Progress(book_id="bk_demo")

steps = [
    ("pg_c4", "q1", "B", False, "第 4 章 q1 答错（以为 α=0.01 时不拒绝）"),
    ("pg_c2", "q1", "B", True, "第 2 章 q1 答对"),
    ("pg_c2", "q1", "B", True, "第 2 章 q1 再答对一次"),
    ("pg_c3", "q2", "C", False, "第 3 章 q2 答错"),
    ("pg_c4", "q1", "A", True, "第 4 章 q1 改对"),
]
rows = []
lines = [f"{'作答':<28}{'score':>6}  weak_chapters"]
for page, qid, answer, ok, label in steps:
    P.record_attempt(
        prog,
        page_id=page,
        block_id=f"blk_{page}_quiz",
        question_id=qid,
        user_answer=answer,
        is_correct=ok,
        page_to_chapter=page_to_chapter,
    )
    rows.append({"step": label, "score": prog.score, "weak_chapters": list(prog.weak_chapters)})
    lines.append(f"{label:<28}{prog.score:>6}  {prog.weak_chapters}")

for page in ["pg_c2", "pg_c3", "pg_c4", "pg_c4"]:
    P.mark_visited(prog, page)
ratio = P.completion_ratio(prog, total_pages=6)
lines.append("")
lines.append(f"翻过 pg_c2、pg_c3、pg_c4（pg_c4 看了两遍），全书 6 页：完成度 {ratio:.2f}，visited={prog.visited_page_ids}")

out("book-progress", {"steps": rows, "visited": prog.visited_page_ids, "completion": ratio, "progress": prog.model_dump(mode="json")})
txt("book-progress", "\n".join(lines))
print("\n".join(lines))
