// 共用：按绝对路径加载上游克隆里已构建的包（lib/），和包之间互相解析到的是同一份模块。
// 只有没导出的内部文件（render.ts、profiles.ts）才直接加载 src/*.ts。
export const R = '/tmp/dsh-src/deepseek-harness'
export const LAUNCHER = '/tmp/dsh-lab/tools/landlock-run'

export const pkg = (dir: string): Promise<any> => import(`${R}/${dir}/lib/index.js`)
export const src = (file: string): Promise<any> => import(`${R}/${file}`)
export const cordis = (): Promise<any> => import(`${R}/vendor/cordis/lib/index.js`)

/** 和上游测试里一样的假 agent：只有 session 的 seq / eventAt / append，默认处在一个打开的轮次里。 */
export function fakeAgent(id: string, cwd: string, seed: Array<{ type: string; data?: unknown }> = [{ type: 'turn/start' }, { type: 'user/message' }]) {
  const events: Array<{ type: string; data?: unknown }> = [...seed]
  const appended: Array<{ type: string; data?: unknown }> = []
  const session = {
    id,
    header: { id, cwd },
    get seq() { return events.length },
    eventAt: (seq: number) => events[seq],
    append: (type: string, data: unknown) => {
      const event = { type, data }
      events.push(event)
      appended.push(event)
      return event
    },
    requestHeader: () => undefined,
  }
  return { agent: { id, session, options: {} } as any, appended }
}

export const show = (label: string, value: unknown): string =>
  `## ${label}\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`
