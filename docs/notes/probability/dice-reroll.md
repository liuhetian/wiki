---
description: "最多掷 3 次、随时可停，期望 $14/3$；从最后一掷倒推，门槛就是后面还能拿到的期望"
---

# 骰子最多掷 3 次

## 题

掷一枚公平骰子，最多掷 3 次。每掷一次都可以选择停下、拿走这次的点数；不停就作废重掷，第 3 次的点数必须收下。最优策略下期望能拿多少？

## 一句话

**$14/3 \approx 4.67$**——第 1 掷见到 5、6 就停，第 2 掷见到 4、5、6 就停，否则掷到底。门槛不是拍脑袋，是"后面还能拿到的期望"。

## 关键技巧

最优停止的标准招：**从最后一步倒推（backward induction）**。设 $v_k$ 为"还剩 $k$ 次可掷"时的最优期望。

- 只剩 1 次——没得选，$v_1 = E[X] = 3.5$。
- 剩 $k$ 次——先掷一次看到 $x$，停下拿 $x$，继续拿 $v_{k-1}$，取大者：

$$
v_k = E\bigl[\max(X,\ v_{k-1})\bigr]
$$

停止规则随之而来：**当前点数 $\ge v_{k-1}$ 就停**。每一步只跟"放弃之后的期望"比，不跟 3.5 比——这是整道题唯一的坑。

## 解

**剩 2 次**：门槛 $v_1 = 3.5$，见到 4、5、6 停，1、2、3 重掷拿 3.5：

$$
v_2 = \frac{4+5+6}{6} + \frac{3}{6} \cdot 3.5 = 2.5 + 1.75 = \frac{17}{4} = 4.25
$$

**剩 3 次**：门槛 $v_2 = 4.25$，只有 5、6 值得停，1 到 4 都重掷：

$$
v_3 = \frac{5+6}{6} + \frac{4}{6} \cdot \frac{17}{4} = \frac{11}{6} + \frac{17}{6} = \frac{14}{3}
$$

第 1 掷掷出 4 时要忍住——停下拿 4，重掷期望 4.25，**4 在第 1 掷是"坏"点数，在第 2 掷是"好"点数**。门槛随剩余次数上移，就是期权里"剩余时间越长、越不急于行权"的同一件事。

```echarts
{
  "height": 300,
  "grid": {"left": 50, "right": 30, "top": 40, "bottom": 40},
  "xAxis": {"type": "category", "name": "可掷次数 n", "nameLocation": "middle", "nameGap": 26,
            "data": ["1","2","3","4","5","6","7","8","9","10"]},
  "yAxis": {"type": "value", "min": 3, "max": 6, "name": "最优期望"},
  "series": [{
    "type": "bar", "barWidth": "55%",
    "data": [
      {"value": 3.5, "itemStyle": {"color": "#bab0ac"}},
      {"value": 4.25, "itemStyle": {"color": "#bab0ac"}},
      {"value": 4.6667, "itemStyle": {"color": "#4e79a7"}},
      {"value": 4.9444, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.1296, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.2747, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.3956, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.4963, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.5803, "itemStyle": {"color": "#bab0ac"}},
      {"value": 5.6502, "itemStyle": {"color": "#bab0ac"}}
    ],
    "markLine": {
      "symbol": "none",
      "label": {"formatter": "上限 6", "position": "insideEndTop"},
      "lineStyle": {"color": "#e15759", "width": 2, "type": "dashed"},
      "data": [{"yAxis": 6}]
    }
  }]
}
```

## 延伸

- **$n$ 次的序列**：$v_n = \frac{7}{2}, \frac{17}{4}, \frac{14}{3}, \frac{89}{18}, \frac{277}{54}, \ldots$，数值 3.5、4.25、4.67、4.94、5.13、5.27……单调趋于 **6**。
- **收敛速度是几何的**：$v_5 > 5$ 之后门槛锁死在 6，递推变成 $v_{n+1} = 1 + \frac{5}{6} v_n$，即 $6 - v_{n+1} = \frac{5}{6}(6 - v_n)$——差距每多一次机会缩到 $5/6$。可掷 6 次及以上时，第 1 掷只有 6 才停。
- **常见错误：每一掷都和 3.5 比**。第 1 掷见到 4 就停，期望只有 $\frac12 \cdot 5 + \frac12 \cdot 4.25 = \frac{37}{8} = 4.625$，比最优少 $1/24$。错误就在把"继续的价值"当成单掷期望，而不是 $v_{k-1}$。
- **拿点数的平方**：递推不变，只把 $X$ 换成 $X^2$。$v_1 = \frac{91}{6} \approx 15.17$，$v_2 = \frac{245}{12}$，$v_3 = \frac{214}{9} \approx 23.78$。门槛恰好还是"第 1 掷 $\ge 5$、第 2 掷 $\ge 4$"，但 $\frac{214}{9} \ne \left(\frac{14}{3}\right)^2 \approx 21.78$——**期望不能穿过非线性函数**。
- **无限次、每次重掷付 1 元**：价值 $V$ 满足不动点方程 $V = E[\max(X, V-1)]$，解得 $V = 4$；此时"$\ge 3$ 停"和"$\ge 4$ 停"恰好打平。带成本的无限期问题都这么解——猜门槛、验不动点。
- **同一骨架**：[秘书问题](secretary-problem.md)也是"停下拿当前 vs 继续的价值"，只是信息是相对名次而非点数；美式期权的提前行权、找房找工作的保留价格（reservation price）都是这条 Bellman 方程。

??? note "数值验证"

    ```python
    from fractions import Fraction as F
    import random

    def values(n, pay=lambda x: x):
        """v[k] = 还剩 k 次可掷时的最优期望。"""
        v = [None, F(sum(pay(x) for x in range(1, 7)), 6)]
        for _ in range(n - 1):
            v.append(F(sum(max(pay(x), v[-1]) for x in range(1, 7)), 6))
        return v

    v = values(3)
    print(v[1], v[2], v[3])                       # 7/2 17/4 14/3
    print([round(float(x), 4) for x in values(10)[1:]])
    # [3.5, 4.25, 4.6667, 4.9444, 5.1296, 5.2747, 5.3956, 5.4963, 5.5803, 5.6502]
    print(values(3, lambda x: x * x)[3])          # 214/9

    # 短视策略：每一掷都只和 3.5 比
    myopic = F(1, 2) * F(5) + F(1, 2) * v[2]
    print(myopic)                                 # 37/8

    # 无限次重掷、每次重掷付 1：V = E[max(X, V-1)] 的不动点
    V = F(4)
    print(F(sum(max(x, V - 1) for x in range(1, 7)), 6) == V)   # True

    random.seed(1)
    T, s = 10**6, 0
    for _ in range(T):
        x = random.randint(1, 6)
        if x < 5:
            x = random.randint(1, 6)
            if x < 4:
                x = random.randint(1, 6)
        s += x
    print(s / T)                                  # 4.665589
    ```
