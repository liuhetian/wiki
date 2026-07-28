#!/usr/bin/env python3
"""git-lfs standalone custom transfer agent，后端为腾讯云 COS 备份桶。

由 git-lfs 在 push/pull 时按需拉起（scripts/setup-lfs.sh 负责注册到 git config），
stdin/stdout 走 JSON-lines 协议；每个进程串行处理，git-lfs 靠多开进程实现并发。
协议：https://github.com/git-lfs/git-lfs/blob/main/docs/custom-transfers.md

用法（由 lfs.customtransfer.cos.args 传入）：
  lfs-cos-agent.py [前缀]   # blob 存 cos://$COS_BACKUP_BUCKET/<前缀>/ab/cd/<oid>，默认 lfs

凭证复用项目 .env（COS_SECRET_ID/KEY、COS_REGION、COS_BACKUP_BUCKET）。
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent


def load_env():
    env = {}
    for line in (PROJECT_DIR / ".env").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip("'\"")
    return env


def reply(obj):
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


def log(msg):
    print(f"[lfs-cos-agent] {msg}", file=sys.stderr, flush=True)


class Agent:
    def __init__(self, prefix):
        self.prefix = prefix.strip("/")
        self.client = None
        self.bucket = None
        self.tmpdir = None

    def key(self, oid):
        # 内容寻址：sha256 前两级做目录，避免单层百万对象
        return f"{self.prefix}/{oid[:2]}/{oid[2:4]}/{oid}"

    def handle_init(self, msg):
        try:
            from qcloud_cos import CosConfig, CosS3Client

            env = load_env()
            self.bucket = env["COS_BACKUP_BUCKET"]
            self.client = CosS3Client(
                CosConfig(
                    Region=env["COS_REGION"],
                    SecretId=env["COS_SECRET_ID"],
                    SecretKey=env["COS_SECRET_KEY"],
                )
            )
            # 下载先落 .git/lfs/tmp：与仓库同文件系统，git-lfs 移走时 rename 不跨设备
            try:
                gitdir = subprocess.check_output(
                    ["git", "rev-parse", "--absolute-git-dir"], text=True
                ).strip()
                self.tmpdir = Path(gitdir) / "lfs" / "tmp"
                self.tmpdir.mkdir(parents=True, exist_ok=True)
            except Exception:
                self.tmpdir = Path(tempfile.mkdtemp(prefix="lfs-cos-"))
            reply({})
        except Exception as e:
            reply({"error": {"code": 1, "message": f"init 失败: {e}"}})

    def handle_upload(self, msg):
        oid = msg["oid"]
        try:
            key = self.key(oid)
            if self.client.object_exists(Bucket=self.bucket, Key=key):
                log(f"跳过（桶里已有）{oid[:12]}")
            else:
                self.client.upload_file(
                    Bucket=self.bucket, Key=key, LocalFilePath=msg["path"]
                )
                log(f"上传 {msg.get('size', '?')}B {oid[:12]}")
            reply({"event": "complete", "oid": oid})
        except Exception as e:
            reply(
                {
                    "event": "complete",
                    "oid": oid,
                    "error": {"code": 2, "message": f"上传 {self.key(oid)} 失败: {e}"},
                }
            )

    def handle_download(self, msg):
        oid = msg["oid"]
        try:
            fd, tmp = tempfile.mkstemp(dir=self.tmpdir, prefix=oid[:12] + "-")
            os.close(fd)
            self.client.download_file(
                Bucket=self.bucket, Key=self.key(oid), DestFilePath=tmp
            )
            log(f"下载 {msg.get('size', '?')}B {oid[:12]}")
            reply({"event": "complete", "oid": oid, "path": tmp})
        except Exception as e:
            reply(
                {
                    "event": "complete",
                    "oid": oid,
                    "error": {"code": 2, "message": f"下载 {self.key(oid)} 失败: {e}"},
                }
            )


def main():
    agent = Agent(sys.argv[1] if len(sys.argv) > 1 else "lfs")
    handlers = {
        "init": agent.handle_init,
        "upload": agent.handle_upload,
        "download": agent.handle_download,
    }
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        msg = json.loads(line)
        event = msg.get("event")
        if event == "terminate":
            break
        if event in handlers:
            handlers[event](msg)
        else:
            log(f"忽略未知事件: {event}")


if __name__ == "__main__":
    main()
