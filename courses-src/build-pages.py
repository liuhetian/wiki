#!/usr/bin/env python3
"""生成 docs/courses/git/ 下的 33 个课程页与分类索引。

页面正文（场景 / 任务 / 提问）写在下面的 LESSONS 表里而不是散在 33 个 md 文件里，
一是保证 33 页结构完全一致，二是改模板（比如给每课加一道固定题）只动一处。
验收清单从 story.json 的 check 字段脱水而来，但路径与 URL 已换成课程环境的说法。

原关卡的标准解法不发布 —— 它是答案。归档进 courses-src/git/<slug>/，
scripts/course.py add 时才作为折叠的「参考解法」附进笔记。

用法：python3 courses-src/build-pages.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("/data/work/lht/study/26.03/gal-git/server/tasks")
DOCS = ROOT / "docs/courses/git"
ARCHIVE = ROOT / "courses-src/git"

CHAPTERS = [
    ("先用起来", "不问原理，先把 clone / add / commit / push 跑通，建立最朴素的直觉"),
    ("三个区与 .git", "工作区、暂存区、仓库各自是什么；.git 里到底放着什么"),
    ("和别人一起改", "冲突、分支、stash —— 多人同时动同一份代码时的全部日常"),
    ("整理历史", "把写歪的提交改回该有的样子：amend 与交互式 rebase"),
    ("救火", "已经推出去了怎么办：revert、reset，以及从别处把提交搬过来"),
]

# slug: (chapter, task_id, 标题, 目标, 钩子, 场景, 任务列表, 验收列表, 本课特有提问)
L = {}


def lesson(slug, ch, tid, title, goal, hook, scene, tasks, checks, asks):
    L[slug] = dict(chapter=ch, task_id=tid, title=title, goal=goal, hook=hook,
                   scene=scene, tasks=tasks, checks=checks, asks=asks)


# ---------------------------------------------------------------- 第 1 章
lesson(
    "clone-basics", 0, "0-0-0",
    "clone 的第一课：仓库地址不在 GitHub 上",
    "把一个远程仓库拉到本地",
    "Git 不等于 GitHub，远程可以是任意一个能访问到的路径",
    "`cal` 项目已经存在于一个远程仓库里，但它不在 GitHub 上。你手上只有 `init.sh` "
    "末尾打印的那个地址，工作目录里现在什么都没有。",
    ["把 `cal` 项目克隆到 `$ROOT/work/` 下。"],
    ["`work/cal/.git` 存在", "`work/cal` 的 `origin` 指向 init.sh 打印的那个 `file://` 地址",
     "`README.md` 与 `calc.py` 都在"],
    [("clone 到底做了什么",
      "`git clone` 之后 `work/cal` 里多了哪些东西？`git remote -v`、`git branch -a`、"
      "`git log --oneline` 分别输出什么？贴原文。"),
     ("远程地址的形态",
      "这次的远程地址是 `file://...`。它和 `https://github.com/...`、`git@github.com:...` "
      "在 git 眼里是同一类东西吗？说出你的判断依据（`git remote -v` 的输出能支持你的说法吗）。")],
)

lesson(
    "clone-into-dir", 0, "0-0-1",
    "clone 到指定目录：最后那个参数不是可选装饰",
    "控制克隆的落点，而不是接受默认目录名",
    "默认落点是仓库名，要落到别处就得自己指定",
    "要做代码审查，规矩是把项目放在 `work/projects/cal-review/` 下，"
    "而不是默认的 `work/cal/`。`work/projects/` 已经建好了。",
    ["把项目克隆到 `work/projects/cal-review`，一步到位，不要先克隆再改名。"],
    ["`work/projects/cal-review/.git` 存在", "`work/cal` **不存在**（没有克隆到默认位置）",
     "`README.md`、`calc.py`、`tests/test_calc.py`、`docs/guide.md` 都在"],
    [("目录参数的位置",
      "你用的完整命令是什么？那个目录参数写在哪个位置、能不能省略中间的仓库地址？"
      "如果目标目录已经存在且非空，git 会怎么反应（可以真的试一次）？")],
)

lesson(
    "clone-branch-submodule", 0, "0-0-2",
    "一条 clone 要同时拿对分支和子模块",
    "用一条命令拿到非默认分支 + 子模块内容",
    "默认分支不是你要的分支，子模块默认是空目录，两件事一条命令解决",
    "`starnet` 项目的训练脚本只在 `dev` 分支上，`utils/` 是一个子模块。"
    "直接 `git clone` 拿到的是 `main`，而且 `utils/` 会是个空目录。\n\n"
    "（原关卡还要求先配 SSH 才连得上，那部分依赖 sshd 与 root，本地跑不了，已经去掉。）",
    ["先 `source $ROOT/env.sh` —— 这一课的子模块走 `file://`，需要沙箱配置里的 "
     "`protocol.file.allow`（git 2.38.1 起默认禁止，CVE-2022-39253）",
     "用**一条** clone 命令，把 `dev` 分支和子模块内容一次拿全，落到 `work/starnet`"],
    ["`work/starnet` 当前分支是 `dev`（`git branch` 显示 `* dev`）",
     "`work/starnet/train.py` 存在（这是 dev 分支特有的文件）",
     "`work/starnet/utils/utils.py` 存在且**有内容**（不是空目录）"],
    [("两个参数分别管什么",
      "你的完整命令是什么？其中哪个参数管分支、哪个管子模块？"),
     ("不带参数会怎样",
      "另外克隆一份、什么参数都不带，对比两份的 `git branch`、`ls utils/`、"
      "`cat .gitmodules`。子模块那个「空目录」在 git 眼里是什么状态（`git submodule status` 说什么）？")],
)

lesson(
    "shallow-sparse-clone", 0, "0-0-3",
    "浅克隆 + 稀疏检出，然后再把历史补回来",
    "只拿需要的那部分，事后再补全历史",
    "`--depth` 省历史、`sparse-checkout` 省目录、`--unshallow` 再把历史要回来",
    "`palette-ai` 仓库里 `assets/` 占了绝大部分体积，你只需要 `models/` 下的代码。"
    "但仓库历史里有一条很早的灵感笔记提交要翻出来看，所以历史最后还是得补全。",
    ["浅克隆到 `work/palette-ai`（注意：远程是 `file://` 地址，写成裸路径的话 git 会走本地捷径、`--depth` 会被忽略）",
     "用 sparse-checkout 只检出 `models/`",
     "最后把完整历史补回来，能看到全部 7 条提交"],
    ["`work/palette-ai/models/` 下有 `generator.py`、`train.py`、`discriminator.py`、`creative_notes.md`",
     "`git log --oneline` 能看到全部 7 条提交（说明已经 unshallow）",
     "`assets/` 没有被检出"],
    [("三步各省了什么",
      "分别贴出：浅克隆刚完成时的 `git log --oneline | wc -l`、`du -sh .git`、`ls`；"
      "sparse-checkout 之后的 `ls`；unshallow 之后的 `git log --oneline | wc -l`、`du -sh .git`。"
      "三步各自省掉的是什么？"),
     ("为什么必须写 file://",
      "把远程地址写成裸路径再浅克隆一次，`git log --oneline | wc -l` 是多少？"
      "为什么本地路径克隆时 `--depth` 不起作用？")],
)

lesson(
    "add-commit-push", 0, "0-1-0",
    "第一次把改动交上去：add、commit、push 各管一段",
    "把本地改动送到远程，理解中间隔着几道门",
    "从工作区到远程要过三道门，`add`/`commit`/`push` 各管一道",
    "`work/cal` 已经克隆好了，`calc.py` 里的 `add` 函数也已经写完。"
    "现在这份改动只存在于你的磁盘上，远程仓库还不知道它的存在。",
    ["把 `calc.py` 的改动提交并推到远程 `main`。"],
    ["`git status` 干净", "`git log --oneline` 最新一条是你的提交",
     "`git log origin/main --oneline` 能看到同一条（说明真的推上去了）"],
    [("三道门",
      "在 `add` 之前、`add` 之后、`commit` 之后各跑一次 `git status`，三次输出分别是什么？"
      "同一个文件在这三个时刻分别处于什么状态？"),
     ("push 之前和之后",
      "`commit` 之后、`push` 之前，`git log --oneline --all --decorate -3` 里 `main` 和 "
      "`origin/main` 分别指向哪一条？push 之后呢？")],
)

lesson(
    "status-selective-add", 0, "0-1-1",
    "只提交该提交的那部分",
    "看懂 status，然后有选择地 add",
    "先读 status 再决定谁进这次提交，`git add .` 是最容易犯的错",
    "工作区里堆了好几样东西：改过的 `calc.py`、新写的 `test_calc.py`、"
    "跑出来的 `debug.log`、还有 `__pycache__/` 缓存目录。另外 README 还没写。",
    ["补一个 `README.md`",
     "只把 `calc.py`、`test_calc.py`、`README.md` 提交上去",
     "`debug.log` 和 `__pycache__/` 不要进版本库"],
    ["最新提交里包含 `calc.py`、`test_calc.py`、`README.md`",
     "`git log --all --name-only` 里没有 `debug.log`、没有 `__pycache__`",
     "`debug.log` 与 `__pycache__/` 这两个文件本身还留在磁盘上"],
    [("status 的三段",
      "`git status` 的原始输出贴出来。它把文件分成了几组？每组的标题行原文是什么、"
      "分别意味着什么？"),
     ("选择性 add",
      "你是怎么只加进那三个的？如果先 `git add .` 再往回退，退的命令是什么、"
      "文件会不会被删掉？")],
)

lesson(
    "discard-changes-gitignore", 0, "0-1-2",
    "把暂存区清干净、把文件改回去、再让它们别再来",
    "撤销误加与误改，并用 .gitignore 兜住",
    "「从暂存区移走」和「把文件改回去」是两条不同的命令，别记混",
    "上午写完了 `add` 和 `divide` 还有测试，出门前顺手 `git add .` 把所有东西都加进了暂存区 —— "
    "包括带数据库密码的 `.env` 和 `__pycache__/`。回来发现 `config.py` 里还被压出了一串乱码。",
    ["把 `.env` 和 `__pycache__/` 从暂存区移走（文件留在本地）",
     "把 `config.py` 的乱码改回去",
     "写 `.gitignore` 让它们不再被误加",
     "正确提交并推送"],
    ["最新提交包含 `calc.py`（有 `add` 与 `divide`）和 `test_calc.py`",
     "`config.py` 里没有乱码",
     "`git log --all --name-only` 中没有 `.env`、没有 `__pycache__`",
     "`.gitignore` 存在且至少忽略 `.env` 与 `__pycache__`",
     "`git status` 干净，改动已 push"],
    [("移走 vs 改回去",
      "你用了哪两条不同的命令分别处理「从暂存区移走」和「把工作区改回去」？"
      "把它们对调会发生什么（可以在别的文件上真的试一次）？"),
     (".gitignore 的作用边界",
      "写完 `.gitignore` 之后，已经在暂存区里的文件会自动消失吗？"
      "用 `git status` 的输出证明你的答案。")],
)

# ---------------------------------------------------------------- 第 2 章
lesson(
    "init-first-push", 1, "1-0-0",
    "从普通目录跨进 Git 仓库",
    "把一个普通文件夹变成仓库，并完成第一次推送",
    "仓库身份不是天生的，是那个隐藏的 `.git` 给的",
    "`work/morning-notes/` 里 `README.md` 和 `notes.txt` 都写好了，"
    "但这个目录现在只是个普通文件夹。远程那边已经准备了一个空仓库。",
    ["先 `source $ROOT/env.sh`（这一课要用沙箱里的 git 全局配置）",
     "把目录初始化成 Git 仓库，完成第一次提交，推到远程 `main`"],
    ["`work/morning-notes/.git` 存在", "`README.md` 与 `notes.txt` 都已提交，`git status` 干净",
     "当前分支是 `main`", "`origin` 指向 init.sh 打印的地址",
     "`git log origin/main --oneline` 能看到这条初始提交（不是只有本地 commit）"],
    [("init 之后多了什么",
      "`git init` 前后各跑一次 `ls -a`，差别是什么？`.git` 刚建好时里面有哪几项（`ls .git`）？"
      "这时候 `git log` 说什么？"),
     ("空仓库怎么接上",
      "远程是个空仓库，你是怎么把本地和它接上的？`git remote add` 之后、push 之前，"
      "`git branch -a` 输出是什么？push 之后又多了什么？")],
)

lesson(
    "init-default-branch", 1, "1-0-1",
    "默认分支名不是装饰：init 出来叫 master 怎么办",
    "从零建仓，并把主分支控制成 main",
    "`init.defaultBranch` 决定你 init 出来叫什么；团队约定决定你该叫什么",
    "`work/release-cards/` 里三个文件都准备好了，但这一课的沙箱 git 配置故意把 "
    "`init.defaultBranch` 设成了 `master`。团队要求本地和远程主分支都必须是 `main`。",
    ["先 `source $ROOT/env.sh` —— 不 source 就复现不出这个现场",
     "初始化仓库、提交、把主分支变成 `main`，并推到远程 `main`"],
    ["`work/release-cards/.git` 存在", "当前分支是 `main`",
     "`README.md`、`cards.txt`、`publish.sh` 都已提交，`git status` 干净",
     "远程有 `main` 分支且包含这次提交，**没有**多出一个 `master` 分支"],
    [("init 出来叫什么",
      "`git init` 之后 `git branch` 说什么？`cat .git/HEAD` 又是什么？"
      "这个名字是从哪来的（`git config --get init.defaultBranch` 试试）？"),
     ("改名的两种时机",
      "分支改名你用的是哪条命令？如果先推错了名字再改，远程会不会自动跟着改？"
      "用 `git branch -a` 的输出说明。")],
)

lesson(
    "dot-git-anatomy", 1, "1-0-2",
    "掀开 .git 看一眼，然后把它删了再建回来",
    "看清 .git 的结构，体验仓库身份丢失与重建",
    "删掉 `.git` 之后文件都还在，丢的是身份，以及全部历史",
    "`work/telemetry-probe/` 是个普通目录，里面还放了一个 `accident.sh`，"
    "运行它会把 `.git` 删掉。",
    ["先 `source $ROOT/env.sh`",
     "把目录初始化成仓库并提交",
     "观察 `.git` 里的 `HEAD`、`objects/`、`refs/`",
     "运行 `./accident.sh` 模拟误删",
     "重新建仓、提交、推送到远程"],
    ["`work/telemetry-probe/.git` 存在", "文件都已提交，`git status` 干净",
     "`origin` 指向 init.sh 打印的地址，远程 `main` 上有提交"],
    [("HEAD / objects / refs 各是什么",
      "第一次提交之后，`cat .git/HEAD`、`ls .git/refs/heads/`、`cat .git/refs/heads/main`、"
      "`find .git/objects -type f | head` 分别是什么？把 HEAD → refs → object 这条链走一遍，"
      "并用 `git cat-file -p <hash>` 把那条链上的对象都打印出来。"),
     ("删掉 .git 丢了什么",
      "运行 `accident.sh` 之后，`ls` 和 `git status` 分别是什么？文件还在吗？历史还在吗？"),
     ("重建之后的历史",
      "重新 init 并提交之后，`git log --oneline` 有几条？和删之前一样吗？为什么？")],
)

lesson(
    "rm-cached-unstage", 1, "1-1-0",
    "只从暂存区移走，别把文件也删了",
    "把误加的文件撤出暂存区，同时保住磁盘上的文件",
    "`--cached` 这个开关决定了你删的是「索引里的记录」还是「磁盘上的文件」",
    "`work/leak-lab` 已经是个仓库，`README.md` 和 `app.py` 已提交。"
    "但 `scratch.log`（里面有临时 token）被手滑 `add` 进了暂存区，还没提交。",
    ["把 `scratch.log` 从暂存区移走", "文件本身必须留在本地"],
    ["`git status` 里 `scratch.log` 显示为未跟踪（Untracked）", "`scratch.log` 文件还在磁盘上",
     "`README.md` 与 `app.py` 的已提交状态没受影响"],
    [("带不带 --cached",
      "你用的命令是什么？先在一个复制品上试一次**不带** `--cached` 的版本，"
      "对比两次的 `ls` 和 `git status`，差别是什么？"),
     ("索引里到底存了什么",
      "移走前后各跑一次 `git ls-files --stage`，`scratch.log` 那一行发生了什么变化？")],
)

lesson(
    "reset-unpushed-commit", 1, "1-1-1",
    "还没推出去，赶紧把这次提交撤回来",
    "撤回未推送的提交并重新整理这次要提交的内容",
    "没 push 的提交可以当作没发生过，前提是你知道 reset 把改动放回了哪一层",
    "`work/deploy-guard` 里最新一条提交 `feat: update deploy script with staging key` "
    "把 `staging.pem` 也一起交了进去。这条提交**还没推**。",
    ["撤回这次提交", "只把 `deploy.sh` 的改动重新提交上去",
     "`staging.pem` 不能进版本库"],
    ["`git log --all --name-only` 里没有 `staging.pem`",
     "最新提交只包含 `deploy.sh`", "`staging.pem` 文件仍在磁盘上",
     "`git status` 干净（或 `staging.pem` 被忽略）"],
    [("reset 把改动放回了哪一层",
      "撤回用的是哪条命令？执行前后各跑一次 `git status` 和 `git log --oneline -3`。"
      "撤回之后，`deploy.sh` 的改动去了工作区还是暂存区？"),
     ("软硬之间",
      "同样的撤回换成另一个模式（`--soft` / 默认 / `--hard`）会有什么不同？"
      "至少真跑一种对比，贴出 `git status` 的差别。")],
)

lesson(
    "rm-vs-rm-cached", 1, "1-1-2",
    "已经推上去的敏感文件，删得掉吗",
    "区分 rm 与 rm --cached，并认清「已推送」这条边界",
    "停止追踪不等于从历史里消失，推出去之后能做的只有止损",
    "`work/night-watch` 里有人把 `.env`、`db.sqlite3`、`run.log` 一起提交并**推到了远程**。",
    ["让这三个文件不再被 git 追踪，但文件留在本地",
     "写 `.gitignore` 防止再犯", "提交并推送这次清理"],
    ["`git ls-files` 里不再有 `.env`、`db.sqlite3`、`run.log`",
     "这三个文件仍在磁盘上", "`.gitignore` 覆盖了它们", "改动已 push"],
    [("两条 rm 的区别",
      "你用的是哪条命令？它和不带 `--cached` 的版本，对「磁盘上的文件」和「索引」"
      "分别做了什么？各贴一次 `git status` + `ls`。"),
     ("历史里还有没有",
      "清理并推送之后，`git log --all --name-only | grep -c '\\.env'` 是多少？"
      "`git show <最初那条提交>:.env` 还能打印出内容吗？这说明「删掉」到底删掉了什么？")],
)

# ---------------------------------------------------------------- 第 3 章
lesson(
    "first-merge-conflict", 2, "2-0-0",
    "第一次合并冲突：读懂那三行标记",
    "看懂冲突标记的结构，手工合出正确结果",
    "冲突标记不是报错信息，是 git 把选择权交还给你的方式",
    "`math_tool.py` 里你和同事同时往文件末尾加了函数。同事先推了 `sub`，"
    "你本地提交了 `mul`，还没推。",
    ["把两边的改动合到一起，提交合并结果并推上去。"],
    ["`math_tool.py` 里同时有 `add`、`sub`、`mul`，没有重复定义",
     "没有 `<<<<<<<` / `=======` / `>>>>>>>` 残留",
     "`git status` 干净，`git log --graph -3` 能看到合并提交", "已 push"],
    [("三行标记的结构",
      "`git pull` 之后 `math_tool.py` 的冲突段原样贴出来。"
      "`<<<<<<<` 后面跟的是什么、`>>>>>>>` 后面跟的是什么？哪半是你的？"),
     ("冲突期间 git 处于什么状态",
      "冲突未解决时，`git status` 的原文是什么？它建议了哪两条出路？"
      "`git ls-files --stage math_tool.py` 有几行、每行开头的数字是什么意思？")],
)

lesson(
    "conflict-order-matters", 2, "2-0-1",
    "顺序敏感的冲突：把两半拼起来会拼出重复调用",
    "按业务语义决定最终顺序，而不是机械保留两边",
    "「两边都留」最省事也最危险，这一课它会留出一个重复调用",
    "`notifier-service` 的 `dispatch()` 最早只有一步 `deliver_message`。\n\n"
    "同事先推的版本是「先校验、再整形，然后发送」；你本地提交的版本是「先整形、再签名，然后发送」。"
    "两边插入的位置完全相同，而且**都插了 `normalize_message`**。你的提交还没推。",
    ["把两边的改动合成一条正确的处理链，提交合并结果并推上去。"],
    ["`dispatch()` 里依次是 `validate_message` → `normalize_message` → `sign_message` → "
     "`deliver_message`，**每步只出现一次**",
     "没有冲突标记残留", "`git status` 干净",
     "`git log --oneline --graph -3` 能看到一次合并提交", "已 push，远程 `main` 与本地一致"],
    [("冲突原文",
      "`git pull` 之后 `dispatch()` 变成了什么样？把带标记的那一整段原样贴进来，"
      "并说明哪半是 `HEAD`。"),
     ("两边各加了什么",
      "上下两半分别新增了哪些调用？哪一个调用是**两边都加了**的？"),
     ("机械保留两边会怎样",
      "如果只删掉三行标记、上下内容都留着，`dispatch()` 会变成什么？把那几行写出来，"
      "并说明它错在哪。"),
     ("正确顺序的理由",
      "最终顺序为什么是 validate → normalize → sign → deliver？分别说明："
      "为什么 `validate` 必须在最前，为什么 `sign` 必须在 `normalize` 之后。")],
)

lesson(
    "conflict-same-line", 2, "2-0-2",
    "同一行上的冲突：两个业务意图要合成一个",
    "把互相冲突的两种判断合成一条正确的规则",
    "冲突在同一行时没有「都保留」这个选项，只能重新想清楚规则该是什么",
    "`release_gate.py` 决定什么情况下允许发版。同事推的版本放宽了 production，"
    "你本地改的是 staging 的紧急放行。两边改的是同一行判断。",
    ["合出一条同时满足下面三条规则的判断，提交并推送：\n"
     "    - staging：至少一个审批通过，或值班负责人紧急放行\n"
     "    - production：必须有审批通过，值班负责人**不能**绕过审批\n"
     "    - 其他环境：一律不允许"],
    ["`release_gate.py` 的判断同时满足上面三条", "没有冲突标记残留",
     "`git status` 干净，有合并提交", "已 push"],
    [("同一行冲突长什么样",
      "冲突段原样贴出来。和「两边各加一段」的冲突相比，这次的标记范围有什么不同？"),
     ("三条规则怎么落成代码",
      "你最终写成了什么？把那几行贴出来，并逐条说明它是怎么满足三条规则的 —— "
      "特别是 production 那条，为什么不能照抄任何一边。")],
)

lesson(
    "conflict-multi-file-binary", 2, "2-0-3",
    "多文件冲突，其中一个是二进制",
    "同时处理文本冲突与二进制冲突",
    "二进制文件没有 hunk 可合，只能用 `--ours` / `--theirs` 整份选一边",
    "`campaign-studio` 里 `landing.js`、`copy.txt`、`assets/hero.png` 三个文件"
    "你和同事都改了。前两个是文本，最后一个是二进制。",
    ["三个文件的冲突都解决掉：文本按业务合并，`assets/hero.png` 采用**远程**那一版",
     "提交合并结果并推送"],
    ["三个文件都没有冲突标记残留",
     "`git show origin/main:assets/hero.png | cmp - assets/hero.png` 无差异（用的是远程那版）",
     "`git status` 干净，有合并提交", "已 push"],
    [("二进制冲突长什么样",
      "`git status` 里三个文件的状态标记分别是什么？"
      "试着 `cat assets/hero.png` 或 `git diff assets/hero.png`，git 说了什么？"
      "为什么二进制文件不给你 hunk？"),
     ("整份选一边",
      "你是用哪条命令选定 `hero.png` 的？`--ours` 和 `--theirs` 在这次 merge 里分别指谁？"
      "（`git log --oneline MERGE_HEAD -1` 能帮你确认）")],
)

lesson(
    "feature-branch-merge", 2, "2-1-0",
    "别在 main 上裸奔：开分支、做完、合回去",
    "走一遍最基本的分支开发流程",
    "分支不是给大项目准备的仪式，是「改错了能整段丢掉」的保险",
    "`team-board` 已经克隆好，你要给 `board.txt` 加一行。规矩是不许直接在 `main` 上改。",
    ["从 `main` 建并切到 `feature/snack-reminder`",
     "在 `board.txt` 末尾加一行：`茶水间补货后记得同步群消息`",
     "在功能分支上提交",
     "切回 `main` 合并功能分支（本课不要求 push）"],
    ["`board.txt` 末尾有那一行", "`main` 上能看到功能分支的提交",
     "`git branch` 里 `feature/snack-reminder` 存在", "`git status` 干净"],
    [("分支只是一个指针",
      "建分支前后各跑一次 `git log --oneline --graph --all --decorate -3`。"
      "刚 `checkout -b` 完、还没提交时，新分支和 `main` 指向的是同一条提交吗？"
      "`cat .git/refs/heads/feature/snack-reminder` 和 `cat .git/refs/heads/main` 说明了什么？"),
     ("这次合并是什么类型",
      "合并时 git 输出里出现了哪个词（`Fast-forward` 还是 `Merge made by ...`）？"
      "合并后 `git log --graph` 是一条直线还是有分叉？为什么会是这个结果？")],
)

lesson(
    "two-parallel-branches", 2, "2-1-1",
    "两条独立的功能分支同时推进",
    "让两件不相干的事各走各的分支",
    "两件事塞进一个分支，就再也拆不开了",
    "`launch-playbook` 里有两件不相干的活：补 QA 清单、补发布说明。",
    ["从 `main` 分别建 `feature/qa-checklist` 和 `feature/release-note`",
     "在 `feature/qa-checklist` 上给 `checklist.md` 追加：`- 回归测试完成后在群里同步结果`",
     "在 `feature/release-note` 上给 `release_notes.md` 追加：`- 发布说明需附上回滚负责人`",
     "两边都提交后切回 `main`，逐一合并"],
    ["两个分支都存在且各有一条提交",
     "`main` 上两处改动都在", "`git log --graph --oneline --all` 能看出两条分支从同一点分出",
     "`git status` 干净"],
    [("从哪里分出去",
      "建第二个分支时你在哪个分支上？如果忘了先切回 `main` 会怎样（`git log --graph` 会长什么样）？"
      "把你实际的 `git log --oneline --graph --all --decorate` 贴出来。"),
     ("两次合并的差别",
      "第一次合并和第二次合并，git 的输出一样吗？为什么第二次可能不再是 fast-forward？")],
)

lesson(
    "stash-switch-hotfix", 2, "2-1-2",
    "半成品先塞抽屉：stash 出去救火再回来",
    "用 stash 暂存半成品，处理完紧急事项再恢复",
    "stash 不是剪贴板，它把工作区打包成一个游离的提交挂在一边",
    "你停在 `feature/live-summary` 上，`status_panel.py` 还是半成品。这时来了个必须马上处理的 hotfix。",
    ["把手头未完成的改动暂存起来，切回 `main`",
     "在 `main` 上建 `hotfix.txt`，内容写 `修复 stale cache 导致的旧状态展示`，提交",
     "切回 `feature/live-summary`，恢复暂存的改动",
     "把 `render_summary_card()` 改成返回 `summary: backlog synced`，提交",
     "切回 `main` 合并功能分支",
     "收尾时 stash 列表必须是空的"],
    ["`hotfix.txt` 内容正确且已提交", "`status_panel.py` 里 `render_summary_card()` "
     "返回 `summary: backlog synced`", "`main` 上两处改动都在",
     "`git stash list` 为空", "`git status` 干净"],
    [("stash 之后工作区去哪了",
      "`git stash` 之前和之后各跑一次 `git status` 和 `git diff`。"
      "`git stash list` 输出是什么？那条记录里的 `On <分支>: <说明>` 是谁写的？"),
     ("stash 是个 commit",
      "用 `git log --oneline --graph refs/stash -1` 和 `git cat-file -p refs/stash` 看看。"
      "它有几个 parent？第一个 parent 是谁？"),
     ("pop 和 apply",
      "你恢复时用的是哪条命令？另一条会有什么不同？用 `git stash list` 的前后变化说明。")],
)

lesson(
    "stash-multiple-to-branch", 2, "2-1-3",
    "三份 stash：认出来、用掉一份、转走一份、留下一份",
    "管理多份 stash，定向恢复，并把旧草稿转成分支",
    "`stash@{n}` 的编号会变，靠 `-m` 留下的说明才认得出哪份是哪份",
    "`atelier-poster` 里堆了三份 stash：一份是法务备注改动，一份是霓虹视觉草稿，"
    "一份只是随手涂鸦。之后 `poster.txt` 又被提交改过一次，所以恢复法务那份会冲突。",
    ["用 `git stash list` 分辨三份各是什么",
     "把「法务备注」那份应用到 `main`，解决 `poster.txt` 的冲突，"
     "结果必须同时保留 `主题：发布会倒计时`、`按钮：立即生成主视觉`、`备注：上线前需法务复核`",
     "用完的那份 stash 清理掉",
     "把「霓虹视觉草稿」那份用 `git stash branch` 转成分支 `feature/neon-splash`，"
     "该分支上 `theme.txt` 要包含 `风格：霓虹流光` 和 `按钮气质：像舞台灯光一样亮`",
     "「随手涂鸦」那份保留，不要动"],
    ["`main` 上 `poster.txt` 三行都对，没有冲突标记",
     "`feature/neon-splash` 分支存在且 `theme.txt` 内容正确",
     "`git stash list` 里只剩「涂鸦」那一份"],
    [("编号会变",
      "`git stash list` 原样贴出来。三份分别是 `stash@{几}`？"
      "用掉一份之后再 list 一次，剩下两份的编号变了吗？这说明编号是什么？"),
     ("stash 冲突时的状态",
      "应用法务那份时冲突了，`git status` 说什么？这时能不能用 `git merge --abort`？"
      "真跑一次，把 git 的回答贴出来，并说明为什么。"),
     ("stash branch 做了什么",
      "`git stash branch` 一条命令做了哪几件事？执行前后的 `git branch`、`git stash list`、"
      "`git status` 各是什么？")],
)

# ---------------------------------------------------------------- 第 4 章
lesson(
    "amend-message", 3, "3-0-0",
    "提交说明写歪了，推之前还能改",
    "用 commit --amend 修正最近一次提交说明",
    "amend 不是「编辑」那条提交，是造一条新的把它换掉",
    "`work/release-notes` 里最近一条提交的说明写成了 `asdf`。这条**还没推**。",
    ["把最近一次提交说明改成一句像样的话（说清这次改了什么），不要新增提交。"],
    ["`git log --oneline -1` 的说明不再是 `asdf`",
     "`git log --oneline | wc -l` 与改之前相同（没多出提交）",
     "`git status` 干净"],
    [("amend 换掉了什么",
      "amend 之前先记下 `git rev-parse HEAD`，amend 之后再记一次。两个 hash 一样吗？"
      "这说明 amend 做的是「修改」还是「替换」？"),
     ("旧的那条去哪了",
      "`git reflog -3` 输出是什么？被换掉的那条提交还能找到吗？")],
)

lesson(
    "amend-files-reword", 3, "3-0-1",
    "amend 补文件，rebase -i reword 改更早的说明",
    "既补内容又改更早那条的说明",
    "amend 只够得着最近一条，再往前就得请 `rebase -i` 出场",
    "`work/brand-copy` 有两条未推送的本地提交：较早那条说明是 `update stuff`，"
    "最新那条是 `feat: add launch CTA assets`。另外 `palette_notes.txt` 还没进版本控制。",
    ["把较早那条的说明改成 `docs: polish hero headline`",
     "把 `palette_notes.txt` 补进**最新**那条提交里（不要新增提交）",
     "最新那条的说明保持 `feat: add launch CTA assets`"],
    ["`git log --oneline -2` 两条说明分别正确",
     "最新那条包含 `button_copy.txt` 和 `palette_notes.txt`（`git show --name-only HEAD`）",
     "提交总数没变，`git status` 干净"],
    [("两件事两种工具",
      "补文件用的是哪条命令、改更早那条说明用的是哪条？为什么不能都用 amend？"),
     ("rebase -i 的清单",
      "`git rebase -i HEAD~2` 打开的那份清单原样贴出来（保存前）。"
      "每行的第一个词是什么？你把哪一行改成了什么？"),
     ("两条 hash 都变了吗",
      "操作前记下两条提交的 hash，操作后再记一次。变了几条？为什么改了较早那条，"
      "较新那条的 hash 也会变？")],
)

lesson(
    "rebase-squash-fixups", 3, "3-0-2",
    "「fix typo」三连击：把杂乱历史压成一条",
    "用交互式 rebase 压缩并重写提交历史",
    "历史是写给下一个人读的，五条流水账该压成一条有意义的提交",
    "`work/event-invite` 里有 5 条未推送的本地提交，其中三条都叫 `fix typo`。",
    ["把这 5 条压成 1 条，说明写成一句能说清这次做了什么的话",
     "最终 `invite.md` 的内容必须是压缩前最后的样子"],
    ["`git log --oneline` 里本地只剩 1 条新提交（`git log origin/main..HEAD` 只有一条）",
     "没有 `fix typo` 说明残留", "`invite.md` 内容与压缩前一致", "`git status` 干净"],
    [("清单和动作词",
      "`git rebase -i` 清单原样贴出来（保存前和保存后各一次）。"
      "你用了哪个动作词？它和 `fixup` 有什么区别？"),
     ("内容有没有变",
      "压缩前先 `md5sum invite.md`，压缩后再算一次。一样吗？"
      "如果不一样，说明你哪一步弄丢了内容。"),
     ("历史被重写到什么程度",
      "压缩前后 `git log --oneline` 各贴一次。被压掉的那几条还能通过 `git reflog` 找到吗？")],
)

lesson(
    "rebase-split-reorder", 3, "3-0-3",
    "把一坨 wip 拆开，还要重排顺序",
    "在交互式 rebase 里拆分大提交并调整顺序",
    "`edit` 让 rebase 停在那条提交上，接下来就是普通的 reset + 分批 commit",
    "`work/ops-dashboard` 本地有 3 条提交，其中一条巨大的 `wip: finish dashboard` "
    "把布局、脚本、交接说明全揉在了一起。",
    ["把最近 3 条整理成下面 5 条，顺序也要一致：\n"
     "    1. `feat: build dashboard layout`\n"
     "    2. `feat: wire metrics renderer`\n"
     "    3. `docs: add dashboard handoff notes`\n"
     "    4. `docs: add incident review outline`\n"
     "    5. `feat: add release checklist footer`"],
    ["`git log --oneline -5` 的 5 条说明与顺序完全一致",
     "`dashboard.html` 里保留 `<h1>值班总览面板</h1>` 与 `发布前检查：日志、告警、回滚预案`",
     "`scripts/metrics.js` 里保留 `renderMetrics`",
     "`README.md` 里保留 `交接说明：值班前先确认告警联系人`",
     "`review.md` 里保留 `事故复盘提纲`", "`git status` 干净"],
    [("停在中间那条",
      "你用哪个动作词让 rebase 停在 `wip` 那条上？停住之后 `git status` 和 "
      "`git log --oneline -2` 分别说什么？"),
     ("拆的具体步骤",
      "停住之后你敲了哪几条命令把它拆成三条？（提示：先把那条提交撤成改动，再分批 add/commit）"
      "按顺序贴出来。"),
     ("重排是怎么发生的",
      "顺序调整是在清单里做的还是拆完之后做的？如果在清单里调换两行，git 会在什么时候"
      "才可能报冲突？")],
)

# ---------------------------------------------------------------- 第 5 章
lesson(
    "revert-pushed-commit", 4, "4-0-0",
    "已经推出去了，只能体面地反着来一次",
    "用 revert 安全撤回已推送的提交",
    "推出去的历史不能改，只能追加一条「反做」的提交",
    "`work/alert-ticker` 里有一条错误提交已经 push 到远程了。",
    ["用不改写历史的方式撤回那次改动，并推上去。"],
    ["`alert_rules.py` 的内容回到出错前的样子",
     "`git log --oneline` 里错误提交**仍在**，后面多了一条撤回提交",
     "`git status` 干净，已 push"],
    [("revert 加了什么",
      "revert 前后各贴一次 `git log --oneline -3`。历史里少了东西还是多了东西？"
      "`git show <revert 那条>` 的 diff 和被撤回那条的 diff 是什么关系？"),
     ("为什么不用 reset",
      "如果这里改用 `git reset --hard` 再 push，会发生什么？"
      "（可以真的试一次，把 git 拒绝的原文贴出来，然后恢复。）说明为什么已推送的提交要用 revert。")],
)

lesson(
    "reset-soft-mixed", 4, "4-0-1",
    "后悔药分软硬两款：soft 与 mixed 的差别",
    "用 reset 的不同模式回退未推送的提交并重新组织",
    "三种 reset 的区别只在「改动被放回哪一层」：仓库、暂存区、还是工作区",
    "`work/release-brief` 有两条未推送的提交，最新那条 `wip: note rollback owner` "
    "把临时草稿 `brainstorm.txt` 也带了进去。",
    ["把本地最近两条整理成：\n"
     "    1. `docs: add launch checklist skeleton`\n"
     "    2. `docs: add rollback owner note`",
     "最新一条只能包含 `rollout.md` 的正式负责人备注，写成 `回滚负责人：值班发布经理`",
     "`brainstorm.txt` 不能留在仓库里"],
    ["`git log --oneline -2` 两条说明正确",
     "`rollout.md` 里有 `回滚负责人：值班发布经理`",
     "`git ls-files` 里没有 `brainstorm.txt`", "`git status` 干净"],
    [("三种模式的落点",
      "在一个安全的地方分别试 `--soft`、默认（`--mixed`）、`--hard`，"
      "每次都贴出紧接着的 `git status`。改动分别落在哪一层？"),
     ("你选了哪个，为什么",
      "这一课你实际用的是哪个模式？为什么另外两个不合适？")],
)

lesson(
    "revert-chain-reset-hard", 4, "4-0-2",
    "连环翻车：连续 revert 三条，再把本地废提交丢掉",
    "连续撤回多个已推送提交，并丢弃本地不要的提交",
    "已推送的用 revert 一条条反做，没推送的直接 reset 掉，两种情况两种手法",
    "`work/night-watch` 里有三条**已推送**的提交依次放松了发布门禁、"
    "还删掉了 runbook 里的呼叫提醒；另外本地还有一条没推的废提交。",
    ["把三条已推送的改动都撤回来（`release_guard.py` 恢复成三个条件都要，"
     "`README.md` 恢复出「值班呼叫提醒」那一条）",
     "把本地那条未推送的废提交丢掉",
     "推上去"],
    ["`release_guard.py` 的判断恢复成 staging + 审批 + 负责人确认三个条件",
     "`README.md` 里有值班呼叫提醒那一条",
     "本地没有那条废提交（`git log origin/main..HEAD` 为空或只有 revert 提交）",
     "`git status` 干净，已 push"],
    [("撤回的顺序",
      "三条 revert 你是按什么顺序做的？反过来会不会冲突？"
      "把你实际的命令序列和 `git log --oneline -8` 贴出来。"),
     ("两种手法的分界",
      "哪几条用了 revert、哪条用了 reset？分界线是什么？"
      "用 `git log origin/main..HEAD` 的输出说明你怎么判断的。")],
)

lesson(
    "revert-merge-revert-revert", 4, "4-0-3",
    "撤销一次 merge，修好之后还得先撤回那次撤回",
    "撤销 merge commit，并在修复后重新合并",
    "revert 一个 merge 之后直接再 merge，会拿到一个「看起来合了但内容没回来」的结果",
    "`ops-stage` 的 `main` 上已经用 `--no-ff` 合过一次 `feature/live-canvas`，"
    "那次合并带来了过快的刷新节奏。功能分支上现在已经有修复提交 "
    "`fix: calm live canvas refresh rate`。",
    ["先把那条 merge commit 从 `main` 上整次撤回",
     "然后把修好的 `feature/live-canvas` 重新合回 `main`，"
     "并保证被一起撤掉、但修复提交没再动过的文件也完整回来",
     "推上去"],
    ["`main` 上 `dashboard.html`、`assets/palette.txt`、`scripts/live_canvas.js` 三个文件都在且是修复后的内容",
     "`git log --oneline --graph` 里能看到：merge → revert → revert 的 revert → 再 merge",
     "`git status` 干净，已 push"],
    [("revert 一个 merge 要多一个参数",
      "撤销 merge commit 时 git 一开始报了什么错？你加了哪个参数、参数的值取 1 还是 2、"
      "怎么判断的？（`git cat-file -p <merge 的 hash>` 能看到 parent 顺序）"),
     ("直接再 merge 会怎样",
      "先别急着撤回那次撤回 —— 直接再 merge 一次 `feature/live-canvas`，"
      "然后 `ls` 和 `git log --oneline --graph -5`。文件回来了吗？git 说这次合并做了什么？"
      "为什么会这样？（做完把这一步退掉再继续）"),
     ("撤回那次撤回",
      "你最后的命令序列是什么？`git log --oneline --graph -8` 贴出来，"
      "指出哪条是 merge、哪条是 revert、哪条是 revert 的 revert。")],
)

lesson(
    "cherry-pick-single", 4, "4-1-0",
    "从别的分支只摘一条提交过来",
    "把单个 commit 从另一个分支搬到当前分支",
    "cherry-pick 搬的是「那条提交的 diff」，不是那条提交本身",
    "`feature/payment-badge` 上有两条提交：一条是要的功能，一条只是随手记的草稿。"
    "你只想要功能那条。",
    ["把 `feat: add payment badge renderer` 摘到 `main` 上",
     "不要把 `docs: jot badge brainstorm` 带过来"],
    ["`main` 上 `ui/payment_panel.js` 有 badge renderer",
     "`main` 上没有 `scratchpad.md`",
     "`git log --oneline main -3` 里能看到那条被摘过来的提交", "`git status` 干净"],
    [("摘过来的是同一条吗",
      "原分支上那条的 hash 和 `main` 上新出现那条的 hash 一样吗？"
      "两条的 `git show --stat` 一样吗？这说明 cherry-pick 搬的是什么？"),
     ("怎么指定要摘哪条",
      "你的命令是什么？如果写成分支名（而不是具体 hash）会摘到哪一条？真试一次看看。")],
)

lesson(
    "cherry-pick-multi-ordered", 4, "4-1-1",
    "从两个分支挑三条，还得按正确顺序摘",
    "跨多个分支挑选多个提交并按依赖顺序摘取",
    "有依赖关系的提交顺序摘错就直接冲突，先想清楚谁依赖谁",
    "你在 `release-candidate` 上。`feature/card-layout` 和 `feature/risk-banner` "
    "两个分支上一共有四条提交，你只要其中三条，而且其中一条依赖另一条。",
    ["把这三条按正确顺序摘到 `release-candidate`：\n"
     "    1. `feat: add payment flow slide skeleton`\n"
     "    2. `docs: add risk banner to payment flow slide`\n"
     "    3. `docs: add review handoff note`",
     "不要带上 `docs: note playful footer idea`",
     "本课不要求 push"],
    ["`release-candidate` 上 `git log --oneline -3` 是那三条，顺序正确",
     "没有 `docs: note playful footer idea`",
     "`slides/payment_flow.md` 同时有骨架和 risk banner", "`git status` 干净"],
    [("谁依赖谁",
      "四条提交分别在哪个分支上、各改了什么文件？"
      "（`git log --oneline --graph --all` 和 `git show --stat <hash>` 一起看）"
      "哪两条动了同一个文件、因此有先后关系？"),
     ("顺序摘错会怎样",
      "先故意把有依赖的那条摘在前面，看看 git 说什么，把输出贴出来，然后 abort 掉重来。"),
     ("一次摘多条",
      "你是一条一条摘的还是一次给多个 hash？两种写法的 `git log` 结果一样吗？")],
)

lesson(
    "cherry-pick-skip-conflict", 4, "4-1-2",
    "摘一段范围：中间一条要跳过，最后一条会冲突",
    "在 cherry-pick 过程中处理空提交与冲突续传",
    "cherry-pick 一段范围会中途停下，`--skip` / `--continue` / `--abort` 是三个出口",
    "你在 `main` 上，要把 `feature/handover-pack` 上从 "
    "`docs: add handover window reminder` 到 `feat: wire war-room escalation channel` "
    "这一段搬回来。这段里中间那条的内容在 `main` 上已经以别的 SHA 存在，最后一条会冲突。",
    ["把那一段范围摘到 `main`（范围要包含第一条本身）",
     "中间那条重复的跳过",
     "最后一条的冲突解决掉并继续",
     "最终 `handover.md`、`contacts.txt`、`scripts/escalate.sh` 都符合 README 描述"],
    ["三个文件内容都对，没有冲突标记",
     "`git status` 干净、不在 cherry-pick 进行中（没有 `.git/CHERRY_PICK_HEAD`）",
     "`git log --oneline -4` 能看到摘过来的提交"],
    [("范围怎么写",
      "你用的范围写法是什么？为什么要在起点后面加那个符号？"
      "不加会少摘哪一条（可以真试一次）？"),
     ("中途停下来的两种原因",
      "第一次停下来时 git 说什么？第二次呢？两次的 `git status` 有什么不同？"
      "分别该用哪个出口（`--skip` / `--continue`）？"),
     ("空提交是怎么来的",
      "中间那条为什么会变成「空」的？用 `git log --oneline --all` 和 "
      "`git show --stat` 说明它的内容已经以什么形式存在于 `main` 上了。")],
)

lesson(
    "cherry-pick-range-cross-repo", 4, "4-1-3",
    "跨仓库搬提交：先 fetch 进来，再 cherry-pick",
    "从一个独立的远程仓库把连续历史搬到本仓库",
    "另一个仓库的提交要先 fetch 进本地对象库，才有资格被 cherry-pick",
    "`payment-gateway` 和 `partner-snippets` 是两个**互不相干**的仓库。"
    "你要从后者的两个分支上把三条提交搬到前者的 `main`。",
    ["把外部仓库加成一个 remote 并 fetch 进来",
     "从 `feature/pay-tunnel` 上连续搬回两条："
     "`feat: add pay tunnel adapter` 与 `chore: document tunnel provider env`",
     "再从 `hotfix/callback-copy` 上搬回 `docs: clarify callback confirmation copy`",
     "不要把 `docs: archive abandoned sdk note` 带进来",
     "完成后保留新增的那个 remote，不需要 push"],
    ["`git remote -v` 里除了 `origin` 还有外部仓库那个 remote",
     "`main` 上有那三条提交、没有 abandoned sdk 那条",
     "`lib/pay_tunnel.js` 存在，`config/payment.env.example` 里有 `TUNNEL_PROVIDER`",
     "`docs/integration_note.md` 里有回调文案那一行", "`git status` 干净"],
    [("fetch 之前 fetch 之后",
      "`git remote add` 之后、`fetch` 之前，`git log <remote>/feature/pay-tunnel` 能跑通吗？"
      "fetch 之后呢？`git branch -a` 前后各贴一次。这说明 fetch 把什么搬进来了？"),
     ("两个仓库没有共同祖先",
      "`git merge-base main <remote>/main` 输出什么？"
      "既然两个仓库毫无关系，为什么 cherry-pick 还能成功？"),
     ("范围写法",
      "搬那连续两条时你写的范围是什么？确认第一条真的被搬进来了 —— 用什么命令确认的？")],
)

FIXED = [
    ("一句话", "用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。"),
    ("心智模型", "画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、"
                 "为什么按这个模型推，命令的行为就是可预期的。"),
    ("坑", "这一课你踩到或差点踩到的坑，一条一行。"),
]

GENERIC_START = ("起点", "环境刚建好时，`git log --oneline --graph --all --decorate` 和 "
                         "`git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。")
GENERIC_CMDS = ("你敲了什么", "按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？")
GENERIC_END = ("终点", "完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` "
                       "分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。")


def block(slug, title, body):
    # 去掉 ** 强调：fence 里 markdown 不生效，写了只会以字面量出现在题干中
    return ("```conflict\n<<<<<<< courses/git/%s\n%s\n%s\n=======\n>>>>>>> notes\n```\n"
            % (slug, title, body.replace("**", "")))


def page(slug, d):
    parts = ["# %s\n" % d["title"]]
    parts.append("> 目标：%s。原关卡 `%s`。\n" % (d["goal"], d["task_id"]))
    parts.append("## 场景\n\n%s\n" % d["scene"])
    parts.append(
        "## 搭环境\n\n```bash\nbash docs/courses/git/assets/%s/init.sh\n```\n\n"
        "环境建在 `~/courses/git/%s/`（改 `COURSE_ROOT` 可换位置），重跑即重置。"
        "远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。\n\n"
        '??? abstract "`init.sh` —— 造出这个现场的脚本"\n\n'
        "    ```bash\n    --8<-- \"courses/git/assets/%s/init.sh\"\n    ```\n"
        % (slug, slug, slug))
    parts.append("## 任务\n\n%s\n" % "\n".join("- " + t for t in d["tasks"]))
    parts.append("## 验收\n\n%s\n" % "\n".join("- " + c for c in d["checks"]))

    asks = [GENERIC_START] + list(d["asks"]) + [GENERIC_CMDS, GENERIC_END]
    numbered = [("Q%d %s" % (i + 1, t), b) for i, (t, b) in enumerate(asks)]
    parts.append("## 提问\n\n" + "\n".join(block(slug, t, b) for t, b in numbered + FIXED))
    return "\n".join(parts)


# 原关卡的解法文本里写死了容器里的用户目录、git daemon 地址和游戏角色名，归档前一并洗掉
SCRUB = [
    (r"/home/(yikeli|yaoyao|qiaojianxia|chenxing)/?", ""),
    (r"git@git\.bigames\.fun:/srv/git/", ""),
    (r"git://git\.bigames\.fun/", ""),
    (r"唐艺梨|闻书遥|乔见夏|顾沉星", "你"),
    (r"岑宁", "同事"),
    (r"林弦", "导师"),
    (r"@bigrice\.com", "@example.com"),
]


def scrub(text):
    for pat, sub in SCRUB:
        text = re.sub(pat, sub, text)
    return text


def index():
    out = ["# Git\n",
           "33 课，每课一个 `init.sh` 在你机器上造出一个真实现场：冲突、误删、写歪的历史都是真的。"
           "答完的笔记落在 [笔记 / Git](../../notes/git/index.md) 的同名文件里 —— "
           "怎么答、怎么归档见[课程说明](../index.md)。\n",
           "环境默认建在 `~/courses/git/<slug>/`，`COURSE_ROOT` 可以改到别处；"
           "每个脚本都可重复运行，重跑即重置。\n"]
    for i, (name, blurb) in enumerate(CHAPTERS):
        out.append("## %d. %s\n\n%s。\n" % (i + 1, name, blurb))
        rows = [(s, d) for s, d in L.items() if d["chapter"] == i]
        rows.sort(key=lambda kv: kv[1]["task_id"])
        out.append("\n".join("- [%s](%s.md) —— %s" % (d["title"], s, d["hook"]) for s, d in rows) + "\n")
    return "\n".join(out)


def main() -> int:
    if len(L) != 33:
        print("✗ LESSONS 表只有 %d 课，应为 33" % len(L), file=sys.stderr)
        return 1
    for slug, d in L.items():
        (DOCS / (slug + ".md")).write_text(page(slug, d), encoding="utf-8")
        # 原关卡的标准解法与剧情原件归档，不发布
        story = json.loads((SRC / ("task" + d["task_id"]) / "story.json").read_text(encoding="utf-8"))
        adir = ARCHIVE / slug
        adir.mkdir(parents=True, exist_ok=True)
        (adir / "solution.md").write_text(
            "# 参考解法：%s\n\n原关卡 `%s` 设计时写的标准流程。\n\n%s\n"
            % (d["title"], d["task_id"], scrub(story["solution"])), encoding="utf-8")
        (adir / "story.json").write_text(
            json.dumps(story, ensure_ascii=False, indent=2), encoding="utf-8")
    (DOCS / "index.md").write_text(index(), encoding="utf-8")
    print("✅ 生成 %d 个课程页 + 分类索引，参考解法归档到 courses-src/git/" % len(L))
    return 0


if __name__ == "__main__":
    sys.exit(main())
