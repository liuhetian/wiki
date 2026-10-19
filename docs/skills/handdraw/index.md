---
description: "手绘风格出图：从 365 种画风、167 种版式、36 种主题色里挑组合，拼成生图 prompt；写单张图、海报、文章或视频封面、长文配图、两种画风融合、IP 形象全套卡片时用。吸纳自 yang0/handraw-style"
---

# 手绘风格出图

把「画风 + 版式 + 主题色 + 主题」拼成一段生图 prompt：画风管怎么画，版式管怎么排，主题色管什么颜色，画面里有什么只由主题决定。库里有 365 种画风（手绘为主，另有 34 种写实摄影）、167 种版式、36 种主题色，每条都有编号和一张样图，全部在 Gallery 里。不会描述画风、排不好版面的人，挑几个编号再说一句主题，就能拿到能直接贴进生图工具的 prompt。

默认只写 prompt。用户明确说「出图」「全自动出图」，才用 [agent-io 的图片生成](../agent-io/reference/image.md)去画；垫样片走它的编辑接口，样片放进 `images[].image_url`。

## 什么时候用哪个 { #route }

| 子 skill | 干什么 | 什么时候用 |
|---|---|---|
| [出图提示词](prompter.md) | 按编号或主题写一张图的 prompt：纯图、图文两种模式，单用版式，照片改画风 | 默认入口：给了画风、版式、主题色编号，或者只说「帮我画……」 |
| [海报](poster.md) | 8 个字段的结构化海报 prompt，构图交给模型 | 「出海报」「海报提示词」 |
| [文章与视频封面](cover.md) | 读全文或字幕，提炼摘要和受众，出 2.35:1 公众号封面或视频封面 | 「给文章做封面」「公众号封面」「视频封面」「字幕做封面」 |
| [长文配图](illustration/index.md) | 规划插图点位，每张配版式和 prompt，出图后回填进文章 | 「给这篇文章配图」「规划插图」 |
| [风格融合](fusion.md) | 角色用一种画风、场景用另一种画风，同框共存 | 「风格融合设计」「融合两种风格」 |
| [IP 形象设计](ip.md) | 5 层 18 张卡的 IP 设计手册，分 6、10、18 张三档 | 「IP 形象设计」「角色设计手册」「三视图」 |

## 数据在哪 { #data }

按编号查条目都去 Gallery 的页面：条目标题就是「编号 · 名称」，下面是样图和 prompt 片段。

- **画风**：编号前缀 FA–FI 各一页，页名取前缀的第二个字母 —— [FA 国际社论幽默](../../gallery/images/handdraw-style/styles-a.md)、[FB 经典绘本叙事](../../gallery/images/handdraw-style/styles-b.md)、[FC 现代平面艺术](../../gallery/images/handdraw-style/styles-c.md)、[FD 日本当代插画](../../gallery/images/handdraw-style/styles-d.md)、[FE 新国风与传统工艺](../../gallery/images/handdraw-style/styles-e.md)、[FF 3D 黏土、毛毡与纸雕](../../gallery/images/handdraw-style/styles-f.md)、[FG 动漫和赛璐璐](../../gallery/images/handdraw-style/styles-g.md)、[FH 先锋实验与综合媒介](../../gallery/images/handdraw-style/styles-h.md)、[FI 写实摄影与视觉大片](../../gallery/images/handdraw-style/styles-i.md)。标题里是风格名（英文），图下一行是「参考：参考作者 ｜ gpt-image-2：怎么激活」，代码块是画法特征原文
- **旧编号**：用户说「041 号」「#268」这种三位数，是上游改版前的流水号，到 [`style_alias_map.json`](../../gallery/images/handdraw-style/assets/references/style_alias_map.json) 的 `legacy_to_new` 换成新编号，比如 041 → FB-006
- **版式**：[社媒卡 SC](../../gallery/layouts/social-cards.md)、[信息图 IG](../../gallery/layouts/infographics.md)、[漫画分镜 SB](../../gallery/layouts/comic-storyboards.md)、[IP 设计 IP](../../gallery/layouts/ip-characters.md)、[电商 EC](../../gallery/layouts/ecommerce.md)。页面上只有中文版，英文版在 `gallery/images/handdraw-style/assets/references/layouts/<编号>.md` 的 `<!-- en -->` 段
- **主题色**：[经典主题色](../../gallery/colors/classic.md)，C-01–C-36，标题是「编号 · 中文名 英文名」
- **激活标定**：画风说明行里的「gpt-image-2：……」来自 [`model_capabilities.json`](../../gallery/images/handdraw-style/assets/references/model_capabilities.json)，只标定了 gpt-image-2 一个模型

