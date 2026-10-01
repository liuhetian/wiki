# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Call DeepSeek through the wiki's API gateway: the agent holds a gateway token, never the vendor key.

Run with `uv run deepseek.py <command> ...`, or plain `python3 deepseek.py` — standard library only.

Commands:
    models    model ids the gateway reaches, with context window, output limit and effort levels
    chat      one request: prompt from the argument or stdin, --file attaches text files as context
    balance   account balance from DeepSeek's /user/balance — the closest thing to a bill

Environment:
    MY_API_KEY         the gateway token (not a DeepSeek key: the gateway rejects those). The user puts it
                       in a .env file; if it is not in the environment, the nearest .env from the current
                       directory upwards is read. Never print it.
    DEEPSEEK_BASE_URL  defaults to the gateway, https://deepseek-proxy.liuhetian.work/v1

Output: the answer goes to stdout as it streams; a one-line usage summary goes to stderr.
Exit codes: 0 ok, 1 API or network error, 2 bad arguments or setup — stderr says what to change.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_BASE_URL = "https://deepseek-proxy.liuhetian.work/v1"
DEFAULT_MODEL = "deepseek-flash"
TOKEN_VAR = "MY_API_KEY"
EFFORTS = ("none", "low", "high", "max")
TIMEOUT = 300  # seconds of silence before giving up; streaming keeps bytes flowing while the model works


class UsageError(Exception):
    """A problem the caller can fix by changing arguments or environment; exit code 2."""


class ApiError(Exception):
    """The gateway or DeepSeek refused or failed; exit code 1."""


# ---------------------------------------------------------------- http


def read_dotenv(path: Path) -> dict[str, str]:
    """KEY=VALUE lines; blank lines, # comments, `export ` and surrounding quotes are handled."""
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.removeprefix("export ").split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        values[key.strip()] = value
    return values


def config() -> tuple[str, str]:
    token = os.environ.get(TOKEN_VAR, "").strip()
    if not token:
        for folder in (Path.cwd(), *Path.cwd().parents):
            if (folder / ".env").is_file():
                token = read_dotenv(folder / ".env").get(TOKEN_VAR, "").strip()
                if token:
                    break
    if not token:
        raise UsageError(
            f"{TOKEN_VAR} not found in the environment or in any .env from here upwards: "
            f"ask the user to add {TOKEN_VAR}=<gateway token> to the .env"
        )
    base = os.environ.get("DEEPSEEK_BASE_URL", DEFAULT_BASE_URL).strip().rstrip("/")
    return base, token


def opener() -> urllib.request.OpenerDirector:
    # Keep http(s) proxies, drop socks ones: urllib cannot speak SOCKS, and shells set up for
    # GitHub downloads often export ALL_PROXY=socks5h://... The gateway itself needs no proxy.
    proxies = {k: v for k, v in urllib.request.getproxies().items() if v.startswith(("http://", "https://"))}
    return urllib.request.build_opener(urllib.request.ProxyHandler(proxies))


def explain(status: int, body: bytes) -> str:
    try:
        message = json.loads(body)["error"]["message"]
    except (ValueError, KeyError, TypeError):
        message = body.decode(errors="replace").strip()[:300]
    hints = {
        # Both the gateway and DeepSeek answer 401; only the gateway's message mentions the gateway.
        401: f"the gateway rejected {TOKEN_VAR}: it must be the gateway token, not a DeepSeek key"
        if "gateway" in message.lower()
        else "DeepSeek rejected the key stored on the gateway: tell the user, the agent cannot fix this",
        402: "DeepSeek balance is used up: tell the user to top up; retrying will not help",
        429: "rate limited: wait and retry later",
    }
    hint = hints.get(status) or ("DeepSeek is busy or failing: retry later" if status >= 500 else "")
    return f"HTTP {status}: {message}" + (f" — {hint}" if hint else "")


def request(path: str, payload: dict | None = None):
    base, token = config()
    url = base + path if path.startswith("/") else path
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload, ensure_ascii=False).encode()
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        return opener().open(req, timeout=TIMEOUT)
    except urllib.error.HTTPError as error:
        raise ApiError(explain(error.code, error.read())) from None
    except urllib.error.URLError as error:
        raise ApiError(f"cannot reach {url}: {error.reason}") from None
    except TimeoutError:
        raise ApiError(f"no response from {url} within {TIMEOUT}s") from None


def root_url() -> str:
    """/user/balance lives beside /v1, not under it."""
    base, _ = config()
    return base[: -len("/v1")] if base.endswith("/v1") else base


# ---------------------------------------------------------------- commands


def cmd_models(args: argparse.Namespace) -> None:
    with request("/models") as response:
        models = json.load(response)["data"]
    for model in models:
        effort = model.get("effort") or {}
        levels = "/".join(effort.get("supported_levels", [])) or "-"
        parts = [
            model["id"],
            model.get("name", ""),
            f"context {model['context_window']:,}" if "context_window" in model else "",
            f"max output {model['max_output_tokens']:,}" if "max_output_tokens" in model else "",
            "input " + "+".join(model.get("input_modalities", [])) if model.get("input_modalities") else "",
            f"effort {levels}",
        ]
        print("  ".join(p for p in parts if p))


