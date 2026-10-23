// 工具管线：真的 ToolRuntime（Cordis 装配），注册一个构造的 delete_path 工具，挂不同的监听器和守卫看结果。
// 和上游 core/tools/tests/scoped.spec.ts 的写法一致；假 agent 是构造的。
import { writeFileSync } from 'node:fs'
import { pkg, cordis, fakeAgent } from './lib.mts'

const { Context } = await cordis()
const SystemPrompt = (await pkg('packages/core/system-prompt')).default
const ToolRuntime = (await pkg('packages/core/tools')).default
const ApprovalService = (await pkg('packages/interaction/user-approval')).default

const lines: string[] = []
let n = 0

async function trial(label: string, setup: (ctx: any) => void | Promise<void>, withApproval = false) {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt, {})
  await ctx.plugin(ToolRuntime)
  if (withApproval) await ctx.plugin(ApprovalService)
  let bodyRan = false
  ctx.tools.register({
    name: 'delete_path',
    description: 'delete a path',
    parameters: { type: 'object', properties: { path: { type: 'string' } } },
    output: { schema: { type: 'string' }, render: (_a: unknown, v: unknown) => [{ type: 'text', text: v as string }] },
    execute: (args: { path: string }) => { bodyRan = true; return Promise.resolve(`deleted ${args.path}`) },
  })
  await setup(ctx)
  const { agent, appended } = fakeAgent('s1', '/ws')
  const result = await ctx.tools.execute({
    signal: new AbortController().signal, callId: `call_${++n}`, name: 'delete_path',
    arguments: { path: '/etc/passwd' }, agent,
  })
  const text = result.content.map((b: any) => b.text).join('')
  const audit = appended.filter(e => e.type.startsWith('approval/')).map((e: any) => `${e.type}${e.data.outcome ? ' ' + e.data.outcome : ''}`)
  lines.push(`${label}\n  工具体跑了吗：${bodyRan ? '跑了' : '没跑'}\n  模型拿到：${text}${audit.length ? `\n  审计：${audit.join(' → ')}` : ''}`)
  await ctx.fiber.dispose()
}

const outsideWs = (exec: any) => !String(exec.arguments.path).startsWith('/ws/')
const policy = (ctx: any) => ctx.on('tools/pre-execute', (exec: any, next: () => Promise<unknown>) =>
  outsideWs(exec) ? Promise.resolve({ kind: 'deny', reason: `refusing to touch ${exec.arguments.path} outside the workspace` }) : next())
const sloppy = (ctx: any) => ctx.on('tools/pre-execute', () => Promise.resolve({ kind: 'allow' }), { prepend: true })
const guard = (ctx: any) => ctx.tools.guard((exec: any) => outsideWs(exec) ? `refusing to touch ${exec.arguments.path} outside the workspace` : undefined)

await trial('1. 什么都不挂', () => {})
await trial('2. 挂一个策略监听器：工作区外就 deny', policy)
await trial('3. 再来一个插件，prepend 进最外层，直接 allow 不调 next()', (ctx) => { policy(ctx); sloppy(ctx) })
await trial('4. 同样两个监听器，策略改成守卫（只能否决）', (ctx) => { guard(ctx); sloppy(ctx) })
await trial('5. 监听器想把参数改成安全路径', (ctx) => ctx.on('tools/pre-execute', (exec: any, next: () => Promise<unknown>) => { exec.arguments.path = '/ws/tmp'; return next() }))
await trial('6. 监听器要 ask，但没装审批服务', (ctx) => ctx.on('tools/pre-execute', () => Promise.resolve({ kind: 'ask', reason: 'delete_path outside the workspace' })))
await trial('7. 监听器要 ask，审批服务在，但没有回答方', (ctx) => ctx.on('tools/pre-execute', () => Promise.resolve({ kind: 'ask', reason: 'delete_path outside the workspace' })), true)

const text = lines.join('\n\n') + '\n'
writeFileSync(new URL('./txt/pipeline.txt', import.meta.url), text)
writeFileSync(new URL('./out/pipeline.txt', import.meta.url), text)
console.log(text)
