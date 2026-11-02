"""线 7 · 每条事实带脚注：L1 一行事件长什么样，L2 文档怎么解析、怎么写回。

跑 deeptutor/services/memory 下的 trace.TraceEvent、document.parse / serialize。
services/memory/__init__ 会经 store → consolidator 一路导到模型客户端，所以先把
deeptutor.services.memory 登记成空壳，只加载用到的文件。
输入是构造的：一条聊天事件；一份旧格式（脚注按条目编号）的 L2「聊天」文档。
"""
import json
import pathlib
import sys
from dataclasses import asdict

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.memory", "deeptutor.runtime")

from deeptutor.services.memory.document import parse, serialize  # noqa: E402
from deeptutor.services.memory.trace import TraceEvent  # noqa: E402

lines: list[str] = []

ev = TraceEvent.new(
    "chat",
    "turn",
    {"user": "p 值小于 0.05 就能说明原假设是错的吗？", "assistant_chars": 212, "kb": ["应用统计学"]},
    session_id="sess_0412",
    turn_id="turn_7",
)
ev_json = json.dumps(asdict(ev), ensure_ascii=False, separators=(",", ":"))
lines.append("1) L1：trace/chat/<日期>.jsonl 里追加的一行")
lines.append(ev_json)

E1 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3D"
E2 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3E"
E3 = "m_01JCA6Z3R8QK4T7W2N5P9X1B3F"
LEGACY = f"""# Chat

## 理解偏差
- 常把 p 值读成「H0 为真的概率」，第二次讲解后能自己纠正[^{E1}]
- 例 8.3 第一次算 t 时忘了除以标准误[^{E2}]

## 学习偏好
- 喜欢先看例题再看定义[^{E3}]

[^{E1}]: chat:sess_0412, quiz:q_0415_2
[^{E2}]: chat:sess_0412
[^{E3}]: chat:sess_0409
"""
doc = parse(LEGACY)
new_md = serialize(doc)
again = serialize(parse(new_md))
lines.append("")
lines.append("2) 旧格式的 L2 文档（脚注按条目编号，一个脚注里写好几个来源）：")
lines.append(LEGACY.rstrip())
lines.append("")
lines.append("   parse 出来的条目：")
for e in doc.all_entries():
    lines.append(f"   {e.id}  [{e.section}]  refs={e.refs}")
lines.append("")
lines.append("3) serialize 写回的新格式（来源各占一个编号脚注，按首次出现排；条目 id 留在行尾注释里）：")
lines.append(new_md.rstrip())
lines.append("")
lines.append(f"4) 再 parse 再 serialize，和上面逐字相同：{again == new_md}")

txt("memory-document", "\n".join(l.rstrip() for l in lines))
out("memory-document", {
    "trace_event": asdict(ev),
    "legacy": LEGACY,
    "entries": [asdict(e) for e in doc.all_entries()],
    "serialized": new_md,
    "idempotent": again == new_md,
})
print("\n".join(lines))
