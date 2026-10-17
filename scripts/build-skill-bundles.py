#!/usr/bin/env python3
"""把带脚本的 skill 打成整包 —— deploy.sh 在 md 源镜像之后调用。

声明就是入口页里给客户端看的那一行，一字不差：

    如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录名>.tar.gz)下载到本地。

某个目录的 index.md 有这一行，就把整个目录打成 <out>/<同一相对路径>/<目录名>.tar.gz。
指引和链接缺一不可：只在代码块里写个下载地址不算声明。链接了 <目录名>.tar.gz 却不是这一行，
直接报错退出 —— 宁可部署停住，也不让入口页挂一个线上 404 的包。活例：
docs/maintenance/mock-bundle/index.md。

- 包内顶层目录就是 skill 目录名，下面是原样的目录树：解压出来的相对路径和网页上一一对应，
  文档一个字不用改，客户端远程逐个取文件和整包解压两种用法共用一套文档
- 跳过点开头的文件和目录（.meta.yml、误留的 .venv），与 deploy.sh 里 rsync 的 --exclude='.*/' 同理；
  也跳过 __pycache__ 和 .pyc：在 docs/ 里跑过一次脚本就会留下，git 忽略了，工作树里照样在；
  软链解引用成真身（站内有软链进 assets 的写法）
- 字节级可复现：条目按路径排序，mtime / uid / gid / 属主名固定，权限只留可执行位，
  gzip 头不写时间和文件名。内容不变包的 MD5 就不变，deploy 里 coscmd 的 -s 会跳过重传
- 包只出现在 site/ 和桶里，不进 git：不会把 LFS 里的字体、音效在仓库里重复存一份，也不会过期

用法：python3 scripts/build-skill-bundles.py [--docs docs] [--out site]
"""
from __future__ import annotations

import argparse
import gzip
import io
import os
import re
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MTIME = 0  # 固定时间戳，包才可复现


STANDARD = "如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill]({name}.tar.gz)下载到本地。"


def declared_bundles(docs: Path) -> list[Path]:
    """入口 index.md 有标准那一行的目录；链接了包却不是标准写法的，报错退出。"""
    found, bad = [], []
    for index in sorted(docs.rglob("index.md")):
        skill_dir = index.parent
        if skill_dir == docs or any(part.startswith(".") for part in index.relative_to(docs).parts):
            continue
        text = index.read_text(encoding="utf-8")
        name = skill_dir.name
        if STANDARD.format(name=name) in text:
            found.append(skill_dir)
        elif re.search(rf"\]\(\s*<?{re.escape(name)}\.tar\.gz>?\s*\)", text):
            bad.append(index)
    if bad:
        for index in bad:
            line = STANDARD.format(name=index.parent.name)
            print(f"✗ {index.relative_to(docs)} 链接了整包，但不是标准那一行，应写成：\n    {line}", file=sys.stderr)
        sys.exit(1)
    return found


def skipped(name: str) -> bool:
    return name.startswith(".") or name == "__pycache__" or name.endswith(".pyc")


def walk(skill_dir: Path) -> list[Path]:
    """目录下全部条目（目录在前、按路径排序），跳过点开头的和 Python 缓存，软链目录照样进去。"""
    entries = []
    for current, dirnames, filenames in os.walk(skill_dir, followlinks=True):
        dirnames[:] = sorted(d for d in dirnames if not skipped(d))
        base = Path(current)
        if base != skill_dir:
            entries.append(base)
        entries.extend(base / f for f in sorted(filenames) if not skipped(f))
    return sorted(entries, key=lambda p: p.relative_to(skill_dir).as_posix())


def tar_info(arcname: str, path: Path) -> tarfile.TarInfo:
    info = tarfile.TarInfo(arcname)
    info.mtime = MTIME
    info.uid = info.gid = 0
    info.uname = info.gname = ""
    if path.is_dir():
        info.type = tarfile.DIRTYPE
        info.mode = 0o755
    else:
        stat = path.stat()  # 跟随软链，拿真身
        info.size = stat.st_size
        info.mode = 0o755 if stat.st_mode & 0o111 else 0o644
    return info


def build(skill_dir: Path, out_file: Path) -> int:
    buffer = io.BytesIO()
    count = 0
    with gzip.GzipFile(filename="", mode="wb", fileobj=buffer, compresslevel=9, mtime=0) as gz:
        with tarfile.open(fileobj=gz, mode="w", format=tarfile.PAX_FORMAT) as tar:
            tar.addfile(tar_info(skill_dir.name, skill_dir))
            for path in walk(skill_dir):
                arcname = f"{skill_dir.name}/{path.relative_to(skill_dir).as_posix()}"
                info = tar_info(arcname, path)
                if info.isdir():
                    tar.addfile(info)
                else:
                    with path.open("rb") as fh:
                        tar.addfile(info, fh)
                    count += 1
    out_file.parent.mkdir(parents=True, exist_ok=True)
    partial = out_file.with_name(out_file.name + ".part")
    partial.write_bytes(buffer.getvalue())
    partial.replace(out_file)
    return count


def main() -> int:
    parser = argparse.ArgumentParser(description="入口页提到 <目录名>.tar.gz 的 skill 打成整包")
    parser.add_argument("--docs", type=Path, default=ROOT / "docs", help="源目录，默认 docs/")
    parser.add_argument("--out", type=Path, default=ROOT / "site", help="输出根目录，默认 site/")
    args = parser.parse_args()
    docs, out = args.docs.resolve(), args.out.resolve()

    bundles = declared_bundles(docs)
    for skill_dir in bundles:
        relative = skill_dir.relative_to(docs)
        out_file = out / relative / f"{skill_dir.name}.tar.gz"
        count = build(skill_dir, out_file)
        print(f"📦 {relative}/{out_file.name}：{count} 个文件，{out_file.stat().st_size / 1024:.0f} KB")
    if not bundles:
        print("没有 skill 声明整包")
    return 0


if __name__ == "__main__":
    sys.exit(main())
