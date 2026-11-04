---
description: "Agent 读 PDF：下载 pdf_read.py，read 取正文，没文字的扫描页自动走百度 PaddleOCR-VL 文档识别（公式出 LaTeX、表格出 HTML，要 MY_API_KEY），公式表格读乱了加 --parse；图不在文字里，按每页的提示打开裁好的图或 render"
---

# 阅读 PDF

脚本：[scripts/pdf_read.py](../scripts/pdf_read.py)。依赖写在脚本头部，`uv run` 时自动装 pypdfium2、pillow。

```bash
curl -fsSO https://wiki.liuhetian.work/skills/agent-io/scripts/pdf_read.py

uv run pdf_read.py read   report.pdf                      # 从头读，按页标 <!-- Page N -->
uv run pdf_read.py read   report.pdf --pages 12-20        # 读指定页
uv run pdf_read.py read   report.pdf --pages 12 --parse   # 有文字，但公式、表格读乱了
uv run pdf_read.py render report.pdf --pages 3,7          # 渲染成 PNG，看图、核对
```

- **有文字的页直接取文字**，不花钱。公式、表格读乱了（分式拍平、上下标掉到正文里、表格一格一行），对那几页加 `--parse` 重读。
- **没文字的页自动走文档识别**：扫描页交给百度 PaddleOCR-VL，走国内中转，先按[用法](../index.md#usage)载入 `MY_API_KEY`。公式出 LaTeX、带式子编号，表格出 HTML，页标记带书上印的页码，比如 `<!-- Page 100 (printed 089, parsed) -->`。没有 token 时这些页标成没读，改用 `render`。
- **识别按页收费**，单价没查到，用量在百度控制台看；每次最多识别 10 页（`--max-parse`），几页要十几秒到半分钟。结果存在 PDF 旁边的 `<文件名>.parsed/`，再读同一页不收费。
- **图不在文字里**，每页都会提示：
    - 识别过的页，图已经裁好存进缓存目录，原位置是一行 `[Figure 1 of page 62: …/page-062-fig-1.jpg …]`，用看图工具打开
    - 直接取文字的页，嵌进去的图片提示成 `[Page 5 has 2 image(s) not in the text …]`，`render` 那页看；矢量画的图检测不到 —— 看到图题（Figure 3、图 6.3）却没有提示，就 `render` 那一页
    - 看不了图，就告诉用户这几张图读不到，别反复重试
- **表格超过 300 格会提示核对**：太密的表末尾几格可能被识别丢掉，`render` 那页对一下。
- 输出超过 `--max-chars`（默认 30000 字符）或识别页数到了上限，就在页边界停下，末尾提示下一次该传的 `--pages`。
- 页码从 1 开始，写成 `1-3,7` 或 `4-`；`render` 一次最多 10 页；加密 PDF 传 `--password`。
- 退出码 2 表示参数不对，stderr 一行写出原因和改法；识别失败不退出，那几页标成没读，`<warning>` 写原因。

维护记录：[两条路怎么选、实测对比、吸收了哪些上游插件](../../../maintenance/pdf-reading.md)。正常使用不用看，脚本出问题再看。
