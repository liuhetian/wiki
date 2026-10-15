<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/luts/README.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# LUT 库（编写说明）

`index.json` 是供 agent 读取的调色风格目录。每个条目都按需解析 —— 仓库里不提交任何 `.cube` 正文。

每个风格包含：

- `id`、`description`、`tags`、`intensity` —— 用于匹配和应用的元数据。
- `url`（可选）—— 一个托管的 `.cube`，在 resolve 时下载、校验并冻结，和 bgm/image 素材完全一样。
- `params`（可选）—— 一份确定性的 `buildCube` 规格，离线时（`--local-only`）使用，或在 `url` 下载/校验失败时作为兜底。

一个条目至少需要 `url` 或 `params` 之一；最好两者都有（CDN url 加 params 兜底），这样解析永远不会被网络卡住。

## 托管一个新风格（运维人员）

1. 生成 `.cube`（例如 `resolve -t lut --params '{...}'`，或一份调过色的导出）。
2. 把它上传到公共 CDN 源站 bucket：

   ```
   aws s3 cp <id>.cube s3://heygen-public/luts/<id>.cube
   ```

   之后它就通过 `https://static.heygen.ai/luts/<id>.cube`（CloudFront）对外提供。

3. 在 `index.json` 里添加一个条目，带上那个 `url`（最好再加一个 `params` 兜底）。
