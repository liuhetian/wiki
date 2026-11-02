---
description: "DeepTutor 的沉浸阅读怎么让回答对得上原文：材料切成带定位号的单元，检索结果自带定位号；模型引用前要先读原文，reader_goto 跳转前核对引文，页码记错就改跳、对不上就照跳不亮；回答里的 [p.12] 变成能点的链接；阅读器的位置和选区自动带进问题；视频字幕切成 20 到 90 秒的段，按起始时刻引用。每一步配源码模版和实跑效果"
---

# 沉浸阅读：带页码的对话，引文先核对再跳

把 PDF 丢进聊天网页，回答里的「见第 12 页」是模型估的，不是它读到的——用户自己去翻，常常对不上；读到一半想问，要把段落复制回对话框，再说明是哪一页；讲解视频更没法问「他第几分钟说的」。DeepTutor 的沉浸阅读把材料切成带定位号的单元，模型先搜、先读原文才能引用；引用写成 `[p.12]`，阅读器跳到那一页、高亮被引的那句，跳之前先核对这句话真在那一页。视频也一样，字幕切成段，每段一个起始时刻。下面每一步给出源码模版和用 DeepTutor 自己的函数跑出的效果；材料是构造的：《应用统计学》第 8 章里有正文的几页，和一段 6 分钟的讲解「什么是 p 值」。

下面是照前端源码做的仿真界面，自动播放：在伴读栏提问，回答吐出页码时阅读器跳到那一页、高亮被引的句子。

<iframe src="/projects/deeptutor/assets/demos/reading.html" style="width:100%;height:680px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真 demo：沉浸式阅读，回答带页码、阅读器跳转高亮"></iframe>

??? abstract "demo 源码：沉浸式阅读"

    ```html
    --8<-- "projects/deeptutor/assets/demos/reading.html"
    ```

## 材料切成带定位号的单元 { #locator }

**问题**：聊天网页里，PDF 是塞进上下文的一团字。模型说「第 12 页」，页码不是它读到的东西，是它猜的。

**功能**：材料导入时切成单元，每个单元一个定位号：PDF 是页，EPUB 是章，幻灯片是张，视频是一段字幕。模型手里有大纲、全文检索、按定位号读原文三件工具，阅读模式的提示词规定了用法——先找，再读原文，读过才能下判断；引用一律写 `[p.N]`，讨论到哪段就调一次 `reader_goto` 把用户的阅读器带过去：

```yaml title="模版 · deeptutor/capabilities/reading/prompts/zh/reading.yaml:14-29"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/reading/prompts/zh/reading.yaml:14:29"
```

**效果**：没有实跑——这一段是写给模型的规矩，这里只贴模版。

不管单元叫页、章还是张，引用都写成 `[p.N]`，只有一种格式要解析；界面上显示成「第 12 页」还是「第 12 章」，由材料自己的单元名决定。

## 检索结果自带定位号 { #search }

**问题**：向量检索返回的是切块，切块和页码对不上，模型想引页码只能估。

**功能**：一份材料最多几百个单元，逐个扫一遍只要几毫秒，所以沉浸阅读不用向量检索，用逐单元的全文匹配，每条命中都带着定位号。匹配分三层，从严到宽：原样匹配；去掉标点、压缩空白后匹配；最后按查询里的词数排序。命中哪层就报哪层，模型分得清原文命中和沾边：

```python title="模版 · deeptutor/reading/search.py:90-123"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/reading/search.py:90:123"
```

**效果**：在构造的几页上查四句，看各自落在哪一层：

```text title="效果 · 三层匹配"
--8<-- "projects/deeptutor/assets/sim/txt/reading-search.txt"
```

半角逗号对全角逗号，第二层去掉标点后接住了。第三条值得中文读者留意：第二层只把空白压成一个空格、不删掉，PDF 原文在逗号后断了行，多出一个空白，手打的引文里没有，这一层就对不上，落到按词排序那层。中文没有词间空格，第三层按两字一组切词，一句问话也能排出最相关的页。

## 跳之前先核对引文 { #goto }

**问题**：模型说「见第 236 页：p 值不是原假设为真的概率」，这句其实在 248 页；或者引文是它自己的转述，原文里根本没有。阅读器照着跳，就把用户带到错的地方、高亮错的字。

**功能**：`reader_goto` 要模型同时给定位号和逐字引文。跳之前先核对：引文在声称的那页，跳过去并高亮；不在那页，但在别处原样或去标点后找得到，改跳到真正的那页，并在结果里告诉模型「该引 248」：

```python title="模版 · deeptutor/reading/service.py:155-174"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/reading/service.py:155:174"
```

哪儿都找不到，照样跳到模型说的那页，但不高亮，并告诉模型下次照原文的语言逐字抄：

```python title="模版 · deeptutor/capabilities/reading/tools.py:457-488"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/reading/tools.py:457:488"
```

**效果**：三种情况各跑一次 `verify_quote`，最后一行是 `locate_quote` 单独对一句引文：

```text title="效果 · 跳转前的核对"
--8<-- "projects/deeptutor/assets/sim/txt/reading-verify.txt"
```

