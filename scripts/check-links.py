#!/usr/bin/env python3
"""校验 docs/ 的 AI 链路完整性 —— 每篇文章都必须能被 AI 顺链接从上一级走到。

本 wiki 的核心设计是「AI 顺相对链接一层层读进去」，而 mkdocs.yml 的 nav 只是
给人的策展层、不在 AI 链路上。所以一篇文章漏挂链接 = 对 AI 不存在，nav 里有它
也没用。这个校验就是那道闸门，在 deploy.sh 构建前跑，不过就不许部署。

五项检查：

1. 父级链接 —— 每篇 .md 必须被**某个祖先目录**的索引页用 markdown 链接直接指向。
   索引页指 index.md / MIRROR.md / SKILL.md 三种：后两者是吸收型 skill 里唯一
   自己写的文件和上游主文件，它们照样承担链接责任（活例：xi-wen 的 9 份归档由
   MIRROR.md 挂链，因为 index.md 是上游原文照录、不许改）。
   「祖先」而非「最近父级」是必要的：MIRROR.md 的链接责任归分类索引，隔了一层。

2. 死链 —— 指向不存在 .md 的链接。

3. nav 注册 —— 写作规范要求新增页面必须进 mkdocs.yml 的 nav。

4. 笔记里的未解决课程提问 —— docs/notes/ 下不允许出现 <<<<<<< 冲突标记。
   课程页（docs/courses/）的提问本来就是这个形状，那是题；一旦这形状出现在笔记里，
   说明有题还空着没答就想发出去。归档要走 scripts/course.py add，它会逐题检查。

5. 非 .md 资源死链 —— 图片、iframe 的 demo、`<a href>` 指向的本地文件必须存在。
   检查 1、2 只看 markdown 链接里的 .md，而这个 wiki 的活 demo 全靠 iframe src
   指到 assets/ 下的 .html，配图靠 ![](assets/x.png)：这些挪了或删了，页面照样
   构建通过、线上直接 404。判据是「代码块之外的引用」—— 写作规范和 skill 文档里
   大量在 ``` 块和行内 `code` 里举例写路径（活例：写作规范演示 ![](assets/xxx.png)
   该怎么写），那些是示范不是引用，先剥掉再查，否则全是误报。

豁免：文件顶部（前 5 行内）写 `<!-- link-check-ok: 理由 -->` 可跳过检查 1 和 3。
理由写在文件里而不是脚本白名单里 —— 挪文件不会让豁免失效，读到那个文件的人也
立刻知道为什么。注意：本 wiki 不给旧路径留存根页（要兼容就别挪文件），所以
「已迁移存根」不是正当豁免理由。

assets/ 下的 .md 整体排除：按规范那里只放资产真身（含 clone 进来的外部存档），
不是文章，本来就不进 nav、不上链路。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
MKDOCS = ROOT / "mkdocs.yml"

# markdown 链接 [text](target)，容忍 <> 包裹和 "title" 后缀
LINK = re.compile(r"\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)")
EXEMPT = re.compile(r"<!--\s*link-check-ok:")
# 课程提问块的起始标记（与 scripts/course.py、vendor/conflict-init.js 同规则）
CONFLICT = re.compile(r"^<{7} ", re.M)
# 检查 5 用：围栏代码块（``` 或 ~~~，允许缩进，按开围栏的缩进配对）与行内 code
FENCE = re.compile(r"^(?P<i>\s*)(?P<f>`{3,}|~{3,}).*?^(?P=i)(?P=f)\s*$", re.M | re.S)
INLINE_CODE = re.compile(r"`[^`\n]+`")
# 图片 ![](x)、以及 src=/href= 指到的东西
ASSET_REF = re.compile(r"""!\[[^\]]*\]\(\s*<?([^)\s>]+)|(?:src|href)\s*=\s*["']([^"']+)["']""")
INDEX_NAMES = ("index.md", "MIRROR.md", "SKILL.md")


def rel(p: Path) -> Path:
    """docs/ 下的相对路径。"""
    return p.relative_to(DOCS)


def md_links(md: Path) -> set:
    """该文件指向的、docs 内存在的 .md（相对 docs），顺带返回死链。"""
    text = md.read_text(encoding="utf-8")
    hits, dead = set(), []
    for m in LINK.finditer(text):
        target = m.group(1)
        if target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        target = target.split("#")[0].strip()
        if not target.endswith(".md"):
            continue
        try:
            resolved = (md.parent / target).resolve().relative_to(DOCS.resolve())
        except ValueError:
            continue  # 指到 docs 之外（如项目根的 mkdocs.yml），不算页面链接
        if (DOCS / resolved).exists():
            hits.add(resolved)
        else:
            dead.append(target)
    return hits, dead


def asset_refs(md: Path) -> list:
    """该文件在代码块之外引用、但本地不存在的非 .md 资源。

    只看渲染后真会去请求的东西：![](x)、iframe/img/script 的 src、a 的 href。
    绝对路径按站点根（= docs/）解析，因为 demo 的 iframe 按规范写站点根绝对路径。
    """
    text = md.read_text(encoding="utf-8")
    text = FENCE.sub("", text)
    text = INLINE_CODE.sub("", text)
    missing = []
    for m in ASSET_REF.finditer(text):
        target = (m.group(1) or m.group(2) or "").strip()
        if not target or target.startswith(
            ("http://", "https://", "mailto:", "#", "data:", "{{", "//")
        ):
            continue
        target = target.split("#")[0].split("?")[0]
        if not target or target.endswith(".md"):
            continue  # .md 归检查 2 管
        if target.startswith("/"):
            resolved = DOCS / target.lstrip("/")
        else:
            resolved = (md.parent / target).resolve()
        if not resolved.exists():
            missing.append(target)
    return missing


def is_absorbed(md: Path) -> bool:
    """是否为吸收来的上游原文 —— 同级或祖先目录有 MIRROR.md 即是。

    这类文件一律原文照录、不许改，所以不能往里加豁免注释；而原文里的路径常是
    举例（活例：domain-modeling/CONTEXT-FORMAT.md 举例 `./src/ordering/CONTEXT.md`
    该放哪），本地不可能存在。它们的死链降级为警告，不阻断部署 —— 但仍然打印，
    因为归档真漏了一份依赖也会在这里现形。MIRROR.md 是自己写的，不算原文。
    """
    if md.name == "MIRROR.md":
        return False
    d = md.parent
    while True:
        if (d / "MIRROR.md").exists():
            return True
        if d == DOCS:
            return False
        d = d.parent


def responsible_pages(md: Path) -> list:
    """该文件的责任索引页：自身目录及各级祖先目录下的 index/MIRROR/SKILL。"""
    out, d = [], md.parent
    while True:
        for name in INDEX_NAMES:
            cand = d / name
            if cand.exists() and cand != md:
                out.append(cand)
        if d == DOCS:
            break
        d = d.parent
    return out


def main() -> int:
    all_md = sorted(DOCS.rglob("*.md"))
    nav_text = MKDOCS.read_text(encoding="utf-8")
    root_index = DOCS / "index.md"

    # 预先算好每个文件的出链，供反查
    outgoing, dead_links, dead_warn = {}, {}, {}
    for md in all_md:
        if "assets" in rel(md).parts:
            continue
        hits, dead = md_links(md)
        outgoing[md] = hits
        if dead:
            (dead_warn if is_absorbed(md) else dead_links)[md] = dead

    orphans, unregistered, unresolved, dead_assets = [], [], [], {}
    for md in all_md:
        r = rel(md)
        if "assets" in r.parts:
            continue
        # 5. 非 .md 资源死链（首页也查：它的 iframe/图同样会 404）
        missing = asset_refs(md)
        if missing:
            dead_assets[md] = missing
        if md == root_index:
            continue
        # 4. 笔记里不许有未解决的课程提问
        if r.parts[0] == "notes" and CONFLICT.search(md.read_text(encoding="utf-8")):
            unresolved.append(r)
        head = "".join(md.read_text(encoding="utf-8").splitlines(keepends=True)[:5])
        if EXEMPT.search(head):
            continue
        # 1. 父级链接
        if not any(r in outgoing.get(p, set()) for p in responsible_pages(md)):
            orphans.append(r)
        # 3. nav 注册（MIRROR.md 按规范不进 nav）
        if md.name != "MIRROR.md" and str(r) not in nav_text:
            unregistered.append(r)

    def report(title, items, hint):
        if not items:
            return
        print(f"\n✗ {title}（{len(items)}）", file=sys.stderr)
        for it in items:
            print(f"    {it}", file=sys.stderr)
        print(f"  → {hint}", file=sys.stderr)

    report(
        "没有被任何祖先索引页链到 —— AI 顺链接走不到它",
        orphans,
        "在它所在目录（或上级）的 index.md / MIRROR.md 里加一行链接；"
        "确实不该上链路就在文件顶部写 <!-- link-check-ok: 理由 -->",
    )
    report(
        "未在 mkdocs.yml 的 nav 注册",
        unregistered,
        "补进 nav；reference/ 一层按规范展平到父级",
    )
    report(
        "笔记里还有未解决的课程提问",
        unresolved,
        "把每道题答完，再跑 python3 scripts/course.py add <分类>/<slug> 归档",
    )
    if dead_assets:
        print(f"\n✗ 引用了不存在的本地资源（{len(dead_assets)} 个文件）", file=sys.stderr)
        for md, targets in dead_assets.items():
            print(f"    {rel(md)}  →  {', '.join(targets)}", file=sys.stderr)
        print("  → 图片/demo 的路径写错或文件挪走了；只是举例写法就放进代码块或行内 `code`",
              file=sys.stderr)
    if dead_links:
        print(f"\n✗ 死链，指向不存在的 .md（{len(dead_links)} 个文件）", file=sys.stderr)
        for md, targets in dead_links.items():
            print(f"    {rel(md)}  →  {', '.join(targets)}", file=sys.stderr)
    if dead_warn:
        print(f"\n⚠ 吸收来的上游原文里有指不到本地的 .md 路径（{len(dead_warn)} 个文件，"
              f"不阻断部署；多半是原文举例，若是归档漏了依赖则需补）")
        for md, targets in dead_warn.items():
            print(f"    {rel(md)}  →  {', '.join(targets)}")

    failed = (len(orphans) + len(unregistered) + len(dead_links)
              + len(unresolved) + len(dead_assets))
    checked = sum(1 for m in all_md if "assets" not in rel(m).parts)
    if failed:
        print(f"\n链路校验未通过：{failed} 处问题（检查了 {checked} 篇）", file=sys.stderr)
        return 1
    print(f"✅ 链路校验通过 —— {checked} 篇文章都能从上一级索引走到")
    return 0


if __name__ == "__main__":
    sys.exit(main())
