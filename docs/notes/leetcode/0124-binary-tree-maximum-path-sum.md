---
description: "543 直径的带权版：返回单边最大贡献（负的就截成 0 不接），答案在拐点用「根 + 左贡献 + 右贡献」结算"
---

# 124. 二叉树中的最大路径和

[LeetCode 124](https://leetcode.cn/problems/binary-tree-maximum-path-sum/) · 困难 · 二叉树

## 题

树上一条路径是沿父子边相连的节点序列，每个节点至多出现一次，至少含一个节点，不必经过根。节点值可正可负，求所有路径中节点值之和的最大值。

例：`root = [-10, 9, 20, null, null, 15, 7]` → `42`（`15 → 20 → 7`）。

## 一句话

对每个节点算「从它往下走一条单边链的最大和」`gain`；以它为拐点的最佳路径 = `val + max(0, 左 gain) + max(0, 右 gain)`，全局取最大。

## 关键技巧

**按拐点分类，和 [543](0543-diameter-of-binary-tree.md) 同一骨架。** 每条路径有唯一的最高节点，以 `node` 为最高点的路径 = `node` + 至多一条往左下的链 + 至多一条往右下的链。

**返回值 ≠ 本节点结算值。**

- 返回给父亲：$g(\text{node}) = \text{val} + \max(0, g(L), g(R))$——父节点接上来时只能选一边往下走，否则就分叉了；
- 本节点结算：$\text{val} + \max(0, g(L)) + \max(0, g(R))$——双边。

**`max(0, ·)` 是「负贡献不接」。** 某一侧的最佳链和为负，接上只会拖累，不如不走那一侧。但节点自己的 `val` 必须算上——路径至少含一个节点，所以全是负数时答案是最大的那个负数，`ans` 初值要取 `-inf` 而不是 0。

## 解

```python
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        ans = -inf

        def gain(node):  # 从 node 往下的单边链最大和（必含 node）
            nonlocal ans
            if not node:
                return 0
            l = max(gain(node.left), 0)   # 负贡献截掉
            r = max(gain(node.right), 0)
            ans = max(ans, node.val + l + r)  # 以 node 为拐点结算
            return node.val + max(l, r)

        gain(root)
        return ans
```

时间 $O(n)$，空间 $O(h)$。

## 延伸

- 不带权、只数边的版本是 [543. 二叉树的直径](0543-diameter-of-binary-tree.md)。
- 截负的思路与 [53. 最大子数组和](0053-maximum-subarray.md) 的 Kadane 同源：前面的和为负就丢掉重来。树上的「前面」变成了子树。
- 坑：返回值里不能同时加 `l` 和 `r`；`ans` 初值不能是 0。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxPathSum(build_tree([1, 2, 3])) == 6
    assert s.maxPathSum(build_tree([-10, 9, 20, None, None, 15, 7])) == 42
    assert s.maxPathSum(build_tree([-3])) == -3
    assert s.maxPathSum(build_tree([-2, -1])) == -1           # 全负取最大单点
    assert s.maxPathSum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1])) == 48
    ```
