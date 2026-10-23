/**
 * 格式升级不覆盖旧文件：拿项目录制的一份 v0 会话（snapshots/session/text-turn/session.jsonl，
 * 占位符换回真值），放进临时会话根目录，用 dsh-session-persistence-jsonl 先只读打开、再写打开，
 * 看目录里多了什么、旧文件动没动。全部是项目代码；只有占位符替换是脚本做的。
 */
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '/tmp/dsh-src/deepseek-harness/packages/session/session-persistence-jsonl/lib/index.js'
import { generationLogPath } from '/tmp/dsh-src/deepseek-harness/packages/session/session-persistence-jsonl/src/format.ts'

const SNAP = '/tmp/dsh-src/deepseek-harness/snapshots/session/text-turn'
const OUT = process.argv[2] ?? '.'
const id = SessionId('text-turn-demo')
const system = await readFile(`${SNAP}/system-prompt.expected.md`, 'utf8')
const tools = await readFile(`${SNAP}/tool-schemas.expected.json`, 'utf8')
const v0 = (await readFile(`${SNAP}/session.jsonl`, 'utf8'))
  .replaceAll('{{session:1}}', id).replaceAll('{{cwd}}', '/tmp/demo-cwd')
  .replace(/\{\{message:(\d+)\}\}/g, 'm$1')
  .replace('"{{system}}"', JSON.stringify(system)).replace('"{{tools}}"', JSON.stringify(JSON.parse(tools).initial))
  .trim().split('\n').map((line, index, all) => line) // keep rows
// 快照归一化时去掉了 seq / time；按行号补回（打包的 *-chunks 行占 texts.length 个 seq）
let next = 0
const rows = v0.map((line, i) => {
  if (i === 0) return line
  const row = JSON.parse(line)
  if (row.type.endsWith('-chunks')) { row.seq0 = next; row.time0 = 1_783_600_629_539 + next; next += row.data.texts.length }
  else { row.seq = next; row.time = 1_783_600_629_539 + next; next += 1 }
  return JSON.stringify(row)
}).join('\n') + '\n'

const root = await mkdtemp(join(tmpdir(), 'dsh-migrate-'))
const v0Path = generationLogPath(root, '/tmp/demo-cwd', id, 0, 'none')
await mkdir(dirname(v0Path), { recursive: true })
await writeFile(v0Path, rows)
const sha = async (p: string) => createHash('sha256').update(await readFile(p)).digest('hex').slice(0, 16)
const ls = async () => (await readdir(dirname(v0Path))).sort().join(', ')
const header = async (name: string) => JSON.parse((await readFile(join(dirname(v0Path), name), 'utf8')).split('\n')[0]!)
const lines: string[] = []
lines.push(`stored: ${relative(root, v0Path)}  version=${(await header('session.jsonl')).version}  sha256=${await sha(v0Path)}  rows=${v0.length}`)

const ctx = new Context()
await ctx.plugin(JsonlSessionPersistence, { root, compression: 'none' })
const persistence = (ctx as any).sessionPersistence

const r = await persistence.open(id, 'read')
const readEvents = (await r.read()).events
await r.close()
lines.push(`open(read):  ${readEvents.length} current events (${[...new Set(readEvents.map((e: any) => e.type))].slice(0, 6).join(', ')}, …); dir = ${await ls()}`)

const w = await persistence.open(id, 'write')
await w.close()
const files = (await readdir(dirname(v0Path))).sort()
lines.push(`open(write): dir = ${files.join(', ')}`)
for (const f of files) {
  const body = await readFile(join(dirname(v0Path), f), 'utf8')
  lines.push(`  ${f}: ${body.length} bytes${f.endsWith('.jsonl') && body.length > 0 ? ` version=${JSON.parse(body.split('\n')[0]!).version} sha256=${await sha(join(dirname(v0Path), f))}` : ''}`)
}
lines.push(`v0 file unchanged: ${(await sha(v0Path)) === lines[0]!.match(/sha256=(\w+)/)![1]}`)
await writeFile(`${OUT}/txt/migrate.txt`, lines.join('\n') + '\n')
console.log(lines.join('\n'))
await ctx.fiber.dispose()
process.exit(0)
