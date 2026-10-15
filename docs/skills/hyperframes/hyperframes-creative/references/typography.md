<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/typography.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 字体排印

编译器**预先打包了一组固定的**字体（见下表）—— 在 `font-family` 里写其中任意一个字体族，它就会确定性地、离线地渲染，无需任何设置，也没有警告。这组字体*之外*的名字**不会被悄悄丢掉**：如果它是一个真实的 Google 字体，编译器会在**构建时**从 Google Fonts 拉取并嵌入，所以它*确实*能渲染 —— 但这条隐式路径（a）会触发一条 `font_family_without_font_face` lint 警告，并且（b）**在分布式 / 云端渲染中是失败即关闭的（fail-closed）**—— 如果连不上 Google，渲染会*报错*，而不是悄悄换成系统字体。除此之外，**本地渲染会自动抓取你实际拥有的字体**：安装在你机器上的字体族、本地的 `@font-face` 路径、外部 CDN 样式表，都会在构建时压缩成 woff2 并内联。所以一个**既不在**打包集合里、**也不在** Google Fonts 上的名字，只有当它*同时*没有在本地安装、也没有在 `@font-face` 里声明时，才会真正回退到通用的系统字体 —— 即便如此也会记录一条编译器警告。**一个注意事项**：分布式 / 云端（Lambda）渲染会禁用系统字体抓取，所以在这些场景下不要依赖只在本地安装的字体。因此不要想当然地认为一个没打包的 display 字体名就能「直接好用」：任何必须可预期地渲染的东西，要么从下面挑一个打包好的字体族，**要么自己用 `@font-face` 嵌入**（见「寻找字体」）。

## 目录

- 会被嵌入的字体（自动解析）
- 禁用字体
- 护栏
- 没人提醒时你不会做的事
- 寻找字体
- 选择思路
- 相似字体搭配
- 深色背景
- 用于数据的 OpenType 特性

## 会被嵌入的字体（自动解析）

这 **18 个字体族**是渲染器**预先打包**的 —— 以本地 data URI 嵌入，无需网络拉取，所以它们能离线、确定性地渲染，零设置、无 lint 警告、也没有失败即关闭的拉取风险。把其中任意一个写成 `font-family` 它就能渲染；**只有列出的字重是存在的**（请求一个字体族没有提供的字重，得到的是合成 / 回退字重，而不是真正的字形）。（任何*其他*真实的 Google 字体仍然可以通过开头描述的构建时隐式拉取来使用 —— 但只有这些字体能免于上述所有注意事项。）

| 字体族            | 字重         | 角色              |
| ----------------- | --------------- | ----------------- |
| Inter             | 400 · 700 · 900 | 无衬线（正文 / UI）    |
| Roboto            | 400 · 700 · 900 | 无衬线              |
| Open Sans         | 400 · 700       | 无衬线              |
| Lato              | 400 · 700 · 900 | 无衬线              |
| Nunito            | 400 · 700 · 900 | 无衬线（圆体）    |
| Montserrat        | 400 · 700 · 900 | 几何无衬线    |
| Poppins           | 400 · 700 · 900 | 几何无衬线    |
| Outfit            | 400 · 700 · 900 | 几何无衬线    |
| Oswald            | 400 · 700       | 窄体无衬线    |
| **League Gothic** | **仅 400**    | 窄体 display |
| **Archivo Black** | **仅 400**    | 粗重 display     |
| Playfair Display  | 400 · 700 · 900 | 衬线（display）   |
| EB Garamond       | 400 · 700       | 衬线（正文）      |
| Space Mono        | 400 · 700       | mono              |
| IBM Plex Mono     | 400 · 700       | mono              |
| JetBrains Mono    | 400 · 700       | mono              |
| Source Code Pro   | 400 · 700       | mono              |
| Noto Sans JP      | 400 · 700       | CJK（日文）    |

> ⚠ **League Gothic 和 Archivo Black 只提供字重 400** —— 它们本身就已经是粗重 / 窄体的 display 字体。不要对它们请求 `font-weight: 700/900`。

