---
description: "DeepTutor 的知识库怎么接住一整本教材：解析引擎可换、不认的格式自动换引擎；一个库绑一个检索引擎，检索模式逐级取；每个索引版本记下 embedding 签名，重建先开新目录、核验通过才发布，换了模型旧索引不会被悄悄用上；向量加 BM25 两路合并；检索质量用题集打分。每一步配源码模版和实跑效果"
---

# 知识库：教材建成带签名的索引，换了模型不悄悄顶替

baseline 的做法是把 PDF 拖进聊天框。300 页的《应用统计学》要么超出上下文，要么被平台自己切块检索、切法不透明；每开一个新对话得重传一次；答案引的是哪一页说不清。DeepTutor 把材料建成一个知识库：先解析成文本，再按一个固定的引擎建索引，索引按版本存、带着建它的 embedding 身份，检索好不好还能拿题集量。下面每一步给出源码模版，能脱离应用跑的部分用 DeepTutor 自己的函数跑出效果；用的库叫「应用统计学」，里面是第 8 章「假设检验」的教材、讲义和习题答案。

## PDF 先变成文本，引擎可换 { #parse }

**问题**：一个库里混着三种文件：扫描版教材 PDF、Markdown 讲义、Word 习题答案。全局选了擅长版面识别的 MinerU，它不认 `.md`，整批导入就卡在讲义上。

**功能**：解析引擎全局选一个（text_only、markitdown、docling、mineru、pymupdf4llm、liteparse、tika）。选中的引擎不认某个后缀时，不报错，按固定顺序找一个装了且认这个后缀的引擎顶上：

```python title="模版 · deeptutor/services/parsing/service.py:43-49"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/parsing/service.py:43:49"
```

只有调用方点名要某个引擎时才保留报错：

```python title="模版 · deeptutor/services/parsing/service.py:154-172"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/parsing/service.py:154:172"
```

解析结果按「文件字节的哈希 + 引擎配置的签名」缓存，同一份文件、同一套配置只解析一次：

```python title="模版 · deeptutor/services/parsing/service.py:180-184"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/parsing/service.py:180:184"
```

**效果**：各引擎要装自己的依赖和模型，这一节没实跑，只贴模版。

全局设置是默认值，不是逐个文件的命令 —— 源码注释里写的正是混合库被一个 `.md` 拖垮的案例。缓存键带着引擎签名，换了引擎或改了引擎配置，旧缓存自然失效。

## 一个库绑一个引擎，检索模式逐级取 { #engine }

**问题**：教材适合向量检索，讲概念之间关系的问题适合知识图谱；放在聊天页里，用户没有选择，也不知道平台用的是哪种。

**功能**：建库时绑定一个检索引擎，之后加文件、检索都走它。自带九种：本地的 LlamaIndex、PageIndex、GraphRAG、LightRAG，外接的 LightRAG Server、PageIndex Cloud、腾讯 IMA、WeKnora、Kiwix：

```python title="模版 · deeptutor/services/rag/factory.py:1-30"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/factory.py:1:30"
```

LightRAG、GraphRAG 这类有多种检索模式的引擎，一次检索用哪种按四级取：这次调用指定的 → 库自己的设置 → 引擎卡的全局默认 → 引擎内置默认，每一级不在支持列表里就往下落：

```python title="模版 · deeptutor/services/rag/pipelines/modes.py:19-45"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/pipelines/modes.py:19:45"
```

**效果**：构造一份 `kb_config.json`，「应用统计学」库设成 `local`，LightRAG 的全局默认设成 `mix`：

```text title="效果 · resolve_kb_mode 逐级取模式"
--8<-- "projects/deeptutor/assets/sim/txt/knowledge-mode.txt"
```

写错的模式不会让检索失败，只会落到下一级。GitHub 仓库、网页、Obsidian 笔记库这类会变的来源另有同步任务，定期把变化的文件加进同一个库。

## 换了 embedding，旧索引不悄悄顶替 { #versions }

**问题**：库用本地的 bge-m3 建好了，后来在设置里换成 OpenAI 的 text-embedding-3-small。维度从 1024 变成 1536，两套向量不在一个空间里：拿新模型的查询向量去搜旧索引，要么报错，要么安静地搜出一堆不相干的段落，答案照样写得头头是道。

**功能**：一个 embedding 配置算出一个签名，是 binding、模型、维度、地址这几项的哈希：

```python title="模版 · deeptutor/services/rag/index_versioning.py:46-64"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/index_versioning.py:46:64"
```

每次整库重建都开一个新目录 `version-N`，先放一个 `.building.json`，不覆盖上一个能用的版本：

```python title="模版 · deeptutor/services/rag/index_versioning.py:364-387"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/index_versioning.py:364:387"
```

带着 `.building.json` 的目录，只有 `meta.json` 写明 `published` 才算就绪：

```python title="模版 · deeptutor/services/rag/index_versioning.py:155-157"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/index_versioning.py:155:157"
```

