"""本机转发：dsh 的 DeepSeek 适配器把 baseURL 指到这里，这个进程换上 key 转给 DeepSeek 的
Anthropic 兼容接口（经本站中转），原样回传 SSE。跑 dsh 代码的进程里没有任何密钥。

每次请求存一对文件：out/proxy/NNN-request.json（剥掉 dsh_* 顶层字段后的请求体）、
NNN-response.sse（原始返回），并在 out/proxy/calls.jsonl 追加一行用量。

用法：python3 proxy.py <port> <out_dir>
"""
import json, pathlib, sys, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from ds_call import key  # noqa: E402  共享脚本里读 .env 的 MY_API_KEY，不打印

UPSTREAM = 'https://deepseek-proxy.liuhetian.work/anthropic'
PASS_HEADERS = ('content-type', 'anthropic-version', 'anthropic-beta', 'accept')

PORT, OUT = int(sys.argv[1]), pathlib.Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
count = 0


def usage_of(sse: str) -> dict:
    usage = {}
    for line in sse.splitlines():
        if not line.startswith('data: '):
            continue
        try:
            event = json.loads(line[6:])
        except ValueError:
            continue
        if event.get('type') == 'message_start':
            usage.update(event['message'].get('usage', {}))
        elif event.get('type') == 'message_delta':
            usage.update(event.get('usage', {}))
    return usage


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        global count
        count += 1
        n = count
        raw = self.rfile.read(int(self.headers['content-length']))
        body = {k: v for k, v in json.loads(raw).items() if not k.startswith('dsh_')}
        (OUT / f'{n:03d}-request.json').write_text(json.dumps(body, ensure_ascii=False, indent=2))
        headers = {h: self.headers[h] for h in PASS_HEADERS if self.headers.get(h)}
        headers['authorization'] = 'Bearer ' + key()
        req = urllib.request.Request(UPSTREAM + self.path, data=json.dumps(body).encode(),
                                     headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                status, ctype, data = r.status, r.headers.get('content-type'), r.read()
        except urllib.error.HTTPError as e:
            status, ctype, data = e.code, e.headers.get('content-type'), e.read()
        text = data.decode()
        (OUT / f'{n:03d}-response.sse').write_text(text)
        purpose = 'compaction' if self.headers.get('x-deepseek-harness-compact') == '1' else 'conversation'
        with open(OUT / 'calls.jsonl', 'a') as f:
            f.write(json.dumps({'n': n, 'status': status, 'purpose': purpose, 'model': body.get('model'),
                                'messages': len(body.get('messages', [])), 'usage': usage_of(text)}) + '\n')
        self.send_response(status)
        self.send_header('content-type', ctype or 'text/event-stream')
        self.send_header('content-length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
