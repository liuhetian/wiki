# 100 次抛硬币的最长连正

## 题

一枚公平硬币连抛 100 次，记 $L$ 为最长的连续正面段长度。$E[L]$ 是多少？

## 一句话

$E[L] = 5.9918\ldots$，几乎就是 $\log_2 100 \approx 6.64$ 减去一个常数 $0.667$——**最长连正随 $n$ 只以对数速度增长**，翻十倍的抛掷次数才换来多约 3.3 的连正。

## 关键技巧

三件事拼起来就够了。

**一、别直接算 $E[L]$，算尾概率。** 对非负整数随机变量，

$$
E[L] = \sum_{k \ge 0} P(L > k) = \sum_{k \ge 1} \bigl(1 - P(L \le k-1)\bigr)
$$

于是问题变成：**100 次抛掷中不出现 $k$ 连正的概率是多少**。

**二、$P(L \le k)$ 有一条两行的 DP。** 状态取"当前结尾的连正长度 $r \in \{0, 1, \ldots, k\}$"，只要没爆表就活着。设 $u_r^{(t)}$ 是抛完 $t$ 次、活着且结尾恰有 $r$ 个正面的概率，则

$$
u_0^{(t+1)} = \tfrac{1}{2}\sum_{r=0}^{k} u_r^{(t)}, \qquad u_{r+1}^{(t+1)} = \tfrac{1}{2}\, u_r^{(t)}
$$

抛反面就归零，抛正面就右移一格，掉出 $k$ 之外的概率质量直接丢弃。最后 $P(L \le k) = \sum_r u_r^{(100)}$。$O(nk)$ 就出精确有理数。

把 $2^n$ 乘回去，这条 DP 就是组合计数里的 **$k$-bonacci 数列**：长度 $n$、无 $k{+}1$ 连续 1 的 01 串个数满足 $a_n = a_{n-1} + a_{n-2} + \cdots + a_{n-k-1}$。$k=1$（不许两个连 1）时正是斐波那契。

**三、估计量级用"起点计数"。** 位置 $i$ 是一段"长度 $\ge k$ 的连正"的**起点**（即 $i-1$ 处是反面或越界，$i$ 起连着 $k$ 个正面），概率约 $\frac{1}{2} \cdot 2^{-k} = 2^{-(k+1)}$。全序列约有 $n \cdot 2^{-(k+1)}$ 个这样的起点，且这些事件几乎不重叠，泊松近似给出

$$
P(L \le k) \approx \exp\!\left(-\frac{n}{2^{k+2}}\right)
$$

令右边等于 $1/2$：$k \approx \log_2 n - 2 + \log_2 \frac{1}{\ln 2} \approx \log_2 n - 1.47$，$n=100$ 时给 5.2；再加上分布右偏拉高的均值，答案就在 6 附近。这是极值理论里的 **Gumbel 极限**：$L_n - \log_2 n$ 不收敛到一个点，而是收敛到一个（离散化的）Gumbel 分布，所以方差**不随 $n$ 衰减**。

## 解

DP 跑出来的精确值是一个分母为 $2^{100}$ 的有理数：

$$
E[L] = \frac{7595483837569630985654192520185}{2^{100}} = 5.9917802556967\ldots
$$

分布本身比均值更有意思：

| $k$ | $\le 3$ | 4 | **5** | 6 | 7 | $\ge 8$ |
| --- | --- | --- | --- | --- | --- | --- |
| $P(L = k)$ | 2.7% | 16.3% | **26.4%** | 22.9% | 14.7% | 17.0% |

众数是 **5**，中位数是 **6**，均值 $5.99$——右边拖着一条长尾（$P(L \ge 10) = 4.4\%$，$P(L \ge 15) \approx 0.13\%$）把均值往上拽。

```echarts
{
  "height": 320,
  "grid": {"left": 55, "right": 30, "top": 52, "bottom": 40},
  "xAxis": {"type": "category", "name": "最长连正 k", "nameLocation": "middle", "nameGap": 26,
            "data": ["2","3","4","5","6","7","8","9","10","11","12","13","14","15"]},
  "yAxis": {"type": "value", "name": "P(L=k)"},
  "series": [{
    "type": "bar", "barWidth": "62%",
    "data": [
      {"value": 0.00026, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.02702, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.16261, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.26402, "itemStyle": {"color": "#4e79a7"}},
      {"value": 0.22857, "itemStyle": {"color": "#4e79a7"}},
      {"value": 0.14731, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.08265, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.04342, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.02211, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.01109, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.00552, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.00274, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.00136, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.00067, "itemStyle": {"color": "#bab0ac"}}
    ],
    "markLine": {
      "symbol": "none",
      "label": {"formatter": "E[L] = 5.99", "position": "end", "rotate": 0, "distance": 4,
                "color": "#e15759", "fontSize": 12},
      "lineStyle": {"color": "#e15759", "width": 2, "type": "dashed"},
      "data": [{"xAxis": 3.99}]
    }
  }]
}
```

值得记住的一个数：$P(L \ge 6) = 0.546$。**连抛 100 次，出现 6 连正的机会略高于一半。**

## 延伸

