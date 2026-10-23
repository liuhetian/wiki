// 让仓库外的实跑脚本能 import 克隆里已构建的 @deepseek-ai/* 包：
// 按包名找到包目录，以包自身为父模块做 self-reference 解析，走它 package.json 的 exports（lib/）。
// 用法：node --experimental-strip-types --import ./hook.mjs run.ts
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.env.DSH_ROOT ?? '/tmp/dsh-src/deepseek-harness'
const dirs = new Map()
function scan(dir, depth) {
  if (depth > 4) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    const pkg = join(full, 'package.json')
    if (existsSync(pkg)) {
      const name = JSON.parse(readFileSync(pkg, 'utf8')).name
      if (typeof name === 'string' && name.startsWith('@deepseek-ai/') && !dirs.has(name)) dirs.set(name, full)
    }
    scan(full, depth + 1)
  }
}
scan(join(ROOT, 'packages'), 0)
scan(join(ROOT, 'vendor'), 0)

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@deepseek-ai/') && !(context.parentURL ?? '').includes(ROOT)) {
      const name = specifier.split('/').slice(0, 2).join('/')
      const dir = dirs.get(name)
      if (dir !== undefined) return next(specifier, { ...context, parentURL: pathToFileURL(join(dir, 'package.json')).href })
    }
    return next(specifier, context)
  },
})
