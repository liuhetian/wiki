"""Extract the page excerpts from one run.sh run.

Usage: python3 analyze.py <calls-dir> <logs-dir> <txt-out-dir>
<calls-dir>: relay.py's out/calls (NNN.request.json, NNN.response.txt, index.jsonl)
<logs-dir>:  the session logs dsh wrote, decompressed (zstd -d)
Call numbers below are the ones this run produced (see out/calls-index.jsonl).
"""
import json, pathlib, sys

calls, logs, out = map(pathlib.Path, sys.argv[1:4])
req = lambda n: json.loads((calls / f'{n:03d}.request.json').read_text())
index = {r['n']: r for r in map(json.loads, (calls / 'index.jsonl').read_text().splitlines())}
FORK_PARENT, FORK_CHILD, SPAWN_PARENT, SPAWN_CHILD = 2, 4, 10, 12  # turn-2 step-1 parents, first child requests


def texts(message):
    return [b['text'] for b in message['content'] if b.get('type') == 'text']


def row(label, n):
    u = index[n]['usage']
    total = u['input_tokens'] + u['cache_read_input_tokens']
    return (f"{label:<44} #{n:<3} messages {index[n]['messages']:>2}  input {total:>6}  "
            f"cache hit {u['cache_read_input_tokens']:>6}  uncached {u['input_tokens']:>5}")


fp, fc, sp, sc = req(FORK_PARENT), req(FORK_CHILD), req(SPAWN_PARENT), req(SPAWN_CHILD)
lines = [
    row('fork:  parent, turn 2 step 1 (calls the tool)', FORK_PARENT),
    row('fork:  child, first request', FORK_CHILD),
    row('spawn: parent, turn 2 step 1 (calls the tool)', SPAWN_PARENT),
    row('spawn: child, first request', SPAWN_CHILD),
    '',
    f"fork child  vs its parent: tools equal {fc['tools'] == fp['tools']}, system equal {fc['system'] == fp['system']}, "
    f"first {2} messages equal {fc['messages'][:2] == fp['messages'][:2]}",
    f"spawn child vs its parent: tools equal {sc['tools'] == sp['tools']}, system equal {sc['system'] == sp['system']}, "
    f"first message equal {sc['messages'][:1] == sp['messages'][:1]}",
    f"model {fc['model']}, thinking {fc['thinking']}, output_config {fc['output_config']}, max_tokens {fc['max_tokens']}",
]
(out / 'cache-compare.txt').write_text('\n'.join(lines) + '\n')

(out / 'fork-child-last-user.txt').write_text('\n\n---\n\n'.join(texts(fc['messages'][-1])) + '\n')
(out / 'spawn-child-task.txt').write_text(texts(sc['messages'][0])[0] + '\n')

tools = {t['name']: t for t in fp['tools']}
desc = []
for name in ('subagent', 'subagent_fork'):
    t = tools[name]
    desc.append(f"## {name}\n{t['description']}\n\nprompt: {t['input_schema']['properties']['prompt']['description']}")
(out / 'subagent-tool-descriptions.txt').write_text('\n\n'.join(desc) + '\n')


def short(event):
    d = json.dumps(event.get('data', {}), ensure_ascii=False)
    if '<document>' in d:
        d = d[:90] + ' …(design document)…'
    return f"seq {event.get('seq', '-'):>2} {event['type']:<38} {d[:150]}"


fork_child_log = next(p for p in logs.iterdir() if json.loads(p.open().readline()).get('origin') == 'subagent'
                      and json.loads(p.open().readline())['parentSession'].startswith('session-b41'))
events = [json.loads(l) for l in fork_child_log.read_text().splitlines()]
(out / 'fork-child-log.txt').write_text(
    json.dumps(events[0], ensure_ascii=False) + '\n' + '\n'.join(short(e) for e in events[1:29]) + '\n')

parent_log = next(p for p in logs.iterdir() if p.name.startswith('session-b41'))
pe = [json.loads(l) for l in parent_log.read_text().splitlines()][1:]
delivered = [e for e in pe if e['type'] == 'user/message' and e['data']['source']['kind'] in ('agent-message', 'subagent-settled')]
(out / 'parent-delivered.txt').write_text('\n\n'.join(
    "seq {seq}, opens turn {turn} step {step}, source {kind}:\n".format(
        seq=e['seq'], kind=e['data']['source']['kind'],
        **[x['data'] for x in pe if x['type'] == 'step/start' and x['seq'] < e['seq']][-1])
    + '\n'.join(texts(e['data'])) for e in delivered) + '\n')
print('ok')
