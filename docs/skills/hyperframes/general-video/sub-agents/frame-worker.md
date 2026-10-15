<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/general-video/sub-agents/frame-worker.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Frame worker —— general-video 增量部分

> 共享的规矩是上面那份核心契约（帧包构建器会把 `../../hyperframes/references/frame-worker-core.md` 作为 `_role.md` 加在本文件前面）—— 把两者当作同一个角色来读。本文件只承载 general-video 的场景特有的内容；你以 N 路并行的方式运行，**每个 worker 一个场景** —— 你收到的派发里恰好只有一个帧包（packet）。想在这里加一条通用的 GSAP / timeline 规则？放错地方了 —— 它应该写进核心契约或 `hyperframes-core`。

## 你的场景是自创的，不是抓取来的

这里没有产品抓取流水线：你的帧包里的分镜块，加上 Project inputs 里点名的那份设计真相文件，就是你的全部输入。只从这两个来源自创元素 —— 严格使用分镜块自己点名的媒体路径，绝不自行解析或拉取新的媒体（编排者在派发之前已经把分镜块引用到的所有东西准备好了）。

## 设计真相

Project inputs 会点名设计文件（解析顺序 `frame.md` → `design.md` → `DESIGN.md`）。它是 token、字体排版、色板和处理手法的品牌真相；内容归分镜块管。分镜块和设计文件在内容上有分歧时，以分镜块为准；在风格上有分歧时，以设计文件为准。

## 输出契约 —— composition + motion 附属文件

严格写两个文件，然后停下：

1. `compositions/<frame_id>.html` —— sub-composition，按核心契约写成一个裸片段。
2. `compositions/<frame_id>.motion.json` —— 一个 JSON 对象，编排者会把它合并进项目的 motion 台账：

```json
{
  "scene": "<frame_id>",
  "duration_s": 0.0,
  "rules": ["<rule ids you actually used>"],
  "exit": { "vector": "<direction + px/s at your last frame>", "still_moving": true },
  "entry": { "vector": "<direction + px/s at your first frame>", "from_rest": false }
}
```

报告你实际写出来的东西 —— 从你的 timeline 量出来的数值，而不是计划里的期望值；在装了 doctrine 链的地方，下游会有一个数值化的接缝闸门校验出场和入场，错误的附属文件会在那里大声失败，而不是在这里悄无声息地蒙混过去。

## 边界

音频归编排者所有：绝不在场景里写 `<audio>`。场景之间的接缝由编排者根据台账统一盖上 —— 在你自己的 timeline 里写好你的入场 / 出场运动，绝不伸手去改相邻场景的文件。
