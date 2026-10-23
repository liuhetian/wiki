/**
 * 不调模型的部分：只 import dsh 的函数，喂 run.ts 实跑出来的会话日志或默认配置。
 * 1. 压缩阈值：compaction-basic 的 resolveConfig → resolveTargetPolicy → resolveCompactSpec，
 *    分别喂产品默认配置和 run.ts 的演示配置，DeepSeek 默认窗口 1,000,000、输出预留 256,000
 * 2. 压缩前后的模型视图：dsh-session 的 foldSurface 折叠日志前缀，列出每个节点
 *
 * 用法：env -i HOME=$HOME PATH=$PATH node --experimental-transform-types --no-warnings \
 *         --import ./hook.mjs lab.ts <run_dir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { resolveConfig, resolveTargetPolicy, resolveCompactSpec } from '@deepseek-ai/dsh-compaction-basic/src/config.ts'
import { DEFAULT_CONTEXT_WINDOW, DEFAULT_MAX_TOKENS } from '@deepseek-ai/dsh-llm-deepseek/src/defaults.ts'
import { foldSurface, deriveEventMessage } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

const run = process.argv[2]
const txt = join(run, 'txt')
mkdirSync(txt, { recursive: true })
const target = { provider: 'deepseek', model: 'deepseek-flash' }

// 1. thresholds
const lines: string[] = [`contextWindow = ${DEFAULT_CONTEXT_WINDOW}, reservedCompletionTokens = ${DEFAULT_MAX_TOKENS}`, '']
for (const [label, config] of [
  ['产品默认（base 组合包不给 compaction-basic 配置）', {}],
  ['run.ts 的演示配置', { modelPolicies: [{ ...target, thresholdRatio: 0.015, retainTokens: 3000 }] }],
] as const) {
  const resolved = resolveConfig(config)
  const policy = resolveTargetPolicy(resolved, target)
  const spec = resolveCompactSpec(policy, DEFAULT_CONTEXT_WINDOW, DEFAULT_MAX_TOKENS)
  lines.push(`# ${label}`)
  lines.push(`thresholdRatio=${policy.thresholdRatio} headroomTokens=${policy.headroomTokens} ${'retainTokens' in policy && policy.retainTokens !== undefined ? `retainTokens=${policy.retainTokens}` : `retainRatio=${policy.retainRatio}`} maxTokens=${policy.maxTokens}`)
  lines.push(`thresholdTokens=${spec.thresholdTokens} retainTokens=${spec.retainTokens} compactionRetries=${spec.compactionRetries} maxOverflowRetries=${spec.maxOverflowRetries}`)
  lines.push('')
}
writeFileSync(join(txt, 'thresholds.txt'), lines.join('\n'))
console.log(lines.join('\n'))

// 2. surface views
const events = readFileSync(join(run, 'session-events.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line) as SessionEvent)
function preview(event: SessionEvent): string {
  const message = deriveEventMessage(event)
  if (message === null) return ''
  const source = (message as { source?: { kind?: string } }).source?.kind
  const text = message.content.map(block => block.type === 'text' ? block.text
    : block.type === 'tool-call' ? `[tool-call ${block.name} ${block.arguments}]`
    : block.type === 'reasoning' ? '[reasoning]' : `[${block.type}]`).join(' ')
  const head = `${String(event.seq).padStart(3)}  ${message.role.padEnd(9)} ${(source ?? '').padEnd(18)}`
  return `${head} ${text.replace(/\s+/g, ' ').slice(0, 72)}`
}
function view(uptoSeq: number, title: string): string {
  const { nodes } = foldSurface(events.slice(0, uptoSeq + 1))
  return [`# ${title}：日志 ${uptoSeq + 1} 条事件，模型视图 ${nodes.length} 个节点`, ...nodes.map(seq => preview(events[seq]!))].join('\n')
}
const firstEnd = events.find(event => event.type === 'compaction/end')!.seq
const beforeSeq = events.find(event => event.type === 'compaction/start')!.seq - 1
const afterRequest = events.find(event => event.type === 'request/header' && event.seq > firstEnd)!.seq
const views = [
  view(beforeSeq, `压缩前（seq ${beforeSeq}）`),
  '',
  view(firstEnd, `刚压完（seq ${firstEnd}）`),
  '',
  view(afterRequest, `下一次请求前（seq ${afterRequest}）`),
].join('\n')
writeFileSync(join(txt, 'surface-views.txt'), views + '\n')
console.log(views)
