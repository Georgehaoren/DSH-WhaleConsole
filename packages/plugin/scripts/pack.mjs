import { spawnSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const pluginRoot = resolve(scriptDir, '..')
const destination = process.env.DSH_PACK_DESTINATION
  ? resolve(process.env.DSH_PACK_DESTINATION)
  : resolve(pluginRoot, '../../dist')

await mkdir(destination, { recursive: true })

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npm, ['pack', '--pack-destination', destination], {
  cwd: pluginRoot,
  env: {
    ...process.env,
    npm_config_cache: process.env.npm_config_cache
      ?? join(process.env.TMPDIR || tmpdir(), 'dsh-whale-console-npm-cache'),
  },
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
