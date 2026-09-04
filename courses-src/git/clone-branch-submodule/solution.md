# 参考解法：一条 clone 要同时拿对分支和子模块

原关卡 `0-0-2` 设计时写的标准流程。

标准流程：1) 检查 SSH 密钥：ls ~/.ssh/（发现已有 id_ed25519）；2) 确认仓库 SSH 地址：starnet.git；3) 克隆 dev 分支并递归子模块：git clone -b dev --recurse-submodules starnet.git；4) 进入项目确认：cd starnet && git branch（应显示 * dev）；5) 确认子模块：ls utils/（应有 utils.py 和 README.md）。关键教学点：SSH 协议提供加密和身份验证，是企业环境的标准做法；-b 参数指定克隆的分支；--recurse-submodules 确保子模块也被一并克隆。
