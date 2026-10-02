---
description: "Agent 读 PDF 脚本的维护记录：pdfium 和 pdf-inspector 实测对比、吸收的两个 DSH 社区插件、没做的；用脚本不用看，出问题再看"
---

# 读 PDF 脚本的维护记录：引擎实测与吸收的两个 DSH 插件

这是 [阅读 PDF](../../../skills/agent-io/reference/pdf.md) 背后的维护记录：引擎为什么这样选、从哪些上游插件拿了什么。用脚本不用看，脚本出问题或者要改脚本时再看。

PDF 里没有现成的"文字层"和"图片层"：每页是一串绘图指令，包括画字形、画矢量线条和贴位图。**文字靠解析文字指令提取，图片靠把整页渲染出来**。这两种结果都是推导出来的，所以文字不够用时就看渲染图。

- [引擎怎么选：实测对比](#engines)
- [吸收的两个 DSH 插件](#upstream)
- [没做的](#not-done)

## 引擎怎么选：实测对比 { #engines }

测试材料是一份 12 页的中文日报：headless Chrome 打印生成，中英文混排，末页有表格。2026-09-29 在本机实测：

| 做法 | 语序 | 换行 | 表格 | "人工"两个字 | 扫描件 |
|---|---|---|---|---|---|
| pdfium `get_text_bounded` | 对 | 保留 | 一行一格，用空格分隔 | 正常 | 返回空，由脚本提示改用 `render` |
| pdf-inspector `extract_pages_markdown` | **错**：中文段落里的英文和数字被挪到行首 | 段落合并 | 重建成 GFM 表格 | 正常 | 标出需要 OCR 的页 |
| Claude Code Read | 对 | 保留 | 文字里一行一格，另有渲染图 | 文字层是康熙部首"⼈⼯"，渲染图正常 | 靠渲染图 |

pdf-inspector 在中文段落上的实际输出（原文是"GPT-6 Astra 发布次日引爆社区：鹈鹕骑自行车 SVG 测试成为标志性评测方式，466 赞的楼主发现……"）：

> GPT-6 Astra SVG 466 发布次日引爆社区：鹈鹕骑自行车 测试成为标志性评测方式， " " 4o 赞的楼主发现 极高 推理等级画出的鹈鹕惨不忍睹

结论：**正文交给 pdfium，pdf-inspector 只用于分类和表格**。它判断"扫描件 / 需要 OCR 的页"很准：用两页纯图片合成的 PDF 测试，结果是 `scanned`，置信度 0.95，两页都被标出。但它的语序问题不能让模型直接吃进去。

康熙部首问题出在这份 PDF 字体的 ToUnicode 映射表上，Claude Code 的文字层原样照搬了。pdfium 和 pdf-inspector 取出的都是正常汉字，脚本另外做了一层映射兜底。

## 吸收的两个 DSH 插件 { #upstream }

DeepSeek Harness 官方的 `read` 不读 PDF（`tool-fs` README 写的是 "PDF, audio, and video remain deferred"），社区在 [Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions?discussions_q=pdf) 里做了几个插件。这里存档的是其中两个的核心文件，只取和读 PDF 有关的几份。两者都是**只提取文字**，都不给模型看页面图片。

| 插件 | 钉的 commit | 许可证 | 存档 |
|---|---|---|---|
| [jiaoqsh/dsh-document](https://github.com/jiaoqsh/dsh-document/tree/393aad9bbc454f4ac182ac8326e2749cdd761514)（[帖子 #2746](https://github.com/deepseek-ai/deepseek-harness/discussions/2746)） | `393aad9`（2026-08-16） | MIT，原文 [LICENSE](assets/pdf-upstream/dsh-document/LICENSE) | `src/tool.ts`、`pdf-inspector.ts`、`pdf-worker.ts`、`pages.ts` |
| [vaxilicaihouxian/dsh-pdf-reader](https://github.com/vaxilicaihouxian/dsh-pdf-reader/tree/0758700ce796b0354e9d6b64db85fdcaa28077f3)（[帖子 #6449](https://github.com/deepseek-ai/deepseek-harness/discussions/6449)） | `0758700`（2026-09-12） | MIT，只在 `package.json` 里声明，上游没有 LICENSE 文件 | `src/pdf-reader.ts` |

抓取日期都是 2026-09-29。上游 README、Office 转换、浏览器阅读视图和测试都没有收，要看原貌请点上面钉了 commit 的链接。

### dsh-document：pdf-inspector 放进 Worker 线程

新增一个 `read_document` 工具，参数设计和内置的 `read` 一致：`file_path` + `offset` / `limit` 按行分页，PDF 另外多一个 `pages`。转换关掉了图片输出：

> `includePageMarkers: true, includeImages: false`

- 每次转换新开一个 Worker 线程，取消就直接 terminate，大文件不会卡住 DSH 主进程。
- 页码写法 `"1-3,7"`、`<!-- Page N -->` 页标记、开头给出 `<warning>` 列出缺文字的页，这三点本脚本都照搬了。
- 引擎是 pdf-inspector，所以中文语序的问题它也有。插件作者自己也写了 "layout-heavy PDFs may collapse paragraphs into long lines"。

??? abstract "dsh-document `src/pdf-worker.ts`（Worker 里调 pdf-inspector）"

    ```ts
    --8<-- "posts/ai-assistant/maintenance/assets/pdf-upstream/dsh-document/src/pdf-worker.ts"
    ```

??? abstract "dsh-document `src/pdf-inspector.ts`（分类、页码越界、扫描件报错）"

    ```ts
    --8<-- "posts/ai-assistant/maintenance/assets/pdf-upstream/dsh-document/src/pdf-inspector.ts"
    ```

??? abstract "dsh-document `src/tool.ts`（给模型的工具定义和输出格式）"

    ```ts
    --8<-- "posts/ai-assistant/maintenance/assets/pdf-upstream/dsh-document/src/tool.ts"
    ```

??? abstract "dsh-document `src/pages.ts`（页码写法解析）"

    ```ts
    --8<-- "posts/ai-assistant/maintenance/assets/pdf-upstream/dsh-document/src/pages.ts"
    ```

### dsh-pdf-reader：pdf.js 拼接文字片段

`pdf_open` 一次性解析全部页面的文字，缓存在内存里，`pdf_extract` 再按页码范围取。插件的重点是阅读流程：阅读位置写进会话日志、笔记另存为 `paper.pdf.dsh-notes.md`、侧栏有阅读视图。取文字只有一行：

> `content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ').trim()`

- `getTextContent()` 返回的是带坐标的文字片段，用空格拼接后再压缩空白，**一页变成一整行**，段落和表格结构都丢了。这一点是读代码得出的，没有实际跑过。
- 没有文字的页返回空字符串，也不提示原因；本脚本改成给出 `<warning>`，并提示改用 `render`。
- 依赖里有 `@napi-rs/canvas`，但 Host 端源码没有用到。只有浏览器阅读视图在 canvas 上画页面，那是给人看的。

??? abstract "dsh-pdf-reader `src/pdf-reader.ts`"

    ```ts
    --8<-- "posts/ai-assistant/maintenance/assets/pdf-upstream/dsh-pdf-reader/src/pdf-reader.ts"
    ```

### 本脚本从中拿了什么、补了什么

- 拿来：dsh-document 的页码写法、页标记、缺文字页的 `<warning>`，以及按页分段、输出设上限的思路；dsh-pdf-reader 的按页码范围读取。
- 补上：pdfium 按阅读顺序取文字，替代有语序问题的引擎；`render` 渲染页面图片，处理扫描件和图表；`info` 给出下一步建议；康熙部首映射。
- 形态不同：插件是 DSH 里的 tool，有 schema 校验和沙箱；这里是脚本，任何有 shell 的 Agent 都能跑。代价是没有沙箱，输出上限要靠脚本自己的 `--max-chars` 控制。

## 没做的 { #not-done }

- **OCR**：pdf-inspector 有 `process_pdf_with_ocr`，但第一次调用要下载 OCR 模型，这里没有接入，也没有测。现在扫描件只能靠 `render` 加上能看图的模型。
- **页面里的嵌入图片单独导出**：没有做。`render` 出的是整页。
- 超大 PDF（几百 MB）的内存占用没有测过。
- **可以再砍**：去掉 `markdown` 命令和 pdf-inspector 依赖。它现在只做两件事——判断扫描件（pdfium 取不到文字的页就是扫描页）和重建表格（中文语序有问题，本来就要打折扣用）。去掉后脚本剩三个命令、两个依赖。没做，要改得重新测。

??? abstract "完整脚本 `scripts/pdf_read.py`"

    ```python
    --8<-- "skills/agent-io/scripts/pdf_read.py"
    ```
