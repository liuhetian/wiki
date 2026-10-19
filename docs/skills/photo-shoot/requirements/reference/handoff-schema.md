---
description: "写真拍摄企划保存工程时交接文件 requirements-handoff.yaml 的格式：键名保持英文给脚本读，注释译成中文；人物名单、身份映射、逐人服装发型妆容、结构化地点卡和视觉锁定都在里面，选定后 ready 设 true"
---

# 交接文件

只在用户要求保存工程时写：方向选定、完整 Look 建好之后，存成主题目录的 `deliverables/requirements-handoff.yaml`。[拍摄与八宫格](../../shooting/index.md)的 `shot_board.py` 从这里读视觉锁定，入口的 `validate_project.py` 按它校验。

- [格式](#schema)
- [写完要满足的条件](#checks)

## 格式 { #schema }

**键名和枚举值保持英文**，脚本按它们解析；自由文本的值（服装描述、关系描述、地点名）用中文写。每个人一条，人数多少条目就多少，不得省略。

```yaml
schema_version: 3
project:
  interaction_mode: user_directed  # user_directed 自主 | card_draw 抽卡
  story_card_name: null            # 故事卡名
  creative_history: []
  spacetime_passport: []           # 时空护照：已选、已抽的时空、卡名、方向类型
  direction_type_history: []       # 连续抽卡轮换类型用
  remix_history: []
  confirmation_authority: user     # user | ai_recommendation
  draw_card:
    spacetime_type: null  # real_contemporary | real_historical | future_landmark | source_work | original_fictional（仅用户明确要原创世界时）
    spacetime_card: null
    internal_direction_candidates: []
    selected_direction: null
    selection_reason: null
  shoot_type: null
  purpose: null
  participant_count: 1             # 必须等于 participants 的条数
  gender_composition: null
  relationship_preset: null
  relationship_description: null   # 人物关系描述，情侣和多人必填
  participant_structure_confirmed: false
  styling_policy:
    professional_nodes_required: true   # 为 true 时脚本要求每个人都有 hairstyle_design 和 makeup_design
    generated_at_direction_stage: true
    downstream_inherit_only: true
  share_card_policy:
    required_before_render: true        # 为 true 时出宫格前必须先编好分享文案
    compile_before_image_tool: true
  identity_reference_policy:
    identity_lock_version: 2
    per_panel_identity_reset_required: true
    panel_to_panel_face_inheritance_forbidden: true
    face_readability_gate: true
    canonical_source: original_user_upload   # 脚本要求必须是这个值
    hair_semantics: face_only_ignore_original_hair_unless_user_locks_it
    derived_images_never_auto_promote: true  # 脚本要求必须为 true
    explicit_user_promotion_required: true   # 脚本要求必须为 true
    derived_reference_roles: [composition, pose, style, scene]
  participants:
  - id: P01
    label: null              # 称呼：新娘、父亲、主唱……
    gender: null
    role: null
    relationship_role: null
    original_identity_references: []  # 不可变的默认身份源：用户最初上传的真人照片
    identity_references: []           # 兼容字段，镜像 active_identity_references
  identity_map:
  - participant_id: P01
    canonical_original_references: []
    active_identity_references: []
    identity_references: []           # 兼容字段，镜像 active_identity_references
    active_reference_source: original_user_upload  # original_user_upload | explicit_user_promoted_derived
    explicit_promotion: false
    promoted_from: null
  selected_direction_styling:
    direction_id: null
    participant_styling:
    - participant_id: P01
      hairstyle_design: null
      makeup_design: null
    styling_status: pending  # pending 待定 | locked 已锁 | invalidated_by_remix 被改变量判失效
  look_count: 1
  theme: null
  worldview: null
  location_context: []
  relationship_mood: []
  visual_direction: []
  media_references: []
  hard_avoids: []
  location_policy:          # schema 3 时脚本要求下面每一项都是 true
    specific_location_required: true
    progressive_specificity: true
    discovery_anchor_only: true
    look_uses_shootable_zones_not_micro_points: true
    shot_micro_location_required: true
    indoor_must_be_geographically_anchored: true
    outdoor_must_name_specific_place: true
    named_work_must_name_in_world_location: true
    period_context_required_when_material: true
    no_invented_real_addresses: true
    generic_location_only_is_invalid: true
    unspecified_modern_location_uses_random_world_famous_fallback: true
    random_fallback_must_be_theme_compatible: true
    random_fallback_reroll_changes_place: true
looks:
- id: LOOK-01
  status: presented   # 选定后改成 confirmed
  concept: null
  role_in_set: null
  participant_looks:  # 名单里每个人恰好一条
  - participant_id: P01
    label: null
    role_in_look: null
    full_description: null   # 完整服装描述
    outfit:
      category: null
      subcategory: null
      context: null
      visual_role_in_group: null
      silhouette: null
      upper_inner_layers: []
      outer_layer: null
      lower_or_full_body_garment: null
      length_proportion: null
      neckline_collar_lapel: null
      sleeve: null
      waistline_fit: null
      primary_material: null
      secondary_materials: []
      color: null
      finish_texture: null
      structural_details: []
      decorative_details: []
      movement_characteristics: null
      shoes: null
      jewelry_watch: []
      headwear_hair_accessory: []
      other_accessories: []
      grooming_makeup_hair: null
      hairstyle_design: null   # 从方向卡继承的正式发型
      makeup_design: null      # 从方向卡继承的正式妆容
      prop_ownership: []
      practicality_season_notes: []
      scene_role_compatibility: null
      hard_avoids: []
  group_relationship:
    visual_hierarchy: null
    palette_relationship: null
    material_relationship: null
    silhouette_relationship: null
    formality_relationship: null
    contrast_harmony: null
    shared_motifs: []
    intentional_differences: []
    subgroup_logic: []
  visual_lock:
    participant_outfits:   # 下游不可改；名单里每个人恰好一条
    - participant_id: P01
      label: null
      outfit: null           # 完整、不可替换的服装描述
      hairstyle_design: null
      makeup_design: null
    group_relationship: null
    work_era_setting: null
    scene_mood: null
    hard_avoids: []
    location_lock: []        # schema 3 必填：和 scenes 同结构的地点卡
    quality_floor: full_detail_no_compression
  scenes:                  # schema 3 至少一张结构化地点卡
  - id: SCENE-01
    name: null
    location_mode: null      # real_world | historical_real_world | future_landmark | source_work | original_fictional
    indoor_outdoor: null     # indoor | outdoor | mixed
    country: null
    city: null               # 现实地点必填
    district_or_area: null
    street_or_route: null
    named_place: null
    exact_space_node: null   # Shot 之前可以不填，不提前锁微点位
    verification_status: null  # user_supplied | verified_current | known_public_place_needs_current_verification | conceptual_private_interior
    selection_origin: null   # user_supplied | random_world_famous_fallback | source_work | historical_setting | future_landmark | original_fictional（仅用户明确要求）
    source_work: null
    in_world_location: null
    era_or_period: null      # 历史和未来地点必填
    world_state_or_chapter: null
    recognizable_environmental_evidence: []
    truthfulness_note: null
    palette: null
    usable_areas: []         # 2–4 个可拍区域
    activity_environment_compatibility: null
    clothing_practicality: null
    props: []
look_group_confirmation:
  status: confirmed
  confirmation_source: direction_selected  # direction_selected 用户选向 | ai_auto_confirmed 抽卡自动 | user_override 用户改写
  rule: 选 A/B/C 就是对所选方向的充分授权，不再要第二次 Group Look 确认；抽卡模式下 AI 选出的合法方向自动确认下游 Look。
handoff_to_photography_skill:
  ready: false   # 方向已定、每个人服装完整且发型妆容已锁时改成 true
  confirmation_rule: 选定方向已固定、每个人都有完整服装和 hairstyle_design、makeup_design、所选方向的妆发已锁定时，ready 变为 true；不需要用户第二次确认。
  next_task: 编排 8 张 Shot 的拍摄方案，保留所有人物身份、身份映射、锁定的服装、发型和妆容。
```

## 写完要满足的条件 { #checks }

`validate_project.py` 和 `shot_board.py` 会按这些拦：

- `participant_count` 等于 `participants` 的条数，编号唯一非空
- 每套 Look 的 `participant_looks` 和 `visual_lock.participant_outfits` 都恰好覆盖名单里的每个人一次，每条都有服装
- `styling_policy.professional_nodes_required` 为 true 时，每个人都要有非空的 `hairstyle_design` 和 `makeup_design`
- 服装描述里出现「其他人同风格」「同上」这类压缩说法会被拦
- 进入拍摄前 `looks[].status` 是 `confirmed`、`look_group_confirmation.status` 是 `confirmed`、`handoff_to_photography_skill.ready` 是 `true`，主题目录 `project.yaml` 的 `stage` 改成 `LOOKS_CONFIRMED`，改完跑 `theme_manager.py switch` 同步主题登记；交接文件在这之前就存在会被判错
- `schema_version: 3` 时每套 Look 至少一张 `scenes` 地点卡和非空的 `location_lock`，地点卡按[地点](../../reference/location.md)的精度要求校验：现实地点要有城市加具体区域、街道或具名地点，室内要有具名场所或真实街道，`verification_status` 只能是那四个值；作品地点要有作品、作品内地点和时代或世界状态
- `identity_map` 里没显式升级就不能和原图不一致；升级了 `active_reference_source` 要写 `explicit_user_promoted_derived`
- 旧的双人字段 `female_outfit` / `male_outfit` / `couple_relationship` 脚本还能读，新项目一律写上面的人物数组格式
