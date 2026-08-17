// 把本项目用到的运行时库打成浏览器可直接 import 的 ESM 单文件，
// 输出到 zensical-wiki 的全站共享 docs/vendor/，供免构建 demo 页通过 import map 引用。
// 原则：react / three / fiber 等“单例敏感”的包全部 external，靠页面 import map 指向唯一文件。
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// react 系是 CJS 包，esbuild 直接打只会得到 default export——
// 用反射枚举真实导出，生成显式 re-export 的 wrapper 入口
function cjsWrapper(pkg) {
  const keys = Object.keys(require(pkg)).filter(
    (k) => k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k),
  )
  // import 解析后的真实文件路径而非包说明符：esbuild 的 external 是包名前缀匹配，
  // external ['react-dom'] 会连 'react-dom/client' 一起 external 掉，导致 wrapper 自引用成环
  const file = require.resolve(pkg)
  return `import m from '${file}'\nexport default m\nexport const { ${keys.join(', ')} } = m\n`
}

const WIKI_VENDOR = '/data2/work/lht/study/26.06/zensical-wiki/docs/vendor'
mkdirSync(`${WIKI_VENDOR}/react-esm`, { recursive: true })
mkdirSync(`${WIKI_VENDOR}/r3f`, { recursive: true })

const common = {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
}

// react 系：彼此 external，保证页面里只有一份实例
const reactJobs = [
  { entry: 'react', out: 'react-esm/react.js', external: [], wrap: true },
  { entry: 'react/jsx-runtime', out: 'react-esm/jsx-runtime.js', external: ['react'], wrap: true },
  { entry: 'scheduler', out: 'react-esm/scheduler.js', external: [], wrap: true },
  { entry: 'react-dom', out: 'react-esm/react-dom.js', external: ['react', 'scheduler'], wrap: true },
  {
    entry: 'react-dom/client',
    out: 'react-esm/react-dom-client.js',
    external: ['react', 'react-dom', 'scheduler'],
    wrap: true,
  },
]

// R3F 生态：external 掉 react/three/fiber，其余依赖（reconciler、zustand、rapier wasm…）打进产物
const R3F_EXTERNAL = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  'scheduler',
  'three',
]
const r3fJobs = [
  { entry: '@react-three/fiber', out: 'r3f/fiber.js', external: R3F_EXTERNAL },
  {
    entry: '@react-three/rapier',
    out: 'r3f/rapier.js',
    external: [...R3F_EXTERNAL, '@react-three/fiber'],
  },
  { entry: 'meshline', out: 'r3f/meshline.js', external: ['three'] },
]

// CJS 模块（react-dom、react-reconciler…）对 external 包的 require() 在 ESM 产物里
// 会落到 esbuild 的 __require 并在浏览器抛错。补救：banner 里 import 这些 external，
// 并提供模块作用域的 require —— __require 检测到它存在就会改用它。
function requireShim(pkgs) {
  if (!pkgs.length) return ''
  const imports = pkgs.map((p, i) => `import * as __m${i} from "${p}";`).join('')
  const map = pkgs.map((p, i) => `"${p}":__m${i}`).join(',')
  return `${imports}const __shimmap={${map}};const require=(n)=>{const m=__shimmap[n];if(!m)throw new Error("[vendor shim] no module: "+n);return m.default??m};`
}

for (const job of [...reactJobs, ...r3fJobs]) {
  await build({
    ...common,
    banner: { js: requireShim(job.external) },
    ...(job.wrap
      ? {
          stdin: {
            contents: cjsWrapper(job.entry),
            resolveDir: process.cwd(),
            sourcefile: `${job.entry.replace(/\//g, '-')}-wrapper.js`,
          },
        }
      : { entryPoints: [job.entry] }),
    external: job.external,
    outfile: `${WIKI_VENDOR}/${job.out}`,
  })
}

// drei 只取本 demo 用到的四个导出，靠 tree-shake 甩掉大部分体积；
// 以后别的 demo 需要更多组件时，在这里加导出重跑本脚本即可。
await build({
  ...common,
  banner: { js: requireShim([...R3F_EXTERNAL, '@react-three/fiber']) },
  stdin: {
    contents: `export { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'`,
    resolveDir: process.cwd(),
    sourcefile: 'drei-slim-entry.js',
  },
  external: [...R3F_EXTERNAL, '@react-three/fiber'],
  outfile: `${WIKI_VENDOR}/r3f/drei-slim.js`,
})

console.log('done')