`meta.json` 在核验之后才写 —— 先确认存储落盘、源文件都进了索引，最后一步才发布：

```python title="模版 · deeptutor/services/rag/pipelines/llamaindex/pipeline.py:484-505"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/pipelines/llamaindex/pipeline.py:484:505"
```

读的时候只认签名一致、而且就绪的版本：

```python title="模版 · deeptutor/services/rag/index_versioning.py:268-283"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/index_versioning.py:268:283"
```

**效果**：在临时目录里用这些函数走一遍：bge-m3 建库、换模型重建、发布、再重建到一半中断。存储文件用占位 json 代替，其余都是上游代码算的：

```text title="效果 · 四个阶段的版本表和选中的版本"
--8<-- "projects/deeptutor/assets/sim/txt/knowledge-versions.txt"
```

重建期间用新模型读不到任何版本 —— 宁可没有，也不拿旧向量凑数；中断的 version-3 永远不就绪，旧的 version-2 照常可用。LightRAG 引擎更严，读和追加之前都核一遍签名，对不上直接拒：

```python title="模版 · deeptutor/services/rag/pipelines/lightrag/storage.py:258-269"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/pipelines/lightrag/storage.py:258:269"
```

界面上这件事落在知识中心的「索引版本」一栏。下面是照源码做的仿真界面，自动播放一次重建：

<iframe src="/projects/deeptutor/assets/demos/knowledge-center.html" style="width:100%;height:560px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：知识中心的索引版本与重建"></iframe>

??? abstract "demo 源码：knowledge-center.html"

    ```html
    --8<-- "projects/deeptutor/assets/demos/knowledge-center.html"
    ```

## 向量加关键词，两路合并 { #hybrid }

**问题**：问「α 和 β 什么关系」，符号在向量空间里几乎不占分量，纯向量检索容易漏掉正好写着这两个字母的那段；问「为什么不能说接受原假设」，换了说法的段落纯关键词又找不到。

**功能**：默认的 LlamaIndex 引擎在 hybrid 档下同时跑向量检索和 BM25，各取一批候选，用倒数排名融合（Reciprocal Rank Fusion，RRF）合成一个排序；没装 BM25 就退回纯向量，并记一条警告：

```python title="模版 · deeptutor/services/rag/pipelines/llamaindex/retrievers.py:151-191"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/pipelines/llamaindex/retrievers.py:151:191"
```

**效果**：要装 llama-index 和 embedding 服务，这一节没实跑，只贴模版。

融合只看名次，不看两路各自的分数，两种检索的分数尺度对不上也不要紧。之后还可以接一个交叉编码器重排，默认不开。

## 检索好不好，拿题集打分 { #eval }

**问题**：把切块从 512 调到 1024，或者从 LlamaIndex 换到 LightRAG，抽查几个问题答案看着差不多 —— 检索到底变好还是变坏，说不清。

**功能**：`deeptutor kb eval` 读一份 JSONL 题集，每题写明标准段落，检索一次，看前 k 段覆盖了哪些标准段落，算 Recall、Precision、nDCG、MRR、Hit、MAP 六个指标。全是纯函数，不调模型，同一份报告重算结果不变。同一条标准段落被两段引到，Recall 只算一次：

```python title="模版 · deeptutor/services/rag/eval/metrics.py:53-61"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/eval/metrics.py:53:61"
```

nDCG 只在某一名带来新的标准段落时给分，重复引同一段补不上缺的那段：

```python title="模版 · deeptutor/services/rag/eval/metrics.py:110-130"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/rag/eval/metrics.py:110:130"
```

**效果**：三道题的排序结果是构造的（每一名写它覆盖了第几条标准段落），打分用上游函数原样算：

```text title="效果 · 前 5 名的命中和六个指标"
--8<-- "projects/deeptutor/assets/sim/txt/knowledge-eval.txt"
```

q1 的 Precision 是 0.6 —— 第 1、2 名引的是同一段，按名次算都算命中；Recall 却按段落去重，两条都找到才是 1。`kb eval-diff` 拿两份报告逐题对比，改一个参数之后哪几题变差一眼可见。

## 谁管什么 { #split }

- **程序**：解析引擎回退和缓存键、索引版本目录、embedding 签名比对、重建时的发布守卫、两路检索的合并、评测指标
- **用户**：选解析引擎、建库时选检索引擎、embedding 和检索档位的设置、要不要重排、写评测题集
- **模型**：只拿检索出来的段落作答；embedding 和重排模型由用户配的服务提供
- **上游依赖**：LlamaIndex、LightRAG、GraphRAG、PageIndex 各管自己的索引格式，MinerU、Docling 这些解析引擎管版面识别

## 实跑原件 { #sim-files }

??? abstract "版本表四个阶段的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/knowledge-versions.json"
    ```

??? abstract "检索模式逐级取的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/knowledge-mode.json"
    ```

??? abstract "评测打分的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/knowledge-eval.json"
    ```
