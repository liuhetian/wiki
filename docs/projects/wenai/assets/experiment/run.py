"""本站构造的非露骨文件记忆实验；不是 wenai 的运行引擎。

按 agent-io/reference/deepseek.md 调本站中转，只用 Python 标准库。
读取已由 shell 加载的 MY_API_KEY，不记录请求头或环境变量。
每次调用都是新 messages，不携带上一会话历史。
"""
import json
import os
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
SYSTEM = """你是非露骨读书会的会话助手。只根据本次给定的记录回答，不编造未提供的过去事实。
你没有文件或消息工具，不能声称已经写文件或发送图片。
用 JSON 对象回答，只包含 reply（面向用户的简短回答）和 memory_markdown（供下次恢复的 Markdown 文本）。
记忆保留用户明确给出的地点、进度、未完成约定、饮品偏好、最近图片序号和下一张序号。
没有这些信息时，memory_markdown 写空字符串，并在 reply 中向用户问清。
"""


def call(name, user):
    body = {
        "model": "deepseek-flash",
        "thinking": {"type": "disabled"},
        "temperature": 0,
        "max_tokens": 1200,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user},
        ],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{name}.request.json").write_text(json.dumps(body, ensure_ascii=False, indent=2))
    req = urllib.request.Request(
        "https://deepseek-proxy.liuhetian.work/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Authorization": "Bearer " + os.environ["MY_API_KEY"], "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=90) as response:
        result = json.load(response)
    (OUT / f"{name}.response.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
    choice = result["choices"][0]
    if choice["finish_reason"] != "stop":
        raise RuntimeError("输出未正常结束；保留原始响应，停止后续实验")
    value = json.loads(choice["message"]["content"])
    (OUT / f"{name}.reply.txt").write_text(value["reply"] + "\n")
    print(name, json.dumps({"reply": value["reply"], "usage": result.get("usage")}, ensure_ascii=False), flush=True)
    return value


def main():
    first = call("01-write", """请记下：现在是 2026-11-02，我们在河畔咖啡馆的读书会，刚讨论完第三章。
下一步去河边散步，出门前先把蓝色书签放回书里。我喜欢热茶，不加糖。
最近已发图片是 00007，对应 messageId 为 msg_demo_007，下一张序号为 00008。
这是用户提供的事实，不需要你发送图片。请简短确认，并准备下一会话所需的记忆文本。""")
    memory = first["memory_markdown"]
    if not isinstance(memory, str) or not memory.strip():
        raise RuntimeError("首轮没有产出记忆")
    memory_path = OUT / "memory-2026-11-02.txt"
    memory_path.write_text(memory + "\n")
    question = "接着上次的安排吧。我们下一步做什么，出门前还要做什么？我喝什么，下一张图用哪个序号？"
    call("02-no-memory", question)
    restored = memory_path.read_text()
    after = call("03-with-memory", "以下是宿主从磁盘实际读回的最近场景记录：\n" + restored + "\n用户本轮输入：\n" + question)
    report = {
        "kind": "constructed-demo-not-upstream-execution",
        "memory_read_back_equals_written": restored == memory + "\n",
        "required_strings_in_final_reply": {
            term: term in after["reply"] for term in ["散步", "蓝色书签", "热茶", "不加糖", "00008"]
        },
        "note": "字符串核对是本样本检查，不是准确率或可靠性评测；未测试真实文件工具、发送、补记或去重。",
    }
    (OUT / "checks.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
