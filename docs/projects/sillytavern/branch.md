---
description: "酒馆怎么让聊天记录可以重来、分叉、改写：swipe 在同一位置留多个候选，只有选中的进下一轮；任意消息可编辑、隐藏（人看得见、模型看不见）；分支是复制前缀加继承文件头，变量、世界书计时跟着走；聊天整文件覆盖写，另有节流备份。每一步配源码模版和实跑效果"
---

# 重来、分叉、改历史

网页版 ChatGPT 的历史是一条线：不满意只能重新生成，旧回复就没了；模型说错的一句会被一直回放，错下去；想试另一个走向，得把后面的全删掉。酒馆把一条消息做成可以装多个候选的记录，把聊天存成一个首行是文件头的 JSONL 文件，分支就是复制前缀、带上文件头另存一份。下面的效果来自扮演主线的真实聊天；分支用的是 `bookmarks.js` 里原样的 `createBranch`。

## swipe：同一位置留多个候选 { #swipe }

**问题**：重新生成会覆盖掉上一版；几版各有可取之处，想留着挑。

**功能**：AI 的回复是一条带 `swipes` 数组的消息，`swipe_id` 指向当前选中的那个，`mes` 只是它的副本。往右滑到头，就在同一位置生成一个新候选：

```js title="模版 · public/script.js:6671-6676"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:6671:6676"
```

切换候选时，把选中那个的正文和附加数据复制回 `mes`：

```js title="模版 · public/script.js:7011-7015"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:7011:7015"
```

拼 prompt 只读 `mes`。生成新候选时，当前这条整个不进 prompt，新候选是在去掉旧回复的上下文上生成的：

```js title="模版 · public/script.js:4496-4499"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:4496:4499"
```

**效果**：主线第二轮的回复 swipe 了一次：

```text title="效果 · 第二轮回复的两个候选"
--8<-- "projects/sillytavern/assets/sim/txt/br-swipe.txt"
```

两个候选都留在文件里，只有选中的进了下一轮。

## 改一句，就是改下一轮的输入 { #edit }

**问题**：模型把眼睛颜色写错了一次，这句被一直回放，之后就一直错。

**功能**：任意一条消息都能编辑，包括 AI 的回复。改完同时写回当前候选，并给聊天打上「被动过」的标记：

```js title="模版 · public/script.js:8173-8190"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:8173:8190"
```

**效果**：把第二条（塞拉菲娜的第一句回复）里的一句改成「……最危险的怪物，怕光。」，再拼下一轮：

```text title="效果 · 编辑之后"
--8<-- "projects/sillytavern/assets/sim/txt/br-edit.txt"
```

## 隐藏：人看得见，模型看不见 { #hide }

**问题**：baseline 只有「删」和「留」。OOC 闲聊想留着自己看，但不想让角色出戏；前面的剧情已经摘要过了，原文还占着上下文。

**功能**：`/hide` 把消息的 `is_system` 置为真，界面上照常显示，拼 prompt 时被过滤掉（就是上面 `coreChat` 那一行的 `filter`）：

```js title="模版 · public/scripts/chats.js:147-169"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/chats.js:147:169"
```

**效果**：主线摘要之后，`/hide 0-4` 隐藏前五条，再拼下一轮：

```text title="效果 · /hide 0-4 前后（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/br-hide.txt"
```

## 分支：复制前缀，带上文件头 { #branch }

**问题**：第 40 条做了关键选择，想试「当时如果选另一个」，又不想丢掉现在这条线。

**功能**：在某条消息上开分支：把这条及之前的消息复制出来，换上一个新的完整性标记、记下父聊天的名字，另存成一个新文件；父消息上记下分支名，两边用文件名互链。还可以指定某个候选，从当初没选的那个分出去：

```js title="模版 · public/scripts/bookmarks.js:198-244"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/bookmarks.js:198:244"
```

另存走的是普通的保存函数，新文件头 = 当前文件头加上这两个字段：

```js title="模版 · public/script.js:7406，7421-7432"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:7406:7406"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:7421:7432"
```

服务端把数组逐条序列化，一行一条，整文件覆盖写：

```js title="模版 · src/endpoints/chats.js:532-543"
--8<-- "projects/sillytavern/assets/st-src/src/endpoints/chats.js:532:543"
```

**效果**：主线最后的聊天先存盘，再从第 4 条开分支，指定它当初被换掉的候选 `swipes[0]`。文件头里另放了一个本地变量「好感 35」（构造：相当于先执行过 `/setvar`），看分支会不会带走：

```text title="效果 · 开分支之后"
--8<-- "projects/sillytavern/assets/sim/txt/br-branch.txt"
```

变量、作者注释的设置、世界书计时全在文件头里，分支原样继承，从这一刻起两条线各记各的。会话没有树结构，分支之间只靠文件名互链：父聊天改了名，链接就断了。

## 状态跟着重来走 { #state }

**问题**：有了跨轮的状态以后，重来一次，上一版留下的状态还在不在？

**功能**：世界书的定时效果按聊天条数计时；swipe、regenerate 时聊天没有变长，计时就作废（见[世界书 · 定时效果](lorebook.md#timed)）。`{{pick}}` 的种子取主聊天的名字，从这局开出的分支抽到的值一样（见[角色卡 · 宏](card.md#macros)）。

**效果**：

```text title="效果 · 重来时世界书计时作废（构造的输入）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-timed-swipe.txt"
```

## 备份 { #backup }

**问题**：整文件覆盖写，加上编辑、删除都能永久改写历史，一刀删错没法撤销。

**功能**：每次保存后，服务端按「用户 + 聊天」节流（10 秒一次）写一份带时间戳的备份，每个聊天留 50 份；名字里有中文的，在文件名后加一段哈希，免得几个中文名的聊天挤在同一个配额里：

```js title="模版 · src/endpoints/chats.js:42-78"
--8<-- "projects/sillytavern/assets/st-src/src/endpoints/chats.js:42:78"
```

这一节只贴模版，实跑没有起服务端。

## 谁管什么 { #split }

- **程序**：候选怎么存、哪个进 prompt、隐藏的过滤、分支的复制和文件头继承、重来时作废计时、备份
- **用户**：滑哪个候选、改哪句、藏哪些、在哪开分支
- **模型**：只看到选中、没隐藏、改过之后的那条线

## 实跑原件 { #sim-files }

??? abstract "分支文件（第一行是文件头）"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/branch-branch.jsonl"
    ```
