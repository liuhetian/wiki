---
description: "哑节点 + 尾指针：每次摘两条链里较小的头接到尾巴上，一条走完就整段接上另一条；dummy 让「头节点是谁」不再需要特判"
---

# 21. 合并两个有序链表

[LeetCode 21](https://leetcode.cn/problems/merge-two-sorted-lists/) · 简单 · 链表

## 题

两条各自升序的链表，拼成一条升序链表，用原来的节点，不新建。

例：`1→2→4` 和 `1→3→4` → `1→1→2→3→4→4`。

## 一句话

`tail` 指着结果链的末尾，每次比较两个头，小的接上去；剩下的那条直接挂在后面。

## 关键技巧

**dummy 节点消灭头节点特判。** 结果链的头是谁要比较了才知道；先放一个假头 `dummy`，所有节点一律「接到 `tail` 后面」，最后返回 `dummy.next`。凡是「构造新链表」或「可能删掉头节点」的题都先放一个 dummy。

**不变量：`tail` 之前的部分已有序，且都不大于两条链剩余部分的头。** 每次取两个头里较小的，接上去仍满足不变量。一条走完时，另一条剩余部分本身有序、且都不小于 `tail`，**整段接上即可**，不用逐个搬。

**取 `<=` 保持稳定。** 相等时优先取第一条的节点，归并排序靠这一点保证稳定性。

## 解

```python
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next
        tail.next = list1 or list2  # 剩下的整段接上
        return dummy.next
```

时间 $O(m+n)$，空间 $O(1)$。

## 延伸

- **它是归并的「合并」一步**：[148. 排序链表](0148-sort-list.md) 自底向上反复调用它；[23. 合并 K 个升序链表](0023-merge-k-sorted-lists.md) 两两调用它，或把「比两个头」推广成用堆比 $k$ 个头。
- 递归写法 `l1.next = merge(l1.next, l2)` 更短，但深度 $O(m+n)$，长链有爆栈风险。
- 数组版 [88. 合并两个有序数组](https://leetcode.cn/problems/merge-sorted-array/) 没法「整段接上」，要从尾部往前填才能原地。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.mergeTwoLists(build_list([1, 2, 4]), build_list([1, 3, 4]))) == [1, 1, 2, 3, 4, 4]
    assert s.mergeTwoLists(None, None) is None
    assert list_vals(s.mergeTwoLists(None, build_list([0]))) == [0]
    assert list_vals(s.mergeTwoLists(build_list([5, 6]), build_list([1, 2, 3]))) == [1, 2, 3, 5, 6]
    ```
