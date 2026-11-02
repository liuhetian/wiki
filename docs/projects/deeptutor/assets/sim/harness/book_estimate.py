"""Book 引擎 · 确认书脊前的成本估算。

跑 deeptutor/book/estimate.py 的 chapter_basis：每种章节类型一章要几块、多少字、
多少秒，数字直接从页面规划器的模板表算出来。再照前端 SpineEditor.tsx 213-228 的
加法，把构造的 5 章书脊（统计学第 8 章「假设检验」）汇总成书脊下方那行估算。

page_planner 在模块顶层 import 了写作器和提示词加载器，chapter_basis 用不到它们，
这里登记成空模块，免得把 LLM 客户端拉进来。
"""
import math
import pathlib
import sys
import types

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.book.agents", "deeptutor.book.blocks")
for name, attrs in {
    "deeptutor.book.blocks._llm_writer": {"llm_json": None},
    "deeptutor.book.blocks._prompts": {"get_book_prompt": None, "load_book_prompts": None},
}.items():
    mod = types.ModuleType(name)
    mod.__dict__.update(attrs)
    sys.modules[name] = mod

from deeptutor.book.estimate import chapter_basis  # noqa: E402
from deeptutor.book.models import DEPTH_WORD_SCALE  # noqa: E402

# 构造的书脊：标题取自 demo 的数据，章节类型是按内容挑的
SPINE = [
    ("为什么要做假设检验", "concept"),
    ("两类错误与显著性水平", "theory"),
    ("单样本 t 检验", "derivation"),
    ("p 值到底说了什么", "theory"),
    ("功效与样本量", "practice"),
]

record = {"depth_scale": {k.value: v for k, v in DEPTH_WORD_SCALE.items()}, "basis": {}, "spine": {}}
lines = ["每种章节类型一章的成本（standard 深度）：", ""]
lines.append(f"{'类型':<12}{'块数':>6}{'字数':>8}{'秒数':>8}")
for depth in ("brief", "standard", "deep"):
    basis = chapter_basis(depth)
    record["basis"][depth] = basis
    if depth == "standard":
        for ctype, cost in basis.items():
            lines.append(f"{ctype:<12}{int(cost['blocks']):>6}{int(cost['words']):>8}{int(cost['seconds']):>8}")

lines += ["", "构造的 5 章书脊，照前端的加法汇总（字数取整到百，分钟向上取整）：", ""]
for depth in ("brief", "standard", "deep"):
    basis = record["basis"][depth]
    words = sum(basis[ctype]["words"] for _, ctype in SPINE)
    seconds = sum(basis[ctype]["seconds"] for _, ctype in SPINE)
    shown = f"{len(SPINE)} 章 · ~{round(words / 100) * 100} 字 · ~{math.ceil(seconds / 60)} 分钟"
    record["spine"][depth] = {"words": words, "seconds": seconds, "shown": shown}
    lines.append(f"{depth:<9}{shown}")

out("book-estimate", record)
txt("book-estimate", "\n".join(lines))
print("\n".join(lines))
