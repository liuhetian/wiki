---
copy_source: true
---

<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/example/README.md -->
# MECHANICAL LEPIDOPTERA：完整范例

1410 帧，30 fps 下 47.0 秒，1080x1080。一只发条蝴蝶在一张蓝图纸上被画出来，活过来，然后把它的蓝图留在草丛里。每一个像素、每一个音频采样都是代码画出来的。没有图片，没有字体，没有采样素材。

[butterfly-film-spec.md](butterfly-film-spec.md) 是它据以制作的规格书：故事、分镜表、cue 网格、写实一节、音乐。先读它；好的规格书就该是这个样子。

## 研究它。不要照抄它。

它放在这里是作为手艺的证明，不是作为模板。照抄它，你得到的是署上你的标题的别人的影片，而[入口页](../index.md)里的手艺及格线，没有一条能靠继承来满足。

值得打开看的文件，以及原因：

| 文件 | 展示了什么 |
|---|---|
| `src/canvas-core/mechanicalLepidoptera.ts` | 一整部影片写成数据：元信息、首尾相接铺满 `[0, duration)` 的镜头、挂在上面的配乐 |
| `src/canvas-core/butterfly/act1cues.ts` | **一张** cue 表装下所有帧号，带一个在加载时运行的检查器 |
| `src/canvas-core/butterfly/alive/anatomy.ts` | 写成代码的写实：一个闭合的中室（discal cell）、只分叉从不交叉的翅脉、扇贝形的翅缘，以及一段文件头，写明实际打开看过的四张参考图 |
| `src/canvas-core/butterfly/alive/lateral.ts` | 第二个**手绘**视角。合拢的翅膀是同一只翅膀竖了起来，而不是一只折起来的翅膀 |
| `src/canvas-core/butterfly/surface.ts` | 一个写明了像素所依赖的一切的缓存键 |
| `src/canvas-core/butterfly/plate.ts` | `live()` 与 `still()`：两套工具，这样以某个抖动值画出来的绘图表面，就不可能拿到一个漏掉这个抖动值的键 |
| `src/canvas-core/butterfly/alive/score.ts` | 写成算术的音乐配方，每个起音都断言落在帧网格上 |
| `src/canvas-core/butterfly/kit.ts` | 制图员的笔触：一支永远画不完全笔直的鸭嘴笔 |

## 运行它

这个范例本身不是一个独立项目：它的模块会 import `../core`，而 `../core` 在引擎里。把两者放到一起：

```bash
node <skill>/engine/tools/scaffold.mjs ~/study --example
cd ~/study && npm install
node tools/still.mjs mechanicalLepidoptera --out out/look.png
node tools/gate.mjs mechanicalLepidoptera --mp4 out/mechanical-lepidoptera.mp4
node tools/emit.mjs mechanicalLepidoptera --out out/mechanical-lepidoptera.html
```

冷场检查需要一个渲染好的 MP4 来测量；没有的话，它会报告这一点，另外两条及格线照常检查。`node tools/render.mjs mechanicalLepidoptera` 负责生成这个 MP4（要花一阵子：1410 帧）。

## 关于第一幕的一条坦白说明

第一幕（第 0-540 帧）在原片里已经**锁定**，而它在开头没过冷场这条线：里面有 49 帧完全相同的连续帧，全都在这一幕之内。闸门把它们单独报告出来，而不是把它们洗白。这才是该照学的做法：为了保住绿灯而隐瞒已知失败的闸门，一文不值。
