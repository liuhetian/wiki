---
description: "转成 0-1 背包：能否选出和为 sum/2 的子集；一维布尔数组倒序更新，保证每个数只用一次"
---

# 416. 分割等和子集

[LeetCode 416](https://leetcode.cn/problems/partition-equal-subset-sum/) · 中等 · 动态规划

## 题

给一个正整数数组 `nums`，问能否把它分成两个子集，使两个子集的元素和相等。

例：`nums = [1, 5, 11, 5]` → `true`（`[1, 5, 5]` 和 `[11]`）；`nums = [1, 2, 3, 5]` → `false`。

## 一句话

总和为奇数直接不行；否则问题等价于「能否挑出一些数，和恰好为 `sum / 2`」——0-1 背包的可行性版本。

## 关键技巧

**问题转化。** 两半相等 ⇔ 其中一半的和是 $S/2$。于是只需判断子集和 $S/2$ 是否可达。

**0-1 背包，布尔型。**

- 状态：$f[t]$ = 用已考虑过的数，能否凑出和 $t$。
- 转移：考虑数 $x$ 时，$f[t] \mathrel{|}= f[t - x]$。
- 初值：$f[0] = \text{True}$。
- 顺序：外层遍历数，内层 $t$ 从 $S/2$ **倒序**到 $x$。

**为什么内层要倒序。** 一维数组里 $f[t-x]$ 必须是「还没考虑 $x$」的旧值。倒序时，$t - x < t$ 还没被本轮改过；正序的话 $f[t-x]$ 可能刚被 $x$ 更新过，等于 $x$ 被用了两次——那就成了完全背包（[322. 零钱兑换](0322-coin-change.md) 恰好要正序）。

**剪枝。** 最大元素超过 $S/2$ 直接失败；$f[S/2]$ 一旦为真就可以提前返回。

**位运算写法。** 把 $f$ 压成一个大整数 `bits`，第 $t$ 位表示和 $t$ 可达：`bits |= bits << x`。Python 大整数移位很快，常数小得多。

## 解

=== "一维 DP"

    ```python
    class Solution:
        def canPartition(self, nums: List[int]) -> bool:
            total = sum(nums)
            if total % 2:
                return False
            target = total // 2
            f = [True] + [False] * target
            for x in nums:
                for t in range(target, x - 1, -1):  # 倒序：每个数只用一次
                    f[t] = f[t] or f[t - x]
                if f[target]:
                    return True
            return f[target]
    ```

    时间 $O(n \cdot S)$，空间 $O(S)$。

=== "位集"

    ```python
    class Solution2:
        def canPartition(self, nums: List[int]) -> bool:
            total = sum(nums)
            if total % 2:
                return False
            bits = 1  # 第 t 位为 1 表示和 t 可达
            for x in nums:
                bits |= bits << x
            return bool(bits >> (total // 2) & 1)
    ```

    时间 $O(n \cdot S / w)$，$w$ 为机器字长；空间 $O(S)$ 位。提交时类名改回 `Solution`。

## 延伸

- **完全背包对照**：[322. 零钱兑换](0322-coin-change.md)、[279. 完全平方数](0279-perfect-squares.md)——物品可重复，内层正序。
- **目标和**（LeetCode 494）：给每个数加正负号凑 `target`，同样化成子集和 $(S + \text{target})/2$，求方案数。
- **坑**：别用 `t` 从 0 开始正序，自测里 `[1, 2, 5]` 这种会被「同一个 1 用两次」误判。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.canPartition([1, 5, 11, 5]) is True
        assert s.canPartition([1, 2, 3, 5]) is False
        assert s.canPartition([1]) is False
        assert s.canPartition([2, 2]) is True
        assert s.canPartition([1, 2, 5]) is False
    ```
