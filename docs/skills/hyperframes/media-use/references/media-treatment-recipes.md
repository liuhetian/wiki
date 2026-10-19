<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/media-treatment-recipes.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 媒体处理方案配方

这些是可选的、经过测试的起点（seed），不是完整的能力面。先读共享的策略，再通过 `media-treatments.md` 选出一个相关的小节。agent 可以在检查媒体之后修改某个起点，或将其与兼容的规范控件组合；没有合适的起点时，也可以从 `hyperframes media-treatment --capabilities --json` 拼装一个定制的 payload。

## Natural Portrait

用于口播、访谈、主持人或以人物为主的照片，且预期结果是自然、精致、克制的。

当人脸只是附带的或很小、源素材是有意做成霓虹/单色/强烈风格化的，或者用户要的是美颜修图时，不要用它。这个处理方案改变的是整个画面；它不是人脸遮罩，也不是磨皮效果。

检查脸部曝光、高光保留、暗部细节、白平衡，以及现有的风格是否有意为之。signalstats 检测不到人脸，也检测不到创作意图。

### 基础 payload

从这里开始，然后只在采样帧有理由支持时才微调：

```json
{ "preset": "skin-soft", "intensity": 0.6 }
```

`skin-soft` 是一个全局的影调/色彩 preset，它的自然饱和度运算对类似肤色的颜色做了削弱。它不会模糊、修图、分割或追踪人脸。

### 有界微调

调整值是最终 payload 里的绝对值，不是叠加在 preset 之上的增量。除非用户要求风格化的结果，否则把改动控制在下面这些保守的范围内：

| 属性 | Natural Portrait 范围 |
| --- | --- |
| intensity | 0.45 到 0.75 |
| exposure | -0.06 到 0.14 |
| contrast | -0.05 到 0.08 |
| highlights | -0.18 到 -0.04 |
| shadows | 0.04 到 0.18 |
| whites | -0.10 到 0.04 |
| blacks | -0.06 到 0.06 |
| temperature | -0.05 到 0.10 |
| tint | -0.03 到 0.05 |
| vibrance | 0 到 0.06 |
| saturation | -0.04 到 0.06 |

颗粒、模糊和像素化保持为零。暗角是可选的，取值 `0` 到 `0.05`，并且只在它能改善主体聚焦、又不显得像一个特效时才用。

手动控件必须待在各自的 schema 小节里；它们绝不是顶层键。一个微调过的 Natural Portrait payload 长这样：

```json
{
  "preset": "skin-soft",
  "intensity": 0.58,
  "adjust": {
    "highlights": -0.08,
    "shadows": 0.08,
    "temperature": 0.02,
    "vibrance": 0.02
  },
  "details": { "vignette": 0.03 }
}
```

在 `grade-compare` 的候选文件里使用同样的嵌套结构。`adjust` 负责影调/色彩控件，`details` 负责暗角/颗粒，`effects` 负责模糊、像素化、色度渗出（chroma bleed）以及下文那些高级处理方案基础构件。

在通用的对比环节中，凡是让肤色变得不可信、丢失高光细节、让深色皮肤变平或褪色，或者意外给服装和背景染上色偏的结果，一律否决。

## Product Polish

用于拍摄的实体产品照片或视频，目标是干净、准确、有立体感的呈现。保护产品颜色、材质纹理、标签可读性、镜面高光和有意布置的光线。

不要把这个处理方案用于字面意义上的应用/网站截图或屏幕录制；那些按下文的 UI Fidelity 处理。不要中和生活方式场景里有意营造的环境色，也不要在没有中性参考或已知产品颜色的情况下，推断要做精确的品牌色校正。

把产品和背景分开检查。检查白平衡、标签清晰度、表面纹理、高光削波、暗部细节、白点和黑点。统计数据无法识别白色包装、金属高光、琥珀色玻璃或有意为之的暖光。

### 基础 payload

把这个克制的校正和未经处理的源素材做对比：

```json
{
  "intensity": 0.7,
  "adjust": {
    "exposure": 0.01,
    "contrast": 0.06,
    "highlights": -0.1,
    "shadows": 0.04,
    "whites": 0.02,
    "blacks": -0.03,
    "vibrance": 0.03,
    "saturation": 0.02
  }
}
```

这是一个对比用的起点，不是让你去修改一个已经完成的源素材的指令。如果原片颜色准确、端点干净、纹理良好，就保持像素不变，通过构图取景或运动来润色。

### 有界微调

| 属性 | Product Polish 范围 |
| --- | --- |
| intensity | 0.45 到 0.8 |
| exposure | -0.08 到 0.1 |
| contrast | 0 到 0.1 |
| highlights | -0.16 到 0 |
| shadows | 0 到 0.12 |
| whites | -0.08 到 0.05 |
| blacks | -0.06 到 0.04 |
| temperature | -0.05 到 0.05 |
| tint | -0.03 到 0.03 |
| vibrance | 0 到 0.06 |
| saturation | -0.04 到 0.05 |

