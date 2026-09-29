---
description: "均匀随机数累加到超过 1 平均要 $e$ 个；$P(N>n)=1/n!$ 是单纯形体积，再套尾和公式"
---

# 均匀随机数累加超过 1

## 题

不断从 $U(0,1)$ 独立抽数累加，记 $N$ 为累加和首次超过 1 时用掉的个数。$E[N]$ 是多少？

## 一句话

**$E[N] = e \approx 2.718$**——$N > n$ 等价于前 $n$ 个数之和不超过 1，概率是 $n$ 维单纯形的体积 $1/n!$，尾和一加就是 $e$ 的级数。

## 关键技巧

**一、算尾概率，不算点概率。** 对取正整数值的 $N$：

$$
E[N] = \sum_{n \ge 0} P(N > n)
$$

与 [最长连正](longest-head-run.md) 里用的是同一个尾和公式——凡是"首次达到"类的停时，$P(N > n)$ 往往比 $P(N = n)$ 好算得多。

**二、$P(N > n)$ 是单纯形体积。** $N > n$ 当且仅当 $U_1 + \cdots + U_n \le 1$，即点 $(U_1, \ldots, U_n)$ 落在单纯形 $\{x_i \ge 0,\ \sum x_i \le 1\}$ 里。它的体积：

$$
\mathrm{Vol} = \int_0^1 \frac{(1-x)^{n-1}}{(n-1)!}\, dx = \frac{1}{n!}
$$

对称论证更快——单位立方体被 $n!$ 种坐标排序等分，单纯形体积恰好是其中一份（映射 $y_k = x_1 + \cdots + x_k$ 把单纯形变成 $0 \le y_1 \le \cdots \le y_n \le 1$，雅可比为 1）。

## 解

$$
E[N] = \sum_{n=0}^{\infty} \frac{1}{n!} = e
$$

$n=0$ 项是 $P(N > 0) = 1$，$n=1$ 项是 $P(U_1 \le 1) = 1$，之后 $\frac12, \frac16, \ldots$。$N$ 的分布：$P(N = n) = \frac{1}{(n-1)!} - \frac{1}{n!} = \frac{n-1}{n!}$，$N = 2$ 占一半，$N = 3$ 占三分之一。

方差也顺手：$E[N^2] = \sum_{n\ge0}(2n+1)P(N>n) = 3e$，$\mathrm{Var}(N) = 3e - e^2 \approx 0.766$。

## 延伸

- **超过 $t \le 1$**：同样的单纯形缩放 $t$ 倍，$P(N_t > n) = t^n / n!$，$E[N_t] = e^t$。
- **超过一般的 $t$**：更新理论给出闭式 $E[N_t] = \sum_{k=0}^{\lfloor t \rfloor} \frac{(-1)^k (t-k)^k}{k!} e^{t-k}$。$t=2$ 时 $e^2 - e \approx 4.671$，$t = 10$ 时 $20.667$。大 $t$ 下 $E[N_t] \approx 2t + \frac23$——由 Wald 恒等式 $\frac12 E[N_t] = t + E[\text{过冲}]$，而过冲的极限均值是 $\frac{E[U^2]}{2E[U]} = \frac13$。
- **Wald 恒等式验收**：$E[S_N] = E[N] \cdot E[U] = e/2 \approx 1.359$——停下来时平均超过 1 大约 0.36。
- **同分布的另一道题**：抽 $U_1, U_2, \ldots$ 直到首次出现下降（$U_{k} < U_{k-1}$），$N$ 是这个位置。$N > n$ 等价于前 $n$ 个严格递增，概率同样是 $1/n!$，于是期望同样是 $e$。两题共用一个"$n!$ 种排序等分"。
- **常见错误**：以为"均值 $\frac12$，两个就到 1"，答 2。$E[N]$ 看的是停时，右尾（有时要 4 个、5 个）把期望推到 $e$。

??? note "数值验证"

    尾和的精确有理数、闭式更新函数、蒙特卡洛（含 Wald 验收和"首次下降"版本）：

    ```python
    from fractions import Fraction as F
    import math, random

    # P(N > n) = P(U1 + ... + Un <= 1) = 1/n!   （单纯形体积）
    E  = sum(F(1, math.factorial(n)) for n in range(25))              # 尾和：E[N] = sum P(N > n)
    E2 = sum(F(2 * n + 1, math.factorial(n)) for n in range(25))      # E[N^2] = sum (2n+1) P(N > n)
    print(float(E), math.e)                     # 2.718281828459045 2.718281828459045
    print(float(E2 - E * E), 3 * math.e - math.e ** 2)   # 0.7657893864464855 0.7657893864464862

    def m(t):
        """首次超过 t 的期望次数（更新函数的闭式）。"""
        return sum((-1) ** k * (t - k) ** k / math.factorial(k) * math.exp(t - k)
                   for k in range(math.floor(t) + 1))
    print([round(m(t), 4) for t in (0.5, 1, 2, 3, 10)])
    # [1.6487, 2.7183, 4.6708, 6.6666, 20.6667]  ->  2t + 2/3

    random.seed(2024)
    T, tot, sq, over = 10 ** 6, 0, 0, 0.0
    for _ in range(T):
        s, k = 0.0, 0
        while s <= 1: s += random.random(); k += 1
        tot += k; sq += k * k; over += s
    print(tot / T, sq / T - (tot / T) ** 2, over / T)
    # 2.718477 0.7668338004709989 1.358733950107968   （E[S_N] = e/2 = 1.3591）

    random.seed(5)
    T, tot = 10 ** 6, 0
    for _ in range(T):
        prev, k = random.random(), 1
        while True:
            x = random.random(); k += 1
            if x < prev: break
            prev = x
        tot += k
    print(tot / T)                              # 2.718442   首次下降的位置，期望同样是 e
    ```