- **渐近公式**。Erdős–Rényi / Gordon–Schilling–Waterman 的结果，$p = \frac12$ 时

    $$
    E[L_n] \approx \log_2 n - \frac{3}{2} + \frac{\gamma}{\ln 2} = \log_2 n - 0.667\ldots
    $$

    （$\gamma \approx 0.5772$ 是欧拉常数。）$n=100$ 时给 5.977，与精确值只差 0.015；误差大致按 $1.5/n$ 缩小。公式里还藏着一个周期为 $\log_2$ 的**振荡项**，但 2 进制下振幅只有 $10^{-5}$ 量级，实用中可以忽略。

    | $n$ | 10 | 50 | 100 | 1000 | 10000 |
    | --- | --- | --- | --- | --- | --- |
    | 精确 | 2.799 | 5.007 | 5.992 | 9.300 | 12.621 |
    | 近似 | 2.655 | 4.977 | 5.977 | 9.299 | 12.621 |

- **方差不收缩**。渐近方差 $\dfrac{\pi^2}{6 \ln^2 2} + \dfrac{1}{12} \approx 3.507$（$\mathrm{sd} \approx 1.87$），是 Gumbel 分布方差 $\pi^2/6$ 换底再加上离散化修正的 $1/12$。$n=100$ 尚未收敛到位，精确方差是 $3.216$（$\mathrm{sd} = 1.79$）。**无论抛多少次，最长连正的不确定性都是正负两次左右**——它围着 $\log_2 n$ 抖，永远不会集中。

- **和"等待时间"对照着看**。首次出现 $k$ 连正的期望等待次数是 $2^{k+1} - 2$（马尔可夫链或鞅停时都能秒），$k=6$ 时是 **126** 次。100 次抛掷比 126 略少，所以 6 连正是"差一点必然发生"——$P = 0.546$ 正对得上这个直觉。注意别把两者搞混：$E[\text{等待}] = 126$ **不**意味着 100 次里期望连正长度是 6 以下某个精确值，两个期望是不同的量。

- **最长"同面"连段**。若问的是最长的连续同面段（正反都算），把序列看成 99 个"与前一次是否相同"的公平指示变量，于是 $E[R_{100}] = 1 + E[L_{99}] = 6.977$。经验法则：**同面连段比连正长大约 1**。

- **它是伪造随机序列的照妖镜**。让人凭空编 100 次抛硬币结果，绝大多数人不敢写下 6 连——真实序列却有 55% 的概率出现，写出 7 连的也有 32%。反过来，看到长连段就喊"不随机"往往是错的：$P(L \ge 8) = 17\%$，一点都不稀奇。这也是体育解说里"手热效应"争议的统计学核心：随机序列本来就长这样。

- **推广到偏心硬币**。正面概率 $p$、$q = 1-p$ 时，把上面的 DP 里的 $\frac12$ 换成 $p$ / $q$ 即可，渐近式变成

    $$
    E[L_n] \approx \log_{1/p}(nq) + \frac{\gamma}{\ln(1/p)} - \frac{1}{2}
    $$

    $p = q = \frac12$ 代入正好回到上式。生存分析、序列比对（BLAST 的 E-value 就建立在同一套连段极值理论上）、金融的最长连涨，用的都是这个骨架。

??? note "数值验证"

    DP 精确解 + 蒙特卡洛交叉验证：

    ```python
    from fractions import Fraction as F
    import math, random

    def cdf_le(n, k, p=F(1, 2)):
        """P(最长连正 <= k)。状态 = 结尾的连正长度 0..k。"""
        q = 1 - p
        st = [F(0)] * (k + 1); st[0] = F(1)
        for _ in range(n):
            new = [F(0)] * (k + 1)
            new[0] = sum(st) * q                 # 抛反面：归零
            for r in range(k):
                new[r + 1] = st[r] * p           # 抛正面：右移；掉出 k 的直接丢弃
            st = new
        return sum(st)

    n = 100
    E = sum(1 - cdf_le(n, k) for k in range(n))   # E[L] = sum_k P(L > k)
    print(E.denominator == 2 ** 100)              # True
    print(float(E))                               # 5.991780255696744

    E2 = sum((2 * k + 1) * (1 - cdf_le(n, k)) for k in range(n))
    print(float(E2 - E * E))                      # 3.2157436  方差
    print(float(1 - cdf_le(n, 5)))                # 0.5460936  P(L >= 6)

    random.seed(7)
    T, tot, hit = 200000, 0, 0
    for _ in range(T):
        best = cur = 0
        for _ in range(n):
            if random.getrandbits(1):
                cur += 1; best = max(best, cur)
            else:
                cur = 0
        tot += best; hit += best >= 6
    print(tot / T, hit / T)                       # ~5.991  ~0.547
    ```

    组合视角的同一件事——长度 100、不含 6 连 1 的 01 串共

    $$
    575\,394\,696\,005\,229\,603\,939\,105\,448\,800 \approx 0.4539 \times 2^{100}
    $$

    个，其计数序列 $1, 2, 4, 8, 16, 32, 63, 125, 248, \ldots$ 从第 7 项起满足六阶递推 $a_n = a_{n-1} + \cdots + a_{n-6}$（hexanacci）。