色温和色调保持为零，除非画面显示出一个可信的色偏。对于商品目录/电商媒体，颗粒、暗角、模糊和像素化保持为零。对于生活方式类的产品镜头，只有在暗角能改善聚焦且不改变产品本身时，才可接受最高 `0.04` 的暗角。

在通用的对比环节中，凡是让白色包装削波、让黑色产品发闷、让已知品牌色偏移、掩盖纹理或让标签更难读的结果，一律否决。如果保留原片是经过考虑的决定，要在汇报里说明。

## UI Fidelity

用于字面意义上的应用、网站、仪表盘、终端、幻灯片或录屏像素，它们的颜色和可读性本身就是所展示产品的一部分。

默认 payload 是 **none**（不加）：不要添加 `data-color-grading`。全局色彩改动会同时影响品牌色、状态色、图表、截图和小字，所以即便是一个有品位的摄影风格，也会让演示变得不那么真实。

用裁剪、缩放、节奏、光标强调、周围的 DOM overlay，或在录制像素之外的 seek 安全运动来润色 UI 素材。如果用户明确要求风格化的 UI 风格，就和原片对比预览，并说明已不再保留确切的 UI 颜色。如果是用摄像机拍摄的屏幕，只校正已证实的拍摄色偏或曝光问题，并且仍要在有代表性的帧上验证文字和品牌色。

## Film Memory

当故事明确需要温暖的回忆、克制的闪回、个人档案或胶片般的追忆时使用。这不是"电影感（cinematic）"的默认含义，也不是对扫描胶片型号的模拟。

不要用于字面意义的 UI、商品目录媒体、技术演示，或当下准确色彩很重要的素材画面。VHS/REC 那种语言请用单独的摄像机处理方案。不要添加灰尘、划痕、漏光、胶片烧灼或光晕（halation），除非有可用的自有 component，并且所请求的故事确实能从中受益。

检查源素材是否有足够的高光和暗部细节来承受褪色处理，并确认怀旧感或时间上的区隔确实属于这个故事。要对比完整的动态处理效果，而不只是一张静态的 preset 卡片。

### 静态像素基础

从这个自有的 shader 配方开始：

```json
{
  "preset": "vintage-wash",
  "intensity": 0.6,
  "details": {
    "vignette": 0.12,
    "grain": 0.12,
    "grainSize": 0.2,
    "grainRoughness": 0.6
  }
}
```

把静态取值控制在这些范围内：

| 属性 | Film Memory 范围 |
| --- | --- |
| intensity | 0.5 到 0.75 |
| vignette | 0.08 到 0.16 |
| grain | 0.08 到 0.16 |
| grainSize | 0.16 到 0.24 |
| grainRoughness | 0.5 到 0.7 |

偏强的一端可能会让深色皮肤、黑色服装或本已褪色的素材画面变平。和源素材对比，出现这种情况就降低强度。

### 时间性质感

在同一个媒体元素上使用已有的、已注册的暂停态 GSAP timeline：

- 在媒体元素的内联 `style` 里写入 `--hf-color-grading-exposure: 0`；
- 让它在 `-0.03` 到 `0.03` 范围内走一段有限的不规则序列，使用约 `0.45` 到 `0.8` 秒的柔和 `sine.inOut` 分段；
- 对于片门抖动（gate weave），`x`/`y` 控制在 composition 短边的 `0.15%` 以内，旋转控制在 `0.03` 度以内，缩放在 `1.005` 到 `1.01` 之间，以保护画面边缘；
- 在处理方案结束时回到接近起始值的曝光和变换。

不要使用随机数、无限循环的 CSS keyframes、定时器或 `onUpdate`。闪烁（flicker）是轻柔的曝光脉动，不是闪白。抖动（weave）是轻微的机械漂移，不是手持晃动。

还要运行聚焦的关键帧诊断，并直接 seek 到"结尾减一帧"的位置。否决亮度忽明忽暗的抽动、分散注意力的漂移、被裁掉的边缘，或皮肤/细节的损失。汇报运动范围，并把它描述为 HF film-memory 处理方案，而不是相机胶片型号模拟。如果运动先被看成一种特效、而不是先被看成回忆，就减弱或去掉它。

## Creator Camcorder

当故事明确需要创作者摄像机录制、消费级摄像机的回忆，或克制的数字视频质感时使用。这个处理方案是现代摄像机的视觉语言，不是 VHS 修复、CRT 模拟、监控画面，也不承诺复现某个特定的相机型号。

不要把它用于字面意义的 UI、商品目录媒体、很小的媒体格子，或已经压缩过、带有分散注意力的色彩渗出的素材画面。不要仅仅因为源素材里有人在说话就加 REC HUD；摄像设备的视觉语言必须服务于故事或用户要求的风格。

