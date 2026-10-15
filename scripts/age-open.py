# /// script
# requires-python = ">=3.11"
# dependencies = ["pyrage>=1.4"]
# ///
"""把 wiki 页面 Markdown 里打码的部分一口气解开：从标准输入读，解开后写到标准输出。

    curl -fsSL https://wiki.liuhetian.work/<页面>.md | uv run https://wiki.liuhetian.work/posts/wiki-tech/assets/age-open.py

认的密文和浏览器里的 vendor/age-init.js 一致：
  - 小字 age:<整个 age 文件的 base64>，解开后留在原来的反引号里
  - armor 块 -----BEGIN AGE ENCRYPTED FILE----- … -----END …，解开后 ```age 换成普通代码块；
    官方 llmstxt 插件导出的版本里它本来就是普通代码块，也认

凭据按顺序找。口令不收命令行参数：参数会留在 shell 历史、ps 和 AI 的对话记录里。
  1. WIKI_AGE_KEY_FILE 指向私钥文件（AGE-SECRET-KEY-1…）：直接用私钥，不跑 scrypt
  2. 环境变量 WIKI_AGE_PASS：口令写进客户端的 .env，命令里不出现
  3. 都没有就在终端提示输入，不回显
口令模式先从站上取 vendor/age-init.js 里口令锁住的 WIKI_KEY_AGE——钥匙只有那一处真身，换钥匙不用改这里——
跑一次 scrypt 解出私钥，之后每段用 X25519 解。WIKI_SITE 可以换站点地址。
输入里没有密文就原样输出，不要凭据。解不开的段落原样保留、在标准错误里报数；一段都没解开时退出码 1。
解开的明文只往标准输出写，私钥不落盘、不打印。
"""
import base64
import getpass
import os
import re
import sys
import urllib.request

import pyrage

SITE = os.environ.get("WIKI_SITE", "https://wiki.liuhetian.work").rstrip("/")

# 前缀是「age-encryption.org/v1」的 base64，和 age-init.js 的 TOKEN 同一条
TOKEN = re.compile(r"age:(YWdlLWVuY3J5cHRpb24ub3JnL3Yx[A-Za-z0-9+/]*={0,2})")
# armor 块，可带开头的 ```age 那一行；缩进跟着走（提示框、折叠块里的代码块缩进 4 格）
ARMOR = re.compile(
    r"^(?P<fence>[ \t]*(?:`{3,}|~{3,})age[ \t]*\n)?"
    r"(?P<indent>[ \t]*)-----BEGIN AGE ENCRYPTED FILE-----[ \t]*\n"
    r"(?P<body>.*?)\n[ \t]*-----END AGE ENCRYPTED FILE-----",
    re.S | re.M,
)
LOCKED_KEY = re.compile(
    r"WIKI_KEY_AGE = `(-----BEGIN AGE ENCRYPTED FILE-----.*?-----END AGE ENCRYPTED FILE-----)`", re.S
)


def dearmor(armor_body: str) -> bytes:
    return base64.b64decode("".join(armor_body.split()))


def load_identity() -> pyrage.x25519.Identity:
    key_file = os.environ.get("WIKI_AGE_KEY_FILE")
    if key_file:
        with open(os.path.expanduser(key_file)) as f:
            line = next((l for l in f if l.startswith("AGE-SECRET-KEY-1")), None)
        if line is None:
            sys.exit(f"age-open：{key_file} 里没有 AGE-SECRET-KEY-1 开头的私钥")
        return pyrage.x25519.Identity.from_str(line.strip())

    passphrase = os.environ.get("WIKI_AGE_PASS") or getpass.getpass("wiki 打码口令：")
    with urllib.request.urlopen(f"{SITE}/vendor/age-init.js", timeout=30) as r:
        js = r.read().decode()
    m = LOCKED_KEY.search(js)
    if not m:
        sys.exit(f"age-open：{SITE}/vendor/age-init.js 里没找到 WIKI_KEY_AGE")
    locked = dearmor(ARMOR.search(m.group(1)).group("body"))
    try:
        secret = pyrage.passphrase.decrypt(locked, passphrase).decode().strip()
    except pyrage.DecryptError:
        sys.exit("age-open：口令不对，WIKI_KEY_AGE 解不开")
    return pyrage.x25519.Identity.from_str(secret)


def main() -> None:
    text = sys.stdin.buffer.read().decode("utf-8")
    if not TOKEN.search(text) and "-----BEGIN AGE ENCRYPTED FILE-----" not in text:
        sys.stdout.buffer.write(text.encode("utf-8"))
        return

    identity = load_identity()
    opened = failed = 0

    def decrypt(data: bytes) -> str | None:
        nonlocal opened, failed
        try:
            plain = pyrage.decrypt(data, [identity]).decode("utf-8")
        except (pyrage.DecryptError, ValueError, UnicodeDecodeError):
            failed += 1
            return None
        opened += 1
        return plain

    def open_token(m: re.Match) -> str:
        plain = decrypt(base64.b64decode(m.group(1)))
        return m.group(0) if plain is None else plain

    def open_armor(m: re.Match) -> str:
        plain = decrypt(dearmor(m.group("body")))
        if plain is None:
            return m.group(0)
        indent = m.group("indent")
        fence = m.group("fence") or ""
        fence = re.sub(r"age[ \t]*\n$", "\n", fence)  # ```age → ```
        return fence + "\n".join(indent + line if line else line for line in plain.rstrip("\n").split("\n"))

    text = ARMOR.sub(open_armor, text)
    text = TOKEN.sub(open_token, text)
    sys.stdout.buffer.write(text.encode("utf-8"))

    if failed:
        print(f"age-open：{failed} 段解不开，原样保留（解开 {opened} 段）", file=sys.stderr)
    if opened == 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
