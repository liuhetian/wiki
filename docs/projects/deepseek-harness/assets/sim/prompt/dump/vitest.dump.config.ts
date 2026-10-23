import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { standardDecoratorPlugin, vitestExecArgv } from '/tmp/dsh-src/deepseek-harness/vitest.shared.ts'

const REPO = '/tmp/dsh-src/deepseek-harness'
export default defineConfig({
  root: REPO,
  plugins: [tsconfigPaths({ projects: [`${REPO}/tsconfig.base.json`] }), standardDecoratorPlugin()],
  test: {
    dir: '/tmp/dsh-lab/prompt/dump',
    include: ['**/*.dump.ts'],
    execArgv: vitestExecArgv,
    testTimeout: 120_000,
    hookTimeout: 60_000,
  },
})
