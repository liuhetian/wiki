#!/usr/bin/env python3
"""课程 → 笔记的搬运闸门：答完每一道题，才允许归档成笔记。

docs/courses/ 下的课程页把提问写成 git 冲突标记的形状（```conflict 块），
答案区留空。checkout 把这些题复制成 docs/notes/ 下的同名文件，答案填在
======= 与 >>>>>>> 之间；add 检查有没有空着的题，全答完才改写成笔记排版。

这道闸门是机器把的，不是自觉：任何一题空着 add 就退出 1，而 check-links.py
会拦住带残留标记的笔记进入部署（deploy.sh 在构建之前就跑它）。

用法：
    python3 scripts/course.py checkout git/<slug>   # 领题
    python3 scripts/course.py status [git/<slug>]   # 看还有哪些题空着
    python3 scripts/course.py add git/<slug>        # 归档（全答完才通过）
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSES = ROOT / "docs/courses"
NOTES = ROOT / "docs/notes"
ARCHIVE = ROOT / "courses-src"

FENCE_OPEN = re.compile(r"^```conflict\s*$")
FENCE_CLOSE = re.compile(r"^```\s*$")
OPEN = re.compile(r"^<{7} (\S+)\s*$")
SEP = re.compile(r"^={7}\s*$")
CLOSE = re.compile(r"^>{7} \S+\s*$")

# 末尾这三道题的短标题是约定：答完之后它们成为笔记的三个小节，
# 其余题归入「操作」。改这里就等于改 courses/index.md 里承诺的骨架。
SECTIONS = ("一句话", "心智模型", "坑")


class Block:
    def __init__(self, label, title, question, answer, dialogue):
        self.label = label          # <<<<<<< 后面那个 courses/git/<slug>
        self.title = title          # 首行短标题，如 "Q3 两边各加了什么"
        self.question = question    # 题干
        self.answer = answer        # 我的答案（不含对话摘录）
        self.dialogue = dialogue    # 以 "> " 开头的对话摘录

    @property
    def resolved(self):
        return bool(self.answer or self.dialogue)


def parse_blocks(text):
    """按 ```conflict 围栏 + 三行标记切块。三种标记各占一整行，与 conflict-init.js 同规则。"""
    blocks, lines, i = [], text.splitlines(), 0
    while i < len(lines):
        if not FENCE_OPEN.match(lines[i]):
            i += 1
            continue
        j = i + 1
        body = []
        while j < len(lines) and not FENCE_CLOSE.match(lines[j]):
            body.append(lines[j])
            j += 1
        i = j + 1
        if not body or not OPEN.match(body[0]):
            continue
        label = OPEN.match(body[0]).group(1)
        sep = next((k for k, x in enumerate(body) if SEP.match(x)), None)
        end = next((k for k, x in enumerate(body) if CLOSE.match(x)), None)
        if sep is None or end is None:
            continue
        head = [x for x in body[1:sep]]
        title = head[0].strip() if head else ""
        question = "\n".join(head[1:]).strip()
        answered = [x for x in body[sep + 1:end]]
        dialogue = "\n".join(x for x in answered if x.startswith(">")).strip()
        answer = "\n".join(x for x in answered if not x.startswith(">")).strip()
        blocks.append(Block(label, title, question, answer, dialogue))
    return blocks


def report(title, items, hint):
    print("\n✗ %s（%d）" % (title, len(items)), file=sys.stderr)
    for it in items:
        print("    %s" % it, file=sys.stderr)
    print("  → %s" % hint, file=sys.stderr)


def split_ref(ref):
    """git/<slug> → (课程页, 笔记页, slug)"""
    if "/" not in ref:
        print("✗ 课程编号要写成 <分类>/<slug>，例如 git/conflict-order-matters", file=sys.stderr)
        return None
    cat, slug = ref.split("/", 1)
    return COURSES / cat / (slug + ".md"), NOTES / cat / (slug + ".md"), slug


def heading(text):
    m = re.search(r"^# (.+)$", text, re.M)
    return m.group(1).strip() if m else ""


def section(text, name):
    m = re.search(r"^## %s\s*\n(.*?)(?=^## |\Z)" % re.escape(name), text, re.M | re.S)
    return m.group(1).strip() if m else ""


def cmd_checkout(ref):
    paths = split_ref(ref)
    if not paths:
        return 1
    course, note, slug = paths
    if not course.exists():
        print("✗ 没有这一课：%s" % course.relative_to(ROOT), file=sys.stderr)
        return 1
    if note.exists():
        print("✗ %s 已经存在，不覆盖" % note.relative_to(ROOT), file=sys.stderr)
        print("  → 想重来就先删掉它；想接着答就直接编辑，"
              "或 python3 scripts/course.py status %s" % ref, file=sys.stderr)
        return 1

    text = course.read_text(encoding="utf-8")
    body = ["# %s\n" % heading(text),
            "> 这篇是[课程 %s](../../courses/%s.md)的答卷。答案填在每块的 `=======` 与 "
            "`>>>>>>>` 之间；以 `> ` 开头的行会被当成对话摘录。全部答完后跑 "
            "`python3 scripts/course.py add %s` 归档。\n" % (slug, ref, ref),
            "## 场景\n\n%s\n" % section(text, "场景"),
            "## 提问\n"]
    blocks = re.findall(r"^```conflict\n.*?^```$", text, re.M | re.S)
    body.append("\n\n".join(blocks) + "\n")
    note.parent.mkdir(parents=True, exist_ok=True)
    note.write_text("\n".join(body), encoding="utf-8")
    print("✅ 已领题 → %s（%d 道）" % (note.relative_to(ROOT), len(blocks)))
    print("   环境：bash docs/courses/%s/assets/%s/init.sh"
          % (ref.split("/")[0], slug))
    return 0


def cmd_status(ref=None):
    targets = []
    if ref:
        paths = split_ref(ref)
        if not paths:
            return 1
        targets = [paths[1]]
    else:
        targets = sorted(NOTES.rglob("*.md"))

    dirty = 0
    for note in targets:
        if not note.exists():
            print("✗ 还没领题：%s" % note.relative_to(ROOT), file=sys.stderr)
            return 1
        blocks = parse_blocks(note.read_text(encoding="utf-8"))
        if not blocks:
            continue
        open_ones = [b.title for b in blocks if not b.resolved]
        if open_ones:
            dirty += 1
            print("\n%s —— %d/%d 已答" % (note.relative_to(ROOT),
                                          len(blocks) - len(open_ones), len(blocks)))
            for t in open_ones:
                print("    未作答：   %s" % t)
        else:
            print("\n%s —— %d 道全部答完，可以 add" % (note.relative_to(ROOT), len(blocks)))
    if not dirty and not any(parse_blocks(t.read_text(encoding="utf-8"))
                             for t in targets if t.exists()):
        print("没有正在答的课程。")
    return 0


def render_note(course_text, note_text, blocks, ref, slug, solution):
    by_title = {b.title: b for b in blocks}
    out = ["# %s\n" % heading(note_text or course_text)]
    out.append("## 场景\n\n%s\n" % section(note_text, "场景"))

    def answer_of(name):
        b = by_title.get(name)
        return b.answer if b else ""

    out.append("## 一句话\n\n%s\n" % answer_of("一句话"))
    out.append("## 心智模型\n\n%s\n" % answer_of("心智模型"))

    out.append("## 操作\n")
    for b in blocks:
        if b.title in SECTIONS:
            continue
        out.append('!!! question "%s"\n\n%s\n'
                   % (b.title, "\n".join("    " + x for x in b.question.splitlines())))
        if b.answer:
            out.append(b.answer + "\n")
        if b.dialogue:
            out.append('??? quote "对话摘录"\n\n%s\n'
                       % "\n".join("    " + x for x in b.dialogue.splitlines()))

    out.append("## 坑\n\n%s\n" % answer_of("坑"))

    if solution:
        out.append('??? note "参考解法（原关卡设计稿）"\n\n%s\n'
                   % "\n".join("    " + x for x in solution.splitlines()))
    out.append("—— 课程原题：[%s](../../courses/%s.md)\n" % (heading(course_text), ref))
    return "\n".join(out)


def cmd_add(ref):
    paths = split_ref(ref)
    if not paths:
        return 1
    course, note, slug = paths
    if not note.exists():
        print("✗ 还没领题：%s" % note.relative_to(ROOT), file=sys.stderr)
        print("  → python3 scripts/course.py checkout %s" % ref, file=sys.stderr)
        return 1

    note_text = note.read_text(encoding="utf-8")
    blocks = parse_blocks(note_text)
    if not blocks:
        print("✗ %s 里没有课程提问块，可能已经归档过了" % note.relative_to(ROOT), file=sys.stderr)
        return 1

    open_ones = [b.title for b in blocks if not b.resolved]
    if open_ones:
        report("未作答的问题", open_ones,
               "答案填在 ======= 与 >>>>>>> 之间；全部答完再跑 course.py add")
        print("\n课程未通过：%d / %d 道还空着" % (len(open_ones), len(blocks)), file=sys.stderr)
        return 1

    missing = [s for s in SECTIONS if s not in {b.title for b in blocks}]
    if missing:
        report("缺少固定小节", missing, "课程页末尾三题的短标题必须是 一句话 / 心智模型 / 坑")
        return 1

    sol = ARCHIVE / ref.split("/")[0] / slug / "solution.md"
    solution = ""
    if sol.exists():
        solution = re.sub(r"^#[^\n]*\n+", "", sol.read_text(encoding="utf-8"), count=1).strip()

    note.write_text(
        render_note(course.read_text(encoding="utf-8"), note_text, blocks, ref, slug, solution),
        encoding="utf-8")
    print("✅ 已归档 —— %s（%d 道全部答完）" % (note.relative_to(ROOT), len(blocks)))
    print("  → 还差两步：在 docs/notes/%s/index.md 加一行钩子，"
          "并在 mkdocs.yml 的 nav 里注册 notes/%s.md" % (ref.split("/")[0], ref))
    print("  → 然后 python3 scripts/check-links.py")
    return 0


def main() -> int:
    argv = sys.argv[1:]
    if not argv:
        print(__doc__.strip(), file=sys.stderr)
        return 1
    cmd, args = argv[0], argv[1:]
    if cmd == "checkout" and len(args) == 1:
        return cmd_checkout(args[0])
    if cmd == "status":
        return cmd_status(args[0] if args else None)
    if cmd == "add" and len(args) == 1:
        return cmd_add(args[0])
    print(__doc__.strip(), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
