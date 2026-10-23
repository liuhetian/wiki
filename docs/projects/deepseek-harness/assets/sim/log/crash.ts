/**
 * 构造的崩溃现场：模型一步里请求两个工具，第一个（deploy）已经开始执行、卡住不返回，
 * 第二个（echo）排在后面还没开始。此刻把日志拿走（相当于进程被杀，内存丢光），
 * 交给 dsh-session 的 interruptedTurnClosers 补齐，再看补齐后的模型视图。
 * 循环、日志、补齐全是项目代码；模型回复和「崩溃时刻」是构造的。
 */
import { writeFileSync } from 'node:fs'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { createUserMessage, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { StreamChunk } from '@deepseek-ai/dsh-llm'
import SessionStore, { Session, SessionId, interruptedTurnClosers } from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/lib/index.js'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { MockAdapter } from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/tests/mock-adapter.ts'

const OUT = process.argv[2] ?? '.'
const call = (index: number, id: string, name: string, args: object): StreamChunk[] => {
  const json = JSON.stringify(args)
  return [
    { type: 'block-start', index, blockType: 'tool-call' },
    { type: 'tool-call-delta', index, id: ToolCallId(id), name, argumentsDelta: json },
    { type: 'block-end', index, block: { type: 'tool-call', id: ToolCallId(id), name, arguments: json } },
  ]
}
const adapter = new MockAdapter([[
  ...call(0, 'c1', 'deploy', { env: 'prod' }),
  ...call(1, 'c2', 'echo', { text: 'done?' }),
  { type: 'usage', usage: { inputTokens: 10, outputTokens: 5 } },
  { type: 'finish', reason: { kind: 'tool-calls' } },
]])

const ctx = new Context()
await ctx.plugin(LlmRuntime)
await ctx.plugin(SessionStore)
await ctx.plugin(SessionProjectionRegistry)
await ctx.plugin(SystemPrompt, { personaPrefix: 'You are a test agent.' })
await ctx.plugin(ToolRuntime)
await ctx.plugin(AgentRegistry)
await ctx.plugin(AgentLoop, { agents: [] })
ctx.llm.registerAdapter(['mock'], adapter)
ctx.tools.register(defineContentToolFixture({
  name: 'deploy', description: 'deploy the service', parameters: { env: { type: 'string' } },
  execute: () => new Promise(() => {}), // 永不返回：进程在它执行期间被杀
}))
ctx.tools.register(defineContentToolFixture({
  name: 'echo', description: 'echo back', parameters: { text: { type: 'string' } },
  async execute(args) { return [{ type: 'text', text: `echo: ${String(args.text)}` }] },
}))

const agent = await ctx.agentLoop.create(SessionId('crash-demo'), { provider: 'mock', model: 'mock' })
agent.followup(createUserMessage({ content: [{ type: 'text', text: 'deploy to prod, then confirm' }], source: { kind: 'user' } }))
await new Promise(r => setTimeout(r, 100))
const persisted = structuredClone(agent.session.snapshotEvents()) // 崩溃那一刻落盘的日志

const closers = interruptedTurnClosers(persisted)
const lines: string[] = []
lines.push('persisted tail:')
for (const e of persisted.slice(-4)) lines.push(`  ${String(e.seq).padStart(2)} ${e.type}${e.type === 'tool/call' ? ' ' + (e.data as any).callId : ''}${e.type === 'assistant/message' ? ' ' + (e.data as any).message.content.map((b: any) => `tool-call ${b.name}(${b.id})`).join(', ') : ''}`)
lines.push('')
lines.push('interruptedTurnClosers(persisted):')
for (const e of closers) {
  const d = e.data as any
  if (e.type === 'tool/result') {
    lines.push(`  ${e.seq} tool/result ${d.message.toolCallId} isError=${d.message.isError} code=${d.error.code}${e.sourceEventSeqs ? ' sourceEventSeqs=[' + e.sourceEventSeqs.join(',') + ']' : ''}`)
    lines.push(`     "${d.message.content[0].text}"`)
  } else lines.push(`  ${e.seq} ${e.type} ${JSON.stringify(d)}`)
}
const resumed = Session.create(SessionId('resumed'), [...persisted, ...closers])
lines.push('')
lines.push('model view after repair: ' + resumed.deriveMessages().map(m => m.role).join(' → '))
writeFileSync(`${OUT}/out/crash-persisted.json`, JSON.stringify(persisted, null, 2))
writeFileSync(`${OUT}/out/crash-closers.json`, JSON.stringify(closers, null, 2))
writeFileSync(`${OUT}/txt/crash-closers.txt`, lines.join('\n') + '\n')
console.log(lines.join('\n'))
process.exit(0)
