# 参考解法：clone 到指定目录：最后那个参数不是可选装饰

原关卡 `0-0-1` 设计时写的标准流程。

标准流程：1) 先确认仓库地址是 cal.git；2) 执行 git clone cal.git ~/projects/cal-review；3) 进入目录确认文件完整：cd ~/projects/cal-review && ls。关键点：git clone 的第二个参数可以指定克隆的目标目录名，这在实际工作中很常用，比如需要同时检出多个版本、或者按项目规范组织目录时。
