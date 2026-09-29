---
description: "集齐 $n$ 种卡期望 $nH_n$，骰子六面全出约 14.7 次；拆成 $n$ 段几何分布再用期望线性性"
---

# 集卡问题：骰子掷几次六面全出

## 题

一颗公平骰子反复掷，直到 1 到 6 每个点数都至少出现过一次。平均要掷几次？一般地，$n$ 种卡片等概率随机抽，集齐一套的期望抽数是多少？

## 一句话

**$E[T] = n H_n = n\left(1 + \frac12 + \cdots + \frac1n\right)$，骰子是 $6 H_6 = 14.7$ 次**——难的从来不是前几种，而是最后一种：光等最后一面就要平均 6 次。

## 关键技巧

**按"已集到几种"切段。** 手里已有 $j$ 种时，下一抽是新卡的概率是 $\frac{n-j}{n}$，所以这一段的长度 $G_j$ 服从几何分布，期望 $\frac{n}{n-j}$。总时间是 $n$ 段之和：

$$
T = G_0 + G_1 + \cdots + G_{n-1}
$$

**期望线性性**直接相加，不用管各段的依赖：

$$
E[T] = \sum_{j=0}^{n-1} \frac{n}{n-j} = n \sum_{k=1}^{n} \frac1k = n H_n
$$

各段其实还相互独立（无记忆性），所以方差也能直接加：

$$
\mathrm{Var}(T) = \sum_{j=0}^{n-1} \frac{1 - p_j}{p_j^2} = n^2 \sum_{k=1}^n \frac{1}{k^2} - n H_n, \qquad p_j = \frac{n-j}{n}
$$

## 解

$$
E[T] = 6 \left(1 + \tfrac12 + \tfrac13 + \tfrac14 + \tfrac15 + \tfrac16\right) = 6 \cdot \frac{49}{20} = \frac{147}{10} = 14.7
$$

六段依次是 $1, 1.2, 1.5, 2, 3, 6$——**最后两段占了 9 次**，占总数六成。

分布很宽：$\mathrm{Var}(T) = 38.99$，标准差约 6.24。中位数是 **13**（$P(T \le 12) = 0.438$，$P(T \le 13) = 0.514$），均值被右尾拉到 14.7；20 次内集齐的概率 0.848，30 次内 0.975。6 次就恰好集齐的概率是 $6!/6^6 = 5/324 \approx 1.5\%$。

## 延伸

- **$n \ln n$ 量级**：$nH_n = n\ln n + \gamma n + \tfrac12 + O(1/n)$。$n = 100$ 时是 518.7，$n=1000$ 时 7485.5——比"每种抽一次"多出 $\ln n$ 倍。
- **集中与 Gumbel 尾**：$T / (n \ln n) \to 1$，涨落量级是 $n$ 而不是 $n \ln n$。更精确地 $P(T \le n\ln n + cn) \to e^{-e^{-c}}$，$c=0$ 时约 $0.368$（$n=1000$ 精确值 0.367）。和 [最长连正](longest-head-run.md) 一样，极值问题的极限又是 Gumbel。
- **集齐两套**：骰子每面都出现至少两次，期望 $\frac{390968681}{16200000} \approx 24.13$ 次，远少于 $2 \times 14.7 = 29.4$——集第一套时顺手攒下的重复卡已经填了第二套的大半。状态取"一次没出的面数、恰出一次的面数"做两维递推即可。
- **常见错误**：把"期望 14.7 次"说成"掷 15 次大概率集齐"——实际 15 次内集齐的概率只有约 64%。期望在右偏分布里偏高于中位数。
- **同构问题**：随机哈希填满所有桶、随机测试覆盖所有分支、[随机排列的圈数](fixed-points.md) 的 $H_n$，都是同一个调和级数在不同地方露头。

??? note "数值验证"

    精确期望、方差、分布、两套的二维递推，加蒙特卡洛：

    ```python
    from fractions import Fraction as F
    from functools import lru_cache
    import math, random

    H = lambda n, s=1: sum(F(1, k ** s) for k in range(1, n + 1))
    n = 6
    E, V = n * H(n), n * n * H(n, 2) - n * H(n)
    print(E, float(V), math.sqrt(V))            # 147/10 38.99 6.244197306299665

    def cdf(n, K):
        """P(T <= k)，状态 = 已见过的面数。"""
        st = [F(0)] * (n + 1); st[0] = F(1); out = []
        for _ in range(K):
            new = [F(0)] * (n + 1)
            for j, v in enumerate(st):
                new[j] += v * F(j, n)
                if j < n: new[j + 1] += v * F(n - j, n)
            st = new; out.append(st[n])
        return out

    c = cdf(6, 30)
    print(c[5], [round(float(c[k - 1]), 3) for k in (12, 13, 20, 30)])
    # 5/324 [0.438, 0.514, 0.848, 0.975]

    @lru_cache(None)
    def two_sets(a, b):
        """集齐两套：a = 一次没出的面数，b = 恰出一次的面数。"""
        if a == b == 0: return F(0)
        r = F(1)
        if a: r += F(a, n) * two_sets(a - 1, b + 1)
        if b: r += F(b, n) * two_sets(a, b - 1)
        return r / F(a + b, n)

    print(two_sets(6, 0), float(two_sets(6, 0)))   # 390968681/16200000 24.133869197530863

    for m in (10, 100, 1000):
        print(m, round(float(m * H(m)), 3), round(m * math.log(m) + 0.5772156649 * m + 0.5, 3))
    # 10 29.29 29.298 / 100 518.738 518.739 / 1000 7485.471 7485.471

    random.seed(3)
    T, t1, t2 = 200000, 0, 0
    for _ in range(T):
        cnt, k, one = [0] * 6, 0, None
        while min(cnt) < 2:
            cnt[random.randrange(6)] += 1; k += 1
            if one is None and min(cnt) >= 1: one = k
        t1 += one; t2 += k
    print(t1 / T, t2 / T)                        # 14.69647 24.126675
    ```