检查皮肤、饱和的边缘、细小文字、源素材的压缩情况，以及源素材是否已经有刻意的摄像机风格。否决那些因色度变软而损害标签、图形或可识别产品颜色的结果。要在运动中评判色度柔化和颗粒，而不是只看一张静帧。

### 静态像素基础

从下面这个经过验证的 shader payload 开始，然后只在有代表性的帧有理由支持时，在有界范围内微调：

```json
{
  "intensity": 0.72,
  "adjust": {
    "contrast": 0.08,
    "highlights": -0.05,
    "shadows": 0.02,
    "whites": 0.03,
    "blacks": -0.04,
    "temperature": -0.03,
    "tint": -0.015,
    "vibrance": -0.03,
    "saturation": -0.06
  },
  "details": {
    "vignette": 0.06,
    "grain": 0.08,
    "grainSize": 0.18,
    "grainRoughness": 0.58
  },
  "effects": { "chromaBleed": 0.55 }
}
```

| 属性 | Creator Camcorder 范围 |
| --- | --- |
| intensity | 0.55 到 0.8 |
| contrast | 0.03 到 0.1 |
| highlights | -0.1 到 0 |
| shadows | 0 到 0.06 |
| whites | 0 到 0.05 |
| blacks | -0.08 到 -0.01 |
| temperature | -0.06 到 0.04 |
| tint | -0.03 到 0.02 |
| vibrance | -0.06 到 0.02 |
| saturation | -0.12 到 -0.02 |
| vignette | 0.03 到 0.1 |
| grain | 0.04 到 0.12 |
| grainSize | 0.14 到 0.24 |
| grainRoughness | 0.45 到 0.7 |
| chromaBleed | 0.35 到 0.7 |

模糊和像素化保持为零。方形像素、扫描线、RGB 分离和跟踪噪点属于不同的视觉语言，不是这个处理方案的默认项。

### 可选的摄像机 HUD

当叙事能从明确的录像设备语言中受益时，安装这个 Registry overlay block：

```bash
npx hyperframes add camcorder-hud --no-clipboard
```

把打印出的 `data-composition-src` 宿主插入到目标媒体范围之上。在 `compositions/camcorder-hud.html` 里编辑显示的日期/时间/模式/计数器。该 block 的暂停态 GSAP timeline 根据 composition 时间推导出计数器和 REC 闪烁，所以播放、拖动和渲染的结果一致。让 HUD 保持有限时长，并限定在这个镜头内。

HUD 是一个可选的人为编排的 overlay。没有它，像素 payload 照样有用；而单有 HUD 也不能证明素材画面经过了处理。

### 可选的"源素材到摄像机"揭示

全局调色强度只会淡化一级校正和 LUT 输出；它不会淡化独立的摄像机效果。要做一个可见的从源素材到摄像机的模式切换，使用两个同步的媒体层，并做一段从未处理到已处理素材画面的有限透明度交叉淡化。在同一个暂停态 GSAP timeline 上把 HUD 淡入。不要用回调或独立的时钟去动画 shader 状态。

还要在项目支持的每种画幅比例下验证 HUD 的位置和构图。汇报是否使用了 HUD，并把它描述为 HF 摄像机处理方案，而不是摄像机/VHS 模拟。如果某个效果伪影比主体更引人注目，就减弱色度渗出/颗粒，或保持源素材不变。

## VHS Playback

当故事明确需要模拟家用录像带、年代久远的档案，或明显劣化的 VHS 回放时使用。这个处理方案不是 Creator Camcorder，不是通用的像素化，不是 CRT 显示模拟，也不是默认的复古风格。

不要用于字面意义的 UI、商品目录媒体、小字、干净的现代创作者素材，或任何其可识别颜色/细节必须保持准确的源素材。在运动中检查高对比度的垂直边缘、人脸、饱和的物体以及画面底部。模拟信号的损伤必须服务于故事，同时不能让主体难以辨认。

### 像素 payload

从完整的、经过验证的组合开始，而不是只用 `tapeDamage`：

```json
{
  "intensity": 1,
  "adjust": { "contrast": -0.04, "saturation": -0.08 },
  "details": {
    "grain": 0.16,
    "grainSize": 0.12,
    "grainRoughness": 0.72
  },
  "effects": {
    "tapeDamage": 0.82,
    "tapeTracking": 0.85,
    "tapeNoise": 0.3,
    "tapeSpeed": 0.5,
    "chromaBleed": 0.5,
    "chromaticAberration": 0.18,
    "chromaticAngle": 0,
    "scanlines": 0.35,
    "scanlineCount": 0.17,
    "scanlineSoftness": 1,
    "digitalGlitch": 0.32,
    "digitalGlitchColorSplit": 0,
    "digitalGlitchLineTear": 0.08,
    "digitalGlitchPixelate": 0,
    "digitalGlitchBlockAmount": 0,
    "digitalGlitchBlockDisplacement": 0,
    "digitalGlitchBlockOpacity": 0,
    "digitalGlitchSpeed": 0.5
  }
}
```

