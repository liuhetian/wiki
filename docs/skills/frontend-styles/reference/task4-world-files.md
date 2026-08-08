# WORLD FILES 档案袋叙事

<iframe src="/skills/frontend-styles/assets/task4-world-files-demo/index.html"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="WORLD FILES 档案袋叙事 demo"></iframe>

旧纸、侧转档案袋和封绳把目录变成一排可以翻动的物件；点击后先解绳，再从原位铺开纸张，
最后才出现正文。样本来自工作区 `task4`。

## 要点

- 把档案袋同时当作目录项、空间索引和转场起点，不额外制造只负责动画的替身卡
- 多张档案沿固定横向轨道侧转排开，数量越多侧角越大，后方标签仍要露出
- hover 只转正、放大和前提当前档案，其他档案的位置与角度保持不动
- 横向拖拽与滚轮共用一个有上下界的轨道偏移，拖动超过阈值才抑制 click
- 点击时读取当前档案的真实几何位置，让展开纸从那里铺到主体区域
- 转场顺序钉死为“绳结松开 → 袋口退出 → 白纸扩展 → 正文显现”
- 绳扣用同一个 SVG 本体改路径与透明度，铆钉留在原卡，不叠一枚假绳结
- 详情层使用清晰的长文网格与原生滚动，物件隐喻到此为止
- 打开详情后隔离背景焦点，Escape 返回原档案，关闭后把焦点还给触发项
- `prefers-reduced-motion` 下跳过解绳和铺纸等待，直接显示可读正文
- 转场顺序照源视频钉死，但解结、铺纸各段时长是刻意比原作缩短的复刻取值，可按节奏调整

上面的 demo 直接由工作区 `task4` 原项目构建，完整保留 8 份档案、横向拖拽与滚轮、
真实卡片几何位置接力、解绳—铺纸—显字转场、详情长文、焦点归还和减弱动画适配，
不是为文章重写的简化样例。

## 完整实现

- [运行入口](../assets/task4-world-files-demo/index.html)
- [档案、拖拽与连续转场源码](../assets/task4-world-files-demo/source/src/main.jsx)
- [视觉与响应式源码](../assets/task4-world-files-demo/source/src/styles.css)
- [工程依赖](../assets/task4-world-files-demo/source/package.json)
