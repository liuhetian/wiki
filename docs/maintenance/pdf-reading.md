---
description: "Agent 读 PDF 脚本的维护记录：直接取文字和文档识别各自的实测对比（pdfium、pdf-inspector；百度高精度 OCR、PaddleOCR-VL），图片怎么发现，吸收的两个 DSH 社区插件，没做的；用脚本不用看，出问题再看"
---

# 读 PDF 脚本的维护记录：两条路的实测与吸收的两个 DSH 插件

这是 [阅读 PDF](../skills/agent-io/reference/pdf.md) 背后的维护记录：两条路各用什么引擎、为什么、从哪些上游插件拿了什么。用脚本不用看，脚本出问题或者要改脚本时再看。

PDF 里没有现成的"文字层"和"图片层"：每页是一串绘图指令，包括画字形、画矢量线条和贴位图。**有文字指令的页，文字直接解析出来；扫描页只有一张贴图，只能看图认字**。脚本就是这两条路：有文字的页 pdfium 直接取，没文字的页交给文档识别。图两条路都进不了文字，单独提示。

- [直接取文字：pdfium 和 pdf-inspector](#engines)
- [没文字的页：高精度 OCR 和 PaddleOCR-VL](#parsing)
- [图怎么发现](#figures)
- [吸收的两个 DSH 插件](#upstream)
- [没做的](#not-done)

## 直接取文字：pdfium 和 pdf-inspector { #engines }

测试材料是一份 12 页的中文日报：headless Chrome 打印生成，中英文混排，末页有表格。2026-09-29 在本机实测：

| 做法 | 语序 | 换行 | 表格 | "人工"两个字 | 扫描件 |
|---|---|---|---|---|---|
| pdfium `get_text_bounded` | 对 | 保留 | 一行一格，用空格分隔 | 正常 | 返回空，由脚本提示改用 `render` |
| pdf-inspector `extract_pages_markdown` | **错**：中文段落里的英文和数字被挪到行首 | 段落合并 | 重建成 GFM 表格 | 正常 | 标出需要 OCR 的页 |
| Claude Code Read | 对 | 保留 | 文字里一行一格，另有渲染图 | 文字层是康熙部首"⼈⼯"，渲染图正常 | 靠渲染图 |

pdf-inspector 在中文段落上的实际输出（原文是"GPT-6 Astra 发布次日引爆社区：鹈鹕骑自行车 SVG 测试成为标志性评测方式，466 赞的楼主发现……"）：

> GPT-6 Astra SVG 466 发布次日引爆社区：鹈鹕骑自行车 测试成为标志性评测方式， " " 4o 赞的楼主发现 极高 推理等级画出的鹈鹕惨不忍睹

结论：**正文交给 pdfium，pdf-inspector 不用**。它判断"扫描件 / 需要 OCR 的页"很准：用两页纯图片合成的 PDF 测试，结果是 `scanned`，置信度 0.95，两页都被标出。但它的语序问题不能让模型直接吃进去，剩下的两件事也都有更好的做法：扫描页 pdfium 取不到字就能判断，表格交给[文档识别](#parsing)重建。

康熙部首问题出在这份 PDF 字体的 ToUnicode 映射表上，Claude Code 的文字层原样照搬了。pdfium 和 pdf-inspector 取出的都是正常汉字，脚本另外做了一层映射兜底。

## 没文字的页：高精度 OCR 和 PaddleOCR-VL { #parsing }

测试材料是向蓉美《统计学》（第三版）：242 页、327 MB 的扫描件，生成工具写的是 ABBYY FineReader，但没有文字层。挑了 7 页：封面、章首、表格加公式、正文夹行内公式、统计图加带编号的公式、Excel 输出表、附录 F 分布表。两个都是百度的接口，走[国内中转](../projects/ai-assistant/api-gateway.md)的 `baidu-proxy`。2026-11-03 实测：

| | 通用文字识别（高精度版）`accurate_basic` | 文档解析 PaddleOCR-VL |
|---|---|---|
| 调用 | 同步，一页一次，1–4 秒 | 异步：提交、轮询、从 BOS 下结果，1–5 页 6–33 秒 |
| 中文正文 | 几乎全对，保留原书的硬换行 | 几乎全对，段落合成整段 |
| 公式 | 带上下标的全坏 | LaTeX，求和、分式、x̄、多行对齐式基本全对 |
| 表格 | 一格一行，看不出行列 | HTML 表格，空格子和"—"都在 |
| 页眉页脚 | 页码、侧边章名混进正文 | 单独标成 `number`、`aside_text` |

第 100 页的 (4.27) 式，原书是 ŷ_{t+1} = E_t = αy_t + (1−α)E_{t−1}：

> accurate_basic：`91=E1=ay1+(1-a)E,`
>
> PaddleOCR-VL：`\hat{\mathcal{Y}}_{i+1}=E_{i}=\alpha y_{i}+\left(1-\alpha\right)E_{i-1}`

PaddleOCR-VL 把 t 认成了 i，是抽查里唯一一处公式错。结论：**没文字的页交给 PaddleOCR-VL，`accurate_basic` 不接** —— 它只在正文上能用，PaddleOCR-VL 全面比它强。

接 PaddleOCR-VL 时遇到的事，脚本都处理了：

- **单个文件不超过 50 MB**：用 `file_data` 上传的上限，这本书只能拆页。pdfium 把要识别的页拼成小 PDF，原扫描图不重新渲染，超过 15 MB 就对半拆。
- **式子编号被丢**：结构化结果里有 `formula_number` 块，API 自己拼的 Markdown 里没有。脚本按版面块重新拼页面，把编号补成 `\tag{4.27}`；跟在行内公式后面的，就接在那段末尾。
- **书上印的页码**：在 `number` 块里，PDF 第 100 页是 089，写进页标记。
- **图表解析开关会编数**：`analysis_chart` 打开后，F 分布曲线被"读"成一张数据表，数是目测出来的。F(2,3) 在 0 处给了 0.00，曲线在那里却是最高点。这个开关不开。
- **密集表格末尾被截**：F 分布表 50 行 × 17 列，最后一行 ∞ 只到 `2.`，后面 8 格没了，接口不报错。脚本给超过 300 格的表加一行提示，让 AI `render` 核对。同一张表第 25 行、n₁=20 那格读成 2.79，对照原图，书上印的就是 2.79（正确值约 2.70），识别没错。
- **错误 token 像断网**：网关不读请求体就回 401，几 MB 的上传会被直接断开，报成连接错误。脚本先发一个不计费的空查询验 token。
- **百度出错也回 HTTP 200**：错误写在 `error_code` 里，每次都要查。
- **结果链接 30 天过期**：Markdown、结构化结果和裁好的图都是带签名的 BOS 地址。脚本当场下载，存进 PDF 旁边的缓存目录。

花费：按页计费，查询结果里有 `cost_page_num`。百度的价格页列了通用文字识别（高精度版个人认证每月免费 1000 次，超出 0.03 元一次起），没列文档解析，网上也没查到官方单价。这次测试一共识别了 19 页，`accurate_basic` 调了 5 次。

## 图怎么发现 { #figures }

- **识别过的页**：版面块类型是 `image` 或 `chart`，带位置，`images` 里有裁好的图（`data_url`）。API 的 Markdown 只给大图留 `<img>`，封面上的出版社标志（`footer_image`）一个字没留。脚本把面积占页面 2% 以上的图下载到缓存，原位置换成一行提示，图题照常是正文。
- **直接取文字的页**：pdfium 取文字时不管图。嵌进去的位图能数出来、算出面积：在 PaddleOCR-VL 论文[^paddleocr-vl]（71 页，有文字）上，第 1、5、6、9、25–28 页和第 33 页往后都找到了。矢量图是一串路径，和表格框线是同一种对象：论文第 8、12 页各有几十、上百条路径，渲染出来全是表格线。所以矢量图不检测，说明页让 AI 看到图题就 `render`。

## 吸收的两个 DSH 插件 { #upstream }

DeepSeek Harness 官方的 `read` 不读 PDF（`tool-fs` README 写的是 "PDF, audio, and video remain deferred"），社区在 Discussions[^discussions] 里做了几个插件。这里存档的是其中两个的核心文件，只取和读 PDF 有关的几份。两者都是**只提取文字**，都不给模型看页面图片。

| 插件 | 钉的 commit | 许可证 | 存档 |
|---|---|---|---|
| jiaoqsh/dsh-document[^dsh-document]（帖子 #2746[^discussions-2746]） | `393aad9`（2026-08-16） | MIT | `src/tool.ts`、`pdf-inspector.ts`、`pdf-worker.ts`、`pages.ts` |
| vaxilicaihouxian/dsh-pdf-reader[^dsh-pdf-reader]（帖子 #6449[^discussions-6449]） | `0758700`（2026-09-12） | MIT，只在 `package.json` 里声明，上游没有 LICENSE 文件 | `src/pdf-reader.ts` |

抓取日期都是 2026-09-29。上游 README、Office 转换、浏览器阅读视图和测试都没有收，要看原貌请点上面钉了 commit 的链接。

### dsh-document：pdf-inspector 放进 Worker 线程

新增一个 `read_document` 工具，参数设计和内置的 `read` 一致：`file_path` + `offset` / `limit` 按行分页，PDF 另外多一个 `pages`。转换关掉了图片输出：

> `includePageMarkers: true, includeImages: false`

- 每次转换新开一个 Worker 线程，取消就直接 terminate，大文件不会卡住 DSH 主进程。
- 页码写法 `"1-3,7"`、`<!-- Page N -->` 页标记、开头给出 `<warning>` 列出缺文字的页，这三点本脚本都照搬了。
- 引擎是 pdf-inspector，所以中文语序的问题它也有。插件作者自己也写了 "layout-heavy PDFs may collapse paragraphs into long lines"。

??? abstract "dsh-document `src/pdf-worker.ts`（Worker 里调 pdf-inspector）"

    ```ts
    --8<-- "maintenance/assets/pdf-upstream/dsh-document/src/pdf-worker.ts"
    ```

??? abstract "dsh-document `src/pdf-inspector.ts`（分类、页码越界、扫描件报错）"

    ```ts
    --8<-- "maintenance/assets/pdf-upstream/dsh-document/src/pdf-inspector.ts"
    ```

??? abstract "dsh-document `src/tool.ts`（给模型的工具定义和输出格式）"

    ```ts
    --8<-- "maintenance/assets/pdf-upstream/dsh-document/src/tool.ts"
    ```

??? abstract "dsh-document `src/pages.ts`（页码写法解析）"

    ```ts
    --8<-- "maintenance/assets/pdf-upstream/dsh-document/src/pages.ts"
    ```

### dsh-pdf-reader：pdf.js 拼接文字片段

`pdf_open` 一次性解析全部页面的文字，缓存在内存里，`pdf_extract` 再按页码范围取。插件的重点是阅读流程：阅读位置写进会话日志、笔记另存为 `paper.pdf.dsh-notes.md`、侧栏有阅读视图。取文字只有一行：

> `content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ').trim()`

- `getTextContent()` 返回的是带坐标的文字片段，用空格拼接后再压缩空白，**一页变成一整行**，段落和表格结构都丢了。这一点是读代码得出的，没有实际跑过。
- 没有文字的页返回空字符串，也不提示原因；本脚本给出 `<warning>`，有网关 token 就走文档识别，没有就提示改用 `render`。
- 依赖里有 `@napi-rs/canvas`，但 Host 端源码没有用到。只有浏览器阅读视图在 canvas 上画页面，那是给人看的。

??? abstract "dsh-pdf-reader `src/pdf-reader.ts`"

    ```ts
    --8<-- "maintenance/assets/pdf-upstream/dsh-pdf-reader/src/pdf-reader.ts"
    ```

### 本脚本从中拿了什么、补了什么

- 拿来：dsh-document 的页码写法、页标记、缺文字页的 `<warning>`，以及按页分段、输出设上限的思路；dsh-pdf-reader 的按页码范围读取。
- 补上：pdfium 按阅读顺序取文字，替代有语序问题的引擎；没文字的页走[文档识别](#parsing)，有识别页数上限和缓存；每页提示[图在哪](#figures)；`render` 渲染页面图片；康熙部首映射。
- 形态不同：插件是 DSH 里的 tool，有 schema 校验和沙箱；这里是脚本，任何有 shell 的 Agent 都能跑。代价是没有沙箱，输出上限要靠脚本自己的 `--max-chars` 和 `--max-parse` 控制。

## 没做的 { #not-done }

- **本地 OCR**：pdf-inspector 的 `process_pdf_with_ocr`、本地部署的 PaddleOCR，第一次用都要下载模型，没接也没测。没有网关 token 时，扫描页只能 `render` 加能看图的模型。
- **矢量图检测**：见[图怎么发现](#figures)。
- **文档识别的单价**：没查到。
- **加密 PDF 走文档识别**：拆页时 pdfium 已经用口令打开了文件，拼出的小 PDF 不带加密，照理能识别，没测。
- **超大 PDF 的内存占用**：327 MB 这本拆页、识别都正常，更大的没测。

??? abstract "完整脚本 `scripts/pdf_read.py`"

    ```python
    --8<-- "skills/agent-io/scripts/pdf_read.py"
    ```

[^discussions]: [Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions?discussions_q=pdf)，2026-10-02 读。
[^dsh-document]: [jiaoqsh/dsh-document](https://github.com/jiaoqsh/dsh-document/tree/393aad9bbc454f4ac182ac8326e2749cdd761514)，2026-10-02 读。
[^discussions-2746]: [帖子 #2746](https://github.com/deepseek-ai/deepseek-harness/discussions/2746)，2026-10-02 读。
[^dsh-pdf-reader]: [vaxilicaihouxian/dsh-pdf-reader](https://github.com/vaxilicaihouxian/dsh-pdf-reader/tree/0758700ce796b0354e9d6b64db85fdcaa28077f3)，2026-10-02 读。
[^discussions-6449]: [帖子 #6449](https://github.com/deepseek-ai/deepseek-harness/discussions/6449)，2026-10-02 读。
[^paddleocr-vl]: [PaddleOCR-VL: Boosting Multilingual Document Parsing via a 0.9B Ultra-Compact Vision-Language Model](https://arxiv.org/abs/2510.14528v1)，arXiv 2510.14528v1，2026-11-03 读。
