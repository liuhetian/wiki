#!/usr/bin/env python3
"""小说转漫剧：模型输出的校验和就地修正，不调模型。

  shots    序号从 1 连续、条数对得上；句号范围首尾相接不漏句、每镜不超时；一条只占一行
  names    @名 统一写成 **@标准名**，别名换成标准名，认不出的列出来
  segments 视频描述的「第X秒到第Y秒」从 0 开始、首尾相接、收在镜头时长上
  lines    洗稿前后行数、行号对齐；每行字数偏差超过 10% 的只列出来，不算错

发现问题退出码是 1，只把出错的镜头挑出来单独重跑，不用整批重做。
只用标准库，Python 3.9+。用法：python3 scripts/check.py <子命令> -h
"""
import argparse
import re
import sys
from pathlib import Path

TAG = re.compile(r'^\s*\[(\d+)\]\s*(.*?)\s*$')
RANGE = re.compile(r'^(\d+)(?:\s*-\s*(\d+))?$')
LINE = re.compile(r'^\s*(\d+)[.、．]\s*(.*?)\s*$')
DUR = re.compile(r'\[时长[:：]\s*([\d.]+)\s*s?\]')
SEG = re.compile(r'[(（]\s*第\s*([\d.]+)\s*秒\s*(?:到|～|~|—|-)\s*第?\s*([\d.]+)\s*秒\s*[)）]')
SHOT_DUR = re.compile(r'^镜头\s*(\d+)\s*[:：]?\s*$|^(?:镜头)?时长\s*[:：]\s*([\d.]+)\s*秒?')
MARKS = ('[开始输出]', '[输出完成]', '[输出开始]')


def read(path):
    return sys.stdin.read() if path == '-' else Path(path).read_text(encoding='utf-8')


def fmt(x):
    return f'{x:.2f}'.rstrip('0').rstrip('.') or '0'


def body(text):
    """去掉 [开始输出] / [输出完成] 和空行。"""
    return [l for l in text.splitlines() if l.strip() and l.strip() not in MARKS]


def tagged(text):
    out, stray = {}, []
    for l in body(text):
        m = TAG.match(l)
        if m:
            out.setdefault(int(m.group(1)), []).append(m.group(2))
        else:
            stray.append(l)
    return out, stray


def numbered(text):
    rows = {}
    for l in text.splitlines():
        m = LINE.match(l)
        if m:
            d = DUR.search(m.group(2))
            rows[int(m.group(1))] = (DUR.sub('', m.group(2)).strip(), float(d.group(1)) if d else None)
    return rows


def cmd_shots(a):
    errs = []
    text = read(a.file)
    tags, stray = tagged(text)
    keys = sorted(tags)
    if keys != list(range(1, len(keys) + 1)):
        errs.append(f'序号不连续：{keys[:20]}')
    for k, v in tags.items():
        if len(v) > 1:
            errs.append(f'[{k}] 出现了 {len(v)} 次')
    if stray:
        errs.append(f'有 {len(stray)} 行不以 [N] 开头（换行了或混进了说明）：{stray[0][:40]}')
    if a.count and len(keys) != a.count:
        errs.append(f'应该 {a.count} 条，实际 {len(keys)} 条')
    if a.lines:
        rows = numbered(read(a.lines))
        want = min(rows) if rows else 1
        for k in keys:
            m = RANGE.match(tags[k][0])
            if not m:
                errs.append(f'[{k}] 不是句号范围：{tags[k][0][:30]}')
                continue
            lo, hi = int(m.group(1)), int(m.group(2) or m.group(1))
            if lo != want:
                errs.append(f'[{k}] 从第 {lo} 句开始，应该从第 {want} 句')
            want = hi + 1
            ds = [rows.get(n, (None, None))[1] for n in range(lo, hi + 1)]
            if a.limit and all(d is not None for d in ds) and sum(ds) >= a.limit and hi > lo:
                errs.append(f'[{k}] {lo}-{hi} 累加 {fmt(sum(ds))} 秒，不到 {fmt(a.limit)} 秒才合格')
        if rows and want != max(rows) + 1:
            errs.append(f'最后只覆盖到第 {want - 1} 句，一共 {max(rows)} 句')
    report(errs, f'{len(keys)} 条')


def load_names(paths):
    """读「角色：名；别名：A、B 描述：……」这类预设，返回 {写法: 标准名}。"""
    names = {}
    for p in paths:
        for l in read(p).splitlines():
            m = re.match(r'^\s*(?:[-*]\s*)?(?:角色|场景|物品|道具|预设)\s*[:：]\s*([^；;\s]+)\s*(?:[；;]\s*别名\s*[:：]\s*([^\n]*?))?\s*(?:描述\s*[:：].*)?$', l)
            if not m:
                continue
            std = m.group(1)
            names[std] = std
            for al in re.split(r'[、，,/\s]+', m.group(2) or ''):
                if al and al != '无':
                    names.setdefault(al, std)
    return names


