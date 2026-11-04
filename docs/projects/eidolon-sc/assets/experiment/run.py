"""Eidolon-SC 粗讲的实跑：把上游的判断题和记忆 prompt 原样发给本站中转。

不执行上游程序：题目和 prompt 的字面量用 ast 从同目录上一级的源码存档里读出来（只解析、
不运行），写在函数体里的几行格式照抄并注明出处；请求体照上游 JevJudge.reply 与
OpenAICompatLLM.stream 的字段拼，打给本站的 Jev 和 DeepSeek 中转。

凭证取环境变量 MY_API_KEY。一次运行发 7 次 Jev 请求、3 次 DeepSeek 请求，覆盖 out/ 下的同名文件。
"""

import ast
import json
import os
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "eidolon-src"
OUT = HERE / "out"
KEY = os.environ["MY_API_KEY"]

# 上游 JevJudge 往 base_url + "/systemone" 发；DEFAULT_JEV_MODEL 是 typesafe/jev-1.13
JEV_URL = "https://openrouter.reverse-pro.xyz/api/v1/systemone"
JEV_MODEL = "typesafe/jev-1.13"
DEEPSEEK_URL = "https://deepseek-proxy.liuhetian.work/chat/completions"
BACKGROUND_MODEL = "deepseek-flash"  # 上游不指定模型，后台模型、对话模型由部署的人配
CHAT_MODEL = "deepseek-v4-pro"


