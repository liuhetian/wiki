---
description: "Floyd 判圈：快指针每步比慢指针多走 1，进了环就一定追上；O(1) 空间判环，任何「迭代函数」序列都能用"
---

# 141. 环形链表

[LeetCode 141](https://leetcode.cn/problems/linked-list-cycle/) · 简单 · 链表

## 题

判断一条单链表里有没有环——沿 `next` 一直走能否回到走过的节点。

例：`3→2→0→-4`，`-4` 的 `next` 指回 `2` → `true`；`1` 单独一个节点、`next` 为空 → `false`。

进阶：$O(1)$ 空间。

## 一句话

快指针一次两步、慢指针一次一步；有环必相遇，无环快指针先走到 `None`。

## 关键技巧

**相对速度为 1，追及必然发生、且不会跳过。** 两个指针都进环后，把慢指针当参照物，快指针每步向它靠近恰好 1 格。距离每次减 1，一定会减到 0——不存在「一步跨过去」的情况。所以有环必相遇，且慢指针进环后不到一圈就被追上。

**无环时的终止条件只看 `fast`。** `fast` 跑在前面，`fast` 或 `fast.next` 为空就说明走到了尽头。`slow` 永远在 `fast` 后面，不用判。

最直白的做法是 `set` 记下走过的节点，重复即有环，$O(n)$ 空间。Floyd 把「记忆」换成了「速度差」。

## 解

```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
            if slow is fast:
                return True
        return False
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 找出**环从哪里开始**：[142. 环形链表 II](0142-linked-list-cycle-ii.md)，相遇后再放一个指针从头走。
- **Floyd 不限于链表**：只要是 $x_{k+1} = f(x_k)$ 的序列就能判圈。[287. 寻找重复数](0287-find-the-duplicate-number.md) 把下标当节点、`nums[i]` 当 `next`；[202. 快乐数](https://leetcode.cn/problems/happy-number/) 把「各位平方和」当 `next`。
- **坑**：判相遇要放在移动之后；若先判 `slow is fast` 再移动，起点就相等，直接误报。

??? note "自测"

    ```python
    s = Solution()
    head = build_list([3, 2, 0, -4])
    head.next.next.next.next = head.next  # -4 -> 2
    assert s.hasCycle(head) is True

    head = build_list([1, 2])
    head.next.next = head
    assert s.hasCycle(head) is True

    assert s.hasCycle(build_list([1])) is False
    assert s.hasCycle(None) is False
    one = ListNode(1); one.next = one  # 自环
    assert s.hasCycle(one) is True
    ```
