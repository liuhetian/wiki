---
description: "快慢指针原地「压缩」：慢指针左边永远是已处理好的非零前缀，交换一趟即稳定分区"
---

# 283. 移动零

[LeetCode 283](https://leetcode.cn/problems/move-zeroes/) · 简单 · 双指针

## 题

把数组里的 `0` 全部挪到末尾，非零元素保持原有相对顺序。必须原地操作。

例：`[0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`。

## 一句话

快指针找非零，慢指针标记「下一个非零该放哪」，找到就交换。

## 关键技巧

**不变量：`nums[:slow]` 是已扫过部分的全部非零元素、按原序排列；`nums[slow:fast]` 全是 0。** 快指针 `fast` 每遇到一个非零，就和 `nums[slow]` 交换，然后 `slow += 1`：

- 交换把非零放到非零前缀的末尾——相对顺序不变，因为 `fast` 是从左到右扫的；
- 被换过去的 `nums[slow]` 要么是 0，要么就是它自己（`slow == fast` 时），所以 `[slow, fast]` 全 0 的不变量保持。

扫完时 `fast = n`，整个数组被分成「非零前缀 + 全零后缀」。

**这是稳定分区（stable partition）的原地版本。** 任意谓词都能套：把「非零」换成「满足条件」即可。它也是「原地删除元素」的骨架——不交换、只覆盖 `nums[slow] = nums[fast]`，最后把尾巴填 0，写次数更少。

## 解

```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 同一套快慢指针的「分区」思路：[75. 颜色分类](0075-sort-colors.md) 是三路分区，要三个指针。
- 坑：别用「遇 0 就 `pop` 再 `append`」——`pop(i)` 是 $O(n)$，整体退化到 $O(n^2)$，而且边遍历边改长度容易漏元素。
- 原题进阶问「尽量减少操作次数」：交换版每个非零至多一次交换；覆盖版写次数是 $n$，交换版在 0 很少时更省。

??? note "自测"

    ```python
    s = Solution()
    for arr, want in [
        ([0, 1, 0, 3, 12], [1, 3, 12, 0, 0]),
        ([0], [0]),
        ([1, 2, 3], [1, 2, 3]),
        ([0, 0, 1], [1, 0, 0]),
    ]:
        s.moveZeroes(arr)
        assert arr == want
    ```
