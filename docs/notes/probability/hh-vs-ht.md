---
description: "等 HH 要 6 次、等 HT 只要 4 次；状态递推或 ABRACADABRA 鞅一行出答案，自重叠越多等得越久"
---

# 等 HH 与等 HT

## 题

一枚公平硬币反复抛，首次出现连续两次正面（HH）平均要抛几次？首次出现"正面后接反面"（HT）呢？

## 一句话

**HH 要 6 次，HT 只要 4 次**——两种图案在任一位置出现的概率都是 $1/4$，差别全在**自重叠**：HH 失败时会把手里的 H 一起丢掉，HT 失败时 H 还留着。

## 关键技巧

**一、状态递推。** 状态取"当前已匹配的前缀长度"，对每个状态列一条"再抛一次"的方程。

HH：设 $e_0$、$e_1$ 分别是从零开始、手握一个 H 时的剩余期望。

$$
e_0 = 1 + \tfrac12 e_1 + \tfrac12 e_0, \qquad e_1 = 1 + \tfrac12 \cdot 0 + \tfrac12 e_0
$$

解得 $e_0 = 6$。关键在第二式——手握 H 抛出 T，**退回起点**。

HT：

$$
e_0 = 1 + \tfrac12 e_1 + \tfrac12 e_0, \qquad e_1 = 1 + \tfrac12 \cdot 0 + \tfrac12 e_1
$$

手握 H 再抛出 H，**原地不动**——还握着一个 H。于是 $e_1 = 2$，$e_0 = 4$。

**二、赌徒鞅（ABRACADABRA 法）。** 每抛一次之前来一个新赌徒，带 1 元入场，押"下一次是图案的第 1 个字母"，赔率公平（押中翻倍）；押中就把全部身家押图案的下一个字母，押错出局。赌场是公平的，所以到停时 $\tau$（图案首次完成）为止：

$$
E[\text{赌场收入}] = E[\tau] = E[\text{停时那一刻全体赌徒的身家}]
$$

停时那一刻还活着的，只有"入场点恰好让已开出的尾巴等于图案前缀"的赌徒：

- HH：第 $\tau-1$ 次入场的赌徒押中两次，身家 4；第 $\tau$ 次入场的押中一次，身家 2。$E[\tau] = 4 + 2 = 6$。
- HT：第 $\tau-1$ 次入场的身家 4；第 $\tau$ 次入场的押 H 开出 T，出局。$E[\tau] = 4$。

一般公式：长度 $n$ 的图案、字母表大小 $m$，

$$
E[\tau] = \sum_{k:\ \text{长 } k \text{ 的前缀} = \text{长 } k \text{ 的后缀}} m^k
$$

猴子打出 ABRACADABRA：前后缀重合的长度是 1（A）、4（ABRA）、11（全体），$E[\tau] = 26^{11} + 26^4 + 26$。

## 解

两种方法都给：

$$
E[\tau_{HH}] = 6, \qquad E[\tau_{HT}] = 4
$$

直觉版——长期看 HH 和 HT 出现的**频率**一样，都是每个位置 $1/4$。但 HH 会扎堆（HHH 里有两个重叠的 HH），同样的频率挤成一团团，团与团之间的空档就更长，首次等待自然更久。**同频率 + 更扎堆 = 更长的首次等待。**

## 延伸

