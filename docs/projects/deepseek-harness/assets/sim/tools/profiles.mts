// profiles.ts 里三个平台的 profile 生成函数（纯函数），同一份策略各自翻成什么参数。
import { writeFileSync } from 'node:fs'
import { src, show } from './lib.mts'

const { bwrapProfileArgs, landlockProfileArgs, seatbeltProfileArgs } = await src('packages/sandbox/sandbox-local/src/profiles.ts')
const out: string[] = []
for (const mode of ['workspace-write', 'read-only']) {
  const policy = { mode, workspaceRoot: '/home/me/project' }
  out.push(show(`${mode} · bwrap`, ['bwrap', ...bwrapProfileArgs(policy)].join(' ')))
  out.push(show(`${mode} · Landlock`, ['landlock-run', ...landlockProfileArgs(policy)].join(' ')))
  out.push(show(`${mode} · Seatbelt`, ['sandbox-exec', ...seatbeltProfileArgs(policy)].join(' ')))
}
const text = out.join('\n')
writeFileSync(new URL('./out/profiles.txt', import.meta.url), text)
console.log(text)