def cmd_balance(args: argparse.Namespace) -> None:
    with request(root_url() + "/user/balance") as response:
        info = json.load(response)
    print(f"available: {info.get('is_available')}")
    for row in info.get("balance_infos", []):
        print(
            f"{row.get('currency')}: total {row.get('total_balance')} "
            f"(granted {row.get('granted_balance')}, topped up {row.get('topped_up_balance')})"
        )


def build_messages(args: argparse.Namespace) -> list[dict]:
    prompt = args.prompt
    if prompt in (None, "-"):
        if sys.stdin.isatty():
            raise UsageError("no prompt: pass it as an argument or pipe it on stdin")
        prompt = sys.stdin.read()
    if not prompt.strip():
        raise UsageError("the prompt is empty")
    parts = [prompt.rstrip()]
    for name in args.file or []:
        path = Path(name)
        try:
            text = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            raise UsageError(f"--file {name}: no such file") from None
        except UnicodeDecodeError:
            raise UsageError(f"--file {name}: not UTF-8 text; convert it first (PDF: see pdf_read.py)") from None
        parts.append(f'<file path="{name}">\n{text.rstrip()}\n</file>')
    messages = [{"role": "system", "content": args.system}] if args.system else []
    messages.append({"role": "user", "content": "\n\n".join(parts)})
    if args.json and "json" not in json.dumps(messages, ensure_ascii=False).lower():
        raise UsageError('--json needs the prompt or --system to ask for JSON: say "json" and show the shape you want')
    return messages


def cmd_chat(args: argparse.Namespace) -> None:
    payload: dict = {
        "model": args.model,
        "messages": build_messages(args),
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    if args.effort == "none":
        payload["thinking"] = {"type": "disabled"}
    else:
        payload["thinking"] = {"type": "enabled"}
        payload["reasoning_effort"] = args.effort
    if args.max_tokens:
        payload["max_tokens"] = args.max_tokens
    if args.temperature is not None:
        payload["temperature"] = args.temperature
    if args.json:
        payload["response_format"] = {"type": "json_object"}

    usage: dict = {}
    finish = None
    model = args.model
    in_reasoning = False
    with request("/chat/completions", payload) as response:
        for raw in response:
            line = raw.decode("utf-8").strip()
            if not line.startswith("data:"):
                continue  # blank separators and ": keep-alive" comments
            data = line[5:].strip()
            if data == "[DONE]":
                break
            chunk = json.loads(data)
            model = chunk.get("model", model)
            usage = chunk.get("usage") or usage
            for choice in chunk.get("choices", []):
                delta = choice.get("delta") or {}
                if delta.get("reasoning_content") and args.show_reasoning:
                    if not in_reasoning:
                        sys.stderr.write("<reasoning>\n")
                        in_reasoning = True
                    sys.stderr.write(delta["reasoning_content"])
                    sys.stderr.flush()
                if delta.get("content"):
                    if in_reasoning:
                        sys.stderr.write("\n</reasoning>\n")
                        in_reasoning = False
                    sys.stdout.write(delta["content"])
                    sys.stdout.flush()
                finish = choice.get("finish_reason") or finish
    if in_reasoning:
        sys.stderr.write("\n</reasoning>\n")
    sys.stdout.write("\n")
    report(model, finish, usage)


def report(model: str, finish: str | None, usage: dict) -> None:
    prompt = usage.get("prompt_tokens", "?")
    hit = usage.get("prompt_cache_hit_tokens")
    completion = usage.get("completion_tokens", "?")
    reasoning = (usage.get("completion_tokens_details") or {}).get("reasoning_tokens")
    line = f"[{model}] finish={finish} · prompt {prompt}"
    if hit is not None:
        line += f" (cache hit {hit})"
    line += f" · completion {completion}"
    if reasoning:
        line += f" (reasoning {reasoning})"
    print(line, file=sys.stderr)
    if finish == "length":
        print("warning: the answer was cut off by max_tokens; raise --max-tokens and ask again", file=sys.stderr)


# ---------------------------------------------------------------- cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("models", help="list models behind the gateway").set_defaults(func=cmd_models)
    sub.add_parser("balance", help="DeepSeek account balance").set_defaults(func=cmd_balance)

    chat = sub.add_parser("chat", help="send one prompt, stream the answer")
    chat.add_argument("prompt", nargs="?", help='the prompt; omit or "-" to read stdin')
    chat.add_argument("--system", help="system message")
    chat.add_argument("--file", action="append", metavar="PATH", help="attach a UTF-8 text file (repeatable)")
    chat.add_argument("--model", default=DEFAULT_MODEL, help=f"model id from `models` (default {DEFAULT_MODEL})")
    chat.add_argument(
        "--effort", choices=EFFORTS, default="none",
        help="thinking effort; none turns thinking off (default none: fast and cheap)",
    )
    chat.add_argument("--max-tokens", type=int, help="output cap, reasoning included")
    chat.add_argument("--temperature", type=float, help="0-2; ignored when thinking is on")
    chat.add_argument("--json", action="store_true", help="force a JSON object answer")
    chat.add_argument("--show-reasoning", action="store_true", help="stream the reasoning to stderr")
    chat.set_defaults(func=cmd_chat)

    args = parser.parse_args()
    try:
        args.func(args)
    except UsageError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    except ApiError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    except (TimeoutError, ConnectionError) as error:
        print(f"error: connection dropped mid-response ({error}); retry", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
