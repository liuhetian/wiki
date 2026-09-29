---
description: "两个指针走完自己再走对方，路程都是 a+b+c，差值自己抵消；「拼接消长度差」比先数长度再对齐更短"
---

# 160. 相交链表

[LeetCode 160](https://leetcode.cn/problems/intersection-of-two-linked-lists/) · 简单 · 链表

## 题

两条单链表可能在某个节点汇合，汇合后共用同一段尾巴。找出汇合的那个节点（按身份，不是按值），不相交就返回空。不许改动链表结构。

例：`A = 4→1→8→4→5`，`B = 5→6→1→8→4→5`，两条链从值为 `8` 的节点开始共用 → 返回那个 `8` 节点。

要求时间 $O(m+n)$，空间 $O(1)$。

## 一句话

`p` 走完 A 接着走 B，`q` 走完 B 接着走 A——两人走的总路程一样，必然在交点（或同时在末尾的 `None`）碰头。

## 关键技巧

**难点是长度不同，拼接把长度差抹平。** 设 A 独有部分长 $a$，B 独有部分长 $b$，公共尾巴长 $c$。`p` 沿 A→B 走，到交点时走了 $a + c + b$；`q` 沿 B→A 走，到交点时走了 $b + c + a$。两者相等，所以**同一步到达交点**。

**不相交时也能停。** 此时 $c = 0$，两人各走 $a + b$ 步后同时变成 `None`，`p is q` 成立，循环退出返回 `None`——不用单独判断。

**判等用 `is`。** 交点按节点身份定义，值相同的不同节点不算相交。

朴素替代：先各自数长度，长的先走差值步，再齐步走。一样 $O(1)$ 空间，只是多两遍计数；拼接法是把「对齐」这件事交给了路程本身。

## 解

```python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        p, q = headA, headB
        while p is not q:
            # 走到 None 就换到另一条链的头；None 本身也占一步，保证不相交时同时到 None
            p = p.next if p else headB
            q = q.next if q else headA
        return p
```

时间 $O(m+n)$，空间 $O(1)$。

## 延伸

- **坑**：切换条件写成 `if p.next` 会跳过 `None` 这一步，不相交时两人永远错开、死循环。
- 允许 $O(m)$ 空间时，把 A 的节点全塞进 `set`，再扫 B 找第一个命中的——直白但不满足进阶要求。
- 同是「两个指针走出相同路程」的套路：[142. 环形链表 II](0142-linked-list-cycle-ii.md) 用路程等式找入环点；[19. 删除链表的倒数第 N 个结点](0019-remove-nth-node-from-end-of-list.md) 用固定间距找倒数位置。

??? note "自测"

    ```python
    s = Solution()
    common = build_list([8, 4, 5])
    a = build_list([4, 1]); a.next.next = common
    b = build_list([5, 6, 1]); b.next.next.next = common
    assert s.getIntersectionNode(a, b) is common

    common = build_list([2, 4])
    a = build_list([1, 9, 1]); a.next.next.next = common
    b = build_list([3]); b.next = common
    assert s.getIntersectionNode(a, b) is common

    # 不相交；值相同也不算
    assert s.getIntersectionNode(build_list([2, 6, 4]), build_list([1, 5])) is None
    assert s.getIntersectionNode(build_list([1]), build_list([1])) is None
    # 整条都是公共部分
    same = build_list([1, 2])
    assert s.getIntersectionNode(same, same) is same
    ```
