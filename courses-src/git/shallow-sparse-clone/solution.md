# 参考解法：浅克隆 + 稀疏检出，然后再把历史补回来

原关卡 `0-0-3` 设计时写的标准流程。

标准流程：1) 确认仓库地址：palette-ai.git；2) 浅克隆：git clone --depth 1 palette-ai.git；3) 进入目录：cd palette-ai；4) 开启 sparse-checkout：git sparse-checkout init --cone；5) 设置只检出 models 目录：git sparse-checkout set models；6) 确认 models 目录存在且 assets 等大目录不存在：ls；7) 查看 git log 发现只有一条记录（浅克隆的限制）；8) 恢复完整历史：git fetch --unshallow；9) 再次查看 git log --oneline，能看到全部7条提交历史，找到'你的色彩音乐理论灵感'那条记录。关键教学点：--depth 1 只下载最新快照，大幅减少传输量；sparse-checkout 让工作区只显示需要的目录；fetch --unshallow 可以在需要时补全历史，三者组合是处理大型仓库的标准策略。
