---
description: "答案必在 1..n+1，于是把数组本身当哈希表：值 v 归位到下标 v−1，再找第一个没归位的，O(n) 时间 O(1) 空间"
---

# 41. 缺失的第一个正数

[LeetCode 41](https://leetcode.cn/problems/first-missing-positive/) · 困难 · 普通数组

## 题

给一个未排序的整数数组，找出没有出现在其中的最小正整数。要求 $O(n)$ 时间、$O(1)$ 额外空间。

例：`[3, 4, -1, 1]` → `2`；`[7, 8, 9, 11, 12]` → `1`。

## 一句话

原地交换，让每个 `1 <= v <= n` 的值落到下标 `v - 1`；之后第一个 `nums[i] != i + 1` 的位置，答案就是 `i + 1`。

## 关键技巧

**答案的值域只有 $n + 1$ 种。** 长度为 $n$ 的数组最多装下 $1..n$ 全部，此时答案是 $n+1$；否则答案在 $1..n$ 里。**所以只关心 $[1, n]$ 内的值**，其他值（负数、0、大于 $n$）都是噪声。

**数组自己当哈希表。** 值域和下标域大小一样，可以规定「值 $v$ 住在下标 $v-1$」。对每个位置，只要 `nums[i]` 在 $[1, n]$ 内、且它该去的位置上还不是它，就交换过去；换回来的新值继续处理，直到当前位置无事可做。

**为什么是 $O(n)$。** 每次交换都让一个值落到它的最终位置，而一个位置被正确占据后不会再被换走，所以交换总数 $\le n$。

**死循环的坑。** 判断条件要写 `nums[nums[i] - 1] != nums[i]`，而不是 `nums[i] != i + 1`——有重复值时（如 `[1, 1]`），目标位置已经是同一个值，按后者会无限互换。

## 解

```python
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                j = nums[i] - 1
                nums[i], nums[j] = nums[j], nums[i]
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 同一个「下标即哈希」的招：[287. 寻找重复数](0287-find-the-duplicate-number.md)（值域 $1..n$，数组长 $n+1$），以及「找到所有数组中消失的数字」（[LeetCode 448](https://leetcode.cn/problems/find-all-numbers-disappeared-in-an-array/)）——那题用「取负号标记」，不交换。
- 标记法替代交换：先把越界值改成 $n+1$，再对每个 $|v| \le n$ 把下标 $|v|-1$ 置负，最后找第一个正数。
- 坑：Python 里交换写成 `nums[i], nums[nums[i] - 1] = nums[nums[i] - 1], nums[i]` 会出错——左边赋值是从左到右的，`nums[i]` 先被改了，第二个下标就算错了。先把 `j` 存下来最稳。

??? note "自测"

    ```python
    s = Solution()
    assert s.firstMissingPositive([1, 2, 0]) == 3
    assert s.firstMissingPositive([3, 4, -1, 1]) == 2
    assert s.firstMissingPositive([7, 8, 9, 11, 12]) == 1
    assert s.firstMissingPositive([1, 1]) == 2
    assert s.firstMissingPositive([1]) == 2
    assert s.firstMissingPositive([2, 1]) == 3
    ```
