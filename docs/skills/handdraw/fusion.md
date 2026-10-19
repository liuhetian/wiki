---
description: "手绘风格出图·风格融合：角色用一种画风、场景用另一种画风（或写实），微缩比例同框共存，共享同一套光影和物理接触；可加版式、主题色、画幅，情绪从 15 种预设里选"
---

# 风格融合

一张图里同时存在两套视觉语言：角色照一种画风画，场景照另一种画风（或写实）画。两边都要鲜明，不能被磨成一种普通的混合风格；但又得像生活在同一个世界里 —— 同一个光源、同一套接触和投影，不是把角色贴纸贴在背景上。

用户这样说就是在用它：

```text
【风格融合设计】，角色风格：FA-040，场景风格：写实，主题色：C-01，画幅比例：3:4，情绪：治愈，主题：山中的妖精
【风格融合设计】，角色风格：FA-040，场景风格：写实，其他你帮我选择，主题：山中的妖精
```

## 守住的几条 { #principles }

- **两套语言各自保真**：角色部分照角色画风的造型、线条、材质和媒介感，场景部分照场景画风的透视、光影、肌理和环境感，不互相同化
- **微缩比例**：一定写「缩微摄影，角色尺寸异常小，场景保持正常尺寸」，放在 prompt 靠前的位置 —— 角色像微型实体活在正常尺度的世界里，媒介反差最强
- **物理统一**：两边共享光源方位、色温、天气、环境反射和空气透视；角色和场景之间有可信的接触、站立重心、受力、遮挡和投影
- **叙事瞬间清楚**：围绕主题形成一个明确的瞬间，先保证「谁、在哪、在干什么」看得懂；有跑、跳、拉、推、攀爬这类动作，重心和发力方向要合常理
- **主题照抄**：用户给的主题原样用，比如「末世异能者」就写「末世异能者」，不扩写剧情、外貌和背景故事

## 两种风格怎么写 { #styles }

