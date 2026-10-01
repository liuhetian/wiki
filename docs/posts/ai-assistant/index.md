---
description: "给常驻 Agent 接上现实世界的输入输出：数据从哪进来、结果往哪出去，一篇讲一个通道"
---

# 搭建 AI 助手

AI助手经常迁移服务器，折腾来折腾去，所以目标是根据这个文档，能够快速重新搭建出来一个。

除了最基础的和外部应用链接，还需要：

0. 开发环境：[新机器配开发环境：zsh、uv、Node.js](dev-env.md) —— 新 Ubuntu 机器按顺序复制粘贴五步；装完 zsh 必须手动改 `$SHELL`，否则 nvm 会写进 `~/.bashrc`，zsh 里找不到 node
1. 先用 caddy 进行反向代理完全覆盖 header 为localhost访问，进行域名绑定
2. API 中转：[Caddy 换 key 转发](api-gateway.md)，Agent 只拿一个网关 token，不存厂商 key；DeepSeek 已在国内机上线，附真实配置、装机验收和排障清单；厂商 key 打码写在文中（[为什么能公开放密文](../wiki-tech/age-mosaic.md)）
3. 基础能力（接入说明和脚本见 [Agent 基础能力](../../skills/agent-io/index.md)）：

    | 能力 | 读取 | 生成 |
    |---|---|---|
    | PDF | [阅读 PDF](../../skills/agent-io/reference/pdf.md) | — |
    | 音频 | 转录（语音转文本） | 生成特定音色音频、生成音乐 |
    | 图片 | - | 生成图片、编辑图片 |
    | 视频 | 阅读视频 | 生成视频 |
    | 网络 | 网络搜索 | — |
    | 调用大模型 | - | [调用 DeepSeek](../../skills/agent-io/reference/deepseek.md) |
    
4. 信息收集：[接收邮件](mail-intake.md)
5. 知识输出：维护文档


具体任务：

1. 每日整理邮件
2. 每个月检查使用的仓库的更新，例如 fastapi zensical langfuse 等等
3. 每周检查仓库更新：dsh-harness
4. 每周检查 github 趋势
5. 整理AI意见领袖
6. 论文分析


对于整理邮件关注的板块：

- 数字人、tts、llm、
- 流行的skill
- 新模型