## 画风片段怎么展开 { #activation }

先看出图的模型。没指定、或者用 agent-io 的 gpt-image-2.5 出图，按 gpt-image-2 的标定走，就是条目说明行里那一项：

| 说明行 | prompt 里写 | 垫样片 |
|---|---|---|
| 认得名字 | 风格名称 + 参考作者 | 不垫，也不写特征 |
| 靠画法特征 | 风格名称 + 参考作者 + 正面特征 | 不垫 |
| 要垫样片 | 风格名称 + 参考作者 + 正面特征（有就写） | 垫，加隔离声明 |

- 用户点名了别的模型（Midjourney、Flux、Stable Diffusion……）：没有标定，一律写正面特征并垫样片
- 认不认名字是实测出来的，跟作者出不出名、在不在世无关，别凭名气改判
- **正面特征**：把画法特征按「；」「。」切开，删掉含「避免」「不要」「不准」「禁止」的子句，以及「无写实纹理」「无精细材质」「无真实纹理」这几句；FD-042、FE-048、FE-049、FE-051、FE-056、FE-057、FE-059、FH-042 这 8 条整段照抄不删。留下的逐字照抄，不压缩、不改写、不自己补
- **风格名称**写标题里的英文名，**参考作者**写说明行「参考：」后面那段，标成「参考作者/风格名称」—— 这是索引标签，不是说要模仿某个人

### 垫样片 { #reference-image }

样片就是条目里那张图。真出图时把它放进编辑接口的 `images[].image_url`，prompt 里加隔离声明；只写 prompt 时，纯图模式把样片地址和隔离声明写进 prompt 让用户自己上传，图文模式和用了版式时 prompt 里不放地址、不放声明，样片单独给用户看。隔离声明一字不改，不加的话样片里的人物、道具会被原样画进结果：

```text
所附图片仅用于参考画风。只提取参考图的风格特征，例如线条、笔触、媒介、材质、色彩倾向和整体视觉语言；不要使用、复制或延续参考图中的任何主体、人物、动物、服装、道具、动作、姿态、场景、背景、构图、布局、文字或故事。最终画面内容完全以用户提供的主题为准。
```

```text
Use the attached image only as a style reference. Extract only its stylistic qualities, such as linework, brushwork, medium, material texture, color tendencies, and overall visual language. Do not use, copy, or carry over any subject, person, animal, clothing, prop, action, pose, setting, background, composition, layout, text, or story from the reference image. The user's written theme is the sole source for the image content.
```

- 样片找不到或传不了，说明一句，照常给文字 prompt；不拿别的图顶替
- 出图后说清这次垫没垫样片、垫的是哪个编号；只要了 prompt 就别说成已经出图

## 几个子 skill 都守的规矩 { #rules }

- **prompt 里不写编号**：画风、版式、主题色的编号只出现在给用户看的说明里，prompt 里写名称 —— 模型会把「SC-021」「#018」当成文字画进图里
- **画面内容只由主题决定**：样片里的人物、动物、场景只是演示画风，不写进 prompt；画法特征只管怎么画，不改主题里的主体、动作、场景和故事
- **不自己编**：不补画法特征和风格描述，不加通用的质量词、构图词，不加默认的避免清单
- **没给编号就推荐**：画风和主题色都没指定，从全库挑一组；只指定了一样，就补另一样；都指定了就照用。每次结合这个主题现想，不维护「节气就推 FE-061、生活就推 FA-018」这类固定对照，同一个主题可以有很多种画法。附一句理由，说清这种笔触和颜色为什么配这个主题，再说一句想换随时说。主题色可以单色，也可以主色加点缀色，或者三色
- **编号无效就请用户换一个**，不猜

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../maintenance/skills/handdraw.md)。正常使用不用看，出问题再看。

</div>
