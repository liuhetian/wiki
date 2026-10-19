<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/music-to-video/references/motion-primitive-catalog.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 运动基本元素 catalog —— 自由组合菜单

原子层：一个锚点 → 一个微动作。当没有模板适合某个 group 时，就从这里点名基本元素来自由组合。浏览 **锚点** + **最佳时长** + **作用**，然后挑出能撑起这个 group 的最小集合。

## 时间与提前量（适用于每一个基本元素）

- **硬打点是 0ms。** 切、色板翻转、内容替换、冻结都是不带时长的 `tl.set(...)` —— 打击乐 _本身就是_ 运动。给打点加缓动就把它毁了。
- **领先于锚点。** 必须 _落_ 在节拍上的动作（一次覆盖整个画面的擦除、一个 count-up 锁定、两个块相撞）要**提前约 40–190ms** 开始，这样它才会恰好在锚点上完成。反应式入场（某个东西 _因为_ 这一下打点而出现）在其后 0–45ms 触发。
- **带缓动的入场：300–500ms**（缩放冲击、滑动、镜头推进）。**宏观构建：800–2000ms**，跨越一整段 roll / 静音。
- **每小节上限：** 每次打点只累加一个元素（而不是一次爆发）；镜头运动每个乐句最多一次，绝不每拍一次；密集的翻转 / 频闪系统持续 ≤2–3 秒。
- **张力构建要锁定。** count-up / 顺序构建 / 变形必须 _在_ 重拍或 hard_stop 上 _收束_，绝不在小节中间草草结束。
- **最佳时长指的是活跃运动。** catalog 里的时长指导，并不是让你把一个基本元素拉满整个 frame 的许可。如果一个自由组合的 group 比列出的时长更长，就加一个定格 / 铺底 / 下一个基本元素，或者在下一个音乐锚点处把这个 frame 再拆出一个 group。

## Catalog

