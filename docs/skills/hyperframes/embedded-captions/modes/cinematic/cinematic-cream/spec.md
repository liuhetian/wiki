# cinematic-cream —— 规范

权威规范在 [template.html](template.html) 的头部注释里（只讲 DNA：哪些是 LOCKED（锁定）、哪些是 OPEN（开放），LAYOUT/planes 契约，READING ORDER（阅读顺序）+ hand-off（交接），hero 尺寸）。编写 plan.json 之前先读那段头部注释。简要契约：

- LOCKED：Inter、soft/present 动效、暖奶油色色板、screen 混合、阴影逻辑。
- 每个 group 开放（OPEN，css 字段）：size/weight/style/transform/spacing + 在某个 plane 内部的位置。
- LAYOUT：先跑 scripts/safe-zones.cjs。旁白 plane 要紧贴（HUG）人物轮廓 —— 用 zones.hugLeft/hugRight（与主体边缘保持 2-6% 的间隙）；停在远角的 plane 读起来是脱节的漂浮文字，而不是嵌入。唯一的那个 hero 保持大尺寸（~0.22-0.34·h），居中压在主体上（heroAnchor / heroBands.best），目标遮挡约 30-55%。fg 是最后手段：只在 heroBands.feasible=false（没有 ≤62% 的横带）时使用。hero 大尺寸（~0.22-0.34·h），居中压在主体上（heroAnchor），目标遮挡约 30-55%。
- plan.json：groups[] 带逐词的转录时间（用 scripts/fill-timings.cjs），用 scripts/fit-fonts.cjs 适配字号，用 scripts/make-composition.cjs 编译。
