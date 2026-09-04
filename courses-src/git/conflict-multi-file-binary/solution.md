# 参考解法：多文件冲突，其中一个是二进制

原关卡 `2-0-3` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd campaign-studio；2) 先尝试 git push，确认被远程拒绝；3) git pull 触发 landing.js、copy.txt 和 assets/hero.png 的多文件冲突；4) 阅读 README.md 确认上线要求：新版主视觉必须保留远程版本，文本内容要同时保留创意主题和风控提示；5) 手动编辑 landing.js 和 copy.txt，删除冲突标记并合并双方文本逻辑；6) 对二进制文件执行 git checkout --theirs assets/hero.png，整体采用远程的新版图片；7) git add landing.js copy.txt assets/hero.png；8) git commit 完成合并提交；9) git push。关键教学点：多个文件冲突要分类型处理，文本文件可以人工融合，二进制文件通常只能按 ours/theirs 选边。
