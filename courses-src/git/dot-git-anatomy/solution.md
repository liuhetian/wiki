# 参考解法：掀开 .git 看一眼，然后把它删了再建回来

原关卡 `1-0-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd telemetry-probe；2) 用 git init 初始化仓库；3) 先通过 ls -a、查看 `.git/HEAD`、`.git/objects`、`.git/refs` 等方式观察仓库结构；4) 执行 ./accident.sh，模拟误删 `.git`，并确认此时 git status 已经不能识别该目录；5) 再次 git init 重新创建 `.git`；6) git add README.md collector.py notes.md；7) git commit 完成重建后的首次提交；8) git remote add origin telemetry-probe.git；9) git push -u origin main。关键教学点：项目文件本身不等于 Git 仓库；真正让目录拥有版本历史、引用关系和远程配置的，是隐藏的 `.git` 目录。
