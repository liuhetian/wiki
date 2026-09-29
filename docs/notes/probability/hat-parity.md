---
description: "最后一人喊出前方红帽数的奇偶，其余 99 人全活；一个 bit 的奇偶校验就够，$k$ 色换成 mod $k$"
---

# 100 个囚徒的红蓝帽

## 题

100 名囚徒排成一列纵队，每人头戴一顶红帽或蓝帽，颜色任意（可以当作独立随机）。每人只看得见**前面**所有人的帽子，看不见自己和身后的。从队尾开始，每人依次大声喊出一个颜色，所有人都听得见；喊对自己帽色的活，喊错的死。事先可以商量策略，开始后不许交流。最多能**保证**几人活下来？

## 一句话

**保证 99 人活**，最后一人五五开——队尾那人把"前方 99 顶帽子里红帽数的奇偶"喊出来，这一个 bit 让其余每个人都能解出自己的帽色。

## 关键技巧

每个人缺的信息恰好是**一个 bit**（自己的帽色），而全队最多只能"牺牲"一次发言去传递共享信息——奇偶校验正好一个 bit 补一个 bit。

- **队尾（第 100 人）**：数前方 99 顶里红帽的个数，偶数喊"蓝"，奇数喊"红"。他自己的帽色与他看到的一切独立，只能听天由命，$\frac12$。
- **第 99 人**：知道前方 99 顶（含自己）的红帽奇偶 $P$，又看得见前方 98 顶的红帽数 $s$，自己的帽子就是 $P - s \bmod 2$。
- **一般的第 $i$ 人**：身后已喊过的人（除队尾）全都喊对了，他们喊的就是真实帽色。$P$ 减去身后已确认的红帽数、再减去前方看到的红帽数，剩下的奇偶就是自己。

这就是 [12 枚硬币的奇偶性](coin-parity.md) 里同一件事的另一面——奇偶性是"和 mod 2"，只要知道总和的奇偶和其余所有项，缺的那一项就被唯一确定。通信里的奇偶校验位纠正一个已知位置的擦除错误，靠的也是这个。

## 解

- **99 人一定活**：上面的论证对任意帽色配置成立，不是概率意义上的。
- **100 人不可能保证**：队尾那人看到的、听到的都与自己帽色无关，任何策略下他都只有 $\frac12$。所以 99 是上限，期望 $99.5$ 人存活。
- **对比朴素策略**：两两配对，偶数号喊出前面搭档的帽色，搭档照喊——只保证 50 人，期望 75 人。奇偶策略把"每两人牺牲一个"压成"全队只牺牲一个"。

## 延伸

- **$k$ 种颜色**：颜色编号 $0, \ldots, k-1$，队尾喊出前方所有帽色之和 mod $k$。其余人同理解出自己，**仍保证 $n-1$ 人活**，队尾 $\frac1k$。奇偶校验只是 $k=2$ 的特例。
- **有人喊错会怎样**：一次失误让紧跟着的下一人也错，之后全部恢复（mod $k$ 同理）——错误以"差分"形式传播，一次失误只多赔一条命。
- **同时喊、两色、看得见除自己外所有人**：每个人猜对的概率都**恰好** $\frac12$，与策略无关，所以期望永远 50 人。能改的只有相关性——两两配对，一人猜"和搭档同色"、另一人猜"和搭档异色"，每对恰好一人对，**保证恰好 50 人**。这与 [囚徒开盒子](prisoners-boxes.md) 是同一类技巧：个体概率动不了，就把成败绑在一起。
- **同时喊、$n$ 人 $n$ 色**：第 $i$ 人假设"全体帽色之和 $\equiv i \pmod n$"，据此解出自己。总和 mod $n$ 恰好等于某一个 $i$，所以**恰好一人猜对**，永远不会全军覆没。
- **同时喊、可以弃权**：全队赢 ⇔ 至少一人开口且开口的全对。3 人两色时，"看到另两顶同色就猜反色，否则弃权"赢 $\frac34$；一般 $n = 2^m - 1$ 人用 Hamming 码可达 $1 - \frac{1}{n+1}$，7 人即 $\frac78$。错误全被集中到少数配置上一起犯，赢的配置里只有一人开口。
- **常见错误**：让队尾报"前面那个人的帽色"——这只救一个人；或者以为每人都要用自己的发言去传信息。关键在于除队尾外，**每个人的发言本身就是确认过的真值**，天然成为后面人的已知项。

