---
description: "随机两刀断成三段能围成三角形的概率 $1/4$；三角不等式 = 每段短于一半，三个坏事件两两互斥"
---

# 断棍成三角形

## 题

一根长为 1 的木棍，在两个独立均匀的随机位置各断一刀，得到三段。这三段能围成三角形的概率是多少？

## 一句话

**$1/4$**——围成三角形等价于"没有一段超过一半"，而"某段超过一半"的三个事件互不相容、各占 $1/4$。

## 关键技巧

**一、把三角不等式翻译成一句话。** 三段 $a + b + c = 1$，$a < b + c$ 等价于 $a < 1 - a$，即 $a < \frac12$。三条不等式合起来：**能围成三角形 ⇔ 最长段 $< \frac12$**。

**二、算坏事件，不算好事件。** 设 $A_i$ = "第 $i$ 段 $\ge \frac12$"。两段不可能同时超过一半，所以 $A_1, A_2, A_3$ 两两互斥：

$$
P(\text{三角形}) = 1 - P(A_1) - P(A_2) - P(A_3)
$$

**三、每个坏事件都是 $1/4$。** 左段 $\ge \frac12$ 等价于两刀都落在右半边，概率 $\left(\frac12\right)^2$。中段和右段看起来不一样，其实一样——两刀切出的三段 $(a, b, c)$ 服从单纯形 $a+b+c=1$ 上的均匀分布，三段地位**完全对称**（spacings 的可交换性）。于是

$$
P(\text{三角形}) = 1 - 3 \cdot \frac14 = \frac14
$$

几何图像：单纯形是一个等边三角形，三条中位线把它切成 4 个全等小三角形，"每段 $< \frac12$"恰好是中间那一个。

## 解

推广到 $n-1$ 刀、$n$ 段，想围成 $n$ 边形，条件同样是最长段 $< \frac12$。第 $i$ 段 $\ge \frac12$ 的概率等于"其余 $n-1$ 个切点都挤在另一半"，即 $\left(\frac12\right)^{n-1}$；$n$ 个坏事件照旧两两互斥：

$$
P(n \text{ 段围成多边形}) = 1 - \frac{n}{2^{n-1}}
$$

| $n$ | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- |
| 概率 | **1/4** | 1/2 | 11/16 | 13/16 |

## 延伸

- **和半圆问题是同一道题**。把棍子首尾粘成一个周长 1 的圆，接口处算一个点，$n-1$ 刀就是圆上 $n$ 个均匀点，$n$ 段就是 $n$ 段弧。"有一段弧 $\ge \frac12$" ⇔ "$n$ 个点落在同一个半圆"——所以本题答案正是 $1 - \frac{n}{2^{n-1}}$，见 [圆上 $n$ 点落在同一半圆](semicircle-points.md)。
- **先断一刀，再把较长那段断一刀**：概率 **$2\ln 2 - 1 \approx 0.386$**。第一刀后较长段 $L$ 在 $[\frac12, 1]$ 上均匀，短段必然 $< \frac12$；在 $L$ 上均匀切一刀，两小段都 $< \frac12$ 的概率是 $\frac{1}{L} - 1$。对 $L$ 平均：$\int_{1/2}^{1} 2\left(\frac1L - 1\right) dL = 2\ln 2 - 1$。
- **先断一刀，再随机挑一段断**：挑中短段（概率 $\frac12$）必败——剩下的长段已经 $\ge \frac12$。所以答案是上一条的一半，**$\ln 2 - \frac12 \approx 0.193$**。两个变体题面只差一个词，答案差一倍，出题时最容易说混。
- **两刀独立 vs 依次断**：原题的两刀同时、独立落下，所以三段对称；依次断的变体破坏了对称性，只能老老实实积分。答案从 $0.25$ 变成 $0.386$ 或 $0.193$，说明"怎么断"这件事本身就是题面。
- **围成锐角三角形**：还要最长边平方小于另两边平方和，概率 $3\ln 2 - 2 \approx 0.0794$——只占能成三角形的 32% 左右。这个积分略繁，下方只给了数值核验。
- **常见错误**：只检查一条三角不等式；或者以为三段的"中段"分布与两端不同，于是分三种情况硬算。单纯形上的对称性是整道题的捷径。

??? note "数值验证"

    网格精确计数（两刀落在 $N$ 等分点上，$N \to \infty$ 逼近 $1/4$）+ 蒙特卡洛核验各变体：

    ```python
    from fractions import Fraction as F
    import math, random

    def poly_ok(pieces):                      # 能围成多边形 ⇔ 最长段 < 总长的一半
        return max(pieces) < 0.5

    def grid(N):
        ok = 0
        for a in range(1, N):
            for b in range(1, N):
                x, y = sorted((a, b))
                ok += 2 * max(x, y - x, N - y) < N
        return F(ok, (N - 1) ** 2)
    for N in (10, 100, 1000):
        print(N, float(grid(N)))              # 0.1481  0.2400  0.2490

    random.seed(2)
    T = 10**6
    def cuts(n):
        c = sorted(random.random() for _ in range(n - 1))
        return [b - a for a, b in zip([0] + c, c + [1])]

    for n in (3, 4, 5, 6):
        mc = sum(poly_ok(cuts(n)) for _ in range(T)) / T
        print(n, 1 - n / 2 ** (n - 1), mc)
    # 3 0.25 0.249797 | 4 0.5 0.499722 | 5 0.6875 0.688013 | 6 0.8125 0.812287

    def longer_then_break():
        x = random.random()
        L = max(x, 1 - x); u = random.random() * L
        return poly_ok([1 - L, u, L - u])
    def random_piece_then_break():
        x = random.random()
        P = x if random.random() < 0.5 else 1 - x; u = random.random() * P
        return poly_ok([1 - P, u, P - u])
    def acute():
        a, b, c = cuts(3)
        m = max(a, b, c)
        return poly_ok([a, b, c]) and m * m < a*a + b*b + c*c - m * m

    print(2 * math.log(2) - 1, sum(longer_then_break() for _ in range(T)) / T)
    # 0.3862943611198906 0.386765
    print(math.log(2) - 0.5, sum(random_piece_then_break() for _ in range(T)) / T)
    # 0.1931471805599453 0.192472
    print(3 * math.log(2) - 2, sum(acute() for _ in range(T)) / T)
    # 0.07944154167983575 0.079585
    ```
