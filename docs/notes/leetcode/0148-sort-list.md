---
description: "链表排序首选归并：切分只需快慢指针、合并不要额外数组；想要 O(1) 空间就自底向上，按 1、2、4… 的步长切段两两合并"
---

# 148. 排序链表

[LeetCode 148](https://leetcode.cn/problems/sort-list/) · 中等 · 链表

## 题

把一条单链表按值升序排好，返回新头。

例：`4→2→1→3` → `1→2→3→4`；`-1→5→3→4→0` → `-1→0→3→4→5`。

进阶：时间 $O(n \log n)$，空间 $O(1)$。

## 一句话

归并排序：切成两半各自排好，再用「合并两个有序链表」拼起来；自底向上迭代可以省掉递归栈。

## 关键技巧

**为什么是归并而不是快排、堆排。** 链表不能随机访问，堆排序和快排的「按下标交换」都用不上；而归并的两个操作在链表上反而更便宜——切分只要找中点断开，合并只要改指针、**不需要辅助数组**（数组归并要 $O(n)$ 额外空间，链表不用）。

**自顶向下：快慢指针切中点。** `slow` 从 `head`、`fast` 从 `head.next` 出发，`fast` 到头时 `slow` 在前半段末尾，断开 `slow.next`。`fast` 从 `head.next` 起步是为了两个节点时能切成 1 + 1，否则会切成 2 + 0 无限递归。递归深度 $\log n$，空间 $O(\log n)$。

**自底向上：把递归展开成步长翻倍的循环。** 第一轮把相邻的长度 1 的段两两合并，得到长度 2 的有序段；第二轮合并长度 2 的段……共 $\lceil \log_2 n \rceil$ 轮，每轮 $O(n)$。每轮需要两个小工具：

- `cut(head, k)`：从 `head` 数 `k` 个断开，返回后面部分的头；
- `merge(a, b)`：合并并返回 `(头, 尾)`，尾巴用来接下一对。

没有递归，空间 $O(1)$，满足进阶要求。

## 解

=== "自顶向下"

    ```python
    class Solution:
        def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
            if not head or not head.next:
                return head
            slow, fast = head, head.next  # fast 先走一步，两个节点才能切成 1+1
            while fast and fast.next:
                slow, fast = slow.next, fast.next.next
            mid, slow.next = slow.next, None
            return self.merge(self.sortList(head), self.sortList(mid))

        def merge(self, a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next
    ```

    时间 $O(n \log n)$，空间 $O(\log n)$（递归栈）。

=== "自底向上"

    ```python
    class Solution:
        def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
            n, cur = 0, head
            while cur:
                n, cur = n + 1, cur.next
            dummy = ListNode(0, head)
            step = 1
            while step < n:
                pre, cur = dummy, dummy.next
                while cur:
                    left = cur
                    right = self.cut(left, step)
                    cur = self.cut(right, step)
                    pre.next, pre = self.merge(left, right)  # 接上合并结果，pre 移到其尾
                step *= 2
            return dummy.next

        def cut(self, head, k):
            """从 head 数 k 个断开，返回后半段的头。"""
            for _ in range(k - 1):
                if not head:
                    return None
                head = head.next
            if not head:
                return None
            rest, head.next = head.next, None
            return rest

        def merge(self, a, b):
            """合并两条有序链，返回 (头, 尾)。"""
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            while tail.next:
                tail = tail.next
            return dummy.next, tail
    ```

    时间 $O(n \log n)$，空间 $O(1)$。

## 延伸

- 两个组件的出处：合并是 [21. 合并两个有序链表](0021-merge-two-sorted-lists.md)，找中点和 [234. 回文链表](0234-palindrome-linked-list.md) 一样。
- 合并 $k$ 条而不是 2 条：[23. 合并 K 个升序链表](0023-merge-k-sorted-lists.md)，分治写法就是这题自顶向下的后半段。
- 链表上的插入排序：[147. 对链表进行插入排序](https://leetcode.cn/problems/insertion-sort-list/)，$O(n^2)$，用来对比归并的优势。
- **坑**：自底向上里 `merge` 返回的尾巴要走到真正的末尾（`tail.next = a or b` 接上的可能是一整段），否则下一对会接在中间。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.sortList(build_list([4, 2, 1, 3]))) == [1, 2, 3, 4]
    assert list_vals(s.sortList(build_list([-1, 5, 3, 4, 0]))) == [-1, 0, 3, 4, 5]
    assert s.sortList(None) is None
    assert list_vals(s.sortList(build_list([1]))) == [1]
    random.seed(148)
    for n in range(0, 40):
        vals = [random.randint(-5, 5) for _ in range(n)]
        assert list_vals(s.sortList(build_list(vals))) == sorted(vals)
    ```
