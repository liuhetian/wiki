"""沉浸阅读 · 带定位号的检索，和跳转前的引文校验。

跑 deeptutor/reading/search.py 的 search_units / locate_quote，以及
deeptutor/reading/service.py 的 verify_quote（reader_goto 在跳转前调它）。
材料是构造的：《应用统计学》第 8 章 234–250 页里有正文的几页，一页一个单元，
定位号就是页码。ReadingStore 换成只交出单元文字的替身。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _load import open_clone, out, stub, txt  # noqa: E402

clone = open_clone()
stub(clone, "deeptutor.reading", "deeptutor.services")

from deeptutor.reading.search import locate_quote, search_units, terms_of  # noqa: E402
from deeptutor.reading.service import verify_quote  # noqa: E402

PAGES = {
    234: "例 8.1 中，若取 α = 0.05，双侧检验的拒绝域为 |z| > 1.96。样本均值落在拒绝域之外，因此在 0.05 的显著性水平下不能拒绝原假设。「不能拒绝 H0」不等于「接受 H0 为真」。",
    236: "8.2 两类错误与显著性水平\n假设检验依据样本作出判断，判断就可能出错。若原假设 H0 实际为真，样本却落入了拒绝域，于是拒绝了 H0，称为第一类错误，也叫弃真错误，其概率记为 α。\n显著性水平 α 是我们事先愿意承担的第一类错误概率的上限，它在抽样之前就已给定，\n与观察到的这一个样本无关。",
    247: "自由度为 24，查表得 t0.975(24) = 2.064。|t| = 2.80 > 2.064，落入拒绝域，在 0.05 的水平下拒绝 H0。",
    248: "8.4 p 值的含义\np 值是在原假设 H0 为真的前提下，得到与观察结果一样极端或更极端的检验统计量的概率。\np 值不是原假设为真的概率，也不是备择假设为假的概率；它是先假定 H0 为真、再计算出来的条件概率。",
    249: "三种常见误读：把 p 值当成 H0 为真的概率；把「p 大于 0.05」当成「H0 为真」；把 p 值的大小当成效应的大小。",
}
units = sorted(PAGES.items())


class FakeManifest:
    unit_count = 412


class FakeStore:
    def manifest(self, material_id):
        return FakeManifest()

    def unit_text(self, material_id, locator):
        return PAGES.get(locator, "")

    def iter_units(self, material_id):
        return iter(units)


store = FakeStore()
record = {"search": [], "locate": [], "verify": []}
lines = ["search_units：一层层放宽，报告是哪一层命中的", ""]

for query in [
    "第一类错误概率的上限",  # 原文里连着的一句：exact
    "第一类错误,也叫弃真错误",  # 半角逗号，原文是全角：exact 失败，normalised 去掉标点后命中
    "它在抽样之前就已给定，与观察到的这一个样本无关",  # 原文在逗号后断了行，多出一个空白：normalised 也对不上
    "p 值是不是原假设为真的概率",  # 一句自然语言的问题：只有 terms 层能接住
]:
    res = search_units(units, query, limit=3)
    record["search"].append({"query": query, **res.to_dict()})
    lines.append(f"查「{query}」")
    lines.append(f"  命中层 {res.mode}，{len(res.hits)} 条：" + "，".join(f"p.{h.locator}" for h in res.hits))
    if res.hits:
        h = res.hits[0]
        lines.append(f"  第一条落在字符 {h.offset}，匹配「{h.match}」")
    else:
        lines.append("  没有命中")
    lines.append("")
lines.append(f"中文查询按两字一组切词：{terms_of('原假设为真的概率')}")

search_lines = lines
lines = []
cases = [
    (248, "p 值不是原假设为真的概率", "引文在声称的那页"),
    (236, "p 值不是原假设为真的概率", "页码记错了，引文其实在 248 页"),
    (248, "p 值告诉我们原假设有多大可能是对的", "模型自己的转述，原文里没有"),
]
for locator, quote, label in cases:
    check = verify_quote(store, "mat_stats", locator, quote)
    record["verify"].append({"label": label, "locator": locator, "quote": quote, "verified": check.verified, "found_locator": check.found_locator})
    result = (
        f"verified=True，found_locator={check.found_locator}" + ("（改跳到这一页）" if check.moved else "")
        if check.verified
        else "verified=False（照样跳到这一页，但不高亮）"
    )
    lines.append(f"{label}：传 p.{locator}「{quote}」")
    lines.append(f"  {result}")

offset = locate_quote(PAGES[236], "它在抽样之前就已给定， 与观察到的这一个样本无关")
record["locate"].append({"page": 236, "offset": offset})
lines += ["", f"locate_quote：从 PDF 里复制出来、断行处变成空格的引文「它在抽样之前就已给定， 与观察到的这一个样本无关」，在 236 页找到，偏移 {offset}"]

out("reading-search", record)
txt("reading-search", "\n".join(search_lines))
txt("reading-verify", "\n".join(lines))
print("\n".join(search_lines))
print("----")
print("\n".join(lines))
