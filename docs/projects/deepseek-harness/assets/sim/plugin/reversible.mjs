// 卸载就撤销：一个插件注册工具、提示词段、监听器和一个 effect，卸载插件后全部消失。
// 注册表是 dsh 真实的 dsh-tools / dsh-system-prompt；插件 weather 是构造的。
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'

const root = new Context()
await root.plugin(SystemPrompt, {})
await root.plugin(ToolRuntime)

function weather(ctx) {
  ctx.tools.register({
    name: 'weather',
    description: 'Look up the weather for a city.',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
    execute: async () => 'sunny',
  })
  ctx.systemPrompt.section({ name: 'weather:guidance', order: 2950, text: 'Use the weather tool for forecasts.' })
  ctx.on('demo/ping', () => console.log('   weather plugin heard ping'))
  ctx.effect(() => { console.log('   effect: open cache'); return () => console.log('   effect: close cache') })
}
weather.inject = ['tools', 'systemPrompt']

const show = async (label) => {
  const tools = root.tools.schemas().map(t => t.name)
  const sections = (await root.systemPrompt.assemble()).sections.map(s => s.name)
  console.log(`${label}\n   tools: ${JSON.stringify(tools)}\n   prompt sections: ${JSON.stringify(sections)}`)
  root.emit('demo/ping')
}

await show('before mount')
const fiber = root.plugin(weather)
await fiber
await show('after mount')
await fiber.dispose()
await show('after dispose')
