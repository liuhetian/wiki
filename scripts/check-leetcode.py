#!/usr/bin/env python3
"""校验 docs/notes/leetcode/ 的题解 —— 每篇的 python 代码必须真能跑过自测断言。

题解笔记的价值在"可复现"：代码抄错一个下标，读者照着学就学歪了。所以这里把
每篇里所有 ```python 块按出现顺序拼成一个程序执行，前面垫一段 LeetCode 同款的
预置环境（typing / collections / heapq 等常用导入，ListNode、TreeNode 两个节点
类，以及自测用的建表建树小工具）。约定是：

- 「解」里写 LeetCode 提交形态的 class Solution，能直接贴进网页提交；
- 页尾 ??? note "自测" 折叠块里写 assert，调用上面的 Solution。

预置环境里有 `from __future__ import annotations`，所以题解里的类型注解可以
引用自测块才定义的类（如 138 题的 Node）。

另外三项结构检查：

1. 每篇必须有 题 / 一句话 / 关键技巧 / 解 / 延伸 五个二级标题；
2. 每篇必须链到 leetcode.cn 的原题；
3. assets/hot100.json 里的 100 题必须每题都有对应文件，且被 index.md 链到。

用法：python3 scripts/check-leetcode.py [文件...]   不带参数即检查全部。
"""
import json
import re
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / "docs" / "notes" / "leetcode"
HEADINGS = ["题", "一句话", "关键技巧", "解", "延伸"]

PREAMBLE = '''\
from __future__ import annotations
from typing import *
from collections import *
from functools import *
from itertools import *
from heapq import *
from bisect import *
from math import *
import collections, heapq, bisect, math, functools, itertools, random, string


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_list(vals):
    """[1, 2, 3] -> 1->2->3，空列表返回 None。"""
    dummy = cur = ListNode()
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def list_vals(head):
    """1->2->3 -> [1, 2, 3]。"""
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out


def build_tree(vals):
    """LeetCode 层序写法 [3, 9, 20, None, None, 15, 7] -> 二叉树。"""
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    queue, i = deque([root]), 1
    while queue and i < len(vals):
        node = queue.popleft()
        for side in ("left", "right"):
            if i < len(vals) and vals[i] is not None:
                child = TreeNode(vals[i])
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root


def tree_vals(root):
    """二叉树 -> LeetCode 层序写法，去掉尾部 None。"""
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        if node:
            out.append(node.val)
            queue.extend((node.left, node.right))
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out
'''

FENCE = re.compile(r"^( *)```python[^\n]*\n(.*?)^\1```", re.M | re.S)


def python_blocks(text):
    for m in FENCE.finditer(text):
        indent = len(m.group(1))
        yield "\n".join(line[indent:] for line in m.group(2).splitlines())


def check(md):
    text = md.read_text(encoding="utf-8")
    errs = []
    heads = re.findall(r"^## (.+?)\s*$", text, re.M)
    for h in HEADINGS:
        if h not in heads:
            errs.append(f"缺少二级标题「## {h}」")
    if "leetcode.cn/problems/" not in text:
        errs.append("没有链到 leetcode.cn 原题")
    blocks = list(python_blocks(text))
    if not any("assert" in b for b in blocks):
        errs.append("没有带 assert 的自测代码")
    src = PREAMBLE + "\n\n" + "\n\n".join(blocks)
    try:
        exec(compile(src, str(md), "exec"), {"__name__": "__leetcode__"})
    except Exception:
        tb = traceback.format_exc().strip().splitlines()
        errs.append("代码执行失败：\n      " + "\n      ".join(tb[-4:]))
    return errs


def coverage():
    plan = json.loads((DIR / "assets" / "hot100.json").read_text(encoding="utf-8"))
    index = (DIR / "index.md").read_text(encoding="utf-8")
    errs = []
    for g in plan["groups"]:
        for q in g["questions"]:
            name = f"{int(q['questionFrontendId']):04d}-{q['titleSlug']}.md"
            if not (DIR / name).exists():
                errs.append(f"缺文件 {name}（{q['translatedTitle']}）")
            elif f"]({name})" not in index:
                errs.append(f"index.md 没链到 {name}")
    return errs


def main():
    files = [Path(a).resolve() for a in sys.argv[1:]] or sorted(
        p for p in DIR.glob("*.md") if p.name != "index.md"
    )
    bad = 0
    for md in files:
        errs = check(md)
        if errs:
            bad += 1
            print(f"✗ {md.relative_to(ROOT)}")
            for e in errs:
                print(f"    {e}")
    cov = [] if sys.argv[1:] else coverage()
    for e in cov:
        print(f"✗ {e}")
    print(f"{len(files) - bad}/{len(files)} 篇通过" + ("" if sys.argv[1:] else f"，覆盖缺口 {len(cov)} 处"))
    sys.exit(1 if bad or cov else 0)


if __name__ == "__main__":
    main()