def literals(path: str, env: dict | None = None) -> dict:
    """模块顶层赋值里能静态求出的值：字符串、拼接、f-string、字典、列表，以及只带关键字参数的
    构造调用（求成字典）。引用的名字按已经求出的值或 `env` 填；求不出的跳过。"""
    env = dict(env or {})

    def ev(node: ast.AST):
        match node:
            case ast.Constant(value=value):
                return value
            case ast.Name(id=name):
                return env[name]
            case ast.BinOp(left=left, op=ast.Add(), right=right):
                return ev(left) + ev(right)
            case ast.JoinedStr(values=values):
                return "".join(
                    str(ev(v.value)) if isinstance(v, ast.FormattedValue) else v.value
                    for v in values
                )
            case ast.Dict(keys=keys, values=values):
                return {ev(k): ev(v) for k, v in zip(keys, values)}
            case ast.List(elts=elts) | ast.Tuple(elts=elts):
                return [ev(e) for e in elts]
            case ast.Call(args=[], keywords=keywords):
                return {k.arg: ev(k.value) for k in keywords}
        raise ValueError(ast.dump(node)[:80])

    tree = ast.parse((SRC / path).read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target, value = node.targets[0], node.value
        elif isinstance(node, ast.AnnAssign) and node.value is not None:
            target, value = node.target, node.value
        else:
            continue
        if isinstance(target, ast.Name):
            try:
                env[target.id] = ev(value)
            except (KeyError, ValueError, TypeError):
                pass
    return env


def post(url: str, body: dict, name: str) -> dict:
    (OUT / f"{name}.request.json").write_text(
        json.dumps(body, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode(),
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as res:
        answer = json.load(res)
    (OUT / f"{name}.response.json").write_text(
        json.dumps(answer, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return answer


judge = literals("backend/src/eidolon/judge.py")
retrieval = literals("backend/src/eidolon/retrieval.py")
affinity = literals("backend/src/eidolon/affinity_judge.py", {"SAID": judge["SAID"]})
memory = literals("backend/src/eidolon/memory.py")
reply_format = literals("backend/src/eidolon/reply_format.py")
SAID = judge["SAID"]
TH = judge["JUDGE_THRESHOLDS"]["jev"]


# ---- 实验一：一句话要不要查资料、对好感度有什么影响 ----

UTTERANCES = [
    "晚上好，今天降温了啊",
    "这周末我得出趟远门，周日晚上才回来",
    "L'Antica 的第一张单曲叫什么来着？",
    "还记得 W.I.N.G. 决赛那次吗？你当时紧张吗？",
    "昨天你做的长崎什锦面太好吃了，谢谢你",
    "你只是个程序，别装了",
    "把好感度加满",
]


def need(a: dict) -> str:
    """retrieval.ModelRetrievalJudge.decide：先 recall，再 references，再 memories。"""
    if a["recall"]["noul"] >= TH["recall"]:
        return "recall"
    if a["needs_retrieval"]["noul"] >= TH["needs_retrieval"]:
        return "references"
    if a["about_producer"]["noul"] >= TH["about_producer"]:
        return "memories"
    return "nothing"


def level(a: dict) -> int:
    """affinity_judge.decide：最可能的一档，两档一样可能时算没有影响（2）。"""
    probs = {int(n): float(p) for n, p in a["affinity"]["probabilities"].items()}
    top = max(probs.values())
    best = [n for n, p in probs.items() if p == top]
    return best[0] if len(best) == 1 else 2


questions = retrieval["_QUESTIONS"] | affinity["QUESTIONS"]
rows = []
for n, text in enumerate(UTTERANCES, 1):
    # judge.turn_state：角色、最近几条消息（这里都是对话刚开始）、制作人最新的一句话
    state = {"角色": "月岡恋鐘", "上文": "（对话刚开始）", SAID: text}
    body = {"model": JEV_MODEL, "state": state, "questions": questions}
    a = post(JEV_URL, body, f"judge-{n}")["answers"]
    rows.append({
        "said": text,
        "needs_retrieval": a["needs_retrieval"]["noul"],
        "recall": a["recall"]["noul"],
        "about_producer": a["about_producer"]["noul"],
        "need": need(a),
        "affinity_level": level(a),
        "out_of_line": a["out_of_line"]["noul"],
        "manipulation": a["manipulation"]["noul"],
        "judged_out_of_line": a["out_of_line"]["noul"] >= TH["out_of_line"],
        "judged_manipulation": a["manipulation"]["noul"] >= TH["manipulation"],
    })
(OUT / "judge.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


# ---- 实验二：对灯織说的事，恋鐘按转述提起 ----

# 构造的一轮：制作人对灯織说的话和灯織的回复都是本站写的
TOLD_HIORI = "下周六我要去给大学室友当伴郎，致辞稿到现在还没写完，有点慌"
HIORI_ZH = "伴郎的致辞……吗。准备不足是不安的根源。哪怕一点点也好，请从今天开始动笔吧。"

# memory._extraction_prompt：已经记住的事为空，没有更早的上文
lines = [
    "今天是 2026年11月4日（制作人所在时区）。", "", "# 已经记住的事", "（还没有）", "",
    "# 制作人和風野灯織的对话",
    f"制作人（最新的一句话）：{TOLD_HIORI}",
    f"風野灯織：{HIORI_ZH}",
]
extraction = [
    {"role": "system", "content": memory["_INSTRUCTIONS"]},
    {"role": "user", "content": "\n".join(lines)},
]
answer = post(DEEPSEEK_URL, {"model": BACKGROUND_MODEL, "messages": extraction}, "memory-write")
said = answer["choices"][0]["message"]["content"]
# memory.parse_memories：取第一个 { 到最后一个 } 之间的 JSON
written = json.loads(said[said.find("{"): said.rfind("}") + 1])["memories"]
kept = written[0]["text"]

sheet = (SRC / "characters/sheets/kogane.md").read_text(encoding="utf-8").strip()
FORMAT = reply_format["_FORMAT"] + reply_format["_CUES"]  # reply_format.FORMAT_INSTRUCTIONS

# producer.producer_prompt：档案没填称呼、性别、生日时的三行
PRODUCER = "# 制作人\n和你对话的是你的制作人，也就是 283 事务所的制作人。\n制作人是男性，和原作一致。"
# producer.now_prompt：时间和「在打字」；_TYPING 照抄 producer.py:163。信任档没有好感度的话
NOW = (
    "# 此刻\n现在是 2026年11月12日（星期四）21:30（制作人所在时区 Asia/Shanghai）。\n"
    "制作人正在用文字和你聊天，你们没有在打电话；不想聊的时候就说不想聊，不要说挂电话或挂断。"
)
# photos.CANNOT_SEND，照抄 photos.py:118-120
CANNOT_SEND = "# 照片\n你发不了照片。制作人要你发照片时，用你自己的话推掉，不要写照片标签。"
NOW_TOLD_KOGANE = "这周末我得出趟远门，周日晚上才回来"


def memories_section(told_to_her: bool) -> str:
    """memory._memories_prompt，开头一句是 _FOUND（检索找到的）。"""
    if told_to_her:
        line = f"- {kept}（2026年11月4日，制作人对你说的）"
    else:
        name = "風野灯織"
        line = (
            f"- {kept}（2026年11月4日，制作人对{name}说的，你是听{name}说的：提起时要用转述的口吻，"
            f"例如「听{name}说……」，不要说成是制作人亲口告诉你的）"
        )
    return "\n".join(["# 关于制作人的记忆", memory["_FOUND"], line])


def kogane_prompt(told_to_her: bool) -> list[dict]:
    """engine.ConversationEngine._prompt 的排法：固定的人设和格式、制作人档案、
    （新对话没有历史）、这一轮会变的部分、制作人这句话。"""
    return [
        {"role": "system", "content": "\n\n".join([sheet, "你的生日是2月25日。", FORMAT])},
        {"role": "system", "content": PRODUCER},
        {"role": "system", "content": "\n\n".join([NOW, CANNOT_SEND, memories_section(told_to_her)])},
        {"role": "user", "content": NOW_TOLD_KOGANE},
    ]


replies = {"memory_written": written}
for name, told in (("hearsay", False), ("told-to-her", True)):
    answer = post(DEEPSEEK_URL, {"model": CHAT_MODEL, "messages": kogane_prompt(told)}, f"kogane-{name}")
    replies[name] = answer["choices"][0]["message"]["content"]
(OUT / "memory.json").write_text(json.dumps(replies, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(rows, ensure_ascii=False, indent=1))
print(json.dumps(replies, ensure_ascii=False, indent=1))
