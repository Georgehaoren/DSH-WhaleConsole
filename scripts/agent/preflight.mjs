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
const dshRepoInput = dshArg?.slice('--dsh-repo='.length) || process.env.DSH_REPO
const dshRepo = dshRepoInput ? resolve(dshRepoInput) : null
const rootManifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const pluginManifest = JSON.parse(await readFile(resolve(root, 'packages/plugin/package.json'), 'utf8'))
const expectedDshVersion = pluginManifest.peerDependencies['@deepseek-ai/dsh-settings']
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

const globalDsh = command('which', ['dsh'])
add(
  'dsh-global',
  globalDsh ? 'ok' : 'warning',
  globalDsh ? `Global dsh: ${globalDsh}` : 'Global dsh was not found; use pnpm dsh from a verified DSH checkout.',
  globalDsh ? `全局 dsh：${globalDsh}` : '找不到全局 dsh；请从已确认的 DSH 源码目录使用 pnpm dsh。',
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
  const manifestExists = await isFile(manifest)
  add('dsh-repo', manifestExists ? 'ok' : 'error', `DSH checkout: ${dshRepo}`, `DSH 源码目录：${dshRepo}`)
  if (manifestExists) {
    const dshManifest = JSON.parse(await readFile(manifest, 'utf8'))
    const hasDshScript = typeof dshManifest.scripts?.dsh === 'string'
    const compatibleVersion = dshManifest.version === expectedDshVersion
    add(
      'dsh-version',
      compatibleVersion ? 'ok' : 'error',
      compatibleVersion
        ? `DSH version: ${dshManifest.version}`
        : `DSH version ${String(dshManifest.version)} is incompatible; this Preview requires ${String(expectedDshVersion)}.`,
      compatibleVersion
        ? `DSH 版本：${dshManifest.version}`
        : `DSH 版本 ${String(dshManifest.version)} 不兼容；当前 Preview 要求 ${String(expectedDshVersion)}。`,
    )
    add(
      'dsh-checkout-command',
      hasDshScript ? 'ok' : 'error',
      hasDshScript ? `DSH source command: (cd ${dshRepo} && pnpm dsh)` : 'The DSH checkout has no pnpm dsh script.',
      hasDshScript ? `DSH 源码命令：(cd ${dshRepo} && pnpm dsh)` : '该 DSH 源码目录没有 pnpm dsh 脚本。',
    )
  }
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
