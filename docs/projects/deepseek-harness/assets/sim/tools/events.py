"""从上游快照里提交的会话日志摘出放宽申请相关的事件，写成页面上引用的效果文本。"""
import json, pathlib
R = pathlib.Path('/tmp/dsh-src/deepseek-harness/snapshots/acp')
HERE = pathlib.Path(__file__).parent
KEEP = {'permission/preset', 'sandbox/mode', 'approval/policy', 'tool/call', 'approval/asked', 'approval/decided', 'tool/result', 'assistant/message'}

def brief(t, d):
    if t == 'tool/call':
        a = json.loads(d['arguments'])
        return f"bash  command={a['command']!r}\n      sandbox_permissions={a.get('sandbox_permissions')!r}  justification={a.get('justification')!r}"
    if t == 'tool/result':
        m = d['message']
        return f"isError={m['isError']}  {''.join(b.get('text', '') for b in m['content'])!r}"
    if t == 'assistant/message':
        texts = [b['text'] for b in d['message']['content'] if b['type'] == 'text']
        return f"text={texts[0]!r}" if texts else '(tool call)'
    if t in ('approval/asked',):
        return f"reason={d['reason']!r}"
    if t == 'approval/decided':
        return f"outcome={d['outcome']}"
    return json.dumps(d, ensure_ascii=False)

for sc in ['escalation-approved', 'escalation-rejected']:
    lines = []
    for i, l in enumerate((R / sc / 'session.v4.jsonl').read_text().splitlines()):
        e = json.loads(l)
        t = e.get('type')
        if t in KEEP:
            lines.append(f"{i:>2} {t:<18} {brief(t, e['data'])}")
    (HERE / 'txt' / f'{sc}.txt').write_text('\n'.join(lines) + '\n')
    print(sc); print('\n'.join(lines)); print()
