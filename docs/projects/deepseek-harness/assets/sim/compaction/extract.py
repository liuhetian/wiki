"""从 run.ts / proxy.py / control.py 的原始记录里摘出页面逐块引用的效果文本，只做摘录不做计算。

用法：python3 extract.py <run_dir> <first_run_dir>
"""
import json, pathlib, sys

run, first = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
txt = run / 'txt'
txt.mkdir(exist_ok=True)
events = [json.loads(line) for line in (run / 'session-events.jsonl').read_text().splitlines()]
calls = [json.loads(line) for line in (run / 'proxy' / 'calls.jsonl').read_text().splitlines()]


def text_of(message):
    return ''.join(b.get('text', '') for b in message['content'] if b.get('type') == 'text')


# 1. 每次模型调用的用量
rows = ['  #  用途          消息数  新输入  命中缓存  输出']
for c in calls:
    u = c['usage']
    rows.append(f"{c['n']:>3}  {c['purpose']:<12}  {c['messages']:>5}  {u.get('input_tokens', 0):>6}  {u.get('cache_read_input_tokens', 0):>8}  {u.get('output_tokens', 0):>5}")
ctrl = json.loads((run / 'control' / 'control-response.json').read_text())['usage']
rows.append(f"对照  {'pi 格式摘要':<10}  {1:>5}  {ctrl['input_tokens']:>6}  {ctrl['cache_read_input_tokens']:>8}  {ctrl['output_tokens']:>5}")
(txt / 'calls.txt').write_text('\n'.join(rows) + '\n')

# 2. 压缩请求和上一个对话请求逐字节比对
comp = next(c['n'] for c in calls if c['purpose'] == 'compaction')
prev = json.loads((run / 'proxy' / f'{comp - 1:03d}-request.json').read_text())
req = json.loads((run / 'proxy' / f'{comp:03d}-request.json').read_text())
same = 0
for a, b in zip(prev['messages'], req['messages']):
    if a != b:
        break
    same += 1
last = req['messages'][-1]
tail_same = prev['messages'][same]['content'] == last['content'][:-1] if same == len(req['messages']) - 1 else False
shape = [
    f"上一个对话请求（第 {comp - 1} 次调用）：{len(prev['messages'])} 条消息",
    f"压缩请求（第 {comp} 次调用）：{len(req['messages'])} 条消息",
    f"system 逐字节相同：{prev['system'] == req['system']}",
    f"tools 逐字节相同：{prev.get('tools') == req.get('tools')}（{len(req.get('tools', []))} 个工具）",
    f"thinking / output_config 相同：{prev['thinking'] == req['thinking'] and prev['output_config'] == req['output_config']}",
    f"前 {same} 条消息逐字节相同；第 {same + 1} 条（最后一条）的前 {len(last['content']) - 1} 个块也相同 = {tail_same}，只在末尾多了一块",
    '',
    '压缩请求最后一条 user 消息的内容块：',
] + [f"  - {b['type']}" + (f": {b['text'][:110]}…" if b['type'] == 'text' else '') for b in last['content']]
(txt / 'request-shape.txt').write_text('\n'.join(shape) + '\n')

# 3. 被裁剪的工具结果：原文与裁剪后
marker = '[... tool result middle pruned ...]'
prune = next(e for e in events if e['type'] == 'compaction/prune')
orig_seq = prune['data']['shadowedSeqs'][0]
orig = text_of(events[orig_seq]['data']['message'])
repl = next(e for e in events if e['type'] == 'tool/result' and e.get('sourceEventSeqs') == [orig_seq])
pruned = text_of(repl['data']['message'])
i = pruned.index(marker)
view = [
    f"seq {orig_seq} 原文 {len(orig)} 字符 → seq {repl['seq']} 替换后 {len(pruned)} 字符"
    f"（头 {i - 2} + 标记 + 尾 {len(pruned) - i - len(marker) - 2}）",
    f"surfaceOp: {json.dumps(repl['surfaceOp'])}  sourceEventSeqs: {repl['sourceEventSeqs']}",
    '',
    '……（前面略）',
    pruned[i - 260:i + len(marker) + 200],
    '……（后面略）',
]
(txt / 'pruned.txt').write_text('\n'.join(view) + '\n')

# 模型看到裁剪标记之后的反应：这一步的 reasoning 开头和它发出的调用
for e in events:
    if e['type'] == 'assistant/message' and any('pruned' in b.get('text', '') for b in e['data']['message']['content'] if b.get('type') == 'reasoning'):
        r = next(b['text'] for b in e['data']['message']['content'] if b.get('type') == 'reasoning')
        call = next(x for x in events if x['type'] == 'tool/call' and x['seq'] > e['seq'])
        (txt / 'pruned-reaction.txt').write_text(
            f"seq {e['seq']} reasoning：{r.strip().splitlines()[0][:200]}\n"
            f"seq {call['seq']} tool/call：{call['data']['name']} {call['data']['arguments']}\n")
        break

