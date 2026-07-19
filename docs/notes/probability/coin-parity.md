# 12 枚硬币的奇偶性

## 题

12 枚独立的硬币：3 枚正面概率 $1/2$，3 枚 $1/3$，3 枚 $1/4$，3 枚 $1/5$。全部抛一次，正面总数为偶数的概率是多少？

## 一句话

只要有一枚公平硬币，正面总数的奇偶性就被完全洗牌——答案恰好 $1/2$，其余九枚根本不用看。

## 关键技巧

奇偶性问题的标准招：算 $E[(-1)^X]$。设 $X = \sum_i X_i$，各硬币独立，所以期望可以拆成乘积：

$$
E[(-1)^X] = \prod_i E\left[(-1)^{X_i}\right] = \prod_i (1 - 2p_i)
$$

又因为 $P(\text{偶}) - P(\text{奇}) = E[(-1)^X]$ 且 $P(\text{偶}) + P(\text{奇}) = 1$，两式相加即得通式：

$$
P(\text{偶}) = \frac{1 + \prod_i (1 - 2p_i)}{2}
$$

生成函数视角是同一件事：$f(x) = \prod_i (1 - p_i + p_i x)$，则 $P(\text{偶}) = \frac{f(1) + f(-1)}{2}$——这是单位根滤波（roots of unity filter）最简单的形态。

## 解

三枚 $p = 1/2$ 的硬币每枚贡献因子 $1 - 2 \cdot \frac{1}{2} = 0$，整个乘积直接归零：

$$
P(\text{偶}) = \frac{1 + 0}{2} = \frac{1}{2}
$$

不想动公式也有直觉论证：先抛其余 11 枚，无论此刻正面数是奇是偶，最后那枚公平硬币都以 $1/2$ 的概率翻转奇偶性——所以总体恰好对半分。

```echarts
{
  "height": 300,
  "series": [{
    "type": "sankey",
    "layoutIterations": 0,
    "left": 16, "right": 80, "top": 16, "bottom": 16,
    "nodeWidth": 14,
    "label": {"fontSize": 14},
    "lineStyle": {"color": "gradient", "opacity": 0.45, "curveness": 0.5},
    "data": [
      {"name": "偶 q", "itemStyle": {"color": "#4e79a7"}},
      {"name": "奇 1−q", "itemStyle": {"color": "#f28e2c"}},
      {"name": "偶 1/2", "itemStyle": {"color": "#4e79a7"}},
      {"name": "奇 1/2", "itemStyle": {"color": "#f28e2c"}}
    ],
    "links": [
      {"source": "偶 q", "target": "偶 1/2", "value": 0.35},
      {"source": "偶 q", "target": "奇 1/2", "value": 0.35},
      {"source": "奇 1−q", "target": "偶 1/2", "value": 0.15},
      {"source": "奇 1−q", "target": "奇 1/2", "value": 0.15}
    ]
  }]
}
```

## 延伸

- **把三枚公平硬币拿掉呢？** 剩下九枚的因子 $1-2p$ 分别是 $\frac{1}{3}$（来自 $p{=}\frac13$）、$\frac{1}{2}$（来自 $p{=}\frac14$）、$\frac{3}{5}$（来自 $p{=}\frac15$），每类三枚：$\left(\frac{1}{3} \cdot \frac{1}{2} \cdot \frac{3}{5}\right)^3 = \left(\frac{1}{10}\right)^3 = \frac{1}{1000}$，于是 $P(\text{偶}) = \frac{1001}{2000} = 0.5005$。出题人显然是故意把数凑整的。
- **一般规律**：所有 $p_i < 1/2$ 时每个因子为正，$P(\text{偶}) > 1/2$——偏向反面的硬币群总是更可能给出偶数个正面（0 个也算偶数）。
- **同款技巧**：求 $X \bmod m$ 的分布就换成 $m$ 次单位根滤波；通信里的奇偶校验位分析也是这一招。

??? note "数值验证"

    ```python
    from fractions import Fraction as F

    def p_even(probs):
        even, odd = F(1), F(0)
        for p in probs:
            even, odd = even * (1 - p) + odd * p, odd * (1 - p) + even * p
        return even

    ps = [F(1, 2)] * 3 + [F(1, 3)] * 3 + [F(1, 4)] * 3 + [F(1, 5)] * 3
    print(p_even(ps))       # 1/2
    print(p_even(ps[3:]))   # 1001/2000
    ```