- **给的是风格名称**（「写实」「电影感实拍摄影」「水墨工笔」「复古美漫」……）：原样照写，用户写「写实」就只写「写实」，不补环境、光影、镜头
- **给的是编号**（或者是你推荐的编号）：完整展开成「{风格名}。参考作者/风格名称：{参考作者}。核心风格特征：{正面特征}。」，英文是 `{风格名}. Reference author/style: {参考作者}. Core style traits: {正面特征}.`。融合要靠特征把两套语言区分开，所以**不管 gpt-image-2 认不认名字，都写全特征**；特征按[入口页](index.md#activation)只删负面子句，其余逐字照抄，不压缩、不概括
- **只给了主题**：推荐一组反差最大、最有张力的「角色画风 × 场景画风」（可以是库里的画风，也可以是写实），从下面 15 种情绪里挑最贴的一种，配一种主题色，附一句理由，然后直接出 prompt
- **只给了一边**：保留给的那边，按主题推荐另一边 —— 只给角色就配反差最强的场景，只给场景就配最契合的角色

## 情绪 { #mood }

用户没指定情绪，就只从这 15 种里选，不自己造「压抑、肃杀、孤注一掷的狂暴史诗感」这种长句：

治愈（Healing）、童趣（Childlike）、松弛（Relaxed）、幽默（Humorous）、诗意（Poetic）、浪漫（Romantic）、活力（Vibrant）、微丧（Melancholy）、孤寂（Solitary）、紧张（Tense）、庄严（Solemn）、荒诞（Absurd）、恐怖（Eerie）、神秘（Mysterious）、激烈（Intense）

## prompt 模板 { #prompt }

可选的版式、主题色、画幅三行，没有就删掉那一行；画幅默认 3:4。从「缩微摄影，角色尺寸异常小……」到「主题事件明确可读」这一整段是让模型分开画两种语言的底层约束，**每次一字不差地带上**，不删、不缩、不改。

```text
生成一幅“角色视觉语言 × 场景视觉语言”共存的跨媒介融合画面。缩微摄影，角色尺寸异常小，场景保持正常尺寸。
- 【角色视觉语言】：{风格名称原样，或编号展开的画风片段}
- 【场景视觉语言】：{风格名称原样，比如：写实；或编号展开的画风片段}
- 【主题】：{用户的主题，原样}
- 【情绪】：{15 种预设之一，用户指定的除外}
- 【图型】：{版式名称和版式 prompt}
- 【主题色】：{中文色名}（{英文色名}）
- 【画幅比例】：{默认 3:4}

缩微摄影，角色尺寸异常小，场景保持正常尺寸。
画面中必须同时存在两套清晰可辨的视觉语言。
不要把两者平均磨成普通的混合风格插画。
角色部分使用【角色视觉语言】表现，场景部分使用【场景视觉语言】表现。这里的“场景”包括环境空间、地形、建筑、植物、天空、水面、天气、地面、道具以及整体空间氛围。
【角色视觉语言】与【场景视觉语言】都必须忠实保留各自的核心特征，包括但不限于：造型逻辑、比例系统、线条方式、笔触特征、体块组织、几何倾向、材质表达、表面肌理、色彩体系、明暗方式、细节密度、空间处理方式、平面化或立体化程度以及各自独有的媒介感。不要额外强行加入与原风格无关的统一化修饰。
两种视觉语言必须保持明显差异，但共享同一个空间、光源、色温、天气、空气、构图和叙事时刻。
视觉统一应通过遮挡关系、接触关系、投影关系、地面关系、前后空间关系、局部反光、环境综合色和空气透视来完成，而不是把两种视觉语言磨成同一种质感。
角色必须真正存在于场景中，与场景形成自然互动，不能像贴纸一样浮在画面上。角色与场景之间需要有清楚可信的接触、站立、受光、投影、遮挡和空间关系。重点不是“一个角色站在另一个风格的背景前”，而是让角色真正进入并生活在这个场景世界中。
画面必须围绕【主题】形成一个明确的叙事瞬间，优先保证“谁、在哪里、正在做什么”清楚可读。不要为了展示风格而加入大量与主题无关的装饰元素。
如果画面中存在明显动作，如跑、跳、扑、拉、推、攀爬、追逐、搏斗、搬运或其他动态行为，需要保证发力点、重心、支撑关系、接触位置、受力方向、物体运动方向、遮挡和透视合理，动作逻辑优先于单纯夸张效果。
不要生硬拼贴，不要左右分栏，不要上下分区，不要贴纸叠加，不要主体悬浮，不要错误遮挡，不要不同光源互相冲突，不要让角色风格被完全同化成场景风格，也不要让场景风格被完全同化成角色风格。
最终效果应呈现：
- 缩微摄影比例，角色尺寸微小而场景保持正常尺寸
- 两种不同视觉语言自然存在于同一个世界中
- 角色风格与场景风格差异清晰
- 空间与光线逻辑统一
- 角色与场景互动自然
- 主题事件明确可读
```

```text
Generate a cross-media fusion artwork where "Character Visual Language × Scene Visual Language" coexist. Miniature photography, the character scale is exceptionally small, while the scene maintains normal scale.
- [Character Visual Language]: {style name as given, or the expanded style fragment}
- [Scene Visual Language]: {style name as given, e.g. Realistic photography; or the expanded style fragment}
- [Theme]: {user's theme, as given}
- [Mood]: {one of the 15 presets unless the user specified one}
- [Layout]: {layout name and layout prompt}
- [Theme Color]: {English color name}
- [Aspect Ratio]: {default 3:4}

Miniature photography, the character scale is exceptionally small, while the scene maintains normal scale.
Two clearly distinguishable visual languages must coexist in the image simultaneously.
Do NOT average or blend the two into a generic hybrid illustration.
The character elements must be rendered strictly in [Character Visual Language], while the scene elements must be rendered strictly in [Scene Visual Language]. Here, "scene" includes environmental space, terrain, architecture, vegetation, sky, water, weather, ground, props, and overall spatial ambiance.
Both [Character Visual Language] and [Scene Visual Language] must faithfully retain their respective core characteristics, including but not limited to: modeling logic, proportional systems, linework methods, brushstroke traits, volume organization, geometric tendencies, material expressions, surface textures, color systems, shading/lighting techniques, detail density, spatial treatment, degree of flatness vs. three-dimensionality, and their distinct tactile media sensations. Do NOT artificially force any uniform stylistic modifications irrelevant to each original style.
The two visual languages must maintain noticeable contrast, yet share the exact same space, light source, color temperature, weather, atmosphere, composition, and narrative moment.
Visual unity must be achieved through occlusions, physical contact, contact shadows, ground contact, fore/background depth, subtle bounce light, environmental ambient color, and aerial perspective, rather than blending the two visual languages into an identical material texture.
The character must truly exist and naturally interact within the scene world, rather than floating like a detached sticker. There must be credible physical contact, grounded posture, lighting, cast shadows, occlusions, and depth relationships between the character and the environment. The focus is NOT "a character simply standing in front of a different-styled background", but rather having the character truly inhabit and live within this environment.
The image must center around [Theme] to form a distinct narrative moment, prioritizing clarity of "who, where, and what they are doing". Do NOT introduce clutter or irrelevant decorative elements merely to exhibit the styles.
If dynamic actions are present (e.g., running, jumping, leaping, pulling, pushing, climbing, chasing, wrestling, carrying, or dynamic movements), ensure the center of gravity, support points, contact points, force vectors, motion trajectory, occlusion, and perspective are physically convincing; dynamic logic takes priority over superficial exaggeration.
Do NOT create awkward collages, do NOT split left-right or top-bottom columns, do NOT layer like stickers, do NOT let subjects float, avoid erroneous occlusions and conflicting light sources, do NOT assimilate the character style into the scene style, and do NOT assimilate the scene style into the character style.
The final result should achieve:
- Miniature photography scale contrast: character scale exceptionally small while scene maintains normal scale
- Two distinct visual languages coexisting harmoniously in the same world
- Clear differentiation between character style and scene style
- Unified spatial, perspective, and lighting logic
- Natural, believable physical interaction between character and scene
- Clear, legible thematic narrative event
```

给完 prompt，告诉用户可以复制去自己的生图工具，也可以回「全自动出图」直接画，出图照[入口页](index.md)用 agent-io。
