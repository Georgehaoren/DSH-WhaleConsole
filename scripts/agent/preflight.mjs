import { readFile, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const json = args.includes('--json')
const allowUnsupportedArch = args.includes('--allow-unsupported-arch')
const language = args.includes('--lang=zh-CN') ? 'zh-CN' : 'en'
const dshArg = args.find(value => value.startsWith('--dsh-repo='))
const dshRepo = dshArg ? resolve(dshArg.slice('--dsh-repo='.length)) : null
const rootManifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const results = []
const commandEnvironment = {
  ...process.env,
  PATH: [join(homedir(), '.cargo/bin'), process.env.PATH].filter(Boolean).join(delimiter),
}

function text(en, zh) {
  return language === 'zh-CN' ? zh : en
}

function command(name, commandArgs = []) {
  const result = spawnSync(name, commandArgs, { encoding: 'utf8', env: commandEnvironment })
  return result.status === 0 ? (result.stdout || result.stderr).trim() : null
}

function add(id, status, en, zh) {
  results.push({ id, status, message: text(en, zh) })
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

add('platform', process.platform === 'darwin' ? 'ok' : 'error', `Platform: ${process.platform}`, `系统平台：${process.platform}`)
add(
  'architecture',
  process.arch === 'arm64' || allowUnsupportedArch ? (process.arch === 'arm64' ? 'ok' : 'warning') : 'error',
  `Architecture: ${process.arch}${process.arch === 'arm64' ? '' : ' (not a supported Preview target)'}`,
  `处理器架构：${process.arch}${process.arch === 'arm64' ? '' : '（不属于当前支持的 Preview 目标）'}`,
)

const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number)
const nodeOk = (nodeMajor === 22 && nodeMinor >= 19) || nodeMajor >= 24
add('node', nodeOk ? 'ok' : 'error', `Node.js: ${process.version}`, `Node.js：${process.version}`)

const pnpm = command('pnpm', ['--version'])
const expectedPnpm = rootManifest.packageManager.split('@')[1]
add(
  'pnpm',
  !pnpm ? 'error' : pnpm === expectedPnpm ? 'ok' : 'warning',
  pnpm ? `pnpm: ${pnpm} (workspace: ${expectedPnpm})` : 'pnpm was not found on PATH.',
  pnpm ? `pnpm：${pnpm}（工作区版本：${expectedPnpm}）` : 'PATH 中找不到 pnpm。',
)

for (const [id, executable, commandArgs] of [
  ['git', 'git', ['--version']],
  ['rustc', 'rustc', ['--version']],
  ['cargo', 'cargo', ['--version']],
  ['xcode', 'xcode-select', ['-p']],
  ['tar', 'tar', ['--version']],
  ['unzip', 'unzip', ['-v']],
]) {
  const version = command(executable, commandArgs)
  add(id, version ? 'ok' : 'error', version ? `${id}: ${version.split('\n')[0]}` : `${executable} was not found.`, version ? `${id}：${version.split('\n')[0]}` : `找不到 ${executable}。`)
}

for (const executable of ['ditto']) {
  const path = command('which', [executable])
  add(executable, path ? 'ok' : 'error', path ? `${executable}: ${path}` : `${executable} was not found.`, path ? `${executable}：${path}` : `找不到 ${executable}。`)
}

for (const path of ['pnpm-lock.yaml', 'apps/launcher/src-tauri/Cargo.lock', 'packages/plugin/cordis.patch.yml']) {
  add(`file:${path}`, await isFile(resolve(root, path)) ? 'ok' : 'error', `Repository file: ${path}`, `仓库文件：${path}`)
}

if (dshRepo) {
  const manifest = resolve(dshRepo, 'package.json')
  add('dsh-repo', await isFile(manifest) ? 'ok' : 'error', `DSH checkout: ${dshRepo}`, `DSH 源码目录：${dshRepo}`)
}

if (json) {
  process.stdout.write(`${JSON.stringify({ ok: !results.some(result => result.status === 'error'), results }, null, 2)}\n`)
} else {
  for (const result of results) {
    const mark = result.status === 'ok' ? 'OK' : result.status === 'warning' ? 'WARN' : 'ERROR'
    process.stdout.write(`[${mark}] ${result.message}\n`)
  }
}

if (results.some(result => result.status === 'error')) process.exit(1)
