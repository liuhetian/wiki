---
description: "图片区零散收集的维护记录：人像写真模板、一杯狗海报、旧刊物海报这几条单条收进来的 prompt 各自从哪来、存档时改了什么"
---

# 图片区零散收集

`gallery/images/collected/` 放不成套、单条收进来的 prompt，一条一节。页面只留标题、图和 prompt，来源记在本页。

| 页面 | 条目 | 来源 | 收录日期 | 配图 |
|---|---|---|---|---|
| [人像写真模板](../../gallery/images/collected/gallery-portrait-templates.md) | 东方女性曲线型写真助手 | 仓库作者贴进对话，原始出处未记 | 2026-09-29 | 2026-10-10 补：DeepSeek 补全参数，gpt-image-2.5 生成，3:4 |
| [人像写真模板](../../gallery/images/collected/gallery-portrait-templates.md) | 短视频主页自拍网格截图 | 小红书「Cesar的AI修炼日记」的笔记反向拆解了一下提示词，可自取尝试[^xiaohongshu]，prompt 取自作者给的 docx | 2026-10-10 | 我们用 gpt-image-2.5 按原文生成，9:16 |
| [品牌海报](../../gallery/images/collected/gallery-brand-posters.md) | 一杯狗宠物咖啡店海报 | 仓库作者贴进对话，原始出处未记；海报底部署名 WENSHUANG DESIGNN(SHENZHEN).CHINA（原文拼写） | 2026-10-17 | 原图原样收录，PNG 1080×1360 |
| [旧刊物海报](../../gallery/images/collected/gallery-pulp-posters.md) | 把照片重构成 pulp 印刷海报的整套做法 | GitHub 仓库 Nealsun1993/neil-quentin[^nq-repo] 的 `SKILL.md`，钉在 `4e4140e`（2026-08-11），MIT；从抖音「AI硬核实测」的 15 秒演示视频[^nq-video]认出 skill 名后搜到 | 2026-10-17 | 原图和上游成品原样收录，只改了文件名；另有一张我们用 gpt-image-2.5 实测的成品 |

## 存档时做了哪些改动

- prompt 一字未改，照原样收录，包括原文里的笔误（「鞋面吗」「丝里丝」）和前后说法不一致的地方（开头写「苗条曲线型」，补全清单里写「丰腴曲线型」）
- 这条 prompt 是一段「生图助手」的系统指令，要求模型先补全参数、再输出图片；不是直接喂给生图接口的单条描述。配图分两步：把它当 system 指令交给 deepseek-v4-pro，用户消息只写「参数都不指定，全部按模板默认值补全」；再把回复去掉开头「好的，马上生成。」交给 gpt-image-2.5。中间那条 prompt 折叠在页面里。和那条 prompt 不一致的地方：丝袜光泽不明显
- 「短视频主页自拍网格截图」的 prompt 从 docx 里取出，一字未改。配图没有转载作者的原图，是我们按原文生成的。和原文不一致的地方：点赞数没有四位数，10 万以上有 5 格（原文要求 3 格四位数、2 格 10 万以上）；帽子上有一个小标志
- 「一杯狗宠物咖啡店海报」原作没有附 prompt。页面里那条是我们按[七维拆解](../../skills/collab/image-prompt-reverse/seven-dimensions/index.md)看图反推的复刻版，还没拿它出过图，跟原图差多少不知道。prompt 里底部那行小字只写「LOVE & PEACE」，没写设计工作室的署名
- 「旧刊物海报」不是一条 prompt，是一个 Codex skill 的整套做法，整页中译并改写：
    - **怎么找到的**：视频只演示在 Agent 客户端里选 6 张照片、输入 `neil-quentin` 调用，口播没给出处；画面里的会话标题是「GitHub下载技能」，按 skill 名搜到了仓库。视频用 agent-io 的 `douyin.py` 经中转取下，没直接访问抖音；它是成品演示不是教程，没整理成视频笔记
    - **没收**：`README.md`（Codex 的安装方法和目录结构，特点和限制在 SKILL 里都有）；`agents/openai.yaml`（客户端显示名和默认调用语句，意思已经在页首介绍里）；视频里的 6 张成品（只有录屏画面）
    - **结构**：标题从「neil-quentin v0.3」改成「旧刊物海报」；12 步流程提到前面当地图；「输出格式」改写成「交付什么」，授权与隐私并进去；「编译字段」和「提示词结构」合成「编四段 prompt」；硬性避免单独成节；定向修正改成两列表
    - **接口**：上游只说「拿照片当参考去生成」，改成调 agent-io 的 gpt-image-2.5 编辑接口，写明 `size`、分辨率和耗时；加了一句 prompt 用中文写、英文单独成行
    - **实测**：新增一节，拿上游示例原图（裁掉右边约 175 px 宽的黑边）跑了一次，又按定向修正改了一次小字。修正表后加了一句：小字个别字母拼错不算失败，别为它花掉唯一一次修正——依据是专门修小字只少了一个错字，上游的修正表只管小字成了噪点、乱码的情况
    - **图**：`pulp-poster-towers-photo.jpg`、`pulp-poster-dusk-circuit.png` 是仓库 `examples/` 下的 `01-architecture-before.jpg`、`01-architecture-after.png`；`pulp-poster-tower-hours.webp` 是我们实测的

    ??? abstract "neil-quentin 的 MIT 许可证原文，按条款随收录保留"

        ```text
        MIT License

        Copyright (c) 2026 Nealsun1993

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

[^nq-repo]: [Nealsun1993/neil-quentin](https://github.com/Nealsun1993/neil-quentin)，钉 commit 的永链 [tree @ 4e4140e](https://github.com/Nealsun1993/neil-quentin/tree/4e4140eb386c005d4b1bfbfc42695c1ae93db697)，2026-10-17 读。
[^nq-video]: [90年代PLUP电影海报skill](https://www.douyin.com/video/7696843767693126905)，抖音作品 ID 7696843767693126905，2026-10-15 发布，经 TikHub 中转读取，2026-10-17。
[^xiaohongshu]: [反向拆解了一下提示词，可自取尝试](https://www.xiaohongshu.com/discovery/item/6aac9f930000000011036d69)，2026-10-15 读。
