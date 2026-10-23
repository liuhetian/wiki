/**
 * Agents-line lab: only calls dsh's own functions; no network, no keys.
 * Run from the dsh checkout so workspace packages resolve:
 *   cd /tmp/dsh-src/deepseek-harness && env -i HOME=$HOME PATH=$PATH \
 *     node_modules/.bin/tsx <this file> <logs-dir> <out-dir>
 * <logs-dir> holds the decompressed session logs written by run.sh.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { inboxProjectionDefinition } from '/tmp/dsh-src/deepseek-harness/packages/core/agent-loop/src/inbox.ts'
import { createSettlementMessage } from '/tmp/dsh-src/deepseek-harness/packages/subagent/subagent/src/continuation-messages.ts'
import { delegationDepthOf } from '/tmp/dsh-src/deepseek-harness/packages/subagent/subagent/src/depth.ts'
import { foldGoal } from '/tmp/dsh-src/deepseek-harness/packages/goal/goal/src/fold.ts'
import { renderGoalRoundPrompt } from '/tmp/dsh-src/deepseek-harness/packages/goal/goal-round-driver/src/prompt.ts'
import { renderReminderFraming } from '/tmp/dsh-src/deepseek-harness/packages/schedule/schedule/src/domain.ts'

const [logsDir, outDir] = process.argv.slice(2)
const out: Record<string, unknown> = {}
const readLog = (file: string) => readFileSync(join(logsDir, file), 'utf8').trim().split('\n').map(l => JSON.parse(l))
const parentFile = readdirSync(logsDir).find(f => f.startsWith('session-b41'))!
const parent = readLog(parentFile).slice(1) // drop the header line; the rest are events with seq

// 1. Inbox: fold the real parent log's splices, then one constructed duplicate.
const brief = (m: { content: { type: string, text?: string }[] }) =>
  m.content.filter(b => b.type === 'text').map(b => b.text!.slice(0, 60)).join(' ').replace(/\n/g, ' ')
let state = inboxProjectionDefinition.init()
const trace: string[] = []
for (const event of parent) {
  if (event.type === 'agent/inbox/spliced') {
    state = inboxProjectionDefinition.apply(state, event)
    const view = (k: 'next-turn' | 'next-step') => state[k].map(brief)
    trace.push(`seq ${event.seq} ${event.data.target} ${event.data.inserted.length ? 'insert' : 'claim '}`
      + ` -> next-turn ${JSON.stringify(view('next-turn'))} next-step ${JSON.stringify(view('next-step'))}`)
  } else if (['turn/start', 'step/start', 'step/end', 'turn/end'].includes(event.type)) {
    trace.push(`seq ${event.seq} ${event.type} ${JSON.stringify(event.data)}`)
  }
}
const pendingMsg = parent.find(e => e.type === 'agent/inbox/spliced' && e.data.target === 'next-step' && e.data.inserted.length)
let dup = inboxProjectionDefinition.init()
dup = inboxProjectionDefinition.apply(dup, { ...pendingMsg, seq: 0 })
try {
  inboxProjectionDefinition.apply(dup, { ...pendingMsg, seq: 1, data: { ...pendingMsg.data, target: 'next-turn' } })
} catch (error) {
  const e = error as Error
  trace.push(`constructed: the same pending message spliced again -> ${e.message} <- ${(e.cause as Error).message}`)
}
writeFileSync(join(outDir, 'txt/inbox-fold.txt'), trace.join('\n') + '\n')

// 2. Settlement notices for each ending (constructed terminal results, real function).
const text = (s: string) => [{ type: 'text' as const, text: s }]
const endings = [
  ['completed', { output: text('The `agent/turn-stopping` event lets a listener stop a turn; it is serial.'), stopReason: 'completed' }, true],
  ['completed, one-shot backend', { output: text('Done.'), stopReason: 'completed' }, false],
  ['aborted, no closing text', { output: [], stopReason: 'aborted' }, true],
  ['error with diagnostic', { output: [], stopReason: 'error', diagnostic: 'LLM request failed: 429 rate limited' }, true],
  ['structured output', { output: text('Found 2 call sites.'), stopReason: 'completed', structured: { callSites: ['a.ts:12', 'b.ts:40'] } }, true],
] as const
const notices = endings.map(([label, terminal, continuable]) => {
  const msg = createSettlementMessage('child-1' as never, terminal as never, continuable)
  return `## ${label}\n` + msg.content.map(b => (b as { text: string }).text).join('\n') + `\nsource: ${JSON.stringify(msg.source)}`
})
writeFileSync(join(outDir, 'txt/settlement-notices.txt'), notices.join('\n\n') + '\n')

// 3. Delegation depth: persisted header vs runtime option (constructed agents).
const agent = (header: number | undefined, runtime: number | undefined) =>
  ({ session: { header: header === undefined ? {} : { delegationDepth: header } }, options: runtime === undefined ? {} : { subagentDepth: runtime } }) as never
const depth = [
  ['fresh top-level agent', undefined, undefined],
  ['live child (header 1, runtime 1)', 1, 1],
  ['child resumed cold (header 1, fresh options)', 1, undefined],
  ['runtime option claims 0 on a depth-1 session', 1, 0],
].map(([label, h, r]) => `${label}: delegationDepthOf = ${delegationDepthOf(agent(h as never, r as never))}`)
writeFileSync(join(outDir, 'txt/delegation-depth.txt'), depth.join('\n') + '\n')

// 4. Goal fold: constructed log; human turns do not consume rounds, a skipped round is rejected.
const goal = (revision: number) => ({ id: 'g1', revision, objective: 'Make every test in packages/foo pass', phase: 'active', maxGoalRounds: 3 })
const change = { kind: 'goal/change', version: 1, operation: 'create', goal: goal(1), roundsStarted: 0, createdAt: 1, updatedAt: 1 }
const round = (n: number) => ({ content: text('<goal_round>…'), source: { kind: 'goal', goalId: 'g1', revision: 1, round: n } })
const human = { content: text('also add a changelog entry'), source: { kind: 'user' } }
const log = [
  { seq: 0, type: 'goal/change', data: change },
  { seq: 1, type: 'user/message', data: round(1) },
  { seq: 2, type: 'user/message', data: human },
  { seq: 3, type: 'user/message', data: human },
  { seq: 4, type: 'user/message', data: round(2) },
]
const goalLines = [
  `after create, round 1, two human messages, round 2: ${JSON.stringify(foldGoal(log as never))}`,
]
try {
  foldGoal([...log, { seq: 5, type: 'user/message', data: round(4) }] as never)
} catch (e) { goalLines.push(`constructed: round 4 right after round 2 -> ${(e as Error).message}`) }
writeFileSync(join(outDir, 'txt/goal-fold.txt'), goalLines.join('\n') + '\n')
writeFileSync(join(outDir, 'txt/goal-round-prompt.txt'),
  (renderGoalRoundPrompt({ ...goal(1), roundsStarted: 2 } as never, 3)[0] as { text: string }).text + '\n')

// 5. Schedule: a due one-shot reminder becomes this followup text (constructed record).
writeFileSync(join(outDir, 'txt/schedule-reminder.txt'), renderReminderFraming({
  id: 'sch-1', scheduledAt: '2026-10-21T09:00:00.000Z', prompt: 'Check whether the nightly benchmark finished and summarize regressions.',
} as never) + '\n')

out.done = true
console.log(JSON.stringify(out))
