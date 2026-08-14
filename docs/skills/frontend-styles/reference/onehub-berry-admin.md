# One Hub 翡翠管理台

<iframe src="/skills/frontend-styles/assets/onehub-berry-admin-demo.html"
        style="width:100%;height:1210px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="One Hub 翡翠管理台 demo：LLM 网关管理后台总览页"></iframe>

[One Hub](https://github.com/MartialBE/one-hub)（LLM 网关）的后台皮肤：Berry 模板的骨架 ×
[Minimals](https://minimals.cc/) 的色彩语言 —— 纯白底靠双层阴影分卡片、翡翠绿 `#00A76F` 主色、
墨色主按钮、灰底表头 + 虚线行分隔的明暗双态 MUI 管理台。demo 是纯 HTML/CSS 缩微复刻（非像素镜像），
真身的实现本体是 MUI v5 的 `createTheme` 三件套，配方见下节。

## 要点

- 色板抄 Minimals：主绿 `#00A76F`（hover 加深到 `#007867` 并追加 `0 8px 16px` 24% 同色投影）、灰阶以 `#919EAB` 为轴心展开（grey200 `#F4F6F8` / grey600 `#637381` / grey800 `#1C252E` / grey900 `#141A21`）、语义色 error `#FF5630`、warning `#FFAB00`、info `#00B8D9`
- 默认按钮不用主色而用「墨色」：浅色态黑底白字（grey800），深色态整体反转成白底黑字；翡翠绿只留给页面唯一主操作和选中态
- 关掉 MUI 出厂感三件套：全局 `disableElevation`、`textTransform: unset`、按钮字重 700
- 圆角分层不是一个值走天下：基准 12px（面板/输入框），卡片和对话框翻倍到 24px（demo 统一取 16px 档），按钮/菜单项/图标按钮钉死 8px
- 卡片无边框，立体感全靠双层阴影公式：`0 0 2px 0 rgba(145,158,171,.2), 0 12px 24px -4px rgba(145,158,171,.12)`——一圈 2px 描边感 + 一坨下坠柔影，明暗两态同一公式（深色态另加 1px 5% 白边）
- 表格四件套：表头灰底（浅 `#F4F6F8` / 深 `#28323D`）且无下边框、行分隔一律 1px dashed、单元格居中对齐、末行分隔线转透明；分页条顶边也是 dashed
- 侧栏 260px 纸面底 + 1px 实线右边框 `rgba(145,158,171,.12)`；选中项 = 主色文字 + 主色 8% 底色（深色态文字转 primaryLight `#5BE49B`、底色加浓到 16%）+ 8px 圆角；hover 只上 4% 黑
- 明暗切换只翻 6 个令牌：bg `#fff↔#141A21`、paper `#fff↔#1C252E`、表头 `#F4F6F8↔#28323D`、正文 `#1C252E↔#fff`、次级字 `#637381↔#919EAB`、contained 按钮黑白反转；divider `rgba(145,158,171,.2)` 两态通用
- 状态与模型名一律 soft 胶囊：16% 透明度语义色打底 + 深一档同色系文字（深色态换浅一档），不用实心色块
- 字体链正文 Public Sans Variable、大标题 Barlow 800 字重；demo 用站内共享 Inter 近似（数字气质相当，中文回退系统字体）
- 顶栏图标按钮做成 38px 方形 + 8px 圆角 + 3% 黑微底，hover 加深到 6%，不用 MUI 默认的圆形涟漪

## MUI 配方（真身实现）

以下代码摘自 one-hub 仓库（钉 commit [`387f8bf`](https://github.com/MartialBE/one-hub/tree/387f8bf16ed0d601fdede7ade378adb10aa1a35a/web/src/themes)，
内容冻结不随上游变），核心就三个文件：`palette.js`、`typography.js`、`compStyleOverride.js`，
由 [`themes/index.js`](https://github.com/MartialBE/one-hub/blob/387f8bf16ed0d601fdede7ade378adb10aa1a35a/web/src/themes/index.js) 组装：

```javascript
const themes = createTheme(themeOptions);          // palette + typography + shape 先建题
themes.components = componentStyleOverrides(themeOption);  // 组件覆盖整体替换，不做 merge
return themes;
```

> 值得学的组装手法：`components` 不塞进 `createTheme` 的入参，而是建完 theme 后**整体替换**，
> 覆盖函数里直接闭包引用色板对象（`theme.colors?.primaryMain`），绕开 `theme.palette` 回查 ——
> 换肤时只要换传入的 colors 就能重算整套组件样式。

色板的单一来源是一个 SCSS module（[`_themes-vars.module.scss`](https://github.com/MartialBE/one-hub/blob/387f8bf16ed0d601fdede7ade378adb10aa1a35a/web/src/assets/scss/_themes-vars.module.scss)），
用 `:export` 块同时喂给 SCSS 和 JS，改一处两边生效：

```scss
$primaryMain: #00A76F;   // Minimals 翡翠绿
$grey800: #1C252E;
:export { primaryMain: $primaryMain; grey800: $grey800; /* ... */ }
```

「墨色主按钮」和签名阴影都在
[`compStyleOverride.js`](https://github.com/MartialBE/one-hub/blob/387f8bf16ed0d601fdede7ade378adb10aa1a35a/web/src/themes/compStyleOverride.js)：

```javascript
MuiButton: {
  defaultProps: { color: 'inherit', disableElevation: true },
  styleOverrides: {
    root: { fontWeight: 700, borderRadius: '8px', textTransform: 'unset' },
    contained: {                       // 默认按钮 = 墨色，且明暗态整体反转
      color: isDark ? theme.colors?.grey800 : '#FFFFFF',
      backgroundColor: isDark ? '#FFFFFF' : theme.colors?.grey800
    },
    containedPrimary: {                // 主色按钮 hover 才出同色投影
      '&:hover': {
        backgroundColor: theme.colors?.primaryDark,
        boxShadow: `0 8px 16px 0 ${varAlpha(theme.colors?.primaryMain, 0.24)}`
      }
    }
  }
},
MuiCard: {
  styleOverrides: {
    root: {
      borderRadius: `${(theme?.customization?.borderRadius || 8) * 2}px`,  // 卡片圆角 = 基准 ×2
      boxShadow: `0 0 2px 0 ${varAlpha(theme.colors?.grey500, 0.2)}, 0 12px 24px -4px ${varAlpha(theme.colors?.grey500, 0.12)}`
    }
  }
},
MuiTableCell: {
  styleOverrides: {
    root: { borderBottomStyle: 'dashed', textAlign: 'center' },   // 虚线分隔 + 居中
    head: {
      backgroundColor: isDark ? '#28323D' : theme.colors?.grey200,
      borderBottom: 'none', color: theme.darkTextSecondary, fontWeight: 600
    }
  }
},
MuiListItemButton: {
  styleOverrides: {
    root: {
      borderRadius: '8px',
      '&.Mui-selected': {              // 侧栏选中：主色字 + 主色低透明底
        color: theme.menuSelected,     // 浅色态 primaryMain，深色态 primaryLight
        backgroundColor: theme.menuSelectedBack   // 主色 8%（深色态 16%）
      }
    }
  }
}
```

> 这份覆盖表值得整个抄走的原因：它把「风格」全部下沉到了 theme 层，业务代码里见不到一行颜色 ——
> 表格虚线、按钮反转、菜单选中全是 `styleOverrides` 声明出来的。给任何 MUI v5 项目换上这套
> `components`（加上面的色板），就得到 demo 里的观感；demo 的 CSS 变量则是同一套令牌的非 React 译本。

明暗双态不是两份主题文件，而是一个 `GetLightOption() / GetDarkOption()` 开关只翻语义令牌
（`paper`、`backgroundDefault`、`menuSelected`、`headBackgroundColor` 等十来个键），
色板本体不动 —— demo 里 `:root` / `[data-theme="dark"]` 两块 CSS 变量就是对这个结构的直译。

## 源码（折叠）

??? abstract "onehub-berry-admin-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/onehub-berry-admin-demo.html"
    ```
