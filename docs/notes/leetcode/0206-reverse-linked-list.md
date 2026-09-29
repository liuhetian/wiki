---
description: "三指针原地掉头：prev 是已反转部分的头，cur 是待处理部分的头，每步只翻一根 next；链表题的基本功模块"
---

# 206. 反转链表

[LeetCode 206](https://leetcode.cn/problems/reverse-linked-list/) · 简单 · 链表

## 题

把一条单链表整体反过来，返回新的头节点。

例：`1→2→3→4→5` → `5→4→3→2→1`；空链表返回空。

## 一句话

一边走一边把 `cur.next` 指回 `prev`；先用 `nxt` 记住后路，再掉头。

## 关键技巧

**不变量：`prev` 是已反转段的头，`cur` 是未处理段的头，两段互不相连。** 初始 `prev = None`（已反转段为空）、`cur = head`。每一步把 `cur` 从未处理段摘下、挂到已反转段前面，然后两个指针各前进一格。`cur` 变成 `None` 时未处理段为空，`prev` 就是整条反转后的头。

**先存后改。** 改 `cur.next` 会丢掉通往后面的唯一引用，所以顺序固定为：存 `nxt` → 改指向 → 移 `prev` → 移 `cur`。

**递归版的视角**：假设 `head.next` 之后已经反转好了，此时 `head.next` 正是那段的尾巴，于是 `head.next.next = head` 把自己接到尾巴后面，再把 `head.next` 置空。递归深度 $O(n)$，长链会爆栈，面试写迭代更稳。

## 解

=== "递归"

    ```python
    class Solution:
        def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
            if not head or not head.next:
                return head
            new_head = self.reverseList(head.next)
            head.next.next = head  # head.next 此时是已反转段的尾巴
            head.next = None
            return new_head
    ```

    时间 $O(n)$，空间 $O(n)$（递归栈）。

=== "迭代"

    ```python
    class Solution:
        def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
            prev, cur = None, head
            while cur:
                nxt = cur.next   # 先存后路
                cur.next = prev  # 掉头
                prev, cur = cur, nxt
            return prev
    ```

    时间 $O(n)$，空间 $O(1)$。

## 延伸

- **这是模块，不是终点**：[25. K 个一组翻转链表](0025-reverse-nodes-in-k-group.md) 是分段调用它；[234. 回文链表](0234-palindrome-linked-list.md) 反转后半段再比较；[24. 两两交换链表中的节点](0024-swap-nodes-in-pairs.md) 是 $k=2$ 的特例。
- 只反转 `[left, right]` 一段：[92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/)，要多记住段前一个节点和段尾，反转完再缝回去。
- **坑**：Python 一行写 `cur.next, prev, cur = prev, cur, cur.next` 能过，但左边赋值顺序一换（比如先赋 `cur`）就错了，不如拆开写。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.reverseList(build_list([1, 2, 3, 4, 5]))) == [5, 4, 3, 2, 1]
    assert list_vals(s.reverseList(build_list([1, 2]))) == [2, 1]
    assert s.reverseList(None) is None
    assert list_vals(s.reverseList(build_list([7]))) == [7]
    ```
