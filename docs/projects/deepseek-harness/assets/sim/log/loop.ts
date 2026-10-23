/**
 * 用 dsh 自己的 agent loop + 测试用的 MockAdapter 跑一段四轮会话，打印：
 * 1) 日志里每个事件；2) 模型视图（foldSurface 的 nodes）；3) 每个发出去的请求能否只凭日志前缀重建；
 * 4) 改一个已发出的请求会怎样。模型回复是脚本写死的（构造的），循环、日志、派生全是项目代码。
 * 搭法照 packages/core/agent-loop/tests/request-reconstruction.spec.ts 的 harness()。
 */
import { writeFileSync } from 'node:fs'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { createUserMessage, LlmError, ToolCallId } from '@deepseek-ai/dsh-llm'
import SessionStore, { Session, SessionId, foldRequestHeader } from '@deepseek-ai/dsh-session'
import { foldSurface } from '@deepseek-ai/dsh-session/surface'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/lib/index.js'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { MockAdapter, textResponse, toolCallResponse } from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/tests/mock-adapter.ts'

const OUT = process.argv[2] ?? '.'

const adapter = new MockAdapter([
  toolCallResponse('c1', 'echo', { text: 'one' }, 'calling echo'), // 第 1 轮第 1 步：调工具
  textResponse('done'),                                           // 第 1 轮第 2 步：收尾
  () => { throw new LlmError('busy', 'RATE_LIMIT') },              // 第 2 轮：第一次请求失败
  textResponse('ok'),                                             // 第 2 轮：重试成功
  { hangAfter: [                                                  // 第 3 轮：写到一半被用户取消
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text: '第一点是' },
    { type: 'block-end', index: 0, block: { type: 'text', text: '第一点是' } },
    { type: 'block-start', index: 1, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 1, id: ToolCallId('c2'), name: 'echo', argumentsDelta: '{"te' },
  ] },
  textResponse('第二点是……'),                                       // 第 4 轮
])

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
  name: 'echo', description: 'echo back', parameters: { text: { type: 'string' } },
  async execute(args) { return [{ type: 'text', text: `echo: ${String(args.text)}` }] },
}))
ctx.on('agent/request-error', async () => ({ kind: 'retry' })) // 失败就重试一次（llm-retry 插件的简化替身）

const agent = await ctx.agentLoop.create(SessionId('log-demo'), { provider: 'mock', model: 'mock' })
const say = (text: string) => agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))

say('go'); await agent.whenIdle()
say('again'); await agent.whenIdle()
say('讲讲三点'); await new Promise(r => setTimeout(r, 30)); agent.cancel({ kind: 'user' }); await agent.whenIdle()
say('第二点展开讲讲'); await agent.whenIdle()

const events = agent.session.snapshotEvents()
writeFileSync(`${OUT}/out/loop-events.json`, JSON.stringify(events, null, 2))

// 1) 事件表
const brief = (e: any): string => {
  const d = e.data
  switch (e.type) {
    case 'user/message': return `${d.source.kind}: ${JSON.stringify(d.content.map((b: any) => b.text ?? b.type).join('')).slice(0, 40)}`
    case 'assistant/message': return d.message.content.map((b: any) => b.type === 'text' ? JSON.stringify(b.text) : b.type === 'tool-call' ? `tool-call ${b.name}` : b.type).join(' + ') + (d.interrupted ? '  interrupted' : '')
    case 'assistant/attempt': return `stream ${d.stream.length} 段，不进模型视图`
    case 'system/message': return JSON.stringify(d.message.content.map((b: any) => b.text).join('')).slice(0, 40)
    case 'tool/call': return `${d.call?.name ?? d.name ?? ''}`
    case 'tool/result': return JSON.stringify(d.message.content.map((b: any) => b.text ?? b.type).join('')).slice(0, 40)
    case 'request/header': return `reason=${d.reason}`
    case 'turn/end': return `reason=${typeof d.reason === 'string' ? d.reason : d.reason.kind}`
    case 'turn/start': return `turn ${d.turn}`
    case 'step/start': case 'step/end': return `turn ${d.turn} step ${d.step}`
    default: return ''
  }
}
const op = (e: any) => e.surfaceOp === undefined ? '' : typeof e.surfaceOp === 'string' ? e.surfaceOp : `replace ${e.surfaceOp.startSeq}..${e.surfaceOp.endSeq}`
const table = events.map(e => `${String(e.seq).padStart(2)}  ${e.type.padEnd(18)} ${op(e).padEnd(7)} ${brief(e)}`)
writeFileSync(`${OUT}/txt/loop-events.txt`, table.join('\n') + '\n')

// 2) 模型视图
const { nodes } = foldSurface(events)
const roles = agent.session.deriveMessages().map(m => m.role)
writeFileSync(`${OUT}/txt/loop-surface.txt`, `nodes: [${nodes.join(', ')}]\nderived roles: ${roles.join(' → ')}\n`)

// 3) 每个请求只凭日志前缀重建
const settlements = events.filter(e => e.type === 'assistant/message' || e.type === 'assistant/attempt')
const lines: string[] = []
adapter.requests.forEach((request, i) => {
  const settlement = settlements[i]!
  const rebuilt = Session.create(SessionId(`rebuild-${i}`), structuredClone(events.slice(0, settlement.seq)))
  const sameMessages = JSON.stringify(structuredClone(request.messages)) === JSON.stringify(rebuilt.deriveMessages())
  const header = foldRequestHeader(events.slice(0, settlement.seq))!
  const sameTools = JSON.stringify(request.tools ?? []) === JSON.stringify(header.tools ?? [])
  const prev = adapter.requests[i - 1]
  const extendsPrev = prev === undefined ? '-' : String(JSON.stringify(request.messages.slice(0, prev.messages.length)) === JSON.stringify(prev.messages))
  lines.push(`request ${i + 1}: ${request.messages.length} messages, settled as ${settlement.type} @${settlement.seq}; rebuilt from log[0..${settlement.seq - 1}] equal=${sameMessages && sameTools}; extends previous=${extendsPrev}; frozen=${Object.isFrozen(request) && Object.isFrozen(request.messages)}`)
})
// 第 4 轮的请求里有没有第 3 轮被取消时用户已经看到的半截
const last = adapter.requests.at(-1)!
const partial = last.messages.filter(m => m.role === 'assistant').flatMap(m => m.content).flatMap(b => b.type === 'text' ? [b.text] : [])
lines.push(`last request carries the interrupted prefix: ${partial.includes('第一点是')}`)

// 4) 插件拿到冻结的请求后想改它
try {
  ;(adapter.requests[0]!.messages as any[]).push({ role: 'user', content: [] })
  lines.push('mutation: allowed')
} catch (error) { lines.push(`mutation: ${(error as Error).constructor.name}: ${(error as Error).message}`) }
writeFileSync(`${OUT}/txt/loop-rebuild.txt`, lines.join('\n') + '\n')
console.log(table.join('\n')); console.log(lines.join('\n'))
process.exit(0)
