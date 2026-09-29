---
description: "每格水位 = min(左最高, 右最高) − 自身；双指针让矮的一侧先结算，O(1) 空间拿到那个 min"
---

# 42. 接雨水

[LeetCode 42](https://leetcode.cn/problems/trapping-rain-water/) · 困难 · 双指针

## 题

`height[i]` 是宽为 1 的柱子高度，下雨后柱子之间能积多少水。

例：`[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` → `6`。

## 一句话

按列算：第 `i` 格积水 $\min(L_i, R_i) - h_i$；左右指针谁的历史最高更矮就先结算谁。

## 关键技巧

**先换成按列求和。** 第 `i` 格上方的水面高度由它左边最高柱 $L_i = \max(h_0..h_i)$ 和右边最高柱 $R_i = \max(h_i..h_{n-1})$ 中较矮的决定：

$$
\text{water} = \sum_i \big(\min(L_i, R_i) - h_i\big)
$$

（$L_i, R_i$ 都包含 $h_i$ 自身，所以每项 $\ge 0$。）直接预处理两个数组就是 $O(n)$ 时间 $O(n)$ 空间。

**双指针省掉数组。** 维护 `lmax = max(h[0..l])`、`rmax = max(h[r..n-1])`。若 `lmax < rmax`：

- 对格子 `l`，真正的 $L_l$ 就是 `lmax`；
- 真正的 $R_l \ge$ `rmax`（它的右边包含 `[r, n)`，只会更高），所以 $R_l > L_l$，$\min(L_l, R_l) = $ `lmax`。

**矮的一侧的答案已经确定，不需要知道另一侧的精确值。** 于是结算 `l`、`l += 1`；对称地 `rmax <= lmax` 时结算 `r`。

## 解

=== "双指针"

    ```python
    class Solution:
        def trap(self, height: List[int]) -> int:
            l, r = 0, len(height) - 1
            lmax = rmax = water = 0
            while l < r:
                lmax = max(lmax, height[l])
                rmax = max(rmax, height[r])
                if lmax < rmax:
                    water += lmax - height[l]
                    l += 1
                else:
                    water += rmax - height[r]
                    r -= 1
            return water
    ```

    时间 $O(n)$，空间 $O(1)$。

=== "单调栈"

    ```python
    class Solution2:
        def trap(self, height: List[int]) -> int:
            stack, water = [], 0  # 栈里存下标，高度单调递减
            for i, h in enumerate(height):
                while stack and height[stack[-1]] < h:
                    bottom = stack.pop()
                    if not stack:
                        break
                    left = stack[-1]
                    w = i - left - 1
                    water += w * (min(height[left], h) - height[bottom])
                stack.append(i)
            return water
    ```

    时间 $O(n)$，空间 $O(n)$。按「层」横着算：每弹出一个凹底，就把它和左右两堵墙围成的一条横向水层加上。

## 延伸

- 别和 [11. 盛最多水的容器](0011-container-with-most-water.md) 混：那题只挑两根线，中间柱子不占体积。
- 单调栈解法和 [84. 柱状图中最大的矩形](0084-largest-rectangle-in-histogram.md)、[739. 每日温度](0739-daily-temperatures.md) 同骨架——「找左右第一个比我高/矮的」。
- 二维版接雨水 II（[LeetCode 407](https://leetcode.cn/problems/trapping-rain-water-ii/)）：把「矮的一侧先结算」推广成最小堆从外圈往里 BFS。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) == 6
        assert s.trap([4, 2, 0, 3, 2, 5]) == 9
        assert s.trap([]) == 0
        assert s.trap([1]) == 0
        assert s.trap([3, 2, 1]) == 0
    ```
