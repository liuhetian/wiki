// agent 作用域：真实的 dsh-tools / dsh-system-prompt / dsh-scope，
// 子 agent 的定制走真实的 applyChildComposition（dsh-subagent）。
// 三个全局工具、三个 agent 的 key 和子 agent 的人设、工具限制是构造的。
import { Context } from '@deepseek-ai/cordis'
import { createScope } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { applyChildComposition } from '@deepseek-ai/dsh-subagent'
import { ToolCallId } from '@deepseek-ai/dsh-llm'

const root = new Context()
await root.plugin(SystemPrompt, { personaPrefix: 'You are a coding agent powered by the {{model}} model.' })
await root.plugin(ToolRuntime)
root.systemPrompt.variable('model', () => 'deepseek-flash')

const tool = (name, reply = `${name}: global implementation`) => ({
  name, description: `${name} tool`, parameters: { type: 'object', properties: {} },
  output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
  execute: async () => reply,
})
for (const name of ['read', 'bash', 'web_fetch']) root.tools.register(tool(name))

// 三个 agent：agent 对象本身就是作用域的 key（这里用空对象代替）
const mint = async (id) => {
  const key = { id }
  let scope
  await root.plugin(Object.assign(inner => { scope = createScope(inner, key) }, { inject: ['tools', 'systemPrompt'] }))
  return { key, scope }
}
const parent = await mint('parent')
const child = await mint('child')
const other = await mint('other')

// child：照子 agent 的做法换人设、限制工具（真实函数）
applyChildComposition(child.scope.ctx, parent.key, {
  persona: 'You are a read-only reviewer subagent.',
  toolFilter: { deny: ['bash'] },
})
// other：在自己的作用域里注册一个同名 read，遮住全局那个
other.scope.ctx.tools.register(tool('read', 'read: other agent\'s own implementation'))
// other 的作用域监听器：只该听到 other 自己的调用
other.scope.ctx.on('tools/pre-execute', async (exec, next) => {
  console.log(`   [other's listener] saw ${exec.name}`)
  return next()
})

const view = async (label, a) => {
  const asm = await root.systemPrompt.assemble(a ? { scope: a.key } : {})
  console.log(`${label}\n   tools: ${JSON.stringify(root.tools.schemas(a?.key).map(t => t.name))}\n   prompt: ${JSON.stringify(renderPrompt(asm))}\n   contexts: ${JSON.stringify(asm.contexts.map(c => c.name))}`)
}
const run = async (label, a) => {
  console.log(label)
  const r = await root.tools.execute({ signal: new AbortController().signal, callId: ToolCallId('c'), name: 'read', arguments: {}, agent: a.key })
  console.log(`   -> ${r.content.map(b => b.text).join('')}`)
}

await view('parent', parent)
await view('child (persona + deny bash via applyChildComposition)', child)
await view('other (own read shadows the global one)', other)
await run('parent calls read', parent)
await run('other calls read', other)

try { root.tools.restrict({ deny: ['bash'] }) } catch (e) { console.log(`restrict on the global ctx:\n   ${e.message}`) }

await child.scope.dispose()
await view('child after its scope is disposed', child)
