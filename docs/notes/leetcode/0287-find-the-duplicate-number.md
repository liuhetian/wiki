---
description: "把 i → nums[i] 看成链表的 next 指针，重复值就是环的入口——Floyd 快慢指针，不改数组、O(1) 空间"
---

# 287. 寻找重复数

[LeetCode 287](https://leetcode.cn/problems/find-the-duplicate-number/) · 中等 · 技巧

## 题

长度为 `n + 1` 的数组，元素都在 `[1, n]` 内，恰有一个值重复（可能重复多次），找出它。要求**不修改数组**、只用 $O(1)$ 额外空间。

例：`nums = [1, 3, 4, 2, 2]` → `2`；`nums = [3, 3, 3, 3, 3]` → `3`。

## 一句话

从下标 0 出发沿 `i → nums[i]` 走，一定会进环；有两个下标指向同一个值，那个值就是环入口——用环形链表 II 的找入口法。

## 关键技巧

**建模成函数图。** 把下标 `i` 看成节点、`nums[i]` 看成它的 next。值域是 `[1, n]`，所以没人指向 0——0 只能是链的起点，不在环上。$n + 1$ 个节点、每个出度为 1，从 0 出发必然进环。

**为什么入口就是重复值。** 环入口是「被两个不同节点指向」的节点：一个来自环外的链、一个来自环内的前驱。被两个下标指向 ⇔ 这个值出现了两次以上。

**Floyd 两阶段。**

1. 快指针一次两步、慢指针一次一步，从 0 出发，在环内相遇。
2. 一个指针回到 0，两个都一次一步，再次相遇处就是入口。

第二阶段的证明：设起点到入口距离 $a$，入口到相遇点 $b$，环长 $c$。相遇时快指针走的步数是慢指针的两倍：$2(a+b) = a + b + kc$，得 $a = kc - b$——从相遇点再走 $a$ 步恰好绕回入口。

**另一个 O(1) 解：值域二分。** 猜答案 $\le m$：统计数组里 $\le m$ 的个数 `cnt`，鸽巢原理下 `cnt > m` 说明重复值在 $[1, m]$ 里。$O(n\log n)$，不改数组，思路更直接。

**为什么排除别的做法。** 排序、原地标负号都改数组；哈希集合 $O(n)$ 空间。

## 解

=== "快慢指针"

    ```python
    class Solution:
        def findDuplicate(self, nums: List[int]) -> int:
            slow = fast = 0
            while True:                      # 阶段一：环内相遇
                slow = nums[slow]
                fast = nums[nums[fast]]
                if slow == fast:
                    break
            slow = 0
            while slow != fast:              # 阶段二：同速走到入口
                slow = nums[slow]
                fast = nums[fast]
            return slow
    ```

    时间 $O(n)$，空间 $O(1)$。

=== "值域二分"

    ```python
    class Solution2:
        def findDuplicate(self, nums: List[int]) -> int:
            lo, hi = 1, len(nums) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if sum(x <= mid for x in nums) > mid:  # [1, mid] 里挤了太多数
                    hi = mid
                else:
                    lo = mid + 1
            return lo
    ```

    时间 $O(n\log n)$，空间 $O(1)$。提交时类名改回 `Solution`。

## 延伸

- **原型**：[142. 环形链表 II](0142-linked-list-cycle-ii.md)，这里只是把链表换成了数组映射；判环本身见 [141. 环形链表](0141-linked-list-cycle.md)。
- **「值域 [1, n] ⇒ 下标即哈希」同一招**：[41. 缺失的第一个正数](0041-first-missing-positive.md) 允许改数组，就原地交换归位。
- **坑**：必须从下标 0 出发——0 保证不在环上；从别的下标出发，阶段二的「回到起点」可能本身就在环里，找到的不一定是重复值。

??? note "自测"

    ```python
    import random as _r
    for S in (Solution, Solution2):
        s = S()
        for arr, want in [
            ([1, 3, 4, 2, 2], 2),
            ([3, 1, 3, 4, 2], 3),
            ([3, 3, 3, 3, 3], 3),
            ([1, 1], 1),
            ([2, 5, 9, 6, 9, 3, 8, 9, 7, 1], 9),
        ]:
            before = arr[:]
            assert s.findDuplicate(arr) == want
            assert arr == before  # 不改数组
        for _ in range(200):
            n = _r.randint(1, 30)
            dup = _r.randint(1, n)
            arr = list(range(1, n + 1)) + [dup]
            _r.shuffle(arr)
            assert s.findDuplicate(arr) == dup
    ```
