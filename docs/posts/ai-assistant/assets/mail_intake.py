#!/usr/bin/env python3
"""最小 SMTP 收件端：只收白名单地址，把原始邮件原样落成 .eml。

不是邮件服务 —— 没有投递队列、没有信箱、没有 IMAP、不往外发一封信。
唯一职责：在 25 端口接住别人主动投过来的 SMTP 会话，把 DATA 存盘，回 250。

    MAIL_INTAKE_ALLOWED=data-7f3a@example.com \
    uv run --with aiosmtpd python mail_intake.py
"""

import hashlib
import os
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path

from aiosmtpd.controller import Controller

MAILBOX = Path(os.environ.get("MAIL_INTAKE_DIR", "/var/lib/mail-intake/raw"))
# 白名单收件地址：别名本身就是口令，不在这张表里的一律 550。
ALLOWED = {
    a.strip().lower()
    for a in os.environ.get("MAIL_INTAKE_ALLOWED", "").split(",")
    if a.strip()
}
MAX_BYTES = int(os.environ.get("MAIL_INTAKE_MAX_BYTES", 25 * 1024 * 1024))


class IntakeHandler:
    async def handle_RCPT(self, server, session, envelope, address, rcpt_options):
        if address.lower() not in ALLOWED:
            # 不在白名单就拒收，于是也不可能被当成开放中继替别人转发
            return "550 no such user here"
        envelope.rcpt_tos.append(address)
        return "250 OK"

    async def handle_DATA(self, server, session, envelope):
        raw = envelope.content
        if len(raw) > MAX_BYTES:
            return "552 message too large"
        try:
            path = self.store(raw)
        except OSError as exc:  # 磁盘满、权限不对、目录被删……
            log(f"store failed: {exc}")
            # 4xx 是"回头再来"，发送方的队列会自己重投；5xx 才是永久退信
            return "451 local error in processing, try again later"
        log(f"stored {path.name} from={envelope.mail_from} to={envelope.rcpt_tos}")
        return "250 Message accepted for delivery"

    def store(self, raw: bytes) -> Path:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        digest = hashlib.sha256(raw).hexdigest()[:12]
        day_dir = MAILBOX / stamp[:8]
        day_dir.mkdir(parents=True, exist_ok=True)
        path = day_dir / f"{stamp}-{digest}.eml"
        tmp = path.with_suffix(".part")  # 同目录写临时文件再 rename，读侧永远看不到半截邮件
        tmp.write_bytes(raw)
        tmp.replace(path)
        return path


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)  # 交给 systemd 收进 journal


def main() -> None:
    if not ALLOWED:
        raise SystemExit("MAIL_INTAKE_ALLOWED 为空：没有白名单地址，等于谁都收不了")
    controller = Controller(
        IntakeHandler(),
        hostname=os.environ.get("MAIL_INTAKE_BIND", "0.0.0.0"),  # 监听地址
        port=int(os.environ.get("MAIL_INTAKE_PORT", "25")),
        server_hostname=os.environ.get("MAIL_INTAKE_BANNER"),  # 220 问候里报的名字
        data_size_limit=MAX_BYTES,
    )
    controller.start()  # 自带事件循环线程
    log(f"listening :{controller.port} -> {MAILBOX} allowed={sorted(ALLOWED)}")
    try:
        threading.Event().wait()  # 主线程只负责活着，等 systemd 来收
    except KeyboardInterrupt:
        pass
    finally:
        controller.stop()


if __name__ == "__main__":
    main()
