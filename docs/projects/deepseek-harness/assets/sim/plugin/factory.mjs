// agent 循环只是一行：真实的 dsh-agent 注册表，不挂 dsh-agent-loop 时 create 会怎样；
// 再挂一个构造的循环 TinyLoop（只实现工厂接口的 create），注册表就能出 agent。
import { Context } from '@deepseek-ai/cordis'
import Agents from '@deepseek-ai/dsh-agent'

const root = new Context()
await root.plugin(Agents)
try {
  await root.agents.create({ provider: 'deepseek', model: 'deepseek-flash' })
} catch (e) {
  console.log('without a loop plugin:', e.message)
}

function tinyLoop(ctx) {
  ctx.effect(() => ctx.agents.setFactory({
    createAgent: async (_owner, options) => { throw new Error(`TinyLoop.createAgent got model=${options.model} (a real loop builds the agent here)`) },
    resume: async () => { throw new Error('not implemented') },
  }), 'tinyLoop.setFactory()')
}
tinyLoop.inject = ['agents']
const loop = root.plugin(tinyLoop); await loop
try {
  await root.agents.create({ provider: 'deepseek', model: 'deepseek-flash' })
} catch (e) {
  console.log('with TinyLoop mounted:  ', e.message)
}
const second = root.plugin(tinyLoop)
await new Promise(r => setTimeout(r, 20))
console.log('a second loop plugin:    ', second._error?.message ?? '(no error)')
await second.dispose()
await loop.dispose()
try {
  await root.agents.create({ provider: 'deepseek', model: 'deepseek-flash' })
} catch (e) {
  console.log('after TinyLoop unmount: ', e.message)
}
