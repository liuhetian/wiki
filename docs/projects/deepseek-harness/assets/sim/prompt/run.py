"""Driver for the in-history system-prompt experiment.

Holds the API key (through ../ds_call.py); never runs dsh code in-process.
Every request body is built by dsh's own serializer and every streamed reply is
parsed by dsh's own SSE parser + translator + block assembler, both in
lab.ts under `env -i` (no secrets in that process).

Turn 1: a real Web-default first request (system prompt, tools and runtime
context dumped from the real Web composition by web-prompt.dump.ts) asking the
model to read a source file; tool results are constructed in the read tool's
format from the real file. Turn 2: the user switches to plan mode, so the
rendered system prompt changes at char ~111. The same turn-2 request is
serialized two ways and sent:
  R2b  node 0 replaced (what an incapable route or a new request series does)
  R2a  new system node appended after the cached history (in-history, what
       dsh does on deepseek-flash within a continuing series)
"""
import json, os, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from ds_call import call  # noqa: E402

REPO = os.environ.get('DSH_REPO', '/tmp/dsh-src/deepseek-harness')
TSX = f'{REPO}/node_modules/.bin/tsx'
OUT = HERE / 'out'
DUMP = OUT / 'dump-flash'
CWD = REPO
FILE = 'packages/core/system-prompt/src/index.ts'


def lab(*args):
    env = {'HOME': os.environ['HOME'], 'PATH': os.environ['PATH']}  # no secrets
    subprocess.run([TSX, str(HERE / 'lab.ts'), *map(str, args)], check=True, cwd=REPO, env=env)


def fill(text):
    return (text.replace('{{cwd}}', CWD).replace('{{sourceRoot}}', REPO)
            .replace('{{webUrl}}', 'http://127.0.0.1:3080/'))


def time_reading(turn, step, stamp, elapsed):
    return (f'Time sampled while preparing turn {turn}, step {step}: {stamp}\n'
            'Browser time zone for this request: Asia/Shanghai. Interpret otherwise-unqualified dates and times in this zone.\n'
            f'Elapsed since the preceding model-visible message: {elapsed}.')


def read_result(path):
    lines = (pathlib.Path(REPO) / path).read_text().split('\n')
    if lines and lines[-1] == '':
        lines = lines[:-1]
    body = '\n'.join(f'{i}: {line}' for i, line in enumerate(lines, 1))
    return f'<path>{CWD}/{path}</path>\n<type>file</type>\n<content>\n{body}\n\n(End of file - total {len(lines)} lines)\n</content>'


def send(name, history):
    (OUT / f'{name}.history.json').write_text(json.dumps(history, ensure_ascii=False, indent=2))
    lab('body', OUT / f'{name}.history.json', DUMP / 'web-tool-schemas.json', OUT / f'{name}.body.json')
    body = json.loads((OUT / f'{name}.body.json').read_text())
    (OUT / f'{name}.sse').write_text(call(body))
    lab('parse', OUT / f'{name}.sse', OUT / f'{name}.assistant.json')
    reply = json.loads((OUT / f'{name}.assistant.json').read_text())
    print(name, json.dumps(reply['usage']), reply['finish'])
    return reply


def run_turn(prefix, history, max_steps=6):
    usages = []
    for step in range(1, max_steps + 1):
        reply = send(f'{prefix}-step{step}', history)
        usages.append(reply['usage'])
        history.append({'role': 'assistant', 'content': reply['content'], 'replayState': reply['replayState']})
        calls = [b for b in reply['content'] if b['type'] == 'tool-call']
        if not calls:
            return history, usages
        for c in calls:
            args = json.loads(c['arguments'] or '{}')
            if c['name'] == 'read' and args.get('file_path', '').endswith(FILE):
                history.append({'role': 'tool', 'callId': c['id'], 'text': read_result(FILE)})
            else:
                history.append({'role': 'tool', 'callId': c['id'], 'isError': True,
                                'text': f'Error: {c["name"]} is not available in this experiment; the file to read is {FILE}.'})
    return history, usages


def main():
    OUT.mkdir(exist_ok=True)
    p0 = (DUMP / 'web-system-prompt.txt').read_text().rstrip('\n')
    p1 = (DUMP / 'web-system-prompt-plan.txt').read_text().rstrip('\n')
    runtime = fill((DUMP / 'web-runtime-context.txt').read_text().rstrip('\n'))
    task = (f'Use the read tool to read {FILE}, then explain in three short bullets '
            'how the system prompt sections are ordered and joined.')
    history = [
        {'role': 'system', 'text': p0},
        {'role': 'user', 'text': task},
        {'role': 'user', 'kind': 'runtime-context', 'text': runtime},
        {'role': 'user', 'kind': 'time-context', 'text': time_reading(1, 1, '2026-10-20T20:40:00.000+08:00', 'unavailable')},
    ]
    history, turn1 = run_turn('t1', history)

    turn2_user = [
        {'role': 'user', 'text': 'Now plan how to add a TOOL_TODO section order between TOOL_JOBS and TOOL_PTY. Do not edit anything yet.'},
        {'role': 'user', 'kind': 'plan-mode', 'text': 'The user switched this session to plan mode.'},
        {'role': 'user', 'kind': 'time-context', 'text': time_reading(2, 1, '2026-10-20T20:43:00.000+08:00', '2m 10s')},
    ]
    # R2b: the changed prompt replaces node 0; everything after it is unchanged.
    replaced = [{'role': 'system', 'text': p1}] + history[1:] + turn2_user
    # R2a: dsh commits the changed prompt as a new system node before the step's
    # user messages; the serializer places it after that user turn.
    appended = history + [{'role': 'system', 'text': p1}] + turn2_user
    r2b = send('t2-replace-node0', replaced)
    r2a = send('t2-in-history', appended)
    summary = {
        'turn1': turn1,
        't2-replace-node0': r2b['usage'],
        't2-in-history': r2a['usage'],
    }
    (OUT / 'cache-summary.json').write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
