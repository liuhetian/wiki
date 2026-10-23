// 真的 Cordis 组合：沙箱提供方 + 策略 + 子进程 + 沙箱版 bash 执行器，和上游 partial-landlock.spec.ts 同一套装配。
// 唯一替换：发行版的 landlock-run 预编译件不在克隆里，用 build-launcher.sh 从同一份 main.c 编出来的二进制。
// bwrap 的探测、Landlock 的探测、平台链都走真代码（本机没装 bwrap，所以会落到 Landlock）。
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'
import { pkg, src, cordis, LAUNCHER, show } from './lib.mts'

const { Context } = await cordis()
const SessionProjectionRegistry = (await pkg('packages/session/session-projection')).default
const { LocalSandboxProvider } = await pkg('packages/sandbox/sandbox-local')
const { SandboxPolicyService } = await pkg('packages/sandbox/sandbox-policy')
const LocalSubprocessRuntime = (await pkg('packages/subprocess/subprocess-local')).default
const { SandboxBashExecutor } = await pkg('packages/shell/bash-sandbox')
const { ESCALATION_TARGETS } = await pkg('packages/sandbox/sandbox')
const { classifyRunnerFailure } = await src('packages/sandbox/sandbox/src/diagnostics.ts')
const { renderResult } = await src('packages/shell/tool-bash/src/render.ts')

const out: string[] = []
const runs: string[] = []
const txt = (name: string, body: string) => writeFileSync(new URL(`./txt/${name}`, import.meta.url), body.endsWith('\n') ? body : body + '\n')
const ws = mkdtempSync(join(tmpdir(), 'dsh-ws-'))
const outside = join(homedir(), 'dsh-landlock-outside.txt')
if (existsSync(outside)) rmSync(outside)

async function compose(launcher: string) {
  const ctx = new Context()
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(LocalSandboxProvider, {})
  ctx.sandbox.internals = { landlockLauncher: launcher }
  await ctx.plugin(SandboxPolicyService, { mode: 'workspace-write', workspaceRoot: ws })
  await ctx.plugin(LocalSubprocessRuntime)
  await ctx.plugin(SandboxBashExecutor, { cwd: ws, timeoutMs: 5_000 })
  return ctx
}

const ctx = await compose(LAUNCHER)

// 1. 本机选中的后端、包装后的 argv
const confined = await ctx.sandbox.confine(['bash', '-c', 'echo hi'], { mode: 'workspace-write', workspaceRoot: ws })
const confineView = {
  argv: confined.argv.map((a: string) => a.replace(ws, '<ws>').replace(LAUNCHER, '<landlock-run>')),
  enforcement: confined.enforcement,
  denialSignatures: confined.denialSignatures,
  runnerFailureRules: confined.runnerFailureRules,
}
out.push(show('confine(["bash","-c","echo hi"], workspace-write)', confineView))
txt('confine.txt', JSON.stringify(confineView, null, 2))

// 2. 几条命令真跑：结果 + 模型看到的文本（tool-bash 的 renderResult，带放宽提示）
const cases: Array<{ label: string; command: string; mode?: string }> = [
  { label: '工作区内写', command: 'echo inside > inside.txt && cat inside.txt' },
  { label: '工作区外写（$HOME）', command: `echo outside > ${outside}` },
  { label: '读不受限', command: 'wc -l < /etc/hosts' },
  { label: '命令自己失败：false', command: 'false' },
  { label: '命令自己失败：grep 没匹配（同 ripgrep 无匹配退出 1）', command: 'grep -q no-such-text /etc/hosts' },
  { label: 'read-only 下连工作区也不能写', command: 'echo x > ro.txt', mode: 'read-only' },
]
for (const c of cases) {
  const spec = ctx.shell.resolve({
    command: c.command,
    workdir: ws,
    ...(c.mode ? { sandboxPolicy: { mode: c.mode, workspaceRoot: ws } } : {}),
  })
  const result = await (await ctx.shell.execute(spec)).result()
  const shownCmd = c.command.replace(outside, '$HOME/dsh-landlock-outside.txt')
  runs.push(`# ${c.label}（${c.mode ?? 'workspace-write'}）\n$ ${shownCmd}\nsandbox: ${JSON.stringify(result.sandbox)}\n--- 模型拿到 ---\n${renderResult(result, ESCALATION_TARGETS).replaceAll(outside, '$HOME/dsh-landlock-outside.txt')}`)
  out.push(show(`${c.label}：${shownCmd}`, {
    exitCode: result.exitCode,
    stderr: result.stderr.text.replaceAll(outside, '$HOME/dsh-landlock-outside.txt'),
    sandbox: result.sandbox,
    modelSees: renderResult(result, ESCALATION_TARGETS).replaceAll(outside, '$HOME/dsh-landlock-outside.txt'),
  }))
}
out.push(show('$HOME 下的文件被写出来了吗', existsSync(outside)))
runs.push(`# 跑完检查：$HOME/dsh-landlock-outside.txt ${existsSync(outside) ? '存在' : '不存在'}`)
txt('landlock-runs.txt', runs.join('\n\n'))

// 3. 失败分类：真 confine() 给出的 Landlock 规则 vs 只认前缀的规则（后者是照 postmortem 0004 构造的对照）
const NOTICE = 'landlock-run: partial enforcement (older Landlock ABI)'
const prefixOnly = [{ fatalSignatures: ['landlock-run: '] }]
const inputs: Array<[string, number, string]> = [
  ['子进程 false：提示行 + 退出 1', 1, `${NOTICE}\n`],
  ['子进程自选退出 125：只有提示行', 125, `${NOTICE}\n`],
  ['启动器真坏了：退出 125 + 致命行', 125, 'landlock-run: landlock ruleset error: Invalid argument\n'],
]
const verdict = (m: any) => m === undefined ? '命令跑了（不算启动器失败）' : `启动器失败：${m.detail}`
txt('classify.txt', inputs.map(([label, code, stderr]) => `# ${label}\n  退出码 ${code}，stderr：${JSON.stringify(stderr)}\n  真规则      → ${verdict(classifyRunnerFailure(code, stderr, confined.runnerFailureRules))}\n  只认前缀    → ${verdict(classifyRunnerFailure(code, stderr, prefixOnly))}`).join('\n\n'))
out.push(show('classifyRunnerFailure：真规则 vs 只认前缀', inputs.map(([label, code, stderr]) => ({
  input: label,
  real: classifyRunnerFailure(code, stderr, confined.runnerFailureRules) ?? '(不是启动器失败)',
  prefixOnly: classifyRunnerFailure(code, stderr, prefixOnly) ?? '(不是启动器失败)',
}))))

// 4. 没有可用后端：启动器路径指向不存在的文件，bwrap 也没有 → confine 直接拒绝
const broken = await compose('/nonexistent/landlock-run')
try {
  await broken.sandbox.confine(['true'], { mode: 'workspace-write', workspaceRoot: ws })
  out.push(show('没有后端', '居然没抛错'))
} catch (error: any) {
  out.push(show('没有后端时 confine() 抛出', { name: error.name, code: error.code, message: error.message }))
  txt('unavailable.txt', `${error.name} [${error.code}]\n${error.message}`)
}

await ctx.fiber.dispose()
await broken.fiber.dispose()
rmSync(ws, { recursive: true, force: true })
const text = out.join('\n')
writeFileSync(new URL('./out/sandbox.txt', import.meta.url), text)
console.log(text)
