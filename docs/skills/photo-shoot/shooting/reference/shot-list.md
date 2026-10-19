---
description: "写真拍摄企划每张 Shot 要写的字段和对应的英文键，保存工程时交给 shot_board.py 的 8 张 JSON 格式，拍摄方案、Shot List、出图提示词三份文档模板，以及放大单张的 brief 长什么样"
---

# Shot List

- [每张 Shot 的字段](#fields)
- [给脚本的 JSON](#json)
- [拍摄方案模板](#shooting-plan)
- [Shot List 模板](#shot-list)
- [出图提示词模板](#shot-prompts)
- [放大单张的 brief](#detail-brief)

## 每张 Shot 的字段 { #fields }

中文是写给用户看的字段名，英文键是保存工程时 JSON 里的键名（脚本按英文键解析，值用中文写）：

| 字段 | 英文键 | 写什么 |
|---|---|---|
| 标题 | `title` | 这张的短标题 |
| 拍摄目的 | `purpose` | 这张在整组里负责什么：环境建立、关系、细节…… |
| 动作事件 | `action_event` | 这一刻正在发生的事 |
| 姿势结构 | `pose_structure` | 姿势的结构，不只是一个姿势标签 |
| 关键受力 / 重心 | `key_support_weight` | 当前景别真正需要的 2–4 个承重、重心、支撑点 |
| 关系 / 接触 | `relationship_contact` | 人和人、人和环境的接触关系 |
| 情绪动机 | `emotion_motivation` | 从当前主题和事件生成的情绪动机，不套词表 |
| 视线 | `gaze` | 视线关系 |
| 景别适配 | `framing_adaptation` | 姿势怎么服从当前景别 |
| 完整地点锚点 | `location_context` | 继承 Look 的完整时空锚点，不能只写「室内」「街头」「庭院」 |
| 具体场景位置 | `scene_area` | 在这个具名地点里，本张的微观位置 |
| 时代 / 作品世界状态 | `era_or_world_context` | 历史、作品题材必填；现代现实可写 `contemporary` |
| 出镜人物 | `participants_present` | 本张出镜的人物编号列表；多人项目必填 |
| 逐人调度 | `participant_directions` | 每个出镜的人恰好一条：动作、身体朝向、视线表情、手和道具 |
| 群体互动 | `interaction` | 所有动作属于的同一个事件 |
| 景别 | `shot_size` | 远景、全身、三分之二、半身、近景、特写 |
| 构图 | `composition` | 机位和构图 |
| 光线 | `lighting` | 光线和氛围重点 |
| 服装与道具连续性 | `continuity` | 和其他张的服装、道具连续关系 |
| 避免项 | `avoids` | 这张要避免的 |
| 完整出图提示词 | `prompt` | 这张的动作和构图描述；视觉锁定由脚本补进去 |

## 给脚本的 JSON { #json }

保存工程时，8 张写成一个 JSON 数组交给 `shot_board.py create --shots-file`，**恰好 8 个对象**：

```json
[
  {
    "title": "……",
    "purpose": "……",
    "action_event": "……",
    "pose_structure": "……",
    "key_support_weight": "……",
    "relationship_contact": "……",
    "emotion_motivation": "……",
    "gaze": "……",
    "framing_adaptation": "……",
    "location_context": "……",
    "scene_area": "……",
    "era_or_world_context": "……",
    "participants_present": ["P01", "P02"],
    "participant_directions": [
      {"participant_id": "P01", "direction": "……"},
      {"participant_id": "P02", "direction": "……"}
    ],
    "interaction": "……",
    "shot_size": "……",
    "composition": "……",
    "lighting": "……",
    "continuity": "……",
    "avoids": "……",
    "prompt": "……"
  }
]
```

脚本会拦下这些：

- 少了表里任何一个必填字段（`location_context`、`era_or_world_context`、`participants_present`、`participant_directions` 之外的都必填）
- 交接文件是 schema 3 时：`location_context` 或 `scene_area` 只写了泛词；历史、作品、原创世界没写 `era_or_world_context`
- 3 人以上：缺 `participants_present` 或 `participant_directions`，逐人调度和出镜人对不上，8 张没覆盖所有人，没有一张完整群像，出现「其他人」「其余人」「剩下的人」
- 出镜人里有名单外的编号
- `prompt` 里写了「普通西装」「默认礼服」「统一西装」而锁定的服装里没有

## 拍摄方案模板 { #shooting-plan }

````markdown
# 拍摄方案｜{项目名}

拍摄类型：{……}
人数：{……}
人物：{人物名单}
地点模式：{……}
具名主场景：{……}
国家 / 城市 / 区域：{……}
具体空间节点：{……}
作品内具体地点：{可选}
时代 / 时期 / 世界状态：{……}
现实地点核验状态：{……}

## LOOK {编号}｜{概念}

摄影主题：{……}
核心概念：{……}
场景与区域：{……}
地点锁定：{……}
环境元素：{……}
群体关系 / 互动逻辑：{……}
情绪关系：{……}
构图倾向：{……}
主要光线：{……}
逐人妆发重点：{执行方向阶段已锁定的正式发型和妆容}
成片质感：{……}

交给 Shot 的约束：{……}

下一步：基于以上内容编 8 张 Shot。多人 Shot 必须写明出镜人物，并给每个出镜的人逐人调度。

严格保留：{视觉锁定的各项}
````

地点在 Shot 和放大阶段都不得泛化；新会话、重开主题、再来一批都保持同样的详细程度。

## Shot List 模板 { #shot-list }

````markdown
# 8 宫格 Shot List｜{项目名}

拍摄类型：{……}
每套张数：8
具名主场景：{……}

## LOOK {编号}｜{概念}

### Shot {编号}｜{标题}
拍摄目的：{……}
动作事件：{……}
姿势结构：{……}
关键受力 / 重心：{……}
关系 / 接触：{……}
情绪动机：{……}
视线：{……}
景别适配：{……}
完整地点锚点：{……}
具体场景位置：{……}
时代 / 作品世界状态：{……}
出镜人物：{……}
逐人调度：{……}
群体互动：{……}
景别：{……}
构图：{……}
光线：{……}
服装与道具连续性：{……}
避免项：{……}
完整出图提示词：{……}

（每张一节，共 8 张）
````

自主模式：完整 Shot List 写完不设二次确认；按[选向之后](../../reference/interaction-modes.md#after-selection)直接出一张自适应布局的 8 宫格。抽卡模式：自动审阅后直接出一张 8 宫格。用户要看完整拆解时，才把这份 Shot List 给用户。

## 出图提示词模板 { #shot-prompts }

````markdown
# Shot 出图提示词｜{项目名}

拍摄类型：{……}
具名主场景：{……}

## LOOK {编号}｜{概念}

### Shot {编号}｜{拍摄目的}

{这张直接可用的出图提示词}
````

每一张的提示词都要执行已确认的正式发型和正式妆容。

## 放大单张的 brief { #detail-brief }

保存工程时 `shot_board.py select` 自己写这份 brief，不用手写；这里列出来是为了知道里面有什么。键名英文：

```yaml
brief_id: null
status: pending
board_id: null
shot_id: null
orientation: portrait          # portrait 竖幅 | landscape 横幅
aspect_ratio: '4:5'            # 脚本按 orientation 写：竖幅 4:5，横幅 3:2
user_detail: null              # 用户提的细节要求
source_prompt: null            # 这张 Shot 原来的 prompt
reference_image: null          # 整张 8 宫格的副本，只作构图参考
reference_source: null
reference_usage: required
identity_references: []        # 逐人的身份参考，默认最初上传的原图
identity_reference_source: original_user_upload
composition_reference_image: null
composition_reference_role: composition_only
preservation_contract:
  required:                    # 必须保留
  - 人物身份
  - 每个人的服装
  - 准确的人数
  - 完整的地点锚点
  - 准确的场景节点
  - 时代或作品世界
  - 姿势和站位调度
  - 相对位置
  - 视线、手和道具的关系
  allowed: []                  # 允许变的
  prohibited:                  # 禁止的
  - 地点泛化
  - 换场地
  - 编造地址
  - 漏人
  - 复制人
  - 换衣服
  - 重排动作
detail_instruction: null
render_prompt: null            # 放大用的完整 prompt
output_path: null
quality_check:
  status: pending
  notes: null
location_context: null
scene_area: null
era_or_world_context: null
identity_reference_hair_policy: "face_only_ignore_original_hair_unless_user_locks_it"
```

最终出图必须执行已确认的正式发型和妆容；有真人参考时保持 `participant_id → identity_references` 的对应，不换脸。
