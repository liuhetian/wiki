// bash 结果的几种标记：tool-bash 的 render.ts 两个纯函数，喂构造的执行结果（不真跑命令）。
import { writeFileSync } from 'node:fs'
import { src } from './lib.mts'

const { renderResult, renderPromoted } = await src('packages/shell/tool-bash/src/render.ts')
const base = { exitCode: 0, signal: null, timedOut: false, aborted: false, timeoutMs: 60000,
  stdout: { text: '', truncated: false }, stderr: { text: '', truncated: false } }
const cases: Array<[string, string]> = [
  ['成功、没输出', renderResult(base)],
  ['退出码非零', renderResult({ ...base, exitCode: 2, stderr: { text: 'tsc: 3 errors\n', truncated: false } })],
  ['输出太长被截到尾部', renderResult({ ...base, stdout: { text: '…last lines of the build log\n', truncated: true, spillPath: '/tmp/dsh-spill/session-1/bash-stdout.txt' } })],
  ['超时（不转后台的部署）', renderResult({ ...base, exitCode: null, signal: 'SIGTERM', timedOut: true })],
  ['被人从界面上停掉', renderResult({ ...base, exitCode: null, signal: 'SIGTERM', stopped: 'stopped by the user' })],
  ['超时转后台（默认）', renderPromoted({ jobId: 'job_3', timeoutMs: 60000, output: 'Compiling 412 modules...\n' })],
]
const text = cases.map(([label, s]) => `# ${label}\n${s}`).join('\n\n') + '\n'
writeFileSync(new URL('./txt/render.txt', import.meta.url), text)
writeFileSync(new URL('./out/render.txt', import.meta.url), text)
console.log(text)
