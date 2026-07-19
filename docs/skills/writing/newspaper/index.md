# 报纸版 HTML 设计口味

给「审核大纲、项目复盘、内部简报」等需要严肃感的页面做的中文报纸观感模板：
暖米纸面、粗黑分割线、宋体大标题、强对比、可打印。
**靠排版建立层级，不用装饰图片、渐变、阴影、圆角。**

## 效果演示

下面是用这套设计系统拼的一个迷你「文章索引」页，把报头、栏目条、按钮、徽标、信息卡、社论摘句、空状态、三个 JS 组件（自定义下拉、复制链接、加载遮罩）串成一个活例：

<iframe src="/skills/writing/newspaper/assets/newspaper-demo.html"
        style="width:100%;height:900px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="报纸版设计系统 demo：文章索引"></iframe>

试这几下：

- 顶部下拉切换类目 —— 「改值即整页提交」，加载遮罩短暂出现，筛选状态写进 URL 的 `?cat=`；列表按类目过滤，切到没有文章的类目会看到空状态卡
- 点**复制本页链接** —— 复制的是当前筛选后的完整 URL，toast 提示「链接已复制」
- 对比按钮（默认 / 实心 / 禁用）、徽标、信息卡、摘句（普通 / 反色）几种排版语言

真身在 [`assets/newspaper-demo.html`](assets/newspaper-demo.html)，样式与交互逻辑复用同级 `newspaper.css` / `newspaper.js`（同一份源文件，不重复定义，跟下面「接入方式」一致）。

## 何时用 / 何时不用

- **用**：网页文档、审核稿、长页、报告列表 / 门户、需要打印或导出 PDF 的严肃页面
- **不用**：演示页 / 滚动动画 / 投屏页面（那是另一套 16:9 舞台式风格）

## 接入方式

把本 skill `assets/` 下三个文件（css / js / favicon）拷到你的项目 `static/`：

1. `<head>` 引入：

    ```html
    <script>document.documentElement.className += ' js';</script>  <!-- 尽早执行，防原生下拉闪现 -->
    <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
    <link rel="stylesheet" href="/static/css/newspaper.css">
    ```

2. `</body>` 前（仅当用到 JS 组件时）：

    ```html
    <script src="/static/js/newspaper.js"></script>
    ```

3. 多页项目建议做一个 Jinja `base.html` 放公共头/尾，各页 `{% extends %}` + `{% block content %}`。

## 设计系统在 `newspaper.css` 里

**设计令牌、字体、字重、分割线规则、现成类（`.page` / `.masthead` / `.kicker` / `.section-rule` / `.part` / `.core-left` / `.btn` / `.badge` / `.card` / `.no-data` 等）的完整定义和注释，都在 `newspaper.css` 里**，按章节注释组织（`---- 设计令牌 ----` / `---- 报头 ----` / `---- 区块 ----` 等）。直接读 CSS 比读 markdown 描述更准。

下面是核心骨架示例，更多见 CSS：

```html
<div class="page">
  <header class="masthead">
    <div class="meta"><span>栏目 · KICKER</span><span>右侧元信息</span></div>
    <h1>大标题</h1>
    <p class="subtitle">副标题</p>
  </header>
  <div class="kicker">栏目条</div>
  <!-- 内容 -->
</div>
```

## 三个 JS 组件（需引 `newspaper.js`）

全部 class 钩子驱动、无硬编码 id、有无 JS 兜底。

### 1. 自定义下拉

给原生 `<select>` 加 `class="np-select"`：JS 隐藏它、生成 `.custom-select` 列表（原生 select 仍作数据源 + 无 JS 兜底）。

「改值即整页提交」：把 select 放进 `<form data-np-autosubmit>`，加无 JS 兜底按钮 `<noscript><button type="submit" class="btn">应用</button></noscript>`。

```html
<form method="get" data-np-autosubmit>
  <select name="dept" class="np-select"><option value="">全部</option>…</select>
  <noscript><button type="submit" class="btn">应用</button></noscript>
</form>
```

### 2. 复制链接 + toast

```html
<button class="np-copy" data-link="/view/foo">复制链接</button>
```

`data-link` 为相对路径时自动补 `window.location.origin`；绝对 URL 原样复制。
页面有 `.toast` 则复用，否则自动创建。

### 3. 加载遮罩

```html
<div class="np-loading-region">
  <div class="loading-overlay">
    <div class="loading-box"><div class="label">正在加载…</div><div class="loading-bar"></div></div>
  </div>
  <!-- 结果内容 -->
</div>
```

任意表单 `submit` 时自动 `.show`，`pageshow`（后退）时自动清除。

## favicon

`assets/favicon.svg` 是极简圆框 + 两字母大字（默认 `BI`）+ 蓝图辅助网格的模板标记。
要换团队标识，改 `<text>` 里的字母即可（文件头注释里有示例）。

## 配套资产源码（折叠）

源文件全部在同级 `assets/`，下面通过 snippets 引用展示（源文件只一份，引用不算重复；真身也可按文件 URL 直接下载）：

??? abstract "newspaper.css（含完整章节注释 —— 详细设计令牌、组件类、注释说明都在这）"

    ```css
    --8<-- "skills/writing/newspaper/assets/newspaper.css"
    ```

??? abstract "newspaper.js（三个组件交互逻辑）"

    ```javascript
    --8<-- "skills/writing/newspaper/assets/newspaper.js"
    ```

??? abstract "favicon.svg（模板图标）"

    ```xml
    --8<-- "skills/writing/newspaper/assets/favicon.svg"
    ```

??? abstract "newspaper-demo.html（上面「效果演示」的 demo 源码，自包含、未压缩）"

    ```html
    --8<-- "skills/writing/newspaper/assets/newspaper-demo.html"
    ```
