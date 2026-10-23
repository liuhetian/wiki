/**
 * 构造的 replace：拿 loop.ts 跑出的真实日志，追加一条 surfaceOp=replace 的 user/message
 * 把第 1 轮（seq 5..13）换成一句摘要，看模型视图怎么变、原事件还在不在；再试两条护栏。
 * 全部调用 dsh-session 的 Session / foldSurface，不自己实现折叠。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import { foldSurface } from '@deepseek-ai/dsh-session/surface'

const OUT = process.argv[2] ?? '.'
const events = JSON.parse(readFileSync(`${OUT}/out/loop-events.json`, 'utf8'))
const session = Session.create(SessionId('surface-demo'), events)
const text = (m: any) => m.content.map((b: any) => b.type === 'text' ? b.text : `[${b.type}${b.name ? ' ' + b.name : ''}]`).join('')
const view = () => session.deriveMessages().map(m => `  ${m.role.padEnd(9)} ${JSON.stringify(text(m)).slice(0, 50)}`).join('\n')
const lines: string[] = []
const seedEnd = session.snapshotEvents().at(-1)!
lines.push(`seeded ${events.length} events; Session.create appended ${seedEnd.type} @${seedEnd.seq}`)
lines.push(`before: nodes [${session.surface.nodes.join(', ')}]`)
lines.push(view())

const before = [...session.surface.nodes]
const shadowed = before.filter(seq => seq >= 5 && seq <= 13)
const summary = session.append('user/message', createUserMessage({
  content: [{ type: 'text', text: 'SUMMARY: user said go; echo returned one; assistant said done.' }],
  source: { kind: 'user' },
}), { surfaceOp: { op: 'replace', startSeq: SessionSeq(5), endSeq: SessionSeq(13) }, sourceEventSeqs: shadowed.map(SessionSeq) })
lines.push('')
lines.push(`append user/message @${summary.seq} with surfaceOp replace 5..13, sourceEventSeqs [${shadowed.join(', ')}]`)
lines.push(`after:  nodes [${session.surface.nodes.join(', ')}]`)
lines.push(view())
lines.push(`log still holds seq 8: ${session.snapshotEvents()[8]!.type} ${JSON.stringify(text((session.snapshotEvents()[8] as any).data.message))}`)
lines.push(`log length ${session.snapshotEvents().length}; foldSurface(log).nodes = [${foldSurface(session.snapshotEvents()).nodes.join(', ')}]`)

lines.push('')
const tryAppend = (label: string, f: () => unknown) => {
  try { f(); lines.push(`${label}: accepted`) } catch (e) { lines.push(`${label}: ${(e as Error).message}`) }
}
const msg = createUserMessage({ content: [{ type: 'text', text: 'x' }], source: { kind: 'user' } })
tryAppend('replace node 0 (system prompt) with a user/message', () => session.append('user/message', msg,
  { surfaceOp: { op: 'replace', startSeq: SessionSeq(4), endSeq: SessionSeq(4) }, sourceEventSeqs: [SessionSeq(4)] }))
tryAppend('replace 20..22 without citing them', () => session.append('user/message', msg,
  { surfaceOp: { op: 'replace', startSeq: SessionSeq(20), endSeq: SessionSeq(22) } }))
writeFileSync(`${OUT}/txt/surface-replace.txt`, lines.join('\n') + '\n')
console.log(lines.join('\n'))
