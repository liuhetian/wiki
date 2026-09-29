---
description: "对顶堆：大顶堆装较小一半、小顶堆装较大一半，大小差不超过 1——中位数永远在两个堆顶"
---

# 295. 数据流的中位数

[LeetCode 295](https://leetcode.cn/problems/find-median-from-data-stream/) · 困难 · 堆

## 题

设计一个类 `MedianFinder`：`addNum(num)` 往集合里加一个整数，`findMedian()` 返回当前所有数的中位数（偶数个时取中间两数的平均）。

例：`addNum(1), addNum(2), findMedian() → 1.5, addNum(3), findMedian() → 2.0`。

## 一句话

把数分成两半：较小的一半放大顶堆 `lo`，较大的一半放小顶堆 `hi`，保持 `len(lo)` 等于 `len(hi)` 或多 1；中位数就是 `lo` 的堆顶，或两个堆顶的平均。

## 关键技巧

**中位数只关心「分界线」。** 不需要全序，只要知道较小一半的最大值和较大一半的最小值——这正是两个堆各自的堆顶。

**两个不变量：**

1. **有序**：`lo` 里每个数 $\le$ `hi` 里每个数，即 $\max(lo) \le \min(hi)$；
2. **平衡**：$|lo| - |hi| \in \{0, 1\}$。

**插入时先过一道对面的堆，再平衡。** 新数 `x` 先推进 `lo`，把 `lo` 的最大值弹出推进 `hi`——这一步保证了有序（进入 `hi` 的是 `lo ∪ {x}` 里最大的）；然后若 `hi` 比 `lo` 大，把 `hi` 的最小值挪回 `lo`，恢复平衡。挪回的是 `hi` 的最小值，有序依然成立。

**Python 只有小顶堆**，大顶堆用存相反数实现。

## 解

```python
class MedianFinder:

    def __init__(self):
        self.lo = []  # 大顶堆（存相反数），较小的一半
        self.hi = []  # 小顶堆，较大的一半

    def addNum(self, num: int) -> None:
        heapq.heappush(self.hi, -heapq.heappushpop(self.lo, -num))  # 过一遍 lo，最大者进 hi
        if len(self.hi) > len(self.lo):                             # 平衡：lo 不少于 hi
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2
```

`addNum` $O(\log n)$，`findMedian` $O(1)$，空间 $O(n)$。

## 延伸

- **值域很小**（如都在 $[0, 100]$）时用计数数组，找中位数扫 101 个桶即可；**99% 在范围内**时，范围外的两端各记一个计数，中位数几乎总落在桶里。
- 滑动窗口中位数（LeetCode 480）要支持删除，用对顶堆 + 延迟删除，或有序容器。
- 单堆找第 k 大的基本招见 [215. 数组中的第K个最大元素](0215-kth-largest-element-in-an-array.md)；两个有序数组的中位数（静态、要求对数时间）是另一种思路，见 [4. 寻找两个正序数组的中位数](0004-median-of-two-sorted-arrays.md)。

??? note "自测"

    ```python
    m = MedianFinder()
    m.addNum(1)
    m.addNum(2)
    assert m.findMedian() == 1.5
    m.addNum(3)
    assert m.findMedian() == 2.0

    m = MedianFinder()
    m.addNum(-1)
    assert m.findMedian() == -1.0
    for x in (-2, -3, -4, -5):
        m.addNum(x)
    assert m.findMedian() == -3.0

    random.seed(0)
    m, seen = MedianFinder(), []
    for _ in range(500):
        x = random.randint(-50, 50)
        m.addNum(x)
        bisect.insort(seen, x)
        n = len(seen)
        want = seen[n // 2] if n % 2 else (seen[n // 2 - 1] + seen[n // 2]) / 2
        assert m.findMedian() == want
    ```
