// agent 预设的两块底座：作用域父链 + 服务的 isolate realm。
// 用真实的 dsh-scope / dsh-tools / cordis / LocalBashExecutor；
// 两套「预设」的内容（各带哪些工具、哪个 shell）和 DryRunBash 是构造的。
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { createScope } from '@deepseek-ai/dsh-scope'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import SubprocessLocal from '@deepseek-ai/dsh-subprocess-local'
import { LocalBashExecutor } from '@deepseek-ai/dsh-bash-local'

const cwd = mkdtempSync(join(tmpdir(), 'dsh-preset-'))
class DryRunBash extends LocalBashExecutor {
  resolve(request) { return super.resolve({ ...request, command: `echo '[dry-run] ${request.command}'` }) }
}
const tool = (name) => ({
  name, description: `${name} tool`, parameters: { type: 'object', properties: {} },
  output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
  execute: async () => name,
})
const tick = () => new Promise(r => setTimeout(r, 50))

const root = new Context()
await root.plugin(SystemPrompt, {})
await root.plugin(ToolRuntime)
await root.plugin(SubprocessLocal)
root.tools.register(tool('read'))          // Host 层：所有 agent 都有

const minter = async (fn) => { let out; await root.plugin(Object.assign(inner => { out = fn(inner) }, { inject: ['tools', 'systemPrompt', 'subprocess'] })); return out }

// 两套预设各常驻一份：每份有自己的作用域 key
const presets = {}
for (const [id, Shell, extra] of [['standard', LocalBashExecutor, ['bash', 'web_fetch']], ['minimal', DryRunBash, []]]) {
  const key = { preset: id }
  const scope = await minter(inner => createScope(inner, key))
  for (const name of extra) scope.ctx.tools.register(tool(name))
  // 预设自带的服务装进自己的 realm
  const realm = scope.ctx.isolate('shell')
  await realm.plugin(Shell, { cwd })
  let seen
  await realm.plugin(Object.assign(ctx => { seen = ctx.shell.constructor.name }, { inject: ['shell'] }))
  presets[id] = { key, scope, shellSeenInside: () => seen }
}
await tick()

// agent 挂到某套预设下：作用域父链指向那份预设
const agents = {}
for (const [name, preset] of [['a1', 'standard'], ['a2', 'standard'], ['b1', 'minimal']]) {
  const key = { agent: name }
  await minter(inner => createScope(inner, key, { parent: presets[preset].key }))
  agents[name] = key
}

for (const [name, key] of Object.entries(agents)) {
  console.log(`${name}: tools ${JSON.stringify(root.tools.schemas(key).map(t => t.name))}`)
}
for (const [id, p] of Object.entries(presets)) console.log(`shell inside preset ${id}: ${p.shellSeenInside()}`)
console.log(`shell at the root realm: ${root.get('shell')?.constructor.name ?? '(none)'}`)

// 不 isolate：两套预设的 shell 抢同一个根 realm
const first = root.plugin(LocalBashExecutor, { cwd }); await first
const second = root.plugin(DryRunBash, { cwd }); await tick()
console.log(`without isolate, second shell provider: ${second._error?.message ?? '(no error)'}`)
process.exit(0)
