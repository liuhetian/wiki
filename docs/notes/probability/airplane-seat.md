---
description: "最后一人坐对的概率恰好 $1/2$；技巧是只盯 1 号座和 $n$ 号座——每次乱选时两者对称"
---

# 飞机上的最后一个座位

## 题

100 名乘客按座位号 1 到 100 依次登机，每人一张票对应一个座位。第 1 位乘客丢了登机牌，在 100 个座位里均匀随机坐一个。之后每位乘客：自己的座位空着就坐自己的，被占了就在剩下的空座里均匀随机选一个。第 100 位乘客坐到自己座位的概率是多少？

## 一句话

**恰好 $1/2$**——最后剩下的座位只可能是 1 号或 100 号，而每一次乱选时这两个座位的地位完全对称。

## 关键技巧

别跟踪谁坐了哪里，只盯两个座位：**1 号座**（第 1 人的座）和 **100 号座**（最后一人的座）。

每个被迫乱选的人（包括第 1 人）面对的空座里，1 号和 100 号一定都在——乱选只发生在它们都空着的时候。他的选择只有三种结局：

- 选中 **1 号**——链条就此断掉，之后所有人都能坐自己的座，最后一人坐对。
- 选中 **100 号**——最后一人注定坐错。
- 选中其他 $k$ 号——难题原样踢给第 $k$ 人，他又面临同样的三选一。

两个"终局座位"在每一轮里被选中的概率相等，而过程必然以其中一个被占而结束，于是各占一半。

另一个角度看终局：第 100 人登机时只剩一个空座。它不可能是 $k \in \{2, \ldots, 99\}$ 号——第 $k$ 人登机时 $k$ 号座若还空着，他自己就坐了。所以剩下的只能是 1 号或 100 号，对称性给出 $1/2$。

## 解

把对称论证推广到第 $k$ 人（$2 \le k \le n$）：第 $k$ 人登机前，所有乱选的人都在"1 号 + 尚未登机者的座位"里均匀选，其中 $\{1, k, k+1, \ldots, n\}$ 这 $n-k+2$ 个座位地位对称。这个集合里**第一个被乱选中的座位**决定第 $k$ 人的命运——选中 1 号链条断，选中 $k+1$ 号及以后要等那人登机才轮到下一次乱选，只有恰好选中 $k$ 号他才被挤掉：

$$
P(\text{第 } k \text{ 人的座位被占}) = \frac{1}{n-k+2}, \qquad P(\text{第 } k \text{ 人坐对}) = \frac{n-k+1}{n-k+2}
$$

$k = n$ 时正是 $1/2$。前面的人几乎都安全——第 2 人只有 $1/100$ 的概率被挤，风险全堆在队尾：

```echarts
{
  "height": 300,
  "grid": {"left": 55, "right": 30, "top": 40, "bottom": 40},
  "xAxis": {"type": "category", "name": "第 k 位乘客", "nameLocation": "middle", "nameGap": 26,
            "data": ["91","92","93","94","95","96","97","98","99","100"]},
  "yAxis": {"type": "value", "name": "座位被占概率", "max": 0.6},
  "series": [{
    "type": "bar", "barWidth": "60%",
    "label": {"show": true, "position": "top", "fontSize": 11},
    "data": [
      {"value": 0.091, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.100, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.111, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.125, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.143, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.167, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.200, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.250, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.333, "itemStyle": {"color": "#bab0ac"}},
      {"value": 0.500, "itemStyle": {"color": "#4e79a7"}}
    ]
  }]
}
```

## 延伸

- **坐错的人数期望**：第 1 人以 $\frac{n-1}{n}$ 坐错，第 $k$ 人以 $\frac{1}{n-k+2}$ 被挤，求和得 $H_n - \frac{1}{n}$。$n=100$ 时约 **5.18 人**——乱套的规模只按 $\ln n$ 增长。
- **答案与 $n$ 无关**：只要 $n \ge 2$，最后一人都是 $1/2$。$n=2$ 时一眼可见——第 1 人要么坐对要么坐错。
- **第 1 人故意不坐自己的座**：他在 $2..n$ 里均匀选，直接选中 $n$ 号的概率 $\frac{1}{n-1}$；否则把难题交给后面，之后对称性照旧成立。最后一人坐对的概率 $\frac{n-2}{n-1} \cdot \frac{1}{2}$，$n=100$ 时为 $\frac{49}{99}$——破坏对称的只有第一步。
- **常见错误**：把答案猜成 $1/100$ 或 $99/100$，以为"第 1 人坐到 100 号的概率很小"就万事大吉——漏掉了链条可以一环一环把麻烦传到队尾。
- **同一个招式**：找出过程的"终局状态"，证明每一步它们对称——[圆上 $n$ 点落在同一半圆](semicircle-points.md)里指定领头点、[断棍成三角形](broken-stick-triangle.md)里把坏事件拆成互斥的几块，都是不做计算、直接读出对称性。

??? note "数值验证"

    精确递推 + 蒙特卡洛。被挤掉的第 $j$ 人在 $\{1\} \cup \{j+1, \ldots, n\}$ 这 $n-j+1$ 个空座里均匀选：

    ```python
    from fractions import Fraction as F
    import random

    def displaced(n, first_avoids_own=False):
        """q[k] = P(第 k 人的座位被占)。"""
        m = n - 1 if first_avoids_own else n                  # 第 1 人的可选座位数
        q = [F(0)] * (n + 1)
        for k in range(2, n + 1):
            # 第 1 人直接坐 k，或之前某个被挤掉的 j 选中了 k
            q[k] = F(1, m) + sum(q[j] / (n - j + 1) for j in range(2, k))
        return q

    n = 100
    q = displaced(n)
    print(q[n])                                                     # 1/2
    print(all(q[k] == F(1, n - k + 2) for k in range(2, n + 1)))    # True
    E_wrong = (1 - F(1, n)) + sum(q[2:])                            # 坐错的人数期望，含第 1 人
    H = sum(F(1, j) for j in range(1, n + 1))
    print(E_wrong == H - F(1, n), float(E_wrong))                   # True 5.17737751763962
    print(1 - displaced(n, first_avoids_own=True)[n])               # 49/99

    random.seed(1)
    def last_gets_own(n):
        free = list(range(1, n + 1))
        free.remove(random.choice(free))
        for k in range(2, n):
            free.remove(k if k in free else random.choice(free))
        return free == [n]

    T = 100000
    print(sum(last_gets_own(n) for _ in range(T)) / T)              # 0.50267
    ```
