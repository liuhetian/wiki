---
description: "相撞掉头 ≡ 互相穿过，全部掉落最多 $L/v$；蚂蚁无名、只看幽灵，相对顺序不变给出每只的下场"
---

# 杆上蚂蚁相撞掉头

## 题

一根 1 米长的细杆上有若干只蚂蚁，每只以 1 cm/s 朝左或朝右爬。两只相遇就同时掉头，爬到端点就掉下去。

1. 无论蚂蚁多少、位置朝向如何，最坏要等多久才能保证全部掉下？
2. 具体例子：4 只蚂蚁在 20、50、70、90 cm 处，朝向依次为右、左、右、左。每只各在何时、从哪一端掉下？一共撞几次？

## 一句话

**把"相撞掉头"看成"互相穿过"**——两只蚂蚁长得一样，掉头和穿过在旁观者眼里是同一幅画面。于是每只"幽灵"都匀速直行，全部掉落的时刻就是幽灵里最慢的那个：最坏 **100 秒**，例题里是 **90 秒**。

## 关键技巧

**一、交换标签。** 两只蚂蚁在 $x$ 处相撞掉头，和它们不停步地互相穿过，产生的"位置集合 + 朝向集合"完全相同，只是两只的名字对调了。把名字抹掉，整个系统就退化成 $n$ 个互不干涉、各自直行的幽灵。

**二、不关心名字的问题，直接看幽灵。** "最后一只何时掉下""从左端一共掉下几只"这类问题只问集合，不问是谁——幽灵的答案就是真答案。朝右的幽灵在 $L - x$ 时掉下，朝左的在 $x$ 时掉下，全部掉落时刻为

$$
T = \max\Bigl(\max_{\text{朝左}} x_i,\ \max_{\text{朝右}} (L - x_i)\Bigr) \le L
$$

最坏情况只看"离它所朝的那端最远"的一只——比如贴着左端却朝右的那只，要走满整根杆。

**三、关心名字的问题，补一条不变量：相对顺序永不改变。** 蚂蚁不能穿过彼此，所以从左到右的排列次序始终如初。设朝左的幽灵有 $m$ 个，它们都从左端掉下——而从左端掉下的只能是最左边的 $m$ 只真蚂蚁，且按从左到右的顺序依次掉下。右端同理。

## 解

**第 1 问**：幽灵各自直行，最远走满一根杆，$100 / 1 = $ **100 秒**。这个界可以取到——左端点附近一只朝右的蚂蚁就要走将近 100 秒，旁边有多少蚂蚁跟它撞都不影响。

**第 2 问**：先算幽灵。

| 起点 | 朝向 | 幽灵掉落 |
| --- | --- | --- |
| 20 | 右 | 80 秒，右端 |
| 50 | 左 | 50 秒，左端 |
| 70 | 右 | 30 秒，右端 |
| 90 | 左 | 90 秒，左端 |

朝左的幽灵 2 个，掉落时刻 $\{50, 90\}$——所以最左的两只真蚂蚁（20、50 处）从左端掉下，先后为 50 秒、90 秒。朝右的幽灵掉落时刻 $\{30, 80\}$，归给最右的两只：最右的 90 处蚂蚁先掉（30 秒），70 处的后掉（80 秒）。

$$
20 \to (50\text{ s, 左}), \quad 50 \to (90\text{ s, 左}), \quad 70 \to (80\text{ s, 右}), \quad 90 \to (30\text{ s, 右})
$$

注意 90 处那只一开始朝左，最后却从右端掉下——撞一次就转了向。**最后一只在 90 秒掉下**。

碰撞次数也看幽灵：一对幽灵相遇当且仅当左边那只朝右、右边那只朝左。本例这样的"右…左"对有 $(20,50)$、$(20,90)$、$(70,90)$，共 **3 次**。

下图是时空图（横轴时间，纵轴位置）：四条直线就是幽灵，真蚂蚁的轨迹是同一组线段在交点处"折返"拼起来的。

