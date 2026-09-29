---
description: "公平赌局从 $i$ 出发先到 $N$ 的概率 $i/N$、期望步数 $i(N-i)$；对 $S_n$ 与 $S_n^2-n$ 两个鞅用可选停时定理"
---

# 赌徒破产

## 题

赌徒有 $i$ 元，每局押 1 元，赢输各 $\frac12$。输光（到 0）或赢到 $N$ 元就离场。先到 $N$ 的概率是多少？平均要赌多少局？如果每局赢的概率是 $p \ne \frac12$ 呢？

## 一句话

**公平赌局里 $P(\text{先到 } N) = i/N$，期望局数 $i(N-i)$**——公平游戏的"钱数期望不变"直接给出第一个，"钱数平方减局数期望不变"给出第二个。

## 关键技巧

**找鞅，停下来，期望守恒。** 记 $S_n$ 为第 $n$ 局后的钱数，$\tau$ 为首次到 0 或 $N$ 的时刻。

- **$S_n$ 是鞅**：每局期望增量为 0。
- **$S_n^2 - n$ 是鞅**：$E[S_{n+1}^2 \mid S_n] = \frac12(S_n+1)^2 + \frac12(S_n-1)^2 = S_n^2 + 1$，每局平方恰好涨 1，减掉 $n$ 就守恒。

可选停时定理（optional stopping）：$\tau$ 几乎必然有限且 $E[\tau] < \infty$、鞅增量有界时，$E[M_\tau] = M_0$。这里 $S_n$ 始终夹在 $[0, N]$ 里，$\tau$ 有几何尾，条件都满足。

**不公平时换一个鞅。** 令 $r = q/p$，$q = 1-p$，则 $r^{S_n}$ 是鞅：$E[r^{S_{n+1}} \mid S_n] = r^{S_n}(p r + q r^{-1}) = r^{S_n}(q + p) = r^{S_n}$。另一个鞅是 $S_n - (p-q)n$，负责期望时间。

## 解

**概率。** 设 $P = P(S_\tau = N)$。对 $S_n$ 用可选停时：

$$
E[S_\tau] = N \cdot P + 0 \cdot (1-P) = i \quad\Longrightarrow\quad P = \frac{i}{N}
$$

**时间。** 对 $S_n^2 - n$ 用可选停时：

$$
E[S_\tau^2] - E[\tau] = i^2, \qquad E[S_\tau^2] = N^2 \cdot \frac iN = iN
$$

$$
E[\tau] = iN - i^2 = i(N - i)
$$

$i = 50$、$N = 100$：胜率 $\frac12$，平均要赌 **2500** 局——从中间出发，走到边界的时间是距离乘积，而不是距离。

**不公平情形**（$p \ne q$，$r = q/p$）：

$$
P_i = \frac{1 - r^i}{1 - r^N}, \qquad E[\tau_i] = \frac{i - N P_i}{q - p}
$$

美式轮盘押红，$p = \frac{18}{38}$：

| 起点 $i$ | 目标 $N$ | 翻倍概率 | 期望局数 |
| --- | --- | --- | --- |
| 10 | 20 | 25.9% | 91.8 |
| 50 | 100 | 0.51% | 940.3 |
| 100 | 200 | 0.0027% | 1899.9 |

**每局赢面只比公平少 2.6 个百分点，规模一放大就几乎必输**——$r = 10/9$，$r^N$ 随目标 $N$ 指数增长。

## 延伸

- **一把梭哈更好**：同样想从 10 翻到 20，逐元押的胜率 25.9%，一次押 10 元的胜率 $\frac{18}{38} \approx 47.4\%$。劣势赌局里**少赌几局**才是上策（bold play）；优势赌局正相反。
- **可选停时不能乱用**：公平赌局里"赢 1 元就走，没有下限"，$\tau$ 几乎必然有限、$S_\tau = i+1$，看似 $E[S_\tau] \ne i$——矛盾出在 $E[\tau] = \infty$，定理条件不成立。倍投法（martingale betting）"必赢"的错觉也倒在这里：需要无限本金和无限时间。
- **一维随机游走常返**：$N \to \infty$ 时破产概率 $1 - i/N \to 1$——公平赌徒对上无限本金的庄家必然输光，但期望局数 $i(N-i) \to \infty$。**必然回到原点，但回来的期望时间是无穷。**
- **高维**：Pólya 定理——二维简单随机游走也常返，三维起非常返，三维回到原点的概率约 $0.3405$。"醉汉总能走回家，醉鸟未必。"
- **和 HH 等待的鞅对照**：[等 HH 与等 HT](hh-vs-ht.md) 用的是同一招——构造一个公平游戏，在停时处结算期望。那边的鞅是"一群赌徒的总身家减去总投入"，这边是钱数本身。
- **状态递推视角**：不用鞅也行，$P_i = \frac12 P_{i+1} + \frac12 P_{i-1}$ 说明 $P_i$ 是线性函数，边界 $P_0 = 0$、$P_N = 1$ 定出 $i/N$；$E_i = 1 + \frac12 E_{i+1} + \frac12 E_{i-1}$ 的二阶差分恒为 $-2$，是抛物线 $i(N-i)$。

??? note "数值验证"

    三对角方程精确解核对闭式，蒙特卡洛核对公平与轮盘两种情形，最后算三维返回概率：

    ```python
    from fractions import Fraction as F
    import random

    def exact(N, p):
        """解三对角方程：P_i = p P_{i+1} + q P_{i-1}，E_i = 1 + p E_{i+1} + q E_{i-1}。打靶法，Fraction 精确。"""
        q = 1 - p
        def shoot(rhs, x0, xN):
            def run(s):
                x = [x0, s]
                for i in range(1, N): x.append((x[i] - rhs - q * x[i - 1]) / p)
                return x
            a, b = run(F(0)), run(F(1))                  # 解对初值 s 线性
            return run((xN - a[N]) / (b[N] - a[N]))
        return shoot(F(0), F(0), F(1)), shoot(F(1), F(0), F(0))

    P, E = exact(10, F(1, 2))
    print(all(P[i] == F(i, 10) and E[i] == i * (10 - i) for i in range(11)))   # True

    def closed(i, N, p):
        q = 1 - p; r = q / p
        P = (1 - r ** i) / (1 - r ** N)
        return P, (F(i) - N * P) / (q - p)

    p = F(18, 38)                                        # 美式轮盘押红
    P, E = exact(20, p)
    print(closed(10, 20, p) == (P[10], E[10]), float(P[10]), float(E[10]))
    # True 0.258533412956573 91.75730307650225
    for i, N in [(50, 100), (100, 200)]:
        print(i, N, [float(x) for x in closed(i, N, p)])
    # 50 100 [0.00512734999802106, 940.25803500376]
    # 100 200 [2.656069339841539e-05, 1899.899069365086]

    def sim(i, N, p, T=100000):
        win = steps = 0
        for _ in range(T):
            x = i
            while 0 < x < N: x += 1 if random.random() < p else -1; steps += 1
            win += x == N
        return win / T, steps / T

    random.seed(11); print(sim(3, 10, 0.5))              # (0.30194, 20.99194)
    random.seed(12); print(sim(10, 20, 18 / 38))         # (0.25999, 91.86592)

    import math
    g = math.gamma                                       # 3D 简单随机游走：Watson 积分的闭式
    u = math.sqrt(6) / (32 * math.pi ** 3) * g(1 / 24) * g(5 / 24) * g(7 / 24) * g(11 / 24)
    print(u, 1 - 1 / u)                                  # 1.516386059151978 0.34053732955099913  回到原点的概率
    ```
