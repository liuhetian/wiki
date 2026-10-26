#!/usr/bin/env python3
"""Check auth, official credentials, JSON requests, SSE, and log privacy."""
import json
from pathlib import Path
import ssl
import time
import urllib.error
import urllib.request

env = dict(line.split('=', 1) for line in Path('/etc/caddy/gateway.env').read_text().splitlines())
token = env['DEEPSEEK_GATEWAY_TOKEN']
key = env['DEEPSEEK_API_KEY']
base = 'https://deepseek-proxy.liuhetian.work'
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

def request(path, credential=None, body=None, timeout=60):
    headers = {}
    if credential:
        headers['Authorization'] = 'Bearer ' + credential
    if body is not None:
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(base + path, headers=headers, data=json.dumps(body).encode() if body is not None else None)
    return opener.open(req, timeout=timeout)

for attempt in range(15):
    try:
        request('/v1/models', timeout=5)
    except urllib.error.HTTPError as error:
        assert error.code == 401, f'Unexpected unauthenticated status: {error.code}'
        break
    except (urllib.error.URLError, TimeoutError):
        if attempt == 14:
            raise
        time.sleep(2)
    else:
        raise AssertionError('Unauthenticated request was permitted')
print('TLS and no-token rejection: passed')

for bad in ('invalid-gateway-token', key):
    try:
        request('/v1/models', bad)
    except urllib.error.HTTPError as error:
        assert error.code == 401
    else:
        raise AssertionError('Non-gateway credential was permitted')
print('Invalid token and upstream-key rejection: passed')

with request('/v1/models', token) as response:
    assert response.status == 200
    models = [model['id'] for model in json.load(response)['data']]
assert models
print('Authorized /v1/models: passed; available models: ' + ', '.join(models))
with request('/models', token) as response:
    assert response.status == 200
print('Authorized /models: passed')

model = next((m for m in ('deepseek-flash', 'deepseek-v4-flash', 'deepseek-chat') if m in models), models[0])
body = {'model': model, 'messages': [{'role': 'user', 'content': 'Reply only with OK.'}], 'max_tokens': 16, 'thinking': {'type': 'disabled'}, 'stream': False}
with request('/v1/chat/completions', token, body) as response:
    result = json.load(response)
    assert response.status == 200
    assert result.get('choices')
    assert result['choices'][0]['message'].get('content')
print('JSON chat completion: passed; model: ' + model)

body['stream'] = True
with request('/v1/chat/completions', token, body) as response:
    assert response.status == 200
    assert 'text/event-stream' in response.headers.get('Content-Type', '')
    chunks = 0
    done = False
    for raw in response:
        line = raw.decode().strip()
        if line == 'data: [DONE]':
            done = True
            break
        if line.startswith('data: '):
            json.loads(line[6:])
            chunks += 1
    assert done and chunks > 0
print('SSE stream: passed; chunks: ' + str(chunks))

logs = Path('/var/log/caddy/deepseek-proxy/access.json').read_text()
assert key not in logs and token not in logs
for line in logs.splitlines():
    record = json.loads(line)
    assert 'request' not in record and 'resp_headers' not in record
print('Access logs contain no credentials, request metadata, or chat bodies: passed')
assert (Path('/etc/caddy/gateway.env').stat().st_mode & 0o777) == 0o600
print('Credential file permissions 0600: passed')
