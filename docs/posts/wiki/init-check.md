---
description: "新机器上把 wiki 从 clone 跑到能推送要验的五条链路：依赖与构建、链路闸门、LFS 真身、COS 凭证、GitHub 推送，附 2026-10-18 实测结果和失败时先看哪里"
---

# 新机器初始化自检：从 clone 到能推送

初始化成不成，不看 `uv sync` 有没有报错，看五条链路能不能各自走通：本地构建、AI 链路闸门、媒体真身、COS 凭证、GitHub 推送。前三条离线可验，后两条必须联网。2026-10-18 在一台新机器上逐条跑过：构建、校验、LFS、COS 读写都通；GitHub 走到 `push --dry-run`，真实写入等第一次 push。

## 一张表 { #checks }

| # | 链路 | 命令 | 通过标准 |
|---|---|---|---|
| 1 | 依赖与构建 | `uv run zensical build` | 退出码 0，输出 `No issues found` |
| 2 | AI 链路闸门 | `python3 scripts/check-links.py` | 退出码 0，打印通过和篇数 |
| 3 | 媒体真身 | `git lfs fsck` | `Git LFS fsck OK`，工作区里的图不是指针文件 |
| 4 | COS 凭证 | `.venv/bin/coscmd list` | 能列出现有对象；写权限另由部署验 |
| 5 | GitHub 推送 | `git push --dry-run origin main` | SSH 通、远端分支对得上；真正写权限等第一次 push |

## 逐条看 { #detail }

### 1. 依赖与构建 { #build }

`uv sync` 只保证包装上了，不保证配置能读、模板能渲染、snippet 能展开。构建一次才算数：

```bash
uv run zensical build
```

看三样：退出码、结尾有没有 `No issues found`、耗时是否正常（本机约 28 秒）。构建产物在 `site/`，已被 `.gitignore` 排除，不用管。

### 2. AI 链路闸门 { #link-check }

这个 wiki 的 AI 入口是相对链接，不是 `nav`。`check-links.py` 查五件事：每篇都被某个祖先索引页直接链到、没有死链、注册进了 `nav`、笔记里没有未答的课程题、图片和 demo 等本地资源没有死链。

```bash
python3 scripts/check-links.py
```

它也是 `deploy.sh` 的第一道闸门，非零退出就中止部署。新机器上先跑它，比等部署时才发现漏挂链接省事。

### 3. 媒体真身 { #lfs }

图、视频、字体和 vendor 真身走自制 LFS，blob 在备份桶。clone 时如果用了 `GIT_LFS_SKIP_SMUDGE=1`，要补一次 `git lfs pull`；漏了这一步，工作区里躺的是指针文件，构建不报错，线上图全裂。

```bash
git lfs fsck
git lfs ls-files | wc -l
file docs/gallery/colors/collected/assets/imagery-gradients/01.jpg
```

`fsck` 要输出 `Git LFS fsck OK`；`file` 要认出真实的图片类型。指针文件只有一百多字节，开头是 `version https://git-lfs...`。

### 4. COS 凭证 { #cos }

凭证在 `.env`（不入库）。`deploy.sh` 会读它、写 coscmd 配置、再上传；单独验一次读操作：

```bash
set -a; source .env; set +a
.venv/bin/coscmd config -a "$COS_SECRET_ID" -s "$COS_SECRET_KEY" -b "$COS_BUCKET" -r "$COS_REGION"
.venv/bin/coscmd list -n 5
```

能列出桶里的对象，说明桶名、区域、密钥三样都对。`list` 只证明读；写权限在同一天的 `./deploy.sh` 里验过：上传成功、0 失败。

### 5. GitHub 推送 { #git }

```bash
git ls-remote --heads origin
git push --dry-run origin main
```

`ls-remote` 证明 SSH 和读没问题，`push --dry-run` 证明远端分支对得上。注意本地没有新提交时，dry-run 直接报 `Everything up-to-date`，服务端可能根本没检查写权限——**第一次真 push 才是终检**。

## 本次实测 { #result }

| 项 | 结果 |
|---|---|
| 工具链 | uv 0.13.1，venv 内 Python 3.13.16，Zensical 0.0.62 |
| 构建 | 退出码 0，`No issues found`，28.27 秒 |
| 链路校验 | 通过，951 篇（含这篇）都能从上一级索引走到 |
| LFS | 1049 个跟踪文件，`fsck` 通过，抽样图片是 169 KB 的 JPEG |
| COS | `coscmd list` 能列出桶根对象；`./deploy.sh` 上传 16 个对象，0 失败 |
| 部署 | 2026-10-18 上线，`/posts/wiki/init-check/` 可访问 |
| GitHub | `origin/main` 与本地一致（2b91e12），`push --dry-run` 通过 |

## 失败时先看哪里 { #troubleshoot }

- `check-links` 报「没有被任何祖先索引页链到」：去所在目录或上一级的 `index.md` 加链接，只加 `nav` 不算
- `check-links` 报「未在 mkdocs.yml 的 nav 注册」：把 `docs/` 下的相对路径写进 `nav`
- 构建通过但线上图裂：`file` 看一眼工作区里的图是不是 LFS 指针，补 `git lfs pull`
- `coscmd list` 报 403 或 404：先对 `.env` 里的桶名、区域、密钥，再确认密钥有这个桶的权限
- `git push` 被拒：先 `git pull --ff-only` 处理分叉，别强推

## 这篇页面本身就是测试 { #self-test }

新增一页要走四步：文件写进 `docs/`、父级索引挂一行带钩子的链接、`mkdocs.yml` 的 `nav` 注册、跑 `check-links.py`。这篇就是照这四步写的，构建、部署都过了，说明写内容的链路是通的。`commit`、`push` 是另外两步，按本站规矩等人发话再做。
