"""线 3 · 解题：计划由模型写，进度由程序记。

用 DeepTutor 的三个解题工具（solve_plan / solve_finish_step / solve_replan）原样执行，
参数是构造的、模型会写的样子，题目是例 8.3。步骤编号由服务端生成；每做完一步，
工具结果里带一个 _context_checkpoint，循环把这一步的工具往来折叠成一行，只留最新的计划。
重规划预算是 2，第三次被拒。
"""
import asyncio
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.core", "deeptutor.capabilities.solve")
from deeptutor.capabilities.solve.tools import SolveFinishStepTool, SolvePlanTool, SolveReplanTool  # noqa: E402

SID = {"_solve_session_id": "turn-8.3"}
plan, finish, replan = SolvePlanTool(), SolveFinishStepTool(), SolveReplanTool()
log, lines = [], []


async def call(tool, label, **kw):
    r = await tool.execute(**SID, **kw)
    log.append({"call": label, "args": kw, "success": r.success, "content": r.content, "metadata": r.metadata})
    return r


async def main():
    r0 = await call(plan, "solve_plan", analysis="单样本 t 检验，总体标准差未知", steps=[
        {"goal": "写出 H0: μ = 50 和 H1: μ ≠ 50"},
        {"goal": "算标准误和 t 统计量"},
        {"goal": "查 t0.975(24)，比较 |t|"},
        {"goal": "下结论并解释 p 值"},
        {"goal": ""},
    ])
    steps0 = json.loads(r0.content)["steps"]
    lines.append(f"solve_plan 交了 5 条，空目标那条被丢掉，服务端编号 {'、'.join(x['id'] for x in steps0)}")
    lines.append("")
    await call(finish, "solve_finish_step S1", step_id="S1", summary="双侧检验")
    r = await call(finish, "solve_finish_step S2", step_id="S2", summary="se = 0.82，t = 2.80")
    cp = r.metadata["_context_checkpoint"]
    lines.append("做完 S2 后折叠成的一行和留下的计划（_context_checkpoint）：")
    lines.append("  summary: " + cp["summary"])
    lines.extend(["  " + x for x in cp["state"].splitlines()])
    lines.append("")
    outcomes = []
    for reason, goals in [
        ("查表太慢，改用 p 值法", ["算双侧 p 值", "p 与 α 比较并下结论"]),
        ("再加一步置信区间对照", ["算双侧 p 值", "算 95% 置信区间", "下结论"]),
        ("又想换回临界值法", ["查 t0.975(24)", "下结论"]),
    ]:
        r = await call(replan, "solve_replan", reason=reason, steps=[{"goal": g} for g in goals])
        body = json.loads(r.content)
        outcomes.append(f"「{reason}」→ {body['status']}" + (f"（已用 {body['replans_used']}/{body['replans_max']}）" if "replans_used" in body else ""))
    lines.append("三次重规划：")
    lines.extend(["  " + o for o in outcomes])
    lines.append("")
    for sid, summ in [("S1", "p = 0.0098"), ("S2", "[50.61, 53.99]"), ("S3", "拒绝 H0")]:
        r = await call(finish, f"solve_finish_step {sid}", step_id=sid, summary=summ)
    lines.append("最后一步完成后的计划：")
    lines.extend(["  " + x for x in r.metadata["_context_checkpoint"]["state"].splitlines()])


asyncio.run(main())
out("modes-solve", log)
txt("modes-solve", "\n".join(lines))
print("\n".join(lines))
