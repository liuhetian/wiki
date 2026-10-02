---
description: "Agent 生成、编辑图片：CodeProxy 的 gpt-image-2.5，走海外中转 https://codeproxy.reverse-pro.xyz，MY_API_KEY 写成 Authorization: Bearer；生成和编辑都是 JSON 请求，同步返回 b64_json 格式的 PNG；编辑的原图放在 images[].image_url 里，本地图写成 data URI"
---

# 生成、编辑图片

用 CodeProxy 转售的 `gpt-image-2.5`，走[中转](../../../posts/ai-assistant/api-gateway.md)的海外机。照 CodeProxy 文档调，只改两处：

- **base URL**：`https://codeproxy.dev` 换成 `https://codeproxy.reverse-pro.xyz`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
# 生成
curl -sS https://codeproxy.reverse-pro.xyz/v1/images/generations \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "gpt-image-2.5", "prompt": "<描述>", "n": 1, "size": "1:1"}'

# 编辑：原图放在 images[].image_url 里
curl -sS https://codeproxy.reverse-pro.xyz/v1/images/edits \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "gpt-image-2.5", "prompt": "<怎么改>", "images": [{"image_url": "<URL 或 data URI>"}],
       "image_resolution": "1k", "size": "1024:1024"}'
```

- **跟 OpenAI 官方不一样的地方**：编辑也用 JSON 提交，不是 multipart 上传，所以别用 OpenAI SDK 的 `images.edit`。`size` 写成比例，比如 `"1:1"`、`"16:9"`，不是 `1024x1024`
- **结果**：同步返回，`data[0].b64_json` 是 PNG 的 base64，解码后存成文件。一次要三四十秒，超时设长一点
- **本地图片**：写成 `data:image/png;base64,…`，放进 `image_url`
- **更高分辨率**：2.5 没有 2k、4k 版本，要的话只能退回旧版 `gpt-image-2-2k` 或 `gpt-image-2-4k`

维护记录：[接口从哪来、实测结果](../../../posts/ai-assistant/maintenance/image.md)。正常使用不用看，出问题再看。
