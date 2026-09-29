---
description: "随机排列的不动点期望恰为 1、方差也是 1，与 $n$ 无关；指示变量 + 期望线性性，分布趋于 Poisson(1)"
---

# 随机排列的不动点

## 题

$n$ 个人把帽子扔进一堆，再每人随机拿回一顶（即 $1, \ldots, n$ 的均匀随机排列）。拿回自己帽子的人数 $X$ 期望是多少？方差呢？没有一个人拿对的概率是多少？

## 一句话

**$E[X] = 1$，$\mathrm{Var}(X) = 1$，不管 $n$ 是 3 还是一百万**；没人拿对的概率趋于 $1/e \approx 0.368$，而且收敛快得离谱——$n = 10$ 时误差已经只有 $2 \times 10^{-8}$。

## 关键技巧

**拆成指示变量，别碰分布。** 令 $I_i = [\sigma(i) = i]$，则 $X = \sum_i I_i$。每个人拿对的概率是 $1/n$，**期望线性性不要求独立**：

$$
E[X] = \sum_{i=1}^n P(\sigma(i) = i) = n \cdot \frac1n = 1
$$

方差要二阶矩，还是指示变量。$X(X-1)$ 数的是有序对 $(i, j)$、$i \ne j$、两人都拿对：

$$
E[X(X-1)] = n(n-1) \cdot P(\sigma(i) = i, \sigma(j) = j) = n(n-1) \cdot \frac{1}{n(n-1)} = 1
$$

于是 $E[X^2] = 2$，$\mathrm{Var}(X) = 2 - 1^2 = 1$（$n \ge 2$）。

同样的计算推到 $m$ 阶：$E\bigl[X(X-1)\cdots(X-m+1)\bigr] = 1$ 对所有 $m \le n$ 成立——这正是 Poisson(1) 的阶乘矩。**前 $n$ 阶矩和 Poisson(1) 完全一致**，分布收敛到 Poisson(1) 是顺理成章的事。

## 解

期望与方差如上，都是 1。

恰有 $k$ 人拿对：先选这 $k$ 人，其余 $n-k$ 人全部错排。容斥给出错排数 $D_m = m!\sum_{j=0}^m \frac{(-1)^j}{j!}$，于是

$$
P(X = k) = \frac{1}{k!} \sum_{j=0}^{n-k} \frac{(-1)^j}{j!} \;\xrightarrow{n \to \infty}\; \frac{e^{-1}}{k!}
$$

没人拿对：$P(X=0) = \sum_{j=0}^n \frac{(-1)^j}{j!}$，是 $e^{-1}$ 泰勒级数的部分和，误差不超过 $\frac{1}{(n+1)!}$。$n=4$ 时 $3/8 = 0.375$，$n=10$ 时 $16481/44800 = 0.3678794\ldots$，与 $1/e = 0.3678794\ldots$ 到小数点后 7 位都一样。

## 延伸

- **期望圈数是 $H_n$**：排列拆成若干个圈，不动点就是长度 1 的圈。元素 $i$ 所在圈的长度 $L_i$ 在 $1, \ldots, n$ 上均匀分布，圈数 $= \sum_i \frac{1}{L_i}$（每个长 $\ell$ 的圈被它的 $\ell$ 个成员各记 $\frac1\ell$），所以 $E[\text{圈数}] = n \cdot \frac1n \sum_{\ell=1}^n \frac1\ell = H_n$。同一个调和级数在 [集卡问题](coupon-collector.md) 里也出现；[面条打结成圈](noodle-loops.md) 是它的"奇数版"$\sum \frac{1}{2k-1}$。
- **长 $\ell$ 的圈期望个数恰好是 $1/\ell$**（$\ell \le n$），$\ell = 1$ 就回到 $E[X] = 1$。
- **没人拿对与恰一人拿对几乎等概率**：$P(X = 0)$ 与 $P(X = 1)$ 在 $n$ 有限时只差 $\frac{(-1)^n}{n!}$，$n = 10$ 时两者都是 $0.36788$，肉眼无法分辨。
- **常见错误**：以为"人越多越容易有人拿对"或"越难有人拿对"。两种直觉都错——$n$ 变大时每人命中率 $1/n$ 变小，但人数 $n$ 变多，两者恰好抵消。
- **同款技巧**：随机图的三角形个数、字符串中某模式的出现次数、生日问题里的同日对数，都是"指示变量求和 + 线性性"一步出期望，再用二阶阶乘矩算方差。

??? note "数值验证"

    小 $n$ 全排列枚举得精确矩与圈数，公式核对 Poisson 极限，$n = 52$（一副牌）蒙特卡洛：

    ```python
    from fractions import Fraction as F
    import itertools, math, random

    def stats(n):
        """枚举全部 n! 个排列：不动点分布、各阶矩、平均圈数。"""
        cnt, cyc = [0] * (n + 1), 0
        for p in itertools.permutations(range(n)):
            cnt[sum(p[i] == i for i in range(n))] += 1
            seen = [False] * n
            for i in range(n):
                if not seen[i]:
                    cyc += 1
                    while not seen[i]: seen[i] = True; i = p[i]
        N = math.factorial(n)
        d = [F(c, N) for c in cnt]
        mom = [int(sum(k ** m * d[k] for k in range(n + 1))) for m in (1, 2, 3, 4)]  # 恰为整数
        return d, mom, F(cyc, N)

    for n in (3, 4, 8):
        d, mom, cyc = stats(n)
        print(n, mom, mom[1] - mom[0] ** 2, cyc)
    # 3 [1, 2, 5, 14] 1 11/6
    # 4 [1, 2, 5, 15] 1 25/12
    # 8 [1, 2, 5, 15] 1 761/280

    def p_k(n, k):
        """恰有 k 个不动点：选 k 个固定，其余错排。"""
        return F(1, math.factorial(k)) * sum(F((-1) ** j, math.factorial(j)) for j in range(n - k + 1))

    print(p_k(4, 0), p_k(10, 0), float(p_k(10, 0)) - math.exp(-1))
    # 3/8 16481/44800 2.3114271940904985e-08
    print([round(float(p_k(10, k)), 5) for k in range(5)])
    print([round(math.exp(-1) / math.factorial(k), 5) for k in range(5)])
    # [0.36788, 0.36788, 0.18394, 0.06131, 0.01534]
    # [0.36788, 0.36788, 0.18394, 0.06131, 0.01533]

    random.seed(1)
    T, n, tot, zero = 200000, 52, 0, 0
    for _ in range(T):
        p = list(range(n)); random.shuffle(p)
        f = sum(p[i] == i for i in range(n)); tot += f; zero += f == 0
    print(tot / T, zero / T)                      # 0.99857 0.36842
    ```
