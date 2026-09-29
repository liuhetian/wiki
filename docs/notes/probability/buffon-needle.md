---
description: "针长 $l \\le d$ 时相交概率 $2l/(\\pi d)$；不积分的做法是期望交点数的线性性 + 直径为 $d$ 的圆恒交 2 次"
---

# Buffon 投针

## 题

地板上画着间距为 $d$ 的平行线，随手扔一根长 $l \le d$ 的针，位置和方向都均匀随机。针与某条线相交的概率是多少？

## 一句话

**$\dfrac{2l}{\pi d}$**，针长等于线距时是 $2/\pi \approx 0.637$。$\pi$ 从直线题里冒出来，是因为方向角是均匀的——而最漂亮的证法一个积分都不用。

## 关键技巧

**别算概率，算期望交点数 $E[N]$。** 短针（$l \le d$）至多交一条线，$N \in \{0, 1\}$，所以 $P(\text{相交}) = E[N]$。

**期望交点数对长度是线性的（Buffon's noodle）。** 把针切成两段，每段各自随机落下，总交点数 = 两段交点数之和——期望的线性性**不要求两段独立**，所以焊在一起、甚至弯成任意角度都照样成立。于是对任意长 $L$ 的可求长曲线（"面条"），

$$
E[N] = c \cdot L
$$

$c$ 只依赖于 $d$。

**用一个恒等的形状定出 $c$。** 取直径恰为 $d$ 的圆：无论怎么扔，它与平行线**恰好**交 2 次（相切的概率为 0）。周长 $\pi d$，所以

$$
c \cdot \pi d = 2 \quad\Rightarrow\quad c = \frac{2}{\pi d}, \qquad E[N] = \frac{2L}{\pi d}
$$

把针（$L = l$）代回：$P = \dfrac{2l}{\pi d}$。整个论证——**线性性把任意形状化成常数 $c$，特殊形状把常数钉死**——没有一个积分。

## 解

标准积分做法同样一行，拿来对账：针中心到最近线的距离 $y \sim U[0, \frac d2]$，针与线的锐角 $\theta \sim U[0, \frac\pi2]$，相交当且仅当 $y \le \frac l2 \sin\theta$：

$$
P = \frac{2}{d} \cdot \frac{2}{\pi} \int_0^{\pi/2} \frac{l}{2} \sin\theta \, d\theta = \frac{2l}{\pi d}
$$

$l = d$ 时 $P = 2/\pi = 0.6366$，一百万次模拟得 0.6358。

## 延伸

- **长针（$l > d$）**：交点数的期望仍是 $\frac{2l}{\pi d}$——线性性不挑长短；但 $N$ 可以大于 1，**概率不再等于期望**。记 $r = l/d$，把积分里的 $r\sin\theta$ 截到 1：

    $$
    P = \frac{2}{\pi}\left(r - \sqrt{r^2 - 1} + \arccos\frac1r\right)
    $$

    $r = 2$ 时概率 0.837、期望交点 1.273；$r = 5$ 时概率 0.936、期望交点 3.183。$r = 1$ 代入回到 $2/\pi$。
- **常见错误：长针直接套 $2l/(\pi d)$ 当概率**。$r > \pi/2$ 时它已经大于 1。记住公式算的是**期望交点数**，只有短针两者重合。
- **用来估 $\pi$ 效率极低**：$\hat\pi = \frac{2l \cdot n}{d \cdot H}$（$H$ 为相交次数）。$l = d$ 时 $n \cdot \mathrm{Var}(\hat\pi) \to \pi^2 \frac{1-p}{p} \approx 5.63$——标准差 $\approx 2.37/\sqrt n$，想让标准差降到 0.001 要扔约 **560 万次**。短针里 $l = d$ 已是最优（方差随 $p$ 增大而减小）。
- **Lazzarini 1901 年的"结果"太好了**：他声称针长/线距 $= 5/6$、扔 3408 次、相交 1808 次，得 $\hat\pi = \frac{355}{113} = 3.1415929$，误差只有 $3 \times 10^{-7}$。按上式这个实验的标准差约 0.05——比它精确 5 个数量级。$3408 = 16 \times 213$、$1808 = 16 \times 113$，几乎可以断定是凑着 $355/113$ 停手的。
- **同款"不积分"思路**：期望的线性性不要求独立，这一招在[固定点问题](fixed-points.md)（随机排列的期望不动点恰为 1）里是同一把钥匙；"概率化面积"的部分则和[约会问题](meeting-problem.md)同源。
- **推广**：Cauchy–Crofton 公式——平面曲线的长度等于它与随机直线交点数的积分，Buffon's noodle 是它的概率版本。

??? note "数值验证"

    ```python
    import math, random

    def p_cross(r):
        """针长 l、线距 d，r = l/d。"""
        if r <= 1:
            return 2 * r / math.pi
        return 2 / math.pi * (r - math.sqrt(r * r - 1) + math.acos(1 / r))

    random.seed(2026)

    def throw(r):
        """d = 1：中心纵坐标 y∈[0,1)，锐角 θ∈[0,π/2)，返回针与横线的交点数。"""
        y, th = random.random(), random.random() * math.pi / 2
        h = r / 2 * math.sin(th)
        return math.floor(y + h) - math.floor(y - h)

    T = 10**6
    for r in (0.5, 1, 2, 5):
        xs = [throw(r) for _ in range(T)]
        print(r, round(p_cross(r), 4), sum(x > 0 for x in xs) / T, sum(xs) / T, round(2 * r / math.pi, 4))
    # r    精确概率  模拟概率   模拟期望交点  2r/π
    # 0.5  0.3183   0.318143  0.318143    0.3183
    # 1    0.6366   0.635775  0.635775    0.6366
    # 2    0.8372   0.836612  1.272376    1.2732
    # 5    0.9361   0.936474  3.18461     3.1831

    def noodle(T=300000):
        """三节各长 0.6 的随机折线（总长 1.8），期望交点数应为 2·1.8/π。"""
        tot = 0
        for _ in range(T):
            x, y, ang = random.random(), random.random(), random.random() * 2 * math.pi
            for k in range(3):
                if k: ang += random.uniform(-2, 2)
                nx, ny = x + 0.6 * math.cos(ang), y + 0.6 * math.sin(ang)
                tot += abs(math.floor(ny) - math.floor(y))
                x, y = nx, ny
        return tot / T
    print(noodle(), round(3.6 / math.pi, 4))      # 1.14478 1.1459

    print(2 * (5 / 6) * 3408 / 1808 == 355 / 113)   # True  Lazzarini 1901
    p = 2 / math.pi
    c = math.pi ** 2 * (1 - p) / p                 # l = d 时 n·Var(π̂) 的渐近值
    print(round(c, 3), round(c / 1e-6))            # 5.634 5633534
    r = 5 / 6; p = 2 * r / math.pi
    print(round(math.sqrt(math.pi ** 2 * (1 - p) / p / 3408), 4), 3408 / 213, 1808 / 113)   # 0.0506 16.0 16.0
    ```
