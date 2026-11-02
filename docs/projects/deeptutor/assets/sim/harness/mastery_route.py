"""线 4 · 路线是一张表：模型起草的路线 JSON 怎么被规范成模块和知识点。

跑 deeptutor/learning/topic_generation.py 的 materialize_modules。草稿是构造的，
模仿模型吐出来的 JSON 常见的毛病：类型写成中文或写错、名字太短、一个模块塞了
九个知识点、混进一个字符串、有个模块没名字。先按「起草」的宽松模式跑一遍，
再按「用户确认保存」的严格模式跑同一份。

topic_generation.py 顶部导入了模型客户端（generate_topic_draft 要用），
materialize_modules 本身不调模型，所以把 deeptutor.services.llm 换成只有一个空
complete 的壳。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.services.llm")
sys.modules["deeptutor.services.llm"].complete = None

from deeptutor.learning.topic_generation import (  # noqa: E402
    TopicGenerationError,
    materialize_modules,
)

DRAFT = [
    {
        "name": "假设与两类错误",
        "objective": "能说清假设检验在判断什么、可能犯哪两种错",
        "knowledge_points": [
            {"name": "原假设与备择假设", "type": "concept"},
            {"name": "第一类与第二类错误", "type": "concept"},
            {"name": "显著性水平 α 的含义", "type": "memory"},
            {"name": "α", "type": "memory"},
        ],
    },
    {
        "name": "检验统计量与 p 值",
        "objective": "能算出 t 统计量并用 p 值作判断",
        "knowledge_points": [
            {"name": "单样本 t 统计量", "type": "procedure"},
            {"name": "p 值不是 H0 为真的概率", "type": "概念型"},
            {"name": "拒绝域与临界值", "type": "procedure"},
            {"name": "查 t 分布表", "type": "skill"},
        ],
    },
    "第 3 部分 · 功效",
    {
        "name": "功效与样本量",
        "knowledge_points": [{"name": f"功效练习 {i}", "type": "procedure"} for i in range(1, 10)],
    },
    {"name": "", "knowledge_points": [{"name": "两个总体均值的检验", "type": "procedure"}]},
]

discarded: list[dict] = []
modules = materialize_modules("hyp", DRAFT, discarded_modules=discarded)

lines = ["起草模式（宽松）："]
for m in modules:
    lines.append(f"  模块 {m.id}  {m.name}  （{len(m.knowledge_points)} 个知识点）")
    for kp in m.knowledge_points:
        lines.append(f"    {kp.id:<14} {kp.type.value:<10} {kp.name}")
lines.append("  丢掉的模块：")
for d in discarded:
    lines.append(f"    第 {d['index']} 个：{d['reason']}")

lines.append("")
lines.append("保存模式（strict=True），同一份草稿：")
try:
    materialize_modules("hyp", DRAFT, strict=True)
    strict_result = "通过"
except TopicGenerationError as exc:
    strict_result = f"TopicGenerationError: {exc}"
lines.append(f"  {strict_result}")

txt("mastery-route", "\n".join(l.rstrip() for l in lines))
out(
    "mastery-route",
    {
        "draft": DRAFT,
        "modules": [m.model_dump(mode="json") for m in modules],
        "discarded": discarded,
        "strict": strict_result,
    },
)
print("\n".join(lines))
