---
description: "前缀和 + 哈希搬上树：根到当前节点就是一条「数组」，回溯时把前缀和计数撤掉，只留祖先链"
---

# 437. 路径总和 III

[LeetCode 437](https://leetcode.cn/problems/path-sum-iii/) · 中等 · 二叉树

## 题

给一棵二叉树和目标和 `targetSum`，数有多少条**向下**的路径（从某个祖先到某个后代，起点终点任意）节点值之和等于 `targetSum`。

例：`root = [10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], targetSum = 8` → `3`（`5→3`、`5→2→1`、`-3→11`）。

## 一句话

根到当前节点的路径就是一段数组；以当前节点结尾、和为 `t` 的路径数 = 祖先链上前缀和等于 `cur - t` 的个数，用哈希表计数，回溯时撤销。

## 关键技巧

**向下路径 = 根到当前节点这条链上的一段连续子数组。** 固定终点 `node`，设 $S$ 为根到 `node` 的前缀和，起点在某个祖先 `a` 的下方时，路径和为 $S - S_a$。要它等于 $t$，就是要数祖先链上有多少个 $S_a = S - t$——和 [560. 和为 K 的子数组](0560-subarray-sum-equals-k.md) 一模一样。

**树和数组的唯一区别：前缀只能来自祖先。** 兄弟子树的前缀和不能被计入。DFS 天然维护「当前路径」：进入节点时 `cnt[S] += 1`，离开时 `cnt[S] -= 1`。这样任何时刻哈希表里恰好是根到当前节点这条链上的前缀和。

**初始化 `cnt[0] = 1`。** 代表「空前缀」，让从根开始的路径也能被数到。

**先查后存。** 先用 `cnt[S - t]` 累计答案，再把 `S` 放进表——否则 $t = 0$ 时会把「空路径」算进去。

暴力是每个节点当起点往下 DFS，$O(n \cdot h)$，最坏 $O(n^2)$；前缀和降到 $O(n)$。

## 解

```python
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        cnt = Counter({0: 1})  # 祖先链上的前缀和 -> 出现次数

        def dfs(node, s):
            if not node:
                return 0
            s += node.val
            res = cnt[s - targetSum]  # 以 node 结尾的合法路径数
            cnt[s] += 1
            res += dfs(node.left, s) + dfs(node.right, s)
            cnt[s] -= 1               # 回溯：离开 node，它不再是祖先
            return res

        return dfs(root, 0)
```

时间 $O(n)$，空间 $O(h)$（哈希表只存当前路径，加递归栈）。

## 延伸

- 数组版原型是 [560. 和为 K 的子数组](0560-subarray-sum-equals-k.md)；「查前缀里见过没有」的母题是 [1. 两数之和](0001-two-sum.md)。
- 「进入时加、离开时撤」是 DFS 回溯维护路径状态的通用写法，和 [46. 全排列](0046-permutations.md) 的 `used` 数组同理。
- 节点值可为负，所以不能用滑动窗口，也不能剪枝。

??? note "自测"

    ```python
    s = Solution()
    assert s.pathSum(build_tree([10, 5, -3, 3, 2, None, 11, 3, -2, None, 1]), 8) == 3
    assert s.pathSum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22) == 3
    assert s.pathSum(build_tree([]), 0) == 0
    assert s.pathSum(build_tree([0, 0, 0]), 0) == 5  # 三个单点 + 两条父子
    assert s.pathSum(build_tree([1, -1, None, 1]), 1) == 3  # 两个单点 1 + 整条链
    ```
