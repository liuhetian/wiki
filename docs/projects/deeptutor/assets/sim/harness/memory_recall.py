"""线 7 · 怎么回到对话里：每轮只带 L3，拼成一段 memory 运行时快照。

跑 deeptutor/services/memory/store.py 的 MemoryStore：在临时目录里写三份 L3 和一份 L2，
用上游自带的 paths.memory_path_service_override 把记忆根目录指过去，再调
read_l3_concat —— 这就是 executor 在开了记忆引用的回合里塞进 memory 块的那段字。
L2 文档写了但不会出现在结果里。store.py 导入 consolidator（会导到模型客户端），
所以 consolidator 登记成空壳，只补上 store.py 用到的两个名字。L3 内容是构造的。
"""
import asyncio
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.memory", "deeptutor.services.memory.consolidator", "deeptutor.runtime")
cons = sys.modules["deeptutor.services.memory.consolidator"]
cons.ConsolidateResult = object
cons.OnEvent = object

from deeptutor.services.memory.document import Document, Entry, serialize  # noqa: E402
from deeptutor.services.memory.paths import memory_path_service_override  # noqa: E402
from deeptutor.services.memory.store import MemoryStore  # noqa: E402


class TempPathService:
    def __init__(self, root: pathlib.Path):
        self.root = root

    def get_memory_dir(self) -> pathlib.Path:
        return self.root


def doc(title, section, items):
    d = Document(title=title)
    entries = d.section_entries(section)
    for i, (text, refs) in enumerate(items):
        entries.append(Entry(id=f"m_01JCB0000000000000000000{i:02d}", section=section, text=text, refs=refs))
    return serialize(d)


L3 = {
    "profile": doc("Profile", "学习者", [
        ("应用统计学研究生一年级，目标是能独立做检验并讲清楚", ["chat", "book"]),
        ("回答先给结论再给依据，例子用灌装线", ["chat"]),
    ]),
    "recent": doc("Recent", "这一周", [
        ("在啃第 8 章，卡在 p 值的含义和边界判断", ["chat", "quiz"]),
        ("功效和样本量还没开始", ["chat"]),
    ]),
    "scope": doc("Scope", "材料", [
        ("以《应用统计学》第 8 章为准，课外资料只作补充", ["kb"]),
    ]),
}
L2_CHAT = doc("Chat", "理解偏差", [("常把 p 值读成 H0 为真的概率", ["chat:sess_0412"])])


async def main():
    store = MemoryStore()
    for slot, md in L3.items():
        await store.overwrite_doc("L3", slot, md)
    await store.overwrite_doc("L2", "chat", L2_CHAT)
    return store.read_l3_concat()


with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    with memory_path_service_override(TempPathService(root)):
        concat = asyncio.run(main())
        files = sorted(str(p.relative_to(root)) for p in root.rglob("*.md"))

lines = ["写到磁盘上的文件：", "   " + "  ".join(files), "", "read_l3_concat() 的结果（L2/chat.md 不在里面）：", concat.rstrip()]
txt("memory-recall", "\n".join(l.rstrip() for l in lines))
out("memory-recall", {"files": files, "l3_concat": concat})
print("\n".join(lines))
