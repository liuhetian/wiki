---
description: "多源 BFS：把所有起点一起放进队列当第 0 层，按层扩散，层数就是时间；最后查一遍有没有够不着的"
---

# 994. 腐烂的橘子

[LeetCode 994](https://leetcode.cn/problems/rotting-oranges/) · 中等 · 图论

## 题

网格里 `0` 是空格，`1` 是新鲜橘子，`2` 是烂橘子。每过一分钟，烂橘子会让上下左右相邻的新鲜橘子也烂掉。问最少几分钟后没有新鲜橘子；永远烂不完就返回 `-1`。

例：`[[2,1,1],[1,1,0],[0,1,1]]` → `4`；`[[2,1,1],[0,1,1],[1,0,1]]` → `-1`（左下角那个够不着）。

## 一句话

所有烂橘子一起入队当第 0 层，BFS 一层就是一分钟；层数走完还剩新鲜的，就是 `-1`。

## 关键技巧

**多个起点同时扩散 = 超级源点。** 想象一个虚拟节点连向所有烂橘子，从它 BFS 一步就到全部起点——所以直接把所有起点作为第 0 层入队，结果和单源 BFS 一样正确。**每个新鲜橘子第一次被访问时的层数，就是它到最近烂橘子的距离**，也就是它烂掉的时刻。

**不能对每个烂橘子分别跑 BFS。** 分别跑再取最小，复杂度乘上起点数；而多源 BFS 每格只进队一次，$O(mn)$。

**按层处理，才能数分钟。** 每轮先记下当前队列长度，只处理这么多个，处理完分钟 +1。

**用计数判断「烂不完」。** 开头数出新鲜橘子数 `fresh`，每烂一个减一；BFS 结束时 `fresh > 0` 就是有够不着的。循环条件写 `while q and fresh`，最后一层腐烂后不会多算一分钟，一开始就没有新鲜橘子时直接返回 0。

## 解

```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        q, fresh = deque(), 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 2:
                    q.append((i, j))
                elif grid[i][j] == 1:
                    fresh += 1
        minutes = 0
        while q and fresh:  # 有 fresh 才扩散，避免最后空转一分钟
            for _ in range(len(q)):
                x, y = q.popleft()
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == 1:
                        grid[nx][ny] = 2
                        fresh -= 1
                        q.append((nx, ny))
            minutes += 1
        return -1 if fresh else minutes
```

时间 $O(mn)$，空间 $O(mn)$。

## 延伸

- 单纯数连通块、不关心时间：[200. 岛屿数量](0200-number-of-islands.md)。
- 同样是多源 BFS 求「到最近源点的距离」：[542. 01 矩阵](https://leetcode.cn/problems/01-matrix/)、[286. 墙与门](https://leetcode.cn/problems/walls-and-gates/)。
- BFS 按层推进的另一个典型：[102. 二叉树的层序遍历](0102-binary-tree-level-order-traversal.md)；图上的按层剥离还有 [207. 课程表](0207-course-schedule.md) 的拓扑排序。
- **坑**：边界情况「没有新鲜橘子」答案是 0，即使也没有烂橘子；「有新鲜但没有烂的」是 -1。

??? note "自测"

    ```python
    s = Solution()
    assert s.orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) == 4
    assert s.orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]) == -1
    assert s.orangesRotting([[0, 2]]) == 0
    assert s.orangesRotting([[0]]) == 0
    assert s.orangesRotting([[1]]) == -1
    assert s.orangesRotting([[2, 1, 1, 1, 2]]) == 2  # 两头同时烂
    ```
