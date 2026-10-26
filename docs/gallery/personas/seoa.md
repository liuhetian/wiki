---
description: "SEOA｜徐星澄，24 岁，主舞兼创作型歌手：定妆照，和一套 9 张朋友圈图，每张注明照着哪 1–2 张 ins 风实拍的构图和姿势拍，附做法和 prompt"
---

# SEOA｜徐星澄

<figure markdown>
![SEOA｜徐星澄 定妆照](assets/seoa.webp){ width="420" }
</figure>

- 年龄：24 岁
- 定位：主舞兼创作型歌手

## 朋友圈 · 第一套 { #moments-1 }

9 张，每张从 [ins风拍照姿势](../images/xhs-poses/gallery-ins-poses.md) 里随机抽 1–2 张实拍照，照它的构图和姿势拍，背景和穿搭换掉，脸照上面的定妆照。

<div class="gallery-grid" markdown>

![朋友圈 · 1](assets/seoa-moments-01.webp){ loading=lazy }
![朋友圈 · 2](assets/seoa-moments-02.webp){ loading=lazy }
![朋友圈 · 3](assets/seoa-moments-03.webp){ loading=lazy }
![朋友圈 · 4](assets/seoa-moments-04.webp){ loading=lazy }
![朋友圈 · 5](assets/seoa-moments-05.webp){ loading=lazy }
![朋友圈 · 6](assets/seoa-moments-06.webp){ loading=lazy }
![朋友圈 · 7](assets/seoa-moments-07.webp){ loading=lazy }
![朋友圈 · 8](assets/seoa-moments-08.webp){ loading=lazy }
![朋友圈 · 9](assets/seoa-moments-09.webp){ loading=lazy }

</div>

### 第 1 张

构图和姿势参考 ins风 18/100 第 8 张，拍摄感和氛围参考 ins风 13/100 第 1 张。实际出来的坐姿、撑手和歪头更像 13/100 第 1 张。

<div class="gallery-grid" markdown>

![朋友圈 · 1](assets/seoa-moments-01.webp){ loading=lazy }
![参考：ins风 18/100 第 8 张](../images/xhs-poses/assets/ins-18-8.webp){ loading=lazy }
![参考：ins风 13/100 第 1 张](../images/xhs-poses/assets/ins-13-1.webp){ loading=lazy }

</div>

### 第 2 张

构图和姿势参考 ins风 4/100 第 5 张，拍摄感和氛围参考 ins 博主 sodaaam 第 2 张。

<div class="gallery-grid" markdown>

![朋友圈 · 2](assets/seoa-moments-02.webp){ loading=lazy }
![参考：ins风 4/100 第 5 张](../images/xhs-poses/assets/ins-04-5.webp){ loading=lazy }
![参考：ins 博主 sodaaam 第 2 张](../images/xhs-poses/assets/ins-sodaaam-2.webp){ loading=lazy }

</div>

### 第 3 张

构图和姿势参考 ins风 9/100 第 4 张。

<div class="gallery-grid" markdown>

![朋友圈 · 3](assets/seoa-moments-03.webp){ loading=lazy }
![参考：ins风 9/100 第 4 张](../images/xhs-poses/assets/ins-09-4.webp){ loading=lazy }

</div>

### 第 4 张

构图和姿势参考 ins风 19/100 第 4 张。

<div class="gallery-grid" markdown>

![朋友圈 · 4](assets/seoa-moments-04.webp){ loading=lazy }
![参考：ins风 19/100 第 4 张](../images/xhs-poses/assets/ins-19-4.webp){ loading=lazy }

</div>

### 第 5 张

构图和姿势参考 ins风 4/100 第 7 张。

<div class="gallery-grid" markdown>

![朋友圈 · 5](assets/seoa-moments-05.webp){ loading=lazy }
![参考：ins风 4/100 第 7 张](../images/xhs-poses/assets/ins-04-7.webp){ loading=lazy }

</div>

### 第 6 张

构图和姿势参考 ins风 25/100 第 3 张。

<div class="gallery-grid" markdown>

![朋友圈 · 6](assets/seoa-moments-06.webp){ loading=lazy }
![参考：ins风 25/100 第 3 张](../images/xhs-poses/assets/ins-25-3.webp){ loading=lazy }

</div>

### 第 7 张

构图和姿势参考 ins风 13/100 第 6 张。

<div class="gallery-grid" markdown>

![朋友圈 · 7](assets/seoa-moments-07.webp){ loading=lazy }
![参考：ins风 13/100 第 6 张](../images/xhs-poses/assets/ins-13-6.webp){ loading=lazy }

