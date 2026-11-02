"""线 2 · 刷新页面流不断：每个事件编号，重连时报上最后看到的号，从下一个接着播。

用 DeepTutor 的 StreamBus（assign_seq=True，和 turn runtime 一样给事件编号）发一轮
构造的事件：开阶段、检索知识库、几段正文、结束。浏览器 A 从头订阅，收到第 4 号时
断开（刷新页面）；浏览器 B 带着 after_seq=4 重新订阅，看收到哪些。
最后单独演示 wait_for_input：有人回答时拿到答案；没有前端（CLI 无终端）时超时返回空串。
"""
import asyncio
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.core", "deeptutor.runtime")
from deeptutor.runtime.stream_bus import StreamBus  # noqa: E402

SRC, STAGE = "chat", "responding"


def show(e) -> str:
    body = e.content or e.stage or ""
    return f"#{e.seq:<2} {e.type.value:<12} {body}"


async def produce(bus: StreamBus) -> None:
    async with bus.stage(STAGE, source=SRC):
        await bus.thinking("先查教材里 p 值的定义", source=SRC, stage=STAGE)
        await bus.tool_call("rag", {"query": "p 值 定义"}, source=SRC, stage=STAGE)
        await bus.tool_result("rag", "命中 p.248 三段", source=SRC, stage=STAGE)
        for piece in ("不能。", "p 值是先假定原假设为真", "再算出来的概率。"):
            await bus.content(piece, source=SRC, stage=STAGE)
            await asyncio.sleep(0)
    await bus.result({"response": "（完整答案）"}, source=SRC)
    await bus.close()


async def main():
    bus = StreamBus(assign_seq=True)
    got_a, got_b = [], []

    async def browser_a():
        async for e in bus.subscribe():
            got_a.append(e)
            if e.seq == 4:
                return  # 刷新页面，连接断了

    task_a = asyncio.create_task(browser_a())
    await asyncio.sleep(0)
    await produce(bus)
    await task_a
    async for e in bus.subscribe(after_seq=got_a[-1].seq):
        got_b.append(e)

    # wait_for_input：有人答 / 没人答
    bus2 = StreamBus(assign_seq=True)

    async def answer_later():
        await asyncio.sleep(0.05)
        bus2.submit_input("先讲定义，再讲误读")

    asyncio.create_task(answer_later())
    answered = await bus2.wait_for_input("想先听哪部分？", source=SRC, stage=STAGE, timeout=5)
    headless = await StreamBus(assign_seq=True).wait_for_input("想先听哪部分？", timeout=0.05)
    return got_a, got_b, bus.latest_seq, answered, headless


got_a, got_b, last, answered, headless = asyncio.run(main())
lines = ["浏览器 A 从头订阅，收到 #4 后刷新页面："]
lines += ["  " + show(e) for e in got_a]
lines += ["", f"浏览器 B 重连，带 after_seq={got_a[-1].seq}："]
lines += ["  " + show(e) for e in got_b]
lines += ["", f"这一轮共发 {last} 个事件；A 收 {len(got_a)} 个，B 收 {len(got_b)} 个，没有重复也没有漏。", ""]
lines += [f"wait_for_input，前端 50ms 后回答：「{answered}」", f"wait_for_input，没有前端、超时 50ms：{headless!r}"]
def dump(e):
    d = e.to_dict()
    d["timestamp"] = "（运行时间，略）"
    return d


out("runtime-replay", {"a": [dump(e) for e in got_a], "b": [dump(e) for e in got_b], "latest_seq": last, "answered": answered, "headless": headless})
txt("runtime-replay", "\n".join(lines))
print("\n".join(lines))