def cmd_names(a):
    names = load_names(a.names)
    if not names:
        sys.exit('预设文件里没读到「角色：名；别名：……」这样的行')
    alts = sorted(names, key=len, reverse=True)
    pat = re.compile(r'\*{0,2}@(' + '|'.join(map(re.escape, alts)) + r')\*{0,2}')
    text = read(a.file)
    fixed, changes = pat.subn(lambda m: f'**@{names[m.group(1)]}**', text)
    unknown = sorted({m.group(1) for m in re.finditer(r'(?<!\*\*)@([^\s*@，。、,.；;]{1,12})', pat.sub('', text))})
    if a.write:
        Path(a.file).write_text(fixed, encoding='utf-8')
    else:
        sys.stdout.write(fixed)
        sys.stdout.flush()
    changed = sum(1 for m in pat.finditer(text) if m.group(0) != f'**@{names[m.group(1)]}**')
    print(f'\n统一了 {changed} 处写法', file=sys.stderr)
    report([f'认不出的 @：{"、".join(unknown)}'] if unknown else [], '@名都认得', out=sys.stderr)


def shot_durations(text):
    durs, cur = {}, None
    for l in text.splitlines():
        m = SHOT_DUR.match(l.strip())
        if m and m.group(1):
            cur = int(m.group(1))
        elif m and m.group(2) and cur is not None:
            durs[cur] = float(m.group(2))
    return durs


def cmd_segments(a):
    tags, _ = tagged(read(a.file))
    durs = shot_durations(read(a.shots)) if a.shots else {}
    errs = []
    for k in sorted(tags):
        segs = [(float(x), float(y)) for x, y in SEG.findall(' '.join(tags[k]))]
        if not segs:
            errs.append(f'[{k}] 没找到「第X秒到第Y秒」')
            continue
        if segs[0][0] != 0:
            errs.append(f'[{k}] 从第 {fmt(segs[0][0])} 秒开始，应该从第 0 秒')
        for (x0, y0), (x1, y1) in zip(segs, segs[1:]):
            if abs(x1 - y0) > 1e-6:
                errs.append(f'[{k}] 第 {fmt(y0)} 秒接到第 {fmt(x1)} 秒，没衔接上')
        for x, y in segs:
            if y <= x:
                errs.append(f'[{k}] 第 {fmt(x)} 秒到第 {fmt(y)} 秒，倒了')
        want = durs.get(k, a.seconds)
        if want is not None and abs(segs[-1][1] - want) > 1e-6:
            errs.append(f'[{k}] 收在第 {fmt(segs[-1][1])} 秒，镜头时长是 {fmt(want)} 秒')
    report(errs, f'{len(tags)} 条时间段都衔接上')


def cmd_lines(a):
    src, dst = numbered(read(a.input)), numbered(read(a.output))
    errs, warns = [], []
    if sorted(src) != sorted(dst):
        errs.append(f'行号对不上：原文 {len(src)} 行，改写 {len(dst)} 行；'
                    f'缺 {sorted(set(src) - set(dst))[:10]}，多 {sorted(set(dst) - set(src))[:10]}')
    for n in sorted(set(src) & set(dst)):
        s, d = len(src[n][0]), len(dst[n][0])
        if s and abs(d - s) / s > a.tolerance:
            warns.append(f'第 {n} 行 {s} 字改成了 {d} 字')
    for w in warns:
        print('⚠ ' + w)
    report(errs, f'{len(dst)} 行都对齐' + (f'，{len(warns)} 行字数偏差超过 {a.tolerance:.0%}' if warns else ''))


def report(errs, ok, out=sys.stdout):
    if errs:
        for e in errs:
            print('✗ ' + e, file=out)
        sys.exit(1)
    print('✓ ' + ok, file=out)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('shots', help='序号、条数、句号范围、每镜时长')
    s.add_argument('file', help='模型输出，[N] ……')
    s.add_argument('--count', type=int, help='应该有几条')
    s.add_argument('--lines', help='编号短句；给了就按句号范围核对覆盖和时长')
    s.add_argument('--limit', type=float, help='每镜时长上限（不含），比如 5')
    s.set_defaults(func=cmd_shots)
    s = sub.add_parser('names', help='@名 统一成 **@标准名**')
    s.add_argument('file')
    s.add_argument('--names', nargs='+', required=True, help='角色、场景、物品信息文件')
    s.add_argument('--write', action='store_true', help='改回原文件；不给就输出到标准输出')
    s.set_defaults(func=cmd_names)
    s = sub.add_parser('segments', help='视频描述的时间段衔接')
    s.add_argument('file')
    s.add_argument('--shots', help='视频那一步的输入（shots.py expand 的输出），从里面读每镜时长')
    s.add_argument('--seconds', type=float, help='每镜统一的时长')
    s.set_defaults(func=cmd_segments)
    s = sub.add_parser('lines', help='洗稿前后行数、行号、字数')
    s.add_argument('input')
    s.add_argument('output')
    s.add_argument('--tolerance', type=float, default=0.10, help='字数偏差上限，默认 0.10')
    s.set_defaults(func=cmd_lines)
    a = p.parse_args()
    a.func(a)


if __name__ == '__main__':
    main()