??? note "数值验证"

    小规模全枚举（所有帽色配置）+ 100 人随机抽样：

    ```python
    from itertools import product
    import random

    def line_strategy(hats, k=2, slip=None):
        """hats[0] 站队尾（看得见所有人），hats[i] 只看得见 hats[i+1:]。颜色 0..k-1。
        slip：让这个人故意喊错一次，观察错误传播。返回每人喊得对不对。"""
        n, calls = len(hats), []
        for i in range(n):
            seen = sum(hats[i + 1:])
            if i == 0:
                c = seen % k                             # 报出前方所有帽色之和 mod k
            else:
                c = (calls[0] - sum(calls[1:i]) - seen) % k
            if i == slip:
                c = (c + 1) % k
            calls.append(c)
        return [c == h for c, h in zip(calls, hats)]

    for n, k in [(10, 2), (6, 3), (5, 4)]:
        res = [sum(line_strategy(h, k)) for h in product(range(k), repeat=n)]
        print(n, k, min(res), sum(r == n for r in res) / len(res))
    # 10 2 9 0.5 | 6 3 5 0.333... | 5 4 4 0.25   最少 n-1 人对；全对的比例 = 1/k

    random.seed(4)
    print(min(sum(line_strategy([random.randint(0, 1) for _ in range(100)])) for _ in range(10000)))  # 99
    h = [random.randint(0, 1) for _ in range(10)]
    print([int(x) for x in line_strategy(h, slip=4)][1:])   # [1, 1, 1, 0, 0, 1, 1, 1, 1] 编号 4 的人喊错，只连累下一个

    def mod_n(hats):                                     # 同时猜，n 人 n 色
        n = len(hats)
        return sum((i - (sum(hats) - hats[i])) % n == hats[i] for i in range(n))
    print({mod_n(h) for h in product(range(4), repeat=4)})            # {1}

    def pairs(hats):                                     # 同时猜，两色两两配对
        right = 0
        for j in range(0, len(hats), 2):
            a, b = hats[j], hats[j + 1]
            right += (b == a)                            # a 猜自己和 b 同色
            right += (1 - a == b)                        # b 猜自己和 a 异色
        return right
    print({pairs(h) for h in product(range(2), repeat=10)})           # {5}

    def hamming3(h):                                     # 可弃权，3 人两色
        said = []
        for i in range(3):
            o = [h[j] for j in range(3) if j != i]
            if o[0] == o[1]:
                said.append(1 - o[0] == h[i])
        return bool(said) and all(said)
    print(sum(hamming3(h) for h in product(range(2), repeat=3)), "/ 8")   # 6 / 8

    def syn(v):                                          # Hamming 校验子：取值为 1 的位置号（1..7）异或
        s = 0
        for i, b in enumerate(v):
            s ^= (i + 1) * b
        return s
    def hamming7(h):                                     # 7 人：码字 = 校验子为 0 的串
        said = []
        for i in range(7):
            z = [syn(h[:i] + (b,) + h[i + 1:]) == 0 for b in (0, 1)]
            if z[0] != z[1]:                             # 恰有一种补全是码字，就猜另一种
                said.append((1 if z[0] else 0) == h[i])
        return bool(said) and all(said)
    print(sum(hamming7(h) for h in product(range(2), repeat=7)), "/ 128")  # 112 / 128
    ```
