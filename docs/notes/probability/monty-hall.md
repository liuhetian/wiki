---
description: "换门赢 $2/3$；主持人知情且必开空门，他的动作不改变你那扇门的 $1/3$，剩下的 $2/3$ 全压到另一扇"
---

# 三门问题

## 题

三扇门，一扇后面是车，两扇后面是山羊。你先选一扇（比如 1 号）。主持人**知道车在哪**，他从另外两扇里打开一扇**山羊门**（若两扇都是山羊就随机开一扇），然后问你：要不要换到剩下那扇没开的门？换门赢车的概率是多少？

## 一句话

**换门赢 $2/3$，坚持只赢 $1/3$**——主持人无论如何都能开出一扇山羊门，他的动作对"你最初选中车"这件事没有提供任何信息；你那扇门维持 $1/3$，剩下的 $2/3$ 全部集中到唯一没开的另一扇门上。

## 关键技巧

规则里有三个条件，缺一个答案就变：

1. 主持人**知道**车在哪。
2. 他**必定**开一扇你没选的**山羊门**。
3. 他**必定**给你换门的机会。

在这套规则下，"换门"等价于一个更简单的策略：**你最初选错了就赢**。最初选错的概率是 $\frac23$——这时两扇另外的门里一扇是车一扇是羊，主持人被迫开羊门，剩下那扇必然是车。最初选对（$\frac13$）换门才输。

用贝叶斯写一遍：设你选 1 号、主持人开了 3 号。

$$
P(\text{车在 2} \mid \text{开 3}) = \frac{P(\text{开 3} \mid \text{车在 2}) \cdot \frac13}{P(\text{开 3})} = \frac{1 \cdot \frac13}{\frac13 \cdot \frac12 + \frac13 \cdot 1 + \frac13 \cdot 0} = \frac23
$$

分子里的 $1$ 是关键：车在 2 号时主持人**别无选择**，只能开 3 号；车在 1 号时他两扇都能开，只以 $\frac12$ 开 3 号。"被迫"的动作比"随意"的动作更有信息量。

## 解

三种等可能的车位置，你固定选 1 号：

| 车在 | 主持人开 | 坚持 1 号 | 换门 |
| --- | --- | --- | --- |
| 1 | 2 或 3 | 赢 | 输 |
| 2 | 3（被迫） | 输 | 赢 |
| 3 | 2（被迫） | 输 | 赢 |

换门赢 **2/3**。

## 延伸

- **$n$ 扇门、主持人开一扇**：换门时在剩下 $n-2$ 扇里随机选，胜率 $\frac{n-1}{n} \cdot \frac{1}{n-2} = \frac{n-1}{n(n-2)}$，永远大于坚持的 $\frac1n$。$n = 10$ 时是 $\frac{9}{80}$ 对 $\frac{1}{10}$。
- **$n$ 扇门、主持人开 $n-2$ 扇只留一扇**：换门胜率 $\frac{n-1}{n}$。100 扇门时主持人开掉 98 扇羊门，只留你的和另一扇——这个版本几乎让所有人的直觉转过弯来。
- **主持人不知情（Monty Fall）**：他随手开了一扇你没选的门，恰好是山羊。此时换与不换都是 **$\frac12$**。区别在于车在 2 号时他也可能开到车——"开出山羊"本身成了一次有信息的观察，把"最初选对"的后验从 $\frac13$ 抬到 $\frac12$。
- **有偏好的主持人**：若你选中车时他以概率 $q$ 开 3 号，那么看到他开 3 号后换门胜率是 $\frac{1}{1+q}$。$q = 1$（他偏爱 3 号）给 $\frac12$，$q = 0$（他从不主动开 3 号）给 $1$——但只要知情且必开羊门，换门**永远不亏**。
- **地狱主持人（Monty from Hell）**：他只在你选中车时才给换门机会。一旦被问"要换吗"，换门必输。第 3 条规则一改，结论完全反转。
- **常见错误**："剩两扇门所以各 $\frac12$"——把"剩下两个选项"当成"两个等可能的选项"。等可能要靠对称性论证，而主持人的知情行为恰恰打破了两扇门的对称。
- **同类坑**：[两个孩子问题](two-children.md) 的 $\frac13$ 与 $\frac12$ 之争也是一回事——条件概率的答案由观察事件的**生成机制**决定，而不是由题面那句话决定。

??? note "数值验证"

    精确枚举各变体（你固定选 0 号门）+ 三门蒙特卡洛：

    ```python
    from fractions import Fraction as F
    import random

    def monty(n=3, knows=True, q=None, observed=None):
        """你选 0 号门，主持人开 1 扇门且开出来是空门。返回 (坚持, 换门) 胜率，换门 = 在剩余门里均匀选。
        knows=False：主持人在 1..n-1 里随手开，开到车的局作废。
        q：三门且你选中车时，主持人开 2 号门的概率；observed：只统计开了这扇门的局。"""
        stay = switch = seen = F(0)
        for car in range(n):
            if knows:
                cand = [d for d in range(1, n) if d != car]
                probs = {d: F(1, len(cand)) for d in cand}
                if q is not None and car == 0:
                    probs = {1: 1 - q, 2: q}
            else:
                probs = {d: F(1, n - 1) for d in range(1, n) if d != car}
            for d, pd in probs.items():
                if observed is not None and d != observed:
                    continue
                w = F(1, n) * pd
                rest = [x for x in range(1, n) if x != d]
                seen += w
                stay += w * (car == 0)
                switch += w * F(rest.count(car), len(rest))
        return stay / seen, switch / seen

    show = lambda t: tuple(str(x) for x in t)
    print(show(monty()))                       # ('1/3', '2/3')
    print(show(monty(knows=False)))            # ('1/2', '1/2')  Monty Fall
    print(show(monty(n=4)), show(monty(n=10))) # ('1/4', '3/8') ('1/10', '9/80')
    for q in (F(0), F(1, 2), F(1)):
        print(q, show(monty(q=q, observed=2))) # 换门胜率 1/(1+q)：('0', '1') ('1/3', '2/3') ('1/2', '1/2')

    random.seed(5)
    T, win = 10**6, 0
    for _ in range(T):
        car, pick = random.randrange(3), random.randrange(3)
        host = random.choice([d for d in range(3) if d not in (car, pick)])
        win += (3 - pick - host) == car        # 换到剩下那扇
    print(win / T)                             # 0.666457

    n, T, win = 100, 100000, 0                 # 100 门、主持人开 98 扇只留一扇
    for _ in range(T):
        car, pick = random.randrange(n), random.randrange(n)
        keep = car if car != pick else random.choice([d for d in range(n) if d != pick])
        win += keep == car
    print(win / T)                             # 0.9901
    ```
