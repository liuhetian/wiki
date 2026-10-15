<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/design-spec.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 设计规范 —— `frame.md` / `design.md`

关于**设计规范是什么、去哪里找、怎么读**的唯一权威来源。其他参考文档在解析和格式问题上都以这里为准；*消费*契约（「是品牌，不是版式」）在 `video-composition.md` 里。

## `frame.md` 是什么

`frame.md` 是视频 / hyperframes 项目的 **frame 尺度设计系统** —— `design.md`（为网页 / 静态页面而写）的视频优先版搭档。文件格式与 `design.md` 相同；它以帧为单位重新诠释品牌。

一份规范由 **YAML frontmatter + markdown 正文**组成，两层的地位并不相等：

- **frontmatter 是规范性的那一层** —— `colors`、`typography`、`spacing`、`components` 是真实的、机器可读的值。原样引用它们（准确的 hex、字体族、字重）；绝不编造或取整。
- **散文是上下文** —— 那些 `##` 段落（Overview、The Frame、Composition Rules ……）承载的是意图、何时使用，以及 token 装不下的约束。读它们是为了做判断，而不是为了取值。

## 确定要读哪份规范

优先级 —— 读**第一个存在的**，忽略其余：

```
frame.md  →  design.md  →  DESIGN.md
```

```bash
SPEC=$(ls frame.md design.md DESIGN.md 2>/dev/null | head -1)
```

- `frame.md` 是视频 / hyperframes 项目首选的规范，多份同时存在时它优先。
- `frame.md` **永远是小写** —— 不存在 `FRAME.md` 这个变体。（在 Linux 上 `design.md` 和 `DESIGN.md` 确实是两个不同的文件；frame-preset 附带的是一个大写的 `FRAME.md` *模板*，采用时改成小写的 `frame.md` —— 见下文「从 preset 起步」。）

**在 Step 1 里只加载一次**规范；之后的每一步（扩写、编写、遵循度检查）都使用已经加载好的规范，而不是重新解析一遍。

## 从 preset 起步（可选）

可以选择用 `[../frame-presets/](../frame-presets/)` 里现成的 **frame-preset** 作为 `frame.md` 的种子 —— 这是一组固定的 preset，每个都附带一个 `FRAME.md` 模板，由工作流的设计步骤复制进来，再叠加上品牌 token。引用 preset **不是必须的**；量身定制的规范，或者由[选择器](design-picker.md)生成的规范，同样有效。

