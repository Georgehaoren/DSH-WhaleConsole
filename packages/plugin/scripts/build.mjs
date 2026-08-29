import { build, context } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skinRegistry = resolve(root, '../skins/src/index.ts')
const watch = process.argv.includes('--watch')
const outdir = resolve(root, 'lib')
const css = await readFile(resolve(root, 'src/client/styles.css'), 'utf8')
await rm(outdir, { recursive: true, force: true })
await mkdir(outdir, { recursive: true })

const hostOptions = {
  entryPoints: [resolve(root, 'src/index.ts')],
  outfile: resolve(outdir, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  packages: 'external',
}

const clientOptions = {
  entryPoints: [resolve(root, 'src/client/index.tsx')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: ['chrome120', 'safari17'],
  jsx: 'automatic',
  define: { __WHALE_CONSOLE_CSS__: JSON.stringify(css) },
  alias: { '@dsh-whale-console/skins': skinRegistry },
  loader: { '.webp': 'dataurl' },
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/*',
  ],
}

async function writeClient() {
  const result = await build(clientOptions)
  const body = result.outputFiles[0].text
  const wrapped = `window.__ModuleLoader__.load({\n  id: "dsh-whale-console",\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;\n${body}\n    return module.exports;\n  }\n});\n`
  await writeFile(resolve(outdir, 'client.js'), wrapped)
}

if (watch) {
  const host = await context(hostOptions)
  await host.watch()
  await writeClient()
  console.log('WhaleConsole plugin is watching host sources. Restart for client changes.')
} else {
  await build(hostOptions)
  await writeClient()
}
