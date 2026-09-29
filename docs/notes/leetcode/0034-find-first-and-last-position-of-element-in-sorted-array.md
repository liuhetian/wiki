---
description: "左右边界不写两套二分——只写一个 lower_bound，右边界 = lower_bound(target + 1) - 1"
---

# 34. 在排序数组中查找元素的第一个和最后一个位置

[LeetCode 34](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) · 中等 · 二分查找

## 题

给一个非降序整数数组和目标值，返回目标值出现的起止下标；不存在返回 `[-1, -1]`。要求 $O(\log n)$。

例：`nums = [5, 7, 7, 8, 8, 10], target = 8` → `[3, 4]`；`target = 6` → `[-1, -1]`。

## 一句话

起点是「第一个 `>= target`」，终点是「第一个 `>= target + 1`」的前一个——同一个函数调用两次。

## 关键技巧

**只背一个模板。** 手写「找左边界」「找右边界」两套二分，每套各有 `<` / `<=`、`mid` / `mid+1` 的组合，最容易写错。统一成 `lower_bound(x)` = 第一个 `>= x` 的下标，其余全部由它推出：

| 要找 | 写法 |
|---|---|
| 第一个 `>= x` | `lower_bound(x)` |
| 第一个 `> x` | `lower_bound(x + 1)`（整数） |
| 最后一个 `<= x` | `lower_bound(x + 1) - 1` |
| 最后一个 `< x` | `lower_bound(x) - 1` |

**区间不变量**：左闭右开 $[lo, hi)$，$[0, lo)$ 都 `< x`，$[hi, n)$ 都 `>= x`，结束时 `lo == hi` 即分界。推导见 [35. 搜索插入位置](0035-search-insert-position.md)。

**判不存在**：`start == n` 或 `nums[start] != target`。一旦存在，`end >= start` 自然成立。

**为什么不能「找到一个再往两边扩」**：全是 `target` 的数组会退化成 $O(n)$。

## 解

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(x):  # 第一个 >= x 的下标，[lo, hi) 左闭右开
            lo, hi = 0, len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] >= x:
                    hi = mid
                else:
                    lo = mid + 1
            return lo

        start = lower_bound(target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        return [start, lower_bound(target + 1) - 1]
```

时间 $O(\log n)$，空间 $O(1)$。Python 里也可写 `bisect_left(nums, target)` 与 `bisect_right(nums, target) - 1`。

## 延伸

- 目标出现次数 = `lower_bound(t + 1) - lower_bound(t)`，一样 $O(\log n)$。
- 非整数（浮点、字符串）不能 `+1`，就再写一个谓词为 `> x` 的版本，即 `bisect_right`——模板结构不变，只换比较符。
- 谓词不一定是「和 target 比大小」：[153. 寻找旋转排序数组中的最小值](0153-find-minimum-in-rotated-sorted-array.md) 的谓词是「`<= nums[-1]`」，照样套 lower_bound 骨架。

??? note "自测"

    ```python
    s = Solution()
    assert s.searchRange([5, 7, 7, 8, 8, 10], 8) == [3, 4]
    assert s.searchRange([5, 7, 7, 8, 8, 10], 6) == [-1, -1]
    assert s.searchRange([], 0) == [-1, -1]
    assert s.searchRange([2, 2, 2], 2) == [0, 2]
    assert s.searchRange([1], 1) == [0, 0]
    assert s.searchRange([1, 3], 4) == [-1, -1]
    ```