**别名** —— 这些常见名字会解析到某个已嵌入的字体族，所以你可以放心地写：`Helvetica Neue` / `Helvetica` / `Arial` → Inter · `Futura` / `DIN Alternate` / `Arial Black` → Montserrat · `Bebas Neue` → League Gothic · `Segoe UI` → Roboto · `Courier New` / `Courier` → JetBrains Mono · `Garamond` → EB Garamond。（这就是为什么一个「安全的」`Helvetica Neue` 字体栈总能渲染 —— 它映射到已嵌入的 Inter。）

**与下面的禁用清单对照：** 好几个已嵌入的字体族（Inter、Roboto、Open Sans、Lato、Nunito、Poppins、Outfit、Playfair Display、EB Garamond）*同时*也在禁用的单一化清单上 —— 它们能正常渲染，但读起来很泛。**已嵌入且未被禁用**的字体族 —— 也就是你既安全又有辨识度的选择 —— 是：**Montserrat、Oswald、League Gothic、Archivo Black、Space Mono、IBM Plex Mono、JetBrains Mono、Source Code Pro、Noto Sans JP**。优先选这些（或者一个经「寻找字体」步骤确认过的未打包字体）。未打包的名字不一定就会坏 —— 真实的 Google 字体会被自动拉取并嵌入 —— 但它会带来一条 lint 警告，并且在云端渲染中是失败即关闭的拉取，所以任何必须可预期地渲染的东西，**自己用 `@font-face` 嵌入**（见「寻找字体」），而不是依赖隐式拉取。

## 禁用

每个 LLM 都会伸手去拿的训练数据默认值。它们会让各个 composition 千篇一律。

Inter, Roboto, Open Sans, Noto Sans, Arimo, Lato, Source Sans, PT Sans, Nunito, Poppins, Outfit, Sora, Playfair Display, Cormorant Garamond, Bodoni Moda, EB Garamond, Cinzel, Prata, Syne

**尤其是 Syne**，它是被用得最滥的「有辨识度」display 字体。一眼就能看出是 AI 设计的破绽。

## 护栏

这些规则你都知道，但你照样违反。停下来。

- **不要搭配两种无衬线体。** 你老是这么干 —— 一种用于标题，一种用于正文。要跨越边界：衬线 + 无衬线，或者无衬线 + mono。
- **每个场景一种有表现力的字体。** 你会挑两种有意思的字体，想让它「更好」。一个负责表演，一个退居幕后。
- **字重对比必须极端。** 你习惯 400 对 700。视频需要 300 对 900。差别必须在运动中一眼可见。
- **用视频尺寸，不用网页尺寸。** 全屏观看（YouTube / 网站嵌入）：正文最小 20px，标题 60px 以上，数据标签 16px。**信息流内观看**（投放渠道 = X / LinkedIn / Instagram 信息流 —— `hyperframes/references/brief-contract.md` § 2）：视频在滚动的信息流里以小尺寸播放，所以要放大 —— 正文 ≥32px，标题 ≥90px，数据标签 ≥24px（首轮取值；要对照真实渲染结果校准）。你会试图用 14px。不要。

## 没人提醒时你不会做的事

- **张力应该有含义。** 不要套模式去搭配。问一问这两种字体**为什么**（WHY）相互冲突。搭配应该体现内容本身的矛盾 —— 机械 vs 人性，公共 vs 私人，机构 vs 个人。如果你说不清这个张力，它就是随意的。
- **语域切换。** 给不同的交流模式分配不同的字体 —— 一种声音用于陈述，另一种用于数据，再一种用于署名。不是页面上的层级，而是一场对话里的不同声音。
- **张力可以存在于单一字体之内。** 一种看起来熟悉、却暗藏古怪的字体，制造的是与观众预期之间的张力，而不是与另一种字体之间的张力。
- **只改变一个变量 = 戏剧性的对比。** 同样的字形，等宽 vs 比例宽度。同一字体族的不同光学尺寸。其他一切保持不变，只改变节奏。
- **双重性格行得通。** 两种有表现力的字体，只要态度一致（都不羁，或都精确），即使形态完全不同也能共存。
- **时间就是层级。** 最先出现的元素最重要。在视频里，先后顺序取代了位置。
- **运动就是字体排印。** 一个词怎么进场，承载的含义和字体一样多。0.1s 的砸入 vs 2s 的淡入 —— 同一种字体，完全不同的信息。
- **阅读时间是固定的。** 在屏幕上停留 3 秒 = 必须 2 秒内能读完。更少的字，更大的字号。
- **字距比网页更紧。** display 尺寸用 -0.03em 到 -0.05em。视频编码会压缩字母的细节。

