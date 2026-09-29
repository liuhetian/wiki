---
description: "先记每个字母最后出现的位置，扫描时把当前段的右界推到段内字母的最远末次出现，走到右界就切一刀"
---

# 763. 划分字母区间

[LeetCode 763](https://leetcode.cn/problems/partition-labels/) · 中等 · 贪心算法

## 题

把字符串 `s` 切成尽可能多的片段，要求每个字母只出现在一个片段里，返回各片段长度。

例：`s = "ababcbacadefegdehijhklij"` → `[9, 7, 8]`（`"ababcbaca"`、`"defegde"`、`"hijhklij"`）。

## 一句话

每个字母的「首次到末次」是一个必须整体落在同一段的区间；从左往右合并重叠区间，每合并出一块独立区间就是一段。

## 关键技巧

**预处理末次出现位置。** `last[c]` = 字母 `c` 最后一次出现的下标。一旦段里出现了 `c`，这段至少要延伸到 `last[c]`。

**扫描推右界。** 维护当前段的右界 `end = max(end, last[s[i]])`。`i == end` 时，段内所有字母的末次出现都不超过 `i`，后面不会再出现它们——此刻切开是合法的。

**为什么贪心不亏。** 能切就立刻切：在 `i == end` 处切，前面这段是满足约束的最短前缀；后面剩下的串和原问题同构、互不影响。任何合法划分的第一刀都不可能早于这里（否则某字母跨段），所以最早切给出的段数最多。

## 解

```python
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}  # 后写覆盖前写，得到末次位置
        res, start, end = [], 0, 0
        for i, c in enumerate(s):
            end = max(end, last[c])
            if i == end:                          # 段内字母都已收尾
                res.append(end - start + 1)
                start = i + 1
        return res
```

时间 $O(n)$，空间 $O(\Sigma)$，$\Sigma$ 为字符集大小（26）。

## 延伸

- **区间合并的本体**：[56. 合并区间](0056-merge-intervals.md)。本题等价于把每个字母的 `[首次, 末次]` 合并，只是按扫描顺序天然有序，不用排序。
- **「最远可达」同一个变量**：[55. 跳跃游戏](0055-jump-game.md) 的 `reach` 与这里的 `end` 是一回事——都在推一个区间右界。

??? note "自测"

    ```python
    s = Solution()
    assert s.partitionLabels("ababcbacadefegdehijhklij") == [9, 7, 8]
    assert s.partitionLabels("eccbbbbdec") == [10]
    assert s.partitionLabels("a") == [1]
    assert s.partitionLabels("abc") == [1, 1, 1]
    ```
