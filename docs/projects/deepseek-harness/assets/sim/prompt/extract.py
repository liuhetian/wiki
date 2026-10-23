"""Turn the project's own recorded session logs and the experiment outputs into
the small text blocks the page quotes. Reads only; computes nothing dsh would."""
import json, os, pathlib

HERE = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path(os.environ.get('DSH_REPO', '/tmp/dsh-src/deepseek-harness'))
OUT, TXT = HERE / 'out', HERE / 'txt'
TXT.mkdir(exist_ok=True)


def events(rel):
    return [json.loads(line) for line in (REPO / rel).read_text().splitlines() if line.strip()]


def message(e):
    d = e.get('data', {})
    return d.get('message', d)


def text(m):
    return ''.join(b.get('text', '') for b in m.get('content', []) if isinstance(b, dict))


def op(e):
    s = e.get('surfaceOp')
    return s if isinstance(s, str) or s is None else f"replace {s['startSeq']}..{s['endSeq']}"


def listing(rel, types, first_line=True, limit=None):
    rows = []
    for i, e in enumerate(events(rel)):
        if e['type'] not in types:
            continue
        m = message(e)
        if e['type'] in ('user/message', 'system/message', 'developer/message'):
            body = text(m) or json.dumps(m.get('content'), ensure_ascii=False)
            body = body.split('\n', 1)[0] if first_line else body
            rows.append(f"{i:>3} {e['type']:<18} {m['source']['kind']:<17} {op(e) or '':<14} {body[:limit] if limit else body}")
        else:
            rows.append(f"{i:>3} {e['type']}")
    return '\n'.join(rows) + '\n'


MSG = ('system/message', 'user/message', 'developer/message', 'request/header', 'turn/start', 'step/start', 'assistant/message', 'tool/result')

# First request of a real Web turn, as the project recorded it.
(TXT / 'first-request-order.txt').write_text(listing(
    'snapshots/web/fresh-round-trip/session.v4.jsonl',
    ('turn/start', 'step/start', 'system/message', 'user/message', 'request/header'), limit=90).split(' 12 request/header')[0] + ' 12 request/header\n')

# Policy switched three times across four turns: what was appended, and the recorded usage.
rows = []
for i, e in enumerate(events('snapshots/web/permission-policy-context/session.v4.jsonl')):
    t = e['type']
    if t == 'turn/start':
        rows.append(f"--- turn {e['data']['turn']}")
    elif t in ('permission/preset',):
        rows.append(f"{i:>3} permission/preset  {e['data']['preset']}")
    elif t in ('system/message', 'user/message'):
        m = message(e)
        body = text(m)
        if m['source']['kind'] == 'runtime-context':
            body = [line for line in body.split('\n') if line.startswith(('Current DSH file policy', 'Approval'))]
            body = ' | '.join(line.split('.')[0] for line in body)
        else:
            body = body.split('\n', 1)[0][:80]
        rows.append(f"{i:>3} {t:<18} {m['source']['kind']:<15} {body}")
    elif t == 'assistant/message' and e['data'].get('usage'):
        u = e['data']['usage']
        rows.append(f"{i:>3} assistant/message  usage: uncached {u['inputTokens']}, cache read {u.get('cacheReadTokens', 0)}")
(TXT / 'policy-switch.txt').write_text('\n'.join(rows) + '\n')

# Skill catalog injected as a user message (headless skill-load scenario).
for e in events('snapshots/session/skill-load/session.v4.jsonl'):
    if e['type'] == 'user/message' and message(e)['source']['kind'] == 'skill-catalog':
        (TXT / 'skill-catalog.txt').write_text(text(message(e)) + '\n')
        break

# Model switch: node 0 replaced, then a notice.
(TXT / 'model-switch.txt').write_text(listing(
    'snapshots/session/model-switch-notice/session.v4.jsonl',
    ('system/message', 'user/message', 'request/header'), limit=150))

