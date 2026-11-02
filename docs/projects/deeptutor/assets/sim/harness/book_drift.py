"""Book 引擎 · 教材改了，哪几页过期。

跑 deeptutor/book/kb_health.py 的 detect_kb_drift。知识库是临时目录里构造的三份
原始文件，书有四个已生成的页面，各自的 source_anchors 指向不同的文件；然后改掉
其中一份文件，看哪几页被标过期。

KnowledgeBaseManager 和 BookStorage 换成最小的替身：前者只回答「有哪些库、库的
根目录在哪」，后者只交出书脊和页面。哈希、比对、按锚点圈页面全部是上游代码。
"""
import pathlib
import sys
import tempfile
import types

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.book", "deeptutor.knowledge")


class FakeKBManager:
    """替身：一个库，原始文件在 <base_dir>/<库名>/raw/"""

    def __init__(self, base_dir: pathlib.Path, names: list[str]):
        self.base_dir = base_dir
        self._names = names

    def list_knowledge_bases(self):
        return list(self._names)

    def get_metadata(self, name):
        return {"type": "llamaindex"}


manager_mod = types.ModuleType("deeptutor.knowledge.manager")
manager_mod.KnowledgeBaseManager = FakeKBManager
sys.modules["deeptutor.knowledge.manager"] = manager_mod

from deeptutor.book import kb_health  # noqa: E402
from deeptutor.book.models import (  # noqa: E402
    Block,
    BlockStatus,
    BlockType,
    Book,
    Chapter,
    Page,
    PageStatus,
    SourceAnchor,
    Spine,
)

KB = "应用统计学"
root = pathlib.Path(tempfile.mkdtemp(prefix="dt-drift-"))
raw = root / KB / "raw"
raw.mkdir(parents=True)
(raw / "应用统计学.pdf").write_bytes(b"%PDF-1.7 ... 412 pages ...")
(raw / "第8章讲义.md").write_text("## 8.4 p 值的含义\n\np 值是在 H0 为真的前提下……\n", encoding="utf-8")
(raw / "习题答案.docx").write_bytes(b"PK\x03\x04 ... answers ...")
manager = FakeKBManager(root, [KB])


def anchor(ref: str) -> SourceAnchor:
    return SourceAnchor(kind="kb", kb_name=KB, ref=ref)


chapters = [
    Chapter(id="c2", title="两类错误与显著性水平", order=2, source_anchors=[anchor("应用统计学.pdf")]),
    Chapter(id="c3", title="单样本 t 检验", order=3, source_anchors=[anchor("习题答案.docx")]),
    Chapter(id="c4", title="p 值到底说了什么", order=4),
    Chapter(id="c5", title="功效与样本量", order=5),
]
pages = [
    Page(id="pg_c2", book_id="bk_demo", chapter_id="c2", title="两类错误与显著性水平", status=PageStatus.READY),
    Page(id="pg_c3", book_id="bk_demo", chapter_id="c3", title="单样本 t 检验", status=PageStatus.READY),
    Page(
        id="pg_c4",
        book_id="bk_demo",
        chapter_id="c4",
        title="p 值到底说了什么",
        status=PageStatus.READY,
        # 锚点挂在块上：这一页的正文引的是讲义
        blocks=[Block(type=BlockType.SECTION, status=BlockStatus.READY, source_anchors=[anchor("第8章讲义.md")])],
    ),
    Page(
        id="pg_c5",
        book_id="bk_demo",
        chapter_id="c5",
        title="功效与样本量",
        status=PageStatus.READY,
        # 锚点写的是一份库里没有的文件：对不上号
        blocks=[Block(type=BlockType.SECTION, status=BlockStatus.READY, source_anchors=[anchor("功效分析补充.md")])],
    ),
]
spine = Spine(book_id="bk_demo", chapters=chapters)


class FakeStorage:
    def load_spine(self, book_id):
        return spine

    def list_pages(self, book_id):
        return pages


storage = FakeStorage()
book = Book(id="bk_demo", title="假设检验：从直觉到判断", knowledge_bases=[KB], language="zh")

record = {}
lines = []

# 1. 新书第一次检查：没有基线，不算漂移
first = kb_health.detect_kb_drift(book, storage=storage, manager=manager)
record["first_check"] = first.to_dict()
lines.append(f"新书第一次检查：has_drift={first.has_drift}，过期页 {first.stale_page_ids}")

# 2. 编译完成后存下指纹当基线（引擎里由 refresh 写回书的清单）
docs = kb_health.fingerprint_kb_documents(KB, manager=manager)
book.kb_document_fingerprints = {KB: docs}
book.kb_fingerprints = {KB: kb_health.digest_documents(docs)}
record["baseline"] = {"documents": docs, "fingerprint": book.kb_fingerprints[KB]}
lines.append("")
lines.append("基线（每份原始文件一个 sha256）：")
for path, value in docs.items():
    lines.append(f"  {path:<14} {value[:23]}…")
lines.append(f"  整库指纹      {book.kb_fingerprints[KB][:31]}…")

# 3. 什么都没改
same = kb_health.detect_kb_drift(book, storage=storage, manager=manager)
record["unchanged"] = same.to_dict()
lines.append("")
lines.append(f"什么都没改：has_drift={same.has_drift}，过期页 {same.stale_page_ids}")

# 4. 改讲义里的一句
(raw / "第8章讲义.md").write_text(
    "## 8.4 p 值的含义\n\np 值是在 H0 为真的前提下，得到至少这么极端的数据的概率。\n", encoding="utf-8"
)
after = kb_health.detect_kb_drift(book, storage=storage, manager=manager)
record["after_edit"] = after.to_dict()
lines.append("")
lines.append("改了「第8章讲义.md」里的一句之后：")
lines.append(f"  has_drift          {after.has_drift}")
lines.append(f"  changed_kbs        {after.changed_kbs}")
lines.append(f"  changed_documents  {after.changed_documents}")
lines.append(f"  stale_page_ids     {after.stale_page_ids}")
lines.append(f"  fallback           {after.fallback_stale_pages}")
lines.append("")
for page in pages:
    mark = "过期" if page.id in after.stale_page_ids else "不动"
    lines.append(f"  {page.id}  {page.title:<12} {mark}")

out("book-drift", record)
txt("book-drift", "\n".join(lines))
print("\n".join(lines))
