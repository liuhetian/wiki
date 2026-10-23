/**
 * 特殊时刻的补丁文本，全部由 dsh 自己的代码生成；模型是仓库测试里的 MockAdapter（按脚本出回复，构造的）。
 * 1. 重复调用提醒：真的 AgentLoop + repeat-tool-reminder（默认阈值 3/5/8），脚本让模型连发 8 次同一个调用
 * 2. 超时：同一个 loop 挂上 timeout-policy，一个声明 timeoutMs: 50 的工具故意拖 1 秒
 * 3. 图片省略：dsh-llm 的 textOnlyImageText / offloadedImageText，喂一个构造的图片引用
 *
 * 用法：env -i HOME=$HOME PATH=$PATH node --experimental-transform-types --no-warnings \
 *         --import ./hook.mjs lab-texts.ts <out_txt_dir>
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { Context } from '@deepseek-ai/cordis'
import { createUserMessage, textOnlyImageText, offloadedImageText } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import * as RepeatToolReminder from '@deepseek-ai/dsh-repeat-tool-reminder'
import * as TimeoutPolicy from '@deepseek-ai/dsh-tool-call-timeout-policy'
import { MockAdapter, textResponse, toolCallResponse } from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/tests/mock-adapter.ts'

const out = process.argv[2]
mkdirSync(out, { recursive: true })

const ctx = new Context()
await mountAgentLoopTestDependencies(ctx)
await ctx.plugin(RepeatToolReminder, {})
await ctx.plugin(TimeoutPolicy)
ctx.tools.register(defineContentToolFixture({
  name: 'grep', description: 'Search file contents.', parameters: {},
  async execute() { return [{ type: 'text', text: 'No matches.' }] },
}))
ctx.tools.register(defineContentToolFixture({
  name: 'slow_check', description: 'A check that takes a while.', parameters: {}, timeoutMs: 50,
  async execute(_args, exec) { await sleep(1000, undefined, { signal: exec.signal }).catch(() => {}); return [{ type: 'text', text: 'finished' }] },
}))
ctx.llm.registerAdapter(['mock'], new MockAdapter([
  ...Array.from({ length: 8 }, (_, i) => toolCallResponse(`g${i}`, 'grep', { pattern: 'TODO', path: 'src' })),
  toolCallResponse('s0', 'slow_check', {}),
  textResponse('done'),
]))
const harness = await mountAgentLoopTestHarness(ctx)
const agent = await harness.create(SessionId('special-texts'), { provider: 'mock', model: 'mock' })
agent.followup(createUserMessage({ content: [{ type: 'text', text: 'Find the TODOs.' }], source: { kind: 'user' } }))
await agent.whenIdle()

const rows: string[] = []
let call = 0
for (const event of agent.session.snapshotEvents()) {
  if (event.type === 'tool/call') rows.push(`--- seq ${event.seq} tool/call #${++call} ${event.data.name} ${JSON.stringify(event.data.arguments)}`)
  if (event.type === 'tool/result') {
    const text = event.data.message.content.map(block => block.type === 'text' ? block.text : '').join('')
    rows.push(`    seq ${event.seq} tool/result: ${text}`)
  }
  if (event.type === 'user/message' && event.data.source.kind !== 'user') {
    const text = event.data.content.map(block => block.type === 'text' ? block.text : '').join('')
    rows.push(`    seq ${event.seq} user/message (${event.data.source.kind}):\n${text.split('\n').map(line => `      ${line}`).join('\n')}`)
  }
}
writeFileSync(join(out, 'repeat-and-timeout.txt'), rows.join('\n') + '\n')
console.log(rows.join('\n'))

const ref = {
  attachmentId: 'sha256:9f2c41d07ab35e18c4f0e3b2a1d6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
  mediaType: 'image/png', bytes: 482113, width: 1440, height: 900, name: 'screenshot.png',
} as never
const images = [
  '# 纯文本模型收到一张图（textOnlyImageText）',
  textOnlyImageText(ref),
  '',
  '# 图片预算超限、最早的图被替下（offloadedImageText，没有本地副本时）',
  offloadedImageText(ref),
].join('\n')
writeFileSync(join(out, 'image-omitted.txt'), images + '\n')
console.log(images)
await ctx.fiber.dispose()
