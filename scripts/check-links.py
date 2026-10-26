#!/usr/bin/env python3
"""校验 docs/ 的 AI 链路完整性 —— 每篇文章都必须能被 AI 顺链接从上一级走到。

本 wiki 的核心设计是「AI 顺相对链接一层层读进去」，而 mkdocs.yml 的 nav 只是
给人的策展层、不在 AI 链路上。所以一篇文章漏挂链接 = 对 AI 不存在，nav 里有它
也没用。这个校验就是那道闸门，在 deploy.sh 构建前跑，不过就不许部署。

七项检查：

1. 父级链接 —— 每篇 .md 必须被**某个祖先目录**的索引页用 markdown 链接直接指向。
   索引页指 index.md / SKILL.md 两种：SKILL.md 是上游主文件，照样承担链接责任。
   「祖先」而非「最近父级」是必要的：深层文件常由上面几层的入口统一挂链（活例：
   HyperFrames 各子 skill 入口末尾的文件清单挂住 rules/、transitions/ 下的上百篇）。

2. 死链 —— 指向不存在 .md 的链接。代码块和行内 code 里的不算，理由同检查 5：
   那是示范不是引用（活例：领域建模的 GLOSSARY.md 格式模板举例
   `[Ordering](./src/ordering/GLOSSARY.md)`，是写进别人项目的路径）。

3. nav 注册 —— 写作规范要求新增页面必须进 mkdocs.yml 的 nav。只认 nav 段里的条目，
   redirects 和注释里出现同一路径不算注册 —— 挪文件写了 redirect、忘了改 nav，正是要拦的情形。

4. 笔记里的未解决课程提问 —— docs/notes/ 下代码块之外不允许出现 <<<<<<< 冲突标记。
   课程页（docs/courses/）的提问本来就是这个形状，那是题；一旦这形状出现在笔记里，
   说明有题还空着没答就想发出去。归档要走 scripts/course.py add，它会逐题检查。
   代码块里的不算：git 笔记讲冲突时会原样贴冲突示例。

5. 非 .md 资源死链 —— 图片、iframe 的 demo、`<a href>`、markdown 链接指向的本地文件必须存在。
   检查 1、2 只看 markdown 链接里的 .md，而这个 wiki 的活 demo 全靠 iframe src
   指到 assets/ 下的 .html，配图靠 ![](assets/x.png)：这些挪了或删了，页面照样
   构建通过、线上直接 404。判据是「代码块之外的引用」—— 写作规范和 skill 文档里
   大量在 ``` 块和行内 `code` 里举例写路径（活例：写作规范演示 ![](assets/xxx.png)
   该怎么写），那些是示范不是引用，先剥掉再查，否则全是误报。
   skill 整包（<目录>/<目录名>.tar.gz）部署时才生成，目录在就算存在；有没有用标准那一行
   声明，归 build-skill-bundles.py 在部署时拦。

6. 复制带源地址 —— 目录下有页面在代码块之外链回本目录的 index.md / SKILL.md，这个入口的
   frontmatter 就要写 `copy_source: true`；没人链回却写了也报。复制按钮（vendor/md-copy.js）
   见到它，在复制出的正文末尾加一行本页的源地址：读者把入口贴给 AI，AI 顺链接读到子页，
   子页写着「见[入口 · 用法](../index.md#usage)」，有了源地址 AI 认得出那就是开头贴进来的
   那篇，不用再抓一遍。没有回链的页面不加 —— 只想复制一段文字贴给不联网的 AI 时，这行是噪音。
   只管向下：子页链上级是去读共守的规矩，上级链回它只是菜单里的一行。判据由这里算、结果
   写在源文件里，复制时不用去抓子页（一个入口最多链了上百篇），本地预览和线上一样。
   首页没有复制按钮，不查。

7. 源码存档只存被引的 —— 项目拆解的 projects/<项目>/assets/<名>-src/ 是从上游仓库逐字拷来的
   原件，只给页面的 `--8<--` 当真身。每个文件都要有页面用 `--8<--` 或链接引到：没人引的文件
   AI 顺链接走不到，其中的 .md 还会被 zensical 建成孤儿页、进站内搜索，原文里指向没拷的
   文件的相对链接全成了构建警告。正文里写一句路径不算引用 —— 那指的是原仓库同版本，
   读的哪个 commit 写在维护记录里。

豁免：文件顶部（前 5 行内）写 `<!-- link-check-ok: 理由 -->` 可跳过检查 1 和 3。
理由写在文件里而不是脚本白名单里 —— 挪文件不会让豁免失效，读到那个文件的人也
立刻知道为什么。注意：本 wiki 不给旧路径留存根页，旧网址靠 mkdocs.yml 的 redirects 兜，
所以「已迁移存根」不是正当豁免理由。

assets/ 下的 .md 不当文章查：那里只放被页面引用的原件（`--8<--` 引的源码、iframe 的 demo），
AI 从引用它的那一页走过去，不靠索引页挂链、不进 nav。源码存档有没有人引，归检查 7。
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
# 检查 2、4、5 用：围栏代码块的开围栏（``` 或 ~~~，允许缩进）与行内 code
FENCE = re.compile(r"^[ \t]*(`{3,}|~{3,})")
INLINE_CODE = re.compile(r"`[^`\n]+`")
# 图片 ![](x)、普通链接 [](x)、以及 src=/href= 指到的东西
ASSET_REF = re.compile(r"""!?\[[^\]]*\]\(\s*<?([^)\s>]+)|(?:src|href)\s*=\s*["']([^"']+)["']""")
# nav 段里一条页面条目：`- 标题: 路径.md` 或 `- 路径.md`
NAV_ENTRY = re.compile(r"^\s*-\s+(?:[^:\n]*:\s+)?([^\s\"']+\.md)\s*$", re.M)
INDEX_NAMES = ("index.md", "SKILL.md")
# 检查 6 用：frontmatter 里的复制带源地址标记
COPY_SOURCE = re.compile(r"^copy_source:\s*true\s*$", re.M)
# 检查 7 用：--8<-- 引用行（代码块里也算，snippet 在代码块里照样展开）与源码存档的位置
SNIPPET = re.compile(r"""^[ \t]*--8<--\s+(["'])(.+?)\1\s*$""", re.M)
ARCHIVES = "projects/*/assets/*-src"


def rel(p: Path) -> Path:
    """docs/ 下的相对路径。"""
    return p.relative_to(DOCS)


def prose(text: str) -> str:
    """去掉围栏代码块和行内 code，行数不变。

    按 CommonMark 配对：闭围栏与开围栏同字符、不短于它、后面不带 info string ——
    所以 ```text 不会把上一个 ```text 关掉。没闭合的代码块吞到文件尾，和渲染一致。
    """
    out, fence = [], None
    for line in text.split("\n"):
        mark = FENCE.match(line)
        if fence is None:
            if mark:
                fence = mark.group(1)
                out.append("")
            else:
                out.append(INLINE_CODE.sub("", line))
            continue
        if mark and line.strip() == mark.group(1) and mark.group(1)[0] == fence[0] \
                and len(mark.group(1)) >= len(fence):
            fence = None
        out.append("")
    return "\n".join(out)


def nav_pages() -> set:
    """mkdocs.yml 的 nav 段里注册过的页面路径。nav 是文件最后一段。"""
    text = MKDOCS.read_text(encoding="utf-8")
    nav = text[text.index("\nnav:") :]
    return set(NAV_ENTRY.findall(nav))


def is_bundle(target: Path) -> bool:
    """<目录>/<目录名>.tar.gz：部署时才由 build-skill-bundles.py 生成，目录在就算存在。"""
    return target.name == f"{target.parent.name}.tar.gz" and target.parent.is_dir()


def frontmatter(text: str) -> str:
    """开头 --- 之间的那段，没有就是空串。"""
    if not text.startswith("---\n"):
        return ""
    end = text.find("\n---", 3)
    return text[4:end] if end > 0 else ""


def md_links(md: Path) -> tuple:
    """该文件指向的、docs 内存在的 .md（相对 docs），其中代码块之外的那些，以及代码块之外的死链。"""
    text = md.read_text(encoding="utf-8")
    in_prose = {m.group(1) for m in LINK.finditer(prose(text))}
    hits, visible_hits, dead = set(), set(), []
    for m in LINK.finditer(text):
        target = m.group(1)
        if target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        visible = target in in_prose
        target = target.split("#")[0].strip()
        if not target.endswith(".md"):
            continue
        try:
            resolved = (md.parent / target).resolve().relative_to(DOCS.resolve())
        except ValueError:
            continue  # 指到 docs 之外（如项目根的 mkdocs.yml），不算页面链接
        if (DOCS / resolved).exists():
            hits.add(resolved)
            if visible:
                visible_hits.add(resolved)
        elif visible:
            dead.append(target)
    return hits, visible_hits, dead


def asset_refs(md: Path) -> list:
    """该文件在代码块之外引用、但本地不存在的非 .md 资源。

    只看渲染后真会去请求的东西：![](x)、[](x)、iframe/img/script 的 src、a 的 href。
    绝对路径按站点根（= docs/）解析，因为 demo 的 iframe 按规范写站点根绝对路径。
    """
    text = prose(md.read_text(encoding="utf-8"))
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
        if not resolved.exists() and not is_bundle(resolved):
            missing.append(target)
    return missing


def snippet_target(spec: str):
    """--8<-- 引号里的路径 → 真实文件。先去掉 :起:止 / :段名，按 docs/、仓库根的顺序找。"""
    for cand in (spec, re.sub(r"(:[^/:]*){1,2}$", "", spec)):
        for base in (DOCS, ROOT):
            if (base / cand).is_file():
                return (base / cand).resolve()
    return None


def cited_files(md: Path) -> set:
    """该文件用 --8<-- 或代码块之外的链接、src、href 引到的本地文件。"""
    text = md.read_text(encoding="utf-8")
    out = {snippet_target(m.group(2)) for m in SNIPPET.finditer(text)} - {None}
    for m in ASSET_REF.finditer(prose(text)):
        target = (m.group(1) or m.group(2) or "").split("#")[0].split("?")[0].strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "data:", "{{", "//")):
            continue
        out.add((DOCS / target.lstrip("/") if target.startswith("/") else md.parent / target).resolve())
    return out


