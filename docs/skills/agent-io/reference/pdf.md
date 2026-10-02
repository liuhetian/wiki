---
description: "Agent 读 PDF：下载 pdf_read.py，info 看哪些页没文字，text 取正文，没文字的页和图表页 render 成 PNG 交给看图工具"
---

# 阅读 PDF

脚本：[scripts/pdf_read.py](../scripts/pdf_read.py)。依赖写在脚本头部，`uv run` 时自动装 pypdfium2、pdf-inspector、pillow。

```bash
curl -fsSO https://wiki.liuhetian.work/skills/agent-io/scripts/pdf_read.py

uv run pdf_read.py info     report.pdf               # 页数、哪些页没文字、表格页
uv run pdf_read.py text     report.pdf --pages 1-5   # 正文，按页标 <!-- Page N -->
uv run pdf_read.py render   report.pdf --pages 3,7   # 没文字的页、图表页渲染成 PNG
uv run pdf_read.py markdown report.pdf --pages 12    # 表格页重建成表格
```

- 按 `info` → `text` → `render` 的顺序读；`info` 最后一行 `next:` 给出下一步该跑的命令。
- `text` 超过 `--max-chars`（默认 30000 字符）就在页边界截断，并提示下一次该传的 `--pages`。
- `render` 出的 PNG 交给看图工具；看不了图，就告诉用户这几页读不到，别反复重试。
- 中文段落以 `text` 为准；`markdown` 只用来看表格，它会把中文段落里的英文和数字挪乱。
- 页码从 1 开始，写成 `1-3,7` 或 `4-`；`render` 一次最多 10 页；加密 PDF 传 `--password`（`markdown` 不支持）。
- 退出码 2 表示参数不对，stderr 一行写出原因和改法。

维护记录：[引擎为什么这样选、吸收了哪些上游插件](../../../posts/ai-assistant/maintenance/pdf-reading.md)。正常使用不用看，脚本出问题再看。
