---
description: "圆上 $n$ 个随机点落在同一半圆的概率 $n/2^{n-1}$；技巧是指定领头点，$n$ 个互斥事件直接相加"
---

# 圆上 n 点落在同一半圆

## 题

在圆周上独立均匀地取 $n$ 个点。它们全部落在某一个半圆内的概率是多少？$n = 3$ 时呢？

## 一句话

**$n/2^{n-1}$**，$n=3$ 时是 **$3/4$**——给每个点一次当"领头点"的机会，$n$ 个事件互斥、各占 $1/2^{n-1}$，直接相加。

## 关键技巧

"存在某个半圆"是一个对连续参数的"存在"，没法直接算。把它**离散化成有限个互斥事件**：

- 事件 $E_i$：从点 $i$ 出发**顺时针**走半圈，这个半圆盖住了其余所有点。
- 若所有点在某个半圆内，把这个半圆逆时针转到它的起点碰上某个点为止——那个点就是领头点，所以 $\bigcup_i E_i$ 正是目标事件。
- 领头点唯一（概率 1）：若 $E_i$、$E_j$ 同时成立，$j$ 在 $i$ 的顺时针半圈里、$i$ 又在 $j$ 的顺时针半圈里，只能是两点恰好相对，概率为 0。
- 固定点 $i$，其余 $n-1$ 个点各自以 $\frac12$ 落进它的顺时针半圈，独立：$P(E_i) = 2^{-(n-1)}$。

$$
P = \sum_{i=1}^{n} P(E_i) = \frac{n}{2^{n-1}}
$$

## 解

$n = 3$：$P = 3/4$。反过来，三个点**不**在同一半圆 ⇔ 三角形包含圆心，所以

$$
P(\text{随机内接三角形包含圆心}) = 1 - \frac34 = \frac14
$$

$n$ 增大时概率指数衰减，$n = 2$ 平凡地等于 1：

```echarts
{
  "height": 300,
  "grid": {"left": 55, "right": 30, "top": 40, "bottom": 40},
  "xAxis": {"type": "category", "name": "点数 n", "nameLocation": "middle", "nameGap": 26,
            "data": ["2","3","4","5","6","7","8","9","10"]},
  "yAxis": {"type": "value", "name": "P(同一半圆)", "max": 1},
  "series": [{
    "type": "line", "symbolSize": 8,
    "itemStyle": {"color": "#4e79a7"},
    "label": {"show": true, "position": "top", "fontSize": 11},
    "data": [1, 0.75, 0.5, 0.3125, 0.1875, 0.1094, 0.0625, 0.0352, 0.0195]
  }]
}
```

## 延伸

- **Wendel 定理**：$d$ 维空间里单位球面 $S^{d-1}$ 上 $n$ 个关于原点对称分布的随机点（均匀分布即可），全部落在某个半球的概率是

    $$
    p_{n,d} = \frac{1}{2^{n-1}} \sum_{k=0}^{d-1} \binom{n-1}{k}
    $$

    $d = 2$ 回到 $\frac{1 + (n-1)}{2^{n-1}} = \frac{n}{2^{n-1}}$。$n \le d$ 时恒为 1；$n = 2d$ 时恰好 $\frac12$（二项式系数对称），圆上 4 点的 $\frac12$ 就是它。
- **球面 4 点同一半球：$7/8$**。$d=3$、$n=4$：$\frac{1 + 3 + 3}{8} = \frac78$。
- **四面体包含球心：$1/8$**（Putnam 1992 A6）。4 点不在同一半球 ⇔ 凸包包含球心，所以是 $1 - \frac78$。原题解法更漂亮：先随机取 3 条过球心的直径和第 4 个点，每条直径两个端点任选一个，$2^3 = 8$ 种组合里**恰好一种**让四面体包含球心。平面版同理——2 条直径 + 1 点，4 种组合恰一种，于是 $\frac14$。
- **和断棍是同一道题**：$n$ 个点把圆切成 $n$ 段弧，全部在同一半圆 ⇔ 某段空弧 $\ge \frac12$。沿任一点剪开，就是一根被切 $n-1$ 刀的棍子——[断棍成三角形](broken-stick-triangle.md)里 $n$ 段围不成多边形的概率同样是 $n/2^{n-1}$。
- **常见错误**：固定第一个点当领头，答成 $1/2^{n-1}$——漏了领头点可以是任何一个。反过来把 $n$ 个事件相加前不检查互斥，会在别的题上重复计数；这里能加，全靠领头点唯一。

??? note "数值验证"

    Wendel 公式精确值 + 圆、球面蒙特卡洛：

    ```python
    from fractions import Fraction as F
    from math import comb, sqrt
    import random

    def wendel(n, d):
        """d 维单位球面上 n 个随机点全落在某个半球的概率。"""
        return F(sum(comb(n - 1, k) for k in range(d)), 2 ** (n - 1))

    print([str(wendel(n, 2)) for n in range(2, 7)])       # ['1', '3/4', '1/2', '5/16', '3/16']
    print(wendel(3, 2), wendel(4, 3), 1 - wendel(4, 3))   # 3/4 7/8 1/8

    random.seed(3)
    T = 400000
    def circle_in_semi(n):
        a = sorted(random.random() for _ in range(n))
        gaps = [b - x for x, b in zip(a, a[1:])] + [1 - a[-1] + a[0]]
        return max(gaps) > 0.5                            # 有一段空弧超过半圈
    for n in (3, 4, 5):
        print(n, float(wendel(n, 2)), sum(circle_in_semi(n) for _ in range(T)) / T)
    # 3 0.75 0.75024 | 4 0.5 0.49945 | 5 0.3125 0.312245

    def sphere_pt():
        v = [random.gauss(0, 1) for _ in range(3)]
        r = sqrt(sum(x * x for x in v))
        return [x / r for x in v]
    def det3(a, b, c):
        return (a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0]))
    def tetra_has_center():
        p = [sphere_pt() for _ in range(4)]
        # 原点 = sum λ_i p_i 且 λ 同号 ⇔ 原点在四面体内；由 Cramer 法则 λ_i ∝ (-1)^i det(去掉 p_i)
        s = [det3(*[p[j] for j in range(4) if j != i]) * (-1) ** i for i in range(4)]
        return all(x > 0 for x in s) or all(x < 0 for x in s)
    print(1/8, sum(tetra_has_center() for _ in range(T)) / T)   # 0.125 0.12483

    def tri_has_center():
        a = sorted(random.random() for _ in range(3))
        return max(a[1]-a[0], a[2]-a[1], 1-a[2]+a[0]) < 0.5
    print(1/4, sum(tri_has_center() for _ in range(T)) / T)     # 0.25 0.2505275
    ```
