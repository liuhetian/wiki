/**
 * fork 的种子：用 dsh-session 的 buildForkSeed 从两份真实日志各切一刀。
 * A：loop.ts 日志在第 1 轮结束（seq 15）处切——轮次已闭合，只多一条 session/end-seed；
 * B：crash.ts 日志在 deploy 已开始（seq 9）处切——切在开着的轮次里，补上 forked 措辞的结果。
 * 再看子会话派生出的消息是不是父会话同一段的逐字前缀（fork 子 agent 复用缓存靠的就是这个）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { Session, SessionId, SessionSeq, buildForkSeed } from '@deepseek-ai/dsh-session'

const OUT = process.argv[2] ?? '.'
const loop = JSON.parse(readFileSync(`${OUT}/out/loop-events.json`, 'utf8'))
const crash = JSON.parse(readFileSync(`${OUT}/out/crash-persisted.json`, 'utf8'))
const lines: string[] = []
const show = (label: string, events: any[], boundary: number) => {
  const seed = buildForkSeed(events, SessionSeq(boundary))
  lines.push(`${label}: buildForkSeed(log, ${boundary}) -> ${seed.length} events; tail:`)
  for (const e of seed.slice(boundary + 1)) {
    const d = e.data as any
    lines.push(`  ${e.seq} ${e.type}${e.type === 'tool/result' ? ` ${d.message.toolCallId} ${d.error.code}: "${d.message.content[0].text.slice(0, 96)}…"` : ' ' + JSON.stringify(d)}`)
  }
  const child = Session.create(SessionId(`child-${label}`), seed)
  const parent = Session.create(SessionId(`parent-${label}`), events.slice(0, boundary + 1))
  const p = JSON.stringify(parent.deriveMessages())
  const c = JSON.stringify(child.deriveMessages().slice(0, parent.deriveMessages().length))
  lines.push(`  child messages start with the parent's ${parent.deriveMessages().length} messages byte-for-byte: ${p === c}`)
}
show('A', loop, 15)
show('B', crash, 9)
writeFileSync(`${OUT}/txt/fork-seed.txt`, lines.join('\n') + '\n')
console.log(lines.join('\n'))
