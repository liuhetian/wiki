<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/references/install-locations.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 安装位置

## 默认路径

| 条目类型 | 默认安装路径 | 配置项 |
| --------- | ------------------------------------- | ----------------------------------- |
| Block     | `compositions/<name>.html`            | `hyperframes.json#paths.blocks`     |
| Component | `compositions/components/<name>.html` | `hyperframes.json#paths.components` |

## 路径重映射的工作方式

每个条目的 `registry-item.json` 中的 `target` 字段指定了一个默认安装路径。`add` 命令会根据 `hyperframes.json#paths` 重映射路径前缀：

- 以 `compositions/` 开头的 block target 会被重映射到 `<paths.blocks>/`
- 以 `compositions/components/` 开头的 component target 会被重映射到 `<paths.components>/`

## hyperframes.json

由 `hyperframes init` 自动创建。如果你运行 `add` 时它不存在，CLI 会用默认值创建它：

```json
{
  "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
  "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  }
}
```

## 自定义目录布局

要把 block 安装到 `scenes/` 目录而不是 `compositions/`：

```json
{
  "paths": {
    "blocks": "scenes"
  }
}
```

这样 `hyperframes add data-chart` 就会写入 `scenes/data-chart.html`，而不是 `compositions/data-chart.html`。输出的片段也会反映重映射后的路径。
