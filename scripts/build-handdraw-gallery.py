#!/usr/bin/env python3
"""从 gallery/images/handdraw-style/assets/（上游 yang0/handraw-style 原样镜像）生成图库页面。

上游是一个 skill：风格、版式、色卡的真身是 references/ 下的 JSON 和版式 md，
这里把它们排成本站图库的「一张图 + 一段 prompt」形态。页面是生成物，别手改；
上游更新时先覆盖 assets/，再跑本脚本：

    python3 scripts/build-handdraw-gallery.py
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "docs/gallery/images/handdraw-style"
UP = ROOT / "assets"
REF = UP / "skills/handdraw-style-prompter/references"

STYLE_GROUPS = {
    "A": ("styles-a", "国际社论漫画与幽默手绘"),
    "B": ("styles-b", "国际绘本与叙事型手绘"),
    "C": ("styles-c", "现代平面与艺术化人物体系"),
    "D": ("styles-d", "日本作者与当代插画体系"),
    "E": ("styles-e", "中国作者与当代插画体系"),
    "F": ("styles-f", "通用网感、媒介与地域手绘"),
    "G": ("styles-g", "中国当代插画补充"),
    "H": ("styles-h", "其他精选风格"),
}
LAYOUT_GROUPS = {
    "social-card": ("layouts-social-cards", "社媒卡"),
    "infographic": ("layouts-infographics", "信息图"),
    "comic-storyboard": ("layouts-comic-storyboards", "漫画分镜"),
}
NO_TRAITS = "上游没有给这一条写文字特征：出图时把样片当参考图垫进去，再加上[隔离声明](index.md#splice)。\n"
BACK = "拼接方法见[手绘风格库](index.md)：风格片段 + 版式 + 主题色 + 你的主题。"


def asset(rel_from_gallery_html: str) -> str:
    """上游 JSON 里的图片路径相对 skills/handdraw-style-prompter/gallery/，换算成相对本目录。"""
    p = os.path.normpath(os.path.join("skills/handdraw-style-prompter/gallery", rel_from_gallery_html))
    assert (UP / p).exists(), p
    return f"assets/{p}"


def style_image(num: str) -> str:
    bucket = "001-200" if int(num) <= 200 else "201-400"
    for name in (f"{num}_grid.webp", f"{num}.webp"):
        p = f"images/individual/{bucket}/{name}"
        if (UP / p).exists():
            return f"assets/{p}"
    raise FileNotFoundError(num)


def page(path: Path, desc: str, title: str, body: list):
    text = f'---\ndescription: "{desc}"\n---\n\n# {title}\n\n{BACK}\n\n' + "\n".join(body).rstrip() + "\n"
    path.write_text(text, encoding="utf-8")


def fence(text: str) -> str:
    return f"````text\n{text.strip()}\n````\n"


def build_styles():
    styles = json.loads((REF / "styles.json").read_text(encoding="utf-8"))
    out = {}
    for s in styles:
        out.setdefault(s["group"][0], []).append(s)
    for letter, items in out.items():
        slug, name = STYLE_GROUPS[letter]
        body = []
        for s in items:
            head = f"#{s['number']} · {s['generation_name']}"
            body += [f"### {head}", "",
                     f'<img src="{style_image(s["number"])}" alt="{head}" width="320"/>', ""]
            # 只留画法特征；编号、风格名、参考作者对出图没用，不进 prompt
            body.append(fence(s["traits"]) if s["traits"] else NO_TRAITS)
        page(ROOT / f"{slug}.md",
             f"手绘风格 {letter} 组：{name}，{len(items)} 种，每条一张样片加一段画法特征 prompt",
             f"{letter} · {name}", body)


def build_layouts():
    layouts = json.loads((REF / "layouts.json").read_text(encoding="utf-8"))
    for cat, (slug, name) in LAYOUT_GROUPS.items():
        items = [x for x in layouts if x["category"] == cat]
        body = []
        for x in items:
            src = (REF / x["prompt_file"]).read_text(encoding="utf-8")
            m = re.search(r"<!-- zh -->(.*?)(?:<!-- en -->|\Z)", src, re.S)
            head = f"{x['id']} · {x['name']}"
            body += [f"### {head}", "",
                     f'<img src="{asset(x["image"])}" alt="{head}" width="320"/>', "",
                     fence(m.group(1))]
        page(ROOT / f"{slug}.md",
             f"手绘风格库的{name}版式，{len(items)} 种，每条一张版式示意图加一段中文版式 prompt",
             f"版式 · {name}（{len(items)} 种）", body)


def build_colors():
    colors = json.loads((REF / "colors.json").read_text(encoding="utf-8"))
    body, cur = [], None
    for c in colors:
        if c["category_zh"] != cur:
            cur = c["category_zh"]
            body += [f"## {cur}", ""]
        head = f"{c['id']} · {c['name_zh']} {c['name_en']}"
        body += [f"### {head}", "",
                 f'<img src="{asset(c["image"])}" alt="{head}" width="320"/>', "",
                 fence(c["prompt_zh"])]
    page(ROOT / "colors.md",
         f"手绘风格库的 {len(colors)} 种经典单色主题色，每条一张色卡加一句主题色 prompt",
         f"主题色（{len(colors)} 种）", body)


if __name__ == "__main__":
    build_styles()
    build_layouts()
    build_colors()
