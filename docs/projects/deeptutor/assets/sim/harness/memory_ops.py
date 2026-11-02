"""线 7 · 改记忆是一批受校验的操作：合法的一批整体生效，不合法的一批一条都不落。

跑 deeptutor/services/memory/ops.py 的 apply。文档是构造的（同 memory_document.py 那份
「聊天」L2，已是新格式）；先跑一批合法操作，再跑五批各有一处毛病的操作，每批都核对
文档有没有被动过。新条目的 id 由 ids.new_entry_id 现发，每次跑都不同。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.memory", "deeptutor.runtime")

from deeptutor.services.memory.document import parse, serialize  # noqa: E402
from deeptutor.services.memory.ops import AddOp, DeleteOp, EditOp, apply  # noqa: E402

E1 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3D"
E2 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3E"
E3 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3F"
DOC = f"""# Chat

## 理解偏差

- 常把 p 值读成「H0 为真的概率」，第二次讲解后能自己纠正 [^1], [^2] <!--{E1}-->
- 例 8.3 第一次算 t 时忘了除以标准误 [^1] <!--{E2}-->

## 学习偏好

- 喜欢先看例题再看定义 [^3] <!--{E3}-->

---

[^1]: chat:sess_0412
[^2]: quiz:q_0415_2
[^3]: chat:sess_0409
"""

BATCHES = [
    ("合法的一批：加一条、改一条、删一条", [
        AddOp(section="理解偏差", text="边界题（p 恰在 α 附近）会把结论判反", refs=["quiz:q_0418_2"]),
        EditOp(target_id=E1, new_text="已能说清 p 值是先假定 H0 为真的条件概率", new_refs=["chat:sess_0412", "chat:sess_0420"]),
        DeleteOp(target_id=E2, reason="superseded"),
    ]),
    ("加的一条超过 240 字", [AddOp(section="理解偏差", text="很长" * 121, refs=["chat:sess_0420"])]),
    ("加的一条没写来源", [AddOp(section="理解偏差", text="对功效的概念还很模糊", refs=[])]),
    ("来源写成一句话", [AddOp(section="理解偏差", text="对功效的概念还很模糊", refs=["第 3 次对话"])]),
    ("删除理由不在白名单里", [DeleteOp(target_id=E3, reason="不想要了")]),
    ("同一批里先改后删同一条", [
        AddOp(section="学习偏好", text="喜欢用灌装线的例子", refs=["chat:sess_0420"]),
        EditOp(target_id=E3, new_text="喜欢先看例题", new_refs=["chat:sess_0409"]),
        DeleteOp(target_id=E3, reason="stale"),
    ]),
]

record = []
lines: list[str] = []
doc = parse(DOC)
for label, ops in BATCHES:
    before = serialize(doc)
    report = apply(doc, ops)
    after = serialize(doc)
    if report.accepted:
        applied = "、".join(f"{r.op.op}" + (f"→{r.entry_id}" if r.entry_id else "") for r in report.results)
        lines.append(f"✓ {label}：accepted，{applied}")
    else:
        lines.append(f"✗ {label}：{report.reason}；文档没动：{before == after}")
    record.append({"label": label, "accepted": report.accepted, "reason": report.reason, "unchanged": before == after})

lines.append("")
lines.append("最后的文档：")
lines.append(serialize(doc).rstrip())

txt("memory-ops", "\n".join(l.rstrip() for l in lines))
out("memory-ops", {"batches": record, "final": serialize(doc)})
print("\n".join(lines))
