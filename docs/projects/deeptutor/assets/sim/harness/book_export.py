"""Book 引擎 · 块有类型，导出时每种块都有文字投影。

跑 deeptutor/book/export.py 的 render_book_markdown。构造一本两页的中文书：
第 4 章编好了（一个 section、一个 callout、一个 quiz、一组闪卡、一张图），
第 5 章还没编。看导出的 Markdown 里每种块变成什么样，没编的章怎么交代。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.book")

from deeptutor.book.export import render_book_markdown  # noqa: E402
from deeptutor.book.models import Block, BlockStatus, BlockType, Book, Chapter, Page, Spine  # noqa: E402

READY = BlockStatus.READY
book = Book(
    id="bk_demo",
    title="假设检验：从直觉到判断",
    description="用一条灌装线的例子，把第 8 章从直觉讲到判断。",
    knowledge_bases=["应用统计学"],
    language="zh",
)
spine = Spine(book_id="bk_demo", chapters=[Chapter(id="c4", title="p 值到底说了什么"), Chapter(id="c5", title="功效与样本量")])
page4 = Page(
    id="pg_c4",
    chapter_id="c4",
    title="p 值到底说了什么",
    order=4,
    learning_objectives=["用条件概率解释 p 值", "认出三种常见误读"],
    blocks=[
        Block(
            type=BlockType.SECTION,
            status=READY,
            payload={
                "intro": "p 值回答的是一个条件问题。",
                "subsections": [
                    {"heading": "先假定 H0 为真", "body": "在 μ = 50 的前提下，抽到 t ≥ 2.80 或 t ≤ −2.80 的概率约为 0.0098。"},
                    {"heading": "它不是什么", "body": "它不是 H0 为真的概率，也不是效应的大小。"},
                ],
                "key_takeaway": "p 值是 P(数据这么极端 | H0)，不是 P(H0 | 数据)。",
            },
        ),
        Block(
            type=BlockType.CALLOUT,
            status=READY,
            payload={"label": "易错", "body": "p > 0.05 只是证据不够，不等于 H0 为真。", "bridge_text": "一个需要记住的要点。"},
        ),
        Block(
            type=BlockType.QUIZ,
            status=READY,
            title="检查一下",
            payload={
                "questions": [
                    {
                        "question": "例 8.3 改取 α = 0.01，结论是？",
                        "options": {"a": "拒绝 H0", "b": "不拒绝 H0"},
                        "correct_answer": "A",
                        "explanation": "0.0098 < 0.01，仍然拒绝。",
                    }
                ]
            },
        ),
        Block(
            type=BlockType.FLASH_CARDS,
            status=READY,
            title="记忆钩子",
            payload={"cards": [{"front": "第一类错误", "back": "弃真，概率 α"}, {"front": "第二类错误", "back": "取伪，概率 β"}]},
        ),
        Block(
            type=BlockType.FIGURE,
            status=READY,
            title="拒绝域",
            payload={"description": "t(24) 分布，两侧阴影是 |t| > 2.064 的拒绝域，竖线标出 t = 2.80。"},
        ),
        Block(type=BlockType.ANIMATION, status=READY, title="p 值的面积", payload={}),
        Block(type=BlockType.QUIZ, status=BlockStatus.ERROR, title="没生成出来的块", payload={}),
    ],
)
page5 = Page(id="pg_c5", chapter_id="c5", title="功效与样本量", order=5)

md = render_book_markdown(book, spine, [page5, page4])
out("book-export", {"book": book.model_dump(mode="json"), "pages": [page4.model_dump(mode="json"), page5.model_dump(mode="json")], "markdown": md})
txt("book-export", md)
print(md)
