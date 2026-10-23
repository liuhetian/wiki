#!/usr/bin/env python3
"""最小 SMTP 收件端：只收白名单地址，把原始邮件原样落成 .eml。

不是邮件服务 —— 没有投递队列、没有信箱、没有 IMAP、不往外发一封信。
唯一职责：在 25 端口接住别人主动投过来的 SMTP 会话，把 DATA 存盘，回 250。

    MAIL_INTAKE_DOMAINS=example.com,mail.example.com MAIL_INTAKE_ALLOWED=data-7f3a \
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


def env_set(name: str) -> set[str]:
    return {a.strip().lower() for a in os.environ.get(name, "").split(",") if a.strip()}


# 收信的域彼此平等：@ 前面同名，走哪个域都是同一个收件箱
DOMAINS = env_set("MAIL_INTAKE_DOMAINS")
# 白名单只管 @ 前面：别名本身就是口令，不在这张表里的一律 550
ALLOWED = env_set("MAIL_INTAKE_ALLOWED")
MAX_BYTES = int(os.environ.get("MAIL_INTAKE_MAX_BYTES", 25 * 1024 * 1024))


class IntakeHandler:
    async def handle_RCPT(self, server, session, envelope, address, rcpt_options):
        local, _, domain = address.lower().rpartition("@")
        if domain not in DOMAINS or local not in ALLOWED:
            # 不在白名单就拒收，于是也不可能被当成开放中继替别人转发
            return "550 no such user here"
        envelope.rcpt_tos.append(address)
        return "250 OK"

    async def handle_DATA(self, server, session, envelope):
        raw = envelope.content
        if len(raw) > MAX_BYTES:
            return "552 message too large"
        # 一个收件箱一个目录，目录名是 @ 前面那段
        boxes = sorted({a.lower().rpartition("@")[0] for a in envelope.rcpt_tos})
        try:
            paths = [self.store(MAILBOX / box, raw) for box in boxes]
        except OSError as exc:  # 磁盘满、权限不对、目录被删……
            log(f"store failed: {exc}")
            # 4xx 是"回头再来"，发送方的队列会自己重投；5xx 才是永久退信
            return "451 local error in processing, try again later"
        stored = [str(p.relative_to(MAILBOX)) for p in paths]
        log(f"stored {stored} from={envelope.mail_from} to={envelope.rcpt_tos}")
        return "250 Message accepted for delivery"

    def store(self, box: Path, raw: bytes) -> Path:
        digest = hashlib.sha256(raw).hexdigest()[:12]
        # 重投时时间戳已经变了，只能按哈希在整个收件箱里找旧件，查目标路径查不出重复
        dup = next(box.glob(f"*/*-{digest}.eml"), None)
        if dup is not None:
            return dup
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        day_dir = box / stamp[:8]
        day_dir.mkdir(parents=True, exist_ok=True)
        path = day_dir / f"{stamp}-{digest}.eml"
        tmp = path.with_suffix(".part")  # 同目录写临时文件再 rename，读侧永远看不到半截邮件
        tmp.write_bytes(raw)
        tmp.replace(path)
        return path


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)  # 交给 systemd 收进 journal


def main() -> None:
    if not DOMAINS or not ALLOWED:
        raise SystemExit("MAIL_INTAKE_DOMAINS / MAIL_INTAKE_ALLOWED 有一个为空，等于谁都收不了")
    controller = Controller(
        IntakeHandler(),
        hostname=os.environ.get("MAIL_INTAKE_BIND", "0.0.0.0"),  # 监听地址
        port=int(os.environ.get("MAIL_INTAKE_PORT", "25")),
        server_hostname=os.environ.get("MAIL_INTAKE_BANNER"),  # 220 问候里报的名字
        data_size_limit=MAX_BYTES,
    )
    controller.start()  # 自带事件循环线程
    log(f"listening :{controller.port} -> {MAILBOX} domains={sorted(DOMAINS)} allowed={sorted(ALLOWED)}")
    try:
        threading.Event().wait()  # 主线程只负责活着，等 systemd 来收
    except KeyboardInterrupt:
        pass
    finally:
        controller.stop()


if __name__ == "__main__":
    main()
