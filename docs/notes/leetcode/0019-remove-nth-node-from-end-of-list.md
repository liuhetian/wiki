---
description: "前后指针拉开固定间距，前者到底时后者正停在目标的前驱；「倒数第 k」一遍扫完，dummy 兜住删头节点"
---

# 19. 删除链表的倒数第 N 个结点

[LeetCode 19](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) · 中等 · 链表

## 题

删掉单链表倒数第 `n` 个节点，返回新的头。`n` 保证合法（$1 \le n \le$ 链表长度）。

例：`1→2→3→4→5`，`n = 2` → `1→2→3→5`。

进阶：只扫一遍。

## 一句话

`fast` 先走 `n` 步，然后 `fast`、`slow` 同速走，`fast` 走出链表时 `slow` 正好在要删节点的前一个。

## 关键技巧

**把「倒数」换成「间距」。** 倒数第 `n` 个离终点 `None` 的距离是 `n`。让两个指针保持间距，前面那个到达终点时，后面那个离终点的距离就是那个间距——不用知道总长。

**删节点要停在前驱。** 删除靠 `prev.next = prev.next.next`，所以 `slow` 要停在目标前一个，间距要比 `n` 多 1：`slow` 从 `dummy` 出发、`fast` 从 `head` 先走 `n` 步，两者差 `n + 1`。`fast` 为 `None` 时 `slow` 离 `None` 为 `n + 1`，正是倒数第 `n + 1` 个，即目标的前驱。

**dummy 兜底删头节点。** `n` 等于链表长度时要删的是头，前驱不存在；有了 `dummy`，前驱就是 `dummy`，最后返回 `dummy.next`，不用特判。

## 解

```python
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        slow, fast = dummy, head
        for _ in range(n):
            fast = fast.next
        while fast:  # 间距 n+1：fast 到 None 时 slow 在目标前驱
            slow, fast = slow.next, fast.next
        slow.next = slow.next.next
        return dummy.next
```

时间 $O(L)$，空间 $O(1)$。

## 延伸

- 只找倒数第 `k` 个不删：让 `slow` 也从 `head` 出发，间距就是 `k`。
- 找中点是速度差而不是间距差：[234. 回文链表](0234-palindrome-linked-list.md)、[148. 排序链表](0148-sort-list.md) 用快慢指针。
- 同样靠两指针「路程对齐」的：[160. 相交链表](0160-intersection-of-two-linked-lists.md)。
- **坑**：间距差一位就删错节点，拿 `[1]`、`n = 1`（删成空）和 `[1, 2]`、`n = 2`（删头）两个用例手推一遍最快。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.removeNthFromEnd(build_list([1, 2, 3, 4, 5]), 2)) == [1, 2, 3, 5]
    assert s.removeNthFromEnd(build_list([1]), 1) is None
    assert list_vals(s.removeNthFromEnd(build_list([1, 2]), 1)) == [1]
    assert list_vals(s.removeNthFromEnd(build_list([1, 2]), 2)) == [2]
    ```