- **$k$ 连正**：全正图案每个长度都自重叠，$E = 2 + 4 + \cdots + 2^k = 2^{k+1} - 2$。$k=6$ 是 126——正是 [100 次抛硬币的最长连正](longest-head-run.md) 里拿来对照的那个数。
- **长度 3 的图案**：HHH 14，HTH 10，HHT、HTT、THH、TTH 都是 8。自重叠越多等得越久，HTH 因为首尾都是 H 比 HHT 多等 2 次。
- **比谁先出现 ≠ 比谁期望短**：HH 与 HT 同场比赛，谁先出现各 $1/2$——第一个 H 出现后下一抛直接定胜负。期望 6 对 4，胜率却是五五开。
- **Penney 游戏的非传递性**：甲先选一个长度 3 的图案，乙后选，先出现者胜。乙永远有优势——对甲的 $a_1a_2a_3$，乙选 $\bar a_2 a_1 a_2$（$\bar a_2$ 为 $a_2$ 翻面）。于是形成一个环：

    $$
    \text{HHT} \xleftarrow{3/4} \text{THH} \xleftarrow{2/3} \text{TTH} \xleftarrow{3/4} \text{HTT} \xleftarrow{2/3} \text{HHT}
    $$

    箭头读作"被……击败，胜率"。**没有最强的图案**，像石头剪刀布。胜率用 Conway 的 leading number 算：$P(B \text{ 先于 } A) : P(A \text{ 先于 } B) = (A{\cdot}A - A{\cdot}B) : (B{\cdot}B - B{\cdot}A)$，其中 $X{\cdot}Y = \sum_k 2^{k-1}[\,X \text{ 的长 } k \text{ 后缀} = Y \text{ 的长 } k \text{ 前缀}\,]$。
- **常见错误**：以为"HH 和 HT 都是 1/4 的事件，所以等待都是 4"。每个位置出现的概率相同，只决定长期频率；首次等待还取决于相邻位置的相关性。

??? note "数值验证"

    状态方程精确解、鞅公式、Penney 胜率、蒙特卡洛四路对照：

    ```python
    from fractions import Fraction as F
    import itertools, random

    def wait(pat, m=2):
        """Conway / 鞅公式：前缀 = 后缀的每个长度 k 贡献 m^k。"""
        return sum(m ** k for k in range(1, len(pat) + 1) if pat[:k] == pat[-k:])

    def wait_chain(pat):
        """精确解：状态 = 已匹配前缀长度，e[i] = 1 + (e[抛 H 后] + e[抛 T 后]) / 2，高斯消元。"""
        n = len(pat)
        def nxt(i, c):
            s = pat[:i] + c
            return max(k for k in range(min(len(s), n) + 1) if s[len(s) - k:] == pat[:k])
        A = [[F(0)] * (n + 1) for _ in range(n)]
        for i in range(n):
            A[i][i] += 1; A[i][n] = F(1)
            for c in "HT":
                j = nxt(i, c)
                if j < n: A[i][j] -= F(1, 2)
        for c in range(n):
            p = next(r for r in range(c, n) if A[r][c] != 0)
            A[c], A[p] = A[p], A[c]
            for r in range(n):
                if r != c and A[r][c] != 0:
                    f = A[r][c] / A[c][c]
                    A[r] = [x - f * y for x, y in zip(A[r], A[c])]
        return A[0][n] / A[0][0]

    for p in ["HH", "HT", "HHH", "HHT", "HTH"]:
        print(p, wait(p), wait_chain(p))
    # HH 6 6 / HT 4 4 / HHH 14 14 / HHT 8 8 / HTH 10 10
    print(wait("ABRACADABRA", 26) == 26**11 + 26**4 + 26)   # True

    def p_first(a, b):
        """Conway leading number：P(b 先于 a 出现)。"""
        L = lambda x, y: sum(2 ** (len(x) - k) for k in range(len(x)) if x[k:] == y[:len(x) - k])
        u, v = L(a, a) - L(a, b), L(b, b) - L(b, a)
        return F(u, u + v)

    print(p_first("HH", "HT"))                                  # 1/2
    for a in ["HHT", "THH", "TTH", "HTT"]:
        b = max((x for x in map("".join, itertools.product("HT", repeat=3)) if x != a),
                key=lambda x: p_first(a, x))
        print(a, "<-", b, p_first(a, b))
    # HHT <- THH 3/4 / THH <- TTH 2/3 / TTH <- HTT 3/4 / HTT <- HHT 2/3

    random.seed(0)
    def sim_wait(pat, T=200000):
        tot = 0
        for _ in range(T):
            s, n = "", 0
            while not s.endswith(pat):
                s = (s + random.choice("HT"))[-len(pat):]; n += 1
            tot += n
        return tot / T
    print(sim_wait("HH"), sim_wait("HT"))                       # 5.985285 3.993925
    ```