```echarts
{
  "height": 320,
  "grid": {"left": 55, "right": 30, "top": 40, "bottom": 45},
  "legend": {"top": 0},
  "xAxis": {"type": "value", "name": "秒", "nameLocation": "middle", "nameGap": 26, "max": 100},
  "yAxis": {"type": "value", "name": "位置 cm", "min": 0, "max": 100},
  "series": [
    {"name": "20 右", "type": "line", "showSymbol": false, "data": [[0, 20], [80, 100]]},
    {"name": "50 左", "type": "line", "showSymbol": false, "data": [[0, 50], [50, 0]]},
    {"name": "70 右", "type": "line", "showSymbol": false, "data": [[0, 70], [30, 100]]},
    {"name": "90 左", "type": "line", "showSymbol": false, "data": [[0, 90], [90, 0]]}
  ]
}
```

## 延伸

- **随机摆放的期望**：$n$ 只蚂蚁位置独立均匀、朝向各半，每个幽灵的掉落时刻 $x$ 或 $L-x$ 都是 $U(0, L)$，且相互独立。全部掉落时刻是 $n$ 个均匀分布的最大值，$E[T] = \frac{n}{n+1} L$——5 只时约 83.3 秒。
- **某只特定蚂蚁何时掉**：从左数第 $k$ 只，若 $k \le m$（$m$ 为朝左幽灵数），它在朝左幽灵掉落时刻中第 $k$ 小的那个时刻从左端掉下；否则从右端掉下，时刻是朝右幽灵掉落时刻中第 $n+1-k$ 小的。只用到排序，不用模拟任何碰撞。
- **碰撞次数期望**：每对 $i<j$ 相撞当且仅当 $i$ 朝右、$j$ 朝左，概率 $\frac14$，所以 $E[\text{碰撞}] = \binom{n}{2} / 4$，10 只时 11.25 次。碰撞次数与位置无关、只看朝向序列里"右在左前"的逆序对。
- **环形杆**：没有端点，蚂蚁永远不掉。走满一圈的时间 $L/v$ 后，每个幽灵回到原位，位置集合复原——但名字整体轮换了：设顺时针 $r$ 只、逆时针 $l$ 只，按坐标增大（顺时针）方向给蚂蚁编号，第 $i$ 只落在初始第 $i + (r - l) \bmod n$ 只的位置。经典推论：经过 $n \cdot L/v$ 时间，所有蚂蚁一定全部回到自己的起点。
- **常见错误**：想逐次模拟碰撞。蚂蚁多了事件数是 $O(n^2)$，还容易漏掉同时相撞；"互相穿过"一步到位。另一个错误是以为掉头会让蚂蚁在杆上"困"更久——幽灵视角说明碰撞对集合时刻零影响。
- **同类技巧**：等质量小球一维弹性碰撞会交换速度，同样等价于互相穿过——一维硬球气体的动力学就是靠这一换变成自由粒子来解的。

