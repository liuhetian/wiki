#!/bin/bash
# 课程环境公共库 —— 所有 docs/courses/git/assets/<slug>/init.sh 都 source 它。
#
# 为什么需要这一层：原始关卡脚本靠 root 建 Linux 用户、把裸仓库放 /srv/git、
# 用 git daemon 发布 git:// 地址。课程要能在任何人的普通账户下跑，所以统一改成
# 「用户目录里的裸仓库 + file:// 远程」。三件事必须保证：
#
#   1. 可重复运行 —— 每次 course_setup 都把该课的目录整个删掉重建；
#   2. 不污染真实环境 —— 脚本执行期间 GIT_CONFIG_GLOBAL 指向沙箱文件，
#      不碰 ~/.gitconfig；工作副本的身份写成仓库局部配置，你后续手敲命令照常生效；
#   3. 预置历史的 commit hash 确定 —— 作者/提交时间由 tick 从固定基准递推，
#      所以课程里可以直接问「那个 commit 的 hash 是多少」。
#
# 用法见任意一个 init.sh；环境位置由 COURSE_ROOT 控制，默认 ~/courses/git。

set -euo pipefail

# 2026-01-01 09:00:00 +0800，每次 tick 前进 60 秒
COURSE_EPOCH=1767229200

course_setup() {
    COURSE_SLUG="$1"
    COURSE_ROOT="${COURSE_ROOT:-$HOME/courses/git}"
    ROOT="$COURSE_ROOT/$COURSE_SLUG"

    rm -rf "$ROOT"
    mkdir -p "$ROOT/remotes" "$ROOT/work"

    # 沙箱全局配置：只在脚本执行期间生效，不写 ~/.gitconfig
    export GIT_CONFIG_GLOBAL="$ROOT/gitconfig"
    cat > "$GIT_CONFIG_GLOBAL" <<'EOF'
[init]
	defaultBranch = main
[pull]
	rebase = false
[advice]
	detachedHead = false
EOF

    COURSE_TS="$COURSE_EPOCH"
    as maintainer
}

# 时间前进一格。每次 commit 前调用，保证历史顺序稳定且 hash 可复现。
tick() {
    COURSE_TS=$((COURSE_TS + 60))
    export GIT_AUTHOR_DATE="@$COURSE_TS +0800"
    export GIT_COMMITTER_DATE="@$COURSE_TS +0800"
}

# 切换提交身份：maintainer（项目维护者）/ colleague（同事）/ you（你自己）
as() {
    case "$1" in
        maintainer) export GIT_AUTHOR_NAME="maintainer" GIT_AUTHOR_EMAIL="maintainer@example.com" ;;
        colleague)  export GIT_AUTHOR_NAME="colleague"  GIT_AUTHOR_EMAIL="colleague@example.com" ;;
        you)        export GIT_AUTHOR_NAME="you"        GIT_AUTHOR_EMAIL="you@example.com" ;;
        *) echo "as: 未知身份 $1" >&2; return 1 ;;
    esac
    export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME" GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
}

# git 包装：凡是会产生 commit 对象的子命令，先把时间推一格。
# 这样每个 init.sh 不用逐条手写日期，预置历史的 hash 依然确定。
git() {
    local a
    for a in "$@"; do
        case "$a" in
            commit|merge|rebase|cherry-pick|revert|stash|tag|am) tick; break ;;
        esac
    done
    command git "$@"
}

# 建一个裸仓库当远程，回显它的 file:// URL。
# 必须用 file:// 而不是裸路径：本地路径克隆会走 hardlink 捷径，--depth 被忽略。
new_bare() {
    local name="$1"
    git init -q --bare --initial-branch=main "$ROOT/remotes/$name.git"
    echo "file://$ROOT/remotes/$name.git"
}

# 临时工作区：造预置历史用，造完即弃
tmp_init() {   # tmp_init <远程URL> —— 新建仓库并接上远程
    COURSE_TMP=$(mktemp -d)
    cd "$COURSE_TMP"
    git init -q --initial-branch=main
    git remote add origin "$1"
}

tmp_clone() {  # tmp_clone <远程URL> —— 克隆已有仓库（模拟别人推了新提交）
    COURSE_TMP=$(mktemp -d)
    cd "$COURSE_TMP"
    git clone -q "$1" .
}

tmp_done() {
    cd /
    rm -rf "$COURSE_TMP"
}

# 克隆到你的工作目录，并把身份写成仓库局部配置（脚本退出后你手敲命令照常用）
work_clone() {  # work_clone <远程URL> [目录名]
    local url="$1" dir="${2:-}"
    cd "$ROOT/work"
    git clone -q "$url" ${dir:+"$dir"}
    cd "$(basename "${dir:-$(basename "${url%.git}")}")"
    git config user.name "you"
    git config user.email "you@example.com"
    git config pull.rebase false
}

# 不走 clone 的课（本地 git init）用它，效果同上
work_config() {
    git config user.name "you"
    git config user.email "you@example.com"
    git config pull.rebase false
}

summary() {   # summary <工作目录> [提示行...]
    local workdir="$1"; shift
    echo "export GIT_CONFIG_GLOBAL=\"$GIT_CONFIG_GLOBAL\"" > "$ROOT/env.sh"
    echo "------------------------------------------------"
    echo "环境就绪：$COURSE_SLUG"
    echo "工作目录：cd $workdir"
    for line in "$@"; do echo "$line"; done
    # 这一行不是可选装饰：有几课（init-default-branch / init-first-push / dot-git-anatomy）
    # 靠沙箱里的 git 全局配置造现场，不 source 就复现不出来。其余课 source 了也只是
    # 顺带保护你自己的 ~/.gitconfig 不被课程里的 git config --global 写脏。
    echo "先执行：source $ROOT/env.sh"
    echo "重跑本脚本会把这一课的环境整个重置。"
}
