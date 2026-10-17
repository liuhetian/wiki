#!/usr/bin/env python3
"""把带脚本的 skill 打成整包 —— deploy.sh 在 md 源镜像之后调用。

声明就是页面里给客户端看的那一行，一字不差，只有链接随页面变：

    如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录>/<目录名>.tar.gz)下载到本地。

哪个页面有这一行，就把链接指向的那个目录原样打成包，放在这个目录里、以目录名命名：
<out>/<目录的相对路径>/<目录名>.tar.gz。入口是 index.md 时，要打的就是它自己的目录，
链接写成 <目录名>.tar.gz（docs/maintenance/mock-bundle/index.md）；不占 index.md 的单页
（Gallery 的 collected/ 里那种）指向自己的工程目录，比如
docs/gallery/video/collected/gallery-parallax-ink.md 写的
assets/parallax-ink-starter/parallax-ink-starter.tar.gz。
指引和链接缺一不可：代码块和行内代码里写的不算声明。页面链接了某个目录的包，
全站却没有一处用标准那一行声明它，直接报错退出 —— 宁可部署停住，也不让页面挂一个线上 404 的包；
子页链到上级已经声明过的包（mock-bundle/count/index.md 那样）不受影响。

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


STANDARD = "如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill]({link})下载到本地。"
LINK = re.compile(r"\]\(\s*<?([^()\s<>]+\.tar\.gz)>?\s*\)")
FENCE = re.compile(r"^\s*(`{3,}|~{3,})")


def prose(text: str) -> str:
    """去掉代码块和行内代码：那里写的包地址只是举例，不算声明，也不该报错。"""
    lines, fence = [], None
    for line in text.splitlines():
        mark = FENCE.match(line)
        if mark:
            token = mark.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence is None:
            lines.append(re.sub(r"`[^`]*`", "", line))
    return "\n".join(lines)


def bundle_dir(page: Path, link: str, docs: Path) -> Path | None:
    """链接形如 <目录>/<目录名>.tar.gz 时返回那个目录；不是这个形状、目录不存在或在 docs/ 外都返回 None。"""
    if "://" in link or link.startswith("/"):
        return None
    archive = Path(os.path.normpath(page.parent / link))
    folder = archive.parent
    if archive.name != f"{folder.name}.tar.gz" or not folder.is_dir():
        return None
    if folder == docs or not folder.is_relative_to(docs):
        return None
    if any(part.startswith(".") for part in folder.relative_to(docs).parts):
        return None
    return folder


def declared_bundles(docs: Path) -> list[Path]:
    """全站页面里用标准那一行声明过的目录；链接了没人声明的包，报错退出。"""
    declared: dict[Path, Path] = {}
    loose: list[tuple[Path, str, Path]] = []
    for page in sorted(docs.rglob("*.md")):
        if any(part.startswith(".") for part in page.relative_to(docs).parts):
            continue
        text = prose(page.read_text(encoding="utf-8"))
        if ".tar.gz" not in text:
            continue
        for match in LINK.finditer(text):
            link = match.group(1)
            folder = bundle_dir(page, link, docs)
            if folder is None:
                continue
            if STANDARD.format(link=link) in text:
                declared.setdefault(folder, page)
            else:
                loose.append((page, link, folder))
    bad = [(page, link) for page, link, folder in loose if folder not in declared]
    if bad:
        for page, link in bad:
            line = STANDARD.format(link=link)
            print(f"✗ {page.relative_to(docs)} 链接了整包 {link}，但全站没有一处用标准那一行声明它，应写成：\n    {line}", file=sys.stderr)
        sys.exit(1)
    return sorted(declared)


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
    parser = argparse.ArgumentParser(description="页面里用标准那一行声明的目录打成整包")
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
