---
description: "$n$ 根面条端点随机两两相接，期望圈数 $\\sum_{k=1}^n \\frac{1}{2k-1}$，100 根约 3.28；每接一次面条数减 1，逐步递推"
---

# 面条打结成圈

## 题

一碗里有 $n$ 根面条，共 $2n$ 个端点。每次随机抓两个端点接在一起，直到没有自由端点。最终形成的圈数期望是多少？$n = 100$ 时呢？

## 一句话

**$E[L_n] = 1 + \frac13 + \frac15 + \cdots + \frac{1}{2n-1}$，$n=100$ 约 3.28 个圈**——每接一次，面条数恰好减 1，只有"恰好接到自己另一端"才多一个圈，概率 $\frac{1}{2k-1}$。

## 关键技巧

**不看全局，只看一步。** 当前有 $k$ 根（可能已被接长的）面条、$2k$ 个自由端。随便拿起一端，它会接到其余 $2k-1$ 个端点中的某一个：

- 以 $\frac{1}{2k-1}$ 的概率接到**自己的另一端**——闭成一个圈，从碗里拿走，剩 $k-1$ 根。
- 以 $\frac{2k-2}{2k-1}$ 的概率接到**别的面条**——两根并成一根更长的，也剩 $k-1$ 根。

两种情况面条数都减 1，区别只在是否多一个圈。于是圈数是 $n$ 个独立指示变量之和：

$$
L_n = \sum_{k=1}^{n} B_k, \qquad B_k \sim \mathrm{Bernoulli}\!\left(\tfrac{1}{2k-1}\right)
$$

**期望线性性**直接给出答案。"一步化归到 $k-1$ 的同型问题"是这类题的通用钥匙——关键在于选对状态（面条根数），让每一步的转移只依赖 $k$。

## 解

$$
E[L_n] = \sum_{k=1}^n \frac{1}{2k-1} = H_{2n} - \tfrac12 H_n \approx \tfrac12 \ln n + \ln 2 + \tfrac{\gamma}{2}
$$

小 $n$：$E[L_1] = 1$，$E[L_2] = \frac43$，$E[L_3] = \frac{23}{15}$。$n = 100$：

$$
E[L_{100}] = 3.28434\ldots
$$

渐近式给 $3.28434$，几乎分毫不差。独立性还送了方差：$\mathrm{Var}(L_n) = \sum_k \frac{1}{2k-1}\left(1 - \frac{1}{2k-1}\right)$，$n=100$ 时约 2.05（标准差 1.43）。

```echarts
{
  "height": 300,
  "grid": {"left": 55, "right": 30, "top": 40, "bottom": 40},
  "xAxis": {"type": "category", "name": "圈数", "nameLocation": "middle", "nameGap": 26,
            "data": ["1","2","3","4","5","6","7"]},
  "yAxis": {"type": "value", "name": "概率"},
  "series": [{
    "type": "bar", "barWidth": "60%",
    "itemStyle": {"color": "#4e79a7"},
    "data": [0.0887, 0.2297, 0.2792, 0.2141, 0.1171, 0.0490, 0.0164]
  }]
}
```

众数是 3 个圈；**只结成一个大圈**的概率 $\prod_{k=2}^{n} \frac{2k-2}{2k-1} \approx 8.9\%$，渐近 $\sqrt{\pi/(4n)}$。

## 延伸

- **和随机排列的圈数对照**：[随机排列](fixed-points.md) 的期望圈数是 $H_n = \sum \frac1k \approx \ln n$，同样是"每步以 $\frac1k$ 闭圈"的独立 Bernoulli 之和（Feller coupling）。面条每步多出一个"错误端点"可接，闭圈概率降到 $\frac{1}{2k-1}$，圈数只有 $\frac12 \ln n$ 量级——**100 根面条的期望圈数（3.28）比 100 元排列（5.19）少得多**。
- **常见错误**：试图先算"最终结构的分布"再求期望。最终配对有 $(2n-1)!!$ 种，直接数圈数分布很痛苦；按步骤拆成指示变量，一行结束。
- **对数增长**：圈数随 $n$ 只以 $\frac12 \ln n$ 长。1000 根面条也才约 4.44 个圈——绝大多数面条都被卷进少数几个大圈里。
- **为什么可以"随便拿起一端"**：题目说的是随机抓两个端点，但最终结果只是 $2n$ 个端点的一个均匀随机完美配对，与接的顺序无关。于是每一步可以任选一个端点、只让它的配对对象随机——这一步换视角是整道题能拆开的前提。

??? note "数值验证"

    精确和、精确分布（独立 Bernoulli 卷积）、真实随机配对 + 并查集数连通分量：

    ```python
    from fractions import Fraction as F
    import math, random

    E = lambda n: sum(F(1, 2 * k - 1) for k in range(1, n + 1))
    print(E(1), E(2), E(3), float(E(100)))       # 1 4/3 23/15 3.2843421893016345
    print(0.5 * math.log(100) + math.log(2) + 0.5772156649 / 2)   # 3.284340106003991

    n = 100
    var = sum(F(1, 2 * k - 1) - F(1, (2 * k - 1) ** 2) for k in range(1, n + 1))
    one = math.prod(F(2 * k - 2, 2 * k - 1) for k in range(2, n + 1))
    print(float(var), float(one))                # 2.05314161833286 0.0887335397141535

    # 精确分布：圈数 = 独立 Bernoulli(1/(2k-1)) 之和
    d = [F(1)]
    for k in range(1, n + 1):
        p, nd = F(1, 2 * k - 1), [F(0)] * (len(d) + 1)
        for i, v in enumerate(d): nd[i] += v * (1 - p); nd[i + 1] += v * p
        d = nd
    print([round(float(x), 4) for x in d[1:8]])
    # [0.0887, 0.2297, 0.2792, 0.2141, 0.1171, 0.049, 0.0164]

    def loops(n):
        """真的把 2n 个端点随机配对：面条 i 连 2i—2i+1，配对再连一条边，数连通分量。"""
        ends = list(range(2 * n)); random.shuffle(ends)
        parent = list(range(2 * n))
        def find(x):
            while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for a, b in [(2 * i, 2 * i + 1) for i in range(n)] + list(zip(ends[::2], ends[1::2])):
            parent[find(a)] = find(b)
        return len({find(x) for x in range(2 * n)})

    random.seed(42)
    T = 100000
    print(sum(loops(100) for _ in range(T)) / T)  # 3.27892
    ```