# 4. 检查点原文
cps = [e for e in events if e['type'] == 'user/message' and e['data']['source']['kind'] == 'compact-checkpoint']
for n, e in enumerate(cps, 1):
    head = f"seq {e['seq']} user/message  source={e['data']['source']['kind']}  surfaceOp={json.dumps(e['surfaceOp'])}\n\n"
    (txt / f'checkpoint{n}.txt').write_text(head + text_of(e['data']) + '\n')

# 5. 补回：被压掉的 AGENTS.md 基线和运行时上下文，在下一步重发
first_cp = cps[0]
shadowed = set(first_cp['sourceEventSeqs'])
lines = []
for kind in ('agent-instructions', 'runtime-context'):
    old = next(e for e in events if e['type'] == 'user/message' and e['data']['source']['kind'] == kind)
    new = next(e for e in events if e['type'] == 'user/message' and e['data']['source']['kind'] == kind and e['seq'] > first_cp['seq'])
    lines.append(f"{kind}: seq {old['seq']} 被检查点 seq {first_cp['seq']} 遮住 = {old['seq'] in shadowed}；"
                 f"seq {new['seq']} 重发，正文与 seq {old['seq']} 相同 = {text_of(old['data']) == text_of(new['data'])}")
lines += ['', '重发的 runtime-context 正文：', text_of(next(e['data'] for e in events if e['seq'] > first_cp['seq'] and e['type'] == 'user/message' and e['data']['source']['kind'] == 'runtime-context'))]
(txt / 'reinject.txt').write_text('\n'.join(lines) + '\n')

# 6. 第一次实跑（阈值 8,000）里那次被拒收的摘要
fe = [json.loads(line) for line in (first / 'session-events.jsonl').read_text().splitlines()]
bad_end = next(e for e in fe if e['type'] == 'compaction/end' and 'error' in e['data'])
bad_start = next(e for e in fe if e['type'] == 'compaction/start' and e['seq'] < bad_end['seq'] and e['data']['compactionId'] == bad_end['data']['compactionId'])
fcalls = [json.loads(line) for line in (first / 'proxy' / 'calls.jsonl').read_text().splitlines()]
bad_call = next(c for c in fcalls if c['purpose'] == 'compaction')
blocks, stop = [], None
for line in (first / 'proxy' / f"{bad_call['n']:03d}-response.sse").read_text().splitlines():
    if line.startswith('data: '):
        ev = json.loads(line[6:])
        if ev['type'] == 'content_block_start':
            cb = ev['content_block']
            blocks.append(cb['type'] + (f" {cb.get('name')}" if cb['type'] == 'tool_use' else ''))
        if ev['type'] == 'message_delta':
            stop = ev['delta']['stop_reason']
rej = [
    f"第 {bad_call['n']} 次调用（压缩）的返回：{', '.join(blocks)}；stop_reason={stop}",
    f"seq {bad_start['seq']} compaction/start",
    f"seq {bad_end['seq']} compaction/end  error: {bad_end['data']['error']}",
    f"seq {bad_end['seq'] + 1} {fe[bad_end['seq'] + 1]['type']}  ← 本轮照常往下走",
]
(txt / 'rejected.txt').write_text('\n'.join(rej) + '\n')
print('\n'.join(rows)); print(); print('\n'.join(shape)); print(); print('\n'.join(view)); print(); print('\n'.join(lines[:2])); print(); print('\n'.join(rej))

# 7. 第一次触发压力：只裁剪、没摘要的那一段事件
first_prune = next(e for e in events if e['type'] == 'compaction/prune')
seg = []
for e in events[first_prune['seq'] - 3: first_prune['seq'] + 8]:
    t = e['type']
    note = ''
    if t == 'compaction/prune':
        note = f"shadowedSeqs={e['data']['shadowedSeqs']} shadowedTokenCount={e['data']['shadowedTokenCount']}"
    elif t == 'tool/result' and e.get('surfaceOp') not in (None, 'append'):
        note = f"replace {e['surfaceOp']['startSeq']}，{len(text_of(e['data']['message']))} 字符"
    elif t == 'tool/result':
        note = f"{len(text_of(e['data']['message']))} 字符"
    elif t == 'tool/call':
        note = f"{e['data']['name']} {e['data']['arguments']}"
    seg.append(f"{e['seq']:>3}  {t:<18} {note}")
nxt = next(e for e in events if e['seq'] > first_prune['seq'] and e['type'] in ('compaction/start', 'request/header'))
seg.append(f"（seq {first_prune['seq']}–{nxt['seq']} 之间没有 compaction/start：裁完已低于阈值，这一步不摘要）")
(txt / 'first-pressure.txt').write_text('\n'.join(seg) + '\n')
print('\n'.join(seg))
