#!/usr/bin/env python3
"""把 Maple Mono 官方发布物加工成本站用的 woff2，落到 docs/vendor/fonts/files/。

为什么要这一步：官方只对拉丁字形出了 woff2（1.2MB 压缩包），带中日韩字形的
CN 版只有 ttf（单字重 18MB），直接上站不可能。所以拉丁字形照抄官方 woff2，
中文字形自己按「GB2312 全集 + 本站实际用字」子集化再转 woff2。

用法（不要装进项目依赖，fonttools 只在换字体版本时用一次）：

    # 1. 下载并解压两个官方发布物到同一个目录
    V=v7.9; D=/tmp/maple; mkdir -p $D && cd $D
    curl -sLO https://github.com/subframe7536/maple-font/releases/download/$V/MapleMono-Woff2.zip
    curl -sLO https://github.com/subframe7536/maple-font/releases/download/$V/MapleMono-CN-unhinted.zip
    unzip -oq MapleMono-Woff2.zip && unzip -oq MapleMono-CN-unhinted.zip

    # 2. 加工（在项目根跑）
    uv run --with "fonttools[woff]" python scripts/build-fonts.py /tmp/maple

字符集口径见 cjk_charset()：改动它就要重跑本脚本并重新提交 files/ 下的 woff2。
汉字字身框的收紧见 tighten_cjk()。
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "vendor" / "fonts" / "files"

# 拉丁字形：官方 woff2 直接改名照抄。字重取本站真正用到的几档
# （zx-theme/home.css 里出现过 400/600/700/800，Material 自身还要 300/500），
# 斜体只留 400/700 —— 800 斜体在本站没有用例。
LATIN = {
    "Light": ("300", "normal"),
    "Regular": ("400", "normal"),
    "Medium": ("500", "normal"),
    "SemiBold": ("600", "normal"),
    "Bold": ("700", "normal"),
    "ExtraBold": ("800", "normal"),
    "Italic": ("400", "italic"),
    "BoldItalic": ("700", "italic"),
}

# 中文字形：子集后单字重仍有几百 KB，只出常规与粗两档，
# fonts.css 用 font-weight 区间把 100-500 / 501-900 分别兜到这两个文件上。
CJK = {"Regular": "400", "Bold": "700"}

# 汉字字身框：Maple Mono CN 把 1000 的标准字身框塞进 1200 的 advance（左右各留 100），
# 好处是一个汉字正好 = 两个拉丁字符、代码里中英能对齐成栅格；代价是正文里字距肉眼可见地松，
# 中文读起来像儿童读物。本站是中文 wiki，正文观感优先，所以压回 1000 —— 与系统黑体、
# 思源一致的标准字身框。放弃的是「汉字 = 2 个拉丁字符」，代码块里中英混排的列对齐会失效。
# 想要栅格回来就把这里改成 1200（等于不动字体度量），改完重跑本脚本。
CJK_TARGET_WIDTH = 1000


def cjk_charset() -> set[str]:
    """子集保留的字符：GB2312 全集 ∪ 本站实际出现的非拉丁字符 ∪ 几个符号区。"""
    keep: set[str] = set()

    # GB2312 一级汉字（3755 字，按使用频率排的常用字）+ 1-9 区的标点/假名/希腊/西里尔。
    # 不要二级字（3008 个生僻字）：加上它单字重从 1.0MB 涨到 1.7MB，而本站两年也写不到几个。
    # 真写到了由下面「实际用字」那一支捞回来，代价是重跑本脚本。
    for lo_hi in ((0xA1, 0xA9), (0xB0, 0xD7)):
        for hi in range(lo_hi[0], lo_hi[1] + 1):
            for lo in range(0xA1, 0xFF):
                try:
                    keep.add(bytes((hi, lo)).decode("gb2312"))
                except UnicodeDecodeError:
                    pass

    # 本站实际出现的非拉丁字符：docs/ 全量扫一遍，把生僻字、日文假名、制表符钉住。
    # 字体里没有的（emoji、韩文）子集时会被自动忽略，不影响产物。
    exts = {".md", ".html", ".css", ".js", ".yml", ".yaml", ".txt", ".json"}
    sources = [p for p in (ROOT / "docs").rglob("*") if p.is_file() and p.suffix.lower() in exts]
    sources.append(ROOT / "mkdocs.yml")
    for path in sources:
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        keep.update(ch for ch in text if ord(ch) > 0x2000)

    # 成块补齐几个「以后大概率会写到」的符号区：CJK 标点、全角形、假名、
    # 箭头、数学算符、制表符、几何图形。整块也就几百个字形，比事后发现缺字便宜。
    blocks = [
        (0x2000, 0x206F),  # 通用标点（—…‘’“”等）
        (0x2190, 0x21FF),  # 箭头
        (0x2200, 0x22FF),  # 数学算符
        (0x2500, 0x257F),  # 制表符
        (0x25A0, 0x25FF),  # 几何图形
        (0x3000, 0x303F),  # CJK 标点
        (0x3040, 0x30FF),  # 平假名 + 片假名
        (0xFF00, 0xFFEF),  # 全角形
    ]
    for start, end in blocks:
        keep.update(chr(cp) for cp in range(start, end + 1))

    return keep


def tighten_cjk(path: Path) -> tuple[int, int]:
    """把 advance=1200 的字形压到 CJK_TARGET_WIDTH，字形整体左移保持居中。

    只碰 advance 恰为 1200 的字形（=全部汉字/假名/中文标点/全角形，4472 个），
    拉丁字形是 600、空字形是 0，都不动。已核对过：CN 子集里 advance=1200 的字形
    没有一个是复合字形，也没有任何复合字形引用它们 —— 所以直接平移轮廓点不会
    让别的字形跟着漂。换字体版本后这个前提要重新核一遍（脚本会自己报错）。
    """
    if CJK_TARGET_WIDTH == 1200:
        return (0, 0)

    font = TTFont(path)
    glyf, hmtx = font["glyf"], font["hmtx"]
    shift = (CJK_TARGET_WIDTH - 1200) // 2   # 负数：字形左移，把右边多出来的空也收掉
    touched = 0

    for name in font.getGlyphOrder():
        advance, lsb = hmtx[name]
        if advance != 1200:
            continue
        glyph = glyf[name]
        if glyph.isComposite():
            raise SystemExit(
                f"{path.name}: 字形 {name} 是复合字形且 advance=1200，"
                "平移轮廓的前提不再成立，需要先展开复合字形再改度量"
            )
        if glyph.numberOfContours != 0:
            glyph.coordinates.translate((shift, 0))
            glyph.recalcBounds(glyf)
        hmtx[name] = (CJK_TARGET_WIDTH, lsb + shift)
        touched += 1

    # advanceWidthMax 必须跟着降，否则等宽检测与部分排版引擎会按 1200 预留行宽
    font["hhea"].advanceWidthMax = max(aw for aw, _ in hmtx.metrics.values())
    font.flavor = "woff2"
    font.save(path)
    return (touched, shift)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    for name, (weight, style) in LATIN.items():
        f = src / f"MapleMono-{name}.ttf.woff2"
        if not f.exists():
            print(f"缺 {f}（MapleMono-Woff2.zip 没解到位？）")
            return 1
        dst = OUT / f"maple-mono-latin-{weight}-{style}.woff2"
        shutil.copyfile(f, dst)
        print(f"{dst.stat().st_size / 1024:7.0f} KB  {dst.name}  ← 官方 woff2")

    charset = cjk_charset()
    unicodes = ",".join(f"U+{ord(c):04X}" for c in sorted(charset))
    print(f"\n中文子集字符集：{len(charset)} 个码位")
    for name, weight in CJK.items():
        f = src / f"MapleMono-CN-{name}.ttf"
        if not f.exists():
            print(f"缺 {f}（MapleMono-CN-unhinted.zip 没解到位？）")
            return 1
        dst = OUT / f"maple-mono-cn-{weight}-normal.woff2"
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(f),
                f"--unicodes={unicodes}",
                "--flavor=woff2",
                f"--output-file={dst}",
                # 保留连字/等宽特性与竖排以外的常用 GSUB；drop-tables 去掉 hinting 与
                # 网页用不到的表，进一步压体积
                "--layout-features=+liga,+calt,+kern,+ccmp,+locl",
                "--drop-tables+=DSIG,prep,fpgm,cvt,gasp,VDMX,hdmx,LTSH",
                "--no-hinting",
                "--desubroutinize",
                "--name-IDs=*",
                "--recalc-bounds",
            ],
            check=True,
        )
        touched, shift = tighten_cjk(dst)
        note = f"，{touched} 个字形 advance 1200→{CJK_TARGET_WIDTH}（轮廓左移 {abs(shift)}）" if touched else ""
        print(f"{dst.stat().st_size / 1024:7.0f} KB  {dst.name}  ← 子集自 {f.name}{note}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
