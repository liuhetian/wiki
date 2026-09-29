---
description: "网格回溯：进格子时原地打标记、出来时还原，用 board 本身当 visited；匹配失败立刻返回，一格一字符地剪"
---

# 79. 单词搜索

[LeetCode 79](https://leetcode.cn/problems/word-search/) · 中等 · 回溯

## 题

给一个字符网格和一个单词，判断单词能否由网格里上下左右相邻的格子依次拼出；同一个格子在一条路径里只能用一次。

例：网格 `[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]`，`word = "ABCCED"` → `true`；`"ABCB"` → `false`（`B` 不能用两次）。

## 一句话

以每个格子为起点 DFS，第 $k$ 步只走到字符等于 `word[k]` 的邻格；进格时把它改成占位符、回退时改回来，「同一格只用一次」就靠这一改一还。

## 关键技巧

**visited 必须是「当前路径」而不是「全局」。** 这和岛屿类的 flood fill 不同——一个格子在这条路径上走不通，换条路径可能还要用它。所以标记要在回溯时撤销，这正是回溯与普通 DFS 的区别。

**原地标记省空间。** 进格子时 `board[i][j] = "#"`，任何字母都不会等于 `#`，自然不会再走进来；返回前还原。省掉一个 $m \times n$ 的 visited 数组。

**剪枝。**

- 当前格字符 `!= word[k]` 立即返回 `False`，不展开四个方向。
- 找到一条就用 `or` 短路返回，不再探索其他分支。
- 预检：单词里某个字符的出现次数超过网格里的——直接 `False`。再进一步，若 `word` 末字符在网格里比首字符少，把 `word` 反转再搜，起点更少、分支更早被剪。

## 解

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        cnt = Counter(ch for row in board for ch in row)
        if any(cnt[ch] < k for ch, k in Counter(word).items()):
            return False
        if cnt[word[0]] > cnt[word[-1]]:
            word = word[::-1]  # 从稀有的一端起搜

        def dfs(i, j, k):
            if board[i][j] != word[k]:
                return False
            if k == len(word) - 1:
                return True
            board[i][j] = "#"
            found = any(
                0 <= x < m and 0 <= y < n and dfs(x, y, k + 1)
                for x, y in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1))
            )
            board[i][j] = word[k]  # 还原
            return found

        return any(dfs(i, j, 0) for i in range(m) for j in range(n))
```

时间 $O(mn \cdot 3^L)$（每步除来路外最多 3 个方向，$L$ 为单词长），空间 $O(L)$ 递归深度。

## 延伸

- **不撤销的网格 DFS**：[200. 岛屿数量](0200-number-of-islands.md) 标记后永不还原，因为每个格子只需被访问一次。区分的关键是「要找的是路径还是连通块」。
- **一次搜多个单词**（LeetCode 212）：把单词表建成 [208. 实现 Trie (前缀树)](0208-implement-trie-prefix-tree.md)，DFS 时沿 Trie 走，前缀不存在就剪。
- 坑：还原要写在四个方向都探完之后、`return` 之前；若在某个方向命中时直接 `return True`，board 会留下 `#`——本题答案不受影响，但调用方若复用 board 就错了。

??? note "自测"

    ```python
    s = Solution()
    g = lambda: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
    assert s.exist(g(), "ABCCED") is True
    assert s.exist(g(), "SEE") is True
    assert s.exist(g(), "ABCB") is False
    assert s.exist([["a"]], "a") is True
    assert s.exist([["a", "b"]], "ba") is True
    assert s.exist([["a", "a"]], "aaa") is False
    ```
