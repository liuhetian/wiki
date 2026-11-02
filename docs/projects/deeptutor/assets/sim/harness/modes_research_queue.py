"""线 3 · 深研：子主题放进一个队列，模型研究中途可以 APPEND 新子主题，程序先去重、再看满没满。

用 DeepTutor 的 DynamicTopicQueue 演一遍：研究题目「p 值的常见误读与正确报告方式」，
大纲拆出三块；研究第 2 块时模型连发五次 APPEND。每次按 pipeline.py 2957-3013 里
处理 APPEND 的顺序调用：先 is_full()，再 find_similar()，都过了才 append_child()。
大纲和 APPEND 的标题是构造的；相似度、去重、排队全是上游代码算的。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.agents.research", "deeptutor.utils")
from deeptutor.agents.research.data_structures import DynamicTopicQueue  # noqa: E402

q = DynamicTopicQueue("p-value-misreadings", max_length=5)
for title in ["p 值的定义与条件概率", "三种常见误读", "报告检验结果时该给什么"]:
    q.add_block(title, "")
q.mark_researching("block_1")
q.mark_completed("block_1")
current = q.get_block_by_id("block_2")
q.mark_researching("block_2")

lines = ["大纲拆出的三块：" + "；".join(f"{b.block_id} {b.sub_topic}" for b in q.blocks), "", "研究 block_2 时模型发来的 APPEND："]
log = []
for title in ["三种常见的误读", "效应量与置信区间", "P 值的定义与条件概率", "样本量对 p 值的影响", "多重比较时 p 值怎么校正"]:
    scores = {b.block_id: round(DynamicTopicQueue._topic_similarity(title, b.sub_topic), 3) for b in q.blocks}
    if q.is_full():
        verdict = "拒绝：队列满了（max_length=5）"
    elif (dup := q.find_similar(title)) is not None:
        verdict = f"拒绝：和 {dup.block_id}「{dup.sub_topic}」太像"
    else:
        nb = q.append_child(parent=current, sub_topic=title)
        verdict = f"排进队尾：{nb.block_id}，parent={nb.metadata.get('parent_block_id')}"
    best = max(scores.items(), key=lambda kv: kv[1])
    log.append({"append": title, "similarity": scores, "verdict": verdict})
    lines.append(f"  「{title}」 最像 {best[0]}（{best[1]:.2f}）→ {verdict}")

q.mark_completed("block_2")
order = []
while (b := q.get_pending_block()) is not None:
    order.append(f"{b.block_id} {b.sub_topic}")
    q.mark_completed(b.block_id)
lines += ["", "block_1 已做完，block_2 做完后，调度器按队列顺序取下一块：", *("  " + o for o in order)]
state = q.to_dict()
state["created_at"] = "（运行时间，略）"
for b in state.get("blocks", []):
    for k in ("created_at", "updated_at"):
        if k in b:
            b[k] = "（运行时间，略）"
out("modes-research-queue", {"appends": log, "queue": state})
txt("modes-research-queue", "\n".join(lines))
print("\n".join(lines))
