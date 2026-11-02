"""沉浸阅读 · 视频的字幕切成段，每段一个定位号、一个起始时刻。

跑 deeptutor/video_learning/service.py 的 parse_webvtt → normalize_cues → build_segments。
字幕是构造的：一段 6 分钟的讲解「什么是 p 值」，12 句话（和 demo 数据里的
讲稿一致）。像自动字幕那样，每句在第一个逗号或冒号处拆成两条短 cue，只有
后半条带句号；写成 WebVTT，其中一条故意在时间行和正文之间夹一个空白行、
一条带 <c> 样式标签——这两种上游注释里点名的毛病都要能吃下。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.video_learning", "deeptutor.services", "deeptutor.multi_user")

from deeptutor.video_learning.service import build_segments, normalize_cues, parse_webvtt  # noqa: E402

CUES = [
    (0, 22, "今天讲 p 值。先看一个问题：灌装线标称每瓶 50 毫升，我们抽了 25 瓶。"),
    (22, 48, "样本均值是 52.3，比 50 多了 2.3 毫升。这 2.3 是真的偏了，还是抽样的运气？"),
    (48, 75, "假设检验的做法是：先假定没偏，也就是 μ 等于 50，看在这个假定下数据有多罕见。"),
    (75, 100, "算出来 t 等于 2.80，自由度 24。下面就要问，2.80 算不算极端。"),
    (100, 128, "p 值的定义是：在原假设成立的前提下，得到和观察结果一样极端或更极端的数据的概率。"),
    (128, 156, "注意「在原假设成立的前提下」这几个字。p 值是一个条件概率，条件就是 H0 为真。"),
    (156, 184, "这个例子里双侧 p 值大约是 0.0098，也就是说，如果真没偏，这么大的偏离不到百分之一的机会。"),
    (184, 210, "0.0098 小于 0.05，所以在 0.05 的水平下我们拒绝原假设。"),
    (210, 235, "但拒绝是一个决策，不是证明。照这个规则做，长期出错的频率不超过 α。"),
    (235, 270, "第一种误读：把 p 值当成原假设为真的概率。p 等于 0.0098，不是说 H0 只有 1% 的可能是真的。"),
    (270, 305, "第二种误读：p 大于 0.05 就说 H0 是真的。不能拒绝只是证据不够，不是证明它对。"),
    (305, 360, "第三种误读：p 越小效应越大。样本量很大时，一点点偏离也会给出极小的 p 值。"),
]


def ts(sec: float) -> str:
    return f"{int(sec // 3600):02d}:{int(sec % 3600 // 60):02d}:{sec % 60:06.3f}"


import re  # noqa: E402

fragments = []
for start, end, text in CUES:
    m = re.search(r"[，：]", text)
    cut = m.end() if m else len(text) // 2
    mid = round(start + (end - start) * cut / len(text), 1)
    fragments.append((start, mid, text[:cut]))
    fragments.append((mid, end, text[cut:]))

vtt = ["WEBVTT", ""]
for i, (start, end, text) in enumerate(fragments):
    vtt.append(f"{ts(start)} --> {ts(end)} align:start")
    if i == 8:
        vtt.append("   ")  # 时间行和正文之间夹一个空白行
    if i == 10:
        text = text.replace("条件概率", "<c.highlight>条件概率</c>")
    vtt.append(text)
    vtt.append("")
vtt_text = "\n".join(vtt)

parsed = parse_webvtt(vtt_text)
cues = normalize_cues(parsed)
segments = build_segments(cues)


def clock(sec: float) -> str:
    return f"{int(sec // 60):02d}:{int(sec % 60):02d}"


lines = [f"12 句话拆成 {len(fragments)} 条 cue 写进 WebVTT，解析出 {len(parsed)} 条，规整后 {len(cues)} 条，合并成 {len(segments)} 段：", ""]
for seg in segments:
    lines.append(f"定位号 {seg['locator']}  [{clock(seg['start'])}]–[{clock(seg['end'])}]  {seg['end'] - seg['start']:>5.0f}s  {seg['text'][:30]}…")
lines.append("")
lines.append(f"第 11 条 cue 的样式标签去掉了：「{cues[10]['text']}」")
lines.append(f"第 9 条 cue 前的空白行没吞掉正文：「{cues[8]['text']}」")

out("reading-video", {"vtt": vtt_text, "parsed": parsed, "cues": cues, "segments": segments})
txt("reading-video", "\n".join(lines))
print("\n".join(lines))
