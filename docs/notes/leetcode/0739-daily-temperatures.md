---
description: "「下一个更大元素」的标准答案是单调栈：栈里存还没等到答案的下标，新元素一来就把比它小的全部结算"
---

# 739. 每日温度

[LeetCode 739](https://leetcode.cn/problems/daily-temperatures/) · 中等 · 栈

## 题

给每天的气温数组，对每一天求：要再等几天才会出现更高的气温；之后都不会更高就填 `0`。

例：`[73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`。

## 一句话

从左往右扫，栈里是「还在等更高温」的日子，温度自底向顶单调不增；今天比栈顶高，栈顶就等到了——弹出并记下天数差。

## 关键技巧

**单调栈 = 待结算队列。** 暴力是对每天往后扫，$O(n^2)$。换个角度：第 $j$ 天到来时，它是哪些天的答案？是栈里所有温度比它低、还没被结算的那些天。

**不变量：栈中下标递增、对应温度单调不增。** 理由——若栈里有 $i_1 < i_2$ 且 $T_{i_1} < T_{i_2}$，那 $i_1$ 在 $i_2$ 入栈时就该被弹出结算了。所以新元素 $T_j$ 到来时，从栈顶往下弹，凡是 $< T_j$ 的都以 $j$ 为答案；弹到 $\ge T_j$ 就停，因为更下面的只会更高。

**为什么是「第一个」更高**：第 $i$ 天在栈里一直待到第一个比它高的 $j$ 出现才被弹——中间出现的日子都 $\le T_i$，弹不动它。

**均摊 $O(n)$**：每个下标恰好入栈一次、出栈至多一次。

## 解

```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        ans = [0] * len(temperatures)
        stack = []  # 等待更高温的下标，温度自底向顶单调不增
        for j, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                i = stack.pop()
                ans[i] = j - i
            stack.append(j)
        return ans
```

时间 $O(n)$，空间 $O(n)$。

## 延伸

- **四种变体只差比较符和扫描方向**：下一个更大（本题，`<` 时弹）、下一个更小（`>` 时弹）、上一个更大/更小（从右往左扫，或在入栈时读栈顶）。
- 单调栈同时拿到左右两侧的第一个更小值，就能算「以每根柱子为最矮的最大矩形」——见 [84. 柱状图中最大的矩形](0084-largest-rectangle-in-histogram.md)；[42. 接雨水](0042-trapping-rain-water.md) 也有单调栈解法。
- 单调**队列**是它的滑动窗口版——[239. 滑动窗口最大值](0239-sliding-window-maximum.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0]
    assert s.dailyTemperatures([30, 40, 50, 60]) == [1, 1, 1, 0]
    assert s.dailyTemperatures([30, 60, 90]) == [1, 1, 0]
    assert s.dailyTemperatures([50, 50, 50]) == [0, 0, 0]
    assert s.dailyTemperatures([90]) == [0]
    ```
