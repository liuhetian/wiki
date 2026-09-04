# 参考解法：默认分支名不是装饰：init 出来叫 master 怎么办

原关卡 `1-0-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd release-cards；2) 用 git init 初始化仓库；3) 检查当前分支名，若不是 main，则把当前分支改名为 main；4) git add README.md cards.txt publish.sh；5) git commit 完成首次提交；6) git remote add origin release-cards.git；7) git push -u origin main 把主分支推送到远程。关键教学点：从零建仓不只是'让 Git 接管文件'，还包括把仓库的基础结构命名对齐到团队约定，尤其是主分支名。
