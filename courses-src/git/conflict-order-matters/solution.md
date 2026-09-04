# 参考解法：顺序敏感的冲突：把两半拼起来会拼出重复调用

原关卡 `2-0-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd notifier-service；2) 先尝试 git push，看到远程拒绝；3) 执行 git pull 触发 notifier.py 冲突；4) 阅读冲突内容和注释，理解本地新增的是 sign_message，远程新增的是 validate_message；5) 手动编辑 dispatch 函数，按 validate -> normalize -> sign -> deliver 的顺序保留四步，并删除所有冲突标记；6) git add notifier.py；7) git commit 完成合并提交；8) git push。关键教学点：顺序敏感的冲突不能靠机械保留两边完成，必须结合业务语义决定最终排列。
