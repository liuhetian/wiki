#!/bin/sh
# 用上游自己的快照测试重放三个放宽申请场景：真的 ACP 组合、真的 bash 工具和审批服务，
# 模型回复是录好的（deepseek-v4-flash 当时真跑的），不读任何 key。重放产出的会话日志要和
# 仓库里提交的 session.v4.jsonl 逐条对上才算通过。
set -eu
cd /tmp/dsh-src/deepseek-harness
env -i HOME="$HOME" PATH="$PATH" node_modules/.bin/vitest run --config vitest.snapshot.config.ts \
  snapshots/acp/acp.snapshot.ts -t escalation --reporter=verbose 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✓|✗|×|Test Files|Tests '
