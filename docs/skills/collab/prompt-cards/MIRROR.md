---
description: "prompt-cards.cyanfish.site 内置卡组的来源与抓取说明：站点没有公开仓库，版本只能钉 JS 包的文件名、哈希和抓取日期；17 张对话类卡照录进 reference/，10 张生图卡按分类放进 Gallery"
---

# prompt-cards 来源与抓取说明

本页记录 [prompt-cards.cyanfish.site](https://prompt-cards.cyanfish.site/) 整套内置卡组（27 张）的来源。17 张对话类卡照录在本目录：自己写的入口和分析在 [`index.md`](index.md)，卡的原文在 `reference/` 的三页里。10 张生图卡按分类放进了 [Gallery](../../../gallery/index.md)，见下文。

## 版本跟踪

站点没有公开仓库，钉不了 commit，只能用构建产物的指纹当版本号：

| 项 | 值 |
|---|---|
| 站点 | <https://prompt-cards.cyanfish.site/>（「神级 AI 提示词卡牌图鉴」，未署名作者） |
| 许可证 | 站内未声明 |
| 数据所在文件 | `assets/index-IivKxZ0S.js`（Vite 构建，文件名里的 `IivKxZ0S` 是内容哈希） |
| 该文件 `last-modified` | 2026-08-22 12:46:15 GMT |
| 该文件 sha256 | `84f6f63f7b027ac9eda3e72701d775ce499d9605ea2504a18287978b7dc72727` |
| 抓取日期 | 2026-09-28 |
| 本地归档 | [角色卡](reference/persona.md) 4 张、[流程卡](reference/playbook.md) 10 张、[约束卡](reference/guard.md) 3 张；生图卡 10 张见下文「生图卡放在哪」 |

## 抓取方式

站点是纯前端的 React 单页应用，没有后端和数据接口。内置卡组是 JS 包里一个写死的数组字面量（压缩后变量名是 `Tt`），每张卡有 `id / name / domain / type / rarity / summary / prompt / image` 这几个字段。抓取过程是：下载 JS 包，按括号配对截出这个数组，求值后得到 27 张卡；包里 `rarity:` 字面量也正好出现 27 次，没有漏卡。页面上的「添加」和「卡包」功能只读写访问者本机的 IndexedDB，别人添加的卡在服务器上并不存在，所以抓不到，也不属于这份存档。

## 收了什么，没收什么

- **收**：`domain` 为 `chat` 的 17 张，也就是角色（persona）、流程（playbook）、约束（guard）三类。按 `type` 分三页，页内顺序和站点数组里的顺序一致。
- **收进 Gallery**：`domain` 为 `image.*` 的 9 张配方（recipe）和 1 张词素（asset），连同卡图。这些卡图就是 prompt 跑出来的效果图，正好是 Gallery「一张图配一段 prompt」的格式，所以按分类放进对应页面，没有单独打包成一页，详见下文。
- **没收**：对话类卡的卡图。那是站长给卡面生成的插画，对读 prompt 没有帮助。
- **没收**：JS 包本身（287 KB）。版本靠上表的文件名和哈希来对照。

### 生图卡放在哪

图片用站点的 768 宽版本（`/cards/<id>-768.webp`，原图 1536 宽，页面只按 420 宽显示），存在 `docs/gallery/images/prompt-cards/assets/<id>.webp`。条目追加在各分类页原有条目之后：

| 站点卡名 | 站点 id | 放进 | 条目标题 |
|---|---|---|---|
| 配方·甜酷辣妹四视图 | `img-char-sweetcool` | [角色设计](../../../gallery/images/gpt-image2/gallery-character-design.md) | 甜酷辣妹四视图设定 |
| 配方·赛博浪人 | `img-char-cyber` | [角色设计](../../../gallery/images/gpt-image2/gallery-character-design.md) | 赛博朋克浪人：霓虹雨巷 |
| 配方·清冷写真 | `img-portrait-cold` | [摄影](../../../gallery/images/gpt-image2/gallery-photography.md) | 清冷窗边写真 |
| 配方·灰调立姿写真 | `img-portrait-grey-casual` | [摄影](../../../gallery/images/gpt-image2/gallery-photography.md) | 灰调立姿写真 |
| 配方·暖灰针织窗边 | `img-portrait-warmgrey-knit` | [摄影](../../../gallery/images/gpt-image2/gallery-photography.md) | 暖灰针织窗边写真 |
| 词素·伦勃朗光 | `img-light-rembrandt` | [摄影](../../../gallery/images/gpt-image2/gallery-photography.md) | 伦勃朗光（光线词条，拼进人像 prompt 用） |
| 配方·厚涂精灵 | `img-illust-gouache` | [插画](../../../gallery/images/gpt-image2/gallery-illustration.md) | 厚涂森林精灵 |
| 配方·雨夜街景 | `img-scene-neon` | [复古与赛博朋克](../../../gallery/images/gpt-image2/gallery-retro-and-cyberpunk.md) | 霓虹雨巷空镜 |
| 配方·极简海报 | `img-poster-minimal` | [字体与海报](../../../gallery/images/gpt-image2/gallery-typography-and-posters.md) | 瑞士风极简活动海报 |
| 配方·UIED餐饮品牌触点矩阵 | `img-design-uied-fnb-matrix` | [品牌系统与视觉识别](../../../gallery/images/gpt-image2/gallery-brand-systems-and-identity.md) | 餐饮品牌触点矩阵（UIED） |

**译法**：6 张英文卡（赛博浪人、清冷写真、厚涂精灵、极简海报、雨夜街景、伦勃朗光）译成中文，规则跟 [gpt-image2 的译法](../../../gallery/images/gpt-image2/MIRROR.md) 一致：不通行的美术和摄影术语写中文加英文括注，专有名词（如 Kodak Portra）保留原文。这个站没有可以钉 commit 的原文，所以英文原文照录在下面的折叠块里，免得站点更新后找不回来。4 张中文卡照录，一字未改。条目标题是自己起的，站点卡名见上表。

??? note "6 张英文卡的原文"

    **配方·赛博浪人**（`img-char-cyber`）

    ```text
    Cinematic character portrait of a young East Asian cyberpunk rogue, mid-20s, sharp jawline, short messy black hair with one neon-cyan streak, glowing cyan cybernetic left eye, rain-soaked black tactical coat with orange circuitry seams, standing three-quarter view against a rainy neon Tokyo alley, magenta and teal reflections on wet asphalt, shallow depth of field, highly detailed face and fabric, photorealistic sci-fi concept art, no text, no watermark
    ```

    **配方·清冷写真**（`img-portrait-cold`）

    ```text
    Editorial portrait photograph of a young East Asian woman in her early 20s, cool reserved expression, soft natural window light from the left, pale skin, long straight black hair, wearing an oversized ivory knit sweater, seated by a large window with muted winter city bokeh outside, airy negative space, Kodak Portra-like tones desaturated cool, 85mm lens look, shallow depth of field, clean minimal composition, no text, no watermark
    ```

    **配方·厚涂精灵**（`img-illust-gouache`）

    ```text
    Fantasy character illustration of a forest spirit girl with pointed ears, flowing green-gold hair, translucent leaf cloak, holding a small glowing orb, standing in a mossy ancient forest clearing at golden hour, rich gouache and oil-painting brushstrokes, visible textured paint, warm rim light, storybook fantasy art, highly detailed, no text, no watermark, no photo realism
    ```

    **配方·极简海报**（`img-poster-minimal`）

    ```text
    Minimalist event poster design layout, large cream negative space, bold geometric coral circle overlapping a thin black horizontal line, single small abstract bird silhouette in matte black, Swiss modern graphic design, clean vector shapes, balanced asymmetry, print-ready flat color, no photographs, no readable text letters, no logos, no watermark
    ```

    **配方·雨夜街景**（`img-scene-neon`）

    ```text
    Wide establishing shot of a rainy neon-lit alley at night, dense vertical signage in abstract glowing shapes (no readable letters), wet reflective pavement, steam rising from street vents, deep magenta and electric teal lighting, cinematic atmosphere, ultra-detailed environment concept art, empty of people, moody cyberpunk city, no text, no watermark
    ```

    **词素·伦勃朗光**（`img-light-rembrandt`）

    ```text
    Rembrandt lighting setup, single warm key light at 45 degrees above and to the side, soft triangle of light on the shadowed cheek, deep soft shadows, dramatic chiaroscuro, studio portrait lighting reference, no subject description, lighting study only, no text, no watermark
    ```

**改动声明**（对话类）：`prompt` 字段一字未改，生成页面后已逐张比对原文。卡名、稀有度、`summary` 是站点字段，照抄。每张卡的锚点用站点的 `id`（如 `#flow-socratic`）。页面标题、段首说明和 frontmatter 是自己加的。

## 未来漂移处置

站点更新后，入口 HTML 引用的 JS 文件名会变：

1. `curl` 首页，看 `<script src>` 里的文件名是否还是 `index-IivKxZ0S.js`；不变就说明没更新
2. 变了就下载新包，同样截出卡组数组，和本目录三页逐张 diff
3. 新增或改动的对话类卡同步进对应的 `reference/` 页面；生图卡按上面的译法放进 Gallery 对应分类页，同时更新「生图卡放在哪」那张表；最后更新版本表的文件名、哈希和日期
4. [`index.md`](index.md) 里的选卡表和分析按需更新
