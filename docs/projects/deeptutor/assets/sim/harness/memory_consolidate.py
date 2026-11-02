"""线 7 · 归并：模型只能引它这一块里看得见的来源。

归并（consolidator 的 update 模式）里调模型的那一步不跑，只跑它前后两头的纯函数：
1. references.render_traces_for_concat 把 L1 实体按时间拼成一长串，每个实体前带一行 @entity 标记
2. chunker.chunk_with_boundary 按段落切块；默认最小块 1000 字，这里调成 200，好在短文本上看到切分
3. references.refs_in_span_l2 算每一块允许引用的来源池
4. references.validate_fact_refs 用默认设置（必须有来源、丢掉池外来源）过滤构造的「模型输出」
L1 实体（四次聊天）和模型输出都是构造的。consolidator 包的 __init__ 会导到模型客户端，
所以 deeptutor.services.memory 和其下的 consolidator、snapshot 都先登记成空壳。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(
    clone,
    "deeptutor.services.memory",
    "deeptutor.services.memory.consolidator",
    "deeptutor.services.memory.snapshot",
    "deeptutor.runtime",
)

from deeptutor.services.memory.consolidator.chunker import chunk_with_boundary  # noqa: E402
from deeptutor.services.memory.consolidator.references import (  # noqa: E402
    ExtractedFact,
    refs_in_span_l2,
    render_traces_for_concat,
    validate_fact_refs,
)
from deeptutor.services.memory.snapshot.entity import Entity  # noqa: E402

SESSIONS = [
    Entity(id="sess_0409", label="例 8.3 怎么算", ts="2026-10-09T20:10:00Z", content=(
        "学习者：例 8.3 的 t 怎么算？先给我看例题再讲定义。\n\n"
        "导师：t = (52.3 − 50) / (4.1 / √25) = 2.80。学习者第一次算成 2.3，漏了除以标准误。"
    )),
    Entity(id="sess_0412", label="p 值的含义", ts="2026-10-12T21:02:00Z", content=(
        "学习者：p 值小于 0.05 就说明 H0 是错的吗？p 值是不是 H0 为真的概率？\n\n"
        "导师：不是。p 值先假定 H0 为真，再算这么极端的数据有多罕见。学习者复述了一遍，说对了。"
    )),
    Entity(id="sess_0415", label="α 取 0.01 时", ts="2026-10-15T20:40:00Z", content=(
        "学习者：p = 0.0098，α 改成 0.01，是不是就不拒绝了？\n\n"
        "导师：0.0098 < 0.01，仍然拒绝。学习者说边界上的数自己总看反。"
    )),
    Entity(id="sess_0420", label="功效", ts="2026-10-20T21:30:00Z", content=(
        "学习者：功效是 1 − α 吗？\n\n"
        "导师：功效是 1 − β，即 H0 为假时正确拒绝它的概率。学习者说这一节还没读。"
    )),
]

lines: list[str] = []
text = render_traces_for_concat(SESSIONS, surface="chat")
lines.append(f"1) 四次聊天拼成一串，共 {len(text)} 字；开头长这样：")
lines.extend("   " + ln for ln in text.splitlines()[:8])
lines.append("   …")

spans = chunk_with_boundary(text, budget=3, overlap_ratio=0.10, min_chunk_chars=200, max_chunk_chars=64000, boundary="paragraph")
pools = []
lines.append("")
lines.append("2) 切块（budget=3、重叠 10%、按段落边界）和每块的来源池：")
for sp in spans:
    pool = refs_in_span_l2(SESSIONS, surface="chat", full_text=text, start=sp.start, end=sp.end)
    pools.append(sorted(pool))
    lines.append(f"   第 {sp.index + 1} 块  [{sp.start}, {sp.end})  {sp.end - sp.start} 字  来源池 {sorted(pool)}")

first_pool = set(pools[0])
FACTS = [
    ExtractedFact(text="常把 p 值读成 H0 为真的概率，讲过一次后能复述", refs=["chat:sess_0412"], section="理解偏差"),
    ExtractedFact(text="算 t 时漏除标准误", refs=["例 8.3 怎么算:chat:sess_0409"], section="理解偏差"),
    ExtractedFact(text="功效的概念还没学", refs=["chat:sess_0420"], section="进度"),
    ExtractedFact(text="喜欢先看例题再看定义", refs=[], section="学习偏好"),
    ExtractedFact(text="边界上的数会看反", refs=["chat:sess_9999", "chat:sess_0412"], section="理解偏差"),
]
lines.append("")
lines.append(f"3) 假设模型读完第 1 块交回这几条（构造的），用第 1 块的来源池过滤：")
record_facts = []
for f in FACTS:
    kept, reason = validate_fact_refs(f, allowed=first_pool, enforce_required=True, drop_invalid=True)
    verdict = f"留下，来源 {kept}" if reason is None else f"丢掉：{reason}"
    record_facts.append({"text": f.text, "refs": f.refs, "kept": kept, "reject": reason})
    lines.append(f"   「{f.text}」 refs={f.refs}")
    lines.append(f"      → {verdict}")

txt("memory-consolidate", "\n".join(l.rstrip() for l in lines))
out("memory-consolidate", {
    "concat": text,
    "chunks": [{"index": s.index, "start": s.start, "end": s.end, "pool": p} for s, p in zip(spans, pools)],
    "facts": record_facts,
})
print("\n".join(lines))
