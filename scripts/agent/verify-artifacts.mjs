import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const language = args.includes('--lang=zh-CN') ? 'zh-CN' : 'en'
const arch = args.find(value => value.startsWith('--arch='))?.slice('--arch='.length) ?? process.arch
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const version = manifest.version
const dist = resolve(root, 'dist')
const tarball = resolve(dist, `dsh-whale-console-${version}.tgz`)
const appZip = resolve(dist, `DSH-WhaleConsole-${version}-macos-${arch}.zip`)
const checksums = resolve(dist, `SHA256SUMS-${version}.txt`)
const errors = []

function text(en, zh) {
  return language === 'zh-CN' ? zh : en
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

function output(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`)
  return result.stdout
}

for (const path of [tarball, appZip, checksums]) {
  if (!(await isFile(path))) errors.push(text(`Missing artifact: ${path}`, `缺少构建产物：${path}`))
}

if (!errors.length) {
  const tarEntries = output('tar', ['-tzf', tarball])
  for (const entry of [
    'package/package.json',
    'package/lib/index.js',
    'package/lib/client.js',
    'package/README.md',
    'package/README.zh-CN.md',
    'package/AI_DISCLOSURE.md',
    'package/AI_DISCLOSURE.zh-CN.md',
    'package/ASSET_LICENSE.md',
    'package/ASSET_LICENSE.zh-CN.md',
  ]) {
    if (!tarEntries.includes(entry)) errors.push(text(`Plugin archive is missing ${entry}.`, `插件压缩包缺少 ${entry}。`))
  }

  const client = output('tar', ['-xOzf', tarball, 'package/lib/client.js'])
  for (const marker of ['window.__ModuleLoader__.load', 'harness-standard', 'harness-medium', 'harness-chibi', 'maid-standard', 'dual-standard']) {
    if (!client.includes(marker)) errors.push(text(`Plugin client is missing marker: ${marker}`, `插件客户端缺少标记：${marker}`))
  }

  const zipEntries = output('unzip', ['-Z1', appZip])
  if (!zipEntries.includes('DSH WhaleConsole.app/Contents/MacOS/dsh-whale-console-launcher')) {
    errors.push(text('macOS archive does not contain the launcher executable.', 'macOS 压缩包中缺少启动器可执行文件。'))
  }

  const checksumText = await readFile(checksums, 'utf8')
  for (const path of [tarball, appZip]) {
    const digest = createHash('sha256').update(await readFile(path)).digest('hex')
    const expected = `${digest}  ${basename(path)}`
    if (!checksumText.includes(expected)) errors.push(text(`Checksum mismatch: ${basename(path)}`, `校验值不匹配：${basename(path)}`))
  }
}

if (errors.length) {
  process.stderr.write(`${errors.map(error => `- ${error}`).join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(text(`Verified plugin, macOS archive, and checksums for ${version}.\n`, `已验证 ${version} 的插件包、macOS 压缩包与校验值。\n`))
