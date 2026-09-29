---
description: "异或自反：x ^ x = 0、x ^ 0 = x，且满足交换律——全体异或一遍，成对的互相抵消，剩下落单的"
---

# 136. 只出现一次的数字

[LeetCode 136](https://leetcode.cn/problems/single-number/) · 简单 · 技巧

## 题

非空整数数组里，除了一个元素只出现一次，其余每个都恰好出现两次，找出那个落单的。要求线性时间、常数额外空间。

例：`nums = [4, 1, 2, 1, 2]` → `4`。

## 一句话

把所有数异或起来——出现两次的两两抵消成 0，结果就是落单的数。

## 关键技巧

**异或的三条性质。** $x \oplus x = 0$，$x \oplus 0 = x$，异或满足交换律和结合律。所以不管顺序如何，$\bigoplus \text{nums}$ 可以重排成「每对相同的数挨在一起」，每对变 0，只剩落单的那个。

**为什么想到异或。** 常数空间意味着不能计数、不能哈希；「成对出现」对应的就是一个能自我抵消的运算。加法也能抵消，但要知道「另一半」才能减——异或不需要。

**负数也没问题。** Python 整数异或按补码语义进行，负数照常抵消。

## 解

```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        acc = 0
        for x in nums:
            acc ^= x  # 成对的互相抵消
        return acc
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **其余出现三次**（LeetCode 137）：按位统计 1 的个数模 3，或用两个变量做状态机。
- **两个落单**（LeetCode 260）：全体异或得 $a \oplus b$，取其最低位的 1 把数组分成两组，各组异或一次。
- **「抵消」同一个思想**：[169. 多数元素](0169-majority-element.md) 的投票法是让不同的数两两抵消；[287. 寻找重复数](0287-find-the-duplicate-number.md) 也有按位统计的解法。

??? note "自测"

    ```python
    s = Solution()
    assert s.singleNumber([2, 2, 1]) == 1
    assert s.singleNumber([4, 1, 2, 1, 2]) == 4
    assert s.singleNumber([1]) == 1
    assert s.singleNumber([-3, 5, 5]) == -3
    ```
