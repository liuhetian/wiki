"""线 3 · 画图：图只能经 submit_visualization 交上画布，交之前本地校验，不过就把错因回给模型重交。

用 DeepTutor visualizers/builtin.py 里 Chart.js 和 SVG 的校验器原样执行（它们内部再调
agents/visualize/utils.py 的 validate_visualization）。喂六份构造的、模型可能交上来的
payload：一份合格的 t 分布图（自由度 24，阴影是拒绝域），和五份各有一个毛病的。
"""
import json
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.visualizers", "deeptutor.tools.vision", "deeptutor.agents.visualize", "deeptutor.agents._shared")
from deeptutor.visualizers import builtin  # noqa: E402

chartjs = builtin._json_visualization_validator("chartjs")
svg = builtin._text_validator("svg")


def t_pdf(x: float, df: int = 24) -> float:
    c = math.gamma((df + 1) / 2) / (math.sqrt(df * math.pi) * math.gamma(df / 2))
    return c * (1 + x * x / df) ** (-(df + 1) / 2)


xs = [round(-4 + 0.25 * i, 2) for i in range(33)]
good = {
    "type": "line",
    "data": {
        "labels": xs,
        "datasets": [
            {"label": "t 分布（自由度 24）", "data": [round(t_pdf(x), 4) for x in xs], "fill": False},
            {"label": "拒绝域 |t| > 2.064", "data": [round(t_pdf(x), 4) if abs(x) > 2.064 else None for x in xs], "fill": "origin"},
        ],
    },
    "options": {"plugins": {"title": {"display": True, "text": "例 8.3：t = 2.80 落在拒绝域"}}},
}
CASES = [
    ("chartjs", "合格：t 分布 + 拒绝域", json.dumps(good, ensure_ascii=False)),
    ("chartjs", "tooltip 里写了 JS 回调函数", '{"type": "line", "data": {"labels": [0], "datasets": [{"label": "t", "data": [0.39]}]}, '
     '"options": {"plugins": {"tooltip": {"callbacks": {"label": function(c) { return c.raw; }}}}}}'),
    ("chartjs", "用了 Chart.js 没有的类型 area", '{"type": "area", "data": {"datasets": [{"label": "t", "data": [1]}]}}'),
    ("chartjs", "数据集没写 label", '{"type": "line", "data": {"labels": [0, 1], "datasets": [{"data": [0.39, 0.24]}]}}'),
    ("svg", "SVG 根节点没有 viewBox", '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><title>拒绝域</title><desc>t 分布两侧尾部</desc></svg>'),
    ("svg", "SVG 缺 <title> 和 <desc>", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><path d="M0 200 Q200 0 400 200"/></svg>'),
]

rows, lines = [], []
for kind, title, payload in CASES:
    ok, _data, err = (chartjs if kind == "chartjs" else svg)(payload)
    rows.append({"visualizer": kind, "case": title, "ok": ok, "error": err, "payload": payload})
    lines.append(f"  {kind:<7} {title}")
    lines.append("          → " + ("通过，写进画布" if ok else "退回给模型：" + err))
out("modes-visualize-validate", rows)
txt("modes-visualize-validate", "\n".join(lines))
print("\n".join(lines))
