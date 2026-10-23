"""把项目会话快照 snapshots/session/bash-tool-turn/session.v4.jsonl 摘成一行一个事件（只做展示，不改内容）。"""
import json, sys
rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
out = []
for r in rows:
    t, d = r['type'], r.get('data', {})
    if t == 'session':
        out.append(f"(header) version={r.get('version')}"); continue
    op = r.get('surfaceOp'); ops = '' if op is None else (op if isinstance(op, str) else f"replace {op['startSeq']}..{op['endSeq']}")
    text = lambda m: json.dumps(''.join(b.get('text', '') for b in m['content']), ensure_ascii=False)[:56]
    extra = ''
    if t == 'user/message': extra = f"source={d['source']['kind']}: " + text(d)
    elif t == 'assistant/message': extra = ' + '.join(b['type'] if b['type'] != 'tool-call' else 'tool-call ' + b['name'] for b in d['message']['content'])
    elif t == 'tool/result': extra = text(d['message'])
    elif t == 'request/header': extra = 'reason=' + d['reason']
    elif t == 'system/message': extra = text(d['message'])
    elif t == 'turn/end': extra = 'reason=' + d['reason']['kind']
    out.append(f"{t:<20} {ops:<7} {extra}".rstrip())
print('\n'.join(out))