## 寻找字体（Finding Fonts）

不要默认用你熟悉的。如果内容是奢侈品，一种怪诞无衬线体（grotesque sans）可能比意料之中的 Didone 衬线体制造出更多张力。先决定语域，再去搜索。

把这个脚本保存到 `/tmp/fontquery.py`，用 `curl -s 'https://fonts.google.com/metadata/fonts' > /tmp/gfonts.json && python3 /tmp/fontquery.py /tmp/gfonts.json` 运行：

```python
import json, sys, random
from collections import OrderedDict

random.seed()  # true random each run

with open(sys.argv[1]) as f:
    data = json.load(f)
fonts = data.get("familyMetadataList", [])

ban = {"Inter","Roboto","Open Sans","Noto Sans","Lato","Poppins","Source Sans 3",
       "PT Sans","Nunito","Outfit","Sora","Playfair Display","Cormorant Garamond",
       "Bodoni Moda","EB Garamond","Cinzel","Prata","Arimo","Source Sans Pro","Syne"}
skip_pfx = ("Roboto","Noto ","Google Sans","Bpmf","Playwrite","Anek","BIZ ",
            "Nanum","Shippori","Sawarabi","Zen ","Kaisei","Kiwi ","Yuji ","Radio ")

def ok(f):
    if f["family"] in ban: return False
    if any(f["family"].startswith(b) for b in skip_pfx): return False
    if "latin" not in (f.get("subsets") or []): return False
    return True

seen = set()
R = OrderedDict()

# Trending Sans — recent (2022+), popular (<300)
R["Trending Sans"] = []
for f in fonts:
    if not ok(f) or f["family"] in seen: continue
    if f.get("category") in ("Sans Serif","Display") and f.get("dateAdded","") >= "2022-01-01" and f.get("popularity",9999) < 300:
        R["Trending Sans"].append(f); seen.add(f["family"])

# Trending Serif — recent (2018+), popular (<600)
R["Trending Serif"] = []
for f in fonts:
    if not ok(f) or f["family"] in seen: continue
    if f.get("category") == "Serif" and f.get("dateAdded","") >= "2018-01-01" and f.get("popularity",9999) < 600:
        R["Trending Serif"].append(f); seen.add(f["family"])

# Monospace — recent (2018+), popular (<600)
R["Monospace"] = []
for f in fonts:
    if not ok(f) or f["family"] in seen: continue
    if f.get("category") == "Monospace" and f.get("dateAdded","") >= "2018-01-01" and f.get("popularity",9999) < 600:
        R["Monospace"].append(f); seen.add(f["family"])

# Impact & Condensed — heavy display fonts with 800+ weight
R["Impact & Condensed"] = []
for f in fonts:
    if not ok(f) or f["family"] in seen: continue
    has_heavy = any(k in list(f.get("fonts",{}).keys()) for k in ("800","900"))
    is_display = f.get("category") in ("Sans Serif","Display")
    if has_heavy and is_display and f.get("popularity",9999) < 400:
        R["Impact & Condensed"].append(f); seen.add(f["family"])

# Script & Handwriting — popular (<300)
R["Script & Handwriting"] = []
for f in fonts:
    if not ok(f) or f["family"] in seen: continue
    if f.get("category") == "Handwriting" and f.get("popularity",9999) < 300:
        R["Script & Handwriting"].append(f); seen.add(f["family"])


# Randomize the top 5 in each category so the LLM doesn't always pick the same first result
for cat in R:
    R[cat].sort(key=lambda x: x.get("popularity",9999))
    top5 = R[cat][:5]
    rest = R[cat][5:]
    random.shuffle(top5)
    R[cat] = top5 + rest
limits = {"Trending Sans":15,"Trending Serif":12,"Monospace":8,
          "Impact & Condensed":12,"Script & Handwriting":10}
for cat in R:
    items = R[cat][:limits.get(cat,10)]
    if not items: continue
    print(f"--- {cat} ({len(items)}) ---")
    for ff in items:
        var = "VAR" if ff.get("axes") else "   "
        print(f'  {ff.get("popularity"):4d} | {var} | {ff["family"]}')
    print()
```

