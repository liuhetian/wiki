---
description: "10 只老鼠 = 10 位二进制，$2^{10} = 1024 \\ge 1000$ 恰好顶到信息论下界；两轮检测换三进制只要 7 只"
---

# 1000 瓶酒找毒酒

## 题

1000 瓶酒，其中恰好一瓶有毒。老鼠喝到毒酒（哪怕一滴）24 小时后死亡，喝好酒没事。离宴会只剩 24 小时——只够做一轮检测。最少要几只老鼠，才能保证找出毒酒？

## 一句话

**10 只。** 酒瓶编号 0–999 写成 10 位二进制，第 $b$ 只老鼠喝所有第 $b$ 位是 1 的酒；第二天死掉的老鼠拼起来，就是毒酒的编号。

## 关键技巧

**每只老鼠是一个比特。** 一轮检测结束，每只老鼠只有两种结局——死或活——$m$ 只老鼠合起来最多给出 $2^m$ 种不同的结果。1000 种可能要一一分开，就得

$$
2^m \ge 1000 \quad\Longrightarrow\quad m \ge \lceil \log_2 1000 \rceil = 10
$$

这是信息论下界，任何喂法都绕不过去。二进制编码恰好把下界取到：每瓶酒对应一个 10 位的"死亡签名"，签名两两不同，看到死亡名单就能反解。

和 [3 根绳子烧出 7 分钟](rope-timing.md) 是同一副骨架——那边每根绳贡献二进制展开里的一位 $2^{-k}$，这边每只老鼠贡献一位 $2^{k}$。

## 解

1. 酒瓶编号 0–999，写成 10 位二进制 $i = \sum_b i_b 2^b$。
2. 老鼠 $b$（$b = 0, \ldots, 9$）喝所有 $i_b = 1$ 的酒，每只喝 500 瓶上下。
3. 24 小时后记下死鼠集合 $D$，毒酒编号 $= \sum_{b \in D} 2^b$。

例：毒酒是 $637 = 1001111101_2$，第二天 0、2、3、4、5、6、9 号老鼠死；反过来 $1 + 4 + 8 + 16 + 32 + 64 + 512 = 637$。编号 0 的瓶子谁都不喂——老鼠全活就是它。$1024 - 1000 = 24$ 个签名闲置。

缩小到 8 瓶 3 只老鼠看得最清楚，每一行就是一瓶酒的签名：

| 瓶 | 老鼠 2 | 老鼠 1 | 老鼠 0 |
| --- | --- | --- | --- |
| 0 | 活 | 活 | 活 |
| 1 | 活 | 活 | 死 |
| 2 | 活 | 死 | 活 |
| 3 | 活 | 死 | 死 |
| 4 | 死 | 活 | 活 |
| 5 | 死 | 活 | 死 |
| 6 | 死 | 死 | 活 |
| 7 | 死 | 死 | 死 |

## 延伸

