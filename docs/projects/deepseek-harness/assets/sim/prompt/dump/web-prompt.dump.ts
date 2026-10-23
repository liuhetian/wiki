// Boot the real Web composition in-process with the project's own test scaffold
// (no browser), create one agent with the default preset mounted, and dump what
// the system-prompt service assembles for it. Nothing here re-implements dsh logic.
import { writeFile } from 'node:fs/promises'
import { it } from 'vitest'
import { SessionId } from '/tmp/dsh-src/deepseek-harness/packages/core/session/src/index.ts'
import { renderPrompt, renderContextSnapshot } from '/tmp/dsh-src/deepseek-harness/packages/core/system-prompt/src/index.ts'
import { launchWebScaffold } from '/tmp/dsh-src/deepseek-harness/apps/web/tests/scaffold.ts'
import { REPO_ROOT } from '/tmp/dsh-src/deepseek-harness/apps/web/tests/support.ts'
import { assembleContextFor } from '/tmp/dsh-src/deepseek-harness/packages/core/agent/src/dispatch.ts'

const OUT = process.env.DUMP_OUT ?? '/tmp/dsh-lab/prompt/dump/out'

it('dumps the assembled Web system prompt', async () => {
  const scaffold = await launchWebScaffold()
  try {
    const handle = await scaffold.ctx.agents.create({
      sessionId: SessionId('prompt-dump'),
      agentOptions: { provider: 'deepseek-official', model: process.env.DUMP_MODEL ?? 'deepseek-v4-flash' },
      meta: { cwd: scaffold.workspaceCwd },
      setup: agentCtx => scaffold.ctx.agentPresets.mount(agentCtx).then(() => undefined),
    })
    try {
      const agent = scaffold.ctx.agents.get(SessionId('prompt-dump'))
      if (agent === undefined) throw new Error('agent missing')
      await writeFile(`${OUT}/web-agent-options.json`, JSON.stringify({ provider: agent.options.provider, model: agent.options.model }, null, 2))
      const assembly = await scaffold.ctx.systemPrompt.assemble(assembleContextFor(agent))
      const norm = (s: string) => s.split(REPO_ROOT).join('{{sourceRoot}}').split(scaffold.baseUrl).join('{{webUrl}}').split(scaffold.workspaceCwd).join('{{cwd}}')
      await writeFile(`${OUT}/web-system-prompt.txt`, norm(renderPrompt(assembly)) + '\n')
      await writeFile(`${OUT}/web-runtime-context.txt`, norm(renderContextSnapshot(assembly)) + '\n')
      await writeFile(`${OUT}/web-sections.json`, JSON.stringify(assembly.sections.map(s => ({ name: s.name, chars: s.text.length })), null, 2))
      await writeFile(`${OUT}/web-contexts.json`, JSON.stringify(assembly.contexts.map(s => ({ name: s.name })), null, 2))
      await writeFile(`${OUT}/web-tools.json`, JSON.stringify(assembly.tools.map(t => t.name), null, 2))
      await writeFile(`${OUT}/web-variables.json`, JSON.stringify(assembly.variables, null, 2))
      await writeFile(`${OUT}/web-tool-schemas.json`, JSON.stringify(assembly.tools, null, 2))
      // The user switches this session to plan mode: the plan-mode section starts rendering.
      // The base bundle's plan-mode guidance, registered the way a preset shadows a section:
      // through the agent's own scoped context, at the centrally owned PLAN_POLICY order.
      const { readFile } = await import('node:fs/promises')
      const planText = (await readFile(`${OUT}/plan-section.txt`, 'utf8')).trimEnd()
      await new Promise<void>((resolve) => {
        (agent as any).ctx.inject(['systemPrompt'], (c: any) => {
          c.systemPrompt.section({ name: 'plan:policy', order: c.systemPrompt.getSectionOrder('PLAN_POLICY'), text: planText })
          resolve()
        })
      })
      const planned = await scaffold.ctx.systemPrompt.assemble(assembleContextFor(agent))
      const selected = 'scoped-section'
      await writeFile(`${OUT}/web-system-prompt-plan.txt`, norm(renderPrompt(planned)) + '\n')
      await writeFile(`${OUT}/web-plan-set.json`, JSON.stringify({ selected, toolsSame: JSON.stringify(planned.tools) === JSON.stringify(assembly.tools) }, null, 2))
    } finally {
      await handle?.dispose?.()
    }
  } finally {
    await scaffold.close()
  }
})
