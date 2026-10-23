"""对照组：同一段被压的对话，按 baseline（pi 1.3.0）的格式另起一次摘要请求，看前缀缓存命中多少。

输入是 dsh 实跑里那次压缩请求（proxy 记下的 NNN-request.json）：去掉末尾 dsh 的压缩指令，
其余消息按 pi 的 serializeConversation 格式转成一段文本（[User]: / [Assistant]: /
[Assistant tool calls]: / [Tool result]:，工具结果截到 2000 字符），包进 <conversation>，
后接 pi 的 SUMMARIZATION_PROMPT；system 换成 pi 的 SUMMARIZATION_SYSTEM_PROMPT，不带 tools。
模型、max_tokens、thinking、effort 和 dsh 那次一致。pi 的两段提示词原文照抄自
@earendil-works/pi-coding-agent 1.3.0 的 dist/core/compaction/{utils,compaction}.js。

用法：python3 control.py <dsh-compaction-request.json> <out_dir>
"""
import json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from ds_call import call  # noqa: E402

PI_SYSTEM = """You are a context summarization assistant. Your task is to read a conversation between a user and an AI assistant, then produce a structured summary following the exact format specified.

Do NOT continue the conversation. Do NOT respond to any questions in the conversation. ONLY output the structured summary."""

PI_PROMPT = """The messages above are a conversation to summarize. Create a structured context checkpoint summary that another LLM will use to continue the work.

Use this EXACT format:

## Goal
[What is the user trying to accomplish? Can be multiple items if the session covers different tasks.]

## Constraints & Preferences
- [Any constraints, preferences, or requirements mentioned by user]
- [Or "(none)" if none were mentioned]

## Progress
### Done
- [x] [Completed tasks/changes]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues preventing progress, if any]

## Key Decisions
- **[Decision]**: [Brief rationale]

## Next Steps
1. [Ordered list of what should happen next]

## Critical Context
- [Any data, examples, or references needed to continue]
- [Or "(none)" if not applicable]

Keep each section concise. Preserve exact file paths, function names, and error messages."""

TOOL_RESULT_MAX_CHARS = 2000


def text_of(blocks):
    if isinstance(blocks, str):
        return blocks
    return '\n'.join(b['text'] for b in blocks if b.get('type') == 'text')


def truncate(text, limit):
    return text if len(text) <= limit else f'{text[:limit]}\n\n[... {len(text) - limit} more characters truncated]'


def serialize(messages):
    parts = []
    for m in messages:
        blocks = m['content'] if isinstance(m['content'], list) else [{'type': 'text', 'text': m['content']}]
        if m['role'] == 'user':
            for b in blocks:
                if b['type'] == 'text' and b['text']:
                    parts.append(f"[User]: {b['text']}")
                elif b['type'] == 'tool_result':
                    content = text_of(b.get('content', ''))
                    if content:
                        parts.append(f'[Tool result]: {truncate(content, TOOL_RESULT_MAX_CHARS)}')
        else:
            texts = [b['text'] for b in blocks if b['type'] == 'text']
            calls = [f"{b['name']}(" + ', '.join(f'{k}={json.dumps(v, ensure_ascii=False)}' for k, v in b['input'].items()) + ')'
                     for b in blocks if b['type'] == 'tool_use']
            if texts:
                parts.append('[Assistant]: ' + '\n'.join(texts))
            if calls:
                parts.append('[Assistant tool calls]: ' + '; '.join(calls))
    return '\n\n'.join(parts)


src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
dsh = json.loads(src.read_text())
messages = json.loads(json.dumps(dsh['messages']))
last = messages[-1]
# dsh 把压缩指令作为最后一条 user 的最后一个文本块；对照组把它拿掉，换成 pi 的提示词
assert last['role'] == 'user' and last['content'][-1]['type'] == 'text' and 'compaction engine' in last['content'][-1]['text']
last['content'] = last['content'][:-1]
if not last['content']:
    messages.pop()

body = {
    'model': dsh['model'],
    'max_tokens': dsh['max_tokens'],
    'thinking': dsh['thinking'],
    'output_config': dsh['output_config'],
    'system': PI_SYSTEM,
    'messages': [{'role': 'user', 'content': [{'type': 'text', 'text': f'<conversation>\n{serialize(messages)}\n</conversation>\n\n{PI_PROMPT}'}]}],
}
out.mkdir(parents=True, exist_ok=True)
(out / 'control-request.json').write_text(json.dumps(body, ensure_ascii=False, indent=2))
resp = call(body)
(out / 'control-response.json').write_text(resp)
print(json.dumps(json.loads(resp)['usage']))
