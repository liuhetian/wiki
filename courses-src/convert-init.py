#!/usr/bin/env python3
"""把 GAL-Git 关卡的 init.sh 机械转换成课程用的无 root 版本（一次性脚本，跑完留档）。

原脚本靠 root 建 Linux 用户、把裸仓库放 /srv/git、用 git daemon 发 git:// 地址；
课程要在普通账户下跑，统一换成「用户目录里的裸仓库 + file:// 远程」，公共动作抽进
docs/courses/git/assets/lib.sh。这里只做能机械判定的那部分（约九成），剩下的按关卡
逐个手改 —— 判据是 scripts/course-smoke.sh 能把 33 个脚本各跑两遍且退出码为 0。

heredoc 体一律不碰：正文里出现 $USER_WORKSPACE 之类只是巧合，替换会改坏教学内容。

用法：python3 courses-src/convert-init.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("/data/work/lht/study/26.03/gal-git/server/tasks")
DST = ROOT / "docs/courses/git/assets"

# 关卡 id → slug（体现考点，不带剧情）
SLUGS = {
    "0-0-0": "clone-basics",
    "0-0-1": "clone-into-dir",
    "0-0-2": "clone-branch-submodule",
    "0-0-3": "shallow-sparse-clone",
    "0-1-0": "add-commit-push",
    "0-1-1": "status-selective-add",
    "0-1-2": "discard-changes-gitignore",
    "1-0-0": "init-first-push",
    "1-0-1": "init-default-branch",
    "1-0-2": "dot-git-anatomy",
    "1-1-0": "rm-cached-unstage",
    "1-1-1": "reset-unpushed-commit",
    "1-1-2": "rm-vs-rm-cached",
    "2-0-0": "first-merge-conflict",
    "2-0-1": "conflict-order-matters",
    "2-0-2": "conflict-same-line",
    "2-0-3": "conflict-multi-file-binary",
    "2-1-0": "feature-branch-merge",
    "2-1-1": "two-parallel-branches",
    "2-1-2": "stash-switch-hotfix",
    "2-1-3": "stash-multiple-to-branch",
    "3-0-0": "amend-message",
    "3-0-1": "amend-files-reword",
    "3-0-2": "rebase-squash-fixups",
    "3-0-3": "rebase-split-reorder",
    "4-0-0": "revert-pushed-commit",
    "4-0-1": "reset-soft-mixed",
    "4-0-2": "revert-chain-reset-hard",
    "4-0-3": "revert-merge-revert-revert",
    "4-1-0": "cherry-pick-single",
    "4-1-1": "cherry-pick-multi-ordered",
    "4-1-2": "cherry-pick-skip-conflict",
    "4-1-3": "cherry-pick-range-cross-repo",
}

HEREDOC = re.compile(r"<<-?\s*'?\"?([A-Za-z_][A-Za-z0-9_]*)'?\"?\s*$")
DROP = (
    re.compile(r'^\s*chown\b'),
    re.compile(r'safe\.directory'),
    # 注意：这两条在变量替换之后才判定，所以匹配的是替换后的名字
    re.compile(r'^\s*rm -rf .*"\$(REMOTE|WORK|EXTERNAL)"'),
    re.compile(r'^\s*mkdir -p "\$(REMOTE|EXTERNAL)"\s*$'),
    re.compile(r'^\s*USER_HOME=\$\(getent'),
    re.compile(r'^\s*PUBLIC_REPO_URL='),
    re.compile(r'^\s*EXTERNAL_REPO_URL='),
    re.compile(r'^\s*git remote add origin "\$(PUBLIC_REPO|REMOTE)"\s*$'),
    re.compile(r'^\s*git -C "\$WORK" config user\.(email|name)'),
    re.compile(r'^\s*git config user\.(email|name) "\$\{?STU_USER'),
    re.compile(r'^\s*cd "\$TEMP_DIR"\s*$'),
    re.compile(r'^\s*cd "\$TEMP_REMOTE"\s*$'),
    re.compile(r'^\s*git init --initial-branch=main\s*$'),
    re.compile(r'^\s*git clone "\$REMOTE" \.\s*$'),
    re.compile(r'^\s*rm -rf "\$(TEMP_DIR|TEMP_REMOTE)"\s*$'),
)

IDENTITY = {
    "项目经理": "maintainer",
    "岑宁": "colleague",
}


def strip_header(lines):
    """砍掉建用户那一段：从 #!/bin/bash 到 chpasswd（含）。"""
    for i, line in enumerate(lines):
        if "chpasswd" in line:
            return lines[i + 1:]
    # 没有 chpasswd 的（理论上不存在）就只砍 shebang 与 set -e
    return [x for x in lines if not x.startswith("#!") and x.strip() != "set -e"]


def subst(line):
    """变量与前缀替换。摘要提示行也要过一遍，否则残留 $PUBLIC_REPO_URL。"""
    line = line.replace('sudo -u "$STU_USER" ', "")
    line = line.replace("$USER_WORKSPACE", "$WORK").replace("${USER_WORKSPACE}", "$WORK")
    line = line.replace("$PUBLIC_REPO_URL", "$REMOTE").replace("$PUBLIC_REPO", "$REMOTE")
    line = line.replace("$EXTERNAL_REPO_URL", "$EXTERNAL").replace("$EXTERNAL_REPO", "$EXTERNAL")
    line = line.replace("${STU_USER}@bigrice.com", "you@example.com")
    line = line.replace('"$STU_USER"', '"you"').replace("$STU_USER", "you")
    return line.replace("$USER_HOME", "$ROOT/work")


