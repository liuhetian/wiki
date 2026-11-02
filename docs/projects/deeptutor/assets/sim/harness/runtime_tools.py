"""线 2 · 换模式不是换 prompt：这一轮挂哪些工具，是一个纯函数算出来的。

用 DeepTutor 的 compose_enabled_tools 算几种轮次的工具表，再用
route_explicit_quiz_request 看哪些话会被直接改派给出题流水线。

tool_composition.py 一导入就要 deeptutor.tools.builtin（会拉起全部工具实现），
这里先登记一个同名的替身模块：三张名单不手抄，BUILTIN_TOOL_NAMES 来自
import-cheap 的 tools/builtin_specs.py，另两张用 ast 从 tools/builtin/__init__.py
原文里读出字面量。注册表是个桩：只回答「这些名字里哪些是已注册的工具」。
"""
import ast
import pathlib
import sys
import types

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.core", "deeptutor.tools", "deeptutor.agents._shared", "deeptutor.runtime")
from deeptutor.tools.builtin_specs import BUILTIN_TOOL_NAMES  # noqa: E402

src = (clone / "deeptutor/tools/builtin/__init__.py").read_text(encoding="utf-8")
lists = {}
for node in ast.parse(src).body:
    if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
        if node.target.id in ("USER_TOGGLEABLE_TOOL_NAMES", "CONFIGURABLE_BUILTIN_TOOL_NAMES"):
            lists[node.target.id] = ast.literal_eval(node.value)
fake = types.ModuleType("deeptutor.tools.builtin")
fake.BUILTIN_TOOL_NAMES = BUILTIN_TOOL_NAMES
fake.USER_TOGGLEABLE_TOOL_NAMES = lists["USER_TOGGLEABLE_TOOL_NAMES"]
fake.CONFIGURABLE_BUILTIN_TOOL_NAMES = lists["CONFIGURABLE_BUILTIN_TOOL_NAMES"]
sys.modules["deeptutor.tools.builtin"] = fake

from deeptutor.agents._shared import tool_composition as tc  # noqa: E402
from deeptutor.runtime.capability_routing import route_explicit_quiz_request  # noqa: E402


class Registry:
    class _T:
        def __init__(self, name):
            self.name = name

    def get_enabled(self, names):
        return [self._T(n) for n in names if n in BUILTIN_TOOL_NAMES]


reg = Registry()
whitelist = tc.default_optional_tools()
F = tc.ToolMountFlags
CASES = [
    ("聊天：挂了「应用统计学」库，开了联网搜索和深度推理，有记忆", dict(requested_tools=["web_search", "reason"], mount_flags=F(has_kb=True, has_memory=True))),
    ("聊天：没挂库，用户开关里塞了 rag 和 exec", dict(requested_tools=["web_search", "rag", "exec"], mount_flags=F(has_memory=True))),
    ("解题 deep_solve：同第一行，再加解题自带的三个工具", dict(requested_tools=["web_search", "reason"], mount_flags=F(has_kb=True, has_memory=True), capability_owned=("solve_plan", "solve_finish_step", "solve_replan"))),
    ("Obsidian 笔记库（独占的知识能力），旁边还挂了一个普通库", dict(requested_tools=["web_search", "reason"], mount_flags=F(has_kb=True, has_memory=True), capability_owned=("obsidian_search", "obsidian_read"), exclusive=True)),
]

lines = [f"用户能自己开关的工具（USER_TOGGLEABLE_TOOL_NAMES，{len(fake.USER_TOGGLEABLE_TOOL_NAMES)} 个）：" + "、".join(fake.USER_TOGGLEABLE_TOOL_NAMES), ""]
rows = []
for title, kw in CASES:
    tools = tc.compose_enabled_tools(registry=reg, optional_whitelist=whitelist, **kw)
    rows.append({"case": title, "tools": tools})
    lines.append(f"【{title}】")
    lines.append("  " + "、".join(tools))
    lines.append("")

lines.append("哪句话会被改派到出题流水线 deep_question（route_explicit_quiz_request）：")
routes = []
for msg, ws in [
    ("帮我出 5 道假设检验的测验题", ""),
    ("给我出几道考试题，第 8 章的", ""),
    ("考考我 p 值", ""),
    ("Generate 5 quiz questions on hypothesis testing", ""),
    ("帮我出 5 道假设检验的测验题", "mastery"),
]:
    r = route_explicit_quiz_request(msg, "chat", enabled=True, workspace_mode=ws)
    routes.append({"message": msg, "workspace_mode": ws, "route": r.as_metadata() if r else None})
    where = f"（在 {ws} 工作区里）" if ws else ""
    lines.append(f"  「{msg}」{where} → {r.capability if r else '留在 chat'}")

out("runtime-tools", {"whitelist": whitelist, "cases": rows, "routes": routes})
txt("runtime-tools", "\n".join(lines))
print("\n".join(lines))
