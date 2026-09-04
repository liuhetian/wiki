# 参考解法：只提交该提交的那部分

原关卡 `0-1-1` 设计时写的标准流程。

标准流程：1) cd cal 进入项目目录；2) git status 查看工作区状态（应看到 calc.py 已修改，test_calc.py、debug.log、__pycache__/ 为 untracked）；3) git add calc.py test_calc.py 只添加需要提交的文件；4) 创建 README.md 文件，写上项目说明；5) git add README.md 将 README 也加入暂存区；6) git commit -m '添加 add/multiply 函数、测试和项目说明' 提交；7) git push 推送到远程。关键教学点：git add 可以指定具体文件名，不一定要用 git add . ；提交前应该用 git status 确认哪些文件会被提交；不该提交的文件（日志、缓存）要排除在外。
