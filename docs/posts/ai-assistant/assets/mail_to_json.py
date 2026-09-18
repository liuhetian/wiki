#!/usr/bin/env python3
"""把 .eml 真身解析成 AI 直接能读的 JSON，一封一行。

解析永远从 .eml 重跑，不回写真身 —— 解析逻辑改了，历史邮件重跑一遍就是新结果。

    python mail_to_json.py /var/lib/mail-intake/raw/20260917/*.eml > mail.jsonl
"""

import json
import sys
from email import message_from_bytes, policy
from pathlib import Path

MAX_TEXT = 200_000  # 正文截断上限：邮件正文进的是 AI 的上下文，不是硬盘


def parse(raw: bytes) -> dict:
    # policy.default 下头部已经解好码（=?utf-8?B?...?= 不用自己 decode_header），
    # get_body 会按偏好在 multipart 里挑一层，不用手写递归
    msg = message_from_bytes(raw, policy=policy.default)
    body = msg.get_body(preferencelist=("plain", "html"))
    text = body.get_content() if body is not None else ""
    return {
        "message_id": msg.get("Message-ID", ""),
        "date": msg.get("Date", ""),
        "from": msg.get("From", ""),
        "to": [str(v) for v in msg.get_all("To") or []],
        "subject": msg.get("Subject", ""),
        "body_type": body.get_content_type() if body is not None else "",
        "body": text[:MAX_TEXT],
        "truncated": len(text) > MAX_TEXT,
        "attachments": [
            {
                "filename": part.get_filename() or "",
                "type": part.get_content_type(),
                "bytes": len(part.get_payload(decode=True) or b""),
            }
            for part in msg.iter_attachments()
        ],
    }


def main(paths: list[str]) -> None:
    for p in paths:
        path = Path(p)
        record = parse(path.read_bytes())
        record["source"] = str(path)  # 留住真身路径：摘要里的每句话都能回溯到原始邮件
        print(json.dumps(record, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1:])
