# 参考解法：第一次把改动交上去：add、commit、push 各管一段

原关卡 `0-1-0` 设计时写的标准流程。

标准流程：1) cd cal 进入项目目录；2) git status 查看修改状态（应该显示 calc.py 被修改）；3) git add calc.py 将修改加入暂存区；4) git commit -m '实现 add 函数' 提交修改；5) git push 推送到远程。关键教学点：Git 的提交流程是 status → add → commit → push，其中 add 是'选择要保存的文件'，commit 是'打包保存'，push 是'上传到服务器'。
