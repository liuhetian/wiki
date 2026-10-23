"""实跑：拼接与规则全部调梨园源码（lab.mjs，进程里没有 API key）；模型调用走 agent-io 的 DeepSeek 中转。"""
import json, os, re, subprocess, sys, shutil
API = "https://deepseek-proxy.liuhetian.work/chat/completions"
KEY = os.environ["MY_API_KEY"]
H = "/tmp/liyuan-sim/v2"; OUT = f"{H}/out"; os.makedirs(OUT, exist_ok=True)
MAIN, SIDE = "deepseek-v4-pro", "deepseek-flash"
NODE_ENV = {k: v for k, v in os.environ.items() if k != "MY_API_KEY"} | {"LIYUAN_REPO": "/tmp/liyuan-src/Liyuan", "LAB_HOME": H}

def lab(cmd, payload=None):
    r = subprocess.run(["node", f"{H}/lab.mjs", cmd], input=json.dumps(payload or {}), capture_output=True, text=True, env=NODE_ENV)
    if r.returncode: sys.exit(f"lab {cmd} 失败：{r.stderr[-500:]}")
    return json.loads(r.stdout)

def chat(body):
    p = f"{OUT}/_req.json"; json.dump(body, open(p, "w"), ensure_ascii=False)
    for _ in range(3):
        r = subprocess.run(["curl", "-sS", "--max-time", "400", API, "-H", f"Authorization: Bearer {KEY}", "-H", "Content-Type: application/json", "-d", f"@{p}"], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            if "choices" in d: return d
        except Exception: pass
    sys.exit(f"API 出错：{r.stdout[:300]}")

def side(system, user, max_tokens=4096):
    d = chat({"model": SIDE, "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}], "max_tokens": max_tokens, "thinking": {"type": "disabled"}})
    return d["choices"][0]["message"]["content"], d.get("usage")

def save(name, obj): json.dump(obj, open(f"{OUT}/{name}.json", "w"), ensure_ascii=False, indent=1)

sysd = lab("system", {"cwd": "/home/user/liyuan"})
save("system", {k: sysd[k] for k in ("system", "base", "liyuan", "greeting")} | {"toolNames": [t["name"] for t in sysd["tools"]], "toolChars": len(json.dumps(sysd["tools"], ensure_ascii=False))})
TOOLS = [{"type": "function", "function": t} for t in sysd["tools"]]

def run_round(tag, history, state, user_text, prev=None, pick=0):
    """跑一轮扮演。history 是之前各轮（只有原话和定稿），prev 是上一轮定稿（供 previous_draft_*）。"""
    window = "\n".join(m["content"] for m in history[-3:]) + "\n" + user_text
    inj = lab("inject", {"state": state, "windowText": window})
    msgs = [{"role": "system", "content": sysd["system"]}, *history, {"role": "user", "content": f"{inj['injection']}\n\n{user_text}"}]
    rec = {"user": user_text, "injection": inj["injection"], "activated": inj["activated"], "messages_sent": [{"role": m["role"], "content": m["content"] if m["role"] != "system" else "（system，见 system.json）"} for m in msgs], "steps": []}
    draft, ver, sealed, pv = "", 0, False, 0
    for rnd in range(1, 21):
        d = chat({"model": MAIN, "messages": msgs, "tools": TOOLS, "thinking": {"type": "enabled"}, "reasoning_effort": "high"})
        m = d["choices"][0]["message"]
        step = {"round": rnd, "reasoning": m.get("reasoning_content"), "content": m.get("content"), "calls": [], "usage": d.get("usage")}
        rec["steps"].append(step)
        msgs.append({k: m[k] for k in ("role", "content", "reasoning_content", "tool_calls") if m.get(k) is not None})
        if not m.get("tool_calls"):
            if not draft and (m.get("content") or "").strip() and prev is None:
                draft, sealed = m["content"].strip(), True; step["note"] = "直出：代收为 draft_write 并收笔"
            break
        for c in m["tool_calls"]:
            n, a = c["function"]["name"], json.loads(c["function"]["arguments"] or "{}")
            if n == "draft_write" and not sealed: draft = a["content"]; ver += 1; res = {"ok": True, "version": ver, "chars": len(draft)}
            elif n == "draft_append" and not sealed: draft += a.get("separator", "\n\n") + a["content"]; ver += 1; res = {"ok": True, "version": ver, "chars": len(draft)}
            elif n == "draft_edit" and not sealed:
                for e in a["edits"]: draft = draft.replace(e["old"], e["new"], 1)
                ver += 1; res = {"ok": True, "version": ver, "chars": len(draft)}
            elif n in ("draft_write", "draft_append", "draft_edit"): res = {"ok": False, "error": "本轮已收笔，不能再改"}
            elif n == "draft_read": res = {"version": ver, "content": draft}
            elif n == "draft_seal": sealed = True; res = {"ok": True, "sealed": True, "version": ver}
            elif n == "previous_draft_read": res = {"version": pv, "content": prev["text"]} if prev else {"error": "没有上一轮"}
            elif n == "previous_draft_edit" and prev:
                for e in a["edits"]: prev["text"] = prev["text"].replace(e["old"], e["new"], 1)
                pv += 1; res = {"ok": True, "version": pv}
            elif n == "ask": res = {"answer": a["options"][pick], "by": "user"}
            elif n == "lorebook_search": res = lab("search", {"query": a["query"]})["hits"]
            elif n == "lorebook_list": res = ["栖水镇（常驻）", "听雨轩", "旧油纸伞", "怀瑾", "镇北渡口", "更夫"]
            elif n == "world_state_get": res = lab("state", {"state": state})["formatted"]
            elif n == "memory_search": res = []
            else: res = {"error": "（模拟中未实现）"}
            step["calls"].append({"name": n, "args": a, "result": res})
            msgs.append({"role": "tool", "tool_call_id": c["id"], "content": json.dumps(res, ensure_ascii=False)})
        # 梨园在 draft_seal / previous_draft_edit 成功后结束本轮（src/stage/engine.ts:1883）
        if any(c["name"] in ("draft_seal", "previous_draft_edit") and isinstance(c["result"], dict) and c["result"].get("ok") for c in step["calls"]):
            break
    rec |= {"final": draft, "sealed": sealed}
    if sealed and draft:
        sp = lab("scribe-prompt", {"state": state, "userText": user_text, "assistantText": draft})
        raw, usage = side(sp["systemPrompt"], sp["userText"], 2048)
        p = lab("patch", {"state": state, "raw": raw})
        rec["scribe"] = {"systemPrompt": sp["systemPrompt"], "userText": sp["userText"], "raw": raw, "applied": p["applied"], "warnings": p["warnings"], "formatted": p["formatted"], "roster": p["roster"]}
        state = p["state"]
    save(tag, rec)
    print(f"{tag}: 调用 {len(rec['steps'])} 次，工具 {[c['name'] for s in rec['steps'] for c in s['calls']]}，收笔 {sealed}", flush=True)
    return rec, state

G = {"role": "assistant", "content": sysd["greeting"]}
U1 = "我把湿透的外衣搭在椅背上，接过茶喝了一口：「住三天。顺便打听个人——十年前从镇北渡口走的那位怀瑾公子，掌柜可还记得？」"
U2 = "她提到那个名字时的反应让我心里一沉。接下来我该怎么做？给我几个选项。"
r1, s1 = run_round("round1", [G], None, U1)
r1b, s1b = run_round("round1-swipe", [G], None, U1)          # 同一输入再生成一次＝同级分支
h2 = [G, {"role": "user", "content": U1}, {"role": "assistant", "content": r1["final"]}]
r2, s2 = run_round("round2", h2, s1, U2)
quotes = re.findall(r"「[^「」]+」", r2["final"])
U3 = f"上一轮她最后那句{quotes[-1]}，改成「这些年，他过得好吗？」" if quotes else "上一轮最后一句对白改得再轻一点。"
prev = {"text": r2["final"]}
h3 = h2 + [{"role": "user", "content": U2}, {"role": "assistant", "content": r2["final"]}]
r3, s3 = run_round("round3", h3, s2, U3, prev=prev)
r3["previous_after"] = prev["text"]; save("round3", r3)

# ---- 纯函数实验 ----
save("lab-passive", lab("inject", {"state": None, "windowText": sysd["greeting"] + "\n" + U1, "passiveLore": True}))
save("lab-gate", lab("gate", {"cases": [
    {"toolName": "lorebook_write", "lastUserText": "把怀瑾的事记下来，以后还要用。"},
    {"toolName": "lorebook_write", "lastUserText": "她看起来很难过。"},
    {"toolName": "lorebook_delete", "lastUserText": "那条记错了，删掉吧。"}]}))
save("lab-patch", lab("patch", {"state": s1, "patch": {"characters": {"青梧": {"affinity": 150}}, "mood": "阴郁", "inventory": ["黄铜怀表（旅人持有）", 42]}}))
# 文字通道输入借用第一次实跑里模型的一段真实输出（当时脚本收笔后没停，它把正文缩写着重述了一遍）
trail = "*青梧在账本上停了一瞬，转身取下墙上那把青灰色的旧油纸伞，用袖口慢慢擦了一遍，才挂回去。*\n\n「记得。这镇子小，一条街，一个渡口。走一个人，十年也散不干净。」\n\n*她转回柜台前，替你续了半盏热茶，茶烟隔在你们中间。*\n\n「客官想打听他的什么？」"
save("lab-tail", {"draft": r1["final"], "text": trail, **lab("tail", {"draft": r1["final"], "text": trail}), "withFormat": lab("tail", {"draft": r1["final"], "text": "<status>好感 +2｜地点：听雨轩</status>"})["merged"]})
ent = lambda i, t, **kw: {"id": i, "type": t, **kw}
gE = ent("g", "custom_message", customType="rp-greeting", content=sysd["greeting"])
u1E = ent("u1", "message", message={"role": "user", "content": U1})
A = [gE, u1E, ent("a1", "message", message={"role": "assistant", "content": r1["final"]}), ent("s1", "custom", customType="rp-state", data=s1)]
B = [gE, u1E, ent("a1b", "message", message={"role": "assistant", "content": r1b["final"]}), ent("s1b", "custom", customType="rp-state", data=s1b)]
save("lab-branch", lab("branch", {"branches": [A, B]}))
save("lab-render", lab("render"))
W = f"{H}/ws"
save("lab-sandbox", lab("sandbox", {"cases": [
    {"tool": "write", "input": {"path": "cards/青梧/补充设定集.json"}},
    {"tool": "read", "input": {"path": "assets/lorebooks/栖水镇.json"}},
    {"tool": "write", "input": {"path": "assets/lorebooks/栖水镇.json"}},
    {"tool": "read", "input": {"path": "cards/青梧/对话/局B/会话/s.jsonl"}},
    {"tool": "write", "input": {"path": "cards/青梧/对话/局A/历史/检查点.jsonl"}},
    {"tool": "write", "input": {"path": "notes.txt"}},
    {"tool": "bash", "input": {"command": "ls cards"}},
    {"tool": "bash", "input": {"command": "cd cards && rm -rf 青梧"}},
    {"tool": "bash", "input": {"command": "rm -rf /"}},
    {"tool": "bash", "input": {"command": "python cleanup.py"}}]}))

# ---- 剧情压缩 ----
ents = A + [ent("u2", "message", message={"role": "user", "content": U2}), ent("a2", "message", message={"role": "assistant", "content": r2["final"]})]
sp = lab("summary-prompt", {"entries": ents, "state": s2})
summary, _ = side(sp["systemPrompt"], sp["userText"], 4096)
U3E = ent("u3", "message", message={"role": "user", "content": "（下一轮）我点点头，从怀里取出一封受潮的信。"})
after = lab("branch", {"branches": [ents + [ent("sum", "custom", customType="rp-summary", data={"summary": summary, "coversThroughId": "a2"}), U3E]]})["branches"][0]
save("compact", {"systemPrompt": sp["systemPrompt"], "userText": sp["userText"], "summary": summary,
    "summaryMessage": f"【前情提要】以下是更早剧情的接力摘要，是既定事实：\n\n{summary}", "historyAfter": after["history"]})
print("compact ok", flush=True)

# ---- 跨局记忆：复盘 → 合并 → 遗忘 ----
transcript = sp["conversationText"]
rp = lab("recap-prompt", {"evidence": {"transcript": transcript, "omittedChars": 0, "beats": 2, "stateSnapshot": json.dumps(s2, ensure_ascii=False, indent=2)}, "chatName": "雨夜问名"})
recapA, _ = side(rp["systemPrompt"], rp["userText"], 4096)
other = open(f"{H}/recap-other.md").read()
cp1 = lab("consolidate-prompt", {"diff": {"changed": [{"chatId": "jA", "name": "雨夜问名", "text": recapA}, {"chatId": "jB", "name": "茶田来信", "text": other}], "deleted": [], "hashes": {}}})
raw1, _ = side(cp1["systemPrompt"], cp1["userText"], 8192)
m1 = lab("consolidate-parse", {"raw": raw1})
cp2 = lab("consolidate-prompt", {"diff": {"changed": [], "deleted": ["jB"], "hashes": {}}, "handbook": m1.get("handbook"), "resident": m1.get("resident")})
raw2, _ = side(cp2["systemPrompt"], cp2["userText"], 8192)
m2 = lab("consolidate-parse", {"raw": raw2})
fit = {str(n): lab("resident-fit", {"text": m1.get("resident", ""), "otherChars": n})["fitted"] for n in (3900, 4200)}
save("memory", {"recapPrompt": rp, "recapA": recapA, "recapB": other, "mergePrompt": cp1, "merged": m1, "forgetPrompt": cp2, "afterForget": m2, "fit": fit})
print("memory ok", flush=True)

# ---- 预设声明 ----
dp = lab("declare-prompt")
draw, _ = side(dp["systemPrompt"], dp["userText"], 16384)
save("declare", {"prompt": dp, "raw": draw, **lab("declare-apply", {"raw": draw, "model": SIDE})})
print("declare ok", flush=True)

# ---- agent 模式：改两章，轮末检查点 ----
chat_dir = f"{W}/cards/青梧/对话/局C"; story = f"{chat_dir}/正文"
shutil.rmtree(chat_dir, ignore_errors=True); os.makedirs(story)
open(f"{story}/000-开场.md", "w").write(sysd["greeting"].split("\n", 1)[1])
open(f"{story}/001-雨夜问名.md", "w").write(r1["final"])
open(f"{story}/002-坦言.md", "w").write(r2["final"])
c0 = lab("story-commit", {"chatDir": chat_dir, "author": "user", "message": "导入三章"})
asys = lab("agent-system", {"cwd": W, "cardPath": "cards/青梧/default_Qingwu.json", "storyDir": "cards/青梧/对话/局C/正文", "storyAbs": story, "state": s2})
q1 = re.findall(r"「[^「」]+」", r1["final"])
UA = f"第一章里她答的那句{q1[0] if q1 else '第一句对白'}太干了，改得更有余味一点；第二章结尾补一句雨停了的描写。"
FT = [{"type": "function", "function": f} for f in [
    {"name": "read", "description": "Read a file (path relative to cwd).", "parameters": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
    {"name": "grep", "description": "Search file contents.", "parameters": {"type": "object", "properties": {"pattern": {"type": "string"}, "path": {"type": "string"}}, "required": ["pattern"]}},
    {"name": "edit", "description": "Replace exact text in a file.", "parameters": {"type": "object", "properties": {"path": {"type": "string"}, "oldText": {"type": "string"}, "newText": {"type": "string"}}, "required": ["path", "oldText", "newText"]}},
    {"name": "write", "description": "Write a whole file.", "parameters": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}}]]
msgs = [{"role": "system", "content": asys["system"]}, {"role": "user", "content": f"{asys['stateBlock']}\n\n{UA}"}]
arec = {"user": UA, "system": asys["system"], "stateBlock": asys["stateBlock"], "steps": []}
for rnd in range(1, 21):
    d = chat({"model": MAIN, "messages": msgs, "tools": FT, "thinking": {"type": "enabled"}, "reasoning_effort": "high"})
    m = d["choices"][0]["message"]; step = {"round": rnd, "reasoning": m.get("reasoning_content"), "content": m.get("content"), "calls": []}
    arec["steps"].append(step); msgs.append({k: m[k] for k in ("role", "content", "reasoning_content", "tool_calls") if m.get(k) is not None})
    if not m.get("tool_calls"): break
    for c in m["tool_calls"]:
        n, a = c["function"]["name"], json.loads(c["function"]["arguments"] or "{}")
        path = os.path.join(W, a.get("path", "")) if a.get("path") else story
        try:
            if n == "read": res = open(path).read()
            elif n == "grep": res = "\n".join(f"{os.path.relpath(os.path.join(story, f), W)}: {l}" for f in sorted(os.listdir(story)) for l in open(os.path.join(story, f)).read().splitlines() if re.search(a["pattern"], l))
            elif n == "edit":
                t = open(path).read()
                if a["oldText"] not in t: res = "Error: oldText not found"
                else: open(path, "w").write(t.replace(a["oldText"], a["newText"], 1)); res = "ok"
            elif n == "write": open(path, "w").write(a["content"]); res = "ok"
            else: res = "unknown tool"
        except Exception as e: res = f"Error: {e}"
        step["calls"].append({"name": n, "args": a, "result": res if len(res) < 800 else res[:800] + "…"})
        msgs.append({"role": "tool", "tool_call_id": c["id"], "content": res})
c1 = lab("story-commit", {"chatDir": chat_dir, "author": "agent", "message": UA[:60]})
arec |= {"checkpoint0": c0["checkpoint"], "checkpoint1": c1["checkpoint"], "chapters": {f: open(f"{story}/{f}").read() for f in sorted(os.listdir(story))},
         "objects": sorted(os.listdir(f"{chat_dir}/历史/对象")), "log": open(f"{chat_dir}/历史/检查点.jsonl").read()}
save("agent", arec)
print("agent ok", flush=True)
