---
description: "能否修完 = 有向图有没有环；Kahn 拓扑排序反复剥掉入度为 0 的点，剥不完就有环——DFS 三色标记是同一个判断的另一种写法"
---

# 207. 课程表

[LeetCode 207](https://leetcode.cn/problems/course-schedule/) · 中等 · 图论

## 题

`numCourses` 门课编号 `0` 到 `numCourses - 1`，`prerequisites[i] = [a, b]` 表示修 `a` 之前必须先修完 `b`。问能不能把所有课修完。

例：`2` 门课，`[[1,0]]` → `true`；`[[1,0],[0,1]]` → `false`（互为前置）。

## 一句话

把依赖建成有向图 `b → a`，不断修掉「没有未完成前置」（入度为 0）的课；最后修掉的门数等于总数就能修完。

## 关键技巧

**转成图论问题：修得完 ⇔ 依赖图无环。** 有环时环上每门课都等着另一门，谁都修不了；无环时一定存在拓扑序，按序修即可。

**Kahn 算法：入度为 0 的点可以直接修。** 维护每个点的入度（还剩几门前置没修）。入度为 0 的全入队；每弹出一门课，它的所有后继入度减一，减到 0 的入队。

**为什么「剥不完」就说明有环。** 环上的每个点都有一条来自环内的入边，只要环上还没有任何点被剥掉，这些入边就一直在，入度永远不为 0——所以环上的点一个都进不了队。反过来，无环图里剩下的点构成的子图也无环，必有入度为 0 的点，过程不会卡住。**修掉的数量 == `numCourses` 恰好等价于无环。**

**DFS 三色法**是另一种写法：`0` 未访问、`1` 在当前递归栈上、`2` 已确认安全。DFS 时遇到状态 `1` 的邻居，就是沿路径绕回了栈上的点——有环。

## 解

=== "DFS 三色"

    ```python
    class Solution:
        def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
            graph = [[] for _ in range(numCourses)]
            for a, b in prerequisites:
                graph[b].append(a)
            state = [0] * numCourses  # 0 未访问，1 在栈上，2 已确认无环

            def has_cycle(u):
                state[u] = 1
                for v in graph[u]:
                    if state[v] == 1 or (state[v] == 0 and has_cycle(v)):
                        return True
                state[u] = 2
                return False

            return not any(state[u] == 0 and has_cycle(u) for u in range(numCourses))
    ```

    时间 $O(V + E)$，空间 $O(V + E)$。链状依赖的递归深度可达 $V$（最多 2000），本地跑可能要 `sys.setrecursionlimit`。

=== "Kahn 拓扑排序"

    ```python
    class Solution:
        def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
            graph = [[] for _ in range(numCourses)]
            indeg = [0] * numCourses
            for a, b in prerequisites:
                graph[b].append(a)
                indeg[a] += 1
            q = deque(u for u in range(numCourses) if indeg[u] == 0)
            done = 0
            while q:
                u = q.popleft()
                done += 1
                for v in graph[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0:  # 前置全部修完
                        q.append(v)
            return done == numCourses  # 剥不完就有环
    ```

    时间 $O(V + E)$，空间 $O(V + E)$。

## 延伸

- **要输出一个修课顺序**：[210. 课程表 II](https://leetcode.cn/problems/course-schedule-ii/)，Kahn 里出队顺序就是答案；DFS 版是后序（状态变 2 的顺序）反转。
- 无向图判环不能用入度，改用并查集或 DFS 时跳过父节点。
- 同样按层推进的 BFS：[994. 腐烂的橘子](0994-rotting-oranges.md)；网格图的连通分量：[200. 岛屿数量](0200-number-of-islands.md)。
- **坑**：边的方向。`[a, b]` 是「b 是 a 的前置」，边从 `b` 指向 `a`；反过来建图，判环结论不变，但到 210 要输出顺序时就反了。

??? note "自测"

    ```python
    s = Solution()
    assert s.canFinish(2, [[1, 0]]) is True
    assert s.canFinish(2, [[1, 0], [0, 1]]) is False
    assert s.canFinish(1, []) is True
    assert s.canFinish(3, [[0, 0]]) is False  # 自环
    assert s.canFinish(4, [[1, 0], [2, 1], [3, 2], [1, 3]]) is False
    assert s.canFinish(5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]]) is True
    assert s.canFinish(2000, [[i + 1, i] for i in range(1999)]) is True  # 长链
    ```
