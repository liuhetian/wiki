---
description: "区间题先按左端点排序，之后只需和「结果里最后一个区间」比——能否重叠只看它的右端点"
---

# 56. 合并区间

[LeetCode 56](https://leetcode.cn/problems/merge-intervals/) · 中等 · 普通数组

## 题

给一组闭区间 `[start, end]`，把所有有重叠（含端点相接）的区间合并，返回不重叠的区间列表。

例：`[[1, 3], [2, 6], [8, 10], [15, 18]]` → `[[1, 6], [8, 10], [15, 18]]`；`[[1, 4], [4, 5]]` → `[[1, 5]]`。

## 一句话

按起点排序后顺序扫，当前区间起点 `<=` 结果末尾的终点就合并（终点取 max），否则另起一段。

## 关键技巧

**排序把二维关系压成一维。** 按起点升序后，一个区间只可能和「它前面合并出来的最后一段」重叠——更早的段终点都小于最后一段的起点，而当前起点 $\ge$ 最后一段的起点，自然碰不到。

**合并时终点取 max，不是直接用新终点。** 被包含的情形 `[1, 10], [2, 3]`：合并后仍是 `[1, 10]`，直接赋值会错成 `[1, 3]`。

**判定用 `<=`。** 题目的闭区间里 `[1, 4]` 和 `[4, 5]` 算重叠。

## 解

```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        res = []
        for s, e in intervals:
            if res and s <= res[-1][1]:
                res[-1][1] = max(res[-1][1], e)
            else:
                res.append([s, e])
        return res
```

时间 $O(n \log n)$，空间 $O(\log n)$（排序栈，不计输出）。

## 延伸

- 「插入区间」（[LeetCode 57](https://leetcode.cn/problems/insert-interval/)）：已有序，一遍扫分三段——左边不重叠、中间合并、右边不重叠，$O(n)$。
- 「无重叠区间」（[LeetCode 435](https://leetcode.cn/problems/non-overlapping-intervals/)）：换成按**终点**排序做贪心，删最少的区间。
- [763. 划分字母区间](0763-partition-labels.md) 本质是隐式的区间合并：每个字母的首末位置就是一个区间。
- 另一路是差分/扫描线：端点 +1、-1 排序后扫，计数归零处就是一段结束，适合问「同一时刻最多多少重叠」。

??? note "自测"

    ```python
    s = Solution()
    assert s.merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]
    assert s.merge([[1, 4], [4, 5]]) == [[1, 5]]
    assert s.merge([[4, 7], [1, 4]]) == [[1, 7]]
    assert s.merge([[1, 10], [2, 3]]) == [[1, 10]]
    assert s.merge([[1, 1]]) == [[1, 1]]
    ```
