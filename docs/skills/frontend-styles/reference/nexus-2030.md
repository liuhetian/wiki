# NEXUS 2030 酸绿深空首屏

<iframe src="/skills/frontend-styles/assets/nexus-2030-demo.html"
        style="width:100%;height:780px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="NEXUS 2030 酸绿深空首屏 demo：科幻发布页 hero"></iframe>

一个科幻发布页首屏：近黑墨绿深空底 + 酸性荧光绿唯一强调色，SVG 笔画描边大标题、
行星轨道核心、等宽 HUD 小字，「观影」按钮弹出一段没有视频文件的纯 CSS 伪影片。

## 要点

- 用 SVG `<text>` + `stroke` + `paint-order:stroke` 实现大标题按字体笔画描边，fill 给近透明底色防露背景，`vector-effect:non-scaling-stroke` 保证缩放不变粗
- 笔画描边必须配**保留笔画重叠轮廓**的字体（Noto Sans SC 每一笔是独立闭合路径，描边互相穿过）；PingFang / 雅黑等轮廓已合并，只描得出整字外轮廓 —— 标题字用 `unicode-range` 子集字体钉死，不放任回退
- 标题换字要重拉子集：`fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300&text=<新标题字>` 直接返回只含那几个字形的 woff2（本页 5 个字仅 1.8KB）；联网环境直接整族 `@import` 也行
- 全页只用一个酸性荧光绿 `#c8ff24` 作强调色，收进 `--acid` 变量，按钮 / 轨道光点 / 进度条 / 状态灯全部引用它
- 底色用近黑墨绿 `#070c0b`，叠两坨大半径 `radial-gradient` 光晕，再用 `:after` 的椭圆径向渐变压出四周暗角
- 用 canvas 画 200+ 慢速漂移星点，透明度按 `sin(t)` 脉动，约 1/6 的点换成强调色，只铺画面右 2/3 让开文案
- 地面用两组 `linear-gradient` 画网格线，`perspective + rotateX` 压成透视地板，`mask-image` 上下渐隐
- 行星核心用 `repeating-radial-gradient` 画同心环，外套三条 `rotate + scaleY(.3)` 压扁的圆环当轨道，各配不同周期的旋转动画
- 数据小字（坐标 / 节点数 / 实时时钟）全用等宽字体 + 大字距 + 8–12px 字号，营造 HUD 仪表感
- 中文大标题用超大字号 + 负字距（`letter-spacing:-9px`）+ 行高 `.85` 压出海报感，实心一行 + 描边一行对比
- 「播放影片」不放真视频：模态里用纯 CSS 动画拼扫描线 + 透视网格 + 核心脉冲 + 16s 进度条，播放状态就是一个 `.is-playing` 类
- 模态的 JS 只管开关、锁滚动、焦点管理（打开聚焦关闭钮 / 关闭还原）和走字计时，Esc 与点遮罩可关
- 入场动画：文案上滑 + `blur` 渐显，顶栏整条下滑；`prefers-reduced-motion` 下全部停摆
- 移动端裁剪而非缩放：直接隐藏 metrics 和导航，核心球挪到下半屏

## 源码（折叠）

??? abstract "nexus-2030-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/nexus-2030-demo.html"
    ```
