---
description: "Trie 把共同前缀合并成共同路径，查询只和单词长度有关；节点上的 is_end 标记区分「走得到」和「是个词」——search 与 startsWith 只差这一位"
---

# 208. 实现 Trie (前缀树)

[LeetCode 208](https://leetcode.cn/problems/implement-trie-prefix-tree/) · 中等 · 图论

## 题

实现一个类 `Trie`，支持三个操作：

- `insert(word)`：插入一个单词；
- `search(word)`：这个单词是否被插入过；
- `startsWith(prefix)`：是否有插入过的单词以 `prefix` 开头。

只含小写字母。

例：`insert("apple")` 后，`search("apple") → true`，`search("app") → false`，`startsWith("app") → true`；再 `insert("app")`，`search("app") → true`。

## 一句话

每个节点是一个「字符 → 子节点」的表，单词就是从根往下的一条路径，路径终点打一个 `is_end` 标记。

## 关键技巧

**把字符放在边上，前缀共用路径。** `apple` 和 `app` 共用 `a→p→p` 这段；插入和查询都是从根出发、按字符一步步往下走，复杂度 $O(L)$，$L$ 是单词长度，**与已存单词的数量无关**——这是它比「哈希表存所有单词」强的地方：哈希表答不了前缀问题。

**`is_end` 区分「路径存在」和「单词存在」。** 插入 `apple` 后，`app` 这条路径存在，但 `app` 没被插入过。所以：

- `startsWith`：路径走得通就是 `true`；
- `search`：路径走得通，**并且**终点 `is_end` 为真。

两个查询共用同一个「沿路径走」的辅助函数，只在最后一步判断不同。

**子节点用 dict 还是长度 26 的数组。** dict 省空间、代码短；数组访问更快，但每个节点固定占 26 格。Python 里 dict 通常更划算。

## 解

```python
class TrieNode:
    __slots__ = ("children", "is_end")

    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def _walk(self, s):
        """沿 s 往下走，走不通返回 None。"""
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None
```

时间：每个操作 $O(L)$；空间：插入总字符数 $O(\sum L)$。

## 延伸

- **带通配符 `.` 的查询**：[211. 添加与搜索单词](https://leetcode.cn/problems/design-add-and-search-words-data-structure/)，遇到 `.` 就对所有子节点 DFS。
- **Trie + 网格回溯**：[212. 单词搜索 II](https://leetcode.cn/problems/word-search-ii/) 把所有候选词建成 Trie，在 [79. 单词搜索](0079-word-search.md) 的回溯里沿 Trie 剪枝，一次搜出全部单词。
- 字典匹配判断可拆分：[139. 单词拆分](0139-word-break.md) 的 DP 里，用 Trie 从每个位置往后匹配可以省掉切片和哈希。
- **坑**：`search` 忘了判 `is_end`，就会把前缀当成单词；`startsWith("")` 按定义为 `true`（空前缀人人都有），`_walk("")` 返回根节点，天然满足。

??? note "自测"

    ```python
    t = Trie()
    t.insert("apple")
    assert t.search("apple") is True
    assert t.search("app") is False
    assert t.startsWith("app") is True
    t.insert("app")
    assert t.search("app") is True
    assert t.search("appl") is False
    assert t.startsWith("b") is False
    assert t.search("applepie") is False
    assert t.startsWith("") is True
    ```
