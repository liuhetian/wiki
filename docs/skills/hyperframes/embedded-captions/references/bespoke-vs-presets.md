<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/bespoke-vs-presets.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 定制设计 vs. preset —— 何时覆盖，何时克隆

5 种 preset 样式（`intro / phrase / emph / dream / crown`）和 3 个模板（`wall-embed`、`corner-column-crown`、`portrait-header`）是**脚手架**，不是规则。我们交付过的最好的渲染，全都针对特定分组覆盖了 preset，因为**字体排印是按场景做的决定**，不是一条通用规则。

如果你只用 preset，渲染出来会很平庸。如果你只抄现有的渲染，你的 skill 就无法适应变化。正确的工作流是：

1. **先决定形状**（模板选择、plane 位置、混合模式）。
2. **检查有没有足够接近的标准范例** → 克隆，然后调整词和时间点。
3. **否则从 preset 起步** → 通过 `custom_css` 按分组覆盖。

---

## 标准范例渲染

两个已验证渲染的完整 HTML 在 `references/example-renders/` 里：

| 文件               | 场景                                                   | 它为什么有效                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `memory-wall.html` | 内省式独白，右侧吸音棉墙，中间调 | 右对齐瀑布式排列，每个分组定制字号（`cap-1` 78 斜体 / `cap-2` 66 斜体 + 右侧悬挂缩进 / `cap-3` 72 正体 / `cap-4` 90 全大写）。针对偏暗的吸音棉使用 `mix-blend-mode: screen`。 |
| `champion.html`    | 播客访谈，杂乱的书架，1920×1080       | 左上角一栏 + 画面中央的 crown。调整过的 preset 类字号（`cap-intro` 52 / `cap-phrase` 60 / `cap-emph` 70 / `cap-crown` 140）。`screen` 混合让书架透过文字显现出来。                      |

**当新场景和其中之一非常接近时**（相似的构图、相似的主体中心、相似的背景类型）：克隆这个 HTML，只替换 GROUPS 数组 + 词的时间点。不要从 preset 重新推导设计 —— 你会丢掉那些经过多轮迭代才验证下来的具体选择。

---

## preset 什么时候是错的

当场景真正需要的是下面这些时，你却会去伸手拿 `"style": "emph"` 这样的 preset：

### "这条字幕在第 N 个位置，值得单独处理"

`memory-wall.html` 用的是 `cap-1 / cap-2 / cap-3 / cap-4` —— **按位置编号**，而不是按角色编号。每一个都是为叙事弧线上某个特定位置的某个特定短语定制的设计：

- cap-1（轻柔的开场，4 个词）：78px 斜体 600 —— 感觉像耳语
- cap-2（梦幻的修饰语，3 个词）：66px 斜体 500 + `padding-right: 44px` —— 悬挂缩进造成参差不齐的右边缘错落
- cap-3（转折，2 个词）：72px 正体 700 —— 句法上的支点，不用斜体
- cap-4（高潮，4 个词）：90px 全大写 900 —— 三行右对齐瀑布式排列

`phrase/emph/intro` 没法表达"这条字幕有悬挂缩进"或"这条字幕是句法支点"。当这些很重要时，就自己发明类名：

```json
{
  "template": "wall-embed",
  "custom_css": "
    .cap-1 { font-size: 78px; font-weight: 600; font-style: italic;
             letter-spacing: -0.01em; }
    .cap-2 { font-size: 66px; font-weight: 500; font-style: italic;
             padding-right: 44px; }
    .cap-3 { font-size: 72px; font-weight: 700; letter-spacing: -0.015em; }
    .cap-4 { font-size: 90px; font-weight: 900; letter-spacing: -0.03em;
             text-transform: uppercase; line-height: 1.0; }
  ",
  "groups": [
    { "id": "cg-0", "style": "1", "words": [...] },
    { "id": "cg-1", "style": "2", "words": [...] },
    ...
  ]
}
```

`"style": "1"` 字段会变成元素上的 `class="cap-1"` —— 任何字符串都行，没有校验。

### "模板的混合方式不适合这个背景" → 换一个模板，**不要**覆盖

**Cinematic 模式不覆盖颜色或混合方式。** 模板的 `mix-blend-mode` + 填充色是**锁定的 DNA** —— `make-composition.cjs` 会忽略 `plan.cap_color` / `blend_mode` / `text_shadow` / `text_filter`。选定一个模板就等于认定了它的外观；agent 能自己编写的只有布局（plane / 位置）和按分组的字体排印。

所以要用字幕区域的亮度去**挑选**一个本来就合适的模板 —— 绝不用它去给模板重新上色：

