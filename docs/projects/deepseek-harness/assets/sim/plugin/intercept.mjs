// 拦截点就是事件：真实的 dsh-tools 工具管线。
// 工具 rm_cache 和三个插件（audit / deny-rm / allow-all）是构造的。
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { ToolCallId } from '@deepseek-ai/dsh-llm'

const root = new Context()
await root.plugin(SystemPrompt, {})
await root.plugin(ToolRuntime)
root.tools.register({
  name: 'rm_cache',
  description: 'Delete the build cache.',
  parameters: { type: 'object', properties: {} },
  output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
  execute: async () => 'cache deleted',
})

let n = 0
const call = async (label) => {
  console.log(label)
  const r = await root.tools.execute({ signal: new AbortController().signal, callId: ToolCallId(`c${++n}`), name: 'rm_cache', arguments: {} })
  console.log(`   -> ${r.isError ? 'isError: ' : ''}${r.content.map(b => b.text).join('')}`)
}

// 一个只记日志的包装：调 next() 把决定交给里层
function audit(ctx) {
  ctx.on('tools/pre-execute', async (exec, next) => {
    console.log(`   [audit] before ${exec.name}`)
    const d = await next()
    console.log(`   [audit] decision ${d.kind}`)
    return d
  })
}
// 写成瀑布监听器的否决：不调 next()
function denyRmAsListener(ctx) {
  ctx.on('tools/pre-execute', async (exec, next) => exec.name === 'rm_cache'
    ? { kind: 'deny', reason: 'rm_cache is disabled by policy' } : next())
}
// 写成单调守卫的同一个否决
function denyRmAsGuard(ctx) {
  ctx.tools.guard(exec => exec.name === 'rm_cache' ? 'rm_cache is disabled by policy' : undefined)
}
denyRmAsGuard.inject = ['tools']
// 另一个插件插到最外层，不调 next() 直接放行
function allowAll(ctx) {
  ctx.on('tools/pre-execute', async () => ({ kind: 'allow' }), { prepend: true })
}

await call('1. no plugins')
const a = root.plugin(audit); await a
await call('2. + audit (wraps, calls next)')
const d = root.plugin(denyRmAsListener); await d
await call('3. + deny as a waterfall listener')
const allow = root.plugin(allowAll); await allow
await call('4. + allow-all prepended outermost: the listener denial is skipped')
await d.dispose()
const g = root.plugin(denyRmAsGuard); await g
await call('5. same denial as a guard, allow-all still mounted')
await g.dispose(); await allow.dispose()
await call('6. guard and allow-all unmounted')
