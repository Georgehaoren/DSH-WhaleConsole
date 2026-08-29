import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { basename, delimiter, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipInstall = args.includes('--skip-install')
const ci = args.includes('--ci')
const withComposition = args.includes('--with-composition')
const language = args.includes('--lang=zh-CN') ? 'zh-CN' : 'en'
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const version = manifest.version
const arch = process.arch
const dist = resolve(root, 'dist')
const appBundle = resolve(root, 'apps/launcher/src-tauri/target/release/bundle/macos/DSH WhaleConsole.app')
const tarball = resolve(dist, `dsh-whale-console-${version}.tgz`)
const appZip = resolve(dist, `DSH-WhaleConsole-${version}-macos-${arch}.zip`)
const checksums = resolve(dist, `SHA256SUMS-${version}.txt`)
const commandEnvironment = {
  ...process.env,
  PATH: [join(homedir(), '.cargo/bin'), process.env.PATH].filter(Boolean).join(delimiter),
}

function text(en, zh) {
  return language === 'zh-CN' ? zh : en
}

function run(command, commandArgs, env = {}) {
  process.stdout.write(`\n> ${command} ${commandArgs.join(' ')}\n`)
  if (dryRun) return
  const result = spawnSync(command, commandArgs, { cwd: root, env: { ...commandEnvironment, ...env }, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

run('node', [resolve(root, 'scripts/agent/preflight.mjs'), ...(ci ? ['--allow-unsupported-arch'] : []), `--lang=${language}`])
if (!skipInstall) run('pnpm', ['install', '--frozen-lockfile'])
run('pnpm', ['docs:check'])
run('pnpm', ['skill:check'])
run('pnpm', ['typecheck'])
run('pnpm', ['test'])
run('pnpm', ['build'])
run('cargo', ['check', '--locked', '--manifest-path', 'apps/launcher/src-tauri/Cargo.toml'])
if (!dryRun) await mkdir(dist, { recursive: true })
run('pnpm', ['--filter', 'dsh-whale-console', 'run', 'pack'])
if (withComposition) {
  if (!process.env.DSH_REPO) {
    process.stderr.write(text('Set DSH_REPO before using --with-composition.\n', '使用 --with-composition 前请设置 DSH_REPO。\n'))
    process.exit(1)
  }
  run('pnpm', ['--filter', 'dsh-whale-console', 'test:composition'], { DSH_REPO: process.env.DSH_REPO })
}
run('pnpm', ['--filter', '@dsh-whale-console/launcher', 'run', 'tauri:build:app'])

if (dryRun) {
  process.stdout.write(text('\nDry run completed without changing build artifacts.\n', '\n演练完成，未修改构建产物。\n'))
  process.exit(0)
}

if (!(await isDirectory(appBundle))) throw new Error(`Tauri app bundle was not created: ${appBundle}`)
await rm(appZip, { force: true })
run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appBundle, appZip])

const lines = []
for (const path of [tarball, appZip]) {
  const digest = createHash('sha256').update(await readFile(path)).digest('hex')
  lines.push(`${digest}  ${basename(path)}`)
}
await writeFile(checksums, `${lines.join('\n')}\n`)
run('node', [resolve(root, 'scripts/agent/verify-artifacts.mjs'), `--arch=${arch}`, `--lang=${language}`])

process.stdout.write(text(
  `\nPreview build completed. Artifacts are in ${dist}.\n`,
  `\nPreview 构建完成，产物位于 ${dist}。\n`,
))
