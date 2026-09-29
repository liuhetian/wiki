---
description: "k 路归并：堆里只放每条链当前的头，弹最小、补它的后继，O(N log k)；或两两分治合并，和归并排序同一棵递归树"
---

# 23. 合并 K 个升序链表

[LeetCode 23](https://leetcode.cn/problems/merge-k-sorted-lists/) · 困难 · 链表

## 题

给 `k` 条各自升序的链表，合并成一条升序链表。

例：`[1→4→5, 1→3→4, 2→6]` → `1→1→2→3→4→4→5→6`；`[]` → 空。

## 一句话

每次要的是「`k` 个链头里最小的」——用最小堆维护这 `k` 个头，弹一个、补它的 `next`。

## 关键技巧

**堆里只需要放「候选者」。** 全局最小值一定在 `k` 个链头之中（每条链自身有序），所以堆的大小始终不超过 `k`。弹出最小的节点 `x` 接到结果尾部，它所在链的下一个候选就是 `x.next`，推入堆。总节点数 $N$，每个节点进出堆一次，$O(N \log k)$。

**Python 的堆比较不了 `ListNode`**——值相等时会接着比元组的下一个元素。放 `(val, i, node)`，`i` 是链的编号：堆里同一时刻每条链最多一个节点，`i` 两两不同，比较永远在 `node` 之前结束。

**分治：把 k 条两两配对合并，一轮后剩 k/2 条。** 共 $\log k$ 轮，每轮所有节点各被搬一次，也是 $O(N \log k)$。对比「顺序地一条条并进来」：第 $i$ 次合并要搬前 $i$ 条的全部节点，总共 $O(Nk)$——差别在于分治让每个节点只参与 $\log k$ 次合并。

## 解

=== "分治"

    ```python
    class Solution:
        def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
            if not lists:
                return None
            while len(lists) > 1:  # 每轮两两合并，条数减半
                lists = [self.merge(lists[i], lists[i + 1] if i + 1 < len(lists) else None)
                         for i in range(0, len(lists), 2)]
            return lists[0]

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

    时间 $O(N \log k)$，空间 $O(k)$（每轮的新列表；不计则 $O(1)$）。

=== "最小堆"

    ```python
    class Solution:
        def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
            # i 作为第二关键字，值相等时不会去比较 ListNode
            heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
            heapify(heap)
            dummy = tail = ListNode()
            while heap:
                _, i, node = heappop(heap)
                tail.next = tail = node
                if node.next:
                    heappush(heap, (node.next.val, i, node.next))
            return dummy.next
    ```

    时间 $O(N \log k)$，空间 $O(k)$。

## 延伸

- $k = 2$ 的版本：[21. 合并两个有序链表](0021-merge-two-sorted-lists.md)；分治的结构和 [148. 排序链表](0148-sort-list.md) 一样。
- **「k 路候选里取最值」是堆的招牌用法**：[215. 数组中的第K个最大元素](0215-kth-largest-element-in-an-array.md)、[347. 前 K 个高频元素](0347-top-k-frequent-elements.md)、[295. 数据流的中位数](0295-find-median-from-data-stream.md)。有序矩阵第 k 小 [378](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix/) 也是把每行当一条链。
- **坑**：`tail.next = tail = node` 是链式赋值，从左到右赋值——先 `tail.next = node`，再 `tail = node`，顺序正好对；写反了（`tail = tail.next = node`）则先把 `tail` 改成 `node`，再让 `node.next = node` 自环。

??? note "自测"

    ```python
    s = Solution()
    got = s.mergeKLists([build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])])
    assert list_vals(got) == [1, 1, 2, 3, 4, 4, 5, 6]
    assert s.mergeKLists([]) is None
    assert s.mergeKLists([None]) is None
    assert list_vals(s.mergeKLists([None, build_list([1]), None, build_list([0, 2])])) == [0, 1, 2]
    ```
