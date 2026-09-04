# 参考解法：把暂存区清干净、把文件改回去、再让它们别再来

原关卡 `0-1-2` 设计时写的标准流程。

标准流程：1) cd cal 进入项目；2) git status 查看当前状态（应看到大量已暂存的修改和工作区修改）；3) git reset HEAD .env __pycache__/ 把不该提交的文件从暂存区移除；4) git checkout -- config.py 从暂存区恢复 config.py 工作区的乱码（暂存区里是正确版本）；5) 创建 .gitignore 文件，写入 .env、__pycache__/、*.log 等忽略规则；6) git add .gitignore 把 .gitignore 也加入暂存区；7) git status 再次确认暂存区只有正确的文件；8) git commit -m '添加计算函数、测试和 gitignore 配置' 提交；9) git push 推送。关键教学点：git reset HEAD <file> 可以把文件从暂存区移回工作区（撤销 add）；git checkout -- <file> 可以从暂存区恢复工作区的文件；.gitignore 可以永久忽略不需要追踪的文件。
