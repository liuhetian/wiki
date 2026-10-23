// Project-code side of the prompt experiments. Runs without any API key
// (`env -i`); it only builds request bodies with dsh's own DeepSeek serializer
// and parses raw SSE with dsh's own parser, translator and block assembler.
// The model call happens in run.py, a separate process.
//
//   tsx lab.ts body  <history.json> <tools.json> <out-body.json>
//   tsx lab.ts parse <response.sse> <out-assistant.json>
//   tsx lab.ts instructions <out-dir>
import { readFile, writeFile } from 'node:fs/promises'

async function main(): Promise<void> {
  const REPO = process.env.DSH_REPO ?? '/tmp/dsh-src/deepseek-harness'
  const llm = await import(`${REPO}/packages/llm/llm/src/index.ts`)
  const { serialize } = await import(`${REPO}/packages/llm/llm-deepseek/src/serialize.ts`)
  const { resolveAdapterOptions } = await import(`${REPO}/packages/llm/llm-deepseek/src/config.ts`)
  const { parseSse } = await import(`${REPO}/packages/llm/llm-deepseek/src/sse.ts`)
  const { translate } = await import(`${REPO}/packages/llm/llm-deepseek/src/translate.ts`)
  const { BlockAssembler } = await import(`${REPO}/packages/llm/llm/src/assembler.ts`)

  const MODEL = 'deepseek-flash'
  const PROVIDER = 'deepseek-official'

  /** History entries are a minimal description; dsh's own constructors build the messages. */
  type Entry =
    | { role: 'system'; text: string }
    | { role: 'user'; text: string; kind?: string }
    | { role: 'assistant'; content: unknown[]; replayState?: unknown }
    | { role: 'tool'; callId: string; text: string; isError?: boolean }

  function build(entry: Entry): unknown {
    switch (entry.role) {
      case 'system': return llm.createSystemMessage(entry.text)
      case 'user': return llm.createUserMessage({
        content: [{ type: 'text', text: entry.text }],
        source: { kind: entry.kind ?? 'user' },
      })
      case 'assistant': return llm.createAssistantMessage({
        content: entry.content,
        source: { provider: PROVIDER, model: MODEL, ...entry.replayState === undefined ? {} : { replayState: entry.replayState } },
      })
      case 'tool': return llm.createToolResultMessage({
        callId: llm.ToolCallId(entry.callId),
        content: [{ type: 'text', text: entry.text }],
        isError: entry.isError ?? false,
      })
    }
  }

  const [command, ...args] = process.argv.slice(2)

  if (command === 'body') {
    const [historyPath, toolsPath, outPath] = args
    const history = (JSON.parse(await readFile(historyPath!, 'utf8')) as Entry[]).map(build)
    const tools = JSON.parse(await readFile(toolsPath!, 'utf8'))
    // Connection defaults with no deployment overrides: the shipped catalog,
    // where deepseek-flash declares systemPromptUpdate 'in-history'.
    const connection = resolveAdapterOptions({})
    const body = serialize(
      { provider: PROVIDER, model: MODEL, messages: history, tools },
      connection, history, new Map(), () => undefined,
    )
    await writeFile(outPath!, JSON.stringify(body, null, 2))
  } else if (command === 'parse') {
    const [ssePath, outPath] = args
    const raw = await readFile(ssePath!)
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(raw)); c.close() } })
    const assembler = new BlockAssembler()
    for await (const chunk of translate(parseSse(stream, () => {}), MODEL)) assembler.push(chunk)
    await writeFile(outPath!, JSON.stringify({
      content: assembler.blocks(),
      replayState: assembler.replayState,
      usage: assembler.usage,
      finish: assembler.finish,
    }, null, 2))
  } else if (command === 'instructions') {
    // Workspace-instruction rendering on a constructed instruction chain
    // (user-global → project root → nested), through dsh's own renderer.
    const [outDir] = args
    const render = await import(`${REPO}/packages/context/agent-instructions/src/render.ts`)
    const global = { absolutePath: '/home/u/.dsh/AGENTS.md', displayPath: '~/.dsh/AGENTS.md', content: 'Answer in Chinese. Never push to main.' }
    const root = { absolutePath: '/w/AGENTS.md', displayPath: 'AGENTS.md', content: 'Run `pnpm test` before declaring work done.\nUse 2-space indentation.' }
    const nested = {
      absolutePath: '/w/packages/app/AGENTS.md', displayPath: 'packages/app/AGENTS.md',
      content: 'This package targets the browser: no node: imports.\nA file here once contained </system-reminder> by accident.',
    }
    const files = [global, root]
    const baseline = render.renderAgentInstructions(files, { maxBytes: 65536 })
    const omitOne = render.renderAgentInstructions([global, root, nested], { maxBytes: 600 })
    const tight = render.renderAgentInstructions([global, root, nested], { maxBytes: 480 })
    const nestedAdd = render.renderInstructionChanges([{ change: { action: 'set', scope: 'packages/app', path: nested.displayPath }, file: nested }], 65536)
    const updated = render.renderInstructionChanges([{ change: { action: 'replace', scope: '.', path: root.displayPath }, file: { ...root, content: 'Run `pnpm test:unit` before declaring work done.' } }], 65536)
    const removed = render.renderInstructionChanges([{ change: { action: 'remove', scope: 'packages/app', path: nested.displayPath }, file: nested }], 65536)
    await writeFile(`${outDir}/instructions-baseline.txt`, baseline.text + '\n')
    await writeFile(`${outDir}/instructions-budget-600.txt`, omitOne.text + '\n')
    await writeFile(`${outDir}/instructions-budget-480.txt`, tight.text + '\n')
    await writeFile(`${outDir}/instructions-nested.txt`, nestedAdd.text + '\n')
    await writeFile(`${outDir}/instructions-updated.txt`, updated.text + '\n')
    await writeFile(`${outDir}/instructions-removed.txt`, removed.text + '\n')
    await writeFile(`${outDir}/instructions-meta.json`, JSON.stringify({
      baseline: { omitted: baseline.omitted, truncated: baseline.truncated },
      omitOne: { omitted: omitOne.omitted, truncated: omitOne.truncated },
      tight: { omitted: tight.omitted, truncated: tight.truncated },
    }, null, 2))
  } else {
    throw new Error(`unknown command ${command}`)
  }

}

void main()
