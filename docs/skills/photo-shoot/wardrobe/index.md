---
name: 换装六宫格
description: "写真拍摄企划主题已定、用户说换装、换衣服、重新搭配、服装不满意、再来一版时用：出 6 套逐人完整的服装候选，确认后合成一张 6 宫格，选中的升为正式 Look 并重跑发型和妆容"
---

# 换装六宫格

当前拍摄项目已经有明确的主题，用户说「换装」「换衣服」「重新搭配」「服装不满意」「再来一版」时用。主题还没定就退回[需求与造型规划](../requirements/index.md)。人数可以是 1 也可以任意多，情侣只是两人的预设。

## 逐人写全 { #detail-floor }

每一套候选都逐人写完整服装，不压缩：P01 一条完整服装、P02 一条完整服装……直到所有人。不准用「其他人类似」「其余成员同款」「大家统一穿……」当人物的服装描述；可以先说共享母题，之后照样逐人给最终穿着。

换装是服装的分支，不是简化模式：不管新会话、重开主题还是「再来一版」，每套候选都完整写出所有人。

## 流程 { #flow }

1. 继承已确认的主题、地点语境、人物名单、人物关系、身份参考和避免项
2. 设计 6 套群体服装组合，两两之间至少有两项明显不同
3. 每套写：名称、逐人服装（编号、称呼、服装）、群体搭配关系、场景、道具；6 套的人物编号完全一样、顺序一致，不在哪套里漏人或加人
4. 先给用户看完整的文字候选，等用户确认要出图
5. 用户同意后，把 6 套的逐人服装编进**一次生成的一张** 6 宫格，每格出现这一套的完整人物名单；不指定单格比例、尺寸和整板比例，不规定行列，只要求恰好 6 格、每格清晰独立、整体好读，见[出图](../reference/image-generation.md#grid)
6. 模型不画文字和数字；编号按左上起的阅读顺序对应，在回复里说清楚
7. 用户说「再来一版」就出 6 套全新的组合，编号接着往下排
8. 用户可以选一个或几个编号；选中的升为确认过的 Look，回到[拍摄与八宫格](../shooting/index.md)

## 地点不降级 { #location }

候选里的场景必须保持已确认的**时空锚点**：不能把真实地点或作品内地点缩成「酒店」「街头」「庭院」「城市」。换装阶段只保留地点锚点，可以给区域级候选，不提前锁 Shot 级的窗位、回廊转角、台阶或岸线节点。

现实室内的换装方案不能只写城市或街区：优先保留真实具名的酒店或建筑；私人公寓概念至少保留真实街道或路线，标成 `conceptual_private_interior`；不虚构门牌和房号。规则见[地点](../reference/location.md)。

## 发型和妆容的边界 { #styling }

- 6 宫格只预览服装和整体造型，里面的发型和妆容只为了画面完整、找感觉，不锁正式拍摄的发型妆面
- 用户真的选了新的换装方案，就等于「换服装」：按[改一个变量](../reference/remix.md)，原来的正式发型和妆容失效，立即重跑[发型师](../hairstyle.md)和[化妆师](../makeup.md)再锁新的 Look；之后下游只继承新锁

## 状态 { #states }

- `WARDROBE_TEXT_REVIEW`：文字候选审阅中
- `WARDROBE_GRID_REVIEW`：宫格审阅中
- 新的候选板会把受影响的旧交接文件、拍摄方案归档，不删历史图
- 编号只增不减
- 主题改了以后，旧主题的候选不能直接选进新流程

## 保存工程时 { #scripts }

候选写成一个 JSON 数组，恰好 6 个对象，键名用英文：

```json
[
  {
    "name": "LOOK A",
    "participants": [
      {"participant_id": "P01", "label": "姐姐", "outfit": "完整服装描述……"},
      {"participant_id": "P02", "label": "弟弟", "outfit": "完整服装描述……"},
      {"participant_id": "P03", "label": "母亲", "outfit": "完整服装描述……"}
    ],
    "group_relationship": "三人共享米白与灰蓝，但材质与廓形按年龄和角色区分……",
    "scene": "……",
    "location": {"location_mode": "real_world", "city": "……", "named_place": "……", "indoor_outdoor": "outdoor", "verification_status": "known_public_place_needs_current_verification"},
    "props": "……"
  }
]
```

用入口的 `theme_manager.py` 建出来的主题要求严格地点，每一套都要带结构化的 `location`，字段同[交接文件](../requirements/reference/handoff-schema.md)里的地点卡。旧的 `female` / `male` / `couple` 双人格式脚本还能读，新项目别再写。

```bash
python3 scripts/wardrobe_board.py create <工程目录> --theme "<已确认的主题>" --options-file <候选.json> --theme-id THEME-001
python3 scripts/wardrobe_board.py prepare-grid <工程目录> BOARD-001 --theme-id THEME-001   # 打印 6 宫格的出图 prompt
python3 scripts/wardrobe_board.py register-grid <工程目录> BOARD-001 --image <6宫格.png> --theme-id THEME-001
python3 scripts/wardrobe_board.py select <工程目录> --ids 1,3 --theme-id THEME-001          # 选中的升为确认过的 Look，写交接文件
```

- `prepare-grid` 打印的 prompt 直接拿去出图；`register-grid` 只把图登记进工程，自由布局下不叠编号
- `select` 在地点都结构化时写 schema 3 的 `participant_looks`、`visual_lock.participant_outfits` 和 `location_lock`，并把主题的 `stage` 改成 `LOOKS_CONFIRMED`
- `select` 是**整个重写**交接文件：原来的 `identity_map`、`styling_policy`、`share_card_policy`、`identity_reference_policy` 和每个人的发型妆容都不在新文件里。写完照上面的规矩重跑发型师和化妆师，把新的 `hairstyle_design`、`makeup_design` 补进 `visual_lock.participant_outfits`，再把这几项策略和身份映射照[交接文件](../requirements/reference/handoff-schema.md)补回去，不然出图时身份锁和分享文案的门槛都不生效
- 这个脚本要 import 入口 `scripts/` 下的 `theme_workspace.py`，所以要整包用，见[写真拍摄企划](../index.md)开头
