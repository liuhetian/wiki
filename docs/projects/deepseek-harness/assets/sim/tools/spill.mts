// 大输出落盘：真的 ToolRuntime + spill-policy + 本地落盘存储（Cordis 装配）。
// 构造的部分：一个吐 400 行日志的 fetch_log 工具、假 agent；maxInlineTokens 设成 300 好在页面上放得下（base 组合包是 12500）。
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pkg, cordis, fakeAgent } from './lib.mts'

const { Context } = await cordis()
const SystemPrompt = (await pkg('packages/core/system-prompt')).default
const ToolRuntime = (await pkg('packages/core/tools')).default
const SpillPolicy = await pkg('packages/spill/spill-policy')
const LocalSpillStore = (await pkg('packages/spill/spill-local')).default

const root = mkdtempSync(join(tmpdir(), 'dsh-spill-'))
const ctx = new Context()
await ctx.plugin(SystemPrompt, {})
await ctx.plugin(ToolRuntime)
await ctx.plugin(LocalSpillStore, { root })
await ctx.plugin(SpillPolicy, { maxInlineTokens: 300 })
const log = Array.from({ length: 400 }, (_, i) => `2026-10-20T12:00:${String(i % 60).padStart(2, '0')} worker-${i % 7} processed batch ${i} ok`).join('\n') + '\n'
ctx.tools.register({
  name: 'fetch_log',
  description: 'fetch the worker log',
  parameters: { type: 'object', properties: {} },
  output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text', text: v as string }] },
  execute: () => Promise.resolve(log),
})
const { agent } = fakeAgent('s1', '/ws')
const r = await ctx.tools.execute({ signal: new AbortController().signal, callId: 'c1', name: 'fetch_log', arguments: {}, agent })
const text = r.content.map((b: any) => b.text).join('')
const path = /stored at: (\S+?)\. Use/.exec(text)?.[1] as string
const saved = readFileSync(path, 'utf8')
const shown = text.replaceAll(root, '<spill-root>')
writeFileSync(new URL('./txt/spill.txt', import.meta.url), shown + '\n')
writeFileSync(new URL('./out/spill.txt', import.meta.url),
  `原始输出 ${Buffer.byteLength(log)} 字节 / ${log.split('\n').length - 1} 行；落盘文件 ${Buffer.byteLength(saved)} 字节，与原始输出${saved === log ? '一致' : '不一致'}\n\n模型拿到：\n${shown}\n`)
await ctx.fiber.dispose()
rmSync(root, { recursive: true, force: true })
console.log(readFileSync(new URL('./out/spill.txt', import.meta.url), 'utf8'))
