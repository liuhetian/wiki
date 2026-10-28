---
description: "Windows 软件逆向的维护记录:吸纳自 reverse-skill-lab/exe-reverse(MIT),钉在 af9603c;只收一页概要——把这个 skill 的分类三轴和门禁纪律提炼成梗概,约 40 篇技术 reference、17 个脚本和全套测试 CI 都不收、引导装上游"
---

# Windows 软件逆向（exe-reverse）

[Windows 软件逆向](../../skills/exe-reverse.md)的维护记录。

- **上游**:reverse-skill-lab/exe-reverse 的 `skills/exe-reverse/`[^repo],一个 skill 的仓库,MIT,许可证原文不随附。LINUX DO 社区支持。仓库里没有 hooks、agents、commands、mod、MCP,没有组件要转写或丢弃
- **commit**:钉在 `af9603c`(2026-10-25)[^commit],当天抓取

## 为什么只收一页概要 { #why-overview }

和用户分诊后定的(2026-10-26):脚本重、更新快,且判断「要么完整收纳、要么退成一页诚实的概要」—— 只保留三页判断层,既不是能单独触发的子 skill、又只是约 40 篇里的 3 篇,属于半截,所以并成一页自包含的概要,逐层细节全部指上游。

- **脚本重**:17 个脚本约 9000 行 Python(`peutil.py` 1034 行、`capabilities.py` 1368 行……),外加 evals、evidence、测试、CI 和仓库根的 6 个维护工具
- **更新快**:8 个 commit 全挤在 2026-10-24 到 10-25 两天内,一天好几版 —— 比收纳规范里「几天一个版本」还快
- **一页概要的好处**:干净、诚实、零维护,还把「还有多少没收」(约 40 篇 reference、17 个脚本约 9000 行)写进正文;代价是门禁条文(O1–O5、G1–G5)和 38 条坑的全文不在本站留字,要读去上游

## 文件对应 { #files }

一个来源一页。

| 本站 | 上游 | 怎么收的 |
|---|---|---|
| `skills/exe-reverse.md` | `SKILL.md`(五个动作、O1–O5、G1–G5、「完成」六条、十三问、路由表)、README 的领域描述、`references/coverage-and-limits.md` 的「Not covered」、`references/pitfalls.md` | 自己写的一页概要:把分类三轴(目标是什么 / 行为住哪层 / 交付物是什么)和门禁纪律压成梗概,加领域建模、边界和装上游须知;原文的表和条文不逐条搬 |

## 跳过了什么 { #skipped }

一句话:除了领域、分类梗概、纪律梗概、边界,其余全部指上游。

- **全部脚本**:`scripts/` 17 个(`doctor.py`、`hwprobe.py`、`capabilities.py`、`pe_triage.py`、`peutil.py`、`pepatch.py`、`aob_scan.py`、`pe_diff.py`、`plan.py`、`preflight.py`、`fold.py`、`trace_reduce.py`、`scan_leaks.py`、`dart_snapshot_strings.py`、`gate_probe.js`、`make_fixture_pe.py` 等)
- **全部技术 reference**:`references/` 约 40 篇全不逐条收 —— PE 结构、汇编惯用法、recon、patching、脱壳、转储修复、动态调试、注入 hook、授权机制、算法恢复、网络授权、符号执行、虚拟化平坦化、.NET、Unity IL2CPP、Python 打包、Flutter/Dart、内核驱动、硬件追踪、hypervisor 观测、CPU 厂商分叉、CRT 启动、编译器指纹、工具链、验证、脱敏、`pitfalls.md`(38 条坑)、`routing.md` 等。概要只提炼其中的分类轴和纪律梗概
- **门禁与坑的全文**:O1–O5、G1–G5 的完整条文、症状索引(50 多行)、`pitfalls.md` 的 P1–P38,概要里只保留「有这套纪律、它长这样」的梗概,全文读上游
- **evals / evidence / 测试 / CI**:`evals/`、`evidence/`、`tests/`、`.github/workflows/ci.yml`
- **仓库根的维护工具**:`check_repo.py`、`check_refs.py`、`check_routing.py`、`check_commands.py`、`check_budget.py`、`build_scripts.py`,以及 `CONTRIBUTING.md`、lint/mypy/pytest 配置
- **人读入门连载** `docs/primer/`(exe1/3/4/5):文章线这次判不收(找来的连载、还缺一篇、和主线无关)。以后想要人读版,落 `docs/notes/` 新开逆向分类
- **`docs/tool-verification/`**:上游测量通行的证据记录,不随 skill 分发
- README、banner、LICENSE、`.gitattributes` 等仓库其余

## 翻译之外的改动 { #changes }

- **能力名**:叫 Windows 软件逆向,文件名 `exe-reverse.md` 对齐上游 slug;迷你 skill,一页自包含
- **概要是综合、不是翻译**:分类三轴从 `SKILL.md` 的十三问和路由表提炼,纪律梗概从五个动作、O1–O5、G1–G5、「完成」六条、停止条件压缩,方法层清单从 README 的能力列表取;都是梗概,不逐条照搬原文
- **报清基数**:上游有约 40 篇 reference、17 个脚本约 9000 行,写进「这里只有地图,引擎在上游」一节 —— 让读者看清这页是概要、不是全部,不会以为 skill 只有这么点
- **边界**照 `coverage-and-limits.md` 的「Not covered」口径写进正文:破服务端授权、通用脱虚拟化、攻破具名商业保护、对没测过的 Windows 版本作保证都不在范围
- **装上游**:上游是 skills 仓库,写明 clone codeberg、skill 在 `skills/exe-reverse/`、先跑 `doctor.py` / `hwprobe.py`、是第三方代码执行前告知用户、工具不在 PATH 用 `EXEREV_TOOLS`;`npx skills add` 对 codeberg 不一定可用,不写

## 上游更新 { #upstream-update }

客户端装的是上游最新版,这边钉在 `af9603c`。上游两天 8 版,更新频繁;但本站只是一页概要,梗概层面变得慢,以人工跟进为准:

1. `git clone --depth 1` 拿新 commit,和 `af9603c` 比对 `SKILL.md` 的分类轴、门禁、「完成」定义和 `references/coverage-and-limits.md` 的边界
2. 分类三轴、纪律梗概或边界有实质变化(新增一类目标、改了门的数目、边界松紧)才重写概要对应段;单条坑或单篇技术 reference 的增删不动这页
3. 更新本页的 commit、日期、脚注和基数(reference 篇数、脚本个数)

[^repo]: [reverse-skill-lab/exe-reverse](https://codeberg.org/reverse-skill-lab/exe-reverse),2026-10-26 读。
[^commit]: [`af9603c` 的 skills/exe-reverse](https://codeberg.org/reverse-skill-lab/exe-reverse/src/commit/af9603c9857552ef8ace07d2e7a8a3f9bd845560/skills/exe-reverse),2026-10-26 读。