| 属性 | VHS Playback 范围 |
| --- | --- |
| intensity | 0.75 到 1 |
| contrast | -0.1 到 0 |
| saturation | -0.16 到 0 |
| grain | 0.08 到 0.18 |
| grainSize | 0.08 到 0.18 |
| grainRoughness | 0.55 到 0.8 |
| tapeDamage | 0.65 到 0.9 |
| tapeTracking | 0.5 到 0.9 |
| tapeNoise | 0.15 到 0.45 |
| tapeSpeed | 0.35 到 0.65 |
| chromaBleed | 0.35 到 0.65 |
| chromaticAberration | 0.08 到 0.22 |
| scanlines | 0.2 到 0.4 |
| scanlineCount | 0.14 到 0.2 |
| digitalGlitch | 0.2 到 0.4 |
| digitalGlitchLineTear | 0.04 到 0.1 |

`tapeDamage` 负责确定性的水平行抖动、缓慢的时基摆动、底边的磁头切换、亮度带宽损失、克制的重影、噪点和稀疏的信号丢失（dropout）。它下属的 tracking/noise/speed 控件会添加有界的、移动的磁带撕裂，并控制其信号特征，而不引入新的时钟。`chromaBleed` 单独降低水平方向的色度细节。克制的扫描线和色差设置补足其余的磁带回放质感。数字阶段只用于偶发的水平行撕裂：把它的色彩分离、像素化、块位移、块透明度和损坏取值都保持为零。模糊、CRT 曲率、通用像素化和摄像机 HUD 都保持关闭。

这些取值是 HyperFrames 的原创配方，是在与外部视觉参考相同的公开 Orange Cat 源素材上校准的。它们不是复制来的 shader 代码，也不宣称与外部参考的输出像素级一致。扫描线数量映射到参考里大约 127 个周期的主线条图案；HF 的 tracking 运算在媒体像素范围内保持有界，并使用 composition 时钟。

shader 损伤由现有的确定性媒体时间推演，所以不需要 CSS 循环或私有 timeline。全局调色强度不会淡化磁带损伤或其他独立效果。如果故事需要一段有限的"源素材到磁带"揭示，就在宿主的暂停态 GSAP timeline 上交叉淡化同步的未处理和已处理媒体层。在通用工作流中，检查密集的连续帧，否决生硬的边缘撕裂、人脸拖影、冻结的噪点、方块、空白边框，或与主体争夺注意力的底部干扰。

## 8mm Home Movie

用于个人档案、家庭回忆、童年、旅行回忆，或明确的小画幅家庭电影语言。它比 Film Memory 更强烈、更有胶片的物质感，但它仍然是 HyperFrames 自有的处理方案，而不是声称复现某个具名的胶片型号、相机或冲印工艺。

不要用于字面意义的 UI、技术演示、商品目录产品、干净的访谈，或灰尘/划痕会暗示虚假来源的素材画面。应用之前检查皮肤、高光、深色服装和画面边缘。

### 像素 payload

```json
{
  "preset": "vintage-wash",
  "intensity": 0.72,
  "details": {
    "vignette": 0.28,
    "vignetteMidpoint": 0.54,
    "vignetteFeather": 0.72,
    "grain": 0.34,
    "grainSize": 0.18,
    "grainRoughness": 0.72
  },
  "effects": { "filmArtifacts": 0.62 }
}
```

| 属性 | 8mm Home Movie 范围 |
| --- | --- |
| intensity | 0.6 到 0.8 |
| vignette | 0.18 到 0.34 |
| grain | 0.22 到 0.42 |
| grainSize | 0.12 到 0.24 |
| grainRoughness | 0.6 到 0.8 |
| filmArtifacts | 0.35 到 0.7 |

`filmArtifacts` 只负责确定性的稀疏灰尘和短划痕。现有的 preset/details 负责色彩、暗角和颗粒；宿主的暂停态 GSAP timeline 负责可选的片门抖动。抖动控制在 composition 短边的 `0.15%` 以内，旋转控制在 `0.03` 度以内，缩放在 `1.005` 到 `1.015` 之间。使用约 `0.6` 到 `1` 秒的有限 `sine.inOut` 分段，回到接近起始值的变换，绝不使用随机数、定时器、`onUpdate` 或无限循环的 CSS 动画。

出现以下情况时否决结果：灰尘一直可见、划痕不自然地持续存在、画面亮度抽动、抖动露出边缘、高光变脏，或者材质伪影比回忆本身更引人注意。想要更含蓄的怀旧效果，改用 Film Memory。

## Editorial Halftone

