"""线 2 · 模型想问你一句：ask_user 是一个工具，参数先过一遍清洗再变成卡片。

模型写的工具参数五花八门。用 DeepTutor 的 build_ask_user_payload 喂几份构造的参数：
新格式一题三选项、外加模型自己补的「其他」和一个只差一个空格的重复项；旧的
{question, options} 单题格式；一次塞了 5 题；空参数。看出来的卡片结构和报错。
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.tools", "deeptutor.utils")
from deeptutor.tools.ask_user import build_ask_user_payload  # noqa: E402

CASES = [
    (
        "新格式：一题三选项，模型自己补了「其他」，还有一个只差一个空格的重复项",
        {
            "questions": [
                {
                    "header": "讲法",
                    "prompt": "你想先听哪部分？",
                    "options": [
                        {"label": "先讲定义", "description": "从条件概率说起"},
                        {"label": "先看例 8.3", "description": "灌装线那道题，边算边讲"},
                        {"label": "先看例 8.3 ", "description": "重复项"},
                        "其他",
                    ],
                }
            ]
        },
    ),
    ("旧格式：{question, options}", {"question": "要不要顺手出两道题巩固？", "options": ["要", "不要"]}),
    ("一次塞了 5 题", {"questions": [{"prompt": f"第 {i} 题？"} for i in range(1, 6)]}),
    ("空参数", {}),
]

rows, lines = [], []
for title, args in CASES:
    payload, err = build_ask_user_payload(**args)
    data = payload.to_dict() if payload else None
    rows.append({"case": title, "args": args, "payload": data, "error": err})
    lines.append(f"【{title}】")
    if err:
        lines.append(f"  报错回给模型：{err}")
    else:
        for q in data["questions"]:
            opts = " / ".join(o["label"] for o in q["options"]) or "（无选项）"
            lines.append(f"  {q['id']} header={q['header']!r} 题：{q['prompt']}  选项：{opts}  可自填={q['allow_free_text']}")
    lines.append("")

out("runtime-ask-user", rows)
txt("runtime-ask-user", "\n".join(lines))
print("\n".join(lines))