- **两轮检测 → 三进制，7 只**。时间够做两轮时，每只老鼠有三种结局：第一轮死、第二轮死、活到最后。$3^6 = 729 < 1000 \le 2187 = 3^7$，下界是 7。编码：瓶号写成 7 位三进制，数位 0 = 第一轮喝，1 = 第一轮不喝、第二轮喝，2 = 都不喝。第一轮死掉的老鼠第二轮用不上了——但它已经交出了自己那一位，不需要再用。**$r$ 轮检测就是 $r+1$ 进制**，$m = \lceil \log_{r+1} N \rceil$。
- **可能根本没有毒酒**：情况数变成 1001，仍 $\le 1024$，还是 10 只。
- **想让最坏情况少死老鼠**：二进制编码下编号 511、767 这类瓶要毒死 9 只。改挑重量（1 的个数）最低的 1000 个码字：10 只老鼠时 $\sum_{j \le 7} \binom{10}{j} = 968 < 1000$，最坏至少死 8 只；多加 1 只老鼠，$\sum_{j \le 5} \binom{11}{j} = 1024$，最坏只死 5 只——**用 1 只老鼠换最坏少死 3 只**。
- **两瓶毒，二进制直接失效**。死鼠集合变成两个签名的按位 OR，$\{1, 2\}$ 与 $\{0, 3\}$ 都只毒死老鼠 0 和 1，分不开。下界升到 $\lceil \log_2 \binom{1000}{2} \rceil = \lceil 18.93 \rceil = 19$。
- **这是组测试（group testing）**。$d$ 个阳性、非自适应时，喂法矩阵要是 $d$-disjunct 的——任一瓶的签名不被另外 $d$ 瓶的签名并集盖住——这时解码只需一句"签名里的老鼠全死了的瓶就是毒酒"。所需行数的下界是 $\Omega\!\left(\frac{d^2 \log N}{\log d}\right)$ 量级，比单瓶的 $\log N$ 贵出一个 $d^2$。
- **两瓶毒的一个现成构造：Kautz–Singleton，49 只**。瓶子对应 $\mathrm{GF}(7)$ 上次数 $< 4$ 的多项式 $f$（共 $7^4 = 2401 \ge 1000$ 个），老鼠对应点值对 $(x, y)$，$x, y \in \mathrm{GF}(7)$，共 49 只；老鼠 $(x, y)$ 喝所有 $f(x) = y$ 的酒。两个不同的三次多项式至多在 3 点重合，所以另外两瓶最多盖住某瓶 7 只老鼠里的 $3 + 3 = 6$ 只，永远留一只活口——2-disjunct 成立。下界 19，构造 49，真正的最优在两者之间，这里没有求。
- **自适应就便宜得多**：允许多轮、看结果再决定下一轮，就是新冠混样检测（pooled testing）的做法，行数可以逼近 $\log_2 \binom{N}{d}$。

??? note "数值验证"

    一轮二进制、两轮三进制、两瓶毒的反例和 Kautz–Singleton 构造，逐一核对：

    ```python
    import math, random
    from itertools import product, combinations

    # 一轮：二进制编码，瓶 i 给第 b 只老鼠喂当且仅当 i 的第 b 位是 1
    def rats_die(poison, m=10):
        return [b for b in range(m) if poison >> b & 1]
    def decode(dead):
        return sum(1 << b for b in dead)
    print(all(decode(rats_die(i)) == i for i in range(1000)))   # True
    print(math.ceil(math.log2(1000)), math.ceil(math.log(1000, 3)))  # 10 7
    print(bin(637), rats_die(637))              # 0b1001111101 [0, 2, 3, 4, 5, 6, 9]
    print(max(bin(i).count("1") for i in range(1000)))          # 9  编号 0..999 时最坏死几只
    for m in (10, 11):                                           # 只挑低重量码字时最坏死几只
        w = next(w for w in range(m + 1) if sum(math.comb(m, j) for j in range(w + 1)) >= 1000)
        print(m, w)                                              # 10 8 / 11 5

    # 两轮：三进制编码，数位 0=第一轮喝、1=第二轮喝、2=不喝
    def digit(i, b): return i // 3**b % 3
    def outcome(poison, m=7):
        res = []
        for b in range(m):
            r1 = {i for i in range(1000) if digit(i, b) == 0}   # 第一轮喝的瓶
            r2 = {i for i in range(1000) if digit(i, b) == 1}   # 活下来才喝第二轮
            res.append("死1" if poison in r1 else "死2" if poison in r2 else "活")
        return tuple(res)
    print(len({outcome(i) for i in range(1000)}))               # 1000，互不相同

    # 两瓶毒：二进制编码失效
    print((1 | 2) == (0 | 3))                                    # True：{1,2} 和 {0,3} 死的老鼠一样
    print(math.log2(math.comb(1000, 2)))                         # 18.930125152454504

    # Kautz–Singleton：瓶 = GF(7) 上次数 < 4 的多项式，老鼠 = (求值点 x, 取值 y)
    polys = list(product(range(7), repeat=4))[:1000]
    def ev(c, x): return sum(a * x**k for k, a in enumerate(c)) % 7
    code = [frozenset((x, ev(c, x)) for x in range(7)) for c in polys]
    print(max(len(code[a] & code[b]) for a, b in combinations(range(1000), 2)))  # 3
    random.seed(0)
    def find(dead):
        return [i for i in range(1000) if code[i] <= dead]
    print(all(sorted(find(code[a] | code[b])) == sorted({a, b})
              for a, b in (random.sample(range(1000), 2) for _ in range(2000))))  # True
    ```
