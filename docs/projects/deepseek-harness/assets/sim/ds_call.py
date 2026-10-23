"""Send a request body (JSON file) to DeepSeek's Anthropic-compatible Messages API via the wiki gateway.
Strips dsh_* top-level fields (session-log upload), never prints the key. Saves raw response."""
import json, os, sys, pathlib, urllib.request

ENV = pathlib.Path('/data2/work/lht/study/26.06/zensical-wiki/.env')
BASE = 'https://deepseek-proxy.liuhetian.work/anthropic/v1/messages'

def key():
    for line in ENV.read_text().splitlines():
        if line.startswith('MY_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit('MY_API_KEY missing')

def call(body, headers=None):
    body = {k: v for k, v in body.items() if not k.startswith('dsh_')}
    h = {'content-type': 'application/json', 'authorization': 'Bearer ' + key(), 'anthropic-version': '2023-06-01'}
    h.update(headers or {})
    req = urllib.request.Request(BASE, data=json.dumps(body).encode(), headers=h, method='POST')
    with urllib.request.urlopen(req, timeout=600) as r:
        return r.read().decode()

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    body = json.loads(pathlib.Path(src).read_text())
    hdrs = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
    pathlib.Path(dst).write_text(call(body, hdrs))
    print('saved', dst)