用于印刷/编辑风格的转场、海报帧、漫画/报纸语言、风格化的产品或人像段落，以及以可见的油墨网屏为看点的图形序列。这是真正的四角度 CMYK 网屏处理方案，不是一层带点的 DOM overlay。

不要用于字面意义的 UI、密集文字、小标签、必须保持照片真实感的素材画面，或较长的口播段落，除非用户明确要求强烈的印刷风格化。只要文字/字幕必须保持可读，就把它们作为不参与调色的 DOM 放在媒体之上。

### 像素 payload

```json
{
  "intensity": 1,
  "adjust": { "contrast": 0.04, "saturation": 0.04 },
  "effects": { "halftone": 0.94, "halftoneSize": 0.36 }
}
```

| 属性 | Editorial Halftone 范围 |
| --- | --- |
| intensity | 0.8 到 1 |
| contrast | -0.02 到 0.08 |
| saturation | -0.04 到 0.08 |
| halftone | 0.75 到 1 |
| halftoneSize | 0.15 到 0.55 |

shader 使用固定的 C/M/Y/K 网屏角度 15/75/0/45 度、分离的油墨覆盖率、暖色的纸张底色，以及随分辨率调整的网点单元尺寸。保持这些网屏语义固定；只微调数量和尺寸，除非将来有视觉证据证明值得扩展 schema。要在最终输出分辨率下评判结果，因为浏览器缩放会让网屏失真。否决不稳定的摩尔纹、无法辨认的主体、被削掉的油墨细节、过大的网点，或任何看起来像是在未改动的素材画面上叠了一层透明点状纹理的处理方案。

## Two-Ink Editorial Print

用于海报帧、编辑风格人像、音乐/社交媒体的插入镜头、zine 图形，以及以印刷为主导的大胆转场，在这些场合下两种可见的专色油墨比照片色彩更合适。这是 HyperFrames 固定的原创朱红/青绿处理方案，并不声称模拟某个具名的印刷机、油墨组合或商业印刷工艺。

不要用于字面意义的 UI、对品牌色要求严格的产品、小标签、自然风格的口播，或必须保持照片真实感的媒体。字幕和图形保持为处理后媒体之上的普通 DOM。

### 像素 payload

```json
{
  "intensity": 1,
  "adjust": { "contrast": 0.08, "highlights": -0.06, "shadows": 0.04 },
  "effects": { "twoInkPrint": 1, "twoInkPrintSize": 0.42 }
}
```

| 属性 | Two-Ink 范围 |
| --- | --- |
| intensity | 0.8 到 1 |
| contrast | 0.02 到 0.1 |
| highlights | -0.1 到 0 |
| shadows | 0 到 0.08 |
| twoInkPrint | 0.8 到 1 |
| twoInkPrintSize | 0.18 到 0.55 |

shader 把暖色中间调映射为朱红，把深色/冷色阴影映射为青绿，把两者共有的深色覆盖区映射为暖色纸张上的深色叠印。它使用分离的 15/75 度网屏、一个细微的固定套准偏移、确定性的纸张纹理，以及随分辨率调整的网点尺寸。不要把它和 `halftone` 或双色调（duotone）LUT 组合：那会把结果重新分色，破坏双墨约定。

在输出分辨率下、跨多帧评判它。否决缺失第二种油墨、人脸被压死、不稳定的摩尔纹、难以辨认的轮廓，或看起来像是"带网点的红色调"而不是两种网屏油墨的结果。

## Monochrome Screen Print

用于图形化的人像段落、海报化的社交媒体插入、类似报纸的网屏，或向可见单色网格的有限转场。字幕和排版保持为处理后媒体之上的普通 DOM。

```json
{
  "intensity": 1,
  "effects": {
    "monoScreen": 1,
    "monoScreenSize": 0.35,
    "monoScreenAngle": 0.25,
    "monoScreenSpread": 0.3,
    "monoScreenShape": 0,
    "monoScreenInvert": 0
  },
  "palette": ["#111319", "#f2ecdc"]
}
```

`monoScreenShape` 用 `0..4` 分别表示圆形、方形、菱形、三角形或线条。单元尺寸控制在 `0.15..0.55`，扩散（spread）控制在 `0.15..0.55`。否决丢失轮廓的人脸、不稳定的摩尔纹，或小到在最终编码分辨率下无法保留的单元。

## Engraved Illustration

用于编辑风格人像、历史/技术插画、标题卡插入镜头，或"源素材到线稿"的揭示。它不是常规校正，不应用于字面意义的 UI 或对品牌色要求严格的产品素材画面。

```json
{
  "intensity": 1,
  "effects": {
    "engraving": 1,
    "engravingSpacing": 0.4118,
    "engravingMinThickness": 0.2,
    "engravingMaxThickness": 0.4571,
    "engravingAngle": 0.25,
    "engravingContrast": 0.4667,
    "engravingSharpness": 0.59,
    "engravingWave": 0.2,
    "engravingWaveFrequency": 0.2222
  },
  "palette": ["#101216", "#f3eddf"]
}
```

