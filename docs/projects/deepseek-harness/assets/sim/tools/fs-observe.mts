// 先读后改：真的 ToolRuntime + 本地文件系统 + 观察策略 + read/write/edit 工具（Cordis 装配，同上游 tool-fs 测试）。
// 构造的部分：假 agent（只有 session.header.cwd）；「用户在两次调用之间改了文件」用 node 直接写盘模拟。
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pkg, cordis, fakeAgent } from './lib.mts'

const { Context } = await cordis()
const SystemPrompt = (await pkg('packages/core/system-prompt')).default
const ToolRuntime = (await pkg('packages/core/tools')).default
const LocalFileSystem = (await pkg('packages/fs/fs-local')).default
const FsPolicy = await pkg('packages/fs/fs-observation-policy')
const ToolFs = await pkg('packages/fs/tool-fs')
const { provideWorkingDirectoryFixture } = await pkg('packages/test-support/agent-loop-testkit')

const ws = mkdtempSync(join(tmpdir(), 'dsh-fs-'))
writeFileSync(join(ws, 'a.txt'), 'color = red\n')
const ctx = new Context()
provideWorkingDirectoryFixture(ctx, ws)
await ctx.plugin(SystemPrompt, {})
await ctx.plugin(ToolRuntime)
await ctx.plugin(LocalFileSystem, { cwd: ws })
await ctx.plugin(FsPolicy)
await ctx.plugin(ToolFs, {})
const { agent } = fakeAgent('s1', ws)

let n = 0
const lines: string[] = []
async function call(label: string, name: string, args: unknown) {
  const r = await ctx.tools.execute({ signal: new AbortController().signal, callId: `c${++n}`, name, arguments: args, agent })
  const text = r.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').replaceAll(ws, '<ws>')
  const code = r.error?.info?.code
  lines.push(`${label}\n  ${name} ${JSON.stringify(args)}\n  ${r.isError ? `报错${code ? ` [${code}]` : ''}：` : '成功：'}${text.length > 160 ? text.slice(0, 160) + '…' : text}`)
}

await call('1. 没读过就改', 'edit', { file_path: 'a.txt', old_string: 'red', new_string: 'blue' })
await call('2. 没读过就整篇覆盖', 'write', { file_path: 'a.txt', content: 'color = green\n' })
await call('3. 先读', 'read', { file_path: 'a.txt' })
writeFileSync(join(ws, 'a.txt'), 'color = red\nsize = 3\n')
lines.push('（用户这时在编辑器里给 a.txt 加了一行 size = 3）')
await call('4. 拿着旧版本去改', 'edit', { file_path: 'a.txt', old_string: 'red', new_string: 'blue' })
await call('5. 重新读', 'read', { file_path: 'a.txt' })
await call('6. 再改', 'edit', { file_path: 'a.txt', old_string: 'red', new_string: 'blue' })
lines.push(`最终文件内容：${JSON.stringify(readFileSync(join(ws, 'a.txt'), 'utf8'))}`)

await ctx.fiber.dispose()
rmSync(ws, { recursive: true, force: true })
const text = lines.join('\n\n') + '\n'
writeFileSync(new URL('./txt/fs-observe.txt', import.meta.url), text)
writeFileSync(new URL('./out/fs-observe.txt', import.meta.url), text)
console.log(text)
