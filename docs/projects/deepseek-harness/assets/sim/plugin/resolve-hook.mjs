// Resolve `@deepseek-ai/*` from a script outside the dsh checkout: each name is
// resolved as a self-reference from its own workspace package, so the script
// and dsh's own modules share one instance of every package (built lib/).
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'

const ROOT = process.env.DSH_ROOT ?? '/tmp/dsh-src/deepseek-harness'
const dirs = new Map()
function scan(dir, depth) {
  if (depth > 4) return
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name === 'node_modules' || ent.name.startsWith('.')) continue
    const sub = join(dir, ent.name)
    const pj = join(sub, 'package.json')
    if (existsSync(pj)) {
      const { name } = JSON.parse(readFileSync(pj, 'utf8'))
      if (name?.startsWith('@deepseek-ai/')) dirs.set(name, sub)
    }
    scan(sub, depth + 1)
  }
}
scan(join(ROOT, 'packages'), 0)
scan(join(ROOT, 'vendor'), 0)

registerHooks({
  resolve(specifier, context, next) {
    const m = /^(@deepseek-ai\/[^/]+)/.exec(specifier)
    const dir = m && dirs.get(m[1])
    if (dir) return next(specifier, { ...context, parentURL: pathToFileURL(join(dir, 'package.json')).href })
    return next(specifier, context)
  },
})
