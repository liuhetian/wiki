<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/talking-head-recut/NOTICE.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 署名声明

`talking-head-recut` skill（包括它基于卡片的设计系统 —— 样式、布局、画框、字体，以及由 GSAP 驱动的 composition 工作流）**改编自**开源项目 **vtake-skills**（`vtake-cut`）：

> https://github.com/notedit/vtake-skills

为本仓库所做的改编：更名为 `talking-head-recut`；转写改为通过 `hyperframes transcribe` 调用本地 Whisper（去掉了第三方的 `@notedit/vtake` CLI 和 `vtake.app` 代理）；音频 / 元数据提取改为直接内联调用 `ffmpeg`/`ffprobe`；移除了固定的第三方品牌片尾，改为一个可选的中性片尾；产出物对齐 `videos/<project>/` 约定。

原项目采用 MIT 许可证；按要求，其许可声明保留如下。

```
MIT License

Copyright (c) 2026 leeoxiang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