| Preset                                                             | 外观                                                                                                                                                                                                                                                                                                                     | 何时选                                                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `[biennale-yellow](../frame-presets/biennale-yellow/FRAME.md)`     | 文学编辑式图录 —— 暖色羊皮纸底，单一的深靛蓝墨色，太阳黄用作径向晕染 / 面板 / 卡片底印，Instrument Serif 400 display（紧凑、负字距）+ Archivo 正文 + JetBrains Mono 数据，严格的矩形（0 圆角），1px 细线是唯一的边框，无阴影  | 自信 / 有氛围感 / 克制；想要博物馆图录般的优雅和编辑式权威感的产品                     |
| `[blockframe](../frame-presets/blockframe/FRAME.md)`               | 极繁主义新粗野主义 —— 4px 黑色描边，8px 硬偏移阴影，五种糖果粉彩，Inter 800–900 全大写，直角，倾斜的装饰元素                                                                                                                                                                    | 大胆 / 有冲击力 / 俏皮又响亮；想要显得自信、富有图形感的产品                                                 |
| `[blue-professional](../frame-presets/blue-professional/FRAME.md)` | 咨询级的克制 —— 暖奶油色画布，只用单一的高饱和钴蓝（#1e2bfa）作强调，Space Grotesk + Inter 字体排印，柔和的带色调卡片（4% 填充 / 20% 描边 / 10–14px 圆角），**没有**阴影，胶囊形框架元素（100px），3 级灰色文字阶梯，钴蓝进度条                                            | 稳重 / 高管易读 / 传递高端信号；想要投资研究般的严谨和精致克制的产品             |
| `[bold-poster](../frame-presets/bold-poster/FRAME.md)`             | 大众化的编辑式海报 —— Shrikhand display 倾斜 −6°..+2°，Libre Baskerville 衬线正文，Space Grotesk mono 框架元素，只有四种颜色（白 / 棕黑墨色 / 番茄红 / 米白），双描边网格（3px+1.5px），红色左边条卡片，红色长破折号项目符号，红色 display 上叠加多层 text-shadow，直角 | 有力 / 印刷感 / 克制；想要编辑式权威感和复古厚重感的产品                                   |
| `[broadside](../frame-presets/broadside/FRAME.md)`                 | 抗议海报系统 —— 双色域的扁平平面（墨黑 / 火橙），巨大的小写 Barlow 900 被当作图形基元使用，IBM Plex Mono 框架元素（全大写，0.14em），火橙是唯一的强调色，1px 细线，锐利直角，无阴影                                                                         | 大胆 / 字体驱动 / 宣言式；想要存在感和权威感的产品                                                    |
| `[capsule](../frame-presets/capsule/FRAME.md)`                     | 俏皮的编辑风 —— 每个容器都是胶囊形（2px 墨色描边），奶油色画布，九种糖果强调色，Bodoni Moda + Space Grotesk，柔和的偏移阴影，漂浮胶囊铺满的背景                                                                                                                                                | 友好 / 柔和 / 编辑式；想要温暖和亲和力的产品                                                     |
| `[cartesian](../frame-presets/cartesian/FRAME.md)`                 | 博物馆图录式编辑风 —— 1px 灰褐色细线网格，五色暖石色板（#EDE8E0 / #E2DBD1 / #1A1A1A / #5A5A5A / #8A8178），Playfair Display 400 + Inter，锐利直角，圆规绘制般的几何圆环，零阴影 / 零填充                                                                                     | 疏朗 / 文学感 / 克制；想要安静的权威感和编辑式严谨的产品                                         |
| `[code-editorial](../frame-presets/code-editorial/FRAME.md)`       | 暖调编辑式品牌手册 —— 暖奶油色纸张（绝不用纯白），赤陶珊瑚色（#CC785C）作为稀缺的电压，靠墨色细线表达层次（不用重阴影），EB Garamond 衬线 display + Inter 正文 + JetBrains Mono 索引 / 代码，置于暖海军蓝的代码面上，display 用句首大写，✱ 珊瑚色尖刺符号                          | 深思熟虑 / 文学感 / 面向开发者；想要编辑式的沉静感和一流代码展示面的代码变更、发布或文档 |
| `[cobalt-grid](../frame-presets/cobalt-grid/FRAME.md)`             | 现代主义双色孔版印刷 —— 奶油色纸张，电光钴蓝墨色，常驻的坐标纸网格（10% 钴蓝），顶部 / 底部的钴蓝细线，Newsreader 400 衬线 + Hanken Grotesk + DM Mono，0° 圆角，像素故障列 + 二维码块状补丁                                                                              | 克制 / 系统化 / 编辑式；想要清晰和稳重权威感的产品                                           |
| `[coral](../frame-presets/coral/FRAME.md)`                         | 大胆的编辑式杂志 —— 三种实色底面（珊瑚火红 / 墨黑 / 暖奶油色）以硬边相接，珊瑚色上有 45° 斜线排线，Bebas Neue + Inter 加字距大写，零阴影 / 零圆角（圆形 50%），超大的背景数字和巨型标记                                                                | 大胆 / 结构主义 / 编辑式；想要图形自信和硬边自信的产品                              |
| `[creative-mode](../frame-presets/creative-mode/FRAME.md)`         | 新粗野主义编辑风 —— 奶油色画布，4px 墨色描边，硬偏移阴影（无模糊），四种强调色按两到三种限量使用，Archivo Black 全大写、行高 0.92，JetBrains Mono 分类标签，Space Grotesk 正文，除一个胶囊标签外全部直角                                                                  | 疏朗 / 图形感 / 有冲击力而克制；想要编辑式存在感和几何自信的产品                           |
| `[daisy-days](../frame-presets/daisy-days/FRAME.md)`               | 欢快的绘本风 —— 3px 炭灰描边，6/4px 硬偏移阴影（无模糊），九种阳光花园粉彩（奶油 + 绿松石 / 柔粉 / 黄油 / 薄荷 / 薰衣草 / 蜜桃 / 天蓝 + 珊瑚强调色），Fredoka One + Quicksand，宽裕的圆角（20–50px），手绘 SVG 装饰层（雏菊 / 星星 / 太阳 / 云朵 / 彩虹）         | 俏皮 / 童趣 / 贴纸卡哇伊；想要温暖和奇趣感的产品                                               |
| `[editorial-forest](../frame-presets/editorial-forest/FRAME.md)`   | 以衬线体为主导的文学编辑风 —— 绿 / 粉 / 奶油编辑三色组，display 用 Source Serif 4 字重 500（opsz）+ JetBrains Mono 500 全大写框架元素，扁平的纸质纵深（无阴影），2px 细线，6/8px 卡片圆角，字母组合圆章                                                                      | 疏朗 / 克制 / 编辑式；想要安静的自信和文学调性的产品                                       |

每个 preset 文件夹还附带一个 `frame-showcase.html` —— 展示其各种帧处理方式的预览样张；打开它来*看*外观，绝不要把它放进项目里。

## 消费它

如何把规范应用到一帧上 —— 品牌上严格（hex、字体、字重关系、Do's / Don'ts），版式上自由 —— 这是 `[video-composition.md](video-composition.md)` 里的消费契约（「The Design Spec Is Brand, Not Layout」）。选颜色或写 HTML 之前先读它；本文档只讲如何找到和解析规范。
