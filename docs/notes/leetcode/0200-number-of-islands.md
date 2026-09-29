---
description: "数连通块 = 外层扫到一个没访问的陆地就计数 +1，再 flood fill 把整块淹掉；入队时就标记，每格只处理一次"
---

# 200. 岛屿数量

[LeetCode 200](https://leetcode.cn/problems/number-of-islands/) · 中等 · 图论

## 题

一张由 `'1'`（陆地）和 `'0'`（水）组成的网格，上下左右相连的陆地算同一座岛。数有几座岛。

例：

```text
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1
```

→ `3`。

## 一句话

逐格扫，遇到陆地就岛数 +1，并从它出发 BFS 把整座岛改成水，之后扫到这座岛的其他格子就不会重复计数。

## 关键技巧

**网格就是图。** 每个格子是节点，上下左右相邻的陆地之间有边；一座岛就是一个连通分量。「数岛」就是「数连通分量」。

**外层循环负责找新分量，内层遍历负责吞掉整个分量。** 外层扫到一个还没访问过的陆地，它一定属于一座没数过的岛——如果那座岛数过了，它早就在那次遍历里被标记了。所以每次命中计数 +1，然后遍历把整座岛标记。

**原地改 `'0'` 当 visited。** 省一个 $m \times n$ 的访问数组；不允许改输入时再另开。

**入队时就标记，不是出队时。** 出队才标记的话，一个格子可能被好几个邻居重复入队，最坏退化；入队即标记保证每格进队一次。

**用 BFS / 显式栈，不用递归 DFS。** 网格最大 $300 \times 300$，一整片陆地的递归深度可达 9 万，Python 默认递归上限 1000，直接爆。

## 解

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] != "1":
                    continue
                count += 1
                grid[i][j] = "0"  # 入队即标记
                q = deque([(i, j)])
                while q:
                    x, y = q.popleft()
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == "1":
                            grid[nx][ny] = "0"
                            q.append((nx, ny))
        return count
```

时间 $O(mn)$，空间 $O(\min(m, n))$（BFS 队列最宽处是一条对角线）。

## 延伸

- **并查集**也能做：每块陆地和右、下邻居 union，最后数根的个数。数量不变时不如 BFS 直白，但岛屿动态增加时（[305. 岛屿数量 II](https://leetcode.cn/problems/number-of-islands-ii/)）只能用它。
- 同一个 flood fill 模板的变体：[695. 岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/)（遍历时计数）、[130. 被围绕的区域](https://leetcode.cn/problems/surrounded-regions/)（从边界反向淹）。
- 从多个起点**同时**扩散、按层计时：[994. 腐烂的橘子](0994-rotting-oranges.md)。
- 网格上的回溯搜索（要撤销标记）：[79. 单词搜索](0079-word-search.md)——那里标记是路径级的，这里是全局的，不撤销。

??? note "自测"

    ```python
    s = Solution()
    g = [list("11110"), list("11010"), list("11000"), list("00000")]
    assert s.numIslands(g) == 1
    g = [list("11000"), list("11000"), list("00100"), list("00011")]
    assert s.numIslands(g) == 3
    assert s.numIslands([["0"]]) == 0
    assert s.numIslands([["1"]]) == 1
    assert s.numIslands([list("10101")]) == 3
    # 大片陆地，递归 DFS 会爆栈
    assert s.numIslands([["1"] * 300 for _ in range(300)]) == 1
    ```