| 区域亮度                  | 什么合适                                                                                     | 原因                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| < 60（暗 / 低调）             | 一个奶油色 + `screen` 模板（`cinematic-cream`、`memory-wall`、`champion`、`portrait-header`） | 浅色文字会发光，融入场景                                       |
| 60–180（中间调）                 | 奶油色 + `screen` 模板依然可读（如果勉强，就通过 Standard 加一层衬底）                | 文字会带上纹理                                                      |
| > 180（明亮：窗户、浅色墙面） | **奶油色 / `screen` 的 Cinematic 模板一个都不行 —— 会被冲淡**                            | → 改用 **Standard 模式**（不透明 rail，按所选模板设置） |

如果场景很亮，奶油色 / `screen` 的外观被冲淡了，这就是该切换到 **Standard 模式**（它会在 HTML 里设置不透明颜色）的信号，而不是把一个 Cinematic 模板重新上色成它本来不是的样子。

### "悬挂缩进 / 凸排 / 字宽微调"

这些是你偶尔会用到的按分组的调节手段。通过 `custom_css` 表达：

```css
#cg-2 {
  padding-right: 44px;
} /* right-aligned: shrinks right edge, creating left outdent */
#cg-2 {
  padding-left: 44px;
} /* left-aligned: offset right start */
.cap-emph .w:first-child {
  font-size: 110%;
} /* oversize first word only */
```

`#cg-N` 选择器永远有效，因为 `make-composition.cjs` 会为每个分组写出 `<div id="cg-N" ...>`。

### "字幕应该累积（flex 堆叠）而不是替换"

三个模板默认都在各自 plane 里给 `.cap` 设 `position: absolute` —— 字幕叠在同一个位置，只显示当前那条（单条字幕替换）。这对 `portrait-header` 和 `corner-column-crown` 是对的，它们每条字幕都替换上一条。

`memory-wall` 用的是 **flex 列累积** —— 字幕像诗一样一行行堆起来。模板默认不是这样，所以要通过 custom_css 覆盖：

```css
.wall-plane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end; /* or flex-start for left-aligned */
  text-align: right;
  gap: 14px;
}
.wall-plane .cap {
  position: static; /* un-do template's absolute */
  top: auto;
  right: auto;
  max-width: 100%;
}
```

用这个 + 错开的 `in` / `out` 时间，cap-0 在 t=0.2 淡入，cap-1 在 t=2.55 淡入（按 flex 顺序排在 cap-0 下方），cap-2 在 t=4.90 淡入（在前两条于 t=4.85 一起淡出后取代它们）—— memory-wall 的诗页就是这样运作的。

### "字号和场景不匹配"

模板 preset 字号是针对特定栏宽 + 画面尺寸调的。不要和它们较劲 —— 直接覆盖：

```json
"custom_css": ".cap-intro { font-size: 52px; } .cap-phrase { font-size: 60px; }"
```

然后查看 [typography-presets.md § Font-size scales with column width](typography-presets.md)，根据你的 plane 的实际尺寸确定目标值。

---

## 克隆再微调的工作流（The clone-and-tweak workflow）

对于一个明显和现有标准范例相似的新视频：

```bash
# 1. Scaffold the project
hyperframes init <project> --non-interactive --video <video.mp4> --skill=embedded-captions

# 2. Matte + transcribe
node scripts/matte.cjs <project>
node scripts/transcribe.cjs <project>

# 3. Copy the canonical HTML instead of writing plan.json
cp references/example-renders/memory-wall.html <project>/index.html

# 4. Replace GROUPS array with the new transcript's grouping (hand-edit index.html)

# 5. Render directly (skip make-composition.cjs since we're not using plan.json)
bash scripts/render-and-composite.sh <project>
```

这样就完全跳过了基于 preset 的 plan.json。适用于：

- 主体构图、镜头构成和背景类型与范例相似
- 你只需要替换词和时间点
- 范例里的定制字体排印正是你想要的

**以下情况不要克隆**：

- 主体位置差别很大（例如居中 vs 偏离中心）
- 场景亮度 / 混合模式的需求不同
- 你想尝试新的字体排印

这些情况下，从 plan.json + custom_css 起步，再迭代。

---

## 渲染历史

`render-and-composite.sh` 现在会在每次渲染前把 `index.html` + `plan.json` 带时间戳快照到 `<project>/history/`。如果用户说"上一个更好"，就和最新的快照做 diff：

```bash
ls <project>/history/
diff <project>/history/index-20260422-203947.html <project>/index.html
```

这样你就能找回一个迭代中被改掉的设计，而不必重读 agent 的对话记录。