| id                    | 锚点                             | 最佳时长          | 作用                                                                      |
| --------------------- | -------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `hypercut-whip`       | beat / hard_stop                 | 0.18-0.45s        | 画面之间快速甩镜硬切                                                      |
| `kinetic-letter-in`   | downbeat / phrase                | 0.4-1.2s          | 逐字母的动态入场                                                          |
| `braam-punch`         | drop / surge                     | 0.2-0.9s 活跃段   | 大冲击：缩放 + 字重重砸                                                   |
| `chromatic-split`     | snare / glitch / surge           | 0.1-0.6s          | 在一个词上做 RGB 通道分离 / 故障效果                                      |
| `mask-reveal`         | section_start / downbeat         | 0.5-1.2s          | clip-path 遮罩擦除显现                                                    |
| `screen-shake`        | drop / crash / kick              | 0.1-0.5s          | 镜头 / 屏幕抖动                                                           |
| `binary-decrypt`      | roll / build                     | 0.8-2.5s          | 乱码 → 解码文字（二进制 → 单词）                                          |
| `dolly-zoom`          | phrase / build                   | 1.2-2.5s          | 眩晕式推拉变焦（缩放 vs 透视）                                            |
| `iris-open`           | section_start / reveal           | 0.6-1.2s          | 圆形光圈张开式显现                                                        |
| `electric-arc`        | accent / glitch                  | 0.1-0.6s          | 电弧 / 闪电点缀                                                           |
| `neon-flicker`        | hold / texture                   | 0.5-2.5s          | 霓虹灯招牌闪烁                                                            |
| `chrome-sweep`        | downbeat / reveal                | 0.6-1.4s          | 金属高光扫过文字                                                          |
| `slot-machine-reveal` | roll → downbeat                  | 0.8-2.0s          | 老虎机式滚动后落定的字符显现                                              |
| `liquid-morph`        | phrase / transition              | 1.0-2.5s          | 液体 / 团块变形                                                           |
| `gooey-metaball`      | build / drop                     | 1.5-3.0s          | 黏稠的 metaball 融合场                                                    |
| `3d-card-flip`        | downbeat / swap                  | 0.8-1.6s          | 3D 卡片翻转（rotateY）                                                    |
| `crash-zoom-in`       | drop / surge                     | 0.2-0.8s          | 猛烈的急推放大                                                            |
| `spotlight-sweep`     | reveal / hold                    | 0.8-2.0s          | 聚光 / 渐变扫过文字                                                       |
| `outline-to-fill`     | downbeat / reveal                | 0.8-1.8s          | 描边轮廓 → 实心填充                                                       |
| `counting-punch`      | roll → downbeat                  | 1.0-2.5s          | 数字 count-up，然后重击并锁定                                             |
| `particle-burst`      | drop / crash                     | 0.2-1.2s          | 粒子爆炸迸发                                                              |
| `radial-burst-lines`  | drop / surge                     | 0.2-0.8s          | 放射状速度线迸发                                                          |
| `pixel-dissolve`      | transition / hard_stop           | 0.5-1.5s          | 像素化溶解                                                                |
| `datamosh-smear`      | glitch / transition              | 0.4-1.2s          | datamosh / 运动拖影                                                       |
| `text-wave-distort`   | hold / texture                   | 1.0-2.5s          | 波浪形文字扭曲                                                            |
| `bg-flow-field`       | energy / 整个 span（铺底）       | 4-12s 铺底        | 生成式 curl-noise 背景铺底；任何前景动作都可以叠在它上面                  |
| `blur-resolve`        | stop / 最终定格                  | 0.7-2.0s          | 从模糊进入到清晰对焦，然后在切点上模糊退出                                |
| `chromatic-pressure`  | snare / glitch                   | 0.1-0.5s          | 在一个瞬态上做 RGB 分离 / 数字化张力                                      |
| `color-grid-shuffle`  | onset                            | 0ms 打点；≤2s 持续 | 单元格网格按每个 onset 的确定性索引重新着色                               |
| `content-swap`        | beat                             | 0ms 打点；≤3s 持续 | 0ms 替换堆叠的节点：最主力的打击乐式动作                                  |
| `directional-fill`    | beat / reveal                    | 每个 0.3-1.0s     | 方向性擦除填充（scaleX）横扫各个条                                        |
| `flash-cut`           | drop / crash                     | 0-0.6s            | 全画面闪白，遮住一次文字 / 颜色状态的切换                                 |
| `freeze-hold`         | hard_stop                        | 0ms 进入；0.5-2s  | 冻结正在运动的系统并定格                                                  |
| `hard-cut`            | beat / hard_stop                 | 0ms 进入；0.3-2s  | 采样级精确的色块 + 文字切                                                 |
| `mosaic-pack`         | beat / build                     | 1.5-3.5s          | 散落的瓦片飞入并拼成网格                                                  |
| `negative-space-hold` | silence / hard_stop / 最终定格   | 1-6s 定格         | 撤掉繁杂的图层，在留白中定格一个可读的标记                                |
| `overlay-pop`         | accent                           | 0.2-0.6s 进入     | 徽章 / lower-third overlay 在底层之上弹出                                 |
| `palette-flip`        | 段落切换                         | 0ms 翻转；0.5-4s  | 同一布局通过 0ms 的色板变量翻转来换肤                                     |
| `staggered-exit`      | phrase / transition              | 0.4-1.2s          | 有序级联退场，清空画面                                                    |
| `staggered-reveal`    | build                            | 0.8-2.5s          | 一个堆叠 / 列表的有序级联入场                                             |
| `system-replace`      | drop / 体系切换                  | 0ms 切            | 硬切掉整个视觉系统，然后启动新的系统                                      |
| `text-spectral-rays`  | phrase / sweep（hero 文字）      | 2.5-5s            | 文字标志朝一个扫动的光标投射出体积光线                                    |
| `tile-mosaic`         | build / reveal                   | 1.5-3.5s          | 瓦片网格以对角线扫过的方式显现，拼成一张海报                              |
| `typewriter-reveal`   | roll / build                     | 1.0-3.0s          | 带光标的逐字符 / 逐词打字效果                                             |
| `value-counter`       | roll → downbeat                  | 1.0-2.5s          | 在重拍 / hard_stop 上锁定的 count-up                                      |
| `word-grid-burst`     | onsets → downbeat                | 1.8-3.2s          | 文字网格按 onset 逐个显现，在重拍上重新聚焦到其中一个                     |

## 如何组合

- 每个 group 一个主导系统；在一个结构型基本元素之上，最多叠一个质感型基本元素。
- 结构放在强拍上（切、镜头、`system-replace` → downbeat / phrase / section_start）；质感放在弱拍 / 切分的打点上（`content-swap`、打字机字母、色散点缀）。
- roll 是一个累积容器 —— 在它进行期间不断构建，在结束它的那个重拍上硬切到一个干净的布局。
- `drop` ≠ `downbeat`：downbeat 是体系内部的一次切；drop 是一次体系切换（`system-replace`、全部清空、元素数量跳变）。
- 让静音去掉密度（`negative-space-hold`）。
- 背景铺底是一个图层，不是一个动作：同一时间只有一个铺底，垫在前景基本元素下面。
- `text-spectral-rays` 是 hero 文字标志的处理方式；不要在它上面再叠一份同一个词的可见副本。
