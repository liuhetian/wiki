"""主控：酒馆的代码在一个没有 API key 的 Node 进程里跑（server.mjs），模型请求由本进程发。

酒馆服务端把请求发到 https://api.deepseek.com/beta/chat/completions；这里只把域名换成本站的 DeepSeek 中转，
路径、请求体一字不改。
"""
import json, os, subprocess, sys, time, urllib.request

HARNESS = os.path.dirname(os.path.abspath(__file__))
ST_ROOT = os.environ.get('ST_ROOT', '/data2/work/lht/study/26.06/_ext/st/SillyTavern')
PROXY = 'https://deepseek-proxy.liuhetian.work'
ORIGIN = 'https://api.deepseek.com'


def _key():
    key = os.environ.get('MY_API_KEY')
    if key:
        return key
    for line in open('/data2/work/lht/study/26.06/zensical-wiki/.env'):
        if line.startswith('MY_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"\'')
    sys.exit('MY_API_KEY 没配')


class Lab:
    def __init__(self):
        env = {k: v for k, v in os.environ.items() if 'KEY' not in k and 'TOKEN' not in k and 'SECRET' not in k}
        env['ST_ROOT'] = ST_ROOT
        self.p = subprocess.Popen(['node', '--import', './register.mjs', 'server.mjs'], cwd=HARNESS, env=env,
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
        self.n = 0
        ready = json.loads(self.p.stdout.readline())
        assert ready['result'] == 'ready', ready

    def call(self, cmd, **args):
        self.n += 1
        self.p.stdin.write(json.dumps({'id': self.n, 'cmd': cmd, 'args': args}, ensure_ascii=False) + '\n')
        self.p.stdin.flush()
        r = json.loads(self.p.stdout.readline())
        if not r['ok']:
            raise RuntimeError(r['error'])
        return r.get('result')

    def eval(self, code, **args):
        return self.call('eval', code=code, args=args)

    def close(self):
        self.p.stdin.close()
        self.p.wait(timeout=30)


def send(deepseek, log=None):
    """把酒馆服务端拼好的请求发出去；url 只换域名。返回 (回包, 耗时秒)。"""
    url = deepseek['url'].replace(ORIGIN, PROXY)
    data = json.dumps(deepseek['body'], ensure_ascii=False).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _key()})
    t = time.time()
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                resp = json.loads(r.read())
            break
        except Exception as e:  # noqa: BLE001
            if attempt == 2:
                raise
            time.sleep(3)
    if log is not None:
        log.append({'url': deepseek['url'], 'request': deepseek['body'], 'response': resp})
    return resp, round(time.time() - t, 1)
