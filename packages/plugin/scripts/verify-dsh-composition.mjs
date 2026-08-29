import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspaceRoot = resolve(pluginRoot, '../..')
const tsc = resolve(workspaceRoot, 'node_modules/.bin/tsc')
const dshRepo = process.env.DSH_REPO
if (!dshRepo) {
  throw new Error('Set DSH_REPO to a DeepSeek Harness 0.1.1-rc.2 checkout before running this test.')
}

const scratch = mkdtempSync(join(tmpdir(), 'dsh-whale-console-composition-'))
const dshHome = join(scratch, 'home')
let child

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      DSH_HOME: dshHome,
      npm_config_cache: process.env.npm_config_cache ?? join(scratch, 'npm-cache'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function freePort() {
  const server = createServer()
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 3190
  await new Promise(resolveClose => server.close(resolveClose))
  return port
}

async function waitFor(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      lastError = new Error(`${url} returned ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 500))
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`)
}

try {
  run(tsc, ['-p', resolve(workspaceRoot, 'packages/skins/tsconfig.build.json')], workspaceRoot)
  run('node', [resolve(pluginRoot, 'scripts/build.mjs')], pluginRoot)
  run(tsc, ['-p', resolve(pluginRoot, 'tsconfig.build.json')], workspaceRoot)
  run('npm', ['pack', '--pack-destination', scratch], pluginRoot)
  const tarball = readdirSync(scratch).find(name => name.endsWith('.tgz'))
  if (!tarball) throw new Error('Plugin tarball was not created.')

  run('pnpm', ['dsh', 'plugin', '--profile', 'web', 'add', join(scratch, tarball)], dshRepo)
  const config = run('pnpm', ['dsh', '--profile', 'web', '--dump-default-config'], dshRepo)
  if (!config.includes('id: dsh-whale-console') || !config.includes('skinId: harness-standard')) {
    throw new Error('WhaleConsole host layer is missing from the composed DSH profile.')
  }

  const port = await freePort()
  child = spawn('pnpm', ['dsh', '--profile', 'web', '--no-open', '--port', String(port)], {
    cwd: dshRepo,
    detached: true,
    env: {
      ...process.env,
      DSH_HOME: dshHome,
      CHOKIDAR_USEPOLLING: 'true',
      WATCHPACK_POLLING: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let diagnostics = ''
  child.stdout.on('data', chunk => { diagnostics += chunk.toString() })
  child.stderr.on('data', chunk => { diagnostics += chunk.toString() })

  const index = await waitFor(`http://127.0.0.1:${port}/`)
  const html = await index.text()
  if (!html.includes('/plugins/dsh-whale-console/client.js')) {
    throw new Error(`WhaleConsole client is missing from the DSH boot graph.\n${diagnostics}`)
  }
  const bundle = await waitFor(`http://127.0.0.1:${port}/plugins/dsh-whale-console/client.js`)
  const source = await bundle.text()
  if (
    !source.includes('window.__ModuleLoader__.load')
    || !source.includes('id: "dsh-whale-console"')
    || !source.includes('harness-medium')
    || !source.includes('harness-chibi')
  ) {
    throw new Error('WhaleConsole client artifact is not a lazy-CJS module-loader factory.')
  }
  process.stdout.write(`WhaleConsole composed successfully with DSH at http://127.0.0.1:${port}/\n`)
} finally {
  if (child?.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
    if (child.exitCode === null) {
      await new Promise(resolveExit => {
        const timeout = setTimeout(() => {
          try {
            process.kill(-child.pid, 'SIGKILL')
          } catch {
            child.kill('SIGKILL')
          }
        }, 5_000)
        child.once('close', () => {
          clearTimeout(timeout)
          resolveExit()
        })
      })
    }
  }
  rmSync(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