??? note "数值验证"

    用分数做精确的事件驱动模拟（真的让蚂蚁相撞掉头），和幽灵公式逐只比对：

    ```python
    import random
    from fractions import Fraction as F

    def simulate(pos, dirs, L):
        """真实模拟：相撞掉头。返回 ({蚂蚁: (掉落时刻, 端)}, 碰撞次数)。速度 1。"""
        ants = [[F(p), d, i] for i, (p, d) in enumerate(zip(pos, dirs))]
        t, coll, out = F(0), 0, {}
        while ants:
            ants.sort(key=lambda a: a[0])
            cand = [((L - a[0]) if a[1] > 0 else a[0], 'fall', a) for a in ants]
            cand += [((b[0] - a[0]) / 2, 'hit', (a, b))
                     for a, b in zip(ants, ants[1:]) if a[1] > 0 and b[1] < 0]
            dt = min(c[0] for c in cand)
            for a in ants:
                a[0] += a[1] * dt
            t += dt
            for c in cand:
                if c[0] == dt:
                    if c[1] == 'fall':
                        a = c[2]; out[a[2]] = (t, 'R' if a[1] > 0 else 'L'); ants.remove(a)
                    else:
                        a, b = c[2]; a[1], b[1] = -1, 1; coll += 1
        return out, coll

    def ghost(pos, dirs, L):
        """幽灵公式：按相对顺序把幽灵的掉落时刻分给真蚂蚁。"""
        left = sorted(p for p, d in zip(pos, dirs) if d < 0)
        right = sorted(L - p for p, d in zip(pos, dirs) if d > 0)
        order = sorted(range(len(pos)), key=lambda i: pos[i])
        m, res = len(left), {}
        for k, i in enumerate(order):
            res[i] = (F(left[k]), 'L') if k < m else (F(right[len(pos) - 1 - k]), 'R')
        coll = sum(1 for a in range(len(pos)) for b in range(len(pos))
                   if pos[a] < pos[b] and dirs[a] > 0 and dirs[b] < 0)
        return res, coll

    random.seed(1)
    L = 100
    for _ in range(2000):
        n = random.randint(1, 8)
        pos = random.sample(range(1, L), n)
        dirs = [random.choice([-1, 1]) for _ in range(n)]
        assert simulate(pos, dirs, L) == ghost(pos, dirs, L)
    print("2000 组全部一致")

    pos, dirs = [20, 50, 70, 90], [1, -1, 1, -1]
    out, c = simulate(pos, dirs, L)
    print({pos[i]: (int(t), e) for i, (t, e) in sorted(out.items())}, c)
    # {20: (50, 'L'), 50: (90, 'L'), 70: (80, 'R'), 90: (30, 'R')} 3

    random.seed(2)
    n, T = 5, 200000
    tot = sum(max(random.uniform(0, L) if random.random() < .5 else L - random.uniform(0, L)
                  for _ in range(n)) for _ in range(T))
    print(tot / T, n * L / (n + 1))        # 83.401...  83.333...

    random.seed(3)
    n, T, tot = 10, 20000, 0
    for _ in range(T):
        pos = random.sample(range(1, 1000), n)
        dirs = [random.choice([-1, 1]) for _ in range(n)]
        tot += simulate(pos, dirs, 1000)[1]
    print(tot / T, n * (n - 1) / 8)        # 11.28095  11.25
    ```

    环形杆的"转名字"结论另写一个环上模拟核对：

    ```python
    import random
    from fractions import Fraction as F

    def ring(pos, dirs, L, T):
        """环上真实模拟到时刻 T。蚂蚁的环上顺序永不改变，按初始顺序返回位置。"""
        ants = [[F(p), d] for p, d in zip(pos, dirs)]
        n, t = len(ants), F(0)
        while True:
            dts = []
            for i in range(n):
                a, b = ants[i], ants[(i + 1) % n]
                if a[1] > 0 and b[1] < 0:
                    gap = (b[0] - a[0]) % L
                    dts.append(((gap or L) / 2, i))   # n=2 时刚撞完的另一侧间隙是整圈
            dt = min([d for d, _ in dts] + [T - t])
            for a in ants:
                a[0] = (a[0] + a[1] * dt) % L
            t += dt
            if t == T:
                return [a[0] for a in ants]
            for d, i in dts:
                if d == dt:
                    ants[i][1], ants[(i + 1) % n][1] = -1, 1

    random.seed(5)
    for _ in range(300):
        n, L = random.randint(2, 7), 100
        pos = sorted(random.sample(range(L), n))
        dirs = [random.choice([-1, 1]) for _ in range(n)]
        s = (dirs.count(1) - dirs.count(-1)) % n
        assert ring(pos, dirs, L, F(L)) == [F(pos[(i + s) % n]) for i in range(n)]
    print("300 组全对")
    ```
