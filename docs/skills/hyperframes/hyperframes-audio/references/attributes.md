<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-audio/references/attributes.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 三个音频属性

三个属性都挂在 `<audio>` / `<video>` 元素本身上，以 JSON 编码，所以一个 composition 的整个混音都装在 HTML 里，旁边不需要加载任何东西。`data-fx-chain` 和 `data-automation` 也可以挂在 `<hf-audio-group>` 总线上，在那里它们对叠加后的成员表达同样的含义——只有一个值得知道的区别：组的自动化运行在 COMPOSITION 时间上，因为总线自己没有 `data-start`。`data-fx-carve` 只能用在 clip 上；总线没有挖空。没有任何静态检查会校验它们：预览会把无法读取的效果链以干声播放，以保持可用；而渲染会拒绝整个混音，而不是交付一条听起来像那么回事、实际却是错的干声 track。

## `data-fx-chain`——效果

```json
{
  "version": 1,
  "nodes": [
    {
      "type": "highpass",
      "id": "n1",
      "label": "Remove Rumble",
      "params": { "frequency": 120, "q": 0.707, "poles": "2" }
    },
    {
      "type": "peaking",
      "id": "n2",
      "fromCarve": true,
      "params": { "frequency": 1600, "gain": -6, "q": 1.4 }
    },
    {
      "type": "limiter",
      "id": "n3",
      "enabled": false,
      "params": { "limit": -1, "attack": 5, "release": 50, "level_out": 0 }
    }
  ]
}
```

**这些属性要用双引号写，JSON 自己的引号写成 `&quot;`。** 浏览器通过 `getAttribute` 读取它们，并不在乎这一点，但 `scripts/carve.mjs` 是用一个 `name="..."` 正则来找它们的，所以单引号的属性对它来说是不可见的——挖空会报告没有现有的效果链，然后悄悄覆盖掉它看不见的工作。`&` 写成 `&amp;`；其他都不需要转义。

- **顺序就是信号顺序。** 每个节点处理的是前一个节点产出的东西。
- `type` 是 registry 里的一个效果 id。`params` 使用人们习惯思考的单位——dB、ms、Hz——超出范围的值会在读取时被钳制，所以一条能解析的效果链总是可以安全地实现。
- `id` 是一个稳定的句柄。自动化按 id 寻址节点，从不按位置，所以重新排列效果链不会让一条 lane 改指向另一个效果。没有 id 的节点可以正常加载，但不能被自动化。手写效果链时，任何唯一的字符串都可以；Studio 会依次分配第一个空闲的 `n1`、`n2`……所以遵循这个约定，能让手写的效果链和编辑过的效果链看起来一致。
- `label` 是效果架对这个节点的称呼，替换掉效果自己的名字。只要节点在做一个具名任务，就写上一个——否则一条带两个 `peaking` 节点的效果链会把同一行显示两遍，作者分不清哪个是去浑浊的切、哪个是提清晰度的提升。Preset 和具名任务总是会设置它；手写的节点也应该设置。它们使用的名称见 `presets.md`。
- `enabled: false` 是旁通——节点留在效果链里，但脱离信号路径。不写就表示启用。
- `fromCarve: true` 标记由挖空分析生成的节点。重新运行挖空会恰好替换这些节点，而不动手动搭建的效果。**不要手动设置它**：这样标记的节点会被下一次挖空删掉。

## `data-automation`——包络

```json
{
  "version": 1,
  "lanes": [
    {
      "target": "volume",
      "points": [
        { "t": 0, "v": 1 },
        { "t": 2.5, "v": 0.4 }
      ]
    },
    {
      "target": "fx.n2.gain",
      "points": [
        { "t": 0, "v": 0 },
        { "t": 1, "v": -6, "curve": 0.4 }
      ]
    }
  ]
}
```

- `target` 是 `volume`（track 自身的电平），或者 `fx.<nodeId>.<param>`。
- `t` 是**从 clip 开头算起的秒数**，而不是从 composition 开头。一条从 `data-start="8"` 开始的垫乐，它的 `t: 0` 位于 composition 时间 8。
- `v` 使用参数自身的单位：增益用 dB，频率用 Hz，音量用 0..1。
- 一条 lane 会把它的第一个值向前保持到 clip 开头，把最后一个值向后保持到结尾。所以一条比人声更早开始的垫乐需要在 `t: 0` 处有一个明确的"不切"点，否则它一开始就已经处于闪避状态。
- `curve`（-1..1）弯曲的是*离开*某个点的那一段：正值先保持在低处，然后较晚才升起。`viaX`/`viaY` 指定该段经过的一个内部点（进度 0..1，已走过的值 0..1），两者同时存在时它们会取代 `curve`——在 timeline 上拖动弯曲时写入的就是这个。
- 每条 lane 最多 512 个点。
- 节点已不存在的 lane 会在读取时被剪掉，而不是报错。

**放在不可自动化参数上的 lane 会悄无声息地失效。** 自动化是以原生 `AudioParam` 调度的方式下发的，所以背后没有 `AudioParam` 的旋钮动不了：worklet 处理器选项、WaveShaper 曲线和卷积脉冲都是整体设置的。`fx-registry.md` 标注了每一个参数；四个 worklet 效果（`compressor`、`limiter`、`gate`、`bitcrush`）一个都没有。

## `data-fx-carve`——挖空的设置

```json
{ "enabled": true, "sources": ["narration", "interview-guest"], "strength": 0.35 }
```

- `sources` 是**这条垫乐要为之让出空间的每一条人声的元素 id**。它们挂在被处理的垫乐上，而不是在人声上。分析之前会被叠加到垫乐的时钟上，所以一组滤波器和包络就覆盖了全部人声。
- `strength` 0..1 推导出整套机制（见 `carveProfile`）。
- 没有 `dynamic`：挖空总是跟随语音。
- `enabled` 表示挖空是否生效。它之所以存在，是因为恰好只有一个候选人声的垫乐会被默认挖空：如果用"属性不存在"来表示"关闭"，那么关掉它就会被读成从未配置过，默认行为又会把它加回来。`enabled: false` 保留设置，并停止挖空。

这个属性在播放时不会被读取——真正播放的是它生成的效果链和 lane。它的存在是为了让设置可以被读回并重新推导，而不是从滤波器里去猜，这正是能够在已有的挖空上修改强度的原因。

较早的项目可能带的是六个机制数值（`maxCutDb`、`bands`、`q`、`intelligibilityBias`、`duckDb`、`headroomDb`），而不是 `strength`。它们仍然能加载：深度会映射回一个强度值，其余的一切重新推导。没有 `enabled` 的已存储挖空读作开启，单个 `source` 读作只有一条人声的 `sources` 列表。已存储的 `dynamic` 会被忽略——现在每个挖空都跟随语音。