def strip_tail(lines):
    """砍掉末尾的摘要 echo 段，返回 (正文, 原摘要里的提示行)。"""
    start = None
    for i, line in enumerate(lines):
        if re.match(r'^\s*echo "-{5,}', line) or "实验环境初始化成功" in line:
            start = i
            break
    if start is None:
        return lines, []
    hints = []
    for line in lines[start:]:
        m = re.match(r'^\s*echo "(提示|项目目录|公司仓库地址|外部仓库)[^"]*"', line)
        if m:
            hints.append(subst(line.strip()))
    return lines[:start], hints


def convert(task_id, text):
    slug = SLUGS[task_id]
    lines = strip_header(text.splitlines())
    lines, hints = strip_tail(lines)

    out = []
    repos = []          # 该课建了哪些裸仓库
    work_dir = None
    term = None         # 当前 heredoc 终止符
    unwrap = None       # 正在拆的 bash -c 包装的终止符

    for raw in lines:
        if unwrap is not None:                    # 拆 bash -c 包装：正文去转义，终止符去掉尾引号
            if raw.strip() in (unwrap + '"', unwrap):
                out.append(unwrap)
                unwrap = None
            else:
                out.append(raw.replace('\\"', '"'))
            continue

        if term is not None:                      # heredoc 体：原样保留
            out.append(raw)
            if raw.strip() == term:
                term = None
            continue

        line = raw

        # 先做整行判定，再做词替换
        if re.match(r'^\s*PUBLIC_REPO="/srv/git/(.+)\.git"', line):
            repos.append(re.match(r'^\s*PUBLIC_REPO="/srv/git/(.+)\.git"', line).group(1))
            continue
        if re.match(r'^\s*EXTERNAL_REPO="/srv/git/(.+)\.git"', line):
            repos.append(re.match(r'^\s*EXTERNAL_REPO="/srv/git/(.+)\.git"', line).group(1))
            continue
        m = re.match(r'^\s*USER_WORKSPACE="\$USER_HOME/(.+)"', line)
        if m:
            work_dir = m.group(1)
            out.append('WORK="$ROOT/work/%s"' % work_dir)
            continue
        if re.match(r'^\s*mkdir -p "\$PUBLIC_REPO" "\$EXTERNAL_REPO"', line):
            continue
        if re.match(r'^\s*git init -?-?bare.*\$(PUBLIC_REPO|EXTERNAL_REPO)', line.replace("--bare", "-bare")):
            var = "REMOTE" if "PUBLIC_REPO" in line else "EXTERNAL"
            name = repos[0] if var == "REMOTE" else repos[-1]
            out.append('%s=$(new_bare %s)' % (var, name))
            continue
        if re.match(r'^\s*(TEMP_DIR|TEMP_REMOTE)=\$\(mktemp -d\)', line):
            # 新建仓库还是克隆已有仓库（模拟别人推了新提交）？看紧随其后的源码行
            nxt = "".join(lines[lines.index(raw) + 1:lines.index(raw) + 4])
            out.append('tmp_clone "$REMOTE"' if "git clone" in nxt else 'tmp_init "$REMOTE"')
            continue
        if re.match(r'^\s*cd /(\s*&&\s*rm -rf "\$(TEMP_DIR|TEMP_REMOTE)")?\s*$', line):
            out.append("tmp_done")
            continue

        # 身份
        m = re.match(r'^\s*git config user\.name "(.+)"', line)
        if m and m.group(1) in IDENTITY:
            out.append("as %s" % IDENTITY[m.group(1)])
            continue
        if re.match(r'^\s*git config user\.email "(manager|cenning)@bigrice\.com"', line):
            continue

        # 原脚本用 sudo -u ... bash -c "cat > '...' <<'X'" 以学生身份写文件，
        # 为了穿过双层引号，正文里的 " 全被转义成 \"。无 root 后这层包装可以整个拆掉。
        m = re.match(r'''^\s*sudo -u "\$STU_USER" bash -c "cat > '([^']+)' (<<-?\s*'?\w+'?)\s*$''', line)
        if m:
            wrapped = m.group(2).strip()
            out.append('cat > "%s" %s' % (subst(m.group(1)), wrapped))
            unwrap = re.sub(r'''[<'"-]''', "", wrapped)
            continue

        line = subst(line)

        if any(p.search(line) for p in DROP):
            continue

        # clone 到工作目录
        m = re.match(r'^\s*git clone "\$REMOTE" "\$WORK"\s*$', line)
        if m:
            out.append('work_clone "$REMOTE"')
            continue

        out.append(line)
        m = HEREDOC.search(line)
        if m:
            term = m.group(1)

    body = out

    header = [
        "#!/bin/bash",
        "# TODO: 补一句这一课造的是什么现场（原关卡 %s）" % task_id,
        'source "$(dirname "$0")/../lib.sh"',
        "course_setup %s" % slug,
        "",
    ]
    tail = ["", 'summary "$WORK"' + "".join(" \\\n    " + h.replace("echo ", "") for h in hints)]
    if work_dir is None:
        tail = ["", 'summary "$ROOT/work"']

    text = "\n".join(header + body + tail) + "\n"
    text = re.sub(r"\n{3,}", "\n\n", text)
    return slug, text


def main() -> int:
    DST.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:] or sorted(SLUGS)
    for task_id in only:
        src = SRC / ("task" + task_id) / "init.sh"
        if not src.exists():
            print("✗ 缺少 %s" % src, file=sys.stderr)
            return 1
        slug, text = convert(task_id, src.read_text(encoding="utf-8"))
        out = DST / slug / "init.sh"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        out.chmod(0o755)
        print("%-8s → %s（%d 行）" % (task_id, slug, len(text.splitlines())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
