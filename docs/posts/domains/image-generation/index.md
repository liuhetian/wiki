---
description: "自然图像 · 给一段描述，出一张图；一个 prompt 用 gpt image 出中式仙侠仙女半身照；gpt image 味道过重，SEOA 9 张和实拍原图并排就看得出皮肤、头发上的颗粒，用 nano banana 一句话重绘成三维 CG 质感，是后处理"
---

# 图像生成（image generation）：给一段描述，出一张图

**图像生成的通用功能只有一件事：给一段描述，出一张图。** 细分方向都是被新需求逼出来的：gpt image 出的图味道太重，就要换个模型重绘。在[领域地图](../index.md#generation)上它在「内容生成」一组，处理对象是自然图像。

## 通用功能：一个 prompt，出一张图 { #basic }

```{.text .wrap}
生成一张精致的三维 CG 质感的中式仙侠风仙女半身照

柔和的暖金色日光从侧后方斜照进来，掠过女子的脸颊、金丝发冠和薄纱，在青灰色的宫殿背景上留下虚化的竖向光斑。
```

<figure markdown>
![gpt image 出的中式仙侠仙女半身照](assets/fairy-gpt-image.webp){ width="420" }
<figcaption>gpt image</figcaption>
</figure>

## 细分方向：一个新需求，一个方向 { #needs }

### gpt image 味道过重：重绘（image-to-image）· 后处理 { #redraw }

左边是 gpt image 照着实拍姿势出的 [SEOA](../../../gallery/personas/seoa.md) 9 张，右边是对应的实拍原图，位置一一对应：

<figure markdown>
![左 gpt image 出的 SEOA 9 张，右对应的实拍原图，姿势一一对应](assets/seoa-vs-reference.webp)
<figcaption>左：gpt image；右：实拍原图</figcaption>
</figure>

把通用功能那张仙女图交给 nano banana：

```{.text .wrap}
重构这张图为精致的三维 CG 质感
```

<figure markdown>
![nano banana 重绘后的仙女半身照](assets/fairy-nano-banana.webp){ width="420" }
<figcaption>nano banana 重绘</figcaption>
</figure>

<figure markdown>
![脸部同一位置对比：左 gpt image，右 nano banana](assets/fairy-face-compare.webp)
<figcaption>脸部同一位置：左 gpt image，右 nano banana</figcaption>
</figure>
