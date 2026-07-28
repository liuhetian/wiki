#!/usr/bin/env python3
"""
acme.sh 续期后调用此脚本，把新证书绑定到 COS 自定义域名。

acme.sh 通过 reloadcmd 调用时会注入：
  CERT_FULLCHAIN_PATH / CERT_KEY_PATH / Le_Domain 等

本脚本额外要求的环境变量（由 .env 提供）：
  TENCENT_SECRET_ID / TENCENT_SECRET_KEY
  COS_REGION / COS_BUCKET / COS_DOMAIN
"""
import os
import sys
from pathlib import Path

from qcloud_cos import CosConfig, CosS3Client


def must_env(name: str) -> str:
    v = os.environ.get(name)
    if not v:
        sys.exit(f"ERROR: missing required env var: {name}")
    return v


def main() -> None:
    secret_id = must_env("TENCENT_SECRET_ID")
    secret_key = must_env("TENCENT_SECRET_KEY")
    region = must_env("COS_REGION")
    bucket = must_env("COS_BUCKET")
    domain = must_env("COS_DOMAIN")

    cert_path = os.environ.get("CERT_FULLCHAIN_PATH") or os.environ.get("CERT_PATH")
    key_path = os.environ.get("CERT_KEY_PATH")
    if not cert_path or not key_path:
        sys.exit(
            "ERROR: CERT_FULLCHAIN_PATH and CERT_KEY_PATH must be set "
            "(acme.sh injects them automatically via --reloadcmd)"
        )

    cert = Path(cert_path).read_text()
    key = Path(key_path).read_text()

    client = CosS3Client(CosConfig(
        Region=region,
        SecretId=secret_id,
        SecretKey=secret_key,
        Scheme="https",
    ))

    client.put_bucket_domain_certificate(
        Bucket=bucket,
        DomainCertificateConfiguration={
            "CertificateInfo": {
                "CertType": "CustomCert",
                "CustomCert": {"Cert": cert, "PrivateKey": key},
            },
            "DomainList": [{"DomainName": domain}],
        },
    )
    print(f"OK: bound new cert to {domain} on bucket {bucket}")


if __name__ == "__main__":
    main()
