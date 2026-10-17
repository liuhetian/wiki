---
name: 花卉动态生长海报
description: "要做一张会长出来的花卉海报时用：照片转肌理插画、插画套排版出海报，首尾帧视频从空白纸面长成海报，最后接成循环；五步各一段 prompt，花名、颜色和海报文字填空"
---

# 花卉动态生长海报

<figure>
  <video src="/gallery/video/assets/flower-growth-poster/loop.mp4" autoplay loop muted playsinline width="360"></video>
</figure>

一枝花从空白米纸上长出来、开花，标题和小字随后浮现，定格成海报，再淡回空白纸循环。上面是填「洋桔梗」那次的成品，也收在 [Gallery](../../../gallery/video/flower-growth-poster.md)。生长过程交给视频模型补，我们只定首尾两帧：尾帧是成品海报，首帧是同一张纸的空白底，背景从头到尾不动。风格和排版各用一段固定的 prompt，换一种花只改填空。

①②③ 调[生成、编辑图片](../../agent-io/reference/image.md)，④ 调[首尾帧生成视频](../../agent-io/reference/video/first-last-frame.md)，⑤ 在本地用 ffmpeg。下面的图是填「洋桔梗」那次的中间产物。

## ① 花的照片 { #photo }

用用户拍的花。没有照片就生成一张，3:4：

> 手机随手拍的一张照片：窗边玻璃瓶里插着一枝<input name="花名" placeholder="花名，比如洋桔梗">，一根主茎分出几条侧枝，有盛开的花，也有几个还没开的花苞。自然光，背景是有点乱的室内桌面，轻微失焦，普通手机拍照质感，不要修图感。竖构图。

<figure markdown>
  ![窗边玻璃瓶里插着一枝粉紫色洋桔梗的手机照片](assets/photo.webp){ width="300" }
</figure>

## ② 肌理插画 { #texture }

改图，原图传 ①，3:4：

> 把照片里这一枝<input name="花名" placeholder="花名，比如洋桔梗">转绘成插画，只保留花枝本身，去掉花瓶和背景，花枝完整居中、从画面底部长上来。
>
> 风格：重质感的扁平插画，花瓣用几何化的块面概括（有棱角的分层花瓣），叶子也做成简洁的几何形。
>
> 肌理：整张有明显的颗粒噪点和丝网印刷的套色感，像印在粗糙的颗粒米白纸上，边缘有轻微的印刷错位和颗粒晕染。
>
> 颜色：花瓣从中心的<input name="花心色" placeholder="花瓣中心的颜色，比如深紫红">渐变到外缘的<input name="花瓣色" placeholder="花瓣外缘的颜色，比如浅粉紫">，花苞是黄绿到<input name="花瓣色" placeholder="花瓣外缘的颜色，比如浅粉紫">的渐变，花茎和叶子从底部的深墨绿渐变到上部的浅灰绿。
>
> 背景是干净的米白色颗粒纸，没有任何文字。

<figure markdown>
  ![米白颗粒纸上的洋桔梗插画，带丝网印刷肌理和渐变](assets/illustration.webp){ width="300" }
</figure>

## ③ 排版海报 { #layout }

改图，原图传 ②，3:4。不满意就多出几张挑一张：

> 用这张花卉插画做一张极简风格的竖版海报，插画的画风、颗粒肌理和颜色保持不变。排版：
>
> - 花枝缩小到画面高度的六成左右，居中偏下，四周大面积留白，背景是同一种米白色颗粒纸。
> - 左上角竖排大标题「<input name="标题" placeholder="标题，比如洋桔梗">」，宋体风格，颜色取花瓣的<input name="花心色" placeholder="花瓣中心的颜色，比如深紫红">。
> - 标题右侧一行竖排小字「<input placeholder="副标题，比如秋日花事 · 第十二帖">」。
> - 画面左侧下方竖排一列英文小字「<input placeholder="英文名大写，比如 LISIANTHUS">」，右侧中部竖排一列小字「<input placeholder="学名，比如 Eustoma grandiflorum">」。
> - 底部居中一行小字「<input placeholder="落款，比如花开有时 · 2026.10">」。
>
> 所有文字都用花的同色系（<input name="花心色" placeholder="花瓣中心的颜色，比如深紫红">、偏灰的<input name="花瓣色" placeholder="花瓣外缘的颜色，比如浅粉紫">、墨绿），字号克制，不要出现其他多余文字、边框或 logo。

<figure markdown>
  ![极简竖版海报：左上竖排「洋桔梗」，花枝居中，两侧中英文小字](assets/poster.webp){ width="300" }
</figure>

## ④ 首尾帧生长视频 { #video }

5 秒，`768p竖`，输出 768×1344（4:7）。两帧自己拼，不交给模型：

- **首帧**：在海报上找一块没有花和字的空白（洋桔梗那张是右上角），截下来镜像平铺，铺满 4:7 的画布。别让模型把海报上的花和字去掉来做首帧：出来的纸比海报浅、颗粒也不一样，视频会整体变色
- **尾帧**：海报贴在同一张平铺纸的中间，3:4 上下补出来的部分就是平铺的纸纹
- 两帧都缩到 768×1344 再传

<div class="grid" markdown>

<figure markdown>
  ![首帧：只有米白颗粒纸纹的空白画面](assets/first-frame.webp){ width="200" }
  <figcaption>首帧：平铺的纸纹</figcaption>
</figure>

<figure markdown>
  ![尾帧：海报上下补了同样的纸纹，变成 4:7](assets/last-frame.webp){ width="200" }
  <figcaption>尾帧：海报贴在中间</figcaption>
</figure>

</div>

> 固定镜头，画面完全不动，背景米白颗粒纸纹从头到尾保持不变。一枝<input name="花名" placeholder="花名，比如洋桔梗">从画面下方的纸面上开始生长：深绿色的主茎从下往上慢慢长出，边长边分出侧枝，叶片一片片舒展开，枝头冒出黄绿色的小花苞；随后大花苞逐层展开花瓣，绽放成<input name="花瓣色" placeholder="花瓣外缘的颜色，比如浅粉紫">的花朵，带着颗粒印刷质感。花完全开好之后，左上角的竖排标题「<input name="标题" placeholder="标题，比如洋桔梗">」和周围的小字从纸面上淡淡浮现，最后定格成完整的海报。插画风格，动作平滑自然。

洋桔梗那次 1–2 秒长茎冒花苞，2–3 秒开花，约 4 秒定格；文字没等花开完，跟开花同时浮现了。从提交到下载完 170 秒，约 0.2 元。

## ⑤ 接成循环 { #loop }

模型出的视频停在海报上就结束，直接循环会从成品一下跳回空白纸。用 ffmpeg 接：

- **尾巴接回开头**：最后一帧多停 1.5 秒，再用 0.8 秒淡回视频的第 0 帧（空白纸）；模型自带的音轨去掉
- **交付 mp4**：H.264、crf 20、faststart。网页里写 `autoplay loop muted playsinline`，看起来就是一张动图。洋桔梗那次 6.7 秒、2.3 MB
- **不交 GIF**：480 宽、15 fps 就有 14 MB，是 mp4 的 6 倍。颗粒纸面把抖动藏住了，画质倒没差多少，发到只收 GIF 的地方再导

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../../maintenance/skills/flower-growth-poster.md)。正常使用不用看，出问题再看。

</div>
