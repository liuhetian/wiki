#!/usr/bin/env python3
"""从 gallery/images/handdraw-style/assets/（上游 yang0/handraw-style 的数据和样图）生成图库页面。

画风页写进 gallery/images/handdraw-style/，版式页写进 gallery/layouts/，色卡页写成
gallery/colors/classic.md；后两者的图片仍指回 images/handdraw-style/assets/。两区的 index.md 手写，不归本脚本。

assets/references/ 下的 JSON 和版式 md 是上游 skill 的数据真身，这里把它们排成本站图库的
「一张图 + 一段 prompt」形态；条目标题带编号，skills/handdraw/ 按编号查的就是这些页面。
页面是生成物，别手改。上游更新时带上 clone 的路径跑一次，先清空 assets/、只拷进页面用得到的
数据和图片，再生成页面；平时改了生成规则，不带参数重跑：

    python3 scripts/build-handdraw-gallery.py --sync /path/to/handraw-style
    python3 scripts/build-handdraw-gallery.py
"""
import argparse
import json
import os
import re
import shutil
from pathlib import Path

GALLERY = Path(__file__).resolve().parent.parent / "docs/gallery"
ROOT = GALLERY / "images/handdraw-style"
LAYOUT_DIR = GALLERY / "layouts"
COLOR_DIR = GALLERY / "colors"
FROM_SIBLING = "../images/handdraw-style/"  # 从 gallery/layouts/、gallery/colors/ 指回本目录
UP = ROOT / "assets"
REF = UP / "references"
UP_REF = "skills/handdraw-style-prompter/references"  # 上游仓库里数据所在的目录
DATA = ["styles.json", "layouts.json", "colors.json", "model_capabilities.json", "style_alias_map.json"]

# 键是上游编号的分组前缀（FA-001 的 FA），页面 slug 取第二个字母
STYLE_GROUPS = {
    "FA": ("styles-a", "国际社论幽默"),
    "FB": ("styles-b", "经典绘本叙事"),
    "FC": ("styles-c", "现代平面艺术"),
    "FD": ("styles-d", "日本当代插画"),
    "FE": ("styles-e", "新国风与传统工艺"),
    "FF": ("styles-f", "3D 黏土、毛毡与纸雕"),
    "FG": ("styles-g", "动漫和赛璐璐"),
    "FH": ("styles-h", "先锋实验与综合媒介"),
    "FI": ("styles-i", "写实摄影与视觉大片"),
}
LAYOUT_GROUPS = {
    "social-card": ("social-cards", "社媒卡"),
    "infographic": ("infographics", "信息图"),
    "comic-storyboard": ("comic-storyboards", "漫画分镜"),
    "ip-character": ("ip-characters", "IP 设计"),
    "ecommerce": ("ecommerce", "电商"),
}
# 上游没写画法特征的条目都标了「名字激活强」：只写风格名和参考作者，照上游的写法
NO_TRAITS = "上游没给这一条写画法特征，靠名字激活，下面这句就是画风片段；模型认不出时再垫样片，加上[隔离声明](index.md#splice)。\n"
BACK = "拼接方法见[手绘风格库]({}index.md)：画风片段 + 排版 + 色彩 + 你的主题。"
# gpt-image-2 怎么激活这条画风：判定照上游 resolve_reference.py ——
# 名字激活强只写名字；否则特征激活强且有特征就写特征；其余要垫样片
ACTIVATION = {
    "name": "认得名字，只写风格名和参考作者",
    "traits": "靠画法特征",
    "image": "要垫样片",
}


def asset(rel_from_gallery_html: str, prefix: str = "") -> str:
    """上游 JSON 里的图片路径相对它原来的 skills/handdraw-style-prompter/gallery/，换算成相对本目录。"""
    p = os.path.normpath(os.path.join("skills/handdraw-style-prompter/gallery", rel_from_gallery_html))
    assert (UP / p).exists(), p
    return f"{prefix}assets/{p}"


def style_image(num: str, root: Path = UP) -> str:
    for name in (f"{num}_grid.webp", f"{num}.webp"):
        p = f"images/individual/{num.split('-')[0]}/{name}"
        if (root / p).exists():
            return f"assets/{p}"
    raise FileNotFoundError(num)


def sync(src: Path):
    """从上游 clone 重建 assets/：LICENSE、references/ 下的数据和版式 md、页面引用到的图片。"""
    ref = src / UP_REF
    keep = {"LICENSE": src / "LICENSE"}
    for f in DATA:
        keep[f"references/{f}"] = ref / f
    for f in (ref / "layouts").iterdir():
        keep[f"references/layouts/{f.name}"] = f
    for s in json.loads((ref / "styles.json").read_text(encoding="utf-8")):
        p = style_image(s["number"], src).removeprefix("assets/")
        keep[p] = src / p
    for name in ("layouts.json", "colors.json"):
        for x in json.loads((ref / name).read_text(encoding="utf-8")):
            p = os.path.normpath(os.path.join("skills/handdraw-style-prompter/gallery", x["image"]))
            keep[p] = src / p
    if UP.exists():
        shutil.rmtree(UP)
    for dst, s in keep.items():
        (UP / dst).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(s, UP / dst)
    print(f"assets/ 重建：{len(keep)} 个文件")


