---
description: "酒馆怎么让用户自己加规则：正则把屏幕显示、存进文件、发给模型三层拆开，还能按深度只作用于旧消息；变量存在聊天文件头，宏读写；Quick Reply 把脚本挂到事件上，世界书条目激活也能触发；事件总线串行等待、可原地改 prompt；生成拦截器能改发出的历史；工具调用递归生成最多 5 轮"
---

# 用户自己加规则

网页版 ChatGPT 的规则写死在产品里：屏幕上显示的、存下来的、下一轮发给模型的是同一个字符串；想让程序记个数、每轮自动做点什么，都没有地方挂。酒馆把这几处都开了口子，用户和扩展作者自己往上挂规则。下面的正则、变量、事件三节用酒馆的原函数跑了效果，其余只贴模版。

## 正则：显示、存储、发给模型三层拆开 { #regex }

**问题**：卡要求模型每条回复末尾输出一段状态栏 `<状态>好感：35</状态>`。屏幕上想看渲染好的样子；旧的状态栏一直被回放，既占 token，又让模型拿旧数值当参考。

**功能**：正则脚本挂在几个固定的处理点上（用户输入、AI 输出、世界书、思考内容……），每个脚本有两个开关决定作用在哪一层：

- 都不勾：收到消息时就改，直接写进聊天文件，显示和 prompt 一致
- 只改显示（`markdownOnly`）：渲染时改，文件和 prompt 不动
- 只改 prompt（`promptOnly`）：拼 prompt 时改，屏幕和文件不动

再加一个深度范围，只作用于倒数第几条以后的消息：

```js title="模版 · public/scripts/extensions/regex/engine.js:349-376"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/regex/engine.js:349:376"
```

**效果**：前两轮的三条 AI 消息末尾各挂一个状态栏（构造的输入），两个脚本：一个只改显示，把状态栏渲染成方框；一个只改 prompt、最小深度 1，旧的状态栏不发给模型：

```text title="效果 · 同一条消息的三层"
--8<-- "projects/sillytavern/assets/sim/txt/ru-regex.txt"
```

文件里三条都完整保留，屏幕上三条都渲染了，发给模型时只剩最新一条带着状态栏。

## 变量：状态放在模型外面 { #variables }

**问题**：好感度、回合数只能靠模型从历史里「记」，越聊越漂。

**功能**：变量存在聊天文件头的 `chat_metadata.variables`，用宏读写，宏每轮拼 prompt 时求值：

```js title="模版 · public/scripts/macros/definitions/variable-macros.js:28-31"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/macros/definitions/variable-macros.js:28:31"
```

```js title="模版 · public/scripts/variables.js:48-55"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/variables.js:48:55"
```

**效果**：

```text title="效果 · 变量宏实算"
--8<-- "projects/sillytavern/assets/sim/txt/ru-variables.txt"
```

变量在文件头里，开分支时跟着复制（见[分支](branch.md#branch)）。另有全局变量，存在用户设置里，所有聊天共用。

## Quick Reply 和 STscript：把操作写成脚本，挂到事件上 { #scripts }

**问题**：「每条回复后好感 +1」「每 20 轮摘要一次」这类事，baseline 只能靠人记得去做。

**功能**：输入框里以 `/` 开头的不发给模型，交给 STscript 执行：有管道、变量、条件、循环，也有调模型的命令（带上下文的后台生成、不带上下文的裸生成）。Quick Reply 把一段脚本做成按钮，还可以挂到事件上自动执行：启动、用户发言、AI 回复、切换聊天、生成前，以及世界书条目激活——条目上填一个自动化 ID，激活时执行同 ID 的脚本：

```js title="模版 · public/scripts/extensions/quick-reply/src/AutoExecuteHandler.js:85-103"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/quick-reply/src/AutoExecuteHandler.js:85:103"
```

这一节只贴模版：STscript 的执行器要整个前端，实跑没有接。

## 事件总线：串行等待，能原地改 { #events }

**问题**：扩展想在 prompt 发出去之前改一笔，得有一个时机，还得保证改了算数。

**功能**：事件按注册顺序逐个 `await` 监听器，监听器拿到的是同一个对象，原地改了，发事件的一方读回来就生效：

```js title="模版 · public/lib/eventemitter.js:140-153"
--8<-- "projects/sillytavern/assets/st-src/public/lib/eventemitter.js:140:153"
```

消息数组拼完、发出之前发一次 `CHAT_COMPLETION_PROMPT_READY`，把整个数组交出去：

```js title="模版 · public/scripts/openai.js:1616-1619"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1616:1619"
```

**效果**：注册一个监听器，往数组倒数第二个位置塞一条 system「（扩展插入：外面下起了雨。）」，拼第二轮：

```text title="效果 · 监听器改过之后发给 DeepSeek 的结尾"
--8<-- "projects/sillytavern/assets/sim/txt/ru-event.txt"
```

插进去的 system 到了 DeepSeek 那边被 semi 后处理改成 user，又和前一条 user 合并了。

## 生成拦截器：改发出的历史 { #interceptor }

**问题**：向量召回要在世界书扫描之前改动这一轮的历史，事件来得太晚。

**功能**：扩展在清单里声明一个拦截函数，生成前按加载顺序依次调用，拿到的是这一轮聊天的浅拷贝，可以挪动、删掉消息，也可以中止这次生成：

```js title="模版 · public/scripts/extensions.js:2024-2046"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions.js:2024:2046"
```

向量召回就挂在这里（见[聊久了](memory.md#vectors)）；出图扩展用它拦下「给我画一张」这类请求，转去出图。这一节只贴模版。扩展往 prompt 里加内容，走的是另一条路：登记进[注入表](assembly.md#depth)。

## 工具调用：递归生成，最多 5 轮 { #tools }

**问题**：baseline 一轮只生成一条，模型没法掷个骰子、查个天气再接着讲。

**功能**：出厂关着。打开后，回复里有工具调用就执行，结果存成一条隐藏消息，再以 `depth + 1` 重新调一次生成，最多 5 轮：

```js title="模版 · public/script.js:5541-5558"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:5541:5558"
```

工具由扩展或 STscript 注册。这一节只贴模版，实跑保持出厂的关闭状态。

## 谁管什么 { #split }

- **程序**：正则的作用层和深度判断、变量的存放、事件的串行执行、拦截器的调用顺序、工具调用的递归上限
- **用户、卡作者、预设作者**：写正则、写脚本、挂自动执行、注册工具；卡和预设都能自带正则脚本，导入时先问用户同不同意
- **扩展作者**：监听事件、注册拦截器、往注入表里写内容
- **模型**：只看到这些规则作用之后的 prompt；打开工具调用后，可以决定调哪个工具

## 实跑原件 { #sim-files }

??? abstract "正则、变量、事件三组实验的原始输出"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/rules-regex.json"
    ```

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/rules-event.json"
    ```
