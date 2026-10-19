<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/examples/add-block.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 完整示例：添加一个 block

## 场景

用户已有一个 HyperFrames 项目，想在视频内容旁边加一个动画图表。

## 步骤

### 1. 安装 block

```bash
hyperframes add data-chart
```

### 2. 接入 index.html

```html
<div id="stage" data-composition-id="main" data-width="1920" data-height="1080" data-duration="30">
  <video
    id="speaker"
    src="speaker.mp4"
    data-start="0"
    data-duration="30"
    data-track-index="0"
    style="position: absolute; width: 60%; height: 100%; left: 0; top: 0; object-fit: cover;"
  ></video>

  <!-- Data chart appears at 5s in the right 40% of the screen -->
  <div
    data-composition-id="data-chart"
    data-composition-src="compositions/data-chart.html"
    data-start="5"
    data-duration="15"
    data-track-index="1"
    data-width="1920"
    data-height="1080"
    style="position: absolute; right: 0; top: 0; width: 40%; height: 100%;"
  ></div>
</div>
```

### 3. lint 并预览

```bash
hyperframes lint
hyperframes preview
```

### 4. 自定义（可选）

编辑 `compositions/data-chart.html`——数据数组在脚本顶部，颜色在作用域限定于 `[data-composition-id="data-chart"]` 之下的 CSS 规则里。
