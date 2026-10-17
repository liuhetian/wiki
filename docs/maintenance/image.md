---
description: "图片生成的维护记录：CodeProxy 文档里我们用到的几点，2026-10-02 经海外中转实测生成和编辑（原图用 data URI）、返回格式和模型列表，同日从 gpt-image-2 换到 gpt-image-2.5；用接口不用看，出问题再看"
---

# 图片生成的维护记录：CodeProxy 的 gpt-image-2.5

这是[生成、编辑图片](../skills/agent-io/reference/image.md)背后的维护记录。用接口时不用看，接口出问题或者要换模型时再看。

## 接口从哪来 { #upstream }

CodeProxy（`codeproxy.dev`）是转售 OpenAI 模型的第三方中转，从国内直连会超时，所以挂在海外机上。文档是用户从 CodeProxy 后台贴过来的，用到的是这几点：

- 生成 `POST /v1/images/generations`，编辑 `POST /v1/images/edits`，都用 JSON 提交。编辑的原图放在 `images` 数组的 `image_url` 里，分辨率字段写 `image_resolution`。
- `gpt-image-2`、`gpt-image-2-2k`、`gpt-image-2-4k` 只认 `openai-default` 分组下的 key，所以中转机上配的 key 要在这个分组里建。文档没提 `gpt-image-2.5` 认哪个分组，现在这把 key 调得通。
- 文档提到还有异步接口，适合耗时更长、需要追踪任务的场景，但没给细节。模型列表里有 `gpt-image-2-async`。

## 实测 { #tests }

2026-10-02 经海外中转实测，前四行是用 `gpt-image-2` 时测的，带「2.5」的三行是同一天换成 `gpt-image-2.5` 之后补测的：

| 请求 | 结果 |
|---|---|
| key 还没配到中转机上时 | token 通过后，网关自己返回 503：`CodeProxy API key is not configured.` |
| `GET /v1/models` | 200，12 个模型 |
| 生成，`size: "1:1"` | 200，33 秒，得到 1254×1254 的 PNG，1.75 MB |
| 编辑，原图是 512 px PNG 的 data URI，`size: "1024:1024"`、`image_resolution: "1k"` | 200，41 秒，得到 1254×1254 的 PNG，只改了要求改的地方 |
| 2.5 生成，`size: "1:1"`，白底马克笔草图带英文手写字 | 200，31 秒，1254×1254，1.48 MB，画风和文字都对 |
| 2.5 编辑，参数跟第四行一样，原图是上一行的结果缩到 512 px，要求给猫戴巫师帽 | 200，46 秒，1254×1254，只加了帽子，其余几乎原样 |
| 2.5 生成，`size: "16:9"`，画面里要四个中文手写字 | 200，41 秒，1672×940，中文字写对了 |
| 2026-10-17，2.5 生成，`size: "1:1"`，curl | 200，98 秒 |
| 2026-10-17，2.5 编辑，原图 966×1024 JPEG 的 data URI，`size: "1:1"`，Python urllib 发两次 | 两次都是 62 秒左右 499，返回体为空；换 User-Agent 也一样 |
| 同一个请求，curl 默认 HTTP/2 | 200，121 秒 |
| 同一个请求，`curl --http1.1` | 499，62 秒 |
| 2026-10-17，2.5 编辑，`size: "2:3"`，curl HTTP/2，旧刊物海报的四段 prompt | 200，204 秒，1024×1536，2.99 MB |
| 2026-10-17，2.5 编辑，`size: "1:1"`，curl HTTP/2，两张人像并发转彩色手绘 | 都是 200，155 秒和 162 秒，1254×1254 |

- 返回里只有 `b64_json` 和 `revised_prompt`，没有 `url`。2.5 也一样，请求参数和返回格式都跟 2 相同，换模型只改 `model` 字段。
- `size` 不管写 `1:1` 还是 `1024:1024`，出来的都是 1254×1254。2026-10-17 再测 1:1 编辑，出来是 1254×1254；2:3 出 1024×1536。
- 2026-10-17 比 10-02 慢了两三倍。HTTP/1.1 在 62 秒被掐，HTTP/2 不会：是中转机的 Caddy 还是 CodeProxy 的 nginx 在掐，没查，海外机现在登不上。
- PNG 里带 C2PA 内容凭证。
- 模型列表：图片模型有 `gpt-image-2`、`gpt-image-2-2k`、`gpt-image-2-4k`、`gpt-image-2-async`、`gpt-image-2.5`；文本模型有 `gpt-5.4`、`gpt-5.5`、`gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-6-astra`、`gpt-6-sol`、`gpt-6.1-sol`。

## 没做的 { #not-done }

- 异步接口没接，也没测。
- `-2k`、`-4k` 没测；2.5 没有对应的 2k、4k 版本。
- 16:9、2:3 以外的非 1:1 比例没测。
- 2.5 和 2 没拿同一个 prompt 对比过。
- 编辑时用 URL 传原图没测，只测了 data URI。
- 文本模型没试，价格没查。
- 海外机重装之后，本机的 SSH 公钥没装回去，所以中转配置没看到，也没同步进 `assets/gateway/`。
