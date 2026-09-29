---
description: "先探路数够 k 个再动手，组内用三指针反转、prev 初值设为下一组的头，反转完自动接好后路；组尾变组头，接前驱就完事"
---

# 25. K 个一组翻转链表

[LeetCode 25](https://leetcode.cn/problems/reverse-nodes-in-k-group/) · 困难 · 链表

## 题

把链表按每 `k` 个一组切开，每组内部反转，末尾不足 `k` 个的那组保持原样。只能改指针，不能改值。

例：`1→2→3→4→5`，`k = 2` → `2→1→4→3→5`；`k = 3` → `3→2→1→4→5`。

进阶：$O(1)$ 额外空间。

## 一句话

`pre` 指着当前组的前驱；往后数 `k` 个找到组尾，不够就结束；够就把这一段反转、两头缝回去，`pre` 移到新的组尾。

## 关键技巧

**把问题拆成「探路 + 反转一段 + 缝合」三个模块。** 每组涉及四个关键节点：前驱 `pre`、组头 `first`、组尾 `tail`、后继 `after`。反转之后 `tail` 变组头、`first` 变组尾，要做的连接只有两根：`pre → tail`，`first → after`。

**反转时让 `prev` 从 `after` 出发。** 标准三指针反转里 `prev` 初值是 `None`，那样反转完 `first.next` 是空，还得手工接到 `after`。把初值设成 `after`，`first` 第一个被摘下时就直接指向 `after`，后半根线自动接好。

**先探路再动手。** 最后一组不够 `k` 个要保持原样，所以必须先数够 `k` 个才反转；数不够直接返回，已经处理的部分都缝好了。

每个节点被探路访问一次、反转访问一次，总共 $O(n)$。

## 解

```python
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        pre = dummy
        while True:
            tail = pre
            for _ in range(k):  # 探路：不够 k 个就收工
                tail = tail.next
                if not tail:
                    return dummy.next
            first, after = pre.next, tail.next
            prev, cur = after, first  # prev 从 after 出发，first 反转后直接接上后继
            while cur is not after:
                nxt = cur.next
                cur.next = prev
                prev, cur = cur, nxt
            pre.next = tail  # 组尾变组头
            pre = first      # 组头变组尾，是下一组的前驱
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 前置模块：[206. 反转链表](0206-reverse-linked-list.md)；$k = 2$ 的特例：[24. 两两交换链表中的节点](0024-swap-nodes-in-pairs.md)。
- 变体：不足 `k` 个的尾组**也**反转——把探路失败时的 `return` 改成「对剩下的整段反转」。
- 递归写法：探够 `k` 个就反转这段，然后 `first.next = reverseKGroup(after, k)`；代码短，但栈深 $n/k$，不满足 $O(1)$ 空间。
- **坑**：`pre = first` 必须在反转前记下 `first`；反转完 `pre.next` 已经变成 `tail`，再取就错了。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.reverseKGroup(build_list([1, 2, 3, 4, 5]), 2)) == [2, 1, 4, 3, 5]
    assert list_vals(s.reverseKGroup(build_list([1, 2, 3, 4, 5]), 3)) == [3, 2, 1, 4, 5]
    assert list_vals(s.reverseKGroup(build_list([1, 2, 3]), 1)) == [1, 2, 3]
    assert list_vals(s.reverseKGroup(build_list([1, 2, 3, 4]), 4)) == [4, 3, 2, 1]
    assert list_vals(s.reverseKGroup(build_list([1, 2, 3, 4, 5, 6]), 3)) == [3, 2, 1, 6, 5, 4]
    ```
