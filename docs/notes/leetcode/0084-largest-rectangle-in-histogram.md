---
description: "枚举「谁是最矮的那根」：每根柱子向两侧延伸到第一个更矮的为止，单调递增栈弹出时左右边界一次拿齐"
---

# 84. 柱状图中最大的矩形

[LeetCode 84](https://leetcode.cn/problems/largest-rectangle-in-histogram/) · 困难 · 栈

## 题

给一排宽度为 1 的柱子高度，求柱状图里能勾勒出的最大矩形面积（矩形必须贴底、由相邻柱子构成）。

例：`heights = [2, 1, 5, 6, 2, 3]` → `10`（高 5、6 两根，取高 5 宽 2）。

## 一句话

最大矩形一定以某根柱子为高——对每根柱子找左右第一个比它矮的位置 $L$、$R$，面积 $h \times (R - L - 1)$；单调递增栈在弹出时同时给出这两个边界。

## 关键技巧

**换枚举对象。** 枚举左右端点是 $O(n^2)$。换个问法：最优矩形的高一定等于它范围内最矮那根柱子 $i$ 的高度，而固定 $i$ 为最矮者后，矩形能向两侧延伸到第一个比它矮的柱子为止——延伸得越宽越好。所以答案是

$$
\max_i\ h_i \times (R_i - L_i - 1)
$$

其中 $L_i$、$R_i$ 是左/右侧第一个严格更矮的下标。

**单调递增栈一次拿齐两个边界。** 栈中下标对应高度自底向顶递增。新柱子 $j$ 比栈顶 $i$ 矮时弹出 $i$：

- $j$ 是 $i$ 右侧第一个更矮的——否则 $i$ 早被弹了，$R_i = j$；
- 弹出后的新栈顶是 $i$ 左侧第一个更矮的（栈里 $i$ 下面的都比它矮，而夹在中间被弹掉的都比 $i$ 高），$L_i$ = 新栈顶，栈空则为 $-1$。

**哨兵**：数组首尾各补一个高度 0。头部的 0 永不出栈，省掉「栈空」判断；尾部的 0 比所有柱子都矮，扫到它时把栈里剩下的全部结算。

**相等高度怎么办**：代码只在严格更高时弹出，栈里允许相邻等高——这时弹出较靠上的那根，新栈顶和它一样高，算出的宽度偏窄；但等高的一串里最靠下的那根，左边界是真正更矮的柱子，会算出完整宽度，最大值不丢。改成 `>=` 也对，理由对称。

## 解

```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        h = [0] + heights + [0]  # 两端哨兵
        stack, best = [0], 0     # 下标，高度自底向顶递增
        for j in range(1, len(h)):
            while h[stack[-1]] > h[j]:
                i = stack.pop()
                best = max(best, h[i] * (j - stack[-1] - 1))
            stack.append(j)
        return best
```

时间 $O(n)$（每个下标进出栈各一次），空间 $O(n)$。

## 延伸

- **最大全 1 矩形**（LeetCode 85）：逐行累积「向上连续 1 的高度」，每一行跑一遍本题，$O(mn)$。
- 单调栈求「下一个更大 / 更小」的基础版：[739. 每日温度](0739-daily-temperatures.md)。
- 和 [42. 接雨水](0042-trapping-rain-water.md) 对照：接雨水用递减栈找「两侧更高」围出凹槽，本题用递增栈找「两侧更矮」界定宽度——方向相反，骨架相同。
- 分治解法（按最矮柱子切开递归）平均 $O(n \log n)$，有序输入退化 $O(n^2)$，不如单调栈。

??? note "自测"

    ```python
    s = Solution()
    assert s.largestRectangleArea([2, 1, 5, 6, 2, 3]) == 10
    assert s.largestRectangleArea([2, 4]) == 4
    assert s.largestRectangleArea([1]) == 1
    assert s.largestRectangleArea([0]) == 0
    assert s.largestRectangleArea([3, 3, 3]) == 9
    assert s.largestRectangleArea([1, 2, 3, 4, 5]) == 9
    assert s.largestRectangleArea([5, 4, 1, 2]) == 8
    ```