# Tool registry changes inside a request series.
(TXT / 'tool-updates.txt').write_text(listing(
    'snapshots/session/dynamic-tool-prompt-updates/session.v4.jsonl',
    ('system/message', 'user/message', 'developer/message', 'request/header'), limit=90))

# In-history prompt change recorded by the project's own scenario.
(TXT / 'in-history-log.txt').write_text(listing(
    'snapshots/session/system-prompt-in-history/session.v4.jsonl',
    ('step/start', 'system/message', 'user/message', 'tool/result', 'request/header'), limit=60))

# Real-model cache comparison.
s = json.loads((OUT / 'cache-summary.json').read_text())
lines = ['request                                   uncached  cache read  output']
for n, u in enumerate(s['turn1'], 1):
    lines.append(f"turn 1 step {n}                             {u['inputTokens']:>8}  {u['cacheReadTokens']:>10}  {u['outputTokens']:>6}")
for key, label in (('t2-replace-node0', 'turn 2, changed prompt replaces node 0'), ('t2-in-history', 'turn 2, changed prompt appended in history')):
    u = s[key]
    lines.append(f"{label:<42}{u['inputTokens']:>8}  {u['cacheReadTokens']:>10}  {u['outputTokens']:>6}")
(TXT / 'cache-compare.txt').write_text('\n'.join(lines) + '\n')


def label(prompt):
    kind = 'plan-mode prompt' if 'You are in plan mode' in prompt else 'default prompt'
    return f'{kind}, {len(prompt)} chars'


def wire(name):
    body = json.loads((OUT / f'{name}.body.json').read_text())
    rows = [f"system (top-level)  {label(body['system'])}", f"tools               {len(body['tools'])} schemas"]
    for m in body['messages']:
        kinds = ','.join(b['type'] for b in m['content'])
        if m['role'] == 'system':
            rows.append(f"{m['role']:<9} [{kinds}]  {label(m['content'][0]['text'])}")
            continue
        first = next((b['text'] for b in m['content'] if b['type'] == 'text'), '')
        rows.append(f"{m['role']:<9} [{kinds}]  {first.split(chr(10), 1)[0][:70]!r}")
    return '\n'.join(rows) + '\n'


(TXT / 'wire-in-history.txt').write_text(wire('t2-in-history'))
(TXT / 'wire-replace.txt').write_text(wire('t2-replace-node0'))

# Where the plan-mode prompt diverges from the default one.
a = (OUT / 'dump-flash' / 'web-system-prompt.txt').read_text()
b = (OUT / 'dump-flash' / 'web-system-prompt-plan.txt').read_text()
k = next(i for i, (x, y) in enumerate(zip(a, b)) if x != y)
(TXT / 'plan-diverge.txt').write_text(
    f'default prompt: {len(a)} chars; plan-mode prompt: {len(b)} chars; first difference at char {k}\n'
    f'...{b[k - 60:k]!r}\n+  {b[k:k + 90]!r}...\n')
print('ok', sorted(p.name for p in TXT.iterdir()))

# The real Web composition's assembled prompt vs the project's committed pin.
dumped = (OUT / 'dump-web' / 'web-system-prompt.txt').read_bytes()
pinned = (REPO / 'snapshots/web/fresh-round-trip/system-prompt.expected.md').read_bytes()
(TXT / 'prompt-equal.txt').write_text(
    f'assembled by the in-process Web composition: {len(dumped)} bytes\n'
    f'snapshots/web/fresh-round-trip/system-prompt.expected.md: {len(pinned)} bytes\n'
    f'byte-identical: {dumped == pinned}\n')
for name in ('web-runtime-context.txt', 'strict-model-error.txt'):
    (TXT / name).write_text((OUT / 'dump-web' / name).read_text())
for p in OUT.glob('instructions-*.txt'):
    (TXT / p.name).write_text(p.read_text())