先保留校准好的基础值。间距在 `0.25..0.6` 内微调，对比度在 `0.3..0.65` 内，波动（wave）在 `0..0.35` 内。否决被挤压的构图、断裂的轮廓、噪点很多的平坦背景，或在运动帧之间闪烁的线条。

## Crosshatched Sketch

用于手绘风格的编辑段落、漫画/纪录片插入镜头，以及简短的插画式变换，这些场合需要多个方向的线条来保留主体轮廓。

```json
{
  "intensity": 1,
  "effects": {
    "crosshatch": 1,
    "crosshatchSpacing": 0.28,
    "crosshatchThickness": 0.25,
    "crosshatchAngle": 0.25,
    "crosshatchContrast": 0.3333,
    "crosshatchEdges": 0.5,
    "crosshatchLineWeight": 0,
    "crosshatchWave": 0.33,
    "crosshatchWaveFrequency": 0.2222
  },
  "palette": ["#101216", "#f3eddf"]
}
```

间距在 `0.18..0.5` 内微调，边缘细节在 `0.3..0.7` 内，波动在 `0.1..0.45` 内。否决变形的宽高比、遮住主体的大片黑色填充，或强于预期素描语言的时间性闪烁。

## CRT Display

当媒体被有意呈现为老式显示器、终端、游戏画面或广播显示时使用。单有曲率只是几何形变，不是完整的 CRT 处理方案，所以要搭配克制的扫描线和仅仅轻微的通道分离。

```json
{
  "intensity": 1,
  "effects": {
    "crtCurvature": 0.2,
    "scanlines": 0.35,
    "scanlineCount": 0.17,
    "scanlineSoftness": 1,
    "chromaticAberration": 0.08,
    "chromaticAngle": 0
  }
}
```

曲率控制在 `0.08..0.28`，扫描线在 `0.18..0.45`，通道分离在 `0..0.12`。否决过大的黑角、无法阅读的 UI、大面积的色边，或在用户只要求校正时把显示器语言套到普通素材画面上。

## Procedural ASCII

用于有意为之的终端、代码、数据、监控、编辑风格，或"源素材到字符"的揭示。这是真正由 shader 生成的 5x7 字形场，不是放在未改动素材画面之上的等宽文本。

不要把它当作常规的口播润色，不要用于字面意义的 UI 或密集文字，也不要用在需要精确识别人脸/产品的场合。字幕和图形保持为处理后媒体之上的普通 DOM。

从下面这些经过验证的起点中选一个：

```json
{
  "effects": { "ascii": 1, "asciiSize": 0.08, "asciiInvert": 1 },
  "palette": ["#020605", "#38ff78"]
}
```

第一个是 **Terminal ASCII**：深色底、亮绿色字形，适合代码/数据/设备语言。想要更暖、更像印刷品的 **Editorial ASCII**，用：

```json
{
  "effects": { "ascii": 1, "asciiSize": 0.066, "asciiInvert": 0 },
  "palette": ["#0b0d0d", "#eee9db"]
}
```

要做完全可读的处理方案，`ascii` 保持在 `0.75` 到 `1` 之间，`asciiSize` 保持在 `0.04` 到 `0.15` 之间。有限时长的揭示可以内联写入 `--hf-color-grading-ascii: 0`，再用已注册的暂停态 GSAP timeline 把它 tween 到 `1`。否决不稳定的单元、丢失的轮廓/面部结构、无法辨认的构图，或与项目冲突的色板。

## Ordered Palette Dither

用于海报化的社交媒体段落、音乐/编辑风格插入镜头、像素艺术语言，或有限时长的"源素材到色板"揭示。shader 使用稳定的 4x4 Bayer 阈值矩阵和一个明确的从暗到亮的色板。不要把它描述成 Floyd-Steinberg、Atkinson 或其他顺序误差扩散过程。

不要用于字面意义的 UI、对品牌色要求严格的产品、小标签，或较长的照片写实段落。从下面这些原创色板中选一个开始：

```json
{
  "effects": { "dither": 1, "ditherSize": 0.25 },
  "palette": ["#17121a", "#824c50", "#e09873", "#f7ddb1"]
}
```

四色的选项叫 **Warm Print**。想要更张扬的社交/音乐段落，用六色的 **Electric Ink** 色板：

```json
{
  "effects": { "dither": 1, "ditherSize": 0.4 },
  "palette": ["#080717", "#3c185f", "#7e2278", "#d9339f", "#ff6b66", "#aafae0"]
}
```

HyperFrames 还自带下面这些具名色阶。名字只是编写时的快捷方式；要通过现有的 `palette` 数组持久化列出的颜色：

