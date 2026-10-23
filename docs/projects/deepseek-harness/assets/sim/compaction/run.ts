/**
 * 压缩实跑：dsh 自己的 AgentLoop + BasicCompaction + ToolResultPruner + TokenMeter + agent-instructions
 * + tool-fs 的 read，
 * 模型走 dsh 自己的 DeepSeekAdapter（deepseek-flash，项目默认的 thinking / effort），
 * baseURL 指到本机 proxy.py——key 只在那个进程里，本进程用 env -i 起，没有任何密钥。
 *
 * 和产品默认唯一的差别：给 deepseek/deepseek-flash 配了一条 modelPolicies，把压缩阈值从
 * 678,464 token 降到 15,000，这样几轮对话就能触发；其余（先裁剪、摘要、拼回）都是默认路径。
 * 产品里 tool-result-pruner 的配置照 base 组合包（8192 / 4096 / 1024）。
 *
 * 工作区里放一份 AGENTS.md 和 .git 标记；DSH_HOME / DSH_AGENTS_HOME 指到空目录，免得读进本机的全局指令。
 *
 * 用法（在仓库外任意目录）：
 *   env -i HOME=$HOME PATH=$PATH DSH_HOME=<空目录> DSH_AGENTS_HOME=<空目录> \
 *     node --experimental-strip-types --import ./hook.mjs run.ts <port> <workspace> <out_dir>
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import TokenMeter from '@deepseek-ai/dsh-token-meter'
import ToolResultPruner from '@deepseek-ai/dsh-compaction-tool-result-pruner'
import BasicCompaction from '@deepseek-ai/dsh-compaction-basic'
import * as AgentInstructions from '@deepseek-ai/dsh-agent-instructions'
import * as ToolFs from '@deepseek-ai/dsh-tool-fs'
import { DeepSeekAdapter, resolveAdapterOptions } from '@deepseek-ai/dsh-llm-deepseek'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'

const [port, workspace, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const TURNS = [
  'Read packages/compaction/compaction-basic/src/summarizer.ts and packages/compaction/compaction-basic/src/region.ts. Explain in five bullets how a compaction request is assembled and how its result lands back in the session.',
  'Now read packages/compaction/compaction-basic/src/config.ts. With a 1,000,000-token context window, a 256,000-token output reservation and default settings, what are thresholdTokens and retainTokens? Show the arithmetic.',
  'Read packages/compaction/compaction-tool-result-pruner/src/index.ts and packages/compaction/compaction-tool-result-pruner/src/config.ts. When does the pruner run relative to summarization, and what exactly does a pruned tool result look like?',
  'Read packages/compaction/compaction-basic/src/index.ts. Describe the context-overflow recovery path step by step.',
  'Summarize the three most surprising design decisions you have seen so far, one sentence each.',
  'Which file would you change to make checkpoints keep the conversation language instead of English? Name the constant.',
]

const ctx = new Context()
await mountAgentLoopTestDependencies(ctx, {
  workingDirectory: true,
  // The shipped web/headless persona; harness identity and runtime context stay at their defaults.
  systemPrompt: { personaPrefix: 'You are a coding agent powered by the {{model}} model.' },
})
await ctx.plugin(TokenMeter)
// base 组合包的配置：工作区指令预算 64 KiB
await ctx.plugin(AgentInstructions, { maxBytes: 65536 })
await ctx.plugin(ToolFs, { write: false, edit: false })
await ctx.plugin(ToolResultPruner, { thresholdChars: 8192, headChars: 4096, tailChars: 1024 })
await ctx.plugin(BasicCompaction, {
  modelPolicies: [{ provider: 'deepseek', model: 'deepseek-flash', thresholdRatio: 0.015, retainTokens: 3000 }],
})

const adapter = new DeepSeekAdapter({
  options: () => resolveAdapterOptions({ baseURL: `http://127.0.0.1:${port}` }),
  resolveAuth: () => Promise.resolve({ headers: { 'x-api-key': 'held-by-proxy' } }),
  resolveUserId: () => 'compaction-demo' as never,
  // No dsh_* request extensions: the session-log upload stays off in this experiment.
  prepareExtensions: async () => ({ fields: {}, accept: async () => {} }),
})
ctx.llm.registerAdapter(['deepseek'], adapter)

const harness = await mountAgentLoopTestHarness(ctx)
const agent = await harness.create(SessionId('compaction-demo'), { provider: 'deepseek', model: 'deepseek-flash' }, { cwd: workspace })

const progress: unknown[] = []
let firstSummaryTurn: number | undefined
for (const [index, text] of TURNS.entries()) {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
  await agent.whenIdle()
  const events = agent.session.snapshotEvents()
  const summaries = events.filter(event => event.type === 'compaction/summary').length
  const prunes = events.filter(event => event.type === 'compaction/prune').length
  progress.push({ turn: index + 1, events: events.length, surfaceNodes: agent.session.surface.nodes.length, prunes, summaries })
  console.log(JSON.stringify(progress.at(-1)))
  // Stop one turn after the first summary so the log also shows a later turn on the compacted surface.
  firstSummaryTurn ??= summaries > 0 ? index : undefined
  if (firstSummaryTurn !== undefined && index > firstSummaryTurn) break
}

const events = agent.session.snapshotEvents()
writeFileSync(join(out, 'session-events.jsonl'), events.map(event => JSON.stringify(event)).join('\n') + '\n')
writeFileSync(join(out, 'surface.json'), JSON.stringify({
  nodes: agent.session.surface.nodes,
  messages: agent.session.deriveMessages(),
}, null, 2))
writeFileSync(join(out, 'progress.json'), JSON.stringify(progress, null, 2))
await ctx.fiber.dispose()