def responsible_pages(md: Path) -> list:
    """该文件的责任索引页：自身目录及各级祖先目录下的 index/SKILL。"""
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
    registered = nav_pages()
    root_index = DOCS / "index.md"

    # 预先算好每个文件的出链，供反查
    outgoing, visible_out, dead_links = {}, {}, {}
    for md in all_md:
        if "assets" in rel(md).parts:
            continue
        hits, visible_hits, dead = md_links(md)
        outgoing[md] = hits
        visible_out[md] = visible_hits
        if dead:
            dead_links[md] = dead

    # 6. 目录下有页面链回的入口要写 copy_source，没人链回的不许写
    linked_back = {
        r for md, hits in visible_out.items() for r in hits
        if r.name in INDEX_NAMES and r != rel(md) and DOCS / r != root_index
        and rel(md).is_relative_to(r.parent)
    }
    marked = {
        rel(md) for md in outgoing
        if COPY_SOURCE.search(frontmatter(md.read_text(encoding="utf-8")))
    }
    missing_source = sorted(linked_back - marked)
    extra_source = sorted(marked - linked_back)

    # 7. 源码存档里每个文件都要有页面引到
    cited = set().union(*(cited_files(md) for md in outgoing))
    uncited = sorted(
        rel(f) for f in DOCS.glob(f"{ARCHIVES}/**/*")
        if f.is_file() and f.resolve() not in cited
    )

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
        if r.parts[0] == "notes" and CONFLICT.search(prose(md.read_text(encoding="utf-8"))):
            unresolved.append(r)
        head = "".join(md.read_text(encoding="utf-8").splitlines(keepends=True)[:5])
        if EXEMPT.search(head):
            continue
        # 1. 父级链接
        if not any(r in outgoing.get(p, set()) for p in responsible_pages(md)):
            orphans.append(r)
        # 3. nav 注册
        if str(r) not in registered:
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
        "在它所在目录（或上级）的 index.md 里加一行链接；"
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
    report(
        "目录下有页面链回这个入口 —— 复制入口贴给 AI，AI 读到子页可能再抓一遍入口",
        missing_source,
        "在它的 frontmatter 加一行 copy_source: true，复制时末尾会带上本页源地址",
    )
    report(
        "写了 copy_source，但目录下没有页面链回它",
        extra_source,
        "删掉 frontmatter 里的 copy_source: true",
    )
    report(
        "源码存档里有没被引用的文件 —— 没有页面 --8<-- 或链接指向它，AI 顺链接走不到",
        uncited,
        "正文要用就 --8<-- 按行引；用不到就删，要引原文就摘句，钉 commit 的永链写进脚注",
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

    failed = (len(orphans) + len(unregistered) + len(dead_links)
              + len(unresolved) + len(dead_assets)
              + len(missing_source) + len(extra_source) + len(uncited))
    checked = sum(1 for m in all_md if "assets" not in rel(m).parts)
    if failed:
        print(f"\n链路校验未通过：{failed} 处问题（检查了 {checked} 篇）", file=sys.stderr)
        return 1
    print(f"✅ 链路校验通过 —— {checked} 篇文章都能从上一级索引走到")
    return 0


if __name__ == "__main__":
    sys.exit(main())
