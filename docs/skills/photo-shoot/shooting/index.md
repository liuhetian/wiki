---
name: 拍摄与八宫格
description: "写真拍摄企划选定方向以后用：继承锁定的服装和妆发，先做姿势与情绪规划，再编恰好 8 张逐人调度的 Shot，出图前写分享文案，合成一张 8 宫格；用户点名再放大单张"
---

# 拍摄与八宫格

接住已确认的造型交接，做成详细的 8 张拍摄方案、一张 8 宫格和选中单张的放大。单人、情侣、家庭、朋友群像、婚礼派对、团队、角色群像都用它，人数不限，人多不降逐人的具体程度。

先守入口的共守规矩，尤其是[真人参考图](../index.md#identity)和[出图](../index.md#render)。

## 进来之前 { #entry }

方向已经由 A/B/C 选择（或合法的抽卡自动选择）授权，每个人的 Look 完整，每个人都锁了发型和妆容。缺发型或妆容就退回[发型师](../hairstyle.md)、[化妆师](../makeup.md)，不进 Shot。

每次建 Shot 都冻结这个 Look 的下面这些，作为不可替换的视觉锁定：

- 完整的人物名单
- 每个人各自的服装、正式发型、正式妆容
- 人物关系描述（情侣和多人必填，含角色层级和互动基础）、群体搭配
- 作品或时代语境
- 地点锚点：真实、作品或虚构的时空锚点，加必要的作品和时代信息；微点位由每张 Shot 自己定
- 避免项

## 按模式走 { #modes }

- **自主模式**：用户选了方向，就直接做姿势与情绪规划和 8 张 Shot，不等 Shot 二次确认；先给分享文案，再出一张 8 宫格。完整的 8 张 Shot 文字不主动铺给用户，用户要看完整拆解时再给
- **抽卡模式**：完整生成 8 张并自动审阅（差异度、姿势家族、人物覆盖、地点继承、动作合理性、视觉记忆点），不等用户，直接出一张 8 宫格；默认不出 8 张独立图
- 两种模式都不能跳过 Shot，也不能用「随机动作」代替逐人调度；用户任何时候都可以改某张 Shot 或说「再来一批」

## 选一个出图骨架 { #skeletons }

骨架只是摄影语言的参考，真正的约束来自确认过的交接：

- 2 人、关系是情侣：参考[情侣写真骨架](reference/couple-prompt.md)
- 只有 2 人、以婚礼新人为中心、婚纱仪式是核心：参考[婚纱骨架](reference/wedding-prompt.md)
- 1 人，或 3 人以上的群像（包括新人加伴郎伴娘、家庭）：优先参考[单人与群像骨架](reference/group-prompt.md)，再叠加婚礼仪式的语义；不让婚纱骨架的双人结构盖掉多人名单

## 先规划姿势与情绪 { #pose }

出 Shot 之前先按[姿势与情绪](reference/pose-emotion.md)规划，每张按「动作意图 → 关键身体力学 → 人物关系与接触 → 情绪动机 → 景别适配」走。情侣和多人要继承上游的人物关系描述，Shot 级的接触和距离可以变，但不能和已确认的关系结构冲突。

- 每张只写当前景别需要的 2–4 个关键身体力学点；全身才重点写脚位、承重、重心，半身和近景不写看不见的部位
- 情侣要规划接触关系拓扑
- 8 张做姿势家族的语义去重
- 情绪动态生成，不套固定示例或情绪词表

## 8 张 Shot { #shots }

每个 Look 恰好 8 张（用户指定了张数就照用户的）。每张写什么、字段怎么填，见 [Shot List](reference/shot-list.md)。

**多人的逐人调度**

- 每张写明本张出镜的人（`participants_present`），给每个出镜的人恰好一条逐人调度（`participant_directions`）：动作、身体朝向、视线表情、手和道具的关系
- 不准写「其他人自然互动」「其余人站在后面」这类压缩说法
- 8 张的出镜人加起来要覆盖所有人；默认至少 1 张完整群像，除非用户明确不要合影
- 可以安排子群或单人的 Shot，但要写明谁出镜、谁不出镜；同一张里不增人、不漏人、不复制人、不换衣服

**地点**：每张都要答得上「这是哪里」（继承 Look 的时空锚点）、「在这里的哪儿拍」（本张新定的具体空间节点）、「什么时代或作品状态」（历史、古风、影视、游戏、文学必写）。「《红楼梦》大观园·潇湘馆」不能退化成「古风庭院」，规则见[地点](../reference/location.md#micro)。

**组图要变化**

- 远、中、近；全身、三分之二、半身、特写
- 静态和动态；看镜头、半知情、抓拍
- 环境建立、人物关系、细节
- 每张相对其他张至少改三项：互动微事件、出镜组合、景别构图、空间层次、光线、环境元素；同一种标准互动一组里最多出现一次
- 像「正在发生的事」，不是标准棚拍摆姿；情侣优先设计两人之间的事件，不是两个独立姿势拼在一起；家庭用前后、高低、坐站建立关系，避免一排站
- 不统一 AI 微笑；一张图不堆几个主动作；身体支撑和关节都要真实可做到

**服装冻结**：Shot 只能改动作、机位、构图、光线和环境细节，不得改写任何人的服装；具名作品、游戏、动漫、历史主题要保持每个人在那个世界里的身份逻辑，不让部分人退化成无语境的现代装。

## 分享文案 { #share }

Shot 写完、调任何图片接口之前，先编好[分享文案](reference/share-card.md)并给用户看，再出图 —— 出图之后不用再补文字。用户说「只出图」「不要文案」就记为跳过。

## 出 8 宫格 { #grid }

- 把 8 张 Shot 的完整 prompt 编进**一次生成的一张** 8 宫格，不一次生成 8 张独立图
- 每格严格按这一格的出镜人、逐人调度、每个人锁定的服装、人数和身份、场景和世界观；不跨格合并人物、服装、动作或道具
- 真人项目先放总身份锁，每格前再放本格的身份重置，规则见[真人身份参考](../reference/identity-reference.md#identity-lock)
- 正式发型和妆容进每一格的 prompt：发型可以和参考图完全不同，渲染时照样执行，不偷偷回退成参考图的发型；妆容包含皮肤优化和主题妆面
- 宫格不写比例和行列；接口、参考图顺序、出完自检见[出图](../reference/image-generation.md)

## 放大单张 { #detail }

用户点名放大第几张、单独出几张、全部单出时：以 8 宫格为构图参考、原图为身份参考，按竖幅或横幅重新生成一张完整的图，保持人物、服装、站位、视线和手部道具关系，允许为新画幅自然重新取景。做法见[出图](../reference/image-generation.md#detail)。

## 保存工程时 { #scripts }

```bash
python3 scripts/shot_board.py create <工程目录> --look-id LOOK-01 --theme "<主题>" --shots-file <8张.json> --theme-id THEME-001
python3 scripts/share_card.py <主题目录> SHOTBOARD-001 --share-file <分享卡.json>     # 用户不要文案时改成 --skip
python3 scripts/shot_board.py prepare-grid <工程目录> SHOTBOARD-001 --theme-id THEME-001   # 打印 8 宫格的出图 prompt
python3 scripts/shot_board.py register-grid <工程目录> SHOTBOARD-001 --image <8宫格.png> --theme-id THEME-001
python3 scripts/shot_board.py select <工程目录> --ids 3,6 --orientation portrait --theme-id THEME-001   # 放大第 3、6 张；横幅写 landscape，--detail 加细节要求
python3 scripts/shot_board.py complete <工程目录> --brief <select 打印的 brief 路径> --image <放大图> --theme-id THEME-001
```

- `create` 读主题目录的交接文件，校验 8 张 Shot（字段、出镜人覆盖、完整群像、地点、压缩说法），把视觉锁定写进每张的 prompt；Shot JSON 的格式见 [Shot List](reference/shot-list.md#json)
- `share_card.py` 只认 `deliverables/shot-boards/` 的直接上级，所以第一个参数是**主题目录**（`<工程目录>/themes/THEME-001`），不是工程目录；交接文件要求先编文案时，`prepare-grid` 在文案就绪或跳过之前不放行
- `prepare-grid` 打印的 prompt 已经包含总身份锁、逐格重置和看清脸的要求，直接拿去出图；`register-grid` 只登记，自由布局下不叠编号
- `select` 为每张写一份放大 brief（`deliverables/shot-detail-briefs/`），里面的 `render_prompt` 就是放大用的 prompt；`select` 打印的 brief 路径相对主题目录，原样传给 `complete`；放大图要先存进主题目录（比如它的 `images/shot-details/`），`complete` 才收
- `shot_board.py` 要 import 入口 `scripts/` 下的 `theme_workspace.py`，所以要整包用，见[写真拍摄企划](../index.md)开头

## reference { #reference }

- [姿势与情绪](reference/pose-emotion.md) —— 分层规划、关键身体力学、景别适配、姿势家族去重、情侣接触拓扑、情绪动态生成
- [Shot List](reference/shot-list.md) —— 每张 Shot 的字段、给脚本的 JSON、拍摄方案和 Shot List 的文档模板、放大 brief
- [分享文案](reference/share-card.md) —— 出图前编好的传播卡：故事卡名、钩子、复刻提示词、标签、CTA
- [情侣写真骨架](reference/couple-prompt.md) —— 情侣写真出图 prompt 的填空骨架
- [婚纱骨架](reference/wedding-prompt.md) —— 婚纱摄影出图 prompt 的填空骨架
- [单人与群像骨架](reference/group-prompt.md) —— 单人或任意人数群像出图 prompt 的填空骨架
