"""线 1 · 检索好不好，拿一套题打分。

`deeptutor kb eval` 读一份 JSONL 题集（{"query": …, "gold": [...]}），每题检索一次，
看前 k 段命中了哪些标准段落，再算 Recall / Precision / nDCG / MRR / Hit / MAP。
这里跳过真检索：三道题的排序结果是构造的（每一名写它覆盖了哪几条标准段落），
打分用 DeepTutor 的 rag/eval/metrics.py 原样计算。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.services.rag.eval")
from deeptutor.services.rag.eval import metrics  # noqa: E402

K = 5
# 每题：标准段落几条；检索结果前 5 名各覆盖了哪几条（下标）
CASES = [
    {
        "id": "q1",
        "query": "p 值是什么意思",
        "gold": ["p.248 第 1 段：定义", "p.248 第 2 段：不是 H0 为真的概率"],
        "ranking": [{0}, {0}, set(), {1}, set()],
        "note": "第 1、2 名引的是同一段，第 4 名才拿到第二条",
    },
    {
        "id": "q2",
        "query": "第一类错误是什么",
        "gold": ["p.236 第 1 段：弃真错误"],
        "ranking": [set(), set(), {0}, set(), set()],
        "note": "唯一一条标准段落排在第 3",
    },
    {
        "id": "q3",
        "query": "检验的功效怎么算",
        "gold": ["p.238 第 1 段：功效的定义", "p.261：功效的计算"],
        "ranking": [set(), set(), set(), set(), set()],
        "note": "前 5 名一条都没中",
    },
]


def pad(text: str, width: int) -> str:
    import unicodedata

    w = sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)
    return text + " " * max(0, width - w)


scored = [metrics.evaluate_hits(c["id"], c["ranking"], len(c["gold"]), K) for c in CASES]
agg = metrics.aggregate_query_metrics(scored, K)
keys = metrics.metric_keys(K)

lines = ["前 5 名每一名覆盖的标准段落（· 没中，数字是第几条标准段落）", ""]
for c in CASES:
    marks = " ".join("·" if not r else "+".join(str(i + 1) for i in sorted(r)) for r in c["ranking"])
    lines.append(f"  {c['id']} {pad(c['query'], 18)} 标准 {len(c['gold'])} 条   [{marks}]   {c['note']}")
lines.append("")
lines.append("  题   " + "  ".join(f"{k:>11}" for k in keys))
for m in scored:
    v = m.values()
    lines.append(f"  {m.query_id}   " + "  ".join(f"{v[k]:>11.3f}" for k in keys))
lines.append("  平均 " + "  ".join(f"{agg[k]:>11.3f}" for k in keys))

out("knowledge-eval", {"k": K, "cases": [{**c, "ranking": [sorted(r) for r in c["ranking"]]} for c in CASES], "per_query": [m.to_dict() for m in scored], "aggregate": agg})
txt("knowledge-eval", "\n".join(lines))
print("\n".join(lines))
