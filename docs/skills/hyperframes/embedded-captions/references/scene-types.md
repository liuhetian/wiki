<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/scene-types.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 场景类型 —— 选对模板

三个模板只在一件事上有区别：**文字在物理上坐落在什么表面上（如果有的话）**。要通过读场景来挑，而不是看类型标签。

## wall-embed —— "文字印在一个真实的表面上"

最初的 Memory Wall 渲染用的就是它。文字使用透视变换 + `mix-blend-mode: overlay`，看起来像是丝网印在主体身后的墙上。成功时幻觉很强，硬套时就完全崩坏。

### 四个条件 —— 必须**全部**满足

1. **画面中某处存在一个平整或接近平整的表面，并且比字幕块大。** 好的：吸音棉板、刷漆的墙、门、石材外立面、大块的背景幕布、黑板。不好的：书架（有 3D 纵深 + 装饰物）、麦克风防喷罩（太小）、窗户（透明，后面的内容会变化）、带砂浆纹路的砖墙（会抢戏）。
2. **表面与镜头之间有非零的夹角。** 透视才是让"嵌入"成立的关键。如果墙面完全平行（相对镜头 0° 旋转），把 rotateY:0 的文字贴上去看起来像贴纸，而不是嵌入。Memory Wall 的吸音棉墙倾斜了约 13° —— 完美。一个正面居中的主体正后方的墙，通常没有可利用的角度。
3. **表面是中等亮度。** Overlay 混合会中和中间调 —— 文字在中灰色的墙上能保持对比度。在接近黑色的表面上（亮度 < 60），overlay 会让文字消失 → 切换为 `mix-blend-mode: screen`。在接近白色的表面上（> 180），overlay 同样失效 → 切换为 `mix-blend-mode: normal` 并使用不透明颜色。
4. **表面上没有抢戏的图形内容。** 纯色涂漆、均匀的吸音棉、虚化的焦外背景都可以。印花墙纸、画框、招牌上的文字、杂乱的书架都会和字幕抢戏，毁掉嵌入的幻觉。

只要**任何一个**条件不满足，**就不要用 wall-embed**。换一个模板。

### memory-wall 是什么样的

主体右侧的吸音棉墙占了画面宽度的约 40%，朝观众倾斜约 13°，中灰色，均匀的凹凸纹理。完美。带 `rotateY(-13deg)` 和 overlay 混合的文字坐在上面，就像印上去的字母。

### 反例（wall-embed 会失败）

- **champion / demo1_avatarv** —— 书架背景，有书、白色花瓶、画框。杂乱 + 3D 纵深。不满足条件 1 和 4。改用了 corner-column-crown。
- **Jobs 60 Minutes** —— 虚化的盆栽背景。根本没有平整表面。不满足条件 1。
- **Randy Pausch "Time is all we have"** —— 全黑背景。没有可利用的透视，没有中间调表面。不满足条件 2 和 3。改用了 portrait-header。
- **任何手持拍摄的 vlog / 自拍** —— 表面逐帧移动，无法锁定透视。即使条件 1–4 短暂满足，运动也会打破幻觉。

## corner-column-crown —— "文字坐在主体旁边的干净区域里"

大多数口播内容的默认选择。在 wall-embed 行不通时适用。

### 条件

1. **单一主体，固定机位。** 如果漂移很小，手持也可以接受。
2. **主体左侧或右侧至少有一块干净区域（≥ 画面宽度的 15%）**，字幕可以放在那里而不会被身体持续遮挡。
3. **背景可以是杂乱的或有 3D 纵深的** —— 我们不依赖平整表面，只需要可读的对比度。Screen 混合模式会自然地吸收较暗的背景（书架、暗色墙面）。
4. **横屏宽高比**（16:9 或类似）。竖屏用 `portrait-header`。

### 什么时候加 crown，什么时候不加

- 如果有一句天然的"标题亮相"台词 —— 那句为故事落地的短语（例如 "WIMBLEDON CHAMPION"、"BEATLES"、"SHARP AGAIN"）—— 就加 crown。三个几何条件见 [layout-heuristics.md § Crown placement](layout-heuristics.md)。
- 对于没有哪句话承载高潮的事实性 / 中性独白，不加 crown。短视频（<10 秒）通常不需要它。

## portrait-header —— "主体占满中央，文字住在顶部横幅里"

用于主体不可避免地占满中间的 9:16 宽高比。

### 条件

1. **竖屏宽高比**（9:16、1080×1920 等）。
2. **主体占据画面垂直方向的中部**，顶部留出约 15–25% 画面高度的空白。
3. **底部可选 crown** —— 只有在主体腰部以下也有干净空间时才行得通，而这在近景竖屏里很少见。

### 要注意什么

- 主体头顶常常接近 y=40 —— 位于 `top: 30px` 的顶部横幅字幕会被头发部分遮挡。要么接受这种部分遮挡（它读起来就是嵌入），要么把字幕字号调小以避开头发。
- 如果主体已经带有**烧录字幕**（比如那个烧录了黄色字幕的测试案例），skill 应该拒绝 —— 两套字幕系统会互相抢戏。

## 快速决策流程

```
START
  │
  ├─ Aspect is 9:16 / portrait?
  │    ├─ YES → portrait-header
  │    └─ NO ──▼
  │
  ├─ Does the scene have a flat uniform surface that passes
  │  ALL 4 wall-embed conditions?
  │    ├─ YES → wall-embed
  │    └─ NO ──▼
  │
  ├─ Single subject + fixed camera + ≥15% clean zone on one side?
  │    ├─ YES → corner-column-crown
  │    └─ NO ──▼
  │
  └─ Refuse with reason:
     "No flat surface for embed, no clean caption zone for column.
      Suggest a classic lower-third instead."
```

## 模式检查清单（在决定用 wall-embed 之前跑一遍）

读 3 帧（开头、中间、结尾）。对每一帧，诚实地回答：

- [ ] 主体身后 / 旁边是否有一个占画面 ≥ 30% 的单一表面？
- [ ] 那个表面是否相对平整（不是弯曲的，也不是 3D 层叠的书架）？
- [ ] 那个表面与镜头之间的夹角是否在 5–20°（不是完全平行，也没有扭曲）？
- [ ] 表面是否是中等亮度（不像暗色书架那样接近黑色，也不像阳光照射的窗户那样接近白色）？
- [ ] 表面上是否**没有**任何会和字幕文字抢戏的印刷 / 装饰元素？
- [ ] 表面是否在全部 3 帧中都保持可见（主体没有走到它前面）？

**六项全部为 YES 才能用 wall-embed。** 哪怕只有一个 NO → 降级到 corner-column-crown 或 portrait-header。