def activation(num: str, traits: str, caps: dict) -> str:
    profile = caps["models"]["gpt-image-2"]
    entry = {**caps["default"], **{k: v for k, v in profile.items() if k != "styles"},
             **profile["styles"].get(num, {})}
    if entry.get("name_activation") == "strong":
        return ACTIVATION["name"]
    if entry.get("traits_activation") == "strong" and traits:
        return ACTIVATION["traits"]
    return ACTIVATION["image"]


def page(path: Path, desc: str, title: str, body: list, prefix: str = ""):
    text = f'---\ndescription: "{desc}"\n---\n\n# {title}\n\n{BACK.format(prefix)}\n\n' + "\n".join(body).rstrip() + "\n"
    path.write_text(text, encoding="utf-8")


def fence(text: str) -> str:
    return f"````text\n{text.strip()}\n````\n"


def build_styles():
    styles = json.loads((REF / "styles.json").read_text(encoding="utf-8"))
    caps = json.loads((REF / "model_capabilities.json").read_text(encoding="utf-8"))
    out = {}
    for s in styles:
        out.setdefault(s["number"].split("-")[0], []).append(s)
    for code, items in out.items():
        slug, name = STYLE_GROUPS[code]
        body = []
        for s in items:
            head = s["generation_name"]
            body += [f"### {s['number']} · {head}", "",
                     f'<img src="{style_image(s["number"])}" alt="{head}" width="320" loading="lazy" decoding="async"/>', "",
                     f"参考：{s['reference']} ｜ gpt-image-2：{activation(s['number'], s['traits'], caps)}", ""]
            # 编号和参考作者只在标题和说明行里，不进 prompt 片段
            if s["traits"]:
                body.append(fence(s["traits"]))
            else:
                body += [NO_TRAITS, fence(f"风格名称：{head}。参考作者/风格名称：{s['reference']}。")]
        page(ROOT / f"{slug}.md",
             f"手绘风格库·{name}，{len(items)} 种，每条一张样片加一段画法特征 prompt，标题带编号",
             name, body)


def build_layouts():
    layouts = json.loads((REF / "layouts.json").read_text(encoding="utf-8"))
    unknown = {x["category"] for x in layouts} - LAYOUT_GROUPS.keys()
    assert not unknown, f"上游新增了版式类别，先登记进 LAYOUT_GROUPS：{unknown}"
    for cat, (slug, name) in LAYOUT_GROUPS.items():
        items = [x for x in layouts if x["category"] == cat]
        body = []
        for x in items:
            src = (REF / x["prompt_file"]).read_text(encoding="utf-8")
            m = re.search(r"<!-- zh -->(.*?)(?:<!-- en -->|\Z)", src, re.S)
            head = x["name"]
            body += [f"### {x['id']} · {head}", "",
                     f'<img src="{asset(x["image"], FROM_SIBLING)}" alt="{head}" width="320" loading="lazy" decoding="async"/>', "",
                     fence(m.group(1))]
        page(LAYOUT_DIR / f"{slug}.md",
             f"{name}排版，{len(items)} 种，每条一张版式示意图加一段中文排版 prompt，标题带编号",
             f"{name}（{len(items)} 种）", body, FROM_SIBLING)


def build_colors():
    colors = json.loads((REF / "colors.json").read_text(encoding="utf-8"))
    body, cur = [], None
    for c in colors:
        if c["category_zh"] != cur:
            cur = c["category_zh"]
            body += [f"## {cur}", ""]
        head = f"{c['name_zh']} {c['name_en']}"
        body += [f"### {c['id']} · {head}", "",
                 f'<img src="{asset(c["image"], FROM_SIBLING)}" alt="{head}" width="320" loading="lazy" decoding="async"/>', "",
                 fence(c["prompt_zh"])]
    page(COLOR_DIR / "classic.md",
         f"色彩参考：{len(colors)} 种经典单色主题色，蓝、绿、红绿、粉紫、大地、中性六个色系，每条一张色卡加一句主题色 prompt，标题带编号",
         "经典主题色", body, FROM_SIBLING)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sync", type=Path, help="上游 yang0/handraw-style 的 clone 路径")
    args = ap.parse_args()
    if args.sync:
        sync(args.sync)
    LAYOUT_DIR.mkdir(exist_ok=True)
    COLOR_DIR.mkdir(exist_ok=True)
    build_styles()
    build_layouts()
    build_colors()