五个类别：流行无衬线、流行衬线、等宽、冲击 / 窄体、手写 / 书法。全部从 Google Fonts 元数据动态筛选 —— 没有硬编码的字体名。搭配时要跨越分类边界。

## 选择思路

不要凭类别反射去选字体（编辑感 → 衬线，科技 → mono，现代 → 几何无衬线）。那是模式匹配，不是设计。

1. **说出语域。** 内容是用什么声音在说话？机构的权威？个人的告白？技术的精确？随意的不羁？语域比类别更能缩小范围。
2. **从物理层面思考。** 把字体想象成品牌可能出品的一件实物 —— 博物馆展品的说明牌、手绘的店铺招牌、1970 年代大型机终端的手册、外套里的布标、印在廉价新闻纸上的儿童书、一张税表。哪件实物契合这个语域，它指向的就是对的那*类*字体。
3. **否决你的第一直觉。** 第一个感觉对的字体，通常就是你在这个语域下的训练数据默认值。如果你上次也选了它，就换一个。
4. **反向检验假设。** 编辑类 brief **不**一定需要衬线体。技术类 brief **不**一定需要无衬线体。儿童产品**不**一定需要圆体 display 字体。最有辨识度的选择往往与类别预期相悖。

## 相似字体搭配

绝不要搭配两种相似但不相同的字体 —— 两种几何无衬线体、两种过渡型衬线体、两种人文主义无衬线体。它们制造视觉上的摩擦，却没有清晰的层级。观众能感觉到哪里「不对劲」，却说不出来。要么用一种字体的两种字重，要么搭配在多个维度上形成对比的字体：衬线 + 无衬线、窄体 + 宽体、几何 + 人文主义。

## 深色背景

深色背景上的浅色文字会产生两种你需要补偿的视错觉：

- **表观字重增加。** 在相同的 `font-weight` 下，深底浅字读起来比浅底深字更粗。正文用 350 代替 400。标题受的影响较小，因为尺寸本身做了补偿。
- **表观间距变紧。** 字形周围的浅色光晕会减小感知到的间隙。`line-height` 在浅色背景取值的基础上再加 0.05-0.1。display 尺寸再加 0.01em 的 `letter-spacing` 来抵消。

## 用于数据的 OpenType 特性

大多数字体都带有默认关闭的 OpenType 特性。数据类 composition 要把它们打开：

```css
/* Tabular numbers — digits align vertically in columns */
.stat-value,
.timer,
.data-column {
  font-variant-numeric: tabular-nums;
}

/* Diagonal fractions — renders 1/2 as ½ */
.recipe-amount,
.ratio {
  font-variant-numeric: diagonal-fractions;
}

/* Small caps for abbreviations — less visual shouting */
.abbreviation,
.unit {
  font-variant-caps: all-small-caps;
}

/* Disable ligatures in code — fi, fl, ffi should stay separate */
code,
.code {
  font-variant-ligatures: none;
}
```

只要数字是竖向堆叠的 —— 数据标注、计时器、记分牌、数据表 —— `tabular-nums` 就必不可少。没有它，数字是比例宽度的，各列对不齐。
