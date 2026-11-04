#!/usr/bin/env python3
"""小说转漫剧：prompt 之间的机械活，不调模型。

  split  文本 → 编号短句（分镜、洗稿的输入）
  chunk  长篇 → 约 1000 字一段（小说转剧本一次转一段）
  srt    SRT 字幕 → 带时长的编号短句（5 秒镜头的输入）
  cut    带时长的编号短句 → 每镜累加不到 5 秒的分组，输出格式同 5 秒镜头 prompt
  expand 分镜输出的句号范围 + 编号短句 → 镜头文案；加 --images 拼成视频那一步的输入
  next   小说转剧本上一段的输出 → 下一段的起始分镜序号

只用标准库，Python 3.9+。用法：python3 scripts/shots.py <子命令> -h
"""
import argparse
import re
import sys
from pathlib import Path

END = '。！？!?；;…'
CLOSE = '”’」』）)】》"\''
LINE = re.compile(r'^\s*(\d+)[.、．]\s*(.*?)\s*$')
DUR = re.compile(r'\[时长[:：]\s*([\d.]+)\s*s?\]')
RANGE = re.compile(r'^\s*\[(\d+)\]\s*(\d+)(?:\s*-\s*(\d+))?\s*$')


def read(path):
    return sys.stdin.read() if path == '-' else Path(path).read_text(encoding='utf-8')


def fmt(x):
    return f'{x:.2f}'.rstrip('0').rstrip('.') or '0'


def sentences(text, clause=False):
    """按句末标点和换行切，引号、括号的右半边跟着前一句走。"""
    ends = END + ('，,、：:' if clause else '')
    out = []
    for para in text.splitlines():
        buf = ''
        i = 0
        while i < len(para):
            buf += para[i]
            if para[i] in ends:
                while i + 1 < len(para) and (para[i + 1] in ends or para[i + 1] in CLOSE):
                    i += 1
                    buf += para[i]
                if buf.strip():
                    out.append(buf.strip())
                buf = ''
            i += 1
        if buf.strip():
            out.append(buf.strip())
    return out


def numbered(text):
    """读编号短句：返回 [(序号, 文案, 时长或 None)]，时间戳和时长从文案里剥掉。"""
    rows = []
    for line in text.splitlines():
        m = LINE.match(line)
        if not m:
            continue
        body = m.group(2)
        d = DUR.search(body)
        body = DUR.sub('', body)
        body = re.sub(r'\(\s*[\d.]+s?\s*->\s*[\d.]+s?\s*\)', '', body).strip()
        rows.append((int(m.group(1)), body, float(d.group(1)) if d else None))
    return rows


def cmd_split(a):
    for i, s in enumerate(sentences(read(a.file), a.clause), a.start):
        print(f'{i}. {s}')


def cmd_chunk(a):
    paras = [p.strip() for p in read(a.file).splitlines() if p.strip()]
    chunks, buf = [], ''
    for p in paras:
        if buf and len(buf) + len(p) > a.size:
            chunks.append(buf)
            buf = ''
        buf = f'{buf}\n{p}' if buf else p
    if buf:
        chunks.append(buf)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for i, c in enumerate(chunks, 1):
        (out / f'{i:03d}.txt').write_text(c + '\n', encoding='utf-8')
        print(f'{out / f"{i:03d}.txt"}\t{len(c)} 字')


def srt_time(s):
    h, m, rest = s.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(rest)


def cmd_srt(a):
    blocks = re.split(r'\n\s*\n', read(a.file).replace('\r\n', '\n').strip())
    n = a.start
    for b in blocks:
        lines = [l for l in b.split('\n') if l.strip()]
        k = next((i for i, l in enumerate(lines) if '-->' in l), None)
        if k is None:
            continue
        t0, t1 = (srt_time(x.strip()) for x in lines[k].split('-->'))
        text = ''.join(lines[k + 1:]).strip()
        if text:
            print(f'{n}. {text} ({fmt(t0)}s->{fmt(t1)}s) [时长:{fmt(t1 - t0)}s]')
            n += 1


