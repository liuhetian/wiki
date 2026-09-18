#!/usr/bin/env python3
"""上 25 端口之前的本地验收：在 8025 起收件端，自己投三封信验三条规矩。

验的是白名单拒收、正常落盘、中文头部与附件能解开 —— 不碰 DNS、不碰公网。

    uv run --with aiosmtpd python smoke_intake.py
"""

import glob
import os
import smtplib
import subprocess
import sys
import tempfile
import time
from email.message import EmailMessage
from pathlib import Path

HERE = Path(__file__).parent
PORT = 8025


def build_mail() -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = "牛合天 <sender@example.org>"
    msg["To"] = "data-7f3a@example.com"
    msg["Subject"] = "每日推送：中文标题也要能解开"
    msg.set_content("正文第一行\n正文第二行")
    msg.add_alternative("<p>html 版本</p>", subtype="html")
    msg.add_attachment(b"col_a,col_b\n1,2\n", maintype="text", subtype="csv", filename="d.csv")
    return msg


def main() -> int:
    inbox = tempfile.mkdtemp(prefix="mail-intake-")
    env = dict(
        os.environ,
        MAIL_INTAKE_DIR=inbox,
        MAIL_INTAKE_PORT=str(PORT),
        MAIL_INTAKE_BIND="127.0.0.1",
        MAIL_INTAKE_BANNER="mail.example.com",
        MAIL_INTAKE_ALLOWED="data-7f3a@example.com",
    )
    proc = subprocess.Popen(
        [sys.executable, str(HERE / "mail_intake.py")], env=env, stderr=subprocess.PIPE, text=True
    )
    time.sleep(2)
    if proc.poll() is not None:
        print("收件端没起来：", proc.stderr.read())
        return 1

    try:
        client = smtplib.SMTP("127.0.0.1", PORT, timeout=10)
        print("[banner]", client.ehlo()[1].decode().splitlines()[0])
        try:
            client.sendmail("sender@example.org", ["random@example.com"], b"x")
            print("!! 白名单外的地址被收了，规矩漏了")
            return 1
        except smtplib.SMTPRecipientsRefused as exc:
            print("[拒收非白名单]", exc.recipients)
        client.send_message(build_mail())
        print("[投递成功]")
        client.quit()
        time.sleep(0.5)
    finally:
        proc.terminate()
        proc.wait(5)
    print("[日志]", proc.stderr.read().strip())

    files = sorted(glob.glob(f"{inbox}/*/*.eml"))
    if len(files) != 1:
        print("!! 落盘文件数不对：", files)
        return 1
    print("[落盘]", files[0])
    return subprocess.run([sys.executable, str(HERE / "mail_to_json.py"), *files]).returncode


if __name__ == "__main__":
    raise SystemExit(main())
