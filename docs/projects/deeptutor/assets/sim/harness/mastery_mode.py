"""线 4 · 模式管工具：同一个导师，三种模式能调的工具不一样。

跑 deeptutor/capabilities/mastery/mode.py（包的 __init__ 会把整套工具和循环拉起来，
所以先把 deeptutor.capabilities.mastery 登记成空壳，只加载 mode.py）：
1. tool_is_allowed：几个工具 × outline / study / review / 没记录模式
2. wrong_mode_message：被拒时回给模型的那句话
3. admission_error：没有路线时不能进 study
"""
import pathlib
import sys
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.capabilities.mastery")

from deeptutor.capabilities.mastery import mode  # noqa: E402


def pad(text: str, width: int) -> str:
    w = sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in text)
    return text + " " * max(0, width - w)


TOOLS = ["mastery_build", "mastery_revise", "mastery_quiz", "mastery_grade", "mastery_assess", "mastery_status", "mastery_mode"]
MODES = ["outline", "study", "review", None]
lines = ["1) tool_is_allowed（✓ 能调，✗ 调了被拒）"]
lines.append("   " + pad("工具", 18) + "".join(pad(m or "（没记录）", 12) for m in MODES))
matrix = {}
for t in TOOLS:
    row = {str(m): mode.tool_is_allowed(t, m) for m in MODES}
    matrix[t] = row
    lines.append("   " + pad(t, 18) + "".join(pad("✓" if row[str(m)] else "✗", 12) for m in MODES))

msg = mode.wrong_mode_message("mastery_quiz", "outline")
lines.append("")
lines.append("2) 在 outline 里调 mastery_quiz，工具回给模型的话：")
lines.append("   " + msg)

lines.append("")
lines.append("3) 没有路线时要进 study：")
lines.append("   " + mode.admission_error("study", has_outline=False))
lines.append("   要进 review：" + (mode.admission_error("review", has_outline=False) or "（不拦）"))

txt("mastery-mode", "\n".join(l.rstrip() for l in lines))
out("mastery-mode", {"matrix": matrix, "wrong_mode_message": msg,
                     "admission_study": mode.admission_error("study", has_outline=False)})
print("\n".join(lines))