def cmd_cut(a):
    rows = numbered(read(a.file))
    if not rows or any(d is None for _, _, d in rows):
        sys.exit('每一行都要带 [时长:Xs]，先用 srt 子命令转字幕')
    shots, cur, total = [], [], 0.0
    for n, _, d in rows:
        if cur and total + d >= a.limit:
            shots.append(cur)
            cur, total = [], 0.0
        cur.append(n)
        total += d
        if d >= a.limit:
            print(f'第 {n} 句单独就有 {fmt(d)} 秒，超过 {fmt(a.limit)} 秒，单独成镜', file=sys.stderr)
    if cur:
        shots.append(cur)
    print('[开始输出]')
    for i, s in enumerate(shots, 1):
        print(f'[{i}] {s[0]}' + (f'-{s[-1]}' if len(s) > 1 else ''))
    print('[输出完成]')


def ranges(text):
    out = []
    for line in text.splitlines():
        m = RANGE.match(line)
        if m:
            lo = int(m.group(2))
            out.append((int(m.group(1)), lo, int(m.group(3) or lo)))
    return out


def tagged(text):
    """读「[N] 内容」式的输出，返回 {N: 内容}。"""
    out = {}
    for line in text.splitlines():
        m = re.match(r'^\s*\[(\d+)\]\s*(.*?)\s*$', line)
        if m and m.group(2):
            out[int(m.group(1))] = m.group(2)
    return out


def join(parts):
    s = ''
    for p in parts:
        s += p if not s or s[-1] in END + CLOSE + '，,、：:' else '，' + p
    return s


def cmd_expand(a):
    rows = {n: (t, d) for n, t, d in numbered(read(a.lines))}
    images = tagged(read(a.images)) if a.images else {}
    blocks = []
    for k, lo, hi in ranges(read(a.ranges)):
        missing = [n for n in range(lo, hi + 1) if n not in rows]
        if missing:
            sys.exit(f'镜头 {k} 要的第 {missing} 句在编号短句里没有')
        texts = [rows[n][0] for n in range(lo, hi + 1)]
        durs = [rows[n][1] for n in range(lo, hi + 1)]
        b = [f'镜头{k}：', f'镜头文案：{join(texts)}']
        if a.images:
            if k not in images:
                sys.exit(f'图片提示词里没有 [{k}]')
            b.append(f'图片提示词：{images[k]}')
        if all(d is not None for d in durs):
            b.append(f'时长：{fmt(sum(durs))}秒')
        elif a.seconds:
            b.append(f'时长：{fmt(a.seconds)}秒')
        blocks.append('\n'.join(b))
    print('\n\n'.join(blocks))


def cmd_next(a):
    nums = [int(m.group(2)) for m in re.finditer(r'分镜\s*(\d+)\.(\d+)', read(a.file))]
    if not nums:
        sys.exit('没找到「分镜X.Y」')
    print(max(nums) + 1)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('split', help='文本 → 编号短句')
    s.add_argument('file', help='文本文件，- 读标准输入')
    s.add_argument('--clause', action='store_true', help='逗号、顿号、冒号也断开')
    s.add_argument('--start', type=int, default=1, help='起始序号，默认 1')
    s.set_defaults(func=cmd_split)
    s = sub.add_parser('chunk', help='长篇 → 约 N 字一段，按段落断开')
    s.add_argument('file')
    s.add_argument('--size', type=int, default=1000, help='每段大约多少字，默认 1000')
    s.add_argument('--out', required=True, help='输出目录，写 001.txt、002.txt……')
    s.set_defaults(func=cmd_chunk)
    s = sub.add_parser('srt', help='SRT 字幕 → 带时长的编号短句')
    s.add_argument('file')
    s.add_argument('--start', type=int, default=1)
    s.set_defaults(func=cmd_srt)
    s = sub.add_parser('cut', help='带时长的编号短句 → 每镜累加不到 N 秒的分组')
    s.add_argument('file')
    s.add_argument('--limit', type=float, default=5.0, help='每镜时长上限（不含），默认 5')
    s.set_defaults(func=cmd_cut)
    s = sub.add_parser('expand', help='句号范围 + 编号短句 → 镜头文案')
    s.add_argument('ranges', help='分镜那一步的输出，[N] X-Y')
    s.add_argument('lines', help='编号短句')
    s.add_argument('--images', help='画面提示词那一步的输出，[N] ……；给了就拼成视频那一步的输入')
    s.add_argument('--seconds', type=float, help='短句不带时长时，每镜统一的时长')
    s.set_defaults(func=cmd_expand)
    s = sub.add_parser('next', help='小说转剧本上一段的输出 → 下一段的起始分镜序号')
    s.add_argument('file')
    s.set_defaults(func=cmd_next)
    a = p.parse_args()
    a.func(a)


if __name__ == '__main__':
    main()