工具说明和类的注释里还写着「引文对不上就拒绝跳转」，代码已经改成照跳不亮，以代码为准。代码注释给的理由是：用中文问一份英文文档时，引文是模型自己的译文，永远对不上原文，原地不动比跳过去不高亮更没用。高亮跳一下之后停在浅蓝色上，直到下一次跳转才换掉——读回答的人边读边看得到依据。

## 回答里的页码变成能点的链接 { #chips }

**问题**：模型写的「第 12 页」只是一串字，用户还得自己翻过去。

**功能**：前端把 `[p.12]`、`[p.12,17]`、`[p.12-14]` 改写成普通 Markdown 链接 `[p.12](#dt-locator-12)`，阅读器用一个委托监听接住点击，共用的 Markdown 渲染器一行不改；代码块和行内代码先屏蔽掉，免得代码里的 `[0]` 被当成引用：

```ts title="模版 · web/lib/reading-citations.ts:2-23"
--8<-- "projects/deeptutor/assets/deeptutor-src/web/lib/reading-citations.ts:2:23"
```

视频的 `[01:40]` 同样改写成链接，点一下播放头跳到那一秒：

```ts title="模版 · web/lib/reading-media-citations.ts:1-25"
--8<-- "projects/deeptutor/assets/deeptutor-src/web/lib/reading-media-citations.ts:1:25"
```

**效果**：没有实跑——这是前端的 TypeScript，这里只贴模版。

## 读到哪、选了什么，自动带进问题 { #viewport }

**问题**：读到一半想问「这句什么意思」，得把段落复制回对话框，还要交代是哪一页、配的是哪张图。

**功能**：每轮开始前，引擎把阅读器的状态写进这一轮：当前在第几页；这页有嵌入的图就把图附上，整页是画出来的（公式、图表）就附上整页渲染；选中了哪段字。选中的字标成「不可信的引用」——可以当证据，不能当指令：

```python title="模版 · deeptutor/capabilities/reading/capability.py:370-401"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/reading/capability.py:370:401"
```

选中一段还能直接点工具栏上的动作。动作是按入口点注册的扩展，各自声明需要选区还是可见文字，返回卡片、测验、反馈、朗读四种固定格式之一，阅读器只认这四种：

```python title="模版 · deeptutor/reading/extensions.py:28-50"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/reading/extensions.py:28:50"
```

```toml title="模版 · pyproject.toml:105-110"
--8<-- "projects/deeptutor/assets/deeptutor-src/pyproject.toml:105:110"
```

**效果**：没有实跑——视口描述要读材料的媒体索引，动作要调模型，这里只贴模版。

## 视频：字幕切成段，按时刻引用 { #video }

**问题**：讲解视频没法问「定义是第几分钟说的」——聊天网页只看得到你贴进去的字幕文本，回答也没法把你带回那一刻。

**功能**：YouTube、B 站或 WebVTT 的字幕先规整成一条条 cue，再合并成 20 到 90 秒的段：和上一条间隔不超过 4 秒就接上，攒够 20 秒、又碰到句号就断开。每段是一个单元、一个定位号，段的起始时刻就是它的引用：

```python title="模版 · deeptutor/video_learning/service.py:229-253"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/video_learning/service.py:229:253"
```

材料是视频时，提示词改口：论断引段首时刻，不引页码；字幕是不可信的引文；模型看不到画面，不许描述画面：

```python title="模版 · deeptutor/capabilities/reading/capability.py:227-238"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/reading/capability.py:227:238"
```

**效果**：构造的讲解有 12 句话，像自动字幕那样每句在第一个逗号或冒号处拆成两条短 cue，只有后半条带句号；写成 WebVTT，其中一条在时间行和正文之间夹了空白行，一条带样式标签。依次过 `parse_webvtt`、`normalize_cues`、`build_segments`：

```text title="效果 · 24 条 cue 合成 12 段"
--8<-- "projects/deeptutor/assets/sim/txt/reading-video.txt"
```

两条半句并回了一句，段界落在句号上，「p 值的定义」那一段从 01:40 开始，回答就引 `[01:40]`。段内的话只能引段首时刻；自动字幕要是一个标点都没有，段只能靠 90 秒上限或停顿切开。

下面是照前端源码做的仿真界面，自动播放：转写跟着播放滚动，伴读的回答带时刻，点一下播放头跳过去。

<iframe src="/projects/deeptutor/assets/demos/video-reading.html" style="width:100%;height:640px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真 demo：视频阅读，转写跟随和按时刻引用"></iframe>

??? abstract "demo 源码：视频阅读"

    ```html
    --8<-- "projects/deeptutor/assets/demos/video-reading.html"
    ```

## 谁管什么 { #split }

- **程序**：切单元、编定位号、三层检索、引文核对和改跳、把页码和时刻改写成链接、视口和选区写进这一轮、字幕分段
- **模型**：先搜再读、决定引哪句、调 `reader_goto`、按格式写 `[p.N]` 和 `[mm:ss]`
- **用户**：打开哪份材料、选中哪段、点哪个动作、点哪个引用
- **扩展作者**：按清单和四种结果格式写选区动作，装成入口点

## 实跑原件 { #sim-files }

??? abstract "检索和核对的完整输出"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/reading-search.json"
    ```

??? abstract "构造的 WebVTT 和分段结果"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/reading-video.json"
    ```