</div>

### 第 8 张

构图和姿势参考 ins风 9/100 第 7 张。

<div class="gallery-grid" markdown>

![朋友圈 · 8](assets/seoa-moments-08.webp){ loading=lazy }
![参考：ins风 9/100 第 7 张](../images/xhs-poses/assets/ins-09-7.webp){ loading=lazy }

</div>

### 第 9 张

构图和姿势参考 ins风 3/100 第 2 张。

<div class="gallery-grid" markdown>

![朋友圈 · 9](assets/seoa-moments-09.webp){ loading=lazy }
![参考：ins风 3/100 第 2 张](../images/xhs-poses/assets/ins-03-2.webp){ loading=lazy }

</div>

## 怎么生成的 { #how }

一张一个请求，走 agent-io 的[图片编辑接口](../../skills/agent-io/reference/image.md)：定妆照锁脸，抽到的实拍照定构图和姿势，prompt 让模型把背景和穿搭换掉。

1. **抽参考**：每张从 [ins风拍照姿势](../images/xhs-poses/gallery-ins-poses.md) 的 259 张里随机抽 1–2 张，不挑
2. **排参考图**：`images` 按顺序放定妆照、主参考、辅助参考，prompt 里按「第几张」点名每张图管什么
3. **写 prompt**：四句话，依次是锁谁的脸、照哪张的构图和姿势、换掉什么、画面要什么质感，见下面两个例子
4. **出图**：`size` 写 `"3:4"`，每张五分钟上下；接口同时最多两个请求，超时和重试照[接口页](../../skills/agent-io/reference/image.md)的说明设
5. **对照检查**：成品和参考图并排看，姿势和机位对得上、脸认得出、背景和衣服确实换了，才算过

### 例一：抽到 1 张（第 9 张）

`images` 依次是定妆照、ins风 3/100 第 2 张：

```{.text .wrap}
第 1 张是 SEOA（徐星澄）的身份参考：24 岁，女团主舞兼创作型歌手。只从它取脸型、五官、年龄感和辨识度，保留她的黑色长发，表情和头部角度按这张照片自己的动作重新给。第 2 张是构图和姿势参考：照它的机位、景别、人物在画面里的位置、身体姿势和手部动作来拍，不从它取脸。背景和穿搭都要换掉：换一个跟参考图不同、又能自然容纳这个姿势的场景，穿一套跟参考图不同、适合她日常的衣服。画面是朋友圈里手机随手拍的 ins 风真实照片，自然光，轻微颗粒，不要影棚感和 AI 精修感；画面里不出现任何文字、水印、用户名或界面元素。
```

### 例二：抽到 2 张（第 2 张）

`images` 依次是定妆照、ins风 4/100 第 5 张、ins 博主 sodaaam 第 2 张：

```{.text .wrap}
第 1 张是 SEOA（徐星澄）的身份参考：24 岁，女团主舞兼创作型歌手。只从它取脸型、五官、年龄感和辨识度，保留她的黑色长发，表情和头部角度按这张照片自己的动作重新给。第 2 张是构图和姿势参考：照它的机位、景别、人物在画面里的位置、身体姿势和手部动作来拍；第 3 张只作辅助参考，取它的拍摄感和氛围。两张都不取脸。背景和穿搭都要换掉：换一个跟参考图不同、又能自然容纳这个姿势的场景，穿一套跟参考图不同、适合她日常的衣服。画面是朋友圈里手机随手拍的 ins 风真实照片，自然光，轻微颗粒，不要影棚感和 AI 精修感；画面里不出现任何文字、水印、用户名或界面元素。
```

请求体照接口页的编辑请求写，本地图片转成 data URI：

```json
{"model": "gpt-image-2.5", "size": "3:4", "prompt": "<上面的 prompt>",
 "images": [{"image_url": "data:image/jpeg;base64,<定妆照>"},
            {"image_url": "data:image/jpeg;base64,<ins-04-5.jpg>"},
            {"image_url": "data:image/jpeg;base64,<ins-sodaaam-2.jpg>"}]}
```

### 这一套踩到的

- **两张参考分不出主次**：第 1 张学的是辅助那张的坐姿。要严格照一张，就只给一张
- **衣服和背景会趋同**：模型爱沿用参考图的浅色系，9 张里 5 张是米白针织；室内背景常自己加一面贴照片的墙。要拉开差异，得在 prompt 里点名衣服颜色和场景
- **机位贴得太近，脸会漂**：第 7 张仰拍特写，机位和光线跟参考图几乎一样，脸往参考图里的人身上靠
