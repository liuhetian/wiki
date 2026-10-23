// 换提供方不动消费方：消费方只 inject 'shell'。
// 提供方一：dsh 真实的 LocalBashExecutor（经真实的 dsh-subprocess-local 起进程）。
// 提供方二：构造的 DryRunBash，照 SandboxBashExecutor 的写法继承 LocalBashExecutor，只改 resolve。
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SubprocessLocal from '@deepseek-ai/dsh-subprocess-local'
import { LocalBashExecutor } from '@deepseek-ai/dsh-bash-local'

const cwd = mkdtempSync(join(tmpdir(), 'dsh-seam-'))
const log = (...a) => console.log(...a)
const root = new Context()

class DryRunBash extends LocalBashExecutor {
  resolve(request) {
    return super.resolve({ ...request, command: `echo '[dry-run] ${request.command}'` })
  }
}

// 消费方：照 tool-bash 的样子只声明依赖 shell，不知道是谁在提供
function consumer(ctx) {
  log(`consumer: activated, ctx.shell is ${ctx.shell.constructor.name}`)
  ctx.on('demo/run', async (command, done) => {
    const exec = await ctx.shell.execute(ctx.shell.resolve({ command }))
    const res = await exec.result()
    done(`${ctx.shell.constructor.name} -> exit ${res.exitCode}, stdout ${JSON.stringify(res.stdout.text.trim())}`)
  })
  ctx.effect(() => () => log('consumer: deactivated'))
}
consumer.inject = ['shell']

const run = (cmd) => new Promise(resolve => {
  let answered = false
  root.emit('demo/run', cmd, (msg) => { answered = true; resolve(msg) })
  setTimeout(() => { if (!answered) resolve('(no consumer listening)') }, 200)
})

log('1. mount consumer (no shell provider yet)')
await root.plugin(consumer)
log('   run:', await run('echo hello'))

log('2. mount subprocess-local + LocalBashExecutor')
await root.plugin(SubprocessLocal)
const local = root.plugin(LocalBashExecutor, { cwd })
await local
await new Promise(r => setTimeout(r, 50))
log('   run:', await run('echo hello'))

log('3. dispose LocalBashExecutor')
await local.dispose()
await new Promise(r => setTimeout(r, 50))
log('   run:', await run('echo hello'))

log('4. mount DryRunBash in its place')
await root.plugin(DryRunBash, { cwd })
await new Promise(r => setTimeout(r, 50))
log('   run:', await run('echo hello'))
process.exit(0)
