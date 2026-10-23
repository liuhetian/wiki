// 权限记进日志、再原样告诉模型：真的 SystemPrompt + 会话投影 + 沙箱策略服务 + 审批服务 + 一个真的 Session。
// 部署默认是 base 组合包的 workspace-write + ask；之后像用户在界面上切预设那样，往会话日志里追加
// sandbox/mode、approval/policy 事件（setSandboxMode / setApprovalPolicy 是两个服务自己导出的写入口），
// 每次都重新 assemble()，用 renderContextSnapshot() 渲染成发给模型的那条运行时上下文。
import { writeFileSync } from 'node:fs'
import { pkg, cordis } from './lib.mts'

const { Context } = await cordis()
const SystemPrompt = (await pkg('packages/core/system-prompt')).default
const { renderContextSnapshot } = await pkg('packages/core/system-prompt')
const SessionProjectionRegistry = (await pkg('packages/session/session-projection')).default
const { SandboxPolicyService, setSandboxMode } = await pkg('packages/sandbox/sandbox-policy')
const ApprovalService = (await pkg('packages/interaction/user-approval')).default
const { setApprovalPolicy } = await pkg('packages/interaction/user-approval')
const { SESSION_FORMAT_VERSION, Session, SessionId } = await pkg('packages/core/session')

const ctx = new Context()
await ctx.plugin(SystemPrompt, {})
await ctx.plugin(SessionProjectionRegistry)
await ctx.plugin(SandboxPolicyService, { mode: 'workspace-write', workspaceRoot: '/home/me/project' })
await ctx.plugin(ApprovalService, { policy: 'ask' })
const id = SessionId('s1')
const session = Session.create(id, undefined, { version: SESSION_FORMAT_VERSION, id, createdAt: 0, isSeeded: false, cwd: '/home/me/project' })
const agent = { session }

const parts: string[] = []
const log = () => session.snapshotEvents().map((e: any) => `${e.type} ${JSON.stringify(e.data)}`).join('\n') || '(空)'
const snap = async (label: string) => {
  parts.push(`# ${label}\n会话日志：\n${log()}\n\n模型看到：\n${renderContextSnapshot(await ctx.systemPrompt.assemble({ agent }))}`)
}
await snap('新会话，用部署默认值')
setSandboxMode(session, 'read-only')
await snap('用户切到 read-only')
setSandboxMode(session, 'danger-full-access')
setApprovalPolicy(session, 'never')
await snap('用户切到 danger-full-access + never')
await ctx.fiber.dispose()
const text = parts.join('\n\n') + '\n'
writeFileSync(new URL('./txt/policy-context.txt', import.meta.url), text)
writeFileSync(new URL('./out/policy-context.txt', import.meta.url), text)
console.log(text)
