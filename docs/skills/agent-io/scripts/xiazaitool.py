#!/usr/bin/env python3
"""Any other share link xiazaitool can parse (Kuaishou, Weibo, ...) into a folder: title and media only.

Run `python3 xiazaitool.py <link or share text>... --out <dir>`. Standard library only; needs
share_common.py beside it and MY_API_KEY in the environment.

One xiazaitool parse per link (0.005 CNY, failures free): the title, then the video or the pictures.
No text, author or counts; for Xiaohongshu, Douyin and Bilibili use their own scripts.
Folder layout and flags: see share_common.py.
"""

from __future__ import annotations

import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import cli, last_segment, media_only  # noqa: E402


def platform_key(url: str) -> str:
    labels = (urllib.parse.urlparse(url).hostname or "").split(".")
    return (labels[-2] if len(labels) >= 2 else "web") + "_" + last_segment(url)


if __name__ == "__main__":
    raise SystemExit(cli(__doc__, "link", lambda u: True, platform_key, lambda post, args: media_only(post, args)))
