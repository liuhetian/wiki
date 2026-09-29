---
description: "顺着盒里的号码走环，全员成功 = 排列没有长于 50 的环，概率 $1-\\sum_{k=51}^{100}\\frac1k \\approx 0.312$；各自乱开只有 $2^{-100}$"
---

# 100 个囚徒开 100 个盒子

## 题

100 名囚徒编号 1–100。房间里有 100 个盒子，也编号 1–100，里面随机放着号码 1–100 各一张（均匀随机排列）。囚徒逐个进房间，每人最多打开 50 个盒子找自己的号码，出来后不许交流、也不能改动盒子。100 人全找到才全体释放，任何一人失败就全体处决。事先可以商量策略。成功概率最大能有多少？

## 一句话

**循环链策略**：先开自己编号的盒子，看到号码 $j$ 就去开 $j$ 号盒子，一路跟下去。全员成功概率 $1 - \sum_{k=51}^{100} \frac{1}{k} \approx$ **31.18%**，$n \to \infty$ 也只降到 $1 - \ln 2 \approx 30.69\%$；各自随机开是 $2^{-100} \approx 7.9 \times 10^{-31}$。

## 关键技巧

**把排列拆成环。** "盒子 → 盒中号码"是 $\{1, \ldots, 100\}$ 上的一个排列 $\sigma$。囚徒 $i$ 从盒子 $i$ 出发跟着号码走，走的正是 $i$ 所在的环——这个环回到起点前的最后一个盒子里装的就是 $i$。所以：

- 囚徒 $i$ 成功 $\iff$ 他所在的环长 $\le 50$；
- 全员成功 $\iff$ $\sigma$ **没有长度超过 50 的环**。

策略没有改变任何人的个人胜率——每个人所在环的长度在 $1, \ldots, 100$ 上均匀分布，个人成功率还是 $1/2$。它改变的是**相关性**：同一个环上的人同生共死，100 个独立的 $1/2$ 相乘，变成了全体押注同一个事件。

**长环计数只要一行。** 长为 $k$ 的环：挑 $k$ 个元素 $\binom{n}{k}$，排成一圈 $(k-1)!$，其余随便排 $(n-k)!$，合计

$$
\binom{n}{k}(k-1)!\,(n-k)! = \frac{n!}{k}
$$

所以 $P(\text{有长为 } k \text{ 的环}) = 1/k$。$k > n/2$ 时一个排列至多有一个这样的环，事件两两互斥，直接相加：

$$
P(\text{成功}) = 1 - \sum_{k=51}^{100} \frac{1}{k} = 1 - (H_{100} - H_{50}) = 0.311827\ldots
$$

调和数差 $H_{2m} - H_m \to \ln 2$，于是极限是 $1 - \ln 2$。这是按环型计数的最简情形——完整的环型分布由 Pólya 的环指标（cycle index）给出。

## 解

每人开 $n/2$ 个盒子时，循环链策略的成功率随 $n$ 单调下降，但下降得极慢：

| $n$ | 2 | 4 | 10 | 20 | 50 | **100** | 1000 | $\infty$ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $P(\text{成功})$ | 0.5000 | 0.4167 | 0.3544 | 0.3312 | 0.3168 | **0.3118** | 0.3074 | 0.3069 |

对照随机开的 $2^{-n}$，$n = 100$ 时两者差了 30 个数量级。

## 延伸

- **看守对抗**：如果看守知道策略、故意摆一个长 100 的大环，全员必死。对策是囚徒事先秘密约定一个随机重标号 $\pi$——"第 $i$ 号盒子"指物理上的盒子 $\pi(i)$。无论看守怎么摆，重标号后的排列对他而言都是均匀随机的，成功率回到 31%。**随机化把最坏情况拉回平均情况。**
- **这个策略是最优的**：Curtin 与 Warshauer（2006）证明了没有任何策略能超过 $1 - (H_{100} - H_{50})$。
- **第一个人能动手就稳赢**：若第一个囚徒可以看遍所有盒子并交换其中两个盒子的号码，成功率 **100%**——长于 50 的环至多一个，换一对号码就能把长 $k$ 的环劈成 $\lfloor k/2 \rfloor$ 与 $\lceil k/2 \rceil$ 两段，都 $\le 50$。
- **每人能开 $\alpha n$ 个**：$\alpha \ge 1/2$ 时同样的互斥论证给出 $P \to 1 - \ln(1/\alpha)$；$\alpha < 1/2$ 时长环不再互斥，极限是 Dickman 函数 $\rho(1/\alpha)$。
- **最长环有多长**：随机排列最长环的期望约 $0.6243\,n$（Golomb–Dickman 常数），$n = 100$ 时模拟得 $62.8$。它超过 $n/2$ 的概率约 $69\%$，正是失败的那部分。
- **常见错误**：以为"每人成功率只有 1/2，怎么组合都是 $2^{-100}$"——独立才相乘，策略的全部价值在于打破独立。

??? note "数值验证"

    精确值、$1/k$ 计数的暴力核对、蒙特卡洛：

    ```python
    from fractions import Fraction as F
    import math, random

    def p_cycle(n):
        """循环链策略成功 = 随机排列没有长度 > n/2 的环。"""
        return 1 - sum(F(1, k) for k in range(n // 2 + 1, n + 1))

    print(float(p_cycle(100)))             # 0.3118278206898048
    print(1 - math.log(2))                 # 0.3068528194400547
    print(float(F(1, 2) ** 100))           # 7.888609052210118e-31

    def count_long_cycle(n, k):
        """含长为 k 的环（k > n/2）的排列数，暴力数一遍。"""
        from itertools import permutations
        cnt = 0
        for p in permutations(range(n)):
            seen, has = [0] * n, False
            for i in range(n):
                c, j = 0, i
                while not seen[j]:
                    seen[j] = 1; j = p[j]; c += 1
                has |= c == k
            cnt += has
        return cnt
    print([count_long_cycle(7, k) * k == math.factorial(7) for k in (4, 5, 6, 7)])  # 全 True

    random.seed(2026)
    def trial(n=100):
        box = list(range(n)); random.shuffle(box)
        for i in range(n):
            j = i
            for _ in range(n // 2):
                j = box[j]
                if j == i: break
            else:
                return False
        return True
    T = 200000
    print(sum(trial() for _ in range(T)) / T)   # 0.31057

    def cycles(p):
        n, seen, out = len(p), [0] * len(p), []
        for i in range(n):
            c, j = 0, i
            while not seen[j]:
                seen[j] = 1; j = p[j]; c += 1
            if c: out.append(c)
        return out
    first, longest = 0, 0
    for _ in range(T):
        box = list(range(100)); random.shuffle(box)
        j, c = box[0], 1                      # 囚徒 0 所在环的长度
        while j != 0: j = box[j]; c += 1
        first += c <= 50
        longest += max(cycles(box))
    print(first / T, longest / T / 100)       # 0.500155 0.6276182  个人成功率仍是 1/2
    ```

    表里各 $n$ 的数值由 `p_cycle(n)` 给出。
