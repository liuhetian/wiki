"""站点后处理：在 zensical build + rsync 复制 .md 之后运行（只依赖标准库）。

做两件事：
  1. 在每个页面 HTML 的 <head> 里加 <link rel="alternate" type="text/markdown" href="...">，
     告诉 AI 本页 Markdown 在哪里（x/ 对应 x.md，但 x/index.md 也对应 x/，没法靠猜）。用相对地址。
  2. 检查 .md 里的相对链接：AI 读完一页后，是按相对路径去请求下一页的（/wiki/a/b.md 里的 ../c.md
     → /wiki/c.md），所以链接必须指向 site/ 里真实存在的文件。写成目录形式（../c/）或失效的链接打印警告。

用法：python postbuild.py site
"""

from __future__ import annotations

import posixpath
import re
import sys
from pathlib import Path, PurePosixPath

sys.path.insert(0, str(Path(__file__).resolve().parent))
from placeholders import without_code  # noqa: E402

LINK = re.compile(r"\]\(<?([^)\s>]+)")  # [文字](目标) 里的目标
SCHEME = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")  # http:、mailto: 等外链


def html_path(rel: str) -> PurePosixPath:
    """use_directory_urls 下 .md 对应的 HTML：x.md → x/index.html，x/index.md → x/index.html。"""
    p = PurePosixPath(rel)
    if p.name in ("index.md", "README.md"):
        return p.parent / "index.html"
    return p.with_suffix("") / "index.html"


def alternate_href(rel: str) -> str:
    """从页面 HTML 所在目录到 .md 的相对地址：x.md → ../x.md，x/index.md → index.md。"""
    return posixpath.relpath(rel, str(html_path(rel).parent))


def bad_links(site: Path, rel: str, text: str) -> list[str]:
    """找出在 site/ 里没有对应文件的相对链接（外链、锚点、/ 开头的绝对路径不查）。"""
    bad = []
    for target in LINK.findall(without_code(text)):
        if target.startswith(("#", "/")) or SCHEME.match(target):
            continue
        path = target.split("#", 1)[0].split("?", 1)[0]
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(rel), path))
        if resolved == ".." or resolved.startswith("../") or not (site / resolved).is_file():
            bad.append(target)
    return bad


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("用法：postbuild.py <site 目录>")
    site = Path(sys.argv[1])
    count = warnings = 0
    for md in sorted(site.rglob("*.md")):
        rel = md.relative_to(site).as_posix()
        count += 1
        for target in bad_links(site, rel, md.read_text(encoding="utf-8")):
            warnings += 1
            print(f"postbuild: 警告 {rel} 的链接 {target} 找不到对应文件，AI 按相对路径读不到", file=sys.stderr)

        html_file = site / html_path(rel)
        if html_file.is_file():
            link = f'<link rel="alternate" type="text/markdown" href="{alternate_href(rel)}" title="Markdown">'
            content = html_file.read_text(encoding="utf-8")
            if 'type="text/markdown"' not in content:
                html_file.write_text(content.replace("</head>", f"  {link}\n</head>", 1), encoding="utf-8")

    print(f"postbuild: {count} 个 .md；相对链接{'全部有效' if not warnings else f'有 {warnings} 个警告'}")


if __name__ == "__main__":
    main()
