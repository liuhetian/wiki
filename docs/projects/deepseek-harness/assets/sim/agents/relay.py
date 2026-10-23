"""Local relay for the agents-line experiment.

dsh runs in a key-less process with DEEPSEEK_BASE_URL=http://127.0.0.1:<port>/anthropic
and a dummy DEEPSEEK_API_KEY. This separate process holds the real key (read by
../ds_call.py from the wiki .env), strips the dsh_* top-level fields (session-log
upload), forwards the request to the DeepSeek Anthropic-compatible endpoint via the
wiki gateway, returns the raw response, and records every call:
  out/calls/NNN.request.json   the body dsh built (after stripping dsh_*)
  out/calls/NNN.response.txt   the raw response (SSE when dsh streams)
  out/calls/index.jsonl        one line per call: model, message count, usage
Usage: python3 relay.py <port> <out-dir>
"""
import json, pathlib, sys, threading, urllib.error, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import ds_call  # noqa: E402  (shared caller: key lookup + gateway base)

UPSTREAM = ds_call.BASE.rsplit('/v1/messages', 1)[0]  # .../anthropic
PORT, OUT = int(sys.argv[1]), pathlib.Path(sys.argv[2]) / 'calls'
OUT.mkdir(parents=True, exist_ok=True)
lock, counter = threading.Lock(), [0]
PASS_HEADERS = ('content-type', 'accept', 'anthropic-version', 'anthropic-beta')


def usage_of(raw: str) -> dict:
    usage = {}
    for line in raw.splitlines():
        if not line.startswith('data:'):
            continue
        try:
            ev = json.loads(line[5:])
        except ValueError:
            continue
        if ev.get('type') == 'message_start':
            usage.update(ev['message'].get('usage', {}))
        elif ev.get('type') == 'message_delta':
            usage.update(ev.get('usage', {}))
    if not usage:
        try:
            usage = json.loads(raw).get('usage', {})
        except ValueError:
            pass
    return usage


class Relay(BaseHTTPRequestHandler):
    def _forward(self, method: str) -> None:
        path = self.path.split('/anthropic', 1)[-1]
        body = None
        if method == 'POST':
            data = json.loads(self.rfile.read(int(self.headers['content-length'])))
            data = {k: v for k, v in data.items() if not k.startswith('dsh_')}
            body = json.dumps(data).encode()
        headers = {k: self.headers[k] for k in PASS_HEADERS if self.headers.get(k)}
        headers['authorization'] = 'Bearer ' + ds_call.key()
        req = urllib.request.Request(UPSTREAM + path, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                status, ctype, raw = r.status, r.headers.get('content-type', ''), r.read()
        except urllib.error.HTTPError as e:
            status, ctype, raw = e.code, e.headers.get('content-type', ''), e.read()
        if body is not None:
            with lock:
                counter[0] += 1
                n = counter[0]
            text = raw.decode('utf-8', 'replace')
            (OUT / f'{n:03d}.request.json').write_text(json.dumps(data, ensure_ascii=False, indent=1))
            (OUT / f'{n:03d}.response.txt').write_text(text)
            with lock, open(OUT / 'index.jsonl', 'a') as f:
                f.write(json.dumps({'n': n, 'path': path, 'status': status, 'model': data.get('model'),
                                    'messages': len(data.get('messages', [])), 'usage': usage_of(text)}) + '\n')
        self.send_response(status)
        self.send_header('content-type', ctype)
        self.send_header('content-length', str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_POST(self):
        self._forward('POST')

    def do_GET(self):
        self._forward('GET')

    def log_message(self, *args):
        pass


ThreadingHTTPServer(('127.0.0.1', PORT), Relay).serve_forever()
