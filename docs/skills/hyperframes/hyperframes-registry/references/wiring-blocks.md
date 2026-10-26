# 接入 block

block 是独立的 composition，有自己的 `data-composition-id`、尺寸、时长和 GSAP timeline。在宿主 composition 里，通过在一个 `<div>` 上设置 `data-composition-src` 来引入它们。

## 基本接入

执行 `hyperframes add data-chart` 之后，把它接入你的 `index.html`：

```html
<div id="stage" data-composition-id="main" data-width="1920" data-height="1080" data-duration="20">
  <video id="a-roll" src="video.mp4" data-start="0" data-duration="20" data-track-index="0"></video>

  <!-- Block: appears at 2s, plays for 15s, on layer 1 -->
  <div
    data-composition-id="data-chart"
    data-composition-src="compositions/data-chart.html"
    data-start="2"
    data-duration="15"
    data-track-index="1"
    data-width="1920"
    data-height="1080"
  ></div>
</div>
```

## 必需属性

| 属性 | 说明 |
| ---------------------- | -------------------------------------------------------------------- |
| `data-composition-src` | block HTML 文件的路径（相对于 index.html） |
| `data-composition-id`  | 唯一 ID，与 block 内部的 composition ID 一致 |
| `data-start`           | block 在宿主 timeline 中出现的时间点（秒） |
| `data-duration`        | block 播放多长时间（秒，最多等于 block 自身的时长） |
| `data-track-index`     | 图层顺序——数字越大越靠前渲染 |
| `data-width`           | block 画布宽度（与 block 的尺寸一致） |
| `data-height`          | block 画布高度（与 block 的尺寸一致） |

## timeline 协调

block 内部的 GSAP timeline 独立于宿主 timeline 运行。HyperFrames runtime 会加载这个 sub-composition，找到它在 `window.__timelines` 上的注册，并按 `data-start` 偏移，与宿主同步地 seek 这个 block。你不需要在宿主的 GSAP 代码里引用 block 的 timeline。

## 定位 block

要把 block 放在屏幕的特定区域，加上 CSS：

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="15"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
  style="position: absolute; right: 0; top: 0; width: 40%; height: 100%;"
></div>
```

## 多个 block

再添加几个同级的 `<div data-composition-src="...">`，`data-start` 值可以互不重叠，也可以重叠——每个 block 的 timeline 都是独立的，由 runtime 同步地 seek。
