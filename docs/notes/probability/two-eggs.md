---
description: "两个鸡蛋 100 层楼最坏 14 次；反过来问 $m$ 次能测几层，$f(k,m)=\\sum_{i\\le k} \\binom{m}{i}$，$1+2+\\cdots+14=105$"
---

# 两个鸡蛋 100 层楼

## 题

一栋 100 层的楼，鸡蛋从某层及以上扔下会碎，以下不碎——临界层未知（也可能 100 层都不碎）。你有 2 个一模一样的鸡蛋，没碎的可以捡回来再扔。**最坏情况下**最少要扔几次才能确定临界层？

## 一句话

**14 次**——第一颗蛋依次在 14、27、39、50……层扔，间隔每次少 1；因为 $1 + 2 + \cdots + 14 = 105 \ge 100$，而 $1 + \cdots + 13 = 91 < 100$。

## 关键技巧

**把问题倒过来问：给定 $k$ 个蛋、$m$ 次机会，最多能测多少层？** 记为 $f(k, m)$。第一次在某层扔：

- 碎了——剩 $k-1$ 个蛋、$m-1$ 次，只能测下面，下面最多容纳 $f(k-1, m-1)$ 层；
- 没碎——剩 $k$ 个蛋、$m-1$ 次，上面最多容纳 $f(k, m-1)$ 层。

加上扔的这一层本身：

$$
f(k, m) = f(k-1, m-1) + f(k, m-1) + 1, \qquad f(0, m) = f(k, 0) = 0
$$

这正是帕斯卡三角的递推（差一个 $+1$），闭式是

$$
f(k, m) = \sum_{i=1}^{k} \binom{m}{i}
$$

直觉：每个楼层对应一条"碎/不碎"的结果序列，长度 $\le m$、至多 $k$ 次碎。正向 DP"$n$ 层要几次"是 $O(kn^2)$ 的 minimax，倒过来问只要 $O(km)$，还给出闭式。

## 解

$k = 2$：$f(2, m) = m + \binom{m}{2} = \frac{m(m+1)}{2}$。$f(2, 13) = 91 < 100 \le 105 = f(2, 14)$，答案 **14**。

方案直接从递推读出来：第一颗蛋第一次扔在第 $f(1, 13) + 1 = 14$ 层——碎了，第二颗从 1 层逐层扔到 13 层，最坏共 $1 + 13 = 14$ 次；没碎，问题变成"2 个蛋、13 次"，往上再跨 13 层到 27 层。依此类推，第一颗蛋的落点是

$$
14,\ 27,\ 39,\ 50,\ 60,\ 69,\ 77,\ 84,\ 90,\ 95,\ 99,\ 100
$$

间隔 14、13、12……逐次减 1——**每多扔一次第一颗蛋，就要给第二颗蛋少留一次**，所以步长必须递减，最坏情况才处处等于 14。

## 延伸

- **常见错误：等距跳**。每 10 层扔一次，最坏是在 100 层才碎、再从 91 扔到 99，共 $10 + 9 = 19$ 次；遍历所有等距步长，最好也是 **19**。等距的问题是第一颗蛋扔得越多，留给第二颗的活没有同步减少。
- **$k$ 个蛋、100 层**：$k = 1, 2, 3, 4, 5, 6, 7$ 时分别需要 100、14、9、8、7、7、7 次。$k \ge 7$ 后就是二分，$\lceil \log_2 101 \rceil = 7$——蛋多到用不完，$f(k, m) = 2^m - 1$。
- **规模感**：1000 层时 2 个蛋要 45 次、3 个蛋要 19 次。一般 $f(2, m) \sim m^2/2$，所以 2 个蛋约 $\sqrt{2N}$ 次；$k$ 个蛋约 $(k!\,N)^{1/k}$ 次。
- **正向 DP 也能做**：$W(k, n) = 1 + \min_x \max\bigl(W(k-1, x-1),\ W(k, n-x)\bigr)$，结果与上面一致，但慢一个量级——面试里写出倒过来的版本是加分项。
- **同一个"数结果序列"**：[毒酒与小白鼠](poison-wine.md)问 $m$ 只老鼠能区分多少瓶——每只老鼠死或不死是一位，$m$ 位最多区分 $2^m$ 种情况。蛋题是同一招，只是"碎"的次数被 $k$ 限住，于是 $2^m$ 缩成 $\sum_{i \le k} \binom{m}{i}$。

??? note "数值验证"

    ```python
    from math import comb
    from functools import lru_cache

    def floors(k, m):
        """k 个蛋、m 次扔最多能测多少层。"""
        return sum(comb(m, i) for i in range(1, k + 1))

    def need(k, N):
        m = 0
        while floors(k, m) < N:
            m += 1
        return m

    print(floors(2, 13), floors(2, 14))            # 91 105
    print([need(k, 100) for k in range(1, 9)])     # [100, 14, 9, 8, 7, 7, 7, 7]
    print(need(2, 1000), need(3, 1000))            # 45 19

    @lru_cache(None)
    def worst(k, n):
        """经典 minimax DP：k 个蛋、n 层未知时最坏要扔几次。"""
        if n == 0: return 0
        if k == 1: return n
        return 1 + min(max(worst(k - 1, x - 1), worst(k, n - x)) for x in range(1, n + 1))

    print([worst(k, 100) for k in range(1, 8)])    # [100, 14, 9, 8, 7, 7, 7]

    # 两蛋最优方案的第一颗蛋落点（最后一个截到 100）
    s, plan = 0, []
    for step in range(14, 0, -1):
        s += step
        plan.append(s)
        if s >= 100: break
    print(plan)   # [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 102]

    def worst_equal_step(step, N=100):
        """第一颗蛋每隔 step 层扔一次，破了再从上一个安全层逐层往上。"""
        w = 0
        for t in range(N + 1):                      # t = 最高安全层
            drops, lo, x = 0, 0, step
            while True:
                x = min(x, N); drops += 1
                if x > t: break
                lo = x
                if x == N: break
                x += step
            if t < N:
                hi = x - 1
                drops += min(t, hi) - lo + (t < hi)
            w = max(w, drops)
        return w

    print(worst_equal_step(10))                    # 19
    print(min(worst_equal_step(s) for s in range(1, 101)))   # 19
    ```
