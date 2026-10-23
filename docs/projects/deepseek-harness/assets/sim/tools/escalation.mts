// 放宽申请：真的 ApprovalService（Cordis 装配）+ 沙箱包的 approveEscalation。
// agent 是构造的：和上游 approval.spec.ts 一样只有 session 的 seq / eventAt / append，处在一个打开的轮次里。
// 回答方（approval/request 监听器）也是构造的，代替界面上的批准弹窗。
import { writeFileSync } from 'node:fs'
import { pkg, cordis, fakeAgent, show } from './lib.mts'

const { Context } = await cordis()
const ApprovalService = (await pkg('packages/interaction/user-approval')).default
const { setApprovalPolicy } = await pkg('packages/interaction/user-approval')
const { approveEscalation } = await pkg('packages/sandbox/sandbox')

const out: string[] = []
const brief: string[] = []
const JUST = 'the user asked to write a file outside the workspace'

async function trial(label: string, opts: {
  effectiveMode?: string, requestedMode?: string, answer?: () => unknown, policy?: 'ask' | 'never', noService?: boolean,
}) {
  const ctx = new Context()
  if (!opts.noService) await ctx.plugin(ApprovalService)
  const { agent, appended } = fakeAgent('s1', '/ws')
  if (opts.policy) setApprovalPolicy(agent.session, opts.policy)
  if (opts.answer) ctx.on('approval/request', () => Promise.resolve().then(opts.answer))
  let result: unknown
  try {
    result = { granted: await approveEscalation(
      { requestedMode: opts.requestedMode ?? 'danger-full-access', justification: JUST, effectiveMode: opts.effectiveMode ?? 'workspace-write', subject: 'command' },
      { approver: ctx.get('approval'), agent, callId: 'call_1', toolName: 'bash' },
    ) }
  } catch (error: any) {
    result = { thrown: error.message }
  }
  const audit = appended.filter(e => e.type.startsWith('approval/'))
  out.push(show(label, { result, audit }))
  const decided = audit.find(e => e.type === 'approval/decided') as any
  const r = result as any
  brief.push(`${label}\n  审计：${decided ? `asked → decided ${decided.data.outcome}` : '（没有问）'}\n  结果：${r.granted ? `放行，本次按 ${r.granted} 跑` : `报错 ${r.thrown}`}`)
  await ctx.fiber.dispose()
}

await trial('用户批准一次', { answer: () => 'allowed-once' })
await trial('用户拒绝', { answer: () => 'rejected' })
await trial('没人回答（没有界面）', {})
await trial('回答方抛错', { answer: () => { throw new Error('ui crashed') } })
await trial('回答方返回词表外的值', { answer: () => 'yes' })
await trial('会话策略是 never：回答方想批也没用', { policy: 'never', answer: () => 'allowed-once' })
await trial('申请和当前一样的档：不问', { requestedMode: 'workspace-write', answer: () => 'allowed-once' })
await trial('申请更窄的档：拒收', { requestedMode: 'read-only', answer: () => 'allowed-once' })
await trial('没装审批服务', { noService: true })

const text = out.join('\n')
writeFileSync(new URL('./out/escalation.txt', import.meta.url), text)
writeFileSync(new URL('./txt/escalation.txt', import.meta.url), brief.join('\n\n') + '\n')
console.log(text)