| 分组 | Palette ID | 有序颜色 |
| --- | --- | --- |
| Classic | `noir` | `#000000`、`#ffffff` |
| Classic | `ink-paper` | `#1a1a2e`、`#f5f5dc` |
| Classic | `terminal` | `#001100`、`#00ff00` |
| Classic | `amber-glow` | `#1a0f00`、`#ffcc00` |
| Classic | `handheld-green` | `#0f380f`、`#306230`、`#8bac0f`、`#9bbc0f` |
| Mood | `golden-hour` | `#1a1205`、`#4a3510`、`#8b6914`、`#d4a017`、`#fff8dc` |
| Mood | `deep-sea` | `#0a1628`、`#1a3a5c`、`#2d6187`、`#5ba4c9`、`#a8dce8` |
| Mood | `arctic-night` | `#0a0a14`、`#1a2a4a`、`#3a5a8a`、`#6a9aca`、`#cae8ff` |
| Mood | `synthwave` | `#120458`、`#7b2cbf`、`#e040fb`、`#ff6ec7`、`#fff59d` |
| Mood | `vaporwave` | `#1a0a2e`、`#3d1a5c`、`#ff71ce`、`#01cdfe`、`#fffb96` |
| Mood | `forest` | `#1a2e1a`、`#2d4a2d`、`#4a7c4a`、`#7ab37a`、`#c8e6c8` |
| Mono | `sepia` | `#1a1610`、`#3d3020`、`#6b5a40`、`#a89070`、`#e8dcc8` |
| Mono | `blueprint` | `#001830`、`#003060`、`#0050a0`、`#0080e0`、`#e0f0ff` |
| HyperFrames | `warm-print` | `#17121a`、`#824c50`、`#e09873`、`#f7ddb1` |
| HyperFrames | `electric-ink` | `#080717`、`#3c185f`、`#7e2278`、`#d9339f`、`#ff6b66`、`#aafae0` |

要根据检查过的源素材和项目的视觉语言来选，而不是只看色板名字。例如，`terminal` 适合设备/代码语言，`warm-print` 适合编辑风格印刷，而 `synthwave` 是一种有意的风格化，不是通用的润色。

`palette` 必须按编写顺序包含二到六个确切的 `#RRGGBB` 颜色。这个处理方案要用从暗到亮的顺序；运行时会校验颜色，但不会重新排序，所以把数组倒过来就是有意反转映射。`dither` 保持在 `0.7` 到 `1` 之间，`ditherSize` 保持在 `0.1` 到 `0.5` 之间。有限时长的揭示可以内联写入 `--hf-color-grading-dither: 0`，再用 GSAP 把它 tween 到选定的数值。在输出分辨率下评判动态结果；否决闪烁、丢失的主体结构、意外出现的浑浊中间色，或不顾项目设计语言而选的色板。

## Cached Error Diffusion

要做有意为之的 1-bit Macintosh、报纸/印刷、有限色板游戏或粗粝的编辑风格处理方案时，使用精确的误差扩散。它会烘焙出一张新图片或一个新 MP4，因为每个被处理的块都依赖于先前块的误差；它不是一个实时 shader 设置。

按想要的视觉效果选择算法：

- `floyd-steinberg`：均衡的默认选择，带有自然的细腻纹理。
- `atkinson`：对比度更高，更通透，带有鲜明的早期 Macintosh 风格。
- `jarvis-judice-ninke`：渐变更平滑，使用更宽的 12 邻域。
- `stucki`：JJN 的平滑、稍锐利一些的替代方案。
- `burkes`：紧凑的两行纹理。
- `sierra`、`sierra-lite`、`two-row-sierra`：速度/纹理的权衡依次不同；只在对比过帧之后才用。

运行精确的处理器，并通过现有的媒体台账/缓存登记它的输出：

```bash
node <SKILL_DIR>/scripts/dither.mjs \
  --input .media/videos/video_001.mp4 \
  --out .media/generated/video_001.atkinson.mp4 \
  --algorithm atkinson \
  --palette '#17121a,#824c50,#e09873,#f7ddb1' \
  --point-size 3

npx hyperframes media-use resolve \
  --from .media/generated/video_001.atkinson.mp4 --type video --project .
```

在一个真实的 `<img>` 或 `<video>` 上使用登记后的输出路径。把文字、字幕、logo 和界面图形放在处理后的媒体之外。要做有限时长的揭示，就把原始媒体和处理后的媒体以完全相同的构图叠放，用已注册的暂停态 GSAP timeline 做交叉淡化或擦除（wipe）。不要把实时的 Bayer shader 标成 Floyd-Steinberg/Atkinson，也不要在没有明确的 SDR 色调映射决定的情况下处理 PQ/HLG 素材画面。

## Organic Light Leak

用于一个有动机的回忆段落、时间跳转、温暖的场景交接或有触感的转场。它是有限时长、确定性的 CSS/GSAP overlay，不是循环纹理、通用闪白或胶片型号模拟。

