"""线 1 · 一次检索用哪种模式：调用时指定 > 库自己的设置 > 引擎卡的默认 > 引擎内置默认。

用 DeepTutor 的 resolve_kb_mode，在临时目录写一份构造的 kb_config.json：
「应用统计学」库设成 local，LightRAG 引擎卡的全局默认设成 mix。
LightRAG 支持 naive / local / global / hybrid / mix，内置默认 hybrid（pipelines/lightrag/config.py）。
"""
import json
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.services.rag.pipelines")
from deeptutor.services.rag.pipelines.modes import resolve_kb_mode  # noqa: E402

SUPPORTED = ("naive", "local", "global", "hybrid", "mix")
CONFIG = {
    "knowledge_bases": {"应用统计学": {"search_mode": "local"}, "第8章讲义": {"search_mode": "bogus"}},
    "defaults": {"provider_modes": {"lightrag": "mix"}},
}
CASES = [
    ("这次调用指定 global", "应用统计学", "global"),
    ("这次调用指定了引擎不认的 fast", "应用统计学", "fast"),
    ("不指定，库设了 local", "应用统计学", None),
    ("不指定，库设了引擎不认的 bogus", "第8章讲义", None),
    ("不指定，库没设", "习题答案", None),
]

def pad(text: str, width: int) -> str:
    """按显示宽度补空格：中文算两格。"""
    import unicodedata

    w = sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)
    return text + " " * max(0, width - w)


rows = []
with tempfile.TemporaryDirectory() as tmp:
    base = pathlib.Path(tmp)
    (base / "kb_config.json").write_text(json.dumps(CONFIG, ensure_ascii=False), encoding="utf-8")
    for title, kb, explicit in CASES:
        got = resolve_kb_mode(base, kb, "lightrag", explicit=explicit, supported=SUPPORTED, default="hybrid")
        rows.append({"case": title, "kb": kb, "explicit": explicit, "mode": got})
    without = resolve_kb_mode(base / "nope", "应用统计学", "lightrag", supported=SUPPORTED, default="hybrid")
    rows.append({"case": "连 kb_config.json 都没有", "kb": "应用统计学", "explicit": None, "mode": without})

lines = ["构造的 kb_config.json：「应用统计学」库 search_mode=local；LightRAG 全局默认 mix；内置默认 hybrid", ""]
for r in rows:
    lines.append(f"  {pad(r['case'], 32)} → {r['mode']}")
out("knowledge-mode", {"config": CONFIG, "results": rows})
txt("knowledge-mode", "\n".join(lines))
print("\n".join(lines))