安装这个 Registry overlay block：

```bash
npx hyperframes add organic-light-leak-overlay --no-clipboard
```

把打印出的 `data-composition-src` 宿主插入到目标段落处，并保持其时长有限。它的暂停态 timeline 负责一次升起、峰值和完全恢复，并把这几个阶段按放置的时长缩放。分别在漏光之前、最亮的那一帧和恢复之后检查源素材。否决被削掉的人脸、没有动机的暖色泛光、因混合模式错误而露出的黑色，或遮挡主体的时间超过转场所需的漏光。

## Freeze-Frame Cutout

用于社交媒体式的人物介绍、讲者强调、章节标点、体育或创作者段落，或剪贴簿/编辑风格的定格。这需要一个真正的 alpha 遮罩（matte）；装饰不能用来掩盖糟糕的主体边缘。

先提取确切的、确定性的源帧，然后移除它的背景：

```bash
ffmpeg -ss <seconds> -i <source-video> -frames:v 1 -y .media/generated/freeze-source.png
npx hyperframes remove-background .media/generated/freeze-source.png \
  -o .media/generated/freeze-cutout.png --json
npx hyperframes add freeze-frame-dressing --no-clipboard
```

把透明的结果作为直接挂在根上的定时媒体层加入，并把打印出的 overlay block 插到同一时间范围之上。该 block 负责纸张、胶带和闪白；宿主 timeline 只动画真实的 cutout：

```html
<img
  id="hf-freeze-cutout"
  class="clip"
  src="./.media/generated/freeze-cutout.png"
  alt=""
  data-start="6"
  data-duration="3"
  data-track-index="20"
/>
```

```js
tl.fromTo(
  "#hf-freeze-cutout",
  { y: 42, scale: 0.86, rotation: -2 },
  { y: 0, scale: 1, rotation: 0.4, duration: 0.5, ease: "back.out(1.35)" },
  freezeAt,
);
```

在给它加样式之前，先把遮罩分别放在浅色和深色的临时底板上检查。否决缺失的头发/手指、背景光晕、改变了人物身份的 cutout、过粗的描边、露出的画面边缘，或遮住揭示的闪白。如果遮罩不可接受，就换一帧，或保留原始媒体。

## Social Flash / Editorial Reveal

把这个处理方案用于一个有意义的高能量切、创作者揭示、产品段落或前后对比交接。它不是每个场景的默认转场。对于平静的长篇素材画面、对无障碍敏感的场合、高光已经削波的素材、在切换过程中必须保持可读的字面意义 UI，或任何要求反复频闪的请求，都避免使用它。

先检查切点两侧有代表性的帧。用上文相应的约定为每个媒体层按其自身主体调色；闪白不能替代校正。对于人物，一个克制的 `skin-soft` payload 是安全的起点。对于字面意义的 UI，保留像素，并且只在人为编排的光效/运动层不遮挡必要信息时才使用它们。

安装这个 Registry overlay block：

```bash
npx hyperframes add editorial-flash-overlay --no-clipboard
```

插入打印出的 `data-composition-src` 宿主，让该 block 的中点落在切点上。它自己的暂停态 timeline 驱动这次有限时长的闪白。宿主 timeline 可以协调出场和入场媒体的运动，而无需伸手进 block 内部：

```js
tl.to(
  "#outgoing-media",
  {
    scale: 1.035,
    "--hf-color-grading-exposure": 0.82,
    duration: 0.12,
    ease: "power3.in",
  },
  cutAt - 0.16,
);
tl.fromTo(
  "#incoming-media",
  { scale: 1.1 },
  { scale: 1, duration: 0.42, ease: "power3.out" },
  cutAt,
);
tl.to(
  "#incoming-media",
  {
    "--hf-color-grading-exposure": 0,
    "--hf-color-grading-intensity": 0.58,
    duration: 0.24,
    ease: "power2.out",
  },
  cutAt,
);
```

使用 shader 步骤时，在入场媒体上内联写入 `--hf-color-grading-exposure: 0.72` 和 `--hf-color-grading-intensity: 0`，这样全新的 seek 才有正确的起始状态。把最终强度设为经过源素材确认的取值，而不是盲目照抄 `0.58`。当入场的源素材应保持不调色时，跳过 shader 强度这一步。

升起时长保持在大约 `0.035` 到 `0.055` 秒之间，恢复时长保持在 `0.24` 到 `0.38` 秒之间。默认使用一次中性/暖色的闪白事件，绝不用饱和的红色，绝不用循环频闪，并且在一秒的处理方案窗口内绝不超过一次人为编排的闪白。验证切点紧前、切点处和切点之后的帧，然后检查动态播放和一次渲染出的草稿。峰值必须遮住切点；恢复必须露出构图正确的源素材，不能残留之前的画布、被削掉的人脸或意外的高光损伤。
